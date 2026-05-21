with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ID 153 - Potica (Slovenia) - no hi fields yet
# Note: servings/tipType/pairingsType come before origin in this entry

content = content.replace(
    '      ko: "슬로베니아"\n    },\n    name: {\n      ro: "Potica"',
    '      ko: "슬로베니아",\n      hi: "स्लोवेनिया"\n    },\n    name: {\n      ro: "Potica"'
)

content = content.replace(
    '      ko: "포티차"\n    },\n    category: {\n      ro: "Desert"',
    '      ko: "포티차",\n      hi: "पोटिका"\n    },\n    category: {\n      ro: "Desert"'
)

content = content.replace(
    '      ko: "디저트"\n    },\n    ingredients: {\n      ro: ["aluat", "nuci"',
    '      ko: "디저트",\n      hi: "मिठाई"\n    },\n    ingredients: {\n      ro: ["aluat", "nuci"'
)

content = content.replace(
    '      ko: ["반죽", "호두", "꿀", "계란", "설탕", "버터", "우유"]\n    },\n    howIsMade: {',
    '      ko: ["반죽", "호두", "꿀", "계란", "설탕", "버터", "우유"],\n      hi: ["आटा", "अखरोट", "शहद", "अंडे", "चीनी", "मक्खन", "दूध"]\n    },\n    howIsMade: {'
)

content = content.replace(
    '      ko: "반죽을 준비하고 펴서 호두, 꿀, 버터 속재료를 넣고 돌돌 말아 노릇해질 때까지 오븐에서 굽습니다."\n    },\n    originText: {\n      ro: "Potica este',
    '      ko: "반죽을 준비하고 펴서 호두, 꿀, 버터 속재료를 넣고 돌돌 말아 노릇해질 때까지 오븐에서 굽습니다.",\n      hi: "आटा तैयार करें, बेलें, अखरोट-शहद-मक्खन की भराई डालें, रोल करें और सुनहरा होने तक बेक करें।"\n    },\n    originText: {\n      ro: "Potica este'
)

old_origin = '''    originText: {
      ro: "Potica este o rețetă tradițională din Slovenia.",
      en: "Potica is a traditional recipe from Slovenia.",
      es: "Potica es una receta tradicional de Eslovenia.",
      fr: "Potica est une recette traditionnelle de Slovénie.",
      de: "Potica ist ein traditionelles Rezept aus Slowenien.",
      pt: "Potica é uma receita tradicional da Eslovênia.",
      ru: "Потица — традиционный рецепт из Словении.",
      ar: "بوتيتسا هي وصفة تقليدية من سلوفينيا.",
      zh: "斯洛文尼亚核桃卷 是来自斯洛文尼亚的传统食谱。",
      ja: "ポティツァ はスロベニアの伝統的なレシピです。",
      tr: "Potica Slovenya kökenli geleneksel bir tariftir.",
      it: "Potica è una ricetta tradizionale della Slovenia.",
      ko: "포티차는 슬로베니아의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Potica este prăjitura națională a Sloveniei — un ruladă dospită înfășurată în jurul unui strat generos de nucă măcinată cu miere, gălbenușuri și unt, coaptă într-o formă tubulară. Aluatul este bogat, aproape briocheș, iar umplutura de nucă este compactă și parfumată. Spirala vizibilă la tăiere este semnătura preparatului.\\n\\nPotica se coace la Crăciun, Paști, botezuri și nunți — absența ei de pe masa festivă slovenă ar fi de neconceput. Rețetele diferă de familie la familie, cu sute de variante regionale (cu mac, cu hribi, cu ghimber). Potice este cuvântul în plural, deoarece se coace întotdeauna mai mult de una odată.",
      en: "Potica is Slovenia's national pastry — a leavened roll wrapped around a generous layer of ground walnut with honey, egg yolks, and butter, baked in a tubular mold. The dough is rich, almost brioche-like, and the walnut filling is dense and fragrant. The visible spiral when cut is the pastry's signature.\\n\\nPotica is baked at Christmas, Easter, baptisms, and weddings — its absence from the Slovenian festive table would be unthinkable. Recipes differ from family to family, with hundreds of regional variants (with poppy seed, wild mushroom, ginger). Potice is the plural, because more than one is always baked at a time.",
      es: "La potica es el pastel nacional de Eslovenia — un rollo leudado enrollado alrededor de una generosa capa de nuez molida con miel, yemas de huevo y mantequilla, horneado en un molde tubular. La masa es rica, casi tipo brioche, y el relleno de nuez es denso y fragante. La espiral visible al cortar es la firma del pastel.\\n\\nLa potica se hornea en Navidad, Pascua, bautizos y bodas — su ausencia de la mesa festiva eslovena sería impensable. Las recetas difieren de familia en familia, con cientos de variantes regionales (con semilla de amapola, con setas, con jengibre).",
      fr: "La potica est la pâtisserie nationale de la Slovénie — un roulé levé enroulé autour d'une généreuse couche de noix moulues avec du miel, des jaunes d'œufs et du beurre, cuit dans un moule tubulaire. La pâte est riche, presque briochée, et la garniture aux noix est dense et parfumée. La spirale visible à la coupe est la signature de la pâtisserie.\\n\\nLa potica se cuit à Noël, Pâques, aux baptêmes et aux mariages — son absence de la table festive slovène serait impensable. Les recettes diffèrent de famille en famille avec des centaines de variantes régionales.",
      de: "Potica ist Sloweniens nationales Gebäck — eine Heferolle, die um eine großzügige Schicht gemahlener Walnüsse mit Honig, Eigelb und Butter gewickelt und in einer Rohrform gebacken wird. Der Teig ist reich, fast wie Brioche, und die Walnussfüllung ist dicht und aromatisch. Die sichtbare Spirale beim Aufschneiden ist das Markenzeichen des Gebäcks.\\n\\nPotica wird zu Weihnachten, Ostern, Taufen und Hochzeiten gebacken — ihr Fehlen am slowenischen Festtagstisch wäre undenkbar. Rezepte unterscheiden sich von Familie zu Familie, mit Hunderten regionaler Varianten.",
      pt: "A potica é a pastelaria nacional da Eslovênia — um rolo levedado enrolado em torno de uma generosa camada de noz moída com mel, gemas de ovos e manteiga, assado numa forma tubular. A massa é rica, quase como brioche, e o recheio de noz é denso e perfumado. A espiral visível ao cortar é a assinatura da pastelaria.\\n\\nA potica é assada no Natal, Páscoa, batizados e casamentos — sua ausência da mesa festiva eslovena seria impensável. As receitas diferem de família para família, com centenas de variantes regionais.",
      ru: "Потица — национальная выпечка Словении: дрожжевой рулет, свёрнутый вокруг щедрого слоя молотых грецких орехов с мёдом, желтками и маслом, запечённый в цилиндрической форме. Тесто богатое, почти бриошное, а ореховая начинка плотная и ароматная. Видимая спираль на срезе — фирменный знак выпечки.\\n\\nПотицу пекут на Рождество, Пасху, крестины и свадьбы — её отсутствие на словенском праздничном столе было бы немыслимым. Рецепты в каждой семье свои, существуют сотни региональных вариантов (с маком, лесными грибами, имбирём).",
      ar: "البوتيتسا هي حلوى سلوفينيا الوطنية — لفافة مختمرة تُلف حول طبقة سخية من الجوز المطحون مع العسل وصفار البيض والزبدة، تُخبز في قالب أنبوبي. العجينة غنية تشبه البريوش تقريباً، وحشوة الجوز كثيفة وعطرية. الحلزون المرئي عند التقطيع هو بصمة الحلوى.\\n\\nتُخبز البوتيتسا في عيد الميلاد والفصح والمعموديات والأعراس — غيابها عن المائدة الاحتفالية السلوفينية أمر لا يُتصور. تختلف الوصفات من عائلة لأخرى مع مئات المتغيرات الإقليمية.",
      zh: "波蒂卡是斯洛文尼亚的国家糕点——一个发酵面卷，包裹着一层厚厚的磨碎核桃加蜂蜜、蛋黄和黄油，在管状模具中烘烤。面团富有，几乎像布里欧修，核桃馅料密实而芬芳。切开时可见的螺旋形是这道糕点的标志。\\n\\n波蒂卡在圣诞节、复活节、洗礼和婚礼时烘烤——在斯洛文尼亚节日餐桌上缺少它是不可想象的。各家食谱不同，有数百种地区变体（罂粟籽、野蘑菇、姜）。",
      ja: "ポティツァはスロベニアの国民的菓子パンです——発酵した生地をハチミツ、卵黄、バターと一緒に挽いたクルミの層の周りにたっぷり巻き、筒状の型で焼きます。生地はリッチでブリオッシュに近く、クルミのフィリングは濃密で香り豊かです。切ったときに見えるスパイラルがこの菓子の特徴です。\\n\\nポティツァはクリスマス、イースター、洗礼、結婚式に焼かれます——スロベニアの祝宴の食卓にそれがないことは考えられません。レシピは家族ごとに異なり、何百もの地域変体があります。",
      tr: "Potica, Slovenya'nın ulusal pastasıdır — bal, yumurta sarısı ve tereyağıyla birlikte öğütülmüş cevizin cömert bir tabakası etrafına sarılmış mayalı bir rulo, boru şeklinde bir kalıpta pişirilir. Hamur zengin, neredeyse brioche gibidir ve ceviz dolgu yoğun ve kokulu. Kesildiğinde görünen spiral, pastanın imzasıdır.\\n\\nPotica Noel'de, Paskalya'da, vaftiz törenlerinde ve düğünlerde pişirilir — Sloven şenlik masasında yokluğu düşünülemez. Tarifler aileden aileye farklılık gösterir, yüzlerce bölgesel çeşidi vardır.",
      it: "La potica è il dolce nazionale della Slovenia — un rotolo lievitato avvolto attorno a un generoso strato di noci macinate con miele, tuorli d'uovo e burro, cotto in uno stampo tubolare. L'impasto è ricco, quasi simile al brioche, e il ripieno di noci è denso e profumato. La spirale visibile al taglio è la firma del dolce.\\n\\nLa potica si cuoce a Natale, Pasqua, battesimi e matrimoni — la sua assenza dalla tavola festiva slovena sarebbe impensabile. Le ricette variano da famiglia a famiglia, con centinaia di varianti regionali.",
      ko: "포티차는 슬로베니아의 국민 제과입니다. 발효 반죽에 꿀, 달걀노른자, 버터와 함께 간 호두를 듬뿍 채워 원통형 틀에 구운 롤빵입니다. 반죽은 풍부하고 브리오슈에 가까우며 호두 속재료는 촘촘하고 향긋합니다. 자를 때 보이는 나선형이 이 과자의 특징입니다.\\n\\n크리스마스, 부활절, 세례식, 결혼식에 만들며, 슬로베니아 축제 식탁에 없다는 것은 상상할 수 없습니다. 레시피는 가족마다 다르고 양귀비씨, 야생버섯, 생강 등 수백 가지 지역 변형이 있습니다.",
      hi: "पोटिका स्लोवेनिया की राष्ट्रीय मिठाई है — एक खमीरदार रोल जो शहद, अंडे की जर्दी और मक्खन के साथ पिसे अखरोट की उदार परत के चारों ओर लपेटा जाता है, ट्यूब के आकार के सांचे में बेक किया जाता है। आटा समृद्ध, लगभग ब्रियोश जैसा होता है, और अखरोट की भराई घनी और सुगंधित होती है। काटने पर दिखने वाला सर्पिल इस मिठाई की पहचान है।\\n\\nपोटिका क्रिसमस, ईस्टर, बपतिस्मा और शादियों पर बनाई जाती है — स्लोवेनिया की उत्सव तालिका पर इसकी अनुपस्थिति अकल्पनीय होगी। रेसिपी परिवार-परिवार अलग होती है, सैकड़ों क्षेत्रीय रूप हैं।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 153 done")
