"""Recipes 227-229: Grilled Sea Bream, Sea Bass Provençal, Roast Chicken Diavola."""

RECIPES = []

# ── 227. Grilled Sea Bream ────────────────────────────────────────────
RECIPES.append({
    'id': 227, 'tipType': 'fish', 'pairingsType': 'seafood',
    'image': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sea_bream_grilled.jpg/330px-Sea_bream_grilled.jpg',
    'name': {
        'ro':"Dorada la grătar",'en':"Grilled Sea Bream",'es':"Dorada a la parrilla",'fr':"Daurade grillée",
        'de':"Gegrillte Dorade",'pt':"Dourada grelhada",'ru':"Дорада на гриле",'ar':"دنيس مشوي",
        'zh':"烤鲷鱼",'ja':"鯛のグリル",'hi':"ग्रिल्ड सी ब्रीम",'tr':"Izgara çipura",
        'it':"Orata alla griglia",'ko':"도미 구이",
    },
    'origin': {
        'ro':"Mediterana",'en':"Mediterranean",'es':"Mediterráneo",'fr':"Méditerranée",
        'de':"Mittelmeer",'pt':"Mediterrâneo",'ru':"Средиземноморье",'ar':"حوض المتوسط",
        'zh':"地中海",'ja':"地中海",'hi':"भूमध्यसागरीय",'tr':"Akdeniz",
        'it':"Mediterraneo",'ko':"지중해",
    },
    'category': {
        'ro':"Cină",'en':"Dinner",'es':"Cena",'fr':"Dîner",'de':"Abendessen",'pt':"Jantar",
        'ru':"Ужин",'ar':"عشاء",'zh':"晚餐",'ja':"夕食",'hi':"रात का खाना",'tr':"Akşam yemeği",
        'it':"Cena",'ko':"저녁",
    },
    'ingredients': {
        'ro':["2 dorade întregi (cca 500 g fiecare)","2 lămâi","4 căței usturoi","mărar și pătrunjel proaspăt","cimbru","ulei de măsline extravirgin","sare grunjoasă","piper negru proaspăt"],
        'en':["2 whole sea bream (about 500 g each)","2 lemons","4 garlic cloves","fresh dill and parsley","thyme","extra-virgin olive oil","coarse salt","freshly ground black pepper"],
        'es':["2 doradas enteras (unos 500 g cada una)","2 limones","4 dientes de ajo","eneldo y perejil frescos","tomillo","aceite de oliva virgen extra","sal gruesa","pimienta negra recién molida"],
        'fr':["2 daurades entières (env. 500 g chacune)","2 citrons","4 gousses d'ail","aneth et persil frais","thym","huile d'olive extra vierge","sel grossier","poivre noir fraîchement moulu"],
        'de':["2 ganze Doraden (je ca. 500 g)","2 Zitronen","4 Knoblauchzehen","frischer Dill und Petersilie","Thymian","natives Olivenöl extra","grobes Salz","frisch gemahlener schwarzer Pfeffer"],
        'pt':["2 douradas inteiras (cerca de 500 g cada)","2 limões","4 dentes de alho","endro e salsa frescos","tomilho","azeite virgem extra","sal grosso","pimenta preta moída na hora"],
        'ru':["2 целые дорады (около 500 г каждая)","2 лимона","4 зубчика чеснока","свежий укроп и петрушка","тимьян","оливковое масло экстра вирджин","крупная соль","свежемолотый чёрный перец"],
        'ar':["2 سمكتي دنيس كاملتين (500 غ كل واحدة)","2 ليمونة","4 فصوص ثوم","شبت وبقدونس طازج","زعتر","زيت زيتون بكر ممتاز","ملح خشن","فلفل أسود مطحون طازج"],
        'zh':["整条鲷鱼2条（每条约500克）","柠檬2个","大蒜4瓣","新鲜莳萝和欧芹","百里香","特级初榨橄榄油","粗盐","现磨黑胡椒"],
        'ja':["鯛丸ごと2尾（各約500g）","レモン2個","にんにく4片","フレッシュディルとパセリ","タイム","エクストラバージンオリーブオイル","粗塩","挽きたて黒こしょう"],
        'hi':["2 साबुत सी ब्रीम (हर एक लगभग 500 ग्राम)","2 नींबू","4 लहसुन की कलियाँ","ताज़ा डिल और पार्सले","थाइम","एक्स्ट्रा-वर्जिन ज़ैतून तेल","मोटा नमक","ताज़ी पिसी काली मिर्च"],
        'tr':["2 bütün çipura (yaklaşık 500 g)","2 limon","4 diş sarımsak","taze dereotu ve maydanoz","kekik","sızma zeytinyağı","iri tane tuz","taze çekilmiş karabiber"],
        'it':["2 orate intere (circa 500 g ciascuna)","2 limoni","4 spicchi d'aglio","aneto e prezzemolo freschi","timo","olio d'oliva extravergine","sale grosso","pepe nero macinato fresco"],
        'ko':["통도미 2마리(약 500g씩)","레몬 2개","마늘 4쪽","신선한 딜과 파슬리","타임","엑스트라 버진 올리브 오일","굵은 소금","갓 갈은 흑후추"],
    },
    'howIsMade': {
        'ro':"Curăță doradele, fă 3 crestături pe fiecare parte. Sărează interiorul și exteriorul. În burta peștelui pune felii de lămâie, usturoi feliat, mărar, pătrunjel și cimbru. Stropește cu ulei de măsline. Grătar încins cu cărbuni, 6-8 min pe fiecare parte până carnea se desprinde de pe os. Servește cu mai multă lămâie tăiată și o salată grecească.",
        'en':"Scale and gut the sea bream, make 3 slashes on each side. Salt inside and out. Stuff the belly with lemon slices, sliced garlic, dill, parsley and thyme. Drizzle with olive oil. Grill over hot coals 6-8 minutes per side until the flesh lifts off the bone. Serve with extra lemon wedges and a Greek salad alongside.",
        'es':"Limpia las doradas y haz 3 cortes en cada lado. Sala por dentro y por fuera. Rellena el vientre con rodajas de limón, ajo en láminas, eneldo, perejil y tomillo. Riega con aceite. Asa sobre brasas calientes 6-8 min por lado hasta que la carne se separe del hueso. Sirve con gajos de limón y ensalada griega.",
        'fr':"Écaillez et videz les daurades, entaillez 3 fois chaque côté. Salez l'intérieur et l'extérieur. Garnissez le ventre de rondelles de citron, ail tranché, aneth, persil et thym. Arrosez d'huile d'olive. Faites griller sur charbons ardents 6-8 min par face jusqu'à ce que la chair se détache de l'arête. Servez avec quartiers de citron et salade grecque.",
        'de':"Doraden schuppen und ausnehmen, je Seite 3-mal einschneiden. Innen und außen salzen. Den Bauch mit Zitronenscheiben, geschnittenem Knoblauch, Dill, Petersilie und Thymian füllen. Mit Olivenöl beträufeln. Auf heißen Kohlen 6-8 Min. pro Seite grillen, bis sich das Fleisch von der Gräte löst. Mit Zitronenspalten und griechischem Salat servieren.",
        'pt':"Escame e amanhe as douradas, faça 3 cortes em cada lado. Sal por dentro e por fora. Recheie a barriga com rodelas de limão, alho fatiado, endro, salsa e tomilho. Regue com azeite. Grelhe em brasas quentes 6-8 min de cada lado até a carne soltar do osso. Sirva com gomos de limão e salada grega.",
        'ru':"Очистите дораду от чешуи и выпотрошите, сделайте по 3 надреза с каждой стороны. Посолите внутри и снаружи. Брюшко заполните ломтиками лимона, чесноком, укропом, петрушкой и тимьяном. Сбрызните маслом. Жарьте на углях по 6-8 минут с каждой стороны, пока мякоть не начнёт отделяться от кости. Подавайте с дольками лимона и греческим салатом.",
        'ar':"نظّفي سمك الدنيس واصنعي 3 شقوق على كل جانب. ملّحي من الداخل والخارج. احشي البطن بشرائح الليمون والثوم والشبت والبقدونس والزعتر. اسكبي زيت الزيتون. اشوي على جمر حار 6-8 دقائق لكل جانب حتى ينفصل اللحم عن العظم. قدّمي مع شرائح ليمون إضافية وسلطة يونانية.",
        'zh':"鲷鱼去鳞去内脏，每面切3刀。鱼里鱼外撒盐。鱼腹塞入柠檬片、蒜片、莳萝、欧芹和百里香。淋橄榄油。炭火炽热时每面烤6-8分钟，至鱼肉能从骨头脱落。配额外柠檬片和希腊沙拉一起上桌。",
        'ja':"鯛のうろこと内臓を取り、両面に3本切れ目を入れる。中も外も塩。腹にレモン、にんにく、ディル、パセリ、タイムを詰める。オリーブオイル。熱した炭火で片面6〜8分、身が骨から外れるまで焼く。レモンとギリシャサラダを添えて。",
        'hi':"सी ब्रीम साफ करें, हर तरफ 3 कट लगाएँ। अंदर बाहर नमक। पेट में नींबू, लहसुन, डिल, पार्सले और थाइम भरें। ज़ैतून तेल छिड़कें। गरम कोयलों पर हर तरफ 6-8 मिनट तक तब तक ग्रिल करें जब तक मांस हड्डी से अलग न होने लगे। नींबू और ग्रीक सलाद के साथ परोसें।",
        'tr':"Çipuraların pullarını ve iç organlarını temizleyin, her iki yüze 3 çentik atın. İç ve dışı tuzlayın. Karın boşluğuna limon dilimleri, sarımsak, dereotu, maydanoz ve kekik doldurun. Zeytinyağı gezdirin. Kor halindeki kömürde her yüzü 6-8 dakika, et kemikten ayrılana kadar pişirin. Limon dilimleri ve Yunan salatasıyla servis edin.",
        'it':"Squama e svisera le orate, fai 3 incisioni per lato. Sala dentro e fuori. Riempi la pancia con fette di limone, aglio affettato, aneto, prezzemolo e timo. Irrora con olio d'oliva. Griglia sui carboni ardenti 6-8 minuti per lato fino a quando la carne si stacca dalla lisca. Servi con spicchi di limone e insalata greca.",
        'ko':"도미 비늘과 내장을 손질하고 양면에 칼집 3개씩. 안팎으로 소금. 배에 레몬 슬라이스, 마늘, 딜, 파슬리, 타임을 채웁니다. 올리브 오일. 뜨거운 숯불 위에서 한 면당 6-8분, 살이 뼈에서 떨어질 때까지 굽습니다. 레몬 조각과 그리스 샐러드를 곁들입니다.",
    },
    'originText': {
        'ro':"Dorada la grătar este sufletul tavernelor mediteraneene din Grecia până în Cipru — pește alb întreg, sărat doar, umplut cu lămâie și ierburi, ars pe cărbuni până când pielea pârâie și carnea se desprinde de pe os.",
        'en':"Grilled sea bream is the soul of Mediterranean tavernas from Greece to Cyprus — a whole white-fleshed fish, simply salted, stuffed with lemon and herbs, charred on coals until the skin crackles and the flesh slips off the bone.",
        'es':"La dorada a la parrilla es el alma de las tabernas mediterráneas desde Grecia hasta Chipre — pescado blanco entero, solo salado, relleno de limón y hierbas, asado en brasas hasta que la piel cruje y la carne se separa del hueso.",
        'fr':"La daurade grillée est l'âme des tavernes méditerranéennes de la Grèce à Chypre — un poisson à chair blanche entier, simplement salé, farci de citron et d'herbes, grillé sur les braises jusqu'à ce que la peau croustille et la chair se détache de l'arête.",
        'de':"Gegrillte Dorade ist die Seele mediterraner Tavernen von Griechenland bis Zypern — ein ganzer weißfleischiger Fisch, schlicht gesalzen, mit Zitrone und Kräutern gefüllt, über Kohlen verkohlt, bis die Haut knistert und das Fleisch von der Gräte fällt.",
        'pt':"A dourada grelhada é a alma das tabernas mediterrânicas, da Grécia ao Chipre — peixe inteiro de carne branca, apenas salgado, recheado com limão e ervas, brasado em carvão até a pele estalar e a carne soltar do osso.",
        'ru':"Дорада на гриле — это душа средиземноморских таверн от Греции до Кипра: целая белая рыба, только посоленная, с начинкой из лимона и трав, обугленная на углях так, что кожа хрустит, а мякоть отходит от кости.",
        'ar':"الدنيس المشوي هو روح حانات البحر المتوسط من اليونان إلى قبرص — سمكة بيضاء كاملة، لا تعرف غير الملح، محشوّة بالليمون والأعشاب، ومشويّة على الجمر حتى يطقطق جلدها وينفصل لحمها عن العظم.",
        'zh':"烤鲷鱼是从希腊到塞浦路斯的地中海小酒馆灵魂菜——整条白肉鱼，只用盐，腹中塞柠檬与香草，炭火烤至鱼皮噼啪作响、鱼肉脱骨。",
        'ja':"鯛のグリルはギリシャからキプロスまで地中海のタベルナの魂 — 白身魚を一尾まるごと塩だけで、レモンとハーブを詰めて炭火で焼く。皮はパチパチと弾け、身は骨からほろりと外れる。",
        'hi':"ग्रिल्ड सी ब्रीम ग्रीस से साइप्रस तक भूमध्यसागरीय ताबेर्ना की आत्मा है — साबुत सफ़ेद मछली, सिर्फ़ नमक, पेट में नींबू और जड़ी-बूटियाँ, कोयले पर तब तक भुनी जब तक त्वचा कड़कड़ाए और मांस हड्डी से छूट जाए।",
        'tr':"Izgara çipura, Yunanistan'dan Kıbrıs'a Akdeniz meyhanelerinin ruhudur — beyaz etli bütün bir balık, sadece tuzlu, karnında limon ve otlar, kor ateşte derisi çıtırdayana ve eti kılçıktan ayrılana dek pişirilir.",
        'it':"L'orata alla griglia è l'anima delle taverne mediterranee dalla Grecia a Cipro — pesce intero a carne bianca, solo salato, farcito di limone ed erbe, abbrustolito sui carboni finché la pelle scricchiola e la polpa si stacca dalla lisca.",
        'ko':"도미 구이는 그리스부터 키프로스에 이르는 지중해 타베르나의 영혼이다 — 통째의 흰살 생선을 소금만으로, 레몬과 허브를 채워, 숯불 위에서 껍질이 바삭거리고 살이 뼈에서 떨어질 때까지 굽는다.",
    },
})

# ── 228. Sea Bass Provençal ────────────────────────────────────────────
RECIPES.append({
    'id': 228, 'tipType': 'fish', 'pairingsType': 'seafood',
    'image': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Branzino_al_forno.jpg/330px-Branzino_al_forno.jpg',
    'name': {
        'ro':"Lup de mare provensal",'en':"Sea Bass Provençal",'es':"Lubina a la provenzal",'fr':"Loup de mer à la provençale",
        'de':"Wolfsbarsch provençal",'pt':"Robalo à provençal",'ru':"Сибас по-провансальски",'ar':"قاروص بروفنسالي",
        'zh':"普罗旺斯鲈鱼",'ja':"スズキのプロヴァンス風",'hi':"प्रोवांस सी बास",'tr':"Provence usulü levrek",
        'it':"Branzino alla provenzale",'ko':"프로방스식 농어",
    },
    'origin': {
        'ro':"Franța",'en':"France",'es':"Francia",'fr':"France",'de':"Frankreich",'pt':"França",
        'ru':"Франция",'ar':"فرنسا",'zh':"法国",'ja':"フランス",'hi':"फ़्रांस",'tr':"Fransa",
        'it':"Francia",'ko':"프랑스",
    },
    'category': {
        'ro':"Cină",'en':"Dinner",'es':"Cena",'fr':"Dîner",'de':"Abendessen",'pt':"Jantar",
        'ru':"Ужин",'ar':"عشاء",'zh':"晚餐",'ja':"夕食",'hi':"रात का खाना",'tr':"Akşam yemeği",
        'it':"Cena",'ko':"저녁",
    },
    'ingredients': {
        'ro':["2 fileuri de lup de mare (cca 200 g fiecare)","400 g roșii cherry","12 măsline negre Niçoise","2 căței usturoi","1 lingură capere","1 ramură rozmarin","cimbru proaspăt","ulei de măsline, vin alb sec","sare, piper, busuioc"],
        'en':["2 sea bass fillets (about 200 g each)","400 g cherry tomatoes","12 black Niçoise olives","2 garlic cloves","1 tbsp capers","1 sprig rosemary","fresh thyme","olive oil, dry white wine","salt, pepper, basil"],
        'es':["2 lomos de lubina (unos 200 g cada uno)","400 g de tomates cherry","12 aceitunas negras niçoise","2 dientes de ajo","1 cda de alcaparras","1 rama de romero","tomillo fresco","aceite de oliva, vino blanco seco","sal, pimienta, albahaca"],
        'fr':["2 filets de loup de mer (env. 200 g chacun)","400 g de tomates cerises","12 olives noires niçoises","2 gousses d'ail","1 c. à s. de câpres","1 brin de romarin","thym frais","huile d'olive, vin blanc sec","sel, poivre, basilic"],
        'de':["2 Wolfsbarschfilets (je ca. 200 g)","400 g Kirschtomaten","12 schwarze Niçoise-Oliven","2 Knoblauchzehen","1 EL Kapern","1 Zweig Rosmarin","frischer Thymian","Olivenöl, trockener Weißwein","Salz, Pfeffer, Basilikum"],
        'pt':["2 lombos de robalo (cerca de 200 g cada)","400 g de tomates cereja","12 azeitonas pretas niçoise","2 dentes de alho","1 colher de sopa de alcaparras","1 ramo de alecrim","tomilho fresco","azeite, vinho branco seco","sal, pimenta, manjericão"],
        'ru':["2 филе сибаса (около 200 г каждое)","400 г черри-помидоров","12 чёрных маслин Niçoise","2 зубчика чеснока","1 ст. л. каперсов","1 веточка розмарина","свежий тимьян","оливковое масло, сухое белое вино","соль, перец, базилик"],
        'ar':["2 فيليه قاروص (نحو 200 غ كل واحدة)","400 غ طماطم كرزية","12 زيتونة سوداء نيسوازية","2 فصوص ثوم","1 ملعقة كبيرة كبر","1 غصن إكليل الجبل","زعتر طازج","زيت زيتون، نبيذ أبيض جاف","ملح، فلفل، ريحان"],
        'zh':["鲈鱼柳2片（每片约200克）","樱桃番茄400克","黑橄榄12颗","大蒜2瓣","酸豆1汤匙","迷迭香1枝","新鲜百里香","橄榄油、干白葡萄酒","盐、胡椒、罗勒"],
        'ja':["スズキの切り身2枚（各約200g）","ミニトマト400g","ニース風黒オリーブ12個","にんにく2片","ケッパー大さじ1","ローズマリー1枝","フレッシュタイム","オリーブオイル、辛口白ワイン","塩、こしょう、バジル"],
        'hi':["2 सी बास फ़िले (हर एक लगभग 200 ग्राम)","400 ग्राम चेरी टमाटर","12 काले निसवाज़ ज़ैतून","2 लहसुन की कलियाँ","1 बड़ा चम्मच केपर्स","1 रोज़मेरी की डाली","ताज़ा थाइम","ज़ैतून तेल, ड्राई व्हाइट वाइन","नमक, काली मिर्च, तुलसी"],
        'tr':["2 levrek fileto (yaklaşık 200 g)","400 g cherry domates","12 siyah Niçoise zeytini","2 diş sarımsak","1 yk kapari","1 dal biberiye","taze kekik","zeytinyağı, sek beyaz şarap","tuz, karabiber, fesleğen"],
        'it':"".join([]) if False else None,
        'ko':"".join([]) if False else None,
    },
    'howIsMade': {
        'ro':"Încălzește cuptorul la 200°C. Într-o tavă unsă pune roșiile cherry tăiate, măslinele, capere, usturoi feliat, cimbru, rozmarin. Stropește cu ulei și vin. Așază fileurile de pește deasupra, sare, piper. Coace 15-18 min, până peștele e opac și suc curge din roșii. Presară busuioc proaspăt, servește cu pâine pentru sosul provensal.",
        'en':"Heat the oven to 200°C. In an oiled dish lay halved cherry tomatoes, olives, capers, sliced garlic, thyme and rosemary. Drizzle with olive oil and white wine. Place the fish fillets on top, season with salt and pepper. Bake 15-18 minutes until the fish is opaque and juices run from the tomatoes. Scatter fresh basil, serve with bread to mop the Provençal sauce.",
        'es':"Calienta el horno a 200°C. En una fuente engrasada pon los tomates cherry partidos, aceitunas, alcaparras, ajo en láminas, tomillo y romero. Riega con aceite y vino blanco. Coloca los lomos de lubina encima, salpimenta. Hornea 15-18 min hasta que el pescado esté opaco y los tomates suelten jugo. Espolvorea albahaca fresca, sirve con pan para mojar.",
        'fr':"Préchauffez le four à 200°C. Dans un plat huilé, disposez les tomates cerises coupées, olives, câpres, ail tranché, thym et romarin. Arrosez d'huile et de vin blanc. Posez les filets de loup dessus, salez, poivrez. Enfournez 15-18 min jusqu'à ce que le poisson soit opaque et que les tomates rendent leur jus. Parsemez de basilic frais, servez avec du pain pour saucer.",
        'de':"Ofen auf 200°C vorheizen. In einer eingeölten Form halbierte Kirschtomaten, Oliven, Kapern, geschnittenen Knoblauch, Thymian und Rosmarin verteilen. Mit Olivenöl und Weißwein beträufeln. Fischfilets darauflegen, salzen und pfeffern. 15-18 Min. backen, bis der Fisch undurchsichtig ist und die Tomaten Saft ziehen. Frisches Basilikum darüber, mit Brot zum Tunken servieren.",
        'pt':"Aqueça o forno a 200°C. Num tabuleiro untado disponha os tomates cereja partidos, azeitonas, alcaparras, alho fatiado, tomilho e alecrim. Regue com azeite e vinho branco. Coloque os lombos de robalo por cima, tempere com sal e pimenta. Leve ao forno 15-18 min até o peixe ficar opaco e os tomates soltarem sumo. Polvilhe com manjericão fresco, sirva com pão.",
        'ru':"Разогрейте духовку до 200°C. В смазанной форме разложите половинки черри, маслины, каперсы, чеснок, тимьян и розмарин. Сбрызните маслом и белым вином. Сверху положите филе, посолите, поперчите. Запекайте 15-18 минут, пока рыба не станет непрозрачной и помидоры не пустят сок. Посыпьте свежим базиликом, подавайте с хлебом, чтобы собрать соус.",
        'ar':"سخّني الفرن إلى 200°م. في صينية مدهونة بالزيت ضعي الطماطم الكرزية المقطعة والزيتون والكبر والثوم والزعتر وإكليل الجبل. اسكبي زيت الزيتون والنبيذ الأبيض. ضعي فيليه السمك فوقها، تبّلي بالملح والفلفل. اخبزي 15-18 دقيقة حتى يصبح السمك معتماً وتسيل عصارة الطماطم. انثري الريحان الطازج، قدّمي مع الخبز.",
        'zh':"烤箱预热200°C。烤盘内放对半切的樱桃番茄、橄榄、酸豆、蒜片、百里香和迷迭香。淋橄榄油和白葡萄酒。鱼柳放在最上层，撒盐和胡椒。烤15-18分钟至鱼肉变白、番茄出汁。撒新鲜罗勒，配面包蘸汁。",
        'ja':"オーブンを200℃に予熱。耐熱皿に半分に切ったミニトマト、オリーブ、ケッパー、にんにく、タイム、ローズマリーを敷く。オリーブオイルと白ワインをかける。スズキの切り身をのせ、塩こしょう。15〜18分、魚が白くなりトマトの汁が出るまで焼く。フレッシュバジルを散らし、パンをソースに浸して食べる。",
        'hi':"ओवन 200°C पर गरम करें। तेल लगी बेकिंग डिश में आधे कटे चेरी टमाटर, ज़ैतून, केपर्स, स्लाइस लहसुन, थाइम और रोज़मेरी रखें। ज़ैतून तेल और सफ़ेद वाइन डालें। ऊपर सी बास फ़िले रखें, नमक काली मिर्च लगाएँ। 15-18 मिनट तक तब तक बेक करें जब तक मछली अपारदर्शी न हो और टमाटर रस छोड़ें। ताज़ी तुलसी छिड़कें, सॉस सोखने के लिए ब्रेड के साथ परोसें।",
        'tr':"Fırını 200°C'ye ısıtın. Yağlanmış bir kabın içine ikiye bölünmüş cherry domatesleri, zeytin, kapari, dilim sarımsak, kekik ve biberiyeyi yayın. Zeytinyağı ve beyaz şarap gezdirin. Levrek filetolarını üzerine yerleştirin, tuz karabiber. 15-18 dakika, balık opak ve domatesler sulanana dek pişirin. Taze fesleğen serpin, sosa banmak için ekmekle servis edin.",
        'it':"Scalda il forno a 200°C. In una teglia oliata disponi i pomodorini tagliati a metà, olive, capperi, aglio affettato, timo e rosmarino. Irrora con olio d'oliva e vino bianco. Adagia i filetti di branzino sopra, sala e pepa. Cuoci 15-18 minuti finché il pesce è opaco e i pomodorini rilasciano sugo. Cospargi di basilico fresco, servi con pane per fare scarpetta.",
        'ko':"오븐을 200°C로 예열. 기름 두른 베이킹 그릇에 반으로 자른 방울토마토, 올리브, 케이퍼, 슬라이스 마늘, 타임, 로즈마리를 깐다. 올리브유와 화이트 와인을 두른다. 그 위에 농어 필레를 올리고 소금·후추로 간한다. 15-18분, 생선이 불투명해지고 토마토에서 즙이 나올 때까지 굽는다. 신선한 바질을 흩뿌리고 소스를 찍어 먹을 빵과 함께 낸다.",
    },
    'originText': {
        'ro':"Loup de mer à la provençale unește lupul de mare al Mediteranei cu vocabularul Provenței — roșii cherry, măsline negre, capere, usturoi, ierburi de garrigue. O singură tavă, un singur cuptor, un singur miros: vară pe coastă.",
        'en':"Loup de mer à la provençale weds the Mediterranean sea bass with the vocabulary of Provence — cherry tomatoes, black olives, capers, garlic, herbs from the garrigue. One pan, one oven, one scent: summer on the coast.",
        'es':"El loup de mer à la provençale casa la lubina del Mediterráneo con el vocabulario de la Provenza — tomates cherry, aceitunas negras, alcaparras, ajo, hierbas de la garriga. Una sola fuente, un solo horno, un solo aroma: verano en la costa.",
        'fr':"Le loup de mer à la provençale marie le loup de mer méditerranéen au vocabulaire de la Provence — tomates cerises, olives noires, câpres, ail, herbes de la garrigue. Un seul plat, un seul four, un seul parfum : l'été sur la côte.",
        'de':"Loup de mer à la provençale verheiratet den mediterranen Wolfsbarsch mit dem Vokabular der Provence — Kirschtomaten, schwarze Oliven, Kapern, Knoblauch, Kräuter der Garrigue. Eine Form, ein Ofen, ein Duft: Sommer an der Küste.",
        'pt':"O loup de mer à la provençale une o robalo do Mediterrâneo ao vocabulário da Provença — tomates cereja, azeitonas pretas, alcaparras, alho, ervas da garrigue. Uma só assadeira, um só forno, um só perfume: verão na costa.",
        'ru':"Loup de mer à la provençale соединяет средиземноморского сибаса со словарём Прованса — черри, чёрные маслины, каперсы, чеснок, травы гарриги. Одна форма, одна духовка, один аромат: лето на побережье.",
        'ar':"Loup de mer à la provençale يجمع قاروص المتوسط بمفردات بروفانس — طماطم كرزية وزيتون أسود وكبر وثوم وأعشاب الغاريغ. صينية واحدة، فرن واحد، عطر واحد: صيف على الساحل.",
        'zh':"普罗旺斯鲈鱼把地中海的鲈鱼嫁给普罗旺斯的语言——樱桃番茄、黑橄榄、酸豆、大蒜、灌木丛香草。一只烤盘、一只烤箱、一种香气：海岸的夏天。",
        'ja':"Loup de mer à la provençaleは地中海のスズキにプロヴァンスの語彙を重ねる — ミニトマト、黒オリーブ、ケッパー、にんにく、ガリーグのハーブ。ひとつの皿、ひとつのオーブン、ひとつの香り：海辺の夏。",
        'hi':"Loup de mer à la provençale भूमध्यसागरीय सी बास को प्रोवांस के शब्दकोश से जोड़ता है — चेरी टमाटर, काले ज़ैतून, केपर्स, लहसुन, garrigue की जड़ी-बूटियाँ। एक थाली, एक ओवन, एक खुशबू: तट का ग्रीष्म।",
        'tr':"Loup de mer à la provençale Akdeniz levreğini Provence'ın kelime dağarcığıyla evlendirir — cherry domates, siyah zeytin, kapari, sarımsak, garrigue otları. Tek tava, tek fırın, tek bir koku: sahildeki yaz.",
        'it':"Il loup de mer à la provençale sposa il branzino mediterraneo al vocabolario della Provenza — pomodorini, olive nere, capperi, aglio, erbe della garrigue. Una teglia, un forno, un profumo: l'estate sulla costa.",
        'ko':"Loup de mer à la provençale은 지중해 농어를 프로방스의 언어와 결혼시킨다 — 방울토마토, 검은 올리브, 케이퍼, 마늘, 가리그 허브. 한 팬, 한 오븐, 하나의 향기: 해안의 여름.",
    },
})

# Patch missing ingredients on recipe 228 (it, ko):
RECIPES[-1]['ingredients']['it'] = [
    "2 filetti di branzino (circa 200 g ciascuno)","400 g di pomodorini ciliegini","12 olive nere niçoise","2 spicchi d'aglio",
    "1 cucchiaio di capperi","1 rametto di rosmarino","timo fresco","olio d'oliva, vino bianco secco","sale, pepe, basilico",
]
RECIPES[-1]['ingredients']['ko'] = [
    "농어 필레 2장(각 약 200g)","방울토마토 400g","검은 니스 올리브 12개","마늘 2쪽",
    "케이퍼 1큰술","로즈마리 한 줄기","신선한 타임","올리브유, 드라이 화이트 와인","소금, 후추, 바질",
]

# ── 229. Roast Chicken Diavola ─────────────────────────────────────────
RECIPES.append({
    'id': 229, 'tipType': 'meat', 'pairingsType': 'italian',
    'image': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Pollo_alla_diavola.jpg/330px-Pollo_alla_diavola.jpg',
    'name': {
        'ro':"Pui la cuptor alla diavola",'en':"Roast Chicken Diavola",'es':"Pollo asado alla diavola",'fr':"Poulet rôti alla diavola",
        'de':"Brathähnchen alla diavola",'pt':"Frango assado alla diavola",'ru':"Курица алла дьявола",'ar':"دجاج محمر ألا ديافولا",
        'zh':"魔鬼烤鸡",'ja':"ローストチキン・アッラ・ディアボラ",'hi':"रोस्ट चिकन डियावोला",'tr':"Diavola usulü fırın tavuk",
        'it':"Pollo alla diavola",'ko':"디아볼라 로스트 치킨",
    },
    'origin': {
        'ro':"Italia",'en':"Italy",'es':"Italia",'fr':"Italie",'de':"Italien",'pt':"Itália",
        'ru':"Италия",'ar':"إيطاليا",'zh':"意大利",'ja':"イタリア",'hi':"इटली",'tr':"İtalya",
        'it':"Italia",'ko':"이탈리아",
    },
    'category': {
        'ro':"Cină",'en':"Dinner",'es':"Cena",'fr':"Dîner",'de':"Abendessen",'pt':"Jantar",
        'ru':"Ужин",'ar':"عشاء",'zh':"晚餐",'ja':"夕食",'hi':"रात का खाना",'tr':"Akşam yemeği",
        'it':"Cena",'ko':"저녁",
    },
    'ingredients': {
        'ro':["1 pui întreg, despicat (spatchcocked)","4 căței usturoi zdrobiți","2 linguri ardei iute zdrobit (peperoncino)","1 linguriță boia afumată","1 lămâie (suc și coajă)","3 linguri ulei de măsline","cimbru și rozmarin","sare grunjoasă, piper negru"],
        'en':["1 whole chicken, spatchcocked","4 garlic cloves, crushed","2 tbsp crushed chilli flakes (peperoncino)","1 tsp smoked paprika","1 lemon (juice and zest)","3 tbsp olive oil","thyme and rosemary","coarse salt, black pepper"],
        'es':["1 pollo entero abierto en mariposa","4 dientes de ajo machacados","2 cdas de guindilla en copos (peperoncino)","1 cdta de pimentón ahumado","1 limón (zumo y ralladura)","3 cdas de aceite de oliva","tomillo y romero","sal gruesa, pimienta negra"],
        'fr':["1 poulet entier ouvert en crapaudine","4 gousses d'ail écrasées","2 c. à s. de piment en flocons (peperoncino)","1 c. à c. de paprika fumé","1 citron (jus et zeste)","3 c. à s. d'huile d'olive","thym et romarin","sel grossier, poivre noir"],
        'de':["1 ganzes Hähnchen, flach geschnitten","4 zerdrückte Knoblauchzehen","2 EL Chiliflocken (Peperoncino)","1 TL geräuchertes Paprikapulver","1 Zitrone (Saft und Abrieb)","3 EL Olivenöl","Thymian und Rosmarin","grobes Salz, schwarzer Pfeffer"],
        'pt':["1 frango inteiro, aberto em borboleta","4 dentes de alho esmagados","2 colheres de sopa de malagueta em flocos","1 colher de chá de paprica fumada","1 limão (sumo e raspa)","3 colheres de sopa de azeite","tomilho e alecrim","sal grosso, pimenta preta"],
        'ru':["1 целая курица, распластанная (спатчкок)","4 зубчика чеснока, раздавленных","2 ст. л. хлопьев чили (пеперончино)","1 ч. л. копчёной паприки","1 лимон (сок и цедра)","3 ст. л. оливкового масла","тимьян и розмарин","крупная соль, чёрный перец"],
        'ar':["1 دجاجة كاملة مفتوحة كالفراشة","4 فصوص ثوم مهروسة","2 ملعقة كبيرة فلفل أحمر مطحون (بيبيرونتشينو)","1 ملعقة صغيرة بابريكا مدخنة","1 ليمونة (عصير وقشر مبشور)","3 ملاعق كبيرة زيت زيتون","زعتر وإكليل الجبل","ملح خشن، فلفل أسود"],
        'zh':"".join([]) if False else None,
        'ja':"".join([]) if False else None,
        'hi':"".join([]) if False else None,
        'tr':"".join([]) if False else None,
        'it':"".join([]) if False else None,
        'ko':"".join([]) if False else None,
    },
    'howIsMade': {
        'ro':"Marinează puiul cu ulei, usturoi, ardei iute, boia, suc și coajă de lămâie, ierburi, sare grunjoasă — minim 1 oră, ideal peste noapte. Cuptor la 220°C. Așază puiul cu pielea în sus pe o tavă încinsă, presează ușor cu o tigaie grea (presatul autentic alla diavola). Coace 35-40 min până pielea e crocantă și sucul curge limpede. Odihnește 10 min, taie, servește cu lămâie suplimentară.",
        'en':"Marinate the chicken with oil, garlic, chilli, paprika, lemon juice and zest, herbs and coarse salt — at least 1 hour, ideally overnight. Heat oven to 220°C. Place skin-up on a hot tray, weigh down with a heavy pan (the authentic diavola press). Roast 35-40 minutes until the skin is crisp and the juices run clear. Rest 10 minutes, carve, serve with extra lemon.",
        'es':"Marina el pollo con aceite, ajo, guindilla, pimentón, zumo y ralladura de limón, hierbas y sal gruesa — al menos 1 hora, idealmente toda la noche. Horno a 220°C. Coloca el pollo con piel hacia arriba en una bandeja caliente, presiona con una sartén pesada (la auténtica presión alla diavola). Asa 35-40 min hasta que la piel esté crujiente y los jugos salgan claros. Reposa 10 min, trincha, sirve con limón.",
        'fr':"Faites mariner le poulet avec huile, ail, piment, paprika, jus et zeste de citron, herbes et sel grossier — au moins 1 heure, idéalement toute la nuit. Four à 220°C. Posez la peau vers le haut sur une plaque chaude, pressez avec une poêle lourde (l'authentique pression alla diavola). Rôtissez 35-40 min jusqu'à ce que la peau soit croustillante et le jus clair. Reposez 10 min, découpez, servez avec citron.",
        'de':"Hähnchen mit Öl, Knoblauch, Chili, Paprika, Zitronensaft und -abrieb, Kräutern und grobem Salz marinieren — mind. 1 Stunde, idealerweise über Nacht. Ofen auf 220°C vorheizen. Hähnchen mit der Haut nach oben auf ein heißes Blech legen, mit schwerer Pfanne beschweren (echte Diavola-Pressung). 35-40 Min. braten, bis die Haut knusprig und der Saft klar ist. 10 Min. ruhen lassen, tranchieren, mit Zitrone servieren.",
        'pt':"Marine o frango com azeite, alho, malagueta, paprica, sumo e raspa de limão, ervas e sal grosso — pelo menos 1 hora, idealmente de um dia para o outro. Forno a 220°C. Coloque com a pele para cima num tabuleiro quente, pressione com uma frigideira pesada (a autêntica pressão alla diavola). Asse 35-40 min até a pele estar crocante e os sucos saírem límpidos. Repouse 10 min, trinche, sirva com limão.",
        'ru':"Замаринуйте курицу в масле с чесноком, чили, паприкой, лимонным соком и цедрой, травами и крупной солью — минимум 1 час, лучше на ночь. Духовка 220°C. Положите кожей вверх на горячий противень, придавите тяжёлой сковородой (классический пресс алла дьявола). Запекайте 35-40 минут до хрустящей кожи и прозрачного сока. Дайте отдохнуть 10 минут, разделайте, подавайте с лимоном.",
        'ar':"تبّلي الدجاجة بالزيت والثوم والفلفل والبابريكا وعصير وقشر الليمون والأعشاب والملح الخشن — ساعة على الأقل، ويفضل ليلة كاملة. سخّني الفرن إلى 220°م. ضعي الدجاجة بالجلد إلى الأعلى على صينية ساخنة، اضغطي بمقلاة ثقيلة (ضغطة ألا ديافولا الأصيلة). اشوي 35-40 دقيقة حتى يصبح الجلد مقرمشاً وعصارة الدجاج صافية. اتركيها ترتاح 10 دقائق، قطّعيها وقدّميها مع الليمون.",
        'zh':"鸡用油、大蒜、辣椒、烟熏甜椒粉、柠檬汁与皮屑、香草和粗盐腌制，至少1小时，最好隔夜。烤箱预热220°C。鸡皮朝上放在烧热的烤盘上，用沉重的平底锅压住（正宗的alla diavola压制）。烤35-40分钟，至鸡皮酥脆、汁水清澈。静置10分钟后切块，配额外柠檬上桌。",
        'ja':"鶏肉をオイル、にんにく、唐辛子、スモークパプリカ、レモン汁と皮、ハーブ、粗塩でマリネする — 最低1時間、できれば一晩。オーブンを220℃に予熱。熱した天板に皮を上にして置き、重いフライパンで押さえる（本場のアッラ・ディアボラの押し焼き）。35〜40分、皮がパリッとし、肉汁が透明になるまで焼く。10分休ませてから切り分け、レモンを添えて。",
        'hi':"चिकन को तेल, लहसुन, मिर्च, स्मोक्ड पपरिका, नींबू रस और छिलका, जड़ी-बूटियाँ और मोटे नमक में मैरिनेट करें — कम से कम 1 घंटा, बेहतर हो रात भर। ओवन 220°C गरम। गरम ट्रे पर त्वचा ऊपर रखें, भारी पैन से दबाएँ (असली alla diavola दबाव)। 35-40 मिनट तक त्वचा कुरकुरी और रस साफ़ न होने तक भुनें। 10 मिनट विश्राम, काटें, अतिरिक्त नींबू के साथ परोसें।",
        'tr':"Tavuğu zeytinyağı, sarımsak, pul biber, tütsülü kırmızı toz biber, limon suyu ve kabuğu, otlar ve iri tane tuzla marine edin — en az 1 saat, tercihen gece boyu. Fırını 220°C'ye ısıtın. Sıcak tepsiye derisi üste gelecek şekilde koyun, ağır bir tava ile bastırın (asıl alla diavola presi). 35-40 dakika, deri çıtırlaşıp suları berrak akana kadar pişirin. 10 dakika dinlendirin, parçalayın, ekstra limonla servis edin.",
        'it':"Marina il pollo con olio, aglio, peperoncino, paprica, succo e scorza di limone, erbe e sale grosso — almeno 1 ora, idealmente tutta la notte. Forno a 220°C. Adagia pelle in su su una teglia rovente, schiaccia con una padella pesante (la pressione autentica alla diavola). Inforna 35-40 minuti finché la pelle è croccante e i succhi limpidi. Riposa 10 minuti, taglia, servi con altro limone.",
        'ko':"닭을 올리브유, 마늘, 고추, 훈제 파프리카, 레몬즙과 껍질, 허브, 굵은 소금에 재웁니다 — 최소 1시간, 가능하면 하룻밤. 오븐 220°C. 뜨거운 팬에 껍질을 위로 놓고 무거운 팬으로 눌러 굽습니다(전통 알라 디아볼라 압착). 35-40분, 껍질이 바삭하고 육즙이 맑게 나올 때까지 굽습니다. 10분 휴지 후 자르고 추가 레몬과 함께 냅니다.",
    },
    'originText': {
        'ro':"Pollo alla diavola este pui despicat și presat sub o cărămidă pe foc, marinat în ulei de măsline, ardei iute, lămâie și rozmarin. Numele 'diavola' (al diavolului) vine de la usturul ardeiului iute toscan și de la fumul cărbunilor.",
        'en':"Pollo alla diavola is a spatchcocked chicken pressed under a brick over fire, marinated in olive oil, fierce chilli, lemon and rosemary. The name 'diavola' (of the devil) comes from the sting of Tuscan chilli and from the smoke of the coals.",
        'es':"El pollo alla diavola es un pollo abierto y presionado bajo un ladrillo sobre el fuego, marinado en aceite, guindilla fiera, limón y romero. El nombre 'diavola' (del diablo) viene del picante de la guindilla toscana y del humo de las brasas.",
        'fr':"Le pollo alla diavola est un poulet ouvert et écrasé sous une brique sur le feu, mariné dans huile, piment ardent, citron et romarin. Le nom 'diavola' (du diable) vient du piquant du piment toscan et de la fumée des braises.",
        'de':"Pollo alla diavola ist ein flach geschnittenes Hähnchen, das unter einem Ziegelstein über dem Feuer gepresst wird, mariniert in Olivenöl, scharfem Chili, Zitrone und Rosmarin. Der Name 'diavola' (vom Teufel) kommt vom Brand der toskanischen Chili und vom Rauch der Kohlen.",
        'pt':"O pollo alla diavola é um frango aberto e prensado sob um tijolo sobre o lume, marinado em azeite, malagueta brava, limão e alecrim. O nome 'diavola' (do diabo) vem do ardor da malagueta toscana e do fumo das brasas.",
        'ru':"Pollo alla diavola — это распластанная курица, прижатая кирпичом над огнём, маринованная в оливковом масле, жгучем чили, лимоне и розмарине. Имя 'diavola' (дьявольский) — от жара тосканского чили и дыма углей.",
        'ar':"Pollo alla diavola هو دجاج مفتوح كالفراشة يُضغط تحت آجرة فوق النار، منقوع بزيت الزيتون والفلفل الحار والليمون وإكليل الجبل. اسم 'ديافولا' (الشيطاني) يأتي من لذعة الفلفل التوسكاني ودخان الجمر.",
        'zh':"Pollo alla diavola 是把鸡剖平、用砖头压在火上烤的菜，先以橄榄油、烈辣椒、柠檬和迷迭香腌制。「diavola」（魔鬼的）这个名字来自托斯卡纳辣椒的刺辣与炭火的烟气。",
        'ja':"ポッロ・アッラ・ディアボラは、鶏を開いて火の上でレンガで押さえつけて焼く料理。オリーブオイル、激辛唐辛子、レモン、ローズマリーでマリネされる。「ディアボラ」（悪魔の）という名は、トスカーナの唐辛子の刺すような辛さと炭火の煙に由来する。",
        'hi':"Pollo alla diavola वह चिकन है जिसे spatchcock किया जाता है और आग पर ईंट के नीचे दबाकर भुना जाता है, पहले ज़ैतून तेल, तीखी मिर्च, नींबू और रोज़मेरी में मैरिनेट किया जाता है। नाम 'diavola' (शैतान का) टस्कन मिर्च की चुभन और कोयलों के धुएँ से आता है।",
        'tr':"Pollo alla diavola, kelebek gibi açılmış bir tavuğun ateş üstünde tuğlayla bastırılarak pişirildiği yemektir; zeytinyağı, sert acı biber, limon ve biberiyeyle marine edilir. 'Diavola' (şeytanın) adı, Toskana acı biberinin yakıcılığı ile kömürlerin dumanından gelir.",
        'it':"Il pollo alla diavola è un pollo aperto e schiacciato sotto un mattone sul fuoco, marinato in olio d'oliva, peperoncino feroce, limone e rosmarino. Il nome 'diavola' (del diavolo) viene dal bruciore del peperoncino toscano e dal fumo delle braci.",
        'ko':"폴로 알라 디아볼라는 닭을 spatchcock으로 펴고 불 위에서 벽돌로 눌러 굽는 요리로, 올리브유, 강렬한 고추, 레몬, 로즈마리에 재워둔다. '디아볼라'(악마의)라는 이름은 토스카나 고추의 강렬함과 숯의 연기에서 비롯됐다.",
    },
})

# Patch missing ingredients on recipe 229 (zh, ja, hi, tr, it, ko):
RECIPES[-1]['ingredients']['zh'] = ["整鸡1只，剖开压平（spatchcock）","压碎大蒜4瓣","碎辣椒片2汤匙（peperoncino）","烟熏甜椒粉1茶匙","柠檬1个（汁与皮屑）","橄榄油3汤匙","百里香和迷迭香","粗盐、黑胡椒"]
RECIPES[-1]['ingredients']['ja'] = ["丸鶏1羽（spatchcockに開く）","にんにく4片（潰す）","唐辛子フレーク大さじ2（ペペロンチーノ）","スモークパプリカ小さじ1","レモン1個（果汁と皮）","オリーブオイル大さじ3","タイムとローズマリー","粗塩、黒こしょう"]
RECIPES[-1]['ingredients']['hi'] = ["1 साबुत चिकन, spatchcock किया","4 लहसुन की कलियाँ, कुचली","2 बड़े चम्मच कुटी लाल मिर्च (peperoncino)","1 छोटा चम्मच स्मोक्ड पपरिका","1 नींबू (रस और छिलका)","3 बड़े चम्मच ज़ैतून तेल","थाइम और रोज़मेरी","मोटा नमक, काली मिर्च"]
RECIPES[-1]['ingredients']['tr'] = ["1 bütün tavuk, kelebek açılmış","4 ezilmiş diş sarımsak","2 yk pul biber (peperoncino)","1 çk tütsülü kırmızı toz biber","1 limon (suyu ve kabuğu)","3 yk zeytinyağı","kekik ve biberiye","iri tane tuz, karabiber"]
RECIPES[-1]['ingredients']['it'] = ["1 pollo intero, aperto a libro (spatchcock)","4 spicchi d'aglio schiacciati","2 cucchiai di peperoncino in fiocchi","1 cucchiaino di paprica affumicata","1 limone (succo e scorza)","3 cucchiai di olio d'oliva","timo e rosmarino","sale grosso, pepe nero"]
RECIPES[-1]['ingredients']['ko'] = ["통닭 1마리(스패치콕)","마늘 4쪽, 으깬 것","고춧가루 플레이크 2큰술(peperoncino)","훈제 파프리카 1작은술","레몬 1개(즙과 껍질)","올리브유 3큰술","타임과 로즈마리","굵은 소금, 흑후추"]
