with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ID 152 - Plov (Uzbekistan) - no hi fields yet
# Note: origin block is missing pt (pre-existing)

content = content.replace(
    '      ko: "우즈베키스탄"\n    },\n    name: {\n      ro: "Plov"',
    '      ko: "우즈베키스탄",\n      hi: "उज़्बेकिस्तान"\n    },\n    name: {\n      ro: "Plov"'
)

content = content.replace(
    '      ko: "플로프"\n    },\n    category: {\n      ro: "Cină",\n      en: "Dinner",\n      es: "Cena",\n      fr: "Dîner",\n      de: "Abendessen",\n      pt: "Jantar",\n      ru: "Ужин",\n      ar: "عشاء",\n      zh: "晚餐",\n      ja: "ディナー",\n      tr: "Akşam yemeği",\n      it: "Cena",\n      ko: "저녁"\n    },\n    servings: 6,\n    tipType: \'meat\',',
    '      ko: "플로프",\n      hi: "पलोव"\n    },\n    category: {\n      ro: "Cină",\n      en: "Dinner",\n      es: "Cena",\n      fr: "Dîner",\n      de: "Abendessen",\n      pt: "Jantar",\n      ru: "Ужин",\n      ar: "عشاء",\n      zh: "晚餐",\n      ja: "ディナー",\n      tr: "Akşam yemeği",\n      it: "Cena",\n      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    servings: 6,\n    tipType: \'meat\','
)

content = content.replace(
    '      ko: ["쌀", "양고기 또는 소고기", "당근", "양파", "기름", "마늘", "향신료"]\n    },\n    howIsMade: {',
    '      ko: ["쌀", "양고기 또는 소고기", "당근", "양파", "기름", "마늘", "향신료"],\n      hi: ["चावल", "मेमना या बीफ", "गाजर", "प्याज़", "तेल", "लहसुन", "मसाले"]\n    },\n    howIsMade: {'
)

content = content.replace(
    '      ko: "고기와 채소를 볶다가 쌀과 향신료를 넣어 물이 흡수될 때까지 끓입니다."\n    },\n    originText: {\n      ro: "Plov este',
    '      ko: "고기와 채소를 볶다가 쌀과 향신료를 넣어 물이 흡수될 때까지 끓입니다.",\n      hi: "मांस और सब्जियाँ भूनें, फिर चावल और मसाले डालें और पानी सोख जाने तक पकाएं।"\n    },\n    originText: {\n      ro: "Plov este'
)

old_origin = '''    originText: {
      ro: "Plov este o rețetă tradițională din Uzbekistan.",
      en: "Plov is a traditional recipe from Uzbekistan.",
      es: "Plov es una receta tradicional de Uzbekistán.",
      fr: "Plov est une recette traditionnelle de l'Ouzbékistan.",
      de: "Plov ist ein traditionelles Rezept aus Usbekistan.",
      pt: "Plov é uma receita tradicional do Uzbequistão.",
      ru: "Плов — традиционный рецепт из Узбекистана.",
      ar: "بلاف هي وصفة تقليدية من أوزبكستان.",
      zh: "抓饭 是来自乌兹别克斯坦的传统食谱。",
      ja: "プロフ はウズベキスタンの伝統的なレシピです。",
      tr: "Plov Özbekistan kökenli geleneksel bir tariftir.",
      it: "Plov è una ricetta tradizionale dell'Uzbekistan.",
      ko: "플로프는 우즈베키스탄의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Plovul uzbek este regele orezului central-asiatic — un cazan de fontă (kazan) în care baranina sau vita se prăjesc mai întâi în grăsime de coadă de oaie (sau ulei vegetal), urmate de morcovi tăiați julien și ceapă, apoi se adaugă orezul și apa. Totul se gătește fără capac până apa se absoarbe, cu usituroi întreg înfipt în orez. Aroma de morcov caramelizat și condimente (chimen, coriandru) este inconfundabilă.\\n\\nPlovul se servește dintr-un cazan comun pe o farfurie mare, cu salatele de roșii și ceapă alături. Prepararea plovului este apanajul bărbaților în Uzbekistan. La nunți și ocazii solemne, un bucătar maestru (oshpaz) poate prepara o sută de kilograme odată pentru mii de oaspeți.",
      en: "Uzbek plov is the king of Central Asian rice — a cast-iron cauldron in which lamb or beef is first fried in sheep tail fat (or vegetable oil), followed by julienned carrots and onion, then rice and water are added. Everything cooks uncovered until the water is absorbed, with whole garlic pushed into the rice. The aroma of caramelized carrot and spices (cumin, coriander) is unmistakable.\\n\\nPlov is served from a common cauldron onto a large platter, with tomato and onion salads alongside. Cooking plov is the domain of men in Uzbekistan. At weddings and solemn occasions, a master cook (oshpaz) may prepare one hundred kilograms at once for thousands of guests.",
      es: "El plov uzbeko es el rey del arroz centroasiático — un caldero de hierro fundido en el que el cordero o la ternera se fríen primero en grasa de cola de oveja (o aceite vegetal), seguidos de zanahorias juliana y cebolla, luego se añaden arroz y agua. Todo se cuece destapado hasta que el agua se absorbe, con ajo entero clavado en el arroz. El aroma de zanahoria caramelizada y especias (comino, cilantro) es inconfundible.\\n\\nEl plov se sirve de un caldero común en una bandeja grande, con ensaladas de tomate y cebolla a un lado. Cocinar plov es dominio de los hombres en Uzbekistán.",
      fr: "Le plov ouzbek est le roi du riz centrasiatique — un chaudron en fonte dans lequel l'agneau ou le bœuf est d'abord frit dans de la graisse de queue de mouton (ou de l'huile végétale), suivi de carottes julienne et d'oignon, puis le riz et l'eau sont ajoutés. Tout cuit à découvert jusqu'à absorption de l'eau, avec de l'ail entier enfoncé dans le riz. L'arôme de carotte caramélisée et d'épices (cumin, coriandre) est inimitable.\\n\\nLe plov se sert d'un chaudron commun sur un grand plat, avec des salades de tomate et d'oignon. La préparation du plov est l'apanage des hommes en Ouzbékistan.",
      de: "Usbekisches Plov ist der König des zentralasiatischen Reises — ein gusseiserner Kessel, in dem Lamm- oder Rindfleisch zuerst in Schafsschwanzfett (oder Pflanzenöl) gebraten wird, gefolgt von julienne Karotten und Zwiebeln, dann werden Reis und Wasser hinzugefügt. Alles kocht unbedeckt, bis das Wasser absorbiert ist, mit ganzem in den Reis gestecktem Knoblauch. Das Aroma von karamellisierter Karotte und Gewürzen (Kreuzkümmel, Koriander) ist unverwechselbar.\\n\\nPlov wird aus einem gemeinsamen Kessel auf eine große Platte serviert, mit Tomaten- und Zwiebelsalaten dabei. Das Kochen von Plov ist in Usbekistan Männersache.",
      pt: "O plov uzbeque é o rei do arroz da Ásia Central — um caldeirão de ferro fundido em que o cordeiro ou a carne bovina é primeiro frita em gordura de rabo de ovelha (ou óleo vegetal), seguida de cenouras em juliana e cebola, depois adiciona-se arroz e água. Tudo cozinha sem tampa até a água ser absorvida, com alho inteiro enfiado no arroz. O aroma de cenoura caramelizada e especiarias (cominho, coentro) é inconfundível.\\n\\nO plov é servido de um caldeirão comum numa travessa grande, com saladas de tomate e cebola ao lado. Cozinhar plov é domínio masculino no Uzbequistão.",
      ru: "Узбекский плов — король среднеазиатского риса: в чугунном казане сначала обжаривают баранину или говядину в курдючном жиру (или растительном масле), затем добавляют морковь соломкой и лук, потом рис и воду. Всё готовится без крышки до впитывания воды, с целыми головками чеснока, утопленными в рисе. Аромат карамелизированной моркови и пряностей (зиры, кориандра) неповторим.\\n\\nПлов подают из общего казана на большое блюдо, рядом — салаты из помидоров и лука. Приготовление плова в Узбекистане — мужское дело. На свадьбах и торжествах мастер-ошпаз может приготовить сразу сто килограммов для тысяч гостей.",
      ar: "البلاف الأوزبكي هو ملك الأرز في آسيا الوسطى — مرجل من الحديد الزهر تُقلى فيه أولاً قطع الضأن أو البقر في شحم ذيل الخروف (أو الزيت النباتي)، يليها الجزر المقطع جوليان والبصل، ثم يُضاف الأرز والماء. يُطهى كل شيء مكشوفاً حتى يتشرب الماء مع رؤوس ثوم كاملة مغروسة في الأرز. عبق الجزر المكرمل والتوابل (الكمون والكزبرة) لا يُضاهى.\\n\\nيُقدَّم البلاف من مرجل مشترك على طبق كبير مع سلطات الطماطم والبصل. طهو البلاف في أوزبكستان حكر على الرجال.",
      zh: "乌兹别克抓饭是中亚米饭之王——在铸铁大锅中，先将羊肉或牛肉在羊尾油（或植物油）中煎炸，再加入切丝胡萝卜和洋葱，最后放入米饭和水。不盖盖子煮至水分吸收，整头大蒜插入米饭中。焦糖化胡萝卜和香料（孜然、香菜籽）的香气令人难忘。\\n\\n抓饭从共用大锅盛到大盘上，旁边放番茄洋葱沙拉。在乌兹别克斯坦，做抓饭是男人的专利。婚礼和重大场合，一位大师厨师（奥什帕兹）可以一次为数千宾客做一百公斤。",
      ja: "ウズベキスタンのプロフは中央アジアの米料理の王様です——鋳鉄製の大鍋で羊肉か牛肉を羊の尻尾の脂（または植物油）で最初に炒め、次に千切り人参と玉ねぎを加え、それからご飯と水を加えます。蓋をせずに水が吸収されるまで調理し、丸ごとのニンニクをご飯に刺します。カラメル化した人参とスパイス（クミン、コリアンダー）の香りは独特です。\\n\\nプロフは共有の大鍋から大皿に盛られ、トマトと玉ねぎのサラダを添えます。ウズベキスタンではプロフ調理は男性の仕事です。",
      tr: "Özbek plovı, Orta Asya'nın pirinç mutfağının sultanıdır — dökme demir bir kazanda kuzu eti veya dana eti önce kuyruk yağında (ya da bitkisel yağda) kızartılır, ardından julyen havuç ve soğan eklenir, sonra pirinç ve su konur. Her şey su çekilene kadar açık pişirilir; bütün sarımsak başları pirince batırılır. Karamelize havucun ve baharatların (kimyon, kişniş) aroması eşsizdir.\\n\\nPlov, ortak bir kazandan büyük bir tabağa servis edilir, yanında domates ve soğan salatası sunulur. Özbekistan'da plov pişirmek erkeklere özgüdür.",
      it: "Il plov uzbeko è il re del riso centrasiatico — un calderone di ghisa in cui agnello o manzo vengono prima fritti nel grasso della coda di pecora (o olio vegetale), seguiti da carote julienne e cipolla, poi si aggiungono riso e acqua. Tutto cuoce senza coperchio finché l'acqua non viene assorbita, con aglio intero infilato nel riso. L'aroma di carota caramellata e spezie (cumino, coriandolo) è inconfondibile.\\n\\nIl plov viene servito da un calderone comune su un grande piatto, con insalate di pomodoro e cipolla. Cucinare il plov in Uzbekistan è prerogativa degli uomini.",
      ko: "우즈베크 플로프는 중앙아시아 쌀 요리의 왕입니다. 무쇠 솥에 양고기나 소고기를 양꼬리 지방(또는 식물성 기름)에 먼저 볶고, 채 썬 당근과 양파를 더하고, 마지막으로 쌀과 물을 넣습니다. 뚜껑 없이 물이 모두 흡수될 때까지 조리하며, 통마늘을 쌀에 꽂습니다. 캐러멜화된 당근과 향신료(쿠민, 고수)의 향기가 독특합니다.\\n\\n플로프는 공용 솥에서 큰 접시에 담아 제공하며 토마토·양파 샐러드를 곁들입니다. 우즈베키스탄에서 플로프 조리는 남성의 영역입니다.",
      hi: "उज़्बेक पलोव मध्य एशिया के चावल व्यंजनों का राजा है — एक लोहे की बड़ी कड़ाही में पहले मेमना या बीफ भेड़ की पूंछ की चर्बी (या वनस्पति तेल) में तला जाता है, फिर जूलियन गाजर और प्याज़ डाले जाते हैं, फिर चावल और पानी। सब कुछ बिना ढके पकाया जाता है जब तक पानी सोख न जाए, चावल में पूरा लहसुन घुसाया जाता है। कैरेमेलाइज़्ड गाजर और मसालों (जीरा, धनिया) की सुगंध अद्वितीय होती है।\\n\\nपलोव को साझा कड़ाही से एक बड़ी थाली में परोसा जाता है, साथ में टमाटर और प्याज़ का सलाद। उज़्बेकिस्तान में पलोव पकाना पुरुषों का क्षेत्र है। शादियों में एक उस्ताद रसोइया (ओशपाज़) हज़ारों मेहमानों के लिए एक बार में सौ किलोग्राम पका सकता है।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 152 done")
