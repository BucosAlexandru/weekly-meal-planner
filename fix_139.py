with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ID 139 - Cepelinai (Lithuania) - category already has hi

content = content.replace(
    '      ko: "리투아니아"\n    },\n    name: {\n      ro: "Cepelinai"',
    '      ko: "리투아니아",\n      hi: "लिथुआनिया"\n    },\n    name: {\n      ro: "Cepelinai"'
)

content = content.replace(
    '      ko: "체펠리나이"\n    },\n    category: {',
    '      ko: "체펠리나이",\n      hi: "त्सेपेलिनाई"\n    },\n    category: {'
)

content = content.replace(
    '      ko: ["감자", "다진 고기", "양파", "새콤한 크림", "베이컨", "소금", "후추"]\n    },\n    howIsMade: {',
    '      ko: ["감자", "다진 고기", "양파", "새콤한 크림", "베이컨", "소금", "후추"],\n      hi: ["आलू", "कीमा", "प्याज़", "खट्टी क्रीम", "बेकन", "नमक", "काली मिर्च"]\n    },\n    howIsMade: {'
)

content = content.replace(
    '      ko: "감자를 갈아 밀가루와 섞고 다진 고기로 속을 채웁니다. 큰 만두 모양으로 빚어 부드러워질 때까지 삶습니다. 사워크림과 함께 제공합니다."\n    },\n    originText: {\n      ro: "Cepelinai este',
    '      ko: "감자를 갈아 밀가루와 섞고 다진 고기로 속을 채웁니다. 큰 만두 모양으로 빚어 부드러워질 때까지 삶습니다. 사워크림과 함께 제공합니다.",\n      hi: "आलू कद्दूकस करें, आटे के साथ मिलाएं, कीमे से भरें, बड़े पकौड़े बनाकर नरम होने तक उबालें। खट्टी क्रीम के साथ परोसें।"\n    },\n    originText: {\n      ro: "Cepelinai este'
)

old_origin = '''    originText: {
      ro: "Cepelinai este o rețetă tradițională din Lituania.",
      en: "Cepelinai is a traditional recipe from Lithuania.",
      es: "Cepelinai es una receta tradicional de Lituania.",
      fr: "Cepelinai est une recette traditionnelle de Lituanie.",
      de: "Cepelinai ist ein traditionelles Rezept aus Litauen.",
      pt: "Cepelinai é uma receita tradicional da Lituânia.",
      ru: "Цепелинай — традиционный рецепт из Литвы.",
      ar: "سيبيليناي هي وصفة تقليدية من ليتوانيا.",
      zh: "立陶宛土豆团 是来自立陶宛的传统食谱。",
      ja: "ツェペリナイ はリトアニアの伝統的なレシピです。",
      tr: "Cepelinai Litvanya kökenli geleneksel bir tariftir.",
      it: "Cepelinai è una ricetta tradizionale della Lituania.",
      ko: "체펠리나이는 리투아니아의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Cepelinai — denumiți după zeppelinul lui Graf Zeppelin datorită formei lor ovoide — sunt mâncarea națională a Lituaniei. Aluatul combină cartofi crudi rași cu cartofi fierți zdrobiți, creând o masă densă, elastică în jurul umpluturii de carne de porc tocată cu ceapă. Găluștele mari se fierb până devin translucide la suprafață — semn că sunt gata.\\n\\nSe servesc cu un sos triplu: smântână, bacon prăjit și ceapă sotată. Lituanienii le mănâncă la sărbători și reuniuni familiale și reprezintă cel mai emblematic fel al bucătăriei naționale. Prepararea lor este laborioasă și se face de obicei în grup.",
      en: "Cepelinai — named after Count Zeppelin's airship for their oval shape — are Lithuania's national dish. The dough combines raw grated potatoes with mashed boiled potatoes to form a dense, elastic mass around a filling of minced pork and onion. The large dumplings are boiled until the surface turns translucent — the sign they are ready.\\n\\nThey are served with a triple sauce: sour cream, fried bacon, and sautéed onion. Lithuanians eat them at celebrations and family reunions, and they are the most emblematic dish of the national cuisine. Their preparation is laborious and usually done communally.",
      es: "Los cepelinai — nombrados por el dirigible del Conde Zeppelin por su forma ovalada — son el plato nacional de Lituania. La masa combina patata cruda rallada con puré de patata cocida para formar una masa densa y elástica alrededor de un relleno de cerdo picado y cebolla. Las grandes albóndigas se cuecen hasta que la superficie se vuelve translúcida — señal de que están listas.\\n\\nSe sirven con una salsa triple: crema agria, bacon frito y cebolla salteada. Los lituanos los comen en celebraciones y reuniones familiares, siendo el plato más emblemático de la cocina nacional.",
      fr: "Les cepelinai — nommés d'après le dirigeable du comte Zeppelin pour leur forme ovale — sont le plat national de la Lituanie. La pâte associe des pommes de terre crues râpées à de la purée de pommes de terre cuites pour former une masse dense et élastique autour d'une farce de porc haché et d'oignon. Les grosses boulettes sont cuites jusqu'à ce que la surface devienne translucide — signe qu'elles sont prêtes.\\n\\nElles se servent avec une sauce triple : crème aigre, bacon frit et oignon sauté. Les Lituaniens les mangent lors des fêtes et réunions familiales. Leur préparation est laborieuse et se fait généralement en groupe.",
      de: "Cepelinai — nach Graf Zeppelins Luftschiff wegen ihrer Eiform benannt — ist das Nationalgericht Litauens. Der Teig kombiniert rohe geriebene Kartoffeln mit gestampften gekochten Kartoffeln zu einer dichten, elastischen Masse um eine Füllung aus gehacktem Schweinefleisch und Zwiebeln. Die großen Klöße werden gekocht, bis die Oberfläche durchscheinend wird — das Zeichen, dass sie fertig sind.\\n\\nSie werden mit einer dreifachen Sauce serviert: Sauerrahm, gebratenem Speck und sautierter Zwiebel. Litauer essen sie bei Feiern und Familientreffen.",
      pt: "Os cepelinai — nomeados pelo dirigível do Conde Zeppelin pela sua forma oval — são o prato nacional da Lituânia. A massa combina batata crua ralada com puré de batata cozida para formar uma massa densa e elástica ao redor de um recheio de carne de porco picada e cebola. Os grandes bolinhos são cozidos até a superfície ficar translúcida — sinal de que estão prontos.\\n\\nSão servidos com um molho triplo: creme azedo, bacon frito e cebola salteada. Os lituanos os comem em celebrações e reuniões familiares, sendo o prato mais emblemático da cozinha nacional.",
      ru: "Цепелинай — названы в честь дирижабля графа Цеппелина из-за овальной формы — национальное блюдо Литвы. Тесто сочетает сырой тёртый картофель с пюре из варёного картофеля, образуя плотную, упругую массу вокруг начинки из рубленой свинины с луком. Большие клёцки варят до тех пор, пока поверхность не станет полупрозрачной — признак готовности.\\n\\nПодаются с тройным соусом: сметаной, жареным беконом и тушёным луком. Литовцы едят их на праздниках и семейных собраниях; это наиболее знаковое блюдо национальной кухни.",
      ar: "سيبيليناي — سُمِّيت بعد منطاد الكونت زيبلين لشكلها البيضاوي — هي الطبق الوطني لليتوانيا. تجمع العجينة بين البطاطس المبشورة النيئة والبطاطس المهروسة المطبوخة لتكوين كتلة كثيفة ومرنة حول حشوة من لحم الخنزير المفروم والبصل. تُسلق الكرات الكبيرة حتى يصبح سطحها شفافاً — علامة جاهزيتها.\\n\\nتُقدَّم مع صلصة ثلاثية: قشدة حامضة ولحم مقدد مقلي وبصل مقلي. يتناولها الليتوانيون في الاحتفالات ولقاءات العائلة، وهي الطبق الأكثر تعبيراً عن المطبخ الوطني.",
      zh: "茨鹌鹑那伊——因其椭圆形状而以齐柏林伯爵飞艇命名——是立陶宛的国菜。面团将生磨土豆与煮熟的土豆泥结合，在猪肉末和洋葱馅料外形成紧密、有弹性的外层。大型饺子煮至表面变半透明即为熟透。\\n\\n配三重酱汁食用：酸奶油、煎培根和炒洋葱。立陶宛人在节日庆典和家庭聚会上享用这道菜，它是国家美食中最具代表性的菜肴。制作费时，通常需要大家一起动手。",
      ja: "ツェペリナイ——その楕円形からツェッペリン伯爵の飛行船にちなんで名付けられました——はリトアニアの国民食です。生のすりおろしジャガイモとゆでたマッシュポテトを合わせた生地が、ひき豚肉と玉ねぎの詰め物を包む密な弾力ある外層を形成します。大きな餃子は表面が半透明になるまで茹でます——これが完成のサインです。\\n\\n三重のソースと共に提供されます：サワークリーム、揚げベーコン、ソテーした玉ねぎ。リトアニア人は祝い事や家族の集まりで食べます。",
      tr: "Cepelinai — oval şekilleri nedeniyle Kont Zeppelin'in hava gemisinden adını alır — Litvanya'nın ulusal yemeğidir. Hamur, çiğ rendelenmiş patates ile haşlanmış patates püresini birleştirerek kıyılmış domuz eti ve soğan dolgusunun etrafında yoğun ve elastik bir kütle oluşturur. Büyük hamur topları yüzeyleri yarı saydam olana kadar haşlanır — bu hazır olduklarının işaretidir.\\n\\nÜçlü sosla servis edilir: ekşi krema, kızartılmış pastırma ve sotelediğimiz soğan. Litvanyalılar bunları kutlamalarda ve aile buluşmalarında yer, ulusal mutfağın en sembolik yemeğidir.",
      it: "I cepelinai — chiamati così per la loro forma ovale che ricorda il dirigibile del Conte Zeppelin — sono il piatto nazionale della Lituania. L'impasto unisce patate crude grattugiate con purè di patate lesse per formare una massa densa ed elastica attorno a un ripieno di maiale tritato e cipolla. I grandi gnocchi vengono lessati finché la superficie non diventa traslucida — segno che sono pronti.\\n\\nVengono serviti con una salsa tripla: panna acida, pancetta fritta e cipolla saltata. I lituani li mangiano in occasione di celebrazioni e riunioni di famiglia.",
      ko: "체펠리나이——타원형 모양 때문에 체펠린 백작의 비행선에서 이름을 따왔습니다——는 리투아니아의 국민 요리입니다. 생감자를 갈아 삶은 감자 퓨레와 섞어 돼지고기 다짐육과 양파 속 주위에 단단하고 탄력 있는 외피를 만듭니다. 큰 만두를 표면이 반투명해질 때까지 삶습니다——이것이 완성의 신호입니다.\\n\\n세 겹 소스와 함께 제공됩니다: 사워크림, 구운 베이컨, 볶은 양파. 리투아니아인들은 축제와 가족 모임에서 먹습니다.",
      hi: "त्सेपेलिनाई——अपने अंडाकार आकार के कारण काउंट ज़ेपेलिन के हवाई पोत के नाम पर——लिथुआनिया का राष्ट्रीय व्यंजन है। आटे में कच्चे कद्दूकस किए आलू और उबले मसले आलू मिलाकर कीमे और प्याज़ की भराई के चारों ओर एक घना, लोचदार आवरण बनाया जाता है। बड़े पकौड़ों को तब तक उबाला जाता है जब तक सतह अर्धपारदर्शी न हो जाए — यही तैयार होने की निशानी है।\\n\\nतीन-परत की चटनी के साथ परोसे जाते हैं: खट्टी क्रीम, तला बेकन और भुना प्याज़। लिथुआनियाई लोग इन्हें उत्सवों और पारिवारिक समारोहों में खाते हैं, और ये राष्ट्रीय व्यंजन का सबसे प्रतीकात्मक भोजन है।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 139 done")
