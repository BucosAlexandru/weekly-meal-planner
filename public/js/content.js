/* content.js – Auto-inject food photos on recipe pages
   Strategy:
   1. Try TheMealDB (free, no key, real food photos ~500 recipes)
   2. Fall back to cuisine-aware Unsplash photos based on recipeCuisine from JSON-LD
   No manual photos needed — fully automatic.
*/
(function () {
  'use strict';

  const h1 = document.querySelector('h1');
  if (!h1) return;
  const recipeName = h1.textContent.trim();
  if (!recipeName) return;

  const heroInner = document.querySelector('.content-hero-inner');
  if (!heroInner) return;

  const cacheKey = 'ri3_' + recipeName.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 48);

  // ── Extract cuisine from JSON-LD (always English) ─────────────
  function getCuisine() {
    try {
      const ld = document.querySelector('script[type="application/ld+json"]');
      if (ld) return JSON.parse(ld.textContent).recipeCuisine || '';
    } catch (e) {}
    return '';
  }

  // ── Cuisine → region → curated Unsplash photo IDs ────────────
  // Each region has 3 photos; recipe name hash picks one consistently
  const REGION_PHOTOS = {
    mexican:      ['photo-1565299585323-38d6b0865b47', 'photo-1624300629298-e9ff39444396', 'photo-1625937286074-9b23a7dac8e3'],
    latin:        ['photo-1603599130916-5b2d42b9f8a1', 'photo-1553163147-622ab57be1c7', 'photo-1512058564366-18510be2db19'],
    asian:        ['photo-1559847844-5315695dadae', 'photo-1563379091339-03b21ab4a4f8', 'photo-1574484284002-952d92456975'],
    indian:       ['photo-1455619452474-d2be8b1e70cd', 'photo-1603360946369-dc9bb6258143', 'photo-1585937421612-70a008356fbe'],
    japanese:     ['photo-1569050467447-ce54b3bbc37d', 'photo-1617196034183-421b4040ed20', 'photo-1617196034099-9af820c6e9d6'],
    chinese:      ['photo-1563245372-f21724e3856d', 'photo-1585032226651-759b368d7246', 'photo-1563245372-f21724e3856d'],
    middleeast:   ['photo-1600803907087-f56d462fd26b', 'photo-1504674900247-0877df9cc836', 'photo-1543158181-e6f9f6712055'],
    mediterranean:['photo-1571091718767-18b5b1457add', 'photo-1540189549336-e6e99c3679fe', 'photo-1484723091739-30a097e8f929'],
    european:     ['photo-1547592180-85f173990554', 'photo-1565299624946-b28f40a0ae38', 'photo-1476224203421-9ac39bcb3327'],
    african:      ['photo-1534482421-64566f976cfa', 'photo-1512621776951-a57141f2eefd', 'photo-1555939594-58d7cb561ad1'],
    american:     ['photo-1551782450-a2132b4ba21d', 'photo-1568901346375-23c9450c58cd', 'photo-1482049016688-2d3e1b311543'],
    default:      ['photo-1540189549336-e6e99c3679fe', 'photo-1504674900247-0877df9cc836', 'photo-1512621776951-a57141f2eefd'],
  };

  // Map country/cuisine name → region bucket
  const CUISINE_TO_REGION = {
    // Mexico & Latin America
    'Mexico':'mexican','Mexican':'mexican',
    'Colombia':'latin','Peru':'latin','Argentina':'latin','Brazil':'latin',
    'Chile':'latin','Venezuela':'latin','Cuba':'latin','Bolivia':'latin',
    'Paraguay':'latin','Uruguay':'latin','Haiti':'latin','Costa Rica':'latin',
    'Honduras':'latin','Panama':'latin','Nicaragua':'latin','Trinidad':'latin',
    'Guyana':'latin','Barbados':'latin','Jamaica':'latin','Puerto Rico':'latin',
    // Asian
    'Vietnam':'asian','Thailand':'asian','Philippines':'asian','Indonesia':'asian',
    'Malaysia':'asian','Singapore':'asian','Myanmar':'asian','Laos':'asian',
    'Cambodia':'asian','Mongolia':'asian','South Korea':'asian','Korea':'asian',
    'Taiwan':'asian','Sri Lanka':'asian','Bangladesh':'asian','Nepal':'asian',
    'Bhutan':'asian','Papua New Guinea':'asian','Fiji':'asian','Samoa':'asian',
    // Japanese
    'Japan':'japanese',
    // Chinese
    'China':'chinese',
    // Indian subcontinent
    'India':'indian','Pakistan':'indian',
    // Middle East & Central Asia
    'Turkey':'middleeast','Lebanon':'middleeast','Jordan':'middleeast',
    'Saudi Arabia':'middleeast','UAE':'middleeast','Iran':'middleeast',
    'Iraq':'middleeast','Syria':'middleeast','Yemen':'middleeast',
    'Morocco':'middleeast','Egypt':'middleeast','Libya':'middleeast',
    'Tunisia':'middleeast','Algeria':'middleeast','Afghanistan':'middleeast',
    'Kazakhstan':'middleeast','Azerbaijan':'middleeast','Tajikistan':'middleeast',
    'Uzbekistan':'middleeast','Kyrgyzstan':'middleeast','Turkmenistan':'middleeast',
    // Mediterranean
    'Greece':'mediterranean','Cyprus':'mediterranean','Israel':'mediterranean',
    'Malta':'mediterranean',
    // European
    'Italy':'european','France':'european','Spain':'european','Germany':'european',
    'Portugal':'european','Romania':'european','Poland':'european','Russia':'european',
    'Ukraine':'european','Hungary':'european','Austria':'european','Belgium':'european',
    'Netherlands':'european','Sweden':'european','Norway':'european','Finland':'european',
    'Denmark':'european','Ireland':'european','Bulgaria':'european','Serbia':'european',
    'Croatia':'european','North Macedonia':'european','Albania':'european',
    'Kosovo':'european','Slovakia':'european','Belarus':'european',
    'Luxembourg':'european','Iceland':'european','Switzerland':'european',
    'Czech Republic':'european','Lithuania':'european','Latvia':'european',
    'Estonia':'european','Slovenia':'european','Bosnia':'european',
    // African
    'Ethiopia':'african','Nigeria':'african','Ghana':'african','Senegal':'african',
    'Cameroon':'african','Kenya':'african','Tanzania':'african','Madagascar':'african',
    'Mozambique':'african','Angola':'african','Rwanda':'african','Zimbabwe':'african',
    'Mauritius':'african','South Africa':'african','Ivory Coast':'african',
    'Mali':'african','Niger':'african','Somalia':'african','Sudan':'african',
    // American
    'United States':'american','USA':'american','Canada':'american',
    'Australia':'american','New Zealand':'american',
  };

  function getRegion(cuisine) {
    return CUISINE_TO_REGION[cuisine] || 'default';
  }

  // ── Inject the image figure ───────────────────────────────────
  function injectImage(url) {
    if (!url) return;
    if (document.querySelector('.recipe-hero-photo')) return;
    const fig = document.createElement('figure');
    fig.className = 'recipe-hero-photo';
    const img = document.createElement('img');
    img.src = url;
    img.alt = recipeName;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.onerror = function () { fig.remove(); };
    fig.appendChild(img);
    const cta = heroInner.querySelector('.btn');
    cta ? heroInner.insertBefore(fig, cta) : heroInner.appendChild(fig);
  }

  // ── Cuisine-aware fallback ────────────────────────────────────
  function fallbackImage() {
    const cuisine = getCuisine();
    const region  = getRegion(cuisine);
    const photos  = REGION_PHOTOS[region] || REGION_PHOTOS.default;
    // Pick consistently per recipe name (not random)
    let hash = 0;
    for (let i = 0; i < recipeName.length; i++) {
      hash = (hash * 31 + recipeName.charCodeAt(i)) & 0x7fffffff;
    }
    const id  = photos[hash % photos.length];
    const url = `https://images.unsplash.com/${id}?w=800&h=380&fit=crop&q=80&auto=format`;
    sessionStorage.setItem(cacheKey, url);
    injectImage(url);
  }

  // ── Check cache ───────────────────────────────────────────────
  const cached = sessionStorage.getItem(cacheKey);
  if (cached === '__none__') { fallbackImage(); return; }
  if (cached) { injectImage(cached); return; }

  // ── Try TheMealDB (free, no API key, ~500 popular recipes) ────
  const controller = new AbortController();
  const timeout = setTimeout(() => { controller.abort(); fallbackImage(); }, 3000);

  fetch(
    'https://www.themealdb.com/api/json/v1/1/search.php?s=' + encodeURIComponent(recipeName),
    { signal: controller.signal }
  )
    .then(r => r.json())
    .then(data => {
      clearTimeout(timeout);
      const meal = data?.meals?.[0];
      if (meal?.strMealThumb) {
        sessionStorage.setItem(cacheKey, meal.strMealThumb);
        injectImage(meal.strMealThumb);
      } else {
        sessionStorage.setItem(cacheKey, '__none__');
        fallbackImage();
      }
    })
    .catch(() => { clearTimeout(timeout); fallbackImage(); });
})();
