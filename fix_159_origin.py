with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_159 = '''    originText: {
      ro: "Poffertjes este o rețetă tradițională din Olanda.",
      en: "Poffertjes is a traditional recipe from Netherlands.",
      es: "Poffertjes es una receta tradicional de Países Bajos.",
      fr: "Poffertjes est une recette traditionnelle des Pays-Bas.",
      de: "Poffertjes ist ein traditionelles Rezept aus den Niederlanden.",
      pt: "Poffertjes é uma receita tradicional dos Países Baixos.",
      ru: "Поффертьес — традиционный рецепт из Нидерландов.",
      ar: "بوفيرتيس هي وصفة تقليدية من هولندا.",
      zh: "荷兰小松饼 是来自荷兰的传统食谱。",
      ja: "ポッフェルチェス はオランダの伝統的なレシピです。",
      tr: "Poffertjes Hollanda kökenli geleneksel bir tariftir.",
      it: "Poffertjes è una ricetta tradizionale dei Paesi Bassi.",
      ko: "포퍼르체스는 네덜란드의 전통 요리입니다."
    }'''

new_159 = '''    originText: {
      ro: "Poffertjes sunt minipancakes olandezi cu drojdie — mici, pufoase, cu un miez umed și o suprafață aurie. Se coc într-o tigaie specială cu adâncituri semisferice (poffertjespan), câte 12-20 deodată, și se întorc rapid cu o frigăruie. Aluatul conține drojdie (uneori și hriște), ceea ce le conferă o textură aeriată distinctivă față de clătitele obișnuite.\\n\\nSe servesc cu unt topit și zahăr pudră, uneori cu frișcă sau sirop. Poffertjes sunt mâncarea stradală olandeză prin excelență — la orice bâlci, piață de iarnă sau kermesse vei găsi un stand cu poffertjes. Procesul de coacere, vizibil prin geamul standului, este în sine un spectacol care atrage copii și adulți deopotrivă.",
      en: "Poffertjes are Dutch yeast mini-pancakes — small, fluffy, with a moist center and golden surface. They are baked in a special pan with hemispherical indentations (poffertjespan), 12-20 at a time, quickly flipped with a skewer. The batter contains yeast (sometimes buckwheat), giving them an airy texture distinctly different from regular pancakes.\\n\\nServed with melted butter and powdered sugar, sometimes with cream or syrup. Poffertjes are the quintessential Dutch street food — at any fair, winter market, or kermesse you will find a poffertjes stand. The baking process, visible through the stand window, is itself a spectacle that draws children and adults alike.",
      es: "Los poffertjes son minipancakes holandeses de levadura — pequeños, esponjosos, con un centro húmedo y superficie dorada. Se cuecen en una sartén especial con cavidades semiesféricas (poffertjespan), de 12 a 20 a la vez, y se voltean rápidamente con una brocheta. La masa contiene levadura (a veces trigo sarraceno), dándoles una textura aireada diferente a los crêpes normales.\\n\\nSe sirven con mantequilla derretida y azúcar glas, a veces con nata o sirope. Los poffertjes son el street food holandés por excelencia — en cualquier feria, mercado navideño o kermesse encontrarás un puesto de poffertjes.",
      fr: "Les poffertjes sont de mini-pancakes hollandais à la levure — petits, moelleux, avec un cœur humide et une surface dorée. Ils sont cuits dans une poêle spéciale à alvéoles hémisphériques (poffertjespan), 12 à 20 à la fois, rapidement retournés avec une brochette. La pâte contient de la levure (parfois du sarrasin), leur donnant une texture aérée distincte des crêpes ordinaires.\\n\\nServis avec du beurre fondu et du sucre glace, parfois avec de la crème ou du sirop. Les poffertjes sont la street food néerlandaise par excellence.",
      de: "Poffertjes sind kleine, hefige Mini-Pancakes aus den Niederlanden — klein, luftig, mit feuchtem Kern und goldener Oberfläche. Sie werden in einer speziellen Pfanne mit halbkugelförmigen Vertiefungen (Poffertjespan) gebacken, 12-20 auf einmal, und schnell mit einem Spieß gewendet. Der Teig enthält Hefe (manchmal Buchweizen), was ihnen eine luftige Textur verleiht, die sich deutlich von normalen Pfannkuchen unterscheidet.\\n\\nMit geschmolzener Butter und Puderzucker serviert, manchmal mit Sahne oder Sirup. Poffertjes sind das holländische Straßenessen schlechthin.",
      pt: "Os poffertjes são mini-panquecas holandesas com fermento — pequenas, fofas, com interior húmido e superfície dourada. São cozinhados numa frigideira especial com cavidades semiesféricas (poffertjespan), 12-20 de cada vez, rapidamente virados com um espeto. A massa contém fermento (por vezes trigo sarraceno), dando-lhes uma textura aérea diferente das panquecas normais.\\n\\nServidos com manteiga derretida e açúcar em pó, por vezes com natas ou xarope. Os poffertjes são o street food holandês por excelência.",
      ru: "Поффертьес — нидерландские дрожжевые мини-блинчики: маленькие, пышные, с влажной серединой и золотистой поверхностью. Их жарят в специальной сковородке с полусферическими углублениями (poffertjespan), по 12-20 штук сразу, быстро переворачивая шпажкой. Тесто содержит дрожжи (иногда гречневую муку), что придаёт им воздушную текстуру, совсем не похожую на обычные блины.\\n\\nПодают с растопленным маслом и сахарной пудрой, иногда со взбитыми сливками или сиропом. Поффертьес — квинтэссенция нидерландской уличной еды.",
      ar: "البوفيرتيس فطائر هولندية صغيرة بالخميرة — صغيرة وهشة مع مركز رطب وسطح ذهبي. تُطهى في مقلاة خاصة بتجاويف نصف كروية (poffertjespan)، 12-20 في وقت واحد، وتُقلب بسرعة بسيخ. العجينة تحتوي على الخميرة (أحياناً الحنطة السوداء) مما يمنحها قوامًا هوائيًا مختلفًا عن الفطائر العادية.\\n\\nتُقدَّم بالزبدة المذابة والسكر البودرة، أحياناً بالكريمة أو الشراب. البوفيرتيس هي طعام الشارع الهولندي بامتياز.",
      zh: "荷兰小松饼是荷兰的酵母小煎饼——小巧、蓬松，内心湿润，表面金黄。它们在有半球形凹槽的特制烤盘（poffertjespan）中烘烤，每次12-20个，用签子迅速翻面。面糊含酵母（有时加荞麦面），赋予它们与普通煎饼截然不同的蓬松质感。\\n\\n搭配融化的黄油和糖粉食用，有时配奶油或糖浆。荷兰小松饼是荷兰街头食物的典范，任何集市、冬季市场都有摊位。烘烤过程通过摊位的玻璃可见，本身就是吸引大人小孩的表演。",
      ja: "ポッフェルチェスはオランダのイーストミニパンケーキです——小さくてふわふわで、中心はしっとり、表面は黄金色。半球状のくぼみのある特製パン（poffertjespan）で12-20個ずつ焼き、串で素早くひっくり返します。バッターにはイースト（時にそば粉）が含まれ、普通のパンケーキとは明らかに異なる軽い食感を生みます。\\n\\n溶かしバターと粉砂糖をかけて提供され、時にクリームやシロップも添えます。ポッフェルチェスはオランダのストリートフードの代名詞です。",
      tr: "Poffertjes, Hollanda'nın mayalı mini krepleridir — küçük, kabarık, nemli bir merkez ve altın yüzeye sahiptir. Yarım küre şeklinde girintileri olan özel bir tavada (poffertjespan) 12-20 adet aynı anda pişirilir ve bir şiş yardımıyla çabucak çevrilir. Hamur maya içerir (bazen karabuğday), bu da onlara normal krepler yerine belirgin biçimde farklı havadar bir doku verir.\\n\\nEritilmiş tereyağı ve pudra şekeriyle servis edilir, bazen krema veya şurupla. Poffertjes, Hollanda'nın en özgün sokak yemeğidir.",
      it: "I poffertjes sono mini-pancakes olandesi lievitati — piccoli, soffici, con un centro morbido e una superficie dorata. Si cuociono in una padella speciale con cavità emisferiche (poffertjespan), 12-20 alla volta, rapidamente girati con uno stecchino. L'impasto contiene lievito (a volte grano saraceno), dando loro una texture ariosa molto diversa dai normali pancakes.\\n\\nServiti con burro fuso e zucchero a velo, a volte con panna o sciroppo. I poffertjes sono lo street food olandese per eccellenza.",
      ko: "포퍼르체스는 네덜란드의 이스트 미니팬케이크입니다. 작고 푹신하며 안은 촉촉하고 표면은 황금빛입니다. 반구형 홈이 있는 특수 팬(포퍼르체스 판)에 12-20개씩 구워 꼬치로 빠르게 뒤집습니다. 반죽에는 이스트(때로는 메밀)가 들어가 일반 팬케이크와는 다른 가볍고 부드러운 식감을 줍니다.\\n\\n녹인 버터와 슈거파우더를 얹어 내고, 생크림이나 시럽을 곁들이기도 합니다. 포퍼르체스는 네덜란드 길거리 음식의 대명사로, 모든 박람회·겨울 시장에 가판대가 있습니다.",
      hi: "पॉफर्चेस नीदरलैंड के खमीर वाले मिनी पैनकेक हैं — छोटे, फूले हुए, नम अंदरूनी हिस्से के साथ सुनहरी सतह। इन्हें अर्धगोलाकार खांचों वाले विशेष पैन (poffertjespan) में 12-20 एक साथ पकाया जाता है और सींक से जल्दी पलटा जाता है। बैटर में खमीर (कभी-कभी कुट्टू का आटा) होता है जो इन्हें सामान्य पैनकेक से अलग हवादार बनावट देता है।\\n\\nपिघले मक्खन और पाउडर शुगर के साथ परोसे जाते हैं, कभी-कभी क्रीम या सिरप के साथ। पॉफर्चेस नीदरलैंड का प्रमुख स्ट्रीट फूड है — हर मेले और सर्दियों के बाज़ार में इनका स्टॉल होता है।"
    }'''

content = content.replace(old_159, new_159)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 159 originText done")
