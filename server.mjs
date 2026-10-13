import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, stat, realpath } from 'node:fs/promises';

const root = path.dirname(fileURLToPath(import.meta.url));
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.wasm': 'application/wasm', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.ico': 'image/x-icon' };
export const safeUrl = value => typeof value === 'string' && /^https?:\/\//i.test(value);
async function catalog(projectRoot) {
  const games = JSON.parse(await readFile(path.join(projectRoot, 'data/games.json'), 'utf8'));
  return Promise.all(games.map(async game => {
    let playableUrl = null;
    if (game.type === 'web' && game.status === 'ready') {
      if (safeUrl(game.launchUrl)) playableUrl = game.launchUrl;
      else if (game.localProject?.directory && game.localProject?.entry) {
        try {
          const base = await realpath(path.resolve(projectRoot, game.localProject.directory));
          const target = await realpath(path.resolve(base, game.localProject.entry));
          if (inside(base, target) && (await stat(target)).isFile()) playableUrl = `/projects/${encodeURIComponent(game.id)}/${game.localProject.entry.split(/[\\/]/).map(encodeURIComponent).join('/')}`;
        } catch { /* A missing project is displayed as unconnected. */ }
      }
    }
    const { localProject, ...visible } = game;
    return { ...visible, playableUrl, downloadUrl: safeUrl(game.downloadUrl) ? game.downloadUrl : null };
  }));
}
const inside = (base, target) => { const relative = path.relative(base, target); return relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative); };
export function createServer({ projectRoot = root } = {}) {
  const publicRoot = path.join(projectRoot, 'public');
  return http.createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (pathname === '/api/games') {
        res.writeHead(200, { 'Content-Type': mime['.json'], 'Cache-Control': 'no-store' });
        return res.end(JSON.stringify(await catalog(projectRoot)));
      }
      let base = publicRoot, relative = pathname === '/' ? 'index.html' : pathname.slice(1);
      if (pathname.startsWith('/projects/')) {
        const [, , id, ...segments] = pathname.split('/');
        const games = JSON.parse(await readFile(path.join(projectRoot, 'data/games.json'), 'utf8'));
        const game = games.find(item => item.id === id);
        if (!game?.localProject?.directory) throw new Error('Not found');
        base = await realpath(path.resolve(projectRoot, game.localProject.directory));
        relative = segments.join('/') || game.localProject.entry || 'index.html';
      }
      const resolvedBase = await realpath(base);
      const target = await realpath(path.resolve(base, relative));
      if (!inside(resolvedBase, target) || !(await stat(target)).isFile()) throw new Error('Not found');
      res.writeHead(200, { 'Content-Type': mime[path.extname(target)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
      res.end(await readFile(target));
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('페이지 또는 파일을 찾을 수 없습니다.');
    }
  });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000);
  createServer().listen(port, '127.0.0.1', () => console.log(`Gamza games: http://localhost:${port}`));
}
