data = open('public/js/recipes.js', 'r', encoding='utf-8').read()

# Add hi to origin
data = data.replace(
    '      ko: "페루"\n    },\n    name: {\n      ro: "Arroz Chaufa"',
    '      ko: "페루",\n      hi: "पेरू"\n    },\n    name: {\n      ro: "Arroz Chaufa"',
    1
)

# Add hi to name
data = data.replace(
    '      ko: "아로스 차우파"\n    },\n    category: {',
    '      ko: "아로스 차우파",\n      hi: "अरोस चाउफ़ा"\n    },\n    category: {',
    1
)

# Add hi to category (Dinner — after Peru/Arroz Chaufa block)
data = data.replace(
    '      ko: "저녁"\n    },\n    servings: 4,\n    tipType: \'def\',\n    pairingsType: \'def\',\n    ingredients: {\n      ro: ["orez", "ouă", "pui sau vită"',
    '      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    servings: 4,\n    tipType: \'def\',\n    pairingsType: \'def\',\n    ingredients: {\n      ro: ["orez", "ouă", "pui sau vită"',
    1
)

# Add hi to ingredients
data = data.replace(
    '      ko: ["쌀", "계란", "닭고기 또는 소고기", "파", "파프리카", "간장", "마늘", "기름"]\n    },\n    howIsMade: {',
    '      ko: ["쌀", "계란", "닭고기 또는 소고기", "파", "파프리카", "간장", "마늘", "기름"],\n      hi: ["चावल", "अंडे", "चिकन या बीफ", "हरा प्याज़", "शिमला मिर्च", "सोया सॉस", "लहसुन", "तेल"]\n    },\n    howIsMade: {',
    1
)

# Add hi to howIsMade
data = data.replace(
    '      ko: "기름에 계란과 채소를 볶은 후 고기와 밥을 넣습니다. 간장으로 맛을 내고 뜨겁게 제공합니다."\n    },\n    originText: {',
    '      ko: "기름에 계란과 채소를 볶은 후 고기와 밥을 넣습니다. 간장으로 맛을 내고 뜨겁게 제공합니다.",\n      hi: "तेल में अंडे और सब्जियां भूनें, फिर मांस और पका हुआ चावल डालें। सोया सॉस से मिलाएं और गर्म परोसें।"\n    },\n    originText: {',
    1
)

# Replace originText
old_ot = '''    originText: {
      ro: "Arroz Chaufa este o rețetă tradițională din Peru.",
      en: "Arroz Chaufa is a traditional recipe from Peru.",
      es: "Arroz Chaufa es una receta tradicional de Perú.",
      fr: "Arroz Chaufa est une recette traditionnelle du Pérou.",
      de: "Arroz Chaufa ist ein traditionelles Rezept aus Peru.",
      pt: "Arroz Chaufa é uma receita tradicional do Peru.",
      ru: "Аррос Чауфа — традиционный рецепт из Перу.",
      ar: "أرز تشوفا هي وصفة تقليدية من بيرو.",
      zh: "秘鲁炒饭 是来自秘鲁的传统食谱。",
      ja: "チャウファご飯 はペルーの伝統的なレシピです。",
      tr: "Arroz Chaufa Peru kökenli geleneksel bir tariftir.",
      it: "Arroz Chaufa è una ricetta tradizionale del Perù.",
      ko: "아로스 차우파는 페루의 전통 요리입니다."
    }'''

new_ot = '''    originText: {
      ro: "Arroz Chaufa este denumirea peruviană pentru un stil de orez prăjit chinezesc care a devenit un preparat propriu prin bucătăriile comunității Tusán — urmașii muncitorilor chinezi sosiți în Peru de la mijlocul secolului al XIX-lea. Cuvântul chaufa vine din cantonezul chow fan, însemnând orez prăjit, și preparatul poartă clar această descendență: tehnica este chineză, dar ingredientele se adaptează cu cămara peruviană.\\n\\nOrezul este de o zi și rece, prăjit la foc mare cu ouă, sos de soia, usturoi și ghimbir, apoi amestecat cu vită, pui sau porc. Uleiul de susan și uneori sosul de stridii, adăugate la final, îl disting de alte orezuri prăjite asiatice. Se servește în restaurante chifa — stabilimente peruano-chineze — la fel de mult ca în bucătăriile casnice.",
      en: "Arroz chaufa is the Peruvian name for a style of Chinese fried rice that became its own distinct dish through the kitchens of the Tusán community — descendants of Chinese laborers who arrived in Peru from the mid-19th century onward. The word chaufa comes from the Cantonese chow fan, meaning fried rice, and the dish carries that lineage clearly: the technique is Chinese, but the ingredients shift with the Peruvian pantry.\\n\\nThe rice is day-old and cold, fried over high heat with eggs, soy sauce, garlic, and ginger, then tossed with beef, chicken, or pork. Sesame oil and sometimes oyster sauce, added at the end, distinguish it from other Asian fried rices. It is served in chifa restaurants — Peruvian-Chinese establishments — as much as in everyday home kitchens.",
      es: "Arroz chaufa es el nombre peruano para un estilo de arroz frito chino que se convirtió en un plato propio a través de las cocinas de la comunidad Tusán — descendientes de trabajadores chinos que llegaron a Perú desde mediados del siglo XIX. La palabra chaufa viene del cantonés chow fan, que significa arroz frito, y el plato lleva claramente ese linaje: la técnica es china, pero los ingredientes se adaptan con la despensa peruana.\\n\\nEl arroz es de un día y frío, frito a fuego alto con huevos, salsa de soja, ajo y jengibre, luego mezclado con res, pollo o cerdo. El aceite de sésamo y a veces la salsa de ostras, agregados al final, lo distinguen de otros arroces fritos asiáticos. Se sirve en restaurantes chifa — establecimientos peruano-chinos — tanto como en cocinas caseras cotidianas.",
      fr: "L\'arroz chaufa est le nom péruvien d\'un style de riz frit chinois devenu un plat distinct grâce aux cuisines de la communauté Tusán — les descendants des travailleurs chinois arrivés au Pérou à partir du milieu du XIXe siècle. Le mot chaufa vient du cantonais chow fan, signifiant riz frit, et le plat porte clairement cette filiation : la technique est chinoise, mais les ingrédients s\'adaptent au garde-manger péruvien.\\n\\nLe riz est vieux d\'un jour et froid, frit à feu vif avec des œufs, de la sauce soja, de l\'ail et du gingembre, puis mélangé avec du bœuf, du poulet ou du porc. L\'huile de sésame et parfois la sauce aux huîtres, ajoutées à la fin, le distinguent des autres riz frits asiatiques. Il est servi dans les restaurants chifa — établissements péruano-chinois — autant que dans les cuisines familiales.",
      de: "Arroz Chaufa ist der peruanische Name für einen Stil von chinesisch gebratenem Reis, der durch die Küchen der Tusán-Gemeinschaft zu einem eigenen Gericht wurde — Nachkommen chinesischer Arbeiter, die ab Mitte des 19. Jahrhunderts nach Peru kamen. Das Wort Chaufa kommt vom kantonesischen chow fan, was gebratener Reis bedeutet, und das Gericht trägt diese Herkunft klar: die Technik ist chinesisch, aber die Zutaten verschieben sich mit der peruanischen Vorratskammer.\\n\\nDer Reis ist einen Tag alt und kalt, bei hoher Hitze mit Eiern, Sojasoße, Knoblauch und Ingwer gebraten, dann mit Rind, Huhn oder Schwein vermengt. Sesamöl und manchmal Austernsoße, am Ende hinzugefügt, unterscheiden ihn von anderen asiatischen gebratenen Reisgerichten. Er wird in Chifa-Restaurants — peruanisch-chinesischen Lokalen — genauso viel serviert wie in alltäglichen Heimküchen.",
      pt: "Arroz chaufa é o nome peruano para um estilo de arroz frito chinês que se tornou um prato próprio através das cozinhas da comunidade Tusán — descendentes de trabalhadores chineses que chegaram ao Peru a partir de meados do século XIX. A palavra chaufa vem do cantonês chow fan, significando arroz frito, e o prato carrega claramente essa linhagem: a técnica é chinesa, mas os ingredientes se adaptam à dispensa peruana.\\n\\nO arroz é de um dia e frio, frito em fogo alto com ovos, molho de soja, alho e gengibre, depois misturado com carne bovina, frango ou porco. Óleo de sésamo e às vezes molho de ostras, adicionados no final, distinguem-no de outros arrozes fritos asiáticos. É servido em restaurantes chifa — estabelecimentos peruano-chineses — tanto quanto em cozinhas domésticas cotidianas.",
      ru: "Аррос чауфа — перуанское название стиля китайского жареного риса, который стал самостоятельным блюдом благодаря кухням общины Тусан — потомков китайских рабочих, прибывших в Перу с середины XIX века. Слово чауфа происходит от кантонского chow fan (жареный рис), и блюдо явно несёт в себе эту родословную: техника китайская, но ингредиенты адаптируются под перуанскую кладовую.\\n\\nРис однодневной выдержки, холодный, жарится на сильном огне с яйцами, соевым соусом, чесноком и имбирём, затем перемешивается с говядиной, курицей или свининой. Кунжутное масло и иногда устричный соус, добавляемые в конце, отличают его от других азиатских жареных рисов. Его подают в ресторанах «чифа» — перуано-китайских заведениях — не меньше, чем на домашних кухнях.",
      ar: "أرز تشوفا هو الاسم البيروفي لأسلوب الأرز المقلي الصيني الذي تحوّل إلى طبق مستقل عبر مطابخ مجتمع توسان — أحفاد العمال الصينيين الذين وصلوا إلى البيرو منذ منتصف القرن التاسع عشر. تأتي كلمة «تشوفا» من الكانتونية chow fan بمعنى الأرز المقلي، ويحمل الطبق هذا النسب بوضوح: التقنية صينية، لكن المكوّنات تتكيف مع مؤونة المطبخ البيروفي.\\n\\nالأرز عمره يوم ومبرّد، يُقلى على نار شديدة مع البيض وصلصة الصويا والثوم والزنجبيل، ثم يُمزج مع البقري أو الدجاج أو الخنزير. ما يميّزه عن أرز مقلي آسيوي آخر هو زيت السمسم وأحياناً صلصة المحار المضافين في النهاية. يُقدَّم في مطاعم شيفا — المطاعم البيروفية الصينية — بقدر ما يُقدَّم في البيوت اليومية.",
      zh: "阿罗斯·查乌法是秘鲁对一种中式炒饭的称呼，这道菜通过图桑社区（19世纪中叶起抵达秘鲁的中国劳工后裔）的厨房发展成独特菜肴。"查乌法"一词来自广东话"炒饭"，菜肴的血统清晰可见：技法是中式的，食材却融入了秘鲁食柜的元素。\\n\\n米饭要过夜的冷饭，大火与鸡蛋、酱油、蒜、姜一起翻炒，再加入牛肉、鸡肉或猪肉。最后加入芝麻油、有时加耗油，使它有别于其他亚洲炒饭。在"奇花"餐厅（秘鲁-中国混合餐厅）和日常家庭厨房中同样常见。",
      ja: "アロス・チャウファはペルー式の中国炒飯を指すペルー名で、ツサン・コミュニティ——19世紀半ば以降ペルーに来た中国人労働者の子孫——の台所を通じて独自の料理へと発展した。チャウファという言葉は広東語のチョウファン（炒飯）に由来し、料理にはその系譜が明確に宿っている：技法は中国式だが、食材はペルーの食材庫に合わせて変化する。\\n\\nご飯は一日以上経った冷たいものを使い、高火力で卵・醤油・ニンニク・生姜とともに炒め、牛肉・鶏肉・豚肉と合わせる。最後に加えるごま油と時にオイスターソースが他のアジア系炒飯と一線を画す。チファ・レストラン——ペルー中国系の食堂——でも日常の家庭の台所でも等しく作られる。",
      tr: "Arroz chaufa, 19. yüzyılın ortalarından itibaren Peru\'ya gelen Çinli işçilerin torunları olan Tusán topluluğunun mutfakları aracılığıyla özgün bir yemeğe dönüşen Çin usulü kızarmış pirincin Peru adıdır. Chaufa kelimesi, kızarmış pirinç anlamına gelen Kanton lehçesindeki chow fan\'dan gelir ve yemek bu soyağacını açıkça taşır: teknik Çin\'den, ama malzemeler Peru kileriyle uyum sağlar.\\n\\nPirinç bir günlük ve soğuktur; yüksek ateşte yumurta, soya sosu, sarımsak ve zencefille birlikte kızartılır, ardından sığır eti, tavuk veya domuzla karıştırılır. Sonda eklenen susam yağı ve bazen istiridye sosu onu diğer Asya pirinci yemeklerinden ayırır. Chifa restoranlarında — Peru-Çin müzik mekanlarında — günlük ev mutfaklarında olduğu kadar servis edilir.",
      it: "L\'arroz chaufa è il nome peruviano per uno stile di riso fritto cinese che è diventato un piatto a sé stante attraverso le cucine della comunità Tusán — discendenti dei lavoratori cinesi arrivati in Perù dalla metà del XIX secolo. La parola chaufa deriva dal cantonese chow fan, che significa riso fritto, e il piatto porta chiaramente questa discendenza: la tecnica è cinese, ma gli ingredienti si adattano alla dispensa peruviana.\\n\\nIl riso è di un giorno e freddo, fritto a fuoco alto con uova, salsa di soia, aglio e zenzero, poi mescolato con manzo, pollo o maiale. L\'olio di sesamo e a volte la salsa di ostriche, aggiunti alla fine, lo distinguono dagli altri risi fritti asiatici. Viene servito nei ristoranti chifa — locali peruviano-cinesi — tanto quanto nelle cucine domestiche di ogni giorno.",
      ko: "아로스 차우파는 19세기 중반부터 페루에 온 중국인 노동자들의 후손인 투산 커뮤니티의 주방을 통해 독자적인 요리로 발전한 중국식 볶음밥에 대한 페루 이름입니다. 차우파라는 단어는 광동어 차오판(炒飯, 볶음밥)에서 유래했으며, 이 요리는 그 혈통을 명확히 담고 있습니다: 기법은 중국식이지만 재료는 페루 식품 저장고에 맞게 변화합니다.\\n\\n밥은 하루 지난 찬밥을 사용하고, 달걀·간장·마늘·생강과 함께 강한 불에서 볶은 뒤 소고기·닭고기·돼지고기를 넣습니다. 마지막에 참기름과 때로는 굴 소스를 더하는 것이 다른 아시아 볶음밥과의 차이점입니다. 치파 레스토랑——페루-중국 혼합 식당——에서뿐 아니라 일상적인 가정 주방에서도 많이 만들어집니다.",
      hi: "अरोस चाउफ़ा चीनी तले हुए चावल की एक शैली का पेरूवियन नाम है जो तुसान समुदाय की रसोइयों के माध्यम से अपना विशिष्ट व्यंजन बन गया — 19वीं सदी के मध्य से पेरू आए चीनी मजदूरों के वंशज। 'चाउफ़ा' शब्द कैंटोनीज़ 'चाउ फान' (तले हुए चावल) से आया है, और व्यंजन में यह वंशावली स्पष्ट है: तकनीक चीनी है, लेकिन सामग्री पेरूवियन खाद्य भंडार के अनुसार बदलती है।\\n\\nचावल एक दिन पुराना और ठंडा होता है, अंडे, सोया सॉस, लहसुन और अदरक के साथ तेज़ आंच पर भूना जाता है, फिर बीफ, चिकन या पोर्क के साथ मिलाया जाता है। अंत में डाला जाने वाला तिल का तेल और कभी-कभी ऑयस्टर सॉस इसे अन्य एशियाई तले हुए चावलों से अलग करता है। यह चीफा रेस्तरां — पेरूवियन-चीनी प्रतिष्ठानों — में उतना ही परोसा जाता है जितना रोज़मर्रा की घरेलू रसोइयों में।"
    }'''

if old_ot in data:
    data = data.replace(old_ot, new_ot, 1)
    open('public/js/recipes.js', 'w', encoding='utf-8').write(data)
    print('Done 109')
else:
    print('NOT FOUND 109')
