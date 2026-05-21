with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ── ID 165 Rajma (India) ──────────────────────────────────────────

content = content.replace(
    '      ko: "인도"\n    },\n    name: {\n      ro: "Rajma"',
    '      ko: "인도",\n      hi: "भारत"\n    },\n    name: {\n      ro: "Rajma"'
)
content = content.replace(
    '      ko: "라즈마"\n    },\n    category: {',
    '      ko: "라즈마",\n      hi: "राजमा"\n    },\n    category: {'
)
content = content.replace(
    '      ko: "저녁"\n    },\n    ingredients: {\n      ro: ["fasole roșie"',
    '      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    ingredients: {\n      ro: ["fasole roșie"'
)
content = content.replace(
    '      ko: ["강낭 콩", "양파", "토마토", "마늘", "생강", "인도 향신료", "기름", "쌀"]\n    },\n    howIsMade: {',
    '      ko: ["강낭 콩", "양파", "토마토", "마늘", "생강", "인도 향신료", "기름", "쌀"],\n      hi: ["राजमा (लाल बीन्स)", "प्याज़", "टमाटर", "लहसुन", "अदरक", "भारतीय मसाले", "तेल", "चावल"]\n    },\n    howIsMade: {'
)
content = content.replace(
    '      ko: "강낭콩을 삶은 뒤, 향신료를 넣은 토마토·양파·마늘·생강 소스로 조립니다. 밥과 함께 냅니다."\n    },\n    originText: {\n      ro: "Rajma este',
    '      ko: "강낭콩을 삶은 뒤, 향신료를 넣은 토마토·양파·마늘·생강 소스로 조립니다. 밥과 함께 냅니다.",\n      hi: "राजमा को उबालें, फिर मसालेदार टमाटर, प्याज़, लहसुन और अदरक की ग्रेवी में पकाएं। चावल के साथ परोसें।"\n    },\n    originText: {\n      ro: "Rajma este'
)

old_165 = '''    originText: {
      ro: "Rajma este o rețetă tradițională din India.",
      en: "Rajma is a traditional recipe from India.",
      es: "Rajma es una receta tradicional de India.",
      fr: "Rajma est une recette traditionnelle d'Inde.",
      de: "Rajma ist ein traditionelles Rezept aus Indien.",
      pt: "Rajma é uma receita tradicional da Índia.",
      ru: "Раджма — традиционный рецепт из Индии.",
      ar: "راجما هي وصفة تقليدية من الهند.",
      zh: "红豆咖喱 是来自印度的传统食谱。",
      ja: "ラジマ はインドの伝統的なレシピです。",
      tr: "Rajma Hindistan kökenli geleneksel bir tariftir.",
      it: "Rajma è una ricetta tradizionale dell'India.",
      ko: "라즈마는 인도의 전통 요리입니다."
    }'''

new_165 = '''    originText: {
      ro: "Rajma este mâncarea de suflet a Punjabului, o tocăniță groasă și aromată din fasole roșie gătită în sos de roșii cu ceapă, usturoi, ghimbir și condimente indiene. Este un preparat veg esențial din nordul Indiei, hrănitor și satisfăcător, parte din duo-ul iconic rajma-chawal (fasole cu orez).\\n\\nRajma este mâncarea duminicii în milioane de gospodării punjabi, atât în India, cât și în diaspora, simbolizând confortul casei. Se gătește la foc mic pentru a permite fasolei să absoarbă aromele sosului, iar orezul basmati alb este companionul inseparabil.",
      en: "Rajma is the soul food of Punjab — a thick, aromatic stew of red kidney beans cooked in a tomato-based sauce with onion, garlic, ginger, and a blend of Indian spices. It is an essential vegetarian dish from northern India, nourishing and satisfying, part of the iconic rajma-chawal duo (beans with rice).\\n\\nRajma is the Sunday meal in millions of Punjabi households, both in India and the diaspora, symbolizing the comfort of home. It simmers slowly so the beans absorb the flavors of the sauce, and fluffy white basmati rice is its inseparable companion.",
      es: "El rajma es el comfort food del Panyab — un estofado espeso y aromático de frijoles rojos cocidos en salsa de tomate con cebolla, ajo, jengibre y especias indias. Es un plato vegetariano esencial del norte de India, nutritivo y reconfortante, parte del dúo icónico rajma-chawal.\\n\\nEl rajma es la comida del domingo en millones de hogares panyabíes, tanto en India como en la diáspora, símbolo del confort del hogar. Se cocina a fuego lento para que los frijoles absorban los sabores del sofrito, y el arroz blanco basmati es su compañero inseparable.",
      fr: "Le rajma est le comfort food du Pendjab — un ragoût épais et aromatique de haricots rouges mijotés dans une sauce tomate avec oignon, ail, gingembre et épices indiennes. Plat végétarien essentiel du nord de l'Inde, nourrissant et réconfortant, il fait partie du duo iconique rajma-chawal.\\n\\nLe rajma est le repas du dimanche dans des millions de foyers pendjabis, tant en Inde que dans la diaspora, symbole du confort de chez soi. Il mijote lentement pour que les haricots absorbent les saveurs de la sauce, et le riz basmati blanc est son compagnon inséparable.",
      de: "Rajma ist das Soulfood des Punjab — ein dicker, aromatischer Eintopf aus roten Kidneybohnen in einer Tomatensauce mit Zwiebel, Knoblauch, Ingwer und indischen Gewürzen. Es ist ein wesentliches vegetarisches Gericht aus Nordindien, nahrhaft und befriedigend, Teil des ikonischen Duos Rajma-Chawal.\\n\\nRajma ist das Sonntagsessen in Millionen punjabischer Haushalte, sowohl in Indien als auch in der Diaspora, als Symbol für Heimatkomfort. Es köchelt langsam, damit die Bohnen die Aromen der Sauce aufnehmen, und fluffiger weißer Basmatireis ist sein untrennbarer Begleiter.",
      pt: "O rajma é o comfort food do Punjab — um ensopado espesso e aromático de feijão vermelho cozido em molho de tomate com cebola, alho, gengibre e especiarias indianas. É um prato vegetariano essencial do norte da Índia, nutritivo e reconfortante, parte do icónico duo rajma-chawal.\\n\\nO rajma é o prato de domingo em milhões de lares punjabis, tanto na Índia como na diáspora, simbolizando o conforto do lar. Ferve lentamente para que o feijão absorva os sabores do molho, e o arroz basmati branco fofo é o seu companheiro inseparável.",
      ru: "Раджма — еда для души в Пенджабе: густое ароматное рагу из красной фасоли, тушёной в томатном соусе с луком, чесноком, имбирём и смесью индийских специй. Это главное вегетарианское блюдо Северной Индии, сытное и согревающее, часть иконического дуэта раджма-чавал.\\n\\nРаджма — воскресная еда в миллионах пенджабских домов как в Индии, так и в диаспоре, символ домашнего уюта. Её готовят на медленном огне, чтобы фасоль впитала ароматы соуса, а пышный белый рис басмати — её неотлучный спутник.",
      ar: "الراجما هي طعام روح البنجاب — يخنة كثيفة وعطرة من الفاصوليا الحمراء تُطهى في صلصة طماطم مع البصل والثوم والزنجبيل وخليط البهارات الهندية. طبق نباتي أساسي من شمال الهند، مغذٍ ومريح، جزء من الثنائي الأيقوني راجما-تشاوال.\\n\\nالراجما هي طعام الأحد في ملايين المنازل البنجابية في الهند والمهجر، رمزاً لدفء البيت. تُطهى على نار هادئة لتمتص الفاصوليا نكهات الصلصة، والأرز الأبيض البسمتي رفيقها الدائم.",
      zh: "拉兹马是旁遮普邦的灵魂食物——将红芸豆在番茄酱汁中与洋葱、大蒜、生姜和印度香料慢炖成浓郁的砂锅菜。这是印度北部的基本素食菜肴，营养丰富令人满足，是标志性组合拉兹马恰瓦尔的重要部分。\\n\\n在印度和海外数百万旁遮普家庭中，拉兹马是周日的固定菜肴，象征着家的温馨与舒适。慢火炖煮让豆子充分吸收酱汁的香味，蓬松的白色香米是它不可分割的伴侣。",
      ja: "ラジマはパンジャーブのソウルフードです——赤いんげん豆をトマトベースのソースで玉ねぎ・ニンニク・ショウガ・インドスパイスのブレンドと一緒に煮込んだ濃厚で香り豊かな煮込み料理です。北インドの必食ベジタリアン料理で、名コンビのラジマ・チャーワルの一部です。\\n\\nラジマはインドと海外のパンジャーブ系家庭で日曜日の定番料理で、故郷の味を象徴します。豆がソースの風味を吸収するよう弱火でじっくり煮込み、ふっくらとした白いバスマティライスが欠かせないお供です。",
      tr: "Rajma, Pencap'ın ruh yemeğidir — soğan, sarımsak, zencefil ve hint baharatları karışımı ile domates sosunda pişirilmiş kırmızı fasulyeden yapılmış kalın ve aromatik bir güveçtir. Kuzey Hindistan'ın temel vejetaryen yemeği olan rajma, ikonik rajma-chawal ikilisinin bir parçasıdır.\\n\\nRajma, hem Hindistan'da hem de diyasporada milyonlarca Pencaplı ev hanesi için pazar yemeğidir, ev konforunu simgeler. Fasulyenin sosun tatlarını emmesi için yavaş yavaş pişirilir; kabarık beyaz basmati pirinci onun ayrılmaz eşlikçisidir.",
      it: "Il rajma è il comfort food del Punjab — uno stufato denso e aromatico di fagioli rossi cotti in salsa di pomodoro con cipolla, aglio, zenzero e un mix di spezie indiane. È un piatto vegetariano essenziale dell'India settentrionale, parte del duo iconico rajma-chawal.\\n\\nIl rajma è il piatto della domenica in milioni di famiglie punjabi, sia in India che nella diaspora, simbolo del calore domestico. Cuoce lentamente per consentire ai fagioli di assorbire i sapori del sugo, e il riso basmati bianco e soffice è il suo compagno inseparabile.",
      ko: "라즈마는 펀자브의 소울 푸드입니다. 붉은 강낭콩을 양파, 마늘, 생강, 인도 향신료를 넣은 토마토 소스에 오래 끓여 만든 진하고 향긋한 스튜입니다. 북인도의 핵심 채식 요리로 라즈마-차왈 조합으로 유명합니다.\\n\\n라즈마는 인도와 해외 펀자브 가정에서 일요일 식탁에 빠지지 않는 음식으로 집밥의 위안을 상징합니다. 콩이 소스의 풍미를 흡수하도록 약불에서 천천히 끓이며, 부드러운 흰 바스마티 쌀밥이 늘 함께합니다.",
      hi: "राजमा पंजाब का सोल फूड है — लाल बीन्स को टमाटर की ग्रेवी में प्याज़, लहसुन, अदरक और भारतीय मसालों के साथ धीमी आंच पर पकाया जाता है। यह उत्तर भारत की मुख्य शाकाहारी डिश है, पोषण से भरपूर और संतुष्टिदायक — राजमा-चावल का प्रसिद्ध जोड़ा इसी का हिस्सा है।\\n\\nराजमा रविवार का खाना है लाखों पंजाबी घरों में — यह घर के स्वाद और गर्माहट का प्रतीक है। इसे धीमी आंच पर पकाते हैं ताकि बीन्स मसालों का स्वाद अच्छी तरह सोख लें, और सफेद बासमती चावल इसका अटूट साथी है।"
    }'''

content = content.replace(old_165, new_165)

# ── ID 166 Picadillo (Cuba) ───────────────────────────────────────

content = content.replace(
    '      ko: "쿠바"\n    },\n    name: {\n      ro: "Picadillo"',
    '      ko: "쿠바",\n      hi: "क्यूबा"\n    },\n    name: {\n      ro: "Picadillo"'
)
content = content.replace(
    '      ko: "피카디요"\n    },\n    category: {',
    '      ko: "피카디요",\n      hi: "पिकाडिलो"\n    },\n    category: {'
)
content = content.replace(
    '      ko: "저녁"\n    },\n    ingredients: {\n      ro: ["carne tocată de vită"',
    '      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    ingredients: {\n      ro: ["carne tocată de vită"'
)
content = content.replace(
    '      ko: ["간 소고기", "양파", "마늘", "토마토", "고추", "완두콩", "올리브", "건포도", "기름", "소금", "후추"]\n    },\n    howIsMade: {',
    '      ko: ["간 소고기", "양파", "마늘", "토마토", "고추", "완두콩", "올리브", "건포도", "기름", "소금", "후추"],\n      hi: ["कीमा (बीफ)", "प्याज़", "लहसुन", "टमाटर", "शिमला मिर्च", "मटर", "जैतून", "किशमिश", "तेल", "नमक", "काली मिर्च"]\n    },\n    howIsMade: {'
)
content = content.replace(
    '      ko: "소고기를 양파, 마늘과 볶고, 채소·올리브·건포도를 넣어 맛이 어우러질 때까지 약불에서 끓입니다."\n    },\n    originText: {\n      ro: "Picadillo este',
    '      ko: "소고기를 양파, 마늘과 볶고, 채소·올리브·건포도를 넣어 맛이 어우러질 때까지 약불에서 끓입니다.",\n      hi: "बीफ को प्याज़ और लहसुन के साथ भूनें, सब्जियां, जैतून और किशमिश डालें और स्वाद मिलने तक पकाएं।"\n    },\n    originText: {\n      ro: "Picadillo este'
)

old_166 = '''    originText: {
      ro: "Picadillo este o rețetă tradițională din Cuba.",
      en: "Picadillo is a traditional recipe from Cuba.",
      es: "Picadillo es una receta tradicional de Cuba.",
      fr: "Picadillo est une recette traditionnelle de Cuba.",
      de: "Picadillo ist ein traditionelles Rezept aus Kuba.",
      pt: "Picadillo é uma receita tradicional de Cuba.",
      ru: "Пикадильо — традиционный рецепт из Кубы.",
      ar: "بيكاديلو هي وصفة تقليدية من كوبا.",
      zh: "古巴炖碎牛肉 是来自古巴的传统食谱。",
      ja: "ピカディージョ はキューバの伝統的なレシピです。",
      tr: "Picadillo Küba kökenli geleneksel bir tariftir.",
      it: "Picadillo è una ricetta tradizionale di Cuba.",
      ko: "피카디요는 쿠바의 전통 요리입니다."
    }'''

new_166 = '''    originText: {
      ro: "Picadillo este mâncarea cubaneză de zi cu zi, un amestec aromat de carne tocată prăjită cu roșii, ceapă, usturoi, ardei gras și combinația surprinzătoare dulce-sărată de măsline verzi și stafide. Această combinație de influență spaniolă — moștenire a bucătăriei andaluze — face din picadillo un gust unic în bucătăria caribeană.\\n\\nÎn Cuba, picadillo se mănâncă cu orez alb, fasole neagră și platanos fritos (banane prăjite), o combinație numită comida criolla clasică. Variante similare există în toată America Latină, dar versiunea cubaneză cu stafide și măsline este cea mai distinctivă.",
      en: "Picadillo is everyday Cuban food — a flavorful hash of ground beef cooked with tomatoes, onion, garlic, bell pepper, and the surprising sweet-salty combination of green olives and raisins. This Spanish-influenced blend — a legacy of Andalusian cuisine — gives picadillo a flavor uniquely Cuban.\\n\\nIn Cuba, picadillo is eaten with white rice, black beans, and platanos fritos (fried plantains), a combination known as classic comida criolla. Similar versions exist throughout Latin America, but the Cuban version with raisins and olives is the most distinctive.",
      es: "El picadillo es la comida cubana cotidiana — un sabroso salteado de carne molida con tomates, cebolla, ajo, pimiento y la sorprendente combinación dulce-salada de aceitunas verdes y pasas. Esta mezcla de influencia española — herencia de la cocina andaluza — da al picadillo un sabor únicamente cubano.\\n\\nEn Cuba, el picadillo se come con arroz blanco, frijoles negros y plátanos fritos, combinación conocida como la clásica comida criolla. Variantes similares existen en toda América Latina, pero la versión cubana con pasas y aceitunas es la más distintiva.",
      fr: "Le picadillo est la nourriture cubaine du quotidien — un hachis savoureux de viande hachée cuisiné avec des tomates, oignon, ail, poivron et la combinaison surprenante aigre-douce d'olives vertes et de raisins secs. Ce mélange d'influence hispanique — héritage de la cuisine andalouse — donne au picadillo un goût uniquement cubain.\\n\\nÀ Cuba, le picadillo s'accompagne de riz blanc, haricots noirs et plátanos fritos, combinaison connue sous le nom de comida criolla classique. Des variantes similaires existent dans toute l'Amérique latine, mais la version cubaine avec raisins et olives est la plus distinctive.",
      de: "Picadillo ist das kubanische Alltagsgericht — ein aromatisches Hackfleischgericht mit Tomaten, Zwiebel, Knoblauch, Paprika und der überraschenden süß-salzigen Kombination aus grünen Oliven und Rosinen. Diese spanisch beeinflusste Mischung — Erbe der andalusischen Küche — verleiht dem Picadillo einen einzigartig kubanischen Geschmack.\\n\\nIn Kuba wird Picadillo mit weißem Reis, schwarzen Bohnen und Plátanos Fritos gegessen, eine Kombination die als klassische Comida Criolla bekannt ist. Ähnliche Varianten gibt es in ganz Lateinamerika, aber die kubanische Version mit Rosinen und Oliven ist die markanteste.",
      pt: "O picadillo é a comida cubana do dia a dia — um refogado saboroso de carne moída com tomates, cebola, alho, pimentão e a surpreendente combinação doce-salgada de azeitonas verdes e passas. Esta mistura de influência espanhola — herança da cozinha andaluza — dá ao picadillo um sabor unicamente cubano.\\n\\nEm Cuba, o picadillo é servido com arroz branco, feijão preto e plátanos fritos, combinação conhecida como a clássica comida criolla. Variantes similares existem em toda a América Latina, mas a versão cubana com passas e azeitonas é a mais distintiva.",
      ru: "Пикадильо — повседневная кубинская еда: ароматный фарш, приготовленный с помидорами, луком, чесноком, болгарским перцем и неожиданным кисло-сладким сочетанием зелёных оливок и изюма. Эта испанская традиция, унаследованная от андалусской кухни, придаёт пикадильо уникально кубинский вкус.\\n\\nНа Кубе пикадильо едят с белым рисом, чёрными бобами и жареными бананами, комбинация известная как классическая комида криолья. Похожие варианты существуют по всей Латинской Америке, но кубинская версия с изюмом и оливками наиболее самобытна.",
      ar: "البيكاديلو هو طعام كوبا اليومي — خليط لذيذ من اللحم المفروم المطهو مع الطماطم والبصل والثوم والفلفل والمزيج المفاجئ الحلو والمالح من الزيتون الأخضر والزبيب. هذا المزيج الإسباني الأصل — إرث المطبخ الأندلسي — يمنح البيكاديلو نكهة كوبية فريدة.\\n\\nفي كوبا، يُؤكل البيكاديلو مع الأرز الأبيض والفاصوليا السوداء والموز المقلي، تُعرف هذه المجموعة بكوميدا كريولا الكلاسيكية. توجد أصناف مشابهة في أمريكا اللاتينية كلها، لكن النسخة الكوبية بالزبيب والزيتون هي الأكثر تميزاً.",
      zh: "皮卡迪洛是古巴日常食物——将牛肉末与番茄、洋葱、大蒜、青椒和出人意料的甜咸组合（绿橄榄和葡萄干）一起炒制成香气四溢的杂烩。这种安达卢西亚风格的苦甜搭配使皮卡迪洛具有独特的古巴风味。\\n\\n在古巴，皮卡迪洛与白米饭、黑豆和炸芭蕉同食，这种组合被称为经典克里奥尔料理。类似的变体遍布拉丁美洲，但古巴版本加葡萄干和橄榄是最具特色的。",
      ja: "ピカディージョは日常のキューバ料理です——牛ひき肉をトマト・玉ねぎ・ニンニク・ピーマン、そして意外な甘じょっぱい組み合わせのグリーンオリーブとレーズンと一緒に炒めた香り豊かなハッシュです。アンダルシア料理に由来するこのスペイン風の甘酸っぱい組み合わせがピカディージョにキューバ独自の風味を与えます。\\n\\nキューバでは白ご飯、黒豆、揚げプランテンと一緒に食べられ、クラシックなコミダ・クリオージャとして知られています。",
      tr: "Picadillo, Küba'nın günlük yemeğidir — domates, soğan, sarımsak, biber ve yeşil zeytin ile kuru üzümün tatlı-tuzlu kombinasyonuyla pişirilmiş baharatlı kıyma karışımıdır. Endülüs mutfağından gelen bu İspanyol etkili karışım picadillo'ya özgün Küba lezzeti katar.\\n\\nKüba'da picadillo, beyaz pirinç, siyah fasulye ve kızartılmış muz ile yenir; bu kombinasyon klasik comida criolla olarak bilinir. Benzer versiyonlar tüm Latin Amerika'da bulunur, ancak kuru üzüm ve zeytinli Küba versiyonu en özeldir.",
      it: "Il picadillo è il cibo quotidiano cubano — un hash aromatico di carne macinata cotta con pomodori, cipolla, aglio, peperone e la sorprendente combinazione dolce-salata di olive verdi e uvetta. Questo mix di influenza spagnola — eredità della cucina andalusa — dà al picadillo un sapore unicamente cubano.\\n\\nA Cuba, il picadillo si mangia con riso bianco, fagioli neri e plátanos fritos, combinazione nota come la classica comida criolla. Varianti simili esistono in tutto il Sudamerica, ma la versione cubana con uvetta e olive è la più distintiva.",
      ko: "피카디요는 쿠바의 일상 음식입니다. 소고기 다짐육을 토마토, 양파, 마늘, 피망, 녹색 올리브와 건포도의 달콤하고 짭짤한 조합과 함께 볶아 만드는 향긋한 요리입니다. 안달루시아 요리에서 유래한 이 스페인식 조합이 피카디요를 독특하게 쿠바다운 맛으로 만듭니다.\\n\\n쿠바에서 피카디요는 흰 쌀밥, 검은 콩, 튀긴 바나나와 함께 먹으며 전통 크리오야 음식으로 불립니다. 라틴 아메리카 전역에 비슷한 변형이 있지만 건포도와 올리브를 넣는 쿠바 버전이 가장 독특합니다.",
      hi: "पिकाडिलो क्यूबा का रोज़मर्रा का खाना है — कीमे को टमाटर, प्याज़, लहसुन, शिमला मिर्च और हरे जैतून व किशमिश के अनोखे मीठे-नमकीन मेल के साथ पकाया जाता है। यह अंदालुसी परंपरा से आई स्पेनिश विरासत पिकाडिलो को एक विशिष्ट क्यूबाई स्वाद देती है।\\n\\nक्यूबा में पिकाडिलो सफेद चावल, काली बीन्स और तले हुए केले के साथ परोसा जाता है — इस संयोजन को क्लासिक कोमिडा क्रियोया कहते हैं। पूरे लैटिन अमेरिका में इसके अलग-अलग रूप मिलते हैं, लेकिन किशमिश और जैतून वाला क्यूबाई संस्करण सबसे अनोखा है।"
    }'''

content = content.replace(old_166, new_166)

# ── ID 167 Lamb Tagine (Morocco) ──────────────────────────────────

content = content.replace(
    '      ko: "모로코"\n    },\n    name: {\n      ro: "Tagine cu miel"',
    '      ko: "모로코",\n      hi: "मोरक्को"\n    },\n    name: {\n      ro: "Tagine cu miel"'
)
content = content.replace(
    '      ko: "양고기 타진"\n    },\n    category: {',
    '      ko: "양고기 타진",\n      hi: "मेमने का टैगीन"\n    },\n    category: {'
)
content = content.replace(
    '      ko: "저녁"\n    },\n    ingredients: {\n      ro: ["carne de miel"',
    '      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    ingredients: {\n      ro: ["carne de miel"'
)
content = content.replace(
    '      ko: ["양고기", "양파", "마늘", "토마토", "말린 살구", "아몬드", "모로코 향신료", "올리브오일"]\n    },\n    howIsMade: {',
    '      ko: ["양고기", "양파", "마늘", "토마토", "말린 살구", "아몬드", "모로코 향신료", "올리브오일"],\n      hi: ["मेमने का मांस", "प्याज़", "लहसुन", "टमाटर", "सूखे खुबानी", "बादाम", "मोरक्कन मसाले", "जैतून का तेल"]\n    },\n    howIsMade: {'
)
content = content.replace(
    '      ko: "양고기와 채소, 말린 과일, 향신료를 타진 냄비에 물을 조금 넣고 약한 불에서 고기가 부드러워질 때까지 천천히 조리합니다."\n    },\n    originText: {\n      ro: "Tagine cu miel este',
    '      ko: "양고기와 채소, 말린 과일, 향신료를 타진 냄비에 물을 조금 넣고 약한 불에서 고기가 부드러워질 때까지 천천히 조리합니다.",\n      hi: "मेमने का मांस सब्जियों, सूखे फलों और मसालों के साथ टैगीन के बर्तन में थोड़े पानी के साथ धीमी आंच पर नरम होने तक पकाएं।"\n    },\n    originText: {\n      ro: "Tagine cu miel este'
)

old_167 = '''    originText: {
      ro: "Tagine cu miel este o rețetă tradițională din Maroc.",
      en: "Lamb Tagine is a traditional recipe from Morocco.",
      es: "Tajín de cordero es una receta tradicional de Marruecos.",
      fr: "Tajine d'agneau est une recette traditionnelle du Maroc.",
      de: "Lamm-Tagine ist ein traditionelles Rezept aus Marokko.",
      pt: "Tagine de cordeiro é uma receita tradicional do Marrocos.",
      ru: "Тажин с ягненком — традиционный рецепт из Марокко.",
      ar: "طاجين لحم الضأن هي وصفة تقليدية من المغرب.",
      zh: "羊肉塔吉锅 是来自摩洛哥的传统食谱。",
      ja: "ラムのタジン はモロッコの伝統的なレシピです。",
      tr: "Kuzu Tajini, Fas kökenli geleneksel bir tariftir.",
      it: "Tajine di Agnello è una ricetta tradizionale del Marocco.",
      ko: "양고기 타진은 모로코의 전통 요리입니다."
    }'''

new_167 = '''    originText: {
      ro: "Tagine cu miel este un simbol al bucătăriei marocane — o tocăniță gătită lent în vasul de lut conic (tagine), care captează aburii și întoarce sucurile înapoi în mâncare. Mielul devine fragil în ore de gătit lent cu ceapă, usturoi, caise uscate, migdale și amestecul de condimente ras el hanout, creând un sos concentrat dulce-picant.\\n\\nTagine-ul este gătit tradițional pe jar sau în cuptor cu lemne. Se servește cu pâine khobz pentru a absorbi sosul, ori cu couscous la ocazii speciale. Marocul are zeci de variante regionale, dar tagine cu miel rămâne versiunea festivă clasică.",
      en: "Lamb tagine is a symbol of Moroccan cuisine — a slow-cooked stew made in the conical clay pot (tagine), which traps steam and returns juices back into the dish. The lamb becomes fall-apart tender after hours of slow cooking with onion, garlic, dried apricots, almonds, and the spice blend ras el hanout, creating a concentrated sweet-spiced sauce.\\n\\nTagine is traditionally cooked over charcoal or a wood-burning stove, a ritual of patience and aroma. It is served with khobz bread to soak up the sauce, or with couscous on special occasions. Morocco has dozens of regional variants, but lamb tagine remains the classic festive version.",
      es: "El tajín de cordero es símbolo de la cocina marroquí — un estofado de cocción lenta en la olla de barro cónica (tajine), que atrapa el vapor y devuelve los jugos al plato. El cordero se vuelve tiernísimo tras horas de cocción con cebolla, ajo, orejones, almendras y la mezcla de especias ras el hanout, creando una salsa concentrada dulce y especiada.\\n\\nEl tajine se cocina tradicionalmente sobre brasas o en horno de leña, un ritual de paciencia. Se sirve con pan khobz para absorber la salsa, o con cuscús en ocasiones especiales.",
      fr: "Le tajine d'agneau est un symbole de la cuisine marocaine — un ragoût mijoté dans le pot conique en argile (tajine), qui piège la vapeur et renvoie les jus dans le plat. L'agneau devient fondant après des heures de cuisson lente avec oignon, ail, abricots secs, amandes et le mélange d'épices ras el hanout, créant une sauce concentrée douce et épicée.\\n\\nLe tajine est traditionnellement cuit sur des braises ou au feu de bois, un rituel de patience et d'arôme. Il se sert avec du pain khobz ou avec du couscous lors des occasions spéciales.",
      de: "Lamm-Tagine ist ein Symbol der marokkanischen Küche — ein Schmorgericht im konischen Tontopf (Tagine), der Dampf einfängt und Säfte ans Gericht zurückgibt. Das Lamm wird nach stundenlangem Schmoren mit Zwiebel, Knoblauch, Trockenaprikosen, Mandeln und dem Gewürzmix Ras el Hanout butterweich, wobei eine konzentrierte süß-würzige Sauce entsteht.\\n\\nTagine wird traditionell über Holzkohle oder im Holzofen gegart, ein Ritual aus Geduld und Duft. Serviert mit Khobz-Brot oder mit Couscous bei besonderen Anlässen.",
      pt: "O tagine de cordeiro é um símbolo da cozinha marroquina — um ensopado de cozedura lenta no pote cónico de barro (tagine), que captura o vapor e devolve os sucos ao prato. O cordeiro fica tão tenro após horas de cozedura lenta com cebola, alho, damascos secos, amêndoas e a mistura ras el hanout, criando um molho concentrado doce e picante.\\n\\nO tagine é cozinhado sobre carvão ou num forno a lenha, um ritual de paciência e aroma. Serve-se com pão khobz para absorver o molho, ou com cuscuz em ocasiões especiais.",
      ru: "Тажин с ягнёнком — символ марокканской кухни: медленное тушение в коническом глиняном сосуде (тажине), который удерживает пар и возвращает соки в блюдо. Ягнятина становится нежнейшей за часы тушения с луком, чесноком, курагой, миндалём и смесью специй рас-эль-ханут, создавая концентрированный сладко-пряный соус.\\n\\nТажин традиционно готовят на углях или в дровяной печи — ритуал терпения и аромата. Подают с хлебом хобз для впитывания соуса или с кускусом на торжественные случаи.",
      ar: "طاجين الضأن رمز المطبخ المغربي — طبق يُطهى ببطء في الإناء الفخاري المخروطي الذي يحبس البخار ويعيد العصائر إلى الطعام. يصبح الضأن طرياً جداً بعد ساعات من الطهي مع البصل والثوم والمشمش المجفف واللوز ومزيج بهارات رأس الحانوت، مما يخلق صلصة مركزة حلوة وحارة.\\n\\nيُطهى الطاجين تقليدياً على الجمر أو في فرن حطب، طقس من الصبر والعطر. يُقدَّم مع خبز الخبز لامتصاص الصلصة، أو مع الكسكس في المناسبات الخاصة.",
      zh: "羊肉塔吉锅是摩洛哥美食的标志——在锥形陶罐中慢炖，陶盖捕获蒸汽并将汁液循环回菜肴。羊肉在与洋葱、大蒜、杏干、杏仁以及拉斯哈努特香料混合经过数小时慢炖后变得入口即化，形成浓缩的甜辣酱汁。\\n\\n塔吉锅传统上在木炭或柴火炉上烹制，是一种需要耐心和香气的仪式。搭配霍布兹面包蘸取酱汁食用，或在特殊场合搭配古斯米。",
      ja: "ラムのタジンはモロッコ料理の象徴——円錐形の土鍋でじっくり煮込む料理で、蒸気を閉じ込め肉汁を食材に戻します。ラム肉は玉ねぎ・ニンニク・ドライアプリコット・アーモンド・ラス・エル・ハヌートのスパイスブレンドと共に何時間も煮込まれ、甘辛い濃厚ソースと共にとろけるほど柔らかくなります。\\n\\nタジンは伝統的に炭火や薪ストーブで調理され、忍耐と香りの儀式です。ソースを吸い取るホブスパンと共に、または特別な場合にクスクスと一緒に提供されます。",
      tr: "Kuzu tajin, Fas mutfağının simgesidir — buharı hapsederek suları yemeğe geri döndüren konik kil tencerede yavaş yavaş pişirilen bir güveçtir. Kuzu, soğan, sarımsak, kuru kayısı, badem ve ras el hanout baharat karışımıyla saatlerce yavaş pişirilince parçalanacak kadar yumuşar ve konsantre tatlı-baharatlı bir sos oluşur.\\n\\nTagine geleneksel olarak mangal kömürü veya odun ateşinde pişirilir; bu bir sabır ve aroma ritüelidir. Sosu emdirmek için khobz ekmeğiyle veya özel günlerde kuskusla servis edilir.",
      it: "Il tajine di agnello è un simbolo della cucina marocchina — uno stufato a cottura lenta nella pentola conica in argilla (tajine), che intrappola il vapore e restituisce i succhi al piatto. L'agnello diventa tenero come il burro dopo ore di cottura lenta con cipolla, aglio, albicocche secche, mandorle e la miscela di spezie ras el hanout, creando una salsa concentrata dolce e speziata.\\n\\nIl tajine viene cotto tradizionalmente su carbonella o in forno a legna, un rituale di pazienza e profumo. Si serve con il pane khobz per assorbire il sugo, o con il cous cous nelle occasioni speciali.",
      ko: "양고기 타진은 모로코 요리의 상징입니다. 원뿔형 흙 냄비(타진)에서 천천히 끓이는 스튜로, 냄비가 증기를 가두고 육즙을 음식에 되돌립니다. 양고기는 양파, 마늘, 말린 살구, 아몬드, 라스 엘 하누트 향신료 블렌드와 함께 수 시간 동안 천천히 익으면서 달콤하고 향신료 가득한 진한 소스가 됩니다.\\n\\n타진은 전통적으로 숯불이나 장작 화로에서 조리되며, 인내와 향기의 의식입니다. 소스를 담아 먹는 호브즈 빵이나 특별한 날에는 쿠스쿠스와 함께 제공됩니다.",
      hi: "मेमने का टैगीन मोरक्कन व्यंजन का प्रतीक है — शंकु के आकार के मिट्टी के बर्तन में धीमी आंच पर पकाया जाने वाला स्टू, जो भाप को रोकता है और रस को खाने में वापस भेजता है। मेमना प्याज़, लहसुन, सूखी खुबानी, बादाम और रास-अल-हनुत मसालों के साथ घंटों पकने से मुलायम हो जाता है और मीठी-मसालेदार गाढ़ी चटनी बनती है।\\n\\nटैगीन पारंपरिक रूप से कोयले या लकड़ी के चूल्हे पर बनाया जाता है — धैर्य और खुशबू की एक रस्म। इसे ख़ोबज़ रोटी के साथ परोसते हैं, या ख़ास मौकों पर कुसकुस के साथ।"
    }'''

content = content.replace(old_167, new_167)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("IDs 165-167 done")
