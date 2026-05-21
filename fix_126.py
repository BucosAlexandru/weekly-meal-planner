with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add hi to origin
content = content.replace(
    '      ko: "베트남"\n    },\n    name: {\n      ro: "Bánh xèo"',
    '      ko: "베트남",\n      hi: "वियतनाम"\n    },\n    name: {\n      ro: "Bánh xèo"'
)

# Add hi to name
content = content.replace(
    '      ko: "반쎄오"\n    },\n    category: {\n      ro: "Mic dejun"\n    },\n    servings: 2',
    '      ko: "반쎄오",\n      hi: "बान्ह शेओ"\n    },\n    category: {\n      ro: "Mic dejun"\n    },\n    servings: 2'
)

# Add hi to category — Banh Xeo is Breakfast; servings: 2
content = content.replace(
    '      ko: "아침"\n    },\n    servings: 2,\n    tipType: \'fish\'',
    '      ko: "아침",\n      hi: "नाश्ता"\n    },\n    servings: 2,\n    tipType: \'fish\''
)

# Add hi to ingredients
content = content.replace(
    '      ko: ["쌀가루", "코코넛 우유", "새우", "돼지고기", "파", "콩나물"]\n    },\n    howIsMade: {',
    '      ko: ["쌀가루", "코코넛 우유", "새우", "돼지고기", "파", "콩나물"],\n      hi: ["चावल का आटा", "नारियल का दूध", "झींगे", "सूअर का मांस", "हरा प्याज़", "अंकुरित मूंग"]\n    },\n    howIsMade: {'
)

# Add hi to howIsMade
content = content.replace(
    '      ko: "쌀가루, 강황, 물로 반죽을 만들어 팬에 얇게 붓고 고기, 새우, 채소를 올린 후 바삭하게 구워 완성합니다."\n    },\n    originText: {\n      ro: "Bánh xèo este',
    '      ko: "쌀가루, 강황, 물로 반죽을 만들어 팬에 얇게 붓고 고기, 새우, 채소를 올린 후 바삭하게 구워 완성합니다.",\n      hi: "चावल के आटे, हल्दी और पानी से बैटर बनाएं, पैन में पतला डालें, मांस, झींगे और सब्ज़ियाँ डालें, कुरकुरा होने तक तलें।"\n    },\n    originText: {\n      ro: "Bánh xèo este'
)

# Replace originText
old_origin = '''    originText: {
      ro: "Bánh xèo este o rețetă tradițională din Vietnam.",
      en: "Banh Xeo is a traditional recipe from Vietnam.",
      es: "Banh Xeo es una receta tradicional de Vietnam.",
      fr: "Banh Xeo est une recette traditionnelle du Viêt Nam.",
      de: "Banh Xeo ist ein traditionelles Rezept aus Vietnam.",
      pt: "Banh Xeo é uma receita tradicional do Vietnã.",
      ru: "Бань сео — традиционный рецепт из Вьетнама.",
      ar: "بان سيو هي وصفة تقليدية من فيتنام.",
      zh: "越南煎饼 是来自越南的传统食谱。",
      ja: "バインセオ はベトナムの伝統的なレシピです。",
      tr: "Banh Xeo Vietnam kökenli geleneksel bir tariftir.",
      it: "Banh Xeo è una ricetta tradizionale del Vietnam.",
      ko: "반쎄오는 베트남의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Bánh xèo — a cărei denumire înseamnă literalmente „clătita sfârâindă" — este o clătită crocantă din Vietnam, colorată în galben aprins de turmeric și preparată din aluat de făină de orez cu lapte de cocos. Sfârâitul pe care îl face la contactul cu tigaia dă numele preparatului. Se umple cu creveți, carne de porc feliată și germeni de fasole, se pliază la jumătate și se scoate pe farfurie.\\n\\nCum se mănâncă este la fel de important ca rețeta: bucăți rupte sunt învelite în frunze de salată verde sau perilla cu ierburi aromatice, apoi înmuiate în nuoc cham — un sos de pește diluat cu zeamă de lămâie, zahăr și ardei. Acest ritm de învelit și înmuiat face din Bánh xèo o masă socială.",
      en: "Bánh xèo — whose name literally means sizzling cake — is a crispy Vietnamese crepe coloured bright yellow by turmeric, made from a batter of rice flour and coconut milk. The sizzle it makes when hit the pan gives the dish its name. It is filled with shrimp, sliced pork, and bean sprouts, folded in half, and slid onto the plate.\\n\\nHow it is eaten matters as much as the recipe: torn pieces are wrapped in leaves of butter lettuce or perilla with fresh herbs, then dipped into nuoc cham — fish sauce diluted with lime juice, sugar, and chili. This rhythm of wrapping and dipping makes bánh xèo a communal meal.",
      es: "Bánh xèo — cuyo nombre significa literalmente torta chisporroteante — es una crêpe vietnamita crujiente de color amarillo brillante gracias a la cúrcuma, elaborada con una masa de harina de arroz y leche de coco. El chisporroteo que hace al caer en la sartén le da el nombre. Se rellena con camarones, cerdo laminado y brotes de soja, se dobla y se sirve en el plato.\\n\\nCómo se come importa tanto como la receta: se envuelven trozos rotos en hojas de lechuga o perilla con hierbas frescas, luego se mojan en nuoc cham — salsa de pescado diluida con jugo de lima, azúcar y chile.",
      fr: "Bánh xèo — dont le nom signifie littéralement galette grésillante — est une crêpe vietnamienne croustillante, colorée en jaune vif par le curcuma, préparée à partir d'une pâte de farine de riz et de lait de coco. Le grésillement qu'elle produit en touchant la poêle lui a donné son nom. Elle est garnie de crevettes, de porc émincé et de pousses de soja, pliée en deux et glissée dans l'assiette.\\n\\nLa façon dont on la mange compte autant que la recette : des morceaux sont enveloppés dans des feuilles de laitue ou de périlla avec des herbes fraîches, puis trempés dans la sauce nuoc cham.",
      de: "Bánh xèo — dessen Name wörtlich knisternder Kuchen bedeutet — ist eine knusprige vietnamesische Crepe, durch Kurkuma leuchtend gelb gefärbt, aus einem Teig aus Reismehl und Kokosmilch. Das Zischen beim Aufprall in die Pfanne gab dem Gericht seinen Namen. Es wird mit Garnelen, dünn geschnittenem Schweinefleisch und Sojasprossen gefüllt, halbiert und auf den Teller geglitten.\\n\\nWie man es isst, ist genauso wichtig wie das Rezept: Abgerissene Stücke werden in Salatblätter oder Perilla mit frischen Kräutern gerollt, dann in Nuoc Cham getaucht — Fischsoße verdünnt mit Limettensaft, Zucker und Chili.",
      pt: "Bánh xèo — cujo nome significa literalmente bolo crepitante — é uma crepe vietnamita crocante colorida de amarelo brilhante pela cúrcuma, feita com uma massa de farinha de arroz e leite de coco. O chiado que faz ao tocar a frigideira deu o nome ao prato. É recheado com camarão, carne de porco fatiada e broto de feijão, dobrado ao meio e servido no prato.\\n\\nComo se come importa tanto quanto a receita: pedaços são embrulhados em folhas de alface ou perilla com ervas frescas, depois mergulhados em nuoc cham — molho de peixe diluído com suco de limão, açúcar e pimenta.",
      ru: "Бань сео — название буквально означает «шипящий пирог» — это хрустящий вьетнамский блин, окрашенный в ярко-жёлтый цвет куркумой, из теста на рисовой муке и кокосовом молоке. Шипение, которое он издаёт, попадая на сковороду, и дало блюду имя. Начинка — креветки, тонко нарезанная свинина и проростки фасоли; блин складывают пополам и подают.\\n\\nСпособ употребления так же важен, как рецепт: кусочки заворачивают в листья салата или периллы с зеленью и обмакивают в нуок-чам — рыбный соус с лаймом, сахаром и чили.",
      ar: "بان سيو — الذي يعني اسمه حرفياً الكعكة المطقطقة — فطيرة فيتنامية مقرمشة ذات لون أصفر ساطع بسبب الكركم، مصنوعة من خليط دقيق الأرز وحليب جوز الهند. الأزيز الذي يُصدره لحظة ملامسة المقلاة منحه هذا الاسم. يُحشى بالجمبري ولحم الخنزير المقطع وبراعم الفاصوليا، ثم يُطوى ويُقدَّم.\\n\\nطريقة تناوله لا تقل أهمية عن وصفته: تُلفّ قطع ممزقة في أوراق الخس أو البيريلا مع الأعشاب الطازجة، ثم تُغمّس في نوك تشام — صلصة السمك المخففة بعصير الليمون والسكر والفلفل.",
      zh: "越南煎饼——其名直译为「滋滋作响的饼」——是一种酥脆的越南煎饼，因姜黄而呈鲜亮黄色，以米粉和椰奶调制的面糊制成。倒入锅中时发出的滋滋声正是其名字的由来。馅料为虾仁、薄切猪肉和豆芽，对折后盛入盘中。\\n\\n吃法与食谱同样重要：将撕下的饼块用生菜叶或紫苏叶裹住新鲜香草，蘸取鱼露酸辣蘸酱（nuoc cham）食用——这种裹食与蘸食的节奏使越南煎饼成为一道社交菜肴。",
      ja: "バインセオ——その名は文字通り「ジュージューいうケーキ」を意味します——はターメリックで鮮やかな黄色に染まったベトナムのサクサクのクレープです。米粉とコナッツミルクの生地を使い、フライパンに当たった瞬間の音がこの料理の名前の由来になっています。エビ、薄切り豚肉、もやしを包んで半分に折り、皿に盛ります。\\n\\n食べ方もレシピと同様に重要です。ちぎった生地をバターレタスやシソの葉に新鮮なハーブと一緒に包み、ライム汁・砂糖・唐辛子で割ったヌクチャムにつけて食べます。",
      tr: "Bánh xèo — adı tam anlamıyla cızırdayan kek demek olan bu yemek — pirinç unu ve hindistan cevizi sütünden yapılan bir hamurla hazırlanan, zerdeçalın verdiği parlak sarı rengiyle göze çarpan çıtır bir Vietnam krepidir. Tavaya değdiğinde çıkardığı cızırtı yemeğe adını vermiştir. Karides, ince dilimlenmiş domuz eti ve fasulye filizleriyle doldurulup yarım kez katlanarak tabağa alınır.\\n\\nNasıl yenildiği tarif kadar önem taşır: koparılan parçalar taze otlarla birlikte marul ya da perilla yapraklarına sarılarak limon suyu, şeker ve biberle seyreltilmiş balık sosu nuoc cham'a daldırılır.",
      it: "Bánh xèo — il cui nome significa letteralmente focaccia sfrigolante — è una crepe vietnamita croccante colorata di giallo brillante dalla curcuma, preparata con una pastella di farina di riso e latte di cocco. Il sibilo che produce quando tocca la padella ha dato il nome al piatto. Viene farcita con gamberetti, maiale a fettine e germogli di soia, ripiegata a metà e scivolata nel piatto.\\n\\nCome si mangia è importante quanto la ricetta: i pezzi strappati vengono avvolti in foglie di lattuga o perilla con erbe fresche, poi immersi nel nuoc cham — salsa di pesce diluita con succo di lime, zucchero e peperoncino.",
      ko: "반쎄오——이름은 문자 그대로 '지글거리는 케이크'를 뜻합니다——는 강황으로 선명한 노란색을 띠는 바삭한 베트남 크레이프로, 쌀가루와 코코넛 밀크로 만든 반죽을 사용합니다. 팬에 닿을 때 나는 지글거리는 소리에서 이름이 유래했습니다. 새우, 얇게 썬 돼지고기, 숙주나물을 채워 반으로 접어 냅니다.\\n\\n먹는 방법이 레시피만큼 중요합니다. 뜯어낸 조각을 상추나 깻잎에 신선한 허브와 함께 싸서, 라임즙·설탕·고추로 희석한 느억짬에 찍어 먹습니다. 이 쌈과 찍기의 리듬이 반쎄오를 특별한 음식으로 만듭니다.",
      hi: "बान्ह शेओ — जिसका नाम शाब्दिक रूप से 'तड़तड़ाता केक' अर्थ रखता है — एक कुरकुरी वियतनामी क्रेप है जो हल्दी से चमकीले पीले रंग की बनती है, चावल के आटे और नारियल के दूध के घोल से। पैन पर डालते ही निकलने वाली आवाज़ से इसका नाम पड़ा। इसे झींगे, पतले कटे सूअर के मांस और अंकुरित मूंग से भरा जाता है, आधा मोड़कर परोसा जाता है।\\n\\nइसे खाने का तरीका नुस्ख़े जितना ही महत्वपूर्ण है: टुकड़ों को लेट्यूस या पेरिला की पत्तियों में ताज़ी जड़ी-बूटियों के साथ लपेटकर नुओक चाम — नींबू के रस, चीनी और मिर्च से पतला किया गया फिश सॉस — में डुबोकर खाया जाता है।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 126 done")
