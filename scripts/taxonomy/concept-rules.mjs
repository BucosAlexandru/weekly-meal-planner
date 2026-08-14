// Phase 3A — curated concept rules layered on top of the Phase-2 registry.
//
// The precision fixes are done the SAFE way: we ADD the genuinely-distinct
// compound concepts (coconut_milk, chili_oil, tomato_paste, …) and generic
// merges (stock, vinegar, wine, cream) as real concepts. The existing
// token-set + subsumption + derived-guard matcher then routes each line
// correctly with NO new heuristic:
//   • "coconut milk" → coconut_milk (subsumes the shorter `milk` match)
//   • "chicken stock" → stock (derived-guard suppresses `chicken`; `stock`
//     alias carries the derived token so it survives)
//   • "rice vinegar" → vinegar (derived-guard suppresses `rice`)
//   • "tomato paste" → tomato_paste (subsumes `tomato`)
//
// Aliases here are the EN surface forms only (VALIDATED level). Non-EN aliases
// for these new concepts are machine-extracted (CANDIDATE) or left for review.

// ── new canonical concepts (id → EN aliases) ────────────────────────────────
// EN aliases must include the derived-token form where relevant so the
// derived-guard keeps the match (e.g. `stock` carries 'stock','broth').
export const NEW_CONCEPTS = Object.freeze({
  // generic merges (qualifier intentionally dropped → useful search concept)
  stock:               ['stock', 'broth', 'bouillon'],
  vinegar:             ['vinegar'],
  wine:                ['wine'],
  cream:               ['cream', 'double cream', 'heavy cream', 'whipping cream', 'single cream'],
  // compound-DISTINCT (qualifier kept for precision — must NOT collapse to base)
  coconut_milk:        ['coconut milk', 'coconut cream'],
  chili_oil:           ['chili oil', 'chilli oil', 'chili crisp'],
  coconut_oil:         ['coconut oil'],
  palm_oil:            ['palm oil'],
  tomato_paste:        ['tomato paste', 'tomato puree', 'tomato concentrate', 'tomato passata'],
  // named sauces / pastes (own concepts)
  oyster_sauce:        ['oyster sauce'],
  hoisin_sauce:        ['hoisin sauce', 'hoisin'],
  worcestershire_sauce:['worcestershire sauce', 'worcestershire'],
  curry_paste:         ['curry paste'],
  shrimp_paste:        ['shrimp paste'],
  tamarind:            ['tamarind', 'tamarind paste', 'tamarind pulp'],
  harissa:             ['harissa', 'harissa paste'],
  gochugaru:           ['gochugaru', 'korean chili flakes', 'korean red pepper flakes'],
  mirin:               ['mirin'],
  // common single-noun concepts the pilot didn't cover (EN alias pinned so
  // auto-derive can't mangle them; other locales come from extraction)
  turmeric:            ['turmeric'],
  thyme:               ['thyme'],
  oregano:             ['oregano'],
  rosemary:            ['rosemary'],
  nutmeg:              ['nutmeg'],
  allspice:            ['allspice'],
  cardamom:            ['cardamom'],
  cloves:              ['cloves', 'clove'],
  star_anise:          ['star anise'],
  bay_leaf:            ['bay leaf', 'bay leaves'],
  fenugreek:           ['fenugreek', 'methi'],
  mustard:             ['mustard', 'dijon mustard', 'wholegrain mustard'],
  shallot:             ['shallot', 'shallots'],
  chives:              ['chives'],
  tofu:                ['tofu'],
  ghee:                ['ghee'],
  cornstarch:          ['cornstarch', 'corn starch', 'cornflour'],
  capers:              ['capers'],
  mayonnaise:          ['mayonnaise', 'mayo'],
  celeriac:            ['celeriac', 'celery root'],
  lamb:                ['lamb'],
  ham:                 ['ham'],
  sausage:             ['sausage', 'sausages'],
  bread:               ['bread'],
  saffron:             ['saffron'],
  vanilla:             ['vanilla bean', 'vanilla pod'],
  cocoa:               ['cocoa', 'cocoa powder', 'cacao'],
  coconut:             ['coconut', 'desiccated coconut', 'shredded coconut'],
  yeast:               ['yeast'],
});

// ── existing-concept alias gaps (clean id → extra EN aliases) ────────────────
// Close the Phase-2.5 misses. Keys are FINAL registry ids (budget promoted).
export const ALIAS_GAPS = Object.freeze({
  chili:       ['chillies', 'chilies', 'chilli', 'chile', 'chiles', 'chilli flakes', 'chili flakes', 'red chilli', 'green chilli'],
  eggplant:    ['aubergine', 'aubergines'],
  zucchini:    ['courgette', 'courgettes'],
  coriander:   ['cilantro', 'coriander seeds', 'coriander leaves'],
  cumin:       ['cumin seeds', 'ground cumin'],
  spring_onion:['scallion', 'scallions', 'green onion', 'green onions'],
  chickpeas:   ['garbanzo', 'garbanzos', 'garbanzo beans'],
  prawn:       ['shrimp', 'shrimps'],
  bell_pepper: ['capsicum', 'bell peppers'],
  green_beans: ['string beans', 'runner beans'],
  parsley:     ['flat-leaf parsley', 'flat leaf parsley'],
});

// ── budget-I id promotion (camelCase key → clean snake_case registry id) ─────
// A few budget concepts are folded into a broader search concept (chickenWings
// → chicken) per "prefer useful search concepts".
export const BUDGET_PROMOTE = Object.freeze({
  eggplant: 'eggplant', sourCream: 'sour_cream', whiteBeans: 'white_beans',
  greenBeans: 'green_beans', bayLeaf: 'bay_leaf', favaBeans: 'fava_beans',
  breadcrumbs: 'breadcrumbs', cornmeal: 'cornmeal', chickenWings: 'chicken',
  pasta: 'pasta', celery: 'celery', leek: 'leek', lentils: 'lentils',
  cabbage: 'cabbage', peas: 'peas', olives: 'olives', barley: 'barley',
  passata: 'tomato_paste', beans: 'beans', okra: 'okra', pumpkin: 'pumpkin',
  oats: 'oats', rosemary: 'rosemary', bulgur: 'bulgur',
});

// ── auto-derive support ──────────────────────────────────────────────────────
// Descriptor tokens stripped when auto-deriving a NEW concept id from a core
// phrase. PRODUCT-CHANGING nouns (coconut, almond, …) are deliberately absent —
// those are handled by explicit compound concepts above, never stripped.
export const DESCRIPTORS = new Set([
  'dry', 'fresh', 'freshly', 'dried', 'ground', 'whole', 'sweet', 'smoked', 'hot', 'mild',
  'large', 'small', 'medium', 'big', 'fine', 'coarse', 'toasted', 'raw', 'ripe', 'plain',
  'red', 'green', 'white', 'yellow', 'black', 'golden', 'baby', 'wild', 'king', 'jumbo',
  'boneless', 'skinless', 'lean', 'extra', 'light', 'dark', 'double', 'heavy', 'single',
  'cold', 'warm', 'unsalted', 'salted', 'full-fat', 'low-fat', 'good', 'best', 'quality',
  'thai', 'italian', 'greek', 'hungarian', 'spanish', 'japanese', 'korean', 'french',
  'mexican', 'indian', 'chinese', 'turkish', 'roma', 'hass', 'cherry', 'flat-leaf',
  'boiling', 'cooking', 'strong', 'day-old', 'stale', 'crusty', 'ripe',
]);

// Lines that are structural noise, not ingredients → never a concept.
export const NON_INGREDIENT = new Set([
  'sauce', 'paste', 'broth', 'oil', 'batter', 'dough', 'filling', 'topping',
  'garnish', 'marinade', 'dressing', 'seasoning', 'spice', 'spices', 'mix',
]);

// ── Phase 3B.0 cleanup of auto-derived ids ───────────────────────────────────
// Applied when an auto id is minted. MERGE/RENAME collapse "X or Y" collapses,
// form-suffix duplicates, token-order duplicates and synonyms onto one clean
// concept; DROP removes structural junk (the line then goes unassigned/review).
// Deliberately NOT a full ontology pass — only the obvious defects.
export const CLEANUP_MERGE = Object.freeze({
  // "X or Y" alternatives → the primary ingredient
  carp_bass: 'white_fish', peach_pear: 'pear', whisky_brandy: 'brandy',
  aquavit_vodka: 'vodka', marsala_rum: 'marsala', cheddar_gouda: 'cheddar',
  gruyere_comte: 'gruyere', kielbasa_krakovskaya: 'sausage', tzatziki_hummu: 'tzatziki',
  // token-order / synonym duplicates → one canonical
  seed_pomegranate: 'pomegranate', pomegranate_seed: 'pomegranate',
  marjoram_savory: 'marjoram', savory_marjoram: 'marjoram',
  gruyere_cheese: 'gruyere', aged_gruyere: 'gruyere',
  feta_cheese: 'feta', block_feta: 'feta',
  american_cheddar: 'cheddar', sharp_cheese: 'cheddar',
  lovage_leaf: 'lovage',
  // form-suffix → base
  cauliflower_floret: 'cauliflower', pineapple_chunk: 'pineapple',
  anchovy_fillet: 'anchovy', lettuce_leaf: 'lettuce',
  live_mussel: 'mussel', pitted_prune: 'prune', thawed_squid: 'squid',
  semi_plantain: 'plantain', pain_mie: 'bread', jambon_pari: 'ham',
  somun_flatbread: 'flatbread', gnocchi_pasta: 'gnocchi',
  short_pasta: 'pasta', lasagna_sheet: 'pasta', rum_extract: 'rum',
  tuna_oil: 'tuna', strip_danmuji: 'radish',
});
export const CLEANUP_DROP = new Set([
  'burger_sauce', 'dipping_sauce', 'cow_cheese', 'heaped_peppercorn',
  'fleur_sel', 'muna_voi', 'reina_pepiada', 'sour_jam',
]);
