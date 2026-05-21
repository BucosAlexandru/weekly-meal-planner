with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add hi to origin
content = content.replace(
    '      ko: "모로코"\n    },\n    name: {\n      ro: "Tagine"',
    '      ko: "모로코",\n      hi: "मोरक्को"\n    },\n    name: {\n      ro: "Tagine"'
)

# Add hi to name
content = content.replace(
    '      ko: "타진"\n    },\n    category: {\n      ro: "Cină"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["carne de miel"',
    '      ko: "타진",\n      hi: "ताजिन"\n    },\n    category: {\n      ro: "Cină"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["carne de miel"'
)

# Add hi to category — Tagine's ja is 夕食 like Lomo Saltado — need unique context
content = content.replace(
    '      ja: "夕食",\n      tr: "Akşam yemeği",\n      it: "Cena",\n      ko: "저녁"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["carne de miel"',
    '      ja: "夕食",\n      tr: "Akşam yemeği",\n      it: "Cena",\n      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["carne de miel"'
)

# Add hi to ingredients
content = content.replace(
    '      ko: ["양고기", "병아리콩", "말린 살구", "양파", "당근", "계피", "향신료"]\n    },\n    howIsMade: {',
    '      ko: ["양고기", "병아리콩", "말린 살구", "양파", "당근", "계피", "향신료"],\n      hi: ["मेमने का मांस", "चना दाल", "सूखे खुबानी", "प्याज़", "गाजर", "दालचीनी", "मसाले"]\n    },\n    howIsMade: {'
)

# Add hi to howIsMade
content = content.replace(
    '      ko: "양고기나 닭고기를 채소, 말린 과일, 향신료, 소량의 물과 함께 뚜껑이 있는 타진 냄비에서 약한 불로 천천히 조리합니다."\n    },\n    originText: {\n      ro: "Tagine este',
    '      ko: "양고기나 닭고기를 채소, 말린 과일, 향신료, 소량의 물과 함께 뚜껑이 있는 타진 냄비에서 약한 불로 천천히 조리합니다.",\n      hi: "मांस (आमतौर पर मेमना या मुर्गी) को सब्ज़ियों, सूखे फलों, मसालों और थोड़े पानी के साथ ढके ताजिन बर्तन में धीरे-धीरे पकाएं।"\n    },\n    originText: {\n      ro: "Tagine este'
)

# Replace originText
old_origin = '''    originText: {
      ro: "Tagine este o rețetă tradițională din Maroc.",
      en: "Tagine is a traditional recipe from Morocco.",
      es: "Tajine es una receta tradicional de Marruecos.",
      fr: "Tajine est une recette traditionnelle du Maroc.",
      de: "Tajine ist ein traditionelles Rezept aus Marokko.",
      pt: "Tagine é uma receita tradicional do Marrocos.",
      ru: "Тажин — традиционный рецепт из Марокко.",
      ar: "طاجين هي وصفة تقليدية من المغرب.",
      zh: "摩洛哥塔吉锅 是来自摩洛哥的传统食谱。",
      ja: "タジン はモロッコの伝統的なレシピです。",
      tr: "Tagine Fas kökenli geleneksel bir tariftir.",
      it: "Tagine è una ricetta tradizionale del Marocco.",
      ko: "타진은 모로코의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Tagine îşi ia numele de la vasul conic de lut în care se gătește — un design rămas practic neschimbat de-a lungul secolelor de bucătărie marocană și nord-africană. Conul captează aburul și îl redirecționează asupra ingredientelor, producând o carne fragedă fără să se usuce și un sos concentrat care nu necesită îngroșare. Mielul este proteina tradițională, deși tagine-urile de pui sau pește sunt la fel de răspândite.\\n\\nCeea ce face tagine-ul marocan distinctiv este interacțiunea dintre sărat și dulce: lămâi conservate, măsline, caise uscate sau prune alături de condimente calde ca ras el hanout, chimen și ghimbir. Ritmul lent al gătirii și vasul însuși sunt la fel de importante ca orice ingredient.",
      en: "Tagine takes its name from the conical earthenware vessel in which it is cooked — a design that has remained essentially unchanged across centuries of Moroccan and North African cooking. The cone traps rising steam and returns moisture to the ingredients below, producing meat that falls apart without drying out and a concentrated sauce that needs no thickening. Lamb is the most traditional protein, though chicken and fish tagines are equally common.\\n\\nWhat makes Moroccan tagine distinctive is the interplay of savoury and sweet: preserved lemons, olives, dried apricots, or prunes appear alongside warm spices such as ras el hanout, cumin, and ginger. The slow pace of cooking and the vessel itself are as much part of the recipe as any single ingredient.",
      es: "Tajine toma su nombre del recipiente cónico de barro en el que se cocina — un diseño que ha permanecido esencialmente inalterado a lo largo de siglos de cocina marroquí y norteafricana. El cono atrapa el vapor ascendente y devuelve la humedad a los ingredientes, produciendo una carne que se deshace sin resecarse y una salsa concentrada que no necesita espesante. El cordero es la proteína más tradicional, aunque los tajines de pollo o pescado son igualmente comunes.\\n\\nLo que hace distintivo al tajine marroquí es la interacción entre lo salado y lo dulce: limones en conserva, aceitunas, albaricoques secos o ciruelas junto a especias cálidas como ras el hanout, comino y jengibre.",
      fr: "Le tajine tire son nom du récipient en terre cuite conique dans lequel il cuit — un design resté essentiellement inchangé au fil des siècles de cuisine marocaine et nord-africaine. Le cône capture la vapeur montante et renvoie l'humidité vers les ingrédients, produisant une viande qui s'effrite sans se dessécher et une sauce concentrée sans besoin d'épaississement. L'agneau est la protéine la plus traditionnelle, bien que les tajines de poulet et de poisson soient tout aussi courants.\\n\\nCe qui rend le tajine marocain distinctif est le jeu entre salé et sucré : citrons confits, olives, abricots secs ou pruneaux aux côtés d'épices chaudes comme le ras el hanout, le cumin et le gingembre.",
      de: "Tagine trägt den Namen des konischen Tontopfes, in dem es gegart wird — ein Design, das sich in Jahrhunderten marokkanischer und nordafrikanischer Küche kaum verändert hat. Der Kegel fängt den aufsteigenden Dampf und leitet ihn zurück auf die Zutaten, wodurch das Fleisch zart wird ohne auszutrocknen und eine konzentrierte Sauce entsteht, die kein Andicken benötigt. Lamm ist das traditionellste Protein, obwohl Hühner- und Fisch-Tagines ebenso verbreitet sind.\\n\\nWas marokkanisches Tagine auszeichnet, ist das Zusammenspiel von herzhaft und süß: eingelegte Zitronen, Oliven, getrocknete Aprikosen oder Pflaumen neben warmen Gewürzen wie Ras el Hanout, Kreuzkümmel und Ingwer.",
      pt: "Tagine recebe o nome do recipiente cônico de barro em que é cozinhado — um design que permaneceu essencialmente inalterado ao longo de séculos de culinária marroquina e norte-africana. O cone captura o vapor ascendente e devolve a umidade aos ingredientes, produzindo carne que se desfaz sem ressecar e um molho concentrado que dispensa espessante. O cordeiro é a proteína mais tradicional, embora tagines de frango ou peixe sejam igualmente comuns.\\n\\nO que torna o tagine marroquino distintivo é a interação entre salgado e doce: limões em conserva, azeitonas, damascos secos ou ameixas ao lado de especiarias quentes como ras el hanout, cominho e gengibre.",
      ru: "Тажин получил название от конического глиняного горшка, в котором готовится — дизайн, практически не изменившийся за века марокканской и североафриканской кухни. Конус улавливает пар и возвращает влагу ингредиентам, производя мясо, которое распадается без пересыхания, и концентрированный соус, не требующий загущения. Баранина — самый традиционный белок, хотя тажины из курицы и рыбы столь же распространены.\\n\\nМарокканский тажин отличается взаимодействием солёного и сладкого: консервированные лимоны, оливки, курага или чернослив рядом с тёплыми специями — рас-эль-ханут, тмином и имбирём.",
      ar: "يأخذ الطاجين اسمه من الإناء الفخاري المخروطي الذي يُطهى فيه — تصميم ظلّ دون تغيير يُذكر عبر قرون من الطبخ المغربي وشمال أفريقيا. يحبس المخروط البخار المتصاعد ويعيد الرطوبة إلى المكونات، منتجاً لحماً طرياً دون أن يجفّ وصلصة مركّزة لا تحتاج إلى تكثيف. الضأن هو البروتين الأكثر تقليدية، وإن كانت طواجن الدجاج والسمك شائعة بالقدر ذاته.\\n\\nما يميّز الطاجين المغربي هو التوازن بين المالح والحلو: الليمون المخلّل والزيتون والمشمش المجفف والخوخ إلى جانب البهارات الدافئة كرأس الحانوت والكمون والزنجبيل.",
      zh: "塔吉锅以其烹饪所用的锥形陶器命名——这一设计历经数百年摩洛哥及北非烹饪传统基本未变。锥形顶部汇聚上升的蒸汽，将水分回返食材，使肉质软烂而不失水分，熬出的酱汁浓缩无需另行增稠。羊肉是最传统的食材，但鸡肉和鱼肉塔吉也同样常见。\\n\\n摩洛哥塔吉锅的独特之处在于咸甜的交织：腌制柠檬、橄榄、干杏或西梅与拉斯哈努特、孜然、生姜等暖香料相辅相成。缓慢的烹饪节奏和锅具本身与任何单一食材一样，都是这道菜不可或缺的一部分。",
      ja: "タジンはそれを調理する円錐形の陶器の名にちなんでいます——モロッコと北アフリカの料理において何世紀にもわたりほぼ変わっていないデザインです。円錐は上昇する蒸気を閉じ込めて食材に戻し、乾燥せずにほぐれる肉と、とろみをつけなくても濃厚なソースを生み出します。ラム肉が最も伝統的なタンパク源ですが、鶏や魚のタジンも同じくらい一般的です。\\n\\nモロッコのタジンを際立たせるのは塩味と甘みの掛け合いです：塩漬けレモン、オリーブ、ドライアプリコットや干しプルーンが、ラス・エル・ハヌート、クミン、ジンジャーなどの温かいスパイスと共に使われます。",
      tr: "Tagine adını içinde pişirildiği konik toprak kaptan alır — Fas ve Kuzey Afrika mutfağının yüzyıllar boyunca özünde değişmeden kalan bir tasarım. Koni, yükselen buharı tutar ve nemi malzemelere geri döndürür; böylece kurumadan dağılan bir et ve koyulaştırma gerektirmeyen konsantre bir sos elde edilir. Kuzu en geleneksel protein olmakla birlikte tavuk ve balık tagineları da en az kuzu kadar yaygındır.\\n\\nFas taginesini ayırt edici kılan, tuzlu ile tatlının etkileşimidir: tuzlanmış limonlar, zeytinler, kuru kayısılar ya da erikler, ras el hanout, kimyon ve zencefil gibi sıcak baharatların yanında yer alır.",
      it: "Tagine prende il nome dal recipiente conico in terracotta in cui viene cotto — un design rimasto essenzialmente invariato nel corso di secoli di cucina marocchina e nordafricana. Il cono intrappola il vapore e lo ridistribuisce sugli ingredienti, producendo una carne che si sfalda senza seccarsi e un sugo concentrato che non richiede addensanti. L'agnello è la proteina più tradizionale, sebbene i tagine di pollo e pesce siano ugualmente comuni.\\n\\nCiò che rende distintivo il tagine marocchino è l'interazione tra salato e dolce: limoni conservati, olive, albicocche secche o prugne accanto a spezie calde come ras el hanout, cumino e zenzero.",
      ko: "타진은 요리에 사용되는 원뿔형 토기 용기의 이름을 따온 것으로, 수 세기에 걸친 모로코 및 북아프리카 요리에서 본질적으로 변하지 않은 디자인입니다. 원뿔은 상승하는 증기를 가두어 재료에 수분을 돌려보내, 건조되지 않고 부드럽게 흐물어지는 고기와 걸쭉하게 할 필요 없는 진한 소스를 만들어냅니다.\\n\\n모로코 타진의 특징은 짭조름함과 달콤함의 조화입니다. 보존 레몬, 올리브, 건자두나 건살구가 라스 엘 하누트, 커민, 생강 같은 따뜻한 향신료와 어우러집니다. 느린 조리 속도와 그릇 자체도 어느 재료 못지않게 레시피의 일부입니다.",
      hi: "ताजिन अपना नाम उस शंक्वाकार मिट्टी के बर्तन से लेता है जिसमें इसे पकाया जाता है — एक ऐसा डिज़ाइन जो सदियों से मोरक्कन और उत्तर अफ्रीकी खाना पकाने में लगभग अपरिवर्तित रहा है। शंकु उठते हुए भाप को रोककर सामग्री पर वापस लौटाता है, जिससे मांस बिना सूखे नरम होता है और सॉस गाढ़ी बिना किसी गाढ़ेपन के तैयार होती है।\\n\\nमोरक्कन ताजिन की विशेषता नमकीन और मीठे का संगम है: नमकीन नींबू, जैतून, सूखे खुबानी या बेर, रस-एल-हनूत, जीरा और अदरक जैसे गर्म मसालों के साथ। धीमी पकाने की गति और बर्तन स्वयं उतने ही महत्वपूर्ण हैं जितना कोई भी एकल सामग्री।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 118 done")
