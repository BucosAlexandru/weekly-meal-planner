import re

data = open('public/js/recipes.js', 'r', encoding='utf-8').read()

# 1. Add hi to origin (after ko: "에콰도르", before closing brace + name block)
data = data.replace(
    '      ko: "에콰도르"\n    },\n    name: {\n      ro: "Ceviche de camarón"',
    '      ko: "에콰도르",\n      hi: "इक्वेडोर"\n    },\n    name: {\n      ro: "Ceviche de camarón"',
    1
)

# 2. Add hi to name
data = data.replace(
    '      ko: "새우 세비체"\n    },\n    category: {',
    '      ko: "새우 세비체",\n      hi: "झींगा सेविचे"\n    },\n    category: {',
    1
)

# 3. Add hi to category
data = data.replace(
    '      ko: "간식"\n    },\n    servings: 4,\n    tipType: \'fish\',\n    pairingsType: \'fish\',',
    '      ko: "간식",\n      hi: "नाश्ता"\n    },\n    servings: 4,\n    tipType: \'fish\',\n    pairingsType: \'fish\',',
    1
)

# 4. Add hi to ingredients
data = data.replace(
    '      ko: ["새우", "라임", "빨간 양파", "토마토", "고수", "고추", "기름"]\n    },\n    howIsMade: {',
    '      ko: ["새우", "라임", "빨간 양파", "토마토", "고수", "고추", "기름"],\n      hi: ["झींगे", "नींबू", "लाल प्याज़", "टमाटर", "धनिया", "मिर्च", "तेल"]\n    },\n    howIsMade: {',
    1
)

# 5. Add hi to howIsMade
data = data.replace(
    '      ko: "익힌 새우를 라임즙에 토마토, 양파, 고추, 고수, 소금과 함께 재워주세요. 차갑게 제공해주세요."\n    },\n    originText: {',
    '      ko: "익힌 새우를 라임즙에 토마토, 양파, 고추, 고수, 소금과 함께 재워주세요. 차갑게 제공해주세요.",\n      hi: "पके हुए झींगे को नींबू के रस, टमाटर, प्याज़, मिर्च, धनिया और नमक के साथ मैरिनेट करें। ठंडा परोसें।"\n    },\n    originText: {',
    1
)

# 6. Replace entire originText block
old_originText = '''    originText: {
      ro: "Ceviche de camarón este o rețetă tradițională din Ecuador.",
      en: "Shrimp Ceviche is a traditional recipe from Ecuador.",
      es: "Ceviche de camarón es una receta tradicional de Ecuador.",
      fr: "Ceviche de crevettes est une recette traditionnelle de l'Équateur.",
      de: "Garnelen-Ceviche ist ein traditionelles Rezept aus Ecuador.",
      pt: "Ceviche de camarão é uma receita tradicional do Equador.",
      ru: "Севиче из креветок — традиционный рецепт из Эквадора.",
      ar: "سيفيتشي الروبيان هي وصفة تقليدية من الإكوادور.",
      zh: "厄瓜多尔虾酸橘汁腌 是来自厄瓜多尔的传统食谱。",
      ja: "エビのセビーチェ はエクアドルの伝統的なレシピです。",
      tr: "Karides Ceviche Ekvador kökenli geleneksel bir tariftir.",
      it: "Gamberi Ceviche è una ricetta tradizionale dell'Ecuador.",
      ko: "새우 세비체는 에콰도르의 전통 요리입니다."
    }'''

new_originText = '''    originText: {
      ro: "Ceviche-ul de camarón din Ecuador diferă de originalul peruvian printr-un element important: creveții sunt prefierți, nu curați exclusiv prin acid citric, ceea ce face preparatul mai ușor și mai accesibil. Sosul combină suc de lămâie verde cu roșii — adesea un amestec de roșii de copac și roșii obișnuite — și este uneori rotunjit cu suc de portocale, oferind o aciditate mai blândă decât versiunile vecine.\\n\\nCeviche-ul se asamblează rapid după ce creveții s-au răcit: ceapă roșie, coriandru, ardei iute și roșii se amestecă în marinadă, iar preparatul se lasă puțin înainte de servire. Se mănâncă de obicei cu chifles — chipsuri subțiri de banane plantain prăjite — sau porumb prăjit, care absorb sosul și oferă un contrast crocant față de creveții fragezi.",
      en: "Ecuador\'s shrimp ceviche differs from the Peruvian original in one important way: the shrimp are pre-cooked rather than cured by citrus alone, making the dish lighter and more approachable. The sauce combines lime juice with tomato — often a blend of tree tomato and regular tomato — and is sometimes softened with orange juice, giving Ecuadorian ceviche a mellow acidity rather than the sharp bite of neighboring versions.\\n\\nThe ceviche is assembled quickly once the shrimp are cold: red onion, coriander, chili, and tomato are stirred into the marinade, and the dish rests briefly before serving. It is typically eaten with chifles — thin fried plantain chips — or toasted corn, which absorb the sauce and provide a crisp contrast to the tender shrimp.",
      es: "El ceviche de camarón ecuatoriano difiere del original peruano en un aspecto importante: los camarones están precocidos en lugar de ser curados únicamente por el ácido cítrico, lo que hace el plato más ligero y accesible. La salsa combina jugo de limón con tomate — a menudo una mezcla de tomate de árbol y tomate común — y a veces se suaviza con jugo de naranja, dando al ceviche ecuatoriano una acidez suave en lugar del mordisco agudo de las versiones vecinas.\\n\\nEl ceviche se arma rápidamente una vez que los camarones están fríos: cebolla morada, cilantro, ají y tomate se incorporan a la marinada, y el plato reposa brevemente antes de servirse. Generalmente se come con chifles — finas chips de plátano fritas — o maíz tostado, que absorben la salsa y aportan un contraste crujiente frente al camarón tierno.",
      fr: "Le ceviche de crevettes équatorien se distingue de l\'original péruvien sur un point important : les crevettes sont précuites plutôt que simplement cuites par l\'acidité du citron, ce qui rend le plat plus léger et accessible. La sauce associe jus de citron vert et tomate — souvent un mélange de tomate de arbre et de tomate ordinaire — et est parfois adoucie d\'un peu de jus d\'orange, donnant au ceviche équatorien une acidité douce plutôt que le mordant tranchant des versions voisines.\\n\\nLe ceviche se prépare rapidement une fois les crevettes refroidies : oignon rouge, coriandre, piment et tomate sont mélangés dans la marinade, et le plat repose brièvement avant d\'être servi. Il s\'accompagne généralement de chifles — fines chips de plantain frites — ou de maïs grillé, qui absorbent la sauce et apportent un contraste croquant aux crevettes tendres.",
      de: "Das ecuadorianische Garnelen-Ceviche unterscheidet sich vom peruanischen Original in einem wesentlichen Punkt: Die Garnelen sind vorgekocht statt nur durch Zitronensäure gegart, was das Gericht leichter und zugänglicher macht. Die Sauce verbindet Limettensaft mit Tomate — häufig eine Mischung aus Baumtomate und normaler Tomate — und wird manchmal mit Orangensaft abgerundet, sodass das ecuadorianische Ceviche eine mildere Säure erhält als die Versionen der Nachbarländer.\\n\\nDas Ceviche wird schnell zusammengestellt, sobald die Garnelen kalt sind: Rote Zwiebel, Koriander, Chili und Tomate werden in die Marinade eingerührt, und das Gericht ruht kurz vor dem Servieren. Gegessen wird es meist mit Chifles — dünnen gebratenen Kochbananenchips — oder geröstetem Mais, die die Sauce aufsaugen und einen knusprigen Kontrast zu den zarten Garnelen bieten.",
      pt: "O ceviche de camarão equatoriano difere do original peruano num ponto importante: os camarões são pré-cozidos em vez de apenas curados pelo ácido cítrico, tornando o prato mais leve e acessível. O molho combina suco de limão com tomate — frequentemente uma mistura de tomate de árvore e tomate comum — e às vezes é suavizado com suco de laranja, dando ao ceviche equatoriano uma acidez mais suave do que as versões vizinhas.\\n\\nO ceviche é montado rapidamente após os camarões esfriarem: cebola roxa, coentro, pimenta e tomate são incorporados à marinada, e o prato descansa brevemente antes de ser servido. É tipicamente acompanhado de chifles — finas chips de banana-da-terra fritas — ou milho torrado, que absorvem o molho e oferecem contraste crocante aos camarões macios.",
      ru: "Эквадорское севиче из креветок отличается от перуанского оригинала в одном важном отношении: креветки предварительно сварены, а не приготовлены только кислотой цитрусовых, что делает блюдо легче и доступнее. Соус сочетает сок лайма с томатом — нередко смесью древесного томата и обычного — и порой смягчается апельсиновым соком, придавая эквадорскому севиче мягкую кислинку вместо острой свежести соседних версий.\\n\\nСевиче собирается быстро, как только креветки остыли: красный лук, кинза, чили и томат перемешиваются в маринаде, и блюдо ненадолго настаивается перед подачей. Едят его обычно с чифлес — тонкими жареными чипсами из плантана — или поджаренной кукурузой, которые впитывают соус и создают хрустящий контраст с нежными креветками.",
      ar: "يختلف سيفيتشي الروبيان الإكوادوري عن الأصل البيروفي في نقطة جوهرية: الروبيان مطبوخ مسبقاً بدلاً من أن يُنضج بحمض الحمضيات وحده، مما يجعل الطبق أخف وأكثر يُسراً. تجمع الصلصة عصير الليمون الأخضر مع الطماطم — في الغالب مزيج من طماطم الشجرة والطماطم العادية — وأحياناً يُلطَّف بعصير البرتقال، مما يمنح السيفيتشي الإكوادوري حموضة ناعمة لا اللسعة الحادة للنسخ المجاورة.\\n\\nيُجمَّع السيفيتشي بسرعة حين يبرد الروبيان: تُضاف البصلة الحمراء والكزبرة والفلفل الحار والطماطم إلى التتبيل، ويرتاح الطبق قليلاً قبل التقديم. يُؤكل عادةً مع الشيفليس — رقائق الموز المقلية الرفيعة — أو الذرة المحمصة، التي تمتص الصلصة وتوفر تناقضاً مقرمشاً مع الروبيان الطري.",
      zh: "厄瓜多尔虾酸橘汁腌与秘鲁原版有一个重要区别：虾是预先煮熟的，而不是仅靠柑橘酸腌熟，这使菜肴更清淡易接受。酱汁将青柠汁与番茄结合——通常是树番茄与普通番茄的混合——有时用橙汁加以柔化，赋予厄瓜多尔版酸橘汁腌一种温和的酸度，而非邻国版本的犀利刺激。\\n\\n虾冷却后便可迅速组合：红洋葱、香菜、辣椒和番茄拌入腌汁，短暂静置后即可上桌。通常搭配chifles——薄脆的炸芭蕉片——或烤玉米，它们吸收酱汁，与嫩虾形成酥脆的对比。",
      ja: "エクアドルのエビのセビーチェはペルーのオリジナルと一点で異なる：エビは柑橘の酸だけで調理するのではなくあらかじめ加熱済みであり、料理をよりさっぱりと親しみやすいものにしている。ソースはライムジュースとトマトを合わせたもの——ツリートマトと通常のトマトのブレンドが多い——で、時にオレンジジュースで丸みを出し、エクアドルのセビーチェに穏やかな酸味をもたらす。\\n\\nエビが冷えたら素早く仕上げる：赤玉ねぎ、コリアンダー、チリ、トマトをマリネに混ぜ、短時間置いてから提供する。チフレス——薄くスライスして揚げたプランテインチップス——または炒ったコーンと共に食べるのが一般的で、それらがソースを吸い込み、柔らかいエビとの歯応えのある対比を生む。",
      tr: "Ekvador\'un karides ceviche\'si Peru orijinalinden önemli bir noktada ayrılır: karidesleri yalnızca narenciye asidiyle pişirmek yerine önceden pişirilmiş kullanılır, bu da yemeği daha hafif ve erişilebilir kılar. Sos, limon suyu ve domatesi birleştirir — çoğunlukla ağaç domates ile normal domates karışımı — ve zaman zaman portakal suyuyla hafifletilir; böylece Ekvador ceviche\'si komşu versiyonların keskin ekşiliği yerine yumuşak bir asidite kazanır.\\n\\nKarideslerin soğumasının ardından ceviche hızla hazırlanır: kırmızı soğan, kişniş, acı biber ve domates marinata karıştırılır, yemek servis edilmeden önce kısa süre dinlenir. Genellikle chifles — ince kızartılmış plantain cipsleri — ya da kızarmış mısırla yenir; bunlar sosu emer ve yumuşak karideslerle çıtır bir kontrast sağlar.",
      it: "Il ceviche di gamberi ecuadoriano differisce dall\'originale peruviano in un punto importante: i gamberi sono precotti invece di essere semplicemente curati dall\'acido degli agrumi, rendendo il piatto più leggero e accessibile. La salsa combina succo di lime con pomodoro — spesso un misto di pomodoro di albero e pomodoro comune — e a volte viene ammorbidita con succo d\'arancia, conferendo al ceviche ecuadoriano un\'acidità delicata anziché il mordente tagliente delle versioni vicine.\\n\\nIl ceviche si prepara rapidamente non appena i gamberi sono freddi: cipolla rossa, coriandolo, peperoncino e pomodoro vengono mescolati nella marinata, e il piatto riposa brevemente prima di essere servito. Si mangia tipicamente con chifles — sottili chips di platano fritte — o mais tostato, che assorbono la salsa e forniscono un contrasto croccante ai gamberi teneri.",
      ko: "에콰도르의 새우 세비체는 페루 원조와 한 가지 중요한 점에서 다릅니다: 새우를 감귤 산으로만 조리하는 것이 아니라 미리 익혀서 사용해, 요리를 더 가볍고 친근하게 만듭니다. 소스는 라임즙과 토마토를 결합하며 — 종종 나무 토마토와 일반 토마토의 혼합 — 때로는 오렌지 주스로 부드럽게 하여, 에콰도르 세비체에 이웃 버전들의 날카로운 신맛 대신 은은한 산미를 줍니다.\\n\\n새우가 식으면 세비체를 빠르게 조합합니다: 빨간 양파, 고수, 고추, 토마토를 마리네이드에 섞고, 서빙 전에 잠시 재웁니다. 보통 치플레스 — 얇게 튀긴 플랜테인 칩 — 또는 볶은 옥수수와 함께 먹으며, 이것들이 소스를 흡수하고 부드러운 새우와 바삭한 대조를 이룹니다.",
      hi: "इक्वेडोर का झींगा सेविचे पेरूवियन मूल से एक महत्वपूर्ण तरीके से अलग है: झींगे को केवल खट्टे रस से पकाने के बजाय पहले से पकाया जाता है, जो व्यंजन को हल्का और अधिक सुलभ बनाता है। सॉस नींबू के रस और टमाटर को मिलाती है — अक्सर पेड़ टमाटर और साधारण टमाटर का मिश्रण — और कभी-कभी संतरे के रस से नरम किया जाता है, जो इक्वेडोरियन सेविचे को पड़ोसी संस्करणों की तीखी चुभन के बजाय हल्की खटास देता है।\\n\\nझींगे ठंडे होने पर सेविचे जल्दी तैयार होता है: लाल प्याज़, धनिया, मिर्च और टमाटर मैरिनेड में मिलाए जाते हैं, और व्यंजन परोसने से पहले थोड़ी देर रखा जाता है। यह आमतौर पर चिफ्लेस — पतले तले हुए प्लांटेन चिप्स — या भुने हुए मकई के साथ खाया जाता है, जो सॉस को सोख लेते हैं और कोमल झींगे के साथ कुरकुरा विपरीत प्रदान करते हैं।"
    }'''

if old_originText in data:
    data = data.replace(old_originText, new_originText, 1)
    open('public/js/recipes.js', 'w', encoding='utf-8').write(data)
    print('Done')
else:
    print('originText block NOT FOUND')
