with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ID 132 - Rösti (Switzerland) - all fields need hi
content = content.replace(
    '      ko: "스위스"\n    },\n    name: {\n      ro: "Rösti"',
    '      ko: "스위스",\n      hi: "स्विट्ज़रलैंड"\n    },\n    name: {\n      ro: "Rösti"'
)

content = content.replace(
    '      ko: "뢰스티"\n    },\n    category: {\n      ro: "Mic dejun"\n    },\n    servings: 2,\n    tipType: \'veg\'',
    '      ko: "뢰스티",\n      hi: "रोस्टी"\n    },\n    category: {\n      ro: "Mic dejun"\n    },\n    servings: 2,\n    tipType: \'veg\''
)

# Add hi to category — Rösti is Breakfast; servings: 2; ingredients ro: ["cartofi", "unt"...]
content = content.replace(
    '      ko: "아침"\n    },\n    servings: 2,\n    tipType: \'veg\',\n    pairingsType: \'veg\',\n    ingredients: {\n      ro: ["cartofi", "unt"',
    '      ko: "아침",\n      hi: "नाश्ता"\n    },\n    servings: 2,\n    tipType: \'veg\',\n    pairingsType: \'veg\',\n    ingredients: {\n      ro: ["cartofi", "unt"'
)

content = content.replace(
    '      ko: ["감자", "버터", "소금", "후추", "기름"]\n    },\n    howIsMade: {',
    '      ko: ["감자", "버터", "소금", "후추", "기름"],\n      hi: ["आलू", "मक्खन", "नमक", "काली मिर्च", "तेल"]\n    },\n    howIsMade: {'
)

content = content.replace(
    '      ko: "감자를 강판에 갈아 물기를 꼭 짜내고 소금으로 간을 한 후 납작하게 빚어 팬에 양면이 노릇해질 때까지 굽습니다."\n    },\n    originText: {\n      ro: "Rösti este',
    '      ko: "감자를 강판에 갈아 물기를 꼭 짜내고 소금으로 간을 한 후 납작하게 빚어 팬에 양면이 노릇해질 때까지 굽습니다.",\n      hi: "आलू को कद्दूकस करें, पानी निचोड़ें, चपटे गोले बनाएं और दोनों तरफ से सुनहरा और कुरकुरा होने तक तलें।"\n    },\n    originText: {\n      ro: "Rösti este'
)

old_origin = '''    originText: {
      ro: "Rösti este o rețetă tradițională din Elveția.",
      en: "Rösti is a traditional recipe from Switzerland.",
      es: "Rösti es una receta tradicional de Suiza.",
      fr: "Rösti est une recette traditionnelle de Suisse.",
      de: "Rösti ist ein traditionelles Rezept aus der Schweiz.",
      pt: "Rösti é uma receita tradicional da Suíça.",
      ru: "Рёсти — традиционный рецепт из Швейцарии.",
      ar: "روستي هي وصفة تقليدية من سويسرا.",
      zh: "瑞士土豆饼 是来自瑞士的传统食谱。",
      ja: "ロスティ はスイスの伝統的なレシピです。",
      tr: "Rösti İsviçre kökenli geleneksel bir tariftir.",
      it: "Rösti è una ricetta tradizionale della Svizzera.",
      ko: "뢰스티는 스위스의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Rösti a apărut ca micul dejun al fermierilor bernezi — o plăcintă simplă de cartofi rași, prăjită pe ambele părți până la crustă crocantă aurie. Cantonul Berna este considerat patria sa de origine, iar linia Röstigraben — granița lingvistică fictivă dintre germano- și francofona Elveție — capătă uneori denumirea de la preparat. Cartofii răciți din ziua precedentă dau rezultate mai bune decât cei proaspeți.\\n\\nVersiunea clasică nu adaugă nimic altceva decât sare și unt clarifiat, lăsând textura cartofului să fie suficientă. Variantele moderne includ brânză gruyère rasă, șuncă sau ouă pe deasupra, dar bucătarul elvețian puritan pur și simplu răstoarnă plăcinta cu un gest sigur la mijloc pentru a coace cealaltă parte.",
      en: "Rösti began as the breakfast of Bernese farmers — a simple cake of grated potatoes fried on both sides to a golden, crispy crust. The canton of Bern is considered its homeland, and the Röstigraben — the imaginary linguistic divide between German- and French-speaking Switzerland — occasionally borrows the dish's name. Day-old cold potatoes produce a better result than fresh ones.\\n\\nThe classic version adds nothing but salt and clarified butter, letting the potato's texture stand alone. Modern variations include grated gruyère, ham, or fried eggs on top, but the purist Swiss cook simply flips the cake mid-way with one confident gesture to cook the other side.",
      es: "El rösti comenzó como el desayuno de los granjeros berneses — una sencilla torta de patatas ralladas frita por ambos lados hasta obtener una corteza dorada y crujiente. El cantón de Berna es considerado su tierra natal, y el Röstigraben — la división lingüística imaginaria entre la Suiza germanófona y la francófona — a veces toma el nombre del plato. Las patatas del día anterior dan mejores resultados que las frescas.\\n\\nLa versión clásica no añade nada más que sal y mantequilla clarificada. Las variaciones modernas incluyen gruyère rallado, jamón o huevos fritos encima.",
      fr: "Le rösti a commencé comme le petit-déjeuner des fermiers bernois — une simple galette de pommes de terre râpées frite des deux côtés jusqu'à obtenir une croûte dorée et croustillante. Le canton de Berne est considéré comme son berceau, et le Röstigraben — la frontière linguistique imaginaire entre la Suisse alémanique et la Suisse romande — emprunte parfois le nom du plat. Les pommes de terre froides de la veille donnent de meilleurs résultats que les fraîches.\\n\\nLa version classique n'ajoute que du sel et du beurre clarifié. Les variantes modernes incluent du gruyère râpé, du jambon ou des œufs frits.",
      de: "Rösti begann als Frühstück der Bauern aus dem Kanton Bern — ein einfacher Kuchen aus geriebenen Kartoffeln, der auf beiden Seiten zu einer goldenen, knusprigen Kruste gebraten wird. Der Kanton Bern gilt als seine Heimat, und der Röstigraben — die imaginäre Sprachgrenze zwischen der deutsch- und der französischsprachigen Schweiz — borgt sich gelegentlich den Namen des Gerichts. Abgekühlte Kartoffeln vom Vortag liefern bessere Ergebnisse als frische.\\n\\nDie klassische Version fügt nichts außer Salz und geklärter Butter hinzu. Moderne Varianten umfassen geriebenen Gruyère, Schinken oder Spiegeleier.",
      pt: "O rösti começou como o café da manhã dos agricultores bernenses — um simples bolo de batata ralada frito dos dois lados até obter uma crosta dourada e crocante. O cantão de Berna é considerado a sua terra natal, e o Röstigraben — a divisão linguística imaginária entre a Suíça de língua alemã e a francófona — às vezes empresta o nome do prato. Batatas frias do dia anterior dão melhores resultados do que frescas.\\n\\nA versão clássica não acrescenta nada além de sal e manteiga clarificada. Variações modernas incluem gruyère ralado, presunto ou ovos fritos por cima.",
      ru: "Рёсти зародился как завтрак бернских фермеров — простой картофельный пирог из натёртого картофеля, поджаренный с обеих сторон до золотистой хрустящей корочки. Кантон Берн считается его родиной, а Рёстиграбен — воображаемая языковая граница между немецкоязычной и франкоязычной Швейцарией — иногда заимствует название блюда. Холодный картофель со вчерашнего дня даёт лучший результат, чем свежий.\\n\\nКлассическая версия не добавляет ничего, кроме соли и топлёного масла. Современные варианты включают тёртый грюйер, ветчину или яичницу сверху.",
      ar: "روستي بدأت كإفطار مزارعي برن — كعكة بسيطة من البطاطس المبشورة مقلية من الجانبين حتى تتشكل قشرة ذهبية مقرمشة. تُعدّ كانتون برن وطنها الأصلي، ويستعير الرُّستيغرابن — الحد اللغوي الخيالي بين سويسرا الناطقة بالألمانية والفرنسية — اسم الطبق أحياناً. البطاطس الباردة من اليوم السابق تعطي نتائج أفضل من الطازجة.\\n\\nالنسخة الكلاسيكية لا تضيف سوى الملح والزبدة المصفاة. تشمل المتغيرات الحديثة الجروير المبشور أو لحم الجمبون أو البيض المقلي فوقها.",
      zh: "瑞士土豆饼起源于伯尔尼地区农民的早餐——将擦碎的土豆做成扁圆饼，两面煎至金黄酥脆。伯尔尼州被视为其发源地，而「Röstigraben」——德语区与法语区之间想象中的语言边界——有时也借用这道菜的名字。用前一天冷藏过的土豆效果比新鲜土豆更好。\\n\\n经典版本只加盐和澄清黄油，凸显土豆本身的质地。现代变体会加入磨碎的格吕耶尔奶酪、火腿或煎蛋，但传统厨师只需一个干脆利落的翻转动作，将饼翻过来烤另一面。",
      ja: "ロスティはベルン州の農家の朝食として生まれました——すりおろしたじゃがいもを両面きつね色のカリカリになるまで焼いたシンプルなケーキです。ベルン州がその発祥地とされており、ドイツ語圏とフランス語圏を隔てる想像上の境界「Röstigraben」はこの料理の名前にちなんでいます。前日に冷ましたじゃがいもの方が新鮮なものより好結果が得られます。\\n\\nクラシックなレシピに加えるのは塩と澄ましバターのみで、じゃがいもの食感を前面に出します。現代版ではすりおろしたグリュイエール、ハム、目玉焼きを乗せることもありますが、スイスの伝統的な料理人はただ一度の自信ある動作で裏返します。",
      tr: "Rösti, Bern'li çiftçilerin kahvaltısı olarak başladı — rendelenmiş patatesten yapılmış sade bir kek, her iki tarafı altın ve çıtır olana kadar kızartılır. Bern kantonu onun ana yurdu sayılır; Almanca ve Fransızca konuşulan İsviçre arasındaki hayali dil sınırı olan Röstigraben zaman zaman yemeğin adını ödünç alır. Bir gün önce soğutulmuş patatesler taze olanlardan daha iyi sonuç verir.\\n\\nKlasik versiyonu yalnızca tuz ve sade tereyağı ekler; patatesi kendi dokusunda öne çıkarır. Modern değişkenler rendelenmiş gruyère, jambon veya kızarmış yumurta içerebilir.",
      it: "Il rösti nacque come colazione degli agricoltori bernesi — una semplice frittella di patate grattugiate, fritta su entrambi i lati fino a formare una crosta dorata e croccante. Il canton Berna è considerato la sua patria, e il Röstigraben — il confine linguistico immaginario tra la Svizzera tedescofona e quella francofona — prende a volte il nome del piatto. Le patate fredde del giorno prima danno risultati migliori di quelle fresche.\\n\\nLa versione classica non aggiunge nient'altro che sale e burro chiarificato. Le varianti moderne includono gruyère grattugiato, prosciutto o uova al tegamino.",
      ko: "뢰스티는 베른주 농부들의 아침식사로 시작되었습니다. 강판에 간 감자를 납작하게 빚어 양면이 황금색으로 바삭해질 때까지 구운 단순한 감자 케이크입니다. 베른주가 발원지로 여겨지며, 독일어권과 프랑스어권 스위스를 가르는 상상 속의 언어 경계 Röstigraben은 때로 이 요리의 이름을 빌리기도 합니다. 하루 전 냉장 보관한 감자가 신선한 감자보다 더 좋은 결과를 냅니다.\\n\\n클래식 레시피는 소금과 정제버터만 추가해 감자 식감 그 자체를 살립니다. 현대 변형에는 그뤼에르 치즈, 햄, 달걀 프라이를 올리기도 합니다.",
      hi: "रोस्टी बर्न के किसानों के नाश्ते के रूप में शुरू हुई — कद्दूकस किए आलू की एक साधारण केक, दोनों तरफ से सुनहरी कुरकुरी परत होने तक तली जाती है। बर्न कैंटन को इसकी मातृभूमि माना जाता है, और Röstigraben — जर्मन- और फ्रेंच-भाषी स्विट्ज़रलैंड के बीच काल्पनिक भाषाई सीमा — कभी-कभी इस व्यंजन का नाम उधार लेती है। पिछले दिन का ठंडा आलू ताज़े आलू से बेहतर परिणाम देता है।\\n\\nक्लासिक संस्करण केवल नमक और स्पष्ट मक्खन जोड़ता है, आलू की बनावट को सामने आने देता है। आधुनिक रूपांतरणों में कसा हुआ ग्रूयेर, हैम या तले अंडे शामिल हैं।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 132 done")
