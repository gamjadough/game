import { filterCatalog, recentGames, gameFromHash } from './catalog.js';
import { gameLinkAttributes as linkFor } from './game-links.js';
const view = document.querySelector('#view');
const search = document.querySelector('#search');
let games = [], category = '전체 게임', query = '';
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const statusLabel = game => game.playableUrl ? '플레이 가능' : game.type === 'desktop' && game.downloadUrl ? '다운로드 가능' : game.status === 'in-development' ? '개발 중' : '연결 준비 중';
function card(game, compact = false) {
  return `<a class="game-card ${compact ? 'compact' : ''}" ${linkFor(game)}><div class="thumbnail"><img src="${escape(game.thumbnail)}" alt="${escape(game.name)} 콘셉트 일러스트" ${compact ? 'loading="lazy"' : ''}><span class="status ${game.playableUrl ? 'ready' : ''}"><i></i>${statusLabel(game)}</span><span class="card-arrow">↗</span></div><div class="card-body"><div class="card-title"><h3>${escape(game.name)}</h3><span class="genre genre-${game.genre === '액션' ? 'action' : game.genre === '캐주얼' ? 'casual' : 'lab'}">${escape(game.genre)}</span></div><p>${escape(game.description)}</p><div class="card-bottom"><span>${game.type === 'desktop' ? '▣ 데스크톱 펫' : '◉ 웹 게임'}</span><span class="play-label">${game.playableUrl ? '새 탭에서 플레이' : game.downloadUrl ? '다운로드' : '자세히 보기'} <b>→</b></span></div></div></a>`;
}
function home() {
  search.disabled = false;
  view.innerHTML = `<section class="hero"><div class="hero-copy"><span class="eyebrow"><i></i> SMALL GAMES. BIG FUN.</span><h1>작은 게임,<br>새로운 <span>즐거움.</span></h1><p>직접 만든 게임들이 모이는 곳.<br>가벼운 클릭부터 짜릿한 전투까지, 취향대로 만나보세요.</p><a class="primary-button" href="#collection">게임 둘러보기 <span>↗</span></a><div class="hero-note"><span class="tiny-star">✦</span> 상상에서 시작해, 플레이로 완성되는 공간</div></div><div class="hero-art"><img src="./assets/hero.svg" alt="행성과 별 사이를 떠다니는 감자 캐릭터와 게임 컨트롤러"><div class="art-caption"><span>GAMZA UNIVERSE</span><span>01 — ∞</span></div></div></section>
  <section id="collection" class="collection"><div class="section-heading"><div><span class="eyebrow muted">FIND YOUR NEXT FAVORITE</span><h2>우리의 게임 컬렉션 <span>${games.length.toString().padStart(2, '0')}</span></h2></div><span class="section-note">직접 만들고, 함께 즐기는 게임</span></div><div class="filter-row"><div class="filters" role="group" aria-label="게임 카테고리">${['전체 게임', '액션', '캐주얼', '실험작'].map((name, index) => `<button data-category="${name}" aria-pressed="${category === name}" class="${category === name ? 'active' : ''}"><span>${['✦', 'ϟ', '◉', '⚗'][index]}</span> ${name}</button>`).join('')}</div><span id="result-count" class="result-count" aria-live="polite"></span></div><div id="game-grid" class="game-grid"></div></section>
  <section class="recent"><div class="section-heading"><div><span class="eyebrow muted">FRESH FROM THE STUDIO</span><h2>최근 추가된 게임 <span class="new-tag">NEW</span></h2></div><span class="section-note">새로운 재미를 발견하세요 ↗</span></div><div class="recent-grid">${recentGames(games).map(game => `<a class="recent-card" ${linkFor(game)}><img src="${escape(game.thumbnail)}" alt="" loading="lazy"><div><span>${escape(game.genre)} · ${escape(game.addedAt.replaceAll('-', '.'))}</span><h3>${escape(game.name)}</h3><p>${statusLabel(game)}</p></div><b>↗</b></a>`).join('')}</div></section>
  <aside class="studio-note"><span class="note-icon">✳</span><div><h2>다음 재미는, 아직 만드는 중.</h2><p>Gamza games는 조금씩 자라나는 개인 게임 스튜디오입니다.</p></div><a href="#/about">이 공간 알아보기 ↗</a></aside>`;
  document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => {
    category = button.dataset.category;
    document.querySelectorAll('[data-category]').forEach(item => { item.classList.toggle('active', item.dataset.category === category); item.setAttribute('aria-pressed', String(item.dataset.category === category)); });
    filterGames();
  }));
  filterGames();
}
function filterGames() {
  const grid = document.querySelector('#game-grid');
  if (!grid) return;
  const filtered = filterCatalog(games, category, query);
  grid.innerHTML = filtered.length ? filtered.map(game => card(game)).join('') : `<div class="empty-state"><span>⌕</span><h3>아직 찾는 게임이 없어요</h3><p>다른 검색어나 카테고리로 다시 찾아보세요.</p><button id="reset-filter" class="secondary-button">전체 게임 보기</button></div>`;
  document.querySelector('#result-count').textContent = `${filtered.length}개의 게임`;
  document.querySelector('#reset-filter')?.addEventListener('click', () => { category = '전체 게임'; query = ''; search.value = ''; home(); });
}
function detail(game) {
  if (!game) { view.innerHTML = '<section class="info-page"><h1>게임을 찾을 수 없습니다.</h1><a class="primary-button" href="#/">포털로 돌아가기</a></section>'; return; }
  search.disabled = true;
  view.innerHTML = `<section class="detail"><a class="back-link" href="#/">← 게임 컬렉션으로</a><div class="detail-heading"><div><span class="eyebrow muted">${escape(game.genre)} / ${game.type === 'desktop' ? 'DESKTOP PET' : 'WEB GAME'}</span><h1>${escape(game.name)}</h1></div><span class="status detail-status"><i></i>${statusLabel(game)}</span></div><div class="pending-panel"><img src="${escape(game.thumbnail)}" alt="${escape(game.name)} 콘셉트 일러스트"><div><h2>${game.playableUrl ? '새 탭에서 게임을 즐겨보세요.' : game.downloadUrl ? '나만의 작은 친구를 만나세요.' : '게임을 준비하고 있어요.'}</h2><p>${game.playableUrl ? '아래 버튼을 누르면 게임 사이트가 새 탭에서 열립니다.' : game.downloadUrl ? '아래 링크에서 데스크톱 프로젝트를 다운로드할 수 있어요.' : '실행 링크가 등록되면 이곳에서 만날 수 있어요.'}</p>${game.playableUrl ? `<a class="primary-button" ${linkFor(game)}>새 탭에서 플레이 ↗</a>` : game.downloadUrl ? `<a class="primary-button" href="${escape(game.downloadUrl)}" target="_blank" rel="noopener noreferrer">다운로드 ↗</a>` : '<span class="pending-tag">실행 파일 미등록</span>'}</div></div><div class="game-description"><h2>게임 소개</h2><p>${escape(game.description)}</p><span>썸네일은 포털용 콘셉트 일러스트입니다.</span></div><a class="back-link" href="#/">← 다른 게임 둘러보기</a></section>`;
}
function route() {
  const hash = location.hash;
  document.querySelector('#nav-about').classList.toggle('current', hash === '#/about');
  document.querySelector('#nav-games').classList.toggle('current', hash !== '#/about');
  if (hash.startsWith('#/game/')) {
    detail(gameFromHash(games, hash));
  } else if (hash === '#/about') {
    search.disabled = true;
    view.innerHTML = `<section class="info-page"><a class="back-link" href="#/">← 게임 컬렉션으로</a><span class="eyebrow">HELLO, WE ARE GAMZA</span><h1>상상을 만드는 곳.<br><em>재미를 나누는 곳.</em></h1><p>Gamza games는 직접 개발한 게임과 작은 실험을 한곳에 모으는 개인 게임 포털입니다. 클릭형 게임부터 전투 게임, 데스크톱의 작은 친구까지. 장르가 달라도 새로운 재미를 만드는 마음은 같습니다.</p><div class="about-grid"><div><span>01</span><h2>작게 시작하고</h2><p>떠오른 아이디어를 하나씩 게임으로 만듭니다.</p></div><div><span>02</span><h2>자유롭게 실험하고</h2><p>웹과 데스크톱을 넘나드는 프로젝트를 모읍니다.</p></div><div><span>03</span><h2>함께 즐깁니다</h2><p>게임 카드를 누르면 새 탭에서 바로 플레이할 수 있습니다.</p></div></div><a class="primary-button" href="#/">게임 만나보기 ↗</a></section>`;
  } else home();
  if (hash === '#collection') document.querySelector('#collection')?.scrollIntoView(); else window.scrollTo(0,0);
}
search.addEventListener('input', () => { query = search.value; filterGames(); });
document.addEventListener('keydown', event => { if (event.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName) && !search.disabled) { event.preventDefault(); search.focus(); } });
window.addEventListener('hashchange', route);
try {
  const response = await fetch(document.querySelector('meta[name="games-catalog"]').content, { cache: 'no-store' });
  if (!response.ok) throw new Error('catalog');
  games = await response.json();
  route();
} catch {
  view.innerHTML = '<section class="info-page"><h1>게임 목록을 불러오지 못했어요.</h1><p>서버 실행 상태를 확인하고 다시 시도해 주세요.</p><button class="primary-button" id="retry">다시 시도</button></section>';
  document.querySelector('#retry').addEventListener('click', () => location.reload());
}
