// ===== Imports (TOATE sus)
// NOTE: the main recipe corpus (recipes.js, ~10 MB / ~2.5 MB brotli) is NOT
// statically imported. It is lazy-loaded on first interaction via
// ensureMainRecipes() below, to keep the initial planner payload small.
import { recipesMeta, TAG_LABELS, READY_IN } from './recipes-meta.js';
import { i18n, langNames, seoParagraphs, pdfMessages, MOTIV, access } from './i18n.js';
import { buildShoppingFromRawIngredients, parseIngredient } from './shopping-list.js';
import { PLAN_MEALS } from './plan-meals.generated.js';

// ===== Live counts (single source of truth for discovery/FAQ/stats copy)
// Round recipes down to the nearest 25 so the "X+" marketing copy stays
// stable across small additions (204 → "200+"). Plans count must match the
// PLANS array in scripts/generate-content.mjs — update both together.
// Hard-coded (not derived from recipesMain.length) because the corpus is now
// lazy-loaded and empty at module init. Round down to nearest 25; bump when
// the recipes.js count crosses a 25-boundary (currently 216 → 200).
const RECIPE_COUNT_ROUND = 200;
const PLAN_COUNT = 11;
// Exact catalogue size for copy that must state the precise number (premium
// preview cards, homepage FAQ, premium feature list). Single source of truth,
// mirrors RECIPE_COUNT in scripts/generate-content.mjs (recipes.js length).
// The corpus is lazy-loaded so it can't be read synchronously at module init —
// bump this one line when the count crosses (same convention as PLAN_COUNT).
// The "X+" hero/discovery copy keeps using RECIPE_COUNT_ROUND and is untouched.
const RECIPE_COUNT = 225;
const fillRecipeCount = (s) => String(s).replace(/\{\{RECIPE_COUNT\}\}/g, String(RECIPE_COUNT));

// ===== Lazy-load budget recipes (not bundled → saves ~1.7 MB initial load) ===
let recipesBudget = [];
let _budgetLoadPromise = null;
async function ensureBudgetRecipes() {
  if (recipesBudget.length > 0) return;
  if (_budgetLoadPromise) return _budgetLoadPromise;
  _budgetLoadPromise = import('./recipes-budget.js').then(mod => {
    recipesBudget = mod.recipes || mod.default || [];
    // Auto-assign metadata for budget recipes
    recipesBudget.forEach((r, idx) => {
      if (!r.time) r.time = Math.max(20, Math.min(40, (r.ingredients?.ro?.length || 5) * 4));
      if (!r.costRon) r.costRon = 12;
      if (!r.tags) r.tags = ['budget'];
      else if (!r.tags.includes('budget')) r.tags.push('budget');
    });
    window.recipesBudget = recipesBudget;
    window.recipes = [...recipesMain, ...recipesBudget];
  }).catch(err => console.error('Budget recipes load failed:', err));
  return _budgetLoadPromise;
}

// ===== Main recipe corpus — lazy-loaded (deferred off initial page load) =====
// recipes.js is ~10 MB of multilingual content (~2.5 MB brotli). The planner
// renders nothing until the user interacts, so the corpus is dynamic-imported
// on first interaction / first generate (see ensureMainRecipes) rather than at
// module-eval time. Per-recipe metadata is applied once, right after it loads.
let recipesMain = [];
let _mainLoadPromise = null;
async function ensureMainRecipes() {
  if (recipesMain.length > 0) return;
  if (_mainLoadPromise) return _mainLoadPromise;
  _mainLoadPromise = import('./recipes.js').then(mod => {
    recipesMain = mod.recipes || mod.default || [];
    recipesMain.forEach(r => {
      const meta = recipesMeta[r.id];
      if (!meta) return;
      r.time    = meta.time;
      r.costRon = meta.costRon;
      r.tags    = meta.tags || [];
      if (meta.desc) r.desc = meta.desc;
    });
    window.recipesMain = recipesMain;
    window.recipes = [...recipesMain, ...recipesBudget];
  }).catch(err => console.error('Main recipes load failed:', err));
  return _mainLoadPromise;
}

// Warm the corpus on the user's first interaction so it's ready by the time a
// plan is generated — without blocking the initial page load.
['pointerdown', 'keydown', 'touchstart'].forEach(evt =>
  window.addEventListener(evt, () => { ensureMainRecipes(); }, { once: true, passive: true }));

// ===== Global / debug =========================================================
window.isBudgetMenu = window.isBudgetMenu ?? false;
window.recipesMain  = recipesMain;   // [] until ensureMainRecipes() resolves
window.recipesBudget = recipesBudget;
window.recipes = [];                 // populated after the lazy corpus load

// helper
function isBudgetMenuEnabled() {
  const cb = document.getElementById('budget-menu-toggle');
  return !!(cb && cb.checked);
}

// ===== Safe translation helper — never render "undefined" or null in UI
function safeText(value, fallback = '') {
  if (value === undefined || value === null || value === 'undefined') return fallback;
  return String(value);
}

// ===== Helpers mici
function extractRecipeName(text) {
  if (!text) return '';
  return text.split('(')[0]
    .replace(/(este o rețetă|es una receta|is a traditional|est une recette|ist ein traditionelles|é uma receita|является традиционным|هي وصفة تقليدية|は伝統的な料理|は伝統料理です)[^.]*\.*$/, '')
    .trim();
}
// Match a recipe by extracted name. A few recipes have parens in their canonical
// name (e.g. "Butter Chicken (Murgh Makhani)"); strip them when comparing so the
// lookup still finds the meta/badges row.
function recipeNameMatches(r, lang, extractedName) {
  if (!r?.name) return false;
  const candidates = [r.name[lang], r.name.en, r.name.ro];
  for (const n of candidates) {
    if (!n) continue;
    const low = n.toLowerCase();
    if (low === extractedName) return true;
    const stripped = low.split('(')[0].trim();
    if (stripped && stripped === extractedName) return true;
  }
  return false;
}
function pickMotiv(langCode) {
  const arr = MOTIV[langCode] || MOTIV.ro;
  return arr[Math.floor(Math.random() * arr.length)];
}
// --- A11Y: aria-label pentru butoanele de dictare ---
(function () {
  function addDictationAriaLabels(root = document) {
    const headerCells = root.querySelectorAll('table thead th');
    const mealLabels = [
      headerCells[1]?.textContent.trim() || 'Lunch',
      headerCells[2]?.textContent.trim() || 'Dinner'
    ];
    root.querySelectorAll('button[onclick^="startDictation"]').forEach((btn) => {
      if (btn.hasAttribute('aria-label')) return;
      // Încearcă să derivezi ziua/coloana din tabel
      const td = btn.closest('td');
      const row = btn.closest('tr');
      const dayCell = row?.querySelector('th, td');
      const dayText = dayCell ? dayCell.textContent.trim() : '';
      // Indicele mesei (col 1 = lunch, col 2 = dinner)
      let mealIndex = 0;
      if (td && typeof td.cellIndex === 'number') {
        mealIndex = Math.max(0, td.cellIndex - 1);
      }
      const mealText = mealLabels[mealIndex] || '';
      // Eticheta accesibilă (localizată indirect din antet + zi)
      const label = (mealText && dayText) ? `${mealText} — ${dayText}` : 'Voice input';
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
      // Ascunde emoji-ul de la screen reader, păstrând un text vizibil doar pentru SR
      if (!btn.querySelector('.visually-hidden')) {
        const sr = document.createElement('span');
        sr.className = 'visually-hidden';
        sr.textContent = label;
        btn.appendChild(sr);
        const icon = btn.querySelector('i.bi');
        if (icon && !icon.hasAttribute('aria-hidden')) {
          icon.setAttribute('aria-hidden', 'true');
        }
      }
      // Dacă butonul are doar emoji, marchează-l aria-hidden
      btn.querySelectorAll('*').forEach((n) => {
        if (n.textContent && n.textContent.trim() === '🎤') n.setAttribute('aria-hidden', 'true');
      });
    });
  }
  // Rulează după ce se construiește planul
  document.addEventListener('DOMContentLoaded', () => {
    addDictationAriaLabels(document);
    // Dacă planul e re-rendat după acțiuni (schimbare limbă, meniu aleator etc.), prinde modificările
    const target = document.getElementById('pdf-content') || document.body;
    const mo = new MutationObserver(() => addDictationAriaLabels(document));
    mo.observe(target, { childList: true, subtree: true });
  });

  // ── Auto-expand collapsible shopping list for browser print / Save-as-PDF ──
  // Screen UX keeps the list collapsed by default to reduce scroll length,
  // but any export path (Ctrl+P, browser PDF) must include the full data.
  // The dedicated #pdf-list flow is unaffected — it builds from data, not DOM.
  const _collapsibleOpenState = new WeakMap();
  window.addEventListener('beforeprint', () => {
    document.querySelectorAll('details.shopping-collapsible').forEach(d => {
      _collapsibleOpenState.set(d, d.open);
      d.open = true;
    });
  });
  window.addEventListener('afterprint', () => {
    document.querySelectorAll('details.shopping-collapsible').forEach(d => {
      if (_collapsibleOpenState.has(d)) d.open = _collapsibleOpenState.get(d);
    });
  });
})();
// ===== Limba globală
// --- Detect limbă din URL (ex: /ro/, /en/, /tr/, /it/, /ko/). Are prioritate peste localStorage.
function getLangFromPath() {
  const seg = (window.location.pathname || '/').split('/').filter(Boolean)[0];
  return (seg && i18n[seg]) ? seg : null;
}
const pathLang = getLangFromPath();
let lang = pathLang || localStorage.getItem('lastLang') || navigator.language.slice(0, 2);
// fallback final
if (!i18n[lang]) lang = 'ro';
// dacă URL-ul impune limba, sincronizăm și localStorage
if (pathLang) localStorage.setItem('lastLang', lang);
// let lang = localStorage.getItem('lastLang') || navigator.language.slice(0, 2);
// if (!i18n[lang]) lang = 'ro';
// ===== Content nav links (dynamic per language) =================================
const NAV_CONTENT_LINKS = {
  ro: { plans: { href: '/ro/meniu-saptamanal/', label: '📅 Meniuri' },      recipes: { href: '/ro/retete/',               label: '🍽️ Rețete' } },
  en: { plans: { href: '/en/weekly-meal-plan/', label: '📅 Meal Plans' },   recipes: { href: '/en/recipes/',              label: '🍽️ Recipes' } },
  es: { plans: { href: '/es/plan-semanal/',      label: '📅 Menús' },        recipes: { href: '/es/recetas/',              label: '🍽️ Recetas' } },
  fr: { plans: { href: '/fr/plan-semaine/',      label: '📅 Menus' },        recipes: { href: '/fr/recettes/',             label: '🍽️ Recettes' } },
  de: { plans: { href: '/de/wochenplan/',        label: '📅 Menüs' },        recipes: { href: '/de/rezepte/',              label: '🍽️ Rezepte' } },
  pt: { plans: { href: '/pt/plano-semanal/',     label: '📅 Cardápios' },    recipes: { href: '/pt/receitas/',             label: '🍽️ Receitas' } },
  ru: { plans: { href: '/ru/nedelnoe-menyu/',    label: '📅 Меню' },         recipes: { href: '/ru/retsepty/',             label: '🍽️ Рецепты' } },
  ar: { plans: { href: '/ar/khitat-usbuiya/',   label: '📅 القوائم' },      recipes: { href: '/ar/wasafat/',              label: '🍽️ وصفات' } },
  zh: { plans: { href: '/zh/zhoujicaidan/',      label: '📅 菜单' },          recipes: { href: '/zh/shipu/',                label: '🍽️ 食谱' } },
  ja: { plans: { href: '/ja/weekly-menu/',       label: '📅 メニュー' },      recipes: { href: '/ja/reshipi/',              label: '🍽️ レシピ' } },
  tr: { plans: { href: '/tr/haftalik-menu/',     label: '📅 Menüler' },      recipes: { href: '/tr/tarifler/',             label: '🍽️ Tarifler' } },
  it: { plans: { href: '/it/piano-settimanale/', label: '📅 Menù' },         recipes: { href: '/it/ricette/',              label: '🍽️ Ricette' } },
  ko: { plans: { href: '/ko/jugan-menu/',        label: '📅 메뉴' },          recipes: { href: '/ko/recipes/',              label: '🍽️ 레시피' } },
  hi: { plans: { href: '/hi/weekly-plan/',       label: '📅 मेनू' },         recipes: { href: '/hi/recipes/',              label: '🍽️ व्यंजन' } },
};
// Localized "See Premium →" link shown as a third CTA in the hero (Phase 4).
// Hidden when window.hasUnlimited (paying user, no upsell needed).
const HERO_PREMIUM_LINK = {
  ro: 'Vezi Premium →',      en: 'See Premium →',         es: 'Ver Premium →',
  fr: 'Voir Premium →',      de: 'Premium ansehen →',     pt: 'Ver Premium →',
  ru: 'Посмотреть Премиум →', it: 'Vedi Premium →',        tr: "Premium'a bak →",
  ar: 'شاهد بريميوم →',      zh: '查看高级版 →',           ja: 'プレミアムを見る →',
  ko: '프리미엄 보기 →',      hi: 'प्रीमियम देखें →',
};

const NAV_PRICING_LINKS = {
  ro:'/ro/premium/', en:'/en/pricing/', es:'/es/precios/', fr:'/fr/tarifs/',
  de:'/de/preise/', pt:'/pt/precos/', ru:'/ru/tseny/', ar:'/ar/asaar/',
  zh:'/zh/jiage/', ja:'/ja/pricing/', hi:'/hi/pricing/', tr:'/tr/fiyatlar/',
  it:'/it/prezzi/', ko:'/ko/pricing/'
};
// Nav labels for the Premium link — localized in both states. The default
// "⭐ Premium" surface gets swapped to "✅ Active" with a gold-gradient
// pill when window.hasUnlimited is true so paying users see they're in.
const NAV_PREMIUM_LABEL = {
  ro: '⭐ Premium',  en: '⭐ Premium',  es: '⭐ Premium',  fr: '⭐ Premium',
  de: '⭐ Premium',  pt: '⭐ Premium',  ru: '⭐ Премиум',  it: '⭐ Premium',
  tr: '⭐ Premium',  ar: '⭐ بريميوم',  zh: '⭐ 高级版',    ja: '⭐ プレミアム',
  ko: '⭐ 프리미엄',  hi: '⭐ प्रीमियम',
};
const NAV_ACTIVE_PREMIUM_LABEL = {
  ro: '✅ Activ',    en: '✅ Active',   es: '✅ Activo',   fr: '✅ Actif',
  de: '✅ Aktiv',    pt: '✅ Ativo',    ru: '✅ Активно',  it: '✅ Attivo',
  tr: '✅ Aktif',    ar: '✅ مفعّل',     zh: '✅ 已激活',    ja: '✅ 有効',
  ko: '✅ 활성',     hi: '✅ सक्रिय',
};
function updateContentNav(currentLang) {
  const navPlans   = document.getElementById('nav-plans');
  const navRecipes = document.getElementById('nav-recipes');
  const navPricing = document.getElementById('nav-pricing');
  if (navPlans && navRecipes) {
    const cfg = NAV_CONTENT_LINKS[currentLang] || NAV_CONTENT_LINKS.ro;
    navPlans.href        = cfg.plans.href;
    navPlans.textContent = cfg.plans.label;
    navRecipes.href        = cfg.recipes.href;
    navRecipes.textContent = cfg.recipes.label;
  }
  if (navPricing) {
    navPricing.href = NAV_PRICING_LINKS[currentLang] || '/pricing/';
    if (window.hasUnlimited) {
      navPricing.textContent = NAV_ACTIVE_PREMIUM_LABEL[currentLang] || NAV_ACTIVE_PREMIUM_LABEL.en;
      navPricing.classList.add('nav-link--active-premium');
    } else {
      navPricing.textContent = NAV_PREMIUM_LABEL[currentLang] || NAV_PREMIUM_LABEL.en;
      navPricing.classList.remove('nav-link--active-premium');
    }
  }
}

// ===== Quota PDF
let pdfCount = +localStorage.getItem('pdfCount') || 0;
let pdfFirst = +localStorage.getItem('pdfFirst') || 0;
function resetPdfQuotaIfNeeded() {
  const now = Date.now();
  if (!pdfFirst || (now - pdfFirst > 86400000)) {
    pdfCount = 0;
    pdfFirst = now;
    localStorage.setItem('pdfCount', pdfCount);
    localStorage.setItem('pdfFirst', pdfFirst);
  }
}
function parseExpiryToMs(expires_at) {
  if (expires_at === null || expires_at === undefined || expires_at === '') return null;
  const s = String(expires_at).trim();
  if (/^\d+$/.test(s)) {
    const n = Number(s);
    return n < 1e12 ? n * 1000 : n;
  }
  const t = Date.parse(s);
  return isNaN(t) ? null : t;
}
// ===== Toate după ce DOM-ul e gata
document.addEventListener('DOMContentLoaded', () => {
  // --- Elemente din DOM (vizibile doar aici)
  const buyBtn       = document.getElementById('pay-btn');
  const statusEl     = document.getElementById('payment-status');
  const langSwitcher = document.getElementById('lang-switcher');
  const resultDiv    = document.getElementById('result');
  const currencySelUI = document.getElementById('currency-select');
  // ---------- PLAN MODE: 'meal' | 'day' | 'week' ----------
  window._planMode = window._planMode || 'week';

  function t(key) {
    return (i18n[lang] && i18n[lang][key]) || (i18n['en'] && i18n['en'][key]) || key;
  }

  // ---------- FUNCȚII UI / LOGIC ----------
  function renderTable() {
    const tbody = document.getElementById('plan-table');
    if (!tbody) return;
    tbody.innerHTML = '';

    const mode = window._planMode;

    // Planner redesign (Day 1): week mode renders day cards into a JS-created
    // #plan-cards container and hides the legacy .table-wrap; 'meal' and 'day'
    // modes keep the table untouched. Static HTML is never edited — all 14
    // language homepages share the same table skeleton.
    const tableWrap = tbody.closest('.table-wrap');
    if (mode === 'week') {
      if (tableWrap) tableWrap.classList.add('pw-hidden');
    } else {
      if (tableWrap) tableWrap.classList.remove('pw-hidden');
      const cardsEl = document.getElementById('plan-cards');
      if (cardsEl) { cardsEl.innerHTML = ''; cardsEl.classList.add('pw-hidden'); }
    }

    // Update table column headers
    const thead = tbody.closest('table')?.querySelector('thead tr');
    if (thead) {
      if (mode === 'meal') {
        thead.innerHTML = `<th>${t('today')}</th><th>${t('mode.col.meal')}</th>`;
      } else if (mode === 'day') {
        thead.innerHTML = `<th>${t('today')}</th><th>${t('col.lunch') || 'Prânz'}</th><th>${t('col.dinner') || 'Cină'}</th>`;
      } else {
        thead.innerHTML = `<th data-i18n="col.day">${t('col.day') || 'Ziua'}</th><th data-i18n="col.lunch">${t('col.lunch') || 'Prânz'}</th><th data-i18n="col.dinner">${t('col.dinner') || 'Cină'}</th>`;
      }
    }

    // Update section heading
    const heading = document.getElementById('planner-heading');
    if (heading) {
      heading.textContent = t(`mode.heading.${mode}`);
    }

    if (mode === 'meal') {
      // Single row, single meal input
      tbody.insertAdjacentHTML('beforeend', `
        <tr class="planner-row">
          <td><strong>${t('today')}</strong></td>
          <td>
            <div class="input-group input-group-sm">
              <input id="d1l" class="form-control" placeholder="${t('placeholderL')}">
              <button type="button" class="btn btn-outline-secondary" onclick="startDictation('d1l')">
                <i class="bi bi-mic-fill" aria-hidden="true"></i>
              </button>
            </div>
          </td>
        </tr>
      `);
    } else if (mode === 'day') {
      // Single row, lunch + dinner
      tbody.insertAdjacentHTML('beforeend', `
        <tr class="planner-row">
          <td><strong>${t('today')}</strong></td>
          <td>
            <div class="input-group input-group-sm">
              <input id="d1l" class="form-control" placeholder="${t('placeholderL')}">
              <button type="button" class="btn btn-outline-secondary" onclick="startDictation('d1l')">
                <i class="bi bi-mic-fill" aria-hidden="true"></i>
              </button>
            </div>
          </td>
          <td>
            <div class="input-group input-group-sm">
              <input id="d1c" class="form-control" placeholder="${t('placeholderD')}">
              <button type="button" class="btn btn-outline-secondary" onclick="startDictation('d1c')">
                <i class="bi bi-mic-fill" aria-hidden="true"></i>
              </button>
            </div>
          </td>
        </tr>
      `);
    } else {
      // Week mode — 7 day cards + Week Overview strip (replaces the table)
      renderWeekCards();
    }
  }

  // ── Week-mode day cards + Week Overview (planner redesign, Day 1) ──────────
  // Cards render into a JS-created #plan-cards inserted right after .table-wrap.
  // Inputs keep the legacy ids d{n}l / d{n}c and the same mic-button markup, so
  // collectMeals(), buildPdfV2Payload(), updateShoppingList(), dictation and
  // generateRandomMenu() keep working unchanged. Interactions (picker, reroll,
  // remove) are Day 2-3 — Day 1 is layout only.
  function ensurePlanCardsContainer() {
    let el = document.getElementById('plan-cards');
    if (!el) {
      // Anchor to the planner's OWN .table-wrap (not any table wrapper on the
      // page) so the cards always sit inside the planner section.
      const wrap = document.getElementById('plan-table')?.closest('.table-wrap');
      if (!wrap) return null;
      el = document.createElement('div');
      el.id = 'plan-cards';
      wrap.insertAdjacentElement('afterend', el);
    }
    return el;
  }

  function renderWeekCards() {
    const cardsEl = ensurePlanCardsContainer();
    if (!cardsEl) return;
    cardsEl.classList.remove('pw-hidden');
    const weekdays = (i18n[lang] && i18n[lang].weekdays) || i18n.en.weekdays;

    const mealSlot = (idx, kind) => {
      const inputId = `d${idx + 1}${kind === 'lunch' ? 'l' : 'c'}`;
      const emoji   = kind === 'lunch' ? '🍱' : '🌙';
      const label   = kind === 'lunch' ? t('pw.lunch') : t('pw.dinner');
      const ph      = kind === 'lunch' ? t('placeholderL') : t('placeholderD');
      const dayName = weekdays[idx];
      const rerollLabel = `${t('pw.reroll')} — ${dayName}, ${label}`;
      const removeLabel = `${t('pw.remove')} — ${dayName}, ${label}`;
      const addLabel    = kind === 'lunch' ? t('pw.addLunch') : t('pw.addDinner');
      // The pre-created #rmeta-… div is picked up by updateAllRecipeMeta() (it
      // looks the id up before appending next to the input), so the meta chips
      // land BELOW the input instead of inside the .input-group.
      // Action buttons (Day 2) render always but are CSS-hidden while the slot
      // is empty (.pw-meal without .pw-filled).
      // Day 3 display layer: the input REMAINS the data layer — collectMeals(),
      // updateShoppingList(), the PDF payload and deep links all read it, and
      // setSlotValue() writes it — but it is visually hidden on week cards
      // (.pw-visually-hidden keeps it in the DOM, functional and focusable
      // programmatically). What the user sees/clicks instead: the recipe-name
      // button (filled → picker in replace mode) or the empty-slot button
      // (empty → picker in add mode, copy per PLANNER_BRAIN_SPEC §8). CSS
      // toggles between the two off .pw-filled; text is synced by
      // updateAllRecipeMeta()/setSlotValue().
      return `
        <div class="pw-meal">
          <div class="pw-actions">
            <button type="button" class="pw-btn" data-act="reroll" data-input="${inputId}" aria-label="${rerollLabel}" title="${rerollLabel}"><i class="bi bi-shuffle" aria-hidden="true"></i></button>
            <button type="button" class="pw-btn" data-act="remove" data-input="${inputId}" aria-label="${removeLabel}" title="${removeLabel}"><i class="bi bi-x-lg" aria-hidden="true"></i></button>
          </div>
          <div class="pw-meal-kind"><span aria-hidden="true">${emoji}</span> ${label}</div>
          <!-- Mic removed on cards (producer decision, 8 iul): dictation is
               redundant once the Day 3 picker lands; table modes keep it. -->
          <div class="input-group input-group-sm pw-visually-hidden" aria-hidden="true">
            <input id="${inputId}" class="form-control" placeholder="${ph}" tabindex="-1">
          </div>
          <button type="button" class="pw-meal-name" data-input="${inputId}" title="${t('pw.searchHint')}"></button>
          <button type="button" class="pw-empty-slot" data-input="${inputId}" aria-label="${addLabel} — ${dayName}">
            <span class="pw-es-add"><span class="pw-es-plus" aria-hidden="true">＋</span> ${addLabel}</span>
            <span class="pw-es-hint">${t('pw.searchHint')}</span>
          </button>
          <div id="rmeta-${inputId}" class="pw-meta"></div>
        </div>`;
    };

    const ovCard = (id, labelKey) =>
      `<div class="pw-ov-card"><div class="pw-ov-num" id="${id}">—</div><div class="pw-ov-label">${t(labelKey)}</div></div>`;

    cardsEl.innerHTML = `
      <div class="pw-overview" aria-live="polite">
        ${ovCard('pw-ov-days', 'pw.ovDays')}
        ${ovCard('pw-ov-time', 'pw.ovTime')}
        ${ovCard('pw-ov-cost', 'pw.ovCost')}
        ${ovCard('pw-ov-cuisines', 'pw.ovCuisines')}
      </div>
      <div class="pw-days">
        ${weekdays.map((day, idx) => `
          <div class="pw-day-card">
            <div class="pw-day-head">
              <span class="pw-day-name">${day}</span>
              <span class="pw-day-cost" id="pw-day-cost-${idx + 1}"></span>
            </div>
            ${mealSlot(idx, 'lunch')}
            ${mealSlot(idx, 'dinner')}
          </div>`).join('')}
      </div>`;

    // Wire the fresh inputs into the live shopping-list/meta pipeline and
    // paint the stats (both are idempotent — dataset flags guard re-wiring).
    wireInputsToShoppingList();
    updateWeekOverview();
    setTimeout(updateAllRecipeMeta, 0);

    // Day 2/3: one delegated listener on the persistent container handles every
    // 🎲/✕/name/empty-slot click — survives innerHTML re-renders, no per-button
    // wiring. Name button → picker in replace mode; empty slot → add mode.
    if (!cardsEl.dataset.pwActionsWired) {
      cardsEl.addEventListener('click', (e) => {
        const btn = e.target.closest ? e.target.closest('.pw-btn, .pw-meal-name, .pw-empty-slot') : null;
        if (!btn) return;
        if (btn.classList.contains('pw-btn')) {
          if (btn.dataset.act === 'reroll') rerollMeal(btn.dataset.input, btn);
          else if (btn.dataset.act === 'remove') removeMealSlot(btn.dataset.input);
        } else {
          openPwPicker(btn.dataset.input, btn.classList.contains('pw-empty-slot') ? 'add' : 'replace');
        }
      });
      cardsEl.dataset.pwActionsWired = '1';
    }
  }

  // Live stats: Week Overview strip + per-day cost in each card header.
  // Called from updateShoppingList(), i.e. on exactly the same events that
  // already refresh the shopping list (typing, dictation, generate, mode
  // switch, deep links). No-op while the cards are not rendered (meal/day).
  function updateWeekOverview() {
    const cardsEl = document.getElementById('plan-cards');
    if (!cardsEl || cardsEl.classList.contains('pw-hidden') || !cardsEl.firstElementChild) return;
    let daysPlanned = 0, totalCost = 0, totalTime = 0, timeCount = 0;
    const cuisines = new Set();
    for (let d = 1; d <= 7; d++) {
      let dayCost = 0, dayHasMeal = false;
      ['l', 'c'].forEach(sfx => {
        const val = document.getElementById(`d${d}${sfx}`)?.value.trim() || '';
        if (!val) return;
        dayHasMeal = true;
        const rec = getRecipeByInput(val);
        if (!rec) return;
        if (rec.costRon) { dayCost += rec.costRon; totalCost += rec.costRon; }
        if (rec.time)    { totalTime += rec.time; timeCount++; }
        cuisines.add(rec.origin?.en || rec.origin?.ro || rec.id);
      });
      if (dayHasMeal) daysPlanned++;
      const costEl = document.getElementById(`pw-day-cost-${d}`);
      if (costEl) costEl.textContent = dayCost > 0 ? formatCost(dayCost) : '';
    }
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('pw-ov-days', String(daysPlanned));
    set('pw-ov-time', timeCount ? `~${Math.round(totalTime / timeCount)} min` : '—');
    set('pw-ov-cost', totalCost > 0 ? formatCost(totalCost) : '—');
    set('pw-ov-cuisines', cuisines.size ? String(cuisines.size) : '—');
  }

  // ── Day 2: meal mutations — reroll 🎲 / remove ✕ + change toast with undo ──
  // Spec: docs/ai/PLANNER_BRAIN_SPEC.md §1 (reroll criteria), §2 (toast+undo),
  // §7 (recalculation). THE mechanism: every mutation writes the localized
  // recipe name into the legacy input (same format the generator/autocomplete
  // writes) and dispatches a real 'input' event. That routes ALL recalculation
  // — shopping list, Week Overview, per-day costs, meta chips, PDF payload
  // (reads live state at export) — through the existing wiring. No duplicated
  // recalculation logic anywhere in this section.
  function setSlotValue(input, value) {
    input.value = value;
    // Immediate visual state (action buttons + Day 3 name/empty display swap);
    // updateAllRecipeMeta() re-asserts both on its own (debounced) pass.
    syncSlotDisplay(input);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // Day 3 display layer: keep the visible slot UI (recipe-name button vs
  // empty-slot button) in sync with the hidden input that owns the data.
  // Fallback safety: free text that doesn't resolve to a recipe is shown
  // verbatim in the name button.
  function syncSlotDisplay(input) {
    const meal = input.closest('.pw-meal');
    if (!meal) return; // table modes ('meal'/'day') have no card wrapper
    const filled = !!input.value.trim();
    meal.classList.toggle('pw-filled', filled);
    const nameBtn = meal.querySelector('.pw-meal-name');
    if (nameBtn) {
      const rec = filled ? getRecipeByInput(input.value) : null;
      const name = rec ? getRecipeText(rec, lang) : input.value.trim();
      if (nameBtn.textContent !== name) nameBtn.textContent = name;
    }
  }

  // The exact pool generateRandomMenu() draws from: active filter chip
  // (window._activeFilter) or the budget corpus, minus non-main-meal
  // categories. Shared so 🎲 can never suggest something Generate wouldn't.
  async function getGenerationPool() {
    await ensureMainRecipes();
    let pool;
    if (window.isBudgetMenu) {
      await ensureBudgetRecipes();
      pool = recipesBudget;
    } else {
      const filterDef = typeof FILTER_DEFS !== 'undefined'
        ? FILTER_DEFS.find(f => f.id === (window._activeFilter || 'all'))
        : null;
      const test = filterDef && filterDef.id !== 'all' ? filterDef.test : () => true;
      pool = recipesMain.filter(test);
      if (pool.length < 2) pool = recipesMain; // fallback
    }
    // Exclude non-main categories (Dessert / Snack / Salad / Breakfast /
    // Appetizer / Side dish) from lunch/dinner slots. Category EN values are
    // stable; recipes without a category fall through as eligible.
    const NON_MAIN_MEAL = new Set(['Dessert', 'Snack', 'Salad', 'Breakfast', 'Appetizer', 'Side dish']);
    const mainOnly = pool.filter(r => !NON_MAIN_MEAL.has(r.category?.en || ''));
    if (mainOnly.length >= 2) pool = mainOnly;
    return Array.isArray(pool) ? pool : [];
  }

  // Every recipe currently in any slot, resolved through the same helper the
  // rest of the app uses (getRecipeByInput → recipeNameMatches).
  function recipeIdsInPlan() {
    const used = new Set();
    for (let d = 1; d <= 7; d++) {
      ['l', 'c'].forEach(sfx => {
        const val = document.getElementById(`d${d}${sfx}`)?.value.trim() || '';
        if (!val) return;
        const rec = getRecipeByInput(val);
        if (rec) used.add(rec.id);
      });
    }
    return used;
  }

  // Signed cost delta in the site's cost convention (§6: always "~"; RON for
  // ro, €/4.97 otherwise). Returns '' when the displayed magnitude rounds to 0.
  function pwCostDelta(deltaRon) {
    if (deltaRon == null || !isFinite(deltaRon)) return '';
    const mag = lang === 'ro' ? Math.abs(deltaRon) : Math.round(Math.abs(deltaRon) / 4.97);
    if (!mag) return '';
    const sign = deltaRon > 0 ? '+' : '−';
    return lang === 'ro' ? `${sign}~${Math.abs(deltaRon)} RON` : `${sign}~€${mag}`;
  }
  // Time delta only when |Δ| ≥ 10 min (brain spec §2).
  function pwTimeDelta(oldT, newT) {
    if (oldT == null || newT == null) return '';
    const d = newT - oldT;
    if (Math.abs(d) < 10) return '';
    return `${d > 0 ? '+' : '−'}${Math.abs(d)} min`;
  }

  async function rerollMeal(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input || !input.value.trim()) return;
    const prevValue = input.value;
    const current = getRecipeByInput(prevValue);
    const pool = await getGenerationPool();
    const used = recipeIdsInPlan();
    // §1.2: zero duplicates — exclude everything already in the plan.
    const valid = pool.filter(r => !used.has(r.id));
    if (!valid.length) { pwPoolEmptyFeedback(btn); return; }
    // §1.3: prefer similar effort/price (time ±15 min AND cost ±10 RON);
    // fall back to random from the full valid pool when that sub-pool is empty.
    const similar = current ? valid.filter(r =>
      current.time != null && r.time != null && Math.abs(r.time - current.time) <= 15 &&
      current.costRon != null && r.costRon != null && Math.abs(r.costRon - current.costRon) <= 10
    ) : [];
    const from = similar.length ? similar : valid;
    const pick = from[Math.floor(Math.random() * from.length)];
    setSlotValue(input, getRecipeText(pick, lang));
    const oldName = getRecipeText(current, lang) || extractRecipeName(prevValue) || prevValue;
    showChangeToast({
      inputId,
      prevValue,
      text: [
        `${oldName} → ${getRecipeText(pick, lang)}`,
        current && current.costRon != null && pick.costRon != null
          ? pwCostDelta(pick.costRon - current.costRon) : '',
        pwTimeDelta(current?.time, pick.time),
      ].filter(Boolean).join(' · '),
    });
  }

  function removeMealSlot(inputId) {
    const input = document.getElementById(inputId);
    if (!input || !input.value.trim()) return;
    const prevValue = input.value;
    const rec = getRecipeByInput(prevValue);
    setSlotValue(input, '');
    const name = getRecipeText(rec, lang) || extractRecipeName(prevValue) || prevValue;
    showChangeToast({
      inputId,
      prevValue,
      text: [
        `${name} ${t('pw.removed')}`,
        rec && rec.costRon != null ? pwCostDelta(-rec.costRon) : '',
      ].filter(Boolean).join(' · '),
    });
  }

  // Pool exhausted (§1: everything in the filter is already planned): brief
  // pulse + tooltip swap on the button itself — no alert(), no error state.
  function pwPoolEmptyFeedback(btn) {
    if (!btn) return;
    if (!btn.dataset.origTitle) btn.dataset.origTitle = btn.title || '';
    btn.title = t('pw.noMore');
    btn.classList.add('pw-btn-shake');
    clearTimeout(btn._pwShakeTimer);
    btn._pwShakeTimer = setTimeout(() => btn.classList.remove('pw-btn-shake'), 650);
    clearTimeout(btn._pwTitleTimer);
    btn._pwTitleTimer = setTimeout(() => { btn.title = btn.dataset.origTitle; }, 2500);
  }

  // ── Change toast (brain spec §2): one at a time, single-step undo ──
  let _pwToastHideTimer = null;
  let _pwUndo = null; // { inputId, prevValue } — replaced by every new change

  // Created once at init (not lazily) so the aria-live region exists in the
  // DOM before its first announcement. No HTML file edits — JS-built.
  function ensurePwToast() {
    let el = document.getElementById('pw-toast');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'pw-toast';
    el.className = 'pw-toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    const txt = document.createElement('span');
    txt.className = 'pw-toast-text';
    const undoBtn = document.createElement('button');
    undoBtn.type = 'button';
    undoBtn.className = 'pw-toast-undo';
    undoBtn.addEventListener('click', () => {
      const undo = _pwUndo;
      _pwUndo = null;
      hidePwToast();
      if (!undo) return;
      const input = document.getElementById(undo.inputId);
      // Same set-value+dispatch mechanism → full recalculation chain (§7).
      if (input) setSlotValue(input, undo.prevValue);
    });
    el.appendChild(txt);
    el.appendChild(undoBtn);
    document.body.appendChild(el);
    return el;
  }

  function hidePwToast() {
    clearTimeout(_pwToastHideTimer);
    document.getElementById('pw-toast')?.classList.remove('pw-toast-show');
  }

  function showChangeToast({ inputId, prevValue, text }) {
    const el = ensurePwToast();
    _pwUndo = { inputId, prevValue }; // new change replaces the pending undo
    el.querySelector('.pw-toast-text').textContent = text;
    el.querySelector('.pw-toast-undo').textContent = t('pw.undo');
    el.classList.add('pw-toast-show');
    clearTimeout(_pwToastHideTimer);
    _pwToastHideTimer = setTimeout(hidePwToast, 6000);
  }

  // ── Day 3: recipe picker — centered modal ≥700px / bottom sheet <700px ─────
  // Specs: PLANNER_BRAIN_SPEC §3 (search ranking, DECIDED), §4 (recommenda-
  // tions), §5 (manual duplicates allowed, with hint), §8 (empty-slot copy);
  // PLANNER_RESPONSIVE_SPEC §4 (surfaces, touch targets), §5 (dialog roles,
  // keyboard, focus return). JS-created singleton, no HTML file edits,
  // everything `pw-` namespaced. Selection goes through setSlotValue() → the
  // full recalculation chain (§7) — no plan logic lives in the picker itself.
  let _pwPicker = null; // { inputId, mode:'add'|'replace', items, hi, scrollY, seq }

  function pwEsc(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  }

  // Diacritic-insensitive normalization (§3): NFD + strip combining marks
  // covers ș/ț/ă/ö/ç/é/ñ…; non-Latin scripts (ru/ar/zh/ja/hi/ko) pass through
  // unchanged, so the plain includes() path still matches them.
  function pwNorm(s) {
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function pwRecipeName(r) {
    return r?.name?.[lang] || r?.name?.en || r?.name?.ro || '';
  }

  // Search corpus: same base getGenerationPool() draws from, but WITHOUT the
  // active-filter restriction — the filter shapes GENERATION; explicit search
  // is user intent and wins (searching "pui" with the veg chip on still finds
  // chicken). Budget mode keeps its own corpus: that's a different catalog,
  // not a preference filter.
  async function getPickerCorpus() {
    await ensureMainRecipes();
    if (window.isBudgetMenu) {
      await ensureBudgetRecipes();
      return recipesBudget;
    }
    return recipesMain;
  }

  // recipe id → weekday name of its first slot, for the "already in plan ·
  // Monday" hint (§5 — manual duplicates are ALLOWED, just hinted).
  function pwPlanDayByRecipe() {
    const map = new Map();
    const weekdays = (i18n[lang] && i18n[lang].weekdays) || i18n.en.weekdays;
    for (let d = 1; d <= 7; d++) {
      ['l', 'c'].forEach(sfx => {
        const val = document.getElementById(`d${d}${sfx}`)?.value.trim() || '';
        if (!val) return;
        const rec = getRecipeByInput(val);
        if (rec && !map.has(rec.id)) map.set(rec.id, weekdays[d - 1]);
      });
    }
    return map;
  }

  // §3 exactly: tier 1 name-starts-with > tier 2 name-contains > tier 3
  // ingredient-contains; inside each tier, cooking time ascending (missing
  // time sinks to the end). Name/ingredients in the active locale with EN
  // fallback. Cap 30. No invented scores, no popularity.
  function pwSearchRecipes(corpus, q) {
    const nq = pwNorm(q);
    const tiers = [[], [], []];
    for (const r of corpus) {
      const name = pwNorm(pwRecipeName(r));
      if (!name) continue;
      if (name.startsWith(nq)) { tiers[0].push({ r }); continue; }
      if (name.includes(nq)) { tiers[1].push({ r }); continue; }
      const ingr = r.ingredients?.[lang] || r.ingredients?.en || r.ingredients?.ro || [];
      if (ingr.some(x => pwNorm(x).includes(nq))) tiers[2].push({ r, byIngredient: true });
    }
    const byTime = (a, b) => (a.r.time ?? 9999) - (b.r.time ?? 9999);
    tiers.forEach(tier => tier.sort(byTime));
    return tiers[0].concat(tiers[1], tiers[2]).slice(0, 30);
  }

  // §4: replace mode → "Potrivite cu planul tău": filter-respecting pool, not
  // in plan, time ±15 min AND cost ±10 RON vs the current recipe, sorted by
  // cost proximity, max 3. Add mode → "Rapide și ieftine": top 3 by
  // time + costRon. Honest labels only — no taste profile exists yet.
  async function pwRecommendations(mode, currentRec) {
    const pool = await getGenerationPool();
    const used = recipeIdsInPlan();
    const free = pool.filter(r => !used.has(r.id));
    if (mode === 'replace' && currentRec) {
      return free
        .filter(r =>
          currentRec.time != null && r.time != null && Math.abs(r.time - currentRec.time) <= 15 &&
          currentRec.costRon != null && r.costRon != null && Math.abs(r.costRon - currentRec.costRon) <= 10)
        .sort((a, b) =>
          Math.abs(a.costRon - currentRec.costRon) - Math.abs(b.costRon - currentRec.costRon))
        .slice(0, 3);
    }
    return free.slice()
      .sort((a, b) => ((a.time ?? 999) + (a.costRon ?? 999)) - ((b.time ?? 999) + (b.costRon ?? 999)))
      .slice(0, 3);
  }

  function ensurePwPicker() {
    let backdrop = document.getElementById('pw-picker-backdrop');
    if (backdrop) return backdrop;
    backdrop = document.createElement('div');
    backdrop.id = 'pw-picker-backdrop';
    backdrop.className = 'pw-picker-backdrop';
    backdrop.innerHTML = `
      <div class="pw-picker" role="dialog" aria-modal="true" aria-labelledby="pw-picker-title">
        <div class="pw-picker-head">
          <div class="pw-picker-grip" aria-hidden="true"></div>
          <div class="pw-picker-title" id="pw-picker-title"></div>
          <input class="pw-picker-search" id="pw-picker-search" type="search"
                 autocomplete="off" aria-controls="pw-picker-list">
        </div>
        <div class="pw-picker-list" id="pw-picker-list" role="listbox" aria-labelledby="pw-picker-title"></div>
      </div>`;
    document.body.appendChild(backdrop);

    const search = backdrop.querySelector('#pw-picker-search');
    const list = backdrop.querySelector('#pw-picker-list');
    search.addEventListener('input', () => { renderPwPickerList(search.value); });
    // Backdrop click closes; clicks inside the dialog don't reach the backdrop.
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closePwPicker(); });
    backdrop.addEventListener('keydown', pwPickerKeydown);
    list.addEventListener('click', (e) => {
      const item = e.target.closest ? e.target.closest('.pw-pick-item') : null;
      if (item) pwPickItem(parseInt(item.dataset.idx, 10));
    });
    // Tabbing onto a result syncs the aria-selected highlight with focus.
    list.addEventListener('focusin', (e) => {
      const item = e.target.closest ? e.target.closest('.pw-pick-item') : null;
      if (item && _pwPicker) { _pwPicker.hi = parseInt(item.dataset.idx, 10); paintPwSelection(false); }
    });
    return backdrop;
  }

  async function openPwPicker(inputId, mode) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const backdrop = ensurePwPicker();
    // Surface decided by matchMedia AT OPEN TIME (responsive spec §4): bottom
    // sheet under the same 700px threshold the card grid uses.
    backdrop.classList.toggle('pw-picker--sheet', window.matchMedia('(max-width: 699px)').matches);

    // d{n}l / d{n}c → day 1-7 + lunch/dinner, reusing the Day 1 i18n keys.
    const day = parseInt(inputId.slice(1), 10);
    const kind = inputId.endsWith('l') ? 'lunch' : 'dinner';
    const weekdays = (i18n[lang] && i18n[lang].weekdays) || i18n.en.weekdays;
    document.getElementById('pw-picker-title').textContent =
      `${weekdays[day - 1] || ''} · ${kind === 'lunch' ? t('pw.lunch') : t('pw.dinner')}`;

    const search = document.getElementById('pw-picker-search');
    search.value = '';
    search.placeholder = t('pw.searchPh');
    search.setAttribute('aria-label', t('pw.searchHint'));
    search.removeAttribute('aria-activedescendant');

    _pwPicker = { inputId, mode, items: [], hi: -1,
      scrollY: (document.scrollingElement || document.documentElement).scrollTop || window.scrollY || 0,
      seq: 0 };
    // Body scroll lock that preserves the scroll position (restored on close).
    document.body.style.top = `-${_pwPicker.scrollY}px`;
    document.body.classList.add('pw-noscroll');
    backdrop.classList.add('pw-open');

    renderPwPickerList('');
    // Focus after the sheet slide-up (~60ms) so the mobile keyboard doesn't
    // jump mid-animation (responsive spec §4).
    setTimeout(() => { if (_pwPicker) search.focus(); }, 60);
  }

  function closePwPicker() {
    const backdrop = document.getElementById('pw-picker-backdrop');
    if (!backdrop || !backdrop.classList.contains('pw-open')) return;
    const st = _pwPicker;
    _pwPicker = null;
    backdrop.classList.remove('pw-open');
    document.body.classList.remove('pw-noscroll');
    document.body.style.top = '';
    // On ANY close, focus returns to the edited slot's visible trigger
    // (responsive spec §5). preventScroll: focus() must not fight the scroll
    // restore below (QA finding, 8 iul: page jumped to hero after picking).
    const meal = st ? document.getElementById(st.inputId)?.closest('.pw-meal') : null;
    if (meal) {
      const btn = meal.classList.contains('pw-filled')
        ? meal.querySelector('.pw-meal-name')
        : meal.querySelector('.pw-empty-slot');
      if (btn) { try { btn.focus({ preventScroll: true }); } catch (_) { btn.focus(); } }
    }
    // Restore AFTER focus, twice (immediate + next tick). behavior:'instant'
    // is REQUIRED: html has scroll-behavior:smooth and the smooth animation
    // silently never progresses right after unlocking the fixed body (QA
    // finding, 8 iul — page ended at the hero after every picker close).
    if (st) {
      const restore = () => window.scrollTo({ top: st.scrollY, left: 0, behavior: 'instant' });
      restore();
      setTimeout(restore, 50);
    }
  }

  // One render for both states: query ≥ 1 char → §3 ranked search over the
  // full corpus; empty query → browse mode: §4 recommendations + "Toate
  // rețetele" (filter-respecting pool, time asc, cap 30).
  async function renderPwPickerList(rawQuery) {
    const st = _pwPicker;
    if (!st) return;
    const seq = ++st.seq;
    const list = document.getElementById('pw-picker-list');
    const query = String(rawQuery || '').trim();
    const dayMap = pwPlanDayByRecipe();

    const entries = [];
    let html = '';
    const headerHtml = (txt) =>
      `<div class="pw-picker-header" role="presentation">${pwEsc(txt)}</div>`;
    const itemHtml = (r, why) => {
      const idx = entries.length;
      entries.push(r);
      const metaParts = [];
      if (r.time) metaParts.push(`⏱️ ${r.time} min`);
      if (r.costRon) metaParts.push(formatCost(r.costRon));
      const tagId = r.tags && r.tags[0];
      if (tagId) metaParts.push((TAG_LABELS[tagId] || {})[lang] || (TAG_LABELS[tagId] || {}).en || tagId);
      const already = dayMap.has(r.id)
        ? t('pw.alreadyIn').replace('{day}', dayMap.get(r.id)) : '';
      return `
        <button type="button" class="pw-pick-item" id="pw-opt-${idx}" role="option"
                aria-selected="false" data-idx="${idx}">
          <span class="pw-pick-main">
            <span class="pw-pick-name">${pwEsc(pwRecipeName(r))}</span>
            ${metaParts.length ? `<span class="pw-pick-meta">${pwEsc(metaParts.join(' · '))}</span>` : ''}
            ${already ? `<span class="pw-pick-already">${pwEsc(already)}</span>` : ''}
          </span>
          ${why ? `<span class="pw-pick-why">${pwEsc(why)}</span>` : ''}
        </button>`;
    };

    if (query.length >= 1) {
      const corpus = await getPickerCorpus();
      if (st !== _pwPicker || seq !== st.seq) return; // closed / superseded
      const hits = pwSearchRecipes(corpus, query);
      if (!hits.length) {
        st.items = []; st.hi = -1;
        list.innerHTML = `<div class="pw-picker-empty">${pwEsc(t('pw.noResults'))}</div>`;
        paintPwSelection(false);
        return;
      }
      // Ingredient-tier badge shows the matched term — "conține pui" (§3).
      const whyTxt = t('pw.contains').replace('{ing}', query);
      hits.forEach(h => { html += itemHtml(h.r, h.byIngredient ? whyTxt : ''); });
    } else {
      const inputEl = document.getElementById(st.inputId);
      const currentRec = st.mode === 'replace' ? getRecipeByInput(inputEl?.value || '') : null;
      const recs = await pwRecommendations(st.mode, currentRec);
      const pool = await getGenerationPool();
      if (st !== _pwPicker || seq !== st.seq) return;
      if (recs.length) {
        html += headerHtml(st.mode === 'replace' ? t('pw.recommended') : t('pw.quickCheap'));
        recs.forEach(r => { html += itemHtml(r, ''); });
      }
      html += headerHtml(t('pw.allRecipes'));
      pool.slice()
        .sort((a, b) => (a.time ?? 9999) - (b.time ?? 9999))
        .slice(0, 30)
        .forEach(r => { html += itemHtml(r, ''); });
    }

    st.items = entries;
    st.hi = entries.length ? 0 : -1;
    list.innerHTML = html;
    list.scrollTop = 0;
    paintPwSelection(false);
  }

  function paintPwSelection(scroll) {
    const st = _pwPicker;
    if (!st) return;
    document.querySelectorAll('#pw-picker-list .pw-pick-item').forEach(el => {
      el.setAttribute('aria-selected', String(parseInt(el.dataset.idx, 10) === st.hi));
    });
    const search = document.getElementById('pw-picker-search');
    if (search) {
      if (st.hi >= 0) search.setAttribute('aria-activedescendant', `pw-opt-${st.hi}`);
      else search.removeAttribute('aria-activedescendant');
    }
    if (scroll && st.hi >= 0) {
      const el = document.getElementById(`pw-opt-${st.hi}`);
      if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
    }
  }

  function movePwHighlight(dir) {
    const st = _pwPicker;
    if (!st || !st.items.length) return;
    const n = st.items.length;
    st.hi = ((st.hi + dir) % n + n) % n;
    paintPwSelection(true);
  }

  // Keyboard (responsive spec §5): ↑/↓ move the aria-selected highlight,
  // Enter picks it, Escape closes, Tab is a simple two-stop trap between the
  // search field and the results list (in-list navigation is the arrows' job).
  function pwPickerKeydown(e) {
    const st = _pwPicker;
    if (!st) return;
    const search = document.getElementById('pw-picker-search');
    if (e.key === 'Escape') { e.preventDefault(); closePwPicker(); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      movePwHighlight(e.key === 'ArrowDown' ? 1 : -1);
      return;
    }
    if (e.key === 'Enter') {
      // On a result button, Enter = native click (list delegation handles it);
      // from the search field it picks the highlighted option.
      if (document.activeElement === search && st.hi >= 0) {
        e.preventDefault();
        pwPickItem(st.hi);
      }
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      if (document.activeElement === search) {
        const target = document.getElementById(`pw-opt-${Math.max(st.hi, 0)}`)
          || document.querySelector('#pw-picker-list .pw-pick-item');
        if (target) target.focus();
      } else if (search) {
        search.focus();
      }
    }
  }

  // Selection: write through setSlotValue() — chips, Week Overview, shopping
  // list and PDF payload all update through the existing wiring (§7) — then
  // show the Day 2 change toast (undo restores the previous value, including
  // the empty state in add mode) and close with focus return.
  function pwPickItem(idx) {
    const st = _pwPicker;
    if (!st || idx < 0 || !st.items[idx]) return;
    const rec = st.items[idx];
    const input = document.getElementById(st.inputId);
    if (!input) { closePwPicker(); return; }
    const prevValue = input.value;
    const wasFilled = !!prevValue.trim();
    const prevRec = wasFilled ? getRecipeByInput(prevValue) : null;
    const newText = getRecipeText(rec, lang);
    if (newText && newText !== prevValue) {
      setSlotValue(input, newText);
      if (wasFilled) {
        // Replace: old → new with honest deltas (brain spec §2).
        const oldName = getRecipeText(prevRec, lang) || extractRecipeName(prevValue) || prevValue;
        showChangeToast({
          inputId: st.inputId,
          prevValue,
          text: [
            `${oldName} → ${newText}`,
            prevRec && prevRec.costRon != null && rec.costRon != null
              ? pwCostDelta(rec.costRon - prevRec.costRon) : '',
            pwTimeDelta(prevRec?.time, rec.time),
          ].filter(Boolean).join(' · '),
        });
      } else {
        // Add: name + cost added — no new i18n key needed; undo (prevValue
        // '') restores the empty slot through the same mechanism.
        showChangeToast({
          inputId: st.inputId,
          prevValue,
          text: [newText, rec.costRon != null ? pwCostDelta(rec.costRon) : '']
            .filter(Boolean).join(' · '),
        });
      }
    }
    closePwPicker();
  }

  function startDictation(inputId) {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Dictarea nu este suportată de browserul tău!');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    const langMap = { ro:'ro-RO', en:'en-US', es:'es-ES', fr:'fr-FR', ru:'ru-RU', zh:'zh-CN', ja:'ja-JP', pt:'pt-PT', de:'de-DE', ar:'ar-SA', hi:'hi-IN',tr: 'tr-TR',it: 'it-IT',ko: 'ko-KR'};
    recognition.lang = langMap[lang] || 'en-US';
    const micBtn = document.querySelector(`[onclick="startDictation('${inputId}')"]`);
    if (micBtn) micBtn.classList.add('mic-active');
    recognition.onend = () => { if (micBtn) micBtn.classList.remove('mic-active'); };
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const input = document.getElementById(inputId);
      if (input) {
        input.value = event.results[0][0].transcript;
        input.focus();
      }
    };
    recognition.onerror = (event) => {
      alert('Eroare la dictare: ' + event.error);
      if (micBtn) micBtn.classList.remove('mic-active');
    };
    recognition.start();
  }
  function getRecipeText(recipe, langCode) {
    if (!recipe) return '';
    // Meal inputs display ONLY the recipe name. Ingredients live in the
    // shopping list and on the recipe page — they are never preloaded into the
    // editable field (that produced an unreadable "Name (50-word ingredient
    // dump…)" value). Lookups still resolve: extractRecipeName() returns the
    // bare name and recipeNameMatches() finds the recipe in the corpus.
    return recipe.name?.[langCode] || recipe.name?.en || recipe.name?.ro || '';
  }

  // Full-sentence version used only in PDF output
  function getRecipeTextLong(recipe, langCode) {
    if (!recipe) return '';
    const name   = recipe.name?.[langCode] || recipe.name?.en || recipe.name?.ro || '';
    const ingr   = recipe.ingredients?.[langCode] || recipe.ingredients?.en || recipe.ingredients?.ro || [];
    const origin = recipe.origin?.[langCode] || recipe.origin?.en || recipe.origin?.ro || '';
    const list   = Array.isArray(ingr) ? ingr : [];
    if (!list.length) return name;
    const templates = {
      ro: (n, o, l) => `${n} (${l.join(', ')}) este o rețetă tradițională din ${o}.`,
      en: (n, o, l) => `${n} (${l.join(', ')}) is a traditional recipe from ${o}.`,
      es: (n, o, l) => `${n} (${l.join(', ')}) es una receta tradicional de ${o}.`,
      fr: (n, o, l) => `${n} (${l.join(', ')}) est une recette traditionnelle de ${o}.`,
      de: (n, o, l) => `${n} (${l.join(', ')}) ist ein traditionelles Rezept aus ${o}.`,
      pt: (n, o, l) => `${n} (${l.join(', ')}) é uma receita tradicional de ${o}.`,
      ru: (n, o, l) => `${n} (${l.join(', ')}) — традиционное блюдо из ${o}.`,
      ar: (n, o, l) => `${n} (${l.join(', ')}) هي وصفة تقليدية من ${o}.`,
      zh: (n, o, l) => `${n}（${l.join('，')}）是一道来自${o}的传统菜肴。`,
      ja: (n, o, l) => `${n}（${l.join('、')}）は${o}の伝統料理です。`,
      hi: (n, o, l) => `${n} (${l.join(', ')}) ${o} की पारंपरिक रेसिपी है।`,
      tr: (n, o, l) => `${n} (${l.join(', ')}) ${o} kökenli geleneksel bir tariftir.`,
      it: (n, o, l) => `${n} (${l.join(', ')}) è una ricetta tradizionale di ${o}.`,
      ko: (n, o, l) => `${n} (${l.join(', ')})는(은) ${o}의 전통 요리입니다.`,
    };
    return (templates[langCode] || templates.en)(name, origin, list);
  }
  // ── Smart diversity + feasibility picker for full-week generation ──────────
  // Diversity rules: max 2 recipes from same country, max 3 pasta/rice, max 4
  // heavy-meat. Feasibility: an optional `maxTimes` array gives a per-slot cook-
  // time ceiling (minutes) so very-long recipes stay off weekday slots and are
  // reserved for the weekend (see generateRandomMenu). Slots are filled in
  // order, so the tighter weekday slots are served from the short pool first.
  function smartPickWeek(pool, count, maxTimes) {
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const result = new Array(count).fill(null);
    const used = new Set();
    const countryCounts = Object.create(null);
    let pastaCount = 0;
    let heavyMeatCount = 0;

    const isPasta = r => {
      const ingr = (r.ingredients?.en || r.ingredients?.ro || []).join(' ').toLowerCase();
      return /(pasta\b|spaghetti|penne|fettuccin|tagliatell|noodle|risotto|\brice\b|\borez\b|\bpaste\b)/.test(ingr);
    };
    const isHeavyMeat = r => {
      const ingr = (r.ingredients?.en || r.ingredients?.ro || []).join(' ').toLowerCase();
      return /(beef|pork|lamb|veal|steak|vit[aă]|porc|miel|biftec|cotlet)/.test(ingr);
    };
    // A recipe is too long for slot k only if it has a known time that exceeds
    // that slot's ceiling. Unknown-time recipes are never excluded by time.
    const timeOk = (r, k) => {
      const max = maxTimes ? maxTimes[k] : Infinity;
      return !(max != null && max !== Infinity && r.time && r.time > max);
    };
    const diversityOk = r => {
      const country = r.origin?.en || r.origin?.ro || '';
      if ((countryCounts[country] || 0) >= 2) return false;
      if (isPasta(r) && pastaCount >= 3) return false;
      if (isHeavyMeat(r) && heavyMeatCount >= 4) return false;
      return true;
    };
    const take = r => {
      used.add(r);
      const country = r.origin?.en || r.origin?.ro || '';
      countryCounts[country] = (countryCounts[country] || 0) + 1;
      if (isPasta(r)) pastaCount++;
      if (isHeavyMeat(r)) heavyMeatCount++;
    };

    for (let k = 0; k < count; k++) {
      // Per slot, prefer (time + diversity); then relax diversity but keep the
      // time ceiling; only as a last resort relax time too, then take anything.
      const pick =
        shuffled.find(r => !used.has(r) && timeOk(r, k) && diversityOk(r)) ||
        shuffled.find(r => !used.has(r) && timeOk(r, k)) ||
        shuffled.find(r => !used.has(r));
      if (pick) { result[k] = pick; take(pick); }
    }
    return result;
  }

  async function generateRandomMenu() {
  // Pool building is shared with the per-slot reroll (Day 2) — see
  // getGenerationPool(): active filter / budget corpus / non-main exclusion.
  const pool = await getGenerationPool();

  if (!Array.isArray(pool) || pool.length < 1) {
    console.warn("Random menu: pool too small", pool?.length);
    return false; // signal failure so plan_generated is NOT counted
  }

  const mode = window._planMode;

  if (mode === 'meal') {
    // Fill only one input — a single random recipe
    const input = document.getElementById('d1l');
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (input) input.value = pick ? getRecipeText(pick, lang) : '';
  } else if (mode === 'day') {
    // Fill lunch + dinner for today
    const lunchInput  = document.getElementById('d1l');
    const dinnerInput = document.getElementById('d1c');
    const picks = smartPickWeek(pool, 2);
    if (lunchInput)  lunchInput.value  = picks[0] ? getRecipeText(picks[0], lang) : '';
    if (dinnerInput) dinnerInput.value = picks[1] ? getRecipeText(picks[1], lang) : '';
  } else {
    // Full week — 7 days × lunch + dinner
    // Only fill empty slots — preserve any recipes already added manually
    const emptySlots = [];
    for (let i = 0; i < 7; i++) {
      const l = document.getElementById(`d${i+1}l`);
      const c = document.getElementById(`d${i+1}c`);
      if (l && !l.value.trim()) emptySlots.push(l);
      if (c && !c.value.trim()) emptySlots.push(c);
    }
    // Feasibility: keep very-long recipes off weekday slots (days 1–5) so the
    // default week is realistic for an average household; allow them only on
    // the weekend (days 6–7), where there's time for a project recipe.
    const WEEKDAY_MAX_MIN = 75;
    const dayOfSlot = el => parseInt((el.id.match(/^d(\d)/) || [])[1], 10) || 1;
    const maxTimes = emptySlots.map(el => (dayOfSlot(el) >= 6 ? Infinity : WEEKDAY_MAX_MIN));
    const picks = smartPickWeek(pool, emptySlots.length, maxTimes);
    emptySlots.forEach((inp, i) => {
      if (picks[i]) inp.value = getRecipeText(picks[i], lang);
    });
  }

  setTimeout(() => updateAllRecipeMeta(), 50);
  return true; // signal a plan was actually generated
}

  function collectMeals() {
    // Day names come from i18n (index-based), NOT from the table DOM — week
    // mode renders day cards (no <tr> rows) since the planner redesign, and
    // the inputs d{n}l / d{n}c are the single source of truth in every mode.
    const weekdays = (i18n[lang] && i18n[lang].weekdays) || i18n.en.weekdays;
    return weekdays.map((day, i) => ({
      day,
      lunch: document.getElementById(`d${i+1}l`)?.value.trim() || '',
      dinner: document.getElementById(`d${i+1}c`)?.value.trim() || ''
    }));
  }
  // (legacy generatePDFimpact removed — see git log for the html2pdf restore recipe.)
  // ── PDF export engine ─────────────────────────────────────────────────────
  // pdfv2 (server-side @react-pdf/renderer at /api/generate-pdf) is the only
  // export path. The legacy html2pdf branch and its runtime flags were
  // removed once pdfv2 went production-default. To roll back, revert the
  // commit titled "Remove legacy html2pdf export path" — that brings back
  // generatePDFimpact + buildCleanPdfNode + the engine switch.
  async function exportViaPdfV2() {
    // Build the payload from the live planner state — same source data the
    // legacy generatePDFimpact() reads. This ensures pdfv2 exports whatever
    // the user has currently selected/customized, not the server's built-in
    // demo plan (which now only fires when the endpoint is hit without a
    // structured body, e.g. for a direct GET smoke-test).
    const payload = buildPdfV2Payload();
    const resp = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) throw new Error('pdfv2 endpoint returned ' + resp.status);
    const blob = await resp.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'meal-plan.pdf';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    // Return metadata for the dispatcher's telemetry log.
    return {
      bytes: blob.size,
      serverRenderMs: parseInt(resp.headers.get('X-PDF-Render-Ms') || '0', 10) || null,
    };
  }

  // Translate the live planner state into the pdfv2 endpoint's payload shape.
  // Reuses the same lookup logic as generatePDFimpact() (collectMeals +
  // window.recipes + buildShoppingFromRawIngredients) so legacy and pdfv2
  // see exactly the same data — only the rendering differs.
  //
  // Every field that the user can see in the resulting PDF is emitted in
  // the active locale: recipe names, ingredient previews, shopping list
  // groups (engine localises), day abbreviations, chrome labels. EN
  // remains the safety fallback for any recipe that lacks a translation.
  function buildPdfV2Payload() {
    const isPremium    = !!window.hasUnlimited;
    const allMeals     = collectMeals();
    const freeDays     = 2;
    const visibleMeals = isPremium ? allMeals : allMeals.slice(0, freeDays);

    function findRecipe(mealText) {
      if (!mealText) return null;
      const title = extractRecipeName(mealText).toLowerCase();
      return (window.recipes || []).find(r => recipeNameMatches(r, lang, title)) || null;
    }
    // Extract a clean noun phrase from each raw ingredient string (drop
    // quantities, parens, prep notes) so the per-meal ingredient line reads
    // as a compact noun list — "Spaghetti, Guanciale, Eggs..." — not a
    // verbose recipe-text dump. De-dupe across the same meal so repeats
    // don't bloat the line.
    function shortIngredients(rawList) {
      const seen = new Set();
      const out  = [];
      for (const raw of rawList) {
        const p = parseIngredient(raw);
        if (!p || !p.name) continue;
        const display = p.name.charAt(0).toUpperCase() + p.name.slice(1);
        const key = p.name.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(display);
      }
      return out;
    }
    function mealPayload(mealText) {
      if (!mealText) return null;
      const r = findRecipe(mealText);
      // Resolve recipe name + ingredient list in the active locale, falling
      // back to EN then RO. Without this, an Italian user generates a PDF
      // with English ingredient previews under Italian chrome — labels
      // ("INGREDIENTI") localised but data ("Chicken thighs · Garlic
      // cloves") still in English.
      const displayName = r?.name?.[lang] || r?.name?.en || r?.name?.ro
                          || extractRecipeName(mealText);
      const rawIngr = r?.ingredients?.[lang] || r?.ingredients?.en
                      || r?.ingredients?.ro || [];
      return {
        name: displayName,
        time: r?.time || null,
        servings: r?.servings || null,
        cost: r?.costRon ? (lang === 'ro' ? `~${r.costRon} RON` : `~€${Math.round(r.costRon / 4.97)}`) : null,
        ingredients: shortIngredients(rawIngr),
      };
    }

    // Localized 3-letter weekday labels — used as the day header inside
    // the PDF. We derive them from the i18n.weekdays array (which is the
    // full weekday name list for the active locale) so the server-side
    // renderer doesn't need its own 14-locale table.
    const lcStrings = i18n[lang] || i18n.en || {};
    const fullDays = Array.isArray(lcStrings.weekdays) && lcStrings.weekdays.length === 7
      ? lcStrings.weekdays
      : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const abbrev = (s) => String(s || '').trim().slice(0, 3);
    const localizedDays = fullDays.map(abbrev);

    const days = visibleMeals.map((m, i) => ({
      day: localizedDays[i] || `Day ${i + 1}`,
      lunch: mealPayload(m.lunch),
      dinner: mealPayload(m.dinner),
    })).filter(d => (d.lunch && d.lunch.name) || (d.dinner && d.dinner.name));

    // Hybrid-B: pass aligned { en, loc } pairs, not a flat EN list. The EN
    // string drives parsing/canonical/category/quantity math (English-only
    // engine); the locale string at the SAME index supplies the localized
    // display label. ingredients.en[i] ↔ ingredients[lang][i] are aligned by
    // construction in recipes.js. We fall back to RO when EN is absent so the
    // engine still has English-shaped tokens; loc falls back to the EN string
    // when the active locale lacks that line (keeps indices in lockstep).
    const ingredientPairs = [];
    visibleMeals.forEach(m => {
      [m.lunch, m.dinner].filter(Boolean).forEach(text => {
        const r = findRecipe(text);
        if (!r) return;
        const enArr  = r.ingredients?.en || r.ingredients?.ro || [];
        const locArr = r.ingredients?.[lang] || enArr;
        enArr.forEach((en, i) => {
          ingredientPairs.push({ en, loc: locArr[i] != null ? locArr[i] : en });
        });
      });
    });
    let shoppingGroups = [];
    // Build the shopping list against the active locale so the rendered
    // group/item labels match the rest of the PDF (was hard-coded 'en').
    try { shoppingGroups = buildShoppingFromRawIngredients(ingredientPairs, lang); }
    catch (_) { shoppingGroups = []; }

    // Locked days notice — non-premium users only see days 1-freeDays.
    // Pass the names of the remaining locked days so the server can render
    // a localized "🔒 Days N–M are Premium" notice instead of silently
    // dropping the rest of the plan.
    const locked = !isPremium && allMeals.length > freeDays
      ? {
          fromDay: localizedDays[freeDays] || `Day ${freeDays + 1}`,
          toDay:   localizedDays[allMeals.length - 1] || `Day ${allMeals.length}`,
          title:   t('pdf.locked.title'),
          sub:     t('pdf.locked.sub'),
          cta:     t('pdf.locked.cta'),
        }
      : null;

    // Localized week label. Uses Intl with the locale's BCP-47 tag so e.g.
    // RO renders "Săptămâna 29 mai 2026" rather than the EN form.
    const today = new Date();
    const localeMap = {
      ro:'ro-RO', en:'en-GB', es:'es-ES', fr:'fr-FR', de:'de-DE', pt:'pt-PT',
      ru:'ru-RU', ar:'ar-SA', zh:'zh-CN', ja:'ja-JP', hi:'hi-IN', tr:'tr-TR',
      it:'it-IT', ko:'ko-KR',
    };
    const dateStr = today.toLocaleDateString(localeMap[lang] || 'en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
    const WEEK_OF = {
      ro:'Săptămâna', en:'Week of', es:'Semana del', fr:'Semaine du',
      de:'Woche vom', pt:'Semana de', ru:'Неделя с', ar:'أسبوع', zh:'本周',
      ja:'今週', hi:'सप्ताह', tr:'Hafta', it:'Settimana del', ko:'주간',
    };

    // Localized labels shipped IN the payload so the server-side renderer
    // is locale-agnostic (no need to duplicate the 14-language i18n table
    // server-side). Server falls back to the EN string if a key is missing.
    //
    // The strings below intentionally short — they're letter-spaced badge
    // labels in the PDF, not paragraph copy. The table covers all 14 site
    // locales; missing translations fall back to EN.
    const PDF_LABELS = {
      ro: {
        sectionPlan:'Săptămâna, zi cu zi',
        lunch:'PRÂNZ', dinner:'CINĂ',
        stats:{ days:'ZILE', meals:'MESE', avg:'MED', cuisines:'BUCĂTĂRII' },
        mealsSuffix:'mese', minTotal:'min total', moreSuffix:'altele',
        tipLabel:'SFAT', tipText:'Ingredientele sunt grupate pe rafturi — bifează pe măsură ce cumperi. Produsele proaspete și carnea la final pentru a păstra prospețimea.',
        pageOf:'Pagina {n} din {t}', servingsWord:'porții',
      },
      en: {
        sectionPlan:'The week, day by day',
        lunch:'LUNCH', dinner:'DINNER',
        stats:{ days:'DAYS', meals:'MEALS', avg:'AVG', cuisines:'CUISINES' },
        mealsSuffix:'meals', minTotal:'min total', moreSuffix:'more',
        tipLabel:'PRO TIP', tipText:'Items grouped by aisle — tick boxes as you shop. Produce and proteins last keeps everything fresh.',
        pageOf:'Page {n} of {t}', servingsWord:'servings',
      },
      es: {
        sectionPlan:'La semana, día a día',
        lunch:'ALMUERZO', dinner:'CENA',
        stats:{ days:'DÍAS', meals:'COMIDAS', avg:'MED', cuisines:'COCINAS' },
        mealsSuffix:'comidas', minTotal:'min total', moreSuffix:'más',
        tipLabel:'CONSEJO', tipText:'Ingredientes agrupados por pasillo — marca al comprar. Productos frescos y proteínas al final mantienen todo fresco.',
        pageOf:'Página {n} de {t}', servingsWord:'raciones',
      },
      fr: {
        sectionPlan:'La semaine, jour par jour',
        lunch:'DÉJEUNER', dinner:'DÎNER',
        stats:{ days:'JOURS', meals:'REPAS', avg:'MOY', cuisines:'CUISINES' },
        mealsSuffix:'repas', minTotal:'min total', moreSuffix:'autres',
        tipLabel:'ASTUCE', tipText:'Ingrédients regroupés par rayon — cochez en faisant les courses. Légumes frais et protéines en dernier pour la fraîcheur.',
        pageOf:'Page {n} sur {t}', servingsWord:'portions',
      },
      de: {
        sectionPlan:'Die Woche, Tag für Tag',
        lunch:'MITTAG', dinner:'ABEND',
        stats:{ days:'TAGE', meals:'MAHLZ.', avg:'Ø', cuisines:'KÜCHEN' },
        mealsSuffix:'Mahlzeiten', minTotal:'Min gesamt', moreSuffix:'weitere',
        tipLabel:'TIPP', tipText:'Zutaten nach Supermarkt-Gang gruppiert — beim Einkauf abhaken. Frisches und Eiweiß zuletzt für maximale Frische.',
        pageOf:'Seite {n} von {t}', servingsWord:'Portionen',
      },
      pt: {
        sectionPlan:'A semana, dia a dia',
        lunch:'ALMOÇO', dinner:'JANTAR',
        stats:{ days:'DIAS', meals:'REFEIÇÕES', avg:'MED', cuisines:'COZINHAS' },
        mealsSuffix:'refeições', minTotal:'min total', moreSuffix:'mais',
        tipLabel:'DICA', tipText:'Ingredientes agrupados por corredor — marque ao comprar. Frescos e proteínas por último para máxima frescura.',
        pageOf:'Página {n} de {t}', servingsWord:'porções',
      },
      ru: {
        sectionPlan:'Неделя, день за днём',
        lunch:'ОБЕД', dinner:'УЖИН',
        stats:{ days:'ДНИ', meals:'БЛЮДА', avg:'СРЕД', cuisines:'КУХНИ' },
        mealsSuffix:'блюд', minTotal:'мин всего', moreSuffix:'ещё',
        tipLabel:'СОВЕТ', tipText:'Продукты сгруппированы по отделам — отмечайте при покупке. Свежие и белки в конце для максимальной свежести.',
        pageOf:'Стр. {n} из {t}', servingsWord:'порций',
      },
      it: {
        sectionPlan:'La settimana, giorno per giorno',
        lunch:'PRANZO', dinner:'CENA',
        stats:{ days:'GIORNI', meals:'PASTI', avg:'MED', cuisines:'CUCINE' },
        mealsSuffix:'pasti', minTotal:'min totali', moreSuffix:'altri',
        tipLabel:'CONSIGLIO', tipText:'Ingredienti raggruppati per corsia — spunta mentre fai la spesa. Freschi e proteine per ultimi per la massima freschezza.',
        pageOf:'Pagina {n} di {t}', servingsWord:'porzioni',
      },
      tr: {
        sectionPlan:'Hafta, gün gün',
        lunch:'ÖĞLE', dinner:'AKŞAM',
        stats:{ days:'GÜN', meals:'YEMEK', avg:'ORT', cuisines:'MUTFAK' },
        mealsSuffix:'yemek', minTotal:'dk toplam', moreSuffix:'daha',
        tipLabel:'İPUCU', tipText:'Malzemeler reyon bazlı gruplandı — alışveriş ederken işaretle. Taze ürünler ve protein en son için maksimum tazelik.',
        pageOf:'Sayfa {n} / {t}', servingsWord:'porsiyon',
      },
      ar: {
        sectionPlan:'الأسبوع، يوم بيوم',
        lunch:'الغداء', dinner:'العشاء',
        stats:{ days:'أيام', meals:'وجبات', avg:'متوسط', cuisines:'مطابخ' },
        mealsSuffix:'وجبات', minTotal:'دقيقة إجمالًا', moreSuffix:'أخرى',
        tipLabel:'نصيحة', tipText:'المكونات مُجمَّعة حسب رواق المتجر — اشطب أثناء التسوق. الطازج والبروتين في الأخير للحفاظ على النضارة.',
        pageOf:'صفحة {n} من {t}', servingsWord:'حصص',
      },
      zh: {
        sectionPlan:'一周食谱',
        lunch:'午餐', dinner:'晚餐',
        stats:{ days:'天', meals:'餐', avg:'均', cuisines:'菜系' },
        mealsSuffix:'餐', minTotal:'分钟总计', moreSuffix:'更多',
        tipLabel:'小贴士', tipText:'食材按超市货架分组——边购物边打勾。生鲜和蛋白类最后买，保证新鲜。',
        pageOf:'第 {n} / {t} 页', servingsWord:'份',
      },
      ja: {
        sectionPlan:'今週の献立',
        lunch:'昼食', dinner:'夕食',
        stats:{ days:'日', meals:'食', avg:'平均', cuisines:'料理' },
        mealsSuffix:'食', minTotal:'分合計', moreSuffix:'その他',
        tipLabel:'ヒント', tipText:'食材は売場別にグループ化。買い物中にチェック。生鮮品とタンパク質は最後で鮮度キープ。',
        pageOf:'{n} / {t} ページ', servingsWord:'人分',
      },
      hi: {
        sectionPlan:'सप्ताह, दिन-प्रतिदिन',
        lunch:'दोपहर', dinner:'रात्रि',
        stats:{ days:'दिन', meals:'भोजन', avg:'औसत', cuisines:'व्यंजन' },
        mealsSuffix:'भोजन', minTotal:'मि कुल', moreSuffix:'और',
        tipLabel:'सुझाव', tipText:'सामग्री अलमारी के अनुसार समूहित — खरीदते समय निशान लगाएँ। ताज़ा सामान और प्रोटीन अंत में लें ताकि सब ताज़ा रहे।',
        pageOf:'पृष्ठ {n} / {t}', servingsWord:'सर्विंग',
      },
      ko: {
        sectionPlan:'한 주 식단',
        lunch:'점심', dinner:'저녁',
        stats:{ days:'일', meals:'식사', avg:'평균', cuisines:'요리' },
        mealsSuffix:'식', minTotal:'분 합계', moreSuffix:'개 더',
        tipLabel:'팁', tipText:'재료는 매대별로 그룹화 — 장보면서 체크. 신선식품과 단백질은 마지막에 담으면 신선도 유지.',
        pageOf:'{n} / {t} 페이지', servingsWord:'인분',
      },
    };
    const L = PDF_LABELS[lang] || PDF_LABELS.en;
    const labels = {
      sectionPlan:    L.sectionPlan,
      sectionShop:    lcStrings.shoppingList || 'Shopping list',
      lunch:          L.lunch,
      dinner:         L.dinner,
      ingredients:    lcStrings['col.ingredients']
                        ? lcStrings['col.ingredients'].toUpperCase()
                        : 'INGREDIENTS',
      stats:          L.stats,
      mealsSuffix:    L.mealsSuffix,
      minTotal:       L.minTotal,
      moreSuffix:     L.moreSuffix,
      tipLabel:       L.tipLabel,
      tipText:        L.tipText,
      pageOf:         L.pageOf,
      servingsWord:   L.servingsWord,
    };

    // Send the verified email so the SERVER can authorise the full 7-day PDF.
    // Security is enforced server-side: window.hasUnlimited above only trims
    // the payload for snappier UX — a free user (or a tampered flag) still
    // gets at most a 2-day preview because /api/generate-pdf re-checks premium.
    let email = window.verifiedEmail || null;
    if (!email) { try { email = localStorage.getItem('mp:lastEmail') || null; } catch (_) {} }

    return {
      lang,
      email: email || undefined,
      title:     lcStrings.title || 'Weekly Meal Plan',
      weekLabel: `${WEEK_OF[lang] || WEEK_OF.en} ${dateStr}`,
      days,
      shoppingGroups,
      labels,
      locked,
    };
  }

  // ── Export telemetry helpers ──
  // Structured JSON log line, prefix PDF_EXPORT_TELEMETRY, so QA can grep
  // a single regex in Safari Web Inspector. No PII: we log a Safari/iOS
  // boolean instead of the raw userAgent, no email/plan/recipe content.
  function _detectClient() {
    const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
    return {
      isSafari: /^((?!chrome|crios|fxios|android).)*safari/i.test(ua),
      isIOS:    /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
      isMobile: window.matchMedia && window.matchMedia('(max-width: 768px)').matches,
    };
  }
  function _logTelemetry(payload) {
    try {
      const client = _detectClient();
      const data = Object.assign({
        ts: Date.now(),
        ...client,
      }, payload);
      console.log('PDF_EXPORT_TELEMETRY ' + JSON.stringify(data));
    } catch (_) { /* never let telemetry break export */ }
  }

  async function exportShoppingListToPDF() {
    // Single PDF export path: POST the live planner state to
    // /api/generate-pdf and let @react-pdf render it server-side.
    // The legacy html2pdf branch was removed once pdfv2 went production
    // default; see git log for the rollback recipe if anyone ever needs
    // to bring it back.
    //
    // Arabic note: @react-pdf/textkit 6.3 still crashes on bidi reorder
    // for AR (jsx-pdf#2820). Until upstream ships a fix we surface a
    // friendly notice instead of letting the user click into a 500.
    // The blocked-language counter is the data point we'll use to
    // decide whether it's worth hand-rolling an alternative.
    const _t0 = (typeof performance !== 'undefined' && performance.now)
      ? performance.now() : Date.now();
    if (typeof lang === 'string' && lang === 'ar') {
      _logTelemetry({ engine:'pdfv2', status:'blocked', durationMs:0,
                      errorMessage:'lang=ar (textkit bidi bug)' });
      try { alert('PDF generation for Arabic is temporarily unavailable. We are tracking the upstream fix and will re-enable it as soon as it lands.'); } catch (_) {}
      return;
    }
    try {
      const _result = await exportViaPdfV2();
      const _ms = Math.round(((typeof performance !== 'undefined' && performance.now)
        ? performance.now() : Date.now()) - _t0);
      _logTelemetry({
        engine:         'pdfv2',
        status:         'ok',
        durationMs:     _ms,
        bytes:          _result && _result.bytes        || null,
        serverRenderMs: _result && _result.serverRenderMs || null,
      });
    } catch (err) {
      const _ms = Math.round(((typeof performance !== 'undefined' && performance.now)
        ? performance.now() : Date.now()) - _t0);
      console.error('PDF generation failed:', err);
      _logTelemetry({
        engine:       'pdfv2',
        status:       'error',
        durationMs:   _ms,
        errorMessage: (err && err.message) ? String(err.message).slice(0, 200)
                                            : String(err).slice(0, 200),
      });
      try { alert('PDF generation failed: ' + (err && err.message ? err.message : err) + '\n\nPlease try again in a moment.'); } catch (_) {}
    }
  }
// (legacy html2pdf helpers buildCleanPdfNode/maybeCompactToTwoPages/paginateCleanNode removed)
  // ── Filter definitions ────────────────────────────────────────
  const FILTER_DEFS = [
    { id: 'all',       labelKey: 'filter.all',  emoji: '🌍',
      test: () => true },
    { id: 'chicken',   labelKey: 'filter.chicken', emoji: '🍗',
      test: r => {
        const ingr = (r.ingredients?.ro || r.ingredients?.en || []).join(' ').toLowerCase();
        return /(pui|piept de pui|carne de pui|chicken|poultry)/.test(ingr);
      }
    },
    { id: 'meat',      labelKey: 'filter.meat', emoji: '🥩',
      test: r => {
        const ingr = (r.ingredients?.ro || r.ingredients?.en || []).join(' ').toLowerCase();
        return /(vit[ăa]|carne de vit|biftec|porc|cotlet|cârnați|miel|beef|pork|steak|lamb|veal)/.test(ingr)
          && !/(pui|piept de pui|chicken)/.test(ingr);
      }
    },
    { id: 'fish',      labelKey: 'filter.fish', emoji: '🐟',
      test: r => {
        const ingr = (r.ingredients?.ro || r.ingredients?.en || []).join(' ').toLowerCase();
        return /(pește|somon|ton\b|creveți|dorad|crap|macrou|tilapia|cod\b|fish|salmon|tuna|shrimp|prawn|trout|sea bass)/.test(ingr);
      }
    },
    { id: 'pasta',     labelKey: 'filter.pasta', emoji: '🍝',
      test: r => {
        const ingr = (r.ingredients?.ro || r.ingredients?.en || []).join(' ').toLowerCase();
        return /(paste|spaghete|penne|fettuccine|tagliatelle|macaroane|lasagna|gnocchi|pasta\b|noodle|orez\b|risotto|rice\b)/.test(ingr);
      }
    },
    { id: 'med',       labelKey: 'filter.med',  emoji: '🫒',
      test: r => ['Italia','Grecia','Franța','Spania','Turcia','Maroc','Portugalia','Croația'].includes(r.origin?.ro) },
    { id: 'asian',     labelKey: 'filter.asian', emoji: '🍜',
      test: r => ['Japonia','Coreea de Sud','China','Vietnam','Thailanda','India','Indonezia'].includes(r.origin?.ro) },
    { id: 'vegetarian',labelKey: 'filter.veg',   emoji: '🌱',
      test: r => {
        const ingr = (r.ingredients?.ro || r.ingredients?.en || []).join(' ').toLowerCase();
        return !/(pui|porc|vită|carne|pește|somon|ton|creveți|miel|beef|chicken|pork|fish|shrimp|lamb|bacon|prosciutto)/.test(ingr);
      }
    },
    { id: 'budget',    labelKey: 'filter.budget', emoji: '💰',
      test: () => false, isBudget: true },
    { id: 'quick',     labelKey: 'filter.quick',  emoji: '⚡',
      test: r => (r.time || 999) <= 30
    },
    { id: 'family',    labelKey: 'filter.family', emoji: '👨‍👩‍👧',
      test: r => r.tags?.includes('family')
    },
  ];

  const FILTER_LABELS = {
    ro: {
      'filter.all':'Toate',
      'filter.chicken':'Pui',
      'filter.meat':'Carne',
      'filter.fish':'Pește',
      'filter.pasta':'Paste & Orez',
      'filter.med':'Mediteranean',
      'filter.asian':'Asian',
      'filter.veg':'Vegetarian',
      'filter.budget':'Buget',
      'filter.quick':'Rapid',
      'filter.family':'Familie',
    },
    en: {
      'filter.all':'All',
      'filter.chicken':'Chicken',
      'filter.meat':'Meat',
      'filter.fish':'Fish',
      'filter.pasta':'Pasta & Rice',
      'filter.med':'Mediterranean',
      'filter.asian':'Asian',
      'filter.veg':'Vegetarian',
      'filter.budget':'Budget',
      'filter.quick':'Quick',
      'filter.family':'Family',
    },
    es: {
      'filter.all':'Todo',
      'filter.chicken':'Pollo',
      'filter.meat':'Carne',
      'filter.fish':'Pescado',
      'filter.pasta':'Pasta & Arroz',
      'filter.med':'Mediterráneo',
      'filter.asian':'Asiático',
      'filter.veg':'Vegetariano',
      'filter.budget':'Económico',
      'filter.quick':'Rápido',
      'filter.family':'Familia',
    },
    fr: {
      'filter.all':'Tout',
      'filter.chicken':'Poulet',
      'filter.meat':'Viande',
      'filter.fish':'Poisson',
      'filter.pasta':'Pâtes & Riz',
      'filter.med':'Méditerranéen',
      'filter.asian':'Asiatique',
      'filter.veg':'Végétarien',
      'filter.budget':'Économique',
      'filter.quick':'Rapide',
      'filter.family':'Famille',
    },
    de: {
      'filter.all':'Alle',
      'filter.chicken':'Hähnchen',
      'filter.meat':'Fleisch',
      'filter.fish':'Fisch',
      'filter.pasta':'Pasta & Reis',
      'filter.med':'Mediterran',
      'filter.asian':'Asiatisch',
      'filter.veg':'Vegetarisch',
      'filter.budget':'Günstig',
      'filter.quick':'Schnell',
      'filter.family':'Familie',
    },
    pt: {
      'filter.all':'Tudo',
      'filter.chicken':'Frango',
      'filter.meat':'Carne',
      'filter.fish':'Peixe',
      'filter.pasta':'Massa & Arroz',
      'filter.med':'Mediterrâneo',
      'filter.asian':'Asiático',
      'filter.veg':'Vegetariano',
      'filter.budget':'Económico',
      'filter.quick':'Rápido',
      'filter.family':'Família',
    },
    ru: {
      'filter.all':'Все',
      'filter.chicken':'Курица',
      'filter.meat':'Мясо',
      'filter.fish':'Рыба',
      'filter.pasta':'Паста & Рис',
      'filter.med':'Средиземное',
      'filter.asian':'Азиатское',
      'filter.veg':'Вегетарианское',
      'filter.budget':'Бюджетное',
      'filter.quick':'Быстро',
      'filter.family':'Семейное',
    },
    it: {
      'filter.all':'Tutto',
      'filter.chicken':'Pollo',
      'filter.meat':'Carne',
      'filter.fish':'Pesce',
      'filter.pasta':'Pasta & Riso',
      'filter.med':'Mediterraneo',
      'filter.asian':'Asiatico',
      'filter.veg':'Vegetariano',
      'filter.budget':'Economico',
      'filter.quick':'Veloce',
      'filter.family':'Famiglia',
    },
    tr: {
      'filter.all':'Tümü',
      'filter.chicken':'Tavuk',
      'filter.meat':'Et',
      'filter.fish':'Balık',
      'filter.pasta':'Makarna & Pilav',
      'filter.med':'Akdeniz',
      'filter.asian':'Asya',
      'filter.veg':'Vejetaryen',
      'filter.budget':'Ekonomik',
      'filter.quick':'Hızlı',
      'filter.family':'Aile',
    },
    zh: {
      'filter.all':'全部',
      'filter.chicken':'鸡肉',
      'filter.meat':'肉类',
      'filter.fish':'鱼类',
      'filter.pasta':'面食 & 米饭',
      'filter.med':'地中海',
      'filter.asian':'亚洲',
      'filter.veg':'素食',
      'filter.budget':'省钱',
      'filter.quick':'快手',
      'filter.family':'家庭',
    },
    ja: {
      'filter.all':'すべて',
      'filter.chicken':'チキン',
      'filter.meat':'お肉',
      'filter.fish':'魚介',
      'filter.pasta':'パスタ＆ライス',
      'filter.med':'地中海',
      'filter.asian':'アジア',
      'filter.veg':'ベジタリアン',
      'filter.budget':'節約',
      'filter.quick':'時短',
      'filter.family':'ファミリー',
    },
    ko: {
      'filter.all':'전체',
      'filter.chicken':'치킨',
      'filter.meat':'고기',
      'filter.fish':'생선',
      'filter.pasta':'파스타 & 밥',
      'filter.med':'지중해',
      'filter.asian':'아시아',
      'filter.veg':'채식',
      'filter.budget':'절약',
      'filter.quick':'빠른',
      'filter.family':'가족',
    },
    ar: {
      'filter.all':'الكل',
      'filter.chicken':'دجاج',
      'filter.meat':'لحم',
      'filter.fish':'سمك',
      'filter.pasta':'معكرونة وأرز',
      'filter.med':'متوسطي',
      'filter.asian':'آسيوي',
      'filter.veg':'نباتي',
      'filter.budget':'اقتصادي',
      'filter.quick':'سريع',
      'filter.family':'عائلي',
    },
    hi: {
      'filter.all':'सभी',
      'filter.chicken':'चिकन',
      'filter.meat':'मांस',
      'filter.fish':'मछली',
      'filter.pasta':'पास्ता & चावल',
      'filter.med':'भूमध्यसागरीय',
      'filter.asian':'एशियाई',
      'filter.veg':'शाकाहारी',
      'filter.budget':'सस्ता',
      'filter.quick':'जल्दी',
      'filter.family':'परिवार',
    },
    default: {
      'filter.all':'All',
      'filter.chicken':'Chicken',
      'filter.meat':'Meat',
      'filter.fish':'Fish',
      'filter.pasta':'Pasta & Rice',
      'filter.med':'Mediterranean',
      'filter.asian':'Asian',
      'filter.veg':'Vegetarian',
      'filter.budget':'Budget',
      'filter.quick':'Quick',
      'filter.family':'Family',
    },
  };
  window._activeFilter = window._activeFilter || 'all';

  // ── Live shopping list renderer ───────────────────────────────
  // Renders the SAME normalization-engine output the PDF uses
  // (shopping-list.js: quantity aggregation, unit normalization,
  // category grouping, localized labels) — previously the on-screen
  // list was a naive lowercase-dedup + alphabetical flat list while
  // the good engine only fed the PDF payload.
  const SHOPPING_CATEGORY_EMOJI = {
    vegetables: '🥬', meat: '🥩', dairy: '🥛', dry: '🌾',
    sauces: '🫙', bakery: '🍞', misc: '🧺', pantry: '🧂',
  };

  function updateShoppingList() {
    // Week-card stats (overview strip + per-day costs) share this exact
    // refresh path so they stay live on every input/generate/mode event.
    updateWeekOverview();
    const listEl = document.getElementById('shopping-list');
    if (!listEl) return;
    const meals   = collectMeals();
    let   totalCost = 0;
    let   matchedRecipes = 0;

    // Hybrid-B alignment, same as buildPdfV2Payload(): the EN string
    // drives parsing/canonical/category/quantity math (English-only
    // engine); the locale string at the SAME index supplies the
    // localized display label.
    const ingredientPairs = [];
    meals.forEach(m => {
      [m.lunch, m.dinner].forEach(mealText => {
        if (!mealText) return;
        const recipeName = extractRecipeName(mealText).toLowerCase();
        const rec = (window.recipes || []).find(r => recipeNameMatches(r, lang, recipeName));
        if (!rec) return;
        matchedRecipes++;
        if (rec.costRon) totalCost += rec.costRon;
        const enArr  = rec.ingredients?.en || rec.ingredients?.ro || [];
        const locArr = rec.ingredients?.[lang] || enArr;
        enArr.forEach((en, i) => {
          ingredientPairs.push({ en, loc: locArr[i] != null ? locArr[i] : en });
        });
      });
    });

    let shoppingGroups = [];
    try { shoppingGroups = buildShoppingFromRawIngredients(ingredientPairs, lang); }
    catch (_) { shoppingGroups = []; }

    // Show/hide cost summary bar
    let costSummary = document.getElementById('shopping-cost-summary');
    if (totalCost > 0) {
      if (!costSummary) {
        costSummary = document.createElement('div');
        costSummary.id = 'shopping-cost-summary';
        costSummary.className = 'shopping-cost-summary';
        listEl.parentElement?.insertBefore(costSummary, listEl);
      }
      const lbl = i18n[lang];
      costSummary.innerHTML =
        `<span class="cost-icon">💰</span>
         <span>${lbl?.estWeeklyCost || 'Cost estimat săptămână'}: <strong>${formatCost(totalCost)}</strong></span>
         <span class="cost-sub">${matchedRecipes} ${lbl?.mealsFound || 'mese găsite'}</span>`;
      costSummary.style.display = 'flex';
    } else if (costSummary) {
      costSummary.style.display = 'none';
    }

    const countEl = document.getElementById('shopping-toggle-count');
    const totalItems = shoppingGroups.reduce((n, g) => n + (g.items?.length || 0), 0);
    if (totalItems === 0) {
      listEl.innerHTML = '';
      listEl.setAttribute('data-empty', 'true');
      if (countEl) countEl.textContent = '';
      return;
    }
    listEl.removeAttribute('data-empty');
    const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
    listEl.innerHTML = shoppingGroups.map(g => {
      const emoji = SHOPPING_CATEGORY_EMOJI[g.id] || '🛒';
      const items = (g.items || []).map(it =>
        `<li class="shopping-item">
           <label class="shopping-label">
             <input type="checkbox" class="shopping-check">
             <span class="shopping-name">${cap(it.name)}</span>
             ${it.qty ? `<span class="shopping-qty">${it.qty}</span>` : ''}
           </label>
         </li>`
      ).join('');
      return `<li class="shopping-group">
        <div class="shopping-group-title">
          <span class="sg-emoji" aria-hidden="true">${emoji}</span>
          <span>${g.label || g.id || ''}</span>
        </div>
        <ul class="shopping-group-items list-unstyled">${items}</ul>
      </li>`;
    }).join('');
    if (countEl) countEl.textContent = String(totalItems);
  }

  // ── Recipe meta chips (time / cost / tags) under each meal input ──────────
  function getRecipeByInput(inputVal) {
    if (!inputVal) return null;
    const name = extractRecipeName(inputVal).toLowerCase();
    return (window.recipes || []).find(r => recipeNameMatches(r, lang, name)) || null;
  }

  function renderRecipeMeta(rec) {
    if (!rec) return '';
    const parts = [];
    if (rec.time)   parts.push(`<span class="rmeta-chip rmeta-time">⏱️ ${rec.time} min</span>`);
    if (rec.costRon) parts.push(`<span class="rmeta-chip rmeta-cost">💰 ${formatCost(rec.costRon)}</span>`);
    if (rec.tags?.length) {
      // max 3 tags for consistent layout
      rec.tags.slice(0, 3).forEach(tagId => {
        const label = (TAG_LABELS[tagId] || {})[lang] || (TAG_LABELS[tagId] || {}).en || tagId;
        const emoji = { quick:'⚡', budget:'💲', vegetarian:'🌱', vegan:'🌿',
                        'high-protein':'💪', family:'👨‍👩‍👧', healthy:'🥗',
                        spicy:'🌶️', 'one-pot':'🍲' }[tagId] || '';
        parts.push(`<span class="rmeta-chip rmeta-tag">${emoji} ${label}</span>`);
      });
    }
    if (!parts.length) return '';
    // Description, capped at 90 chars. Source priority: authored desc → the
    // recipe's own intro prose (originText, clean and descriptive) → a method
    // step ONLY as a last resort, and only if it reads like a sentence — this
    // avoids surfacing terse fragments like "Rinse 1." as a description.
    let descTxt = rec.desc?.[lang] || rec.desc?.en || '';
    if (!descTxt) {
      const intro = rec.originText?.[lang] || rec.originText?.en || '';
      if (intro) descTxt = intro.split(/(?<=[.!?])\s/)[0].trim();
    }
    if (!descTxt && rec.howIsMade) {
      const raw = rec.howIsMade[lang] || rec.howIsMade.ro || rec.howIsMade.en || '';
      const first = raw.split(/[.!?]/)[0].trim();
      if (first.length >= 25) {
        descTxt = first;
        if (rec.time) descTxt += `. ${(READY_IN[lang] || READY_IN.en)(rec.time)}.`;
      }
    }
    if (descTxt.length > 90) descTxt = descTxt.slice(0, 88) + '…';
    return `<div class="recipe-meta-row">${parts.join('')}${descTxt ? `<span class="rmeta-desc">${descTxt}</span>` : ''}</div>`;
  }

  function updateAllRecipeMeta() {
    for (let day = 1; day <= 7; day++) {
      ['l','c'].forEach(type => {
        const input = document.getElementById(`d${day}${type}`);
        if (!input) return;
        // Day 2/3: filled slots show the 🎲/✕ actions (CSS keys off .pw-filled)
        // and the recipe-name button; empty slots show the add button. Covers
        // every fill path — typing, dictation, generate, deep links — since
        // they all funnel through this refresh. No-op in table mode.
        syncSlotDisplay(input);
        const metaId = `rmeta-d${day}${type}`;
        let metaEl = document.getElementById(metaId);
        const rec = getRecipeByInput(input.value);
        const html = renderRecipeMeta(rec);
        if (html) {
          if (!metaEl) {
            metaEl = document.createElement('div');
            metaEl.id = metaId;
            input.parentElement?.appendChild(metaEl);
          }
          metaEl.innerHTML = html;
          metaEl.style.display = '';
        } else if (metaEl) {
          metaEl.style.display = 'none';
        }
      });
    }
  }

  // ── Cost estimate display ─────────────────────────────────────
  const COST_RON = { all:200, med:240, asian:250, budget:130, vegetarian:170, quick:180, family:190, latin:220, eastern:190, worldtour:210,
                     chicken:210, meat:230, fish:220, pasta:160 };

  // Currency display: RON for Romanian, EUR for everyone else — consistent with
  // the €3 Premium price and the € shown on the SEO/plan pages (was USD "$",
  // which clashed with the rest of the product).
  function formatCost(ron) {
    if (lang === 'ro') return `~${ron} RON`;
    const eur = Math.round(ron / 4.97); // ~1 EUR ≈ 4.97 RON
    return `~€${eur}`;
  }
  function showCostEstimate(filterId) {
    // Week mode renders the card Week Overview, which computes EST. COST from
    // the REAL plan (sum of matched recipes' costRon). This bar's COST_RON
    // table is a static per-filter guess and contradicted it on screen
    // (~€40 vs ~€60) — one calculation everywhere (PLANNER_BRAIN_SPEC §6),
    // so in week mode the static bar stays hidden and the overview owns the
    // number. 'meal'/'day' modes have no overview and keep the bar.
    if ((window._planMode || 'week') === 'week') {
      const existing = document.getElementById('cost-estimate-bar');
      if (existing) existing.style.display = 'none';
      return;
    }
    let costBar = document.getElementById('cost-estimate-bar');
    if (!costBar) {
      costBar = document.createElement('div');
      costBar.id = 'cost-estimate-bar';
      costBar.className = 'cost-estimate-bar';
      const bar = document.getElementById('auto-menu-bar');
      if (bar) bar.appendChild(costBar);
    }
    const weeklyRon = COST_RON[filterId] || 200;
    const mode = window._planMode || 'week';
    // 14 meals/week → 1 meal ≈ 1/14, 1 day (lunch+dinner) ≈ 1/7
    const ron = mode === 'meal' ? Math.round(weeklyRon / 14)
              : mode === 'day'  ? Math.round(weeklyRon / 7)
              : weeklyRon;
    const lbls = i18n[lang] || i18n.en || {};
    const unit = mode === 'meal' ? (lbls.perMeal || 'meal')
               : mode === 'day'  ? (lbls.perDay  || 'day · 2 people')
               : (lbls.perWeek || 'săptămână · 2 persoane');
    costBar.innerHTML = `<i class="bi bi-currency-exchange"></i> <strong>${lbls.costEstimate || 'Cost estimat'}: ${formatCost(ron)}</strong> / ${unit}`;
    costBar.style.display = 'flex';
  }

  function renderModeToggle(bar) {
    let modeRow = document.getElementById('plan-mode-row');
    if (!modeRow) {
      modeRow = document.createElement('div');
      modeRow.id = 'plan-mode-row';
      modeRow.className = 'plan-mode-row';
      bar.insertBefore(modeRow, bar.firstChild);
    }
    const modes = ['meal', 'day', 'week'];
    modeRow.innerHTML = modes.map(m =>
      `<button class="mode-btn${window._planMode === m ? ' active' : ''}" data-mode="${m}" type="button">
        ${t(`mode.${m}`)}
       </button>`
    ).join('');
    modeRow.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window._planMode = btn.dataset.mode;
        renderModeToggle(bar);
        renderTable();
        updateAutoMenuBtn();
        updateShoppingList();
        updateExportSectionVisibility();
        showCostEstimate(window._activeFilter);
      });
    });
  }

  function updateAutoMenuBtn() {
    const autoBtn = document.getElementById('auto-menu-btn');
    if (!autoBtn) return;
    const mode = window._planMode;
    const label = t(`mode.btn.${mode}`);
    // For 'meal' the i18n label already starts with ✨ (Surprise me); for the
    // other modes prepend the shuffle icon. Avoids the duplicate-sparkle bug.
    if (mode === 'meal') {
      autoBtn.innerHTML = label;
    } else {
      autoBtn.innerHTML = `<i class="bi bi-shuffle" aria-hidden="true"></i> ${label}`;
    }
  }

  function attachAutoMenuBtn() {
    const bar = document.getElementById('auto-menu-bar');
    if (!bar) return;

    // ── Mode toggle (O masă / O zi / O săptămână) ─────────────
    renderModeToggle(bar);

    // ── Filter chips ──────────────────────────────────────────
    let chipRow = document.getElementById('filter-chip-row');
    if (!chipRow) {
      chipRow = document.createElement('div');
      chipRow.id = 'filter-chip-row';
      chipRow.className = 'filter-chip-row';
      bar.insertBefore(chipRow, bar.firstChild);
    }

    // ── Eyebrow header (premium polish) ───────────────────────
    let header = document.getElementById('auto-menu-header');
    if (!header) {
      header = document.createElement('div');
      header.id = 'auto-menu-header';
      header.className = 'auto-menu-header';
      bar.insertBefore(header, bar.firstChild);
    }
    const headerLabel = t('autoMenu.header') !== 'autoMenu.header'
      ? t('autoMenu.header')
      : (lang === 'ro' ? 'Generator inteligent' : 'Smart generator');
    header.innerHTML = `<span class="header-icon" aria-hidden="true">✨</span><span>${headerLabel}</span>`;
    const labels = FILTER_LABELS[lang] || FILTER_LABELS.default;
    chipRow.innerHTML = FILTER_DEFS.map(f =>
      `<button class="filter-chip${window._activeFilter===f.id?' active':''}" data-filter="${f.id}" type="button" aria-pressed="${window._activeFilter===f.id}">
         ${f.emoji} ${labels[f.labelKey] || f.id}
       </button>`
    ).join('');
    chipRow.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        window._activeFilter = btn.dataset.filter;
        const isBudget = FILTER_DEFS.find(f => f.id === window._activeFilter)?.isBudget || false;
        window.isBudgetMenu = isBudget;
        const cbEl = document.getElementById('budget-menu-toggle');
        if (cbEl) cbEl.checked = isBudget;
        chipRow.querySelectorAll('.filter-chip').forEach(b => {
          b.classList.toggle('active', b.dataset.filter === window._activeFilter);
          b.setAttribute('aria-pressed', b.dataset.filter === window._activeFilter);
        });
        showCostEstimate(window._activeFilter);
      });
    });

    // ── Generate button ───────────────────────────────────────
    let autoBtn = document.getElementById('auto-menu-btn');
    if (!autoBtn) {
      autoBtn = document.createElement('button');
      autoBtn.id = 'auto-menu-btn';
      autoBtn.type = 'button';
      autoBtn.className = 'btn btn-autofill';
      autoBtn.setAttribute('data-i18n', 'btn.autoMenu');
      bar.appendChild(autoBtn);
    }
    updateAutoMenuBtn();
    autoBtn.onclick = async () => {
      // Re-entry guard: generation is async (dynamic recipe import), so a
      // double-click must not fire two plan_generated events. Fire the event
      // only AFTER generation actually succeeds — not on the pool-too-small
      // early return and not before the async work completes.
      if (autoBtn._generating) return;
      autoBtn._generating = true;
      try {
        const ok = await generateRandomMenu();
        updateShoppingList();
        showCostEstimate(window._activeFilter);
        if (ok && window.mpTrack) window.mpTrack('plan_generated', { filter: window._activeFilter || 'all' });
      } finally {
        autoBtn._generating = false;
      }
    };

    // ── Budget checkbox (hidden, kept for compatibility) ──────
    let budgetWrap = document.getElementById('budget-menu-wrap');
    if (!budgetWrap) {
      budgetWrap = document.createElement('div');
      budgetWrap.id = 'budget-menu-wrap';
      budgetWrap.style.display = 'none'; // hidden — filter chips replace it
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.id = 'budget-menu-toggle';
      cb.addEventListener('change', () => { window.isBudgetMenu = cb.checked; });
      budgetWrap.appendChild(cb);
      bar.appendChild(budgetWrap);
    }
    const cbEl = document.getElementById('budget-menu-toggle');
    if (cbEl) cbEl.checked = !!window.isBudgetMenu;

    // ── Wire up input change → live shopping list + recipe meta ──
    document.querySelectorAll('#plan-table input, #plan-cards input').forEach(inp => {
      if (!inp.dataset.shopListener) {
        inp.addEventListener('input', () => {
          updateShoppingList();
          clearTimeout(inp._metaTimer);
          inp._metaTimer = setTimeout(updateAllRecipeMeta, 120);
        });
        inp.dataset.shopListener = '1';
      }
    });
    // Initial meta render (deferred so DOM is stable)
    setTimeout(updateAllRecipeMeta, 150);
  }
// (legacy html2pdf CDN loader removed — pdfv2 is the only PDF export path.)

  function attachPdfListeners() {
  // Both Generate PDF buttons route through exportShoppingListToPDF — the
  // single dispatcher. The server-side @react-pdf endpoint is the only
  // export path now, so there's no CDN preload to wait for.
  const freeBtn = document.getElementById('generate-btn');
  if (freeBtn && !freeBtn.dataset.attached) {
    freeBtn.onclick = () => {
      if (window.mpTrack) window.mpTrack('pdf_click', { tier: 'free' });
      exportShoppingListToPDF();
    };
    freeBtn.dataset.attached = '1';
  }
  // butonul plătit apare dinamic
  if (resultDiv && !resultDiv.dataset.observing) {
    const obs = new MutationObserver(() => {
      const paidBtn = document.getElementById('paid-generate-pdf');
      if (paidBtn && !paidBtn.dataset.attached) {
        paidBtn.onclick = () => {
          if (window.mpTrack) window.mpTrack('pdf_click', { tier: 'premium' });
          exportShoppingListToPDF();
        };
        paidBtn.dataset.attached = '1';
      }
    });
    obs.observe(resultDiv, { childList: true, subtree: true });
    resultDiv.dataset.observing = '1';
  }
}
  function updateButtonState() {
  const generateBtn = document.getElementById('generate-btn');
  if (!generateBtn || !buyBtn || !statusEl) return;

  const isPremium = !!window.hasUnlimited;

  // Free button always visible; label changes based on plan
  generateBtn.style.display = 'inline-block';
  if (!isPremium) {
    const t = k => (i18n[lang] && i18n[lang][k]) || (i18n['en'] && i18n['en'][k]) || k;
    generateBtn.innerHTML = '<i class="bi bi-file-earmark-pdf-fill"></i> ' + t('btn.generate')
      + ` <span style="font-size:0.72em; opacity:0.75; font-weight:400;">(${t('pdf.free.label')})</span>`;
  }

  // Premium upgrade button: show for non-premium users (as secondary CTA alongside free)
  buyBtn.style.display = isPremium ? 'none' : 'inline-block';
  if (currencySelUI) currencySelUI.style.display = isPremium ? 'none' : 'inline-block';

  // Clear old "maxed" message — no longer needed since free is always allowed
  statusEl.innerHTML = '';
}
(function setSeasonTheme(){
  const now = new Date();
  const m = now.getMonth(); // 0..11
  const isWinter = (m === 11 || m === 0); // Decembrie sau Ianuarie
  document.body.classList.toggle('theme-winter', isWinter);
})();

/* ─── LANDING PAGE SECTIONS ────────────────────────────────── */

function renderProductPreview() {
  const ID = 'product-preview-section';
  // Remove existing so language switch re-renders with new language
  document.getElementById(ID)?.remove();

  const ro = lang === 'ro';
  const menusUrl = (i18n[lang] && i18n[lang].menusUrl) || `/${lang}/meniu-saptamanal/`;

  // Per-language copy
  const copy = {
    ro: {
      eyebrow: 'Cum funcționează',
      heading: 'Tot ce îți trebuie,\nîn trei pași simpli',
      sub: 'Fără cont, fără abonament. Totul în browser.',
      steps: [
        { icon:'🥗', n:1, title:'Alege mesele',    desc:'Completează manual sau generează automat o săptămână întreagă cu un singur click.' },
        { icon:'🛒', n:2, title:'Lista apare instant', desc:'Ingredientele se centralizează automat, sortate gata de dus la cumpărături.' },
        { icon:'📄', n:3, title:'Descarcă PDF',    desc:'Un PDF elegant cu tot planul și lista — gata de printat sau trimis pe telefon.' },
      ],
      cta1: '🥗 Planifică acum — gratuit',
      cta2: '📅 Meniuri săptămânale',
    },
    en: {
      eyebrow: 'How it works',
      heading: 'Everything you need,\nin three simple steps',
      sub: 'No account, no subscription. Everything in your browser.',
      steps: [
        { icon:'🥗', n:1, title:'Choose your meals',   desc:'Fill in manually or auto-generate a full week in one click. Mix and match as you like.' },
        { icon:'🛒', n:2, title:'Shopping list ready', desc:'Ingredients are compiled automatically and sorted — ready to take to the store.' },
        { icon:'📄', n:3, title:'Download PDF',        desc:'A beautifully formatted PDF with your full plan and shopping list — ready to print or share.' },
      ],
      cta1: '🥗 Plan now — free',
      cta2: '📅 Weekly menus',
    },
    es: {
      eyebrow: 'Cómo funciona',
      heading: 'Todo lo que necesitas,\nen tres pasos',
      sub: 'Sin cuenta, sin suscripción. Todo en tu navegador.',
      steps: [
        { icon:'🥗', n:1, title:'Elige tus comidas',    desc:'Completa manualmente o genera automáticamente una semana entera con un clic.' },
        { icon:'🛒', n:2, title:'Lista lista al instante', desc:'Los ingredientes se recopilan automáticamente y se ordenan para ir al mercado.' },
        { icon:'📄', n:3, title:'Descarga PDF',         desc:'Un PDF elegante con tu plan completo y lista de compras — listo para imprimir o compartir.' },
      ],
      cta1: '🥗 Planificar ahora — gratis',
      cta2: '📅 Menús semanales',
    },
    fr: {
      eyebrow: 'Comment ça marche',
      heading: 'Tout ce qu\'il vous faut,\nen trois étapes',
      sub: 'Sans compte, sans abonnement. Tout dans votre navigateur.',
      steps: [
        { icon:'🥗', n:1, title:'Choisissez vos repas',     desc:'Remplissez manuellement ou générez automatiquement une semaine entière en un clic.' },
        { icon:'🛒', n:2, title:'Liste prête en un instant', desc:'Les ingrédients sont compilés automatiquement et triés pour faire vos courses.' },
        { icon:'📄', n:3, title:'Téléchargez le PDF',       desc:'Un PDF élégant avec votre plan complet et votre liste de courses — prêt à imprimer ou partager.' },
      ],
      cta1: '🥗 Planifier maintenant',
      cta2: '📅 Menus hebdomadaires',
    },
    de: {
      eyebrow: 'So funktioniert es',
      heading: 'Alles was Sie brauchen,\nin drei Schritten',
      sub: 'Kein Konto, kein Abo. Alles im Browser.',
      steps: [
        { icon:'🥗', n:1, title:'Mahlzeiten wählen',     desc:'Manuell ausfüllen oder mit einem Klick automatisch eine ganze Woche generieren.' },
        { icon:'🛒', n:2, title:'Einkaufsliste sofort',  desc:'Zutaten werden automatisch zusammengestellt und sortiert — bereit zum Einkaufen.' },
        { icon:'📄', n:3, title:'PDF herunterladen',     desc:'Ein elegantes PDF mit Ihrem vollständigen Plan und Einkaufsliste — bereit zum Drucken oder Teilen.' },
      ],
      cta1: '🥗 Jetzt planen — kostenlos',
      cta2: '📅 Wochenpläne',
    },
    pt: {
      eyebrow: 'Como funciona',
      heading: 'Tudo o que você precisa,\nem três passos simples',
      sub: 'Sem conta, sem assinatura. Tudo no seu navegador.',
      steps: [
        { icon:'🥗', n:1, title:'Escolha suas refeições',  desc:'Preencha manualmente ou gere automaticamente uma semana completa com um clique.' },
        { icon:'🛒', n:2, title:'Lista pronta na hora',    desc:'Os ingredientes são compilados automaticamente e ordenados para as compras.' },
        { icon:'📄', n:3, title:'Baixar PDF',              desc:'Um PDF elegante com seu plano completo e lista de compras — pronto para imprimir ou compartilhar.' },
      ],
      cta1: '🥗 Planificar agora — grátis',
      cta2: '📅 Planos semanais',
    },
    ru: {
      eyebrow: 'Как это работает',
      heading: 'Всё необходимое,\nза три простых шага',
      sub: 'Без аккаунта и подписки. Всё в браузере.',
      steps: [
        { icon:'🥗', n:1, title:'Выберите блюда',        desc:'Заполните вручную или автоматически сгенерируйте целую неделю одним кликом.' },
        { icon:'🛒', n:2, title:'Список готов мгновенно', desc:'Ингредиенты собираются автоматически и сортируются для похода в магазин.' },
        { icon:'📄', n:3, title:'Скачать PDF',            desc:'Красивый PDF с полным планом и списком покупок — готов к печати или отправке.' },
      ],
      cta1: '🥗 Планировать — бесплатно',
      cta2: '📅 Еженедельные меню',
    },
    it: {
      eyebrow: 'Come funziona',
      heading: 'Tutto ciò di cui hai bisogno,\nin tre semplici passi',
      sub: 'Nessun account, nessun abbonamento. Tutto nel browser.',
      steps: [
        { icon:'🥗', n:1, title:'Scegli i tuoi pasti',      desc:'Compila manualmente o genera automaticamente una settimana intera con un clic.' },
        { icon:'🛒', n:2, title:'Lista pronta all\'istante', desc:'Gli ingredienti vengono compilati e ordinati automaticamente per la spesa.' },
        { icon:'📄', n:3, title:'Scarica il PDF',            desc:'Un elegante PDF con il tuo piano completo e lista della spesa — pronto da stampare o condividere.' },
      ],
      cta1: '🥗 Pianifica ora — gratis',
      cta2: '📅 Menu settimanali',
    },
    tr: {
      eyebrow: 'Nasıl çalışır',
      heading: 'İhtiyacınız olan her şey,\nüç basit adımda',
      sub: 'Hesap yok, abonelik yok. Her şey tarayıcınızda.',
      steps: [
        { icon:'🥗', n:1, title:'Öğünleri seçin',           desc:'Manuel olarak doldurun veya tek tıklamayla otomatik olarak tam bir hafta oluşturun.' },
        { icon:'🛒', n:2, title:'Liste anında hazır',        desc:'Malzemeler otomatik olarak derlenir ve alışveriş için sıralanır.' },
        { icon:'📄', n:3, title:'PDF indir',                 desc:'Tam planınız ve alışveriş listenizle zarif bir PDF — yazdırmaya veya paylaşmaya hazır.' },
      ],
      cta1: '🥗 Şimdi planla — ücretsiz',
      cta2: '📅 Haftalık menüler',
    },
    ar: {
      eyebrow: 'كيف يعمل',
      heading: 'كل ما تحتاجه،\nفي ثلاث خطوات بسيطة',
      sub: 'بدون حساب، بدون اشتراك. كل شيء في متصفحك.',
      steps: [
        { icon:'🥗', n:1, title:'اختر وجباتك',            desc:'أضف يدويًا أو أنشئ أسبوعًا كاملاً تلقائيًا بنقرة واحدة.' },
        { icon:'🛒', n:2, title:'قائمة التسوق جاهزة فوراً', desc:'يتم تجميع المكونات تلقائيًا ومرتبة للتسوق.' },
        { icon:'📄', n:3, title:'تحميل PDF',               desc:'ملف PDF أنيق مع خطتك الكاملة وقائمة التسوق — جاهز للطباعة أو المشاركة.' },
      ],
      cta1: '🥗 ابدأ التخطيط — مجاناً',
      cta2: '📅 القوائم الأسبوعية',
    },
    zh: {
      eyebrow: '使用方法',
      heading: '您所需的一切，\n三个简单步骤',
      sub: '无需账户，无需订阅。一切都在浏览器中完成。',
      steps: [
        { icon:'🥗', n:1, title:'选择您的餐食',   desc:'手动填写或一键自动生成整周计划。' },
        { icon:'🛒', n:2, title:'购物清单即刻生成', desc:'食材自动汇总并排序，随时可去购物。' },
        { icon:'📄', n:3, title:'下载PDF',         desc:'格式精美的PDF包含完整计划和购物清单 — 可打印或分享。' },
      ],
      cta1: '🥗 立即规划 — 免费',
      cta2: '📅 每周菜单',
    },
    ja: {
      eyebrow: '使い方',
      heading: '必要なものすべて、\n3つの簡単なステップで',
      sub: 'アカウント不要、サブスクリプション不要。すべてブラウザで。',
      steps: [
        { icon:'🥗', n:1, title:'食事を選ぶ',           desc:'手動で入力するか、ワンクリックで1週間分を自動生成。' },
        { icon:'🛒', n:2, title:'買い物リストがすぐ完成', desc:'食材が自動でまとめられ、買い物に行けるよう整理されます。' },
        { icon:'📄', n:3, title:'PDFをダウンロード',      desc:'完全なプランと買い物リストが入った美しいPDF — 印刷や共有に最適。' },
      ],
      cta1: '🥗 今すぐ計画 — 無料',
      cta2: '📅 週間メニュー',
    },
    ko: {
      eyebrow: '사용 방법',
      heading: '필요한 모든 것,\n세 가지 간단한 단계로',
      sub: '계정 불필요, 구독 불필요. 모든 것이 브라우저에서.',
      steps: [
        { icon:'🥗', n:1, title:'식사 선택',            desc:'직접 입력하거나 클릭 한 번으로 한 주 전체를 자동 생성하세요.' },
        { icon:'🛒', n:2, title:'장보기 목록 즉시 완성', desc:'재료가 자동으로 정리되고 쇼핑에 맞게 정렬됩니다.' },
        { icon:'📄', n:3, title:'PDF 다운로드',          desc:'완전한 계획과 장보기 목록이 담긴 예쁜 PDF — 인쇄하거나 공유할 준비 완료.' },
      ],
      cta1: '🥗 지금 계획 — 무료',
      cta2: '📅 주간 메뉴',
    },
    hi: {
      eyebrow: 'यह कैसे काम करता है',
      heading: 'आपको जो चाहिए सब कुछ,\nतीन सरल चरणों में',
      sub: 'कोई खाता नहीं, कोई सदस्यता नहीं। सब कुछ ब्राउज़र में।',
      steps: [
        { icon:'🥗', n:1, title:'भोजन चुनें',            desc:'मैन्युअल रूप से भरें या एक क्लिक से पूरे सप्ताह को स्वचालित रूप से बनाएं।' },
        { icon:'🛒', n:2, title:'सूची तुरंत तैयार',      desc:'सामग्री स्वचालित रूप से एकत्र और खरीदारी के लिए व्यवस्थित की जाती है।' },
        { icon:'📄', n:3, title:'PDF डाउनलोड करें',      desc:'आपकी पूरी योजना और खरीदारी सूची के साथ एक सुंदर PDF — प्रिंट करने या साझा करने के लिए तैयार।' },
      ],
      cta1: '🥗 अभी योजना बनाएं — मुफ़्त',
      cta2: '📅 साप्ताहिक मेनू',
    },
  };

  const c = copy[lang] || copy.en;

  const html = `
    <section id="${ID}" class="product-preview-section no-print" aria-labelledby="preview-section-heading">
      <div class="product-preview-inner">
        <div class="preview-section-eyebrow">${safeText(c.eyebrow)}</div>
        <h2 id="preview-section-heading" class="preview-section-heading">${safeText(c.heading).replace('\n','<br>')}</h2>
        <p class="preview-section-sub">${safeText(c.sub)}</p>
        <div class="steps-grid">
          ${(c.steps || []).map(s => `
          <div class="step-item">
            <div class="step-icon-wrap">
              <span class="step-num">${safeText(s.n)}</span>
              ${safeText(s.icon, '🍽️')}
            </div>
            <h3 class="step-title">${safeText(s.title)}</h3>
            <p class="step-desc">${safeText(s.desc)}</p>
          </div>`).join('')}
        </div>
        <div class="preview-cta-group">
          <button class="btn-preview-primary" id="preview-cta-scroll">${safeText(c.cta1)}</button>
          <a href="${menusUrl}" class="btn-preview-outline">${safeText(c.cta2)}</a>
        </div>
      </div>
    </section>`;

  const heroEl = document.querySelector('.hero');
  if (heroEl) heroEl.insertAdjacentHTML('afterend', html);

  document.getElementById('preview-cta-scroll')?.addEventListener('click', () => {
    document.getElementById('planner-anchor-section')?.scrollIntoView({ behavior:'smooth', block:'start' });
  });
}

function renderDiscovery() {
  const ID = 'discovery-section';
  // Remove existing so language switch re-renders with new language
  document.getElementById(ID)?.remove();

  const ro = lang === 'ro';
  const menusUrl   = `/${lang}/${ro ? 'meniu-saptamanal' : 'weekly-menu'}/`;
  const recipesUrl = `/${lang}/${ro ? 'retete' : 'recipes'}/`;

  // Correct URL per language — these MUST match the actual generated route
  // slugs from scripts/generate-content.mjs LANG_CONFIGS / RECIPE_LANG. The
  // previous table had stale english "weekly-menu" placeholders for 7
  // locales (ar/en/es/fr/hi/ko/zh) and a typo on zh recipes ("shpu" /
  // mojibake "yori-beoب"), all of which produced 404s.
  const lc = lang;
  const baseUrls = {
    ro: { menus:'meniu-saptamanal',  recipes:'retete' },
    en: { menus:'weekly-meal-plan',  recipes:'recipes' },
    es: { menus:'plan-semanal',      recipes:'recetas' },
    fr: { menus:'plan-semaine',      recipes:'recettes' },
    de: { menus:'wochenplan',        recipes:'rezepte' },
    pt: { menus:'plano-semanal',     recipes:'receitas' },
    ru: { menus:'nedelnoe-menyu',    recipes:'retsepty' },
    ar: { menus:'khitat-usbuiya',    recipes:'wasafat' },
    zh: { menus:'zhoujicaidan',      recipes:'shipu' },
    ja: { menus:'weekly-menu',       recipes:'reshipi' },
    ko: { menus:'jugan-menu',        recipes:'recipes' },
    hi: { menus:'weekly-plan',       recipes:'recipes' },
    tr: { menus:'haftalik-menu',     recipes:'tarifler' },
    it: { menus:'piano-settimanale', recipes:'ricette' },
  };
  const urls = baseUrls[lc] || baseUrls.en;
  const mUrl = `/${lc}/${urls.menus}/`;
  const rUrl = `/${lc}/${urls.recipes}/`;

  const discoveryCopy = {
    ro: {
      title: 'Explorează și inspiră-te',
      sub:   `${PLAN_COUNT} meniuri complete săptămânale și ${RECIPE_COUNT_ROUND}+ rețete internaționale`,
      m_title: 'Meniuri Săptămânale',
      m_desc: `${PLAN_COUNT} planuri complete — Mediteranean, Asian, Vegetarian, Buget și altele — cu liste de cumpărături incluse.`,
      m_cta:  'Explorează meniurile →',
      r_title: `${RECIPE_COUNT_ROUND}+ Rețete Internaționale`,
      r_desc: 'Rețete autentice din 70+ țări cu ingrediente, mod de preparare, valori nutriționale și sfaturi.',
      r_cta:  'Descoperă rețetele →',
    },
    en: {
      title: 'Explore and get inspired',
      sub:   `${PLAN_COUNT} complete weekly menus and ${RECIPE_COUNT_ROUND}+ international recipes`,
      m_title: 'Weekly Menus',
      m_desc: `${PLAN_COUNT} complete plans — Mediterranean, Asian, Vegetarian, Budget and more — with shopping lists included.`,
      m_cta:  'Explore menus →',
      r_title: `${RECIPE_COUNT_ROUND}+ International Recipes`,
      r_desc: 'Authentic recipes from 70+ countries with ingredients, instructions, nutrition info and tips.',
      r_cta:  'Discover recipes →',
    },
    es: {
      title: 'Explora e inspírate',
      sub:   `${PLAN_COUNT} menús semanales completos y ${RECIPE_COUNT_ROUND}+ recetas internacionales`,
      m_title: 'Menús Semanales',
      m_desc: `${PLAN_COUNT} planes completos — Mediterráneo, Asiático, Vegetariano, Económico y más — con listas de compras.`,
      m_cta:  'Explorar menús →',
      r_title: `${RECIPE_COUNT_ROUND}+ Recetas Internacionales`,
      r_desc: 'Recetas auténticas de 70+ países con ingredientes, preparación, nutrición y consejos.',
      r_cta:  'Descubrir recetas →',
    },
    fr: {
      title: 'Explorez et inspirez-vous',
      sub:   `${PLAN_COUNT} menus hebdomadaires complets et ${RECIPE_COUNT_ROUND}+ recettes internationales`,
      m_title: 'Menus Hebdomadaires',
      m_desc: `${PLAN_COUNT} plans complets — Méditerranéen, Asiatique, Végétarien, Budget et plus — avec listes de courses.`,
      m_cta:  'Explorer les menus →',
      r_title: `${RECIPE_COUNT_ROUND}+ Recettes Internationales`,
      r_desc: 'Recettes authentiques de 70+ pays avec ingrédients, instructions, nutrition et conseils.',
      r_cta:  'Découvrir les recettes →',
    },
    de: {
      title: 'Entdecken und inspirieren lassen',
      sub:   `${PLAN_COUNT} vollständige Wochenpläne und ${RECIPE_COUNT_ROUND}+ internationale Rezepte`,
      m_title: 'Wochenpläne',
      m_desc: `${PLAN_COUNT} vollständige Pläne — Mediterran, Asiatisch, Vegetarisch, Budget und mehr — mit Einkaufslisten.`,
      m_cta:  'Pläne erkunden →',
      r_title: `${RECIPE_COUNT_ROUND}+ Internationale Rezepte`,
      r_desc: 'Authentische Rezepte aus 70+ Ländern mit Zutaten, Anleitung, Nährwerten und Tipps.',
      r_cta:  'Rezepte entdecken →',
    },
    pt: {
      title: 'Explore e inspire-se',
      sub:   `${PLAN_COUNT} planos semanais completos e ${RECIPE_COUNT_ROUND}+ receitas internacionais`,
      m_title: 'Planos Semanais',
      m_desc: `${PLAN_COUNT} planos completos — Mediterrâneo, Asiático, Vegetariano, Econômico e mais — com listas de compras.`,
      m_cta:  'Explorar planos →',
      r_title: `${RECIPE_COUNT_ROUND}+ Receitas Internacionais`,
      r_desc: 'Receitas autênticas de 70+ países com ingredientes, preparo, nutrição e dicas.',
      r_cta:  'Descobrir receitas →',
    },
    ru: {
      title: 'Исследуйте и вдохновляйтесь',
      sub:   `${PLAN_COUNT} полных недельных меню и ${RECIPE_COUNT_ROUND}+ международных рецептов`,
      m_title: 'Еженедельные меню',
      m_desc: `${PLAN_COUNT} полных планов — Средиземноморский, Азиатский, Вегетарианский, Бюджетный и другие — со списками.`,
      m_cta:  'Просмотреть меню →',
      r_title: `${RECIPE_COUNT_ROUND}+ Международных рецептов`,
      r_desc: 'Аутентичные рецепты из 70+ стран с ингредиентами, приготовлением, нутриентами и советами.',
      r_cta:  'Открыть рецепты →',
    },
    it: {
      title: 'Esplora e ispirati',
      sub:   `${PLAN_COUNT} menu settimanali completi e ${RECIPE_COUNT_ROUND}+ ricette internazionali`,
      m_title: 'Menu Settimanali',
      m_desc: `${PLAN_COUNT} piani completi — Mediterraneo, Asiatico, Vegetariano, Budget e altro — con liste della spesa.`,
      m_cta:  'Esplora i menu →',
      r_title: `${RECIPE_COUNT_ROUND}+ Ricette Internazionali`,
      r_desc: 'Ricette autentiche da 70+ paesi con ingredienti, preparazione, valori nutrizionali e consigli.',
      r_cta:  'Scopri le ricette →',
    },
    tr: {
      title: 'Keşfet ve ilham al',
      sub:   `${PLAN_COUNT} tam haftalık menü ve ${RECIPE_COUNT_ROUND}+ uluslararası tarif`,
      m_title: 'Haftalık Menüler',
      m_desc: `${PLAN_COUNT} tam plan — Akdeniz, Asya, Vejetaryen, Bütçe ve daha fazlası — alışveriş listeleriyle birlikte.`,
      m_cta:  'Menüleri keşfet →',
      r_title: `${RECIPE_COUNT_ROUND}+ Uluslararası Tarif`,
      r_desc: '70+ ülkeden otantik tarifler: malzemeler, yapılış, besin değerleri ve ipuçlarıyla.',
      r_cta:  'Tarifleri keşfet →',
    },
    ar: {
      title: 'استكشف واستلهم',
      sub:   `${PLAN_COUNT} قوائم أسبوعية كاملة و${RECIPE_COUNT_ROUND}+ وصفة دولية`,
      m_title: 'القوائم الأسبوعية',
      m_desc: `${PLAN_COUNT} خطط كاملة — متوسطية، آسيوية، نباتية، اقتصادية وأكثر — مع قوائم التسوق.`,
      m_cta:  'استكشف القوائم →',
      r_title: `+${RECIPE_COUNT_ROUND} وصفة دولية`,
      r_desc: 'وصفات أصيلة من 70+ دولة مع المكونات وطريقة التحضير والقيم الغذائية.',
      r_cta:  'اكتشف الوصفات →',
    },
    zh: {
      title: '探索并获得灵感',
      sub:   `${PLAN_COUNT}个完整的周计划和${RECIPE_COUNT_ROUND}+国际食谱`,
      m_title: '每周菜单',
      m_desc: `${PLAN_COUNT}个完整计划 — 地中海、亚洲、素食、经济型等 — 附购物清单。`,
      m_cta:  '探索菜单 →',
      r_title: `${RECIPE_COUNT_ROUND}+国际食谱`,
      r_desc: '来自70+国家的正宗食谱，包含食材、做法、营养信息和小贴士。',
      r_cta:  '发现食谱 →',
    },
    ja: {
      title: '探索してインスピレーションを得よう',
      sub:   `${PLAN_COUNT}つの完全な週間メニューと${RECIPE_COUNT_ROUND}以上の国際的なレシピ`,
      m_title: '週間メニュー',
      m_desc: `${PLAN_COUNT}つの完全なプラン — 地中海、アジア、ベジタリアン、節約など — 買い物リスト付き。`,
      m_cta:  'メニューを探索 →',
      r_title: `${RECIPE_COUNT_ROUND}以上の国際レシピ`,
      r_desc: '70以上の国からの本格レシピ。材料・作り方・栄養価・コツ付き。',
      r_cta:  'レシピを発見 →',
    },
    ko: {
      title: '탐색하고 영감을 얻으세요',
      sub:   `${PLAN_COUNT}가지 완전한 주간 메뉴와 ${RECIPE_COUNT_ROUND}개 이상의 국제 레시피`,
      m_title: '주간 메뉴',
      m_desc: `${PLAN_COUNT}가지 완전한 플랜 — 지중해, 아시아, 채식, 절약 등 — 장보기 목록 포함.`,
      m_cta:  '메뉴 탐색 →',
      r_title: `${RECIPE_COUNT_ROUND}+ 국제 레시피`,
      r_desc: '70개 이상의 나라에서 온 정통 레시피. 재료, 조리법, 영양 정보, 팁 포함.',
      r_cta:  '레시피 발견 →',
    },
    hi: {
      title: 'खोजें और प्रेरणा लें',
      sub:   `${PLAN_COUNT} पूर्ण साप्ताहिक मेनू और ${RECIPE_COUNT_ROUND}+ अंतर्राष्ट्रीय व्यंजन`,
      m_title: 'साप्ताहिक मेनू',
      m_desc: `${PLAN_COUNT} पूर्ण योजनाएं — भूमध्यसागरीय, एशियाई, शाकाहारी, बजट और अधिक — खरीदारी सूची के साथ।`,
      m_cta:  'मेनू देखें →',
      r_title: `${RECIPE_COUNT_ROUND}+ अंतर्राष्ट्रीय व्यंजन`,
      r_desc: '70+ देशों से प्रामाणिक व्यंजन। सामग्री, विधि, पोषण और सुझाव सहित।',
      r_cta:  'व्यंजन खोजें →',
    },
  };
  const s = discoveryCopy[lc] || discoveryCopy.en;

  const html = `
    <section id="${ID}" class="discovery-section no-print" aria-labelledby="discovery-title">
      <div class="discovery-inner">
        <h2 id="discovery-title" class="discovery-title">${safeText(s.title)}</h2>
        <p class="discovery-sub">${safeText(s.sub)}</p>
        <div class="discovery-cards">
          <a href="${mUrl}" class="discovery-card">
            <div class="discovery-card-icon">${safeText(s.m_icon, '📅')}</div>
            <div class="discovery-card-title">${safeText(s.m_title)}</div>
            <div class="discovery-card-desc">${safeText(s.m_desc)}</div>
            <div class="discovery-card-cta">${safeText(s.m_cta)}</div>
          </a>
          <a href="${rUrl}" class="discovery-card">
            <div class="discovery-card-icon">${safeText(s.r_icon, '🍽️')}</div>
            <div class="discovery-card-title">${safeText(s.r_title)}</div>
            <div class="discovery-card-desc">${safeText(s.r_desc)}</div>
            <div class="discovery-card-cta">${safeText(s.r_cta)}</div>
          </a>
        </div>
      </div>
    </section>`;

  document.getElementById('product-preview-section')?.insertAdjacentHTML('afterend', html);
}

function renderPlannerAnchor() {
  const ID = 'planner-anchor-section';
  // Remove existing so language switch re-renders with new language
  document.getElementById(ID)?.remove();

  const anchorCopy = {
    ro: { title: 'Planifică acum — gratuit',          sub: 'Completează mesele sau generează automat o săptămână întreagă' },
    en: { title: 'Start planning — free',              sub: 'Fill in your meals or auto-generate a full week' },
    es: { title: 'Empieza a planificar — gratis',      sub: 'Completa tus comidas o genera automáticamente una semana entera' },
    fr: { title: 'Planifiez maintenant — gratuit',     sub: 'Remplissez vos repas ou générez automatiquement une semaine' },
    de: { title: 'Jetzt planen — kostenlos',           sub: 'Mahlzeiten ausfüllen oder automatisch eine Woche generieren' },
    pt: { title: 'Planifique agora — grátis',          sub: 'Preencha suas refeições ou gere automaticamente uma semana' },
    ru: { title: 'Начать планирование — бесплатно',   sub: 'Заполните блюда или автоматически создайте неделю' },
    it: { title: 'Inizia a pianificare — gratis',      sub: 'Aggiungi i pasti o genera automaticamente una settimana' },
    tr: { title: 'Şimdi planla — ücretsiz',            sub: 'Öğünleri doldurun veya otomatik olarak bir hafta oluşturun' },
    ar: { title: 'ابدأ التخطيط — مجاناً',              sub: 'أضف وجباتك أو أنشئ أسبوعاً تلقائياً' },
    zh: { title: '立即规划 — 免费',                    sub: '填写餐食或自动生成一周计划' },
    ja: { title: '今すぐプラン作成 — 無料',            sub: '食事を入力するか、1週間を自動生成' },
    ko: { title: '지금 계획 시작 — 무료',              sub: '식사를 입력하거나 자동으로 일주일 생성' },
    hi: { title: 'अभी योजना बनाएं — मुफ़्त',           sub: 'भोजन भरें या स्वचालित रूप से एक सप्ताह बनाएं' },
  };
  const a = anchorCopy[lang] || anchorCopy.en;

  const html = `
    <section id="${ID}" class="planner-anchor-section no-print" aria-labelledby="planner-anchor-title">
      <div id="planner-anchor-title" class="planner-anchor-title">${safeText(a.title)}</div>
      <div class="planner-anchor-sub">${safeText(a.sub)}</div>
    </section>`;

  const main = document.querySelector('.app-main');
  if (main) main.insertAdjacentHTML('beforebegin', html);
}

function injectHeroSecondaryCta() { /* replaced by renderPremiumHero */ }

function renderPremiumHero() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  // Always re-render on language switch — no guard that blocks re-runs
  hero.dataset.premium = '1';

  // Must match actual generator route slugs (LANG_CONFIGS / RECIPE_LANG).
  const menusBase = {
    ro:'meniu-saptamanal', en:'weekly-meal-plan', es:'plan-semanal', fr:'plan-semaine',
    de:'wochenplan', pt:'plano-semanal', ru:'nedelnoe-menyu', it:'piano-settimanale',
    tr:'haftalik-menu', ar:'khitat-usbuiya', zh:'zhoujicaidan', ja:'weekly-menu',
    ko:'jugan-menu', hi:'weekly-plan',
  };
  const recipesBase = {
    ro:'retete', en:'recipes', es:'recetas', fr:'recettes', de:'rezepte',
    pt:'receitas', ru:'retsepty', ar:'wasafat', zh:'shipu', ja:'reshipi',
    ko:'recipes', hi:'recipes', tr:'tarifler', it:'ricette',
  };
  const mSeg = menusBase[lang] || 'weekly-menu';
  const rSeg = recipesBase[lang] || 'recipes';
  const mUrl = `/${lang}/${mSeg}/`;
  const rUrl = `/${lang}/${rSeg}/`;

  // Per-language strings (ro primary, en fallback for rest)
  const copy = {
    ro: {
      badge: 'Gratuit · Fără înregistrare · 14 limbi',
      line1: 'Mâncă bine,',
      line2: 'în fiecare',
      line3: 'săptămână.',
      sub: 'Plan complet în câteva secunde.\nListă de cumpărături automată. PDF gratuit.',
      stat1n:`${RECIPE_COUNT_ROUND}+`, stat1l:'Rețete',
      stat2n:'14',   stat2l:'Limbi',
      stat3n:'€3',   stat3l:'Premium',
      cta: '🥗 Creează Planul Meu',
      ghost: 'Explorează meniuri →',
      planLabel: 'Planul Săptămânal',
      colDay:'Ziua', colL:'Prânz', colD:'Cină', shLabel:'Listă cumpărături',
      accentTitle: 'Listă generată automat',
      accentSub: 'Adaugă la telefon cu un click',
      meals:[
        ['Luni',  '🍝 Spaghete carbonara', '🥗 Salată grecească'],
        ['Marți', '🍲 Ciorbă de legume',   '🍗 Pui la cuptor'],
        ['Miercuri','🥘 Risotto ciuperci', '🐟 Somon cu lămâie'],
        ['Joi',   '🌮 Tacos de vită',      '🥩 Salată cu ton'],
      ],
      chips:['paste','ouă','parmezan','roșii','feta','ciuperci','pui','lămâie'],
    },
    en: {
      badge: 'Free · No signup · 14 languages',
      line1: 'Eat well,',
      line2: 'every single',
      line3: 'week.',
      sub: 'Full plan in seconds.\nAuto shopping list. Free PDF download.',
      stat1n:`${RECIPE_COUNT_ROUND}+`, stat1l:'Recipes',
      stat2n:'14',   stat2l:'Languages',
      stat3n:'€3',   stat3l:'Premium',
      cta: '🥗 Create My Free Plan',
      ghost: 'Explore menus →',
      planLabel: 'Weekly Plan',
      colDay:'Day', colL:'Lunch', colD:'Dinner', shLabel:'Shopping list',
      accentTitle: 'Auto-generated list',
      accentSub: 'Download as PDF in one click',
      meals:[
        ['Monday',  '🍝 Spaghetti carbonara', '🥗 Greek salad'],
        ['Tuesday', '🍲 Vegetable soup',       '🍗 Roasted chicken'],
        ['Wednesday','🥘 Mushroom risotto',    '🐟 Lemon salmon'],
        ['Thursday','🌮 Beef tacos',           '🥩 Tuna salad'],
      ],
      chips:['pasta','eggs','parmesan','tomatoes','feta','mushrooms','chicken','lemon'],
    },
    es: {
      badge: 'Gratis · Sin registro · 14 idiomas',
      line1: 'Come bien,',
      line2: 'cada',
      line3: 'semana.',
      sub: 'Plan completo en segundos.\nLista de compras automática. PDF gratis.',
      stat1n:`${RECIPE_COUNT_ROUND}+`, stat1l:'Recetas',
      stat2n:'14',   stat2l:'Idiomas',
      stat3n:'€3',   stat3l:'Premium',
      cta: '🥗 Crear Mi Plan Gratis',
      ghost: 'Explorar menús →',
      planLabel: 'Plan Semanal',
      colDay:'Día', colL:'Almuerzo', colD:'Cena', shLabel:'Lista de compras',
      accentTitle: 'Lista generada automáticamente',
      accentSub: 'Descarga PDF gratis',
      meals:[
        ['Lunes','🥘 Paella valenciana','🥗 Ensalada mixta'],
        ['Martes','🍲 Gazpacho','🍗 Pollo al horno'],
        ['Miércoles','🌮 Tacos de ternera','🥩 Tortilla española'],
        ['Jueves','🍝 Pasta boloñesa','🐟 Salmón al limón'],
      ],
      chips:['arroz','tomates','pollo','aceite','cebolla','ajo','limón','huevos'],
    },
    fr: {
      badge: 'Gratuit · Sans inscription · 14 langues',
      line1: 'Mangez bien,',
      line2: 'chaque',
      line3: 'semaine.',
      sub: 'Plan complet en quelques secondes.\nListe de courses automatique. PDF gratuit.',
      stat1n:`${RECIPE_COUNT_ROUND}+`, stat1l:'Recettes',
      stat2n:'14',   stat2l:'Langues',
      stat3n:'€3',   stat3l:'Premium',
      cta: '🥗 Créer Mon Plan Gratuit',
      ghost: 'Explorer les menus →',
      planLabel: 'Plan Hebdomadaire',
      colDay:'Jour', colL:'Déjeuner', colD:'Dîner', shLabel:'Liste de courses',
      accentTitle: 'Liste générée automatiquement',
      accentSub: 'Télécharger en PDF gratuitement',
      meals:[
        ['Lundi','🥐 Quiche lorraine','🍲 Soupe à l\'oignon'],
        ['Mardi','🐟 Sole meunière','🥗 Salade niçoise'],
        ['Mercredi','🍝 Pasta bolognaise','🍗 Poulet rôti'],
        ['Jeudi','🥘 Cassoulet','🧀 Croque-monsieur'],
      ],
      chips:['beurre','oeufs','farine','tomates','poulet','ail','herbes','vin'],
    },
    de: {
      badge: 'Kostenlos · Keine Anmeldung · 14 Sprachen',
      line1: 'Gut essen,',
      line2: 'jede',
      line3: 'Woche.',
      sub: 'Vollständiger Plan in Sekunden.\nEinkaufsliste automatisch. PDF kostenlos.',
      stat1n:`${RECIPE_COUNT_ROUND}+`, stat1l:'Rezepte',
      stat2n:'14',   stat2l:'Sprachen',
      stat3n:'€3',   stat3l:'Premium',
      cta: '🥗 Meinen Plan Erstellen',
      ghost: 'Menüs erkunden →',
      planLabel: 'Wochenplan',
      colDay:'Tag', colL:'Mittagessen', colD:'Abendessen', shLabel:'Einkaufsliste',
      accentTitle: 'Automatisch generiert',
      accentSub: 'PDF kostenlos herunterladen',
      meals:[
        ['Montag','🥩 Schnitzel','🥗 Salat'],
        ['Dienstag','🍲 Linsensuppe','🍗 Hähnchen'],
        ['Mittwoch','🥘 Eintopf','🐟 Lachs'],
        ['Donnerstag','🌭 Currywurst','🥙 Döner'],
      ],
      chips:['Kartoffeln','Zwiebeln','Hähnchen','Möhren','Mehl','Butter','Eier','Käse'],
    },
    pt: {
      badge: 'Gratuito · Sem cadastro · 14 idiomas',
      line1: 'Coma bem,',
      line2: 'todas as',
      line3: 'semanas.',
      sub: 'Plano completo em segundos.\nLista de compras automática. PDF gratuito.',
      stat1n:`${RECIPE_COUNT_ROUND}+`, stat1l:'Receitas',
      stat2n:'14',   stat2l:'Idiomas',
      stat3n:'€3',   stat3l:'Premium',
      cta: '🥗 Criar Meu Plano Grátis',
      ghost: 'Explorar planos →',
      planLabel: 'Plano Semanal',
      colDay:'Dia', colL:'Almoço', colD:'Jantar', shLabel:'Lista de compras',
      accentTitle: 'Lista gerada automaticamente',
      accentSub: 'Baixar PDF gratuitamente',
      meals:[
        ['Segunda','🍝 Massa carbonara','🥗 Salada grega'],
        ['Terça','🍲 Sopa de legumes','🍗 Frango assado'],
        ['Quarta','🥘 Risoto de cogumelos','🐟 Salmão ao limão'],
        ['Quinta','🌮 Tacos de carne','🥩 Salada de atum'],
      ],
      chips:['massa','ovos','parmesão','tomates','frango','cogumelos','limão','arroz'],
    },
    ru: {
      badge: 'Бесплатно · Без регистрации · 14 языков',
      line1: 'Питайтесь',
      line2: 'хорошо',
      line3: 'каждую неделю.',
      sub: 'Полный план за секунды.\nСписок покупок автоматически. PDF бесплатно.',
      stat1n:`${RECIPE_COUNT_ROUND}+`, stat1l:'Рецептов',
      stat2n:'14',   stat2l:'Языков',
      stat3n:'€3',   stat3l:'Премиум',
      cta: '🥗 Создать Мой План',
      ghost: 'Просмотреть меню →',
      planLabel: 'Недельный план',
      colDay:'День', colL:'Обед', colD:'Ужин', shLabel:'Список покупок',
      accentTitle: 'Список создан автоматически',
      accentSub: 'Скачать PDF бесплатно',
      meals:[
        ['Понедельник','🍲 Борщ','🥗 Оливье'],
        ['Вторник','🍝 Паста','🍗 Курица'],
        ['Среда','🥘 Плов','🐟 Лосось'],
        ['Четверг','🌮 Пельмени','🥩 Салат'],
      ],
      chips:['картофель','морковь','курица','рис','лук','масло','яйца','сыр'],
    },
    it: {
      badge: 'Gratuito · Senza registrazione · 14 lingue',
      line1: 'Mangia bene,',
      line2: 'ogni',
      line3: 'settimana.',
      sub: 'Piano completo in pochi secondi.\nLista della spesa automatica. PDF gratuito.',
      stat1n:`${RECIPE_COUNT_ROUND}+`, stat1l:'Ricette',
      stat2n:'14',   stat2l:'Lingue',
      stat3n:'€3',   stat3l:'Premium',
      cta: '🥗 Crea Il Mio Piano Gratis',
      ghost: 'Esplora i menu →',
      planLabel: 'Piano Settimanale',
      colDay:'Giorno', colL:'Pranzo', colD:'Cena', shLabel:'Lista della spesa',
      accentTitle: 'Lista generata automaticamente',
      accentSub: 'Scarica PDF gratuitamente',
      meals:[
        ['Lunedì','🍝 Pasta carbonara','🥗 Insalata greca'],
        ['Martedì','🍲 Minestrone','🍗 Pollo arrosto'],
        ['Mercoledì','🥘 Risotto ai funghi','🐟 Salmone al limone'],
        ['Giovedì','🌮 Tacos di manzo','🥩 Insalata tonno'],
      ],
      chips:['pasta','uova','parmigiano','pomodori','pollo','funghi','limone','riso'],
    },
    tr: {
      badge: 'Ücretsiz · Kayıt yok · 14 dil',
      line1: 'Her hafta',
      line2: 'iyi',
      line3: 'yiyin.',
      sub: 'Saniyeler içinde tam plan.\nOtomatik alışveriş listesi. Ücretsiz PDF.',
      stat1n:`${RECIPE_COUNT_ROUND}+`, stat1l:'Tarif',
      stat2n:'14',   stat2l:'Dil',
      stat3n:'€3',   stat3l:'Premium',
      cta: '🥗 Planımı Oluştur',
      ghost: 'Menüleri keşfet →',
      planLabel: 'Haftalık Plan',
      colDay:'Gün', colL:'Öğle', colD:'Akşam', shLabel:'Alışveriş listesi',
      accentTitle: 'Otomatik oluşturuldu',
      accentSub: 'PDF ücretsiz indirin',
      meals:[
        ['Pazartesi','🥘 Mercimek çorbası','🥗 Çoban salatası'],
        ['Salı','🍝 Makarna','🍗 Izgara tavuk'],
        ['Çarşamba','🌮 Döner','🥩 Kebap'],
        ['Perşembe','🍲 Güveç','🐟 Balık'],
      ],
      chips:['tavuk','pirinç','domates','soğan','biber','zeytinyağı','yumurta','peynir'],
    },
    ar: {
      badge: 'مجاني · بدون تسجيل · 14 لغة',
      line1: 'تناول طعاماً',
      line2: 'صحياً كل',
      line3: 'أسبوع.',
      sub: 'خطة كاملة في ثوانٍ.\nقائمة تسوق تلقائية. PDF مجاني.',
      stat1n:`${RECIPE_COUNT_ROUND}+`, stat1l:'وصفة',
      stat2n:'14',   stat2l:'لغة',
      stat3n:'€3',   stat3l:'بريميوم',
      cta: '🥗 إنشاء خطتي المجانية',
      ghost: 'استكشف القوائم →',
      planLabel: 'الخطة الأسبوعية',
      colDay:'اليوم', colL:'الغداء', colD:'العشاء', shLabel:'قائمة التسوق',
      accentTitle: 'قائمة تلقائية جاهزة',
      accentSub: 'تحميل PDF مجاناً',
      meals:[
        ['الاثنين','🍲 شوربة عدس','🥗 سلطة فتوش'],
        ['الثلاثاء','🥘 كبسة','🍗 دجاج مشوي'],
        ['الأربعاء','🌮 شاورما','🥩 كفتة'],
        ['الخميس','🍝 مكرونة','🐟 سمك'],
      ],
      chips:['أرز','دجاج','طماطم','بصل','زيت زيتون','بيض','جبنة','خضروات'],
    },
    zh: {
      badge: '免费 · 无需注册 · 14种语言',
      line1: '每周',
      line2: '吃得',
      line3: '好。',
      sub: '几秒内生成完整计划。\n自动购物清单。免费PDF下载。',
      stat1n:`${RECIPE_COUNT_ROUND}+`, stat1l:'食谱',
      stat2n:'14',   stat2l:'语言',
      stat3n:'€3',   stat3l:'高级版',
      cta: '🥗 创建我的免费计划',
      ghost: '探索菜单 →',
      planLabel: '每周计划',
      colDay:'日期', colL:'午餐', colD:'晚餐', shLabel:'购物清单',
      accentTitle: '自动生成清单',
      accentSub: '免费下载PDF',
      meals:[
        ['周一','🍜 牛肉拉面','🥗 凉拌黄瓜'],
        ['周二','🥘 红烧肉','🍗 白切鸡'],
        ['周三','🌮 水饺','🥩 回锅肉'],
        ['周四','🍝 炒面','🐟 清蒸鱼'],
      ],
      chips:['大米','鸡肉','豆腐','白菜','葱','姜','蒜','酱油'],
    },
    ja: {
      badge: '無料 · 登録不要 · 14言語',
      line1: '毎週、',
      line2: 'おいしく',
      line3: '食べよう。',
      sub: '数秒でフルプラン完成。\n買い物リスト自動生成。PDF無料ダウンロード。',
      stat1n:`${RECIPE_COUNT_ROUND}+`, stat1l:'レシピ',
      stat2n:'14',   stat2l:'言語',
      stat3n:'€3',   stat3l:'プレミアム',
      cta: '🥗 無料プランを作成',
      ghost: 'メニューを探索 →',
      planLabel: '週間プラン',
      colDay:'曜日', colL:'昼食', colD:'夕食', shLabel:'買い物リスト',
      accentTitle: 'リスト自動生成',
      accentSub: 'PDFを無料ダウンロード',
      meals:[
        ['月曜日','🍜 ラーメン','🥗 サラダ'],
        ['火曜日','🍱 弁当','🍗 唐揚げ'],
        ['水曜日','🥘 カレー','🐟 焼き魚'],
        ['木曜日','🌮 餃子','🥩 しゃぶしゃぶ'],
      ],
      chips:['鶏肉','米','豆腐','にんじん','たまご','醤油','みりん','味噌'],
    },
    ko: {
      badge: '무료 · 가입 불필요 · 14개 언어',
      line1: '매주,',
      line2: '잘',
      line3: '먹으세요.',
      sub: '몇 초 만에 전체 플랜 완성.\n자동 장보기 목록. 무료 PDF 다운로드.',
      stat1n:`${RECIPE_COUNT_ROUND}+`, stat1l:'레시피',
      stat2n:'14',   stat2l:'언어',
      stat3n:'€3',   stat3l:'프리미엄',
      cta: '🥗 무료 플랜 만들기',
      ghost: '메뉴 탐색 →',
      planLabel: '주간 플랜',
      colDay:'요일', colL:'점심', colD:'저녁', shLabel:'장보기 목록',
      accentTitle: '자동 생성된 목록',
      accentSub: 'PDF 무료 다운로드',
      meals:[
        ['월요일','🍜 라면','🥗 김치'],
        ['화요일','🍱 비빔밥','🍗 치킨'],
        ['수요일','🥘 된장찌개','🐟 생선구이'],
        ['목요일','🌮 만두','🥩 불고기'],
      ],
      chips:['쌀','닭고기','두부','달걀','당근','간장','참기름','김치'],
    },
    hi: {
      badge: 'मुफ़्त · बिना पंजीकरण · 14 भाषाएं',
      line1: 'हर हफ्ते',
      line2: 'अच्छा',
      line3: 'खाएं।',
      sub: 'कुछ सेकंड में पूरी योजना।\nस्वचालित खरीदारी सूची। मुफ़्त PDF डाउनलोड।',
      stat1n:`${RECIPE_COUNT_ROUND}+`, stat1l:'व्यंजन',
      stat2n:'14',   stat2l:'भाषाएं',
      stat3n:'€3',     stat3l:'प्रीमियम',
      cta: '🥗 मेरी मुफ़्त योजना बनाएं',
      ghost: 'मेनू देखें →',
      planLabel: 'साप्ताहिक योजना',
      colDay:'दिन', colL:'दोपहर का खाना', colD:'रात का खाना', shLabel:'खरीदारी सूची',
      accentTitle: 'स्वचालित रूप से बनाई गई सूची',
      accentSub: 'PDF मुफ़्त डाउनलोड करें',
      meals:[
        ['सोमवार','🍲 दाल','🥗 सलाद'],
        ['मंगलवार','🥘 बिरयानी','🍗 चिकन करी'],
        ['बुधवार','🌮 रोटी+सब्जी','🥩 मटन'],
        ['गुरुवार','🍝 पास्ता','🐟 मछली'],
      ],
      chips:['चावल','दाल','आटा','आलू','प्याज','टमाटर','हल्दी','मसाले'],
    },
  };

  const s = copy[lang] || copy.en;
  const wds = (i18n[lang] && i18n[lang].weekdays);
  // If we have i18n weekdays, use them for the meal day names
  const meals = s.meals.map((row, i) => [wds ? wds[i] : row[0], row[1], row[2]]);

  hero.innerHTML = `
    <div class="hero-premium-inner no-print">
      <div class="hero-text-col">
        <div class="hero-badge">
          <span class="badge-pulse" aria-hidden="true"></span>
          ${safeText(s.badge)}
        </div>
        <h1 class="hero-premium-title">${
          // Phase 12 — wrap each word in a .hp-reveal-word span carrying
          // a --reveal-index so CSS can stagger the fade-up. Line breaks
          // are preserved between line1/2/3 so the editorial layout still
          // breathes the way the typography was designed for.
          (() => {
            let idx = 0;
            const wrap = (text, italic) => safeText(text).split(/\s+/).filter(Boolean).map(w => {
              const span = `<span class="hp-reveal-word" style="--reveal-index:${idx++}">${italic ? '<em>' + w + '</em>' : w}</span>`;
              return span;
            }).join(' ');
            return [wrap(s.line1, false), wrap(s.line2, false), wrap(s.line3, true)].join('<br>');
          })()
        }</h1>
        <p class="hero-premium-sub">${safeText(s.sub).replace('\n','<br>')}</p>
        <div class="hero-stats-row" aria-label="Key stats">
          <div class="hero-stat">
            <span class="hero-stat-num" data-count-target="${safeText(s.stat1n)}">${safeText(s.stat1n)}</span>
            <span class="hero-stat-label">${safeText(s.stat1l)}</span>
          </div>
          <span class="hero-stat-sep" aria-hidden="true">·</span>
          <div class="hero-stat">
            <span class="hero-stat-num" data-count-target="${safeText(s.stat2n)}">${safeText(s.stat2n)}</span>
            <span class="hero-stat-label">${safeText(s.stat2l)}</span>
          </div>
          <span class="hero-stat-sep" aria-hidden="true">·</span>
          <div class="hero-stat">
            <span class="hero-stat-num" data-count-target="${safeText(s.stat3n)}">${safeText(s.stat3n)}</span>
            <span class="hero-stat-label">${safeText(s.stat3l)}</span>
          </div>
        </div>
        <div class="hero-premium-cta">
          <button class="btn-hero-cta" id="hero-cta-btn" type="button">${safeText(s.cta)}</button>
          <a href="${mUrl}" class="hero-ghost-link">${safeText(s.ghost)}</a>
          ${window.hasUnlimited ? '' : `<a href="${NAV_PRICING_LINKS[lang] || NAV_PRICING_LINKS.en}" class="hero-premium-link">${safeText(HERO_PREMIUM_LINK[lang] || HERO_PREMIUM_LINK.en)}</a>`}
        </div>
      </div>

      <div class="hero-visual-col" aria-hidden="true">
        <div class="hero-phone-wrap">
          <div class="hero-phone-frame">
            <div class="hero-phone-notch"></div>
            <div class="hero-phone-screen">
              <div class="phone-app-bar">
                <span class="phone-app-title">📋 ${safeText(s.planLabel)}</span>
                <span class="phone-app-pdf-btn">PDF ↓</span>
              </div>
              <div class="phone-meal-header">
                <span>${safeText(s.colDay)}</span><span>${safeText(s.colL)}</span><span>${safeText(s.colD)}</span>
              </div>
              ${meals.map(([d,l,c], i) => {
                // Mockup mirrors the free preview: first 2 days visible,
                // remaining days faded with a lock — matches the 2-of-7
                // free PDF behavior so the visual doesn't oversell.
                const locked = i >= 2;
                const rowStyle = locked ? ' style="opacity:0.35;"' : '';
                const dayPrefix = locked ? '🔒 ' : '';
                return `
              <div class="phone-meal-row"${rowStyle}>
                <span class="phone-meal-day">${dayPrefix}${safeText(d)}</span>
                <span class="phone-meal-name">${safeText(l)}</span>
                <span class="phone-meal-name">${safeText(c)}</span>
              </div>`;
              }).join('')}
              <div class="phone-shopping">
                <div class="phone-shopping-title">🛒 ${safeText(s.shLabel)}</div>
                <div class="phone-chips">
                  ${(s.chips || []).map(c=>`<span class="phone-chip">${safeText(c)}</span>`).join('')}
                </div>
              </div>
            </div>
          </div>
          <div class="hero-food-accent">
            <div class="hero-food-accent-icon">✨</div>
            <div>
              <div class="hero-food-accent-title">${safeText(s.accentTitle)}</div>
              <div class="hero-food-accent-sub">${safeText(s.accentSub)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  // Re-attach CTA button listener every render (hero innerHTML replaced the element)
  document.getElementById('hero-cta-btn')?.addEventListener('click', () => {
    const autoBtn = document.getElementById('auto-menu-btn');
    if (autoBtn) autoBtn.click();
    setTimeout(() => {
      (document.getElementById('planner-anchor-section') || document.querySelector('.app-main'))
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  });
}
/* ─── END LANDING PAGE SECTIONS ────────────────────────────── */

function renderTrustSignals() {
  const ID = 'hp-trust-signals';
  document.getElementById(ID)?.remove();

  const copy = {
    ro: ['🔓 Fără înregistrare', '🛡️ Plăți Stripe securizate', '🌍 Funcționează în orice browser', '↩️ Anulezi oricând'],
    en: ['🔓 No signup needed', '🛡️ Stripe-secured payments', '🌍 Works in any browser', '↩️ Cancel anytime'],
    es: ['🔓 Sin registro', '🛡️ Pagos seguros con Stripe', '🌍 Funciona en cualquier navegador', '↩️ Cancela cuando quieras'],
    fr: ['🔓 Sans inscription', '🛡️ Paiements sécurisés par Stripe', '🌍 Marche dans tout navigateur', '↩️ Annulez à tout moment'],
    de: ['🔓 Keine Anmeldung', '🛡️ Stripe-gesicherte Zahlungen', '🌍 Funktioniert in jedem Browser', '↩️ Jederzeit kündbar'],
    pt: ['🔓 Sem cadastro', '🛡️ Pagamentos seguros via Stripe', '🌍 Funciona em qualquer navegador', '↩️ Cancele quando quiser'],
    ru: ['🔓 Без регистрации', '🛡️ Безопасная оплата Stripe', '🌍 Работает в любом браузере', '↩️ Отмена в любое время'],
    it: ['🔓 Senza registrazione', '🛡️ Pagamenti sicuri con Stripe', '🌍 Funziona in ogni browser', '↩️ Cancella quando vuoi'],
    tr: ['🔓 Kayıt yok', '🛡️ Stripe ile güvenli ödeme', '🌍 Her tarayıcıda çalışır', '↩️ Dilediğin zaman iptal et'],
    ar: ['🔓 بدون تسجيل', '🛡️ دفع آمن عبر Stripe', '🌍 يعمل في أي متصفح', '↩️ ألغِ في أي وقت'],
    zh: ['🔓 无需注册', '🛡️ Stripe 安全支付', '🌍 任何浏览器都能用', '↩️ 随时取消'],
    ja: ['🔓 登録不要', '🛡️ Stripe による安全な決済', '🌍 どのブラウザでも動作', '↩️ いつでもキャンセル可'],
    ko: ['🔓 가입 불필요', '🛡️ Stripe 안전 결제', '🌍 모든 브라우저에서 작동', '↩️ 언제든 취소'],
    hi: ['🔓 बिना पंजीकरण', '🛡️ Stripe सुरक्षित भुगतान', '🌍 किसी भी ब्राउज़र में काम करता है', '↩️ कभी भी रद्द करें'],
  };
  const pills = copy[lang] || copy.en;

  const pillsHTML = pills.map(p => {
    // Split first emoji from the rest of the label so we can size the
    // icon and the text independently.
    const m = p.match(/^(\S+)\s+(.+)$/);
    const ico = m ? m[1] : '';
    const txt = m ? m[2] : p;
    return `<span class="hp-trust-pill">
      <span class="hp-trust-pill-ico" aria-hidden="true">${ico}</span>
      <span class="hp-trust-pill-txt">${safeText(txt)}</span>
    </span>`;
  }).join('');

  const html = `
    <section id="${ID}" class="hp-trust-signals hp-fade-in no-print" aria-label="Trust signals">
      <div class="hp-trust-row">${pillsHTML}</div>
    </section>`;

  // Always insert at hero.afterend. applyTranslations() calls this
  // function LAST so other sections are already in place; new content
  // inserted at afterend becomes the hero's immediate next sibling.
  document.querySelector('.hero')?.insertAdjacentHTML('afterend', html);
}

function renderPremiumPreview() {
  // Don't show the upsell to users who already have Premium.
  if (window.hasUnlimited) {
    document.getElementById('hp-premium-preview')?.remove();
    return;
  }
  const ID = 'hp-premium-preview';
  document.getElementById(ID)?.remove();

  const copy = {
    ro: { eyebrow:'Cu Premium', title:'Vezi ce deblochezi cu €3/lună', sub:'Trei lucruri concrete pe care le primești când treci la Premium.',
      cards: [
        { ico:'📄', title:'PDF complet 7 zile', desc:'Nu doar previzualizarea de 2 zile — toate cele 7 zile cu rețete, ingrediente și lista de cumpărături.',
          mock:'Luni — Marți — Miercuri — Joi — Vineri — Sâmbătă — Duminică' },
        { ico:'🌍', title:'{{RECIPE_COUNT}} rețete • 70+ țări', desc:'Acces la rețete din bucătării din întreaga lume — de la clasicii italieni și francezi la favoritele thailandeze, japoneze și din Orientul Mijlociu.',
          mock:'Italia • Franța • Japonia • Thailanda • Mexic • India...' },
        { ico:'💰', title:'Meniu buget săptămânal', desc:'Un meniu pre-construit, cu rețete ieftine și lista de cumpărături optimizată pentru sub 150 lei.',
          mock:'7 zile · ingrediente accesibile · listă centralizată' },
      ], cta:'Vezi planul Premium →' },
    en: { eyebrow:'With Premium', title:'See what €3/month unlocks', sub:'Three concrete things you get when you upgrade.',
      cards: [
        { ico:'📄', title:'Full 7-day PDF', desc:'Not just the 2-day preview — all 7 days with recipes, ingredients and the full shopping list.',
          mock:'Mon — Tue — Wed — Thu — Fri — Sat — Sun' },
        { ico:'🌍', title:'{{RECIPE_COUNT}} recipes • 70+ countries', desc:'Access recipes from cuisines around the world — from Italian and French classics to Thai, Japanese and Middle Eastern favorites.',
          mock:'Italy • France • Japan • Thailand • Mexico • India...' },
        { ico:'💰', title:'Weekly budget menu', desc:'A pre-built menu of cheap recipes with a shopping list optimized to stay under €30 per week.',
          mock:'7 days · affordable ingredients · single shopping list' },
      ], cta:'See the Premium plan →' },
    es: { eyebrow:'Con Premium', title:'Mira qué desbloqueas con €3/mes', sub:'Tres cosas concretas que obtienes al pasar a Premium.',
      cards: [
        { ico:'📄', title:'PDF completo 7 días', desc:'No solo la vista previa de 2 días — los 7 días con recetas, ingredientes y lista de compras.',
          mock:'Lun — Mar — Mié — Jue — Vie — Sáb — Dom' },
        { ico:'🌍', title:'{{RECIPE_COUNT}} recetas • 70+ países', desc:'Acceso a recetas de cocinas de todo el mundo — desde clásicos italianos y franceses hasta favoritos tailandeses, japoneses y de Medio Oriente.',
          mock:'Italia • Francia • Japón • Tailandia • México • India...' },
        { ico:'💰', title:'Menú económico semanal', desc:'Un menú prearmado con recetas baratas y lista de compras optimizada por debajo de €30/semana.',
          mock:'7 días · ingredientes accesibles · una sola lista' },
      ], cta:'Ver el plan Premium →' },
    fr: { eyebrow:'Avec Premium', title:'Voyez ce que €3/mois débloque', sub:'Trois choses concrètes que vous obtenez en passant à Premium.',
      cards: [
        { ico:'📄', title:'PDF complet 7 jours', desc:'Pas seulement l\'aperçu de 2 jours — les 7 jours avec recettes, ingrédients et liste complète.',
          mock:'Lun — Mar — Mer — Jeu — Ven — Sam — Dim' },
        { ico:'🌍', title:'{{RECIPE_COUNT}} recettes • 70+ pays', desc:'Accédez à des recettes du monde entier — des classiques italiens et français aux favoris thaïlandais, japonais et du Moyen-Orient.',
          mock:'Italie • France • Japon • Thaïlande • Mexique • Inde...' },
        { ico:'💰', title:'Menu budget hebdomadaire', desc:'Un menu pré-construit de recettes économiques avec liste de courses optimisée pour rester sous €30/semaine.',
          mock:'7 jours · ingrédients accessibles · liste unique' },
      ], cta:'Voir le plan Premium →' },
    de: { eyebrow:'Mit Premium', title:'Schau, was €3/Monat freischaltet', sub:'Drei konkrete Dinge, die du beim Upgrade bekommst.',
      cards: [
        { ico:'📄', title:'Volles 7-Tage-PDF', desc:'Nicht nur die 2-Tage-Vorschau — alle 7 Tage mit Rezepten, Zutaten und vollständiger Einkaufsliste.',
          mock:'Mo — Di — Mi — Do — Fr — Sa — So' },
        { ico:'🌍', title:'{{RECIPE_COUNT}} Rezepte • 70+ Länder', desc:'Rezepte aus Küchen rund um die Welt — von italienischen und französischen Klassikern bis zu thailändischen, japanischen und nahöstlichen Favoriten.',
          mock:'Italien • Frankreich • Japan • Thailand • Mexiko • Indien...' },
        { ico:'💰', title:'Wöchentliches Budget-Menü', desc:'Ein fertiges Menü mit günstigen Rezepten und einer Einkaufsliste, die unter €30/Woche bleibt.',
          mock:'7 Tage · günstige Zutaten · eine Liste' },
      ], cta:'Premium-Plan ansehen →' },
    pt: { eyebrow:'Com Premium', title:'Veja o que €3/mês desbloqueia', sub:'Três coisas concretas que recebe ao fazer upgrade.',
      cards: [
        { ico:'📄', title:'PDF completo 7 dias', desc:'Não só a pré-visualização de 2 dias — os 7 dias com receitas, ingredientes e lista completa.',
          mock:'Seg — Ter — Qua — Qui — Sex — Sáb — Dom' },
        { ico:'🌍', title:'{{RECIPE_COUNT}} receitas • 70+ países', desc:'Acesso a receitas de cozinhas do mundo todo — dos clássicos italianos e franceses aos favoritos tailandeses, japoneses e do Oriente Médio.',
          mock:'Itália • França • Japão • Tailândia • México • Índia...' },
        { ico:'💰', title:'Menu económico semanal', desc:'Um menu pré-construído com receitas baratas e lista de compras otimizada para ficar sob €30/semana.',
          mock:'7 dias · ingredientes acessíveis · lista única' },
      ], cta:'Ver o plano Premium →' },
    ru: { eyebrow:'С Премиум', title:'Что разблокирует €3/мес', sub:'Три конкретные вещи, которые вы получаете при обновлении.',
      cards: [
        { ico:'📄', title:'Полный PDF на 7 дней', desc:'Не только превью 2 дней — все 7 дней с рецептами, ингредиентами и полным списком покупок.',
          mock:'Пн — Вт — Ср — Чт — Пт — Сб — Вс' },
        { ico:'🌍', title:'{{RECIPE_COUNT}} рецептов • 70+ стран', desc:'Рецепты со всего мира — от классической итальянской и французской кухни до тайских, японских и ближневосточных фаворитов.',
          mock:'Италия • Франция • Япония • Таиланд • Мексика • Индия...' },
        { ico:'💰', title:'Недельное бюджетное меню', desc:'Готовое меню из дешёвых рецептов и список покупок, оптимизированный для уровня меньше €30/неделю.',
          mock:'7 дней · доступные ингредиенты · единый список' },
      ], cta:'Посмотреть Премиум →' },
    it: { eyebrow:'Con Premium', title:'Scopri cosa sblocchi con €3/mese', sub:'Tre cose concrete che ottieni passando a Premium.',
      cards: [
        { ico:'📄', title:'PDF completo 7 giorni', desc:'Non solo l\'anteprima di 2 giorni — tutti e 7 i giorni con ricette, ingredienti e lista della spesa completa.',
          mock:'Lun — Mar — Mer — Gio — Ven — Sab — Dom' },
        { ico:'🌍', title:'{{RECIPE_COUNT}} ricette • 70+ paesi', desc:'Accesso a ricette da cucine di tutto il mondo — dai classici italiani e francesi ai preferiti thailandesi, giapponesi e mediorientali.',
          mock:'Italia • Francia • Giappone • Thailandia • Messico • India...' },
        { ico:'💰', title:'Menu economico settimanale', desc:'Un menu già pronto con ricette economiche e lista della spesa ottimizzata per stare sotto €30/settimana.',
          mock:'7 giorni · ingredienti accessibili · lista unica' },
      ], cta:'Vedi il piano Premium →' },
    tr: { eyebrow:'Premium ile', title:'€3/ay ile neyin kilidini açtığını gör', sub:'Yükselttiğinde aldığın üç somut şey.',
      cards: [
        { ico:'📄', title:'Tam 7 günlük PDF', desc:'Sadece 2 günlük önizleme değil — tarifler, malzemeler ve tam alışveriş listesiyle 7 günün hepsi.',
          mock:'Pzt — Sal — Çar — Per — Cum — Cmt — Paz' },
        { ico:'🌍', title:'{{RECIPE_COUNT}} tarif • 70+ ülke', desc:'Dünyanın dört bir yanından mutfaklara erişim — İtalyan ve Fransız klasiklerinden Tayland, Japon ve Orta Doğu favorilerine kadar.',
          mock:'İtalya • Fransa • Japonya • Tayland • Meksika • Hindistan...' },
        { ico:'💰', title:'Haftalık bütçe menüsü', desc:'€30/haftanın altında kalmak için ucuz tarifler ve optimize alışveriş listesi olan hazır menü.',
          mock:'7 gün · uygun malzemeler · tek liste' },
      ], cta:'Premium planı gör →' },
    ar: { eyebrow:'مع بريميوم', title:'شاهد ماذا يفتح لك €3/شهر', sub:'ثلاثة أشياء ملموسة تحصل عليها عند الترقية.',
      cards: [
        { ico:'📄', title:'PDF كامل 7 أيام', desc:'ليس فقط معاينة اليومين — كل الأيام السبعة مع الوصفات والمكونات وقائمة التسوق الكاملة.',
          mock:'الإثنين — الثلاثاء — الأربعاء — الخميس — الجمعة — السبت — الأحد' },
        { ico:'🌍', title:'{{RECIPE_COUNT}} وصفة • أكثر من 70 دولة', desc:'وصفات من مطابخ حول العالم — من الكلاسيكيات الإيطالية والفرنسية إلى المفضلات التايلاندية واليابانية والشرق أوسطية.',
          mock:'إيطاليا • فرنسا • اليابان • تايلاند • المكسيك • الهند...' },
        { ico:'💰', title:'قائمة ميزانية أسبوعية', desc:'قائمة جاهزة بوصفات اقتصادية وقائمة تسوق محسّنة للبقاء تحت €30/أسبوع.',
          mock:'7 أيام · مكونات ميسورة · قائمة واحدة' },
      ], cta:'شاهد خطة بريميوم →' },
    zh: { eyebrow:'通过高级版', title:'看看 €3/月 解锁了什么', sub:'升级后您会获得三样具体的东西。',
      cards: [
        { ico:'📄', title:'完整7天PDF', desc:'不只是2天预览 — 全部7天包含食谱、食材和完整购物清单。',
          mock:'周一 — 周二 — 周三 — 周四 — 周五 — 周六 — 周日' },
        { ico:'🌍', title:'{{RECIPE_COUNT}} 道食谱 • 70+ 国家', desc:'探索来自世界各地的菜系 — 从意大利和法国经典菜到泰国、日本和中东风味。',
          mock:'意大利 • 法国 • 日本 • 泰国 • 墨西哥 • 印度...' },
        { ico:'💰', title:'每周节俭菜单', desc:'预先构建的便宜食谱菜单，购物清单优化至每周不到€30。',
          mock:'7天 · 实惠食材 · 一份清单' },
      ], cta:'查看高级版 →' },
    ja: { eyebrow:'プレミアムで', title:'€3/月で何が解除されるか見る', sub:'アップグレードで得られる3つの具体的なもの。',
      cards: [
        { ico:'📄', title:'7日間フルPDF', desc:'2日プレビューだけでなく — 7日間すべてのレシピ、食材、完全な買い物リスト。',
          mock:'月 — 火 — 水 — 木 — 金 — 土 — 日' },
        { ico:'🌍', title:'{{RECIPE_COUNT}}レシピ • 70カ国以上', desc:'世界中の料理にアクセス — イタリア・フランスの定番から、タイ・日本・中東のお気に入りまで。',
          mock:'イタリア • フランス • 日本 • タイ • メキシコ • インド...' },
        { ico:'💰', title:'週間節約メニュー', desc:'週€30以下を維持するために最適化された安価なレシピと買い物リストのプリビルトメニュー。',
          mock:'7日 · 手頃な食材 · 単一の買い物リスト' },
      ], cta:'プレミアムプランを見る →' },
    ko: { eyebrow:'프리미엄으로', title:'€3/월이 무엇을 잠금 해제하는지 보세요', sub:'업그레이드 시 얻는 세 가지 구체적인 것.',
      cards: [
        { ico:'📄', title:'7일 전체 PDF', desc:'2일 미리보기만이 아닌 — 레시피, 재료, 전체 장보기 목록이 포함된 7일 전체.',
          mock:'월 — 화 — 수 — 목 — 금 — 토 — 일' },
        { ico:'🌍', title:'{{RECIPE_COUNT}}개 레시피 • 70+ 국가', desc:'전 세계 요리에 접근 — 이탈리아 및 프랑스 클래식부터 태국, 일본, 중동의 인기 메뉴까지.',
          mock:'이탈리아 • 프랑스 • 일본 • 태국 • 멕시코 • 인도...' },
        { ico:'💰', title:'주간 예산 메뉴', desc:'주당 €30 미만으로 유지하도록 최적화된 저렴한 레시피와 장보기 목록의 미리 구성된 메뉴.',
          mock:'7일 · 저렴한 재료 · 단일 목록' },
      ], cta:'프리미엄 플랜 보기 →' },
    hi: { eyebrow:'प्रीमियम के साथ', title:'देखें €3/माह क्या अनलॉक करता है', sub:'अपग्रेड पर आपको मिलने वाली तीन ठोस चीजें।',
      cards: [
        { ico:'📄', title:'पूर्ण 7-दिन PDF', desc:'सिर्फ 2-दिन का पूर्वावलोकन नहीं — रेसिपी, सामग्री और पूरी खरीदारी सूची के साथ सभी 7 दिन।',
          mock:'सोम — मंगल — बुध — गुरु — शुक्र — शनि — रवि' },
        { ico:'🌍', title:'{{RECIPE_COUNT}} रेसिपी • 70+ देश', desc:'दुनिया भर के व्यंजनों तक पहुँच — इतालवी और फ्रेंच क्लासिक से लेकर थाई, जापानी और मध्य पूर्वी पसंदीदा तक।',
          mock:'इटली • फ्रांस • जापान • थाईलैंड • मैक्सिको • भारत...' },
        { ico:'💰', title:'साप्ताहिक बजट मेनू', desc:'सस्ती रेसिपी का प्री-बिल्ट मेनू और प्रति सप्ताह €30 से कम रहने के लिए अनुकूलित खरीदारी सूची।',
          mock:'7 दिन · किफायती सामग्री · एक सूची' },
      ], cta:'प्रीमियम योजना देखें →' },
  };
  const s = copy[lang] || copy.en;

  const cardsHTML = s.cards.map(c => `
      <div class="hp-preview-card">
        <div class="hp-preview-card-icon" aria-hidden="true">${safeText(c.ico, '⭐')}</div>
        <h3 class="hp-preview-card-title">${safeText(fillRecipeCount(c.title))}</h3>
        <p class="hp-preview-card-desc">${safeText(fillRecipeCount(c.desc))}</p>
        <div class="hp-preview-card-mock">
          <span class="hp-preview-card-mock-lock" aria-hidden="true">🔒</span>
          ${safeText(c.mock)}
        </div>
      </div>`).join('');

  const html = `
    <section id="${ID}" class="hp-premium-preview hp-fade-in no-print" aria-labelledby="hp-premium-preview-title">
      <div class="hp-premium-preview-head">
        <span class="hp-premium-preview-eyebrow">${safeText(s.eyebrow)}</span>
        <h2 id="hp-premium-preview-title" class="hp-premium-preview-title">${safeText(s.title)}</h2>
        <p class="hp-premium-preview-sub">${safeText(s.sub)}</p>
      </div>
      <div class="hp-premium-preview-grid">${cardsHTML}</div>
      <p class="hp-preview-cta">
        <a class="hp-preview-cta-btn" href="${NAV_PRICING_LINKS[lang] || NAV_PRICING_LINKS.en}">${safeText(s.cta)}</a>
      </p>
    </section>`;

  // Insert right before the pricing section so the visual upsell leads
  // directly into the actual pricing cards.
  const pricingEl = document.getElementById('pricing-section');
  if (pricingEl) {
    pricingEl.insertAdjacentHTML('beforebegin', html);
  } else {
    // Fallback: append before the export section.
    document.querySelector('.export-section')?.insertAdjacentHTML('beforebegin', html);
  }
}

// Phase 12 — Hand-coded SVG ornaments used as section decorations
// and in eyebrow rows. Tiny, currentColor-driven so they inherit
// from .hp-warm-deep wherever they sit.
const HP_ORNAMENTS = {
  wheat: '<svg class="hp-ornament" viewBox="0 0 24 80" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"><line x1="12" y1="10" x2="12" y2="80"/><path d="M12 22 Q7 20 5 14 M12 22 Q17 20 19 14"/><path d="M12 34 Q7 32 5 26 M12 34 Q17 32 19 26"/><path d="M12 46 Q7 44 5 38 M12 46 Q17 44 19 38"/><path d="M12 58 Q7 56 5 50 M12 58 Q17 56 19 50"/></svg>',
  sprig: '<svg class="hp-ornament" viewBox="0 0 28 80" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"><line x1="14" y1="6" x2="14" y2="80"/><ellipse cx="9" cy="20" rx="5" ry="1.6" transform="rotate(-30 9 20)"/><ellipse cx="19" cy="26" rx="5" ry="1.6" transform="rotate(30 19 26)"/><ellipse cx="9" cy="34" rx="5" ry="1.6" transform="rotate(-30 9 34)"/><ellipse cx="19" cy="40" rx="5" ry="1.6" transform="rotate(30 19 40)"/><ellipse cx="9" cy="48" rx="5" ry="1.6" transform="rotate(-30 9 48)"/><ellipse cx="19" cy="54" rx="5" ry="1.6" transform="rotate(30 19 54)"/></svg>',
  fork: '<svg class="hp-ornament" viewBox="0 0 22 80" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"><line x1="3" y1="6" x2="3" y2="22"/><line x1="8.3" y1="6" x2="8.3" y2="22"/><line x1="13.7" y1="6" x2="13.7" y2="22"/><line x1="19" y1="6" x2="19" y2="22"/><line x1="3" y1="22" x2="19" y2="22"/><line x1="11" y1="22" x2="11" y2="80"/></svg>',
};

// Phase 12 — The featured-recipe editorial section. One hand-curated
// recipe rendered as a cookbook page. Localized in the four primary
// locales (ro, en, es, fr) with en fallback for the others — the
// editorial voice is uniform enough that the fallback still reads
// well. Uses an Unsplash CDN photo. Slotted between hero and trust
// signals so it's the FIRST content beat after the hero.
function renderFeaturedRecipe() {
  const ID = 'hp-featured-recipe';
  document.getElementById(ID)?.remove();

  const copy = {
    ro: {
      eyebrow: 'În seara asta, gătește',
      title: 'Spaghete\nalla Carbonara',
      bylineOrigin: 'Din Roma, Italia',
      bylineTime: '25 min',
      bylineServes: 'Pentru 4',
      caption: 'Clasica romană — ouă, pecorino, guanciale și piper negru. Nu există smântână în carbonara autentică.',
      ingredientsLabel: 'Ingrediente',
      methodLabel: 'Mod de preparare',
      ingredients: [
        ['Spaghete', '400 g'],
        ['Guanciale', '150 g'],
        ['Gălbenușuri de ou', '4'],
        ['Pecorino Romano ras', '60 g'],
        ['Piper negru proaspăt măcinat', 'după gust'],
        ['Sare grunjoasă', 'pentru apă'],
      ],
      method: [
        'Pune la fiert o oală mare cu apă cu sare. Carbonara cere apă suficient de sărată — gândește-o ca pe „apa de mare".',
        'Taie guanciale în batoane subțiri. Pune-l într-o tigaie rece, apoi încălzește treptat până se topește grăsimea și carnea devine crocantă, 6-7 minute.',
        'Bate gălbenușurile cu pecorino-ul și un strop de piper negru într-un bol mare. Vei amesteca pasta direct aici.',
        'Fierbe spaghetele al dente. Păstrează 200 ml din apa de fierbere înainte să scurgi.',
        'Adaugă pasta caldă peste guanciale, amestecă rapid 10 secunde. Tigaia trebuie să fie OFF — căldura reziduală e suficientă. Toarnă peste amestecul de ouă, adaugă 2-3 linguri din apa păstrată, amestecă viguros până se formează crema.',
      ],
      cta: 'Adaug-o la săptămâna ta — gratuit.',
    },
    en: {
      eyebrow: 'Tonight, cook this',
      title: 'Spaghetti\nalla Carbonara',
      bylineOrigin: 'From Rome, Italy',
      bylineTime: '25 min',
      bylineServes: 'Serves 4',
      caption: 'The Roman classic — egg yolks, pecorino, guanciale, and black pepper. No cream in an honest carbonara.',
      ingredientsLabel: 'Ingredients',
      methodLabel: 'Method',
      ingredients: [
        ['Spaghetti', '400 g'],
        ['Guanciale', '150 g'],
        ['Egg yolks', '4'],
        ['Pecorino Romano, grated', '60 g'],
        ['Black pepper, fresh-ground', 'to taste'],
        ['Sea salt', 'for the water'],
      ],
      method: [
        'Bring a large pot of well-salted water to the boil. Carbonara wants the water properly seasoned — think sea-water salty.',
        'Cut the guanciale into thin batons. Start it in a cold pan, then bring up the heat slowly until the fat renders and the meat crisps, 6-7 minutes.',
        'Whisk the egg yolks with the pecorino and a generous turn of pepper in a large bowl. You\'ll toss the pasta directly into this.',
        'Cook the spaghetti al dente. Reserve 200 ml of the pasta water before draining.',
        'Tip the hot pasta into the pan with the guanciale, toss for 10 seconds. Pan must be off the heat — residual warmth is enough. Pour the mixture into the egg bowl, add 2-3 tablespoons of the reserved water, whisk vigorously until a glossy cream forms.',
      ],
      cta: 'Add it to your week — free.',
    },
    es: {
      eyebrow: 'Esta noche, cocina esto',
      title: 'Espaguetis\nalla Carbonara',
      bylineOrigin: 'Desde Roma, Italia',
      bylineTime: '25 min',
      bylineServes: 'Para 4',
      caption: 'El clásico romano — yemas, pecorino, guanciale y pimienta negra. La carbonara auténtica no lleva nata.',
      ingredientsLabel: 'Ingredientes',
      methodLabel: 'Preparación',
      ingredients: [
        ['Espaguetis', '400 g'],
        ['Guanciale', '150 g'],
        ['Yemas de huevo', '4'],
        ['Pecorino Romano rallado', '60 g'],
        ['Pimienta negra recién molida', 'al gusto'],
        ['Sal gruesa', 'para el agua'],
      ],
      method: [
        'Pon a hervir una olla grande con agua bien salada. La carbonara quiere el agua bien salada — como agua de mar.',
        'Corta el guanciale en bastoncitos finos. Empieza en sartén fría y sube fuego despacio hasta que la grasa se derrita y la carne quede crujiente, 6-7 minutos.',
        'Bate las yemas con el pecorino y bastante pimienta en un bol grande. Mezclarás la pasta directamente aquí.',
        'Cuece los espaguetis al dente. Reserva 200 ml de agua de cocción antes de escurrir.',
        'Echa la pasta caliente sobre el guanciale, remueve 10 segundos. La sartén debe estar APAGADA — el calor residual basta. Vierte sobre las yemas, añade 2-3 cucharadas del agua reservada y bate enérgicamente hasta formar una crema brillante.',
      ],
      cta: 'Añádelo a tu semana — gratis.',
    },
    fr: {
      eyebrow: 'Ce soir, cuisinez',
      title: 'Spaghetti\nalla Carbonara',
      bylineOrigin: 'Depuis Rome, Italie',
      bylineTime: '25 min',
      bylineServes: 'Pour 4',
      caption: 'Le classique romain — jaunes d\'œufs, pecorino, guanciale et poivre noir. Une vraie carbonara n\'a pas de crème.',
      ingredientsLabel: 'Ingrédients',
      methodLabel: 'Préparation',
      ingredients: [
        ['Spaghetti', '400 g'],
        ['Guanciale', '150 g'],
        ['Jaunes d\'œufs', '4'],
        ['Pecorino Romano râpé', '60 g'],
        ['Poivre noir, fraîchement moulu', 'au goût'],
        ['Sel marin', 'pour l\'eau'],
      ],
      method: [
        'Portez une grande casserole d\'eau bien salée à ébullition. La carbonara exige une eau bien salée — comme l\'eau de mer.',
        'Coupez le guanciale en fins bâtonnets. Démarrez dans une poêle froide, montez doucement en chaleur jusqu\'à ce que la graisse fonde et la chair croustille, 6-7 minutes.',
        'Fouettez les jaunes avec le pecorino et beaucoup de poivre dans un grand bol. Vous mélangerez les pâtes directement ici.',
        'Cuisez les spaghetti al dente. Réservez 200 ml d\'eau de cuisson avant d\'égoutter.',
        'Versez les pâtes chaudes dans la poêle avec le guanciale, remuez 10 secondes. La poêle doit être HORS du feu — la chaleur résiduelle suffit. Versez sur les jaunes, ajoutez 2-3 cuillères d\'eau réservée, fouettez énergiquement jusqu\'à obtenir une crème brillante.',
      ],
      cta: 'Ajoutez-la à votre semaine — gratuit.',
    },
    de: {
      eyebrow: 'Heute Abend kochst du das',
      title: 'Spaghetti\nalla Carbonara',
      bylineOrigin: 'Aus Rom, Italien',
      bylineTime: '25 Min.',
      bylineServes: '4 Portionen',
      caption: 'Der römische Klassiker — Eigelb, Pecorino, Guanciale und schwarzer Pfeffer. Echte Carbonara kommt ohne Sahne aus.',
      ingredientsLabel: 'Zutaten',
      methodLabel: 'Zubereitung',
      ingredients: [
        ['Spaghetti', '400 g'],
        ['Guanciale', '150 g'],
        ['Eigelb', '4'],
        ['Pecorino Romano, gerieben', '60 g'],
        ['Schwarzer Pfeffer, frisch gemahlen', 'nach Geschmack'],
        ['Grobes Meersalz', 'für das Wasser'],
      ],
      method: [
        'Einen großen Topf gut gesalzenes Wasser zum Kochen bringen. Carbonara braucht richtig salziges Wasser — denk an Meerwasser.',
        'Den Guanciale in feine Stäbchen schneiden. In einer kalten Pfanne starten, dann langsam erhitzen, bis das Fett austritt und das Fleisch knusprig wird, 6-7 Minuten.',
        'Eigelb mit Pecorino und reichlich Pfeffer in einer großen Schüssel verquirlen. Die Pasta wird direkt hier hineingegeben.',
        'Spaghetti al dente kochen. 200 ml Nudelwasser vor dem Abgießen abnehmen.',
        'Die heiße Pasta in die Pfanne mit dem Guanciale geben, 10 Sekunden schwenken. Pfanne MUSS vom Herd sein — Restwärme reicht. In die Eier-Schüssel kippen, 2-3 EL Nudelwasser zugeben, kräftig schlagen, bis eine glänzende Creme entsteht.',
      ],
      cta: 'Füge sie deiner Woche hinzu — kostenlos.',
    },
    pt: {
      eyebrow: 'Esta noite, cozinha isto',
      title: 'Espaguete\nalla Carbonara',
      bylineOrigin: 'De Roma, Itália',
      bylineTime: '25 min',
      bylineServes: 'Para 4',
      caption: 'O clássico romano — gemas, pecorino, guanciale e pimenta preta. Uma verdadeira carbonara não leva natas.',
      ingredientsLabel: 'Ingredientes',
      methodLabel: 'Preparação',
      ingredients: [
        ['Esparguete', '400 g'],
        ['Guanciale', '150 g'],
        ['Gemas de ovo', '4'],
        ['Pecorino Romano ralado', '60 g'],
        ['Pimenta preta moída na hora', 'a gosto'],
        ['Sal grosso', 'para a água'],
      ],
      method: [
        'Leve uma panela grande de água bem salgada à fervura. A carbonara exige água bem salgada — pense em água do mar.',
        'Corte o guanciale em palitos finos. Comece em frigideira fria, aumente o fogo devagar até a gordura derreter e a carne ficar crocante, 6-7 minutos.',
        'Bata as gemas com o pecorino e bastante pimenta numa tigela grande. A massa será misturada diretamente aqui.',
        'Coza o esparguete al dente. Reserve 200 ml da água de cozedura antes de escorrer.',
        'Despeje a massa quente sobre o guanciale, envolva 10 segundos. A frigideira deve estar FORA do lume — o calor residual basta. Despeje sobre as gemas, junte 2-3 colheres da água reservada, bata vigorosamente até formar um creme brilhante.',
      ],
      cta: 'Adicione-a à sua semana — grátis.',
    },
    ru: {
      eyebrow: 'Сегодня вечером приготовь это',
      title: 'Спагетти\nалла Карбонара',
      bylineOrigin: 'Из Рима, Италия',
      bylineTime: '25 мин',
      bylineServes: 'На 4 порции',
      caption: 'Римская классика — яичные желтки, пекорино, гуанчале и чёрный перец. В настоящей карбонаре нет сливок.',
      ingredientsLabel: 'Ингредиенты',
      methodLabel: 'Приготовление',
      ingredients: [
        ['Спагетти', '400 г'],
        ['Гуанчале', '150 г'],
        ['Яичные желтки', '4'],
        ['Пекорино Романо, тёртый', '60 г'],
        ['Чёрный перец свежемолотый', 'по вкусу'],
        ['Морская соль крупного помола', 'для воды'],
      ],
      method: [
        'Поставьте большую кастрюлю хорошо подсолённой воды на огонь. Для карбонары вода должна быть как морская — солёной.',
        'Нарежьте гуанчале тонкими полосками. Положите в холодную сковороду и медленно прогревайте, пока жир не вытопится, а мясо не станет хрустящим, 6-7 минут.',
        'Взбейте желтки с пекорино и щедрой щепоткой перца в большой миске. Пасту будете перемешивать прямо здесь.',
        'Сварите спагетти аль денте. Перед тем как слить, сохраните 200 мл варочной воды.',
        'Горячую пасту переложите в сковороду с гуанчале, перемешайте 10 секунд. Сковорода ДОЛЖНА быть выключена — остаточного тепла достаточно. Переложите в миску с желтками, добавьте 2-3 столовые ложки варочной воды и энергично перемешивайте, пока не образуется блестящий крем.',
      ],
      cta: 'Добавь её в свою неделю — бесплатно.',
    },
    ar: {
      eyebrow: 'الليلة، اطبخ هذا',
      title: 'سباغيتي\nألا كاربونارا',
      bylineOrigin: 'من روما، إيطاليا',
      bylineTime: '25 دقيقة',
      bylineServes: 'لـ 4 أشخاص',
      caption: 'الكلاسيكية الرومانية — صفار البيض والبكورينو والغوانتشالي والفلفل الأسود. الكاربونارا الحقيقية بدون كريمة.',
      ingredientsLabel: 'المكونات',
      methodLabel: 'الطريقة',
      ingredients: [
        ['سباغيتي', '400 غ'],
        ['غوانتشالي', '150 غ'],
        ['صفار بيض', '4'],
        ['بكورينو رومانو مبشور', '60 غ'],
        ['فلفل أسود طازج', 'حسب الذوق'],
        ['ملح خشن', 'للماء'],
      ],
      method: [
        'اغلِ قدراً كبيراً من الماء المملّح جيداً. الكاربونارا تحتاج ماءً مالحاً كماء البحر.',
        'قطّع الغوانتشالي إلى أعواد رفيعة. ابدأ في مقلاة باردة ثم ارفع الحرارة تدريجياً حتى تذوب الدهون ويصبح اللحم مقرمشاً، 6-7 دقائق.',
        'اخفق الصفار مع البكورينو وكمية وفيرة من الفلفل في وعاء كبير. ستخلط المعكرونة هنا مباشرة.',
        'اطبخ السباغيتي ال دنتي. احتفظ بـ 200 مل من ماء السلق قبل التصفية.',
        'انقل المعكرونة الساخنة إلى مقلاة الغوانتشالي وقلّب 10 ثوان. يجب أن تكون المقلاة بعيدة عن النار — الحرارة المتبقية كافية. اسكب على الصفار، أضف 2-3 ملاعق من ماء السلق، وحرّك بقوة حتى يتكوّن كريم لامع.',
      ],
      cta: 'أضفها إلى أسبوعك — مجاناً.',
    },
    zh: {
      eyebrow: '今晚就做这道',
      title: '意式培根\n奶汁意面',
      bylineOrigin: '来自意大利罗马',
      bylineTime: '25 分钟',
      bylineServes: '4 人份',
      caption: '罗马经典——蛋黄、佩科里诺、guanciale 和黑胡椒。真正的 Carbonara 不放奶油。',
      ingredientsLabel: '食材',
      methodLabel: '做法',
      ingredients: [
        ['意大利长面（spaghetti）', '400 克'],
        ['Guanciale（意式风干猪颊肉）', '150 克'],
        ['蛋黄', '4 个'],
        ['佩科里诺羊奶酪 (Pecorino Romano)', '60 克'],
        ['现磨黑胡椒', '适量'],
        ['粗盐', '煮面水用'],
      ],
      method: [
        '大锅加水煮开，加足量盐。Carbonara 的煮面水要像海水一样咸。',
        'Guanciale 切成细条，从冷锅开始小火慢慢加热，让脂肪渗出、肉变酥脆，6-7 分钟。',
        '蛋黄、佩科里诺、足量黑胡椒在大碗里搅匀。意面将直接拌入这碗中。',
        '把面煮到 al dente（弹牙）。捞出前先舀出 200 毫升煮面水。',
        '把热面倒入有 guanciale 的锅中，快速翻拌 10 秒。锅必须离火——余温就够。倒入蛋黄碗，加 2-3 汤匙煮面水，剧烈搅打至形成光亮乳化酱汁。',
      ],
      cta: '把它加入你的一周——免费。',
    },
    ja: {
      eyebrow: '今夜、作るならこれ',
      title: 'スパゲッティ\nアッラ・カルボナーラ',
      bylineOrigin: 'イタリア・ローマ発',
      bylineTime: '25分',
      bylineServes: '4人分',
      caption: 'ローマの古典料理 — 卵黄、ペコリーノ、グアンチャーレ、黒こしょう。本物のカルボナーラに生クリームは使わない。',
      ingredientsLabel: '材料',
      methodLabel: '作り方',
      ingredients: [
        ['スパゲッティ', '400 g'],
        ['グアンチャーレ', '150 g'],
        ['卵黄', '4 個'],
        ['ペコリーノ・ロマーノ（おろし）', '60 g'],
        ['挽きたて黒こしょう', '適量'],
        ['粗塩', '茹で湯用'],
      ],
      method: [
        '大きな鍋にしっかり塩を加えた湯を沸かす。カルボナーラの茹で湯は海水並みの塩加減が必要。',
        'グアンチャーレを細い棒状に切り、冷たいフライパンから入れて弱めの火でゆっくり加熱し、脂が出て肉がカリッとするまで6〜7分。',
        '大きなボウルに卵黄、ペコリーノ、たっぷりの黒こしょうを入れて混ぜる。パスタをここに直接合わせる。',
        'スパゲッティをアルデンテに茹でる。湯切り前に茹で汁を200ml取っておく。',
        '熱いパスタをグアンチャーレのフライパンへ入れ、10秒ほど和える。フライパンは火から外す — 余熱で十分。卵黄のボウルに移し、取っておいた茹で汁を大さじ2〜3加え、つやのあるクリーム状になるまで力強く混ぜる。',
      ],
      cta: '一週間の献立に加える — 無料。',
    },
    hi: {
      eyebrow: 'आज रात, यह बनाएँ',
      title: 'स्पैगेटी\nअल्ला कार्बोनारा',
      bylineOrigin: 'रोम, इटली से',
      bylineTime: '25 मिनट',
      bylineServes: '4 के लिए',
      caption: 'रोमन क्लासिक — अंडे की जर्दी, पेकोरीनो, ग्वांचाले और काली मिर्च। असली कार्बोनारा में क्रीम नहीं होती।',
      ingredientsLabel: 'सामग्री',
      methodLabel: 'विधि',
      ingredients: [
        ['स्पैगेटी', '400 ग्राम'],
        ['ग्वांचाले (Guanciale)', '150 ग्राम'],
        ['अंडे की जर्दी', '4'],
        ['पेकोरीनो रोमानो, कद्दूकस', '60 ग्राम'],
        ['ताज़ी पिसी काली मिर्च', 'स्वादानुसार'],
        ['मोटा नमक', 'पानी के लिए'],
      ],
      method: [
        'एक बड़े बर्तन में अच्छी तरह नमकीन पानी उबालने रखें। कार्बोनारा का पानी समुद्र के पानी जितना नमकीन होना चाहिए।',
        'ग्वांचाले को पतले स्ट्रिप्स में काटें। ठंडी पैन में डालकर धीमी आँच पर 6-7 मिनट तक पकाएँ जब तक चर्बी निकल जाए और मांस कुरकुरा हो जाए।',
        'एक बड़े बाउल में अंडे की जर्दी, पेकोरीनो और भरपूर काली मिर्च फेंटें। पास्ता को सीधे यहीं मिलाएँगे।',
        'स्पैगेटी अल डेन्टे तक उबालें। पानी निकालने से पहले 200 मिली पास्ता पानी बचाएँ।',
        'गरम पास्ता को ग्वांचाले की पैन में डालें, 10 सेकंड चलाएँ। पैन आँच से उतरी होनी चाहिए — बची हुई गर्मी काफ़ी है। अंडे वाले बाउल में डालें, 2-3 बड़े चम्मच पास्ता पानी मिलाएँ, ज़ोर से फेंटें जब तक चमकदार क्रीमी सॉस न बने।',
      ],
      cta: 'इसे अपने हफ्ते में जोड़ें — मुफ़्त।',
    },
    tr: {
      eyebrow: 'Bu akşam, bunu pişir',
      title: 'Spaghetti\nalla Carbonara',
      bylineOrigin: 'Roma, İtalya',
      bylineTime: '25 dk',
      bylineServes: '4 kişilik',
      caption: 'Roma klasiği — yumurta sarısı, pecorino, guanciale ve karabiber. Gerçek carbonara'+"'"+'da krema olmaz.',
      ingredientsLabel: 'Malzemeler',
      methodLabel: 'Yapılışı',
      ingredients: [
        ['Spaghetti', '400 g'],
        ['Guanciale', '150 g'],
        ['Yumurta sarısı', '4'],
        ['Pecorino Romano, rendelenmiş', '60 g'],
        ['Taze çekilmiş karabiber', 'damak tadına göre'],
        ['İri tane tuz', 'su için'],
      ],
      method: [
        'Büyük bir tencerede iyice tuzlanmış suyu kaynatın. Carbonara için su deniz suyu kıvamında tuzlu olmalı.',
        'Guanciale'+"'"+'yi ince çubuklara doğrayın. Soğuk tavada başlayın, yağı eriyene ve eti çıtırlaşana dek yavaşça pişirin, 6-7 dakika.',
        'Büyük bir kasede yumurta sarılarını pecorino ve bolca karabiberle çırpın. Makarnayı doğrudan burada karıştıracaksınız.',
        'Spaghetti'+"'"+'yi al dente pişirin. Süzmeden önce 200 ml haşlama suyu ayırın.',
        'Sıcak makarnayı guanciale tavasına alın, 10 saniye karıştırın. Tava ATEŞTEN inmiş olmalı — kalan ısı yeterli. Yumurta kasesine boşaltın, 2-3 yemek kaşığı haşlama suyu ekleyin, parlak bir krema oluşana dek hızla karıştırın.',
      ],
      cta: 'Onu haftana ekle — ücretsiz.',
    },
    it: {
      eyebrow: 'Stasera, cucina questa',
      title: 'Spaghetti\nalla Carbonara',
      bylineOrigin: 'Da Roma, Italia',
      bylineTime: '25 min',
      bylineServes: 'Per 4 persone',
      caption: 'Il classico romano — tuorli, pecorino, guanciale e pepe nero. Nella vera carbonara non c'+"'"+'è panna.',
      ingredientsLabel: 'Ingredienti',
      methodLabel: 'Procedimento',
      ingredients: [
        ['Spaghetti', '400 g'],
        ['Guanciale', '150 g'],
        ['Tuorli d'+"'"+'uovo', '4'],
        ['Pecorino Romano grattugiato', '60 g'],
        ['Pepe nero macinato fresco', 'q.b.'],
        ['Sale grosso', 'per l'+"'"+'acqua'],
      ],
      method: [
        'Porta a ebollizione una pentola capiente di acqua ben salata. Per la carbonara l'+"'"+'acqua deve essere salata come l'+"'"+'acqua di mare.',
        'Taglia il guanciale a bastoncini sottili. Parti da padella fredda e alza il fuoco lentamente finché il grasso si scioglie e la carne diventa croccante, 6-7 minuti.',
        'In una ciotola capiente sbatti i tuorli con il pecorino e una generosa macinata di pepe. La pasta verrà mescolata direttamente qui.',
        'Cuoci gli spaghetti al dente. Tieni da parte 200 ml di acqua di cottura prima di scolare.',
        'Versa la pasta calda nella padella con il guanciale, salta 10 secondi. La padella deve essere SPENTA — il calore residuo basta. Trasferisci nella ciotola dei tuorli, aggiungi 2-3 cucchiai di acqua di cottura, mescola energicamente fino a ottenere una crema lucida.',
      ],
      cta: 'Aggiungila alla tua settimana — gratis.',
    },
    ko: {
      eyebrow: '오늘 저녁, 이것을 만드세요',
      title: '스파게티\n알라 카르보나라',
      bylineOrigin: '이탈리아 로마에서',
      bylineTime: '25분',
      bylineServes: '4인분',
      caption: '로마의 고전 — 달걀 노른자, 페코리노, 관찰레, 그리고 흑후추. 진짜 카르보나라에는 생크림이 들어가지 않는다.',
      ingredientsLabel: '재료',
      methodLabel: '만드는 법',
      ingredients: [
        ['스파게티', '400 g'],
        ['관찰레', '150 g'],
        ['달걀 노른자', '4 개'],
        ['페코리노 로마노 (간 것)', '60 g'],
        ['갓 갈은 흑후추', '취향껏'],
        ['굵은 소금', '면수용'],
      ],
      method: [
        '큰 냄비에 충분히 짭짤한 물을 끓입니다. 카르보나라의 면수는 바닷물 정도로 짜야 합니다.',
        '관찰레를 가늘게 막대 모양으로 썰어 차가운 팬에서 시작해 약불에서 천천히 가열, 기름이 나오고 살이 바삭해질 때까지 6-7분.',
        '큰 볼에 달걀 노른자, 페코리노, 후추를 듬뿍 넣고 휘젓습니다. 파스타를 바로 여기에 섞을 것입니다.',
        '스파게티를 알 덴테로 삶습니다. 면수를 200ml 따로 남기고 물을 뺍니다.',
        '뜨거운 면을 관찰레가 든 팬에 넣고 10초간 섞습니다. 팬은 불에서 내려야 합니다 — 잔열로 충분. 달걀 볼에 옮겨 담고 면수 2-3큰술을 더해, 윤기 나는 크림이 형성될 때까지 힘차게 섞습니다.',
      ],
      cta: '주간 메뉴에 추가하세요 — 무료.',
    },
  };
  const s = copy[lang] || copy.en;

  const ingredientsHTML = s.ingredients.map(
    ([name, qty]) => `<li><span class="ing-name">${safeText(name)}</span><span class="ing-qty">${safeText(qty)}</span></li>`
  ).join('');

  const methodHTML = s.method.map(step => `<li>${safeText(step)}</li>`).join('');

  // Hand-picked Unsplash photo of carbonara — atmospheric overhead shot.
  const photoUrl = 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=1800&q=70';

  // Split the title into two display lines.
  const titleLines = s.title.split('\n').map(l => safeText(l)).join('<br>');

  const html = `
    <section id="${ID}" class="hp-featured-recipe hp-fade-in no-print" aria-labelledby="hp-featured-title">
      <div class="hp-featured-inner">
        <div class="hp-featured-eyebrow-row">
          ${HP_ORNAMENTS.wheat}
          <span class="hp-featured-eyebrow">${safeText(s.eyebrow)}</span>
          ${HP_ORNAMENTS.wheat}
        </div>
        <h2 id="hp-featured-title" class="hp-featured-title">${titleLines}</h2>
        <div class="hp-featured-byline">
          ${safeText(s.bylineOrigin)}
          <span class="hp-featured-byline-sep">✦</span>
          ${safeText(s.bylineTime)}
          <span class="hp-featured-byline-sep">✦</span>
          ${safeText(s.bylineServes)}
        </div>
        <figure class="hp-featured-figure">
          <img src="${photoUrl}" alt="${safeText(s.title.replace('\n', ' '))}" loading="lazy" decoding="async">
          <figcaption class="hp-featured-figcaption">${safeText(s.caption)}</figcaption>
        </figure>
        <div class="hp-featured-grid">
          <aside class="hp-featured-ingredients">
            <div class="hp-featured-section-title">${safeText(s.ingredientsLabel)}</div>
            <ul>${ingredientsHTML}</ul>
          </aside>
          <div class="hp-featured-method">
            <div class="hp-featured-section-title">${safeText(s.methodLabel)}</div>
            <ol>${methodHTML}</ol>
          </div>
        </div>
        <div class="hp-divider">${HP_ORNAMENTS.sprig}</div>
        <p class="hp-featured-cta-row"><a href="#auto-menu-bar" class="hp-featured-cta-link" data-featured-recipe-id="1">${safeText(s.cta)}</a></p>
      </div>
    </section>`;

  // Slot right after the hero. Falls back to before-cuisine if hero
  // somehow isn't there.
  const heroEl = document.querySelector('.hero');
  if (heroEl) {
    heroEl.insertAdjacentHTML('afterend', html);
  } else {
    document.getElementById('hp-cuisine-discover')?.insertAdjacentHTML('beforebegin', html);
  }

  // CTA "Add it to your week — free": wire the featured-recipe link to actually
  // add the recipe to the first empty planner slot (lunch first, then dinner,
  // scanning Mon→Sun) and smooth-scroll into the planner so the user sees it
  // appear. Falls back to a plain anchor jump if recipe lookup fails.
  document.querySelector('.hp-featured-cta-link')?.addEventListener('click', async (e) => {
    const link = e.currentTarget;            // capture before await (nulled after dispatch)
    const recipeId = Number(link.dataset.featuredRecipeId);
    // Corpus is lazy-loaded: prevent the default anchor jump up-front, then load
    // the recipes and place the dish. On any failure, fall back to the href.
    e.preventDefault();
    await ensureMainRecipes();
    const recipe = (window.recipesMain || []).find(r => r.id === recipeId);
    if (!recipe) { if (link.href) window.location.href = link.href; return; }
    let placed = false;
    for (let i = 1; i <= 7 && !placed; i++) {
      for (const slot of [`d${i}l`, `d${i}c`]) {
        const inp = document.getElementById(slot);
        if (inp && !inp.value.trim()) {
          inp.value = getRecipeText(recipe, lang);
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          placed = true;
          break;
        }
      }
    }
    const target = document.getElementById('auto-menu-bar') || document.getElementById('plan-table');
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function renderFAQ() {
  const ID = 'hp-faq';
  document.getElementById(ID)?.remove();

  const copy = {
    ro: {
      eyebrow: 'Întrebări frecvente',
      title: 'Răspunsuri rapide',
      items: [
        { q: 'Planificatorul este cu adevărat gratuit?',
          a: 'Da. Planificarea săptămânală, lista de cumpărături și cele 200+ rețete sunt gratuite, fără înregistrare. PDF-ul gratuit oferă o previzualizare de 2 zile din 7.' },
        { q: 'Ce primesc în plus cu Premium?',
          a: 'PDF complet pentru toate cele 7 zile, meniu buget săptămânal, acces la toate cele {{RECIPE_COUNT}} rețete și rețete noi adăugate regulat. €3/lună, fără angajament.' },
        { q: 'Pot anula abonamentul oricând?',
          a: 'Da. Anulezi oricând din portalul Stripe, accesibil prin butonul „Manage subscription" după activare. Continui să folosești Premium până la sfârșitul perioadei plătite.' },
        { q: 'Trebuie să-mi fac cont?',
          a: 'Pentru utilizarea gratuită — deloc. Pentru Premium e suficient un email — îl folosim doar ca să-ți reactivăm accesul pe alt dispozitiv.' },
        { q: 'Cum activez Premium pe un alt dispozitiv?',
          a: 'Introdu același email cu care ai plătit în secțiunea „Ai plătit deja? Deblochează". Verificarea se face server-side prin Stripe — fără parole, fără reset.' },
        { q: 'În câte limbi funcționează?',
          a: '14 limbi: română, engleză, spaniolă, franceză, germană, portugheză, rusă, italiană, turcă, arabă, chineză, japoneză, coreeană și hindi.' },
      ],
    },
    en: {
      eyebrow: 'FAQ',
      title: 'Quick answers',
      items: [
        { q: 'Is the planner really free?',
          a: 'Yes. The weekly planner, shopping list, and 200+ recipes are free with no signup. The free PDF gives you a 2-of-7-day preview.' },
        { q: 'What do I get with Premium?',
          a: 'Full PDF for all 7 days, a weekly budget menu, access to all {{RECIPE_COUNT}} recipes from 70+ countries, and new recipes added regularly. €3/month, no commitment.' },
        { q: 'Can I cancel anytime?',
          a: 'Yes. Cancel anytime from the Stripe portal, reachable via the "Manage subscription" button after activation. You keep Premium until the end of the paid period.' },
        { q: 'Do I need to create an account?',
          a: 'Not for the free tier. For Premium an email is enough — we only use it to reactivate access on other devices.' },
        { q: 'How do I activate Premium on a new device?',
          a: 'Enter the same email you paid with under "Already paid? Unlock". Verification runs server-side through Stripe — no passwords, no resets.' },
        { q: 'How many languages are supported?',
          a: '14: Romanian, English, Spanish, French, German, Portuguese, Russian, Italian, Turkish, Arabic, Chinese, Japanese, Korean and Hindi.' },
      ],
    },
    es: {
      eyebrow: 'Preguntas frecuentes',
      title: 'Respuestas rápidas',
      items: [
        { q: '¿El planificador es realmente gratis?',
          a: 'Sí. El planificador semanal, la lista de compras y las 200+ recetas son gratuitas sin registro. El PDF gratuito ofrece una vista previa de 2 de 7 días.' },
        { q: '¿Qué incluye Premium?',
          a: 'PDF completo de los 7 días, menú económico semanal, acceso a todas las {{RECIPE_COUNT}} recetas de 70+ países y nuevas recetas regularmente. €3/mes, sin compromiso.' },
        { q: '¿Puedo cancelar cuando quiera?',
          a: 'Sí. Cancela cuando quieras desde el portal Stripe, accesible mediante el botón "Manage subscription" tras la activación. Mantienes Premium hasta el fin del periodo pagado.' },
        { q: '¿Necesito crear una cuenta?',
          a: 'Para la versión gratuita no. Para Premium basta con un email — lo usamos solo para reactivar el acceso en otros dispositivos.' },
        { q: '¿Cómo activo Premium en otro dispositivo?',
          a: 'Introduce el mismo email con el que pagaste en "¿Ya pagaste? Desbloquea". La verificación se hace en el servidor mediante Stripe — sin contraseñas ni reinicios.' },
        { q: '¿En cuántos idiomas funciona?',
          a: '14 idiomas: rumano, inglés, español, francés, alemán, portugués, ruso, italiano, turco, árabe, chino, japonés, coreano e hindi.' },
      ],
    },
    fr: {
      eyebrow: 'Questions fréquentes',
      title: 'Réponses rapides',
      items: [
        { q: 'Le planificateur est-il vraiment gratuit ?',
          a: 'Oui. Le planificateur hebdomadaire, la liste de courses et les 200+ recettes sont gratuits sans inscription. Le PDF gratuit offre un aperçu de 2 jours sur 7.' },
        { q: 'Que comprend Premium ?',
          a: 'PDF complet 7 jours, menu budget hebdomadaire, accès aux {{RECIPE_COUNT}} recettes de 70+ pays et nouvelles recettes ajoutées régulièrement. €3/mois, sans engagement.' },
        { q: 'Puis-je annuler à tout moment ?',
          a: 'Oui. Annulez quand vous voulez depuis le portail Stripe, accessible via le bouton "Manage subscription" après activation. Vous gardez Premium jusqu\'à la fin de la période payée.' },
        { q: 'Dois-je créer un compte ?',
          a: 'Pour la version gratuite, non. Pour Premium un email suffit — nous l\'utilisons uniquement pour réactiver l\'accès sur d\'autres appareils.' },
        { q: 'Comment activer Premium sur un autre appareil ?',
          a: 'Saisissez le même email utilisé pour le paiement dans "Déjà payé ? Débloquez". La vérification se fait côté serveur via Stripe — sans mots de passe.' },
        { q: 'Dans combien de langues fonctionne-t-il ?',
          a: '14 langues : roumain, anglais, espagnol, français, allemand, portugais, russe, italien, turc, arabe, chinois, japonais, coréen et hindi.' },
      ],
    },
    de: {
      eyebrow: 'Häufige Fragen',
      title: 'Schnelle Antworten',
      items: [
        { q: 'Ist der Planer wirklich kostenlos?',
          a: 'Ja. Wochenplaner, Einkaufsliste und 200+ Rezepte sind ohne Anmeldung kostenlos. Das kostenlose PDF zeigt eine Vorschau von 2 von 7 Tagen.' },
        { q: 'Was bekomme ich mit Premium?',
          a: 'Vollständiges PDF für alle 7 Tage, wöchentliches Budget-Menü, Zugang zu allen {{RECIPE_COUNT}} Rezepten aus 70+ Ländern und regelmäßig neue Rezepte. €3/Monat, ohne Bindung.' },
        { q: 'Kann ich jederzeit kündigen?',
          a: 'Ja. Kündige jederzeit im Stripe-Portal, erreichbar über die Schaltfläche "Manage subscription" nach der Aktivierung. Premium bleibt bis zum Ende des bezahlten Zeitraums aktiv.' },
        { q: 'Muss ich ein Konto anlegen?',
          a: 'Für die kostenlose Version nicht. Für Premium reicht eine E-Mail — wir nutzen sie nur, um den Zugang auf anderen Geräten wieder zu aktivieren.' },
        { q: 'Wie aktiviere ich Premium auf einem anderen Gerät?',
          a: 'Gib dieselbe E-Mail, mit der du bezahlt hast, unter "Bereits bezahlt? Freischalten" ein. Die Prüfung läuft serverseitig über Stripe — ohne Passwörter.' },
        { q: 'In wie vielen Sprachen funktioniert es?',
          a: '14 Sprachen: Rumänisch, Englisch, Spanisch, Französisch, Deutsch, Portugiesisch, Russisch, Italienisch, Türkisch, Arabisch, Chinesisch, Japanisch, Koreanisch und Hindi.' },
      ],
    },
    pt: {
      eyebrow: 'Perguntas frequentes',
      title: 'Respostas rápidas',
      items: [
        { q: 'O planificador é realmente gratuito?',
          a: 'Sim. O planificador semanal, lista de compras e 200+ receitas são gratuitos sem cadastro. O PDF gratuito oferece uma pré-visualização de 2 de 7 dias.' },
        { q: 'O que recebo com Premium?',
          a: 'PDF completo dos 7 dias, menu económico semanal, acesso às {{RECIPE_COUNT}} receitas de 70+ países e novas receitas regularmente. €3/mês, sem compromisso.' },
        { q: 'Posso cancelar quando quiser?',
          a: 'Sim. Cancele quando quiser no portal Stripe, acessível pelo botão "Manage subscription" após a ativação. Mantém Premium até ao fim do período pago.' },
        { q: 'Preciso criar uma conta?',
          a: 'Para a versão gratuita, não. Para Premium basta um email — usamos apenas para reativar o acesso noutros dispositivos.' },
        { q: 'Como ativo Premium noutro dispositivo?',
          a: 'Introduz o mesmo email que usaste no pagamento em "Já pagou? Desbloqueie". A verificação é feita no servidor via Stripe — sem passwords.' },
        { q: 'Em quantos idiomas funciona?',
          a: '14 idiomas: romeno, inglês, espanhol, francês, alemão, português, russo, italiano, turco, árabe, chinês, japonês, coreano e hindi.' },
      ],
    },
    ru: {
      eyebrow: 'Частые вопросы',
      title: 'Быстрые ответы',
      items: [
        { q: 'Планировщик действительно бесплатный?',
          a: 'Да. Недельный план, список покупок и 200+ рецептов бесплатны без регистрации. Бесплатный PDF показывает превью 2 из 7 дней.' },
        { q: 'Что входит в Премиум?',
          a: 'Полный PDF на все 7 дней, недельное бюджетное меню, доступ ко всем {{RECIPE_COUNT}} рецептам из 70+ стран и новые рецепты регулярно. €3/мес, без обязательств.' },
        { q: 'Могу ли я отменить в любое время?',
          a: 'Да. Отмените в любое время в портале Stripe, доступном через кнопку "Manage subscription" после активации. Премиум сохраняется до конца оплаченного периода.' },
        { q: 'Нужно ли создавать аккаунт?',
          a: 'Для бесплатной версии — нет. Для Премиума достаточно email — мы используем его только для повторной активации на других устройствах.' },
        { q: 'Как активировать Премиум на другом устройстве?',
          a: 'Введите тот же email, которым оплатили, в разделе "Уже оплатили? Откройте". Проверка происходит на сервере через Stripe — без паролей.' },
        { q: 'На скольких языках работает?',
          a: '14 языков: румынский, английский, испанский, французский, немецкий, португальский, русский, итальянский, турецкий, арабский, китайский, японский, корейский и хинди.' },
      ],
    },
    it: {
      eyebrow: 'Domande frequenti',
      title: 'Risposte rapide',
      items: [
        { q: 'Il pianificatore è davvero gratuito?',
          a: 'Sì. Pianificatore settimanale, lista della spesa e 200+ ricette sono gratis senza registrazione. Il PDF gratuito offre un\'anteprima di 2 giorni su 7.' },
        { q: 'Cosa include Premium?',
          a: 'PDF completo 7 giorni, menu economico settimanale, assistente IA ricette (chat) e assistente IA di pianificazione pasti. €3/mese, senza impegno.' },
        { q: 'Posso disdire quando voglio?',
          a: 'Sì. Disdici quando vuoi dal portale Stripe, raggiungibile tramite il pulsante "Manage subscription" dopo l\'attivazione. Mantieni Premium fino alla fine del periodo pagato.' },
        { q: 'Devo creare un account?',
          a: 'Per la versione gratuita, no. Per Premium basta un\'email — la usiamo solo per riattivare l\'accesso su altri dispositivi.' },
        { q: 'Come attivo Premium su un altro dispositivo?',
          a: 'Inserisci la stessa email usata per il pagamento in "Già abbonato? Attiva". La verifica avviene sul server tramite Stripe — senza password.' },
        { q: 'In quante lingue funziona?',
          a: '14 lingue: rumeno, inglese, spagnolo, francese, tedesco, portoghese, russo, italiano, turco, arabo, cinese, giapponese, coreano e hindi.' },
      ],
    },
    tr: {
      eyebrow: 'Sık sorulan sorular',
      title: 'Hızlı yanıtlar',
      items: [
        { q: 'Planlayıcı gerçekten ücretsiz mi?',
          a: 'Evet. Haftalık planlayıcı, alışveriş listesi ve 200+ tarif kayıt olmadan ücretsizdir. Ücretsiz PDF, 7 günden 2 günlük bir önizleme sunar.' },
        { q: 'Premium ile ne kazanırım?',
          a: 'Tüm 7 günler için tam PDF, haftalık bütçe menüsü, 70+ ülkeden {{RECIPE_COUNT}} tarife erişim ve düzenli olarak yeni tarifler. €3/ay, taahhüt yok.' },
        { q: 'İstediğim zaman iptal edebilir miyim?',
          a: 'Evet. Aktivasyondan sonra "Manage subscription" düğmesiyle erişilebilen Stripe portalından istediğin zaman iptal et. Ödenen dönem sonuna kadar Premium devam eder.' },
        { q: 'Hesap oluşturmam gerekiyor mu?',
          a: 'Ücretsiz sürüm için hayır. Premium için bir e-posta yeterli — sadece diğer cihazlarda erişimi yeniden etkinleştirmek için kullanırız.' },
        { q: 'Premium\'u başka bir cihazda nasıl etkinleştiririm?',
          a: 'Ödeme yaptığın aynı e-postayı "Zaten ödedin mi? Kilidini aç" bölümüne gir. Doğrulama Stripe üzerinden sunucu tarafında yapılır — şifre yok.' },
        { q: 'Kaç dili destekliyor?',
          a: '14 dil: Romence, İngilizce, İspanyolca, Fransızca, Almanca, Portekizce, Rusça, İtalyanca, Türkçe, Arapça, Çince, Japonca, Korece ve Hintçe.' },
      ],
    },
    ar: {
      eyebrow: 'الأسئلة الشائعة',
      title: 'إجابات سريعة',
      items: [
        { q: 'هل المخطط مجاني بالفعل؟',
          a: 'نعم. المخطط الأسبوعي وقائمة التسوق و200+ وصفة مجانية بدون تسجيل. ملف PDF المجاني يعرض معاينة 2 من 7 أيام.' },
        { q: 'ماذا أحصل مع بريميوم؟',
          a: 'PDF كامل لجميع 7 أيام، قائمة ميزانية أسبوعية، الوصول إلى جميع {{RECIPE_COUNT}} وصفة من أكثر من 70 دولة، ووصفات جديدة بانتظام. €3/شهر، بدون التزام.' },
        { q: 'هل يمكنني الإلغاء في أي وقت؟',
          a: 'نعم. ألغِ في أي وقت من بوابة Stripe، التي يمكن الوصول إليها عبر زر "Manage subscription" بعد التفعيل. تستمر بريميوم حتى نهاية الفترة المدفوعة.' },
        { q: 'هل أحتاج إلى إنشاء حساب؟',
          a: 'للنسخة المجانية، لا. لبريميوم بريد إلكتروني واحد يكفي — نستخدمه فقط لإعادة تفعيل الوصول على الأجهزة الأخرى.' },
        { q: 'كيف أفعّل بريميوم على جهاز آخر؟',
          a: 'أدخل البريد الإلكتروني نفسه الذي دفعت به في "هل دفعت بالفعل؟ افتح". يتم التحقق على الخادم عبر Stripe — بدون كلمات مرور.' },
        { q: 'كم لغة يدعم؟',
          a: '14 لغة: الرومانية، الإنجليزية، الإسبانية، الفرنسية، الألمانية، البرتغالية، الروسية، الإيطالية، التركية، العربية، الصينية، اليابانية، الكورية والهندية.' },
      ],
    },
    zh: {
      eyebrow: '常见问题',
      title: '快速解答',
      items: [
        { q: '规划器真的免费吗？',
          a: '是的。每周规划器、购物清单和200+食谱免费且无需注册。免费PDF提供7天中2天的预览。' },
        { q: '高级版包含什么？',
          a: '7天完整PDF、每周节俭菜单、访问来自70+国家的{{RECIPE_COUNT}}道食谱，以及定期添加的新食谱。€3/月，无承诺。' },
        { q: '可以随时取消吗？',
          a: '可以。激活后通过"Manage subscription"按钮进入Stripe门户随时取消。在已付费时段结束前继续保留高级版。' },
        { q: '需要创建账户吗？',
          a: '免费版不需要。高级版只需邮箱 — 仅用于在其他设备重新激活访问权限。' },
        { q: '如何在新设备上激活高级版？',
          a: '在"已经付款？解锁"部分输入付款时使用的邮箱。验证通过Stripe在服务器端进行 — 无需密码。' },
        { q: '支持多少种语言？',
          a: '14种语言：罗马尼亚语、英语、西班牙语、法语、德语、葡萄牙语、俄语、意大利语、土耳其语、阿拉伯语、中文、日语、韩语和印地语。' },
      ],
    },
    ja: {
      eyebrow: 'よくある質問',
      title: '簡単な回答',
      items: [
        { q: 'プランナーは本当に無料ですか？',
          a: 'はい。週間プランナー、買い物リスト、200以上のレシピは登録不要で無料です。無料PDFは7日中2日のプレビューを提供します。' },
        { q: 'プレミアムには何が含まれますか？',
          a: '7日間フルPDF、週間節約メニュー、70カ国以上から{{RECIPE_COUNT}}のレシピへのアクセス、定期的に追加される新レシピ。€3/月、契約縛りなし。' },
        { q: 'いつでもキャンセルできますか？',
          a: 'はい。アクティベーション後「Manage subscription」ボタンからアクセスできるStripeポータルでいつでもキャンセル可能。支払期間終了までプレミアムは継続します。' },
        { q: 'アカウントを作る必要がありますか？',
          a: '無料版では不要です。プレミアムはメールアドレスのみ — 他のデバイスでアクセスを再有効化するためだけに使用します。' },
        { q: '他のデバイスでプレミアムを有効化するには？',
          a: '支払いに使ったメールアドレスを「すでに支払いましたか？ロック解除」に入力してください。検証はStripe経由でサーバー側で行われます — パスワード不要。' },
        { q: '何言語に対応していますか？',
          a: '14言語：ルーマニア語、英語、スペイン語、フランス語、ドイツ語、ポルトガル語、ロシア語、イタリア語、トルコ語、アラビア語、中国語、日本語、韓国語、ヒンディー語。' },
      ],
    },
    ko: {
      eyebrow: '자주 묻는 질문',
      title: '빠른 답변',
      items: [
        { q: '플래너가 정말 무료인가요?',
          a: '네. 주간 플래너, 장보기 목록, 200개 이상의 레시피는 가입 없이 무료입니다. 무료 PDF는 7일 중 2일 미리보기를 제공합니다.' },
        { q: '프리미엄에는 무엇이 포함되나요?',
          a: '7일 전체 PDF, 주간 예산 메뉴, 70+ 국가의 {{RECIPE_COUNT}}개 레시피 모두 이용, 정기적으로 추가되는 새 레시피. €3/월, 약정 없음.' },
        { q: '언제든 취소할 수 있나요?',
          a: '네. 활성화 후 "Manage subscription" 버튼으로 접근 가능한 Stripe 포털에서 언제든 취소할 수 있습니다. 결제 기간 끝까지 프리미엄은 유지됩니다.' },
        { q: '계정을 만들어야 하나요?',
          a: '무료 버전은 필요 없습니다. 프리미엄은 이메일만 있으면 됩니다 — 다른 기기에서 액세스를 재활성화하는 용도로만 사용합니다.' },
        { q: '새 기기에서 프리미엄을 어떻게 활성화하나요?',
          a: '"이미 결제하셨나요? 잠금 해제" 섹션에 결제 시 사용한 동일한 이메일을 입력하세요. 검증은 Stripe를 통해 서버 측에서 진행됩니다 — 비밀번호 불필요.' },
        { q: '몇 개 언어를 지원하나요?',
          a: '14개 언어: 루마니아어, 영어, 스페인어, 프랑스어, 독일어, 포르투갈어, 러시아어, 이탈리아어, 터키어, 아랍어, 중국어, 일본어, 한국어, 힌디어.' },
      ],
    },
    hi: {
      eyebrow: 'अक्सर पूछे जाने वाले प्रश्न',
      title: 'त्वरित उत्तर',
      items: [
        { q: 'क्या प्लानर वास्तव में मुफ्त है?',
          a: 'हाँ। साप्ताहिक प्लानर, खरीदारी सूची और 200+ रेसिपी पंजीकरण के बिना मुफ्त हैं। मुफ्त PDF 7 में से 2 दिनों का पूर्वावलोकन प्रदान करता है।' },
        { q: 'प्रीमियम में क्या मिलता है?',
          a: 'सभी 7 दिनों के लिए पूर्ण PDF, साप्ताहिक बजट मेनू, 70+ देशों से सभी {{RECIPE_COUNT}} रेसिपी तक पहुँच, और नियमित रूप से जोड़ी जाने वाली नई रेसिपी। €3/माह, कोई प्रतिबद्धता नहीं।' },
        { q: 'क्या मैं कभी भी रद्द कर सकता हूँ?',
          a: 'हाँ। सक्रियण के बाद "Manage subscription" बटन के माध्यम से पहुँच योग्य Stripe पोर्टल से कभी भी रद्द करें। भुगतान की गई अवधि के अंत तक प्रीमियम जारी रहता है।' },
        { q: 'क्या मुझे खाता बनाने की आवश्यकता है?',
          a: 'मुफ्त संस्करण के लिए नहीं। प्रीमियम के लिए एक ईमेल पर्याप्त है — हम इसका उपयोग केवल अन्य उपकरणों पर एक्सेस को पुनः सक्रिय करने के लिए करते हैं।' },
        { q: 'नए डिवाइस पर प्रीमियम कैसे सक्रिय करें?',
          a: 'भुगतान के लिए उपयोग किया गया ईमेल "पहले से भुगतान किया? अनलॉक करें" में दर्ज करें। सत्यापन Stripe के माध्यम से सर्वर-साइड पर होता है — पासवर्ड नहीं।' },
        { q: 'कितनी भाषाओं में काम करता है?',
          a: '14 भाषाएँ: रोमानियाई, अंग्रेजी, स्पेनिश, फ्रेंच, जर्मन, पुर्तगाली, रूसी, इतालवी, तुर्की, अरबी, चीनी, जापानी, कोरियाई और हिंदी।' },
      ],
    },
  };
  const s = copy[lang] || copy.en;

  const itemsHTML = s.items.map(item => `
    <details class="hp-faq-item">
      <summary class="hp-faq-summary">${safeText(fillRecipeCount(item.q))}</summary>
      <div class="hp-faq-body">${safeText(fillRecipeCount(item.a))}</div>
    </details>`).join('');

  const html = `
    <section id="${ID}" class="hp-faq hp-fade-in no-print" aria-labelledby="hp-faq-title">
      <div class="hp-faq-head">
        <span class="hp-faq-eyebrow">${safeText(s.eyebrow)}</span>
        <h2 id="hp-faq-title" class="hp-faq-title">${safeText(s.title)}</h2>
      </div>
      <div class="hp-faq-list">${itemsHTML}</div>
    </section>`;

  // Insert right before the SEO paragraph (it lives inside #pdf-content
  // near the bottom of the page). Fallback: before feedback section.
  const seoEl = document.getElementById('seo-paragraph');
  if (seoEl) {
    seoEl.insertAdjacentHTML('beforebegin', html);
  } else {
    document.getElementById('feedback-section')?.insertAdjacentHTML('beforebegin', html);
  }
}

// Localized label for the sticky upgrade pill — used by both
// updateStickyUpgradeText() (called from applyTranslations) and the
// observer setup. Kept module-scope so phases stay decoupled.
const STICKY_UPGRADE_LABEL = {
  ro: '⭐ Vezi Premium · €3/lună',  en: '⭐ Get Premium · €3/mo',
  es: '⭐ Ver Premium · €3/mes',    fr: '⭐ Voir Premium · €3/mois',
  de: '⭐ Premium · €3/Monat',      pt: '⭐ Ver Premium · €3/mês',
  ru: '⭐ Премиум · €3/мес',        it: '⭐ Premium · €3/mese',
  tr: '⭐ Premium · €3/ay',         ar: '⭐ بريميوم · €3/شهر',
  zh: '⭐ 高级版 · €3/月',           ja: '⭐ プレミアム · €3/月',
  ko: '⭐ 프리미엄 · €3/월',         hi: '⭐ प्रीमियम · €3/माह',
};

function updateStickyUpgradeText() {
  const pill = document.getElementById('hp-sticky-upgrade');
  if (!pill) return;
  pill.textContent = STICKY_UPGRADE_LABEL[lang] || STICKY_UPGRADE_LABEL.en;
  pill.setAttribute('aria-label', STICKY_UPGRADE_LABEL[lang] || STICKY_UPGRADE_LABEL.en);
  pill.setAttribute('href', NAV_PRICING_LINKS[lang] || NAV_PRICING_LINKS.en);
}

// Local state for the sticky pill visibility. Updated by the
// IntersectionObservers below and reread when the user becomes premium.
let _stickyState = { pastHero: false, pricingVisible: false };

function refreshStickyUpgrade() {
  const pill = document.getElementById('hp-sticky-upgrade');
  if (!pill) return;
  const premium = !!window.hasUnlimited;
  const show = _stickyState.pastHero && !premium && !_stickyState.pricingVisible;
  pill.classList.toggle('hp-sticky-upgrade--show', show);
}

// Phase 12 — Variable font axis play. As the user scrolls past the
// hero, the headline's opsz and GRAD axes shift subtly. Pure type-
// nerd flex; invisible to most but quietly signals craft.
function setupHeroVariableFontScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof IntersectionObserver === 'undefined') return;
  const hero = document.querySelector('.hero');
  if (!hero || hero.dataset.fontScrollBound === '1') return;
  hero.dataset.fontScrollBound = '1';

  let raf = null;
  const update = () => {
    raf = null;
    const rect = hero.getBoundingClientRect();
    const heroH = rect.height || 1;
    // 0 when hero is full in view; 1 when hero has scrolled fully out.
    const p = Math.min(1, Math.max(0, -rect.top / heroH));
    // opsz: 144 (display) → 36 (text) as scroll deepens. GRAD: 0 → -50.
    const opsz = 144 - 108 * p;
    const grad = 0 - 80 * p;
    document.documentElement.style.setProperty('--hero-opsz', opsz.toFixed(1));
    document.documentElement.style.setProperty('--hero-grad', grad.toFixed(1));
  };
  window.addEventListener('scroll', () => {
    if (raf) return;
    raf = requestAnimationFrame(update);
  }, { passive: true });
  update();
}

// Phase 9 — Magnetic CTAs: the main upgrade buttons follow the cursor
// slightly when it hovers, giving them an "attractor" feel. Capped at
// 9px translation on each axis. Only the primary conversion buttons
// (Premium upgrade, preview CTA, hero CTA, generic .btn-upgrade) are
// wired — secondary links stay still.
function setupMagneticCTAs() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(hover: hover)').matches) return;
  // Phase 11 — editorial restraint: magnetic only on the one true
  // conversion moment (the pricing card upgrade button). Every other
  // CTA stays still so the page reads calm instead of cluttered.
  const SELECTOR = '#pricing-upgrade-btn';
  document.querySelectorAll(SELECTOR).forEach(btn => {
    if (btn.dataset.magnetic === '1') return;
    btn.dataset.magnetic = '1';
    let raf = null;
    btn.addEventListener('mousemove', (e) => {
      if (raf) return;
      const rect = btn.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 18; // ±9px
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 18;
      raf = requestAnimationFrame(() => {
        btn.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
        raf = null;
      });
    }, { passive: true });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// Phase 9 — Confetti burst, fired exactly once when premium activates
// (Stripe success redirect or first-time successful manual verify).
// Canvas is created on-the-fly and removed when particles settle —
// no library dependency, no idle DOM after the celebration.
function celebratePremium() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try {
    if (sessionStorage.getItem('mp:celebrated') === '1') return;
    sessionStorage.setItem('mp:celebrated', '1');
  } catch (_) { /* sessionStorage blocked — celebrate anyway */ }

  const canvas = document.createElement('canvas');
  canvas.style.cssText =
    'position:fixed;inset:0;pointer-events:none;z-index:9999;';
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width  = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const colors = ['#d4a017', '#f5c243', '#fff5d6', '#2d8f47', '#a3d977', '#b5891b'];
  const N = 90;
  const cx = innerWidth / 2;
  const cy = innerHeight * 0.35;
  const particles = Array.from({ length: N }, () => ({
    x: cx + (Math.random() - 0.5) * 220,
    y: cy,
    vx: (Math.random() - 0.5) * 14,
    vy: -Math.random() * 18 - 6,
    g: 0.42,
    drag: 0.992,
    rot: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.32,
    w: 6 + Math.random() * 7,
    h: 4 + Math.random() * 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    life: 0,
    maxLife: 150 + Math.random() * 60,
  }));

  let frame = 0;
  const tick = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    let alive = false;
    for (const p of particles) {
      if (p.life > p.maxLife) continue;
      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life++;
      alive = true;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    frame++;
    if (alive && frame < 320) {
      requestAnimationFrame(tick);
    } else {
      canvas.remove();
    }
  };
  requestAnimationFrame(tick);
}

// Phase 8 — Card choreography: 3D tilt on hover for the major card
// surfaces. RAF-throttled, capped at ±6° per axis. Uses pointermove
// so pen + touch + mouse all work (touch falls through to the
// pointerleave reset). Reset transform on leave so the card eases
// back to rest via the CSS transition.
function setupCardTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(hover: hover)').matches) return;
  const SELECTOR = '.hp-preview-card, .hp-cuisine-card, .discovery-card, .step-item';
  document.querySelectorAll(SELECTOR).forEach(card => {
    if (card.dataset.tilted === '1') return;
    card.dataset.tilted = '1';
    let raf = null;
    card.addEventListener('mousemove', (e) => {
      if (raf) return;
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 12; // ±6deg
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 12;
      raf = requestAnimationFrame(() => {
        card.style.transform =
          `perspective(900px) rotateY(${x.toFixed(2)}deg) rotateX(${(-y).toFixed(2)}deg) translateY(-3px)`;
        raf = null;
      });
    }, { passive: true });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// Phase 8 — Apply --stagger-index to children of grid-like containers
// so the CSS stagger animation reveals them in sequence on scroll-in.
// Also tag the v2 section wrappers with .hp-fade-in so they trigger
// the scroll observer.
function applyStaggerAndFadeMarkers() {
  // Containers whose children should stagger.
  document.querySelectorAll(
    '.hp-trust-row, .hp-premium-preview-grid, .hp-faq-list, ' +
    '.hp-cuisine-grid, .discovery-cards, .steps-grid'
  ).forEach(parent => {
    Array.from(parent.children).forEach((child, i) => {
      child.style.setProperty('--stagger-index', i);
    });
  });
  // Sections that should fade in on scroll. The hp-trust-signals,
  // hp-premium-preview, hp-faq are already tagged inside their render
  // functions; tag the legacy ones here.
  [
    'product-preview-section',
    'discovery-section',
    'hp-cuisine-discover',
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.classList.contains('hp-fade-in')) {
      el.classList.add('hp-fade-in');
    }
  });
}

// Phase 7 — Hero choreography: animate the .hero-stat-num spans from
// 0 → target value when they scroll into view. Handles values like
// "175+", "14", "€3", "Free", "175+ Recipes" by parsing the numeric
// prefix and keeping the suffix as-is. No-ops if the value has no
// digits (e.g. "Free", "मुफ़्त" — but Phase 4 already replaced those
// with "€3").
function setupHeroCounters() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof IntersectionObserver === 'undefined') return;
  const stats = document.querySelectorAll('.hero-stat-num[data-count-target]');
  if (!stats.length) return;

  const animate = (el, raw) => {
    // Parse: optional prefix (€, $, etc.), integer, optional suffix (+, %, k).
    const m = /^([^\d-]*)(-?\d+(?:\.\d+)?)(.*)$/.exec(raw || '');
    if (!m) return; // No digits — leave as-is.
    const prefix = m[1];
    const target = parseFloat(m[2]);
    const suffix = m[3];
    const start = performance.now();
    const dur = 1200;
    const step = (now) => {
      const elapsed = now - start;
      const p = Math.min(elapsed / dur, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.round(target * eased);
      el.textContent = prefix + v + (p >= 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = prefix + '0' + suffix;
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target.dataset.counted) {
        e.target.dataset.counted = '1';
        animate(e.target, e.target.getAttribute('data-count-target'));
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.55 });
  stats.forEach(s => io.observe(s));
}

// Phase 7 — Mouse parallax on the hero phone mockup. The phone tilts
// gently toward the cursor while the user is over the hero. The bob
// animation lives on .hero-phone-wrap (parent); we set the tilt on
// .hero-phone-frame (child) so the two transforms never conflict.
function setupHeroParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(hover: hover)').matches) return;
  const hero = document.querySelector('.hero');
  if (!hero || hero.dataset.parallaxBound === '1') return;
  hero.dataset.parallaxBound = '1';

  // Query the phone INSIDE the handler each frame — renderPremiumHero()
  // replaces the hero's innerHTML on language switch, so any captured
  // reference would point to a detached node after the first re-render.
  let raf = null;
  hero.addEventListener('mousemove', (e) => {
    if (raf) return;
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    raf = requestAnimationFrame(() => {
      const phone = hero.querySelector('.hero-phone-frame');
      if (phone) {
        phone.style.transform =
          `perspective(1200px) rotateY(${(x * 8).toFixed(2)}deg) rotateX(${(-y * 8).toFixed(2)}deg)`;
      }
      raf = null;
    });
  }, { passive: true });
  hero.addEventListener('mouseleave', () => {
    const phone = hero.querySelector('.hero-phone-frame');
    if (phone) phone.style.transform = '';
  });
}

// Phase 6 — Atmosphere: cursor glow tracking. Updates --mouse-x / --mouse-y
// CSS custom properties on body so the warm radial halo behind ::after
// follows the pointer. RAF-throttled. Only active on hover-capable devices
// and when reduced-motion is not requested.
function setupCursorAtmosphere() {
  if (!window.matchMedia('(hover: hover)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (document.body.dataset.cursorBound === '1') return;
  document.body.dataset.cursorBound = '1';

  let raf = null;
  let lastX = 0, lastY = 0;
  document.addEventListener('mousemove', (e) => {
    lastX = e.clientX;
    lastY = e.clientY;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      document.body.style.setProperty('--mouse-x', lastX + 'px');
      document.body.style.setProperty('--mouse-y', lastY + 'px');
      if (!document.body.classList.contains('hp-cursor-active')) {
        document.body.classList.add('hp-cursor-active');
      }
      raf = null;
    });
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    document.body.classList.remove('hp-cursor-active');
  });
}

function setupStickyUpgrade() {
  const pill = document.getElementById('hp-sticky-upgrade');
  if (!pill) return;
  if (typeof IntersectionObserver === 'undefined') return;
  if (pill.dataset.observed === '1') return;
  pill.dataset.observed = '1';

  // Watch the hero: once it scrolls offscreen, the pill becomes a candidate.
  const hero = document.querySelector('.hero');
  if (hero) {
    new IntersectionObserver((entries) => {
      _stickyState.pastHero = !entries[0].isIntersecting;
      refreshStickyUpgrade();
    }, { rootMargin: '-60px' }).observe(hero);
  }

  // Watch the pricing section: when it's on screen, hide the pill —
  // no need for a second CTA when the primary one is already visible.
  const pricing = document.getElementById('pricing-section');
  if (pricing) {
    new IntersectionObserver((entries) => {
      _stickyState.pricingVisible = entries[0].isIntersecting;
      refreshStickyUpgrade();
    }, { threshold: 0.15 }).observe(pricing);
  }
}

function setupScrollFadeIn() {
  if (typeof IntersectionObserver === 'undefined') return;
  const els = document.querySelectorAll('.hp-fade-in:not(.is-visible)');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '-40px' });
  els.forEach(el => io.observe(el));
}

function renderCuisineDiscover() {
  const ID = 'hp-cuisine-discover';
  // Remove the previous render AND the static fallback (no id attribute)
  // so language switch produces a fresh localized block.
  document.getElementById(ID)?.remove();
  document.querySelectorAll('.hp-cuisine-discover').forEach(el => {
    if (el.id !== ID) el.remove();
  });

  // Recipe URL segment per locale — must match generate-content.mjs RECIPE_LANG.
  const recipesBase = {
    ro:'retete', en:'recipes', es:'recetas', fr:'recettes', de:'rezepte',
    pt:'receitas', ru:'retsepty', ar:'wasafat', zh:'shipu', ja:'reshipi',
    ko:'recipes', hi:'recipes', tr:'tarifler', it:'ricette',
  };
  const rSeg = recipesBase[lang] || 'recipes';

  const COUNTRY_BY_SLUG = {
    france:'France', italy:'Italy', greece:'Greece',
    romania:'Romania', japan:'Japan', mexico:'Mexico',
  };
  // The corpus is lazy-loaded and usually absent when the homepage first
  // renders, so fall back to static counts (mirror recipes.js origin counts).
  // Order + slug set must match the static-gen top-6 from buildCuisineHubs()
  // in scripts/generate-content.mjs (count DESC, alpha ASC tie-break).
  const CUISINE_COUNT_FALLBACK = { france:13, italy:12, greece:11, romania:11, japan:10, mexico:10 };
  const cuisineCount = slug => recipesMain.length
    ? recipesMain.filter(r => r.origin?.en === COUNTRY_BY_SLUG[slug]).length
    : (CUISINE_COUNT_FALLBACK[slug] || 0);
  const cuisines = [
    { slug:'france',  flag:'🇫🇷', count:cuisineCount('france'),  atmosphere:'mediterranean' },
    { slug:'italy',   flag:'🇮🇹', count:cuisineCount('italy'),   atmosphere:'mediterranean' },
    { slug:'greece',  flag:'🇬🇷', count:cuisineCount('greece'),  atmosphere:'mediterranean' },
    { slug:'romania', flag:'🇷🇴', count:cuisineCount('romania'), atmosphere:'east-european' },
    { slug:'japan',   flag:'🇯🇵', count:cuisineCount('japan'),   atmosphere:'east-asian' },
    { slug:'mexico',  flag:'🇲🇽', count:cuisineCount('mexico'),  atmosphere:'latin' },
  ];

  const copy = {
    ro: { eyebrow:'Bucătării', heading:'Explorează bucătării din toată lumea',
      sub:'46 bucătării internaționale, fiecare cu rețete autentice și planificator gratuit.',
      cta:'Vezi toate cele 46 bucătării',
      names:{ france:'Franța', italy:'Italia', greece:'Grecia', romania:'România', japan:'Japonia', mexico:'Mexic' },
      dishes:{ france:'Quiche Lorraine · Ratatouille · Supă de ceapă franțuzească',
        japan:'Sushi · Ramen clasic japonez · Curry japonez',
        mexico:'Tacos · Guacamole · Chili con carne',
        greece:'Souvlaki · Tzatziki · Moussaka',
        italy:'Spaghete Carbonara · Risotto · Pasta e fagioli',
        romania:'Sarmale · Mămăligă · Mici' } },
    en: { eyebrow:'Cuisines', heading:'Explore cuisines from around the world',
      sub:'46 international cuisines, each with authentic recipes and a free planner.',
      cta:'See all 46 cuisines',
      names:{ france:'France', italy:'Italy', greece:'Greece', romania:'Romania', japan:'Japan', mexico:'Mexico' },
      dishes:{ france:'Quiche Lorraine · Ratatouille · French onion soup',
        japan:'Sushi · Classic Japanese ramen · Japanese curry',
        mexico:'Tacos · Guacamole · Chili con carne',
        greece:'Souvlaki · Tzatziki · Moussaka',
        italy:'Spaghetti Carbonara · Risotto · Pasta e fagioli',
        romania:'Sarmale · Mămăligă · Mici' } },
    es: { eyebrow:'Cocinas', heading:'Explora cocinas del mundo',
      sub:'46 cocinas internacionales, cada una con recetas auténticas y planificador gratuito.',
      cta:'Ver las 46 cocinas',
      names:{ france:'Francia', italy:'Italia', greece:'Grecia', romania:'Rumanía', japan:'Japón', mexico:'México' },
      dishes:{ france:'Quiche Lorraine · Ratatouille · Sopa de cebolla francesa',
        japan:'Sushi · Ramen japonés clásico · Curry japonés',
        mexico:'Tacos · Guacamole · Chili con carne',
        greece:'Souvlaki · Tzatziki · Musaca',
        italy:'Espagueti a la carbonara · Risotto · Pasta e fagioli',
        romania:'Sarmale · Mămăligă · Mici' } },
    fr: { eyebrow:'Cuisines', heading:'Explorez les cuisines du monde',
      sub:'46 cuisines internationales, chacune avec des recettes authentiques et un planificateur gratuit.',
      cta:'Voir les 46 cuisines',
      names:{ france:'France', italy:'Italie', greece:'Grèce', romania:'Roumanie', japan:'Japon', mexico:'Mexique' },
      dishes:{ france:'Quiche lorraine · Ratatouille · Soupe à l\'oignon',
        japan:'Sushi · Ramen japonais classique · Curry japonais',
        mexico:'Tacos · Guacamole · Chili con carne',
        greece:'Souvlaki · Tzatzíki · Moussaka',
        italy:'Spaghetti carbonara · Risotto · Pasta e fagioli',
        romania:'Sarmale · Mămăligă · Mici' } },
    de: { eyebrow:'Küchen', heading:'Entdecke Küchen aus aller Welt',
      sub:'46 internationale Küchen, jede mit authentischen Rezepten und kostenlosem Planer.',
      cta:'Alle 46 Küchen ansehen',
      names:{ france:'Frankreich', italy:'Italien', greece:'Griechenland', romania:'Rumänien', japan:'Japan', mexico:'Mexiko' },
      dishes:{ france:'Quiche Lorraine · Ratatouille · Französische Zwiebelsuppe',
        japan:'Sushi · Klassisches japanisches Ramen · Japanisches Curry',
        mexico:'Tacos · Guacamole · Chili con carne',
        greece:'Souvlaki · Tzatziki · Moussaka',
        italy:'Spaghetti Carbonara · Risotto · Pasta e fagioli',
        romania:'Sarmale · Mămăligă · Mici' } },
    pt: { eyebrow:'Cozinhas', heading:'Explore cozinhas de todo o mundo',
      sub:'46 cozinhas internacionais, cada uma com receitas autênticas e planificador gratuito.',
      cta:'Ver todas as 46 cozinhas',
      names:{ france:'França', italy:'Itália', greece:'Grécia', romania:'Romênia', japan:'Japão', mexico:'México' },
      dishes:{ france:'Quiche Lorraine · Ratatouille · Sopa de cebola francesa',
        japan:'Sushi · Ramen japonês clássico · Curry japonês',
        mexico:'Tacos · Guacamole · Chili con carne',
        greece:'Souvlaki · Tzatziki · Moussaka',
        italy:'Espaguete à carbonara · Risoto · Pasta e fagioli',
        romania:'Sarmale · Mămăligă · Mici' } },
    ru: { eyebrow:'Кухни', heading:'Откройте кухни со всего мира',
      sub:'46 международных кухонь, каждая с аутентичными рецептами и бесплатным планировщиком.',
      cta:'Посмотреть все 46 кухонь',
      names:{ france:'Франция', italy:'Италия', greece:'Греция', romania:'Румыния', japan:'Япония', mexico:'Мексика' },
      dishes:{ france:'Киш Лорен · Рататуй · Французский луковый суп',
        japan:'Суши · Классический японский рамен · Японское карри',
        mexico:'Такос · Гуакамоле · Чили кон карне',
        greece:'Сувлаки · Цацики · Мусака',
        italy:'Спагетти карбонара · Ризотто · Паста э фаджоли',
        romania:'Сармале · Мамалыга · Мичи' } },
    it: { eyebrow:'Cucine', heading:'Esplora cucine da tutto il mondo',
      sub:'46 cucine internazionali, ognuna con ricette autentiche e pianificatore gratuito.',
      cta:'Vedi tutte le 46 cucine',
      names:{ france:'Francia', italy:'Italia', greece:'Grecia', romania:'Romania', japan:'Giappone', mexico:'Messico' },
      dishes:{ france:'Quiche Lorraine · Ratatouille · Zuppa di cipolle francese',
        japan:'Sushi · Ramen giapponese classico · Curry giapponese',
        mexico:'Tacos · Guacamole · Chili con carne',
        greece:'Souvlaki · Tzatziki · Moussaka',
        italy:'Spaghetti alla carbonara · Risotto · Pasta e fagioli',
        romania:'Sarmale · Mămăligă · Mici' } },
    tr: { eyebrow:'Mutfaklar', heading:'Dünyanın dört bir yanından mutfakları keşfedin',
      sub:'46 uluslararası mutfak, her biri özgün tarifler ve ücretsiz planlayıcı ile.',
      cta:'46 mutfağın tamamına bak',
      names:{ france:'Fransa', italy:'İtalya', greece:'Yunanistan', romania:'Romanya', japan:'Japonya', mexico:'Meksika' },
      dishes:{ france:'Quiche Lorraine · Ratatouille · Fransız soğan çorbası',
        japan:'Suşi · Klasik Japon ramen · Japon köri',
        mexico:'Tacos · Guacamole · Chili con carne',
        greece:'Souvlaki · Cacık · Musakka',
        italy:'Spagetti Carbonara · Risotto · Pasta e fagioli',
        romania:'Sarmale · Mămăligă · Mici' } },
    ar: { eyebrow:'المطابخ', heading:'استكشف المطابخ من جميع أنحاء العالم',
      sub:'46 مطبخًا دوليًا، كل منها بوصفات أصيلة ومخطط مجاني.',
      cta:'شاهد كل 46 مطبخًا',
      names:{ france:'فرنسا', italy:'إيطاليا', greece:'اليونان', romania:'رومانيا', japan:'اليابان', mexico:'المكسيك' },
      dishes:{ france:'كيش لورين · راتاتوي · حساء البصل الفرنسي',
        japan:'سوشي · رامن ياباني كلاسيكي · كاري ياباني',
        mexico:'تاكو · جواكامولي · تشيلي كون كارني',
        greece:'سوفلاكي · تزاتزيكي · موساكا',
        italy:'سباغيتي كاربونارا · ريزوتو · باستا إي فاجولي',
        romania:'سارمالي · مأمليغا · ميتشي' } },
    zh: { eyebrow:'美食', heading:'探索世界各地的美食',
      sub:'46种国际美食，每一种都有正宗食谱和免费规划器。',
      cta:'查看全部46种美食',
      names:{ france:'法国', italy:'意大利', greece:'希腊', romania:'罗马尼亚', japan:'日本', mexico:'墨西哥' },
      dishes:{ france:'洛林乳蛋饼 · 普罗旺斯炖菜 · 法式洋葱汤',
        japan:'寿司 · 经典日式拉面 · 日式咖喱',
        mexico:'塔可 · 鳄梨酱 · 辣肉酱',
        greece:'烤肉串 · 酸奶酱 · 慕沙卡',
        italy:'培根蛋面 · 烩饭 · 意式豆面汤',
        romania:'卷心菜卷 · 玉米粥 · 米奇烤肉' } },
    ja: { eyebrow:'料理', heading:'世界の料理を探索',
      sub:'46の国際料理、それぞれに本格的なレシピと無料プランナー。',
      cta:'46の料理すべてを見る',
      names:{ france:'フランス', italy:'イタリア', greece:'ギリシャ', romania:'ルーマニア', japan:'日本', mexico:'メキシコ' },
      dishes:{ france:'キッシュ・ロレーヌ · ラタトゥイユ · オニオングラタンスープ',
        japan:'寿司 · クラシックなラーメン · 日本のカレー',
        mexico:'タコス · ワカモレ · チリコンカルネ',
        greece:'スブラキ · ザジキ · ムサカ',
        italy:'スパゲッティ・カルボナーラ · リゾット · パスタ・エ・ファジョーリ',
        romania:'サルマレ · ママリガ · ミチ' } },
    ko: { eyebrow:'요리', heading:'세계 각국의 요리 탐험',
      sub:'46가지 국제 요리, 각각 정통 레시피와 무료 플래너 포함.',
      cta:'46가지 요리 모두 보기',
      names:{ france:'프랑스', italy:'이탈리아', greece:'그리스', romania:'루마니아', japan:'일본', mexico:'멕시코' },
      dishes:{ france:'키슈 로렌 · 라타투이 · 프렌치 어니언 수프',
        japan:'스시 · 클래식 일본 라멘 · 일본 카레',
        mexico:'타코 · 과카몰리 · 칠리 콘 카르네',
        greece:'수블라키 · 차치키 · 무사카',
        italy:'스파게티 카르보나라 · 리소토 · 파스타 에 파지올리',
        romania:'사르말레 · 마말리가 · 미치' } },
    hi: { eyebrow:'व्यंजन', heading:'दुनिया भर के व्यंजन देखें',
      sub:'46 अंतर्राष्ट्रीय व्यंजन, हर एक में प्रामाणिक रेसिपी और मुफ्त प्लानर।',
      cta:'सभी 46 व्यंजन देखें',
      names:{ france:'फ्रांस', italy:'इटली', greece:'यूनान', romania:'रोमानिया', japan:'जापान', mexico:'मेक्सिको' },
      dishes:{ france:'किश लोरेन · रतातुई · फ्रेंच प्याज सूप',
        japan:'सुशी · क्लासिक जापानी रामेन · जापानी करी',
        mexico:'टैकोस · ग्वाकामोल · चिली कोन कार्ने',
        greece:'सूवलाकी · ज़ात्ज़ीकी · मुसाका',
        italy:'स्पेगेटी कार्बोनारा · रिसोट्टो · पास्ता ए फजोली',
        romania:'सरमाले · मामलिगा · मिची' } },
  };
  const s = copy[lang] || copy.en;

  const cardsHTML = cuisines.map(c => `
      <a class="hp-cuisine-card" href="/${lang}/${rSeg}/${c.slug}/" data-cuisine-atmosphere="${c.atmosphere}">
        <span class="hp-cuisine-card-flag" aria-hidden="true">${c.flag}</span>
        <span class="hp-cuisine-card-body">
          <span class="hp-cuisine-card-top">
            <span class="hp-cuisine-card-name">${safeText(s.names[c.slug])}</span>
            <span class="hp-cuisine-card-count">${c.count}</span>
          </span>
          <span class="hp-cuisine-card-dishes">${safeText(s.dishes[c.slug])}</span>
        </span>
      </a>`).join('');

  const html = `
    <section id="${ID}" class="hp-cuisine-discover no-print" aria-labelledby="hp-cuisine-heading">
      <div class="hp-cuisine-inner">
        <div class="hp-cuisine-head">
          <span class="hp-cuisine-eyebrow">${safeText(s.eyebrow)}</span>
          <h2 id="hp-cuisine-heading" class="hp-cuisine-title">${safeText(s.heading)}</h2>
          <p class="hp-cuisine-sub">${safeText(s.sub)}</p>
        </div>
        <div class="hp-cuisine-grid">${cardsHTML}</div>
        <p class="hp-cuisine-cta">
          <a class="hp-cuisine-cta-btn" href="/${lang}/${rSeg}/">${safeText(s.cta)}</a>
        </p>
      </div>
    </section>`;

  // Insert before the product-preview section if it already exists, else
  // after the hero. Makes the function order-independent within applyTranslations().
  const ppEl = document.getElementById('product-preview-section');
  if (ppEl) {
    ppEl.insertAdjacentHTML('beforebegin', html);
  } else {
    document.querySelector('.hero')?.insertAdjacentHTML('afterend', html);
  }
}

function applyTranslations() {
  // 0) Update <html lang> and RTL direction for the active language
  document.documentElement.lang = lang;
  document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

  // 1) Texte statice cu data-i18n (safe: fallback to en if key missing)
  const t = key => i18n[lang]?.[key] ?? i18n['en']?.[key] ?? '';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val) el.innerHTML = val;
  });
  // 2) Placeholderele (safe)
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = t(key);
    if (val) el.placeholder = val;
  });
  // 3) Butoanele principale
  const generateBtn = document.getElementById('generate-btn');
  const paidBtn     = document.getElementById('paid-generate-pdf'); // apare dinamic în #result
  const manageBtn   = document.getElementById('manage-subscription'); // butonul nou
  // buyBtn este definit sus în DOMContentLoaded (const buyBtn = ...)
  if (paidBtn) {
    paidBtn.innerHTML = i18n[lang]["btn.download"] || "Descarcă PDF";
  }
  if (generateBtn) {
    const isPremium = !!window.hasUnlimited;
    const baseLabel = '<i class="bi bi-file-earmark-pdf-fill"></i> ' + (i18n[lang]["btn.generate"] || "Generează PDF");
    const freeBadge = !isPremium
      ? ` <span style="font-size:0.72em; opacity:0.75; font-weight:400;">(${i18n[lang]["pdf.free.label"] || "2/7 days"})</span>`
      : '';
    generateBtn.innerHTML = baseLabel + freeBadge;
  }
  const _payBtn = document.getElementById('pay-btn');
  if (_payBtn) {
    _payBtn.innerHTML = '<i class="bi bi-cart-check-fill"></i> ' + (i18n[lang]["btn.pay"] || "Plătește & Descarcă");
  }
  if (manageBtn) {
    manageBtn.textContent = i18n[lang]["btn.manage"] || "Manage subscription";
  }
  // 4) Titlul paginii
  if (i18n[lang].title) {
    document.title = i18n[lang].title;
  }
  // 5) Re-randări dependente de limbă
  renderTable();
  attachPdfListeners();
  attachAutoMenuBtn();
  updateContentNav(lang);
  renderPricingSection();
  renderPremiumHero();
  renderProductPreview();
  renderCuisineDiscover();
  renderDiscovery();
  renderPlannerAnchor();
  // Trust signals are inserted at hero.afterend, so calling this LAST
  // ensures the strip slots in right below the hero without disturbing
  // the order of the other sections.
  // Order matters: each hero.afterend insertion becomes the new
  // immediate-next-sibling of hero, pushing prior siblings down. So
  // trust signals first → featured last gives us
  // hero → FEATURED → TRUST → cuisine → product-preview → ...
  renderTrustSignals();
  renderFeaturedRecipe();
  renderPremiumPreview();
  renderFAQ();
  updateStickyUpgradeText();
  refreshStickyUpgrade();
  // Phase 8 — tag new section wrappers + write stagger indices BEFORE the
  // observer kicks so the reveal animation plays from the first frame.
  applyStaggerAndFadeMarkers();
  setupScrollFadeIn();
  // Phase 7 — hero choreography. Both helpers are idempotent (counters
  // mark counted spans, parallax marks the hero element) so re-running
  // on language switch doesn't re-trigger animations.
  setupHeroCounters();
  setupHeroParallax();
  // Phase 12 — variable font axis scroll, idempotent.
  setupHeroVariableFontScroll();
  // Phase 8 — card tilt. Idempotent (dataset.tilted guard).
  setupCardTilt();
  // Phase 9 — magnetic CTAs. Idempotent (dataset.magnetic guard).
  setupMagneticCTAs();
  // 6) Paragraful SEO per limbă
  const seoContainer = document.getElementById('seo-paragraph');
  if (seoContainer && seoParagraphs[lang]) {
    seoContainer.innerHTML = seoParagraphs[lang];
  }
  // 7) Shopping list empty-state message (CSS uses content: attr(data-empty-msg))
  const shopListEl = document.getElementById('shopping-list');
  if (shopListEl) {
    shopListEl.setAttribute('data-empty-msg',
      i18n[lang]?.['shopping.empty'] ?? i18n['en']?.['shopping.empty'] ?? 'Add meals to generate your shopping list');
  }
}
  // ---------- Stripe success (după ce avem DOM) ----------
  const params = new URLSearchParams(window.location.search);
  if (params.get('success') === 'true') {
    window.hasUnlimited = true; // <— adaugă
    localStorage.setItem('pdfCount', '0');
    localStorage.setItem('pdfFirst', Date.now());
    const generateBtn = document.getElementById('generate-btn');
    if (statusEl) statusEl.innerHTML = i18n[lang]["payment.success"] || '✅ Plata a fost realizată cu succes!';
    if (generateBtn) generateBtn.style.display = 'inline-block';
    updateButtonState(); // ← adăugare, ca să ascundă galbenul + selectorul
    // Drop the upsell panel and flip the nav badge to "Active" right away.
    document.getElementById('hp-premium-preview')?.remove();
    if (typeof updateContentNav === 'function') updateContentNav(lang);
    if (typeof refreshStickyUpgrade === 'function') refreshStickyUpgrade();
    // Phase 9 — one-shot celebration on first Stripe success redirect.
    if (typeof celebratePremium === 'function') celebratePremium();
    window.history.replaceState({}, '', window.location.pathname);
  }

  // ── Pricing Section ────────────────────────────────────────────────────────
  function renderPricingSection() {
    const el = document.getElementById('pricing-section');
    if (!el) return;
    if (window.hasUnlimited) { el.style.display = 'none'; return; }
    el.style.display = '';

    const isRo = lang === 'ro';
    const P = {
      ro: { title:'Gratuit vs Premium', freeName:'Gratuit', premName:'⭐ Premium',
            price:'€3/lună', sub:'', popular:'CEL MAI POPULAR',
            cta:'Obține Premium →', already:'Ai deja abonament? Activează mai jos ↓',
            freeFeats:['✅ Plan de mese 7 zile','✅ Listă de cumpărături automată',
                       '✅ 200+ rețete din 70+ țări','✅ Previzualizare gratuită — 2 zile din 7',
                       '✗ PDF cu toate 7 zilele','✗ Meniu buget ieftin'],
            premFeats:['✅ Tot ce e gratuit, plus:','✅ PDF cu toate cele 7 zile',
                       '✅ Meniu buget săptămânal','✅ {{RECIPE_COUNT}} rețete din 70+ țări',
                       '✅ Rețete noi adăugate regulat','✅ Acces nelimitat oricând'] },
      en: { title:'Free vs Premium', freeName:'Free', premName:'⭐ Premium',
            price:'€3/month', sub:'', popular:'MOST POPULAR',
            cta:'Get Premium →', already:'Already subscribed? Activate below ↓',
            freeFeats:['✅ 7-day meal plan','✅ Auto shopping list',
                       '✅ 200+ recipes from 70+ countries','✅ Free preview — 2 of 7 days',
                       '✗ Full 7-day PDF','✗ Budget menu'],
            premFeats:['✅ Everything in Free, plus:','✅ Full PDF with all 7 days',
                       '✅ Weekly budget menu','✅ {{RECIPE_COUNT}} recipes from 70+ countries',
                       '✅ New recipes added regularly','✅ Unlimited access anytime'] },
      es: { title:'Gratis vs Premium', freeName:'Gratis', premName:'⭐ Premium',
            price:'€3/mes', sub:'', popular:'MÁS POPULAR',
            cta:'Obtener Premium →', already:'¿Ya suscrito? Activa abajo ↓',
            freeFeats:['✅ Plan de comidas 7 días','✅ Lista de compras automática',
                       '✅ 200+ recetas de 70+ países','✅ Vista previa gratuita — 2 de 7 días',
                       '✗ PDF con los 7 días','✗ Menú económico'],
            premFeats:['✅ Todo lo gratis, más:','✅ PDF completo con 7 días',
                       '✅ Menú económico semanal','✅ {{RECIPE_COUNT}} recetas de 70+ países',
                       '✅ Nuevas recetas añadidas regularmente','✅ Acceso ilimitado siempre'] },
      fr: { title:'Gratuit vs Premium', freeName:'Gratuit', premName:'⭐ Premium',
            price:'€3/mois', sub:'', popular:'LE PLUS POPULAIRE',
            cta:'Obtenir Premium →', already:'Déjà abonné ? Activez ci-dessous ↓',
            freeFeats:['✅ Plan de repas 7 jours','✅ Liste de courses automatique',
                       '✅ 200+ recettes de 70+ pays','✅ Aperçu gratuit — 2 jours sur 7',
                       '✗ PDF avec les 7 jours','✗ Menu budget'],
            premFeats:['✅ Tout le gratuit, plus :','✅ PDF complet sur 7 jours',
                       '✅ Menu budget hebdomadaire','✅ {{RECIPE_COUNT}} recettes de 70+ pays',
                       '✅ Nouvelles recettes ajoutées régulièrement','✅ Accès illimité à tout moment'] },
      de: { title:'Kostenlos vs Premium', freeName:'Kostenlos', premName:'⭐ Premium',
            price:'€3/Monat', sub:'', popular:'AM BELIEBTESTEN',
            cta:'Premium holen →', already:'Bereits abonniert? Unten aktivieren ↓',
            freeFeats:['✅ 7-Tage-Mahlzeitenplan','✅ Automatische Einkaufsliste',
                       '✅ 200+ Rezepte aus 70+ Ländern','✅ Kostenlose Vorschau — 2 von 7 Tagen',
                       '✗ PDF mit allen 7 Tagen','✗ Budget-Menü'],
            premFeats:['✅ Alles Kostenlose, plus:','✅ PDF mit allen 7 Tagen',
                       '✅ Wöchentliches Budget-Menü','✅ {{RECIPE_COUNT}} Rezepte aus 70+ Ländern',
                       '✅ Regelmäßig neue Rezepte','✅ Unbegrenzter Zugang'] },
      pt: { title:'Gratuito vs Premium', freeName:'Gratuito', premName:'⭐ Premium',
            price:'€3/mês', sub:'', popular:'MAIS POPULAR',
            cta:'Obter Premium →', already:'Já assinante? Ative abaixo ↓',
            freeFeats:['✅ Plano de refeições 7 dias','✅ Lista de compras automática',
                       '✅ 200+ receitas de 70+ países','✅ Pré-visualização gratuita — 2 de 7 dias',
                       '✗ PDF com todos os 7 dias','✗ Menu económico'],
            premFeats:['✅ Tudo gratuito, mais:','✅ PDF completo com 7 dias',
                       '✅ Menu económico semanal','✅ {{RECIPE_COUNT}} receitas de 70+ países',
                       '✅ Novas receitas regularmente','✅ Acesso ilimitado'] },
      ru: { title:'Бесплатно vs Премиум', freeName:'Бесплатно', premName:'⭐ Премиум',
            price:'€3/мес', sub:'', popular:'САМЫЙ ПОПУЛЯРНЫЙ',
            cta:'Получить Премиум →', already:'Уже подписаны? Активируйте ниже ↓',
            freeFeats:['✅ План питания на 7 дней','✅ Автоматический список покупок',
                       '✅ 200+ рецептов из 70+ стран','✅ Бесплатный просмотр — 2 из 7 дней',
                       '✗ PDF на все 7 дней','✗ Бюджетное меню'],
            premFeats:['✅ Всё из бесплатного, плюс:','✅ Полный PDF на 7 дней',
                       '✅ Недельное бюджетное меню','✅ {{RECIPE_COUNT}} рецептов из 70+ стран',
                       '✅ Новые рецепты регулярно','✅ Безлимитный доступ'] },
      ar: { title:'مجاني vs بريميوم', freeName:'مجاني', premName:'⭐ بريميوم',
            price:'€3/شهر', sub:'', popular:'الأكثر شعبية',
            cta:'احصل على بريميوم →', already:'مشترك بالفعل؟ فعّل أدناه ↓',
            freeFeats:['✅ خطة وجبات 7 أيام','✅ قائمة تسوق تلقائية',
                       '✅ 200+ وصفة من 70+ دولة','✅ معاينة مجانية — يومان من أصل 7',
                       '✗ PDF كامل 7 أيام','✗ قائمة الميزانية'],
            premFeats:['✅ كل المجاني، بالإضافة:','✅ PDF كامل بجميع 7 أيام',
                       '✅ قائمة ميزانية أسبوعية','✅ {{RECIPE_COUNT}} وصفة من 70+ دولة',
                       '✅ وصفات جديدة بانتظام','✅ وصول غير محدود'] },
      zh: { title:'免费 vs 高级版', freeName:'免费', premName:'⭐ 高级版',
            price:'€3/月', sub:'', popular:'最受欢迎',
            cta:'获取高级版 →', already:'已订阅？在下方激活 ↓',
            freeFeats:['✅ 7天餐饮计划','✅ 自动购物清单',
                       '✅ 70+国200+道菜谱','✅ 免费预览 — 7天中的2天',
                       '✗ 完整7天PDF','✗ 节俭菜单'],
            premFeats:['✅ 所有免费功能，加上：','✅ 完整7天PDF',
                       '✅ 每周节俭菜单','✅ 来自 70+ 国家的 {{RECIPE_COUNT}} 道食谱',
                       '✅ 定期添加新食谱','✅ 随时无限访问'] },
      ja: { title:'無料 vs プレミアム', freeName:'無料', premName:'⭐ プレミアム',
            price:'€3/月', sub:'', popular:'最人気',
            cta:'プレミアムを取得 →', already:'すでに購読済み？下でアクティブ化 ↓',
            freeFeats:['✅ 7日間の食事プラン','✅ 自動買い物リスト',
                       '✅ 70カ国以上200+レシピ','✅ 無料プレビュー — 7日中2日',
                       '✗ 7日分フルPDF','✗ 節約メニュー'],
            premFeats:['✅ 無料のすべて、プラス：','✅ 7日分フルPDF',
                       '✅ 週間節約メニュー','✅ 70カ国以上から{{RECIPE_COUNT}}のレシピ',
                       '✅ 定期的に新レシピ追加','✅ 無制限アクセス'] },
      tr: { title:'Ücretsiz vs Premium', freeName:'Ücretsiz', premName:'⭐ Premium',
            price:'€3/ay', sub:'', popular:'EN POPÜLER',
            cta:'Premium Al →', already:'Zaten abone misiniz? Aşağıdan aktive edin ↓',
            freeFeats:['✅ 7 günlük yemek planı','✅ Otomatik alışveriş listesi',
                       '✅ 70+ ülkeden 200+ tarif','✅ Ücretsiz önizleme — 7 günden 2\'si',
                       '✗ 7 günlük tam PDF','✗ Bütçe menüsü'],
            premFeats:['✅ Ücretsizin her şeyi, artı:','✅ 7 günlük tam PDF',
                       '✅ Haftalık bütçe menüsü','✅ 70+ ülkeden {{RECIPE_COUNT}} tarif',
                       '✅ Düzenli olarak yeni tarifler','✅ Sınırsız erişim'] },
      it: { title:'Gratuito vs Premium', freeName:'Gratuito', premName:'⭐ Premium',
            price:'€3/mese', sub:'', popular:'PIÙ POPOLARE',
            cta:'Ottieni Premium →', already:'Già abbonato? Attiva qui sotto ↓',
            freeFeats:['✅ Piano pasti 7 giorni','✅ Lista della spesa automatica',
                       '✅ 200+ ricette da 70+ paesi','✅ Anteprima gratuita — 2 giorni su 7',
                       '✗ PDF con tutti i 7 giorni','✗ Menu economico'],
            premFeats:['✅ Tutto il gratuito, più:','✅ PDF completo 7 giorni',
                       '✅ Menu economico settimanale','✅ {{RECIPE_COUNT}} ricette da 70+ paesi',
                       '✅ Nuove ricette aggiunte regolarmente','✅ Accesso illimitato'] },
      ko: { title:'무료 vs 프리미엄', freeName:'무료', premName:'⭐ 프리미엄',
            price:'€3/월', sub:'', popular:'가장 인기',
            cta:'프리미엄 이용 →', already:'이미 구독 중? 아래에서 활성화 ↓',
            freeFeats:['✅ 7일 식단 계획','✅ 자동 장보기 목록',
                       '✅ 70개국 200+가지 레시피','✅ 무료 미리보기 — 7일 중 2일',
                       '✗ 7일 전체 PDF','✗ 예산 메뉴'],
            premFeats:['✅ 무료의 모든 것, 추가로:','✅ 7일 전체 PDF',
                       '✅ 주간 예산 메뉴','✅ 70+ 국가의 {{RECIPE_COUNT}}개 레시피',
                       '✅ 정기적으로 새 레시피 추가','✅ 무제한 접속'] },
      hi: { title:'मुफ्त vs प्रीमियम', freeName:'मुफ्त', premName:'⭐ प्रीमियम',
            price:'€3/माह', sub:'', popular:'सबसे लोकप्रिय',
            cta:'प्रीमियम पाएं →', already:'पहले से सदस्य? नीचे सक्रिय करें ↓',
            freeFeats:['✅ 7 दिन का भोजन योजना','✅ स्वचालित खरीदारी सूची',
                       '✅ 70+ देशों की 200+ रेसिपी','✅ मुफ्त पूर्वावलोकन — 7 में से 2 दिन',
                       '✗ पूर्ण 7 दिन PDF','✗ बजट मेनू'],
            premFeats:['✅ सब कुछ मुफ्त में, साथ में:','✅ पूर्ण 7 दिन PDF',
                       '✅ साप्ताहिक बजट मेनू','✅ 70+ देशों से {{RECIPE_COUNT}} रेसिपी',
                       '✅ नियमित रूप से नई रेसिपी','✅ असीमित पहुंच'] },
    };

    const s = P[lang] || P.en;
    const freeList = s.freeFeats.map(f =>
      `<li class="${f.startsWith('✗') ? 'feat-no' : ''}">${f}</li>`
    ).join('');
    const premList = s.premFeats.map(f => `<li>${fillRecipeCount(f)}</li>`).join('');

    // Trust strip shown below the cards — reassures cancel/no-commit terms.
    const TRUST_STRIP = {
      ro: ['🔒 Plăți Stripe securizate', '↩ Anulezi oricând', '💳 Fără angajament'],
      en: ['🔒 Stripe-secured', '↩ Cancel anytime', '💳 No commitment'],
      es: ['🔒 Seguro con Stripe', '↩ Cancela cuando quieras', '💳 Sin compromiso'],
      fr: ['🔒 Sécurisé par Stripe', '↩ Annulez à tout moment', '💳 Sans engagement'],
      de: ['🔒 Stripe-gesichert', '↩ Jederzeit kündbar', '💳 Keine Bindung'],
      pt: ['🔒 Seguro com Stripe', '↩ Cancele quando quiser', '💳 Sem compromisso'],
      ru: ['🔒 Защищено Stripe', '↩ Отмена в любое время', '💳 Без обязательств'],
      it: ['🔒 Pagamenti Stripe sicuri', '↩ Cancella quando vuoi', '💳 Senza impegno'],
      tr: ['🔒 Stripe ile güvenli', '↩ Dilediğin zaman iptal', '💳 Taahhüt yok'],
      ar: ['🔒 آمن مع Stripe', '↩ ألغِ في أي وقت', '💳 بدون التزام'],
      zh: ['🔒 Stripe 安全', '↩ 随时取消', '💳 无承诺'],
      ja: ['🔒 Stripe で安全', '↩ いつでもキャンセル', '💳 契約なし'],
      ko: ['🔒 Stripe 보안', '↩ 언제든 취소', '💳 약정 없음'],
      hi: ['🔒 Stripe सुरक्षित', '↩ कभी भी रद्द', '💳 कोई प्रतिबद्धता नहीं'],
    };
    const trustItems = (TRUST_STRIP[lang] || TRUST_STRIP.en)
      .map(t => `<span class="pricing-trust-strip-item">${t}</span>`)
      .join('<span aria-hidden="true">·</span>');

    el.innerHTML = `
      <div class="pricing-inner">
        <h2 class="pricing-title">${s.title}</h2>
        <div class="pricing-cards-row">

          <div class="pricing-card pricing-card--free">
            <div class="pcard-name">${s.freeName}</div>
            <div class="pcard-price-block">
              <span class="pcard-price">0</span>
              <span class="pcard-sub">${isRo ? '/lună' : '/month'}</span>
            </div>
            <ul class="pcard-features">${freeList}</ul>
          </div>

          <div class="pricing-card pricing-card--premium">
            <div class="pcard-popular">${s.popular}</div>
            <div class="pcard-name">${s.premName}</div>
            <div class="pcard-price-block">
              <span class="pcard-price">${s.price}</span>
            </div>
            ${s.sub ? `<p class="pcard-sub">${s.sub}</p>` : ''}
            <ul class="pcard-features">${premList}</ul>
            <button class="btn btn-upgrade pcard-cta" id="pricing-upgrade-btn" type="button">
              ${s.cta}
            </button>
            <p class="pcard-already"><a href="#access-card">${s.already}</a></p>
          </div>

        </div>
        <div class="pricing-trust-strip">${trustItems}</div>
      </div>
    `;

    document.getElementById('pricing-upgrade-btn')?.addEventListener('click', () => {
      document.getElementById('pay-btn')?.click();
    });
  }
  // ---------- Populare selector de limbă ----------
  if (langSwitcher) {
    langSwitcher.innerHTML = '';
    Object.keys(i18n).forEach(code => {
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = langNames[code];
      langSwitcher.append(opt);
    });
    langSwitcher.value = lang;
    langSwitcher.addEventListener('change', () => {
      const next = langSwitcher.value;
      // When the URL already encodes a locale (`/<code>/...`), keep the user
      // on the equivalent page in the new locale rather than just swapping
      // in-page translations — that mismatch ("URL says /en/, UI shows ES")
      // breaks reload and back-button. The root `/` keeps the in-page swap.
      const pathParts = (window.location.pathname || '/').split('/').filter(Boolean);
      const urlLang = (pathParts[0] && i18n[pathParts[0]]) ? pathParts[0] : null;
      if (urlLang && next !== urlLang) {
        localStorage.setItem('lastLang', next);
        const rest = pathParts.slice(1).join('/');
        window.location.href = `/${next}/${rest ? rest + '/' : ''}`;
        return;
      }
      lang = next;
      localStorage.setItem('lastLang', lang);
      applyTranslations();
      updateButtonState();
      attachPdfListeners();
      attachAutoMenuBtn();
      updateContentNav(lang);
    });
  }
// ---------- Verificare email (server-side) ----------
// SECURITY: Access check is done server-side via /api/check-access.
// The browser no longer queries Supabase directly, which prevents
// a user from bypassing auth by calling Supabase from DevTools.
//
// NOTE: window.hasUnlimited is still client-side (required for client-side PDF
// generation). A determined user can override it in DevTools. Full protection
// requires server-side PDF generation (Phase 2 — see SECURITY_FIX_PHASE_1.md).
window.hasUnlimited = false;
const verifyBtn  = document.getElementById('verifyBtn');
const emailInput = document.getElementById('emailInput');
const manageBtn  = document.getElementById('manage-subscription');

// ── Switch account / forget this email ─────────────────────────────
// On a shared device a remembered premium email auto-restores for anyone
// who opens the page (see restorePremiumFromHint). This gives the user a
// small control to drop that remembered email and return the box to its
// signed-out, non-premium state. Purely client-side: it clears the
// localStorage hint + in-memory flags and re-shows the upsell CTAs. It never
// calls the backend or Stripe, so the subscription itself is untouched and
// the user (or the real owner) can re-verify at any time.
function switchAccount() {
  try { localStorage.removeItem('mp:lastEmail'); } catch (_) {}
  window.hasUnlimited = false;
  window.verifiedEmail = null;
  // Drop the cached Stripe customer so a new checkout/portal isn't opened
  // against the forgotten account's customer id.
  window.currentStripeCustomerId = null;

  // Reset the verify box back to its blank state.
  if (emailInput) emailInput.value = '';
  if (resultDiv)  resultDiv.innerHTML = '';
  if (manageBtn)  manageBtn.style.display = 'none';
  const swBtn = document.getElementById('switch-account');
  if (swBtn) swBtn.style.display = 'none';

  // Bring the pricing / premium upsell CTAs back — the inverse of the
  // premium-activation paths. #pricing-section is absent on the homepage
  // (guarded); the live upsell is the re-rendered #hp-premium-preview panel.
  const pricingEl = document.getElementById('pricing-section');
  if (pricingEl) pricingEl.style.display = '';
  if (typeof renderPremiumPreview === 'function') renderPremiumPreview();
  // renderPremiumPreview() re-inserts a fresh .hp-fade-in panel that starts
  // at opacity:0 until the scroll-reveal observer tags it .is-visible. Re-run
  // the observer setup (as applyTranslations does after rendering) so the new
  // panel reveals instead of leaving a full-height invisible gap.
  if (typeof setupScrollFadeIn === 'function') setupScrollFadeIn();
  if (typeof updateButtonState === 'function') updateButtonState();
  if (typeof updateContentNav === 'function') updateContentNav(lang);
  if (typeof refreshStickyUpgrade === 'function') refreshStickyUpgrade();
  if (emailInput) emailInput.focus();
}

// Lazily create the small "Switch account" control (once), placed right
// after Manage subscription, and reveal it. Shown only while premium is
// active in this tab; hidden again by switchAccount() and on re-verify.
function revealSwitchAccount() {
  if (!manageBtn || !manageBtn.parentNode) return;
  let btn = document.getElementById('switch-account');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'switch-account';
    btn.type = 'button';
    btn.className = 'btn-switch-account';
    btn.setAttribute('data-i18n', 'btn.switchAccount');
    btn.style.cssText = 'display:block;background:none;border:none;padding:4px 8px;' +
      'margin-top:6px;font-size:0.82rem;color:#6b7280;text-decoration:underline;cursor:pointer;';
    btn.textContent = (i18n[lang] && i18n[lang]['btn.switchAccount'])
      || (i18n['en'] && i18n['en']['btn.switchAccount'])
      || 'Switch account';
    btn.addEventListener('click', switchAccount);
    manageBtn.insertAdjacentElement('afterend', btn);
  }
  btn.style.display = 'block';
}

// Premium-state persistence: silently re-verify on load using the last
// known-good email so paying users don't see the upsell flow on every
// reload. Server stays authoritative — localStorage is a hint only.
(function restorePremiumFromHint() {
  let hintEmail = null;
  try { hintEmail = localStorage.getItem('mp:lastEmail'); } catch (_) {}
  if (!hintEmail) return;
  fetch(`/api/check-access?email=${encodeURIComponent(hintEmail)}`)
    .then(r => r.json())
    .then(({ active }) => {
      if (!active) {
        try { localStorage.removeItem('mp:lastEmail'); } catch (_) {}
        return;
      }
      window.hasUnlimited = true;
      window.verifiedEmail = hintEmail;
      if (emailInput && !emailInput.value) emailInput.value = hintEmail;
      const pricingEl = document.getElementById('pricing-section');
      if (pricingEl) pricingEl.style.display = 'none';
      // Premium preview panel only makes sense for non-premium users.
      document.getElementById('hp-premium-preview')?.remove();
      if (manageBtn) manageBtn.style.display = 'inline-block';
      revealSwitchAccount();
      if (typeof updateButtonState === 'function') updateButtonState();
      if (typeof updateContentNav === 'function') updateContentNav(lang);
      if (typeof refreshStickyUpgrade === 'function') refreshStickyUpgrade();
    })
    .catch(() => { /* network blip — user can re-verify manually */ });
})();

// Sticky upgrade pill — wire observers once. applyTranslations() handles
// the text + visibility refresh on every language switch and on premium
// state changes.
if (typeof setupStickyUpgrade === 'function') setupStickyUpgrade();

// Phase 6 — Atmosphere setup (cursor glow). Runs once on script load.
if (typeof setupCursorAtmosphere === 'function') setupCursorAtmosphere();
if (verifyBtn && emailInput && resultDiv) {
  verifyBtn.onclick = async function () {
    // Guard: rapid re-clicks / Enter-spam must not fire duplicate
    // email_submitted events for a single submission.
    if (verifyBtn._verifying) return;
    verifyBtn._verifying = true;
    // Capture premium state BEFORE this verify so we can suppress the event
    // when an already-premium user merely re-verifies (pure inflation).
    const wasPremium = !!window.hasUnlimited;
    try {
    const email = emailInput.value.trim();
    resultDiv.innerText = (i18n[lang]?.msg?.checking) || 'Checking...';
    if (manageBtn) manageBtn.style.display = 'none';
    document.getElementById('switch-account')?.style.setProperty('display', 'none');
    if (!email) {
      window.hasUnlimited = false;
      resultDiv.innerHTML = `<span class="text-danger">${i18n[lang]?.msg?.empty || 'Introduceți adresa de email!'}</span>`;
      if (typeof updateButtonState === 'function') updateButtonState();
      return;
    }

    // Server validates subscription — no direct Supabase query from browser
    let accessData;
    try {
      const r = await fetch(`/api/check-access?email=${encodeURIComponent(email)}`);
      accessData = await r.json();
    } catch (e) {
      window.hasUnlimited = false;
      resultDiv.innerHTML = `<span class="text-danger">${i18n[lang]?.msg?.server_error || 'Eroare server. Încercați din nou.'}</span>`;
      if (typeof updateButtonState === 'function') updateButtonState();
      return;
    }

    const { active, found, until } = accessData;

    // Funnel analytics: the email gate is the unmonitored rung between
    // pdf_click and checkout. No PII — the email itself is never sent, only
    // the access OUTCOME. tier_intent = the PDF tier this submission unlocks
    // (premium when the subscription is active, else the free 2-day export).
    // Skip when an already-premium user is just re-verifying an active sub —
    // that is not a new gate passage, only inflation.
    if (window.mpTrack && !(wasPremium && active)) window.mpTrack('email_submitted', {
      source: 'pdf_gate',
      access: active ? 'active' : found ? 'found' : 'none',
      filter: window._activeFilter || 'all',
      isBudget: !!window.isBudgetMenu,
      tier_intent: active ? 'premium' : 'free',
    });

    if (active) {
      window.hasUnlimited = true;
      // Store email for AI endpoints (chat/coach require email in POST body)
      window.verifiedEmail = email;
      try { localStorage.setItem('mp:lastEmail', email); } catch (_) {}
      const expiryText = until
        ? `${(access[lang]?.validUntil || 'Valabil până la')} ${
            new Date(until).toLocaleDateString(lang, { day: '2-digit', month: 'short', year: 'numeric' })
          }`
        : (access[lang]?.lifetime || 'nelimitat');
      resultDiv.innerHTML = `
        <span class="text-success mb-2 d-block">
          ${i18n[lang]["msg.valid"]} (${expiryText})
        </span>
        <button id="paid-generate-pdf" class="btn btn-primary">
          ${i18n[lang]["btn.download"]}
        </button>
      `;
      if (buyBtn) buyBtn.style.display = 'none';
      if (currencySelUI) currencySelUI.style.display = 'none';
      attachPdfListeners();
      // Manage-subscription click is wired globally in public/js/portal.js
      // (delegated handler). Just toggle visibility here.
      if (manageBtn) manageBtn.style.display = 'inline-block';
      revealSwitchAccount();
      // Drop the premium preview panel — paying users don't need the upsell.
      document.getElementById('hp-premium-preview')?.remove();
      if (typeof updateButtonState === 'function') updateButtonState();
      if (typeof updateContentNav === 'function') updateContentNav(lang);
      if (typeof refreshStickyUpgrade === 'function') refreshStickyUpgrade();
    } else if (found) {
      // Account exists but subscription is expired
      window.hasUnlimited = false;
      try { localStorage.removeItem('mp:lastEmail'); } catch (_) {}
      resultDiv.innerHTML = `<span class="text-danger">${i18n[lang]?.msg?.invalid || 'Nu există acces valid pentru acest email.'}</span>`;
      if (manageBtn) manageBtn.style.display = 'none';
      if (typeof updateButtonState === 'function') updateButtonState();
    } else {
      // No account found at all
      window.hasUnlimited = false;
      try { localStorage.removeItem('mp:lastEmail'); } catch (_) {}
      resultDiv.innerHTML = `<span class="text-danger">${i18n[lang]?.msg?.not_found || 'Nu există acces pentru acest email. Plătește întâi sau verifică adresa.'}</span>`;
      if (manageBtn) manageBtn.style.display = 'none';
      if (typeof updateButtonState === 'function') updateButtonState();
    }
    } finally {
      verifyBtn._verifying = false;
    }
  };
  // Enter submit
  emailInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      verifyBtn.click();
    }
  });
}
  // ---------- Feedback form ----------
  const feedbackForm   = document.getElementById('feedbackForm');
  const feedbackMsg    = document.getElementById('feedbackMsg');
  const feedbackStatus = document.getElementById('feedback-status');
  if (feedbackForm && feedbackMsg && feedbackStatus) {
    feedbackForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const msg = feedbackMsg.value.trim();
      if (!msg) {
        feedbackStatus.innerHTML = `<span class="text-danger">${i18n[lang]["feedback.error"]}</span>`;
        return;
      }
      const email = "bucosalexandrubogdan@gmail.com";
      const subject = encodeURIComponent('Meal Planner Feedback');
      const body = encodeURIComponent(msg + '\n\nLang: ' + lang);
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
      feedbackStatus.innerHTML = `<span class="text-success">${i18n[lang]["feedback.thanks"]}</span>`;
      feedbackMsg.value = '';
      setTimeout(() => feedbackStatus.innerHTML = '', 5000);
    });
  }
  // ---------- Expunere funcții pe window (pt. onclick inline) ----------
  window.startDictation = startDictation;
  window.exportShoppingListToPDF = exportShoppingListToPDF;
  window.updateShoppingList = updateShoppingList;

  // ---------- Wire planner inputs (table OR week cards) → live shopping list + meta ----------
  function wireInputsToShoppingList() {
    document.querySelectorAll('#plan-table input, #plan-cards input').forEach(inp => {
      if (!inp.dataset.shopWired) {
        inp.addEventListener('input', () => {
          updateShoppingList();
          // debounce meta update to avoid excessive DOM work while typing
          clearTimeout(inp._metaTimer);
          inp._metaTimer = setTimeout(updateAllRecipeMeta, 120);
        });
        inp.dataset.shopWired = '1';
      }
    });
  }
  // Observe ONLY direct children of plan-table for lang/rebuild events
  // (subtree:false prevents triggering on our own meta-chip insertions)
  let _observerBusy = false;
  const planTableObserver = new MutationObserver(() => {
    if (_observerBusy) return;
    _observerBusy = true;
    wireInputsToShoppingList();
    updateShoppingList();
    // Schedule meta update outside current mutation batch
    setTimeout(() => { updateAllRecipeMeta(); _observerBusy = false; }, 0);
  });
  const planTableEl = document.getElementById('plan-table');
  if (planTableEl) planTableObserver.observe(planTableEl, { childList: true, subtree: false });

  // ---------- ?autoplan= deep link (from SEO pages) ----------
  const autoplanParam = new URLSearchParams(window.location.search).get('autoplan');
  if (autoplanParam) {
    // Single source of truth: PLAN_MEALS is AUTO-GENERATED by
    // scripts/generate-content.mjs from the SAME deterministic selection that
    // renders the SEO meal-plan tables, keyed by recipe id (not name). So
    // "Open in app" loads exactly the meals shown on the plan page. Budget is
    // random → no id list. scripts/validate-open-in-app.mjs guards this.
    const plan = PLAN_MEALS[autoplanParam];
    if (!plan) {
      // Explicit failure: an SEO page linked ?autoplan=<id> to a plan that
      // has no PLAN_MEALS entry. Do NOT continue silently with an empty
      // planner — report which key is missing.
      console.error(
        `[open-in-app] Unknown plan key "${autoplanParam}". ` +
        `Cannot build the plan from this deep link. ` +
        `Known keys: ${Object.keys(PLAN_MEALS).join(', ')}.`
      );
    } else {
      setTimeout(async () => { // wait for renderTable
        await ensureMainRecipes();
        if (plan.isBudget) {
          window.isBudgetMenu = true;
          generateRandomMenu();
        } else {
          const byId = new Map([...recipesMain, ...recipesBudget].map(r => [r.id, r]));
          const unresolved = [];
          const fillSlots = (ids, slotSuffix) => {
            (ids || []).forEach((id, i) => {
              const inp = document.getElementById(`d${i+1}${slotSuffix}`);
              if (!inp) return;
              const rec = byId.get(id);
              if (!rec) unresolved.push(id);
              inp.value = rec ? getRecipeText(rec, lang) : String(id);
            });
          };
          fillSlots(plan.lunchIds, 'l');
          fillSlots(plan.dinnerIds, 'c');
          if (unresolved.length) {
            // Explicit failure: one or more plan recipe ids no longer exist in
            // recipes.js (corpus drifted from the generated PLAN_MEALS). Report
            // loudly instead of failing silently.
            console.error(
              `[open-in-app] Plan "${autoplanParam}" has ${unresolved.length} ` +
              `unresolved recipe id(s): ${unresolved.join(', ')}. ` +
              `Re-run "npm run content" to regenerate plan-meals.generated.js.`
            );
          }
        }
        updateShoppingList();
        // clean up URL
        window.history.replaceState({}, '', window.location.pathname);
        // scroll to planner
        document.getElementById('plan-table')?.closest('section')?.scrollIntoView({ behavior:'smooth', block:'start' });
      }, 200);
    }
  }

  // ---------- ?meal= deep link (from recipe pages "Add to my plan") ----------
  const mealParam = new URLSearchParams(window.location.search).get('meal');
  if (mealParam) {
    setTimeout(async () => {
      await ensureMainRecipes();
      const allSrc = [...recipesMain, ...recipesBudget];
      const rec = allSrc.find(r =>
        Object.values(r.name || {}).some(n => n.toLowerCase() === mealParam.toLowerCase())
      );
      // Pin the chosen recipe to Monday lunch, then build a COMPLETE week
      // around it. generateRandomMenu() (week mode) only fills empty slots, so
      // the pinned recipe is preserved while the other 13 slots are generated.
      // This avoids dropping the user into an almost-empty planner.
      const anchor = document.getElementById('d1l');
      if (anchor) {
        anchor.value = rec ? getRecipeText(rec, lang) : mealParam;
        anchor.dispatchEvent(new Event('input'));
      }
      window._planMode = 'week';
      try { await generateRandomMenu(); } catch (_) { /* anchor still placed */ }
      updateShoppingList();
      window.history.replaceState({}, '', window.location.pathname);
      document.getElementById('plan-table')?.closest('section')?.scrollIntoView({ behavior:'smooth', block:'start' });
    }, 300);
  }

  // ---------- EXPORT SECTION VISIBILITY (week only) ----------
  function updateExportSectionVisibility() {
    const exportSection = document.querySelector('.export-section');
    if (!exportSection) return;
    const isWeek = (window._planMode || 'week') === 'week';
    exportSection.style.display = isWeek ? '' : 'none';
  }
  updateExportSectionVisibility();

  // NOTE: hero-cta-btn listener is now attached inside renderPremiumHero()
  // (hero is rendered by applyTranslations below; the button doesn't exist here yet)

  // ---------- FUNNEL OBSERVERS (analytics) ----------
  // shopping_list_viewed: the shopping section scrolled into view while the
  // grouped list is non-empty. premium_viewed: the premium upsell (pricing
  // section, or the homepage preview panel) scrolled into view. Both fire at
  // most once per page load and are whitelisted server-side in api/event.js.
  function initFunnelObservers() {
    if (!('IntersectionObserver' in window)) return;
    const shopSection = document.querySelector('.app-section--shopping');
    if (shopSection) {
      let sent = false;
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || sent) continue;
          const listEl = document.getElementById('shopping-list');
          // Only count as "viewed" if the list is actually visible on screen
          // (the .shopping-data container may be hidden = teaser-only mode).
          if (!listEl || listEl.offsetParent === null) continue;
          const items = listEl.querySelectorAll('.shopping-item').length;
          if (!items) continue; // empty list = nothing was actually "viewed"
          sent = true;
          if (window.mpTrack) window.mpTrack('shopping_list_viewed', { items });
          io.disconnect();
        }
      }, { threshold: 0.15 });
      io.observe(shopSection);
    }
    const premiumEl = document.getElementById('pricing-section')
      || document.getElementById('hp-premium-preview')
      || document.querySelector('.hp-premium-preview');
    if (premiumEl) {
      let sent = false;
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || sent) continue;
          sent = true;
          if (window.mpTrack) window.mpTrack('premium_viewed', { source: premiumEl.id || 'preview' });
          io.disconnect();
        }
      }, { threshold: 0.15 });
      io.observe(premiumEl);
    }
  }
  initFunnelObservers();

  // ---------- INIT UI ----------
  resetPdfQuotaIfNeeded();
  applyTranslations();
  attachPdfListeners();
  updateButtonState();
  wireInputsToShoppingList();
  ensurePwToast(); // aria-live region must exist before its first announcement
});
