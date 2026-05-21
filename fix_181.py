with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# === ID 181: Tonkotsu Ramen (Japan) ===

# origin hi — inline block, unique anchor via name "Ramen Tonkotsu"
content = content.replace(
    'tr: "Japonya", it: "Giappone", ko: "일본"\n    },\n    name: {\n      ro: "Ramen Tonkotsu"',
    'tr: "Japonya", it: "Giappone", ko: "일본",\n      hi: "जापान"\n    },\n    name: {\n      ro: "Ramen Tonkotsu"'
)

# name hi
content = content.replace(
    '      ko: "돈코츠 라멘"\n    },\n    category: {',
    '      ko: "돈코츠 라멘",\n      hi: "टोन्कोत्सु रामेन"\n    },\n    category: {'
)

# category hi — anchor: inline category ending ko "저녁" + ro ingredients "oase de porc"
content = content.replace(
    '      ko: "저녁"\n    },\n    ingredients: {\n      ro: ["oase de porc"',
    '      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    ingredients: {\n      ro: ["oase de porc"'
)

# --- Fix ingredients: replace every language's array with quantities ---

content = content.replace(
    '      ro: ["oase de porc", "tăiței ramen", "sos de soia", "mirin", "burtă de porc chashu", "ou ramen marinat", "lăstari de bambus", "alge nori", "ceapă verde", "usturoi", "ghimbir", "ulei de susan"],',
    '      ro: ["1,2 kg oase de porc (măduvă), opărite", "300g tăiței ramen proaspeți subțiri", "3 linguri sos de soia închis (pentru tare)", "2 linguri mirin", "200g burtă de porc chashu, feliată la 1 cm grosime", "2 ouă ramen fierte moale, tăiate în jumătate", "80g lăstari de bambus (menma), scurși", "2 foi alge nori, tăiate în jumătate", "2 cepe verzi, feliate subțire", "4 căței usturoi, zdrobiți", "30g ghimbir proaspăt, curățat și feliat", "1 linguriță ulei de susan prăjit"],'
)

content = content.replace(
    '      en: ["pork bones", "ramen noodles", "soy sauce", "mirin", "chashu pork belly", "marinated ramen egg", "bamboo shoots", "nori seaweed", "green onion", "garlic", "ginger", "sesame oil"],',
    '      en: ["1.2kg pork marrow bones, blanched", "300g fresh thin ramen noodles", "3 tbsp dark soy sauce (for tare)", "2 tbsp mirin", "200g chashu pork belly, sliced 1cm thick", "2 soft-boiled ramen eggs, halved", "80g bamboo shoots (menma), drained", "2 sheets nori, halved", "2 spring onions, thinly sliced", "4 cloves garlic, crushed", "30g fresh ginger, peeled and sliced", "1 tsp toasted sesame oil"],'
)

content = content.replace(
    '      es: ["huesos de cerdo", "fideos ramen", "salsa de soja", "mirin", "panceta chashu", "huevo marinado ramen", "brotes de bambú", "alga nori", "cebolla verde", "ajo", "jengibre", "aceite de sésamo"],',
    '      es: ["1,2 kg de huesos de tuétano de cerdo, blanqueados", "300g de fideos ramen finos frescos", "3 cdas de salsa de soja oscura (para el tare)", "2 cdas de mirin", "200g de panceta chashu, en rodajas de 1 cm", "2 huevos ramen cocidos a fuego lento, partidos por la mitad", "80g de brotes de bambú (menma), escurridos", "2 hojas de nori, partidas por la mitad", "2 cebolletas, en rodajas finas", "4 dientes de ajo, machacados", "30g de jengibre fresco, pelado y en rodajas", "1 cdta de aceite de sésamo tostado"],'
)

content = content.replace(
    '      fr: ["os de porc", "nouilles ramen", "sauce soja", "mirin", "poitrine chashu", "œuf mariné ramen", "pousses de bambou", "algue nori", "oignon vert", "ail", "gingembre", "huile de sésame"],',
    '      fr: ["1,2 kg d\'os à moelle de porc, blanchis", "300g de nouilles ramen fines fraîches", "3 c.à.s. de sauce soja foncée (pour le tare)", "2 c.à.s. de mirin", "200g de poitrine de porc chashu, tranchée à 1 cm", "2 oeufs ramen cuits mollets, coupés en deux", "80g de pousses de bambou (menma), égouttées", "2 feuilles de nori, coupées en deux", "2 oignons verts, émincés", "4 gousses d\'ail, écrasées", "30g de gingembre frais, pelé et tranché", "1 c.à.c. d\'huile de sésame grillée"],'
)

content = content.replace(
    '      de: ["Schweineknochen", "Ramen-Nudeln", "Sojasoße", "Mirin", "Chashu Schweinebauch", "mariniertes Ramen-Ei", "Bambussprossen", "Nori-Algen", "Frühlingszwiebel", "Knoblauch", "Ingwer", "Sesamöl"],',
    '      de: ["1,2 kg Schweinemarkknochen, blanchiert", "300g frische dünne Ramen-Nudeln", "3 EL dunkle Sojasoße (für Tare)", "2 EL Mirin", "200g Chashu-Schweinebauch, 1 cm dick geschnitten", "2 weich gekochte Ramen-Eier, halbiert", "80g Bambussprossen (Menma), abgetropft", "2 Blatt Nori, halbiert", "2 Frühlingszwiebeln, dünn geschnitten", "4 Knoblauchzehen, zerdrückt", "30g frischer Ingwer, geschält und in Scheiben", "1 TL geröstetes Sesamöl"],'
)

content = content.replace(
    '      pt: ["ossos de porco", "macarrão ramen", "molho de soja", "mirin", "barriga de porco chashu", "ovo marinado ramen", "brotos de bambu", "alga nori", "cebolinha", "alho", "gengibre", "óleo de gergelim"],',
    '      pt: ["1,2 kg de ossos de tutano de porco, escaldados", "300g de macarrão ramen fino fresco", "3 colheres de sopa de molho de soja escuro (para o tare)", "2 colheres de sopa de mirin", "200g de barriga de porco chashu, fatiada a 1 cm", "2 ovos ramen cozidos moles, cortados ao meio", "80g de brotos de bambu (menma), escorridos", "2 folhas de nori, cortadas ao meio", "2 cebolinhas, fatiadas finamente", "4 dentes de alho, amassados", "30g de gengibre fresco, descascado e fatiado", "1 colher de chá de óleo de gergelim torrado"],'
)

content = content.replace(
    '      ru: ["свиные кости", "лапша рамен", "соевый соус", "мирин", "чашу из свиной грудинки", "маринованное яйцо рамен", "побеги бамбука", "водоросли нори", "зелёный лук", "чеснок", "имбирь", "кунжутное масло"],',
    '      ru: ["1,2 кг свиных мозговых костей, бланшированных", "300г свежей тонкой лапши рамен", "3 ст.л. тёмного соевого соуса (для тарэ)", "2 ст.л. мирина", "200г чашу из свиной грудинки, нарезанной ломтиками 1 см", "2 мягко сваренных яйца рамен, разрезанных пополам", "80г побегов бамбука (менма), обсушенных", "2 листа нори, разрезанных пополам", "2 пера зелёного лука, тонко нарезанных", "4 зубчика чеснока, раздавленных", "30г свежего имбиря, очищенного и нарезанного", "1 ч.л. поджаренного кунжутного масла"],'
)

content = content.replace(
    '      ar: ["عظام الخنزير", "نودلز رامن", "صلصة الصويا", "ميرين", "بطن الخنزير تشاشو", "بيضة رامن متبلة", "براعم الخيزران", "طحلب نوري", "بصل أخضر", "ثوم", "زنجبيل", "زيت السمسم"],',
    '      ar: ["1.2 كجم عظام نخاع الخنزير، مسلوقة", "300غ نودلز رامن رفيعة طازجة", "3 ملاعق كبيرة صلصة صويا داكنة (للتاري)", "2 ملعقة كبيرة ميرين", "200غ بطن الخنزير تشاشو، مقطعة بسماكة 1 سم", "بيضتان رامن مسلوقتان ناعمتان، مقطوعتان نصفين", "80غ براعم الخيزران (مينما)، مصفاة", "ورقتان نوري، مقطوعتان نصفين", "2 بصل أخضر مقطع رقيقاً", "4 فصوص ثوم مسحوقة", "30غ زنجبيل طازج مقشر ومقطع شرائح", "1 ملعقة صغيرة زيت سمسم محمص"],'
)

content = content.replace(
    '      zh: ["猪骨", "拉面条", "酱油", "味醂", "叉烧猪腩", "溏心卤蛋", "笋干", "海苔", "葱花", "大蒜", "生姜", "芝麻油"],',
    '      zh: ["猪脊髓骨1.2千克，焯水", "新鲜细拉面300克", "深色酱油3大勺（做底汤调料）", "味醂2大勺", "叉烧猪腩200克，切1厘米厚片", "溏心拉面蛋2个，对半切开", "竹笋（孟宗笋）80克，沥干", "海苔2片，对半切", "葱2根，切薄圆片", "大蒜4瓣，压碎", "新鲜生姜30克，去皮切片", "烤芝麻油1小勺"],'
)

content = content.replace(
    '      ja: ["豚骨", "ラーメン麺", "醤油", "みりん", "チャーシュー", "味付け卵", "メンマ", "海苔", "ねぎ", "にんにく", "生姜", "ごま油"],',
    '      ja: ["豚脊髄骨1.2kg（下茹でする）", "新鮮な細ラーメン麺300g", "濃口醤油大さじ3（タレ用）", "みりん大さじ2", "チャーシュー200g（1cm厚に切る）", "半熟ラーメン卵2個（半分に切る）", "メンマ80g（水気を切る）", "海苔2枚（半分に切る）", "ねぎ2本（薄切り）", "にんにく4片（つぶす）", "生姜30g（皮をむいてスライス）", "焙煎ごま油小さじ1"],'
)

content = content.replace(
    '      tr: ["domuz kemiği", "ramen eriştesi", "soya sosu", "mirin", "chashu domuz göbeği", "marine edilmiş ramen yumurtası", "bambu filizi", "nori deniz yosunu", "yeşil soğan", "sarımsak", "zencefil", "susam yağı"],',
    '      tr: ["1,2 kg domuz ilik kemiği, haşlanmış", "300g taze ince ramen eriştesi", "3 yemek kaşığı koyu soya sosu (tare için)", "2 yemek kaşığı mirin", "200g chashu domuz göbeği, 1 cm kalınlığında dilimlenmiş", "2 yumuşak haşlanmış ramen yumurtası, ikiye bölünmüş", "80g bambu filizi (menma), süzülmüş", "2 yaprak nori, ikiye bölünmüş", "2 ince dilimlenmiş yeşil soğan", "4 diş sarımsak, ezilmiş", "30g taze zencefil, soyulmuş ve dilimlenmiş", "1 çay kaşığı kavrulmuş susam yağı"],'
)

content = content.replace(
    '      it: ["ossa di maiale", "noodle ramen", "salsa di soia", "mirin", "pancetta chashu", "uovo marinato ramen", "germogli di bambù", "alga nori", "cipollotto", "aglio", "zenzero", "olio di sesamo"],',
    '      it: ["1,2 kg di ossa di midollo di maiale, sbollentate", "300g di noodle ramen fini freschi", "3 cucchiai di salsa di soia scura (per il tare)", "2 cucchiai di mirin", "200g di pancetta chashu, affettata a 1 cm", "2 uova ramen con tuorlo morbido, dimezzate", "80g di germogli di bambù (menma), scolati", "2 fogli di nori, dimezzati", "2 cipollotti, affettati sottilmente", "4 spicchi d\'aglio, schiacciati", "30g di zenzero fresco, pelato e affettato", "1 cucchiaino di olio di sesamo tostato"],'
)

content = content.replace(
    '      ko: ["돼지 뼈", "라멘 면", "간장", "미린", "차슈 삼겹살", "라멘 달걀 마리네이드", "죽순", "노리 해초", "파", "마늘", "생강", "참기름"]',
    '      ko: ["돼지 척추 뼈 1.2kg, 데친 것", "신선한 얇은 라멘 면 300g", "진간장 3큰술 (타레용)", "미린 2큰술", "차슈 삼겹살 200g, 1cm 두께로 슬라이스", "반숙 라멘 달걀 2개, 반으로 자른 것", "죽순(멘마) 80g, 물기 뺀 것", "노리 2장, 반으로 자른 것", "파 2대, 얇게 썬 것", "마늘 4쪽, 으깬 것", "생강 30g, 껍질 벗겨 슬라이스", "볶은 참기름 1작은술"],\n      hi: ["1.2 किलो सूअर के मज्जा की हड्डियां, उबाली हुई", "300 ग्राम ताज़ा पतले रामेन नूडल्स", "3 बड़े चम्मच गहरी सोया सॉस (तारे के लिए)", "2 बड़े चम्मच मिरिन", "200 ग्राम चाशू सूअर की पेट की परत, 1 सेमी मोटी स्लाइस में कटी", "2 नरम उबले रामेन अंडे, आधे कटे", "80 ग्राम बांस की कोंपलें (मेन्मा), छानी हुई", "2 नोरी की पत्तियां, आधी कटी", "2 हरे प्याज़, बारीक कटे", "4 लहसुन की कलियां, कुचली हुई", "30 ग्राम ताज़ा अदरक, छीला और कटा", "1 छोटी चम्मच भुना तिल का तेल"]'
)

# --- Fix howIsMade: expand terse entries to detailed instructions ---

old_howmade_181_ro = '      ro: "Fierbe oasele de porc 8-12 ore pentru un supă cremoasă albă, condimentează cu sos de soia și mirin, prepară chashu prin rularea și fierberea lentă a burtei de porc, fierbe tăițeii separat, apoi asamblează în bol cu toate toppingurile.",'
new_howmade_181_ro = '      ro: "Opărește oasele 10 minute în apă clocotită, scurge și clătește cu apă rece. Transferă în oală mare cu 3L apă rece, aduce la fierbere puternică — nu la mic foc — și menține 10–12 ore, completând apa; fierberea intensă albește bulionul. Rulează strâns burta de porc, leag-o cu ață, rumenește pe toate fețele în tigaie uscată, brăzuiește la foc mic în 3 linguri sos de soia, 2 linguri mirin, 1 lingură sake și 100ml apă, 90 minute; odihnește 20 minute, feliază la 1 cm. Prepară tare: 4 linguri sos de soia + 2 linguri mirin, fierbe 3 minute. Fierbe tăițeii, scurge. Pune 2 linguri tare în fiecare bol, toarnă 400ml supă fierbinte, adaugă felii de chashu, ou tăiat, bambus, nori, ceapă verde și câteva picături de ulei de susan.",'

content = content.replace(old_howmade_181_ro, new_howmade_181_ro)

old_howmade_181_en = '      en: "Simmer pork bones for 8-12 hours for a creamy white broth, season with soy sauce and mirin, prepare chashu by rolling and slow-braising pork belly, cook noodles separately, then assemble in a bowl with all toppings.",'
new_howmade_181_en = '      en: "Blanch pork bones in boiling water for 10 minutes, drain and rinse under cold water. Transfer to a large pot with 3L cold water, bring to a rolling boil and hold it there — not a simmer — for 10 to 12 hours, topping up with water as needed; the hard boil breaks down collagen and turns the broth white. Roll pork belly tightly, tie with kitchen string, sear all sides in a dry pan, then braise in 3 tbsp soy sauce, 2 tbsp mirin, 1 tbsp sake and 100ml water on the lowest heat for 90 minutes; rest 20 minutes, slice 1cm thick. Make tare: 4 tbsp soy sauce + 2 tbsp mirin, simmer 3 minutes, cool. Cook noodles per packet, drain. Spoon 2 tbsp tare into each bowl, ladle 400ml hot broth, then top with chashu slices, halved egg, bamboo shoots, nori and spring onion. Finish with sesame oil.",'

content = content.replace(old_howmade_181_en, new_howmade_181_en)

old_howmade_181_es = '      es: "Hierve los huesos de cerdo 8-12 horas para un caldo cremoso blanco, sazona con salsa de soja y mirin, prepara el chashu enrollando y estofando lentamente la panceta, cocina los fideos aparte y monta el bol con todos los ingredientes.",'
new_howmade_181_es = '      es: "Escalda los huesos en agua hirviendo 10 minutos, escurre y enjuaga con agua fría. Transfiere a una olla grande con 3L de agua fría, lleva a ebullición fuerte y mantenla 10–12 horas añadiendo agua si baja; la ebullición intensa blanquea el caldo. Enrolla la panceta, átala, dórala por todos lados en sartén seca, luego brásala a fuego mínimo en 3 cdas de soja, 2 cdas de mirin, 1 cda de sake y 100ml de agua, 90 minutos; reposa 20 minutos y corta en rodajas de 1 cm. Tare: 4 cdas de soja + 2 cdas de mirin, hierve 3 minutos. Cuece los fideos, escurre. Pon 2 cdas de tare en cada bol, vierte 400ml de caldo caliente, coloca encima chashu, huevo, bambú, nori, cebolleta y unas gotas de aceite de sésamo.",'

content = content.replace(old_howmade_181_es, new_howmade_181_es)

old_howmade_181_fr = '      fr: "Faites mijoter les os de porc 8 à 12 heures pour un bouillon crémeux et blanc, assaisonnez avec sauce soja et mirin, préparez le chashu en roulant et braisent lentement la poitrine de porc, cuisez les nouilles à part puis assemblez dans un bol.",'
new_howmade_181_fr = '      fr: "Blanchir les os dans l\'eau bouillante 10 minutes, égoutter et rincer à l\'eau froide. Mettre dans une grande casserole avec 3L d\'eau froide, porter à forte ébullition et maintenir 10 à 12 heures en ajoutant de l\'eau si besoin ; la forte ébullition blanchit le bouillon. Rouler la poitrine fermement, ficeler, saisir sur toutes les faces dans une poêle sèche, puis braiser à feu très doux dans 3 c.à.s. de soja, 2 c.à.s. de mirin, 1 c.à.s. de saké et 100ml d\'eau pendant 90 minutes ; repos 20 minutes avant de trancher à 1 cm. Tare : 4 c.à.s. soja + 2 c.à.s. mirin, bouillir 3 minutes, refroidir. Cuire les nouilles, égoutter. 2 c.à.s. de tare par bol, 400ml de bouillon chaud, puis chashu, oeuf, bambou, nori, ciboule et huile de sésame.",'

content = content.replace(old_howmade_181_fr, new_howmade_181_fr)

old_howmade_181_de = '      de: "Koche Schweineknochen 8-12 Stunden für eine cremige weiße Brühe, würze mit Sojasoße und Mirin, bereite Chashu durch Rollen und langsames Schmoren des Schweinebauchs zu, koche Nudeln getrennt und arrangiere in einer Schüssel.",'
new_howmade_181_de = '      de: "Schweineknochen 10 Minuten blanchieren, abgießen und mit kaltem Wasser abspülen. In einen großen Topf mit 3L kaltem Wasser geben, zum kräftigen Kochen bringen und 10–12 Stunden am Kochen halten, bei Bedarf Wasser auffüllen; das starke Kochen macht die Brühe weiß. Schweinebauch fest rollen, binden, von allen Seiten in einer trockenen Pfanne anbraten, dann bei niedrigster Hitze in 3 EL Sojasoße, 2 EL Mirin, 1 EL Sake und 100ml Wasser 90 Minuten schmoren; 20 Minuten ruhen, in 1cm-Scheiben schneiden. Tare: 4 EL Sojasoße + 2 EL Mirin, 3 Minuten köcheln, abkühlen. Nudeln nach Packung kochen, abgießen. Je 2 EL Tare in die Schüsseln, 400ml heiße Brühe dazu, dann Chashu, Ei, Bambussprossen, Nori, Frühlingszwiebel und Sesamöl.",'

content = content.replace(old_howmade_181_de, new_howmade_181_de)

old_howmade_181_pt = '      pt: "Cozinhe os ossos de porco por 8-12 horas para um caldo cremoso e branco, tempere com molho de soja e mirin, prepare o chashu enrolando e cozinhando lentamente a barriga de porco, cozinhe o macarrão separado e monte a tigela.",'
new_howmade_181_pt = '      pt: "Escaldar os ossos em água fervente por 10 minutos, escorrer e enxaguar em água fria. Transferir para panela grande com 3L de água fria, ferver em fogo alto e manter 10–12 horas, repondo água; a fervura forte branqueia o caldo ao decompor o colágeno. Enrolar a barriga de porco, amarrar, selar todos os lados em fogo seco, depois brasear em fogo mínimo em 3 colheres de soja, 2 de mirin, 1 de saquê e 100ml de água por 90 minutos; descansar 20 minutos, fatiar a 1 cm. Tare: 4 colheres de soja + 2 de mirin, ferver 3 minutos, resfriar. Cozinhar os noodles, escorrer. 2 colheres de tare por tigela, 400ml de caldo quente, depois chashu, ovo, bambu, nori, cebolinha e óleo de gergelim.",'

content = content.replace(old_howmade_181_pt, new_howmade_181_pt)

old_howmade_181_ru = '      ru: "Варите свиные кости 8-12 часов до получения кремового белого бульона, заправьте соевым соусом и мирином, приготовьте чашу, скрутив и медленно тушя свиную грудинку, сварите лапшу отдельно и соберите в миске.",'
new_howmade_181_ru = '      ru: "Бланшировать кости в кипящей воде 10 минут, слить и промыть холодной водой. В большую кастрюлю с 3L холодной воды, довести до бурного кипения и держать 10–12 часов, подливая воду; интенсивное кипение белит бульон. Плотно скрутить свиную грудинку, перевязать, обжарить со всех сторон в сухой сковороде, тушить на самом слабом огне в 3 ст.л. соевого соуса, 2 ст.л. мирина, 1 ст.л. саке и 100мл воды 90 минут; отдохнуть 20 минут, нарезать по 1 см. Тарэ: 4 ст.л. соевого + 2 ст.л. мирина, кипятить 3 минуты, остудить. Сварить лапшу, откинуть. По 2 ст.л. тарэ в каждую миску, 400мл горячего бульона, чашу, яйцо, менму, нори, зелёный лук и кунжутное масло.",'

content = content.replace(old_howmade_181_ru, new_howmade_181_ru)

old_howmade_181_ar = '      ar: "اطبخ عظام الخنزير 8-12 ساعة للحصول على مرق كريمي أبيض، تبله بصلصة الصويا والميرين، جهز التشاشو بلف بطن الخنزير وطهيه ببطء، اطبخ النودلز بشكل منفصل ثم اجمع في وعاء.",'
new_howmade_181_ar = '      ar: "اسلق العظام في الماء المغلي 10 دقائق، صفّها واشطفها بالماء البارد. انقلها إلى قدر كبير مع 3 لترات ماء بارد، أحضره إلى غليان قوي وحافظ عليه 10–12 ساعة مضيفاً ماء عند الحاجة؛ الغليان القوي يبيّض المرق. الف بطن الخنزير وثبّته، احمّره من كل الجهات في مقلاة جافة، ثم اطهه على أدنى نار في 3 ملاعق صويا و2 ملعقة ميرين و1 ملعقة ساكي و100مل ماء لمدة 90 دقيقة؛ أرحه 20 دقيقة ثم قطّعه 1 سم. التاري: 4 ملاعق صويا + 2 ميرين، اغلِ 3 دقائق وبرّد. اسلق النودلز وصفّها. 2 ملعقة تاري في كل وعاء، 400مل مرق ساخن، ثم التشاشو والبيضة والخيزران والنوري والبصل ورذاذ زيت السمسم.",'

content = content.replace(old_howmade_181_ar, new_howmade_181_ar)

old_howmade_181_zh = '      zh: "将猪骨熬煮8-12小时制成浓白奶汤，用酱油和味醂调味，将猪腩卷起慢炖制成叉烧，分开煮面，最后在碗中摆上所有配料。",'
new_howmade_181_zh = '      zh: "猪骨放入沸水中焯10分钟，捞出冷水冲洗。转入大锅加3升冷水，大火烧开后保持沸腾状态10至12小时，不足时加水；持续大火沸腾能分解胶原蛋白使汤汁变白。五花肉紧卷捆好，干锅煎至四面上色，然后加3大勺酱油、2大勺味醂、1大勺清酒和100毫升水，最小火焖90分钟；静置20分钟后切成1厘米厚片。调底汤：酱油4大勺加味醂2大勺，小火煮3分钟晾凉。面条按袋装指示煮熟沥干。每碗放2大勺底汤，加入400毫升热汤，然后排上叉烧片、对半切蛋、笋干、海苔、葱花，淋几滴芝麻油。",'

content = content.replace(old_howmade_181_zh, new_howmade_181_zh)

old_howmade_181_ja = '      ja: "豚骨を8〜12時間煮込んでクリーミーな白濁スープを作り、醤油とみりんで味付けし、豚バラを巻いてじっくり煮込んでチャーシューを作り、麺は別で茹でてすべてのトッピングと合わせる。",'
new_howmade_181_ja = '      ja: "豚骨を沸騰した湯で10分下茹でし、ザルに上げて冷水でよく洗う。大きな鍋に3Lの水と骨を入れ、強火で沸騰させたらそのまま10〜12時間グラグラ煮続ける——弱火では白濁しない。水が減ったら足す。豚バラをしっかり巻いてたこ糸で結び、乾いたフライパンで全面に焼き色をつけてから、醤油大さじ3・みりん大さじ2・酒大さじ1・水100mlを加え、極弱火で90分煮込む。20分休ませてから1cm厚に切る。タレ：醤油大さじ4＋みりん大さじ2を小鍋で3分煮立てて冷ます。麺を袋の通り茹でて湯切り。各丼にタレ大さじ2を入れ、熱いスープを400ml注いだら、チャーシュー・半熟卵・メンマ・海苔・ねぎをのせ、ごま油を数滴たらす。",'

content = content.replace(old_howmade_181_ja, new_howmade_181_ja)

old_howmade_181_tr = '      tr: "Domuz kemiklerini 8-12 saat kaynatarak kremsi beyaz bir et suyu elde edin, soya sosu ve mirin ile tatlandırın, domuz göbeğini rulo yapıp yavaşça kavurarak chashu hazırlayın, erişteleri ayrı pişirip kasede toplayın.",'
new_howmade_181_tr = '      tr: "Kemikleri kaynar suya alıp 10 dakika haşlayın, süzün ve soğuk suyla durulayın. Büyük bir tencereye 3L soğuk suyla aktarın, kuvvetli kaynamaya alın ve bunu 10–12 saat sürdürün, gerektiğinde su ekleyin; güçlü kaynama suyu beyazlaştırır. Domuz göbeğini sıkıca rulo yapın, bağlayın, kuru tavada tüm yüzeylerini mühürleyin, ardından en düşük ateşte 3 yemek kaşığı soya sosu, 2 yemek kaşığı mirin, 1 yemek kaşığı sake ve 100ml su içinde 90 dakika pişirin; 20 dakika dinlendirdikten sonra 1cm dilimleyin. Tare: 4 yemek kaşığı soya sosu + 2 yemek kaşığı mirin, 3 dakika kaynatıp soğutun. Erişteleri pakete göre pişirin, süzün. Her kaseye 2 yemek kaşığı tare, 400ml sıcak et suyu ekleyin, üstüne chashu, yarım yumurta, bambu, nori, yeşil soğan ve susam yağı ekleyin.",'

content = content.replace(old_howmade_181_tr, new_howmade_181_tr)

old_howmade_181_it = '      it: "Fai sobbollire le ossa di maiale 8-12 ore per un brodo bianco cremoso, condisci con salsa di soia e mirin, prepara il chashu arrotolando e brasando lentamente la pancetta, cuoci i noodle a parte e assembla nella ciotola.",'
new_howmade_181_it = '      it: "Sbollentare le ossa in acqua bollente per 10 minuti, scolare e sciacquare con acqua fredda. Trasferire in una pentola grande con 3L di acqua fredda, portare a ebollizione vigorosa e mantenerla per 10–12 ore, aggiungendo acqua se necessario; la bollitura intensa scompone il collagene e imbianca il brodo. Arrotolare strettamente la pancetta, legarla, rosolare su tutti i lati in padella asciutta, poi brasare a fuoco bassissimo in 3 cucchiai di soja, 2 cucchiai di mirin, 1 cucchiaio di sake e 100ml d\'acqua per 90 minuti; far riposare 20 minuti, affettare a 1 cm. Tare: 4 cucchiai di soja + 2 di mirin, sobbollire 3 minuti, raffreddare. Cuocere i noodle, scolare. 2 cucchiai di tare per ciotola, 400ml di brodo caldo, poi chashu, uovo, bambù, nori, cipollotto e qualche goccia di olio di sesamo.",'

content = content.replace(old_howmade_181_it, new_howmade_181_it)

old_howmade_181_ko = '      ko: "돼지 뼈를 8-12시간 끓여 크리미한 백탁 육수를 만들고, 간장과 미린으로 간을 맞추고, 삼겹살을 말아 천천히 조려 차슈를 만들고, 면은 따로 삶아 모든 토핑과 함께 그릇에 담습니다."'
new_howmade_181_ko = '      ko: "돼지 뼈를 끓는 물에 10분 데치고 냉수로 헹궈냅니다. 큰 냄비에 물 3L와 함께 넣어 강하게 끓인 뒤 그 상태를 10–12시간 유지합니다 — 약한 불에서는 뽀얀 국물이 나오지 않습니다. 물이 줄면 보충합니다. 삼겹살을 단단히 말아 실로 묶고, 건식 팬에서 전면을 구워 색을 낸 뒤 간장 3큰술, 미린 2큰술, 사케 1큰술, 물 100ml로 약불에서 90분 조립니다. 20분 쉬게 한 뒤 1cm로 썹니다. 타레: 간장 4큰술 + 미린 2큰술을 소냄비에 넣어 3분 끓인 뒤 식힙니다. 면을 봉투대로 삶아 물기를 제거합니다. 각 그릇에 타레 2큰술, 뜨거운 육수 400ml를 붓고 차슈, 반숙란, 죽순, 노리, 파를 얹은 뒤 참기름 몇 방울로 마무리합니다.",\n      hi: "सूअर की हड्डियों को उबलते पानी में 10 मिनट उबालें, छानें और ठंडे पानी से धोएं। एक बड़े बर्तन में 3 लीटर ठंडे पानी के साथ डालें, तेज उबाल लाएं और 10–12 घंटे तक उसी तरह उबालते रहें — धीमी आंच पर सफेद शोरबा नहीं बनेगा। पानी कम हो तो और डालें। सूअर की पेट की परत को कसकर रोल करें, डोरी से बांधें, सूखे पैन में सभी तरफ से भूनें, फिर 3 बड़े चम्मच सोया सॉस, 2 बड़े चम्मच मिरिन, 1 बड़ा चम्मच सेक और 100 मिली पानी में धीमी आंच पर 90 मिनट पकाएं। 20 मिनट आराम दें, 1 सेमी मोटी स्लाइस काटें। तारे: 4 बड़े चम्मच सोया सॉस + 2 बड़े चम्मच मिरिन, 3 मिनट उबालें, ठंडा करें। नूडल्स पकाएं, छानें। हर कटोरे में 2 बड़े चम्मच तारे डालें, 400 मिली गर्म शोरबा डालें, फिर चाशू, आधा अंडा, बांस की कोंपलें, नोरी, हरा प्याज़ लगाएं और तिल का तेल छिड़कें।"'

content = content.replace(old_howmade_181_ko, new_howmade_181_ko)

# originText full replacement
old_181 = '''    originText: {
      ro: "Ramen Tonkotsu este o rețetă tradițională din Japonia.",
      en: "Tonkotsu Ramen is a traditional recipe from Japan.",
      es: "Ramen Tonkotsu es una receta tradicional de Japón.",
      fr: "Ramen Tonkotsu est une recette traditionnelle du Japon.",
      de: "Tonkotsu Ramen ist ein traditionelles Rezept aus Japan.",
      pt: "Ramen Tonkotsu é uma receita tradicional do Japão.",
      ru: "Тонкоцу Рамен — традиционный рецепт из Японии.",
      ar: "رامن تونكوتسو وصفة تقليدية من اليابان.",
      zh: "猪骨拉面是来自日本的传统食谱。",
      ja: "豚骨ラーメンは日本の伝統的なレシピです。",
      tr: "Tonkotsu Ramen, Japonya kökenli geleneksel bir tariftir.",
      it: "Ramen Tonkotsu è una ricetta tradizionale del Giappone.",
      ko: "돈코츠 라멘은 일본의 전통 요리입니다."
    }'''

new_181 = '''    originText: {
      ro: "Ramen tonkotsu provine din Hakata — astăzi districtul feroviar al Fukuokei — unde un bol de supă albă cremoasă din oase de porc a constituit prânzul muncitoresc de la mijlocul anilor 1940. Albul este fizică pură: ține fierberea la maxim douăsprezece ore și colagenul se descompune, emulsionând grăsimea în lichid și transformând bulionul într-un opac mătăsos.\\n\\nTare-ul se pune în bol mai întâi, nu în oală, astfel încât fiecare porție să poată fi ajustată individual. Tăițeii sunt subțiri și drepți — concepuți să transporte supă, nu să o capteze. Fiecare topping ocupă o zonă precisă: chashu la nouă, oul marinat la trei, nori în picioare la margine.",
      en: "Tonkotsu ramen comes from Hakata — now the Fukuoka railway district — where a bowl of milky pork-bone broth has been the working lunch since the 1940s. The whiteness is physics: keep the boil rolling for twelve hours and the collagen breaks down, emulsifying fat into the liquid and turning it opaque and silky.\\n\\nTare goes into the bowl first, not the pot, so each serving can be adjusted independently. The noodles are thin and straight — designed to carry broth rather than trap it. Every topping occupies a specific zone: chashu at nine o'clock, marinated egg at three, nori standing upright at the rim.",
      es: "El ramen tonkotsu proviene de Hakata — ahora el distrito ferroviario de Fukuoka — donde un bol de caldo cremoso de huesos de cerdo ha sido el almuerzo de los trabajadores desde los años 40. El color blanco es física pura: mantener la ebullición durante doce horas descompone el colágeno, emulsionando la grasa en el líquido y volviéndolo opaco y sedoso.\\n\\nEl tare va en el bol primero, no en la olla, para que cada ración pueda ajustarse individualmente. Los fideos son finos y rectos — diseñados para transportar el caldo, no para atraparlo. Cada topping ocupa una zona específica: chashu a las nueve, huevo marinado a las tres, nori de pie en el borde.",
      fr: "Le ramen tonkotsu vient de Hakata — aujourd'hui le quartier ferroviaire de Fukuoka — où un bol de bouillon crémeux d'os de porc est le déjeuner des travailleurs depuis les années 1940. La blancheur est de la physique: maintenir l'ébullition pendant douze heures décompose le collagène, émulsifiant la graisse dans le liquide et le rendant opaque et soyeux.\\n\\nLe tare va en premier dans le bol, pas dans la casserole, pour que chaque portion puisse être ajustée individuellement. Les nouilles sont fines et droites — conçues pour transporter le bouillon plutôt que le piéger. Chaque garniture occupe une zone précise: chashu à neuf heures, oeuf mariné à trois heures, nori debout au bord.",
      de: "Tonkotsu Ramen stammt aus Hakata — heute das Eisenbahnviertel von Fukuoka — wo eine Schüssel cremiger Schweineknochenbrühe seit den 1940er Jahren das Arbeiteressen ist. Das Weiß ist Physik: zwölf Stunden kochen lassen, und das Kollagen zerfällt, emulgiert das Fett in die Flüssigkeit und macht sie opak und seidig.\\n\\nTare kommt zuerst in die Schüssel, nicht in den Topf, damit jede Portion individuell angepasst werden kann. Die Nudeln sind dünn und gerade — konzipiert, Brühe zu transportieren, nicht einzufangen. Jedes Topping nimmt eine bestimmte Zone ein: Chashu bei neun Uhr, mariniertes Ei bei drei Uhr, Nori aufrecht am Rand.",
      pt: "O ramen tonkotsu vem de Hakata — hoje o distrito ferroviário de Fukuoka — onde um bol de caldo cremoso de ossos de porco tem sido o almoço dos trabalhadores desde os anos 1940. O branco é física pura: manter a fervura por doze horas decompõe o colágeno, emulsificando a gordura no líquido e tornando-o opaco e sedoso.\\n\\nO tare vai primeiro na tigela, não na panela, para que cada porção possa ser ajustada individualmente. Os noodles são finos e retos — projetados para transportar o caldo, não aprisioná-lo. Cada topping ocupa uma zona específica: chashu às nove horas, ovo marinado às três horas, nori em pé na borda.",
      ru: "Тонкоцу рамен родом из Хаката — ныне железнодорожного района Фукуоки — где миска молочного бульона из свиных костей служит рабочим обедом с 1940-х годов. Белизна — это физика: держите кипение двенадцать часов, и коллаген распадается, эмульгируя жир в жидкость и делая её непрозрачной и шелковистой.\\n\\nТарэ кладётся сначала в миску, а не в кастрюлю, чтобы каждую порцию можно было отрегулировать индивидуально. Лапша тонкая и прямая — предназначена для переноса бульона, а не для его задержки. Каждый топпинг занимает определённую зону: чашу на девяти часах, маринованное яйцо на трёх, нори стоя у края.",
      ar: "رامن التونكوتسو يأتي من هاكاتا — الآن حي المحطة في فوكوكا — حيث كان وعاء مرق العظام الكريمي غداء العمال منذ أربعينيات القرن الماضي. البياض فيزياء بحتة: حافظ على الغليان اثنتي عشرة ساعة ويتحلل الكولاجين، مُستحلباً الدهن في السائل ومحوّلاً إياه إلى أبيض حريري.\\n\\nيُضاف التاري أولاً إلى الوعاء لا إلى القدر، ليتسنى ضبط كل حصة على حدة. النودلز رفيعة ومستقيمة — مصممة لحمل المرق لا لاصطياده. كل إضافة تحتل موقعاً محدداً: التشاشو عند الساعة التاسعة، البيضة المتبلة عند الثالثة، والنوري منتصباً عند الحافة.",
      zh: "猪骨拉面来自博多——如今是福冈的铁路区——自1940年代起，一碗乳白色猪骨汤一直是工人们的午餐。那份白色是物理现象：保持十二小时滚沸，胶原蛋白分解，脂肪乳化进液体，使汤变得不透明而丝滑。\\n\\n底汤调料先放进碗里，不是锅里，这样每碗可以单独调整。面条细而直——设计用来承载汤汁，而不是将其困住。每种配料各占一个固定区域：叉烧在九点钟方向，卤蛋在三点钟方向，海苔直立在碗边。",
      ja: "豚骨ラーメンは博多——現在の福岡・博多駅エリア——が発祥で、1940年代から乳白色の豚骨スープが働く人たちの昼食だった。あの白さは物理の法則だ。十二時間グラグラ沸かし続けると骨のコラーゲンが溶け出し、脂と乳化してスープを不透明でなめらかに変える。\\n\\nタレはポットではなくどんぶりに先に入れる——こうすることで一杯ごとに濃度を調整できる。麺は細くて真っすぐ。スープを吸い込むのではなく運ぶために設計されている。トッピングには定位置がある：チャーシューは九時、味付け卵は三時、海苔は縁に立てかける。",
      tr: "Tonkotsu ramen, Hakata'dan — şimdiki Fukuoka tren istasyonu bölgesinden — gelir; burada sütlü domuz kemik suyu, 1940'lardan beri işçilerin öğle yemeği olmuştur. Beyazlık fizik kuralıdır: kaynamayı on iki saat devam ettirin ve kollajen parçalanır, yağı sıvıyla emülsifiye eder ve suyu donuk ve ipeksi hale getirir.\\n\\nTare kasaya koyulur, tencereye değil; böylece her porsiyon ayrı ayrı ayarlanabilir. Erişte ince ve düzdür — suyu tutmak için değil, taşımak için tasarlanmıştır. Her topping belirli bir bölgeyi kaplar: chashu dokuzda, marine yumurta üçte, nori kenarda dik durur.",
      it: "Il ramen tonkotsu viene da Hakata — oggi il quartiere ferroviario di Fukuoka — dove una ciotola di brodo cremoso di ossa di maiale è stato il pranzo dei lavoratori sin dagli anni '40. Il bianco è fisica pura: mantenere l'ebollizione per dodici ore scompone il collagene, emulsionando il grasso nel liquido e rendendolo opaco e setoso.\\n\\nIl tare va prima nella ciotola, non nella pentola, così ogni porzione può essere regolata individualmente. I noodle sono fini e dritti — progettati per trasportare il brodo, non intrappolarlo. Ogni topping occupa una zona specifica: chashu alle nove, uovo marinato alle tre, nori in piedi al bordo.",
      ko: "돈코츠 라멘은 하카타 — 현재 후쿠오카의 철도 구역 — 에서 유래했으며, 1940년대부터 크리미한 돼지 뼈 육수 한 그릇이 노동자들의 점심이었습니다. 하얀색은 물리학입니다: 12시간 동안 센 불로 끓이면 콜라겐이 분해되어 지방이 액체에 유화되고 불투명하고 실키한 상태가 됩니다.\\n\\n타레는 냄비가 아니라 그릇에 먼저 넣습니다 — 각 서빙을 개별적으로 조절하기 위해서입니다. 면은 가늘고 일직선입니다 — 육수를 가두는 것이 아니라 운반하도록 설계되었습니다. 각 토핑은 특정 구역을 차지합니다: 차슈는 9시, 마리네이드 달걀은 3시, 노리는 가장자리에 직립으로.",
      hi: "टोन्कोत्सु रामेन हाकाता से आता है — अब फुकुओका का रेलवे जिला — जहां 1940 के दशक से सूअर की हड्डी के दूधिया शोरबे का कटोरा श्रमिकों का दोपहर का भोजन रहा है। सफेदी भौतिकी है: बारह घंटे तक उबाल रखें और कोलेजन टूट जाता है, चर्बी तरल में घुल जाती है और इसे अपारदर्शी और रेशमी बना देती है।\\n\\nतारे पहले कटोरे में जाता है, बर्तन में नहीं — ताकि प्रत्येक परोसने को अलग-अलग समायोजित किया जा सके। नूडल्स पतले और सीधे होते हैं — शोरबे को फंसाने के लिए नहीं, बल्कि ले जाने के लिए। हर टॉपिंग एक निर्दिष्ट क्षेत्र में होती है: चाशू नौ बजे, मैरिनेड अंडा तीन बजे, नोरी किनारे पर खड़ा।"
    }'''

content = content.replace(old_181, new_181)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 181 done")
