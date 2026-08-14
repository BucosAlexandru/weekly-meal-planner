/* recipe-explorer.js — Recipe Explorer MVP (progressive enhancement of /recipes/).
 *
 * ES module, lazy-loaded ONLY on the recipe-index page. Enhances the page; the
 * static cuisine cards + SEO stay in the HTML and remain the no-JS experience.
 * Filtering is pure client-side UI state — NO crawlable filter URLs.
 *
 * Reuses:
 *   • recipe-search.js  — the single tiered search (name substring + phrase-
 *     prefix ingredient/cuisine/meal) over the Phase-3A per-locale index.
 *   • recipe-ref.js     — recipeId-aware cart/favorites (legacy en fallback).
 *   • localStorage mp:plan-cart / mp:favorites — the SAME store the recipe
 *     detail pages + planner use. One selection system, not two.
 */
import { searchRecipes } from './recipe-search.js';
import { normalizeRef, dedupeRefs } from './recipe-ref.js';

const CART_KEY = 'mp:plan-cart';
const FAV_KEY = 'mp:favorites';
const CART_CAP = 14;

const cfg = document.getElementById('explorer-config');
if (cfg) init(cfg);

async function init(cfg) {
  const L = JSON.parse(cfg.getAttribute('data-i18n') || '{}');
  const appUrl = cfg.getAttribute('data-app') || '/';
  const indexUrl = cfg.getAttribute('data-index');
  const rtl = document.documentElement.dir === 'rtl';

  const root = document.getElementById('explorer');
  const staticGrid = document.querySelector('.recipe-groups-grid');
  const results = document.getElementById('explorer-results');
  const status = document.getElementById('explorer-status');
  const searchInput = document.getElementById('explorer-search');
  const fCuisine = document.getElementById('filter-cuisine');
  const fMeal = document.getElementById('filter-meal');
  const fTime = document.getElementById('filter-time');
  if (!root || !results || !searchInput) return;

  // ── lazy-load the active-locale index ────────────────────────────────────
  let index = null;
  try {
    const res = await fetch(indexUrl, { credentials: 'omit' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    index = await res.json();
  } catch (e) {
    // Index failed → keep the static cuisine browsing experience untouched.
    if (status) status.textContent = L.loadError || '';
    root.setAttribute('data-explorer-state', 'error');
    return;
  }
  root.setAttribute('data-explorer-state', 'ready');

  const byId = new Map(index.recipes.map(r => [r.id, r]));
  const enToId = new Map(index.recipes.filter(r => r.en).map(r => [r.en.toLowerCase(), r.id]));

  // populate the cuisine dropdown from the index (distinct cuisine + localized label)
  if (fCuisine) {
    const seen = new Map();
    for (const r of index.recipes) if (r.cuisine && !seen.has(r.cuisine)) seen.set(r.cuisine, r.cl || r.cuisine);
    [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1])).forEach(([id, label]) => {
      const o = document.createElement('option'); o.value = id; o.textContent = label; fCuisine.appendChild(o);
    });
  }

  // ── selection state (shared store, recipeId-aware) ───────────────────────
  const read = k => { try { const v = JSON.parse(localStorage.getItem(k)); return Array.isArray(v) ? v : []; } catch { return []; } };
  const write = (k, arr) => { try { arr.length ? localStorage.setItem(k, JSON.stringify(arr)) : localStorage.removeItem(k); } catch {} };
  const refId = ref => { const n = normalizeRef(ref); if (!n) return null; return n.recipeId != null ? n.recipeId : (n.en ? enToId.get(n.en.toLowerCase()) ?? null : null); };
  const idSet = k => new Set(read(k).map(refId).filter(x => x != null));
  const makeRefFor = r => ({ recipeId: r.id, en: r.en, display: r.name });

  function toggleCart(r) {
    const items = dedupeRefs(read(CART_KEY));
    const at = items.findIndex(x => refId(x) === r.id);
    if (at >= 0) items.splice(at, 1);
    else { if (items.length >= CART_CAP) return 'full'; items.push(makeRefFor(r)); }
    write(CART_KEY, items);
    renderCart();
    return at >= 0 ? 'removed' : 'added';
  }
  function toggleFav(r) {
    const items = dedupeRefs(read(FAV_KEY));
    const at = items.findIndex(x => refId(x) === r.id);
    if (at >= 0) items.splice(at, 1); else items.push(makeRefFor(r));
    write(FAV_KEY, items);
  }

  // ── result card ──────────────────────────────────────────────────────────
  const TAGL = L.tags || {};
  function card(r, inCart, isFav) {
    const el = document.createElement('article');
    el.className = 'ex-card';
    el.setAttribute('data-id', r.id);
    const tagBits = (r.tags || []).slice(0, 2).map(t => `<span class="ex-tag">${esc(TAGL[t] || t)}</span>`).join('');
    const timeBit = r.time != null ? `<span class="ex-time">⏱ ${fmtTime(r.time, L)}</span>` : '';
    const imgHtml = r.img
      ? `<img src="${esc(r.img)}" alt="" loading="lazy" decoding="async" onerror="this.closest('.ex-card-media').classList.add('ex-noimg');this.remove();">`
      : '';
    el.innerHTML =
      `<a class="ex-card-media${r.img ? '' : ' ex-noimg'}" href="${esc(r.url)}" aria-label="${esc(r.name)}">${imgHtml}<span class="ex-card-fallback" aria-hidden="true">🍽️</span></a>
       <div class="ex-card-body">
         <a class="ex-card-title" href="${esc(r.url)}">${esc(r.name)}</a>
         <p class="ex-card-meta"><span class="ex-cuisine">${esc(r.cl || '')}</span>${timeBit}</p>
         <div class="ex-card-tags">${tagBits}</div>
         <div class="ex-card-actions">
           <button type="button" class="ex-fav" aria-pressed="${isFav}" title="${esc(isFav ? L.favorited : L.favorite)}" aria-label="${esc(isFav ? L.favorited : L.favorite)}">${isFav ? '♥' : '♡'}</button>
           <button type="button" class="ex-add${inCart ? ' ex-add-in' : ''}" aria-pressed="${inCart}">${inCart ? esc(L.inPlan) : esc(L.addToPlan)}</button>
         </div>
       </div>`;
    el.querySelector('.ex-fav').addEventListener('click', () => {
      toggleFav(r);
      const on = idSet(FAV_KEY).has(r.id);
      const b = el.querySelector('.ex-fav');
      b.textContent = on ? '♥' : '♡'; b.setAttribute('aria-pressed', String(on));
      const lbl = on ? L.favorited : L.favorite; b.setAttribute('aria-label', lbl); b.title = lbl;
    });
    el.querySelector('.ex-add').addEventListener('click', () => {
      const res = toggleCart(r);
      if (res === 'full') { bounceCart(); return; }
      const on = res === 'added';
      const b = el.querySelector('.ex-add');
      b.classList.toggle('ex-add-in', on); b.setAttribute('aria-pressed', String(on));
      b.textContent = on ? L.inPlan : L.addToPlan;
    });
    return el;
  }

  // ── render + mode switching ──────────────────────────────────────────────
  function currentFilters() {
    const opts = {};
    if (fCuisine && fCuisine.value) opts.cuisine = fCuisine.value;
    if (fMeal && fMeal.value) opts.meal = fMeal.value;
    if (fTime && fTime.value) { const [lo, hi] = fTime.value.split('-').map(Number); opts._lo = lo; opts._hi = hi; if (hi) opts.maxTime = hi; }
    return opts;
  }
  function isActive() {
    return (searchInput.value.trim() !== '') || (fCuisine && fCuisine.value) || (fMeal && fMeal.value) || (fTime && fTime.value);
  }
  function apply() {
    if (!isActive()) { // idle → static cuisine discovery
      root.setAttribute('data-explorer-state', 'idle');
      results.innerHTML = ''; if (status) status.textContent = '';
      if (staticGrid) staticGrid.hidden = false;
      return;
    }
    root.setAttribute('data-explorer-state', 'active');
    if (staticGrid) staticGrid.hidden = true;

    const opts = currentFilters();
    let hits = searchRecipes(index, searchInput.value.trim(), { cuisine: opts.cuisine, meal: opts.meal, maxTime: opts.maxTime, limit: 240 });
    if (opts._lo != null) hits = hits.filter(e => e.time != null && e.time >= opts._lo && (opts._hi ? e.time <= opts._hi : true));

    const inCart = idSet(CART_KEY), favs = idSet(FAV_KEY);
    results.innerHTML = '';
    if (!hits.length) {
      results.innerHTML = `<p class="ex-empty">${esc(L.noResults)}</p>`;
    } else {
      const frag = document.createDocumentFragment();
      for (const r of hits) frag.appendChild(card(r, inCart.has(r.id), favs.has(r.id)));
      results.appendChild(frag);
    }
    if (status) status.textContent = (L.resultsCount || '{n}').replace('{n}', hits.length);
  }

  // ── floating cart badge + panel (reads the shared mp:plan-cart) ──────────
  let badge, panel, panelOpen = false;
  function ensureCart() {
    if (badge) return;
    badge = document.createElement('button');
    badge.type = 'button'; badge.id = 'pw-cart-badge'; badge.className = 'pw-cart-badge';
    badge.setAttribute('aria-controls', 'pw-cart-panel'); badge.setAttribute('aria-expanded', 'false');
    panel = document.createElement('div'); panel.id = 'pw-cart-panel'; panel.className = 'pw-cart-panel';
    panel.setAttribute('aria-label', L.yourRecipes || '');
    badge.addEventListener('click', e => { e.stopPropagation(); panelOpen = !panelOpen; panel.classList.toggle('pw-cart-open', panelOpen); badge.setAttribute('aria-expanded', String(panelOpen)); });
    panel.addEventListener('click', e => e.stopPropagation());
    document.addEventListener('click', () => { if (panelOpen) { panelOpen = false; panel.classList.remove('pw-cart-open'); badge.setAttribute('aria-expanded', 'false'); } });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && panelOpen) { panelOpen = false; panel.classList.remove('pw-cart-open'); badge.setAttribute('aria-expanded', 'false'); badge.focus(); } });
    document.body.appendChild(panel); document.body.appendChild(badge);
  }
  function bounceCart() { if (!badge) return; badge.classList.remove('pw-cart-bounce'); void badge.offsetWidth; badge.classList.add('pw-cart-bounce'); }
  function renderCart() {
    const ids = [...idSet(CART_KEY)];
    if (!ids.length) { if (badge) { badge.remove(); panel.remove(); badge = panel = null; } syncCards(); return; }
    ensureCart();
    badge.textContent = '🥗 ' + ids.length;
    badge.setAttribute('aria-label', (L.yourRecipes || '') + ' (' + ids.length + ')');
    panel.textContent = '';
    const title = document.createElement('p'); title.className = 'pw-cart-title'; title.textContent = L.yourRecipes || ''; panel.appendChild(title);
    const ul = document.createElement('ul'); ul.className = 'pw-cart-list';
    for (const id of ids) {
      const r = byId.get(id); if (!r) continue;
      const li = document.createElement('li');
      const nm = document.createElement('span'); nm.className = 'pw-cart-item-name'; nm.textContent = r.name;
      const rm = document.createElement('button'); rm.type = 'button'; rm.className = 'pw-cart-remove'; rm.textContent = '✕';
      rm.setAttribute('aria-label', '✕ ' + r.name);
      rm.addEventListener('click', () => { toggleCart(r); });
      li.appendChild(nm); li.appendChild(rm); ul.appendChild(li);
    }
    panel.appendChild(ul);
    const cta = document.createElement('a'); cta.className = 'pw-cart-cta'; cta.href = appUrl;
    cta.textContent = (L.buildPlan || 'Build plan') + ' (' + ids.length + ') ' + (rtl ? '←' : '→');
    panel.appendChild(cta);
    bounceCart(); syncCards();
  }
  // keep visible result cards' add/fav state in sync after cart/panel edits
  function syncCards() {
    const inCart = idSet(CART_KEY), favs = idSet(FAV_KEY);
    results.querySelectorAll('.ex-card').forEach(el => {
      const id = Number(el.getAttribute('data-id'));
      const add = el.querySelector('.ex-add'); const on = inCart.has(id);
      add.classList.toggle('ex-add-in', on); add.setAttribute('aria-pressed', String(on)); add.textContent = on ? L.inPlan : L.addToPlan;
      const fav = el.querySelector('.ex-fav'); const fo = favs.has(id);
      fav.textContent = fo ? '♥' : '♡'; fav.setAttribute('aria-pressed', String(fo));
    });
  }

  // ── wire events ──────────────────────────────────────────────────────────
  let t;
  searchInput.addEventListener('input', () => { clearTimeout(t); t = setTimeout(apply, 120); });
  [fCuisine, fMeal, fTime].forEach(el => el && el.addEventListener('change', apply));
  const clearBtn = document.getElementById('explorer-clear');
  if (clearBtn) clearBtn.addEventListener('click', () => { searchInput.value = ''; [fCuisine, fMeal, fTime].forEach(el => el && (el.value = '')); apply(); searchInput.focus(); });

  renderCart();   // badge reflects any pre-existing selection immediately
  apply();        // idle on load
}

// ── helpers ──────────────────────────────────────────────────────────────────
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function fmtTime(n, L) {
  if (n < 60) return `${n} ${L.min || 'min'}`;
  const h = Math.floor(n / 60), m = n % 60;
  return m ? `${h}${L.h || 'h'} ${m}` : `${h}${L.h || 'h'}`;
}
