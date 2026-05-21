with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ID 131 - Nasi lemak - category already has hi
# Add hi to origin
content = content.replace(
    '      ko: "말레이시아"\n    },\n    name: {\n      ro: "Nasi lemak"',
    '      ko: "말레이시아",\n      hi: "मलेशिया"\n    },\n    name: {\n      ro: "Nasi lemak"'
)

# Add hi to name
content = content.replace(
    '      ko: "나시 르막"\n    },\n    category: {',
    '      ko: "나시 르막",\n      hi: "नासी लेमक"\n    },\n    category: {'
)

# Add hi to ingredients
content = content.replace(
    '      ko: ["코코넛 우유 쌀", "소금 멸치", "땅콩", "삶은 달걀", "오이", "삼발", "고기 (선택)"]\n    },\n    howIsMade: {',
    '      ko: ["코코넛 우유 쌀", "소금 멸치", "땅콩", "삶은 달걀", "오이", "삼발", "고기 (선택)"],\n      hi: ["नारियल दूध चावल", "नमकीन एंकोवी", "मूंगफली", "उबले अंडे", "खीरा", "सम्बल", "मांस (वैकल्पिक)"]\n    },\n    howIsMade: {'
)

# Add hi to howIsMade
content = content.replace(
    '      ko: "쌀을 판단잎과 코코넛 밀크에 넣어 끓인 후, 삶은 달걀, 튀긴 멸치, 땅콩, 오이, 삼발 소스와 함께 제공합니다."\n    },\n    originText: {\n      ro: "Nasi lemak este',
    '      ko: "쌀을 판단잎과 코코넛 밀크에 넣어 끓인 후, 삶은 달걀, 튀긴 멸치, 땅콩, 오이, 삼발 소스와 함께 제공합니다.",\n      hi: "चावल को नारियल के दूध और पांडान पत्तियों में पकाएं, उबले अंडे, तले एंकोवी, मूंगफली, खीरे और सम्बल सॉस के साथ परोसें।"\n    },\n    originText: {\n      ro: "Nasi lemak este'
)

# Replace originText
old_origin = '''    originText: {
      ro: "Nasi lemak este o rețetă tradițională din Malaezia.",
      en: "Nasi lemak is a traditional recipe from Malaysia.",
      es: "Nasi lemak es una receta tradicional de Malasia.",
      fr: "Nasi lemak est une recette traditionnelle de Malaisie.",
      de: "Nasi lemak ist ein traditionelles Rezept aus Malaysia.",
      pt: "Nasi lemak é uma receita tradicional da Malásia.",
      ru: "Наси-лемак — традиционный рецепт из Малайзии.",
      ar: "ناسي لماك هي وصفة تقليدية من ماليزيا.",
      zh: "椰浆饭 是来自马来西亚的传统食谱。",
      ja: "ナシレマッ はマレーシアの伝統的なレシピです。",
      tr: "Nasi lemak Malezya kökenli geleneksel bir tariftir.",
      it: "Nasi lemak è una ricetta tradizionale della Malesia.",
      ko: "나시 르막은 말레이시아의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Nasi lemak — al cărui nume înseamnă orez gras sau bogat în malaieză — este mâncarea națională a Malaeziei și micul dejun al națiunii. Orezul se fierbe în lapte de cocos cu frunze de pandan și se servește înconjurat de un set fix de acompaniamente: sambal picant, ikan bilis (hamsii crocante), arahide prăjite, castraveți feliați și un ou fiert sau prăjit. Ansamblul se servea tradițional înfășurat în frunze de bananier.\\n\\nFiecare element are rolul lui: sambalul aduce căldură și complexitate, hamsiile sărătura, arahidele textura, castraveții răcoarea. Felul de mâncare poate fi extins cu pui rendang sau curry, dar nucleul rămâne același. Malaiezienii mănâncă nasi lemak la orice oră din zi.",
      en: "Nasi lemak — whose name means fatty or rich rice in Malay — is Malaysia's national dish and the nation's breakfast. Rice is cooked in coconut milk with pandan leaves and served surrounded by a fixed set of accompaniments: spicy sambal, ikan bilis (crispy anchovies), roasted peanuts, sliced cucumber, and a boiled or fried egg. The package was traditionally wrapped in banana leaf.\\n\\nEach element has its role: the sambal brings heat and complexity, the anchovies saltiness, the peanuts texture, the cucumber coolness. The dish can be extended with rendang chicken or curry, but the core remains unchanged. Malaysians eat nasi lemak at any hour of the day.",
      es: "Nasi lemak — cuyo nombre significa arroz graso o rico en malayo — es el plato nacional de Malasia y el desayuno de la nación. El arroz se cocina en leche de coco con hojas de pandan y se sirve con un conjunto fijo de acompañamientos: sambal picante, ikan bilis (anchoas crujientes), cacahuetes tostados, pepino laminado y un huevo cocido o frito. Tradicionalmente se envolvía en hoja de bananero.\\n\\nCada elemento tiene su papel: el sambal aporta calor y complejidad, las anchoas salinidad, los cacahuetes textura, el pepino frescor. El plato puede ampliarse con pollo rendang o curry, pero el núcleo permanece intacto.",
      fr: "Nasi lemak — dont le nom signifie riz gras ou riche en malais — est le plat national de la Malaisie et le petit-déjeuner de la nation. Le riz est cuit dans du lait de coco avec des feuilles de pandan et servi entouré d'un ensemble d'accompagnements fixes : sambal épicé, ikan bilis (anchois croustillants), cacahuètes grillées, concombre émincé et un œuf dur ou frit. Traditionnellement enveloppé dans une feuille de bananier.\\n\\nChaque élément a son rôle : le sambal apporte chaleur et complexité, les anchois la salinité, les cacahuètes la texture, le concombre la fraîcheur.",
      de: "Nasi Lemak — dessen Name im Malaiischen fettes oder reichhaltiges Reis bedeutet — ist Malaysias Nationalgericht und das Frühstück der Nation. Reis wird in Kokosmilch mit Pandanblättern gekocht und mit einem festen Set von Beilagen serviert: scharfes Sambal, Ikan Bilis (knusprige Sardellen), geröstete Erdnüsse, Gurkenscheiben und ein hart- oder spiegelgekochtes Ei. Traditionell in Bananenblätter gewickelt.\\n\\nJedes Element hat seine Rolle: Sambal bringt Schärfe und Komplexität, Sardellen Salzigkeit, Erdnüsse Textur, Gurke Kühle.",
      pt: "Nasi lemak — cujo nome significa arroz gordo ou rico em malaio — é o prato nacional da Malásia e o café da manhã da nação. O arroz é cozido em leite de coco com folhas de pandan e servido com um conjunto fixo de acompanhamentos: sambal picante, ikan bilis (anchovas crocantes), amendoim torrado, pepino fatiado e um ovo cozido ou frito. Tradicionamente embrulhado em folha de bananeira.\\n\\nCada elemento tem seu papel: o sambal traz calor e complexidade, as anchovas salinidade, o amendoim textura, o pepino frescor.",
      ru: "Наси-лемак — название означает «жирный» или «богатый рис» на малайском — национальное блюдо Малайзии и завтрак нации. Рис варят в кокосовом молоке с листьями пандана и подают с набором неизменных добавок: острым самбалом, икан-билис (хрустящими анчоусами), жареным арахисом, ломтиками огурца и варёным или жареным яйцом. Традиционно всё заворачивалось в банановый лист.\\n\\nКаждый элемент выполняет свою роль: самбал даёт остроту и сложность, анчоусы — соль, арахис — текстуру, огурец — свежесть.",
      ar: "ناسي لماك — الذي يعني اسمه الأرز الدسم أو الغني بالملاوية — هو الطبق الوطني لماليزيا وفطورها اليومي. يُطهى الأرز في حليب جوز الهند مع أوراق الباندان ويُقدَّم محاطاً بمجموعة ثابتة من المرافقات: السامبال الحار وإيكان بيليس (الأنشوجة المقرمشة) والفول السوداني المحمّص والخيار المقطع وبيضة مسلوقة أو مقلية. كان يُلفّ تقليدياً بأوراق الموز.\\n\\nلكل عنصر دوره: السامبال يُضفي الحرارة والتعقيد، والأنشوجة الملوحة، والفول السوداني القوام، والخيار الانتعاش.",
      zh: "椰浆饭——马来语名意为「油腻」或「丰富的米饭」——是马来西亚的国菜，也是全民早餐。米饭用椰奶和斑兰叶煮熟，配以固定搭档：辣参峇酱、江鱼仔（酥炸小鱼）、炒香花生、薄切黄瓜和一个白煮或煎鸡蛋。传统上用香蕉叶包裹端上桌。\\n\\n每样配料各司其职：参峇酱带来辣度与层次，江鱼仔提供咸鲜，花生增添嚼劲，黄瓜送来清爽。这道菜可搭配仁当鸡或咖喱加量，但核心组合始终不变。马来西亚人一天中任何时候都吃椰浆饭。",
      ja: "ナシレマッ——マレー語で脂っこい、または濃厚なご飯を意味します——はマレーシアの国民食であり、朝食の代名詞です。パンダンリーフを入れたコナッツミルクで炊いたご飯に、サンバル（辛いソース）、イカン・ビリス（カリカリの小魚）、ローストピーナッツ、きゅうりの薄切り、ゆで卵または目玉焼きを添えます。伝統的にバナナの葉に包まれていました。\\n\\n各要素に役割があります：サンバルは辛さと複雑さ、小魚は塩味、ピーナッツは食感、きゅうりは清涼感。レンダン・チキンやカレーを足すこともできますが、中心は変わりません。",
      tr: "Nasi lemak — Malayca adı yağlı ya da zengin pirinç anlamına gelir — Malezya'nın ulusal yemeği ve milletin kahvaltısıdır. Pirinç, hindistancevizi sütü ve pandan yapraklarıyla pişirilir; yanına sabit bir garnitür seti eşlik eder: baharatlı sambal, ikan bilis (çıtır küçük balık), kavrulmuş yer fıstığı, dilimlenmiş salatalık ve haşlanmış ya da kızarmış bir yumurta. Geleneksel olarak muz yaprağına sarılırdı.\\n\\nHer bileşenin bir işlevi vardır: sambal ısı ve karmaşıklık katar, ikan bilis tuzluluk, yer fıstığı doku, salatalık serinlik.",
      it: "Nasi lemak — il cui nome in malese significa riso grasso o ricco — è il piatto nazionale della Malesia e la colazione della nazione. Il riso viene cotto nel latte di cocco con foglie di pandan e servito con un insieme fisso di accompagnamenti: sambal piccante, ikan bilis (acciughe croccanti), arachidi tostate, cetriolo affettato e un uovo sodo o fritto. Tradizionalmente avvolto in foglia di banana.\\n\\nOgni elemento ha il suo ruolo: il sambal porta calore e complessità, le acciughe la salinità, le arachidi la texture, il cetriolo la freschezza.",
      ko: "나시 르막——말레이어로 기름진 또는 풍부한 밥을 뜻합니다——은 말레이시아의 국민 음식이자 국민 아침밥입니다. 쌀을 판단잎과 코코넛 밀크로 지어, 고정된 반찬들과 함께 냅니다: 매운 삼발, 이칸 빌리스(바삭한 멸치), 볶은 땅콩, 얇게 썬 오이, 삶거나 튀긴 달걀. 전통적으로 바나나잎에 싸서 제공되었습니다.\\n\\n각 요소는 제 역할이 있습니다: 삼발은 매운 풍미, 멸치는 짭짤함, 땅콩은 식감, 오이는 시원함. 렌당 치킨이나 카레를 추가할 수 있지만 핵심은 변하지 않습니다.",
      hi: "नासी लेमक — मलय भाषा में जिसका अर्थ है तेलीला या समृद्ध चावल — मलेशिया का राष्ट्रीय व्यंजन और देश का नाश्ता है। चावल को नारियल के दूध और पांडान पत्तियों में पकाया जाता है और एक निश्चित संगत के साथ परोसा जाता है: तीखा सम्बल, इकान बिलिस (कुरकुरी एंकोवी), भुनी मूंगफली, पतला खीरा और एक उबला या तला अंडा। परंपरागत रूप से केले के पत्ते में लपेटकर परोसा जाता था।\\n\\nहर तत्व की अपनी भूमिका है: सम्बल गर्मी और जटिलता लाता है, एंकोवी नमकीनपन, मूंगफली बनावट, खीरा ताज़गी। इसे रेंडांग चिकन या करी के साथ बढ़ाया जा सकता है।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 131 done")
