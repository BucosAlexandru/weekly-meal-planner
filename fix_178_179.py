with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# === ID 178: Boeuf Bourguignon (France) ===

# origin hi
content = content.replace(
    '      ko: "프랑스"\n    },\n    name: {\n      ro: "Boeuf Bourguignon"',
    '      ko: "프랑스",\n      hi: "फ्रांस"\n    },\n    name: {\n      ro: "Boeuf Bourguignon"'
)

# name hi
content = content.replace(
    '      ko: "뵈프 부르기뇽"\n    },\n    category: {\n      ro: "Cină"',
    '      ko: "뵈프 부르기뇽",\n      hi: "बोफ बुर्गिनियों"\n    },\n    category: {\n      ro: "Cină"'
)

# category hi — use ingredients anchor to distinguish
content = content.replace(
    '      ko: "저녁"\n    },\n    ingredients: {\n      ro: ["vită"',
    '      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    ingredients: {\n      ro: ["vită"'
)

# ingredients hi
content = content.replace(
    '      ko: ["소고기", "레드 와인", "당근", "양파", "마늘", "버섯", "베이컨", "파슬리", "오일", "밀가루", "소금", "후추"]',
    '      ko: ["소고기", "레드 와인", "당근", "양파", "마늘", "버섯", "베이컨", "파슬리", "오일", "밀가루", "소금", "후추"],\n      hi: ["बीफ", "लाल वाइन", "गाजर", "प्याज़", "लहसुन", "मशरूम", "बेकन", "अजमोद", "तेल", "आटा", "नमक", "काली मिर्च"]'
)

# howIsMade hi
content = content.replace(
    '      ko: "소고기를 갈색이 되도록 볶은 후 채소와 와인을 넣고 모든 것이 부드럽고 풍미가 깊어질 때까지 몇 시간 동안 약불로 조리합니다."',
    '      ko: "소고기를 갈색이 되도록 볶은 후 채소와 와인을 넣고 모든 것이 부드럽고 풍미가 깊어질 때까지 몇 시간 동안 약불로 조리합니다.",\n      hi: "बीफ को भूनें, सब्जियां और वाइन डालें, फिर घंटों धीमे पकाएं।"'
)

# originText full replacement
old_178 = '''    originText: {
      ro: "Boeuf Bourguignon este o rețetă tradițională din Franța.",
      en: "Boeuf Bourguignon is a traditional recipe from France.",
      es: "Boeuf Bourguignon es una receta tradicional de Francia.",
      fr: "Boeuf Bourguignon est une recette traditionnelle de France.",
      de: "Boeuf Bourguignon ist ein traditionelles Rezept aus Frankreich.",
      pt: "Boeuf Bourguignon é uma receita tradicional da França.",
      ru: "Бёф бургиньон — традиционный рецепт из Франции.",
      ar: "بوف بورغينيون هي وصفة تقليدية من فرنسا.",
      zh: "红酒炖牛肉 是来自法国的传统食谱。",
      ja: "ブッフ・ブルギニヨン はフランスの伝統的なレシピです。",
      tr: "Boeuf Bourguignon, Fransa kökenli geleneksel bir tariftir.",
      it: "Boeuf Bourguignon è una ricetta tradizionale della Francia.",
      ko: "뵈프 부르기뇽은 프랑스의 전통 요리입니다."
    }'''

new_178 = '''    originText: {
      ro: "Boeuf Bourguignon este bijuteria gastronomică a regiunii Burgundia din Franța, un preparat care transformă cărnea de vită în catifea lichidă prin ore lungi de fiert în vin roșu. Rețeta datează din bucătăria rurală franceză, unde gospodinele îl foloseau pentru a frăgezi tăieturile mai tari.\\n\\nFiecare cratiță capătă personalitate proprie prin garnitura de morcovi, champignon și ceapă perlată care absoarbe esența vinului. Este o capodoperă a răbdării culinare.",
      en: "Boeuf Bourguignon is the gastronomic jewel of the Burgundy region of France, a dish that transforms beef into liquid velvet through long hours of simmering in red wine. The recipe traces back to French rural kitchens, where cooks used it to tenderize tougher cuts.\\n\\nEach pot develops its own character through the garnish of carrots, mushrooms, and pearl onions that absorb the essence of the wine. It is a masterpiece of culinary patience.",
      es: "El boeuf bourguignon es la joya gastronómica de la región de Borgoña en Francia, un plato que transforma la carne de res en terciopelo líquido mediante largas horas de cocción en vino tinto. La receta se remonta a las cocinas rurales francesas, donde se usaba para ablandar los cortes más duros.\\n\\nCada olla desarrolla su propio carácter a través de la guarnición de zanahorias, champiñones y cebollitas que absorben la esencia del vino. Es una obra maestra de la paciencia culinaria.",
      fr: "Le boeuf bourguignon est le joyau gastronomique de la région de Bourgogne en France, un plat qui transforme le boeuf en velours liquide grâce à de longues heures de mijotage dans du vin rouge. La recette remonte aux cuisines rurales françaises, où les cuisinières l\'utilisaient pour attendrir les morceaux plus coriaces.\\n\\nChaque cocotte développe son caractère propre grâce à la garniture de carottes, champignons et oignons grelots qui absorbent l\'essence du vin. C\'est un chef-d\'oeuvre de patience culinaire.",
      de: "Boeuf Bourguignon ist das gastronomische Juwel der Burgundregion in Frankreich, ein Gericht, das Rindfleisch durch stundenlange Schmoren in Rotwein in flüssigen Samt verwandelt. Das Rezept stammt aus ländlichen französischen Küchen, wo es verwendet wurde, um zähere Fleischstücke zu zartmachen.\\n\\nJeder Schmortopf entwickelt seinen eigenen Charakter durch die Beilagen aus Karotten, Champignons und Silberzwiebeln, die die Essenz des Weins aufsaugen. Es ist ein Meisterwerk kulinarischer Geduld.",
      pt: "O boeuf bourguignon é a joia gastronômica da região da Borgonha na França, um prato que transforma a carne bovina em veludo líquido através de longas horas de cozimento em vinho tinto. A receita remonta às cozinhas rurais francesas, onde era usada para amaciar os cortes mais duros.\\n\\nCada panela desenvolve seu próprio caráter por meio da guarnição de cenouras, cogumelos e cebolinhas que absorvem a essência do vinho. É uma obra-prima da paciência culinária.",
      ru: "Бёф бургиньон — гастрономическая жемчужина бургундского региона Франции, блюдо, которое превращает говядину в жидкий бархат благодаря долгому тушению в красном вине. Рецепт берёт начало из сельских французских кухонь, где его использовали для размягчения жёстких отрубов.\\n\\nКаждый горшочек обретает свой характер через гарнир из моркови, шампиньонов и жемчужного лука, впитывающих суть вина. Это шедевр кулинарного терпения.",
      ar: "البوف بورغينيون هو جوهرة منطقة بورغوندي في فرنسا، طبق يحول لحم البقر إلى مخمل سائل عبر ساعات طويلة من التبشيم في النبيذ الأحمر. تعود الوصفة إلى المطابخ الريفية الفرنسية، حيث كانت تُستخدم لتليين القطع الأصعب.\\n\\nيكتسب كل وعاء طابعه الخاص من خلال طبق المرافقة من الجزر والمشروم والبصل اللؤلؤي التي تمتص جوهر النبيذ. إنه تحفة من الصبر الطهوي.",
      zh: "勃艮第红酒炖牛肉是法国勃艮第地区的美食瑰宝，这道菜通过在红酒中长时间慢炖，将牛肉化为丝滑如丝绒的质感。食谱源于法国乡村厨房，厨师们用它来软化较硬的肉块。\\n\\n每锅菜都因胡萝卜、蘑菇和珍珠洋葱吸收了葡萄酒的精华而形成独特的风味。这是一道需要耐心的烹饪杰作。",
      ja: "ブッフ・ブルギニヨンはフランスのブルゴーニュ地方の美食の宝石であり、赤ワインで長時間煮込むことで牛肉を液状のベルベットに変える料理です。レシピはフランスの農村の台所に由来し、固い部位を柔らかくするために使われていました。\\n\\n各鍋はニンジン、マッシュルーム、パールオニオンのガルニチュールがワインのエッセンスを吸収することで独自の個性を持ちます。これは料理の忍耐の傑作です。",
      tr: "Boeuf Bourguignon, Fransa\'nın Burgundy bölgesinin gastronomi mücevheridir; kırmızı şarapta saatlerce pişirilerek sığır etini sıvı kadife haline dönüştüren bir yemektir. Tarif, köy Fransız mutfaklarından gelir; burada sert etleri yumuşatmak için kullanılırdı.\\n\\nHer güveç, şarabın özünü emen havuç, mantar ve inci soğanı garnitürü sayesinde kendi karakterini kazanır. Mutfak sabrının bir şaheseridir.",
      it: "Il boeuf bourguignon è il gioiello gastronomico della regione della Borgogna in Francia, un piatto che trasforma il manzo in velluto liquido attraverso lunghe ore di cottura nel vino rosso. La ricetta risale alle cucine rurali francesi, dove veniva usata per rendere teneri i tagli più duri.\\n\\nOgni casseruola sviluppa il proprio carattere attraverso il contorno di carote, funghi e cipolline che assorbono l\'essenza del vino. È un capolavoro di pazienza culinaria.",
      ko: "뵈프 부르기뇽은 프랑스 부르고뉴 지역의 미식 보석으로, 레드 와인에서 오랜 시간 끓여 소고기를 액체 벨벳으로 변화시키는 요리입니다. 이 레시피는 프랑스 농촌 주방에서 유래하였으며, 질긴 부위를 부드럽게 만들기 위해 사용되었습니다.\\n\\n각 냄비는 와인의 정수를 흡수하는 당근, 버섯, 펄 어니언 가니시를 통해 독특한 개성을 갖게 됩니다. 이것은 요리 인내심의 걸작입니다.",
      hi: "बोफ बुर्गिनियों फ्रांस के बरगंडी क्षेत्र का गैस्ट्रोनॉमिक रत्न है, एक ऐसा व्यंजन जो लाल वाइन में घंटों उबालकर बीफ को तरल मखमल में बदल देता है। यह नुस्खा फ्रांसीसी ग्रामीण रसोई से आता है, जहां सख्त टुकड़ों को नरम करने के लिए इसका उपयोग किया जाता था।\\n\\nहर बर्तन अपनी खास पहचान बनाता है गाजर, मशरूम और पर्ल प्याज़ की गार्निश से जो वाइन का सार सोख लेती है। यह पाक कला के धैर्य की एक कृति है।"
    }'''

content = content.replace(old_178, new_178)

# === ID 179: Chakchouka (Tunisia) ===

# origin hi
content = content.replace(
    '      ko: "튀니지"\n    },\n    name: {\n      ro: "Chakchouka"',
    '      ko: "튀니지",\n      hi: "ट्यूनीशिया"\n    },\n    name: {\n      ro: "Chakchouka"'
)

# name hi
content = content.replace(
    '      ko: "차크추카"\n    },\n    category: {',
    '      ko: "차크추카",\n      hi: "चक्चूका"\n    },\n    category: {'
)

# category hi — use ingredients anchor
content = content.replace(
    '      ko: "저녁"\n    },\n    ingredients: {\n      ro: ["ouă", "roșii", "ardei"',
    '      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    ingredients: {\n      ro: ["ouă", "roșii", "ardei"'
)

# ingredients hi
content = content.replace(
    '      ko: ["달걀", "토마토", "파프리카", "양파", "마늘", "올리브 오일", "파프리카 파우더", "커민", "소금", "후추"]',
    '      ko: ["달걀", "토마토", "파프리카", "양파", "마늘", "올리브 오일", "파프리카 파우더", "커민", "소금", "후추"],\n      hi: ["अंडे", "टमाटर", "मिर्च", "प्याज़", "लहसुन", "जैतून का तेल", "पापरिका", "जीरा", "नमक", "काली मिर्च"]'
)

# howIsMade hi
content = content.replace(
    '      ko: "양파, 피망, 마늘을 볶은 후 토마토와 향신료를 넣습니다. 달걀을 위에 올려 익을 때까지 조리합니다."',
    '      ko: "양파, 피망, 마늘을 볶은 후 토마토와 향신료를 넣습니다. 달걀을 위에 올려 익을 때까지 조리합니다.",\n      hi: "प्याज़, मिर्च और लहसुन भूनें, टमाटर और मसाले डालें, फिर ऊपर अंडे तोड़ें और जमने तक पकाएं।"'
)

# originText full replacement
old_179 = '''    originText: {
      ro: "Chakchouka este o rețetă tradițională din Tunisia.",
      en: "Chakchouka is a traditional recipe from Tunisia.",
      es: "Chakchouka es una receta tradicional de Túnez.",
      fr: "Chakchouka est une recette traditionnelle de Tunisie.",
      de: "Chakchouka ist ein traditionelles Rezept aus Tunesien.",
      pt: "Chakchouka é uma receita tradicional da Tunísia.",
      ru: "Чакчука — традиционный рецепт из Туниса.",
      ar: "شكشوكة هي وصفة تقليدية من تونس.",
      zh: "突尼斯炒蛋 是来自突尼斯的传统食谱。",
      ja: "シャクシュカ はチュニジアの伝統的なレシピです。",
      tr: "Chakchouka, Tunus kökenli geleneksel bir tariftir.",
      it: "Chakchouka è una ricetta tradizionale della Tunisia.",
      ko: "차크추카는 튀니지의 전통 요리입니다."
    }'''

new_179 = '''    originText: {
      ro: "Chakchouka este un preparat iconic al bucătăriei nord-africane, originar din Tunisia, unde ouăle fierte în sos de roșii cu ardei și mirodenii au devenit simbolul micului dejun comunal. Simplitatea ingredientelor ascunde o complexitate senzorială remarcabilă.\\n\\nDin Tunisia, rețeta s-a răspândit în toată nordul Africii, Israelul și Orientul Mijlociu, adaptând arome și intensități locale. Fiecare familie o consideră a ei și o pregătește cu ușoare variații.",
      en: "Chakchouka is an iconic dish of North African cuisine, originating in Tunisia, where eggs poached in a spiced tomato and pepper sauce became the symbol of communal breakfast. The simplicity of its ingredients conceals a remarkable sensory complexity.\\n\\nFrom Tunisia, the recipe spread throughout North Africa, Israel, and the Middle East, adapting local flavors and intensities. Every family considers it their own and prepares it with slight variations.",
      es: "El chakchouka es un plato icónico de la cocina norteafricana, originario de Túnez, donde los huevos escalfados en salsa de tomate con pimientos y especias se convirtieron en símbolo del desayuno comunal. La sencillez de sus ingredientes oculta una notable complejidad sensorial.\\n\\nDesde Túnez, la receta se extendió por todo el norte de África, Israel y Oriente Medio, adaptando sabores e intensidades locales. Cada familia la considera propia y la prepara con ligeras variaciones.",
      fr: "Le chakchouka est un plat emblématique de la cuisine nord-africaine, originaire de Tunisie, où les oeufs pochés dans une sauce tomate épicée aux poivrons sont devenus le symbole du petit-déjeuner communautaire. La simplicité des ingrédients cache une complexité sensorielle remarquable.\\n\\nDepuis la Tunisie, la recette s\'est répandue dans tout le nord de l\'Afrique, en Israël et au Moyen-Orient, en s\'adaptant aux saveurs et aux intensités locales. Chaque famille la considère comme la sienne et la prépare avec de légères variations.",
      de: "Chakchouka ist ein ikonisches Gericht der nordafrikanischen Küche, das aus Tunesien stammt, wo in einer gewürzten Tomaten-Paprika-Sauce pochierte Eier zum Symbol des gemeinschaftlichen Frühstücks wurden. Die Einfachheit der Zutaten verbirgt eine bemerkenswerte sensorische Komplexität.\\n\\nVon Tunesien aus verbreitete sich das Rezept in ganz Nordafrika, Israel und dem Nahen Osten, angepasst an lokale Aromen und Intensitäten. Jede Familie betrachtet es als ihr eigenes und bereitet es mit leichten Abwandlungen zu.",
      pt: "O chakchouka é um prato icônico da cozinha norte-africana, originário da Tunísia, onde ovos escalfados em molho de tomate temperado com pimentões se tornaram símbolo do café da manhã comunitário. A simplicidade dos ingredientes esconde uma notável complexidade sensorial.\\n\\nDa Tunísia, a receita se espalhou por todo o norte da África, Israel e Oriente Médio, adaptando sabores e intensidades locais. Cada família a considera sua e a prepara com leves variações.",
      ru: "Чакчука — культовое блюдо североафриканской кухни, родом из Туниса, где яйца, сваренные пашот в остром томатно-перечном соусе, стали символом совместного завтрака. Простота ингредиентов скрывает замечательную сенсорную сложность.\\n\\nИз Туниса рецепт распространился по всей Северной Африке, Израилю и Ближнему Востоку, адаптируя местные ароматы и интенсивность. Каждая семья считает его своим и готовит с небольшими вариациями.",
      ar: "الشكشوكة طبق أيقوني في المطبخ شمال أفريقي، نشأ في تونس حيث أصبحت البيض المطهي في صلصة الطماطم المتبلة بالفلفل رمزاً للإفطار الجماعي. بساطة المكونات تخفي تعقيداً حسياً لافتاً.\\n\\nانتشرت الوصفة من تونس إلى شمال أفريقيا بأكمله وإسرائيل والشرق الأوسط، متكيفة مع النكهات والشدات المحلية. تعتبرها كل عائلة ملكها وتحضرها بتنويعات طفيفة.",
      zh: "沙克舒卡是北非美食中的标志性菜肴，起源于突尼斯，在那里，在加了香料的番茄辣椒酱中炖熟的鸡蛋成为了集体早餐的象征。配料的简单掩盖了非凡的感官复杂性。\\n\\n从突尼斯开始，这道食谱传遍北非、以色列和中东地区，并适应了当地的口味和辣度。每个家庭都视其为自己的菜肴，并以略微不同的方式烹制。",
      ja: "シャクシュカは北アフリカ料理の象徴的な料理であり、チュニジアが発祥地です。スパイスを効かせたトマトとパプリカのソースでポーチされた卵は、共同の朝食の象徴となりました。食材のシンプルさが、驚くほどの感覚的な複雑さを隠しています。\\n\\nチュニジアからレシピは北アフリカ全土、イスラエル、中東へと広まり、地元の風味と辛さに適応していきました。各家庭はそれを自分たちのものと考え、少し異なるアレンジで作ります。",
      tr: "Chakchouka, Kuzey Afrika mutfağının simge yemeği olup Tunus kökenlidir; burada baharatlı domates ve biber sosu içinde pişirilen yumurtalar toplumsal kahvaltının sembolü haline geldi. Malzemelerin sadeliği, dikkate değer bir duyusal karmaşıklığı gizler.\\n\\nTunus\'tan tarif, tüm Kuzey Afrika, İsrail ve Ortadoğu\'ya yayılarak yerel tatları ve yoğunlukları bünyesine katmıştır. Her aile onu kendine özgü sayar ve hafif farklılıklarla hazırlar.",
      it: "La chakchouka è un piatto iconico della cucina nordafricana, originaria della Tunisia, dove le uova affogate in una salsa di pomodoro speziata con peperoni sono diventate il simbolo della colazione comunitaria. La semplicità degli ingredienti nasconde una notevole complessità sensoriale.\\n\\nDalla Tunisia la ricetta si è diffusa in tutto il Nord Africa, Israele e il Medio Oriente, adattando sapori e intensità locali. Ogni famiglia la considera propria e la prepara con leggere variazioni.",
      ko: "차크추카는 북아프리카 요리의 상징적인 요리로, 튀니지에서 유래하였으며, 향신료가 들어간 토마토와 고추 소스에 수란된 달걀이 공동 아침 식사의 상징이 되었습니다. 재료의 단순함은 놀라운 감각적 복잡성을 숨기고 있습니다.\\n\\n튀니지에서 이 레시피는 북아프리카, 이스라엘, 중동 전역으로 퍼져나가면서 현지의 풍미와 강도를 적응시켰습니다. 각 가정은 이를 자신만의 것으로 여기며 약간의 변형을 가해 준비합니다.",
      hi: "चक्चूका उत्तर अफ्रीकी व्यंजन का प्रतीकात्मक पकवान है, जो ट्यूनीशिया में उत्पन्न हुआ, जहां मसालेदार टमाटर और मिर्च की चटनी में पोच किए गए अंडे सामूहिक नाश्ते का प्रतीक बन गए। सामग्री की सरलता एक उल्लेखनीय संवेदी जटिलता को छुपाती है।\\n\\nट्यूनीशिया से यह नुस्खा पूरे उत्तर अफ्रीका, इज़राइल और मध्य पूर्व में फैल गया, स्थानीय स्वाद और तीव्रता को अपनाते हुए। हर परिवार इसे अपना मानता है और थोड़े बदलाव के साथ बनाता है।"
    }'''

content = content.replace(old_179, new_179)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("IDs 178-179 done")
