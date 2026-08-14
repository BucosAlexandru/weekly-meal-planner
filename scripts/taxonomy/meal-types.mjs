// Phase 2A — Canonical meal-type taxonomy (MAIN recipes).
//
// Pure leaf module. Reuses the TAG_LABELS shape (canonical slug -> 14 locale
// labels) so translators have one mental model across tags and meal types.
//
// Why a NEW field instead of reusing recipe.category: Phase 1 showed
// `category.en` conflates meal-type + dish-type + course across 15 values
// (Dinner, Pasta, Salad, Curry, Pizza, Dessert, ...), only 187/225 fall inside
// {Breakfast,Lunch,Dinner,Snack}, and `hi` is missing on 35 recipes. So a
// clean, closed, language-independent `mealType` is curated per recipe.
// `category` is LEFT UNTOUCHED — discovery-config.mjs selectors still match it.

// Closed canonical set. Order is presentation order for a future filter row.
export const MEAL_TYPE_IDS = Object.freeze([
  'breakfast', 'lunch', 'dinner', 'snack', 'appetizer', 'side', 'dessert',
]);

export const MEAL_TYPE_SET = Object.freeze(new Set(MEAL_TYPE_IDS));

// Localized labels — all 14 app locales, every id (validator enforces this).
// ro, en, es, fr, de, pt, ru, ar, zh, ja, hi, tr, it, ko
export const MEAL_TYPE_LABELS = Object.freeze({
  breakfast: { ro:'Mic dejun', en:'Breakfast', es:'Desayuno', fr:'Petit-déjeuner', de:'Frühstück', pt:'Café da manhã', ru:'Завтрак', ar:'فطور', zh:'早餐', ja:'朝食', hi:'नाश्ता', tr:'Kahvaltı', it:'Colazione', ko:'아침' },
  lunch:     { ro:'Prânz', en:'Lunch', es:'Almuerzo', fr:'Déjeuner', de:'Mittagessen', pt:'Almoço', ru:'Обед', ar:'غداء', zh:'午餐', ja:'昼食', hi:'दोपहर का खाना', tr:'Öğle yemeği', it:'Pranzo', ko:'점심' },
  dinner:    { ro:'Cină', en:'Dinner', es:'Cena', fr:'Dîner', de:'Abendessen', pt:'Jantar', ru:'Ужин', ar:'عشاء', zh:'晚餐', ja:'夕食', hi:'रात का खाना', tr:'Akşam yemeği', it:'Cena', ko:'저녁' },
  snack:     { ro:'Gustare', en:'Snack', es:'Aperitivo', fr:'En-cas', de:'Snack', pt:'Lanche', ru:'Перекус', ar:'وجبة خفيفة', zh:'小吃', ja:'軽食', hi:'नाश्ता', tr:'Atıştırmalık', it:'Spuntino', ko:'간식' },
  appetizer: { ro:'Aperitiv', en:'Appetizer', es:'Entrante', fr:'Entrée', de:'Vorspeise', pt:'Entrada', ru:'Закуска', ar:'مقبلات', zh:'开胃菜', ja:'前菜', hi:'क्षुधावर्धक', tr:'Meze', it:'Antipasto', ko:'전채' },
  side:      { ro:'Garnitură', en:'Side dish', es:'Guarnición', fr:'Accompagnement', de:'Beilage', pt:'Acompanhamento', ru:'Гарнир', ar:'طبق جانبي', zh:'配菜', ja:'副菜', hi:'साइड डिश', tr:'Garnitür', it:'Contorno', ko:'반찬' },
  dessert:   { ro:'Desert', en:'Dessert', es:'Postre', fr:'Dessert', de:'Nachtisch', pt:'Sobremesa', ru:'Десерт', ar:'حلوى', zh:'甜点', ja:'デザート', hi:'मिठाई', tr:'Tatlı', it:'Dolce', ko:'디저트' },
});
