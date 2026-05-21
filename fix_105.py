data = open('public/js/recipes.js', 'r', encoding='utf-8').read()

# Add hi to origin
data = data.replace(
    '      ko: "이란"\n    },\n    name: {\n      ro: "Fesenjan"',
    '      ko: "이란",\n      hi: "ईरान"\n    },\n    name: {\n      ro: "Fesenjan"',
    1
)

# Add hi to name
data = data.replace(
    '      ko: "페센잔"\n    },\n    category: {',
    '      ko: "페센잔",\n      hi: "फेसेंजान"\n    },\n    category: {',
    1
)

# Add hi to category (Dinner — first occurrence after Iran block)
data = data.replace(
    '      ko: "저녁"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["carne de pui"',
    '      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["carne de pui"',
    1
)

# Add hi to ingredients
data = data.replace(
    '      ko: ["닭고기", "호두", "석류 당밀", "양파", "향신료", "기름"]\n    },\n    howIsMade: {',
    '      ko: ["닭고기", "호두", "석류 당밀", "양파", "향신료", "기름"],\n      hi: ["चिकन", "अखरोट", "अनार का शीरा", "प्याज़", "मसाले", "तेल"]\n    },\n    howIsMade: {',
    1
)

# Add hi to howIsMade
data = data.replace(
    '      ko: "고기(보통 닭고기나 오리)를 겉면이 노릇해질 때까지 볶은 후, 갈아놓은 호두와 석류 당밀 소스에 부드러워질 때까지 천천히 조리합니다."\n    },\n    originText: {',
    '      ko: "고기(보통 닭고기나 오리)를 겉면이 노릇해질 때까지 볶은 후, 갈아놓은 호두와 석류 당밀 소스에 부드러워질 때까지 천천히 조리합니다.",\n      hi: "मांस के टुकड़ों (आमतौर पर चिकन या बतख) को भूनें, फिर पिसे हुए अखरोट और अनार के शीरे की चटनी में धीमी आंच पर नरम होने तक पकाएं।"\n    },\n    originText: {',
    1
)

# Replace originText
old_ot = '''    originText: {
      ro: "Fesenjan este o rețetă tradițională din Iran.",
      en: "Fesenjan is a traditional recipe from Iran.",
      es: "Fesenjan es una receta tradicional de Irán.",
      fr: "Fesenjan est une recette traditionnelle d'Iran.",
      de: "Fesenjan ist ein traditionelles Rezept aus Iran.",
      pt: "Fesenjan é uma receita tradicional do Irã.",
      ru: "Фесенджан — традиционный рецепт из Ирана.",
      ar: "فسنجان هي وصفة تقليدية من إيران.",
      zh: "伊朗核桃石榴炖鸡 是来自伊朗的传统食谱。",
      ja: "フェセンジャン はイランの伝統的なレシピです。",
      tr: "Fesenjan İran kökenli geleneksel bir tariftir.",
      it: "Fesenjan è una ricetta tradizionale dell'Iran.",
      ko: "페센잔은 이란의 전통 요리입니다."
    }'''

new_ot = '''    originText: {
      ro: "Fesenjan este o khoresht persană — o tocăniță groasă, închisă la culoare — definit de două ingrediente care îi formează complet caracterul: nuci măcinate și melasă de rodie. Nucile sunt prăjite și măcinate până devin o pastă, apoi gătite încet cu melasa până ce amestecul se întunecă aproape de negru, aciditatea rodiei echilibrând grăsimea și amăreala nucii.\\n\\nPuiul sau rața sunt proteinele cele mai comune, brasate direct în tocăniță până absorb sosul. Echilibrul dintre melasă și nuci — acru sau nucifer — este o preferință personală și regională, ajustată pe parcursul gătitului. Fesenjan se servește mereu cu orez persan, cu crusta crocantă de tahdig de dedesubt oferind contrast față de sosul bogat și întunecat de deasupra.",
      en: "Fesenjan is a Persian khoresh — a thick, dark stew — defined by two ingredients that shape its character completely: ground walnuts and pomegranate molasses. The walnuts are toasted and ground to a paste, then slow-cooked with the molasses until the mixture deepens to near-black, the sourness of pomegranate balancing the fat and bitterness of the nut.\\n\\nChicken or duck is the most common protein, braised directly in the stew until it absorbs the sauce entirely. The balance between molasses and walnut — sour or nutty — is a personal and regional preference, adjusted throughout the cooking. Fesenjan is always served with Persian rice, the crisp tahdig crust below providing contrast to the rich, dark sauce above.",
      es: "Fesenjan es un khoresh persa — un guiso espeso y oscuro — definido por dos ingredientes que moldean completamente su carácter: nueces molidas y melaza de granada. Las nueces se tuestan y muelen hasta formar una pasta, luego se cocinan lentamente con la melaza hasta que la mezcla se oscurece casi hasta el negro, la acidez de la granada equilibrando la grasa y el amargor de la nuez.\\n\\nEl pollo o el pato son la proteína más común, brasados directamente en el guiso hasta absorber la salsa. El equilibrio entre melaza y nuez — ácido o nuez — es una preferencia personal y regional, ajustada durante la cocción. El fesenjan siempre se sirve con arroz persa, la costra crujiente de tahdig aportando contraste al rico y oscuro guiso.",
      fr: "Le fesenjan est un khoresh persan — un ragoût épais et sombre — défini par deux ingrédients qui façonnent entièrement son caractère : noix moulues et mélasse de grenade. Les noix sont grillées et réduites en pâte, puis mijotées lentement avec la mélasse jusqu\'à ce que le mélange vire au presque noir, l\'acidité de la grenade équilibrant le gras et l\'amertume de la noix.\\n\\nLe poulet ou le canard est la protéine la plus courante, braisé directement dans le ragoût jusqu\'à absorber la sauce. L\'équilibre entre mélasse et noix — acide ou noisette — est une préférence personnelle et régionale, ajustée tout au long de la cuisson. Le fesenjan se sert toujours avec du riz persan, la croûte croustillante du tahdig contrastant avec la sauce riche et sombre.",
      de: "Fesenjan ist ein persisches Khoresh — ein dicker, dunkler Eintopf — definiert durch zwei Zutaten, die seinen Charakter vollständig formen: gemahlene Walnüsse und Granatapfelsirup. Die Walnüsse werden geröstet und zu einer Paste gemahlen, dann langsam mit dem Sirup gekocht, bis die Mischung fast schwarz wird — die Säure des Granats gleicht das Fett und die Bitterkeit der Nuss aus.\\n\\nHuhn oder Ente ist das häufigste Protein, direkt im Eintopf geschmort, bis es die Sauce vollständig aufnimmt. Die Balance zwischen Sirup und Walnuss — sauer oder nussig — ist eine persönliche und regionale Präferenz, die während des Kochens angepasst wird. Fesenjan wird immer mit persischem Reis serviert, die knusprige Tahdig-Kruste unten gibt Kontrast zur reichen, dunklen Sauce oben.",
      pt: "Fesenjan é um khoresh persa — um ensopado espesso e escuro — definido por dois ingredientes que moldam completamente seu caráter: nozes moídas e xarope de romã. As nozes são tostadas e moídas até formar uma pasta, depois cozidas lentamente com o xarope até a mistura escurecer quase ao preto, a acidez da romã equilibrando a gordura e o amargor da noz.\\n\\nFrango ou pato é a proteína mais comum, brasada diretamente no ensopado até absorver o molho. O equilíbrio entre xarope e noz — ácido ou avelã — é uma preferência pessoal e regional, ajustada durante o cozimento. O fesenjan é sempre servido com arroz persa, a casca crocante do tahdig abaixo dando contraste ao molho rico e escuro acima.",
      ru: "Фесенджан — персидский хореш: густое, тёмное рагу, определяемое двумя ингредиентами, которые полностью формируют его характер: молотые грецкие орехи и гранатовый сироп. Орехи обжаривают и размалывают в пасту, затем медленно варят с сиропом, пока смесь не потемнеет почти до чёрного — кислота граната уравновешивает жир и горечь ореха.\\n\\nКурица или утка — наиболее распространённый белок, тушится прямо в рагу, пока не впитает весь соус. Баланс между сиропом и орехом — кислым или ореховым — это личное и региональное предпочтение, регулируемое в процессе приготовления. Фесенджан всегда подаётся с персидским рисом: хрустящая корочка тахдиг снизу создаёт контраст с богатым тёмным соусом сверху.",
      ar: "الفسنجان هو خورش فارسي — يخنة كثيفة داكنة — يُعرَّف بمكوّنَين يشكّلان طابعه كلياً: الجوز المطحون ودبس الرمان. يُحمَّص الجوز ويُطحن حتى يصير عجيناً، ثم يُطهى ببطء مع الدبس حتى يتحوّل لون المزيج إلى ما يقارب الأسود، وحموضة الرمان تُوازن دسم الجوز ومرارته.\\n\\nالدجاج أو البط هو البروتين الأكثر شيوعاً، يُطهى مباشرةً في اليخنة حتى يتشرّب الصلصة. التوازن بين الدبس والجوز — حامضاً أو عيِّناً — تفضيل شخصي وإقليمي يُضبط طوال الطهي. يُقدَّم الفسنجان دائماً مع الأرز الفارسي، وقشرة التهديق المقرمشة أسفله تُتيح تناقضاً مع الصلصة الغنية الداكنة فوقه.",
      zh: "费森扎是波斯烩菜（khoresh）——一种浓稠、深色的炖菜——由两种完全塑造其个性的食材定义：研磨的核桃和石榴糖浆。核桃烤熟研磨成泥，然后与糖浆慢慢炖煮，直到混合物颜色接近黑色，石榴的酸味平衡着核桃的油脂与苦味。\\n\\n鸡肉或鸭肉是最常见的蛋白质，直接在炖菜中焖煮直到完全吸收酱汁。糖浆与核桃的平衡——偏酸还是偏坚果——是个人和地区偏好，在烹饪过程中不断调整。费森扎总是搭配波斯米饭，底部酥脆的塔赫迪格饭锅巴与浓郁深色的酱汁形成对比。",
      ja: "フェセンジャンはペルシャのホレシュ——濃くて暗い煮込み料理——であり、その性格を完全に形成する2つの食材で定義される：挽いたクルミとザクロシロップ。クルミをローストして滑らかなペーストに挽き、シロップと一緒にゆっくり煮てほぼ黒に近い色になるまで加熱する。ザクロの酸味がクルミの油脂と苦みを打ち消す。\\n\\n鶏肉か鴨肉が最も一般的なタンパク質で、シチューの中で直接ブレイズし、ソースを完全に吸い込む。シロップとクルミのバランス——酸味かコクか——は個人的・地域的な好みで、調理中ずっと調整される。フェセンジャンは常にペルシャ米とともに提供され、下のカリカリのタフディグの皮が上の豊かで暗いソースに対してコントラストをもたらす。",
      tr: "Fesenjan bir İran khoresh\'i — yoğun, koyu bir güveç — karakterini tamamen şekillendiren iki malzeme tarafından tanımlanır: öğütülmüş ceviz ve nar pekmezi. Cevizler kavrulup eziyet kıvamına gelinceye dek öğütülür, ardından pekmezle yavaşça pişirilir; karışım neredeyse siyaha dönünceye dek narın asitliği cevizin yağını ve acılığını dengeler.\\n\\nTavuk veya ördek en yaygın proteindir, sosu tamamen emene dek doğrudan güveçte bräze edilir. Pekmez ile ceviz arasındaki denge — ekşi mi yoksa ceviz aromalı mı — pişirme süresince ayarlanan kişisel ve bölgesel bir tercihtir. Fesenjan her zaman İran pirinci ile servis edilir; alttaki çıtır tahdig kabuğu üstteki zengin, koyu sosu tamamlar.",
      it: "Il fesenjan è un khoresh persiano — uno stufato denso e scuro — definito da due ingredienti che ne plasmano completamente il carattere: noci macinate e melassa di melograno. Le noci vengono tostate e macinate in una pasta, poi cotte lentamente con la melassa fino a quando il composto diventa quasi nero, con l\'acidità del melograno che bilancia il grasso e l\'amarezza della noce.\\n\\nIl pollo o l\'anatra è la proteina più comune, brasata direttamente nello stufato fino ad assorbire completamente la salsa. L\'equilibrio tra melassa e noce — acido o nocciolato — è una preferenza personale e regionale, adattata durante la cottura. Il fesenjan si serve sempre con riso persiano, con la crosta croccante del tahdig in basso che contrasta con la salsa ricca e scura in alto.",
      ko: "페센잔은 페르시아의 호레시 — 진하고 어두운 스튜 — 로, 그 성격을 완전히 형성하는 두 가지 재료로 정의됩니다: 갈아놓은 호두와 석류 당밀. 호두를 볶아 페이스트로 갈고, 당밀과 함께 천천히 조리하여 혼합물이 거의 검은색이 될 때까지 끓입니다. 석류의 신맛이 호두의 지방과 쓴맛을 균형있게 잡아줍니다.\\n\\n닭고기나 오리고기가 가장 일반적인 단백질로, 소스를 완전히 흡수할 때까지 스튜에 직접 브레이즈합니다. 당밀과 호두 사이의 균형 — 신맛 또는 고소함 — 은 개인적이고 지역적인 취향으로, 조리 과정에서 조정됩니다. 페센잔은 항상 페르시아 쌀과 함께 제공되며, 아래의 바삭한 타흐디그 껍질이 위의 풍부하고 어두운 소스와 대조를 이룹니다.",
      hi: "फेसेंजान एक फ़ारसी खोरेश है — एक गाढ़ा, गहरे रंग का स्टू — जो दो ऐसी सामग्रियों से परिभाषित होता है जो इसके चरित्र को पूरी तरह आकार देती हैं: पिसे हुए अखरोट और अनार का शीरा। अखरोटों को भूनकर पेस्ट बनाया जाता है, फिर शीरे के साथ धीमी आंच पर पकाया जाता है जब तक मिश्रण लगभग काला न हो जाए — अनार की खटास अखरोट की चर्बी और कड़वाहट को संतुलित करती है।\\n\\nचिकन या बतख सबसे आम प्रोटीन है, जिसे सॉस पूरी तरह अवशोषित होने तक स्टू में सीधे ब्रेज़ किया जाता है। शीरे और अखरोट के बीच संतुलन — खट्टा या अखरोट वाला — एक व्यक्तिगत और क्षेत्रीय प्राथमिकता है जिसे पकाने के दौरान समायोजित किया जाता है। फेसेंजान हमेशा फ़ारसी चावल के साथ परोसा जाता है, नीचे की कुरकुरी ताहदीग परत ऊपर की समृद्ध, गहरी चटनी के साथ विपरीत बनाती है।"
    }'''

if old_ot in data:
    data = data.replace(old_ot, new_ot, 1)
    open('public/js/recipes.js', 'w', encoding='utf-8').write(data)
    print('Done 105')
else:
    print('NOT FOUND 105')
