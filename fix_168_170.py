with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ── ID 168 Shepherd's Pie (UK) ────────────────────────────────────

content = content.replace(
    '      ko: "영국"\n    },\n    name: {\n      ro: "Plăcintă a ciobanului"',
    '      ko: "영국",\n      hi: "यूनाइटेड किंगडम"\n    },\n    name: {\n      ro: "Plăcintă a ciobanului"'
)
content = content.replace(
    '      ko: "셰퍼즈 파이"\n    },\n    category: {',
    '      ko: "셰퍼즈 파이",\n      hi: "शेफर्ड्स पाई"\n    },\n    category: {'
)
content = content.replace(
    '      ko: "점심"\n    },\n    ingredients: {\n      ro: ["carne tocată de miel"',
    '      ko: "점심",\n      hi: "दोपहर का खाना"\n    },\n    ingredients: {\n      ro: ["carne tocată de miel"'
)
content = content.replace(
    '      ko: ["다진 양고기", "감자", "당근", "완두콩", "양파", "버터", "우유"]\n    },\n    howIsMade: {',
    '      ko: ["다진 양고기", "감자", "당근", "완두콩", "양파", "버터", "우유"],\n      hi: ["कीमा मेमना", "आलू", "गाजर", "मटर", "प्याज़", "मक्खन", "दूध"]\n    },\n    howIsMade: {'
)
content = content.replace(
    '      ko: "다진 양고기와 채소를 볶은 후 오븐 용기에 담고, 위에 으깬 감자를 올려 황금빛이 될 때까지 오븐에서 굽습니다."\n    },\n    originText: {\n      ro: "Plăcinta ciobanului este',
    '      ko: "다진 양고기와 채소를 볶은 후 오븐 용기에 담고, 위에 으깬 감자를 올려 황금빛이 될 때까지 오븐에서 굽습니다.",\n      hi: "मेमने का कीमा सब्जियों के साथ भूनें, बेकिंग डिश में रखें, ऊपर मसले आलू लगाएं और सुनहरा होने तक बेक करें।"\n    },\n    originText: {\n      ro: "Plăcinta ciobanului este'
)

old_168 = '''    originText: {
      ro: "Plăcinta ciobanului este o rețetă tradițională din Marea Britanie.",
      en: "Shepherd's Pie is a traditional recipe from United Kingdom.",
      es: "Pastel de pastor es una receta tradicional de Reino Unido.",
      fr: "Hachis parmentier est une recette traditionnelle du Royaume-Uni.",
      de: "Shepherd's Pie ist ein traditionelles Rezept aus dem Vereinigten Königreich.",
      pt: "Torta do Pastor é uma receita tradicional do Reino Unido.",
      ru: "Пастуший пирог — традиционный рецепт из Великобритании.",
      ar: "فطيرة الراعي هي وصفة تقليدية من المملكة المتحدة.",
      zh: "牧羊人派 是来自英国的传统食谱。",
      ja: "シェパーズパイ はイギリスの伝統的なレシピです。",
      tr: "Çoban Turtası, Birleşik Krallık kökenli geleneksel bir tariftir.",
      it: "Torta del Pastore è una ricetta tradizionale del Regno Unito.",
      ko: "셰퍼즈 파이는 영국의 전통 요리입니다."
    }'''

new_168 = '''    originText: {
      ro: "Plăcinta ciobanului (Shepherd's Pie) este o mâncare tradițională britanică de iarnă — un strat de carne tocată de miel cu morcovi, mazăre și ceapă, acoperit cu piure de cartofi auriu la cuptor. Denumirea indică originea: preparatul era mâncarea economică a ciobanilor, fabricat din resturile de miel rămase din duminică.\\n\\nÎn tradiția britanică, distincția terminologică e importantă: cu miel se numește shepherd's pie, cu vită se numește cottage pie. Ambele sunt comfort food britanic clasic, prezente pe meniurile de pub și în mesele de casă din toată Marea Britanie, mai ales toamna și iarna.",
      en: "Shepherd's Pie is a traditional British winter dish — a layer of minced lamb with carrots, peas, and onion, topped with a golden mashed potato crust baked until crisp. Its name reflects its origin: it was the economical food of shepherds, made from leftover lamb after Sunday's roast.\\n\\nIn British tradition, the terminology matters: made with lamb it is shepherd's pie, made with beef it is cottage pie. Both are classic British comfort food, found on pub menus and in home kitchens across the United Kingdom, especially in autumn and winter.",
      es: "El pastel de pastor es un plato británico de invierno — una capa de carne de cordero picada con zanahorias, guisantes y cebolla, cubierta con una costra dorada de puré de patatas al horno. Su nombre refleja su origen: era la comida económica de los pastores, hecha con las sobras del cordero asado del domingo.\\n\\nEn la tradición británica, la terminología importa: con cordero se llama shepherd's pie, con ternera se llama cottage pie. Ambos son comfort food clásico británico, presentes en los menús de pub y en las cocinas domésticas del Reino Unido, especialmente en otoño e invierno.",
      fr: "Le Shepherd's Pie est un plat hivernal britannique — une couche de viande de mouton hachée avec carottes, petits pois et oignon, recouverte d'une croûte dorée de purée de pommes de terre gratinée au four. Son nom reflète son origine: nourriture économique des bergers, préparée avec les restes du rôti dominical.\\n\\nDans la tradition britannique, la terminologie compte: avec de l'agneau c'est le shepherd's pie, avec du boeuf c'est le cottage pie. Les deux sont le comfort food classique britannique, présents sur les menus des pubs et dans les cuisines familiales du Royaume-Uni.",
      de: "Shepherd's Pie ist ein traditionelles britisches Wintergericht — eine Schicht Lammhackfleisch mit Karotten, Erbsen und Zwiebeln, bedeckt mit einer goldenen Kartoffelpüreehaube. Der Name verrät den Ursprung: Es war das sparsame Essen der Schäfer, zubereitet aus übrig gebliebenem Sonntagsbraten.\\n\\nIn der britischen Tradition ist die Terminologie wichtig: Mit Lammfleisch heißt es Shepherd's Pie, mit Rindfleisch Cottage Pie. Beide sind klassisches britisches Comfort Food, auf Pub-Speisekarten und in Heimküchen im ganzen Vereinigten Königreich, besonders im Herbst und Winter.",
      pt: "O Shepherd's Pie é um prato britânico de inverno — uma camada de cordeiro picado com cenouras, ervilhas e cebola, coberta com uma crosta dourada de puré de batata assada no forno. O nome reflete a origem: era a comida económica dos pastores, feita com as sobras do assado de domingo.\\n\\nNa tradição britânica, a terminologia importa: com cordeiro chama-se shepherd's pie, com carne bovina chama-se cottage pie. Ambos são o clássico comfort food britânico, presentes nos menus de pub e nas cozinhas domésticas de todo o Reino Unido, especialmente no outono e inverno.",
      ru: "Пастуший пирог — традиционное британское зимнее блюдо: слой рубленой баранины с морковью, горошком и луком, покрытый золотистой корочкой из картофельного пюре. Название отражает происхождение: это была экономная еда пастухов из остатков воскресного жаркого.\\n\\nВ британской традиции терминология важна: с бараниной — shepherd's pie, с говядиной — cottage pie. Оба — классическая британская домашняя еда, на кухнях пабов и в домах по всему Соединённому Королевству, особенно осенью и зимой.",
      ar: "فطيرة الراعي طبق شتوي بريطاني تقليدي — طبقة من لحم الغنم المفروم مع الجزر والبازلاء والبصل، مغطاة بقشرة ذهبية من البطاطا المهروسة المخبوزة. يعكس اسمها أصلها: كانت طعام الرعاة الاقتصادي المصنوع من بقايا لحم الغنم يوم الأحد.\\n\\nفي التقليد البريطاني، المصطلح مهم: مع لحم الغنم تسمى shepherd's pie، ومع لحم البقر تسمى cottage pie. كلاهما من طعام الراحة البريطاني الكلاسيكي في قوائم الحانات والمنازل في جميع أنحاء المملكة المتحدة.",
      zh: "牧羊人派是英国传统的冬季菜肴——一层羊肉末与胡萝卜、豌豆和洋葱，上面覆盖烤至金黄的土豆泥外壳。其名称反映了起源：牧羊人用周日烤肉剩余羊肉制作的经济实惠食物。\\n\\n在英国传统中，术语很重要：用羊肉叫牧羊人派，用牛肉叫乡村派。两者都是经典的英国安慰食物，在整个英国的酒吧菜单和家庭厨房中可以找到，尤其是在秋冬季节。",
      ja: "シェパーズパイはイギリスの伝統的な冬の料理——ひき羊肉・にんじん・グリーンピース・玉ねぎの層の上に、こんがりとしたマッシュポテトの蓋がのった焼き料理です。名前がその起源を表しています：日曜日のローストで余った羊肉を使った羊飼いの倹約料理でした。\\n\\nイギリスの伝統では用語が重要で、羊肉ならシェパーズパイ、牛肉ならコテージパイと呼ばれます。どちらも英国の定番コンフォートフードで、秋冬を中心にパブのメニューや家庭の台所に欠かせません。",
      tr: "Shepherd's Pie geleneksel bir İngiliz kış yemeğidir — havuç, bezelye ve soğanla pişirilmiş kıyılmış kuzu eti katmanının üzerine fırında kızartılmış altın rengi patates püresi kabuğu eklenerek hazırlanır. İsmi kökenini yansıtır: pazar kuzusu kızartmasından kalan artıklardan yapılan çobanların tutumlu yemeğiydi.\\n\\nBritanya geleneğinde terminoloji önemlidir: kuzuyla yapılana shepherd's pie, sığır etiyle yapılana cottage pie denir. Her ikisi de klasik İngiliz comfort food olarak sonbahar ve kış aylarında İngiltere'nin pub menülerinde ve ev mutfaklarında bulunur.",
      it: "Il Shepherd's Pie è un piatto invernale tradizionale britannico — uno strato di agnello tritato con carote, piselli e cipolla, ricoperto da una crosta dorata di purè di patate gratinata al forno. Il nome riflette l'origine: era il cibo economico dei pastori, preparato con gli avanzi dell'arrosto domenicale.\\n\\nNella tradizione britannica, la terminologia conta: con agnello si chiama shepherd's pie, con manzo si chiama cottage pie. Entrambi sono il classico comfort food britannico, presenti nei menu dei pub e nelle cucine domestiche di tutto il Regno Unito, specialmente in autunno e inverno.",
      ko: "셰퍼즈 파이는 전통 영국식 겨울 요리입니다. 당근, 완두콩, 양파와 함께 볶은 다진 양고기 층 위에 황금빛 으깬 감자를 올려 오븐에 구워 냅니다. 이름에는 기원이 담겨 있습니다: 일요일 로스트 후 남은 양고기로 만든 목동들의 실속 있는 음식이었습니다.\\n\\n영국 전통에서는 명칭이 중요합니다: 양고기로 만들면 셰퍼즈 파이, 소고기로 만들면 코티지 파이라고 부릅니다. 두 가지 모두 영국의 대표적인 편안한 가정식으로, 특히 가을과 겨울에 펍 메뉴와 가정 식탁에서 빠지지 않습니다.",
      hi: "शेफर्ड्स पाई एक पारंपरिक ब्रिटिश सर्दियों का व्यंजन है — मेमने के कीमे को गाजर, मटर और प्याज़ के साथ पकाकर बेकिंग डिश में रखा जाता है, फिर ऊपर मसले हुए आलू की परत बनाकर ओवन में सुनहरा बेक किया जाता है। इसका नाम इसकी उत्पत्ति बताता है: चरवाहों का किफायती खाना जो रविवार के रोस्ट से बचे मेमने से बनता था।\\n\\nब्रिटिश परंपरा में शब्दावली महत्वपूर्ण है: मेमने से बने को शेफर्ड्स पाई और गोमांस से बने को कॉटेज पाई कहते हैं। दोनों ही ब्रिटेन के क्लासिक कम्फर्ट फूड हैं, पब मेनू से लेकर घरेलू रसोई तक — खासकर शरद और सर्दियों में।"
    }'''

content = content.replace(old_168, new_168)

# ── ID 169 Mapo Tofu (China) ──────────────────────────────────────

content = content.replace(
    '      ko: "중국"\n    },\n    name: {\n      ro: "Mapo Tofu"',
    '      ko: "중국",\n      hi: "चीन"\n    },\n    name: {\n      ro: "Mapo Tofu"'
)
content = content.replace(
    '      ko: "마파두부"\n    },\n    category: {',
    '      ko: "마파두부",\n      hi: "माओ टोफू"\n    },\n    category: {'
)
content = content.replace(
    '      ko: "저녁"\n    },\n    ingredients: {\n      ro: ["tofu"',
    '      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    ingredients: {\n      ro: ["tofu"'
)
content = content.replace(
    '      ko: ["두부", "다진 돼지고기", "발효 콩 된장", "쪽파", "생강", "마늘", "참기름", "고추", "간장"]\n    },\n    howIsMade: {',
    '      ko: ["두부", "다진 돼지고기", "발효 콩 된장", "쪽파", "생강", "마늘", "참기름", "고추", "간장"],\n      hi: ["टोफू", "कीमा सूअर", "किण्वित बीन पेस्ट", "हरा प्याज़", "अदरक", "लहसुन", "तिल का तेल", "मिर्च", "सोया सॉस"]\n    },\n    howIsMade: {'
)
content = content.replace(
    '      ko: "다진 돼지고기를 마늘과 생강과 함께 볶은 후, 두부 큐브와 두반장, 간장, 고추를 넣고 함께 조리합니다."\n    },\n    originText: {\n      ro: "Mapo Tofu este',
    '      ko: "다진 돼지고기를 마늘과 생강과 함께 볶은 후, 두부 큐브와 두반장, 간장, 고추를 넣고 함께 조리합니다.",\n      hi: "कीमे को लहसुन और अदरक के साथ भूनें, टोफू के क्यूब्स, मसालेदार बीन पेस्ट, सोया सॉस और मिर्च डालें और एक साथ पकाएं।"\n    },\n    originText: {\n      ro: "Mapo Tofu este'
)

old_169 = '''    originText: {
      ro: "Mapo Tofu este o rețetă tradițională din China.",
      en: "Mapo Tofu is a traditional recipe from China.",
      es: "Mapo Tofu es una receta tradicional de China.",
      fr: "Mapo Tofu est une recette traditionnelle de Chine.",
      de: "Mapo Tofu ist ein traditionelles Rezept aus China.",
      pt: "Mapo Tofu é uma receita tradicional da China.",
      ru: "Мапо тофу — традиционный рецепт из Китая.",
      ar: "مابو توفو هي وصفة تقليدية من الصين.",
      zh: "麻婆豆腐 是来自中国的传统食谱。",
      ja: "麻婆豆腐 は中国の伝統的なレシピです。",
      tr: "Mapo Tofu, Çin kökenli geleneksel bir tariftir.",
      it: "Mapo Tofu è una ricetta tradizionale della Cina.",
      ko: "마파두부는 중국의 전통 요리입니다."
    }'''

new_169 = '''    originText: {
      ro: "Mapo tofu este un preparat emblematic al bucătăriei din Sichuan — cuburi de tofu moale gătite într-un sos roșu intens de pastă de fasole fermentată (doubanjiang), ulei de chili și carne tocată de porc. Amortizarea caracteristică a piperului sichuan și căldura ardeilor creează senzația vibrantă ma-la: amorțitoare și picantă simultan.\\n\\nNumele se traduce aproximativ ca tofu al bătrânei cu față aspră, cu referire la o legendă culinară. Preparatul a apărut în Chengdu în epoca Qing și s-a răspândit în toată China și Asia. Este rapid de preparat, intens aromat și satisfăcător — esența bucătăriei populare sichuan.",
      en: "Mapo tofu is an emblematic dish of Sichuan cuisine — silken tofu cubes cooked in an intense red sauce of fermented bean paste (doubanjiang), chili oil, and minced pork. The characteristic numbing quality of Sichuan pepper and the heat of chili peppers create the vibrant ma-la sensation: numbing and spicy simultaneously.\\n\\nThe name roughly translates as tofu of the pockmarked old woman, referencing a culinary legend. The dish emerged in Chengdu during the Qing dynasty and spread throughout China and Asia. It is quick to prepare, intensely flavored, and deeply satisfying — the essence of popular Sichuan street cooking.",
      es: "El mapo tofu es un plato emblemático de la cocina de Sichuan — cubos de tofu suave cocinados en una intensa salsa roja de pasta de judías fermentadas (doubanjiang), aceite de chile y carne de cerdo picada. El adormecimiento del pimienta de Sichuan y el calor de los chiles crean la vibrante sensación ma-la: entumecida y picante simultáneamente.\\n\\nEl nombre se traduce aproximadamente como el tofu de la vieja picada, en referencia a una leyenda culinaria. El plato surgió en Chengdu durante la dinastía Qing y se extendió por China y Asia.",
      fr: "Le mapo tofu est un plat emblématique de la cuisine du Sichuan — des cubes de tofu soyeux cuits dans une sauce rouge intense de pâte de haricots fermentés (doubanjiang), d'huile de piment et de porc haché. L'engourdissement du poivre du Sichuan et la chaleur des piments créent la sensation vibrante ma-la : engourdissante et épicée simultanément.\\n\\nLe nom se traduit approximativement par le tofu de la vieille femme au visage grêlé, en référence à une légende culinaire. Le plat est apparu à Chengdu sous la dynastie Qing et s'est répandu dans toute la Chine et l'Asie.",
      de: "Mapo Tofu ist ein emblematisches Gericht der Sichuan-Küche — zarte Tofu-Würfel in einer intensiv roten Sauce aus fermentierter Bohnenpaste (Doubanjiang), Chiliöl und Schweinehackfleisch. Die betäubende Wirkung des Sichuan-Pfeffers und die Schärfe der Chilischoten erzeugen die vibrierende Ma-la-Empfindung: gleichzeitig betäubend und scharf.\\n\\nDer Name bedeutet ungefähr Tofu der narbigen alten Frau, mit Bezug auf eine kulinarische Legende. Das Gericht entstand in Chengdu während der Qing-Dynastie und verbreitete sich in ganz China und Asien.",
      pt: "O mapo tofu é um prato emblemático da culinária de Sichuan — cubos de tofu suave cozidos num molho vermelho intenso de pasta de feijão fermentado (doubanjiang), óleo de malagueta e carne de porco moída. A qualidade entorpecente da pimenta de Sichuan e o calor das malaguetas criam a vibrante sensação ma-la: entorpecente e picante simultaneamente.\\n\\nO nome traduz-se aproximadamente como o tofu da velha com cara marcada, referenciando uma lenda culinária. O prato surgiu em Chengdu durante a dinastia Qing e espalhou-se por toda a China e Ásia.",
      ru: "Мапо тофу — культовое блюдо сычуаньской кухни: нежные кубики тофу в интенсивном красном соусе из ферментированной бобовой пасты (доубаньцзян), чилийного масла и свиного фарша. Онемение от сычуаньского перца и жгучесть чили создают ощущение ма-ла: одновременное онемение и жгучесть.\\n\\nНазвание переводится примерно как тофу рябой старухи — отсылка к кулинарной легенде. Блюдо появилось в Чэнду в эпоху Цин и распространилось по всему Китаю и Азии. Готовится быстро, обладает интенсивным вкусом и глубоко удовлетворяет.",
      ar: "مابو توفو طبق رمزي في المطبخ السيتشواني — مكعبات توفو طري تُطهى في صلصة حمراء كثيفة من معجون الفاصوليا المخمرة (دوبانجيانج) وزيت الفلفل الحار واللحم المفروم. الخدر المميز لفلفل السيتشوان وحرارة الفلفل الحار يخلقان الإحساس النابض بالحياة ما-لا: خدر وحدة في آن واحد.\\n\\nيُترجم الاسم تقريباً بـ توفو العجوز ذات الوجه المنقور، في إشارة إلى أسطورة طهوية. ظهر الطبق في مدينة تشنغدو إبان أسرة تشينغ وانتشر في أرجاء الصين وآسيا.",
      zh: "麻婆豆腐是四川菜的标志性菜肴——嫩豆腐在豆瓣酱、辣椒油和猪肉末构成的浓郁红色酱汁中烹制。四川花椒特有的麻味和辣椒的热辣感共同创造了充满活力的麻辣感：麻与辣同时迸发。\\n\\n菜名大致意思是麻脸老太婆的豆腐，来自一个烹饪传说。这道菜起源于清朝时期的成都，后传遍中国及亚洲各地。制作速度快，风味浓郁，是四川街头烹饪精髓的体现。",
      ja: "麻婆豆腐は四川料理の代名詞的な一品——絹ごし豆腐のキューブを発酵豆板醤・辣油・豚ひき肉から作る強烈な赤いソースで煮た料理です。四川山椒の痺れとチリペッパーの辛さが合わさって麻辣という独特の感覚が生まれます：痺れと辛さが同時に。\\n\\n名前は大まかに「あばた顔の老婆の豆腐」と訳され、料理の伝説を指します。清朝時代に成都で生まれ、中国全土とアジアに広まりました。",
      tr: "Mapo tofu, Sichuan mutfağının simgesi olan bir yemektir — fermante fasulye ezmesi (doubanjiang), acı biber yağı ve kıyılmış domuz etiyle oluşturulan yoğun kırmızı sosda pişirilmiş ipeksi tofu küpleri. Sichuan biberinin uyuşturucu etkisi ve acı biberlerin sıcaklığı, ma-la deneyimini yaratır: aynı anda uyuşturucu ve acı.\\n\\nAdı kabaca çıkıntılı yüzlü yaşlı kadının tofusu olarak çevrilir; bu bir mutfak efsanesine gönderme yapar. Yemek, Qing hanedanlığı döneminde Chengdu'da ortaya çıktı ve tüm Çin ve Asya'ya yayıldı.",
      it: "Il mapo tofu è un piatto emblematico della cucina del Sichuan — cubetti di tofu morbido cotti in un'intensa salsa rossa di pasta di fagioli fermentati (doubanjiang), olio di peperoncino e maiale tritato. L'intorpidimento del pepe del Sichuan e il calore dei peperoncini creano la vibrante sensazione ma-la: intorpidimento e piccantezza simultaneamente.\\n\\nIl nome si traduce approssimativamente come il tofu della vecchia butterata, in riferimento a una leggenda culinaria. Il piatto è nato a Chengdu durante la dinastia Qing e si è diffuso in tutta la Cina e l'Asia.",
      ko: "마파두부는 사천 요리의 상징적인 요리입니다. 연한 두부를 발효 두반장, 고추기름, 다진 돼지고기로 만든 진한 붉은 소스에 넣어 조리합니다. 사천 산초의 마비감과 고추의 매운맛이 결합해 생동감 넘치는 마라 감각을 만들어냅니다: 동시에 마비되고 얼얼한 느낌입니다.\\n\\n이름은 대략 곰보 할머니의 두부라는 의미로, 요리 전설을 가리킵니다. 청나라 시대 청두에서 탄생해 중국 전역과 아시아로 퍼졌습니다. 빠르게 만들 수 있고 강렬한 맛이 납니다.",
      hi: "माओ टोफू सिचुआन व्यंजन का प्रतीक है — नरम टोफू के क्यूब्स को किण्वित बीन पेस्ट (दौबानजियांग), मिर्च के तेल और कीमा सूअर के मांस से बनी गहरी लाल चटनी में पकाया जाता है। सिचुआन मिर्च की सुन्न करने वाली विशेषता और मिर्ची की गर्मी मिलकर जीवंत माला अनुभव बनाती है: एक साथ सुन्न और तीखा।\\n\\nनाम का अर्थ मोटे तौर पर चेचक के दाग वाली बुज़ुर्ग महिला का टोफू है — एक पाककला की किंवदंती। यह व्यंजन किंग राजवंश के दौरान चेंगदू में उभरा और पूरे चीन और एशिया में फैल गया।"
    }'''

content = content.replace(old_169, new_169)

# ── ID 170 Menemen (Turkey) ───────────────────────────────────────

content = content.replace(
    '      ko: "터키"\n    },\n    name: {\n      ro: "Menemen"',
    '      ko: "터키",\n      hi: "तुर्की"\n    },\n    name: {\n      ro: "Menemen"'
)
content = content.replace(
    '      ko: "메네멘"\n    },\n    category: {',
    '      ko: "메네멘",\n      hi: "मेनेमेन"\n    },\n    category: {'
)
content = content.replace(
    '      ko: "아침"\n    },\n    ingredients: {\n      ro: ["ouă"',
    '      ko: "아침",\n      hi: "सुबह का नाश्ता"\n    },\n    ingredients: {\n      ro: ["ouă"'
)
content = content.replace(
    '      ko: ["계란", "파프리카", "토마토", "양파", "올리브오일", "향신료", "파슬리"]\n    },\n    howIsMade: {',
    '      ko: ["계란", "파프리카", "토마토", "양파", "올리브오일", "향신료", "파슬리"],\n      hi: ["अंडे", "शिमला मिर्च", "टमाटर", "प्याज़", "जैतून का तेल", "मसाले", "अजमोद"]\n    },\n    howIsMade: {'
)
content = content.replace(
    '      ko: "양파와 피망을 올리브유에 볶고 다진 토마토를 넣어 조리한 후, 계란을 위에 깨뜨려 넣고 부드럽게 저으며 익힙니다."\n    },\n    originText: {\n      ro: "Menemen este',
    '      ko: "양파와 피망을 올리브유에 볶고 다진 토마토를 넣어 조리한 후, 계란을 위에 깨뜨려 넣고 부드럽게 저으며 익힙니다.",\n      hi: "जैतून के तेल में प्याज़ और मिर्च भूनें, कटे टमाटर डालें, फिर ऊपर अंडे तोड़ें और धीरे-धीरे हिलाते हुए पकाएं।"\n    },\n    originText: {\n      ro: "Menemen este'
)

old_170 = '''    originText: {
      ro: "Menemen este o rețetă tradițională din Turcia.",
      en: "Menemen is a traditional recipe from Turkey.",
      es: "Menemen es una receta tradicional de Turquía.",
      fr: "Menemen est une recette traditionnelle de Turquie.",
      de: "Menemen ist ein traditionelles Rezept aus der Türkei.",
      pt: "Menemen é uma receita tradicional da Turquia.",
      ru: "Менемен — традиционный рецепт из Турции.",
      ar: "مينمن هي وصفة تقليدية من تركيا.",
      zh: "土耳其蛋炒番茄 是来自土耳其的传统食谱。",
      ja: "メネメン はトルコの伝統的なレシピです。",
      tr: "Menemen, Türkiye kökenli geleneksel bir tariftir.",
      it: "Menemen è una ricetta tradizionale della Turchia.",
      ko: "메네멘은 터키의 전통 요리입니다."
    }'''

new_170 = '''    originText: {
      ro: "Menemen este micul dejun turcesc prin excelență — ouă sparte direct în tigaie cu roșii, ardei gras verde și uneori ceapă, totul gătit în ulei de măsline. Preparatul vine din Egea și are o dezbatere culinară eternă: cu sau fără ceapă? La Istanbul, menemen-ul autentic este fără ceapă; în Egea și Anatolia, ceapa este obligatorie.\\n\\nMenemen nu este omletă — ouăle nu se bat separat, ci se adaugă direct în tigaie și se amestecă ușor, rămânând cremoase. Se mănâncă din tigaie cu pâine simit (covrig turcesc) sau ekmek proaspăt, cu ceai negru turcesc alături.",
      en: "Menemen is the quintessential Turkish breakfast — eggs cracked directly into a pan with tomatoes, green bell pepper, and sometimes onion, everything cooked in olive oil. The dish comes from the Aegean region and carries an eternal culinary debate: with or without onion? In Istanbul, authentic menemen has no onion; in the Aegean and Anatolia, onion is mandatory.\\n\\nMenemen is not an omelette — the eggs are not beaten separately but added directly into the pan with the vegetables and stirred lightly, remaining creamy. Eaten from the pan with simit (Turkish bagel) or fresh ekmek bread, accompanied by Turkish black tea.",
      es: "El menemen es el desayuno turco por excelencia — huevos rotos directamente en una sartén con tomates, pimiento verde y a veces cebolla, todo cocinado en aceite de oliva. El plato viene de la región egea y lleva consigo un eterno debate culinario: ¿con o sin cebolla? En Estambul, el menemen auténtico no lleva cebolla; en el Egeo y Anatolia, la cebolla es obligatoria.\\n\\nEl menemen no es una tortilla — los huevos no se baten por separado sino que se añaden directamente a la sartén y se mezclan suavemente, quedando cremosos. Se come de la sartén con simit o pan ekmek fresco.",
      fr: "Le menemen est le petit-déjeuner turc par excellence — des oeufs cassés directement dans une poêle avec des tomates, du poivron vert et parfois des oignons, le tout cuit dans l'huile d'olive. Le plat vient de la région égéenne et fait l'objet d'un éternel débat culinaire: avec ou sans oignon? À Istanbul, le vrai menemen n'a pas d'oignon; dans l'Égée et l'Anatolie, l'oignon est obligatoire.\\n\\nLe menemen n'est pas une omelette — les oeufs ne sont pas battus séparément mais ajoutés directement dans la poêle avec les légumes et mélangés légèrement, restant crémeux. Il se mange à même la poêle avec du simit ou du pain ekmek frais.",
      de: "Menemen ist das türkische Frühstück schlechthin — Eier, die direkt mit Tomaten, grünem Paprika und manchmal Zwiebel in Olivenöl in die Pfanne geschlagen werden. Das Gericht stammt aus der Ägäis und hat eine ewige kulinarische Debatte: mit oder ohne Zwiebel? In Istanbul ist das authentische Menemen zwiebelfrei; in der Ägäis und Anatolien ist die Zwiebel obligatorisch.\\n\\nMenemen ist kein Omelett — die Eier werden nicht getrennt aufgeschlagen, sondern direkt in die Pfanne gegeben und leicht gerührt, wobei sie cremig bleiben. Direkt aus der Pfanne mit Simit oder frischem Ekmek-Brot gegessen, dazu türkischer schwarzer Tee.",
      pt: "O menemen é o pequeno-almoço turco por excelência — ovos quebrados diretamente numa frigideira com tomates, pimento verde e às vezes cebola, tudo cozido em azeite. O prato vem da região egeia e tem um eterno debate culinário: com ou sem cebola? Em Istambul, o menemen autêntico não tem cebola; no Egeu e na Anatólia, a cebola é obrigatória.\\n\\nO menemen não é uma omelete — os ovos não são batidos separadamente, são adicionados diretamente na frigideira e mexidos levemente, permanecendo cremosos. Come-se diretamente da frigideira com simit ou pão ekmek fresco.",
      ru: "Менемен — турецкий завтрак по всем канонам: яйца, разбитые прямо в сковороду с помидорами, зелёным болгарским перцем и иногда луком на оливковом масле. Блюдо пришло из Эгейского региона и несёт с собой вечный кулинарный спор: с луком или без? В Стамбуле аутентичный менемен без лука; в Эгейском регионе и Анатолии лук обязателен.\\n\\nМенемен — не омлет: яйца не взбиваются отдельно, их разбивают прямо в сковороду с овощами и слегка размешивают, оставаясь кремовыми. Едят прямо из сковороды с симит или хлебом экмек, с чёрным чаем рядом.",
      ar: "المينمن هو الفطور التركي بامتياز — بيض يُكسر مباشرة في مقلاة مع الطماطم والفلفل الأخضر وأحياناً البصل، كل شيء يُطهى في زيت الزيتون. الطبق من منطقة بحر إيجة ويحمل نقاشاً طهوياً أبدياً: مع البصل أم بدونه؟ في إسطنبول المينمن الأصيل بلا بصل؛ في بحر إيجة والأناضول البصل إلزامي.\\n\\nالمينمن ليس عجة — البيض لا يُخفق بشكل منفصل بل يُضاف مباشرة إلى المقلاة مع الخضار ويُقلب خفيفاً ليبقى كريمياً. يُؤكل مباشرة من المقلاة مع السميط أو خبز الإكميك الطازج.",
      zh: "曼纳曼是土耳其的经典早餐——将鸡蛋直接打入煎锅中与番茄、绿甜椒（有时加洋葱）一起用橄榄油轻轻翻炒。这道菜来自爱琴海地区，关于是否加洋葱有一场永恒的烹饪争论：伊斯坦布尔的正宗曼纳曼不加洋葱；在爱琴海和安纳托利亚地区，洋葱是必须的。\\n\\n曼纳曼不是煎蛋卷——鸡蛋不是单独打散的，而是直接加入蔬菜的煎锅中轻轻搅拌，保持奶油状。直接从锅中取食，搭配西米特或新鲜艾克梅克面包，配上土耳其红茶。",
      ja: "メネメンはトルコの朝食の定番です——卵をトマト・緑ピーマン、時に玉ねぎと一緒に直接フライパンでオリーブオイルで優しく炒め混ぜたものです。エーゲ海地方が起源で、玉ねぎを入れるかどうかという永遠の議論があります：イスタンブールでは正統なメネメンは玉ねぎなし；エーゲ海地方やアナトリアでは玉ねぎは必須です。\\n\\nメネメンはオムレツではありません——卵は別に泡立てず、直接野菜の入ったフライパンに割り入れ、クリーミーさを保ちながら軽く混ぜます。シミットや焼きたてのエクメクパンと一緒に直接フライパンから食べます。",
      tr: "Menemen, Türkiye'nin vazgeçilmez kahvaltısıdır — yumurtalar, domates, yeşil biber ve bazen soğanla birlikte doğrudan tavaya zeytinyağında kırılır. Yemek Ege bölgesinden gelir ve soğanlı mı soğansız mı diye sonsuz bir tartışma vardır: İstanbul'da otantik menemen soğansızdır; Ege ve Anadolu'da soğan zorunludur.\\n\\nMenemen omlet değildir — yumurtalar ayrıca çırpılmaz, doğrudan sebzelerle tavaya kırılır ve hafifçe karıştırılarak kremamsı kalır. Simit veya taze ekmekle doğrudan tavadan yenir, yanında Türk siyah çayı ile.",
      it: "Il menemen è la colazione turca per eccellenza — uova rotte direttamente in padella con pomodori, peperone verde e talvolta cipolla, tutto cotto nell'olio d'oliva. Il piatto viene dalla regione egea e porta con sé un eterno dibattito culinario: con o senza cipolla? A Istanbul, il menemen autentico è senza cipolla; nell'Egeo e in Anatolia, la cipolla è obbligatoria.\\n\\nIl menemen non è una frittata — le uova non si sbattono separatamente, ma si aggiungono direttamente in padella con le verdure e si mischiano leggermente, rimanendo cremose. Si mangia direttamente dalla padella con il simit o con pane ekmek fresco.",
      ko: "메네멘은 터키의 대표적인 아침 식사입니다. 달걀을 토마토, 녹색 파프리카, 때로는 양파와 함께 직접 팬에서 올리브유로 부드럽게 볶아 만듭니다. 에게해 지방에서 유래했으며 양파를 넣는지 여부에 대한 영원한 논쟁이 있습니다: 이스탄불에서는 정통 메네멘에 양파가 없고, 에게해와 아나톨리아에서는 양파가 필수입니다.\\n\\n메네멘은 오믈렛이 아닙니다. 달걀을 별도로 풀지 않고 채소가 있는 팬에 직접 깨뜨려 넣어 가볍게 저으면서 크림 같은 질감을 유지합니다. 시미트나 신선한 에크멕 빵과 함께 팬에서 바로 먹습니다.",
      hi: "मेनेमेन तुर्की का अनिवार्य नाश्ता है — अंडों को टमाटर, हरी शिमला मिर्च और कभी-कभी प्याज़ के साथ सीधे पैन में जैतून के तेल में पकाया जाता है। यह ईजियन क्षेत्र से आता है और प्याज़ डालने या न डालने पर एक शाश्वत बहस है: इस्तांबुल में असली मेनेमेन में प्याज़ नहीं होता; ईजियन और अनातोलिया में प्याज़ ज़रूरी है।\\n\\nमेनेमेन ऑमलेट नहीं है — अंडे अलग से नहीं फेंटे जाते, सब्जियों के साथ पैन में सीधे तोड़कर हल्के से हिलाते हैं, मलाईदार बनावट बनाए रखते हुए। सिमित या ताज़े एकमेक रोटी के साथ पैन से सीधे खाया जाता है।"
    }'''

content = content.replace(old_170, new_170)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("IDs 168-170 done")
