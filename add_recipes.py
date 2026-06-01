#!/usr/bin/env python3
"""One-shot tool: add 16 missing meal-plan recipes + repair originText gaps.

Adds full-schema recipe blocks (id, origin, name, category, ingredients,
howIsMade, originText — all in 14 langs) to public/js/recipes.js for the
recipes referenced by PLANS that didn't exist in the catalog, plus appends
originText to the 20 existing recipes (ids 194-213) that were imported
without it, plus fills the Hindi gap on the 5 partial-coverage recipes
(ids 1, 2, 14, 22, 23).

Also adds image entries to public/js/recipe-images.js.

Run: python3 add_recipes.py
"""
import json, re, os, sys

LANGS = ['ro','en','es','fr','de','pt','ru','ar','zh','ja','hi','tr','it','ko']
NEXT_ID = 214  # last existing id = 213

# Each NEW recipe spec:
#   id              — auto-assigned starting from NEXT_ID
#   origin_key      — used for image map lookups / cuisine alignment
#   name            — {lang: str}
#   origin          — {lang: str}
#   category        — {lang: str}
#   ingredients     — {lang: [str, ...]}
#   howIsMade       — {lang: str}      (1-3 sentences, concise)
#   originText      — {lang: str}      (1-2 sentences for meal-plan summary)
#   image           — Wikimedia URL (will be added to recipe-images.js)

NEW_RECIPES = []

# ── 1. Lamb Stew (generic, hearty) ────────────────────────────────────
NEW_RECIPES.append({
    'id': 214, 'tipType': 'meat', 'pairingsType': 'meat',
    'image': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Irish_stew_-_Tom%27s_Kitchen.jpg/330px-Irish_stew_-_Tom%27s_Kitchen.jpg',
    'name': {
        'ro':"Tocăniță de miel",'en':"Lamb Stew",'es':"Estofado de cordero",'fr':"Ragoût d'agneau",
        'de':"Lammeintopf",'pt':"Guisado de borrego",'ru':"Тушёная баранина",'ar':"يخنة الضأن",
        'zh':"炖羊肉",'ja':"ラムシチュー",'hi':"लैम्ब स्टू",'tr':"Kuzu yahnisi",
        'it':"Stufato di agnello",'ko':"양고기 스튜",
    },
    'origin': {
        'ro':"Internațional",'en':"International",'es':"Internacional",'fr':"International",
        'de':"International",'pt':"Internacional",'ru':"Международное",'ar':"عالمي",
        'zh':"国际",'ja':"インターナショナル",'hi':"अंतर्राष्ट्रीय",'tr':"Uluslararası",
        'it':"Internazionale",'ko':"국제",
    },
    'category': {
        'ro':"Cină",'en':"Dinner",'es':"Cena",'fr':"Dîner",'de':"Abendessen",'pt':"Jantar",
        'ru':"Ужин",'ar':"عشاء",'zh':"晚餐",'ja':"夕食",'hi':"रात का खाना",'tr':"Akşam yemeği",
        'it':"Cena",'ko':"저녁",
    },
    'ingredients': {
        'ro':["800 g pulpă de miel, cuburi","2 cepe","3 morcovi","3 cartofi","2 căței usturoi","2 linguri pastă de tomate","500 ml supă de carne","frunze de cimbru, dafin","sare, piper, ulei de măsline"],
        'en':["800 g lamb shoulder, cubed","2 onions","3 carrots","3 potatoes","2 garlic cloves","2 tbsp tomato paste","500 ml beef stock","thyme, bay leaf","salt, pepper, olive oil"],
        'es':["800 g de paletilla de cordero en cubos","2 cebollas","3 zanahorias","3 patatas","2 dientes de ajo","2 cdas de pasta de tomate","500 ml de caldo de carne","tomillo, hoja de laurel","sal, pimienta, aceite de oliva"],
        'fr':["800 g d'épaule d'agneau en cubes","2 oignons","3 carottes","3 pommes de terre","2 gousses d'ail","2 c. à s. de concentré de tomate","500 ml de bouillon de bœuf","thym, laurier","sel, poivre, huile d'olive"],
        'de':["800 g Lammschulter, gewürfelt","2 Zwiebeln","3 Karotten","3 Kartoffeln","2 Knoblauchzehen","2 EL Tomatenmark","500 ml Rinderbrühe","Thymian, Lorbeerblatt","Salz, Pfeffer, Olivenöl"],
        'pt':["800 g de pá de borrego em cubos","2 cebolas","3 cenouras","3 batatas","2 dentes de alho","2 colheres de sopa de pasta de tomate","500 ml de caldo de carne","tomilho, louro","sal, pimenta, azeite"],
        'ru':["800 г бараньей лопатки, кубиками","2 луковицы","3 моркови","3 картофелины","2 зубчика чеснока","2 ст. л. томатной пасты","500 мл говяжьего бульона","тимьян, лавровый лист","соль, перец, оливковое масло"],
        'ar':["800 غ كتف ضأن مكعبات","2 بصلة","3 جزرات","3 حبات بطاطا","2 فصوص ثوم","2 ملعقة كبيرة معجون طماطم","500 مل مرق لحم","زعتر، ورق غار","ملح، فلفل، زيت زيتون"],
        'zh':["羊肩肉800克，切块","洋葱2个","胡萝卜3根","土豆3个","大蒜2瓣","番茄酱2汤匙","牛肉高汤500毫升","百里香、月桂叶","盐、胡椒、橄榄油"],
        'ja':["ラム肩肉800g（角切り）","玉ねぎ2個","にんじん3本","じゃがいも3個","にんにく2片","トマトペースト大さじ2","ビーフストック500ml","タイム、ローリエ","塩、こしょう、オリーブオイル"],
        'hi':["800 ग्राम भेड़ का कंधा, टुकड़ों में","2 प्याज़","3 गाजर","3 आलू","2 लहसुन की कलियाँ","2 बड़े चम्मच टमाटर पेस्ट","500 मिली बीफ़ स्टॉक","थाइम, तेज़पत्ता","नमक, काली मिर्च, ज़ैतून का तेल"],
        'tr':["800 g kuzu kürek, küp doğranmış","2 soğan","3 havuç","3 patates","2 diş sarımsak","2 yk salça","500 ml et suyu","kekik, defne yaprağı","tuz, karabiber, zeytinyağı"],
        'it':["800 g di spalla di agnello a cubetti","2 cipolle","3 carote","3 patate","2 spicchi d'aglio","2 cucchiai di concentrato di pomodoro","500 ml di brodo di manzo","timo, alloro","sale, pepe, olio d'oliva"],
        'ko':["양 어깨살 800g, 깍둑썬 것","양파 2개","당근 3개","감자 3개","마늘 2쪽","토마토 페이스트 2큰술","쇠고기 육수 500ml","타임, 월계수잎","소금, 후추, 올리브유"],
    },
    'howIsMade': {
        'ro':"Rumenește cuburile de miel în ulei într-o oală groasă, scoate-le. Călește ceapa și usturoiul, adaugă pasta de tomate. Pune carnea înapoi, toarnă supa, adaugă cimbru și dafin. Fierbe acoperit la foc mic 90 min. Adaugă morcovii și cartofii, mai gătește 30 min până carnea se rupe cu furculița.",
        'en':"Brown the lamb cubes in oil in a heavy pot, set aside. Sweat onions and garlic, stir in tomato paste. Return lamb, pour in stock, add thyme and bay. Simmer covered on low for 90 minutes. Add carrots and potatoes, cook 30 more minutes until the meat is fork-tender.",
        'es':"Dora los cubos de cordero en aceite en una olla pesada y reserva. Pocha cebolla y ajo, añade el tomate. Devuelve el cordero, vierte el caldo, agrega tomillo y laurel. Cuece tapado a fuego bajo 90 min. Añade zanahorias y patatas, cocina 30 min más hasta que la carne se deshaga.",
        'fr':"Faites dorer les cubes d'agneau dans l'huile en cocotte, réservez. Faites suer oignons et ail, ajoutez le concentré de tomate. Remettez l'agneau, versez le bouillon, ajoutez thym et laurier. Mijotez à couvert sur feu doux 90 min. Ajoutez carottes et pommes de terre, cuisez 30 min jusqu'à ce que la viande soit fondante.",
        'de':"Lammwürfel im Topf mit Öl scharf anbraten, herausnehmen. Zwiebeln und Knoblauch andünsten, Tomatenmark dazugeben. Lamm zurück in den Topf, Brühe angießen, Thymian und Lorbeer dazu. 90 Min. zugedeckt schwach köcheln lassen. Karotten und Kartoffeln zugeben, 30 Min. weitergaren, bis das Fleisch zerfällt.",
        'pt':"Doure os cubos de borrego em azeite numa panela pesada, reserve. Refogue cebola e alho, junte a pasta de tomate. Devolva o borrego, verta o caldo, junte tomilho e louro. Coza tapado em lume brando 90 min. Acrescente cenouras e batatas, cozinhe mais 30 min até a carne se desfazer.",
        'ru':"Обжарьте кубики баранины в масле в тяжёлой кастрюле, отложите. Спассеруйте лук и чеснок, добавьте томатную пасту. Верните мясо, влейте бульон, добавьте тимьян и лавровый лист. Тушите под крышкой на малом огне 90 мин. Добавьте морковь и картофель, готовьте ещё 30 мин до мягкости мяса.",
        'ar':"حمّر مكعبات الضأن في الزيت داخل قدر ثقيل، ثم أخرجها. اقلِ البصل والثوم، أضف معجون الطماطم. أعد اللحم، اسكب المرق، أضف الزعتر وورق الغار. اطبخ مغطى على نار هادئة 90 دقيقة. أضف الجزر والبطاطا، اطبخ 30 دقيقة أخرى حتى يصير اللحم طرياً.",
        'zh':"在厚锅中用油把羊肉煎至上色后取出。爆香洋葱和大蒜，加入番茄酱炒匀。羊肉回锅，倒入高汤，加百里香和月桂叶。盖盖小火慢炖90分钟。加入胡萝卜和土豆，再炖30分钟至肉酥烂。",
        'ja':"厚手の鍋でラム肉を油でこんがり焼き、取り出す。玉ねぎとにんにくを炒め、トマトペーストを加える。肉を戻し、ストックを注ぎ、タイムとローリエを入れる。蓋をして弱火で90分煮込む。にんじんとじゃがいもを加え、さらに30分、肉がほろほろになるまで煮る。",
        'hi':"भारी बर्तन में तेल में भेड़ के टुकड़े सुनहरे करें, निकाल लें। प्याज़ और लहसुन भूनें, टमाटर पेस्ट डालें। मांस वापस डालें, स्टॉक डालें, थाइम और तेज़पत्ता डालें। ढककर धीमी आँच पर 90 मिनट पकाएँ। गाजर और आलू डालें, 30 मिनट और पकाएँ जब तक मांस मुलायम न हो जाए।",
        'tr':"Kuzu kuşbaşılarını ağır bir tencerede yağda kızartın, alıp bir kenara koyun. Soğan ve sarımsağı kavurun, salçayı ekleyin. Eti geri koyun, et suyunu ekleyin, kekik ve defneyi atın. Kapağı kapalı 90 dakika kısık ateşte pişirin. Havuç ve patatesi ekleyin, et yumuşayana kadar 30 dakika daha pişirin.",
        'it':"Rosolate i cubetti di agnello nell'olio in una pentola pesante, mettete da parte. Stufate cipolla e aglio, unite il concentrato di pomodoro. Rimettete l'agnello, versate il brodo, aggiungete timo e alloro. Cuocete coperto a fuoco basso per 90 minuti. Unite carote e patate, proseguite 30 minuti finché la carne si sfilaccia.",
        'ko':"두꺼운 냄비에 기름을 두르고 양고기를 갈색이 나도록 굽고 꺼냅니다. 양파와 마늘을 볶고 토마토 페이스트를 넣습니다. 고기를 다시 넣고 육수를 붓고 타임과 월계수잎을 넣습니다. 뚜껑을 덮고 약한 불에서 90분 끓입니다. 당근과 감자를 넣고 30분 더 끓여 고기가 부드러워질 때까지 익힙니다.",
    },
    'originText': {
        'ro':"Tocănița de miel este o rețetă universală pentru zile reci — carne care se face frăgezită ore în șir alături de rădăcinoase și ierburi, până când oala devine o singură aromă caldă.",
        'en':"Lamb stew is a universal cold-weather dish — meat slowly tenderised alongside root vegetables and herbs, until the whole pot becomes one warm aroma.",
        'es':"El estofado de cordero es un plato universal para días fríos — carne que se ablanda durante horas junto a tubérculos y hierbas, hasta que la olla se vuelve un solo aroma cálido.",
        'fr':"Le ragoût d'agneau est un plat universel pour les jours froids — la viande s'attendrit pendant des heures aux côtés de légumes-racines et d'herbes, jusqu'à ce que la cocotte ne soit plus qu'un parfum chaud.",
        'de':"Lammeintopf ist ein universelles Wintergericht — Fleisch wird stundenlang mit Wurzelgemüse und Kräutern zart geschmort, bis der Topf zu einem einzigen warmen Duft wird.",
        'pt':"O guisado de borrego é um prato universal para dias frios — carne que se torna macia ao longo de horas com raízes e ervas, até a panela se tornar um único aroma quente.",
        'ru':"Тушёная баранина — универсальное зимнее блюдо: мясо часами становится мягким рядом с кореньями и травами, пока вся кастрюля не превращается в один тёплый аромат.",
        'ar':"يخنة الضأن طبق عالمي لأيام البرد — اللحم يطرى ببطء على مدى ساعات مع الخضار الجذرية والأعشاب، حتى يصبح القدر كله نكهة دافئة واحدة.",
        'zh':"炖羊肉是世界各地寒冷季节的经典菜肴——肉与根茎蔬菜和香草一起慢炖数小时，整锅化为一缕温暖的香气。",
        'ja':"ラムシチューは寒い季節の世界共通の料理 — 肉が根菜とハーブとともに何時間もかけて柔らかくなり、鍋全体が一つの温かい香りに包まれる。",
        'hi':"लैम्ब स्टू ठंडे मौसम का सार्वभौमिक व्यंजन है — मांस घंटों धीमी आँच पर जड़ की सब्जियों और जड़ी-बूटियों के साथ नरम होता है, जब तक पूरा बर्तन एक गर्म सुगंध में नहीं बदल जाता।",
        'tr':"Kuzu yahnisi soğuk günler için evrensel bir yemektir — et saatlerce kök sebzeler ve otlar arasında yumuşar, tencerenin tamamı tek bir sıcak kokuya dönüşür.",
        'it':"Lo stufato di agnello è un piatto universale per le giornate fredde — la carne si intenerisce per ore insieme a tuberi ed erbe, finché tutta la pentola diventa un unico aroma caldo.",
        'ko':"양고기 스튜는 추운 날을 위한 보편적인 요리로, 고기가 뿌리채소와 허브 사이에서 몇 시간에 걸쳐 부드러워지며 냄비 전체가 따뜻한 향 하나로 모인다.",
    },
})

# ── 2. Greek Salad (Horiatiki) ──────────────────────────────────────────
NEW_RECIPES.append({
    'id': 215, 'tipType': 'salad', 'pairingsType': 'salad',
    'image': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/01_Greek_Salad.jpg/330px-01_Greek_Salad.jpg',
    'name': {
        'ro':"Salată grecească",'en':"Greek Salad",'es':"Ensalada griega",'fr':"Salade grecque",
        'de':"Griechischer Salat",'pt':"Salada grega",'ru':"Греческий салат",'ar':"السلطة اليونانية",
        'zh':"希腊沙拉",'ja':"ギリシャサラダ",'hi':"ग्रीक सलाद",'tr':"Yunan salatası",
        'it':"Insalata greca",'ko':"그리스 샐러드",
    },
    'origin': {
        'ro':"Grecia",'en':"Greece",'es':"Grecia",'fr':"Grèce",'de':"Griechenland",'pt':"Grécia",
        'ru':"Греция",'ar':"اليونان",'zh':"希腊",'ja':"ギリシャ",'hi':"यूनान",'tr':"Yunanistan",
        'it':"Grecia",'ko':"그리스",
    },
    'category': {
        'ro':"Salate",'en':"Salad",'es':"Ensalada",'fr':"Salade",'de':"Salat",'pt':"Salada",
        'ru':"Салат",'ar':"سلطة",'zh':"沙拉",'ja':"サラダ",'hi':"सलाद",'tr':"Salata",
        'it':"Insalata",'ko':"샐러드",
    },
    'ingredients': {
        'ro':["4 roșii coapte, tăiate felii groase","1 castravete mare, tăiat felii","1 ardei verde","1 ceapă roșie, tăiată rondele subțiri","200 g feta în bloc","100 g măsline Kalamata","2 linguri ulei de măsline extravirgin","1 linguriță oregano grecesc uscat","sare grunjoasă"],
        'en':["4 ripe tomatoes, thickly sliced","1 large cucumber, sliced","1 green pepper","1 red onion, thinly ringed","200 g block feta","100 g Kalamata olives","2 tbsp extra-virgin olive oil","1 tsp dried Greek oregano","coarse salt"],
        'es':["4 tomates maduros en rodajas gruesas","1 pepino grande en rodajas","1 pimiento verde","1 cebolla roja en aros finos","200 g de feta en bloque","100 g de aceitunas Kalamata","2 cdas de aceite de oliva virgen extra","1 cdta de orégano griego seco","sal gruesa"],
        'fr':["4 tomates mûres en rondelles épaisses","1 grand concombre en rondelles","1 poivron vert","1 oignon rouge en fines rondelles","200 g de feta en bloc","100 g d'olives Kalamata","2 c. à s. d'huile d'olive extra vierge","1 c. à c. d'origan grec séché","sel grossier"],
        'de':["4 reife Tomaten, dick geschnitten","1 große Salatgurke in Scheiben","1 grüne Paprika","1 rote Zwiebel in feinen Ringen","200 g Fetablock","100 g Kalamata-Oliven","2 EL natives Olivenöl extra","1 TL getrockneter griechischer Oregano","grobes Salz"],
        'pt':["4 tomates maduros em fatias grossas","1 pepino grande às rodelas","1 pimento verde","1 cebola roxa em rodelas finas","200 g de feta em bloco","100 g de azeitonas Kalamata","2 colheres de sopa de azeite virgem extra","1 colher de chá de orégano grego seco","sal grosso"],
        'ru':["4 спелых помидора, толстыми ломтиками","1 крупный огурец, ломтиками","1 зелёный перец","1 красная луковица, тонкими кольцами","200 г феты бруском","100 г маслин Каламата","2 ст. л. оливкового масла экстра вирджин","1 ч. л. сушёного греческого орегано","крупная соль"],
        'ar':["4 حبات طماطم ناضجة بشرائح سميكة","1 خيارة كبيرة بشرائح","1 فلفل أخضر","1 بصلة حمراء بحلقات رفيعة","200 غ جبنة فيتا قطعة","100 غ زيتون كالاماتا","2 ملعقة كبيرة زيت زيتون بكر ممتاز","1 ملعقة صغيرة زعتر يوناني مجفف","ملح خشن"],
        'zh':["熟番茄4个，切厚片","大黄瓜1根，切片","青椒1个","红洋葱1个，切薄圈","菲达奶酪200克，整块","卡拉马塔橄榄100克","特级初榨橄榄油2汤匙","干希腊牛至1茶匙","粗盐"],
        'ja':["完熟トマト4個（厚切り）","大きなきゅうり1本（薄切り）","ピーマン1個","赤玉ねぎ1個（薄い輪切り）","フェタチーズ200gブロック","カラマタオリーブ100g","エクストラバージンオリーブオイル大さじ2","乾燥ギリシャオレガノ小さじ1","粗塩"],
        'hi':["4 पके टमाटर मोटे टुकड़ों में","1 बड़ा खीरा टुकड़ों में","1 हरी शिमला मिर्च","1 लाल प्याज़ पतले छल्ले","200 ग्राम फेटा चीज़ ब्लॉक","100 ग्राम कलामाता जैतून","2 बड़े चम्मच एक्स्ट्रा-वर्जिन ज़ैतून तेल","1 छोटा चम्मच सूखा ग्रीक ओरेगैनो","मोटा नमक"],
        'tr':["4 olgun domates, kalın dilimler","1 büyük salatalık, dilim","1 yeşil biber","1 kırmızı soğan, ince halka","200 g blok feta","100 g Kalamata zeytini","2 yk sızma zeytinyağı","1 çk kuru Yunan kekiği","iri tane tuz"],
        'it':["4 pomodori maturi a fette spesse","1 cetriolo grande a fette","1 peperone verde","1 cipolla rossa ad anelli sottili","200 g di feta in blocco","100 g di olive Kalamata","2 cucchiai di olio d'oliva extravergine","1 cucchiaino di origano greco secco","sale grosso"],
        'ko':["잘 익은 토마토 4개, 두툼하게 슬라이스","큰 오이 1개, 슬라이스","피망 1개","적양파 1개, 얇게 링","페타 치즈 200g 블록","칼라마타 올리브 100g","엑스트라 버진 올리브 오일 2큰술","말린 그리스 오레가노 1작은술","굵은 소금"],
    },
    'howIsMade': {
        'ro':"Amestecă roșiile, castravetele, ardeiul și ceapa într-un bol mare. Sare. Așază blocul de feta deasupra (nu îl sfărâmi — așa servesc grecii). Pune măslinele alături. Stropește generos cu ulei de măsline și presară oregano. Servește imediat, fără să amesteci.",
        'en':"Toss tomatoes, cucumber, pepper and onion in a bowl. Salt. Place the feta block on top whole (don't crumble — Greeks serve it as a slab). Scatter the olives. Drizzle generously with olive oil and shower with oregano. Serve immediately, no tossing.",
        'es':"Mezcla tomates, pepino, pimiento y cebolla en un bol. Sal. Coloca el bloque entero de feta encima (no lo desmenuces — los griegos lo sirven en losa). Esparce las aceitunas. Riega generosamente con aceite y espolvorea orégano. Sirve sin remover.",
        'fr':"Mélangez tomates, concombre, poivron et oignon dans un saladier. Salez. Posez le bloc de feta entier dessus (sans l'émietter — les Grecs le servent en pavé). Parsemez d'olives. Arrosez généreusement d'huile d'olive et saupoudrez d'origan. Servez sans mélanger.",
        'de':"Tomaten, Gurke, Paprika und Zwiebel in eine Schüssel geben. Salzen. Den ganzen Fetablock obenauf legen (nicht zerbröseln — die Griechen servieren ihn als Brocken). Oliven dazu. Großzügig mit Olivenöl beträufeln und Oregano darüberstreuen. Sofort servieren, nicht mehr mischen.",
        'pt':"Misture tomates, pepino, pimento e cebola numa tigela. Sal. Coloque o bloco de feta inteiro por cima (não esmigalhe — os gregos servem-no em pedaço). Espalhe as azeitonas. Regue generosamente com azeite e polvilhe com orégano. Sirva imediatamente sem mexer.",
        'ru':"Смешайте помидоры, огурец, перец и лук в миске. Посолите. Сверху положите целый кусок феты (не крошите — греки подают плитой). Разбросайте маслины. Щедро полейте оливковым маслом и посыпьте орегано. Подавайте сразу, не перемешивая.",
        'ar':"اخلطي الطماطم والخيار والفلفل والبصل في وعاء. ملح. ضعي قطعة الفيتا كاملة فوق السلطة (لا تفتيتها — اليونانيون يقدمونها كقطعة واحدة). انثري الزيتون. اسكبي زيت الزيتون بسخاء وانثري الزعتر. قدمي فوراً دون تقليب.",
        'zh':"将番茄、黄瓜、青椒和洋葱放入大碗。撒盐。把整块菲达放在最上面（不要弄碎——希腊人就是整块上桌的）。撒上橄榄。大方淋上橄榄油，撒满牛至。立刻上桌，不要搅拌。",
        'ja':"ボウルにトマト、きゅうり、ピーマン、玉ねぎを入れる。塩。フェタチーズはブロックのまま上に乗せる（崩さない — ギリシャ流）。オリーブを散らす。オリーブオイルをたっぷり回しかけ、オレガノをふる。混ぜずにすぐ食卓へ。",
        'hi':"एक बड़े बाउल में टमाटर, खीरा, शिमला मिर्च और प्याज़ मिलाएँ। नमक डालें। फेटा ब्लॉक को बिना तोड़े ऊपर रखें (ग्रीक इसे टुकड़े के रूप में परोसते हैं)। जैतून बिखेरें। ज़ैतून तेल भरपूर डालें और ओरेगैनो छिड़कें। बिना हिलाए तुरंत परोसें।",
        'tr':"Domates, salatalık, biber ve soğanı kasede karıştırın. Tuz. Feta bloğunu olduğu gibi üzerine koyun (ufalamayın — Yunanlar parça halinde servis eder). Zeytinleri serpin. Bolca zeytinyağı gezdirin ve kekik serpin. Karıştırmadan hemen servis edin.",
        'it':"Mescola pomodori, cetriolo, peperone e cipolla in una ciotola. Sale. Adagia il blocco intero di feta sopra (non sbriciolarla — i greci la servono a pezzo). Distribuisci le olive. Irrora abbondantemente con olio e cospargi di origano. Servi subito senza mescolare.",
        'ko':"볼에 토마토, 오이, 피망, 양파를 담아 섞습니다. 소금. 페타 치즈는 통째로 위에 올립니다(부수지 않음 — 그리스식은 덩어리로 냅니다). 올리브를 흩뿌립니다. 올리브 오일을 듬뿍 두르고 오레가노를 뿌립니다. 섞지 않고 바로 냅니다.",
    },
    'originText': {
        'ro':"Salata grecească tradițională, horiatiki, este sufletul tavernelor de vară din Grecia — roșii coapte la soare, castravete crocant, feta întreagă, măsline Kalamata și un val de ulei de măsline cu oregano sălbatic.",
        'en':"Traditional Greek salad — horiatiki — is the soul of summer tavernas: sun-warm tomatoes, crisp cucumber, a slab of feta, Kalamata olives and a generous pour of olive oil with wild oregano.",
        'es':"La ensalada griega tradicional, horiatiki, es el alma de las tabernas de verano en Grecia — tomates calentados al sol, pepino crujiente, feta entera, aceitunas Kalamata y un chorro generoso de aceite de oliva con orégano silvestre.",
        'fr':"La salade grecque traditionnelle — la horiatiki — est l'âme des tavernes d'été en Grèce : tomates gorgées de soleil, concombre croquant, pavé de feta, olives de Kalamata et un trait généreux d'huile d'olive à l'origan sauvage.",
        'de':"Der traditionelle griechische Salat — Horiatiki — ist die Seele griechischer Sommerlokale: sonnenwarme Tomaten, knackige Gurke, ein Stück Feta, Kalamata-Oliven und ein großzügiger Schuss Olivenöl mit wildem Oregano.",
        'pt':"A salada grega tradicional — horiatiki — é a alma das tabernas de verão na Grécia: tomates aquecidos pelo sol, pepino crocante, feta inteira, azeitonas Kalamata e um fio generoso de azeite com orégano silvestre.",
        'ru':"Традиционный греческий салат — хориатики — это душа летних таверн: согретые солнцем помидоры, хрустящий огурец, плитка феты, маслины Каламата и щедрая струя оливкового масла с диким орегано.",
        'ar':"السلطة اليونانية التقليدية — هورياتيكي — هي روح حانات الصيف اليونانية: طماطم مشبعة بدفء الشمس، خيار طازج، قطعة فيتا، زيتون كالاماتا ورشّة كريمة من زيت الزيتون مع الزعتر البرّي.",
        'zh':"传统希腊沙拉——horiatiki——是希腊夏日小酒馆的灵魂：沐浴阳光的番茄、爽脆的黄瓜、整块的菲达、卡拉马塔橄榄，以及一勺野生牛至橄榄油。",
        'ja':"伝統的なギリシャサラダ — ホリヤティキ — はギリシャの夏のタベルナの魂だ。太陽に温められたトマト、シャキッとしたきゅうり、フェタの塊、カラマタオリーブ、そして野生のオレガノが香るたっぷりのオリーブオイル。",
        'hi':"पारंपरिक ग्रीक सलाद — होरिआटिकी — ग्रीस के गर्मियों के ताबेर्ना की आत्मा है: धूप में पके टमाटर, करारा खीरा, फेटा का टुकड़ा, कलामाता जैतून और जंगली ओरेगैनो वाले ज़ैतून तेल की उदार धार।",
        'tr':"Geleneksel Yunan salatası — horiatiki — Yunanistan'ın yaz meyhanelerinin ruhudur: güneşle ısınmış domatesler, çıtır salatalık, blok feta, Kalamata zeytini ve yabani kekikli bol zeytinyağı.",
        'it':"L'insalata greca tradizionale — horiatiki — è l'anima delle taverne estive in Grecia: pomodori scaldati dal sole, cetriolo croccante, una lastra di feta, olive Kalamata e un generoso filo d'olio d'oliva con origano selvatico.",
        'ko':"전통 그리스 샐러드 호리아티키는 그리스 여름 타베르나의 영혼이다 — 햇살에 따뜻해진 토마토, 아삭한 오이, 한 덩어리의 페타, 칼라마타 올리브, 그리고 야생 오레가노 향 가득한 올리브 오일.",
    },
})

# Generator for the remaining 14 recipes follows the same pattern.
# For practical reasons (one-shot file size), the rest of the recipe data
# is in `add_recipes_data.py` next to this file. We import it.

import importlib.util
spec = importlib.util.spec_from_file_location(
    'add_recipes_data',
    os.path.join(os.path.dirname(__file__), 'add_recipes_data.py'),
)
data_mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(data_mod)
NEW_RECIPES.extend(data_mod.MORE_RECIPES)
ORIGIN_TEXT_REPAIRS = data_mod.ORIGIN_TEXT_REPAIRS  # {id: {lang: text}}
HINDI_PATCHES       = data_mod.HINDI_PATCHES        # {id: hi_text}

assert len(NEW_RECIPES) == 16, f"Expected 16 new recipes, got {len(NEW_RECIPES)}"
for i, r in enumerate(NEW_RECIPES):
    assert r['id'] == 214 + i, f"id out of sequence at index {i}: {r['id']}"
    for field in ['name','origin','category','ingredients','howIsMade','originText']:
        assert set(r[field].keys()) == set(LANGS), f"Recipe id={r['id']} {field}: missing langs {set(LANGS) - set(r[field].keys())}"

# ── JS-format helper ──────────────────────────────────────────────────
def js_str(s):
    return '"' + s.replace('\\','\\\\').replace('"','\\"').replace('\n','\\n') + '"'

def js_obj_14(d, indent='      '):
    """Format a {lang: str} object as JS literal across multiple lines."""
    lines = ['{']
    for lang in LANGS:
        lines.append(f'{indent}  {lang}: {js_str(d[lang])},')
    lines.append(f'{indent}}}')
    return '\n'.join(lines)

def js_ing_obj(d, indent='      '):
    """Format {lang: [str, ...]} for ingredients."""
    lines = ['{']
    for lang in LANGS:
        arr = ', '.join(js_str(x) for x in d[lang])
        lines.append(f'{indent}  {lang}: [{arr}],')
    lines.append(f'{indent}}}')
    return '\n'.join(lines)

def format_recipe(r):
    return f"""  {{
    id: {r['id']},
    tipType: '{r.get('tipType','meat')}',
    pairingsType: '{r.get('pairingsType','meat')}',
    origin: {js_obj_14(r['origin'])},
    name: {js_obj_14(r['name'])},
    category: {js_obj_14(r['category'])},
    ingredients: {js_ing_obj(r['ingredients'])},
    howIsMade: {js_obj_14(r['howIsMade'])},
    originText: {js_obj_14(r['originText'])}
  }}"""

# ── 1. Append new recipes to recipes.js ────────────────────────────────
RECIPES_PATH = '/home/user/weekly-meal-planner/public/js/recipes.js'
with open(RECIPES_PATH, 'r', encoding='utf-8') as f:
    src = f.read()

# Sanity: ends with `];\n`
assert src.rstrip().endswith('];'), "recipes.js does not end with ];"

# Compose the new-recipe block. Each recipe joined by ',\n', prefix with `,\n` to
# attach after the existing last entry.
new_blocks = ',\n'.join(format_recipe(r) for r in NEW_RECIPES)
insert_point = src.rfind(']')
# Verify there's a closing brace just before the `]`.
patched = src[:insert_point].rstrip().rstrip(',') + ',\n' + new_blocks + '\n];\n'

# ── 2. Inject originText into existing recipes 194-213 ────────────────
def patch_origin_text(src, rid, ot):
    """Add originText: {...} as the LAST top-level field on recipe `rid`."""
    m = re.search(rf'(\n    id: {rid},)', src)
    if not m:
        raise RuntimeError(f"id {rid} not found")
    # Find the matching object end: scan from the id line forward, count braces.
    start = m.start() + 1  # the `    id: …` line starts here
    # Find the `{` that opens this recipe object (it's the line BEFORE `    id:`)
    open_brace = src.rfind('{', 0, start)
    depth = 1
    i = open_brace + 1
    while i < len(src):
        if src[i] == '{': depth += 1
        elif src[i] == '}':
            depth -= 1
            if depth == 0:
                break
        i += 1
    close_brace = i
    # `src[close_brace]` is `}`. We need to insert `,\n    originText: {...}\n  `
    # just before that `}`. Find the last non-whitespace char before `}` and
    # ensure we put the comma correctly.
    body_end = close_brace
    # Walk back over whitespace
    j = body_end - 1
    while j > open_brace and src[j] in ' \n':
        j -= 1
    # Build the originText block. Use indent '      ' to match other 14-lang fields.
    ot_block = 'originText: ' + js_obj_14(ot)
    # If the char at j is already ',' the previous field had a trailing comma — unusual.
    # Standard case: char at j is `}` (the closing brace of the previous field).
    insertion = f',\n    {ot_block}'
    return src[:j+1] + insertion + src[j+1:]

for rid, ot in ORIGIN_TEXT_REPAIRS.items():
    patched = patch_origin_text(patched, rid, ot)

# ── 3. Inject Hindi originText into 5 partials ────────────────────────
def patch_hindi(src, rid, hi_text):
    """Insert `,\n      hi: '...'` inside originText of recipe `rid` after `tr:` line."""
    # Locate the originText block of this recipe
    m = re.search(rf'\n    id: {rid},', src)
    if not m:
        raise RuntimeError(f"id {rid} not found for hindi patch")
    # Find originText: { right after this id
    ot_match = re.search(r'originText:\s*\{', src[m.start():])
    if not ot_match:
        raise RuntimeError(f"id {rid} has no originText block (expected partial)")
    ot_start = m.start() + ot_match.end()
    # Find the matching closing brace of this originText {} (depth 1)
    depth = 1
    i = ot_start
    while i < len(src):
        if src[i] == '{': depth += 1
        elif src[i] == '}':
            depth -= 1
            if depth == 0:
                break
        i += 1
    ot_close = i
    # Check if hi: already present
    ot_body = src[ot_start:ot_close]
    if re.search(r'\bhi:\s*[\"\']', ot_body):
        return src  # already has hi
    # Insert before the closing brace: detect line indent (usually `      `)
    # We'll insert: '      hi: "...",\n    '
    insertion = f'      hi: {js_str(hi_text)},\n    '
    # Trim any trailing whitespace before close brace
    j = ot_close - 1
    while j > ot_start and src[j] in ' \n':
        j -= 1
    # Ensure previous line ends with comma
    if src[j] != ',':
        src = src[:j+1] + ',' + src[j+1:]
        ot_close += 1
    return src[:ot_close] + insertion + src[ot_close:]

for rid, hi in HINDI_PATCHES.items():
    patched = patch_hindi(patched, rid, hi)

with open(RECIPES_PATH, 'w', encoding='utf-8') as f:
    f.write(patched)

# ── 4. Add image entries to recipe-images.js ──────────────────────────
IMG_PATH = '/home/user/weekly-meal-planner/public/js/recipe-images.js'
with open(IMG_PATH, 'r', encoding='utf-8') as f:
    img_src = f.read()

# Insert before the final `};`
img_insert = img_src.rfind('};')
new_img_lines = ['', '  // 214-229: added with meal-plan-coverage batch.']
for r in NEW_RECIPES:
    new_img_lines.append(f"  {r['id']}: '{r['image']}',")
img_patched = img_src[:img_insert].rstrip() + '\n' + '\n'.join(new_img_lines) + '\n};\n'
with open(IMG_PATH, 'w', encoding='utf-8') as f:
    f.write(img_patched)

print(f"OK: added {len(NEW_RECIPES)} new recipes")
print(f"OK: repaired originText for {len(ORIGIN_TEXT_REPAIRS)} existing recipes (ids {min(ORIGIN_TEXT_REPAIRS)}–{max(ORIGIN_TEXT_REPAIRS)})")
print(f"OK: added Hindi to {len(HINDI_PATCHES)} partial originText blocks (ids {sorted(HINDI_PATCHES)})")
print(f"OK: added {len(NEW_RECIPES)} image entries to recipe-images.js")
