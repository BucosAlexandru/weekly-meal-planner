/**
 * cuisine-intros.mjs
 * ──────────────────
 * Per-cuisine editorial intros for the /<lc>/<recipe-prefix>/<country>/
 * country pages. Replaces the generic "${n} authentic recipes from ${o}…"
 * template with hand-written, atmosphere-driven openings.
 *
 * Each cuisine has:
 *   - a unique tone (no repeated structure patterns across countries)
 *   - concrete anchors (a dish, a technique, an ingredient, a region)
 *   - 1-2 short sentences, ~30-55 words
 *
 * Locale coverage:
 *   - en + ro + ar + zh + ja + hi + ko: full editorial rewrite for all 44 hub-eligible cuisines
 *   - other 7 locales: fall back to the locale's templated intro in
 *     CUISINE_HUB_LANG.intro(o, n) — still localized, but generic
 *
 * Keyed by origin.en (locale-stable, matches the URL slug source).
 */

export const CUISINE_INTRO = {
  // ── Mediterranean
  'Italy': {
    en: "Italy's table is built on regional restraint — Pecorino-laced carbonara from Rome, slow risotto from the north, eggplant pasta alla Norma from Sicily. Olive oil binds the country together; pasta keeps each region distinct.",
    ro: "Bucătăria italiană se ține pe disciplină regională — carbonara romană cu Pecorino, risotto-ul nordic încet, pasta alla Norma siciliană cu vinete. Uleiul de măsline ține țara la un loc, pastele păstrează fiecare regiune separată.",
    ar: "المطبخ الإيطالي مبني على الانضباط الإقليمي — الكاربونارا الرومانية بجبن البيكورينو، والريزوتو البطيء من الشمال، وباستا ألا نورما بالباذنجان من صقلية. زيت الزيتون يجمع البلاد؛ الباستا تُبقي كل منطقة متميزة.",
    zh: "意大利的餐桌建立在地域克制之上——罗马的培根蛋黄面、北方的慢炖烩饭、西西里的茄子通心粉。橄榄油将整个国家凝聚在一起，而意面则让每个地区保持各自的鲜明个性。",
    ja: "イタリアの食卓は地域ごとの節制で成り立つ——ローマのペコリーノ入りカルボナーラ、北部でゆっくり炊いたリゾット、シチリアの茄子のパスタ・アッラ・ノルマ。オリーブオイルが国全体をひとつにつなぎ、パスタが各地の個性を保っている。",
    hi: "इटली का खाना क्षेत्रीय संयम पर टिका है — रोम की पेकोरिनो वाली कार्बोनारा, उत्तर का धीमी आँच पर पका रिसोत्तो, सिसिली का बैंगन वाला पास्ता अल्ला नोर्मा। जैतून का तेल पूरे देश को एकसूत्र में पिरोता है; पास्ता हर क्षेत्र की अलग पहचान बचाए रखता है।",
    ko: "이탈리아의 식탁은 지역별 절제 위에 서 있다 — 로마의 페코리노 카르보나라, 북부의 천천히 끓인 리조토, 시칠리아의 가지 파스타 알라 노르마. 올리브 오일이 나라를 하나로 묶고, 파스타가 각 지역의 개성을 지킨다.",
  },
  'Greece': {
    en: "Greek cooking smells like oregano, olive oil and lemon zest — moussaka layered in baking trays, souvlaki turning over coals, spinach folded into thin phyllo. A coastal table, generous and unhurried.",
    ro: "Bucătăria grecească miroase a oregano, ulei de măsline și coajă de lămâie — moussaka în straturi, souvlaki rotit pe jar, spanac împăturit în foi subțiri de plăcintă. O masă mediteraneană, generoasă, fără grabă.",
    ar: "المطبخ اليوناني يفوح بالأوريغانو وزيت الزيتون وقشر الليمون — موساكا في طبقات داخل أواني الخبز، سوفلاكي فوق الجمر، وسبانخ مطوية في رقائق الفيلو الرفيعة. مائدة ساحلية كريمة بلا استعجال.",
    zh: "希腊料理散发着牛至、橄榄油和柠檬皮的香气——层层叠叠的慕萨卡、炭火上翻转的烤串、包裹在薄薄酥皮里的菠菜馅饼。这是一张地中海餐桌，大方而从容。",
    ja: "ギリシャ料理にはオレガノとオリーブオイル、レモンの皮の香りが漂う——焼き皿に重ねたムサカ、炭火でくるりと回すスブラキ、薄いフィロ生地に包んだほうれん草のパイ。海沿いの食卓は大らかで、のんびりしている。",
    hi: "यूनानी रसोई में ओरेगैनो, जैतून का तेल और नींबू का छिलका महकता है — परतों वाली मूसाका, कोयले पर सिंकती सुवलाकी, पतले फाइलो में लिपटा पालक। एक समुद्री मेज़, उदार और बेफिक्र।",
    ko: "그리스 요리에는 오레가노, 올리브 오일, 레몬 껍질 향이 흐른다 — 겹겹이 쌓은 무사카, 숯불 위의 수블라키, 얇은 필로 반죽에 싼 시금치 파이. 지중해 식탁은 넉넉하고 여유롭다.",
  },
  'Spain': {
    en: "Spain cooks between Andalusian sun and Valencian rice fields — chilled gazpacho when the heat won't quit, saffron-stained paella on a wide steel pan. Olive oil is the constant; the rest is fierce regional pride.",
    ro: "Spania gătește între soarele Andaluziei și orezăriile Valenciei — gazpacho rece când căldura nu cedează, paella cu șofran pe tigaie lată. Uleiul de măsline e singurul element comun; restul e mândrie regională.",
    ar: "تطبخ إسبانيا بين شمس الأندلس وحقول أرز فالنسيا — غاسباتشو بارد حين يأبى الحر الرحيل، والبايييا المعصفرة في مقلاة فولاذية عريضة. زيت الزيتون ثابت لا يتغير؛ وما سواه فخر إقليمي لا تنازل عنه.",
    zh: "西班牙在安达卢西亚的阳光与瓦伦西亚稻田之间烹饪——暑热难耐时有冰镇冷汤，宽口钢锅里盛着藏红花染色的海鲜饭。橄榄油是永恒的底色，其余的都是各地区的骄傲。",
    ja: "スペインはアンダルシアの陽光とバレンシアの水田の間で料理する——暑さが続く日には冷たいガスパチョ、幅広い鉄製のパンにはサフラン色のパエリャ。オリーブオイルだけが変わらず、あとは激しい地域の誇りだ。",
    hi: "स्पेन की रसोई अंडालूसिया की धूप और वैलेंसिया के चावल के खेतों के बीच जीवंत है — गर्मी में ठंडा गज़्पाचो, चौड़ी लोहे की कड़ाही में केसर से रँगी पाएया। जैतून का तेल स्थायी है; बाकी सब क्षेत्रीय अभिमान।",
    ko: "스페인은 안달루시아의 햇살과 발렌시아 논밭 사이에서 요리한다 — 더위가 가시지 않는 날의 차가운 가스파초, 넓은 철제 팬의 사프란 빛 파에야. 올리브 오일만이 변하지 않고, 나머지는 치열한 지역의 자부심이다.",
  },
  'France': {
    en: "France runs on slow technique — butter, wine, patience. Whether it's a Provençal ratatouille or a Burgundy braise, the recipes carry their region in their bones and trust the cook to take their time.",
    ro: "Bucătăria franceză merge pe tehnică lentă — unt, vin, răbdare. Fie că e o ratatouille provensală sau un bourguignon din Burgundia, fiecare rețetă își poartă regiunea în oase și are încredere în timpul bucătarului.",
    ar: "المطبخ الفرنسي يعتمد على التقنية البطيئة — الزبدة والنبيذ والصبر. سواء كانت راتاتوي بروفانسالية أو طاجن مطهو ببطء من بورغونيا، تحمل الوصفات منطقتها في جوهرها وتثق في وقت الطاهي.",
    zh: "法国料理依赖缓慢的技艺——黄油、红酒、耐心。无论是普罗旺斯的炖蔬菜还是勃艮第的红酒炖肉，每道菜都在骨子里携带着它的产地，并信任厨师愿意花时间等待。",
    ja: "フランス料理はゆっくりとした技法で動く——バター、ワイン、忍耐。プロヴァンスのラタトゥイユであれブルゴーニュの煮込みであれ、レシピは土地の記憶を宿し、料理人が時間をかけることを信頼する。",
    hi: "फ्रांसीसी रसोई धीमी तकनीक पर चलती है — मक्खन, वाइन, धैर्य। प्रोवेंस की रतातूई हो या बरगंडी की ब्रेज़, हर रेसिपी अपनी ज़मीन की आत्मा लिए चलती है और रसोइये के सब्र पर भरोसा करती है।",
    ko: "프랑스 요리는 느린 기술로 움직인다 — 버터, 와인, 인내. 프로방스의 라타투이든 부르고뉴의 브레이즈든, 레시피는 그 땅의 기억을 품고 요리사의 시간을 믿는다.",
  },
  'Portugal': {
    en: "Portuguese cooking is salt cod, olive oil and slow Atlantic afternoons — bacalhau cooked a hundred ways, beans simmered with chouriço. Quiet, rooted, generous with seafood and unhurried with stew.",
    ro: "Bucătăria portugheză e cod sărat, ulei de măsline și după-amieze atlantice — bacalhau gătit în o sută de feluri, fasole fiartă încet cu chouriço. Liniștită, înrădăcinată, generoasă cu fructe de mare.",
    ar: "المطبخ البرتغالي هو سمك القد المملح وزيت الزيتون وأمسيات أطلنطية طويلة — باكاليا يُطهى بمئة طريقة، وفاصوليا تتسلق ببطء مع الشوريثو. هادئ وراسخ، سخي مع المأكولات البحرية وصبور مع الطواجن.",
    zh: "葡萄牙料理是咸鳕鱼、橄榄油和漫长的大西洋午后——腌鳕鱼有百余种做法，香肠炖豆子慢火细煨。安静、朴实，对海鲜慷慨，对炖菜从不着急。",
    ja: "ポルトガル料理は塩漬けのタラとオリーブオイル、のんびりした大西洋の午後でできている——バカリャウは百通りの調理法があり、豆はチョウリソとともにじっくり煮込まれる。静かで、根づいていて、魚介に寛大だ。",
    hi: "पुर्तगाली खाना नमकीन कॉड, जैतून का तेल और अटलांटिक की लंबी दोपहर से बना है — बकाल्यू सौ तरीकों से, चोरिसो के साथ उबली बींस। समुद्री खाने में उदार, धीमी आँच के स्टू में बेफिक्र।",
    ko: "포르투갈 요리는 소금에 절인 대구와 올리브 오일, 대서양의 긴 오후로 이루어진다 — 백 가지 방식의 바칼랴우, 초리수와 함께 끓인 콩. 해산물에는 너그럽고, 천천히 끓이는 스튜에는 느긋하다.",
  },
  'Croatia': {
    en: "Croatian cooking wanders between coast and inland — grilled ćevapi with raw onion, pašticada braised for hours with prunes and Dalmatian red wine. Olive oil on the sea side, paprika and pork inland.",
    ro: "Bucătăria croată se mișcă între coastă și interior — ćevapi pe grătar cu ceapă crudă, pašticada gătită ore întregi cu prune și vin roșu dalmațian. Ulei de măsline lângă mare, boia și porc în continent.",
    ar: "المطبخ الكرواتي يتنقل بين الساحل والداخل — تشيفابي مشوية مع البصل الطازج، وباشتيتشادا مطهية لساعات مع الخوخ ونبيذ دالماتيا الأحمر. زيت الزيتون على الجانب البحري، والفلفل الحار ولحم الخنزير في الداخل.",
    zh: "克罗地亚料理游走于海岸与内陆之间——烤制的切瓦皮配生洋葱，帕什提恰达用梅子和达尔马提亚红酒慢炖数小时。海边用橄榄油，内陆用红椒粉和猪肉。",
    ja: "クロアチア料理は海岸と内陸を行き来する——生玉ねぎと焼いたチェヴァピ、プラムとダルマチア産赤ワインで何時間も煮込んだパシュティツァダ。海側はオリーブオイル、内陸はパプリカと豚肉だ。",
    hi: "क्रोएशियाई खाना समुद्रतट और भीतरी हिस्से के बीच घूमता है — कच्चे प्याज़ के साथ ग्रिल्ड चेवापी, डालमेटियन लाल वाइन और आलूबुखारे में घंटों पकी पाश्तिकादा। तट पर जैतून का तेल, अंदर लाल मिर्च और सूअर।",
    ko: "크로아티아 요리는 해안과 내륙 사이를 오간다 — 생양파와 함께 구운 체바피, 달마티아 적포도주와 자두로 몇 시간 조린 파슈티차다. 바다 쪽엔 올리브 오일, 내륙엔 파프리카와 돼지고기.",
  },

  // ── East Asian
  'Japan': {
    en: "Japan eats by precision and quiet contrast — broths simmered for hours, rice rinsed until clean, garnishes placed with intent. Ramen counters, sushi bars and home kitchens all share the same restraint.",
    ro: "Japonia gătește cu precizie și contrast tăcut — supe fierte ore întregi, orez clătit până la transparență, garnituri așezate cu intenție. Tarabele cu ramen, tejghelele de sushi și bucătăriile de acasă împart aceeași disciplină.",
    ar: "يأكل اليابانيون بدقة وتناقض هادئ — مرقة تغلي لساعات، وأرز يُشطف حتى يصفو، وزينة تُوضع بنية. طاولات الرامن وبارات السوشي ومطابخ البيوت تشترك في ضبط النفس ذاته.",
    zh: "日本料理追求精准与静默的对比——高汤文火熬数小时，米饭反复淘洗至透亮，摆盘装饰皆有深意。拉面馆、寿司吧和家庭厨房，共同遵守着同一种克制。",
    ja: "日本料理は精度と静かな対比で成り立つ——何時間もかけた出汁、透き通るまで研いだ米、意図して添えた飾り。ラーメンカウンター、寿司カウンター、家の台所——すべてが同じ節制を共有している。",
    hi: "जापानी खाना सटीकता और शांत विपरीतता पर टिका है — घंटों उबला शोरबा, बार-बार धोया चावल, इरादे से रखी सजावट। रामेन काउंटर, सुशी बार और घर की रसोई — सब एक ही संयम की भाषा बोलते हैं।",
    ko: "일본 요리는 정밀함과 조용한 대비로 이루어진다 — 몇 시간 우린 다시, 맑아질 때까지 씻은 쌀, 의도를 담은 고명. 라멘 카운터, 스시 바, 집 부엌 — 모두 같은 절제를 공유한다.",
  },
  'China': {
    en: "Chinese cooking respects the wok and the clock — high heat for a fast stir-fry, slow simmer for a stew, oil bloomed with garlic and Sichuan pepper before anything else hits the pan.",
    ro: "Bucătăria chinezească respectă wok-ul și ceasul — foc mare pentru sotat rapid, fierbere înceată pentru tocănițe, ulei aromat cu usturoi și piper Sichuan înainte de orice altceva.",
    ar: "يحترم المطبخ الصيني الووك والوقت — حرارة عالية لقلي سريع، وغليان خفيف للطواجن، وزيت يتفتح بالثوم وفلفل سيشوان قبل أي شيء آخر يصل إلى المقلاة.",
    zh: "中国烹饪尊重锅与时间——大火快炒，慢火细炖，蒜与花椒先在热油中爆香，再下其他食材。从南方清蒸到北方炖煮，每道菜都有自己的节奏。",
    ja: "中国料理は中華鍋と時間を大切にする——強火でさっと炒める、弱火でじっくり煮込む、何より先に熱した油でにんにくと花椒を香らせる。南の蒸し物から北の煮込みまで、それぞれのリズムがある。",
    hi: "चीनी खाना वोक और समय दोनों का सम्मान करता है — तेज़ आँच पर जल्दी भुनना, धीमी आँच पर स्टू, लहसुन और सिचुआन मिर्च को गरम तेल में पहले सुगंधित करना। हर पकवान का अपना ताल है।",
    ko: "중국 요리는 웍과 시간을 모두 존중한다 — 강한 불에 재빠른 볶음, 낮은 불에 푹 끓이는 스튜, 무엇보다 먼저 달군 기름에 마늘과 사천 고추를 향 내기. 남쪽의 찜부터 북쪽의 조림까지, 저마다의 리듬이 있다.",
  },
  'South Korea': {
    en: "Korean cooking turns fermentation into a national pantry — kimchi crocks, doenjang stews, gochujang glazes. Banchan plates surround every meal; rice and shared heat carry the conversation.",
    ro: "Bucătăria coreeană transformă fermentația într-o cămară națională — borcane de kimchi, tocănițe de doenjang, glazuri de gochujang. Farfuriile de banchan înconjoară fiecare masă; orezul și picantul împărtășit duc conversația.",
    ar: "يحوّل المطبخ الكوري التخمير إلى مخزن وطني — أجران الكيمتشي وحساء الدويجانغ وصلصات الغوتشوجانغ. أطباق البانتشان تحيط كل وجبة؛ الأرز والحرارة المشتركة يحملان الحديث.",
    zh: "韩国料理将发酵变成了国家的储藏室——泡菜坛子、大酱汤、辣椒酱釉料。小菜围绕着每一顿饭；米饭和共享的辣味串起整桌的对话。",
    ja: "韓国料理は発酵を国民の食料庫に変えた——キムチの甕、テンジャンチゲ、コチュジャンのタレ。バンチャンの小皿が毎食を囲み、ごはんと共有される辛さが食卓の会話を運ぶ。",
    hi: "कोरियाई खाना किण्वन को राष्ट्रीय भंडार बनाता है — किमची के मटके, डोएनजांग का स्टू, गोचुजांग की चटनी। बनचान की थालियाँ हर खाने को घेरती हैं; चावल और साझा तीखापन मेज़ की बातचीत चलाता है।",
    ko: "한국 요리는 발효를 국민의 식료품 창고로 삼는다 — 김치 항아리, 된장찌개, 고추장 양념. 반찬 접시들이 모든 식사를 둘러싸고, 밥과 함께 나누는 매운맛이 대화를 이어간다.",
  },

  // ── Southeast Asian
  'Vietnam': {
    en: "Vietnam balances four flavors at every table — bright herbs, salty fish sauce, fresh chili, a squeeze of lime. From phở broth at dawn to bánh mì at noon, the cooking stays light and immediate.",
    ro: "Vietnamul echilibrează patru gusturi la fiecare masă — ierburi proaspete, sos de pește sărat, ardei iute, o picătură de lime. De la zeama de phở dimineața la bánh mì la prânz, gătitul rămâne ușor și imediat.",
    ar: "يوازن فيتنام أربع نكهات على كل مائدة — أعشاب نضرة، وصلصة سمك مالحة، وفلفل حار طازج، وعصرة ليم. من مرق الفو فجراً إلى البانه مي ظهراً، يبقى الطبخ خفيفاً وآنياً.",
    zh: "越南料理在每张餐桌上平衡四种味道——清新的香草、咸鲜的鱼露、新鲜的辣椒、一挤青柠。从清晨的河粉汤到午间的越南三明治，这里的烹饪始终轻盈而即时。",
    ja: "ベトナムはどの食卓でも四つの味を調和させる——香り高いハーブ、塩気の効いたヌクマム、生の青唐辛子、ライムをひと絞り。夜明けのフォーから昼のバインミーまで、料理はいつも軽やかで即興的だ。",
    hi: "वियतनाम की हर मेज़ पर चार स्वाद एक साथ संतुलित होते हैं — ताज़ी जड़ी-बूटियाँ, नमकीन फिश सॉस, कच्ची मिर्च, नींबू का रस। सुबह की फो से दोपहर की बान्ह मी तक, खाना हल्का और तत्काल रहता है।",
    ko: "베트남은 모든 식탁에서 네 가지 맛을 균형 잡는다 — 신선한 허브, 짭조름한 느억맘, 생고추, 라임 한 조각. 새벽의 쌀국수부터 점심의 반미까지, 요리는 언제나 가볍고 즉각적이다.",
  },
  'Thailand': {
    en: "Thai cooking chases four flavors at once — hot, sour, sweet, salty. Pad thai negotiates them in a wok; tom yum sharpens them in clear broth; tom kha softens them with coconut milk.",
    ro: "Bucătăria thailandeză urmărește patru gusturi în același timp — iute, acru, dulce, sărat. Pad thai le împacă în wok; tom yum le ascute într-o supă limpede; tom kha le îmblânzește cu lapte de cocos.",
    ar: "يطارد الطبخ التايلاندي أربع نكهات في آن واحد — حار وحامض وحلو ومالح. بادثاي يوفق بينها في الووك، وتوم يوم يحدّدها في مرق صافٍ، وتوم خا يليّنها بحليب جوز الهند.",
    zh: "泰国料理同时追逐四种味道——辣、酸、甜、咸。炒河粉在锅中协调它们，冬阴功在清汤中将它们强化，椰奶鸡汤则用椰浆将它们柔化。",
    ja: "タイ料理は四つの味を同時に追いかける——辛い、酸っぱい、甘い、塩辛い。パッタイは中華鍋のなかでそれらをまとめ、トムヤムは澄んだスープで鋭くし、トムカーはココナッツミルクで柔らかく包む。",
    hi: "थाई खाना एक साथ चार स्वाद खोजता है — तीखा, खट्टा, मीठा, नमकीन। पैड थाई इन्हें वोक में समेटता है; टॉम यम साफ शोरबे में तेज़ करता है; टॉम खा नारियल के दूध में नरम कर देता है।",
    ko: "태국 요리는 네 가지 맛을 동시에 쫓는다 — 맵고, 시고, 달고, 짜다. 팟타이는 웍 안에서 그것들을 하나로 모으고, 똠얌은 맑은 국물에서 날카롭게 하며, 똠카는 코코넛 밀크로 부드럽게 감싼다.",
  },
  'Indonesia': {
    en: "Indonesia cooks in layers — coconut milk reducing for hours, sambal pounded fresh, palm sugar caramelizing in the wok. Rice is the steady center; chili, lemongrass and shrimp paste work around it.",
    ro: "Indonezia gătește în straturi — lapte de cocos redus ore întregi, sambal pisat la moment, zahăr de palmier caramelizat în wok. Orezul e centrul stabil; ardeiul, lemongrass-ul și pasta de creveți lucrează în jurul lui.",
    ar: "تطبخ إندونيسيا بالطبقات — حليب جوز هند يتقلص لساعات، وسامبال يُطحن طازجاً، وسكر النخيل يتكرمل في الووك. الأرز هو المركز الثابت؛ والفلفل والليمون الحشيشي ومعجون الجمبري يعملون حوله.",
    zh: "印度尼西亚料理层层叠叠——椰奶熬煮数小时，桑巴辣酱现捣现用，棕榈糖在锅中焦糖化。米饭是稳定的中心，辣椒、香茅和虾酱围绕其转。",
    ja: "インドネシア料理は層で組み立てられる——何時間も煮詰めるココナッツミルク、挽きたてのサンバル、中華鍋でキャラメル化するヤシ砂糖。米が揺るぎない中心で、唐辛子とレモングラスとエビ味噌がその周りを回る。",
    hi: "इंडोनेशियाई खाना परतों में बनता है — घंटों उबला नारियल दूध, ताज़ा पिसी सांबल, वोक में कैरामेलाइज़ होता खजूर चीनी। चावल स्थायी केंद्र है; मिर्च, लेमनग्रास और झींगा पेस्ट उसके इर्द-गिर्द घूमते हैं।",
    ko: "인도네시아 요리는 켜켜이 쌓인다 — 몇 시간 졸인 코코넛 밀크, 갓 빻은 삼발, 웍에서 캐러멜화되는 야자 설탕. 쌀이 흔들리지 않는 중심이고, 고추와 레몬그라스와 새우 페이스트가 그 주위를 돈다.",
  },
  'Philippines': {
    en: "Filipino cooking sits where sour meets savory — adobo simmered in vinegar and soy, kare-kare rich with peanut and oxtail. Bagoong on the side, rice always, leftovers always better the next day.",
    ro: "Bucătăria filipineză stă unde acru întâlnește savuros — adobo fiert în oțet și soia, kare-kare bogat cu arahide și coadă de bou. Bagoong alături, orez mereu, resturile sunt mereu mai bune a doua zi.",
    ar: "يقبع المطبخ الفلبيني حيث يلتقي الحامض بالمالح — أدوبو مطهو بالخل وصوص الصويا، وكاري كاري غني بالفول السوداني وذيل الثور. باغونغ على الجانب، والأرز دائماً، والبقايا دائماً أفضل في اليوم التالي.",
    zh: "菲律宾料理介于酸与鲜咸之间——醋与酱油慢炖的阿斗波，富含花生与牛尾的咖喱炖肉。佐以虾酱，少不了米饭，隔夜的剩菜往往更美味。",
    ja: "フィリピン料理は酸味と旨味が出会う場所に立つ——酢と醤油で煮込んだアドボ、ピーナッツと牛テールたっぷりのカレカレ。バゴオンを添えて、ごはんは必ず、残り物は翌日がさらに美味しい。",
    hi: "फिलीपीनी खाना खट्टे और स्वादिष्ट के मिलन पर खड़ा है — सिरका और सोया में पकी अडोबो, मूंगफली और बैल की पूंछ वाली करे-करे। बागूओंग साथ में, चावल हमेशा, बचा खाना अगले दिन और भी बेहतर।",
    ko: "필리핀 요리는 신맛과 감칠맛이 만나는 곳에 선다 — 식초와 간장에 조린 아도보, 땅콩과 꼬리 고기로 풍성한 카레카레. 바구옹을 곁들이고, 밥은 언제나, 남은 음식은 다음날 더 맛있다.",
  },
  'Malaysia': {
    en: "Malaysian cooking lives at the hawker stall — laksa rich with coconut and shrimp paste, nasi lemak crowned with crisp anchovies. Multiple cultures, one wok station, breakfast served hot at 7 a.m.",
    ro: "Bucătăria malaezienă trăiește la taraba de stradă — laksa cu lapte de cocos și pastă de creveți, nasi lemak încoronat cu anșoa crocant. Mai multe culturi, o singură stație de wok, micul dejun servit fierbinte la 7 dimineața.",
    ar: "يعيش الطبخ الماليزي في أكشاك الباعة الجائلين — لاكسا كثيفة بجوز الهند ومعجون الروبيان، وناسي ليماك متوج بأنشوفة مقرمشة. ثقافات متعددة ومحطة ووك واحدة، والإفطار يُقدَّم ساخناً في السابعة صباحاً.",
    zh: "马来西亚料理活在小摊档里——椰香虾酱叻沙、椰奶饭配酥脆小鱼干。多元文化共用一口锅，早晨七点热腾腾的早餐就已端上桌。",
    ja: "マレーシア料理はホーカーストールに生きている——ココナッツとエビ味噌で濃厚なラクサ、カリカリのイリコで飾ったナシレマ。複数の文化、一つの中華鍋台、朝7時に熱々で出される朝食。",
    hi: "मलेशियाई खाना हॉकर स्टॉल में जीता है — नारियल और झींगा पेस्ट वाली लक्सा, कुरकुरी एंचोवी से सजी नासी लेमक। कई संस्कृतियाँ, एक वोक, सुबह सात बजे गरमागरम नाश्ता।",
    ko: "말레이시아 요리는 호커 스톨에서 살아간다 — 코코넛과 새우 페이스트로 진한 락사, 바삭한 멸치를 얹은 나시 르막. 여러 문화, 하나의 웍, 오전 7시에 뜨겁게 내오는 아침 식사.",
  },
  'Cambodia': {
    en: "Cambodian cooking quietly balances sweet, salty, sour and herbaceous — fish amok steamed in banana leaf, fresh chili and lime alongside every plate. Lemongrass, palm sugar and prahok do the heavy lifting.",
    ro: "Bucătăria cambodgiană echilibrează discret dulce, sărat, acru și verde — pește amok aburit în frunză de banan, ardei proaspăt și lime lângă fiecare farfurie. Lemongrass, zahăr de palmier și prahok fac munca de bază.",
    ar: "يوازن الطبخ الكمبودي بهدوء بين الحلو والمالح والحامض والعشبي — سمكة أموك تُبخّر في ورقة موز، وفلفل طازج وليم بجانب كل طبق. الليمون الحشيشي وسكر النخيل والبراهوك يقومون بالعمل الأساسي.",
    zh: "柬埔寨料理悄然平衡甜、咸、酸与草本香——鱼子烤鱼裹在芭蕉叶中蒸制，每道菜旁都有新鲜辣椒和青柠。香茅、棕榈糖和鱼膏承担着调味的重任。",
    ja: "カンボジア料理はひそやかに甘み・塩味・酸味・草の香りをつり合わせる——バナナの葉に包んで蒸した魚のアモック、どの皿にも添えられた生の唐辛子とライム。レモングラス、ヤシ砂糖、プラホックが主役を担う。",
    hi: "कम्बोडियाई खाना चुपचाप मीठे, नमकीन, खट्टे और जड़ी-बूटियों को संतुलित करता है — केले की पत्ती में भाप पर पकी मछली अमोक, हर थाली के साथ ताज़ी मिर्च और नींबू। लेमनग्रास, खजूर चीनी और प्राहोक मेहनत करते हैं।",
    ko: "캄보디아 요리는 조용히 달고, 짜고, 시고, 허브향 나는 맛을 균형 잡는다 — 바나나 잎에 싸서 찐 생선 아목, 모든 접시 옆의 생고추와 라임. 레몬그라스와 야자 설탕과 프라혹이 핵심을 담당한다.",
  },

  // ── South Asian
  'India': {
    en: "India layers spice with intent — whole seeds bloomed in hot ghee, onions cooked until they melt, finishing aromatics dropped in at the very end. Curries, biryanis and street-food classics all follow the rhythm.",
    ro: "India așază condimentele cu intenție — semințe întregi înflorite în ghee fierbinte, ceapă gătită până se topește, arome finale aruncate chiar la sfârșit. Curry-uri, biryani și clasice de stradă urmează același ritm.",
    ar: "تُرتّب الهند البهارات بنية — بذور كاملة تتفتح في سمن ساخن، وبصل يُطهى حتى يذوب، ونكهات نهائية تُضاف في آخر لحظة. الكاري والبيريانيات وأطباق المطبخ الشعبي تتبع نفس الإيقاع.",
    zh: "印度料理将香料层层叠加，各有其意——整颗香料在热酥油中绽放，洋葱炒至融化，最后的香气在出锅前才加入。咖喱、香饭与街头小吃，都遵循着同一节奏。",
    ja: "インド料理は意図を持ってスパイスを積み重ねていく——熱いギーで香らせた丸ごとのシード、溶けるまで炒めた玉ねぎ、最後の瞬間に加えるフレッシュな香り。カレーもビリヤニも街の屋台の名物も、同じリズムに従う。",
    hi: "भारत मसालों को इरादे से परत-दर-परत डालता है — गरम घी में तड़के लगते साबुत मसाले, पिघलने तक भुना प्याज़, अंत में डाली जाने वाली ताज़ी खुशबू। करी, बिरयानी और स्ट्रीट फूड — सब एक ही लय में चलते हैं।",
    ko: "인도는 향신료를 의도적으로 층층이 쌓는다 — 뜨거운 기 버터에 통째로 향 내는 씨앗, 녹아내릴 때까지 볶은 양파, 마지막 순간에 더하는 신선한 향. 카레, 비리야니, 길거리 음식 모두 같은 리듬을 따른다.",
  },
  'Pakistan': {
    en: "Pakistani cooking turns spice into long heat — biryani layered with marinated lamb, nihari simmered overnight until the meat surrenders. Bone marrow, naan straight off the tandoor, and bread keep the table close.",
    ro: "Bucătăria pakistaneză transformă condimentele în căldură lungă — biryani în straturi cu miel marinat, nihari fiert peste noapte până carnea cedează. Măduvă de os, naan direct din tandoor, pâinea ține masa aproape.",
    ar: "يحوّل الطبخ الباكستاني البهارات إلى دفء طويل — بيريانيات في طبقات مع لحم ضأن متبل، ونيهاري مطهو طوال الليل حتى يستسلم اللحم. نخاع العظام وخبز النان مباشرة من التنور يُبقيان المائدة قريبة.",
    zh: "巴基斯坦料理将香料化为持久的热意——腌羊肉铺就的香料焖饭，炖了一整夜直至肉质酥软的尼哈里。骨髓、刚出炉的馕，让一张桌子紧紧围坐在一起。",
    ja: "パキスタン料理はスパイスを長い熱に変える——マリネした子羊を何層にも重ねたビリヤニ、一晩中煮込んで肉が崩れるニハリ。骨髄、タンドールから直接出てくるナン、パンが食卓を近づける。",
    hi: "पाकिस्तानी खाना मसालों को लंबी गर्माहट में बदलता है — मैरीनेट मेमने की परतों वाली बिरयानी, रात भर उबली निहारी जब तक गोश्त नर्म न पड़ जाए। हड्डी का मज्जा, तंदूर से सीधा नान — रोटी मेज़ को करीब रखती है।",
    ko: "파키스탄 요리는 향신료를 오래 끓는 열로 바꾼다 — 재운 양고기를 켜켜이 쌓은 비리야니, 고기가 허물어질 때까지 밤새 끓인 니하리. 골수, 탄두르에서 바로 나온 난 — 빵이 식탁을 가깝게 만든다.",
  },

  // ── Middle Eastern
  'Iran': {
    en: "Persian kitchens layer flavor with patience — fesenjān thickened with walnut and pomegranate, ghormeh sabzi green with stewed herbs. Saffron, dried lime and rice tahdig finish the table.",
    ro: "Bucătăriile persane stratifică gustul cu răbdare — fesenjān îngroșat cu nucă și rodie, ghormeh sabzi verde de la ierburi gătite. Șofran, lime uscat și tahdig de orez închid masa.",
    ar: "تُرتّب المطابخ الفارسية النكهة بصبر — فسنجان يتكاثف بالجوز والرمان، وغورمة سبزي تخضرّ بالأعشاب المطهية. الزعفران والليمون المجفف والطهيج من الأرز تُختتم بها المائدة.",
    zh: "波斯厨房用耐心堆叠风味——核桃与石榴浓缩的费先贾恩，炖香草染绿的库尔梅萨布兹。藏红花、干柠檬与米饭锅巴，为一桌饭食画上句点。",
    ja: "ペルシャの台所はじっくりと風味を積み重ねる——クルミとザクロで濃くしたフェセンジャン、煮込んだハーブで深緑に染まったゴルメサブジ。サフランと乾燥ライム、タフディグで食卓を締める。",
    hi: "फारसी रसोई धैर्य के साथ स्वाद की परतें बनाती है — अखरोट और अनार से गाढ़ी फेसेनजान, पकी जड़ी-बूटियों से हरी घोरमे सब्ज़ी। केसर, सूखा नींबू और चावल की तहदिग से मेज़ पूरी होती है।",
    ko: "페르시아의 주방은 인내로 맛의 층을 쌓는다 — 호두와 석류로 걸쭉한 페센잔, 삶은 허브로 짙게 물든 고르메사브지. 사프란과 말린 라임, 타흐디그로 식탁을 마무리한다.",
  },
  'Israel': {
    en: "Israeli cooking pulls from across the eastern Mediterranean — silky hummus, sabich pita stuffed with eggplant and egg, lemon and parsley constant. Casual abundance, sharp seasoning, breakfast that lasts all day.",
    ro: "Bucătăria israeliană împrumută din toată Mediterana de est — hummus mătăsos, sabich în pita cu vinete și ou, lămâie și pătrunjel mereu. Abundență relaxată, condimente ascuțite, mic dejun care durează toată ziua.",
    ar: "يستلهم المطبخ الإسرائيلي من شرق البحر المتوسط — حمص ناعم كالحرير، وسابيتش في خبز بيتا مع الباذنجان والبيض، وليمون وبقدونس دائماً حاضران. وفرة مريحة وتوابل حادة وإفطار يدوم طوال اليوم.",
    zh: "以色列料理从东地中海各处汲取灵感——丝滑的鹰嘴豆泥、夹着茄子和鸡蛋的沙比克皮塔饼，柠檬与香菜无处不在。随意而丰盛，调味犀利，早餐从容吃上一整天。",
    ja: "イスラエル料理は東地中海全域から引き寄せる——なめらかなフムス、茄子とゆで卵を詰めたサビーチのピタ、常に添えられるレモンとパセリ。気取らない豊かさ、鋭い味付け、一日中続く朝食。",
    hi: "इज़राइली खाना पूर्वी भूमध्यसागर के कोने-कोने से खींचता है — मुलायम हुम्मस, बैंगन और अंडे से भरी सबीच, हर जगह नींबू और अजमोद। सहज बहुलता, तीखा स्वाद, नाश्ता जो पूरे दिन चले।",
    ko: "이스라엘 요리는 동지중해 곳곳에서 끌어온다 — 부드러운 후무스, 가지와 달걀을 넣은 사비흐 피타, 언제나 함께하는 레몬과 파슬리. 격식 없는 풍요로움, 날카로운 양념, 하루 종일 이어지는 아침 식사.",
  },
  'Syria': {
    en: "Syrian tables run on generosity — kibbeh shaped by hand, shakshuka eaten straight from the pan, fatteh built in layers of bread, yogurt and chickpeas. Pomegranate molasses and sumac keep the seasoning sharp.",
    ro: "Mesele siriene merg pe generozitate — kibbeh modelat cu mâna, shakshuka mâncat direct din tigaie, fatteh construit în straturi de pâine, iaurt și năut. Melasa de rodie și sumacul țin condimentarea ascuțită.",
    ar: "تقوم الموائد السورية على الكرم — كبة تُشكّل باليد، وشكشوكة تؤكل مباشرة من المقلاة، وفتّة تُبنى في طبقات من الخبز والزبادي والحمص. دبس الرمان والسماق يحافظان على حدة التوابل.",
    zh: "叙利亚餐桌以慷慨为本——手工捏制的肉丸馅饼、直接从锅里享用的番茄煎蛋、层叠面包与酸奶和鹰嘴豆的法提。石榴糖浆与漆树粉保持着调味的锋锐。",
    ja: "シリアの食卓は寛大さで成り立つ——手で形作るキッベ、フライパンから直接食べるシャクシュカ、パンとヨーグルトとヒヨコ豆を重ねたファッテ。ザクロ糖蜜とスマックが味の鋭さを保つ。",
    hi: "सीरियाई मेज़ उदारता पर चलती है — हाथ से बनाई कीब्बे, कड़ाही से सीधे खाई शकशुका, रोटी-दही-छोले की परतों वाली फत्ते। अनार का शीरा और सुमैक स्वाद की धार बनाए रखते हैं।",
    ko: "시리아 식탁은 너그러움으로 선다 — 손으로 빚은 키베, 팬에서 바로 퍼먹는 샥슈카, 빵과 요거트와 병아리콩을 켜켜이 쌓은 팟테. 석류 당밀과 수막이 맛의 날카로움을 유지한다.",
  },
  'Turkey': {
    en: "Turkish cooking moves between meze, bread oven and copper pot — flaky baklava soaked in syrup, eggs scrambled into pepper-rich menemen. Strong tea is poured at every meal, often before the first plate arrives.",
    ro: "Bucătăria turcească se mișcă între meze, cuptor de pâine și oală de cupru — baklava fragedă în sirop, ouă bătute în menemen plin cu ardei. Ceaiul tare se toarnă la fiecare masă, deseori înainte de prima farfurie.",
    ar: "يتنقل المطبخ التركي بين المازه وفرن الخبز والقدر النحاسي — بقلاوة هشة منقوعة في شراب، وبيض مخفوق في مينيمين الغني بالفلفل. الشاي القوي يُسكَب في كل وجبة، وغالباً قبل وصول أول طبق.",
    zh: "土耳其料理穿梭于小菜、面包烤炉与铜锅之间——糖浆浸透的酥皮果仁蜜饼，与富含甜椒的炒蛋。浓茶在每顿饭都会倒上，往往在第一道菜上桌之前。",
    ja: "トルコ料理はメゼとパン焼き窯と銅の鍋の間を行き来する——シロップにたっぷり漬けたサクサクのバクラヴァ、ピーマンたっぷりのメネメンに溶かした卵。濃いお茶はどの食事にも注がれ、たいてい最初の皿が来る前に。",
    hi: "तुर्की खाना मेज़े, तंदूर और ताँबे की हांडी के बीच घूमता है — शीरे में भीगी परतदार बकलावा, मिर्च वाली मेनेमेन में पकाए अंडे। हर खाने पर कड़ी चाय, अक्सर पहली थाली आने से पहले।",
    ko: "터키 요리는 메제, 빵 화덕, 구리 냄비 사이를 오간다 — 시럽에 흠뻑 젖은 바클라바, 피망 가득한 메네멘에 풀어 넣은 달걀. 진한 차는 모든 식사에 따라오고, 대개 첫 접시보다 먼저 나온다.",
  },

  // ── North African
  'Morocco': {
    en: "Moroccan kitchens move slowly — clay tagines holding meat with preserved lemon, harira thickening with lentils and tomato, ras el hanout perfumed across every dish. Spice, fruit and time do the cooking together.",
    ro: "Bucătăriile marocane se mișcă încet — tagine din lut cu carne și lămâie murată, harira îngroșată cu linte și roșii, ras el hanout parfumat în fiecare fel. Condimentul, fructele și timpul gătesc împreună.",
    ar: "تتحرك المطابخ المغربية ببطء — طواجن طينية تحتضن اللحم مع الليمون المحفوظ، وحريرة تتكاثف بالعدس والطماطم، ورأس الحانوت يُعطّر كل طبق. البهارات والفواكه والوقت تطبخ معاً.",
    zh: "摩洛哥厨房的节奏缓慢——陶锅里慢炖着肉与腌柠檬，扁豆番茄浓汤越煮越稠，拉斯汉努特香料为每道菜增香。香料、果干与时间共同完成烹饪。",
    ja: "モロッコの台所はゆっくり動く——保存レモンと肉を土のタジンに閉じ込め、ハリーラはレンズ豆とトマトで濃くなり、ラス・エル・ハヌートがすべての皿に香る。スパイスとドライフルーツと時間が一緒に料理をする。",
    hi: "मोरक्को की रसोई धीमी गति से चलती है — संरक्षित नींबू और गोश्त से भरी मिट्टी की ताजीन, मसूर और टमाटर से गाढ़ा होता हरीरा, हर पकवान में रस एल हनूत की सुगंध। मसाला, फल और वक्त मिलकर पकाते हैं।",
    ko: "모로코의 주방은 천천히 움직인다 — 절인 레몬과 고기를 품은 흙 타진, 렌틸과 토마토로 걸쭉해지는 하리라, 모든 요리에 배어드는 라스 엘 하누트 향. 향신료와 말린 과일과 시간이 함께 요리한다.",
  },
  'Tunisia': {
    en: "Tunisian cooking warms with harissa — brik fried until the egg sets just right, chakchouka bubbling with tomato and pepper. Olive oil and chili are everywhere; the heat is direct and unapologetic.",
    ro: "Bucătăria tunisiană încălzește cu harissa — brik prăjit până oul prinde exact bine, chakchouka clocotind cu roșii și ardei. Uleiul de măsline și ardeiul iute sunt peste tot; căldura e directă, fără scuze.",
    ar: "يُدفّئ الطبخ التونسي بالهريسة — بريك مقلية حتى ينضج البيض تماماً، وشكشوكة تغلي بالطماطم والفلفل. زيت الزيتون والفلفل الحار في كل مكان؛ الحرارة مباشرة وبلا اعتذار.",
    zh: "突尼斯料理以哈里萨辣椒酱为底色——油炸至蛋黄刚好凝固的布里克，翻滚着番茄和甜椒的沙克舒卡。橄榄油与辣椒无处不在，辣度直接而毫不掩饰。",
    ja: "チュニジア料理はハリッサで温める——卵がちょうどよく固まるまで揚げたブリク、トマトとピーマンで煮立つシャクシュカ。オリーブオイルと唐辛子はどこにでもあり、辛さは直接的で言い訳しない。",
    hi: "ट्यूनीशियाई खाना हरीसा से गर्माहट देता है — ब्रिक तला जाए जब तक अंडा ठीक सेट हो, टमाटर और मिर्च में खदखदाती चकचोका। जैतून का तेल और मिर्च हर जगह; तीखापन सीधा, बिना माफी।",
    ko: "튀니지 요리는 하리사로 온기를 더한다 — 달걀이 딱 맞게 익을 때까지 튀기는 브리크, 토마토와 고추가 보글보글 끓는 샥슈카. 올리브 오일과 고추는 어디에나 있고, 매운맛은 직접적이며 사과하지 않는다.",
  },

  // ── Latin
  'Mexico': {
    en: "Mexico cooks loud and bright — chiles charred to a smoke, masa warmed on a comal, salsa pounded fresh in the molcajete. From street stands to home tables, the constant is heat balanced by lime and rendered fat.",
    ro: "Mexicul gătește tare și luminos — ardei arși până fac fum, masa încălzit pe comal, salsa pisat proaspăt în molcajete. De la tarabe la mesele de acasă, constanta e căldură echilibrată de lime și grăsime topită.",
    ar: "يطبخ المكسيك بصوت عالٍ وألوان زاهية — فلفل حار مشوي حتى يُصدر دخاناً، وماسا مُسخّن على الكومال، وسالسا مطحونة طازجة في المولكاخيتي. من أكشاك الشوارع إلى موائد البيوت، الثابت هو الحرارة يوازنها الليم والدهن المُذاب.",
    zh: "墨西哥料理热烈而鲜艳——辣椒烤至焦香冒烟，玉米面在铁板上加热，萨尔萨酱在石臼里现捣现用。从街边摊到家庭餐桌，不变的是辣味，由青柠和油脂来平衡。",
    ja: "メキシコは大きな声で鮮やかに料理する——煙が出るまで焦がした唐辛子、コマルで温めたマサ、モルカヘテで挽きたてのサルサ。屋台から家の食卓まで、共通するのはライムと溶かした油脂で整えた辛さだ。",
    hi: "मेक्सिको तेज़ और चमकीला पकाता है — धुआँ उठाने तक जली मिर्च, कोमल पर गरम किया मासा, मोलकाहेटे में ताज़ा पीसी सालसा। सड़क के ठेले से घर की मेज़ तक — नींबू और चर्बी से संतुलित तीखापन।",
    ko: "멕시코는 크고 선명하게 요리한다 — 연기가 날 때까지 그을린 고추, 코말에서 데운 마사, 몰카헤테에서 갓 빻은 살사. 길거리 포장마차부터 집 식탁까지, 공통점은 라임과 기름진 맛으로 균형 잡힌 매운맛이다.",
  },
  'Peru': {
    en: "Peru cooks where ocean meets the Andes — lime-cured ceviche on the coast, potato-rich causa from highland kitchens, lomo saltado borrowing wok craft from Chinese arrivals. Bright acid, bold contrast, working altitude.",
    ro: "Peru gătește unde oceanul întâlnește Anzii — ceviche marinat în lime pe coastă, causa cu cartofi din bucătăriile de altitudine, lomo saltado împrumutând wok-ul de la chinezi. Aciditate luminoasă, contrast curajos.",
    ar: "يطبخ بيرو حيث يلتقي المحيط بجبال الأنديز — سيفيتشي مُتبّل بالليم على الساحل، وكاوسا غني بالبطاطس من مطابخ المرتفعات، ولومو سالتادو يستعير الووك من المهاجرين الصينيين. حموضة زاهية وتناقض جريء.",
    zh: "秘鲁料理生长在大洋与安第斯山脉的交汇处——海边有柠汁腌制的酸橘汁腌鱼，高原厨房里有土豆厚饼，炒牛肉则借鉴了中国移民带来的锅气。酸味明亮，对比大胆。",
    ja: "ペルーは海とアンデスが出会う場所で料理する——海岸でライムに漬けたセビーチェ、高地の台所からじゃがいもたっぷりのカウサ、中国系移民の中華鍋の技を借りたロモ・サルタード。明るい酸味と大胆なコントラスト。",
    hi: "पेरू वहाँ पकाता है जहाँ समुद्र और एंडीज़ मिलते हैं — तट पर नींबू में पकी सेविचे, ऊँचाई की रसोई में आलू भरी कौसा, चीनी प्रवासियों की वोक-कला में पका लोमो साल्टादो। चमकीली अम्लता, साहसी विपरीतता।",
    ko: "페루는 바다와 안데스가 만나는 곳에서 요리한다 — 해안에서 라임에 절인 세비체, 고원 부엌의 감자 가득한 카우사, 중국 이민자의 웍 기술로 만든 로모 살타도. 밝은 산미, 대담한 대비.",
  },
  'Argentina': {
    en: "Argentina cooks for the asado — open fire, beef, salt — but the kitchen runs on hand pies and milanesa pounded thin. Chimichurri sits on every table; the bread is there to mop the plate clean.",
    ro: "Argentina gătește pentru asado — foc deschis, vită, sare — dar bucătăria merge pe plăcinte și milanesa bătute subțire. Chimichurri stă pe fiecare masă; pâinea e acolo pentru a curăța farfuria.",
    ar: "تطبخ الأرجنتين من أجل الأساذو — نار مفتوحة ولحم بقر وملح — لكن المطبخ يعتمد على الفطائر وميلانيزا المدقوقة رفيعة. التشيميتشوري على كل مائدة؛ والخبز لمسح الطبق نظيفاً.",
    zh: "阿根廷为烤肉而烹饪——明火、牛肉、盐——但家常料理靠的是手工馅饼和捶薄的米兰式肉排。奇米奇里酱摆在每张桌上，面包用来把盘子擦干净。",
    ja: "アルゼンチンはアサードのために料理する——オープンファイアと牛肉と塩——だが台所はエンパナーダと薄く打ったミラネサで動く。チミチュリはすべての食卓にあり、パンは皿をきれいに拭うためにある。",
    hi: "अर्जेंटीना असादो के लिए पकाता है — खुली आग, गोमाँस, नमक — लेकिन रसोई हाथ से बने पाई और पतली मिलानेसा पर चलती है। हर मेज़ पर चिमिचुर्री; रोटी थाली साफ करने के लिए।",
    ko: "아르헨티나는 아사도를 위해 요리한다 — 장작불, 소고기, 소금 — 하지만 부엌은 손으로 빚은 엠파나다와 얇게 두드린 밀라네사로 돌아간다. 모든 식탁의 치미추리; 빵은 접시를 닦아내기 위해 있다.",
  },
  'Brazil': {
    en: "Brazilian cooking ranges from beach to interior — slow feijoada with black beans and smoked pork, coconut-rich moqueca simmered in clay pots. Citrus, hot pepper and rice anchor every plate.",
    ro: "Bucătăria braziliană se întinde de la plajă la interior — feijoada lentă cu fasole neagră și porc afumat, moqueca cu lapte de cocos fiartă în oale de lut. Citrice, ardei iute și orez ancorează fiecare farfurie.",
    ar: "يمتد الطبخ البرازيلي من الشاطئ إلى الداخل — فيجوادا بطيئة بالفاصوليا السوداء ولحم الخنزير المدخن، وموكيكا غنية بجوز الهند تُطهى في أواني فخارية. الحمضيات والفلفل الحار والأرز تُثبّت كل طبق.",
    zh: "巴西料理从海滩延伸至内陆——黑豆配熏猪肉的黑豆炖肉需要慢慢等待，椰奶炖鱼在陶锅里慢慢熟透。柑橘、辣椒和米饭为每道菜奠定基础。",
    ja: "ブラジル料理はビーチから内陸まで広がる——黒豆と薫製豚のゆっくり煮込んだフェイジョアーダ、土鍋で煮たコクのあるムケカ。柑橘と唐辛子と米がすべての皿の土台をなす。",
    hi: "ब्राज़ीलियाई खाना तट से भीतरी हिस्से तक फैला है — काली बींस और धुएँ वाले सूअर की धीमी फेइजोआदा, मिट्टी के बर्तन में नारियल वाली मोकेका। खट्टे फल, तीखी मिर्च और चावल हर थाली को संभालते हैं।",
    ko: "브라질 요리는 해변에서 내륙까지 펼쳐진다 — 검은콩과 훈제 돼지고기로 천천히 끓인 페이조아다, 질그릇에서 코코넛과 함께 익힌 무케카. 감귤, 고추, 쌀이 모든 접시의 기반을 이룬다.",
  },
  'Ecuador': {
    en: "Ecuadorian cooking is shaped by Pacific shore and Andean peaks — bright ceviches scattered with toasted corn, encebollado warm with tuna and yuca. Citrus, plantain and salt, the rhythm of altitude.",
    ro: "Bucătăria ecuadoriană e formată de coasta Pacificului și de Anzi — ceviche-uri luminoase presărate cu porumb prăjit, encebollado cald cu ton și yuca. Citrice, plantan și sare, ritmul altitudinii.",
    ar: "تتشكّل المطبخ الإكوادوري بين ساحل المحيط الهادئ وقمم الأنديز — سيفيتشي مضيء مرشوش بذرة الذرة المحمصة، وإنسيبوييادو دافئ بالتونة والكاسافا. حمضيات وموز وملح، إيقاع الارتفاع.",
    zh: "厄瓜多尔料理由太平洋海岸与安第斯高峰共同塑造——洒满烤玉米粒的酸橘汁腌鱼明亮清新，金枪鱼木薯浓汤温暖扎实。柑橘、芭蕉与盐，是高原的节奏。",
    ja: "エクアドル料理は太平洋岸とアンデスの山頂に形作られる——炒ったトウモロコシを散らした爽やかなセビーチェ、マグロとユカで温かいエンセボジャード。柑橘とバナナと塩、高地のリズム。",
    hi: "इक्वाडोरियाई खाना प्रशांत तट और एंडीज़ की चोटियों से बना है — भुने मकई के साथ चमकदार सेविचे, टूना और यूका वाली गरम एन्सेबोजादो। खट्टे फल, केला और नमक — ऊँचाई की लय।",
    ko: "에콰도르 요리는 태평양 해안과 안데스 봉우리 사이에서 빚어진다 — 볶은 옥수수를 뿌린 밝은 세비체, 참치와 유카로 따뜻한 엔세보야도. 감귤과 플랜테인과 소금, 고도의 리듬.",
  },
  'Cuba': {
    en: "Cuban cooking moves slowly with garlic, citrus and oregano — ropa vieja shredded and simmered with peppers, picadillo loaded with olives and raisins. Sweet plantains finish the plate; rice keeps the peace.",
    ro: "Bucătăria cubaneză merge încet cu usturoi, citrice și oregano — ropa vieja destrămat și fiert cu ardei, picadillo plin de măsline și stafide. Banane dulci închid farfuria; orezul ține pacea.",
    ar: "يتحرك المطبخ الكوبي ببطء مع الثوم والحمضيات والأوريغانو — روبا بيخا مُمزق ومطهو مع الفلفل، وبيكاديلو محشو بالزيتون والزبيب. موز حلو يختتم الطبق؛ والأرز يحفظ السلام.",
    zh: "古巴料理随蒜香、柑橘和牛至缓缓前行——碎肉与甜椒同炖的破烂衣，橄榄与葡萄干丰盈的碎牛肉。甜大蕉作结，米饭维持平衡。",
    ja: "キューバ料理はにんにくと柑橘とオレガノとともにゆっくり動く——ピーマンと細く煮込んだロパ・ビエハ、オリーブとレーズンたっぷりのピカジリョ。甘いバナナが皿を締め、ごはんが平和を保つ。",
    hi: "क्यूबाई खाना लहसुन, खट्टे फलों और ओरेगैनो के साथ धीरे-धीरे चलता है — मिर्च में उबली और चीरी हुई रोपा विएहा, ज़ैतून और किशमिश से भरी पिकाडिलो। मीठा केला थाली बंद करता है; चावल शांति बनाए रखता है।",
    ko: "쿠바 요리는 마늘, 감귤, 오레가노와 함께 천천히 움직인다 — 고추와 함께 조려 찢은 로파 비에하, 올리브와 건포도를 가득 넣은 피카디요. 달콤한 플랜테인이 접시를 마무리하고, 밥이 평화를 지킨다.",
  },

  // ── Eastern European
  'Romania': {
    en: "Romanian cooking comes from cold winters and big tables — sarmale wrapped tight in cabbage leaves, ciorbă tangy with fermented bran. Plenty of dill, sour cream and slow oven hours spent waiting.",
    ro: "Bucătăria românească vine din ierni reci și mese mari — sarmale rulate strâns în foi de varză, ciorbă acrită cu borș. Mărar din belșug, smântână, ore lungi în cuptor și răbdare la masă.",
    ar: "يأتي المطبخ الروماني من شتاء قارس وموائد كبيرة — سارمالي ملفوفة بإحكام في أوراق الملفوف، وتشيوربا حامضة بنخالة الجاودار المخمرة. شبت وفير وقشدة حامضة وساعات طويلة في الفرن.",
    zh: "罗马尼亚料理来自寒冬与大桌聚餐——紧紧包裹在白菜叶里的萨尔马利，用发酵黑麦水调酸的肉汤。莳萝、酸奶油，和漫长的窑烤时光。",
    ja: "ルーマニア料理は寒い冬と大きな食卓から生まれる——キャベツの葉に固く巻いたサルマーレ、発酵した小麦ふすまで酸っぱくしたチョルバ。ディルをたっぷりとサワークリーム、オーブンで過ごす長い時間。",
    hi: "रोमानियाई खाना ठंडी सर्दियों और बड़ी मेज़ों से आता है — गोभी की पत्तियों में कसकर लिपटी सारमाले, किण्वित चोकर से खट्टी चोर्बा। खूब सारी सोंफ, खट्टी क्रीम और ओवन में बिताए लंबे घंटे।",
    ko: "루마니아 요리는 추운 겨울과 넓은 식탁에서 온다 — 양배추 잎에 꽉 말아 넣은 사르말레, 발효 밀기울로 새콤한 초르바. 딜을 듬뿍 얹고 사우어크림을 더해, 오븐에서 긴 시간을 보낸다.",
  },
  'Hungary': {
    en: "Hungarian cooking centers on paprika — sweet, smoked, hot — bloomed in lard before anything else. Goulash runs deep and dark, paprikash mellows with sour cream, lángos comes crackling out of the fryer.",
    ro: "Bucătăria maghiară se învârte în jurul boielii — dulce, afumată, iute — înflorită în untură înainte de orice. Gulașul e adânc și închis, paprikash-ul se îmblânzește cu smântână, lángos-ul iese sfârâind din ulei.",
    ar: "يتمحور المطبخ المجري حول الفلفل الحلو — الحلو والمدخن والحار — يُنعّم في الشحم قبل أي شيء آخر. الغولاش عميق وداكن، والبابريكاش يُلطّف بالقشدة الحامضة، واللانغوش يخرج مقرمشاً من المقلاة.",
    zh: "匈牙利料理以红椒粉为核心——甜的、烟熏的、辣的——先在猪油中炒香再做其他。浓郁深色的古拉什，酸奶油调和的鸡肉炖菜，从油锅里捞出来的炸面包脆而喷香。",
    ja: "ハンガリー料理はパプリカを中心に回る——甘い、薫製、辛い——まず何よりも先にラードで香らせる。グヤーシュは深く濃く、パプリカーシュはサワークリームで和らぎ、ラーンゴシュは揚げてカリカリ出てくる。",
    hi: "हंगेरियाई खाना पेपरिका के इर्द-गिर्द घूमता है — मीठी, धुएँदार, तीखी — चरबी में पहले सुगंधित। गुलाश गहरा और गहरे रंग का है, पपरीकाश खट्टी क्रीम से नरम होती है, लांगोश कड़ाही से कुरकुरा निकलता है।",
    ko: "헝가리 요리는 파프리카를 중심으로 돈다 — 달고, 훈제되고, 매운 — 무엇보다 먼저 라드에서 향을 낸다. 굴라시는 깊고 진하며, 파프리카시는 사워크림으로 부드러워지고, 랑고시는 튀김 솥에서 바삭하게 나온다.",
  },
  'Poland': {
    en: "Polish kitchens warm against winter — pierogi pinched by hand, mushroom soups deep with dill, sour rye soup at Easter. Comfort food that doesn't apologize for butter or for second helpings.",
    ro: "Bucătăriile poloneze se încălzesc împotriva iernii — pierogi modelați cu mâna, supe de ciuperci cu mărar, supă acră de secară la Paște. Mâncare consistentă care nu se scuză pentru unt sau pentru porția a doua.",
    ar: "تتدفأ المطابخ البولندية في مواجهة الشتاء — بيروغي تُشكّل باليد، وحساء فطر عطر بالشبت، وحساء الجاودار الحامض في عيد الفصح. طعام مريح لا يعتذر عن الزبدة أو الحصة الثانية.",
    zh: "波兰厨房抵御冬日严寒——手工捏制的饺子、飘着莳萝香的蘑菇汤、复活节餐桌上的酸黑麦汤。丰盛的家常味，对黄油和加菜毫不客气。",
    ja: "ポーランドの台所は冬に向かって温まる——手で摘まんだピエロギ、ディルたっぷりのきのこスープ、イースターの酸っぱいライ麦スープ。バターにも二杯目にも謝らないコンフォートフードだ。",
    hi: "पोलिश रसोई सर्दियों की मार झेलती है — हाथ से बने पीरोगी, सोंफ से महकता मशरूम सूप, ईस्टर पर खट्टा राई सूप। मक्खन और दूसरी परोसन के लिए माफी न माँगने वाला आरामदेह खाना।",
    ko: "폴란드 부엌은 겨울을 견딘다 — 손으로 빚은 피에로기, 딜 향이 그윽한 버섯 수프, 부활절의 새콤한 호밀 수프. 버터에도 두 번째 덜어먹기에도 사과하지 않는 위로 음식이다.",
  },
  'Russia': {
    en: "Russian cooking is winter cooking — borscht deep with beet and meat, kotlety pan-fried golden, solyanka rich with brine. Black bread, sour cream and dill quietly do most of the seasoning.",
    ro: "Bucătăria rusească e bucătărie de iarnă — borș adânc cu sfeclă și carne, kotlety prăjite auriu, solyanka bogat în saramură. Pâine neagră, smântână și mărar fac mare parte din asezonare.",
    ar: "المطبخ الروسي هو طبخ الشتاء — بورش عميق باللبنجر واللحم، وكوتليتي مقلية ذهبية، وسوليانكا غنية بالمخلل. الخبز الأسود والقشدة الحامضة والشبت يقومون بمعظم التتبيل بصمت.",
    zh: "俄罗斯料理是冬天的料理——甜菜与肉炖出深色的罗宋汤，煎至金黄的肉饼，咸味浓郁的杂烩汤。黑面包、酸奶油和莳萝，静静完成了大部分调味。",
    ja: "ロシア料理は冬の料理——ビーツと肉の深いボルシチ、黄金色に揚げたコトレトゥイ、漬け汁たっぷりのソリャンカ。黒パンとサワークリームとディルが静かにほとんどの味付けを担う。",
    hi: "रूसी खाना सर्दियों का खाना है — चुकंदर और गोश्त का गहरा बोर्श, सुनहरा तला कोत्लेती, मसालेदार नमकीन पानी वाली सोलयंका। काली रोटी, खट्टी क्रीम और सोंफ चुपचाप अधिकतर मसाला करती है।",
    ko: "러시아 요리는 겨울의 요리다 — 비트와 고기로 진한 보르시, 황금빛으로 지진 코틀레티, 절임물 가득한 솔랸카. 흑빵과 사워크림과 딜이 조용히 대부분의 간을 맡는다.",
  },
  'Georgia': {
    en: "Georgian cooking opens around the supra — long-table dinners with toasts, walnuts and pomegranate. Khachapuri straight from a clay oven, khinkali pinched into pleated dumplings, herbs everywhere on the plate.",
    ro: "Bucătăria georgiană se deschide în jurul mesei supra — cine lungi cu toasturi, nuci și rodie. Khachapuri direct din cuptor de lut, khinkali strânși în colțunași plisați, ierburi peste tot pe farfurie.",
    ar: "يُفتح المطبخ الجورجي حول مائدة السوبرا — عشاء طويل بالنخبات والجوز والرمان. خاتشابوري مباشر من فرن الطين، وخينكالي يُشكّل في شكل فطائر مطوية، وأعشاب في كل مكان على الطبق.",
    zh: "格鲁吉亚料理在苏普拉长桌宴中展开——举杯、核桃与石榴贯穿始终。奶酪面包从陶土烤炉中直接取出，肉汁饺子捏成褶皱，香草铺满整个盘子。",
    ja: "グルジア料理はスプラの食卓から開く——乾杯とクルミとザクロで長く続く夕食。土窯から直接出てきたハチャプリ、ひだ飾りのヒンカリ、皿のいたるところにハーブ。",
    hi: "जॉर्जियाई खाना सुप्रा की लंबी मेज़ के इर्द-गिर्द खुलता है — टोस्ट, अखरोट और अनार के साथ लंबा रात का खाना। मिट्टी के तंदूर से सीधी खाचापुरी, मुड़ी हुई खिंकाली, हर थाली पर जड़ी-बूटियाँ।",
    ko: "조지아 요리는 수프라 긴 식탁 주위에서 열린다 — 건배와 호두와 석류로 이어지는 저녁. 흙 화덕에서 바로 나온 하차푸리, 주름 잡힌 힌칼리, 접시마다 가득한 허브.",
  },

  // ── Nordic
  'Sweden': {
    en: "Sweden cooks for the long winter — salmon cured in dill, meatballs in cream gravy, cinnamon buns warmed with cardamom. Calm flavors, careful seasoning, fika treated as a daily ritual rather than a break.",
    ro: "Suedia gătește pentru iarna lungă — somon marinat cu mărar, chiftele în sos de smântână, chifle cu scorțișoară și cardamom. Arome calme, condimentare atentă, fika tratată ca un ritual zilnic, nu ca o pauză.",
    ar: "تطبخ السويد لاستقبال الشتاء الطويل — سمك السلمون المتبل بالشبت، وكرات اللحم في صلصة القشدة، وكعك القرفة الدافئ بالهيل. نكهات هادئة وتتبيل دقيق، والفيكا طقس يومي لا مجرد راحة.",
    zh: "瑞典料理为漫长的冬天而烹饪——莳萝腌制的三文鱼、奶油汁配的肉丸、飘着豆蔻香的肉桂卷。味道平和，调味细腻，下午茶仪式是每日的庄重时刻。",
    ja: "スウェーデンは長い冬に向けて料理する——ディルで漬けたサーモン、クリームグレイビーのミートボール、カルダモンで温めたシナモンバン。落ち着いた味、丁寧な味付け、フィーカは休憩ではなく毎日の儀式として扱われる。",
    hi: "स्वीडन लंबी सर्दियों के लिए पकाता है — सोंफ में मैरीनेट किया सैल्मन, क्रीम ग्रेवी के साथ मीटबॉल, इलायची से सुगंधित दालचीनी बन। शांत स्वाद, सावधान मसाला, फिका रोज़ाना का अनुष्ठान।",
    ko: "스웨덴은 긴 겨울을 위해 요리한다 — 딜에 절인 연어, 크림 그레이비 미트볼, 카다몸 향의 시나몬번. 차분한 맛, 세심한 양념, 피카는 쉬는 시간이 아니라 매일의 의식이다.",
  },
  'Finland': {
    en: "Finnish cooking draws flavor from cold landscape — rye-crust Karelian pies, dill-bright salmon soup, dense rye bread on every counter. Quiet meals, careful seasoning, deep respect for the lakes and forests.",
    ro: "Bucătăria finlandeză extrage gust din peisajul rece — plăcinte kareliane cu coajă de secară, supă de somon cu mărar, pâine densă de secară pe orice blat. Mese liniștite, condimentare atentă, respect adânc pentru lacuri și păduri.",
    ar: "يستخلص المطبخ الفنلندي النكهة من المناخ البارد — فطائر كاريلية بقشرة الجاودار، وحساء السلمون الزاهي بالشبت، وخبز الجاودار الثقيل على كل رف. وجبات هادئة وتتبيل دقيق واحترام عميق للبحيرات والغابات.",
    zh: "芬兰料理从寒冷的大地中提炼风味——黑麦皮的卡累利阿馅饼、莳萝点缀的三文鱼汤、每块台面上都有的密实黑麦面包。饮食安静，调味审慎，对湖泊与森林怀有深沉的敬意。",
    ja: "フィンランド料理は寒い風景から風味を引き出す——ライ麦の皮のカレリアパイ、ディルの明るいサーモンスープ、どのカウンターにも置かれた重いライ麦パン。静かな食事、丁寧な味付け、湖と森への深い敬意。",
    hi: "फिनिश खाना ठंडे परिदृश्य से स्वाद खींचता है — राई की परत वाले करेलियन पाई, सोंफ से सजा सैल्मन सूप, हर काउंटर पर भारी राई रोटी। शांत भोजन, सावधान मसाला, झीलों और जंगलों का गहरा सम्मान।",
    ko: "핀란드 요리는 차가운 풍경에서 맛을 끌어낸다 — 호밀 껍질의 카렐리안 파이, 딜이 싱그러운 연어 수프, 모든 카운터의 묵직한 호밀빵. 고요한 식사, 세심한 양념, 호수와 숲에 대한 깊은 경의.",
  },

  // ── Sub-Saharan
  'Nigeria': {
    en: "Nigerian cooking is bold and communal — smoky jollof rice debated across the region, egusi soup thickened with melon seed and bitter greens. Palm oil, scotch bonnet, generous portions, no whispering.",
    ro: "Bucătăria nigeriană e curajoasă și comună — jollof rice afumat dezbătut în toată regiunea, supă de egusi îngroșată cu semințe de pepene și verdețuri amare. Ulei de palmier, ardei iute, porții generoase, fără șoaptă.",
    ar: "المطبخ النيجيري جريء وجماعي — أرز جولوف المدخن الذي يُتجادل عليه في أنحاء المنطقة، وحساء إيغوسي المكثّف ببذور البطيخ والخضروات المرّة. زيت النخيل وفلفل السكوتش بوني وحصص كريمة، بلا همسات.",
    zh: "尼日利亚料理热烈而集体——各地争论不休的烟熏炒饭、用瓜子和苦菜叶炖出的埃古西汤。棕榈油、苏格兰帽辣椒和大份量，没有轻声细语。",
    ja: "ナイジェリア料理は大胆で共同的だ——地域全体で議論される煙のジョロフライス、メロン種と苦い青菜で濃くしたエグシスープ。パームオイル、スコッチボネット唐辛子、気前のいい量、ひそひそ声はない。",
    hi: "नाइजीरियाई खाना साहसी और सामूहिक है — पूरे क्षेत्र में बहस का धुएँदार जोलोफ राइस, खरबूजे के बीज और कड़वी सब्ज़ियों से गाढ़ा एगुसी सूप। ताड़ का तेल, स्कॉच बोनेट मिर्च, उदार परोसन।",
    ko: "나이지리아 요리는 대담하고 공동체적이다 — 지역 전체가 논쟁하는 연기 자욱한 졸로프 라이스, 멜론 씨와 쓴 채소로 걸쭉한 에구시 수프. 팜 오일, 스카치 보닛 고추, 넉넉한 양, 속삭임 없이.",
  },

  // ── Anglo
  'USA': {
    en: "American cooking is regional, not national — New England clam chowder, Caribbean-rooted jerk, the cheeseburger from anywhere with a flattop. The thread that runs through everything is comfort done seriously.",
    ro: "Bucătăria americană e regională, nu națională — supă de scoici din New England, jerk din Caraibe, cheeseburger-ul de oriunde există o plită. Firul comun e mâncare de confort luată în serios.",
    ar: "الطبخ الأمريكي إقليمي لا وطني — شوبر كلام من نيو إنجلاند، وجيرك ذو جذور كاريبية، وتشيزبرغر من أي مكان يوجد فيه موقد مسطح. الخيط المشترك هو طعام الراحة المأخوذ بجدية.",
    zh: "美国料理是地方的而非全国的——新英格兰蛤蜊浓汤、源自加勒比的牙买加烤鸡、任何有铁板的地方都有的芝士汉堡。贯穿一切的，是认真对待的家常美食。",
    ja: "アメリカ料理は地域的で全国的ではない——ニューイングランドのクラムチャウダー、カリブ海ルーツのジャーク、どこの鉄板でも食べられるチーズバーガー。すべてを貫くのは真剣に作られたコンフォートフードだ。",
    hi: "अमेरिकी खाना राष्ट्रीय नहीं, क्षेत्रीय है — न्यू इंग्लैंड की क्लैम चाउडर, कैरिबियाई जड़ों वाला जर्क, कहीं भी मिलने वाला चीज़बर्गर। जो धागा सब को जोड़ता है वह है गंभीरता से लिया गया आरामदेह खाना।",
    ko: "미국 요리는 전국적이 아닌 지역적이다 — 뉴잉글랜드의 클램 차우더, 카리브해 뿌리의 저크, 어디서나 플랫탑 위의 치즈버거. 모든 것을 관통하는 실은 진지하게 만든 위로 음식이다.",
  },
  'Australia': {
    en: "Australian cooking borrows widely and barbecues constantly — peppery meat pies handed across counters, summer pavlova piled with passionfruit and cream. Coffee culture takes the rest seriously.",
    ro: "Bucătăria australiană împrumută peste tot și face grătar constant — plăcinte cu carne piperate, pavlova de vară cu fructul pasiunii și frișcă. Cultura cafelei tratează restul cu seriozitate.",
    ar: "يستعير الطبخ الأسترالي على نطاق واسع ويشوي باستمرار — فطائر اللحم الفلفلية تُمرَّر فوق العدادات، وبافلوفا الصيفية مكدسة بعصير الفاكهة الشغوفة والقشدة. ثقافة القهوة تأخذ الباقي بجدية.",
    zh: "澳大利亚料理广泛借鉴，烧烤不断——柜台递出的胡椒肉馅饼，夏日堆满百香果和奶油的蛋白甜饼。咖啡文化让这里认真对待其余的一切。",
    ja: "オーストラリア料理は広く借り、絶えずバーベキューをする——カウンター越しに渡されるペッパーミートパイ、パッションフルーツとクリームを積み上げた夏のパブロバ。コーヒー文化が残りを真剣に扱う。",
    hi: "ऑस्ट्रेलियाई खाना दुनिया भर से उधार लेता है और लगातार बारबेक्यू करता है — काउंटर पर मिलने वाले मिर्च वाले गोश्त के पाई, पैशनफ्रूट और क्रीम से सजा पावलोवा। कॉफी संस्कृति बाकी सब को गंभीरता से लेती है।",
    ko: "호주 요리는 폭넓게 빌려오고 끊임없이 바비큐를 한다 — 카운터 너머로 건네지는 후추 미트 파이, 패션프루트와 크림을 쌓은 여름 파블로바. 커피 문화가 나머지 전부를 진지하게 대한다.",
  },

  // ── Central European
  'Germany': {
    en: "German cooking is hearty and direct — pork schnitzel pounded thin, currywurst sliced on a paper plate, mustard and bread always close. Beer-hall comfort food, regional pride, no fuss.",
    ro: "Bucătăria germană e consistentă și directă — schnitzel de porc bătut subțire, currywurst feliat pe farfurie de hârtie, muștar și pâine mereu aproape. Mâncare de cârciumă bavareză, mândrie regională, fără agitație.",
    ar: "المطبخ الألماني صلب ومباشر — شنيتزل الخنزير مدقوق رفيع، وكاري فورست مُقطّع على طبق ورقي، ومستردة وخبز دائماً في المتناول. طعام مريح من بيوت البيرة، وفخر إقليمي بلا تكلف.",
    zh: "德国料理扎实而直接——捶薄的猪肉炸排、纸盘上切好的咖喱香肠、随时备着的芥末和面包。啤酒馆的抚慰食物，地方的骄傲，没有多余的矫情。",
    ja: "ドイツ料理はボリュームがあって直接的だ——薄く打った豚シュニッツェル、紙皿に切り分けたカリーヴルスト、常にそばにあるマスタードとパン。ビールホールのコンフォートフード、地域の誇り、余分な飾りはない。",
    hi: "जर्मन खाना दिल से भरा और सीधा है — पतला पीटा पोर्क श्नित्ज़ेल, कागज़ की थाली पर कटा करीवर्स्ट, मस्टर्ड और रोटी हमेशा पास। बियर हॉल का आरामदेह खाना, क्षेत्रीय गर्व, कोई दिखावा नहीं।",
    ko: "독일 요리는 든든하고 직설적이다 — 얇게 두드린 돼지 슈니첼, 종이 접시에 썰어 담은 커리부르스트, 언제나 곁에 있는 머스터드와 빵. 맥주홀의 위로 음식, 지역의 자부심, 군더더기 없이.",
  },
  'Switzerland': {
    en: "Swiss cooking turns dairy and potato into ritual — rösti crisped golden in a skillet, fondue bubbling at the center of the table. Mountain food, mountain restraint, a long spoon.",
    ro: "Bucătăria elvețiană transformă lactatele și cartofii în ritual — rösti crocant și auriu în tigaie, fondue clocotind în centrul mesei. Mâncare de munte, reținere de munte, o lingură lungă.",
    ar: "يحوّل المطبخ السويسري منتجات الألبان والبطاطس إلى طقس — روشتي مقرمش ذهبي في المقلاة، وفوندو يفور في مركز المائدة. طعام الجبال وضبط الجبال، وملعقة طويلة.",
    zh: "瑞士料理将奶制品与土豆变成仪式——铁锅里煎至金黄脆香的薯饼，在餐桌中央咕嘟冒泡的奶酪火锅。山地的食物，山地的内敛，一把长柄叉。",
    ja: "スイス料理は乳製品とじゃがいもを儀式に変える——フライパンで黄金色にカリカリのレシュティ、食卓の中央で煮立つフォンデュ。山の食べ物、山の節制、長いフォーク一本。",
    hi: "स्विस खाना डेयरी और आलू को अनुष्ठान में बदलता है — कड़ाही में सुनहरा कुरकुरा रोश्ती, मेज़ के केंद्र में खदखदाती फोंड्यू। पहाड़ी खाना, पहाड़ी संयम, एक लंबा चम्मच।",
    ko: "스위스 요리는 유제품과 감자를 의식으로 바꾼다 — 프라이팬에서 황금빛으로 바삭한 뢰스티, 식탁 중앙에서 보글거리는 퐁뒤. 산의 음식, 산의 절제, 긴 포크 하나.",
  },
  'Netherlands': {
    en: "Dutch cooking keeps it practical — mashed-vegetable stamppot, small puffy poffertjes dusted with sugar. Cabbage, sausage, hot mustard, gezellig company at a long pine table.",
    ro: "Bucătăria olandeză rămâne practică — stamppot cu legume pasate, poffertjes mici și pufoși cu zahăr pudră. Varză, cârnați, muștar iute, companie gezellig la o masă lungă de pin.",
    ar: "يحافظ المطبخ الهولندي على الأمور العملية — ستامبوت مع خضروات مهروسة، وبوفيرتييس صغيرة منتفخة مرشوشة بالسكر. ملفوف ونقانق ومستردة حارة وصحبة جيزيليخ حول طاولة صنوبر طويلة.",
    zh: "荷兰料理讲究实用——蔬菜泥土豆杂烩，撒着糖粉的小泡芙。卷心菜、香肠、浓芥末，围着一张长长的松木桌，温馨相伴。",
    ja: "オランダ料理は実用的に保つ——マッシュした野菜のスタンポット、砂糖をまぶした小さなふわふわのポフェルチェス。キャベツ、ソーセージ、辛いマスタード、長い松のテーブルを囲む和やかな食卓。",
    hi: "डच खाना व्यावहारिक रहता है — मसली हुई सब्ज़ियों वाली स्टैम्पोट, चीनी छिड़के छोटे फूले पोफरजेस। गोभी, सॉसेज, तीखी मस्टर्ड, लंबी मेज़ पर गर्मजोश दोस्त।",
    ko: "네덜란드 요리는 실용적을 유지한다 — 으깬 채소가 들어간 스탐팟, 설탕을 뿌린 작고 폭신한 포페르체스. 양배추, 소시지, 매콤한 머스터드, 긴 소나무 테이블을 둘러싼 훈훈한 자리.",
  },
  'Belgium': {
    en: "Belgian cooking is beer and butter — slow stoofvlees stewed in dark ale, moules-frites steamed open at the table. Frites with mayo are not a debate here, and the chocolate counter is taken seriously.",
    ro: "Bucătăria belgiană e bere și unt — stoofvlees fiert încet în bere brună, moules-frites deschise la masă. Cartofii prăjiți cu maioneză nu se dezbat aici, iar ciocolata e luată în serios.",
    ar: "المطبخ البلجيكي هو البيرة والزبدة — ستوفلييس مطهو ببطء في جعة داكنة، وموول-فريت تُفتح على الطاولة. البطاطس المقلية بالمايونيز ليست موضع جدال هنا، والشوكولاتة تؤخذ بجدية.",
    zh: "比利时料理是啤酒与黄油的世界——黑啤慢炖的法兰德斯牛肉、在餐桌上蒸开的青口配薯条。薯条配蛋黄酱在这里毋庸置疑，巧克力则是正经事。",
    ja: "ベルギー料理はビールとバター——ダークエールで煮込んだストーフフレース、テーブルで蒸し開けたムール・フリット。フリッツとマヨネーズは議論の余地がなく、チョコレートカウンターは真剣に扱われる。",
    hi: "बेल्जियाई खाना बियर और मक्खन है — काली एल में धीरे पकी स्टूफ्लीस, मेज़ पर खोले जाने वाले मुसल-फ्राइट। यहाँ फ्राइट और मेयोनेज़ पर बहस नहीं होती, और चॉकलेट काउंटर गंभीरता से।",
    ko: "벨기에 요리는 맥주와 버터다 — 다크 에일에 천천히 조린 스토프플레스, 식탁에서 열어 먹는 물-프리트. 감자튀김과 마요네즈는 여기서 논쟁거리가 아니고, 초콜릿 카운터는 진지하게 다뤄진다.",
  },

  // ── Central Asian
  'Uzbekistan': {
    en: "Uzbek cooking centers on plov — lamb, rice and carrots simmered for hours in a kazan — and manti, hand-pinched dumplings filled with onion and lamb. Bread baked in clay tandyrs, tea poured constantly.",
    ro: "Bucătăria uzbecă se învârte în jurul plov-ului — miel, orez și morcovi fierți ore întregi în kazan — și a manti-ului, colțunași făcuți cu mâna umpluți cu ceapă și miel. Pâine coaptă în tandyr de lut, ceai turnat constant.",
    ar: "يتمحور المطبخ الأوزبكي حول البلاو — لحم الضأن والأرز والجزر مطهوة لساعات في قدر الكازان — والمانتي، فطائر يدوية محشوة بالبصل والضأن. خبز مخبوز في تنادير طينية، وشاي يُسكب باستمرار.",
    zh: "乌兹别克料理以抓饭为核心——羊肉、米饭与胡萝卜在大铁锅里慢炖数小时——还有手工包制的羊肉洋葱蒸饺。陶土馕坑里烤出的面包，茶从不间断地倒着。",
    ja: "ウズベク料理はプロフを中心に据える——カザンで何時間も煮込む羊肉と米と人参——そして玉ねぎと羊肉を詰めた手で摘まんだマンティ。土のタンドールで焼いたパン、絶えず注がれるお茶。",
    hi: "उज़्बेक खाना पलाव के इर्द-गिर्द घूमता है — कड़ाही में घंटों पका मेमना, चावल और गाजर — और हाथ से बनाई प्याज़-मेमने से भरी मांती। मिट्टी के तंदूर में पकी रोटी, लगातार परोसी चाय।",
    ko: "우즈베크 요리는 플로프를 중심으로 선다 — 카잔에서 몇 시간 끓인 양고기와 쌀과 당근 — 그리고 양파와 양고기를 채운 손으로 빚은 만티. 흙 탄디르에서 구운 빵, 끊임없이 따라지는 차.",
  },
};
