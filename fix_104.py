data = open('public/js/recipes.js', 'r', encoding='utf-8').read()

# Add hi to origin
data = data.replace(
    '      ko: "도미니카 공화국"\n    },\n    name: {\n      ro: "La Bandera"',
    '      ko: "도미니카 공화국",\n      hi: "डोमिनिकन गणराज्य"\n    },\n    name: {\n      ro: "La Bandera"',
    1
)

# Add hi to name
data = data.replace(
    '      ko: "라 반데라"\n    },\n    category: {',
    '      ko: "라 반데라",\n      hi: "ला बान्देरा"\n    },\n    category: {',
    1
)

# Add hi to category (Lunch)
data = data.replace(
    '      ko: "점심"\n    },\n    servings: 4,\n    tipType: \'def\',\n    pairingsType: \'def\',\n    ingredients: {\n      ro: ["orez", "fasole"',
    '      ko: "점심",\n      hi: "दोपहर का खाना"\n    },\n    servings: 4,\n    tipType: \'def\',\n    pairingsType: \'def\',\n    ingredients: {\n      ro: ["orez", "fasole"',
    1
)

# Add hi to ingredients
data = data.replace(
    '      ko: ["쌀", "콩", "소고기", "플랜틴", "샐러드", "기름", "향신료"]\n    },\n    howIsMade: {',
    '      ko: ["쌀", "콩", "소고기", "플랜틴", "샐러드", "기름", "향신료"],\n      hi: ["चावल", "राजमा", "गोमांस", "केला", "सलाद", "तेल", "मसाले"]\n    },\n    howIsMade: {',
    1
)

# Add hi to howIsMade
data = data.replace(
    '      ko: "쌀, 붉은 콩, 고기(소고기 또는 닭고기)를 각각 따로 조리한 후 샐러드와 튀긴 플랜틴과 함께 담아냅니다."\n    },\n    originText: {',
    '      ko: "쌀, 붉은 콩, 고기(소고기 또는 닭고기)를 각각 따로 조리한 후 샐러드와 튀긴 플랜틴과 함께 담아냅니다.",\n      hi: "चावल, लाल राजमा और मांस (आमतौर पर गोमांस या चिकन) अलग-अलग पकाएं, फिर सलाद और तले हुए केले के साथ परोसें।"\n    },\n    originText: {',
    1
)

# Replace entire originText
old_ot = '''    originText: {
      ro: "La Bandera este o rețetă tradițională din Republica Dominicană.",
      en: "La Bandera is a traditional recipe from the Dominican Republic.",
      es: "La Bandera es una receta tradicional de República Dominicana.",
      fr: "La Bandera est une recette traditionnelle de la République dominicaine.",
      de: "La Bandera ist ein traditionelles Rezept aus der Dominikanischen Republik.",
      pt: "La Bandera é uma receita tradicional da República Dominicana.",
      ru: "Ла Бандера — традиционный рецепт из Доминиканской Республики.",
      ar: "لا باندييرا هي وصفة تقليدية من جمهورية الدومينيكان.",
      zh: "多米尼加国旗餐 是来自多米尼加的传统食谱。",
      ja: "ラ・バンデラ はドミニカ共和国の伝統的なレシピです。",
      tr: "La Bandera Dominik Cumhuriyeti kökenli geleneksel bir tariftir.",
      it: "La Bandera è una ricetta tradizionale della Repubblica Dominicana.",
      ko: "라 반데라는 도미니카 공화국의 전통 요리입니다."
    }'''

new_ot = '''    originText: {
      ro: "La Bandera — Steagul — este farfuria națională a Republicii Dominicane, mâncată la prânz în case și restaurante mici din toată țara. Numele este un semn de mândrie: orez alb, fasole roșie gătită în sos și carne brasată sunt aranjate împreună în culori asociate steagului. Fasolea, numită habichuelas guisadas, se gătește în sofrito și roșii cu o fierbere lungă ce îi conferă un corp savuros adânc.\\n\\nFiecare component este gătit separat și servit pe aceeași farfurie: orezul ca bază neutră, fasolea turnată generos alături, carnea — de obicei pui sau vită — brasată până devine fragedă. Banane plantain prăjite și o salată simplă de varză sau avocado completează farfuria.",
      en: "La Bandera — The Flag — is the Dominican Republic\'s national plate, eaten at midday in homes and small restaurants across the country. The name is a point of pride: white rice, red-stewed kidney beans, and braised meat are plated together in colors associated with the flag. The beans, known as habichuelas guisadas, are cooked in sofrito and tomato with a long braise that gives them a deep, savory body.\\n\\nEach component is cooked separately and served on the same plate: the rice as a neutral base, the beans poured generously alongside, the meat — usually chicken or beef — braised until tender. Fried plantains and a simple salad of cabbage or avocado complete the plate.",
      es: "La Bandera es el plato nacional de República Dominicana, consumido al mediodía en hogares y pequeños restaurantes de todo el país. El nombre es un orgullo: arroz blanco, habichuelas rojas guisadas y carne brasada se sirven juntos en colores asociados a la bandera. Las habichuelas se cocinan en sofrito y tomate con un guiso largo que les da un cuerpo profundo y sabroso.\\n\\nCada componente se prepara por separado y se sirve en el mismo plato: el arroz como base neutra, las habichuelas servidas generosamente, la carne — generalmente pollo o res — brasada hasta quedar tierna. Plátano frito y una ensalada sencilla de repollo o aguacate completan el plato.",
      fr: "La Bandera — Le Drapeau — est le plat national de la République dominicaine, consommé à midi dans les foyers et les petits restaurants du pays. Le nom est une source de fierté : riz blanc, haricots rouges mijotés et viande braisée sont dressés ensemble dans des couleurs associées au drapeau. Les haricots, les habichuelas guisadas, sont cuits dans un sofrito et des tomates avec une longue braise qui leur donne un corps savoureux et profond.\\n\\nChaque composant est cuisiné séparément et servi dans la même assiette : le riz en base neutre, les haricots versés généreusement à côté, la viande — généralement poulet ou bœuf — braisée jusqu\'à tendreté. Des bananes plantain frites et une salade simple de chou ou d\'avocat complètent l\'assiette.",
      de: "La Bandera — Die Flagge — ist das Nationalgericht der Dominikanischen Republik, das mittags in Häusern und kleinen Restaurants im ganzen Land gegessen wird. Der Name ist ein Zeichen des Stolzes: weißer Reis, rotgeschmorte Kidneybohnen und geschmortes Fleisch werden zusammen in Farben serviert, die mit der Flagge assoziiert werden. Die Bohnen, bekannt als habichuelas guisadas, werden in Sofrito und Tomate mit langem Schmoren zubereitet, das ihnen einen tiefen, herzhaften Körper verleiht.\\n\\nJede Komponente wird separat gekocht und auf demselben Teller serviert: der Reis als neutrale Basis, die Bohnen großzügig daneben, das Fleisch — meist Huhn oder Rind — geschmort bis zart. Gebratene Kochbananen und ein einfacher Salat aus Kohl oder Avocado vervollständigen den Teller.",
      pt: "La Bandera — A Bandeira — é o prato nacional da República Dominicana, consumido ao meio-dia em casas e pequenos restaurantes por todo o país. O nome é motivo de orgulho: arroz branco, feijão vermelho cozido e carne brasada são servidos juntos em cores associadas à bandeira. O feijão, conhecido como habichuelas guisadas, é cozinhado em sofrito e tomate com um longo brasado que lhe confere um corpo profundo e saboroso.\\n\\nCada componente é cozinhado separadamente e servido no mesmo prato: o arroz como base neutra, o feijão servido generosamente ao lado, a carne — geralmente frango ou boi — brasada até ficar macia. Banana frita e uma salada simples de repolho ou abacate completam o prato.",
      ru: "Ла Бандера — Флаг — это национальное блюдо Доминиканской Республики, которое едят в полдень дома и в небольших ресторанах по всей стране. Название — предмет гордости: белый рис, тушёная красная фасоль и тушёное мясо подаются вместе в цветах, ассоциированных с флагом. Фасоль, habichuelas guisadas, готовится в соусе из соперито и томатов с долгим тушением, придающим ей глубокий, насыщенный вкус.\\n\\nКаждый компонент готовится отдельно и подаётся на одной тарелке: рис в качестве нейтральной основы, фасоль щедро рядом, мясо — как правило, курица или говядина — тушится до мягкости. Жареные бананы и простой салат из капусты или авокадо дополняют тарелку.",
      ar: "لا باندييرا — العلم — هو الطبق الوطني لجمهورية الدومينيكان، يُؤكل في منتصف النهار في المنازل والمطاعم الصغيرة عبر أنحاء البلاد. الاسم مصدر فخر: يُقدَّم الأرز الأبيض والفاصوليا الحمراء المطبوخة واللحم المطهو معاً بألوان مرتبطة بالعلم. تُطهى الفاصوليا المعروفة بالـhabichuelas guisadas في الـسوفريتو والطماطم بطهي بطيء طويل يمنحها قواماً عميقاً ولذيذاً.\\n\\nتُحضَّر كل مكوّن على حدة وتُقدَّم في نفس الطبق: الأرز كقاعدة محايدة، والفاصوليا تُصبّ بسخاء جانباً، واللحم — عادةً دجاج أو بقري — مطهو ببطء حتى يطرى. يكتمل الطبق بالموز المقلي وسلطة بسيطة من الملفوف أو الأفوكادو.",
      zh: "拉班德拉——旗帜——是多米尼加共和国的国菜，每天中午在全国各地的家庭和小餐馆里食用。这个名字令人自豪：白米饭、红腰豆炖菜和炖肉以与国旗相关的颜色盛在一起。这道豆子被称为habichuelas guisadas，用sofrito酱和番茄长时间炖煮，赋予其深厚鲜美的口感。\\n\\n每种配料分开烹饪，盛在同一个盘子里：米饭作为中性底座，豆子慷慨地浇在旁边，肉——通常是鸡肉或牛肉——炖至嫩滑。炸香蕉和简单的卷心菜或鳄梨沙拉完成这道菜。",
      ja: "ラ・バンデラ——旗——はドミニカ共和国の国民食で、全国の家庭や小さなレストランで昼食に食べられる。名前は誇りの象徴だ：白いご飯、赤いキドニービーンズのシチュー、ブレイズした肉が国旗の色に関連するように盛り合わされる。habichuelas guisadasと呼ばれる豆は、ソフリートとトマトで長時間煮込まれ、深みのあるコクが生まれる。\\n\\n各要素は別々に調理され、同じ皿に盛り付けられる：中立的な基盤としての白ご飯、豆を惜しみなく添え、肉——通常は鶏肉または牛肉——は柔らかくなるまでブレイズされる。揚げたプランテンと簡単なキャベツまたはアボカドのサラダが皿を完成させる。",
      tr: "La Bandera — Bayrak — Dominik Cumhuriyeti\'nin ulusal yemeğidir; ülke genelinde evlerde ve küçük restoranlarda öğle vakti yenir. İsim bir gurur kaynağıdır: bayrakla ilişkilendirilen renklerde beyaz pirinç, kırmızı fasulye güveç ve bräze et bir arada servis edilir. Habichuelas guisadas olarak bilinen fasulye, sofrito ve domatesle uzun süre bräze edilerek derin, lezzetli bir kıvam kazanır.\\n\\nHer bileşen ayrı ayrı pişirilir ve aynı tabakta servis edilir: tarafsız bir taban olarak pirinç, fasulye cömertçe yanına dökülür, et — genellikle tavuk veya dana — yumuşayana kadar bräze edilir. Kızarmış muz ve basit bir lahana ya da avokado salatası tabağı tamamlar.",
      it: "La Bandera — La Bandiera — è il piatto nazionale della Repubblica Dominicana, consumato a mezzogiorno nelle case e nei piccoli ristoranti di tutto il paese. Il nome è motivo di orgoglio: riso bianco, fagioli rossi stufati e carne brasata vengono serviti insieme nei colori associati alla bandiera. I fagioli, noti come habichuelas guisadas, sono cotti in sofrito e pomodoro con una lunga brasatura che conferisce loro un corpo profondo e saporito.\\n\\nOgni componente viene cucinato separatamente e servito nello stesso piatto: il riso come base neutra, i fagioli versati generosamente accanto, la carne — di solito pollo o manzo — brasata fino a tenerezza. Banane plantain fritte e una semplice insalata di cavolo o avocado completano il piatto.",
      ko: "라 반데라 — 깃발 — 는 도미니카 공화국의 국민 요리로, 전국의 가정과 작은 식당에서 점심으로 먹습니다. 이름은 자부심의 상징입니다: 흰 쌀밥, 빨간 강낭콩 스튜, 브레이즈한 고기가 국기와 관련된 색으로 함께 담깁니다. habichuelas guisadas라고 불리는 콩은 소프리토와 토마토로 오랫동안 조린 깊고 풍미 있는 맛이 납니다.\\n\\n각 재료는 따로 조리되어 같은 접시에 담깁니다: 중립적인 기반으로서의 쌀밥, 콩을 넉넉하게 옆에 부어 넣고, 고기 — 보통 닭고기 또는 소고기 — 를 부드러워질 때까지 브레이즈합니다. 튀긴 플랜틴과 양배추 또는 아보카도 간단한 샐러드로 요리를 완성합니다.",
      hi: "ला बान्देरा — झंडा — डोमिनिकन गणराज्य का राष्ट्रीय व्यंजन है, जो पूरे देश के घरों और छोटे रेस्तरां में दोपहर को खाया जाता है। नाम गर्व का प्रतीक है: सफेद चावल, लाल राजमा स्टू और ब्रेज़्ड मांस झंडे के रंगों से जुड़े तरीके से एक साथ परोसा जाता है। habichuelas guisadas के नाम से जाने जाने वाले राजमा को सोफ्रिटो और टमाटर में लंबे समय तक ब्रेज़ किया जाता है।\\n\\nप्रत्येक घटक अलग-अलग पकाया जाता है और एक ही थाली में परोसा जाता है: तटस्थ आधार के रूप में चावल, राजमा उदारता से बगल में, मांस — आमतौर पर चिकन या गोमांस — नरम होने तक ब्रेज़ किया जाता है। तले हुए केले और पत्तागोभी या एवोकाडो का सादा सलाद थाली को पूरा करता है।"
    }'''

if old_ot in data:
    data = data.replace(old_ot, new_ot, 1)
    open('public/js/recipes.js', 'w', encoding='utf-8').write(data)
    print('Done 104')
else:
    print('NOT FOUND 104')
