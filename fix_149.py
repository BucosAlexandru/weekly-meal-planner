with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ID 149 - Pozole (Mexico) - no hi fields yet

content = content.replace(
    '      ko: "멕시코"\n    },\n    name: {\n      ro: "Pozole"',
    '      ko: "멕시코",\n      hi: "मेक्सिको"\n    },\n    name: {\n      ro: "Pozole"'
)

content = content.replace(
    '      ko: "포솔레"\n    },\n    category: {\n      ro: "Prânz",\n      en: "Lunch",\n      es: "Almuerzo",\n      fr: "Déjeuner",\n      de: "Mittagessen",\n      pt: "Almoço",\n      ru: "Обед",\n      ar: "غداء",\n      zh: "午餐",\n      ja: "ランチ",\n      tr: "Öğle yemeği",\n      it: "Pranzo",\n      ko: "점심"\n    },\n    servings: 6,\n    tipType: \'soup\'',
    '      ko: "포솔레",\n      hi: "पोज़ोले"\n    },\n    category: {\n      ro: "Prânz",\n      en: "Lunch",\n      es: "Almuerzo",\n      fr: "Déjeuner",\n      de: "Mittagessen",\n      pt: "Almoço",\n      ru: "Обед",\n      ar: "غداء",\n      zh: "午餐",\n      ja: "ランチ",\n      tr: "Öğle yemeği",\n      it: "Pranzo",\n      ko: "점심",\n      hi: "दोपहर का खाना"\n    },\n    servings: 6,\n    tipType: \'soup\''
)

content = content.replace(
    '      ko: ["호미니 옥수수", "돼지고기", "마늘", "양파", "고추", "양배추", "무", "라임"]\n    },\n    howIsMade: {',
    '      ko: ["호미니 옥수수", "돼지고기", "마늘", "양파", "고추", "양배추", "무", "라임"],\n      hi: ["होमिनी मकई", "पोर्क", "लहसुन", "प्याज़", "हरी मिर्च", "पत्तागोभी", "मूली", "नींबू"]\n    },\n    howIsMade: {'
)

content = content.replace(
    '      ko: "돼지고기를 호미니 옥수수, 양파, 마늘과 함께 끓입니다. 고추를 넣고 양배추, 무, 라임과 함께 제공합니다."\n    },\n    originText: {\n      ro: "Pozole este',
    '      ko: "돼지고기를 호미니 옥수수, 양파, 마늘과 함께 끓입니다. 고추를 넣고 양배추, 무, 라임과 함께 제공합니다.",\n      hi: "पोर्क को होमिनी मकई, प्याज़ और लहसुन के साथ उबालें। हरी मिर्च डालें, फिर पत्तागोभी, मूली और नींबू के साथ परोसें।"\n    },\n    originText: {\n      ro: "Pozole este'
)

old_origin = '''    originText: {
      ro: "Pozole este o rețetă tradițională din Mexic.",
      en: "Pozole is a traditional recipe from Mexico.",
      es: "Pozole es una receta tradicional de México.",
      fr: "Pozole est une recette traditionnelle du Mexique.",
      de: "Pozole ist ein traditionelles Rezept aus Mexiko.",
      pt: "Pozole é uma receita tradicional do México.",
      ru: "Посоле — традиционный рецепт из Мексики.",
      ar: "بوزولي هي وصفة تقليدية من المكسيك.",
      zh: "波佐列汤 是来自墨西哥的传统食谱。",
      ja: "ポソレ はメキシコの伝統的なレシピです。",
      tr: "Pozole Meksika kökenli geleneksel bir tariftir.",
      it: "Pozole è una ricetta tradizionale del Messico.",
      ko: "포솔레는 멕시코의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Pozole este o supă rituală aztecă — termenul nahuatl înseamnă literalmente porumb spumos. Porumbul hominy (nixtamalizat, cu bobul deschis) fierbe ore întregi cu carne de porc și ardei uscați până se obține un bulion roșu intens, aromat. Preparatul era mâncat la ceremonii și sărbători în Mexic precolumbian.\\n\\nSe servește cu garnituri reci: varză tocată, ridichi feliate, oregano, lime și tostadas. Fiecare comesean își personalizează bolul. Există variante regionale: pozole rojo (cu ardei guajillo), verde (cu tomatillo și jalapeño) și blanco (fără ardei coloranți). Pozole este mâncare de weekend și de sărbătoare în Mexic.",
      en: "Pozole is an Aztec ritual soup — the Nahuatl word literally means foamy corn. Hominy corn (nixtamalized, with the kernel bloomed open) simmers for hours with pork and dried chilies until a deep red, aromatic broth develops. The dish was eaten at ceremonies and celebrations in pre-Columbian Mexico.\\n\\nIt is served with cold garnishes: shredded cabbage, sliced radish, oregano, lime, and tostadas. Each diner customizes their bowl. Regional variants exist: pozole rojo (with guajillo chili), verde (with tomatillo and jalapeño), and blanco (without coloring chilies). Pozole is a weekend and festive food in Mexico.",
      es: "El pozole es una sopa ritual azteca — la palabra náhuatl significa literalmente maíz espumoso. El maíz hominy (nixtamalizado, con el grano abierto) se cuece horas con carne de cerdo y chiles secos hasta obtener un caldo rojo intenso y aromático. El plato se comía en ceremonias y celebraciones en el México precolombino.\\n\\nSe sirve con guarniciones frías: col rallada, rábano en rodajas, orégano, lima y tostadas. Cada comensal personaliza su plato. Existen variantes regionales: pozole rojo (con chile guajillo), verde (con tomatillo y jalapeño) y blanco (sin chiles colorantes).",
      fr: "Le pozole est une soupe rituelle aztèque — le mot nahuatl signifie littéralement maïs mousseux. Le maïs hominy (nixtamalisé, avec le grain ouvert) mijote des heures avec du porc et des piments séchés jusqu'à obtenir un bouillon rouge intense et aromatique. Le plat se mangeait lors de cérémonies et de fêtes dans le Mexique précolombien.\\n\\nIl se sert avec des garnitures froides: chou émincé, radis en rondelles, origan, citron vert et tostadas. Chaque convive personnalise son bol. Des variantes régionales existent: pozole rojo (avec chile guajillo), verde (avec tomatillo et jalapeño) et blanco (sans piments colorants).",
      de: "Pozole ist eine aztekische Ritualsuppe — das Nahuatl-Wort bedeutet wörtlich schaumiger Mais. Hominy-Mais (nixtamalisiert, mit aufgeplatztem Kern) köchelt stundenlang mit Schweinefleisch und getrockneten Chilis, bis eine tiefrote, aromatische Brühe entsteht. Das Gericht wurde bei Zeremonien und Feiern im präkolumbischen Mexiko gegessen.\\n\\nServiert wird mit kalten Beilagen: geraspeltem Kohl, Radieschen, Oregano, Limette und Tostadas. Jeder Gast personalisiert seine Schüssel. Regionale Varianten: Pozole rojo (mit Guajillo-Chili), verde (mit Tomatillo und Jalapeño) und blanco (ohne Farb-Chilis).",
      pt: "Pozole é uma sopa ritual asteca — a palavra náuatle significa literalmente milho espumoso. O milho hominy (nixtamalizado, com o grão aberto) cozinha por horas com carne de porco e pimentas secas até desenvolver um caldo vermelho intenso e aromático. O prato era comido em cerimônias e celebrações no México pré-colombiano.\\n\\nServido com guarnições frias: repolho ralado, rabanete fatiado, orégano, limão e tostadas. Cada comensal personaliza sua tigela. Variantes regionais: pozole rojo (com chili guajillo), verde (com tomatillo e jalapeño) e blanco (sem pimentas colorantes).",
      ru: "Посоле — ритуальный суп ацтеков: слово на языке науатль буквально означает «пенистая кукуруза». Кукуруза хомини (никстамализированная, с раскрытыми зёрнами) тушится часами со свининой и сушёными чили до получения насыщенного красного ароматного бульона. В доколумбовой Мексике это блюдо ели на церемониях и праздниках.\\n\\nПодаётся с холодными гарнирами: шинкованной капустой, нарезанным редисом, орегано, лаймом и тостадас. Каждый гость настраивает свою тарелку. Региональные варианты: посоле рохо (с чили гуахильо), верде (с томатильо и халапеньо) и бланко (без красящих чили).",
      ar: "البوزولي حساء طقوسي أزتيكي — الكلمة بلغة الناهواتل تعني حرفياً الذرة الرغوية. تُطهى ذرة الهوميني (المنقوعة بالنيكستامال، ذات الحبة المفتوحة) ساعات مع لحم الخنزير والفلفل المجفف حتى يتشكل مرق أحمر كثيف ومعطر. كان الطبق يُؤكل في المراسم والاحتفالات في المكسيك قبل الكولومبية.\\n\\nيُقدَّم مع مرفقات باردة: ملفوف مبشور وشرائح فجل وأوريغانو وليم وتوستاداس. كل شخص يخصص وعاءه. توجد متغيرات إقليمية: بوزولي روخو وفيردي وبلانكو.",
      zh: "波佐列汤是阿兹特克的仪式汤——纳瓦特尔语这个词字面意思是泡沫玉米。经过碱法处理、颗粒膨开的玉米和猪肉、干辣椒一起慢炖数小时，直到形成深红色浓郁的肉汤。这道菜在前哥伦布时期的墨西哥用于仪式和庆典。\\n\\n搭配冷配菜食用：切丝卷心菜、切片萝卜、牛至、青柠和玉米片。每位食客可自行搭配。有地区变体：红色波佐列（加瓜希略辣椒）、绿色（加酸番茄和墨西哥辣椒）和白色（不加着色辣椒）。",
      ja: "ポソレはアステカの儀式的なスープです——ナワトル語でこの言葉は文字通り「泡立つトウモロコシ」を意味します。ホミニーコーン（ニキスタマル処理済み、実が開いたもの）を豚肉と乾燥チリとともに何時間も煮込み、深い赤色の芳醇なスープを作ります。この料理はコロンブス以前のメキシコで儀式や祝祭に食べられていました。\\n\\n千切りキャベツ、薄切りラディッシュ、オレガノ、ライム、トスタダスなど冷たいトッピングとともに提供されます。各自が自分のボウルをカスタマイズします。地域変体として赤（グアヒージョチリ入り）、緑（トマティーヨとハラペーニョ入り）、白があります。",
      tr: "Pozole, Aztek ritüel çorbasıdır — Nahuatl'daki kelime tam anlamıyla köpüklü mısır demektir. Hominy mısırı (nixtamallanmış, tanesi açılmış) domuz eti ve kuru biberlerle saatlerce pişirilerek yoğun kırmızı, aromatik bir et suyu elde edilir. Yemek, Kolomb öncesi Meksika'da tören ve kutlamalarda yenirdi.\\n\\nSoğuk garnitürlerle servis edilir: parçalanmış lahana, dilimlenmiş turp, kekiği, yeşil limon ve tostada. Her misafir kendi kasesini özelleştirir. Bölgesel varyantlar mevcuttur: pozole rojo (guajillo biberli), verde (tomatillo ve jalapeño'lu) ve blanco (renklendirici biber olmadan).",
      it: "Il pozole è una zuppa rituale azteca — la parola nahuatl significa letteralmente mais spumoso. Il mais hominy (nixtamalizzato, con il chicco aperto) cuoce per ore con carne di maiale e peperoncini essiccati fino a sviluppare un brodo rosso intenso e aromatico. Il piatto veniva mangiato in cerimonie e celebrazioni nel Messico precolombiano.\\n\\nViene servito con guarnizioni fredde: cavolo tritato, ravanello a fette, origano, lime e tostadas. Ogni commensale personalizza la propria ciotola. Varianti regionali: pozole rojo (con chile guajillo), verde (con tomatillo e jalapeño) e blanco (senza peperoncini coloranti).",
      ko: "포솔레는 아즈텍 의식용 수프입니다. 나와틀어로 이 단어는 문자 그대로 '거품 나는 옥수수'를 의미합니다. 호미니 옥수수(닉스타말화 처리되어 알이 벌어진 상태)를 돼지고기와 건조 고추와 함께 몇 시간씩 끓여 진한 붉은색 향긋한 육수를 만듭니다. 이 요리는 콜럼버스 이전 멕시코에서 의식과 축제에 먹었습니다.\\n\\n차가운 고명과 함께 제공됩니다: 채썬 양배추, 얇게 썬 무, 오레가노, 라임, 토스타다스. 각자 자신의 그릇을 취향대로 꾸밉니다. 지역 변형으로 포솔레 로호(과히요 고추), 베르데(토마티요와 할라피뇨), 블랑코(착색 고추 없음)가 있습니다.",
      hi: "पोज़ोले एक एज़्टेक अनुष्ठान सूप है — नाहुआतल शब्द का अर्थ सचमुच झागदार मकई है। होमिनी मकई (निक्सटामालाइज़्ड, खुले दाने के साथ) पोर्क और सूखी मिर्च के साथ घंटों उबाली जाती है जब तक गहरा लाल, सुगंधित शोरबा न बन जाए। यह व्यंजन प्री-कोलंबियाई मेक्सिको में समारोहों और उत्सवों में खाया जाता था।\\n\\nइसे ठंडे गार्निश के साथ परोसा जाता है: कटी पत्तागोभी, मूली के टुकड़े, ओरेगानो, नींबू और टोस्टाडास। हर व्यक्ति अपना कटोरा खुद सजाता है। क्षेत्रीय किस्में: पोज़ोले रोहो (गुआहीलो मिर्च के साथ), वर्दे (तोमातिल्लो और जलापेन्यो के साथ) और ब्लांको (रंग देने वाली मिर्च के बिना)।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 149 done")
