with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ── ID 176 Pav Bhaji (India) ──────────────────────────────────────

content = content.replace(
    '      ko: "인도"\n    },\n    name: {\n      ro: "Pav Bhaji"',
    '      ko: "인도",\n      hi: "भारत"\n    },\n    name: {\n      ro: "Pav Bhaji"'
)
content = content.replace(
    '      ko: "파브바지"\n    },\n    category: {',
    '      ko: "파브바지",\n      hi: "पाव भाजी"\n    },\n    category: {'
)
content = content.replace(
    '      ko: "저녁"\n    },\n    ingredients: {\n      ro: ["cartofi", "conopidă"',
    '      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    ingredients: {\n      ro: ["cartofi", "conopidă"'
)
content = content.replace(
    '      ko: ["감자", "콜리플라워", "완두콩", "파프리카", "토마토", "양파", "버터", "인도 향신료", "파브 번"]\n    },\n    howIsMade: {',
    '      ko: ["감자", "콜리플라워", "완두콩", "파프리카", "토마토", "양파", "버터", "인도 향신료", "파브 번"],\n      hi: ["आलू", "फूलगोभी", "मटर", "शिमला मिर्च", "टमाटर", "प्याज़", "मक्खन", "भारतीय मसाले", "पाव बन्स"]\n    },\n    howIsMade: {'
)
content = content.replace(
    '      ko: "채소를 삶아 으깬 후 버터와 향신료로 볶습니다. 버터에 구운 파브 번과 함께 냅니다."\n    },\n    originText: {\n      ro: "Pav Bhaji este',
    '      ko: "채소를 삶아 으깬 후 버터와 향신료로 볶습니다. 버터에 구운 파브 번과 함께 냅니다.",\n      hi: "सब्जियां उबालें, मसलें और मक्खन व मसालों के साथ पकाएं। मक्खन में सेंके पाव बन्स के साथ परोसें।"\n    },\n    originText: {\n      ro: "Pav Bhaji este'
)

old_176 = '''    originText: {
      ro: "Pav Bhaji este o rețetă tradițională din India.",
      en: "Pav Bhaji is a traditional recipe from India.",
      es: "Pav Bhaji es una receta tradicional de India.",
      fr: "Pav Bhaji est une recette traditionnelle de l'Inde.",
      de: "Pav Bhaji ist ein traditionelles Rezept aus Indien.",
      pt: "Pav Bhaji é uma receita tradicional da Índia.",
      ru: "Пав бхаджи — традиционный рецепт из Индии.",
      ar: "باف بهاجي هي وصفة تقليدية من الهند.",
      zh: "帕夫巴吉 是来自印度的传统食谱。",
      ja: "パブバジ はインドの伝統的なレシピです。",
      tr: "Pav Bhaji, Hindistan kökenli geleneksel bir tariftir.",
      it: "Pav Bhaji è una ricetta tradizionale dell'India.",
      ko: "파브바지는 인도의 전통 요리입니다."
    }'''

new_176 = '''    originText: {
      ro: "Pav bhaji este street food-ul emblematic al Mumbailui — un amestec gros și condimentat de legume prăjite cu unt (cartofi, conopidă, mazăre, ardei) servit cu chifle moi (pav) prăjite în unt. Bhaji se gătește pe o plită mare cu multă vizibilitate, zdrobit și amestecat în fața clienților, cu unt generos și masala pav bhaji.\\n\\nPav bhaji a apărut în anii 1850 în piețele textile din Mumbai ca mâncare rapidă pentru muncitori. Astăzi este unul din cele mai îndrăgite street food-uri din toată India, de la plajele Chowpatty la fiecare colț de stradă.",
      en: "Pav bhaji is the emblematic street food of Mumbai — a thick, spiced mash of butter-cooked vegetables (potatoes, cauliflower, peas, bell pepper) served with soft butter-toasted buns (pav). The bhaji is cooked on a large flat griddle in full view, crushed and mixed in front of customers with generous butter and pav bhaji masala.\\n\\nPav bhaji emerged in the 1850s in Mumbai's textile markets as fast food for mill workers, combining leftover vegetables into one flavorful and filling dish. Today it is one of India's most beloved street foods, from Chowpatty Beach to every city corner.",
      es: "El pav bhaji es el street food emblemático de Mumbai — una mezcla espesa y especiada de verduras cocinadas con mantequilla (patatas, coliflor, guisantes, pimiento) servida con panecillos suaves tostados en mantequilla. La bhaji se cocina en una gran plancha a la vista, aplastada y mezclada delante de los clientes con generosa mantequilla y masala pav bhaji.\\n\\nEl pav bhaji surgió en los años 1850 en los mercados textiles de Mumbai como comida rápida para los trabajadores. Hoy es uno de los street foods más queridos de toda India.",
      fr: "Le pav bhaji est le street food emblématique de Mumbai — un mélange épais et épicé de légumes cuits au beurre (pommes de terre, chou-fleur, petits pois, poivron) servi avec des petits pains moelleux grillés au beurre. La bhaji est cuite sur une grande plancha en plein air, écrasée et mélangée devant les clients avec du beurre généreux et du masala pav bhaji.\\n\\nLe pav bhaji est apparu dans les années 1850 dans les marchés textiles de Mumbai comme repas rapide pour les ouvriers. C'est aujourd'hui l'un des street foods les plus aimés de toute l'Inde.",
      de: "Pav Bhaji ist das emblematische Straßengericht Mumbais — ein dicker, würziger Gemüsebrei aus buttergebratenen Zutaten (Kartoffeln, Blumenkohl, Erbsen, Paprika), der mit weichen, in Butter gebratenen Brötchen (Pav) serviert wird. Die Bhaji wird auf einer großen Bratplatte sichtbar zubereitet, zerdrückt und mit reichlich Butter und Pav-Bhaji-Masala gemischt.\\n\\nPav Bhaji entstand in den 1850er Jahren auf den Textilmärkten Mumbais als Schnellgericht für Fabrikarbeiter. Heute ist es eines der beliebtesten Straßengerichte in ganz Indien.",
      pt: "O pav bhaji é o street food emblemático de Mumbai — uma mistura espessa e temperada de legumes cozidos com manteiga (batatas, couve-flor, ervilhas, pimentão) servida com pães macios tostados na manteiga. A bhaji é cozinhada numa grande frigideira plana à vista, esmagada e misturada com manteiga generosa e pav bhaji masala.\\n\\nO pav bhaji surgiu nos anos 1850 nos mercados têxteis de Mumbai como comida rápida para trabalhadores. Hoje é um dos street foods mais amados de toda a Índia.",
      ru: "Пав бхаджи — культовая уличная еда Мумбаи: густое пряное пюре из обжаренных в масле овощей (картофель, цветная капуста, горох, болгарский перец), подаваемое с мягкими поджаренными в масле булочками (пав). Бхаджи готовится на большой плоской сковороде прямо на виду у покупателей с обильным маслом и масалой пав-бхаджи.\\n\\nПав бхаджи появился в 1850-х годах на текстильных рынках Мумбаи как быстрое питание для рабочих. Сегодня это одна из любимых уличных закусок по всей Индии.",
      ar: "الباف بهاجي هو وجبة الشارع الأيقونية في مومباي — خلطة خضار سميكة ومتبلة مطهية بالزبدة (بطاطس وقرنبيط وبازلاء وفلفل) تُقدَّم مع خبز ناعم محمص بالزبدة. تُطهى البهاجي على صينية كبيرة أمام الزبائن وتُهرس مع كمية سخية من الزبدة وماسالا الباف بهاجي.\\n\\nظهر الباف بهاجي في خمسينيات القرن التاسع عشر في أسواق نسيج مومباي كوجبة سريعة للعمال. اليوم هو من أشهر أطعمة الشارع في الهند.",
      zh: "帕夫巴吉是孟买的标志性街头食品——将土豆、花椰菜、豌豆和甜椒用黄油烹制成浓郁辛香的蔬菜泥，搭配用黄油烤制的软面包（帕夫）食用。巴吉在大铁板上当着顾客面烹制，用慷慨的黄油和帕夫巴吉马萨拉混合捣碎。\\n\\n帕夫巴吉起源于19世纪50年代孟买的纺织品市场，是工人的快餐。今天它是全印度最受欢迎的街头食品之一。",
      ja: "パブバジはムンバイの象徴的なストリートフードです——バター炒めした野菜（じゃがいも・カリフラワー・グリーンピース・ピーマン）の濃厚でスパイシーなマッシュを、バターで焼いた柔らかいパン（パブ）と一緒に提供します。バジは大きな鉄板でお客さんの前で、惜しみなくバターとパブバジマサラで仕上げます。\\n\\nパブバジは1850年代のムンバイの繊維市場で工場労働者の素早い食事として生まれました。今日では全インドで最も人気のあるストリートフードの一つです。",
      tr: "Pav bhaji, Mumbai'nin simgesel sokak yemeğidir — tereyağlı pişirilmiş sebzelerin (patates, karnabahar, bezelye, kapya biber) yoğun ve baharatlı püresi, tereyağında kızartılmış yumuşak pav ekmeğiyle servis edilir. Bhaji, büyük bir yüzey üzerinde müşterilerin gözü önünde bol tereyağı ve pav bhaji masalasıyla hazırlanır.\\n\\nPav bhaji, 1850'lerde Mumbai'nin tekstil pazarlarında fabrika işçileri için hızlı yemek olarak ortaya çıktı. Bugün Hindistan'ın en sevilen sokak yemeklerinden biridir.",
      it: "Il pav bhaji è lo street food emblematico di Mumbai — un impasto denso e speziato di verdure cotte nel burro (patate, cavolfiore, piselli, peperone) servito con panini morbidi tostati nel burro. La bhaji viene cucinata su una grande piastra ben in vista, schiacciata e mescolata con abbondante burro e masala pav bhaji.\\n\\nIl pav bhaji è nato negli anni 1850 nei mercati tessili di Mumbai come cibo veloce per i lavoratori. Oggi è uno dei cibi da strada più amati di tutta l'India.",
      ko: "파브바지는 뭄바이의 상징적인 길거리 음식입니다. 버터로 조리한 채소(감자, 콜리플라워, 완두콩, 피망)를 진하고 매콤하게 으깨어 버터에 구운 부드러운 빵(파브)과 함께 제공합니다. 바지는 큰 철판에서 손님 앞에서 넉넉한 버터와 파브바지 마살라로 으깨고 섞어 만듭니다.\\n\\n파브바지는 1850년대 뭄바이 섬유 시장에서 방직 공장 노동자들의 빠른 식사로 생겨났습니다. 오늘날 인도 전역에서 가장 사랑받는 길거리 음식 중 하나입니다.",
      hi: "पाव भाजी मुंबई का प्रतीकात्मक स्ट्रीट फूड है — मक्खन में पकाई गई सब्जियों (आलू, फूलगोभी, मटर, शिमला मिर्च) का गाढ़ा और मसालेदार मैश, जो मक्खन में सेंके पाव बन्स के साथ परोसा जाता है। भाजी को बड़े तवे पर ग्राहकों के सामने भरपूर मक्खन और पाव भाजी मसाले के साथ बनाया जाता है।\\n\\nपाव भाजी 1850 के दशक में मुंबई के कपड़ा बाज़ारों में मज़दूरों के लिए तेज़ भोजन के रूप में बनी। आज यह पूरे भारत में सबसे पसंदीदा स्ट्रीट फूड में से एक है।"
    }'''

content = content.replace(old_176, new_176)

# ── ID 177 Karelian Stew (Finland) ───────────────────────────────

content = content.replace(
    '      ko: "핀란드"\n    },\n    name: {\n      ro: "Karjalanpaisti"',
    '      ko: "핀란드",\n      hi: "फ़िनलैंड"\n    },\n    name: {\n      ro: "Karjalanpaisti"'
)
content = content.replace(
    '      ko: "카렐리야 스튜"\n    },\n    category: {',
    '      ko: "카렐리야 스튜",\n      hi: "कारेलियन स्टू"\n    },\n    category: {'
)
content = content.replace(
    '      ko: "저녁"\n    },\n    ingredients: {\n      ro: ["carne de vită", "carne de porc", "carne de miel"',
    '      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    ingredients: {\n      ro: ["carne de vită", "carne de porc", "carne de miel"'
)
content = content.replace(
    '      ko: ["소고기", "돼지고기", "양고기", "양파", "당근", "후추", "소금", "물"]\n    },\n    howIsMade: {',
    '      ko: ["소고기", "돼지고기", "양고기", "양파", "당근", "후추", "소금", "물"],\n      hi: ["बीफ", "सूअर का मांस", "मेमना", "प्याज़", "गाजर", "काली मिर्च", "नमक", "पानी"]\n    },\n    howIsMade: {'
)
content = content.replace(
    '      ko: "고기와 채소를 깍둑썰기한 후 냄비에 넣고 물, 소금, 후추를 넣어 오븐에서 고기가 부드러워질 때까지 천천히 조리합니다."\n    },\n    originText: {\n      ro: "Karjalanpaisti este',
    '      ko: "고기와 채소를 깍둑썰기한 후 냄비에 넣고 물, 소금, 후추를 넣어 오븐에서 고기가 부드러워질 때까지 천천히 조리합니다.",\n      hi: "मांस और सब्जियां काटें, बर्तन में डालें, पानी नमक और काली मिर्च डालें। ओवन में धीमे पकाएं।"\n    },\n    originText: {\n      ro: "Karjalanpaisti este'
)

old_177 = '''    originText: {
      ro: "Karjalanpaisti este o rețetă tradițională din Finlanda.",
      en: "Karelian stew is a traditional recipe from Finland.",
      es: "Estofado carelio es una receta tradicional de Finlandia.",
      fr: "Ragoût carélien est une recette traditionnelle de Finlande.",
      de: "Karelischer Eintopf ist ein traditionelles Rezept aus Finnland.",
      pt: "Ensopado da Carélia é uma receita tradicional da Finlândia.",
      ru: "Карельское рагу — традиционный рецепт из Финляндии.",
      ar: "يخنة كاريليا هي وصفة تقليدية من فنلندا.",
      zh: "卡累利阿炖肉 是来自芬兰的传统食谱。",
      ja: "カレリアンシチュー はフィンランドの伝統的なレシピです。",
      tr: "Karelian Yahni, Finlandiya kökenli geleneksel bir tariftir.",
      it: "Stufato della Carelia è una ricetta tradizionale della Finlandia.",
      ko: "카렐리야 스튜는 핀란드의 전통 요리입니다."
    }'''

new_177 = '''    originText: {
      ro: "Karjalanpaisti (ragul Kareliei) este mâncarea simbolică a Finlandei — o tocăniță arhaică din trei cărni (vită, porc, miel), gătită lent ore întregi cu ceapă, morcovi și piper, fără sos, fără grăsime adăugată — pur și simplu apă și sare. Este minimalismul culinar finlandez în stare pură.\\n\\nKarjalanpaisti vine din Karelia istorică, astăzi împărțită între Finlanda și Rusia. Era mâncarea cuptorului — oale de lut puse în cuptoare cu lemne tradiționale săptămânal. Răbdarea este ingredientul secret: 4-6 ore la temperatură joasă. Se servește cu cartofi fierți și murături.",
      en: "Karjalanpaisti (Karelian stew) is Finland's symbolic dish — an archaic Finnish stew of three meats (beef, pork, lamb), slow-cooked for hours with onion, carrots, and pepper, without sauce, without added fat — just water and salt. It is Finnish culinary minimalism in pure form.\\n\\nKarjalanpaisti comes from historical Karelia, today split between Finland and Russia. It was oven food — clay pots placed in traditional wood-burning ovens weekly. Patience is the secret ingredient: 4-6 hours at low temperature. Served with boiled potatoes and pickles.",
      es: "El karjalanpaisti (estofado carelo) es el plato simbólico de Finlandia — un antiguo estofado finlandés de tres carnes (vaca, cerdo, cordero), cocinado a fuego lento durante horas con cebolla, zanahoria y pimienta, sin salsa, sin grasa añadida — solo agua y sal. Es el minimalismo culinario finlandés en estado puro.\\n\\nViene de la Carelia histórica, dividida hoy entre Finlandia y Rusia. Era la comida del horno — ollas de barro en hornos de leña semanalmente. La paciencia es el ingrediente secreto: 4-6 horas a baja temperatura. Se sirve con patatas hervidas y encurtidos.",
      fr: "Le karjalanpaisti (ragoût carélien) est le plat symbolique de Finlande — un ancien ragoût de trois viandes (boeuf, porc, agneau), mijoté pendant des heures avec oignon, carotte et poivre, sans sauce, sans matière grasse ajoutée — juste eau et sel. C'est le minimalisme culinaire finlandais à l'état pur.\\n\\nIl vient de la Carélie historique, partagée entre Finlande et Russie. C'était la nourriture du four — des pots en argile dans des fours à bois chaque semaine. La patience est l'ingrédient secret: 4-6 heures à basse température.",
      de: "Karjalanpaisti (Kareler Eintopf) ist Finnlands symbolisches Gericht — ein archaischer Schmortopf aus drei Fleischsorten (Rind, Schwein, Lamm), stundenlang langsam mit Zwiebel, Möhren und Pfeffer gegart, ohne Sauce, ohne Fett — nur Wasser und Salz. Finnischer kulinarischer Minimalismus in reinster Form.\\n\\nEs kommt aus dem historischen Karelien, heute zwischen Finnland und Russland geteilt. Es war Ofenessen — Tonkrüge in traditionellen Holzöfen wöchentlich. Geduld ist die Geheimzutat: 4-6 Stunden bei niedriger Temperatur.",
      pt: "O karjalanpaisti (ensopado da Carélia) é o prato simbólico da Finlândia — um ensopado arcaico de três carnes (vaca, porco, cordeiro), cozinhado lentamente durante horas com cebola, cenoura e pimenta, sem molho, sem gordura — apenas água e sal. É o minimalismo culinário finlandês em estado puro.\\n\\nVem da Carélia histórica, hoje dividida entre Finlândia e Rússia. Era comida de forno — potes de barro em fornos a lenha semanalmente. A paciência é o ingrediente secreto: 4-6 horas a baixa temperatura.",
      ru: "Карьяланпайсти (карельское рагу) — символическое блюдо Финляндии: архаичное финское жаркое из трёх видов мяса (говядина, свинина, баранина), тушёное часами с луком, морковью и перцем, без соуса, без жира — только вода и соль. Кулинарный минимализм Финляндии в чистейшем виде.\\n\\nПроисходит из исторической Карелии, разделённой сегодня между Финляндией и Россией. Это еда для печи — глиняные горшки в дровяных печах еженедельно. Терпение — секретный ингредиент: 4-6 часов при низкой температуре.",
      ar: "كارياالانبايستي (يخنة كاريليا) هو طبق فنلندا الرمزي — يخنة فنلندية قديمة من ثلاثة أنواع لحوم (بقر وخنزير وضأن)، تُطهى ببطء لساعات مع البصل والجزر والفلفل، بدون صلصة وبدون دهن — ماء وملح فقط. إنها الحد الأدنى من الطهي الفنلندي في أنقى صوره.\\n\\nيأتي من كاريليا التاريخية المقسومة بين فنلندا وروسيا. كان طعام الفرن — أوانٍ فخارية في أفران حطب أسبوعياً. الصبر هو المكون السري: 4-6 ساعات على حرارة منخفضة.",
      zh: "卡累利阿炖肉是芬兰的象征性菜肴——将牛肉、猪肉、羊肉三种肉类与洋葱、胡萝卜和胡椒一起慢炖数小时，无酱汁、无额外油脂，只有水和盐。这是芬兰烹饪极简主义的纯粹体现。\\n\\n来自历史上的卡累利阿，今天分属芬兰和俄罗斯。这是炉灶食物——每周将陶罐放入传统柴火烤箱中。耐心是秘密原料：4-6小时低温慢炖。",
      ja: "カレリアンシチューはフィンランドの象徴的な料理です——3種類の肉（牛肉・豚肉・羊肉）を玉ねぎ・にんじん・こしょうと一緒に何時間もじっくり煮込んだ古典的なシチューで、ソースなし、追加油脂なし——水と塩だけです。フィンランドの料理的ミニマリズムの純粋な形です。\\n\\n歴史的なカレリア地方（現在フィンランドとロシアに分割）から来ています。薪オーブンに毎週土鍋を入れる炉端料理でした。忍耐が秘密の材料：低温で4-6時間。茹でたじゃがいもとピクルスと一緒に提供されます。",
      tr: "Karjalanpaisti (Karelya yahnisi), Finlandiya'nın sembolik yemeğidir — üç tür et (dana, domuz, kuzu) soğan, havuç ve biberle saatlerce yavaş pişirilir; sos yok, ekstra yağ yok — sadece su ve tuz. Fin mutfak minimalizmasının saf halidir.\\n\\nTarihi Karelia'dan gelir, bugün Finlandiya ile Rusya arasında bölünmüştür. Fırın yemeğiydi — geleneksel odun fırınlarına haftalık kil tencereler. Sabır, gizli malzemedir: düşük ısıda 4-6 saat.",
      it: "Il karjalanpaisti (stufato della Carelia) è il piatto simbolico della Finlandia — un antico spezzatino di tre carni (manzo, maiale, agnello), cotto lentamente per ore con cipolla, carota e pepe, senza salsa, senza grassi — solo acqua e sale. È il minimalismo culinario finlandese nella sua forma pura.\\n\\nViene dalla Carelia storica, oggi divisa tra Finlandia e Russia. Era il cibo del forno — pentole di creta in forni a legna ogni settimana. La pazienza è l'ingrediente segreto: 4-6 ore a bassa temperatura.",
      ko: "카렐리야 스튜는 핀란드의 상징적인 음식입니다. 세 가지 고기(소고기, 돼지고기, 양고기)를 양파, 당근, 후추와 함께 수 시간 동안 천천히 끓이는 고전적인 핀란드 스튜로, 소스 없이, 추가 기름 없이 — 물과 소금만 사용합니다. 핀란드 요리 미니멀리즘의 순수한 형태입니다.\\n\\n오늘날 핀란드와 러시아 사이에 나뉜 역사적 카렐리야 지방에서 유래했습니다. 장작 화로에 매주 토기 냄비를 넣는 화로 요리였습니다. 인내가 비밀 재료입니다: 낮은 온도에서 4-6시간.",
      hi: "कारेलियन स्टू फ़िनलैंड का प्रतीकात्मक व्यंजन है — तीन प्रकार के मांस (बीफ, सूअर, मेमना) को प्याज़, गाजर और काली मिर्च के साथ घंटों धीमे पकाया जाता है, बिना सॉस, बिना अतिरिक्त तेल — सिर्फ पानी और नमक। यह फ़िनिश पाककला की सादगी का शुद्धतम रूप है।\\n\\nऐतिहासिक कारेलिया से आता है, जो आज फ़िनलैंड और रूस के बीच बंटा हुआ है। लकड़ी के चूल्हे में हर हफ्ते मिट्टी के बर्तन रखकर पकाया जाने वाला चूल्हे का खाना था। धैर्य ही इसका रहस्य है: 4-6 घंटे धीमी आंच पर।"
    }'''

content = content.replace(old_177, new_177)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("IDs 176-177 done")
