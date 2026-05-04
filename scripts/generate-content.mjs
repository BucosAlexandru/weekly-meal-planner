/**
 * generate-content.mjs
 * Generates SEO-optimised static pages:
 *   – 8 weekly meal-plan pages for /ro/meniu-saptamanal/ and /en/weekly-meal-plan/
 *   – Index hub pages for those directories
 *   – Individual recipe pages for /ro/retete/ and /en/recipes/
 * Run: node scripts/generate-content.mjs
 */

import { recipes }      from '../public/js/recipes.js';
import { recipes as budgetRecipes } from '../public/js/recipes-budget.js';
import { i18n }          from '../public/js/i18n.js';
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');
const PUBLIC    = path.join(ROOT, 'public');

/* ── helpers ─────────────────────────────────────────────────── */
function mkdir(p){ fs.mkdirSync(p, { recursive: true }); }
function write(p, html){ mkdir(path.dirname(p)); fs.writeFileSync(p, html, 'utf8'); }
function slug(name){ return name.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g,''); }
function byName(name){ return recipes.find(r => r.name?.ro === name || r.name?.en === name); }
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function capFirst(s){ return s ? s[0].toUpperCase() + s.slice(1) : ''; }

/* ── 8 themed plans ──────────────────────────────────────────── */
const PLANS = [
  {
    id: 'mediteranean',
    idEn: 'mediterranean',
    emoji: '🫒',
    theme: { ro:'Mediteranean', en:'Mediterranean' },
    desc: {
      ro: 'O săptămână de mese inspirate din bucătăriile Italiei, Greciei, Franței, Spaniei și Marocului. Ingrediente proaspete, ulei de măsline și savori autentice.',
      en: 'A week inspired by Italian, Greek, French, Spanish and Moroccan cuisines. Fresh ingredients, olive oil and authentic Mediterranean flavours.'
    },
    costRON: '200–260',
    costEUR: '40–55',
    lunches: ['Spaghete Carbonara','Gazpacho','Quiche Lorraine','Risotto','Paella','Pasta e fagioli','Pasta alla Norma'],
    dinners: ['Musaca grecească','Ratatouille','Souvlaki','Tajine','Boeuf Bourguignon','Spanakopita','Harira'],
  },
  {
    id: 'asia',
    idEn: 'asian-fusion',
    emoji: '🍜',
    theme: { ro:'Asia – Tur Culinar', en:'Asian Food Tour' },
    desc: {
      ro: 'Japonia, Korea, Vietnam, Thailanda, India și Indonezia pe farfuria ta. Șapte zile de arome, mirodenii și tehnici culinare asiatice.',
      en: 'Japan, Korea, Vietnam, Thailand, India and Indonesia on your plate. Seven days of Asian flavours, spices and cooking techniques.'
    },
    costRON: '240–300',
    costEUR: '50–65',
    lunches: ['Pho','Bibimbap','Tom Yum','Pad Thai','Dhal','Kimbap','Okonomiyaki'],
    dinners: ['Sushi','Curry de pui','Ramen','Pui Gong Bao','Nasi Goreng','Rendang','Tom Kha Gai'],
  },
  {
    id: 'buget',
    idEn: 'budget',
    emoji: '💰',
    theme: { ro:'Meniu de Buget – sub 150 RON', en:'Budget Week – under €30' },
    desc: {
      ro: 'Mese sănătoase și gustoase pentru 2 persoane cu un buget de maxim 150 RON pe săptămână. Ingrediente simple, preparare rapidă.',
      en: 'Healthy and tasty meals for 2 people on a budget of under €30 per week. Simple ingredients, quick preparation.'
    },
    costRON: '100–150',
    costEUR: '20–30',
    lunches: budgetRecipes.slice(0,7).map(r=>r.name?.ro || r.name?.en),
    dinners: budgetRecipes.slice(7,14).map(r=>r.name?.ro || r.name?.en),
    isBudget: true
  },
  {
    id: 'est-european',
    idEn: 'eastern-european',
    emoji: '🥟',
    theme: { ro:'Est-European – Gusturi de Acasă', en:'Eastern European Comfort Food' },
    desc: {
      ro: 'Ciorbele, tocanele și preparatele tradiționale din România, Georgia, Ungaria și Polonia. Bucătărie de suflet, autentică și hrănitoare.',
      en: 'Stews, soups and traditional dishes from Romania, Georgia, Hungary and Poland. Soul food, authentic and nourishing.'
    },
    costRON: '160–210',
    costEUR: '33–45',
    lunches: ['Ciorbă de burtă','Bors','Fasole cu cârnați','Gulaș','Pierogi','Lobio','Chakhokhbili'],
    dinners: ['Pui Kiev','Khinkali','Chicken Paprikash','Kotlet schabowy','Zeamă','Okroshka','Solyanka'],
  },
  {
    id: 'tur-mondial',
    idEn: 'world-tour',
    emoji: '🌍',
    theme: { ro:'Tur Mondial – 7 Țări în 7 Zile', en:'World Tour – 7 Countries in 7 Days' },
    desc: {
      ro: 'O masă pe zi din alt colț al lumii: SUA, Anglia, Germania, Jamaica, Nigeria, India și Israel. Diversitate culinară maximă.',
      en: 'One meal a day from a different corner of the world: USA, UK, Germany, Jamaica, Nigeria, India and Israel.'
    },
    costRON: '190–250',
    costEUR: '40–53',
    lunches: ['Schnitzel','Tabbouleh','Hummus','Koshari','Shakshuka','Smørrebrød','Chakchouka'],
    dinners: ['Cheeseburger','Fish and Chips','Chifteluțe suedeze','Jerk Chicken','Jollof Rice','Biryani','Bobotie'],
  },
  {
    id: 'latin',
    idEn: 'latin-american',
    emoji: '🌶️',
    theme: { ro:'America Latină – Picant & Colorat', en:'Latin America – Spicy & Vibrant' },
    desc: {
      ro: 'Mexic, Peru, Brazilia și Cuba pe farfuria ta. Fasole neagră, porumb, avocado, carne condimentată și culori vii.',
      en: 'Mexico, Peru, Brazil and Cuba on your plate. Black beans, corn, avocado, spiced meats and vibrant colours.'
    },
    costRON: '200–260',
    costEUR: '42–55',
    lunches: ['Tamale','Arroz Chaufa','Lomo Saltado','Picadillo','Pozole','Pupusa','Arepa'],
    dinners: ['Tacos','Feijoada','Chili con carne','Moqueca','Ropa Vieja','Bandeja Paisa','Chiles en nogada'],
  },
  {
    id: 'vegetarian',
    idEn: 'vegetarian',
    emoji: '🌱',
    theme: { ro:'Vegetarian – Colorat & Sănătos', en:'Vegetarian – Colourful & Healthy' },
    desc: {
      ro: 'O săptămână fără carne, bogată în proteine vegetale, legume proaspete și savori din toată lumea. Perfect pentru a reduce consumul de carne.',
      en: 'A meat-free week rich in plant proteins, fresh vegetables and global flavours. Perfect for reducing meat consumption.'
    },
    costRON: '150–200',
    costEUR: '31–42',
    lunches: ['Gazpacho','Tabbouleh','Ratatouille','Dhal','Shakshuka','Fasolada','Pasta alla Norma'],
    dinners: ['Musaca grecească','Pad Thai','Rajma','Hummus','Bibimbap','Spanakopita','Mapo Tofu'],
  },
  {
    id: 'rapid',
    idEn: 'quick-easy',
    emoji: '⚡',
    theme: { ro:'Rapid & Simplu – max. 30 min', en:'Quick & Easy – max 30 min' },
    desc: {
      ro: 'Mese delicioase în cel mult 30 de minute. Perfecte pentru zilele aglomerate când vrei să mănânci bine fără să petreci ore în bucătărie.',
      en: 'Delicious meals ready in 30 minutes or less. Perfect for busy days when you want to eat well without spending hours in the kitchen.'
    },
    costRON: '170–220',
    costEUR: '35–47',
    lunches: ['Spaghete Carbonara','Tacos','Pad Thai','Shakshuka','Dhal','Omelete Americane','Schnitzel'],
    dinners: ['Pui Gong Bao','Pho','Tom Yum','Curry de pui','Nasi Goreng','Cheeseburger','Fish and Chips'],
  },
];

/* ── shared HTML parts ───────────────────────────────────────── */
const NAV = `
<header class="app-header no-print" role="banner">
  <nav class="app-nav" aria-label="Main navigation">
    <a class="nav-brand" href="/" aria-label="MealPlanner.ro – home">
      <span class="nav-icon" aria-hidden="true">🥗</span>
      <span class="nav-title">MealPlanner<span class="nav-tld">.ro</span></span>
    </a>
    <div class="nav-links">
      <a href="/ro/meniu-saptamanal/" class="nav-link">Meniuri săptămânale</a>
      <a href="/ro/retete/" class="nav-link">Rețete</a>
      <a href="/ro/" class="nav-link">Aplicație</a>
    </div>
  </nav>
</header>`;

const NAV_EN = `
<header class="app-header no-print" role="banner">
  <nav class="app-nav" aria-label="Main navigation">
    <a class="nav-brand" href="/" aria-label="MealPlanner.ro – home">
      <span class="nav-icon" aria-hidden="true">🥗</span>
      <span class="nav-title">MealPlanner<span class="nav-tld">.ro</span></span>
    </a>
    <div class="nav-links">
      <a href="/en/weekly-meal-plan/" class="nav-link">Weekly plans</a>
      <a href="/en/recipes/" class="nav-link">Recipes</a>
      <a href="/en/" class="nav-link">App</a>
    </div>
  </nav>
</header>`;

const FOOTER = `
<footer class="app-footer" role="contentinfo">
  <div class="footer-inner">
    <span class="footer-brand">🥗 MealPlanner.ro</span>
    <span class="footer-sep">·</span>
    <a href="/ro/meniu-saptamanal/">Meniuri săptămânale</a>
    <span class="footer-sep">·</span>
    <a href="/ro/retete/">Rețete</a>
    <span class="footer-sep">·</span>
    <span>© 2025</span>
  </div>
</footer>`;

const FOOTER_EN = `
<footer class="app-footer" role="contentinfo">
  <div class="footer-inner">
    <span class="footer-brand">🥗 MealPlanner.ro</span>
    <span class="footer-sep">·</span>
    <a href="/en/weekly-meal-plan/">Weekly plans</a>
    <span class="footer-sep">·</span>
    <a href="/en/recipes/">Recipes</a>
    <span class="footer-sep">·</span>
    <span>© 2025</span>
  </div>
</footer>`;

const HEAD = (title, desc, canonical, lang='ro') => `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}"/>
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1"/>
  <link rel="canonical" href="https://meal-planner.ro${canonical}"/>
  <link rel="alternate" hreflang="x-default" href="https://meal-planner.ro/"/>
  <link rel="alternate" hreflang="ro" href="https://meal-planner.ro/ro/"/>
  <link rel="alternate" hreflang="en" href="https://meal-planner.ro/en/"/>
  <meta property="og:type" content="website"/>
  <meta property="og:title" content="${esc(title)}"/>
  <meta property="og:description" content="${esc(desc)}"/>
  <meta property="og:url" content="https://meal-planner.ro${canonical}"/>
  <meta property="og:image" content="https://meal-planner.ro/cover.jpg"/>
  <meta name="theme-color" content="#24712A"/>
  <link rel="icon" type="image/svg+xml" href="/images/favicon.svg"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"/>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet"/>
  <link rel="stylesheet" href="/css/style.min.css"/>
  <link rel="stylesheet" href="/css/content.css"/>
</head>
<body>`;

/* ── weekly plan page generator ──────────────────────────────── */
function buildShoppingList(plan, lang){
  const ingMap = {};
  const recipeSource = plan.isBudget ? budgetRecipes : recipes;
  [...plan.lunches, ...plan.dinners].forEach(name => {
    const r = recipeSource.find(re => re.name?.[lang] === name || re.name?.ro === name || re.name?.en === name);
    if(!r) return;
    const ingr = r.ingredients?.[lang] || r.ingredients?.ro || r.ingredients?.en || [];
    ingr.forEach(i => {
      const key = i.toLowerCase().replace(/\s*\(.*?\)/g,'').trim();
      if(key && !ingMap[key]) ingMap[key] = i;
    });
  });
  return Object.values(ingMap).sort((a,b)=>a.localeCompare(b));
}

const DAYS_RO = ['Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă','Duminică'];
const DAYS_EN = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

function planPageRO(plan){
  const recipeSource = plan.isBudget ? budgetRecipes : recipes;
  const shopping = buildShoppingList(plan, 'ro');
  const jsonLd = {
    "@context":"https://schema.org",
    "@type":"MealPlan",
    "name": `Meniu Săptămânal – ${plan.theme.ro}`,
    "description": plan.desc.ro,
    "url": `https://meal-planner.ro/ro/meniu-saptamanal/${plan.id}/`,
    "publisher":{"@type":"Organization","name":"MealPlanner.ro","url":"https://meal-planner.ro"}
  };

  const rows = DAYS_RO.map((day, i) => {
    const lName = plan.lunches[i] || '';
    const dName = plan.dinners[i] || '';
    const lRec  = recipeSource.find(r => r.name?.ro === lName || r.name?.en === lName);
    const dRec  = recipeSource.find(r => r.name?.ro === dName || r.name?.en === dName);
    const lIngr = lRec?.ingredients?.ro?.slice(0,5).join(', ') || '';
    const dIngr = dRec?.ingredients?.ro?.slice(0,5).join(', ') || '';
    const lSlug = lRec ? `/ro/retete/${slug(lRec.name.ro || lRec.name.en)}/` : '#';
    const dSlug = dRec ? `/ro/retete/${slug(dRec.name.ro || dRec.name.en)}/` : '#';
    return `
    <tr>
      <td><strong>${day}</strong></td>
      <td>
        ${lSlug !== '#' ? `<a href="${lSlug}" class="recipe-link">` : ''}<strong>${esc(lName)}</strong>${lSlug !== '#' ? '</a>' : ''}
        ${lIngr ? `<br><small class="text-muted">${esc(lIngr)}…</small>` : ''}
      </td>
      <td>
        ${dSlug !== '#' ? `<a href="${dSlug}" class="recipe-link">` : ''}<strong>${esc(dName)}</strong>${dSlug !== '#' ? '</a>' : ''}
        ${dIngr ? `<br><small class="text-muted">${esc(dIngr)}…</small>` : ''}
      </td>
    </tr>`;
  }).join('');

  const shoppingItems = shopping.map(i => `<li><i class="bi bi-check2-square"></i> ${esc(capFirst(i))}</li>`).join('\n');
  const otherPlans = PLANS.filter(p => p.id !== plan.id).slice(0,4).map(p =>
    `<a href="/ro/meniu-saptamanal/${p.id}/" class="content-card-mini">
      <span class="card-mini-emoji">${p.emoji}</span>
      <span>${p.theme.ro}</span>
     </a>`
  ).join('');

  return `${HEAD(`Meniu Săptămânal ${plan.theme.ro} – Listă Cumpărături | MealPlanner.ro`, plan.desc.ro, `/ro/meniu-saptamanal/${plan.id}/`)}
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
${NAV}

<main class="content-main">
  <!-- HERO -->
  <section class="content-hero">
    <div class="content-hero-inner">
      <nav aria-label="breadcrumb" class="breadcrumb-nav">
        <a href="/">Acasă</a> › <a href="/ro/meniu-saptamanal/">Meniuri Săptămânale</a> › <span>${plan.theme.ro}</span>
      </nav>
      <div class="content-hero-badge">${plan.emoji} Meniu săptămânal</div>
      <h1>Meniu Săptămânal – <span class="accent">${esc(plan.theme.ro)}</span></h1>
      <p class="content-hero-desc">${esc(plan.desc.ro)}</p>
      <div class="plan-meta-chips">
        <span class="plan-chip"><i class="bi bi-people-fill"></i> 2 persoane</span>
        <span class="plan-chip"><i class="bi bi-calendar-week"></i> 7 zile</span>
        <span class="plan-chip cost-chip"><i class="bi bi-currency-exchange"></i> ~${plan.costRON} RON / săpt.</span>
        <span class="plan-chip"><i class="bi bi-bag-check-fill"></i> ${shopping.length} ingrediente</span>
      </div>
      <div class="content-cta-group">
        <a href="/ro/?autoplan=${plan.id}" class="btn btn-generate btn-lg">
          <i class="bi bi-pencil-square"></i> Deschide în aplicație &amp; editează
        </a>
        <a href="#lista-cumparaturi" class="btn btn-outline-light btn-lg">
          <i class="bi bi-cart3"></i> Vezi lista de cumpărături
        </a>
      </div>
    </div>
  </section>

  <!-- PLAN TABLE -->
  <section class="content-section" aria-labelledby="plan-heading">
    <div class="content-section-inner">
      <h2 id="plan-heading"><span class="section-emoji">📅</span> Planul complet al săptămânii</h2>
      <div class="table-wrap">
        <table class="table planner-table content-table">
          <thead>
            <tr>
              <th>Ziua</th>
              <th><i class="bi bi-sun"></i> Prânz</th>
              <th><i class="bi bi-moon-stars"></i> Cină</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- SHOPPING LIST -->
  <section class="content-section content-section--green" id="lista-cumparaturi" aria-labelledby="shopping-heading">
    <div class="content-section-inner">
      <h2 id="shopping-heading"><span class="section-emoji">🛒</span> Lista completă de cumpărături</h2>
      <p class="section-intro">Toate ingredientele de care ai nevoie pentru această săptămână, sortate alfabetic. Estimat <strong>~${plan.costRON} RON</strong> pentru 2 persoane.</p>
      <ul class="shopping-grid">${shoppingItems}</ul>
      <div class="shopping-cta">
        <a href="/ro/?autoplan=${plan.id}" class="btn btn-generate">
          <i class="bi bi-pencil-square"></i> Deschide planul în aplicație
        </a>
        <small>Personalizează rețetele și descarcă PDF-ul gratuit</small>
      </div>
    </div>
  </section>

  <!-- OTHER PLANS -->
  <section class="content-section" aria-labelledby="other-plans-heading">
    <div class="content-section-inner">
      <h2 id="other-plans-heading"><span class="section-emoji">✨</span> Alte meniuri săptămânale</h2>
      <div class="mini-cards-grid">${otherPlans}</div>
      <div class="text-center mt-4">
        <a href="/ro/meniu-saptamanal/" class="btn btn-outline-primary">Vezi toate cele 8 meniuri →</a>
      </div>
    </div>
  </section>

  <!-- SEO TEXT -->
  <section class="content-section content-seo" aria-label="Informații despre planul de mese">
    <div class="content-section-inner">
      <h2>Cum să folosești acest plan de mese</h2>
      <p>Planul de mese <strong>${esc(plan.theme.ro)}</strong> a fost creat pentru 2 persoane, cu un buget estimat de <strong>${plan.costRON} RON pe săptămână</strong>. Poți ajusta cantitățile pentru mai multe persoane direct în aplicație.</p>
      <p>Dă clic pe „Deschide în aplicație" pentru a încărca automat toate mesele în planificator. Poți modifica orice rețetă, adăuga sau elimina zile, și descărca lista de cumpărături ca PDF — gratuit (1 PDF/zi) sau nelimitat cu abonament.</p>
      <h3>De ce să planifici mesele în avans?</h3>
      <ul>
        <li>Reduci risipa alimentară cu până la <strong>30%</strong> — cumperi exact ce ai nevoie</li>
        <li>Economisești <strong>timp și bani</strong> — o singură tură de cumpărături pe săptămână</li>
        <li>Mănânci mai <strong>sănătos</strong> — alegerile sunt făcute la rece, nu înfometat</li>
        <li>Elimini <strong>stresul zilnic</strong> al întrebării „ce gătesc azi?"</li>
      </ul>
    </div>
  </section>
</main>

${FOOTER}
</body>
</html>`;
}

function planPageEN(plan){
  const recipeSource = plan.isBudget ? budgetRecipes : recipes;
  const shopping = buildShoppingList(plan, 'en');
  const rows = DAYS_EN.map((day, i) => {
    const lName = plan.lunches[i] || '';
    const dName = plan.dinners[i] || '';
    const lRec  = recipeSource.find(r => r.name?.en === lName || r.name?.ro === lName);
    const dRec  = recipeSource.find(r => r.name?.en === dName || r.name?.ro === dName);
    const lIngr = lRec?.ingredients?.en?.slice(0,5).join(', ') || lRec?.ingredients?.ro?.slice(0,5).join(', ') || '';
    const dIngr = dRec?.ingredients?.en?.slice(0,5).join(', ') || dRec?.ingredients?.ro?.slice(0,5).join(', ') || '';
    const lNameEn = lRec?.name?.en || lName;
    const dNameEn = dRec?.name?.en || dName;
    const lSlug = lRec ? `/en/recipes/${slug(lRec.name.en || lRec.name.ro)}/` : '#';
    const dSlug = dRec ? `/en/recipes/${slug(dRec.name.en || dRec.name.ro)}/` : '#';
    return `
    <tr>
      <td><strong>${day}</strong></td>
      <td>
        ${lSlug !== '#' ? `<a href="${lSlug}" class="recipe-link">` : ''}<strong>${esc(lNameEn)}</strong>${lSlug !== '#' ? '</a>' : ''}
        ${lIngr ? `<br><small class="text-muted">${esc(lIngr)}…</small>` : ''}
      </td>
      <td>
        ${dSlug !== '#' ? `<a href="${dSlug}" class="recipe-link">` : ''}<strong>${esc(dNameEn)}</strong>${dSlug !== '#' ? '</a>' : ''}
        ${dIngr ? `<br><small class="text-muted">${esc(dIngr)}…</small>` : ''}
      </td>
    </tr>`;
  }).join('');

  const shoppingItems = shopping.map(i=>`<li><i class="bi bi-check2-square"></i> ${esc(capFirst(i))}</li>`).join('\n');
  const otherPlans = PLANS.filter(p=>p.id!==plan.id).slice(0,4).map(p=>
    `<a href="/en/weekly-meal-plan/${p.idEn}/" class="content-card-mini">
      <span class="card-mini-emoji">${p.emoji}</span>
      <span>${p.theme.en}</span>
     </a>`).join('');

  return `${HEAD(`Weekly Meal Plan – ${plan.theme.en} | MealPlanner.ro`, plan.desc.en, `/en/weekly-meal-plan/${plan.idEn}/`, 'en')}
${NAV_EN}

<main class="content-main">
  <section class="content-hero">
    <div class="content-hero-inner">
      <nav aria-label="breadcrumb" class="breadcrumb-nav">
        <a href="/">Home</a> › <a href="/en/weekly-meal-plan/">Weekly Meal Plans</a> › <span>${plan.theme.en}</span>
      </nav>
      <div class="content-hero-badge">${plan.emoji} Weekly meal plan</div>
      <h1>Weekly Meal Plan – <span class="accent">${esc(plan.theme.en)}</span></h1>
      <p class="content-hero-desc">${esc(plan.desc.en)}</p>
      <div class="plan-meta-chips">
        <span class="plan-chip"><i class="bi bi-people-fill"></i> 2 people</span>
        <span class="plan-chip"><i class="bi bi-calendar-week"></i> 7 days</span>
        <span class="plan-chip cost-chip"><i class="bi bi-currency-exchange"></i> ~€${plan.costEUR} / week</span>
        <span class="plan-chip"><i class="bi bi-bag-check-fill"></i> ${shopping.length} ingredients</span>
      </div>
      <div class="content-cta-group">
        <a href="/en/?autoplan=${plan.id}" class="btn btn-generate btn-lg">
          <i class="bi bi-pencil-square"></i> Open in app &amp; customise
        </a>
        <a href="#shopping-list-section" class="btn btn-outline-light btn-lg">
          <i class="bi bi-cart3"></i> See shopping list
        </a>
      </div>
    </div>
  </section>

  <section class="content-section" aria-labelledby="plan-heading-en">
    <div class="content-section-inner">
      <h2 id="plan-heading-en"><span class="section-emoji">📅</span> Full weekly plan</h2>
      <div class="table-wrap">
        <table class="table planner-table content-table">
          <thead><tr><th>Day</th><th><i class="bi bi-sun"></i> Lunch</th><th><i class="bi bi-moon-stars"></i> Dinner</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  </section>

  <section class="content-section content-section--green" id="shopping-list-section">
    <div class="content-section-inner">
      <h2><span class="section-emoji">🛒</span> Complete shopping list</h2>
      <p class="section-intro">All ingredients you need for this week, sorted alphabetically. Estimated <strong>~€${plan.costEUR}</strong> for 2 people.</p>
      <ul class="shopping-grid">${shoppingItems}</ul>
      <div class="shopping-cta">
        <a href="/en/?autoplan=${plan.id}" class="btn btn-generate">
          <i class="bi bi-pencil-square"></i> Open plan in app
        </a>
        <small>Customise recipes and download a free PDF</small>
      </div>
    </div>
  </section>

  <section class="content-section">
    <div class="content-section-inner">
      <h2><span class="section-emoji">✨</span> More weekly plans</h2>
      <div class="mini-cards-grid">${otherPlans}</div>
      <div class="text-center mt-4">
        <a href="/en/weekly-meal-plan/" class="btn btn-outline-primary">See all 8 plans →</a>
      </div>
    </div>
  </section>

  <section class="content-section content-seo">
    <div class="content-section-inner">
      <h2>How to use this meal plan</h2>
      <p>The <strong>${esc(plan.theme.en)}</strong> meal plan is designed for 2 people, with an estimated budget of <strong>€${plan.costEUR} per week</strong>. You can adjust quantities for more people directly in the app.</p>
      <p>Click "Open in app" to automatically load all meals into the planner. You can modify any recipe, add or remove days, and download the shopping list as a PDF — free (1 PDF/day) or unlimited with a subscription.</p>
      <h3>Why plan meals in advance?</h3>
      <ul>
        <li>Reduce food waste by up to <strong>30%</strong> — buy only what you need</li>
        <li>Save <strong>time and money</strong> — one shopping trip per week</li>
        <li>Eat <strong>healthier</strong> — decisions made calmly, not when hungry</li>
        <li>Eliminate the daily stress of "what should I cook today?"</li>
      </ul>
    </div>
  </section>
</main>

${FOOTER_EN}
</body>
</html>`;
}

/* ── index hub pages ─────────────────────────────────────────── */
function indexPageRO(){
  const cards = PLANS.map(p => `
  <a href="/ro/meniu-saptamanal/${p.id}/" class="content-card">
    <div class="content-card-header">
      <span class="card-emoji">${p.emoji}</span>
      <h2 class="card-title">${esc(p.theme.ro)}</h2>
    </div>
    <p class="card-desc">${esc(p.desc.ro.slice(0,100))}…</p>
    <div class="card-meta">
      <span><i class="bi bi-currency-exchange"></i> ${p.costRON} RON</span>
      <span><i class="bi bi-arrow-right-circle-fill"></i> Vezi planul</span>
    </div>
  </a>`).join('');

  return `${HEAD('Meniuri Săptămânale cu Liste de Cumpărături – 8 Planuri | MealPlanner.ro',
    '8 meniuri săptămânale complete cu liste de cumpărături și costuri estimate. Mediteranean, Asian, Buget, Vegetarian și altele — toate gratuite.',
    '/ro/meniu-saptamanal/')}
${NAV}
<main class="content-main">
  <section class="content-hero content-hero--short">
    <div class="content-hero-inner">
      <nav aria-label="breadcrumb" class="breadcrumb-nav">
        <a href="/">Acasă</a> › <span>Meniuri Săptămânale</span>
      </nav>
      <h1>Meniuri Săptămânale cu <span class="accent">Liste de Cumpărături</span></h1>
      <p class="content-hero-desc">8 planuri de mese complete, fiecare cu 14 rețete, lista de cumpărături sortată și costul estimat. Alege tema preferată sau deschide orice plan în aplicație pentru a-l personaliza.</p>
    </div>
  </section>
  <section class="content-section">
    <div class="content-section-inner">
      <div class="content-cards-grid">${cards}</div>
    </div>
  </section>
  <section class="content-section content-seo">
    <div class="content-section-inner">
      <h2>De ce să folosești un planificator de mese săptămânal?</h2>
      <p>Planificarea meselor în avans este una din cele mai eficiente metode de a mânca mai sănătos, de a reduce risipa alimentară și de a economisi bani. Fiecare plan de mai sus a fost creat cu rețete reale, ingrediente accesibile și un buget transparent.</p>
      <p>Toate planurile pot fi <strong>deschise și modificate gratuit</strong> în aplicația MealPlanner.ro. Poți înlocui orice rețetă, adăuga observații și descărca lista de cumpărături ca PDF.</p>
    </div>
  </section>
</main>
${FOOTER}
</body></html>`;
}

function indexPageEN(){
  const cards = PLANS.map(p => `
  <a href="/en/weekly-meal-plan/${p.idEn}/" class="content-card">
    <div class="content-card-header">
      <span class="card-emoji">${p.emoji}</span>
      <h2 class="card-title">${esc(p.theme.en)}</h2>
    </div>
    <p class="card-desc">${esc(p.desc.en.slice(0,100))}…</p>
    <div class="card-meta">
      <span><i class="bi bi-currency-exchange"></i> €${p.costEUR}</span>
      <span><i class="bi bi-arrow-right-circle-fill"></i> View plan</span>
    </div>
  </a>`).join('');

  return `${HEAD('Free Weekly Meal Plans with Shopping Lists – 8 Themes | MealPlanner.ro',
    '8 complete weekly meal plans with shopping lists and cost estimates. Mediterranean, Asian, Budget, Vegetarian and more — all free.',
    '/en/weekly-meal-plan/', 'en')}
${NAV_EN}
<main class="content-main">
  <section class="content-hero content-hero--short">
    <div class="content-hero-inner">
      <nav aria-label="breadcrumb" class="breadcrumb-nav">
        <a href="/">Home</a> › <span>Weekly Meal Plans</span>
      </nav>
      <h1>Free Weekly Meal Plans with <span class="accent">Shopping Lists</span></h1>
      <p class="content-hero-desc">8 complete meal plans, each with 14 recipes, a sorted shopping list and estimated cost. Choose your theme or open any plan in the app to customise it.</p>
    </div>
  </section>
  <section class="content-section">
    <div class="content-section-inner">
      <div class="content-cards-grid">${cards}</div>
    </div>
  </section>
  <section class="content-section content-seo">
    <div class="content-section-inner">
      <h2>Why use a weekly meal planner?</h2>
      <p>Planning meals in advance is one of the most effective ways to eat healthier, reduce food waste and save money. Each plan above was created with real recipes, accessible ingredients and a transparent budget.</p>
      <p>All plans can be <strong>opened and edited for free</strong> in the MealPlanner.ro app. You can swap any recipe, add notes and download the shopping list as a PDF.</p>
    </div>
  </section>
</main>
${FOOTER_EN}
</body></html>`;
}

/* ── recipe pages ─────────────────────────────────────────────── */
function recipePageRO(recipe){
  const n = recipe.name?.ro || recipe.name?.en || '';
  const o = recipe.origin?.ro || '';
  const ingr = recipe.ingredients?.ro || recipe.ingredients?.en || [];
  const how  = recipe.howIsMade?.ro || recipe.howIsMade?.en || '';
  const cat  = recipe.category?.ro || '';
  const steps = how.split(/\.\s+/).filter(Boolean);
  const jsonLd = {
    "@context":"https://schema.org","@type":"Recipe",
    "name": n, "description": `Rețeta tradițională de ${n} din ${o}. Ingrediente, mod de preparare și sfaturi utile.`,
    "recipeIngredient": ingr,
    "recipeInstructions": steps.map(s=>({ "@type":"HowToStep","text":s })),
    "recipeCategory": cat,
    "author":{"@type":"Organization","name":"MealPlanner.ro"},
    "url": `https://meal-planner.ro/ro/retete/${slug(n)}/`
  };
  const otherRecipes = recipes.filter(r => r.origin?.ro === o && r.name?.ro !== n).slice(0,3);
  const otherLinks = otherRecipes.map(r =>
    `<a href="/ro/retete/${slug(r.name.ro)}/" class="recipe-rel-link">🍽️ ${esc(r.name.ro)}</a>`
  ).join('');

  return `${HEAD(`Rețetă ${esc(n)} – Ingrediente și Mod de Preparare | MealPlanner.ro`,
    `Rețeta de ${n} din ${o}: ingrediente, mod de preparare pas cu pas și sfaturi. Adaugă în planificatorul tău de mese gratuit.`,
    `/ro/retete/${slug(n)}/`)}
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
${NAV}
<main class="content-main">
  <section class="content-hero content-hero--short">
    <div class="content-hero-inner">
      <nav aria-label="breadcrumb" class="breadcrumb-nav">
        <a href="/">Acasă</a> › <a href="/ro/retete/">Rețete</a> › <span>${esc(n)}</span>
      </nav>
      <div class="content-hero-badge">🍽️ ${esc(cat)} · ${esc(o)}</div>
      <h1>${esc(n)}</h1>
      <p class="content-hero-desc">Rețetă tradițională din <strong>${esc(o)}</strong>. Ingrediente proaspete și mod de preparare simplu.</p>
      <a href="/ro/?meal=${encodeURIComponent(n)}" class="btn btn-generate">
        <i class="bi bi-plus-circle-fill"></i> Adaugă în planul meu
      </a>
    </div>
  </section>

  <section class="content-section">
    <div class="content-section-inner recipe-layout">
      <div class="recipe-ingredients-box">
        <h2><span class="section-emoji">🛒</span> Ingrediente</h2>
        <ul class="recipe-ingr-list">
          ${ingr.map(i=>`<li><i class="bi bi-dot"></i> ${esc(capFirst(i))}</li>`).join('\n          ')}
        </ul>
      </div>
      <div class="recipe-steps-box">
        <h2><span class="section-emoji">👨‍🍳</span> Mod de preparare</h2>
        ${steps.length > 1
          ? `<ol class="recipe-steps">${steps.map(s=>`<li>${esc(s)}.</li>`).join('\n')}</ol>`
          : `<p class="recipe-how">${esc(how)}</p>`}
        ${otherLinks ? `<div class="recipe-related"><h3>Alte rețete din ${esc(o)}</h3>${otherLinks}</div>` : ''}
      </div>
    </div>
  </section>

  <section class="content-section content-seo">
    <div class="content-section-inner">
      <p>Adaugă <strong>${esc(n)}</strong> în planul tău de mese săptămânal și descarcă lista de cumpărături ca PDF. Folosește <a href="/ro/">aplicația gratuită MealPlanner.ro</a> pentru a planifica toate mesele săptămânii.</p>
    </div>
  </section>
</main>
${FOOTER}
</body></html>`;
}

function recipePageEN(recipe){
  const n    = recipe.name?.en || recipe.name?.ro || '';
  const nRo  = recipe.name?.ro || n;
  const o    = recipe.origin?.en || recipe.origin?.ro || '';
  const ingr = recipe.ingredients?.en || recipe.ingredients?.ro || [];
  const how  = recipe.howIsMade?.en || recipe.howIsMade?.ro || '';
  const cat  = recipe.category?.en || recipe.category?.ro || '';
  const steps = how.split(/\.\s+/).filter(Boolean);
  const otherRecipes = recipes.filter(r => (r.origin?.en===o||r.origin?.ro===recipe.origin?.ro) && r.name?.en !== n).slice(0,3);
  const otherLinks = otherRecipes.map(r =>
    `<a href="/en/recipes/${slug(r.name.en||r.name.ro)}/" class="recipe-rel-link">🍽️ ${esc(r.name.en||r.name.ro)}</a>`
  ).join('');

  return `${HEAD(`${esc(n)} Recipe – Ingredients & How to Make | MealPlanner.ro`,
    `Traditional ${n} recipe from ${o}: ingredients, step-by-step instructions and tips. Add to your free meal planner.`,
    `/en/recipes/${slug(n)}/`, 'en')}
${NAV_EN}
<main class="content-main">
  <section class="content-hero content-hero--short">
    <div class="content-hero-inner">
      <nav aria-label="breadcrumb" class="breadcrumb-nav">
        <a href="/">Home</a> › <a href="/en/recipes/">Recipes</a> › <span>${esc(n)}</span>
      </nav>
      <div class="content-hero-badge">🍽️ ${esc(cat)} · ${esc(o)}</div>
      <h1>${esc(n)}</h1>
      <p class="content-hero-desc">Traditional recipe from <strong>${esc(o)}</strong>. Fresh ingredients and simple preparation.</p>
      <a href="/en/?meal=${encodeURIComponent(n)}" class="btn btn-generate">
        <i class="bi bi-plus-circle-fill"></i> Add to my meal plan
      </a>
    </div>
  </section>

  <section class="content-section">
    <div class="content-section-inner recipe-layout">
      <div class="recipe-ingredients-box">
        <h2><span class="section-emoji">🛒</span> Ingredients</h2>
        <ul class="recipe-ingr-list">
          ${ingr.map(i=>`<li><i class="bi bi-dot"></i> ${esc(capFirst(i))}</li>`).join('\n          ')}
        </ul>
      </div>
      <div class="recipe-steps-box">
        <h2><span class="section-emoji">👨‍🍳</span> How to make it</h2>
        ${steps.length > 1
          ? `<ol class="recipe-steps">${steps.map(s=>`<li>${esc(s)}.</li>`).join('\n')}</ol>`
          : `<p class="recipe-how">${esc(how)}</p>`}
        ${otherLinks ? `<div class="recipe-related"><h3>More recipes from ${esc(o)}</h3>${otherLinks}</div>` : ''}
      </div>
    </div>
  </section>

  <section class="content-section content-seo">
    <div class="content-section-inner">
      <p>Add <strong>${esc(n)}</strong> to your weekly meal plan and download the shopping list as a PDF. Use the <a href="/en/">free MealPlanner.ro app</a> to plan all your weekly meals.</p>
    </div>
  </section>
</main>
${FOOTER_EN}
</body></html>`;
}

/* ── recipe index pages ──────────────────────────────────────── */
function recipeIndexRO(){
  const byOriginGroup = {};
  recipes.forEach(r => {
    const o = r.origin?.ro || 'Altele';
    if(!byOriginGroup[o]) byOriginGroup[o] = [];
    byOriginGroup[o].push(r);
  });
  const groups = Object.entries(byOriginGroup).sort((a,b)=>b[1].length-a[1].length).map(([o,recs])=>`
  <div class="recipe-origin-group">
    <h3 class="origin-title">🌍 ${esc(o)} <span class="recipe-count">(${recs.length})</span></h3>
    <ul class="recipe-origin-list">
      ${recs.map(r=>`<li><a href="/ro/retete/${slug(r.name.ro||r.name.en)}/">${esc(r.name.ro||r.name.en)}</a></li>`).join('\n      ')}
    </ul>
  </div>`).join('');

  return `${HEAD('Rețete din toată lumea – Ingrediente și Mod de Preparare | MealPlanner.ro',
    `${recipes.length} rețete din toată lumea cu ingrediente, mod de preparare și liste de cumpărături. Adaugă orice rețetă în planul tău de mese.`,
    '/ro/retete/')}
${NAV}
<main class="content-main">
  <section class="content-hero content-hero--short">
    <div class="content-hero-inner">
      <nav aria-label="breadcrumb" class="breadcrumb-nav">
        <a href="/">Acasă</a> › <span>Rețete</span>
      </nav>
      <h1>Rețete din <span class="accent">Toată Lumea</span></h1>
      <p class="content-hero-desc">${recipes.length} rețete cu ingrediente și mod de preparare — din Italia, Japonia, Mexic și multe altele. Toate pot fi adăugate gratuit în planificatorul tău de mese.</p>
    </div>
  </section>
  <section class="content-section">
    <div class="content-section-inner">
      <div class="recipe-groups-grid">${groups}</div>
    </div>
  </section>
</main>
${FOOTER}
</body></html>`;
}

function recipeIndexEN(){
  const byOriginGroup = {};
  recipes.forEach(r => {
    const o = r.origin?.en || r.origin?.ro || 'Other';
    if(!byOriginGroup[o]) byOriginGroup[o] = [];
    byOriginGroup[o].push(r);
  });
  const groups = Object.entries(byOriginGroup).sort((a,b)=>b[1].length-a[1].length).map(([o,recs])=>`
  <div class="recipe-origin-group">
    <h3 class="origin-title">🌍 ${esc(o)} <span class="recipe-count">(${recs.length})</span></h3>
    <ul class="recipe-origin-list">
      ${recs.map(r=>`<li><a href="/en/recipes/${slug(r.name.en||r.name.ro)}/">${esc(r.name.en||r.name.ro)}</a></li>`).join('\n      ')}
    </ul>
  </div>`).join('');

  return `${HEAD(`${recipes.length} Recipes from Around the World – Ingredients & How to Make | MealPlanner.ro`,
    `${recipes.length} recipes from Italy, Japan, Mexico and more — with ingredients, instructions and shopping lists. Add any recipe to your free meal planner.`,
    '/en/recipes/', 'en')}
${NAV_EN}
<main class="content-main">
  <section class="content-hero content-hero--short">
    <div class="content-hero-inner">
      <nav aria-label="breadcrumb" class="breadcrumb-nav">
        <a href="/">Home</a> › <span>Recipes</span>
      </nav>
      <h1>Recipes from <span class="accent">Around the World</span></h1>
      <p class="content-hero-desc">${recipes.length} recipes with ingredients and instructions — from Italy, Japan, Mexico and many more. All can be added free to your meal planner.</p>
    </div>
  </section>
  <section class="content-section">
    <div class="content-section-inner">
      <div class="recipe-groups-grid">${groups}</div>
    </div>
  </section>
</main>
${FOOTER_EN}
</body></html>`;
}

/* ── write all files ─────────────────────────────────────────── */
console.log('Generating content pages…\n');
let count = 0;

// RO plan pages
write(path.join(PUBLIC,'ro','meniu-saptamanal','index.html'), indexPageRO());
console.log('✅ /ro/meniu-saptamanal/index.html');
PLANS.forEach(p => {
  write(path.join(PUBLIC,'ro','meniu-saptamanal',p.id,'index.html'), planPageRO(p));
  console.log(`✅ /ro/meniu-saptamanal/${p.id}/`);
  count++;
});

// EN plan pages
write(path.join(PUBLIC,'en','weekly-meal-plan','index.html'), indexPageEN());
console.log('\n✅ /en/weekly-meal-plan/index.html');
PLANS.forEach(p => {
  write(path.join(PUBLIC,'en','weekly-meal-plan',p.idEn,'index.html'), planPageEN(p));
  console.log(`✅ /en/weekly-meal-plan/${p.idEn}/`);
  count++;
});

// RO recipe pages
write(path.join(PUBLIC,'ro','retete','index.html'), recipeIndexRO());
console.log('\n✅ /ro/retete/index.html');
recipes.forEach(r => {
  const n = r.name?.ro || r.name?.en;
  if(!n) return;
  write(path.join(PUBLIC,'ro','retete',slug(n),'index.html'), recipePageRO(r));
  count++;
});
console.log(`✅ ${recipes.length} recipe pages → /ro/retete/`);

// EN recipe pages
write(path.join(PUBLIC,'en','recipes','index.html'), recipeIndexEN());
console.log('✅ /en/recipes/index.html');
recipes.forEach(r => {
  const n = r.name?.en || r.name?.ro;
  if(!n) return;
  write(path.join(PUBLIC,'en','recipes',slug(n),'index.html'), recipePageEN(r));
  count++;
});
console.log(`✅ ${recipes.length} recipe pages → /en/recipes/`);

console.log(`\n🎉 Done! Generated ${count + 4} pages total.`);

/* ── collect all URLs for sitemap ────────────────────────────── */
const sitemapUrls = [
  'https://meal-planner.ro/',
  'https://meal-planner.ro/ro/',
  'https://meal-planner.ro/en/',
  'https://meal-planner.ro/ro/meniu-saptamanal/',
  'https://meal-planner.ro/en/weekly-meal-plan/',
  'https://meal-planner.ro/ro/retete/',
  'https://meal-planner.ro/en/recipes/',
  ...PLANS.map(p=>`https://meal-planner.ro/ro/meniu-saptamanal/${p.id}/`),
  ...PLANS.map(p=>`https://meal-planner.ro/en/weekly-meal-plan/${p.idEn}/`),
  ...recipes.map(r=>{ const n=r.name?.ro||r.name?.en; return n?`https://meal-planner.ro/ro/retete/${slug(n)}/`:null; }).filter(Boolean),
  ...recipes.map(r=>{ const n=r.name?.en||r.name?.ro; return n?`https://meal-planner.ro/en/recipes/${slug(n)}/`:null; }).filter(Boolean),
];
// also add all existing language pages
['es','fr','de','pt','ru','ar','zh','ja','hi','tr','it','ko'].forEach(l=>
  sitemapUrls.push(`https://meal-planner.ro/${l}/`)
);

const today = new Date().toISOString().slice(0,10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(u=>`  <url>
    <loc>${u}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.includes('/retete/')||u.includes('/recipes/')||u.includes('/meniu-')||u.includes('/weekly-')?'monthly':'weekly'}</changefreq>
    <priority>${u==='https://meal-planner.ro/'?'1.0':u.includes('/ro/')||u.includes('/en/')?'0.9':'0.7'}</priority>
  </url>`).join('\n')}
</urlset>`;

write(path.join(PUBLIC,'sitemap.xml'), sitemap);
console.log(`\n✅ sitemap.xml updated — ${sitemapUrls.length} URLs`);
