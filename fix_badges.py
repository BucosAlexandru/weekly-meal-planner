"""Phase 11 — Badge system rework.

Replace:
  feat[6] ☕ 'Perfect for winter' → 🕐 'Slow simmered'
  feat[7] 👨‍👩‍👧‍👦 'Great for family'  → 🍲 'One-pot'

Add after feat[7] in all 14 locales:
  feat[8] 🌙 'Overnight broth'
  feat[9] 🫙 'Fermented'

Update recipeFeatureCards() with smart detection.
"""

# Per-locale replacements: (old_line_text, new_lines_text)
# Each is the exact line content (without trailing newline), indented with 6 spaces.
LOCALE_BADGES = {
    'ro': {
        'old6': "      {icon:'☕',t:'Perfect pentru iarnă',d:'Reconfortant și cald'},",
        'new6': "      {icon:'🕐',t:'Fiert lent',d:'La foc mic, ore întregi'},",
        'old7': "      {icon:'👨‍👩‍👧‍👦',t:'Ideal pentru familie',d:'Toți vor adora'},",
        'new7': "      {icon:'🍲',t:'Un singur vas',d:'Totul în aceeași oală'},",
        'new8': "      {icon:'🌙',t:'Bulion peste noapte',d:'Necesită preparare cu o zi înainte'},",
        'new9': "      {icon:'🫙',t:'Ingrediente fermentate',d:'Conține produse fermentate'},",
    },
    'en': {
        'old6': "      {icon:'☕',t:'Perfect for winter',d:'Comforting and warm'},",
        'new6': "      {icon:'🕐',t:'Slow simmered',d:'Low and slow cooking'},",
        'old7': "      {icon:'👨‍👩‍👧‍👦',t:'Great for family',d:'Everyone will love it'},",
        'new7': "      {icon:'🍲',t:'One-pot',d:'Minimal washing up'},",
        'new8': "      {icon:'🌙',t:'Overnight broth',d:'Start the day before'},",
        'new9': "      {icon:'🫙',t:'Fermented',d:'Contains fermented ingredients'},",
    },
    'es': {
        'old6': "      {icon:'☕',t:'Perfecto para el invierno',d:'Reconfortante y cálido'},",
        'new6': "      {icon:'🕐',t:'Cocción lenta',d:'A fuego lento durante horas'},",
        'old7': "      {icon:'👨‍👩‍👧‍👦',t:'Ideal para la familia',d:'A todos les encantará'},",
        'new7': "      {icon:'🍲',t:'Un solo recipiente',d:'Mínimo fregado'},",
        'new8': "      {icon:'🌙',t:'Caldo nocturno',d:'Empieza el día anterior'},",
        'new9': "      {icon:'🫙',t:'Fermentado',d:'Contiene ingredientes fermentados'},",
    },
    'fr': {
        'old6': "      {icon:'☕',t:'Parfait pour l\\'hiver',d:'Réconfortant et chaud'},",
        'new6': "      {icon:'🕐',t:'Mijoté lentement',d:'Cuisson longue à feu doux'},",
        'old7': "      {icon:'👨‍👩‍👧‍👦',t:'Idéal en famille',d:'Tout le monde adorera'},",
        'new7': "      {icon:'🍲',t:'Plat unique',d:'Une seule casserole'},",
        'new8': "      {icon:'🌙',t:'Bouillon de nuit',d:'Commencez la veille'},",
        'new9': "      {icon:'🫙',t:'Fermenté',d:'Contient des ingrédients fermentés'},",
    },
    'de': {
        'old6': "      {icon:'☕',t:'Perfekt für den Winter',d:'Wärmend und wohltuend'},",
        'new6': "      {icon:'🕐',t:'Langsam geköchelt',d:'Stundenlang auf kleiner Flamme'},",
        'old7': "      {icon:'👨‍👩‍👧‍👦',t:'Ideal für die Familie',d:'Alle werden es lieben'},",
        'new7': "      {icon:'🍲',t:'Ein-Topf-Gericht',d:'Minimales Abspülen'},",
        'new8': "      {icon:'🌙',t:'Brühe über Nacht',d:'Am Vortag beginnen'},",
        'new9': "      {icon:'🫙',t:'Fermentiert',d:'Enthält fermentierte Zutaten'},",
    },
    'pt': {
        'old6': "      {icon:'☕',t:'Perfeito para o inverno',d:'Reconfortante e quentinho'},",
        'new6': "      {icon:'🕐',t:'Cozido lentamente',d:'Fogo baixo por horas'},",
        'old7': "      {icon:'👨‍👩‍👧‍👦',t:'Ideal para a família',d:'Todos vão adorar'},",
        'new7': "      {icon:'🍲',t:'Um único recipiente',d:'Louça mínima'},",
        'new8': "      {icon:'🌙',t:'Caldo noturno',d:'Comece um dia antes'},",
        'new9': "      {icon:'🫙',t:'Fermentado',d:'Contém ingredientes fermentados'},",
    },
    'ru': {
        'old6': "      {icon:'☕',t:'Идеально зимой',d:'Согревающее и уютное'},",
        'new6': "      {icon:'🕐',t:'Долгое тушение',d:'Часами на слабом огне'},",
        'old7': "      {icon:'👨‍👩‍👧‍👦',t:'Для всей семьи',d:'Понравится каждому'},",
        'new7': "      {icon:'🍲',t:'В одной кастрюле',d:'Минимум посуды'},",
        'new8': "      {icon:'🌙',t:'Ночной бульон',d:'Начните за день до'},",
        'new9': "      {icon:'🫙',t:'Ферментированный',d:'Содержит ферментированные продукты'},",
    },
    'ar': {
        'old6': "      {icon:'☕',t:'مثالي للشتاء',d:'دافئ ومريح'},",
        'new6': "      {icon:'🕐',t:'طهي بطيء',d:'على نار هادئة لساعات'},",
        'old7': "      {icon:'👨‍👩‍👧‍👦',t:'مثالي للعائلة',d:'سيحبه الجميع'},",
        'new7': "      {icon:'🍲',t:'وعاء واحد',d:'حد أدنى من الغسيل'},",
        'new8': "      {icon:'🌙',t:'مرق ليلي',d:'ابدأ في اليوم السابق'},",
        'new9': "      {icon:'🫙',t:'مخمر',d:'يحتوي على مكونات مخمرة'},",
    },
    'zh': {
        'old6': "      {icon:'☕',t:'冬季佳品',d:'暖心又舒适'},",
        'new6': "      {icon:'🕐',t:'慢炖',d:'小火慢煮数小时'},",
        'old7': "      {icon:'👨‍👩‍👧‍👦',t:'家庭首选',d:'全家都会喜欢'},",
        'new7': "      {icon:'🍲',t:'一锅到底',d:'轻松清洗'},",
        'new8': "      {icon:'🌙',t:'隔夜高汤',d:'提前一天开始'},",
        'new9': "      {icon:'🫙',t:'发酵食品',d:'含有发酵食材'},",
    },
    'ja': {
        'old6': "      {icon:'☕',t:'冬に最適',d:'心も体も温まる'},",
        'new6': "      {icon:'🕐',t:'じっくり煮込み',d:'弱火でゆっくり調理'},",
        'old7': "      {icon:'👨‍👩‍👧‍👦',t:'家族向き',d:'みんなが喜ぶ'},",
        'new7': "      {icon:'🍲',t:'ワンポット',d:'後片付けが楽'},",
        'new8': "      {icon:'🌙',t:'一晩かけたブロス',d:'前日から仕込む'},",
        'new9': "      {icon:'🫙',t:'発酵食材使用',d:'発酵食品を含む'},",
    },
    'hi': {
        'old6': "      {icon:'☕',t:'सर्दियों के लिए परफेक्ट',d:'आरामदायक और गर्म'},",
        'new6': "      {icon:'🕐',t:'धीमी आंच पर',d:'घंटों तक धीमी आंच पर'},",
        'old7': "      {icon:'👨‍👩‍👧‍👦',t:'परिवार के लिए आदर्श',d:'सभी को पसंद आएगा'},",
        'new7': "      {icon:'🍲',t:'एक बर्तन में',d:'कम बर्तन'},",
        'new8': "      {icon:'🌙',t:'रात भर बना शोरबा',d:'एक दिन पहले शुरू करें'},",
        'new9': "      {icon:'🫙',t:'किण्वित',d:'किण्वित सामग्री युक्त'},",
    },
    'tr': {
        'old6': "      {icon:'☕',t:'Kış için mükemmel',d:'Sıcak ve rahatlatıcı'},",
        'new6': "      {icon:'🕐',t:'Yavaş pişirme',d:'Saatlerce kısık ateşte'},",
        'old7': "      {icon:'👨‍👩‍👧‍👦',t:'Aile için ideal',d:'Herkes sevecek'},",
        'new7': "      {icon:'🍲',t:'Tek tencere',d:'Az bulaşık'},",
        'new8': "      {icon:'🌙',t:'Gece boyunca et suyu',d:'Bir gün önceden başlayın'},",
        'new9': "      {icon:'🫙',t:'Fermente',d:'Fermente içerikler içerir'},",
    },
    'it': {
        'old6': "      {icon:'☕',t:'Perfetto per l\\'inverno',d:'Confortante e caldo'},",
        'new6': "      {icon:'🕐',t:'Cottura lenta',d:'A fuoco basso per ore'},",
        'old7': "      {icon:'👨‍👩‍👧‍👦',t:'Ideale per la famiglia',d:'Piacerà a tutti'},",
        'new7': "      {icon:'🍲',t:'Un solo tegame',d:'Minimo da lavare'},",
        'new8': "      {icon:'🌙',t:'Brodo notturno',d:'Inizia il giorno prima'},",
        'new9': "      {icon:'🫙',t:'Fermentato',d:'Contiene ingredienti fermentati'},",
    },
    'ko': {
        'old6': "      {icon:'☕',t:'겨울에 딱이에요',d:'따뜻하고 편안한'},",
        'new6': "      {icon:'🕐',t:'저온 장시간 조리',d:'뭉근히 오래 끓인'},",
        'old7': "      {icon:'👨‍👩‍👧‍👦',t:'온 가족이 좋아해요',d:'모두가 즐길 수 있어요'},",
        'new7': "      {icon:'🍲',t:'원팟 요리',d:'설거지 최소화'},",
        'new8': "      {icon:'🌙',t:'하룻밤 육수',d:'전날부터 시작'},",
        'new9': "      {icon:'🫙',t:'발효 식품',d:'발효 재료 포함'},",
    },
}

OLD_FUNC = """\
function recipeFeatureCards(ingr, steps, cat, code, n, overrides) {
  if (overrides?.featureCards) {
    return overrides.featureCards.map(f=>`<div class="recipe-feature-card"><span class="recipe-feature-icon">${f.icon}</span><div><p class="recipe-feature-title">${esc(f.t)}</p><p class="recipe-feature-desc">${esc(f.d)}</p></div></div>`).join('');
  }
  const ui = RECIPE_UI[code] || RECIPE_UI.en;
  const ingrStr = ingr.join(' ').toLowerCase();
  const hasMeat = /beef|chicken|pork|lamb|turkey|duck|veal|tuna|carne|pui|porc|vită|miel|vițel|ton/.test(ingrStr);
  const hasFish = /salmon|trout|cod|shrimp|seafood|fish|anchov|pește|somon|păstrăv|creveți|caracatiță/.test(ingrStr);
  const soupRecipe = isSoup(cat, n, ingr);
  const isFreezer = soupRecipe || steps.length > 5 || (overrides?.totalMins && overrides.totalMins > 35);
  const cards = [
    hasFish ? ui.feat[1] : hasMeat ? ui.feat[0] : ui.feat[2],
    (soupRecipe || isFreezer) ? ui.feat[6] : ui.feat[7],
    ui.feat[3],
    isFreezer ? ui.feat[4] : ui.feat[5],
  ];
  return cards.map(f=>`<div class="recipe-feature-card"><span class="recipe-feature-icon">${f.icon}</span><div><p class="recipe-feature-title">${f.t}</p><p class="recipe-feature-desc">${f.d}</p></div></div>`).join('');
}"""

NEW_FUNC = """\
function recipeFeatureCards(ingr, steps, cat, code, n, overrides) {
  if (overrides?.featureCards) {
    return overrides.featureCards.map(f=>`<div class="recipe-feature-card"><span class="recipe-feature-icon">${f.icon}</span><div><p class="recipe-feature-title">${esc(f.t)}</p><p class="recipe-feature-desc">${esc(f.d)}</p></div></div>`).join('');
  }
  const ui = RECIPE_UI[code] || RECIPE_UI.en;
  const ingrStr = ingr.join(' ').toLowerCase();
  const nameStr = (n||'').toLowerCase();
  const hasMeat = /beef|chicken|pork|lamb|turkey|duck|veal|tuna|carne|pui|porc|vită|miel|vițel|ton/.test(ingrStr);
  const hasFish = /salmon|trout|cod|shrimp|seafood|fish|anchov|pește|somon|păstrăv|creveți|caracatiță/.test(ingrStr);
  const soupRecipe = isSoup(cat, n, ingr);
  const totalMins = overrides?.totalMins ?? 0;
  const isFreezer = soupRecipe || steps.length > 5 || (totalMins > 35);
  const isOvernightRecipe = totalMins >= 480;
  const isSlowCook = totalMins > 120;
  const isFermented = /miso|kimchi|sauerkraut|tempeh|kefir|doenjang|gochujang|kvass/.test(ingrStr + ' ' + nameStr);
  const card1 = isOvernightRecipe ? ui.feat[8] : isSlowCook ? ui.feat[6] : isFermented ? ui.feat[9] : ui.feat[7];
  const cards = [
    hasFish ? ui.feat[1] : hasMeat ? ui.feat[0] : ui.feat[2],
    card1,
    ui.feat[3],
    isFreezer ? ui.feat[4] : ui.feat[5],
  ];
  return cards.map(f=>`<div class="recipe-feature-card"><span class="recipe-feature-icon">${f.icon}</span><div><p class="recipe-feature-title">${f.t}</p><p class="recipe-feature-desc">${f.d}</p></div></div>`).join('');
}"""

with open('scripts/generate-content.mjs', 'r', encoding='utf-8') as f:
    content = f.read()

changed6 = changed7 = 0

for locale, badges in LOCALE_BADGES.items():
    # Replace feat[6]
    old6 = badges['old6']
    new6 = badges['new6']
    if old6 in content:
        content = content.replace(old6, new6, 1)
        print(f"  [{locale}] feat[6]: replaced ☕ → 🕐")
        changed6 += 1
    else:
        print(f"  [{locale}] ERROR: feat[6] not found: {old6[:60]}")

    # Replace feat[7] and insert feat[8] + feat[9] after it
    old7 = badges['old7']
    new7_block = badges['new7'] + '\n' + badges['new8'] + '\n' + badges['new9']
    if old7 in content:
        content = content.replace(old7, new7_block, 1)
        print(f"  [{locale}] feat[7]: replaced 👨‍👩‍👧‍👦 → 🍲 + added 🌙 + 🫙")
        changed7 += 1
    else:
        print(f"  [{locale}] ERROR: feat[7] not found: {old7[:60]}")

# Update recipeFeatureCards()
if OLD_FUNC in content:
    content = content.replace(OLD_FUNC, NEW_FUNC, 1)
    print(f"\nrecipeFeatureCards(): updated with smart detection logic")
else:
    print(f"\nERROR: recipeFeatureCards() function body not found")

with open('scripts/generate-content.mjs', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nDone: feat[6] replaced in {changed6}/14 locales, feat[7] in {changed7}/14 locales")
