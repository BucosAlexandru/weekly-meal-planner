with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ID 150 - Pepian (Guatemala) - no hi fields yet

content = content.replace(
    '      ko: "과테말라"\n    },\n    name: {\n      ro: "Pepian"',
    '      ko: "과테말라",\n      hi: "ग्वाटेमाला"\n    },\n    name: {\n      ro: "Pepian"'
)

content = content.replace(
    '      ko: "페피안"\n    },\n    category: {\n      ro: "Cină",\n      en: "Dinner",\n      es: "Cena",\n      fr: "Dîner",\n      de: "Abendessen",\n      pt: "Jantar",\n      ru: "Ужин",\n      ar: "عشاء",\n      zh: "晚餐",\n      ja: "夕食",\n      tr: "Akşam yemeği",\n      it: "Cena",\n      ko: "저녁"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["carne de pui"',
    '      ko: "페피안",\n      hi: "पेपियान"\n    },\n    category: {\n      ro: "Cină",\n      en: "Dinner",\n      es: "Cena",\n      fr: "Dîner",\n      de: "Abendessen",\n      pt: "Jantar",\n      ru: "Ужин",\n      ar: "عشاء",\n      zh: "晚餐",\n      ja: "夕食",\n      tr: "Akşam yemeği",\n      it: "Cena",\n      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["carne de pui"'
)

content = content.replace(
    '      ko: ["닭고기", "토마토", "고추", "호박", "감자", "참깨 씨앗", "호박 씨앗", "향신료"]\n    },\n    howIsMade: {',
    '      ko: ["닭고기", "토마토", "고추", "호박", "감자", "참깨 씨앗", "호박 씨앗", "향신료"],\n      hi: ["चिकन", "टमाटर", "मिर्च", "कद्दू", "आलू", "तिल के बीज", "कद्दू के बीज", "मसाले"]\n    },\n    howIsMade: {'
)

content = content.replace(
    '      ko: "볶은 씨앗, 피망, 토마토, 향신료와 함께 고기를 끓입니다. 진한 소스가 형성될 때까지 조리하고 밥과 함께 제공합니다."\n    },\n    originText: {\n      ro: "Pepian este',
    '      ko: "볶은 씨앗, 피망, 토마토, 향신료와 함께 고기를 끓입니다. 진한 소스가 형성될 때까지 조리하고 밥과 함께 제공합니다.",\n      hi: "मांस को सब्जियों, भुने बीजों, मिर्च, टमाटर और मसालों के साथ पकाएं जब तक गाढ़ी चटनी न बन जाए। चावल के साथ परोसें।"\n    },\n    originText: {\n      ro: "Pepian este'
)

old_origin = '''    originText: {
      ro: "Pepian este o rețetă tradițională din Guatemala.",
      en: "Pepian is a traditional recipe from Guatemala.",
      es: "Pepian es una receta tradicional de Guatemala.",
      fr: "Pepian est une recette traditionnelle du Guatemala.",
      de: "Pepian ist ein traditionelles Rezept aus Guatemala.",
      pt: "Pepian é uma receita tradicional da Guatemala.",
      ru: "Пепиан — традиционный рецепт из Гватемалы.",
      ar: "بيبيان هي وصفة تقليدية من غواتيمالا.",
      zh: "瓜地马拉炖肉 是来自危地马拉的传统食谱。",
      ja: "ペピアン はグアテマラの伝統的なレシピです。",
      tr: "Pepian Guatemala kökenli geleneksel bir tariftir.",
      it: "Pepian è una ricetta tradizionale del Guatemala.",
      ko: "페피안은 과테말라의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Pepian este un sos național guatemalez cu rădăcini maya pre-colombiene — un amestec bogat de semințe de susan și dovleac prăjite, ardei uscați, roșii și condimente, macinate împreună într-o pastă groasă în care se gătesc bucăți de pui sau curcan. Preparatul există în variante roșii, verzi și negre, fiecare cu profiluri de aromă distincte.\\n\\nPepian se servește cu orez alb, cartofi și tortillas. Rețeta se transmite din generație în generație și este considerată una dintre cele patru feluri naționale ale Guatemalei. La sărbătorile și ceremoniile maya, prepararea colectivă a pepianului este parte din ritualul social.",
      en: "Pepian is a Guatemalan national sauce with pre-Columbian Maya roots — a rich blend of toasted sesame and pumpkin seeds, dried chilies, tomatoes, and spices ground into a thick paste in which chicken or turkey pieces are cooked. The dish exists in red, green, and black variants, each with distinct flavor profiles.\\n\\nPepian is served with white rice, potatoes, and tortillas. The recipe is passed down through generations and is considered one of Guatemala's four national dishes. At Maya festivals and ceremonies, the communal preparation of pepian is part of the social ritual.",
      es: "El pepian es una salsa nacional guatemalteca con raíces mayas precolombinas — una mezcla rica de semillas de sésamo y calabaza tostadas, chiles secos, tomates y especias molidas en una pasta espesa donde se cocinan piezas de pollo o pavo. El plato existe en variantes roja, verde y negra, cada una con perfiles de sabor distintos.\\n\\nEl pepian se sirve con arroz blanco, papas y tortillas. La receta se transmite de generación en generación y se considera uno de los cuatro platos nacionales de Guatemala.",
      fr: "Le pepian est une sauce nationale guatémaltèque aux racines mayas précolumbiennes — un mélange riche de graines de sésame et de courge grillées, de piments séchés, de tomates et d'épices broyés en une pâte épaisse dans laquelle cuisent des morceaux de poulet ou de dinde. Le plat existe en variantes rouge, verte et noire, chacune avec des profils aromatiques distincts.\\n\\nLe pepian se sert avec du riz blanc, des pommes de terre et des tortillas. La recette se transmet de génération en génération et est considérée comme l'un des quatre plats nationaux du Guatemala.",
      de: "Pepian ist eine guatemaltekische Nationalsauce mit präkolumbianischen Maya-Wurzeln — eine reichhaltige Mischung aus gerösteten Sesam- und Kürbiskernen, getrockneten Chilischoten, Tomaten und Gewürzen, die zu einer dicken Paste gemahlen werden, in der Hähnchen- oder Putenstücke gegart werden. Das Gericht gibt es in roten, grünen und schwarzen Varianten mit je eigenen Aromaprofilen.\\n\\nPepian wird mit weißem Reis, Kartoffeln und Tortillas serviert. Das Rezept wird von Generation zu Generation weitergegeben und gilt als eines der vier Nationalgerichte Guatemalas.",
      pt: "Pepian é um molho nacional guatemalteco com raízes maias pré-colombianas — uma mistura rica de sementes de gergelim e abóbora torradas, pimentas secas, tomates e especiarias moídas numa pasta grossa onde são cozidos pedaços de frango ou peru. O prato existe em variantes vermelha, verde e negra, cada uma com perfis de sabor distintos.\\n\\nO pepian é servido com arroz branco, batatas e tortilhas. A receita é transmitida de geração em geração e é considerado um dos quatro pratos nacionais da Guatemala.",
      ru: "Пепиан — национальный гватемальский соус с доколумбовыми корнями майя: богатая смесь обжаренных семян кунжута и тыквы, сушёного чили, томатов и специй, перемолотых в густую пасту, в которой готовятся кусочки курицы или индейки. Блюдо бывает красным, зелёным и чёрным — каждый вариант имеет своё вкусовое созвездие.\\n\\nПепиан подают с белым рисом, картофелем и тортильями. Рецепт передаётся из поколения в поколение и считается одним из четырёх национальных блюд Гватемалы.",
      ar: "البيبيان صوص وطني غواتيمالي ذو جذور مايا ما قبل كولومبية — خليط غني من بذور السمسم واليقطين المحمصتين والفلفل الحار المجفف والطماطم والتوابل المطحونة في عجينة سميكة تُطهى فيها قطع الدجاج أو الديك الرومي. يتوفر الطبق بأشكال حمراء وخضراء وسوداء لكل منها نكهة مختلفة.\\n\\nيُقدَّم مع الأرز الأبيض والبطاطس والتورتيلا. تتوارث الأجيال الوصفة وتُعدّ من أبرز أطباق غواتيمالا الأربعة الوطنية.",
      zh: "佩皮安是危地马拉的国家酱料，有着前哥伦布时期玛雅文明的根源——将烤熟的芝麻和南瓜子、干辣椒、番茄和香料磨成浓厚的酱糊，鸡肉或火鸡块在其中慢炖。这道菜有红色、绿色和黑色三种变体，各有不同的风味。\\n\\n佩皮安搭配白米饭、土豆和玉米饼食用。食谱代代相传，被视为危地马拉四大国菜之一。",
      ja: "ペピアンはグアテマラの国民的ソースで、コロンブス以前のマヤ文明に由来します——炒ったゴマとカボチャの種、乾燥チリ、トマト、スパイスを厚いペーストに挽いて、鶏肉やターキーの切り身を煮込みます。赤、緑、黒の3種類があり、それぞれ異なる風味を持ちます。\\n\\n白ご飯、ジャガイモ、トルティーヤとともに提供されます。レシピは代々受け継がれており、グアテマラの四大国民料理のひとつとされています。",
      tr: "Pepian, Kolomb öncesi Maya kökleri olan Guatemalatik bir ulusal sostur — kavrulmuş susam ve kabak tohumlarının, kuru biberlerin, domateslerin ve baharatların öğütülerek oluşturduğu yoğun bir macundur; içinde tavuk veya hindi parçaları pişirilir. Kırmızı, yeşil ve siyah çeşitleri mevcut olup her birinin kendine özgü lezzet profili vardır.\\n\\nPepian, beyaz pirinç, patates ve tortillayla servis edilir. Tarif nesilden nesile aktarılır ve Guatemala'nın dört ulusal yemeğinden biri olarak kabul edilir.",
      it: "Il pepian è una salsa nazionale guatemalteca con radici maya precolombiane — un ricco mix di semi di sesamo e di zucca tostati, peperoncini secchi, pomodori e spezie macinati in una pasta densa in cui si cuociono pezzi di pollo o tacchino. Il piatto esiste in varianti rossa, verde e nera, ciascuna con profili aromatici distinti.\\n\\nIl pepian si serve con riso bianco, patate e tortillas. La ricetta si trasmette di generazione in generazione ed è considerata uno dei quattro piatti nazionali del Guatemala.",
      ko: "페피안은 마야 문명 이전의 뿌리를 가진 과테말라 국민 소스입니다. 볶은 참깨와 호박씨, 건조 고추, 토마토, 향신료를 함께 갈아 만든 진한 페이스트에 닭고기나 칠면조를 넣어 끓입니다. 붉은색, 녹색, 검정색 세 가지 변형이 있으며 각각 독특한 풍미를 지닙니다.\\n\\n흰 밥, 감자, 토르티야와 함께 제공됩니다. 레시피는 대대로 전해져 내려오며 과테말라 4대 국민 요리 중 하나로 꼽힙니다.",
      hi: "पेपियान ग्वाटेमाला का राष्ट्रीय सॉस है जिसकी जड़ें कोलंबस-पूर्व माया सभ्यता में हैं — भुने तिल और कद्दू के बीज, सूखी मिर्च, टमाटर और मसालों को पीसकर बनाई गई गाढ़ी चटनी में चिकन या टर्की के टुकड़े पकाए जाते हैं। यह व्यंजन लाल, हरे और काले रूपों में मिलता है, हरेक का अपना विशिष्ट स्वाद है।\\n\\nपेपियान को सफेद चावल, आलू और टॉर्टिला के साथ परोसा जाता है। यह रेसिपी पीढ़ी-दर-पीढ़ी चली आती है और ग्वाटेमाला के चार राष्ट्रीय व्यंजनों में से एक मानी जाती है।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 150 done")
