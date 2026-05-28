// ===== Imports (TOATE sus)
import { recipes as recipesMain } from './recipes.js';
import { recipesMeta, TAG_LABELS, READY_IN } from './recipes-meta.js';
import { i18n, langNames, seoParagraphs, pdfMessages, MOTIV, access } from './i18n.js';
import { buildShoppingFromRawIngredients, parseIngredient } from './shopping-list.js';

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
  // ── PDF export engine: runtime switch + opt-in/opt-out flags ──────────────
  //
  // EMERGENCY KILL-SWITCH / DEFAULT FLIP
  // -----------------------------------
  // Flipping this single constant changes the DEFAULT engine for every user
  // who hasn't explicitly opted in or out. To roll out pdfv2 as the default,
  // change 'legacy' → 'pdfv2' in this line, run `npm run build`, push.
  // To roll back: change it back to 'legacy', build, push.
  //
  //   PDF_EXPORT_DEFAULT_ENGINE = 'legacy' → existing html2pdf path
  //   PDF_EXPORT_DEFAULT_ENGINE = 'pdfv2'  → server-side @react-pdf endpoint
  //
  // User-level overrides (always win over the default):
  //   URL  ?pdfv2=1 → force pdfv2 for this session
  //   URL  ?pdfv2=0 → force legacy for this session
  //   localStorage pdfV2='1' → sticky opt-in across sessions
  //   localStorage pdfV2='0' → sticky opt-out across sessions
  //
  // Stickiness: when the URL sets ?pdfv2=1 or ?pdfv2=0, we promote that
  // value to localStorage so the choice survives navigations that drop
  // the query string (e.g. "Open in app & customize" on static plan
  // pages, which routes to /?autoplan=<id>).
  // To return to the default after an explicit opt-in/out:
  //   localStorage.removeItem('pdfV2')
  const PDF_EXPORT_DEFAULT_ENGINE = 'legacy';  // 'legacy' | 'pdfv2'

  try {
    const _qs = new URLSearchParams(window.location.search || '');
    const _flag = _qs.get('pdfv2');
    if (_flag === '1') localStorage.setItem('pdfV2', '1');
    else if (_flag === '0') localStorage.setItem('pdfV2', '0');
  } catch (_) {}

  function isPdfV2Enabled() {
    try {
      const qs = new URLSearchParams(window.location.search || '');
      const urlFlag = qs.get('pdfv2');
      if (urlFlag === '1') return true;
      if (urlFlag === '0') return false;
      const lsFlag = localStorage.getItem('pdfV2');
      if (lsFlag === '1') return true;
      if (lsFlag === '0') return false;
      return PDF_EXPORT_DEFAULT_ENGINE === 'pdfv2';
    } catch (_) {
      return PDF_EXPORT_DEFAULT_ENGINE === 'pdfv2';
    }
  }

  // Startup log so QA can confirm which engine is wired at page-load time
  // (verifiable from Safari Web Inspector before even clicking Generate PDF).
  try {
    console.log(
      'PDF_EXPORT_ENGINE (on load) = "' + (isPdfV2Enabled() ? 'pdfv2' : 'legacy') + '"' +
      '  (default = "' + PDF_EXPORT_DEFAULT_ENGINE + '")'
    );
  } catch (_) {}
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
  // Phase 1 endpoint is EN-only, so we emit English names + day labels and
  // pass EN ingredient strings to the grouping engine. The user's display
  // locale doesn't change the PDF output.
  function buildPdfV2Payload() {
    const isPremium    = !!window.hasUnlimited;
    const allMeals     = collectMeals();
    const freeDays     = 2;
    const visibleMeals = isPremium ? allMeals : allMeals.slice(0, freeDays);

    function findRecipe(mealText) {
      if (!mealText) return null;
      const title = extractRecipeName(mealText).toLowerCase();
      return (window.recipes || []).find(r =>
        r.name?.[lang]?.toLowerCase() === title ||
        r.name?.en?.toLowerCase()     === title ||
        r.name?.ro?.toLowerCase()     === title
      ) || null;
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
      const displayName = r?.name?.en || r?.name?.ro || extractRecipeName(mealText);
      const rawIngr = r?.ingredients?.en || r?.ingredients?.ro || [];
      return {
        name: displayName,
        time: r?.time || null,
        servings: r?.servings || null,
        cost: r?.costRon ? `~$${Math.round(r.costRon / 4.6)}` : null,
        ingredients: shortIngredients(rawIngr),
      };
    }

    const EN_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const days = visibleMeals.map((m, i) => ({
      day: EN_DAYS[i] || `Day ${i + 1}`,
      lunch: mealPayload(m.lunch),
      dinner: mealPayload(m.dinner),
    })).filter(d => (d.lunch && d.lunch.name) || (d.dinner && d.dinner.name));

    const rawEnIngredients = [];
    visibleMeals.forEach(m => {
      [m.lunch, m.dinner].filter(Boolean).forEach(text => {
        const r = findRecipe(text);
        (r?.ingredients?.en || r?.ingredients?.ro || []).forEach(i => rawEnIngredients.push(i));
      });
    });
    let shoppingGroups = [];
    try { shoppingGroups = buildShoppingFromRawIngredients(rawEnIngredients, 'en'); }
    catch (_) { shoppingGroups = []; }

    const today = new Date();
    return {
      title:     'Weekly meal plan',
      weekLabel: `Week of ${today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      days,
      shoppingGroups,
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
  // ── SINGLE DISPATCHER for all PDF exports. Every Generate PDF button must
  // route through this function. No button is allowed to call html2pdf
  // directly — see attachPdfListeners() below.
  //
  // If isPdfV2Enabled() returns true, ONLY the pdfv2 endpoint is used.
  // We do NOT silently fall back to legacy on pdfv2 failure — that would
  // sneak the full 10-page cookbook-style export back in front of a user
  // who explicitly opted into the compact pdfv2 output. Instead we surface
  // the error so the user knows pdfv2 didn't work and can retry.
  const useV2 = isPdfV2Enabled();
  const _t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  // Loud console log so QA can verify which engine ran (visible in
  // Safari Web Inspector under "Console").
  console.log('PDF_EXPORT_ENGINE = "' + (useV2 ? 'pdfv2' : 'legacy') + '"');
  if (useV2) {
    try {
      const _result = await exportViaPdfV2();
      const _ms = Math.round(((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()) - _t0);
      console.log('PDF_EXPORT_ENGINE = "pdfv2" · completed OK');
      _logTelemetry({
        engine: 'pdfv2',
        status: 'ok',
        durationMs: _ms,
        bytes:        _result && _result.bytes        || null,
        serverRenderMs: _result && _result.serverRenderMs || null,
      });
      return;
    } catch (err) {
      const _ms = Math.round(((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()) - _t0);
      console.error('PDF_EXPORT_ENGINE = "pdfv2" · FAILED — NOT falling back to legacy:', err);
      _logTelemetry({
        engine: 'pdfv2',
        status: 'error',
        durationMs: _ms,
        errorMessage: (err && err.message) ? String(err.message).slice(0, 200) : String(err).slice(0, 200),
      });
      try { alert('PDF generation (pdfv2) failed: ' + (err && err.message ? err.message : err) + '\n\nLegacy export was NOT used. Disable pdfv2 (remove ?pdfv2=1 and run localStorage.removeItem("pdfV2") in the console) to use the legacy exporter.'); } catch (_) {}
      return;
    }
  }
  // ── LEGACY html2pdf path (production default; reached only when
  // ── pdfv2 is NOT opted in). Untouched from before.
  const pdfArea = document.getElementById('pdf-impact-area');
  if (!pdfArea) {
    _logTelemetry({ engine: 'legacy', status: 'error', durationMs: 0, errorMessage: 'no #pdf-impact-area' });
    return;
  }
  let cleanNode = null, styleEl = null;
  let _pageCount = null;
  let _telemetryStatus = 'ok';
  let _telemetryError  = null;
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
    // Count inserted page-break divs for telemetry (each one = a new page).
    _pageCount = 1 + (cleanNode.querySelectorAll('.page-break').length || 0);
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
    _telemetryStatus = 'error';
    _telemetryError  = (err && err.message) ? String(err.message).slice(0, 200) : String(err).slice(0, 200);
  } finally {
    if (styleEl) styleEl.remove();
    if (cleanNode) cleanNode.remove();
    document.body.classList.remove('pdf-exporting');
    const _ms = Math.round(((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()) - _t0);
    _logTelemetry({
      engine: 'legacy',
      status: _telemetryStatus,
      durationMs: _ms,
      pageCount: _pageCount,
      errorMessage: _telemetryError,
    });
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
  // When the current page has used less than this fraction, allow the
  // next block to consume the SAFE buffer (i.e. fit right up against
  // the natural page edge) instead of pushing it to a new page. Fixes
  // the "cover alone on page 1" bug where a barely-too-tall first
  // recipe block got bumped to page 2, leaving the cover with massive
  // whitespace below. recipe-section / pdf-cover already declare
  // page-break-inside:avoid, so no content gets split.
  const PAGE_EMPTY_RATIO = 0.35;
  let page = 1;
  let y = padTop;
  let pageY = padTop;   // height used on the current page only
  // Tolerance for the cover-alone recovery: the "usable" area is 271mm of
  // the 297mm A4 page (26mm reserved for safety margins). When the current
  // page is mostly empty, we let a block overflow the soft usable limit
  // by up to RECOVERY_TOLERANCE px — still well inside the physical page
  // (≈ 98px of additional headroom before clip). No content can ever
  // cross the physical edge.
  const RECOVERY_TOLERANCE = 80;
  blocks.forEach(el => {
    const s  = getComputedStyle(el);
    const mt = parseFloat(s.marginTop)    || 0;
    const mb = parseFloat(s.marginBottom) || 0;
    const rectH = el.getBoundingClientRect().height;
    const outerH = mt + rectH + mb;
    const safeLimit    = (usable * page) - SAFE;
    const naturalLimit = (usable * page);
    if (y + outerH > safeLimit) {
      // Recover the "cover alone on page 1" case: if the current page is
      // mostly empty AND this block would fit within the natural limit
      // plus a small tolerance (well inside the physical page), keep it
      // on the current page. Both the cover and recipe-section already
      // declare page-break-inside:avoid, so no content gets split.
      const fitsWithTolerance = y + outerH <= naturalLimit + RECOVERY_TOLERANCE;
      const pageMostlyEmpty   = pageY < (usable * PAGE_EMPTY_RATIO);
      if (fitsWithTolerance && pageMostlyEmpty) {
        y += outerH;
        pageY += outerH;
        return;
      }
      const br = document.createElement('div');
      br.className = 'page-break';
      el.parentNode.insertBefore(br, el);
      page += 1;
      y = padTop + outerH;
      pageY = padTop + outerH;
    } else {
      y += outerH;
      pageY += outerH;
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
  // Both Generate PDF buttons route through exportShoppingListToPDF — the
  // single dispatcher. Skip the legacy html2pdf CDN preload when pdfv2 is
  // active so a CDN hiccup can never accidentally trigger the legacy path
  // and so pdfv2 has zero dependency on cdnjs.
  const freeBtn = document.getElementById('generate-btn');
  if (freeBtn && !freeBtn.dataset.attached) {
    freeBtn.onclick = async () => {
      if (!isPdfV2Enabled()) await ensureHtml2pdfLoaded();
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
          if (!isPdfV2Enabled()) await ensureHtml2pdfLoaded();
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
      badge: 'Gratuit · Fără înregistrare · 14 limbi',
      line1: 'Mâncă bine,',
      line2: 'în fiecare',
      line3: 'săptămână.',
      sub: 'Plan complet în câteva secunde.\nListă de cumpărături automată. PDF gratuit.',
      stat1n:'175+', stat1l:'Rețete',
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
      stat1n:'175+', stat1l:'Recipes',
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
      stat1n:'175+', stat1l:'Recetas',
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
      stat1n:'175+', stat1l:'Recettes',
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
      stat1n:'175+', stat1l:'Rezepte',
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
      stat1n:'175+', stat1l:'Receitas',
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
      stat1n:'175+', stat1l:'Рецептов',
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
      stat1n:'175+', stat1l:'Ricette',
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
      stat1n:'175+', stat1l:'Tarif',
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
      stat1n:'175+', stat1l:'وصفة',
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
      stat1n:'175+', stat1l:'食谱',
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
      stat1n:'175+', stat1l:'レシピ',
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
      stat1n:'175+', stat1l:'레시피',
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
      stat1n:'175+', stat1l:'व्यंजन',
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
          <a class="hero-stat hero-stat--link" href="#pricing-section" style="text-decoration:none;color:inherit;">
            <span class="hero-stat-num">${safeText(s.stat3n)}</span>
            <span class="hero-stat-label">${safeText(s.stat3l)}</span>
          </a>
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

function renderFAQ() {
  const ID = 'hp-faq';
  document.getElementById(ID)?.remove();

  const copy = {
    ro: {
      eyebrow: 'Întrebări frecvente',
      title: 'Răspunsuri rapide',
      items: [
        { q: 'Planificatorul este cu adevărat gratuit?',
          a: 'Da. Planificarea săptămânală, lista de cumpărături și cele 175+ rețete sunt gratuite, fără înregistrare. PDF-ul gratuit oferă o previzualizare de 2 zile din 7.' },
        { q: 'Ce primesc în plus cu Premium?',
          a: 'PDF complet pentru toate cele 7 zile, meniu buget săptămânal, asistent AI pentru rețete (chat) și asistent AI pentru planificarea meselor. €3/lună, fără angajament.' },
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
          a: 'Yes. The weekly planner, shopping list, and 175+ recipes are free with no signup. The free PDF gives you a 2-of-7-day preview.' },
        { q: 'What do I get with Premium?',
          a: 'Full PDF for all 7 days, a weekly budget menu, an AI recipe assistant (chat) and an AI meal planning assistant. €3/month, no commitment.' },
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
          a: 'Sí. El planificador semanal, la lista de compras y las 175+ recetas son gratuitas sin registro. El PDF gratuito ofrece una vista previa de 2 de 7 días.' },
        { q: '¿Qué incluye Premium?',
          a: 'PDF completo de los 7 días, menú económico semanal, asistente IA de recetas (chat) y asistente IA de planificación de comidas. €3/mes, sin compromiso.' },
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
          a: 'Oui. Le planificateur hebdomadaire, la liste de courses et les 175+ recettes sont gratuits sans inscription. Le PDF gratuit offre un aperçu de 2 jours sur 7.' },
        { q: 'Que comprend Premium ?',
          a: 'PDF complet 7 jours, menu budget hebdomadaire, assistant IA recettes (chat) et assistant IA de planification. €3/mois, sans engagement.' },
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
          a: 'Ja. Wochenplaner, Einkaufsliste und 175+ Rezepte sind ohne Anmeldung kostenlos. Das kostenlose PDF zeigt eine Vorschau von 2 von 7 Tagen.' },
        { q: 'Was bekomme ich mit Premium?',
          a: 'Vollständiges PDF für alle 7 Tage, wöchentliches Budget-Menü, KI-Rezept-Assistent (Chat) und KI-Mahlzeiten-Assistent. €3/Monat, ohne Bindung.' },
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
          a: 'Sim. O planificador semanal, lista de compras e 175+ receitas são gratuitos sem cadastro. O PDF gratuito oferece uma pré-visualização de 2 de 7 dias.' },
        { q: 'O que recebo com Premium?',
          a: 'PDF completo dos 7 dias, menu económico semanal, assistente IA de receitas (chat) e assistente IA de planeamento de refeições. €3/mês, sem compromisso.' },
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
          a: 'Да. Недельный план, список покупок и 175+ рецептов бесплатны без регистрации. Бесплатный PDF показывает превью 2 из 7 дней.' },
        { q: 'Что входит в Премиум?',
          a: 'Полный PDF на все 7 дней, недельное бюджетное меню, ИИ-помощник по рецептам (чат) и ИИ-помощник по планированию. €3/мес, без обязательств.' },
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
          a: 'Sì. Pianificatore settimanale, lista della spesa e 175+ ricette sono gratis senza registrazione. Il PDF gratuito offre un\'anteprima di 2 giorni su 7.' },
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
          a: 'Evet. Haftalık planlayıcı, alışveriş listesi ve 175+ tarif kayıt olmadan ücretsizdir. Ücretsiz PDF, 7 günden 2 günlük bir önizleme sunar.' },
        { q: 'Premium ile ne kazanırım?',
          a: 'Tüm 7 günler için tam PDF, haftalık bütçe menüsü, AI tarif asistanı (sohbet) ve AI yemek planlama asistanı. €3/ay, taahhüt yok.' },
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
          a: 'نعم. المخطط الأسبوعي وقائمة التسوق و175+ وصفة مجانية بدون تسجيل. ملف PDF المجاني يعرض معاينة 2 من 7 أيام.' },
        { q: 'ماذا أحصل مع بريميوم؟',
          a: 'PDF كامل لجميع 7 أيام، قائمة ميزانية أسبوعية، مساعد وصفات بالذكاء الاصطناعي (دردشة) ومساعد تخطيط وجبات بالذكاء الاصطناعي. €3/شهر، بدون التزام.' },
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
          a: '是的。每周规划器、购物清单和175+食谱免费且无需注册。免费PDF提供7天中2天的预览。' },
        { q: '高级版包含什么？',
          a: '7天完整PDF、每周节俭菜单、AI食谱助手（聊天）和AI膳食规划助手。€3/月，无承诺。' },
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
          a: 'はい。週間プランナー、買い物リスト、175以上のレシピは登録不要で無料です。無料PDFは7日中2日のプレビューを提供します。' },
        { q: 'プレミアムには何が含まれますか？',
          a: '7日間フルPDF、週間節約メニュー、AIレシピアシスタント（チャット）、AIミールプランアシスタント。€3/月、契約縛りなし。' },
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
          a: '네. 주간 플래너, 장보기 목록, 175개 이상의 레시피는 가입 없이 무료입니다. 무료 PDF는 7일 중 2일 미리보기를 제공합니다.' },
        { q: '프리미엄에는 무엇이 포함되나요?',
          a: '7일 전체 PDF, 주간 예산 메뉴, AI 레시피 도우미(채팅), AI 식단 계획 도우미. €3/월, 약정 없음.' },
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
          a: 'हाँ। साप्ताहिक प्लानर, खरीदारी सूची और 175+ रेसिपी पंजीकरण के बिना मुफ्त हैं। मुफ्त PDF 7 में से 2 दिनों का पूर्वावलोकन प्रदान करता है।' },
        { q: 'प्रीमियम में क्या मिलता है?',
          a: 'सभी 7 दिनों के लिए पूर्ण PDF, साप्ताहिक बजट मेनू, AI रेसिपी सहायक (चैट) और AI भोजन योजना सहायक। €3/माह, कोई प्रतिबद्धता नहीं।' },
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
      <summary class="hp-faq-summary">${safeText(item.q)}</summary>
      <div class="hp-faq-body">${safeText(item.a)}</div>
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

  const cuisines = [
    { slug:'france', flag:'🇫🇷', count:10, atmosphere:'mediterranean' },
    { slug:'japan',  flag:'🇯🇵', count:10, atmosphere:'east-asian' },
    { slug:'mexico', flag:'🇲🇽', count:10, atmosphere:'latin' },
    { slug:'greece', flag:'🇬🇷', count:10, atmosphere:'mediterranean' },
    { slug:'italy',  flag:'🇮🇹', count:9,  atmosphere:'mediterranean' },
    { slug:'india',  flag:'🇮🇳', count:9,  atmosphere:'south-asian' },
  ];

  const copy = {
    ro: { eyebrow:'Bucătării', heading:'Explorează bucătării din toată lumea',
      sub:'46 bucătării internaționale, fiecare cu rețete autentice și planificator gratuit.',
      cta:'Vezi toate cele 46 bucătării',
      names:{ france:'Franța', japan:'Japonia', mexico:'Mexic', greece:'Grecia', italy:'Italia', india:'India' },
      dishes:{ france:'Quiche Lorraine · Ratatouille · Supă de ceapă franțuzească',
        japan:'Sushi · Ramen clasic japonez · Curry japonez',
        mexico:'Tacos · Guacamole · Chili con carne',
        greece:'Souvlaki · Tzatziki · Moussaka',
        italy:'Spaghete Carbonara · Risotto · Pasta e fagioli',
        india:'Curry de pui · Dhal · Rajma' } },
    en: { eyebrow:'Cuisines', heading:'Explore cuisines from around the world',
      sub:'46 international cuisines, each with authentic recipes and a free planner.',
      cta:'See all 46 cuisines',
      names:{ france:'France', japan:'Japan', mexico:'Mexico', greece:'Greece', italy:'Italy', india:'India' },
      dishes:{ france:'Quiche Lorraine · Ratatouille · French onion soup',
        japan:'Sushi · Classic Japanese ramen · Japanese curry',
        mexico:'Tacos · Guacamole · Chili con carne',
        greece:'Souvlaki · Tzatziki · Moussaka',
        italy:'Spaghetti Carbonara · Risotto · Pasta e fagioli',
        india:'Chicken curry · Dhal · Rajma' } },
    es: { eyebrow:'Cocinas', heading:'Explora cocinas del mundo',
      sub:'46 cocinas internacionales, cada una con recetas auténticas y planificador gratuito.',
      cta:'Ver las 46 cocinas',
      names:{ france:'Francia', japan:'Japón', mexico:'México', greece:'Grecia', italy:'Italia', india:'India' },
      dishes:{ france:'Quiche Lorraine · Ratatouille · Sopa de cebolla francesa',
        japan:'Sushi · Ramen japonés clásico · Curry japonés',
        mexico:'Tacos · Guacamole · Chili con carne',
        greece:'Souvlaki · Tzatziki · Musaca',
        italy:'Espagueti a la carbonara · Risotto · Pasta e fagioli',
        india:'Pollo al curry · Dhal · Rajma' } },
    fr: { eyebrow:'Cuisines', heading:'Explorez les cuisines du monde',
      sub:'46 cuisines internationales, chacune avec des recettes authentiques et un planificateur gratuit.',
      cta:'Voir les 46 cuisines',
      names:{ france:'France', japan:'Japon', mexico:'Mexique', greece:'Grèce', italy:'Italie', india:'Inde' },
      dishes:{ france:'Quiche lorraine · Ratatouille · Soupe à l\'oignon',
        japan:'Sushi · Ramen japonais classique · Curry japonais',
        mexico:'Tacos · Guacamole · Chili con carne',
        greece:'Souvlaki · Tzatzíki · Moussaka',
        italy:'Spaghetti carbonara · Risotto · Pasta e fagioli',
        india:'Poulet au curry · Dhal · Rajma' } },
    de: { eyebrow:'Küchen', heading:'Entdecke Küchen aus aller Welt',
      sub:'46 internationale Küchen, jede mit authentischen Rezepten und kostenlosem Planer.',
      cta:'Alle 46 Küchen ansehen',
      names:{ france:'Frankreich', japan:'Japan', mexico:'Mexiko', greece:'Griechenland', italy:'Italien', india:'Indien' },
      dishes:{ france:'Quiche Lorraine · Ratatouille · Französische Zwiebelsuppe',
        japan:'Sushi · Klassisches japanisches Ramen · Japanisches Curry',
        mexico:'Tacos · Guacamole · Chili con carne',
        greece:'Souvlaki · Tzatziki · Moussaka',
        italy:'Spaghetti Carbonara · Risotto · Pasta e fagioli',
        india:'Hühnchen-Curry · Dhal · Rajma' } },
    pt: { eyebrow:'Cozinhas', heading:'Explore cozinhas de todo o mundo',
      sub:'46 cozinhas internacionais, cada uma com receitas autênticas e planificador gratuito.',
      cta:'Ver todas as 46 cozinhas',
      names:{ france:'França', japan:'Japão', mexico:'México', greece:'Grécia', italy:'Itália', india:'Índia' },
      dishes:{ france:'Quiche Lorraine · Ratatouille · Sopa de cebola francesa',
        japan:'Sushi · Ramen japonês clássico · Curry japonês',
        mexico:'Tacos · Guacamole · Chili con carne',
        greece:'Souvlaki · Tzatziki · Moussaka',
        italy:'Espaguete à carbonara · Risoto · Pasta e fagioli',
        india:'Frango ao curry · Dhal · Rajma' } },
    ru: { eyebrow:'Кухни', heading:'Откройте кухни со всего мира',
      sub:'46 международных кухонь, каждая с аутентичными рецептами и бесплатным планировщиком.',
      cta:'Посмотреть все 46 кухонь',
      names:{ france:'Франция', japan:'Япония', mexico:'Мексика', greece:'Греция', italy:'Италия', india:'Индия' },
      dishes:{ france:'Киш Лорен · Рататуй · Французский луковый суп',
        japan:'Суши · Классический японский рамен · Японское карри',
        mexico:'Такос · Гуакамоле · Чили кон карне',
        greece:'Сувлаки · Цацики · Мусака',
        italy:'Спагетти карбонара · Ризотто · Паста э фаджоли',
        india:'Куриное карри · Даль · Раджма' } },
    it: { eyebrow:'Cucine', heading:'Esplora cucine da tutto il mondo',
      sub:'46 cucine internazionali, ognuna con ricette autentiche e pianificatore gratuito.',
      cta:'Vedi tutte le 46 cucine',
      names:{ france:'Francia', japan:'Giappone', mexico:'Messico', greece:'Grecia', italy:'Italia', india:'India' },
      dishes:{ france:'Quiche Lorraine · Ratatouille · Zuppa di cipolle francese',
        japan:'Sushi · Ramen giapponese classico · Curry giapponese',
        mexico:'Tacos · Guacamole · Chili con carne',
        greece:'Souvlaki · Tzatziki · Moussaka',
        italy:'Spaghetti alla carbonara · Risotto · Pasta e fagioli',
        india:'Pollo al curry · Dhal · Rajma' } },
    tr: { eyebrow:'Mutfaklar', heading:'Dünyanın dört bir yanından mutfakları keşfedin',
      sub:'46 uluslararası mutfak, her biri özgün tarifler ve ücretsiz planlayıcı ile.',
      cta:'46 mutfağın tamamına bak',
      names:{ france:'Fransa', japan:'Japonya', mexico:'Meksika', greece:'Yunanistan', italy:'İtalya', india:'Hindistan' },
      dishes:{ france:'Quiche Lorraine · Ratatouille · Fransız soğan çorbası',
        japan:'Suşi · Klasik Japon ramen · Japon köri',
        mexico:'Tacos · Guacamole · Chili con carne',
        greece:'Souvlaki · Cacık · Musakka',
        italy:'Spagetti Carbonara · Risotto · Pasta e fagioli',
        india:'Tavuk köri · Dhal · Rajma' } },
    ar: { eyebrow:'المطابخ', heading:'استكشف المطابخ من جميع أنحاء العالم',
      sub:'46 مطبخًا دوليًا، كل منها بوصفات أصيلة ومخطط مجاني.',
      cta:'شاهد كل 46 مطبخًا',
      names:{ france:'فرنسا', japan:'اليابان', mexico:'المكسيك', greece:'اليونان', italy:'إيطاليا', india:'الهند' },
      dishes:{ france:'كيش لورين · راتاتوي · حساء البصل الفرنسي',
        japan:'سوشي · رامن ياباني كلاسيكي · كاري ياباني',
        mexico:'تاكو · جواكامولي · تشيلي كون كارني',
        greece:'سوفلاكي · تزاتزيكي · موساكا',
        italy:'سباغيتي كاربونارا · ريزوتو · باستا إي فاجولي',
        india:'دجاج بالكاري · دال · راجما' } },
    zh: { eyebrow:'美食', heading:'探索世界各地的美食',
      sub:'46种国际美食，每一种都有正宗食谱和免费规划器。',
      cta:'查看全部46种美食',
      names:{ france:'法国', japan:'日本', mexico:'墨西哥', greece:'希腊', italy:'意大利', india:'印度' },
      dishes:{ france:'洛林乳蛋饼 · 普罗旺斯炖菜 · 法式洋葱汤',
        japan:'寿司 · 经典日式拉面 · 日式咖喱',
        mexico:'塔可 · 鳄梨酱 · 辣肉酱',
        greece:'烤肉串 · 酸奶酱 · 慕沙卡',
        italy:'培根蛋面 · 烩饭 · 意式豆面汤',
        india:'鸡肉咖喱 · 扁豆糊 · 红豆咖喱' } },
    ja: { eyebrow:'料理', heading:'世界の料理を探索',
      sub:'46の国際料理、それぞれに本格的なレシピと無料プランナー。',
      cta:'46の料理すべてを見る',
      names:{ france:'フランス', japan:'日本', mexico:'メキシコ', greece:'ギリシャ', italy:'イタリア', india:'インド' },
      dishes:{ france:'キッシュ・ロレーヌ · ラタトゥイユ · オニオングラタンスープ',
        japan:'寿司 · クラシックなラーメン · 日本のカレー',
        mexico:'タコス · ワカモレ · チリコンカルネ',
        greece:'スブラキ · ザジキ · ムサカ',
        italy:'スパゲッティ・カルボナーラ · リゾット · パスタ・エ・ファジョーリ',
        india:'チキンカレー · ダール · ラジマ' } },
    ko: { eyebrow:'요리', heading:'세계 각국의 요리 탐험',
      sub:'46가지 국제 요리, 각각 정통 레시피와 무료 플래너 포함.',
      cta:'46가지 요리 모두 보기',
      names:{ france:'프랑스', japan:'일본', mexico:'멕시코', greece:'그리스', italy:'이탈리아', india:'인도' },
      dishes:{ france:'키슈 로렌 · 라타투이 · 프렌치 어니언 수프',
        japan:'스시 · 클래식 일본 라멘 · 일본 카레',
        mexico:'타코 · 과카몰리 · 칠리 콘 카르네',
        greece:'수블라키 · 차치키 · 무사카',
        italy:'스파게티 카르보나라 · 리소토 · 파스타 에 파지올리',
        india:'치킨 카레 · 달 · 라즈마' } },
    hi: { eyebrow:'व्यंजन', heading:'दुनिया भर के व्यंजन देखें',
      sub:'46 अंतर्राष्ट्रीय व्यंजन, हर एक में प्रामाणिक रेसिपी और मुफ्त प्लानर।',
      cta:'सभी 46 व्यंजन देखें',
      names:{ france:'फ्रांस', japan:'जापान', mexico:'मेक्सिको', greece:'यूनान', italy:'इटली', india:'भारत' },
      dishes:{ france:'किश लोरेन · रतातुई · फ्रेंच प्याज सूप',
        japan:'सुशी · क्लासिक जापानी रामेन · जापानी करी',
        mexico:'टैकोस · ग्वाकामोल · चिली कोन कार्ने',
        greece:'सूवलाकी · ज़ात्ज़ीकी · मुसाका',
        italy:'स्पेगेटी कार्बोनारा · रिसोट्टो · पास्ता ए फजोली',
        india:'चिकन करी · दाल · राजमा' } },
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
  renderTrustSignals();
  renderFAQ();
  setupScrollFadeIn();
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
      if (manageBtn) manageBtn.style.display = 'inline-block';
      if (typeof updateButtonState === 'function') updateButtonState();
    })
    .catch(() => { /* network blip — user can re-verify manually */ });
})();
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
      if (typeof updateButtonState === 'function') updateButtonState();
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
