with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add hi to origin
content = content.replace(
    '      ko: "이탈리아"\n    },\n    name: {\n      ro: "Pasta e fagioli"',
    '      ko: "이탈리아",\n      hi: "इटली"\n    },\n    name: {\n      ro: "Pasta e fagioli"'
)

# Add hi to name
content = content.replace(
    '      ko: "파스타 에 파지올리"\n    },\n    category: {',
    '      ko: "파스타 에 파지올리",\n      hi: "पास्ता ए फाजोली"\n    },\n    category: {'
)

# Add hi to category — pasta e fagioli is Dinner; ja: ディナー; need unique context
content = content.replace(
    '      ko: "저녁"\n    },\n    servings: 4,\n    tipType: \'pasta\',\n    pairingsType: \'pasta\'',
    '      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    servings: 4,\n    tipType: \'pasta\',\n    pairingsType: \'pasta\''
)

# Add hi to ingredients
content = content.replace(
    '      ko: ["짧은 파스타", "콩", "토마토", "양파", "마늘", "당근", "셀러리", "올리브오일", "소금", "후추", "허브"]\n    },\n    howIsMade: {',
    '      ko: ["짧은 파스타", "콩", "토마토", "양파", "마늘", "당근", "셀러리", "올리브오일", "소금", "후추", "허브"],\n      hi: ["छोटा पास्ता", "राजमा", "टमाटर", "प्याज़", "लहसुन", "गाजर", "अजवाइन", "जैतून का तेल", "नमक", "काली मिर्च", "जड़ी-बूटियाँ"]\n    },\n    howIsMade: {'
)

# Add hi to howIsMade
content = content.replace(
    '      ko: "양파, 당근, 셀러리를 볶은 후 콩, 토마토, 파스타를 넣고 파스타가 익을 때까지 약불에서 끓입니다."\n    },\n    originText: {\n      ro: "Pasta e fagioli este',
    '      ko: "양파, 당근, 셀러리를 볶은 후 콩, 토마토, 파스타를 넣고 파스타가 익을 때까지 약불에서 끓입니다.",\n      hi: "प्याज़, गाजर और अजवाइन भूनें, राजमा, टमाटर और पास्ता डालें। पास्ता पकने तक पकाएं।"\n    },\n    originText: {\n      ro: "Pasta e fagioli este'
)

# Replace originText
old_origin = '''    originText: {
      ro: "Pasta e fagioli este o rețetă tradițională din Italia.",
      en: "Pasta e fagioli is a traditional recipe from Italy.",
      es: "Pasta e fagioli es una receta tradicional de Italia.",
      fr: "Pasta e fagioli est une recette traditionnelle d'Italie.",
      de: "Pasta e fagioli ist ein traditionelles Rezept aus Italien.",
      pt: "Pasta e fagioli é uma receita tradicional da Itália.",
      ru: "Паста э фаджоли — традиционный рецепт из Италии.",
      ar: "باستا إي فاجيولي هي وصفة تقليدية من إيطاليا.",
      zh: "意式豆子面 是来自意大利的传统食谱。",
      ja: "パスタ・エ・ファジョーリ はイタリアの伝統的なレシピです。",
      tr: "Pasta e fagioli İtalya kökenli geleneksel bir tariftir.",
      it: "Pasta e fagioli è una ricetta tradizionale d'Italia.",
      ko: "파스타 에 파지올리는 이탈리아의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Pasta e fagioli — paste și fasole — este unul dintre cele mai durabile preparate sărăcăcioase ale Italiei, înrădăcinat în tradiția cucina povera a producerii unei mese consistente din ingrediente ieftine și durabile. Pe regiunile italiene variază considerabil: în Veneto tinde să fie mai lichidă, aproape o supă; în Campania și Lazio se îngroașă până la o consistență densă, asemănătoare mămăligii.\\n\\nBaza de aromă este un soffritto clasic de ceapă, morcov și țelină în ulei de măsline, adâncit cu usturoi, uneori hamsii sau rozmarin. O parte din fasole se zdrobește în supă pentru a crea cremozitate fără smântână. Se finalizează cu un fir de ulei de măsline crud.",
      en: "Pasta e fagioli — pasta and beans — is one of Italy's most enduring peasant dishes, rooted in the cucina povera tradition of making a satisfying meal from cheap, shelf-stable staples. Across Italian regions it varies considerably: in the Veneto it tends to be more liquid, almost a soup; in Campania and Lazio it thickens to a dense, porridge-like consistency.\\n\\nThe flavour base is a classic soffritto of onion, carrot, and celery in olive oil, deepened with garlic and often anchovy or rosemary. A portion of the beans is crushed into the broth to create creaminess without cream. It is finished with a thread of raw olive oil.",
      es: "Pasta e fagioli — pasta y frijoles — es uno de los platos campesinos más duraderos de Italia, arraigado en la tradición de la cucina povera de preparar una comida satisfactoria con ingredientes baratos y duraderos. Varía considerablemente entre regiones: en el Véneto tiende a ser más líquida, casi una sopa; en Campania y Lacio se espesa hasta una consistencia densa.\\n\\nLa base de sabor es un soffritto clásico de cebolla, zanahoria y apio en aceite de oliva, enriquecido con ajo y a menudo anchoas o romero. Una parte de los frijoles se tritura para crear cremosidad sin nata.",
      fr: "La pasta e fagioli — pâtes et haricots — est l'un des plats paysans les plus durables d'Italie, ancré dans la tradition de la cucina povera qui consiste à préparer un repas satisfaisant à partir d'ingrédients bon marché. Elle varie considérablement selon les régions : en Vénétie, elle tend à être plus liquide, presque une soupe ; en Campanie et dans le Latium, elle s'épaissit jusqu'à une consistance dense.\\n\\nLa base aromatique est un soffritto classique d'oignon, carotte et céleri dans de l'huile d'olive, renforcé avec de l'ail et souvent des anchois ou du romarin. Une partie des haricots est écrasée pour créer de la crémosité sans crème.",
      de: "Pasta e fagioli — Nudeln und Bohnen — ist eines der beständigsten Bauerngerichte Italiens, verwurzelt in der Cucina-Povera-Tradition, aus preisgünstigen Vorratszutaten ein sätigendes Essen zu kochen. Zwischen den Regionen variiert es erheblich: In Venetien neigt es eher zu einer flüssigeren Konsistenz, fast eine Suppe; in Kampanien und Latium dickt es zu einer dichten, Brei-ähnlichen Konsistenz ein.\\n\\nDie Aromabasis ist ein klassisches Soffritto aus Zwiebel, Karotte und Sellerie in Olivenöl, vertieft mit Knoblauch und oft Sardellen oder Rosmarin. Ein Teil der Bohnen wird in die Brühe gestampft, um Cremigkeit ohne Sahne zu erzeugen.",
      pt: "Pasta e fagioli — macarrão e feijão — é um dos pratos camponeses mais duradouros da Itália, enraizado na tradição da cucina povera de preparar uma refeição satisfatória com ingredientes baratos. Varia consideravelmente entre as regiões: no Vêneto tende a ser mais líquido, quase uma sopa; na Campânia e no Lácio engrossa até uma consistência densa.\\n\\nA base de sabor é um soffritto clássico de cebola, cenoura e aipo em azeite, aprofundado com alho e muitas vezes anchova ou alecrim. Uma parte do feijão é esmagada para criar cremosidade sem creme.",
      ru: "Паста э фаджоли — паста с фасолью — одно из самых стойких крестьянских блюд Италии, уходящее корнями в традицию cucina povera — готовить сытную еду из дешёвых, не скоропортящихся продуктов. По регионам оно сильно различается: в Венето оно более жидкое, почти суп; в Кампании и Лацио густеет до плотной, похожей на кашу консистенции.\\n\\nОснова вкуса — классическое соффритто из лука, моркови и сельдерея в оливковом масле, обогащённое чесноком и часто анчоусами или розмарином. Часть фасоли разминают в бульоне для кремовой текстуры без сливок.",
      ar: "باستا إي فاجيولي — المعكرونة والفاصوليا — هي أحد أكثر أطباق الفلاحين ديمومةً في إيطاليا، متجذّرة في تقليد كوتشينا بوفيرا الهادف إلى تحضير وجبة مُشبِعة من مقادير رخيصة قابلة للتخزين. تتباين بشكل ملحوظ عبر المناطق الإيطالية: في فينيتو تميل إلى أن تكون أكثر سيولة، شبه حساء؛ في كامبانيا ولاتسيو تتكاثف حتى قوام كثيف.\\n\\nقاعدة النكهة هي سوفريتو كلاسيكي من بصل وجزر وكرفس في زيت الزيتون، تعمّقها الثوم وكثيراً الأنشوجة أو إكليل الجبل. تُسحق بعض حبات الفاصوليا لإضفاء كريمية دون كريمة.",
      zh: "意式豆子面——pasta e fagioli——是意大利历史最悠久的农民菜之一，根植于cucina povera传统——用廉价耐储食材做出一顿饱腹的饭。各地做法差异显著：威尼托大区的版本偏稀，近似汤；坎帕尼亚和拉齐奥的版本浓稠如粥。\\n\\n风味底料是经典的soffritto——洋葱、胡萝卜、芹菜在橄榄油中煸炒，配以大蒜，常加鳀鱼或迷迭香。部分豆子捣入汤中制造绵密感，无需加奶油。最后淋一缕生橄榄油画龙点睛。",
      ja: "パスタ・エ・ファジョーリ——パスタと豆の料理——は、安くて保存のきく食材から満足のいく食事を作るクチーナ・ポーヴェラの伝統に根ざした、イタリア最古の農民料理のひとつです。地域によって大きく異なり、ヴェネトではスープに近い液状、カンパーニャとラツィオでは粥のような濃密な仕上がりになります。\\n\\n風味のベースは玉ねぎ・にんじん・セロリのソフリット。ニンニクとアンチョビまたはローズマリーで深みを出します。豆の一部をつぶして加えることでクリームなしのなめらかさを実現し、最後に生オリーブオイルをひと回し。",
      tr: "Pasta e fagioli — makarna ve fasulye — İtalya'nın en köklü köylü yemeklerinden biridir; ucuz ve uzun ömürlü malzemelerden doyurucu bir öğün hazırlamaya dayanan cucina povera geleneğine köklenmiştir. İtalya bölgelerinde önemli farklılıklar gösterir: Veneto'da daha sıvı, neredeyse çorba kıvamındadır; Campania ve Lazio'da yoğun, lapa benzeri bir kıvama ulaşır.\\n\\nLezzet tabanı klasik bir soffritto'dur — zeytinyağında soğan, havuç ve kereviz, sarımsak ve zaman zaman hamsi ya da biberiye ile derinleştirilir. Fasulyenin bir kısmı kremamsı bir kıvam elde etmek için ezilir; son olarak çiğ zeytinyağı gezdirilerek tamamlanır.",
      it: "Pasta e fagioli è uno dei piatti contadini più duraturi d'Italia, radicato nella tradizione della cucina povera di preparare un pasto sostanzioso con ingredienti economici e a lunga conservazione. Varia considerevolmente tra le regioni: nel Veneto tende ad essere più liquida, quasi una minestra; in Campania e nel Lazio si addensa fino a una consistenza densa e cremosa.\\n\\nLa base aromatica è un classico soffritto di cipolla, carota e sedano in olio d'oliva, arricchito con aglio e spesso acciughe o rosmarino. Una parte dei fagioli viene schiacciata nel brodo per creare cremosità senza panna. Si termina con un filo d'olio extravergine crudo.",
      ko: "파스타 에 파지올리——파스타와 콩——는 이탈리아에서 가장 오래된 농민 음식 중 하나로, 저렴하고 보관이 쉬운 식재료로 든든한 한 끼를 만드는 쿠치나 포베라 전통에 뿌리를 두고 있습니다. 지역마다 상당한 차이가 있습니다. 베네토에서는 수프에 가까운 묽은 형태, 캄파니아와 라치오에서는 죽처럼 걸쭉한 형태입니다.\\n\\n풍미의 기본은 올리브오일에 양파·당근·셀러리를 볶은 클래식 소프리토에 마늘과 멸치 또는 로즈마리를 더해 깊이를 냅니다. 콩 일부를 으깨어 국물에 섞으면 크림 없이도 크리미한 질감이 납니다. 마지막에 생 올리브오일을 두르면 완성입니다.",
      hi: "पास्ता ए फाजोली — पास्ता और राजमा — इटली के सबसे टिकाऊ किसान व्यंजनों में से एक है, जो सस्ती और लंबे समय तक टिकने वाली सामग्री से तृप्तिदायक भोजन बनाने की cucina povera परंपरा में निहित है। इटली के विभिन्न क्षेत्रों में यह काफ़ी भिन्न होता है: वेनेटो में यह पतला, लगभग सूप जैसा होता है; कैम्पानिया और लाज़ियो में यह गाढ़ी, दलिया जैसी बनावट तक गाढ़ा हो जाता है।\\n\\nस्वाद का आधार जैतून के तेल में प्याज़, गाजर और अजवाइन का क्लासिक सोफ्रिटो है, जिसे लहसुन और अक्सर एंकोवी या रोज़मेरी से गहरा किया जाता है। राजमा का एक हिस्सा शोरबे में मैश करके बिना क्रीम के मलाईदार बनावट बनाई जाती है। अंत में कच्चे जैतून के तेल की एक बूंदाबांदी से सजाया जाता है।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 123 done")
