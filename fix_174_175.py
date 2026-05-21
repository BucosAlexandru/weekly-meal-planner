with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ── ID 174 Tom Kha Gai (Thailand) ─────────────────────────────────

content = content.replace(
    '      ko: "태국"\n    },\n    name: {\n      ro: "Tom Kha Gai"',
    '      ko: "태국",\n      hi: "थाईलैंड"\n    },\n    name: {\n      ro: "Tom Kha Gai"'
)
content = content.replace(
    '      ko: "톰카가이"\n    },\n    category: {',
    '      ko: "톰카가이",\n      hi: "टॉम खा गाई"\n    },\n    category: {'
)
content = content.replace(
    '      ko: "점심"\n    },\n    ingredients: {\n      ro: ["piept de pui", "lapte de cocos"',
    '      ko: "점심",\n      hi: "दोपहर का खाना"\n    },\n    ingredients: {\n      ro: ["piept de pui", "lapte de cocos"'
)
content = content.replace(
    '      ko: ["닭가슴살", "코코넛 우유", "레몬풀", "갈랑갈", "라임 잎", "고추", "버섯", "생선 소스", "라임"]\n    },\n    howIsMade: {',
    '      ko: ["닭가슴살", "코코넛 우유", "레몬풀", "갈랑갈", "라임 잎", "고추", "버섯", "생선 소스", "라임"],\n      hi: ["चिकन ब्रेस्ट", "नारियल दूध", "लेमनग्रास", "गलंगल", "नींबू पत्ते", "मिर्च", "मशरूम", "फिश सॉस", "नींबू"]\n    },\n    howIsMade: {'
)
content = content.replace(
    '      ko: "코코넛 밀크에 레몬그라스, 갈랑갈, 카피르 라임잎, 버섯을 넣고 닭가슴살을 끓입니다. 피시 소스와 라임즙으로 간을 맞춥니다."\n    },\n    originText: {\n      ro: "Tom Kha Gai este',
    '      ko: "코코넛 밀크에 레몬그라스, 갈랑갈, 카피르 라임잎, 버섯을 넣고 닭가슴살을 끓입니다. 피시 소스와 라임즙으로 간을 맞춥니다.",\n      hi: "नारियल दूध में लेमनग्रास, गलंगल, कफीर नींबू पत्ते और मशरूम के साथ चिकन उबालें। फिश सॉस और नींबू से स्वाद दें।"\n    },\n    originText: {\n      ro: "Tom Kha Gai este'
)

old_174 = '''    originText: {
      ro: "Tom Kha Gai este o rețetă tradițională din Thailanda.",
      en: "Tom Kha Gai is a traditional recipe from Thailand.",
      es: "Tom Kha Gai es una receta tradicional de Tailandia.",
      fr: "Tom Kha Gai est une recette traditionnelle de Thaïlande.",
      de: "Tom Kha Gai ist ein traditionelles Rezept aus Thailand.",
      pt: "Tom Kha Gai é uma receita tradicional da Tailândia.",
      ru: "Том Кха Гай — традиционный рецепт из Таиланда.",
      ar: "توم خا غاي هي وصفة تقليدية من تايلاند.",
      zh: "冬阴椰鸡汤 是来自泰国的传统食谱。",
      ja: "トムカーガイ はタイの伝統的なレシピです。",
      tr: "Tom Kha Gai, Tayland kökenli geleneksel bir tariftir.",
      it: "Tom Kha Gai è una ricetta tradizionale della Thailandia.",
      ko: "톰카가이는 태국의 전통 요리입니다."
    }'''

new_174 = '''    originText: {
      ro: "Tom Kha Gai este bijuteria bucătăriei thai — un suet cremos și aromat de lapte de cocos cu pui, galangal (ghimbirul thai), lemongrass, frunze de kaffir lime și ciuperci. Spre deosebire de Tom Yam (picant și acru), Tom Kha este catifelat, bogat, ușor picant și însorit de aromele citrice ale limetei.\\n\\nGalangalul este ingredientul definitoriu — ruda mai floral-citric-piperantă a ghimbirului, care nu poate fi înlocuită fără a pierde esența preparatului. Tom Kha Gai se servește cu orez jasmine alb și se mănâncă la prânz sau cină în toată Thailanda.",
      en: "Tom Kha Gai is the jewel of Thai cuisine — a creamy and aromatic coconut milk soup with chicken, galangal (Thai ginger), lemongrass, kaffir lime leaves, and mushrooms. Unlike Tom Yam (spicy and sour), Tom Kha is velvety, rich, mildly spicy, and brightened by the citrus aromas of lime.\\n\\nGalangal is the defining ingredient — the more floral, citric, and peppery cousin of ginger, which cannot be substituted without losing the dish's essence. Tom Kha Gai is served with white jasmine rice throughout Thailand.",
      es: "Tom Kha Gai es la joya de la cocina tailandesa — una sopa cremosa y aromática de leche de coco con pollo, galanga (jengibre tailandés), hierba limón, hojas de kaffir lime y setas. A diferencia del Tom Yam, el Tom Kha es aterciopelado, rico y refrescado por los aromas cítricos de la lima.\\n\\nLa galanga es el ingrediente definitorio — el primo más floral, cítrico y picante del jengibre, que no puede sustituirse sin perder la esencia del plato. Se sirve con arroz jazmín blanco.",
      fr: "Le Tom Kha Gai est le joyau de la cuisine thaïlandaise — une soupe crémeuse et aromatique de lait de coco avec poulet, galanga (gingembre thaïlandais), citronnelle, feuilles de kaffir lime et champignons. Contrairement au Tom Yam, le Tom Kha est velouté, riche et illuminé par les arômes citriques du citron vert.\\n\\nLe galanga est l'ingrédient définitoire — le cousin plus floral, citrique et poivré du gingembre, irrempplaçable sans perdre l'essence du plat. Il se sert avec du riz jasmin blanc.",
      de: "Tom Kha Gai ist das Juwel der thailändischen Küche — eine cremige, aromatische Kokosmilchsuppe mit Hähnchen, Galgant (Thai-Ingwer), Zitronengras, Kaffirlimettenblättern und Pilzen. Anders als Tom Yam ist Tom Kha samtig, reichhaltig und belebt durch die Zitrusnoten der Limette.\\n\\nGalgant ist die definierende Zutat — der blumigere, zitrusartige, pfeffrige Verwandte des Ingwers, der nicht ersetzt werden kann. Wird mit weißem Jasminreis serviert.",
      pt: "Tom Kha Gai é a joia da cozinha tailandesa — uma sopa cremosa e aromática de leite de coco com frango, galanga (gengibre tailandês), capim-limão, folhas de kaffir lime e cogumelos. Ao contrário do Tom Yam, o Tom Kha é aveludado, rico e iluminado pelos aromas cítricos da lima.\\n\\nA galanga é o ingrediente definidor — o primo mais floral, cítrico e apimentado do gengibre, que não pode ser substituído. Serve-se com arroz jasmim branco.",
      ru: "Том Кха Гай — жемчужина тайской кухни: кремовый ароматный суп из кокосового молока с курицей, галангалом (тайским имбирём), лемонграссом, листьями кафрского лайма и грибами. В отличие от Том Яма, Том Кха бархатистый, насыщенный и освещённый цитрусовыми ароматами лайма.\\n\\nГалангал — определяющий ингредиент: более цветочный, цитрусовый и перечный родственник имбиря, который нельзя заменить. Подают с белым жасминовым рисом.",
      ar: "توم خا غاي هو جوهرة المطبخ التايلاندي — حساء كريمي وعطر من حليب جوز الهند مع الدجاج والغالانغال وعشب الليمون وأوراق كافير ليم والفطر. بخلاف توم يام، توم خا ناعم وغني ومضيء بنكهات الليمون.\\n\\nالغالانغال هو المكون الجوهري — قريب الزنجبيل الأكثر ورودية وحمضية وحارية الذي لا يمكن الاستعاضة عنه. يُقدَّم مع الأرز الياسميني الأبيض.",
      zh: "冬阴椰鸡汤是泰国菜的瑰宝——用椰奶与鸡肉、高良姜（泰式生姜）、香茅、卡菲尔青柠叶和蘑菇烹制的浓郁芬芳汤品。与冬阴功不同，冬阴椰鸡汤如丝绒般丰润，被青柠的柑橘香气点亮。\\n\\n高良姜是这道菜的灵魂食材——它是生姜花香更浓、柑橘味更强的近亲，无法替代。与白色茉莉香米同食。",
      ja: "トムカーガイはタイ料理の宝石です——ガランガル・レモングラス・コブミカンの葉・きのこと鶏肉が入ったコクのあるまろやかなココナッツミルクスープです。トムヤムとは違い、トムカーはビロードのようにまろやかでライムの柑橘の香りが輝きを添えます。\\n\\nガランガルが決め手の食材——ショウガのより花のような、シトラス系のアクセントを持つ仲間で、代替不可能です。白いジャスミンライスと共に提供されます。",
      tr: "Tom Kha Gai, Tayland mutfağının mücevheridir — tavuk, galangal (Tayland zencefili), limongrass, kaffir lime yaprakları ve mantar içeren kremamsı ve aromatik bir hindistancevizi sütü çorbası. Tom Yam'ın aksine, Tom Kha kadifemsi ve zengin olup limonun narenciye aromasıyla aydınlatılmıştır.\\n\\nGalangal, tanımlayıcı malzemedir — zencefilin daha çiçekli, narenciyeli ve biberli kuzeni olup ikame edilemez. Beyaz yasemin pirinci ile servis edilir.",
      it: "Il Tom Kha Gai è il gioiello della cucina tailandese — una zuppa di latte di cocco cremosa e aromatica con pollo, galanga (zenzero tailandese), limonegrass, foglie di kaffir lime e funghi. A differenza del Tom Yam, il Tom Kha è vellutato, ricco e illuminato dagli aromi agrumati del lime.\\n\\nLa galanga è l'ingrediente definitorio — il cugino più floreale, agrumato e pepato dello zenzero, che non può essere sostituito. Si serve con riso jasmine bianco.",
      ko: "톰카가이는 태국 요리의 보석입니다. 갈랑갈(태국 생강), 레몬그라스, 카피르 라임잎, 버섯과 닭고기가 들어간 진하고 향긋한 코코넛 밀크 수프입니다. 톰얌과 달리 톰카는 부드럽고 풍부하며 라임의 시트러스 향기로 빛납니다.\\n\\n갈랑갈이 핵심 식재료입니다 — 생강보다 더 꽃향기가 나고 시트러스하며 후추 맛이 나는 친척으로, 대체 불가능합니다. 흰 자스민 쌀밥과 함께 제공됩니다.",
      hi: "टॉम खा गाई थाई व्यंजन का रत्न है — चिकन, गलंगल (थाई अदरक), लेमनग्रास, काफीर नींबू पत्ते और मशरूम के साथ नारियल के दूध का मलाईदार और सुगंधित सूप। टॉम यम (तीखे और खट्टे) के विपरीत, टॉम खा मखमली, समृद्ध और नींबू की खुशबू से जीवंत है।\\n\\nगलंगल परिभाषित करने वाली सामग्री है — अदरक का अधिक फूलों-खट्टे-मिर्ची वाला चचेरा भाई, जिसे बदला नहीं जा सकता। सफेद जैस्मीन चावल के साथ परोसा जाता है।"
    }'''

content = content.replace(old_174, new_174)

# ── ID 175 Cachupa (Cape Verde) ───────────────────────────────────

content = content.replace(
    '      ko: "카보베르데"\n    },\n    name: {\n      ro: "Cachupa"',
    '      ko: "카보베르데",\n      hi: "केप वर्डे"\n    },\n    name: {\n      ro: "Cachupa"'
)
content = content.replace(
    '      ko: "카추파"\n    },\n    category: {',
    '      ko: "카추파",\n      hi: "काचुपा"\n    },\n    category: {'
)
content = content.replace(
    '      ko: "저녁"\n    },\n    ingredients: {\n      ro: ["porumb"',
    '      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    ingredients: {\n      ro: ["porumb"'
)
content = content.replace(
    '      ko: ["옥수수", "콩", "양배추", "감자", "호박", "돼지고기", "소시지", "양파", "마늘", "토마토", "기름", "소금"]\n    },\n    howIsMade: {',
    '      ko: ["옥수수", "콩", "양배추", "감자", "호박", "돼지고기", "소시지", "양파", "마늘", "토마토", "기름", "소금"],\n      hi: ["मक्का", "बीन्स", "पत्तागोभी", "आलू", "कद्दू", "सूअर का मांस", "सॉसेज", "प्याज़", "लहसुन", "टमाटर", "तेल", "नमक"]\n    },\n    howIsMade: {'
)
content = content.replace(
    '      ko: "옥수수와 콩을 삶은 후 채소와 고기를 넣고 걸쭉해질 때까지 오래 약불로 조리합니다."\n    },\n    originText: {\n      ro: "Cachupa este',
    '      ko: "옥수수와 콩을 삶은 후 채소와 고기를 넣고 걸쭉해질 때까지 오래 약불로 조리합니다.",\n      hi: "मक्का और बीन्स उबालें, फिर सब्जियां और मांस डालें। गाढ़ा होने तक लंबे समय तक धीमे पकाएं।"\n    },\n    originText: {\n      ro: "Cachupa este'
)

old_175 = '''    originText: {
      ro: "Cachupa este o rețetă tradițională din Capul Verde.",
      en: "Cachupa is a traditional recipe from Cape Verde.",
      es: "Cachupa es una receta tradicional de Cabo Verde.",
      fr: "Cachupa est une recette traditionnelle du Cap-Vert.",
      de: "Cachupa ist ein traditionelles Rezept aus Kap Verde.",
      pt: "Cachupa é uma receita tradicional de Cabo Verde.",
      ru: "Качупа — традиционный рецепт из Кабо-Верде.",
      ar: "كاشوبا هي وصفة تقليدية من الرأس الأخضر.",
      zh: "卡丘帕炖菜 是来自佛得角的传统食谱。",
      ja: "カチュパ はカーボベルデの伝統的なレシピです。",
      tr: "Cachupa, Cabo Verde kökenli geleneksel bir tariftir.",
      it: "Cachupa è una ricetta tradizionale di Capo Verde.",
      ko: "카추파는 카보베르데의 전통 요리입니다."
    }'''

new_175 = '''    originText: {
      ro: "Cachupa este sufletul bucătăriei capverdiene — o tocăniță densă și generoasă de porumb omogen, fasole, legume și carne de porc sau cârnați, gătită ore întregi la foc mic. Există cachupa rica (cu carne și cârnați) și cachupa pobre (varianta mai simplă, cu mai puțin sau fără carne) — distincție care reflecta clasele sociale din epoca colonială.\\n\\nCachupa se gătește în cantități mari și se mănâncă pe parcursul mai multor zile. Versiunea de a doua zi (cachupa guisada) este considerată și mai gustoasă — porumbul și fasolea absorb și mai mult aromele. Este mâncarea națională a Capului Verde prin consens cultural.",
      en: "Cachupa is the soul of Cape Verdean cuisine — a dense and generous stew of hominy corn, beans, vegetables, and pork or sausages, slow-cooked for hours. There is cachupa rica (with meat and sausages) and cachupa pobre (the simpler version, with little or no meat) — a distinction that reflected the social classes of the colonial era.\\n\\nCachupa is cooked in large quantities and eaten over several days. The next-day version (cachupa guisada) is considered even more flavorful — the corn and beans absorb more of the aromas. It is the national dish of Cape Verde by cultural consensus.",
      es: "La cachupa es el alma de la cocina caboverdiana — un estofado denso y generoso de maíz pilado, frijoles, verduras y cerdo o embutidos, cocinado a fuego lento durante horas. Existe la cachupa rica (con carne y embutidos) y la cachupa pobre (la versión más sencilla) — distinción que refleja las clases sociales de la época colonial.\\n\\nLa cachupa se cocina en grandes cantidades y se come varios días. La versión del día siguiente (cachupa guisada) se considera aún más sabrosa. Es el plato nacional de Cabo Verde por consenso cultural.",
      fr: "La cachupa est l'âme de la cuisine cap-verdienne — un ragoût dense et généreux de maïs pilé, haricots, légumes et porc ou saucisses, mijoté pendant des heures. Il existe la cachupa rica (avec viande et saucisses) et la cachupa pobre (la version plus simple) — une distinction qui reflétait les classes sociales de l'époque coloniale.\\n\\nLa cachupa se cuisine en grandes quantités et se mange sur plusieurs jours. La version du lendemain (cachupa guisada) est considérée encore plus savoureuse. C'est le plat national du Cap-Vert par consensus culturel.",
      de: "Cachupa ist die Seele der kapverdischen Küche — ein dichter, üppiger Eintopf aus Maishominy, Bohnen, Gemüse und Schweinefleisch oder Würsten, stundenlang auf kleiner Flamme gegart. Es gibt Cachupa Rica (mit Fleisch) und Cachupa Pobre (die einfachere Version) — eine Unterscheidung, die die Gesellschaftsklassen der Kolonialzeit widerspiegelte.\\n\\nCachupa wird in großen Mengen gekocht und über mehrere Tage gegessen. Die Version vom nächsten Tag (Cachupa Guisada) gilt als noch schmackhafter. Es ist das Nationalgericht Kap Verdes.",
      pt: "A cachupa é a alma da culinária cabo-verdiana — um ensopado denso e generoso de milho hominy, feijão, legumes e carne de porco ou salsichas, cozinhado a lume brando durante horas. Existe a cachupa rica e a cachupa pobre — distinção que refletia as classes sociais da época colonial.\\n\\nA cachupa é cozinhada em grandes quantidades e comida ao longo de vários dias. A versão do dia seguinte (cachupa guisada) é considerada ainda mais saborosa. É o prato nacional de Cabo Verde por consenso cultural.",
      ru: "Качупа — душа кухни Кабо-Верде: густое щедрое рагу из кукурузы хоминий, фасоли, овощей и свинины или колбас, томящееся часами на медленном огне. Существует качупа рика (с мясом) и качупа побре (упрощённая версия) — различие, отражавшее классовое деление колониальной эпохи.\\n\\nКачупу готовят большими порциями и едят несколько дней подряд. Версия следующего дня (качупа гисада) считается ещё более вкусной. Это национальное блюдо Кабо-Верде по культурному консенсусу.",
      ar: "الكاشوبا هي روح المطبخ الرأس الأخضري — يخنة كثيفة وسخية من ذرة الهوميني والفاصوليا والخضار ولحم الخنزير أو النقانق، تُطهى على نار هادئة لساعات. توجد الكاشوبا ريكا (باللحم) والكاشوبا بوبري (النسخة الأبسط) — تمييز كان يعكس الطبقات الاجتماعية في الحقبة الاستعمارية.\\n\\nتُطهى بكميات كبيرة وتُؤكل على مدى عدة أيام. نسخة اليوم التالي تُعدّ أكثر نكهة. إنها الطبق الوطني لجزر الرأس الأخضر.",
      zh: "卡丘帕是佛得角美食的灵魂——用玉米粒、豆类、蔬菜、猪肉或香肠慢炖数小时而成的浓郁丰盛炖菜。有卡丘帕里卡（含肉和香肠）和卡丘帕波布雷（较简单的版本）——这种区别反映了殖民时代的社会阶层。\\n\\n卡丘帕通常大量烹制，可以吃好几天。隔天的版本（卡丘帕吉萨达）被认为更加美味。它是佛得角公认的国菜。",
      ja: "カチュパはカーボベルデ料理の魂です——ホミニーコーン・豆類・野菜・豚肉またはソーセージを何時間もかけてじっくり煮込んだ濃厚で贅沢な煮込み料理です。カチュパ・リカ（肉入り）とカチュパ・ポブレ（シンプルな版）があり、植民地時代の社会階層を反映していました。\\n\\nカチュパは大量に作られ数日にわたって食べられます。翌日の版（カチュパ・ギサダ）はさらに美味しくなるとされています。文化的合意によりカーボベルデの国民食です。",
      tr: "Cachupa, Kap Verde mutfağının ruhudur — hominy mısır, fasulye, sebze ve domuz eti veya sosisten oluşan yoğun ve cömert bir güveç, saatlerce kısık ateşte pişirilir. Cachupa rica (etli) ve cachupa pobre (daha sade) olmak üzere ikiye ayrılır — bu ayrım sömürge döneminin toplumsal sınıflarını yansıtıyordu.\\n\\nBüyük miktarlarda pişirilir ve birkaç gün boyunca yenir. Ertesi günün versiyonu (cachupa guisada) daha lezzetli kabul edilir. Kap Verde'nin kültürel uzlaşıyla ulusal yemeğidir.",
      it: "La cachupa è l'anima della cucina capoverdiana — uno stufato denso e generoso di mais hominy, fagioli, verdure e carne di maiale o salsicce, cotto per ore a fuoco lento. Esistono la cachupa rica (con carne) e la cachupa pobre (la versione più semplice) — una distinzione che rifletteva le classi sociali dell'epoca coloniale.\\n\\nSi cucina in grandi quantità e si mangia per diversi giorni. La versione del giorno dopo (cachupa guisada) è considerata ancora più saporita. È il piatto nazionale di Capo Verde per consenso culturale.",
      ko: "카추파는 카보베르데 요리의 영혼입니다. 호미니 옥수수, 콩, 채소, 돼지고기 또는 소시지를 몇 시간에 걸쳐 천천히 끓여 만드는 진하고 넉넉한 스튜입니다. 카추파 리카(고기 포함)와 카추파 포브레(간단한 버전)가 있으며, 이는 식민지 시대의 사회 계층을 반영했습니다.\\n\\n많은 양을 만들어 며칠에 걸쳐 먹으며, 다음 날 버전(카추파 기사다)이 더 맛있다고 여겨집니다. 카보베르데의 문화적 합의에 의한 국민 요리입니다.",
      hi: "काचुपा केप वर्डे के व्यंजन की आत्मा है — होमिनी मक्का, बीन्स, सब्जियां और सूअर का मांस या सॉसेज का घना और भरपूर स्टू, घंटों धीमी आंच पर पकाया जाता है। काचुपा रिका (मांस के साथ) और काचुपा पोब्रे (सरल संस्करण) होता है — यह भेद औपनिवेशिक युग की सामाजिक श्रेणियों को दर्शाता था।\\n\\nकाचुपा बड़ी मात्रा में बनाई जाती है और कई दिनों तक खाई जाती है। अगले दिन का संस्करण (काचुपा गिसाडा) और भी स्वादिष्ट माना जाता है। यह केप वर्डे का सांस्कृतिक सहमति से राष्ट्रीय व्यंजन है।"
    }'''

content = content.replace(old_175, new_175)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("IDs 174-175 done")
