/* ============================================================
   Budget Recipes — meal-planner.ro
   Rebuilt to the recipes.js quality standard (Phase 3 pilot).
   See docs/ai/BUDGET_RECIPES_AUDIT.md.

   - 10 real, distinct budget dishes (the legacy file was 10 dishes
     cloned 20x with fabricated origins and boilerplate steps).
   - Exact quantities; English ingredient lines are parseable by
     shopping-list.js parseIngredient().
   - Metadata is self-contained (servings, time, costRon, nutrition)
     so the app receives it without recipes-meta.js.
   - NOTE: costRon (RON per serving) and nutrition (per serving) are
     good-faith ESTIMATES, not measured values — review before use.
   ============================================================ */

const LANGS = ['ro','en','es','fr','de','pt','ru','ar','zh','ja','hi','tr','it','ko'];

const CAT = { ro:'Buget', en:'Budget', es:'Económico', fr:'Budget', de:'Budget', pt:'Económico',
  ru:'Бюджет', ar:'اقتصادي', zh:'经济', ja:'節約', hi:'बजट', tr:'Bütçe', it:'Economico', ko:'절약' };

// Truthful origins (small shared vocabulary).
const O = {
  INT: { ro:'Internațional', en:'International', es:'Internacional', fr:'International', de:'International', pt:'Internacional', ru:'Международное', ar:'عالمي', zh:'国际', ja:'インターナショナル', hi:'अंतरराष्ट्रीय', tr:'Uluslararası', it:'Internazionale', ko:'인터내셔널' },
  IT:  { ro:'Italia', en:'Italy', es:'Italia', fr:'Italie', de:'Italien', pt:'Itália', ru:'Италия', ar:'إيطاليا', zh:'意大利', ja:'イタリア', hi:'इटली', tr:'İtalya', it:'Italia', ko:'이탈리아' },
  RO:  { ro:'România', en:'Romania', es:'Rumanía', fr:'Roumanie', de:'Rumänien', pt:'Roménia', ru:'Румыния', ar:'رومانيا', zh:'罗马尼亚', ja:'ルーマニア', hi:'रोमानिया', tr:'Romanya', it:'Romania', ko:'루마니아' },
  FR:  { ro:'Franța', en:'France', es:'Francia', fr:'France', de:'Frankreich', pt:'França', ru:'Франция', ar:'فرنسا', zh:'法国', ja:'フランス', hi:'फ्रांस', tr:'Fransa', it:'Francia', ko:'프랑스' },
  ME:  { ro:'Orientul Mijlociu', en:'Middle East', es:'Oriente Medio', fr:'Moyen-Orient', de:'Naher Osten', pt:'Médio Oriente', ru:'Ближний Восток', ar:'الشرق الأوسط', zh:'中东', ja:'中東', hi:'मध्य पूर्व', tr:'Orta Doğu', it:'Medio Oriente', ko:'중동' },
  EE:  { ro:'Europa de Est', en:'Eastern Europe', es:'Europa del Este', fr:"Europe de l'Est", de:'Osteuropa', pt:'Europa de Leste', ru:'Восточная Европа', ar:'أوروبا الشرقية', zh:'东欧', ja:'東欧', hi:'पूर्वी यूरोप', tr:'Doğu Avrupa', it:"Europa dell'Est", ko:'동유럽' },
};

// Shared 14-language ingredient names (reused from the legacy translations).
const I = {
  rice:      { ro:'Orez', en:'Rice', es:'Arroz', fr:'Riz', de:'Reis', pt:'Arroz', ru:'Рис', ar:'أرز', zh:'米饭', ja:'米', hi:'चावल', tr:'Pirinç', it:'Riso', ko:'쌀' },
  frozenVeg: { ro:'Legume congelate (mix)', en:'Frozen mixed vegetables', es:'Verduras mixtas congeladas', fr:'Légumes surgelés mélangés', de:'Tiefkühl-Gemüsemix', pt:'Legumes mistos congelados', ru:'Замороженные овощи (смесь)', ar:'خضار مجمّدة مشكلة', zh:'冷冻混合蔬菜', ja:'冷凍ミックス野菜', hi:'मिक्स फ्रोज़न सब्ज़ियाँ', tr:'Dondurulmuş karışık sebze', it:'Verdure miste surgelate', ko:'냉동 혼합 채소' },
  oil:       { ro:'Ulei', en:'Oil', es:'Aceite', fr:'Huile', de:'Öl', pt:'Óleo', ru:'Масло', ar:'زيت', zh:'食用油', ja:'油', hi:'तेल', tr:'Yağ', it:'Olio', ko:'식용유' },
  salt:      { ro:'Sare', en:'Salt', es:'Sal', fr:'Sel', de:'Salz', pt:'Sal', ru:'Соль', ar:'ملح', zh:'盐', ja:'塩', hi:'नमक', tr:'Tuz', it:'Sale', ko:'소금' },
  onion:     { ro:'Ceapă', en:'Onion', es:'Cebolla', fr:'Oignon', de:'Zwiebel', pt:'Cebola', ru:'Лук', ar:'بصل', zh:'洋葱', ja:'玉ねぎ', hi:'प्याज़', tr:'Soğan', it:'Cipolla', ko:'양파' },
  garlic:    { ro:'Usturoi', en:'Garlic', es:'Ajo', fr:'Ail', de:'Knoblauch', pt:'Alho', ru:'Чеснок', ar:'ثوم', zh:'大蒜', ja:'にんにく', hi:'लहसुन', tr:'Sarımsak', it:'Aglio', ko:'마늘' },
  pasta:     { ro:'Paste', en:'Pasta', es:'Pasta', fr:'Pâtes', de:'Pasta', pt:'Massa', ru:'Макароны', ar:'مكرونة', zh:'意大利面', ja:'パスタ', hi:'पास्ता', tr:'Makarna', it:'Pasta', ko:'파스타' },
  passata:   { ro:'Roșii pasate', en:'Tomato passata', es:'Tomate triturado', fr:'Tomates passées', de:'Passierte Tomaten', pt:'Tomate passata', ru:'Томаты протёртые', ar:'طماطم مهروسة', zh:'番茄泥', ja:'トマトピューレ', hi:'टमाटर प्यूरी', tr:'Domates püresi', it:'Passata di pomodoro', ko:'토마토 퓌레' },
  lentils:   { ro:'Linte', en:'Lentils', es:'Lentejas', fr:'Lentilles', de:'Linsen', pt:'Lentilhas', ru:'Чечевица', ar:'عدس', zh:'扁豆', ja:'レンズ豆', hi:'मसूर दाल', tr:'Mercimek', it:'Lenticchie', ko:'렌틸콩' },
  carrot:    { ro:'Morcov', en:'Carrot', es:'Zanahoria', fr:'Carotte', de:'Karotte', pt:'Cenoura', ru:'Морковь', ar:'جزر', zh:'胡萝卜', ja:'にんじん', hi:'गाजर', tr:'Havuç', it:'Carota', ko:'당근' },
  water:     { ro:'Apă', en:'Water', es:'Agua', fr:'Eau', de:'Wasser', pt:'Água', ru:'Вода', ar:'ماء', zh:'水', ja:'水', hi:'पानी', tr:'Su', it:'Acqua', ko:'물' },
  spices:    { ro:'Condimente', en:'Spices', es:'Especias', fr:'Épices', de:'Gewürze', pt:'Especiarias', ru:'Специи', ar:'بهارات', zh:'香料', ja:'スパイス', hi:'मसाले', tr:'Baharat', it:'Spezie', ko:'향신료' },
  potatoes:  { ro:'Cartofi', en:'Potatoes', es:'Patatas', fr:'Pommes de terre', de:'Kartoffeln', pt:'Batatas', ru:'Картофель', ar:'بطاطس', zh:'土豆', ja:'じゃがいも', hi:'आलू', tr:'Patates', it:'Patate', ko:'감자' },
  beans:     { ro:'Fasole la conservă', en:'Canned beans', es:'Frijoles en lata', fr:'Haricots en boîte', de:'Bohnen (Dose)', pt:'Feijão enlatado', ru:'Фасоль (консервы)', ar:'فاصوليا معلبة', zh:'罐装豆类', ja:'豆の缶詰', hi:'डिब्बाबंद बीन्स', tr:'Konserve fasulye', it:'Fagioli in scatola', ko:'통조림 콩' },
  chickpeas: { ro:'Năut la conservă', en:'Canned chickpeas', es:'Garbanzos en lata', fr:'Pois chiches en boîte', de:'Kichererbsen (Dose)', pt:'Grão-de-bico enlatado', ru:'Нут (консервы)', ar:'حمص معلب', zh:'罐装鹰嘴豆', ja:'ひよこ豆の缶詰', hi:'डिब्बाबंद चना', tr:'Konserve nohut', it:'Ceci in scatola', ko:'통조림 병아리콩' },
  eggs:      { ro:'Ouă', en:'Eggs', es:'Huevos', fr:'Œufs', de:'Eier', pt:'Ovos', ru:'Яйца', ar:'بيض', zh:'鸡蛋', ja:'卵', hi:'अंडे', tr:'Yumurta', it:'Uova', ko:'계란' },
  cabbage:   { ro:'Varză', en:'Cabbage', es:'Repollo', fr:'Chou', de:'Kohl', pt:'Repolho', ru:'Капуста', ar:'ملفوف', zh:'卷心菜', ja:'キャベツ', hi:'पत्ता गोभी', tr:'Lahana', it:'Cavolo', ko:'양배추' },
  milk:      { ro:'Lapte', en:'Milk', es:'Leche', fr:'Lait', de:'Milch', pt:'Leite', ru:'Молоко', ar:'حليب', zh:'牛奶', ja:'牛乳', hi:'दूध', tr:'Süt', it:'Latte', ko:'우유' },
  sugar:     { ro:'Zahăr', en:'Sugar', es:'Azúcar', fr:'Sucre', de:'Zucker', pt:'Açúcar', ru:'Сахар', ar:'سكر', zh:'糖', ja:'砂糖', hi:'चीनी', tr:'Şeker', it:'Zucchero', ko:'설탕' },
  cornmeal:  { ro:'Mălai', en:'Cornmeal', es:'Harina de maíz', fr:'Semoule de maïs', de:'Maisgrieß', pt:'Fubá', ru:'Кукурузная крупа', ar:'دقيق الذرة', zh:'玉米粉', ja:'コーンミール', hi:'मक्के का आटा', tr:'Mısır unu', it:'Farina di mais', ko:'옥수수가루' },
};

const NAMES = {
  riceVeg:   { ro:'Orez cu legume', en:'Rice with vegetables', es:'Arroz con verduras', fr:'Riz aux légumes', de:'Reis mit Gemüse', pt:'Arroz com legumes', ru:'Рис с овощами', ar:'أرز بالخضار', zh:'蔬菜炒饭', ja:'野菜ご飯', hi:'सब्ज़ी चावल', tr:'Sebzeli pilav', it:'Riso con verdure', ko:'야채 볶음밥' },
  pasta:     { ro:'Paste cu sos de roșii și usturoi', en:'Pasta with tomato & garlic sauce', es:'Pasta con salsa de tomate y ajo', fr:'Pâtes sauce tomate à l’ail', de:'Pasta mit Tomaten-Knoblauch-Soße', pt:'Massa com molho de tomate e alho', ru:'Макароны с томатно-чесночным соусом', ar:'مكرونة بصلصة الطماطم والثوم', zh:'番茄蒜香意面', ja:'トマトガーリックパスタ', hi:'टमाटर-लहसुन पास्ता', tr:'Domatesli sarımsaklı makarna', it:'Pasta al pomodoro e aglio', ko:'토마토 갈릭 파스타' },
  lentil:    { ro:'Supă rapidă de linte', en:'Quick lentil soup', es:'Sopa rápida de lentejas', fr:'Soupe rapide de lentilles', de:'Schnelle Linsensuppe', pt:'Sopa rápida de lentilhas', ru:'Быстрый чечевичный суп', ar:'شوربة عدس سريعة', zh:'快手扁豆汤', ja:'レンズ豆の簡単スープ', hi:'झटपट दाल सूप', tr:'Hızlı mercimek çorbası', it:'Zuppa veloce di lenticchie', ko:'초간단 렌틸 수프' },
  potato:    { ro:'Cartofi fierți cu sos de usturoi', en:'Boiled potatoes with garlic sauce', es:'Patatas cocidas con salsa de ajo', fr:'Pommes de terre bouillies sauce à l’ail', de:'Gekochte Kartoffeln mit Knoblauchsauce', pt:'Batatas cozidas com molho de alho', ru:'Отварной картофель с чесночным соусом', ar:'بطاطس مسلوقة بصلصة الثوم', zh:'蒜香水煮土豆', ja:'じゃがいものガーリックソース', hi:'लहसुन सॉस के साथ उबले आलू', tr:'Sarımsak soslu haşlanmış patates', it:'Patate lesse con salsa all’aglio', ko:'마늘 소스 감자' },
  beans:     { ro:'Fasole simplă la tigaie', en:'Simple pan beans', es:'Frijoles sencillos en sartén', fr:'Haricots simples à la poêle', de:'Einfache Bohnen aus der Pfanne', pt:'Feijão simples na frigideira', ru:'Простая фасоль на сковороде', ar:'فاصوليا بسيطة بالمقلاة', zh:'简易豆子炒锅', ja:'簡単豆の炒め物', hi:'सरल बीन्स पैन-फ्राय', tr:'Tavada pratik fasulye', it:'Fagioli semplici in padella', ko:'간단 콩 볶음' },
  chickpea:  { ro:'Năut cu condimente (rapid)', en:'Spiced chickpeas (quick)', es:'Garbanzos especiados (rápido)', fr:'Pois chiches épicés (rapide)', de:'Gewürzte Kichererbsen (schnell)', pt:'Grão-de-bico temperado (rápido)', ru:'Нут со специями (быстро)', ar:'حمص متبل (سريع)', zh:'快手香料鹰嘴豆', ja:'スパイスひよこ豆（簡単）', hi:'मसालेदार चना (झटपट)', tr:'Baharatlı nohut (hızlı)', it:'Ceci speziati (veloci)', ko:'향신료 병아리콩 (간단)' },
  omelet:    { ro:'Omletă simplă', en:'Basic omelet', es:'Tortilla simple', fr:'Omelette simple', de:'Einfaches Omelett', pt:'Omelete simples', ru:'Простой омлет', ar:'عجة بسيطة', zh:'基础煎蛋卷', ja:'基本のオムレツ', hi:'सादा ऑमलेट', tr:'Sade omlet', it:'Omelette semplice', ko:'기본 오믈렛' },
  cabbage:   { ro:'Varză călită', en:'Sautéed cabbage', es:'Repollo salteado', fr:'Chou sauté', de:'Geschmorter Kohl', pt:'Repolho refogado', ru:'Тушёная капуста', ar:'ملفوف مطهو', zh:'炒卷心菜', ja:'キャベツ炒め', hi:'भुनी हुई पत्ता गोभी', tr:'Kavrulmuş lahana', it:'Cavolo stufato', ko:'양배추 볶음' },
  ricePud:   { ro:'Orez cu lapte', en:'Rice pudding', es:'Arroz con leche', fr:'Riz au lait', de:'Milchreis', pt:'Arroz doce', ru:'Рисовый пудинг', ar:'أرز بالحليب', zh:'米布丁', ja:'ライスプディング', hi:'चावल की खीर', tr:'Sütlaç', it:'Riso al latte', ko:'라이스 푸딩' },
  polenta:   { ro:'Mămăligă simplă', en:'Basic polenta', es:'Polenta básica', fr:'Polenta simple', de:'Einfache Polenta', pt:'Polenta simples', ru:'Простая полента', ar:'عصيدة الذرة (بسيطة)', zh:'玉米粥', ja:'ポレンタ（基本）', hi:'मक्का दलिया', tr:'Sade mısır lapası', it:'Polenta semplice', ko:'기본 폴렌타' },
};

// Assemble the app-facing schema; English ingredient lines stay parser-ready.
function mk(s) {
  const ingredients = {};
  LANGS.forEach(l => {
    ingredients[l] = s.ing.map(it => {
      const qty = it.q != null ? String(it.q) : '';
      return [qty, it.u || '', it.n[l] || it.n.en].filter(Boolean).join(' ');
    });
  });
  return {
    id: s.id, name: s.name, origin: s.o, category: CAT,
    servings: s.servings, time: { prepMin: s.prep, cookMin: s.cook },
    costRon: s.costRon, nutrition: s.nut, tags: s.tags,
    ingredients, howIsMade: s.steps,
  };
}

const SPECS = [
  { id:'budget_001', name:NAMES.riceVeg, o:O.INT, servings:2, prep:5, cook:20, costRon:5, nut:{cal:420,prot:9,carb:72,fat:11,fib:6}, tags:['budget','vegan','quick'],
    ing:[ {q:150,u:'g',n:I.rice}, {q:200,u:'g',n:I.frozenVeg}, {q:2,u:'tbsp',n:I.oil}, {q:1,n:I.onion}, {q:2,u:'cloves',n:I.garlic}, {n:I.salt} ],
    steps:{
      ro:'Încinge uleiul într-o oală și călește ceapa tocată și usturoiul 3 minute. Adaugă orezul și amestecă 1 minut ca să se învelească în ulei. Toarnă 300 ml apă, dă în clocot, apoi acoperă și fierbe la foc mic 15 minute. În ultimele 5 minute adaugă legumele congelate, potrivește de sare și lasă acoperit 2 minute înainte de servire.',
      en:'Heat the oil in a pot and soften the chopped onion and garlic for 3 minutes. Add the rice and stir for 1 minute to coat it in the oil. Pour in 300 ml water, bring to a boil, then cover and simmer on low for 15 minutes. Stir in the frozen vegetables for the last 5 minutes, season with salt, and rest covered for 2 minutes before serving.',
      es:'Calienta el aceite en una olla y sofríe la cebolla picada y el ajo 3 minutos. Añade el arroz y remueve 1 minuto para cubrirlo de aceite. Vierte 300 ml de agua, lleva a ebullición, tapa y cocina a fuego bajo 15 minutos. En los últimos 5 minutos agrega las verduras congeladas, sazona con sal y deja reposar tapado 2 minutos antes de servir.',
      fr:'Faites chauffer l’huile dans une casserole et faites revenir l’oignon haché et l’ail 3 minutes. Ajoutez le riz et remuez 1 minute pour l’enrober d’huile. Versez 300 ml d’eau, portez à ébullition, couvrez et laissez mijoter à feu doux 15 minutes. Ajoutez les légumes surgelés les 5 dernières minutes, salez et laissez reposer couvert 2 minutes avant de servir.',
      de:'Öl im Topf erhitzen und die gehackte Zwiebel mit dem Knoblauch 3 Minuten anschwitzen. Den Reis zugeben und 1 Minute rühren, bis er mit Öl überzogen ist. 300 ml Wasser angießen, aufkochen, dann zugedeckt bei niedriger Hitze 15 Minuten köcheln. In den letzten 5 Minuten das Tiefkühlgemüse einrühren, mit Salz abschmecken und vor dem Servieren 2 Minuten zugedeckt ruhen lassen.',
      pt:'Aqueça o óleo numa panela e refogue a cebola picada e o alho 3 minutos. Junte o arroz e mexa 1 minuto para o envolver no óleo. Adicione 300 ml de água, deixe ferver, tape e cozinhe em lume brando 15 minutos. Nos últimos 5 minutos junte os legumes congelados, tempere com sal e deixe repousar tapado 2 minutos antes de servir.',
      ru:'Разогрейте масло в кастрюле и обжарьте нарезанный лук с чесноком 3 минуты. Добавьте рис и помешивайте 1 минуту, чтобы он покрылся маслом. Влейте 300 мл воды, доведите до кипения, накройте и варите на слабом огне 15 минут. За последние 5 минут вмешайте замороженные овощи, посолите и дайте постоять под крышкой 2 минуты перед подачей.',
      ar:'سخّن الزيت في قدر وشوّح البصل المفروم والثوم 3 دقائق. أضف الأرز وقلّبه دقيقة واحدة حتى يتغطى بالزيت. أضف 300 مل ماء واتركه يغلي، ثم غطّه واطهه على نار هادئة 15 دقيقة. في آخر 5 دقائق أضف الخضار المجمّدة وتبّل بالملح، واتركه مغطى دقيقتين قبل التقديم.',
      zh:'锅中热油，下洋葱末和蒜末炒香约3分钟。加入米翻炒1分钟使其裹上油。倒入300毫升水煮开，加盖小火焖15分钟。最后5分钟拌入冷冻蔬菜，加盐调味，离火加盖静置2分钟再上桌。',
      ja:'鍋に油を熱し、みじん切りの玉ねぎとにんにくを3分炒める。米を加え、油がなじむよう1分炒める。水300mlを注いで沸騰させ、ふたをして弱火で15分煮る。最後の5分で冷凍野菜を加え、塩で味を調え、ふたをして2分蒸らしてから盛り付ける。',
      hi:'एक बर्तन में तेल गरम करें और कटा प्याज़ व लहसुन 3 मिनट भूनें। चावल डालकर 1 मिनट चलाएँ ताकि तेल में लिपट जाए। 300 मि.ली. पानी डालें, उबाल आने दें, फिर ढककर धीमी आँच पर 15 मिनट पकाएँ। आख़िरी 5 मिनट में फ्रोज़न सब्ज़ियाँ मिलाएँ, नमक डालें और परोसने से पहले ढककर 2 मिनट रखें।',
      tr:'Tencerede yağı ısıtın, doğranmış soğan ve sarımsağı 3 dakika kavurun. Pirinci ekleyip yağı emmesi için 1 dakika karıştırın. 300 ml su ekleyip kaynatın, kapağını kapatıp kısık ateşte 15 dakika pişirin. Son 5 dakikada dondurulmuş sebzeleri katın, tuzla tatlandırın ve servisten önce kapağı kapalı 2 dakika dinlendirin.',
      it:'Scalda l’olio in una pentola e fai appassire la cipolla tritata e l’aglio per 3 minuti. Unisci il riso e mescola 1 minuto per farlo insaporire. Versa 300 ml d’acqua, porta a bollore, copri e cuoci a fuoco basso 15 minuti. Negli ultimi 5 minuti aggiungi le verdure surgelate, regola di sale e lascia riposare coperto 2 minuti prima di servire.',
      ko:'냄비에 기름을 두르고 다진 양파와 마늘을 3분간 볶는다. 쌀을 넣고 기름이 배도록 1분간 볶는다. 물 300ml를 붓고 끓인 뒤 뚜껑을 덮어 약불에서 15분간 익힌다. 마지막 5분에 냉동 채소를 넣고 소금으로 간한 뒤, 뚜껑을 덮어 2분간 뜸을 들여 낸다.' } },

  { id:'budget_002', name:NAMES.pasta, o:O.IT, servings:2, prep:5, cook:15, costRon:4, nut:{cal:480,prot:15,carb:85,fat:9,fib:6}, tags:['budget','vegetarian','quick'],
    ing:[ {q:180,u:'g',n:I.pasta}, {q:300,u:'g',n:I.passata}, {q:2,u:'tbsp',n:I.oil}, {q:3,u:'cloves',n:I.garlic}, {n:I.salt} ],
    steps:{
      ro:'Fierbe pastele în apă cu sare până sunt al dente, apoi scurge-le păstrând o cană din apă. Între timp, încălzește uleiul și călește usturoiul feliat până devine aromat, fără să se rumenească. Adaugă roșiile pasate și un praf de sare și fierbe sosul 8 minute. Amestecă pastele scurse în sos, subțiază cu puțină apă de fierbere și servește.',
      en:'Boil the pasta in salted water until al dente, then drain, saving a cup of the water. Meanwhile, warm the oil and gently fry the sliced garlic until fragrant but not browned. Add the tomato passata and a pinch of salt and simmer for 8 minutes. Toss the drained pasta through the sauce, loosening with a little pasta water, and serve.',
      es:'Cuece la pasta en agua con sal hasta que esté al dente, escurre y reserva una taza del agua. Mientras, calienta el aceite y fríe el ajo laminado hasta que esté aromático sin dorarse. Añade el tomate triturado y una pizca de sal y cocina 8 minutos. Mezcla la pasta escurrida con la salsa, aligera con un poco de agua de cocción y sirve.',
      fr:'Faites cuire les pâtes dans l’eau salée jusqu’à al dente, puis égouttez en gardant une tasse d’eau. Pendant ce temps, chauffez l’huile et faites revenir l’ail émincé jusqu’à ce qu’il embaume, sans le colorer. Ajoutez les tomates passées et une pincée de sel et laissez mijoter 8 minutes. Mélangez les pâtes égouttées à la sauce, détendez avec un peu d’eau de cuisson et servez.',
      de:'Die Pasta in Salzwasser al dente kochen, dann abgießen und eine Tasse Kochwasser aufbewahren. Währenddessen das Öl erwärmen und den geschnittenen Knoblauch duftend, aber ohne Farbe anbraten. Passierte Tomaten und eine Prise Salz zugeben und 8 Minuten köcheln. Die abgetropfte Pasta in der Soße schwenken, mit etwas Kochwasser lockern und servieren.',
      pt:'Coza a massa em água com sal até al dente, escorra e guarde uma chávena da água. Entretanto, aqueça o óleo e frite o alho fatiado até ficar aromático sem alourar. Junte o tomate passata e uma pitada de sal e cozinhe 8 minutos. Envolva a massa escorrida no molho, solte com um pouco da água da cozedura e sirva.',
      ru:'Отварите макароны в подсолённой воде до состояния аль денте, затем откиньте, сохранив стакан воды. Тем временем разогрейте масло и обжарьте нарезанный чеснок до аромата, не подрумянивая. Добавьте протёртые томаты и щепотку соли, тушите 8 минут. Перемешайте макароны с соусом, разбавьте небольшим количеством воды от варки и подавайте.',
      ar:'اسلق المكرونة في ماء مملّح حتى تنضج مع بقاء قوام، ثم صفّها واحتفظ بكوب من الماء. في هذه الأثناء سخّن الزيت وقلّب الثوم المقطّع حتى تفوح رائحته دون أن يحمرّ. أضف الطماطم المهروسة ورشة ملح واطهها 8 دقائق. قلّب المكرونة المصفّاة في الصلصة، وخفّفها بقليل من ماء السلق وقدّمها.',
      zh:'意面加盐水煮至弹牙，捞出并留一杯煮面水。同时热油，下蒜片小火煸出香味但不上色。加入番茄泥和少许盐，小火煮8分钟。把沥干的意面拌入酱汁，用少量煮面水调稀，即可上桌。',
      ja:'パスタを塩湯でアルデンテに茹で、ゆで汁を1カップ取り分けてから湯を切る。その間に油を温め、スライスしたにんにくを色づけないよう香りが立つまで炒める。トマトピューレと塩ひとつまみを加え、8分煮る。湯を切ったパスタをソースに絡め、ゆで汁少々でゆるめて盛り付ける。',
      hi:'पास्ता को नमकीन पानी में अल-डेंटे तक उबालें, एक कप पानी बचाकर छान लें। इस बीच तेल गरम करें और कटे लहसुन को बिना भूरा किए खुशबू आने तक भूनें। टमाटर प्यूरी और चुटकी नमक डालकर 8 मिनट पकाएँ। छाने पास्ता को सॉस में मिलाएँ, थोड़े पास्ता-पानी से पतला करें और परोसें।',
      tr:'Makarnayı tuzlu suda diri (al dente) haşlayın, bir su bardağı suyunu ayırıp süzün. Bu sırada yağı ısıtın, dilimlenmiş sarımsağı kızartmadan kokusu çıkana kadar kavurun. Domates püresi ve bir tutam tuz ekleyip 8 dakika pişirin. Süzülmüş makarnayı sosla harmanlayın, biraz haşlama suyuyla açın ve servis edin.',
      it:'Lessa la pasta in acqua salata al dente, poi scola tenendo da parte una tazza d’acqua. Nel frattempo scalda l’olio e rosola l’aglio affettato finché è profumato ma non dorato. Aggiungi la passata e un pizzico di sale e fai sobbollire 8 minuti. Manteca la pasta scolata nel sugo, allunga con un po’ d’acqua di cottura e servi.',
      ko:'파스타를 소금물에 알덴테로 삶고, 면수 한 컵을 남긴 뒤 물을 뺀다. 그동안 기름을 데우고 저민 마늘을 색이 나지 않게 향이 날 때까지 볶는다. 토마토 퓌레와 소금 한 꼬집을 넣고 8분간 끓인다. 물 뺀 파스타를 소스에 버무리고 면수로 농도를 맞춰 낸다.' } },

  { id:'budget_003', name:NAMES.lentil, o:O.ME, servings:2, prep:10, cook:25, costRon:4, nut:{cal:300,prot:18,carb:45,fat:6,fib:12}, tags:['budget','vegan','healthy'],
    ing:[ {q:150,u:'g',n:I.lentils}, {q:1,n:I.onion}, {q:1,n:I.carrot}, {q:2,u:'tbsp',n:I.oil}, {q:1,u:'l',n:I.water}, {q:1,u:'tsp',n:I.spices}, {q:2,u:'cloves',n:I.garlic}, {n:I.salt} ],
    steps:{
      ro:'Călește ceapa, morcovul și usturoiul tocate în ulei 5 minute. Adaugă lintea clătită, condimentele și apa, dă în clocot, apoi fierbe 20 de minute până se înmoaie lintea. Potrivește de sare și, dacă vrei, pasează o parte din supă pentru o textură mai densă. Servește fierbinte.',
      en:'Soften the chopped onion, carrot and garlic in the oil for 5 minutes. Add the rinsed lentils, spices and water, bring to a boil, then simmer for 20 minutes until the lentils are tender. Season with salt and, if you like, blend part of the soup for a thicker texture. Serve hot.',
      es:'Sofríe la cebolla, la zanahoria y el ajo picados en el aceite 5 minutos. Añade las lentejas enjuagadas, las especias y el agua, lleva a ebullición y cocina 20 minutos hasta que estén tiernas. Sazona con sal y, si quieres, tritura parte de la sopa para una textura más espesa. Sirve caliente.',
      fr:'Faites revenir l’oignon, la carotte et l’ail hachés dans l’huile 5 minutes. Ajoutez les lentilles rincées, les épices et l’eau, portez à ébullition, puis laissez mijoter 20 minutes jusqu’à ce que les lentilles soient tendres. Salez et, si vous voulez, mixez une partie de la soupe pour une texture plus épaisse. Servez chaud.',
      de:'Zwiebel, Karotte und Knoblauch gehackt im Öl 5 Minuten anschwitzen. Die abgespülten Linsen, Gewürze und Wasser zugeben, aufkochen und 20 Minuten köcheln, bis die Linsen weich sind. Mit Salz abschmecken und nach Belieben einen Teil der Suppe pürieren für eine dickere Konsistenz. Heiß servieren.',
      pt:'Refogue a cebola, a cenoura e o alho picados no óleo 5 minutos. Junte as lentilhas lavadas, as especiarias e a água, deixe ferver e cozinhe 20 minutos até ficarem macias. Tempere com sal e, se quiser, triture parte da sopa para uma textura mais espessa. Sirva quente.',
      ru:'Обжарьте нарезанные лук, морковь и чеснок в масле 5 минут. Добавьте промытую чечевицу, специи и воду, доведите до кипения и варите 20 минут до мягкости чечевицы. Посолите и при желании измельчите часть супа блендером для более густой текстуры. Подавайте горячим.',
      ar:'شوّح البصل والجزر والثوم المفروم في الزيت 5 دقائق. أضف العدس المغسول والبهارات والماء واتركه يغلي، ثم اطهه 20 دقيقة حتى ينضج العدس. تبّل بالملح، وإن أردت اخفق جزءاً من الشوربة لقوام أكثف. قدّمها ساخنة.',
      zh:'锅中热油，下洋葱丁、胡萝卜丁和蒜末炒5分钟。加入洗净的扁豆、香料和水煮开，再小火煮20分钟至扁豆软烂。加盐调味，喜欢浓稠可将部分汤打成糊状。趁热食用。',
      ja:'油でみじん切りの玉ねぎ、にんじん、にんにくを5分炒める。洗ったレンズ豆、スパイス、水を加えて沸騰させ、豆が柔らかくなるまで20分煮る。塩で味を調え、好みでスープの一部をブレンダーにかけてとろみをつける。熱いうちに供する。',
      hi:'तेल में कटा प्याज़, गाजर और लहसुन 5 मिनट भूनें। धुली दाल, मसाले और पानी डालें, उबाल लाएँ, फिर 20 मिनट पकाएँ जब तक दाल नरम न हो। नमक डालें और चाहें तो गाढ़ेपन के लिए सूप का कुछ भाग ब्लेंड कर लें। गरम परोसें।',
      tr:'Doğranmış soğan, havuç ve sarımsağı yağda 5 dakika kavurun. Yıkanmış mercimeği, baharatı ve suyu ekleyip kaynatın, ardından mercimek yumuşayana dek 20 dakika pişirin. Tuzla tatlandırın; isterseniz daha koyu kıvam için çorbanın bir kısmını blenderdan geçirin. Sıcak servis edin.',
      it:'Fai appassire cipolla, carota e aglio tritati nell’olio per 5 minuti. Aggiungi le lenticchie sciacquate, le spezie e l’acqua, porta a bollore e cuoci 20 minuti finché le lenticchie sono tenere. Regola di sale e, se vuoi, frulla parte della zuppa per una consistenza più densa. Servi calda.',
      ko:'기름에 다진 양파, 당근, 마늘을 5분간 볶는다. 헹군 렌틸콩, 향신료, 물을 넣고 끓인 뒤 렌틸콩이 부드러워질 때까지 20분간 끓인다. 소금으로 간하고, 원하면 수프 일부를 갈아 걸쭉하게 만든다. 뜨겁게 낸다.' } },

  { id:'budget_004', name:NAMES.potato, o:O.EE, servings:2, prep:5, cook:20, costRon:3, nut:{cal:320,prot:6,carb:55,fat:9,fib:5}, tags:['budget','vegan','one-pot'],
    ing:[ {q:500,u:'g',n:I.potatoes}, {q:3,u:'cloves',n:I.garlic}, {q:2,u:'tbsp',n:I.oil}, {q:1,u:'l',n:I.water}, {n:I.salt} ],
    steps:{
      ro:'Taie cartofii cuburi și fierbe-i în apă cu sare circa 18 minute, până se înmoaie, apoi scurge-i. Zdrobește usturoiul cu un praf de sare și amestecă-l cu uleiul ca să obții un sos rapid. Toarnă sosul de usturoi peste cartofii calzi și amestecă ușor să se acopere. Servește cald.',
      en:'Cut the potatoes into chunks and boil in salted water for about 18 minutes until tender, then drain. Crush the garlic with a pinch of salt and whisk it into the oil to make a quick sauce. Pour the garlic sauce over the warm potatoes and toss gently to coat. Serve warm.',
      es:'Corta las patatas en trozos y cuécelas en agua con sal unos 18 minutos hasta que estén tiernas, luego escurre. Machaca el ajo con una pizca de sal y bátelo con el aceite para una salsa rápida. Vierte la salsa de ajo sobre las patatas calientes y mezcla con cuidado. Sirve caliente.',
      fr:'Coupez les pommes de terre en morceaux et faites-les bouillir dans l’eau salée environ 18 minutes jusqu’à tendreté, puis égouttez. Écrasez l’ail avec une pincée de sel et fouettez-le avec l’huile pour une sauce express. Versez la sauce à l’ail sur les pommes de terre chaudes et mélangez délicatement. Servez chaud.',
      de:'Die Kartoffeln in Stücke schneiden und in Salzwasser etwa 18 Minuten weich kochen, dann abgießen. Den Knoblauch mit einer Prise Salz zerdrücken und mit dem Öl zu einer schnellen Sauce verrühren. Die Knoblauchsauce über die warmen Kartoffeln geben und vorsichtig durchschwenken. Warm servieren.',
      pt:'Corte as batatas em pedaços e coza em água com sal cerca de 18 minutos até ficarem macias, depois escorra. Esmague o alho com uma pitada de sal e misture com o óleo para um molho rápido. Regue as batatas quentes com o molho de alho e envolva com cuidado. Sirva quente.',
      ru:'Нарежьте картофель кусочками и отварите в подсолённой воде около 18 минут до мягкости, затем слейте воду. Раздавите чеснок со щепоткой соли и смешайте с маслом до состояния быстрого соуса. Полейте тёплый картофель чесночным соусом и аккуратно перемешайте. Подавайте тёплым.',
      ar:'قطّع البطاطس مكعبات واسلقها في ماء مملّح نحو 18 دقيقة حتى تنضج، ثم صفّها. اهرس الثوم مع رشة ملح واخلطه بالزيت لتحضير صلصة سريعة. اسكب صلصة الثوم على البطاطس الدافئة وقلّبها برفق حتى تتغطى. قدّمها دافئة.',
      zh:'土豆切块，加盐水煮约18分钟至软，捞出沥干。大蒜加少许盐压成泥，与油拌匀做成快手蒜汁。将蒜汁淋在温热的土豆上，轻轻翻拌均匀。趁温热食用。',
      ja:'じゃがいもを一口大に切り、塩湯で約18分やわらかくなるまで茹でて水を切る。にんにくを塩ひとつまみでつぶし、油と混ぜて手早くソースを作る。温かいじゃがいもにガーリックソースをかけ、やさしく和える。温かいうちに供する。',
      hi:'आलू को टुकड़ों में काटकर नमकीन पानी में लगभग 18 मिनट नरम होने तक उबालें, फिर छान लें। लहसुन को चुटकी नमक के साथ कूटें और तेल में मिलाकर झटपट सॉस बनाएँ। गरम आलू पर लहसुन सॉस डालें और हल्के हाथ से मिलाएँ। गरम परोसें।',
      tr:'Patatesleri iri doğrayın ve tuzlu suda yumuşayana dek yaklaşık 18 dakika haşlayıp süzün. Sarımsağı bir tutam tuzla ezin ve yağla çırparak pratik bir sos yapın. Sarımsak sosunu ılık patateslerin üzerine gezdirip nazikçe karıştırın. Ilık servis edin.',
      it:'Taglia le patate a pezzi e lessale in acqua salata per circa 18 minuti finché sono tenere, poi scola. Schiaccia l’aglio con un pizzico di sale e mescolalo con l’olio per una salsa veloce. Versa la salsa all’aglio sulle patate calde e mescola delicatamente. Servi caldo.',
      ko:'감자를 큼직하게 썰어 소금물에 약 18분간 부드러워질 때까지 삶은 뒤 물을 뺀다. 마늘을 소금 한 꼬집과 함께 으깨고 기름과 섞어 간단한 소스를 만든다. 따뜻한 감자에 마늘 소스를 붓고 살살 버무린다. 따뜻하게 낸다.' } },

  { id:'budget_005', name:NAMES.beans, o:O.INT, servings:2, prep:5, cook:15, costRon:4, nut:{cal:350,prot:17,carb:50,fat:8,fib:14}, tags:['budget','vegan','high-protein'],
    ing:[ {q:400,u:'g',n:I.beans}, {q:1,n:I.onion}, {q:2,u:'tbsp',n:I.oil}, {q:150,u:'g',n:I.passata}, {q:2,u:'cloves',n:I.garlic}, {q:1,u:'tsp',n:I.spices}, {n:I.salt} ],
    steps:{
      ro:'Călește ceapa și usturoiul tocate în ulei până se înmoaie și se rumenesc ușor, circa 5 minute. Adaugă roșiile pasate și condimentele și gătește 3 minute. Pune fasolea scursă și fierbe 8 minute, zdrobind câteva boabe de peretele tigăii ca să îngroașe. Potrivește de sare și servește.',
      en:'Fry the chopped onion and garlic in the oil until soft and lightly golden, about 5 minutes. Stir in the tomato passata and spices and cook for 3 minutes. Add the drained beans and simmer for 8 minutes, mashing a few against the pan to thicken. Season with salt and serve.',
      es:'Sofríe la cebolla y el ajo picados en el aceite hasta que estén blandos y dorados, unos 5 minutos. Añade el tomate triturado y las especias y cocina 3 minutos. Agrega los frijoles escurridos y cocina 8 minutos, aplastando algunos contra la sartén para espesar. Sazona con sal y sirve.',
      fr:'Faites revenir l’oignon et l’ail hachés dans l’huile jusqu’à ce qu’ils soient tendres et légèrement dorés, environ 5 minutes. Ajoutez les tomates passées et les épices et faites cuire 3 minutes. Ajoutez les haricots égouttés et laissez mijoter 8 minutes, en écrasant quelques-uns contre la poêle pour épaissir. Salez et servez.',
      de:'Zwiebel und Knoblauch gehackt im Öl weich und leicht goldbraun braten, etwa 5 Minuten. Passierte Tomaten und Gewürze einrühren und 3 Minuten kochen. Die abgetropften Bohnen zugeben und 8 Minuten köcheln, dabei einige am Pfannenrand zerdrücken, um zu binden. Mit Salz abschmecken und servieren.',
      pt:'Refogue a cebola e o alho picados no óleo até ficarem macios e ligeiramente dourados, cerca de 5 minutos. Junte o tomate passata e as especiarias e cozinhe 3 minutos. Adicione o feijão escorrido e cozinhe 8 minutos, esmagando alguns contra a frigideira para engrossar. Tempere com sal e sirva.',
      ru:'Обжарьте нарезанные лук и чеснок в масле до мягкости и лёгкой золотистости, около 5 минут. Вмешайте протёртые томаты и специи, готовьте 3 минуты. Добавьте фасоль без жидкости и тушите 8 минут, разминая часть о стенку сковороды для густоты. Посолите и подавайте.',
      ar:'شوّح البصل والثوم المفروم في الزيت حتى يلينا ويكتسبا لوناً ذهبياً خفيفاً، نحو 5 دقائق. أضف الطماطم المهروسة والبهارات واطهها 3 دقائق. أضف الفاصوليا المصفّاة واطهها 8 دقائق مع هرس بعضها على جدار المقلاة لتكثيف القوام. تبّل بالملح وقدّم.',
      zh:'锅中热油，下洋葱末和蒜末炒至变软微黄，约5分钟。加入番茄泥和香料炒3分钟。放入沥干的豆子煮8分钟，用锅铲压碎几颗使汤汁变稠。加盐调味即可上桌。',
      ja:'油でみじん切りの玉ねぎとにんにくを、柔らかく薄く色づくまで約5分炒める。トマトピューレとスパイスを加えて3分煮る。汁気を切った豆を加えて8分煮込み、数粒を鍋肌でつぶしてとろみをつける。塩で味を調えて供する。',
      hi:'तेल में कटा प्याज़ और लहसुन नरम व हल्का सुनहरा होने तक लगभग 5 मिनट भूनें। टमाटर प्यूरी और मसाले डालकर 3 मिनट पकाएँ। छाने बीन्स डालें और 8 मिनट पकाएँ, गाढ़ेपन के लिए कुछ को पैन पर दबाकर मसलें। नमक डालें और परोसें।',
      tr:'Doğranmış soğan ve sarımsağı yağda yumuşayıp hafif kızarana kadar yaklaşık 5 dakika kavurun. Domates püresi ve baharatı ekleyip 3 dakika pişirin. Süzülmüş fasulyeyi ekleyip 8 dakika pişirin; koyulaşması için birkaçını tava kenarında ezin. Tuzla tatlandırıp servis edin.',
      it:'Rosola cipolla e aglio tritati nell’olio finché sono morbidi e dorati, circa 5 minuti. Unisci la passata e le spezie e cuoci 3 minuti. Aggiungi i fagioli scolati e fai sobbollire 8 minuti, schiacciandone alcuni sul fondo per addensare. Regola di sale e servi.',
      ko:'기름에 다진 양파와 마늘을 부드럽고 살짝 노릇해질 때까지 약 5분 볶는다. 토마토 퓌레와 향신료를 넣고 3분 볶는다. 물 뺀 콩을 넣고 8분 끓이며, 일부를 팬에 눌러 으깨 걸쭉하게 만든다. 소금으로 간해 낸다.' } },

  { id:'budget_006', name:NAMES.chickpea, o:O.ME, servings:2, prep:5, cook:15, costRon:4, nut:{cal:380,prot:16,carb:48,fat:12,fib:13}, tags:['budget','vegan','quick'],
    ing:[ {q:400,u:'g',n:I.chickpeas}, {q:1,n:I.onion}, {q:2,u:'tbsp',n:I.oil}, {q:1,u:'tsp',n:I.spices}, {q:2,u:'cloves',n:I.garlic}, {q:150,u:'g',n:I.passata}, {n:I.salt} ],
    steps:{
      ro:'Călește ceapa și usturoiul tocate în ulei 4 minute. Adaugă condimentele și amestecă 30 de secunde, apoi toarnă roșiile pasate și gătește 3 minute. Pune năutul scurs, fierbe 8 minute și potrivește de sare. Servește cald.',
      en:'Soften the chopped onion and garlic in the oil for 4 minutes. Add the spices and stir for 30 seconds, then pour in the tomato passata and cook for 3 minutes. Tip in the drained chickpeas, simmer for 8 minutes, and season with salt. Serve warm.',
      es:'Sofríe la cebolla y el ajo picados en el aceite 4 minutos. Añade las especias y remueve 30 segundos, luego vierte el tomate triturado y cocina 3 minutos. Incorpora los garbanzos escurridos, cocina 8 minutos y sazona con sal. Sirve caliente.',
      fr:'Faites revenir l’oignon et l’ail hachés dans l’huile 4 minutes. Ajoutez les épices et remuez 30 secondes, puis versez les tomates passées et faites cuire 3 minutes. Ajoutez les pois chiches égouttés, laissez mijoter 8 minutes et salez. Servez chaud.',
      de:'Zwiebel und Knoblauch gehackt im Öl 4 Minuten anschwitzen. Die Gewürze zugeben und 30 Sekunden rühren, dann die passierten Tomaten angießen und 3 Minuten kochen. Die abgetropften Kichererbsen zugeben, 8 Minuten köcheln und mit Salz abschmecken. Warm servieren.',
      pt:'Refogue a cebola e o alho picados no óleo 4 minutos. Junte as especiarias e mexa 30 segundos, depois adicione o tomate passata e cozinhe 3 minutos. Junte o grão-de-bico escorrido, cozinhe 8 minutos e tempere com sal. Sirva quente.',
      ru:'Обжарьте нарезанные лук и чеснок в масле 4 минуты. Добавьте специи и помешивайте 30 секунд, затем влейте протёртые томаты и готовьте 3 минуты. Добавьте нут без жидкости, тушите 8 минут и посолите. Подавайте тёплым.',
      ar:'شوّح البصل والثوم المفروم في الزيت 4 دقائق. أضف البهارات وقلّب 30 ثانية، ثم أضف الطماطم المهروسة واطهها 3 دقائق. أضف الحمص المصفّى واطهه 8 دقائق وتبّل بالملح. قدّمه دافئاً.',
      zh:'锅中热油，下洋葱末和蒜末炒4分钟。加入香料翻炒30秒，再倒入番茄泥炒3分钟。放入沥干的鹰嘴豆煮8分钟，加盐调味。趁温热食用。',
      ja:'油でみじん切りの玉ねぎとにんにくを4分炒める。スパイスを加えて30秒炒め、トマトピューレを注いで3分煮る。汁気を切ったひよこ豆を加えて8分煮込み、塩で味を調える。温かいうちに供する。',
      hi:'तेल में कटा प्याज़ और लहसुन 4 मिनट भूनें। मसाले डालकर 30 सेकंड चलाएँ, फिर टमाटर प्यूरी डालकर 3 मिनट पकाएँ। छाने चने डालें, 8 मिनट पकाएँ और नमक डालें। गरम परोसें।',
      tr:'Doğranmış soğan ve sarımsağı yağda 4 dakika kavurun. Baharatı ekleyip 30 saniye karıştırın, ardından domates püresini dökün ve 3 dakika pişirin. Süzülmüş nohutu ekleyin, 8 dakika pişirin ve tuzla tatlandırın. Ilık servis edin.',
      it:'Fai appassire cipolla e aglio tritati nell’olio per 4 minuti. Aggiungi le spezie e mescola 30 secondi, poi versa la passata e cuoci 3 minuti. Unisci i ceci scolati, fai sobbollire 8 minuti e regola di sale. Servi caldo.',
      ko:'기름에 다진 양파와 마늘을 4분간 볶는다. 향신료를 넣고 30초 볶은 뒤 토마토 퓌레를 붓고 3분 끓인다. 물 뺀 병아리콩을 넣어 8분 끓이고 소금으로 간한다. 따뜻하게 낸다.' } },

  { id:'budget_007', name:NAMES.omelet, o:O.FR, servings:2, prep:5, cook:8, costRon:4, nut:{cal:300,prot:20,carb:5,fat:22,fib:1}, tags:['budget','vegetarian','high-protein','quick'],
    ing:[ {q:4,n:I.eggs}, {q:1,u:'tbsp',n:I.oil}, {q:1,n:I.onion}, {q:1,u:'clove',n:I.garlic}, {n:I.salt} ],
    steps:{
      ro:'Bate ouăle cu un praf de sare. Călește ceapa și usturoiul tocate mărunt în ulei la foc mediu 2 minute. Toarnă ouăle, rotește tigaia și lasă marginile să se prindă. Împăturește omleta și servește pe farfurie.',
      en:'Beat the eggs with a pinch of salt. Soften the finely chopped onion and garlic in the oil over medium heat for 2 minutes. Pour in the eggs, swirl the pan, and cook until the edges set. Fold the omelet over and slide it onto a plate.',
      es:'Bate los huevos con una pizca de sal. Sofríe la cebolla y el ajo bien picados en el aceite a fuego medio 2 minutos. Vierte los huevos, gira la sartén y cocina hasta que los bordes cuajen. Dobla la tortilla y sírvela en un plato.',
      fr:'Battez les œufs avec une pincée de sel. Faites revenir l’oignon et l’ail finement hachés dans l’huile à feu moyen 2 minutes. Versez les œufs, faites tourner la poêle et laissez prendre les bords. Pliez l’omelette et faites-la glisser dans une assiette.',
      de:'Die Eier mit einer Prise Salz verquirlen. Zwiebel und Knoblauch fein gehackt im Öl bei mittlerer Hitze 2 Minuten anschwitzen. Die Eier angießen, die Pfanne schwenken und braten, bis die Ränder stocken. Das Omelett zusammenklappen und auf einen Teller gleiten lassen.',
      pt:'Bata os ovos com uma pitada de sal. Refogue a cebola e o alho bem picados no óleo em lume médio 2 minutos. Deite os ovos, rode a frigideira e coza até as bordas presarem. Dobre a omelete e deslize-a para um prato.',
      ru:'Взбейте яйца со щепоткой соли. Обжарьте мелко нарезанные лук и чеснок в масле на среднем огне 2 минуты. Влейте яйца, покрутите сковороду и жарьте, пока края не схватятся. Сложите омлет и переложите на тарелку.',
      ar:'اخفق البيض مع رشة ملح. شوّح البصل والثوم المفروم ناعماً في الزيت على نار متوسطة دقيقتين. اسكب البيض ودوّر المقلاة واطهه حتى تتماسك الأطراف. اطوِ العجة وأخرجها إلى طبق.',
      zh:'鸡蛋加少许盐打散。中火用油将切碎的洋葱和蒜炒2分钟。倒入蛋液，转动锅子，煎至边缘凝固。将蛋卷对折，滑入盘中。',
      ja:'卵に塩ひとつまみを加えて溶く。みじん切りの玉ねぎとにんにくを油で中火で2分炒める。卵液を流し入れ、鍋を回して縁が固まるまで焼く。オムレツを折りたたみ、皿に滑らせる。',
      hi:'अंडों को चुटकी नमक के साथ फेंटें। बारीक कटा प्याज़ और लहसुन तेल में मध्यम आँच पर 2 मिनट भूनें। अंडे डालें, पैन घुमाएँ और किनारे जमने तक पकाएँ। ऑमलेट को मोड़ें और प्लेट पर निकालें।',
      tr:'Yumurtaları bir tutam tuzla çırpın. İnce doğranmış soğan ve sarımsağı orta ateşte yağda 2 dakika kavurun. Yumurtaları dökün, tavayı çevirin ve kenarları tutana kadar pişirin. Omleti katlayıp tabağa alın.',
      it:'Sbatti le uova con un pizzico di sale. Fai appassire cipolla e aglio tritati fini nell’olio a fuoco medio per 2 minuti. Versa le uova, ruota la padella e cuoci finché i bordi si rapprendono. Piega l’omelette e falla scivolare nel piatto.',
      ko:'계란에 소금 한 꼬집을 넣어 푼다. 곱게 다진 양파와 마늘을 중불에서 기름에 2분 볶는다. 계란물을 붓고 팬을 돌려 가장자리가 익을 때까지 굽는다. 오믈렛을 반으로 접어 접시에 담는다.' } },

  { id:'budget_008', name:NAMES.cabbage, o:O.EE, servings:2, prep:10, cook:25, costRon:3, nut:{cal:220,prot:5,carb:25,fat:12,fib:8}, tags:['budget','vegan','healthy'],
    ing:[ {q:500,u:'g',n:I.cabbage}, {q:1,n:I.onion}, {q:3,u:'tbsp',n:I.oil}, {q:150,u:'g',n:I.passata}, {q:2,u:'cloves',n:I.garlic}, {q:1,u:'tsp',n:I.spices}, {n:I.salt} ],
    steps:{
      ro:'Taie varza fâșii și ceapa felii. Călește ceapa și usturoiul în ulei 4 minute, apoi adaugă varza și gătește, amestecând, 8 minute, până se înmoaie. Adaugă roșiile pasate și condimentele și fierbe 10 minute până e fragedă. Potrivește de sare și servește.',
      en:'Shred the cabbage and slice the onion. Soften the onion and garlic in the oil for 4 minutes, then add the cabbage and cook, stirring, for 8 minutes until it wilts. Stir in the tomato passata and spices and simmer for 10 minutes until tender. Season with salt and serve.',
      es:'Corta el repollo en tiras y la cebolla en rodajas. Sofríe la cebolla y el ajo en el aceite 4 minutos, luego añade el repollo y cocina, removiendo, 8 minutos hasta que se ablande. Agrega el tomate triturado y las especias y cocina 10 minutos hasta que esté tierno. Sazona con sal y sirve.',
      fr:'Émincez le chou et l’oignon. Faites revenir l’oignon et l’ail dans l’huile 4 minutes, puis ajoutez le chou et faites cuire en remuant 8 minutes jusqu’à ce qu’il tombe. Ajoutez les tomates passées et les épices et laissez mijoter 10 minutes jusqu’à tendreté. Salez et servez.',
      de:'Den Kohl in Streifen und die Zwiebel in Scheiben schneiden. Zwiebel und Knoblauch im Öl 4 Minuten anschwitzen, dann den Kohl zugeben und unter Rühren 8 Minuten braten, bis er zusammenfällt. Passierte Tomaten und Gewürze einrühren und 10 Minuten köcheln, bis alles weich ist. Mit Salz abschmecken und servieren.',
      pt:'Corte o repolho em tiras e a cebola em rodelas. Refogue a cebola e o alho no óleo 4 minutos, depois junte o repolho e cozinhe, mexendo, 8 minutos até murchar. Junte o tomate passata e as especiarias e cozinhe 10 minutos até ficar macio. Tempere com sal e sirva.',
      ru:'Нашинкуйте капусту и нарежьте лук. Обжарьте лук и чеснок в масле 4 минуты, затем добавьте капусту и готовьте, помешивая, 8 минут, пока не осядет. Вмешайте протёртые томаты и специи, тушите 10 минут до мягкости. Посолите и подавайте.',
      ar:'قطّع الملفوف شرائح والبصل شرائح. شوّح البصل والثوم في الزيت 4 دقائق، ثم أضف الملفوف وقلّبه 8 دقائق حتى يذبل. أضف الطماطم المهروسة والبهارات واطهها 10 دقائق حتى تنضج. تبّل بالملح وقدّم.',
      zh:'卷心菜切丝，洋葱切片。用油将洋葱和蒜炒4分钟，加入卷心菜翻炒8分钟至变软。加入番茄泥和香料，小火煮10分钟至软烂。加盐调味即可上桌。',
      ja:'キャベツは千切り、玉ねぎは薄切りにする。油で玉ねぎとにんにくを4分炒め、キャベツを加えてしんなりするまで8分炒める。トマトピューレとスパイスを加え、柔らかくなるまで10分煮る。塩で味を調えて供する。',
      hi:'पत्ता गोभी को कद्दूकस/बारीक काटें और प्याज़ को स्लाइस करें। तेल में प्याज़ और लहसुन 4 मिनट भूनें, फिर गोभी डालकर 8 मिनट चलाते हुए नरम होने तक पकाएँ। टमाटर प्यूरी और मसाले डालकर 10 मिनट पकाएँ। नमक डालें और परोसें।',
      tr:'Lahanayı ince, soğanı halka doğrayın. Soğan ve sarımsağı yağda 4 dakika kavurun, sonra lahanayı ekleyip karıştırarak 8 dakika sölpüyene kadar pişirin. Domates püresi ve baharatı ekleyip 10 dakika yumuşayana dek pişirin. Tuzla tatlandırıp servis edin.',
      it:'Affetta il cavolo e la cipolla. Fai appassire cipolla e aglio nell’olio per 4 minuti, poi aggiungi il cavolo e cuoci, mescolando, per 8 minuti finché appassisce. Unisci la passata e le spezie e fai sobbollire 10 minuti finché è tenero. Regola di sale e servi.',
      ko:'양배추는 채 썰고 양파는 슬라이스한다. 기름에 양파와 마늘을 4분 볶은 뒤 양배추를 넣고 숨이 죽을 때까지 8분간 저으며 볶는다. 토마토 퓌레와 향신료를 넣고 부드러워질 때까지 10분 끓인다. 소금으로 간해 낸다.' } },

  { id:'budget_009', name:NAMES.ricePud, o:O.INT, servings:2, prep:5, cook:30, costRon:4, nut:{cal:400,prot:12,carb:68,fat:9,fib:1}, tags:['budget','vegetarian','family'],
    ing:[ {q:120,u:'g',n:I.rice}, {q:700,u:'ml',n:I.milk}, {q:60,u:'g',n:I.sugar}, {n:I.salt} ],
    steps:{
      ro:'Clătește orezul și pune-l într-o oală cu laptele și un praf de sare. Adu la un clocot blând și fierbe la foc mic, amestecând des, circa 25 de minute, până devine cremos. Adaugă zahărul și mai fierbe 3 minute. Servește cald sau rece.',
      en:'Rinse the rice and add it to a pot with the milk and a pinch of salt. Bring to a gentle simmer and cook on low, stirring often, for about 25 minutes until creamy. Stir in the sugar and cook for 3 more minutes. Serve warm or chilled.',
      es:'Enjuaga el arroz y ponlo en una olla con la leche y una pizca de sal. Lleva a fuego suave y cocina a fuego bajo, removiendo a menudo, unos 25 minutos hasta que esté cremoso. Añade el azúcar y cocina 3 minutos más. Sirve caliente o frío.',
      fr:'Rincez le riz et mettez-le dans une casserole avec le lait et une pincée de sel. Portez à frémissement et laissez cuire à feu doux, en remuant souvent, environ 25 minutes jusqu’à consistance crémeuse. Ajoutez le sucre et prolongez la cuisson 3 minutes. Servez chaud ou froid.',
      de:'Den Reis abspülen und mit der Milch und einer Prise Salz in einen Topf geben. Sanft zum Köcheln bringen und bei niedriger Hitze unter häufigem Rühren etwa 25 Minuten cremig kochen. Den Zucker einrühren und weitere 3 Minuten kochen. Warm oder kalt servieren.',
      pt:'Lave o arroz e coloque-o numa panela com o leite e uma pitada de sal. Leve a lume brando e cozinhe em lume baixo, mexendo com frequência, cerca de 25 minutos até ficar cremoso. Junte o açúcar e cozinhe mais 3 minutos. Sirva quente ou frio.',
      ru:'Промойте рис и положите в кастрюлю с молоком и щепоткой соли. Доведите до лёгкого кипения и варите на слабом огне, часто помешивая, около 25 минут до кремовой консистенции. Вмешайте сахар и варите ещё 3 минуты. Подавайте тёплым или холодным.',
      ar:'اغسل الأرز وضعه في قدر مع الحليب ورشة ملح. اتركه يغلي بلطف واطهه على نار هادئة مع التقليب المتكرر نحو 25 دقيقة حتى يصبح كريمياً. أضف السكر واطهه 3 دقائق إضافية. قدّمه دافئاً أو بارداً.',
      zh:'米洗净后放入锅中，加牛奶和少许盐。小火慢煮并常搅拌，约25分钟至奶香浓稠。加入糖再煮3分钟。温热或冷藏后食用皆可。',
      ja:'米を洗い、鍋に牛乳と塩ひとつまみとともに入れる。弱火で静かに煮立て、よくかき混ぜながら約25分クリーミーになるまで煮る。砂糖を加えてさらに3分煮る。温かくても冷やしても供せる。',
      hi:'चावल धोकर एक बर्तन में दूध और चुटकी नमक के साथ डालें। हल्की आँच पर उबाल लाएँ और बार-बार चलाते हुए लगभग 25 मिनट क्रीमी होने तक पकाएँ। चीनी मिलाएँ और 3 मिनट और पकाएँ। गरम या ठंडा परोसें।',
      tr:'Pirinci yıkayıp süt ve bir tutam tuzla tencereye alın. Hafifçe kaynatın ve kısık ateşte sık karıştırarak yaklaşık 25 dakika kremamsı olana dek pişirin. Şekeri ekleyip 3 dakika daha pişirin. Sıcak ya da soğuk servis edin.',
      it:'Sciacqua il riso e mettilo in una pentola con il latte e un pizzico di sale. Porta a un leggero sobbollire e cuoci a fuoco basso, mescolando spesso, per circa 25 minuti finché è cremoso. Unisci lo zucchero e cuoci altri 3 minuti. Servi caldo o freddo.',
      ko:'쌀을 헹궈 냄비에 우유, 소금 한 꼬집과 함께 넣는다. 약하게 끓기 시작하면 약불에서 자주 저으며 약 25분간 크리미해질 때까지 끓인다. 설탕을 넣고 3분 더 끓인다. 따뜻하게 또는 차갑게 낸다.' } },

  { id:'budget_010', name:NAMES.polenta, o:O.RO, servings:2, prep:2, cook:25, costRon:2, nut:{cal:340,prot:7,carb:68,fat:3,fib:6}, tags:['budget','vegan','one-pot'],
    ing:[ {q:150,u:'g',n:I.cornmeal}, {q:750,u:'ml',n:I.water}, {n:I.salt} ],
    steps:{
      ro:'Adu apa cu sare la fiert. Toarnă mălaiul în ploaie, amestecând continuu ca să nu se formeze cocoloașe. Fierbe la foc mic, amestecând, circa 20 de minute, până se îngroașă și devine netedă. Servește fierbinte, ca garnitură.',
      en:'Bring the salted water to a boil. Pour in the cornmeal in a steady stream, whisking constantly to avoid lumps. Cook on low, stirring, for about 20 minutes until thick and smooth. Serve hot as a side.',
      es:'Lleva el agua con sal a ebullición. Vierte la harina de maíz en un hilo constante, batiendo sin parar para evitar grumos. Cocina a fuego bajo, removiendo, unos 20 minutos hasta que espese y quede suave. Sirve caliente como guarnición.',
      fr:'Portez l’eau salée à ébullition. Versez la semoule de maïs en pluie, en fouettant sans cesse pour éviter les grumeaux. Faites cuire à feu doux, en remuant, environ 20 minutes jusqu’à ce que ce soit épais et lisse. Servez chaud en accompagnement.',
      de:'Das Salzwasser zum Kochen bringen. Den Maisgrieß in einem gleichmäßigen Strahl einrieseln lassen und dabei ständig rühren, um Klümpchen zu vermeiden. Bei niedriger Hitze unter Rühren etwa 20 Minuten kochen, bis es dick und glatt ist. Heiß als Beilage servieren.',
      pt:'Leve a água com sal a ferver. Deite o fubá em fio, mexendo sem parar para evitar grumos. Cozinhe em lume baixo, mexendo, cerca de 20 minutos até engrossar e ficar liso. Sirva quente como acompanhamento.',
      ru:'Доведите подсолённую воду до кипения. Всыпьте кукурузную крупу тонкой струйкой, постоянно помешивая, чтобы не было комков. Варите на слабом огне, помешивая, около 20 минут до густоты и гладкости. Подавайте горячей как гарнир.',
      ar:'اغلِ الماء المملّح. أضف دقيق الذرة تدريجياً مع التحريك المستمر لتجنّب التكتل. اطهه على نار هادئة مع التحريك نحو 20 دقيقة حتى يثخن ويصبح ناعماً. قدّمه ساخناً كطبق جانبي.',
      zh:'将盐水烧开。玉米粉呈细流状缓缓倒入，不停搅拌以免结块。小火边煮边搅约20分钟，至浓稠顺滑。趁热作为配菜食用。',
      ja:'塩水を沸騰させる。コーンミールを少しずつ細く流し入れ、だまにならないよう絶えずかき混ぜる。弱火でかき混ぜながら約20分、とろりと滑らかになるまで煮る。付け合わせとして熱いうちに供する。',
      hi:'नमकीन पानी उबालें। मक्के का आटा धीरे-धीरे धार बनाकर डालें, गुठलियाँ न बनें इसलिए लगातार फेंटें। धीमी आँच पर चलाते हुए लगभग 20 मिनट गाढ़ा और चिकना होने तक पकाएँ। गरमागरम साइड डिश के रूप में परोसें।',
      tr:'Tuzlu suyu kaynatın. Mısır ununu ince bir şekilde dökerek topaklanmaması için sürekli çırpın. Kısık ateşte karıştırarak yaklaşık 20 dakika koyulaşıp pürüzsüz olana dek pişirin. Garnitür olarak sıcak servis edin.',
      it:'Porta a bollore l’acqua salata. Versa la farina di mais a pioggia, mescolando di continuo per evitare grumi. Cuoci a fuoco basso, mescolando, per circa 20 minuti finché è densa e liscia. Servi calda come contorno.',
      ko:'소금물을 끓인다. 옥수수가루를 가늘게 흘려 넣으며 덩어리지지 않게 계속 저어준다. 약불에서 저으며 약 20분간 되직하고 매끈해질 때까지 끓인다. 곁들임으로 뜨겁게 낸다.' } },
];

const recipes = SPECS.map(mk);

export { recipes };
export default recipes;
export const BUDGET_RECIPES = recipes;

if (typeof window !== 'undefined') {
  window.BUDGET_RECIPES = recipes;
}
