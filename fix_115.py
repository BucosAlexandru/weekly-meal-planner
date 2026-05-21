with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add hi to origin
content = content.replace(
    '      ko: "우즈베키스탄"\n    },\n    name: {\n      ro: "Manti"',
    '      ko: "우즈베키스탄",\n      hi: "उज़्बेकिस्तान"\n    },\n    name: {\n      ro: "Manti"'
)

# Add hi to name
content = content.replace(
    '      ko: "만티"\n    },\n    category: {\n      ro: "Cină"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["făină", "apă", "sare", "carne de vită"',
    '      ko: "만티",\n      hi: "मंटी"\n    },\n    category: {\n      ro: "Cină"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["făină", "apă", "sare", "carne de vită"'
)

# Add hi to category — need to find the right instance. Manti has Cină/Dinner/etc.
# The category block for Manti ends with ko: "저녁" and is followed by servings: 4
content = content.replace(
    '      ko: "저녁"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["făină", "apă", "sare", "carne de vită"',
    '      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["făină", "apă", "sare", "carne de vită"'
)

# Add hi to ingredients
content = content.replace(
    '      ko: ["밀가루", "물", "소금", "소고기", "양파", "버터", "향신료"]\n    },\n    howIsMade: {',
    '      ko: ["밀가루", "물", "소금", "소고기", "양파", "버터", "향신료"],\n      hi: ["आटा", "पानी", "नमक", "गोमांस", "प्याज़", "मक्खन", "मसाले"]\n    },\n    howIsMade: {'
)

# Add hi to howIsMade
content = content.replace(
    '      ko: "밀가루, 물, 소금으로 반죽을 만든 후 다진 소고기와 양파를 섞어 속을 채웁니다. 모양을 빚어 찜기에 쪄내고 녹인 버터나 요거트와 함께 제공합니다."\n    },\n    originText: {\n      ro: "Manti este',
    '      ko: "밀가루, 물, 소금으로 반죽을 만든 후 다진 소고기와 양파를 섞어 속을 채웁니다. 모양을 빚어 찜기에 쪄내고 녹인 버터나 요거트와 함께 제공합니다.",\n      hi: "आटा, पानी और नमक से आटा गूंधें। पिसे हुए गोमांस और प्याज़ के मिश्रण से भरें, मसाला डालें, आकार दें और भाप में पकाएं। पिघले मक्खन या दही के साथ परोसें।"\n    },\n    originText: {\n      ro: "Manti este'
)

# Replace originText
old_origin = '''    originText: {
      ro: "Manti este o rețetă tradițională din Uzbekistan.",
      en: "Manti is a traditional recipe from Uzbekistan.",
      es: "Manti es una receta tradicional de Uzbekistán.",
      fr: "Manti est une recette traditionnelle de l'Ouzbékistan.",
      de: "Manti ist ein traditionelles Rezept aus Usbekistan.",
      pt: "Manti é uma receita tradicional do Uzbequistão.",
      ru: "Манты — традиционный рецепт из Узбекистана.",
      ar: "مانتي هي وصفة تقليدية من أوزبكستان.",
      zh: "乌兹别克馄饨 是来自乌兹别克斯坦的传统食谱。",
      ja: "マンティ はウズベキスタンの伝統的なレシピです。",
      tr: "Manti Özbekistan kökenli geleneksel bir tariftir.",
      it: "Manti è una ricetta tradizionale dell'Uzbekistan.",
      ko: "만티는 우즈베키스탄의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Manti sunt găluște mari la aburi răspândite în Asia Centrală, Caucaz și Turcia prin drumurile comerciale ale Mătăsii și migrațiile nomade. În Uzbekistan, umplutura este tradițional tocată grosier cu cuțitul — miel sau vită cu ceapă crudă din abundență, care se topește în interior la gătire, menținând carnea fragedă și parfumată. Aluatul se întinde subțire și fiecare pachet se pliază manual.\\n\\nSpre deosebire de găluștele chinezești, manti se gătesc într-un vas special cu mai multe niveluri, un mantovarka, și se servesc generos. Untul topit turnat deasupra este finisajul clasic; smântâna sau iaurtul adaugă o notă răcoritoare.",
      en: "Manti are large steamed dumplings that spread across Central Asia, the Caucasus, and Turkey through Silk Road trade and nomadic migration. In Uzbekistan, the filling is traditionally hand-chopped — lamb or beef with plenty of raw onion that melts as it steams, keeping the meat moist and fragrant. Dough is rolled thin and each parcel sealed by hand.\\n\\nUnlike Chinese dumplings, manti cook in a dedicated multi-tiered steamer called a mantovarka and are served generously, often four to six per person. Melted butter poured over the top is the classic finish; soured cream or tangy yogurt makes a cooling counterpoint.",
      es: "Los manti son grandes dumplings al vapor que se extendieron por Asia Central, el Cáucaso y Turquía a través de la Ruta de la Seda y las migraciones nómadas. En Uzbekistán, el relleno es tradicionalmente picado a mano — cordero o ternera con abundante cebolla cruda que se funde al cocinarse, manteniendo la carne jugosa y aromática. La masa se estira fina y cada paquete se sella a mano.\\n\\nA diferencia de los dumplings chinos, los manti se cuecen en un vaporizador de varios niveles llamado mantovarka y se sirven generosamente. La mantequilla derretida por encima es el acabado clásico.",
      fr: "Les manti sont de grands raviolis cuits à la vapeur répandus en Asie centrale, au Caucase et en Turquie via la Route de la Soie et les migrations nomades. En Ouzbékistan, la farce est traditionnellement hachée à la main — agneau ou bœuf avec beaucoup d'oignon cru qui fond à la cuisson, gardant la viande moelleuse et parfumée. La pâte est finement étalée et chaque parcel est fermé à la main.\\n\\nContrairement aux raviolis chinois, les manti cuisent dans un cuit-vapeur spécial à plusieurs étages appelé mantovarka et sont servis généreusement avec du beurre fondu ou du yaourt.",
      de: "Manti sind große gedämpfte Teigtaschen, die sich entlang der Seidenstraße und durch nomadische Migration durch Zentralasien, den Kaukasus und die Türkei verbreiteten. In Usbekistan wird die Füllung traditionell grob mit dem Messer gehackt — Lamm oder Rind mit viel roher Zwiebel, die beim Dämpfen schmilzt und das Fleisch saftig hält. Der Teig wird dünn ausgerollt und jede Tasche von Hand verschlossen.\\n\\nIm Gegensatz zu chinesischen Knödeln garen Manti in einem speziellen mehrstufigen Dampfgarer namens Mantovarka und werden großzügig serviert. Geschmolzene Butter darüber ist der klassische Abschluss.",
      pt: "Manti são grandes bolinhos cozidos no vapor espalhados pela Ásia Central, Cáucaso e Turquia através da Rota da Seda e migrações nômades. No Uzbequistão, o recheio é tradicionalmente picado à mão — cordeiro ou boi com bastante cebola crua que derrete ao cozinhar, mantendo a carne úmida e perfumada. A massa é esticada fina e cada embrulho fechado à mão.\\n\\nAo contrário dos bolinhos chineses, os manti cozinham em vaporizador de múltiplos andares chamado mantovarka e são servidos generosamente. Manteiga derretida por cima é o acabamento clássico.",
      ru: "Манты — большие паровые пельмени, распространившиеся по Центральной Азии, Кавказу и Турции через Шёлковый путь и кочевые миграции. В Узбекистане начинку традиционно рубят ножом крупно — баранина или говядина с большим количеством сырого лука, который тает при приготовлении, сохраняя мясо сочным. Тесто раскатывают тонко, каждый манты скрепляют вручную.\\n\\nВ отличие от китайских пельменей, манты готовятся в специальной многоярусной мантышнице и подаются щедрыми порциями. Растопленное масло — классический завершающий штрих; сметана или кислый йогурт освежает блюдо.",
      ar: "المانتي هي فطائر مطهوة على البخار، انتشرت عبر آسيا الوسطى والقوقاز وتركيا عبر طريق الحرير والهجرات البدوية. في أوزبكستان، تُقطَّع الحشوة تقليدياً بالسكين خشنةً — لحم ضأن أو بقري مع كميات وافرة من البصل الخام الذي يذوب أثناء الطهي محافظاً على طراوة اللحم. تُفرد العجينة رفيعة ويُغلق كل كيس باليد.\\n\\nعلى خلاف الزلابية الصينية، تُطهى المانتي في جهاز طبخ بخاري خاص متعدد الطوابق، وتُقدَّم بسخاء مع الزبدة المذابة أو اللبن.",
      zh: "馒头（马恩提）是巨型蒸饺，随丝绸之路贸易和游牧迁徙传播至中亚、高加索地区及土耳其。在乌兹别克斯坦，馅料传统上用刀手剁——羊肉或牛肉加大量生洋葱，蒸制时洋葱融化，使肉质多汁鲜香。面皮擀薄，每个饺子手工封口。\\n\\n与中式饺子不同，马恩提在专用多层蒸锅中烹制，通常每人享用四至六个。淋上融化黄油是经典收尾；酸奶油或酸奶则带来清爽对比。",
      ja: "マンティは、シルクロード交易や遊牧民の移動を通じて中央アジア・コーカサス・トルコに広まった大型蒸し餃子です。ウズベキスタンでは伝統的にナイフで粗く刻んだラムか牛肉に生玉ねぎをたっぷり混ぜた具を使います。蒸すと玉ねぎが溶けて肉を柔らかく保ちます。\\n\\n中国の餃子とは異なり、マンティは「マントヴァルカ」と呼ばれる多段式蒸し器で調理し、一人に4〜6個を目安に提供します。溶かしバターをかけるのが定番で、サワークリームや酸味のあるヨーグルトを添えることも多いです。",
      tr: "Manti, Orta Asya, Kafkasya ve Türkiye'ye İpek Yolu ticareti ve göçebe göçleri aracılığıyla yayılan büyük buharda pişirilmiş hamur işleridir. Özbekistan'da iç malzeme geleneksel olarak bıçakla iri iri doğranır — kuzu ya da dana eti ve bol çiğ soğan, pişerken eriyerek etin sulu ve aromatik kalmasını sağlar. Hamur ince açılır ve her parçel elle kapatılır.\\n\\nÇin mantılarının aksine manti, mantovarka adı verilen çok katlı özel bir buharlı pişiriciye konulur ve bol bol servis edilir. Üzerine dökülen eritilmiş tereyağı klasik bir bitiştir; ekşi krema veya yoğurt serinletici bir tamamlayıcı olarak eşlik eder.",
      it: "I manti sono grandi ravioli al vapore diffusi in Asia centrale, nel Caucaso e in Turchia attraverso la Via della Seta e le migrazioni nomadi. In Uzbekistan, il ripieno è tradizionalmente tritato a mano con il coltello — agnello o manzo con abbondante cipolla cruda che si scioglie durante la cottura, mantenendo la carne morbida e profumata. La sfoglia è tirata sottile e ogni raviolo chiuso a mano.\\n\\nA differenza dei ravioli cinesi, i manti cuociono in un apposito cuocivapore a più livelli chiamato mantovarka e si servono generosamente. Il burro fuso versato sopra è il tocco finale classico; la panna acida o lo yogurt aggiunge una nota rinfrescante.",
      ko: "만티는 실크로드 무역과 유목민 이동을 통해 중앙아시아, 코카서스, 터키 전역에 퍼진 대형 찐 만두입니다. 우즈베키스탄에서는 전통적으로 칼로 굵게 다진 양고기나 소고기에 생양파를 듬뿍 넣어 속을 만듭니다. 찌는 동안 양파가 녹아 육즙이 풍부한 식감을 냅니다.\\n\\n중국 만두와 달리 만티는 만토바르카라는 전용 다단 찜기에 조리하며, 한 사람에게 보통 4~6개를 넉넉히 제공합니다. 위에 녹인 버터를 뿌리는 것이 정통 마무리이고, 사워크림이나 새콤한 요구르트를 곁들이기도 합니다.",
      hi: "मंटी बड़े भाप में पके पकौड़े हैं जो सिल्क रोड व्यापार और खानाबदोश प्रवास के ज़रिए मध्य एशिया, काकेशस और तुर्की में फैले। उज़्बेकिस्तान में भराई परंपरागत रूप से चाकू से मोटी कटी जाती है — मेमने या गोमांस के साथ ढेर सारा कच्चा प्याज़, जो भाप में पकते वक्त पिघलकर मांस को रसीला और खुशबूदार रखता है।\\n\\nचीनी पकौड़ों से अलग, मंटी को मांटोवार्का नामक विशेष बहु-स्तरीय भाप के बर्तन में पकाया जाता है और उदारता से परोसा जाता है। ऊपर से पिघला मक्खन डालना क्लासिक अंत है; खट्टी क्रीम या तीखा दही इसे ताज़गी देता है।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 115 done")
