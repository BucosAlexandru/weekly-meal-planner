with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add hi to origin
content = content.replace(
    '      ko: "스웨덴"\n    },\n    name: {\n      ro: "Köttbullar"',
    '      ko: "스웨덴",\n      hi: "स्वीडन"\n    },\n    name: {\n      ro: "Köttbullar"'
)

# Add hi to name
content = content.replace(
    '      ko: "스웨덴 미트볼"\n    },\n    category: {\n      ro: "Prânz"',
    '      ko: "스웨덴 미트볼",\n      hi: "कॉटबुलार"\n    },\n    category: {\n      ro: "Prânz"'
)

# Add hi to category — Kottbullar is Lunch/Prânz
content = content.replace(
    '      ko: "점심"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["carne tocată", "ouă"',
    '      ko: "점심",\n      hi: "दोपहर का खाना"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["carne tocată", "ouă"'
)

# Add hi to ingredients
content = content.replace(
    '      ko: ["다진 고기", "계란", "빵가루", "양파", "크림", "후추", "소금"]\n    },\n    howIsMade: {',
    '      ko: ["다진 고기", "계란", "빵가루", "양파", "크림", "후추", "소금"],\n      hi: ["कीमा", "अंडे", "ब्रेड क्रम्ब्स", "प्याज़", "क्रीम", "काली मिर्च", "नमक"]\n    },\n    howIsMade: {'
)

# Add hi to howIsMade
content = content.replace(
    '      ko: "다진 고기에 양파, 빵가루, 달걀을 넣어 반죽하고 동그랗게 빚어 팬에 구운 후, 크리미한 소스와 으깬 감자와 함께 제공합니다."\n    },\n    originText: {\n      ro: "Köttbullar este',
    '      ko: "다진 고기에 양파, 빵가루, 달걀을 넣어 반죽하고 동그랗게 빚어 팬에 구운 후, 크리미한 소스와 으깬 감자와 함께 제공합니다.",\n      hi: "कीमे को प्याज़, ब्रेड क्रम्ब्स और अंडे के साथ मिलाएं, गोले बनाएं, तलें, फिर क्रीमी सॉस और मैश्ड आलू के साथ परोसें।"\n    },\n    originText: {\n      ro: "Köttbullar este'
)

# Replace originText
old_origin = '''    originText: {
      ro: "Köttbullar este o rețetă tradițională din Suedia.",
      en: "Swedish Meatballs is a traditional recipe from Sweden.",
      es: "Albóndigas suecas es una receta tradicional de Suecia.",
      fr: "Boulettes suédoises est une recette traditionnelle de Suède.",
      de: "Schwedische Fleischbällchen ist ein traditionelles Rezept aus Schweden.",
      pt: "Almôndegas suecas é uma receita tradicional da Suécia.",
      ru: "Шведские фрикадельки — традиционный рецепт из Швеции.",
      ar: "كرات اللحم السويدية هي وصفة تقليدية من السويد.",
      zh: "瑞典肉丸 是来自瑞典的传统食谱。",
      ja: "スウェーデン風ミートボール はスウェーデンの伝統的なレシピです。",
      tr: "İsveç Köftesi İsveç kökenli geleneksel bir tariftir.",
      it: "Polpette svedesi sono una ricetta tradizionale della Svezia.",
      ko: "스웨덴 미트볼은 스웨덴의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Chiftelele suedeze — köttbullar — sunt unul dintre cele mai recunoscute preparate ale Suediei la nivel internațional, răspândit în mare parte prin rețeaua IKEA. Acasă, ele sunt un element de bază atât al bucătăriei de zi cu zi, cât și al smörgåsbord-ului festiv de peste un secol. Amestecul de porc și vită, înmuiat cu pesmet și o notă de frișcă, produce chiftele simțitor mai ușoare decât omologele din sudul Europei.\\n\\nAcompaniamentul definitoriu este un sos cremos din zeama de carne, servit cu piure de cartofi, gem de lingonberry și castraveți ușor murați. Fiecare element echilibrează celelalte: chifteaua savuroasă, gemul dulce-acrișor, sosul cremos.",
      en: "Swedish meatballs — köttbullar — are one of Sweden's most internationally recognised dishes, spread globally in large part through the influence of IKEA. At home they have been a staple of everyday cooking and festive smörgåsbord alike for over a century. The mixture of pork and beef, softened with soaked breadcrumbs and a touch of cream, produces meatballs notably lighter than their southern European counterparts.\\n\\nThe defining accompaniment is a smooth cream-based pan gravy made from the drippings, served alongside buttery mashed potatoes, lingonberry jam, and briefly pickled cucumber. Every element balances the others: the savoury meatball, the sweet-tart jam, the creamy sauce.",
      es: "Las albóndigas suecas — köttbullar — son uno de los platos más reconocidos internacionalmente de Suecia, difundido en gran parte por la influencia de IKEA. En casa han sido un básico de la cocina cotidiana y del smörgåsbord festivo durante más de un siglo. La mezcla de cerdo y ternera, suavizada con pan rallado remojado y un toque de nata, produce unas albóndigas notablemente más ligeras que sus homólogas del sur de Europa.\\n\\nEl acompañamiento definitorio es una salsa cremosa hecha con los jugos de la sartén, servida con puré de patatas, mermelada de arándano rojo y pepino escabechado.",
      fr: "Les boulettes suédoises — köttbullar — sont l'un des plats les plus reconnus de Suède à l'international, diffusé mondialement en grande partie par IKEA. En Suède, elles sont un incontournable de la cuisine quotidienne et du smörgåsbord festif depuis plus d'un siècle. Le mélange de porc et de bœuf, assoupli par de la chapelure imbibée et une touche de crème, produit des boulettes nettement plus légères que leurs homologues d'Europe du Sud.\\n\\nL'accompagnement incontournable est une sauce crémeuse à base de jus de cuisson, servie avec une purée de pommes de terre, de la confiture de myrtilles rouges et des concombres marinés.",
      de: "Schwedische Fleischbällchen — köttbullar — sind eines der international bekanntesten Gerichte Schwedens, weltweit vor allem durch IKEA verbreitet. In Schweden selbst sind sie seit über einem Jahrhundert ein Grundpfeiler der alltäglichen Küche und festlicher Smörgåsbord-Tafeln. Die Mischung aus Schweine- und Rindfleisch, aufgeweicht mit eingeweichtem Paniermehl und einem Hauch Sahne, ergibt spürbar leichtere Bällchen als ihre südeuropäischen Verwandten.\\n\\nDas typische Beiwerk ist eine glatte Bratensauce auf Sahnebasis aus dem Bratenfett, serviert mit Kartoffelpüree, Preiselbeermarmelade und kurz eingelegter Gurke.",
      pt: "As almôndegas suecas — köttbullar — são um dos pratos mais reconhecidos da Suécia internacionalmente, difundido globalmente em grande parte pela influência da IKEA. Em casa, são um elemento básico da cozinha cotidiana e do smörgåsbord festivo há mais de um século. A mistura de porco e boi, suavizada com pão ralado embebido e um toque de creme, produz almôndegas notavelmente mais leves do que as suas congêneres do sul europeu.\\n\\nO acompanhamento essencial é um molho cremoso feito com o fundo da frigideira, servido com purê de batata, geleia de lingonberry e pepino levemente marinado.",
      ru: "Шведские фрикадельки — кёттбуллар — одно из наиболее известных в мире блюд Швеции, распространившееся глобально во многом благодаря IKEA. На родине они более века остаются основой повседневного стола и праздничного смёргосборда. Смесь свинины и говядины, смягчённая пропитанными сухарями и небольшим количеством сливок, даёт заметно более лёгкие фрикадельки, чем их южноевропейские аналоги.\\n\\nГлавный гарнир — гладкий сливочный соус из сковородных соков, подаётся с картофельным пюре, джемом из брусники и слегка маринованным огурцом.",
      ar: "كرات اللحم السويدية — كوتبولار — هي أحد أشهر أطباق السويد على الصعيد الدولي، انتشرت عالمياً إلى حد بعيد بفضل تأثير إيكيا. في الداخل السويدي، ظلّت ركيزة أساسية في المطبخ اليومي وفي مائدة السمورغاسبورد الاحتفالية لأكثر من قرن. يُنتج مزيج لحم الخنزير والبقر، المُليَّن بفتات الخبز المنقوعة ولمسة من الكريمة، كرات لحم أخف بكثير من نظيراتها في جنوب أوروبا.\\n\\nالمرافقة المميزة هي صلصة كريمية من عصير التحمير، تُقدَّم مع البطاطس المهروسة ومربى توت اللينغونبيري والخيار المخلّل.",
      zh: "瑞典肉丸——科特布拉尔——是瑞典在国际上最具知名度的菜肴之一，很大程度上随宜家的影响传播至全球。在瑞典本土，这道菜一个多世纪以来一直是日常餐桌和节日冷盘宴（smörgåsbord）的主角。猪肉与牛肉混合，加入泡软的面包屑和少量奶油，做出的肉丸比南欧同类菜肴明显更轻盈。\\n\\n标志性配菜是用锅底肉汁制成的顺滑奶油酱，配奶香土豆泥、越橘果酱和略腌黄瓜。每种元素相互平衡：鲜咸肉丸、酸甜果酱、浓郁酱汁。",
      ja: "スウェーデンのミートボール——köttbullar——はIKEAを通じて世界に広まった、スウェーデン最も国際的に知られた料理のひとつです。スウェーデン本国では100年以上にわたり、日常の食卓とお祝いのスモーガスボードの両方で欠かせない一品です。豚と牛のひき肉に水に浸したパン粉と少量のクリームを加えることで、南欧のミートボールよりも格段に軽い食感が生まれます。\\n\\n定番の付け合わせは、焼き汁から作るなめらかなクリームソース、バターたっぷりのマッシュポテト、リンゴンベリージャム、薄切り漬けキュウリです。",
      tr: "İsveç köftesi — köttbullar — büyük ölçüde IKEA'nın etkisiyle dünyaya yayılan, İsveç'in uluslararası alanda en tanınan yemeklerinden biridir. İsveç'te kendisi; yüz yılı aşkın süredir hem günlük mutfağın hem de şenlikli smörgåsbord sofralarının vazgeçilmez bir parçasıdır. Sızdırılmış galeta unu ve az miktarda krema ile yumuşatılan domuz ve dana kıymasının birleşimi, Güney Avrupa muadillerinden belirgin biçimde daha hafif köfteler ortaya çıkarır.\\n\\nEn tipik garnitür, kızartma suyundan yapılan kremsi bir sos; yanında tereyağlı patates püresi, lingonberry reçeli ve hafifçe turşulanmış salatalık sunulur.",
      it: "Le polpette svedesi — köttbullar — sono uno dei piatti più riconosciuti a livello internazionale dalla Svezia, diffuse globalmente soprattutto grazie all'influenza di IKEA. In patria sono un pilastro della cucina quotidiana e dello smörgåsbord festivo da oltre un secolo. Il mix di maiale e manzo, ammorbidito con pangrattato ammollato e un tocco di panna, produce polpette notevolmente più leggere rispetto alle controparti dell'Europa meridionale.\\n\\nL'accompagnamento tipico è una salsa cremosa a base di fondo di cottura, servita con purè di patate, marmellata di mirtilli rossi e cetrioli leggermente marinati.",
      ko: "스웨덴 미트볼 — 쾨트불라르 — 은 IKEA의 영향을 통해 전 세계로 퍼진 스웨덴 최고의 대표 음식 중 하나입니다. 스웨덴 내에서는 100년 이상 일상 요리와 축제 스뫼르고스보드의 필수 메뉴였습니다. 돼지고기와 소고기를 불린 빵가루와 약간의 크림으로 부드럽게 반죽하면 남유럽 미트볼보다 훨씬 가벼운 식감이 나옵니다.\\n\\n대표적인 사이드 디시는 구운 육즙으로 만든 부드러운 크림 그레이비로, 버터향 으깬 감자, 링곤베리 잼, 살짝 절인 오이와 함께 제공됩니다.",
      hi: "स्वीडिश मीटबॉल — कॉटबुलार — स्वीडन के सबसे अंतरराष्ट्रीय स्तर पर पहचाने जाने वाले व्यंजनों में से एक है, जो बड़े पैमाने पर IKEA के प्रभाव से दुनिया भर में फैला। घर में, ये एक सदी से अधिक समय से दैनिक खाना पकाने और उत्सव के स्मॉर्गासबोर्ड दोनों का मुख्य हिस्सा रहे हैं। भीगे ब्रेड क्रम्ब्स और थोड़ी क्रीम से नरम किया गया सूअर और गोमांस का मिश्रण दक्षिण यूरोपीय मीटबॉल की तुलना में काफ़ी हल्के गोले बनाता है।\\n\\nपरिभाषित संगत पैन की भूनने से बनी चिकनी क्रीमी ग्रेवी है, जो मलाईदार मैश्ड आलू, लिंगोनबेरी जैम और हल्के अचारी खीरे के साथ परोसी जाती है।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 119 done")
