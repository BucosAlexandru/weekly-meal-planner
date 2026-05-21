with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ID 129 - Beshbarmak - category already has hi
# Add hi to origin
content = content.replace(
    '      ko: "키르기스스탄"\n    },\n    name: {\n      ro: "Beshbarmak"',
    '      ko: "키르기스스탄",\n      hi: "किर्गिज़स्तान"\n    },\n    name: {\n      ro: "Beshbarmak"'
)

# Add hi to name
content = content.replace(
    '      ko: "베시바르막"\n    },\n    category: {',
    '      ko: "베시바르막",\n      hi: "बेशबर्माक"\n    },\n    category: {'
)

# Add hi to ingredients
content = content.replace(
    '      ko: ["양고기", "면", "양파", "소금", "후추", "육수"]\n    },\n    howIsMade: {',
    '      ko: ["양고기", "면", "양파", "소금", "후추", "육수"],\n      hi: ["मेमने का मांस", "नूडल्स", "प्याज़", "नमक", "काली मिर्च", "शोरबा"]\n    },\n    howIsMade: {'
)

# Add hi to howIsMade
content = content.replace(
    '      ko: "고기(양고기 또는 소고기)를 부드러워질 때까지 삶고, 수제 넓은 면 위에 얹어 볶은 양파와 함께 제공합니다."\n    },\n    originText: {\n      ro: "Beshbarmak este',
    '      ko: "고기(양고기 또는 소고기)를 부드러워질 때까지 삶고, 수제 넓은 면 위에 얹어 볶은 양파와 함께 제공합니다.",\n      hi: "मांस (आमतौर पर मेमना या गोमांस) को नरम होने तक उबालें, घर के बने चौड़े नूडल्स और भुने प्याज़ के साथ परोसें।"\n    },\n    originText: {\n      ro: "Beshbarmak este'
)

# Replace originText
old_origin = '''    originText: {
      ro: "Beshbarmak este o rețetă tradițională din Kârgâzstan.",
      en: "Beshbarmak is a traditional recipe from Kyrgyzstan.",
      es: "Beshbarmak es una receta tradicional de Kirguistán.",
      fr: "Beshbarmak est une recette traditionnelle du Kirghizistan.",
      de: "Beshbarmak ist ein traditionelles Rezept aus Kirgisistan.",
      pt: "Beshbarmak é uma receita tradicional do Quirguistão.",
      ru: "Бешбармак — традиционный рецепт из Киргизии.",
      ar: "بيشبمارك هي وصفة تقليدية من قيرغيزستان.",
      zh: "吉尔吉斯拌面 是来自吉尔吉斯斯坦的传统食谱。",
      ja: "ベシュバルマク はキルギスの伝統的なレシピです。",
      tr: "Beshbarmak Kırgızistan kökenli geleneksel bir tariftir.",
      it: "Beshbarmak è una ricetta tradizionale del Kirghizistan.",
      ko: "베시바르막은 키르기스스탄의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Beshbarmak — al cărui nume înseamnă cinci degete, reflectând modul tradițional de a-l mânca direct cu mâna — este felul de mâncare emblematic al Kârgâzstanului, Kazahstanului și altor culturi nomade din Asia Centrală. Un miel întreg sau un cal este fiert ore întregi în apă cu sare, iar bulionul concentrat se toarnă deasupra pătratelor late de aluat fierte în același bulion.\\n\\nFelul de mâncare este mai mult decât aliment: pregătirea sa marcheaza nunțile, funeraliile și adunările de familie. Carnea se servește cu o ceapă scăldată în bulion cald, decorând platoul imens. Musafirul de onoare primește capul mielului.",
      en: "Beshbarmak — whose name means five fingers, reflecting the traditional way of eating it by hand — is the emblematic dish of Kyrgyzstan, Kazakhstan, and the wider Central Asian nomadic cultures. A whole lamb or horse is boiled for hours in salted water, and the concentrated broth is poured over wide, flat squares of dough cooked in the same broth.\\n\\nThe dish is more than food: its preparation marks weddings, funerals, and family gatherings. The meat is served with onion bathed in warm broth, arranged on an enormous shared platter. The guest of honour receives the lamb's head.",
      es: "Beshbarmak — cuyo nombre significa cinco dedos, reflejando la forma tradicional de comerlo con la mano — es el plato emblemático de Kirguistán, Kazajistán y las culturas nómadas de Asia Central. Un cordero o caballo entero se hierve durante horas en agua salada, y el caldo concentrado se vierte sobre amplias láminas de pasta cocinadas en ese mismo caldo.\\n\\nEl plato es más que comida: su preparación marca bodas, funerales y reuniones familiares. La carne se sirve con cebolla bañada en caldo caliente, dispuesta en un enorme plato compartido.",
      fr: "Beshbarmak — dont le nom signifie cinq doigts, reflétant la façon traditionnelle de le manger à la main — est le plat emblématique du Kirghizistan, du Kazakhstan et des cultures nomades d'Asie centrale. Un agneau ou un cheval entier est bouilli pendant des heures dans de l'eau salée, et le bouillon concentré est versé sur de larges carrés de pâte cuits dans ce même bouillon.\\n\\nLe plat est plus qu'un aliment : sa préparation marque les mariages, funérailles et rassemblements familiaux. La viande est servie avec des oignons baignés dans le bouillon chaud, disposée sur un immense plateau partagé.",
      de: "Beshbarmak — dessen Name fünf Finger bedeutet, in Anspielung auf das traditionelle Essen mit der Hand — ist das Emblemgericht Kirgisistans, Kasachstans und der zentralasiatischen Nomadenkultur. Ein ganzes Lamm oder Pferd wird stundenlang in Salzwasser gekocht, und die konzentrierte Brühe wird über breite, flache Teigstücke gegossen, die im selben Sud gegart wurden.\\n\\nDas Gericht ist mehr als Nahrung: seine Zubereitung markiert Hochzeiten, Beerdigungen und Familientreffen. Das Fleisch wird mit in heißer Brühe gebadeten Zwiebeln auf einer riesigen Gemeinschaftsplatte serviert.",
      pt: "Beshbarmak — cujo nome significa cinco dedos, refletindo a forma tradicional de comê-lo com a mão — é o prato emblemático do Quirguistão, do Cazaquistão e das culturas nômades da Ásia Central. Um carneiro ou cavalo inteiro é fervido por horas em água salgada, e o caldo concentrado é vertido sobre quadrados largos e planos de massa cozidos no mesmo caldo.\\n\\nO prato é mais do que alimento: sua preparação marca casamentos, funerais e reuniões familiares. A carne é servida com cebola banhada em caldo quente, disposta em uma enorme travessa compartilhada.",
      ru: "Бешбармак — название означает пять пальцев, отсылая к традиционному способу есть руками — главное блюдо Кыргызстана, Казахстана и кочевых культур Центральной Азии. Целого барана или лошадь варят несколько часов в подсоленной воде; концентрированным бульоном поливают широкие плоские кусочки теста, сваренного в том же бульоне.\\n\\nБлюдо — больше чем еда: его приготовление знаменует свадьбы, похороны и семейные собрания. Мясо подаётся с луком, томлёным в горячем бульоне, на огромном общем блюде. Почётный гость получает голову барана.",
      ar: "بيشبارماك — الذي يعني اسمه خمسة أصابع، في إشارة إلى طريقة الأكل التقليدية باليد — هو طبق قيرغيزستان وكازاخستان والثقافات الرحالية في آسيا الوسطى. يُسلق خروف كامل أو حصان لساعات في ماء مملح، ثم يُسكب المرق المركّز على مربعات عريضة من العجين المطبوخ في المرق ذاته.\\n\\nهذا الطبق أكثر من مجرد طعام: إعداده يُمثّل المناسبات من أعراس ومآتم وتجمعات عائلية. تُقدَّم اللحوم مع البصل المنقوع بالمرق الساخن في صحن مشترك ضخم.",
      zh: "别什巴尔马克——名字意为「五根手指」，指的是用手直接抓食的传统方式——是吉尔吉斯斯坦、哈萨克斯坦及中亚游牧文化的代表菜肴。整只羊或马在盐水中炖煮数小时，浓缩的肉汤浇在同一锅汤中煮熟的宽方形面片上。\\n\\n这道菜不只是食物：其制作标志着婚礼、葬礼和家庭聚会。肉与浸泡在热汤中的洋葱一起摆放在巨大的共享大盘上。贵宾将获得羊头以示尊重。",
      ja: "ベシュバルマク——名前は「五本の指」を意味し、手で食べる伝統的な方法を示しています——はキルギスタン、カザフスタン、そして中央アジアの遊牧文化を象徴する料理です。丸ごとの子羊か馬を塩水で数時間煮込み、濃厚なスープを同じスープで茹でた幅広の平麺の上に注ぎます。\\n\\nこの料理は単なる食事以上のもの：その調理は婚礼、葬儀、家族の集いの証です。肉は温かいスープに浸した玉ねぎとともに大きな共同の皿に盛られます。",
      tr: "Beshbarmak — adı beş parmak anlamına gelir ve geleneksel olarak elle yeme geleneğini yansıtır — Kırgızistan, Kazakistan ve Orta Asya'nın göçebe kültürlerinin simge yemeğidir. Bir kuzu ya da at bütün hâlde tuzlu suda saatlerce kaynatılır; yoğunlaşmış et suyu, aynı et suyunda pişirilmiş geniş ve yassı hamur karelerine dökülür.\\n\\nYemek yalnızca bir yiyecek değildir: hazırlanması düğünleri, cenazeleri ve aile buluşmalarını imler. Et, sıcak et suyunda ıslatılmış soğanla birlikte devasa bir ortak tabağa yerleştirilir.",
      it: "Beshbarmak — il cui nome significa cinque dita, riflettendo il modo tradizionale di mangiarlo con le mani — è il piatto emblematico del Kirghizistan, del Kazakistan e delle culture nomadi dell'Asia centrale. Un intero agnello o cavallo viene bollito per ore in acqua salata, e il brodo concentrato viene versato su larghi quadrati piatti di pasta cotti nello stesso brodo.\\n\\nIl piatto è più di un alimento: la sua preparazione segna matrimoni, funerali e riunioni di famiglia. La carne viene servita con cipolla immersa nel brodo caldo, su un enorme piatto condiviso.",
      ko: "베시바르막——이름은 다섯 손가락을 의미하며 손으로 직접 먹는 전통 방식을 반영합니다——은 키르기스스탄, 카자흐스탄 및 중앙아시아 유목 문화를 대표하는 요리입니다. 양 한 마리 또는 말을 소금물에 몇 시간 동안 끓이고, 같은 육수에서 익힌 넓고 평평한 면 위에 진한 육수를 붓습니다.\\n\\n이 요리는 단순한 음식 이상입니다. 결혼식, 장례식, 가족 모임의 상징입니다. 고기는 따뜻한 육수에 담근 양파와 함께 거대한 공동 접시에 담겨 나옵니다.",
      hi: "बेशबर्माक — जिसका नाम पाँच उंगलियाँ अर्थ रखता है, पारंपरिक रूप से हाथ से खाने के तरीके को दर्शाता है — किर्गिज़स्तान, कज़ाखस्तान और मध्य एशिया की खानाबदोश संस्कृतियों का प्रतीक व्यंजन है। एक पूरे मेमने या घोड़े को नमकीन पानी में घंटों उबाला जाता है, और गाढ़े शोरबे को उसी शोरबे में पकाए गए चौड़े, चपटे आटे के टुकड़ों पर डाला जाता है।\\n\\nयह व्यंजन सिर्फ भोजन से कहीं अधिक है: इसकी तैयारी विवाह, अंतिम संस्कार और पारिवारिक समारोहों को चिह्नित करती है। मांस को गर्म शोरबे में डुबोए प्याज़ के साथ एक विशाल साझा थाली में परोसा जाता है।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 129 done")
