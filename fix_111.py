data = open('public/js/recipes.js', 'r', encoding='utf-8').read()

# Add hi to origin
data = data.replace(
    '      ko: "멕시코"\n    },\n    name: {\n      ro: "Tamale"',
    '      ko: "멕시코",\n      hi: "मेक्सिको"\n    },\n    name: {\n      ro: "Tamale"',
    1
)

# Add hi to name
data = data.replace(
    '      ko: "타말레"\n    },\n    category: {',
    '      ko: "타말레",\n      hi: "तामाले"\n    },\n    category: {',
    1
)

# Add hi to category (Dinner — Mexico block)
data = data.replace(
    '      ko: "저녁"\n    },\n    servings: 4,\n    tipType: \'def\',\n    pairingsType: \'def\',\n    ingredients: {\n      ro: ["mălai"',
    '      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    servings: 4,\n    tipType: \'def\',\n    pairingsType: \'def\',\n    ingredients: {\n      ro: ["mălai"',
    1
)

# Add hi to ingredients
data = data.replace(
    '      ko: ["옥수숫가루", "라드", "물", "고기 또는 채소 속재료", "옥수수 껍질"]\n    },\n    howIsMade: {',
    '      ko: ["옥수숫가루", "라드", "물", "고기 또는 채소 속재료", "옥수수 껍질"],\n      hi: ["मक्के का आटा", "घी/चर्बी", "पानी", "मांस या सब्जी भरावन", "मक्के की पत्तियां"]\n    },\n    howIsMade: {',
    1
)

# Add hi to howIsMade
data = data.replace(
    '      ko: "옥수숫가루에 라드와 물을 섞어 반죽을 만든 후 옥수수 껍질 위에 속재료를 올리고 돌돌 말아 쪄서 굳힙니다."\n    },\n    originText: {',
    '      ko: "옥수숫가루에 라드와 물을 섞어 반죽을 만든 후 옥수수 껍질 위에 속재료를 올리고 돌돌 말아 쪄서 굳힙니다.",\n      hi: "मक्के के आटे को घी और पानी से मिलाएं, मक्के की पत्तियों पर भरावन रखें, लपेटें और भाप में तब तक पकाएं जब तक वह जम न जाए।"\n    },\n    originText: {',
    1
)

# Replace originText
old_ot = '''    originText: {
      ro: "Tamale este o rețetă tradițională din Mexic.",
      en: "Tamale is a traditional recipe from Mexico.",
      es: "Tamal es una receta tradicional de México.",
      fr: "Tamale est une recette traditionnelle du Mexique.",
      de: "Tamale ist ein traditionelles Rezept aus Mexiko.",
      pt: "Tamale é uma receita tradicional do México.",
      ru: "Тамале — традиционный рецепт из Мексики.",
      ar: "تامالي هي وصفة تقليدية من المكسيك.",
      zh: "玉米粽 是来自墨西哥的传统食谱。",
      ja: "タマーレ はメキシコの伝統的なレシピです。",
      tr: "Tamale Meksika kökenli geleneksel bir tariftir.",
      it: "Tamale è una ricetta tradizionale del Messico.",
      ko: "타말레는 멕시코의 전통 요리입니다."
    }'''

new_ot = '''    originText: {
      ro: "Tamale este unul dintre cele mai vechi preparate alimentare din Mesoamerica, datând cu câteva mii de ani înainte de contactul european. Este construit din masa — aluat de porumb din boabe nixtamalizate, înmuiate în apă de var — amestecat cu untură până aluatul devine suficient de ușor. Această masa se întinde pe frunze de porumb, se umple, se înfășoară și se fierbe la abur până aluatul se întărește în jurul umpluturii.\\n\\nUmpluturile variază mult în regiunile Mexicului: mole negro cu pui, carne de porc în salsa roja, rajas cu brânză sau versiuni dulci cu scorțișoară. Prepararea tamale-elor este intensivă comunitar — familiile se adună pentru tamaladas, procesul colectiv de întins și împăturit — și preparatul este strâns asociat cu sărbătorile și perioadele festive.",
      en: "The tamale is one of Mesoamerica\'s oldest prepared foods, dating back several thousand years before European contact. It is built from masa — corn dough made from nixtamalized kernels, their hulls softened in limewater — mixed with lard until the dough becomes light. This masa is spread on a corn husk, filled, wrapped, and steamed until the dough sets firm around its filling.\\n\\nFillings vary widely across Mexico\'s regions: mole negro with chicken, pork in salsa roja, rajas with cheese, or sweet versions scented with cinnamon. Tamale-making is communally intensive — families gather for tamaladas, the collective process of spreading masa and folding husks — and the dish is closely associated with holidays and the period before Christmas known as Las Posadas.",
      es: "El tamal es uno de los alimentos preparados más antiguos de Mesoamérica, con varios miles de años antes del contacto europeo. Se construye con masa — masa de maíz hecha de granos nixtamalizados, con cáscaras ablandadas en agua de cal — mezclada con manteca hasta que la masa se aligera. Esta masa se extiende sobre una hoja de maíz, se rellena, se envuelve y se cuece al vapor hasta que la masa se solidifica alrededor del relleno.\\n\\nLos rellenos varían ampliamente según las regiones de México: mole negro con pollo, carne de cerdo en salsa roja, rajas con queso o versiones dulces con canela. Hacer tamales es intenso comunitariamente — las familias se reúnen para tamaladas, el proceso colectivo de extender masa y doblar hojas — y el plato está estrechamente asociado con las festividades y Las Posadas.",
      fr: "Le tamale est l\'un des aliments préparés les plus anciens de Mésoamérique, datant de plusieurs milliers d\'années avant le contact européen. Il est construit à partir de masa — pâte de maïs faite à partir de grains nixtamalisés, leurs enveloppes ramollies dans de l\'eau de chaux — mélangée avec du saindoux jusqu\'à ce que la pâte devienne légère. Cette masa est étalée sur une feuille de maïs, garnie, enroulée et cuite à la vapeur jusqu\'à ce que la pâte se solidifie autour de la garniture.\\n\\nLes garnitures varient largement selon les régions du Mexique : mole negro au poulet, porc en salsa roja, rajas au fromage ou versions sucrées parfumées à la cannelle. La confection des tamales est intense communautairement — les familles se réunissent pour les tamaladas, le processus collectif d\'étalement et de pliage — et le plat est étroitement associé aux fêtes et à la période des Posadas.",
      de: "Das Tamale ist eines der ältesten zubereiteten Lebensmittel Mesoamerikas und stammt aus mehreren tausend Jahren vor dem europäischen Kontakt. Es wird aus Masa hergestellt — Maismeigelbrei aus nixtamalisierten Körnern, deren Schalen in Kalkwasser erweicht wurden — gemischt mit Schmalz, bis der Teig leicht wird. Diese Masa wird auf ein Maisblatt gestrichen, befüllt, eingerollt und gedämpft, bis der Teig um die Füllung fest wird.\\n\\nFüllungen variieren stark in Mexikos Regionen: Mole negro mit Hähnchen, Schweinefleisch in Salsa roja, Rajas mit Käse oder süße Varianten mit Zimt. Tamale-Herstellung ist gemeinschaftlich intensiv — Familien treffen sich für Tamaladas, den kollektiven Prozess des Streichens und Faltens — und das Gericht ist eng mit Feiertagen und der Zeit vor Weihnachten verbunden.",
      pt: "O tamale é um dos alimentos preparados mais antigos da Mesoamérica, remontando a vários milhares de anos antes do contato europeu. É feito de masa — massa de milho feita de grãos nixtamalizados, com cascas amolecidas em água de cal — misturada com banha até a massa ficar leve. Essa masa é espalhada em folha de milho, recheada, enrolada e cozida no vapor até a massa solidificar ao redor do recheio.\\n\\nOs recheios variam amplamente pelas regiões do México: mole negro com frango, carne de porco em salsa roja, rajas com queijo ou versões doces perfumadas com canela. Fazer tamales é coletivamente intensivo — as famílias se reúnem para tamaladas, o processo coletivo de espalhar masa e dobrar folhas — e o prato está intimamente associado às festas e ao período das Posadas.",
      ru: "Тамале — одно из самых древних приготовленных блюд Мезоамерики, насчитывающее несколько тысяч лет до европейского контакта. Оно готовится из масы — кукурузного теста из никстамализованных зёрен, оболочки которых размягчены в известковой воде — смешанной со смальцем до лёгкости. Эту масу намазывают на кукурузный лист, кладут начинку, заворачивают и готовят на пару, пока тесто не затвердеет.\\n\\nНачинки сильно варьируются по регионам Мексики: моле негро с курицей, свинина в сальсе рохе, рахас с сыром или сладкие варианты с корицей. Приготовление тамале — коллективный, трудоёмкий процесс: семьи собираются на тамалады, где вместе намазывают масу и складывают листья. Блюдо тесно связано с праздниками и периодом Посад перед Рождеством.",
      ar: "التامالي هو أحد أقدم الأطعمة المحضَّرة في أمريكا الوسطى، يعود تاريخه إلى آلاف السنين قبل التواصل الأوروبي. يُبنى من عجينة الماسا — عجين الذرة المصنوع من حبوب منيكستمالية مُلطَّفة في ماء الجير — تُعجن بالدهن حتى تصبح خفيفة. تُفرد هذه الماسا على ورقة ذرة، تُحشى، تُلفّ وتُطهى بالبخار حتى يتصلّب العجين حول الحشوة.\\n\\nتتنوع الحشوات تنوعاً كبيراً عبر مناطق المكسيك: موله نيغرو مع الدجاج، ولحم الخنزير في السالسا روخا، والراخاس بالجبن، أو نسخ حلوة بالقرفة. صنع التامالي عمل مجتمعي مكثف — تجتمع الأسر لتاماداس، العملية الجماعية لفرد الماسا وطيّ الأوراق — ويرتبط الطبق ارتباطاً وثيقاً بالأعياد وموسم لاس بوساداس.",
      zh: "玉米粽是中美洲最古老的预制食品之一，比欧洲接触早数千年。它由玛萨（masa）制成——用石灰水软化外壳的灰化玉米粒制成的玉米面团——与猪油混合直至面团变轻盈。玛萨铺在玉米叶上，填入馅料，包裹后蒸制，直到面团在馅料周围定型。\\n\\n墨西哥各地区的馅料差异很大：带鸡肉的墨雷酱、红莎莎酱猪肉、带奶酪的辣椒条，或肉桂香甜版本。制作玉米粽是集体劳动——家庭聚集在一起举行"塔马拉达斯"，集体铺玛萨和折叶——这道菜与节日和圣诞前的"波萨达斯"时期密切相关。",
      ja: "タマーレはメソアメリカ最古の調理済み食品の一つで、欧州接触から数千年前に遡る。ニクスタマライズした粒子のトウモロコシ生地（マサ）——殻を石灰水で軟らかくしたもの——をラードと混ぜて軽くなるまでこねる。このマサをトウモロコシの皮に広げ、具を入れ、包んで蒸し、生地が具の周りで固まるまで加熱する。\\n\\n具はメキシコの地域によって大きく異なる：チキンのモレ・ネグロ、サルサ・ロハの豚肉、チーズのラハス、あるいはシナモンの香りがする甘いバージョンなど。タマーレ作りは共同作業として集約的——家族が集まってタマラダスを行い、マサを広げて皮を折る——クリスマス前の時期ラス・ポサダスと強く結びついている。",
      tr: "Tamale, Avrupa temasından binlerce yıl önce tarihlendirilmiş Mezoamerika\'nın en eski hazırlanmış yiyeceklerinden biridir. Kireç suyunda kabuğu yumuşatılmış nixtamalleştirilmiş tanelerden yapılan mısır hamuru olan masa\'dan oluşur; hamur kabuk hafifleşene kadar domuz yağıyla karıştırılır. Bu masa bir mısır yaprağı üzerine yayılır, doldurulur, sarılır ve hamurun dolgunun etrafında sertleşmesine kadar buharda pişirilir.\\n\\nİç harclar Meksika\'nın bölgelerine göre büyük farklılıklar gösterir: tavuklu mole negro, salsa roja\'da domuz eti, peynirli rajas veya tarçın kokulu tatlı versiyonlar. Tamale yapımı topluluk açısından yoğundur — aileler masa yayma ve yaprak katlama sürecinde tamaladalarda buluşur — ve yemek tatiller ve Las Posadas olarak bilinen Noel öncesi dönemle yakından ilişkilidir.",
      it: "Il tamale è uno degli alimenti preparati più antichi della Mesoamerica, risalente a diverse migliaia di anni prima del contatto europeo. È costruito dalla masa — pasta di mais fatta da chicchi nixtamalizzati, con bucce ammorbidite nell\'acqua di calce — mescolata con strutto finché la pasta diventa leggera. Questa masa viene stesa su una foglia di mais, riempita, avvolta e cotta a vapore finché la pasta si indurisce attorno al ripieno.\\n\\nI ripieni variano ampiamente nelle regioni del Messico: mole negro con pollo, maiale nella salsa roja, rajas con formaggio o versioni dolci profumate alla cannella. Fare i tamales è comunalmente intensivo — le famiglie si riuniscono per le tamaladas, il processo collettivo di stesura e piegatura — e il piatto è strettamente associato alle festività e al periodo delle Posadas.",
      ko: "타말레는 유럽과의 접촉 수천 년 전으로 거슬러 올라가는 중앙아메리카의 가장 오래된 조리 식품 중 하나입니다. 석회수에 겉껍질을 부드럽게 한 닉스타말 처리된 옥수수 알갱이로 만든 옥수수 반죽(마사)에 라드를 섞어 반죽이 가벼워질 때까지 반죽합니다. 이 마사를 옥수수 껍질에 펴서 속재료를 넣고 싸서 반죽이 속재료 주위에서 단단해질 때까지 찝니다.\\n\\n속재료는 멕시코 각 지역마다 크게 다릅니다: 닭고기 몰레 네그로, 살사 로하에 담근 돼지고기, 치즈를 넣은 라하스, 또는 계피향이 나는 달콤한 버전 등. 타말레 만들기는 집단적으로 노동 집약적입니다 — 가족들이 마사를 펴고 껍질을 접는 집단 과정인 타말라다스를 위해 모입니다 — 이 요리는 명절과 라스 포사다스로 알려진 크리스마스 전 기간과 밀접하게 연관됩니다.",
      hi: "तामाले मेसोअमेरिका के सबसे पुराने तैयार खाद्य पदार्थों में से एक है, जो यूरोपीय संपर्क से कई हज़ार साल पहले का है। यह माज़ा से बना है — निक्सटामलाइज़्ड अनाज से बना मक्के का आटा, जिसकी भूसी चूने के पानी में नरम की जाती है — जिसे घी/चर्बी के साथ मिलाया जाता है जब तक आटा हल्का न हो जाए। इस माज़ा को मक्के की पत्ती पर फैलाया जाता है, भरावन रखा जाता है, लपेटा जाता है और भाप में पकाया जाता है।\\n\\nमेक्सिको के विभिन्न क्षेत्रों में भरावन व्यापक रूप से भिन्न होती है: चिकन के साथ मोले नेग्रो, सालसा रोजा में पोर्क, चीज़ के साथ राजास, या दालचीनी से सुगंधित मीठे संस्करण। तामाले बनाना सामूहिक रूप से श्रमसाध्य है — परिवार तामालादास के लिए एकत्रित होते हैं — और यह व्यंजन छुट्टियों और क्रिसमस से पहले लास पोसादास काल से गहराई से जुड़ा है।"
    }'''

if old_ot in data:
    data = data.replace(old_ot, new_ot, 1)
    open('public/js/recipes.js', 'w', encoding='utf-8').write(data)
    print('Done 111')
else:
    print('NOT FOUND 111')
