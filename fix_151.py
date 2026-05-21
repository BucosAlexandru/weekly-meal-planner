with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ID 151 - Okroshka (Russia) - no hi fields yet

content = content.replace(
    '      ko: "러시아"\n    },\n    name: {\n      ro: "Okroshka"',
    '      ko: "러시아",\n      hi: "रूस"\n    },\n    name: {\n      ro: "Okroshka"'
)

content = content.replace(
    '      ko: "오크로시카"\n    },\n    category: {',
    '      ko: "오크로시카",\n      hi: "ओक्रोश्का"\n    },\n    category: {'
)

content = content.replace(
    '      ko: "점심"\n    },\n    servings: 4,\n    tipType: \'soup\',\n    pairingsType: \'soup\',\n    ingredients: {\n      ro: ["chefir',
    '      ko: "점심",\n      hi: "दोपहर का खाना"\n    },\n    servings: 4,\n    tipType: \'soup\',\n    pairingsType: \'soup\',\n    ingredients: {\n      ro: ["chefir'
)

content = content.replace(
    '      ko: ["케피르 (또는 크바스)", "오이", "감자", "삶은 계란", "실파", "딜", "소시지"]\n    },\n    howIsMade: {',
    '      ko: ["케피르 (또는 크바스)", "오이", "감자", "삶은 계란", "실파", "딜", "소시지"],\n      hi: ["केफिर (या क्वास)", "खीरा", "आलू", "उबले अंडे", "हरा प्याज़", "डिल", "सॉसेज"]\n    },\n    howIsMade: {'
)

content = content.replace(
    '      ko: "모든 재료를 깍둑썰기해 섞습니다. 케피르 또는 크바스를 붓고 차갑게 제공합니다."\n    },\n    originText: {\n      ro: "Okroshka este',
    '      ko: "모든 재료를 깍둑썰기해 섞습니다. 케피르 또는 크바스를 붓고 차갑게 제공합니다.",\n      hi: "सभी सामग्री को काटें, मिलाएं और केफिर या क्वास डालें। ठंडा परोसें।"\n    },\n    originText: {\n      ro: "Okroshka este'
)

old_origin = '''    originText: {
      ro: "Okroshka este o rețetă tradițională din Rusia.",
      en: "Okroshka is a traditional recipe from Russia.",
      es: "Okroshka es una receta tradicional de Rusia.",
      fr: "Okroshka est une recette traditionnelle de Russie.",
      de: "Okroshka ist ein traditionelles Rezept aus Russland.",
      pt: "Okroshka é uma receita tradicional da Rússia.",
      ru: "Окрошка — традиционный рецепт из России.",
      ar: "أوكروشكا هي وصفة تقليدية من روسيا.",
      zh: "俄式冷汤 是来自俄罗斯的传统食谱。",
      ja: "オクロシカ はロシアの伝統的なレシピです。",
      tr: "Okroshka Rusya kökenli geleneksel bir tariftir.",
      it: "Okroshka è una ricetta tradizionale della Russia.",
      ko: "오크로시카는 러시아의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Okroshka este supa rece a verii rusești — un bol de kefir (sau kvass, o băutură fermentată din pâine) în care se adaugă cartofi fierți, ouă, castraveți proaspeți, ceapă verde, mărar și cârnați feliate, toate tăiate cuburi. Rezultatul este o supă răcoroasă, acidulată, care combină texturile crocante ale legumelor cu lichidul lactat răcoros.\\n\\nOkroshka nu se gătește — se asamblează. Se servește imediat după preparare, bine răcit. Pe timp de caniculă, okroshka este mâncarea zilnică a milioane de ruși. Există dezbateri aprinse despre versiunea corectă: cu kefir sau cu kvass, cu cârnați sau cu carne fiartă.",
      en: "Okroshka is the summer cold soup of Russia — a bowl of kefir (or kvass, a fermented bread drink) into which boiled potatoes, eggs, fresh cucumbers, spring onions, dill, and sliced sausages are added, all diced. The result is a refreshing, tangy soup combining the crunch of vegetables with cool dairy liquid.\\n\\nOkroshka is not cooked — it is assembled. It is served immediately after preparation, well chilled. In summer heat waves, okroshka is the daily food of millions of Russians. Fierce debates exist about the correct version: with kefir or kvass, with sausage or boiled meat.",
      es: "Okroshka es la sopa fría veraniega de Rusia — un bol de kéfir (o kvass, una bebida fermentada de pan) al que se añaden patatas cocidas, huevos, pepinos frescos, cebolleta, eneldo y embutido en rodajas, todo en cubos. El resultado es una sopa refrescante y ácida que combina la textura crujiente de las verduras con el líquido lácteo fresco.\\n\\nOkroshka no se cocina — se ensambla. Se sirve inmediatamente después de preparar, bien fría. En las olas de calor veraniegas, okroshka es el alimento diario de millones de rusos.",
      fr: "L'okroshka est la soupe froide estivale de Russie — un bol de kéfir (ou de kvass, une boisson fermentée à base de pain) dans lequel on ajoute des pommes de terre cuites, des œufs, des concombres frais, des oignons verts, de l'aneth et des saucisses en rondelles, le tout coupé en dés. Il en résulte une soupe fraîche et acidulée qui combine le croquant des légumes avec le liquide laitier froid.\\n\\nL'okroshka ne se cuisine pas — elle s'assemble. Elle se sert immédiatement après préparation, bien fraîche. En période de canicule, c'est l'aliment quotidien de millions de Russes.",
      de: "Okroshka ist die sommerliche Kaltsuppe Russlands — eine Schüssel Kefir (oder Kwass, ein fermentiertes Brotgetränk), in die gekochte Kartoffeln, Eier, frische Gurken, Frühlingszwiebeln, Dill und Wurstscheiben kommen, alles gewürfelt. Das Ergebnis ist eine erfrischende, säuerliche Suppe, die das Knirschen der Gemüse mit der kühlen Milchflüssigkeit verbindet.\\n\\nOkroshka wird nicht gekocht — sie wird zusammengestellt. Sie wird sofort nach der Zubereitung gut gekühlt serviert. In Hitzewellen ist Okroshka das tägliche Essen von Millionen Russen.",
      pt: "Okroshka é a sopa fria de verão da Rússia — uma tigela de kefir (ou kvass, uma bebida fermentada de pão) à qual se adicionam batatas cozidas, ovos, pepinos frescos, cebolinha, endro e fatias de salsicha, tudo em cubos. O resultado é uma sopa refrescante e ácida que combina a crocância dos legumes com o líquido lácteo frio.\\n\\nA okroshka não é cozinhada — é montada. Serve-se imediatamente após a preparação, bem fria. Em ondas de calor de verão, é o alimento diário de milhões de russos.",
      ru: "Окрошка — летний холодный суп России: в миску кефира (или кваса — ферментированного хлебного напитка) кладут варёный картофель, яйца, свежие огурцы, зелёный лук, укроп и нарезанную колбасу — всё кубиками. Результат — освежающий кисловатый суп, где хрусткость овощей сочетается с прохладной молочной жидкостью.\\n\\nОкрошка не готовится — она собирается. Подают сразу после сборки, хорошо охлаждённой. В летнюю жару это ежедневная еда миллионов россиян. Не утихают споры о правильном рецепте: на кефире или квасе, с колбасой или отварным мясом.",
      ar: "الأوكروشكا هي حساء روسي بارد لفصل الصيف — وعاء من الكفير (أو الكفاس، مشروب مخمر من الخبز) يُضاف إليه البطاطس المسلوقة والبيض والخيار الطازج والبصل الأخضر والشبت والسجق المقطع، وكلها مكعبات. النتيجة حساء منعش وحامض يجمع بين قرمشة الخضروات وبرودة السائل اللبني.\\n\\nالأوكروشكا لا تُطبخ — بل تُجمَّع. تُقدَّم فوراً بعد التحضير مبردة جيداً. في موجات الحر الصيفية هي الطعام اليومي لملايين الروس.",
      zh: "奥克罗什卡是俄罗斯的夏季冷汤——在一碗克非尔（或克瓦斯，一种发酵面包饮料）中加入煮熟的土豆、鸡蛋、新鲜黄瓜、葱、莳萝和切片香肠，所有食材均切成小丁。结果是一道清爽、略带酸味的汤，将蔬菜的爽脆与冷乳液相结合。\\n\\n奥克罗什卡不需要烹饪——只需组合。冷藏后立即上桌。在夏季酷暑中，这是数百万俄罗斯人的日常食物。",
      ja: "オクロシカはロシアの夏の冷たいスープです——ケフィール（またはクワス、発酵パン飲料）のボウルに、茹でたジャガイモ、卵、新鮮なキュウリ、青ネギ、ディル、スライスしたソーセージを加え、すべてサイコロ状に切ります。野菜のシャキシャキ感と冷たい乳製品の液体が組み合わさった爽やかで酸味のあるスープです。\\n\\nオクロシカは調理しません——組み立てます。準備後すぐによく冷やして提供します。夏の猛暑には、何百万人ものロシア人の日常食です。",
      tr: "Okroshka, Rusya'nın yaz soğuk çorbasıdır — bir kase kefir (ya da kvas, mayalanmış ekmek içeceği) içine haşlanmış patates, yumurta, taze salatalık, taze soğan, dereotu ve dilimlenmiş sosis eklenir, hepsi küp şeklinde doğranır. Sonuç, sebzelerin çıtırlığını soğuk süt sıvısıyla birleştiren ferahlatıcı, mayhoş bir çorbadır.\\n\\nOkroshka pişirilmez — hazırlanır. Hazırlandıktan hemen sonra iyice soğutulmuş halde servis edilir. Yaz sıcaklarında milyonlarca Rus'un günlük yiyeceğidir.",
      it: "L'okroshka è la zuppa fredda estiva della Russia — una ciotola di kefir (o di kvas, una bevanda fermentata a base di pane) a cui si aggiungono patate lesse, uova, cetrioli freschi, cipollotti, aneto e salsicce a fette, tutto tagliato a cubetti. Il risultato è una zuppa fresca e acidula che combina la croccantezza delle verdure con il liquido latteo freddo.\\n\\nL'okroshka non si cucina — si assembla. Si serve immediatamente dopo la preparazione, ben fredda. Nelle ondate di calore estivo è il cibo quotidiano di milioni di russi.",
      ko: "오크로시카는 러시아의 여름 냉수프입니다. 케피르(또는 크바스, 발효 빵 음료) 한 그릇에 삶은 감자, 계란, 신선한 오이, 실파, 딜, 슬라이스 소시지를 깍둑썰어 넣습니다. 채소의 아삭함과 차가운 유제품 국물이 어우러지는 상쾌하고 새콤한 수프입니다.\\n\\n오크로시카는 조리하지 않고 조합합니다. 만든 직후 잘 차갑게 해서 제공합니다. 여름 폭염에는 수백만 명의 러시아인이 매일 먹는 음식입니다.",
      hi: "ओक्रोश्का रूस का गर्मियों का ठंडा सूप है — एक कटोरे केफिर (या क्वास, किण्वित ब्रेड पेय) में उबले आलू, अंडे, ताज़ा खीरा, हरा प्याज़, डिल और कटे सॉसेज डाले जाते हैं, सब कुछ छोटे टुकड़ों में। परिणाम एक ताज़गी देने वाला, खट्टा सूप है जो सब्जियों की कुरकुरी बनावट को ठंडे दूध के तरल से मिलाता है।\\n\\nओक्रोश्का पकाया नहीं जाता — बस जोड़ा जाता है। बनाने के तुरंत बाद अच्छी तरह ठंडा करके परोसा जाता है। गर्मियों की लू में यह लाखों रूसियों का रोज़ का खाना है।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 151 done")
