with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ID 130 - Coconut Rice - all fields need hi
# Add hi to origin
content = content.replace(
    '      ko: "아시아"\n    },\n    name: {\n      ro: "Orez cu lapte de cocos"',
    '      ko: "아시아",\n      hi: "एशिया"\n    },\n    name: {\n      ro: "Orez cu lapte de cocos"'
)

# Add hi to name
content = content.replace(
    '      ko: "코코넛 밥"\n    },\n    category: {\n      ro: "Prânz"',
    '      ko: "코코넛 밥",\n      hi: "नारियल चावल"\n    },\n    category: {\n      ro: "Prânz"'
)

# Add hi to category — Coconut Rice is Lunch; unique via ingredients ro: ["orez", "lapte de cocos"...]
content = content.replace(
    '      ko: "점심"\n    },\n    servings: 4,\n    tipType: \'veg\',\n    pairingsType: \'veg\',\n    ingredients: {\n      ro: ["orez", "lapte de cocos"',
    '      ko: "점심",\n      hi: "दोपहर का खाना"\n    },\n    servings: 4,\n    tipType: \'veg\',\n    pairingsType: \'veg\',\n    ingredients: {\n      ro: ["orez", "lapte de cocos"'
)

# Add hi to ingredients
content = content.replace(
    '      ko: ["쌀", "코코넛 우유", "물", "소금"]\n    },\n    howIsMade: {',
    '      ko: ["쌀", "코코넛 우유", "물", "소금"],\n      hi: ["चावल", "नारियल का दूध", "पानी", "नमक"]\n    },\n    howIsMade: {'
)

# Add hi to howIsMade
content = content.replace(
    '      ko: "쌀을 코코넛 밀크, 물, 소금과 함께 냄비에 넣어 약불로 크리미해질 때까지 끓입니다."\n    },\n    originText: {\n      ro: "Orez cu lapte de cocos este',
    '      ko: "쌀을 코코넛 밀크, 물, 소금과 함께 냄비에 넣어 약불로 크리미해질 때까지 끓입니다.",\n      hi: "चावल को नारियल के दूध, पानी और नमक में मलाईदार होने तक पकाएं।"\n    },\n    originText: {\n      ro: "Orez cu lapte de cocos este'
)

# Replace originText
old_origin = '''    originText: {
      ro: "Orez cu lapte de cocos este o rețetă tradițională din Asia.",
      en: "Coconut Rice is a traditional recipe from Asia.",
      es: "Arroz con coco es una receta tradicional de Asia.",
      fr: "Riz au lait de coco est une recette traditionnelle d'Asie.",
      de: "Kokosreis ist ein traditionelles Rezept aus Asien.",
      pt: "Arroz de coco é uma receita tradicional da Ásia.",
      ru: "Кокосовый рис — традиционный рецепт из Азии.",
      ar: "أرز بجوز الهند هي وصفة تقليدية من آسيا.",
      zh: "椰浆饭 是来自亚洲的传统食谱。",
      ja: "ココナッツライス はアジアの伝統的なレシピです。",
      tr: "Hindistancevizi Pilavı Asya kökenli geleneksel bir tariftir.",
      it: "Riso al cocco è una ricetta tradizionale dell'Asia.",
      ko: "코코넛 밥은 아시아의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Orezul cu lapte de cocos este un element de bază în bucătăriile din Asia de Sud-Est, Asia de Sud și Caraibe — o tehnică simplă cu rezultat surprinzător de aromat. Orezul se fierbe parțial în apă, apoi se termină în lapte de cocos, absorbind grăsimea și dulceața coconutului pentru a crea un bob creamy și ușor dulce. Proporțiile de lapte de cocos față de apă diferă de la regiune la regiune.\\n\\nÎn Malaezia și Singapore este baza nasilemak; în Sri Lanka se servește alături de curry și sambols; în Indonezia apare la banchetele ceremoniale. Frunzele de pandan adaugă aromă florală subtilă în versiunile asiatice, în timp ce versiunile caraibiene preferă scorțișoară și zahăr brun.",
      en: "Coconut rice is a staple across Southeast Asian, South Asian, and Caribbean cuisines — a simple technique with a surprisingly aromatic result. Rice is partly cooked in water, then finished in coconut milk, absorbing its fat and sweetness to produce a creamy, subtly rich grain. The ratio of coconut milk to water varies by region and desired richness.\\n\\nIn Malaysia and Singapore it is the foundation of nasi lemak; in Sri Lanka it accompanies curries and sambols; in Indonesia it appears at ceremonial feasts. Pandan leaves add a subtle floral note in Asian versions, while Caribbean versions favour cinnamon and brown sugar.",
      es: "El arroz con coco es un alimento básico en las cocinas del sudeste asiático, el sur de Asia y el Caribe — una técnica simple con un resultado sorprendentemente aromático. El arroz se cocina parcialmente en agua y se termina en leche de coco, absorbiendo su grasa y dulzura para producir un grano cremoso. La proporción de leche de coco respecto al agua varía según la región.\\n\\nEn Malasia y Singapur es la base del nasi lemak; en Sri Lanka acompaña a los currys y sambols; en Indonesia aparece en banquetes ceremoniales. Las hojas de pandan añaden una nota floral sutil en las versiones asiáticas.",
      fr: "Le riz au lait de coco est un incontournable dans les cuisines d'Asie du Sud-Est, d'Asie du Sud et des Caraïbes — une technique simple au résultat étonnamment aromatique. Le riz est partiellement cuit dans l'eau, puis terminé dans le lait de coco, absorbant sa matière grasse et sa douceur pour produire un grain crémeux. La proportion de lait de coco varie selon la région.\\n\\nEn Malaisie et à Singapour, c'est la base du nasi lemak ; au Sri Lanka, il accompagne les currys ; en Indonésie, il est présent dans les banquets cérémoniaux. Les feuilles de pandan ajoutent une touche florale subtile.",
      de: "Kokosreis ist ein Grundnahrungsmittel in südostasiatischen, südasiatischen und karibischen Küchen — eine einfache Technik mit überraschend aromatischem Ergebnis. Der Reis wird teilweise in Wasser gekocht und dann in Kokosmilch fertig gegart, wobei er deren Fett und Süße aufnimmt. Das Verhältnis von Kokosmilch zu Wasser variiert je nach Region.\\n\\nIn Malaysia und Singapur ist er die Grundlage von Nasi Lemak; in Sri Lanka begleitet er Currys und Sambols; in Indonesien erscheint er bei zeremoniellen Festessen. Pandanblätter geben asiatischen Versionen eine subtile florale Note.",
      pt: "O arroz de coco é um elemento essencial nas cozinhas do Sudeste Asiático, do Sul da Ásia e do Caribe — uma técnica simples com resultado surpreendentemente aromático. O arroz é parcialmente cozido em água e terminado no leite de coco, absorvendo sua gordura e doçura para produzir um grão cremoso. A proporção de leite de coco varia por região.\\n\\nNa Malásia e em Singapura é a base do nasi lemak; no Sri Lanka acompanha caril e sambols; na Indonésia aparece em festas cerimoniais. Folhas de pandan adicionam uma nota floral sutil nas versões asiáticas.",
      ru: "Кокосовый рис — основа кухни Юго-Восточной Азии, Южной Азии и Карибского бассейна: простая техника с удивительно ароматным результатом. Рис сначала частично варят в воде, затем доводят до готовности в кокосовом молоке, впитывая его жир и сладость. Соотношение кокосового молока к воде варьируется в зависимости от региона.\\n\\nВ Малайзии и Сингапуре он лежит в основе наси-лемак; на Шри-Ланке сопровождает карри и самболы; в Индонезии появляется на церемониальных пирах. Листья пандана добавляют тонкий цветочный аромат в азиатских версиях.",
      ar: "أرز جوز الهند أساس في مطابخ جنوب شرق آسيا وجنوبها ومنطقة البحر الكاريبي — أسلوب بسيط ينتج نتيجة عطرة بشكل مدهش. يُطهى الأرز جزئياً بالماء ثم يُكمَل طهيه بحليب جوز الهند، فيمتص دهونه وحلاوته لينتج حبة كريمية ناعمة. تتباين نسبة الحليب إلى الماء بحسب المنطقة.\\n\\nفي ماليزيا وسنغافورة يُشكّل قاعدة ناسي لماك؛ وفي سريلانكا يصاحب الكاري؛ وفي إندونيسيا يظهر في الولائم الاحتفالية. تُضفي أوراق الباندان في النسخ الآسيوية نكهة زهرية خفيفة.",
      zh: "椰浆饭是东南亚、南亚和加勒比地区的主食——方法简单却能带来令人惊喜的芳香风味。米饭先在水中半熟，再用椰奶收尾，吸收椰奶的油脂和甜味，做出颗粒饱满、奶香浓郁的米饭。椰奶与水的比例因地区和所需浓郁程度不同而各异。\\n\\n在马来西亚和新加坡，它是椰浆饭的基础；在斯里兰卡，它配咖喱和杂拌酱；在印度尼西亚，它出现在仪式宴会上。亚洲版本常用斑兰叶增添淡雅花香，加勒比版本则偏爱肉桂和红糖。",
      ja: "ココナッツライスは東南アジア、南アジア、カリブ海の食文化に根付いた主食です——シンプルな技法で驚くほど香り豊かな結果をもたらします。米をまず水で半炊きし、続いてコナッツミルクで仕上げることで、脂肪と甘みを吸収してクリーミーな粒に仕上がります。コナッツミルクと水の比率は地域によって異なります。\\n\\nマレーシアとシンガポールではナシレマッの土台、スリランカではカレーやサンボルに添え、インドネシアでは儀式の宴に登場します。アジア版ではパンダンリーフが淡い花の香りを加えます。",
      tr: "Hindistancevizi pilavı, Güneydoğu Asya, Güney Asya ve Karayip mutfaklarının temel yiyeceğidir — basit bir teknikle şaşırtıcı derecede aromatik bir sonuç elde edilir. Pirinç önce suda kısmen pişirilir, ardından hindistancevizi sütüyle tamamlanır; yağ ve tatlılığı emerek kremsi, hafif zengin bir tane oluşturur.\\n\\nMalezya ve Singapur'da nasi lemakın temelidir; Sri Lanka'da köriler ve sambollerle eşlik eder; Endonezya'da ise törensel ziyafetlerde görünür. Asya versiyonlarında pandan yaprakları ince çiçeksi bir aroma katar.",
      it: "Il riso al cocco è un elemento base nelle cucine del Sud-Est asiatico, dell'Asia meridionale e dei Caraibi — una tecnica semplice con un risultato sorprendentemente aromatico. Il riso viene parzialmente cotto in acqua, poi terminato nel latte di cocco, assorbendone il grasso e la dolcezza per produrre un chicco cremoso. Il rapporto tra latte di cocco e acqua varia a seconda della regione.\\n\\nIn Malesia e Singapore è la base del nasi lemak; in Sri Lanka accompagna i curry; in Indonesia appare nei banchetti cerimoniali. Le foglie di pandan aggiungono una sottile nota floreale nelle versioni asiatiche.",
      ko: "코코넛 밥은 동남아시아, 남아시아, 카리브해 요리의 주식입니다. 간단한 기법으로 놀랍도록 향긋한 결과를 냅니다. 쌀을 먼저 물에 반쯤 익힌 후 코코넛 밀크로 마무리 조리하면 지방과 단맛을 흡수해 크리미한 식감이 납니다. 코코넛 밀크와 물의 비율은 지역마다 다릅니다.\\n\\n말레이시아와 싱가포르에서는 나시 르막의 기본이며, 스리랑카에서는 카레와 삼볼 곁들이, 인도네시아에서는 의식 연회에 등장합니다. 아시아 버전에서는 판단잎이 은은한 꽃 향기를 더합니다.",
      hi: "नारियल चावल दक्षिण-पूर्व एशिया, दक्षिण एशिया और कैरिबियाई रसोई का मुख्य आहार है — एक सरल तकनीक जो आश्चर्यजनक रूप से सुगंधित परिणाम देती है। चावल को पहले पानी में आधा पकाया जाता है, फिर नारियल के दूध में पूरा किया जाता है, जिससे वह वसा और मिठास सोखकर मलाईदार दाने बन जाते हैं।\\n\\nमलेशिया और सिंगापुर में यह नासी लेमक का आधार है; श्रीलंका में यह करी और सांबोल के साथ परोसा जाता है; इंडोनेशिया में यह समारोहिक भोज में दिखता है। एशियाई संस्करणों में पांडान पत्तियाँ हल्की पुष्प सुगंध जोड़ती हैं।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 130 done")
