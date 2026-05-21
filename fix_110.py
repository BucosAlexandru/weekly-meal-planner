data = open('public/js/recipes.js', 'r', encoding='utf-8').read()

# Add hi to origin
data = data.replace(
    '      ko: "싱가포르"\n    },\n    name: {\n      ro: "Chili Crab"',
    '      ko: "싱가포르",\n      hi: "सिंगापुर"\n    },\n    name: {\n      ro: "Chili Crab"',
    1
)

# Add hi to name
data = data.replace(
    '      ko: "칠리 크랩"\n    },\n    category: {',
    '      ko: "칠리 크랩",\n      hi: "चिली केकड़ा"\n    },\n    category: {',
    1
)

# Add hi to category (Dinner — Singapore block)
data = data.replace(
    '      ko: "저녁"\n    },\n    servings: 4,\n    tipType: \'fish\',\n    pairingsType: \'fish\',\n    ingredients: {\n      ro: ["crab"',
    '      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    servings: 4,\n    tipType: \'fish\',\n    pairingsType: \'fish\',\n    ingredients: {\n      ro: ["crab"',
    1
)

# Add hi to ingredients
data = data.replace(
    '      ko: ["게", "토마토 소스", "고추 소스", "마늘", "생강", "파", "계란"]\n    },\n    howIsMade: {',
    '      ko: ["게", "토마토 소스", "고추 소스", "마늘", "생강", "파", "계란"],\n      hi: ["केकड़ा", "टमाटर सॉस", "मिर्च सॉस", "लहसुन", "अदरक", "हरा प्याज़", "अंडे"]\n    },\n    howIsMade: {',
    1
)

# Add hi to howIsMade
data = data.replace(
    '      ko: "게를 마늘, 생강, 고추와 함께 매운 토마토 소스에 넣고 고기가 부드러워지고 소스가 걸쭉해질 때까지 조리합니다."\n    },\n    originText: {',
    '      ko: "게를 마늘, 생강, 고추와 함께 매운 토마토 소스에 넣고 고기가 부드러워지고 소스가 걸쭉해질 때까지 조리합니다.",\n      hi: "केकड़े को लहसुन, अदरक और मिर्च के साथ मसालेदार टमाटर सॉस में तब तक पकाएं जब तक मांस नरम और सॉस गाढ़ा न हो जाए।"\n    },\n    originText: {',
    1
)

# Replace originText
old_ot = '''    originText: {
      ro: "Chili Crab este o rețetă tradițională din Singapore.",
      en: "Chili Crab is a traditional recipe from Singapore.",
      es: "Cangrejo con chile es una receta tradicional de Singapur.",
      fr: "Crabe au chili est une recette traditionnelle de Singapour.",
      de: "Chilikrabbe ist ein traditionelles Rezept aus Singapur.",
      pt: "Caranguejo com chili é uma receita tradicional de Singapura.",
      ru: "Краб чили — традиционный рецепт из Сингапура.",
      ar: "سلطعون الفلفل الحار هي وصفة تقليدية من سنغافورة.",
      zh: "辣椒蟹 是来自新加坡的传统食谱。",
      ja: "チリクラブ はシンガポールの伝統的なレシピです。",
      tr: "Chili Crab Singapur kökenli geleneksel bir tariftir.",
      it: "Chili Crab è una ricetta tradizionale di Singapore.",
      ko: "칠리 크랩은 싱가포르의 전통 요리입니다."
    }'''

new_ot = '''    originText: {
      ro: "Chili Crab este cel mai iconic fel de mâncare din Singapore, creat în anii 1950 și acum atât de integrat în identitatea culinară a orașului. Crabii de noroi — mari, cărnoși, vânduți vii — sunt prăjiți în wok într-un sos bogat de pastă de roșii, chili dulce, usturoi și ghimbir, cu ouă bătute amestecate pentru a crea fire mătăsoase prin sos.\\n\\nDespite the name, sosul este dulce și acru, cu o picantericitate moderată, nu intensă. Crabul se mănâncă cu mâinile și se crapă la masă. Mantou prăjit — chifle chinezești aburite, ușor prăjite — se servesc alături special pentru a absorbi sosul, considerat la fel de important ca și crabul însuși.",
      en: "Chili crab is Singapore\'s most iconic dish, created in the 1950s and now deeply embedded in the city\'s food identity. Mud crabs — large, meaty, and sold live — are wok-fried in a rich sauce of tomato paste, sweet chili, garlic, and ginger, with beaten eggs stirred in to create silky threads through the sauce.\\n\\nDespite the name, the sauce is sweet and tangy first, with moderate heat rather than fierce spice. The crab is eaten with hands and cracked open at the table. Fried mantou — Chinese steamed buns, lightly toasted — are served alongside specifically to mop up the sauce, which is considered as important as the crab itself.",
      es: "El cangrejo con chile es el plato más icónico de Singapur, creado en la década de 1950 y ahora profundamente integrado en la identidad gastronómica de la ciudad. Los cangrejos de barro — grandes, carnosos y vendidos vivos — se saltean en wok en una salsa rica de pasta de tomate, chile dulce, ajo y jengibre, con huevos batidos incorporados para crear hilos sedosos en la salsa.\\n\\nA pesar del nombre, la salsa es ante todo dulce y ácida, con un picor moderado en lugar de intenso. El cangrejo se come con las manos y se abre en la mesa. Los mantou fritos — bollos chinos al vapor, ligeramente tostados — se sirven para absorber la salsa, considerada tan importante como el cangrejo mismo.",
      fr: "Le crabe au chili est le plat le plus emblématique de Singapour, créé dans les années 1950 et désormais profondément ancré dans l\'identité culinaire de la ville. Les crabes des mangroves — grands, charnus et vendus vivants — sont sautés au wok dans une sauce riche de concentré de tomate, piment doux, ail et gingembre, avec des œufs battus incorporés pour créer des fils soyeux dans la sauce.\\n\\nMalgré le nom, la sauce est avant tout douce et acidulée, avec une chaleur modérée plutôt que d\'une épice vive. Le crabe se mange avec les mains et s\'ouvre à table. Les mantou frits — petits pains chinois à la vapeur, légèrement grillés — sont servis à côté précisément pour absorber la sauce, considérée aussi importante que le crabe lui-même.",
      de: "Chili Crab ist Singapurs ikonischstes Gericht, in den 1950er Jahren geschaffen und heute tief in die kulinarische Identität der Stadt eingebettet. Schlammkrabben — groß, fleischig und lebend verkauft — werden im Wok in einer reichen Sauce aus Tomatenmark, süßem Chili, Knoblauch und Ingwer gebraten, mit geschlagenen Eiern untergerührt, die seidig Fäden durch die Sauce bilden.\\n\\nTrotz des Namens ist die Sauce zuerst süß und würzig, mit moderater Schärfe statt intensivem Gewürz. Die Krabbe wird mit den Händen gegessen und am Tisch aufgeknackt. Gebratene Mantou — chinesische gedämpfte Brötchen, leicht geröstet — werden speziell zum Auftunken der Sauce serviert, die als ebenso wichtig gilt wie die Krabbe selbst.",
      pt: "O caranguejo com chili é o prato mais icónico de Singapura, criado nos anos 1950 e agora profundamente integrado na identidade culinária da cidade. Os caranguejos de lama — grandes, carnudos e vendidos vivos — são salteados no wok numa rica molho de pasta de tomate, chili doce, alho e gengibre, com ovos batidos incorporados para criar fios de seda através do molho.\\n\\nApesar do nome, o molho é primeiro doce e ácido, com calor moderado em vez de especiaria intensa. O caranguejo é comido com as mãos e partido à mesa. Mantou frito — pãezinhos chineses cozidos a vapor, levemente torrados — são servidos especificamente para absorver o molho, considerado tão importante quanto o caranguejo em si.",
      ru: "Краб чили — самое культовое блюдо Сингапура, созданное в 1950-х годах и теперь глубоко вписанное в кулинарную идентичность города. Грязевые крабы — крупные, мясистые, продаваемые живыми — жарятся в воке в богатом соусе из томатной пасты, сладкого чили, чеснока и имбиря, с вбитыми взбитыми яйцами, образующими шёлковые нити в соусе.\\n\\nНесмотря на название, соус прежде всего сладкий и пикантный, с умеренной остротой, а не жгучей пряностью. Краба едят руками и раскалывают за столом. Жареные мантоу — китайские паровые булочки, слегка обжаренные — подаются рядом специально для обмакивания в соус, который считается таким же важным, как и сам краб.",
      ar: "سلطعون الفلفل الحار هو أبرز طبق في سنغافورة، ابتُكر في خمسينيات القرن الماضي وبات راسخاً بعمق في هوية المدينة الغذائية. تُقلى سلطعونات الطين — كبيرة، لحمها وافر، تُباع حيّة — في مقلاة ووك بصلصة غنية من معجون الطماطم والفلفل الحلو والثوم والزنجبيل، مع تحريك بيض مخفوق يُكوِّن خيوطاً حريرية في الصلصة.\\n\\nعلى الرغم من الاسم، الصلصة حلوة حامضة أولاً، مع حرارة معتدلة لا حار لاذع. يُؤكل السلطعون باليد ويُكسر على المائدة. يُقدَّم إلى جانبه المانتو المقلي — خبيز صيني مطهو على البخار وخفيف القلي — تحديداً لامتصاص الصلصة، التي تُعدّ بأهمية السلطعون ذاته.",
      zh: "辣椒蟹是新加坡最标志性的菜肴，创于1950年代，如今深深嵌入这座城市的饮食身份。泥蟹——大而肉厚，活着出售——在炒锅中用番茄酱、甜辣椒、大蒜和生姜调制的浓酱翻炒，搅入打散的鸡蛋形成酱汁中的丝绸般细丝。\\n\\n尽管名叫辣椒蟹，酱汁首先是甜而微酸的，辣度适中而非猛烈。螃蟹用手吃，在桌上剥壳。一旁搭配的炸馒头——中式蒸包，轻微炸过——专门用来蘸吸酱汁，酱汁本身被认为与螃蟹同等重要。",
      ja: "チリクラブはシンガポール最も象徴的な料理で、1950年代に誕生し、今や都市の食文化アイデンティティに深く刻み込まれている。マッドクラブ——大きく肉厚で生きたまま販売される——トマトペースト・甘いチリ・ニンニク・生姜の豊かなソースで炒められ、溶き卵を加えてソースの中にシルクのような糸を作る。\\n\\nその名とは裏腹に、ソースはまず甘く爽やかで、激しいスパイスではなく適度な辛さがある。カニは手で食べてテーブルで割る。揚げマントウ——中国式蒸しパン、軽くトーストしたもの——はソースを拭い取るために特別に添えられる。ソースはカニ自体と同じくらい重要とされる。",
      tr: "Chili crab, 1950\'lerde yaratılan ve artık şehrin yemek kimliğine derinlemesine işlemiş Singapur\'un en ikonik yemeğidir. Çamur yengeçleri — iri, etli ve canlı satılan — domates salçası, tatlı biber, sarımsak ve zencefilin zengin sosunda wok\'ta kızartılır; ipeksi iplikler oluşturmak için çırpılmış yumurta karıştırılır.\\n\\nAdına rağmen sos öncelikle tatlı ve ekşidir, şiddetli baharat yerine orta derecede bir ısı vardır. Yengeç eller kullanılarak yenir ve masada kırılır. Hafifçe kızartılmış Çin buharda pişmiş ekmeği olan kızarmış mantou, sosu emdirmek için özellikle servis edilir — sos, yengecin kendisi kadar önemli kabul edilir.",
      it: "Il chili crab è il piatto più iconico di Singapore, creato negli anni \'50 e ora profondamente radicato nell\'identità culinaria della città. I granchi di fango — grandi, polposi e venduti vivi — vengono saltati nel wok in una ricca salsa di concentrato di pomodoro, peperoncino dolce, aglio e zenzero, con uova sbattute incorporate per creare fili setosi attraverso la salsa.\\n\\nNonostante il nome, la salsa è prima dolce e agrodolce, con un calore moderato piuttosto che una spezia intensa. Il granchio si mangia con le mani e si schiacciano a tavola. I mantou fritti — panini cinesi al vapore, leggermente tostati — vengono serviti appositamente per raccogliere la salsa, considerata importante quanto il granchio stesso.",
      ko: "칠리 크랩은 1950년대에 만들어진 싱가포르의 가장 상징적인 요리로, 지금은 도시의 음식 정체성에 깊이 새겨져 있습니다. 진흙 게 — 크고 살이 많으며 살아있는 채로 판매 — 는 토마토 페이스트, 달콤한 칠리, 마늘, 생강으로 만든 풍부한 소스에 웍으로 볶아지고, 푼 달걀을 넣어 소스에 실크 같은 실가닥을 만듭니다.\\n\\n이름과 달리 소스는 먼저 달콤하고 새콤하며, 강한 향신료보다는 적당한 매운맛입니다. 게는 손으로 먹고 식탁에서 껍질을 깝니다. 튀긴 만터우 — 중국식 찐빵을 가볍게 구운 것 — 는 소스를 닦아내기 위해 곁들여 제공되는데, 소스 자체가 게만큼 중요하게 여겨집니다.",
      hi: "चिली केकड़ा 1950 के दशक में बनाया गया सिंगापुर का सबसे प्रतिष्ठित व्यंजन है, जो अब शहर की खाद्य पहचान में गहराई से समाहित है। मड केकड़े — बड़े, मांसल, और जीवित बेचे जाने वाले — टमाटर पेस्ट, मीठी मिर्च, लहसुन और अदरक की समृद्ध चटनी में वोक में तले जाते हैं, और फेंटे हुए अंडे मिलाए जाते हैं जो चटनी में रेशमी धागे बनाते हैं।\\n\\nनाम के बावजूद, चटनी पहले मीठी और तीखी होती है, तीव्र मसाले के बजाय मध्यम गर्मी के साथ। केकड़े को हाथों से खाया जाता है और मेज पर तोड़ा जाता है। तले हुए मंटो — चीनी स्टीम्ड बन, हल्के से टोस्ट किए हुए — विशेष रूप से चटनी को साफ करने के लिए परोसे जाते हैं, जिसे खुद केकड़े जितना ही महत्वपूर्ण माना जाता है।"
    }'''

if old_ot in data:
    data = data.replace(old_ot, new_ot, 1)
    open('public/js/recipes.js', 'w', encoding='utf-8').write(data)
    print('Done 110')
else:
    print('NOT FOUND 110')
