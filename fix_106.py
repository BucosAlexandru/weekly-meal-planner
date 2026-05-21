data = open('public/js/recipes.js', 'r', encoding='utf-8').read()

# Add hi to origin
data = data.replace(
    '      ko: "필리핀"\n    },\n    name: {\n      ro: "Kare-Kare"',
    '      ko: "필리핀",\n      hi: "फिलीपींस"\n    },\n    name: {\n      ro: "Kare-Kare"',
    1
)

# Add hi to name
data = data.replace(
    '      ko: "카레카레"\n    },\n    category: {',
    '      ko: "카레카레",\n      hi: "कारे-कारे"\n    },\n    category: {',
    1
)

# Add hi to category (Dinner — after Philippines block)
data = data.replace(
    '      ko: "저녁"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["coadă de vită"',
    '      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["coadă de vită"',
    1
)

# Add hi to ingredients
data = data.replace(
    '      ko: ["소꼬리", "땅콩 버터", "새우 페이스트", "가지", "강낭콩", "청경채", "마늘"]\n    },\n    howIsMade: {',
    '      ko: ["소꼬리", "땅콩 버터", "새우 페이스트", "가지", "강낭콩", "청경채", "마늘"],\n      hi: ["बैल की पूंछ", "मूंगफली का मक्खन", "झींगा पेस्ट", "बैंगन", "फलियां", "बोक चॉय", "लहसुन"]\n    },\n    howIsMade: {',
    1
)

# Add hi to howIsMade
data = data.replace(
    '      ko: "고기(보통 소꼬리 또는 돼지 족발)를 채소와 함께 삶은 후, 걸쭉한 땅콩 소스에 조리하고 새우 페이스트와 함께 제공합니다."\n    },\n    originText: {',
    '      ko: "고기(보통 소꼬리 또는 돼지 족발)를 채소와 함께 삶은 후, 걸쭉한 땅콩 소스에 조리하고 새우 페이스트와 함께 제공합니다.",\n      hi: "मांस (आमतौर पर बैल की पूंछ या सूअर का पैर) को सब्जियों के साथ उबालें, फिर गाढ़ी मूंगफली की चटनी में पकाएं और झींगा पेस्ट के साथ परोसें।"\n    },\n    originText: {',
    1
)

# Replace originText
old_ot = '''    originText: {
      ro: "Kare-Kare este o rețetă tradițională din Filipine.",
      en: "Kare-Kare is a traditional recipe from the Philippines.",
      es: "Kare-Kare es una receta tradicional de Filipinas.",
      fr: "Kare-Kare est une recette traditionnelle des Philippines.",
      de: "Kare-Kare ist ein traditionelles Rezept aus den Philippinen.",
      pt: "Kare-Kare é uma receita tradicional das Filipinas.",
      ru: "Каре-Каре — традиционный рецепт из Филиппин.",
      ar: "كاري كاري هي وصفة تقليدية من الفلبين.",
      zh: "菲式花生炖牛肉 是来自菲律宾的传统食谱。",
      ja: "カレカレ はフィリピンの伝統的なレシピです。",
      tr: "Kare-Kare Filipinler kökenli geleneksel bir tariftir.",
      it: "Kare-Kare è una ricetta tradizionale delle Filippine.",
      ko: "카레카레는 필리핀의 전통 요리입니다."
    }'''

new_ot = '''    originText: {
      ro: "Kare-Kare este o tocăniță filipineză brasată construită în jurul unui sos gros de arahide colorat în auriu profund de semințe de annatto, cu coadă de vită sau ciolane ca proteine principale. Sosul provine din arahide prăjite și măcinate, diluat cu bulion și îngroșat cu orez prăjit măcinat — bogat și savuros, dar deliberat blând, conceput pentru a purta carnea și legumele, nu pentru a domina.\\n\\nCeea ce conferă kare-kare caracterul său complet este bagoong — pastă de creveți fermentată — servită separat și amestecată la masă. Legumele — floare de banane, vinete și fasole verde — se brasează în sosul de arahide până devin moi, absorbind grăsimea și culoarea aurie.",
      en: "Kare-kare is a Filipino braised stew built around a thick peanut sauce colored deep gold by annatto, with oxtail or beef shank as the primary protein. The sauce comes from ground toasted peanuts thinned with broth and thickened with toasted rice powder — rich and savory but deliberately mild, designed to carry the meat and vegetables rather than dominate them.\\n\\nWhat gives kare-kare its full character is bagoong — fermented shrimp paste — served on the side and stirred in at the table. Without it the stew is balanced but flat; with it, the salt and ferment animate the sauce entirely. The vegetables — banana blossom, eggplant, and long beans — braise in the peanut sauce until soft, absorbing its fat and deep gold color.",
      es: "Kare-kare es un guiso Filipino brasado construido alrededor de una espesa salsa de maní coloreada en oro profundo por annatto, con rabo de buey o jarrete de res como proteína principal. La salsa proviene de maní tostado molido diluido con caldo y espesado con arroz tostado molido — rico y sabroso pero deliberadamente suave.\\n\\nLo que da al kare-kare su carácter completo es el bagoong — pasta de camarones fermentada — servida al lado y mezclada en la mesa. Sin él el guiso está equilibrado pero plano; con él, la sal y la fermentación animan la salsa completamente. Las verduras — flor de banana, berenjena y ejotes — se brasan en la salsa de maní hasta que estén suaves.",
      fr: "Le kare-kare est un ragoût braisé philippin construit autour d\'une épaisse sauce aux cacahuètes colorée en or profond par l\'annatto, avec de la queue de bœuf ou du jarret comme protéine principale. La sauce vient de cacahuètes grillées et moulues, diluées avec du bouillon et épaissies avec du riz grillé moulu — riche et savoureuse mais délibérément douce.\\n\\nCe qui confère au kare-kare son caractère complet est le bagoong — pâte de crevettes fermentée — servie à côté et mélangée à table. Sans lui le ragoût est équilibré mais plat ; avec lui, le sel et la fermentation animent la sauce entièrement. Les légumes — fleur de bananier, aubergine et haricots verts — braisent dans la sauce aux cacahuètes jusqu\'à être tendres.",
      de: "Kare-Kare ist ein philippinisches Schmorragout, das um eine dicke Erdnusssauce aufgebaut ist, die durch Annatto tiefgold gefärbt wird, mit Ochsenschwanz oder Rinderhaxe als Hauptprotein. Die Sauce stammt aus geriebenen gerösteten Erdnüssen, die mit Brühe verdünnt und mit geröstetem gemahlenem Reis eingedickt werden — reich und herzhaft, aber bewusst mild.\\n\\nWas Kare-Kare seinen vollen Charakter verleiht, ist Bagoong — fermentierte Garnelenpaste — die seitlich serviert und am Tisch eingerührt wird. Ohne sie ist das Ragout ausgewogen aber flach; mit ihr beleben Salz und Ferment die Sauce vollständig. Das Gemüse — Bananenblüte, Aubergine und grüne Bohnen — schmort in der Erdnusssauce bis es weich ist.",
      pt: "Kare-kare é um guisado filipino brasado construído em torno de um molho espesso de amendoim colorido em dourado profundo pelo annatto, com rabo de boi ou jarrete como proteína principal. O molho vem de amendoins torrados e moídos, diluído com caldo e engrossado com arroz torrado moído — rico e saboroso mas deliberadamente suave.\\n\\nO que dá ao kare-kare seu caráter completo é o bagoong — pasta de camarão fermentada — servida ao lado e mexida à mesa. Sem ela o guisado está equilibrado mas plano; com ela, o sal e a fermentação animam o molho completamente. Os legumes — flor de bananeira, berinjela e feijão verde — brasam no molho de amendoim até ficarem macios.",
      ru: "Каре-каре — тушёное рагу филиппинской кухни, основу которого составляет густой арахисовый соус золотисто-жёлтого цвета, окрашенного аннато, с бычьим хвостом или голяшкой в качестве основного белка. Соус готовится из молотых обжаренных арахисов, разведённых бульоном и загущенных обжаренным молотым рисом — насыщенный, но намеренно мягкий.\\n\\nТо, что придаёт каре-каре полный характер, — это багоонг: ферментированная паста из креветок, подаваемая отдельно и вмешиваемая прямо за столом. Без неё рагу сбалансированное, но невыразительное; с ней соль и ферментация оживляют соус полностью. Овощи — цветок банана, баклажан и стручковая фасоль — тушатся в арахисовом соусе до мягкости.",
      ar: "كاري كاري هو يخنة فلبينية مطهوة ببطء تقوم على صلصة فول سوداني كثيفة ذات لون ذهبي عميق من الأناتو، مع ذيل البقر أو ساق اللحم البقري بروتيناً رئيسياً. تأتي الصلصة من الفول السوداني المحمّص المطحون المخفَّف بالمرق والمكثَّف بالأرز المحمّص المطحون — غنية ومالحة لكنها متعمدة في اعتدالها.\\n\\nما يمنح كاري كاري طابعه الكامل هو الباغونغ — معجون الروبيان المخمَّر — يُقدَّم على الجانب ويُمزَج على المائدة. بدونه تكون اليخنة متوازنة لكن مسطحة؛ معه تُحيي الملوحة والتخمير الصلصة كلياً. الخضروات — زهرة الموز والباذنجان والفاصوليا الخضراء — تُطهى في صلصة الفول السوداني حتى تلين.",
      zh: "卡雷卡雷是菲律宾一道焖炖菜，以浓稠的花生酱为基础，由胭脂树红染成深金色，主要蛋白质是牛尾或牛腱。酱汁来自研磨的烤花生兑入高汤，再用烤磨米粉增稠——浓郁鲜美但刻意清淡，目的是承载肉和蔬菜而不是喧宾夺主。\\n\\n赋予卡雷卡雷完整个性的是虾酱（bagoong）——发酵虾酱——单独上桌，在桌上拌入。没有它，炖菜平衡但平淡；有了它，咸味和发酵感完全激活酱汁。蔬菜——芭蕉花、茄子和豆角——在花生酱中焖软，吸收油脂和深金色泽。",
      ja: "カレカレはフィリピンのブレイズ煮込みで、アナットで深い金色に染まった濃いピーナッツソースを中心に構成され、牛テールまたは牛スネが主なタンパク質だ。ソースは煎った落花生を挽いて出汁で薄め、煎り米粉で濃くしたもの——濃厚で風味豊かだが意図的に穏やかで、肉と野菜を支えるためのものだ。\\n\\nカレカレに完全な個性を与えるのはバゴオン——発酵エビペースト——で、別に出されてテーブルで各人が混ぜる。なければシチューはバランスが取れているが平板；あれば塩と発酵がソースを完全に生き生きとさせる。野菜——バナナの花・ナス・インゲン——はピーナッツソースで柔らかくなるまで煮込まれ、油脂と深い金色を吸い込む。",
      tr: "Kare-kare, annatto ile derin bir altın rengi veren kalın bir yer fıstığı sosu etrafında inşa edilmiş bir Filipin yahnisidir; ana protein öküz kuyruğu veya dana inciktir. Sos, et suyuyla inceltilmiş ve kavrulmuş öğütülmüş piringle koyulaştırılmış öğütülmüş kavrulmuş fıstıktan gelir — zengin ve lezzetli ama kasıtlı olarak hafif.\\n\\nKare-kare\'ye tam karakterini veren bagoong\'dur — fermente karides ezmesi — yana servis edilir ve masada karıştırılır. Onsuz yahni dengeli ama yalındır; onunla tuz ve fermentasyon sosu tamamen canlandırır. Sebzeler — muz çiçeği, patlıcan ve fasulye — yer fıstığı sosunda yumuşayana kadar bräze edilir.",
      it: "Il kare-kare è uno stufato brasato filippino costruito attorno a una densa salsa di arachidi colorata in oro intenso dall\'annatto, con coda di bue o stinco come proteina principale. La salsa proviene da arachidi tostate e macinate, diluite con il brodo e addensate con riso tostato macinato — ricca e saporita ma deliberatamente delicata.\\n\\nCiò che conferisce al kare-kare il suo pieno carattere è il bagoong — pasta di gamberi fermentata — servita a parte e mescolata a tavola. Senza di esso lo stufato è equilibrato ma piatto; con esso, sale e fermentazione animano la salsa completamente. Le verdure — fiore di banana, melanzana e fagiolini — brasano nella salsa di arachidi fino a diventare morbide.",
      ko: "카레카레는 아나토로 깊은 금색을 띠는 진한 땅콩 소스를 중심으로 만든 필리핀 브레이즈 스튜로, 소꼬리나 소 정강이가 주요 단백질입니다. 소스는 볶은 땅콩을 갈아 육수로 희석하고 볶은 쌀가루로 걸쭉하게 만든 것으로 — 풍부하고 고소하지만 의도적으로 순한 맛입니다.\\n\\n카레카레에 완전한 개성을 부여하는 것은 바고옹 — 발효 새우 페이스트 — 으로 따로 제공되어 식탁에서 넣습니다. 없으면 스튜는 균형 잡혀 있지만 밋밋합니다; 있으면 소금과 발효가 소스 전체를 살아나게 합니다. 채소 — 바나나 꽃, 가지, 풋콩 — 는 땅콩 소스에서 부드러워질 때까지 브레이즈되어 기름기와 깊은 금색을 흡수합니다.",
      hi: "कारे-कारे एक फिलिपिनो ब्रेज़्ड स्टू है जो एनाटो द्वारा गहरे सोने के रंग की गाढ़ी मूंगफली की चटनी के इर्द-गिर्द बना है, जिसमें बैल की पूंछ या बीफ शैंक मुख्य प्रोटीन के रूप में है। चटनी भुनी हुई पिसी मूंगफली से आती है जिसे शोरबे से पतला किया जाता है और भुने चावल के आटे से गाढ़ा किया जाता है — समृद्ध और स्वादिष्ट लेकिन जानबूझकर हल्की।\\n\\nकारे-कारे को पूरा चरित्र देता है बागूंग — किण्वित झींगा पेस्ट — जो बगल में परोसा जाता है और मेज पर मिलाया जाता है। इसके बिना स्टू संतुलित पर सपाट है; इसके साथ, नमक और किण्वन पूरी चटनी को जीवंत कर देते हैं। सब्जियां — केले के फूल, बैंगन और फलियां — मूंगफली की चटनी में नरम होने तक ब्रेज़ होती हैं।"
    }'''

if old_ot in data:
    data = data.replace(old_ot, new_ot, 1)
    open('public/js/recipes.js', 'w', encoding='utf-8').write(data)
    print('Done 106')
else:
    print('NOT FOUND 106')
