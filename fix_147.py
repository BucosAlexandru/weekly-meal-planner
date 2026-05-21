with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ID 147 - Fufu (Ghana) - no hi fields yet

content = content.replace(
    '      ko: "가나"\n    },\n    name: {\n      ro: "Fufu"',
    '      ko: "가나",\n      hi: "घाना"\n    },\n    name: {\n      ro: "Fufu"'
)

content = content.replace(
    '      ko: "푸푸"\n    },\n    category: {\n      ro: "Prânz",\n      en: "Lunch"',
    '      ko: "푸푸",\n      hi: "फुफु"\n    },\n    category: {\n      ro: "Prânz",\n      en: "Lunch"'
)

content = content.replace(
    '      ko: "점심"\n    },\n    servings: 4,\n    tipType: \'veg\',',
    '      ko: "점심",\n      hi: "दोपहर का खाना"\n    },\n    servings: 4,\n    tipType: \'veg\','
)

content = content.replace(
    '      ko: ["카사바", "플랜틴", "물"]\n    },\n    howIsMade: {\n      ro: "Se fierb maniocul și bananele',
    '      ko: ["카사바", "플랜틴", "물"],\n      hi: ["कसावा", "कच्चा केला (प्लैंटेन)", "पानी"]\n    },\n    howIsMade: {\n      ro: "Se fierb maniocul și bananele'
)

content = content.replace(
    '      ko: "카사바와 플랜틴을 껍질을 벗겨 삶습니다. 물기를 빼고 큰 절구에 넣어 함께 찧습니다. 부드럽고 탄력 있는 질감이 될 때까지 반죽합니다."\n    },\n    originText: {\n      ro: "Fufu este',
    '      ko: "카사바와 플랜틴을 껍질을 벗겨 삶습니다. 물기를 빼고 큰 절구에 넣어 함께 찧습니다. 부드럽고 탄력 있는 질감이 될 때까지 반죽합니다.",\n      hi: "कसावा और कच्चा केला उबालें, फिर एक साथ मसलें जब तक चिकना और लोचदार न हो जाए।"\n    },\n    originText: {\n      ro: "Fufu este'
)

old_origin = '''    originText: {
      ro: "Fufu este o rețetă tradițională din Ghana.",
      en: "Fufu is a traditional recipe from Ghana.",
      es: "Fufu es una receta tradicional de Ghana.",
      fr: "Fufu est une recette traditionnelle du Ghana.",
      de: "Fufu ist ein traditionelles Rezept aus Ghana.",
      pt: "Fufu é uma receita tradicional de Gana.",
      ru: "Фуфу — традиционный рецепт из Ганы.",
      ar: "فوفو هي وصفة تقليدية من غانا.",
      zh: "富富 是来自加纳的传统食谱。",
      ja: "フフ はガーナの伝統的なレシピです。",
      tr: "Fufu Ghana kökenli geleneksel bir tariftir.",
      it: "Fufu è una ricetta tradizionale del Ghana.",
      ko: "푸푸는 가나의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Fufu este amidonul de bază al Africii de Vest — o pastă densă, elastică obținută prin fierberea și pisarea împreună a maniocului (cassava) cu banane plantain. Procesul tradițional implică un mojar mare de lemn și un pistil lung: doi oameni lucrează împreună, unul pisând ritmic, celălalt răsucind pasta între lovituri. Textura finală trebuie să fie compactă, netedă și ușor lipicioasă.\\n\\nFufu nu se mănâncă singur — însoțește supele tradiționale ghaneze (egusi, groundnut, palmnut). Se rupe o bucată mică, se modelează în formă de cupă și se folosește pentru a culege supa, fără a mesteca. Fufu este mâncare de sărbătoare și de familie, iar în Ghana, a oferi cuiva fufu este un semn de ospitalitate sinceră.",
      en: "Fufu is the staple starch of West Africa — a dense, elastic paste made by boiling and pounding cassava together with plantain. The traditional process involves a large wooden mortar and a long pestle: two people work together, one pounding rhythmically, the other turning the paste between strokes. The final texture must be compact, smooth, and slightly sticky.\\n\\nFufu is never eaten alone — it accompanies traditional Ghanaian soups (egusi, groundnut, palmnut). A small piece is pinched off, shaped into a cup, and used to scoop up the soup without chewing. Fufu is festive and family food, and in Ghana, offering someone fufu is a sign of sincere hospitality.",
      es: "El fufu es el almidón básico de África Occidental — una pasta densa y elástica obtenida hirviendo y majando juntos yuca y plátano macho. El proceso tradicional implica un mortero grande de madera y una maza larga: dos personas trabajan juntas, una majando rítmicamente, la otra girando la pasta entre golpes. La textura final debe ser compacta, suave y ligeramente pegajosa.\\n\\nEl fufu nunca se come solo — acompaña las sopas ghanesas tradicionales (egusi, maní, palma). Se pellizca un trozo pequeño, se moldea en forma de taza y se usa para recoger la sopa sin masticar.",
      fr: "Le fufu est la fécule de base d'Afrique de l'Ouest — une pâte dense et élastique obtenue en faisant bouillir et en pilant ensemble du manioc et de la banane plantain. Le procédé traditionnel implique un grand mortier en bois et un long pilon : deux personnes travaillent ensemble, l'une pilant rythmiquement, l'autre tournant la pâte entre les coups. La texture finale doit être compacte, lisse et légèrement collante.\\n\\nLe fufu ne se mange jamais seul — il accompagne les soupes ghanéennes traditionnelles (egusi, arachide, palme). On pince un petit morceau, on le façonne en coupe et on s'en sert pour récupérer la soupe sans mâcher.",
      de: "Fufu ist die Grundstärke Westafrikas — eine dichte, elastische Paste, die durch Kochen und gemeinsames Stampfen von Maniok und Kochbanane hergestellt wird. Der traditionelle Prozess erfordert einen großen Holzmörser und einen langen Stößel: Zwei Personen arbeiten zusammen, eine stampft rhythmisch, die andere dreht die Paste zwischen den Schlägen. Die endgültige Textur muss kompakt, glatt und leicht klebrig sein.\\n\\nFufu wird nie allein gegessen — es begleitet traditionelle ghanaische Suppen (Egusi, Erdnuss, Palmöl). Ein kleines Stück wird abgezwickt, zu einem Becher geformt und zum Schöpfen der Suppe verwendet, ohne zu kauen.",
      pt: "O fufu é o amido básico da África Ocidental — uma pasta densa e elástica feita cozinhando e socando juntos mandioca e banana-da-terra. O processo tradicional envolve um grande pilão de madeira e um pilão longo: duas pessoas trabalham juntas, uma socando ritmicamente, a outra girando a pasta entre as pancadas. A textura final deve ser compacta, lisa e ligeiramente pegajosa.\\n\\nO fufu nunca é comido sozinho — acompanha sopas ganesas tradicionais (egusi, amendoim, dendê). Um pequeno pedaço é beliscado, moldado em forma de xícara e usado para colher a sopa sem mastigar.",
      ru: "Фуфу — основной крахмал Западной Африки: плотная, упругая паста, получаемая варкой и толчением маниоки вместе с плантаном. Традиционный процесс предполагает большую деревянную ступу и длинный пестик: двое работают вместе — один ритмично толчёт, другой переворачивает пасту между ударами. Готовая текстура должна быть плотной, гладкой и слегка липкой.\\n\\nФуфу никогда не едят отдельно — его подают к традиционным ганским супам (эгуси, арахисовому, пальмовому). Отщипывают маленький кусок, лепят форму чашки и зачерпывают суп, не разжёвывая.",
      ar: "الفوفو هو النشا الأساسي في غرب أفريقيا — عجينة كثيفة ومرنة تُصنع بسلق وهرس الكسافا مع الموز الجنة معاً. تتطلب العملية التقليدية هاوناً خشبياً كبيراً ومدقاً طويلاً: شخصان يعملان معاً، أحدهما يدق بإيقاع منتظم والآخر يقلب العجينة بين الضربات. القوام النهائي يجب أن يكون متماسكاً وناعماً ولزجاً قليلاً.\\n\\nلا يُؤكل الفوفو وحده أبداً — يُقدَّم مع الشوربات الغانية التقليدية (إيغوسي والفول السوداني والنخيل). يُقرص منه قطعة صغيرة وتُشكَّل على شكل كوب لاستخدامها في غرف الحساء دون مضغ.",
      zh: "富富是西非的主食淀粉——将木薯和大蕉一起煮熟后捣制而成的浓稠弹性糊状物。传统制作需要一个大木臼和长杵：两人配合，一人有节奏地捣，另一人在每次捣击之间翻转面团。最终质地必须紧实、光滑、略带黏性。\\n\\n富富从不单独食用——它搭配加纳传统汤品（埃古西汤、花生汤、棕榈汤）一起吃。取一小块捏成杯形，用来舀汤，无需咀嚼。富富是节日和家庭聚餐的食物，在加纳，为人奉上富富是真诚待客的象征。",
      ja: "フフは西アフリカの主食でんぷんです——キャッサバとプランテンバナナを一緒に茹でて搗いて作る、密度の高い弾力ある練り物。伝統的な工程では大きな木製の臼と長い杵が必要で、二人がチームで作業します。一人がリズミカルに搗き、もう一人が合間に練り物を回します。仕上がりはしっかりとして滑らかで、わずかに粘り気があります。\\n\\nフフは単独では食べません——伝統的なガーナのスープ（エグシ、ピーナッツ、パームナット）と一緒に提供されます。小さな塊をちぎってカップ形に成形し、嚙まずにスープをすくって食べます。",
      tr: "Fufu, Batı Afrika'nın temel nişastasıdır — manyok ve plantenin birlikte haşlanıp dövülmesiyle yapılan yoğun, elastik bir macundur. Geleneksel süreç büyük bir ahşap havan ve uzun bir tokmak gerektirir: iki kişi birlikte çalışır, biri ritmik olarak döver, diğeri her vuruş arasında hamuru döndürür. Nihai doku sıkı, pürüzsüz ve hafifçe yapışkan olmalıdır.\\n\\nFufu asla tek başına yenmez — geleneksel Gana çorbaları (egusi, fıstık, palm) ile birlikte servis edilir. Küçük bir parça koparılır, kap şeklinde modellenir ve çiğnemeden çorbayı toplamak için kullanılır.",
      it: "Il fufu è l'amido di base dell'Africa occidentale — una pasta densa ed elastica ottenuta bollendo e pestando insieme manioca e platano. Il processo tradizionale richiede un grande mortaio di legno e un lungo pestello: due persone lavorano insieme, una pestando ritmicamente, l'altra girando la pasta tra i colpi. La texture finale deve essere compatta, liscia e leggermente appiccicosa.\\n\\nIl fufu non si mangia mai da solo — accompagna le zuppe tradizionali ghanaiane (egusi, arachidi, olio di palma). Si stacca un piccolo pezzo, si modella a tazza e si usa per raccogliere la zuppa senza masticare.",
      ko: "푸푸는 서아프리카의 주식 전분입니다. 카사바와 플랜틴을 함께 삶아 절구에 넣고 찧어 만드는 밀도 높고 탄력 있는 반죽입니다. 전통적인 방법으로는 두 사람이 협력합니다. 한 명이 리드미컬하게 찧는 동안 다른 한 명이 매 찧기 사이에 반죽을 돌려줍니다. 완성된 질감은 단단하고 부드러우며 약간 끈적해야 합니다.\\n\\n푸푸는 절대 단독으로 먹지 않습니다. 가나 전통 수프(에구시, 땅콩, 팜넛)와 함께 제공됩니다. 작은 조각을 떼어 컵 모양으로 빚어 씹지 않고 수프를 떠서 먹습니다.",
      hi: "फुफु पश्चिम अफ्रीका का मूल स्टार्च है — कसावा और कच्चे केले को एक साथ उबालकर और कूटकर बनाई जाने वाली घनी, लोचदार लोई। पारंपरिक प्रक्रिया में एक बड़ा लकड़ी का ओखली और लंबी मूसल चाहिए: दो लोग मिलकर काम करते हैं, एक लयबद्ध तरीके से कूटता है, दूसरा हर मार के बीच लोई को घुमाता है। अंतिम बनावट कसी हुई, चिकनी और हल्की चिपचिपी होनी चाहिए।\\n\\nफुफु कभी अकेला नहीं खाया जाता — यह पारंपरिक घाना सूप (एगुसी, मूंगफली, पाम) के साथ परोसा जाता है। एक छोटा टुकड़ा तोड़कर कप के आकार में ढाला जाता है और बिना चबाए सूप को उठाने के लिए इस्तेमाल किया जाता है।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 147 done")
