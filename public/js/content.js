/* content.js – Auto-inject food photos on recipe pages
   Strategy:
   1. Try TheMealDB (free, no key, real food photos ~500 recipes)
   2. Fall back to curated Unsplash photo IDs by hash (category-neutral food photos)
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

  // Cache in sessionStorage to avoid repeated API calls within a tab session
  const cacheKey = 'ri2_' + recipeName.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 48);

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
    // Place before the CTA button so it sits inside the hero
    const cta = heroInner.querySelector('.btn');
    cta ? heroInner.insertBefore(fig, cta) : heroInner.appendChild(fig);
  }

  // ── Fallback: curated Unsplash photo IDs (food/cooking) ──────
  // 24 high-quality food photos — consistent per recipe name via hash
  const FALLBACK_PHOTOS = [
    'photo-1504674900247-0877df9cc836', // grilled steak
    'photo-1512621776951-a57141f2eefd', // fresh salad bowl
    'photo-1565299624946-b28f40a0ae38', // pizza
    'photo-1555939594-58d7cb561ad1', // fried chicken
    'photo-1559847844-5315695dadae', // ramen noodles
    'photo-1563379091339-03b21ab4a4f8', // rice bowl Asian
    'photo-1455619452474-d2be8b1e70cd', // Indian curry
    'photo-1546069901-ba9599a7e63c', // vegetable salad
    'photo-1484723091739-30a097e8f929', // avocado toast
    'photo-1476224203421-9ac39bcb3327', // sandwich
    'photo-1482049016688-2d3e1b311543', // eggs breakfast
    'photo-1567620905732-2d1ec7ab7445', // pancakes
    'photo-1540189549336-e6e99c3679fe', // colourful bowls
    'photo-1551782450-a2132b4ba21d', // burger
    'photo-1568901346375-23c9450c58cd', // smash burger
    'photo-1547592180-85f173990554', // pasta carbonara
    'photo-1603360946369-dc9bb6258143', // biryani
    'photo-1574484284002-952d92456975', // stir fry
    'photo-1625937286074-9b23a7dac8e3', // fish tacos
    'photo-1534482421-64566f976cfa', // soup stew
    'photo-1588166524941-3bf61a9c41db', // pad thai
    'photo-1606787364406-a3cdf06c6d0c', // pancake stack
    'photo-1555396273-367ea4eb4db5', // restaurant plate
    'photo-1600803907087-f56d462fd26b', // shakshuka
  ];

  function fallbackImage() {
    let hash = 0;
    for (let i = 0; i < recipeName.length; i++) {
      hash = (hash * 31 + recipeName.charCodeAt(i)) & 0x7fffffff;
    }
    const id = FALLBACK_PHOTOS[hash % FALLBACK_PHOTOS.length];
    const url = `https://images.unsplash.com/${id}?w=800&h=380&fit=crop&q=80&auto=format`;
    sessionStorage.setItem(cacheKey, url);
    injectImage(url);
  }

  // ── Check cache first ─────────────────────────────────────────
  const cached = sessionStorage.getItem(cacheKey);
  if (cached === '__none__') return;
  if (cached) { injectImage(cached); return; }

  // ── Try TheMealDB (free, no API key) ──────────────────────────
  // Good match for ~500 popular world dishes
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  fetch(
    'https://www.themealdb.com/api/json/v1/1/search.php?s=' + encodeURIComponent(recipeName),
    { signal: controller.signal }
  )
    .then(r => r.json())
    .then(data => {
      clearTimeout(timeout);
      const meal = data?.meals?.[0];
      if (meal?.strMealThumb) {
        const url = meal.strMealThumb; // full-size food photo
        sessionStorage.setItem(cacheKey, url);
        injectImage(url);
      } else {
        sessionStorage.setItem(cacheKey, '__none__');
        fallbackImage();
      }
    })
    .catch(() => {
      clearTimeout(timeout);
      fallbackImage();
    });
})();
