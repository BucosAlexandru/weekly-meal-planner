data = open('public/js/recipes.js', 'r', encoding='utf-8').read()

# Add hi to origin
data = data.replace(
    '      ko: "태국"\n    },\n    name: {\n      ro: "Tom Yum"',
    '      ko: "태국",\n      hi: "थाईलैंड"\n    },\n    name: {\n      ro: "Tom Yum"',
    1
)

# Add hi to name
data = data.replace(
    '      ko: "똠얌"\n    },\n    category: {',
    '      ko: "똠얌",\n      hi: "टॉम यम"\n    },\n    category: {',
    1
)

# Add hi to category (Lunch — Thailand Tom Yum block)
data = data.replace(
    '      ko: "점심"\n    },\n    servings: 4,\n    tipType: \'soup\',\n    pairingsType: \'soup\',',
    '      ko: "점심",\n      hi: "दोपहर का खाना"\n    },\n    servings: 4,\n    tipType: \'soup\',\n    pairingsType: \'soup\',',
    1
)

# Add hi to ingredients (Tom Yum has detailed ingredients)
data = data.replace(
    '      ko: ["닭 또는 해산물 육수 1L", "생 새우 300g, 껍질·내장 제거", "레몬그라스 2대, 3cm로 잘라 두들기기", "갈랑갈(또는 생강) 30g, 얇게 썰기", "카피르 라임 잎 6장", "태국 홍고추 3–4개, 반 자르기", "느타리버섯 또는 양송이 200g, 슬라이스", "피쉬 소스 3큰술", "신선한 라임즙 2큰술", "팜 슈가 1큰술", "똠얌 페이스트 2큰술 (선택)", "파 1대, 장식용", "신선한 고수 (서빙용)"]\n    },\n    howIsMade: {',
    '      ko: ["닭 또는 해산물 육수 1L", "생 새우 300g, 껍질·내장 제거", "레몬그라스 2대, 3cm로 잘라 두들기기", "갈랑갈(또는 생강) 30g, 얇게 썰기", "카피르 라임 잎 6장", "태국 홍고추 3–4개, 반 자르기", "느타리버섯 또는 양송이 200g, 슬라이스", "피쉬 소스 3큰술", "신선한 라임즙 2큰술", "팜 슈가 1큰술", "똠얌 페이스트 2큰술 (선택)", "파 1대, 장식용", "신선한 고수 (서빙용)"],\n      hi: ["चिकन या सीफ़ूड स्टॉक 1 लीटर", "कच्चे झींगे 300 ग्राम, छिले और नस हटाए", "लेमनग्रास 2 डंठल, 3 सेमी में काटे और कुचले", "गैलंगल (या अदरक) 30 ग्राम, पतले कटे", "काफ़िर लाइम पत्ते 6", "थाई लाल मिर्च 3–4, आधे कटे", "ऑयस्टर या बटन मशरूम 200 ग्राम, कटे", "मछली सॉस 3 बड़े चम्मच", "ताज़ा नींबू का रस 2 बड़े चम्मच", "पाम चीनी 1 बड़ा चम्मच", "टॉम यम पेस्ट 2 बड़े चम्मच (वैकल्पिक)", "हरा प्याज़ 1 डंठल, सजावट के लिए", "ताज़ा धनिया परोसने के लिए"]\n    },\n    howIsMade: {',
    1
)

# Add hi to howIsMade (Tom Yum has full detailed howIsMade)
data = data.replace(
    '      ko: "육수에 새우, 버섯, 레몬그라스, 라임, 칠리, 카피르 라임잎을 넣고 끓여주세요. 피시 소스와 라임즙으로 간을 맞춰주세요."\n    },\n    originText: {',
    '      ko: "육수에 새우, 버섯, 레몬그라스, 라임, 칠리, 카피르 라임잎을 넣고 끓여주세요. 피시 소스와 라임즙으로 간을 맞춰주세요.",\n      hi: "स्टॉक को मध्यम आंच पर गर्म करें, कुचला लेमनग्रास, गैलंगल और काफ़िर लाइम पत्ते डालें; 10 मिनट उबालें। टॉम यम पेस्ट (यदि उपयोग कर रहे हों), मिर्च और मशरूम डालें; 3–4 मिनट पकाएं। झींगे डालें और ठीक 2–3 मिनट पकाएं जब तक वे गुलाबी और घुमावदार न हो जाएं — अधिक न पकाएं। आंच से हटाएं और मछली सॉस, नींबू का रस और पाम चीनी से स्वाद समायोजित करें। गहरे कटोरे में तुरंत परोसें।"\n    },\n    originText: {',
    1
)

# Replace originText
old_ot = '''    originText: {
      ro: "Tom Yum este o rețetă tradițională din Thailanda.",
      en: "Tom Yum is a traditional recipe from Thailand.",
      es: "Tom Yum es una receta tradicional de Tailandia.",
      fr: "Tom Yum est une recette traditionnelle de Thaïlande.",
      de: "Tom Yum ist ein traditionelles Rezept aus Thailand.",
      pt: "Tom Yum é uma receita tradicional da Tailândia.",
      ru: "Том-ям — традиционный рецепт из Таиланда.",
      ar: "توم يام هي وصفة تقليدية من تايلاند.",
      zh: "冬阴功汤 是来自泰国的传统食谱。",
      ja: "トムヤム はタイの伝統的なレシピです。",
      tr: "Tom Yum Tayland kökenli geleneksel bir tariftir.",
      it: "Tom Yum è una ricetta tradizionale della Thailandia.",
      ko: "똠얌은 태국의 전통 요리입니다."
    }'''

new_ot = '''    originText: {
      ro: "Tom Yum este cea mai recunoscută internațional supă din Thailanda, construită pe o combinație distinctă de arome calde, acre, sărate și ușor dulci într-un singur bulion. Aromaticele — lemongrass, galangal și frunze de kaffir — sunt zdrobite mai degrabă decât tăiate, infuzând un bulion clar cu o căldură strălucitoare susținută de citrice. Supa nu poate fi condimentată în avans — echilibrul de sos de pește, suc de lime și zahăr de palmier se gustă și se ajustează chiar la final.\\n\\nTom Yum Goong — cu creveți — este cea mai familiară versiune, deși există și variante cu pește, pui și ciuperci. Versiunea cremoasă (Tom Yum Nam Khon) adaugă lapte de cocos sau lapte evaporat, oferind un bol mai bogat. Lemongrass-ul, galangalul și frunzele de lime sunt aromatice și nu sunt destinate consumului.",
      en: "Tom yum is Thailand\'s most internationally recognized soup, built on a distinct combination of hot, sour, salty, and lightly sweet flavors in a single broth. The aromatics — lemongrass, galangal, and kaffir lime leaves — are bruised rather than cut, infusing a clear broth with bright, citrus-backed heat. The soup cannot be seasoned in advance — the balance of fish sauce, lime juice, and palm sugar is tasted and adjusted right at the end.\\n\\nTom yum goong — with prawns — is the most familiar version, though fish, chicken, and mushroom variants exist. A creamy version (tom yum nam khon) adds coconut milk or evaporated milk, giving a richer bowl. The lemongrass, galangal, and lime leaves are aromatics and are not eaten.",
      es: "Tom yum es la sopa más reconocida internacionalmente de Tailandia, construida sobre una combinación distintiva de sabores picantes, ácidos, salados y ligeramente dulces en un solo caldo. Los aromáticos — citronela, galanga y hojas de kaffir — se machacan en lugar de cortarse, infundiendo un caldo claro con un calor brillante respaldado por cítricos. La sopa no puede sazonarse con antelación — el equilibrio de salsa de pescado, jugo de lima y azúcar de palma se prueba y ajusta justo al final.\\n\\nTom yum goong — con gambas — es la versión más familiar, aunque existen variantes con pescado, pollo y setas. La versión cremosa (tom yum nam khon) agrega leche de coco o leche evaporada, dando un bol más rico. La citronela, la galanga y las hojas de lima son aromáticos y no se comen.",
      fr: "Le tom yum est la soupe thaïlandaise la plus reconnue internationalement, construite sur une combinaison distincte de saveurs chaudes, acidulées, salées et légèrement sucrées dans un seul bouillon. Les aromates — citronnelle, galanga et feuilles de kaffir — sont écrasés plutôt que coupés, infusant un bouillon clair d\'une chaleur vive aux notes de citron. La soupe ne peut pas être assaisonnée à l\'avance — l\'équilibre de sauce de poisson, jus de citron vert et sucre de palme est goûté et ajusté juste à la fin.\\n\\nLe tom yum goong — aux crevettes — est la version la plus connue, bien que des variantes au poisson, au poulet et aux champignons existent. Une version crémeuse (tom yum nam khon) ajoute du lait de coco ou du lait évaporé. La citronnelle, le galanga et les feuilles de lime sont des aromates et ne se consomment pas.",
      de: "Tom Yum ist Thailands international bekannteste Suppe, aufgebaut auf einer markanten Kombination aus heißen, sauren, salzigen und leicht süßen Aromen in einer einzigen Brühe. Die Aromastoffe — Zitronengras, Galgant und Kaffirlimettenblätter — werden angedrückt statt geschnitten, um eine klare Brühe mit heller, zitrusgestützter Wärme zu infundieren. Die Suppe kann nicht im Voraus gewürzt werden — die Balance aus Fischsoße, Limettensaft und Palmzucker wird ganz am Ende abgeschmeckt.\\n\\nTom Yum Goong — mit Garnelen — ist die bekannteste Variante, obwohl es Varianten mit Fisch, Huhn und Pilzen gibt. Eine cremige Version (Tom Yum Nam Khon) fügt Kokosmilch oder Kondensmilch hinzu. Zitronengras, Galgant und Limettenblätter sind Aromen und werden nicht gegessen.",
      pt: "Tom yum é a sopa tailandesa mais reconhecida internacionalmente, construída sobre uma combinação distinta de sabores quentes, azedos, salgados e levemente doces em um único caldo. Os aromáticos — capim-limão, galanga e folhas de kaffir — são esmagados em vez de cortados, infundindo um caldo claro com calor brilhante apoiado em cítrico. A sopa não pode ser temperada com antecedência — o equilíbrio de molho de peixe, suco de limão e açúcar de palmeira é provado e ajustado no final.\\n\\nTom yum goong — com camarões — é a versão mais conhecida, embora existam variantes com peixe, frango e cogumelos. Uma versão cremosa (tom yum nam khon) adiciona leite de coco ou leite evaporado. O capim-limão, galanga e folhas de lime são aromáticos e não são comidos.",
      ru: "Том-ям — самый международно известный суп Таиланда, построенный на характерном сочетании горячих, кислых, солёных и слегка сладких вкусов в одном бульоне. Ароматические компоненты — лемонграсс, галангал и листья каффирского лайма — расплющиваются, а не режутся, придавая прозрачному бульону яркий, цитрусовый жар. Суп нельзя приправить заранее — баланс рыбного соуса, сока лайма и пальмового сахара пробуется и регулируется прямо перед подачей.\\n\\nТом-ям гун — с креветками — наиболее знакомая версия, хотя существуют варианты с рыбой, курицей и грибами. Кремовая версия (том-ям нам кон) добавляет кокосовое или сгущённое молоко. Лемонграсс, галангал и листья лайма — ароматизаторы, их не едят.",
      ar: "توم يام هو أكثر الحساء الشهرة من تايلاند على الصعيد الدولي، مبنيٌّ على توليفة مميزة من نكهات حارة وحامضة ومالحة وحلوة خفيفة في مرق واحد. تُدَقّ المكوّنات العطرية — اللمونغراس والغالانغال وأوراق الكافير ليم — بدلاً من تقطيعها، فتُعطّر مرقاً صافياً بحرارة حيّة بنكهة الحمضيات. لا يمكن تتبيل الحساء مسبقاً — يُذاق توازن صلصة السمك وعصير الليمون وسكر النخيل ويُضبط في اللحظة الأخيرة.\\n\\nتوم يام غونغ — بالجمبري — الأكثر شيوعاً، وإن وُجدت نسخ بالسمك والدجاج والفطر. النسخة الكريمية (توم يام نام كون) تُضيف حليب جوز الهند أو الحليب المكثف. اللمونغراس والغالانغال وأوراق اللايم مكوّنات عطرية ولا تُؤكل.",
      zh: "冬阴功汤是泰国国际上最知名的汤，建立在一种独特的热、酸、咸、微甜的风味组合上。香料——香茅、南姜和卡菲尔柠檬叶——是用拍碎而非切割的方式处理，将明亮的柑橘热意注入清汤。这道汤不能提前调味——鱼露、青柠汁和棕榈糖的平衡在最后才品尝和调整。\\n\\n冬阴功虾汤（tom yum goong）是最熟悉的版本，也有鱼、鸡肉和蘑菇版本。浓郁版（冬阴功椰奶汤）添加椰奶或炼乳，带来更丰富的口感。香茅、南姜和柠檬叶是提香料，不用食用。",
      ja: "トムヤムはタイの国際的に最も知られたスープで、一つのブイヨンに辛み・酸味・塩気・ほのかな甘みを組み合わせた独特の風味を持つ。レモングラス・ガランガル・コブミカンの葉は切らずに叩いて潰し、清澄なブイヨンに明るい柑橘の辛みを注入する。このスープは事前に味付けできない——ナンプラー・ライム果汁・パームシュガーのバランスは最後に味見しながら調整する。\\n\\nエビのトムヤム・グン（tom yum goong）が最もよく知られるが、魚・鶏・きのこのバリエーションもある。クリーミー版（トムヤム・ナムコン）はコクのある一杯になるよう、ココナッツミルクや加糖練乳を加える。レモングラス・ガランガル・ライムの葉は香り出しであり、食べるものではない。",
      tr: "Tom yum, Tayland\'ın uluslararası alanda en çok tanınan çorbasıdır; tek bir et suyunda sıcak, ekşi, tuzlu ve hafif tatlı tatların belirgin bir kombinasyonu üzerine inşa edilmiştir. Aromatikler — limonotu, galangal ve kaffir limon yaprakları — kesilmek yerine ezilir; berrak bir et suyuna parlak, narenciye destekli sıcaklık katar. Çorba önceden tatlandırılamaz — balık sosu, limon suyu ve palmiye şekerinin dengesi tam sona doğru tadılıp ayarlanır.\\n\\nTom yum goong — karidesli — en tanıdık versiyondur; balık, tavuk ve mantar çeşitleri de mevcuttur. Kremsi bir versiyon (tom yum nam khon) hindistancevizi sütü veya evaporated süt ekler. Limonotu, galangal ve limon yaprakları aromatiktir ve yenmez.",
      it: "Il tom yum è la zuppa tailandese più internazionalmente riconosciuta, costruita su una combinazione distinta di sapori caldi, acidi, salati e leggermente dolci in un unico brodo. Gli aromi — citronella, galanga e foglie di lime kaffir — vengono pestati invece di tagliati, infondendo un brodo chiaro con un calore brillante di agrumi. La zuppa non può essere condita in anticipo — l\'equilibrio di salsa di pesce, succo di lime e zucchero di palma viene assaggiato e regolato proprio alla fine.\\n\\nIl tom yum goong — con gamberi — è la versione più nota, sebbene esistano varianti con pesce, pollo e funghi. Una versione cremosa (tom yum nam khon) aggiunge latte di cocco o latte evaporato. La citronella, il galanga e le foglie di lime sono aromi e non vengono mangiati.",
      ko: "똠얌은 태국에서 국제적으로 가장 잘 알려진 수프로, 하나의 국물에 매운맛, 신맛, 짠맛, 약간의 단맛이 독특하게 조합되어 있습니다. 향신료 — 레몬그라스, 갈랑갈, 카피르 라임 잎 — 는 자르지 않고 두들겨서 맑은 국물에 밝은 시트러스 풍미의 매운맛을 불어넣습니다. 이 수프는 미리 간을 맞출 수 없습니다 — 피시 소스, 라임즙, 팜 슈가의 균형은 마지막에 맛을 보며 조절합니다.\\n\\n똠얌 꿍 — 새우 — 이 가장 친숙한 버전이지만, 생선, 닭고기, 버섯 변형도 있습니다. 크리미한 버전(똠얌 남콘)은 코코넛 밀크나 연유를 더해 더욱 풍부한 그릇을 만듭니다. 레몬그라스, 갈랑갈, 라임 잎은 향신료이며 먹지 않습니다.",
      hi: "टॉम यम थाईलैंड का अंतरराष्ट्रीय स्तर पर सबसे प्रसिद्ध सूप है, जो एक ही शोरबे में गर्म, खट्टे, नमकीन और हल्के मीठे स्वादों के विशिष्ट संयोजन पर निर्मित है। सुगंधित सामग्री — लेमनग्रास, गैलंगल और काफ़िर लाइम पत्ते — काटने के बजाय कुचले जाते हैं, जिससे एक साफ शोरबे में उज्ज्वल, खट्टे-युक्त गर्मी भर जाती है। इस सूप को पहले से नहीं बनाया जा सकता — मछली सॉस, नींबू का रस और पाम चीनी का संतुलन अंत में ही चखकर समायोजित किया जाता है।\\n\\nटॉम यम गूंग — झींगों के साथ — सबसे परिचित संस्करण है, हालांकि मछली, चिकन और मशरूम वाले संस्करण भी हैं। एक मलाईदार संस्करण (टॉम यम नाम खोन) नारियल दूध या वाष्पित दूध मिलाता है, जो अधिक समृद्ध कटोरा देता है। लेमनग्रास, गैलंगल और लाइम पत्ते सुगंधित सामग्री हैं और खाए नहीं जाते।"
    }'''

if old_ot in data:
    data = data.replace(old_ot, new_ot, 1)
    open('public/js/recipes.js', 'w', encoding='utf-8').write(data)
    print('Done 112')
else:
    print('NOT FOUND 112')
