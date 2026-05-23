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
  [/\b(beef|chuck|brisket|veal|lamb|pork|chicken|turkey|duck|guanciale|pancetta|prosciutto|bacon|sausage|chorizo|salami|ham|mince|mortadella|lardons?)\b/, 'meat'],
  [/short rib|ground beef|ground pork|ground lamb/, 'meat'],
  [/\b(salmon|trout|cod|tuna|haddock|sea bass|sole|mackerel|sardines?|anchov\w*|prawn|shrimp|mussel|clam|squid|calamari|octopus|crab|lobster|stockfish|crayfish)\b/, 'meat'],
  [/fish fillet|smoked fish/, 'meat'],

  // DAIRY & EGGS
  [/(\b|^)(milk|whole milk|skimmed milk|cream|double cream|heavy cream|sour cream|yoghurt|yogurt|greek yoghurt|labneh|crème fraîche|creme fraiche|buttermilk|kefir|condensed milk|evaporated milk|bechamel|béchamel)/, 'dairy'],
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
  [/^chickpeas?$|^garbanzos?$/, 'chickpeas'],
  [/^(red|green|brown|du puy)\s+lentils?$/, m => `${m[1]} lentils`],
  [/^lentils?$/, 'lentils'],
  [/^kidney beans?$/, 'kidney beans'],
  [/^black beans?$/, 'black beans'],
  [/^(white beans?|cannellini|navy beans?)$/, 'white beans'],

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
  [/^(unsalted|salted)?\s*butter(\s+.*)?$/, 'butter'],
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

  // Strip prep suffix after first comma (", finely diced", ", chopped", etc.)
  s = s.split(',')[0].trim();

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
  const unitMatch = s.match(/^(kg|g|ml|l|L|tsp|tbsp|cup|cups|oz|lb|cloves?|sprigs?|stalks?|sheets?|cans?|tins?|bunch|bunches|head|piece|pieces|slices?|stick|sticks|leaves|leaf)\b\.?\s*/i);
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
  // "chicken stock", "warm milk" → "milk".
  name = name.replace(/^(raw|cooked|fresh|hot|warm|cold|chilled|frozen|dry|dried|toasted|cooked|leftover)\s+/i, '');
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
  const ORPHAN = /^(canned|tinned|fresh|dried|bunch|bunches|sprig|sprigs|stalk|stalks|head|piece|pieces|slice|slices|sheet|sheets|optional|to taste|to garnish|extra|more|some)$/i;

  for (const [canonical, items] of Object.entries(byCanon)) {
    if (ORPHAN.test(canonical) || canonical.length < 3) continue;
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
