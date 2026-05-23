/* ============================================================
   SHOPPING LIST NORMALIZATION ENGINE
   ============================================================
   Takes a list of raw EN ingredient strings (with quantities,
   prep notes, parenthetical asides) and produces a curated,
   grouped, deduplicated shopping list.

   Output structure:
     [
       { category: 'vegetables', items: [{ name, qty }, ...] },
       { category: 'meat',       items: [...] },
       ...
       { category: 'pantry',     items: [{ name }, ...] }
     ]

   Quantities are summed within a canonical name + unit class.
   Pantry items (salt, pepper, oil, etc.) drop their quantity —
   the assumption is the cook already has them.

   Localization: category headers and canonical names ship in EN
   by default with a RO override map; other locales fall back to
   EN (recognisable as cognates in most European languages).
   ============================================================ */

/* Category id → ordered output position. Lower = appears first. */
const CATEGORY_ORDER = [
  'vegetables', 'meat', 'dairy', 'dry', 'sauces', 'bakery', 'misc', 'pantry'
];

const CATEGORY_LABELS = {
  en: {
    vegetables: 'Vegetables & herbs',
    meat: 'Meat & fish',
    dairy: 'Dairy & eggs',
    dry: 'Dry goods',
    sauces: 'Sauces & oils',
    bakery: 'Bakery',
    misc: 'Miscellaneous',
    pantry: 'Pantry staples',
  },
  ro: {
    vegetables: 'Legume și verdețuri',
    meat: 'Carne și pește',
    dairy: 'Lactate și ouă',
    dry: 'Cereale, paste, leguminoase',
    sauces: 'Sosuri și uleiuri',
    bakery: 'Brutărie',
    misc: 'Diverse',
    pantry: 'Cămară (probabil aveți)',
  },
  es: {
    vegetables: 'Verduras y hierbas', meat: 'Carne y pescado',
    dairy: 'Lácteos y huevos', dry: 'Despensa seca',
    sauces: 'Salsas y aceites', bakery: 'Panadería',
    misc: 'Varios', pantry: 'Despensa básica',
  },
  fr: {
    vegetables: 'Légumes & herbes', meat: 'Viandes & poissons',
    dairy: 'Produits laitiers & œufs', dry: 'Épicerie sèche',
    sauces: 'Sauces & huiles', bakery: 'Boulangerie',
    misc: 'Divers', pantry: 'Garde-manger',
  },
  de: {
    vegetables: 'Gemüse & Kräuter', meat: 'Fleisch & Fisch',
    dairy: 'Milchprodukte & Eier', dry: 'Trockenwaren',
    sauces: 'Saucen & Öle', bakery: 'Backwaren',
    misc: 'Sonstiges', pantry: 'Vorratskammer',
  },
  pt: {
    vegetables: 'Vegetais & ervas', meat: 'Carne & peixe',
    dairy: 'Laticínios & ovos', dry: 'Mercearia seca',
    sauces: 'Molhos & óleos', bakery: 'Padaria',
    misc: 'Diversos', pantry: 'Despensa',
  },
  it: {
    vegetables: 'Verdure & erbe', meat: 'Carne & pesce',
    dairy: 'Latticini & uova', dry: 'Dispensa secca',
    sauces: 'Salse & oli', bakery: 'Panetteria',
    misc: 'Varie', pantry: 'Dispensa di base',
  },
  ru: {
    vegetables: 'Овощи и зелень', meat: 'Мясо и рыба',
    dairy: 'Молочные и яйца', dry: 'Крупы и бакалея',
    sauces: 'Соусы и масла', bakery: 'Хлеб и выпечка',
    misc: 'Прочее', pantry: 'Кладовая (обычно есть)',
  },
  ar: {
    vegetables: 'خضروات وأعشاب', meat: 'لحوم وأسماك',
    dairy: 'ألبان وبيض', dry: 'حبوب ومعكرونة',
    sauces: 'صلصات وزيوت', bakery: 'مخبوزات',
    misc: 'متفرقات', pantry: 'مونة المنزل',
  },
  zh: {
    vegetables: '蔬菜与香草', meat: '肉类与海鲜',
    dairy: '乳制品与鸡蛋', dry: '干货与豆类',
    sauces: '酱料与油', bakery: '烘焙',
    misc: '其他', pantry: '常备调料',
  },
  ja: {
    vegetables: '野菜とハーブ', meat: '肉と魚',
    dairy: '乳製品と卵', dry: '乾物と穀物',
    sauces: 'ソースと油', bakery: 'パン類',
    misc: 'その他', pantry: '常備品',
  },
  hi: {
    vegetables: 'सब्ज़ियाँ और हर्ब्स', meat: 'मांस और मछली',
    dairy: 'डेयरी और अंडे', dry: 'अनाज और दालें',
    sauces: 'चटनी और तेल', bakery: 'बेकरी',
    misc: 'विविध', pantry: 'रसोई की बुनियादी सामग्री',
  },
  tr: {
    vegetables: 'Sebze ve otlar', meat: 'Et ve balık',
    dairy: 'Süt ürünleri ve yumurta', dry: 'Kuru gıda',
    sauces: 'Soslar ve yağlar', bakery: 'Fırın ürünleri',
    misc: 'Diğer', pantry: 'Kiler malzemeleri',
  },
  ko: {
    vegetables: '채소와 허브', meat: '육류와 생선',
    dairy: '유제품과 달걀', dry: '건조 식품',
    sauces: '소스와 기름', bakery: '베이커리',
    misc: '기타', pantry: '비축 식품',
  },
};

/* Canonical name → category. Lookup is on the lowercased extracted name.
   Order matters when a name contains multiple keywords — earlier rules win. */
const CATEGORY_RULES = [
  // PANTRY — match first so they don't fall into other categories
  [/^(salt|sea salt|kosher salt|fine sea salt|coarse salt|black pepper|white pepper|pepper)$/, 'pantry'],
  [/^(olive oil|extra-virgin olive oil|vegetable oil|cooking oil|neutral oil|sunflower oil|canola oil|sesame oil|oil)$/, 'pantry'],
  [/^(sugar|brown sugar|caster sugar|icing sugar|powdered sugar|honey)$/, 'pantry'],
  [/^(all-purpose flour|plain flour|flour|bread flour|cornstarch|corn starch|baking powder|baking soda|yeast|instant yeast|active dry yeast)$/, 'pantry'],
  [/^(butter|unsalted butter|ghee|niter kibbeh)$/, 'pantry'],
  [/^(water|ice|ice cubes|hot water|cold water)$/, 'pantry'],
  [/^(bay leaf|bay leaves)$/, 'pantry'],
  [/^(white wine vinegar|red wine vinegar|rice vinegar|apple cider vinegar|balsamic vinegar|vinegar)$/, 'pantry'],
  [/^(soy sauce|fish sauce|worcestershire sauce|tabasco|hot sauce)$/, 'pantry'],

  // SPICES (kept in pantry — supermarket-flow logic: spices live in the same shelf area as pantry)
  // Spices, dried herbs, seeds — anywhere in the name as a whole word,
  // so "ground cumin", "dried oregano", "kashmiri chilli powder" all hit.
  [/\b(garam masala|cumin|turmeric|paprika|cayenne|cinnamon|nutmeg|cloves?|cardamom|allspice|saffron|fenugreek|sumac|za'atar|berbere|ras el hanout|herbes de provence|italian seasoning|five[- ]spice|star anise|oregano|thyme|rosemary|basil|tarragon|dill|kasuri methi|peppercorns?|caraway|mustard seeds?|fennel seeds?)\b/, 'pantry'],
  [/\b(chill?i (powder|flakes)|kashmiri chilli)\b/, 'pantry'],
  [/\bbouquet garni/, 'pantry'],

  // MEAT & FISH — word-boundary short tokens to avoid substring false hits
  // ("ham" inside "bechamel", "cod" inside "coconut", "lamb" inside "lambic").
  // Trailing s? on short tokens so plurals ("prawns", "mussels") match.
  [/\b(beef|chuck|brisket|veal|lamb|pork|chicken|turkey|duck|guanciale|pancetta|prosciutto|bacon|sausages?|chorizo|salami|ham|hams|mince|mortadella|lardons?)\b/, 'meat'],
  [/short rib|ground beef|ground pork|ground lamb/, 'meat'],
  [/\b(salmon|trout|cod|tuna|haddock|sea bass|sole|mackerel|sardines?|anchov\w*|prawns?|shrimps?|mussels?|clams?|squid|calamari|octopus|crabs?|lobsters?|stockfish|crayfish|imitation crab)\b/, 'meat'],
  [/fish fillet|smoked fish/, 'meat'],

  // DAIRY & EGGS
  [/(\b|^)(milk|whole milk|skimmed milk|cream|double cream|heavy cream|sour cream|yoghurt|yogurt|greek yoghurt|labneh|crème fraîche|creme fraiche|buttermilk|kefir|condensed milk|evaporated milk|béchamel|bechamel)/, 'dairy'],
  // Vegetable additions that the broad regex missed
  [/\b(bean sprouts?|beansprouts?|sprouts?|edamame|water spinach|morning glory|bok choy|pak choi|napa|chinese cabbage|enoki|daikon|burdock|yuca|jicama|chayote|tomatillo|prickly pear|nopales|plantain|okra|chayote|kohlrabi|fiddleheads?|ramps?)\b/, 'vegetables'],
  // Nuts / dried fruit — keep in misc (treats / pantry-adjacent), but at least categorise
  [/\b(walnuts?|almonds?|pistachios?|cashews?|peanuts?|hazelnuts?|pecans?|pine nuts?|sesame seeds?|sunflower seeds?|pumpkin seeds?|raisins?|currants?|sultanas?|dates?|prunes?|dried apricots?|dried figs?|dried cranberries|cocoa powder|chocolate|coconut milk|coconut cream)\b/, 'misc'],
  [/(\b|^)(egg|eggs|egg yolks?|egg whites?)\b/, 'dairy'],
  [/(parmesan|parmigiano|pecorino|mozzarella|feta|ricotta|halloumi|kefalotyri|cheddar|gruyere|gruyère|emmental|gorgonzola|brie|camembert|manchego|paneer|cottage cheese|cream cheese|mascarpone|burrata|gouda|comté|comte|provolone|caciocavallo|cheese)/, 'dairy'],

  // DRY GOODS — pasta / rice / legumes / grains
  [/(spaghetti|penne|rigatoni|fusilli|tagliatelle|linguine|fettuccine|ditalini|tubetti|orecchiette|farfalle|pappardelle|orzo|macaroni|maccheroni|pasta|noodles?|udon|soba|ramen noodles?|rice noodles?|vermicelli|glass noodles?)/, 'dry'],
  [/(basmati|jasmine rice|long-grain rice|short-grain rice|arborio|carnaroli|bomba rice|sticky rice|sushi rice|brown rice|wild rice|rice\b)/, 'dry'],
  [/(lentils?|red lentils?|green lentils?|brown lentils?|du puy lentils?|chickpeas?|garbanzos?|kidney beans?|black beans?|white beans?|cannellini|navy beans?|borlotti|butter beans?|gigantes|edamame|split peas?|black-eyed peas?|fava beans?|broad beans?|mung beans?|adzuki|rajma|toor dal|chana dal|moong dal|urad dal)/, 'dry'],
  [/(quinoa|bulgur|couscous|polenta|cornmeal|semolina|oats|oat flakes|rolled oats|barley|millet|farro|spelt|buckwheat|hominy|tapioca)/, 'dry'],

  // SAUCES & OILS — non-pantry
  [/(tomato paste|tomato passata|tomato puree|crushed tomatoes|chopped tomatoes|canned tomatoes|tinned tomatoes|tomato sauce|marinara|salsa|ketchup|mayonnaise|dijon mustard|mustard|wholegrain mustard|aioli|harissa|sambal|gochujang|gochugaru|miso|miso paste|tamari|hoisin|oyster sauce|tahini|sesame paste|sriracha|chimichurri|pesto|piri[ -]?piri)/, 'sauces'],
  [/(red wine|white wine|dry white wine|dry red wine|burgundy|sherry|port|mirin|sake|cooking wine|stock|broth|chicken stock|beef stock|vegetable stock|fish stock|bouillon|dashi|chicken bouillon|beef bouillon|cognac|brandy|rum)/, 'sauces'],

  // BAKERY
  [/(bread|baguette|ciabatta|focaccia|pita|naan|tortilla|tortillas|sourdough|brioche|loaf|crouton|breadcrumbs|panko|phyllo|filo|puff pastry|shortcrust pastry|pizza dough|pie crust|crackers|grissini)/, 'bakery'],

  // VEGETABLES & HERBS — broad catch
  [/(onion|onions|shallot|leek|leeks|spring onion|scallion|chive|garlic|garlic cloves?)/, 'vegetables'],
  [/(tomato|tomatoes|cherry tomato|plum tomato|sun-dried tomato)/, 'vegetables'],
  [/(potato|potatoes|sweet potato|yam|cassava|taro)/, 'vegetables'],
  [/(carrot|carrots|parsnip|celeriac|celery|celery stalks?|fennel|fennel bulb)/, 'vegetables'],
  [/(bell pepper|red pepper|green pepper|yellow pepper|orange pepper|pepper\b|capsicum|jalape[nñ]o|serrano|habanero|chipotle|poblano|ancho|guajillo|pasilla|bird'?s eye chilli|chilli\b|chili\b|red chilli|green chilli|fresh chilli)/, 'vegetables'],
  [/(cucumber|courgette|courgettes|zucchini|aubergine|eggplant|squash|butternut squash|pumpkin|kabocha|acorn squash)/, 'vegetables'],
  [/(broccoli|cauliflower|cabbage|napa cabbage|red cabbage|savoy cabbage|kohlrabi|brussels sprouts?|kale|swiss chard|spinach|baby spinach|rocket|arugula|watercress|lettuce|romaine|iceberg|gem|endive|chicory|radicchio)/, 'vegetables'],
  [/(mushroom|mushrooms|button mushrooms?|cremini|portobello|shiitake|oyster mushrooms?|chestnut mushrooms?|porcini|wild mushrooms?)/, 'vegetables'],
  [/(ginger|fresh ginger|root ginger|galangal|lemongrass|kaffir lime leaves?|curry leaves?|fresh herbs?|parsley|flat-leaf parsley|cilantro|coriander leaves?|fresh coriander|basil|fresh basil|thai basil|holy basil|mint leaves?|fresh mint|dill|fresh dill|chervil|tarragon|fresh thyme|fresh rosemary|fresh oregano|sage|fresh sage|chives?|fresh chives?)/, 'vegetables'],
  [/(lemon|lime|orange|grapefruit|lemons?|limes?|oranges?|lemon zest|lime zest|orange zest|lemon juice|lime juice|orange juice)/, 'vegetables'],
  [/(corn|sweetcorn|sweet corn|baby corn|green peas|peas|frozen peas|snap peas|snow peas|mange-?tout|green beans|french beans|haricots verts|asparagus|artichoke|okra|bamboo shoots?|water chestnuts?)/, 'vegetables'],
  [/(avocado|olives?|black olives?|green olives?|kalamata olives?|capers|sun-dried tomatoes?|pickled vegetables|kimchi|sauerkraut)/, 'vegetables'],

  // MISC fallback — fruits, nuts, dried fruit, sweets
  [/(walnut|walnuts|almond|almonds|pistachio|pistachios|cashew|cashews|peanut|peanuts|hazelnut|hazelnuts|pecan|pecans|pine nuts?|sesame seeds?|sunflower seeds?|pumpkin seeds?|flaxseeds?|chia seeds?|poppy seeds?)/, 'misc'],
  [/(raisin|raisins|currants?|sultanas?|dates?|prunes?|dried apricots?|dried figs?|dried cranberries|chocolate|dark chocolate|cocoa|cocoa powder|vanilla|vanilla extract|vanilla pod|chocolate chips?)/, 'misc'],
  [/(apple|pear|banana|peach|plum|cherry|cherries|berry|berries|strawberry|blueberry|raspberry|blackberry|grape|kiwi|mango|pineapple|coconut|coconut milk|coconut cream|figs?|pomegranate|date paste)/, 'misc'],
  [/(tofu|tempeh|seitan)/, 'dry'],
];

/* Canonical name normalization. Maps the messy extracted name to a single
   clean shopping label. Lookup is case-insensitive on the lowercased input. */
const CANON_RULES = [
  // Compound recipe-ingredient phrases ("Coriander and flat-leaf parsley",
  // "Grated parmigiano and extra-virgin olive oil") that recipe authors
  // write as a single string but should canonicalize to a translatable
  // basic ingredient. Match FIRST so they don't fall through as raw EN.
  [/^coriander and (flat[- ]?leaf )?parsley$/, 'fresh herbs'],
  [/^parsley and (lemon wedges?|fresh herbs?).*$/, 'fresh parsley'],
  [/^cucumber slices? and fried shallots.*$/, 'cucumber'],
  [/^coriander leaves? and lemon wedges?.*$/, 'fresh coriander'],
  [/^grated parmigiano and extra[- ]virgin olive oil.*$/, 'grated parmesan'],
  [/^smoked lardons?$/, 'bacon'],
  [/^streaky bacon$/, 'bacon'],
  [/^(extra[- ]?)?virgin olive oil$/, 'olive oil'],
  [/^grated nutmeg$/, 'nutmeg'],
  [/^greek oregano$|^dried greek oregano$/, 'dried oregano'],
  [/^(dry\s+)?white wine$/, 'white wine'],
  [/^(dry\s+)?red wine$/, 'red wine'],
  [/^(canned\s+)?cannellini$|^canned cannellini.*$/, 'white beans'],
  [/^(red|green|yellow)\s+bell peppers?$|^bell peppers?$/, 'bell peppers'],

  // Onions
  [/^(yellow|brown|white|spanish|sweet)\s+onion(s)?$/, 'onion'],
  [/^(\d+\s+)?(large|medium|small|big|whole)?\s*onion(s)?$/, 'onion'],
  [/^red onion(s)?$/, 'red onion'],
  [/^spring onion(s)?$|^green onion(s)?$|^scallion(s)?$/, 'spring onions'],
  [/^shallot(s)?$/, 'shallot'],

  // Garlic
  [/^garlic\s*(cloves?|head)?(\s+.*)?$/, 'garlic'],
  [/^(\d+\s+)?(cloves?\s+)?garlic.*$/, 'garlic'],
  [/^(fresh\s+)?ginger.*$/, 'ginger'],

  // Tomatoes
  [/^(plum|roma|cherry|baby|vine|san marzano|ripe)\s+tomato(es)?$/, 'tomatoes'],
  [/^tomato(es)?$/, 'tomatoes'],
  [/^(crushed|chopped|tinned|canned|peeled)\s+tomato(es)?.*$/, 'canned tomatoes'],
  [/^tomato paste.*$/, 'tomato paste'],
  [/^tomato (passata|puree|purée).*$/, 'tomato passata'],

  // Potatoes
  [/^(maris piper|king edward|russet|yukon gold|new|baby|waxy|floury|starchy)?\s*potato(es)?$/, 'potatoes'],
  [/^sweet potato(es)?$/, 'sweet potato'],

  // Carrots / celery
  [/^(\d+\s+)?(large|medium|small)?\s*carrot(s)?$/, 'carrots'],
  [/^celery\s+(stalk|stick|rib)s?(\s+.*)?$/, 'celery'],
  [/^(\d+\s+)?(large|medium)?\s*celery (stalk|stick|rib)s?$/, 'celery'],
  [/^celery(\s+.*)?$/, 'celery'],
  [/^celeriac$/, 'celeriac'],
  [/^parsnip(s)?$/, 'parsnip'],
  [/^fennel( bulb)?$/, 'fennel'],

  // Peppers
  [/^(red|green|yellow|orange)\s+bell pepper(s)?$/, 'bell peppers'],
  [/^bell pepper(s)?$/, 'bell peppers'],
  [/^capsicum(s)?$/, 'bell peppers'],
  [/^(fresh\s+)?(red|green)\s+chilli(es)?$|^(red|green)\s+chili(es)?$/, 'fresh chillies'],
  [/^(jalapeño|jalapeno|serrano|bird'?s eye|thai)\s+chill?i(es)?$/, 'fresh chillies'],

  // Cucumber / courgette / aubergine
  [/^(english|persian)?\s*cucumber(s)?$/, 'cucumber'],
  [/^(courgette|zucchini)(s)?$/, 'courgette'],
  [/^(aubergine|eggplant)(s)?$/, 'aubergine'],
  [/^pumpkin$|^butternut squash$/, 'squash'],

  // Greens
  [/^(baby\s+)?spinach$/, 'spinach'],
  [/^(rocket|arugula)$/, 'rocket'],
  [/^(romaine|baby gem|iceberg)?\s*lettuce$/, 'lettuce'],
  [/^(savoy|napa|white|red)?\s*cabbage$/, 'cabbage'],
  [/^kale$/, 'kale'],
  [/^swiss chard$/, 'swiss chard'],
  [/^broccoli$/, 'broccoli'],
  [/^cauliflower$/, 'cauliflower'],

  // Mushrooms
  [/^(button|chestnut|cremini|brown)\s+mushroom(s)?$/, 'mushrooms'],
  [/^(button|chestnut|cremini|brown)$/, 'mushrooms'],
  [/^(shiitake|oyster|portobello|porcini|porcini dried|trumpet|enoki)\s+mushroom(s)?$/, 'specialty mushrooms'],
  [/^(shiitake|oyster|portobello|porcini)$/, 'specialty mushrooms'],
  [/^mushroom(s)?$/, 'mushrooms'],

  // Herbs
  [/^(fresh\s+)?(flat-leaf\s+|italian\s+|curly\s+)?parsley$/, 'fresh parsley'],
  [/^(fresh\s+)?coriander(\s+leaves?)?$|^(fresh\s+)?cilantro$/, 'fresh coriander'],
  [/^(fresh\s+)?basil(\s+leaves?)?$/, 'fresh basil'],
  [/^(fresh\s+)?mint(\s+leaves?)?$/, 'fresh mint'],
  [/^(fresh\s+)?dill$/, 'fresh dill'],
  [/^(fresh\s+)?thyme$/, 'fresh thyme'],
  [/^(fresh\s+)?rosemary$/, 'fresh rosemary'],
  [/^(fresh\s+)?sage$/, 'fresh sage'],
  [/^(fresh\s+)?chives?$/, 'fresh chives'],
  [/^lemongrass( stalks?)?$/, 'lemongrass'],
  [/^kaffir lime leaves?$/, 'kaffir lime leaves'],

  // Citrus
  [/^lemon(s)?$/, 'lemons'],
  [/^lime(s)?$/, 'limes'],
  [/^orange(s)?$/, 'oranges'],

  // Meat
  [/^(beef\s+)?chuck(\s+steak)?$|^stewing beef$|^braising steak$/, 'beef chuck'],
  [/^beef (sirloin|tenderloin|fillet|topside|brisket|shin|short rib)$/, 'beef cut'],
  [/^(minced beef|ground beef|beef mince)$/, 'beef mince'],
  [/^(minced lamb|ground lamb|lamb mince)$/, 'lamb mince'],
  [/^(minced pork|ground pork|pork mince)$/, 'pork mince'],
  [/^(boneless\s+|skinless\s+|skin-on\s+|bone-in\s+)*chicken\s+(thighs?|breasts?|wings?|drumsticks?|legs?)(\s+.*)?$/, m => `chicken ${m[2]}`],
  [/^chicken$|^whole chicken$/, 'whole chicken'],
  [/^pork\s+(shoulder|belly|loin|fillet|chop|ribs|neck)(\s+.*)?$/, m => `pork ${m[1]}`],
  [/^lamb\s+(shoulder|leg|chop|neck)(\s+.*)?$/, m => `lamb ${m[1]}`],
  [/^bone-in\s+lamb\s+(shoulder|leg|neck)$/, m => `lamb ${m[1]}`],
  [/^bacon$|^(streaky|smoked) bacon$|^lardons?$/, 'bacon'],
  [/^guanciale$/, 'guanciale'],
  [/^pancetta$/, 'pancetta'],
  [/^prosciutto$/, 'prosciutto'],
  [/^(chorizo|spanish chorizo)$/, 'chorizo'],
  [/^sausages?$|^(italian|toulouse|cumberland|merguez)\s+sausages?$/, 'sausages'],

  // Fish & seafood
  [/^salmon( fillets?)?$/, 'salmon'],
  [/^cod( fillets?)?$/, 'cod'],
  [/^tuna( steaks?)?$/, 'tuna'],
  [/^(king\s+|tiger\s+|jumbo\s+)?prawn(s)?$|^shrimp(s)?$/, 'prawns'],
  [/^mussel(s)?$/, 'mussels'],
  [/^clam(s)?$/, 'clams'],
  [/^anchov(y|ies)$|^anchovy fillets?$/, 'anchovies'],
  [/^sardines?$/, 'sardines'],

  // Dairy & eggs
  [/^(\d+\s+)?(large|medium|small|extra-large)?\s*eggs?$/, 'eggs'],
  [/^egg yolks?$/, 'egg yolks'],
  [/^egg whites?$/, 'egg whites'],
  [/^(whole|skimmed|semi-skimmed|full-fat)?\s*milk$/, 'milk'],
  [/^(double|single|heavy|whipping|sour)?\s*cream$/, 'cream'],
  [/^(greek|natural|plain)?\s*yo?ghurt$/, 'yoghurt'],
  [/^parmesan( cheese)?$|^parmigiano( reggiano)?$/, 'parmesan'],
  [/^pecorino( romano)?$/, 'pecorino'],
  [/^(fresh\s+)?mozzarella$/, 'mozzarella'],
  [/^feta( cheese)?$/, 'feta'],
  [/^ricotta$/, 'ricotta'],
  [/^cheddar$/, 'cheddar'],
  [/^(gruyere|gruyère)$/, 'gruyère'],
  [/^kefalotyri$/, 'kefalotyri'],

  // Dry / pasta / rice
  [/^spaghetti$/, 'spaghetti'],
  [/^penne( rigate)?$/, 'penne'],
  [/^rigatoni$/, 'rigatoni'],
  [/^pasta$|^(short|long|tube)\s+pasta$/, 'pasta'],
  [/^(basmati|jasmine|long-grain|short-grain)\s+rice$/, m => `${m[1]} rice`],
  [/^(arborio|carnaroli|bomba)\s+rice$/, m => `${m[1]} rice`],
  [/^rice$/, 'rice'],
  [/^chickpeas?$|^garbanzos?$|^canned chickpeas?$/, 'chickpeas'],
  [/^(red|green|brown|du puy)\s+lentils?$/, m => `${m[1]} lentils`],
  [/^lentils?$/, 'lentils'],
  [/^kidney beans?$|^canned kidney beans?$|^red kidney beans?$/, 'kidney beans'],
  [/^black beans?$|^canned black beans?$/, 'black beans'],
  [/^(white beans?|cannellini|navy beans?|borlotti)$|^canned (cannellini|borlotti|white beans?|navy beans?)$/, 'white beans'],
  [/^(pearl|baby)\s+onions?$/, 'pearl onions'],
  [/^minced (beef|lamb|pork|veal)$/, m => `${m[1]} mince`],
  [/^minced meat$/, 'beef mince'],
  [/^bechamel( sauce)?$|^béchamel( sauce)?$/, 'béchamel'],
  [/^(warm|hot|cold|chilled)\s+(chicken|beef|vegetable|fish)\s+stock$/, m => `${m[2]} stock`],
  [/^(chicken|beef|vegetable|fish|lamb)\s+(stock|broth|bouillon)$/, m => `${m[1]} stock`],
  [/^(extra[- ]virgin\s+)?olive oil\b.*$/, 'olive oil'],

  // Pantry — accept any "salt" / "pepper" / "butter" / "oil" string regardless of qualifier or trailing "for X" use case
  [/(^|\b)(sea|kosher|fine|coarse|table)\s+salt(\s+|$)/, 'salt'],
  [/^salt(\s+.*)?$/, 'salt'],
  [/^(\w+\s+)*salt\s+(for|to\s+).*$/, 'salt'],
  [/^(sea\s+|kosher\s+|fine\s+|coarse\s+|table\s+)?salt(\s+to taste)?$/, 'salt'],
  [/^(black\s+|white\s+|freshly ground\s+)?(pepper|peppercorns)$/, 'black pepper'],
  [/^(extra-virgin\s+)?olive oil$/, 'olive oil'],
  [/^(vegetable|sunflower|canola|neutral|cooking)\s+oil$/, 'neutral oil'],
  [/^sesame oil$/, 'sesame oil'],
  [/^oil$/, 'olive oil'],
  [/^sugar$|^(caster|granulated|white)\s+sugar$/, 'sugar'],
  [/^brown sugar$/, 'brown sugar'],
  [/^honey$/, 'honey'],
  [/^(all-purpose|plain)\s+flour$|^flour$/, 'flour'],
  [/^(extra\s+|unsalted\s+|salted\s+|cold\s+|softened\s+|melted\s+|clarified\s+)*butter(\s+.*)?$/, 'butter'],
  [/^water(\s+.*)?$/, 'water'],
  [/^(hot|cold|ice|warm|boiling|fresh)\s+water(\s+.*)?$/, 'water'],
  [/^bay leaf$|^bay leaves$/, 'bay leaves'],
  [/^(red\s+wine|white\s+wine|rice|apple cider|balsamic)\s+vinegar$/, m => `${m[1]} vinegar`],
  [/^vinegar$/, 'vinegar'],
  [/^soy sauce$/, 'soy sauce'],
  [/^fish sauce$/, 'fish sauce'],
];

/* Localized item labels. Falls back to the canonical name (English) when missing. */
const ITEM_LABELS = {
  ro: {
    'onion': 'Ceapă', 'red onion': 'Ceapă roșie', 'spring onions': 'Ceapă verde', 'shallot': 'Șalotă',
    'garlic': 'Usturoi', 'ginger': 'Ghimbir',
    'tomatoes': 'Roșii', 'canned tomatoes': 'Roșii conservă', 'tomato paste': 'Pastă de tomate', 'tomato passata': 'Bulion',
    'potatoes': 'Cartofi', 'sweet potato': 'Cartof dulce',
    'carrots': 'Morcovi', 'celery': 'Țelină (codiță)', 'celeriac': 'Țelină (rădăcină)', 'parsnip': 'Păstârnac', 'fennel': 'Fenicul',
    'bell peppers': 'Ardei gras', 'fresh chillies': 'Ardei iute',
    'cucumber': 'Castravete', 'courgette': 'Dovlecel', 'aubergine': 'Vinete', 'squash': 'Dovleac',
    'spinach': 'Spanac', 'rocket': 'Rucola', 'lettuce': 'Salată verde', 'cabbage': 'Varză', 'kale': 'Varză kale', 'swiss chard': 'Mangold',
    'broccoli': 'Broccoli', 'cauliflower': 'Conopidă',
    'mushrooms': 'Ciuperci', 'specialty mushrooms': 'Ciuperci specialitate',
    'fresh parsley': 'Pătrunjel', 'fresh coriander': 'Coriandru', 'fresh basil': 'Busuioc',
    'fresh mint': 'Mentă', 'fresh dill': 'Mărar', 'fresh thyme': 'Cimbru', 'fresh rosemary': 'Rozmarin', 'fresh sage': 'Salvie', 'fresh chives': 'Arpagic',
    'lemongrass': 'Lemongrass', 'kaffir lime leaves': 'Frunze de lime kaffir',
    'lemons': 'Lămâi', 'limes': 'Lime', 'oranges': 'Portocale',
    'beef chuck': 'Vită (pulpă/coastă)', 'beef cut': 'Vită', 'beef mince': 'Vită tocată',
    'lamb mince': 'Miel tocat', 'pork mince': 'Porc tocat',
    'whole chicken': 'Pui întreg', 'bacon': 'Bacon', 'guanciale': 'Guanciale', 'pancetta': 'Pancetta', 'prosciutto': 'Prosciutto',
    'chorizo': 'Chorizo', 'sausages': 'Cârnați',
    'salmon': 'Somon', 'cod': 'Cod', 'tuna': 'Ton', 'prawns': 'Creveți', 'mussels': 'Midii', 'clams': 'Scoici', 'anchovies': 'Anșoa', 'sardines': 'Sardine',
    'eggs': 'Ouă', 'egg yolks': 'Gălbenușuri', 'egg whites': 'Albușuri',
    'milk': 'Lapte', 'cream': 'Smântână', 'yoghurt': 'Iaurt',
    'parmesan': 'Parmezan', 'pecorino': 'Pecorino', 'mozzarella': 'Mozzarella', 'feta': 'Feta', 'ricotta': 'Ricotta', 'cheddar': 'Cheddar', 'gruyère': 'Gruyère', 'kefalotyri': 'Kefalotyri',
    'spaghetti': 'Spaghete', 'penne': 'Penne', 'rigatoni': 'Rigatoni', 'pasta': 'Paste',
    'rice': 'Orez',
    'chickpeas': 'Năut', 'lentils': 'Linte', 'kidney beans': 'Fasole roșie', 'black beans': 'Fasole neagră', 'white beans': 'Fasole albă',
    'salt': 'Sare', 'black pepper': 'Piper negru',
    'olive oil': 'Ulei de măsline', 'neutral oil': 'Ulei neutru', 'sesame oil': 'Ulei de susan',
    'sugar': 'Zahăr', 'brown sugar': 'Zahăr brun', 'honey': 'Miere',
    'flour': 'Făină', 'butter': 'Unt', 'water': 'Apă', 'bay leaves': 'Frunze de dafin',
    'vinegar': 'Oțet', 'soy sauce': 'Sos de soia', 'fish sauce': 'Sos de pește',
    // Stocks / broths / pastes — frequently leaked into RO PDFs
    'chicken stock': 'Bulion de pui', 'beef stock': 'Bulion de vită',
    'vegetable stock': 'Bulion de legume', 'fish stock': 'Fond de pește',
    'lamb stock': 'Bulion de miel',
    'coconut milk': 'Lapte de cocos', 'coconut cream': 'Smântână de cocos',
    'dashi': 'Bulion dashi', 'dashi stock': 'Bulion dashi',
    'béchamel': 'Sos béchamel',
    // Chicken cuts: canonical names are "chicken thighs", "chicken breasts", etc.
    'chicken thighs': 'Pulpe de pui (dezosate)',
    'chicken breasts': 'Piept de pui',
    'chicken wings': 'Aripi de pui',
    'chicken drumsticks': 'Pulpe inferioare de pui',
    'chicken legs': 'Pulpe de pui întregi',
    'pearl onions': 'Ceapă perlată',
    'preserved lemon': 'Lămâie murată',
    'red kidney beans': 'Fasole roșie', 'borlotti': 'Fasole borlotti',
    'arborio': 'Orez Arborio', 'bomba rice': 'Orez Bomba',
    'basmati rice': 'Orez basmati', 'jasmine rice': 'Orez jasmine',
    'phyllo pastry': 'Foi de plăcintă (filo)', 'shortcrust pastry': 'Aluat fraged',
    'day-old white bread': 'Pâine albă veche', 'breadcrumbs': 'Pesmet',
    // Meat extras
    'guanciale': 'Guanciale', 'pancetta': 'Pancetta', 'lardons': 'Lardons',
    'pork shoulder': 'Spată de porc', 'pork belly': 'Piept de porc',
    'lamb shoulder': 'Spată de miel',
    'beef cut': 'Vită', 'beef mince': 'Vită tocată',
    // Cheese variants that often leak as "grated parmesan"
    'grated parmesan': 'Parmezan ras', 'grated kefalotyri': 'Kefalotyri ras',
    'grated pecorino': 'Pecorino ras',
    // Spices used as canonical pantry labels but missing RO
    'smoked paprika': 'Boia afumată', 'paprika': 'Boia',
    'cumin': 'Chimion', 'ground cumin': 'Chimion măcinat',
    'cinnamon': 'Scorțișoară', 'ground cinnamon': 'Scorțișoară măcinată',
    'coriander': 'Coriandru (semințe)', 'ground coriander': 'Coriandru măcinat',
    'turmeric': 'Turmeric', 'ground turmeric': 'Turmeric măcinat',
    'garam masala': 'Garam masala', 'kashmiri chilli': 'Ardei iute Kashmiri',
    'chilli flakes': 'Fulgi de ardei iute', 'chili flakes': 'Fulgi de ardei iute',
    'saffron': 'Șofran', 'saffron threads': 'Fire de șofran',
    'nutmeg': 'Nucșoară', 'allspice': 'Ienibahar',
    'cloves': 'Cuișoare', 'cardamom': 'Cardamom',
    'mustard seeds': 'Semințe de muștar',
    'ras el hanout': 'Ras el hanout',
    'dried thyme': 'Cimbru uscat', 'dried oregano': 'Oregano uscat',
    'dried greek oregano': 'Oregano grecesc uscat',
    'dried herbes de provence': 'Ierburi de Provence uscate',
    'red wine vinegar': 'Oțet de vin roșu',
    'bouquet garni': 'Buchet aromatic',
    // Misc that often shows in plans
    'almonds': 'Migdale', 'walnuts': 'Nuci', 'pistachios': 'Fistic',
    'dried apricots': 'Caise uscate', 'raisins': 'Stafide',
    'dark chocolate': 'Ciocolată neagră', 'cocoa powder': 'Pudră de cacao',
    'aonori': 'Aonori', 'katsuobushi': 'Katsuobushi', 'nori': 'Nori', 'kecap manis': 'Kecap manis',
    'fresh herbs': 'Verdețuri proaspete',
    // Wines + remaining user-reported leaks
    'white wine': 'Vin alb', 'red wine': 'Vin roșu', 'cognac': 'Coniac',
    'dry white wine': 'Vin alb sec', 'dry red wine': 'Vin roșu sec',
    'bell peppers': 'Ardei gras',
  },
  fr: {
    // Vegetables
    'onion': 'Oignon', 'red onion': 'Oignon rouge', 'spring onions': 'Oignons verts',
    'shallot': 'Échalote', 'garlic': 'Ail', 'ginger': 'Gingembre',
    'tomatoes': 'Tomates', 'canned tomatoes': 'Tomates en conserve',
    'tomato paste': 'Concentré de tomates', 'tomato passata': 'Coulis de tomates',
    'potatoes': 'Pommes de terre', 'sweet potato': 'Patate douce',
    'carrots': 'Carottes', 'celery': 'Céleri-branche', 'celeriac': 'Céleri-rave',
    'parsnip': 'Panais', 'fennel': 'Fenouil',
    'bell peppers': 'Poivrons', 'fresh chillies': 'Piments frais',
    'cucumber': 'Concombre', 'courgette': 'Courgette', 'aubergine': 'Aubergine',
    'squash': 'Courge', 'spinach': 'Épinards', 'rocket': 'Roquette',
    'lettuce': 'Laitue', 'cabbage': 'Chou', 'kale': 'Chou kale', 'swiss chard': 'Blettes',
    'broccoli': 'Brocoli', 'cauliflower': 'Chou-fleur',
    'mushrooms': 'Champignons', 'specialty mushrooms': 'Champignons spéciaux',
    'fresh parsley': 'Persil frais', 'fresh coriander': 'Coriandre fraîche',
    'fresh basil': 'Basilic frais', 'fresh mint': 'Menthe fraîche',
    'fresh dill': 'Aneth frais', 'fresh thyme': 'Thym frais',
    'fresh rosemary': 'Romarin frais', 'fresh sage': 'Sauge fraîche',
    'fresh chives': 'Ciboulette', 'fresh herbs': 'Herbes fraîches',
    'lemongrass': 'Citronnelle', 'kaffir lime leaves': 'Feuilles de combava',
    'lemons': 'Citrons', 'limes': 'Citrons verts', 'oranges': 'Oranges',
    'pearl onions': 'Petits oignons grelots', 'preserved lemon': 'Citron confit',
    // Meat & fish
    'beef chuck': 'Paleron de bœuf', 'beef cut': 'Bœuf', 'beef mince': 'Bœuf haché',
    'lamb mince': 'Agneau haché', 'pork mince': 'Porc haché',
    'whole chicken': 'Poulet entier',
    'chicken thighs': 'Hauts de cuisse de poulet', 'chicken breasts': 'Blancs de poulet',
    'chicken wings': 'Ailes de poulet', 'chicken drumsticks': 'Pilons de poulet',
    'pork shoulder': 'Épaule de porc', 'pork belly': 'Poitrine de porc',
    'lamb shoulder': 'Épaule d\'agneau',
    'bacon': 'Lardons fumés', 'guanciale': 'Guanciale', 'pancetta': 'Pancetta',
    'prosciutto': 'Prosciutto', 'chorizo': 'Chorizo', 'sausages': 'Saucisses',
    'salmon': 'Saumon', 'cod': 'Cabillaud', 'tuna': 'Thon',
    'prawns': 'Crevettes', 'mussels': 'Moules', 'clams': 'Palourdes',
    'anchovies': 'Anchois', 'sardines': 'Sardines',
    // Dairy & eggs
    'eggs': 'Œufs', 'egg yolks': 'Jaunes d\'œuf', 'egg whites': 'Blancs d\'œuf',
    'milk': 'Lait', 'cream': 'Crème', 'yoghurt': 'Yaourt',
    'parmesan': 'Parmesan', 'pecorino': 'Pecorino', 'mozzarella': 'Mozzarella',
    'feta': 'Feta', 'ricotta': 'Ricotta', 'cheddar': 'Cheddar',
    'gruyère': 'Gruyère', 'kefalotyri': 'Kéfalotyri',
    'grated parmesan': 'Parmesan râpé', 'grated kefalotyri': 'Kéfalotyri râpé',
    'grated pecorino': 'Pecorino râpé', 'béchamel': 'Béchamel',
    // Dry / pasta / rice / legumes
    'spaghetti': 'Spaghetti', 'penne': 'Penne', 'rigatoni': 'Rigatoni',
    'pasta': 'Pâtes', 'rice': 'Riz', 'arborio': 'Riz Arborio',
    'bomba rice': 'Riz Bomba', 'basmati rice': 'Riz basmati', 'jasmine rice': 'Riz jasmin',
    'chickpeas': 'Pois chiches', 'lentils': 'Lentilles',
    'kidney beans': 'Haricots rouges', 'black beans': 'Haricots noirs',
    'white beans': 'Haricots blancs',
    // Sauces & wines
    'white wine': 'Vin blanc', 'red wine': 'Vin rouge',
    'dry white wine': 'Vin blanc sec', 'dry red wine': 'Vin rouge sec',
    'cognac': 'Cognac',
    // Bakery
    'phyllo pastry': 'Pâte filo', 'shortcrust pastry': 'Pâte brisée',
    'day-old white bread': 'Pain blanc rassis', 'breadcrumbs': 'Chapelure',
    // Pantry
    'salt': 'Sel', 'black pepper': 'Poivre noir',
    'olive oil': 'Huile d\'olive', 'neutral oil': 'Huile neutre',
    'sesame oil': 'Huile de sésame',
    'sugar': 'Sucre', 'brown sugar': 'Sucre roux', 'honey': 'Miel',
    'flour': 'Farine', 'butter': 'Beurre', 'water': 'Eau',
    'bay leaves': 'Feuilles de laurier',
    'vinegar': 'Vinaigre', 'red wine vinegar': 'Vinaigre de vin rouge',
    'soy sauce': 'Sauce soja', 'fish sauce': 'Nuoc-mâm',
    // Spices
    'paprika': 'Paprika', 'smoked paprika': 'Paprika fumé',
    'cumin': 'Cumin', 'ground cumin': 'Cumin moulu',
    'cinnamon': 'Cannelle', 'ground cinnamon': 'Cannelle moulue',
    'coriander': 'Coriandre (graines)', 'ground coriander': 'Coriandre moulue',
    'turmeric': 'Curcuma', 'ground turmeric': 'Curcuma moulu',
    'garam masala': 'Garam masala', 'kashmiri chilli': 'Piment de Cachemire',
    'chilli flakes': 'Flocons de piment',
    'saffron': 'Safran', 'saffron threads': 'Pistils de safran',
    'nutmeg': 'Muscade', 'allspice': 'Quatre-épices',
    'cloves': 'Clous de girofle', 'cardamom': 'Cardamome',
    'mustard seeds': 'Graines de moutarde', 'ras el hanout': 'Ras el-hanout',
    'dried thyme': 'Thym séché', 'dried oregano': 'Origan séché',
    'bouquet garni': 'Bouquet garni',
    // Stocks
    'chicken stock': 'Bouillon de volaille', 'beef stock': 'Bouillon de bœuf',
    'vegetable stock': 'Bouillon de légumes', 'fish stock': 'Fumet de poisson',
    'lamb stock': 'Bouillon d\'agneau',
    'coconut milk': 'Lait de coco', 'coconut cream': 'Crème de coco',
    'dashi': 'Dashi', 'dashi stock': 'Dashi',
    // Misc
    'almonds': 'Amandes', 'walnuts': 'Noix', 'pistachios': 'Pistaches',
    'dried apricots': 'Abricots secs', 'raisins': 'Raisins secs',
    'dark chocolate': 'Chocolat noir', 'cocoa powder': 'Cacao en poudre',
    'aonori': 'Aonori', 'katsuobushi': 'Katsuobushi', 'nori': 'Nori',
    'kecap manis': 'Kecap manis',
  },
  /* German / Deutsch — covers the top ~80 most-frequent shopping items. */
  de: {
    'onion':'Zwiebel','red onion':'Rote Zwiebel','spring onions':'Frühlingszwiebeln','shallot':'Schalotte',
    'garlic':'Knoblauch','ginger':'Ingwer',
    'tomatoes':'Tomaten','canned tomatoes':'Dosentomaten','tomato paste':'Tomatenmark','tomato passata':'Passierte Tomaten',
    'potatoes':'Kartoffeln','sweet potato':'Süßkartoffel',
    'carrots':'Karotten','celery':'Stangensellerie','celeriac':'Knollensellerie','parsnip':'Pastinake','fennel':'Fenchel',
    'bell peppers':'Paprika','fresh chillies':'Frische Chilischoten',
    'cucumber':'Gurke','courgette':'Zucchini','aubergine':'Aubergine','squash':'Kürbis',
    'spinach':'Spinat','rocket':'Rucola','lettuce':'Kopfsalat','cabbage':'Kohl','kale':'Grünkohl','swiss chard':'Mangold',
    'broccoli':'Brokkoli','cauliflower':'Blumenkohl',
    'mushrooms':'Champignons','specialty mushrooms':'Spezialpilze',
    'fresh parsley':'Petersilie','fresh coriander':'Koriandergrün','fresh basil':'Basilikum','fresh mint':'Minze',
    'fresh dill':'Dill','fresh thyme':'Thymian','fresh rosemary':'Rosmarin','fresh sage':'Salbei','fresh chives':'Schnittlauch',
    'lemongrass':'Zitronengras','kaffir lime leaves':'Kaffir-Limettenblätter',
    'lemons':'Zitronen','limes':'Limetten','oranges':'Orangen',
    'beef chuck':'Rinderschulter','beef cut':'Rindfleisch','beef':'Rindfleisch','beef mince':'Rinderhackfleisch',
    'lamb mince':'Lammhackfleisch','pork mince':'Schweinehackfleisch','whole chicken':'Ganzes Hähnchen',
    'chicken thighs':'Hähnchenschenkel','chicken breasts':'Hähnchenbrust','chicken wings':'Hähnchenflügel','chicken drumsticks':'Hähnchen-Unterschenkel',
    'pork shoulder':'Schweineschulter','pork belly':'Schweinebauch','lamb shoulder':'Lammschulter',
    'bacon':'Speck','guanciale':'Guanciale','pancetta':'Pancetta','prosciutto':'Prosciutto','chorizo':'Chorizo','sausages':'Bratwurst',
    'salmon':'Lachs','cod':'Kabeljau','tuna':'Thunfisch','prawns':'Garnelen','mussels':'Muscheln','clams':'Venusmuscheln','anchovies':'Sardellen','sardines':'Sardinen',
    'eggs':'Eier','egg yolks':'Eigelb','egg whites':'Eiweiß',
    'milk':'Milch','cream':'Sahne','yoghurt':'Joghurt',
    'parmesan':'Parmesan','pecorino':'Pecorino','mozzarella':'Mozzarella','feta':'Feta','ricotta':'Ricotta',
    'cheddar':'Cheddar','gruyère':'Gruyère','kefalotyri':'Kefalotyri',
    'grated parmesan':'Geriebener Parmesan','grated kefalotyri':'Geriebener Kefalotyri','grated pecorino':'Geriebener Pecorino','béchamel':'Béchamel',
    'spaghetti':'Spaghetti','penne':'Penne','rigatoni':'Rigatoni','pasta':'Nudeln','rice':'Reis',
    'arborio':'Arborio-Reis','bomba rice':'Bomba-Reis','basmati rice':'Basmati-Reis','jasmine rice':'Jasmin-Reis',
    'chickpeas':'Kichererbsen','lentils':'Linsen','kidney beans':'Kidneybohnen','black beans':'Schwarze Bohnen','white beans':'Weiße Bohnen',
    'white wine':'Weißwein','red wine':'Rotwein','dry white wine':'Trockener Weißwein','dry red wine':'Trockener Rotwein','cognac':'Cognac',
    'phyllo pastry':'Filoteig','shortcrust pastry':'Mürbeteig','day-old white bread':'Altbackenes Weißbrot','breadcrumbs':'Semmelbrösel',
    'salt':'Salz','black pepper':'Schwarzer Pfeffer',
    'olive oil':'Olivenöl','neutral oil':'Neutrales Öl','sesame oil':'Sesamöl',
    'sugar':'Zucker','brown sugar':'Brauner Zucker','honey':'Honig',
    'flour':'Mehl','butter':'Butter','water':'Wasser','bay leaves':'Lorbeerblätter',
    'vinegar':'Essig','red wine vinegar':'Rotweinessig','soy sauce':'Sojasauce','fish sauce':'Fischsauce','oyster sauce':'Austernsauce',
    'paprika':'Paprika','smoked paprika':'Geräucherter Paprika','sweet paprika':'Edelsüßer Paprika',
    'cumin':'Kreuzkümmel','ground cumin':'Gemahlener Kreuzkümmel',
    'cinnamon':'Zimt','ground cinnamon':'Gemahlener Zimt',
    'coriander':'Koriander (Samen)','ground coriander':'Gemahlener Koriander',
    'turmeric':'Kurkuma','ground turmeric':'Gemahlene Kurkuma',
    'garam masala':'Garam Masala','kashmiri chilli':'Kaschmir-Chili','chilli flakes':'Chiliflocken','baking powder':'Backpulver',
    'saffron':'Safran','saffron threads':'Safranfäden','nutmeg':'Muskatnuss','allspice':'Piment',
    'cloves':'Gewürznelken','cardamom':'Kardamom','mustard seeds':'Senfsamen','ras el hanout':'Ras el Hanout','ghee':'Ghee',
    'dried thyme':'Getrockneter Thymian','dried oregano':'Getrockneter Oregano','bouquet garni':'Bouquet garni',
    'chicken stock':'Hühnerbrühe','beef stock':'Rinderbrühe','vegetable stock':'Gemüsebrühe','fish stock':'Fischfond','lamb stock':'Lammbrühe',
    'coconut milk':'Kokosmilch','coconut cream':'Kokoscreme','dashi':'Dashi','dashi stock':'Dashi-Brühe',
    'almonds':'Mandeln','walnuts':'Walnüsse','pistachios':'Pistazien','dried apricots':'Getrocknete Aprikosen','raisins':'Rosinen',
    'dark chocolate':'Zartbitterschokolade','cocoa powder':'Kakaopulver',
    'aonori':'Aonori','katsuobushi':'Katsuobushi','nori':'Nori','kecap manis':'Kecap manis',
    'pearl onions':'Perlzwiebeln','preserved lemon':'Salzzitrone','fresh herbs':'Frische Kräuter',
  },
  /* Spanish / Español */
  es: {
    'onion':'Cebolla','red onion':'Cebolla morada','spring onions':'Cebolleta','shallot':'Chalota',
    'garlic':'Ajo','ginger':'Jengibre',
    'tomatoes':'Tomates','canned tomatoes':'Tomates en lata','tomato paste':'Concentrado de tomate','tomato passata':'Tomate triturado',
    'potatoes':'Patatas','sweet potato':'Boniato',
    'carrots':'Zanahorias','celery':'Apio','celeriac':'Apio nabo','parsnip':'Chirivía','fennel':'Hinojo',
    'bell peppers':'Pimientos','fresh chillies':'Guindillas frescas',
    'cucumber':'Pepino','courgette':'Calabacín','aubergine':'Berenjena','squash':'Calabaza',
    'spinach':'Espinacas','rocket':'Rúcula','lettuce':'Lechuga','cabbage':'Repollo','kale':'Col rizada','swiss chard':'Acelgas',
    'broccoli':'Brócoli','cauliflower':'Coliflor',
    'mushrooms':'Champiñones','specialty mushrooms':'Setas variadas',
    'fresh parsley':'Perejil','fresh coriander':'Cilantro','fresh basil':'Albahaca','fresh mint':'Menta',
    'fresh dill':'Eneldo','fresh thyme':'Tomillo','fresh rosemary':'Romero','fresh sage':'Salvia','fresh chives':'Cebollino',
    'lemongrass':'Hierba limón','kaffir lime leaves':'Hojas de lima kaffir',
    'lemons':'Limones','limes':'Limas','oranges':'Naranjas',
    'beef chuck':'Aguja de ternera','beef cut':'Ternera','beef':'Ternera','beef mince':'Carne picada de ternera',
    'lamb mince':'Cordero picado','pork mince':'Carne picada de cerdo','whole chicken':'Pollo entero',
    'chicken thighs':'Muslos de pollo','chicken breasts':'Pechugas de pollo','chicken wings':'Alitas de pollo','chicken drumsticks':'Jamoncitos de pollo',
    'pork shoulder':'Paletilla de cerdo','pork belly':'Panceta de cerdo','lamb shoulder':'Paletilla de cordero',
    'bacon':'Bacon','guanciale':'Guanciale','pancetta':'Panceta italiana','prosciutto':'Jamón serrano','chorizo':'Chorizo','sausages':'Salchichas',
    'salmon':'Salmón','cod':'Bacalao','tuna':'Atún','prawns':'Gambas','mussels':'Mejillones','clams':'Almejas','anchovies':'Anchoas','sardines':'Sardinas',
    'eggs':'Huevos','egg yolks':'Yemas','egg whites':'Claras','milk':'Leche','cream':'Nata','yoghurt':'Yogur',
    'parmesan':'Parmesano','pecorino':'Pecorino','mozzarella':'Mozzarella','feta':'Feta','ricotta':'Ricotta',
    'cheddar':'Cheddar','gruyère':'Gruyère','kefalotyri':'Kefalotyri',
    'grated parmesan':'Parmesano rallado','grated kefalotyri':'Kefalotyri rallado','grated pecorino':'Pecorino rallado','béchamel':'Bechamel',
    'spaghetti':'Espaguetis','penne':'Penne','rigatoni':'Rigatoni','pasta':'Pasta','rice':'Arroz',
    'arborio':'Arroz Arborio','bomba rice':'Arroz Bomba','basmati rice':'Arroz basmati','jasmine rice':'Arroz jazmín',
    'chickpeas':'Garbanzos','lentils':'Lentejas','kidney beans':'Alubias rojas','black beans':'Frijoles negros','white beans':'Alubias blancas',
    'white wine':'Vino blanco','red wine':'Vino tinto','dry white wine':'Vino blanco seco','dry red wine':'Vino tinto seco','cognac':'Coñac',
    'phyllo pastry':'Masa filo','shortcrust pastry':'Masa quebrada','day-old white bread':'Pan blanco del día anterior','breadcrumbs':'Pan rallado',
    'salt':'Sal','black pepper':'Pimienta negra','olive oil':'Aceite de oliva','neutral oil':'Aceite neutro','sesame oil':'Aceite de sésamo',
    'sugar':'Azúcar','brown sugar':'Azúcar moreno','honey':'Miel','flour':'Harina','butter':'Mantequilla','water':'Agua','bay leaves':'Hojas de laurel',
    'vinegar':'Vinagre','red wine vinegar':'Vinagre de vino tinto','soy sauce':'Salsa de soja','fish sauce':'Salsa de pescado','oyster sauce':'Salsa de ostras',
    'paprika':'Pimentón','smoked paprika':'Pimentón ahumado','sweet paprika':'Pimentón dulce',
    'cumin':'Comino','ground cumin':'Comino molido',
    'cinnamon':'Canela','ground cinnamon':'Canela molida','coriander':'Coriandro (semillas)','ground coriander':'Coriandro molido',
    'turmeric':'Cúrcuma','ground turmeric':'Cúrcuma molida',
    'garam masala':'Garam masala','kashmiri chilli':'Chile de Cachemira','chilli flakes':'Copos de chile','baking powder':'Levadura química',
    'saffron':'Azafrán','saffron threads':'Hebras de azafrán','nutmeg':'Nuez moscada','allspice':'Pimienta de Jamaica',
    'cloves':'Clavos','cardamom':'Cardamomo','mustard seeds':'Semillas de mostaza','ras el hanout':'Ras el hanout','ghee':'Ghee',
    'dried thyme':'Tomillo seco','dried oregano':'Orégano seco','bouquet garni':'Bouquet garni',
    'chicken stock':'Caldo de pollo','beef stock':'Caldo de ternera','vegetable stock':'Caldo de verduras','fish stock':'Caldo de pescado','lamb stock':'Caldo de cordero',
    'coconut milk':'Leche de coco','coconut cream':'Crema de coco','dashi':'Dashi','dashi stock':'Caldo dashi',
    'almonds':'Almendras','walnuts':'Nueces','pistachios':'Pistachos','dried apricots':'Orejones de albaricoque','raisins':'Pasas',
    'dark chocolate':'Chocolate negro','cocoa powder':'Cacao en polvo',
    'aonori':'Aonori','katsuobushi':'Katsuobushi','nori':'Nori','kecap manis':'Kecap manis',
    'pearl onions':'Cebollitas francesas','preserved lemon':'Limón encurtido','fresh herbs':'Hierbas frescas',
  },
  /* Italian / Italiano */
  it: {
    'onion':'Cipolla','red onion':'Cipolla rossa','spring onions':'Cipollotti','shallot':'Scalogno',
    'garlic':'Aglio','ginger':'Zenzero',
    'tomatoes':'Pomodori','canned tomatoes':'Pomodori pelati','tomato paste':'Concentrato di pomodoro','tomato passata':'Passata di pomodoro',
    'potatoes':'Patate','sweet potato':'Patata dolce',
    'carrots':'Carote','celery':'Sedano','celeriac':'Sedano rapa','parsnip':'Pastinaca','fennel':'Finocchio',
    'bell peppers':'Peperoni','fresh chillies':'Peperoncini freschi',
    'cucumber':'Cetriolo','courgette':'Zucchine','aubergine':'Melanzane','squash':'Zucca',
    'spinach':'Spinaci','rocket':'Rucola','lettuce':'Lattuga','cabbage':'Cavolo','kale':'Cavolo riccio','swiss chard':'Bietola',
    'broccoli':'Broccoli','cauliflower':'Cavolfiore',
    'mushrooms':'Funghi','specialty mushrooms':'Funghi pregiati',
    'fresh parsley':'Prezzemolo','fresh coriander':'Coriandolo fresco','fresh basil':'Basilico','fresh mint':'Menta',
    'fresh dill':'Aneto','fresh thyme':'Timo','fresh rosemary':'Rosmarino','fresh sage':'Salvia','fresh chives':'Erba cipollina',
    'lemongrass':'Citronella','kaffir lime leaves':'Foglie di lime kaffir',
    'lemons':'Limoni','limes':'Lime','oranges':'Arance',
    'beef chuck':'Cappello del prete','beef cut':'Manzo','beef':'Manzo','beef mince':'Macinato di manzo',
    'lamb mince':'Macinato di agnello','pork mince':'Macinato di maiale','whole chicken':'Pollo intero',
    'chicken thighs':'Cosce di pollo','chicken breasts':'Petti di pollo','chicken wings':'Alette di pollo','chicken drumsticks':'Fusi di pollo',
    'pork shoulder':'Spalla di maiale','pork belly':'Pancia di maiale','lamb shoulder':'Spalla di agnello',
    'bacon':'Pancetta affumicata','guanciale':'Guanciale','pancetta':'Pancetta','prosciutto':'Prosciutto','chorizo':'Chorizo','sausages':'Salsicce',
    'salmon':'Salmone','cod':'Merluzzo','tuna':'Tonno','prawns':'Gamberi','mussels':'Cozze','clams':'Vongole','anchovies':'Acciughe','sardines':'Sardine',
    'eggs':'Uova','egg yolks':'Tuorli','egg whites':'Albumi','milk':'Latte','cream':'Panna','yoghurt':'Yogurt',
    'parmesan':'Parmigiano','pecorino':'Pecorino','mozzarella':'Mozzarella','feta':'Feta','ricotta':'Ricotta',
    'cheddar':'Cheddar','gruyère':'Gruyère','kefalotyri':'Kefalotyri',
    'grated parmesan':'Parmigiano grattugiato','grated kefalotyri':'Kefalotyri grattugiato','grated pecorino':'Pecorino grattugiato','béchamel':'Besciamella',
    'spaghetti':'Spaghetti','penne':'Penne','rigatoni':'Rigatoni','pasta':'Pasta','rice':'Riso',
    'arborio':'Riso Arborio','bomba rice':'Riso Bomba','basmati rice':'Riso basmati','jasmine rice':'Riso jasmine',
    'chickpeas':'Ceci','lentils':'Lenticchie','kidney beans':'Fagioli rossi','black beans':'Fagioli neri','white beans':'Fagioli bianchi',
    'white wine':'Vino bianco','red wine':'Vino rosso','dry white wine':'Vino bianco secco','dry red wine':'Vino rosso secco','cognac':'Cognac',
    'phyllo pastry':'Pasta fillo','shortcrust pastry':'Pasta brisée','day-old white bread':'Pane bianco raffermo','breadcrumbs':'Pangrattato',
    'salt':'Sale','black pepper':'Pepe nero','olive oil':'Olio d\'oliva','neutral oil':'Olio neutro','sesame oil':'Olio di sesamo',
    'sugar':'Zucchero','brown sugar':'Zucchero di canna','honey':'Miele','flour':'Farina','butter':'Burro','water':'Acqua','bay leaves':'Foglie di alloro',
    'vinegar':'Aceto','red wine vinegar':'Aceto di vino rosso','soy sauce':'Salsa di soia','fish sauce':'Salsa di pesce','oyster sauce':'Salsa di ostriche',
    'paprika':'Paprika','smoked paprika':'Paprika affumicata','sweet paprika':'Paprika dolce',
    'cumin':'Cumino','ground cumin':'Cumino macinato',
    'cinnamon':'Cannella','ground cinnamon':'Cannella macinata','coriander':'Coriandolo (semi)','ground coriander':'Coriandolo macinato',
    'turmeric':'Curcuma','ground turmeric':'Curcuma macinata',
    'garam masala':'Garam masala','kashmiri chilli':'Peperoncino del Kashmir','chilli flakes':'Fiocchi di peperoncino','baking powder':'Lievito chimico',
    'saffron':'Zafferano','saffron threads':'Pistilli di zafferano','nutmeg':'Noce moscata','allspice':'Pimento',
    'cloves':'Chiodi di garofano','cardamom':'Cardamomo','mustard seeds':'Semi di senape','ras el hanout':'Ras el hanout','ghee':'Ghee',
    'dried thyme':'Timo essiccato','dried oregano':'Origano essiccato','bouquet garni':'Bouquet garni',
    'chicken stock':'Brodo di pollo','beef stock':'Brodo di manzo','vegetable stock':'Brodo vegetale','fish stock':'Brodo di pesce','lamb stock':'Brodo di agnello',
    'coconut milk':'Latte di cocco','coconut cream':'Crema di cocco','dashi':'Dashi','dashi stock':'Brodo dashi',
    'almonds':'Mandorle','walnuts':'Noci','pistachios':'Pistacchi','dried apricots':'Albicocche secche','raisins':'Uvetta',
    'dark chocolate':'Cioccolato fondente','cocoa powder':'Cacao in polvere',
    'aonori':'Aonori','katsuobushi':'Katsuobushi','nori':'Nori','kecap manis':'Kecap manis',
    'pearl onions':'Cipolline borettane','preserved lemon':'Limone in salamoia','fresh herbs':'Erbe aromatiche',
  },
  /* Portuguese / Português */
  pt: {
    'onion':'Cebola','red onion':'Cebola roxa','spring onions':'Cebolinho','shallot':'Chalota',
    'garlic':'Alho','ginger':'Gengibre',
    'tomatoes':'Tomates','canned tomatoes':'Tomate em lata','tomato paste':'Concentrado de tomate','tomato passata':'Polpa de tomate',
    'potatoes':'Batatas','sweet potato':'Batata-doce',
    'carrots':'Cenouras','celery':'Aipo','celeriac':'Aipo-rábano','parsnip':'Cherovia','fennel':'Funcho',
    'bell peppers':'Pimentos','fresh chillies':'Malaguetas frescas',
    'cucumber':'Pepino','courgette':'Courgette','aubergine':'Beringela','squash':'Abóbora',
    'spinach':'Espinafres','rocket':'Rúcula','lettuce':'Alface','cabbage':'Couve','kale':'Couve-galega','swiss chard':'Acelga',
    'broccoli':'Brócolos','cauliflower':'Couve-flor',
    'mushrooms':'Cogumelos','specialty mushrooms':'Cogumelos selvagens',
    'fresh parsley':'Salsa','fresh coriander':'Coentros','fresh basil':'Manjericão','fresh mint':'Hortelã',
    'fresh dill':'Endro','fresh thyme':'Tomilho','fresh rosemary':'Alecrim','fresh sage':'Salva','fresh chives':'Cebolinho',
    'lemongrass':'Capim-limão','kaffir lime leaves':'Folhas de lima kaffir',
    'lemons':'Limões','limes':'Limas','oranges':'Laranjas',
    'beef chuck':'Acém de vaca','beef cut':'Vaca','beef':'Vaca','beef mince':'Carne picada de vaca',
    'lamb mince':'Carne picada de borrego','pork mince':'Carne picada de porco','whole chicken':'Frango inteiro',
    'chicken thighs':'Coxas de frango','chicken breasts':'Peitos de frango','chicken wings':'Asas de frango','chicken drumsticks':'Pernas de frango',
    'pork shoulder':'Pá de porco','pork belly':'Barriga de porco','lamb shoulder':'Pá de borrego',
    'bacon':'Bacon','guanciale':'Guanciale','pancetta':'Pancetta','prosciutto':'Presunto','chorizo':'Chouriço','sausages':'Salsichas',
    'salmon':'Salmão','cod':'Bacalhau','tuna':'Atum','prawns':'Camarão','mussels':'Mexilhões','clams':'Amêijoas','anchovies':'Anchovas','sardines':'Sardinhas',
    'eggs':'Ovos','egg yolks':'Gemas','egg whites':'Claras','milk':'Leite','cream':'Natas','yoghurt':'Iogurte',
    'parmesan':'Parmesão','pecorino':'Pecorino','mozzarella':'Mozzarella','feta':'Feta','ricotta':'Ricotta',
    'cheddar':'Cheddar','gruyère':'Gruyère','kefalotyri':'Kefalotyri',
    'grated parmesan':'Parmesão ralado','grated kefalotyri':'Kefalotyri ralado','grated pecorino':'Pecorino ralado','béchamel':'Béchamel',
    'spaghetti':'Esparguete','penne':'Penne','rigatoni':'Rigatoni','pasta':'Massa','rice':'Arroz',
    'arborio':'Arroz Arborio','bomba rice':'Arroz Bomba','basmati rice':'Arroz basmati','jasmine rice':'Arroz jasmim',
    'chickpeas':'Grão-de-bico','lentils':'Lentilhas','kidney beans':'Feijão encarnado','black beans':'Feijão preto','white beans':'Feijão branco',
    'white wine':'Vinho branco','red wine':'Vinho tinto','dry white wine':'Vinho branco seco','dry red wine':'Vinho tinto seco','cognac':'Cognac',
    'phyllo pastry':'Massa filo','shortcrust pastry':'Massa quebrada','day-old white bread':'Pão branco do dia anterior','breadcrumbs':'Pão ralado',
    'salt':'Sal','black pepper':'Pimenta-preta','olive oil':'Azeite','neutral oil':'Óleo neutro','sesame oil':'Óleo de sésamo',
    'sugar':'Açúcar','brown sugar':'Açúcar mascavado','honey':'Mel','flour':'Farinha','butter':'Manteiga','water':'Água','bay leaves':'Folhas de louro',
    'vinegar':'Vinagre','red wine vinegar':'Vinagre de vinho tinto','soy sauce':'Molho de soja','fish sauce':'Molho de peixe','oyster sauce':'Molho de ostra',
    'paprika':'Paprica','smoked paprika':'Paprica fumada','sweet paprika':'Paprica doce',
    'cumin':'Cominhos','ground cumin':'Cominhos moídos',
    'cinnamon':'Canela','ground cinnamon':'Canela moída','coriander':'Coentros (sementes)','ground coriander':'Coentros moídos',
    'turmeric':'Curcuma','ground turmeric':'Curcuma moída',
    'garam masala':'Garam masala','kashmiri chilli':'Pimenta da Caxemira','chilli flakes':'Flocos de pimenta','baking powder':'Fermento em pó',
    'saffron':'Açafrão','saffron threads':'Estigmas de açafrão','nutmeg':'Noz-moscada','allspice':'Pimenta-da-jamaica',
    'cloves':'Cravinho','cardamom':'Cardamomo','mustard seeds':'Sementes de mostarda','ras el hanout':'Ras el hanout','ghee':'Ghee',
    'dried thyme':'Tomilho seco','dried oregano':'Orégãos secos','bouquet garni':'Bouquet garni',
    'chicken stock':'Caldo de galinha','beef stock':'Caldo de carne','vegetable stock':'Caldo de legumes','fish stock':'Caldo de peixe','lamb stock':'Caldo de borrego',
    'coconut milk':'Leite de coco','coconut cream':'Creme de coco','dashi':'Dashi','dashi stock':'Caldo dashi',
    'almonds':'Amêndoas','walnuts':'Nozes','pistachios':'Pistácios','dried apricots':'Damascos secos','raisins':'Passas',
    'dark chocolate':'Chocolate negro','cocoa powder':'Cacau em pó',
    'aonori':'Aonori','katsuobushi':'Katsuobushi','nori':'Nori','kecap manis':'Kecap manis',
    'pearl onions':'Cebolinhas pérola','preserved lemon':'Limão em conserva','fresh herbs':'Ervas aromáticas',
  },
};

/* ============================================================
   PARSER — extract qty, unit, name from a raw EN ingredient
   ============================================================ */

const UNIT_PATTERN = /\b(kg|kilograms?|g|grams?|gramme[s]?|mg|milligrams?|l|liters?|litres?|ml|milliliters?|millilitres?|tsp|teaspoons?|tbsp|tablespoons?|cup|cups|pint|pints|quart|quarts|oz|ounces?|lb|pounds?|cloves?|sprigs?|stalks?|sheets?|cans?|tins?|packs?|packets?|bunch|bunches|head|heads|piece|pieces|slices?|stick|sticks|leaves|leaf)\b/i;

const FRACTIONS = { '½': 0.5, '⅓': 0.333, '⅔': 0.667, '¼': 0.25, '¾': 0.75, '⅕': 0.2, '⅖': 0.4, '⅗': 0.6, '⅘': 0.8, '⅙': 0.167, '⅚': 0.833, '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875 };

function parseQty(s) {
  s = s.trim();
  // Unicode fractions
  if (FRACTIONS[s]) return FRACTIONS[s];
  // "1/2", "3/4"
  const frac = s.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (frac) return parseInt(frac[1]) / parseInt(frac[2]);
  // "1 1/2"
  const mixed = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixed) return parseInt(mixed[1]) + parseInt(mixed[2]) / parseInt(mixed[3]);
  // Plain decimal/integer
  const n = parseFloat(s.replace(',', '.'));
  return isFinite(n) ? n : null;
}

function parseIngredient(raw) {
  if (!raw) return null;
  let s = String(raw).trim();
  // Strip leading bullet/dash
  s = s.replace(/^[-•*●]\s*/, '');
  // Strip parenthetical asides BEFORE extracting qty (parens may contain "(~200g)")
  // but capture the FIRST one if it looks like a weight ("(about 250 g)")
  let parenWeight = null;
  const weightInParen = s.match(/\(\s*(?:about\s+|approx\.?\s+|~)?(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l)\b[^)]*\)/i);
  if (weightInParen) parenWeight = { qty: parseQty(weightInParen[1]), unit: weightInParen[2].toLowerCase() };
  s = s.replace(/\s*\([^)]*\)/g, '');

  // Strip em-dash / en-dash inline editorial comments. The dash MUST have
  // spaces around it — that's the editorial pattern. Plain hyphens
  // ("extra-virgin") and ranges ("8-10") stay intact.
  //   "Full-bodied Burgundy red wine — do not use cheap wine" -> "Full-bodied Burgundy red wine"
  //   "Lemongrass — outer leaves removed" -> "Lemongrass"
  s = s.split(/\s+[—–]\s+/)[0].trim();

  // Strip recipe-section prefixes that bloat the shopping label:
  //   "For sautéed sauerkraut: 400 g drained sauerkraut" -> "400 g drained sauerkraut"
  //   "Marinade: 1 tbsp soy sauce" -> "1 tbsp soy sauce"
  //   "Garnish: 2 spring onions" -> "2 spring onions"
  s = s.replace(/^(for\s+[^:]+|marinade|garnish|topping|sauce|filling|dressing|paste|stock|broth|dough|batter|crust):\s*/i, '').trim();
  // Quantifier phrases "hand of X" / "knob of X" / "pinch of X" / "splash of X"
  // become bare "X".
  s = s.replace(/^(a\s+)?(hand|handful|knob|pinch|splash|dash|drizzle|squeeze|sprinkle|few|couple)\s+of\s+/i, '').trim();

  // Strip prep suffix after first comma (", finely diced", ", chopped", etc.)
  s = s.split(',')[0].trim();

  // Strip trailing "for X" / "to X" / "if X" use-case notes that bloat the
  // shopping label without changing the ingredient identity.
  //   "Extra-virgin olive oil for shallow-frying the aubergine" -> "Extra-virgin olive oil"
  //   "Wasabi and pickled ginger to serve" -> "Wasabi and pickled ginger"
  //   "Coriander leaves to finish" -> "Coriander leaves"
  s = s.replace(/\s+(for|to|if|when|while)\s+.*$/i, '').trim();

  // Strip "or alternative" sections: "OR 200g..."
  s = s.split(/\s+\bor\b\s+/i)[0].trim();
  // Strip "+ also" tails: "+ 1 whole egg"
  // We won't fully handle the "+", just keep the leading item
  s = s.split(/\s+\+\s+/)[0].trim();

  // Extract qty + unit prefix
  // Patterns:
  //   "400g spaghetti" -> 400, g, spaghetti
  //   "400 g spaghetti" -> 400, g, spaghetti
  //   "1 large onion" -> 1, large, onion
  //   "2 tbsp olive oil" -> 2, tbsp, olive oil
  //   "Salt" -> null, null, salt
  //   "1/2 tsp salt" -> 0.5, tsp, salt
  let qty = null, unit = null, name = s;

  // Number prefix. Order matters: try fraction "1/2" before plain "1" so the
  // denominator isn't left as "/2 ..." in the remaining name.
  const numMatch = s.match(/^([0-9]+\s+[0-9]+\s*\/\s*[0-9]+|[0-9]+\s*\/\s*[0-9]+|[0-9]+(?:[.,][0-9]+)?(?:\s*[-–—]\s*[0-9]+(?:[.,][0-9]+)?)?|[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])\s*/);
  if (numMatch) {
    // For ranges "1-2", take the higher value (more conservative for shopping)
    const numStr = numMatch[1];
    const rangeMatch = numStr.match(/^(\d+(?:[.,]\d+)?)\s*[-–—]\s*(\d+(?:[.,]\d+)?)$/);
    if (rangeMatch) qty = parseQty(rangeMatch[2]); // upper bound
    else qty = parseQty(numStr);
    s = s.slice(numMatch[0].length).trim();
    name = s;
  }

  // Unit (with or without space after number)
  // Handle "400g" — number+unit no space — already stripped numbers above
  // Look for inline unit at start of remaining string
  const unitMatch = s.match(/^(kg|kilograms?|g|grams?|ml|milliliters?|millilitres?|l|L|liters?|litres?|tsp|teaspoons?|tbsp|tablespoons?|cup|cups|oz|lb|cloves?|sprigs?|stalks?|sheets?|cans?|tins?|jars?|packs?|packets?|bunch|bunches|head|piece|pieces|slices?|stick|sticks|leaves|leaf)\b\.?\s*(of\s+)?/i);
  if (unitMatch) {
    unit = unitMatch[1].toLowerCase();
    s = s.slice(unitMatch[0].length).trim();
    name = s;
  } else if (numMatch && !unit) {
    // No unit but had a number — strip an "of" or "x" connector
    s = s.replace(/^(of\s+|x\s+)/i, '').trim();
    name = s;
  }

  // Strip leading size adjectives if present (large, medium, small) but keep them as unit fallback
  const sizeMatch = name.match(/^(extra-large|large|medium|small|big|whole)\s+/i);
  if (sizeMatch && !unit) {
    unit = sizeMatch[1].toLowerCase();
    name = name.slice(sizeMatch[0].length).trim();
  }

  // Strip leading state adjectives that don't change the ingredient identity
  // for shopping purposes: "raw prawns" → "prawns", "hot chicken stock" →
  // "chicken stock", "warm milk" → "milk", "freshly cracked pepper" → "pepper".
  name = name.replace(/^(raw|cooked|fresh|freshly|hot|warm|cold|chilled|frozen|dry|dried|toasted|leftover|day-?old|ripe|softened|melted|extra)\s+/i, '');
  // After dropping a leading "ground" / "cracked" verb, what's left is the spice itself
  name = name.replace(/^(ground|cracked|crushed|whole)\s+/i, '');
  // Strip trailing prep verbs / state
  name = name.replace(/\s+(diced|chopped|sliced|minced|crushed|grated|peeled|deseeded|cubed|julienned|halved|quartered|cooked|raw|fresh|dried|toasted|ground|whole|finely|coarsely|roughly|thinly|thickly).*$/i, '');
  name = name.trim().toLowerCase();

  if (!name) return null;

  // If we found a paren weight (~250g) prefer that over the leading qty (which might be "1 large")
  if (parenWeight && (!unit || ['large','medium','small','big','whole','extra-large'].includes(unit))) {
    qty = parenWeight.qty;
    unit = parenWeight.unit;
  }

  return { qty, unit, name, raw };
}

/* ============================================================
   CANONICALIZATION + CATEGORIZATION
   ============================================================ */

function canonicalName(name) {
  if (!name) return null;
  const n = name.toLowerCase().trim();
  for (const [pattern, replacement] of CANON_RULES) {
    const m = n.match(pattern);
    if (m) {
      return typeof replacement === 'function' ? replacement(m) : replacement;
    }
  }
  return n;
}

function categoryFor(canonicalName) {
  if (!canonicalName) return 'misc';
  for (const [pattern, cat] of CATEGORY_RULES) {
    if (pattern.test(canonicalName)) return cat;
  }
  return 'misc';
}

/* ============================================================
   QUANTITY SUMMATION
   ============================================================ */

const UNIT_GROUPS = {
  mass: { g: 1, kg: 1000, mg: 0.001, oz: 28.35, lb: 453.6 },
  volume: { ml: 1, l: 1000, tsp: 5, tbsp: 15, cup: 240, oz_fl: 30, pint: 473, quart: 946 },
};

function unitGroup(u) {
  if (!u) return null;
  u = u.toLowerCase();
  if (UNIT_GROUPS.mass[u] != null) return 'mass';
  if (UNIT_GROUPS.volume[u] != null) return 'volume';
  return null;
}

function formatQty(grams) {
  if (grams <= 0) return '';
  if (grams >= 1000) return `${(grams / 1000).toFixed(grams >= 5000 ? 0 : 1)} kg`;
  if (grams >= 100) return `${Math.round(grams / 50) * 50} g`;
  if (grams >= 25) return `${Math.round(grams / 25) * 25} g`;
  return `${Math.round(grams)} g`;
}

function formatVolume(ml) {
  if (ml <= 0) return '';
  if (ml >= 1000) return `${(ml / 1000).toFixed(ml >= 5000 ? 0 : 1)} L`;
  if (ml < 25) return '';  // tsp-scale residue, suppress
  return `${Math.round(ml / 25) * 25} ml`;
}

function combineItems(items) {
  // items: [{ qty, unit, name, raw }, ...] — already filtered by same canonical
  let totalGrams = 0, totalMl = 0;
  let countPieces = 0;
  let sizeCount = { large: 0, medium: 0, small: 0 };
  let hasUntyped = false;

  for (const it of items) {
    if (!it.qty || !it.unit) { hasUntyped = true; continue; }
    const u = it.unit.toLowerCase();
    if (UNIT_GROUPS.mass[u] != null) totalGrams += it.qty * UNIT_GROUPS.mass[u];
    else if (UNIT_GROUPS.volume[u] != null) totalMl += it.qty * UNIT_GROUPS.volume[u];
    else if (sizeCount[u] != null) { sizeCount[u] += it.qty; countPieces += it.qty; }
    else countPieces += it.qty;
  }

  const parts = [];
  if (totalGrams > 0) parts.push(formatQty(totalGrams));
  if (totalMl > 0)    parts.push(formatVolume(totalMl));
  if (countPieces > 0) {
    if (sizeCount.large > 0 || sizeCount.medium > 0 || sizeCount.small > 0) {
      const sizes = ['large', 'medium', 'small']
        .filter(s => sizeCount[s] > 0)
        .map(s => `${sizeCount[s]} ${s}`).join(' + ');
      if (sizes) parts.push(sizes);
    } else {
      parts.push(`${Math.round(countPieces)}`);
    }
  }
  return parts.join(' · ');
}

/* ============================================================
   MAIN ENTRY POINT
   ============================================================ */

/* Browser-runtime entry point: takes an already-collected array of raw EN
   ingredient strings (e.g. from the user's current planner state) and
   returns the same grouped output as buildShoppingListV2. */
export function buildShoppingFromRawIngredients(rawIngredients, langCode) {
  return _groupAndRender(rawIngredients || [], langCode);
}

export function buildShoppingListV2(plan, langCode, allRecipes, budgetRecipes) {
  const src = plan.isBudget ? budgetRecipes : allRecipes;
  const all = [...plan.lunches, ...plan.dinners];
  const recipesUsed = [];
  for (const name of all) {
    const r = src.find(re => re.name?.[langCode] === name || re.name?.ro === name || re.name?.en === name);
    if (r) recipesUsed.push(r);
  }

  // 1. Collect all EN ingredient strings across all recipes
  const allIngr = [];
  for (const r of recipesUsed) {
    const ingr = r.ingredients?.en || r.ingredients?.ro || [];
    for (const i of ingr) allIngr.push(i);
  }
  return _groupAndRender(allIngr, langCode);
}

function _groupAndRender(allIngr, langCode) {

  // 2. Parse + canonicalize
  const parsed = [];
  for (const raw of allIngr) {
    const p = parseIngredient(raw);
    if (!p) continue;
    p.canonical = canonicalName(p.name);
    p.category = categoryFor(p.canonical);
    parsed.push(p);
  }

  // 3. Group by canonical name within each category
  const byCanon = {};
  for (const p of parsed) {
    const key = p.canonical;
    (byCanon[key] || (byCanon[key] = [])).push(p);
  }

  // 4. Build output items per category
  const categoryItems = {};
  for (const cat of CATEGORY_ORDER) categoryItems[cat] = [];

  // Names that are obviously orphans of bad parsing — they're a unit, an
  // adjective or fragment with no real noun. Filter them out entirely.
  // Also filters cooking equipment that occasionally leaks into ingredient
  // lists (bamboo rolling mat, wooden skewers, parchment paper).
  const ORPHAN = /^(canned|tinned|fresh|dried|raw|whole|warm|hot|cold|chilled|frozen|bunch|bunches|sprig|sprigs|stalk|stalks|head|piece|pieces|slice|slices|sheet|sheets|optional|to taste|to garnish|extra|more|some|big|wooden|red|green|yellow|orange|white|brown|black|good|nice|generous|small|medium|large|litres?|liters?|cups?|tsp|tbsp|pinch|pieces?|day-?old)$/i;
  const NON_FOOD = /\b(bamboo (rolling )?mat|wooden skewers?|metal skewers?|parchment paper|cling film|aluminium foil|aluminum foil|cheesecloth|kitchen string|kitchen twine|toothpicks?|cocktail sticks?)\b/i;

  for (const [canonical, items] of Object.entries(byCanon)) {
    if (ORPHAN.test(canonical) || NON_FOOD.test(canonical) || canonical.length < 3) continue;
    const cat = items[0].category;
    const labelMap = ITEM_LABELS[langCode] || {};
    // Sentence-case the canonical name: capitalize first letter only,
    // preserve any internal accent / case (Gruyère, jalapeño).
    const titleCase = canonical.charAt(0).toUpperCase() + canonical.slice(1);
    const label = labelMap[canonical] || titleCase;
    if (cat === 'pantry') {
      categoryItems.pantry.push({ name: label });
    } else {
      categoryItems[cat].push({ name: label, qty: combineItems(items) });
    }
  }

  // 5. Sort items alphabetically within each category
  for (const cat of CATEGORY_ORDER) {
    categoryItems[cat].sort((a, b) => a.name.localeCompare(b.name));
  }

  // 6. Filter empty categories, return in CATEGORY_ORDER
  const labels = CATEGORY_LABELS[langCode] || CATEGORY_LABELS.en;
  return CATEGORY_ORDER
    .filter(cat => categoryItems[cat].length > 0)
    .map(cat => ({
      id: cat,
      label: labels[cat] || CATEGORY_LABELS.en[cat],
      items: categoryItems[cat],
    }));
}
