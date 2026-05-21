with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add hi to origin
content = content.replace(
    '      ko: "페루"\n    },\n    name: {\n      ro: "Lomo Saltado"',
    '      ko: "페루",\n      hi: "पेरू"\n    },\n    name: {\n      ro: "Lomo Saltado"'
)

# Add hi to name
content = content.replace(
    '      ko: "로모 살타도"\n    },\n    category: {\n      ro: "Cină"\n      en: "Dinner"',
    '      ko: "로모 살타도",\n      hi: "लोमो सालताडो"\n    },\n    category: {\n      ro: "Cină"\n      en: "Dinner"'
)

# Safer: target the block that follows with 夕食 for ja (Lomo Saltado uses 夕食, not ディナー)
content = content.replace(
    '      ko: "로모 살타도"\n    },\n    category: {',
    '      ko: "로모 살타도",\n      hi: "लोमो सालताडो"\n    },\n    category: {'
)

# Add hi to category — Lomo Saltado's ja is 夕食
content = content.replace(
    '      ja: "夕食",\n      tr: "Akşam yemeği",\n      it: "Cena",\n      ko: "저녁"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["carne de vită", "cartofi"',
    '      ja: "夕食",\n      tr: "Akşam yemeği",\n      it: "Cena",\n      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["carne de vită", "cartofi"'
)

# Add hi to ingredients
content = content.replace(
    '      ko: ["소고기", "감자", "토마토", "양파", "파프리카", "간장", "쌀"]\n    },\n    howIsMade: {',
    '      ko: ["소고기", "감자", "토마토", "양파", "파프리카", "간장", "쌀"],\n      hi: ["गोमांस", "आलू", "टमाटर", "प्याज़", "शिमला मिर्च", "सोया सॉस", "चावल"]\n    },\n    howIsMade: {'
)

# Add hi to howIsMade
content = content.replace(
    '      ko: "소고기 스트립을 양파, 토마토, 파프리카와 함께 볶고 간장을 넣은 후 감자튀김과 밥과 함께 제공합니다."\n    },\n    originText: {\n      ro: "Lomo Saltado este',
    '      ko: "소고기 스트립을 양파, 토마토, 파프리카와 함께 볶고 간장을 넣은 후 감자튀김과 밥과 함께 제공합니다.",\n      hi: "गोमांस की पट्टियों को प्याज़, टमाटर और मिर्च के साथ भूनें, सोया सॉस डालें और फ्राइज़ व चावल के साथ परोसें।"\n    },\n    originText: {\n      ro: "Lomo Saltado este'
)

# Replace originText
old_origin = '''    originText: {
      ro: "Lomo Saltado este o rețetă tradițională din Peru.",
      en: "Lomo Saltado is a traditional recipe from Peru.",
      es: "Lomo Saltado es una receta tradicional de Perú.",
      fr: "Lomo Saltado est une recette traditionnelle du Pérou.",
      de: "Lomo Saltado ist ein traditionelles Rezept aus Peru.",
      pt: "Lomo Saltado é uma receita tradicional do Peru.",
      ru: "Ломо сальтадо — традиционный рецепт из Перу.",
      ar: "لومو سالتادو هي وصفة تقليدية من بيرو.",
      zh: "秘鲁牛肉炒薯条 是来自秘鲁的传统食谱。",
      ja: "ロモ・サルタード はペルーの伝統的なレシピです。",
      tr: "Lomo Saltado Peru kökenli geleneksel bir tariftir.",
      it: "Lomo Saltado è una ricetta tradizionale del Perù.",
      ko: "로모 살타도는 페루의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Lomo saltado este unul dintre cele mai iubite preparate peruane din tigaie, născut din tradiția chifa — fuziunea bucătăriei cantoneze cu ingredientele peruviene apărută în secolul al XIX-lea prin comunitățile de emigranți chinezi de pe coasta Pacificului. Fâșii de mușchi de vită se sotează la foc mare cu ceapă roșie, ají amarillo și roșii, apoi se stropesc cu sos de soia și un strop de oțet.\\n\\nPreparatul se servește cu doi amidon: cartofi prăjiți crispy adăugați direct în wok alături de carne, și un morman separat de orez alb. Combinația dintre tehnica chineză, ardeii peruvieni și cei doi carbohidrați este cu totul proprie — o fuziune care nu mai pare fuziune.",
      en: "Lomo saltado is one of Peru's most beloved stir-fries, born from the chifa tradition — the fusion of Cantonese cooking with Peruvian ingredients that emerged in the nineteenth century through Chinese immigrant communities along the Pacific coast. Strips of beef sirloin are sautéed over extreme heat with red onion, ají amarillo, and tomatoes, then doused with soy sauce and a splash of vinegar.\\n\\nThe dish arrives with two starches: crispy french fries folded directly into the wok alongside the meat, and a separate mound of white rice. The combination of Chinese technique, Peruvian peppers, and the dual carbohydrate is entirely its own thing — a fusion that no longer feels like fusion.",
      es: "Lomo saltado es uno de los salteados más queridos de Perú, nacido de la tradición chifa — la fusión de la cocina cantonesa con ingredientes peruanos surgida en el siglo XIX a través de las comunidades chinas en la costa del Pacífico. Tiras de solomillo se saltean a fuego intenso con cebolla roja, ají amarillo y tomates, regadas con salsa de soja y un chorrito de vinagre.\\n\\nEl plato se sirve con dos almidones: papas fritas crujientes dobladas directamente en el wok junto a la carne, y un montículo separado de arroz blanco. La combinación de técnica china, ajíes peruanos y el doble carbohidrato es totalmente propia.",
      fr: "Lomo saltado est l'un des sautés les plus appréciés du Pérou, né de la tradition chifa — la fusion de la cuisine cantonaise avec les ingrédients péruviens apparue au XIXe siècle à travers les communautés d'immigrants chinois sur la côte Pacifique. Des lanières de filet de bœuf sont sautées à feu vif avec oignon rouge, ají amarillo et tomates, puis arrosées de sauce soja et d'un trait de vinaigre.\\n\\nLe plat arrive avec deux féculents : des frites croustillantes incorporées directement dans le wok avec la viande, et un monticule séparé de riz blanc. La combinaison est entièrement la sienne.",
      de: "Lomo Saltado ist eines der beliebtesten peruanischen Pfannengerichte, geboren aus der Chifa-Tradition — der Fusion kantonesischer Küche mit peruanischen Zutaten, die im 19. Jahrhundert durch chinesische Einwanderergemeinschaften an der Pazifikküste entstand. Rinderfilestreifen werden bei starker Hitze mit roter Zwiebel, Ají Amarillo und Tomaten gebraten, dann mit Sojasoße und einem Schuss Essig übergossen.\\n\\nDas Gericht kommt mit zwei Sättigungsbeilagen: knusprige Pommes direkt in den Wok gefaltet und ein separater Hügel weißen Reis. Die Kombination ist vollständig eigenständig.",
      pt: "Lomo saltado é um dos salteados mais amados do Peru, nascido da tradição chifa — a fusão da culinária cantonesa com ingredientes peruanos que surgiu no século XIX através das comunidades de imigrantes chineses no litoral do Pacífico. Tiras de contrafilé são salteadas em fogo intenso com cebola roxa, ají amarillo e tomates, depois regadas com molho de soja e um toque de vinagre.\\n\\nO prato chega com dois amidos: batatas fritas crocantes dobradas diretamente no wok junto à carne, e um monte separado de arroz branco. A combinação é inteiramente sua.",
      ru: "Ломо сальтадо — одно из самых любимых жареных блюд Перу, рождённое из традиции чифа — слияния кантонской кухни с перуанскими ингредиентами, возникшего в XIX веке через китайские иммигрантские общины на тихоокеанском побережье. Полоски говяжьей вырезки обжаривают на сильном огне с красным луком, ají amarillo и помидорами, затем поливают соевым соусом и уксусом.\\n\\nБлюдо подаётся с двумя гарнирами: хрустящим картофелем фри, добавленным прямо в вок, и отдельной горой белого риса. Сочетание китайской техники, перуанских перцев и двойного углевода — нечто совершенно самостоятельное.",
      ar: "لومو سالتادو هو أحد أشهر أطباق التقليب في بيرو، وُلد من تقليد الشيفا — اندماج الطبخ الكانتوني مع المكونات البيروفية الذي ظهر في القرن التاسع عشر عبر مجتمعات المهاجرين الصينيين على ساحل المحيط الهادئ. تُقلى شرائح لحم الخاصرة على نار عالية مع البصل الأحمر والأجي أماريو والطماطم، ثم تُرش بصلصة الصويا وقليل من الخل.\\n\\nيُقدَّم الطبق مع نشويتين: بطاطس مقلية مقرمشة تُضاف مباشرةً إلى المقلاة مع اللحم، وكومة منفصلة من الأرز الأبيض. المزيج مميز تماماً.",
      zh: "洛莫萨尔塔多是秘鲁最受喜爱的炒菜之一，源自「奇花」传统——即广东烹饪技艺与秘鲁食材的融合，这一传统在19世纪通过太平洋沿岸的华人移民社区兴起。牛里脊条在猛火中与红洋葱、黄辣椒和番茄一起翻炒，再淋上酱油和少量醋。\\n\\n这道菜搭配两种淀粉：直接拌入炒锅的酥脆薯条和单独的白米饭。中式技法、秘鲁辣椒与双重碳水化合物的组合独树一帜——这是一种已不再感觉像「融合」的融合菜。",
      ja: "ロモ・サルタードはペルーで最も愛される炒め料理のひとつで、チファの伝統から生まれました。19世紀に太平洋岸の中国系移民コミュニティを通じて生まれた、広東料理とペルー食材の融合です。牛サーロインのストリップを強火で赤玉ねぎ・アヒ・アマリージョ・トマトと炒め、醤油と少量のビネガーをかけます。\\n\\n料理には二種類のでんぷんが添えられます：肉と一緒にウォックに直接加えたカリカリのフライドポテトと、別盛りの白ご飯。中国の技法、ペルーのペッパー、そしてダブル炭水化合物の組み合わせは完全に独自のもの――もはや「フュージョン」とは感じない融合です。",
      tr: "Lomo saltado, Peru'nun en sevilen wok yemeklerinden biridir; Pasifik kıyısındaki Çinli göçmen toplulukları aracılığıyla 19. yüzyılda ortaya çıkan Kantoncadan esinlenilmiş Chifa geleneğinden doğmuştur. Dana antrikot şeritleri, kırmızı soğan, ají amarillo ve domatesle yüksek ateşte sotelenir, ardından soya sosu ve biraz sirke ile tatlandırılır.\\n\\nYemek iki nişastayla gelir: Etle birlikte doğrudan woka eklenen çıtır patates kızartması ve ayrı bir tabak beyaz pirinç. Çin tekniği, Perulu biberler ve çift karbonhidratın birleşimi tamamen kendine özgü bir şeydir.",
      it: "Lomo saltado è uno dei saltati più amati del Perù, nato dalla tradizione chifa — la fusione della cucina cantonese con gli ingredienti peruviani emersa nel XIX secolo attraverso le comunità di immigrati cinesi sulla costa del Pacifico. Strisce di controfiletto vengono saltate a fuoco vivo con cipolla rossa, ají amarillo e pomodori, poi irrorate di salsa di soia e un goccio d'aceto.\\n\\nIl piatto arriva con due fonti di amido: patatine fritte croccanti aggiunte direttamente nel wok insieme alla carne, e un mucchio separato di riso bianco. La combinazione è completamente originale.",
      ko: "로모 살타도는 페루에서 가장 사랑받는 볶음 요리 중 하나로, 19세기 태평양 연안 중국계 이민자 커뮤니티를 통해 형성된 치파 전통——광둥 요리와 페루 식재료의 융합——에서 탄생했습니다. 소 등심 스트립을 적양파, 아히 아마리요, 토마토와 함께 강한 불에 볶은 후 간장과 약간의 식초를 뿌립니다.\\n\\n요리는 두 가지 전분과 함께 제공됩니다: 고기와 함께 웍에 직접 넣은 바삭한 감자튀김과 별도로 담긴 흰 쌀밥. 중국 기법, 페루 고추, 두 가지 탄수화물의 조합은 완전히 독자적입니다.",
      hi: "लोमो सालताडो पेरू के सबसे प्रिय स्टर-फ्राई व्यंजनों में से एक है, जो चिफा परंपरा से जन्मा — उन्नीसवीं सदी में प्रशांत तट के चीनी प्रवासी समुदायों के ज़रिए कैंटोनीज़ खाना पकाने और पेरूवियन सामग्री का संगम। गोमांस की पट्टियों को लाल प्याज़, अजी अमारिल्लो और टमाटर के साथ तेज आंच पर भूना जाता है, फिर सोया सॉस और थोड़े सिरके से तर किया जाता है।\\n\\nयह व्यंजन दो स्टार्च के साथ आता है: मांस के साथ सीधे वॉक में डाले गए कुरकुरे फ्राइज़ और अलग से सफेद चावल। चीनी तकनीक, पेरूवियन मिर्च और दोहरे कार्बोहाइड्रेट का यह संयोजन पूरी तरह अपना है — एक संगम जो अब संगम नहीं लगता।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 117 done")
