// ===== Imports (TOATE sus)
import { recipes as recipesMain } from './recipes.js';
import { recipesMeta, TAG_LABELS, READY_IN } from './recipes-meta.js';
import { i18n, langNames, seoParagraphs, pdfMessages, MOTIV, access } from './i18n.js';
import { buildShoppingFromRawIngredients } from './shopping-list.js';

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

// ===== Apply metadata to main recipes =========================================
recipesMain.forEach(r => {
  const meta = recipesMeta[r.id];
  if (!meta) return;
  r.time    = meta.time;
  r.costRon = meta.costRon;
  r.tags    = meta.tags || [];
  if (meta.desc) r.desc = meta.desc;
});

// ===== Global / debug =========================================================
window.isBudgetMenu = window.isBudgetMenu ?? false;
window.recipesMain  = recipesMain;
window.recipesBudget = recipesBudget;
window.recipes = [...recipesMain];   // budget appended after lazy load

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
const NAV_PRICING_LINKS = {
  ro:'/ro/premium/', en:'/en/pricing/', es:'/es/precios/', fr:'/fr/tarifs/',
  de:'/de/preise/', pt:'/pt/precos/', ru:'/ru/tseny/', ar:'/ar/asaar/',
  zh:'/zh/jiage/', ja:'/ja/pricing/', hi:'/hi/pricing/', tr:'/tr/fiyatlar/',
  it:'/it/prezzi/', ko:'/ko/pricing/'
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
      // Week mode — 7 rows
      i18n[lang].weekdays.forEach((day, idx) => {
        tbody.insertAdjacentHTML('beforeend', `
          <tr class="planner-row">
            <td><strong>${day}</strong></td>
            <td>
              <div class="input-group input-group-sm">
                <input id="d${idx+1}l" class="form-control" placeholder="${t('placeholderL')}">
                <button type="button" class="btn btn-outline-secondary" onclick="startDictation('d${idx+1}l')">
                  <i class="bi bi-mic-fill" aria-hidden="true"></i>
                </button>
              </div>
            </td>
            <td>
              <div class="input-group input-group-sm">
                <input id="d${idx+1}c" class="form-control" placeholder="${t('placeholderD')}">
                <button type="button" class="btn btn-outline-secondary" onclick="startDictation('d${idx+1}c')">
                  <i class="bi bi-mic-fill" aria-hidden="true"></i>
                </button>
              </div>
            </td>
          </tr>
        `);
      });
    }
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
    const name = recipe.name?.[langCode] || recipe.name?.en || recipe.name?.ro || '';
    const ingr = recipe.ingredients?.[langCode] || recipe.ingredients?.en || recipe.ingredients?.ro || [];
    const list = Array.isArray(ingr) ? ingr : [];
    // Short format for input field: "RecipeName (ingr1, ingr2, ingr3)"
    // No "traditional from X" sentence — keeps input clean & consistent
    if (!list.length) return name;
    // Show max 4 ingredients to keep input readable
    const shown = list.slice(0, 4);
    const suffix = list.length > 4 ? ', ...' : '';
    return `${name} (${shown.join(', ')}${suffix})`;
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
  // ── Smart diversity picker for full-week generation ─────────────────────────
  // Rules: max 2 recipes from same country, max 3 pasta/rice, max 4 heavy-meat
  function smartPickWeek(pool, count) {
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const result = [];
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

    // Pass 1 – strict: max 2 per country, max 3 pasta, max 4 heavy meat
    for (const r of shuffled) {
      if (result.length >= count) break;
      const country = r.origin?.en || r.origin?.ro || '';
      if ((countryCounts[country] || 0) >= 2) continue;
      if (isPasta(r) && pastaCount >= 3) continue;
      if (isHeavyMeat(r) && heavyMeatCount >= 4) continue;
      result.push(r);
      countryCounts[country] = (countryCounts[country] || 0) + 1;
      if (isPasta(r)) pastaCount++;
      if (isHeavyMeat(r)) heavyMeatCount++;
    }

    // Pass 2 – relax country limit (keep pasta/meat limits)
    if (result.length < count) {
      const used = new Set(result);
      for (const r of shuffled) {
        if (result.length >= count) break;
        if (used.has(r)) continue;
        if (isPasta(r) && pastaCount >= 3) continue;
        if (isHeavyMeat(r) && heavyMeatCount >= 4) continue;
        result.push(r); used.add(r);
        if (isPasta(r)) pastaCount++;
        if (isHeavyMeat(r)) heavyMeatCount++;
      }
    }

    // Pass 3 – final fallback: any unused recipe
    if (result.length < count) {
      const used = new Set(result);
      for (const r of shuffled) {
        if (result.length >= count) break;
        if (!used.has(r)) { result.push(r); used.add(r); }
      }
    }

    return result;
  }

  async function generateRandomMenu() {
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

  if (!Array.isArray(pool) || pool.length < 1) {
    console.warn("Random menu: pool too small", pool?.length);
    return;
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
    const picks = smartPickWeek(pool, emptySlots.length);
    emptySlots.forEach((inp, i) => {
      if (picks[i]) inp.value = getRecipeText(picks[i], lang);
    });
  }

  setTimeout(() => updateAllRecipeMeta(), 50);
}

  function collectMeals() {
    return i18n[lang].weekdays.map((_, i) => ({
      day: document.querySelector(`#plan-table tr:nth-child(${i+1}) td strong`)?.textContent || '',
      lunch: document.getElementById(`d${i+1}l`)?.value.trim() || '',
      dinner: document.getElementById(`d${i+1}c`)?.value.trim() || ''
    }));
  }
  function generatePDFimpact() {
  const isPremium = !!window.hasUnlimited;
  const allMeals  = collectMeals();
  const freeDays   = 2;
  const visibleMeals = isPremium ? allMeals : allMeals.slice(0, freeDays);
  const lockedMeals  = isPremium ? []        : allMeals.slice(freeDays);
  const hasLocked    = lockedMeals.some(m => m.lunch || m.dinner);
  const t = k => (i18n[lang] && i18n[lang][k]) || (i18n['en'] && i18n['en'][k]) || k;

  // ── helpers ──────────────────────────────────────────────────
  function getRecipe(mealText) {
    if (!mealText) return null;
    const title = extractRecipeName(mealText);
    return (window.recipes || []).find(r =>
      r.name?.[lang]?.toLowerCase() === title.toLowerCase() ||
      r.name?.en?.toLowerCase()  === title.toLowerCase()
    ) || null;
  }
  function metaHTML(r) {
    if (!r) return '';
    const parts = [];
    if (r.time)    parts.push(`<span class="meta-tag">⏱ ${r.time} min</span>`);
    if (r.costRon) parts.push(`<span class="meta-tag">💰 ${formatCost(r.costRon)}</span>`);
    if (r.origin?.[lang]) parts.push(`<span class="meta-tag">🌍 ${r.origin[lang]}</span>`);
    return parts.length ? `<div class="meal-meta">${parts.join('')}</div>` : '';
  }
  function ingrPillsHTML(r) {
    const items = r?.ingredients?.[lang] || r?.ingredients?.en || [];
    if (!items.length) return '';
    return `<div class="meal-ingr">
      <div class="ingr-label">${t('col.ingredients') || 'Ingrediente'}</div>
      <div class="ingr-pills">${items.map(i => `<span class="ingr-pill">${i}</span>`).join('')}</div>
    </div>`;
  }
  function stepsOL(r) {
    const raw = r?.howIsMade?.[lang] || r?.howIsMade?.ro || '';
    // Use the same splitter as the static recipe pages: period+space OR CJK
    // sentence-end. Plain "." inside "1.5 kg" / "8.10 min" / "Mr." stays intact.
    const steps = raw
      .split(/(?:\.\s+|[。！？]\s*)/)
      .map(x => x.trim())
      .filter(s => s.length > 2)
      // Strip leading "N. " section markers ("1. ROAST THE..."). Without
      // this, the OL would render "1. 1. ROAST..." because the embedded
      // numeric prefix is rendered alongside the OL's own counter.
      .map(s => s.replace(/^\d+\s*\.\s*/, ''))
      // Drop orphan digit-only fragments left by aggressive splits
      .filter(s => !/^\d+\s*$/.test(s));
    if (!steps.length) return '';
    return `<div class="meal-steps-label">${t('howIsMade') || 'Preparare'}</div>
    <ol class="meal-steps">${steps.map(s => `<li>${s}.</li>`).join('')}</ol>`;
  }
  function mealBlockHTML(mealText, type) {
    const r    = getRecipe(mealText);
    const name = mealText ? extractRecipeName(mealText) : '';
    const icon = type === 'lunch' ? '🍲' : '🌙';
    const label = type === 'lunch' ? (t('col.lunch') || 'Lunch') : (t('col.dinner') || 'Dinner');
    return `<div class="meal-block meal-block--${type}">
      <div class="meal-label">${icon} ${label}</div>
      <div class="meal-name">${name}</div>
      ${metaHTML(r)}
      ${ingrPillsHTML(r)}
      ${stepsOL(r)}
    </div>`;
  }

  // ── collect all EN ingredients across visible meals, then run them
  //    through the same grouping engine the static plan pages use ──
  const rawEnIngredients = [];
  visibleMeals.forEach(m => {
    [m.lunch, m.dinner].filter(Boolean).forEach(meal => {
      const r = getRecipe(meal);
      // Engine is calibrated for EN ingredient strings. Use them across all
      // locales — the engine localizes the canonical labels for output.
      (r?.ingredients?.en || r?.ingredients?.ro || []).forEach(i => rawEnIngredients.push(i));
    });
  });
  let shoppingGroups = [];
  try { shoppingGroups = buildShoppingFromRawIngredients(rawEnIngredients, lang); } catch (_) { shoppingGroups = []; }
  // Legacy 2-col fallback if the engine returned nothing (e.g. no recipes added yet).
  const flatIngrArr = [...new Set(rawEnIngredients)];
  const half = Math.ceil(flatIngrArr.length / 2);
  const col1 = flatIngrArr.slice(0, half);
  const col2 = flatIngrArr.slice(half);

  // ── day cards ─────────────────────────────────────────────────
  let daysHTML = '';
  visibleMeals.forEach((m, idx) => {
    if (!m.lunch && !m.dinner) return;
    daysHTML += `<div class="recipe-section">
      <div class="recipe-day-header">
        <span class="day-num">${idx + 1}</span>
        <span class="day-name">${m.day}</span>
      </div>
      ${m.lunch  ? mealBlockHTML(m.lunch,  'lunch')  : ''}
      ${m.dinner ? mealBlockHTML(m.dinner, 'dinner') : ''}
    </div>`;
  });

  // ── shopping list (grouped engine output; falls back to 2-col flat) ─
  const shoppingGroupsHTML = shoppingGroups.map(g => `
    <section class="pdf-shop-group" data-group="${g.id}">
      <h4 class="pdf-shop-group-h">${g.label}</h4>
      <ul class="pdf-shop-list">
        ${g.items.map(it => `<li><span class="pdf-shop-name">${it.name}</span>${it.qty ? `<span class="pdf-shop-qty">${it.qty}</span>` : ''}</li>`).join('')}
      </ul>
    </section>`).join('');
  const shoppingHTML = shoppingGroups.length
    ? `<div class="pdf-shopping pdf-shopping--grouped">
         <div class="pdf-shopping-header">🛒 ${t('shoppingList') || 'Shopping List'}</div>
         <div class="pdf-shopping-body">${shoppingGroupsHTML}</div>
       </div>`
    : (flatIngrArr.length ? `
        <div class="pdf-shopping">
          <div class="pdf-shopping-header">🛒 ${t('shoppingList') || 'Shopping List'}</div>
          <div class="pdf-shopping-body">
            <div class="shopping-grid">
              <div>${col1.map(i => `<div class="shop-item">${i}</div>`).join('')}</div>
              <div>${col2.map(i => `<div class="shop-item">${i}</div>`).join('')}</div>
            </div>
          </div>
        </div>` : '');

  // ── locked upsell ─────────────────────────────────────────────
  let lockedHTML = '';
  if (hasLocked) {
    const lockedDays = lockedMeals.filter(m => m.lunch || m.dinner).map(m => m.day).join(' · ');
    lockedHTML = `<div class="pdf-locked">
      <div class="pdf-locked-icon">🔒</div>
      <div class="pdf-locked-title">${t('pdf.locked.title')}</div>
      <div class="pdf-locked-days">${lockedDays}</div>
      <div class="pdf-locked-sub">${t('pdf.locked.sub')}</div>
      <div class="pdf-locked-cta">meal-planner.ro · ${t('pdf.locked.cta')}</div>
    </div>`;
  }

  // ── cover page ────────────────────────────────────────────────
  const footerDate = new Date().toLocaleDateString(lang, { day: '2-digit', month: '2-digit', year: 'numeric' });
  const weekLabel  = new Date().toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' });
  const freeBadge  = !isPremium ? `<div class="pdf-free-badge">${t('pdf.free.label')}</div>` : '';
  const coverHTML  = `<div class="pdf-cover">
    <div class="pdf-cover-brand">🥗 Meal-Planner.ro</div>
    <div class="pdf-cover-title">${t('title') || 'Meal Plan'}</div>
    <div class="pdf-cover-week">${weekLabel}</div>
    <div class="pdf-cover-divider"></div>
    <div class="pdf-cover-motiv">${pickMotiv(lang)}</div>
    ${freeBadge}
  </div>`;

  // ── clear legacy slots, write everything to #pdf-list ─────────
  const titleEl = document.getElementById('pdf-title');
  const msgEl   = document.getElementById('pdf-impact-message');
  if (titleEl) titleEl.innerHTML = '';
  if (msgEl)   msgEl.innerHTML   = '';

  const listEl = document.getElementById('pdf-list');
  if (listEl) {
    listEl.innerHTML = `
      ${coverHTML}
      ${daysHTML}
      ${shoppingHTML}
      ${lockedHTML}
      <div class="doc-footer">🥗 Meal-Planner.ro · ${footerDate}</div>
    `;
  }
}
  async function exportShoppingListToPDF() {
  const pdfArea = document.getElementById('pdf-impact-area');
  if (!pdfArea) return;
  let cleanNode = null, styleEl = null;
  document.body.classList.add('pdf-exporting');
  try {
    generatePDFimpact();
    window.scrollTo(0, 0);
    await new Promise(resolve => setTimeout(resolve, 80));
    const built = buildCleanPdfNode();
    cleanNode = built.node;
    styleEl = built.styleEl;
    document.head.appendChild(styleEl);
    cleanNode.style.position = 'absolute';
    cleanNode.style.left = '-9999px';
    // Force A4 width so paginateCleanNode measures at the same width as the PDF render
    cleanNode.style.width = '719px'; // 190mm @ 96dpi
    document.body.appendChild(cleanNode);
    maybeCompactToTwoPages(cleanNode);
    paginateCleanNode(cleanNode);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    await html2pdf().set({
      margin: [0, 0, 0, 0],
      filename: 'meal-planner.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: isIOS ? 1.36 : 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: {
        mode: ['css'],
        avoid: ['.recipe-section', '#pdf-impact-message', '.origin', '.ingredients', '.how-title', '.motiv']
      }
    })
    .from(cleanNode)
    .save();
  } catch (err) {
    console.error('❌ PDF generation error:', err);
  } finally {
    if (styleEl) styleEl.remove();
    if (cleanNode) cleanNode.remove();
    document.body.classList.remove('pdf-exporting');
  }
}
function buildCleanPdfNode() {
  const src = document.getElementById('pdf-impact-area');
  const node = src.cloneNode(true);

  // curățăm toate stilurile inline, ca să nu încurce layoutul pentru PDF
  if (node.hasAttribute('style')) node.removeAttribute('style');
  node.querySelectorAll('[style]').forEach(el => el.removeAttribute('style'));
  const styleEl = document.createElement('style');
  styleEl.id = 'pdf-safe-style';
  styleEl.textContent = `
/* ===== Premium PDF – A4 (html2pdf) ===== */
html,body{ margin:0; padding:0; background:#fff; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
:root{
  --brand:#1e7d3a; --brand-dk:#155a2a; --brand-soft:#f0f9f2; --brand-mid:#c8e6c9;
  --dinner-bg:#eef3ff; --dinner-clr:#2044b4;
  --ink:#1a1a2e; --muted:#666; --line:#e2e8f0; --r:8px;
}
/* ── Container ── */
#pdf-impact-area{
  width:190mm; padding:0; margin:0 auto;
  background:#fff; font-family:'Segoe UI',Arial,sans-serif;
  color:var(--ink); font-size:10.5pt; line-height:1.4; box-sizing:border-box;
}
/* ── Cover ── */
.pdf-cover{
  background:linear-gradient(135deg,#1e7d3a 0%,#27a247 55%,#46c16a 100%);
  color:#fff; padding:13mm 11mm 9mm; margin-bottom:5mm;
  page-break-inside:avoid; break-inside:avoid;
}
.pdf-cover-brand{ font-size:9pt; font-weight:700; opacity:.8; letter-spacing:.08em; text-transform:uppercase; margin-bottom:3mm; }
.pdf-cover-title{ font-size:20pt; font-weight:800; line-height:1.1; margin-bottom:2mm; }
.pdf-cover-week{ font-size:10.5pt; opacity:.88; margin-bottom:4mm; }
.pdf-cover-divider{ width:36mm; height:2px; background:rgba(255,255,255,.35); margin-bottom:4mm; }
.pdf-cover-motiv{ font-size:9.5pt; font-style:italic; opacity:.85; line-height:1.45; }
.pdf-free-badge{
  display:inline-block; margin-top:4mm; padding:2px 10px;
  background:rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.4);
  border-radius:999px; font-size:8pt; font-weight:600; letter-spacing:.03em;
}
/* ── Day cards ── */
.recipe-section{
  border:1px solid var(--line); border-radius:var(--r);
  margin-bottom:3mm; overflow:hidden;
  page-break-inside:avoid; break-inside:avoid;
}
.recipe-day-header{
  background:var(--ink); color:#fff;
  padding:2.5mm 4mm; display:flex; align-items:center; gap:3mm;
}
.day-num{
  display:inline-flex; align-items:center; justify-content:center;
  width:5mm; height:5mm; background:var(--brand); border-radius:50%;
  font-size:7.5pt; font-weight:800; flex-shrink:0;
}
.day-name{ font-size:10.5pt; font-weight:800; letter-spacing:.06em; text-transform:uppercase; }
/* ── Meal blocks ── */
.meal-block{ padding:3mm 4mm; }
.meal-block--lunch{ border-bottom:1px solid var(--line); background:#fafffe; }
.meal-block--dinner{ background:#fafaff; }
.meal-label{ font-size:7.5pt; font-weight:700; letter-spacing:.09em; text-transform:uppercase; margin-bottom:1mm; }
.meal-block--lunch  .meal-label{ color:var(--brand); }
.meal-block--dinner .meal-label{ color:var(--dinner-clr); }
.meal-name{ font-size:11.5pt; font-weight:700; margin-bottom:1.5mm; color:var(--ink); }
.meal-meta{ margin-bottom:2mm; }
.meta-tag{
  display:inline-block; background:var(--brand-soft); color:var(--brand-dk);
  border-radius:999px; padding:1px 6px; margin-right:1.5mm; font-size:7.5pt; font-weight:600;
}
.meal-ingr{ margin-bottom:2mm; }
.ingr-label{ font-size:7.5pt; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:1mm; }
.ingr-pills{ display:flex; flex-wrap:wrap; gap:1.5mm; }
.ingr-pill{
  display:inline-block; background:var(--brand-mid); color:var(--brand-dk);
  border-radius:999px; padding:1px 7px; font-size:7.5pt; font-weight:500;
}
.meal-steps-label{ font-size:7.5pt; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:1mm; }
.meal-steps{ margin:0; padding-left:4.5mm; font-size:9.5pt; line-height:1.45; }
.meal-steps li{ margin-bottom:.7mm; }
.meal-steps li::marker{ color:var(--brand); font-weight:700; }
/* ── Shopping list ── */
.pdf-shopping{ margin-top:4mm; border:1px solid var(--line); border-radius:var(--r); overflow:hidden; page-break-inside:avoid; break-inside:avoid; }
.pdf-shopping-header{ background:var(--ink); color:#fff; padding:2.5mm 4mm; font-size:10.5pt; font-weight:800; }
.pdf-shopping-body{ padding:3mm 4mm; background:#fafff9; }
.shopping-grid{ display:grid; grid-template-columns:1fr 1fr; gap:.5mm 5mm; }
.shop-item{ font-size:9pt; padding:.8mm 0; border-bottom:1px dotted #dde; color:var(--ink); }
.shop-item::before{ content:'☐ '; color:var(--brand); font-size:9.5pt; font-weight:700; }
/* ── Grouped shopping list (uses the same engine as the static plan pages) ── */
.pdf-shopping--grouped .pdf-shopping-body{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:3mm 5mm; padding:3.5mm 4mm; background:#fafff9; }
.pdf-shop-group{ break-inside:avoid; page-break-inside:avoid; }
.pdf-shop-group-h{
  margin:0 0 1mm; padding-bottom:.6mm;
  font-size:7.5pt; font-weight:800; letter-spacing:.08em; text-transform:uppercase;
  color:var(--brand-dk); border-bottom:.4mm solid var(--brand-mid);
}
.pdf-shop-group[data-group="pantry"] .pdf-shop-group-h{ color:#666; border-bottom-color:#cfd6cf; }
.pdf-shop-list{ list-style:none; padding:0; margin:0; }
.pdf-shop-list li{
  display:flex; justify-content:space-between; align-items:baseline;
  gap:2mm; padding:.65mm 0; font-size:8.8pt; line-height:1.3;
  border-bottom:.2mm dotted #d8e0d6; color:var(--ink);
}
.pdf-shop-list li:last-child{ border-bottom:none; }
.pdf-shop-name::before{ content:'☐ '; color:var(--brand); font-size:9.2pt; }
.pdf-shop-qty{ color:#555; font-size:7.8pt; font-variant-numeric:tabular-nums; white-space:nowrap; flex-shrink:0; }
/* ── Locked upsell ── */
.pdf-locked{
  margin-top:4mm; padding:6mm; border:2px dashed var(--brand);
  border-radius:var(--r); background:var(--brand-soft); text-align:center;
  page-break-inside:avoid; break-inside:avoid;
}
.pdf-locked-icon{ font-size:16pt; margin-bottom:2mm; }
.pdf-locked-title{ font-size:11pt; font-weight:700; color:var(--brand-dk); margin-bottom:2mm; }
.pdf-locked-days{ font-size:8.5pt; color:var(--muted); filter:blur(2.5px); margin-bottom:2mm; }
.pdf-locked-sub{ font-size:9pt; color:#444; margin-bottom:4mm; line-height:1.5; }
.pdf-locked-cta{
  display:inline-block; padding:2.5mm 8mm; background:var(--brand); color:#fff;
  font-weight:700; font-size:9.5pt; border-radius:6px; letter-spacing:.01em;
}
/* ── Footer ── */
.doc-footer{ margin-top:5mm; padding-top:3mm; border-top:1px solid var(--line); font-size:8.5pt; color:var(--muted); text-align:center; }
/* ── Page breaks ── */
.page-break{ break-before:page; page-break-before:always; height:0; margin:0; padding:0; border:0; }
`;
  return { node, styleEl };
}
function maybeCompactToTwoPages(root){
  const MM_TO_PX = 96 / 25.4;
  const usable = (297 - 12 - 14) * MM_TO_PX;
  const pagesNeeded = Math.ceil(root.scrollHeight / usable);
  if (pagesNeeded > 3) {
    root.style.fontSize = '9.5pt';
    root.style.lineHeight = '1.28';
    root.querySelectorAll('.meal-block').forEach(s => { s.style.padding = '2mm 3mm'; });
    root.querySelectorAll('.meal-steps').forEach(u => { u.style.fontSize = '8.5pt'; });
    root.querySelectorAll('.pdf-cover').forEach(c => { c.style.padding = '8mm 10mm 6mm'; });
  }
}
function paginateCleanNode(root){
  const MM_TO_PX = 96 / 25.4;
  const usable = (297 - 12 - 14) * MM_TO_PX; // mm → px
  const csRoot = getComputedStyle(root);
  const padTop    = parseFloat(csRoot.paddingTop)    || 0;
  const padBottom = parseFloat(csRoot.paddingBottom) || 0;
  const blocks = root.querySelectorAll(
    '.pdf-cover, .recipe-section, .pdf-shopping, .pdf-locked, .doc-footer'
  );
  const SAFE = 24; 
  let page = 1;
  let y = padTop; 
  blocks.forEach(el => {
    const s  = getComputedStyle(el);
    const mt = parseFloat(s.marginTop)    || 0;
    const mb = parseFloat(s.marginBottom) || 0;
    const rectH = el.getBoundingClientRect().height; 
    const outerH = mt + rectH + mb;
    if (y + outerH > (usable * page) - SAFE) {
      const br = document.createElement('div');
      br.className = 'page-break';
      el.parentNode.insertBefore(br, el);
      page += 1;
      y = padTop + outerH; 
    } else {
      y += outerH;
    }
  });
  const footer = root.querySelector('.doc-footer');
  if (footer) {
    const sF  = getComputedStyle(footer);
    const mtF = parseFloat(sF.marginTop)    || 0;
    const mbF = parseFloat(sF.marginBottom) || 0;
    const hF  = footer.getBoundingClientRect().height + mtF + mbF;

    if (y + hF + padBottom > (usable * page) - SAFE) {
      const br = document.createElement('div');
      br.className = 'page-break';
      footer.parentNode.insertBefore(br, footer);
    }
  }
}
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
      test: r => ['Italia','Grecia','Franța','Spania','Turcia','Maroc','Portugalia'].includes(r.origin?.ro) },
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
  function updateShoppingList() {
    const listEl = document.getElementById('shopping-list');
    if (!listEl) return;
    const meals   = collectMeals();
    const allIngr = new Map();
    let   totalCost = 0;
    let   matchedRecipes = 0;

    meals.forEach(m => {
      [m.lunch, m.dinner].forEach(mealText => {
        if (!mealText) return;
        const recipeName = extractRecipeName(mealText);
        const rec = (window.recipes || []).find(r =>
          r.name?.[lang]?.toLowerCase() === recipeName.toLowerCase() ||
          r.name?.ro?.toLowerCase()     === recipeName.toLowerCase()
        );
        if (rec) {
          matchedRecipes++;
          if (rec.costRon) totalCost += rec.costRon;
        }
        const ingr = rec?.ingredients?.[lang] || rec?.ingredients?.ro || rec?.ingredients?.en || [];
        ingr.forEach(i => {
          const key = i.toLowerCase().replace(/\s*\(.*?\)/g,'').trim();
          // Skip trivial pantry staples everyone has at home
          const trivial = /^(ap[aă]|water|agua|eau|wasser|água|вода|水|お湯|su|acqua)$|^(sare|salt|sel|salz|sal|соль|塩|tuz)$|^(piper negru|black pepper|poivre noir|schwarzer pfeffer|pimienta negra|pepe nero|черный перец|黒胡椒)$/i;
          if (key && !trivial.test(key) && !allIngr.has(key)) allIngr.set(key, i);
        });
      });
    });

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
    if (allIngr.size === 0) {
      listEl.innerHTML = '';
      listEl.setAttribute('data-empty', 'true');
      if (countEl) countEl.textContent = '';
      return;
    }
    listEl.removeAttribute('data-empty');
    const sorted = [...allIngr.values()].sort((a,b)=>a.localeCompare(b));
    listEl.innerHTML = sorted.map(i =>
      `<li class="shopping-item">
         <label class="shopping-label">
           <input type="checkbox" class="shopping-check">
           <span>${i[0].toUpperCase() + i.slice(1)}</span>
         </label>
       </li>`
    ).join('');
    if (countEl) countEl.textContent = String(sorted.length);
  }

  // ── Recipe meta chips (time / cost / tags) under each meal input ──────────
  function getRecipeByInput(inputVal) {
    if (!inputVal) return null;
    const name = extractRecipeName(inputVal).toLowerCase();
    return (window.recipes || []).find(r =>
      r.name?.[lang]?.toLowerCase() === name || r.name?.ro?.toLowerCase() === name
    ) || null;
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
    // Description: use custom desc or first sentence of howIsMade, capped at 90 chars
    let descTxt = rec.desc?.[lang] || rec.desc?.en || '';
    if (!descTxt && rec.howIsMade) {
      const raw = rec.howIsMade[lang] || rec.howIsMade.ro || rec.howIsMade.en || '';
      descTxt = raw.split(/[.!?]/)[0].trim();
      if (descTxt && rec.time) descTxt += `. ${(READY_IN[lang] || READY_IN.en)(rec.time)}.`;
    }
    if (descTxt.length > 90) descTxt = descTxt.slice(0, 88) + '…';
    return `<div class="recipe-meta-row">${parts.join('')}${descTxt ? `<span class="rmeta-desc">${descTxt}</span>` : ''}</div>`;
  }

  function updateAllRecipeMeta() {
    for (let day = 1; day <= 7; day++) {
      ['l','c'].forEach(type => {
        const input = document.getElementById(`d${day}${type}`);
        if (!input) return;
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

  // Currency display: RON for Romanian, USD for everyone else
  function formatCost(ron) {
    if (lang === 'ro') return `~${ron} RON`;
    const usd = Math.round(ron / 4.6); // ~1 USD = 4.6 RON
    return `~$${usd}`;
  }
  function showCostEstimate(filterId) {
    let costBar = document.getElementById('cost-estimate-bar');
    if (!costBar) {
      costBar = document.createElement('div');
      costBar.id = 'cost-estimate-bar';
      costBar.className = 'cost-estimate-bar';
      const bar = document.getElementById('auto-menu-bar');
      if (bar) bar.appendChild(costBar);
    }
    const ron = COST_RON[filterId] || 200;
    costBar.innerHTML = `<i class="bi bi-currency-exchange"></i> <strong>${i18n[lang]?.costEstimate || 'Cost estimat'}: ${formatCost(ron)}</strong> / ${i18n[lang]?.perWeek || 'săptămână · 2 persoane'}`;
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
      });
    });
  }

  function updateAutoMenuBtn() {
    const autoBtn = document.getElementById('auto-menu-btn');
    if (autoBtn) {
      const mode = window._planMode;
      const icon = mode === 'meal' ? '✨' : '<i class="bi bi-shuffle" aria-hidden="true"></i>';
      autoBtn.innerHTML = `${icon} ${t(`mode.btn.${mode}`)}`;
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
    autoBtn.onclick = () => {
      generateRandomMenu();
      updateShoppingList();
      showCostEstimate(window._activeFilter);
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
    document.querySelectorAll('#plan-table input').forEach(inp => {
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
// --- Lazy-load pentru html2pdf.js (varianta sigură pe CDN)
async function ensureHtml2pdfLoaded() {
  if (window.html2pdf) return;
  await new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    s.onload = resolve;
    s.onerror = () => reject(new Error('Nu s-a putut încărca html2pdf'));
    document.head.appendChild(s);
  });
}
  function attachPdfListeners() {
  const freeBtn = document.getElementById('generate-btn');
  if (freeBtn && !freeBtn.dataset.attached) {
    freeBtn.onclick = async () => {
      await ensureHtml2pdfLoaded();
      // Free users always allowed — content is limited to 2 days inside generatePDFimpact()
      exportShoppingListToPDF();
    };
    freeBtn.dataset.attached = '1';
  }
  // butonul plătit apare dinamic
  if (resultDiv && !resultDiv.dataset.observing) {
    const obs = new MutationObserver(() => {
      const paidBtn = document.getElementById('paid-generate-pdf');
      if (paidBtn && !paidBtn.dataset.attached) {
        paidBtn.onclick = async () => {
          await ensureHtml2pdfLoaded();
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

function renderLandingFeatures() {
  const ID = 'landing-features-section';
  if (document.getElementById(ID)) return;

  const ro = lang === 'ro';
  const strings = {
    title: ro ? 'De ce Meal-Planner?' : 'Why Meal-Planner?',
    sub:   ro ? 'Simplu, rapid și complet gratuit.' : 'Simple, fast, and completely free.',
    features: ro ? [
      { icon:'💰', title:'Economisești bani',   desc:'Planifici exact ce cumperi — fără risipă, fără cheltuieli inutile' },
      { icon:'⏱️', title:'Economisești timp',   desc:'Lista de cumpărături se generează automat în câteva secunde' },
      { icon:'📄', title:'PDF frumos',           desc:'Descarcă planul tău ca PDF — perfect pentru imprimat sau partajat' },
      { icon:'🌍', title:'14 limbi',             desc:'Funcționează în română, engleză, spaniolă, franceză și 10 alte limbi' },
      { icon:'🍽️', title:'175+ rețete',         desc:'Rețete internaționale din 70+ țări cu ingrediente și mod de preparare' },
    ] : [
      { icon:'💰', title:'Save money',      desc:'Plan exactly what to buy — no waste, no impulse spending' },
      { icon:'⏱️', title:'Save time',       desc:'Shopping list generated automatically in seconds' },
      { icon:'📄', title:'Beautiful PDF',   desc:'Download your plan as a PDF — perfect for printing or sharing' },
      { icon:'🌍', title:'14 languages',   desc:'Works in English, Spanish, French, Romanian and 10 more' },
      { icon:'🍽️', title:'175+ recipes',   desc:'International recipes from 70+ countries with full instructions' },
    ]
  };

  const html = `
    <section id="${ID}" class="landing-features no-print">
      <div class="landing-features-inner">
        <h2 class="landing-features-title">${strings.title}</h2>
        <p class="landing-features-sub">${strings.sub}</p>
        <div class="features-grid">
          ${strings.features.map(f => `
            <div class="feature-card">
              <div class="feature-icon">${f.icon}</div>
              <div class="feature-title">${f.title}</div>
              <div class="feature-desc">${f.desc}</div>
            </div>`).join('')}
        </div>
      </div>
    </section>`;

  const hiw = document.getElementById('how-it-works-section');
  if (hiw) hiw.insertAdjacentHTML('afterend', html);
}

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
        { icon:'📄', n:3, title:'Download PDF',        desc:'A beautifully formatted PDF with your full plan and list — free once per day.' },
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
        { icon:'📄', n:3, title:'Descarga PDF',         desc:'Un PDF elegante con tu plan completo y la lista — gratis una vez al día.' },
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
        { icon:'📄', n:3, title:'Téléchargez le PDF',       desc:'Un PDF élégant avec votre plan complet et votre liste — gratuit une fois par jour.' },
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
        { icon:'📄', n:3, title:'PDF herunterladen',     desc:'Ein elegantes PDF mit Ihrem vollständigen Plan — einmal täglich kostenlos.' },
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
        { icon:'📄', n:3, title:'Baixar PDF',              desc:'Um PDF elegante com seu plano completo e lista — gratuito uma vez por dia.' },
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
        { icon:'📄', n:3, title:'Скачать PDF',            desc:'Красивый PDF с полным планом и списком — бесплатно один раз в день.' },
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
        { icon:'📄', n:3, title:'Scarica il PDF',            desc:'Un elegante PDF con il tuo piano completo e la lista — gratuito una volta al giorno.' },
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
        { icon:'📄', n:3, title:'PDF indir',                 desc:'Tam planınız ve listenizle zarif bir PDF — günde bir kez ücretsiz.' },
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
        { icon:'📄', n:3, title:'تحميل PDF',               desc:'ملف PDF أنيق مع خطتك الكاملة والقائمة — مجانًا مرة في اليوم.' },
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
        { icon:'📄', n:3, title:'下载PDF',         desc:'格式精美的PDF包含完整计划和清单 — 每天免费一次。' },
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
        { icon:'📄', n:3, title:'PDFをダウンロード',      desc:'完全なプランとリストが入った美しいPDF — 1日1回無料。' },
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
        { icon:'📄', n:3, title:'PDF 다운로드',          desc:'완전한 계획과 목록이 담긴 예쁜 PDF — 하루 한 번 무료.' },
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
        { icon:'📄', n:3, title:'PDF डाउनलोड करें',      desc:'आपकी पूरी योजना और सूची के साथ एक सुंदर PDF — दिन में एक बार मुफ्त।' },
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
      sub:   '8 meniuri complete săptămânale și 175+ rețete internaționale',
      m_title: 'Meniuri Săptămânale',
      m_desc: '8 planuri complete — Mediteranean, Asian, Vegetarian, Buget și altele — cu liste de cumpărături incluse.',
      m_cta:  'Explorează meniurile →',
      r_title: '175+ Rețete Internaționale',
      r_desc: 'Rețete autentice din 70+ țări cu ingrediente, mod de preparare, valori nutriționale și sfaturi.',
      r_cta:  'Descoperă rețetele →',
    },
    en: {
      title: 'Explore and get inspired',
      sub:   '8 complete weekly menus and 175+ international recipes',
      m_title: 'Weekly Menus',
      m_desc: '8 complete plans — Mediterranean, Asian, Vegetarian, Budget and more — with shopping lists included.',
      m_cta:  'Explore menus →',
      r_title: '175+ International Recipes',
      r_desc: 'Authentic recipes from 70+ countries with ingredients, instructions, nutrition info and tips.',
      r_cta:  'Discover recipes →',
    },
    es: {
      title: 'Explora e inspírate',
      sub:   '8 menús semanales completos y 175+ recetas internacionales',
      m_title: 'Menús Semanales',
      m_desc: '8 planes completos — Mediterráneo, Asiático, Vegetariano, Económico y más — con listas de compras.',
      m_cta:  'Explorar menús →',
      r_title: '175+ Recetas Internacionales',
      r_desc: 'Recetas auténticas de 70+ países con ingredientes, preparación, nutrición y consejos.',
      r_cta:  'Descubrir recetas →',
    },
    fr: {
      title: 'Explorez et inspirez-vous',
      sub:   '8 menus hebdomadaires complets et 175+ recettes internationales',
      m_title: 'Menus Hebdomadaires',
      m_desc: '8 plans complets — Méditerranéen, Asiatique, Végétarien, Budget et plus — avec listes de courses.',
      m_cta:  'Explorer les menus →',
      r_title: '175+ Recettes Internationales',
      r_desc: 'Recettes authentiques de 70+ pays avec ingrédients, instructions, nutrition et conseils.',
      r_cta:  'Découvrir les recettes →',
    },
    de: {
      title: 'Entdecken und inspirieren lassen',
      sub:   '8 vollständige Wochenpläne und 175+ internationale Rezepte',
      m_title: 'Wochenpläne',
      m_desc: '8 vollständige Pläne — Mediterran, Asiatisch, Vegetarisch, Budget und mehr — mit Einkaufslisten.',
      m_cta:  'Pläne erkunden →',
      r_title: '175+ Internationale Rezepte',
      r_desc: 'Authentische Rezepte aus 70+ Ländern mit Zutaten, Anleitung, Nährwerten und Tipps.',
      r_cta:  'Rezepte entdecken →',
    },
    pt: {
      title: 'Explore e inspire-se',
      sub:   '8 planos semanais completos e 175+ receitas internacionais',
      m_title: 'Planos Semanais',
      m_desc: '8 planos completos — Mediterrâneo, Asiático, Vegetariano, Econômico e mais — com listas de compras.',
      m_cta:  'Explorar planos →',
      r_title: '175+ Receitas Internacionais',
      r_desc: 'Receitas autênticas de 70+ países com ingredientes, preparo, nutrição e dicas.',
      r_cta:  'Descobrir receitas →',
    },
    ru: {
      title: 'Исследуйте и вдохновляйтесь',
      sub:   '8 полных недельных меню и 175+ международных рецептов',
      m_title: 'Еженедельные меню',
      m_desc: '8 полных планов — Средиземноморский, Азиатский, Вегетарианский, Бюджетный и другие — со списками.',
      m_cta:  'Просмотреть меню →',
      r_title: '175+ Международных рецептов',
      r_desc: 'Аутентичные рецепты из 70+ стран с ингредиентами, приготовлением, нутриентами и советами.',
      r_cta:  'Открыть рецепты →',
    },
    it: {
      title: 'Esplora e ispirati',
      sub:   '8 menu settimanali completi e 175+ ricette internazionali',
      m_title: 'Menu Settimanali',
      m_desc: '8 piani completi — Mediterraneo, Asiatico, Vegetariano, Budget e altro — con liste della spesa.',
      m_cta:  'Esplora i menu →',
      r_title: '175+ Ricette Internazionali',
      r_desc: 'Ricette autentiche da 70+ paesi con ingredienti, preparazione, valori nutrizionali e consigli.',
      r_cta:  'Scopri le ricette →',
    },
    tr: {
      title: 'Keşfet ve ilham al',
      sub:   '8 tam haftalık menü ve 175+ uluslararası tarif',
      m_title: 'Haftalık Menüler',
      m_desc: '8 tam plan — Akdeniz, Asya, Vejetaryen, Bütçe ve daha fazlası — alışveriş listeleriyle birlikte.',
      m_cta:  'Menüleri keşfet →',
      r_title: '175+ Uluslararası Tarif',
      r_desc: '70+ ülkeden otantik tarifler: malzemeler, yapılış, besin değerleri ve ipuçlarıyla.',
      r_cta:  'Tarifleri keşfet →',
    },
    ar: {
      title: 'استكشف واستلهم',
      sub:   '8 قوائم أسبوعية كاملة و175+ وصفة دولية',
      m_title: 'القوائم الأسبوعية',
      m_desc: '8 خطط كاملة — متوسطية، آسيوية، نباتية، اقتصادية وأكثر — مع قوائم التسوق.',
      m_cta:  'استكشف القوائم →',
      r_title: '+175 وصفة دولية',
      r_desc: 'وصفات أصيلة من 70+ دولة مع المكونات وطريقة التحضير والقيم الغذائية.',
      r_cta:  'اكتشف الوصفات →',
    },
    zh: {
      title: '探索并获得灵感',
      sub:   '8个完整的周计划和175+国际食谱',
      m_title: '每周菜单',
      m_desc: '8个完整计划 — 地中海、亚洲、素食、经济型等 — 附购物清单。',
      m_cta:  '探索菜单 →',
      r_title: '175+国际食谱',
      r_desc: '来自70+国家的正宗食谱，包含食材、做法、营养信息和小贴士。',
      r_cta:  '发现食谱 →',
    },
    ja: {
      title: '探索してインスピレーションを得よう',
      sub:   '8つの完全な週間メニューと175以上の国際的なレシピ',
      m_title: '週間メニュー',
      m_desc: '8つの完全なプラン — 地中海、アジア、ベジタリアン、節約など — 買い物リスト付き。',
      m_cta:  'メニューを探索 →',
      r_title: '175以上の国際レシピ',
      r_desc: '70以上の国からの本格レシピ。材料・作り方・栄養価・コツ付き。',
      r_cta:  'レシピを発見 →',
    },
    ko: {
      title: '탐색하고 영감을 얻으세요',
      sub:   '8가지 완전한 주간 메뉴와 175개 이상의 국제 레시피',
      m_title: '주간 메뉴',
      m_desc: '8가지 완전한 플랜 — 지중해, 아시아, 채식, 절약 등 — 장보기 목록 포함.',
      m_cta:  '메뉴 탐색 →',
      r_title: '175+ 국제 레시피',
      r_desc: '70개 이상의 나라에서 온 정통 레시피. 재료, 조리법, 영양 정보, 팁 포함.',
      r_cta:  '레시피 발견 →',
    },
    hi: {
      title: 'खोजें और प्रेरणा लें',
      sub:   '8 पूर्ण साप्ताहिक मेनू और 175+ अंतर्राष्ट्रीय व्यंजन',
      m_title: 'साप्ताहिक मेनू',
      m_desc: '8 पूर्ण योजनाएं — भूमध्यसागरीय, एशियाई, शाकाहारी, बजट और अधिक — खरीदारी सूची के साथ।',
      m_cta:  'मेनू देखें →',
      r_title: '175+ अंतर्राष्ट्रीय व्यंजन',
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
      badge: 'Gratuit · Fără cont · 14 limbi',
      line1: 'Mâncă bine,',
      line2: 'în fiecare',
      line3: 'săptămână.',
      sub: 'Plan complet în câteva secunde.\nListă de cumpărături automată. PDF gratuit.',
      stat1n:'175+', stat1l:'Rețete',
      stat2n:'14',   stat2l:'Limbi',
      stat3n:'0€',   stat3l:'Mereu gratuit',
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
      badge: 'Free · No account · 14 languages',
      line1: 'Eat well,',
      line2: 'every single',
      line3: 'week.',
      sub: 'Full plan in seconds.\nAuto shopping list. Free PDF download.',
      stat1n:'175+', stat1l:'Recipes',
      stat2n:'14',   stat2l:'Languages',
      stat3n:'Free', stat3l:'Forever',
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
      badge: 'Gratis · Sin cuenta · 14 idiomas',
      line1: 'Come bien,',
      line2: 'cada',
      line3: 'semana.',
      sub: 'Plan completo en segundos.\nLista de compras automática. PDF gratis.',
      stat1n:'175+', stat1l:'Recetas',
      stat2n:'14',   stat2l:'Idiomas',
      stat3n:'0€',   stat3l:'Siempre gratis',
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
      badge: 'Gratuit · Sans compte · 14 langues',
      line1: 'Mangez bien,',
      line2: 'chaque',
      line3: 'semaine.',
      sub: 'Plan complet en quelques secondes.\nListe de courses automatique. PDF gratuit.',
      stat1n:'175+', stat1l:'Recettes',
      stat2n:'14',   stat2l:'Langues',
      stat3n:'0€',   stat3l:'Toujours gratuit',
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
      badge: 'Kostenlos · Kein Konto · 14 Sprachen',
      line1: 'Gut essen,',
      line2: 'jede',
      line3: 'Woche.',
      sub: 'Vollständiger Plan in Sekunden.\nEinkaufsliste automatisch. PDF kostenlos.',
      stat1n:'175+', stat1l:'Rezepte',
      stat2n:'14',   stat2l:'Sprachen',
      stat3n:'0€',   stat3l:'Immer kostenlos',
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
      badge: 'Gratuito · Sem conta · 14 idiomas',
      line1: 'Coma bem,',
      line2: 'todas as',
      line3: 'semanas.',
      sub: 'Plano completo em segundos.\nLista de compras automática. PDF gratuito.',
      stat1n:'175+', stat1l:'Receitas',
      stat2n:'14',   stat2l:'Idiomas',
      stat3n:'0€',   stat3l:'Sempre grátis',
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
      badge: 'Бесплатно · Без аккаунта · 14 языков',
      line1: 'Питайтесь',
      line2: 'хорошо',
      line3: 'каждую неделю.',
      sub: 'Полный план за секунды.\nСписок покупок автоматически. PDF бесплатно.',
      stat1n:'175+', stat1l:'Рецептов',
      stat2n:'14',   stat2l:'Языков',
      stat3n:'0€',   stat3l:'Всегда бесплатно',
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
      badge: 'Gratuito · Senza account · 14 lingue',
      line1: 'Mangia bene,',
      line2: 'ogni',
      line3: 'settimana.',
      sub: 'Piano completo in pochi secondi.\nLista della spesa automatica. PDF gratuito.',
      stat1n:'175+', stat1l:'Ricette',
      stat2n:'14',   stat2l:'Lingue',
      stat3n:'0€',   stat3l:'Sempre gratuito',
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
      badge: 'Ücretsiz · Hesap yok · 14 dil',
      line1: 'Her hafta',
      line2: 'iyi',
      line3: 'yiyin.',
      sub: 'Saniyeler içinde tam plan.\nOtomatik alışveriş listesi. Ücretsiz PDF.',
      stat1n:'175+', stat1l:'Tarif',
      stat2n:'14',   stat2l:'Dil',
      stat3n:'0€',   stat3l:'Hep ücretsiz',
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
      badge: 'مجاني · بدون حساب · 14 لغة',
      line1: 'تناول طعاماً',
      line2: 'صحياً كل',
      line3: 'أسبوع.',
      sub: 'خطة كاملة في ثوانٍ.\nقائمة تسوق تلقائية. PDF مجاني.',
      stat1n:'175+', stat1l:'وصفة',
      stat2n:'14',   stat2l:'لغة',
      stat3n:'0€',   stat3l:'مجاني دائماً',
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
      badge: '免费 · 无需账户 · 14种语言',
      line1: '每周',
      line2: '吃得',
      line3: '好。',
      sub: '几秒内生成完整计划。\n自动购物清单。免费PDF下载。',
      stat1n:'175+', stat1l:'食谱',
      stat2n:'14',   stat2l:'语言',
      stat3n:'免费', stat3l:'永久免费',
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
      badge: '無料 · アカウント不要 · 14言語',
      line1: '毎週、',
      line2: 'おいしく',
      line3: '食べよう。',
      sub: '数秒でフルプラン完成。\n買い物リスト自動生成。PDF無料ダウンロード。',
      stat1n:'175+', stat1l:'レシピ',
      stat2n:'14',   stat2l:'言語',
      stat3n:'無料', stat3l:'ずっと無料',
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
      badge: '무료 · 계정 불필요 · 14개 언어',
      line1: '매주,',
      line2: '잘',
      line3: '먹으세요.',
      sub: '몇 초 만에 전체 플랜 완성.\n자동 장보기 목록. 무료 PDF 다운로드.',
      stat1n:'175+', stat1l:'레시피',
      stat2n:'14',   stat2l:'언어',
      stat3n:'무료', stat3l:'영원히 무료',
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
      badge: 'मुफ़्त · कोई खाता नहीं · 14 भाषाएं',
      line1: 'हर हफ्ते',
      line2: 'अच्छा',
      line3: 'खाएं।',
      sub: 'कुछ सेकंड में पूरी योजना।\nस्वचालित खरीदारी सूची। मुफ़्त PDF डाउनलोड।',
      stat1n:'175+', stat1l:'व्यंजन',
      stat2n:'14',   stat2l:'भाषाएं',
      stat3n:'मुफ़्त', stat3l:'हमेशा मुफ़्त',
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
        <h1 class="hero-premium-title">
          ${safeText(s.line1)}<br>${safeText(s.line2)}<br><em>${safeText(s.line3)}</em>
        </h1>
        <p class="hero-premium-sub">${safeText(s.sub).replace('\n','<br>')}</p>
        <div class="hero-stats-row" aria-label="Key stats">
          <div class="hero-stat">
            <span class="hero-stat-num">${safeText(s.stat1n)}</span>
            <span class="hero-stat-label">${safeText(s.stat1l)}</span>
          </div>
          <span class="hero-stat-sep" aria-hidden="true">·</span>
          <div class="hero-stat">
            <span class="hero-stat-num">${safeText(s.stat2n)}</span>
            <span class="hero-stat-label">${safeText(s.stat2l)}</span>
          </div>
          <span class="hero-stat-sep" aria-hidden="true">·</span>
          <div class="hero-stat">
            <span class="hero-stat-num">${safeText(s.stat3n)}</span>
            <span class="hero-stat-label">${safeText(s.stat3l)}</span>
          </div>
        </div>
        <div class="hero-premium-cta">
          <button class="btn-hero-cta" id="hero-cta-btn" type="button">${safeText(s.cta)}</button>
          <a href="${mUrl}" class="hero-ghost-link">${safeText(s.ghost)}</a>
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
              ${meals.map(([d,l,c]) => `
              <div class="phone-meal-row">
                <span class="phone-meal-day">${safeText(d)}</span>
                <span class="phone-meal-name">${safeText(l)}</span>
                <span class="phone-meal-name">${safeText(c)}</span>
              </div>`).join('')}
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
 function renderHowItWorks() {
  const SECTION_ID = 'how-it-works-section';
  const t = key => (i18n[lang] && i18n[lang][key]) || (i18n['en'] && i18n['en'][key]) || key;
  const isRtl = lang === 'ar';

  const steps = [
    { icon: '📋', titleKey: 'how.step1.title', descKey: 'how.step1.desc' },
    { icon: '🛒', titleKey: 'how.step2.title', descKey: 'how.step2.desc' },
    { icon: '📥', titleKey: 'how.step3.title', descKey: 'how.step3.desc' },
  ];

  const stepsHTML = steps.map((s, i) => `
    <div class="how-step">
      <div class="how-step-icon">
        <span class="how-step-num">${i + 1}</span>
        ${s.icon}
      </div>
      <h3 class="how-step-title">${t(s.titleKey)}</h3>
      <p class="how-step-desc">${t(s.descKey)}</p>
    </div>
  `).join('');

  const html = `
    <section id="${SECTION_ID}" class="how-it-works no-print" aria-label="${t('how.title')}"${isRtl ? ' dir="rtl"' : ''}>
      <div class="how-inner">
        <h2 class="how-title">${t('how.title')}</h2>
        <div class="how-steps">${stepsHTML}</div>
      </div>
    </section>`;

  const existing = document.getElementById(SECTION_ID);
  if (existing) {
    existing.outerHTML = html;
  } else {
    const main = document.querySelector('.app-main');
    if (main) main.insertAdjacentHTML('beforebegin', html);
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
  renderDiscovery();
  renderPlannerAnchor();
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
                       '✅ 175 rețete din 70+ țări','✅ Previzualizare gratuită — 2 zile din 7',
                       '✗ PDF cu toate 7 zilele','✗ Meniu buget ieftin'],
            premFeats:['✅ Tot ce e gratuit, plus:','✅ PDF cu toate cele 7 zile',
                       '✅ Meniu buget săptămânal','✅ Asistent AI rețete (chat)',
                       '✅ Asistent AI planificare mese','✅ Acces nelimitat oricând'] },
      en: { title:'Free vs Premium', freeName:'Free', premName:'⭐ Premium',
            price:'€3/month', sub:'', popular:'MOST POPULAR',
            cta:'Get Premium →', already:'Already subscribed? Activate below ↓',
            freeFeats:['✅ 7-day meal plan','✅ Auto shopping list',
                       '✅ 175 recipes from 70+ countries','✅ Free preview — 2 of 7 days',
                       '✗ Full 7-day PDF','✗ Budget menu'],
            premFeats:['✅ Everything in Free, plus:','✅ Full PDF with all 7 days',
                       '✅ Weekly budget menu','✅ AI recipe assistant (chat)',
                       '✅ AI meal planning assistant','✅ Unlimited access anytime'] },
      es: { title:'Gratis vs Premium', freeName:'Gratis', premName:'⭐ Premium',
            price:'€3/mes', sub:'', popular:'MÁS POPULAR',
            cta:'Obtener Premium →', already:'¿Ya suscrito? Activa abajo ↓',
            freeFeats:['✅ Plan de comidas 7 días','✅ Lista de compras automática',
                       '✅ 175 recetas de 70+ países','✅ Vista previa gratuita — 2 de 7 días',
                       '✗ PDF con los 7 días','✗ Menú económico'],
            premFeats:['✅ Todo lo gratis, más:','✅ PDF completo con 7 días',
                       '✅ Menú económico semanal','✅ Asistente IA recetas (chat)',
                       '✅ Asistente IA planificación','✅ Acceso ilimitado siempre'] },
      fr: { title:'Gratuit vs Premium', freeName:'Gratuit', premName:'⭐ Premium',
            price:'€3/mois', sub:'', popular:'LE PLUS POPULAIRE',
            cta:'Obtenir Premium →', already:'Déjà abonné ? Activez ci-dessous ↓',
            freeFeats:['✅ Plan de repas 7 jours','✅ Liste de courses automatique',
                       '✅ 175 recettes de 70+ pays','✅ Aperçu gratuit — 2 jours sur 7',
                       '✗ PDF avec les 7 jours','✗ Menu budget'],
            premFeats:['✅ Tout le gratuit, plus :','✅ PDF complet sur 7 jours',
                       '✅ Menu budget hebdomadaire','✅ Assistant IA recettes (chat)',
                       '✅ Assistant IA planification','✅ Accès illimité à tout moment'] },
      de: { title:'Kostenlos vs Premium', freeName:'Kostenlos', premName:'⭐ Premium',
            price:'€3/Monat', sub:'', popular:'AM BELIEBTESTEN',
            cta:'Premium holen →', already:'Bereits abonniert? Unten aktivieren ↓',
            freeFeats:['✅ 7-Tage-Mahlzeitenplan','✅ Automatische Einkaufsliste',
                       '✅ 175 Rezepte aus 70+ Ländern','✅ Kostenlose Vorschau — 2 von 7 Tagen',
                       '✗ PDF mit allen 7 Tagen','✗ Budget-Menü'],
            premFeats:['✅ Alles Kostenlose, plus:','✅ PDF mit allen 7 Tagen',
                       '✅ Wöchentliches Budget-Menü','✅ KI-Rezept-Assistent (Chat)',
                       '✅ KI-Mahlzeiten-Assistent','✅ Unbegrenzter Zugang'] },
      pt: { title:'Gratuito vs Premium', freeName:'Gratuito', premName:'⭐ Premium',
            price:'€3/mês', sub:'', popular:'MAIS POPULAR',
            cta:'Obter Premium →', already:'Já assinante? Ative abaixo ↓',
            freeFeats:['✅ Plano de refeições 7 dias','✅ Lista de compras automática',
                       '✅ 175 receitas de 70+ países','✅ Pré-visualização gratuita — 2 de 7 dias',
                       '✗ PDF com todos os 7 dias','✗ Menu económico'],
            premFeats:['✅ Tudo gratuito, mais:','✅ PDF completo com 7 dias',
                       '✅ Menu económico semanal','✅ Assistente IA receitas (chat)',
                       '✅ Assistente IA planeamento','✅ Acesso ilimitado'] },
      ru: { title:'Бесплатно vs Премиум', freeName:'Бесплатно', premName:'⭐ Премиум',
            price:'€3/мес', sub:'', popular:'САМЫЙ ПОПУЛЯРНЫЙ',
            cta:'Получить Премиум →', already:'Уже подписаны? Активируйте ниже ↓',
            freeFeats:['✅ План питания на 7 дней','✅ Автоматический список покупок',
                       '✅ 175 рецептов из 70+ стран','✅ Бесплатный просмотр — 2 из 7 дней',
                       '✗ PDF на все 7 дней','✗ Бюджетное меню'],
            premFeats:['✅ Всё из бесплатного, плюс:','✅ Полный PDF на 7 дней',
                       '✅ Недельное бюджетное меню','✅ ИИ-помощник по рецептам (чат)',
                       '✅ ИИ-помощник по планированию','✅ Безлимитный доступ'] },
      ar: { title:'مجاني vs بريميوم', freeName:'مجاني', premName:'⭐ بريميوم',
            price:'€3/شهر', sub:'', popular:'الأكثر شعبية',
            cta:'احصل على بريميوم →', already:'مشترك بالفعل؟ فعّل أدناه ↓',
            freeFeats:['✅ خطة وجبات 7 أيام','✅ قائمة تسوق تلقائية',
                       '✅ 175 وصفة من 70+ دولة','✅ معاينة مجانية — يومان من أصل 7',
                       '✗ PDF كامل 7 أيام','✗ قائمة الميزانية'],
            premFeats:['✅ كل المجاني، بالإضافة:','✅ PDF كامل بجميع 7 أيام',
                       '✅ قائمة ميزانية أسبوعية','✅ مساعد وصفات بالذكاء الاصطناعي (دردشة)',
                       '✅ مساعد الذكاء الاصطناعي للتخطيط','✅ وصول غير محدود'] },
      zh: { title:'免费 vs 高级版', freeName:'免费', premName:'⭐ 高级版',
            price:'€3/月', sub:'', popular:'最受欢迎',
            cta:'获取高级版 →', already:'已订阅？在下方激活 ↓',
            freeFeats:['✅ 7天餐饮计划','✅ 自动购物清单',
                       '✅ 70+国175道菜谱','✅ 免费预览 — 7天中的2天',
                       '✗ 完整7天PDF','✗ 节俭菜单'],
            premFeats:['✅ 所有免费功能，加上：','✅ 完整7天PDF',
                       '✅ 每周节俭菜单','✅ AI食谱助手（聊天）',
                       '✅ AI膳食规划助手','✅ 随时无限访问'] },
      ja: { title:'無料 vs プレミアム', freeName:'無料', premName:'⭐ プレミアム',
            price:'€3/月', sub:'', popular:'最人気',
            cta:'プレミアムを取得 →', already:'すでに購読済み？下でアクティブ化 ↓',
            freeFeats:['✅ 7日間の食事プラン','✅ 自動買い物リスト',
                       '✅ 70カ国以上175レシピ','✅ 無料プレビュー — 7日中2日',
                       '✗ 7日分フルPDF','✗ 節約メニュー'],
            premFeats:['✅ 無料のすべて、プラス：','✅ 7日分フルPDF',
                       '✅ 週間節約メニュー','✅ AIレシピアシスタント（チャット）',
                       '✅ AIミールプランアシスタント','✅ 無制限アクセス'] },
      tr: { title:'Ücretsiz vs Premium', freeName:'Ücretsiz', premName:'⭐ Premium',
            price:'€3/ay', sub:'', popular:'EN POPÜLER',
            cta:'Premium Al →', already:'Zaten abone misiniz? Aşağıdan aktive edin ↓',
            freeFeats:['✅ 7 günlük yemek planı','✅ Otomatik alışveriş listesi',
                       '✅ 70+ ülkeden 175 tarif','✅ Ücretsiz önizleme — 7 günden 2\'si',
                       '✗ 7 günlük tam PDF','✗ Bütçe menüsü'],
            premFeats:['✅ Ücretsizin her şeyi, artı:','✅ 7 günlük tam PDF',
                       '✅ Haftalık bütçe menüsü','✅ AI tarif asistanı (sohbet)',
                       '✅ AI yemek planlama asistanı','✅ Sınırsız erişim'] },
      it: { title:'Gratuito vs Premium', freeName:'Gratuito', premName:'⭐ Premium',
            price:'€3/mese', sub:'', popular:'PIÙ POPOLARE',
            cta:'Ottieni Premium →', already:'Già abbonato? Attiva qui sotto ↓',
            freeFeats:['✅ Piano pasti 7 giorni','✅ Lista della spesa automatica',
                       '✅ 175 ricette da 70+ paesi','✅ Anteprima gratuita — 2 giorni su 7',
                       '✗ PDF con tutti i 7 giorni','✗ Menu economico'],
            premFeats:['✅ Tutto il gratuito, più:','✅ PDF completo 7 giorni',
                       '✅ Menu economico settimanale','✅ Assistente IA ricette (chat)',
                       '✅ Assistente IA pianificazione','✅ Accesso illimitato'] },
      ko: { title:'무료 vs 프리미엄', freeName:'무료', premName:'⭐ 프리미엄',
            price:'€3/월', sub:'', popular:'가장 인기',
            cta:'프리미엄 이용 →', already:'이미 구독 중? 아래에서 활성화 ↓',
            freeFeats:['✅ 7일 식단 계획','✅ 자동 장보기 목록',
                       '✅ 70개국 175가지 레시피','✅ 무료 미리보기 — 7일 중 2일',
                       '✗ 7일 전체 PDF','✗ 예산 메뉴'],
            premFeats:['✅ 무료의 모든 것, 추가로:','✅ 7일 전체 PDF',
                       '✅ 주간 예산 메뉴','✅ AI 레시피 도우미 (채팅)',
                       '✅ AI 식단 계획 도우미','✅ 무제한 접속'] },
      hi: { title:'मुफ्त vs प्रीमियम', freeName:'मुफ्त', premName:'⭐ प्रीमियम',
            price:'€3/माह', sub:'', popular:'सबसे लोकप्रिय',
            cta:'प्रीमियम पाएं →', already:'पहले से सदस्य? नीचे सक्रिय करें ↓',
            freeFeats:['✅ 7 दिन का भोजन योजना','✅ स्वचालित खरीदारी सूची',
                       '✅ 70+ देशों की 175 रेसिपी','✅ मुफ्त पूर्वावलोकन — 7 में से 2 दिन',
                       '✗ पूर्ण 7 दिन PDF','✗ बजट मेनू'],
            premFeats:['✅ सब कुछ मुफ्त में, साथ में:','✅ पूर्ण 7 दिन PDF',
                       '✅ साप्ताहिक बजट मेनू','✅ AI रेसिपी सहायक (चैट)',
                       '✅ AI भोजन योजना सहायक','✅ असीमित पहुंच'] },
    };

    const s = P[lang] || P.en;
    const freeList = s.freeFeats.map(f =>
      `<li class="${f.startsWith('✗') ? 'feat-no' : ''}">${f}</li>`
    ).join('');
    const premList = s.premFeats.map(f => `<li>${f}</li>`).join('');

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
if (verifyBtn && emailInput && resultDiv) {
  verifyBtn.onclick = async function () {
    const email = emailInput.value.trim();
    resultDiv.innerText = (i18n[lang]?.msg?.checking) || 'Checking...';
    if (manageBtn) manageBtn.style.display = 'none';
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

    if (active) {
      window.hasUnlimited = true;
      // Store email for AI endpoints (chat/coach require email in POST body)
      window.verifiedEmail = email;
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
      if (manageBtn) {
        manageBtn.style.display = 'inline-block';
        manageBtn.onclick = async () => {
          try {
            const r = await fetch('/api/create-portal-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                returnUrl: window.location.origin + window.location.pathname
              })
            });
            const { url, error } = await r.json();
            if (error || !url) { alert(error || 'Nu s-a putut deschide portalul Stripe.'); return; }
            window.location.href = url;
          } catch (e) {
            alert('Eroare: ' + e.message);
          }
        };
      }
      if (typeof updateButtonState === 'function') updateButtonState();
    } else if (found) {
      // Account exists but subscription is expired
      window.hasUnlimited = false;
      resultDiv.innerHTML = `<span class="text-danger">${i18n[lang]?.msg?.invalid || 'Nu există acces valid pentru acest email.'}</span>`;
      if (manageBtn) manageBtn.style.display = 'none';
      if (typeof updateButtonState === 'function') updateButtonState();
    } else {
      // No account found at all
      window.hasUnlimited = false;
      resultDiv.innerHTML = `<span class="text-danger">${i18n[lang]?.msg?.not_found || 'Nu există acces pentru acest email. Plătește întâi sau verifică adresa.'}</span>`;
      if (manageBtn) manageBtn.style.display = 'none';
      if (typeof updateButtonState === 'function') updateButtonState();
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
  window.generatePDFimpact = generatePDFimpact;
  window.exportShoppingListToPDF = exportShoppingListToPDF;
  window.updateShoppingList = updateShoppingList;

  // ---------- Wire plan-table inputs → live shopping list + meta ----------
  function wireInputsToShoppingList() {
    document.querySelectorAll('#plan-table input').forEach(inp => {
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
    // Map of plan ID → { lunches[], dinners[], isBudget? }
    const PLAN_DATA = {
      mediteranean: {
        lunches: ['Spaghete Carbonara','Gazpacho','Quiche Lorraine','Risotto','Paella','Pasta e fagioli','Pasta alla Norma'],
        dinners: ['Moussaka','Ratatouille','Souvlaki','Tagine','Boeuf Bourguignon','Spanakopita','Harira']
      },
      asia: {
        lunches: ['Pho','Bibimbap','Tom Yum','Pad Thai','Dhal','Kimbap','Okonomiyaki'],
        dinners: ['Sushi','Curry de pui','Ramen','Pui Gong Bao','Nasi Goreng','Rendang','Tom Kha Gai']
      },
      buget: { isBudget: true },
      'est-european': {
        lunches: ['Ciorbă de burtă','Bors','Fasole cu cârnați','Gulaș','Pierogi','Lobio','Chakhokhbili'],
        dinners: ['Pui Kiev','Khinkali','Chicken Paprikash','Kotlet schabowy','Zeamă','Okroshka','Solyanka']
      },
      'tur-mondial': {
        lunches: ['Schnitzel','Tabbouleh','Hummus','Koshari','Shakshuka','Smørrebrød','Chakchouka'],
        dinners: ['Cheeseburger','Fish and Chips','Chifteluțe suedeze','Jerk Chicken','Jollof Rice','Biryani','Bobotie']
      },
      latin: {
        lunches: ['Tamale','Arroz Chaufa','Lomo Saltado','Picadillo','Pozole','Pupusa','Arepa'],
        dinners: ['Tacos','Feijoada','Chili con carne','Moqueca','Ropa Vieja','Bandeja Paisa','Chiles en nogada']
      },
      vegetarian: {
        lunches: ['Gazpacho','Tabbouleh','Ratatouille','Dhal','Shakshuka','Fasolada','Pasta alla Norma'],
        dinners: ['Moussaka','Pad Thai','Rajma','Hummus','Bibimbap','Spanakopita','Mapo Tofu']
      },
      rapid: {
        lunches: ['Spaghete Carbonara','Tacos','Pad Thai','Shakshuka','Dhal','Schnitzel','Okonomiyaki'],
        dinners: ['Pui Gong Bao','Pho','Tom Yum','Curry de pui','Nasi Goreng','Cheeseburger','Fish and Chips']
      }
    };
    const plan = PLAN_DATA[autoplanParam];
    if (plan) {
      setTimeout(() => { // wait for renderTable
        if (plan.isBudget) {
          window.isBudgetMenu = true;
          generateRandomMenu();
        } else {
          const allSrc = [...recipesMain, ...recipesBudget];
          plan.lunches.forEach((name, i) => {
            const inp = document.getElementById(`d${i+1}l`);
            if (!inp) return;
            const rec = allSrc.find(r => r.name?.ro === name || r.name?.en === name);
            inp.value = rec ? getRecipeText(rec, lang) : name;
          });
          plan.dinners.forEach((name, i) => {
            const inp = document.getElementById(`d${i+1}c`);
            if (!inp) return;
            const rec = allSrc.find(r => r.name?.ro === name || r.name?.en === name);
            inp.value = rec ? getRecipeText(rec, lang) : name;
          });
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
    setTimeout(() => {
      const allSrc = [...recipesMain, ...recipesBudget];
      const rec = allSrc.find(r =>
        Object.values(r.name || {}).some(n => n.toLowerCase() === mealParam.toLowerCase())
      );
      // Find first empty slot (lunch first, then dinner)
      const slots = ['d1l','d2l','d3l','d4l','d5l','d6l','d7l','d1c','d2c','d3c','d4c','d5c','d6c','d7c'];
      const firstEmpty = slots.find(id => {
        const el = document.getElementById(id);
        return el && !el.value.trim();
      }) || 'd1l';
      const inp = document.getElementById(firstEmpty);
      if (inp) {
        inp.value = rec ? getRecipeText(rec, lang) : mealParam;
        inp.dispatchEvent(new Event('input'));
      }
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

  // ---------- INIT UI ----------
  resetPdfQuotaIfNeeded();
  applyTranslations();
  attachPdfListeners();
  updateButtonState();
  wireInputsToShoppingList();
});
