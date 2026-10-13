import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
execFileSync(process.execPath, ['scripts/build-pages.mjs'], { cwd: root });
test('Pages build loads a static catalog with repository-relative assets', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  assert.match(html, /name="games-catalog" content="\.\/games.json"/);
  assert.doesNotMatch(html, /(?:src|href)="\/(?:assets|app|styles)/);
  const app = await readFile(new URL('../dist/app.js', import.meta.url), 'utf8');
  assert.doesNotMatch(app, /src="\/assets\//);
  const games = JSON.parse(await readFile(new URL('../dist/games.json', import.meta.url), 'utf8'));
  const source = JSON.parse(await readFile(new URL('../data/games.json', import.meta.url), 'utf8'));
  assert.equal(games.length, source.length);
  for (const game of games) {
    assert.equal('localProject' in game, false);
    assert.equal('launchUrl' in game, false);
    const original = source.find(item => item.id === game.id);
    assert.equal(game.playableUrl, original.type === 'web' && original.status === 'ready' ? original.launchUrl : null);
    assert.ok((await stat(new URL(`../dist/${game.thumbnail}`, import.meta.url))).isFile());
  }
});
