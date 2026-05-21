with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ID 145 - Sheftalia (Cyprus) - no hi fields yet

content = content.replace(
    '      ko: "키프로스"\n    },\n    name: {\n      ro: "Sheftalia"',
    '      ko: "키프로스",\n      hi: "साइप्रस"\n    },\n    name: {\n      ro: "Sheftalia"'
)

content = content.replace(
    '      ko: "셰프탈리아"\n    },\n    category: {\n      ro: "Cină",\n      en: "Dinner",\n      es: "Cena",\n      fr: "Dîner",\n      de: "Abendessen",\n      pt: "Jantar",\n      ru: "Ужин",\n      ar: "عشاء",\n      zh: "晚餐",\n      ja: "夕食",\n      tr: "Akşam yemeği",\n      it: "Cena",\n      ko: "저녁"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["carne tocată de porc și vită"',
    '      ko: "셰프탈리아",\n      hi: "शेफ्टालिया"\n    },\n    category: {\n      ro: "Cină",\n      en: "Dinner",\n      es: "Cena",\n      fr: "Dîner",\n      de: "Abendessen",\n      pt: "Jantar",\n      ru: "Ужин",\n      ar: "عشاء",\n      zh: "晚餐",\n      ja: "夕食",\n      tr: "Akşam yemeği",\n      it: "Cena",\n      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["carne tocată de porc și vită"'
)

content = content.replace(
    '      ko: ["다진 돼지고기와 소고기", "양파", "파슬리", "향신료", "내장지방막", "소금", "후추"]\n    },\n    howIsMade: {\n      ro: "Amestecă carne tocată de porc și miel',
    '      ko: ["다진 돼지고기와 소고기", "양파", "파슬리", "향신료", "내장지방막", "소금", "후추"],\n      hi: ["कीमा पोर्क और बीफ", "प्याज़", "अजमोद", "मसाले", "कॉल फैट", "नमक", "काली मिर्च"]\n    },\n    howIsMade: {\n      ro: "Amestecă carne tocată de porc și miel'
)

content = content.replace(
    '      ko: "다진 돼지고기와 양고기에 향신료를 넣어 섞고 소시지 모양으로 빚어 내장지방막으로 감싼 뒤 노릇해질 때까지 굽습니다."\n    },\n    originText: {\n      ro: "Sheftalia este',
    '      ko: "다진 돼지고기와 양고기에 향신료를 넣어 섞고 소시지 모양으로 빚어 내장지방막으로 감싼 뒤 노릇해질 때까지 굽습니다.",\n      hi: "कीमा पोर्क और मेमना मसालों के साथ मिलाएं, छोटे सॉसेज बनाएं, कॉल फैट में लपेटें और सुनहरा होने तक ग्रिल करें।"\n    },\n    originText: {\n      ro: "Sheftalia este'
)

old_origin = '''    originText: {
      ro: "Sheftalia este o rețetă tradițională din Cipru.",
      en: "Sheftalia is a traditional recipe from Cyprus.",
      es: "Sheftalia es una receta tradicional de Chipre.",
      fr: "Sheftalia est une recette traditionnelle de Chypre.",
      de: "Sheftalia ist ein traditionelles Rezept aus Zypern.",
      pt: "Sheftalia é uma receita tradicional de Chipre.",
      ru: "Шефталья — традиционный рецепт из Кипра.",
      ar: "شيفتاليا هي وصفة تقليدية من قبرص.",
      zh: "塞浦路斯烤肉卷 是来自塞浦路斯的传统食谱。",
      ja: "シェフタリア はキプロスの伝統的なレシピです。",
      tr: "Sheftalia Kıbrıs kökenli geleneksel bir tariftir.",
      it: "Sheftalia è una ricetta tradizionale di Cipro.",
      ko: "셰프탈리아는 키프로스의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Sheftalia sunt cârnații naționali din Cipru — un amestec de carne tocată de porc și miel cu ceapă, pătrunjel și condimente, înveliți în prapure (membrana care învelește organele porcului) și fripți pe jar. Prapurele se topește în timpul gătitului, menținând cârnatul suculent și conferindu-i o crustă distinctă, ușor crocantă.\\n\\nSe servesc în lipie cu salată de roșii și ceapă, însoțite de tzatziki sau hummus. Sheftalia sunt prezente la orice grătar cipriot și sunt la fel de populare în comunitățile greco-cipriote și turco-cipriote, reprezentând un element de unitate culinară pe insula împărțită.",
      en: "Sheftalia are Cyprus's national sausages — a mixture of minced pork and lamb with onion, parsley, and spices, wrapped in caul fat and grilled over charcoal. The caul fat melts during cooking, keeping the sausage juicy and giving it a distinctive, lightly crisped crust.\\n\\nThey are served in flatbread with tomato and onion salad, alongside tzatziki or hummus. Sheftalia appear at every Cypriot barbecue and are equally popular in Greek-Cypriot and Turkish-Cypriot communities, representing a culinary point of unity on the divided island.",
      es: "Las sheftalia son las salchichas nacionales de Chipre — una mezcla de carne picada de cerdo y cordero con cebolla, perejil y especias, envueltas en epiplón y asadas a la brasa. La grasa se derrite durante la cocción, manteniendo la salchicha jugosa y dándole una corteza ligeramente crujiente.\\n\\nSe sirven en pan plano con ensalada de tomate y cebolla, junto con tzatziki o hummus. Las sheftalia están presentes en cualquier barbacoa chipriota y son igual de populares entre las comunidades grecochipriota y turcochipriota.",
      fr: "Les sheftalia sont les saucisses nationales de Chypre — un mélange de porc et d'agneau hachés avec oignon, persil et épices, enveloppés dans de la crépine et grillés au charbon de bois. La crépine fond à la cuisson, gardant la saucisse juteuse et lui donnant une croûte légèrement croustillante.\\n\\nElles se servent dans du pain plat avec une salade de tomate et d'oignon, accompagnées de tzatziki ou de houmous. Les sheftalia figurent à tout barbecue chypriote et sont également populaires dans les communautés gréco-chypriote et turco-chypriote.",
      de: "Sheftalia sind Zyperns Nationalwürste — eine Mischung aus Schweine- und Lammhackfleisch mit Zwiebeln, Petersilie und Gewürzen, in Netzmagen eingewickelt und über Holzkohle gegrillt. Das Netzfett schmilzt beim Garen, hält die Wurst saftig und gibt ihr eine leicht knusprige Kruste.\\n\\nSie werden in Fladenbrot mit Tomaten- und Zwiebelsalat sowie Tzatziki oder Hummus serviert. Sheftalia sind bei jedem zypriotischen Grillabend dabei und bei griechisch-zypriotischen wie türkisch-zypriotischen Gemeinschaften gleichermaßen beliebt.",
      pt: "Sheftalia são as salsichas nacionais do Chipre — uma mistura de carne moída de porco e cordeiro com cebola, salsa e especiarias, envolta em redinha e grelhada no carvão. A redinha derrete durante o cozimento, mantendo a salsicha suculenta e conferindo-lhe uma crosta levemente crocante.\\n\\nSão servidas em pão sírio com salada de tomate e cebola, acompanhadas de tzatziki ou homus. As sheftalia estão presentes em qualquer churrasco cipriota e são igualmente populares nas comunidades greco-cipriota e turco-cipriota.",
      ru: "Шефталья — национальные колбаски Кипра: смесь рубленой свинины и баранины с луком, петрушкой и специями, завёрнутая в сальник и жаренная на углях. Сальник тает при готовке, сохраняя колбаску сочной и придавая ей характерную лёгкую хрустящую корочку.\\n\\nПодают в лаваше с салатом из томатов и лука, вместе с дзадзики или хумусом. Шефталья присутствует на каждом кипрском барбекю и одинаково популярна в греко-кипрском и турецко-кипрском сообществах.",
      ar: "الشيفتاليا هي النقانق الوطنية لقبرص — خليط من لحم الخنزير ولحم الضأن المفروم مع البصل والبقدونس والتوابل، ملفوفة بشحم الخروف ومشوية على الفحم. يذوب الشحم أثناء الطهي محافظاً على عصارة اللحم ومانحاً إياه قشرة خفيفة مقرمشة.\\n\\nتُقدَّم في خبز مسطح مع سلطة طماطم وبصل وطرف من التزاتزيكي أو الحمص. الشيفتاليا حاضرة في كل شواء قبرصي وتحظى بشعبية متساوية في المجتمعين القبرصي الروم والقبرصي التركي.",
      zh: "塞浦路斯烤肉卷是塞浦路斯的国家香肠——猪肉和羊肉末混合洋葱、欧芹和香料，用猪网油包裹，在木炭上烤制。网油在烹饪时融化，保持香肠鲜嫩多汁，形成轻微酥脆的外皮。\\n\\n通常放在饼里，搭配番茄洋葱沙拉、黄瓜酸奶酱或鹰嘴豆泥食用。塞浦路斯烤肉卷出现在每一个塞浦路斯烧烤聚会上，在希腊裔和土耳其裔社区同样受欢迎。",
      ja: "シェフタリアはキプロスの国民的ソーセージです——豚肉と子羊のひき肉に玉ねぎ、パセリ、スパイスを混ぜ、網脂で包んで炭火で焼き上げます。網脂は調理中に溶け、ソーセージをジューシーに保ちながら独特の軽いカリカリの皮を作ります。\\n\\nフラットブレッドにトマトと玉ねぎのサラダとともに包み、ツァツィキやフムスを添えて提供します。シェフタリアはキプロスのバーベキューに欠かせず、ギリシャ系・トルコ系のキプロス人コミュニティ双方で同様に愛されています。",
      tr: "Sheftalia, Kıbrıs'ın ulusal sosisleridir — kıyılmış domuz eti ve kuzu eti, soğan, maydanoz ve baharatlarla karıştırılır, gömlek yağına sarılır ve mangalda pişirilir. Gömlek yağı pişirme sırasında erir, sosisi sulu tutarak hafif çıtır bir kabuk oluşturur.\\n\\nDomates ve soğan salatası ile birlikte yassı ekmekte servis edilir, yanında tzatziki veya humus bulunur. Sheftalia her Kıbrıs mangalında yer alır ve Rum ve Türk Kıbrıslı topluluklarında eşit derecede sevilir.",
      it: "Le sheftalia sono le salsicce nazionali di Cipro — un misto di maiale e agnello tritati con cipolla, prezzemolo e spezie, avvolti nella rete di grasso e grigliati alla brace. La rete si scioglie durante la cottura, mantenendo la salsiccia succosa e conferendole una crosta leggermente croccante.\\n\\nSi servono nel pane piatto con insalata di pomodoro e cipolla, accompagnate da tzatziki o hummus. Le sheftalia compaiono a ogni barbecue cipriota e sono ugualmente amate nelle comunità greco-cipriota e turco-cipriota.",
      ko: "셰프탈리아는 키프로스의 국민 소시지입니다. 다진 돼지고기와 양고기에 양파, 파슬리, 향신료를 섞어 내장지방막으로 감싸고 숯불 위에서 굽습니다. 조리 중 지방막이 녹으면서 속은 촉촉하고 겉은 살짝 바삭한 껍질이 생깁니다.\\n\\n납작한 빵에 토마토·양파 샐러드, 차지키나 후무스와 함께 냅니다. 모든 키프로스 바비큐에서 빠지지 않으며, 그리스계와 터키계 키프로스인 공동체 모두에게 똑같이 사랑받는 요리입니다.",
      hi: "शेफ्टालिया साइप्रस के राष्ट्रीय सॉसेज हैं — कीमा पोर्क और मेमने को प्याज़, अजमोद और मसालों के साथ मिलाकर कॉल फैट में लपेटा जाता है और कोयले पर ग्रिल किया जाता है। पकाते समय वसा पिघल जाती है, सॉसेज को रसीला रखती है और हल्की कुरकुरी परत बनाती है।\\n\\nइन्हें फ्लैटब्रेड में टमाटर-प्याज़ सलाद, त्ज़ात्ज़िकी या हुम्मस के साथ परोसा जाता है। शेफ्टालिया हर साइप्रस बार्बेक्यू में अनिवार्य है और ग्रीक-साइप्रस तथा तुर्क-साइप्रस दोनों समुदायों में समान रूप से लोकप्रिय है।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 145 done")
