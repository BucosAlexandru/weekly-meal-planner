// ===== Imports (TOATE sus)
import { recipes as recipesMain } from './recipes.js';
import { recipesMeta, TAG_LABELS, READY_IN } from './recipes-meta.js';
import { i18n, langNames, seoParagraphs, pdfMessages, MOTIV, access } from './i18n.js';

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
function updateContentNav(currentLang) {
  const navPlans   = document.getElementById('nav-plans');
  const navRecipes = document.getElementById('nav-recipes');
  if (!navPlans || !navRecipes) return;
  const cfg = NAV_CONTENT_LINKS[currentLang] || NAV_CONTENT_LINKS.ro;
  navPlans.href        = cfg.plans.href;
  navPlans.textContent = cfg.plans.label;
  navRecipes.href        = cfg.recipes.href;
  navRecipes.textContent = cfg.recipes.label;
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
    const steps = raw.split('.').map(x => x.trim()).filter(Boolean);
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

  // ── collect all ingredients for shopping list ─────────────────
  const allIngrSet = new Set();
  visibleMeals.forEach(m => {
    [m.lunch, m.dinner].filter(Boolean).forEach(meal => {
      const r = getRecipe(meal);
      (r?.ingredients?.[lang] || r?.ingredients?.en || []).forEach(i => allIngrSet.add(i));
    });
  });
  const ingrArr = [...allIngrSet];
  const half = Math.ceil(ingrArr.length / 2);
  const col1 = ingrArr.slice(0, half);
  const col2 = ingrArr.slice(half);

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

  // ── shopping list ─────────────────────────────────────────────
  const shoppingHTML = ingrArr.length ? `
    <div class="pdf-shopping">
      <div class="pdf-shopping-header">🛒 ${t('shoppingList') || 'Shopping List'}</div>
      <div class="pdf-shopping-body">
        <div class="shopping-grid">
          <div>${col1.map(i => `<div class="shop-item">${i}</div>`).join('')}</div>
          <div>${col2.map(i => `<div class="shop-item">${i}</div>`).join('')}</div>
        </div>
      </div>
    </div>` : '';

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

    if (allIngr.size === 0) {
      listEl.innerHTML = '';
      listEl.setAttribute('data-empty', 'true');
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
  if (document.getElementById(ID)) return;

  const ro  = lang === 'ro';
  const wds = (i18n[lang] && i18n[lang].weekdays) || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  const meals = ro ? [
    [wds[0], '🍝 Spaghete carbonara',  '🥗 Salată grecească'],
    [wds[1], '🍲 Ciorbă de legume',    '🍗 Pui la cuptor'],
    [wds[2], '🥘 Risotto cu ciuperci', '🐟 Somon cu lămâie'],
  ] : [
    [wds[0], '🍝 Spaghetti carbonara', '🥗 Greek salad'],
    [wds[1], '🍲 Vegetable soup',       '🍗 Roasted chicken'],
    [wds[2], '🥘 Mushroom risotto',     '🐟 Lemon salmon'],
  ];

  const chips = ro
    ? ['paste','ouă','parmezan','roșii','feta','ciuperci','orez','lămâie','pui']
    : ['pasta','eggs','parmesan','tomatoes','feta','mushrooms','rice','lemon','chicken'];

  const colDay   = ro ? 'Ziua'  : 'Day';
  const colLunch = ro ? 'Prânz' : 'Lunch';
  const colDin   = ro ? 'Cină'  : 'Dinner';
  const shTitle  = ro ? '🛒 Listă de cumpărături' : '🛒 Shopping list';
  const eyebrow  = ro ? '✨ Cum arată planul tău' : '✨ What your plan looks like';
  const heading  = ro ? 'Planul tău săptămânal,\nfrumos și organizat' : 'Your weekly plan,\nbeautiful and organized';
  const desc     = ro
    ? 'Adaugă mesele manual sau generează automat o săptămână întreagă cu un click. Lista de cumpărături apare instant, gata de descărcat ca PDF.'
    : 'Add meals manually or auto-generate a full week in one click. Shopping list appears instantly, ready to download as PDF.';
  const checks = ro ? [
    'Plan de 7 zile cu prânz + cină',
    'Listă de cumpărături sortată automat',
    'PDF descărcabil gratuit (1/zi)',
    'Funcționează offline în browser',
  ] : [
    '7-day plan with lunch & dinner',
    'Shopping list sorted automatically',
    'Free PDF download (1/day)',
    'Works offline in the browser',
  ];
  const ctaScroll = ro ? '🥗 Planifică acum — gratuit' : '🥗 Plan now — free';
  const ctaMenus  = ro ? '📅 Meniuri săptămânale' : '📅 Weekly menus';
  const menusUrl  = (i18n[lang] && i18n[lang].menusUrl) || `/${lang}/meniu-saptamanal/`;

  const html = `
    <section id="${ID}" class="product-preview-section no-print">
      <div class="product-preview-inner">
        <div class="preview-text-col">
          <div class="preview-eyebrow">${eyebrow}</div>
          <h2>${heading.replace('\n','<br>')}</h2>
          <ul class="preview-checklist">
            ${checks.map(c => `<li>${c}</li>`).join('')}
          </ul>
          <div class="preview-cta-group">
            <button class="btn-preview-primary" id="preview-cta-scroll">${ctaScroll}</button>
            <a href="${menusUrl}" class="btn-preview-outline">${ctaMenus}</a>
          </div>
        </div>
        <div class="preview-mockup-col">
          <div class="product-mockup">
            <div class="mockup-bar">
              <span class="mockup-bar-title">📅 ${colDay}</span>
              <span class="mockup-pdf-chip">📄 PDF</span>
            </div>
            <div class="mockup-table">
              <div class="mockup-header-row">
                <span>${colDay}</span><span>${colLunch}</span><span>${colDin}</span>
              </div>
              ${meals.map(([d,l,c]) => `
                <div class="mockup-row">
                  <span class="mockup-day">${d}</span>
                  <span class="mockup-meal">${l}</span>
                  <span class="mockup-meal">${c}</span>
                </div>`).join('')}
            </div>
            <div class="mockup-shopping">
              <div class="mockup-shopping-header">${shTitle}</div>
              <div class="mockup-chips">
                ${chips.map(c => `<span class="mockup-chip">${c}</span>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>`;

  document.getElementById('landing-features-section')?.insertAdjacentHTML('afterend', html);

  document.getElementById('preview-cta-scroll')?.addEventListener('click', () => {
    document.getElementById('planner-anchor-section')?.scrollIntoView({ behavior:'smooth', block:'start' });
  });
}

function renderDiscovery() {
  const ID = 'discovery-section';
  if (document.getElementById(ID)) return;

  const ro = lang === 'ro';
  const menusUrl   = `/${lang}/${ro ? 'meniu-saptamanal' : 'weekly-menu'}/`;
  const recipesUrl = `/${lang}/${ro ? 'retete' : 'recipes'}/`;

  // Correct URL per language
  const lc = lang;
  const baseUrls = {
    ro: { menus:'meniu-saptamanal', recipes:'retete' },
    en: { menus:'weekly-menu',      recipes:'recipes' },
    es: { menus:'menu-semanal',     recipes:'recetas' },
    fr: { menus:'menu-hebdomadaire',recipes:'recettes' },
    de: { menus:'wochenplan',       recipes:'rezepte' },
    pt: { menus:'plano-semanal',    recipes:'receitas' },
    ru: { menus:'nedelnoe-menyu',   recipes:'retsepty' },
    ar: { menus:'weekly-menu',      recipes:'wasafat' },
    zh: { menus:'weekly-menu',      recipes:'shpu' },
    ja: { menus:'weekly-menu',      recipes:'reshipi' },
    ko: { menus:'weekly-menu',      recipes:'yori-beoب' },
    hi: { menus:'weekly-menu',      recipes:'recipes' },
    tr: { menus:'haftalik-menu',    recipes:'tarifler' },
    it: { menus:'piano-settimanale',recipes:'ricette' },
  };
  const urls = baseUrls[lc] || baseUrls.en;
  const mUrl = `/${lc}/${urls.menus}/`;
  const rUrl = `/${lc}/${urls.recipes}/`;

  const s = ro ? {
    title: 'Explorează și inspiră-te',
    sub:   '8 meniuri complete săptămânale și 175+ rețete internaționale',
    m_icon: '📅', m_title: 'Meniuri Săptămânale',
    m_desc: '8 planuri complete — Mediteranean, Asian, Vegetarian, Buget și altele — cu liste de cumpărături incluse.',
    m_cta:  'Explorează meniurile →',
    r_icon: '🍽️', r_title: '175+ Rețete Internaționale',
    r_desc: 'Rețete autentice din 70+ țări cu ingrediente, mod de preparare, valori nutriționale și sfaturi.',
    r_cta:  'Descoperă rețetele →',
  } : {
    title: 'Explore and get inspired',
    sub:   '8 complete weekly menus and 175+ international recipes',
    m_icon: '📅', m_title: 'Weekly Menus',
    m_desc: '8 complete plans — Mediterranean, Asian, Vegetarian, Budget and more — with shopping lists included.',
    m_cta:  'Explore menus →',
    r_icon: '🍽️', r_title: '175+ International Recipes',
    r_desc: 'Authentic recipes from 70+ countries with ingredients, instructions, nutrition info and tips.',
    r_cta:  'Discover recipes →',
  };

  const html = `
    <section id="${ID}" class="discovery-section no-print">
      <div class="discovery-inner">
        <h2 class="discovery-title">${s.title}</h2>
        <p class="discovery-sub">${s.sub}</p>
        <div class="discovery-cards">
          <a href="${mUrl}" class="discovery-card">
            <div class="discovery-card-icon">${s.m_icon}</div>
            <div class="discovery-card-title">${s.m_title}</div>
            <div class="discovery-card-desc">${s.m_desc}</div>
            <div class="discovery-card-cta">${s.m_cta}</div>
          </a>
          <a href="${rUrl}" class="discovery-card">
            <div class="discovery-card-icon">${s.r_icon}</div>
            <div class="discovery-card-title">${s.r_title}</div>
            <div class="discovery-card-desc">${s.r_desc}</div>
            <div class="discovery-card-cta">${s.r_cta}</div>
          </a>
        </div>
      </div>
    </section>`;

  document.getElementById('product-preview-section')?.insertAdjacentHTML('afterend', html);
}

function renderPlannerAnchor() {
  const ID = 'planner-anchor-section';
  if (document.getElementById(ID)) return;

  const ro = lang === 'ro';
  const title = ro ? 'Planifică acum — gratuit' : 'Start planning — free';
  const sub   = ro
    ? 'Completează mesele sau generează automat o săptămână întreagă'
    : 'Fill in your meals or auto-generate a full week';

  const html = `
    <section id="${ID}" class="planner-anchor-section no-print">
      <div class="planner-anchor-title">${title}</div>
      <div class="planner-anchor-sub">${sub}</div>
    </section>`;

  const main = document.querySelector('.app-main');
  if (main) main.insertAdjacentHTML('beforebegin', html);
}

function injectHeroSecondaryCta() {
  if (document.getElementById('hero-secondary-cta')) return;
  const ro = lang === 'ro';
  const menusBase = {
    ro:'meniu-saptamanal', en:'weekly-menu', es:'menu-semanal', fr:'menu-hebdomadaire',
    de:'wochenplan', pt:'plano-semanal', ru:'nedelnoe-menyu', it:'piano-settimanale',
    tr:'haftalik-menu', ar:'weekly-menu', zh:'weekly-menu', ja:'weekly-menu',
    ko:'weekly-menu', hi:'weekly-menu',
  };
  const seg  = menusBase[lang] || 'weekly-menu';
  const text = ro ? '📅 Meniuri Săptămânale' : '📅 Weekly Menus';
  const btn  = document.getElementById('hero-cta-btn');
  if (!btn) return;

  // Wrap in a flex row if not already wrapped
  const row = document.createElement('div');
  row.className = 'hero-cta-row';
  btn.parentNode.insertBefore(row, btn);
  row.appendChild(btn);

  const a = document.createElement('a');
  a.id   = 'hero-secondary-cta';
  a.href = `/${lang}/${seg}/`;
  a.className   = 'hero-secondary-cta no-print';
  a.textContent = text;
  row.appendChild(a);
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
  // 1) Texte statice cu data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[lang][key]) el.innerHTML = i18n[lang][key];
  });
  // 2) Placeholderele
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (i18n[lang][key]) el.placeholder = i18n[lang][key];
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
  if (typeof buyBtn !== 'undefined' && buyBtn) {
    buyBtn.innerHTML = '<i class="bi bi-cart-check-fill"></i> ' + (i18n[lang]["btn.pay"] || "Plătește & Descarcă");
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
  renderHowItWorks();
  renderLandingFeatures();
  renderProductPreview();
  renderDiscovery();
  renderPlannerAnchor();
  injectHeroSecondaryCta();
  // 6) Paragraful SEO per limbă
  const seoContainer = document.getElementById('seo-paragraph');
  if (seoContainer && seoParagraphs[lang]) {
    seoContainer.innerHTML = seoParagraphs[lang];
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
                       '✅ 175 rețete din 70+ țări','✅ 1 PDF complet / zi',
                       '✗ PDF cu toate 7 zilele','✗ Meniu buget ieftin'],
            premFeats:['✅ Tot ce e gratuit, plus:','✅ PDF cu toate cele 7 zile',
                       '✅ Meniu buget săptămânal','✅ Acces nelimitat oricând'] },
      en: { title:'Free vs Premium', freeName:'Free', premName:'⭐ Premium',
            price:'€3/month', sub:'', popular:'MOST POPULAR',
            cta:'Get Premium →', already:'Already subscribed? Activate below ↓',
            freeFeats:['✅ 7-day meal plan','✅ Auto shopping list',
                       '✅ 175 recipes from 70+ countries','✅ 1 full PDF / day',
                       '✗ Full 7-day PDF','✗ Budget menu'],
            premFeats:['✅ Everything in Free, plus:','✅ Full PDF with all 7 days',
                       '✅ Weekly budget menu','✅ Unlimited access anytime'] },
      es: { title:'Gratis vs Premium', freeName:'Gratis', premName:'⭐ Premium',
            price:'€3/mes', sub:'', popular:'MÁS POPULAR',
            cta:'Obtener Premium →', already:'¿Ya suscrito? Activa abajo ↓',
            freeFeats:['✅ Plan de comidas 7 días','✅ Lista de compras automática',
                       '✅ 175 recetas de 70+ países','✅ 1 PDF completo / día',
                       '✗ PDF con los 7 días','✗ Menú económico'],
            premFeats:['✅ Todo lo gratis, más:','✅ PDF completo con 7 días',
                       '✅ Menú económico semanal','✅ Acceso ilimitado siempre'] },
      fr: { title:'Gratuit vs Premium', freeName:'Gratuit', premName:'⭐ Premium',
            price:'€3/mois', sub:'', popular:'LE PLUS POPULAIRE',
            cta:'Obtenir Premium →', already:'Déjà abonné ? Activez ci-dessous ↓',
            freeFeats:['✅ Plan de repas 7 jours','✅ Liste de courses automatique',
                       '✅ 175 recettes de 70+ pays','✅ 1 PDF complet / jour',
                       '✗ PDF avec les 7 jours','✗ Menu budget'],
            premFeats:['✅ Tout le gratuit, plus :','✅ PDF complet sur 7 jours',
                       '✅ Menu budget hebdomadaire','✅ Accès illimité à tout moment'] },
      de: { title:'Kostenlos vs Premium', freeName:'Kostenlos', premName:'⭐ Premium',
            price:'€3/Monat', sub:'', popular:'AM BELIEBTESTEN',
            cta:'Premium holen →', already:'Bereits abonniert? Unten aktivieren ↓',
            freeFeats:['✅ 7-Tage-Mahlzeitenplan','✅ Automatische Einkaufsliste',
                       '✅ 175 Rezepte aus 70+ Ländern','✅ 1 PDF / Tag',
                       '✗ PDF mit allen 7 Tagen','✗ Budget-Menü'],
            premFeats:['✅ Alles Kostenlose, plus:','✅ PDF mit allen 7 Tagen',
                       '✅ Wöchentliches Budget-Menü','✅ Unbegrenzter Zugang'] },
      pt: { title:'Gratuito vs Premium', freeName:'Gratuito', premName:'⭐ Premium',
            price:'€3/mês', sub:'', popular:'MAIS POPULAR',
            cta:'Obter Premium →', already:'Já assinante? Ative abaixo ↓',
            freeFeats:['✅ Plano de refeições 7 dias','✅ Lista de compras automática',
                       '✅ 175 receitas de 70+ países','✅ 1 PDF completo / dia',
                       '✗ PDF com todos os 7 dias','✗ Menu económico'],
            premFeats:['✅ Tudo gratuito, mais:','✅ PDF completo com 7 dias',
                       '✅ Menu económico semanal','✅ Acesso ilimitado'] },
      ru: { title:'Бесплатно vs Премиум', freeName:'Бесплатно', premName:'⭐ Премиум',
            price:'€3/мес', sub:'', popular:'САМЫЙ ПОПУЛЯРНЫЙ',
            cta:'Получить Премиум →', already:'Уже подписаны? Активируйте ниже ↓',
            freeFeats:['✅ План питания на 7 дней','✅ Автоматический список покупок',
                       '✅ 175 рецептов из 70+ стран','✅ 1 PDF / день',
                       '✗ PDF на все 7 дней','✗ Бюджетное меню'],
            premFeats:['✅ Всё из бесплатного, плюс:','✅ Полный PDF на 7 дней',
                       '✅ Недельное бюджетное меню','✅ Безлимитный доступ'] },
      ar: { title:'مجاني vs بريميوم', freeName:'مجاني', premName:'⭐ بريميوم',
            price:'€3/شهر', sub:'', popular:'الأكثر شعبية',
            cta:'احصل على بريميوم →', already:'مشترك بالفعل؟ فعّل أدناه ↓',
            freeFeats:['✅ خطة وجبات 7 أيام','✅ قائمة تسوق تلقائية',
                       '✅ 175 وصفة من 70+ دولة','✅ PDF واحد / يوم',
                       '✗ PDF كامل 7 أيام','✗ قائمة الميزانية'],
            premFeats:['✅ كل المجاني، بالإضافة:','✅ PDF كامل بجميع 7 أيام',
                       '✅ قائمة ميزانية أسبوعية','✅ وصول غير محدود'] },
      zh: { title:'免费 vs 高级版', freeName:'免费', premName:'⭐ 高级版',
            price:'€3/月', sub:'', popular:'最受欢迎',
            cta:'获取高级版 →', already:'已订阅？在下方激活 ↓',
            freeFeats:['✅ 7天餐饮计划','✅ 自动购物清单',
                       '✅ 70+国175道菜谱','✅ 每天1份PDF',
                       '✗ 完整7天PDF','✗ 节俭菜单'],
            premFeats:['✅ 所有免费功能，加上：','✅ 完整7天PDF',
                       '✅ 每周节俭菜单','✅ 随时无限访问'] },
      ja: { title:'無料 vs プレミアム', freeName:'無料', premName:'⭐ プレミアム',
            price:'€3/月', sub:'', popular:'最人気',
            cta:'プレミアムを取得 →', already:'すでに購読済み？下でアクティブ化 ↓',
            freeFeats:['✅ 7日間の食事プラン','✅ 自動買い物リスト',
                       '✅ 70カ国以上175レシピ','✅ 1日1PDF',
                       '✗ 7日分フルPDF','✗ 節約メニュー'],
            premFeats:['✅ 無料のすべて、プラス：','✅ 7日分フルPDF',
                       '✅ 週間節約メニュー','✅ 無制限アクセス'] },
      tr: { title:'Ücretsiz vs Premium', freeName:'Ücretsiz', premName:'⭐ Premium',
            price:'€3/ay', sub:'', popular:'EN POPÜLER',
            cta:'Premium Al →', already:'Zaten abone misiniz? Aşağıdan aktive edin ↓',
            freeFeats:['✅ 7 günlük yemek planı','✅ Otomatik alışveriş listesi',
                       '✅ 70+ ülkeden 175 tarif','✅ Günde 1 PDF',
                       '✗ 7 günlük tam PDF','✗ Bütçe menüsü'],
            premFeats:['✅ Ücretsizin her şeyi, artı:','✅ 7 günlük tam PDF',
                       '✅ Haftalık bütçe menüsü','✅ Sınırsız erişim'] },
      it: { title:'Gratuito vs Premium', freeName:'Gratuito', premName:'⭐ Premium',
            price:'€3/mese', sub:'', popular:'PIÙ POPOLARE',
            cta:'Ottieni Premium →', already:'Già abbonato? Attiva qui sotto ↓',
            freeFeats:['✅ Piano pasti 7 giorni','✅ Lista della spesa automatica',
                       '✅ 175 ricette da 70+ paesi','✅ 1 PDF completo / giorno',
                       '✗ PDF con tutti i 7 giorni','✗ Menu economico'],
            premFeats:['✅ Tutto il gratuito, più:','✅ PDF completo 7 giorni',
                       '✅ Menu economico settimanale','✅ Accesso illimitato'] },
      ko: { title:'무료 vs 프리미엄', freeName:'무료', premName:'⭐ 프리미엄',
            price:'€3/월', sub:'', popular:'가장 인기',
            cta:'프리미엄 이용 →', already:'이미 구독 중? 아래에서 활성화 ↓',
            freeFeats:['✅ 7일 식단 계획','✅ 자동 장보기 목록',
                       '✅ 70개국 175가지 레시피','✅ 하루 1 PDF',
                       '✗ 7일 전체 PDF','✗ 예산 메뉴'],
            premFeats:['✅ 무료의 모든 것, 추가로:','✅ 7일 전체 PDF',
                       '✅ 주간 예산 메뉴','✅ 무제한 접속'] },
      hi: { title:'मुफ्त vs प्रीमियम', freeName:'मुफ्त', premName:'⭐ प्रीमियम',
            price:'€3/माह', sub:'', popular:'सबसे लोकप्रिय',
            cta:'प्रीमियम पाएं →', already:'पहले से सदस्य? नीचे सक्रिय करें ↓',
            freeFeats:['✅ 7 दिन का भोजन योजना','✅ स्वचालित खरीदारी सूची',
                       '✅ 70+ देशों की 175 रेसिपी','✅ 1 PDF / दिन',
                       '✗ पूर्ण 7 दिन PDF','✗ बजट मेनू'],
            premFeats:['✅ सब कुछ मुफ्त में, साथ में:','✅ पूर्ण 7 दिन PDF',
                       '✅ साप्ताहिक बजट मेनू','✅ असीमित पहुंच'] },
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
      lang = langSwitcher.value;
      localStorage.setItem('lastLang', lang);
      applyTranslations();
      updateButtonState();
      attachPdfListeners();
      attachAutoMenuBtn();
      updateContentNav(lang);
    });
  }
// ---------- Supabase (verificare email) ----------
const supabase = window.supabase.createClient(
  'https://hwbzbidorkwtyvirozho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3YnpiaWRvcmt3dHl2aXJvemhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4OTE0ODUsImV4cCI6MjA2NzQ2NzQ4NX0.4bjszL8tRw0tcnWu8BN-Et8eWyerJFNj6U9tGraEwEA'
);
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
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('email', email);

    if (error) {
      window.hasUnlimited = false;
      resultDiv.innerHTML = `<span class="text-danger">${i18n[lang]?.msg?.server_error || 'Eroare server. Încercați din nou.'}</span>`;
      if (typeof updateButtonState === 'function') updateButtonState();
      return;
    }
    if (data && data.length > 0) {
      const now = Date.now();
      const valid = data.some(t => !t.expires_at || parseExpiryToMs(t.expires_at) > now);

      if (valid) {
        window.hasUnlimited = true;
        // calculează expirarea maximă
        const expiriesMs = data
          .map(t => parseExpiryToMs(t.expires_at))
          .filter(ms => ms !== null);
        const maxExpiryMs = expiriesMs.length ? Math.max(...expiriesMs) : null;
        const expiryText = maxExpiryMs
          ? `${(access[lang]?.validUntil || 'Valabil până la')} ${
              new Date(maxExpiryMs).toLocaleDateString(lang, { day: '2-digit', month: 'short', year: 'numeric' })
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
        // Dacă vrei să ascunzi plata pt. nelimitați, decomentează:
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
      } else {
        window.hasUnlimited = false;
        resultDiv.innerHTML = `<span class="text-danger">${i18n[lang]?.msg?.invalid || 'Nu există acces valid pentru acest email.'}</span>`;
        if (manageBtn) manageBtn.style.display = 'none';
        if (typeof updateButtonState === 'function') updateButtonState();
      }
    } else {
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
        dinners: ['Musaca grecească','Ratatouille','Souvlaki','Tajine','Boeuf Bourguignon','Spanakopita','Harira']
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
        dinners: ['Musaca grecească','Pad Thai','Rajma','Hummus','Bibimbap','Spanakopita','Mapo Tofu']
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

  // ---------- HERO CTA BUTTON ----------
  const heroCta = document.getElementById('hero-cta-btn');
  if (heroCta) {
    heroCta.addEventListener('click', () => {
      // Trigger random menu generation
      const autoBtn = document.getElementById('auto-menu-btn');
      if (autoBtn) autoBtn.click();
      // Smooth scroll to planner
      setTimeout(() => {
        (document.getElementById('planner-anchor-section') || document.querySelector('.app-main'))
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    });
  }

  // ---------- INIT UI ----------
  resetPdfQuotaIfNeeded();
  applyTranslations();
  attachPdfListeners();
  updateButtonState();
  wireInputsToShoppingList();
});
