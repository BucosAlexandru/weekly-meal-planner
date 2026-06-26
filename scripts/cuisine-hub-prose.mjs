/* ════════════════════════════════════════════════════════════════
   CUISINE HUB PROSE — reusable localized editorial sections (14 langs)
   ════════════════════════════════════════════════════════════════
   Source of truth for the three prose sections rendered on every
   country/cuisine hub page by cuisineHubProse() in generate-content.mjs.
   Split into its own module (mirrors cuisine-intros.mjs).

   REGION_FLAVOURS — factual flavour-base phrase per CUISINE_ATMOSPHERE
   region, per locale. CUISINE_HUB_PROSE — localized section templates,
   placeholders filled by fillProse(): {country} {n} {flavours} {dishes}.

   EN is canonical; the other 13 locales were translated, then passed
   through an independent native food-editor review for diacritics,
   collocations and natural voice. Country-bearing sentences use only
   article-free slots for {country} (a colon/dash label, an apposition,
   or the object of an imperative) so they read correctly for EVERY
   country name — including vowel-initial (d'Italia) and multi-word /
   article-bearing ones (Paesi Bassi, Regno Unito, Pays-Bas, USA).
   No curly quotes (CLAUDE.md invariant).
*/

export const REGION_FLAVOURS = {
  "mediterranean": {
    "en": "olive oil, ripe tomatoes, garlic, fresh herbs, lemon and seafood",
    "ro": "ulei de măsline, roșii coapte, usturoi, ierburi proaspete, lămâie și fructe de mare",
    "es": "aceite de oliva, tomates maduros, ajo, hierbas frescas, limón y pescado",
    "fr": "huile d'olive, tomates bien mûres, ail, herbes fraîches, citron et fruits de mer",
    "de": "Olivenöl, reife Tomaten, Knoblauch, frische Kräuter, Zitrone und Meeresfrüchte",
    "pt": "azeite, tomate maduro, alho, ervas frescas, limão e marisco",
    "ru": "оливковое масло, спелые помидоры, чеснок, свежая зелень, лимон и морепродукты",
    "ar": "زيت الزيتون، الطماطم الناضجة، الثوم، الأعشاب الطازجة، الليمون والمأكولات البحرية",
    "zh": "橄榄油、熟透的番茄、大蒜、新鲜香草、柠檬和海鲜",
    "ja": "オリーブオイル、完熟トマト、にんにく、フレッシュハーブ、レモン、シーフード",
    "hi": "जैतून का तेल, पके टमाटर, लहसुन, ताज़ी जड़ी-बूटियाँ, नींबू और समुद्री भोजन",
    "tr": "zeytinyağı, olgun domates, sarımsak, taze otlar, limon ve deniz ürünleri",
    "it": "olio d'oliva, pomodori maturi, aglio, erbe fresche, limone e pesce",
    "ko": "올리브유, 잘 익은 토마토, 마늘, 신선한 허브, 레몬 그리고 해산물"
  },
  "east-asian": {
    "en": "rice, soy, ginger, sesame and umami-rich broths",
    "ro": "orez, sos de soia, ghimbir, susan și supe bogate în umami",
    "es": "arroz, soja, jengibre, sésamo y caldos ricos en umami",
    "fr": "riz, soja, gingembre, sésame et bouillons riches en umami",
    "de": "Reis, Soja, Ingwer, Sesam und umamireiche Brühen",
    "pt": "arroz, soja, gengibre, sésamo e caldos ricos em umami",
    "ru": "рис, соевый соус, имбирь, кунжут и насыщенные бульоны с умами",
    "ar": "الأرز، الصويا، الزنجبيل، السمسم والمرق الغني بنكهة الأومامي",
    "zh": "米饭、酱油、姜、芝麻和鲜味浓郁的高汤",
    "ja": "米、しょうゆ、しょうが、ごま、うま味豊かなだし",
    "hi": "चावल, सोया, अदरक, तिल और उमामी से भरपूर शोरबे",
    "tr": "pirinç, soya, zencefil, susam ve umami dolu et suları",
    "it": "riso, soia, zenzero, sesamo e brodi ricchi di umami",
    "ko": "쌀, 간장, 생강, 참깨 그리고 감칠맛이 풍부한 육수"
  },
  "se-asian": {
    "en": "lemongrass, chilli, coconut milk, fish sauce and fresh herbs",
    "ro": "lemongrass, ardei iute, lapte de cocos, sos de pește și ierburi proaspete",
    "es": "hierba limón, guindilla, leche de coco, salsa de pescado y hierbas frescas",
    "fr": "citronnelle, piment, lait de coco, sauce de poisson et herbes fraîches",
    "de": "Zitronengras, Chili, Kokosmilch, Fischsauce und frische Kräuter",
    "pt": "erva-príncipe, malagueta, leite de coco, molho de peixe e ervas frescas",
    "ru": "лемонграсс, чили, кокосовое молоко, рыбный соус и свежая зелень",
    "ar": "حشيشة الليمون، الفلفل الحار، حليب جوز الهند، صلصة السمك والأعشاب الطازجة",
    "zh": "香茅、辣椒、椰浆、鱼露和新鲜香草",
    "ja": "レモングラス、唐辛子、ココナッツミルク、ナンプラー、フレッシュハーブ",
    "hi": "लेमनग्रास, मिर्च, नारियल का दूध, फिश सॉस और ताज़ी जड़ी-बूटियाँ",
    "tr": "limon otu, acı biber, hindistan cevizi sütü, balık sosu ve taze otlar",
    "it": "citronella, peperoncino, latte di cocco, salsa di pesce ed erbe fresche",
    "ko": "레몬그라스, 고추, 코코넛 밀크, 피시 소스 그리고 신선한 허브"
  },
  "south-asian": {
    "en": "warming spices, lentils, rice, yoghurt and slow-cooked curries",
    "ro": "condimente calde, linte, orez, iaurt și preparate curry gătite îndelung",
    "es": "especias cálidas, lentejas, arroz, yogur y currys cocinados a fuego lento",
    "fr": "épices réconfortantes, lentilles, riz, yaourt et currys longuement mijotés",
    "de": "wärmende Gewürze, Linsen, Reis, Joghurt und langsam geschmorte Currys",
    "pt": "especiarias quentes, lentilhas, arroz, iogurte e caris cozinhados em lume brando",
    "ru": "согревающие специи, чечевица, рис, йогурт и томлёные карри",
    "ar": "التوابل الدافئة، العدس، الأرز، الزبادي والكاري المطهو على نار هادئة",
    "zh": "暖身的香料、扁豆、米饭、酸奶和慢炖咖喱",
    "ja": "体を温めるスパイス、レンズ豆、米、ヨーグルト、じっくり煮込んだカレー",
    "hi": "गरमाहट देने वाले मसाले, दालें, चावल, दही और धीमी आँच पर पकी करी",
    "tr": "ısıtıcı baharatlar, mercimek, pirinç, yoğurt ve ağır ateşte pişen köriler",
    "it": "spezie avvolgenti, lenticchie, riso, yogurt e curry a cottura lenta",
    "ko": "따뜻한 풍미의 향신료, 렌틸콩, 쌀, 요거트 그리고 오래 끓인 커리"
  },
  "middle-eastern": {
    "en": "chickpeas, olive oil, lemon, garlic and fragrant spice blends",
    "ro": "năut, ulei de măsline, lămâie, usturoi și amestecuri de condimente parfumate",
    "es": "garbanzos, aceite de oliva, limón, ajo y mezclas de especias aromáticas",
    "fr": "pois chiches, huile d'olive, citron, ail et mélanges d'épices parfumés",
    "de": "Kichererbsen, Olivenöl, Zitrone, Knoblauch und aromatische Gewürzmischungen",
    "pt": "grão-de-bico, azeite, limão, alho e misturas aromáticas de especiarias",
    "ru": "нут, оливковое масло, лимон, чеснок и ароматные смеси специй",
    "ar": "الحمص، زيت الزيتون، الليمون، الثوم وخلطات التوابل العطرية",
    "zh": "鹰嘴豆、橄榄油、柠檬、大蒜和芬芳的混合香料",
    "ja": "ひよこ豆、オリーブオイル、レモン、にんにく、香り高いスパイスミックス",
    "hi": "छोले, जैतून का तेल, नींबू, लहसुन और सुगंधित मसालों के मिश्रण",
    "tr": "nohut, zeytinyağı, limon, sarımsak ve hoş kokulu baharat karışımları",
    "it": "ceci, olio d'oliva, limone, aglio e profumate miscele di spezie",
    "ko": "병아리콩, 올리브유, 레몬, 마늘 그리고 향긋한 향신료 배합"
  },
  "north-african": {
    "en": "cumin, coriander, preserved lemon, chilli and slow-cooked tagines",
    "ro": "chimion, coriandru, lămâie murată, ardei iute și tagine gătite la foc mic",
    "es": "comino, cilantro, limón en conserva, guindilla y tajines a fuego lento",
    "fr": "cumin, coriandre, citron confit, piment et tajines longuement mijotés",
    "de": "Kreuzkümmel, Koriander, Salzzitrone, Chili und langsam geschmorte Tajines",
    "pt": "cominhos, coentros, limão em conserva, malagueta e tagines de cozedura lenta",
    "ru": "зира, кориандр, солёный лимон, чили и томлёные тажины",
    "ar": "الكمون، الكزبرة، الليمون المخلل، الفلفل الحار وأطباق الطاجن المطهوة على نار هادئة",
    "zh": "孜然、香菜、腌柠檬、辣椒和慢炖塔吉锅",
    "ja": "クミン、コリアンダー、塩漬けレモン、唐辛子、じっくり煮込んだタジン",
    "hi": "जीरा, धनिया, अचारी नींबू, मिर्च और धीमी आँच पर पके ताजिन",
    "tr": "kimyon, kişniş, salamura limon, acı biber ve ağır ateşte pişen tacineler",
    "it": "cumino, coriandolo, limoni sotto sale, peperoncino e tajine a cottura lenta",
    "ko": "커민, 고수, 소금에 절인 레몬, 고추 그리고 오래 끓인 타진"
  },
  "latin": {
    "en": "corn, beans, chillies, lime and slow-cooked meats",
    "ro": "porumb, fasole, ardei iuți, lime și carne gătită îndelung",
    "es": "maíz, frijoles, chiles, lima y carnes guisadas a fuego lento",
    "fr": "maïs, haricots, piments, citron vert et viandes longuement mijotées",
    "de": "Mais, Bohnen, Chilischoten, Limette und langsam geschmortes Fleisch",
    "pt": "milho, feijão, malaguetas, lima e carnes cozinhadas em lume brando",
    "ru": "кукуруза, фасоль, перец чили, лайм и томлёное мясо",
    "ar": "الذرة، الفاصولياء، الفلفل الحار، الليمون الأخضر واللحوم المطهوة على نار هادئة",
    "zh": "玉米、豆类、辣椒、青柠和慢炖肉类",
    "ja": "とうもろこし、豆、唐辛子、ライム、じっくり煮込んだ肉",
    "hi": "मक्का, राजमा, मिर्च, हरा नींबू और धीमी आँच पर पका मांस",
    "tr": "mısır, fasulye, acı biberler, misket limonu ve ağır ateşte pişen etler",
    "it": "mais, fagioli, peperoncini, lime e carni a cottura lenta",
    "ko": "옥수수, 콩, 고추, 라임 그리고 뭉근하게 익힌 고기"
  },
  "east-european": {
    "en": "hearty root vegetables, soured cream, dill and slow-simmered stews",
    "ro": "legume rădăcinoase consistente, smântână, mărar și tocănițe fierte la foc mic",
    "es": "abundantes hortalizas de raíz, crema agria, eneldo y guisos a fuego lento",
    "fr": "légumes-racines nourrissants, crème aigre, aneth et ragoûts mijotés à feu doux",
    "de": "deftiges Wurzelgemüse, saure Sahne, Dill und langsam geköchelte Eintöpfe",
    "pt": "legumes de raiz substanciais, creme azedo, endro e guisados de cozedura lenta",
    "ru": "сытные корнеплоды, сметана, укроп и наваристые рагу долгого томления",
    "ar": "الخضروات الجذرية الشهية، القشدة الحامضة، الشبت واليخنات المطهوة على نار هادئة",
    "zh": "扎实的根茎类蔬菜、酸奶油、莳萝和慢炖菜肴",
    "ja": "食べごたえのある根菜、サワークリーム、ディル、じっくり煮込んだシチュー",
    "hi": "पौष्टिक जड़ वाली सब्ज़ियाँ, खट्टी मलाई, सोआ और धीमी आँच पर पकी स्ट्यू",
    "tr": "doyurucu kök sebzeler, ekşi krema, dereotu ve uzun süre kaynayan yahniler",
    "it": "ortaggi a radice sostanziosi, panna acida, aneto e stufati a lunga cottura",
    "ko": "든든한 뿌리채소, 사워크림, 딜 그리고 뭉근하게 끓인 스튜"
  },
  "nordic": {
    "en": "rye, root vegetables, dill, berries and cured fish",
    "ro": "secară, legume rădăcinoase, mărar, fructe de pădure și pește marinat",
    "es": "centeno, hortalizas de raíz, eneldo, frutos del bosque y pescado curado",
    "fr": "seigle, légumes-racines, aneth, baies et poissons marinés",
    "de": "Roggen, Wurzelgemüse, Dill, Beeren und gepökelter Fisch",
    "pt": "centeio, legumes de raiz, endro, frutos silvestres e peixe curado",
    "ru": "рожь, корнеплоды, укроп, ягоды и солёно-вяленая рыба",
    "ar": "الجاودار، الخضروات الجذرية، الشبت، التوت والسمك المملح",
    "zh": "黑麦、根茎类蔬菜、莳萝、浆果和腌渍鱼",
    "ja": "ライ麦、根菜、ディル、ベリー、塩漬けの魚",
    "hi": "राई, जड़ वाली सब्ज़ियाँ, सोआ, बेरियाँ और नमक में डली मछली",
    "tr": "çavdar, kök sebzeler, dereotu, orman meyveleri ve tuzlanmış balık",
    "it": "segale, ortaggi a radice, aneto, bacche e pesce sotto sale",
    "ko": "호밀, 뿌리채소, 딜, 베리류 그리고 절인 생선"
  },
  "sub-saharan": {
    "en": "peppers, peanuts, tomatoes, ginger and bold one-pot stews",
    "ro": "ardei, alune, roșii, ghimbir și tocănițe savuroase la o singură oală",
    "es": "pimientos, cacahuetes, tomates, jengibre y contundentes guisos de una sola olla",
    "fr": "poivrons, cacahuètes, tomates, gingembre et ragoûts corsés à la marmite",
    "de": "Paprikaschoten, Erdnüsse, Tomaten, Ingwer und kräftige Eintöpfe aus einem Topf",
    "pt": "pimentos, amendoins, tomate, gengibre e guisados intensos de panela única",
    "ru": "перец, арахис, помидоры, имбирь и густые рагу в одной кастрюле",
    "ar": "الفلفل، الفول السوداني، الطماطم، الزنجبيل واليخنات الجريئة المطهوة في قدر واحد",
    "zh": "辣椒、花生、番茄、姜和浓郁的一锅炖菜",
    "ja": "パプリカや唐辛子、ピーナッツ、トマト、しょうが、力強いワンポットシチュー",
    "hi": "शिमला मिर्च, मूँगफली, टमाटर, अदरक और चटपटी एक-बर्तन स्ट्यू",
    "tr": "biberler, yer fıstığı, domates, zencefil ve iddialı tek tencere yemekleri",
    "it": "peperoncini, arachidi, pomodori, zenzero e stufati decisi in un'unica pentola",
    "ko": "고추, 땅콩, 토마토, 생강 그리고 진한 한 냄비 스튜"
  },
  "anglo": {
    "en": "roasts, hearty bakes, seasonal vegetables and comforting classics",
    "ro": "fripturi, preparate consistente la cuptor, legume de sezon și clasice reconfortante",
    "es": "asados, horneados sustanciosos, verduras de temporada y clásicos reconfortantes",
    "fr": "rôtis, gratins nourrissants, légumes de saison et grands classiques réconfortants",
    "de": "Braten, deftige Aufläufe, saisonales Gemüse und wohltuende Klassiker",
    "pt": "assados, tartes substanciais, legumes da época e clássicos reconfortantes",
    "ru": "запечённое мясо, сытная выпечка, сезонные овощи и уютная классика",
    "ar": "اللحوم المشوية، المخبوزات الشهية، الخضروات الموسمية والأطباق الكلاسيكية المريحة",
    "zh": "烤肉、丰盛的烘焙、时令蔬菜和暖心的经典菜肴",
    "ja": "ロースト、食べごたえのある焼き料理、旬の野菜、心安らぐ定番料理",
    "hi": "रोस्ट, पौष्टिक बेक, मौसमी सब्ज़ियाँ और सुकून देने वाले पारंपरिक व्यंजन",
    "tr": "fırında kızarmış etler, doyurucu fırın yemekleri, mevsim sebzeleri ve içi ısıtan klasikler",
    "it": "arrosti, sformati sostanziosi, verdure di stagione e classici confortanti",
    "ko": "로스트 요리, 든든한 베이크, 제철 채소 그리고 마음을 달래는 클래식 요리"
  },
  "central-european": {
    "en": "potatoes, hearty meats, cabbage, butter and comforting bakes",
    "ro": "cartofi, carne consistentă, varză, unt și preparate reconfortante la cuptor",
    "es": "patatas, carnes contundentes, col, mantequilla y horneados reconfortantes",
    "fr": "pommes de terre, viandes nourrissantes, chou, beurre et gratins réconfortants",
    "de": "Kartoffeln, deftiges Fleisch, Kohl, Butter und wohltuende Aufläufe",
    "pt": "batatas, carnes substanciais, couve, manteiga e tartes reconfortantes",
    "ru": "картофель, сытное мясо, капуста, сливочное масло и уютная выпечка",
    "ar": "البطاطس، اللحوم الشهية، الملفوف، الزبدة والمخبوزات المريحة",
    "zh": "土豆、丰盛的肉类、卷心菜、黄油和暖心的烘焙",
    "ja": "じゃがいも、食べごたえのある肉、キャベツ、バター、心安らぐ焼き料理",
    "hi": "आलू, पौष्टिक मांस, पत्तागोभी, मक्खन और सुकून देने वाले बेक",
    "tr": "patates, doyurucu etler, lahana, tereyağı ve içi ısıtan fırın yemekleri",
    "it": "patate, carni sostanziose, cavolo, burro e sformati confortanti",
    "ko": "감자, 든든한 고기, 양배추, 버터 그리고 마음을 달래는 베이크"
  },
  "central-asian": {
    "en": "rice, lamb, cumin, carrots and hand-pulled noodles",
    "ro": "orez, miel, chimion, morcovi și tăiței trași de mână",
    "es": "arroz, cordero, comino, zanahorias y fideos estirados a mano",
    "fr": "riz, agneau, cumin, carottes et nouilles étirées à la main",
    "de": "Reis, Lamm, Kreuzkümmel, Karotten und handgezogene Nudeln",
    "pt": "arroz, borrego, cominhos, cenouras e massa esticada à mão",
    "ru": "рис, баранина, зира, морковь и лапша ручного вытягивания",
    "ar": "الأرز، لحم الضأن، الكمون، الجزر والمعكرونة المسحوبة يدوياً",
    "zh": "米饭、羊肉、孜然、胡萝卜和手拉面",
    "ja": "米、ラム肉、クミン、にんじん、手延べ麺",
    "hi": "चावल, मेमने का मांस, जीरा, गाजर और हाथ से खींचे गए नूडल्स",
    "tr": "pirinç, kuzu eti, kimyon, havuç ve elde açılan erişteler",
    "it": "riso, agnello, cumino, carote e tagliolini tirati a mano",
    "ko": "쌀, 양고기, 커민, 당근 그리고 손으로 뽑은 면"
  },
  "pacific": {
    "en": "coconut, tropical fruit, fresh seafood and earth-cooked dishes",
    "ro": "cocos, fructe tropicale, fructe de mare proaspete și preparate gătite în pământ",
    "es": "coco, fruta tropical, pescado y marisco frescos y platos cocinados bajo tierra",
    "fr": "noix de coco, fruits tropicaux, fruits de mer frais et plats cuits en fosse",
    "de": "Kokosnuss, tropische Früchte, frische Meeresfrüchte und im Erdofen gegarte Gerichte",
    "pt": "coco, fruta tropical, marisco fresco e pratos cozinhados na terra",
    "ru": "кокос, тропические фрукты, свежие морепродукты и блюда из земляной печи",
    "ar": "جوز الهند، الفواكه الاستوائية، المأكولات البحرية الطازجة والأطباق المطهوة في باطن الأرض",
    "zh": "椰子、热带水果、新鲜海鲜和地坑烹制的菜肴",
    "ja": "ココナッツ、トロピカルフルーツ、新鮮なシーフード、地中で蒸し焼きにした料理",
    "hi": "नारियल, उष्णकटिबंधीय फल, ताज़ा समुद्री भोजन और मिट्टी में पके व्यंजन",
    "tr": "hindistan cevizi, tropikal meyveler, taze deniz ürünleri ve toprakta pişen yemekler",
    "it": "cocco, frutta tropicale, pesce fresco e piatti cotti nella terra",
    "ko": "코코넛, 열대 과일, 신선한 해산물 그리고 땅속에서 익힌 요리"
  },
  "global": {
    "en": "fresh, everyday ingredients and time-honoured techniques",
    "ro": "ingrediente proaspete, de zi cu zi, și tehnici de demult",
    "es": "ingredientes frescos del día a día y técnicas de toda la vida",
    "fr": "des produits frais du quotidien et des savoir-faire transmis de génération en génération",
    "de": "frische Alltagszutaten und bewährte Techniken",
    "pt": "ingredientes frescos do dia a dia e técnicas consagradas pelo tempo",
    "ru": "свежие повседневные продукты и проверенные временем техники",
    "ar": "مكونات طازجة يومية وتقنيات عريقة",
    "zh": "新鲜的日常食材和世代相传的烹饪技艺",
    "ja": "新鮮で身近な食材と、長く受け継がれてきた調理法",
    "hi": "ताज़ी, रोज़मर्रा की सामग्री और सदियों पुरानी पाक तकनीकें",
    "tr": "taze, gündelik malzemeler ve köklü teknikler",
    "it": "ingredienti freschi di tutti i giorni e tecniche tramandate nel tempo",
    "ko": "신선한 일상 식재료와 오랜 세월 다듬어진 조리법"
  }
};

export const CUISINE_HUB_PROSE = {
  "en": {
    "flavoursH": "Flavours of {country}",
    "flavoursP": "The cuisine of {country} is built on {flavours}. The {n} recipes gathered on this page lean on those everyday building blocks, so you can bring an authentic taste of {country} to your own kitchen without hunting down hard-to-find ingredients or specialist equipment. Each one keeps the techniques approachable while staying true to the way the dish is traditionally made.",
    "exploreH": "What you can cook here",
    "exploreP": "Browse dishes such as {dishes}. Each recipe opens with a complete, measured ingredient list, then walks you through the method one clear step at a time, with cooking times and per-serving nutrition so you always know exactly what is on the plate. Whether you want a quick midweek dinner or a dish to linger over at the weekend, there is something here worth cooking next.",
    "ctaH": "Add {country} to your week",
    "ctaP": "Every recipe here is portioned for a household and slots neatly into a balanced week — light enough for a busy weeknight, generous enough for a relaxed weekend cook-up. Pick a few favourites from {country}, add them to your free weekly meal plan, and we will fold every ingredient into one organised shopping list so the cooking is the only part left to do.",
    "ctaBtn": "Build my weekly meal plan"
  },
  "ro": {
    "flavoursH": "Aromele din {country}",
    "flavoursP": "Bucătăria din {country} se construiește pe {flavours}. Cele {n} rețete adunate pe această pagină pornesc de la aceste ingrediente de fiecare zi, așa că poți aduce un gust autentic, de {country}, în propria bucătărie, fără să cauți ingrediente greu de găsit sau ustensile speciale. Fiecare păstrează tehnicile la îndemâna oricui și rămâne fidelă felului în care se face preparatul după rețeta de acasă.",
    "exploreH": "Ce poți găti aici",
    "exploreP": "Răsfoiește preparate precum {dishes}. Fiecare rețetă pornește de la o listă completă de ingrediente, cu cantitățile măsurate, apoi te poartă prin metodă pas cu pas, limpede, cu timpii de gătit și valorile nutriționale pentru o porție, ca să știi tot timpul exact ce ai în farfurie. Fie că ai chef de o cină rapidă în mijlocul săptămânii sau de un preparat peste care să zăbovești în weekend, găsești aici ceva ce merită gătit data viitoare.",
    "ctaH": "Adaugă {country} în săptămâna ta",
    "ctaP": "Fiecare rețetă de aici este porționată pentru o familie și se așază firesc într-o săptămână echilibrată: destul de ușoară pentru o seară încărcată și destul de generoasă pentru o găteală tihnită de weekend. Alege câteva preferate din {country}, pune-le în planul tău săptămânal de mese, gratuit, iar noi strângem fiecare ingredient într-o singură listă de cumpărături, pusă în ordine, ca tot ce-ți mai rămâne de făcut să fie gătitul.",
    "ctaBtn": "Creează planul meu săptămânal de mese"
  },
  "es": {
    "flavoursH": "{country}: sus sabores",
    "flavoursP": "{country}: su cocina se construye sobre {flavours}. Las {n} recetas reunidas en esta página se apoyan en esos pilares de cada día, para que puedas llevar su auténtico sabor a tu propia cocina sin perseguir ingredientes difíciles de encontrar ni equipos especiales. Cada una mantiene las técnicas al alcance de cualquiera, sin dejar de ser fiel a la manera tradicional de preparar el plato.",
    "exploreH": "Qué puedes cocinar aquí",
    "exploreP": "Explora platos como {dishes}. Cada receta empieza con una lista de ingredientes completa y bien medida, y luego te guía por el método paso a paso, con total claridad, indicando los tiempos de cocción y la información nutricional por ración para que siempre sepas exactamente qué hay en el plato. Tanto si buscas una cena rápida entre semana como un plato para disfrutar con calma el fin de semana, aquí encontrarás algo que merece la pena preparar.",
    "ctaH": "Lleva {country} a tu semana",
    "ctaP": "Todas las recetas de esta página están pensadas en raciones para toda la casa y encajan a la perfección en una semana equilibrada: ligeras para una noche ajetreada entre semana y generosas para una sesión de cocina tranquila el fin de semana. Elige unas cuantas recetas favoritas, añade {country} a tu plan de comidas semanal gratuito y nosotros reuniremos cada ingrediente en una única lista de la compra bien organizada, para que cocinar sea lo único que te quede por hacer.",
    "ctaBtn": "Crear mi plan de comidas semanal"
  },
  "fr": {
    "flavoursH": "{country} : les saveurs du pays",
    "flavoursP": "{country} : une cuisine bâtie sur {flavours}. Les {n} recettes réunies sur cette page s'appuient sur ces gestes et ces produits du quotidien, pour que vous puissiez retrouver chez vous le goût authentique de cette table sans courir après des ingrédients introuvables ni un matériel de spécialiste. Chacune reste simple à exécuter tout en respectant la façon dont le plat se prépare traditionnellement.",
    "exploreH": "Ce que vous pouvez cuisiner ici",
    "exploreP": "Au menu, des plats comme {dishes}. Chaque recette débute par une liste d'ingrédients complète et bien pesée, puis vous accompagne pas à pas dans sa préparation, temps de cuisson et valeurs nutritionnelles par portion à l'appui, pour que vous sachiez toujours exactement ce que vous mettez dans l'assiette. Un dîner vite prêt en pleine semaine ou un plat à savourer sans se presser le week-end : vous trouverez forcément ici de quoi passer aux fourneaux.",
    "ctaH": "Invitez {country} dans votre semaine",
    "ctaP": "Chaque recette est calibrée pour toute une tablée et trouve naturellement sa place dans une semaine équilibrée : assez légère pour un soir pressé, assez généreuse pour un repas tranquille du week-end. Mettez {country} à l'honneur : choisissez quelques-uns de ses plats, ajoutez-les à votre plan de repas hebdomadaire gratuit, et nous rassemblerons tous leurs ingrédients dans une seule liste de courses bien rangée : il ne vous restera plus qu'à cuisiner.",
    "ctaBtn": "Créer mon plan de repas hebdomadaire"
  },
  "de": {
    "flavoursH": "{country}: Aromen einer Küche",
    "flavoursP": "{country} — diese Küche baut auf {flavours} auf. Die {n} Rezepte auf dieser Seite setzen genau auf diese alltäglichen Grundzutaten, sodass Sie sich ein Stück dieser Küche in die eigene Küche holen können, ohne nach schwer erhältlichen Zutaten oder einer Spezialausrüstung suchen zu müssen. Jedes Rezept bleibt in der Zubereitung unkompliziert und hält sich zugleich an die Art, wie das Gericht traditionell gekocht wird.",
    "exploreH": "Was Sie hier kochen können",
    "exploreP": "Stöbern Sie durch Gerichte wie {dishes}. Jedes Rezept beginnt mit einer vollständigen, abgemessenen Zutatenliste und führt Sie dann Schritt für Schritt klar durch die Zubereitung, mit Garzeiten und Nährwerten pro Portion, sodass Sie immer genau wissen, was auf dem Teller landet. Ob Sie ein schnelles Abendessen unter der Woche suchen oder ein Gericht, das Sie am Wochenende in Ruhe genießen möchten, hier finden Sie bestimmt Ihr nächstes Lieblingsgericht.",
    "ctaH": "Holen Sie sich {country} in Ihre Woche",
    "ctaP": "Jedes Rezept hier ist für einen Haushalt portioniert und fügt sich nahtlos in eine ausgewogene Woche ein, leicht genug für einen vollen Wochentag und großzügig genug für ein entspanntes Kochen am Wochenende. Suchen Sie sich ein paar Favoriten aus dieser Auswahl aus, fügen Sie sie Ihrem kostenlosen Wochenplan hinzu, und wir fassen jede einzelne Zutat zu einer übersichtlichen Einkaufsliste zusammen, sodass am Ende nur noch das Kochen übrig bleibt. Bringen Sie {country} auf den Teller.",
    "ctaBtn": "Meinen Wochenplan erstellen"
  },
  "pt": {
    "flavoursH": "{country}: os sabores que dão o tom",
    "flavoursP": "{country}: na sua cozinha, tudo assenta em {flavours}. As {n} receitas reunidas nesta página apoiam-se precisamente nesses ingredientes do dia a dia, para que possa trazer esse sabor autêntico à sua cozinha sem andar à procura de produtos raros ou de equipamento especializado. Cada uma mantém as técnicas ao alcance de qualquer pessoa, sem nunca trair a forma como o prato é tradicionalmente feito.",
    "exploreH": "O que pode cozinhar aqui",
    "exploreP": "Percorra pratos como {dishes}. Cada receita abre com uma lista completa de ingredientes já medidos e depois guia-o pelo método, um passo claro de cada vez, com os tempos de cozedura e a informação nutricional por dose, para que saiba sempre ao certo o que tem no prato. Quer procure um jantar rápido a meio da semana ou um prato para saborear com calma ao fim de semana, há aqui sempre algo que vale a pena cozinhar a seguir.",
    "ctaH": "Leve {country} para a sua semana",
    "ctaP": "Todas as receitas aqui vêm doseadas para uma família e encaixam-se sem esforço numa semana equilibrada: leves o suficiente para uma noite atarefada, generosas o suficiente para uma cozinhada descontraída de fim de semana. {country} na sua mesa: escolha algumas favoritas, junte-as ao seu plano semanal de refeições gratuito e nós reunimos todos os ingredientes numa única lista de compras organizada, para que cozinhar seja a única coisa que lhe resta fazer.",
    "ctaBtn": "Criar o meu plano semanal de refeições"
  },
  "ru": {
    "flavoursH": "Вкусы кухни — {country}",
    "flavoursP": "Кухня — {country}: в её основе такие продукты, как {flavours}. Собранные на этой странице рецепты ({n} шт.) построены на этих повседневных основах, поэтому подлинный вкус здешней кухни вы сможете воссоздать у себя дома, не разыскивая редких ингредиентов и без специального оборудования. Каждый рецепт делает технику доступной, оставаясь верным традиционному способу приготовления блюда.",
    "exploreH": "Что здесь можно приготовить",
    "exploreP": "Откройте для себя такие блюда, как {dishes}. Каждый рецепт начинается с полного списка ингредиентов с точными мерами, а затем понятно проведёт вас по каждому шагу — с указанием времени приготовления и пищевой ценности на порцию, так что вы всегда точно знаете, что у вас на тарелке. Нужен ли вам быстрый ужин в будний день или блюдо, которым можно неспешно насладиться в выходные, — здесь обязательно найдётся то, что стоит приготовить следующим.",
    "ctaH": "Спланируйте неделю в стиле {country}",
    "ctaP": "Каждый собранный здесь рецепт рассчитан на семью и легко вписывается в сбалансированную неделю — достаточно лёгкий для занятого буднего вечера и достаточно сытный для неспешной готовки в выходные. Выберите несколько любимых блюд из кухни — {country} — добавьте их в свой бесплатный план питания на неделю, а мы сведём все ингредиенты в один удобный список покупок, чтобы вам осталось только готовить.",
    "ctaBtn": "Составить мой план питания"
  },
  "ar": {
    "flavoursH": "نكهات {country}",
    "flavoursP": "يقوم مطبخ {country} على {flavours}. تستند الوصفات الـ{n} المجمّعة في هذه الصفحة إلى هذه الأسس اليومية، حتى تتمكن من استحضار مذاق {country} الأصيل في مطبخك دون البحث عن مكونات يصعب إيجادها أو معدات متخصصة. تبقي كل وصفة التقنيات في متناول الجميع، مع وفاء كامل للطريقة التقليدية في تحضير الطبق.",
    "exploreH": "ما يمكنك طهيه هنا",
    "exploreP": "تصفّح أطباقاً مثل {dishes}. تبدأ كل وصفة بقائمة مكونات كاملة بمقادير مضبوطة، ثم ترشدك خلال طريقة التحضير خطوة واضحة تلو الأخرى، مع أوقات الطهي والقيمة الغذائية لكل حصة حتى تعرف دائماً ما الذي في طبقك بالضبط. وسواء أردت عشاءً سريعاً في منتصف الأسبوع أو طبقاً تتأنى في إعداده في عطلة نهاية الأسبوع، فستجد هنا ما يستحق أن تطهوه تالياً.",
    "ctaH": "أضف {country} إلى أسبوعك",
    "ctaP": "كل وصفة هنا بحصص تكفي العائلة وتندمج بسلاسة في أسبوع متوازن، خفيفة بما يكفي لليلة عمل مزدحمة، وسخية بما يكفي لطهي مريح في عطلة نهاية الأسبوع. اختر بعضاً من أطباق {country} المفضلة لديك، وأضفها إلى خطة وجباتك الأسبوعية المجانية، وسنجمع كل المكونات في قائمة تسوّق واحدة منظمة، فلا يبقى أمامك سوى الطهي.",
    "ctaBtn": "أنشئ خطة وجباتي الأسبوعية"
  },
  "zh": {
    "flavoursH": "{country}风味",
    "flavoursP": "{country}美食以{flavours}为根基。本页汇集的 {n} 道食谱正是从这些寻常的基础食材入手，让你不必四处搜罗难买的配料或专业设备，就能在自家厨房做出地道的{country}风味。每道菜都在保留传统做法的同时，把技法讲得平易近人，让你轻松上手。",
    "exploreH": "你可以在这里做哪些菜",
    "exploreP": "不妨看看{dishes}这类菜肴。每道食谱开篇便附上完整、精确计量的配料清单，再用清晰的步骤一步步教你完成，并标注烹饪时间和每份的营养信息，让你随时清楚盘中究竟有什么。无论你想要工作日里的一顿快手晚餐，还是周末可以慢慢享用的一道菜，这里总有值得你下次一试的好选择。",
    "ctaH": "把{country}排进你这一周",
    "ctaP": "说到{country}，这里的每道菜都按一家人的份量配制，能恰到好处地融入均衡的一周——分量适合忙碌的工作日晚间，也足够周末轻松地大展身手。挑几道你喜欢的菜，加入你的免费每周膳食计划，我们会把所有配料整合成一份井井有条的购物清单，让你只需专心下厨。",
    "ctaBtn": "生成我的每周膳食计划"
  },
  "ja": {
    "flavoursH": "{country}料理の味わい",
    "flavoursP": "{country}料理は、{flavours}を土台に成り立っています。このページに集めた{n}品のレシピは、そうした身近な日常の素材を活かしているので、手に入りにくい食材や特別な道具をそろえなくても、ご家庭で本格的な{country}の味を楽しめます。どのレシピも、その料理が本来作られてきた手順を大切にしながら、家庭でも無理なく作れるように調理法を整えています。",
    "exploreH": "ここで作れる料理",
    "exploreP": "{dishes}といった料理が並びます。どのレシピも、分量まで明記した材料リストから始まり、一つひとつの工程をわかりやすく追っていけます。調理時間や一人分の栄養価も添えているので、お皿に何がのっているのかが常にはっきりわかります。平日にさっと作りたい夕食にも、週末にじっくり向き合いたい一品にも、次に作ってみたくなる料理がきっと見つかります。",
    "ctaH": "{country}の料理を今週の献立に",
    "ctaP": "ここに並ぶ{country}のレシピはどれも家庭向けの分量で、バランスのとれた一週間にちょうどよく収まります。忙しい平日にも手ごろで、のんびり過ごす週末の料理にも十分なボリュームです。お気に入りの{country}料理をいくつか選んで無料の週間献立に加えれば、すべての材料を一つにまとめた買い物リストをご用意します。あとは料理を楽しむだけです。",
    "ctaBtn": "週間献立を作る"
  },
  "hi": {
    "flavoursH": "{country} के व्यंजनों के स्वाद",
    "flavoursP": "{country} का खानपान {flavours} पर आधारित है। इस पृष्ठ पर एकत्रित {n} व्यंजन इन्हीं रोज़मर्रा की बुनियादी सामग्रियों पर टिके हैं, ताकि आप मुश्किल से मिलने वाली सामग्री या किसी ख़ास उपकरण की तलाश किए बिना अपनी रसोई में {country} का असली स्वाद ला सकें। हर व्यंजन की तकनीकें इतनी सरल रखी गई हैं कि कोई भी आसानी से बना सके, फिर भी हर व्यंजन उसी पारंपरिक तरीके के प्रति सच्चा रहता है जिससे वह बनता आया है।",
    "exploreH": "यहाँ आप क्या पका सकते हैं",
    "exploreP": "{dishes} जैसे व्यंजन देखें। हर रेसिपी एक पूरी, नापी-तौली सामग्री की सूची से शुरू होती है, फिर एक-एक साफ़ चरण में विधि समझाती है, साथ में पकाने का समय और प्रति-सर्विंग पोषण भी देती है, ताकि आपको हमेशा पता रहे कि थाली में आख़िर क्या परोसा जा रहा है। चाहे आप हफ़्ते के बीच झटपट बनने वाला डिनर चाहें या वीकेंड पर इत्मीनान से तैयार होने वाला कोई व्यंजन, यहाँ अगली बार पकाने लायक कुछ न कुछ ज़रूर मिलेगा।",
    "ctaH": "{country} को अपने हफ़्ते में जोड़ें",
    "ctaP": "यहाँ की हर रेसिपी एक परिवार के हिसाब से तैयार की गई है और एक संतुलित हफ़्ते में बखूबी फिट हो जाती है — व्यस्त कार्यदिवस के लिए हल्की, और आरामदेह वीकेंड की पकवान-दावत के लिए भरपूर। {country} के अपने कुछ पसंदीदा व्यंजन चुनें, उन्हें अपनी मुफ़्त साप्ताहिक भोजन योजना में जोड़ें, और हम हर सामग्री को एक व्यवस्थित खरीदारी सूची में पिरो देंगे, ताकि बस पकाना ही बाक़ी रह जाए।",
    "ctaBtn": "मेरी साप्ताहिक भोजन योजना बनाएँ"
  },
  "tr": {
    "flavoursH": "{country} mutfağının lezzetleri",
    "flavoursP": "{country} mutfağı {flavours} üzerine kuruludur. Bu sayfada bir araya getirilen {n} tarif, işte bu gündelik temel malzemelerden yola çıkar; böylece bulunması zor malzemelerin ya da özel ekipmanların peşinde koşmadan kendi mutfağınıza gerçek bir {country} lezzetini taşıyabilirsiniz. Her tarif, teknikleri kolayca uygulanabilir tutarken yemeğin geleneksel yapılış biçimine de sadık kalır.",
    "exploreH": "Burada neler pişirebilirsiniz",
    "exploreP": "{dishes} gibi yemekleri keşfedin. Her tarif, eksiksiz ve ölçülerle verilmiş bir malzeme listesiyle başlar; ardından yöntemi adım adım, sade bir dille anlatır. Pişirme süreleri ve porsiyon başına besin değerleri sayesinde tabağınızda tam olarak ne olduğunu her zaman bilirsiniz. İster hafta içine yetişecek hızlı bir akşam yemeği arayın, ister hafta sonu keyifle başında durabileceğiniz bir yemek; burada mutlaka pişirmek isteyeceğiniz bir tarif bulacaksınız.",
    "ctaH": "{country} mutfağını haftanıza ekleyin",
    "ctaP": "Buradaki tariflerin her biri bir hane halkına göre porsiyonlanmıştır ve dengeli bir haftaya rahatça oturur; yoğun bir hafta içi akşamı için yeterince hafif, keyifli bir hafta sonu pişirmesi için yeterince doyurucu. {country} mutfağından birkaç favorinizi seçin, ücretsiz haftalık yemek planınıza ekleyin; biz de bütün malzemeleri düzenli tek bir alışveriş listesinde toplayalım, geriye yalnızca pişirmek kalsın.",
    "ctaBtn": "Haftalık yemek planımı oluştur"
  },
  "it": {
    "flavoursH": "{country}: i suoi sapori",
    "flavoursP": "{country}: qui la cucina si fonda su {flavours}. Le {n} ricette raccolte in questa pagina partono proprio da questi ingredienti di tutti i giorni, così puoi portare in tavola un sapore autentico e genuino senza dover rincorrere ingredienti introvabili o attrezzature da professionisti. Ognuna mantiene le tecniche alla portata di chiunque, restando fedele al modo in cui il piatto viene preparato per tradizione.",
    "exploreH": "Cosa puoi cucinare qui",
    "exploreP": "Scopri piatti come {dishes}. Ogni ricetta si apre con un elenco completo di ingredienti con le dosi precise, poi ti accompagna nel procedimento un passaggio chiaro alla volta, con i tempi di cottura e i valori nutrizionali per porzione, così sai sempre con esattezza cosa hai nel piatto. Che tu cerchi una cena veloce per una sera infrasettimanale o un piatto da assaporare con calma nel weekend, qui trovi sempre qualcosa che vale la pena cucinare.",
    "ctaH": "Aggiungi {country} alla tua settimana",
    "ctaP": "Ogni ricetta è porzionata per tutta la famiglia e si inserisce alla perfezione in una settimana equilibrata: leggera quanto basta per una sera di corsa, generosa quanto basta per una cucinata in tutta tranquillità nel weekend. Scegli i tuoi piatti preferiti tra quelli proposti per {country}, aggiungili al tuo piano pasti settimanale gratuito e penseremo noi a riunire ogni ingrediente in un'unica lista della spesa ben organizzata, così l'unica cosa che ti resta da fare è cucinare.",
    "ctaBtn": "Crea il mio piano pasti settimanale"
  },
  "ko": {
    "flavoursH": "{country} 요리의 맛",
    "flavoursP": "{country} 요리는 {flavours}에서 출발합니다. 이 페이지에 모은 {n}가지 레시피는 이런 일상적인 기본 재료에 기대고 있어, 구하기 힘든 식재료나 특별한 장비를 찾아 헤맬 필요 없이 {country} 특유의 맛을 집에서 그대로 낼 수 있습니다. 각 레시피는 조리법을 누구나 따라 할 수 있게 쉽게 풀어내면서도, 그 음식이 전통적으로 만들어지는 방식에 충실합니다.",
    "exploreH": "여기서 만들 수 있는 요리",
    "exploreP": "{dishes} 같은 요리를 둘러보세요. 각 레시피는 정확히 계량된 완전한 재료 목록으로 시작해, 한 번에 한 단계씩 명확하게 조리법을 안내하며, 조리 시간과 1인분 영양 정보까지 곁들여 접시에 무엇이 담기는지 늘 정확히 알 수 있습니다. 바쁜 평일의 빠른 저녁 한 끼를 원하든, 주말에 느긋하게 즐길 요리를 원하든, 다음에 만들어 볼 만한 것이 여기 있습니다.",
    "ctaH": "{country} 식단 한 주 계획하기",
    "ctaP": "여기 실린 레시피는 한 가정에 맞게 분량이 정해져 있어 균형 잡힌 한 주에 자연스럽게 들어맞습니다. 바쁜 평일 저녁에 알맞게 가볍고, 여유로운 주말 요리에 넉넉할 만큼 푸짐하죠. {country}에서 마음에 드는 몇 가지를 골라 무료 주간 식단에 추가하면, 모든 재료를 정리된 장보기 목록 하나로 모아 드려 이제 요리만 하면 됩니다.",
    "ctaBtn": "내 주간 식단 만들기"
  }
};
