import re

with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add hi to origin
content = content.replace(
    '      ko: "캄보디아"\n    },\n    name: {\n      ro: "Lok Lak"',
    '      ko: "캄보디아",\n      hi: "कंबोडिया"\n    },\n    name: {\n      ro: "Lok Lak"'
)

# Add hi to name
content = content.replace(
    '      ko: "로크 락"\n    },\n    category: {\n      ro: "Prânz"',
    '      ko: "로크 락",\n      hi: "लोक लाक"\n    },\n    category: {\n      ro: "Prânz"'
)

# Add hi to category
content = content.replace(
    '      ko: "점심"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["carne de vită", "sos de stridii"',
    '      ko: "점심",\n      hi: "दोपहर का खाना"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["carne de vită", "sos de stridii"'
)

# Add hi to ingredients
content = content.replace(
    '      ko: ["소고기", "굴 소스", "양파", "토마토", "상추", "후추", "계란"]\n    },\n    howIsMade: {',
    '      ko: ["소고기", "굴 소스", "양파", "토마토", "상추", "후추", "계란"],\n      hi: ["गोमांस", "ऑयस्टर सॉस", "प्याज़", "टमाटर", "सलाद पत्ता", "काली मिर्च", "अंडे"]\n    },\n    howIsMade: {'
)

# Add hi to howIsMade
content = content.replace(
    '      ko: "소고기 깍둑썰기를 마늘, 굴 소스, 후추와 함께 볶은 후 상추 위에 밥과 달걀 프라이를 곁들여 제공합니다."\n    },\n    originText: {\n      ro: "Lok Lak este',
    '      ko: "소고기 깍둑썰기를 마늘, 굴 소스, 후추와 함께 볶은 후 상추 위에 밥과 달걀 프라이를 곁들여 제공합니다.",\n      hi: "गोमांस के टुकड़ों को लहसुन, ऑयस्टर सॉस और काली मिर्च के साथ भूनें, फिर सलाद पत्तों पर चावल और तले हुए अंडे के साथ परोसें।"\n    },\n    originText: {\n      ro: "Lok Lak este'
)

# Replace originText
old_origin = '''    originText: {
      ro: "Lok Lak este o rețetă tradițională din Cambodgia.",
      en: "Lok Lak is a traditional recipe from Cambodia.",
      es: "Lok Lak es una receta tradicional de Camboya.",
      fr: "Lok Lak est une recette traditionnelle du Cambodge.",
      de: "Lok Lak ist ein traditionelles Rezept aus Kambodscha.",
      pt: "Lok Lak é uma receita tradicional do Camboja.",
      ru: "Лок лак — традиционный рецепт из Камбоджи.",
      ar: "لوك لاك هي وصفة تقليدية من كمبوديا.",
      zh: "柬埔寨牛肉 是来自柬埔寨的传统食谱。",
      ja: "ロックラック はカンボジアの伝統的なレシピです。",
      tr: "Lok Lak Kamboçya kökenli geleneksel bir tariftir.",
      it: "Lok Lak è una ricetta tradizionale della Cambogia.",
      ko: "로크 락은 캄보디아의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Lok Lak este cel mai cunoscut preparat din carne de vită al Cambodgiei, apărut prin confluența bucătăriei coloniale franceze cu tehnicile emigranților chinezi. Cuburile de carne marinată sunt prăjite rapid cu usturoi, sos de stridii și mult piper negru, rezultând bucăți lucioase cu aromă savuroasă adâncă.\\n\\nPresentarea este esențială: carnea se servește pe un pat de salată verde și roșii feliate, alături de orez fiert și ou ochi. Un mic bol cu zeamă de lămâie, sare și piper grosier vine separat ca sos de înmuiat, aducând prospețime citricată.",
      en: "Lok lak is Cambodia's best-known beef dish, born from the confluence of French colonial cooking and Chinese immigrant techniques. Cubes of marinated beef are tossed over high heat with garlic, oyster sauce, and a generous measure of black pepper, producing glossy, tender pieces with savoury depth.\\n\\nPresentation is central: the meat lands on a bed of crisp lettuce and sliced tomatoes alongside steamed rice and a fried egg. A small dish of lime juice, coarse salt, and freshly ground pepper arrives as a dipping sauce, cutting through the richness with citrus and heat.",
      es: "Lok lak es el plato de ternera más conocido de Camboya, nacido de la confluencia de la cocina colonial francesa y las técnicas de los emigrantes chinos. Los cubos de carne marinada se saltean a fuego vivo con ajo, salsa de ostras y abundante pimienta negra, obteniendo trozos tiernos y brillantes con profundidad sabrosa.\\n\\nLa presentación es fundamental: la carne reposa sobre una cama de lechuga crujiente y tomates laminados, junto con arroz al vapor y un huevo frito. Un pequeño bol de jugo de limón, sal gruesa y pimienta recién molida llega como salsa para mojar.",
      fr: "Lok lak est le plat de bœuf le plus emblématique du Cambodge, né de la rencontre entre la cuisine coloniale française et les techniques des immigrants chinois. Des cubes de bœuf mariné sont sautés à feu vif avec de l'ail, de la sauce d'huître et une bonne quantité de poivre noir, donnant des morceaux brillants et savoureux.\\n\\nLa présentation est centrale : la viande est déposée sur un lit de laitue croquante et de tomates émincées, avec du riz à la vapeur et un œuf au plat. Une petite coupelle de jus de citron vert, sel grossier et poivre fraîchement moulu accompagne en guise de sauce.",
      de: "Lok Lak ist Kambodschas bekanntestes Rindfleischgericht, entstanden aus der Verbindung französischer Kolonialküche und chinesischer Immigrantentechniken. Marinierte Rindfleischwürfel werden bei starker Hitze mit Knoblauch, Austernsauce und reichlich schwarzem Pfeffer gebraten — glänzend und aromatisch.\\n\\nDie Präsentation ist wesentlich: Das Fleisch liegt auf einem Bett aus knackigem Salat und geschnittenen Tomaten, begleitet von gedämpftem Reis und einem Spiegelei. Eine kleine Schale mit Limettensaft, grobem Salz und frisch gemahlenem Pfeffer dient als Dipp.",
      pt: "Lok lak é o prato de carne bovina mais famoso do Camboja, nascido da confluência da culinária colonial francesa com as técnicas dos imigrantes chineses. Cubos de carne marinada são salteados em fogo alto com alho, molho de ostra e bastante pimenta-do-reino, resultando em pedaços brilhantes e saborosos.\\n\\nA apresentação é central: a carne repousa sobre uma cama de alface crocante e tomates fatiados, acompanhada de arroz cozido no vapor e um ovo frito. Um pequeno recipiente com suco de limão, sal grosso e pimenta moída chega como molho.",
      ru: "Лок лак — самое известное блюдо из говядины в Камбодже, возникшее на стыке французской колониальной кухни и кулинарных техник китайских переселенцев. Маринованные кубики говядины обжариваются на сильном огне с чесноком, устричным соусом и щедрой порцией чёрного перца — глянцевые и ароматные.\\n\\nПодача принципиальна: мясо кладут на листья салата и ломтики помидоров, рядом — пропаренный рис и яичница. Маленькая пиала с лаймовым соком, крупной солью и свежемолотым перцем служит соусом для окунания.",
      ar: "لوك لاك هو أشهر أطباق لحم البقر في كمبوديا، نشأ من تقاطع المطبخ الاستعماري الفرنسي وتقنيات المهاجرين الصينيين. تُقلى مكعبات اللحم المتبّلة على نار عالية مع الثوم وصلصة المحار وكميات وافرة من الفلفل الأسود، لتنتج قطعاً لامعة غنية النكهة.\\n\\nطريقة التقديم محورية: يُوضع اللحم فوق سرير من الخس المقرمش وشرائح الطماطم مع الأرز المطهو وبيضة مقلية. تأتي صحيفة صغيرة بعصير الليمون والملح الخشن والفلفل المطحون كصلصة غمس.",
      zh: "洛拉克是柬埔寨最著名的牛肉菜肴，源于法国殖民烹饪与华人移民技术的交融。腌制牛肉块在大火中与大蒜、蚝油和大量黑胡椒翻炒，呈现出光泽诱人、咸香浓郁的口感。\\n\\n摆盘是其精髓：牛肉置于脆爽生菜和切片番茄之上，配以米饭和煎蛋。一小碟青柠汁、粗盐和现磨胡椒作为蘸料，为浓郁的牛肉增添酸爽与辛辣。",
      ja: "ロックラックはカンボジアで最も知られた牛肉料理で、フランス植民地時代の料理と中国系移民の技法が融合して生まれました。マリネした牛肉のサイコロ切りを強火でニンニク・オイスターソース・たっぷりの黒コショウと炒め、艶やかで旨味深い仕上がりにします。\\n\\nプレゼンテーションが重要で、肉はシャキシャキのレタスとスライストマトの上に乗り、蒸しご飯と目玉焼きを添えます。ライム汁・粗塩・挽きたてコショウの小皿がディップとして添えられ、豊かな旨味を引き締めます。",
      tr: "Lok lak, Kamboçya'nın en tanınmış dana eti yemeğidir; Fransız sömürge mutfağı ile Çinli göçmenlerin tekniklerinin buluşmasından doğmuştur. Marine edilmiş et küpleri yüksek ateşte sarımsak, istiridye sosu ve bol karabiberle sotelenir; parlak ve lezzetli parçalar elde edilir.\\n\\nSunum merkezidir: et, gevrek marul ve dilimlenmiş domates üzerine konulur; yanına buharda pişmiş pirinç ve kızarmış yumurta eşlik eder. Küçük bir kap içinde limon suyu, kaba tuz ve taze çekilmiş biber, dip sos olarak gelir.",
      it: "Lok lak è il piatto di manzo più famoso della Cambogia, nato dall'incontro tra la cucina coloniale francese e le tecniche degli immigrati cinesi. I cubetti di manzo marinato vengono saltati a fuoco vivo con aglio, salsa di ostriche e abbondante pepe nero, producendo bocconi lucidi e saporiti.\\n\\nLa presentazione è centrale: la carne viene adagiata su un letto di lattuga croccante e pomodori a fette, accompagnata da riso al vapore e un uovo fritto. Una ciotolina di succo di lime, sale grosso e pepe macinato fresco accompagna come salsa per intingere.",
      ko: "로크 락은 프랑스 식민지 요리와 중국 이민자 기법이 융합되어 탄생한 캄보디아의 대표 소고기 요리입니다. 재운 소고기 큐브를 마늘, 굴 소스, 넉넉한 흑후추와 함께 센 불에 볶아 광택 나고 깊은 풍미를 만들어냅니다.\\n\\n플레이팅이 핵심입니다. 고기는 아삭한 상추와 슬라이스 토마토 위에 얹히고, 찐 밥과 달걀 프라이가 곁들여집니다. 라임즙·굵은 소금·갓 간 후추를 담은 작은 그릇이 디핑 소스로 제공되어 풍미를 살려줍니다.",
      hi: "लोक लाक कंबोडिया का सबसे प्रसिद्ध गोमांस व्यंजन है, जो फ्रांसीसी औपनिवेशिक खाना पकाने और चीनी प्रवासी तकनीकों के संगम से जन्मा। मैरिनेड किए गोमांस के टुकड़ों को तेज़ आंच पर लहसुन, ऑयस्टर सॉस और भरपूर काली मिर्च के साथ भूना जाता है, जिससे चमकदार और स्वादिष्ट टुकड़े मिलते हैं।\\n\\nपरोसने का तरीका इस व्यंजन की पहचान है: मांस को कुरकुरे सलाद पत्तों और टमाटर के ऊपर रखा जाता है, साथ में भाप से पके चावल और तले हुए अंडे होते हैं। नींबू का रस, मोटा नमक और पिसी काली मिर्च की एक छोटी कटोरी डिपिंग सॉस के रूप में परोसी जाती है।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 114 done")
