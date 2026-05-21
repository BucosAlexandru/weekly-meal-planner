with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add hi to origin
content = content.replace(
    '      ko: "조지아"\n    },\n    name: {\n      ro: "Chakhokhbili"',
    '      ko: "조지아",\n      hi: "जॉर्जिया"\n    },\n    name: {\n      ro: "Chakhokhbili"'
)

# Add hi to name
content = content.replace(
    '      ko: "차호흐빌리"\n    },\n    category: {',
    '      ko: "차호흐빌리",\n      hi: "चाखोखबिली"\n    },\n    category: {'
)

# Add hi to category
content = content.replace(
    '      ko: "저녁"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["pui", "ceapă"',
    '      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    servings: 4,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["pui", "ceapă"'
)

# Add hi to ingredients
content = content.replace(
    '      ko: ["닭고기", "양파", "토마토", "파프리카", "마늘", "파슬리", "기름", "소금", "고추", "고수"]\n    },\n    howIsMade: {',
    '      ko: ["닭고기", "양파", "토마토", "파프리카", "마늘", "파슬리", "기름", "소금", "고추", "고수"],\n      hi: ["मुर्गी", "प्याज़", "टमाटर", "शिमला मिर्च", "लहसुन", "अजमोद", "तेल", "नमक", "काली मिर्च", "धनिया"]\n    },\n    howIsMade: {'
)

# Add hi to howIsMade
content = content.replace(
    '      ko: "양파와 닭고기를 볶은 후 파프리카와 토마토를 넣고 향신료와 허브를 곁들여 천천히 조리합니다. 따뜻하게 빵과 함께 제공합니다."\n    },\n    originText: {\n      ro: "Chakhokhbili este',
    '      ko: "양파와 닭고기를 볶은 후 파프리카와 토마토를 넣고 향신료와 허브를 곁들여 천천히 조리합니다. 따뜻하게 빵과 함께 제공합니다.",\n      hi: "प्याज़ और मुर्गी को तेल में भूनें, शिमला मिर्च और टमाटर डालें, मसाले और जड़ी-बूटियों के साथ धीमी आंच पर पकाएं। गर्मागर्म, रोटी के साथ परोसें।"\n    },\n    originText: {\n      ro: "Chakhokhbili este'
)

# Replace originText
old_origin = '''    originText: {
      ro: "Chakhokhbili este o rețetă tradițională din Georgia.",
      en: "Chakhokhbili is a traditional recipe from Georgia.",
      es: "Chakhokhbili es una receta tradicional de Georgia.",
      fr: "Chakhokhbili est une recette traditionnelle de Géorgie.",
      de: "Chakhokhbili ist ein traditionelles Rezept aus Georgien.",
      pt: "Chakhokhbili é uma receita tradicional da Geórgia.",
      ru: "Чахохбили — традиционный рецепт из Грузии.",
      ar: "تشاخوخبيلي هي وصفة تقليدية من جورجيا.",
      zh: "格鲁吉亚炖鸡 是来自格鲁吉亚的传统食谱。",
      ja: "チャホフビリ はジョージアの伝統的なレシピです。",
      tr: "Chakhokhbili Gürcistan kökenli geleneksel bir tariftir.",
      it: "Chakhokhbili è una ricetta tradizionale della Georgia.",
      ko: "차호흐빌리는 조지아의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Chakhokhbili este o tocăniță georgiană de pui al cărei nume vine de la cuvântul pentru fazan — khokhobi — reflectând vremuri în care preparatul se făcea cu vânat sălbatic. Tehnica de gătire este distinctiv georgiană: carnea se rumenește mai întâi uscată într-o oală fierbinte, fără ulei sau lichid, pentru a adânci aroma prin contact direct cu fundul vasului.\\n\\nRoșiile proaspete, ceapa și un amestec de condimente georgiene — schinduf albastru și khmeli-suneli — se adaugă în etape. Mâini generoase de coriandru și pătrunjel se amestecă la final. Tocănița este bogată, aromată și ușor acrișoară — servită de obicei cu pâine georgiană sau brânză suluguni.",
      en: "Chakhokhbili is a Georgian braised chicken stew whose name traces back to the word for pheasant — khokhobi — reflecting an era when the dish was made with wild game. The cooking technique is distinctively Georgian: the meat is first browned dry in a hot pot, without any oil or liquid, to deepen its flavour through direct contact with the pan.\\n\\nFresh tomatoes, onion, and a blend of Georgian spices including blue fenugreek and khmeli-suneli are added in stages. Handfuls of fresh coriander and parsley stir in at the end. The stew is rich, aromatic, and slightly tangy from the tomatoes — typically served with Georgian flatbread or sulguni cheese.",
      es: "Chakhokhbili es un estofado georgiano de pollo cuyo nombre se remonta a la palabra para faisán — khokhobi — que refleja una época en que el plato se hacía con caza silvestre. La técnica es distintivamente georgiana: la carne se dora primero en seco en una olla caliente, sin aceite ni líquido, para profundizar su sabor por contacto directo con el fondo.\\n\\nLos tomates frescos, la cebolla y una mezcla de especias georgianas como el fenogreco azul y el khmeli-suneli se añaden en etapas. Grandes puñados de cilantro y perejil frescos se mezclan al final. El guiso es rico, aromático y ligeramente ácido.",
      fr: "Chakhokhbili est un ragoût géorgien de poulet dont le nom remonte au mot désignant le faisan — khokhobi — témoignant d'une époque où le plat se préparait avec du gibier. La technique est typiquement géorgienne : la viande est d'abord dorée à sec dans une cocotte chaude, sans huile ni liquide, pour développer sa saveur par contact direct avec le fond.\\n\\nLes tomates fraîches, l'oignon et un mélange d'épices géorgiennes dont le fenugrec bleu et le khmeli-suneli s'ajoutent par étapes. De généreuses poignées de coriandre et de persil frais sont incorporées en fin de cuisson.",
      de: "Chakhokhbili ist ein georgischer Hähncheneintopf, dessen Name auf das Wort für Fasan — khokhobi — zurückgeht und an eine Zeit erinnert, als das Gericht mit Wild zubereitet wurde. Die Kochtechnik ist typisch georgisch: Das Fleisch wird zunächst trocken in einem heißen Topf angebraten, ohne Öl oder Flüssigkeit, um durch direkten Kontakt mit dem Topfboden Aroma zu entwickeln.\\n\\nFrische Tomaten, Zwiebeln und eine Mischung georgischer Gewürze — blauer Bockshornklee und Khmeli-Suneli — werden in Etappen zugegeben. Am Ende kommen großzügige Mengen frischer Koriander und Petersilie dazu. Der Eintopf ist reichhaltig, aromatisch und leicht säuerlich.",
      pt: "Chakhokhbili é um ensopado georgiano de frango cujo nome remonta à palavra para faisão — khokhobi — refletindo uma época em que o prato era feito com caça. A técnica é distintivamente georgiana: a carne é dourada a seco em uma panela quente, sem óleo ou líquido, para aprofundar o sabor pelo contato direto com o fundo.\\n\\nTomates frescos, cebola e uma mistura de especiarias georgianas incluindo feno-grego azul e khmeli-suneli são adicionados em etapas. Generosas porções de coentro e salsa frescos são misturadas ao final. O ensopado é rico, aromático e ligeiramente ácido.",
      ru: "Чахохбили — грузинское тушёное блюдо из курицы, название которого восходит к слову «фазан» — хохоби — напоминая о временах, когда готовили из дичи. Техника приготовления по-грузински: сначала мясо обжаривают насухо в горячей кастрюле, без масла и жидкости, чтобы добиться глубины вкуса через прямой контакт с дном.\\n\\nСвежие помидоры, лук и смесь грузинских специй — голубой пажитник и хмели-сунели — добавляются поэтапно. В конце вмешивают щедрые горсти свежей кинзы и петрушки. Рагу получается насыщенным, ароматным и чуть кисловатым от томатов — подают с грузинским хлебом или сыром сулугуни.",
      ar: "تشاخوخبيلي هو يخنة دجاج جورجية يعود اسمها إلى كلمة الدراج — خوخوبي — مما يعكس حقبة كان الطبق فيها يُعدّ من لحم الطرائد. التقنية جورجية بامتياز: يُحمر اللحم أولاً جافاً في قدر ساخنة دون زيت أو سائل، لتعميق النكهة بالتلامس المباشر مع القاع.\\n\\nتُضاف الطماطم الطازجة والبصل ومزيج من البهارات الجورجية — الحلبة الزرقاء والخميلي سونيلي — على مراحل. تُضاف حفنات سخية من الكزبرة والبقدونس الطازجين في النهاية. اليخنة غنية وعطرة وحامضة قليلاً.",
      zh: "查霍赫比利是格鲁吉亚炖鸡菜肴，其名称可追溯至「野鸡」一词——khokhobi——反映了昔日用野味烹制的年代。烹饪手法极具格鲁吉亚特色：鸡肉先在热锅中干煸，不加油或水，通过与锅底直接接触来加深风味。\\n\\n新鲜番茄、洋葱及包含蓝葫芦巴、格鲁吉亚综合香料khmeli-suneli的混合调料分阶段加入，最后大把新鲜香菜和欧芹拌入其中。这道炖菜浓郁芳香、略带番茄酸味，通常配格鲁吉亚薄饼或苏鲁古尼奶酪享用。",
      ja: "チャホフビリはジョージアのチキン煮込みで、その名は「キジ」を意味するkhokhobi に由来し、かつて野鳥で作られていた時代を反映しています。調理法はジョージア独特で、まず油も液体も加えずに熱した鍋で肉を乾煎りし、直接接触で旨味を引き出します。\\n\\n新鮮なトマト、玉ねぎ、ブルーフェヌグリークやフメリスネリなどジョージアのスパイスを段階的に加え、最後に大量の新鮮なコリアンダーとパセリを加えます。煮込みは濃厚で香り高く、トマトから来るほどよい酸味があります。",
      tr: "Chakhokhbili, adını sülün anlamına gelen khokhobi sözcüğünden alan ve bir zamanlar av hayvanıyla yapıldığını hatırlatan Gürcü tavuk yahnisidir. Pişirme tekniği özgün Gürcü tarzındadır: et önce yağsız ve sıvısız sıcak bir tencerede kuru olarak kızartılır; tavaya doğrudan temas yoluyla derin bir aroma kazanır.\\n\\nTaze domates, soğan ve mavi çemen otu ile khmeli-suneli gibi Gürcü baharatları aşamalı olarak eklenir. Sonunda bol taze kişniş ve maydanoz karıştırılır. Yahni zengin, aromatik ve hafif ekşi bir yapıdadır — genellikle Gürcü ekmeği ya da sulguni peyniriyle servis edilir.",
      it: "Chakhokhbili è uno stufato georgiano di pollo il cui nome risale alla parola per fagiano — khokhobi — che ricorda un'epoca in cui il piatto veniva preparato con selvaggina. La tecnica di cottura è tipicamente georgiana: la carne viene prima rosolata a secco in una pentola calda, senza olio né liquido, per sviluppare sapore attraverso il contatto diretto con il fondo.\\n\\nPomodori freschi, cipolla e un mix di spezie georgiane tra cui fieno greco blu e khmeli-suneli vengono aggiunti a stadi. Abbondante coriandolo e prezzemolo freschi vengono mescolati alla fine. Lo stufato è ricco, aromatico e leggermente acidulo.",
      ko: "차호흐빌리는 '꿩'을 뜻하는 khokhobi에서 이름을 따온 조지아 닭고기 찜 요리로, 한때 야생 조류로 만들던 시대를 반영합니다. 조지아 특유의 조리법으로 고기를 먼저 기름과 물 없이 뜨거운 냄비에서 건식 굽기하여 직접 접촉으로 깊은 풍미를 냅니다.\\n\\n신선한 토마토, 양파, 블루 호로파와 흐멜리-수넬리 등 조지아 향신료 믹스를 단계적으로 추가하고, 마지막에 신선한 고수와 파슬리를 넉넉히 넣습니다. 찜은 진하고 향긋하며 토마토에서 오는 약간의 새콤함이 있어, 보통 조지아 납작빵이나 술구니 치즈와 함께 냅니다.",
      hi: "चाखोखबिली एक जॉर्जियाई ब्रेज़्ड चिकन स्टू है जिसका नाम तीतर के जॉर्जियाई शब्द — खोखोबी — से आता है, जो उस युग की याद दिलाता है जब यह व्यंजन जंगली शिकार से बनाया जाता था। खाना पकाने की विधि विशिष्ट रूप से जॉर्जियाई है: मांस को पहले बिना तेल या तरल के गर्म बर्तन में सूखा भूना जाता है।\\n\\nताज़े टमाटर, प्याज़ और जॉर्जियाई मसाले — नीला मेथी और खमेली-सुनेली — चरणों में डाले जाते हैं। अंत में ताज़े धनिया और अजमोद की भरपूर मात्रा मिलाई जाती है। स्टू समृद्ध, सुगंधित और हल्का खट्टा होता है — आमतौर पर जॉर्जियाई फ्लैटब्रेड या सुल्गुनी पनीर के साथ परोसा जाता है।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 116 done")
