data = open('public/js/recipes.js', 'r', encoding='utf-8').read()

# Add hi to origin
data = data.replace(
    '      ko: "포르투갈"\n    },\n    name: {\n      ro: "Francesinha"',
    '      ko: "포르투갈",\n      hi: "पुर्तगाल"\n    },\n    name: {\n      ro: "Francesinha"',
    1
)

# Add hi to name
data = data.replace(
    '      ko: "프란세지냐"\n    },\n    category: {',
    '      ko: "프란세지냐",\n      hi: "फ्रांसेज़िन्हा"\n    },\n    category: {',
    1
)

# Add hi to category (Dinner — after Portugal block)
data = data.replace(
    '      ko: "저녁"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["pâine"',
    '      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["pâine"',
    1
)

# Add hi to ingredients
data = data.replace(
    '      ko: ["빵", "햄", "소시지", "스테이크", "치즈", "토마토 소스", "맥주"]\n    },\n    howIsMade: {',
    '      ko: ["빵", "햄", "소시지", "스테이크", "치즈", "토마토 소스", "맥주"],\n      hi: ["ब्रेड", "हैम", "सॉसेज", "स्टेक", "पनीर", "टमाटर सॉस", "बीयर"]\n    },\n    howIsMade: {',
    1
)

# Add hi to howIsMade
data = data.replace(
    '      ko: "빵에 햄, 소시지, 소고기를 쌓아 올려주세요. 녹인 치즈를 덮고 매운 토마토 소스를 부어 오븐에 구워주세요."\n    },\n    originText: {',
    '      ko: "빵에 햄, 소시지, 소고기를 쌓아 올려주세요. 녹인 치즈를 덮고 매운 토마토 소스를 부어 오븐에 구워주세요.",\n      hi: "ब्रेड, हैम, सॉसेज और बीफ से सैंडविच बनाएं, पिघले पनीर से ढकें और मसालेदार टमाटर सॉस डालें। सुनहरा होने तक बेक करें।"\n    },\n    originText: {',
    1
)

# Replace originText
old_ot = '''    originText: {
      ro: "Francesinha este o rețetă tradițională din Portugalia.",
      en: "Francesinha is a traditional recipe from Portugal.",
      es: "Francesinha es una receta tradicional de Portugal.",
      fr: "Francesinha est une recette traditionnelle du Portugal.",
      de: "Francesinha ist ein traditionelles Rezept aus Portugal.",
      pt: "Francesinha é uma receita tradicional de Portugal.",
      ru: "Франсезинья — традиционный рецепт из Португалии.",
      ar: "فرانسزينها هي وصفة تقليدية من البرتغال.",
      zh: "葡式法兰西三明治 是来自葡萄牙的传统食谱。",
      ja: "フランセジーニャ はポルトガルの伝統的なレシピです。",
      tr: "Francesinha Portekiz kökenli geleneksel bir tariftir.",
      it: "Francesinha è una ricetta tradizionale del Portogallo.",
      ko: "프란세지냐는 포르투갈의 전통 요리입니다."
    }'''

new_ot = '''    originText: {
      ro: "Francesinha — Micuța Franceză — este un sandviș din Porto cu o istorie înrădăcinată în diaspora portugheză. Creat în anii 1960 de un emigrant întors, inspirat de croque-monsieur-ul francez, preparatul este construit din pâine prăjită stratificată cu șuncă, lingüiça și friptură de vită, apoi sigilat sub brânză topită și inundat cu sos.\\n\\nSosul este cel care îl definește: fiecare restaurant din Porto îl ține secret, dar baza este o reducere de roșii, bere și spirtoase — whisky sau brandy — gătită până devine groasă, turnată fierbinte peste brânza topită. Un ou prăjit încheie ansamblul. Se servește cu cartofi prăjiți care absorb sosul care se revarsă.",
      en: "Francesinha — Little Frenchie — is a sandwich from Porto with a history rooted in the Portuguese diaspora. Created in the 1960s by a returned emigrant inspired by the French croque-monsieur, the dish is built from toasted bread layered with cured ham, linguiça, and steak, then sealed under melted cheese and flooded with sauce.\\n\\nThe sauce is what defines it: each Porto restaurant guards its own recipe, but the base is a reduction of tomatoes, beer, and spirits — whisky or brandy — cooked until thick, then poured hot over the melted cheese. A fried egg caps the assembly. It is served with fries, which absorb the overflowing sauce.",
      es: "Francesinha — Pequeña Francesa — es un sándwich de Oporto con una historia arraigada en la diáspora portuguesa. Creado en la década de 1960 por un emigrante retornado inspirado en el croque-monsieur francés, el plato se construye con pan tostado capas de jamón curado, linguiça y bistec, luego sellado bajo queso fundido y bañado en salsa.\\n\\nLa salsa es lo que lo define: cada restaurante de Oporto guarda su propia receta, pero la base es una reducción de tomates, cerveza y licores — whisky o brandy — cocinada hasta espesar, luego vertida caliente sobre el queso fundido. Un huevo frito corona el conjunto. Se sirve con patatas fritas que absorben la salsa desbordante.",
      fr: "La francesinha — Petite Française — est un sandwich de Porto avec une histoire ancrée dans la diaspora portugaise. Créé dans les années 1960 par un émigrant de retour inspiré par le croque-monsieur français, le plat est construit à partir de pain grillé garni de jambon cru, de linguiça et de steak, puis scellé sous du fromage fondu et noyé de sauce.\\n\\nLa sauce est ce qui le définit : chaque restaurant de Porto garde sa propre recette, mais la base est une réduction de tomates, de bière et de spiritueux — whisky ou brandy — cuite jusqu\'à épaississement, puis versée chaude sur le fromage fondu. Un œuf frit couronne l\'ensemble. Il est servi avec des frites qui absorbent la sauce qui déborde.",
      de: "Francesinha — Kleines Französisches — ist ein Sandwich aus Porto mit einer Geschichte, die in der portugiesischen Diaspora verwurzelt ist. In den 1960er Jahren von einem zurückgekehrten Emigranten geschaffen, der sich vom französischen Croque-monsieur inspirieren ließ, besteht das Gericht aus geröstetem Brot mit Schichten aus geräuchertem Schinken, Linguiça und Steak, versiegelt unter geschmolzenem Käse und mit Sauce übergossen.\\n\\nDie Sauce ist das Definitionsgebende: Jedes Restaurant in Porto hütet sein eigenes Rezept, aber die Basis ist eine Reduktion aus Tomaten, Bier und Spirituosen — Whisky oder Brandy — bis zur Konsistenz eingekocht, dann heiß über den geschmolzenen Käse gegossen. Ein Spiegelei krönt das Ensemble. Es wird mit Pommes frites serviert, die die überlaufende Sauce aufsaugen.",
      pt: "Francesinha — Pequena Francesa — é um sanduíche do Porto com uma história enraizada na diáspora portuguesa. Criada nos anos 1960 por um emigrante de retorno inspirado pelo croque-monsieur francês, o prato é construído a partir de pão torrado em camadas com presunto curado, linguiça e bife, depois selado sob queijo derretido e inundado com molho.\\n\\nO molho é o que o define: cada restaurante do Porto guarda a sua própria receita, mas a base é uma redução de tomates, cerveja e destilados — whisky ou brandy — cozinhada até engrossar, depois vertida quente sobre o queijo fundido. Um ovo frito coroa o conjunto. É servido com batatas fritas que absorvem o molho que transborda.",
      ru: "Франсезинья — Маленькая Француженка — это сэндвич из Порту с историей, уходящей корнями в португальскую диаспору. Созданный в 1960-х годах вернувшимся эмигрантом, вдохновлённым французским крок-месье, блюдо состоит из поджаренного хлеба с прослойками из вяленой ветчины, лингуисы и стейка, запечатанного под расплавленным сыром и залитого соусом.\\n\\nСоус — вот что его определяет: каждый ресторан в Порту хранит собственный рецепт, но основа — это редукция из томатов, пива и крепкого алкоголя — виски или бренди — сваренная до загустения, затем горячей налитая на расплавленный сыр. Яичница завершает конструкцию. Подаётся с картофелем фри, который впитывает льющийся через край соус.",
      ar: "فرانسزينها — الفرنسية الصغيرة — ساندويتش من مدينة بورتو له تاريخ متجذّر في المغتربين البرتغاليين. ابتكره في ستينيات القرن الماضي مغترب عائد مستوحىً من الكروك موسيور الفرنسي؛ يُبنى الطبق من خبز محمص طبّقت فوقه شرائح اللحم المعالج واللينكيسا والبيفتيك، ثم يُغطّى بجبن ذائب ويُغمر بالصلصة.\\n\\nالصلصة هي ما يُميّزه: لكل مطعم في بورتو وصفته الخاصة، لكن الأساس تقليص من الطماطم والبيرة والمسكرات — ويسكي أو براندي — يُطهى حتى يتكثّف ثم يُسكب ساخناً على الجبن الذائب. تُتوَّج المنظومة بيضة مقلية. يُقدَّم مع البطاطس المقلية التي تمتص الصلصة الفائضة.",
      zh: "法兰西三明治——小法国佬——是一道来自葡萄牙波尔图的三明治，历史根植于葡萄牙海外移民社群。1960年代由一位归国移民受法式烤奶酪三明治启发创作，由烤面包叠加腌火腿、辣香肠和牛排，再盖上融化奶酪并浇上酱汁。\\n\\n酱汁是灵魂所在：波尔图每家餐厅都守护自己的配方，但基础是番茄、啤酒和烈酒——威士忌或白兰地——熬至浓稠后热浇在融化的奶酪上。一个煎蛋收尾。搭配薯条上桌，薯条吸收溢出的酱汁。",
      ja: "フランセジーニャ——小さなフランス娘——は、ポルトガルの移民史に根ざしたポルトのサンドイッチだ。1960年代にフランスのクロックムッシュに触発されて帰国した移民が考案し、トーストしたパンに塩漬けハム、リングイサ、ステーキを重ね、溶けたチーズで封じてソースを注いだ構造を持つ。\\n\\nソースがこの料理を定義する：ポルトの各レストランが自分のレシピを守っているが、ベースはトマト・ビール・スピリッツ——ウイスキーまたはブランデー——を煮詰めた濃縮液で、溶けたチーズの上に熱々で注がれる。目玉焼きが最後に添えられる。こぼれるソースを吸い込むフライドポテトと共に提供される。",
      tr: "Francesinha — Küçük Fransız — Portekizli diyasporasında kökleri olan Porto\'dan bir sandviçtir. 1960\'larda Fransız croque-monsieur\'den ilham alan bir göçmenin elinden çıkan bu yemek, kürlenmiş jambon, linguiça ve bifteği katmanlanmış kızarmış ekmekten oluşur; eritilmiş peynirle kapatılıp sosla kaplanır.\\n\\nSos onu tanımlayan şeydir: her Porto restoranı kendi tarifini saklar ama temel, domates, bira ve alkol — viski veya konyak — azaltmasıdır; eritilmiş peynirin üzerine sıcak dökülür. Kızarmış bir yumurta topluluğu tamamlar. Taşan sosu emen kızarmış patatesle servis edilir.",
      it: "La francesinha — Piccola Francese — è un panino di Porto con una storia radicata nella diaspora portoghese. Creato negli anni \'60 da un emigrante di ritorno ispirato dal croque-monsieur francese, il piatto è costruito con pane tostato a strati di prosciutto stagionato, linguiça e bistecca, poi sigillato sotto formaggio fuso e allagato di salsa.\\n\\nLa salsa è ciò che lo definisce: ogni ristorante di Porto custodisce la propria ricetta, ma la base è una riduzione di pomodori, birra e superalcolici — whisky o brandy — cotta fino ad addensarsi, poi versata calda sul formaggio fuso. Un uovo fritto corona l\'insieme. Si serve con patatine fritte che assorbono la salsa traboccante.",
      ko: "프란세지냐 — 작은 프랑스 여인 — 는 포르투갈 이민자의 역사에 뿌리를 둔 포르투의 샌드위치입니다. 1960년대 프랑스 크로크무슈에서 영감을 받아 귀국한 이민자가 만든 이 요리는 구운 빵에 절인 햄, 링귀사, 스테이크를 켜켜이 쌓고 녹은 치즈로 봉한 뒤 소스를 붓습니다.\\n\\n소스가 이 요리를 정의합니다: 포르투의 각 레스토랑이 자신만의 레시피를 지키지만, 기본은 토마토, 맥주, 증류주 — 위스키 또는 브랜디 — 를 줄인 것으로 녹은 치즈 위에 뜨겁게 붓습니다. 프라이드에그가 마지막을 장식합니다. 흘러넘치는 소스를 흡수하는 감자튀김과 함께 제공됩니다.",
      hi: "फ्रांसेज़िन्हा — छोटी फ्रांसीसी — पुर्तगाली प्रवासी इतिहास में जड़ें रखने वाली पोर्टो की एक सैंडविच है। 1960 के दशक में फ्रेंच क्रोक-मॉन्सियर से प्रेरित एक लौटे प्रवासी द्वारा बनाई गई, यह व्यंजन ठोस ब्रेड पर ठीक किए गए हैम, लिंगुइसा और स्टेक की परतों से बनता है, फिर पिघले पनीर से बंद किया जाता है और सॉस से भर दिया जाता है।\\n\\nसॉस ही इसे परिभाषित करता है: पोर्टो का प्रत्येक रेस्तरां अपनी रेसिपी सुरक्षित रखता है, लेकिन आधार टमाटर, बीयर और मदिरा — व्हिस्की या ब्रांडी — की कमी है, जो गाढ़ी होने तक पकाई जाती है, फिर पिघले पनीर पर गर्म डाली जाती है। एक तला हुआ अंडा संयोजन को पूरा करता है। इसे फ्राइज़ के साथ परोसा जाता है जो बहते सॉस को सोख लेते हैं।"
    }'''

if old_ot in data:
    data = data.replace(old_ot, new_ot, 1)
    open('public/js/recipes.js', 'w', encoding='utf-8').write(data)
    print('Done 107')
else:
    print('NOT FOUND 107')
