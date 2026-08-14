// Phase 2A — Canonical ingredient taxonomy (MAIN recipes, PILOT scope).
//
// Pure leaf module. The canonical `ingredientId` is a language-independent
// snake_case concept (chicken, potato, chickpeas...). Each concept carries a
// list of localized aliases per locale — the surface forms a user might type.
// Aliases power cross-locale search: a German user typing "Hähnchen" and an
// Italian typing "pollo" both resolve to `chicken`.
//
// Aliases describe the CONCEPT, never quantities or prep prose:
//   "500 g chicken breast, diced"  ->  chicken       (NOT 500_g_chicken_breast)
//
// Seeded from the budget ingredient dictionary `I` in public/js/recipes-budget.js
// (onion, garlic, potato, carrot, rice, egg, tomato, butter, flour, milk,
// paprika, lemon, parsley, cinnamon, dill, spinach, mushroom, bulgur,
// zucchini, bell_pepper, spaghetti). We COPY the seed values (that file is
// planner-only, lazy-loaded, and does not export `I`, so importing it at build
// time is not possible without touching it — out of scope). The rest are
// authored here.
//
// Locale order (matches discovery-config ALL_LANGS):
//   ro, en, es, fr, de, pt, ru, ar, zh, ja, hi, tr, it, ko

export const ALIAS_LOCALES = Object.freeze([
  'ro', 'en', 'es', 'fr', 'de', 'pt', 'ru', 'ar', 'zh', 'ja', 'hi', 'tr', 'it', 'ko',
]);

// Positional builder. Each argument is a ';'-separated alias list for the
// locale at the same index in ALIAS_LOCALES. Hard-fails on the wrong arg count
// so an authoring miscount is caught immediately (never silently drops a
// locale). Empty aliases after trimming are dropped; the validator then flags
// any locale that ended up with zero aliases.
function L(...cols) {
  if (cols.length !== ALIAS_LOCALES.length) {
    throw new Error(`ingredient alias row has ${cols.length} locales, expected ${ALIAS_LOCALES.length}`);
  }
  const out = {};
  ALIAS_LOCALES.forEach((lc, i) => {
    out[lc] = String(cols[i] || '')
      .split(';')
      .map(s => s.trim())
      .filter(Boolean);
  });
  return out;
}

export const INGREDIENTS = Object.freeze({
  // ── Proteins ──────────────────────────────────────────────────────────────
  chicken:    L('pui; piept de pui; carne de pui','chicken; chicken breast; chicken thigh','pollo; pechuga de pollo','poulet; blanc de poulet','Hähnchen; Huhn; Hühnchen','frango; peito de frango','курица; куриная грудка','دجاج; صدر دجاج','鸡肉; 鸡; 鸡胸','鶏肉; チキン; 鶏','चिकन; मुर्गी','tavuk; tavuk göğsü','pollo; petto di pollo','닭고기; 닭; 치킨'),
  beef:       L('vită; carne de vită','beef','ternera; carne de res; res','bœuf','Rindfleisch; Rind','carne de vaca; carne bovina','говядина','لحم بقري','牛肉','牛肉; ビーフ','गोमांस; बीफ़','dana eti; sığır eti','manzo','소고기; 쇠고기'),
  pork:       L('porc; carne de porc','pork','cerdo; carne de cerdo','porc','Schweinefleisch; Schwein','carne de porco; porco','свинина','لحم خنزير','猪肉','豚肉; ポーク','सूअर का मांस; पोर्क','domuz eti','maiale','돼지고기'),
  guanciale:  L('guanciale','guanciale; pork cheek','guanciale','guanciale','Guanciale','guanciale','гуанчале','غوانشالي','关查莱; 猪颊肉','グアンチャーレ','ग्वांचाले','guanciale','guanciale','관찰레'),
  bacon:      L('bacon; costiță afumată; slănină','bacon','bacon; tocino; panceta','lardons; bacon','Speck; Bacon','bacon; toucinho','бекон','لحم مقدد; بيكون','培根','ベーコン','बेकन','beykın; jambon','pancetta; bacon','베이컨'),
  salmon:     L('somon; pește','salmon; fish','salmón; pescado','saumon; poisson','Lachs; Fisch','salmão; peixe','лосось; рыба','سلمون; سمك','三文鱼; 鲑鱼; 鱼','サーモン; 鮭; 魚','सैल्मन; मछली','somon; balık','salmone; pesce','연어; 생선'),
  white_fish: L('pește alb; pește; cod','white fish; fish; cod; haddock','pescado blanco; pescado; bacalao','poisson blanc; poisson; cabillaud','Weißfisch; Fisch; Kabeljau','peixe branco; peixe; bacalhau','белая рыба; рыба; треска','سمك أبيض; سمك','白身鱼; 鱼; 鳕鱼','白身魚; 魚; タラ','सफेद मछली; मछली','beyaz balık; balık; morina','pesce bianco; pesce; merluzzo','흰살생선; 생선; 대구'),
  prawn:      L('creveți; crevete','prawns; shrimp','gambas; camarones','crevettes','Garnelen; Shrimps','camarão; gambas','креветки','روبيان; جمبري','虾','エビ; 海老','झींगा','karides','gamberi; gamberetti','새우'),
  egg:        L('ou; ouă; gălbenuș','egg; eggs','huevo; huevos','œuf; œufs','Ei; Eier','ovo; ovos','яйцо; яйца','بيض; بيضة','鸡蛋; 蛋','卵; たまご','अंडा; अंडे','yumurta','uovo; uova','달걀; 계란'),

  // ── Dairy & cheese ────────────────────────────────────────────────────────
  milk:       L('lapte','milk','leche','lait','Milch','leite','молоко','حليب','牛奶','牛乳; ミルク','दूध','süt','latte','우유'),
  butter:     L('unt','butter','mantequilla','beurre','Butter','manteiga','сливочное масло','زبدة','黄油','バター','मक्खन','tereyağı','burro','버터'),
  yogurt:     L('iaurt','yogurt; yoghurt','yogur','yaourt','Joghurt','iogurte','йогурт','لبن; زبادي','酸奶','ヨーグルト','दही','yoğurt','yogurt','요거트; 요구르트'),
  mozzarella: L('mozzarella','mozzarella','mozzarella','mozzarella','Mozzarella','mozarela','моцарелла','موزاريلا','马苏里拉','モッツァレラ','मोज़ेरेला','mozzarella','mozzarella','모차렐라'),
  parmesan:   L('parmezan','parmesan; parmigiano','parmesano','parmesan','Parmesan','parmesão','пармезан','بارميزان','帕尔马干酪','パルメザン','परमेज़ान','parmesan','parmigiano; parmigiano reggiano','파르메산'),
  pecorino:   L('pecorino','pecorino','pecorino','pecorino','Pecorino','pecorino','пекорино','بيكورينو','佩科里诺','ペコリーノ','पेकोरीनो','pecorino','pecorino; pecorino romano','페코리노'),
  mascarpone: L('mascarpone','mascarpone','mascarpone','mascarpone','Mascarpone','mascarpone','маскарпоне','ماسكاربوني','马斯卡彭','マスカルポーネ','मस्कारपोन','mascarpone','mascarpone','마스카르포네'),
  white_cheese: L('brânză; brânză de vaci; telemea','white cheese; farmer cheese; cottage cheese','queso blanco; requesón','fromage blanc; fromage frais','Weißkäse; Quark','queijo branco; requeijão','творог; белый сыр','جبن أبيض','白奶酪; 农家奶酪','白チーズ; カッテージチーズ','सफेद चीज़; पनीर','beyaz peynir; lor peyniri','formaggio fresco; ricotta','화이트 치즈; 코티지 치즈'),

  // ── Grains, starches, pasta, wrappers ─────────────────────────────────────
  rice:       L('orez','rice','arroz','riz','Reis','arroz','рис','أرز','米饭; 大米','米; ごはん; ライス','चावल','pirinç','riso','쌀; 밥'),
  spaghetti:  L('spaghete','spaghetti','espaguetis','spaghettis','Spaghetti','esparguete','спагетти','سباغيتي','意大利面','スパゲッティ','स्पगेटी','spagetti','spaghetti','스파게티'),
  ramen_noodles: L('tăiței ramen; tăiței','ramen noodles; noodles','fideos ramen; fideos','nouilles ramen; nouilles','Ramen-Nudeln; Nudeln','macarrão ramen; macarrão','лапша рамен; лапша','نودلز رامن; معكرونة','拉面; 面条','ラーメン; 中華麺; 麺','रामेन नूडल्स; नूडल्स','ramen eriştesi; erişte','noodles ramen; spaghetti di ramen','라멘; 라면; 면'),
  flour:      L('făină','flour','harina','farine','Mehl','farinha','мука','دقيق','面粉','小麦粉','आटा','un','farina','밀가루'),
  bulgur:     L('bulgur','bulgur','bulgur','boulgour','Bulgur','bulgur','булгур','برغل','碾碎干小麦','ブルグル','बुलगुर','bulgur','bulgur','불구르'),
  potato:     L('cartofi; cartof','potatoes; potato','patatas; papas','pommes de terre; pomme de terre','Kartoffeln; Kartoffel','batatas; batata','картофель; картошка','بطاطس; بطاطا','土豆; 马铃薯','じゃがいも; ポテト','आलू','patates','patate; patata','감자'),
  sweet_potato: L('cartof dulce; batat','sweet potato','batata; camote; boniato','patate douce','Süßkartoffel','batata-doce','батат; сладкий картофель','بطاطا حلوة','红薯; 地瓜','さつまいも','शकरकंद','tatlı patates','patata dolce','고구마'),
  corn:       L('porumb','corn; sweetcorn','maíz','maïs','Mais','milho','кукуруза','ذرة','玉米','コーン; とうもろこし','मक्का; भुट्टा','mısır','mais','옥수수'),
  tortilla:   L('tortilla; lipie de porumb','corn tortilla; tortilla','tortilla de maíz; tortilla','tortilla de maïs; tortilla','Maistortilla; Tortilla','tortilha de milho; tortilha','тортилья; кукурузная лепёшка','تورتيا; خبز الذرة','玉米饼; 墨西哥薄饼','トルティーヤ','टॉर्टिया','mısır tortillası; tortilla','tortilla di mais; tortilla','토르티야; 옥수수 전병'),
  phyllo:     L('foi de plăcintă; aluat filo','phyllo; filo pastry','masa filo; pasta filo','pâte filo','Filoteig; Yufka','massa filo','тесто фило','عجينة الفيلو; رقائق','费罗酥皮; 薄酥皮','フィロ生地','फिलो पेस्ट्री','yufka','pasta fillo','필로 페이스트리'),
  nori:       L('alge nori; nori','nori; seaweed','alga nori; nori','algue nori; nori','Nori; Noriblätter','alga nori; nori','нори; водоросли','نوري; أعشاب بحرية','海苔; 紫菜','海苔; のり','नोरी; समुद्री शैवाल','nori; deniz yosunu','alga nori; nori','김; 노리'),

  // ── Vegetables & aromatics ────────────────────────────────────────────────
  onion:      L('ceapă; cepe','onion','cebolla','oignon','Zwiebel','cebola','лук','بصل','洋葱','玉ねぎ','प्याज़','soğan','cipolla','양파'),
  spring_onion: L('ceapă verde; ceapă de primăvară','spring onion; scallion; green onion','cebolleta; cebolla verde','oignon nouveau; ciboule','Frühlingszwiebel','cebolinha','зелёный лук','بصل أخضر','葱; 青葱; 大葱','ネギ; 青ねぎ; 万能ねぎ','हरा प्याज़','yeşil soğan; taze soğan','cipollotto','파; 대파; 쪽파'),
  garlic:     L('usturoi','garlic','ajo','ail','Knoblauch','alho','чеснок','ثوم','大蒜','にんにく','लहसुन','sarımsak','aglio','마늘'),
  ginger:     L('ghimbir','ginger','jengibre','gingembre','Ingwer','gengibre','имбирь','زنجبيل','姜; 生姜','生姜; しょうが','अदरक','zencefil','zenzero','생강'),
  galangal:   L('galangal; ghimbir thailandez','galangal','galangal','galanga','Galgant','galanga','галангал; калган','خولنجان','南姜; 高良姜','ガランガル; ナンキョウ','कुलंजन','galanga','galanga','갈랑갈'),
  tomato:     L('roșii; roșie','tomatoes; tomato','tomates; tomate','tomates; tomate','Tomaten; Tomate','tomates; tomate','помидоры; томаты','طماطم; بندورة','番茄; 西红柿','トマト','टमाटर','domates','pomodori; pomodoro','토마토'),
  cucumber:   L('castravete; castraveți','cucumber','pepino','concombre','Gurke','pepino','огурец','خيار','黄瓜','きゅうり','खीरा','salatalık; hıyar','cetriolo','오이'),
  avocado:    L('avocado','avocado','aguacate; palta','avocat','Avocado','abacate','авокадо','أفوكادو','牛油果; 鳄梨','アボカド','एवोकाडो','avokado','avocado','아보카도'),
  bell_pepper: L('ardei gras; ardei roșu','bell pepper; red pepper','pimiento','poivron','Paprika','pimentão','болгарский перец; перец','فلفل حلو; فلفل رومي','甜椒; 灯笼椒','パプリカ; ピーマン','शिमला मिर्च','dolmalık biber; kırmızı biber','peperone','파프리카; 피망'),
  zucchini:   L('dovlecel','zucchini','calabacín','courgette','Zucchini','courgette','кабачок','كوسة','西葫芦','ズッキーニ','तोरी','kabak','zucchina','애호박'),
  carrot:     L('morcov; morcovi','carrot','zanahoria','carotte','Karotte','cenoura','морковь','جزر','胡萝卜','にんじん','गाजर','havuç','carota','당근'),
  spinach:    L('spanac','spinach','espinacas','épinards','Spinat','espinafre','шпинат','سبانخ','菠菜','ほうれん草','पालक','ıspanak','spinaci','시금치'),
  mushroom:   L('ciuperci','mushrooms; mushroom','champiñones; setas','champignons','Champignons; Pilze','cogumelos','грибы','فطر','蘑菇','マッシュルーム; きのこ','मशरूम','mantar','funghi','버섯; 양송이버섯'),
  bean_sprouts: L('germeni de fasole; muguri de soia','bean sprouts; beansprouts','brotes de soja; germinados','germes de soja; pousses de soja','Sojasprossen; Bohnensprossen','broto de feijão','ростки фасоли; проростки','براعم الفول; نبت الفاصوليا','豆芽','もやし','अंकुरित मूंग','fasulye filizi','germogli di soia','숙주나물; 콩나물'),
  lemongrass: L('iarbă de lămâie; lemongrass','lemongrass','hierba de limón; citronela','citronnelle','Zitronengras','capim-limão; erva-príncipe','лемонграсс; лимонное сорго','عشب الليمون; حشيشة الليمون','香茅','レモングラス','लेमनग्रास; नींबू घास','limon otu','citronella; lemongrass','레몬그라스'),
  chickpeas:  L('năut','chickpeas','garbanzos','pois chiches','Kichererbsen','grão-de-bico','нут','حمص','鹰嘴豆','ひよこ豆; ガルバンゾ','छोले; चना','nohut','ceci','병아리콩'),

  // ── Fruit & acid ──────────────────────────────────────────────────────────
  lemon:      L('lămâie','lemon','limón','citron','Zitrone','limão','лимон','ليمون','柠檬','レモン','नींबू','limon','limone','레몬'),
  lime:       L('lime; lămâie verde','lime','lima; limón verde','citron vert; lime','Limette','limão; lima','лайм','ليمون أخضر; لايم','青柠; 酸橙','ライム','नींबू; लाइम','misket limonu; lime','lime; limetta','라임'),

  // ── Herbs ─────────────────────────────────────────────────────────────────
  parsley:    L('pătrunjel verde; pătrunjel','parsley','perejil','persil','Petersilie','salsa','петрушка','بقدونس','欧芹','パセリ','हरा धनिया; पार्सले','maydanoz','prezzemolo','파슬리'),
  coriander:  L('coriandru; frunze de coriandru','coriander; cilantro','cilantro; coriandro','coriandre','Koriander','coentro','кориандр; кинза','كزبرة','香菜; 芫荽','コリアンダー; パクチー','धनिया','kişniş','coriandolo','고수'),
  mint:       L('mentă','mint','menta; hierbabuena','menthe','Minze','hortelã; menta','мята','نعناع','薄荷','ミント; ハッカ','पुदीना','nane','menta','민트'),
  dill:       L('mărar','dill','eneldo','aneth','Dill','endro','укроп','شبت','莳萝','ディル','डिल','dereotu','aneto','딜'),
  basil:      L('busuioc','basil','albahaca','basilic','Basilikum','manjericão','базилик','ريحان','罗勒; 九层塔','バジル','तुलसी; बेसिल','fesleğen; reyhan','basilico','바질'),

  // ── Spices ────────────────────────────────────────────────────────────────
  paprika:    L('boia de ardei; boia','paprika','pimentón','paprika','Paprikapulver','colorau','паприка','بابريكا','红椒粉','パプリカパウダー','लाल शिमला मिर्च पाउडर','toz kırmızı biber','paprica','파프리카 가루'),
  cumin:      L('chimen; chimion','cumin','comino','cumin','Kreuzkümmel','cominho','зира; кумин','كمون','孜然','クミン','जीरा','kimyon','cumino','커민'),
  cinnamon:   L('scorțișoară','cinnamon','canela','cannelle','Zimt','canela','корица','قرفة','肉桂','シナモン','दालचीनी','tarçın','cannella','계피'),
  chili:      L('ardei iute; chili','chili; chilli; chili pepper','chile; guindilla; ají','piment','Chili; Peperoni','pimenta; malagueta','перец чили; чили','فلفل حار; فلفل حريف','辣椒','唐辛子; チリ','मिर्च; लाल मिर्च','acı biber; pul biber','peperoncino','고추'),

  // ── Condiments, oils, pastes ──────────────────────────────────────────────
  soy_sauce:  L('sos de soia','soy sauce','salsa de soja','sauce soja','Sojasauce','molho de soja','соевый соус','صلصة الصويا','酱油','醤油; しょうゆ','सोया सॉस','soya sosu','salsa di soia','간장'),
  fish_sauce: L('sos de pește','fish sauce','salsa de pescado','sauce de poisson; nuoc-mâm','Fischsauce','molho de peixe','рыбный соус','صلصة السمك','鱼露','ナンプラー; 魚醤','फिश सॉस','balık sosu','salsa di pesce','피시 소스; 액젓'),
  sesame_oil: L('ulei de susan','sesame oil','aceite de sésamo','huile de sésame','Sesamöl','óleo de gergelim','кунжутное масло','زيت السمسم','香油; 芝麻油','ごま油','तिल का तेल','susam yağı','olio di sesamo','참기름'),
  olive_oil:  L('ulei de măsline','olive oil','aceite de oliva','huile d\'olive','Olivenöl','azeite; azeite de oliva','оливковое масло','زيت الزيتون','橄榄油','オリーブオイル; オリーブ油','जैतून का तेल','zeytinyağı','olio d\'oliva; olio extravergine','올리브 오일'),
  gochujang:  L('gochujang; pastă coreeană de ardei','gochujang; korean chili paste','gochujang; pasta de chile coreana','gochujang; pâte de piment coréenne','Gochujang','gochujang','кочхуджан; кочудян','غوتشوجانغ','韩式辣酱; 苦椒酱','コチュジャン','गोचुजांग','gochujang','gochujang','고추장'),
  miso:       L('miso; pastă miso','miso; miso paste','miso; pasta de miso','miso; pâte de miso','Miso; Misopaste','missô; pasta de missô','мисо; паста мисо','ميسو','味噌','味噌; みそ','मिसो','miso','miso','미소; 된장'),
  tahini:     L('tahini; pastă de susan','tahini','tahini; tahín','tahini; purée de sésame','Tahini; Sesampaste','tahine; tahini','тахини; кунжутная паста','طحينة','芝麻酱; 中东芝麻酱','タヒニ; 練りごま','ताहिनी','tahin','tahina; tahini','타히니'),
  honey:      L('miere','honey','miel','miel','Honig','mel','мёд','عسل','蜂蜜','はちみつ; 蜂蜜','शहद','bal','miele','꿀'),
  chocolate:  L('ciocolată','chocolate','chocolate','chocolat','Schokolade','chocolate','шоколад','شوكولاتة','巧克力','チョコレート','चॉकलेट','çikolata','cioccolato','초콜릿'),
  coffee:     L('cafea; espresso','coffee; espresso','café; espresso','café; espresso','Kaffee; Espresso','café; espresso','кофе; эспрессо','قهوة; إسبريسو','咖啡; 浓缩咖啡','コーヒー; エスプレッソ','कॉफ़ी; एस्प्रेसो','kahve; espresso','caffè; espresso','커피; 에스프레소'),

  // ── Nuts ──────────────────────────────────────────────────────────────────
  walnut:     L('nucă; nuci','walnuts; walnut','nueces','noix','Walnüsse','nozes','грецкие орехи','جوز عين الجمل; جوز','核桃','くるみ','अखरोट','ceviz','noci','호두'),
  pistachio:  L('fistic','pistachios; pistachio','pistachos','pistaches','Pistazien','pistácios','фисташки','فستق حلبي; فستق','开心果','ピスタチオ','पिस्ता','antep fıstığı; fıstık','pistacchi','피스타치오'),
  almond:     L('migdale','almonds; almond','almendras','amandes','Mandeln','amêndoas','миндаль','لوز','杏仁','アーモンド','बादाम','badem','mandorle','아몬드'),
  peanut:     L('arahide','peanuts; peanut','cacahuetes; maní','cacahuètes; arachides','Erdnüsse','amendoim','арахис','فول سوداني','花生','ピーナッツ; 落花生','मूंगफली','yer fıstığı','arachidi','땅콩'),
});

export const INGREDIENT_IDS = Object.freeze(new Set(Object.keys(INGREDIENTS)));
