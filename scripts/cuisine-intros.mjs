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
 *   - en + ro + ar + zh + ja: full editorial rewrite for all 44 hub-eligible cuisines
 *   - other 9 locales: fall back to the locale's templated intro in
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
  },
  'Greece': {
    en: "Greek cooking smells like oregano, olive oil and lemon zest — moussaka layered in baking trays, souvlaki turning over coals, spinach folded into thin phyllo. A coastal table, generous and unhurried.",
    ro: "Bucătăria grecească miroase a oregano, ulei de măsline și coajă de lămâie — moussaka în straturi, souvlaki rotit pe jar, spanac împăturit în foi subțiri de plăcintă. O masă mediteraneană, generoasă, fără grabă.",
    ar: "المطبخ اليوناني يفوح بالأوريغانو وزيت الزيتون وقشر الليمون — موساكا في طبقات داخل أواني الخبز، سوفلاكي فوق الجمر، وسبانخ مطوية في رقائق الفيلو الرفيعة. مائدة ساحلية كريمة بلا استعجال.",
    zh: "希腊料理散发着牛至、橄榄油和柠檬皮的香气——层层叠叠的慕萨卡、炭火上翻转的烤串、包裹在薄薄酥皮里的菠菜馅饼。这是一张地中海餐桌，大方而从容。",
    ja: "ギリシャ料理にはオレガノとオリーブオイル、レモンの皮の香りが漂う——焼き皿に重ねたムサカ、炭火でくるりと回すスブラキ、薄いフィロ生地に包んだほうれん草のパイ。海沿いの食卓は大らかで、のんびりしている。",
  },
  'Spain': {
    en: "Spain cooks between Andalusian sun and Valencian rice fields — chilled gazpacho when the heat won't quit, saffron-stained paella on a wide steel pan. Olive oil is the constant; the rest is fierce regional pride.",
    ro: "Spania gătește între soarele Andaluziei și orezăriile Valenciei — gazpacho rece când căldura nu cedează, paella cu șofran pe tigaie lată. Uleiul de măsline e singurul element comun; restul e mândrie regională.",
    ar: "تطبخ إسبانيا بين شمس الأندلس وحقول أرز فالنسيا — غاسباتشو بارد حين يأبى الحر الرحيل، والبايييا المعصفرة في مقلاة فولاذية عريضة. زيت الزيتون ثابت لا يتغير؛ وما سواه فخر إقليمي لا تنازل عنه.",
    zh: "西班牙在安达卢西亚的阳光与瓦伦西亚稻田之间烹饪——暑热难耐时有冰镇冷汤，宽口钢锅里盛着藏红花染色的海鲜饭。橄榄油是永恒的底色，其余的都是各地区的骄傲。",
    ja: "スペインはアンダルシアの陽光とバレンシアの水田の間で料理する——暑さが続く日には冷たいガスパチョ、幅広い鉄製のパンにはサフラン色のパエリャ。オリーブオイルだけが変わらず、あとは激しい地域の誇りだ。",
  },
  'France': {
    en: "France runs on slow technique — butter, wine, patience. Whether it's a Provençal ratatouille or a Burgundy braise, the recipes carry their region in their bones and trust the cook to take their time.",
    ro: "Bucătăria franceză merge pe tehnică lentă — unt, vin, răbdare. Fie că e o ratatouille provensală sau un bourguignon din Burgundia, fiecare rețetă își poartă regiunea în oase și are încredere în timpul bucătarului.",
    ar: "المطبخ الفرنسي يعتمد على التقنية البطيئة — الزبدة والنبيذ والصبر. سواء كانت راتاتوي بروفانسالية أو طاجن مطهو ببطء من بورغونيا، تحمل الوصفات منطقتها في جوهرها وتثق في وقت الطاهي.",
    zh: "法国料理依赖缓慢的技艺——黄油、红酒、耐心。无论是普罗旺斯的炖蔬菜还是勃艮第的红酒炖肉，每道菜都在骨子里携带着它的产地，并信任厨师愿意花时间等待。",
    ja: "フランス料理はゆっくりとした技法で動く——バター、ワイン、忍耐。プロヴァンスのラタトゥイユであれブルゴーニュの煮込みであれ、レシピは土地の記憶を宿し、料理人が時間をかけることを信頼する。",
  },
  'Portugal': {
    en: "Portuguese cooking is salt cod, olive oil and slow Atlantic afternoons — bacalhau cooked a hundred ways, beans simmered with chouriço. Quiet, rooted, generous with seafood and unhurried with stew.",
    ro: "Bucătăria portugheză e cod sărat, ulei de măsline și după-amieze atlantice — bacalhau gătit în o sută de feluri, fasole fiartă încet cu chouriço. Liniștită, înrădăcinată, generoasă cu fructe de mare.",
    ar: "المطبخ البرتغالي هو سمك القد المملح وزيت الزيتون وأمسيات أطلنطية طويلة — باكاليا يُطهى بمئة طريقة، وفاصوليا تتسلق ببطء مع الشوريثو. هادئ وراسخ، سخي مع المأكولات البحرية وصبور مع الطواجن.",
    zh: "葡萄牙料理是咸鳕鱼、橄榄油和漫长的大西洋午后——腌鳕鱼有百余种做法，香肠炖豆子慢火细煨。安静、朴实，对海鲜慷慨，对炖菜从不着急。",
    ja: "ポルトガル料理は塩漬けのタラとオリーブオイル、のんびりした大西洋の午後でできている——バカリャウは百通りの調理法があり、豆はチョウリソとともにじっくり煮込まれる。静かで、根づいていて、魚介に寛大だ。",
  },
  'Croatia': {
    en: "Croatian cooking wanders between coast and inland — grilled ćevapi with raw onion, pašticada braised for hours with prunes and Dalmatian red wine. Olive oil on the sea side, paprika and pork inland.",
    ro: "Bucătăria croată se mișcă între coastă și interior — ćevapi pe grătar cu ceapă crudă, pašticada gătită ore întregi cu prune și vin roșu dalmațian. Ulei de măsline lângă mare, boia și porc în continent.",
    ar: "المطبخ الكرواتي يتنقل بين الساحل والداخل — تشيفابي مشوية مع البصل الطازج، وباشتيتشادا مطهية لساعات مع الخوخ ونبيذ دالماتيا الأحمر. زيت الزيتون على الجانب البحري، والفلفل الحار ولحم الخنزير في الداخل.",
    zh: "克罗地亚料理游走于海岸与内陆之间——烤制的切瓦皮配生洋葱，帕什提恰达用梅子和达尔马提亚红酒慢炖数小时。海边用橄榄油，内陆用红椒粉和猪肉。",
    ja: "クロアチア料理は海岸と内陸を行き来する——生玉ねぎと焼いたチェヴァピ、プラムとダルマチア産赤ワインで何時間も煮込んだパシュティツァダ。海側はオリーブオイル、内陸はパプリカと豚肉だ。",
  },

  // ── East Asian
  'Japan': {
    en: "Japan eats by precision and quiet contrast — broths simmered for hours, rice rinsed until clean, garnishes placed with intent. Ramen counters, sushi bars and home kitchens all share the same restraint.",
    ro: "Japonia gătește cu precizie și contrast tăcut — supe fierte ore întregi, orez clătit până la transparență, garnituri așezate cu intenție. Tarabele cu ramen, tejghelele de sushi și bucătăriile de acasă împart aceeași disciplină.",
    ar: "يأكل اليابانيون بدقة وتناقض هادئ — مرقة تغلي لساعات، وأرز يُشطف حتى يصفو، وزينة تُوضع بنية. طاولات الرامن وبارات السوشي ومطابخ البيوت تشترك في ضبط النفس ذاته.",
    zh: "日本料理追求精准与静默的对比——高汤文火熬数小时，米饭反复淘洗至透亮，摆盘装饰皆有深意。拉面馆、寿司吧和家庭厨房，共同遵守着同一种克制。",
    ja: "日本料理は精度と静かな対比で成り立つ——何時間もかけた出汁、透き通るまで研いだ米、意図して添えた飾り。ラーメンカウンター、寿司カウンター、家の台所——すべてが同じ節制を共有している。",
  },
  'China': {
    en: "Chinese cooking respects the wok and the clock — high heat for a fast stir-fry, slow simmer for a stew, oil bloomed with garlic and Sichuan pepper before anything else hits the pan.",
    ro: "Bucătăria chinezească respectă wok-ul și ceasul — foc mare pentru sotat rapid, fierbere înceată pentru tocănițe, ulei aromat cu usturoi și piper Sichuan înainte de orice altceva.",
    ar: "يحترم المطبخ الصيني الووك والوقت — حرارة عالية لقلي سريع، وغليان خفيف للطواجن، وزيت يتفتح بالثوم وفلفل سيشوان قبل أي شيء آخر يصل إلى المقلاة.",
    zh: "中国烹饪尊重锅与时间——大火快炒，慢火细炖，蒜与花椒先在热油中爆香，再下其他食材。从南方清蒸到北方炖煮，每道菜都有自己的节奏。",
    ja: "中国料理は中華鍋と時間を大切にする——強火でさっと炒める、弱火でじっくり煮込む、何より先に熱した油でにんにくと花椒を香らせる。南の蒸し物から北の煮込みまで、それぞれのリズムがある。",
  },
  'South Korea': {
    en: "Korean cooking turns fermentation into a national pantry — kimchi crocks, doenjang stews, gochujang glazes. Banchan plates surround every meal; rice and shared heat carry the conversation.",
    ro: "Bucătăria coreeană transformă fermentația într-o cămară națională — borcane de kimchi, tocănițe de doenjang, glazuri de gochujang. Farfuriile de banchan înconjoară fiecare masă; orezul și picantul împărtășit duc conversația.",
    ar: "يحوّل المطبخ الكوري التخمير إلى مخزن وطني — أجران الكيمتشي وحساء الدويجانغ وصلصات الغوتشوجانغ. أطباق البانتشان تحيط كل وجبة؛ الأرز والحرارة المشتركة يحملان الحديث.",
    zh: "韩国料理将发酵变成了国家的储藏室——泡菜坛子、大酱汤、辣椒酱釉料。小菜围绕着每一顿饭；米饭和共享的辣味串起整桌的对话。",
    ja: "韓国料理は発酵を国民の食料庫に変えた——キムチの甕、テンジャンチゲ、コチュジャンのタレ。バンチャンの小皿が毎食を囲み、ごはんと共有される辛さが食卓の会話を運ぶ。",
  },

  // ── Southeast Asian
  'Vietnam': {
    en: "Vietnam balances four flavors at every table — bright herbs, salty fish sauce, fresh chili, a squeeze of lime. From phở broth at dawn to bánh mì at noon, the cooking stays light and immediate.",
    ro: "Vietnamul echilibrează patru gusturi la fiecare masă — ierburi proaspete, sos de pește sărat, ardei iute, o picătură de lime. De la zeama de phở dimineața la bánh mì la prânz, gătitul rămâne ușor și imediat.",
    ar: "يوازن فيتنام أربع نكهات على كل مائدة — أعشاب نضرة، وصلصة سمك مالحة، وفلفل حار طازج، وعصرة ليم. من مرق الفو فجراً إلى البانه مي ظهراً، يبقى الطبخ خفيفاً وآنياً.",
    zh: "越南料理在每张餐桌上平衡四种味道——清新的香草、咸鲜的鱼露、新鲜的辣椒、一挤青柠。从清晨的河粉汤到午间的越南三明治，这里的烹饪始终轻盈而即时。",
    ja: "ベトナムはどの食卓でも四つの味を調和させる——香り高いハーブ、塩気の効いたヌクマム、生の青唐辛子、ライムをひと絞り。夜明けのフォーから昼のバインミーまで、料理はいつも軽やかで即興的だ。",
  },
  'Thailand': {
    en: "Thai cooking chases four flavors at once — hot, sour, sweet, salty. Pad thai negotiates them in a wok; tom yum sharpens them in clear broth; tom kha softens them with coconut milk.",
    ro: "Bucătăria thailandeză urmărește patru gusturi în același timp — iute, acru, dulce, sărat. Pad thai le împacă în wok; tom yum le ascute într-o supă limpede; tom kha le îmblânzește cu lapte de cocos.",
    ar: "يطارد الطبخ التايلاندي أربع نكهات في آن واحد — حار وحامض وحلو ومالح. بادثاي يوفق بينها في الووك، وتوم يوم يحدّدها في مرق صافٍ، وتوم خا يليّنها بحليب جوز الهند.",
    zh: "泰国料理同时追逐四种味道——辣、酸、甜、咸。炒河粉在锅中协调它们，冬阴功在清汤中将它们强化，椰奶鸡汤则用椰浆将它们柔化。",
    ja: "タイ料理は四つの味を同時に追いかける——辛い、酸っぱい、甘い、塩辛い。パッタイは中華鍋のなかでそれらをまとめ、トムヤムは澄んだスープで鋭くし、トムカーはココナッツミルクで柔らかく包む。",
  },
  'Indonesia': {
    en: "Indonesia cooks in layers — coconut milk reducing for hours, sambal pounded fresh, palm sugar caramelizing in the wok. Rice is the steady center; chili, lemongrass and shrimp paste work around it.",
    ro: "Indonezia gătește în straturi — lapte de cocos redus ore întregi, sambal pisat la moment, zahăr de palmier caramelizat în wok. Orezul e centrul stabil; ardeiul, lemongrass-ul și pasta de creveți lucrează în jurul lui.",
    ar: "تطبخ إندونيسيا بالطبقات — حليب جوز هند يتقلص لساعات، وسامبال يُطحن طازجاً، وسكر النخيل يتكرمل في الووك. الأرز هو المركز الثابت؛ والفلفل والليمون الحشيشي ومعجون الجمبري يعملون حوله.",
    zh: "印度尼西亚料理层层叠叠——椰奶熬煮数小时，桑巴辣酱现捣现用，棕榈糖在锅中焦糖化。米饭是稳定的中心，辣椒、香茅和虾酱围绕其转。",
    ja: "インドネシア料理は層で組み立てられる——何時間も煮詰めるココナッツミルク、挽きたてのサンバル、中華鍋でキャラメル化するヤシ砂糖。米が揺るぎない中心で、唐辛子とレモングラスとエビ味噌がその周りを回る。",
  },
  'Philippines': {
    en: "Filipino cooking sits where sour meets savory — adobo simmered in vinegar and soy, kare-kare rich with peanut and oxtail. Bagoong on the side, rice always, leftovers always better the next day.",
    ro: "Bucătăria filipineză stă unde acru întâlnește savuros — adobo fiert în oțet și soia, kare-kare bogat cu arahide și coadă de bou. Bagoong alături, orez mereu, resturile sunt mereu mai bune a doua zi.",
    ar: "يقبع المطبخ الفلبيني حيث يلتقي الحامض بالمالح — أدوبو مطهو بالخل وصوص الصويا، وكاري كاري غني بالفول السوداني وذيل الثور. باغونغ على الجانب، والأرز دائماً، والبقايا دائماً أفضل في اليوم التالي.",
    zh: "菲律宾料理介于酸与鲜咸之间——醋与酱油慢炖的阿斗波，富含花生与牛尾的咖喱炖肉。佐以虾酱，少不了米饭，隔夜的剩菜往往更美味。",
    ja: "フィリピン料理は酸味と旨味が出会う場所に立つ——酢と醤油で煮込んだアドボ、ピーナッツと牛テールたっぷりのカレカレ。バゴオンを添えて、ごはんは必ず、残り物は翌日がさらに美味しい。",
  },
  'Malaysia': {
    en: "Malaysian cooking lives at the hawker stall — laksa rich with coconut and shrimp paste, nasi lemak crowned with crisp anchovies. Multiple cultures, one wok station, breakfast served hot at 7 a.m.",
    ro: "Bucătăria malaezienă trăiește la taraba de stradă — laksa cu lapte de cocos și pastă de creveți, nasi lemak încoronat cu anșoa crocant. Mai multe culturi, o singură stație de wok, micul dejun servit fierbinte la 7 dimineața.",
    ar: "يعيش الطبخ الماليزي في أكشاك الباعة الجائلين — لاكسا كثيفة بجوز الهند ومعجون الروبيان، وناسي ليماك متوج بأنشوفة مقرمشة. ثقافات متعددة ومحطة ووك واحدة، والإفطار يُقدَّم ساخناً في السابعة صباحاً.",
    zh: "马来西亚料理活在小摊档里——椰香虾酱叻沙、椰奶饭配酥脆小鱼干。多元文化共用一口锅，早晨七点热腾腾的早餐就已端上桌。",
    ja: "マレーシア料理はホーカーストールに生きている——ココナッツとエビ味噌で濃厚なラクサ、カリカリのイリコで飾ったナシレマ。複数の文化、一つの中華鍋台、朝7時に熱々で出される朝食。",
  },
  'Cambodia': {
    en: "Cambodian cooking quietly balances sweet, salty, sour and herbaceous — fish amok steamed in banana leaf, fresh chili and lime alongside every plate. Lemongrass, palm sugar and prahok do the heavy lifting.",
    ro: "Bucătăria cambodgiană echilibrează discret dulce, sărat, acru și verde — pește amok aburit în frunză de banan, ardei proaspăt și lime lângă fiecare farfurie. Lemongrass, zahăr de palmier și prahok fac munca de bază.",
    ar: "يوازن الطبخ الكمبودي بهدوء بين الحلو والمالح والحامض والعشبي — سمكة أموك تُبخّر في ورقة موز، وفلفل طازج وليم بجانب كل طبق. الليمون الحشيشي وسكر النخيل والبراهوك يقومون بالعمل الأساسي.",
    zh: "柬埔寨料理悄然平衡甜、咸、酸与草本香——鱼子烤鱼裹在芭蕉叶中蒸制，每道菜旁都有新鲜辣椒和青柠。香茅、棕榈糖和鱼膏承担着调味的重任。",
    ja: "カンボジア料理はひそやかに甘み・塩味・酸味・草の香りをつり合わせる——バナナの葉に包んで蒸した魚のアモック、どの皿にも添えられた生の唐辛子とライム。レモングラス、ヤシ砂糖、プラホックが主役を担う。",
  },

  // ── South Asian
  'India': {
    en: "India layers spice with intent — whole seeds bloomed in hot ghee, onions cooked until they melt, finishing aromatics dropped in at the very end. Curries, biryanis and street-food classics all follow the rhythm.",
    ro: "India așază condimentele cu intenție — semințe întregi înflorite în ghee fierbinte, ceapă gătită până se topește, arome finale aruncate chiar la sfârșit. Curry-uri, biryani și clasice de stradă urmează același ritm.",
    ar: "تُرتّب الهند البهارات بنية — بذور كاملة تتفتح في سمن ساخن، وبصل يُطهى حتى يذوب، ونكهات نهائية تُضاف في آخر لحظة. الكاري والبيريانيات وأطباق المطبخ الشعبي تتبع نفس الإيقاع.",
    zh: "印度料理将香料层层叠加，各有其意——整颗香料在热酥油中绽放，洋葱炒至融化，最后的香气在出锅前才加入。咖喱、香饭与街头小吃，都遵循着同一节奏。",
    ja: "インド料理は意図を持ってスパイスを積み重ねていく——熱いギーで香らせた丸ごとのシード、溶けるまで炒めた玉ねぎ、最後の瞬間に加えるフレッシュな香り。カレーもビリヤニも街の屋台の名物も、同じリズムに従う。",
  },
  'Pakistan': {
    en: "Pakistani cooking turns spice into long heat — biryani layered with marinated lamb, nihari simmered overnight until the meat surrenders. Bone marrow, naan straight off the tandoor, and bread keep the table close.",
    ro: "Bucătăria pakistaneză transformă condimentele în căldură lungă — biryani în straturi cu miel marinat, nihari fiert peste noapte până carnea cedează. Măduvă de os, naan direct din tandoor, pâinea ține masa aproape.",
    ar: "يحوّل الطبخ الباكستاني البهارات إلى دفء طويل — بيريانيات في طبقات مع لحم ضأن متبل، ونيهاري مطهو طوال الليل حتى يستسلم اللحم. نخاع العظام وخبز النان مباشرة من التنور يُبقيان المائدة قريبة.",
    zh: "巴基斯坦料理将香料化为持久的热意——腌羊肉铺就的香料焖饭，炖了一整夜直至肉质酥软的尼哈里。骨髓、刚出炉的馕，让一张桌子紧紧围坐在一起。",
    ja: "パキスタン料理はスパイスを長い熱に変える——マリネした子羊を何層にも重ねたビリヤニ、一晩中煮込んで肉が崩れるニハリ。骨髄、タンドールから直接出てくるナン、パンが食卓を近づける。",
  },

  // ── Middle Eastern
  'Iran': {
    en: "Persian kitchens layer flavor with patience — fesenjān thickened with walnut and pomegranate, ghormeh sabzi green with stewed herbs. Saffron, dried lime and rice tahdig finish the table.",
    ro: "Bucătăriile persane stratifică gustul cu răbdare — fesenjān îngroșat cu nucă și rodie, ghormeh sabzi verde de la ierburi gătite. Șofran, lime uscat și tahdig de orez închid masa.",
    ar: "تُرتّب المطابخ الفارسية النكهة بصبر — فسنجان يتكاثف بالجوز والرمان، وغورمة سبزي تخضرّ بالأعشاب المطهية. الزعفران والليمون المجفف والطهيج من الأرز تُختتم بها المائدة.",
    zh: "波斯厨房用耐心堆叠风味——核桃与石榴浓缩的费先贾恩，炖香草染绿的库尔梅萨布兹。藏红花、干柠檬与米饭锅巴，为一桌饭食画上句点。",
    ja: "ペルシャの台所はじっくりと風味を積み重ねる——クルミとザクロで濃くしたフェセンジャン、煮込んだハーブで深緑に染まったゴルメサブジ。サフランと乾燥ライム、タフディグで食卓を締める。",
  },
  'Israel': {
    en: "Israeli cooking pulls from across the eastern Mediterranean — silky hummus, sabich pita stuffed with eggplant and egg, lemon and parsley constant. Casual abundance, sharp seasoning, breakfast that lasts all day.",
    ro: "Bucătăria israeliană împrumută din toată Mediterana de est — hummus mătăsos, sabich în pita cu vinete și ou, lămâie și pătrunjel mereu. Abundență relaxată, condimente ascuțite, mic dejun care durează toată ziua.",
    ar: "يستلهم المطبخ الإسرائيلي من شرق البحر المتوسط — حمص ناعم كالحرير، وسابيتش في خبز بيتا مع الباذنجان والبيض، وليمون وبقدونس دائماً حاضران. وفرة مريحة وتوابل حادة وإفطار يدوم طوال اليوم.",
    zh: "以色列料理从东地中海各处汲取灵感——丝滑的鹰嘴豆泥、夹着茄子和鸡蛋的沙比克皮塔饼，柠檬与香菜无处不在。随意而丰盛，调味犀利，早餐从容吃上一整天。",
    ja: "イスラエル料理は東地中海全域から引き寄せる——なめらかなフムス、茄子とゆで卵を詰めたサビーチのピタ、常に添えられるレモンとパセリ。気取らない豊かさ、鋭い味付け、一日中続く朝食。",
  },
  'Syria': {
    en: "Syrian tables run on generosity — kibbeh shaped by hand, shakshuka eaten straight from the pan, fatteh built in layers of bread, yogurt and chickpeas. Pomegranate molasses and sumac keep the seasoning sharp.",
    ro: "Mesele siriene merg pe generozitate — kibbeh modelat cu mâna, shakshuka mâncat direct din tigaie, fatteh construit în straturi de pâine, iaurt și năut. Melasa de rodie și sumacul țin condimentarea ascuțită.",
    ar: "تقوم الموائد السورية على الكرم — كبة تُشكّل باليد، وشكشوكة تؤكل مباشرة من المقلاة، وفتّة تُبنى في طبقات من الخبز والزبادي والحمص. دبس الرمان والسماق يحافظان على حدة التوابل.",
    zh: "叙利亚餐桌以慷慨为本——手工捏制的肉丸馅饼、直接从锅里享用的番茄煎蛋、层叠面包与酸奶和鹰嘴豆的法提。石榴糖浆与漆树粉保持着调味的锋锐。",
    ja: "シリアの食卓は寛大さで成り立つ——手で形作るキッベ、フライパンから直接食べるシャクシュカ、パンとヨーグルトとヒヨコ豆を重ねたファッテ。ザクロ糖蜜とスマックが味の鋭さを保つ。",
  },
  'Turkey': {
    en: "Turkish cooking moves between meze, bread oven and copper pot — flaky baklava soaked in syrup, eggs scrambled into pepper-rich menemen. Strong tea is poured at every meal, often before the first plate arrives.",
    ro: "Bucătăria turcească se mișcă între meze, cuptor de pâine și oală de cupru — baklava fragedă în sirop, ouă bătute în menemen plin cu ardei. Ceaiul tare se toarnă la fiecare masă, deseori înainte de prima farfurie.",
    ar: "يتنقل المطبخ التركي بين المازه وفرن الخبز والقدر النحاسي — بقلاوة هشة منقوعة في شراب، وبيض مخفوق في مينيمين الغني بالفلفل. الشاي القوي يُسكَب في كل وجبة، وغالباً قبل وصول أول طبق.",
    zh: "土耳其料理穿梭于小菜、面包烤炉与铜锅之间——糖浆浸透的酥皮果仁蜜饼，与富含甜椒的炒蛋。浓茶在每顿饭都会倒上，往往在第一道菜上桌之前。",
    ja: "トルコ料理はメゼとパン焼き窯と銅の鍋の間を行き来する——シロップにたっぷり漬けたサクサクのバクラヴァ、ピーマンたっぷりのメネメンに溶かした卵。濃いお茶はどの食事にも注がれ、たいてい最初の皿が来る前に。",
  },

  // ── North African
  'Morocco': {
    en: "Moroccan kitchens move slowly — clay tagines holding meat with preserved lemon, harira thickening with lentils and tomato, ras el hanout perfumed across every dish. Spice, fruit and time do the cooking together.",
    ro: "Bucătăriile marocane se mișcă încet — tagine din lut cu carne și lămâie murată, harira îngroșată cu linte și roșii, ras el hanout parfumat în fiecare fel. Condimentul, fructele și timpul gătesc împreună.",
    ar: "تتحرك المطابخ المغربية ببطء — طواجن طينية تحتضن اللحم مع الليمون المحفوظ، وحريرة تتكاثف بالعدس والطماطم، ورأس الحانوت يُعطّر كل طبق. البهارات والفواكه والوقت تطبخ معاً.",
    zh: "摩洛哥厨房的节奏缓慢——陶锅里慢炖着肉与腌柠檬，扁豆番茄浓汤越煮越稠，拉斯汉努特香料为每道菜增香。香料、果干与时间共同完成烹饪。",
    ja: "モロッコの台所はゆっくり動く——保存レモンと肉を土のタジンに閉じ込め、ハリーラはレンズ豆とトマトで濃くなり、ラス・エル・ハヌートがすべての皿に香る。スパイスとドライフルーツと時間が一緒に料理をする。",
  },
  'Tunisia': {
    en: "Tunisian cooking warms with harissa — brik fried until the egg sets just right, chakchouka bubbling with tomato and pepper. Olive oil and chili are everywhere; the heat is direct and unapologetic.",
    ro: "Bucătăria tunisiană încălzește cu harissa — brik prăjit până oul prinde exact bine, chakchouka clocotind cu roșii și ardei. Uleiul de măsline și ardeiul iute sunt peste tot; căldura e directă, fără scuze.",
    ar: "يُدفّئ الطبخ التونسي بالهريسة — بريك مقلية حتى ينضج البيض تماماً، وشكشوكة تغلي بالطماطم والفلفل. زيت الزيتون والفلفل الحار في كل مكان؛ الحرارة مباشرة وبلا اعتذار.",
    zh: "突尼斯料理以哈里萨辣椒酱为底色——油炸至蛋黄刚好凝固的布里克，翻滚着番茄和甜椒的沙克舒卡。橄榄油与辣椒无处不在，辣度直接而毫不掩饰。",
    ja: "チュニジア料理はハリッサで温める——卵がちょうどよく固まるまで揚げたブリク、トマトとピーマンで煮立つシャクシュカ。オリーブオイルと唐辛子はどこにでもあり、辛さは直接的で言い訳しない。",
  },

  // ── Latin
  'Mexico': {
    en: "Mexico cooks loud and bright — chiles charred to a smoke, masa warmed on a comal, salsa pounded fresh in the molcajete. From street stands to home tables, the constant is heat balanced by lime and rendered fat.",
    ro: "Mexicul gătește tare și luminos — ardei arși până fac fum, masa încălzit pe comal, salsa pisat proaspăt în molcajete. De la tarabe la mesele de acasă, constanta e căldură echilibrată de lime și grăsime topită.",
    ar: "يطبخ المكسيك بصوت عالٍ وألوان زاهية — فلفل حار مشوي حتى يُصدر دخاناً، وماسا مُسخّن على الكومال، وسالسا مطحونة طازجة في المولكاخيتي. من أكشاك الشوارع إلى موائد البيوت، الثابت هو الحرارة يوازنها الليم والدهن المُذاب.",
    zh: "墨西哥料理热烈而鲜艳——辣椒烤至焦香冒烟，玉米面在铁板上加热，萨尔萨酱在石臼里现捣现用。从街边摊到家庭餐桌，不变的是辣味，由青柠和油脂来平衡。",
    ja: "メキシコは大きな声で鮮やかに料理する——煙が出るまで焦がした唐辛子、コマルで温めたマサ、モルカヘテで挽きたてのサルサ。屋台から家の食卓まで、共通するのはライムと溶かした油脂で整えた辛さだ。",
  },
  'Peru': {
    en: "Peru cooks where ocean meets the Andes — lime-cured ceviche on the coast, potato-rich causa from highland kitchens, lomo saltado borrowing wok craft from Chinese arrivals. Bright acid, bold contrast, working altitude.",
    ro: "Peru gătește unde oceanul întâlnește Anzii — ceviche marinat în lime pe coastă, causa cu cartofi din bucătăriile de altitudine, lomo saltado împrumutând wok-ul de la chinezi. Aciditate luminoasă, contrast curajos.",
    ar: "يطبخ بيرو حيث يلتقي المحيط بجبال الأنديز — سيفيتشي مُتبّل بالليم على الساحل، وكاوسا غني بالبطاطس من مطابخ المرتفعات، ولومو سالتادو يستعير الووك من المهاجرين الصينيين. حموضة زاهية وتناقض جريء.",
    zh: "秘鲁料理生长在大洋与安第斯山脉的交汇处——海边有柠汁腌制的酸橘汁腌鱼，高原厨房里有土豆厚饼，炒牛肉则借鉴了中国移民带来的锅气。酸味明亮，对比大胆。",
    ja: "ペルーは海とアンデスが出会う場所で料理する——海岸でライムに漬けたセビーチェ、高地の台所からじゃがいもたっぷりのカウサ、中国系移民の中華鍋の技を借りたロモ・サルタード。明るい酸味と大胆なコントラスト。",
  },
  'Argentina': {
    en: "Argentina cooks for the asado — open fire, beef, salt — but the kitchen runs on hand pies and milanesa pounded thin. Chimichurri sits on every table; the bread is there to mop the plate clean.",
    ro: "Argentina gătește pentru asado — foc deschis, vită, sare — dar bucătăria merge pe plăcinte și milanesa bătute subțire. Chimichurri stă pe fiecare masă; pâinea e acolo pentru a curăța farfuria.",
    ar: "تطبخ الأرجنتين من أجل الأساذو — نار مفتوحة ولحم بقر وملح — لكن المطبخ يعتمد على الفطائر وميلانيزا المدقوقة رفيعة. التشيميتشوري على كل مائدة؛ والخبز لمسح الطبق نظيفاً.",
    zh: "阿根廷为烤肉而烹饪——明火、牛肉、盐——但家常料理靠的是手工馅饼和捶薄的米兰式肉排。奇米奇里酱摆在每张桌上，面包用来把盘子擦干净。",
    ja: "アルゼンチンはアサードのために料理する——オープンファイアと牛肉と塩——だが台所はエンパナーダと薄く打ったミラネサで動く。チミチュリはすべての食卓にあり、パンは皿をきれいに拭うためにある。",
  },
  'Brazil': {
    en: "Brazilian cooking ranges from beach to interior — slow feijoada with black beans and smoked pork, coconut-rich moqueca simmered in clay pots. Citrus, hot pepper and rice anchor every plate.",
    ro: "Bucătăria braziliană se întinde de la plajă la interior — feijoada lentă cu fasole neagră și porc afumat, moqueca cu lapte de cocos fiartă în oale de lut. Citrice, ardei iute și orez ancorează fiecare farfurie.",
    ar: "يمتد الطبخ البرازيلي من الشاطئ إلى الداخل — فيجوادا بطيئة بالفاصوليا السوداء ولحم الخنزير المدخن، وموكيكا غنية بجوز الهند تُطهى في أواني فخارية. الحمضيات والفلفل الحار والأرز تُثبّت كل طبق.",
    zh: "巴西料理从海滩延伸至内陆——黑豆配熏猪肉的黑豆炖肉需要慢慢等待，椰奶炖鱼在陶锅里慢慢熟透。柑橘、辣椒和米饭为每道菜奠定基础。",
    ja: "ブラジル料理はビーチから内陸まで広がる——黒豆と薫製豚のゆっくり煮込んだフェイジョアーダ、土鍋で煮たコクのあるムケカ。柑橘と唐辛子と米がすべての皿の土台をなす。",
  },
  'Ecuador': {
    en: "Ecuadorian cooking is shaped by Pacific shore and Andean peaks — bright ceviches scattered with toasted corn, encebollado warm with tuna and yuca. Citrus, plantain and salt, the rhythm of altitude.",
    ro: "Bucătăria ecuadoriană e formată de coasta Pacificului și de Anzi — ceviche-uri luminoase presărate cu porumb prăjit, encebollado cald cu ton și yuca. Citrice, plantan și sare, ritmul altitudinii.",
    ar: "تتشكّل المطبخ الإكوادوري بين ساحل المحيط الهادئ وقمم الأنديز — سيفيتشي مضيء مرشوش بذرة الذرة المحمصة، وإنسيبوييادو دافئ بالتونة والكاسافا. حمضيات وموز وملح، إيقاع الارتفاع.",
    zh: "厄瓜多尔料理由太平洋海岸与安第斯高峰共同塑造——洒满烤玉米粒的酸橘汁腌鱼明亮清新，金枪鱼木薯浓汤温暖扎实。柑橘、芭蕉与盐，是高原的节奏。",
    ja: "エクアドル料理は太平洋岸とアンデスの山頂に形作られる——炒ったトウモロコシを散らした爽やかなセビーチェ、マグロとユカで温かいエンセボジャード。柑橘とバナナと塩、高地のリズム。",
  },
  'Cuba': {
    en: "Cuban cooking moves slowly with garlic, citrus and oregano — ropa vieja shredded and simmered with peppers, picadillo loaded with olives and raisins. Sweet plantains finish the plate; rice keeps the peace.",
    ro: "Bucătăria cubaneză merge încet cu usturoi, citrice și oregano — ropa vieja destrămat și fiert cu ardei, picadillo plin de măsline și stafide. Banane dulci închid farfuria; orezul ține pacea.",
    ar: "يتحرك المطبخ الكوبي ببطء مع الثوم والحمضيات والأوريغانو — روبا بيخا مُمزق ومطهو مع الفلفل، وبيكاديلو محشو بالزيتون والزبيب. موز حلو يختتم الطبق؛ والأرز يحفظ السلام.",
    zh: "古巴料理随蒜香、柑橘和牛至缓缓前行——碎肉与甜椒同炖的破烂衣，橄榄与葡萄干丰盈的碎牛肉。甜大蕉作结，米饭维持平衡。",
    ja: "キューバ料理はにんにくと柑橘とオレガノとともにゆっくり動く——ピーマンと細く煮込んだロパ・ビエハ、オリーブとレーズンたっぷりのピカジリョ。甘いバナナが皿を締め、ごはんが平和を保つ。",
  },

  // ── Eastern European
  'Romania': {
    en: "Romanian cooking comes from cold winters and big tables — sarmale wrapped tight in cabbage leaves, ciorbă tangy with fermented bran. Plenty of dill, sour cream and slow oven hours spent waiting.",
    ro: "Bucătăria românească vine din ierni reci și mese mari — sarmale rulate strâns în foi de varză, ciorbă acrită cu borș. Mărar din belșug, smântână, ore lungi în cuptor și răbdare la masă.",
    ar: "يأتي المطبخ الروماني من شتاء قارس وموائد كبيرة — سارمالي ملفوفة بإحكام في أوراق الملفوف، وتشيوربا حامضة بنخالة الجاودار المخمرة. شبت وفير وقشدة حامضة وساعات طويلة في الفرن.",
    zh: "罗马尼亚料理来自寒冬与大桌聚餐——紧紧包裹在白菜叶里的萨尔马利，用发酵黑麦水调酸的肉汤。莳萝、酸奶油，和漫长的窑烤时光。",
    ja: "ルーマニア料理は寒い冬と大きな食卓から生まれる——キャベツの葉に固く巻いたサルマーレ、発酵した小麦ふすまで酸っぱくしたチョルバ。ディルをたっぷりとサワークリーム、オーブンで過ごす長い時間。",
  },
  'Hungary': {
    en: "Hungarian cooking centers on paprika — sweet, smoked, hot — bloomed in lard before anything else. Goulash runs deep and dark, paprikash mellows with sour cream, lángos comes crackling out of the fryer.",
    ro: "Bucătăria maghiară se învârte în jurul boielii — dulce, afumată, iute — înflorită în untură înainte de orice. Gulașul e adânc și închis, paprikash-ul se îmblânzește cu smântână, lángos-ul iese sfârâind din ulei.",
    ar: "يتمحور المطبخ المجري حول الفلفل الحلو — الحلو والمدخن والحار — يُنعّم في الشحم قبل أي شيء آخر. الغولاش عميق وداكن، والبابريكاش يُلطّف بالقشدة الحامضة، واللانغوش يخرج مقرمشاً من المقلاة.",
    zh: "匈牙利料理以红椒粉为核心——甜的、烟熏的、辣的——先在猪油中炒香再做其他。浓郁深色的古拉什，酸奶油调和的鸡肉炖菜，从油锅里捞出来的炸面包脆而喷香。",
    ja: "ハンガリー料理はパプリカを中心に回る——甘い、薫製、辛い——まず何よりも先にラードで香らせる。グヤーシュは深く濃く、パプリカーシュはサワークリームで和らぎ、ラーンゴシュは揚げてカリカリ出てくる。",
  },
  'Poland': {
    en: "Polish kitchens warm against winter — pierogi pinched by hand, mushroom soups deep with dill, sour rye soup at Easter. Comfort food that doesn't apologize for butter or for second helpings.",
    ro: "Bucătăriile poloneze se încălzesc împotriva iernii — pierogi modelați cu mâna, supe de ciuperci cu mărar, supă acră de secară la Paște. Mâncare consistentă care nu se scuză pentru unt sau pentru porția a doua.",
    ar: "تتدفأ المطابخ البولندية في مواجهة الشتاء — بيروغي تُشكّل باليد، وحساء فطر عطر بالشبت، وحساء الجاودار الحامض في عيد الفصح. طعام مريح لا يعتذر عن الزبدة أو الحصة الثانية.",
    zh: "波兰厨房抵御冬日严寒——手工捏制的饺子、飘着莳萝香的蘑菇汤、复活节餐桌上的酸黑麦汤。丰盛的家常味，对黄油和加菜毫不客气。",
    ja: "ポーランドの台所は冬に向かって温まる——手で摘まんだピエロギ、ディルたっぷりのきのこスープ、イースターの酸っぱいライ麦スープ。バターにも二杯目にも謝らないコンフォートフードだ。",
  },
  'Russia': {
    en: "Russian cooking is winter cooking — borscht deep with beet and meat, kotlety pan-fried golden, solyanka rich with brine. Black bread, sour cream and dill quietly do most of the seasoning.",
    ro: "Bucătăria rusească e bucătărie de iarnă — borș adânc cu sfeclă și carne, kotlety prăjite auriu, solyanka bogat în saramură. Pâine neagră, smântână și mărar fac mare parte din asezonare.",
    ar: "المطبخ الروسي هو طبخ الشتاء — بورش عميق باللبنجر واللحم، وكوتليتي مقلية ذهبية، وسوليانكا غنية بالمخلل. الخبز الأسود والقشدة الحامضة والشبت يقومون بمعظم التتبيل بصمت.",
    zh: "俄罗斯料理是冬天的料理——甜菜与肉炖出深色的罗宋汤，煎至金黄的肉饼，咸味浓郁的杂烩汤。黑面包、酸奶油和莳萝，静静完成了大部分调味。",
    ja: "ロシア料理は冬の料理——ビーツと肉の深いボルシチ、黄金色に揚げたコトレトゥイ、漬け汁たっぷりのソリャンカ。黒パンとサワークリームとディルが静かにほとんどの味付けを担う。",
  },
  'Georgia': {
    en: "Georgian cooking opens around the supra — long-table dinners with toasts, walnuts and pomegranate. Khachapuri straight from a clay oven, khinkali pinched into pleated dumplings, herbs everywhere on the plate.",
    ro: "Bucătăria georgiană se deschide în jurul mesei supra — cine lungi cu toasturi, nuci și rodie. Khachapuri direct din cuptor de lut, khinkali strânși în colțunași plisați, ierburi peste tot pe farfurie.",
    ar: "يُفتح المطبخ الجورجي حول مائدة السوبرا — عشاء طويل بالنخبات والجوز والرمان. خاتشابوري مباشر من فرن الطين، وخينكالي يُشكّل في شكل فطائر مطوية، وأعشاب في كل مكان على الطبق.",
    zh: "格鲁吉亚料理在苏普拉长桌宴中展开——举杯、核桃与石榴贯穿始终。奶酪面包从陶土烤炉中直接取出，肉汁饺子捏成褶皱，香草铺满整个盘子。",
    ja: "グルジア料理はスプラの食卓から開く——乾杯とクルミとザクロで長く続く夕食。土窯から直接出てきたハチャプリ、ひだ飾りのヒンカリ、皿のいたるところにハーブ。",
  },

  // ── Nordic
  'Sweden': {
    en: "Sweden cooks for the long winter — salmon cured in dill, meatballs in cream gravy, cinnamon buns warmed with cardamom. Calm flavors, careful seasoning, fika treated as a daily ritual rather than a break.",
    ro: "Suedia gătește pentru iarna lungă — somon marinat cu mărar, chiftele în sos de smântână, chifle cu scorțișoară și cardamom. Arome calme, condimentare atentă, fika tratată ca un ritual zilnic, nu ca o pauză.",
    ar: "تطبخ السويد لاستقبال الشتاء الطويل — سمك السلمون المتبل بالشبت، وكرات اللحم في صلصة القشدة، وكعك القرفة الدافئ بالهيل. نكهات هادئة وتتبيل دقيق، والفيكا طقس يومي لا مجرد راحة.",
    zh: "瑞典料理为漫长的冬天而烹饪——莳萝腌制的三文鱼、奶油汁配的肉丸、飘着豆蔻香的肉桂卷。味道平和，调味细腻，下午茶仪式是每日的庄重时刻。",
    ja: "スウェーデンは長い冬に向けて料理する——ディルで漬けたサーモン、クリームグレイビーのミートボール、カルダモンで温めたシナモンバン。落ち着いた味、丁寧な味付け、フィーカは休憩ではなく毎日の儀式として扱われる。",
  },
  'Finland': {
    en: "Finnish cooking draws flavor from cold landscape — rye-crust Karelian pies, dill-bright salmon soup, dense rye bread on every counter. Quiet meals, careful seasoning, deep respect for the lakes and forests.",
    ro: "Bucătăria finlandeză extrage gust din peisajul rece — plăcinte kareliane cu coajă de secară, supă de somon cu mărar, pâine densă de secară pe orice blat. Mese liniștite, condimentare atentă, respect adânc pentru lacuri și păduri.",
    ar: "يستخلص المطبخ الفنلندي النكهة من المناخ البارد — فطائر كاريلية بقشرة الجاودار، وحساء السلمون الزاهي بالشبت، وخبز الجاودار الثقيل على كل رف. وجبات هادئة وتتبيل دقيق واحترام عميق للبحيرات والغابات.",
    zh: "芬兰料理从寒冷的大地中提炼风味——黑麦皮的卡累利阿馅饼、莳萝点缀的三文鱼汤、每块台面上都有的密实黑麦面包。饮食安静，调味审慎，对湖泊与森林怀有深沉的敬意。",
    ja: "フィンランド料理は寒い風景から風味を引き出す——ライ麦の皮のカレリアパイ、ディルの明るいサーモンスープ、どのカウンターにも置かれた重いライ麦パン。静かな食事、丁寧な味付け、湖と森への深い敬意。",
  },

  // ── Sub-Saharan
  'Nigeria': {
    en: "Nigerian cooking is bold and communal — smoky jollof rice debated across the region, egusi soup thickened with melon seed and bitter greens. Palm oil, scotch bonnet, generous portions, no whispering.",
    ro: "Bucătăria nigeriană e curajoasă și comună — jollof rice afumat dezbătut în toată regiunea, supă de egusi îngroșată cu semințe de pepene și verdețuri amare. Ulei de palmier, ardei iute, porții generoase, fără șoaptă.",
    ar: "المطبخ النيجيري جريء وجماعي — أرز جولوف المدخن الذي يُتجادل عليه في أنحاء المنطقة، وحساء إيغوسي المكثّف ببذور البطيخ والخضروات المرّة. زيت النخيل وفلفل السكوتش بوني وحصص كريمة، بلا همسات.",
    zh: "尼日利亚料理热烈而集体——各地争论不休的烟熏炒饭、用瓜子和苦菜叶炖出的埃古西汤。棕榈油、苏格兰帽辣椒和大份量，没有轻声细语。",
    ja: "ナイジェリア料理は大胆で共同的だ——地域全体で議論される煙のジョロフライス、メロン種と苦い青菜で濃くしたエグシスープ。パームオイル、スコッチボネット唐辛子、気前のいい量、ひそひそ声はない。",
  },

  // ── Anglo
  'USA': {
    en: "American cooking is regional, not national — New England clam chowder, Caribbean-rooted jerk, the cheeseburger from anywhere with a flattop. The thread that runs through everything is comfort done seriously.",
    ro: "Bucătăria americană e regională, nu națională — supă de scoici din New England, jerk din Caraibe, cheeseburger-ul de oriunde există o plită. Firul comun e mâncare de confort luată în serios.",
    ar: "الطبخ الأمريكي إقليمي لا وطني — شوبر كلام من نيو إنجلاند، وجيرك ذو جذور كاريبية، وتشيزبرغر من أي مكان يوجد فيه موقد مسطح. الخيط المشترك هو طعام الراحة المأخوذ بجدية.",
    zh: "美国料理是地方的而非全国的——新英格兰蛤蜊浓汤、源自加勒比的牙买加烤鸡、任何有铁板的地方都有的芝士汉堡。贯穿一切的，是认真对待的家常美食。",
    ja: "アメリカ料理は地域的で全国的ではない——ニューイングランドのクラムチャウダー、カリブ海ルーツのジャーク、どこの鉄板でも食べられるチーズバーガー。すべてを貫くのは真剣に作られたコンフォートフードだ。",
  },
  'Australia': {
    en: "Australian cooking borrows widely and barbecues constantly — peppery meat pies handed across counters, summer pavlova piled with passionfruit and cream. Coffee culture takes the rest seriously.",
    ro: "Bucătăria australiană împrumută peste tot și face grătar constant — plăcinte cu carne piperate, pavlova de vară cu fructul pasiunii și frișcă. Cultura cafelei tratează restul cu seriozitate.",
    ar: "يستعير الطبخ الأسترالي على نطاق واسع ويشوي باستمرار — فطائر اللحم الفلفلية تُمرَّر فوق العدادات، وبافلوفا الصيفية مكدسة بعصير الفاكهة الشغوفة والقشدة. ثقافة القهوة تأخذ الباقي بجدية.",
    zh: "澳大利亚料理广泛借鉴，烧烤不断——柜台递出的胡椒肉馅饼，夏日堆满百香果和奶油的蛋白甜饼。咖啡文化让这里认真对待其余的一切。",
    ja: "オーストラリア料理は広く借り、絶えずバーベキューをする——カウンター越しに渡されるペッパーミートパイ、パッションフルーツとクリームを積み上げた夏のパブロバ。コーヒー文化が残りを真剣に扱う。",
  },

  // ── Central European
  'Germany': {
    en: "German cooking is hearty and direct — pork schnitzel pounded thin, currywurst sliced on a paper plate, mustard and bread always close. Beer-hall comfort food, regional pride, no fuss.",
    ro: "Bucătăria germană e consistentă și directă — schnitzel de porc bătut subțire, currywurst feliat pe farfurie de hârtie, muștar și pâine mereu aproape. Mâncare de cârciumă bavareză, mândrie regională, fără agitație.",
    ar: "المطبخ الألماني صلب ومباشر — شنيتزل الخنزير مدقوق رفيع، وكاري فورست مُقطّع على طبق ورقي، ومستردة وخبز دائماً في المتناول. طعام مريح من بيوت البيرة، وفخر إقليمي بلا تكلف.",
    zh: "德国料理扎实而直接——捶薄的猪肉炸排、纸盘上切好的咖喱香肠、随时备着的芥末和面包。啤酒馆的抚慰食物，地方的骄傲，没有多余的矫情。",
    ja: "ドイツ料理はボリュームがあって直接的だ——薄く打った豚シュニッツェル、紙皿に切り分けたカリーヴルスト、常にそばにあるマスタードとパン。ビールホールのコンフォートフード、地域の誇り、余分な飾りはない。",
  },
  'Switzerland': {
    en: "Swiss cooking turns dairy and potato into ritual — rösti crisped golden in a skillet, fondue bubbling at the center of the table. Mountain food, mountain restraint, a long spoon.",
    ro: "Bucătăria elvețiană transformă lactatele și cartofii în ritual — rösti crocant și auriu în tigaie, fondue clocotind în centrul mesei. Mâncare de munte, reținere de munte, o lingură lungă.",
    ar: "يحوّل المطبخ السويسري منتجات الألبان والبطاطس إلى طقس — روشتي مقرمش ذهبي في المقلاة، وفوندو يفور في مركز المائدة. طعام الجبال وضبط الجبال، وملعقة طويلة.",
    zh: "瑞士料理将奶制品与土豆变成仪式——铁锅里煎至金黄脆香的薯饼，在餐桌中央咕嘟冒泡的奶酪火锅。山地的食物，山地的内敛，一把长柄叉。",
    ja: "スイス料理は乳製品とじゃがいもを儀式に変える——フライパンで黄金色にカリカリのレシュティ、食卓の中央で煮立つフォンデュ。山の食べ物、山の節制、長いフォーク一本。",
  },
  'Netherlands': {
    en: "Dutch cooking keeps it practical — mashed-vegetable stamppot, small puffy poffertjes dusted with sugar. Cabbage, sausage, hot mustard, gezellig company at a long pine table.",
    ro: "Bucătăria olandeză rămâne practică — stamppot cu legume pasate, poffertjes mici și pufoși cu zahăr pudră. Varză, cârnați, muștar iute, companie gezellig la o masă lungă de pin.",
    ar: "يحافظ المطبخ الهولندي على الأمور العملية — ستامبوت مع خضروات مهروسة، وبوفيرتييس صغيرة منتفخة مرشوشة بالسكر. ملفوف ونقانق ومستردة حارة وصحبة جيزيليخ حول طاولة صنوبر طويلة.",
    zh: "荷兰料理讲究实用——蔬菜泥土豆杂烩，撒着糖粉的小泡芙。卷心菜、香肠、浓芥末，围着一张长长的松木桌，温馨相伴。",
    ja: "オランダ料理は実用的に保つ——マッシュした野菜のスタンポット、砂糖をまぶした小さなふわふわのポフェルチェス。キャベツ、ソーセージ、辛いマスタード、長い松のテーブルを囲む和やかな食卓。",
  },
  'Belgium': {
    en: "Belgian cooking is beer and butter — slow stoofvlees stewed in dark ale, moules-frites steamed open at the table. Frites with mayo are not a debate here, and the chocolate counter is taken seriously.",
    ro: "Bucătăria belgiană e bere și unt — stoofvlees fiert încet în bere brună, moules-frites deschise la masă. Cartofii prăjiți cu maioneză nu se dezbat aici, iar ciocolata e luată în serios.",
    ar: "المطبخ البلجيكي هو البيرة والزبدة — ستوفلييس مطهو ببطء في جعة داكنة، وموول-فريت تُفتح على الطاولة. البطاطس المقلية بالمايونيز ليست موضع جدال هنا، والشوكولاتة تؤخذ بجدية.",
    zh: "比利时料理是啤酒与黄油的世界——黑啤慢炖的法兰德斯牛肉、在餐桌上蒸开的青口配薯条。薯条配蛋黄酱在这里毋庸置疑，巧克力则是正经事。",
    ja: "ベルギー料理はビールとバター——ダークエールで煮込んだストーフフレース、テーブルで蒸し開けたムール・フリット。フリッツとマヨネーズは議論の余地がなく、チョコレートカウンターは真剣に扱われる。",
  },

  // ── Central Asian
  'Uzbekistan': {
    en: "Uzbek cooking centers on plov — lamb, rice and carrots simmered for hours in a kazan — and manti, hand-pinched dumplings filled with onion and lamb. Bread baked in clay tandyrs, tea poured constantly.",
    ro: "Bucătăria uzbecă se învârte în jurul plov-ului — miel, orez și morcovi fierți ore întregi în kazan — și a manti-ului, colțunași făcuți cu mâna umpluți cu ceapă și miel. Pâine coaptă în tandyr de lut, ceai turnat constant.",
    ar: "يتمحور المطبخ الأوزبكي حول البلاو — لحم الضأن والأرز والجزر مطهوة لساعات في قدر الكازان — والمانتي، فطائر يدوية محشوة بالبصل والضأن. خبز مخبوز في تنادير طينية، وشاي يُسكب باستمرار.",
    zh: "乌兹别克料理以抓饭为核心——羊肉、米饭与胡萝卜在大铁锅里慢炖数小时——还有手工包制的羊肉洋葱蒸饺。陶土馕坑里烤出的面包，茶从不间断地倒着。",
    ja: "ウズベク料理はプロフを中心に据える——カザンで何時間も煮込む羊肉と米と人参——そして玉ねぎと羊肉を詰めた手で摘まんだマンティ。土のタンドールで焼いたパン、絶えず注がれるお茶。",
  },
};
