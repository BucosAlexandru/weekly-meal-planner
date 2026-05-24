#!/usr/bin/env python3
"""
One-shot script: replace recipe id 59 (Dalmatinska Pasticada — duplicate of
id 144 Pasticada) with Crni Rižot, the Dalmatian squid-ink risotto.

Croatia stays hub-eligible (still 2 recipes) but they're now genuinely
distinct dishes — Crni Rižot is seafood/rice, Pasticada is meat/braise.

Also:
  • recipes-meta.js   — replace meta entry 59 with Crni Rižot meta
  • app.js            — add 'Croația' to the mediterranean filter
                        so Crni Rižot is picked by random Mediterranean
                        autoplan generation
  • public/images/    — delete dalmatinska-pasticada.webp (orphan)

Run from repo root, then `npm run content` to regenerate HTML.
"""
import re
import sys
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent  # repo root (scripts/ → ..)

# ── Recipe data ──────────────────────────────────────────────────────
# r-string so \\n stays as 2 chars (literal backslash-n) — when written to
# recipes.js it lands as `\\n` inside a JS string, which JS interprets as
# a newline at runtime. A real newline in source would break the string.
NEW_RECIPE_JS = r'''    id: 59,
    servings: 4,
    tipType: 'fish',
    timeMins: { total: 50, active: 40 },
    pairingsType: 'mediterranean',
    origin: {
      ro: "Croația",
      en: "Croatia",
      es: "Croacia",
      fr: "Croatie",
      de: "Kroatien",
      pt: "Croácia",
      ru: "Хорватия",
      ar: "كرواتيا",
      zh: "克罗地亚",
      ja: "クロアチア",
      tr: "Hırvatistan",
      it: "Croazia",
      ko: "크로아티아"
    },
    name: {
      ro: "Crni Rižot",
      en: "Crni Rizot",
      es: "Crni Rižot",
      fr: "Crni Rižot",
      de: "Crni Rižot",
      pt: "Crni Rižot",
      ru: "Црни Рижот",
      ar: "تشرني ريجوت",
      zh: "克尔尼里索托",
      ja: "クルニ・リゾット",
      tr: "Crni Rižot",
      it: "Crni Rižot",
      ko: "츠르니 리조토",
      hi: "क्रनी रिज़ोटो"
    },
    category: {
      ro: "Cină",
      en: "Dinner",
      es: "Cena",
      fr: "Dîner",
      de: "Abendessen",
      pt: "Jantar",
      ru: "Ужин",
      ar: "عشاء",
      zh: "晚餐",
      ja: "夕食",
      tr: "Akşam yemeği",
      it: "Cena",
      ko: "저녁",
      hi: "रात का खाना"
    },
    ingredients: {
      ro: ["500 g calmari proaspeti sau decongelati, curatati, cu 2-3 saculeti de cerneala separati", "300 g orez arborio sau carnaroli", "1 ceapa medie (cca 150 g), tocata marunt", "3 catei de usturoi, tocati marunt", "100 ml vin alb sec dalmatian (sau Pošip)", "1 litru fond de peste cald (sau apa cu 1 cub de fond de peste)", "60 ml ulei de masline extravirgin", "30 g unt rece, taiat cubulete", "2 linguri patrunjel proaspat, tocat", "1/2 lamaie, doar zeama", "1 lingurita sare fina de mare", "1/2 lingurita piper negru macinat"],
      en: ["500 g fresh or thawed squid, cleaned, with 2-3 ink sacs reserved", "300 g arborio or carnaroli rice", "1 medium onion (about 150 g), finely chopped", "3 garlic cloves, finely minced", "100 ml dry Dalmatian white wine (or Pošip)", "1 litre warm fish stock (or water with 1 fish stock cube)", "60 ml extra-virgin olive oil", "30 g cold butter, cubed", "2 tbsp fresh parsley, chopped", "1/2 lemon, juice only", "1 tsp fine sea salt", "1/2 tsp ground black pepper"],
      es: ["500 g de calamares frescos o descongelados, limpios, con 2-3 bolsas de tinta reservadas", "300 g de arroz arborio o carnaroli", "1 cebolla mediana (unos 150 g), picada finamente", "3 dientes de ajo, picados finamente", "100 ml de vino blanco seco dálmata (o Pošip)", "1 litro de caldo de pescado caliente (o agua con 1 cubito de caldo de pescado)", "60 ml de aceite de oliva virgen extra", "30 g de mantequilla fría, en cubos", "2 cdas de perejil fresco, picado", "1/2 limón, solo el jugo", "1 cdta de sal marina fina", "1/2 cdta de pimienta negra molida"],
      fr: ["500 g de calmars frais ou décongelés, nettoyés, avec 2-3 poches d'encre réservées", "300 g de riz arborio ou carnaroli", "1 oignon moyen (environ 150 g), finement haché", "3 gousses d'ail, finement hachées", "100 ml de vin blanc sec dalmate (ou Pošip)", "1 litre de fumet de poisson chaud (ou eau avec 1 bouillon cube de poisson)", "60 ml d'huile d'olive extra vierge", "30 g de beurre froid, coupé en dés", "2 c. à soupe de persil frais, haché", "1/2 citron, jus seulement", "1 c. à café de sel fin de mer", "1/2 c. à café de poivre noir moulu"],
      de: ["500 g frische oder aufgetaute Tintenfische, geputzt, mit 2-3 zurückgehaltenen Tintensäckchen", "300 g Arborio- oder Carnaroli-Reis", "1 mittelgroße Zwiebel (ca. 150 g), fein gehackt", "3 Knoblauchzehen, fein gehackt", "100 ml trockener dalmatinischer Weißwein (oder Pošip)", "1 Liter heiße Fischbrühe (oder Wasser mit 1 Fischbouillonwürfel)", "60 ml natives Olivenöl extra", "30 g kalte Butter, gewürfelt", "2 EL frische Petersilie, gehackt", "1/2 Zitrone, nur den Saft", "1 TL feines Meersalz", "1/2 TL gemahlener schwarzer Pfeffer"],
      pt: ["500 g de lulas frescas ou descongeladas, limpas, com 2-3 sacos de tinta reservados", "300 g de arroz arborio ou carnaroli", "1 cebola média (cerca de 150 g), picada finamente", "3 dentes de alho, picados finamente", "100 ml de vinho branco seco dálmata (ou Pošip)", "1 litro de caldo de peixe morno (ou água com 1 cubo de caldo de peixe)", "60 ml de azeite extra-virgem", "30 g de manteiga fria, em cubos", "2 colheres de sopa de salsinha fresca, picada", "1/2 limão, apenas o suco", "1 colher de chá de sal marinho fino", "1/2 colher de chá de pimenta-do-reino moída"],
      ru: ["500 г свежих или размороженных кальмаров, очищенных, с 2-3 чернильными мешочками", "300 г риса арборио или карнароли", "1 средняя луковица (около 150 г), мелко нарезанная", "3 зубчика чеснока, мелко рубленных", "100 мл сухого далматинского белого вина (или Пошип)", "1 литр горячего рыбного бульона (или вода с 1 рыбным кубиком)", "60 мл оливкового масла extra virgin", "30 г холодного сливочного масла, нарезанного кубиками", "2 ст. л. свежей петрушки, нарубленной", "1/2 лимона, только сок", "1 ч. л. мелкой морской соли", "1/2 ч. л. молотого черного перца"],
      ar: ["500 غ كاليماري طازج أو مُذاب، منظف، مع الاحتفاظ بـ 2-3 أكياس حبر", "300 غ أرز أربوريو أو كارناولي", "1 بصلة متوسطة (نحو 150 غ)، مفرومة ناعمًا", "3 فصوص ثوم، مفرومة ناعمًا", "100 مل نبيذ أبيض دالماتي جاف (أو Pošip)", "1 لتر مرق سمك دافئ (أو ماء مع 1 مكعب مرق سمك)", "60 مل زيت زيتون بكر ممتاز", "30 غ زبدة باردة، مقطعة مكعبات", "2 ملعقة كبيرة بقدونس طازج، مفروم", "1/2 ليمونة، العصير فقط", "1 ملعقة صغيرة ملح بحري ناعم", "1/2 ملعقة صغيرة فلفل أسود مطحون"],
      zh: ["新鲜或解冻鱿鱼500克，清洗干净，保留2-3个墨囊", "阿尔伯里奥米或卡纳罗利米300克", "中等洋葱1个（约150克），切碎", "大蒜3瓣，切碎", "干白达尔马提亚葡萄酒（或Pošip）100毫升", "温热鱼高汤1升（或水加1块鱼汤块）", "特级初榨橄榄油60毫升", "冷黄油30克，切丁", "新鲜欧芹2大勺，切碎", "1/2个柠檬，只用汁", "细海盐1茶匙", "黑胡椒粉1/2茶匙"],
      ja: ["新鮮または解凍したイカ500g、内臓を取り、墨袋2〜3個を残す", "アルボリオ米またはカルナローリ米300g", "中玉ねぎ1個（約150g）、みじん切り", "にんにく3かけ、みじん切り", "辛口ダルマチア産白ワイン（またはPošip）100ml", "温かい魚のだし1リットル（または水と魚だしキューブ1個）", "エキストラバージンオリーブオイル60ml", "冷たいバター30g、角切り", "新鮮なパセリ大さじ2、みじん切り", "レモン1/2個、果汁のみ", "塩小さじ1", "黒こしょう小さじ1/2"],
      tr: ["500 g taze veya çözülmüş kalamar, temizlenmiş, 2-3 mürekkep kesesi ayrılmış", "300 g arborio veya carnaroli pirinci", "1 orta boy soğan (yaklaşık 150 g), ince doğranmış", "3 diş sarımsak, ince doğranmış", "100 ml kuru Dalmaçya beyaz şarabı (veya Pošip)", "1 litre sıcak balık suyu (veya su ile 1 balık bulyon küpü)", "60 ml sızma zeytinyağı", "30 g soğuk tereyağı, küp doğranmış", "2 yemek kaşığı taze maydanoz, doğranmış", "1/2 limon, sadece suyu", "1 çay kaşığı ince deniz tuzu", "1/2 çay kaşığı çekilmiş karabiber"],
      it: ["500 g di calamari freschi o scongelati, puliti, con 2-3 sacchetti di nero conservati", "300 g di riso arborio o carnaroli", "1 cipolla media (circa 150 g), tritata finemente", "3 spicchi d'aglio, tritati finemente", "100 ml di vino bianco secco dalmata (o Pošip)", "1 litro di brodo di pesce caldo (o acqua con 1 dado di pesce)", "60 ml di olio extravergine di oliva", "30 g di burro freddo, a cubetti", "2 cucchiai di prezzemolo fresco, tritato", "1/2 limone, solo il succo", "1 cucchiaino di sale marino fino", "1/2 cucchiaino di pepe nero macinato"],
      ko: ["신선하거나 해동한 오징어 500g, 손질 후 먹물주머니 2-3개 따로 보관", "아르보리오 또는 카르나롤리 쌀 300g", "중간 양파 1개(약 150g), 곱게 다진 것", "마늘 3쪽, 곱게 다진 것", "드라이 달마티아 화이트 와인(또는 Pošip) 100ml", "따뜻한 생선 육수 1리터(또는 물에 생선 육수 큐브 1개)", "엑스트라 버진 올리브유 60ml", "차가운 버터 30g, 큐브로 자른 것", "신선한 파슬리 2큰술, 다진 것", "레몬 1/2개, 즙만", "고운 바다 소금 1작은술", "갈아낸 흑후추 1/2작은술"],
      hi: ["ताज़ा या पिघले हुए स्क्विड 500 ग्राम, साफ किए, 2-3 स्याही की थैलियाँ अलग रखी", "अर्बोरियो या कार्नारोली चावल 300 ग्राम", "1 मध्यम प्याज (लगभग 150 ग्राम), बारीक कटा", "लहसुन की 3 कलियाँ, बारीक कटी", "सूखी डाल्मेटियन सफेद वाइन (या Pošip) 100 मिली", "गर्म मछली शोरबा 1 लीटर (या पानी में 1 मछली शोरबा क्यूब)", "एक्स्ट्रा वर्जिन जैतून का तेल 60 मिली", "ठंडा मक्खन 30 ग्राम, क्यूब में काटा", "ताज़ा अजमोद 2 बड़े चम्मच, कटा", "1/2 नींबू, केवल रस", "बारीक समुद्री नमक 1 छोटी चम्मच", "पिसी काली मिर्च 1/2 छोटी चम्मच"]
    },
    howIsMade: {
      ro: "Curata calmarii: indeparteaza capul si interiorul, pastreaza saculetii de cerneala intacti intr-un bol mic cu putina apa. Taie corpurile in inele de 1 cm si tentaculele in jumatate. Incinge 4 linguri de ulei de masline intr-o tigaie larga si grea la foc mediu. Adauga ceapa si gateste 4-5 minute pana se inmoaie. Adauga usturoiul si gateste inca 1 minut. Adauga inelele de calmar si tentaculele, soteaza 2-3 minute pana se albesc. Toarna vinul si lasa-l sa se evapore complet (cca 2 minute). Adauga orezul si amesteca 1 minut sa se acopere cu grasime. Adauga primul polonic de fond de peste fierbinte si amesteca constant. Pe masura ce lichidul se absoarbe, mai adauga cate un polonic, amestecand timp de 16-18 minute. La jumatate, sparge saculetii de cerneala in fondul ramas si toarna in tigaie — risotto-ul devine instant negru intens. Cand orezul e al dente si cremos (mai are putin lichid in tigaie), opreste focul. Adauga untul rece, restul de 2 linguri ulei de masline, zeama de lamaie si patrunjelul. Amesteca viguros 30 de secunde pentru mantecatura. Acopera si lasa 2 minute. Serveste imediat in farfurii adanci, cu mai mult patrunjel deasupra.",
      en: "Clean the squid: remove the head and innards, keep the ink sacs intact in a small bowl with a splash of water. Cut the bodies into 1 cm rings and halve the tentacles. Heat 4 tbsp olive oil in a wide heavy pan over medium heat. Add the onion and cook for 4-5 minutes until softened. Add the garlic and cook 1 more minute. Add the squid rings and tentacles, sauté for 2-3 minutes until just opaque. Pour in the wine and let it evaporate completely (about 2 minutes). Add the rice and stir for 1 minute to coat with fat. Add the first ladle of hot fish stock and stir constantly. As the liquid is absorbed, add another ladle, stirring for 16-18 minutes total. Halfway through, break the ink sacs into the remaining stock and pour it in — the risotto turns deep jet black instantly. When the rice is al dente and creamy (a little stock still pooling), kill the heat. Add the cold butter, the remaining 2 tbsp olive oil, the lemon juice, and the parsley. Stir vigorously for 30 seconds for the mantecatura. Cover and rest 2 minutes. Serve immediately in shallow bowls with extra parsley on top.",
      es: "Limpia los calamares: retira la cabeza y las vísceras, mantén las bolsas de tinta intactas en un bol pequeño con un poco de agua. Corta los cuerpos en aros de 1 cm y los tentáculos por la mitad. Calienta 4 cucharadas de aceite de oliva en una sartén ancha y pesada a fuego medio. Añade la cebolla y cocina 4-5 minutos hasta que se ablande. Añade el ajo y cocina 1 minuto más. Añade los aros de calamar y los tentáculos, saltea 2-3 minutos hasta que estén opacos. Vierte el vino y déjalo evaporar por completo (unos 2 minutos). Añade el arroz y remueve 1 minuto para cubrirlo con la grasa. Añade el primer cucharón de caldo de pescado caliente y remueve constantemente. A medida que se absorbe el líquido, añade más cucharones, removiendo 16-18 minutos en total. A la mitad, abre las bolsas de tinta en el caldo restante y viértelo — el risotto se vuelve negro intenso al instante. Cuando el arroz esté al dente y cremoso (con un poco de caldo aún), apaga el fuego. Añade la mantequilla fría, las 2 cucharadas de aceite restantes, el zumo de limón y el perejil. Remueve enérgicamente 30 segundos para la mantecatura. Tapa y deja reposar 2 minutos. Sirve inmediatamente en platos hondos con más perejil por encima.",
      fr: "Nettoyez les calmars : retirez la tête et les viscères, conservez les poches d'encre intactes dans un petit bol avec un peu d'eau. Coupez les corps en anneaux d'1 cm et coupez les tentacules en deux. Chauffez 4 c. à soupe d'huile d'olive dans une grande poêle lourde à feu moyen. Ajoutez l'oignon et faites cuire 4-5 minutes jusqu'à ce qu'il soit tendre. Ajoutez l'ail et faites cuire 1 minute de plus. Ajoutez les anneaux de calmar et les tentacules, faites sauter 2-3 minutes jusqu'à ce qu'ils soient juste opaques. Versez le vin et laissez-le s'évaporer complètement (environ 2 minutes). Ajoutez le riz et remuez 1 minute pour l'enrober. Ajoutez la première louche de fumet de poisson chaud et remuez constamment. À mesure que le liquide est absorbé, ajoutez une autre louche, en remuant 16-18 minutes au total. À mi-cuisson, percez les poches d'encre dans le fumet restant et versez-le — le risotto devient noir intense instantanément. Quand le riz est al dente et crémeux (un peu de fumet encore présent), coupez le feu. Ajoutez le beurre froid, les 2 c. à soupe d'huile restantes, le jus de citron et le persil. Remuez vigoureusement 30 secondes pour la mantecatura. Couvrez et laissez reposer 2 minutes. Servez immédiatement dans des assiettes creuses avec plus de persil sur le dessus.",
      de: "Tintenfische putzen: Kopf und Innereien entfernen, Tintensäckchen unversehrt in einer kleinen Schüssel mit etwas Wasser aufbewahren. Körper in 1-cm-Ringe schneiden und Tentakeln halbieren. 4 EL Olivenöl in einer weiten schweren Pfanne bei mittlerer Hitze erhitzen. Zwiebel zugeben und 4-5 Minuten weich dünsten. Knoblauch zugeben und 1 weitere Minute kochen. Tintenfischringe und Tentakeln zugeben und 2-3 Minuten anbraten, bis sie gerade undurchsichtig sind. Wein angießen und vollständig verkochen lassen (ca. 2 Minuten). Reis zugeben und 1 Minute rühren, damit er mit Fett überzogen ist. Erste Kelle heiße Fischbrühe zugeben und ständig rühren. Sobald die Flüssigkeit aufgesaugt ist, weitere Kelle zugeben, 16-18 Minuten insgesamt rühren. Auf halber Strecke die Tintensäckchen in die restliche Brühe drücken und einrühren — das Risotto wird sofort tief tintenschwarz. Wenn der Reis al dente und cremig ist (noch etwas Brühe übrig), Hitze ausschalten. Kalte Butter, restliche 2 EL Olivenöl, Zitronensaft und Petersilie zugeben. 30 Sekunden kräftig rühren (Mantecatura). Abgedeckt 2 Minuten ruhen lassen. Sofort in tiefen Tellern mit zusätzlicher Petersilie servieren.",
      pt: "Limpe as lulas: retire a cabeça e as vísceras, mantenha os sacos de tinta intactos numa tigela pequena com um pouco de água. Corte os corpos em anéis de 1 cm e parta os tentáculos ao meio. Aqueça 4 colheres de sopa de azeite numa frigideira larga e pesada em fogo médio. Adicione a cebola e cozinhe 4-5 minutos até amolecer. Adicione o alho e cozinhe mais 1 minuto. Adicione os anéis de lula e os tentáculos, salteie 2-3 minutos até ficarem opacos. Despeje o vinho e deixe evaporar completamente (cerca de 2 minutos). Adicione o arroz e mexa 1 minuto para envolver com a gordura. Adicione a primeira concha de caldo de peixe quente e mexa constantemente. À medida que o líquido for absorvido, adicione mais conchas, mexendo 16-18 minutos no total. A meio, rompa os sacos de tinta no caldo restante e despeje — o risoto fica preto profundo instantaneamente. Quando o arroz estiver al dente e cremoso (ainda com algum caldo), desligue o fogo. Adicione a manteiga fria, as 2 colheres de azeite restantes, o sumo de limão e a salsinha. Mexa vigorosamente 30 segundos para a mantecatura. Tape e descanse 2 minutos. Sirva imediatamente em pratos fundos com mais salsinha por cima.",
      ru: "Очистите кальмаров: удалите голову и внутренности, чернильные мешочки целыми сохраните в маленькой миске с небольшим количеством воды. Тела нарежьте кольцами 1 см, щупальца разрежьте пополам. Разогрейте 4 ст. л. оливкового масла в широкой тяжёлой сковороде на среднем огне. Добавьте лук и готовьте 4-5 минут до мягкости. Добавьте чеснок и готовьте ещё 1 минуту. Добавьте кольца кальмара и щупальца, обжарьте 2-3 минуты до непрозрачности. Влейте вино и дайте полностью выпариться (около 2 минут). Добавьте рис и помешивайте 1 минуту, чтобы он покрылся жиром. Добавьте первый половник горячего рыбного бульона и постоянно помешивайте. По мере впитывания жидкости добавляйте ещё половники, помешивая в общей сложности 16-18 минут. На полпути раздавите чернильные мешочки в оставшийся бульон и влейте в сковороду — ризотто мгновенно становится насыщенно чёрным. Когда рис al dente и кремовый (немного бульона ещё остаётся), выключите огонь. Добавьте холодное сливочное масло, оставшиеся 2 ст. л. оливкового масла, лимонный сок и петрушку. Энергично помешивайте 30 секунд для мантекатуры. Накройте и дайте отдохнуть 2 минуты. Подавайте немедленно в глубоких тарелках с дополнительной петрушкой сверху.",
      ar: "نظف الكاليماري: انزع الرأس والأحشاء واحتفظ بأكياس الحبر سليمة في وعاء صغير مع قليل من الماء. قطع الأجسام إلى حلقات 1 سم وقسم المجسات نصفين. سخن 4 ملاعق كبيرة زيت زيتون في مقلاة واسعة وثقيلة على نار متوسطة. أضف البصل واطبخ 4-5 دقائق حتى يلين. أضف الثوم واطبخ دقيقة أخرى. أضف حلقات الكاليماري والمجسات وقلب 2-3 دقائق حتى تصبح معتمة فقط. أضف النبيذ واتركه يتبخر تمامًا (نحو دقيقتين). أضف الأرز وقلبه دقيقة ليغطى بالدهن. أضف أول مغرفة من مرق السمك الساخن وقلب باستمرار. مع امتصاص السائل، أضف مغرفة أخرى، مع التقليب لمدة 16-18 دقيقة إجمالًا. في منتصف الطريق، اكسر أكياس الحبر في المرق المتبقي وأضفه — يتحول الريزوتو إلى أسود عميق فوراً. عندما يصبح الأرز al dente وكريميًا (مع بعض المرق المتبقي)، أطفئ النار. أضف الزبدة الباردة والملعقتين الكبيرتين المتبقيتين من زيت الزيتون وعصير الليمون والبقدونس. قلب بقوة 30 ثانية للمنتيكاتورا. غطِ واتركه يرتاح دقيقتين. قدمه فورًا في أطباق عميقة مع المزيد من البقدونس فوقه.",
      zh: "清洗鱿鱼：去掉头部和内脏，将墨囊完整地保留在装有少量水的小碗中。把鱼身切成1厘米的圈，触手对半切。在宽底厚锅中以中火加热4大勺橄榄油。加入洋葱炒4-5分钟至软。加大蒜再炒1分钟。加入鱿鱼圈和触手，翻炒2-3分钟至刚刚变白。倒入白葡萄酒，让其完全蒸发（约2分钟）。加入米，翻炒1分钟使其裹上油脂。加入第一勺热鱼汤并持续搅拌。随着液体被吸收，再加一勺，共搅拌16-18分钟。中途，将墨囊在剩余的汤中捏破并倒入——烩饭瞬间变为深邃的墨黑色。当米饭达到al dente并呈奶油状时（汤还剩一点），关火。加入冷黄油、剩余的2大勺橄榄油、柠檬汁和欧芹。用力搅拌30秒进行mantecatura（搅拌乳化）。盖上盖子静置2分钟。立即在深盘中上桌，顶部撒上更多欧芹。",
      ja: "イカを下処理：頭と内臓を取り、墨袋は壊さないよう少量の水と共に小さなボウルに分けておく。胴を1cmの輪切りに、足を半分に切る。大きめの厚手のフライパンにオリーブオイル大さじ4を中火で熱する。玉ねぎを加え4-5分炒めて柔らかくする。にんにくを加えてさらに1分炒める。イカの輪と足を加え、2-3分炒めて表面が白くなる程度に火を通す。ワインを注ぎ、完全に蒸発させる（約2分）。米を加え、1分かき混ぜて油をなじませる。温かい魚のだしを1杯加え、絶えずかき混ぜる。液が吸われたら次の1杯を加え、合計16-18分かき混ぜる。途中で残りのだしに墨袋を破って混ぜ、鍋に注ぐ — リゾットが瞬時に深い漆黒に変わる。米がアル・デンテでクリーミー（少しだしが残っている状態）になったら火を止める。冷たいバター、残りのオリーブオイル大さじ2、レモン汁、パセリを加え、30秒間しっかりかき混ぜてマンテカトゥーラ（乳化）する。蓋をして2分休ませる。すぐに深皿に盛り、上からパセリを散らして提供する。",
      tr: "Kalamarları temizleyin: kafa ve iç organları çıkarın, mürekkep keselerini sağlam halde bir kase suya alın. Gövdeleri 1 cm halkalar halinde, tentakülleri ikiye bölün. Geniş ağır bir tavada 4 yemek kaşığı zeytinyağını orta ateşte ısıtın. Soğanı ekleyip 4-5 dakika yumuşayana kadar pişirin. Sarımsağı ekleyip 1 dakika daha pişirin. Kalamar halkalarını ve tentakülleri ekleyin, 2-3 dakika sadece matlaşana kadar sote edin. Şarabı dökün ve tamamen buharlaşmasına izin verin (yaklaşık 2 dakika). Pirinci ekleyip 1 dakika çevirin ki yağla kaplansın. İlk kepçe sıcak balık suyunu ekleyin ve sürekli karıştırın. Sıvı emildikçe başka bir kepçe daha ekleyin, toplam 16-18 dakika karıştırın. Yarı yolda mürekkep keselerini kalan balık suyuna kırın ve tavaya dökün — risotto anında derin siyaha dönüşür. Pirinç al dente ve kremamsı olduğunda (biraz suyu kalmışken), ateşi kapatın. Soğuk tereyağı, kalan 2 yemek kaşığı zeytinyağı, limon suyu ve maydanozu ekleyin. Mantecatura için 30 saniye kuvvetle karıştırın. Üzerini örtüp 2 dakika dinlendirin. Derin tabaklarda hemen, üzerine ekstra maydanozla servis edin.",
      it: "Pulisci i calamari: rimuovi la testa e le interiora, conserva intatti i sacchetti di nero in una piccola ciotola con un goccio d'acqua. Taglia i corpi ad anelli di 1 cm e dimezza i tentacoli. Scalda 4 cucchiai di olio d'oliva in una padella larga e pesante a fuoco medio. Aggiungi la cipolla e cuoci per 4-5 minuti finché si ammorbidisce. Aggiungi l'aglio e cuoci 1 minuto in più. Aggiungi gli anelli di calamaro e i tentacoli, fai saltare per 2-3 minuti finché diventano appena opachi. Versa il vino e lascialo evaporare completamente (circa 2 minuti). Aggiungi il riso e mescola per 1 minuto perché si rivesta di grasso. Aggiungi il primo mestolo di brodo di pesce caldo e mescola di continuo. Man mano che il liquido viene assorbito, aggiungi un altro mestolo, mescolando per 16-18 minuti totali. A metà cottura, rompi i sacchetti di nero nel brodo rimanente e versalo — il risotto diventa subito nero intenso. Quando il riso è al dente e cremoso (con ancora un po' di brodo), spegni il fuoco. Aggiungi il burro freddo, i restanti 2 cucchiai di olio d'oliva, il succo di limone e il prezzemolo. Mescola vigorosamente per 30 secondi per la mantecatura. Copri e lascia riposare 2 minuti. Servi immediatamente in piatti fondi con altro prezzemolo sopra.",
      ko: "오징어 손질: 머리와 내장을 제거하고 먹물주머니는 깨지지 않게 약간의 물과 함께 작은 그릇에 따로 둔다. 몸통은 1cm 링으로, 다리는 반으로 자른다. 넓고 두꺼운 팬에 올리브유 4큰술을 중불에서 가열한다. 양파를 넣고 4-5분간 부드러워질 때까지 익힌다. 마늘을 넣고 1분 더 익힌다. 오징어 링과 다리를 넣고 2-3분간 표면이 막 불투명해질 정도로 볶는다. 와인을 붓고 완전히 증발할 때까지(약 2분) 두다. 쌀을 넣고 1분간 저어 기름이 잘 코팅되게 한다. 따뜻한 생선 육수 한 국자를 넣고 끊임없이 저어준다. 액체가 흡수되면 다시 한 국자를 넣고, 총 16-18분간 저어준다. 중간쯤에 남은 육수에 먹물주머니를 터뜨려 넣고 팬에 부으면 — 리조토가 즉시 깊은 검은색으로 변한다. 쌀이 알 덴테이고 크리미할 때(육수가 약간 남은 상태) 불을 끈다. 차가운 버터, 남은 올리브유 2큰술, 레몬즙, 파슬리를 넣는다. 만테카투라를 위해 30초간 힘차게 젓는다. 뚜껑을 덮고 2분간 휴지시킨다. 즉시 깊은 접시에 담아 파슬리를 더 뿌려 낸다.",
      hi: "स्क्विड साफ करें: सिर और अंदरूनी हिस्सा निकालें, स्याही की थैलियाँ अखंड रखें एक छोटे कटोरे में थोड़े पानी के साथ। शरीर को 1 सेमी के छल्लों में और सूंडों को आधा काटें। चौड़े भारी पैन में 4 बड़े चम्मच जैतून का तेल मध्यम आंच पर गर्म करें। प्याज डालें और 4-5 मिनट तक नर्म होने तक पकाएं। लहसुन डालें और 1 मिनट और पकाएं। स्क्विड के छल्ले और सूंडें डालें, 2-3 मिनट तक हल्का अपारदर्शी होने तक भूनें। वाइन डालें और पूरी तरह से वाष्पीकृत होने दें (लगभग 2 मिनट)। चावल डालें और 1 मिनट तक हिलाएं ताकि वसा से लिपट जाए। पहली कलछी गर्म मछली शोरबा डालें और लगातार हिलाएं। तरल अवशोषित होते ही और कलछी डालें, कुल 16-18 मिनट हिलाएं। आधे रास्ते में स्याही की थैलियाँ बचे हुए शोरबा में तोड़ें और पैन में डालें — रिज़ोटो तुरंत गहरे काले रंग का हो जाता है। जब चावल अल डेंटे और मलाईदार हो जाए (कुछ शोरबा अभी भी बचा हो), आंच बंद कर दें। ठंडा मक्खन, बचा हुआ 2 बड़े चम्मच जैतून का तेल, नींबू का रस और अजमोद डालें। मंतेकातुरा के लिए 30 सेकंड तक जोर से हिलाएं। ढकें और 2 मिनट आराम दें। तुरंत गहरे प्लेटों में, ऊपर अधिक अजमोद के साथ परोसें।"
    },
    originText: {
      ro: "Crni Rižot — risotto-ul negru cu cerneală de calmar — este unul dintre cele mai iconice preparate ale coastei dalmațiene. Originile sale sunt împărtășite cu Veneția, dar versiunea croată folosește orez italian, fond de pește local și vin alb dalmațian, de obicei Pošip de pe insula Korčula.\n\nSecretul stă în cerneala adăugată în ultima parte a fierberii: înnegrește orezul complet, dă un gust intens de mare și o textură cremoasă. În Dalmația se servește deseori la nunți și la mesele de duminică, alături de un pahar de vin alb răcoros și o felie de lămâie pentru contrast.",
      en: "Crni Rižot — black risotto stained with squid ink — is one of the most iconic dishes of the Dalmatian coast. Its origins are shared with Venice, but the Croatian version uses Italian rice, local fish stock, and Dalmatian white wine, typically Pošip from the island of Korčula.\n\nThe secret is the ink, added in the last stretch of cooking: it blackens the rice completely, adds a deep oceanic flavour, and gives a glossy, creamy texture. In Dalmatia it is served at weddings and Sunday meals, alongside a glass of cool white wine and a wedge of lemon to brighten it.",
      es: "Crni Rižot — el risotto negro teñido con tinta de calamar — es uno de los platos más icónicos de la costa dálmata. Sus orígenes se comparten con Venecia, pero la versión croata utiliza arroz italiano, caldo de pescado local y vino blanco dálmata, habitualmente Pošip de la isla de Korčula.\n\nEl secreto está en la tinta, añadida en la última fase de cocción: ennegrece el arroz por completo, aporta un sabor profundo a mar y otorga una textura brillante y cremosa. En Dalmacia se sirve en bodas y comidas dominicales, acompañado de una copa de vino blanco frío y un gajo de limón para realzarlo.",
      fr: "Le Crni Rižot — risotto noir teinté à l'encre de calmar — est l'un des plats les plus emblématiques de la côte dalmate. Ses origines sont partagées avec Venise, mais la version croate utilise du riz italien, du fumet de poisson local et du vin blanc dalmate, généralement du Pošip de l'île de Korčula.\n\nLe secret réside dans l'encre, ajoutée dans la dernière phase de cuisson : elle noircit complètement le riz, apporte une profonde saveur marine et donne une texture brillante et crémeuse. En Dalmatie, il est servi lors des mariages et des repas dominicaux, accompagné d'un verre de vin blanc frais et d'un quartier de citron pour le rehausser.",
      de: "Crni Rižot — schwarzes, mit Tintenfischtinte gefärbtes Risotto — ist eines der ikonischsten Gerichte der dalmatinischen Küste. Seine Ursprünge teilt es mit Venedig, aber die kroatische Version verwendet italienischen Reis, lokale Fischbrühe und dalmatinischen Weißwein, typischerweise Pošip von der Insel Korčula.\n\nDas Geheimnis ist die Tinte, die in der letzten Kochphase zugegeben wird: Sie schwärzt den Reis vollständig, verleiht einen tiefen Meeresgeschmack und gibt eine glänzende, cremige Textur. In Dalmatien wird es zu Hochzeiten und Sonntagsessen serviert, dazu ein Glas kühler Weißwein und ein Stück Zitrone, um es aufzuhellen.",
      pt: "Crni Rižot — risoto preto tingido com tinta de lula — é um dos pratos mais emblemáticos da costa dálmata. Suas origens são compartilhadas com Veneza, mas a versão croata usa arroz italiano, caldo de peixe local e vinho branco dálmata, normalmente Pošip da ilha de Korčula.\n\nO segredo está na tinta, adicionada na última fase do cozimento: ela escurece completamente o arroz, traz um sabor profundo de mar e dá uma textura brilhante e cremosa. Na Dalmácia é servido em casamentos e refeições de domingo, acompanhado de um copo de vinho branco frio e uma fatia de limão para realçar.",
      ru: "Црни Рижот — чёрный ризотто, окрашенный чернилами кальмара, — одно из самых знаковых блюд далматинского побережья. Его истоки общие с Венецией, но хорватская версия использует итальянский рис, местный рыбный бульон и далматинское белое вино, как правило, Пошип с острова Корчула.\n\nСекрет — в чернилах, добавляемых на последнем этапе варки: они полностью чернят рис, придают глубокий морской вкус и блестящую кремовую текстуру. В Далмации его подают на свадьбах и воскресных обедах, в сопровождении бокала прохладного белого вина и дольки лимона.",
      ar: "Crni Rižot — ريزوتو أسود مصبوغ بحبر الكاليماري — هو من أكثر أطباق ساحل دالماشيا أيقونيةً. أصوله مشتركة مع البندقية، لكن النسخة الكرواتية تستخدم الأرز الإيطالي ومرق السمك المحلي والنبيذ الأبيض الدالماتي، عادةً Pošip من جزيرة Korčula.\n\nالسر هو الحبر، يُضاف في المرحلة الأخيرة من الطهي: يحول الأرز إلى الأسود تمامًا، يضفي نكهة بحرية عميقة، ويعطي قوامًا لامعًا كريميًا. في دالماشيا يُقدَّم في الأعراس وغداءات الأحد، مع كأس من النبيذ الأبيض البارد وشريحة ليمون لإضاءته.",
      zh: "克尔尼里索托——以鱿鱼墨染黑的烩饭——是达尔马提亚海岸最具标志性的菜肴之一。其起源与威尼斯共享，但克罗地亚版本使用意大利米、当地鱼汤和达尔马提亚白葡萄酒，通常是来自Korčula岛的Pošip。\n\n秘诀在于烹饪最后阶段加入的墨汁：它使米饭完全变黑，带来深邃的海洋风味，并赋予光泽且奶油般的质地。在达尔马提亚，这道菜常在婚礼和周日餐桌上出现，搭配一杯凉爽的白葡萄酒和柠檬角以提味。",
      ja: "Crni Rižot——イカ墨で染めた黒いリゾット——はダルマチア海岸を代表する料理の一つです。起源はヴェネツィアと共有しますが、クロアチア版はイタリア米、地元の魚のだし、ダルマチアの白ワイン（通常はコルチュラ島のPošip）を使います。\n\n秘訣は調理の最終段階で加える墨です：米を完全に黒く染め、深い海の風味と艶やかでクリーミーな食感を与えます。ダルマチアでは結婚式や日曜の食事に振る舞われ、冷えた白ワイン一杯とレモン一切れで爽やかに引き立てられます。",
      tr: "Crni Rižot — kalamar mürekkebiyle siyahlatılmış risotto — Dalmaçya kıyısının en ikonik yemeklerinden biridir. Kökeni Venedik ile paylaşılır, ancak Hırvat versiyonu İtalyan pirinci, yerel balık suyu ve Dalmaçya beyaz şarabı — genellikle Korčula adasından Pošip — kullanır.\n\nSır, pişirmenin son aşamasında eklenen mürekkeptir: pirinci tamamen siyaha boyar, derin okyanus tadı katar ve parlak, kremamsı bir doku verir. Dalmaçya'da düğünlerde ve pazar yemeklerinde, soğuk beyaz şarap ve aydınlatıcı bir dilim limonla servis edilir.",
      it: "Crni Rižot — risotto nero tinto con nero di seppia — è uno dei piatti più iconici della costa dalmata. Le sue origini sono condivise con Venezia, ma la versione croata usa riso italiano, brodo di pesce locale e vino bianco dalmata, tipicamente Pošip dell'isola di Korčula.\n\nIl segreto è il nero, aggiunto nell'ultima fase della cottura: annerisce completamente il riso, apporta un sapore marino profondo e dona una consistenza lucida e cremosa. In Dalmazia si serve a matrimoni e pranzi domenicali, accompagnato da un calice di vino bianco fresco e una fetta di limone per ravvivarlo.",
      ko: "Crni Rižot — 오징어 먹물로 까맣게 물든 리조토 — 는 달마티아 해안의 가장 상징적인 요리 중 하나입니다. 그 기원은 베니스와 공유하지만 크로아티아 버전은 이탈리아 쌀, 현지 생선 육수, 달마티아 화이트 와인(보통 Korčula 섬의 Pošip)을 사용합니다.\n\n비결은 조리 마지막 단계에 추가되는 먹물입니다: 쌀을 완전히 까맣게 물들이고 깊은 바다 향을 더하며 윤기 있는 크리미한 질감을 부여합니다. 달마티아에서는 결혼식과 일요일 식사에 차가운 화이트 와인 한 잔과 레몬 한 조각과 함께 제공됩니다.",
      hi: "क्रनी रिज़ोटो — स्क्विड की स्याही से रंगी काली रिज़ोटो — दाल्मेशियन तट के सबसे प्रतिष्ठित व्यंजनों में से एक है। इसकी उत्पत्ति वेनिस के साथ साझा है, लेकिन क्रोएशियाई संस्करण इतालवी चावल, स्थानीय मछली शोरबा और दाल्मेशियन सफेद वाइन का उपयोग करता है, आमतौर पर Korčula द्वीप का Pošip।\n\nरहस्य पकाने के अंतिम चरण में डाली गई स्याही में है: यह चावल को पूरी तरह से काला कर देता है, गहरा समुद्री स्वाद जोड़ता है, और चमकदार, मलाईदार बनावट देता है। दाल्मेशिया में इसे शादियों और रविवार के भोजन पर परोसा जाता है, साथ में ठंडी सफेद वाइन का एक गिलास और इसे चमकाने के लिए नींबू का एक टुकड़ा।"
    }'''

# ── recipes-meta.js entry (replaces meta[59]) ────────────────────────
NEW_META_JS = r"""  59: { time: 50, costRon: 45, tags: ['quick','family'],
        desc: d('Risotto cremos cu cerneală de calmar — emblematic dalmațian.',
                'Creamy black squid-ink risotto — the signature dish of the Dalmatian coast.',
                'Risotto cremoso con tinta de calamar — el plato emblemático de la costa dálmata.',
                "Risotto crémeux à l'encre de calmar — le plat emblématique de la côte dalmate.",
                'Cremiges Risotto mit Tintenfischtinte — das Wahrzeichengericht der dalmatinischen Küste.',
                'Risoto cremoso com tinta de lula — o prato emblemático da costa dálmata.',
                'Кремовый ризотто с чернилами кальмара — фирменное блюдо далматинского побережья.',
                'ريزوتو كريمي مع حبر الكاليماري — الطبق الأيقوني لساحل دالماشيا.',
                '鱿鱼墨奶油烩饭——达尔马提亚海岸的标志性菜肴。',
                'イカ墨のクリーミーなリゾット——ダルマチア海岸を代表する料理。',
                'Kalamar mürekkepli kremalı risotto — Dalmaçya kıyısının simge yemeği.',
                'Risotto cremoso al nero di seppia — il piatto simbolo della costa dalmata.',
                '오징어 먹물 크리미 리조토 — 달마티아 해안의 시그니처 요리.',
                'क्रीमी ब्लैक स्क्विड-इंक रिज़ोटो — दाल्मेशियन तट का प्रतिष्ठित व्यंजन।') },"""


def replace_recipe_block():
    """Replace id:59 recipe block in public/js/recipes.js."""
    path = ROOT / 'public/js/recipes.js'
    text = path.read_text(encoding='utf-8')

    # Find the start of the id:59 record's opening "  {"
    start_marker = '    id: 59,'
    end_marker = '    id: 60,'
    start = text.find(start_marker)
    end = text.find(end_marker)
    if start == -1 or end == -1:
        print('ERROR: could not locate id:59 boundaries')
        sys.exit(1)

    # Walk back from `id: 59,` to the opening `  {` of its record
    obj_start = text.rfind('{', 0, start)
    # Walk back from id:60 to the closing `},` of id:59
    obj_end = text.rfind('}', 0, end)
    # Include the trailing comma after `}`
    if text[obj_end + 1] == ',':
        obj_end += 1

    before = text[:obj_start]
    after = text[obj_end + 1:]
    new_text = before + '{\n' + NEW_RECIPE_JS + '\n  },' + after

    path.write_text(new_text, encoding='utf-8')
    print(f'  ✓ Replaced id:59 in recipes.js ({obj_end - obj_start} chars → {len(NEW_RECIPE_JS) + 12} chars)')


def replace_meta_entry():
    """Replace recipesMeta[59] entry in public/js/recipes-meta.js."""
    path = ROOT / 'public/js/recipes-meta.js'
    text = path.read_text(encoding='utf-8')

    # Find the line "  59: { time: 1620, ..." and replace until the closing "},"
    # The entry spans multiple lines. Find start.
    start_marker = "  59: { time:"
    start = text.find(start_marker)
    if start == -1:
        print('ERROR: could not locate meta[59] start')
        sys.exit(1)

    # End: find the matching closing `) },` at the end of d(...) call
    # Each meta entry that uses d() ends with `) },` on its own line.
    # We scan forward for the first `) },` after start.
    end_marker = ') },'
    end = text.find(end_marker, start)
    if end == -1:
        # Fallback: simple `},` (entries without d() helper)
        end = text.find('},', start)
        if end == -1:
            print('ERROR: could not locate meta[59] end')
            sys.exit(1)
        end += 2
    else:
        end += len(end_marker)

    before = text[:start]
    after = text[end:]
    new_text = before + NEW_META_JS + after

    path.write_text(new_text, encoding='utf-8')
    print(f'  ✓ Replaced meta[59] in recipes-meta.js')


def add_croatia_to_mediterranean_filter():
    """Add 'Croația' to the mediterranean filter in app.js so the random
       auto-plan picks Crni Rižot (and Pasticada) when the user selects
       the mediterranean theme."""
    path = ROOT / 'public/js/app.js'
    text = path.read_text(encoding='utf-8')

    old = "['Italia','Grecia','Franța','Spania','Turcia','Maroc','Portugalia'].includes(r.origin?.ro)"
    new = "['Italia','Grecia','Franța','Spania','Turcia','Maroc','Portugalia','Croația'].includes(r.origin?.ro)"

    if old not in text:
        print('WARNING: mediterranean filter pattern not found in app.js (may already be updated)')
        return False
    text = text.replace(old, new, 1)
    path.write_text(text, encoding='utf-8')
    print('  ✓ Added Croația to mediterranean filter in app.js')
    return True


def delete_orphan_image():
    """Delete public/images/dalmatinska-pasticada.webp — the recipe id 59
       is no longer Dalmatinska Pasticada, so this image is orphaned."""
    path = ROOT / 'public/images/dalmatinska-pasticada.webp'
    if path.exists():
        path.unlink()
        print(f'  ✓ Deleted orphan image: {path.name}')
        return True
    print(f'  ⚠ Image not found (already deleted): {path.name}')
    return False


if __name__ == '__main__':
    print('── Crni Rižot transformation ──')
    replace_recipe_block()
    replace_meta_entry()
    add_croatia_to_mediterranean_filter()
    delete_orphan_image()
    print('Done. Run `npm run content` to regenerate HTML.')
