with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ID 135 - Pasta alla Norma (Italy) - all fields need hi

content = content.replace(
    '      ko: "이탈리아"\n    },\n    name: {\n      ro: "Pasta alla Norma"',
    '      ko: "이탈리아",\n      hi: "इटली"\n    },\n    name: {\n      ro: "Pasta alla Norma"'
)

content = content.replace(
    '      ko: "파스타 알라 노르마"\n    },\n    category: {\n      ro: "Prânz"\n    },\n    servings: 4,\n    tipType: \'pasta\'',
    '      ko: "파스타 알라 노르마",\n      hi: "पास्ता अल्ला नोर्मा"\n    },\n    category: {\n      ro: "Prânz"\n    },\n    servings: 4,\n    tipType: \'pasta\''
)

content = content.replace(
    '      ko: "점심"\n    },\n    servings: 4,\n    tipType: \'pasta\',\n    pairingsType: \'pasta\'',
    '      ko: "점심",\n      hi: "दोपहर का खाना"\n    },\n    servings: 4,\n    tipType: \'pasta\',\n    pairingsType: \'pasta\''
)

content = content.replace(
    '      ko: ["파스타", "가지", "토마토", "마늘", "올리브오일", "리코타 살라타", "바질", "소금", "후추"]\n    },\n    howIsMade: {',
    '      ko: ["파스타", "가지", "토마토", "마늘", "올리브오일", "리코타 살라타", "바질", "소금", "후추"],\n      hi: ["पास्ता", "बैंगन", "टमाटर", "लहसुन", "जैतून का तेल", "रिकोटा सलाटा", "तुलसी", "नमक", "काली मिर्च"]\n    },\n    howIsMade: {'
)

content = content.replace(
    '      ko: "가지를 튀기고 파스타를 삶아 토마토 소스를 만든 후, 리코타 살라타와 바질을 넣어 완성합니다."\n    },\n    originText: {\n      ro: "Pasta alla Norma este',
    '      ko: "가지를 튀기고 파스타를 삶아 토마토 소스를 만든 후, 리코타 살라타와 바질을 넣어 완성합니다.",\n      hi: "बैंगन तलें, पास्ता उबालें, टमाटर सॉस बनाएं, रिकोटा सलाटा और तुलसी के साथ मिलाएं।"\n    },\n    originText: {\n      ro: "Pasta alla Norma este'
)

old_origin = '''    originText: {
      ro: "Pasta alla Norma este o rețetă tradițională din Italia.",
      en: "Pasta alla Norma is a traditional recipe from Italy.",
      es: "Pasta alla Norma es una receta tradicional de Italia.",
      fr: "Pâtes alla Norma est une recette traditionnelle d'Italie.",
      de: "Pasta alla Norma ist ein traditionelles Rezept aus Italien.",
      pt: "Pasta alla Norma é uma receita tradicional da Itália.",
      ru: "Паста алла Норма — традиционный рецепт из Италии.",
      ar: "باستا ألا نورما هي وصفة تقليدية من إيطاليا.",
      zh: "诺尔玛意大利面 是来自意大利的传统食谱。",
      ja: "パスタ・アッラ・ノルマ はイタリアの伝統的なレシピです。",
      tr: "Pasta alla Norma İtalya kökenli geleneksel bir tariftir.",
      it: "Pasta alla Norma è una ricetta tradizionale d'Italia.",
      ko: "파스타 알라 노르마는 이탈리아의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Pasta alla Norma este mândria Cataniei — un fel de paste siciliene în care vinetele prăjite se îmbină cu sos de roșii proaspete, ulei de măsline, busuioc și ricotta sărată rasă deasupra. Numele a fost dat în onoarea operei Norma a compozitorului catanez Vincenzo Bellini: se spune că un scriitor a exclamat că felul este la fel de desăvârșit ca Norma. Vinetele trebuie prăjite separat și bine scurse — nu pur și simplu soteate — pentru a obține textura mătăsoasă potrivită.\\n\\nRicotta salata (ricotta presată, sărată și uscată) este ireductibilă: fermă, sărată și sfărâmicioasă, adaugă o notă umami distinctă pe care nici un alt brânzeturi nu o poate reproduce. Împreună cu triada siciliană — roșii, busuioc, ulei de măsline — formează un echilibru simplu și direct.",
      en: "Pasta alla Norma is the pride of Catania — a Sicilian pasta dish in which fried aubergine meets fresh tomato sauce, olive oil, basil, and grated ricotta salata. The name honours the opera Norma by Catanian composer Vincenzo Bellini: a writer is said to have exclaimed that the dish was as perfect as Norma. The aubergine must be fried separately and well drained — not merely sautéed — to achieve the right silky texture.\\n\\nRicotta salata (pressed, salted, and dried ricotta) is irreplaceable: firm, salty, and crumbly, it adds a distinct umami note that no other cheese can replicate. Together with the Sicilian trinity — tomato, basil, olive oil — it forms a simple, forthright balance.",
      es: "La pasta alla Norma es el orgullo de Catania — un plato de pasta siciliana en el que la berenjena frita se une con salsa de tomate fresco, aceite de oliva, albahaca y ricotta salata rallada. El nombre honra la ópera Norma del compositor catanés Vincenzo Bellini: se dice que un escritor exclamó que el plato era tan perfecto como Norma. La berenjena debe freírse por separado y escurrirse bien — no solo saltearse — para lograr la textura sedosa adecuada.\\n\\nLa ricotta salata (ricotta prensada, salada y seca) es insustituible: firme, salada y desmenuzable, aporta una nota umami distinta que ningún otro queso puede replicar.",
      fr: "La pasta alla Norma est la fierté de Catane — un plat de pâtes siciliennes où l'aubergine frite rencontre la sauce tomate fraîche, l'huile d'olive, le basilic et la ricotta salata râpée. Le nom honore l'opéra Norma du compositeur catanais Vincenzo Bellini : un écrivain aurait exclamé que le plat était aussi parfait que Norma. L'aubergine doit être frite séparément et bien égouttée — pas simplement sautée — pour obtenir la texture soyeuse souhaitée.\\n\\nLa ricotta salata (ricotta pressée, salée et séchée) est irremplaçable : ferme, salée et émiettable, elle ajoute une note umami distincte qu'aucun autre fromage ne peut reproduire.",
      de: "Pasta alla Norma ist der Stolz von Catania — ein sizilianisches Nudelsondergericht, bei dem gebratene Auberginen auf frische Tomatensauce, Olivenöl, Basilikum und geriebene Ricotta Salata treffen. Der Name ehrt die Oper Norma des catanischen Komponisten Vincenzo Bellini: Ein Schriftsteller soll ausgerufen haben, das Gericht sei so vollkommen wie Norma. Die Auberginen müssen separat gebraten und gut abgetropft werden — nicht nur sautiert — um die richtige seidige Textur zu erzielen.\\n\\nRicotta Salata (gepresste, gesalzene und getrocknete Ricotta) ist unverzichtbar: fest, salzig und krümelig, fügt sie eine unverwechselbare Umami-Note hinzu, die kein anderer Käse ersetzen kann.",
      pt: "A pasta alla Norma é o orgulho de Catânia — um prato de massa siciliano onde a berinjela frita encontra o molho de tomate fresco, azeite, manjericão e ricotta salata ralada. O nome homenageia a ópera Norma do compositor catanense Vincenzo Bellini: diz-se que um escritor exclamou que o prato era tão perfeito quanto Norma. A berinjela deve ser frita separadamente e bem escorrida — não apenas refogada — para obter a textura sedosa certa.\\n\\nA ricotta salata (ricotta prensada, salgada e seca) é insubstituível: firme, salgada e esfareladiça, acrescenta uma nota umami distinta que nenhum outro queijo consegue replicar.",
      ru: "Паста алла Норма — гордость Катании: сицилийская паста, где жареные баклажаны встречаются со свежим томатным соусом, оливковым маслом, базиликом и тёртой рикоттой салатой. Название отдаёт дань опере «Норма» катанского композитора Винченцо Беллини: по преданию, один писатель воскликнул, что блюдо так же безупречно, как «Норма». Баклажаны нужно жарить отдельно и тщательно процеживать — не просто пассеровать — чтобы добиться нужной шелковистой текстуры.\\n\\nРикотта салата (прессованная, солёная и сушёная рикотта) незаменима: плотная, солёная и рассыпчатая, она придаёт характерный умами-акцент, которого не даст никакой другой сыр.",
      ar: "باستا ألا نورما فخر مدينة كاتانيا — طبق معكرونة صقلي تلتقي فيه الباذنجان المقلي بصلصة الطماطم الطازجة وزيت الزيتون والريحان وريكوتا سالاتا المبشورة. أُطلق الاسم تكريماً لأوبرا نورما للمؤلف الموسيقي الكاتاني فينتشنتسو بيليني: يُقال إن كاتباً صاح أن الطبق بالغ الكمال مثل نورما. يجب قلي الباذنجان منفصلاً وتصفيته جيداً — لا مجرد تحميره — لتحقيق القوام الحريري المطلوب.\\n\\nالريكوتا سالاتا (مضغوطة ومملحة ومجففة) لا يمكن الاستغناء عنها: صلبة ومالحة وقابلة للتفتيت، تضيف نوتة أومامي مميزة لا يستطيع أي جبن آخر تكرارها.",
      zh: "诺尔玛意大利面是卡塔尼亚的骄傲——一道西西里意大利面，炸茄子与新鲜番茄酱、橄榄油、罗勒和刨碎的盐渍里考塔奶酪融合在一起。名字来自卡塔尼亚作曲家文森佐·贝利尼的歌剧《诺尔玛》：据说一位作家感叹这道菜与歌剧一样完美。茄子必须单独油炸并充分沥干——而不仅仅是翻炒——才能获得恰当的丝滑口感。\\n\\n盐渍里考塔奶酪（经过压制、加盐和干燥的里考塔）不可替代：质地紧实、咸香易碎，能带来其他奶酪无法复制的鲜味层次。",
      ja: "パスタ・アッラ・ノルマはカターニアの誇りです——揚げたナスと新鮮なトマトソース、オリーブオイル、バジル、削ったリコッタ・サラータが融合したシチリアのパスタ料理。名前はカターニア出身の作曲家ヴィンチェンツォ・ベッリーニのオペラ「ノルマ」にちなんでいます：ある作家がこの料理はノルマと同じくらい完璧だと叫んだと言われています。ナスは別に揚げてしっかり水気を切る必要があります——単に炒めるだけでは不十分で——適切なシルキーな食感を得るためです。\\n\\nリコッタ・サラータ（プレスして塩漬けにして乾燥させたリコッタ）は代替不可能で：硬くて塩辛くてボロボロと崩れ、他のチーズには再現できない独特のうまみを加えます。",
      tr: "Pasta alla Norma, Katanya'nın gururu — kızartılmış patlıcanın taze domates sosuyla, zeytinyağı, fesleğen ve rendelenmiş ricotta salata ile buluştuğu bir Sicilya makarnasıdır. İsim, Katanyalı besteci Vincenzo Bellini'nin Norma operasına saygı olarak verilmiştir: bir yazarın bu yemeğin Norma kadar mükemmel olduğunu haykırdığı söylenir. Patlıcanlar ayrı ayrı kızartılmalı ve iyice süzülmelidir — sadece sotelemek değil — doğru ipeksi dokuyu elde etmek için.\\n\\nRicotta salata (sıkıştırılmış, tuzlanmış ve kurutulmuş ricotta) vazgeçilmezdir: sert, tuzlu ve ufalanabilir, başka hiçbir peynirin yeniden üretemeyeceği belirgin bir umami notu katar.",
      it: "La pasta alla Norma è l'orgoglio di Catania — un primo piatto siciliano in cui la melanzana fritta incontra la salsa di pomodoro fresco, l'olio d'oliva, il basilico e la ricotta salata grattugiata. Il nome omaggia l'opera Norma del compositore catanese Vincenzo Bellini: si dice che uno scrittore abbia esclamato che il piatto era perfetto quanto la Norma. Le melanzane vanno fritte separatamente e ben scolate — non semplicemente saltate — per ottenere la giusta consistenza setosa.\\n\\nLa ricotta salata (ricotta pressata, salata e stagionata) è insostituibile: soda, salata e sgranata, aggiunge una nota umami distinta che nessun altro formaggio può replicare.",
      ko: "파스타 알라 노르마는 카타니아의 자랑입니다. 튀긴 가지가 신선한 토마토 소스, 올리브오일, 바질, 간 리코타 살라타와 어우러지는 시칠리아 파스타 요리입니다. 이름은 카타니아 출신 작곡가 빈첸초 벨리니의 오페라 '노르마'를 기리며 붙여졌습니다. 한 작가가 이 요리가 노르마만큼 완벽하다고 감탄했다고 전해집니다. 가지는 따로 튀겨서 기름을 충분히 빼야 합니다—단순히 소테하는 것이 아니라—올바른 부드러운 식감을 얻기 위해서입니다.\\n\\n리코타 살라타(압착되고 소금에 절여 건조된 리코타)는 대체 불가합니다. 단단하고 짭짤하며 부스러지기 쉬워, 다른 어떤 치즈도 복제할 수 없는 특별한 감칠맛을 더합니다.",
      hi: "पास्ता अल्ला नोर्मा कातानिया का गर्व है — एक सिसिलियाई पास्ता व्यंजन जिसमें तला हुआ बैंगन ताज़े टमाटर की चटनी, जैतून का तेल, तुलसी और कसी हुई रिकोटा सलाटा के साथ मिलता है। नाम कातानिया के संगीतकार विन्सेंज़ो बेल्लिनी के ओपेरा नोर्मा के सम्मान में रखा गया: कहा जाता है एक लेखक ने कहा कि यह व्यंजन नोर्मा जितना ही परिपूर्ण है। बैंगन को अलग से तलकर अच्छी तरह से निकालना जरूरी है — केवल भूनना नहीं — सही रेशमी बनावट के लिए।\\n\\nरिकोटा सलाटा (दबाई गई, नमकीन और सूखी रिकोटा) अपरिहार्य है: ठोस, नमकीन और भुरभुरी, यह एक विशिष्ट उमामी नोट जोड़ती है जिसे कोई अन्य पनीर दोहरा नहीं सकता।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 135 done")
