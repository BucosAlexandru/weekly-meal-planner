with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# === ID 183: Miso Ramen (Japan) ===

# origin hi — inline block, unique anchor via name "Ramen Miso"
content = content.replace(
    'tr: "Japonya", it: "Giappone", ko: "일본"\n    },\n    name: {\n      ro: "Ramen Miso"',
    'tr: "Japonya", it: "Giappone", ko: "일본",\n      hi: "जापान"\n    },\n    name: {\n      ro: "Ramen Miso"'
)

# name hi
content = content.replace(
    '      ko: "미소 라멘"\n    },\n    category: {',
    '      ko: "미소 라멘",\n      hi: "मिसो रामेन"\n    },\n    category: {'
)

# category hi — anchor: ko "점심" + ingredients ro starting with "supă de pui sau porc"
content = content.replace(
    '      ko: "점심"\n    },\n    ingredients: {\n      ro: ["supă de pui sau porc"',
    '      ko: "점심",\n      hi: "दोपहर का खाना"\n    },\n    ingredients: {\n      ro: ["supă de pui sau porc"'
)

# --- Fix ingredients: add quantities to all 13 languages + add hi ---

content = content.replace(
    '      ro: ["supă de pui sau porc", "pastă miso", "tăiței ramen", "carne tocată de porc", "porumb", "unt", "lăstari de bambus", "ou marinat", "alge nori", "ceapă verde", "semințe de susan", "muguri de fasole"],',
    '      ro: ["1,5L supă de oase de pui sau porc", "3 linguri pastă miso roșu sau alb", "300g tăiței ramen proaspeți", "150g carne tocată de porc", "80g porumb din conservă, scurs", "1 lingură unt nesărat", "60g lăstari de bambus, scurși și feliați", "2 ouă fierte moale, marinate, tăiate în jumătate", "2 foi alge nori, tăiate în jumătate", "2 cepe verzi, feliate", "1 linguriță semințe de susan prăjit", "80g muguri de fasole proaspeți, opăriți"],'
)

content = content.replace(
    '      en: ["chicken or pork broth", "miso paste", "ramen noodles", "ground pork", "corn", "butter", "bamboo shoots", "marinated egg", "nori", "green onion", "sesame seeds", "bean sprouts"],',
    '      en: ["1.5L chicken or pork bone broth", "3 tbsp red or white miso paste", "300g fresh ramen noodles", "150g ground pork", "80g canned corn kernels, drained", "1 tbsp unsalted butter", "60g bamboo shoots, drained and sliced", "2 soft-boiled ramen eggs, halved", "2 sheets nori, halved", "2 spring onions, sliced", "1 tsp toasted sesame seeds", "80g fresh bean sprouts, blanched"],'
)

content = content.replace(
    '      es: ["caldo de pollo o cerdo", "pasta de miso", "fideos ramen", "carne picada de cerdo", "maíz", "mantequilla", "brotes de bambú", "huevo marinado", "nori", "cebolla verde", "semillas de sésamo", "brotes de soja"],',
    '      es: ["1,5L de caldo de huesos de pollo o cerdo", "3 cdas de pasta de miso rojo o blanco", "300g de fideos ramen frescos", "150g de carne picada de cerdo", "80g de maíz en lata, escurrido", "1 cda de mantequilla sin sal", "60g de brotes de bambú, escurridos y en rodajas", "2 huevos cocidos a fuego lento, marinados, partidos por la mitad", "2 hojas de nori, partidas por la mitad", "2 cebolletas, en rodajas", "1 cdta de semillas de sésamo tostado", "80g de brotes de soja frescos, escalfados"],'
)

content = content.replace(
    '      fr: ["bouillon de poulet ou porc", "pâte miso", "nouilles ramen", "porc haché", "maïs", "beurre", "pousses de bambou", "œuf mariné", "nori", "oignon vert", "graines de sésame", "germes de soja"],',
    '      fr: ["1,5L de bouillon d\'os de poulet ou de porc", "3 c.à.s. de pâte miso rouge ou blanche", "300g de nouilles ramen fraîches", "150g de porc haché", "80g de maïs en boîte, égoutté", "1 c.à.s. de beurre doux", "60g de pousses de bambou, égouttées et tranchées", "2 oeufs cuits mollets, marinés, coupés en deux", "2 feuilles de nori, coupées en deux", "2 oignons verts, émincés", "1 c.à.c. de graines de sésame grillées", "80g de germes de soja frais, blanchis"],'
)

content = content.replace(
    '      de: ["Hühner- oder Schweinebrühe", "Misopaste", "Ramen-Nudeln", "Schweinehack", "Mais", "Butter", "Bambussprossen", "mariniertes Ei", "Nori", "Frühlingszwiebel", "Sesamkörner", "Sojasprossen"],',
    '      de: ["1,5L Hühner- oder Schweineknochenbrühe", "3 EL rote oder weiße Misopaste", "300g frische Ramen-Nudeln", "150g Schweinehack", "80g Dosenmais, abgetropft", "1 EL ungesalzene Butter", "60g Bambussprossen, abgetropft und geschnitten", "2 weich gekochte Ramen-Eier, mariniert und halbiert", "2 Blatt Nori, halbiert", "2 Frühlingszwiebeln, in Scheiben", "1 TL geröstete Sesamkörner", "80g frische Sojasprossen, blanchiert"],'
)

content = content.replace(
    '      pt: ["caldo de frango ou porco", "pasta de missô", "macarrão ramen", "carne de porco moída", "milho", "manteiga", "brotos de bambu", "ovo marinado", "nori", "cebolinha", "sementes de gergelim", "brotos de feijão"],',
    '      pt: ["1,5L de caldo de osso de frango ou porco", "3 colheres de sopa de pasta de missô vermelho ou branco", "300g de macarrão ramen fresco", "150g de carne de porco moída", "80g de milho em lata, escorrido", "1 colher de sopa de manteiga sem sal", "60g de brotos de bambu, escorridos e fatiados", "2 ovos cozidos moles, marinados, cortados ao meio", "2 folhas de nori, cortadas ao meio", "2 cebolinhas, fatiadas", "1 colher de chá de sementes de gergelim torradas", "80g de brotos de feijão frescos, escaldados"],'
)

content = content.replace(
    '      ru: ["куриный или свиной бульон", "паста мисо", "лапша рамен", "свиной фарш", "кукуруза", "сливочное масло", "побеги бамбука", "маринованное яйцо", "нори", "зелёный лук", "семена кунжута", "ростки фасоли"],',
    '      ru: ["1,5L куриного или свиного костного бульона", "3 ст.л. красной или белой пасты мисо", "300г свежей лапши рамен", "150г свиного фарша", "80г консервированной кукурузы, обсушенной", "1 ст.л. несолёного сливочного масла", "60г побегов бамбука, обсушенных и нарезанных", "2 мягко сваренных маринованных яйца рамен, разрезанных пополам", "2 листа нори, разрезанных пополам", "2 пера зелёного лука, нарезанных", "1 ч.л. поджаренных семян кунжута", "80г свежих ростков фасоли, бланшированных"],'
)

content = content.replace(
    '      ar: ["مرق الدجاج أو الخنزير", "معجون ميسو", "نودلز رامن", "لحم خنزير مفروم", "ذرة", "زبدة", "براعم الخيزران", "بيضة متبلة", "نوري", "بصل أخضر", "بذور السمسم", "براعم الفاصوليا"],',
    '      ar: ["1.5 لتر مرق عظام الدجاج أو الخنزير", "3 ملاعق كبيرة معجون ميسو أحمر أو أبيض", "300غ نودلز رامن طازجة", "150غ لحم خنزير مفروم", "80غ ذرة معلبة مصفاة", "1 ملعقة كبيرة زبدة غير مملحة", "60غ براعم الخيزران مصفاة ومقطعة شرائح", "بيضتان رامن مسلوقتان ناعمتان متبّلتان مقطوعتان نصفين", "ورقتان نوري مقطوعتان نصفين", "2 بصل أخضر مقطع", "1 ملعقة صغيرة بذور سمسم محمصة", "80غ براعم فاصوليا طازجة مسلوقة"],'
)

content = content.replace(
    '      zh: ["鸡汤或猪骨汤", "味噌酱", "拉面条", "猪肉末", "玉米", "黄油", "笋干", "溏心卤蛋", "海苔", "葱花", "芝麻", "豆芽"],',
    '      zh: ["鸡骨或猪骨高汤1.5升", "红味噌或白味噌酱3大勺", "新鲜拉面条300克", "猪肉末150克", "罐装玉米粒80克，沥干", "无盐黄油1大勺", "笋干60克，沥干切片", "溏心腌制拉面蛋2个，对半切", "海苔2片，对半切", "葱2根，切圆片", "烤芝麻1小勺", "新鲜豆芽80克，焯水"],'
)

content = content.replace(
    '      ja: ["鶏がらまたは豚骨スープ", "味噌", "ラーメン麺", "豚ひき肉", "コーン", "バター", "メンマ", "味付け卵", "海苔", "ねぎ", "ごま", "もやし"],',
    '      ja: ["鶏がらまたは豚骨スープ1.5L", "赤または白味噌大さじ3", "生ラーメン麺300g", "豚ひき肉150g", "コーン缶80g（水気を切る）", "無塩バター大さじ1", "メンマ60g（水気を切ってスライス）", "半熟味付け卵2個（半分に切る）", "海苔2枚（半分に切る）", "ねぎ2本（小口切り）", "焙煎ごま小さじ1", "もやし80g（さっと茹でる）"],'
)

content = content.replace(
    '      tr: ["tavuk veya domuz suyu", "miso ezmesi", "ramen eriştesi", "kıyma", "mısır", "tereyağı", "bambu filizi", "marine edilmiş yumurta", "nori", "yeşil soğan", "susam", "fasulye filizi"],',
    '      tr: ["1,5L tavuk veya domuz kemik suyu", "3 yemek kaşığı kırmızı veya beyaz miso ezmesi", "300g taze ramen eriştesi", "150g kıyma", "80g konserve mısır, süzülmüş", "1 yemek kaşığı tuzsuz tereyağı", "60g bambu filizi, süzülmüş ve dilimlenmiş", "2 yumuşak haşlanmış marine edilmiş yumurta, ikiye bölünmüş", "2 yaprak nori, ikiye bölünmüş", "2 yeşil soğan, dilimlenmiş", "1 çay kaşığı kavrulmuş susam", "80g taze fasulye filizi, haşlanmış"],'
)

content = content.replace(
    '      it: ["brodo di pollo o maiale", "pasta di miso", "noodle ramen", "carne di maiale macinata", "mais", "burro", "germogli di bambù", "uovo marinato", "nori", "cipollotto", "semi di sesamo", "germogli di soia"],',
    '      it: ["1,5L di brodo di ossa di pollo o maiale", "3 cucchiai di pasta di miso rosso o bianco", "300g di noodle ramen freschi", "150g di carne di maiale macinata", "80g di mais in scatola, scolato", "1 cucchiaio di burro non salato", "60g di germogli di bambù, scolati e affettati", "2 uova ramen con tuorlo morbido, marinate e dimezzate", "2 fogli di nori, dimezzati", "2 cipollotti, affettati", "1 cucchiaino di semi di sesamo tostati", "80g di germogli di soia freschi, sbollentati"],'
)

content = content.replace(
    '      ko: ["닭 또는 돼지 육수", "미소 페이스트", "라멘 면", "돼지 다진 고기", "옥수수", "버터", "죽순", "마리네이드 달걀", "노리", "파", "참깨", "숙주나물"]',
    '      ko: ["닭 또는 돼지 뼈 육수 1.5L", "적색 또는 백색 미소 페이스트 3큰술", "신선한 라멘 면 300g", "돼지 다진 고기 150g", "캔 옥수수 80g, 물기 뺀 것", "무염 버터 1큰술", "죽순 60g, 물기 빼고 슬라이스", "반숙 마리네이드 달걀 2개, 반으로 자른 것", "노리 2장, 반으로 자른 것", "파 2대, 슬라이스", "볶은 참깨 1작은술", "신선한 숙주나물 80g, 데친 것"],\n      hi: ["1.5 लीटर चिकन या सूअर की हड्डी का शोरबा", "3 बड़े चम्मच लाल या सफेद मिसो पेस्ट", "300 ग्राम ताज़ा रामेन नूडल्स", "150 ग्राम सूअर का क़ीमा", "80 ग्राम डिब्बाबंद मकई के दाने, छाने हुए", "1 बड़ा चम्मच नमक रहित मक्खन", "60 ग्राम बांस की कोंपलें, छानी और कटी हुई", "2 नरम उबले मैरिनेड रामेन अंडे, आधे कटे", "2 नोरी की पत्तियां, आधी कटी", "2 हरे प्याज़, कटे हुए", "1 छोटी चम्मच भुने तिल", "80 ग्राम ताज़ा अंकुरित दाने, उबाले हुए"]'
)

# --- Fix howIsMade: expand terse entries + add hi ---

old_183_ro = '      ro: "Călește usturoiul și carnea tocată de porc, adaugă pasta miso și fierbe 2 minute, toarnă supa caldă și adaugă unt pentru cremozitate, fierbe tăițeii separat, apoi pune în bol și garnisește cu porumb, muguri, ou, nori și ceapă verde.",'
new_183_ro = '      ro: "Prăjește usturoiul (2 căței, tocați) și carnea tocată de porc la foc mare într-un wok sau tigaie cu pereți înalți, spărgând bucățile, până când carnea nu mai este roz. Adaugă pasta miso și prăjește 60 de secunde — se va întuneca puțin. Toarnă supa fierbinte și aduce la fierbere mică; nu fierbe puternic odată ce miso-ul este în oală, altfel pierde gustul fermentat. Adaugă untul și amestecă până se topește. Fierbe tăițeii separat, scurge. Împarte tăițeii în două boluri, toarnă supa miso deasupra. Garnisește cu porumb, muguri de fasole, oul marinat, lăstari de bambus, nori și ceapă verde. Presară semințele de susan la final.",'

content = content.replace(old_183_ro, new_183_ro)

old_183_en = '      en: "Sauté garlic and ground pork, add miso paste and cook 2 minutes, pour in hot broth and add butter for richness, cook noodles separately, then fill bowls and garnish with corn, bean sprouts, egg, nori and green onion.",'
new_183_en = '      en: "Sauté garlic and ground pork in a wok over high heat, breaking up the meat as it cooks, until no pink remains. Add miso paste and stir-fry 60 seconds until it darkens slightly. Pour in hot broth and bring to a low simmer — do not boil hard once miso is in or it loses its fermented edge. Add butter and stir until melted. Cook noodles per packet, drain. Divide noodles between two bowls, ladle miso broth over. Top with corn, bean sprouts, halved ramen egg, bamboo shoots, nori and spring onion. Scatter sesame seeds last.",'

content = content.replace(old_183_en, new_183_en)

old_183_es = '      es: "Sofríe el ajo y la carne picada de cerdo, añade la pasta de miso y cocina 2 minutos, vierte el caldo caliente y añade mantequilla, cocina los fideos aparte, luego sirve en bol y decora con maíz, brotes, huevo, nori y cebolla.",'
new_183_es = '      es: "Sofríe el ajo y la carne picada de cerdo en un wok a fuego fuerte desmenuzando la carne hasta que no quede rosada. Añade la pasta de miso y saltea 60 segundos hasta que oscurezca ligeramente. Vierte el caldo caliente y lleva a fuego suave — no hiervas con fuerza una vez que el miso esté dentro. Añade la mantequilla y remueve hasta que se derrita. Cuece los fideos aparte, escurre. Reparte los fideos en dos boles, vierte el caldo miso por encima. Cubre con maíz, brotes, huevo marinado, bambú, nori y cebolleta. Esparce sésamo al final.",'

content = content.replace(old_183_es, new_183_es)

old_183_fr = '      fr: "Faites revenir l\'ail et le porc haché, ajoutez la pâte miso et cuisez 2 minutes, versez le bouillon chaud et ajoutez du beurre, cuisez les nouilles à part, puis remplissez les bols et garnissez de maïs, germes, œuf, nori et oignon vert.",'
new_183_fr = '      fr: "Faire revenir l\'ail et le porc haché à feu vif dans un wok en émiettant la viande jusqu\'à ce qu\'elle ne soit plus rose. Ajouter la pâte miso et sauter 60 secondes jusqu\'à ce qu\'elle brunisse légèrement. Verser le bouillon chaud et amener à frémissement — ne pas faire bouillir fort une fois le miso ajouté. Ajouter le beurre et remuer jusqu\'à ce qu\'il fonde. Cuire les nouilles séparément, égoutter. Répartir les nouilles dans deux bols, verser le bouillon miso. Garnir de maïs, germes de soja, oeuf mariné, bambou, nori et oignon vert. Parsemer de sésame au dernier moment.",'

content = content.replace(old_183_fr, new_183_fr)

old_183_de = '      de: "Knoblauch und Schweinehack anbraten, Misopaste zugeben und 2 Minuten kochen, heiße Brühe eingießen und Butter für Cremigkeit hinzufügen, Nudeln getrennt kochen, dann in Schüsseln füllen und mit Mais, Sprossen, Ei, Nori und Frühlingszwiebeln garnieren.",'
new_183_de = '      de: "Knoblauch und Schweinehack in einem Wok bei starker Hitze anbraten, das Fleisch dabei zerkleinern, bis es gar ist. Misopaste zugeben und 60 Sekunden anbraten, bis sie leicht dunkler wird. Heiße Brühe eingießen und zum sanften Köcheln bringen — nach dem Hinzufügen der Miso nicht mehr stark kochen lassen. Butter einrühren bis sie schmilzt. Nudeln separat kochen, abgießen. Nudeln auf zwei Schüsseln verteilen, Misobrühe darüber gießen. Mit Mais, Sojasprossen, mariniertem Ei, Bambussprossen, Nori und Frühlingszwiebeln garnieren. Sesam zuletzt streuen.",'

content = content.replace(old_183_de, new_183_de)

old_183_pt = '      pt: "Refogue alho e carne de porco moída, adicione pasta de missô e cozinhe 2 minutos, despeje o caldo quente e adicione manteiga, cozinhe o macarrão separadamente, depois sirva nas tigelas e enfeite com milho, brotos, ovo, nori e cebolinha.",'
new_183_pt = '      pt: "Refogue alho e carne de porco moída em fogo alto numa wok, desfiando a carne, até não restar cor rosada. Adicione a pasta de missô e refogue 60 segundos até escurecer levemente. Despeje o caldo quente e reduza para fervura leve — não deixe ferver forte depois de adicionar o missô. Adicione a manteiga e mexa até derreter. Cozinhe os noodles separadamente, escorra. Divida os noodles em duas tigelas, adicione o caldo miso. Cubra com milho, brotos de feijão, ovo marinado, bambu, nori e cebolinha. Espalhe o gergelim por último.",'

content = content.replace(old_183_pt, new_183_pt)

old_183_ru = '      ru: "Обжарьте чеснок и свиной фарш, добавьте пасту мисо и готовьте 2 минуты, влейте горячий бульон и добавьте сливочное масло, сварите лапшу отдельно, затем разложите по мискам и украсьте кукурузой, ростками, яйцом, нори и луком.",'
new_183_ru = '      ru: "Обжарьте чеснок и свиной фарш в воке на сильном огне, разминая мясо, пока оно не перестанет быть розовым. Добавьте пасту мисо и жарьте 60 секунд до слабого потемнения. Влейте горячий бульон и доведите до лёгкого кипения — не кипятить сильно после добавления мисо. Добавьте масло, перемешайте до растворения. Сварите лапшу отдельно, откиньте. Разложите лапшу по мискам, залейте бульоном мисо. Сверху выложите кукурузу, ростки, маринованное яйцо, менму, нори и зелёный лук. Посыпьте кунжутом в последний момент.",'

content = content.replace(old_183_ru, new_183_ru)

old_183_ar = '      ar: "قلي الثوم ولحم الخنزير المفروم، أضف معجون الميسو واطبخ دقيقتين، صب المرق الساخن وأضف الزبدة، اطبخ النودلز بشكل منفصل، ثم ضعه في الأوعية وزين بالذرة والبراعم والبيض والنوري والبصل الأخضر.",'
new_183_ar = '      ar: "قلي الثوم ولحم الخنزير المفروم في المقلاة الصينية على نار عالية مع تفتيت اللحم حتى لا يبقى لون وردي. أضف معجون الميسو وقلّب 60 ثانية حتى يتحمص قليلاً. صبّ المرق الساخن وأحضره إلى غليان خفيف — لا تغلِ بقوة بعد إضافة الميسو. أضف الزبدة وحرّك حتى تذوب. اطبخ النودلز منفصلاً وصفّها. وزّع النودلز على وعاءين وصبّ مرق الميسو فوقها. زيّن بالذرة وبراعم الفاصوليا والبيضة المتبلة والخيزران والنوري والبصل الأخضر. انثر السمسم في النهاية.",'

content = content.replace(old_183_ar, new_183_ar)

old_183_zh = '      zh: "炒香大蒜和猪肉末，加入味噌酱炒2分钟，倒入热汤并加黄油增加浓郁感，分开煮面，然后盛入碗中，用玉米、豆芽、鸡蛋、海苔和葱花装饰。",'
new_183_zh = '      zh: "大火热锅，炒香蒜末和猪肉末，边炒边拨散，直至猪肉不再有粉红色。加入味噌酱翻炒60秒至颜色略深。倒入热汤，调至小火微沸——加入味噌后不可大火沸腾，否则发酵香气流失。加入黄油搅拌至融化。另锅煮面，沥干。将面条分入两碗，舀味噌汤汁浇上。摆上玉米、豆芽、腌制溏心蛋、笋干、海苔和葱花。最后撒芝麻。",'

content = content.replace(old_183_zh, new_183_zh)

old_183_ja = '      ja: "にんにくと豚ひき肉を炒め、味噌を加えて2分炒め、熱いスープを注いでバターを加えてコクを出し、麺は別で茹でてから器に盛り、コーン・もやし・卵・海苔・ねぎをのせる。",'
new_183_ja = '      ja: "強火にかけたフライパンやウォックでにんにくと豚ひき肉を炒め、ひき肉をほぐしながら色が変わるまで火を通す。味噌を加えて60秒炒め、少し焦がし色をつける。熱いスープを注ぎ、弱めの沸騰状態に保つ——味噌を入れたら強火にしない。バターを加えて溶けるまで混ぜる。麺は別で茹でて水気を切る。麺を二つの丼に分け、味噌スープをかける。コーン・もやし・味付け卵・メンマ・海苔・ねぎを盛り、ごまを最後に散らす。",'

content = content.replace(old_183_ja, new_183_ja)

old_183_tr = '      tr: "Sarımsak ve kıymayı kavurun, miso ezmesi ekleyip 2 dakika pişirin, sıcak et suyunu dökün ve tereyağı ekleyin, erişteleri ayrı pişirin, sonra kaselere doldurun ve mısır, filiz, yumurta, nori ve yeşil soğanla süsleyin.",'
new_183_tr = '      tr: "Wok\'ta yüksek ateşte sarımsak ve kıymayı kavurun, eti ufalayarak hiç pembe renk kalmayıncaya dek pişirin. Miso ezmesini ekleyip 60 saniye karıştırarak hafifçe kararmasını sağlayın. Sıcak et suyunu dökün ve hafif kaynamaya alın — miso ekledikten sonra kuvvetlice kaynatmayın. Tereyağını ekleyip eriyene kadar karıştırın. Erişteleri ayrı pişirip süzün. Erişteleri iki kaseye bölün, miso et suyunu üzerine dökün. Mısır, fasulye filizi, marine yumurta, bambu, nori ve yeşil soğanla süsleyin. En son susamı serpin.",'

content = content.replace(old_183_tr, new_183_tr)

old_183_it = '      it: "Soffriggi aglio e carne di maiale macinata, aggiungi la pasta di miso e cuoci 2 minuti, versa il brodo caldo e aggiungi il burro, cuoci i noodle a parte, poi riempi le ciotole e guarnisci con mais, germogli, uovo, nori e cipollotto.",'
new_183_it = '      it: "In un wok a fuoco vivo, soffriggere aglio e carne macinata di maiale, sgranando la carne, fino a quando non rimane più rosa. Aggiungere la pasta di miso e saltare 60 secondi finché scurisce leggermente. Versare il brodo caldo e portare a leggero bollore — non far bollire forte una volta aggiunto il miso. Aggiungere il burro e mescolare fino a scioglierlo. Cuocere i noodle a parte, scolare. Dividere i noodle in due ciotole, versare il brodo miso. Guarnire con mais, germogli di soia, uovo marinato, bambù, nori e cipollotto. Spargere il sesamo per ultimi.",'

content = content.replace(old_183_it, new_183_it)

old_183_ko = '      ko: "마늘과 돼지 다진 고기를 볶고, 미소 페이스트를 넣어 2분간 볶고, 뜨거운 육수를 붓고 버터를 더해 고소함을 내고, 면은 따로 삶아 그릇에 담고, 옥수수·숙주·달걀·노리·파로 장식합니다."'
new_183_ko = '      ko: "웍에 센 불로 마늘과 돼지 다진 고기를 볶아 고기를 부수며 분홍빛이 없어질 때까지 익힙니다. 미소 페이스트를 넣고 60초 볶아 살짝 갈색이 되게 합니다. 뜨거운 육수를 붓고 약하게 끓이는 상태 유지 — 미소 추가 후 강하게 끓이면 발효 맛이 사라집니다. 버터를 넣어 녹을 때까지 젓습니다. 면은 따로 삶아 물기를 뺍니다. 면을 두 그릇에 나누어 담고 미소 육수를 붓습니다. 옥수수, 숙주, 마리네이드 달걀, 죽순, 노리, 파로 장식하고 참깨를 마지막에 뿌립니다.",\n      hi: "एक वोक में तेज़ आंच पर लहसुन और सूअर के क़ीमे को भूनें, मांस को तोड़ते हुए जब तक कोई गुलाबी रंग न रहे। मिसो पेस्ट डालें और 60 सेकंड तक भूनें जब तक थोड़ा गहरा न हो जाए। गर्म शोरबा डालें और हल्के उबाल पर रखें — मिसो डालने के बाद तेज़ उबाल न आने दें वरना किण्वित स्वाद खो जाएगा। मक्खन डालें और पिघलने तक हिलाएं। नूडल्स अलग से पकाएं, छानें। नूडल्स को दो कटोरों में बांटें, मिसो शोरबा डालें। मकई, अंकुरित दाने, मैरिनेड अंडा, बांस की कोंपलें, नोरी और हरा प्याज़ लगाएं। अंत में तिल छिड़कें।"'

content = content.replace(old_183_ko, new_183_ko)

# originText full replacement
old_183 = '''    originText: {
      ro: "Ramen Miso este o rețetă tradițională din Japonia.",
      en: "Miso Ramen is a traditional recipe from Japan.",
      es: "Ramen Miso es una receta tradicional de Japón.",
      fr: "Ramen Miso est une recette traditionnelle du Japon.",
      de: "Miso Ramen ist ein traditionelles Rezept aus Japan.",
      pt: "Ramen Miso é uma receita tradicional do Japão.",
      ru: "Мисо Рамен — традиционный рецепт из Японии.",
      ar: "رامن ميسو وصفة تقليدية من اليابان.",
      zh: "味噌拉面是来自日本的传统食谱。",
      ja: "味噌ラーメンは日本の伝統的なレシピです。",
      tr: "Miso Ramen, Japonya kökenli geleneksel bir tariftir.",
      it: "Ramen Miso è una ricetta tradizionale del Giappone.",
      ko: "미소 라멘은 일본의 전통 요리입니다."
    }'''

new_183 = '''    originText: {
      ro: "Ramen miso este invenția Sapporoului, apărut în anii 1950 când un proprietar de tarabă cu tăiței din Hokkaido a început să adauge pastă de soia fermentată în bulion într-o seară de iarnă geroasă. Iernile Hokkaido cer un bol suficient de dens pentru a menține căldura, iar miso — gras, sărat, profund umami — face asta cum supele limpezi nu pot.\\n\\nPorumbul și untul sunt adaosuri standard în Sapporo, nu opționale. Carnea tocată de porc se prăjește mai întâi în wok cu usturoi și pastă de fasole, iar supa se toarnă ulterior — miso-ul nu fierbe niciodată suficient de mult pentru a-și pierde gustul fermentat. Tăițeii ondulați captează supa mai groasă și rețin fiecare nod de aromă.",
      en: "Miso ramen is Sapporo's invention, born in the 1950s when a Hokkaido noodle-stall owner began adding fermented soybean paste to the broth on a cold winter evening. Hokkaido winters demand a bowl dense enough to hold warmth, and miso — fatty, saline, deeply umami — delivers that in a way clear broths cannot.\\n\\nCorn and butter are standard Sapporo additions, not optional flourishes. The pork is stir-fried in the wok first with garlic and bean paste, then the broth goes in — meaning the miso never boils long enough to lose its fermented edge. The wavy noodles trap the thicker stock and hold every knot of flavour.",
      es: "El ramen miso es el invento de Sapporo, nacido en los años 50 cuando el dueño de un puesto de fideos de Hokkaido empezó a añadir pasta de soja fermentada al caldo en una fría noche de invierno. Los inviernos de Hokkaido exigen un bol lo suficientemente denso para retener el calor, y el miso — graso, salino, profundamente umami — lo logra de un modo que los caldos claros no pueden.\\n\\nEl maíz y la mantequilla son adiciones estándar de Sapporo, no opcionales. La carne picada se sofríe primero en el wok con ajo y pasta de frijoles, luego se añade el caldo — el miso nunca hierve lo suficiente para perder su sabor fermentado. Los fideos rizados atrapan el caldo más espeso y retienen cada nudo de sabor.",
      fr: "Le ramen miso est l'invention de Sapporo, né dans les années 1950 quand le propriétaire d'un stand de nouilles de Hokkaido a commencé à ajouter de la pâte de soja fermentée dans le bouillon lors d'une froide soirée d'hiver. Les hivers de Hokkaido exigent un bol assez dense pour retenir la chaleur, et le miso — gras, salé, profondément umami — y parvient d'une façon que les bouillons clairs ne peuvent pas.\\n\\nLe maïs et le beurre sont des ajouts standards de Sapporo, pas facultatifs. La viande hachée est d'abord sautée dans le wok avec de l'ail et de la pâte de haricots, puis le bouillon est ajouté — le miso ne bout jamais assez longtemps pour perdre son côté fermenté. Les nouilles ondulées piègent le bouillon plus épais et retiennent chaque noeud de saveur.",
      de: "Miso Ramen ist Sapporos Erfindung, entstanden in den 1950er Jahren, als ein Hokkaidoer Nudelstand-Besitzer an einem kalten Winterabend begann, fermentierte Sojabohnenpaste zur Brühe zu geben. Hokkaidos Winter verlangen eine Schüssel, die dicht genug ist, um Wärme zu halten, und Miso — fettig, salzig, tief umami — leistet das, wie klare Brühen es nicht können.\\n\\nMais und Butter sind Standard-Zutaten in Sapporo, keine optionalen Extras. Das Hackfleisch wird zuerst im Wok mit Knoblauch angebraten, dann kommt die Brühe dazu — so kocht das Miso nie lange genug, um seinen fermentierten Charakter zu verlieren. Die gewellten Nudeln fangen die dickere Brühe und halten jeden Geschmacksknoten fest.",
      pt: "O ramen miso é a invenção de Sapporo, nascido nos anos 1950 quando o dono de uma barraca de macarrão de Hokkaido começou a adicionar pasta de soja fermentada ao caldo numa fria noite de inverno. Os invernos de Hokkaido exigem uma tigela densa o suficiente para reter o calor, e o missô — gorduroso, salgado, profundamente umami — entrega isso de um jeito que caldos claros não conseguem.\\n\\nMilho e manteiga são adições padrão em Sapporo, não opcionais. A carne moída é salteada primeiro no wok com alho e pasta de feijão, depois o caldo entra — o missô nunca ferve tempo suficiente para perder sua borda fermentada. Os noodles ondulados capturam o caldo mais espesso e retêm cada nó de sabor.",
      ru: "Мисо рамен — изобретение Саппоро, появившееся в 1950-х годах, когда хозяин лапшичного киоска на Хоккайдо начал добавлять ферментированную соевую пасту в бульон холодным зимним вечером. Зимы Хоккайдо требуют миски, достаточно плотной, чтобы удерживать тепло, а мисо — жирный, солёный, глубоко умами — справляется с этим так, как прозрачные бульоны не могут.\\n\\nКукуруза и сливочное масло — стандартные добавки Саппоро, не опциональные. Свиной фарш сначала обжаривается в воке с чесноком и бобовой пастой, затем добавляется бульон — мисо никогда не кипит достаточно долго, чтобы потерять ферментированный вкус. Вьющаяся лапша захватывает более густой бульон и удерживает каждый узел вкуса.",
      ar: "رامن الميسو هو اختراع سابورو، ولد في خمسينيات القرن الماضي عندما بدأ صاحب كشك النودلز في هوكايدو بإضافة معجون الصويا المخمّر إلى المرق في ليلة شتاء باردة. تستوجب شتاءات هوكايدو وعاءً كثيفاً بما يكفي للحفاظ على الدفء، والميسو — الدسم والمالح وعميق الأوماني — يحقق ذلك بطريقة لا تستطيعها المرق الصافية.\\n\\nالذرة والزبدة إضافتان قياسيتان في سابورو لا اختياريتان. يُقلى اللحم المفروم أولاً في المقلاة مع الثوم ومعجون الفاصوليا ثم يُضاف المرق — فلا يغلي الميسو طويلاً بما يكفي لفقدان طعمه المخمّر. النودلز المجعّدة تحبس المرق الأكثر سماكة وتحتفظ بكل عقدة نكهة.",
      zh: "味噌拉面是札幌的发明，诞生于1950年代，当时一位北海道面食摊的老板在某个寒冷的冬夜开始往汤里加入发酵豆酱。北海道的冬天需要一碗足够浓厚的汤来保住温度，而味噌——油脂丰富、咸鲜深厚、充满鲜味——能做到这一点，清澈的高汤做不到。\\n\\n玉米和黄油是札幌的标配，不是可选项。猪肉末先在锅里和蒜末一起翻炒，再加入高汤——这样味噌就不会沸腾太久而失去那股发酵的气息。波浪形面条能牢牢抓住浓稠的汤汁，把每一份鲜味都锁住。",
      ja: "味噌ラーメンは札幌の発明だ。1950年代、北海道の麺スタンドの店主が寒い冬の夜にスープへ発酵大豆ペーストを加えはじめたのが始まりとされる。北海道の冬は体を芯から温めるほど濃密なスープを求める。味噌——脂肪分が多く塩気があり、深いうまみを持つ——は透き通ったスープにはできないそれをやってのける。\\n\\nコーンとバターは札幌の定番であり、飾りではない。豚ひき肉はまずウォックでにんにくや豆板醤と一緒に炒め、そのあとスープを入れる——こうすることで味噌が長く煮立つことなく発酵の風味が保たれる。ちぢれ麺は濃いめのスープをしっかりと絡め取り、すべての旨みを閉じ込める。",
      tr: "Miso ramen, Sapporo'nun icadıdır; 1950'lerde soğuk bir kış gecesi Hokkaido'lu bir erişte tezgahı sahibinin çorbaya fermente soya fasulyesi ezmesi eklemeye başlamasıyla doğdu. Hokkaido kışları, ısıyı koruyacak kadar yoğun bir kase gerektirir ve miso — yağlı, tuzlu, derin umami — bunu açık çorbaların yapamayacağı şekilde sağlar.\\n\\nMısır ve tereyağı Sapporo'nun standart malzemeleridir, isteğe bağlı değildir. Kıyma önce wok'ta sarımsak ve fasulye ezmesiyle kızartılır, ardından et suyu eklenir — bu sayede miso, fermente aromasını kaybedecek kadar uzun süre kaynatılmaz. Kıvırcık erişte daha yoğun et suyunu yakalar ve her tat düğümünü tutar.",
      it: "Il ramen miso è l'invenzione di Sapporo, nato negli anni '50 quando il proprietario di una bancarella di noodle di Hokkaido ha iniziato ad aggiungere pasta di soia fermentata al brodo in una fredda serata invernale. Gli inverni di Hokkaido richiedono una ciotola abbastanza densa da trattenere il calore, e il miso — grasso, salato, profondamente umami — lo fa in un modo che i brodi limpidi non possono.\\n\\nLa granella di mais e il burro sono aggiunte standard a Sapporo, non opzionali. La carne macinata viene prima saltata nel wok con aglio e pasta di fagioli, poi viene aggiunto il brodo — il miso non bolle mai abbastanza a lungo da perdere il suo carattere fermentato. I noodle ondulati intrappolano il brodo più denso e trattengono ogni nodo di sapore.",
      ko: "미소 라멘은 삿포로의 발명품으로, 1950년대 홋카이도의 면 노점 주인이 추운 겨울 저녁 육수에 발효 된장을 넣기 시작하면서 탄생했습니다. 홋카이도의 겨울은 온기를 유지할 만큼 진한 한 그릇을 요구하며, 미소 — 기름지고 짭짤하며 깊은 우마미 — 는 맑은 육수가 할 수 없는 방식으로 그것을 제공합니다.\\n\\n옥수수와 버터는 삿포로의 표준 재료이지, 선택 사항이 아닙니다. 돼지고기는 먼저 웍에서 마늘과 된장과 함께 볶은 후 육수가 들어갑니다 — 이렇게 하면 미소가 너무 오래 끓어 발효된 맛을 잃지 않습니다. 곱슬면은 더 진한 육수를 잡아내고 모든 풍미를 머금습니다.",
      hi: "मिसो रामेन साप्पोरो का आविष्कार है, जो 1950 के दशक में तब पैदा हुआ जब होक्काइडो के एक नूडल स्टॉल के मालिक ने एक ठंडी सर्दियों की शाम शोरबे में किण्वित सोयाबीन पेस्ट मिलाना शुरू किया। होक्काइडो की सर्दियां एक ऐसे कटोरे की मांग करती हैं जो गर्माहट बनाए रखने के लिए पर्याप्त गाढ़ा हो, और मिसो — वसायुक्त, नमकीन, गहरे उमामी से भरपूर — इसे उस तरह से करता है जो साफ शोरबे नहीं कर सकते।\\n\\nमकई और मक्खन साप्पोरो में मानक हैं, वैकल्पिक नहीं। सूअर का क़ीमा पहले वोक में लहसुन के साथ भूना जाता है, फिर शोरबा जाता है — इसका मतलब है कि मिसो कभी इतनी देर तक नहीं उबलता कि अपनी किण्वित धार खो दे। लहरदार नूडल्स गाढ़े शोरबे को पकड़ते हैं और हर स्वाद की गांठ को बनाए रखते हैं।"
    }'''

content = content.replace(old_183, new_183)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 183 done")
