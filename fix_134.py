with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ID 134 - Chicken Paprikash (Hungary) - category already has hi

content = content.replace(
    '      ko: "헝가리"\n    },\n    name: {\n      ro: "Chicken Paprikash"',
    '      ko: "헝가리",\n      hi: "हंगरी"\n    },\n    name: {\n      ro: "Chicken Paprikash"'
)

content = content.replace(
    '      ko: "닭 파프리카슈"\n    },\n    category: {\n      ro: "Cină"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["pui", "ceapă", "paprika"',
    '      ko: "닭 파프리카슈",\n      hi: "चिकन पैप्रिकाश"\n    },\n    category: {\n      ro: "Cină"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["pui", "ceapă", "paprika"'
)

content = content.replace(
    '      ko: ["닭고기", "양파", "파프리카 가루", "사워크림", "기름", "소금", "후추"]\n    },\n    howIsMade: {',
    '      ko: ["닭고기", "양파", "파프리카 가루", "사워크림", "기름", "소금", "후추"],\n      hi: ["चिकन", "प्याज़", "पैप्रिका पाउडर", "खट्टी क्रीम", "तेल", "नमक", "काली मिर्च"]\n    },\n    howIsMade: {'
)

content = content.replace(
    '      ko: "양파를 볶고 닭고기를 넣어 파프리카를 뿌린 후, 사워크림과 향신료를 넣어 크리미해질 때까지 끓입니다."\n    },\n    originText: {\n      ro: "Chicken Paprikash este',
    '      ko: "양파를 볶고 닭고기를 넣어 파프리카를 뿌린 후, 사워크림과 향신료를 넣어 크리미해질 때까지 끓입니다.",\n      hi: "प्याज़ भूनें, चिकन डालें, पैप्रिका छिड़कें, खट्टी क्रीम और मसालों के साथ क्रीमी होने तक पकाएं।"\n    },\n    originText: {\n      ro: "Chicken Paprikash este'
)

old_origin = '''    originText: {
      ro: "Chicken Paprikash este o rețetă tradițională din Ungaria.",
      en: "Chicken Paprikash is a traditional recipe from Hungary.",
      es: "Pollo Paprikash es una receta tradicional de Hungría.",
      fr: "Poulet au paprika est une recette traditionnelle de Hongrie.",
      de: "Paprikahuhn ist ein traditionelles Rezept aus Ungarn.",
      pt: "Frango Paprikash é uma receita tradicional da Hungria.",
      ru: "Паприкаш из курицы — традиционный рецепт из Венгрии.",
      ar: "دجاج بابريكا هي وصفة تقليدية من المجر.",
      zh: "红椒鸡 是来自匈牙利的传统食谱。",
      ja: "チキン・パプリカシュ はハンガリーの伝統的なレシピです。",
      tr: "Tavuk Paprikash Macaristan kökenli geleneksel bir tariftir.",
      it: "Pollo Paprikash è una ricetta tradizionale dell'Ungheria.",
      ko: "닭 파프리카슈는 헝가리의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Csirkepaprikás — denumit în română pui paprikaș — este emblema bucătăriei maghiare: bucăți de pui braizate lent într-un sos de ceapă și paprika dulce maghiară, finalizate cu smântână groasă pentru o textură mătăsoasă. Paprika a ajuns în Ungaria prin Imperiul Otoman în secolul al XVI-lea și a devenit ingredientul definitoriu al țării. Calitatea paprikei contează enorm — varianta afumată sau cea dulce de Kalocsa determină caracterul întregului fel.\\n\\nFelul de mâncare se servește tradițional cu nokedli (găluște de ou mici) sau tăiței de casă. Varianta cu smântână integrală, nediluată, face diferența față de imitații. Gătitul lent și absorbția sucurilor de pui în sos sunt esențiale.",
      en: "Csirkepaprikás — chicken paprikash — is the emblem of Hungarian cuisine: chicken pieces braised slowly in a sauce of onion and sweet Hungarian paprika, finished with thick sour cream for a silky texture. Paprika reached Hungary via the Ottoman Empire in the sixteenth century and became the country's defining ingredient. The quality of the paprika matters enormously — the smoked or sweet variety from Kalocsa sets the character of the whole dish.\\n\\nIt is traditionally served with nokedli (small egg dumplings) or homemade noodles. Using full-fat, undiluted sour cream is what separates the original from imitations. Slow braising and the absorption of chicken juices into the sauce are essential.",
      es: "Csirkepaprikás — pollo paprikash — es el emblema de la cocina húngara: trozos de pollo estofados lentamente en una salsa de cebolla y pimentón dulce húngaro, terminados con crema agria espesa para una textura sedosa. El pimentón llegó a Hungría a través del Imperio Otomano en el siglo XVI y se convirtió en el ingrediente definitorio del país. La calidad del pimentón importa enormemente — la variedad ahumada o dulce de Kalocsa determina el carácter del plato.\\n\\nSe sirve tradicionalmente con nokedli (pequeñas albóndigas de huevo) o fideos caseros. Usar crema agria entera y sin diluir es lo que diferencia el original de las imitaciones.",
      fr: "Le csirkepaprikás — poulet au paprika — est l'emblème de la cuisine hongroise : des morceaux de poulet braisés lentement dans une sauce d'oignon et de paprika doux hongrois, terminés avec de la crème fraîche épaisse pour une texture soyeuse. Le paprika est arrivé en Hongrie via l'Empire ottoman au XVIe siècle et est devenu l'ingrédient définissant du pays. La qualité du paprika est primordiale — la variété fumée ou douce de Kalocsa détermine le caractère du plat.\\n\\nIl se sert traditionnellement avec des nokedli (petites pâtes aux œufs) ou des nouilles maison. Utiliser de la crème fraîche entière et non diluée est ce qui distingue l'original des imitations.",
      de: "Csirkepaprikás — Paprikahähnchen — ist das Wahrzeichen der ungarischen Küche: Hähnchenteile, langsam in einer Sauce aus Zwiebeln und süßem ungarischen Paprika geschmort, mit dicker Sauerrahm abgerundet für eine seidige Textur. Paprika gelangte im 16. Jahrhundert über das Osmanische Reich nach Ungarn und wurde zum prägenden Zutat des Landes. Die Qualität des Paprikas ist entscheidend — die geräucherte oder süße Variante aus Kalocsa bestimmt den Charakter des Gerichts.\\n\\nEs wird traditionell mit Nokedli (kleinen Eierspätzle) oder selbst gemachten Nudeln serviert. Die Verwendung von vollfettem, unverdünntem Sauerrahm unterscheidet das Original von Imitationen.",
      pt: "Csirkepaprikás — frango paprikash — é o emblema da cozinha húngara: pedaços de frango braseados lentamente em molho de cebola e páprica doce húngara, finalizado com creme azedo espesso para uma textura sedosa. A páprica chegou à Hungria pelo Império Otomano no século XVI e tornou-se o ingrediente definidor do país. A qualidade da páprica importa enormemente — a variedade defumada ou doce de Kalocsa determina o caráter do prato.\\n\\nÉ servido tradicionalmente com nokedli (pequenos spätzle de ovo) ou macarrão caseiro. Usar creme azedo integral e não diluído é o que distingue o original das imitações.",
      ru: "Чиркепаприкаш — куриный паприкаш — символ венгерской кухни: кусочки курицы, медленно тушёные в соусе из лука и сладкой венгерской паприки, с добавлением густой сметаны для шелковистой текстуры. Паприка попала в Венгрию через Османскую империю в XVI веке и стала главным ингредиентом страны. Качество паприки имеет огромное значение — копчёный или сладкий сорт из Калочи определяет характер блюда.\\n\\nТрадиционно подаётся с нокедли (маленькими яичными клёцками) или домашней лапшой. Использование жирной, неразбавленной сметаны — вот что отличает оригинал от имитаций.",
      ar: "سيركيباريكاش — دجاج باپريكاش — شعار المطبخ المجري: قطع دجاج مطهوة ببطء في صلصة البصل والبابريكا الحلوة المجرية، مع القشدة الحامضة الكثيفة لقوام حريري. وصلت البابريكا إلى المجر عبر الإمبراطورية العثمانية في القرن السادس عشر ولتصبح المكون المميز للبلاد. جودة البابريكا مهمة جداً — صنف كالوتشا المدخن أو الحلو يحدد طابع الطبق.\\n\\nيُقدَّم تقليدياً مع النوكيدلي (زلابية البيض الصغيرة) أو المعكرونة المنزلية. استخدام القشدة الحامضة كاملة الدسم هو ما يميز الأصل عن التقليد.",
      zh: "纸鸡卡帕里卡什——匈牙利辣椒鸡——是匈牙利料理的标志：鸡块在洋葱和甜匈牙利红椒粉的酱汁中慢慢炖煮，最后加入厚重的酸奶油，形成丝滑口感。红椒粉于16世纪经奥斯曼帝国传入匈牙利，成为这个国家的代表性食材。红椒粉的品质至关重要——来自卡洛恰的熏制或甜味品种决定了整道菜的风格。\\n\\n传统上配诺克里（小鸡蛋面疙瘩）或手擀面食用。使用全脂、未稀释的酸奶油是区分正宗与仿制的关键。",
      ja: "チルケパプリカーシュ——チキンパプリカシュ——はハンガリー料理の象徴です：鶏肉を玉ねぎとハンガリーの甘いパプリカのソースでじっくり煮込み、濃厚なサワークリームで仕上げてシルキーな食感にします。パプリカは16世紀にオスマン帝国を通じてハンガリーに伝わり、国の代表的な食材となりました。パプリカの品質が非常に重要で——カロチャ産のスモーク、または甘い品種が料理の性格を決定します。\\n\\n伝統的にノケドリ（小さな卵入り生地）または自家製麺と共に提供されます。全脂の薄めていないサワークリームを使うことが正本と模倣品を分ける鍵です。",
      tr: "Csirkepaprikás — tavuk paprikaşı — Macar mutfağının amblemidir: tavuk parçaları soğan ve tatlı Macar kırmızıbiberi sosunda yavaşça pişirilir, ipeksi bir doku için kalın ekşi kremayla bitirilir. Paprika, 16. yüzyılda Osmanlı İmparatorluğu üzerinden Macaristan'a ulaştı ve ülkenin belirleyici malzemesi oldu. Paprika kalitesi son derece önemlidir — Kaloçsa'nın tütsülenmiş veya tatlı çeşidi yemeğin karakterini belirler.\\n\\nGeleneksel olarak nokedli (küçük yumurtalı hamur) veya ev yapımı erişte ile servis edilir. Tam yağlı, seyreltilmemiş ekşi krema kullanmak orijinali taklitlerden ayıran şeydir.",
      it: "Il csirkepaprikás — pollo al paprika — è l'emblema della cucina ungherese: pezzi di pollo brasati lentamente in un sugo di cipolla e paprika dolce ungherese, rifiniti con panna acida densa per una texture setosa. La paprika arrivò in Ungheria attraverso l'Impero Ottomano nel XVI secolo e diventò l'ingrediente identitario del paese. La qualità della paprika è fondamentale — la varietà affumicata o dolce di Kalocsa definisce il carattere del piatto.\\n\\nSi serve tradizionalmente con i nokedli (piccoli gnocchi di uovo) o con pasta fatta in casa. Usare panna acida intera e non diluita è ciò che distingue l'originale dalle imitazioni.",
      ko: "치르케파프리카시——치킨 파프리카슈——는 헝가리 요리의 상징입니다. 닭고기 조각을 양파와 헝가리산 달콤한 파프리카 소스에 천천히 브레이징한 뒤, 진한 사워크림으로 마무리해 부드러운 식감을 냅니다. 파프리카는 16세기 오스만 제국을 통해 헝가리에 전해졌고 나라의 핵심 재료가 되었습니다. 파프리카의 품질이 매우 중요하며——칼로차산 훈제 또는 달콤한 품종이 요리의 성격을 결정합니다.\\n\\n전통적으로 노케들리(작은 달걀 경단)나 직접 만든 국수와 함께 냅니다. 전지방 사워크림을 희석하지 않고 사용하는 것이 정통과 모조의 차이입니다.",
      hi: "चिर्केपैप्रिकाश — चिकन पैप्रिकाश — हंगेरियन व्यंजन का प्रतीक है: चिकन के टुकड़ों को प्याज़ और मीठी हंगेरियन पैप्रिका की चटनी में धीरे-धीरे ब्रेज़ करके, गाढ़ी खट्टी क्रीम से मिलाकर रेशमी बनाया जाता है। पैप्रिका 16वीं सदी में ऑटोमन साम्राज्य के ज़रिए हंगरी पहुंची और देश का पहचानी सामग्री बन गई। पैप्रिका की गुणवत्ता बहुत महत्वपूर्ण है — कालोचा की धुएँदार या मीठी किस्म पूरे व्यंजन का चरित्र तय करती है।\\n\\nपारंपरिक रूप से नोकेडली (छोटे अंडे के पकौड़े) या घर के बने नूडल्स के साथ परोसा जाता है। पूरी वसा की, पतली न की गई खट्टी क्रीम का उपयोग ही असली को नकल से अलग करता है।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 134 done")
