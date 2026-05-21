data = open('public/js/recipes.js', 'r', encoding='utf-8').read()

# Add hi to origin
data = data.replace(
    '      ko: "아르헨티나"\n    },\n    name: {\n      ro: "Milanesa"',
    '      ko: "아르헨티나",\n      hi: "अर्जेंटीना"\n    },\n    name: {\n      ro: "Milanesa"',
    1
)

# Add hi to name
data = data.replace(
    '      ko: "밀라네사"\n    },\n    category: {',
    '      ko: "밀라네사",\n      hi: "मिलानेसा"\n    },\n    category: {',
    1
)

# Add hi to category (Dinner — Argentina block)
data = data.replace(
    '      ko: "저녁"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["carne de vită", "ouă", "pesmet"',
    '      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["carne de vită", "ouă", "pesmet"',
    1
)

# Add hi to ingredients
data = data.replace(
    '      ko: ["소고기", "계란", "빵가루", "밀가루", "기름", "향신료", "레몬"]\n    },\n    howIsMade: {',
    '      ko: ["소고기", "계란", "빵가루", "밀가루", "기름", "향신료", "레몬"],\n      hi: ["बीफ", "अंडे", "ब्रेडक्रम्ब्स", "आटा", "तेल", "मसाले", "नींबू"]\n    },\n    howIsMade: {',
    1
)

# Add hi to howIsMade
data = data.replace(
    '      ko: "고기를 얇게 두드린 후 밀가루, 달걀, 빵가루 순서로 입혀 황금빛이 될 때까지 튀깁니다."\n    },\n    originText: {',
    '      ko: "고기를 얇게 두드린 후 밀가루, 달걀, 빵가루 순서로 입혀 황금빛이 될 때까지 튀깁니다.",\n      hi: "मांस के पतले टुकड़े ठोकें, आटे, अंडे और ब्रेडक्रम्ब्स में डुबाएं, फिर सुनहरा होने तक तलें।"\n    },\n    originText: {',
    1
)

# Replace originText
old_ot = '''    originText: {
      ro: "Milanesa este o rețetă tradițională din Argentina.",
      en: "Milanesa is a traditional recipe from Argentina.",
      es: "Milanesa es una receta tradicional de Argentina.",
      fr: "Milanesa est une recette traditionnelle d'Argentine.",
      de: "Milanesa ist ein traditionelles Rezept aus Argentinien.",
      pt: "Milanesa é uma receita tradicional da Argentina.",
      ru: "Миланеса — традиционный рецепт из Аргентины.",
      ar: "ميلانيسا هي وصفة تقليدية من الأرجنتين.",
      zh: "阿根廷炸牛排 是来自阿根廷的传统食谱。",
      ja: "ミラネサ はアルゼンチンの伝統的なレシピです。",
      tr: "Milanesa Arjantin kökenli geleneksel bir tariftir.",
      it: "Milanesa è una ricetta tradizionale dell'Argentina.",
      ko: "밀라네사는 아르헨티나의 전통 요리입니다."
    }'''

new_ot = '''    originText: {
      ro: "Milanesa a ajuns în Argentina cu imigranții italieni de la sfârșitul secolului al XIX-lea și începutul secolului al XX-lea, adusă direct din cotoletta alla Milanese din Lombardia. În forma sa argentiniană, o felie subțire de vită — uneori pui sau vițel — este bătută, trecută prin ou bătut și pesmet, prăjită în ulei până se formează o crustă aurie uniformă. Procesul este rapid, rezultatul consistent: exterior crocant în jurul cărnii fragede.\\n\\nA devenit unul dintre cele mai comune mese zilnice în Argentina, mâncată la cantinele școlare, mesele de familie și restaurantele de colț cu aceeași frecvență. Varianta napolitana pune sos de roșii, șuncă și brânză topită deasupra. Sub formă de sandviș — învelită într-o chiflă cu salată și roșii — este unul dintre cele mai iubite alimente de stradă din Argentina. Zeama de lămâie stoarsă înainte de servire este standard.",
      en: "Milanesa arrived in Argentina with the Italian immigrants of the late 19th and early 20th centuries, carried directly from the cotoletta alla Milanese of Lombardy. In its Argentine form, a thin slice of beef — or sometimes chicken or veal — is pounded flat, dredged in beaten egg and breadcrumbs, and fried in oil until a uniform golden crust forms. The process is quick, the result consistent: a crisp exterior around tender meat.\\n\\nIt became one of the most common everyday meals in Argentina, eaten at school canteens, family tables, and corner restaurants with equal frequency. The napolitana variant tops the fried cutlet with tomato sauce, ham, and melted cheese. In sandwich form — tucked into a bread roll with lettuce and tomato — it is one of Argentina\'s most beloved street foods. Lemon juice squeezed over the crust just before eating is standard.",
      es: "La milanesa llegó a Argentina con los inmigrantes italianos de finales del siglo XIX y principios del XX, traída directamente de la cotoletta alla Milanese de Lombardía. En su forma argentina, una fina loncha de res — a veces pollo o ternera — se aplana, se pasa por huevo batido y pan rallado, y se fríe en aceite hasta que se forma una corteza dorada uniforme. El proceso es rápido, el resultado consistente: un exterior crujiente alrededor de carne tierna.\\n\\nSe convirtió en una de las comidas cotidianas más comunes en Argentina, consumida en comedores escolares, mesas familiares y restaurantes de barrio con igual frecuencia. La variante napolitana cubre el filete frito con salsa de tomate, jamón y queso fundido. En forma de sándwich — en un pan con lechuga y tomate — es uno de los alimentos callejeros más queridos de Argentina. El jugo de limón exprimido sobre la corteza justo antes de comer es estándar.",
      fr: "La milanesa est arrivée en Argentine avec les immigrants italiens de la fin du XIXe et du début du XXe siècle, importée directement de la cotoletta alla Milanese de Lombardie. Dans sa forme argentine, une fine tranche de bœuf — parfois de poulet ou de veau — est aplatie, passée dans l\'œuf battu et la chapelure, puis frite dans l\'huile jusqu\'à formation d\'une croûte dorée uniforme. Le processus est rapide, le résultat cohérent : un extérieur croustillant autour d\'une viande tendre.\\n\\nElle est devenue l\'un des repas quotidiens les plus courants en Argentine, consommée dans les cantines scolaires, les tables familiales et les restaurants du coin avec la même fréquence. La variante napolitana garnit la côtelette frite de sauce tomate, jambon et fromage fondu. En sandwich — dans un pain avec laitue et tomate — c\'est l\'un des aliments de rue les plus appréciés d\'Argentine. Le jus de citron pressé sur la croûte juste avant de manger est standard.",
      de: "Milanesa kam mit den italienischen Einwanderern des späten 19. und frühen 20. Jahrhunderts nach Argentinien, direkt aus der Cotoletta alla Milanese der Lombardei. In argentinischer Form wird eine dünne Rindfleischscheibe — manchmal Huhn oder Kalb — flach geklopft, in geschlagenes Ei und Paniermehl getaucht und in Öl gebraten, bis eine gleichmäßige goldene Kruste entsteht. Der Prozess ist schnell, das Ergebnis konsistent: ein knuspriges Äußeres um zartes Fleisch.\\n\\nEs wurde zu einer der häufigsten alltäglichen Mahlzeiten in Argentinien, in Schulkantinen, Familientischen und Eckrestaurants mit gleicher Häufigkeit gegessen. Die Napolitana-Variante belegt das gebratene Schnitzel mit Tomatensoße, Schinken und geschmolzenem Käse. Im Sandwichformat — in einem Brötchen mit Salat und Tomate — ist es eines der beliebtesten Straßenessen Argentiniens. Frisch gepresster Zitronensaft über der Kruste kurz vor dem Essen ist Standard.",
      pt: "A milanesa chegou à Argentina com os imigrantes italianos do final do século XIX e início do século XX, trazida diretamente da cotoletta alla Milanese da Lombardia. Na sua forma argentina, uma fatia fina de boi — às vezes frango ou vitela — é batida, passada em ovo batido e pão ralado, e frita em óleo até formar uma crosta dourada uniforme. O processo é rápido, o resultado consistente: um exterior crocante ao redor de carne macia.\\n\\nTornou-se uma das refeições cotidianas mais comuns na Argentina, consumida em cantinas escolares, mesas de família e restaurantes de bairro com igual frequência. A variante napolitana cobre a costoleta frita com molho de tomate, presunto e queijo derretido. Em forma de sanduíche — dentro de um pão com alface e tomate — é um dos alimentos de rua mais queridos da Argentina. Suco de limão espremido sobre a crosta antes de comer é padrão.",
      ru: "Миланеса появилась в Аргентине вместе с итальянскими иммигрантами конца XIX — начала XX века, принесённая непосредственно из котолетты алла Миланезе из Ломбардии. В аргентинском варианте тонкий ломтик говядины — иногда курицы или телятины — отбивается, обваливается во взбитом яйце и панировочных сухарях, затем жарится в масле до равномерной золотистой корочки. Процесс быстрый, результат неизменный: хрустящая снаружи, нежная внутри.\\n\\nОна стала одним из самых распространённых ежедневных блюд в Аргентине, одинаково часто встречаясь в школьных столовых, на семейных столах и в угловых ресторанах. Вариант напolitana добавляет томатный соус, ветчину и плавленый сыр поверх жареной котлеты. В виде сэндвича — в булочке с салатом и помидором — это одна из самых любимых уличных закусок Аргентины. Лимонный сок, выжатый поверх перед едой, — стандарт.",
      ar: "وصلت الميلانيسا إلى الأرجنتين مع المهاجرين الإيطاليين في أواخر القرن التاسع عشر وأوائل العشرين، محمولةً مباشرةً من الكوتوليتا ألا ميلانيزي اللومباردية. في شكلها الأرجنتيني، تُرقَّق شريحة رفيعة من البقري — أحياناً دجاجاً أو عجلاً — وتُغمس في بيض مخفوق وفتات الخبز، ثم تُقلى في الزيت حتى يتشكّل قشر ذهبي منتظم. العملية سريعة والنتيجة ثابتة: قشرة مقرمشة حول لحم طري.\\n\\nأصبحت من أكثر الوجبات اليومية شيوعاً في الأرجنتين، تُؤكل في مطاعم المدارس وعلى موائد العائلات والمطاعم الصغيرة بالتساوي. تُضاف في نسخة ناپوليتانا صلصة الطماطم والجامبون والجبن الذائب فوقها. في شكل ساندويتش — داخل خبزة مع خس وطماطم — تُعدّ من أحب الأطعمة الشعبية في الأرجنتين. عصر الليمون عليها قبيل الأكل أمر معتاد.",
      zh: "米拉内萨随着19世纪末和20世纪初的意大利移民来到阿根廷，直接从伦巴第的米兰炸小牛肉移植而来。在阿根廷形式中，一片薄牛肉——有时是鸡肉或小牛肉——被拍平，蘸上打散的鸡蛋和面包糠，在油中煎炸直到形成均匀的金色外壳。过程快速，结果一致：嫩肉外的酥脆外壳。\\n\\n它成为阿根廷最常见的日常餐食之一，在学校食堂、家庭餐桌和街角餐厅以同等频率出现。那不勒斯风味变体在炸肉排上加番茄酱、火腿和融化奶酪。三明治形式——夹在面包卷里加生菜和番茄——是阿根廷最受喜爱的街头食品之一。吃前在外壳上挤柠檬汁是标准做法。",
      ja: "ミラネサは19世紀末から20世紀初頭のイタリア移民とともにアルゼンチンに伝わり、ロンバルディア州のコトレッタ・アッラ・ミラネーゼから直接もたらされた。アルゼンチン版では、薄切りの牛肉——時に鶏肉または子牛肉——を平たく叩いて溶き卵とパン粉をまぶし、油で揚げて均一な黄金色の衣をつける。プロセスは早く、結果は一貫している：柔らかい肉を包む、カリカリの外側。\\n\\nアルゼンチンの最も一般的な日常食の一つとなり、学校の食堂、家族の食卓、街角のレストランで等しく食べられる。ナポリターナ変種はトマトソース、ハム、とろけたチーズをトッピングする。サンドイッチ形式——レタスとトマト入りのパンに挟んで——はアルゼンチンで最も愛されるストリートフードの一つだ。食べる直前に外側にレモン汁を絞るのが標準。",
      tr: "Milanesa, 19. yüzyılın sonları ve 20. yüzyılın başlarında Arjantin\'e İtalyan göçmenlerle birlikte geldi; doğrudan Lombardiya\'nın cotoletta alla Milanese\'inden taşındı. Arjantin biçiminde, ince bir sığır eti dilimi — bazen tavuk veya dana — düz hale getirilir, çırpılmış yumurta ve galeta ununa bulanır ve homojen bir altın rengi kabuk oluşana kadar yağda kızartılır. Süreç hızlı, sonuç tutarlı: yumuşak etin etrafında çıtır bir dış yüzey.\\n\\nArjantin\'in en yaygın günlük yemeklerinden biri oldu; okul kantinlerinde, aile masalarında ve köşe restoranlarda eşit sıklıkta yenir. Napolitana varyantı kızarmış eti domates sosu, jambon ve eritilmiş peynirle kaplar. Sandviç biçiminde — marul ve domatesli bir ekmekte — Arjantin\'in en sevilen sokak yemeklerinden biridir. Yemeden hemen önce kabuğa limon suyu sıkmak standarttır.",
      it: "La milanesa è arrivata in Argentina con gli immigrati italiani di fine Ottocento e inizio Novecento, portata direttamente dalla cotoletta alla Milanese della Lombardia. Nella sua forma argentina, una fetta sottile di manzo — a volte pollo o vitello — viene battuta, passata nell\'uovo sbattuto e nel pangrattato, e fritta nell\'olio fino a formare una crosta dorata uniforme. Il processo è rapido, il risultato consistente: un esterno croccante attorno a carne tenera.\\n\\nÈ diventata uno dei pasti quotidiani più comuni in Argentina, consumata nelle mense scolastiche, ai tavoli di famiglia e nei ristoranti di quartiere con uguale frequenza. La variante napolitana aggiunge salsa di pomodoro, prosciutto e formaggio fuso sopra. In forma di panino — in un panino con lattuga e pomodoro — è uno degli street food più amati dell\'Argentina. Il succo di limone spremuto sulla crosta appena prima di mangiare è standard.",
      ko: "밀라네사는 19세기 말과 20세기 초 이탈리아 이민자들과 함께 아르헨티나에 도착했으며, 롬바르디아의 코톨레타 알라 밀라네세에서 직접 전해졌습니다. 아르헨티나 형태에서는 얇은 소고기 한 조각 — 때로는 닭고기나 송아지 고기 — 을 납작하게 두드려 달걀물과 빵가루를 묻혀 균일한 황금빛 껍질이 생길 때까지 기름에 튀깁니다. 과정은 빠르고 결과는 일관적입니다: 부드러운 고기를 감싼 바삭한 외층.\\n\\n학교 구내식당, 가족 식탁, 동네 식당에서 동등하게 자주 먹히는 아르헨티나에서 가장 일반적인 일상 식사 중 하나가 되었습니다. 나폴리타나 변형은 튀긴 커틀릿에 토마토 소스, 햄, 녹은 치즈를 얹습니다. 샌드위치 형태 — 양상추와 토마토를 넣은 빵에 끼워 — 는 아르헨티나에서 가장 사랑받는 길거리 음식 중 하나입니다. 먹기 직전 외층에 레몬즙을 뿌리는 것이 일반적입니다.",
      hi: "मिलानेसा 19वीं सदी के अंत और 20वीं सदी की शुरुआत के इतालवी प्रवासियों के साथ अर्जेंटीना पहुंची, जो सीधे लोम्बार्डी के कोटोलेता अल्ला मिलानेसे से लाई गई थी। अर्जेंटीनाई रूप में, बीफ का एक पतला टुकड़ा — कभी-कभी चिकन या वील — पीटकर सपाट किया जाता है, फेंटे हुए अंडे और ब्रेडक्रम्ब्स में डुबाया जाता है, और तेल में तला जाता है जब तक एक समान सुनहरी परत न बन जाए। प्रक्रिया त्वरित है, परिणाम सुसंगत: नरम मांस के चारों ओर कुरकुरी बाहरी परत।\\n\\nयह अर्जेंटीना में सबसे आम रोज़मर्रा के भोजन में से एक बन गई, स्कूल कैफेटेरिया, परिवार की मेज और कोने के रेस्तरां में समान आवृत्ति के साथ खाई जाती है। नेपोलिटाना संस्करण तले हुए कटलेट के ऊपर टमाटर सॉस, हैम और पिघले पनीर रखता है। सैंडविच रूप में — सलाद और टमाटर के साथ एक रोल में — यह अर्जेंटीना के सबसे प्रिय स्ट्रीट फूड में से एक है। खाने से ठीक पहले बाहरी परत पर नींबू का रस निचोड़ना मानक है।"
    }'''

if old_ot in data:
    data = data.replace(old_ot, new_ot, 1)
    open('public/js/recipes.js', 'w', encoding='utf-8').write(data)
    print('Done 113')
else:
    print('NOT FOUND 113')
