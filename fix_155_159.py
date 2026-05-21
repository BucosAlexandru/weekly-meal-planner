with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ── ID 155 – Pork Schnitzel (Poland) ──────────────────────────────────────────
content = content.replace(
    '      ko: "폴란드"\n    },\n    name: {\n      ro: "Kotlet schabowy"',
    '      ko: "폴란드",\n      hi: "पोलैंड"\n    },\n    name: {\n      ro: "Kotlet schabowy"'
)
content = content.replace(
    '      ko: "돼지고기 슈니첼"\n    },\n    category: {',
    '      ko: "돼지고기 슈니첼",\n      hi: "पोर्क श्निट्ज़ल"\n    },\n    category: {'
)
content = content.replace(
    '      ko: "저녁"\n    },\n    ingredients: {\n      ro: ["cotlet de porc"',
    '      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    ingredients: {\n      ro: ["cotlet de porc"'
)
content = content.replace(
    '      ko: ["돼지고기", "밀가루", "계란", "빵가루", "기름", "소금", "후추"]\n    },\n    howIsMade: {',
    '      ko: ["돼지고기", "밀가루", "계란", "빵가루", "기름", "소금", "후추"],\n      hi: ["पोर्क चॉप", "आटा", "अंडे", "ब्रेडक्रम्ब", "तेल", "नमक", "काली मिर्च"]\n    },\n    howIsMade: {'
)
content = content.replace(
    '      ko: "돼지고기를 밀가루, 계란, 빵가루 순서로 묻혀서 기름에 노릇하게 튀깁니다."\n    },\n    originText: {\n      ro: "Kotlet schabowy este',
    '      ko: "돼지고기를 밀가루, 계란, 빵가루 순서로 묻혀서 기름에 노릇하게 튀깁니다.",\n      hi: "पोर्क चॉप को आटे, अंडे और ब्रेडक्रम्ब में लपेटें, फिर तेल में सुनहरा होने तक तलें।"\n    },\n    originText: {\n      ro: "Kotlet schabowy este'
)

old_155 = '''    originText: {
      ro: "Kotlet schabowy este o rețetă tradițională din Polonia.",
      en: "Pork schnitzel is a traditional recipe from Poland.",
      es: "Escalope de cerdo es una receta tradicional de Polonia.",
      fr: "Escalope de porc est une recette traditionnelle de Pologne.",
      de: "Schnitzel ist ein traditionelles Rezept aus Polen.",
      pt: "Schnitzel de porco é uma receita tradicional da Polónia.",
      ru: "Свиной шницель — традиционный рецепт из Польши.",
      ar: "شطيرة لحم الخنزير هي وصفة تقليدية من بولندا.",
      zh: "炸猪排 是来自波兰的传统食谱。",
      ja: "ポークシュニッツェル はポーランドの伝統的なレシピです。",
      tr: "Domuz Şnitzeli Polonya kökenli geleneksel bir tariftir.",
      it: "Schnitzel di maiale è una ricetta tradizionale della Polonia.",
      ko: "돼지고기 슈니첼은 폴란드의 전통 요리입니다."
    }'''
new_155 = '''    originText: {
      ro: "Kotlet schabowy — schnitzelul polonez — este preparatul național din porc al Poloniei. O bucată de mușchi de porc se bate subțire, se dă prin făină, ou și pesmet, apoi se prăjește în untură sau ulei până devine aurie, crocantă și uniform gătită. Spre deosebire de Wiener Schnitzel (vițel), kotletul polonez este dintotdeauna din porc și rămâne mâncarea de duminică a milioane de familii.\\n\\nSe servește clasic cu cartofi fierți și varză murată sotată. Coaja crocantă cu miezul suculent de porc este contrastul definitoriu al preparatului. Bucătăriile poloneze știu că unturu dă o aromă pe care uleiul nu o poate replica — o schimbare regretată de mulți de când unturu a dispărut din bucătăriile moderne.",
      en: "Kotlet schabowy — the Polish schnitzel — is Poland's national pork dish. A pork loin slice is pounded thin, coated in flour, egg, and breadcrumbs, then fried in lard or oil until golden, crispy, and evenly cooked through. Unlike Wiener Schnitzel (veal), the Polish kotlet has always been pork and remains the Sunday dinner of millions of families.\\n\\nServed classically with boiled potatoes and sautéed sauerkraut. The crispy crust against the juicy pork interior is the defining contrast of the dish. Polish cooks know that lard delivers a flavor oil cannot replicate — a change mourned by many since lard disappeared from modern kitchens.",
      es: "El kotlet schabowy — el schnitzel polaco — es el plato nacional de cerdo de Polonia. Una loncha de lomo de cerdo se aplana, se reboza en harina, huevo y pan rallado, y se fríe en manteca o aceite hasta que queda dorada, crujiente y bien cocinada. A diferencia del Wiener Schnitzel (ternera), el kotlet polaco siempre ha sido de cerdo y sigue siendo la comida del domingo de millones de familias.\\n\\nSe sirve clásicamente con patatas cocidas y chucrut salteado. La corteza crujiente contra el interior jugoso de cerdo es el contraste definitorio del plato.",
      fr: "Le kotlet schabowy — le schnitzel polonais — est le plat national de porc de la Pologne. Une tranche de longe de porc est aplatie, panée dans la farine, l'œuf et la chapelure, puis frite dans du saindoux ou de l'huile jusqu'à ce qu'elle soit dorée et croustillante. Contrairement au Wiener Schnitzel (veau), le kotlet polonais a toujours été à base de porc et reste le repas dominical de millions de familles.\\n\\nServi classiquement avec des pommes de terre bouillies et de la choucroute sautée. La croûte croustillante contre l'intérieur juteux du porc est le contraste définitoire du plat.",
      de: "Kotlet schabowy — das polnische Schnitzel — ist Polens nationales Schweinegericht. Eine Schweinelende wird dünn geklopft, in Mehl, Ei und Paniermehl gewendet und in Schmalz oder Öl goldbraun und knusprig gebraten. Anders als das Wiener Schnitzel (Kalb) war der polnische Kotlet immer vom Schwein und bleibt das Sonntagsmahl von Millionen Familien.\\n\\nKlassisch mit Salzkartoffeln und gedünstetem Sauerkraut serviert. Die knusprige Kruste gegen den saftigen Schweinekern ist der charakteristische Kontrast des Gerichts.",
      pt: "Kotlet schabowy — o schnitzel polaco — é o prato nacional de porco da Polónia. Uma fatia de lombo de porco é batida fina, coberta em farinha, ovo e pão ralado, depois frita em banha ou óleo até ficar dourada e crocante. Ao contrário do Wiener Schnitzel (vitela), o kotlet polaco sempre foi de porco e continua a ser o jantar de domingo de milhões de famílias.\\n\\nServido classicamente com batatas cozidas e chucrute salteado. A crosta estaladiça contra o interior suculento de porco é o contraste definidor do prato.",
      ru: "Котлет сцабовы — польский шницель — это национальное свиное блюдо Польши. Кусок свиной корейки тонко отбивают, обваливают в муке, яйце и панировочных сухарях, затем жарят на смальце или масле до золотистой хрустящей корочки. В отличие от Wiener Schnitzel (телятина), польский котлет всегда делался из свинины и остаётся воскресным обедом миллионов семей.\\n\\nКлассически подаётся с варёным картофелем и тушёной квашеной капустой. Хрустящая корочка в контрасте с сочной свининой — определяющий контраст блюда.",
      ar: "كوتليت شتشابوفي — شنيتسل بولندي — هو الطبق الوطني من لحم الخنزير في بولندا. شريحة من خاصرة الخنزير تُرقَّق بالطرق، تُغطى بالدقيق والبيض وفتات الخبز، ثم تُقلى في الشحم أو الزيت حتى تصبح ذهبية مقرمشة. على خلاف شنيتسل فيينا (لحم العجل)، كان الكوتليت البولندي دائماً من لحم الخنزير ويبقى عشاء أحد ملايين العائلات.\\n\\nيُقدَّم تقليدياً مع بطاطا مسلوقة وملفوف حامض مقلي. القشرة المقرمشة في مقابل اللحم العصير هو التناقض المميز للطبق.",
      zh: "炸猪排（科特勒特沙博维）是波兰的国家猪肉菜肴。猪腰肉拍薄，裹上面粉、鸡蛋和面包糠，在猪油或植物油中炸至金黄酥脆。与维也纳炸肉排（小牛肉）不同，波兰炸猪排一直都是猪肉制成，是数百万家庭的周日晚餐。\\n\\n经典搭配是水煮土豆和炒酸白菜。酥脆的外皮与多汁的猪肉形成鲜明对比，是这道菜的标志性特点。",
      ja: "コトレット・シャボヴィ——ポーランド風シュニッツェル——はポーランドの国民的な豚料理です。豚ロースを薄く叩き、小麦粉、卵、パン粉でコーティングし、ラードまたは油で黄金色でカリカリになるまで揚げます。ウィーナーシュニッツェル（仔牛）と違い、ポーランドのコトレットは常に豚肉から作られ、何百万家族の日曜の夕食であり続けています。\\n\\n茹でたジャガイモと炒めたザウアークラウトと一緒に提供されます。カリカリの衣と肉汁たっぷりの豚肉のコントラストがこの料理の特徴です。",
      tr: "Kotlet schabowy — Polonya şnitzeli — Polonya'nın ulusal domuz eti yemeğidir. Bir dilim domuz fileti ince dövülür, un, yumurta ve galeta unuyla kaplanır, ardından domuz yağı veya bitkisel yağda altın rengi ve çıtır çıtır olana kadar kızartılır. Viyana Şnitzeli'nden (dana eti) farklı olarak, Polonya kotleti her zaman domuz etinden yapılmıştır ve milyonlarca ailenin Pazar yemeği olmaya devam etmektedir.\\n\\nKlasik olarak haşlanmış patates ve sotelenmiş lahana turşusuyla servis edilir. Çıtır kabuk ile sulu domuz eti içinin karşıtlığı yemeğin belirleyici özelliğidir.",
      it: "Il kotlet schabowy — il vitello alla milanese polacco — è il piatto nazionale a base di maiale della Polonia. Una fettina di lonza di maiale viene battuta sottile, impanata in farina, uovo e pangrattato, poi fritta nel lardo o nell'olio fino a diventare dorata e croccante. A differenza del Wiener Schnitzel (vitello), il kotlet polacco è sempre stato di maiale e rimane il pranzo domenicale di milioni di famiglie.\\n\\nServito classicamente con patate lesse e crauti saltati. La crosta croccante contro l'interno succoso di maiale è il contrasto definitivo del piatto.",
      ko: "코틀렛 샤보비—폴란드식 슈니첼—는 폴란드의 국민 돼지고기 요리입니다. 돼지 등심 한 조각을 얇게 두드려 밀가루, 계란, 빵가루 순으로 입히고, 라드나 식용유에 황금색이 될 때까지 바삭하게 튀깁니다. 비엔나 슈니첼(송아지고기)과 달리 폴란드 코틀렛은 항상 돼지고기로 만들었으며, 수백만 가족의 일요일 저녁 식사로 자리잡고 있습니다.\\n\\n전통적으로 삶은 감자와 볶은 사우어크라우트와 함께 제공됩니다. 바삭한 겉껍질과 육즙 넘치는 속의 대비가 이 요리의 특징입니다.",
      hi: "कोटलेट श्चाबोवी — पोलैंड का श्निट्ज़ल — पोलैंड का राष्ट्रीय पोर्क व्यंजन है। पोर्क लॉइन के एक टुकड़े को पतला पीटा जाता है, आटे, अंडे और ब्रेडक्रम्ब में लपेटा जाता है, फिर लार्ड या तेल में सुनहरा और कुरकुरा होने तक तला जाता है। विनर श्निट्ज़ल (वील) के विपरीत, पोलिश कोटलेट हमेशा पोर्क से बना है और लाखों परिवारों का रविवार का डिनर बना हुआ है।\\n\\nपारंपरिक रूप से उबले आलू और भुनी सौर्क्राट के साथ परोसा जाता है। कुरकुरी परत और रसीली पोर्क के बीच का अंतर इस व्यंजन की पहचान है।"
    }'''
content = content.replace(old_155, new_155)

# ── ID 156 – Kimbap (South Korea) ─────────────────────────────────────────────
content = content.replace(
    '      ko: "대한민국"\n    },\n    name: {\n      ro: "Kimbap"',
    '      ko: "대한민국",\n      hi: "दक्षिण कोरिया"\n    },\n    name: {\n      ro: "Kimbap"'
)
content = content.replace(
    '      ko: "김밥"\n    },\n    category: {',
    '      ko: "김밥",\n      hi: "किम्बाप"\n    },\n    category: {'
)
content = content.replace(
    '      ko: "점심"\n    },\n    servings: 4,\n    tipType: \'def\',\n    pairingsType: \'korean\'',
    '      ko: "점심",\n      hi: "दोपहर का खाना"\n    },\n    servings: 4,\n    tipType: \'def\',\n    pairingsType: \'korean\''
)
content = content.replace(
    '      ko: ["단립 백미 2컵 (건조, ~4줄 분량)", "구운 김 4장 (20×18cm)", "단무지 4개, 김 길이로 잘라 준비", "어린 시금치 100g", "중간 크기 당근 2개, 채 썰기 (약 150g)", "큰 달걀 3개, 푼 것", "게맛살 200g (또는 익힌 햄), 세로로 반 가른 것", "참기름 2큰술", "고운 소금 1작은술", "볶은 통깨 1작은술", "김발 + 랩"]\n    },\n    howIsMade: {',
    '      ko: ["단립 백미 2컵 (건조, ~4줄 분량)", "구운 김 4장 (20×18cm)", "단무지 4개, 김 길이로 잘라 준비", "어린 시금치 100g", "중간 크기 당근 2개, 채 썰기 (약 150g)", "큰 달걀 3개, 푼 것", "게맛살 200g (또는 익힌 햄), 세로로 반 가른 것", "참기름 2큰술", "고운 소금 1작은술", "볶은 통깨 1작은술", "김발 + 랩"],\n      hi: ["छोटे दाने का सफेद चावल 2 कप (कच्चा, ~4 रोल के लिए)", "भुनी नोरी 4 शीट (20×18 सेमी)", "पीली मूली की अचार (दानमुजी) 4 पट्टियाँ, नोरी की लंबाई में", "बेबी पालक 100 ग्राम", "मध्यम गाजर 2, जूलियन कटी (लगभग 150 ग्राम)", "बड़े अंडे 3, फेंटे हुए", "नकली केकड़ा स्टिक 200 ग्राम (या पका हुआ हैम), लंबाई में काटा", "तिल का तेल 2 बड़े चम्मच", "बारीक नमक 1 छोटा चम्मच", "भुने तिल 1 छोटा चम्मच", "बांस की चटाई + प्लास्टिक रैप"]\n    },\n    howIsMade: {'
)
content = content.replace(
    '즉시 냅니다; 4시간 이내 식용 권장."\n    },\n    originText: {\n      ro: "Kimbap este',
    '즉시 냅니다; 4시간 이내 식용 권장.",\n      hi: "चावल 2¼ कप पानी में पकाएं। गर्म रहते हुए तिल का तेल, नमक और तिल मिलाएं। पालक, गाजर, अंडे की पट्टी तैयार करें। नोरी पर चावल फैलाएं, भराई रखें, रोल करें और 8 टुकड़ों में काटें।"\n    },\n    originText: {\n      ro: "Kimbap este'
)
old_156 = '''    originText: {
      ro: "Kimbap este o rețetă tradițională din Coreea de Sud.",
      en: "Kimbap is a traditional recipe from South Korea.",
      es: "Kimbap es una receta tradicional de Corea del Sur.",
      fr: "Kimbap est une recette traditionnelle de Corée du Sud.",
      de: "Kimbap ist ein traditionelles Rezept aus Südkorea.",
      pt: "Kimbap é uma receita tradicional da Coreia do Sul.",
      ru: "Кимбап — традиционный рецепт из Южной Кореи.",
      ar: "كيمباب هي وصفة تقليدية من كوريا الجنوبية.",
      zh: "紫菜包饭 是来自韩国的传统食谱。",
      ja: "キンパ は韓国の伝統的なレシピです。",
      tr: "Kimbap Güney Kore kökenli geleneksel bir tariftir.",
      it: "Kimbap è una ricetta tradizionale della Corea del Sud.",
      ko: "김밥은 대한민국의 전통 요리입니다."
    }'''
new_156 = '''    originText: {
      ro: "Kimbap — literal orez în alge de mare — este snack-ul național al Coreei de Sud și mâncarea perfectă pentru picnic, drum lung sau prânz rapid. Orezul cu ulei de susan se înfășoară cu diverse umpluturi (morcov, spanac, ouă, cârnați, danmuji, brânză) într-o foaie de nori și se taie în rondele. Seamănă vizual cu sushi, dar nu are oțet în orez și are un profil complet diferit de arome.\\n\\nKimbap a apărut în Coreea colonială japoneză (sec. XX) și a evoluat rapid în formă proprie. Azi există sute de variante: kimbap cu ton, cu kimchi, cu carne de vită bulgogi. Restaurantele kimbap sunt prezente pe fiecare stradă din Coreea și oferă cel mai bun raport calitate-preț din bucătăria coreeană.",
      en: "Kimbap — literally seaweed rice — is South Korea's national snack and the perfect food for picnics, long journeys, or a quick lunch. Sesame-oil seasoned rice is wrapped with various fillings (carrot, spinach, eggs, sausage, danmuji, cheese) in a nori sheet and sliced into rounds. It resembles sushi visually but has no vinegar in the rice and a completely different flavor profile.\\n\\nKimbap emerged in colonial Korea (20th century) and quickly evolved into its own form. Today there are hundreds of variants: tuna kimbap, kimchi kimbap, bulgogi beef kimbap. Kimbap restaurants appear on every street in Korea and offer the best value in Korean cuisine.",
      es: "El kimbap — literalmente arroz en alga — es el snack nacional de Corea del Sur y el alimento perfecto para picnics, viajes largos o un almuerzo rápido. El arroz sazonado con aceite de sésamo se envuelve con varios rellenos (zanahoria, espinaca, huevos, salchichas, danmuji, queso) en una hoja de nori y se corta en rodajas. Se parece visualmente al sushi pero no tiene vinagre en el arroz.\\n\\nEl kimbap surgió en la Corea colonial (siglo XX) y evolucionó rápidamente hacia su propia forma. Hoy existen cientos de variantes. Los restaurantes de kimbap aparecen en cada calle de Corea.",
      fr: "Le kimbap — littéralement riz aux algues — est le snack national de la Corée du Sud, parfait pour les pique-niques, les longs voyages ou un déjeuner rapide. Le riz assaisonné à l'huile de sésame est enroulé avec diverses garnitures dans une feuille de nori et découpé en rondelles. Il ressemble visuellement aux sushis mais ne contient pas de vinaigre dans le riz.\\n\\nLe kimbap est apparu dans la Corée coloniale (XXe siècle) et a rapidement évolué en sa propre forme. Il en existe aujourd'hui des centaines de variantes.",
      de: "Kimbap — wörtlich Meeresalgen-Reis — ist Südkoreas nationaler Snack und das perfekte Essen für Picknicks, lange Reisen oder ein schnelles Mittagessen. Mit Sesamöl gewürzter Reis wird mit verschiedenen Füllungen in einem Nori-Blatt gerollt und in Scheiben geschnitten. Es sieht Sushi ähnlich, hat aber keinen Essig im Reis.\\n\\nKimbap entstand im kolonialen Korea (20. Jahrhundert) und entwickelte sich schnell zu seiner eigenen Form. Heute gibt es hunderte Varianten.",
      pt: "Kimbap — literalmente arroz em algas — é o snack nacional da Coreia do Sul e o alimento perfeito para piqueniques, longas viagens ou um almoço rápido. O arroz temperado com óleo de gergelim é enrolado com vários recheios numa folha de nori e cortado em rodelas. Parece visualmente com sushi mas não tem vinagre no arroz.\\n\\nO kimbap surgiu na Coreia colonial (século XX) e rapidamente evoluiu para a sua própria forma. Existem hoje centenas de variantes.",
      ru: "Кимбап — буквально «рис в водорослях» — национальный снэк Южной Кореи и идеальная еда для пикников, дальних поездок или быстрого обеда. Рис, приправленный кунжутным маслом, заворачивается с разными начинками в лист нори и нарезается кружочками. Внешне похож на суши, но не содержит уксуса в рисе и имеет совершенно другой вкусовой профиль.\\n\\nКимбап появился в колониальной Корее (ХХ в.) и быстро обрёл собственную форму. Сегодня существуют сотни вариантов.",
      ar: "كيمباب — أرز الأعشاب البحرية حرفياً — هو وجبة خفيفة كورية جنوبية تُعدّ مثالية للنزهات والرحلات الطويلة أو الغداء السريع. يُلف الأرز المتبل بزيت السمسم مع حشوات متنوعة (جزر، سبانخ، بيض، سجق، دانموجي، جبن) في ورقة نوري ويُقطع دوائر. يشبه السوشي بصرياً لكنه لا يحتوي على خل في الأرز.\\n\\nظهر الكيمباب في كوريا المستعمَرة (القرن العشرين) وتطوّر بسرعة إلى شكله الخاص. توجد اليوم مئات المتغيرات.",
      zh: "紫菜包饭——字面意思是海藻米饭——是韩国的国家小吃，也是野餐、长途旅行或快速午餐的完美食物。用芝麻油调味的米饭包上各种馅料（胡萝卜、菠菜、鸡蛋、香肠、檀味萝卜、奶酪）卷在海苔里切成圆片。外观类似寿司，但米饭中没有醋，风味完全不同。\\n\\n紫菜包饭出现于殖民时期的朝鲜（20世纪），很快发展成自己的形式。如今有数百种变体，紫菜包饭餐厅遍布韩国每条街道。",
      ja: "キンパ——文字通り海苔ご飯——は韓国の国民的スナックで、ピクニック、長旅、または素早いランチに最適な食べ物です。ごま油で味付けしたご飯に様々な具材（にんじん、ほうれん草、卵、ソーセージ、たくあん、チーズ）を包んで海苔で巻き、輪切りにします。見た目は寿司に似ていますが、ご飯に酢を使わず、全く異なる風味です。\\n\\nキンパは植民地時代の朝鮮（20世紀）に登場し、すぐに独自の形に進化しました。今日では何百もの種類があります。",
      tr: "Kimbap — kelime anlamıyla deniz yosunu pirinci — Güney Kore'nin ulusal atıştırmalığıdır; piknikler, uzun yolculuklar veya hızlı öğle yemekleri için mükemmeldir. Susam yağıyla tatlandırılmış pirinç, çeşitli iç malzemelerle (havuç, ıspanak, yumurta, sosis, danmuji, peynir) nori yaprağına sarılır ve dilimler halinde kesilir. Görsel olarak sushiye benzer ama pirinçte sirke yoktur.\\n\\nKimbap sömürge Kore'sinde (20. yüzyıl) ortaya çıkmış ve hızla kendi formuna kavuşmuştur. Bugün yüzlerce çeşidi mevcuttur.",
      it: "Il kimbap — letteralmente riso alle alghe — è lo snack nazionale della Corea del Sud e il cibo perfetto per picnic, lunghi viaggi o un pranzo veloce. Il riso condito con olio di sesamo viene avvolto con vari ripieni in un foglio di nori e tagliato a rondelle. Somiglia visivamente al sushi ma non ha aceto nel riso e ha un profilo aromatico completamente diverso.\\n\\nIl kimbap è apparso nella Corea coloniale (XX secolo) e si è evoluto rapidamente in una forma propria. Oggi esistono centinaia di varianti.",
      ko: "김밥—문자 그대로 '김과 밥'—은 한국의 국민 간식이자 소풍, 장거리 여행, 빠른 점심으로 완벽한 음식입니다. 참기름으로 양념한 밥을 다양한 속재료(당근, 시금치, 계란, 소시지, 단무지, 치즈)와 함께 김에 싸서 둥글게 자릅니다. 겉모습은 스시와 비슷하지만 밥에 식초를 넣지 않아 전혀 다른 풍미를 가집니다.\\n\\n김밥은 일제강점기(20세기)에 등장해 빠르게 독자적인 형태로 발전했습니다. 오늘날 참치김밥, 김치김밥, 불고기김밥 등 수백 가지 변형이 있으며, 김밥집은 한국 모든 거리에 있습니다.",
      hi: "किम्बाप — शाब्दिक अर्थ समुद्री शैवाल चावल — दक्षिण कोरिया का राष्ट्रीय स्नैक है और पिकनिक, लंबी यात्राओं या त्वरित दोपहर के भोजन के लिए उत्तम भोजन है। तिल के तेल से तैयार चावल को विभिन्न भराई (गाजर, पालक, अंडे, सॉसेज, दानमुजी, पनीर) के साथ नोरी शीट में लपेटा जाता है और गोल टुकड़ों में काटा जाता है। यह सुशी जैसा दिखता है लेकिन चावल में सिरका नहीं होता।\\n\\nकिम्बाप औपनिवेशिक कोरिया (20वीं सदी) में उभरा और जल्दी अपने रूप में विकसित हुआ। आज सैकड़ों किस्में हैं और किम्बाप रेस्तरां कोरिया की हर सड़क पर मिलते हैं।"
    }'''
content = content.replace(old_156, new_156)

# ── ID 157 – Pastel de Choclo (Chile) ─────────────────────────────────────────
content = content.replace(
    '      ko: "칠레"\n    },\n    name: {\n      ro: "Pastel de Choclo"',
    '      ko: "칠레",\n      hi: "चिली"\n    },\n    name: {\n      ro: "Pastel de Choclo"'
)
content = content.replace(
    '      ko: "파스텔 데 초클로"\n    },\n    category: {',
    '      ko: "파스텔 데 초클로",\n      hi: "पास्टेल दे चोक्लो"\n    },\n    category: {'
)
content = content.replace(
    '      ko: "저녁"\n    },\n    ingredients: {\n      ro: ["porumb", "carne tocată", "ceapă", "ouă", "măsline"',
    '      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    ingredients: {\n      ro: ["porumb", "carne tocată", "ceapă", "ouă", "măsline"'
)
content = content.replace(
    '      ko: ["옥수수", "간 고기", "양파", "계란", "올리브", "건포도", "우유", "버터", "향신료"]\n    },\n    howIsMade: {',
    '      ko: ["옥수수", "간 고기", "양파", "계란", "올리브", "건포도", "우유", "버터", "향신료"],\n      hi: ["मकई", "कीमा", "प्याज़", "अंडे", "जैतून", "किशमिश", "दूध", "मक्खन", "मसाले"]\n    },\n    howIsMade: {'
)
content = content.replace(
    '      ko: "양파와 고기를 볶고 향신료를 넣어 그릇에 담은 뒤, 옥수수 퓨레를 덮어 오븐에서 굽습니다."\n    },\n    originText: {\n      ro: "Pastel de Choclo este',
    '      ko: "양파와 고기를 볶고 향신료를 넣어 그릇에 담은 뒤, 옥수수 퓨레를 덮어 오븐에서 굽습니다.",\n      hi: "प्याज़ और मांस भूनें, मसाले डालें, बर्तन में रखें, मकई की प्यूरी से ढकें और ओवन में बेक करें।"\n    },\n    originText: {\n      ro: "Pastel de Choclo este'
)
old_157 = '''    originText: {
      ro: "Pastel de Choclo este o rețetă tradițională din Chile.",
      en: "Pastel de Choclo is a traditional recipe from Chile.",
      es: "Pastel de Choclo es una receta tradicional de Chile.",
      fr: "Pastel de Choclo est une recette traditionnelle du Chili.",
      de: "Pastel de Choclo ist ein traditionelles Rezept aus Chile.",
      pt: "Pastel de Choclo é uma receita tradicional do Chile.",
      ru: "Пастель де Чокло — традиционный рецепт из Чили.",
      ar: "باستيل دي تشوكو هي وصفة تقليدية من تشيلي.",
      zh: "智利玉米饼 是来自智利的传统食谱。",
      ja: "パステル・デ・チョクロ はチリの伝統的なレシピです。",
      tr: "Pastel de Choclo Şili kökenli geleneksel bir tariftir.",
      it: "Pastel de Choclo è una ricetta tradizionale del Cile.",
      ko: "파스텔 데 초클로는 칠레의 전통 요리입니다."
    }'''
new_157 = '''    originText: {
      ro: "Pastel de choclo este plăcinta națională de porumb a Chile-ului — un vas de lut în care pui fiert cu ceapă, măsline, ouă fierte și stafide se ascunde sub un strat gros de piure de porumb proaspăt (choclo) fiert cu lapte și unt, apoi se coace la cuptor până capătă o crustă caramelizată presărată cu zahăr. Combinația dulce-sărat — stafidele în umplutura de carne, zahărul pe crustă — este marcă înregistrată a bucătăriei andine.\\n\\nPastel de choclo este mâncare de vară, când porumbul dulce este la apogeu. Se servește direct din vasul de lut în care s-a copt. La masă comună, fiecare comesean rupe crusta caramelizată cu lingura, amestecând-o cu umplutura de dedesubt. Este prezent la fiecare reuniune familială chileoastră și sărbătoare națională.",
      en: "Pastel de choclo is Chile's national corn pie — a clay pot in which boiled chicken with onion, olives, hard-boiled eggs, and raisins hides under a thick layer of fresh corn purée (choclo) cooked with milk and butter, then baked until a caramelized crust forms, dusted with sugar. The sweet-savory combination — raisins in the meat filling, sugar on the crust — is a trademark of Andean cuisine.\\n\\nPastel de choclo is summer food, when sweet corn is at its peak. It is served directly from the clay pot it baked in. At the table, each diner breaks the caramelized crust with a spoon, mixing it with the filling underneath. It is present at every Chilean family gathering and national celebration.",
      es: "El pastel de choclo es el pastel de maíz nacional de Chile — una cazuela de barro en la que pollo hervido con cebolla, aceitunas, huevos cocidos y pasas se esconde bajo una gruesa capa de puré de maíz fresco (choclo) cocido con leche y mantequilla, luego horneado hasta formar una costra caramelizada espolvoreada con azúcar. La combinación dulce-salado es marca registrada de la cocina andina.\\n\\nEl pastel de choclo es comida de verano, cuando el maíz dulce está en su apogeo. Se sirve directamente en la cazuela en que se coció. Está presente en toda reunión familiar chilena.",
      fr: "Le pastel de choclo est la tarte nationale au maïs du Chili — une cocotte en terre cuite dans laquelle du poulet bouilli avec oignon, olives, œufs durs et raisins secs se cache sous une épaisse couche de purée de maïs frais (choclo) cuite avec du lait et du beurre, puis cuite au four jusqu'à former une croûte caramélisée saupoudrée de sucre. La combinaison sucré-salé est une marque de la cuisine andine.\\n\\nLe pastel de choclo est un plat d'été, quand le maïs sucré est à son apogée. Il se sert directement dans la cocotte de cuisson.",
      de: "Pastel de choclo ist Chiles nationaler Maiskuchen — ein Tontopf, in dem gekochtes Hähnchen mit Zwiebeln, Oliven, hartgekochten Eiern und Rosinen unter einer dicken Schicht frischem Maispüree (choclo) mit Milch und Butter liegt, dann gebacken bis eine karamellisierte, gezuckerte Kruste entsteht. Die süß-herzhafte Kombination ist Markenzeichen der Andenküche.\\n\\nPastel de choclo ist Sommeressen, wenn süßer Mais seinen Höhepunkt erreicht. Es wird direkt in der Backkasserolle serviert.",
      pt: "O pastel de choclo é a torta nacional de milho do Chile — uma tigela de barro em que frango cozido com cebola, azeitonas, ovos cozidos e passas se esconde sob uma grossa camada de purê de milho fresco (choclo) cozido com leite e manteiga, depois assado até formar uma crosta caramelizada polvilhada com açúcar. A combinação doce-salgada é marca registada da cozinha andina.\\n\\nO pastel de choclo é comida de verão, quando o milho doce está no auge. Serve-se diretamente na tigela em que foi assado.",
      ru: "Пастель де чокло — национальный кукурузный пирог Чили: глиняный горшок, в котором под толстым слоем пюре из свежей кукурузы (чокло) с молоком и маслом прячется тушёная курица с луком, оливками, варёными яйцами и изюмом. Запекают до образования карамелизированной корочки, посыпанной сахаром. Сочетание сладкого и солёного — изюм в начинке, сахар на корочке — фирменный знак андской кухни.\\n\\nПастель де чокло — летняя еда, когда сладкая кукуруза в лучшей форме. Подают прямо в горшке, в котором запекали.",
      ar: "باستيل دي تشوكو هي فطيرة الذرة الوطنية التشيلية — وعاء فخاري يختبئ فيه دجاج مسلوق مع بصل وزيتون وبيض مسلوق وزبيب تحت طبقة سميكة من هريس الذرة الطازجة (تشوكو) المطبوخة بالحليب والزبدة، ثم تُخبز حتى تتكون قشرة مكرملة مرشوشة بالسكر. الجمع بين الحلو والمالح علامة مميزة للمطبخ الأندي.\\n\\nهي طعام صيفي حين يكون الذرة الحلو في ذروته. تُقدَّم مباشرة من الوعاء الذي خُبزت فيه.",
      zh: "奇洛玉米饼是智利的国家玉米派——陶锅中，煮熟的鸡肉与洋葱、橄榄、水煮蛋和葡萄干藏在厚厚的新鲜玉米泥（choclo）层下，加牛奶和黄油烹制，然后烘烤至表面形成撒糖的焦糖外皮。甜咸结合——肉馅中的葡萄干、外皮上的糖——是安第斯美食的标志。\\n\\n奇洛玉米饼是夏季食物，甜玉米正当时。直接从烤锅中取出上桌食用。",
      ja: "パステル・デ・チョクロはチリの国民的コーンパイです——土鍋の中に玉ねぎ、オリーブ、ゆで卵、レーズンと一緒に煮た鶏肉が、牛乳とバターで調理した新鮮なコーンピューレ（チョクロ）の厚い層の下に隠れており、砂糖をまぶしたカラメル化した皮が形成されるまで焼きます。甘じょっぱい組み合わせはアンデス料理の特徴です。\\n\\nパステル・デ・チョクロは甘いトウモロコシが最盛期を迎える夏の料理です。焼いた土鍋のまま提供されます。",
      tr: "Pastel de choclo, Şili'nin ulusal mısır turtasıdır — bir kil kap içinde soğan, zeytin, haşlanmış yumurta ve kuru üzümle haşlanmış tavuk, süt ve tereyağıyla pişirilmiş kalın bir taze mısır püresi (choclo) tabakasının altına gizlenir, ardından şeker serpiştirilerek karamelleşmiş bir kabuk oluşana kadar fırınlanır. Tatlı-tuzlu kombinasyon Andin mutfağının markasıdır.\\n\\nPastel de choclo, tatlı mısırın en iyi döneminde yenilen yaz yemeğidir. Pişirildiği kil kaptan doğrudan servis edilir.",
      it: "Il pastel de choclo è la torta di mais nazionale del Cile — una pentola di terracotta in cui pollo bollito con cipolla, olive, uova sode e uvetta si nasconde sotto un denso strato di purè di mais fresco (choclo) cotto con latte e burro, poi cotto in forno fino a formare una crosta caramellata spolverata di zucchero. La combinazione dolce-salata è il marchio della cucina andina.\\n\\nIl pastel de choclo è cibo estivo, quando il mais dolce è al suo apice. Si serve direttamente nella pentola di cottura.",
      ko: "파스텔 데 초클로는 칠레의 국민 옥수수 파이입니다. 양파, 올리브, 삶은 달걀, 건포도와 함께 삶은 닭고기를 우유와 버터로 끓인 신선한 옥수수 퓨레(초클로) 두꺼운 층 아래에 담고, 오븐에서 설탕을 뿌린 캐러멜화된 껍질이 생길 때까지 굽습니다. 고기 속재료의 건포도와 껍질 위의 설탕이 만드는 달콤하고 짭짤한 조합이 안데스 요리의 특색입니다.\\n\\n파스텔 데 초클로는 달콤한 옥수수가 절정인 여름 음식입니다. 구운 도기 그릇에 그대로 내어집니다.",
      hi: "पास्टेल दे चोक्लो चिली का राष्ट्रीय मकई पाई है — एक मिट्टी के बर्तन में उबले चिकन के साथ प्याज़, जैतून, उबले अंडे और किशमिश दूध-मक्खन में पकाई गई ताज़ी मकई की प्यूरी (चोक्लो) की मोटी परत के नीचे छिपे होते हैं, फिर चीनी छिड़ककर कैरेमेलाइज़्ड क्रस्ट बनने तक बेक किया जाता है। मीठा-नमकीन संयोजन — मांस में किशमिश, ऊपर चीनी — एंडियन व्यंजन की पहचान है।\\n\\nयह गर्मियों का भोजन है जब मीठी मकई अपने शिखर पर होती है। जिस मिट्टी के बर्तन में बेक हुई, उसी में परोसी जाती है।"
    }'''
content = content.replace(old_157, new_157)

# ── ID 158 – Pljeskavica (Serbia) ─────────────────────────────────────────────
content = content.replace(
    '      ko: "세르비아"\n    },\n    name: {\n      ro: "Pljeskavica"',
    '      ko: "세르비아",\n      hi: "सर्बिया"\n    },\n    name: {\n      ro: "Pljeskavica"'
)
content = content.replace(
    '      ko: "플레스카비차"\n    },\n    category: {',
    '      ko: "플레스카비차",\n      hi: "प्लजेस्काविका"\n    },\n    category: {'
)
content = content.replace(
    '      ko: "저녁"\n    },\n    ingredients: {\n      ro: ["carne tocată", "ceapă", "usturoi", "boia"',
    '      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    ingredients: {\n      ro: ["carne tocată", "ceapă", "usturoi", "boia"'
)
content = content.replace(
    '      ko: ["다진 고기", "양파", "마늘", "파프리카 가루", "후추", "소금", "기름"]\n    },\n    howIsMade: {',
    '      ko: ["다진 고기", "양파", "마늘", "파프리카 가루", "후추", "소금", "기름"],\n      hi: ["कीमा", "प्याज़", "लहसुन", "पापरिका", "काली मिर्च", "नमक", "तेल"]\n    },\n    howIsMade: {'
)
content = content.replace(
    '      ko: "재료를 섞어 큰 패티를 만들고, 프라이팬에 굽거나 그릴에 구워 샐러드나 빵과 함께 냅니다."\n    },\n    originText: {\n      ro: "Pljeskavica este',
    '      ko: "재료를 섞어 큰 패티를 만들고, 프라이팬에 굽거나 그릴에 구워 샐러드나 빵과 함께 냅니다.",\n      hi: "सामग्री मिलाएं, बड़े पैटी बनाएं, ग्रिल करें और सलाद या रोटी के साथ परोसें।"\n    },\n    originText: {\n      ro: "Pljeskavica este'
)
old_158 = '''    originText: {
      ro: "Pljeskavica este o rețetă tradițională din Serbia.",
      en: "Pljeskavica is a traditional recipe from Serbia.",
      es: "Pljeskavica es una receta tradicional de Serbia.",
      fr: "Pljeskavica est une recette traditionnelle de Serbie.",
      de: "Pljeskavica ist ein traditionelles Rezept aus Serbien.",
      pt: "Pljeskavica é uma receita tradicional da Sérvia.",
      ru: "Плескавица — традиционный рецепт из Сербии.",
      ar: "بلييسكافيكا هي وصفة تقليدية من صربيا.",
      zh: "塞尔维亚烤肉饼 是来自塞尔维亚的传统食谱。",
      ja: "プリェスカヴィツァ はセルビアの伝統的なレシピです。",
      tr: "Pljeskavica Sırbistan kökenli geleneksel bir tariftir.",
      it: "Pljeskavica è una ricetta tradizionale della Serbia.",
      ko: "플레스카비차는 세르비아의 전통 요리입니다."
    }'''
new_158 = '''    originText: {
      ro: "Pljeskavica este hamburgerul național al Serbiei — un pateu plat și larg din carne tocată mixtă (vită, porc, miel) cu ceapă, usturoi și boia, fript pe jar la temperaturi mari. Este mai mare și mai subțire decât un burger american și are o textură distinctă: exterior carbonizat, interior suculent. Unele variante conțin brânză (punjene) sau ardei iute (ljuta).\\n\\nSe servește în somun (lipie) cu ajvar, kajmak (smântână grasă fermentată), ceapă tocată și salată. Pljeskavica este mâncarea stradală numărul unu din Serbia și din toată fosta Iugoslavie. La Leskovac, orașul de sud al Serbiei, există un festival anual dedicat acestui preparat, unde se organizează competiții de cel mai mare și cel mai gustos pljeskavica.",
      en: "Pljeskavica is Serbia's national burger — a wide, flat patty of mixed minced meat (beef, pork, lamb) with onion, garlic, and paprika, grilled over high heat on charcoal. It is larger and flatter than an American burger and has a distinctive texture: charred exterior, juicy interior. Some variants contain cheese (punjene) or hot peppers (ljuta).\\n\\nServed in somun flatbread with ajvar, kajmak (fermented fatty cream), chopped onion, and salad. Pljeskavica is the number-one street food in Serbia and across former Yugoslavia. In Leskovac, a southern Serbian city, an annual festival is dedicated to this dish, with competitions for the largest and tastiest pljeskavica.",
      es: "La pljeskavica es la hamburguesa nacional de Serbia — una hamburguesa plana y ancha de carne picada mixta (res, cerdo, cordero) con cebolla, ajo y pimentón, asada a alta temperatura en carbón. Es más grande y plana que una hamburguesa americana y tiene una textura característica: exterior carbonizado, interior jugoso. Algunas variantes contienen queso (punjene) o pimiento picante (ljuta).\\n\\nSe sirve en pan somun con ajvar, kajmak, cebolla picada y ensalada. Es la comida callejera número uno en Serbia y la ex Yugoslavia.",
      fr: "La pljeskavica est le burger national de la Serbie — un steak haché plat et large de viande mixte hachée (bœuf, porc, agneau) avec oignon, ail et paprika, grillé à haute température sur charbon. Plus grand et plus plat qu'un burger américain, il a une texture distinctive : extérieur carbonisé, intérieur juteux. Certaines variantes contiennent du fromage (punjene) ou du piment (ljuta).\\n\\nServi dans du pain somun avec ajvar, kajmak, oignon haché et salade. C'est la street food numéro un en Serbie et dans l'ex-Yougoslavie.",
      de: "Pljeskavica ist Serbiens nationaler Burger — ein breiter, flacher Hackfleischpatty aus gemischtem Fleisch (Rind, Schwein, Lamm) mit Zwiebeln, Knoblauch und Paprika, bei hoher Hitze über Holzkohle gegrillt. Größer und flacher als ein amerikanischer Burger mit charakteristischer Textur: verkohltes Äußeres, saftiges Inneres. Einige Varianten enthalten Käse (punjene) oder scharfe Paprika (ljuta).\\n\\nServiert in Somun-Fladenbrot mit Ajvar, Kajmak, gehackten Zwiebeln und Salat. Pljeskavica ist das Straßenessen Nummer eins in Serbien und im ehemaligen Jugoslawien.",
      pt: "A pljeskavica é o hambúrguer nacional da Sérvia — um patê plano e largo de carne moída mista (vaca, porco, cordeiro) com cebola, alho e páprica, grelhado a alta temperatura em carvão. É maior e mais plano do que um hambúrguer americano e tem uma textura distintiva: exterior carbonizado, interior suculento. Algumas variantes contêm queijo (punjene) ou pimenta picante (ljuta).\\n\\nServido em pão somun com ajvar, kajmak, cebola picada e salada. É a street food número um na Sérvia e na ex-Jugoslávia.",
      ru: "Плескавица — национальный бургер Сербии: широкая плоская котлета из смешанного фарша (говядина, свинина, баранина) с луком, чесноком и паприкой, жаренная на сильном жаре на углях. Больше и тоньше американского бургера, с характерной текстурой: обугленная снаружи, сочная внутри. Некоторые варианты содержат сыр (пуњене) или острый перец (ljuta).\\n\\nПодают в лепёшке сомун с аджваром, каймаком, рубленым луком и салатом. Плескавица — уличная еда номер один в Сербии и всей бывшей Югославии.",
      ar: "البليسكافيكا هي البرغر الوطني لصربيا — شريحة لحم مسطحة عريضة من اللحم المفروم المختلط (بقر وخنزير وضأن) مع البصل والثوم والفلفل الحلو، تُشوى على حرارة عالية فوق الفحم. أكبر وأرق من البرغر الأمريكي وذات ملمس مميز: خارج محروق وداخل عصير. بعض المتغيرات تحتوي على جبن (بونييني) أو فلفل حار.\\n\\nتُقدَّم في خبز السومون مع أجفار وكايماك وبصل مفروم وسلطة. هي الطعام الشارعي الأول في صربيا ويوغوسلافيا السابقة.",
      zh: "普里耶斯卡维察是塞尔维亚的国家汉堡——用混合碎肉（牛肉、猪肉、羊肉）加洋葱、大蒜和辣椒粉制成宽而扁的肉饼，在木炭上高温烤制。比美式汉堡更大更扁，外皮略焦，内部多汁。有些版本含奶酪（punjene）或辣椒（ljuta）。\\n\\n搭配索蒙面饼、阿伊瓦尔、凯马克（发酵奶油）、碎洋葱和沙拉食用。这是塞尔维亚及前南斯拉夫的头号街头食品。",
      ja: "プリェスカヴィツァはセルビアの国民的バーガーです——牛肉・豚肉・羊肉の混合ひき肉に玉ねぎ、ニンニク、パプリカを加えた幅広く薄い肉パティを炭火の高温でグリルします。アメリカのバーガーより大きく薄く、独特の食感があります：外側は焦げ目がつき、内側はジューシー。一部の種類にはチーズ（プンジェネ）や辛いピーマン（リュタ）が含まれます。\\n\\nソムン（フラットブレッド）にアイバル、カイマク、刻み玉ねぎ、サラダと共に提供されます。セルビアおよび旧ユーゴスラビア全土でNo.1のストリートフードです。",
      tr: "Pljeskavica, Sırbistan'ın ulusal burgeridır — karışık kıyılmış etten (dana eti, domuz eti, kuzu eti) soğan, sarımsak ve kırmızı biberle hazırlanmış geniş ve yassı bir köfte, kömür üzerinde yüksek ısıda ızgarada pişirilir. Amerikan burgerinden daha büyük ve daha yassıdır; belirgin bir doku vardır: dışı hafif yanık, içi sulu. Bazı çeşitleri peynir (punjene) veya acı biber (ljuta) içerir.\\n\\nSomun ekmeğinde ajvar, kajmak, doğranmış soğan ve salatayla servis edilir. Sırbistan ve eski Yugoslavya'nın bir numaralı sokak yemeğidir.",
      it: "La pljeskavica è il burger nazionale della Serbia — un hamburger piatto e largo di carne macinata mista (manzo, maiale, agnello) con cipolla, aglio e paprika, grigliato ad alta temperatura sulla brace. È più grande e piatto di un burger americano e ha una texture distintiva: esterno carbonizzato, interno succoso. Alcune varianti contengono formaggio (punjene) o peperoncino (ljuta).\\n\\nServita in pane somun con ajvar, kajmak, cipolla tritata e insalata. È il fast food di strada numero uno in Serbia e in tutta l'ex Jugoslavia.",
      ko: "플레스카비차는 세르비아의 국민 버거입니다. 다진 소고기·돼지고기·양고기를 양파, 마늘, 파프리카와 섞어 만든 크고 납작한 패티를 숯불에서 고온으로 굽습니다. 미국식 버거보다 크고 얇으며, 겉은 약간 탄 듯하고 속은 육즙이 넘치는 독특한 질감이 있습니다. 치즈 들어간 '푼예네'나 매운 '류타' 등 변형도 있습니다.\\n\\n소문(납작한 빵)에 아이바르, 카이막, 다진 양파, 샐러드와 함께 냅니다. 세르비아와 옛 유고슬라비아 전역에서 가장 인기 있는 길거리 음식입니다.",
      hi: "प्लजेस्काविका सर्बिया का राष्ट्रीय बर्गर है — मिश्रित कीमे (बीफ, पोर्क, मेमना) से बना चौड़ा, चपटा पैटी जिसमें प्याज़, लहसुन और पापरिका होता है, कोयले पर तेज़ आँच पर ग्रिल किया जाता है। यह अमेरिकी बर्गर से बड़ा और चपटा होता है और इसकी बनावट अलग होती है: बाहर से थोड़ा जला हुआ, अंदर से रसीला। कुछ किस्मों में पनीर (पुन्येने) या तीखी मिर्च (ल्युटा) होती है।\\n\\nसोमुन (फ्लैटब्रेड) में अज्वार, काइमाक (किण्वित मलाई), कटे प्याज़ और सलाद के साथ परोसी जाती है। यह सर्बिया और पूर्व युगोस्लाविया में नंबर वन स्ट्रीट फूड है।"
    }'''
content = content.replace(old_158, new_158)

# ── ID 159 – Poffertjes (Netherlands) ─────────────────────────────────────────
content = content.replace(
    '      ko: "네덜란드"\n    },\n    name: {\n      ro: "Poffertjes"',
    '      ko: "네덜란드",\n      hi: "नीदरलैंड"\n    },\n    name: {\n      ro: "Poffertjes"'
)
content = content.replace(
    '      ko: "포퍼르체스"\n    },\n    category: {',
    '      ko: "포퍼르체스",\n      hi: "पॉफर्चेस"\n    },\n    category: {'
)
content = content.replace(
    '      ko: "디저트"\n    },\n    ingredients: {\n      ro: ["făină", "lapte", "ouă", "drojdie"',
    '      ko: "디저트",\n      hi: "मिठाई"\n    },\n    ingredients: {\n      ro: ["făină", "lapte", "ouă", "drojdie"'
)
content = content.replace(
    '      ko: ["밀가루", "우유", "계란", "이스트", "설탕", "버터", "소금"]\n    },\n    howIsMade: {',
    '      ko: ["밀가루", "우유", "계란", "이스트", "설탕", "버터", "소금"],\n      hi: ["आटा", "दूध", "अंडे", "खमीर", "चीनी", "मक्खन", "नमक"]\n    },\n    howIsMade: {'
)
content = content.replace(
    '      ko: "재료를 섞어 발효시킨 후, 특수 팬에 구워 버터와 슈거파우더를 뿌려 냅니다."\n    },\n    originText: {\n      ro: "Poffertjes este',
    '      ko: "재료를 섞어 발효시킨 후, 특수 팬에 구워 버터와 슈거파우더를 뿌려 냅니다.",\n      hi: "सामग्री मिलाएं, उठने दें, विशेष पैन में पकाएं और मक्खन और पाउडर शुगर के साथ परोसें।"\n    },\n    originText: {\n      ro: "Poffertjes este'
)

# Need to get exact ending of Poffertjes originText to see what's there
old_159_stub_start = '    originText: {\n      ro: "Poffertjes este o rețetă tradițională din Olanda."'
# Read current content to confirm
if old_159_stub_start not in content:
    print("WARNING: ID 159 originText stub not found!")

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("IDs 155-158 done (159 fields done, originText pending)")
