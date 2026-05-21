with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add hi to origin
content = content.replace(
    '      ko: "베네수엘라"\n    },\n    name: {\n      ro: "Arepa"',
    '      ko: "베네수엘라",\n      hi: "वेनेज़ुएला"\n    },\n    name: {\n      ro: "Arepa"'
)

# Add hi to name
content = content.replace(
    '      ko: "아레파"\n    },\n    category: {\n      ro: "Mic dejun"',
    '      ko: "아레파",\n      hi: "अरेपा"\n    },\n    category: {\n      ro: "Mic dejun"'
)

# Add hi to category — Arepa is Breakfast/Mic dejun
content = content.replace(
    '      ko: "아침"\n    },\n    servings: 4,\n    tipType: \'veg\',\n    pairingsType: \'veg\',\n    ingredients: {\n      ro: ["făină de porumb"',
    '      ko: "아침",\n      hi: "नाश्ता"\n    },\n    servings: 4,\n    tipType: \'veg\',\n    pairingsType: \'veg\',\n    ingredients: {\n      ro: ["făină de porumb"'
)

# Add hi to ingredients
content = content.replace(
    '      ko: ["옥수수 가루", "물", "소금", "기름", "원하는 속재료"]\n    },\n    howIsMade: {',
    '      ko: ["옥수수 가루", "물", "소금", "기름", "원하는 속재료"],\n      hi: ["मक्के का आटा", "पानी", "नमक", "तेल", "पसंदीदा भराई"]\n    },\n    howIsMade: {'
)

# Add hi to howIsMade
content = content.replace(
    '      ko: "옥수수 가루에 물과 소금을 넣어 반죽하고 납작하게 빚어 그릴 또는 오븐에 굽습니다. 원하는 속재료를 채워 완성합니다."\n    },\n    originText: {\n      ro: "Arepa este',
    '      ko: "옥수수 가루에 물과 소금을 넣어 반죽하고 납작하게 빚어 그릴 또는 오븐에 굽습니다. 원하는 속재료를 채워 완성합니다.",\n      hi: "मक्के के आटे को पानी और नमक से गूंधें, चपटे गोल बनाएं, तवे पर या ओवन में पकाएं, फिर इच्छानुसार भरें।"\n    },\n    originText: {\n      ro: "Arepa este'
)

# Replace originText
old_origin = '''    originText: {
      ro: "Arepa este o rețetă tradițională din Venezuela.",
      en: "Arepa is a traditional recipe from Venezuela.",
      es: "Arepa es una receta tradicional de Venezuela.",
      fr: "Arepa est une recette traditionnelle du Venezuela.",
      de: "Arepa ist ein traditionelles Rezept aus Venezuela.",
      pt: "Arepa é uma receita tradicional da Venezuela.",
      ru: "Арепа — традиционный рецепт из Венесуэлы.",
      ar: "أريبا هي وصفة تقليدية من فنزويلا.",
      zh: "委内瑞拉玉米饼 是来自委内瑞拉的传统食谱。",
      ja: "アレパ はベネズエラの伝統的なレシピです。",
      tr: "Arepa Venezuela kökenli geleneksel bir tariftir.",
      it: "Arepa è una ricetta tradizionale del Venezuela.",
      ko: "아레파는 베네수엘라의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Arepa este piatra de temelie a vieții cotidiene din Venezuela și Columbia — un disc gros de mălai alb prefiart, aplatizat și copt pe plită până când exteriorul devine crocant, iar interiorul rămâne moale. Dovezile arheologice plasează aluaturile plate pe bază de porumb în dieta popoarelor indigene din Anzi și coasta Caraibilor cu mii de ani înainte de contactul european.\\n\\nÎn Venezuela, arepas sunt tăiate pe jumătate ca un sandviș și umplute: carne rasă și avocado pentru clasica reina pepiada, sau fasole neagră, brânză și perico. Fiecare gospodărie are umplutura preferată; nicio două nu sunt identice.",
      en: "The arepa is a cornerstone of Venezuelan and Colombian daily life — a thick round of pre-cooked white cornmeal, patted flat and cooked on a griddle until the outside crisps and the inside stays soft. Archaeological evidence places corn-based flat cakes in the diets of indigenous peoples across the Andes and Caribbean coast for thousands of years.\\n\\nIn Venezuela, arepas are split open like a pocket and stuffed: shredded beef and avocado for the classic reina pepiada, or black beans, cheese, and perico — scrambled eggs with tomato and pepper. Every household has its favoured filling; no two are identical.",
      es: "La arepa es un pilar de la vida cotidiana venezolana y colombiana — un disco grueso de harina de maíz precocida, aplastado y cocinado en plancha hasta que el exterior se vuelve crujiente y el interior permanece suave. Evidencias arqueológicas sitúan los pasteles planos de maíz en la dieta de los pueblos indígenas de los Andes y el Caribe desde hace miles de años.\\n\\nEn Venezuela, las arepas se abren como un bolsillo y se rellenan: carne mechada y aguacate para la clásica reina pepiada, o frijoles negros, queso y perico. Cada hogar tiene su relleno favorito.",
      fr: "L'arepa est un pilier de la vie quotidienne vénézuélienne et colombienne — un disque épais de farine de maïs précuite, aplati et cuit sur une plaque jusqu'à ce que l'extérieur croustille et l'intérieur reste moelleux. Des preuves archéologiques placent les galettes à base de maïs dans le régime des peuples indigènes des Andes et des Caraïbes depuis des millénaires.\\n\\nAu Venezuela, les arepas sont ouvertes comme une poche et garnies : viande effilée et avocat pour la classique reina pepiada, ou haricots noirs, fromage et perico. Chaque foyer a son garniture préférée.",
      de: "Die Arepa ist ein Grundpfeiler des venezolanischen und kolumbianischen Alltags — eine dicke Scheibe aus vorgekochtem weißen Maismehl, flach gedrückt und auf einem Grill gebacken, bis außen eine Kruste entsteht und innen weich bleibt. Archäologische Belege zeigen, dass maisbasierte Fladenbrote seit Jahrtausenden zur Ernährung indigener Völker in den Anden und der Karibik gehören.\\n\\nIn Venezuela werden Arepas wie eine Tasche aufgeschnitten und gefüllt: zerrupftes Fleisch und Avocado für die klassische Reina Pepiada, oder schwarze Bohnen, Käse und Perico. Jeder Haushalt hat seine Lieblingsfüllung.",
      pt: "A arepa é uma base da vida cotidiana venezuelana e colombiana — um disco espesso de fubá pré-cozido, achatado e assado numa chapa até a parte exterior ficar crocante e o interior permanecer macio. Evidências arqueológicas colocam os bolos planos de milho na dieta dos povos indígenas dos Andes e do litoral caribenho há milhares de anos.\\n\\nNa Venezuela, as arepas são abertas como um bolso e recheadas: carne desfiada e abacate para a clássica reina pepiada, ou feijão preto, queijo e perico. Cada lar tem o seu recheio preferido.",
      ru: "Арепа — краеугольный камень повседневной жизни Венесуэлы и Колумбии: толстый диск из предварительно приготовленной белой кукурузной муки, приплюснутый и поджаренный на сковороде до хрустящей корочки снаружи и мягкой серединки. Археологические данные свидетельствуют, что кукурузные лепёшки составляли рацион коренных народов Анд и Карибского побережья тысячелетиями.\\n\\nВ Венесуэле арепу разрезают как карман и начиняют: тушёная говядина и авокадо для классической рейна-пепиада, или чёрные бобы, сыр и перико. В каждом доме своя любимая начинка.",
      ar: "الأريبا حجر الأساس في الحياة اليومية الفنزويلية والكولومبية — قرص سميك من دقيق الذرة المطهو مسبقاً، يُسطَّح ويُطهى على الصاج حتى يتحمص الخارج ويبقى الداخل طرياً. تشير الأدلة الأثرية إلى أن أقراص الذرة المسطحة كانت في غذاء شعوب الأنديز والساحل الكاريبي منذ آلاف السنين.\\n\\nفي فنزويلا، تُشقّ الأريبا كجيب وتُحشى بمواد متنوعة: اللحم المفروم والأفوكادو للنسخة الكلاسيكية ريينا بيبيادا، أو الفاصوليا السوداء والجبن والبيريكو. لكل بيت حشوته المفضلة.",
      zh: "阿雷帕是委内瑞拉和哥伦比亚日常生活的基石——一块厚实的预熟白玉米粉饼，拍平后在铁板上烤至外皮酥脆、内里绵软。考古证据表明，以玉米为原料的薄饼在安第斯山脉和加勒比海岸原住民的饮食中已有数千年历史。\\n\\n在委内瑞拉，阿雷帕被像口袋一样切开后塞入馅料：撕碎的牛肉配牛油果是经典的「女王」款，或者黑豆、奶酪和perico（加番茄辣椒炒蛋）。每个家庭都有自己最爱的馅料，没有两个完全相同的。",
      ja: "アレパはベネズエラとコロンビアの日常生活の礎——事前調理した白いコーンミールの厚めの円盤を平らに成形し、鉄板で焼いて外はパリッと、中はふんわり仕上げます。とうもろこしを使った薄焼きパンがアンデス山脈やカリブ海沿岸の先住民の食事に含まれていた証拠は、数千年前にまでさかのぼります。\\n\\nベネズエラではアレパをポケット状に切り開いて詰め物をします。クラシックな「レイナ・ペピアダ」は割き肉とアボカド、または黒豆・チーズ・ペリコ（スクランブルエッグ）という組み合わせが定番です。家ごとにお気に入りの具材があります。",
      tr: "Arepa, Venezuela ve Kolombiya günlük yaşamının temel taşıdır — önceden pişirilmiş beyaz mısır unuyla hazırlanan kalın bir disk şeklinde; tavada dışı çıtır, içi yumuşak kalana kadar pişirilir. Arkeolojik bulgular, mısır bazlı yassı ekmeklerin Andlar ve Karayip kıyısı boyunca binlerce yıl önce yaşayan yerli halkların diyetinde yer aldığını göstermektedir.\\n\\nVenezuela'da arepalar cep gibi yarılır ve doldurulur: klasik reina pepiada için parçalanmış et ve avokado ya da siyah fasulye, peynir ve perico. Her hanenin favori dolgusu farklıdır.",
      it: "L'arepa è una pietra angolare della vita quotidiana venezuelana e colombiana — un disco spesso di farina di mais precotta, appiattito e cotto su una piastra fino a quando l'esterno diventa croccante e l'interno rimane morbido. Le prove archeologiche collocano le focacce a base di mais nella dieta dei popoli indigeni delle Ande e del Caribe da migliaia di anni.\\n\\nIn Venezuela, le arepas vengono aperte come una tasca e farcite: carne sfilacciata e avocado per la classica reina pepiada, o fagioli neri, formaggio e perico. Ogni famiglia ha il suo ripieno preferito.",
      ko: "아레파는 베네수엘라와 콜롬비아 일상생활의 초석입니다. 미리 익힌 흰 옥수수 가루로 만든 두툼한 원형 반죽을 납작하게 펴서 그릴에 구우면 겉은 바삭하고 속은 부드럽습니다. 고고학적 증거에 따르면 옥수수 기반 납작빵은 안데스와 카리브해 연안 원주민들의 식단에 수천 년 전부터 등장했습니다.\\n\\n베네수엘라에서는 아레파를 주머니처럼 갈라 속재료를 채웁니다. 클래식 레이나 페피아다는 찢은 쇠고기와 아보카도, 또는 검정콩·치즈·페리코(스크램블 에그)가 들어갑니다. 집집마다 즐겨 먹는 속재료가 다릅니다.",
      hi: "अरेपा वेनेज़ुएला और कोलंबिया के दैनिक जीवन की आधारशिला है — पहले से पके सफेद मक्के के आटे का एक मोटा गोल टुकड़ा, जिसे तवे पर बाहर से कुरकुरा और अंदर से नरम होने तक पकाया जाता है। पुरातात्विक साक्ष्य बताते हैं कि मक्के पर आधारित चपटी रोटियाँ हज़ारों वर्षों से एंडीज और कैरिबियन तट के आदिवासी लोगों के भोजन में शामिल थीं।\\n\\nवेनेज़ुएला में अरेपा को जेब की तरह काटकर भरा जाता है: क्लासिक रेइना पेपियाडा के लिए कसा हुआ मांस और एवोकैडो, या काली फलियाँ, पनीर और पेरिको (टमाटर-मिर्च के साथ अंडे)। हर घर की पसंदीदा भराई अलग होती है।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 120 done")
