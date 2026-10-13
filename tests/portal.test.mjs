import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, safeUrl } from '../server.mjs';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { filterCatalog, recentGames, gameFromHash } from '../public/catalog.js';
const catalogData = JSON.parse(await readFile(new URL('../data/games.json', import.meta.url), 'utf8'));
const server = createServer();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
after(() => new Promise(resolve => server.close(resolve)));
test('catalog connects the three supplied games and preserves the desktop project', async () => {
  const response = await fetch(`${base}/api/games`);
  assert.equal(response.status, 200);
  const games = await response.json();
  assert.equal(games.length, 4);
  assert.equal(new Set(games.map(game => game.id)).size, 4);
  assert.deepEqual(games.slice(0, 3).map(game => [game.name, game.playableUrl]), [
    ['왁뿌볼 아레나', 'https://gamjadough.github.io/Wax-Ball/arena/'],
    ['왁뿌몬월드', 'https://gamjadough.github.io/wakppu-pet-world/#'],
    ['왁뿌볼 뿌수기', 'https://gamjadough.github.io/Wax-Ball/wakppuball/'],
  ]);
  assert.equal(games[3].playableUrl, null);
  assert.equal(games[3].id, 'fluff');
  for (const game of games) {
    assert.equal(game.downloadUrl, null);
    assert.equal('localProject' in game, false);
    const image = await fetch(`${base}${game.thumbnail}`);
    assert.equal(image.status, 200);
    assert.match(image.headers.get('content-type'), /image\/svg/);
  }
});
test('home, code and real artwork are served', async () => {
  for (const route of ['/', '/styles.css', '/app.js', '/assets/hero.svg', '/assets/logo.svg']) assert.equal((await fetch(base + route)).status, 200);
});
test('missing games and source files cannot be served', async () => {
  for (const route of ['/projects/unknown/index.html', '/data/games.json', '/server.mjs', '/..%2fdata%2fgames.json', '/%ZZ']) assert.equal((await fetch(base + route)).status, 404);
});
test('executable schemes are not accepted as launch or download URLs', () => {
  assert.equal(safeUrl('javascript:alert(1)'), false);
  assert.equal(safeUrl('//example.com'), false);
  assert.equal(safeUrl(null), false);
  assert.equal(safeUrl('https://example.com/game'), true);
});
test('real local entries mount independently while missing and escaping entries stay unconnected', async () => {
  const fixtureServer = createServer({ projectRoot: fileURLToPath(new URL('./fixtures/', import.meta.url)) });
  await new Promise(resolve => fixtureServer.listen(0, '127.0.0.1', resolve));
  const fixtureBase = `http://127.0.0.1:${fixtureServer.address().port}`;
  try {
    const games = await (await fetch(`${fixtureBase}/api/games`)).json();
    assert.equal(games[0].playableUrl, '/projects/local-test/index.html');
    assert.equal(games[1].playableUrl, null);
    assert.equal(games[2].playableUrl, null);
    assert.equal(games[3].playableUrl, 'https://example.com/game');
    assert.equal(games[4].playableUrl, null);
    assert.equal(games[4].downloadUrl, 'https://example.com/download');
    assert.equal(games[5].playableUrl, null);
    const entry = await fetch(fixtureBase + games[0].playableUrl);
    assert.equal(entry.status, 200);
    assert.match(await entry.text(), /테스트 전용/);
    assert.equal((await fetch(`${fixtureBase}/projects/local-test/script.js`)).status, 200);
    assert.equal((await fetch(`${fixtureBase}/projects/local-test/..%2fdata/games.json`)).status, 404);
  } finally { await new Promise(resolve => fixtureServer.close(resolve)); }
});
test('search and categories combine across name, genre and description', () => {
  assert.equal(filterCatalog(catalogData, '전체 게임', '').length, 4);
  assert.equal(filterCatalog(catalogData, '전체 게임', '  왁뿌볼 ').length, 2);
  assert.equal(filterCatalog(catalogData, '액션', '왁뿌볼')[0].id, 'wakppuball-battle');
  assert.equal(filterCatalog(catalogData, '실험작', '바탕화면')[0].id, 'fluff');
  assert.deepEqual(filterCatalog(catalogData, '전체 게임', '캐주얼').map(game => game.id), ['wakppumon-world', 'wakppuball']);
  assert.equal(filterCatalog(catalogData, '캐주얼', '전투').length, 0);
  assert.equal(filterCatalog(catalogData, '전체 게임', '없는게임').length, 0);
});
test('game routes resolve individual cards and handle malformed or missing IDs', () => {
  for (const game of catalogData) assert.equal(gameFromHash(catalogData, `#/game/${encodeURIComponent(game.id)}`), game);
  assert.equal(gameFromHash(catalogData, '#/game/unknown'), undefined);
  assert.equal(gameFromHash(catalogData, '#/game/%ZZ'), undefined);
});
test('recent games sort by date without changing original catalog order', () => {
  const data = ['2026-01-01','2026-04-01','2026-03-01','2026-02-01'].map((addedAt, id) => ({ addedAt, id }));
  assert.deepEqual(recentGames(data).map(game => game.id), [1,2,3]);
  assert.deepEqual(data.map(game => game.id), [0,1,2,3]);
});
