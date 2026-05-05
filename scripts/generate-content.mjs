/**
 * generate-content.mjs — SEO static page generator
 *
 * Generates weekly meal-plan pages + recipe pages in all 14 app languages.
 * Weekly plans: all 14 languages (ro, en, es, fr, de, pt, ru, ar, zh, ja, hi, tr, it, ko)
 * Recipe pages: ro + en only (detailed ingredient/method pages)
 *
 * Run: node scripts/generate-content.mjs
 */

import { recipes }                    from '../public/js/recipes.js';
import { recipes as budgetRecipes }   from '../public/js/recipes-budget.js';
import { i18n }                       from '../public/js/i18n.js';
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');
const PUBLIC    = path.join(ROOT, 'public');

/* ── helpers ──────────────────────────────────────────────────── */
const mkdir  = p => fs.mkdirSync(p, { recursive: true });
const write  = (p, html) => { mkdir(path.dirname(p)); fs.writeFileSync(p, html, 'utf8'); };
const slug   = name => name.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g,'');
const esc    = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const capFirst = s => s ? s[0].toUpperCase() + s.slice(1) : '';

/* ════════════════════════════════════════════════════════════════
   PLANS — 8 themed weekly plans with translations in 14 languages
   ════════════════════════════════════════════════════════════════ */
const PLANS = [
  {
    id: 'mediteranean', idEn: 'mediterranean', emoji: '🫒',
    costRON: '200–260', costEUR: '40–55',
    theme: {
      ro:'Mediteranean', en:'Mediterranean', es:'Mediterráneo', fr:'Méditerranéen',
      de:'Mediterran', pt:'Mediterrâneo', ru:'Средиземноморский', ar:'البحر المتوسط',
      zh:'地中海风味', ja:'地中海料理', hi:'भूमध्यसागरीय', tr:'Akdeniz', it:'Mediterraneo', ko:'지중해'
    },
    desc: {
      ro:'O săptămână de mese inspirate din bucătăriile Italiei, Greciei, Franței, Spaniei și Marocului. Ingrediente proaspete, ulei de măsline și savori autentice.',
      en:'A week inspired by Italian, Greek, French, Spanish and Moroccan cuisines. Fresh ingredients, olive oil and authentic Mediterranean flavours.',
      es:'Una semana inspirada en las cocinas italiana, griega, francesa, española y marroquí. Ingredientes frescos, aceite de oliva y sabores auténticos.',
      fr:'Une semaine inspirée des cuisines italienne, grecque, française, espagnole et marocaine. Ingrédients frais, huile d\'olive et saveurs authentiques.',
      de:'Eine Woche inspiriert von italienischer, griechischer, französischer, spanischer und marokkanischer Küche. Frische Zutaten und Olivenöl.',
      pt:'Uma semana inspirada nas cozinhas italiana, grega, francesa, espanhola e marroquina. Ingredientes frescos e azeite de oliva.',
      ru:'Неделя блюд итальянской, греческой, французской, испанской и марокканской кухни. Свежие продукты и оливковое масло.',
      ar:'أسبوع مستوحى من المطابخ الإيطالية واليونانية والفرنسية والإسبانية والمغربية. مكونات طازجة وزيت زيتون.',
      zh:'一周意大利、希腊、法国、西班牙和摩洛哥风味美食。新鲜食材，橄榄油，地中海正宗风味。',
      ja:'イタリア、ギリシャ、フランス、スペイン、モロッコの料理で彩る1週間。新鮮な食材とオリーブオイル。',
      hi:'इतालवी, ग्रीक, फ्रेंच, स्पेनिश और मोरक्कन व्यंजनों से प्रेरित एक सप्ताह। ताज़ी सामग्री और जैतून का तेल।',
      tr:'İtalyan, Yunan, Fransız, İspanyol ve Fas mutfaklarından ilham alan bir hafta. Taze malzemeler ve zeytinyağı.',
      it:'Una settimana ispirata alle cucine italiana, greca, francese, spagnola e marocchina. Ingredienti freschi e olio d\'oliva.',
      ko:'이탈리아, 그리스, 프랑스, 스페인, 모로코 요리에서 영감을 받은 한 주. 신선한 재료와 올리브 오일.'
    },
    lunches: ['Spaghete Carbonara','Gazpacho','Quiche Lorraine','Risotto','Paella','Pasta e fagioli','Pasta alla Norma'],
    dinners: ['Musaca grecească','Ratatouille','Souvlaki','Tajine','Boeuf Bourguignon','Spanakopita','Harira'],
  },
  {
    id: 'asia', idEn: 'asian-fusion', emoji: '🍜',
    costRON: '240–300', costEUR: '50–65',
    theme: {
      ro:'Asia – Tur Culinar', en:'Asian Food Tour', es:'Asia – Tour Culinario', fr:'Asie – Tour Gastronomique',
      de:'Asien – Kulinarische Tour', pt:'Ásia – Tour Culinário', ru:'Азия – Кулинарный Тур', ar:'آسيا – جولة طهوية',
      zh:'亚洲美食之旅', ja:'アジア料理ツアー', hi:'एशिया – पाककला यात्रा', tr:'Asya – Mutfak Turu', it:'Asia – Tour Culinario', ko:'아시아 푸드 투어'
    },
    desc: {
      ro:'Japonia, Korea, Vietnam, Thailanda, India și Indonezia pe farfuria ta. Șapte zile de arome, mirodenii și tehnici culinare asiatice.',
      en:'Japan, Korea, Vietnam, Thailand, India and Indonesia on your plate. Seven days of Asian flavours, spices and cooking techniques.',
      es:'Japón, Corea, Vietnam, Tailandia, India e Indonesia en tu plato. Siete días de sabores asiáticos.',
      fr:'Japon, Corée, Vietnam, Thaïlande, Inde et Indonésie dans votre assiette. Sept jours de saveurs asiatiques.',
      de:'Japan, Korea, Vietnam, Thailand, Indien und Indonesien auf dem Teller. Sieben Tage asiatische Küche.',
      pt:'Japão, Coreia, Vietnã, Tailândia, Índia e Indonésia no seu prato. Sete dias de sabores asiáticos.',
      ru:'Япония, Корея, Вьетнам, Таиланд, Индия и Индонезия на тарелке. Семь дней азиатской кухни.',
      ar:'اليابان وكوريا وفيتنام وتايلاند والهند وإندونيسيا على طبقك. سبعة أيام من النكهات الآسيوية.',
      zh:'日本、韩国、越南、泰国、印度和印度尼西亚美食轮番登场。七天亚洲风味大赏。',
      ja:'日本、韓国、ベトナム、タイ、インド、インドネシアの料理を巡る7日間。',
      hi:'जापान, कोरिया, वियतनाम, थाईलैंड, भारत और इंडोनेशिया के व्यंजनों का सप्ताह।',
      tr:'Japonya, Kore, Vietnam, Tayland, Hindistan ve Endonezya\'nın tatlarıyla geçen yedi gün.',
      it:'Giappone, Corea, Vietnam, Tailandia, India e Indonesia nel tuo piatto. Sette giorni di sapori asiatici.',
      ko:'일본, 한국, 베트남, 태국, 인도, 인도네시아 요리를 맛보는 7일간의 여행.'
    },
    lunches: ['Pho','Bibimbap','Tom Yum','Pad Thai','Dhal','Kimbap','Okonomiyaki'],
    dinners: ['Sushi','Curry de pui','Ramen','Pui Gong Bao','Nasi Goreng','Rendang','Tom Kha Gai'],
  },
  {
    id: 'buget', idEn: 'budget', emoji: '💰',
    costRON: '100–150', costEUR: '20–30',
    theme: {
      ro:'Meniu de Buget – sub 150 RON', en:'Budget Week – under €30', es:'Semana Económica – menos de €30',
      fr:'Semaine Économique – moins de €30', de:'Günstige Woche – unter €30', pt:'Semana Econômica – menos de €30',
      ru:'Бюджетная Неделя – до €30', ar:'أسبوع اقتصادي – أقل من €30',
      zh:'省钱一周 – €30以内', ja:'節約ウィーク – €30以内', hi:'बजट सप्ताह – €30 से कम',
      tr:'Ekonomik Hafta – €30\'dan az', it:'Settimana Economica – meno di €30', ko:'절약 한 주 – €30 미만'
    },
    desc: {
      ro:'Mese sănătoase și gustoase pentru 2 persoane cu un buget de maxim 150 RON pe săptămână. Ingrediente simple, preparare rapidă.',
      en:'Healthy and tasty meals for 2 people on a budget of under €30 per week. Simple ingredients, quick preparation.',
      es:'Comidas saludables y sabrosas para 2 personas con un presupuesto de menos de €30 por semana.',
      fr:'Des repas sains et savoureux pour 2 personnes avec un budget de moins de €30 par semaine.',
      de:'Gesunde und leckere Mahlzeiten für 2 Personen mit einem Budget von unter €30 pro Woche.',
      pt:'Refeições saudáveis e saborosas para 2 pessoas com orçamento de menos de €30 por semana.',
      ru:'Здоровые и вкусные блюда для 2 человек с бюджетом до €30 в неделю.',
      ar:'وجبات صحية ولذيذة لشخصين بميزانية أقل من €30 في الأسبوع.',
      zh:'两人份健康美味的一周饮食，预算€30以内，食材简单，制作快捷。',
      ja:'2人分、週€30以内の予算で健康的で美味しい料理を楽しむ1週間。',
      hi:'2 लोगों के लिए €30 से कम बजट में स्वस्थ और स्वादिष्ट भोजन।',
      tr:'2 kişi için haftalık €30\'dan az bütçeyle sağlıklı ve lezzetli yemekler.',
      it:'Pasti sani e gustosi per 2 persone con un budget inferiore a €30 a settimana.',
      ko:'주 €30 미만 예산으로 2인 건강하고 맛있는 식사를 즐기는 한 주.'
    },
    isBudget: true,
    lunches: budgetRecipes.slice(0,7).map(r=>r.name?.ro||r.name?.en),
    dinners: budgetRecipes.slice(7,14).map(r=>r.name?.ro||r.name?.en),
  },
  {
    id: 'est-european', idEn: 'eastern-european', emoji: '🥟',
    costRON: '160–210', costEUR: '33–45',
    theme: {
      ro:'Est-European – Gusturi de Acasă', en:'Eastern European Comfort Food', es:'Europa del Este – Sabores del Hogar',
      fr:'Europe de l\'Est – Saveurs du Foyer', de:'Osteuropa – Heimische Küche', pt:'Europa Oriental – Sabores Caseiros',
      ru:'Восточная Европа – Домашняя Кухня', ar:'أوروبا الشرقية – مذاق المنزل',
      zh:'东欧家常美食', ja:'東欧のホームフード', hi:'पूर्वी यूरोप – घर के स्वाद',
      tr:'Doğu Avrupa – Ev Yemekleri', it:'Europa dell\'Est – Sapori di Casa', ko:'동유럽 가정 요리'
    },
    desc: {
      ro:'Ciorbele, tocanele și preparatele tradiționale din România, Georgia, Ungaria și Polonia. Bucătărie de suflet, autentică și hrănitoare.',
      en:'Stews, soups and traditional dishes from Romania, Georgia, Hungary and Poland. Soul food, authentic and nourishing.',
      es:'Guisos, sopas y platos tradicionales de Rumanía, Georgia, Hungría y Polonia. Comida reconfortante y nutritiva.',
      fr:'Ragoûts, soupes et plats traditionnels de Roumanie, Géorgie, Hongrie et Pologne. Cuisine réconfortante et nourrissante.',
      de:'Eintöpfe, Suppen und traditionelle Gerichte aus Rumänien, Georgien, Ungarn und Polen. Herzhafte Hausmannskost.',
      pt:'Guisados, sopas e pratos tradicionais da Romênia, Geórgia, Hungria e Polônia. Culinária reconfortante.',
      ru:'Супы, рагу и традиционные блюда из Румынии, Грузии, Венгрии и Польши. Домашняя кухня.',
      ar:'يخنات وشوربات وأطباق تقليدية من رومانيا وجورجيا والمجر وبولندا.',
      zh:'来自罗马尼亚、格鲁吉亚、匈牙利和波兰的炖菜、汤品和传统菜肴。',
      ja:'ルーマニア、グルジア、ハンガリー、ポーランドの伝統料理。心温まるホームフード。',
      hi:'रोमानिया, जॉर्जिया, हंगरी और पोलैंड के पारंपरिक व्यंजन।',
      tr:'Romanya, Gürcistan, Macaristan ve Polonya\'nın geleneksel yemekleri.',
      it:'Stufati, zuppe e piatti tradizionali di Romania, Georgia, Ungheria e Polonia.',
      ko:'루마니아, 조지아, 헝가리, 폴란드의 전통 요리. 따뜻한 가정식.'
    },
    lunches: ['Ciorbă de burtă','Bors','Fasole cu cârnați','Gulaș','Pierogi','Lobio','Chakhokhbili'],
    dinners: ['Pui Kiev','Khinkali','Chicken Paprikash','Kotlet schabowy','Zeamă','Okroshka','Solyanka'],
  },
  {
    id: 'tur-mondial', idEn: 'world-tour', emoji: '🌍',
    costRON: '190–250', costEUR: '40–53',
    theme: {
      ro:'Tur Mondial – 7 Țări în 7 Zile', en:'World Tour – 7 Countries in 7 Days',
      es:'Vuelta al Mundo – 7 Países en 7 Días', fr:'Tour du Monde – 7 Pays en 7 Jours',
      de:'Weltreise – 7 Länder in 7 Tagen', pt:'Volta ao Mundo – 7 Países em 7 Dias',
      ru:'Тур по Миру – 7 Стран за 7 Дней', ar:'جولة عالمية – 7 دول في 7 أيام',
      zh:'环球美食 – 7天7国', ja:'世界一周 – 7カ国7日間', hi:'विश्व भ्रमण – 7 देश 7 दिन',
      tr:'Dünya Turu – 7 Günde 7 Ülke', it:'Giro del Mondo – 7 Paesi in 7 Giorni', ko:'세계 일주 – 7일 7개국'
    },
    desc: {
      ro:'O masă pe zi din alt colț al lumii: SUA, Anglia, Germania, Jamaica, Nigeria, India și Israel. Diversitate culinară maximă.',
      en:'One meal a day from a different corner of the world: USA, UK, Germany, Jamaica, Nigeria, India and Israel.',
      es:'Una comida al día de un rincón diferente del mundo: EE.UU., Reino Unido, Alemania, Jamaica, Nigeria, India e Israel.',
      fr:'Un repas par jour d\'un coin différent du monde: USA, Angleterre, Allemagne, Jamaïque, Nigeria, Inde et Israël.',
      de:'Eine Mahlzeit täglich aus einem anderen Winkel der Welt: USA, England, Deutschland, Jamaika, Nigeria, Indien, Israel.',
      pt:'Uma refeição por dia de um canto diferente do mundo: EUA, Inglaterra, Alemanha, Jamaica, Nigéria, Índia e Israel.',
      ru:'Блюдо дня из разных уголков мира: США, Англия, Германия, Ямайка, Нигерия, Индия и Израиль.',
      ar:'وجبة يومية من زاوية مختلفة من العالم: الولايات المتحدة وإنجلترا وألمانيا وجامايكا ونيجيريا والهند وإسرائيل.',
      zh:'每天一道来自世界不同角落的美食：美国、英国、德国、牙买加、尼日利亚、印度和以色列。',
      ja:'毎日世界の別の地域の料理を: アメリカ、イギリス、ドイツ、ジャマイカ、ナイジェリア、インド、イスラエル。',
      hi:'हर दिन दुनिया के एक अलग कोने का भोजन: यूएसए, इंग्लैंड, जर्मनी, जमैका, नाइजीरिया, भारत और इजरायल।',
      tr:'Her gün dünyanın farklı bir köşesinden bir yemek: ABD, İngiltere, Almanya, Jamaika, Nijerya, Hindistan ve İsrail.',
      it:'Un pasto al giorno da un angolo diverso del mondo: USA, Inghilterra, Germania, Giamaica, Nigeria, India e Israele.',
      ko:'매일 세계 각지의 요리를 즐기는 일주일: 미국, 영국, 독일, 자메이카, 나이지리아, 인도, 이스라엘.'
    },
    lunches: ['Schnitzel','Tabbouleh','Hummus','Koshari','Shakshuka','Smørrebrød','Chakchouka'],
    dinners: ['Cheeseburger','Fish and Chips','Chifteluțe suedeze','Jerk Chicken','Jollof Rice','Biryani','Bobotie'],
  },
  {
    id: 'latin', idEn: 'latin-american', emoji: '🌶️',
    costRON: '200–260', costEUR: '42–55',
    theme: {
      ro:'America Latină – Picant & Colorat', en:'Latin America – Spicy & Vibrant',
      es:'América Latina – Picante y Colorido', fr:'Amérique Latine – Épicé et Vibrant',
      de:'Lateinamerika – Würzig & Bunt', pt:'América Latina – Picante & Colorido',
      ru:'Латинская Америка – Острое & Красочное', ar:'أمريكا اللاتينية – حار وملون',
      zh:'拉丁美洲 – 辛辣多彩', ja:'ラテンアメリカ – スパイシー＆カラフル',
      hi:'लैटिन अमेरिका – मसालेदार और रंगीन', tr:'Latin Amerika – Baharatlı ve Renkli',
      it:'America Latina – Piccante e Colorato', ko:'라틴 아메리카 – 매콤하고 화려한'
    },
    desc: {
      ro:'Mexic, Peru, Brazilia și Cuba pe farfuria ta. Fasole neagră, porumb, avocado, carne condimentată și culori vii.',
      en:'Mexico, Peru, Brazil and Cuba on your plate. Black beans, corn, avocado, spiced meats and vibrant colours.',
      es:'México, Perú, Brasil y Cuba en tu plato. Frijoles negros, maíz, aguacate y carnes especiadas.',
      fr:'Mexique, Pérou, Brésil et Cuba dans votre assiette. Haricots noirs, maïs, avocat et viandes épicées.',
      de:'Mexiko, Peru, Brasilien und Kuba auf dem Teller. Schwarze Bohnen, Mais, Avocado und gewürztes Fleisch.',
      pt:'México, Peru, Brasil e Cuba no seu prato. Feijão preto, milho, abacate e carnes temperadas.',
      ru:'Мексика, Перу, Бразилия и Куба на тарелке. Чёрные бобы, кукуруза, авокадо и пряное мясо.',
      ar:'المكسيك والبيرو والبرازيل وكوبا على طبقك. الفاصوليا السوداء والذرة والأفوكادو واللحم المتبل.',
      zh:'墨西哥、秘鲁、巴西和古巴美食齐聚一盘。黑豆、玉米、牛油果和香辣肉类。',
      ja:'メキシコ、ペルー、ブラジル、キューバの料理が一皿に。ブラックビーンズ、コーン、アボカド。',
      hi:'मेक्सिको, पेरू, ब्राज़ील और क्यूबा के व्यंजन। काली फलियाँ, मक्का, एवोकाडो।',
      tr:'Meksika, Peru, Brezilya ve Küba\'nın tatları. Siyah fasulye, mısır, avokado ve baharatlı etler.',
      it:'Messico, Perù, Brasile e Cuba nel tuo piatto. Fagioli neri, mais, avocado e carni speziate.',
      ko:'멕시코, 페루, 브라질, 쿠바 요리의 향연. 검은콩, 옥수수, 아보카도, 매콤한 고기.'
    },
    lunches: ['Tamale','Arroz Chaufa','Lomo Saltado','Picadillo','Pozole','Pupusa','Arepa'],
    dinners: ['Tacos','Feijoada','Chili con carne','Moqueca','Ropa Vieja','Bandeja Paisa','Chiles en nogada'],
  },
  {
    id: 'vegetarian', idEn: 'vegetarian', emoji: '🌱',
    costRON: '150–200', costEUR: '31–42',
    theme: {
      ro:'Vegetarian – Colorat & Sănătos', en:'Vegetarian – Colourful & Healthy',
      es:'Vegetariano – Colorido y Saludable', fr:'Végétarien – Coloré & Sain',
      de:'Vegetarisch – Bunt & Gesund', pt:'Vegetariano – Colorido e Saudável',
      ru:'Вегетарианский – Красочный и Полезный', ar:'نباتي – ملون وصحي',
      zh:'素食 – 多彩健康', ja:'ベジタリアン – カラフル＆ヘルシー',
      hi:'शाकाहारी – रंगीन और स्वस्थ', tr:'Vejetaryen – Renkli ve Sağlıklı',
      it:'Vegetariano – Colorato e Sano', ko:'채식 – 다채롭고 건강한'
    },
    desc: {
      ro:'O săptămână fără carne, bogată în proteine vegetale, legume proaspete și savori din toată lumea. Perfect pentru a reduce consumul de carne.',
      en:'A meat-free week rich in plant proteins, fresh vegetables and global flavours. Perfect for reducing meat consumption.',
      es:'Una semana sin carne, rica en proteínas vegetales y verduras frescas. Perfecta para reducir el consumo de carne.',
      fr:'Une semaine sans viande, riche en protéines végétales et légumes frais. Idéal pour réduire la consommation de viande.',
      de:'Eine fleischfreie Woche mit Pflanzeneiweiß, frischem Gemüse und weltweiten Aromen.',
      pt:'Uma semana sem carne, rica em proteínas vegetais e legumes frescos. Perfeita para reduzir o consumo de carne.',
      ru:'Неделя без мяса, богатая растительными белками и свежими овощами со всего мира.',
      ar:'أسبوع بدون لحوم، غني بالبروتينات النباتية والخضروات الطازجة.',
      zh:'无肉的一周，富含植物蛋白、新鲜蔬菜，汇聚世界各地的素食风味。',
      ja:'肉なしの1週間。植物性タンパク質と新鮮な野菜、世界各地の風味。',
      hi:'मांस रहित सप्ताह, पौधे-आधारित प्रोटीन और ताज़ी सब्जियों से भरपूर।',
      tr:'Etsiz bir hafta, bitkisel proteinler ve taze sebzelerle dolu.',
      it:'Una settimana senza carne, ricca di proteine vegetali e verdure fresche.',
      ko:'고기 없는 한 주, 식물성 단백질과 신선한 채소로 가득한 건강한 식사.'
    },
    lunches: ['Gazpacho','Tabbouleh','Ratatouille','Dhal','Shakshuka','Fasolada','Pasta alla Norma'],
    dinners: ['Musaca grecească','Pad Thai','Rajma','Hummus','Bibimbap','Spanakopita','Mapo Tofu'],
  },
  {
    id: 'rapid', idEn: 'quick-easy', emoji: '⚡',
    costRON: '170–220', costEUR: '35–47',
    theme: {
      ro:'Rapid & Simplu – max. 30 min', en:'Quick & Easy – max 30 min',
      es:'Rápido y Fácil – máx. 30 min', fr:'Rapide et Facile – max. 30 min',
      de:'Schnell & Einfach – max. 30 Min.', pt:'Rápido e Fácil – máx. 30 min',
      ru:'Быстро и Просто – до 30 мин', ar:'سريع وسهل – 30 دقيقة',
      zh:'快手美食 – 30分钟搞定', ja:'クイック＆イージー – 最大30分',
      hi:'त्वरित और आसान – 30 मिनट', tr:'Hızlı ve Kolay – maks. 30 dk',
      it:'Veloce e Facile – max. 30 min', ko:'빠르고 쉬운 – 최대 30분'
    },
    desc: {
      ro:'Mese delicioase în cel mult 30 de minute. Perfecte pentru zilele aglomerate când vrei să mănânci bine fără să petreci ore în bucătărie.',
      en:'Delicious meals ready in 30 minutes or less. Perfect for busy days when you want to eat well without spending hours in the kitchen.',
      es:'Comidas deliciosas listas en 30 minutos o menos. Perfectas para días ocupados.',
      fr:'Des repas délicieux prêts en 30 minutes ou moins. Parfaits pour les journées chargées.',
      de:'Leckere Mahlzeiten in 30 Minuten oder weniger. Für geschäftige Tage.',
      pt:'Refeições deliciosas prontas em 30 minutos ou menos. Perfeitas para dias agitados.',
      ru:'Вкусные блюда за 30 минут или меньше. Для занятых дней.',
      ar:'وجبات لذيذة جاهزة في 30 دقيقة أو أقل. مثالية للأيام المزدحمة.',
      zh:'30分钟或更短时间内完成的美味料理。忙碌日子的完美选择。',
      ja:'30分以内で完成する美味しい料理。忙しい日にぴったり。',
      hi:'30 मिनट या उससे कम में तैयार स्वादिष्ट भोजन। व्यस्त दिनों के लिए।',
      tr:'30 dakika veya daha kısa sürede hazır lezzetli yemekler. Yoğun günler için.',
      it:'Pasti deliziosi pronti in 30 minuti o meno. Perfetti per le giornate impegnate.',
      ko:'30분 이내로 완성되는 맛있는 요리. 바쁜 날을 위한 완벽한 선택.'
    },
    lunches: ['Spaghete Carbonara','Tacos','Pad Thai','Shakshuka','Dhal','Schnitzel','Okonomiyaki'],
    dinners: ['Pui Gong Bao','Pho','Tom Yum','Curry de pui','Nasi Goreng','Cheeseburger','Fish and Chips'],
  },
];

/* ════════════════════════════════════════════════════════════════
   LANGUAGE CONFIGS — UI strings + URL structure for all 14 langs
   ════════════════════════════════════════════════════════════════ */
const LANG_CONFIGS = {
  ro: {
    code:'ro', dir:'/ro/meniu-saptamanal', appDir:'/ro',
    homeLabel:'Acasă', sectionLabel:'Meniuri Săptămânale', appLabel:'Aplicație',
    planBadge:'Meniu săptămânal', planHeading:'Planul complet al săptămânii',
    dayTh:'Ziua', lunchTh:'Prânz', dinnerTh:'Cină',
    persons:'2 persoane', weeks:'7 zile',
    costUnit:'RON / săpt.', costValue: p=>p.costRON,
    ingredientsLabel: n=>`${n} ingrediente`,
    openAppLabel:'Deschide în aplicație &amp; editează',
    shoppingAnchor:'lista-cumparaturi',
    shoppingLabel:'Vezi lista de cumpărături',
    shoppingHeading:'Lista completă de cumpărături',
    shoppingIntro: (plan,n)=>`Toate ingredientele necesare, sortate alfabetic. Estimat <strong>~${plan.costRON} RON</strong> pentru 2 persoane.`,
    openPlanLabel:'Deschide planul în aplicație',
    openPlanSub:'Personalizează și descarcă PDF gratuit',
    otherPlansHeading:'Alte meniuri săptămânale',
    seeAll:'Vezi toate cele 8 meniuri →',
    seoHeading:'De ce să planifici mesele în avans?',
    seoBullets:['Reduci risipa alimentară cu până la <strong>30%</strong>','Economisești <strong>timp și bani</strong> — o singură tură','Mănânci mai <strong>sănătos</strong>','Elimini stresul zilnic al întrebării „ce gătesc azi?"'],
    indexTitle:'Meniuri Săptămânale cu Liste de Cumpărături – 8 Planuri | MealPlanner.ro',
    indexDesc:'8 meniuri săptămânale complete cu liste de cumpărături și costuri estimate. Mediteranean, Asian, Buget, Vegetarian și altele.',
    indexH1:'Meniuri Săptămânale cu <span class="accent">Liste de Cumpărături</span>',
    indexH1raw:'Meniuri Săptămânale cu <span class="accent">Liste de Cumpărături</span>',
    indexSubdesc:'8 planuri de mese complete, fiecare cu 14 rețete, lista de cumpărături sortată și costul estimat.',
    indexViewPlan:'Vezi planul',
    indexSeoH:'De ce să folosești un planificator săptămânal?',
    indexSeoP:'Planificarea meselor este una din cele mai eficiente metode de a mânca sănătos și de a economisi bani.',
    metaTitle: (theme)=>`Meniu Săptămânal ${theme} – Listă Cumpărături | MealPlanner.ro`,
    days:['Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă','Duminică'],
    recipeBase:'/ro/retete/',
    planIdFn: p=>p.id,
  },
  en: {
    code:'en', dir:'/en/weekly-meal-plan', appDir:'/en',
    homeLabel:'Home', sectionLabel:'Weekly Meal Plans', appLabel:'App',
    planBadge:'Weekly meal plan', planHeading:'Full weekly plan',
    dayTh:'Day', lunchTh:'Lunch', dinnerTh:'Dinner',
    persons:'2 people', weeks:'7 days',
    costUnit:'/ week', costValue: p=>`€${p.costEUR}`,
    ingredientsLabel: n=>`${n} ingredients`,
    openAppLabel:'Open in app &amp; customise',
    shoppingAnchor:'shopping-list-section',
    shoppingLabel:'See shopping list',
    shoppingHeading:'Complete shopping list',
    shoppingIntro: (plan,n)=>`All ingredients for the week, sorted alphabetically. Estimated <strong>~€${plan.costEUR}</strong> for 2 people.`,
    openPlanLabel:'Open plan in app',
    openPlanSub:'Customise recipes and download free PDF',
    otherPlansHeading:'More weekly plans',
    seeAll:'See all 8 plans →',
    seoHeading:'Why plan meals in advance?',
    seoBullets:['Reduce food waste by up to <strong>30%</strong>','Save <strong>time and money</strong> — one shopping trip','Eat <strong>healthier</strong>','Eliminate the daily "what should I cook?" stress'],
    indexTitle:'Free Weekly Meal Plans with Shopping Lists – 8 Themes | MealPlanner.ro',
    indexDesc:'8 complete weekly meal plans with shopping lists and cost estimates. Mediterranean, Asian, Budget, Vegetarian and more — all free.',
    indexH1raw:'Free Weekly Meal Plans with <span class="accent">Shopping Lists</span>',
    indexSubdesc:'8 complete meal plans, each with 14 recipes, a sorted shopping list and estimated cost.',
    indexViewPlan:'View plan',
    indexSeoH:'Why use a weekly meal planner?',
    indexSeoP:'Planning meals in advance is one of the most effective ways to eat healthier and save money.',
    metaTitle: (theme)=>`Weekly Meal Plan – ${theme} | MealPlanner.ro`,
    days:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    recipeBase:'/en/recipes/',
    planIdFn: p=>p.idEn,
  },
  es: {
    code:'es', dir:'/es/plan-semanal', appDir:'/',
    homeLabel:'Inicio', sectionLabel:'Planes Semanales', appLabel:'App',
    planBadge:'Plan de comidas semanal', planHeading:'Plan semanal completo',
    dayTh:'Día', lunchTh:'Almuerzo', dinnerTh:'Cena',
    persons:'2 personas', weeks:'7 días',
    costUnit:'/ semana', costValue: p=>`€${p.costEUR}`,
    ingredientsLabel: n=>`${n} ingredientes`,
    openAppLabel:'Abrir en la app &amp; personalizar',
    shoppingAnchor:'lista-compras',
    shoppingLabel:'Ver lista de compras',
    shoppingHeading:'Lista de compras completa',
    shoppingIntro: (plan,n)=>`Todos los ingredientes de la semana. Estimado <strong>~€${plan.costEUR}</strong> para 2 personas.`,
    openPlanLabel:'Abrir plan en la app',
    openPlanSub:'Personaliza recetas y descarga PDF gratis',
    otherPlansHeading:'Más planes semanales',
    seeAll:'Ver los 8 planes →',
    seoHeading:'¿Por qué planificar las comidas?',
    seoBullets:['Reduce el desperdicio de alimentos hasta un <strong>30%</strong>','Ahorra <strong>tiempo y dinero</strong>','Come de forma más <strong>saludable</strong>','Elimina el estrés diario de "¿qué cocino hoy?"'],
    indexTitle:'Planes de Comida Semanales con Listas de Compra – 8 Temas | MealPlanner.ro',
    indexDesc:'8 planes de comida semanales completos con listas de compra y costes estimados.',
    indexH1raw:'Planes Semanales con <span class="accent">Listas de Compra</span>',
    indexSubdesc:'8 planes completos, cada uno con 14 recetas, lista de compra ordenada y coste estimado.',
    indexViewPlan:'Ver plan',
    indexSeoH:'¿Por qué usar un planificador semanal?',
    indexSeoP:'Planificar las comidas es una de las formas más eficaces de comer más sano y ahorrar dinero.',
    metaTitle: (theme)=>`Plan Semanal – ${theme} | MealPlanner.ro`,
    days:['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'],
    recipeBase:'/ro/retete/',
    planIdFn: p=>p.idEn,
  },
  fr: {
    code:'fr', dir:'/fr/plan-semaine', appDir:'/',
    homeLabel:'Accueil', sectionLabel:'Plans de la Semaine', appLabel:'Application',
    planBadge:'Plan repas hebdomadaire', planHeading:'Plan complet de la semaine',
    dayTh:'Jour', lunchTh:'Déjeuner', dinnerTh:'Dîner',
    persons:'2 personnes', weeks:'7 jours',
    costUnit:'/ semaine', costValue: p=>`€${p.costEUR}`,
    ingredientsLabel: n=>`${n} ingrédients`,
    openAppLabel:'Ouvrir dans l\'app &amp; personnaliser',
    shoppingAnchor:'liste-courses',
    shoppingLabel:'Voir la liste de courses',
    shoppingHeading:'Liste de courses complète',
    shoppingIntro: (plan,n)=>`Tous les ingrédients de la semaine. Estimé <strong>~€${plan.costEUR}</strong> pour 2 personnes.`,
    openPlanLabel:'Ouvrir le plan dans l\'app',
    openPlanSub:'Personnalisez et téléchargez le PDF gratuitement',
    otherPlansHeading:'Autres plans hebdomadaires',
    seeAll:'Voir les 8 plans →',
    seoHeading:'Pourquoi planifier les repas ?',
    seoBullets:['Réduisez le gaspillage alimentaire de <strong>30%</strong>','Économisez <strong>temps et argent</strong>','Mangez plus <strong>sainement</strong>','Éliminez le stress quotidien de "que cuisiner ?"'],
    indexTitle:'Plans Repas Hebdomadaires avec Listes de Courses – 8 Thèmes | MealPlanner.ro',
    indexDesc:'8 plans repas hebdomadaires complets avec listes de courses et coûts estimés.',
    indexH1raw:'Plans Hebdomadaires avec <span class="accent">Listes de Courses</span>',
    indexSubdesc:'8 plans complets, chacun avec 14 recettes, une liste de courses et un coût estimé.',
    indexViewPlan:'Voir le plan',
    indexSeoH:'Pourquoi utiliser un planificateur hebdomadaire ?',
    indexSeoP:'Planifier les repas à l\'avance est l\'un des moyens les plus efficaces de manger sainement.',
    metaTitle: (theme)=>`Plan de Repas – ${theme} | MealPlanner.ro`,
    days:['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'],
    recipeBase:'/ro/retete/',
    planIdFn: p=>p.idEn,
  },
  de: {
    code:'de', dir:'/de/wochenplan', appDir:'/',
    homeLabel:'Startseite', sectionLabel:'Wochenpläne', appLabel:'App',
    planBadge:'Wochenspeiseplan', planHeading:'Vollständiger Wochenplan',
    dayTh:'Tag', lunchTh:'Mittagessen', dinnerTh:'Abendessen',
    persons:'2 Personen', weeks:'7 Tage',
    costUnit:'/ Woche', costValue: p=>`€${p.costEUR}`,
    ingredientsLabel: n=>`${n} Zutaten`,
    openAppLabel:'In App öffnen &amp; anpassen',
    shoppingAnchor:'einkaufsliste',
    shoppingLabel:'Einkaufsliste anzeigen',
    shoppingHeading:'Vollständige Einkaufsliste',
    shoppingIntro: (plan,n)=>`Alle Zutaten der Woche. Geschätzt <strong>~€${plan.costEUR}</strong> für 2 Personen.`,
    openPlanLabel:'Plan in App öffnen',
    openPlanSub:'Rezepte anpassen und PDF kostenlos herunterladen',
    otherPlansHeading:'Weitere Wochenpläne',
    seeAll:'Alle 8 Pläne anzeigen →',
    seoHeading:'Warum Mahlzeiten im Voraus planen?',
    seoBullets:['Lebensmittelverschwendung bis zu <strong>30%</strong> reduzieren','<strong>Zeit und Geld</strong> sparen','<strong>Gesünder</strong> essen','Täglichen Stress beim "Was koche ich?" eliminieren'],
    indexTitle:'Wochenspeisepläne mit Einkaufslisten – 8 Themen | MealPlanner.ro',
    indexDesc:'8 vollständige Wochenspeisepläne mit Einkaufslisten und Kostenabschätzungen.',
    indexH1raw:'Wochenpläne mit <span class="accent">Einkaufslisten</span>',
    indexSubdesc:'8 vollständige Pläne, jeder mit 14 Rezepten, einer sortierten Einkaufsliste und Kostenabschätzung.',
    indexViewPlan:'Plan ansehen',
    indexSeoH:'Warum einen Wochenplaner verwenden?',
    indexSeoP:'Die Mahlzeitenplanung im Voraus ist eine der effektivsten Methoden, gesünder zu essen.',
    metaTitle: (theme)=>`Wochenplan – ${theme} | MealPlanner.ro`,
    days:['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'],
    recipeBase:'/ro/retete/',
    planIdFn: p=>p.idEn,
  },
  pt: {
    code:'pt', dir:'/pt/plano-semanal', appDir:'/',
    homeLabel:'Início', sectionLabel:'Planos Semanais', appLabel:'App',
    planBadge:'Plano de refeições semanal', planHeading:'Plano semanal completo',
    dayTh:'Dia', lunchTh:'Almoço', dinnerTh:'Jantar',
    persons:'2 pessoas', weeks:'7 dias',
    costUnit:'/ semana', costValue: p=>`€${p.costEUR}`,
    ingredientsLabel: n=>`${n} ingredientes`,
    openAppLabel:'Abrir na app &amp; personalizar',
    shoppingAnchor:'lista-compras',
    shoppingLabel:'Ver lista de compras',
    shoppingHeading:'Lista de compras completa',
    shoppingIntro: (plan,n)=>`Todos os ingredientes da semana. Estimado <strong>~€${plan.costEUR}</strong> para 2 pessoas.`,
    openPlanLabel:'Abrir plano na app',
    openPlanSub:'Personalize receitas e baixe PDF grátis',
    otherPlansHeading:'Mais planos semanais',
    seeAll:'Ver todos os 8 planos →',
    seoHeading:'Por que planejar as refeições?',
    seoBullets:['Reduza o desperdício de alimentos em <strong>30%</strong>','Economize <strong>tempo e dinheiro</strong>','Coma de forma mais <strong>saudável</strong>','Elimine o estresse diário de "o que cozinhar?"'],
    indexTitle:'Planos de Refeições Semanais com Listas de Compras | MealPlanner.ro',
    indexDesc:'8 planos semanais completos com listas de compras e custos estimados.',
    indexH1raw:'Planos Semanais com <span class="accent">Listas de Compras</span>',
    indexSubdesc:'8 planos completos, cada um com 14 receitas, lista de compras e custo estimado.',
    indexViewPlan:'Ver plano',
    indexSeoH:'Por que usar um planejador semanal?',
    indexSeoP:'Planejar as refeições com antecedência é uma das formas mais eficazes de comer melhor.',
    metaTitle: (theme)=>`Plano Semanal – ${theme} | MealPlanner.ro`,
    days:['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'],
    recipeBase:'/ro/retete/',
    planIdFn: p=>p.idEn,
  },
  ru: {
    code:'ru', dir:'/ru/nedelnoe-menyu', appDir:'/',
    homeLabel:'Главная', sectionLabel:'Недельные меню', appLabel:'Приложение',
    planBadge:'Недельный план питания', planHeading:'Полный недельный план',
    dayTh:'День', lunchTh:'Обед', dinnerTh:'Ужин',
    persons:'2 человека', weeks:'7 дней',
    costUnit:'/ неделю', costValue: p=>`€${p.costEUR}`,
    ingredientsLabel: n=>`${n} ингредиентов`,
    openAppLabel:'Открыть в приложении',
    shoppingAnchor:'spisok-pokupok',
    shoppingLabel:'Список покупок',
    shoppingHeading:'Полный список покупок',
    shoppingIntro: (plan,n)=>`Все ингредиенты недели. Примерно <strong>~€${plan.costEUR}</strong> на 2 человека.`,
    openPlanLabel:'Открыть план',
    openPlanSub:'Настройте рецепты и скачайте PDF бесплатно',
    otherPlansHeading:'Другие недельные меню',
    seeAll:'Все 8 меню →',
    seoHeading:'Зачем планировать питание?',
    seoBullets:['Снижает пищевые отходы на <strong>30%</strong>','Экономит <strong>время и деньги</strong>','Помогает питаться <strong>здоровее</strong>','Убирает ежедневный стресс'],
    indexTitle:'Недельные меню с Cписками покупок | MealPlanner.ro',
    indexDesc:'8 полных недельных планов питания со списками покупок и оценками стоимости.',
    indexH1raw:'Недельные меню со <span class="accent">Списками покупок</span>',
    indexSubdesc:'8 планов с 14 рецептами каждый, отсортированным списком и оценкой стоимости.',
    indexViewPlan:'Смотреть план',
    indexSeoH:'Почему стоит планировать питание?',
    indexSeoP:'Планирование питания — один из эффективных способов питаться здоровее.',
    metaTitle: (theme)=>`Недельное меню – ${theme} | MealPlanner.ro`,
    days:['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'],
    recipeBase:'/ro/retete/',
    planIdFn: p=>p.idEn,
  },
  ar: {
    code:'ar', dir:'/ar/khitat-usbuiya', appDir:'/', dir_attr:'rtl',
    homeLabel:'الرئيسية', sectionLabel:'الخطط الأسبوعية', appLabel:'التطبيق',
    planBadge:'خطة وجبات أسبوعية', planHeading:'الخطة الأسبوعية الكاملة',
    dayTh:'اليوم', lunchTh:'الغداء', dinnerTh:'العشاء',
    persons:'شخصان', weeks:'٧ أيام',
    costUnit:'/ أسبوع', costValue: p=>`€${p.costEUR}`,
    ingredientsLabel: n=>`${n} مكونات`,
    openAppLabel:'فتح في التطبيق',
    shoppingAnchor:'qaima-tasawuk',
    shoppingLabel:'عرض قائمة التسوق',
    shoppingHeading:'قائمة التسوق الكاملة',
    shoppingIntro: (plan,n)=>`جميع المكونات للأسبوع. تقدير <strong>~€${plan.costEUR}</strong> لشخصين.`,
    openPlanLabel:'فتح الخطة في التطبيق',
    openPlanSub:'خصّص الوصفات وحمّل PDF مجاناً',
    otherPlansHeading:'خطط أسبوعية أخرى',
    seeAll:'عرض جميع الخطط الـ ٨ →',
    seoHeading:'لماذا تخطط وجباتك مسبقاً؟',
    seoBullets:['تقليل هدر الطعام حتى <strong>٣٠٪</strong>','توفير <strong>الوقت والمال</strong>','تناول طعام <strong>أكثر صحة</strong>','إزالة التوتر اليومي'],
    indexTitle:'خطط وجبات أسبوعية مع قوائم تسوق | MealPlanner.ro',
    indexDesc:'٨ خطط أسبوعية كاملة مع قوائم تسوق وتقديرات تكلفة.',
    indexH1raw:'خطط أسبوعية مع <span class="accent">قوائم التسوق</span>',
    indexSubdesc:'٨ خطط كاملة، كل منها يحتوي على ١٤ وصفة وقائمة تسوق وتقدير التكلفة.',
    indexViewPlan:'عرض الخطة',
    indexSeoH:'لماذا تستخدم مخططاً أسبوعياً؟',
    indexSeoP:'التخطيط المسبق للوجبات من أفضل الطرق لتناول طعام صحي وتوفير المال.',
    metaTitle: (theme)=>`الخطة الأسبوعية – ${theme} | MealPlanner.ro`,
    days:['الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت','الأحد'],
    recipeBase:'/ro/retete/',
    planIdFn: p=>p.idEn,
  },
  zh: {
    code:'zh', dir:'/zh/zhoujicaidan', appDir:'/',
    homeLabel:'首页', sectionLabel:'每周食谱计划', appLabel:'应用',
    planBadge:'每周饮食计划', planHeading:'完整的每周计划',
    dayTh:'日期', lunchTh:'午餐', dinnerTh:'晚餐',
    persons:'2人份', weeks:'7天',
    costUnit:'/ 周', costValue: p=>`€${p.costEUR}`,
    ingredientsLabel: n=>`${n}种食材`,
    openAppLabel:'在应用中打开',
    shoppingAnchor:'gouwu-qingdan',
    shoppingLabel:'查看购物清单',
    shoppingHeading:'完整购物清单',
    shoppingIntro: (plan,n)=>`本周所需所有食材，按字母排序。2人份预计 <strong>~€${plan.costEUR}</strong>。`,
    openPlanLabel:'在应用中打开计划',
    openPlanSub:'自定义食谱并免费下载PDF',
    otherPlansHeading:'更多每周计划',
    seeAll:'查看全部8个计划 →',
    seoHeading:'为什么要提前规划饮食？',
    seoBullets:['减少食物浪费高达 <strong>30%</strong>','节省<strong>时间和金钱</strong>','饮食更<strong>健康</strong>','消除每天"今天吃什么"的烦恼'],
    indexTitle:'每周饮食计划与购物清单 | MealPlanner.ro',
    indexDesc:'8个完整的每周饮食计划，附购物清单和费用估算。',
    indexH1raw:'每周饮食计划与<span class="accent">购物清单</span>',
    indexSubdesc:'8个完整计划，每个包含14道食谱、购物清单和费用估算。',
    indexViewPlan:'查看计划',
    indexSeoH:'为什么使用每周饮食规划器？',
    indexSeoP:'提前规划饮食是健康饮食和节省开支的最有效方法之一。',
    metaTitle: (theme)=>`每周饮食计划 – ${theme} | MealPlanner.ro`,
    days:['周一','周二','周三','周四','周五','周六','周日'],
    recipeBase:'/ro/retete/',
    planIdFn: p=>p.idEn,
  },
  ja: {
    code:'ja', dir:'/ja/weekly-menu', appDir:'/',
    homeLabel:'ホーム', sectionLabel:'週間献立', appLabel:'アプリ',
    planBadge:'週間食事プラン', planHeading:'1週間の完全なプラン',
    dayTh:'曜日', lunchTh:'昼食', dinnerTh:'夕食',
    persons:'2人分', weeks:'7日間',
    costUnit:'/ 週', costValue: p=>`€${p.costEUR}`,
    ingredientsLabel: n=>`${n}種類の食材`,
    openAppLabel:'アプリで開く',
    shoppingAnchor:'kaimono-list',
    shoppingLabel:'買い物リストを見る',
    shoppingHeading:'完全な買い物リスト',
    shoppingIntro: (plan,n)=>`今週必要な食材。2人分 <strong>~€${plan.costEUR}</strong> 程度。`,
    openPlanLabel:'アプリでプランを開く',
    openPlanSub:'レシピをカスタマイズして無料PDFをダウンロード',
    otherPlansHeading:'他の週間プラン',
    seeAll:'全8プランを見る →',
    seoHeading:'なぜ食事を計画すべきか？',
    seoBullets:['食品廃棄を <strong>30%</strong> 削減','<strong>時間とお金</strong> の節約','より<strong>健康的</strong>な食事','毎日の「何を作ろう？」というストレスを解消'],
    indexTitle:'週間献立プランと買い物リスト | MealPlanner.ro',
    indexDesc:'8つの完全な週間食事プラン、買い物リスト付き。',
    indexH1raw:'週間献立と<span class="accent">買い物リスト</span>',
    indexSubdesc:'8つのプラン、それぞれ14レシピ、買い物リスト、費用概算付き。',
    indexViewPlan:'プランを見る',
    indexSeoH:'なぜ週間プランナーを使うのか？',
    indexSeoP:'食事を事前に計画することは、健康的に食べるための最も効果的な方法の一つです。',
    metaTitle: (theme)=>`週間プラン – ${theme} | MealPlanner.ro`,
    days:['月曜日','火曜日','水曜日','木曜日','金曜日','土曜日','日曜日'],
    recipeBase:'/ro/retete/',
    planIdFn: p=>p.idEn,
  },
  hi: {
    code:'hi', dir:'/hi/weekly-plan', appDir:'/',
    homeLabel:'होम', sectionLabel:'साप्ताहिक भोजन योजना', appLabel:'ऐप',
    planBadge:'साप्ताहिक भोजन योजना', planHeading:'पूरी साप्ताहिक योजना',
    dayTh:'दिन', lunchTh:'दोपहर का भोजन', dinnerTh:'रात का खाना',
    persons:'2 लोग', weeks:'7 दिन',
    costUnit:'/ सप्ताह', costValue: p=>`€${p.costEUR}`,
    ingredientsLabel: n=>`${n} सामग्री`,
    openAppLabel:'ऐप में खोलें',
    shoppingAnchor:'kharid-suchi',
    shoppingLabel:'खरीदारी सूची देखें',
    shoppingHeading:'पूरी खरीदारी सूची',
    shoppingIntro: (plan,n)=>`सप्ताह की सभी सामग्री। 2 लोगों के लिए अनुमानित <strong>~€${plan.costEUR}</strong>।`,
    openPlanLabel:'ऐप में योजना खोलें',
    openPlanSub:'रेसिपी कस्टमाइज़ करें और मुफ्त PDF डाउनलोड करें',
    otherPlansHeading:'अन्य साप्ताहिक योजनाएं',
    seeAll:'सभी 8 योजनाएं देखें →',
    seoHeading:'भोजन की योजना क्यों बनाएं?',
    seoBullets:['खाद्य अपशिष्ट <strong>30%</strong> तक कम करें','<strong>समय और पैसा</strong> बचाएं','अधिक <strong>स्वस्थ</strong> खाएं','रोज़ "आज क्या पकाएं?" की परेशानी खत्म करें'],
    indexTitle:'साप्ताहिक भोजन योजनाएं और खरीदारी सूची | MealPlanner.ro',
    indexDesc:'8 पूर्ण साप्ताहिक भोजन योजनाएं, खरीदारी सूची और लागत अनुमान के साथ।',
    indexH1raw:'साप्ताहिक योजनाएं और <span class="accent">खरीदारी सूची</span>',
    indexSubdesc:'8 पूर्ण योजनाएं, प्रत्येक में 14 रेसिपी, खरीदारी सूची और लागत अनुमान।',
    indexViewPlan:'योजना देखें',
    indexSeoH:'साप्ताहिक प्लानर क्यों उपयोग करें?',
    indexSeoP:'पहले से भोजन की योजना बनाना स्वस्थ खाने और पैसे बचाने के सबसे प्रभावी तरीकों में से एक है।',
    metaTitle: (theme)=>`साप्ताहिक योजना – ${theme} | MealPlanner.ro`,
    days:['सोमवार','मंगलवार','बुधवार','गुरुवार','शुक्रवार','शनिवार','रविवार'],
    recipeBase:'/ro/retete/',
    planIdFn: p=>p.idEn,
  },
  tr: {
    code:'tr', dir:'/tr/haftalik-menu', appDir:'/',
    homeLabel:'Ana Sayfa', sectionLabel:'Haftalık Yemek Planları', appLabel:'Uygulama',
    planBadge:'Haftalık yemek planı', planHeading:'Tam haftalık plan',
    dayTh:'Gün', lunchTh:'Öğle Yemeği', dinnerTh:'Akşam Yemeği',
    persons:'2 kişi', weeks:'7 gün',
    costUnit:'/ hafta', costValue: p=>`€${p.costEUR}`,
    ingredientsLabel: n=>`${n} malzeme`,
    openAppLabel:'Uygulamada aç',
    shoppingAnchor:'alisveris-listesi',
    shoppingLabel:'Alışveriş listesini gör',
    shoppingHeading:'Tam alışveriş listesi',
    shoppingIntro: (plan,n)=>`Haftanın tüm malzemeleri. 2 kişi için yaklaşık <strong>~€${plan.costEUR}</strong>.`,
    openPlanLabel:'Planı uygulamada aç',
    openPlanSub:'Tarifleri özelleştir ve ücretsiz PDF indir',
    otherPlansHeading:'Diğer haftalık planlar',
    seeAll:'Tüm 8 planı gör →',
    seoHeading:'Yemekleri neden önceden planlayın?',
    seoBullets:['Gıda israfını <strong>%30</strong> azalt','<strong>Zaman ve para</strong> tasarrufu','Daha <strong>sağlıklı</strong> beslen','Günlük "bugün ne pişirsem?" stresini yok et'],
    indexTitle:'Haftalık Yemek Planları ve Alışveriş Listeleri | MealPlanner.ro',
    indexDesc:'8 tam haftalık yemek planı, alışveriş listeleri ve maliyet tahminleriyle.',
    indexH1raw:'Haftalık Planlar ve <span class="accent">Alışveriş Listeleri</span>',
    indexSubdesc:'Her biri 14 tarif, alışveriş listesi ve maliyet tahmini içeren 8 tam plan.',
    indexViewPlan:'Planı gör',
    indexSeoH:'Haftalık planlayıcı neden kullanılmalı?',
    indexSeoP:'Yemek planlaması, daha sağlıklı beslenmenin ve para biriktirmenin en etkili yollarından biridir.',
    metaTitle: (theme)=>`Haftalık Plan – ${theme} | MealPlanner.ro`,
    days:['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'],
    recipeBase:'/ro/retete/',
    planIdFn: p=>p.idEn,
  },
  it: {
    code:'it', dir:'/it/piano-settimanale', appDir:'/',
    homeLabel:'Home', sectionLabel:'Piani Settimanali', appLabel:'App',
    planBadge:'Piano pasti settimanale', planHeading:'Piano settimanale completo',
    dayTh:'Giorno', lunchTh:'Pranzo', dinnerTh:'Cena',
    persons:'2 persone', weeks:'7 giorni',
    costUnit:'/ settimana', costValue: p=>`€${p.costEUR}`,
    ingredientsLabel: n=>`${n} ingredienti`,
    openAppLabel:'Apri nell\'app',
    shoppingAnchor:'lista-spesa',
    shoppingLabel:'Vedi lista della spesa',
    shoppingHeading:'Lista della spesa completa',
    shoppingIntro: (plan,n)=>`Tutti gli ingredienti della settimana. Stimato <strong>~€${plan.costEUR}</strong> per 2 persone.`,
    openPlanLabel:'Apri piano nell\'app',
    openPlanSub:'Personalizza ricette e scarica PDF gratis',
    otherPlansHeading:'Altri piani settimanali',
    seeAll:'Vedi tutti gli 8 piani →',
    seoHeading:'Perché pianificare i pasti?',
    seoBullets:['Riduci gli sprechi alimentari fino al <strong>30%</strong>','Risparmia <strong>tempo e denaro</strong>','Mangia in modo più <strong>sano</strong>','Elimina lo stress quotidiano'],
    indexTitle:'Piani Pasti Settimanali con Liste della Spesa | MealPlanner.ro',
    indexDesc:'8 piani settimanali completi con liste della spesa e stime dei costi.',
    indexH1raw:'Piani Settimanali con <span class="accent">Liste della Spesa</span>',
    indexSubdesc:'8 piani completi, ognuno con 14 ricette, lista della spesa e stima dei costi.',
    indexViewPlan:'Vedi piano',
    indexSeoH:'Perché usare un pianificatore settimanale?',
    indexSeoP:'Pianificare i pasti in anticipo è uno dei metodi più efficaci per mangiare in modo più sano.',
    metaTitle: (theme)=>`Piano Settimanale – ${theme} | MealPlanner.ro`,
    days:['Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica'],
    recipeBase:'/ro/retete/',
    planIdFn: p=>p.idEn,
  },
  ko: {
    code:'ko', dir:'/ko/jugan-menu', appDir:'/',
    homeLabel:'홈', sectionLabel:'주간 식단 계획', appLabel:'앱',
    planBadge:'주간 식단 계획', planHeading:'전체 주간 계획',
    dayTh:'요일', lunchTh:'점심', dinnerTh:'저녁',
    persons:'2인분', weeks:'7일',
    costUnit:'/ 주', costValue: p=>`€${p.costEUR}`,
    ingredientsLabel: n=>`${n}가지 재료`,
    openAppLabel:'앱에서 열기',
    shoppingAnchor:'jangbogi-list',
    shoppingLabel:'장보기 목록 보기',
    shoppingHeading:'완전한 장보기 목록',
    shoppingIntro: (plan,n)=>`이번 주 필요한 모든 재료. 2인 기준 <strong>~€${plan.costEUR}</strong> 예상.`,
    openPlanLabel:'앱에서 계획 열기',
    openPlanSub:'레시피를 커스터마이즈하고 무료 PDF 다운로드',
    otherPlansHeading:'다른 주간 계획',
    seeAll:'전체 8개 계획 보기 →',
    seoHeading:'왜 식사를 미리 계획해야 할까요?',
    seoBullets:['식품 낭비를 <strong>30%</strong> 줄이기','<strong>시간과 돈</strong> 절약','더 <strong>건강하게</strong> 먹기','매일 "오늘 뭐 먹지?" 스트레스 해소'],
    indexTitle:'주간 식단 계획 및 장보기 목록 | MealPlanner.ro',
    indexDesc:'장보기 목록과 비용 추정이 포함된 8가지 완전한 주간 식단 계획.',
    indexH1raw:'주간 계획과 <span class="accent">장보기 목록</span>',
    indexSubdesc:'각각 14가지 레시피, 장보기 목록, 비용 추정이 포함된 8가지 완전한 계획.',
    indexViewPlan:'계획 보기',
    indexSeoH:'주간 플래너를 사용하는 이유',
    indexSeoP:'식사를 미리 계획하는 것은 건강하게 먹고 비용을 절약하는 가장 효과적인 방법 중 하나입니다.',
    metaTitle: (theme)=>`주간 계획 – ${theme} | MealPlanner.ro`,
    days:['월요일','화요일','수요일','목요일','금요일','토요일','일요일'],
    recipeBase:'/ro/retete/',
    planIdFn: p=>p.idEn,
  },
};

/* ════════════════════════════════════════════════════════════════
   SHARED HTML HELPERS
   ════════════════════════════════════════════════════════════════ */
const HEAD = (title, desc, canonical, langCode='ro', dir='ltr') => `<!DOCTYPE html>
<html lang="${langCode}" dir="${dir}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}"/>
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1"/>
  <link rel="canonical" href="https://meal-planner.ro${canonical}"/>
  <link rel="alternate" hreflang="x-default" href="https://meal-planner.ro/"/>
  <link rel="alternate" hreflang="ro" href="https://meal-planner.ro/ro/"/>
  <link rel="alternate" hreflang="en" href="https://meal-planner.ro/en/"/>
  <meta property="og:type" content="website"/>
  <meta property="og:title" content="${esc(title)}"/>
  <meta property="og:description" content="${esc(desc)}"/>
  <meta property="og:url" content="https://meal-planner.ro${canonical}"/>
  <meta property="og:image" content="https://meal-planner.ro/cover.jpg"/>
  <meta name="theme-color" content="#24712A"/>
  <link rel="icon" type="image/svg+xml" href="/images/favicon.svg"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"/>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet"/>
  <link rel="stylesheet" href="/css/style.min.css"/>
  <link rel="stylesheet" href="/css/content.css"/>
</head>
<body>`;

// Will be populated after RECIPE_LANG is defined (see below)
let RECIPES_NAV = {};

const appHref = (lc) => lc.appDir && lc.appDir !== '/' ? `${lc.appDir}/` : '/';

const makeNav = (lc) => `
<header class="app-header no-print" role="banner">
  <nav class="app-nav" aria-label="Main navigation">
    <a class="nav-brand" href="/" aria-label="MealPlanner.ro – home">
      <span class="nav-icon" aria-hidden="true">🥗</span>
      <span class="nav-title">MealPlanner<span class="nav-tld">.ro</span></span>
    </a>
    <div class="nav-links">
      <a href="${lc.dir}/" class="nav-link">${lc.sectionLabel}</a>
      <a href="${RECIPES_NAV[lc.code].href}" class="nav-link">${RECIPES_NAV[lc.code].label}</a>
      <a href="${appHref(lc)}" class="nav-link">${lc.appLabel}</a>
    </div>
  </nav>
</header>`;

const makeFooter = (lc) => `
<footer class="app-footer" role="contentinfo">
  <div class="footer-inner">
    <span class="footer-brand">🥗 MealPlanner.ro</span>
    <span class="footer-sep">·</span>
    <a href="${lc.dir}/">${lc.sectionLabel}</a>
    <span class="footer-sep">·</span>
    <a href="${appHref(lc)}">${lc.appLabel}</a>
    <span class="footer-sep">·</span>
    <span>© 2025</span>
  </div>
</footer>`;

/* ════════════════════════════════════════════════════════════════
   SHOPPING LIST BUILDER
   ════════════════════════════════════════════════════════════════ */
function buildShoppingList(plan, langCode) {
  const src = plan.isBudget ? budgetRecipes : recipes;
  const ingMap = {};
  [...plan.lunches, ...plan.dinners].forEach(name => {
    const r = src.find(re =>
      re.name?.[langCode] === name || re.name?.ro === name || re.name?.en === name
    );
    if (!r) return;
    const ingr = r.ingredients?.[langCode] || r.ingredients?.ro || r.ingredients?.en || [];
    ingr.forEach(i => {
      const key = i.toLowerCase().replace(/\s*\(.*?\)/g,'').trim();
      if (key && !ingMap[key]) ingMap[key] = i;
    });
  });
  return Object.values(ingMap).sort((a,b) => a.localeCompare(b));
}

/* ════════════════════════════════════════════════════════════════
   GENERIC planPage — works for ALL 14 languages
   ════════════════════════════════════════════════════════════════ */
function planPage(plan, lc) {
  const src = plan.isBudget ? budgetRecipes : recipes;
  const lc_code = lc.code;
  const shopping = buildShoppingList(plan, lc_code);
  const planId = lc.planIdFn(plan);
  const theme  = plan.theme[lc_code] || plan.theme.en;
  const desc   = plan.desc[lc_code]  || plan.desc.en;
  const canonical = `${lc.dir}/${planId}/`;

  const rows = lc.days.map((day, i) => {
    const lName = plan.lunches[i] || '';
    const dName = plan.dinners[i] || '';
    const lRec  = src.find(r => r.name?.ro===lName || r.name?.en===lName);
    const dRec  = src.find(r => r.name?.ro===dName || r.name?.en===dName);
    const lDispName = lRec?.name?.[lc_code] || lRec?.name?.en || lName;
    const dDispName = dRec?.name?.[lc_code] || dRec?.name?.en || dName;
    const lIngr = (lRec?.ingredients?.[lc_code] || lRec?.ingredients?.ro || []).slice(0,5).join(', ');
    const dIngr = (dRec?.ingredients?.[lc_code] || dRec?.ingredients?.ro || []).slice(0,5).join(', ');
    const lSlug = lRec?.name?.ro || lRec?.name?.en ? `${lc.recipeBase}${slug(lRec.name.ro||lRec.name.en)}/` : '#';
    const dSlug = dRec?.name?.ro || dRec?.name?.en ? `${lc.recipeBase}${slug(dRec.name.ro||dRec.name.en)}/` : '#';
    return `<tr>
      <td><strong>${day}</strong></td>
      <td>${lSlug!=='#'?`<a href="${lSlug}" class="recipe-link">`:''}${esc(lDispName)}${lSlug!=='#'?'</a>':''}${lIngr?`<br><small class="text-muted">${esc(lIngr)}…</small>`:''}
      </td>
      <td>${dSlug!=='#'?`<a href="${dSlug}" class="recipe-link">`:''}${esc(dDispName)}${dSlug!=='#'?'</a>':''}${dIngr?`<br><small class="text-muted">${esc(dIngr)}…</small>`:''}
      </td>
    </tr>`;
  }).join('');

  const shoppingItems = shopping.map(i => `<li><i class="bi bi-check2-square"></i> ${esc(capFirst(i))}</li>`).join('\n');
  const otherPlans = PLANS.filter(p => p.id !== plan.id).slice(0, 4).map(p =>
    `<a href="${lc.dir}/${lc.planIdFn(p)}/" class="content-card-mini">
      <span class="card-mini-emoji">${p.emoji}</span>
      <span>${esc(p.theme[lc_code]||p.theme.en)}</span>
    </a>`
  ).join('');

  const jsonLd = JSON.stringify({
    "@context":"https://schema.org","@type":"MealPlan",
    "name":`${theme}`, "description":desc,
    "url":`https://meal-planner.ro${canonical}`,
    "publisher":{"@type":"Organization","name":"MealPlanner.ro","url":"https://meal-planner.ro"}
  });

  const dir_attr = lc.dir_attr || 'ltr';
  const costDisplay = lc.costValue(plan);

  return `${HEAD(lc.metaTitle(theme), desc, canonical, lc_code, dir_attr)}
<script type="application/ld+json">${jsonLd}</script>
${makeNav(lc)}
<main class="content-main">
  <section class="content-hero">
    <div class="content-hero-inner">
      <nav aria-label="breadcrumb" class="breadcrumb-nav">
        <a href="/">${lc.homeLabel}</a> › <a href="${lc.dir}/">${lc.sectionLabel}</a> › <span>${esc(theme)}</span>
      </nav>
      <div class="content-hero-badge">${plan.emoji} ${lc.planBadge}</div>
      <h1>${esc(theme)}</h1>
      <p class="content-hero-desc">${esc(desc)}</p>
      <div class="plan-meta-chips">
        <span class="plan-chip"><i class="bi bi-people-fill"></i> ${lc.persons}</span>
        <span class="plan-chip"><i class="bi bi-calendar-week"></i> ${lc.weeks}</span>
        <span class="plan-chip cost-chip"><i class="bi bi-currency-exchange"></i> ~${costDisplay} ${lc.costUnit}</span>
        <span class="plan-chip"><i class="bi bi-bag-check-fill"></i> ${lc.ingredientsLabel(shopping.length)}</span>
      </div>
      <div class="content-cta-group">
        <a href="${lc.appDir}/?autoplan=${plan.id}" class="btn btn-generate btn-lg">
          <i class="bi bi-pencil-square"></i> ${lc.openAppLabel}
        </a>
        <a href="#${lc.shoppingAnchor}" class="btn btn-outline-light btn-lg">
          <i class="bi bi-cart3"></i> ${lc.shoppingLabel}
        </a>
      </div>
    </div>
  </section>

  <section class="content-section" aria-labelledby="plan-h">
    <div class="content-section-inner">
      <h2 id="plan-h"><span class="section-emoji">📅</span> ${lc.planHeading}</h2>
      <div class="table-wrap">
        <table class="table planner-table content-table">
          <thead><tr><th>${lc.dayTh}</th><th><i class="bi bi-sun"></i> ${lc.lunchTh}</th><th><i class="bi bi-moon-stars"></i> ${lc.dinnerTh}</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  </section>

  <section class="content-section content-section--green" id="${lc.shoppingAnchor}">
    <div class="content-section-inner">
      <h2><span class="section-emoji">🛒</span> ${lc.shoppingHeading}</h2>
      <p class="section-intro">${lc.shoppingIntro(plan, shopping.length)}</p>
      <ul class="shopping-grid">${shoppingItems}</ul>
      <div class="shopping-cta">
        <a href="${lc.appDir}/?autoplan=${plan.id}" class="btn btn-generate">
          <i class="bi bi-pencil-square"></i> ${lc.openPlanLabel}
        </a>
        <small>${lc.openPlanSub}</small>
      </div>
    </div>
  </section>

  <section class="content-section">
    <div class="content-section-inner">
      <h2><span class="section-emoji">✨</span> ${lc.otherPlansHeading}</h2>
      <div class="mini-cards-grid">${otherPlans}</div>
      <div class="text-center mt-4">
        <a href="${lc.dir}/" class="btn btn-outline-primary">${lc.seeAll}</a>
      </div>
    </div>
  </section>

  <section class="content-section content-seo">
    <div class="content-section-inner">
      <h2>${lc.seoHeading}</h2>
      <ul>${lc.seoBullets.map(b=>`<li>${b}</li>`).join('')}</ul>
    </div>
  </section>
</main>
${makeFooter(lc)}
</body></html>`;
}

/* ════════════════════════════════════════════════════════════════
   GENERIC indexPage — works for ALL 14 languages
   ════════════════════════════════════════════════════════════════ */
function indexPage(lc) {
  const lc_code = lc.code;
  const cards = PLANS.map(p => {
    const theme = p.theme[lc_code] || p.theme.en;
    const desc  = (p.desc[lc_code] || p.desc.en).slice(0, 110) + '…';
    const planId = lc.planIdFn(p);
    const costDisplay = lc.costValue(p);
    return `<a href="${lc.dir}/${planId}/" class="content-card">
      <div class="content-card-header">
        <span class="card-emoji">${p.emoji}</span>
        <h2 class="card-title">${esc(theme)}</h2>
      </div>
      <p class="card-desc">${esc(desc)}</p>
      <div class="card-meta">
        <span><i class="bi bi-currency-exchange"></i> ${costDisplay} ${lc.costUnit}</span>
        <span><i class="bi bi-arrow-right-circle-fill"></i> ${lc.indexViewPlan}</span>
      </div>
    </a>`;
  }).join('');

  const dir_attr = lc.dir_attr || 'ltr';

  return `${HEAD(lc.indexTitle, lc.indexDesc, `${lc.dir}/`, lc_code, dir_attr)}
${makeNav(lc)}
<main class="content-main">
  <section class="content-hero content-hero--short">
    <div class="content-hero-inner">
      <nav aria-label="breadcrumb" class="breadcrumb-nav">
        <a href="/">${lc.homeLabel}</a> › <span>${lc.sectionLabel}</span>
      </nav>
      <h1>${lc.indexH1raw}</h1>
      <p class="content-hero-desc">${esc(lc.indexSubdesc)}</p>
    </div>
  </section>
  <section class="content-section">
    <div class="content-section-inner">
      <div class="content-cards-grid">${cards}</div>
    </div>
  </section>
  <section class="content-section content-seo">
    <div class="content-section-inner">
      <h2>${lc.indexSeoH}</h2>
      <p>${lc.indexSeoP}</p>
    </div>
  </section>
</main>
${makeFooter(lc)}
</body></html>`;
}

/* ════════════════════════════════════════════════════════════════
   RECIPE CONFIGS — all 14 languages
   ════════════════════════════════════════════════════════════════ */
const RECIPE_LANG = {
  ro: { dir:'/ro/retete',    indexTitle:'Rețete din Toată Lumea | MealPlanner.ro',
        indexH1:'Rețete din <span class="accent">Toată Lumea</span>',
        indexDesc: n=>`${n} rețete cu ingrediente și mod de preparare.`,
        breadHome:'Acasă', breadLabel:'Rețete',
        ingredientsH:'🛒 Ingrediente', howToH:'👨‍🍳 Mod de preparare',
        addBtn: n=>`Adaugă în planul meu`, relatedH: o=>`Alte rețete din ${esc(o)}`,
        seoP: n=>`Adaugă <strong>${esc(n)}</strong> în planul tău săptămânal cu <a href="/ro/">MealPlanner.ro</a>.`,
        pageTitle: n=>`Rețetă ${esc(n)} – Ingrediente și Mod de Preparare | MealPlanner.ro`,
        pageDesc: (n,o)=>`Rețeta de ${n}: ingrediente, mod de preparare pas cu pas. Adaugă în planificator gratuit.`,
        heroDesc: o=>`Rețetă din <strong>${esc(o)}</strong>. Ingrediente proaspete, preparare simplă.`,
        appDir:'/ro', lc: null },
  en: { dir:'/en/recipes',   indexTitle:`Recipes from Around the World | MealPlanner.ro`,
        indexH1:'Recipes from <span class="accent">Around the World</span>',
        indexDesc: n=>`${n} recipes with ingredients and instructions.`,
        breadHome:'Home', breadLabel:'Recipes',
        ingredientsH:'🛒 Ingredients', howToH:'👨‍🍳 How to make it',
        addBtn: n=>`Add to my meal plan`, relatedH: o=>`More recipes from ${esc(o)}`,
        seoP: n=>`Add <strong>${esc(n)}</strong> to your weekly plan with the <a href="/en/">free MealPlanner.ro app</a>.`,
        pageTitle: n=>`${esc(n)} Recipe – Ingredients & How to Make | MealPlanner.ro`,
        pageDesc: (n,o)=>`${n} recipe: ingredients, step-by-step instructions. Add to your free meal planner.`,
        heroDesc: o=>`Traditional recipe from <strong>${esc(o)}</strong>.`,
        appDir:'/en', lc: null },
  es: { dir:'/es/recetas',   indexTitle:`Recetas del Mundo | MealPlanner.ro`,
        indexH1:'Recetas del <span class="accent">Mundo</span>',
        indexDesc: n=>`${n} recetas con ingredientes e instrucciones.`,
        breadHome:'Inicio', breadLabel:'Recetas',
        ingredientsH:'🛒 Ingredientes', howToH:'👨‍🍳 Cómo prepararlo',
        addBtn: n=>`Añadir a mi plan`, relatedH: o=>`Más recetas de ${esc(o)}`,
        seoP: n=>`Añade <strong>${esc(n)}</strong> a tu plan semanal con <a href="/es/">MealPlanner.ro</a>.`,
        pageTitle: n=>`Receta de ${esc(n)} – Ingredientes y Preparación | MealPlanner.ro`,
        pageDesc: (n,o)=>`Receta de ${n} de ${o}: ingredientes e instrucciones paso a paso.`,
        heroDesc: o=>`Receta tradicional de <strong>${esc(o)}</strong>.`,
        appDir:'', lc: null },
  fr: { dir:'/fr/recettes',  indexTitle:`Recettes du Monde | MealPlanner.ro`,
        indexH1:'Recettes du <span class="accent">Monde</span>',
        indexDesc: n=>`${n} recettes avec ingrédients et instructions.`,
        breadHome:'Accueil', breadLabel:'Recettes',
        ingredientsH:'🛒 Ingrédients', howToH:'👨‍🍳 Comment préparer',
        addBtn: n=>`Ajouter à mon plan`, relatedH: o=>`Plus de recettes de ${esc(o)}`,
        seoP: n=>`Ajoutez <strong>${esc(n)}</strong> à votre plan hebdomadaire avec <a href="/fr/">MealPlanner.ro</a>.`,
        pageTitle: n=>`Recette ${esc(n)} – Ingrédients et Préparation | MealPlanner.ro`,
        pageDesc: (n,o)=>`Recette de ${n} de ${o}: ingrédients et instructions étape par étape.`,
        heroDesc: o=>`Recette traditionnelle de <strong>${esc(o)}</strong>.`,
        appDir:'', lc: null },
  de: { dir:'/de/rezepte',   indexTitle:`Rezepte aus aller Welt | MealPlanner.ro`,
        indexH1:'Rezepte aus <span class="accent">aller Welt</span>',
        indexDesc: n=>`${n} Rezepte mit Zutaten und Anleitung.`,
        breadHome:'Startseite', breadLabel:'Rezepte',
        ingredientsH:'🛒 Zutaten', howToH:'👨‍🍳 Zubereitung',
        addBtn: n=>`Zu meinem Plan hinzufügen`, relatedH: o=>`Weitere Rezepte aus ${esc(o)}`,
        seoP: n=>`Füge <strong>${esc(n)}</strong> zu deinem Wochenplan mit <a href="/de/">MealPlanner.ro</a> hinzu.`,
        pageTitle: n=>`${esc(n)} Rezept – Zutaten & Zubereitung | MealPlanner.ro`,
        pageDesc: (n,o)=>`${n} Rezept aus ${o}: Zutaten und Schritt-für-Schritt-Anleitung.`,
        heroDesc: o=>`Traditionelles Rezept aus <strong>${esc(o)}</strong>.`,
        appDir:'', lc: null },
  pt: { dir:'/pt/receitas',  indexTitle:`Receitas do Mundo | MealPlanner.ro`,
        indexH1:'Receitas do <span class="accent">Mundo</span>',
        indexDesc: n=>`${n} receitas com ingredientes e instruções.`,
        breadHome:'Início', breadLabel:'Receitas',
        ingredientsH:'🛒 Ingredientes', howToH:'👨‍🍳 Como preparar',
        addBtn: n=>`Adicionar ao meu plano`, relatedH: o=>`Mais receitas de ${esc(o)}`,
        seoP: n=>`Adicione <strong>${esc(n)}</strong> ao seu plano semanal com <a href="/pt/">MealPlanner.ro</a>.`,
        pageTitle: n=>`Receita de ${esc(n)} – Ingredientes e Preparo | MealPlanner.ro`,
        pageDesc: (n,o)=>`Receita de ${n} de ${o}: ingredientes e instruções passo a passo.`,
        heroDesc: o=>`Receita tradicional de <strong>${esc(o)}</strong>.`,
        appDir:'', lc: null },
  ru: { dir:'/ru/retsepty',  indexTitle:`Рецепты со всего мира | MealPlanner.ro`,
        indexH1:'Рецепты со <span class="accent">всего мира</span>',
        indexDesc: n=>`${n} рецептов с ингредиентами и инструкциями.`,
        breadHome:'Главная', breadLabel:'Рецепты',
        ingredientsH:'🛒 Ингредиенты', howToH:'👨‍🍳 Как приготовить',
        addBtn: n=>`Добавить в мой план`, relatedH: o=>`Ещё рецепты из ${esc(o)}`,
        seoP: n=>`Добавьте <strong>${esc(n)}</strong> в свой план на неделю с <a href="/ru/">MealPlanner.ro</a>.`,
        pageTitle: n=>`Рецепт ${esc(n)} – Ингредиенты и приготовление | MealPlanner.ro`,
        pageDesc: (n,o)=>`Рецепт ${n} из ${o}: ингредиенты и пошаговые инструкции.`,
        heroDesc: o=>`Традиционный рецепт из <strong>${esc(o)}</strong>.`,
        appDir:'', lc: null },
  ar: { dir:'/ar/wasafat',   indexTitle:`وصفات من حول العالم | MealPlanner.ro`,
        indexH1:'وصفات من <span class="accent">حول العالم</span>',
        indexDesc: n=>`${n} وصفة مع المكونات والتعليمات.`,
        breadHome:'الرئيسية', breadLabel:'وصفات',
        ingredientsH:'🛒 المكونات', howToH:'👨‍🍳 طريقة التحضير',
        addBtn: n=>`أضف إلى خطتي`, relatedH: o=>`المزيد من وصفات ${esc(o)}`,
        seoP: n=>`أضف <strong>${esc(n)}</strong> إلى خطتك الأسبوعية مع <a href="/ar/">MealPlanner.ro</a>.`,
        pageTitle: n=>`وصفة ${esc(n)} – المكونات وطريقة التحضير | MealPlanner.ro`,
        pageDesc: (n,o)=>`وصفة ${n} من ${o}: مكونات وتعليمات خطوة بخطوة.`,
        heroDesc: o=>`وصفة تقليدية من <strong>${esc(o)}</strong>.`,
        appDir:'', dir_attr:'rtl', lc: null },
  zh: { dir:'/zh/shipu',     indexTitle:`世界各地食谱 | MealPlanner.ro`,
        indexH1:'<span class="accent">世界各地</span>食谱',
        indexDesc: n=>`${n}个食谱，含食材和制作方法。`,
        breadHome:'首页', breadLabel:'食谱',
        ingredientsH:'🛒 食材', howToH:'👨‍🍳 做法',
        addBtn: n=>`加入我的计划`, relatedH: o=>`更多来自${esc(o)}的食谱`,
        seoP: n=>`将<strong>${esc(n)}</strong>添加到您的每周计划 <a href="/zh/">MealPlanner.ro</a>。`,
        pageTitle: n=>`${esc(n)}食谱 – 食材和做法 | MealPlanner.ro`,
        pageDesc: (n,o)=>`${n}食谱来自${o}：食材和步骤说明。`,
        heroDesc: o=>`来自<strong>${esc(o)}</strong>的传统食谱。`,
        appDir:'', lc: null },
  ja: { dir:'/ja/reshipi',   indexTitle:`世界の料理レシピ | MealPlanner.ro`,
        indexH1:'<span class="accent">世界の</span>料理レシピ',
        indexDesc: n=>`${n}のレシピ、材料と作り方付き。`,
        breadHome:'ホーム', breadLabel:'レシピ',
        ingredientsH:'🛒 材料', howToH:'👨‍🍳 作り方',
        addBtn: n=>`プランに追加`, relatedH: o=>`${esc(o)}のその他のレシピ`,
        seoP: n=>`<strong>${esc(n)}</strong>を<a href="/ja/">MealPlanner.ro</a>の週間プランに追加しましょう。`,
        pageTitle: n=>`${esc(n)}のレシピ – 材料と作り方 | MealPlanner.ro`,
        pageDesc: (n,o)=>`${o}の${n}レシピ：材料とステップごとの作り方。`,
        heroDesc: o=>`<strong>${esc(o)}</strong>の伝統的なレシピ。`,
        appDir:'', lc: null },
  hi: { dir:'/hi/recipes',   indexTitle:`दुनिया भर की रेसिपी | MealPlanner.ro`,
        indexH1:'<span class="accent">दुनिया भर</span> की रेसिपी',
        indexDesc: n=>`${n} रेसिपी सामग्री और निर्देशों के साथ।`,
        breadHome:'होम', breadLabel:'रेसिपी',
        ingredientsH:'🛒 सामग्री', howToH:'👨‍🍳 बनाने का तरीका',
        addBtn: n=>`मेरी योजना में जोड़ें`, relatedH: o=>`${esc(o)} की और रेसिपी`,
        seoP: n=>`<strong>${esc(n)}</strong> को <a href="/hi/">MealPlanner.ro</a> के साथ अपनी साप्ताहिक योजना में जोड़ें।`,
        pageTitle: n=>`${esc(n)} रेसिपी – सामग्री और बनाने का तरीका | MealPlanner.ro`,
        pageDesc: (n,o)=>`${o} से ${n} रेसिपी: सामग्री और चरण-दर-चरण निर्देश।`,
        heroDesc: o=>`<strong>${esc(o)}</strong> की पारंपरिक रेसिपी।`,
        appDir:'', lc: null },
  tr: { dir:'/tr/tarifler',  indexTitle:`Dünyadan Tarifler | MealPlanner.ro`,
        indexH1:'<span class="accent">Dünyadan</span> Tarifler',
        indexDesc: n=>`${n} tarif, malzemeler ve talimatlarla.`,
        breadHome:'Ana Sayfa', breadLabel:'Tarifler',
        ingredientsH:'🛒 Malzemeler', howToH:'👨‍🍳 Nasıl yapılır',
        addBtn: n=>`Planıma ekle`, relatedH: o=>`${esc(o)} tarihinden daha fazla tarif`,
        seoP: n=>`<strong>${esc(n)}</strong>'ı <a href="/tr/">MealPlanner.ro</a> ile haftalık planınıza ekleyin.`,
        pageTitle: n=>`${esc(n)} Tarifi – Malzemeler ve Yapılışı | MealPlanner.ro`,
        pageDesc: (n,o)=>`${o}'dan ${n} tarifi: malzemeler ve adım adım talimatlar.`,
        heroDesc: o=>`<strong>${esc(o)}</strong>'dan geleneksel tarif.`,
        appDir:'', lc: null },
  it: { dir:'/it/ricette',   indexTitle:`Ricette dal Mondo | MealPlanner.ro`,
        indexH1:'Ricette dal <span class="accent">Mondo</span>',
        indexDesc: n=>`${n} ricette con ingredienti e istruzioni.`,
        breadHome:'Home', breadLabel:'Ricette',
        ingredientsH:'🛒 Ingredienti', howToH:'👨‍🍳 Come preparare',
        addBtn: n=>`Aggiungi al mio piano`, relatedH: o=>`Altre ricette da ${esc(o)}`,
        seoP: n=>`Aggiungi <strong>${esc(n)}</strong> al tuo piano settimanale con <a href="/it/">MealPlanner.ro</a>.`,
        pageTitle: n=>`Ricetta ${esc(n)} – Ingredienti e Preparazione | MealPlanner.ro`,
        pageDesc: (n,o)=>`Ricetta di ${n} da ${o}: ingredienti e istruzioni passo dopo passo.`,
        heroDesc: o=>`Ricetta tradizionale da <strong>${esc(o)}</strong>.`,
        appDir:'', lc: null },
  ko: { dir:'/ko/recipes',   indexTitle:`세계 요리 레시피 | MealPlanner.ro`,
        indexH1:'<span class="accent">세계</span> 요리 레시피',
        indexDesc: n=>`재료와 만드는 법이 있는 ${n}가지 레시피.`,
        breadHome:'홈', breadLabel:'레시피',
        ingredientsH:'🛒 재료', howToH:'👨‍🍳 만드는 법',
        addBtn: n=>`내 플랜에 추가`, relatedH: o=>`${esc(o)}의 더 많은 레시피`,
        seoP: n=>`<strong>${esc(n)}</strong>을(를) <a href="/ko/">MealPlanner.ro</a>의 주간 플랜에 추가하세요.`,
        pageTitle: n=>`${esc(n)} 레시피 – 재료 및 만드는 법 | MealPlanner.ro`,
        pageDesc: (n,o)=>`${o}의 ${n} 레시피: 재료와 단계별 지침.`,
        heroDesc: o=>`<strong>${esc(o)}</strong>의 전통 레시피.`,
        appDir:'', lc: null },
};
// Attach lc nav/footer builders + populate RECIPES_NAV
Object.entries(RECIPE_LANG).forEach(([code, rl]) => {
  rl.lc = LANG_CONFIGS[code];
  const label = {ro:'🍽️ Rețete',en:'🍽️ Recipes',es:'🍽️ Recetas',fr:'🍽️ Recettes',
    de:'🍽️ Rezepte',pt:'🍽️ Receitas',ru:'🍽️ Рецепты',ar:'🍽️ وصفات',
    zh:'🍽️ 食谱',ja:'🍽️ レシピ',hi:'🍽️ व्यंजन',tr:'🍽️ Tarifler',it:'🍽️ Ricette',ko:'🍽️ 레시피'}[code] || '🍽️ Recipes';
  RECIPES_NAV[code] = { href: `${rl.dir}/`, label };
});

/* ════════════════════════════════════════════════════════════════
   GENERIC recipe page + index — works for ALL 14 languages
   ════════════════════════════════════════════════════════════════ */
function recipePage(recipe, rl) {
  const lc   = rl.lc;
  const code = lc.code;
  const n    = recipe.name?.[code]    || recipe.name?.en    || recipe.name?.ro    || '';
  const o    = recipe.origin?.[code]  || recipe.origin?.en  || recipe.origin?.ro  || '';
  const ingr = recipe.ingredients?.[code] || recipe.ingredients?.en || recipe.ingredients?.ro || [];
  const how  = recipe.howIsMade?.[code]   || recipe.howIsMade?.en   || recipe.howIsMade?.ro   || '';
  const cat  = recipe.category?.[code]    || recipe.category?.en    || recipe.category?.ro    || '';
  const steps = how.split(/\.\s+/).filter(Boolean);
  // Use English slug for all languages (ASCII-safe, consistent)
  const enName = recipe.name?.en || recipe.name?.ro || '';
  const rslug  = slug(enName);
  const url    = `https://meal-planner.ro${rl.dir}/${rslug}/`;
  const appUrl = rl.appDir ? `${rl.appDir}/` : '/';

  const jsonLd = JSON.stringify({
    "@context":"https://schema.org","@type":"Recipe","name":n,
    "description":rl.pageDesc(n,o),
    "recipeIngredient":ingr,
    "recipeInstructions":steps.map(s=>({ "@type":"HowToStep","text":s })),
    "recipeCategory":cat,
    "author":{"@type":"Organization","name":"MealPlanner.ro"},
    "url": url
  });

  const others = recipes
    .filter(r => (r.origin?.[code]||r.origin?.en) === o && (r.name?.[code]||r.name?.en) !== n)
    .slice(0,3)
    .map(r => {
      const rn = r.name?.[code] || r.name?.en || r.name?.ro || '';
      const rs = slug(r.name?.en || r.name?.ro || rn);
      return `<a href="${rl.dir}/${rs}/" class="recipe-rel-link">🍽️ ${esc(rn)}</a>`;
    }).join('');

  const dir_attr = rl.dir_attr || 'ltr';
  return `${HEAD(rl.pageTitle(n), rl.pageDesc(n,o), `${rl.dir}/${rslug}/`, code, dir_attr)}
<script type="application/ld+json">${jsonLd}</script>
${makeNav(lc)}
<main class="content-main">
  <section class="content-hero content-hero--short">
    <div class="content-hero-inner">
      <nav aria-label="breadcrumb" class="breadcrumb-nav">
        <a href="/">${rl.breadHome}</a> › <a href="${rl.dir}/">${rl.breadLabel}</a> › <span>${esc(n)}</span>
      </nav>
      <div class="content-hero-badge">🍽️ ${esc(cat)} · ${esc(o)}</div>
      <h1>${esc(n)}</h1>
      <p class="content-hero-desc">${rl.heroDesc(o)}</p>
      <a href="${appUrl}?meal=${encodeURIComponent(n)}" class="btn btn-generate">
        <i class="bi bi-plus-circle-fill"></i> ${rl.addBtn(n)}
      </a>
    </div>
  </section>
  <section class="content-section">
    <div class="content-section-inner recipe-layout">
      <div class="recipe-ingredients-box">
        <h2><span class="section-emoji">🛒</span> ${rl.ingredientsH.replace('🛒 ','')}</h2>
        <ul class="recipe-ingr-list">
          ${ingr.map(i=>`<li><i class="bi bi-dot"></i> ${esc(capFirst(i))}</li>`).join('\n          ')}
        </ul>
      </div>
      <div class="recipe-steps-box">
        <h2><span class="section-emoji">👨‍🍳</span> ${rl.howToH.replace('👨‍🍳 ','')}</h2>
        ${steps.length>1
          ? `<ol class="recipe-steps">${steps.map(s=>`<li>${esc(s)}.</li>`).join('')}</ol>`
          : `<p class="recipe-how">${esc(how)}</p>`}
        ${others?`<div class="recipe-related"><h3>${rl.relatedH(o)}</h3>${others}</div>`:''}
      </div>
    </div>
  </section>
  <section class="content-section content-seo"><div class="content-section-inner">
    <p>${rl.seoP(n)}</p>
  </div></section>
</main>${makeFooter(lc)}</body></html>`;
}

function recipeIndex(rl) {
  const lc   = rl.lc;
  const code = lc.code;
  const byOrigin = {};
  recipes.forEach(r => {
    const o = r.origin?.[code] || r.origin?.en || 'Other';
    (byOrigin[o] || (byOrigin[o] = [])).push(r);
  });
  const groups = Object.entries(byOrigin).sort((a,b)=>b[1].length-a[1].length).map(([o,recs])=>`
  <div class="recipe-origin-group">
    <h3 class="origin-title">🌍 ${esc(o)} <span class="recipe-count">(${recs.length})</span></h3>
    <ul class="recipe-origin-list">
      ${recs.map(r => {
        const rn = r.name?.[code] || r.name?.en || r.name?.ro || '';
        const rs = slug(r.name?.en || r.name?.ro || rn);
        return `<li><a href="${rl.dir}/${rs}/">${esc(rn)}</a></li>`;
      }).join('')}
    </ul>
  </div>`).join('');
  const dir_attr = rl.dir_attr || 'ltr';
  return `${HEAD(rl.indexTitle, rl.indexDesc(recipes.length), `${rl.dir}/`, code, dir_attr)}
${makeNav(lc)}<main class="content-main">
  <section class="content-hero content-hero--short"><div class="content-hero-inner">
    <nav aria-label="breadcrumb" class="breadcrumb-nav"><a href="/">${rl.breadHome}</a> › <span>${rl.breadLabel}</span></nav>
    <h1>${rl.indexH1}</h1>
    <p class="content-hero-desc">${rl.indexDesc(recipes.length)}</p>
  </div></section>
  <section class="content-section"><div class="content-section-inner">
    <div class="recipe-groups-grid">${groups}</div>
  </div></section>
</main>${makeFooter(lc)}</body></html>`;
}

/* ════════════════════════════════════════════════════════════════
   WRITE ALL FILES
   ════════════════════════════════════════════════════════════════ */
console.log('Generating content pages…\n');
let count = 0;

// ── Weekly plan pages: ALL 14 languages ──────────────────────────
for (const [code, lc] of Object.entries(LANG_CONFIGS)) {
  const dirPath = path.join(PUBLIC, ...lc.dir.split('/').filter(Boolean));
  write(path.join(dirPath, 'index.html'), indexPage(lc));
  console.log(`✅ ${lc.dir}/`);
  PLANS.forEach(p => {
    const planId = lc.planIdFn(p);
    write(path.join(dirPath, planId, 'index.html'), planPage(p, lc));
    count++;
  });
  console.log(`   ✅ ${PLANS.length} plan pages → ${lc.dir}/`);
}

// ── Recipe pages: ALL 14 languages ───────────────────────────────
for (const [code, rl] of Object.entries(RECIPE_LANG)) {
  const dirParts = rl.dir.split('/').filter(Boolean); // e.g. ['ro','retete']
  write(path.join(PUBLIC, ...dirParts, 'index.html'), recipeIndex(rl));
  recipes.forEach(r => {
    const enName = r.name?.en || r.name?.ro;
    if (!enName) return;
    const rslug = slug(enName);
    write(path.join(PUBLIC, ...dirParts, rslug, 'index.html'), recipePage(r, rl));
    count++;
  });
  console.log(`✅ ${recipes.length} recipe pages → ${rl.dir}/`);
}

console.log(`\n🎉 Done! Generated ${count} pages total.`);

/* ════════════════════════════════════════════════════════════════
   SITEMAP — all URLs
   ════════════════════════════════════════════════════════════════ */
const sitemapUrls = [
  'https://meal-planner.ro/',
  ...Object.keys(LANG_CONFIGS).map(c => `https://meal-planner.ro/${c}/`),
];

// Weekly plan pages for all 14 languages
for (const [code, lc] of Object.entries(LANG_CONFIGS)) {
  sitemapUrls.push(`https://meal-planner.ro${lc.dir}/`);
  PLANS.forEach(p => sitemapUrls.push(`https://meal-planner.ro${lc.dir}/${lc.planIdFn(p)}/`));
}

// Recipe pages ALL 14 languages
for (const rl of Object.values(RECIPE_LANG)) {
  sitemapUrls.push(`https://meal-planner.ro${rl.dir}/`);
  recipes.forEach(r => {
    const enName = r.name?.en || r.name?.ro;
    if (enName) sitemapUrls.push(`https://meal-planner.ro${rl.dir}/${slug(enName)}/`);
  });
}

const today = new Date().toISOString().slice(0,10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(u => `  <url>
    <loc>${u}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.includes('/retete/')||u.includes('/recipes/')?'monthly':u.endsWith('/meniu-saptamanal/')||u.endsWith('/weekly-meal-plan/')||u.includes('/plan-')||u.includes('/wochenplan')||u.includes('/piano-')||u.includes('/nedelnoe')||u.includes('/haftalik')||u.includes('/jugan')||u.includes('/weekly-menu')||u.includes('/zhouji')||u.includes('/khitat')||u.includes('/plano-')||u.includes('/weekly-plan')?'monthly':'weekly'}</changefreq>
    <priority>${u==='https://meal-planner.ro/'?'1.0':u.match(/meal-planner\.ro\/(ro|en)\/$/)?'0.9':'0.7'}</priority>
  </url>`).join('\n')}
</urlset>`;

write(path.join(PUBLIC, 'sitemap.xml'), sitemap);
console.log(`\n✅ sitemap.xml — ${sitemapUrls.length} URLs`);
