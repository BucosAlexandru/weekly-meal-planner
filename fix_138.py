with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ID 138 - Chicken Kiev (Ukraine) - all fields need hi

content = content.replace(
    '      ko: "우크라이나"\n    },\n    name: {\n      ro: "Pui Kiev"',
    '      ko: "우크라이나",\n      hi: "यूक्रेन"\n    },\n    name: {\n      ro: "Pui Kiev"'
)

content = content.replace(
    '      ko: "치킨 키예프"\n    },\n    category: {\n      ro: "Cină"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["piept de pui"',
    '      ko: "치킨 키예프",\n      hi: "चिकन कीव"\n    },\n    category: {\n      ro: "Cină"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["piept de pui"'
)

content = content.replace(
    '      ko: "저녁"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["piept de pui"',
    '      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["piept de pui"'
)

content = content.replace(
    '      ko: ["닭가슴살", "버터", "마늘", "파슬리", "계란", "빵가루", "밀가루", "기름", "소금", "후추"]\n    },\n    howIsMade: {',
    '      ko: ["닭가슴살", "버터", "마늘", "파슬리", "계란", "빵가루", "밀가루", "기름", "소금", "후추"],\n      hi: ["चिकन ब्रेस्ट", "मक्खन", "लहसुन", "अजमोद", "अंडा", "ब्रेड क्रम्ब्स", "आटा", "तेल", "नमक", "काली मिर्च"]\n    },\n    howIsMade: {'
)

content = content.replace(
    '      ko: "닭가슴살에 버터, 마늘, 파슬리를 채워 말고 밀가루, 계란, 빵가루를 입혀 노릇해질 때까지 튀깁니다."\n    },\n    originText: {\n      ro: "Pui Kiev este',
    '      ko: "닭가슴살에 버터, 마늘, 파슬리를 채워 말고 밀가루, 계란, 빵가루를 입혀 노릇해질 때까지 튀깁니다.",\n      hi: "चिकन ब्रेस्ट में मक्खन, लहसुन और अजमोद भरें, रोल करें, आटे, अंडे और ब्रेड क्रम्ब्स से कोट करें, सुनहरा होने तक तलें।"\n    },\n    originText: {\n      ro: "Pui Kiev este'
)

old_origin = '''    originText: {
      ro: "Pui Kiev este o rețetă tradițională din Ucraina.",
      en: "Chicken Kiev is a traditional recipe from Ukraine.",
      es: "Pollo Kiev es una receta tradicional de Ucrania.",
      fr: "Poulet Kiev est une recette traditionnelle de l'Ukraine.",
      de: "Kiewer Hähnchen ist ein traditionelles Rezept aus der Ukraine.",
      pt: "Frango à Kiev é uma receita tradicional da Ucrânia.",
      ru: "Котлета по-киевски — традиционный рецепт из Украины.",
      ar: "دجاج كييف هي وصفة تقليدية من أوكرانيا.",
      zh: "基辅鸡排 是来自乌克兰的传统食谱。",
      ja: "キエフ風チキン はウクライナの伝統的なレシピです。",
      tr: "Tavuk Kiev Ukrayna kökenli geleneksel bir tariftir.",
      it: "Pollo Kiev è una ricetta tradizionale dell'Ucraina.",
      ko: "치킨 키예프는 우크라이나의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Cotlet de pui Kiev este un preparat de rafinament tehnic excepțional: un piept de pui dezosat bătut subțire în jurul unui cilindru de unt rece amestecat cu usturoi și pătrunjel, apoi panat triplu — făină, ou bătut, pesmet — și prăjit adânc. La tăiere, untul topit explodează în flux auriu — efectul dramatic este intenționat și doriț.\\n\\nOriginea este disputată: Ucraina îl revendică ca moștenire națională, iar unii istorici îl atribuie bucătăriei ruse de înaltă clasă din secolul XIX influențată de tehnicile franceze. Popularizat internațional în restaurantele ucrainene din diaspora și în meniurile hoteliere occidentale în prima jumătate a secolului XX.",
      en: "Chicken Kiev is a dish of exceptional technical refinement: a deboned chicken breast pounded thin around a cylinder of cold butter mixed with garlic and parsley, then triple-breaded — flour, beaten egg, breadcrumbs — and deep-fried. When cut, the melted butter explodes in a golden stream — the dramatic effect is intentional and desired.\\n\\nThe origin is disputed: Ukraine claims it as national heritage, while some historians attribute it to nineteenth-century Russian haute cuisine influenced by French techniques. It was popularised internationally by Ukrainian diaspora restaurants and Western hotel menus in the first half of the twentieth century.",
      es: "El pollo Kiev es un plato de refinamiento técnico excepcional: una pechuga de pollo deshuesada aplastada fina alrededor de un cilindro de mantequilla fría mezclada con ajo y perejil, luego empanada tres veces — harina, huevo batido, pan rallado — y frita en aceite abundante. Al cortarlo, la mantequilla derretida explota en un chorro dorado — el efecto dramático es intencional.\\n\\nEl origen es disputado: Ucrania lo reivindica como herencia nacional, mientras algunos historiadores lo atribuyen a la alta cocina rusa del siglo XIX con influencia francesa. Se popularizó internacionalmente gracias a los restaurantes de la diáspora ucraniana.",
      fr: "Le poulet Kiev est un plat d'un raffinement technique exceptionnel : un blanc de poulet désossé aplati finement autour d'un cylindre de beurre froid mélangé à de l'ail et du persil, puis pané trois fois — farine, œuf battu, chapelure — et frit en friture profonde. À la coupe, le beurre fondu jaillit en filet doré — l'effet dramatique est voulu.\\n\\nL'origine est disputée : l'Ukraine le revendique comme héritage national, tandis que certains historiens l'attribuent à la haute cuisine russe du XIXe siècle influencée par les techniques françaises. Il fut popularisé à l'international par les restaurants de la diaspora ukrainienne.",
      de: "Hühnchen Kiew ist ein Gericht von außergewöhnlicher handwerklicher Raffinesse: eine entbeinte Hähnchenbrust, dünn um einen Zylinder aus kalter Butter mit Knoblauch und Petersilie geschlagen, dann dreifach paniert — Mehl, verquirltes Ei, Paniermehl — und tiefgebraten. Beim Aufschneiden explodiert die geschmolzene Butter in einem goldenen Strahl — der dramatische Effekt ist beabsichtigt.\\n\\nDer Ursprung ist umstritten: Die Ukraine beansprucht es als nationales Erbe, während einige Historiker es der russischen Haute Cuisine des 19. Jahrhunderts mit französischem Einfluss zuschreiben. Durch ukrainische Diaspora-Restaurants und westliche Hotelmenüs wurde es international bekannt.",
      pt: "O frango à Kiev é um prato de refinamento técnico excepcional: um peito de frango desossado batido fino ao redor de um cilindro de manteiga fria misturada com alho e salsa, depois empanado três vezes — farinha, ovo batido, pão ralado — e frito em óleo abundante. Ao ser cortado, a manteiga derretida explode em jato dourado — o efeito dramático é intencional.\\n\\nA origem é disputada: a Ucrânia reivindica-o como herança nacional, enquanto alguns historiadores o atribuem à haute cuisine russa do século XIX influenciada por técnicas francesas. Foi popularizado internacionalmente pelos restaurantes da diáspora ucraniana.",
      ru: "Котлета по-киевски — блюдо исключительной технической изысканности: обваленная куриная грудка, раскатанная вокруг цилиндра холодного масла с чесноком и петрушкой, затем тройная панировка — мука, взбитое яйцо, панировочные сухари — и глубокое жарение. При разрезании расплавленное масло вырывается золотой струёй — драматический эффект нарочит и желателен.\\n\\nПроисхождение спорно: Украина считает блюдо национальным достоянием, тогда как часть историков приписывает его русской высокой кухне XIX века, испытавшей французское влияние. Широкую известность оно получило через рестораны украинской диаспоры и западные отельные меню.",
      ar: "دجاج كييف طبق يتميز بصنعة تقنية استثنائية: صدر دجاج منزوع العظم يُرقق حول أسطوانة من الزبدة الباردة المخلوطة بالثوم والبقدونس، ثم يُغطى بثلاث طبقات — دقيق ثم بيض مخفوق ثم بقسماط — ويُقلى في زيت غزير. عند تقطيعه، تنفجر الزبدة المذابة في تدفق ذهبي — والأثر المسرحي مقصود ومطلوب.\\n\\nأصله موضع خلاف: تطالب أوكرانيا به تراثاً وطنياً، بينما يعزوه بعض المؤرخين إلى المطبخ الراقي الروسي في القرن التاسع عشر المتأثر بالتقنيات الفرنسية. انتشر دولياً عبر مطاعم المغتربين الأوكرانيين وقوائم طعام الفنادق الغربية.",
      zh: "基辅鸡排是一道技术精湛的菜肴：将去骨鸡胸肉拍薄，包裹一块混有大蒜和香菜的冷黄油，再经过三重裹粉——面粉、打散的蛋液、面包屑——然后深炸。切开时，融化的黄油以金色液流喷涌而出——这种戏剧性效果是刻意为之的。\\n\\n关于起源存在争议：乌克兰将其视为民族遗产，而部分历史学家将其归为受法式技法影响的19世纪俄罗斯高级料理。20世纪上半叶，该菜肴通过乌克兰移民餐厅和西方酒店菜单在国际上广泛流传。",
      ja: "キエフ風チキンは卓越した技術的な洗練さを持つ料理です：骨を取り除いた鶏むね肉を、ニンニクとパセリを混ぜた冷たいバターの筒の周りに薄く広げ、三重にパン粉をつけ——小麦粉、溶き卵、パン粉——深揚げします。切ったとき、溶けたバターが金色の流れとして飛び出します——この劇的な効果は意図的なものです。\\n\\n起源は争われています：ウクライナは国家的遺産として主張していますが、一部の歴史家はフランス技法の影響を受けた19世紀ロシアの高級料理に帰しています。20世紀前半にウクライナ移民レストランと西洋ホテルのメニューを通じて国際的に広まりました。",
      tr: "Tavuk Kiev, olağanüstü teknik inceliğe sahip bir yemektir: sarımsak ve maydanozla karıştırılmış soğuk bir tereyağı silindirinin etrafına ince dövülmüş kemiksiz bir tavuk göğsü, ardından üç kat ekmek kırıntısı kaplama — un, çırpılmış yumurta, galeta unu — ve derin kızartma. Kesildiğinde erimiş tereyağı altın bir akış halinde fışkırır — dramatik etki kasıtlıdır.\\n\\nKöken tartışmalıdır: Ukrayna bunu ulusal miras olarak talep ederken, bazı tarihçiler onu Fransız tekniklerinden etkilenen 19. yüzyıl Rus alta mutfağına bağlar. 20. yüzyılın ilk yarısında Ukrayna diaspora restoranları ve Batı oteli menüleri aracılığıyla uluslararası alanda popülerleşti.",
      it: "Il pollo alla Kiev è un piatto di raffinamento tecnico eccezionale: un petto di pollo disossato appiattito sottile attorno a un cilindro di burro freddo mescolato con aglio e prezzemolo, poi impanato tre volte — farina, uovo sbattuto, pangrattato — e fritto in olio abbondante. Al taglio, il burro fuso esplode in un flusso dorato — l'effetto drammatico è voluto.\\n\\nL'origine è controversa: l'Ucraina lo rivendica come patrimonio nazionale, mentre alcuni storici lo attribuiscono all'alta cucina russa del XIX secolo influenzata dalle tecniche francesi. Fu popolarizzato a livello internazionale dai ristoranti della diaspora ucraina e dai menu degli hotel occidentali.",
      ko: "치킨 키예프는 뛰어난 기술적 완성도를 가진 요리입니다. 뼈를 제거한 닭가슴살을 마늘과 파슬리를 섞은 차가운 버터 덩어리 주위로 얇게 펴고, 세 겹으로 입혀——밀가루, 달걀, 빵가루——기름에 튀깁니다. 자를 때 녹은 버터가 황금빛으로 분출됩니다——이 극적인 효과는 의도된 것입니다.\\n\\n기원에 대해서는 논쟁이 있습니다. 우크라이나는 이를 국가 유산으로 주장하지만, 일부 역사가들은 프랑스 기법의 영향을 받은 19세기 러시아 고급 요리로 봅니다. 20세기 전반 우크라이나 이민자 레스토랑과 서양 호텔 메뉴를 통해 국제적으로 알려졌습니다.",
      hi: "चिकन कीव असाधारण तकनीकी परिष्कार का व्यंजन है: एक बोनलेस चिकन ब्रेस्ट को लहसुन और अजमोद मिले ठंडे मक्खन के बेलन के चारों ओर पतला पीटा जाता है, फिर तीन परतों में कोट किया जाता है — आटा, फेंटा अंडा, ब्रेड क्रम्ब्स — और डीप फ्राई किया जाता है। काटने पर पिघला मक्खन सुनहरी धारा में फूट पड़ता है — यह नाटकीय प्रभाव जानबूझकर बनाया जाता है।\\n\\nमूल के बारे में विवाद है: यूक्रेन इसे राष्ट्रीय विरासत मानता है, जबकि कुछ इतिहासकार इसे फ्रांसीसी तकनीकों से प्रभावित 19वीं सदी की रूसी उच्च पाक कला से जोड़ते हैं। 20वीं सदी के पूर्वार्ध में यूक्रेनी प्रवासी रेस्तरां और पश्चिमी होटल मेनू के ज़रिए अंतरराष्ट्रीय स्तर पर लोकप्रिय हुआ।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 138 done")
