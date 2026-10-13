import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cp, mkdir, readFile, writeFile, rm, stat } from 'node:fs/promises';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.resolve(root, 'dist');
if (path.dirname(output) !== path.resolve(root) || path.basename(output) !== 'dist') throw new Error('Unexpected build directory');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(root, 'public'), output, { recursive: true });
const source = JSON.parse(await readFile(path.join(root, 'data/games.json'), 'utf8'));
const publicUrl = value => {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !['localhost', '127.0.0.1', '[::1]', '0.0.0.0'].includes(url.hostname) ? url.href : null;
  } catch { return null; }
};
const games = await Promise.all(source.map(async game => {
  const thumbnail = game.thumbnail.replace(/^\//, '');
  const image = path.resolve(root, 'public', thumbnail);
  const relative = path.relative(path.join(root, 'public'), image);
  if (relative.startsWith('..') || path.isAbsolute(relative) || !(await stat(image)).isFile()) throw new Error(`Missing thumbnail: ${game.id}`);
  const { localProject, launchUrl, ...data } = game;
  return { ...data, thumbnail: `./${thumbnail}`, playableUrl: game.type === 'web' && game.status === 'ready' ? publicUrl(launchUrl) : null, downloadUrl: publicUrl(game.downloadUrl) };
}));
await writeFile(path.join(output, 'games.json'), JSON.stringify(games, null, 2) + '\n');
const index = await readFile(path.join(output, 'index.html'), 'utf8');
await writeFile(path.join(output, 'index.html'), index.replace('content="/api/games"', 'content="./games.json"'));
await writeFile(path.join(output, '.nojekyll'), '');
console.log(`GitHub Pages build ready: ${output}`);
