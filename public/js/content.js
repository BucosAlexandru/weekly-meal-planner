/* content.js – Recipe food photos. Static map (no API calls at runtime).
   66 recipes: real photos (Spoonacular + Wikipedia)
   109 recipes: cuisine-aware Unsplash fallback by country
*/
(function () {
  'use strict';

  const h1 = document.querySelector('h1');
  if (!h1) return;
  const recipeName = h1.textContent.trim();
  if (!recipeName) return;
  const heroInner = document.querySelector('.content-hero-inner');
  if (!heroInner) return;

  // ── Static image map (pre-fetched at build time) ──────────────
  const IMG = {
  "adobo": "https://img.spoonacular.com/recipes/638741-312x231.jpg",
  "amok": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Fish_Amok_with_Rice.jpg/960px-Fish_Amok_with_Rice.jpg",
  "arepa": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Arepitas_Food_Macro.jpg/330px-Arepitas_Food_Macro.jpg",
  "bacalhau \u00e0 br\u00e1s": "https://img.spoonacular.com/recipes/633251-312x231.jpg",
  "baklava": "https://img.spoonacular.com/recipes/631783-312x231.jpg",
  "bibimbap": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Dolsot-bibimbap.jpg/330px-Dolsot-bibimbap.jpg",
  "biryani": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/%22Hyderabadi_Dum_Biryani%22.jpg/330px-%22Hyderabadi_Dum_Biryani%22.jpg",
  "borscht": "https://img.spoonacular.com/recipes/664396-312x231.jpg",
  "chakhokhbili": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/%D0%A7%D0%B0%D1%85%D0%BE%D1%85%D0%B1%D0%B8%D0%BB%D0%B8.JPG/330px-%D0%A7%D0%B0%D1%85%D0%BE%D1%85%D0%B1%D0%B8%D0%BB%D0%B8.JPG",
  "cheeseburger": "https://img.spoonacular.com/recipes/635350-312x231.jpg",
  "chicken curry": "https://img.spoonacular.com/recipes/637391-312x231.jpg",
  "chili con carne": "https://img.spoonacular.com/recipes/1697611-312x231.jpg",
  "dhal": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/3_types_of_lentil.png/330px-3_types_of_lentil.png",
  "empanadas": "https://img.spoonacular.com/recipes/653362-312x231.jpg",
  "encebollado": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Semifinal_del_Campeonato_del_Encebollado_en_Esmeraldas_2015_%2818062294436%29.jpg/960px-Semifinal_del_Campeonato_del_Encebollado_en_Esmeraldas_2015_%2818062294436%29.jpg",
  "feijoada": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Feijoada_%C3%A0_transmontada.jpg/330px-Feijoada_%C3%A0_transmontada.jpg",
  "fish and chips": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Fish_and_chips_blackpool.jpg/330px-Fish_and_chips_blackpool.jpg",
  "fondue": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Fondue_dish.jpg/330px-Fondue_dish.jpg",
  "french onion soup": "https://img.spoonacular.com/recipes/643362-312x231.jpg",
  "gazpacho": "https://img.spoonacular.com/recipes/662542-312x231.jpg",
  "ghormeh sabzi": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Ghormeh_Sabzi.JPG/330px-Ghormeh_Sabzi.JPG",
  "goulash": "https://img.spoonacular.com/recipes/644476-312x231.jpg",
  "guacamole": "https://img.spoonacular.com/recipes/715543-312x231.jpg",
  "harira": "https://upload.wikimedia.org/wikipedia/commons/c/ce/Harira.png",
  "hummus": "https://img.spoonacular.com/recipes/716195-312x231.jpg",
  "jerk chicken": "https://img.spoonacular.com/recipes/637102-312x231.jpg",
  "karelian pie": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Karjalanpiirakka-20060227.jpg/330px-Karjalanpiirakka-20060227.jpg",
  "kibbeh": "https://img.spoonacular.com/recipes/649403-312x231.jpg",
  "kimchi": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Various_kimchi.jpg/330px-Various_kimchi.jpg",
  "koshari": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Egyptian_food_Koshary.jpg/330px-Egyptian_food_Koshary.jpg",
  "kung pao chicken": "https://img.spoonacular.com/recipes/649129-312x231.jpg",
  "lobio": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Lobio_with_summer_savory_and_ajika.jpg/960px-Lobio_with_summer_savory_and_ajika.jpg",
  "lomo saltado": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Lomo_Saltado_-_Lima%2C_Peru_Miraflores_%28Tiendecita_Blanca%29.jpg/330px-Lomo_Saltado_-_Lima%2C_Peru_Miraflores_%28Tiendecita_Blanca%29.jpg",
  "masgouf": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Masgouf.jpg/330px-Masgouf.jpg",
  "milanesa": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Milanesa_con_fritas.png/330px-Milanesa_con_fritas.png",
  "momo": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Momo_nepal.jpg/960px-Momo_nepal.jpg",
  "moussaka": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/MussakasMeMelitsanesKePatates01.JPG/330px-MussakasMeMelitsanesKePatates01.JPG",
  "nasi goreng": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Nasi_Goreng_Kampung_%2811967588375%29.jpg/330px-Nasi_Goreng_Kampung_%2811967588375%29.jpg",
  "okonomiyaki": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Okonomiyaki_001.jpg/330px-Okonomiyaki_001.jpg",
  "pad thai": "https://img.spoonacular.com/recipes/663113-312x231.jpg",
  "paella": "https://img.spoonacular.com/recipes/652134-312x231.jpg",
  "pancakes": "https://img.spoonacular.com/recipes/661886-312x231.jpg",
  "pavlova": "https://img.spoonacular.com/recipes/655031-312x231.jpg",
  "pho": "https://img.spoonacular.com/recipes/1096250-312x231.jpg",
  "pierogi": "https://img.spoonacular.com/recipes/656049-312x231.jpg",
  "poutine": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Food_at_WIkimanian_2017_02.jpg/330px-Food_at_WIkimanian_2017_02.jpg",
  "quiche lorraine": "https://img.spoonacular.com/recipes/639590-312x231.jpg",
  "ramen": "https://img.spoonacular.com/recipes/1697543-312x231.jpg",
  "ratatouille": "https://img.spoonacular.com/recipes/633754-312x231.jpg",
  "risotto": "https://img.spoonacular.com/recipes/659109-312x231.jpg",
  "salmon soup": "https://img.spoonacular.com/recipes/659056-312x231.jpg",
  "schnitzel": "https://img.spoonacular.com/recipes/656819-312x231.jpg",
  "shakshuka": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Shakshuka_by_Calliopejen1.jpg/330px-Shakshuka_by_Calliopejen1.jpg",
  "souvlaki": "https://img.spoonacular.com/recipes/651076-312x231.jpg",
  "spaghetti carbonara": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Espaguetis_carbonara.jpg/330px-Espaguetis_carbonara.jpg",
  "sushi": "https://img.spoonacular.com/recipes/648506-312x231.jpg",
  "swedish meatballs": "https://img.spoonacular.com/recipes/648565-312x231.jpg",
  "sweet and sour chicken": "https://img.spoonacular.com/recipes/662422-312x231.jpg",
  "tabbouleh": "https://img.spoonacular.com/recipes/642121-312x231.jpg",
  "tacos": "https://img.spoonacular.com/recipes/645711-312x231.jpg",
  "tagine": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Tajine-marocain-un-plat-varie-et-sain_%28cropped%29.jpg/330px-Tajine-marocain-un-plat-varie-et-sain_%28cropped%29.jpg",
  "tamale": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tamale_Oaxaque%C3%B1o.jpg/330px-Tamale_Oaxaque%C3%B1o.jpg",
  "tom yum": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Tom_yam_kung_maenam.jpg/330px-Tom_yam_kung_maenam.jpg",
  "tripe soup": "https://img.spoonacular.com/recipes/654283-312x231.jpg",
  "tteokbokki": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Tteokbokki.JPG/330px-Tteokbokki.JPG",
  "tzatziki": "https://img.spoonacular.com/recipes/645646-312x231.jpg",
};

  // ── Cuisine-aware fallback ────────────────────────────────────
  const REGION_PHOTOS = {
    mexican:      ['photo-1565299585323-38d6b0865b47','photo-1624300629298-e9ff39444396','photo-1625937286074-9b23a7dac8e3'],
    latin:        ['photo-1603599130916-5b2d42b9f8a1','photo-1512058564366-18510be2db19','photo-1553163147-622ab57be1c7'],
    asian:        ['photo-1559847844-5315695dadae','photo-1563379091339-03b21ab4a4f8','photo-1574484284002-952d92456975'],
    indian:       ['photo-1455619452474-d2be8b1e70cd','photo-1603360946369-dc9bb6258143','photo-1585937421612-70a008356fbe'],
    japanese:     ['photo-1569050467447-ce54b3bbc37d','photo-1617196034183-421b4040ed20','photo-1617196034099-9af820c6e9d6'],
    chinese:      ['photo-1563245372-f21724e3856d','photo-1585032226651-759b368d7246','photo-1546069901-ba9599a7e63c'],
    middleeast:   ['photo-1600803907087-f56d462fd26b','photo-1504674900247-0877df9cc836','photo-1543158181-e6f9f6712055'],
    mediterranean:['photo-1571091718767-18b5b1457add','photo-1540189549336-e6e99c3679fe','photo-1484723091739-30a097e8f929'],
    european:     ['photo-1547592180-85f173990554','photo-1565299624946-b28f40a0ae38','photo-1476224203421-9ac39bcb3327'],
    african:      ['photo-1534482421-64566f976cfa','photo-1512621776951-a57141f2eefd','photo-1555939594-58d7cb561ad1'],
    american:     ['photo-1551782450-a2132b4ba21d','photo-1568901346375-23c9450c58cd','photo-1482049016688-2d3e1b311543'],
    default:      ['photo-1540189549336-e6e99c3679fe','photo-1504674900247-0877df9cc836','photo-1512621776951-a57141f2eefd'],
  };
  const CUISINE_MAP = {
    'Mexico':'mexican','Colombia':'latin','Peru':'latin','Argentina':'latin',
    'Brazil':'latin','Chile':'latin','Venezuela':'latin','Cuba':'latin',
    'Bolivia':'latin','Paraguay':'latin','Uruguay':'latin','Haiti':'latin',
    'Costa Rica':'latin','Honduras':'latin','Panama':'latin','Nicaragua':'latin',
    'Trinidad':'latin','Guyana':'latin','Barbados':'latin','Jamaica':'latin',
    'Vietnam':'asian','Thailand':'asian','Philippines':'asian','Indonesia':'asian',
    'Malaysia':'asian','Singapore':'asian','Myanmar':'asian','Laos':'asian',
    'Cambodia':'asian','Mongolia':'asian','Korea':'asian','South Korea':'asian',
    'Taiwan':'asian','Sri Lanka':'asian','Bangladesh':'asian','Nepal':'asian',
    'Bhutan':'asian','Fiji':'asian','Samoa':'asian','Papua New Guinea':'asian',
    'Japan':'japanese','China':'chinese',
    'India':'indian','Pakistan':'indian',
    'Turkey':'middleeast','Lebanon':'middleeast','Jordan':'middleeast',
    'Saudi Arabia':'middleeast','UAE':'middleeast','Iran':'middleeast',
    'Iraq':'middleeast','Syria':'middleeast','Yemen':'middleeast',
    'Morocco':'middleeast','Egypt':'middleeast','Libya':'middleeast',
    'Tunisia':'middleeast','Afghanistan':'middleeast','Kazakhstan':'middleeast',
    'Azerbaijan':'middleeast','Tajikistan':'middleeast',
    'Greece':'mediterranean','Cyprus':'mediterranean','Malta':'mediterranean','Israel':'mediterranean',
    'Italy':'european','France':'european','Spain':'european','Germany':'european',
    'Portugal':'european','Romania':'european','Poland':'european','Russia':'european',
    'Ukraine':'european','Hungary':'european','Austria':'european','Belgium':'european',
    'Netherlands':'european','Sweden':'european','Norway':'european','Finland':'european',
    'Denmark':'european','Ireland':'european','Bulgaria':'european','Serbia':'european',
    'Croatia':'european','North Macedonia':'european','Albania':'european',
    'Kosovo':'european','Slovakia':'european','Belarus':'european',
    'Luxembourg':'european','Iceland':'european','Czech Republic':'european',
    'Ethiopia':'african','Nigeria':'african','Ghana':'african','Senegal':'african',
    'Cameroon':'african','Kenya':'african','Tanzania':'african','Madagascar':'african',
    'Mozambique':'african','Angola':'african','Rwanda':'african','Zimbabwe':'african',
    'Mauritius':'african','South Africa':'african',
    'United States':'american','USA':'american','Canada':'american',
    'Australia':'american','New Zealand':'american',
  };

  function fallbackPhoto(cuisine) {
    const region = CUISINE_MAP[cuisine] || 'default';
    const photos = REGION_PHOTOS[region];
    let h = 0;
    for (let i = 0; i < recipeName.length; i++) h = (h * 31 + recipeName.charCodeAt(i)) & 0x7fffffff;
    return 'https://images.unsplash.com/' + photos[h % photos.length] + '?w=800&h=380&fit=crop&q=80&auto=format';
  }

  function injectImage(url) {
    if (!url || document.querySelector('.recipe-hero-photo')) return;
    const fig = document.createElement('figure');
    fig.className = 'recipe-hero-photo';
    const img = document.createElement('img');
    img.src = url; img.alt = recipeName; img.loading = 'lazy'; img.decoding = 'async';
    img.onerror = () => fig.remove();
    fig.appendChild(img);
    const cta = heroInner.querySelector('.btn');
    cta ? heroInner.insertBefore(fig, cta) : heroInner.appendChild(fig);
  }

  // ── Look up by recipe name (h1 text, lowercased) ──────────────
  const url = IMG[recipeName.toLowerCase()];
  if (url) { injectImage(url); return; }

  // ── Fallback: cuisine from JSON-LD ────────────────────────────
  try {
    const ld = document.querySelector('script[type="application/ld+json"]');
    const cuisine = ld ? JSON.parse(ld.textContent).recipeCuisine || '' : '';
    injectImage(fallbackPhoto(cuisine));
  } catch (e) { injectImage(fallbackPhoto('')); }
})();
