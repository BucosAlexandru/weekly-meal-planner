with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ID 127 - Causa Limeña, Peru
# Add hi to origin — second Peru instance (first was ID 117)
# Need unique context: name is Causa Limeña
content = content.replace(
    '      ko: "페루"\n    },\n    name: {\n      ro: "Causa Limeña"',
    '      ko: "페루",\n      hi: "पेरू"\n    },\n    name: {\n      ro: "Causa Limeña"'
)

# Add hi to name
content = content.replace(
    '      ko: "카우사 리메냐"\n    },\n    category: {',
    '      ko: "카우사 리메냐",\n      hi: "काउसा लिमेन्या"\n    },\n    category: {'
)

# Add hi to category — Causa Limeña is Appetizer
content = content.replace(
    '      ko: "전채"\n    },\n    servings: 4,\n    tipType: \'fish\'',
    '      ko: "전채",\n      hi: "ऐपेटाइज़र"\n    },\n    servings: 4,\n    tipType: \'fish\''
)

# Add hi to ingredients
content = content.replace(
    '      ko: ["감자", "레몬", "마요네즈", "아보카도", "참치 또는 닭고기", "고추", "소금", "후추"]\n    },\n    howIsMade: {',
    '      ko: ["감자", "레몬", "마요네즈", "아보카도", "참치 또는 닭고기", "고추", "소금", "후추"],\n      hi: ["आलू", "नींबू", "मेयोनेज़", "एवोकैडो", "टूना या मुर्गी", "मिर्च", "नमक", "काली मिर्च"]\n    },\n    howIsMade: {'
)

# Add hi to howIsMade
content = content.replace(
    '      ko: "감자를 삶아 레몬과 섞고, 마요네즈, 아보카도, 참치 또는 닭고기로 층을 쌓아 차갑게 제공합니다."\n    },\n    originText: {\n      ro: "Causa Limeña este',
    '      ko: "감자를 삶아 레몬과 섞고, 마요네즈, 아보카도, 참치 또는 닭고기로 층을 쌓아 차갑게 제공합니다.",\n      hi: "आलू उबालें, नींबू के साथ मिलाएं, मेयोनेज़, एवोकैडो और टूना/मुर्गी के साथ परतें बनाएं, ठंडा परोसें।"\n    },\n    originText: {\n      ro: "Causa Limeña este'
)

# Replace originText
old_origin = '''    originText: {
      ro: "Causa Limeña este o rețetă tradițională din Peru.",
      en: "Causa Limeña is a traditional recipe from Peru.",
      es: "Causa Limeña es una receta tradicional de Perú.",
      fr: "Causa Limeña est une recette traditionnelle du Pérou.",
      de: "Causa Limeña ist ein traditionelles Rezept aus Peru.",
      pt: "Causa Limeña é uma receita tradicional do Peru.",
      ru: "Кауса Лименья — традиционный рецепт из Перу.",
      ar: "كاوسا ليمنيا هي وصفة تقليدية من بيرو.",
      zh: "土豆鸡肉沙拉 是来自秘鲁的传统食谱。",
      ja: "カウサ・リメーニャ はペルーの伝統的なレシピです。",
      tr: "Causa Limeña Peru kökenli geleneksel bir tariftir.",
      it: "Causa Limeña è una ricetta tradizionale del Perù.",
      ko: "카우사 리메냐는 페루의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Causa limeña este o terină presată de cartofi galbeni peruvieni, condimentați cu ají amarillo și zeamă de lămâie, și stratificată cu umplutură cremoasă de ton sau pui cu maioneză și avocado. Cartofii andini — mai ales cei cu pastă galbenă naturală — sunt fierți, pasați fin și amestecați cu ulei, ají și lămâie până obțin o textură mătăsoasă. Felul se servește rece, tăiat în felii care dezvăluie straturile contrastante.\\n\\nPreparatul este o emblemă a fuziunii culinare peruane: cartofii andinii au mii de ani, maioneza e moștenire spaniolă, iar prezentarea stratificată refinată reflectă influența Nikkei — comunitatea japonezo-peruană care a contribuit semnificativ la bucătăria limeñă. Causa apare la orice masă festivă.",
      en: "Causa limeña is a pressed terrine of yellow Peruvian potatoes seasoned with ají amarillo and lime juice, layered with a creamy filling of tuna or chicken with mayonnaise and avocado. The Andean potatoes — especially those with naturally yellow flesh — are boiled, riced smooth, and worked with oil, ají, and lime until silky. The dish is served cold, sliced to reveal its contrasting layers.\\n\\nThe dish is an emblem of Peru's culinary fusion: the Andean potatoes are millennia old, the mayonnaise is Spanish heritage, and the refined layered presentation reflects Nikkei influence — the Japanese-Peruvian community that shaped Lima's modern kitchen. Causa appears at every festive table.",
      es: "La causa limeña es una terrina prensada de patatas amarillas peruanas sazonadas con ají amarillo y jugo de lima, montada en capas con un relleno cremoso de atún o pollo con mayonesa y aguacate. Las patatas andinas — especialmente las de pulpa amarilla natural — se cuecen, se pasan por el pasapuré y se trabajan con aceite, ají y lima hasta obtener una textura sedosa. El plato se sirve frío, cortado para revelar sus capas contrastantes.\\n\\nEl plato es un emblema de la fusión culinaria peruana: las patatas andinas tienen milenios, la mayonesa es herencia española, y la refinada presentación en capas refleja la influencia Nikkei.",
      fr: "La causa limeña est une terrine pressée de pommes de terre jaunes péruviennes assaisonnées d'ají amarillo et de jus de citron vert, disposées en couches avec une garniture crémeuse de thon ou poulet, mayonnaise et avocat. Les pommes de terre andines — surtout celles à chair naturellement jaune — sont cuites, réduites en purée fine et travaillées avec huile, ají et citron vert jusqu'à obtenir une texture soyeuse. Le plat se sert froid, découpé pour révéler ses couches contrastées.\\n\\nC'est un emblème de la fusion culinaire péruvienne : les pommes de terre andines ont des millénaires, la mayonnaise est un héritage espagnol, et la présentation en couches reflète l'influence Nikkei.",
      de: "Causa Limeña ist eine gepresste Terrine aus peruanischen gelben Kartoffeln, gewürzt mit Ají Amarillo und Limettensaft, geschichtet mit einer cremigen Füllung aus Thunfisch oder Hähnchen mit Mayonnaise und Avocado. Die andinischen Kartoffeln — besonders jene mit natürlich gelbem Fleisch — werden gekocht, fein passiert und mit Öl, Ají und Limette bis zur seidigen Textur gearbeitet. Das Gericht wird kalt serviert, aufgeschnitten, um die kontrastierenden Schichten zu zeigen.\\n\\nEs ist ein Emblem der peruanischen Küchenfusion: die andinischen Kartoffeln sind jahrtausende alt, die Mayonnaise ist spanisches Erbe, und die raffinierte Schichtpräsentation spiegelt den Nikkei-Einfluss wider.",
      pt: "A causa limeña é uma terrina prensada de batatas amarelas peruanas temperadas com ají amarillo e suco de limão, em camadas com um recheio cremoso de atum ou frango com maionese e abacate. As batatas andinas — especialmente as de polpa naturalmente amarela — são cozidas, amassadas finamente e trabalhadas com azeite, ají e limão até obter textura sedosa. O prato é servido frio, fatiado para revelar as camadas contrastantes.\\n\\nÉ um emblema da fusão culinária peruana: as batatas andinas têm milênios, a maionese é herança espanhola, e a apresentação refinada em camadas reflete a influência Nikkei.",
      ru: "Кауса лименья — прессованный террин из перуанского жёлтого картофеля, приправленного ají amarillo и соком лайма, с кремовой начинкой из тунца или курицы с майонезом и авокадо. Андский картофель — особенно с естественно жёлтой мякотью — варят, тщательно разминают и смешивают с маслом, ají и лаймом до шелковистой текстуры. Блюдо подаётся холодным и нарезается, обнажая контрастные слои.\\n\\nЭто эмблема перуанского кулинарного слияния: андский картофель существует тысячелетия, майонез — испанское наследие, а рафинированная слоистая подача отражает влияние Никкей.",
      ar: "كاوسا ليمنيا تيرين مضغوط من البطاطس الصفراء البيروفية المتبّلة بالأجي أماريو وعصير الليمون، مرتبة في طبقات مع حشوة كريمية من التونة أو الدجاج مع المايونيز والأفوكادو. تُسلق البطاطس الأنديزية — لا سيما ذات اللب الأصفر الطبيعي — وتُهرس ناعماً وتُعجن مع الزيت والأجي والليمون حتى تصبح حريرية الملمس. يُقدَّم الطبق بارداً مقطعاً ليُظهر طبقاته المتباينة.\\n\\nيجسّد الطبق مزيج المطابخ البيروفية: البطاطس الأنديزية ذات تاريخ يمتد لآلاف السنين، والمايونيز إرث إسباني، والتقديم الطبقي المتقن يعكس التأثير النيكي.",
      zh: "奥萨利梅尼亚是一道压制而成的秘鲁黄土豆冻糕，以黄辣椒和青柠汁调味，与涂有蛋黄酱的金枪鱼或鸡肉及牛油果层层叠加。安第斯土豆——尤其是天然黄肉品种——煮熟后捣成细泥，加入油、黄辣椒和青柠揉至如丝般顺滑。这道菜冷食，切开后露出鲜明对比的层次。\\n\\n这道菜是秘鲁饮食融合的缩影：安第斯土豆有数千年历史，蛋黄酱源自西班牙遗产，而精致的叠层呈现则体现了日裔秘鲁人（Nikkei）社区对利马现代厨房的影响。",
      ja: "カウサ・リメーニャは、アヒ・アマリーリョとライム果汁で味付けしたペルー産黄色いじゃがいもを押し固め、マヨネーズ、アボカド、ツナまたは鶏肉のクリーミーなフィリングと交互に層にした冷菜です。アンデスのじゃがいも——とくに自然に黄色い果肉のもの——を茹でて裏ごしし、油・アヒ・ライムでなめらかになるまで混ぜます。冷やして断面の層が見えるように切り分けて提供します。\\n\\nこの料理はペルー料理融合の象徴です。アンデスのじゃがいもは数千年の歴史を持ち、マヨネーズはスペイン遺産、洗練された層状の盛り付けはリマの台所に大きく貢献した日系ペルー人コミュニティ（Nikkei）の影響を反映しています。",
      tr: "Causa limeña, ají amarillo ve misket limonu suyuyla tatlandırılmış sarı Andi patatesiyle yapılan basılmış bir terindır; katmanları arasında mayonez, avokado ve ton balığı ya da tavuktan oluşan kremsi bir dolgu bulunur. Andi patatesleri — özellikle doğal sarı etli olanlar — haşlanıp ince ince ezilir ve zeytinyağı, ají ve misket limonuyla ipek gibi bir kıvam alana kadar yoğrulur. Yemek soğuk servis edilir ve birbirinden farklı katmanları ortaya koyan dilimler halinde kesilir.\\n\\nBu yemek Peru mutfak füzyonunun simgesidir: Andi patatesleri binlerce yıllıktır, mayonez İspanyol mirası, katmanlı sunum ise Lima'nın modern mutfağını büyük ölçüde şekillendiren Nikkei topluluğunun etkisini yansıtır.",
      it: "Causa limeña è un timballo pressato di patate gialle peruviane insaporite con ají amarillo e succo di lime, stratificate con un ripieno cremoso di tonno o pollo con maionese e avocado. Le patate andine — specialmente quelle con polpa naturalmente gialla — vengono lessate, passate finemente e lavorate con olio, ají e lime fino a ottenere una consistenza setosa. Il piatto si serve freddo, affettato per rivelare i suoi strati contrastanti.\\n\\nÈ un emblema della fusione culinaria peruviana: le patate andine hanno millenni di storia, la maionese è un'eredità spagnola e la raffinata presentazione a strati riflette l'influenza Nikkei — la comunità giapponese-peruviana che ha contribuito alla cucina moderna di Lima.",
      ko: "카우사 리메냐는 아히 아마리요와 라임즙으로 양념한 노란 페루 감자를 눌러 만든 테린으로, 마요네즈·아보카도와 참치 또는 닭고기의 크리미한 속재료를 층층이 쌓습니다. 안데스 감자——특히 자연적으로 노란 속을 가진 품종——를 삶아 고운 체에 내린 후 기름·아히·라임으로 반죽해 실크처럼 부드럽게 만듭니다. 차갑게 식혀 단면의 대비되는 층이 드러나도록 잘라 냅니다.\\n\\n이 요리는 페루 요리 융합의 상징입니다. 안데스 감자는 수천 년의 역사를 지녔고, 마요네즈는 스페인 유산이며, 세련된 층별 플레이팅은 리마 현대 주방에 크게 기여한 닛케이(일계 페루인) 커뮤니티의 영향을 반영합니다.",
      hi: "काउसा लिमेन्या पीले पेरूवियन आलू की एक दबाई हुई टेरिन है जिसे अजी अमारिल्लो और नींबू के रस से तैयार किया जाता है, और मेयोनेज़ और एवोकैडो के साथ टूना या मुर्गी की क्रीमी भराई की परतें बनाई जाती हैं। एंडियन आलू — विशेषकर प्राकृतिक रूप से पीले रंग वाले — उबालकर बारीक मैश किए जाते हैं और तेल, अजी और नींबू के साथ रेशमी बनावट तक गूंधे जाते हैं। यह व्यंजन ठंडा परोसा जाता है और काटने पर विपरीत परतें दिखाई देती हैं।\\n\\nयह व्यंजन पेरू के पाक संगम का प्रतीक है: एंडियन आलू हज़ारों साल पुराने हैं, मेयोनेज़ स्पेनिश विरासत है, और परिष्कृत परतदार प्रस्तुति निक्केई — जापानी-पेरूवियन समुदाय — के प्रभाव को दर्शाती है जिसने लीमा के आधुनिक रसोई को आकार दिया।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 127 done")
