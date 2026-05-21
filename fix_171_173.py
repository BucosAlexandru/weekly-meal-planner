with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ── ID 171 Solyanka (Russia) ──────────────────────────────────────

content = content.replace(
    '      ko: "러시아"\n    },\n    name: {\n      ro: "Solyanka"',
    '      ko: "러시아",\n      hi: "रूस"\n    },\n    name: {\n      ro: "Solyanka"'
)
content = content.replace(
    '      ko: "솔랸카"\n    },\n    category: {',
    '      ko: "솔랸카",\n      hi: "सोल्यंका"\n    },\n    category: {'
)
content = content.replace(
    '      ko: "점심"\n    },\n    ingredients: {\n      ro: ["carne de vită", "cârnați"',
    '      ko: "점심",\n      hi: "दोपहर का खाना"\n    },\n    ingredients: {\n      ro: ["carne de vită", "cârnați"'
)
content = content.replace(
    '      ko: ["소고기", "소시지", "피클", "양파", "토마토", "새콤한 크림", "레몬"]\n    },\n    howIsMade: {',
    '      ko: ["소고기", "소시지", "피클", "양파", "토마토", "새콤한 크림", "레몬"],\n      hi: ["बीफ", "सॉसेज", "अचार", "प्याज़", "टमाटर", "खट्टी क्रीम", "नींबू"]\n    },\n    howIsMade: {'
)
content = content.replace(
    '      ko: "소고기를 삶은 후 소시지와 채소를 넣고 간을 맞춰 새콤한 크림과 레몬을 곁들여 냅니다."\n    },\n    originText: {\n      ro: "Solyanka este',
    '      ko: "소고기를 삶은 후 소시지와 채소를 넣고 간을 맞춰 새콤한 크림과 레몬을 곁들여 냅니다.",\n      hi: "मांस उबालें, सॉसेज और सब्जियां डालें, मसाला करें, खट्टी क्रीम और नींबू के साथ परोसें।"\n    },\n    originText: {\n      ro: "Solyanka este'
)

old_171 = '''    originText: {
      ro: "Solyanka este o rețetă tradițională din Rusia.",
      en: "Solyanka is a traditional recipe from Russia.",
      es: "Solyanka es una receta tradicional de Rusia.",
      fr: "Solyanka est une recette traditionnelle de Russie.",
      de: "Solyanka ist ein traditionelles Rezept aus Russland.",
      pt: "Solyanka é uma receita tradicional da Rússia.",
      ru: "Солянка — традиционный рецепт из России.",
      ar: "سوليانكا هي وصفة تقليدية من روسيا.",
      zh: "罗宋汤 是来自俄罗斯的传统食谱。",
      ja: "ソリャンカ はロシアの伝統的なレシピです。",
      tr: "Solyanka, Rusya kökenli geleneksel bir tariftir.",
      it: "Solyanka è una ricetta tradizionale della Russia.",
      ko: "솔랸카는 러시아의 전통 요리입니다."
    }'''

new_171 = '''    originText: {
      ro: "Solyanka este supa festivă a Rusiei — un terci gros și acru cu carne de vită, cârnați afumați, șuncă, castraveți murați, măsline, capere și roșii, totul asezonat cu smântână și o felie de lămâie. Caracterul distinctiv al solyankăi este combinația de sărat, acru și picant din murăturile care formează baza savurii.\\n\\nSolyanka nu este greu de preparat, dar necesită ingrediente de calitate și suficient timp de fiert. În Rusia, solyanka se mănâncă ca fel principal, nu ca supă de deschidere, servită cu pâine neagră. Este mâncarea clasică de vindecat mahmureala — acidul din murături și lămâie restabilește echilibrul.",
      en: "Solyanka is Russia's festive soup — a thick and tangy broth with beef, smoked sausages, ham, pickled cucumbers, olives, capers, and tomatoes, all finished with sour cream and a slice of lemon. Its distinctive character comes from the combination of salty, sour, and spicy from the pickles that form the flavor base.\\n\\nSolyanka is not difficult to make, but requires quality ingredients and enough simmering time. In Russia, solyanka is eaten as a main dish, not a starter, served with black bread. It is the classic hangover cure — the acid from pickles and lemon restores balance.",
      es: "La solyanka es la sopa festiva de Rusia — un caldo espeso y ácido con carne de res, salchichas ahumadas, jamón, pepinillos encurtidos, aceitunas, alcaparras y tomates, terminado con crema agria y rodaja de limón. Su carácter distintivo viene de la combinación de salado, ácido y picante de los encurtidos.\\n\\nLa solyanka no es difícil de preparar, pero requiere ingredientes de calidad y suficiente tiempo de cocción. En Rusia se come como plato principal con pan negro.",
      fr: "La solyanka est la soupe festive de Russie — un bouillon épais et acidulé avec du boeuf, des saucisses fumées, du jambon, des cornichons, des olives, des câpres et des tomates, fini avec de la crème fraîche et une tranche de citron. Son caractère distinctif vient de la combinaison salé-acide-piquant des marinades.\\n\\nLa solyanka n'est pas difficile à préparer, mais nécessite des ingrédients de qualité et suffisamment de temps de mijotage. En Russie, elle se mange comme plat principal avec du pain noir.",
      de: "Solyanka ist Russlands festliche Suppe — eine dicke, würzige Brühe mit Rindfleisch, geräucherten Würstchen, Schinken, eingelegten Gurken, Oliven, Kapern und Tomaten, mit Sauerrahm und einer Zitronenscheibe abgerundet. Ihr unverwechselbarer Charakter kommt von der salzig-sauren Kombination der Einlegezutaten.\\n\\nSolyanka ist nicht schwer zuzubereiten, erfordert aber hochwertige Zutaten und ausreichend Kochzeit. In Russland wird Solyanka als Hauptgericht mit schwarzem Brot gegessen.",
      pt: "A solyanka é a sopa festiva da Rússia — um caldo espesso e ácido com carne bovina, salsichas defumadas, presunto, pepinos em conserva, azeitonas, alcaparras e tomates, terminado com creme azedo e fatia de limão. O seu carácter distintivo vem da combinação salgado-ácido-picante dos pickles.\\n\\nA solyanka não é difícil de preparar, mas requer ingredientes de qualidade e tempo de cozimento. Na Rússia é comida como prato principal com pão preto.",
      ru: "Солянка — праздничный суп России: густой кисло-пряный бульон из говядины, копчёных колбас, ветчины, солёных огурцов, маслин, каперсов и помидоров, заправленный сметаной и долькой лимона. Неповторимый характер определяет сочетание солёного, кислого и острого от соленых огурцов.\\n\\nСолянку несложно приготовить, но нужны качественные ингредиенты и достаточное время варки. В России солянку едят как основное блюдо с чёрным хлебом. Это классическое народное средство после застолья.",
      ar: "السوليانكا هي حساء روسيا الاحتفالي — مرقة سميكة ومتبلة بلحم البقر والنقانق المدخنة والجامبون والخيار المخلل والزيتون والكبر والطماطم، مع القشدة الحامضة وشريحة الليمون. طابعها المميز يأتي من مزيج المالح والحامض والحار من المخللات.\\n\\nالسوليانكا ليست صعبة التحضير لكنها تحتاج إلى مكونات جيدة ووقت كافٍ. في روسيا تُؤكل كطبق رئيسي مع الخبز الأسود.",
      zh: "索利扬卡是俄罗斯的节庆汤品——用牛肉、熏香肠、火腿、腌黄瓜、橄榄、刺山柑和番茄熬成的浓厚酸香汤，配上酸奶油和柠檬片。它独特的风味来自腌制食材带来的咸、酸、辣的组合。\\n\\n索利扬卡制作不难但需要优质食材和足够炖煮时间。在俄罗斯，它作为主菜搭配黑面包食用。它是缓解宿醉的经典食物。",
      ja: "ソリャンカはロシアの祝祭スープ——牛肉・スモークソーセージ・ハム・ピクルス・オリーブ・ケッパー・トマトが入った濃厚で酸味のあるスープで、サワークリームとレモンスライスで仕上げます。ピクルスから生まれる塩味・酸味・辛みの組み合わせが独特の個性を作ります。\\n\\nソリャンカは材料が良ければ難しくありません。ロシアでは前菜ではなくメイン料理として黒パンと一緒に食べられます。",
      tr: "Solyanka, Rusya'nın kutlama çorbası — dana eti, tütsülenmiş sosis, jambon, turşu salatalık, zeytin, kapari ve domatesle hazırlanan yoğun ve ekşimsi et suyu, ekşi krema ve limon dilimiyle servis edilir. Ayırt edici karakterini turşulardan gelen tuzlu, ekşi ve baharatlı lezzetlerin birleşiminden alır.\\n\\nSolyanka hazırlaması zor değildir, ancak kaliteli malzemeler ve yeterli süre gerektirir. Rusya'da ana yemek olarak siyah ekmekle servis edilir.",
      it: "La solyanka è la zuppa festiva della Russia — un brodo denso e acidulo con manzo, salsicce affumicate, prosciutto, cetriolini sott'aceto, olive, capperi e pomodori, finito con panna acida e fetta di limone. Il suo carattere distintivo nasce dalla combinazione salato-acido-piccante dei sottaceti.\\n\\nLa solyanka non è difficile da preparare, ma richiede ingredienti di qualità e tempo. In Russia si mangia come piatto principale con pane nero.",
      ko: "솔랸카는 러시아의 축제 수프입니다. 소고기, 훈제 소시지, 햄, 피클 오이, 올리브, 케이퍼, 토마토가 들어간 진하고 새콤한 수프를 사워크림과 레몬 한 조각으로 마무리합니다. 피클에서 나오는 짠맛, 신맛, 매운맛의 조합이 독특한 풍미를 만들어냅니다.\\n\\n좋은 재료와 충분한 끓임 시간이 있으면 어렵지 않습니다. 러시아에서는 흑빵과 함께 주요리로 먹습니다.",
      hi: "सोल्यंका रूस का उत्सव का सूप है — बीफ, स्मोक्ड सॉसेज, हैम, अचार खीरे, जैतून, केपर और टमाटर से बना गाढ़ा और खट्टा शोरबा, जिसे खट्टी क्रीम और नींबू के टुकड़े के साथ परोसा जाता है। इसका विशिष्ट स्वाद अचार से आने वाले नमकीन, खट्टे और तीखे के संयोजन से बनता है।\\n\\nसोल्यंका बनाना मुश्किल नहीं है, लेकिन अच्छी सामग्री और पर्याप्त पकाने का समय ज़रूरी है। रूस में सोल्यंका मुख्य व्यंजन के रूप में काली रोटी के साथ खाई जाती है।"
    }'''

content = content.replace(old_171, new_171)

# ── ID 172 Clam Chowder (USA) ─────────────────────────────────────

content = content.replace(
    '      ko: "미국"\n    },\n    name: {\n      ro: "Clam Chowder"',
    '      ko: "미국",\n      hi: "अमेरिका"\n    },\n    name: {\n      ro: "Clam Chowder"'
)
content = content.replace(
    '      ko: "클램 차우더"\n    },\n    category: {',
    '      ko: "클램 차우더",\n      hi: "क्लैम चाउडर"\n    },\n    category: {'
)
content = content.replace(
    '      ko: "저녁"\n    },\n    ingredients: {\n      ro: ["scoici"',
    '      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    ingredients: {\n      ro: ["scoici"'
)
content = content.replace(
    '      ko: ["조개", "감자", "양파", "우유", "크림", "버터", "베이컨", "밀가루", "소금", "후추"]\n    },\n    howIsMade: {',
    '      ko: ["조개", "감자", "양파", "우유", "크림", "버터", "베이컨", "밀가루", "소금", "후추"],\n      hi: ["सीप", "आलू", "प्याज़", "दूध", "क्रीम", "मक्खन", "बेकन", "आटा", "नमक", "काली मिर्च"]\n    },\n    howIsMade: {'
)
content = content.replace(
    '      ko: "양파와 베이컨을 볶은 후 밀가루, 감자, 우유를 넣고 약불로 끓인 다음 마지막에 조개를 넣습니다."\n    },\n    originText: {\n      ro: "Clam Chowder este',
    '      ko: "양파와 베이컨을 볶은 후 밀가루, 감자, 우유를 넣고 약불로 끓인 다음 마지막에 조개를 넣습니다.",\n      hi: "प्याज़ और बेकन भूनें, आटा, आलू और दूध डालें, धीमे पकाएं, अंत में सीप डालें।"\n    },\n    originText: {\n      ro: "Clam Chowder este'
)

old_172 = '''    originText: {
      ro: "Clam Chowder este o rețetă tradițională din SUA.",
      en: "Clam Chowder is a traditional recipe from USA.",
      es: "Clam Chowder es una receta tradicional de EE.UU..",
      fr: "Clam Chowder est une recette traditionnelle des États-Unis.",
      de: "Clam Chowder ist ein traditionelles Rezept aus den USA.",
      pt: "Clam Chowder é uma receita tradicional dos EUA.",
      ru: "Клэм чаудер — традиционный рецепт из США.",
      ar: "شوربة البطلينوس هي وصفة تقليدية من الولايات المتحدة.",
      zh: "蛤蜊浓汤 是来自美国的传统食谱。",
      ja: "クラムチャウダー はアメリカの伝統的なレシピです。",
      tr: "Clam Chowder, ABD kökenli geleneksel bir tariftir.",
      it: "Clam Chowder è una ricetta tradizionale degli USA.",
      ko: "클램 차우더는 미국의 전통 요리입니다."
    }'''

new_172 = '''    originText: {
      ro: "Clam chowder este supa emblematică a Noii Anglii — un chowder cremos și gros cu scoici proaspete, cartofi, bacon afumat și ceapă, îngroșat cu lapte și smântână. Există un război culinar de secole: New England Clam Chowder (alb, cu smântână) versus Manhattan Clam Chowder (roșu, cu roșii), iar bostonezii consideră varianta cu roșii aproape o ofensă.\\n\\nClam chowder se servește tradițional în pâine sourdough excavată — un bol comestibil care absoarbe supa. Este mâncarea portuară a Bostonului, prezentă la fiecare restaurant de pe coastă.",
      en: "Clam chowder is the emblematic soup of New England — a creamy, thick chowder with fresh clams, potatoes, smoked bacon, and onion, enriched with milk and cream. There is a centuries-old culinary war: New England Clam Chowder (white, with cream) versus Manhattan Clam Chowder (red, with tomatoes), and Bostonians consider the tomato version nearly an offense.\\n\\nClam chowder is traditionally served in a hollowed-out sourdough bread bowl — an edible bowl that absorbs the soup. It is Boston's harbor food, present at every restaurant along the coast.",
      es: "El clam chowder es la sopa emblemática de Nueva Inglaterra — un chowder cremoso y espeso con almejas frescas, patatas, bacon ahumado y cebolla. Hay una guerra culinaria de siglos: New England Clam Chowder (blanco, con nata) versus Manhattan Clam Chowder (rojo, con tomates), y los bostonianos consideran la versión con tomate casi una ofensa.\\n\\nSe sirve tradicionalmente en una bola de pan sourdough vaciada, un bol comestible que absorbe la sopa. Es la comida portuaria de Boston.",
      fr: "Le clam chowder est la soupe emblématique de Nouvelle-Angleterre — un chowder crémeux et épais avec des palourdes fraîches, pommes de terre, bacon fumé et oignon. Une guerre culinaire centenaire l'oppose: New England Clam Chowder (blanc, à la crème) contre Manhattan Clam Chowder (rouge, aux tomates), et les Bostoniens considèrent la version aux tomates presque comme une offense.\\n\\nIl est traditionnellement servi dans un pain sourdough évidé, un bol comestible qui absorbe la soupe.",
      de: "Clam Chowder ist die emblematische Suppe Neuenglands — ein cremiger, dicker Chowder mit frischen Muscheln, Kartoffeln, geräuchertem Speck und Zwiebeln. Es gibt einen jahrhundertelangen kulinarischen Krieg: New England Clam Chowder (weiß, mit Sahne) versus Manhattan Clam Chowder (rot, mit Tomaten), und Bostoner halten die Tomatenversion fast für eine Beleidigung.\\n\\nClam Chowder wird traditionell in einem ausgehöhlten Sauerteigbrot serviert, einer essbaren Schüssel, die die Suppe aufsaugt.",
      pt: "O clam chowder é a sopa emblemática da Nova Inglaterra — um chowder cremoso e espesso com amêijoas frescas, batatas, bacon fumado e cebola. Há uma guerra culinária de séculos: New England Clam Chowder (branco, com creme) versus Manhattan Clam Chowder (vermelho, com tomates), e os bostonianos consideram a versão com tomates quase uma ofensa.\\n\\nÉ servido tradicionamente num pão sourdough escavado, uma tigela comestível que absorve a sopa.",
      ru: "Клэм чаудер — эмблема Новой Англии: кремовый густой суп из свежих моллюсков, картофеля, копчёного бекона и лука. Уже столетия идёт кулинарная война: New England Clam Chowder (белый, со сливками) против Manhattan Clam Chowder (красный, с помидорами), и бостонцы считают томатный вариант почти оскорблением.\\n\\nТрадиционно подают в выдолбленном хлебе на закваске, съедобной миске. Это портовая еда Бостона.",
      ar: "حساء البطلينوس هو شوربة نيو إنجلاند الرمزية — شاودر كريمي وكثيف مع البطلينوس الطازج والبطاطس ولحم الخنزير المدخن والبصل بالحليب والكريمة. تدور حرب طهوية منذ قرون: النسخة البيضاء (بالكريمة) مقابل النسخة الحمراء (بالطماطم)، ويعتبر أهل بوسطن النسخة بالطماطم شبه إهانة.\\n\\nيُقدَّم تقليدياً في رغيف خبز محفور، وعاء صالح للأكل يمتص الحساء. إنه طعام ميناء بوسطن.",
      zh: "蛤蜊浓汤是新英格兰的标志性汤品——用新鲜蛤蜊、土豆、熏培根和洋葱加牛奶和奶油制成的浓郁厚汤。数百年来存在一场烹饪之争：新英格兰版（白色，含奶油）对曼哈顿版（红色，含番茄），波士顿人认为含番茄的版本几乎是冒犯。\\n\\n传统上盛在挖空的酸面包碗中——可食用的碗能吸收汤汁。这是波士顿的港口食物。",
      ja: "クラムチャウダーはニューイングランドの象徴的なスープ——新鮮な二枚貝・じゃがいも・スモークベーコン・玉ねぎを牛乳とクリームで濃厚に仕上げたチャウダーです。何世紀にもわたる料理上の戦いがあります：ニューイングランド版（白い、クリーム入り）対マンハッタン版（赤い、トマト入り）で、ボストン市民はトマト版をほぼ侮辱と見なします。\\n\\n伝統的にくり抜いたサワードウのブレッドボウルで提供されます。ボストンの港の食べ物です。",
      tr: "Clam chowder, Yeni İngiltere'nin simge çorbası — taze midye, patates, tütsülenmiş pastırma ve soğandan yapılmış kremalı ve yoğun bir chowder. Yüzyıllardır süren bir mutfak savaşı vardır: New England versiyonu (beyaz, kremalı) ile Manhattan versiyonu (kırmızı, domatesli); Bostonlular domatesli versiyonu neredeyse hakaret sayar.\\n\\nGeleneksel olarak oyulmuş ekşi mayalı ekmek kasesinde servis edilir. Boston'ın liman yemeğidir.",
      it: "Il clam chowder è la zuppa emblematica del New England — un chowder cremoso e denso con vongole fresche, patate, pancetta affumicata e cipolla. Da secoli esiste una guerra culinaria: New England Clam Chowder (bianco, con panna) contro Manhattan Clam Chowder (rosso, con pomodori), e i bostoniani considerano la versione ai pomodori quasi un'offesa.\\n\\nViene tradizionalmente servito in un pane sourdough scavato, una ciotola commestibile. È il cibo del porto di Boston.",
      ko: "클램 차우더는 뉴잉글랜드의 상징적인 수프입니다. 신선한 조개, 감자, 훈제 베이컨, 양파를 우유와 크림으로 진하게 만든 걸쭉한 차우더입니다. 수백 년간 이어진 요리 전쟁이 있습니다: 뉴잉글랜드 버전(흰색, 크림)과 맨해튼 버전(빨간색, 토마토)이며, 보스턴 사람들은 토마토 버전을 거의 모욕으로 여깁니다.\\n\\n전통적으로 속을 파낸 사워도우 브레드 볼에 담아 제공됩니다. 보스턴의 항구 음식입니다.",
      hi: "क्लैम चाउडर न्यू इंग्लैंड का प्रतीकात्मक सूप है — ताज़े सीप, आलू, स्मोक्ड बेकन और प्याज़ से बना दूध और क्रीम युक्त गाढ़ा मलाईदार चाउडर। सदियों से एक पाककला युद्ध चल रहा है: न्यू इंग्लैंड क्लैम चाउडर (सफेद, क्रीम के साथ) बनाम मैनहटन क्लैम चाउडर (लाल, टमाटर के साथ), और बोस्टनवासी टमाटर वाले संस्करण को लगभग अपमान मानते हैं।\\n\\nक्लैम चाउडर परंपरागत रूप से खोदी हुई साउरडो ब्रेड बाउल में परोसा जाता है। यह बोस्टन का बंदरगाह भोजन है।"
    }'''

content = content.replace(old_172, new_172)

# ── ID 173 Currywurst (Germany) ───────────────────────────────────

content = content.replace(
    '      ko: "독일"\n    },\n    name: {\n      ro: "Currywurst"',
    '      ko: "독일",\n      hi: "जर्मनी"\n    },\n    name: {\n      ro: "Currywurst"'
)
content = content.replace(
    '      ko: "카리부어스트"\n    },\n    category: {',
    '      ko: "카리부어스트",\n      hi: "करीवुर्स्ट"\n    },\n    category: {'
)
content = content.replace(
    '      ko: "간식"\n    },\n    ingredients: {\n      ro: ["cârnați", "ketchup"',
    '      ko: "간식",\n      hi: "नाश्ता"\n    },\n    ingredients: {\n      ro: ["cârnați", "ketchup"'
)
content = content.replace(
    '      ko: ["소시지", "케첩", "카레 가루", "프랑스식 감자튀김 (선택)"]\n    },\n    howIsMade: {',
    '      ko: ["소시지", "케첩", "카레 가루", "프랑스식 감자튀김 (선택)"],\n      hi: ["सॉसेज", "केचप", "करी पाउडर", "फ्रेंच फ्राइज़ (वैकल्पिक)"]\n    },\n    howIsMade: {'
)
content = content.replace(
    '      ko: "소시지를 튀긴 후 썰어서 카레 가루를 넣은 토마토 소스와 함께 냅니다."\n    },\n    originText: {\n      ro: "Currywurst este',
    '      ko: "소시지를 튀긴 후 썰어서 카레 가루를 넣은 토마토 소스와 함께 냅니다.",\n      hi: "सॉसेज तलें, टुकड़ों में काटें और करी पाउडर मिले टमाटर सॉस के साथ परोसें।"\n    },\n    originText: {\n      ro: "Currywurst este'
)

old_173 = '''    originText: {
      ro: "Currywurst este o rețetă tradițională din Germania.",
      en: "Currywurst is a traditional recipe from Germany.",
      es: "Currywurst es una receta tradicional de Alemania.",
      fr: "Currywurst est une recette traditionnelle d'Allemagne.",
      de: "Currywurst ist ein traditionelles Rezept aus Deutschland.",
      pt: "Currywurst é uma receita tradicional da Alemanha.",
      ru: "Карривурст — традиционный рецепт из Германии.",
      ar: "كاري فورست هي وصفة تقليدية من ألمانيا.",
      zh: "咖喱香肠 是来自德国的传统食谱。",
      ja: "カリーヴルスト はドイツの伝統的なレシピです。",
      tr: "Currywurst, Almanya kökenli geleneksel bir tariftir.",
      it: "Currywurst è una ricetta tradizionale della Germania.",
      ko: "카리부어스트는 독일의 전통 요리입니다."
    }'''

new_173 = '''    originText: {
      ro: "Currywurst este simbolul stradal al Berlinului — o cârnățea de porc prăjită tăiată în felii, servită cu ketchup sau sos de roșii asezonat cu pudră de curry, presărată cu curry galben și paprika. A fost inventată în 1949 de Herta Heuwer din Berlin-Charlottenburg, care a amestecat ketchup cu sos Worcestershire și curry — un gest culinar simplu care a creat un fenomen de masă.\\n\\nCurrywurst este mâncarea de la chioșcul de stradă (Imbiss), simbolul fast food-ului berlinez. Anual se consumă aproximativ 800 de milioane de bucăți în Germania. Berlinul a avut un Muzeu al Currywurst dedicat exclusiv acestui preparat.",
      en: "Currywurst is Berlin's street food icon — a fried pork sausage cut into slices, served with ketchup or a thick tomato sauce heavily seasoned with curry powder, dusted with yellow curry and paprika. It was invented in 1949 by Herta Heuwer in Berlin-Charlottenburg, who mixed ketchup with Worcestershire sauce and curry — a simple culinary move that created a mass phenomenon.\\n\\nCurrywurst is the food of the street kiosk (Imbiss), the symbol of Berlin fast food. About 800 million pieces are consumed every year in Germany alone. Berlin had a Currywurst Museum dedicated exclusively to this humble dish.",
      es: "La currywurst es el símbolo callejero de Berlín — una salchicha de cerdo frita cortada en rodajas, servida con ketchup o salsa de tomate condimentada con curry en polvo, espolvoreada con curry amarillo y pimentón. La inventó en 1949 Herta Heuwer en Berlín-Charlottenburg, mezclando ketchup con salsa Worcestershire y curry — un gesto culinario sencillo que creó un fenómeno de masas.\\n\\nLa currywurst es la comida del puesto callejero (Imbiss), símbolo del fast food berlinés. Se consumen unos 800 millones de piezas al año solo en Alemania.",
      fr: "La currywurst est l'icône de la rue berlinoise — une saucisse de porc frite coupée en tranches, servie avec du ketchup ou une sauce tomate généreusement assaisonnée de curry, saupoudrée de curry jaune et de paprika. Elle a été inventée en 1949 par Herta Heuwer à Berlin-Charlottenburg en mélangeant ketchup, sauce Worcestershire et curry — un geste simple qui créa un phénomène de masse.\\n\\nLa currywurst est la nourriture du kiosque de rue (Imbiss), le symbole du fast food berlinois. Environ 800 millions de pièces sont consommées chaque année en Allemagne.",
      de: "Currywurst ist Berlins Straßenfood-Ikone — eine gebratene Schweinswurst in Scheiben, mit Currypulver stark gewürzter Tomatensauce, mit gelbem Curry und Paprika bestreut. Sie wurde 1949 von Herta Heuwer in Berlin-Charlottenburg erfunden: Ketchup, Worcestershiresauce und Curry gemischt — ein einfacher Handgriff, der ein Massenphänomen schuf.\\n\\nCurrywurst ist das Imbiss-Essen, das Symbol des Berliner Fast Foods. Jährlich werden rund 800 Millionen Stück allein in Deutschland verzehrt. Berlin hatte ein eigenes Currywurst-Museum.",
      pt: "A currywurst é o ícone de rua de Berlim — uma salsicha de porco frita cortada em fatias, servida com ketchup ou molho de tomate temperado com pó de curry, polvilhada com curry amarelo e páprica. Foi inventada em 1949 por Herta Heuwer em Berlim-Charlottenburg, que misturou ketchup com molho Worcestershire e curry — um gesto simples que criou um fenômeno de massas.\\n\\nA currywurst é a comida do quiosque de rua (Imbiss), símbolo do fast food berlinense. Cerca de 800 milhões de peças são consumidas por ano só na Alemanha.",
      ru: "Карривурст — уличная икона Берлина: жареная свиная сосиска, нарезанная кусочками, поданная с кетчупом или густым томатным соусом, щедро приправленным карри, посыпанная жёлтым карри и паприкой. Изобретено в 1949 году Хертой Хойвер в Берлин-Шарлоттенбурге — смесью кетчупа, соуса Вустершир и карри — простой жест, ставший массовым феноменом.\\n\\nКарривурст — еда уличного киоска (Imbiss), символ берлинского фастфуда. Ежегодно в одной только Германии потребляется около 800 миллионов штук.",
      ar: "الكاريفورست هو رمز الشارع البرليني — نقانق مقلية مقطعة شرائح، تُقدَّم مع الكاتشب أو صلصة طماطم مبهرة بمسحوق الكاري ومرشوش عليها كاري أصفر وبابريكا. اخترعتها هيرتا هوير عام 1949 في برلين-شارلوتنبورغ بمزج الكاتشب مع صلصة ورشستشير والكاري — بسيط جداً لكنه خلق ظاهرة جماهيرية.\\n\\nالكاريفورست طعام أكشاك الشارع (Imbiss)، رمز وجبات برلين السريعة. يُستهلك نحو 800 مليون قطعة سنوياً في ألمانيا وحدها.",
      zh: "咖喱香肠是柏林的街头食品标志——将煎猪肉香肠切片，配上大量咖喱粉调味的番茄酱，撒上黄色咖喱粉和辣椒粉。由赫尔塔·霍伊尔于1949年在柏林-夏洛滕堡发明，将番茄酱与伍斯特沙司和咖喱混合——一个简单的烹饪动作创造了一个大众现象。\\n\\n咖喱香肠是街头小亭子（Imbiss）的食物，是柏林快餐的象征。仅德国每年就消耗约8亿根咖喱香肠。",
      ja: "カリーヴルストはベルリンのストリートフードの象徴——揚げた豚のソーセージをスライスし、カレー粉をたっぷり効かせたトマトソースと一緒に、黄色いカレーとパプリカを振りかけて提供します。1949年にベルリンのヘルタ・ホイアーがケチャップにウスターソースとカレーを混ぜて発明——この単純なアイデアが大衆的な現象を生み出しました。\\n\\nカリーヴルストはストリートキオスク（Imbiss）の食べ物で、ベルリンのファストフードの象徴です。ドイツだけで年間約8億本が消費されます。",
      tr: "Currywurst, Berliner'ın sokak yemeği sembolüdür — dilimlenmiş kızartılmış domuz sosis, bol köri tozu ile baharatlandırılmış domates sosu eşliğinde, üzerine sarı köri ve kırmızı biber serpilerek sunulur. 1949'da Herta Heuwer tarafından icat edildi; ketçabı Worcestershire sosu ve köri ile karıştırdı — kitlesel bir fenomen yaratan basit bir hamle.\\n\\nCurrywurst, sokak büfesinin (Imbiss) yemeğidir; Berlin fast food'unun sembolüdür. Almanya'da yılda yaklaşık 800 milyon adet tüketilir.",
      it: "La currywurst è l'icona dello street food berlinese — una salsiccia di maiale fritta tagliata a fette, servita con ketchup o densa salsa di pomodoro condita con curry in polvere, spolverata di curry giallo e paprica. Fu inventata nel 1949 da Herta Heuwer a Berlino-Charlottenburg mescolando ketchup, salsa Worcestershire e curry — una semplice mossa che creò un fenomeno di massa.\\n\\nLa currywurst è il cibo del chiosco di strada (Imbiss), simbolo del fast food berlinese. In Germania vengono consumati circa 800 milioni di pezzi ogni anno.",
      ko: "카리부어스트는 베를린의 길거리 음식 아이콘입니다. 튀긴 돼지 소시지를 잘라 카레 가루를 듬뿍 뿌린 케첩이나 토마토 소스와 함께 황색 카레와 파프리카를 얹어 제공합니다. 1949년 헤르타 호이어가 케첩에 우스터 소스와 카레를 섞어 발명했으며, 이 단순한 행위가 대중적인 현상을 만들어냈습니다.\\n\\n카리부어스트는 길거리 키오스크(임비스)의 음식으로 베를린 패스트푸드의 상징입니다. 독일에서만 연간 약 8억 개가 소비됩니다.",
      hi: "करीवुर्स्ट बर्लिन का स्ट्रीट फूड आइकन है — तले हुए सूअर के सॉसेज को स्लाइस करके करी पाउडर से भरपूर मसाले वाले केचप या टमाटर सॉस के साथ, ऊपर पीले करी और पापरिका छिड़ककर परोसा जाता है। इसे 1949 में हर्टा हॉयर ने बर्लिन में बनाया था — केचप, वॉस्टरशायर सॉस और करी मिलाकर — एक सरल कदम जिसने एक बड़ा ट्रेंड बनाया।\\n\\nकरीवुर्स्ट सड़क के स्टॉल (इम्बिस) का खाना है, बर्लिन के फास्ट फूड का प्रतीक। जर्मनी में अकेले हर साल लगभग 80 करोड़ करीवुर्स्ट खाई जाती हैं।"
    }'''

content = content.replace(old_173, new_173)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("IDs 171-173 done")
