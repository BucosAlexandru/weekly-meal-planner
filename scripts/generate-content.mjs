/**
 * generate-content.mjs — SEO static page generator
 *
 * Generates weekly meal-plan pages + recipe pages in all 14 app languages.
 * Weekly plans: all 14 languages (ro, en, es, fr, de, pt, ru, ar, zh, ja, hi, tr, it, ko)
 * Recipe pages: ro + en only (detailed ingredient/method pages)
 *
 * Run: node scripts/generate-content.mjs
 */

import { recipes }                    from '../public/js/recipes.js';
import { recipes as budgetRecipes }   from '../public/js/recipes-budget.js';
import { i18n }                       from '../public/js/i18n.js';
import { recipeImages }               from '../public/js/recipe-images.js';
import { recipesMeta, TAG_LABELS, READY_IN } from '../public/js/recipes-meta.js';
import { buildShoppingListV2 }        from '../public/js/shopping-list.js';
import { CUISINE_INTRO }              from './cuisine-intros.mjs';
import { RELATED_CUISINES, MAX_RELATED_CUISINES,
         enrichCatalog, selectByTagMix, resolveDiscoveryTarget } from './discovery-config.mjs';
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');
const PUBLIC    = path.join(ROOT, 'public');

// Phase 7 PR 3: discovery catalog enriched once at module load. Reused by
// recipePage() for the cross-cuisine "similar-tag-mix" bridge strip. The
// id→raw lookup gives card-rendering helpers (recipeMetadata, slug, etc.)
// access to the full recipe object after selectByTagMix returns its
// enriched-but-trimmed shape.
const discoveryCatalog = enrichCatalog({ recipes, recipesMeta });
const recipesById      = new Map(recipes.map(r => [r.id, r]));

/* ── helpers ──────────────────────────────────────────────────── */
const mkdir  = p => fs.mkdirSync(p, { recursive: true });
const write  = (p, html) => { mkdir(path.dirname(p)); fs.writeFileSync(p, html, 'utf8'); };
const slug   = name => name.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g,'');
const esc    = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const capFirst = s => s ? s[0].toUpperCase() + s.slice(1) : '';

/* ── Recipe image resolution ──────────────────────────────────────
   Precedence (first match wins):
     1. public/images/<slug>.webp   (smaller, modern)
     2. public/images/<slug>.jpg    (existing convention)
     3. recipeImages[id]            (Spoonacular / Wikipedia mapping)
     4. cover2.jpg                  (last-resort fallback)
   Returns { src, ogUrl }:
     - `src`    — what goes in <img src=…>. Same-origin path for local files
                  ('/images/<slug>.webp') so preview deploys
                  (cts-xxx.vercel.app) and any future custom domain load
                  correctly without hitting the production host.
     - `ogUrl`  — what goes in <meta property="og:image">, JSON-LD, and the
                  Twitter card. Absolute https://meal-planner.ro/... because
                  social-share crawlers need a fully-qualified URL.
   For external mapped URLs (Wikipedia/Spoonacular), src and ogUrl are
   identical — they're already absolute and origin-independent.
   `imageWarnings` collects de-duplicated build-time diagnostics; the
   summary is emitted once at the bottom of the build. Run
   `node scripts/audit-images.mjs` for a full report. */
const imageWarnings = { missing: [], lowres: [], fallback: [] };
const _imgWarnSeen = new Set();
const PROD_ORIGIN = 'https://meal-planner.ro';
function resolveRecipeImage(recipe, rslug) {
  const localWebp = path.join(PUBLIC, 'images', `${rslug}.webp`);
  const localJpg  = path.join(PUBLIC, 'images', `${rslug}.jpg`);
  const localPng  = path.join(PUBLIC, 'images', `${rslug}.png`);
  if (fs.existsSync(localWebp)) {
    return { src: `/images/${rslug}.webp`, ogUrl: `${PROD_ORIGIN}/images/${rslug}.webp` };
  }
  if (fs.existsSync(localJpg)) {
    return { src: `/images/${rslug}.jpg`, ogUrl: `${PROD_ORIGIN}/images/${rslug}.jpg` };
  }
  if (fs.existsSync(localPng)) {
    return { src: `/images/${rslug}.png`, ogUrl: `${PROD_ORIGIN}/images/${rslug}.png` };
  }
  const mapped = recipeImages[recipe.id];
  if (mapped) return { src: mapped, ogUrl: mapped };
  if (!_imgWarnSeen.has(recipe.id)) {
    _imgWarnSeen.add(recipe.id);
    imageWarnings.fallback.push({ id: recipe.id, name: recipe.name?.en || recipe.name?.ro, slug: rslug });
  }
  return { src: `${PROD_ORIGIN}/images/cover2.jpg`, ogUrl: `${PROD_ORIGIN}/images/cover2.jpg` };
}

/* Stability ranking for thumb/featured pickers on cuisine surfaces.
   Card pickers (recipeIndex thumb-strip, cuisineHubPage featured hero) used
   to take the first N recipes in array order, so cuisines with mixed sources
   (e.g. Greece = 2 Spoonacular + 3 Wikipedia) ended up showcasing the
   Spoonacular ones — which 404 in many regions and fall back to the flag.
   Higher score = more reliable host, so the same set of available URLs gets
   surfaced consistently regardless of recipes.js authoring order.
     3 — local /images/<slug>.{webp,jpg,png} (same-origin, can't 404)
     2 — upload.wikimedia.org (CDN, stable URLs)
     1 — anything else with a real URL (img.spoonacular.com hot-links —
         known flaky)
     0 — placeholder cover2.jpg / missing                                  */
function imgStability(url) {
  if (!url || url.endsWith('cover2.jpg')) return 0;
  if (url.startsWith('/')) return 3;
  if (url.includes('upload.wikimedia.org')) return 2;
  return 1;
}

/* Image quality pipeline (Phase 6 item 3): generates srcset + sizes for an
   image URL so the browser picks an appropriately-sized variant per
   viewport+DPR. Avoids serving 330px Wikipedia thumbs to Retina screens.

   Returns { srcset, sizes } strings, or { srcset:'', sizes:'' } when the
   URL doesn't support resizing (local images, opaque URLs).

     Wikipedia thumb URL pattern:
       https://upload.wikimedia.org/wikipedia/commons/thumb/X/XX/Filename.jpg/330px-Filename.jpg
                                                                            ^^^^
                                                                            width
       → swap "330px-" for "660px-" / "990px-" to get higher-DPR variants.

     Spoonacular URL pattern:
       https://img.spoonacular.com/recipes/<id>-312x231.jpg
                                            ^^^^^^^
                                            w x h
       → swap "-312x231" for "-556x370" / "-636x393" for high-DPR.

     Local /images/<slug>.<ext> → no srcset (already optimal WebP/JPG/PNG).

     `tileSize` is one of 'tile' | 'hero' | 'thumb' and drives the `sizes`
     attribute hint so the browser knows how big the IMG renders at each
     viewport. */
function imageSrcset(url, tileSize = 'tile') {
  if (!url || url.startsWith('/') || url.includes(PROD_ORIGIN) || url.endsWith('cover2.jpg')) {
    return { srcset: '', sizes: '' };
  }

  // Wikipedia commons thumb pattern
  const wikiMatch = url.match(/^(.+\/)(\d+)px-([^/]+)$/);
  if (wikiMatch) {
    const [, prefix, , name] = wikiMatch;
    const srcset = [330, 660, 990]
      .map(w => `${prefix}${w}px-${name} ${w}w`)
      .join(', ');
    const sizes = tileSize === 'hero'
      ? '(max-width: 720px) 92vw, 480px'
      : tileSize === 'thumb'
      ? '(max-width: 600px) 33vw, 140px'
      : '(max-width: 420px) 92vw, (max-width: 720px) 46vw, 320px';
    return { srcset, sizes };
  }

  // Spoonacular pattern
  const spoonMatch = url.match(/^(.+\/recipes\/\d+)-(\d+)x(\d+)\.(jpg|png|webp)$/);
  if (spoonMatch) {
    const [, base, , , ext] = spoonMatch;
    // Spoonacular accepts: 312x231, 480x360, 556x370, 636x393, 1024x767
    const srcset = [
      `${base}-312x231.${ext} 312w`,
      `${base}-556x370.${ext} 556w`,
      `${base}-636x393.${ext} 636w`,
    ].join(', ');
    const sizes = tileSize === 'hero'
      ? '(max-width: 720px) 92vw, 480px'
      : tileSize === 'thumb'
      ? '(max-width: 600px) 33vw, 140px'
      : '(max-width: 420px) 92vw, (max-width: 720px) 46vw, 320px';
    return { srcset, sizes };
  }

  // Unknown URL pattern — return empty (browser uses src as-is)
  return { srcset: '', sizes: '' };
}

/* Image error handling: emit attributes that recover from transient Wikipedia
   404s instead of permanently removing the <img>. The hash-bucket path
   (/thumb/X/XX/Filename) can 404 when (a) the filename guess is slightly off
   or (b) the upstream thumb cache hasn't generated that size yet. In both
   cases Wikipedia's Special:FilePath redirector resolves by filename and
   server-generates the thumbnail — much more forgiving than the direct CDN
   URL. Only fall through to remove() after the fallback also fails.

   For non-Wikimedia URLs (img.spoonacular.com, local /images/, cover2.jpg),
   keep the existing remove-on-error behavior. */
function imgFallbackAttrs(url) {
  const wm = url.match(/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/thumb\/[^/]+\/[^/]+\/([^/]+)\/(\d+)px-/);
  if (!wm) return ' onerror="this.remove()"';
  const filename = wm[1];
  const width = wm[2];
  const fb = `https://en.wikipedia.org/wiki/Special:FilePath/${filename}?width=${width}`;
  return ` data-wm-fb="${fb}" onerror="if(this.dataset.wmFb){this.src=this.dataset.wmFb;this.dataset.wmFb='';}else{this.remove();}"`;
}

/* Convenience: build the attribute string `srcset="..." sizes="..."` to
   slot into an <img> tag. Empty string when no variants generated. */
function imgSrcsetAttrs(url, tileSize) {
  const { srcset, sizes } = imageSrcset(url, tileSize);
  if (!srcset) return '';
  return ` srcset="${srcset}" sizes="${sizes}"`;
}

/* ════════════════════════════════════════════════════════════════
   PLANS — 8 themed weekly plans with translations in 14 languages
   ════════════════════════════════════════════════════════════════ */
const PLANS = [
  {
    id: 'mediteranean', idEn: 'mediterranean', emoji: '🫒',
    costRON: '200–260', costEUR: '40–55',
    theme: {
      ro:'Mediteranean', en:'Mediterranean', es:'Mediterráneo', fr:'Méditerranéen',
      de:'Mediterran', pt:'Mediterrâneo', ru:'Средиземноморский', ar:'البحر المتوسط',
      zh:'地中海风味', ja:'地中海料理', hi:'भूमध्यसागरीय', tr:'Akdeniz', it:'Mediterraneo', ko:'지중해'
    },
    desc: {
      ro:'O săptămână de mese inspirate din bucătăriile Italiei, Greciei, Franței, Spaniei și Marocului. Ingrediente proaspete, ulei de măsline și savori autentice.',
      en:'A week inspired by Italian, Greek, French, Spanish and Moroccan cuisines. Fresh ingredients, olive oil and authentic Mediterranean flavours.',
      es:'Una semana inspirada en las cocinas italiana, griega, francesa, española y marroquí. Ingredientes frescos, aceite de oliva y sabores auténticos.',
      fr:'Une semaine inspirée des cuisines italienne, grecque, française, espagnole et marocaine. Ingrédients frais, huile d\'olive et saveurs authentiques.',
      de:'Eine Woche inspiriert von italienischer, griechischer, französischer, spanischer und marokkanischer Küche. Frische Zutaten und Olivenöl.',
      pt:'Uma semana inspirada nas cozinhas italiana, grega, francesa, espanhola e marroquina. Ingredientes frescos e azeite de oliva.',
      ru:'Неделя блюд итальянской, греческой, французской, испанской и марокканской кухни. Свежие продукты и оливковое масло.',
      ar:'أسبوع مستوحى من المطابخ الإيطالية واليونانية والفرنسية والإسبانية والمغربية. مكونات طازجة وزيت زيتون.',
      zh:'一周意大利、希腊、法国、西班牙和摩洛哥风味美食。新鲜食材，橄榄油，地中海正宗风味。',
      ja:'イタリア、ギリシャ、フランス、スペイン、モロッコの料理で彩る1週間。新鮮な食材とオリーブオイル。',
      hi:'इतालवी, ग्रीक, फ्रेंच, स्पेनिश और मोरक्कन व्यंजनों से प्रेरित एक सप्ताह। ताज़ी सामग्री और जैतून का तेल।',
      tr:'İtalyan, Yunan, Fransız, İspanyol ve Fas mutfaklarından ilham alan bir hafta. Taze malzemeler ve zeytinyağı.',
      it:'Una settimana ispirata alle cucine italiana, greca, francese, spagnola e marocchina. Ingredienti freschi e olio d\'oliva.',
      ko:'이탈리아, 그리스, 프랑스, 스페인, 모로코 요리에서 영감을 받은 한 주. 신선한 재료와 올리브 오일.'
    },
    lunches: ['Spaghetti Carbonara','Gazpacho','Quiche Lorraine','Risotto','Paella','Pasta e fagioli','Pasta alla Norma'],
    dinners: ['Moussaka','Ratatouille','Souvlaki','Chicken Tagine','Boeuf Bourguignon','Spanakopita','Harira'],
  },
  {
    id: 'asia', idEn: 'asian-fusion', emoji: '🍜',
    costRON: '240–300', costEUR: '50–65',
    theme: {
      ro:'Asia – Tur Culinar', en:'Asian Food Tour', es:'Asia – Tour Culinario', fr:'Asie – Tour Gastronomique',
      de:'Asien – Kulinarische Tour', pt:'Ásia – Tour Culinário', ru:'Азия – Кулинарный Тур', ar:'آسيا – جولة طهوية',
      zh:'亚洲美食之旅', ja:'アジア料理ツアー', hi:'एशिया – पाककला यात्रा', tr:'Asya – Mutfak Turu', it:'Asia – Tour Culinario', ko:'아시아 푸드 투어'
    },
    desc: {
      ro:'Japonia, Korea, Vietnam, Thailanda, India și Indonezia pe farfuria ta. Șapte zile de arome, mirodenii și tehnici culinare asiatice.',
      en:'Japan, Korea, Vietnam, Thailand, India and Indonesia on your plate. Seven days of Asian flavours, spices and cooking techniques.',
      es:'Japón, Corea, Vietnam, Tailandia, India e Indonesia en tu plato. Siete días de sabores asiáticos.',
      fr:'Japon, Corée, Vietnam, Thaïlande, Inde et Indonésie dans votre assiette. Sept jours de saveurs asiatiques.',
      de:'Japan, Korea, Vietnam, Thailand, Indien und Indonesien auf dem Teller. Sieben Tage asiatische Küche.',
      pt:'Japão, Coreia, Vietnã, Tailândia, Índia e Indonésia no seu prato. Sete dias de sabores asiáticos.',
      ru:'Япония, Корея, Вьетнам, Таиланд, Индия и Индонезия на тарелке. Семь дней азиатской кухни.',
      ar:'اليابان وكوريا وفيتنام وتايلاند والهند وإندونيسيا على طبقك. سبعة أيام من النكهات الآسيوية.',
      zh:'日本、韩国、越南、泰国、印度和印度尼西亚美食轮番登场。七天亚洲风味大赏。',
      ja:'日本、韓国、ベトナム、タイ、インド、インドネシアの料理を巡る7日間。',
      hi:'जापान, कोरिया, वियतनाम, थाईलैंड, भारत और इंडोनेशिया के व्यंजनों का सप्ताह।',
      tr:'Japonya, Kore, Vietnam, Tayland, Hindistan ve Endonezya\'nın tatlarıyla geçen yedi gün.',
      it:'Giappone, Corea, Vietnam, Tailandia, India e Indonesia nel tuo piatto. Sette giorni di sapori asiatici.',
      ko:'일본, 한국, 베트남, 태국, 인도, 인도네시아 요리를 맛보는 7일간의 여행.'
    },
    lunches: ['Pho','Bibimbap','Tom Yum','Pad Thai','Dhal','Kimbap','Okonomiyaki'],
    dinners: ['Sushi','Chicken Curry','Classic Japanese Ramen','Kung Pao Chicken','Nasi Goreng','Rendang','Tom Kha Gai'],
  },
  {
    id: 'buget', idEn: 'budget', emoji: '💰',
    costRON: '100–150', costEUR: '20–30',
    theme: {
      ro:'Meniu de Buget – sub 150 RON', en:'Budget Week – under €30', es:'Semana Económica – menos de €30',
      fr:'Semaine Économique – moins de €30', de:'Günstige Woche – unter €30', pt:'Semana Econômica – menos de €30',
      ru:'Бюджетная Неделя – до €30', ar:'أسبوع اقتصادي – أقل من €30',
      zh:'省钱一周 – €30以内', ja:'節約ウィーク – €30以内', hi:'बजट सप्ताह – €30 से कम',
      tr:'Ekonomik Hafta – €30\'dan az', it:'Settimana Economica – meno di €30', ko:'절약 한 주 – €30 미만'
    },
    desc: {
      ro:'Mese sănătoase și gustoase pentru 2 persoane cu un buget de maxim 150 RON pe săptămână. Ingrediente simple, preparare rapidă.',
      en:'Healthy and tasty meals for 2 people on a budget of under €30 per week. Simple ingredients, quick preparation.',
      es:'Comidas saludables y sabrosas para 2 personas con un presupuesto de menos de €30 por semana.',
      fr:'Des repas sains et savoureux pour 2 personnes avec un budget de moins de €30 par semaine.',
      de:'Gesunde und leckere Mahlzeiten für 2 Personen mit einem Budget von unter €30 pro Woche.',
      pt:'Refeições saudáveis e saborosas para 2 pessoas com orçamento de menos de €30 por semana.',
      ru:'Здоровые и вкусные блюда для 2 человек с бюджетом до €30 в неделю.',
      ar:'وجبات صحية ولذيذة لشخصين بميزانية أقل من €30 في الأسبوع.',
      zh:'两人份健康美味的一周饮食，预算€30以内，食材简单，制作快捷。',
      ja:'2人分、週€30以内の予算で健康的で美味しい料理を楽しむ1週間。',
      hi:'2 लोगों के लिए €30 से कम बजट में स्वस्थ और स्वादिष्ट भोजन।',
      tr:'2 kişi için haftalık €30\'dan az bütçeyle sağlıklı ve lezzetli yemekler.',
      it:'Pasti sani e gustosi per 2 persone con un budget inferiore a €30 a settimana.',
      ko:'주 €30 미만 예산으로 2인 건강하고 맛있는 식사를 즐기는 한 주.'
    },
    isBudget: true,
    lunches: budgetRecipes.slice(0,7).map(r=>r.name?.ro||r.name?.en),
    dinners: budgetRecipes.slice(7,14).map(r=>r.name?.ro||r.name?.en),
  },
  {
    id: 'est-european', idEn: 'eastern-european', emoji: '🥟',
    costRON: '160–210', costEUR: '33–45',
    theme: {
      ro:'Est-European – Gusturi de Acasă', en:'Eastern European Comfort Food', es:'Europa del Este – Sabores del Hogar',
      fr:'Europe de l\'Est – Saveurs du Foyer', de:'Osteuropa – Heimische Küche', pt:'Europa Oriental – Sabores Caseiros',
      ru:'Восточная Европа – Домашняя Кухня', ar:'أوروبا الشرقية – مذاق المنزل',
      zh:'东欧家常美食', ja:'東欧のホームフード', hi:'पूर्वी यूरोप – घर के स्वाद',
      tr:'Doğu Avrupa – Ev Yemekleri', it:'Europa dell\'Est – Sapori di Casa', ko:'동유럽 가정 요리'
    },
    desc: {
      ro:'Ciorbele, tocanele și preparatele tradiționale din România, Georgia, Ungaria și Polonia. Bucătărie de suflet, autentică și hrănitoare.',
      en:'Stews, soups and traditional dishes from Romania, Georgia, Hungary and Poland. Soul food, authentic and nourishing.',
      es:'Guisos, sopas y platos tradicionales de Rumanía, Georgia, Hungría y Polonia. Comida reconfortante y nutritiva.',
      fr:'Ragoûts, soupes et plats traditionnels de Roumanie, Géorgie, Hongrie et Pologne. Cuisine réconfortante et nourrissante.',
      de:'Eintöpfe, Suppen und traditionelle Gerichte aus Rumänien, Georgien, Ungarn und Polen. Herzhafte Hausmannskost.',
      pt:'Guisados, sopas e pratos tradicionais da Romênia, Geórgia, Hungria e Polônia. Culinária reconfortante.',
      ru:'Супы, рагу и традиционные блюда из Румынии, Грузии, Венгрии и Польши. Домашняя кухня.',
      ar:'يخنات وشوربات وأطباق تقليدية من رومانيا وجورجيا والمجر وبولندا.',
      zh:'来自罗马尼亚、格鲁吉亚、匈牙利和波兰的炖菜、汤品和传统菜肴。',
      ja:'ルーマニア、グルジア、ハンガリー、ポーランドの伝統料理。心温まるホームフード。',
      hi:'रोमानिया, जॉर्जिया, हंगरी और पोलैंड के पारंपरिक व्यंजन।',
      tr:'Romanya, Gürcistan, Macaristan ve Polonya\'nın geleneksel yemekleri.',
      it:'Stufati, zuppe e piatti tradizionali di Romania, Georgia, Ungheria e Polonia.',
      ko:'루마니아, 조지아, 헝가리, 폴란드의 전통 요리. 따뜻한 가정식.'
    },
    lunches: ['Tripe Soup','Borscht','Beans with Sausages','Goulash','Pierogi','Lobio','Chakhokhbili'],
    dinners: ['Chicken Kiev','Khinkali','Chicken Paprikash','Kotlet schabowy','Zeama','Okroshka','Solyanka'],
  },
  {
    id: 'tur-mondial', idEn: 'world-tour', emoji: '🌍',
    costRON: '190–250', costEUR: '40–53',
    theme: {
      ro:'Tur Mondial – 7 Țări în 7 Zile', en:'World Tour – 7 Countries in 7 Days',
      es:'Vuelta al Mundo – 7 Países en 7 Días', fr:'Tour du Monde – 7 Pays en 7 Jours',
      de:'Weltreise – 7 Länder in 7 Tagen', pt:'Volta ao Mundo – 7 Países em 7 Dias',
      ru:'Тур по Миру – 7 Стран за 7 Дней', ar:'جولة عالمية – 7 دول في 7 أيام',
      zh:'环球美食 – 7天7国', ja:'世界一周 – 7カ国7日間', hi:'विश्व भ्रमण – 7 देश 7 दिन',
      tr:'Dünya Turu – 7 Günde 7 Ülke', it:'Giro del Mondo – 7 Paesi in 7 Giorni', ko:'세계 일주 – 7일 7개국'
    },
    desc: {
      ro:'O masă pe zi din alt colț al lumii: SUA, Anglia, Germania, Jamaica, Nigeria, India și Israel. Diversitate culinară maximă.',
      en:'One meal a day from a different corner of the world: USA, UK, Germany, Jamaica, Nigeria, India and Israel.',
      es:'Una comida al día de un rincón diferente del mundo: EE.UU., Reino Unido, Alemania, Jamaica, Nigeria, India e Israel.',
      fr:'Un repas par jour d\'un coin différent du monde: USA, Angleterre, Allemagne, Jamaïque, Nigeria, Inde et Israël.',
      de:'Eine Mahlzeit täglich aus einem anderen Winkel der Welt: USA, England, Deutschland, Jamaika, Nigeria, Indien, Israel.',
      pt:'Uma refeição por dia de um canto diferente do mundo: EUA, Inglaterra, Alemanha, Jamaica, Nigéria, Índia e Israel.',
      ru:'Блюдо дня из разных уголков мира: США, Англия, Германия, Ямайка, Нигерия, Индия и Израиль.',
      ar:'وجبة يومية من زاوية مختلفة من العالم: الولايات المتحدة وإنجلترا وألمانيا وجامايكا ونيجيريا والهند وإسرائيل.',
      zh:'每天一道来自世界不同角落的美食：美国、英国、德国、牙买加、尼日利亚、印度和以色列。',
      ja:'毎日世界の別の地域の料理を: アメリカ、イギリス、ドイツ、ジャマイカ、ナイジェリア、インド、イスラエル。',
      hi:'हर दिन दुनिया के एक अलग कोने का भोजन: यूएसए, इंग्लैंड, जर्मनी, जमैका, नाइजीरिया, भारत और इजरायल।',
      tr:'Her gün dünyanın farklı bir köşesinden bir yemek: ABD, İngiltere, Almanya, Jamaika, Nijerya, Hindistan ve İsrail.',
      it:'Un pasto al giorno da un angolo diverso del mondo: USA, Inghilterra, Germania, Giamaica, Nigeria, India e Israele.',
      ko:'매일 세계 각지의 요리를 즐기는 일주일: 미국, 영국, 독일, 자메이카, 나이지리아, 인도, 이스라엘.'
    },
    lunches: ['Schnitzel','Tabbouleh','Hummus','Koshari','Shakshuka','Smørrebrød','Chakchouka'],
    dinners: ['Cheeseburger','Fish and Chips','Swedish Meatballs','Jerk Chicken','Jollof Rice','Biryani','Bobotie'],
  },
  {
    id: 'latin', idEn: 'latin-american', emoji: '🌶️',
    costRON: '200–260', costEUR: '42–55',
    theme: {
      ro:'America Latină – Picant & Colorat', en:'Latin America – Spicy & Vibrant',
      es:'América Latina – Picante y Colorido', fr:'Amérique Latine – Épicé et Vibrant',
      de:'Lateinamerika – Würzig & Bunt', pt:'América Latina – Picante & Colorido',
      ru:'Латинская Америка – Острое & Красочное', ar:'أمريكا اللاتينية – حار وملون',
      zh:'拉丁美洲 – 辛辣多彩', ja:'ラテンアメリカ – スパイシー＆カラフル',
      hi:'लैटिन अमेरिका – मसालेदार और रंगीन', tr:'Latin Amerika – Baharatlı ve Renkli',
      it:'America Latina – Piccante e Colorato', ko:'라틴 아메리카 – 매콤하고 화려한'
    },
    desc: {
      ro:'Mexic, Peru, Brazilia și Cuba pe farfuria ta. Fasole neagră, porumb, avocado, carne condimentată și culori vii.',
      en:'Mexico, Peru, Brazil and Cuba on your plate. Black beans, corn, avocado, spiced meats and vibrant colours.',
      es:'México, Perú, Brasil y Cuba en tu plato. Frijoles negros, maíz, aguacate y carnes especiadas.',
      fr:'Mexique, Pérou, Brésil et Cuba dans votre assiette. Haricots noirs, maïs, avocat et viandes épicées.',
      de:'Mexiko, Peru, Brasilien und Kuba auf dem Teller. Schwarze Bohnen, Mais, Avocado und gewürztes Fleisch.',
      pt:'México, Peru, Brasil e Cuba no seu prato. Feijão preto, milho, abacate e carnes temperadas.',
      ru:'Мексика, Перу, Бразилия и Куба на тарелке. Чёрные бобы, кукуруза, авокадо и пряное мясо.',
      ar:'المكسيك والبيرو والبرازيل وكوبا على طبقك. الفاصوليا السوداء والذرة والأفوكادو واللحم المتبل.',
      zh:'墨西哥、秘鲁、巴西和古巴美食齐聚一盘。黑豆、玉米、牛油果和香辣肉类。',
      ja:'メキシコ、ペルー、ブラジル、キューバの料理が一皿に。ブラックビーンズ、コーン、アボカド。',
      hi:'मेक्सिको, पेरू, ब्राज़ील और क्यूबा के व्यंजन। काली फलियाँ, मक्का, एवोकाडो।',
      tr:'Meksika, Peru, Brezilya ve Küba\'nın tatları. Siyah fasulye, mısır, avokado ve baharatlı etler.',
      it:'Messico, Perù, Brasile e Cuba nel tuo piatto. Fagioli neri, mais, avocado e carni speziate.',
      ko:'멕시코, 페루, 브라질, 쿠바 요리의 향연. 검은콩, 옥수수, 아보카도, 매콤한 고기.'
    },
    lunches: ['Tamale','Arroz Chaufa','Lomo Saltado','Picadillo','Pozole','Pupusa','Arepa'],
    dinners: ['Tacos','Feijoada','Chili con carne','Moqueca','Ropa Vieja','Bandeja Paisa','Chiles en nogada'],
  },
  {
    id: 'vegetarian', idEn: 'vegetarian', emoji: '🌱',
    costRON: '150–200', costEUR: '31–42',
    theme: {
      ro:'Vegetarian – Colorat & Sănătos', en:'Vegetarian – Colourful & Healthy',
      es:'Vegetariano – Colorido y Saludable', fr:'Végétarien – Coloré & Sain',
      de:'Vegetarisch – Bunt & Gesund', pt:'Vegetariano – Colorido e Saudável',
      ru:'Вегетарианский – Красочный и Полезный', ar:'نباتي – ملون وصحي',
      zh:'素食 – 多彩健康', ja:'ベジタリアン – カラフル＆ヘルシー',
      hi:'शाकाहारी – रंगीन और स्वस्थ', tr:'Vejetaryen – Renkli ve Sağlıklı',
      it:'Vegetariano – Colorato e Sano', ko:'채식 – 다채롭고 건강한'
    },
    desc: {
      ro:'O săptămână fără carne, bogată în proteine vegetale, legume proaspete și savori din toată lumea. Perfect pentru a reduce consumul de carne.',
      en:'A meat-free week rich in plant proteins, fresh vegetables and global flavours. Perfect for reducing meat consumption.',
      es:'Una semana sin carne, rica en proteínas vegetales y verduras frescas. Perfecta para reducir el consumo de carne.',
      fr:'Une semaine sans viande, riche en protéines végétales et légumes frais. Idéal pour réduire la consommation de viande.',
      de:'Eine fleischfreie Woche mit Pflanzeneiweiß, frischem Gemüse und weltweiten Aromen.',
      pt:'Uma semana sem carne, rica em proteínas vegetais e legumes frescos. Perfeita para reduzir o consumo de carne.',
      ru:'Неделя без мяса, богатая растительными белками и свежими овощами со всего мира.',
      ar:'أسبوع بدون لحوم، غني بالبروتينات النباتية والخضروات الطازجة.',
      zh:'无肉的一周，富含植物蛋白、新鲜蔬菜，汇聚世界各地的素食风味。',
      ja:'肉なしの1週間。植物性タンパク質と新鮮な野菜、世界各地の風味。',
      hi:'मांस रहित सप्ताह, पौधे-आधारित प्रोटीन और ताज़ी सब्जियों से भरपूर।',
      tr:'Etsiz bir hafta, bitkisel proteinler ve taze sebzelerle dolu.',
      it:'Una settimana senza carne, ricca di proteine vegetali e verdure fresche.',
      ko:'고기 없는 한 주, 식물성 단백질과 신선한 채소로 가득한 건강한 식사.'
    },
    lunches: ['Gazpacho','Tabbouleh','Ratatouille','Dhal','Shakshuka','Fasolada','Pasta alla Norma'],
    dinners: ['Moussaka','Pad Thai','Rajma','Hummus','Bibimbap','Spanakopita','Mapo Tofu'],
  },
  {
    id: 'rapid', idEn: 'quick-easy', emoji: '⚡',
    costRON: '170–220', costEUR: '35–47',
    theme: {
      ro:'Rapid & Simplu – max. 30 min', en:'Quick & Easy – max 30 min',
      es:'Rápido y Fácil – máx. 30 min', fr:'Rapide et Facile – max. 30 min',
      de:'Schnell & Einfach – max. 30 Min.', pt:'Rápido e Fácil – máx. 30 min',
      ru:'Быстро и Просто – до 30 мин', ar:'سريع وسهل – 30 دقيقة',
      zh:'快手美食 – 30分钟搞定', ja:'クイック＆イージー – 最大30分',
      hi:'त्वरित और आसान – 30 मिनट', tr:'Hızlı ve Kolay – maks. 30 dk',
      it:'Veloce e Facile – max. 30 min', ko:'빠르고 쉬운 – 최대 30분'
    },
    desc: {
      ro:'Mese delicioase în cel mult 30 de minute. Perfecte pentru zilele aglomerate când vrei să mănânci bine fără să petreci ore în bucătărie.',
      en:'Delicious meals ready in 30 minutes or less. Perfect for busy days when you want to eat well without spending hours in the kitchen.',
      es:'Comidas deliciosas listas en 30 minutos o menos. Perfectas para días ocupados.',
      fr:'Des repas délicieux prêts en 30 minutes ou moins. Parfaits pour les journées chargées.',
      de:'Leckere Mahlzeiten in 30 Minuten oder weniger. Für geschäftige Tage.',
      pt:'Refeições deliciosas prontas em 30 minutos ou menos. Perfeitas para dias agitados.',
      ru:'Вкусные блюда за 30 минут или меньше. Для занятых дней.',
      ar:'وجبات لذيذة جاهزة في 30 دقيقة أو أقل. مثالية للأيام المزدحمة.',
      zh:'30分钟或更短时间内完成的美味料理。忙碌日子的完美选择。',
      ja:'30分以内で完成する美味しい料理。忙しい日にぴったり。',
      hi:'30 मिनट या उससे कम में तैयार स्वादिष्ट भोजन। व्यस्त दिनों के लिए।',
      tr:'30 dakika veya daha kısa sürede hazır lezzetli yemekler. Yoğun günler için.',
      it:'Pasti deliziosi pronti in 30 minuti o meno. Perfetti per le giornate impegnate.',
      ko:'30분 이내로 완성되는 맛있는 요리. 바쁜 날을 위한 완벽한 선택.'
    },
    lunches: ['Spaghetti Carbonara','Tacos','Pad Thai','Shakshuka','Dhal','Schnitzel','Okonomiyaki'],
    dinners: ['Kung Pao Chicken','Pho','Tom Yum','Chicken Curry','Nasi Goreng','Cheeseburger','Fish and Chips'],
  },
];

/* ════════════════════════════════════════════════════════════════
   LANGUAGE CONFIGS — UI strings + URL structure for all 14 langs
   ════════════════════════════════════════════════════════════════ */
const LANG_CONFIGS = {
  ro: {
    code:'ro', dir:'/ro/meniu-saptamanal', appDir:'/ro',
    homeLabel:'Acasă', sectionLabel:'Meniuri Săptămânale', appLabel:'Aplicație',
    planBadge:'Meniu săptămânal', planHeading:'Planul complet al săptămânii',
    dayTh:'Ziua', lunchTh:'Prânz', dinnerTh:'Cină',
    persons:'2 persoane', weeks:'7 zile',
    costUnit:'RON / săpt.', costValue: p=>p.costRON,
    ingredientsLabel: n=>`${n} ingrediente`,
    openAppLabel:'Deschide în aplicație &amp; editează',
    shoppingAnchor:'lista-cumparaturi',
    shoppingLabel:'Vezi lista de cumpărături',
    shoppingHeading:'Lista completă de cumpărături',
    shoppingIntro: (plan,n)=>`Toate ingredientele necesare, sortate alfabetic. Estimat <strong>~${plan.costRON} RON</strong> pentru 2 persoane.`,
    openPlanLabel:'Deschide planul în aplicație',
    openPlanSub:'Personalizează și descarcă PDF gratuit',
    otherPlansHeading:'Alte meniuri săptămânale',
    seeAll:'Vezi toate cele 8 meniuri →',
    seoHeading:'De ce să planifici mesele în avans?',
    seoBullets:['Reduci risipa alimentară cu până la <strong>30%</strong>','Economisești <strong>timp și bani</strong> — o singură tură','Mănânci mai <strong>sănătos</strong>','Elimini stresul zilnic al întrebării „ce gătesc azi?"'],
    indexTitle:'Meniuri Săptămânale cu Liste de Cumpărături – 8 Planuri | Meal-Planner.ro',
    indexDesc:'8 meniuri săptămânale complete cu liste de cumpărături și costuri estimate. Mediteranean, Asian, Buget, Vegetarian și altele.',
    indexH1:'Meniuri Săptămânale cu <span class="accent">Liste de Cumpărături</span>',
    indexH1raw:'Meniuri Săptămânale cu <span class="accent">Liste de Cumpărături</span>',
    indexSubdesc:'8 planuri de mese complete, fiecare cu 14 rețete, lista de cumpărături sortată și costul estimat.',
    indexViewPlan:'Vezi planul',
    indexSeoH:'De ce să folosești un planificator săptămânal?',
    indexSeoP:'Planificarea meselor este una din cele mai eficiente metode de a mânca sănătos și de a economisi bani.',
    metaTitle: (theme)=>`Meniu Săptămânal ${theme} – Listă Cumpărături | Meal-Planner.ro`,
    days:['Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă','Duminică'],
    recipeBase:'/ro/retete/',
    planIdFn: p=>p.id,
  },
  en: {
    code:'en', dir:'/en/weekly-meal-plan', appDir:'/en',
    homeLabel:'Home', sectionLabel:'Weekly Meal Plans', appLabel:'App',
    planBadge:'Weekly meal plan', planHeading:'Full weekly plan',
    dayTh:'Day', lunchTh:'Lunch', dinnerTh:'Dinner',
    persons:'2 people', weeks:'7 days',
    costUnit:'/ week', costValue: p=>`€${p.costEUR}`,
    ingredientsLabel: n=>`${n} ingredients`,
    openAppLabel:'Open in app &amp; customise',
    shoppingAnchor:'shopping-list-section',
    shoppingLabel:'See shopping list',
    shoppingHeading:'Complete shopping list',
    shoppingIntro: (plan,n)=>`All ingredients for the week, sorted alphabetically. Estimated <strong>~€${plan.costEUR}</strong> for 2 people.`,
    openPlanLabel:'Open plan in app',
    openPlanSub:'Customise recipes and download free PDF',
    otherPlansHeading:'More weekly plans',
    seeAll:'See all 8 plans →',
    seoHeading:'Why plan meals in advance?',
    seoBullets:['Reduce food waste by up to <strong>30%</strong>','Save <strong>time and money</strong> — one shopping trip','Eat <strong>healthier</strong>','Eliminate the daily "what should I cook?" stress'],
    indexTitle:'Free Weekly Meal Plans with Shopping Lists – 8 Themes | Meal-Planner.ro',
    indexDesc:'8 complete weekly meal plans with shopping lists and cost estimates. Mediterranean, Asian, Budget, Vegetarian and more — all free.',
    indexH1raw:'Free Weekly Meal Plans with <span class="accent">Shopping Lists</span>',
    indexSubdesc:'8 complete meal plans, each with 14 recipes, a sorted shopping list and estimated cost.',
    indexViewPlan:'View plan',
    indexSeoH:'Why use a weekly meal planner?',
    indexSeoP:'Planning meals in advance is one of the most effective ways to eat healthier and save money.',
    metaTitle: (theme)=>`Weekly Meal Plan – ${theme} | Meal-Planner.ro`,
    days:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    recipeBase:'/en/recipes/',
    planIdFn: p=>p.idEn,
  },
  es: {
    code:'es', dir:'/es/plan-semanal', appDir:'/',
    homeLabel:'Inicio', sectionLabel:'Planes Semanales', appLabel:'App',
    planBadge:'Plan de comidas semanal', planHeading:'Plan semanal completo',
    dayTh:'Día', lunchTh:'Almuerzo', dinnerTh:'Cena',
    persons:'2 personas', weeks:'7 días',
    costUnit:'/ semana', costValue: p=>`€${p.costEUR}`,
    ingredientsLabel: n=>`${n} ingredientes`,
    openAppLabel:'Abrir en la app &amp; personalizar',
    shoppingAnchor:'lista-compras',
    shoppingLabel:'Ver lista de compras',
    shoppingHeading:'Lista de compras completa',
    shoppingIntro: (plan,n)=>`Todos los ingredientes de la semana. Estimado <strong>~€${plan.costEUR}</strong> para 2 personas.`,
    openPlanLabel:'Abrir plan en la app',
    openPlanSub:'Personaliza recetas y descarga PDF gratis',
    otherPlansHeading:'Más planes semanales',
    seeAll:'Ver los 8 planes →',
    seoHeading:'¿Por qué planificar las comidas?',
    seoBullets:['Reduce el desperdicio de alimentos hasta un <strong>30%</strong>','Ahorra <strong>tiempo y dinero</strong>','Come de forma más <strong>saludable</strong>','Elimina el estrés diario de "¿qué cocino hoy?"'],
    indexTitle:'Planes de Comida Semanales con Listas de Compra – 8 Temas | Meal-Planner.ro',
    indexDesc:'8 planes de comida semanales completos con listas de compra y costes estimados.',
    indexH1raw:'Planes Semanales con <span class="accent">Listas de Compra</span>',
    indexSubdesc:'8 planes completos, cada uno con 14 recetas, lista de compra ordenada y coste estimado.',
    indexViewPlan:'Ver plan',
    indexSeoH:'¿Por qué usar un planificador semanal?',
    indexSeoP:'Planificar las comidas es una de las formas más eficaces de comer más sano y ahorrar dinero.',
    metaTitle: (theme)=>`Plan Semanal – ${theme} | Meal-Planner.ro`,
    days:['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'],
    recipeBase:'/ro/retete/',
    planIdFn: p=>p.idEn,
  },
  fr: {
    code:'fr', dir:'/fr/plan-semaine', appDir:'/',
    homeLabel:'Accueil', sectionLabel:'Plans de la Semaine', appLabel:'Application',
    planBadge:'Plan repas hebdomadaire', planHeading:'Plan complet de la semaine',
    dayTh:'Jour', lunchTh:'Déjeuner', dinnerTh:'Dîner',
    persons:'2 personnes', weeks:'7 jours',
    costUnit:'/ semaine', costValue: p=>`€${p.costEUR}`,
    ingredientsLabel: n=>`${n} ingrédients`,
    openAppLabel:'Ouvrir dans l\'app &amp; personnaliser',
    shoppingAnchor:'liste-courses',
    shoppingLabel:'Voir la liste de courses',
    shoppingHeading:'Liste de courses complète',
    shoppingIntro: (plan,n)=>`Tous les ingrédients de la semaine. Estimé <strong>~€${plan.costEUR}</strong> pour 2 personnes.`,
    openPlanLabel:'Ouvrir le plan dans l\'app',
    openPlanSub:'Personnalisez et téléchargez le PDF gratuitement',
    otherPlansHeading:'Autres plans hebdomadaires',
    seeAll:'Voir les 8 plans →',
    seoHeading:'Pourquoi planifier les repas ?',
    seoBullets:['Réduisez le gaspillage alimentaire de <strong>30%</strong>','Économisez <strong>temps et argent</strong>','Mangez plus <strong>sainement</strong>','Éliminez le stress quotidien de "que cuisiner ?"'],
    indexTitle:'Plans Repas Hebdomadaires avec Listes de Courses – 8 Thèmes | Meal-Planner.ro',
    indexDesc:'8 plans repas hebdomadaires complets avec listes de courses et coûts estimés.',
    indexH1raw:'Plans Hebdomadaires avec <span class="accent">Listes de Courses</span>',
    indexSubdesc:'8 plans complets, chacun avec 14 recettes, une liste de courses et un coût estimé.',
    indexViewPlan:'Voir le plan',
    indexSeoH:'Pourquoi utiliser un planificateur hebdomadaire ?',
    indexSeoP:'Planifier les repas à l\'avance est l\'un des moyens les plus efficaces de manger sainement.',
    metaTitle: (theme)=>`Plan de Repas – ${theme} | Meal-Planner.ro`,
    days:['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'],
    recipeBase:'/ro/retete/',
    planIdFn: p=>p.idEn,
  },
  de: {
    code:'de', dir:'/de/wochenplan', appDir:'/',
    homeLabel:'Startseite', sectionLabel:'Wochenpläne', appLabel:'App',
    planBadge:'Wochenspeiseplan', planHeading:'Vollständiger Wochenplan',
    dayTh:'Tag', lunchTh:'Mittagessen', dinnerTh:'Abendessen',
    persons:'2 Personen', weeks:'7 Tage',
    costUnit:'/ Woche', costValue: p=>`€${p.costEUR}`,
    ingredientsLabel: n=>`${n} Zutaten`,
    openAppLabel:'In App öffnen &amp; anpassen',
    shoppingAnchor:'einkaufsliste',
    shoppingLabel:'Einkaufsliste anzeigen',
    shoppingHeading:'Vollständige Einkaufsliste',
    shoppingIntro: (plan,n)=>`Alle Zutaten der Woche. Geschätzt <strong>~€${plan.costEUR}</strong> für 2 Personen.`,
    openPlanLabel:'Plan in App öffnen',
    openPlanSub:'Rezepte anpassen und PDF kostenlos herunterladen',
    otherPlansHeading:'Weitere Wochenpläne',
    seeAll:'Alle 8 Pläne anzeigen →',
    seoHeading:'Warum Mahlzeiten im Voraus planen?',
    seoBullets:['Lebensmittelverschwendung bis zu <strong>30%</strong> reduzieren','<strong>Zeit und Geld</strong> sparen','<strong>Gesünder</strong> essen','Täglichen Stress beim "Was koche ich?" eliminieren'],
    indexTitle:'Wochenspeisepläne mit Einkaufslisten – 8 Themen | Meal-Planner.ro',
    indexDesc:'8 vollständige Wochenspeisepläne mit Einkaufslisten und Kostenabschätzungen.',
    indexH1raw:'Wochenpläne mit <span class="accent">Einkaufslisten</span>',
    indexSubdesc:'8 vollständige Pläne, jeder mit 14 Rezepten, einer sortierten Einkaufsliste und Kostenabschätzung.',
    indexViewPlan:'Plan ansehen',
    indexSeoH:'Warum einen Wochenplaner verwenden?',
    indexSeoP:'Die Mahlzeitenplanung im Voraus ist eine der effektivsten Methoden, gesünder zu essen.',
    metaTitle: (theme)=>`Wochenplan – ${theme} | Meal-Planner.ro`,
    days:['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'],
    recipeBase:'/ro/retete/',
    planIdFn: p=>p.idEn,
  },
  pt: {
    code:'pt', dir:'/pt/plano-semanal', appDir:'/',
    homeLabel:'Início', sectionLabel:'Planos Semanais', appLabel:'App',
    planBadge:'Plano de refeições semanal', planHeading:'Plano semanal completo',
    dayTh:'Dia', lunchTh:'Almoço', dinnerTh:'Jantar',
    persons:'2 pessoas', weeks:'7 dias',
    costUnit:'/ semana', costValue: p=>`€${p.costEUR}`,
    ingredientsLabel: n=>`${n} ingredientes`,
    openAppLabel:'Abrir na app &amp; personalizar',
    shoppingAnchor:'lista-compras',
    shoppingLabel:'Ver lista de compras',
    shoppingHeading:'Lista de compras completa',
    shoppingIntro: (plan,n)=>`Todos os ingredientes da semana. Estimado <strong>~€${plan.costEUR}</strong> para 2 pessoas.`,
    openPlanLabel:'Abrir plano na app',
    openPlanSub:'Personalize receitas e baixe PDF grátis',
    otherPlansHeading:'Mais planos semanais',
    seeAll:'Ver todos os 8 planos →',
    seoHeading:'Por que planejar as refeições?',
    seoBullets:['Reduza o desperdício de alimentos em <strong>30%</strong>','Economize <strong>tempo e dinheiro</strong>','Coma de forma mais <strong>saudável</strong>','Elimine o estresse diário de "o que cozinhar?"'],
    indexTitle:'Planos de Refeições Semanais com Listas de Compras | Meal-Planner.ro',
    indexDesc:'8 planos semanais completos com listas de compras e custos estimados.',
    indexH1raw:'Planos Semanais com <span class="accent">Listas de Compras</span>',
    indexSubdesc:'8 planos completos, cada um com 14 receitas, lista de compras e custo estimado.',
    indexViewPlan:'Ver plano',
    indexSeoH:'Por que usar um planejador semanal?',
    indexSeoP:'Planejar as refeições com antecedência é uma das formas mais eficazes de comer melhor.',
    metaTitle: (theme)=>`Plano Semanal – ${theme} | Meal-Planner.ro`,
    days:['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'],
    recipeBase:'/ro/retete/',
    planIdFn: p=>p.idEn,
  },
  ru: {
    code:'ru', dir:'/ru/nedelnoe-menyu', appDir:'/',
    homeLabel:'Главная', sectionLabel:'Недельные меню', appLabel:'Приложение',
    planBadge:'Недельный план питания', planHeading:'Полный недельный план',
    dayTh:'День', lunchTh:'Обед', dinnerTh:'Ужин',
    persons:'2 человека', weeks:'7 дней',
    costUnit:'/ неделю', costValue: p=>`€${p.costEUR}`,
    ingredientsLabel: n=>`${n} ингредиентов`,
    openAppLabel:'Открыть в приложении',
    shoppingAnchor:'spisok-pokupok',
    shoppingLabel:'Список покупок',
    shoppingHeading:'Полный список покупок',
    shoppingIntro: (plan,n)=>`Все ингредиенты недели. Примерно <strong>~€${plan.costEUR}</strong> на 2 человека.`,
    openPlanLabel:'Открыть план',
    openPlanSub:'Настройте рецепты и скачайте PDF бесплатно',
    otherPlansHeading:'Другие недельные меню',
    seeAll:'Все 8 меню →',
    seoHeading:'Зачем планировать питание?',
    seoBullets:['Снижает пищевые отходы на <strong>30%</strong>','Экономит <strong>время и деньги</strong>','Помогает питаться <strong>здоровее</strong>','Убирает ежедневный стресс'],
    indexTitle:'Недельные меню с Cписками покупок | Meal-Planner.ro',
    indexDesc:'8 полных недельных планов питания со списками покупок и оценками стоимости.',
    indexH1raw:'Недельные меню со <span class="accent">Списками покупок</span>',
    indexSubdesc:'8 планов с 14 рецептами каждый, отсортированным списком и оценкой стоимости.',
    indexViewPlan:'Смотреть план',
    indexSeoH:'Почему стоит планировать питание?',
    indexSeoP:'Планирование питания — один из эффективных способов питаться здоровее.',
    metaTitle: (theme)=>`Недельное меню – ${theme} | Meal-Planner.ro`,
    days:['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'],
    recipeBase:'/ro/retete/',
    planIdFn: p=>p.idEn,
  },
  ar: {
    code:'ar', dir:'/ar/khitat-usbuiya', appDir:'/', dir_attr:'rtl',
    homeLabel:'الرئيسية', sectionLabel:'الخطط الأسبوعية', appLabel:'التطبيق',
    planBadge:'خطة وجبات أسبوعية', planHeading:'الخطة الأسبوعية الكاملة',
    dayTh:'اليوم', lunchTh:'الغداء', dinnerTh:'العشاء',
    persons:'شخصان', weeks:'٧ أيام',
    costUnit:'/ أسبوع', costValue: p=>`€${p.costEUR}`,
    ingredientsLabel: n=>`${n} مكونات`,
    openAppLabel:'فتح في التطبيق',
    shoppingAnchor:'qaima-tasawuk',
    shoppingLabel:'عرض قائمة التسوق',
    shoppingHeading:'قائمة التسوق الكاملة',
    shoppingIntro: (plan,n)=>`جميع المكونات للأسبوع. تقدير <strong>~€${plan.costEUR}</strong> لشخصين.`,
    openPlanLabel:'فتح الخطة في التطبيق',
    openPlanSub:'خصّص الوصفات وحمّل PDF مجاناً',
    otherPlansHeading:'خطط أسبوعية أخرى',
    seeAll:'عرض جميع الخطط الـ ٨ →',
    seoHeading:'لماذا تخطط وجباتك مسبقاً؟',
    seoBullets:['تقليل هدر الطعام حتى <strong>٣٠٪</strong>','توفير <strong>الوقت والمال</strong>','تناول طعام <strong>أكثر صحة</strong>','إزالة التوتر اليومي'],
    indexTitle:'خطط وجبات أسبوعية مع قوائم تسوق | Meal-Planner.ro',
    indexDesc:'٨ خطط أسبوعية كاملة مع قوائم تسوق وتقديرات تكلفة.',
    indexH1raw:'خطط أسبوعية مع <span class="accent">قوائم التسوق</span>',
    indexSubdesc:'٨ خطط كاملة، كل منها يحتوي على ١٤ وصفة وقائمة تسوق وتقدير التكلفة.',
    indexViewPlan:'عرض الخطة',
    indexSeoH:'لماذا تستخدم مخططاً أسبوعياً؟',
    indexSeoP:'التخطيط المسبق للوجبات من أفضل الطرق لتناول طعام صحي وتوفير المال.',
    metaTitle: (theme)=>`الخطة الأسبوعية – ${theme} | Meal-Planner.ro`,
    days:['الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت','الأحد'],
    recipeBase:'/ro/retete/',
    planIdFn: p=>p.idEn,
  },
  zh: {
    code:'zh', dir:'/zh/zhoujicaidan', appDir:'/',
    homeLabel:'首页', sectionLabel:'每周食谱计划', appLabel:'应用',
    planBadge:'每周饮食计划', planHeading:'完整的每周计划',
    dayTh:'日期', lunchTh:'午餐', dinnerTh:'晚餐',
    persons:'2人份', weeks:'7天',
    costUnit:'/ 周', costValue: p=>`€${p.costEUR}`,
    ingredientsLabel: n=>`${n}种食材`,
    openAppLabel:'在应用中打开',
    shoppingAnchor:'gouwu-qingdan',
    shoppingLabel:'查看购物清单',
    shoppingHeading:'完整购物清单',
    shoppingIntro: (plan,n)=>`本周所需所有食材，按字母排序。2人份预计 <strong>~€${plan.costEUR}</strong>。`,
    openPlanLabel:'在应用中打开计划',
    openPlanSub:'自定义食谱并免费下载PDF',
    otherPlansHeading:'更多每周计划',
    seeAll:'查看全部8个计划 →',
    seoHeading:'为什么要提前规划饮食？',
    seoBullets:['减少食物浪费高达 <strong>30%</strong>','节省<strong>时间和金钱</strong>','饮食更<strong>健康</strong>','消除每天"今天吃什么"的烦恼'],
    indexTitle:'每周饮食计划与购物清单 | Meal-Planner.ro',
    indexDesc:'8个完整的每周饮食计划，附购物清单和费用估算。',
    indexH1raw:'每周饮食计划与<span class="accent">购物清单</span>',
    indexSubdesc:'8个完整计划，每个包含14道食谱、购物清单和费用估算。',
    indexViewPlan:'查看计划',
    indexSeoH:'为什么使用每周饮食规划器？',
    indexSeoP:'提前规划饮食是健康饮食和节省开支的最有效方法之一。',
    metaTitle: (theme)=>`每周饮食计划 – ${theme} | Meal-Planner.ro`,
    days:['周一','周二','周三','周四','周五','周六','周日'],
    recipeBase:'/ro/retete/',
    planIdFn: p=>p.idEn,
  },
  ja: {
    code:'ja', dir:'/ja/weekly-menu', appDir:'/',
    homeLabel:'ホーム', sectionLabel:'週間献立', appLabel:'アプリ',
    planBadge:'週間食事プラン', planHeading:'1週間の完全なプラン',
    dayTh:'曜日', lunchTh:'昼食', dinnerTh:'夕食',
    persons:'2人分', weeks:'7日間',
    costUnit:'/ 週', costValue: p=>`€${p.costEUR}`,
    ingredientsLabel: n=>`${n}種類の食材`,
    openAppLabel:'アプリで開く',
    shoppingAnchor:'kaimono-list',
    shoppingLabel:'買い物リストを見る',
    shoppingHeading:'完全な買い物リスト',
    shoppingIntro: (plan,n)=>`今週必要な食材。2人分 <strong>~€${plan.costEUR}</strong> 程度。`,
    openPlanLabel:'アプリでプランを開く',
    openPlanSub:'レシピをカスタマイズして無料PDFをダウンロード',
    otherPlansHeading:'他の週間プラン',
    seeAll:'全8プランを見る →',
    seoHeading:'なぜ食事を計画すべきか？',
    seoBullets:['食品廃棄を <strong>30%</strong> 削減','<strong>時間とお金</strong> の節約','より<strong>健康的</strong>な食事','毎日の「何を作ろう？」というストレスを解消'],
    indexTitle:'週間献立プランと買い物リスト | Meal-Planner.ro',
    indexDesc:'8つの完全な週間食事プラン、買い物リスト付き。',
    indexH1raw:'週間献立と<span class="accent">買い物リスト</span>',
    indexSubdesc:'8つのプラン、それぞれ14レシピ、買い物リスト、費用概算付き。',
    indexViewPlan:'プランを見る',
    indexSeoH:'なぜ週間プランナーを使うのか？',
    indexSeoP:'食事を事前に計画することは、健康的に食べるための最も効果的な方法の一つです。',
    metaTitle: (theme)=>`週間プラン – ${theme} | Meal-Planner.ro`,
    days:['月曜日','火曜日','水曜日','木曜日','金曜日','土曜日','日曜日'],
    recipeBase:'/ro/retete/',
    planIdFn: p=>p.idEn,
  },
  hi: {
    code:'hi', dir:'/hi/weekly-plan', appDir:'/',
    homeLabel:'होम', sectionLabel:'साप्ताहिक भोजन योजना', appLabel:'ऐप',
    planBadge:'साप्ताहिक भोजन योजना', planHeading:'पूरी साप्ताहिक योजना',
    dayTh:'दिन', lunchTh:'दोपहर का भोजन', dinnerTh:'रात का खाना',
    persons:'2 लोग', weeks:'7 दिन',
    costUnit:'/ सप्ताह', costValue: p=>`€${p.costEUR}`,
    ingredientsLabel: n=>`${n} सामग्री`,
    openAppLabel:'ऐप में खोलें',
    shoppingAnchor:'kharid-suchi',
    shoppingLabel:'खरीदारी सूची देखें',
    shoppingHeading:'पूरी खरीदारी सूची',
    shoppingIntro: (plan,n)=>`सप्ताह की सभी सामग्री। 2 लोगों के लिए अनुमानित <strong>~€${plan.costEUR}</strong>।`,
    openPlanLabel:'ऐप में योजना खोलें',
    openPlanSub:'रेसिपी कस्टमाइज़ करें और मुफ्त PDF डाउनलोड करें',
    otherPlansHeading:'अन्य साप्ताहिक योजनाएं',
    seeAll:'सभी 8 योजनाएं देखें →',
    seoHeading:'भोजन की योजना क्यों बनाएं?',
    seoBullets:['खाद्य अपशिष्ट <strong>30%</strong> तक कम करें','<strong>समय और पैसा</strong> बचाएं','अधिक <strong>स्वस्थ</strong> खाएं','रोज़ "आज क्या पकाएं?" की परेशानी खत्म करें'],
    indexTitle:'साप्ताहिक भोजन योजनाएं और खरीदारी सूची | Meal-Planner.ro',
    indexDesc:'8 पूर्ण साप्ताहिक भोजन योजनाएं, खरीदारी सूची और लागत अनुमान के साथ।',
    indexH1raw:'साप्ताहिक योजनाएं और <span class="accent">खरीदारी सूची</span>',
    indexSubdesc:'8 पूर्ण योजनाएं, प्रत्येक में 14 रेसिपी, खरीदारी सूची और लागत अनुमान।',
    indexViewPlan:'योजना देखें',
    indexSeoH:'साप्ताहिक प्लानर क्यों उपयोग करें?',
    indexSeoP:'पहले से भोजन की योजना बनाना स्वस्थ खाने और पैसे बचाने के सबसे प्रभावी तरीकों में से एक है।',
    metaTitle: (theme)=>`साप्ताहिक योजना – ${theme} | Meal-Planner.ro`,
    days:['सोमवार','मंगलवार','बुधवार','गुरुवार','शुक्रवार','शनिवार','रविवार'],
    recipeBase:'/ro/retete/',
    planIdFn: p=>p.idEn,
  },
  tr: {
    code:'tr', dir:'/tr/haftalik-menu', appDir:'/',
    homeLabel:'Ana Sayfa', sectionLabel:'Haftalık Yemek Planları', appLabel:'Uygulama',
    planBadge:'Haftalık yemek planı', planHeading:'Tam haftalık plan',
    dayTh:'Gün', lunchTh:'Öğle Yemeği', dinnerTh:'Akşam Yemeği',
    persons:'2 kişi', weeks:'7 gün',
    costUnit:'/ hafta', costValue: p=>`€${p.costEUR}`,
    ingredientsLabel: n=>`${n} malzeme`,
    openAppLabel:'Uygulamada aç',
    shoppingAnchor:'alisveris-listesi',
    shoppingLabel:'Alışveriş listesini gör',
    shoppingHeading:'Tam alışveriş listesi',
    shoppingIntro: (plan,n)=>`Haftanın tüm malzemeleri. 2 kişi için yaklaşık <strong>~€${plan.costEUR}</strong>.`,
    openPlanLabel:'Planı uygulamada aç',
    openPlanSub:'Tarifleri özelleştir ve ücretsiz PDF indir',
    otherPlansHeading:'Diğer haftalık planlar',
    seeAll:'Tüm 8 planı gör →',
    seoHeading:'Yemekleri neden önceden planlayın?',
    seoBullets:['Gıda israfını <strong>%30</strong> azalt','<strong>Zaman ve para</strong> tasarrufu','Daha <strong>sağlıklı</strong> beslen','Günlük "bugün ne pişirsem?" stresini yok et'],
    indexTitle:'Haftalık Yemek Planları ve Alışveriş Listeleri | Meal-Planner.ro',
    indexDesc:'8 tam haftalık yemek planı, alışveriş listeleri ve maliyet tahminleriyle.',
    indexH1raw:'Haftalık Planlar ve <span class="accent">Alışveriş Listeleri</span>',
    indexSubdesc:'Her biri 14 tarif, alışveriş listesi ve maliyet tahmini içeren 8 tam plan.',
    indexViewPlan:'Planı gör',
    indexSeoH:'Haftalık planlayıcı neden kullanılmalı?',
    indexSeoP:'Yemek planlaması, daha sağlıklı beslenmenin ve para biriktirmenin en etkili yollarından biridir.',
    metaTitle: (theme)=>`Haftalık Plan – ${theme} | Meal-Planner.ro`,
    days:['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'],
    recipeBase:'/ro/retete/',
    planIdFn: p=>p.idEn,
  },
  it: {
    code:'it', dir:'/it/piano-settimanale', appDir:'/',
    homeLabel:'Home', sectionLabel:'Piani Settimanali', appLabel:'App',
    planBadge:'Piano pasti settimanale', planHeading:'Piano settimanale completo',
    dayTh:'Giorno', lunchTh:'Pranzo', dinnerTh:'Cena',
    persons:'2 persone', weeks:'7 giorni',
    costUnit:'/ settimana', costValue: p=>`€${p.costEUR}`,
    ingredientsLabel: n=>`${n} ingredienti`,
    openAppLabel:'Apri nell\'app',
    shoppingAnchor:'lista-spesa',
    shoppingLabel:'Vedi lista della spesa',
    shoppingHeading:'Lista della spesa completa',
    shoppingIntro: (plan,n)=>`Tutti gli ingredienti della settimana. Stimato <strong>~€${plan.costEUR}</strong> per 2 persone.`,
    openPlanLabel:'Apri piano nell\'app',
    openPlanSub:'Personalizza ricette e scarica PDF gratis',
    otherPlansHeading:'Altri piani settimanali',
    seeAll:'Vedi tutti gli 8 piani →',
    seoHeading:'Perché pianificare i pasti?',
    seoBullets:['Riduci gli sprechi alimentari fino al <strong>30%</strong>','Risparmia <strong>tempo e denaro</strong>','Mangia in modo più <strong>sano</strong>','Elimina lo stress quotidiano'],
    indexTitle:'Piani Pasti Settimanali con Liste della Spesa | Meal-Planner.ro',
    indexDesc:'8 piani settimanali completi con liste della spesa e stime dei costi.',
    indexH1raw:'Piani Settimanali con <span class="accent">Liste della Spesa</span>',
    indexSubdesc:'8 piani completi, ognuno con 14 ricette, lista della spesa e stima dei costi.',
    indexViewPlan:'Vedi piano',
    indexSeoH:'Perché usare un pianificatore settimanale?',
    indexSeoP:'Pianificare i pasti in anticipo è uno dei metodi più efficaci per mangiare in modo più sano.',
    metaTitle: (theme)=>`Piano Settimanale – ${theme} | Meal-Planner.ro`,
    days:['Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica'],
    recipeBase:'/ro/retete/',
    planIdFn: p=>p.idEn,
  },
  ko: {
    code:'ko', dir:'/ko/jugan-menu', appDir:'/',
    homeLabel:'홈', sectionLabel:'주간 식단 계획', appLabel:'앱',
    planBadge:'주간 식단 계획', planHeading:'전체 주간 계획',
    dayTh:'요일', lunchTh:'점심', dinnerTh:'저녁',
    persons:'2인분', weeks:'7일',
    costUnit:'/ 주', costValue: p=>`€${p.costEUR}`,
    ingredientsLabel: n=>`${n}가지 재료`,
    openAppLabel:'앱에서 열기',
    shoppingAnchor:'jangbogi-list',
    shoppingLabel:'장보기 목록 보기',
    shoppingHeading:'완전한 장보기 목록',
    shoppingIntro: (plan,n)=>`이번 주 필요한 모든 재료. 2인 기준 <strong>~€${plan.costEUR}</strong> 예상.`,
    openPlanLabel:'앱에서 계획 열기',
    openPlanSub:'레시피를 커스터마이즈하고 무료 PDF 다운로드',
    otherPlansHeading:'다른 주간 계획',
    seeAll:'전체 8개 계획 보기 →',
    seoHeading:'왜 식사를 미리 계획해야 할까요?',
    seoBullets:['식품 낭비를 <strong>30%</strong> 줄이기','<strong>시간과 돈</strong> 절약','더 <strong>건강하게</strong> 먹기','매일 "오늘 뭐 먹지?" 스트레스 해소'],
    indexTitle:'주간 식단 계획 및 장보기 목록 | Meal-Planner.ro',
    indexDesc:'장보기 목록과 비용 추정이 포함된 8가지 완전한 주간 식단 계획.',
    indexH1raw:'주간 계획과 <span class="accent">장보기 목록</span>',
    indexSubdesc:'각각 14가지 레시피, 장보기 목록, 비용 추정이 포함된 8가지 완전한 계획.',
    indexViewPlan:'계획 보기',
    indexSeoH:'주간 플래너를 사용하는 이유',
    indexSeoP:'식사를 미리 계획하는 것은 건강하게 먹고 비용을 절약하는 가장 효과적인 방법 중 하나입니다.',
    metaTitle: (theme)=>`주간 계획 – ${theme} | Meal-Planner.ro`,
    days:['월요일','화요일','수요일','목요일','금요일','토요일','일요일'],
    recipeBase:'/ro/retete/',
    planIdFn: p=>p.idEn,
  },
};

/* ════════════════════════════════════════════════════════════════
   SHARED HTML HELPERS
   ════════════════════════════════════════════════════════════════ */
const HEAD = (title, desc, canonical, langCode='ro', dir='ltr', ogType='website', ogImage='https://meal-planner.ro/cover.jpg') => `<!DOCTYPE html>
<html lang="${langCode}" dir="${dir}">
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
  <meta property="og:type" content="${ogType}"/>
  <meta property="og:title" content="${esc(title)}"/>
  <meta property="og:description" content="${esc(desc)}"/>
  <meta property="og:url" content="https://meal-planner.ro${canonical}"/>
  <meta property="og:image" content="${ogImage}"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${esc(title)}"/>
  <meta name="twitter:description" content="${esc(desc)}"/>
  <meta name="twitter:image" content="${ogImage}"/>
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

// Will be populated after RECIPE_LANG is defined (see below)
let RECIPES_NAV = {};

const appHref = (lc) => lc.appDir && lc.appDir !== '/' ? `${lc.appDir}/` : '/';

// Localised display names for the in-nav language switcher (≤14 entries).
const NAV_LANG_NAMES = {
  ro:'Română', en:'English', es:'Español', fr:'Français', de:'Deutsch',
  pt:'Português', ru:'Русский', ar:'العربية', zh:'中文', ja:'日本語',
  hi:'हिन्दी', tr:'Türkçe', it:'Italiano', ko:'한국어'
};

// Compact section ("Plans") labels for the in-page nav. The full
// lc.sectionLabel ("Weekly Meal Plans", "Meniuri Săptămânale") is too long to
// fit alongside Recipes + Premium + lang switcher on a phone viewport, so we
// use the short forms each per-locale homepage already ships. Emoji is split
// from the text so CSS can collapse to icon-only at <360px.
const NAV_PLANS_LABELS = {
  ro:'Meniuri', en:'Meal Plans', es:'Menús',     fr:'Menus',
  de:'Pläne',   pt:'Menus',      ru:'Меню',      ar:'قوائم',
  zh:'菜单',     ja:'メニュー',     hi:'मेनू',       tr:'Menüler',
  it:'Menu',    ko:'메뉴'
};
const navPlansLink = (lc_code) => `<span class="nav-link-icon" aria-hidden="true">📅</span> <span class="nav-link-label">${NAV_PLANS_LABELS[lc_code] || 'Plans'}</span>`;

// A11y labels for the nav and language switcher. Hardcoded English on
// non-English pages was a mixed-language defect on cuisine hubs, pricing,
// recipe pages — every page that renders the header.
const A11Y_LABELS = {
  ro: { selectLang:'Selectează limba',  mainNav:'Navigare principală',    availableLangs:'Limbi disponibile' },
  en: { selectLang:'Select language',   mainNav:'Main navigation',        availableLangs:'Available languages' },
  es: { selectLang:'Seleccionar idioma',mainNav:'Navegación principal',   availableLangs:'Idiomas disponibles' },
  fr: { selectLang:'Choisir la langue', mainNav:'Navigation principale',  availableLangs:'Langues disponibles' },
  de: { selectLang:'Sprache auswählen', mainNav:'Hauptnavigation',        availableLangs:'Verfügbare Sprachen' },
  pt: { selectLang:'Selecionar idioma', mainNav:'Navegação principal',    availableLangs:'Idiomas disponíveis' },
  ru: { selectLang:'Выбрать язык',      mainNav:'Главная навигация',      availableLangs:'Доступные языки' },
  ar: { selectLang:'اختر اللغة',         mainNav:'التنقل الرئيسي',           availableLangs:'اللغات المتاحة' },
  zh: { selectLang:'选择语言',           mainNav:'主导航',                  availableLangs:'可用语言' },
  ja: { selectLang:'言語を選択',         mainNav:'メインナビゲーション',      availableLangs:'対応言語' },
  hi: { selectLang:'भाषा चुनें',          mainNav:'मुख्य नेविगेशन',            availableLangs:'उपलब्ध भाषाएँ' },
  tr: { selectLang:'Dili seçin',         mainNav:'Ana gezinme',            availableLangs:'Mevcut diller' },
  it: { selectLang:'Seleziona la lingua',mainNav:'Navigazione principale', availableLangs:'Lingue disponibili' },
  ko: { selectLang:'언어 선택',          mainNav:'기본 탐색',               availableLangs:'사용 가능한 언어' },
};
const a11y = (lc_code) => A11Y_LABELS[lc_code] || A11Y_LABELS.en;

// Builds the lang-switcher dropdown for the in-page nav. Caller passes an
// optional `urlMap` keyed by locale code so the switcher preserves page
// context across locales — e.g. switching from `/en/recipes/pav-bhaji/` to ES
// lands on `/es/recetas/pav-bhaji/`, not the ES homepage. When `urlMap` is
// missing a locale (or omitted entirely) we fall back to `/<code>/`.
const buildNavLangSelect = (lc_code, id_prefix = 'nav-lang', urlMap = null) => {
  const options = Object.keys(NAV_LANG_NAMES)
    .map(code => {
      const href = (urlMap && urlMap[code]) || `/${code}/`;
      return `<option value="${href}"${code === lc_code ? ' selected' : ''}>${NAV_LANG_NAMES[code]}</option>`;
    })
    .join('');
  const labels = a11y(lc_code);
  return `<div class="nav-lang">
      <label class="visually-hidden" for="${id_prefix}-${lc_code}">${labels.selectLang}</label>
      <select id="${id_prefix}-${lc_code}" class="lang-select" aria-label="${labels.selectLang}" onchange="location.href=this.value">${options}</select>
    </div>`;
};

// Page-type URL builders for the context-preserving language switcher. Each
// returns a `{ <code>: '/...' }` map covering all 14 locales. Knowledge of
// per-locale dir slugs lives here so callers don't repeat themselves.
const NAV_URL_FOR = {
  // Plan-listing index: `/<lc>/<plan-dir>/`
  planIndex: () =>
    Object.fromEntries(Object.keys(NAV_LANG_NAMES).map(c => [c, `${LANG_CONFIGS[c].dir}/`])),
  // A specific plan page. Romanian uses plan.id ("asia"), all others use
  // plan.idEn ("asian-fusion") — see filesystem layout under public/*/<dir>.
  plan: (plan) =>
    Object.fromEntries(Object.keys(NAV_LANG_NAMES).map(c =>
      [c, `${LANG_CONFIGS[c].dir}/${c === 'ro' ? plan.id : plan.idEn}/`])),
  // Recipe-listing index: `/<lc>/<recipe-dir>/`
  recipeIndex: () =>
    Object.fromEntries(Object.keys(NAV_LANG_NAMES).map(c => [c, `${RECIPE_LANG[c].dir}/`])),
  // A specific recipe page. The slug is derived from r.name.en in slug() and
  // is locale-stable, so the same `rslug` works in every locale.
  recipe: (rslug) =>
    Object.fromEntries(Object.keys(NAV_LANG_NAMES).map(c => [c, `${RECIPE_LANG[c].dir}/${rslug}/`])),
  // A specific cuisine hub page. Lives under the per-locale recipe dir with a
  // locale-stable origin slug (e.g. `japan`) — same URL set used by
  // cuisineHubHreflangs(), so the visible nav matches the hreflang map.
  cuisineHub: (originSlug) =>
    Object.fromEntries(Object.keys(NAV_LANG_NAMES).map(c => [c, `${RECIPE_LANG[c].dir}/${originSlug}/`])),
  // Pricing page. Each locale has its own slug (premium / pricing / precios…).
  pricing: () =>
    Object.fromEntries(Object.keys(NAV_LANG_NAMES).map(c => [c, `/${c}/${PRICING_SLUGS[c]}/`])),
};

const makeNav = (lc, langUrlMap = null) => `
<header class="app-header no-print" role="banner">
  <nav class="app-nav" aria-label="${a11y(lc.code).mainNav}">
    <a class="nav-brand" href="/" aria-label="Meal-Planner.ro – home">
      <span class="nav-icon" aria-hidden="true">🥗</span>
      <span class="nav-title">Meal-Planner<span class="nav-tld">.ro</span></span>
    </a>
    <div class="nav-links">
      <a href="${lc.dir}/" class="nav-link nav-link--plans">${navPlansLink(lc.code)}</a>
      <a href="${RECIPES_NAV[lc.code].href}" class="nav-link">${RECIPES_NAV[lc.code].label}</a>
      <a href="/${lc.code}/${PRICING_SLUGS[lc.code]}/" class="nav-link">⭐ Premium</a>
    </div>
    ${buildNavLangSelect(lc.code, 'content-lang', langUrlMap)}
  </nav>
</header>`;

const FOOTER_LANG_LINKS = ['ro','en','es','fr','de','pt','ru','ar','zh','ja','hi','tr','it','ko']
  .map(c => `<a href="/${c}/" hreflang="${c}">${({ro:'Română',en:'English',es:'Español',fr:'Français',de:'Deutsch',pt:'Português',ru:'Русский',ar:'العربية',zh:'中文',ja:'日本語',hi:'हिन्दी',tr:'Türkçe',it:'Italiano',ko:'한국어'})[c]}</a>`)
  .join('<span class="footer-lang-sep" aria-hidden="true">·</span>');

const makeFooter = (lc) => `
<footer class="app-footer" role="contentinfo">
  <div class="footer-inner">
    <nav class="footer-langs" aria-label="${a11y(lc.code).availableLangs}">${FOOTER_LANG_LINKS}</nav>
    <div class="footer-main">
      <span class="footer-brand">🥗 Meal-Planner.ro</span>
      <span class="footer-sep">·</span>
      <a href="${lc.dir}/">${lc.sectionLabel}</a>
      <span class="footer-sep">·</span>
      <a href="${appHref(lc)}">${lc.appLabel}</a>
      <span class="footer-sep">·</span>
      <span>© 2026</span>
    </div>
  </div>
</footer>`;

/* ════════════════════════════════════════════════════════════════
   MULTILINGUAL PRICING PAGES
   ════════════════════════════════════════════════════════════════ */

const PRICING_SLUGS = {
  ro:'premium', en:'pricing', es:'precios', fr:'tarifs',
  de:'preise',  pt:'precos',  ru:'tseny',   ar:'asaar',
  zh:'jiage',   ja:'pricing', hi:'pricing', tr:'fiyatlar',
  it:'prezzi',  ko:'pricing'
};

const PRICING_COPY = {
  ro: {
    metaTitle: 'Prețuri – Gratuit vs Premium | Meal-Planner.ro',
    metaDesc:  'Compară planurile Gratuit și Premium. PDF-uri nelimitate, asistent AI, meniu cu buget — doar €3/lună.',
    title:     'Prețuri simple și clare',
    subtitle:  'Începe gratuit. Fă upgrade când ai nevoie de mai mult.',
    freeName:  'Gratuit',
    premName:  '⭐ Premium',
    price:     '€3/lună',
    popular:   'CEL MAI POPULAR',
    cta:       'Obține Premium →',
    backLabel: '← Înapoi la Planificator',
    alreadyLabel:    'Ai deja un abonament?',
    alreadyActivate: 'Activează →',
    freeFeats: ['✅ Planificator 7 zile','✅ Listă de cumpărături automată','✅ 175 rețete din 70+ țări','✅ 14 limbi','✅ Previzualizare gratuită — 2 zile din 7','✗ PDF complet 7 zile','✗ Meniu cu buget săptămânal','✗ Asistent AI rețete','✗ Asistent AI planificare mese'],
    premFeats: ['✅ Tot ce e în Gratuit, plus:','✅ PDF complet 7 zile','✅ Meniu cu buget săptămânal','✅ Asistent AI rețete (chat)','✅ Asistent AI planificare mese','✅ Acces nelimitat, oricând','✅ Anulezi oricând — fără angajament'],
    faqTitle:  'Întrebări frecvente',
    faq: [
      ['Ce include planul Gratuit?','Acces complet la planificatorul de 7 zile, listă de cumpărături automată, 175 rețete în 14 limbi și o previzualizare PDF gratuită (2 zile din 7).'],
      ['Ce adaugă Premium?','Un PDF cu întregul plan de 7 zile, meniu cu buget săptămânal, asistentul AI de rețete și asistentul AI de planificare — toate nelimitate.'],
      ['Cum funcționează facturarea?','€3/lună, facturat prin Stripe. Poți anula oricând din portalul clienților.'],
      ['Cum activez după plată?','Revino pe pagina principală și introdu emailul în secțiunea „Ai deja abonament?". Statusul tău premium va fi verificat instant.'],
      ['Este disponibil în limba mea?','Da — în 14 limbi: română, engleză, spaniolă, franceză, germană, portugheză, rusă, arabă, chineză, japoneză, hindi, turcă, italiană și coreeană.']
    ]
  },
  en: {
    metaTitle: 'Pricing – Free vs Premium | Meal-Planner.ro',
    metaDesc:  'Compare Free and Premium plans. Unlimited PDFs, AI recipe assistant, weekly budget menu — just €3/month.',
    title:     'Simple, honest pricing',
    subtitle:  'Start free. Upgrade when you need more.',
    freeName:  'Free',
    premName:  '⭐ Premium',
    price:     '€3/month',
    popular:   'MOST POPULAR',
    cta:       'Get Premium →',
    backLabel: '← Back to Meal Planner',
    alreadyLabel:    'Already have a subscription?',
    alreadyActivate: 'Activate →',
    freeFeats: ['✅ 7-day meal planner','✅ Auto shopping list','✅ 175 recipes from 70+ countries','✅ 14 languages','✅ Free preview — 2 of 7 days','✗ Full 7-day PDF download','✗ Weekly budget menu','✗ AI recipe assistant','✗ AI meal planning assistant'],
    premFeats: ['✅ Everything in Free, plus:','✅ Full 7-day PDF download','✅ Weekly budget menu','✅ AI recipe assistant (chat)','✅ AI meal planning assistant','✅ Unlimited access, anytime','✅ Cancel anytime — no commitment'],
    faqTitle:  'Frequently asked questions',
    faq: [
      ['What does Free include?','Full access to the 7-day meal planner, automatic shopping list, 175 recipes in 14 languages, and a free PDF preview (2 of 7 days).'],
      ['What does Premium add?','A single PDF with your entire 7-day plan, a weekly budget menu, the AI recipe chat assistant, and the AI meal planning assistant — all unlimited.'],
      ['How does billing work?','€3/month, billed via Stripe. You can cancel at any time from the customer portal.'],
      ['How do I activate after payment?','Return to the homepage and enter your email in the "Already subscribed?" section. Your premium status will be verified instantly.'],
      ['Is it available in my language?','Yes — in 14 languages: English, Romanian, Spanish, French, German, Portuguese, Russian, Arabic, Chinese, Japanese, Hindi, Turkish, Italian, and Korean.']
    ]
  },
  es: {
    metaTitle: 'Precios – Gratis vs Premium | Meal-Planner.ro',
    metaDesc:  'Compara los planes Gratis y Premium. PDFs ilimitados, asistente de recetas IA, menú con presupuesto — solo €3/mes.',
    title:     'Precios simples y claros',
    subtitle:  'Comienza gratis. Mejora cuando necesites más.',
    freeName:  'Gratis',
    premName:  '⭐ Premium',
    price:     '€3/mes',
    popular:   'MÁS POPULAR',
    cta:       'Obtener Premium →',
    backLabel: '← Volver al Planificador',
    alreadyLabel:    '¿Ya tienes suscripción?',
    alreadyActivate: 'Activar →',
    freeFeats: ['✅ Planificador de 7 días','✅ Lista de compras automática','✅ 175 recetas de 70+ países','✅ 14 idiomas','✅ Vista previa gratuita — 2 de 7 días','✗ PDF completo de 7 días','✗ Menú semanal con presupuesto','✗ Asistente de recetas IA','✗ Asistente IA planificación'],
    premFeats: ['✅ Todo en Gratis, más:','✅ PDF completo de 7 días','✅ Menú semanal con presupuesto','✅ Asistente de recetas IA (chat)','✅ Asistente IA planificación','✅ Acceso ilimitado, en cualquier momento','✅ Cancela cuando quieras'],
    faqTitle:  'Preguntas frecuentes',
    faq: [
      ['¿Qué incluye el plan Gratis?','Acceso completo al planificador de 7 días, lista de compras automática, 175 recetas en 14 idiomas y una vista previa PDF gratuita (2 de 7 días).'],
      ['¿Qué agrega Premium?','Un PDF con tu plan completo de 7 días, menú semanal con presupuesto, asistente de recetas IA y asistente IA de planificación — todo ilimitado.'],
      ['¿Cómo funciona la facturación?','€3/mes, facturado a través de Stripe. Puedes cancelar en cualquier momento desde el portal de clientes.'],
      ['¿Cómo activo tras el pago?','Vuelve a la página principal e introduce tu email en la sección "¿Ya suscrito?". Tu estado premium se verificará al instante.'],
      ['¿Está disponible en mi idioma?','Sí — en 14 idiomas: español, inglés, rumano, francés, alemán, portugués, ruso, árabe, chino, japonés, hindi, turco, italiano y coreano.']
    ]
  },
  fr: {
    metaTitle: 'Tarifs – Gratuit vs Premium | Meal-Planner.ro',
    metaDesc:  'Comparez les offres Gratuit et Premium. PDFs illimités, assistant recettes IA, menu budgétaire — seulement €3/mois.',
    title:     'Tarifs simples et transparents',
    subtitle:  'Commencez gratuitement. Passez à Premium quand vous en avez besoin.',
    freeName:  'Gratuit',
    premName:  '⭐ Premium',
    price:     '€3/mois',
    popular:   'LE PLUS POPULAIRE',
    cta:       'Obtenir Premium →',
    backLabel: '← Retour au Planificateur',
    alreadyLabel:    'Vous avez déjà un abonnement ?',
    alreadyActivate: 'Activer →',
    freeFeats: ['✅ Planificateur 7 jours','✅ Liste de courses automatique','✅ 175 recettes de 70+ pays','✅ 14 langues','✅ Aperçu gratuit — 2 jours sur 7','✗ PDF complet 7 jours','✗ Menu hebdomadaire budgétaire','✗ Assistant recettes IA','✗ Assistant IA planification'],
    premFeats: ['✅ Tout ce qui est dans Gratuit, plus :','✅ PDF complet 7 jours','✅ Menu hebdomadaire budgétaire','✅ Assistant recettes IA (chat)','✅ Assistant IA planification','✅ Accès illimité, à tout moment','✅ Annulez quand vous voulez'],
    faqTitle:  'Questions fréquentes',
    faq: [
      ["Qu'inclut le plan Gratuit ?","Accès complet au planificateur 7 jours, liste de courses automatique, 175 recettes en 14 langues et un aperçu PDF gratuit (2 jours sur 7)."],
      ['Que ajoute Premium ?',"Un PDF avec votre plan complet de 7 jours, un menu budgétaire, l'assistant recettes IA et l'assistant IA de planification — tout illimité."],
      ['Comment fonctionne la facturation ?','€3/mois, facturé via Stripe. Vous pouvez annuler à tout moment depuis le portail client.'],
      ['Comment activer après le paiement ?','Retournez sur la page principale et entrez votre email dans la section "Déjà abonné ?". Votre statut premium sera vérifié instantanément.'],
      ['Est-il disponible dans ma langue ?','Oui — en 14 langues : français, anglais, roumain, espagnol, allemand, portugais, russe, arabe, chinois, japonais, hindi, turc, italien et coréen.']
    ]
  },
  de: {
    metaTitle: 'Preise – Kostenlos vs Premium | Meal-Planner.ro',
    metaDesc:  'Kostenlose und Premium-Pläne vergleichen. Unbegrenzte PDFs, KI-Rezept-Assistent, Wochenbudget-Menü — nur €3/Monat.',
    title:     'Einfache, transparente Preise',
    subtitle:  'Kostenlos starten. Upgraden wenn Sie mehr brauchen.',
    freeName:  'Kostenlos',
    premName:  '⭐ Premium',
    price:     '€3/Monat',
    popular:   'AM BELIEBTESTEN',
    cta:       'Premium holen →',
    backLabel: '← Zurück zum Planer',
    alreadyLabel:    'Haben Sie bereits ein Abonnement?',
    alreadyActivate: 'Aktivieren →',
    freeFeats: ['✅ 7-Tage-Mahlzeitenplaner','✅ Automatische Einkaufsliste','✅ 175 Rezepte aus 70+ Ländern','✅ 14 Sprachen','✅ Kostenlose Vorschau — 2 von 7 Tagen','✗ Vollständiges 7-Tage-PDF','✗ Wöchentliches Budget-Menü','✗ KI-Rezept-Assistent','✗ KI-Mahlzeiten-Assistent'],
    premFeats: ['✅ Alles aus Kostenlos, plus:','✅ Vollständiges 7-Tage-PDF','✅ Wöchentliches Budget-Menü','✅ KI-Rezept-Assistent (Chat)','✅ KI-Mahlzeiten-Assistent','✅ Unbegrenzter Zugang, jederzeit','✅ Jederzeit kündbar — keine Bindung'],
    faqTitle:  'Häufige Fragen',
    faq: [
      ['Was beinhaltet der kostenlose Plan?','Vollzugriff auf den 7-Tage-Planer, automatische Einkaufsliste, 175 Rezepte in 14 Sprachen und eine kostenlose PDF-Vorschau (2 von 7 Tagen).'],
      ['Was bietet Premium zusätzlich?','Ein vollständiges 7-Tage-PDF, ein Wochenbudget-Menü, den KI-Rezept-Assistenten und den KI-Mahlzeiten-Assistenten — alles unbegrenzt.'],
      ['Wie funktioniert die Abrechnung?','€3/Monat, abgerechnet über Stripe. Sie können jederzeit über das Kundenportal kündigen.'],
      ['Wie aktiviere ich nach der Zahlung?','Kehren Sie zur Startseite zurück und geben Sie Ihre E-Mail in den Bereich "Bereits abonniert?" ein. Ihr Premium-Status wird sofort überprüft.'],
      ['Ist es in meiner Sprache verfügbar?','Ja — in 14 Sprachen: Deutsch, Englisch, Rumänisch, Spanisch, Französisch, Portugiesisch, Russisch, Arabisch, Chinesisch, Japanisch, Hindi, Türkisch, Italienisch und Koreanisch.']
    ]
  },
  pt: {
    metaTitle: 'Preços – Gratuito vs Premium | Meal-Planner.ro',
    metaDesc:  'Compare os planos Gratuito e Premium. PDFs ilimitados, assistente de receitas IA, menu com orçamento — apenas €3/mês.',
    title:     'Preços simples e transparentes',
    subtitle:  'Comece gratuitamente. Faça upgrade quando precisar de mais.',
    freeName:  'Gratuito',
    premName:  '⭐ Premium',
    price:     '€3/mês',
    popular:   'MAIS POPULAR',
    cta:       'Obter Premium →',
    backLabel: '← Voltar ao Planejador',
    alreadyLabel:    'Já tem uma assinatura?',
    alreadyActivate: 'Ativar →',
    freeFeats: ['✅ Planejador de 7 dias','✅ Lista de compras automática','✅ 175 receitas de 70+ países','✅ 14 idiomas','✅ Pré-visualização gratuita — 2 de 7 dias','✗ PDF completo de 7 dias','✗ Menu semanal com orçamento','✗ Assistente de receitas IA','✗ Assistente IA planeamento'],
    premFeats: ['✅ Tudo no Gratuito, mais:','✅ PDF completo de 7 dias','✅ Menu semanal com orçamento','✅ Assistente de receitas IA (chat)','✅ Assistente IA planeamento','✅ Acesso ilimitado, a qualquer momento','✅ Cancele quando quiser'],
    faqTitle:  'Perguntas frequentes',
    faq: [
      ['O que inclui o plano Gratuito?','Acesso completo ao planejador de 7 dias, lista de compras automática, 175 receitas em 14 idiomas e uma pré-visualização PDF gratuita (2 de 7 dias).'],
      ['O que o Premium adiciona?','Um PDF com o seu plano completo de 7 dias, menu semanal com orçamento, assistente de receitas IA e assistente IA de planeamento — tudo ilimitado.'],
      ['Como funciona a cobrança?','€3/mês, cobrado via Stripe. Você pode cancelar a qualquer momento pelo portal do cliente.'],
      ['Como ativo após o pagamento?','Volte à página principal e insira seu email na seção "Já assinante?". Seu status premium será verificado instantaneamente.'],
      ['Está disponível no meu idioma?','Sim — em 14 idiomas: português, inglês, romeno, espanhol, francês, alemão, russo, árabe, chinês, japonês, hindi, turco, italiano e coreano.']
    ]
  },
  ru: {
    metaTitle: 'Цены – Бесплатно vs Премиум | Meal-Planner.ro',
    metaDesc:  'Сравните бесплатный и премиум-планы. Неограниченные PDF, ИИ-помощник по рецептам, недельное меню — всего €3/мес.',
    title:     'Простые и честные цены',
    subtitle:  'Начните бесплатно. Переходите на Premium, когда нужно больше.',
    freeName:  'Бесплатно',
    premName:  '⭐ Премиум',
    price:     '€3/мес',
    popular:   'САМЫЙ ПОПУЛЯРНЫЙ',
    cta:       'Получить Premium →',
    backLabel: '← Вернуться к планировщику',
    alreadyLabel:    'Уже есть подписка?',
    alreadyActivate: 'Активировать →',
    freeFeats: ['✅ Планировщик на 7 дней','✅ Автоматический список покупок','✅ 175 рецептов из 70+ стран','✅ 14 языков','✅ Бесплатный просмотр — 2 из 7 дней','✗ Полный PDF на 7 дней','✗ Недельное бюджетное меню','✗ ИИ-помощник по рецептам','✗ ИИ-помощник по планированию'],
    premFeats: ['✅ Всё из Бесплатного, плюс:','✅ Полный PDF на 7 дней','✅ Недельное бюджетное меню','✅ ИИ-помощник по рецептам (чат)','✅ ИИ-помощник по планированию','✅ Неограниченный доступ в любое время','✅ Отмена в любой момент'],
    faqTitle:  'Часто задаваемые вопросы',
    faq: [
      ['Что включает бесплатный план?','Полный доступ к 7-дневному планировщику, автоматический список покупок, 175 рецептов на 14 языках и бесплатный просмотр PDF (2 из 7 дней).'],
      ['Что добавляет Premium?','PDF со всем 7-дневным планом, недельное бюджетное меню, ИИ-помощник по рецептам и ИИ-помощник по планированию — всё без ограничений.'],
      ['Как работает оплата?','€3/мес, оплата через Stripe. Вы можете отменить в любое время в личном кабинете.'],
      ['Как активировать после оплаты?','Вернитесь на главную страницу и введите email в разделе "Уже подписчик?". Ваш премиум-статус будет проверен мгновенно.'],
      ['Доступен ли он на моём языке?','Да — на 14 языках: русский, английский, румынский, испанский, французский, португальский, немецкий, арабский, китайский, японский, хинди, турецкий, итальянский и корейский.']
    ]
  },
  ar: {
    metaTitle: 'الأسعار – مجاني مقابل بريميوم | Meal-Planner.ro',
    metaDesc:  'قارن بين الخطة المجانية وبريميوم. PDFs غير محدودة، مساعد وصفات بالذكاء الاصطناعي، قائمة طعام أسبوعية — فقط €3/شهر.',
    title:     'أسعار بسيطة وشفافة',
    subtitle:  'ابدأ مجاناً. قم بالترقية عندما تحتاج المزيد.',
    freeName:  'مجاني',
    premName:  '⭐ بريميوم',
    price:     '€3/شهر',
    popular:   'الأكثر شعبية',
    cta:       'احصل على بريميوم ←',
    backLabel: 'العودة إلى المخطط ←',
    alreadyLabel:    'لديك اشتراك بالفعل؟',
    alreadyActivate: 'تفعيل ←',
    freeFeats: ['✅ مخطط وجبات لمدة 7 أيام','✅ قائمة تسوق تلقائية','✅ 175 وصفة من 70+ دولة','✅ 14 لغة','✅ معاينة مجانية — يومان من أصل 7','✗ ملف PDF كامل لمدة 7 أيام','✗ قائمة طعام أسبوعية بالميزانية','✗ مساعد وصفات بالذكاء الاصطناعي','✗ مساعد الذكاء الاصطناعي للتخطيط'],
    premFeats: ['✅ كل ما في المجاني، بالإضافة إلى:','✅ ملف PDF كامل لمدة 7 أيام','✅ قائمة طعام أسبوعية بالميزانية','✅ مساعد وصفات بالذكاء الاصطناعي (دردشة)','✅ مساعد الذكاء الاصطناعي للتخطيط','✅ وصول غير محدود في أي وقت','✅ إلغاء في أي وقت'],
    faqTitle:  'الأسئلة الشائعة',
    faq: [
      ['ماذا يتضمن الخطة المجانية؟','وصول كامل إلى مخطط 7 أيام، قائمة تسوق تلقائية، 175 وصفة بـ14 لغة ومعاينة PDF مجانية (يومان من أصل 7).'],
      ['ماذا يضيف بريميوم؟','ملف PDF بخطتك الكاملة لـ7 أيام، قائمة طعام أسبوعية بالميزانية، مساعد الوصفات ومساعد الذكاء الاصطناعي للتخطيط — كل ذلك بلا حدود.'],
      ['كيف يعمل الفوترة؟','€3/شهر، مدفوع عبر Stripe. يمكنك الإلغاء في أي وقت من بوابة العملاء.'],
      ['كيف أُفعّل بعد الدفع؟','ارجع إلى الصفحة الرئيسية وأدخل بريدك الإلكتروني في قسم "مشترك بالفعل؟". سيتم التحقق من حالتك الممتازة فوراً.'],
      ['هل هو متاح بلغتي؟','نعم — بـ14 لغة: العربية، الإنجليزية، الرومانية، الإسبانية، الفرنسية، البرتغالية، الروسية، الصينية، اليابانية، الهندية، التركية، الإيطالية والكورية.']
    ]
  },
  zh: {
    metaTitle: '定价 – 免费版 vs 高级版 | Meal-Planner.ro',
    metaDesc:  '比较免费版和高级版。无限PDF下载、AI食谱助手、每周预算菜单 — 仅需€3/月。',
    title:     '简单透明的定价',
    subtitle:  '免费开始，需要更多时升级。',
    freeName:  '免费版',
    premName:  '⭐ 高级版',
    price:     '€3/月',
    popular:   '最受欢迎',
    cta:       '获取高级版 →',
    backLabel: '← 返回饮食计划器',
    alreadyLabel:    '已有订阅？',
    alreadyActivate: '激活 →',
    freeFeats: ['✅ 7天饮食计划器','✅ 自动购物清单','✅ 175道来自70+国家的食谱','✅ 14种语言','✅ 免费预览 — 7天中的2天','✗ 完整7天PDF下载','✗ 每周预算菜单','✗ AI食谱助手','✗ AI膳食规划助手'],
    premFeats: ['✅ 免费版所有功能，另加：','✅ 完整7天PDF下载','✅ 每周预算菜单','✅ AI食谱助手（聊天）','✅ AI膳食规划助手','✅ 随时无限访问','✅ 随时取消，无承诺'],
    faqTitle:  '常见问题',
    faq: [
      ['免费版包含什么？','完整访问7天计划器、自动购物清单、14种语言的175道食谱以及免费PDF预览（7天中的2天）。'],
      ['高级版增加了什么？','包含您完整7天计划的PDF、每周预算菜单、AI食谱聊天助手和AI膳食规划助手 — 全部无限次使用。'],
      ['如何计费？','每月€3，通过Stripe付款。您可以随时通过客户门户取消。'],
      ['付款后如何激活？','返回主页，在"已订阅？"部分输入您的电子邮件。您的高级状态将立即得到验证。'],
      ['支持我的语言吗？','是的 — 支持14种语言：中文、英语、罗马尼亚语、西班牙语、法语、葡萄牙语、俄语、阿拉伯语、日语、印地语、土耳其语、意大利语和韩语。']
    ]
  },
  ja: {
    metaTitle: '料金プラン – 無料 vs プレミアム | Meal-Planner.ro',
    metaDesc:  '無料プランとプレミアムプランを比較。無制限PDF、AIレシピアシスタント、週次予算メニュー — わずか€3/月。',
    title:     'シンプルで明確な料金',
    subtitle:  '無料で始めて、必要なときにアップグレード。',
    freeName:  '無料',
    premName:  '⭐ プレミアム',
    price:     '€3/月',
    popular:   '最も人気',
    cta:       'プレミアムを取得 →',
    backLabel: '← ミールプランナーに戻る',
    alreadyLabel:    'すでにサブスクリプションをお持ちですか？',
    alreadyActivate: '有効化 →',
    freeFeats: ['✅ 7日間ミールプランナー','✅ 自動買い物リスト','✅ 70カ国以上の175レシピ','✅ 14言語','✅ 無料プレビュー — 7日中2日','✗ 7日間完全PDFダウンロード','✗ 週次予算メニュー','✗ AIレシピアシスタント','✗ AIミールプランアシスタント'],
    premFeats: ['✅ 無料版のすべて、さらに：','✅ 7日間完全PDFダウンロード','✅ 週次予算メニュー','✅ AIレシピアシスタント（チャット）','✅ AIミールプランアシスタント','✅ いつでも無制限アクセス','✅ いつでもキャンセル可能'],
    faqTitle:  'よくある質問',
    faq: [
      ['無料プランには何が含まれますか？','7日間プランナー、自動買い物リスト、14言語の175レシピ、無料PDFプレビュー（7日中2日）への完全アクセス。'],
      ['プレミアムは何を追加しますか？','7日間完全PDF、週次予算メニュー、AIレシピチャットアシスタント、AIミールプランアシスタント — すべて無制限。'],
      ['請求はどのように機能しますか？','月額€3、Stripe経由で請求。カスタマーポータルからいつでもキャンセルできます。'],
      ['支払い後のアクティベート方法は？','ホームページに戻り、「すでに登録済みですか？」セクションにメールアドレスを入力してください。プレミアムステータスが即時確認されます。'],
      ['自分の言語で利用できますか？','はい — 14言語対応：日本語、英語、ルーマニア語、スペイン語、フランス語、ドイツ語、ポルトガル語、ロシア語、アラビア語、中国語、ヒンディー語、トルコ語、イタリア語、韓国語。']
    ]
  },
  hi: {
    metaTitle: 'मूल्य निर्धारण – निःशुल्क बनाम प्रीमियम | Meal-Planner.ro',
    metaDesc:  'निःशुल्क और प्रीमियम योजनाओं की तुलना करें। असीमित PDF, AI रेसिपी सहायक, साप्ताहिक बजट मेनू — केवल €3/माह।',
    title:     'सरल और पारदर्शी मूल्य',
    subtitle:  'निःशुल्क शुरू करें। जब आपको अधिक की आवश्यकता हो तो अपग्रेड करें।',
    freeName:  'निःशुल्क',
    premName:  '⭐ प्रीमियम',
    price:     '€3/माह',
    popular:   'सबसे लोकप्रिय',
    cta:       'प्रीमियम पाएं →',
    backLabel: '← मील प्लानर पर वापस',
    alreadyLabel:    'पहले से सदस्यता है?',
    alreadyActivate: 'सक्रिय करें →',
    freeFeats: ['✅ 7-दिन का मील प्लानर','✅ स्वचालित खरीदारी सूची','✅ 70+ देशों से 175 रेसिपी','✅ 14 भाषाएं','✅ मुफ्त पूर्वावलोकन — 7 में से 2 दिन','✗ 7-दिन का पूर्ण PDF डाउनलोड','✗ साप्ताहिक बजट मेनू','✗ AI रेसिपी सहायक','✗ AI भोजन योजना सहायक'],
    premFeats: ['✅ निःशुल्क में सब कुछ, साथ ही:','✅ 7-दिन का पूर्ण PDF डाउनलोड','✅ साप्ताहिक बजट मेनू','✅ AI रेसिपी सहायक (चैट)','✅ AI भोजन योजना सहायक','✅ कभी भी असीमित पहुंच','✅ कभी भी रद्द करें'],
    faqTitle:  'अक्सर पूछे जाने वाले प्रश्न',
    faq: [
      ['निःशुल्क योजना में क्या शामिल है?','7-दिन के प्लानर, स्वचालित खरीदारी सूची, 14 भाषाओं में 175 रेसिपी और मुफ्त PDF पूर्वावलोकन (7 में से 2 दिन) तक पूर्ण पहुंच।'],
      ['प्रीमियम क्या जोड़ता है?','आपके 7-दिन के पूर्ण प्लान के साथ PDF, साप्ताहिक बजट मेनू, AI रेसिपी चैट सहायक और AI भोजन योजना सहायक — सभी असीमित।'],
      ['बिलिंग कैसे काम करती है?','€3/माह, Stripe के माध्यम से बिल किया जाता है। आप ग्राहक पोर्टल से कभी भी रद्द कर सकते हैं।'],
      ['भुगतान के बाद सक्रिय कैसे करें?','होमपेज पर वापस जाएं और "पहले से सदस्यता है?" अनुभाग में अपना ईमेल दर्ज करें। आपकी प्रीमियम स्थिति तुरंत सत्यापित हो जाएगी।'],
      ['क्या यह मेरी भाषा में उपलब्ध है?','हां — 14 भाषाओं में: हिंदी, अंग्रेजी, रोमानियाई, स्पेनिश, फ्रेंच, जर्मन, पुर्तगाली, रूसी, अरबी, चीनी, जापानी, तुर्की, इतालवी और कोरियाई।']
    ]
  },
  tr: {
    metaTitle: 'Fiyatlar – Ücretsiz vs Premium | Meal-Planner.ro',
    metaDesc:  'Ücretsiz ve Premium planları karşılaştırın. Sınırsız PDF, AI tarif asistanı, haftalık bütçe menüsü — sadece €3/ay.',
    title:     'Basit ve şeffaf fiyatlar',
    subtitle:  'Ücretsiz başlayın. Daha fazlasına ihtiyaç duyduğunuzda yükseltin.',
    freeName:  'Ücretsiz',
    premName:  '⭐ Premium',
    price:     '€3/ay',
    popular:   'EN POPÜLER',
    cta:       'Premium Edinin →',
    backLabel: '← Yemek Planlayıcıya Dön',
    alreadyLabel:    'Zaten aboneliğiniz var mı?',
    alreadyActivate: 'Etkinleştir →',
    freeFeats: ['✅ 7 günlük yemek planlayıcı','✅ Otomatik alışveriş listesi','✅ 70+ ülkeden 175 tarif','✅ 14 dil','✅ Ücretsiz önizleme — 7 günden 2\'si','✗ 7 günlük tam PDF indirme','✗ Haftalık bütçe menüsü','✗ AI tarif asistanı','✗ AI yemek planlama asistanı'],
    premFeats: ['✅ Ücretsiz\'deki her şey, artı:','✅ 7 günlük tam PDF indirme','✅ Haftalık bütçe menüsü','✅ AI tarif asistanı (sohbet)','✅ AI yemek planlama asistanı','✅ İstediğiniz zaman sınırsız erişim','✅ İstediğiniz zaman iptal edin'],
    faqTitle:  'Sıkça sorulan sorular',
    faq: [
      ['Ücretsiz plan neleri içerir?','7 günlük planlayıcı, otomatik alışveriş listesi, 14 dilde 175 tarif ve ücretsiz PDF önizlemesine (7 günden 2\'si) tam erişim.'],
      ['Premium ne ekler?','7 günlük tam planınızı içeren PDF, haftalık bütçe menüsü, AI tarif sohbet asistanı ve AI yemek planlama asistanı — hepsi sınırsız.'],
      ['Faturalandırma nasıl çalışır?','Ayda €3, Stripe üzerinden faturalandırılır. Müşteri portalından istediğiniz zaman iptal edebilirsiniz.'],
      ['Ödemeden sonra nasıl etkinleştiririm?','Ana sayfaya dönün ve "Zaten abone misiniz?" bölümüne e-postanızı girin. Premium durumunuz anında doğrulanacak.'],
      ['Dilimde mevcut mu?','Evet — 14 dilde: Türkçe, İngilizce, Romence, İspanyolca, Fransızca, Almanca, Portekizce, Rusça, Arapça, Çince, Japonca, Hintçe, İtalyanca ve Korece.']
    ]
  },
  it: {
    metaTitle: 'Prezzi – Gratuito vs Premium | Meal-Planner.ro',
    metaDesc:  'Confronta i piani Gratuito e Premium. PDF illimitati, assistente ricette IA, menu settimanale con budget — solo €3/mese.',
    title:     'Prezzi semplici e trasparenti',
    subtitle:  'Inizia gratis. Passa a Premium quando ne hai bisogno.',
    freeName:  'Gratuito',
    premName:  '⭐ Premium',
    price:     '€3/mese',
    popular:   'PIÙ POPOLARE',
    cta:       'Ottieni Premium →',
    backLabel: '← Torna al Pianificatore',
    alreadyLabel:    'Hai già un abbonamento?',
    alreadyActivate: 'Attiva →',
    freeFeats: ['✅ Pianificatore 7 giorni','✅ Lista della spesa automatica','✅ 175 ricette da 70+ paesi','✅ 14 lingue','✅ Anteprima gratuita — 2 giorni su 7','✗ PDF completo 7 giorni','✗ Menu settimanale con budget','✗ Assistente ricette IA','✗ Assistente IA pianificazione'],
    premFeats: ['✅ Tutto nel Gratuito, più:','✅ PDF completo 7 giorni','✅ Menu settimanale con budget','✅ Assistente ricette IA (chat)','✅ Assistente IA pianificazione','✅ Accesso illimitato, in qualsiasi momento','✅ Disdici quando vuoi'],
    faqTitle:  'Domande frequenti',
    faq: [
      ['Cosa include il piano Gratuito?','Accesso completo al pianificatore di 7 giorni, lista della spesa automatica, 175 ricette in 14 lingue e un\'anteprima PDF gratuita (2 giorni su 7).'],
      ['Cosa aggiunge Premium?','Un PDF con il tuo piano completo di 7 giorni, menu settimanale con budget, assistente ricette IA e assistente IA di pianificazione — tutto illimitato.'],
      ['Come funziona la fatturazione?','€3/mese, fatturato tramite Stripe. Puoi annullare in qualsiasi momento dal portale clienti.'],
      ['Come attivo dopo il pagamento?','Torna alla homepage e inserisci la tua email nella sezione "Già abbonato?". Il tuo stato premium verrà verificato istantaneamente.'],
      ['È disponibile nella mia lingua?','Sì — in 14 lingue: italiano, inglese, rumeno, spagnolo, francese, tedesco, portoghese, russo, arabo, cinese, giapponese, hindi, turco e coreano.']
    ]
  },
  ko: {
    metaTitle: '요금제 – 무료 vs 프리미엄 | Meal-Planner.ro',
    metaDesc:  '무료 및 프리미엄 플랜을 비교하세요. 무제한 PDF, AI 레시피 도우미, 주간 예산 메뉴 — 월 €3만으로.',
    title:     '간단하고 투명한 요금제',
    subtitle:  '무료로 시작하고, 더 필요할 때 업그레이드하세요.',
    freeName:  '무료',
    premName:  '⭐ 프리미엄',
    price:     '€3/월',
    popular:   '가장 인기 있는',
    cta:       '프리미엄 구독 →',
    backLabel: '← 식단 플래너로 돌아가기',
    alreadyLabel:    '이미 구독 중이신가요?',
    alreadyActivate: '활성화 →',
    freeFeats: ['✅ 7일 식단 플래너','✅ 자동 쇼핑 목록','✅ 70개국 이상 175가지 레시피','✅ 14개 언어','✅ 무료 미리보기 — 7일 중 2일','✗ 7일 전체 PDF 다운로드','✗ 주간 예산 메뉴','✗ AI 레시피 도우미','✗ AI 식단 계획 도우미'],
    premFeats: ['✅ 무료의 모든 것, 추가로:','✅ 7일 전체 PDF 다운로드','✅ 주간 예산 메뉴','✅ AI 레시피 도우미 (채팅)','✅ AI 식단 계획 도우미','✅ 언제든지 무제한 액세스','✅ 언제든지 취소 가능'],
    faqTitle:  '자주 묻는 질문',
    faq: [
      ['무료 플랜에는 무엇이 포함되나요?','7일 플래너, 자동 쇼핑 목록, 14개 언어로 된 175가지 레시피, 무료 PDF 미리보기(7일 중 2일)에 대한 전체 액세스.'],
      ['프리미엄은 무엇을 추가하나요?','7일 전체 플랜이 담긴 PDF, 주간 예산 메뉴, AI 레시피 채팅 도우미, AI 식단 계획 도우미 — 모두 무제한.'],
      ['청구는 어떻게 되나요?','월 €3, Stripe를 통해 청구됩니다. 고객 포털에서 언제든지 취소할 수 있습니다.'],
      ['결제 후 어떻게 활성화하나요?','홈페이지로 돌아가서 "이미 구독 중이신가요?" 섹션에 이메일을 입력하세요. 프리미엄 상태가 즉시 확인됩니다.'],
      ['제 언어로 이용 가능한가요?','네 — 14개 언어: 한국어, 영어, 루마니아어, 스페인어, 프랑스어, 독일어, 포르투갈어, 러시아어, 아랍어, 중국어, 일본어, 힌디어, 터키어, 이탈리아어.']
    ]
  }
};

// Pricing-specific nav: extends makeNav with ⭐ Premium active link + language switcher.
// The lang switcher options jump to the equivalent pricing page in each locale
// (uses PRICING_SLUGS so /ro/premium/ ↔ /en/pricing/ etc.).
function makePricingNav(lc_code) {
  const lc = LANG_CONFIGS[lc_code];
  const pricingHref = `/${lc_code}/${PRICING_SLUGS[lc_code]}/`;
  const options = Object.entries(PRICING_SLUGS)
    .map(([code, sl]) =>
      `<option value="/${code}/${sl}/"${code === lc_code ? ' selected' : ''}>${NAV_LANG_NAMES[code]}</option>`
    ).join('');
  const labels = a11y(lc_code);
  return `<header class="app-header no-print" role="banner">
  <nav class="app-nav" aria-label="${labels.mainNav}">
    <a class="nav-brand" href="/" aria-label="Meal-Planner.ro – home">
      <span class="nav-icon" aria-hidden="true">🥗</span>
      <span class="nav-title">Meal-Planner<span class="nav-tld">.ro</span></span>
    </a>
    <div class="nav-links">
      <a href="${lc.dir}/" class="nav-link nav-link--plans">${navPlansLink(lc_code)}</a>
      <a href="${RECIPES_NAV[lc_code].href}" class="nav-link">${RECIPES_NAV[lc_code].label}</a>
      <a href="${pricingHref}" class="nav-link nav-link--active" aria-current="page">⭐ Premium</a>
    </div>
    <div class="nav-lang">
      <label class="visually-hidden" for="pricing-lang-${lc_code}">${labels.selectLang}</label>
      <select id="pricing-lang-${lc_code}" class="lang-select" aria-label="${labels.selectLang}" onchange="location.href=this.value">
        ${options}
      </select>
    </div>
  </nav>
</header>`;
}

// Build hreflang block for all pricing pages
const PRICING_HREFLANGS = Object.entries(PRICING_SLUGS)
  .map(([lc, sl]) => `  <link rel="alternate" hreflang="${lc}" href="https://meal-planner.ro/${lc}/${sl}/" />`)
  .join('\n');
const PRICING_HREFLANGS_FULL = `  <link rel="alternate" hreflang="x-default" href="https://meal-planner.ro/pricing/" />\n${PRICING_HREFLANGS}`;

function pricingPage(lc_code) {
  const lc  = LANG_CONFIGS[lc_code];
  const cp  = PRICING_COPY[lc_code];
  const sl  = PRICING_SLUGS[lc_code];
  const dir_attr = lc.dir_attr || 'ltr';
  const canonical = `https://meal-planner.ro/${lc_code}/${sl}/`;

  const freeRows  = cp.freeFeats.map(f => `            <li class="${f.startsWith('✗') ? 'feat-no' : ''}">${f}</li>`).join('\n');
  const premRows  = cp.premFeats.map(f => `            <li>${f}</li>`).join('\n');
  const faqRows   = cp.faq.map(([q, a]) => `        <div class="faq-item">
          <dt>${q}</dt>
          <dd>${a}</dd>
        </div>`).join('\n');

  return `<!DOCTYPE html>
<html lang="${lc_code}" dir="${dir_attr}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${cp.metaTitle}</title>
  <meta name="description" content="${cp.metaDesc}" />
  <link rel="canonical" href="${canonical}" />
${PRICING_HREFLANGS_FULL}

  <!-- OG -->
  <meta property="og:type"        content="website" />
  <meta property="og:title"       content="${cp.metaTitle}" />
  <meta property="og:description" content="${cp.metaDesc}" />
  <meta property="og:url"         content="${canonical}" />
  <meta property="og:image"       content="https://meal-planner.ro/images/cover2.jpg" />

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml"  href="/images/favicon.svg">
  <link rel="icon" type="image/x-icon"  href="/images/favicon.ico">
  <link rel="apple-touch-icon"          href="/images/apple-touch-icon.png">
  <link rel="manifest"                  href="/images/site.webmanifest">

  <!-- Preconnect -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>

  <!-- Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

  <!-- Bootstrap + Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet" />

  <!-- App styles -->
  <link rel="stylesheet" href="/css/style.min.css">

  <!-- JSON-LD: Product with pricing offers -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Meal-Planner.ro Premium",
    "description": "${cp.metaDesc.replace(/"/g, '\\"')}",
    "url": "${canonical}",
    "image": "https://meal-planner.ro/images/cover2.jpg",
    "brand": { "@type": "Brand", "name": "Meal-Planner.ro" },
    "offers": [
      {
        "@type": "Offer",
        "name": "${cp.freeName}",
        "price": "0",
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "${cp.premName}",
        "price": "3",
        "priceCurrency": "EUR",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "3",
          "priceCurrency": "EUR",
          "unitCode": "MON"
        },
        "availability": "https://schema.org/InStock"
      }
    ]
  }
  </script>

  <style>
    .pricing-page-hero { text-align: center; padding: 56px 20px 32px; }
    .pricing-page-hero h1 { font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 800; margin-bottom: 12px; color: var(--text-primary, #1a1a2e); }
    .pricing-page-hero p { font-size: 1.1rem; color: var(--text-secondary, #555); max-width: 480px; margin: 0 auto 8px; }
    .pricing-page-wrap { max-width: 860px; margin: 0 auto; padding: 0 16px 64px; }
    .pricing-faq { margin-top: 48px; padding-top: 32px; border-top: 1px solid #eee; }
    .pricing-faq h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 20px; text-align: center; }
    .faq-item { margin-bottom: 20px; }
    .faq-item dt { font-weight: 600; margin-bottom: 4px; }
    .faq-item dd { margin: 0; color: #555; font-size: 0.95rem; }
    .pricing-back { text-align: center; margin-top: 36px; font-size: 0.9rem; color: #5a5a5a; }
    .pricing-back a { color: var(--color-brand-dark, #1f5e22); }
    .nav-link--active { font-weight: 700; color: var(--color-brand-dark, #1f5e22) !important; }
    .access-mini { background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px 24px; margin-top: 32px; text-align: center; }
    .access-mini p { margin-bottom: 12px; color: #555; font-size: 0.95rem; }
    .access-mini-form { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
    .access-mini-form input { padding: 8px 14px; border: 1px solid #ccc; border-radius: 8px; font-size: 0.95rem; min-width: 220px; }
  </style>
</head>

<body>

  ${makePricingNav(lc_code)}

  <main id="pricing-main" aria-labelledby="pricing-title">

  <!-- HERO -->
  <div class="pricing-page-hero">
    <h1 id="pricing-title">${cp.title}</h1>
    <p>${cp.subtitle}</p>
  </div>

  <!-- PRICING CARDS -->
  <div class="pricing-page-wrap">
    <div class="pricing-inner">
      <div class="pricing-cards-row">

        <!-- FREE -->
        <div class="pricing-card pricing-card--free">
          <div class="pcard-name">${cp.freeName}</div>
          <div class="pcard-price-block">
            <span class="pcard-price">0</span>
            <span class="pcard-sub">/${cp.price.split('/')[1]}</span>
          </div>
          <ul class="pcard-features">
${freeRows}
          </ul>
        </div>

        <!-- PREMIUM -->
        <div class="pricing-card pricing-card--premium">
          <div class="pcard-popular">${cp.popular}</div>
          <div class="pcard-name">${cp.premName}</div>
          <div class="pcard-price-block">
            <span class="pcard-price">${cp.price}</span>
          </div>
          <ul class="pcard-features">
${premRows}
          </ul>
          <button class="btn btn-upgrade pcard-cta" id="pay-btn" type="button">${cp.cta}</button>
          <p class="pcard-already">
            <a href="/#access-card">${cp.alreadyLabel}</a>
          </p>
        </div>

      </div>
    </div>

    <!-- Already subscribed mini-form -->
    <div class="access-mini">
      <p><i class="bi bi-gem"></i> <strong>${cp.alreadyLabel}</strong></p>
      <div class="access-mini-form">
        <input type="email" id="emailInput" placeholder="your@email.com" autocomplete="email" aria-label="Email" />
        <a href="/#access-card" class="btn btn-verify">${cp.alreadyActivate}</a>
      </div>
    </div>

    <!-- FAQ -->
    <div class="pricing-faq">
      <h2>${cp.faqTitle}</h2>
      <dl>
${faqRows}
      </dl>
    </div>

    <div class="pricing-back">
      <a href="${appHref(lc)}">${cp.backLabel}</a>
    </div>

  </div>

  </main>

  ${makeFooter(lc)}

  <script src="/js/checkout.min.js" defer></script>
</body>
</html>`;
}

/* ════════════════════════════════════════════════════════════════
   SHOPPING LIST BUILDER
   ════════════════════════════════════════════════════════════════ */
function buildShoppingList(plan, langCode) {
  const src = plan.isBudget ? budgetRecipes : recipes;
  const ingMap = {};
  [...plan.lunches, ...plan.dinners].forEach(name => {
    const r = src.find(re =>
      re.name?.[langCode] === name || re.name?.ro === name || re.name?.en === name
    );
    if (!r) return;
    const ingr = r.ingredients?.[langCode] || r.ingredients?.ro || r.ingredients?.en || [];
    ingr.forEach(i => {
      const key = i.toLowerCase().replace(/\s*\(.*?\)/g,'').trim();
      if (key && !ingMap[key]) ingMap[key] = i;
    });
  });
  return Object.values(ingMap).sort((a,b) => a.localeCompare(b));
}

/* Sentence-aware truncation. Returns text unchanged if it fits; otherwise
   prefers cutting at a sentence boundary (./。/!/?) within max-60..max; falls
   back to a word-boundary cut with a single trailing "…" (preceded by a thin
   space for visual separation). Never produces a mid-word cut. */
function sentenceTrim(text, max = 130) {
  if (!text) return '';
  text = String(text).trim();
  if (text.length <= max) return text;
  const head = text.slice(0, max);
  const sentenceEnd = Math.max(
    head.lastIndexOf('. '),
    head.lastIndexOf('。'),
    head.lastIndexOf('! '),
    head.lastIndexOf('? ')
  );
  if (sentenceEnd >= max - 60) return text.slice(0, sentenceEnd + 1);
  const wordCut = head.slice(0, max - 1);
  const lastSpace = wordCut.lastIndexOf(' ');
  return (lastSpace > 40 ? wordCut.slice(0, lastSpace) : wordCut).trimEnd() + ' …';
}

/* Short one-line meal summary for the weekly plan table. Picks the recipe's
   originText first sentence (the "tagline"), falls back to a sentence-cut
   ingredients list. ~150 char target; sentence-boundary aware. */
function mealSummary(rec, lc_code) {
  if (!rec) return '';
  const ot = rec.originText?.[lc_code] || rec.originText?.en || rec.originText?.ro || '';
  if (ot) {
    const firstSentence = ot.split(/(?:\.\s+|[。！？]\s*)/)[0] || ot;
    const trimmed = firstSentence.trim();
    if (trimmed.length <= 180) return trimmed + (trimmed.endsWith('.') || trimmed.endsWith('。') ? '' : '.');
    // Word-boundary cut at 150 chars
    const cut = trimmed.slice(0, 150);
    const lastSpace = cut.lastIndexOf(' ');
    return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut) + '…';
  }
  // Fallback: first 3 ingredients, no quantities, joined cleanly
  const ingr = rec.ingredients?.[lc_code] || rec.ingredients?.en || rec.ingredients?.ro || [];
  if (!ingr.length) return '';
  const head = ingr.slice(0, 3).map(i => i.split(',')[0].trim()).join(', ');
  return head;
}

/* ════════════════════════════════════════════════════════════════
   GENERIC planPage — works for ALL 14 languages
   ════════════════════════════════════════════════════════════════ */
function planPage(plan, lc) {
  const src = plan.isBudget ? budgetRecipes : recipes;
  const lc_code = lc.code;
  const shopping = buildShoppingList(plan, lc_code);
  const planId = lc.planIdFn(plan);
  const theme  = plan.theme[lc_code] || plan.theme.en;
  const desc   = plan.desc[lc_code]  || plan.desc.en;
  const canonical = `${lc.dir}/${planId}/`;

  const rows = lc.days.map((day, i) => {
    const lName = plan.lunches[i] || '';
    const dName = plan.dinners[i] || '';
    const lRec  = src.find(r => r.name?.ro===lName || r.name?.en===lName);
    const dRec  = src.find(r => r.name?.ro===dName || r.name?.en===dName);
    const lDispName = lRec?.name?.[lc_code] || lRec?.name?.en || lName;
    const dDispName = dRec?.name?.[lc_code] || dRec?.name?.en || dName;
    const lSummary = mealSummary(lRec, lc_code);
    const dSummary = mealSummary(dRec, lc_code);
    const lSlug = (!plan.isBudget && (lRec?.name?.en || lRec?.name?.ro)) ? `${lc.recipeBase}${slug(lRec.name?.en||lRec.name?.ro)}/` : '#';
    const dSlug = (!plan.isBudget && (dRec?.name?.en || dRec?.name?.ro)) ? `${lc.recipeBase}${slug(dRec.name?.en||dRec.name?.ro)}/` : '#';
    return `<tr>
      <td><strong>${day}</strong></td>
      <td>${lSlug!=='#'?`<a href="${lSlug}" class="recipe-link">`:''}${esc(lDispName)}${lSlug!=='#'?'</a>':''}${lSummary?`<br><small class="text-muted">${esc(lSummary)}</small>`:''}
      </td>
      <td>${dSlug!=='#'?`<a href="${dSlug}" class="recipe-link">`:''}${esc(dDispName)}${dSlug!=='#'?'</a>':''}${dSummary?`<br><small class="text-muted">${esc(dSummary)}</small>`:''}
      </td>
    </tr>`;
  }).join('');

  // Curated grouped shopping list (V2). Falls back to the legacy flat list
  // if the engine produces nothing (e.g. for budget plans with sparse data).
  let shoppingGroups = [];
  try { shoppingGroups = buildShoppingListV2(plan, lc_code, recipes, budgetRecipes); } catch (e) { shoppingGroups = []; }
  const shoppingItems = shoppingGroups.length > 0
    ? shoppingGroups.map(g => `
      <section class="shopping-group" data-group="${g.id}">
        <h3 class="shopping-group-h">${esc(g.label)}</h3>
        <ul class="shopping-group-list">
          ${g.items.map(it => `<li><span class="shop-name">${esc(it.name)}</span>${it.qty ? `<span class="shop-qty">${esc(it.qty)}</span>` : ''}</li>`).join('')}
        </ul>
      </section>`).join('')
    : shopping.map(i => `<li><i class="bi bi-check2-square"></i> ${esc(capFirst(i))}</li>`).join('\n');
  const shoppingIsGrouped = shoppingGroups.length > 0;
  const otherPlans = PLANS.filter(p => p.id !== plan.id).slice(0, 4).map(p =>
    `<a href="${lc.dir}/${lc.planIdFn(p)}/" class="content-card-mini">
      <span class="card-mini-emoji">${p.emoji}</span>
      <span>${esc(p.theme[lc_code]||p.theme.en)}</span>
    </a>`
  ).join('');

  const jsonLd = JSON.stringify({
    "@context":"https://schema.org","@type":"MealPlan",
    "name":`${theme}`, "description":desc,
    "url":`https://meal-planner.ro${canonical}`,
    "publisher":{"@type":"Organization","name":"Meal-Planner.ro","url":"https://meal-planner.ro"}
  });

  const dir_attr = lc.dir_attr || 'ltr';
  const costDisplay = lc.costValue(plan);

  return `${HEAD(lc.metaTitle(theme), desc, canonical, lc_code, dir_attr)}
<script type="application/ld+json">${jsonLd}</script>
${makeNav(lc, NAV_URL_FOR.plan(plan))}
<main class="content-main">
  <section class="content-hero${PLAN_HERO_IMG[plan.idEn] ? ' content-hero--photo' : ''}"${PLAN_HERO_IMG[plan.idEn] ? ` style="--hero-bg: url('${PLAN_HERO_IMG[plan.idEn]}')"` : ''}>
    <div class="content-hero-inner">
      <nav aria-label="breadcrumb" class="breadcrumb-nav">
        <a href="/">${lc.homeLabel}</a> › <a href="${lc.dir}/">${lc.sectionLabel}</a> › <span>${esc(theme)}</span>
      </nav>
      <div class="content-hero-badge">${plan.emoji} ${lc.planBadge}</div>
      <h1>${esc(theme)}</h1>
      <p class="content-hero-desc">${esc(desc)}</p>
      <div class="plan-meta-chips">
        <span class="plan-chip"><i class="bi bi-people-fill"></i> ${lc.persons}</span>
        <span class="plan-chip"><i class="bi bi-calendar-week"></i> ${lc.weeks}</span>
        <span class="plan-chip cost-chip"><i class="bi bi-currency-exchange"></i> ~${costDisplay} ${lc.costUnit}</span>
        <span class="plan-chip"><i class="bi bi-bag-check-fill"></i> ${lc.ingredientsLabel(shopping.length)}</span>
      </div>
      <div class="content-cta-group">
        <a href="${appHref(lc)}?autoplan=${plan.id}" class="btn btn-generate btn-lg">
          <i class="bi bi-pencil-square"></i> ${lc.openAppLabel}
        </a>
        <a href="#${lc.shoppingAnchor}" class="btn btn-outline-light btn-lg">
          <i class="bi bi-cart3"></i> ${lc.shoppingLabel}
        </a>
      </div>
    </div>
  </section>

  <section class="content-section" aria-labelledby="plan-h">
    <div class="content-section-inner">
      <h2 id="plan-h"><span class="section-emoji">📅</span> ${lc.planHeading}</h2>
      <div class="table-wrap">
        <table class="table planner-table content-table">
          <thead><tr><th>${lc.dayTh}</th><th><i class="bi bi-sun"></i> ${lc.lunchTh}</th><th><i class="bi bi-moon-stars"></i> ${lc.dinnerTh}</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  </section>

  <section class="content-section content-section--green" id="${lc.shoppingAnchor}">
    <div class="content-section-inner">
      <details class="shopping-collapsible">
        <summary class="shopping-summary">
          <h2><span class="section-emoji">🛒</span> ${lc.shoppingHeading}</h2>
          <span class="shopping-summary-meta">
            <span class="shopping-summary-count">${lc.ingredientsLabel(shopping.length)}</span>
            <span class="shopping-summary-chevron" aria-hidden="true"></span>
          </span>
        </summary>
        <div class="shopping-collapsible__body">
          <p class="section-intro">${lc.shoppingIntro(plan, shopping.length)}</p>
          ${shoppingIsGrouped
            ? `<div class="shopping-groups">${shoppingItems}</div>`
            : `<ul class="shopping-grid">${shoppingItems}</ul>`}
        </div>
      </details>
      <div class="shopping-cta">
        <a href="${appHref(lc)}?autoplan=${plan.id}" class="btn btn-generate">
          <i class="bi bi-pencil-square"></i> ${lc.openPlanLabel}
        </a>
        <small>${lc.openPlanSub}</small>
      </div>
    </div>
  </section>

  <section class="content-section">
    <div class="content-section-inner">
      <h2><span class="section-emoji">✨</span> ${lc.otherPlansHeading}</h2>
      <div class="mini-cards-grid">${otherPlans}</div>
      <div class="text-center mt-4">
        <a href="${lc.dir}/" class="btn btn-outline-primary">${lc.seeAll}</a>
      </div>
    </div>
  </section>

  <section class="content-section content-seo">
    <div class="content-section-inner">
      <h2>${lc.seoHeading}</h2>
      <ul>${lc.seoBullets.map(b=>`<li>${b}</li>`).join('')}</ul>
    </div>
  </section>
</main>
${makeFooter(lc)}
<script>
/* (1) Auto-expand the collapsible shopping list before browser print /
   Save-as-PDF, then restore. Keeps screen UX light while ensuring full
   data is captured by every export path.
   (2) Promote ?pdfv2=1 URL flag to localStorage so the opt-in survives
   the "Open in app & customize" navigation (which strips the query
   string and would otherwise drop the user back onto legacy html2pdf). */
(function(){
  var state = new WeakMap();
  function openAll(){ document.querySelectorAll('details.shopping-collapsible').forEach(function(d){ state.set(d,d.open); d.open=true; }); }
  function restore(){ document.querySelectorAll('details.shopping-collapsible').forEach(function(d){ if(state.has(d)) d.open=state.get(d); }); }
  window.addEventListener('beforeprint', openAll);
  window.addEventListener('afterprint', restore);
  try {
    var qs = new URLSearchParams(window.location.search || '');
    var f = qs.get('pdfv2');
    if (f === '1') localStorage.setItem('pdfV2', '1');
    else if (f === '0') localStorage.setItem('pdfV2', '0');
  } catch (e) {}
})();
</script>
</body></html>`;
}

/* Hero food image per plan. Lookup key is plan.idEn (English slug) so the
   same image surfaces on all 14 locales. Recipe IDs picked for visual
   "this is what the week looks like" representation. Budget intentionally
   skips a hero — keeps an emoji-only card to vary the visual rhythm. */
const PLAN_HERO_IMG = {
  'mediterranean':      recipeImages[22], // Paella
  'asian-fusion':       recipeImages[21], // Pho
  'eastern-european':   recipeImages[14], // Borscht
  'world-tour':         recipeImages[36], // Chili con carne
  'latin-american':     recipeImages[13], // Guacamole
  'vegetarian':         recipeImages[25], // Tabbouleh
  'quick-easy':         recipeImages[16], // Pad Thai
};

/* ════════════════════════════════════════════════════════════════
   GENERIC indexPage — works for ALL 14 languages
   ════════════════════════════════════════════════════════════════ */
function indexPage(lc) {
  const lc_code = lc.code;
  const cards = PLANS.map(p => {
    const theme = p.theme[lc_code] || p.theme.en;
    const desc  = sentenceTrim(p.desc[lc_code] || p.desc.en, 130);
    const planId = lc.planIdFn(p);
    const costDisplay = lc.costValue(p);
    const heroImg = PLAN_HERO_IMG[p.idEn];
    return `<a href="${lc.dir}/${planId}/" class="content-card${heroImg ? ' content-card--with-img' : ''}">
      ${heroImg ? `<div class="content-card-img"><img src="${heroImg}" alt="" loading="lazy" decoding="async"><span class="content-card-emoji">${p.emoji}</span></div>` : ''}
      <div class="content-card-body">
        ${!heroImg ? `<div class="content-card-header"><span class="card-emoji">${p.emoji}</span><h2 class="card-title">${esc(theme)}</h2></div>` : `<h2 class="card-title">${esc(theme)}</h2>`}
        <p class="card-desc">${esc(desc)}</p>
        <div class="card-meta">
          <span><i class="bi bi-currency-exchange"></i> ${costDisplay} ${lc.costUnit}</span>
          <span><i class="bi bi-arrow-right-circle-fill"></i> ${lc.indexViewPlan}</span>
        </div>
      </div>
    </a>`;
  }).join('');

  const dir_attr = lc.dir_attr || 'ltr';

  // Cuisine discovery section — surfaces the hub architecture from the
  // plan-listing index (the "Plans" nav entry point). Lightweight: 6
  // featured cuisines + a single "see all" CTA. No images here to keep
  // initial render cheap on a busy page; the hub-index handles imagery.
  const ctaLang   = CUISINE_CTA[lc_code] || CUISINE_CTA.en;
  // Phase 5: all cuisine entry points target /<lc>/<recipe-prefix>/.
  const planRl    = RECIPE_LANG[lc_code];
  const planRecipeDir = planRl ? planRl.dir : `/${lc_code}/recipes`;
  const eligible  = buildCuisineHubs();
  const featured  = eligible.slice(0, 6);
  const cuisineMinis = featured.map(([enKey, recs]) => {
    const display    = recs[0].origin?.[lc_code] || enKey;
    const flagIcon   = COUNTRY_FLAG[enKey] || '🌍';
    const originSlug = slug(enKey);
    const atmosphere = cuisineAtmosphere(enKey);
    return `<a class="cuisine-mini" href="${planRecipeDir}/${originSlug}/" data-cuisine-atmosphere="${atmosphere}">
      <span class="cuisine-mini-flag" aria-hidden="true">${flagIcon}</span>
      <span class="cuisine-mini-name">${esc(display)}</span>
      <span class="cuisine-mini-count">${recs.length}</span>
    </a>`;
  }).join('');

  return `${HEAD(lc.indexTitle, lc.indexDesc, `${lc.dir}/`, lc_code, dir_attr)}
${makeNav(lc, NAV_URL_FOR.planIndex())}
<main class="content-main">
  <section class="content-hero content-hero--short">
    <div class="content-hero-inner">
      <nav aria-label="breadcrumb" class="breadcrumb-nav">
        <a href="/">${lc.homeLabel}</a> › <span>${lc.sectionLabel}</span>
      </nav>
      <h1>${lc.indexH1raw}</h1>
      <p class="content-hero-desc">${esc(lc.indexSubdesc)}</p>
    </div>
  </section>
  <section class="content-section">
    <div class="content-section-inner">
      <div class="content-cards-grid">${cards}</div>
    </div>
  </section>
  <section class="content-section cuisine-discover">
    <div class="content-section-inner">
      <div class="cuisine-discover-head">
        <span class="cuisine-discover-eyebrow">${esc(ctaLang.eyebrow)}</span>
        <h2 class="cuisine-discover-title">${esc(ctaLang.heading)}</h2>
        <p class="cuisine-discover-sub">${esc(ctaLang.sub(eligible.length))}</p>
      </div>
      <div class="cuisine-mini-row">${cuisineMinis}</div>
      <p class="cuisine-discover-cta"><a class="cuisine-discover-btn" href="${planRecipeDir}/">${esc(ctaLang.btn(eligible.length))}</a></p>
    </div>
  </section>
  <section class="content-section content-seo">
    <div class="content-section-inner">
      <h2>${lc.indexSeoH}</h2>
      <p>${lc.indexSeoP}</p>
    </div>
  </section>
</main>
${makeFooter(lc)}
</body></html>`;
}

/* ════════════════════════════════════════════════════════════════
   RECIPE CONFIGS — all 14 languages
   ════════════════════════════════════════════════════════════════ */
const RECIPE_LANG = {
  ro: { dir:'/ro/retete',    indexTitle:'Rețete din Toată Lumea | Meal-Planner.ro',
        indexH1:'Rețete din <span class="accent">Toată Lumea</span>',
        indexDesc: n=>`${n} rețete cu ingrediente și mod de preparare.`,
        breadHome:'Acasă', breadLabel:'Rețete',
        ingredientsH:'🛒 Ingrediente', howToH:'👨‍🍳 Mod de preparare',
        addBtn: n=>`Adaugă în planul meu`, relatedH: o=>`Alte rețete din ${esc(o)}`,
        seoP: n=>`Adaugă <strong>${esc(n)}</strong> în planul tău săptămânal cu <a href="/ro/">Meal-Planner.ro</a>.`,
        pageTitle: n=>`Rețetă ${esc(n)} – Ingrediente și Mod de Preparare | Meal-Planner.ro`,
        pageDesc: (n,o)=>`Rețeta de ${n}: ingrediente, mod de preparare pas cu pas. Adaugă în planificator gratuit.`,
        heroDesc: o=>`Rețetă din ${esc(o)}. Ingrediente proaspete, preparare simplă.`,
        appDir:'/ro', lc: null },
  en: { dir:'/en/recipes',   indexTitle:`Recipes from Around the World | Meal-Planner.ro`,
        indexH1:'Recipes from <span class="accent">Around the World</span>',
        indexDesc: n=>`${n} recipes with ingredients and instructions.`,
        breadHome:'Home', breadLabel:'Recipes',
        ingredientsH:'🛒 Ingredients', howToH:'👨‍🍳 How to make it',
        addBtn: n=>`Add to my meal plan`, relatedH: o=>`More recipes from ${esc(o)}`,
        seoP: n=>`Add <strong>${esc(n)}</strong> to your weekly plan with the <a href="/en/">free Meal-Planner.ro app</a>.`,
        pageTitle: n=>`${esc(n)} Recipe – Ingredients & How to Make | Meal-Planner.ro`,
        pageDesc: (n,o)=>`${n} recipe: ingredients, step-by-step instructions. Add to your free meal planner.`,
        heroDesc: o=>`Traditional recipe from ${esc(o)}.`,
        appDir:'/en', lc: null },
  es: { dir:'/es/recetas',   indexTitle:`Recetas del Mundo | Meal-Planner.ro`,
        indexH1:'Recetas del <span class="accent">Mundo</span>',
        indexDesc: n=>`${n} recetas con ingredientes e instrucciones.`,
        breadHome:'Inicio', breadLabel:'Recetas',
        ingredientsH:'🛒 Ingredientes', howToH:'👨‍🍳 Cómo prepararlo',
        addBtn: n=>`Añadir a mi plan`, relatedH: o=>`Más recetas de ${esc(o)}`,
        seoP: n=>`Añade <strong>${esc(n)}</strong> a tu plan semanal con <a href="/es/">Meal-Planner.ro</a>.`,
        pageTitle: n=>`Receta de ${esc(n)} – Ingredientes y Preparación | Meal-Planner.ro`,
        pageDesc: (n,o)=>`Receta de ${n} de ${o}: ingredientes e instrucciones paso a paso.`,
        heroDesc: o=>`Receta tradicional de ${esc(o)}.`,
        appDir:'', lc: null },
  fr: { dir:'/fr/recettes',  indexTitle:`Recettes du Monde | Meal-Planner.ro`,
        indexH1:'Recettes du <span class="accent">Monde</span>',
        indexDesc: n=>`${n} recettes avec ingrédients et instructions.`,
        breadHome:'Accueil', breadLabel:'Recettes',
        ingredientsH:'🛒 Ingrédients', howToH:'👨‍🍳 Comment préparer',
        addBtn: n=>`Ajouter à mon plan`, relatedH: o=>`Plus de recettes de ${esc(o)}`,
        seoP: n=>`Ajoutez <strong>${esc(n)}</strong> à votre plan hebdomadaire avec <a href="/fr/">Meal-Planner.ro</a>.`,
        pageTitle: n=>`Recette ${esc(n)} – Ingrédients et Préparation | Meal-Planner.ro`,
        pageDesc: (n,o)=>`Recette de ${n} de ${o}: ingrédients et instructions étape par étape.`,
        heroDesc: o=>`Recette traditionnelle de ${esc(o)}.`,
        appDir:'', lc: null },
  de: { dir:'/de/rezepte',   indexTitle:`Rezepte aus aller Welt | Meal-Planner.ro`,
        indexH1:'Rezepte aus <span class="accent">aller Welt</span>',
        indexDesc: n=>`${n} Rezepte mit Zutaten und Anleitung.`,
        breadHome:'Startseite', breadLabel:'Rezepte',
        ingredientsH:'🛒 Zutaten', howToH:'👨‍🍳 Zubereitung',
        addBtn: n=>`Zu meinem Plan hinzufügen`, relatedH: o=>`Weitere Rezepte aus ${esc(o)}`,
        seoP: n=>`Füge <strong>${esc(n)}</strong> zu deinem Wochenplan mit <a href="/de/">Meal-Planner.ro</a> hinzu.`,
        pageTitle: n=>`${esc(n)} Rezept – Zutaten & Zubereitung | Meal-Planner.ro`,
        pageDesc: (n,o)=>`${n} Rezept aus ${o}: Zutaten und Schritt-für-Schritt-Anleitung.`,
        heroDesc: o=>`Traditionelles Rezept aus ${esc(o)}.`,
        appDir:'', lc: null },
  pt: { dir:'/pt/receitas',  indexTitle:`Receitas do Mundo | Meal-Planner.ro`,
        indexH1:'Receitas do <span class="accent">Mundo</span>',
        indexDesc: n=>`${n} receitas com ingredientes e instruções.`,
        breadHome:'Início', breadLabel:'Receitas',
        ingredientsH:'🛒 Ingredientes', howToH:'👨‍🍳 Como preparar',
        addBtn: n=>`Adicionar ao meu plano`, relatedH: o=>`Mais receitas de ${esc(o)}`,
        seoP: n=>`Adicione <strong>${esc(n)}</strong> ao seu plano semanal com <a href="/pt/">Meal-Planner.ro</a>.`,
        pageTitle: n=>`Receita de ${esc(n)} – Ingredientes e Preparo | Meal-Planner.ro`,
        pageDesc: (n,o)=>`Receita de ${n} de ${o}: ingredientes e instruções passo a passo.`,
        heroDesc: o=>`Receita tradicional de ${esc(o)}.`,
        appDir:'', lc: null },
  ru: { dir:'/ru/retsepty',  indexTitle:`Рецепты со всего мира | Meal-Planner.ro`,
        indexH1:'Рецепты со <span class="accent">всего мира</span>',
        indexDesc: n=>`${n} рецептов с ингредиентами и инструкциями.`,
        breadHome:'Главная', breadLabel:'Рецепты',
        ingredientsH:'🛒 Ингредиенты', howToH:'👨‍🍳 Как приготовить',
        addBtn: n=>`Добавить в мой план`, relatedH: o=>`Ещё рецепты из ${esc(o)}`,
        seoP: n=>`Добавьте <strong>${esc(n)}</strong> в свой план на неделю с <a href="/ru/">Meal-Planner.ro</a>.`,
        pageTitle: n=>`Рецепт ${esc(n)} – Ингредиенты и приготовление | Meal-Planner.ro`,
        pageDesc: (n,o)=>`Рецепт ${n} из ${o}: ингредиенты и пошаговые инструкции.`,
        heroDesc: o=>`Традиционный рецепт из ${esc(o)}.`,
        appDir:'', lc: null },
  ar: { dir:'/ar/wasafat',   indexTitle:`وصفات من حول العالم | Meal-Planner.ro`,
        indexH1:'وصفات من <span class="accent">حول العالم</span>',
        indexDesc: n=>`${n} وصفة مع المكونات والتعليمات.`,
        breadHome:'الرئيسية', breadLabel:'وصفات',
        ingredientsH:'🛒 المكونات', howToH:'👨‍🍳 طريقة التحضير',
        addBtn: n=>`أضف إلى خطتي`, relatedH: o=>`المزيد من وصفات ${esc(o)}`,
        seoP: n=>`أضف <strong>${esc(n)}</strong> إلى خطتك الأسبوعية مع <a href="/ar/">Meal-Planner.ro</a>.`,
        pageTitle: n=>`وصفة ${esc(n)} – المكونات وطريقة التحضير | Meal-Planner.ro`,
        pageDesc: (n,o)=>`وصفة ${n} من ${o}: مكونات وتعليمات خطوة بخطوة.`,
        heroDesc: o=>`وصفة تقليدية من ${esc(o)}.`,
        appDir:'', dir_attr:'rtl', lc: null },
  zh: { dir:'/zh/shipu',     indexTitle:`世界各地食谱 | Meal-Planner.ro`,
        indexH1:'<span class="accent">世界各地</span>食谱',
        indexDesc: n=>`${n}个食谱，含食材和制作方法。`,
        breadHome:'首页', breadLabel:'食谱',
        ingredientsH:'🛒 食材', howToH:'👨‍🍳 做法',
        addBtn: n=>`加入我的计划`, relatedH: o=>`更多来自${esc(o)}的食谱`,
        seoP: n=>`将<strong>${esc(n)}</strong>添加到您的每周计划 <a href="/zh/">Meal-Planner.ro</a>。`,
        pageTitle: n=>`${esc(n)}食谱 – 食材和做法 | Meal-Planner.ro`,
        pageDesc: (n,o)=>`${n}食谱来自${o}：食材和步骤说明。`,
        heroDesc: o=>`来自${esc(o)}的传统食谱。`,
        appDir:'', lc: null },
  ja: { dir:'/ja/reshipi',   indexTitle:`世界の料理レシピ | Meal-Planner.ro`,
        indexH1:'<span class="accent">世界の</span>料理レシピ',
        indexDesc: n=>`${n}のレシピ、材料と作り方付き。`,
        breadHome:'ホーム', breadLabel:'レシピ',
        ingredientsH:'🛒 材料', howToH:'👨‍🍳 作り方',
        addBtn: n=>`プランに追加`, relatedH: o=>`${esc(o)}のその他のレシピ`,
        seoP: n=>`<strong>${esc(n)}</strong>を<a href="/ja/">Meal-Planner.ro</a>の週間プランに追加しましょう。`,
        pageTitle: n=>`${esc(n)}のレシピ – 材料と作り方 | Meal-Planner.ro`,
        pageDesc: (n,o)=>`${o}の${n}レシピ：材料とステップごとの作り方。`,
        heroDesc: o=>`${esc(o)}の伝統的なレシピ。`,
        appDir:'', lc: null },
  hi: { dir:'/hi/recipes',   indexTitle:`दुनिया भर की रेसिपी | Meal-Planner.ro`,
        indexH1:'<span class="accent">दुनिया भर</span> की रेसिपी',
        indexDesc: n=>`${n} रेसिपी सामग्री और निर्देशों के साथ।`,
        breadHome:'होम', breadLabel:'रेसिपी',
        ingredientsH:'🛒 सामग्री', howToH:'👨‍🍳 बनाने का तरीका',
        addBtn: n=>`मेरी योजना में जोड़ें`, relatedH: o=>`${esc(o)} की और रेसिपी`,
        seoP: n=>`<strong>${esc(n)}</strong> को <a href="/hi/">Meal-Planner.ro</a> के साथ अपनी साप्ताहिक योजना में जोड़ें।`,
        pageTitle: n=>`${esc(n)} रेसिपी – सामग्री और बनाने का तरीका | Meal-Planner.ro`,
        pageDesc: (n,o)=>`${o} से ${n} रेसिपी: सामग्री और चरण-दर-चरण निर्देश।`,
        heroDesc: o=>`${esc(o)} की पारंपरिक रेसिपी।`,
        appDir:'', lc: null },
  tr: { dir:'/tr/tarifler',  indexTitle:`Dünyadan Tarifler | Meal-Planner.ro`,
        indexH1:'<span class="accent">Dünyadan</span> Tarifler',
        indexDesc: n=>`${n} tarif, malzemeler ve talimatlarla.`,
        breadHome:'Ana Sayfa', breadLabel:'Tarifler',
        ingredientsH:'🛒 Malzemeler', howToH:'👨‍🍳 Nasıl yapılır',
        addBtn: n=>`Planıma ekle`, relatedH: o=>`${esc(o)} tarihinden daha fazla tarif`,
        seoP: n=>`<strong>${esc(n)}</strong>'ı <a href="/tr/">Meal-Planner.ro</a> ile haftalık planınıza ekleyin.`,
        pageTitle: n=>`${esc(n)} Tarifi – Malzemeler ve Yapılışı | Meal-Planner.ro`,
        pageDesc: (n,o)=>`${o}'dan ${n} tarifi: malzemeler ve adım adım talimatlar.`,
        heroDesc: o=>`${esc(o)}'dan geleneksel tarif.`,
        appDir:'', lc: null },
  it: { dir:'/it/ricette',   indexTitle:`Ricette dal Mondo | Meal-Planner.ro`,
        indexH1:'Ricette dal <span class="accent">Mondo</span>',
        indexDesc: n=>`${n} ricette con ingredienti e istruzioni.`,
        breadHome:'Home', breadLabel:'Ricette',
        ingredientsH:'🛒 Ingredienti', howToH:'👨‍🍳 Come preparare',
        addBtn: n=>`Aggiungi al mio piano`, relatedH: o=>`Altre ricette da ${esc(o)}`,
        seoP: n=>`Aggiungi <strong>${esc(n)}</strong> al tuo piano settimanale con <a href="/it/">Meal-Planner.ro</a>.`,
        pageTitle: n=>`Ricetta ${esc(n)} – Ingredienti e Preparazione | Meal-Planner.ro`,
        pageDesc: (n,o)=>`Ricetta di ${n} da ${o}: ingredienti e istruzioni passo dopo passo.`,
        heroDesc: o=>`Ricetta tradizionale da ${esc(o)}.`,
        appDir:'', lc: null },
  ko: { dir:'/ko/recipes',   indexTitle:`세계 요리 레시피 | Meal-Planner.ro`,
        indexH1:'<span class="accent">세계</span> 요리 레시피',
        indexDesc: n=>`재료와 만드는 법이 있는 ${n}가지 레시피.`,
        breadHome:'홈', breadLabel:'레시피',
        ingredientsH:'🛒 재료', howToH:'👨‍🍳 만드는 법',
        addBtn: n=>`내 플랜에 추가`, relatedH: o=>`${esc(o)}의 더 많은 레시피`,
        seoP: n=>`<strong>${esc(n)}</strong>을(를) <a href="/ko/">Meal-Planner.ro</a>의 주간 플랜에 추가하세요.`,
        pageTitle: n=>`${esc(n)} 레시피 – 재료 및 만드는 법 | Meal-Planner.ro`,
        pageDesc: (n,o)=>`${o}의 ${n} 레시피: 재료와 단계별 지침.`,
        heroDesc: o=>`${esc(o)}의 전통 레시피.`,
        appDir:'', lc: null },
};
// Attach lc nav/footer builders + populate RECIPES_NAV
Object.entries(RECIPE_LANG).forEach(([code, rl]) => {
  rl.lc = LANG_CONFIGS[code];
  const label = {ro:'🍽️ Rețete',en:'🍽️ Recipes',es:'🍽️ Recetas',fr:'🍽️ Recettes',
    de:'🍽️ Rezepte',pt:'🍽️ Receitas',ru:'🍽️ Рецепты',ar:'🍽️ وصفات',
    zh:'🍽️ 食谱',ja:'🍽️ レシピ',hi:'🍽️ व्यंजन',tr:'🍽️ Tarifler',it:'🍽️ Ricette',ko:'🍽️ 레시피'}[code] || '🍽️ Recipes';
  RECIPES_NAV[code] = { href: `${rl.dir}/`, label };
});

/* ════════════════════════════════════════════════════════════════
   RECIPE UI STRINGS — premium redesign labels for all 14 languages
   ════════════════════════════════════════════════════════════════ */
const RECIPE_UI = {
  ro:{ totalTime:'Timp total', activeTime:'Timp activ', servings:'Porții', difficulty:'Dificultate', cost:'Cost',
    diffLevels:['Ușoară','Medie','Dificilă'], pdfBtn:'Previzualizare PDF', pdfTitle:'Salvare PDF: Share (⬆) → Print → Salvează ca PDF (iPhone/iPad)',
    nutritionH:'Informații nutriționale', nutritionPer:'per porție (~400 ml)',
    nutritionDisc:'Valori nutriționale estimate.',
    cal:'Calorii', prot:'Proteine', carb:'Carbohidrați', fat:'Grăsimi', fib:'Fibre',
    pairingsH:'Se potrivește perfect cu',
    seeAll:'Vezi toate rețetele →',
    ctaTitle:'Planifică-ți mesele pentru întreaga săptămână',
    ctaDesc:'Generează un plan personalizat cu rețete variate și listă automată de cumpărături.',
    ctaBtn:'Generează planul meu acum →', addShopping:'Adaugă la lista de cumpărături',
    servingsLabel:n=>`${n} porții`,
    feat:[
      {icon:'❤️',t:'Bogat în proteine',d:'Sățios și nutritiv'},
      {icon:'🐟',t:'Bogat în omega-3',d:'Ușor și sănătos'},
      {icon:'🌿',t:'Bogat în vitamine',d:'Proaspăt și sănătos'},
      {icon:'⭐',t:'Rețetă tradițională',d:'Gust autentic'},
      {icon:'❄️',t:'Se poate congela',d:'Ideală pentru meal prep'},
      {icon:'⚡',t:'Rapid de preparat',d:'Gata în sub 30 minute'},
      {icon:'🕐',t:'Fiert lent',d:'La foc mic, ore întregi'},
      {icon:'🍲',t:'Un singur vas',d:'Totul în aceeași oală'},
      {icon:'🌙',t:'Bulion peste noapte',d:'Necesită preparare cu o zi înainte'},
      {icon:'🫙',t:'Ingrediente fermentate',d:'Conține produse fermentate'},
    ],
    pairs:{
      meat:[{e:'🍷',n:'Vin roșu'},{e:'🥗',n:'Salată verde'},{e:'🍞',n:'Pâine de casă'},{e:'🥔',n:'Cartofi noi'}],
      fish:[{e:'🍋',n:'Lămâie'},{e:'🍷',n:'Vin alb'},{e:'🍚',n:'Orez fiert'},{e:'🌿',n:'Ierburi proaspete'}],
      soup:[{e:'🍞',n:'Pâine rustică'},{e:'🧄',n:'Usturoi proaspăt'},{e:'🌶️',n:'Ardei iute'},{e:'🧅',n:'Ceapă roșie'}],
      pasta:[{e:'🧀',n:'Parmezan'},{e:'🍷',n:'Vin alb'},{e:'🥗',n:'Salată'},{e:'🍞',n:'Pâine ciabatta'}],
      veg:[{e:'🫙',n:'Smântână'},{e:'🍞',n:'Pâine'},{e:'🧄',n:'Usturoi'},{e:'🥗',n:'Salată'}],
      def:[{e:'🥗',n:'Salată proaspătă'},{e:'🍷',n:'Vin'},{e:'🍞',n:'Pâine'},{e:'🌿',n:'Ierburi aromatice'}],
      korean:[{e:'🥬',n:'Kimchi'},{e:'🥣',n:'Supă doenjang'},{e:'🥢',n:'Banchan'},{e:'🍵',n:'Ceai de orz'}],
      japanese:[{e:'🍵',n:'Ceai verde'},{e:'🥢',n:'Supă miso'},{e:'🥒',n:'Murături tsukemono'},{e:'🍶',n:'Sake sau bere japoneză'}],
      italian:[{e:'🥖',n:'Pâine italiană crocantă'},{e:'🍷',n:'Vin roșu sec italian (Chianti)'},{e:'🧀',n:'Parmigiano suplimentar'},{e:'🫒',n:'Ulei de măsline extravirgin'}],
      french:[{e:'🥖',n:'Baghetă crocantă'},{e:'🍷',n:'Vin roșu francez (Bordeaux)'},{e:'🧀',n:'Platou cu brânzeturi maturate'},{e:'🌿',n:'Ierburi proaspete'}],
      mediterranean:[{e:'🧀',n:'Feta sfărâmată'},{e:'🫒',n:'Măsline Kalamata'},{e:'🍋',n:'Felii de lămâie'},{e:'🫓',n:'Pâine pita caldă'}],
      indian:[{e:'🍚',n:'Orez basmati'},{e:'🫓',n:'Naan sau roti calde'},{e:'🥒',n:'Raita răcoritor de castravete'},{e:'🥭',n:'Chutney de mango'}],
      mexican:[{e:'🌮',n:'Tortilla de porumb caldă'},{e:'🍅',n:'Salsa de roșii proaspătă'},{e:'🍋',n:'Felii de lime'},{e:'🌶️',n:'Jalapeño murat'}],
      latin:[{e:'🍚',n:'Orez alb'},{e:'🌽',n:'Banane plantain dulci'},{e:'🫘',n:'Fasole neagră'},{e:'🍋',n:'Felii de lime'}],
      thai:[{e:'🍚',n:'Orez jasmine thailandez'},{e:'🌿',n:'Busuioc thailandez și coriandru'},{e:'🌶️',n:'Ardei iute cu sos de pește'},{e:'🍋',n:'Felii de lime'}],
      vietnamese:[{e:'🍚',n:'Orez jasmine la abur'},{e:'🌿',n:'Mentă, coriandru și busuioc thailandez'},{e:'🥢',n:'Legume murate'},{e:'🍋',n:'Felii de lime'}],
      'middle-eastern':[{e:'🍯',n:'Hummus și labneh'},{e:'🥗',n:'Tabbouleh'},{e:'🫓',n:'Lipie caldă'},{e:'🥒',n:'Napi murați și măsline'}],
      'chinese':[{e:"🍵",n:"Ceai de iasomie"},{e:"🍚",n:"Orez aburit"},{e:"🥢",n:"Bok choy sotat"},{e:"🌶️",n:"Ulei picant"}],
      'eastern-european':[{e:"🥖",n:"Pâine de secară"},{e:"🥣",n:"Smântână"},{e:"🥒",n:"Castraveți murați"},{e:"🌿",n:"Mărar proaspăt"}],
      'nordic':[{e:"🫐",n:"Dulceață de merișor"},{e:"🍞",n:"Pâine crocantă de secară"},{e:"🌿",n:"Mărar proaspăt"},{e:"🐟",n:"Hering marinat"}],
      'anglo':[{e:"🍺",n:"Bere brună"},{e:"🥔",n:"Piure de cartofi"},{e:"🥬",n:"Mazăre"},{e:"🥄",n:"Sos brun"}],
      'sub-saharan':[{e:"🍚",n:"Orez alb"},{e:"🍌",n:"Banane plantain prăjite"},{e:"🌶️",n:"Sos iute"},{e:"🥬",n:"Verdețuri sotate"}],
      'central-european':[{e:"🍺",n:"Bere blondă"},{e:"🥖",n:"Pâine de secară"},{e:"🥔",n:"Cartofi fierți"},{e:"🥒",n:"Castraveți murați"}],
      'caucasus':[{e:"🍷",n:"Vin roșu Saperavi"},{e:"🌿",n:"Tarhon și coriandru"},{e:"🫓",n:"Pâine georgiană tonis puri"},{e:"🥒",n:"Murături"}],
      'central-asian':[{e:"🍵",n:"Ceai verde"},{e:"🍞",n:"Lipie non"},{e:"🧅",n:"Ceapă feliată"},{e:"🌶️",n:"Ardei iute"}],
      'dessert':[{e:"☕",n:"Espresso"},{e:"🍵",n:"Ceai negru"},{e:"🍓",n:"Fructe de pădure proaspete"},{e:"🥛",n:"Frișcă"}],
    }
  },
  en:{ totalTime:'Total time', activeTime:'Active time', servings:'Servings', difficulty:'Difficulty', cost:'Cost',
    diffLevels:['Easy','Medium','Hard'], pdfBtn:'Export PDF', pdfTitle:'Save as PDF: Share (⬆) → Print → Save as PDF (iPhone/iPad)',
    nutritionH:'Nutritional info', nutritionPer:'per serving (~400 ml)',
    nutritionDisc:'Estimated nutritional values.',
    cal:'Calories', prot:'Protein', carb:'Carbs', fat:'Fat', fib:'Fiber',
    pairingsH:'Pairs perfectly with',
    seeAll:'See all recipes →',
    ctaTitle:'Plan your meals for the entire week',
    ctaDesc:'Generate a personalized plan with varied recipes and automatic shopping list.',
    ctaBtn:'Generate my plan now →', addShopping:'Add to shopping list',
    servingsLabel:n=>`${n} servings`,
    feat:[
      {icon:'❤️',t:'Rich in protein',d:'Filling and nutritious'},
      {icon:'🐟',t:'Rich in omega-3',d:'Light and healthy'},
      {icon:'🌿',t:'Rich in vitamins',d:'Fresh and healthy'},
      {icon:'⭐',t:'Traditional recipe',d:'Authentic taste'},
      {icon:'❄️',t:'Can be frozen',d:'Great for meal prep'},
      {icon:'⚡',t:'Quick to prepare',d:'Ready in under 30 min'},
      {icon:'🕐',t:'Slow simmered',d:'Low and slow cooking'},
      {icon:'🍲',t:'One-pot',d:'Minimal washing up'},
      {icon:'🌙',t:'Overnight broth',d:'Start the day before'},
      {icon:'🫙',t:'Fermented',d:'Contains fermented ingredients'},
    ],
    pairs:{
      meat:[{e:'🍷',n:'Red wine'},{e:'🥗',n:'Green salad'},{e:'🍞',n:'Fresh bread'},{e:'🥔',n:'Roasted potatoes'}],
      fish:[{e:'🍋',n:'Lemon'},{e:'🍷',n:'White wine'},{e:'🍚',n:'Steamed rice'},{e:'🌿',n:'Fresh herbs'}],
      soup:[{e:'🍞',n:'Rustic bread'},{e:'🧄',n:'Fresh garlic'},{e:'🌶️',n:'Chili peppers'},{e:'🧅',n:'Red onion'}],
      pasta:[{e:'🧀',n:'Parmesan'},{e:'🍷',n:'White wine'},{e:'🥗',n:'Arugula salad'},{e:'🍞',n:'Ciabatta'}],
      veg:[{e:'🫙',n:'Yogurt'},{e:'🍞',n:'Bread'},{e:'🧄',n:'Garlic'},{e:'🥗',n:'Salad'}],
      def:[{e:'🥗',n:'Fresh salad'},{e:'🍷',n:'Wine'},{e:'🍞',n:'Bread'},{e:'🌿',n:'Fresh herbs'}],
      korean:[{e:'🥬',n:'Kimchi'},{e:'🥣',n:'Doenjang jjigae'},{e:'🥢',n:'Banchan sides'},{e:'🍵',n:'Barley tea'}],
      japanese:[{e:'🍵',n:'Green tea'},{e:'🥢',n:'Miso soup'},{e:'🥒',n:'Pickled vegetables (tsukemono)'},{e:'🍶',n:'Sake or Japanese beer'}],
      italian:[{e:'🥖',n:'Crusty Italian bread'},{e:'🍷',n:'Dry Italian red (Chianti)'},{e:'🧀',n:'Extra Parmigiano'},{e:'🫒',n:'Extra-virgin olive oil'}],
      french:[{e:'🥖',n:'Crusty baguette'},{e:'🍷',n:'French red (Bordeaux or Burgundy)'},{e:'🧀',n:'Aged cheese platter'},{e:'🌿',n:'Fresh herbs'}],
      mediterranean:[{e:'🧀',n:'Crumbled feta'},{e:'🫒',n:'Kalamata olives'},{e:'🍋',n:'Lemon wedges'},{e:'🫓',n:'Warm pita bread'}],
      indian:[{e:'🍚',n:'Steamed basmati rice'},{e:'🫓',n:'Warm naan or roti'},{e:'🥒',n:'Cool cucumber raita'},{e:'🥭',n:'Mango chutney'}],
      mexican:[{e:'🌮',n:'Warm corn tortillas'},{e:'🍅',n:'Fresh tomato salsa'},{e:'🍋',n:'Lime wedges'},{e:'🌶️',n:'Pickled jalapenos'}],
      latin:[{e:'🍚',n:'White rice'},{e:'🌽',n:'Sweet plantains'},{e:'🫘',n:'Black beans'},{e:'🍋',n:'Lime wedges'}],
      thai:[{e:'🍚',n:'Thai jasmine rice'},{e:'🌿',n:'Fresh Thai basil and coriander'},{e:'🌶️',n:'Birds-eye chillies in fish sauce'},{e:'🍋',n:'Lime wedges'}],
      vietnamese:[{e:'🍚',n:'Steamed jasmine rice'},{e:'🌿',n:'Mint, coriander and Thai basil'},{e:'🥢',n:'Pickled vegetables'},{e:'🍋',n:'Lime wedges'}],
      'middle-eastern':[{e:'🍯',n:'Hummus and labneh'},{e:'🥗',n:'Tabbouleh'},{e:'🫓',n:'Warm flatbread'},{e:'🥒',n:'Pickled turnips and olives'}],
      'chinese':[{e:"🍵",n:"Jasmine tea"},{e:"🍚",n:"Steamed jasmine rice"},{e:"🥢",n:"Stir-fried bok choy"},{e:"🌶️",n:"Chili oil"}],
      'eastern-european':[{e:"🥖",n:"Rye bread"},{e:"🥣",n:"Smetana"},{e:"🥒",n:"Pickled cucumbers"},{e:"🌿",n:"Fresh dill"}],
      'nordic':[{e:"🫐",n:"Lingonberry jam"},{e:"🍞",n:"Rye crispbread"},{e:"🌿",n:"Fresh dill"},{e:"🐟",n:"Pickled herring"}],
      'anglo':[{e:"🍺",n:"Ale or stout"},{e:"🥔",n:"Mashed potatoes"},{e:"🥬",n:"Garden peas"},{e:"🥄",n:"Brown gravy"}],
      'sub-saharan':[{e:"🍚",n:"Steamed white rice"},{e:"🍌",n:"Fried plantains"},{e:"🌶️",n:"Pepper sauce"},{e:"🥬",n:"Sautéed greens"}],
      'central-european':[{e:"🍺",n:"Pilsner beer"},{e:"🥖",n:"Crusty rye"},{e:"🥔",n:"Boiled potatoes"},{e:"🥒",n:"Pickled gherkins"}],
      'caucasus':[{e:"🍷",n:"Saperavi red wine"},{e:"🌿",n:"Tarragon and cilantro"},{e:"🫓",n:"Tonis puri bread"},{e:"🥒",n:"Pickled vegetables"}],
      'central-asian':[{e:"🍵",n:"Green tea"},{e:"🍞",n:"Non flatbread"},{e:"🧅",n:"Sliced raw onion"},{e:"🌶️",n:"Hot pepper"}],
      'dessert':[{e:"☕",n:"Espresso"},{e:"🍵",n:"Black tea"},{e:"🍓",n:"Fresh berries"},{e:"🥛",n:"Whipped cream"}],
    }
  },
  es:{ totalTime:'Tiempo total', activeTime:'Tiempo activo', servings:'Raciones', difficulty:'Dificultad', cost:'Coste',
    diffLevels:['Fácil','Media','Difícil'], pdfBtn:'Exportar PDF', pdfTitle:'Guardar PDF: Compartir (⬆) → Imprimir → Guardar como PDF (iPhone/iPad)',
    nutritionH:'Información nutricional', nutritionPer:'por ración (~400 ml)',
    nutritionDisc:'Valores nutricionales estimados.',
    cal:'Calorías', prot:'Proteínas', carb:'Carbohidratos', fat:'Grasas', fib:'Fibra',
    pairingsH:'Combina perfectamente con',
    seeAll:'Ver todas las recetas →',
    ctaTitle:'Planifica tus comidas para toda la semana',
    ctaDesc:'Genera un plan personalizado con recetas variadas y lista de compras automática.',
    ctaBtn:'Generar mi plan ahora →', addShopping:'Añadir a la lista de compras',
    servingsLabel:n=>`${n} raciones`,
    feat:[
      {icon:'❤️',t:'Rico en proteínas',d:'Saciante y nutritivo'},
      {icon:'🐟',t:'Rico en omega-3',d:'Ligero y saludable'},
      {icon:'🌿',t:'Rico en vitaminas',d:'Fresco y saludable'},
      {icon:'⭐',t:'Receta tradicional',d:'Sabor auténtico'},
      {icon:'❄️',t:'Se puede congelar',d:'Ideal para meal prep'},
      {icon:'⚡',t:'Rápido de preparar',d:'Listo en menos de 30 min'},
      {icon:'🕐',t:'Cocción lenta',d:'A fuego lento durante horas'},
      {icon:'🍲',t:'Un solo recipiente',d:'Mínimo fregado'},
      {icon:'🌙',t:'Caldo nocturno',d:'Empieza el día anterior'},
      {icon:'🫙',t:'Fermentado',d:'Contiene ingredientes fermentados'},
    ],
    pairs:{
      meat:[{e:'🍷',n:'Vino tinto'},{e:'🥗',n:'Ensalada verde'},{e:'🍞',n:'Pan fresco'},{e:'🥔',n:'Patatas asadas'}],
      fish:[{e:'🍋',n:'Limón'},{e:'🍷',n:'Vino blanco'},{e:'🍚',n:'Arroz al vapor'},{e:'🌿',n:'Hierbas frescas'}],
      soup:[{e:'🍞',n:'Pan rústico'},{e:'🧄',n:'Ajo fresco'},{e:'🌶️',n:'Chile'},{e:'🧅',n:'Cebolla roja'}],
      pasta:[{e:'🧀',n:'Parmesano'},{e:'🍷',n:'Vino blanco'},{e:'🥗',n:'Ensalada'},{e:'🍞',n:'Ciabatta'}],
      veg:[{e:'🫙',n:'Yogur'},{e:'🍞',n:'Pan'},{e:'🧄',n:'Ajo'},{e:'🥗',n:'Ensalada'}],
      def:[{e:'🥗',n:'Ensalada fresca'},{e:'🍷',n:'Vino'},{e:'🍞',n:'Pan'},{e:'🌿',n:'Hierbas'}],
      korean:[{e:'🥬',n:'Kimchi'},{e:'🥣',n:'Sopa doenjang'},{e:'🥢',n:'Banchan'},{e:'🍵',n:'Té de cebada'}],
      japanese:[{e:'🍵',n:'Té verde'},{e:'🥢',n:'Sopa miso'},{e:'🥒',n:'Verduras encurtidas (tsukemono)'},{e:'🍶',n:'Sake o cerveza japonesa'}],
      italian:[{e:'🥖',n:'Pan italiano crujiente'},{e:'🍷',n:'Tinto italiano seco (Chianti)'},{e:'🧀',n:'Parmigiano extra'},{e:'🫒',n:'Aceite de oliva virgen extra'}],
      french:[{e:'🥖',n:'Baguette crujiente'},{e:'🍷',n:'Tinto frances (Burdeos o Borgona)'},{e:'🧀',n:'Tabla de quesos curados'},{e:'🌿',n:'Hierbas frescas'}],
      mediterranean:[{e:'🧀',n:'Feta desmenuzado'},{e:'🫒',n:'Aceitunas Kalamata'},{e:'🍋',n:'Gajos de limon'},{e:'🫓',n:'Pan de pita caliente'}],
      indian:[{e:'🍚',n:'Arroz basmati al vapor'},{e:'🫓',n:'Naan o roti caliente'},{e:'🥒',n:'Raita fresca de pepino'},{e:'🥭',n:'Chutney de mango'}],
      mexican:[{e:'🌮',n:'Tortillas de maiz calientes'},{e:'🍅',n:'Salsa fresca de tomate'},{e:'🍋',n:'Gajos de lima'},{e:'🌶️',n:'Jalapenos en escabeche'}],
      latin:[{e:'🍚',n:'Arroz blanco'},{e:'🌽',n:'Platanos maduros'},{e:'🫘',n:'Frijoles negros'},{e:'🍋',n:'Gajos de lima'}],
      thai:[{e:'🍚',n:'Arroz jazmin tailandes'},{e:'🌿',n:'Albahaca tailandesa y cilantro'},{e:'🌶️',n:'Chiles ojo de pajaro en salsa de pescado'},{e:'🍋',n:'Gajos de lima'}],
      vietnamese:[{e:'🍚',n:'Arroz jazmin al vapor'},{e:'🌿',n:'Menta, cilantro y albahaca tailandesa'},{e:'🥢',n:'Verduras encurtidas'},{e:'🍋',n:'Gajos de lima'}],
      'middle-eastern':[{e:'🍯',n:'Hummus y labneh'},{e:'🥗',n:'Tabbouleh'},{e:'🫓',n:'Pan plano caliente'},{e:'🥒',n:'Nabos encurtidos y aceitunas'}],
    }
  },
  fr:{ totalTime:'Temps total', activeTime:'Temps actif', servings:'Portions', difficulty:'Difficulté', cost:'Coût',
    diffLevels:['Facile','Moyen','Difficile'], pdfBtn:'Exporter PDF', pdfTitle:'Enregistrer PDF : Partager (⬆) → Imprimer → Enregistrer en PDF (iPhone/iPad)',
    nutritionH:'Informations nutritionnelles', nutritionPer:'par portion (~400 ml)',
    nutritionDisc:'Valeurs nutritionnelles estimées.',
    cal:'Calories', prot:'Protéines', carb:'Glucides', fat:'Lipides', fib:'Fibres',
    pairingsH:'S\'accompagne parfaitement avec',
    seeAll:'Voir toutes les recettes →',
    ctaTitle:'Planifiez vos repas pour toute la semaine',
    ctaDesc:'Générez un plan personnalisé avec des recettes variées et une liste de courses automatique.',
    ctaBtn:'Générer mon plan maintenant →', addShopping:'Ajouter à la liste de courses',
    servingsLabel:n=>`${n} portions`,
    feat:[
      {icon:'❤️',t:'Riche en protéines',d:'Rassasiant et nutritif'},
      {icon:'🐟',t:'Riche en oméga-3',d:'Léger et sain'},
      {icon:'🌿',t:'Riche en vitamines',d:'Frais et sain'},
      {icon:'⭐',t:'Recette traditionnelle',d:'Goût authentique'},
      {icon:'❄️',t:'Se congèle bien',d:'Idéal pour le meal prep'},
      {icon:'⚡',t:'Rapide à préparer',d:'Prêt en moins de 30 min'},
      {icon:'🕐',t:'Mijoté lentement',d:'Cuisson longue à feu doux'},
      {icon:'🍲',t:'Plat unique',d:'Une seule casserole'},
      {icon:'🌙',t:'Bouillon de nuit',d:'Commencez la veille'},
      {icon:'🫙',t:'Fermenté',d:'Contient des ingrédients fermentés'},
    ],
    pairs:{
      meat:[{e:'🍷',n:'Vin rouge'},{e:'🥗',n:'Salade verte'},{e:'🍞',n:'Pain frais'},{e:'🥔',n:'Pommes de terre'}],
      fish:[{e:'🍋',n:'Citron'},{e:'🍷',n:'Vin blanc'},{e:'🍚',n:'Riz vapeur'},{e:'🌿',n:'Herbes fraîches'}],
      soup:[{e:'🍞',n:'Pain rustique'},{e:'🧄',n:'Ail frais'},{e:'🌶️',n:'Piment'},{e:'🧅',n:'Oignon rouge'}],
      pasta:[{e:'🧀',n:'Parmesan'},{e:'🍷',n:'Vin blanc'},{e:'🥗',n:'Salade'},{e:'🍞',n:'Ciabatta'}],
      veg:[{e:'🫙',n:'Yaourt'},{e:'🍞',n:'Pain'},{e:'🧄',n:'Ail'},{e:'🥗',n:'Salade'}],
      def:[{e:'🥗',n:'Salade fraîche'},{e:'🍷',n:'Vin'},{e:'🍞',n:'Pain'},{e:'🌿',n:'Herbes'}],
      korean:[{e:'🥬',n:'Kimchi'},{e:'🥣',n:'Soupe doenjang'},{e:'🥢',n:'Banchan'},{e:'🍵',n:'Thé d\'orge'}],
      japanese:[{e:'🍵',n:'Thé vert'},{e:'🥢',n:'Soupe miso'},{e:'🥒',n:'Légumes marinés (tsukemono)'},{e:'🍶',n:'Saké ou bière japonaise'}],
      italian:[{e:'🥖',n:'Pain italien croustillant'},{e:'🍷',n:'Rouge italien sec (Chianti)'},{e:'🧀',n:'Parmigiano supplementaire'},{e:'🫒',n:'Huile d olive extra vierge'}],
      french:[{e:'🥖',n:'Baguette croustillante'},{e:'🍷',n:'Rouge francais (Bordeaux ou Bourgogne)'},{e:'🧀',n:'Plateau de fromages affines'},{e:'🌿',n:'Herbes fraiches'}],
      mediterranean:[{e:'🧀',n:'Feta emiette'},{e:'🫒',n:'Olives Kalamata'},{e:'🍋',n:'Quartiers de citron'},{e:'🫓',n:'Pain pita chaud'}],
      indian:[{e:'🍚',n:'Riz basmati vapeur'},{e:'🫓',n:'Naan ou roti chaud'},{e:'🥒',n:'Raita fraiche au concombre'},{e:'🥭',n:'Chutney de mangue'}],
      mexican:[{e:'🌮',n:'Tortillas de mais chaudes'},{e:'🍅',n:'Salsa fraiche de tomate'},{e:'🍋',n:'Quartiers de citron vert'},{e:'🌶️',n:'Jalapenos marines'}],
      latin:[{e:'🍚',n:'Riz blanc'},{e:'🌽',n:'Bananes plantains sucrees'},{e:'🫘',n:'Haricots noirs'},{e:'🍋',n:'Quartiers de citron vert'}],
      thai:[{e:'🍚',n:'Riz jasmin thailandais'},{e:'🌿',n:'Basilic thai et coriandre frais'},{e:'🌶️',n:'Petits piments oiseau dans la sauce poisson'},{e:'🍋',n:'Quartiers de citron vert'}],
      vietnamese:[{e:'🍚',n:'Riz jasmin vapeur'},{e:'🌿',n:'Menthe, coriandre et basilic thai'},{e:'🥢',n:'Legumes marines'},{e:'🍋',n:'Quartiers de citron vert'}],
      'middle-eastern':[{e:'🍯',n:'Houmous et labneh'},{e:'🥗',n:'Taboule'},{e:'🫓',n:'Pain plat chaud'},{e:'🥒',n:'Navets marines et olives'}],
    }
  },
  de:{ totalTime:'Gesamtzeit', activeTime:'Aktive Zeit', servings:'Portionen', difficulty:'Schwierigkeit', cost:'Kosten',
    diffLevels:['Einfach','Mittel','Schwer'], pdfBtn:'PDF exportieren', pdfTitle:'Als PDF: Teilen (⬆) → Drucken → Als PDF sichern (iPhone/iPad)',
    nutritionH:'Nährwertangaben', nutritionPer:'pro Portion (~400 ml)',
    nutritionDisc:'Geschätzte Nährwertangaben.',
    cal:'Kalorien', prot:'Protein', carb:'Kohlenhydrate', fat:'Fett', fib:'Ballaststoffe',
    pairingsH:'Passt perfekt zu',
    seeAll:'Alle Rezepte ansehen →',
    ctaTitle:'Plane deine Mahlzeiten für die ganze Woche',
    ctaDesc:'Erstelle einen persönlichen Plan mit abwechslungsreichen Rezepten und automatischer Einkaufsliste.',
    ctaBtn:'Meinen Plan jetzt erstellen →', addShopping:'Zur Einkaufsliste hinzufügen',
    servingsLabel:n=>`${n} Portionen`,
    feat:[
      {icon:'❤️',t:'Proteinreich',d:'Sättigend und nahrhaft'},
      {icon:'🐟',t:'Reich an Omega-3',d:'Leicht und gesund'},
      {icon:'🌿',t:'Vitaminreich',d:'Frisch und gesund'},
      {icon:'⭐',t:'Traditionelles Rezept',d:'Authentischer Geschmack'},
      {icon:'❄️',t:'Einfrierbar',d:'Ideal für Meal Prep'},
      {icon:'⚡',t:'Schnell zubereitet',d:'In unter 30 Min. fertig'},
      {icon:'🕐',t:'Langsam geköchelt',d:'Stundenlang auf kleiner Flamme'},
      {icon:'🍲',t:'Ein-Topf-Gericht',d:'Minimales Abspülen'},
      {icon:'🌙',t:'Brühe über Nacht',d:'Am Vortag beginnen'},
      {icon:'🫙',t:'Fermentiert',d:'Enthält fermentierte Zutaten'},
    ],
    pairs:{
      meat:[{e:'🍷',n:'Rotwein'},{e:'🥗',n:'Grüner Salat'},{e:'🍞',n:'Frisches Brot'},{e:'🥔',n:'Bratkartoffeln'}],
      fish:[{e:'🍋',n:'Zitrone'},{e:'🍷',n:'Weißwein'},{e:'🍚',n:'Gedämpfter Reis'},{e:'🌿',n:'Frische Kräuter'}],
      soup:[{e:'🍞',n:'Rustikales Brot'},{e:'🧄',n:'Frischer Knoblauch'},{e:'🌶️',n:'Chili'},{e:'🧅',n:'Rote Zwiebel'}],
      pasta:[{e:'🧀',n:'Parmesan'},{e:'🍷',n:'Weißwein'},{e:'🥗',n:'Salat'},{e:'🍞',n:'Ciabatta'}],
      veg:[{e:'🫙',n:'Joghurt'},{e:'🍞',n:'Brot'},{e:'🧄',n:'Knoblauch'},{e:'🥗',n:'Salat'}],
      def:[{e:'🥗',n:'Frischer Salat'},{e:'🍷',n:'Wein'},{e:'🍞',n:'Brot'},{e:'🌿',n:'Kräuter'}],
      korean:[{e:'🥬',n:'Kimchi'},{e:'🥣',n:'Doenjang-Suppe'},{e:'🥢',n:'Banchan'},{e:'🍵',n:'Gerstentee'}],
      japanese:[{e:'🍵',n:'Grüner Tee'},{e:'🥢',n:'Miso-Suppe'},{e:'🥒',n:'Eingelegtes Gemüse (Tsukemono)'},{e:'🍶',n:'Sake oder japanisches Bier'}],
      italian:[{e:'🥖',n:'Knuspriges italienisches Brot'},{e:'🍷',n:'Trockener italienischer Rotwein (Chianti)'},{e:'🧀',n:'Extra Parmigiano'},{e:'🫒',n:'Natives Olivenoel extra'}],
      french:[{e:'🥖',n:'Knuspriges Baguette'},{e:'🍷',n:'Franzoesischer Rotwein (Bordeaux oder Burgund)'},{e:'🧀',n:'Gereifter Kaeseteller'},{e:'🌿',n:'Frische Kraeuter'}],
      mediterranean:[{e:'🧀',n:'Zerbroeckelter Feta'},{e:'🫒',n:'Kalamata-Oliven'},{e:'🍋',n:'Zitronenspalten'},{e:'🫓',n:'Warmes Pita-Brot'}],
      indian:[{e:'🍚',n:'Gedaempfter Basmati-Reis'},{e:'🫓',n:'Warmes Naan oder Roti'},{e:'🥒',n:'Kuehlendes Gurken-Raita'},{e:'🥭',n:'Mango-Chutney'}],
      mexican:[{e:'🌮',n:'Warme Maistortillas'},{e:'🍅',n:'Frische Tomatensalsa'},{e:'🍋',n:'Limettenspalten'},{e:'🌶️',n:'Eingelegte Jalapenos'}],
      latin:[{e:'🍚',n:'Weisser Reis'},{e:'🌽',n:'Suesse Kochbananen'},{e:'🫘',n:'Schwarze Bohnen'},{e:'🍋',n:'Limettenspalten'}],
      thai:[{e:'🍚',n:'Thailaendischer Jasminreis'},{e:'🌿',n:'Frisches thailaendisches Basilikum und Koriander'},{e:'🌶️',n:'Vogelaugenchili in Fischsauce'},{e:'🍋',n:'Limettenspalten'}],
      vietnamese:[{e:'🍚',n:'Gedaempfter Jasminreis'},{e:'🌿',n:'Minze, Koriander und thailaendisches Basilikum'},{e:'🥢',n:'Eingelegtes Gemuese'},{e:'🍋',n:'Limettenspalten'}],
      'middle-eastern':[{e:'🍯',n:'Hummus und Labneh'},{e:'🥗',n:'Tabbouleh'},{e:'🫓',n:'Warmes Fladenbrot'},{e:'🥒',n:'Eingelegte Rueben und Oliven'}],
    }
  },
  pt:{ totalTime:'Tempo total', activeTime:'Tempo ativo', servings:'Porções', difficulty:'Dificuldade', cost:'Custo',
    diffLevels:['Fácil','Média','Difícil'], pdfBtn:'Exportar PDF', pdfTitle:'Salvar PDF: Compartilhar (⬆) → Imprimir → Salvar como PDF (iPhone/iPad)',
    nutritionH:'Informação nutricional', nutritionPer:'por porção (~400 ml)',
    nutritionDisc:'Valores nutricionais estimados.',
    cal:'Calorias', prot:'Proteínas', carb:'Carboidratos', fat:'Gorduras', fib:'Fibras',
    pairingsH:'Combina perfeitamente com',
    seeAll:'Ver todas as receitas →',
    ctaTitle:'Planeje suas refeições para a semana toda',
    ctaDesc:'Gere um plano personalizado com receitas variadas e lista de compras automática.',
    ctaBtn:'Gerar meu plano agora →', addShopping:'Adicionar à lista de compras',
    servingsLabel:n=>`${n} porções`,
    feat:[
      {icon:'❤️',t:'Rico em proteínas',d:'Saciante e nutritivo'},
      {icon:'🐟',t:'Rico em ômega-3',d:'Leve e saudável'},
      {icon:'🌿',t:'Rico em vitaminas',d:'Fresco e saudável'},
      {icon:'⭐',t:'Receita tradicional',d:'Sabor autêntico'},
      {icon:'❄️',t:'Pode ser congelado',d:'Ideal para meal prep'},
      {icon:'⚡',t:'Rápido de preparar',d:'Pronto em menos de 30 min'},
      {icon:'🕐',t:'Cozido lentamente',d:'Fogo baixo por horas'},
      {icon:'🍲',t:'Um único recipiente',d:'Louça mínima'},
      {icon:'🌙',t:'Caldo noturno',d:'Comece um dia antes'},
      {icon:'🫙',t:'Fermentado',d:'Contém ingredientes fermentados'},
    ],
    pairs:{
      meat:[{e:'🍷',n:'Vinho tinto'},{e:'🥗',n:'Salada verde'},{e:'🍞',n:'Pão fresco'},{e:'🥔',n:'Batatas assadas'}],
      fish:[{e:'🍋',n:'Limão'},{e:'🍷',n:'Vinho branco'},{e:'🍚',n:'Arroz no vapor'},{e:'🌿',n:'Ervas frescas'}],
      soup:[{e:'🍞',n:'Pão rústico'},{e:'🧄',n:'Alho fresco'},{e:'🌶️',n:'Pimenta'},{e:'🧅',n:'Cebola roxa'}],
      pasta:[{e:'🧀',n:'Parmesão'},{e:'🍷',n:'Vinho branco'},{e:'🥗',n:'Salada'},{e:'🍞',n:'Ciabatta'}],
      veg:[{e:'🫙',n:'Iogurte'},{e:'🍞',n:'Pão'},{e:'🧄',n:'Alho'},{e:'🥗',n:'Salada'}],
      def:[{e:'🥗',n:'Salada fresca'},{e:'🍷',n:'Vinho'},{e:'🍞',n:'Pão'},{e:'🌿',n:'Ervas'}],
      korean:[{e:'🥬',n:'Kimchi'},{e:'🥣',n:'Sopa doenjang'},{e:'🥢',n:'Banchan'},{e:'🍵',n:'Chá de cevada'}],
      japanese:[{e:'🍵',n:'Chá verde'},{e:'🥢',n:'Sopa miso'},{e:'🥒',n:'Legumes em conserva (tsukemono)'},{e:'🍶',n:'Saquê ou cerveja japonesa'}],
      italian:[{e:'🥖',n:'Pao italiano crocante'},{e:'🍷',n:'Tinto italiano seco (Chianti)'},{e:'🧀',n:'Parmigiano extra'},{e:'🫒',n:'Azeite extra virgem'}],
      french:[{e:'🥖',n:'Baguete crocante'},{e:'🍷',n:'Tinto frances (Bordeaux ou Borgonha)'},{e:'🧀',n:'Tabua de queijos curados'},{e:'🌿',n:'Ervas frescas'}],
      mediterranean:[{e:'🧀',n:'Feta esmigalhado'},{e:'🫒',n:'Azeitonas Kalamata'},{e:'🍋',n:'Gomos de limao'},{e:'🫓',n:'Pao pita quente'}],
      indian:[{e:'🍚',n:'Arroz basmati no vapor'},{e:'🫓',n:'Naan ou roti quente'},{e:'🥒',n:'Raita refrescante de pepino'},{e:'🥭',n:'Chutney de manga'}],
      mexican:[{e:'🌮',n:'Tortilhas de milho quentes'},{e:'🍅',n:'Salsa fresca de tomate'},{e:'🍋',n:'Gomos de lima'},{e:'🌶️',n:'Jalapenos em conserva'}],
      latin:[{e:'🍚',n:'Arroz branco'},{e:'🌽',n:'Bananas-da-terra doces'},{e:'🫘',n:'Feijao preto'},{e:'🍋',n:'Gomos de lima'}],
      thai:[{e:'🍚',n:'Arroz jasmim tailandes'},{e:'🌿',n:'Manjericao tailandes e coentro fresco'},{e:'🌶️',n:'Pimentas olho-de-passaro em molho de peixe'},{e:'🍋',n:'Gomos de lima'}],
      vietnamese:[{e:'🍚',n:'Arroz jasmim no vapor'},{e:'🌿',n:'Hortela, coentro e manjericao tailandes'},{e:'🥢',n:'Vegetais em conserva'},{e:'🍋',n:'Gomos de lima'}],
      'middle-eastern':[{e:'🍯',n:'Homus e labneh'},{e:'🥗',n:'Tabule'},{e:'🫓',n:'Pao sirio quente'},{e:'🥒',n:'Nabos em conserva e azeitonas'}],
    }
  },
  ru:{ totalTime:'Общее время', activeTime:'Активное время', servings:'Порции', difficulty:'Сложность', cost:'Стоимость',
    diffLevels:['Лёгкий','Средний','Сложный'], pdfBtn:'Экспорт PDF', pdfTitle:'Сохранить PDF: Поделиться (⬆) → Печать → Сохранить как PDF (iPhone/iPad)',
    nutritionH:'Пищевая ценность', nutritionPer:'на порцию (~400 мл)',
    nutritionDisc:'Приблизительная пищевая ценность.',
    cal:'Калории', prot:'Белки', carb:'Углеводы', fat:'Жиры', fib:'Клетчатка',
    pairingsH:'Прекрасно сочетается с',
    seeAll:'Все рецепты →',
    ctaTitle:'Планируйте питание на всю неделю',
    ctaDesc:'Создайте персональный план с разнообразными рецептами и автоматическим списком покупок.',
    ctaBtn:'Создать мой план →', addShopping:'Добавить в список покупок',
    servingsLabel:n=>`${n} порции`,
    feat:[
      {icon:'❤️',t:'Богато белком',d:'Сытно и питательно'},
      {icon:'🐟',t:'Богато омега-3',d:'Лёгкое и полезное'},
      {icon:'🌿',t:'Богато витаминами',d:'Свежее и полезное'},
      {icon:'⭐',t:'Традиционный рецепт',d:'Аутентичный вкус'},
      {icon:'❄️',t:'Можно заморозить',d:'Идеально для meal prep'},
      {icon:'⚡',t:'Быстро готовится',d:'Готово менее чем за 30 мин'},
      {icon:'🕐',t:'Долгое тушение',d:'Часами на слабом огне'},
      {icon:'🍲',t:'В одной кастрюле',d:'Минимум посуды'},
      {icon:'🌙',t:'Ночной бульон',d:'Начните за день до'},
      {icon:'🫙',t:'Ферментированный',d:'Содержит ферментированные продукты'},
    ],
    pairs:{
      meat:[{e:'🍷',n:'Красное вино'},{e:'🥗',n:'Зелёный салат'},{e:'🍞',n:'Свежий хлеб'},{e:'🥔',n:'Жареный картофель'}],
      fish:[{e:'🍋',n:'Лимон'},{e:'🍷',n:'Белое вино'},{e:'🍚',n:'Варёный рис'},{e:'🌿',n:'Свежие травы'}],
      soup:[{e:'🍞',n:'Деревенский хлеб'},{e:'🧄',n:'Свежий чеснок'},{e:'🌶️',n:'Перец чили'},{e:'🧅',n:'Красный лук'}],
      pasta:[{e:'🧀',n:'Пармезан'},{e:'🍷',n:'Белое вино'},{e:'🥗',n:'Салат'},{e:'🍞',n:'Чиабатта'}],
      veg:[{e:'🫙',n:'Сметана'},{e:'🍞',n:'Хлеб'},{e:'🧄',n:'Чеснок'},{e:'🥗',n:'Салат'}],
      def:[{e:'🥗',n:'Свежий салат'},{e:'🍷',n:'Вино'},{e:'🍞',n:'Хлеб'},{e:'🌿',n:'Зелень'}],
      korean:[{e:'🥬',n:'Кимчи'},{e:'🥣',n:'Суп денджан'},{e:'🥢',n:'Панчан'},{e:'🍵',n:'Ячменный чай'}],
      japanese:[{e:'🍵',n:'Зелёный чай'},{e:'🥢',n:'Суп мисо'},{e:'🥒',n:'Маринованные овощи (цукэмоно)'},{e:'🍶',n:'Сакэ или японское пиво'}],
      italian:[{e:'🥖',n:'Хрустящий итальянский хлеб'},{e:'🍷',n:'Сухое итальянское красное (Кьянти)'},{e:'🧀',n:'Пармиджано дополнительно'},{e:'🫒',n:'Оливковое масло extra-virgin'}],
      french:[{e:'🥖',n:'Хрустящий багет'},{e:'🍷',n:'Французское красное (Бордо или Бургундия)'},{e:'🧀',n:'Доска выдержанных сыров'},{e:'🌿',n:'Свежие травы'}],
      mediterranean:[{e:'🧀',n:'Фета крошкой'},{e:'🫒',n:'Оливки Каламата'},{e:'🍋',n:'Дольки лимона'},{e:'🫓',n:'Тёплая пита'}],
      indian:[{e:'🍚',n:'Рис басмати на пару'},{e:'🫓',n:'Тёплый наан или роти'},{e:'🥒',n:'Прохладная райта с огурцом'},{e:'🥭',n:'Чатни из манго'}],
      mexican:[{e:'🌮',n:'Тёплые кукурузные тортильи'},{e:'🍅',n:'Свежая сальса из помидоров'},{e:'🍋',n:'Дольки лайма'},{e:'🌶️',n:'Маринованные халапеньо'}],
      latin:[{e:'🍚',n:'Белый рис'},{e:'🌽',n:'Сладкий жареный плантан'},{e:'🫘',n:'Чёрная фасоль'},{e:'🍋',n:'Дольки лайма'}],
      thai:[{e:'🍚',n:'Тайский жасминовый рис'},{e:'🌿',n:'Свежий тайский базилик и кинза'},{e:'🌶️',n:'Чили птичий глаз с рыбным соусом'},{e:'🍋',n:'Дольки лайма'}],
      vietnamese:[{e:'🍚',n:'Жасминовый рис на пару'},{e:'🌿',n:'Мята, кинза и тайский базилик'},{e:'🥢',n:'Маринованные овощи'},{e:'🍋',n:'Дольки лайма'}],
      'middle-eastern':[{e:'🍯',n:'Хумус и лабне'},{e:'🥗',n:'Табуле'},{e:'🫓',n:'Тёплая лепёшка'},{e:'🥒',n:'Маринованная репа и оливки'}],
    }
  },
  ar:{ totalTime:'الوقت الكلي', activeTime:'الوقت الفعلي', servings:'الحصص', difficulty:'الصعوبة', cost:'التكلفة',
    diffLevels:['سهل','متوسط','صعب'], pdfBtn:'تصدير PDF', pdfTitle:'حفظ PDF: مشاركة (⬆) ← طباعة ← حفظ كـ PDF (iPhone/iPad)',
    nutritionH:'المعلومات الغذائية', nutritionPer:'لكل حصة (~400 مل)',
    nutritionDisc:'قيم غذائية تقريبية.',
    cal:'السعرات', prot:'البروتين', carb:'الكربوهيدرات', fat:'الدهون', fib:'الألياف',
    pairingsH:'يتناسب مع',
    seeAll:'عرض كل الوصفات →',
    ctaTitle:'خطط لوجباتك لكامل الأسبوع',
    ctaDesc:'أنشئ خطة مخصصة مع وصفات متنوعة وقائمة تسوق تلقائية.',
    ctaBtn:'أنشئ خطتي الآن →', addShopping:'أضف إلى قائمة التسوق',
    servingsLabel:n=>`${n} حصص`,
    feat:[
      {icon:'❤️',t:'غني بالبروتين',d:'مشبع ومغذٍ'},
      {icon:'🐟',t:'غني بأوميغا-3',d:'خفيف وصحي'},
      {icon:'🌿',t:'غني بالفيتامينات',d:'طازج وصحي'},
      {icon:'⭐',t:'وصفة تقليدية',d:'طعم أصيل'},
      {icon:'❄️',t:'يمكن تجميده',d:'مثالي للتحضير المسبق'},
      {icon:'⚡',t:'سريع التحضير',d:'جاهز في أقل من 30 دقيقة'},
      {icon:'🕐',t:'طهي بطيء',d:'على نار هادئة لساعات'},
      {icon:'🍲',t:'وعاء واحد',d:'حد أدنى من الغسيل'},
      {icon:'🌙',t:'مرق ليلي',d:'ابدأ في اليوم السابق'},
      {icon:'🫙',t:'مخمر',d:'يحتوي على مكونات مخمرة'},
    ],
    pairs:{
      meat:[{e:'🍷',n:'نبيذ أحمر'},{e:'🥗',n:'سلطة خضراء'},{e:'🍞',n:'خبز طازج'},{e:'🥔',n:'بطاطس مشوية'}],
      fish:[{e:'🍋',n:'ليمون'},{e:'🍷',n:'نبيذ أبيض'},{e:'🍚',n:'أرز مطهو'},{e:'🌿',n:'أعشاب طازجة'}],
      soup:[{e:'🍞',n:'خبز ريفي'},{e:'🧄',n:'ثوم طازج'},{e:'🌶️',n:'فلفل حار'},{e:'🧅',n:'بصل أحمر'}],
      pasta:[{e:'🧀',n:'بارميزان'},{e:'🍷',n:'نبيذ أبيض'},{e:'🥗',n:'سلطة'},{e:'🍞',n:'خبز'}],
      veg:[{e:'🫙',n:'زبادي'},{e:'🍞',n:'خبز'},{e:'🧄',n:'ثوم'},{e:'🥗',n:'سلطة'}],
      def:[{e:'🥗',n:'سلطة طازجة'},{e:'🍷',n:'نبيذ'},{e:'🍞',n:'خبز'},{e:'🌿',n:'أعشاب'}],
      korean:[{e:'🥬',n:'كيمتشي'},{e:'🥣',n:'حساء دوينجانغ'},{e:'🥢',n:'بانتشان'},{e:'🍵',n:'شاي الشعير'}],
      japanese:[{e:'🍵',n:'شاي أخضر'},{e:'🥢',n:'حساء ميسو'},{e:'🥒',n:'خضار مخللة (تسوكيمونو)'},{e:'🍶',n:'ساكي أو بيرة يابانية'}],
      italian:[{e:'🥖',n:'خبز إيطالي مقرمش'},{e:'🍷',n:'نبيذ أحمر إيطالي جاف (كيانتي)'},{e:'🧀',n:'بارميجانو إضافي'},{e:'🫒',n:'زيت زيتون بكر ممتاز'}],
      french:[{e:'🥖',n:'باغيت مقرمشة'},{e:'🍷',n:'نبيذ أحمر فرنسي (بوردو أو بورغوني)'},{e:'🧀',n:'طبق أجبان معتقة'},{e:'🌿',n:'أعشاب طازجة'}],
      mediterranean:[{e:'🧀',n:'جبنة فيتا مفتتة'},{e:'🫒',n:'زيتون كالاماتا'},{e:'🍋',n:'شرائح ليمون'},{e:'🫓',n:'خبز بيتا دافئ'}],
      indian:[{e:'🍚',n:'أرز بسمتي على البخار'},{e:'🫓',n:'نان أو روتي دافئ'},{e:'🥒',n:'رايتا الخيار المنعشة'},{e:'🥭',n:'تشاتني المانجو'}],
      mexican:[{e:'🌮',n:'خبز تورتيا الذرة الدافئ'},{e:'🍅',n:'صلصة طماطم طازجة'},{e:'🍋',n:'شرائح ليم'},{e:'🌶️',n:'هالابينيو مخلل'}],
      latin:[{e:'🍚',n:'أرز أبيض'},{e:'🌽',n:'موز بلانتين حلو'},{e:'🫘',n:'فاصوليا سوداء'},{e:'🍋',n:'شرائح ليم'}],
      thai:[{e:'🍚',n:'أرز ياسمين تايلندي'},{e:'🌿',n:'ريحان تايلندي وكزبرة طازجة'},{e:'🌶️',n:'فلفل عين الطائر في صلصة السمك'},{e:'🍋',n:'شرائح ليم'}],
      vietnamese:[{e:'🍚',n:'أرز ياسمين على البخار'},{e:'🌿',n:'نعناع وكزبرة وريحان تايلندي'},{e:'🥢',n:'خضروات مخللة'},{e:'🍋',n:'شرائح ليم'}],
      'middle-eastern':[{e:'🍯',n:'حمص ولبنة'},{e:'🥗',n:'تبولة'},{e:'🫓',n:'خبز مرقوق دافئ'},{e:'🥒',n:'لفت مخلل وزيتون'}],
    }
  },
  zh:{ totalTime:'总时间', activeTime:'操作时间', servings:'份数', difficulty:'难度', cost:'费用',
    diffLevels:['简单','中等','困难'], pdfBtn:'导出PDF', pdfTitle:'保存PDF：共享(⬆) → 打印 → 存储为PDF (iPhone/iPad)',
    nutritionH:'营养信息', nutritionPer:'每份 (~400 ml)',
    nutritionDisc:'营养数据仅供参考。',
    cal:'卡路里', prot:'蛋白质', carb:'碳水化合物', fat:'脂肪', fib:'膳食纤维',
    pairingsH:'完美搭配',
    seeAll:'查看全部食谱 →',
    ctaTitle:'为整周规划您的餐食',
    ctaDesc:'生成包含多种食谱和自动购物清单的个性化计划。',
    ctaBtn:'立即生成我的计划 →', addShopping:'添加到购物清单',
    servingsLabel:n=>`${n}份`,
    feat:[
      {icon:'❤️',t:'富含蛋白质',d:'饱腹又营养'},
      {icon:'🐟',t:'富含omega-3',d:'清淡健康'},
      {icon:'🌿',t:'富含维生素',d:'新鲜健康'},
      {icon:'⭐',t:'传统食谱',d:'正宗口味'},
      {icon:'❄️',t:'可冷冻保存',d:'非常适合备餐'},
      {icon:'⚡',t:'快速制作',d:'30分钟内完成'},
      {icon:'🕐',t:'慢炖',d:'小火慢煮数小时'},
      {icon:'🍲',t:'一锅到底',d:'轻松清洗'},
      {icon:'🌙',t:'隔夜高汤',d:'提前一天开始'},
      {icon:'🫙',t:'发酵食品',d:'含有发酵食材'},
    ],
    pairs:{
      meat:[{e:'🍷',n:'红酒'},{e:'🥗',n:'绿色沙拉'},{e:'🍞',n:'新鲜面包'},{e:'🥔',n:'烤土豆'}],
      fish:[{e:'🍋',n:'柠檬'},{e:'🍷',n:'白葡萄酒'},{e:'🍚',n:'蒸米饭'},{e:'🌿',n:'新鲜香草'}],
      soup:[{e:'🍞',n:'乡村面包'},{e:'🧄',n:'新鲜大蒜'},{e:'🌶️',n:'辣椒'},{e:'🧅',n:'红洋葱'}],
      pasta:[{e:'🧀',n:'帕玛森芝士'},{e:'🍷',n:'白葡萄酒'},{e:'🥗',n:'沙拉'},{e:'🍞',n:'拖鞋面包'}],
      veg:[{e:'🫙',n:'酸奶'},{e:'🍞',n:'面包'},{e:'🧄',n:'大蒜'},{e:'🥗',n:'沙拉'}],
      def:[{e:'🥗',n:'新鲜沙拉'},{e:'🍷',n:'葡萄酒'},{e:'🍞',n:'面包'},{e:'🌿',n:'香草'}],
      korean:[{e:'🥬',n:'泡菜'},{e:'🥣',n:'大酱汤'},{e:'🥢',n:'小菜'},{e:'🍵',n:'大麦茶'}],
      japanese:[{e:'🍵',n:'绿茶'},{e:'🥢',n:'味噌汤'},{e:'🥒',n:'腌菜（漬物）'},{e:'🍶',n:'清酒或日本啤酒'}],
      italian:[{e:'🥖',n:'酥脆意大利面包'},{e:'🍷',n:'意大利干红（基安蒂）'},{e:'🧀',n:'额外帕玛森干酪'},{e:'🫒',n:'特级初榨橄榄油'}],
      french:[{e:'🥖',n:'酥脆法棍'},{e:'🍷',n:'法国红葡萄酒（波尔多或勃艮第）'},{e:'🧀',n:'陈年奶酪拼盘'},{e:'🌿',n:'新鲜香草'}],
      mediterranean:[{e:'🧀',n:'碎菲达奶酪'},{e:'🫒',n:'卡拉马塔橄榄'},{e:'🍋',n:'柠檬角'},{e:'🫓',n:'温热皮塔饼'}],
      indian:[{e:'🍚',n:'蒸印度香米'},{e:'🫓',n:'温热馕饼或印度薄饼'},{e:'🥒',n:'清爽黄瓜酸奶酱'},{e:'🥭',n:'芒果酸辣酱'}],
      mexican:[{e:'🌮',n:'温热玉米饼'},{e:'🍅',n:'新鲜番茄莎莎酱'},{e:'🍋',n:'青柠角'},{e:'🌶️',n:'腌墨西哥辣椒'}],
      latin:[{e:'🍚',n:'白米饭'},{e:'🌽',n:'甜煎大蕉'},{e:'🫘',n:'黑豆'},{e:'🍋',n:'青柠角'}],
      thai:[{e:'🍚',n:'泰国茉莉香米'},{e:'🌿',n:'新鲜泰国罗勒与香菜'},{e:'🌶️',n:'鱼露泡小米椒'},{e:'🍋',n:'青柠角'}],
      vietnamese:[{e:'🍚',n:'蒸茉莉香米'},{e:'🌿',n:'薄荷、香菜和泰国罗勒'},{e:'🥢',n:'腌菜'},{e:'🍋',n:'青柠角'}],
      'middle-eastern':[{e:'🍯',n:'鹰嘴豆泥与拉巴尼'},{e:'🥗',n:'塔布勒沙拉'},{e:'🫓',n:'温热薄饼'},{e:'🥒',n:'腌芜菁与橄榄'}],
    }
  },
  ja:{ totalTime:'合計時間', activeTime:'調理時間', servings:'人数', difficulty:'難易度', cost:'費用',
    diffLevels:['簡単','普通','難しい'], pdfBtn:'PDFエクスポート', pdfTitle:'PDFで保存：共有(⬆) → プリント → PDFを保存 (iPhone/iPad)',
    nutritionH:'栄養情報', nutritionPer:'1人前あたり (~400 ml)',
    nutritionDisc:'栄養価は推定値です。',
    cal:'カロリー', prot:'タンパク質', carb:'炭水化物', fat:'脂質', fib:'食物繊維',
    pairingsH:'と相性抜群',
    seeAll:'全レシピを見る →',
    ctaTitle:'1週間の食事を計画しましょう',
    ctaDesc:'様々なレシピと自動買い物リスト付きのパーソナライズされたプランを作成します。',
    ctaBtn:'プランを今すぐ作成 →', addShopping:'買い物リストに追加',
    servingsLabel:n=>`${n}人前`,
    feat:[
      {icon:'❤️',t:'タンパク質豊富',d:'満腹感と栄養満点'},
      {icon:'🐟',t:'オメガ3豊富',d:'軽くてヘルシー'},
      {icon:'🌿',t:'ビタミン豊富',d:'新鮮でヘルシー'},
      {icon:'⭐',t:'伝統的なレシピ',d:'本格的な味'},
      {icon:'❄️',t:'冷凍保存可',d:'ミールプレップに最適'},
      {icon:'⚡',t:'素早く調理',d:'30分以内に完成'},
      {icon:'🕐',t:'じっくり煮込み',d:'弱火でゆっくり調理'},
      {icon:'🍲',t:'ワンポット',d:'後片付けが楽'},
      {icon:'🌙',t:'一晩かけたブロス',d:'前日から仕込む'},
      {icon:'🫙',t:'発酵食材使用',d:'発酵食品を含む'},
    ],
    pairs:{
      meat:[{e:'🍷',n:'赤ワイン'},{e:'🥗',n:'グリーンサラダ'},{e:'🍞',n:'パン'},{e:'🥔',n:'ローストポテト'}],
      fish:[{e:'🍋',n:'レモン'},{e:'🍷',n:'白ワイン'},{e:'🍚',n:'蒸しご飯'},{e:'🌿',n:'フレッシュハーブ'}],
      soup:[{e:'🍞',n:'田舎パン'},{e:'🧄',n:'新鮮ニンニク'},{e:'🌶️',n:'唐辛子'},{e:'🧅',n:'赤玉ねぎ'}],
      pasta:[{e:'🧀',n:'パルメザン'},{e:'🍷',n:'白ワイン'},{e:'🥗',n:'サラダ'},{e:'🍞',n:'チャバタ'}],
      veg:[{e:'🫙',n:'ヨーグルト'},{e:'🍞',n:'パン'},{e:'🧄',n:'ニンニク'},{e:'🥗',n:'サラダ'}],
      def:[{e:'🥗',n:'フレッシュサラダ'},{e:'🍷',n:'ワイン'},{e:'🍞',n:'パン'},{e:'🌿',n:'ハーブ'}],
      korean:[{e:'🥬',n:'キムチ'},{e:'🥣',n:'テンジャンチゲ'},{e:'🥢',n:'バンチャン'},{e:'🍵',n:'麦茶'}],
      japanese:[{e:'🍵',n:'緑茶'},{e:'🥢',n:'味噌汁'},{e:'🥒',n:'漬物'},{e:'🍶',n:'日本酒またはビール'}],
      italian:[{e:'🥖',n:'カリッとしたイタリアンパン'},{e:'🍷',n:'辛口イタリア赤ワイン（キャンティ）'},{e:'🧀',n:'追いパルミジャーノ'},{e:'🫒',n:'エクストラバージンオリーブオイル'}],
      french:[{e:'🥖',n:'クラスティなバゲット'},{e:'🍷',n:'フランス赤ワイン（ボルドーまたはブルゴーニュ）'},{e:'🧀',n:'熟成チーズの盛り合わせ'},{e:'🌿',n:'フレッシュハーブ'}],
      mediterranean:[{e:'🧀',n:'崩したフェタチーズ'},{e:'🫒',n:'カラマタオリーブ'},{e:'🍋',n:'レモンのくし形切り'},{e:'🫓',n:'温かいピタパン'}],
      indian:[{e:'🍚',n:'蒸したバスマティライス'},{e:'🫓',n:'温かいナンまたはロティ'},{e:'🥒',n:'ひんやりキュウリのライタ'},{e:'🥭',n:'マンゴーチャツネ'}],
      mexican:[{e:'🌮',n:'温かいコーントルティーヤ'},{e:'🍅',n:'フレッシュトマトサルサ'},{e:'🍋',n:'ライムのくし切り'},{e:'🌶️',n:'ピクルスハラペーニョ'}],
      latin:[{e:'🍚',n:'白米飯'},{e:'🌽',n:'甘い揚げプランテン'},{e:'🫘',n:'黒豆'},{e:'🍋',n:'ライムのくし切り'}],
      thai:[{e:'🍚',n:'タイ産ジャスミンライス'},{e:'🌿',n:'新鮮なタイバジルとコリアンダー'},{e:'🌶️',n:'魚醤に漬けたバーズアイチリ'},{e:'🍋',n:'ライムのくし切り'}],
      vietnamese:[{e:'🍚',n:'蒸したジャスミンライス'},{e:'🌿',n:'ミント、コリアンダー、タイバジル'},{e:'🥢',n:'ピクルス野菜'},{e:'🍋',n:'ライムのくし切り'}],
      'middle-eastern':[{e:'🍯',n:'フムスとラブネ'},{e:'🥗',n:'タブレ'},{e:'🫓',n:'温かいフラットブレッド'},{e:'🥒',n:'カブのピクルスとオリーブ'}],
    }
  },
  hi:{ totalTime:'कुल समय', activeTime:'सक्रिय समय', servings:'सर्विंग्स', difficulty:'कठिनाई', cost:'लागत',
    diffLevels:['आसान','मध्यम','कठिन'], pdfBtn:'PDF एक्सपोर्ट', pdfTitle:'PDF सेव: Share (⬆) → Print → Save as PDF (iPhone/iPad)',
    nutritionH:'पोषण संबंधी जानकारी', nutritionPer:'प्रति सर्विंग (~400 ml)',
    nutritionDisc:'अनुमानित पोषण मूल्य।',
    cal:'कैलोरी', prot:'प्रोटीन', carb:'कार्बोहाइड्रेट', fat:'वसा', fib:'फाइबर',
    pairingsH:'के साथ बेहतरीन लगता है',
    seeAll:'सभी रेसिपी देखें →',
    ctaTitle:'पूरे सप्ताह के लिए अपने भोजन की योजना बनाएं',
    ctaDesc:'विविध व्यंजनों और स्वचालित खरीदारी सूची के साथ एक व्यक्तिगत योजना बनाएं।',
    ctaBtn:'अभी मेरी योजना बनाएं →', addShopping:'खरीदारी सूची में जोड़ें',
    servingsLabel:n=>`${n} सर्विंग्स`,
    feat:[
      {icon:'❤️',t:'प्रोटीन से भरपूर',d:'भरपेट और पौष्टिक'},
      {icon:'🐟',t:'ओमेगा-3 से भरपूर',d:'हल्का और स्वस्थ'},
      {icon:'🌿',t:'विटामिन से भरपूर',d:'ताजा और स्वस्थ'},
      {icon:'⭐',t:'पारंपरिक रेसिपी',d:'असली स्वाद'},
      {icon:'❄️',t:'फ्रीज किया जा सकता है',d:'मील प्रेप के लिए बढ़िया'},
      {icon:'⚡',t:'जल्दी तैयार होता है',d:'30 मिनट में तैयार'},
      {icon:'🕐',t:'धीमी आंच पर',d:'घंटों तक धीमी आंच पर'},
      {icon:'🍲',t:'एक बर्तन में',d:'कम बर्तन'},
      {icon:'🌙',t:'रात भर बना शोरबा',d:'एक दिन पहले शुरू करें'},
      {icon:'🫙',t:'किण्वित',d:'किण्वित सामग्री युक्त'},
    ],
    pairs:{
      meat:[{e:'🍷',n:'रेड वाइन'},{e:'🥗',n:'हरा सलाद'},{e:'🍞',n:'ताजी ब्रेड'},{e:'🥔',n:'भुने आलू'}],
      fish:[{e:'🍋',n:'नींबू'},{e:'🍷',n:'व्हाइट वाइन'},{e:'🍚',n:'उबला चावल'},{e:'🌿',n:'ताजी जड़ी-बूटियां'}],
      soup:[{e:'🍞',n:'देहाती ब्रेड'},{e:'🧄',n:'ताजा लहसुन'},{e:'🌶️',n:'मिर्च'},{e:'🧅',n:'लाल प्याज'}],
      pasta:[{e:'🧀',n:'परमेसन'},{e:'🍷',n:'व्हाइट वाइन'},{e:'🥗',n:'सलाद'},{e:'🍞',n:'ब्रेड'}],
      veg:[{e:'🫙',n:'दही'},{e:'🍞',n:'रोटी'},{e:'🧄',n:'लहसुन'},{e:'🥗',n:'सलाद'}],
      def:[{e:'🥗',n:'ताजा सलाद'},{e:'🍷',n:'वाइन'},{e:'🍞',n:'ब्रेड'},{e:'🌿',n:'जड़ी-बूटियां'}],
      korean:[{e:'🥬',n:'किमची'},{e:'🥣',n:'दोएंजांग जिगे'},{e:'🥢',n:'बैनचान'},{e:'🍵',n:'जौ की चाय'}],
      japanese:[{e:'🍵',n:'हरी चाय'},{e:'🥢',n:'मिसो सूप'},{e:'🥒',n:'अचार सब्जियां (त्सुकेमोनो)'},{e:'🍶',n:'साके या जापानी बियर'}],
      italian:[{e:'🥖',n:'कुरकुरी इतालवी ब्रेड'},{e:'🍷',n:'सूखी इतालवी रेड वाइन (कीआंती)'},{e:'🧀',n:'अतिरिक्त परमिजानो'},{e:'🫒',n:'एक्स्ट्रा वर्जिन ऑलिव ऑयल'}],
      french:[{e:'🥖',n:'कुरकुरी बैगेट'},{e:'🍷',n:'फ्रांसीसी रेड वाइन (बोर्डो या बरगंडी)'},{e:'🧀',n:'पुराने पनीर का प्लेटर'},{e:'🌿',n:'ताज़ी जड़ी-बूटियाँ'}],
      mediterranean:[{e:'🧀',n:'टुकड़ा किया फेटा'},{e:'🫒',n:'कलामाता जैतून'},{e:'🍋',n:'नींबू के टुकड़े'},{e:'🫓',n:'गरम पीटा ब्रेड'}],
      indian:[{e:'🍚',n:'भापदार बासमती चावल'},{e:'🫓',n:'गरम नान या रोटी'},{e:'🥒',n:'ठंडा खीरा रायता'},{e:'🥭',n:'आम की चटनी'}],
      mexican:[{e:'🌮',n:'गरम मक्के की टॉर्टिला'},{e:'🍅',n:'ताज़ा टमाटर साल्सा'},{e:'🍋',n:'लाइम के टुकड़े'},{e:'🌶️',n:'अचारी हलापीनो'}],
      latin:[{e:'🍚',n:'सफेद चावल'},{e:'🌽',n:'मीठे प्लांटेन'},{e:'🫘',n:'काली राजमा'},{e:'🍋',n:'लाइम के टुकड़े'}],
      thai:[{e:'🍚',n:'थाई जैस्मीन चावल'},{e:'🌿',n:'ताज़ा थाई तुलसी और धनिया'},{e:'🌶️',n:'फिश सॉस में बर्ड्स-आई मिर्च'},{e:'🍋',n:'लाइम के टुकड़े'}],
      vietnamese:[{e:'🍚',n:'भापदार जैस्मीन चावल'},{e:'🌿',n:'पुदीना, धनिया और थाई तुलसी'},{e:'🥢',n:'अचारी सब्जियाँ'},{e:'🍋',n:'लाइम के टुकड़े'}],
      'middle-eastern':[{e:'🍯',n:'हम्मस और लबनेह'},{e:'🥗',n:'तब्बौलेह'},{e:'🫓',n:'गरम फ्लैटब्रेड'},{e:'🥒',n:'अचारी शलजम और जैतून'}],
    }
  },
  tr:{ totalTime:'Toplam süre', activeTime:'Aktif süre', servings:'Porsiyon', difficulty:'Zorluk', cost:'Maliyet',
    diffLevels:['Kolay','Orta','Zor'], pdfBtn:'PDF Dışa Aktar', pdfTitle:'PDF kaydet: Paylaş (⬆) → Yazdır → PDF Olarak Kaydet (iPhone/iPad)',
    nutritionH:'Besin değerleri', nutritionPer:'porsiyon başına (~400 ml)',
    nutritionDisc:'Tahmini besin değerleri.',
    cal:'Kalori', prot:'Protein', carb:'Karbonhidrat', fat:'Yağ', fib:'Lif',
    pairingsH:'Mükemmel uyum sağlar',
    seeAll:'Tüm tarifleri gör →',
    ctaTitle:'Tüm hafta için öğünlerinizi planlayın',
    ctaDesc:'Çeşitli tarifler ve otomatik alışveriş listesiyle kişiselleştirilmiş bir plan oluşturun.',
    ctaBtn:'Planımı şimdi oluştur →', addShopping:'Alışveriş listesine ekle',
    servingsLabel:n=>`${n} porsiyon`,
    feat:[
      {icon:'❤️',t:'Protein bakımından zengin',d:'Doyurucu ve besleyici'},
      {icon:'🐟',t:'Omega-3 bakımından zengin',d:'Hafif ve sağlıklı'},
      {icon:'🌿',t:'Vitamin bakımından zengin',d:'Taze ve sağlıklı'},
      {icon:'⭐',t:'Geleneksel tarif',d:'Özgün lezzet'},
      {icon:'❄️',t:'Dondurulabilir',d:'Meal prep için ideal'},
      {icon:'⚡',t:'Hızlı hazırlık',d:'30 dakikada hazır'},
      {icon:'🕐',t:'Yavaş pişirme',d:'Saatlerce kısık ateşte'},
      {icon:'🍲',t:'Tek tencere',d:'Az bulaşık'},
      {icon:'🌙',t:'Gece boyunca et suyu',d:'Bir gün önceden başlayın'},
      {icon:'🫙',t:'Fermente',d:'Fermente içerikler içerir'},
    ],
    pairs:{
      meat:[{e:'🍷',n:'Kırmızı şarap'},{e:'🥗',n:'Yeşil salata'},{e:'🍞',n:'Taze ekmek'},{e:'🥔',n:'Fırın patates'}],
      fish:[{e:'🍋',n:'Limon'},{e:'🍷',n:'Beyaz şarap'},{e:'🍚',n:'Buharda pilav'},{e:'🌿',n:'Taze otlar'}],
      soup:[{e:'🍞',n:'Köy ekmeği'},{e:'🧄',n:'Taze sarımsak'},{e:'🌶️',n:'Biber'},{e:'🧅',n:'Kırmızı soğan'}],
      pasta:[{e:'🧀',n:'Parmesan'},{e:'🍷',n:'Beyaz şarap'},{e:'🥗',n:'Salata'},{e:'🍞',n:'Ciabatta'}],
      veg:[{e:'🫙',n:'Yoğurt'},{e:'🍞',n:'Ekmek'},{e:'🧄',n:'Sarımsak'},{e:'🥗',n:'Salata'}],
      def:[{e:'🥗',n:'Taze salata'},{e:'🍷',n:'Şarap'},{e:'🍞',n:'Ekmek'},{e:'🌿',n:'Otlar'}],
      korean:[{e:'🥬',n:'Kimchi'},{e:'🥣',n:'Doenjang çorbası'},{e:'🥢',n:'Banchan'},{e:'🍵',n:'Arpa çayı'}],
      japanese:[{e:'🍵',n:'Yeşil çay'},{e:'🥢',n:'Miso çorbası'},{e:'🥒',n:'Turşu sebzeler (tsukemono)'},{e:'🍶',n:'Sake veya Japon birası'}],
      italian:[{e:'🥖',n:'Çıtır İtalyan ekmeği'},{e:'🍷',n:'Sek İtalyan kırmızı şarabı (Chianti)'},{e:'🧀',n:'İlave Parmigiano'},{e:'🫒',n:'Sızma zeytinyağı'}],
      french:[{e:'🥖',n:'Çıtır baget'},{e:'🍷',n:'Fransız kırmızı şarabı (Bordeaux veya Burgundy)'},{e:'🧀',n:'Olgunlaşmış peynir tabağı'},{e:'🌿',n:'Taze otlar'}],
      mediterranean:[{e:'🧀',n:'Ufalanmış feta'},{e:'🫒',n:'Kalamata zeytinleri'},{e:'🍋',n:'Limon dilimleri'},{e:'🫓',n:'Sıcak pita ekmeği'}],
      indian:[{e:'🍚',n:'Buğulanmış basmati pirinci'},{e:'🫓',n:'Sıcak naan veya roti'},{e:'🥒',n:'Serin salatalık raita'},{e:'🥭',n:'Mango chutney'}],
      mexican:[{e:'🌮',n:'Sıcak mısır tortillaları'},{e:'🍅',n:'Taze domates salsası'},{e:'🍋',n:'Misket limonu dilimleri'},{e:'🌶️',n:'Turşu jalapeno'}],
      latin:[{e:'🍚',n:'Beyaz pirinç'},{e:'🌽',n:'Tatlı muz plantain'},{e:'🫘',n:'Siyah fasulye'},{e:'🍋',n:'Misket limonu dilimleri'}],
      thai:[{e:'🍚',n:'Tay yasemin pirinci'},{e:'🌿',n:'Taze Tay fesleğeni ve kişniş'},{e:'🌶️',n:'Balık sosunda kuş gözü biberi'},{e:'🍋',n:'Misket limonu dilimleri'}],
      vietnamese:[{e:'🍚',n:'Buğulanmış yasemin pirinci'},{e:'🌿',n:'Nane, kişniş ve Tay fesleğeni'},{e:'🥢',n:'Turşu sebzeler'},{e:'🍋',n:'Misket limonu dilimleri'}],
      'middle-eastern':[{e:'🍯',n:'Humus ve labne'},{e:'🥗',n:'Tabule'},{e:'🫓',n:'Sıcak lavaş'},{e:'🥒',n:'Şalgam turşusu ve zeytin'}],
    }
  },
  it:{ totalTime:'Tempo totale', activeTime:'Tempo attivo', servings:'Porzioni', difficulty:'Difficoltà', cost:'Costo',
    diffLevels:['Facile','Media','Difficile'], pdfBtn:'Esporta PDF', pdfTitle:'Salva PDF: Condividi (⬆) → Stampa → Salva come PDF (iPhone/iPad)',
    nutritionH:'Informazioni nutrizionali', nutritionPer:'per porzione (~400 ml)',
    nutritionDisc:'Valori nutrizionali stimati.',
    cal:'Calorie', prot:'Proteine', carb:'Carboidrati', fat:'Grassi', fib:'Fibre',
    pairingsH:'Si abbina perfettamente con',
    seeAll:'Vedi tutte le ricette →',
    ctaTitle:'Pianifica i tuoi pasti per tutta la settimana',
    ctaDesc:'Genera un piano personalizzato con ricette variate e lista della spesa automatica.',
    ctaBtn:'Genera il mio piano ora →', addShopping:'Aggiungi alla lista della spesa',
    servingsLabel:n=>`${n} porzioni`,
    feat:[
      {icon:'❤️',t:'Ricco di proteine',d:'Saziante e nutriente'},
      {icon:'🐟',t:'Ricco di omega-3',d:'Leggero e salutare'},
      {icon:'🌿',t:'Ricco di vitamine',d:'Fresco e salutare'},
      {icon:'⭐',t:'Ricetta tradizionale',d:'Sapore autentico'},
      {icon:'❄️',t:'Si può congelare',d:'Ideale per il meal prep'},
      {icon:'⚡',t:'Veloce da preparare',d:'Pronto in meno di 30 min'},
      {icon:'🕐',t:'Cottura lenta',d:'A fuoco basso per ore'},
      {icon:'🍲',t:'Un solo tegame',d:'Minimo da lavare'},
      {icon:'🌙',t:'Brodo notturno',d:'Inizia il giorno prima'},
      {icon:'🫙',t:'Fermentato',d:'Contiene ingredienti fermentati'},
    ],
    pairs:{
      meat:[{e:'🍷',n:'Vino rosso'},{e:'🥗',n:'Insalata verde'},{e:'🍞',n:'Pane fresco'},{e:'🥔',n:'Patate al forno'}],
      fish:[{e:'🍋',n:'Limone'},{e:'🍷',n:'Vino bianco'},{e:'🍚',n:'Riso al vapore'},{e:'🌿',n:'Erbe fresche'}],
      soup:[{e:'🍞',n:'Pane rustico'},{e:'🧄',n:'Aglio fresco'},{e:'🌶️',n:'Peperoncino'},{e:'🧅',n:'Cipolla rossa'}],
      pasta:[{e:'🧀',n:'Parmigiano'},{e:'🍷',n:'Vino bianco'},{e:'🥗',n:'Insalata'},{e:'🍞',n:'Ciabatta'}],
      veg:[{e:'🫙',n:'Yogurt'},{e:'🍞',n:'Pane'},{e:'🧄',n:'Aglio'},{e:'🥗',n:'Insalata'}],
      def:[{e:'🥗',n:'Insalata fresca'},{e:'🍷',n:'Vino'},{e:'🍞',n:'Pane'},{e:'🌿',n:'Erbe'}],
      korean:[{e:'🥬',n:'Kimchi'},{e:'🥣',n:'Zuppa doenjang'},{e:'🥢',n:'Banchan'},{e:'🍵',n:'Tè d\'orzo'}],
      japanese:[{e:'🍵',n:'Tè verde'},{e:'🥢',n:'Zuppa miso'},{e:'🥒',n:'Verdure in salamoia (tsukemono)'},{e:'🍶',n:'Sake o birra giapponese'}],
      italian:[{e:'🥖',n:'Pane italiano croccante'},{e:'🍷',n:'Rosso italiano secco (Chianti)'},{e:'🧀',n:'Parmigiano extra'},{e:'🫒',n:'Olio extravergine d oliva'}],
      french:[{e:'🥖',n:'Baguette croccante'},{e:'🍷',n:'Rosso francese (Bordeaux o Borgogna)'},{e:'🧀',n:'Tagliere di formaggi stagionati'},{e:'🌿',n:'Erbe fresche'}],
      mediterranean:[{e:'🧀',n:'Feta sbriciolata'},{e:'🫒',n:'Olive Kalamata'},{e:'🍋',n:'Spicchi di limone'},{e:'🫓',n:'Pita calda'}],
      indian:[{e:'🍚',n:'Riso basmati al vapore'},{e:'🫓',n:'Naan o roti caldo'},{e:'🥒',n:'Raita fresca al cetriolo'},{e:'🥭',n:'Chutney di mango'}],
      mexican:[{e:'🌮',n:'Tortillas di mais calde'},{e:'🍅',n:'Salsa fresca di pomodoro'},{e:'🍋',n:'Spicchi di lime'},{e:'🌶️',n:'Jalapenos sott aceto'}],
      latin:[{e:'🍚',n:'Riso bianco'},{e:'🌽',n:'Platani dolci'},{e:'🫘',n:'Fagioli neri'},{e:'🍋',n:'Spicchi di lime'}],
      thai:[{e:'🍚',n:'Riso jasmine thailandese'},{e:'🌿',n:'Basilico thai fresco e coriandolo'},{e:'🌶️',n:'Peperoncini occhio di uccello in salsa di pesce'},{e:'🍋',n:'Spicchi di lime'}],
      vietnamese:[{e:'🍚',n:'Riso jasmine al vapore'},{e:'🌿',n:'Menta, coriandolo e basilico thai'},{e:'🥢',n:'Verdure marinate'},{e:'🍋',n:'Spicchi di lime'}],
      'middle-eastern':[{e:'🍯',n:'Hummus e labneh'},{e:'🥗',n:'Tabbouleh'},{e:'🫓',n:'Pane piatto caldo'},{e:'🥒',n:'Rape sott aceto e olive'}],
    }
  },
  ko:{ totalTime:'총 시간', activeTime:'조리 시간', servings:'인분', difficulty:'난이도', cost:'비용',
    diffLevels:['쉬움','보통','어려움'], pdfBtn:'PDF 내보내기', pdfTitle:'PDF 저장: 공유(⬆) → 프린트 → PDF로 저장 (iPhone/iPad)',
    nutritionH:'영양 정보', nutritionPer:'1인분 기준 (~400 ml)',
    nutritionDisc:'영양 정보는 추정치입니다.',
    cal:'칼로리', prot:'단백질', carb:'탄수화물', fat:'지방', fib:'식이섬유',
    pairingsH:'함께 먹으면 좋아요',
    seeAll:'모든 레시피 보기 →',
    ctaTitle:'일주일 식단을 계획해 보세요',
    ctaDesc:'다양한 레시피와 자동 쇼핑 목록이 포함된 맞춤형 플랜을 만드세요.',
    ctaBtn:'지금 내 플랜 만들기 →', addShopping:'쇼핑 목록에 추가',
    servingsLabel:n=>`${n}인분`,
    feat:[
      {icon:'❤️',t:'단백질이 풍부해요',d:'든든하고 영양가 높아요'},
      {icon:'🐟',t:'오메가-3이 풍부해요',d:'가볍고 건강해요'},
      {icon:'🌿',t:'비타민이 풍부해요',d:'신선하고 건강해요'},
      {icon:'⭐',t:'전통 레시피',d:'정통의 맛'},
      {icon:'❄️',t:'냉동 보관 가능',d:'밀프렙에 좋아요'},
      {icon:'⚡',t:'빠르게 조리해요',d:'30분 이내 완성'},
      {icon:'🕐',t:'저온 장시간 조리',d:'뭉근히 오래 끓인'},
      {icon:'🍲',t:'원팟 요리',d:'설거지 최소화'},
      {icon:'🌙',t:'하룻밤 육수',d:'전날부터 시작'},
      {icon:'🫙',t:'발효 식품',d:'발효 재료 포함'},
    ],
    pairs:{
      meat:[{e:'🍷',n:'레드 와인'},{e:'🥗',n:'그린 샐러드'},{e:'🍞',n:'신선한 빵'},{e:'🥔',n:'구운 감자'}],
      fish:[{e:'🍋',n:'레몬'},{e:'🍷',n:'화이트 와인'},{e:'🍚',n:'찐 밥'},{e:'🌿',n:'신선한 허브'}],
      soup:[{e:'🍞',n:'시골 빵'},{e:'🧄',n:'신선한 마늘'},{e:'🌶️',n:'고추'},{e:'🧅',n:'적양파'}],
      pasta:[{e:'🧀',n:'파르메산'},{e:'🍷',n:'화이트 와인'},{e:'🥗',n:'샐러드'},{e:'🍞',n:'치아바타'}],
      veg:[{e:'🫙',n:'요거트'},{e:'🍞',n:'빵'},{e:'🧄',n:'마늘'},{e:'🥗',n:'샐러드'}],
      def:[{e:'🥗',n:'신선한 샐러드'},{e:'🍷',n:'와인'},{e:'🍞',n:'빵'},{e:'🌿',n:'허브'}],
      korean:[{e:'🥬',n:'김치'},{e:'🥣',n:'된장찌개'},{e:'🥢',n:'반찬'},{e:'🍵',n:'보리차'}],
      japanese:[{e:'🍵',n:'녹차'},{e:'🥢',n:'미소국'},{e:'🥒',n:'쓰케모노 (일본 절임)'},{e:'🍶',n:'사케 또는 일본 맥주'}],
      italian:[{e:'🥖',n:'바삭한 이탈리안 빵'},{e:'🍷',n:'드라이 이탈리안 레드 (키안티)'},{e:'🧀',n:'추가 파르미지아노'},{e:'🫒',n:'엑스트라 버진 올리브 오일'}],
      french:[{e:'🥖',n:'바삭한 바게트'},{e:'🍷',n:'프랑스 레드 (보르도 또는 부르고뉴)'},{e:'🧀',n:'숙성 치즈 플래터'},{e:'🌿',n:'신선한 허브'}],
      mediterranean:[{e:'🧀',n:'부순 페타 치즈'},{e:'🫒',n:'칼라마타 올리브'},{e:'🍋',n:'레몬 조각'},{e:'🫓',n:'따뜻한 피타 빵'}],
      indian:[{e:'🍚',n:'쪄낸 바스마티 쌀밥'},{e:'🫓',n:'따뜻한 난 또는 로티'},{e:'🥒',n:'시원한 오이 라이타'},{e:'🥭',n:'망고 처트니'}],
      mexican:[{e:'🌮',n:'따뜻한 옥수수 토르티야'},{e:'🍅',n:'신선한 토마토 살사'},{e:'🍋',n:'라임 조각'},{e:'🌶️',n:'피클 할라피뇨'}],
      latin:[{e:'🍚',n:'흰쌀밥'},{e:'🌽',n:'달콤한 플랜틴 바나나'},{e:'🫘',n:'검은콩'},{e:'🍋',n:'라임 조각'}],
      thai:[{e:'🍚',n:'태국 자스민 쌀밥'},{e:'🌿',n:'신선한 태국 바질과 고수'},{e:'🌶️',n:'피쉬 소스에 담근 새눈고추'},{e:'🍋',n:'라임 조각'}],
      vietnamese:[{e:'🍚',n:'쪄낸 자스민 쌀밥'},{e:'🌿',n:'민트, 고수, 태국 바질'},{e:'🥢',n:'절임 채소'},{e:'🍋',n:'라임 조각'}],
      'middle-eastern':[{e:'🍯',n:'후무스와 라브네'},{e:'🥗',n:'타불레'},{e:'🫓',n:'따뜻한 플랫브레드'},{e:'🥒',n:'절인 순무와 올리브'}],
    }
  },
};

/* ── Recipe steps & tips UI strings (all 14 languages) ── */
const RECIPE_STEPS_UI = {
  ro:{ prep:'Pregătește toate ingredientele: curăță, spală și taie tot conform rețetei.',
       serve:'Servește preparatul cald, decorat cu verdeață proaspătă sau ingredientele preferate.',
       tipLabel:'Sfat',
       tips:{ soup:'Nu lăsa supa să fiarbă intens după adăugarea smântânii sau ouălor pentru a preveni tăierea.',
              meat:'Lasă carnea să se odihnească 5 minute după gătire înainte de a o tăia sau servi.',
              fish:'Peștele este gata când carnea devine opacă și se desprinde ușor de os cu furculița.',
              pasta:'Adaugă câteva linguri din apa în care a fiert pasta în sos pentru o textură mai cremoasă.',
              dessert:'Lasă desertul să se răcească complet înainte de servire pentru textură și gust optime.',
              def:'Gustă preparatul înainte de servire și ajustează condimentele și sarea după gust.' }},
  en:{ prep:'Prepare all ingredients: wash, peel and cut everything as needed for the recipe.',
       serve:'Serve warm, garnished with fresh herbs or your favourite toppings.',
       tipLabel:'Tip',
       tips:{ soup:'Avoid vigorous boiling after adding cream or eggs to prevent curdling.',
              meat:'Let the meat rest for 5 minutes after cooking before slicing or serving.',
              fish:'Fish is ready when the flesh turns opaque and flakes easily with a fork.',
              pasta:'Add a splash of pasta cooking water to the sauce for a creamier texture.',
              dessert:'Let the dessert cool completely before serving for the best texture and flavour.',
              def:'Taste before serving and adjust seasoning and salt to your liking.' }},
  es:{ prep:'Prepara todos los ingredientes: lava, pela y corta todo según sea necesario.',
       serve:'Sirve caliente, adornado con hierbas frescas o tus guarniciones favoritas.',
       tipLabel:'Consejo',
       tips:{ soup:'Evita hervir vigorosamente tras añadir la nata o los huevos para evitar que se corte.',
              meat:'Deja reposar la carne 5 minutos tras cocinarla antes de cortarla o servirla.',
              fish:'El pescado está listo cuando la carne se vuelve opaca y se desmenuza fácilmente.',
              pasta:'Añade un poco del agua de cocción de la pasta a la salsa para una textura más cremosa.',
              dessert:'Deja enfriar completamente el postre antes de servir para la mejor textura.',
              def:'Prueba antes de servir y ajusta la sal y los condimentos a tu gusto.' }},
  fr:{ prep:'Prépare tous les ingrédients : lave, épluche et coupe tout selon les besoins.',
       serve:'Servir chaud, garni d\'herbes fraîches ou de tes garnitures préférées.',
       tipLabel:'Astuce',
       tips:{ soup:'Évite de faire bouillir vigoureusement après avoir ajouté la crème ou les œufs.',
              meat:'Laisse reposer la viande 5 minutes après cuisson avant de la couper ou servir.',
              fish:'Le poisson est cuit quand la chair devient opaque et se détache facilement à la fourchette.',
              pasta:'Ajoute un peu d\'eau de cuisson des pâtes dans la sauce pour une texture plus crémeuse.',
              dessert:'Laisse le dessert refroidir complètement avant de servir pour la meilleure texture.',
              def:'Goûte avant de servir et ajuste le sel et les épices selon ton goût.' }},
  de:{ prep:'Bereite alle Zutaten vor: waschen, schälen und nach Bedarf schneiden.',
       serve:'Warm servieren, garniert mit frischen Kräutern oder Lieblingstoppings.',
       tipLabel:'Tipp',
       tips:{ soup:'Nicht mehr stark kochen lassen, nachdem Sahne oder Eier hinzugefügt wurden.',
              meat:'Das Fleisch nach dem Garen 5 Minuten ruhen lassen, bevor es geschnitten wird.',
              fish:'Der Fisch ist fertig, wenn das Fleisch undurchsichtig wird und leicht von der Gabel fällt.',
              pasta:'Etwas Nudelkochwasser in die Soße geben, für eine cremigere Konsistenz.',
              dessert:'Das Dessert vollständig abkühlen lassen, bevor es serviert wird.',
              def:'Vor dem Servieren abschmecken und Salz und Gewürze nach Geschmack anpassen.' }},
  pt:{ prep:'Prepare todos os ingredientes: lave, descasque e corte conforme necessário.',
       serve:'Sirva quente, decorado com ervas frescas ou as suas coberturas favoritas.',
       tipLabel:'Dica',
       tips:{ soup:'Evite fervura intensa após adicionar creme ou ovos para evitar talhar.',
              meat:'Deixe a carne descansar 5 minutos após cozinhar antes de fatiar ou servir.',
              fish:'O peixe está pronto quando a carne fica opaca e se desfaz facilmente com um garfo.',
              pasta:'Adicione um pouco da água do cozimento da massa ao molho para uma textura mais cremosa.',
              dessert:'Deixe a sobremesa esfriar completamente antes de servir para a melhor textura.',
              def:'Prove antes de servir e ajuste o sal e os temperos a gosto.' }},
  ru:{ prep:'Подготовьте все ингредиенты: помойте, очистите и нарежьте по необходимости.',
       serve:'Подавайте тёплым, украсив свежей зеленью или любимыми добавками.',
       tipLabel:'Совет',
       tips:{ soup:'Не допускайте сильного кипения после добавления сливок или яиц, чтобы не свернулись.',
              meat:'Дайте мясу отдохнуть 5 минут после приготовления, прежде чем нарезать.',
              fish:'Рыба готова, когда мякоть становится непрозрачной и легко отходит от кости.',
              pasta:'Добавьте немного воды от варки пасты в соус для более кремовой текстуры.',
              dessert:'Дайте десерту полностью остыть перед подачей для лучшей текстуры.',
              def:'Попробуйте перед подачей и отрегулируйте соль и специи по вкусу.' }},
  ar:{ prep:'حضري جميع المكونات: اغسلي وقشري وقطعي كل شيء حسب الحاجة.',
       serve:'قدمي ساخناً مزيناً بالأعشاب الطازجة أو الإضافات المفضلة لديك.',
       tipLabel:'نصيحة',
       tips:{ soup:'تجنبي الغليان الشديد بعد إضافة القشدة أو البيض لمنع التقطع.',
              meat:'اتركي اللحم يرتاح 5 دقائق بعد الطهي قبل التقطيع أو التقديم.',
              fish:'السمك جاهز عندما يصبح اللحم معتماً وينفصل بسهولة بالشوكة.',
              pasta:'أضيفي القليل من ماء طهي المعكرونة إلى الصلصة للحصول على قوام أكثر كرمية.',
              dessert:'اتركي الحلوى تبرد تماماً قبل التقديم للحصول على أفضل قوام.',
              def:'تذوقي قبل التقديم واضبطي الملح والبهارات حسب الذوق.' }},
  zh:{ prep:'准备所有食材：根据需要清洗、去皮和切割。',
       serve:'趁热上桌，用新鲜香草或您最喜欢的配料装饰。',
       tipLabel:'小贴士',
       tips:{ soup:'加入奶油或鸡蛋后避免大火沸腾，以防凝固。',
              meat:'烹饪后让肉休息5分钟再切片或上桌。',
              fish:'鱼肉变不透明且用叉子易于剥落时即熟透。',
              pasta:'在酱汁中加入少量煮面水，口感更顺滑。',
              dessert:'上桌前让甜点完全冷却，以获得最佳口感。',
              def:'上桌前尝味，根据喜好调整盐和调料。' }},
  ja:{ prep:'全ての食材を準備する：必要に応じて洗い、皮をむき、切る。',
       serve:'新鮮なハーブやお好みのトッピングで飾り、温かいうちに盛り付ける。',
       tipLabel:'ポイント',
       tips:{ soup:'クリームや卵を加えた後は強火で煮立てないよう注意。',
              meat:'調理後、切る前に5分休ませると肉汁が保たれる。',
              fish:'魚は身が白くなり、フォークで簡単にほぐれたら完成。',
              pasta:'ゆで汁を少量ソースに加えるとよりクリーミーな仕上がりに。',
              dessert:'デザートは完全に冷めてから提供するのがベスト。',
              def:'提供前に味見して、塩と調味料を好みに合わせて調整する。' }},
  hi:{ prep:'सभी सामग्री तैयार करें: आवश्यकतानुसार धोएं, छीलें और काटें।',
       serve:'ताजे जड़ी-बूटियों या अपनी पसंदीदा टॉपिंग से सजाकर गरम परोसें।',
       tipLabel:'टिप',
       tips:{ soup:'क्रीम या अंडे डालने के बाद तेज उबाल से बचें।',
              meat:'परोसने से पहले पकी हुई मांस को 5 मिनट आराम दें।',
              fish:'मछली तब तैयार होती है जब मांस अपारदर्शी हो जाए और आसानी से अलग हो जाए।',
              pasta:'सॉस में पास्ता का थोड़ा पानी मिलाएं, क्रीमी टेक्सचर के लिए।',
              dessert:'सर्वोत्तम बनावट के लिए मिठाई को परोसने से पहले पूरी तरह ठंडा होने दें।',
              def:'परोसने से पहले चखें और नमक व मसाले स्वाद के अनुसार समायोजित करें।' }},
  tr:{ prep:'Tüm malzemeleri hazırlayın: gerektiğince yıkayın, soyun ve doğrayın.',
       serve:'Taze otlar veya favori malzemelerinizle süsleyerek sıcak servis yapın.',
       tipLabel:'İpucu',
       tips:{ soup:'Krema veya yumurta ekledikten sonra güçlü kaynamaktan kaçının.',
              meat:'Pişirdikten sonra kesmeden önce eti 5 dakika dinlendirin.',
              fish:'Balık, eti opaklaşıp çatalla kolayca ayrıldığında hazırdır.',
              pasta:'Daha kremamsı bir kıvam için makarna suyundan biraz sosa ekleyin.',
              dessert:'En iyi doku için tatlıyı servis etmeden önce tamamen soğumaya bırakın.',
              def:'Servis etmeden önce tadın, tuz ve baharatları damağınıza göre ayarlayın.' }},
  it:{ prep:'Prepara tutti gli ingredienti: lava, sbuccia e taglia tutto come necessario.',
       serve:'Servire caldo, guarnito con erbe fresche o i tuoi condimenti preferiti.',
       tipLabel:'Consiglio',
       tips:{ soup:'Evita di far bollire vigorosamente dopo aver aggiunto panna o uova.',
              meat:'Lascia riposare la carne 5 minuti dopo la cottura prima di tagliarla o servirla.',
              fish:'Il pesce è pronto quando la carne diventa opaca e si sfalda facilmente con la forchetta.',
              pasta:'Aggiungi un po\' dell\'acqua di cottura della pasta al sugo per una consistenza più cremosa.',
              dessert:'Lascia raffreddare completamente il dessert prima di servirlo per la migliore consistenza.',
              def:'Assaggia prima di servire e regola sale e spezie secondo il tuo gusto.' }},
  ko:{ prep:'모든 재료를 준비합니다: 레시피에 따라 씻고, 껍질을 벗기고 자릅니다.',
       serve:'신선한 허브나 좋아하는 토핑으로 장식하여 따뜻하게 제공합니다.',
       tipLabel:'팁',
       tips:{ soup:'크림이나 달걀을 넣은 후 강하게 끓이면 응고될 수 있으니 주의하세요.',
              meat:'고기를 썰거나 서빙하기 전에 5분 정도 휴지시켜 육즙을 보존하세요.',
              fish:'생선은 살이 불투명해지고 포크로 쉽게 분리될 때 완성됩니다.',
              pasta:'소스에 파스타 삶은 물을 조금 넣으면 더 크리미한 질감이 됩니다.',
              dessert:'최상의 식감을 위해 디저트는 완전히 식힌 후 제공하세요.',
              def:'제공하기 전에 맛을 보고 소금과 양념을 취향에 맞게 조절하세요.' }},
};

/* ── Recipe metadata helpers ── */
// Extract the dominant active-cook duration from the EN how-is-made text.
// We look at each hour/minute mention in context and ignore passive prep windows
// (overnight soaks, day-ahead marinades, fridge rests) that don't belong in the
// recipe's total cooking time. Returns the maximum found, capped at 6 h.
function extractLongCookMinutes(text) {
  if (!text) return 0;
  const t = String(text).toLowerCase();
  let maxMin = 0;
  const passiveCtx = /soak|marinate|marinad|overnight|fridge|refriger|chill\b|rest\s+(?:in|overnight)|peste\s+noapte|over\s*night|noche|nuit|nacht|notte/;
  // Returns true if a passive keyword appears within 30 chars before the duration
  const isPassive = (idx) => passiveCtx.test(t.substring(Math.max(0, idx - 50), idx));

  // Hours: "4–5 h", "1.5 h", "2 hours". Cap at 6 h to ignore overnight/long-marinate hits.
  for (const m of t.matchAll(/(\d+(?:[.,]\d+)?)\s*(?:[–-]\s*(\d+(?:[.,]\d+)?))?\s*(?:h\b|hr\b|hours?\b|ore\b|stunden\b|часа?\b|часов\b|heures?\b|saat\b|시간\b)/g)) {
    if (isPassive(m.index)) continue;
    const hi = parseFloat((m[2] || m[1]).replace(',', '.'));
    if (hi && hi <= 6) maxMin = Math.max(maxMin, Math.round(hi * 60));
  }
  // Long minute durations: "60–90 minutes", "45 min" — useful when no hour mention exists.
  for (const m of t.matchAll(/(\d{2,3})\s*(?:[–-]\s*(\d{2,3}))?\s*(?:min\b|minutes?\b|minute\b|minuti?\b|minuten\b|минут|dakika\b|분\b)/g)) {
    if (isPassive(m.index)) continue;
    const hi = parseInt(m[2] || m[1], 10);
    if (hi >= 25 && hi <= 240) maxMin = Math.max(maxMin, hi);
  }
  return maxMin;
}

function recipeMetadata(ingr, steps, cat, code, overrides, howText) {
  const ui = RECIPE_UI[code] || RECIPE_UI.en;
  const sc = steps.length;
  const ic = ingr.length;
  // Active time: ~3 min/step on average (steps are granular — many are 30s-1min "season/toss/drain"
  // mixed with 5-10 min "render/sauté"). Coefficient was 9 which produced unrealistic 1h+ active
  // times even for 30-minute pasta dishes. Capped 10..90 min.
  const autoActive = Math.min(Math.max(sc * 3 + 5, 10), 90);
  const roundTo5 = m => Math.round(m / 5) * 5;
  // Real cook time: active step time + dominant slow-cook block found in the text.
  // Falls back to the step-count heuristic when no long-cook keyword is present.
  const cookFromText = extractLongCookMinutes(howText);
  const totalGuess = autoActive + (autoActive > 40 ? 20 : 10);
  const realTotal = cookFromText > 0 ? Math.max(totalGuess, autoActive + cookFromText) : totalGuess;
  const activeMinsR = overrides?.activeMins ?? roundTo5(autoActive);
  const totalMins   = overrides?.totalMins  ?? roundTo5(realTotal);
  const fmt    = m => m >= 60 ? `${Math.floor(m/60)}h${m%60>0?' '+(m%60)+'m':''}` : `${m}m`;
  const fmtISO = m => m >= 60 ? `PT${Math.floor(m/60)}H${m%60>0?m%60+'M':''}` : `PT${m}M`;
  const servings = (overrides && overrides.servings) ? overrides.servings : (ic < 5 ? 2 : ic < 9 ? 4 : 6);
  // Difficulty by step count, after Tier A rewrites step counts range 4–35.
  // Was sc<=3 Easy / <=5 Medium / else Hard — produced 97% Hard.
  const ingrStr = ingr.join(' ').toLowerCase();
  const nameStr = (cat||'').toLowerCase();
  // Genuinely hard techniques bump difficulty even if step count is moderate.
  const hardTechnique = /knead|deep[\s-]?fry|sourdough|soufflé|souffle|tempering|emulsion|chou\s+pastry|laminated|en\s+croute|wellington/.test(ingrStr + ' ' + (howText||'').toLowerCase());
  let diffIdx = sc <= 8 ? 0 : sc <= 18 ? 1 : 2;
  if (hardTechnique) diffIdx = Math.min(2, diffIdx + 1);
  if (totalMins >= 240) diffIdx = Math.max(diffIdx, 1); // ≥4h cook = at least Medium
  const expensive = /beef|veal|lamb|salmon|shrimp|lobster|crab|truffle|saffron|chocolate|vițel|miel|somon|creveți|caracatiță/.test(ingrStr);
  return {
    totalTime:    fmt(totalMins),
    activeTime:   fmt(activeMinsR),
    isoTotalTime: fmtISO(totalMins),
    isoPrepTime:  fmtISO(activeMinsR),
    totalMinsRaw: totalMins,
    activeMinsRaw: activeMinsR,
    servings,
    difficulty: ui.diffLevels[diffIdx],
    cost: expensive ? '$$' : '$',
  };
}

function isSoup(cat, n, ingr) {
  return /soup|supă|ciorbă|borș|soupe|suppe|sopa|zuppa|çorba/i.test(cat)
    || /ciorbă|borș|borscht|ramen|pho|solyanka|okroshka|harira|minestrone|bisque|gazpacho|laksa|tom\s*yum|tom\s*kha/i.test(n||'')
    || /\bbulion\b|\bstock\b|\bbroth\b|\bbouillon\b/i.test(ingr.join(' '));
}

/* ════════════════════════════════════════════════════════════════
   CULINARY METADATA VALIDATION (Phase K)
   ════════════════════════════════════════════════════════════════
   Validation layer on top of `ui.feat` badges and `ui.pairs` chips.
   Replaces the previous "always render 4 cards" heuristic that
   produced fake badges (Traditional recipe on every page, Can be
   frozen on any non-fragile multi-step recipe) and the "fall through
   to generic" pairing default that produced robotic chips on
   cuisine-tagged recipes.

   Rule contract: a missing badge is better than a fake badge; a
   missing pairing is better than a robotic pairing.

   Each badge has a rule function returning one of:
     'high'   — clear signal, render confidently
     'medium' — directional signal, render
     'low'    — signal too weak, do NOT render
     'reject' — explicitly excluded, do NOT render
   `evaluateBadges` collects all rules ≥ medium, prioritises specific
   over generic, and caps at 4. If 0 qualify, the recipe renders 0
   cards — not 4 fakes. The full reference + per-badge thresholds are
   documented in `docs/ai/CULINARY_METADATA_VALIDATION.md`.
   See also: documentation invariant — "A missing badge is better
   than a fake badge" — applies to every new rule added here. */

const BADGE_RICH_PROTEIN = 0;
const BADGE_RICH_OMEGA3  = 1;
const BADGE_RICH_VITAMIN = 2;
const BADGE_TRADITIONAL  = 3;
const BADGE_FREEZABLE    = 4;
const BADGE_QUICK        = 5;
const BADGE_SLOW_SIMMER  = 6;
const BADGE_ONE_POT      = 7;
const BADGE_OVERNIGHT    = 8;
const BADGE_FERMENTED    = 9;

// Reject list for the "Can be frozen" badge — texture or assembly
// genuinely fails freezing.
const RULE_NEVER_FREEZE = /\b(sushi|sashimi|ceviche|tartare|tartar|carpaccio|gravlax|meringue|pavlova|souffl[ée]|cr[eê]pe|menemen|shakshuka|chakchouka|chakchuka|fondue|tartine|smørrebrød|smorrebrod|poffertjes|l[aá]ngos|tempura|onigiri|yakitori|chilaquiles|salad\b|salată\b|salade\b|insalata|ensalada|raw\s+fish|sashimi|carpaccio|tartare|trota|tartar|sabich|gyros|souvlaki|tlayudas|pad\s+thai|nasi\s+goreng|huevos\s+rancheros|pierogi)\b/i;

// Allow-list for "One-pot" — explicit because the existing heuristic
// stamped almost everything. Conservative cultural canon only.
const RULE_ONE_POT_DISHES = /\b(borscht|borsch|barszcz|cassoulet|jambalaya|ratatouille|paella|risotto|kichuri|kitchari|congee|chowder|gumbo|tagine|pozole|fasolada|harira|stamppot|stoofvlees|carbonnade|goulash|cocido|bourguignon|stew|stroganoff|cottage\s+pie|shepherd|moqueca|ropa\s+vieja|picadillo|biryani|plov|kabsa|mansaf|sundubu|jjigae|kimchi[\s-]?jjigae|tom\s+yum|tom\s+kha|laksa|olla|ghulash|svíčková|sviíčková|bigos|chorba|ciorbă|tocan|tochitur|jollof|egusi|moambé|moambe|sopa|caldo|chupe|locro|sarmale)\b/i;

// Reject list for "Slow simmered" badge. A recipe can clock 90+ min total
// without simmering at all — slow baking (Pavlova, Tarte Tatin), proofing
// (bread), marinating (gravlax), curing (ceviche), assembling (sushi),
// grilling (yakitori), deep-frying (tempura), or being a cold/raw dish.
// "Slow simmered" requires actual liquid heat. Excluding by name keyword
// is safer than trying to detect cooking method from prose.
const RULE_NEVER_SLOW_SIMMER = /\b(dessert|desert|dolce|postre|tatlı|디저트|десерт|pavlova|meringue|souffl[ée]|tiramis[uù]|cheesecake|panna\s+cotta|cr[èe]me\s+br[uü]l[ée]e|cr[èe]me\s+caramel|flan|profiterole|[ée]clair|donut|doughnut|cake|tarte?|pie|cookie|biscuit|brownie|baklava|kunafa|knafeh|halva|cr[eê]pe|pancake|waffle|churros|onigiri|sushi|sashimi|ceviche|tartare|tartar|carpaccio|gravlax|tempura|yakitori|gyros|souvlaki|tlayudas|tacos|burger|cheeseburger|sandwich|bruschetta|salad\b|salată\b|salade\b|insalata|ensalada|fried|frit[oa]|deep[\s-]?fri|grilled|grill[éee]|kebab|raw|cold|smør|smor|smörre|tartine|guacamole|hummus|tabbouleh|tabouli|bibimbap|onig|kimbap|spring\s+roll|nasi\s+goreng|pad\s+thai|chakchouka|shakshuka|menemen|piragi|chilaquiles|tres\s+leches)\b/i;

// Cuisine → preferred pairing-template key. Inference takes
// precedence over a generic `pairingsType: 'meat' | 'fish' | …`
// when the recipe's origin has a cultural pairing template.
const CUISINE_PAIRING_TYPE = {
  // East Asian
  Japan: 'japanese',
  'South Korea': 'korean', 'North Korea': 'korean',
  China: 'chinese', Mongolia: 'central-asian',
  // South / Southeast Asian
  India: 'indian', Pakistan: 'indian', Nepal: 'indian', 'Sri Lanka': 'indian',
  Vietnam: 'vietnamese', Cambodia: 'vietnamese',
  Thailand: 'thai', Indonesia: 'thai', Malaysia: 'thai', Philippines: 'thai',
  Singapore: 'thai',
  // Central Asian
  Uzbekistan: 'central-asian', Kyrgyzstan: 'central-asian',
  Turkmenistan: 'central-asian',
  // Caucasus
  Georgia: 'caucasus', Armenia: 'caucasus',
  // Middle East + North Africa
  Lebanon: 'middle-eastern', Syria: 'middle-eastern', Iran: 'middle-eastern',
  Iraq: 'middle-eastern', Israel: 'middle-eastern', Egypt: 'middle-eastern',
  Kuwait: 'middle-eastern', Turkey: 'middle-eastern',
  Morocco: 'middle-eastern', Tunisia: 'middle-eastern', Algeria: 'middle-eastern',
  Sudan: 'middle-eastern',
  // Mediterranean
  Italy: 'italian',
  France: 'french',
  Greece: 'mediterranean', Spain: 'mediterranean', Portugal: 'mediterranean',
  Croatia: 'mediterranean', Cyprus: 'mediterranean',
  'Bosnia and Herzegovina': 'mediterranean', Slovenia: 'mediterranean',
  'Cape Verde': 'mediterranean',
  // Central European
  Germany: 'central-european', Switzerland: 'central-european',
  Netherlands: 'central-european', Belgium: 'central-european',
  Austria: 'central-european',
  // Eastern European (Slavic, Magyar, Romance, Baltic)
  Russia: 'eastern-european', Ukraine: 'eastern-european',
  Belarus: 'eastern-european', Moldova: 'eastern-european',
  Poland: 'eastern-european', 'Czech Republic': 'eastern-european',
  Slovakia: 'eastern-european', Hungary: 'eastern-european',
  Romania: 'eastern-european', Bulgaria: 'eastern-european',
  Serbia: 'eastern-european',
  Estonia: 'eastern-european', Latvia: 'eastern-european',
  Lithuania: 'eastern-european',
  // Nordic
  Sweden: 'nordic', Finland: 'nordic', Norway: 'nordic', Denmark: 'nordic',
  Iceland: 'nordic',
  // Anglo
  USA: 'anglo', 'United Kingdom': 'anglo', Canada: 'anglo',
  Australia: 'anglo', 'New Zealand': 'anglo', Scotland: 'anglo',
  // Latin America
  Mexico: 'mexican',
  Peru: 'latin', Argentina: 'latin', Brazil: 'latin', Cuba: 'latin',
  Colombia: 'latin', Ecuador: 'latin', Chile: 'latin',
  'Dominican Republic': 'latin', 'El Salvador': 'latin', Venezuela: 'latin',
  Guatemala: 'latin', Jamaica: 'latin',
  // Sub-Saharan
  Nigeria: 'sub-saharan', Ghana: 'sub-saharan', Ethiopia: 'sub-saharan',
  'South Africa': 'sub-saharan', 'Republic of the Congo': 'sub-saharan',
};

function inferPairingType(recipe, fallback) {
  const cuisinePair = CUISINE_PAIRING_TYPE[recipe?.origin?.en];
  return cuisinePair || fallback;
}

// Single rule engine for badges. Returns the badge-index array to
// render (in priority order, capped at 4). Empty array means render
// nothing — preferred over fake cards.
function evaluateBadges(ctx) {
  const { recipe, ingr, steps, cat, n, howText, nutrition, totalMins } = ctx;
  const ingrStr = (Array.isArray(ingr) ? ingr.join(' ') : '').toLowerCase();
  const nameStr = (n || '').toLowerCase();
  const catStr  = (cat || '').toLowerCase();
  const isSoupRecipe = isSoup(cat, n, ingr);
  const decisions = []; // {key, conf}

  const proteinG = nutrition?.prot || 0;
  const hasMeat  = /beef|chicken|pork|lamb|turkey|duck|veal|carne|pui|porc|vită|miel|vițel/.test(ingrStr);
  const hasFish  = /salmon|trout|cod|tuna|fish|shrimp|prawn|squid|seafood|anchov|pește|somon|ton|păstrăv|creveți|caracatiță/.test(ingrStr);
  const hasLegume = /\bchickpea|chick-pea|garbanzo|lentil|red\s+bean|kidney\s+bean|black\s+bean|white\s+bean|cannellini|navy\s+bean|butter\s+bean|gigantes|edamame|soy\s*bean|tofu|tempeh|năut|linte|fasole/.test(ingrStr)
    || /dal|daal|dhal|rajma|chana|falafel|hummus|fasolada|harira|ful\s+medames|lobio|cassoulet|feijoada/.test(nameStr);

  // 0 — Rich in protein
  if (proteinG >= 25) decisions.push({ key: BADGE_RICH_PROTEIN, conf: 'high' });
  else if (proteinG >= 18 || hasMeat || hasFish || hasLegume) decisions.push({ key: BADGE_RICH_PROTEIN, conf: 'medium' });

  // 1 — Rich in omega-3: fatty fish only
  if (/\b(salmon|mackerel|sardine|anchov|herring|trout|tuna|somon|sardin|hering|păstrăv|ton)\b/i.test(ingrStr) && !hasMeat) {
    decisions.push({ key: BADGE_RICH_OMEGA3, conf: 'high' });
  }

  // 2 — Rich in vitamins: vegetable-forward dishes only
  const hasFreshVeg = /\b(spinach|kale|broccoli|carrot|tomato|zucchini|eggplant|aubergine|bell\s+pepper|cucumber|asparagus|cabbage|cauliflower|leek|celery|chard|fennel|sprout|coriander|cilantro|parsley|basil|mint|dill|spanac|morcov|roșii|dovlecel|vânătă|castravete|sparanghel|varză|conopidă|praz|țelină)\b/i.test(ingrStr);
  if (hasFreshVeg && !hasMeat && !hasFish) decisions.push({ key: BADGE_RICH_VITAMIN, conf: 'high' });

  // 3 — Traditional recipe: applies when the origin is in either
  // HUB_ELIGIBLE_ORIGINS (≥2-recipe cuisines) OR CUISINE_PAIRING_TYPE
  // (curated cuisine map — recognised cuisines even with 1 recipe in
  // the corpus, like Egypt → Koshari or Ethiopia → Doro Wat). Phase 8A
  // safety rules already reject AI-filler names at authoring time, so
  // any recipe that reaches a recognised cuisine is genuinely
  // historically recognised.
  const isHubCuisine = HUB_ELIGIBLE_ORIGINS && HUB_ELIGIBLE_ORIGINS.has(recipe?.origin?.en);
  const isMappedCuisine = recipe?.origin?.en && CUISINE_PAIRING_TYPE[recipe.origin.en];
  if (isHubCuisine || isMappedCuisine) decisions.push({ key: BADGE_TRADITIONAL, conf: 'medium' });

  // 4 — Can be frozen: stews, soups, braises, slow-cooked meat dishes
  const freezableByStructure = isSoupRecipe
    || /\b(stew|tocăniță|guisado|estofado|braised|brais[ée]|braisé|casserole|tagine|curry|chili|chilli|ragù|ragu|cassoulet|carbonnade|stroganoff|bourguignon|goulash|borscht|pozole|adobo|rendang|bobotie|caldo|chupe|locro|sarmale|tochitur|fasol|jollof|egusi|moambé|moambe|jambalaya|gumbo|paella|risotto)\b/i.test(nameStr);
  if (!RULE_NEVER_FREEZE.test(nameStr) && !RULE_NEVER_FREEZE.test(catStr) && freezableByStructure) {
    decisions.push({ key: BADGE_FREEZABLE, conf: 'high' });
  }

  // 5 — Quick to prepare: <= 30 min total
  if (totalMins > 0 && totalMins <= 30) decisions.push({ key: BADGE_QUICK, conf: 'high' });

  // 6 — Slow simmered: >= 90 min total AND the dish actually simmers/
  // braises/stews. Bakes, fries, grills, raw/cold/assembled dishes can
  // have a >= 90 min total time (resting, proofing, marinating, slow
  // baking) without simmering at all — Pavlova spends 90+ min in the
  // oven; Tarte Tatin slow-bakes; Sushi/Ceviche/Gravlax all cure.
  // Excluding by name keyword is more honest than excluding by minutes.
  if (totalMins >= 90 && !RULE_NEVER_SLOW_SIMMER.test(nameStr) && !RULE_NEVER_SLOW_SIMMER.test(catStr)) {
    decisions.push({ key: BADGE_SLOW_SIMMER, conf: 'high' });
  }

  // 7 — One-pot: explicit allow-list only (no heuristic)
  if (RULE_ONE_POT_DISHES.test(nameStr)) decisions.push({ key: BADGE_ONE_POT, conf: 'high' });

  // 8 — Overnight: cure / marinade / proof of >= 8h
  if (totalMins >= 480) decisions.push({ key: BADGE_OVERNIGHT, conf: 'high' });

  // 9 — Fermented: explicit ingredient
  if (/\b(miso|kimchi|sauerkraut|tempeh|kefir|doenjang|gochujang|kvass|natto|kombucha|fermented)\b/i.test(ingrStr + ' ' + nameStr)) {
    decisions.push({ key: BADGE_FERMENTED, conf: 'high' });
  }

  // Dedupe by key (a recipe can match multiple rules for the same
  // slot — keep the highest-confidence decision per key).
  const byKey = new Map();
  for (const d of decisions) {
    const prior = byKey.get(d.key);
    if (!prior || (prior.conf === 'medium' && d.conf === 'high')) byKey.set(d.key, d);
  }

  // Render-priority sort: high before medium; then Traditional drops to
  // the back so it doesn't crowd out specific signal.
  const ordered = [...byKey.values()].sort((a, b) => {
    if (a.conf !== b.conf) return a.conf === 'high' ? -1 : 1;
    if (a.key === BADGE_TRADITIONAL && b.key !== BADGE_TRADITIONAL) return 1;
    if (b.key === BADGE_TRADITIONAL && a.key !== BADGE_TRADITIONAL) return -1;
    return 0;
  });

  return ordered.slice(0, 4).map(d => d.key);
}

function recipeFeatureCards(ingr, steps, cat, code, n, overrides, recipe, howText, totalMins) {
  if (overrides?.featureCards) {
    return overrides.featureCards.map(f=>`<div class="recipe-feature-card"><span class="recipe-feature-icon">${f.icon}</span><div><p class="recipe-feature-title">${esc(f.t)}</p><p class="recipe-feature-desc">${esc(f.d)}</p></div></div>`).join('');
  }
  const ui = RECIPE_UI[code] || RECIPE_UI.en;
  const nutrition = overrides?.nutrition || recipeNutrition(ingr, cat, overrides);
  const keys = evaluateBadges({ recipe, ingr, steps, cat, n, howText, nutrition, totalMins: totalMins || 0 });
  if (keys.length === 0) return '';
  return keys.map(k => {
    const f = ui.feat[k];
    return `<div class="recipe-feature-card"><span class="recipe-feature-icon">${f.icon}</span><div><p class="recipe-feature-title">${f.t}</p><p class="recipe-feature-desc">${f.d}</p></div></div>`;
  }).join('');
}

function recipeNutrition(ingr, cat, overrides) {
  if (overrides?.nutrition) return overrides.nutrition;
  const ingrStr = ingr.join(' ').toLowerCase();
  const catStr = (cat||'').toLowerCase();
  const hasMeat = /beef|chicken|pork|lamb|duck|turkey|veal|carne|pui|porc|vită|miel/.test(ingrStr);
  const hasFish = /salmon|trout|cod|tuna|fish|pește|somon|ton|păstrăv/.test(ingrStr);
  const hasLegume = /\bchickpea|chick-pea|garbanzo|lentil|red\s+bean|kidney\s+bean|black\s+bean|white\s+bean|cannellini|navy\s+bean|butter\s+bean|gigantes|edamame|soy\s*bean|tofu|tempeh|năut|linte|fasole/.test(ingrStr);
  const hasEgg = /\beggs?\b|ouă|huevos|œufs|uova|yumurta|계란/.test(ingrStr);
  const isSoup = /soup|supă|ciorbă|borș|soupe|suppe|sopa|zuppa/.test(catStr);
  const isDesert = /dessert|desert|dolce|postre|tatlı|десерт/.test(catStr);
  const hasDairy = /cream|cheese|milk|smântână|brânză|lapte|parmezan|fromage|käse/.test(ingrStr);
  const hasGrain = /pasta|spaghetti|noodle|rice|orez|quinoa|orzo|couscous/.test(ingrStr);
  // Vegetable-default baseline lowered: 350/18 → 280/9 — real vegetable dishes are ~5–10 g protein
  let cal=280, prot=9, carb=32, fat=10, fib=5;
  if (isSoup) { cal=185; prot=10; carb=16; fat=7; fib=3; }
  else if (isDesert) { cal=375; prot=5; carb=52; fat=14; fib=2; }
  else if (hasMeat) { cal=420; prot=32; carb=18; fat=20; fib=3; }
  else if (hasFish) { cal=285; prot=28; carb=12; fat=11; fib=2; }
  else if (hasLegume) { cal=340; prot=17; carb=44; fat=8; fib=10; }
  else if (hasEgg) { cal=270; prot=15; carb=12; fat=17; fib=2; }
  if (hasDairy) { cal += 55; prot += 4; fat += 3; }
  if (hasGrain) { carb += 18; cal += 75; prot += 3; }
  return { cal, prot, carb, fat, fib };
}

function recipePairings(ingr, cat, code, n, overrides, recipe) {
  const ui = RECIPE_UI[code] || RECIPE_UI.en;
  const p = ui.pairs;
  if (overrides?.pairings) {
    return overrides.pairings.map(x=>`<div class="pairing-chip">${x.e} ${esc(x.n)}</div>`).join('');
  }
  // Ingredient-derived fallback type when no cuisine pairing template
  // applies to the recipe's origin.
  const ingrStr = ingr.join(' ').toLowerCase();
  const hasMeat = /beef|chicken|pork|lamb|turkey|duck|carne|pui|porc|vită|miel/.test(ingrStr);
  const hasFish = /salmon|trout|cod|tuna|shrimp|pește|somon|ton|păstrăv|creveți/.test(ingrStr);
  const hasPasta = /pasta|spaghetti|noodle|linguine|tagliatelle/.test(ingrStr);
  const isVeg = !hasMeat && !hasFish;
  // Dessert detection covers both author-tagged `pairingsType: dessert`
  // and category text (Dessert / Desert / Dolce / Postre / Tatlı /
  // десерт). Sweet pairings (espresso / berries / whipped cream) make
  // more sense for desserts than cuisine pairings — Pavlova doesn't
  // pair with "garden peas" just because Australia is in the anglo map.
  const isDessert = /dessert|desert|dolce|postre|tatlı|десерт|디저트/i.test(cat||'')
    || overrides?.pairingsType === 'dessert';
  const ingredientType = isDessert ? 'dessert'
    : isSoup(cat,n,ingr) ? 'soup'
    : hasFish ? 'fish' : hasMeat ? 'meat' : hasPasta ? 'pasta' : isVeg ? 'veg' : 'def';
  // Author-set explicit cuisine type wins. Author-set generic type
  // (meat/fish/soup/pasta/veg/def) is treated as a placeholder and
  // upgraded to the cuisine pairing if origin maps to one — the most
  // common Phase 8A artefact was generic `pairingsType: 'meat'` on
  // cuisine-tagged recipes like Bobotie (South Africa) or Pljeskavica
  // (Serbia) producing "red wine / fresh bread / roasted potatoes".
  // Dessert is the one exception: dessert pairings beat cuisine pairings.
  const explicit = overrides?.pairingsType;
  const isGenericExplicit = !explicit || ['meat','fish','soup','pasta','veg','def','dessert'].includes(explicit);
  const pairingKey = isDessert
    ? 'dessert'
    : isGenericExplicit
      ? inferPairingType(recipe, explicit || ingredientType)
      : explicit;
  // Locale fallback chain: current locale's template → English template
  // (for keys that haven't been translated yet) → ingredient-derived
  // generic → final 'def' fallback. The EN-fallback step makes adding
  // a new cuisine template a one-locale change instead of a 14-locale
  // change, with non-EN locales degrading gracefully.
  const enPairs = (RECIPE_UI.en && RECIPE_UI.en.pairs) || {};
  const chosen = p[pairingKey] || enPairs[pairingKey] || p[ingredientType] || p.def;
  return chosen.map(x=>`<div class="pairing-chip">${x.e} ${esc(x.n)}</div>`).join('');
}

function padSteps(steps, code) {
  if (steps.length >= 4) return steps;
  const ui = RECIPE_STEPS_UI[code] || RECIPE_STEPS_UI.en;
  const result = [...steps];
  if (result.length < 4) result.unshift(ui.prep);
  if (result.length < 4) result.push(ui.serve);
  while (result.length < 4) result.push(ui.serve);
  return result;
}

/* ════════════════════════════════════════════════════════════════
   Phase M — recipeTip() dish-name registry.

   The pre-Phase-M tip selector returned one of six generic strings
   (soup / meat / fish / pasta / dessert / def) for 94 percent of
   recipes. That is filler by the Phase K/L invariant: "a missing
   tip is better than a fake tip".

   This registry returns a tip ONLY when the dish name (or a
   dish-specific ingredient cue) matches a curated rule. If no rule
   matches, the function returns null and the renderer omits the
   tip section entirely (the conditional render at recipePage was
   already in place).

   Per locale: tips are authored in EN and RO (the project's two
   primary locales per CLAUDE.md). For the other 12 locales the
   function returns null — showing a mixed-language tip on a
   French/Spanish/German page is worse than showing none. Extending
   to other locales is purely additive. */
const TIP_REGISTRY = {
  en: [
    { match: /\bsushi\b/i,                   tip: "Use rice that's body-temperature warm, not hot or cold — cold rice cracks the nori; hot rice steams the topping." },
    { match: /\btempura\b/i,                 tip: "Mix the batter ice-cold with chopsticks and stop at five to eight strokes — the lumpy batter is what makes the crust crisp." },
    { match: /\bonigiri\b/i,                 tip: "Shape the rice while it's just warm to the touch and salt only your hands, not the rice — the seasoning lives on the outer skin." },
    { match: /\byakitori\b/i,                tip: "Soak the bamboo skewers in cold water for 30 minutes; otherwise they char through before the chicken is cooked." },
    { match: /\bramen\b/i,                   tip: "Cook the noodles separately and ladle the broth over them at the last moment — noodles sitting in broth turn soft." },
    { match: /\bokonomiyaki\b/i,             tip: "Use shredded cabbage and a light dashi-based batter; fold gently so the cabbage stays distinct from the egg, not bound into a pancake." },
    { match: /\bbibimbap\b/i,                tip: "Press the rice firmly against the hot stone bowl and don't stir until the bottom crackles — that crisp nurungji is the point of the dish." },
    { match: /\bkimchi\b/i,                  tip: "Salt the cabbage long enough that it bends without snapping — under-salted cabbage won't ferment cleanly." },
    { match: /\bkung pao chicken\b/i,        tip: "Toast the dried chilies briefly in hot oil before the chicken — they should darken and perfume the oil without burning." },
    { match: /\bmapo tofu\b/i,               tip: "Use silken tofu and slide it gently into the sauce — stirring breaks the cubes; folding keeps them intact." },
    { match: /\bpho\b/i,                     tip: "Char the onion and ginger over an open flame until blackened in patches before they go in the broth — the burnt aromatics are pho's signature depth." },
    { match: /\bbanh\s*mi\b/i,               tip: "Toast the baguette interior with a thin layer of mayonnaise — the fat keeps the bread crisp once the wet fillings go in." },
    { match: /\bpad thai\b/i,                tip: "Soak the rice noodles in cold water until pliable but still firm — fully cooked noodles turn to mush in the wok." },
    { match: /\btom yum\b/i,                 tip: "Bruise the lemongrass and galangal before adding — whole stalks stay quiet, bruised stalks open the broth." },
    { match: /\bgreen curry|gaeng khiao wan\b/i, tip: "Fry the paste in coconut cream until the oil splits and pools — that's when the curry stops tasting flat." },
    { match: /\bnasi goreng\b/i,             tip: "Use rice cooked a day ahead and chilled overnight; fresh rice clumps and steams in the wok instead of stir-frying." },
    { match: /\bchicken curry\b/i,           tip: "Brown the onions until deeply caramelised before the spices go in — undercooked onion is the most common reason a curry tastes raw." },
    { match: /\bdh?al|\bdaal\b/i,            tip: "Add a tempered tarka of cumin, mustard seed and curry leaf at the end — folding the hot oil through is what gives dal its lift." },
    { match: /\bbiryani\b/i,                 tip: "Layer the par-cooked rice and meat in a heavy pot, seal the lid with dough, and steam (dum) on the lowest heat for the final 20 minutes." },
    { match: /\brajma\b/i,                   tip: "Soak the kidney beans overnight and discard the soaking water — properly soaked beans cook tender without the bitter edge." },
    { match: /\bhummus\b/i,                  tip: "Peel the cooked chickpeas (or simmer with baking soda) for the silkiest texture — skins are the enemy of smooth hummus." },
    { match: /\bshakshuka\b/i,               tip: "Make wells in the simmering sauce before cracking in the eggs and cover the pan — steam sets the whites while the yolks stay runny." },
    { match: /\btabbouleh\b/i,               tip: "Use far more parsley than bulgur — true tabbouleh is a parsley salad with grains, not a grain salad with herbs." },
    { match: /\bkibbeh\b/i,                  tip: "Wet your hands with cold salt water while shaping — the cold keeps the meat from sticking and helps form an even shell." },
    { match: /\btagine\b/i,                  tip: "Keep the lid on as much as possible — the conical shape traps steam and returns moisture to the pot. Every lift dries the dish out." },
    { match: /\bpaella\b/i,                  tip: "Don't stir once the rice goes in — the prized socarrat (crusty bottom) only forms if the rice sits undisturbed." },
    { match: /\brisotto\b/i,                 tip: "Add stock a ladle at a time and stir often enough to release starch but not constantly; the rice's own starch is what makes the sauce." },
    { match: /\bcarbonara\b/i,               tip: "Take the pan off the heat before adding the egg-cheese mixture; residual heat sets the sauce without scrambling the egg." },
    { match: /\bpasta alla norma\b/i,        tip: "Salt the diced aubergine in a colander for 30 minutes and pat dry — unsalted aubergine soaks up oil and turns greasy." },
    { match: /\bgazpacho\b/i,                tip: "Chill at least 4 hours after blending and serve cold from the fridge — gazpacho is a chilled dish, not a room-temperature one." },
    { match: /\bratatouille\b/i,             tip: "Cook each vegetable separately first, then combine — they each have different water content and timing." },
    { match: /\bmoussaka\b/i,                tip: "Salt the aubergine slices and drain them 30 minutes before frying — they'll absorb less oil and won't go bitter." },
    { match: /\bmole poblano\b/i,            tip: "Fry the blended paste in hot lard for the full 10–15 minutes, stirring constantly — this 'fries the mole' and is what separates real mole from thin sauce." },
    { match: /\bchilaquiles\b/i,             tip: "Take the tortillas off the salsa within a minute or two — they should soak up sauce while keeping some bite." },
    { match: /\btres leches\b/i,             tip: "Cool the sponge completely before piercing it down to the base and pouring the three milks across the whole surface in slow passes — a warm or under-baked cake won't absorb evenly and the soak pools on top." },
    { match: /\bguacamole\b/i,               tip: "Mash with a fork, not a blender — guacamole should keep some texture, not turn into a smooth paste." },
    { match: /\btacos\b/i,                   tip: "Warm the corn tortillas over an open gas flame for 5 seconds per side — this brings out the corn flavour and stops them cracking." },
    { match: /\bborscht\b/i,                 tip: "Stir in a spoonful of vinegar or lemon juice at the end — the acid locks in the beet's deep red colour, otherwise it fades to brown." },
    { match: /\bgoulash\b/i,                 tip: "Take the pan off the heat before adding the paprika; toasted in hot fat it turns bitter and acrid." },
    { match: /\bpierogi\b/i,                 tip: "Roll the dough as thin as you can without tearing — thick dough is what makes pierogi heavy and gummy." },
    { match: /\bcheeseburger\b/i,            tip: "Don't press the patty after it's on the heat — every drop of juice you squeeze out is flavour lost." },
    { match: /\bpancakes?\b/i,               tip: "Let the batter rest 5–10 minutes after mixing — the gluten relaxes and the lift is dramatically better." },
    { match: /\bclam chowder\b/i,            tip: "Add the cream off the heat once the potatoes are soft; boiling cream curdles, especially with acidic clam liquor." },
    { match: /\bshepherd'?s pie\b/i,         tip: "Mash the potatoes with butter and warm milk, never cold — cold liquid makes them gluey." },
    { match: /\bfish and chips\b/i,          tip: "Double-fry the chips: first low (140 °C) to cook through, then high (180 °C) to crisp the outside." },
    { match: /\bpavlova\b/i,                 tip: "Bake low and slow, then turn the oven off and let the meringue cool inside — sudden temperature changes crack the shell." },
    { match: /\bcr[eê]pes?\b/i,              tip: "Let the batter rest at least 30 minutes before cooking; the gluten relaxes and you'll get the thin, flexible texture crêpes are known for." },
    { match: /\btarte tatin\b/i,             tip: "Cook the caramel until deep amber before adding the apples — pale caramel tastes flat and the colour bleeds out in the oven." },
    { match: /\bquiche lorraine\b/i,         tip: "Blind-bake the pastry until pale golden before pouring in the custard — un-baked crust turns soggy under the egg." },
    { match: /\bcoq au vin\b/i,              tip: "Marinate the chicken in the wine and aromatics overnight; the longer marinade is what gives coq au vin its colour and depth." },
    { match: /\bbouillabaisse\b/i,           tip: "Add the firmer fish first and the delicate fish at the end — each species needs its own brief cook time." },
    { match: /\bcroque monsieur\b/i,         tip: "Make the béchamel thick enough to hold a peak on the spoon — runny sauce slides off the toasted bread." },
    { match: /\bchicken tagine\b/i,          tip: "Tuck the preserved lemon and olives in around (not on top of) the chicken — they release brine, so don't stir vigorously or the sauce splits." },
    { match: /\blamb tagine\b/i,             tip: "Add the dried fruit and honey only in the last 20 minutes — earlier and the sugars caramelise and go bitter." },
    { match: /\bclassic japanese ramen\b/i,  tip: "Bring the broth and tare to taste in the bowl, then ladle over the just-drained noodles — every step under a minute keeps the noodles springy." },
    { match: /\bsouvlaki\b/i,                tip: "Marinate the pork at least 2 hours in olive oil, lemon and oregano — the acid tenderises and the oil carries the aromatics into the meat." },
  ],
  ro: [
    { match: /\bsushi\b/i,                   tip: "Folosește orez cald la temperatura corpului, nu fierbinte sau rece — orezul rece crapă nori-ul, cel fierbinte aburește toppingul." },
    { match: /\btempura\b/i,                 tip: "Amestecă aluatul cu apă cu gheață și oprește-te la cinci-opt mișcări — cocoloașele sunt cele care fac crusta crocantă." },
    { match: /\bonigiri\b/i,                 tip: "Modelează orezul cât e doar călduț la atingere și sărează doar palmele, nu orezul — condimentul stă pe pielița exterioară." },
    { match: /\byakitori\b/i,                tip: "Înmoaie frigăruile de bambus în apă rece 30 de minute, altfel se ard înainte ca puiul să fie gata." },
    { match: /\bramen\b/i,                   tip: "Fierbe tăițeii separat și toarnă supa peste ei în ultimul moment — tăițeii care stau în supă se moaie." },
    { match: /\bokonomiyaki\b/i,             tip: "Folosește varză rasă și un aluat ușor cu dashi; amestecă blând ca varza să rămână distinctă, nu să se transforme într-o clătită compactă." },
    { match: /\bbibimbap\b/i,                tip: "Apasă orezul ferm pe bolul de piatră fierbinte și nu îl amesteca până nu crăpie la bază — crusta crocantă nurungji este sensul preparatului." },
    { match: /\bkimchi\b/i,                  tip: "Sărează varza suficient cât să se îndoaie fără să se rupă — varza nesărată suficient nu fermentează curat." },
    { match: /\bkung pao chicken\b/i,        tip: "Prăjește scurt ardeii uscați în ulei fierbinte înainte de pui — trebuie să se închidă la culoare și să parfumeze uleiul, nu să se ardă." },
    { match: /\bmapo tofu\b/i,               tip: "Folosește tofu silken și introdu-l ușor în sos — amestecarea sparge cuburile; rularea blândă le păstrează intacte." },
    { match: /\bpho\b/i,                     tip: "Arde ceapa și ghimbirul pe flacără până se înnegresc pe alocuri înainte de a-i pune în supă — aromaticele arse sunt profunzimea semnătură a pho-ului." },
    { match: /\bbanh\s*mi\b/i,               tip: "Prăjește interiorul bagheteă cu un strat subțire de maioneză — grăsimea menține pâinea crocantă după ce intră umpluturile umede." },
    { match: /\bpad thai\b/i,                tip: "Înmoaie tăițeii de orez în apă rece până sunt flexibili dar fermi — tăițeii fierți complet se transformă în terci în wok." },
    { match: /\btom yum\b/i,                 tip: "Lovește lemongrass-ul și galangal-ul înainte de a-i adăuga — tulpinile întregi rămân tăcute, cele lovite deschid supa." },
    { match: /\bgreen curry|gaeng khiao wan\b/i, tip: "Prăjește pasta în smântână de cocos până când uleiul se separă și formează bălți — atunci curry-ul încetează să fie fără gust." },
    { match: /\bnasi goreng\b/i,             tip: "Folosește orez gătit cu o zi înainte și răcit peste noapte; orezul proaspăt se aglomerează și aburește în wok în loc să se prăjească." },
    { match: /\bchicken curry\b/i,           tip: "Rumeneste ceapa până devine profund caramelizată înainte de a pune condimentele — ceapa necoaptă este motivul cel mai frecvent pentru care curry-ul are gust crud." },
    { match: /\bdh?al|\bdaal\b/i,            tip: "Adaugă un tarka călit de chimion, semințe de muștar și frunze de curry la final — turnarea uleiului fierbinte este ceea ce dă dal-ului lift." },
    { match: /\bbiryani\b/i,                 tip: "Așază în straturi orezul semi-fiert și carnea într-o oală grea, sigilează capacul cu aluat și aburește (dum) pe focul cel mai mic încă 20 de minute." },
    { match: /\brajma\b/i,                   tip: "Înmoaie fasolea roșie peste noapte și aruncă apa de înmuiere — fasolea bine înmuiată se fierbe fragedă fără gust amărui." },
    { match: /\bhummus\b/i,                  tip: "Curăță năutul fiert (sau fierbe-l cu bicarbonat) pentru cea mai fină textură — cojile sunt dușmanul hummusului mătăsos." },
    { match: /\bshakshuka\b/i,               tip: "Fă gropițe în sosul care fierbe ușor înainte de a sparge ouăle și acoperă tigaia — aburul leagă albușurile iar gălbenușurile rămân moi." },
    { match: /\btabbouleh\b/i,               tip: "Folosește mult mai mult pătrunjel decât bulgur — adevăratul tabbouleh este o salată de pătrunjel cu grăunțe, nu o salată de grăunțe cu ierburi." },
    { match: /\bkibbeh\b/i,                  tip: "Udă-ți mâinile cu apă rece sărată în timp ce modelezi — apa rece împiedică carnea să se lipească și ajută la formarea unei coji uniforme." },
    { match: /\btagine\b/i,                  tip: "Ține capacul cât mai mult posibil — forma conică captează aburul și îl întoarce în oală. Fiecare ridicare usucă preparatul." },
    { match: /\bpaella\b/i,                  tip: "Nu amesteca odată ce a intrat orezul — prețioasa socarrat (crusta de jos) se formează doar dacă orezul stă nederanjat." },
    { match: /\brisotto\b/i,                 tip: "Adaugă supa pe câte un polonic și amestecă suficient cât să elibereze amidonul, dar nu constant — amidonul orezului este cel care face sosul." },
    { match: /\bcarbonara\b/i,               tip: "Ia tigaia de pe foc înainte de a adăuga amestecul de ou și cașcaval — căldura reziduală leagă sosul fără să gătească oul." },
    { match: /\bpasta alla norma\b/i,        tip: "Sărează vânăta cubulețe într-o strecurătoare 30 de minute și șterge-o cu hârtie — vânăta nesărată absoarbe uleiul și devine grasă." },
    { match: /\bgazpacho\b/i,                tip: "Refrigerează cel puțin 4 ore după pasare și servește rece direct din frigider — gazpacho este un preparat rece, nu unul la temperatura camerei." },
    { match: /\bratatouille\b/i,             tip: "Gătește fiecare legumă separat mai întâi, apoi combină-le — fiecare are conținut de apă și timing diferit." },
    { match: /\bmoussaka\b/i,                tip: "Sărează feliile de vânătă și scurge-le 30 de minute înainte de prăjit — vor absorbi mai puțin ulei și nu vor avea gust amărui." },
    { match: /\bmole poblano\b/i,            tip: "Prăjește pasta amestecată în untură fierbinte 10–15 minute, amestecând neîncetat — asta înseamnă 'prăjirea mole-ului' și separă mole-ul adevărat de un sos subțire." },
    { match: /\bchilaquiles\b/i,             tip: "Scoate tortilla din salsa în maxim un minut sau două — trebuie să absoarbă sos păstrând o textură." },
    { match: /\btres leches\b/i,             tip: "Răcește complet blatul înainte să-l înțepi până la fund și să torni cele trei lapturi în reprize lente — un blat cald sau insuficient copt nu absoarbe uniform, iar lichidul bălteste deasupra." },
    { match: /\bguacamole\b/i,               tip: "Strivește cu furculița, nu cu blenderul — guacamole trebuie să aibă textură, nu să devină o pastă fină." },
    { match: /\btacos\b/i,                   tip: "Încălzește tortilla de porumb pe flacără 5 secunde pe fiecare parte — asta scoate gustul porumbului și împiedică crăparea." },
    { match: /\bborscht\b/i,                 tip: "Toarnă o lingură de oțet sau zeamă de lămâie la final — acidul fixează culoarea roșu intens a sfeclei, altfel se decolorează spre maro." },
    { match: /\bgoulash\b/i,                 tip: "Ia oala de pe foc înainte de a adăuga boiaua; prăjită în grăsime fierbinte se face amară." },
    { match: /\bpierogi\b/i,                 tip: "Întinde aluatul cât mai subțire fără să se rupă — aluatul gros e ceea ce face pierogi grei și cleioși." },
    { match: /\bcheeseburger\b/i,            tip: "Nu apăsa chiftaua după ce e pe foc — fiecare picătură de zeamă pe care o stoarci este aromă pierdută." },
    { match: /\bpancakes?\b/i,               tip: "Lasă aluatul să se odihnească 5–10 minute după amestecare — glutenul se relaxează și creșterea este net mai bună." },
    { match: /\bclam chowder\b/i,            tip: "Adaugă smântâna în afara focului după ce cartofii sunt moi; smântâna care fierbe se taie, mai ales cu sucul acidulat de scoici." },
    { match: /\bshepherd'?s pie\b/i,         tip: "Pasează cartofii cu unt și lapte cald, niciodată rece — lichidul rece îi face cleioși." },
    { match: /\bfish and chips\b/i,          tip: "Prăjește cartofii în două etape: mai întâi la temperatură mică (140 °C) ca să se gătească, apoi la mare (180 °C) ca să se rumenească." },
    { match: /\bpavlova\b/i,                 tip: "Coace la temperatură joasă pe perioadă lungă, apoi oprește cuptorul și lasă bezeaua să se răcească înăuntru — variațiile bruste de temperatură crapă coaja." },
    { match: /\bcr[eê]pes?\b/i,              tip: "Lasă aluatul să se odihnească cel puțin 30 de minute înainte de prăjit; glutenul se relaxează și obții textura subțire și flexibilă pentru care sunt cunoscute clătitele." },
    { match: /\btarte tatin\b/i,             tip: "Caramelizează zahărul până devine de chihlimbar închis înainte de a adăuga merele — caramelul palid are gust fad și culoarea se pierde la cuptor." },
    { match: /\bquiche lorraine\b/i,         tip: "Coace aluatul în orb până devine palid auriu înainte de a turna crema de ou — aluatul necopt devine umed sub ou." },
    { match: /\bcoq au vin\b/i,              tip: "Marinează puiul în vin și aromatice peste noapte; marinada lungă este cea care dă coq au vin-ului culoarea și profunzimea." },
    { match: /\bbouillabaisse\b/i,           tip: "Adaugă peștele mai ferm primul și cel delicat la final — fiecare specie are nevoie de propriul ei timp scurt de fierbere." },
    { match: /\bcroque monsieur\b/i,         tip: "Fă béchamel suficient de gros încât să țină un vârf pe lingură — sosul prea fluid alunecă de pe pâinea prăjită." },
    { match: /\bchicken tagine\b/i,          tip: "Bagă lămâia conservată și măslinele în jurul (nu deasupra) puiului — eliberează saramură, deci nu amesteca viguros sau sosul se taie." },
    { match: /\blamb tagine\b/i,             tip: "Adaugă fructele uscate și mierea doar în ultimele 20 de minute — mai devreme și zahărul se caramelizează amar." },
    { match: /\bclassic japanese ramen\b/i,  tip: "Așază supa și tare-ul după gust direct în bol, apoi toarnă peste tăițeii abia scurși — fiecare pas sub un minut păstrează textura elastică." },
    { match: /\bsouvlaki\b/i,                tip: "Marinează porcul cel puțin 2 ore în ulei de măsline, lămâie și oregano — acidul frăgezește iar uleiul duce aromele în carne." },
  ],
};

// Generic placeholder tip-type values. When a recipe carries one of
// these as `tipType`, the renderer treats it as a placeholder (most of
// the corpus has these set by default) and falls through to the
// dish-name registry. Cuisine-specific or genuinely custom tipType
// values still win when their key exists in the locale's tips dict.
const GENERIC_TIP_TYPES = new Set(['soup','meat','fish','pasta','dessert','def','veg']);

function recipeTip(ingr, cat, code, n, overrides) {
  const ui = RECIPE_STEPS_UI[code] || RECIPE_STEPS_UI.en;
  const t = ui.tips || {};
  // 1. Free-form author tip — explicit wins always.
  if (overrides && overrides.tip) return overrides.tip;
  // 2. Author tipType, but only when it's a non-generic key that
  //    actually resolves in the current locale's tips dict.
  if (overrides && overrides.tipType
      && !GENERIC_TIP_TYPES.has(overrides.tipType)
      && t[overrides.tipType]) {
    return t[overrides.tipType];
  }
  // 3. Dish-name registry (EN + RO only). Returns the matched tip or
  //    null if no dish-specific rule fires.
  const registry = TIP_REGISTRY[code];
  if (!registry) return null;        // 12 locales without a tip registry: hide.
  const haystack = ((n || '') + ' ' + ingr.join(' ')).toLowerCase();
  for (const entry of registry) {
    if (entry.match.test(haystack)) return entry.tip;
  }
  // 4. No confident dish-name match: hide the tip rather than render filler.
  return null;
}

function recipeCardEmoji(cat) {
  const c = (cat||'').toLowerCase();
  if (/soup|supă|ciorbă|borș/.test(c)) return '🍲';
  if (/dessert|desert|dolce/.test(c)) return '🍰';
  if (/salad|salată/.test(c)) return '🥗';
  if (/breakfast|mic dejun/.test(c)) return '🍳';
  return '🍽️';
}

/* ════════════════════════════════════════════════════════════════
   GENERIC recipe page + index — works for ALL 14 languages
   ════════════════════════════════════════════════════════════════ */
function recipePage(recipe, rl) {
  const lc   = rl.lc;
  const code = lc.code;
  const ui   = RECIPE_UI[code] || RECIPE_UI.en;
  const n    = recipe.name?.[code]    || recipe.name?.en    || recipe.name?.ro    || '';
  const o    = recipe.origin?.[code]  || recipe.origin?.en  || recipe.origin?.ro  || '';
  const oEn  = recipe.origin?.en || recipe.origin?.ro || ''; // for COUNTRY_FLAG lookup (locale-stable)
  const ingr = recipe.ingredients?.[code] || recipe.ingredients?.en || recipe.ingredients?.ro || [];
  const how  = recipe.howIsMade?.[code]   || recipe.howIsMade?.en   || recipe.howIsMade?.ro   || '';
  const cat  = recipe.category?.[code]    || recipe.category?.en    || recipe.category?.ro    || '';
  const metaDesc  = recipesMeta[recipe.id]?.desc?.[code] || recipesMeta[recipe.id]?.desc?.en || '';
  const originTxt = recipe.originText?.[code] || recipe.originText?.en || recipe.originText?.ro || metaDesc || rl.heroDesc(o);
  // Sentence-end splitter: ASCII period+space (Latin/AR/HI/KO) or CJK full stop (ZH/JA).
  // Without the CJK branch, ZH/JA howIsMade collapses into a single mega-step.
  const rawSteps = how.split(/(?:\.\s+|[。！？]\s*)/).filter(s => s.trim().length > 2);
  const steps = padSteps(rawSteps, code);
  const enName = recipe.name?.en || recipe.name?.ro || '';
  const rslug  = slug(enName);
  const pageUrl = `https://meal-planner.ro${rl.dir}/${rslug}/`;
  // `recipeImg.src` is what the <img> tag uses — same-origin for locals so
  // preview deploys load without hitting production. `recipeImg.ogUrl` is
  // the absolute URL used by og:image / JSON-LD / Twitter card.
  const recipeImg    = resolveRecipeImage(recipe, rslug);
  const recipeImgUrl = recipeImg.ogUrl;
  const appUrl  = rl.appDir ? `${rl.appDir}/` : '/';
  const overrides = {
    servings: recipe.servings,
    tipType: recipe.tipType,
    pairingsType: recipe.pairingsType,
    featureCards: recipe.featureCards?.[code],
    pairings: recipe.pairings?.[code],
    nutrition: recipe.nutrition,
    totalMins:  recipe.timeMins?.total,
    activeMins: recipe.timeMins?.active,
  };
  // Real cook time is parsed from the EN how-is-made — the source of truth for braises/marinades
  const enHow   = recipe.howIsMade?.en || recipe.howIsMade?.ro || '';
  const meta    = recipeMetadata(ingr, steps, cat, code, overrides, enHow);
  const nutri   = recipeNutrition(ingr, cat, overrides);
  const emoji   = recipeCardEmoji(cat);
  const stepsUi = RECIPE_STEPS_UI[code] || RECIPE_STEPS_UI.en;
  const tip     = recipeTip(ingr, cat, code, n, overrides);
  const isSoupRecipe = /soup|supă|ciorbă|borș|soupe|suppe|sopa|zuppa|çorba/i.test(cat)
    || /ciorbă|borș|borscht|ramen|pho|solyanka|okroshka|harira|minestrone|bisque|potage|gazpacho|laksa|tom\s*yum|tom\s*kha/i.test(n)
    || /\bbulion\b|\bstock\b|\bbroth\b|\bbouillon\b/i.test(ingr.join(' '));
  const nutritionPer = isSoupRecipe ? ui.nutritionPer.replace(/~?\d+\s*g/i,'~350 ml') : ui.nutritionPer.replace(/~?\d+\s*ml/i,'~350 g');

  const jsonLd = JSON.stringify({
    "@context":"https://schema.org","@type":"Recipe","name":n,
    "image":[recipeImgUrl],
    "description":rl.pageDesc(n,o),
    "recipeIngredient":ingr,
    "recipeInstructions":steps.map(s=>({ "@type":"HowToStep","text":s })),
    "recipeCategory":cat,
    "prepTime":meta.isoPrepTime,
    "totalTime":meta.isoTotalTime,
    "recipeYield":`${meta.servings}`,
    "nutrition":{"@type":"NutritionInformation","calories":`${nutri.cal} kcal`},
    "author":{"@type":"Organization","name":"Meal-Planner.ro"},
    "url":pageUrl
  });

  // Related recipes — same origin, different name, up to 5. The order is a
  // deterministic but per-page-varying shuffle so that every hub-member
  // recipe surfaces in some other recipe's related strip (otherwise the
  // last-in-array members of large hubs never appear via related-strip
  // discovery — the cuisine hub grid is then their only entry point).
  const sameOrigin = recipes
    .filter(r => (r.origin?.[code]||r.origin?.en) === o && (r.name?.[code]||r.name?.en) !== n);
  const currentId = recipe.id || 0;
  // Multiplicative mixer that distributes uniformly across the (current,
  // candidate) id pairs. Math.imul keeps the 32-bit multiplication exact;
  // shifting currentId by 7 before the XOR mixes high and low bits so the
  // hash doesn't degenerate into ~sort-by-id (which was the bug with the
  // naive variant).
  const relWeight = (rId, cId) =>
    Math.imul((rId + 1) ^ ((cId + 1) << 7) ^ ((cId + 1) >>> 3), 2654435761) >>> 0;
  const related = sameOrigin
    .map(r => ({ r, w: relWeight(r.id || 0, currentId) }))
    .sort((a, b) => a.w - b.w)
    .slice(0, 5)
    .map(({ r }) => r)
    // Re-sort by id ascending so the rendered strip itself looks stable —
    // only the *selection* varies per page, not the visible order.
    .sort((a, b) => (a.id || 0) - (b.id || 0))
    .map(r => {
      const rn = r.name?.[code] || r.name?.en || r.name?.ro || '';
      const rs = slug(r.name?.en || r.name?.ro || rn);
      const ri = r.ingredients?.[code] || r.ingredients?.en || [];
      const rh = r.howIsMade?.[code] || r.howIsMade?.en || '';
      const rst = rh.split(/(?:\.\s+|[。！？]\s*)/).filter(s=>s.trim().length>2);
      const rcat = r.category?.[code] || r.category?.en || '';
      const rm = recipeMetadata(ri, rst, rcat, code);
      const re = recipeCardEmoji(rcat);
      // Use the same resolver as the hero (local /images/<slug>.{webp,jpg,png}
      // → recipeImages[id] → cover2.jpg placeholder) so the related-recipes
      // strip is consistent with what the detail page shows. The emoji stays
      // behind the <img> via existing CSS (.recipe-card-img img is absolute
      // overlay); on placeholder or 404 the <img> is omitted/removed and the
      // emoji shows through. Replaces the old client-side content.js IMG-map
      // injection, which had drifted from recipe-images.js.
      //
      // No srcset on these cards. Same reasoning as cuisine hub tiles (see
      // image-fix commit 95d92f5e5): browsers using the `sizes` hint sometimes
      // picked a 660w/990w Wikipedia variant that doesn't exist for that
      // source image, fired onerror, and removed the <img> — leaving only the
      // emoji. Using just `src` guarantees the exact URL that the detail page
      // is known to serve, matching cuisine hub behavior.
      const ri_img = resolveRecipeImage(r, rs);
      const ri_isPlaceholder = ri_img.src.endsWith('cover2.jpg');
      const ri_imgHtml = ri_isPlaceholder
        ? ''
        : `<img src="${ri_img.src}" alt="" loading="lazy" decoding="async"${imgFallbackAttrs(ri_img.src)}>`;
      return `<a href="${rl.dir}/${rs}/" class="recipe-card-item">
  <div class="recipe-card-img" data-card-recipe="${rs}">${re}${ri_imgHtml}</div>
  <div class="recipe-card-body">
    <p class="recipe-card-name">${esc(rn)}</p>
    <span class="recipe-card-meta">${rm.totalTime} · ${rm.difficulty}</span>
  </div>
</a>`;
    }).join('');

  // Cross-cuisine bridge — Phase 7 PR 3. Strict different-origin filter via
  // selectByTagMix; ranked by tag overlap desc, then id asc (deterministic).
  // Phase 7 polish: widened from ro/en to all 14 locales via BRIDGE_HEADING.
  // Cards reuse the same .recipe-card-item markup as the same-cuisine strip;
  // layout is a CSS grid (no carousel). Skipped silently when the recipe
  // has no tags or no eligible neighbours.
  let bridgeHtml = '';
  const currentItem = discoveryCatalog.find(it => it.id === recipe.id);
  const bridgeItems = currentItem && currentItem.tags.length
    ? selectByTagMix(discoveryCatalog, currentItem, { max: 4 })
    : [];
  if (bridgeItems.length > 0) {
    const bridgeHeading = BRIDGE_HEADING[code] || BRIDGE_HEADING.en;
    const cards = bridgeItems.map(item => {
      const raw = recipesById.get(item.id);
      if (!raw) return '';
      const rn = raw.name?.[code] || raw.name?.en || raw.name?.ro || '';
      const rs = slug(raw.name?.en || raw.name?.ro || rn);
      const ri = raw.ingredients?.[code] || raw.ingredients?.en || [];
      const rh = raw.howIsMade?.[code]  || raw.howIsMade?.en  || '';
      const rst = rh.split(/(?:\.\s+|[。！？]\s*)/).filter(s => s.trim().length > 2);
      const rcat = raw.category?.[code] || raw.category?.en || '';
      const rm = recipeMetadata(ri, rst, rcat, code);
      const re = recipeCardEmoji(rcat);
      const rOriginEn = raw.origin?.en || '';
      const rOriginLocal = raw.origin?.[code] || rOriginEn;
      const rFlag = COUNTRY_FLAG[rOriginEn] || '';
      const target = resolveDiscoveryTarget(item, code);
      const href = target.target === 'recipe'
        ? `${rl.dir}/${rs}/`
        : (recipeCuisineHubHref(rOriginEn, code) || `${rl.dir}/`);
      // Resolve image the same way the cuisine hub / same-cuisine strip does.
      // No srcset (Wikipedia 660w/990w variants sometimes 404, causing onerror
      // to remove the entire <img>). Emoji stays behind via CSS absolute
      // overlay; if the <img> is omitted (placeholder) or removed by onerror,
      // the emoji shows through.
      const bridgeImg = resolveRecipeImage(raw, rs);
      const bridgeImgHtml = bridgeImg.src.endsWith('cover2.jpg')
        ? ''
        : `<img src="${bridgeImg.src}" alt="" loading="lazy" decoding="async"${imgFallbackAttrs(bridgeImg.src)}>`;
      return `<a href="${href}" class="recipe-card-item recipe-card-bridge">
  <div class="recipe-card-img" data-card-recipe="${rs}">${re}${bridgeImgHtml}</div>
  <div class="recipe-card-body">
    <p class="recipe-card-name">${esc(rn)}</p>
    <span class="recipe-card-meta">${rFlag ? rFlag + ' ' : ''}${esc(rOriginLocal)} · ${rm.totalTime}</span>
  </div>
</a>`;
    }).filter(Boolean).join('');
    if (cards) {
      bridgeHtml = `
  <div class="recipe-bridge-section">
    <div class="recipe-related-header">
      <h2>${esc(bridgeHeading)}</h2>
    </div>
    <div class="recipe-bridge-grid">${cards}</div>
  </div>`;
    }
  }

  const dir_attr = rl.dir_attr || 'ltr';
  // Cuisine hub link (if this origin has a hub of ≥2 recipes). When present
  // we expose it in 3 places: breadcrumb, recipe-badge origin chip, and the
  // related-recipes "see all" target. This makes the recipe page a first-
  // class node in the cuisine browsing graph — direct-entry users (Google
  // search) can navigate up to the cuisine without sessionStorage state.
  const hubHref       = recipeCuisineHubHref(oEn, code);
  const hubAtmosphere = cuisineAtmosphere(oEn);
  const originBadge   = hubHref
    ? `<a class="recipe-badge-origin" href="${hubHref}">${esc(o)}</a>`
    : esc(o);
  const breadcrumbCuisine = hubHref
    ? ` › <a href="${hubHref}">${esc(o)}</a>`
    : '';
  return `${HEAD(rl.pageTitle(n), rl.pageDesc(n,o), `${rl.dir}/${rslug}/`, code, dir_attr, 'article', recipeImgUrl)}
<script type="application/ld+json">${jsonLd}</script>
${makeNav(lc, NAV_URL_FOR.recipe(rslug))}
<main class="content-main recipe-main" data-cuisine-atmosphere="${hubAtmosphere}">
<div class="recipe-page-wrap">

  <nav class="recipe-breadcrumb" aria-label="breadcrumb">
    <a href="/">${rl.breadHome}</a> › <a href="${rl.dir}/">${rl.breadLabel}</a>${breadcrumbCuisine} › <span>${esc(n)}</span>
  </nav>

  <!-- Hero — no srcset on the img. Same reason cuisine hub tiles and the
       related-card strip dropped srcset: browsers using the sizes hint
       sometimes pick a Wikipedia 660w/990w thumb variant that the upstream
       hasn't generated yet (cache miss to 404), onerror fires, and the
       entire img is removed — leaving only the emoji. The intermittent
       "image shows on second visit" symptom matches this exactly: a 404 on
       the first request can trigger upstream generation, so the next visit
       finds the variant cached. Using src alone guarantees the exact URL
       resolveRecipeImage validated. -->
  <div class="recipe-hero-grid">
    <div class="recipe-hero-img-col">
      <div class="recipe-photo-container" data-recipe="${rslug}" id="recipe-photo-main">${emoji}${
        recipeImg.src && !recipeImg.src.endsWith('cover2.jpg')
          ? `<img src="${recipeImg.src}" alt="${esc(n)}" loading="eager" fetchpriority="high" decoding="async"${imgFallbackAttrs(recipeImg.src)}>`
          : ''
      }</div>
    </div>
    <div class="recipe-hero-info-col">
      <div class="recipe-badge">${COUNTRY_FLAG[oEn] || '⭐'} ${esc(cat)} · ${originBadge}</div>
      <h1>${esc(n)}</h1>
      <p class="recipe-tagline">${esc(originTxt)}</p>
      <div class="recipe-meta-row">
        <div class="recipe-meta-item"><i class="bi bi-clock"></i><span class="recipe-meta-label">${ui.totalTime}</span><span class="recipe-meta-value">${meta.totalTime}</span></div>
        <div class="recipe-meta-item"><i class="bi bi-fire"></i><span class="recipe-meta-label">${ui.activeTime}</span><span class="recipe-meta-value">${meta.activeTime}</span></div>
        <div class="recipe-meta-item"><i class="bi bi-people-fill"></i><span class="recipe-meta-label">${ui.servings}</span><span class="recipe-meta-value">${meta.servings}</span></div>
        <div class="recipe-meta-item"><i class="bi bi-pencil-fill"></i><span class="recipe-meta-label">${ui.difficulty}</span><span class="recipe-meta-value">${meta.difficulty}</span></div>
        <div class="recipe-meta-item"><i class="bi bi-currency-dollar"></i><span class="recipe-meta-label">${ui.cost}</span><span class="recipe-meta-value">${meta.cost}</span></div>
      </div>
      <div class="recipe-cta-row">
        <a href="${appUrl}?meal=${encodeURIComponent(n)}" class="btn-recipe-primary"><i class="bi bi-plus-circle-fill"></i> ${rl.addBtn(n)}</a>
        <button class="btn-recipe-outline btn-print-pdf" onclick="window.print()" title="${ui.pdfTitle}"><i class="bi bi-printer"></i> ${ui.pdfBtn}</button>
      </div>
    </div>
  </div>

  <!-- Feature Cards -->
  <div class="recipe-features-row">${recipeFeatureCards(ingr, steps, cat, code, n, overrides, recipe, how, meta.totalMinsRaw)}</div>

  <!-- 3-column content -->
  <div class="recipe-content-grid">
    <div class="recipe-ingredients-col">
      <h2>${rl.ingredientsH.replace(/^[🛒\s]+/,'')} <span class="servings-badge">${ui.servingsLabel(meta.servings)}</span></h2>
      <ul class="recipe-ingr-list-new">
        ${ingr.map(i=>`<li><span class="recipe-ingr-dot"></span>${esc(capFirst(i))}</li>`).join('\n        ')}
      </ul>
      <button class="btn-add-shopping"><i class="bi bi-cart-plus"></i> ${ui.addShopping}</button>
    </div>
    <div class="recipe-steps-col">
      <h2>${rl.howToH.replace(/^[👨‍🍳\s]+/,'')}</h2>
      <ol class="recipe-steps-new">
        ${steps.map((s,i)=>`<li><span class="step-num">${i+1}</span><span>${esc(s.trimEnd().replace(/\.+$/, ''))}.</span></li>`).join('\n        ')}
      </ol>
      ${tip ? `<div class="recipe-tip-box"><span class="tip-icon">💡</span><div><strong>${stepsUi.tipLabel}:</strong> ${esc(tip)}</div></div>` : ''}
    </div>
    <div class="recipe-nutrition-col">
      <h2>${ui.nutritionH}</h2>
      <p class="nutrition-per">${nutritionPer}</p>
      <div class="nutrition-list">
        <div class="nutrition-row">${ui.cal} <span>${nutri.cal} kcal</span></div>
        <div class="nutrition-row">${ui.prot} <span>${nutri.prot} g</span></div>
        <div class="nutrition-row">${ui.carb} <span>${nutri.carb} g</span></div>
        <div class="nutrition-row">${ui.fat} <span>${nutri.fat} g</span></div>
        <div class="nutrition-row">${ui.fib} <span>${nutri.fib} g</span></div>
      </div>
      <p class="nutrition-disclaimer">${ui.nutritionDisc}</p>
      <p class="recipe-pairings-h">${ui.pairingsH}</p>
      <div class="pairings-grid">${recipePairings(ingr, cat, code, n, overrides, recipe)}</div>
    </div>
  </div>

  <!-- Related recipes — "see all" jumps to the cuisine hub when available,
       so users land on a focused list of THIS cuisine rather than the full
       175-recipe index. Direct recipe-index entry remains the fallback. -->
  ${related ? `<div class="recipe-related-section">
    <div class="recipe-related-header">
      <h2>${COUNTRY_FLAG[oEn] ? COUNTRY_FLAG[oEn] + ' ' : ''}${rl.relatedH(o)}</h2>
      <a href="${hubHref || rl.dir + '/'}">${ui.seeAll}</a>
    </div>
    <div class="recipe-cards-scroll">${related}</div>
  </div>` : ''}
${bridgeHtml}
  <!-- CTA Banner -->
  <div class="recipe-cta-banner">
    <span class="cta-banner-icon">🥗</span>
    <div class="cta-banner-text">
      <h3>${ui.ctaTitle}</h3>
      <p>${ui.ctaDesc}</p>
    </div>
    <a href="${appUrl}" class="btn-cta-banner">${ui.ctaBtn}</a>
  </div>

</div><!-- /.recipe-page-wrap -->

<!-- Mobile-only floating back pill. Static default:
       • Recipe has a cuisine hub → pill points to that hub, label = origin
         ("← Italy"). Visually distinct via .mp-back-pill--cuisine accent.
       • No hub (single-recipe origins) → pill points to recipe index,
         label = "← Recipes". Same component, no accent.
     content.js may further override the label/href at runtime if the
     user navigated FROM a different cuisine hub (rare cross-cuisine flow). -->
<a class="recipe-mobile-back mp-back-pill${hubHref ? ' mp-back-pill--cuisine' : ''}"
   href="${hubHref || rl.dir + '/'}" data-rmn-back
   data-cuisine-atmosphere="${hubAtmosphere}"
   aria-label="${esc(hubHref ? o : rl.breadLabel)}"
   role="button">
  <span class="rmb-arrow" aria-hidden="true">←</span>
  <span class="rmb-label">${esc(hubHref ? o : rl.breadLabel)}</span>
</a>

</main>${makeFooter(lc)}<script src="/js/content.js" defer></script></body></html>`;
}

/* EN-origin → flag emoji. Multi-region origins ("Asia", "Middle East")
   keep the generic globe. Used by recipeIndex() to give each country
   card its own visual identity instead of a repeating 🌍. */
const COUNTRY_FLAG = {
  Algeria: '🇩🇿', Argentina: '🇦🇷', Armenia: '🇦🇲', Australia: '🇦🇺',
  Belgium: '🇧🇪', 'Bosnia and Herzegovina': '🇧🇦', Brazil: '🇧🇷',
  Cambodia: '🇰🇭', Canada: '🇨🇦', 'Cape Verde': '🇨🇻', Chile: '🇨🇱',
  China: '🇨🇳', Colombia: '🇨🇴', Croatia: '🇭🇷', Cuba: '🇨🇺',
  Cyprus: '🇨🇾', 'Czech Republic': '🇨🇿', Denmark: '🇩🇰',
  'Dominican Republic': '🇩🇴', Ecuador: '🇪🇨', Egypt: '🇪🇬',
  'El Salvador': '🇸🇻', Estonia: '🇪🇪', Ethiopia: '🇪🇹', Finland: '🇫🇮',
  France: '🇫🇷', Georgia: '🇬🇪', Germany: '🇩🇪', Ghana: '🇬🇭',
  Greece: '🇬🇷', Guatemala: '🇬🇹', Hungary: '🇭🇺', India: '🇮🇳',
  Indonesia: '🇮🇩', Iran: '🇮🇷', Iraq: '🇮🇶', Israel: '🇮🇱',
  Italy: '🇮🇹', Jamaica: '🇯🇲', Japan: '🇯🇵', Kuwait: '🇰🇼',
  Kyrgyzstan: '🇰🇬', Latvia: '🇱🇻', Lebanon: '🇱🇧', Lithuania: '🇱🇹',
  Malaysia: '🇲🇾', Mexico: '🇲🇽', Moldova: '🇲🇩', Mongolia: '🇲🇳',
  Morocco: '🇲🇦', Nepal: '🇳🇵', Netherlands: '🇳🇱',
  'New Zealand': '🇳🇿', Nigeria: '🇳🇬', 'North Korea': '🇰🇵',
  Norway: '🇳🇴', Pakistan: '🇵🇰', Peru: '🇵🇪', Philippines: '🇵🇭',
  Poland: '🇵🇱', Portugal: '🇵🇹', 'Republic of the Congo': '🇨🇬',
  Romania: '🇷🇴', Russia: '🇷🇺', Samoa: '🇼🇸',
  Scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', Serbia: '🇷🇸', Singapore: '🇸🇬',
  Slovenia: '🇸🇮', 'South Africa': '🇿🇦', 'South Korea': '🇰🇷',
  Spain: '🇪🇸', 'Sri Lanka': '🇱🇰', Sudan: '🇸🇩', Sweden: '🇸🇪',
  Switzerland: '🇨🇭', Syria: '🇸🇾', Thailand: '🇹🇭', Tunisia: '🇹🇳',
  Turkey: '🇹🇷', Turkmenistan: '🇹🇲', UK: '🇬🇧', USA: '🇺🇸',
  Ukraine: '🇺🇦', 'United Kingdom': '🇬🇧', Uzbekistan: '🇺🇿',
  Venezuela: '🇻🇪', Vietnam: '🇻🇳',
};

/* ════════════════════════════════════════════════════════════════
   CUISINE ATMOSPHERE — per-origin visual identity
   ════════════════════════════════════════════════════════════════
   Each origin maps to one of ~13 regional "atmosphere" themes
   (mediterranean, east-asian, latin, …). Atmospheres carry CSS
   variables for accent + gradient (defined in content.css). The
   render path stamps `data-cuisine-atmosphere="…"` on the hub
   <main> and on each hub-index card so CSS can theme them.

   Cuisines that aren't mapped here fall through to "global"
   (warm green like the rest of the design system).
*/
const CUISINE_ATMOSPHERE = {
  // Mediterranean: terracotta + cream
  'Italy':'mediterranean','Greece':'mediterranean','Spain':'mediterranean',
  'France':'mediterranean','Portugal':'mediterranean','Croatia':'mediterranean',
  'Cyprus':'mediterranean','Bosnia and Herzegovina':'mediterranean','Slovenia':'mediterranean',
  'Malta':'mediterranean','Cape Verde':'mediterranean',
  // East Asian: sakura + indigo
  'Japan':'east-asian','China':'east-asian','South Korea':'east-asian',
  'North Korea':'east-asian','Mongolia':'east-asian',
  // Southeast Asian: jade + coral
  'Vietnam':'se-asian','Thailand':'se-asian','Indonesia':'se-asian',
  'Malaysia':'se-asian','Philippines':'se-asian','Cambodia':'se-asian',
  'Singapore':'se-asian','Sri Lanka':'se-asian','Laos':'se-asian',
  // South Asian: saffron + curry
  'India':'south-asian','Pakistan':'south-asian','Nepal':'south-asian','Bangladesh':'south-asian',
  // Middle Eastern: copper + sand
  'Syria':'middle-eastern','Lebanon':'middle-eastern','Iran':'middle-eastern',
  'Iraq':'middle-eastern','Israel':'middle-eastern','Egypt':'middle-eastern',
  'Kuwait':'middle-eastern','Turkey':'middle-eastern','Middle East':'middle-eastern',
  'Jordan':'middle-eastern','Saudi Arabia':'middle-eastern',
  // North African: spice + clay
  'Morocco':'north-african','Tunisia':'north-african','Algeria':'north-african','Sudan':'north-african',
  // Latin: sunset + lime
  'Mexico':'latin','Peru':'latin','Argentina':'latin','Brazil':'latin',
  'Cuba':'latin','Colombia':'latin','Ecuador':'latin','Chile':'latin',
  'Dominican Republic':'latin','El Salvador':'latin','Venezuela':'latin',
  'Guatemala':'latin','Jamaica':'latin',
  // Eastern European: burgundy + forest
  'Hungary':'east-european','Poland':'east-european','Czech Republic':'east-european',
  'Romania':'east-european','Russia':'east-european','Ukraine':'east-european',
  'Moldova':'east-european','Lithuania':'east-european','Latvia':'east-european',
  'Estonia':'east-european','Serbia':'east-european','Bulgaria':'east-european',
  'Georgia':'east-european','Armenia':'east-european','Belarus':'east-european',
  // Nordic: glacier blue + silver
  'Sweden':'nordic','Finland':'nordic','Norway':'nordic','Denmark':'nordic','Iceland':'nordic',
  // Sub-Saharan: earth + amber
  'Nigeria':'sub-saharan','Ghana':'sub-saharan','South Africa':'sub-saharan',
  'Ethiopia':'sub-saharan','Republic of the Congo':'sub-saharan',
  // Anglo: navy + cream
  'UK':'anglo','United Kingdom':'anglo','USA':'anglo','Canada':'anglo',
  'Australia':'anglo','New Zealand':'anglo','Scotland':'anglo',
  // Central European: forest + oak
  'Switzerland':'central-european','Germany':'central-european','Netherlands':'central-european',
  'Belgium':'central-european','Austria':'central-european',
  // Central Asian: turquoise + khaki
  'Uzbekistan':'central-asian','Kyrgyzstan':'central-asian','Turkmenistan':'central-asian',
  // Pacific / catch-all
  'Samoa':'pacific',
};
const cuisineAtmosphere = (originEnKey) => CUISINE_ATMOSPHERE[originEnKey] || 'global';

/* Helpers defined later (after CUISINE_MIN_RECIPES / CUISINE_HUB_LANG):
     HUB_ELIGIBLE_ORIGINS — Set of origin EN keys with a hub
     recipeCuisineHubHref(originEnKey, lc_code) — returns hub URL or null
   Forward-declared via `var` so recipePage() can use them; populated
   below where the cuisine constants are in scope. */
var HUB_ELIGIBLE_ORIGINS;
var recipeCuisineHubHref;

/* ════════════════════════════════════════════════════════════════
   CUISINE CTA STRINGS — localized labels for discovery surfaces
   ════════════════════════════════════════════════════════════════
   Used by the cuisine discovery CTA injected into the plan-listing
   index (indexPage) and the recipes index (recipeIndex). Keeping
   it as a flat lookup avoids adding fields to LANG_CONFIGS for a
   single feature surface. */
/* Sourced from i18n.js (single source of truth — see CUISINE_I18N there).
   Kept as a {eyebrow,heading,sub(n),btn(n)} shape so existing call sites are
   unchanged; {n} in the i18n strings is interpolated with the cuisine count. */
const CUISINE_CTA = Object.fromEntries(Object.keys(i18n).map(lc => {
  const g = k => (i18n[lc] && i18n[lc][k]) || i18n.en[k] || '';
  return [lc, {
    eyebrow: g('cuisine.eyebrow'),
    heading: g('cuisine.heading'),
    sub: n => g('cuisine.sub').replace('{n}', n),
    btn: n => g('cuisine.btn').replace('{n}', n),
  }];
}));

/* Builds tile-display data for a single recipe on a cuisine page.
   Returns { name, slug, href, img, atmosphereFallbackEmoji,
             desc, timeMins, readyIn, tags } — every field is
   locale-aware. `img` is the same URL the recipe page would use
   so cache hits across navigations. */
// Tile-safe excerpt from a longer prose field (typically recipe.originText).
// Takes the first sentence; if it exceeds ~160 chars, truncates at a word
// boundary and appends an ellipsis. Handles Latin (`. `), Arabic/Hindi
// (space-separated), and CJK (`。`/`！`/`？`) sentence terminators.
function tileExcerpt(text, maxLen = 160) {
  if (!text) return '';
  const trimmed = String(text).trim();
  if (!trimmed) return '';
  // First sentence ending in Latin `.!?` or CJK `。！？`.
  const m = trimmed.match(/^[^.!?。！？]*[.!?。！？]/);
  const first = (m ? m[0] : trimmed).trim();
  if (first.length <= maxLen) return first;
  // Word-boundary truncation. The `> 60` guard avoids cutting CJK runs
  // (which have no spaces) down to nothing — better to over-deliver and let
  // CSS line-clamp handle the visual cap.
  const cut = first.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 60 ? cut.slice(0, lastSpace) : cut) + '…';
}

function cuisineTileData(recipe, lc_code, recipeBaseDir) {
  const rn   = recipe.name?.[lc_code] || recipe.name?.en || recipe.name?.ro || '';
  const rs   = slug(recipe.name?.en || recipe.name?.ro || rn);
  const meta = recipesMeta[recipe.id] || {};
  const img  = resolveRecipeImage(recipe, rs);
  // Localized short descriptor with a four-level fallback chain so every
  // tile renders a description. Authored meta.desc wins; otherwise an
  // excerpt of the recipe's own originText (which is the source of the
  // detail-page intro) — same content the reader sees one click away.
  const desc = meta.desc?.[lc_code]
            || meta.desc?.en
            || tileExcerpt(recipe.originText?.[lc_code])
            || tileExcerpt(recipe.originText?.en)
            || '';
  const tags = (meta.tags || []).slice(0, 2)
    .map(t => TAG_LABELS[t]?.[lc_code] || TAG_LABELS[t]?.en || t);
  const readyFn = READY_IN[lc_code] || READY_IN.en;
  const readyIn = meta.time ? readyFn(meta.time) : '';
  return {
    name: rn,
    slug: rs,
    href: `${recipeBaseDir}/${rs}/`,
    img: img.src,
    desc,
    timeMins: meta.time,
    readyIn,
    tags,
  };
}

function recipeIndex(rl) {
  const lc   = rl.lc;
  const code = lc.code;
  const dir_attr = rl.dir_attr || 'ltr';
  // Phase 5: /<lc>/<recipe-prefix>/ IS the cuisine hub. The old per-origin
  // recipe-list layout is gone (it duplicated the country pages a click
  // away). The page now renders a card grid identical to what used to live
  // at /<lc>/<cuisine-prefix>/ — one card per eligible cuisine, with
  // thumbnail strip + curated preview, atmosphere-tinted accent.
  const eligible = buildCuisineHubs();
  const cards = eligible.map(([enKey, recs]) => {
    const display    = recs[0].origin?.[code] || enKey;
    const flag       = COUNTRY_FLAG[enKey] || '🌍';
    const originSlug = slug(enKey);
    const countryHref = `${rl.dir}/${originSlug}/`;
    const atmosphere = cuisineAtmosphere(enKey);
    // Pick up to 3 thumbnails, preferring stable hosts (local > Wikipedia >
    // Spoonacular > placeholder). Stable-tier ranking matters because
    // Spoonacular hot-links 404 in many regions — without sorting we'd
    // surface flag fallbacks for cuisines that actually have working
    // Wikipedia images further down the array.
    const allThumbs = recs.map(r => {
      const rs = slug(r.name?.en || r.name?.ro || '');
      return resolveRecipeImage(r, rs).src;
    });
    const ranked = allThumbs
      .map((u, i) => ({ u, i, s: imgStability(u) }))
      .sort((a, b) => b.s - a.s || a.i - b.i)
      .map(x => x.u);
    const goodThumbs = ranked.filter(u => !/cover2\.jpg$/.test(u));
    const thumbs = (goodThumbs.length >= 3 ? goodThumbs : ranked).slice(0, 3);
    const thumbsHtml = thumbs.map((u, i) => {
      const isPlaceholder = /cover2\.jpg$/.test(u);
      // No srcset on cuisine montage thumbs. The inline onerror handler is
      // the only mechanism that can remove an SSR-rendered image (no JS on
      // this page touches these elements — content.js targets recipe-detail
      // surfaces only). With a multi-width srcset the browser picks a
      // candidate based on `sizes` × DPR and 404s on the chosen variant for
      // some Wikipedia files cause the image to flash into view then
      // disappear as onerror removes it. Falling back to just the base 330w
      // src — same URL the detail page renders and Open Graph crawlers
      // already exercise — guarantees one URL is fetched and it's the one
      // we know works.
      return `<span class="cuisine-card-thumb" data-thumb-pos="${i}">
        <span class="cuisine-card-thumb-fallback" aria-hidden="true">${flag}</span>
        ${isPlaceholder ? '' : `<img src="${u}" alt="" loading="lazy" decoding="async"${imgFallbackAttrs(u)}/>`}
      </span>`;
    }).join('');
    const previewNames = recs.slice(0, 3).map(r =>
      r.name?.[code] || r.name?.en || r.name?.ro || ''
    ).filter(Boolean).join(' · ');
    return `
    <article class="cuisine-card cuisine-card--preview" data-cuisine-atmosphere="${atmosphere}">
      <a class="cuisine-card-link" href="${countryHref}" aria-label="${esc(display)}"></a>
      <div class="cuisine-card-thumbs" data-thumb-count="${thumbs.length}" aria-hidden="true">${thumbsHtml}</div>
      <div class="cuisine-card-meta">
        <h2 class="origin-title">
          <span class="origin-title-text">${flag} ${esc(display)}</span>
          <span class="recipe-count">${recs.length}</span>
        </h2>
        <p class="cuisine-card-preview-names">${esc(previewNames)}</p>
      </div>
    </article>`;
  }).join('');

  // Schema.org CollectionPage describing the cuisine hub. itemListElement
  // contains the country pages (positions 1..N) so search engines understand
  // this is a directory of cuisines, not a flat recipe list.
  const items = eligible.map(([enKey, recs], i) => {
    const display = recs[0].origin?.[code] || enKey;
    return {
      "@type": "ListItem",
      "position": i + 1,
      "url": `https://meal-planner.ro${rl.dir}/${slug(enKey)}/`,
      "name": display,
    };
  });
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": rl.indexTitle.split(' | ')[0],
    "description": rl.indexDesc(recipes.length),
    "url": `https://meal-planner.ro${rl.dir}/`,
    "inLanguage": code,
    "isPartOf": { "@type": "WebSite", "name": "Meal-Planner.ro", "url": "https://meal-planner.ro/" },
    "hasPart": { "@type": "ItemList", "numberOfItems": eligible.length, "itemListElement": items }
  });

  return `${HEAD(rl.indexTitle, rl.indexDesc(recipes.length), `${rl.dir}/`, code, dir_attr)}
${makeNav(lc, NAV_URL_FOR.recipeIndex())}<main class="content-main cuisine-hub-index-main">
  <section class="content-hero content-hero--short"><div class="content-hero-inner">
    <nav aria-label="breadcrumb" class="breadcrumb-nav"><a href="/">${rl.breadHome}</a> › <span>${rl.breadLabel}</span></nav>
    <h1>${rl.indexH1}</h1>
    <p class="content-hero-desc">${rl.indexDesc(recipes.length)}</p>
  </div></section>
  <section class="content-section"><div class="content-section-inner">
    <div class="recipe-groups-grid">${cards}</div>
  </div></section>
  <script type="application/ld+json">${jsonLd}</script>
</main>${makeFooter(lc)}<script src="/js/content.js" defer></script></body></html>`;
}

/* ════════════════════════════════════════════════════════════════
   HUB ARCHITECTURE — scalable static facet pages
   ════════════════════════════════════════════════════════════════
   Aggregates recipes by a single facet (origin, meal type, dietary
   style, cooking method, ingredient). Each hub is a fully-static,
   indexable, localized page at /<locale>/<prefix>/<slug>/.

   Phase 3 Item 1 ships the architecture + the first hub type (cuisines).
   Future hub types (meal-type, dietary, cooking, ingredient) plug into
   the same hubPage()/HUB_LANG machinery.

   URL-slug strategy: facet slugs are derived from the English label
   (slug(origin.en)) so they stay stable across locales — mirrors the
   recipe-slug convention (`/ro/retete/moussaka/`, `/ja/reshipi/moussaka/`).
*/

const CUISINE_MIN_RECIPES = 2;   // skip thin-content hubs (1-recipe origins)
// INTERIM cap on tiles rendered per cuisine hub. Phase 8B targets a 10-recipe
// floor per hub, so 8 (the original value) silently hid the last 2 recipes —
// they became undiscoverable through normal navigation. Raising to 24 keeps
// every current and near-future hub fully visible.
//
// This is NOT the final architecture. The correct long-term split is:
//   - preview surfaces (homepage discovery, related-cuisines strip, landing
//     cards): keep a small cap (~6–8) for layout/perf, mobile-friendly;
//   - actual cuisine hub pages (this constant): render the FULL cuisine
//     corpus, or provide an explicit "Show all recipes" / pagination /
//     expandable behaviour so nothing is hidden.
// Until the hub-page split lands, the rule is simple: no recipe may become
// undiscoverable because of a preview cap. Audit every change that hides
// recipes against that rule.
const MAX_HUB_TILES = 24;

// Populate the forward-declared helpers now that CUISINE_MIN_RECIPES is in
// scope. CUISINE_HUB_LANG is defined immediately below — it'll be in scope
// by the time recipeCuisineHubHref is *called* (top-level script flow).
HUB_ELIGIBLE_ORIGINS = new Set(
  Object.entries(
    recipes.reduce((m, r) => {
      const k = r.origin?.en || r.origin?.ro;
      if (k) m[k] = (m[k] || 0) + 1;
      return m;
    }, {})
  ).filter(([, n]) => n >= CUISINE_MIN_RECIPES).map(([k]) => k)
);
recipeCuisineHubHref = function (originEnKey, lc_code) {
  if (!originEnKey || !HUB_ELIGIBLE_ORIGINS.has(originEnKey)) return null;
  const rl = RECIPE_LANG[lc_code];
  if (!rl) return null;
  // Phase 5 architecture: country pages live UNDER the recipe-index dir,
  // not under a separate /<cuisine-prefix>/ branch. The URL pattern is
  // /<lc>/<recipe-prefix>/<country-slug>/ — same level as individual
  // recipes (no collision today; build-time guard added below).
  return `${rl.dir}/${slug(originEnKey)}/`;
};

// Slug-collision guard: country pages and recipe pages now share the same
// directory (/<lc>/<recipe-prefix>/<slug>/) so we must enforce that no
// country slug ever matches a recipe slug. Throws at build time if any
// collision exists — safer to fail the build than ship a 404 trap.
(() => {
  const recipeSlugs = new Set(
    recipes.map(r => slug(r.name?.en || r.name?.ro || '')).filter(Boolean)
  );
  const collisions = [...HUB_ELIGIBLE_ORIGINS]
    .map(k => ({ country: k, slug: slug(k) }))
    .filter(c => recipeSlugs.has(c.slug));
  if (collisions.length) {
    console.error('\n❌ FATAL: country slug collides with recipe slug:');
    collisions.forEach(c => console.error(`   ${c.country} → /${c.slug}/`));
    console.error('   Rename one or the other before continuing.');
    process.exit(1);
  }
})();

const CUISINE_HUB_LANG = {
  ro: { prefix:'bucatarie',
        breadLabel:'Bucătărie',
        title:    (o)    => `Rețete din ${o} – Bucătărie autentică | Meal-Planner.ro`,
        desc:     (o, n) => `${n} rețete tradiționale din ${o}: ingrediente, mod de preparare pas cu pas și valori nutriționale. Adaugă-le în planificatorul tău săptămânal gratuit.`,
        h1:       (o)    => `Rețete din <span class="accent">${o}</span>`,
        intro:    (o, n) => `${n} rețete autentice din ${o}, cu ingrediente, mod de preparare și valori nutriționale. Toate pot fi adăugate în planul tău săptămânal gratuit.`,
        backLink: 'Înapoi la toate rețetele' },
  en: { prefix:'cuisine',
        breadLabel:'Cuisine',
        title:    (o)    => `Recipes from ${o} – Authentic Dishes & Free Meal Plan | Meal-Planner.ro`,
        desc:     (o, n) => `${n} traditional recipes from ${o} with ingredients, step-by-step instructions and nutrition info. Add any of them to your free weekly meal planner.`,
        h1:       (o)    => `Recipes from <span class="accent">${o}</span>`,
        intro:    (o, n) => `${n} authentic recipes from ${o}, with ingredients, step-by-step instructions and nutrition info. Add any of them to your free weekly meal planner.`,
        backLink: 'Back to all recipes' },
  es: { prefix:'cocina',
        breadLabel:'Cocina',
        title:    (o)    => `Recetas de ${o} – Auténticas y Plan Gratuito | Meal-Planner.ro`,
        desc:     (o, n) => `${n} recetas tradicionales de ${o}: ingredientes, instrucciones paso a paso y nutrición. Añádelas a tu planificador semanal gratuito.`,
        h1:       (o)    => `Recetas de <span class="accent">${o}</span>`,
        intro:    (o, n) => `${n} recetas auténticas de ${o}, con ingredientes, instrucciones y valores nutricionales. Todas pueden añadirse a tu plan semanal gratuito.`,
        backLink: 'Volver a todas las recetas' },
  fr: { prefix:'cuisine',
        breadLabel:'Cuisine',
        title:    (o)    => `Recettes de ${o} – Plats Authentiques | Meal-Planner.ro`,
        desc:     (o, n) => `${n} recettes traditionnelles de ${o} : ingrédients, instructions étape par étape et valeurs nutritionnelles. Ajoutez-les à votre planificateur hebdomadaire gratuit.`,
        h1:       (o)    => `Recettes de <span class="accent">${o}</span>`,
        intro:    (o, n) => `${n} recettes authentiques de ${o}, avec ingrédients, instructions et valeurs nutritionnelles. Toutes peuvent être ajoutées à votre plan hebdomadaire gratuit.`,
        backLink: 'Retour à toutes les recettes' },
  de: { prefix:'kueche',
        breadLabel:'Küche',
        title:    (o)    => `Rezepte aus ${o} – Authentische Gerichte & Wochenplan | Meal-Planner.ro`,
        desc:     (o, n) => `${n} traditionelle Rezepte aus ${o}: Zutaten, Schritt-für-Schritt-Anleitung und Nährwerte. Füge sie zu deinem kostenlosen Wochenplaner hinzu.`,
        h1:       (o)    => `Rezepte aus <span class="accent">${o}</span>`,
        intro:    (o, n) => `${n} authentische Rezepte aus ${o} mit Zutaten, Anleitung und Nährwerten. Alle können zu deinem kostenlosen Wochenplan hinzugefügt werden.`,
        backLink: 'Zurück zu allen Rezepten' },
  pt: { prefix:'cozinha',
        breadLabel:'Cozinha',
        title:    (o)    => `Receitas de ${o} – Pratos Autênticos | Meal-Planner.ro`,
        desc:     (o, n) => `${n} receitas tradicionais de ${o}: ingredientes, instruções passo a passo e nutrição. Adicione-as ao seu planejador semanal gratuito.`,
        h1:       (o)    => `Receitas de <span class="accent">${o}</span>`,
        intro:    (o, n) => `${n} receitas autênticas de ${o}, com ingredientes, instruções e valores nutricionais. Todas podem ser adicionadas ao seu plano semanal gratuito.`,
        backLink: 'Voltar a todas as receitas' },
  ru: { prefix:'kuhnya',
        breadLabel:'Кухня',
        title:    (o)    => `Рецепты из ${o} – Аутентичные блюда | Meal-Planner.ro`,
        desc:     (o, n) => `${n} традиционных рецептов из ${o}: ингредиенты, пошаговые инструкции и пищевая ценность. Добавьте их в свой бесплатный планировщик меню на неделю.`,
        h1:       (o)    => `Рецепты из <span class="accent">${o}</span>`,
        intro:    (o, n) => `${n} аутентичных рецептов из ${o} — ингредиенты, инструкции и пищевая ценность. Каждый можно добавить в бесплатный планировщик меню на неделю.`,
        backLink: 'Назад ко всем рецептам' },
  ar: { prefix:'matbakh',
        breadLabel:'مطبخ',
        title:    (o)    => `وصفات من ${o} – أطباق أصيلة وخطة وجبات | Meal-Planner.ro`,
        desc:     (o, n) => `${n} وصفة تقليدية من ${o}: مكونات وتعليمات خطوة بخطوة وقيم غذائية. أضفها إلى مخطط الوجبات الأسبوعي المجاني.`,
        h1:       (o)    => `وصفات من <span class="accent">${o}</span>`,
        intro:    (o, n) => `${n} وصفة أصيلة من ${o} مع المكونات وطرق التحضير والقيم الغذائية. كل وصفة يمكن إضافتها إلى خطة الوجبات الأسبوعية المجانية.`,
        backLink: 'العودة إلى جميع الوصفات' },
  zh: { prefix:'caixi',
        breadLabel:'菜系',
        title:    (o)    => `${o}菜谱 – 正宗菜系与免费周计划 | Meal-Planner.ro`,
        desc:     (o, n) => `${n}道来自${o}的传统菜谱:食材、分步说明和营养信息。可加入免费每周饮食计划。`,
        h1:       (o)    => `来自<span class="accent">${o}</span>的菜谱`,
        intro:    (o, n) => `${n}道来自${o}的正宗菜谱,含食材、做法和营养信息。每道都可加入免费的每周饮食计划。`,
        backLink: '返回所有食谱' },
  ja: { prefix:'ryori',
        breadLabel:'料理',
        title:    (o)    => `${o}のレシピ – 本格的な家庭料理と週間プラン | Meal-Planner.ro`,
        desc:     (o, n) => `${n}の伝統的な${o}のレシピ。材料、手順、栄養情報付き。無料の週間ミールプランナーに追加できます。`,
        h1:       (o)    => `<span class="accent">${o}</span>のレシピ`,
        intro:    (o, n) => `${n}の本格的な${o}のレシピ。材料、手順、栄養情報を掲載。すべて無料の週間ミールプランナーに追加できます。`,
        backLink: 'すべてのレシピに戻る' },
  hi: { prefix:'vyanjan',
        breadLabel:'व्यंजन',
        title:    (o)    => `${o} की रेसिपी – पारंपरिक व्यंजन और मील प्लानर | Meal-Planner.ro`,
        desc:     (o, n) => `${n} पारंपरिक ${o} की रेसिपी: सामग्री, चरण-दर-चरण निर्देश और पोषण की जानकारी। मुफ्त साप्ताहिक मील प्लानर में जोड़ें।`,
        h1:       (o)    => `<span class="accent">${o}</span> की रेसिपी`,
        intro:    (o, n) => `${n} पारंपरिक ${o} की रेसिपी, सामग्री, निर्देश और पोषण की जानकारी के साथ। सभी को मुफ्त साप्ताहिक मील प्लानर में जोड़ा जा सकता है।`,
        backLink: 'सभी रेसिपी पर वापस' },
  tr: { prefix:'mutfak',
        breadLabel:'Mutfak',
        title:    (o)    => `${o} tarifleri – Otantik Yemekler | Meal-Planner.ro`,
        desc:     (o, n) => `${n} geleneksel ${o} tarifi: malzemeler, adım adım talimatlar ve besin değerleri. Ücretsiz haftalık öğün planlayıcınıza ekleyin.`,
        h1:       (o)    => `<span class="accent">${o}</span> tarifleri`,
        intro:    (o, n) => `${n} otantik ${o} tarifi — malzemeler, talimatlar ve besin değerleri. Her biri ücretsiz haftalık planlayıcıya eklenebilir.`,
        backLink: 'Tüm tariflere dön' },
  it: { prefix:'cucina',
        breadLabel:'Cucina',
        title:    (o)    => `Ricette di ${o} – Piatti Autentici e Piano Gratuito | Meal-Planner.ro`,
        desc:     (o, n) => `${n} ricette tradizionali di ${o}: ingredienti, istruzioni passo dopo passo e valori nutrizionali. Aggiungile al tuo piano settimanale gratuito.`,
        h1:       (o)    => `Ricette di <span class="accent">${o}</span>`,
        intro:    (o, n) => `${n} ricette autentiche di ${o}, con ingredienti, istruzioni e valori nutrizionali. Tutte possono essere aggiunte al tuo piano settimanale gratuito.`,
        backLink: 'Torna a tutte le ricette' },
  ko: { prefix:'yori',
        breadLabel:'요리',
        title:    (o)    => `${o} 레시피 – 정통 요리와 주간 식단 | Meal-Planner.ro`,
        desc:     (o, n) => `${n}개의 전통 ${o} 레시피: 재료, 단계별 지침, 영양 정보 포함. 무료 주간 식단 플래너에 추가하세요.`,
        h1:       (o)    => `<span class="accent">${o}</span> 레시피`,
        intro:    (o, n) => `${n}개의 정통 ${o} 레시피 — 재료, 지침, 영양 정보를 포함합니다. 모두 무료 주간 식단 플래너에 추가할 수 있습니다.`,
        backLink: '모든 레시피로 돌아가기' },
};

// Phase 7 PR 2: heading shown above the cuisine-hub "related cuisines" strip
// (one per locale). Kept in a side-map so it can be added/edited without
// touching the per-key CUISINE_HUB_LANG block. Strings are ASCII-or-Unicode
// (no curly quotes — see CLAUDE.md pre-commit invariant).
const CUISINE_RELATED_HEADING = {
  ro: 'Explorează bucătării similare',
  en: 'Explore related cuisines',
  es: 'Explora cocinas relacionadas',
  fr: 'Explorez des cuisines proches',
  de: 'Verwandte Küchen entdecken',
  pt: 'Explore cozinhas relacionadas',
  ru: 'Похожие кухни',
  ar: 'اكتشف مطابخ مشابهة',
  zh: '探索相关菜系',
  ja: '関連する料理を見る',
  hi: 'संबंधित व्यंजन देखें',
  tr: 'İlgili mutfakları keşfedin',
  it: 'Esplora cucine simili',
  ko: '관련 요리 둘러보기',
};

// Phase 7 polish: heading for the cross-cuisine "similar dishes" bridge on
// recipe detail pages. One per locale; recipePage falls back to en if a
// locale is missing. Wider than CUISINE_RELATED_HEADING because the bridge
// is per-recipe (not per-cuisine) — it implies "similar dishes" rather than
// "similar cuisines", so the wording differs in some locales.
const BRIDGE_HEADING = {
  ro: 'Asemănătoare din alte bucătării',
  en: 'Similar dishes from other cuisines',
  es: 'Platos similares de otras cocinas',
  fr: 'Plats similaires d\'autres cuisines',
  de: 'Ähnliche Gerichte aus anderen Küchen',
  pt: 'Pratos parecidos de outras cozinhas',
  ru: 'Похожие блюда из других кухонь',
  ar: 'أطباق مشابهة من مطابخ أخرى',
  zh: '其他菜系的相似料理',
  ja: '他の国の似た料理',
  hi: 'अन्य व्यंजनों के समान पकवान',
  tr: 'Diğer mutfaklardan benzer yemekler',
  it: 'Piatti simili da altre cucine',
  ko: '다른 요리의 비슷한 음식',
};

// Localized hub-index labels (the "/cuisine/" landing page that lists all
// cuisine hubs). Kept compact — full localization of marketing copy can be
// expanded later without touching the per-hub pages.
const CUISINE_HUB_INDEX_LANG = {
  ro: { title:'Bucătării din toată lumea | Meal-Planner.ro', pill:'Toate bucătăriile',
        desc: n=>`Descoperă ${n} bucătării internaționale cu rețete autentice și planificator gratuit.`,
        h1:'Bucătării <span class="accent">din toată lumea</span>',
        intro: n=>`Descoperă ${n} bucătării internaționale, fiecare cu rețete autentice, mod de preparare și valori nutriționale.` },
  en: { title:'World Cuisines – Browse Recipes by Country | Meal-Planner.ro', pill:'All cuisines',
        desc: n=>`Explore ${n} world cuisines with authentic recipes, ingredients, instructions and a free meal planner.`,
        h1:'World <span class="accent">Cuisines</span>',
        intro: n=>`Explore ${n} world cuisines, each with authentic recipes, step-by-step instructions and nutrition info.` },
  es: { title:'Cocinas del mundo – Recetas por país | Meal-Planner.ro', pill:'Todas las cocinas',
        desc: n=>`Explora ${n} cocinas del mundo con recetas auténticas, ingredientes, instrucciones y un planificador gratuito.`,
        h1:'Cocinas <span class="accent">del mundo</span>',
        intro: n=>`Explora ${n} cocinas del mundo, cada una con recetas auténticas, instrucciones paso a paso y datos nutricionales.` },
  fr: { title:'Cuisines du monde – Recettes par pays | Meal-Planner.ro', pill:'Toutes les cuisines',
        desc: n=>`Découvrez ${n} cuisines du monde avec recettes authentiques, ingrédients, instructions et planificateur gratuit.`,
        h1:'Cuisines <span class="accent">du monde</span>',
        intro: n=>`Découvrez ${n} cuisines du monde, chacune avec recettes authentiques, instructions étape par étape et nutrition.` },
  de: { title:'Weltküchen – Rezepte nach Land | Meal-Planner.ro', pill:'Alle Küchen',
        desc: n=>`Entdecke ${n} Weltküchen mit authentischen Rezepten, Zutaten, Anleitungen und einem kostenlosen Mahlzeitenplaner.`,
        h1:'<span class="accent">Weltküchen</span>',
        intro: n=>`Entdecke ${n} Weltküchen mit authentischen Rezepten, Anleitungen und Nährwertangaben.` },
  pt: { title:'Cozinhas do mundo – Receitas por país | Meal-Planner.ro', pill:'Todas as cozinhas',
        desc: n=>`Explore ${n} cozinhas do mundo com receitas autênticas, ingredientes, instruções e planejador gratuito.`,
        h1:'Cozinhas <span class="accent">do mundo</span>',
        intro: n=>`Explore ${n} cozinhas do mundo com receitas autênticas, instruções e nutrição.` },
  ru: { title:'Кухни мира – Рецепты по странам | Meal-Planner.ro', pill:'Все кухни',
        desc: n=>`Откройте для себя ${n} мировых кухонь с подлинными рецептами и бесплатным планировщиком меню.`,
        h1:'<span class="accent">Кухни</span> мира',
        intro: n=>`Откройте для себя ${n} мировых кухонь с подлинными рецептами, пошаговыми инструкциями и информацией о пищевой ценности.` },
  ar: { title:'مطابخ العالم – وصفات حسب الدولة | Meal-Planner.ro', pill:'كل المطابخ',
        desc: n=>`اكتشف ${n} مطبخًا عالميًا بوصفات أصيلة ومخطط وجبات مجاني.`,
        h1:'<span class="accent">مطابخ</span> العالم',
        intro: n=>`اكتشف ${n} مطبخًا عالميًا، كل منها بوصفات أصيلة وتعليمات تفصيلية ومعلومات غذائية.` },
  zh: { title:'世界各国菜系 – 按国家浏览菜谱 | Meal-Planner.ro', pill:'全部菜系',
        desc: n=>`探索${n}个世界菜系，正宗菜谱、食材、做法和免费每周饮食计划。`,
        h1:'<span class="accent">世界</span>菜系',
        intro: n=>`探索${n}个世界菜系，每个都有正宗菜谱、分步做法和营养信息。` },
  ja: { title:'世界の料理 – 国別レシピ集 | Meal-Planner.ro', pill:'すべての料理',
        desc: n=>`${n}か国の世界料理を本格的なレシピと無料の週間プランナーで紹介。`,
        h1:'<span class="accent">世界の</span>料理',
        intro: n=>`${n}か国の世界料理。本格的なレシピ、手順、栄養情報をご紹介します。` },
  hi: { title:'दुनिया के व्यंजन – देश के अनुसार रेसिपी | Meal-Planner.ro', pill:'सभी व्यंजन',
        desc: n=>`${n} वैश्विक व्यंजन, पारंपरिक रेसिपी और मुफ्त साप्ताहिक मील प्लानर के साथ।`,
        h1:'<span class="accent">दुनिया के</span> व्यंजन',
        intro: n=>`${n} वैश्विक व्यंजनों का अन्वेषण करें, हर एक प्रामाणिक रेसिपी, निर्देश और पोषण जानकारी के साथ।` },
  tr: { title:'Dünya mutfakları – Ülkelere göre tarifler | Meal-Planner.ro', pill:'Tüm mutfaklar',
        desc: n=>`${n} dünya mutfağını keşfedin: otantik tarifler, malzemeler, talimatlar ve ücretsiz öğün planlayıcı.`,
        h1:'<span class="accent">Dünya</span> mutfakları',
        intro: n=>`${n} dünya mutfağını keşfedin — otantik tarifler, adım adım talimatlar ve besin değerleri.` },
  it: { title:'Cucine del mondo – Ricette per paese | Meal-Planner.ro', pill:'Tutte le cucine',
        desc: n=>`Esplora ${n} cucine del mondo con ricette autentiche, ingredienti, istruzioni e pianificatore gratuito.`,
        h1:'Cucine <span class="accent">del mondo</span>',
        intro: n=>`Esplora ${n} cucine del mondo con ricette autentiche, istruzioni passo dopo passo e valori nutrizionali.` },
  ko: { title:'세계 요리 – 국가별 레시피 | Meal-Planner.ro', pill:'모든 요리',
        desc: n=>`${n}개국 세계 요리를 정통 레시피와 무료 주간 식단 플래너로 만나보세요.`,
        h1:'<span class="accent">세계</span> 요리',
        intro: n=>`${n}개국의 세계 요리를 탐색하세요. 정통 레시피, 단계별 지침, 영양 정보를 제공합니다.` },
};

// Eligible cuisines: origins with at least CUISINE_MIN_RECIPES recipes.
// Computed once and reused by hub-page generation, hub-index generation
// and the sitemap.
function buildCuisineHubs() {
  const byOrigin = {};
  recipes.forEach(r => {
    const enKey = r.origin?.en || r.origin?.ro;
    if (!enKey) return;
    (byOrigin[enKey] = byOrigin[enKey] || []).push(r);
  });
  return Object.entries(byOrigin)
    .filter(([, recs]) => recs.length >= CUISINE_MIN_RECIPES)
    .sort((a, b) => b[1].length - a[1].length);
}

// Per-locale hreflang set for a given country/cuisine page. Phase 5: pages
// live at /<lc>/<recipe-prefix>/<country-slug>/ (collapsed under the recipe
// hub — no separate /<cuisine-prefix>/ branch). Slug is locale-stable.
function cuisineHubHreflangs(originSlug) {
  const lines = Object.entries(RECIPE_LANG).map(([c, rl]) =>
    `  <link rel="alternate" hreflang="${c}" href="https://meal-planner.ro${rl.dir}/${originSlug}/" />`
  );
  // x-default points to English variant for international fall-through.
  lines.unshift(`  <link rel="alternate" hreflang="x-default" href="https://meal-planner.ro${RECIPE_LANG.en.dir}/${originSlug}/" />`);
  return lines.join('\n');
}

function cuisineHubPage(originEnKey, recs, lc_code) {
  const lc      = LANG_CONFIGS[lc_code];
  const hub     = CUISINE_HUB_LANG[lc_code];
  const rl      = RECIPE_LANG[lc_code];
  const display = recs[0].origin?.[lc_code] || originEnKey;
  const flag    = COUNTRY_FLAG[originEnKey] || '🌍';
  const originSlug = slug(originEnKey);
  // Phase 5: country pages live under the recipe-index dir
  // (/<lc>/<recipe-prefix>/<country-slug>/), not under a separate
  // /<cuisine-prefix>/ branch. Old URLs redirect via vercel.json.
  const canonical  = `${rl.dir}/${originSlug}/`;
  const atmosphere = cuisineAtmosphere(originEnKey);

  // Build tile data once. Used by the hero (featured image), the tile grid,
  // and the schema.org ItemList. Defensive MAX_HUB_TILES cap: no-op for
  // current data (max cuisine = 7 recipes); guards future growth past 8
  // until pagination lands.
  const tiles = recs.map(r => cuisineTileData(r, lc_code, rl.dir)).slice(0, MAX_HUB_TILES);
  // Featured recipe: pick the most-stable-image tile (local > Wikipedia >
  // Spoonacular > placeholder), original recipes.js order as tie-breaker.
  // Falling back to "first non-placeholder" used to showcase Spoonacular
  // hot-links (e.g. Greece featured = Souvlaki Spoonacular) even when the
  // cuisine had Wikipedia images that would actually load.
  const featured =
    [...tiles]
      .map((t, i) => ({ t, i, s: imgStability(t.img) }))
      .sort((a, b) => b.s - a.s || a.i - b.i)[0]?.t
    || tiles[0];

  const items = tiles.map((t, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "url": `https://meal-planner.ro${t.href}`,
    "name": t.name,
  }));
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": hub.title(display).split(' | ')[0],
    "description": hub.desc(display, recs.length),
    "url": `https://meal-planner.ro${canonical}`,
    "inLanguage": lc_code,
    "isPartOf": { "@type": "WebSite", "name": "Meal-Planner.ro", "url": "https://meal-planner.ro/" },
    "hasPart": { "@type": "ItemList", "numberOfItems": items.length, "itemListElement": items }
  });

  // Recipe tile grid. Each tile carries an image (lazy-loaded), localized
  // descriptor, ready-in time, up to 2 tags. The first tile is rendered as
  // the "featured" tile (bigger image) when there are enough recipes to
  // benefit from the spotlight treatment (≥3) — otherwise tiles are uniform.
  //
  // Image fallback: every tile renders a country-flag emoji UNDER the <img>.
  // If the image is missing (placeholder cover2.jpg) or 404s at runtime
  // (onerror), the <img> hides and the branded flag fallback shows through
  // — no broken-image icons, ever.
  //
  // Duplicate-image mitigation: if the same image URL appears multiple times
  // (e.g. shakshuka and chakchouka share an upstream Wikipedia photo), the
  // 2nd/3rd occurrences get data-img-rot="1|2" which applies a subtle
  // filter (brightness/saturation tweak) so the page doesn't feel repetitive.
  // Uniform card layout across every cuisine hub. Every tile is the same
  // shape: image on top with a fixed 4:3 aspect ratio, then title, then —
  // ONLY when recipes-meta.js carries an authored desc for that recipe —
  // a short description, then a meta row (time + tags). Cards size to
  // their natural content; the grid uses align-items: start (see CSS) so
  // a card without an authored description simply ends one paragraph
  // earlier instead of growing a block of empty whitespace to match its
  // neighbours. We never fabricate text from ingredients/tags/metadata —
  // the description either exists in recipes-meta.js for that locale
  // (with EN fall-through) or it doesn't render at all.
  const seenImgs = new Map(); // url → occurrence count
  const isPlaceholderImg = (url) => /cover2\.jpg$/.test(url);
  const tilesHtml = tiles.map((t) => {
    const tagsHtml = t.tags.length
      ? `<div class="cuisine-tile-tags">${t.tags.map(tag => `<span class="cuisine-tile-tag">${esc(tag)}</span>`).join('')}</div>`
      : '';
    const metaHtml = t.readyIn || t.tags.length
      ? `<div class="cuisine-tile-meta">${t.readyIn ? `<span class="cuisine-tile-time">⏱ ${esc(t.readyIn)}</span>` : ''}${tagsHtml}</div>`
      : '';
    const descHtml = t.desc ? `<p class="cuisine-tile-desc">${esc(t.desc)}</p>` : '';
    const isPlaceholder = isPlaceholderImg(t.img);
    const occ = (seenImgs.get(t.img) || 0);
    seenImgs.set(t.img, occ + 1);
    const rotAttr = occ > 0 && !isPlaceholder ? ` data-img-rot="${Math.min(occ, 2)}"` : '';
    // No srcset on tiles. Tiles render at ~240–320 CSS px; the base 330px
    // Wikipedia thumb (same URL the detail-page hero uses as its `src` and
    // og:image) is the most reliable variant. Using just `src` guarantees
    // the tile loads the exact URL the detail page is known to serve.
    const imgHtml = isPlaceholder
      ? '' // skip the placeholder URL entirely so the flag fallback shows
      : `<img src="${t.img}" alt="" loading="lazy" decoding="async"${imgFallbackAttrs(t.img)}/>`;
    return `<li>
      <a class="cuisine-tile" href="${t.href}">
        <span class="cuisine-tile-img"${rotAttr}>
          <span class="cuisine-tile-img-fallback" aria-hidden="true">${flag}</span>
          ${imgHtml}
        </span>
        <span class="cuisine-tile-body">
          <h3 class="cuisine-tile-title">${esc(t.name)}</h3>
          ${descHtml}
          ${metaHtml}
        </span>
      </a>
    </li>`;
  }).join('');

  const dir_attr = rl.dir_attr || 'ltr';
  // Use HEAD's default ogImage; later we can swap to cuisine-specific covers.
  // Strip HEAD's default hreflang x-default/ro/en lines (they point at locale
  // roots and don't apply to a cuisine hub) and replace with the hub-specific
  // hreflang set covering all 14 locales.
  const head = HEAD(hub.title(display), hub.desc(display, recs.length), canonical, lc_code, dir_attr)
    .replace(/\s+<link rel="alternate" hreflang="x-default" href="https:\/\/meal-planner\.ro\/"\/>/, '')
    .replace(/\s+<link rel="alternate" hreflang="ro" href="https:\/\/meal-planner\.ro\/ro\/"\/>/, '')
    .replace(/<link rel="alternate" hreflang="en" href="https:\/\/meal-planner\.ro\/en\/"\/>/,
             cuisineHubHreflangs(originSlug));

  // Editorial intro: per-cuisine hand-written opening (en + ro shipped
  // in Phase 5d). For locales without an editorial version, fall back
  // to the locale's templated intro — still localized, just generic.
  const editorial = CUISINE_INTRO[originEnKey]?.[lc_code];
  const heroIntro = editorial
    ? esc(editorial)
    : hub.intro(esc(display), recs.length);

  // Related cuisines strip (Phase 7 PR 2). Curated culinary neighbours from
  // RELATED_CUISINES, filtered to those that have an eligible hub so links
  // never 404. Capped at MAX_RELATED_CUISINES (6 today; curated lists are 3).
  // Skipped entirely if the current cuisine isn't in the map or none of its
  // neighbours pass eligibility — avoids rendering an empty section.
  const relatedKey = originEnKey.trim().toLowerCase();
  const relatedKeys = RELATED_CUISINES[relatedKey] || [];
  const relatedItems = [];
  for (const key of relatedKeys) {
    if (relatedItems.length >= MAX_RELATED_CUISINES) break;
    const hit = eligibleHubByKey.get(key);
    if (!hit || hit.enKey === originEnKey) continue;
    relatedItems.push(hit);
  }
  const relatedStripHtml = relatedItems.length === 0 ? '' : (() => {
    const heading = CUISINE_RELATED_HEADING[lc_code] || CUISINE_RELATED_HEADING.en;
    const cardsHtml = relatedItems.map(({ enKey, recs: rRecs }) => {
      const rDisplay = rRecs[0].origin?.[lc_code] || enKey;
      const rFlag    = COUNTRY_FLAG[enKey] || '🌍';
      const rSlug    = slug(enKey);
      const rAtmos   = cuisineAtmosphere(enKey);
      return `<li>
            <a class="cuisine-related-card" href="${rl.dir}/${rSlug}/" data-cuisine-atmosphere="${rAtmos}">
              <span class="cuisine-related-card-flag" aria-hidden="true">${rFlag}</span>
              <span class="cuisine-related-card-name">${esc(rDisplay)}</span>
              <span class="cuisine-related-card-count" aria-label="${rRecs.length}">${rRecs.length}</span>
            </a>
          </li>`;
    }).join('');
    return `<aside class="cuisine-related-strip" aria-labelledby="cuisine-related-heading-${esc(originSlug)}">
      <h2 class="cuisine-related-heading" id="cuisine-related-heading-${esc(originSlug)}">${esc(heading)}</h2>
      <ul class="cuisine-related-grid">${cardsHtml}</ul>
    </aside>`;
  })();

  // data-cuisine-hub / -label / -href = back-pill context restore on the
  // recipe page (see content.js). data-cuisine-atmosphere = visual identity
  // (accent gradient, soft tint) via CSS variables defined in content.css.
  return `${head}
${makeNav(lc, NAV_URL_FOR.cuisineHub(originSlug))}<main class="content-main cuisine-hub-main" data-cuisine-hub="1" data-cuisine-label="${esc(display)}" data-cuisine-href="${canonical}" data-cuisine-atmosphere="${atmosphere}">
  <section class="cuisine-hero" data-cuisine-atmosphere="${atmosphere}">
    <div class="cuisine-hero-inner">
      <nav aria-label="breadcrumb" class="breadcrumb-nav cuisine-hero-breadcrumb"><a href="/">${rl.breadHome}</a> › <a href="${rl.dir}/">${rl.breadLabel}</a> › <span>${esc(display)}</span></nav>
      <div class="cuisine-hero-content">
        <div class="cuisine-hero-text">
          <span class="cuisine-hero-flag" aria-hidden="true">${flag}</span>
          <h1>${hub.h1(esc(display))}</h1>
          <p class="cuisine-hero-desc">${heroIntro}</p>
        </div>
        ${featured ? `<figure class="cuisine-hero-image" aria-hidden="true">
          <span class="cuisine-hero-image-fallback" aria-hidden="true">${flag}</span>
          ${/cover2\.jpg$/.test(featured.img) ? '' : `<img src="${featured.img}" alt="" loading="eager" decoding="async" fetchpriority="high"${imgFallbackAttrs(featured.img)}/>`}
        </figure>` : ''}
      </div>
    </div>
  </section>
  <section class="content-section cuisine-hub-section"><div class="content-section-inner">
    <ul class="cuisine-tile-grid" aria-label="${esc(display)}">${tilesHtml}</ul>${relatedStripHtml ? '\n    ' + relatedStripHtml : ''}
    <p class="cuisine-hub-back"><a href="${rl.dir}/">← ${esc(hub.backLink)}</a></p>
  </div></section>
  <script type="application/ld+json">${jsonLd}</script>
</main>

<!-- Mobile-only floating back pill: ← All cuisines → /<lc>/<recipe-prefix>/
     (which IS the cuisine hub in Phase 5). Same component as the recipe
     page (.mp-back-pill), with the cuisine atmosphere accent strip on the
     leading edge for visual continuity. -->
<a class="mp-back-pill mp-back-pill--cuisine" href="${rl.dir}/"
   data-cuisine-atmosphere="${atmosphere}"
   aria-label="${esc(CUISINE_HUB_INDEX_LANG[lc_code]?.pill || 'All cuisines')}"
   role="button">
  <span class="rmb-arrow" aria-hidden="true">←</span>
  <span class="rmb-label">${esc(CUISINE_HUB_INDEX_LANG[lc_code]?.pill || 'All cuisines')}</span>
</a>

${makeFooter(lc)}<script src="/js/content.js" defer></script></body></html>`;
}

// Phase 5: cuisineHubIndexPage() was removed. Its responsibility (cuisine
// directory landing) now lives in recipeIndex() — /<lc>/<recipe-prefix>/
// IS the cuisine hub. The old /<lc>/<cuisine-prefix>/ URLs redirect to
// recipe-prefix via vercel.json (added below).

/* ════════════════════════════════════════════════════════════════
   HOMEPAGE CUISINE DISCOVERY — injected into each SPA home
   ════════════════════════════════════════════════════════════════
   Inserts a "Explore world cuisines" section between the hero and
   the planner UI on every public/<lc>/index.html.

   Idempotent via HTML markers — re-running the build replaces the
   block in-place instead of duplicating it. Safe to run on every
   build; safe to remove by deleting the markers.

   The section uses the same CUISINE_CTA strings as the recipe-index
   / plan-listing discovery CTA so messaging stays consistent. Cards
   are richer (flag + name + 3 dishes + count) but visually lighter
   than full hub cards — a teaser, not browsing mode.
*/
function cuisineHomeCard(originEnKey, recs, lc_code, recipeDir) {
  const display    = recs[0].origin?.[lc_code] || originEnKey;
  const flagIcon   = COUNTRY_FLAG[originEnKey] || '🌍';
  const originSlug = slug(originEnKey);
  const atmosphere = cuisineAtmosphere(originEnKey);
  const topRecs    = recs.slice(0, 3);
  const dishNames  = topRecs.map(r =>
    r.name?.[lc_code] || r.name?.en || r.name?.ro || ''
  ).filter(Boolean).join(' · ');
  // data-* hooks let app.js re-localize name/dishes/href at runtime (root /
  // auto-translates to the visitor's browser language). rep-id → origin[lang]
  // for the card name; card-ids → name[lang] for the dish line; slug → href.
  return `<a class="hp-cuisine-card" href="${recipeDir}/${originSlug}/" data-cuisine-atmosphere="${atmosphere}" data-cuisine-rep-id="${recs[0].id}" data-cuisine-slug="${originSlug}" data-card-ids="${topRecs.map(r => r.id).join('|')}">
        <span class="hp-cuisine-card-flag" aria-hidden="true">${flagIcon}</span>
        <span class="hp-cuisine-card-body">
          <span class="hp-cuisine-card-top">
            <span class="hp-cuisine-card-name">${esc(display)}</span>
            <span class="hp-cuisine-card-count">${recs.length}</span>
          </span>
          <span class="hp-cuisine-card-dishes">${esc(dishNames)}</span>
        </span>
      </a>`;
}

function cuisineHomeSectionHtml(lc_code) {
  const ctaLang   = CUISINE_CTA[lc_code] || CUISINE_CTA.en;
  // Phase 5: the cuisine hub IS the recipe index. CTA + card links point
  // at /<lc>/<recipe-prefix>/ and /<lc>/<recipe-prefix>/<country-slug>/.
  const rl        = RECIPE_LANG[lc_code];
  const recipeDir = rl ? rl.dir : `/${lc_code}/recipes`;
  const eligible  = buildCuisineHubs();
  const featured  = eligible.slice(0, 6);
  const cardsHtml = featured.map(([enKey, recs]) =>
    cuisineHomeCard(enKey, recs, lc_code, recipeDir)
  ).join('\n      ');
  return `<section class="hp-cuisine-discover" aria-labelledby="hp-cuisine-heading" data-hp-cuisine-section="1" data-cuisine-count="${eligible.length}">
    <div class="hp-cuisine-inner">
      <div class="hp-cuisine-head">
        <span class="hp-cuisine-eyebrow">${esc(ctaLang.eyebrow)}</span>
        <h2 id="hp-cuisine-heading" class="hp-cuisine-title">${esc(ctaLang.heading)}</h2>
        <p class="hp-cuisine-sub">${esc(ctaLang.sub(eligible.length))}</p>
      </div>
      <div class="hp-cuisine-grid">
      ${cardsHtml}
      </div>
      <p class="hp-cuisine-cta">
        <a class="hp-cuisine-cta-btn" href="${recipeDir}/">${esc(ctaLang.btn(eligible.length))}</a>
      </p>
    </div>
  </section>`;
}

// HTML markers for idempotent injection. Re-running the build replaces
// content between START/END with fresh markup. Removing the markers
// removes the injection entirely.
const HP_CUISINE_CSS_START = '<!-- HP_CUISINE_CSS:START -->';
const HP_CUISINE_CSS_END   = '<!-- HP_CUISINE_CSS:END -->';
const HP_CUISINE_SEC_START = '<!-- HP_CUISINE_DISCOVER:START -->';
const HP_CUISINE_SEC_END   = '<!-- HP_CUISINE_DISCOVER:END -->';
const HP_CUISINE_CSS_LINK  = '<link rel="stylesheet" href="/css/cuisine-homepage.css">';

// Homepage v2 premium head: warm theme-color, editorial display font
// (Fraunces) and the premium-polish.css visual layer. Injected ONLY into the
// 15 SPA homepages (root + 14 locales) so the polish stays scoped to the home
// experience and never leaks onto recipe/plan/hub pages. Idempotent via the
// HP_PREMIUM_HEAD markers, mirroring the cuisine-discovery injection.
const HP_PREMIUM_HEAD_START = '<!-- HP_PREMIUM_HEAD:START -->';
const HP_PREMIUM_HEAD_END   = '<!-- HP_PREMIUM_HEAD:END -->';
const HP_PREMIUM_HEAD_BLOCK = [
  '<meta name="theme-color" content="#1d1812" media="(prefers-color-scheme: light)">',
  '  <meta name="theme-color" content="#1d1812" media="(prefers-color-scheme: dark)">',
  '  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&display=swap" rel="stylesheet">',
  '  <link rel="stylesheet" href="/css/premium-polish.css">'
].join('\n');

function upsertBetween(haystack, startMark, endMark, newBlock, fallbackInsertAfter) {
  // If markers exist anywhere → replace content between them. Preserve
  // the 2-space indentation from the initial insertion so re-runs of the
  // build don't produce whitespace-only diffs (otherwise the homepage
  // injection thrashes 14 files on every build).
  const startIdx = haystack.indexOf(startMark);
  const endIdx   = haystack.indexOf(endMark);
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    return haystack.slice(0, startIdx)
      + startMark + '\n  ' + newBlock + '\n  ' + endMark
      + haystack.slice(endIdx + endMark.length);
  }
  // Else insert AFTER the first occurrence of the fallback anchor.
  const anchorIdx = haystack.indexOf(fallbackInsertAfter);
  if (anchorIdx === -1) return haystack; // anchor missing — bail safely
  const insertAt = anchorIdx + fallbackInsertAfter.length;
  return haystack.slice(0, insertAt)
    + '\n  ' + startMark + '\n  ' + newBlock + '\n  ' + endMark
    + haystack.slice(insertAt);
}

function injectCuisineHomeSection(lc_code, customPath) {
  // Default file path: public/<lc>/index.html. Pass customPath to override —
  // used for the root public/index.html which serves meal-planner.ro/ and
  // is RO-localized but lives outside the /<lc>/ tree.
  const filePath = customPath || path.join(PUBLIC, lc_code, 'index.html');
  if (!fs.existsSync(filePath)) return false;
  let html = fs.readFileSync(filePath, 'utf8');
  const original = html;

  // 1) Ensure the cuisine-homepage.css <link> is in <head>. Inject after
  //    the existing style.min.css link so it overrides nothing important.
  const cssAnchor = '<link rel="stylesheet" href="/css/style.min.css">';
  html = upsertBetween(html, HP_CUISINE_CSS_START, HP_CUISINE_CSS_END,
                       HP_CUISINE_CSS_LINK, cssAnchor);

  // 2) Inject/replace the discovery section right BEFORE <main class="app-main">.
  //    upsertBetween inserts AFTER its anchor, so we anchor on the comment
  //    that immediately precedes <main> in the existing markup.
  const secAnchor = '<!-- ══════════ MAIN APP ══════════ -->';
  const sectionHtml = cuisineHomeSectionHtml(lc_code);
  html = upsertBetween(html, HP_CUISINE_SEC_START, HP_CUISINE_SEC_END,
                       sectionHtml, secAnchor);

  // Some SPA homepages may not have the exact anchor comment (older
  // locales). Fallback to inserting before <main class="app-main">.
  if (!html.includes(HP_CUISINE_SEC_START)) {
    const mainIdx = html.indexOf('<main class="app-main"');
    if (mainIdx !== -1) {
      html = html.slice(0, mainIdx)
        + HP_CUISINE_SEC_START + '\n  ' + sectionHtml + '\n  ' + HP_CUISINE_SEC_END + '\n\n  '
        + html.slice(mainIdx);
    }
  }

  if (html !== original) {
    fs.writeFileSync(filePath, html, 'utf8');
    return true;
  }
  return false;
}

// Inject the premium head (theme-color + Fraunces + premium-polish.css) into a
// single SPA homepage file. Runs for ALL 14 locales + root so the visual layer
// is applied uniformly. premium-polish.css must load LAST so it overrides the
// shared .hp-cuisine-* selectors in cuisine-homepage.css: anchor right after
// the cuisine-CSS block when present, else after the style.min.css link
// (older locales ship the self-closing XHTML form). Idempotent via markers.
function injectPremiumHead(filePath) {
  if (!fs.existsSync(filePath)) return false;
  let html = fs.readFileSync(filePath, 'utf8');
  const original = html;
  const cssAnchorSelfClose = '<link rel="stylesheet" href="/css/style.min.css" />';
  const cssAnchorVoid      = '<link rel="stylesheet" href="/css/style.min.css">';
  let cssAnchor;
  if (html.includes(HP_CUISINE_CSS_END))      cssAnchor = HP_CUISINE_CSS_END;
  else if (html.includes(cssAnchorSelfClose)) cssAnchor = cssAnchorSelfClose;
  else                                        cssAnchor = cssAnchorVoid;
  html = upsertBetween(html, HP_PREMIUM_HEAD_START, HP_PREMIUM_HEAD_END,
                       HP_PREMIUM_HEAD_BLOCK, cssAnchor);
  if (html !== original) {
    fs.writeFileSync(filePath, html, 'utf8');
    return true;
  }
  return false;
}

/* ════════════════════════════════════════════════════════════════
   WRITE ALL FILES
   ════════════════════════════════════════════════════════════════ */
console.log('Generating content pages…\n');
let count = 0;

// ── Weekly plan pages: ALL 14 languages ──────────────────────────
for (const [code, lc] of Object.entries(LANG_CONFIGS)) {
  const dirPath = path.join(PUBLIC, ...lc.dir.split('/').filter(Boolean));
  write(path.join(dirPath, 'index.html'), indexPage(lc));
  console.log(`✅ ${lc.dir}/`);
  PLANS.forEach(p => {
    const planId = lc.planIdFn(p);
    write(path.join(dirPath, planId, 'index.html'), planPage(p, lc));
    count++;
  });
  console.log(`   ✅ ${PLANS.length} plan pages → ${lc.dir}/`);
}

// ── Recipe pages: ALL 14 languages ───────────────────────────────
for (const [code, rl] of Object.entries(RECIPE_LANG)) {
  const dirParts = rl.dir.split('/').filter(Boolean); // e.g. ['ro','retete']
  write(path.join(PUBLIC, ...dirParts, 'index.html'), recipeIndex(rl));
  recipes.forEach(r => {
    const enName = r.name?.en || r.name?.ro;
    if (!enName) return;
    const rslug = slug(enName);
    write(path.join(PUBLIC, ...dirParts, rslug, 'index.html'), recipePage(r, rl));
    count++;
  });
  console.log(`✅ ${recipes.length} recipe pages → ${rl.dir}/`);
}

// Pricing pages — one per language
for (const [lc_code] of Object.entries(LANG_CONFIGS)) {
  const sl = PRICING_SLUGS[lc_code];
  write(path.join(PUBLIC, lc_code, sl, 'index.html'), pricingPage(lc_code));
  count++;
}
console.log(`✅ 14 pricing pages generated → /{lang}/{slug}/`);

// ── Country pages: ≥2 recipes per origin × 14 languages ─────────
// Phase 5: country pages live UNDER the recipe-index dir at
// /<lc>/<recipe-prefix>/<country-slug>/. The recipe-index itself IS the
// cuisine hub (see recipeIndex()) — no separate /<cuisine-prefix>/ layer.
// Origin slug stays English (locale-stable). Old URLs redirect via
// vercel.json (added below).
const eligibleCuisines = buildCuisineHubs();
// Lowercase-key lookup used by the "related cuisines" strip in cuisineHubPage.
// Keys are `recipe.origin.en.trim().toLowerCase()`; values give the original
// PascalCase key + recipe array so we can build URLs and counts without
// re-running buildCuisineHubs() per page.
const eligibleHubByKey = new Map(eligibleCuisines.map(([enKey, recs]) =>
  [enKey.trim().toLowerCase(), { enKey, recs }]
));
for (const [lc_code, rl] of Object.entries(RECIPE_LANG)) {
  const dirParts = rl.dir.split('/').filter(Boolean);
  for (const [enKey, recs] of eligibleCuisines) {
    const originSlug = slug(enKey);
    write(path.join(PUBLIC, ...dirParts, originSlug, 'index.html'),
          cuisineHubPage(enKey, recs, lc_code));
    count++;
  }
}
console.log(`✅ ${eligibleCuisines.length} country pages × 14 locales = ${eligibleCuisines.length * 14} country pages (under /<lc>/<recipe-prefix>/)`);

// ── Homepage cuisine discovery section: injected into all 14 SPA homes ──
// Idempotent via HTML markers — re-running this build replaces the block
// in place. Updates BOTH the <head> CSS link and the <body> section.
let hpInjected = 0;
for (const lc_code of Object.keys(CUISINE_HUB_LANG)) {
  if (injectCuisineHomeSection(lc_code)) hpInjected++;
}
// Root public/index.html — separate file that serves meal-planner.ro/.
// It's <html lang="ro"> so we inject the RO cuisine teaser. Same anchor
// (<!-- ══════════ MAIN APP ══════════ -->) exists in this file too.
let rootInjected = false;
if (injectCuisineHomeSection('ro', path.join(PUBLIC, 'index.html'))) {
  rootInjected = true;
}
console.log(`✅ ${hpInjected}/14 SPA homepages updated with cuisine discovery section`);
console.log(`✅ Root /index.html cuisine teaser: ${rootInjected ? 'injected (RO content)' : 'no change'}`);

// ── Homepage v2 premium head: injected into ALL 14 SPA homes + root ──
// Runs AFTER the cuisine-discovery injection so premium-polish.css anchors
// just after the cuisine-CSS block and loads LAST in <head>. Scoped to the
// homepages only — recipe/plan/hub pages are untouched.
let premiumHeadInjected = 0;
for (const lc_code of Object.keys(LANG_CONFIGS)) {
  if (injectPremiumHead(path.join(PUBLIC, lc_code, 'index.html'))) premiumHeadInjected++;
}
if (injectPremiumHead(path.join(PUBLIC, 'index.html'))) premiumHeadInjected++;
console.log(`✅ ${premiumHeadInjected}/15 SPA homepages got the premium head (theme-color + Fraunces + premium-polish.css)`);

// Image-resolution summary. Not a build error — degraded UX, but pages still
// render. Some of these are rescued at runtime by content.js's parallel IMG
// map (visible to users) — but the SSR <img>, the og:image meta tag, and
// search-engine crawlers all see cover2.jpg here. Run `audit-images.mjs`
// for the human-visible vs SEO-visible split.
if (imageWarnings.fallback.length) {
  console.log(`\n⚠️  ${imageWarnings.fallback.length} recipes SSR-render cover2.jpg (no local override + no recipe-images.js mapping).`);
  console.log(`   Some are visually patched by content.js at runtime; og:image still = cover2.jpg.`);
  console.log(`   Run \`node scripts/audit-images.mjs\` for the per-recipe priority breakdown.`);
}

console.log(`\n🎉 Done! Generated ${count} pages total.`);

/* ════════════════════════════════════════════════════════════════
   SITEMAP — all URLs
   ════════════════════════════════════════════════════════════════ */
const sitemapUrls = [
  'https://meal-planner.ro/',
  ...Object.keys(LANG_CONFIGS).map(c => `https://meal-planner.ro/${c}/`),
];

// Weekly plan pages for all 14 languages
for (const [code, lc] of Object.entries(LANG_CONFIGS)) {
  sitemapUrls.push(`https://meal-planner.ro${lc.dir}/`);
  PLANS.forEach(p => sitemapUrls.push(`https://meal-planner.ro${lc.dir}/${lc.planIdFn(p)}/`));
}

// Pricing pages — /pricing/ (English default) + 14 localised
sitemapUrls.push('https://meal-planner.ro/pricing/');
for (const [lc_code, sl] of Object.entries(PRICING_SLUGS)) {
  sitemapUrls.push(`https://meal-planner.ro/${lc_code}/${sl}/`);
}

// Recipe pages ALL 14 languages
for (const rl of Object.values(RECIPE_LANG)) {
  sitemapUrls.push(`https://meal-planner.ro${rl.dir}/`);
  recipes.forEach(r => {
    const enName = r.name?.en || r.name?.ro;
    if (enName) sitemapUrls.push(`https://meal-planner.ro${rl.dir}/${slug(enName)}/`);
  });
}

// Country pages — Phase 5: live under /<lc>/<recipe-prefix>/<country>/.
// No separate /<cuisine-prefix>/ index URL anymore (recipe-prefix root
// IS the cuisine hub, already added above with the recipe-index loop).
for (const [, rl] of Object.entries(RECIPE_LANG)) {
  for (const [enKey] of eligibleCuisines) {
    sitemapUrls.push(`https://meal-planner.ro${rl.dir}/${slug(enKey)}/`);
  }
}

const today = new Date().toISOString().slice(0,10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(u => `  <url>
    <loc>${u}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.includes('/retete/')||u.includes('/recipes/')?'monthly':u.endsWith('/meniu-saptamanal/')||u.endsWith('/weekly-meal-plan/')||u.includes('/plan-')||u.includes('/wochenplan')||u.includes('/piano-')||u.includes('/nedelnoe')||u.includes('/haftalik')||u.includes('/jugan')||u.includes('/weekly-menu')||u.includes('/zhouji')||u.includes('/khitat')||u.includes('/plano-')||u.includes('/weekly-plan')?'monthly':'weekly'}</changefreq>
    <priority>${u==='https://meal-planner.ro/'?'1.0':u.match(/meal-planner\.ro\/(ro|en)\/$/)?'0.9':'0.7'}</priority>
  </url>`).join('\n')}
</urlset>`;

write(path.join(PUBLIC, 'sitemap.xml'), sitemap);
console.log(`\n✅ sitemap.xml — ${sitemapUrls.length} URLs`);
