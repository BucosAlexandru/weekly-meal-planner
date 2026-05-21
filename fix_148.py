with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ID 148 - Khinkali (Georgia) - no hi fields yet

content = content.replace(
    '      ko: "조지아"\n    },\n    name: {\n      ro: "Khinkali"',
    '      ko: "조지아",\n      hi: "जॉर्जिया"\n    },\n    name: {\n      ro: "Khinkali"'
)

content = content.replace(
    '      ko: "힌칼리"\n    },\n    category: {\n      ro: "Cină",\n      en: "Dinner",\n      es: "Cena",\n      fr: "Dîner",\n      de: "Abendessen",\n      pt: "Jantar",\n      ru: "Ужин",\n      ar: "عشاء",\n      zh: "晚餐",\n      ja: "ディナー",\n      tr: "Akşam yemeği",\n      it: "Cena",\n      ko: "저녁"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["făină"',
    '      ko: "힌칼리",\n      hi: "खिंकाली"\n    },\n    category: {\n      ro: "Cină",\n      en: "Dinner",\n      es: "Cena",\n      fr: "Dîner",\n      de: "Abendessen",\n      pt: "Jantar",\n      ru: "Ужин",\n      ar: "عشاء",\n      zh: "晚餐",\n      ja: "ディナー",\n      tr: "Akşam yemeği",\n      it: "Cena",\n      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["făină"'
)

content = content.replace(
    '      ko: ["밀가루", "물", "다진 고기 (소고기와 돼지고기)", "양파", "후추", "소금", "허브"]\n    },\n    howIsMade: {',
    '      ko: ["밀가루", "물", "다진 고기 (소고기와 돼지고기)", "양파", "후추", "소금", "허브"],\n      hi: ["आटा", "पानी", "कीमा (बीफ और पोर्क)", "प्याज़", "काली मिर्च", "नमक", "जड़ी-बूटियाँ"]\n    },\n    howIsMade: {'
)

content = content.replace(
    '      ko: "반죽을 만들어 양념한 고기와 허브로 채우고 만두 모양으로 빚어 끓는 물에 삶습니다."\n    },\n    originText: {\n      ro: "Khinkali este',
    '      ko: "반죽을 만들어 양념한 고기와 허브로 채우고 만두 모양으로 빚어 끓는 물에 삶습니다.",\n      hi: "आटा बनाएं, मसाले वाले कीमे और जड़ी-बूटियों से भरें, पकौड़े बनाएं और उबालें।"\n    },\n    originText: {\n      ro: "Khinkali este'
)

old_origin = '''    originText: {
      ro: "Khinkali este o rețetă tradițională din Georgia.",
      en: "Khinkali is a traditional recipe from Georgia.",
      es: "Khinkali es una receta tradicional de Georgia.",
      fr: "Khinkali est une recette traditionnelle de Géorgie.",
      de: "Chinkali ist ein traditionelles Rezept aus Georgien.",
      pt: "Khinkali é uma receita tradicional da Geórgia.",
      ru: "Хинкали — традиционный рецепт из Грузии.",
      ar: "خينكالي هي وصفة تقليدية من جورجيا.",
      zh: "格鲁吉亚饺子 是来自格鲁吉亚的传统食谱。",
      ja: "ヒンカリ はジョージアの伝統的なレシピです。",
      tr: "Khinkali Gürcistan kökenli geleneksel bir tariftir.",
      it: "Khinkali è una ricetta tradizionale della Georgia.",
      ko: "힌칼리는 조지아의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Khinkali sunt găluștele naționale ale Georgiei — pungi mari de aluat umplute cu carne tocată de vită și porc cu ceapă, coriandru și piper, fierte în apă clocotită. Aluatul este destul de gros pentru a reține supa care se formează în interior din sucurile cărnii. Înainte de a mușca, se rupe vârful — coada răsucită — și se soarbe lichidul fierbinte.\\n\\nKhinkali se mănâncă cu mâna, nu cu tacâm. Coada răsucită nu se mănâncă — se lasă pe farfurie, iar numărul cozilor rămase reprezintă adesea un indicator informal al câte ai mâncat. Mâncarea de khinkali este socializare — se comandă câteva runde la restaurant și conversația se prelungește ore bune.",
      en: "Khinkali are Georgia's national dumplings — large dough pouches filled with minced beef and pork with onion, coriander, and pepper, boiled in water. The dough is thick enough to retain the broth that forms inside from the meat juices. Before biting, the twisted top — the tail — is broken off and the hot liquid is sipped first.\\n\\nKhinkali are eaten by hand, not with cutlery. The twisted tail is not eaten — it is left on the plate, and the number of tails remaining often serves as an informal count of how many one has eaten. Eating khinkali is socializing — several rounds are ordered at a restaurant and conversation stretches on for hours.",
      es: "Los khinkali son las albóndigas nacionales de Georgia — grandes bolsas de masa rellenas de carne picada de vaca y cerdo con cebolla, cilantro y pimienta, cocidas en agua. La masa es lo suficientemente gruesa para retener el caldo que se forma en el interior con los jugos de la carne. Antes de morder, se rompe la parte superior retorcida y se sorbe el líquido caliente.\\n\\nLos khinkali se comen con la mano, no con cubiertos. La cola retorcida no se come — queda en el plato y el número de colas indica cuántos se han comido. Comer khinkali es socializar — se piden varias rondas y la conversación se alarga horas.",
      fr: "Les khinkali sont les raviolis nationaux de la Géorgie — de grandes pochettes de pâte farcies de bœuf et de porc hachés avec oignon, coriandre et poivre, cuites dans l'eau bouillante. La pâte est assez épaisse pour retenir le bouillon qui se forme à l'intérieur avec les jus de viande. Avant de mordre, on brise le dessus torsadé et on avale d'abord le liquide chaud.\\n\\nLes khinkali se mangent à la main, sans couverts. La queue torsadée ne se mange pas — elle reste dans l'assiette, et le nombre de queues indique combien on en a mangé. Manger des khinkali est une activité sociale — on commande plusieurs tournées et la conversation s'étire sur des heures.",
      de: "Khinkali sind Georgiens Nationalklöße — große Teigtaschen, gefüllt mit gehacktem Rind- und Schweinefleisch mit Zwiebeln, Koriander und Pfeffer, in kochendem Wasser gegart. Der Teig ist dick genug, um die Brühe zu halten, die sich innen aus den Fleischsäften bildet. Vor dem Abbeißen wird der gedrehte Knopf abgebrochen und die heiße Flüssigkeit zuerst geschlürft.\\n\\nKhinkali werden mit der Hand gegessen, nicht mit Besteck. Der gedrehte Knopf wird nicht gegessen — er bleibt auf dem Teller, und die Anzahl der Knöpfe gibt an, wie viele man gegessen hat. Khinkali essen ist geselliges Beisammensein.",
      pt: "Khinkali são os bolinhos nacionais da Geórgia — grandes bolsas de massa recheadas com carne moída de vaca e porco com cebola, coentro e pimenta, cozidas em água. A massa é grossa o suficiente para reter o caldo que se forma dentro com os sucos da carne. Antes de morder, o topo torcido é quebrado e o líquido quente é sorvido primeiro.\\n\\nOs khinkali são comidos com a mão, não com talheres. A cauda torcida não é comida — fica no prato, e o número de caudas indica quantos foram comidos. Comer khinkali é socializar.",
      ru: "Хинкали — национальные пельмени Грузии: большие тестяные мешочки с начинкой из рубленой говядины и свинины с луком, кинзой и перцем, сваренные в воде. Тесто достаточно плотное, чтобы удержать бульон, образующийся внутри из мясных соков. Перед укусом откручивают верхний узелок — «хвостик» — и сначала отпивают горячий бульон.\\n\\nХинкали едят руками, без столовых приборов. Хвостик не едят — его оставляют на тарелке, и количество хвостиков служит неформальным счётчиком съеденного. Трапеза с хинкали — это общение: заказывают несколько порций, разговор затягивается на часы.",
      ar: "خينكالي هي الزلابية الوطنية لجورجيا — أكياس عجين كبيرة محشوة بلحم بقر وخنزير مفروم مع بصل وكزبرة وفلفل، مسلوقة في الماء. العجينة سميكة بما يكفي للاحتفاظ بالمرق الذي يتشكل بداخلها من عصائر اللحم. قبل العض، يُكسر الجزء العلوي الملتوي ويُرشف السائل الساخن أولاً.\\n\\nيُؤكل الخينكالي باليد، لا بالأدوات. الذيل الملتوي لا يُؤكل — يُترك على الطبق، ويكون عدد الذيول مؤشراً على ما أُكل. تناول الخينكالي فرصة للتواصل الاجتماعي — يطلب المرء عدة جولات ويستمر الحديث لساعات.",
      zh: "格鲁吉亚饺子是格鲁吉亚的国家饺子——大面皮袋里填入牛猪肉末加洋葱、香菜和胡椒，在水中煮制。面皮足够厚实，能包住肉汁在内部形成的汤汁。吃之前，先掰掉拧成的面结，吸饮热汤，再咬开。\\n\\n格鲁吉亚饺子用手吃，不用餐具。面结不吃——留在盘子里，留下的面结数量就是非正式的计数方式。吃格鲁吉亚饺子是社交活动——餐厅里会点好几轮，谈话可以持续数小时。",
      ja: "ヒンカリはジョージアの国民的餃子です——牛肉と豚肉のひき肉に玉ねぎ、コリアンダー、コショウを混ぜた大きな生地の袋を水で茹でます。生地は肉の旨みから作られるスープを中に保つのに十分な厚さがあります。食べる前に捻じれた頭——しっぽ——を折り取り、中の熱いスープを先に吸います。\\n\\nヒンカリは手で食べ、カトラリーは使いません。捻じれた尾は食べず皿の上に残されます。残った尾の数が食べた数の非公式な記録になります。ヒンカリを食べることはまさに社交です。",
      tr: "Khinkali, Gürcistan'ın ulusal mantılarıdır — büyük hamur torbalarına soğan, kişniş ve biberle hazırlanmış kıyılmış dana ve domuz eti doldurulur ve suda haşlanır. Hamur, içerideki et suyundan oluşan suyu tutacak kadar kalındır. Yemeden önce bükülmüş üst kısım — kuyruk — kırılır ve önce sıcak sıvı yudumlanır.\\n\\nKhinkali elle yenir, çatal bıçak kullanılmaz. Bükümlü kuyruk yenmez — tabakta bırakılır ve kalan kuyruk sayısı gayri resmi olarak kaç tane yenildiğini gösterir. Khinkali yemek sosyalleşmektir — restoranlarda birkaç tur sipariş edilir ve sohbet saatlerce sürer.",
      it: "I khinkali sono i ravioli nazionali della Georgia — grandi sacche di pasta riempite con carne macinata di manzo e maiale con cipolla, coriandolo e pepe, cotte in acqua. La pasta è abbastanza spessa da trattenere il brodo che si forma all'interno con i succhi della carne. Prima di mordere, si spezza la cima attorcigliata e si sorbe il liquido caldo.\\n\\nI khinkali si mangiano con le mani, senza posate. La coda attorcigliata non si mangia — viene lasciata nel piatto e il numero di code è il conteggio informale di quanti ne sono stati mangiati. Mangiare khinkali è socializzare.",
      ko: "힌칼리는 조지아의 국민 만두입니다. 소고기와 돼지고기 다짐육에 양파, 고수, 후추를 섞어 두꺼운 반죽 주머니에 채우고 물에 삶습니다. 반죽은 안에서 육즙이 만들어내는 국물을 가두기에 충분히 두껍습니다. 먹기 전에 꼬인 윗부분을 떼어내고 뜨거운 국물을 먼저 홀짝입니다.\\n\\n힌칼리는 식기 없이 손으로 먹습니다. 꼬인 꼭지는 먹지 않고 접시에 남겨두며, 남겨진 꼭지 개수가 비공식적인 먹은 개수 기록이 됩니다. 힌칼리 먹기는 사교 활동입니다.",
      hi: "खिंकाली जॉर्जिया के राष्ट्रीय पकौड़े हैं — बड़े आटे की थैली में कीमा बीफ और पोर्क, प्याज़, धनिया और काली मिर्च भरकर पानी में उबाले जाते हैं। आटा इतना मोटा होता है कि अंदर मांस के रस से बना शोरबा बरकरार रहे। खाने से पहले घुमाया हुआ ऊपरी हिस्सा — पूंछ — तोड़ी जाती है और पहले गर्म तरल पिया जाता है।\\n\\nखिंकाली हाथ से खाई जाती है, चम्मच-कांटे से नहीं। घुमाई हुई पूंछ नहीं खाई जाती — प्लेट पर छोड़ दी जाती है और छोड़ी गई पूंछों की गिनती अनौपचारिक रूप से बताती है कि कितने खाए। खिंकाली खाना एक सामाजिक गतिविधि है।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 148 done")
