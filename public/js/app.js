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
  // ---------- FUNCȚII UI / LOGIC ----------
  function renderTable() {
    const tbody = document.getElementById('plan-table');
    if (!tbody) return;
    tbody.innerHTML = '';
    i18n[lang].weekdays.forEach((day, idx) => {
      tbody.insertAdjacentHTML('beforeend', `
        <tr class="planner-row">
          <td><strong>${day}</strong></td>
          <td>
            <div class="input-group input-group-sm">
              <input id="d${idx+1}l" class="form-control" placeholder="${i18n[lang].placeholderL}">
              <button type="button" class="btn btn-outline-secondary" onclick="startDictation('d${idx+1}l')">
            <i class="bi bi-mic-fill" aria-hidden="true"></i>
             </button>
            </div>
          </td>
          <td>
            <div class="input-group input-group-sm">
              <input id="d${idx+1}c" class="form-control" placeholder="${i18n[lang].placeholderD}">
               <button type="button" class="btn btn-outline-secondary" onclick="startDictation('d${idx+1}c')">
                  <i class="bi bi-mic-fill" aria-hidden="true"></i>
                </button>
            </div>
          </td>
        </tr>
      `);
    });
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
  const name   = recipe.name?.[langCode] || recipe.name?.en || recipe.name?.ro || '';
  const ingr   = recipe.ingredients?.[langCode] || recipe.ingredients?.en || recipe.ingredients?.ro || [];
  const origin = recipe.origin?.[langCode] || recipe.origin?.en || recipe.origin?.ro || '';
  const templates = {
    ro: (n, o, list) => list?.length ? `${n} (${list.join(', ')}) este o rețetă tradițională din ${o}.` : `${n} este o rețetă tradițională din ${o}.`,
    en: (n, o, list) => list?.length ? `${n} (${list.join(', ')}) is a traditional recipe from ${o}.` : `${n} is a traditional recipe from ${o}.`,
    es: (n, o, list) => list?.length ? `${n} (${list.join(', ')}) es una receta tradicional de ${o}.` : `${n} es una receta tradicional de ${o}.`,
    fr: (n, o, list) => list?.length ? `${n} (${list.join(', ')}) est une recette traditionnelle de ${o}.` : `${n} est une recette traditionnelle de ${o}.`,
    de: (n, o, list) => list?.length ? `${n} (${list.join(', ')}) ist ein traditionelles Rezept aus ${o}.` : `${n} ist ein traditionelles Rezept aus ${o}.`,
    pt: (n, o, list) => list?.length ? `${n} (${list.join(', ')}) é uma receita tradicional de ${o}.` : `${n} é uma receita tradicional de ${o}.`,
    ru: (n, o, list) => list?.length ? `${n} (${list.join(', ')}) — традиционное блюдо из ${o}.` : `${n} — традиционное блюдо из ${o}.`,
    ar: (n, o, list) => list?.length ? `${n} (${list.join(', ')}) هي وصفة تقليدية من ${o}.` : `${n} هي وصفة تقليدية من ${o}.`,
    zh: (n, o, list) => list?.length ? `${n}（${list.join('，')}）是一道来自${o}的传统菜肴。` : `${n}是一道来自${o}的传统菜肴。`,
    ja: (n, o, list) => list?.length ? `${n}（${list.join('、')}）は${o}の伝統料理です。` : `${n}は${o}の伝統料理です。`,
    hi: (n, o, list) => list?.length ? `${n} (${list.join(', ')}) ${o} की पारंपरिक रेसिपी है।` : `${n} ${o} की पारंपरिक रेसिपी है।`,
    tr: (n, o, list) => list?.length ? `${n} (${list.join(', ')}) ${o} kökenli geleneksel bir tariftir.` : `${n} ${o} kökenli geleneksel bir tariftir.`,
    it: (n, o, list) => list?.length ? `${n} (${list.join(', ')}) è una ricetta tradizionale di ${o}.` : `${n} è una ricetta tradizionale di ${o}.`,
    ko: (n, o, list) => list?.length ? `${n} (${list.join(', ')})는(은) ${o}의 전통 요리입니다.` : `${n}는(은) ${o}의 전통 요리입니다.`,
  };
  const t = templates[langCode] || templates.en;
const list = Array.isArray(ingr) ? ingr : [];
// FIX: dacă nu ai ingrediente, nu genera propoziția "tradițională din ..."
if (!list.length) {
  if (name && origin) return `${name} (${origin})`; // opțional, mai curat
  return name || '';
}
return t(name, origin, list);
}
  async function generateRandomMenu() {
  let pool;
  if (window.isBudgetMenu) {
    await ensureBudgetRecipes();
    pool = recipesBudget;
  } else {
    // Apply active filter
    const filterDef = typeof FILTER_DEFS !== 'undefined'
      ? FILTER_DEFS.find(f => f.id === (window._activeFilter || 'all'))
      : null;
    const test = filterDef && filterDef.id !== 'all' ? filterDef.test : () => true;
    pool = recipesMain.filter(test);
    if (pool.length < 14) pool = recipesMain; // fallback to all
  }

  if (!Array.isArray(pool) || pool.length < 7) {
    console.warn("Random menu: pool too small", pool?.length);
    return;
  }

  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const lunches  = shuffled.slice(0, 7);
  const dinners  = shuffled.slice(7, 14);

  for (let i = 0; i < 7; i++) {
    const lunchInput  = document.getElementById(`d${i+1}l`);
    const dinnerInput = document.getElementById(`d${i+1}c`);
    if (!lunchInput || !dinnerInput) continue;
    lunchInput.value  = lunches[i] ? getRecipeText(lunches[i], lang) : '';
    dinnerInput.value = dinners[i] ? getRecipeText(dinners[i], lang) : '';
  }
  // Refresh recipe meta chips after filling
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
  if (window.html2canvas) {
    window.html2canvas.logging = true; // activare debug
  }
  const meals = collectMeals();
  let shoppingHTML = `<div>`;
  meals.forEach((m, idx) => {
    if (!m.lunch && !m.dinner) return;
    shoppingHTML += `<div class="recipe-section"><div class="recipe-day">${m.day}</div>`;
    // --- LUNCH ---
    if (m.lunch) {
      const titleL = extractRecipeName(m.lunch);
      const recipeLunch = (window.recipes || []).find(r => r.name?.[lang]?.toLowerCase() === titleL.toLowerCase());
      const stepsLunch = (recipeLunch?.howIsMade?.[lang] || recipeLunch?.howIsMade?.ro || '')
        .split('.').map(x => x.trim()).filter(Boolean);
      const howIsMadeHTMLLunch = stepsLunch.length > 1
        ? `<ul>${stepsLunch.map(s => `<li>${s}.</li>`).join('')}</ul>`
        : `<span class="howis">${stepsLunch[0] || ''}</span>`;

      const lunchMetaBadges = recipeLunch ? [
        recipeLunch.time    ? `⏱️ ${recipeLunch.time} min` : '',
        recipeLunch.costRon ? `💰 ~${recipeLunch.costRon} RON` : '',
        ...(recipeLunch.tags || []).slice(0,2).map(t => (TAG_LABELS[t]||{})[lang]||(TAG_LABELS[t]||{}).en||t),
      ].filter(Boolean).join('  ·  ') : '';
      shoppingHTML += `
        <div>
          <span class="recipe-lunch">🍲 ${i18n[lang]["col.lunch"]}: ${titleL}</span><br>
          ${lunchMetaBadges ? `<span class="pdf-meta-badges">${lunchMetaBadges}</span><br>` : ''}
          ${recipeLunch?.origin?.[lang] ? `<em class="origin">(${i18n[lang]["col.origin"] || 'Țara'}: ${recipeLunch.origin[lang]})</em><br>` : ''}
          ${recipeLunch?.ingredients?.[lang]?.length ? `<span class="ingredients">${i18n[lang]["col.ingredients"]}: ${recipeLunch.ingredients[lang].join(', ')}</span>` : ''}
          ${(recipeLunch?.howIsMade?.[lang] || recipeLunch?.howIsMade?.ro) ? `
            <br><strong class="how-title">${i18n[lang]["howIsMade"] || "Cum se face:"}</strong>
            ${howIsMadeHTMLLunch}
          ` : ''}
        </div>
      `;
    }
    // --- DINNER ---
    if (m.dinner) {
      const titleC = extractRecipeName(m.dinner);
      const recipeDinner = (window.recipes || []).find(r => r.name?.[lang]?.toLowerCase() === titleC.toLowerCase());
      const stepsDinner = (recipeDinner?.howIsMade?.[lang] || recipeDinner?.howIsMade?.ro || '')
        .split('.').map(x => x.trim()).filter(Boolean);
      const howIsMadeHTMLDinner = stepsDinner.length > 1
        ? `<ul>${stepsDinner.map(s => `<li>${s}.</li>`).join('')}</ul>`
        : `<span class="howis">${stepsDinner[0] || ''}</span>`;

      const dinnerMetaBadges = recipeDinner ? [
        recipeDinner.time    ? `⏱️ ${recipeDinner.time} min` : '',
        recipeDinner.costRon ? `💰 ~${recipeDinner.costRon} RON` : '',
        ...(recipeDinner.tags || []).slice(0,2).map(t => (TAG_LABELS[t]||{})[lang]||(TAG_LABELS[t]||{}).en||t),
      ].filter(Boolean).join('  ·  ') : '';
      shoppingHTML += `
        <div>
          <span class="recipe-dinner">🌙 ${i18n[lang]["col.dinner"]}: ${titleC}</span><br>
          ${dinnerMetaBadges ? `<span class="pdf-meta-badges">${dinnerMetaBadges}</span><br>` : ''}
          ${recipeDinner?.origin?.[lang] ? `<em class="origin">(${i18n[lang]["col.origin"] || 'Țara'}: ${recipeDinner.origin[lang]})</em><br>` : ''}
          ${recipeDinner?.ingredients?.[lang]?.length ? `<span class="ingredients">${i18n[lang]["col.ingredients"]}: ${recipeDinner.ingredients[lang].join(', ')}</span>` : ''}
          ${(recipeDinner?.howIsMade?.[lang] || recipeDinner?.howIsMade?.ro) ? `
            <br><strong class="how-title">${i18n[lang]["howIsMade"] || "Cum se face:"}</strong>
            ${howIsMadeHTMLDinner}
          ` : ''}
        </div>
      `;
    }
    shoppingHTML += `</div>`;
  });
  shoppingHTML += `</div>`;
  // --- TITLU + MESAJ IMPACT ---
  const titleEl = document.getElementById('pdf-title');
  const msgEl   = document.getElementById('pdf-impact-message');
  if (titleEl) titleEl.textContent = i18n[lang].title || "Planificator de mese";
  if (msgEl) {
    msgEl.innerHTML = `<div style="margin-top:0; margin-bottom:12px; font-weight:600; color:#169d55; text-align:center; font-size:2.09em;">${pdfMessages[lang] || pdfMessages.ro}</div>`;
  }
  // --- BONUSURI ---
  const desserts = (window.recipes || []).filter(r => ["Desert","Dessert"].includes(r.category?.[lang] || r.category?.ro));
  const snacks   = (window.recipes || []).filter(r => ["Gustare","Snack","Aperitiv","Appetizer"].includes(r.category?.[lang] || r.category?.ro));
  const randomDessert = desserts.length ? desserts[Math.floor(Math.random()*desserts.length)] : null;
  const randomSnack   = snacks.length ? snacks[Math.floor(Math.random()*snacks.length)] : null;
  let bonusSection = "";
  if (randomSnack) {
    bonusSection += `
      <div class="callout snack">
        <b>${i18n[lang].bonusSnack || "Snack suggestion:"}</b>
        <strong>${randomSnack.name?.[lang] || randomSnack.name?.ro || ''}</strong>
        <div>${randomSnack.ingredients?.[lang]?.join(", ") || ""}</div>
        <div>${randomSnack.howIsMade?.[lang] || randomSnack.howIsMade?.ro || ""}</div>
      </div>`;
  }
  if (randomDessert) {
    bonusSection += `
      <div class="callout dessert">
        <b>${i18n[lang].bonusDessert || "Bonus Dessert:"}</b>
        <strong>${randomDessert.name?.[lang] || randomDessert.name?.ro || ''}</strong>
        <div>${randomDessert.ingredients?.[lang]?.join(", ") || ""}</div>
        <div>${randomDessert.howIsMade?.[lang] || randomDessert.howIsMade?.ro || ""}</div>
      </div>`;
  }
  bonusSection = bonusSection
  ? `<div id="bonus-section">${bonusSection}</div>`
  : "";
  const listEl = document.getElementById('pdf-list');
if (listEl) {
  const today = new Date().toLocaleDateString(lang, { day: '2-digit', month: '2-digit', year: 'numeric' });
  listEl.style.fontSize = "12px";
  const motivationalMessage = `
  <div class="motiv" style="margin-top:14px; padding:8px; background:#e9f7ee; border-left:4px solid #218739; border-radius:4px; font-size:11.5pt; color:#222; text-align:center;">
    ${pickMotiv(lang)}
  </div>
`;
listEl.innerHTML = `
  <h3 style="margin-bottom:10px; margin-top:0; text-align:left; padding-left:3.5mm; font-size:1.28em; color:#218739;">
    ${i18n[lang].shoppingList}
  </h3>
  ${shoppingHTML}
  <div style="margin-top:16px;"></div>
  ${bonusSection}
  ${motivationalMessage}
  <div class="doc-footer" style="margin-top:10px; font-size:10px; text-align:center; color:#666;">
    Generat cu Meal-Planner.ro • ${today}
  </div>
`;
}
  document.querySelectorAll('.recipe-section').forEach(div => {
    div.style.fontSize = "12px";
    div.style.lineHeight = "1.35";
  });
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
/* ===== Canvas A4 pentru PDF (html2pdf) ===== */
html, body {
  margin: 0;
  padding: 0;
  background: #fff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
:root{
  --brand:#218739; --brand-soft:#e9f7ee; --ink:#222; --muted:#666; --line:#ddd; --section-line:#6379ff;
}
/* Container A4: 210mm - 2*10mm = 190mm util */
#pdf-impact-area{
  width: 190mm;
  padding: 12mm 10mm 14mm;
  margin: 0 auto;
  background: #fff;
  font-family: Segoe UI, Arial, sans-serif;
  color: var(--ink);
  font-size: 11pt;
  line-height: 1.36;
  letter-spacing: .1px;
  box-sizing: border-box;
}
#pdf-impact-area > :first-child { margin-top: 0; }
/* Titlu + mesaj impact (doar prima pagină) */
#pdf-title{
  text-align: center;
  font-weight: 700;
  font-size: 12pt;
  margin: 0 0 3mm;
}
#pdf-title::after{
  content: "";
  display: block;
  width: 52mm;
  height: 1.5px;
  margin: 2.4mm auto 0;
  background: var(--brand);
  opacity: .35;
}
#pdf-impact-message{
  margin: 0 0 6mm;
  padding: 9mm;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--brand-soft);
  color: var(--ink);
  page-break-inside: avoid;
  break-inside: avoid;
}
#pdf-impact-message > div{
  margin: 0;
  font-weight: 700;
  color: var(--brand);
  text-align: center;
  font-size: 16pt;
  line-height: 1.22;
}
/* Fiecare zi */
.recipe-section{
  border: 1px solid var(--line);
  border-top: 4px solid var(--section-line);
  border-radius: 6px;
  padding: 3.5mm;
  margin: 2.5mm 0;
  background: #f8f9fa;
  page-break-inside: avoid;
  break-inside: avoid;
  box-sizing: border-box;
}
.recipe-day{
  font-size: 12pt;
  font-weight: 800;
  margin: 0 0 2mm;
  letter-spacing: .2px;
}
/* Badge-uri */
.recipe-lunch,
.recipe-dinner{
  display: inline-block;
  padding: 2px 7px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 11pt;
  line-height: 1;
  margin: 0 0 2mm;
}
.recipe-lunch{  background: var(--brand-soft); color: var(--brand); }
.recipe-dinner{ background: #eaf1ff; color: #1f4fbf; }
/* Texte/liste */
.origin{ color: var(--muted); }
.how-title{ font-weight: 800; }
ul{
  margin: 2mm 0 0 6mm;
  padding: 0;
  font-size: 12pt;
}
ul li{ margin: 0 0 1mm; }
ul li::marker{ color: var(--brand); }
/* Bonus */
#bonus-section .callout{
  margin: 3mm 0 0;
  padding: 3mm;
  border-radius: 6px;
  border: 1px solid var(--line);
  background: #fff;
  page-break-inside: avoid;
  break-inside: avoid;
}
#bonus-section .snack{  background:#f1fff5; border-left:4px solid #43b581; }
#bonus-section .dessert{background:#fffbe7; border-left:4px solid #ff7f50; }
#bonus-section b{ display:block; margin-bottom:1mm; }
/* Footer */
.doc-footer{
  margin-top: 6mm;
  padding-top: 3mm;
  border-top: 1px solid var(--line);
  font-size: 9.5pt;
  color: var(--muted);
  text-align: center;
}
/* Mesajul motivațional */
.motiv{
  page-break-inside: avoid;
  break-inside: avoid;
  margin-top: 14px;
  padding: 8px;
  background: #e9f7ee;
  border-left: 4px solid #218739;
  border-radius: 4px;
  font-size: 11.5pt;
  color: #222;
  text-align: center;
}
/* Forțări de pagină din JS */
.page-break{
  break-before: page;
  page-break-before: always;
  height: 0;
  margin: 0;
  padding: 0;
  border: 0;
}
`;
  return { node, styleEl };
}
function maybeCompactToTwoPages(root){
  const MM_TO_PX = 96 / 25.4;
  const usable = (297 - 12 - 14) * MM_TO_PX; 
  const pagesNeeded = Math.ceil(root.scrollHeight / usable);
  if (pagesNeeded > 2) {  // <- schimbă în > 1 dacă vrei 2 pagini max
    root.style.fontSize = '11pt';        // era 11.5pt
    root.style.lineHeight = '1.25';      // era 1.28
    root.querySelectorAll('.recipe-section').forEach(s=>{
      s.style.padding = '6px';
      s.style.margin = '5px 0';
    });
    root.querySelectorAll('ul').forEach(u=>{
      u.style.margin = '3px 0 0 12px';
    });
  }
}
function paginateCleanNode(root){
  const MM_TO_PX = 96 / 25.4;
  const usable = (297 - 12 - 14) * MM_TO_PX; // mm → px
  const csRoot = getComputedStyle(root);
  const padTop    = parseFloat(csRoot.paddingTop)    || 0;
  const padBottom = parseFloat(csRoot.paddingBottom) || 0;
  const blocks = root.querySelectorAll(
    '#pdf-title, #pdf-impact-message, .recipe-section, #bonus-section, .doc-footer'
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
      test: r => {
        const ingr = (r.ingredients?.ro||r.ingredients?.en||[]).length;
        return ingr <= 6;
      }
    },
  ];

  const FILTER_LABELS = {
    ro: { 'filter.all':'Toate','filter.med':'Mediteranean','filter.asian':'Asian',
          'filter.veg':'Vegetarian','filter.budget':'Buget','filter.quick':'Rapid' },
    en: { 'filter.all':'All','filter.med':'Mediterranean','filter.asian':'Asian',
          'filter.veg':'Vegetarian','filter.budget':'Budget','filter.quick':'Quick' },
    default: { 'filter.all':'All','filter.med':'Mediterranean','filter.asian':'Asian',
               'filter.veg':'Vegetarian','filter.budget':'Budget','filter.quick':'Quick' },
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
          if (key && !allIngr.has(key)) allIngr.set(key, i);
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
      const eur = (totalCost / 4.97).toFixed(0);
      const lbl = i18n[lang];
      costSummary.innerHTML =
        `<span class="cost-icon">💰</span>
         <span>${lbl?.estWeeklyCost || 'Cost estimat săptămână'}: <strong>~${totalCost} RON</strong> (~€${eur})</span>
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
    if (rec.time) parts.push(`<span class="rmeta-chip rmeta-time">⏱️ ${rec.time} min</span>`);
    if (rec.costRon) parts.push(`<span class="rmeta-chip rmeta-cost">💰 ~${rec.costRon} RON</span>`);
    if (rec.tags?.length) {
      const shownTags = rec.tags.slice(0, 2);
      shownTags.forEach(tagId => {
        const label = (TAG_LABELS[tagId] || {})[lang] || (TAG_LABELS[tagId] || {}).en || tagId;
        const emoji = { quick:'⚡', budget:'💲', vegetarian:'🌱', vegan:'🌿',
                        'high-protein':'💪', family:'👨‍👩‍👧', healthy:'🥗',
                        spicy:'🌶️', 'one-pot':'🍲' }[tagId] || '';
        parts.push(`<span class="rmeta-chip rmeta-tag">${emoji} ${label}</span>`);
      });
    }
    if (!parts.length) return '';
    // description (first sentence of howIsMade if no custom desc)
    let descTxt = rec.desc?.[lang] || rec.desc?.en || '';
    if (!descTxt && rec.howIsMade) {
      const raw = rec.howIsMade[lang] || rec.howIsMade.ro || rec.howIsMade.en || '';
      descTxt = raw.split(/[.!?]/)[0].trim();
      if (descTxt && rec.time) descTxt += `. ${(READY_IN[lang] || READY_IN.en)(rec.time)}.`;
    }
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
  const COST_RON = { all:200, med:240, asian:250, budget:130, vegetarian:170, quick:180, latin:220, eastern:190, worldtour:210 };
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
    const eur = Math.round(ron / 4.8);
    costBar.innerHTML = `<i class="bi bi-currency-exchange"></i> <strong>${i18n[lang]?.costEstimate || 'Cost estimat'}: ~${ron} RON (~€${eur})</strong> / ${i18n[lang]?.perWeek || 'săptămână · 2 persoane'}`;
    costBar.style.display = 'flex';
  }

  function attachAutoMenuBtn() {
    const bar = document.getElementById('auto-menu-bar');
    if (!bar) return;

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
    autoBtn.innerHTML = `<i class="bi bi-shuffle" aria-hidden="true"></i> ${(i18n[lang] && i18n[lang]['btn.autoMenu']) || 'Generează meniu aleator'}`;
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
          updateAllRecipeMeta();
        });
        inp.dataset.shopListener = '1';
      }
    });
    // Initial render if inputs already have values (e.g. after generateRandomMenu)
    updateAllRecipeMeta();
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
      await ensureHtml2pdfLoaded();              // <- adăugat
      resetPdfQuotaIfNeeded();
      if (pdfCount >= 1) {                       // LIMITĂ: 1/zi
        updateButtonState();
        return;
      }
      exportShoppingListToPDF();
      pdfCount++;
      if (pdfCount === 1) pdfFirst = Date.now();
      localStorage.setItem('pdfCount', pdfCount);
      localStorage.setItem('pdfFirst', pdfFirst);
      updateButtonState();
    };
    freeBtn.dataset.attached = '1';
  }
  // butonul plătit apare dinamic
  if (resultDiv && !resultDiv.dataset.observing) {
    const obs = new MutationObserver(() => {
      const paidBtn = document.getElementById('paid-generate-pdf');
      if (paidBtn && !paidBtn.dataset.attached) {
        paidBtn.onclick = async () => {          // <- async + lazy load
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
  resetPdfQuotaIfNeeded?.();
  const generateBtn = document.getElementById('generate-btn');
  if (!generateBtn || !buyBtn || !statusEl) return;
  // dacă vrei ca plata să NU apară pentru nelimitați:
  const showPay = (pdfCount >= 1) && !window.hasUnlimited;
  generateBtn.style.display = showPay ? 'none' : 'inline-block';
  buyBtn.style.display = showPay ? 'inline-block' : 'none';
  if (currencySelUI) currencySelUI.style.display = showPay ? 'inline-block' : 'none';
  statusEl.innerHTML = showPay ? (i18n[lang].maxed || '') : '';
}
(function setSeasonTheme(){
  const now = new Date();
  const m = now.getMonth(); // 0..11
  const isWinter = (m === 11 || m === 0); // Decembrie sau Ianuarie
  document.body.classList.toggle('theme-winter', isWinter);
})();
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
    generateBtn.innerHTML = '<i class="bi bi-file-earmark-pdf-fill"></i> ' + (i18n[lang]["btn.generate"] || "Generează PDF");
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
          updateAllRecipeMeta();
        });
        inp.dataset.shopWired = '1';
      }
    });
  }
  // Also observe table rebuilds (lang switch, etc.)
  const planTableObserver = new MutationObserver(() => {
    wireInputsToShoppingList();
    updateShoppingList();
    updateAllRecipeMeta();
  });
  const planTableEl = document.getElementById('plan-table');
  if (planTableEl) planTableObserver.observe(planTableEl, { childList: true, subtree: true });

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

  // ---------- INIT UI ----------
  resetPdfQuotaIfNeeded();
  applyTranslations();
  attachPdfListeners();
  updateButtonState();
  wireInputsToShoppingList();
});
