with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add hi to origin
content = content.replace(
    '      ko: "핀란드"\n    },\n    name: {\n      ro: "Karjalanpiirakka"',
    '      ko: "핀란드",\n      hi: "फ़िनलैंड"\n    },\n    name: {\n      ro: "Karjalanpiirakka"'
)

# Add hi to name
content = content.replace(
    '      ko: "카렐리야 파이"\n    },\n    category: {\n      ro: "Mic dejun"',
    '      ko: "카렐리야 파이",\n      hi: "करेलियन पाई"\n    },\n    category: {\n      ro: "Mic dejun"'
)

# Add hi to category — Karelian Pie is Breakfast
content = content.replace(
    '      ko: "아침"\n    },\n    servings: 4,\n    tipType: \'veg\',\n    pairingsType: \'veg\',\n    ingredients: {\n      ro: ["făină de secară"',
    '      ko: "아침",\n      hi: "नाश्ता"\n    },\n    servings: 4,\n    tipType: \'veg\',\n    pairingsType: \'veg\',\n    ingredients: {\n      ro: ["făină de secară"'
)

# Add hi to ingredients
content = content.replace(
    '      ko: ["호밀가루", "쌀", "우유", "버터", "소금", "달걀"]\n    },\n    howIsMade: {',
    '      ko: ["호밀가루", "쌀", "우유", "버터", "소금", "달걀"],\n      hi: ["राई का आटा", "चावल", "दूध", "मक्खन", "नमक", "अंडे"]\n    },\n    howIsMade: {'
)

# Add hi to howIsMade
content = content.replace(
    '      ko: "얇은 호밀 반죽을 만들고 쌀죽이나 감자죽으로 채워 타원형으로 빚은 후 오븐에서 굽습니다."\n    },\n    originText: {\n      ro: "Karjalanpiirakka este',
    '      ko: "얇은 호밀 반죽을 만들고 쌀죽이나 감자죽으로 채워 타원형으로 빚은 후 오븐에서 굽습니다.",\n      hi: "राई के आटे से पतली लोई बनाएं, चावल या आलू की खिचड़ी भरें, अंडाकार आकार में बनाएं और ओवन में बेक करें।"\n    },\n    originText: {\n      ro: "Karjalanpiirakka este'
)

# Replace originText
old_origin = '''    originText: {
      ro: "Karjalanpiirakka este o rețetă tradițională din Finlanda.",
      en: "Karelian Pie is a traditional recipe from Finland.",
      es: "Pastel carelio es una receta tradicional de Finlandia.",
      fr: "Tarte carélienne est une recette traditionnelle de Finlande.",
      de: "Karelische Pirogge ist ein traditionelles Rezept aus Finnland.",
      pt: "Torta Carélia é uma receita tradicional da Finlândia.",
      ru: "Карельский пирог — традиционный рецепт из Финляндии.",
      ar: "فطيرة كاريليا هي وصفة تقليدية من فنلندا.",
      zh: "卡累利阿馅饼 是来自芬兰的传统食谱。",
      ja: "カレリアンピーラッカ はフィンランドの伝統的なレシピです。",
      tr: "Karelya Turtası Finlandiya kökenli geleneksel bir tariftir.",
      it: "Torta della Carelia è una ricetta tradizionale della Finlandia.",
      ko: "카렐리야 파이는 핀란드의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Plăcinta careliană — karjalanpiirakka — îşi are originea în regiunea Karelia, un teritoriu istoric împărțit astăzi între Finlanda și Rusia. Cojile ovale sunt făcute dintr-un aluat subțire și crocant de secară, ce înconjoară o umplutură moale de terci de orez gătit lent în lapte; umplutura de cartofi este o alternativă la fel de tradițională. Plăcintele se coc la temperatură ridicată până când secara devine crocantă.\\n\\nCalde din cuptor, karjalanpiirakka se ung cu un amestec de ouă fierte tare și unt — munavoi — care se topește în umplutură și temperează ușoara acreală a secarei. Plăcinta are statut protejat în Finlanda și se mănâncă oricând în cursul zilei.",
      en: "Karelian pie — karjalanpiirakka — originated in the region of Karelia, a historical territory now divided between Finland and Russia. The oval-shaped shells are made from a thin, crisp rye dough that frames a soft filling of rice porridge slow-cooked in milk; potato filling is an equally traditional alternative. The pies are baked at high heat until the rye crisps and the filling sets.\\n\\nWarm from the oven, karjalanpiirakka is spread with munavoi — a mixture of hard-boiled egg and butter that melts into the filling and tempers the slight sourness of the rye. The pie carries protected regional status in Finland and is eaten at any time of day.",
      es: "El pastel carelio — karjalanpiirakka — tiene su origen en la región de Carelia, un territorio histórico ahora dividido entre Finlandia y Rusia. Los caparazones ovalados están hechos de una masa de centeno fina y crujiente que rodea un relleno suave de gachas de arroz cocidas lentamente en leche; el relleno de patata es una alternativa igualmente tradicional. Los pasteles se hornean a alta temperatura.\\n\\nCalientes del horno, los karjalanpiirakka se untan con munavoi — una mezcla de huevo duro y mantequilla que se derrite en el relleno y tempera la ligera acidez del centeno. El pastel tiene estatus de protección regional en Finlandia.",
      fr: "La tarte carélienne — karjalanpiirakka — est originaire de la région de Carélie, un territoire historique aujourd'hui divisé entre la Finlande et la Russie. Les coques ovales sont faites d'une pâte de seigle fine et croustillante qui entoure une garniture douce de porridge de riz cuit lentement dans le lait ; la garniture de pommes de terre est une alternative tout aussi traditionnelle. Les tartes sont cuites à haute température.\\n\\nChaudes du four, les karjalanpiirakka sont badigeonnées de munavoi — un mélange d'œuf dur et de beurre qui fond dans la garniture et tempère la légère acidité du seigle.",
      de: "Die karelische Pirogge — karjalanpiirakka — stammt aus der Region Karelien, einem historischen Gebiet, das heute zwischen Finnland und Russland aufgeteilt ist. Die ovalen Schalen bestehen aus einem dünnen, knusprigen Roggenteig, der eine weiche Füllung aus in Milch langsam gekochtem Reisbrei umschließt; Kartoffelfüllung ist eine ebenso traditionelle Alternative. Die Pasteten werden bei hoher Temperatur gebacken.\\n\\nWarm aus dem Ofen werden karjalanpiirakka mit Munavoi bestrichen — einer Mischung aus hartgekochtem Ei und Butter, die in die Füllung schmilzt und die leichte Säure des Roggens mildert.",
      pt: "A torta da Carélia — karjalanpiirakka — tem origem na região da Carélia, um território histórico hoje dividido entre a Finlândia e a Rússia. As cascas ovais são feitas de uma massa de centeio fina e crocante que envolve um recheio suave de mingau de arroz cozido lentamente no leite; o recheio de batata é uma alternativa igualmente tradicional. As tortas são assadas em alta temperatura.\\n\\nQuentes do forno, as karjalanpiirakka são untadas com munavoi — uma mistura de ovo cozido e manteiga que derrete no recheio e suaviza a leve acidez do centeio.",
      ru: "Карельский пирог — карьяланпийракка — возник в регионе Карелия, историческом крае, ныне разделённом между Финляндией и Россией. Овальные оболочки сделаны из тонкого хрустящего ржаного теста, обрамляющего нежную начинку из рисовой каши, сваренной на молоке; картофельная начинка — не менее традиционная альтернатива. Пирожки запекают при высокой температуре.\\n\\nТёплыми из духовки их смазывают мунавои — смесью варёного яйца с маслом, которая тает в начинке и смягчает лёгкую кислинку ржи.",
      ar: "تأتي فطيرة كاريليا — كارياالانبييراكا — من منطقة كاريليا، وهي أرض تاريخية تنقسم حالياً بين فنلندا وروسيا. الأغلفة البيضاوية مصنوعة من عجينة جاودار رقيقة مقرمشة تحتضن حشوة ناعمة من عصيدة الأرز المطبوخة ببطء في الحليب؛ وحشوة البطاطس بديل تقليدي بالقدر ذاته. تُخبز الفطائر على حرارة عالية.\\n\\nساخنةً من الفرن، تُدهن بالمونافوي — خليط من البيض المسلوق والزبدة الذي يذوب في الحشوة ويلطّف حموضة الجاودار الخفيفة.",
      zh: "卡累利阿馅饼——karjalanpiirakka——起源于卡累利阿地区，这一历史领土如今分属芬兰和俄罗斯。椭圆形饼皮由薄而酥脆的黑麦面皮制成，包裹着用牛奶慢炖的米粥软馅；土豆馅同样是传统选项。馅饼在高温下烘烤至黑麦面皮酥脆。\\n\\n出炉后趁热涂上munavoi——由熟鸡蛋和黄油混合而成，融入馅料后能调和黑麦微微的酸涩。这款馅饼在芬兰享有受保护的地理标志，一天中任何时候都可食用。",
      ja: "カレリアンパイ——カリャーランピーラッカ——は、現在フィンランドとロシアに分かれた歴史的地域・カレリア発祥です。楕円形の皮は薄くパリパリのライ麦生地で、牛乳でゆっくり炊いた柔らかいライスポリッジを包んでいます。じゃがいも餡も同じくらい伝統的な選択肢です。高温で焼くとライ麦がパリッと仕上がります。\\n\\nオーブンから出したら温かいうちにムナヴォイ——固ゆで卵とバターを混ぜたもの——を塗ります。これが餡に溶け込み、ライ麦のほのかな酸味を和らげます。フィンランドでは地理的表示保護を受けており、朝から夜まで一日中食べられています。",
      tr: "Karelya turta — karjalanpiirakka — şu an Finlandiya ve Rusya arasında bölünmüş tarihi bir bölge olan Karelya'dan köken almaktadır. Oval kabuklar, sütü yavaşça pişirilerek hazırlanan yumuşak pirinç lapasını saran ince, çıtır çavdar hamurundan yapılır; patates dolgusı da aynı ölçüde geleneksel bir alternatiftir. Pastalar yüksek ısıda pişirilir.\\n\\nFırından sıcak çıkarılan karjalanpiirakka, haşlanmış yumurta ve tereyağının karıştırılmasıyla elde edilen munavoi ile sürülür. Bu karışım dolguya erir ve çavdarın hafif ekşiliğini yumuşatır.",
      it: "La torta caréliana — karjalanpiirakka — ha origine nella regione della Carelia, un territorio storico oggi diviso tra Finlandia e Russia. I gusci ovali sono fatti di una pasta di segale sottile e croccante che racchiude un morbido ripieno di porridge di riso cotto lentamente nel latte; il ripieno di patate è un'alternativa altrettanto tradizionale. Le torte vengono cotte ad alta temperatura.\\n\\nCalde dal forno, le karjalanpiirakka vengono spalmate con il munavoi — un misto di uovo sodo e burro che si scioglie nel ripieno e attenua la leggera acidità della segale.",
      ko: "카렐리야 파이——카리알란피라카——는 현재 핀란드와 러시아로 나뉜 역사적 지역인 카렐리야에서 유래했습니다. 타원형 껍질은 우유에서 천천히 끓인 부드러운 쌀죽을 감싸는 얇고 바삭한 호밀 반죽으로 만들어집니다. 감자 소도 전통적인 대안입니다. 파이는 고온에서 구워 호밀이 바삭해집니다.\\n\\n오븐에서 꺼낸 따뜻한 상태에서 무나보이——삶은 달걀과 버터를 섞은 것——를 발라 먹습니다. 이것이 소에 녹아들어 호밀의 약한 신맛을 부드럽게 합니다. 핀란드에서 지리적 표시 보호를 받으며 하루 중 언제든지 먹습니다.",
      hi: "करेलियन पाई — कार्यालानपीराका — करेलिया क्षेत्र से उत्पन्न हुई, एक ऐतिहासिक भूमि जो अब फ़िनलैंड और रूस के बीच विभाजित है। अंडाकार खोल पतले, कुरकुरे राई के आटे से बने होते हैं जो दूध में धीरे पकाई चावल की खिचड़ी की नरम भराई को घेरते हैं; आलू की भराई भी उतनी ही पारंपरिक है। पाई को तेज़ तापमान पर बेक किया जाता है।\\n\\nओवन से गर्म निकालकर मुनावोई — उबले अंडे और मक्खन का मिश्रण — लगाया जाता है जो भराई में पिघलकर राई की हल्की खटास को संतुलित करता है। इस पाई को फ़िनलैंड में संरक्षित क्षेत्रीय दर्जा प्राप्त है।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 121 done")
