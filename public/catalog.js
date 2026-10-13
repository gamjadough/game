export function filterCatalog(games, category, query) {
  const normalized = query.trim().toLocaleLowerCase('ko');
  return games.filter(game => (category === '전체 게임' || game.genre === category) && `${game.name} ${game.description} ${game.genre}`.toLocaleLowerCase('ko').includes(normalized));
}
export function recentGames(games) {
  return [...games].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, 3);
}
export function gameFromHash(games, hash) {
  if (!hash.startsWith('#/game/')) return undefined;
  try { return games.find(game => game.id === decodeURIComponent(hash.slice('#/game/'.length))); } catch { return undefined; }
}
