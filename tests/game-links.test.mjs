import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gameLinkAttributes } from '../public/game-links.js';
import { readFile } from 'node:fs/promises';

test('every connected game opens its configured destination in a separate tab', async () => {
  const games = JSON.parse(await readFile(new URL('../data/games.json', import.meta.url), 'utf8'));
  for (const game of games.filter(game => game.type === 'web' && game.status === 'ready')) {
    const attributes = gameLinkAttributes({ ...game, playableUrl: game.launchUrl });
    assert.ok(attributes.includes(`href="${game.launchUrl}"`));
    assert.ok(attributes.includes('target="_blank"'));
    assert.ok(attributes.includes('rel="noopener noreferrer"'));
  }
});
test('unconnected desktop projects retain their portal information page', () => {
  assert.equal(gameLinkAttributes({ id: 'fluff', name: '털뭉치', playableUrl: null }), 'href="#/game/fluff"');
});
test('link data cannot break out of HTML attributes', () => {
  const attributes = gameLinkAttributes({ id:'test', name:'"<게임>', playableUrl:'https://example.com/?a="&b=1' });
  assert.ok(attributes.includes('href="https://example.com/?a=&quot;&amp;b=1"'));
  assert.ok(attributes.includes('aria-label="&quot;&lt;게임&gt; — 새 탭에서 플레이"'));
});
