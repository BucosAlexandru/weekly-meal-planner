with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ID 146 - Cevapi (Bosnia and Herzegovina) - no hi fields yet

content = content.replace(
    '      ko: "보스니아 헤르체고비나"\n    },\n    name: {\n      ro: "Cevapi"',
    '      ko: "보스니아 헤르체고비나",\n      hi: "बोस्निया और हर्जेगोविना"\n    },\n    name: {\n      ro: "Cevapi"'
)

content = content.replace(
    '      ko: "체바피"\n    },\n    category: {\n      ro: "Cină",\n      en: "Dinner",\n      es: "Cena",\n      fr: "Dîner",\n      de: "Abendessen",\n      pt: "Jantar",\n      ru: "Ужин",\n      ar: "عشاء",\n      zh: "晚餐",\n      ja: "ディナー",\n      tr: "Akşam yemeği",\n      it: "Cena",\n      ko: "저녁"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["carne tocată", "usturoi"',
    '      ko: "체바피",\n      hi: "चेवापी"\n    },\n    category: {\n      ro: "Cină",\n      en: "Dinner",\n      es: "Cena",\n      fr: "Dîner",\n      de: "Abendessen",\n      pt: "Jantar",\n      ru: "Ужин",\n      ar: "عشاء",\n      zh: "晚餐",\n      ja: "ディナー",\n      tr: "Akşam yemeği",\n      it: "Cena",\n      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["carne tocată", "usturoi"'
)

content = content.replace(
    '      ko: ["다진 고기", "마늘", "양파", "소금", "후추", "기름"]\n    },\n    howIsMade: {\n      ro: "Amestecă ingredientele, formează cârnați mici',
    '      ko: ["다진 고기", "마늘", "양파", "소금", "후추", "기름"],\n      hi: ["कीमा", "लहसुन", "प्याज़", "नमक", "काली मिर्च", "तेल"]\n    },\n    howIsMade: {\n      ro: "Amestecă ingredientele, formează cârnați mici'
)

content = content.replace(
    '      ko: "재료를 섞어 작은 소시지 모양으로 빚고 구운 뒤 납작한 빵과 양파와 함께 제공합니다."\n    },\n    originText: {\n      ro: "Cevapi este',
    '      ko: "재료를 섞어 작은 소시지 모양으로 빚고 구운 뒤 납작한 빵과 양파와 함께 제공합니다.",\n      hi: "सामग्री मिलाएं, छोटे सॉसेज बनाएं, ग्रिल करें और फ्लैटब्रेड और प्याज़ के साथ परोसें।"\n    },\n    originText: {\n      ro: "Cevapi este'
)

old_origin = '''    originText: {
      ro: "Cevapi este o rețetă tradițională din Bosnia și Herțegovina.",
      en: "Cevapi is a traditional recipe from Bosnia and Herzegovina.",
      es: "Cevapi es una receta tradicional de Bosnia y Herzegovina.",
      fr: "Cevapi est une recette traditionnelle de Bosnie-Herzégovine.",
      de: "Cevapi ist ein traditionelles Rezept aus Bosnien und Herzegowina.",
      pt: "Cevapi é uma receita tradicional da Bósnia e Herzegovina.",
      ru: "Чевапи — традиционный рецепт из Боснии и Герцеговины.",
      ar: "تشيفابي هي وصفة تقليدية من البوسنة والهرسك.",
      zh: "烤肉卷 是来自波斯尼亚和黑塞哥维那的传统食谱。",
      ja: "チェバピ はボスニア・ヘルツェゴビナの伝統的なレシピです。",
      tr: "Cevapi Bosna-Hersek kökenli geleneksel bir tariftir.",
      it: "Cevapi è una ricetta tradizionale della Bosnia ed Erzegovina.",
      ko: "체바피는 보스니아 헤르체고비나의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Cevapi sunt micii balcanici — cârnați mici din carne tocată de vită și miel, fără piele, condimentați cu usturoi și boia, fripți pe grătar și serviți în lipie cu ajvar (pastă de ardei) și ceapă tocată. În Bosnia, sunt considerați mâncare națională și există rivalități locale serioase privind rețeta exactă (Sarajevo vs. alte regiuni).\\n\\nLa restaurant, cevapi vin în porții de zece, servite pe o farfurie de lemn. Lipița (somun) este parte integrantă a preparatului — ea învelește cârnații și absoarbe sucurile. Cevapi sunt consumați zilnic în Bosnia și sunt exportul culinar cel mai recunoscut al bucătăriei balcanice.",
      en: "Cevapi are the Balkan version of small sausages — skinless minced beef and lamb patties seasoned with garlic and paprika, grilled and served in flatbread with ajvar (roasted pepper paste) and chopped onion. In Bosnia, they are considered a national food and serious local rivalries exist over the exact recipe.\\n\\nAt restaurants, cevapi come in portions of ten, served on a wooden plate. The flatbread (somun) is an integral part of the dish — it wraps the sausages and absorbs the juices. Cevapi are eaten daily in Bosnia and are the most recognized culinary export of the Balkan kitchen.",
      es: "Los cevapi son la versión balcánica de los perritos calientes — pequeñas salchichas sin piel de carne picada de ternera y cordero, condimentadas con ajo y pimentón, asadas y servidas en pan plano con ajvar (pasta de pimiento asado) y cebolla picada. En Bosnia se consideran comida nacional.\\n\\nEn los restaurantes, los cevapi se sirven en porciones de diez sobre una tabla de madera. El pan plano (somun) es parte integral del plato — envuelve las salchichas y absorbe los jugos. Los cevapi se comen a diario en Bosnia.",
      fr: "Les cevapi sont la version balkanique des saucisses — de petites boulettes de bœuf et d'agneau hachés sans peau, assaisonnées d'ail et de paprika, grillées et servies dans du pain plat avec de l'ajvar (pâte de poivrons rôtis) et de l'oignon haché. En Bosnie, c'est un plat national.\\n\\nAu restaurant, les cevapi arrivent en portions de dix sur une planche en bois. Le pain plat (somun) est partie intégrante du plat — il enveloppe les saucisses et absorbe les jus. Les cevapi se consomment quotidiennement en Bosnie.",
      de: "Cevapi sind die Balkanvariante kleiner Würste — hautlose Hackfleischröllchen aus Rind und Lamm, mit Knoblauch und Paprika gewürzt, gegrillt und in Fladenbrot mit Ajvar (geröstete Paprikapaste) und gehackten Zwiebeln serviert. In Bosnien gelten sie als Nationalgericht.\\n\\nIm Restaurant kommen Cevapi in Zehnerportionen auf einem Holzbrett. Das Fladenbrot (Somun) ist fester Bestandteil — es hüllt die Würstchen ein und nimmt die Säfte auf. Cevapi werden in Bosnien täglich gegessen.",
      pt: "Cevapi são a versão balcânica das salsichas — bolinhos sem pele de carne moída de vaca e cordeiro, temperados com alho e páprica, grelhados e servidos em pão sírio com ajvar (pasta de pimentão assado) e cebola picada. Na Bósnia, são considerados comida nacional.\\n\\nNos restaurantes, os cevapi chegam em porções de dez numa tábua de madeira. O pão (somun) é parte integrante — envolve as salsichas e absorve os sucos. Os cevapi são consumidos diariamente na Bósnia.",
      ru: "Чевапи — балканский вариант маленьких колбасок: рубленые говядина и баранина без оболочки, приправленные чесноком и паприкой, жаренные на гриле и подаваемые в лаваше с аджваром (пастой из жареных перцев) и рубленым луком. В Боснии они считаются национальным блюдом.\\n\\nВ ресторане чевапи подают порциями по десять штук на деревянной доске. Лепёшка (сомун) — неотъемлемая часть блюда: она обволакивает колбаски и впитывает соки. Чевапи едят в Боснии ежедневно.",
      ar: "تشيفابي هي النسخة البلقانية من النقانق الصغيرة — قطع لحم بقر وضأن مفروم بدون قشرة، متبلة بالثوم والفلفل الحلو، مشوية وتُقدَّم في خبز مسطح مع أجفار (معجون فلفل محمص) وبصل مفروم. في البوسنة تُعدّ طعامًا وطنيًا.\\n\\nفي المطاعم تُقدَّم التشيفابي في أطباق من عشر قطع على لوح خشبي. الخبز (سومون) جزء لا يتجزأ من الطبق — يلف النقانق ويمتص العصائر. يُؤكل يوميًا في البوسنة.",
      zh: "切瓦皮是巴尔干半岛的小香肠——无皮牛肉和羊肉末拌入大蒜和辣椒粉，烤制后放在饼里，搭配阿伊瓦尔（烤椒酱）和碎洋葱食用。在波斯尼亚，切瓦皮被视为国家美食。\\n\\n餐厅里，切瓦皮通常每份十根，放在木板上呈上。扁饼（索蒙）是不可缺少的部分——用来包裹香肠并吸收肉汁。切瓦皮在波斯尼亚是日常食物。",
      ja: "チェバピはバルカン半島の小さなソーセージです——皮のない牛肉と羊肉のひき肉にニンニクとパプリカで味付けし、グリルしてフラットブレッドに挟み、アイバル（ローストペッパーペースト）と刻み玉ねぎとともに提供します。ボスニアでは国民食とされています。\\n\\nレストランでは10本一組で木の板に盛られます。フラットブレッド（ソムン）は欠かせない要素で、ソーセージを包んで肉汁を吸い取ります。チェバピはボスニアで毎日食べられています。",
      tr: "Cevapi, Balkan usulü küçük sosislerdir — derisiz kıyılmış dana ve kuzu eti karışımı sarımsak ve kırmızı biberle tatlandırılır, ızgarada pişirilir ve ajvar (közlenmiş biber ezmesi) ve doğranmış soğanla birlikte yassı ekmekte servis edilir. Bosna'da milli yemek olarak kabul edilir.\\n\\nRestoranlarda cevapi, tahta tabak üzerinde onluk porsiyonlar halinde gelir. Yassı ekmek (somun) yemeğin ayrılmaz parçasıdır — sosis etini sarar ve suları emer. Cevapi Bosna'da her gün tüketilir.",
      it: "I cevapi sono la versione balcanica delle salsicce — piccoli pezzi di manzo e agnello tritati senza budello, conditi con aglio e paprika, grigliati e serviti nel pane piatto con ajvar (pasta di peperone arrostito) e cipolla tritata. In Bosnia sono considerati cibo nazionale.\\n\\nAl ristorante i cevapi arrivano in porzioni da dieci su un piatto di legno. Il pane piatto (somun) è parte integrante del piatto — avvolge le salsicce e assorbe i succhi. I cevapi si mangiano quotidianamente in Bosnia.",
      ko: "체바피는 발칸 반도의 작은 소시지입니다. 껍질 없이 다진 소고기와 양고기에 마늘과 파프리카로 양념하고 그릴에 구워 납작한 빵에 아이바르(구운 고추 페이스트)와 다진 양파와 함께 담아냅니다. 보스니아에서는 국민 음식으로 여겨집니다.\\n\\n레스토랑에서는 10개 단위 포션으로 나무 접시에 나옵니다. 납작한 빵(소문)은 필수 요소로, 소시지를 감싸고 육즙을 흡수합니다. 체바피는 보스니아에서 매일 먹는 음식입니다.",
      hi: "चेवापी बाल्कन शैली के छोटे सॉसेज हैं — बिना केसिंग के कीमा बीफ और मेमला लहसुन और लाल मिर्च से मसाला लगाकर ग्रिल किया जाता है और फ्लैटब्रेड में अज्वार (भुनी मिर्च की चटनी) और कटे प्याज़ के साथ परोसा जाता है। बोस्निया में इसे राष्ट्रीय भोजन माना जाता है।\\n\\nरेस्तरां में चेवापी दस के पोर्शन में लकड़ी की प्लेट पर परोसे जाते हैं। फ्लैटब्रेड (सोमुन) अनिवार्य हिस्सा है — यह सॉसेज को लपेटता है और रस सोखता है। बोस्निया में चेवापी रोज़ खाई जाती है।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 146 done")
