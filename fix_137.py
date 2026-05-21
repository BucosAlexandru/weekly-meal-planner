with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ID 137 - Ichlekli (Turkmenistan) - category already has hi

content = content.replace(
    '      ko: "투르크메니스탄"\n    },\n    name: {\n      ro: "Ichlekli"',
    '      ko: "투르크메니스탄",\n      hi: "तुर्कमेनिस्तान"\n    },\n    name: {\n      ro: "Ichlekli"'
)

content = content.replace(
    '      ko: "이흘레클리"\n    },\n    category: {',
    '      ko: "이흘레클리",\n      hi: "इचलेक्ली"\n    },\n    category: {'
)

content = content.replace(
    '      ko: ["반죽", "양고기", "양파", "감자", "향신료", "기름"]\n    },\n    howIsMade: {',
    '      ko: ["반죽", "양고기", "양파", "감자", "향신료", "기름"],\n      hi: ["आटा", "मेमना", "प्याज़", "आलू", "मसाले", "तेल"]\n    },\n    howIsMade: {'
)

content = content.replace(
    '      ko: "반죽을 밀어 다진 고기와 양파를 채우고 다른 반죽으로 덮어 노릇해질 때까지 오븐에 굽습니다."\n    },\n    originText: {\n      ro: "Ichlekli este',
    '      ko: "반죽을 밀어 다진 고기와 양파를 채우고 다른 반죽으로 덮어 노릇해질 때까지 오븐에 굽습니다.",\n      hi: "सरल आटा बेलें, कीमा और प्याज़ से भरें, दूसरी परत से ढकें और सुनहरा होने तक बेक करें।"\n    },\n    originText: {\n      ro: "Ichlekli este'
)

old_origin = '''    originText: {
      ro: "Ichlekli este o rețetă tradițională din Turkmenistan.",
      en: "Ichlekli is a traditional recipe from Turkmenistan.",
      es: "Ichlekli es una receta tradicional de Turkmenistán.",
      fr: "Ichlekli est une recette traditionnelle du Turkménistan.",
      de: "Ichlekli ist ein traditionelles Rezept aus Turkmenistan.",
      pt: "Ichlekli é uma receita tradicional do Turquemenistão.",
      ru: "Ичлекли — традиционный рецепт из Туркмении.",
      ar: "إيشلكلي هي وصفة تقليدية من تركمانستان.",
      zh: "土库曼馅饼 是来自土库曼斯坦的传统食谱。",
      ja: "イチレクリ はトルクメニスタンの伝統的なレシピです。",
      tr: "Ichlekli Türkmenistan kökenli geleneksel bir tariftir.",
      it: "Ichlekli è una ricetta tradizionale del Turkmenistan.",
      ko: "이흘레클리는 투르크메니스탄의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Ichlekli este o plăcintă plată de carne specifică Turkmenistanului — două foi subțiri de aluat nedospit învelesc o umplutură de carne de miel sau vită tocată cu ceapă, condimentată cu chimen și piper, apoi coaptă sau prăjită pe foc direct. Preparatul face parte din tradiția culinară nomadă a Asiei Centrale, unde pâinile umplute ușor de transportat erau esențiale în migrație.\\n\\nIchlekli se servește fierbinte, adesea cu ceai verde sau lapte acrit. La nunți și adunări de familie, se pregătesc mai multe plăcinte mari în același timp. Aluatul subțire și crocant care contrastează cu umplutura suculentă este semnătura preparatului.",
      en: "Ichlekli is a flat meat pie specific to Turkmenistan — two thin sheets of unleavened dough enclose a filling of minced lamb or beef with onion, seasoned with cumin and pepper, then baked or fried directly on fire. The dish belongs to the nomadic culinary tradition of Central Asia, where easily portable stuffed breads were essential during migration.\\n\\nIchlekli is served hot, often with green tea or soured milk. At weddings and family gatherings, several large pies are prepared at the same time. The thin, crispy dough contrasting with the juicy filling is the dish's signature.",
      es: "Ichlekli es una empanada plana de carne específica de Turkmenistán — dos finas láminas de masa sin levadura encierran un relleno de carne de cordero o ternera picada con cebolla, sazonada con comino y pimienta, luego horneada o frita directamente al fuego. El plato pertenece a la tradición culinaria nómada de Asia Central, donde los panes rellenos fáciles de transportar eran esenciales durante las migraciones.\\n\\nEl ichlekli se sirve caliente, a menudo con té verde o leche agria. En bodas y reuniones familiares se preparan varias tartas grandes al mismo tiempo. La masa fina y crujiente contrastando con el relleno jugoso es la firma del plato.",
      fr: "L'ichlekli est une tarte plate à la viande typique du Turkménistan — deux fines feuilles de pâte non levée renferment une farce d'agneau ou de bœuf haché avec oignon, assaisonnée de cumin et de poivre, puis cuite au four ou frite directement sur le feu. Le plat appartient à la tradition culinaire nomade d'Asie centrale, où les pains farcis faciles à transporter étaient essentiels lors des migrations.\\n\\nL'ichlekli se sert chaud, souvent avec du thé vert ou du lait aigre. Lors des mariages et des rassemblements familiaux, plusieurs grandes tartes sont préparées simultanément. La pâte fine et croustillante contrastant avec la farce juteuse est la signature du plat.",
      de: "Ichlekli ist eine flache Fleischpastete aus Turkmenistan — zwei dünne Schichten ungesäuerten Teigs umhüllen eine Füllung aus gehacktem Lamm- oder Rindfleisch mit Zwiebeln, gewürzt mit Kreuzkümmel und Pfeffer, dann gebacken oder direkt über dem Feuer gebraten. Das Gericht gehört zur nomadischen Kochtradition Zentralasiens, wo leicht tragbare gefüllte Brote bei Wanderungen unverzichtbar waren.\\n\\nIchlekli wird heiß serviert, oft mit grünem Tee oder Sauermilch. Bei Hochzeiten und Familientreffen werden mehrere große Pasteten gleichzeitig zubereitet. Der dünne, knusprige Teig im Kontrast zur saftigen Füllung ist das Markenzeichen des Gerichts.",
      pt: "Ichlekli é uma torta plana de carne específica do Turcomenistão — duas finas folhas de massa não fermentada envolvem um recheio de carne de cordeiro ou bovino picada com cebola, temperada com cominho e pimenta, depois assada ou frita diretamente no fogo. O prato pertence à tradição culinária nômade da Ásia Central, onde pães recheados de fácil transporte eram essenciais durante as migrações.\\n\\nO ichlekli é servido quente, frequentemente com chá verde ou leite azedo. Em casamentos e reuniões familiares, várias tortas grandes são preparadas ao mesmo tempo. A massa fina e crocante contrastando com o recheio suculento é a marca registrada do prato.",
      ru: "Ичлекли — плоский мясной пирог, характерный для Туркменистана: два тонких листа пресного теста обволакивают начинку из рубленой баранины или говядины с луком, приправленной зирой и перцем, затем выпекают или жарят прямо на огне. Блюдо принадлежит к кочевой кулинарной традиции Средней Азии, где легко переносимые фаршированные лепёшки были незаменимы в пути.\\n\\nИчлекли подают горячим, нередко с зелёным чаем или кисломолочным напитком. На свадьбах и семейных торжествах одновременно готовят несколько больших пирогов. Тонкое хрустящее тесто в контрасте с сочной начинкой — отличительная черта блюда.",
      ar: "إيشلكلي فطيرة لحم مسطحة مميزة لتركمانستان — ورقتان رقيقتان من العجين الفطير تحيطان بحشوة من اللحم المفروم (ضأن أو بقر) مع البصل، متبلة بالكمون والفلفل، ثم تُخبز أو تُقلى مباشرة على النار. ينتمي الطبق إلى التقليد الطهوي البدوي لآسيا الوسطى، حيث كانت خبزة الحشو سهلة الحمل ضرورية في التنقل.\\n\\nيُقدَّم الإيشلكلي ساخناً، غالباً مع الشاي الأخضر أو اللبن الرائب. في الأعراس والتجمعات العائلية تُحضَّر عدة فطائر كبيرة في وقت واحد. العجينة الرقيقة المقرمشة في تناقض مع الحشوة العصيرية هي بصمة الطبق.",
      zh: "伊契勒克里是土库曼斯坦特有的扁圆肉饼——两张薄薄的无酵面皮包裹着用孜然和胡椒调味的羊肉或牛肉末与洋葱馅料，直接在火上烘烤或煎炸。这道菜属于中亚游牧饮食传统，那里便于携带的馅饼在迁徙中不可或缺。\\n\\n伊契勒克里趁热食用，常搭配绿茶或酸奶。婚礼和家庭聚会时会同时制作多张大饼。薄脆的饼皮与多汁馅料形成的对比是这道菜的标志。",
      ja: "イチレクリはトルクメニスタン特有の平らなミートパイです——二枚の薄い無発酵の生地が、クミンとコショウで味付けされた羊肉か牛肉のひき肉と玉ねぎの詰め物を包み込み、オーブンで焼くか直火で揚げます。この料理は中央アジアの遊牧民の料理伝統に属しており、移牧中に持ち運びしやすいパン包みが必須でした。\\n\\nイチレクリは熱いまま提供され、緑茶や酸乳とともに食べます。結婚式や家族の集まりでは、大きなパイが同時にいくつも作られます。薄くてカリカリの生地とジューシーな詰め物のコントラストがこの料理の特徴です。",
      tr: "Ichlekli, Türkmenistan'a özgü yassı bir et böreğidir — iki ince mayasız hamur yaprağı, soğanla birlikte kuzu veya dana kıymasından yapılmış, kimyon ve biberle tatlandırılmış bir iç malzemeyi sarar, ardından fırında pişirilir veya doğrudan ateşte kızartılır. Yemek, taşıması kolay doldurulmuş ekmeklerin göç sırasında vazgeçilmez olduğu Orta Asya'nın göçebe mutfak geleneğine aittir.\\n\\nIchlekli sıcak servis edilir, genellikle yeşil çay veya ekşi sütle birlikte. Düğünlerde ve aile toplantılarında aynı anda birkaç büyük börek hazırlanır. İnce, çıtır hamur ile sulu iç malzeme arasındaki kontrast yemeğin ayırt edici özelliğidir.",
      it: "L'ichlekli è una torta piatta di carne specifica del Turkmenistan — due sottili fogli di pasta non lievitata avvolgono un ripieno di agnello o manzo macinato con cipolla, condito con cumino e pepe, poi cotto in forno o fritto direttamente sul fuoco. Il piatto appartiene alla tradizione culinaria nomade dell'Asia centrale, dove i pani farciti facili da trasportare erano essenziali durante le migrazioni.\\n\\nL'ichlekli si serve caldo, spesso con tè verde o latte acido. A matrimoni e riunioni di famiglia si preparano più torte grandi contemporaneamente. La pasta sottile e croccante in contrasto con il ripieno succoso è il segno distintivo del piatto.",
      ko: "이흘레클리는 투르크메니스탄 특유의 납작한 고기 파이입니다. 두 장의 얇은 무발효 반죽이 쿠민과 후추로 양념된 양고기 또는 소고기 다짐육과 양파 속을 감싸며, 오븐에 굽거나 직화로 튀깁니다. 이 요리는 이동 중에 쉽게 들고 다닐 수 있는 속 채운 빵이 필수적이었던 중앙아시아 유목 요리 전통에 속합니다.\\n\\n이흘레클리는 녹차나 발효유와 함께 뜨겁게 제공됩니다. 결혼식이나 가족 모임에서는 여러 개의 큰 파이를 동시에 만듭니다. 얇고 바삭한 반죽과 육즙 넘치는 속의 대비가 이 요리의 특징입니다.",
      hi: "इचलेक्ली तुर्कमेनिस्तान की एक खास चपटी मांस पाई है — बिना खमीर के आटे की दो पतली परतें कीमा (मेमना या गोमांस), प्याज़, जीरा और काली मिर्च से भरी होती हैं, फिर ओवन में बेक या सीधे आग पर तली जाती हैं। यह व्यंजन मध्य एशिया की खानाबदोश रसोई परंपरा का हिस्सा है, जहाँ यात्रा के दौरान आसानी से ले जाई जाने वाली भरी हुई रोटियाँ आवश्यक थीं।\\n\\nइचलेक्ली गर्म परोसी जाती है, अक्सर हरी चाय या दही के साथ। शादियों और पारिवारिक समारोहों में एक साथ कई बड़ी पाई बनाई जाती हैं। पतली, कुरकुरी परत और रसदार भराव का विपरीत इस व्यंजन की पहचान है।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 137 done")
