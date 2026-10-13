const escapeAttribute = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

export function gameLinkAttributes(game) {
  return game.playableUrl
    ? `href="${escapeAttribute(game.playableUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeAttribute(game.name)} — 새 탭에서 플레이"`
    : `href="#/game/${encodeURIComponent(game.id)}"`;
}
