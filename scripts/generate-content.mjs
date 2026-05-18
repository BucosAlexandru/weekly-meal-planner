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
    indexTitle:'Meniuri Săptămânale cu Liste de Cumpărături – 8 Planuri | Meal-Planner.ro',
    indexDesc:'8 meniuri săptămânale complete cu liste de cumpărături și costuri estimate. Mediteranean, Asian, Buget, Vegetarian și altele.',
    indexH1:'Meniuri Săptămânale cu <span class="accent">Liste de Cumpărături</span>',
    indexH1raw:'Meniuri Săptămânale cu <span class="accent">Liste de Cumpărături</span>',
    indexSubdesc:'8 planuri de mese complete, fiecare cu 14 rețete, lista de cumpărături sortată și costul estimat.',
    indexViewPlan:'Vezi planul',
    indexSeoH:'De ce să folosești un planificator săptămânal?',
    indexSeoP:'Planificarea meselor este una din cele mai eficiente metode de a mânca sănătos și de a economisi bani.',
    metaTitle: (theme)=>`Meniu Săptămânal ${theme} – Listă Cumpărături | Meal-Planner.ro`,
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
    indexTitle:'Free Weekly Meal Plans with Shopping Lists – 8 Themes | Meal-Planner.ro',
    indexDesc:'8 complete weekly meal plans with shopping lists and cost estimates. Mediterranean, Asian, Budget, Vegetarian and more — all free.',
    indexH1raw:'Free Weekly Meal Plans with <span class="accent">Shopping Lists</span>',
    indexSubdesc:'8 complete meal plans, each with 14 recipes, a sorted shopping list and estimated cost.',
    indexViewPlan:'View plan',
    indexSeoH:'Why use a weekly meal planner?',
    indexSeoP:'Planning meals in advance is one of the most effective ways to eat healthier and save money.',
    metaTitle: (theme)=>`Weekly Meal Plan – ${theme} | Meal-Planner.ro`,
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
    indexTitle:'Planes de Comida Semanales con Listas de Compra – 8 Temas | Meal-Planner.ro',
    indexDesc:'8 planes de comida semanales completos con listas de compra y costes estimados.',
    indexH1raw:'Planes Semanales con <span class="accent">Listas de Compra</span>',
    indexSubdesc:'8 planes completos, cada uno con 14 recetas, lista de compra ordenada y coste estimado.',
    indexViewPlan:'Ver plan',
    indexSeoH:'¿Por qué usar un planificador semanal?',
    indexSeoP:'Planificar las comidas es una de las formas más eficaces de comer más sano y ahorrar dinero.',
    metaTitle: (theme)=>`Plan Semanal – ${theme} | Meal-Planner.ro`,
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
    indexTitle:'Plans Repas Hebdomadaires avec Listes de Courses – 8 Thèmes | Meal-Planner.ro',
    indexDesc:'8 plans repas hebdomadaires complets avec listes de courses et coûts estimés.',
    indexH1raw:'Plans Hebdomadaires avec <span class="accent">Listes de Courses</span>',
    indexSubdesc:'8 plans complets, chacun avec 14 recettes, une liste de courses et un coût estimé.',
    indexViewPlan:'Voir le plan',
    indexSeoH:'Pourquoi utiliser un planificateur hebdomadaire ?',
    indexSeoP:'Planifier les repas à l\'avance est l\'un des moyens les plus efficaces de manger sainement.',
    metaTitle: (theme)=>`Plan de Repas – ${theme} | Meal-Planner.ro`,
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
    indexTitle:'Wochenspeisepläne mit Einkaufslisten – 8 Themen | Meal-Planner.ro',
    indexDesc:'8 vollständige Wochenspeisepläne mit Einkaufslisten und Kostenabschätzungen.',
    indexH1raw:'Wochenpläne mit <span class="accent">Einkaufslisten</span>',
    indexSubdesc:'8 vollständige Pläne, jeder mit 14 Rezepten, einer sortierten Einkaufsliste und Kostenabschätzung.',
    indexViewPlan:'Plan ansehen',
    indexSeoH:'Warum einen Wochenplaner verwenden?',
    indexSeoP:'Die Mahlzeitenplanung im Voraus ist eine der effektivsten Methoden, gesünder zu essen.',
    metaTitle: (theme)=>`Wochenplan – ${theme} | Meal-Planner.ro`,
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
    indexTitle:'Planos de Refeições Semanais com Listas de Compras | Meal-Planner.ro',
    indexDesc:'8 planos semanais completos com listas de compras e custos estimados.',
    indexH1raw:'Planos Semanais com <span class="accent">Listas de Compras</span>',
    indexSubdesc:'8 planos completos, cada um com 14 receitas, lista de compras e custo estimado.',
    indexViewPlan:'Ver plano',
    indexSeoH:'Por que usar um planejador semanal?',
    indexSeoP:'Planejar as refeições com antecedência é uma das formas mais eficazes de comer melhor.',
    metaTitle: (theme)=>`Plano Semanal – ${theme} | Meal-Planner.ro`,
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
    indexTitle:'Недельные меню с Cписками покупок | Meal-Planner.ro',
    indexDesc:'8 полных недельных планов питания со списками покупок и оценками стоимости.',
    indexH1raw:'Недельные меню со <span class="accent">Списками покупок</span>',
    indexSubdesc:'8 планов с 14 рецептами каждый, отсортированным списком и оценкой стоимости.',
    indexViewPlan:'Смотреть план',
    indexSeoH:'Почему стоит планировать питание?',
    indexSeoP:'Планирование питания — один из эффективных способов питаться здоровее.',
    metaTitle: (theme)=>`Недельное меню – ${theme} | Meal-Planner.ro`,
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
    indexTitle:'خطط وجبات أسبوعية مع قوائم تسوق | Meal-Planner.ro',
    indexDesc:'٨ خطط أسبوعية كاملة مع قوائم تسوق وتقديرات تكلفة.',
    indexH1raw:'خطط أسبوعية مع <span class="accent">قوائم التسوق</span>',
    indexSubdesc:'٨ خطط كاملة، كل منها يحتوي على ١٤ وصفة وقائمة تسوق وتقدير التكلفة.',
    indexViewPlan:'عرض الخطة',
    indexSeoH:'لماذا تستخدم مخططاً أسبوعياً؟',
    indexSeoP:'التخطيط المسبق للوجبات من أفضل الطرق لتناول طعام صحي وتوفير المال.',
    metaTitle: (theme)=>`الخطة الأسبوعية – ${theme} | Meal-Planner.ro`,
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
    indexTitle:'每周饮食计划与购物清单 | Meal-Planner.ro',
    indexDesc:'8个完整的每周饮食计划，附购物清单和费用估算。',
    indexH1raw:'每周饮食计划与<span class="accent">购物清单</span>',
    indexSubdesc:'8个完整计划，每个包含14道食谱、购物清单和费用估算。',
    indexViewPlan:'查看计划',
    indexSeoH:'为什么使用每周饮食规划器？',
    indexSeoP:'提前规划饮食是健康饮食和节省开支的最有效方法之一。',
    metaTitle: (theme)=>`每周饮食计划 – ${theme} | Meal-Planner.ro`,
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
    indexTitle:'週間献立プランと買い物リスト | Meal-Planner.ro',
    indexDesc:'8つの完全な週間食事プラン、買い物リスト付き。',
    indexH1raw:'週間献立と<span class="accent">買い物リスト</span>',
    indexSubdesc:'8つのプラン、それぞれ14レシピ、買い物リスト、費用概算付き。',
    indexViewPlan:'プランを見る',
    indexSeoH:'なぜ週間プランナーを使うのか？',
    indexSeoP:'食事を事前に計画することは、健康的に食べるための最も効果的な方法の一つです。',
    metaTitle: (theme)=>`週間プラン – ${theme} | Meal-Planner.ro`,
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
    indexTitle:'साप्ताहिक भोजन योजनाएं और खरीदारी सूची | Meal-Planner.ro',
    indexDesc:'8 पूर्ण साप्ताहिक भोजन योजनाएं, खरीदारी सूची और लागत अनुमान के साथ।',
    indexH1raw:'साप्ताहिक योजनाएं और <span class="accent">खरीदारी सूची</span>',
    indexSubdesc:'8 पूर्ण योजनाएं, प्रत्येक में 14 रेसिपी, खरीदारी सूची और लागत अनुमान।',
    indexViewPlan:'योजना देखें',
    indexSeoH:'साप्ताहिक प्लानर क्यों उपयोग करें?',
    indexSeoP:'पहले से भोजन की योजना बनाना स्वस्थ खाने और पैसे बचाने के सबसे प्रभावी तरीकों में से एक है।',
    metaTitle: (theme)=>`साप्ताहिक योजना – ${theme} | Meal-Planner.ro`,
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
    indexTitle:'Haftalık Yemek Planları ve Alışveriş Listeleri | Meal-Planner.ro',
    indexDesc:'8 tam haftalık yemek planı, alışveriş listeleri ve maliyet tahminleriyle.',
    indexH1raw:'Haftalık Planlar ve <span class="accent">Alışveriş Listeleri</span>',
    indexSubdesc:'Her biri 14 tarif, alışveriş listesi ve maliyet tahmini içeren 8 tam plan.',
    indexViewPlan:'Planı gör',
    indexSeoH:'Haftalık planlayıcı neden kullanılmalı?',
    indexSeoP:'Yemek planlaması, daha sağlıklı beslenmenin ve para biriktirmenin en etkili yollarından biridir.',
    metaTitle: (theme)=>`Haftalık Plan – ${theme} | Meal-Planner.ro`,
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
    indexTitle:'Piani Pasti Settimanali con Liste della Spesa | Meal-Planner.ro',
    indexDesc:'8 piani settimanali completi con liste della spesa e stime dei costi.',
    indexH1raw:'Piani Settimanali con <span class="accent">Liste della Spesa</span>',
    indexSubdesc:'8 piani completi, ognuno con 14 ricette, lista della spesa e stima dei costi.',
    indexViewPlan:'Vedi piano',
    indexSeoH:'Perché usare un pianificatore settimanale?',
    indexSeoP:'Pianificare i pasti in anticipo è uno dei metodi più efficaci per mangiare in modo più sano.',
    metaTitle: (theme)=>`Piano Settimanale – ${theme} | Meal-Planner.ro`,
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
    indexTitle:'주간 식단 계획 및 장보기 목록 | Meal-Planner.ro',
    indexDesc:'장보기 목록과 비용 추정이 포함된 8가지 완전한 주간 식단 계획.',
    indexH1raw:'주간 계획과 <span class="accent">장보기 목록</span>',
    indexSubdesc:'각각 14가지 레시피, 장보기 목록, 비용 추정이 포함된 8가지 완전한 계획.',
    indexViewPlan:'계획 보기',
    indexSeoH:'주간 플래너를 사용하는 이유',
    indexSeoP:'식사를 미리 계획하는 것은 건강하게 먹고 비용을 절약하는 가장 효과적인 방법 중 하나입니다.',
    metaTitle: (theme)=>`주간 계획 – ${theme} | Meal-Planner.ro`,
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
    <a class="nav-brand" href="/" aria-label="Meal-Planner.ro – home">
      <span class="nav-icon" aria-hidden="true">🥗</span>
      <span class="nav-title">Meal-Planner<span class="nav-tld">.ro</span></span>
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
    <span class="footer-brand">🥗 Meal-Planner.ro</span>
    <span class="footer-sep">·</span>
    <a href="${lc.dir}/">${lc.sectionLabel}</a>
    <span class="footer-sep">·</span>
    <a href="${appHref(lc)}">${lc.appLabel}</a>
    <span class="footer-sep">·</span>
    <span>© 2025</span>
  </div>
</footer>`;

/* ════════════════════════════════════════════════════════════════
   MULTILINGUAL PRICING PAGES
   ════════════════════════════════════════════════════════════════ */

const PRICING_SLUGS = {
  ro:'premium', en:'pricing', es:'precios', fr:'tarifs',
  de:'preise',  pt:'precos',  ru:'tseny',   ar:'asaar',
  zh:'jiage',   ja:'pricing', hi:'pricing', tr:'fiyatlar',
  it:'prezzi',  ko:'pricing'
};

const PRICING_COPY = {
  ro: {
    metaTitle: 'Prețuri – Gratuit vs Premium | Meal-Planner.ro',
    metaDesc:  'Compară planurile Gratuit și Premium. PDF-uri nelimitate, asistent AI, meniu cu buget — doar €3/lună.',
    title:     'Prețuri simple și clare',
    subtitle:  'Începe gratuit. Fă upgrade când ai nevoie de mai mult.',
    freeName:  'Gratuit',
    premName:  '⭐ Premium',
    price:     '€3/lună',
    popular:   'CEL MAI POPULAR',
    cta:       'Obține Premium →',
    backLabel: '← Înapoi la Planificator',
    alreadyLabel:    'Ai deja un abonament?',
    alreadyActivate: 'Activează →',
    freeFeats: ['✅ Planificator 7 zile','✅ Listă de cumpărături automată','✅ 175 rețete din 70+ țări','✅ 14 limbi','✅ 1 PDF complet/zi','✗ PDF complet 7 zile','✗ Meniu cu buget săptămânal','✗ Asistent AI rețete','✗ Coach nutriție AI'],
    premFeats: ['✅ Tot ce e în Gratuit, plus:','✅ PDF complet 7 zile','✅ Meniu cu buget săptămânal','✅ Asistent AI rețete (chat)','✅ Coach nutriție AI','✅ Acces nelimitat, oricând','✅ Anulezi oricând — fără angajament'],
    faqTitle:  'Întrebări frecvente',
    faq: [
      ['Ce include planul Gratuit?','Acces complet la planificatorul de 7 zile, listă de cumpărături automată, 175 rețete în 14 limbi și 1 PDF pe zi.'],
      ['Ce adaugă Premium?','Un PDF cu întregul plan de 7 zile, meniu cu buget săptămânal, asistentul AI de rețete și coach-ul de nutriție AI — toate nelimitate.'],
      ['Cum funcționează facturarea?','€3/lună, facturat prin Stripe. Poți anula oricând din portalul clienților.'],
      ['Cum activez după plată?','Revino pe pagina principală și introdu emailul în secțiunea „Ai deja abonament?". Statusul tău premium va fi verificat instant.'],
      ['Este disponibil în limba mea?','Da — în 14 limbi: română, engleză, spaniolă, franceză, germană, portugheză, rusă, arabă, chineză, japoneză, hindi, turcă, italiană și coreeană.']
    ]
  },
  en: {
    metaTitle: 'Pricing – Free vs Premium | Meal-Planner.ro',
    metaDesc:  'Compare Free and Premium plans. Unlimited PDFs, AI recipe assistant, weekly budget menu — just €3/month.',
    title:     'Simple, honest pricing',
    subtitle:  'Start free. Upgrade when you need more.',
    freeName:  'Free',
    premName:  '⭐ Premium',
    price:     '€3/month',
    popular:   'MOST POPULAR',
    cta:       'Get Premium →',
    backLabel: '← Back to Meal Planner',
    alreadyLabel:    'Already have a subscription?',
    alreadyActivate: 'Activate →',
    freeFeats: ['✅ 7-day meal planner','✅ Auto shopping list','✅ 175 recipes from 70+ countries','✅ 14 languages','✅ 1 full PDF/day','✗ Full 7-day PDF download','✗ Weekly budget menu','✗ AI recipe assistant','✗ AI nutrition coach'],
    premFeats: ['✅ Everything in Free, plus:','✅ Full 7-day PDF download','✅ Weekly budget menu','✅ AI recipe assistant (chat)','✅ AI nutrition coach','✅ Unlimited access, anytime','✅ Cancel anytime — no commitment'],
    faqTitle:  'Frequently asked questions',
    faq: [
      ['What does Free include?','Full access to the 7-day meal planner, automatic shopping list, 175 recipes in 14 languages, and 1 PDF download per day.'],
      ['What does Premium add?','A single PDF with your entire 7-day plan, a weekly budget menu, the AI recipe chat assistant, and the AI nutrition coach — all unlimited.'],
      ['How does billing work?','€3/month, billed via Stripe. You can cancel at any time from the customer portal.'],
      ['How do I activate after payment?','Return to the homepage and enter your email in the "Already subscribed?" section. Your premium status will be verified instantly.'],
      ['Is it available in my language?','Yes — in 14 languages: English, Romanian, Spanish, French, German, Portuguese, Russian, Arabic, Chinese, Japanese, Hindi, Turkish, Italian, and Korean.']
    ]
  },
  es: {
    metaTitle: 'Precios – Gratis vs Premium | Meal-Planner.ro',
    metaDesc:  'Compara los planes Gratis y Premium. PDFs ilimitados, asistente de recetas IA, menú con presupuesto — solo €3/mes.',
    title:     'Precios simples y claros',
    subtitle:  'Comienza gratis. Mejora cuando necesites más.',
    freeName:  'Gratis',
    premName:  '⭐ Premium',
    price:     '€3/mes',
    popular:   'MÁS POPULAR',
    cta:       'Obtener Premium →',
    backLabel: '← Volver al Planificador',
    alreadyLabel:    '¿Ya tienes suscripción?',
    alreadyActivate: 'Activar →',
    freeFeats: ['✅ Planificador de 7 días','✅ Lista de compras automática','✅ 175 recetas de 70+ países','✅ 14 idiomas','✅ 1 PDF completo/día','✗ PDF completo de 7 días','✗ Menú semanal con presupuesto','✗ Asistente de recetas IA','✗ Coach de nutrición IA'],
    premFeats: ['✅ Todo en Gratis, más:','✅ PDF completo de 7 días','✅ Menú semanal con presupuesto','✅ Asistente de recetas IA (chat)','✅ Coach de nutrición IA','✅ Acceso ilimitado, en cualquier momento','✅ Cancela cuando quieras'],
    faqTitle:  'Preguntas frecuentes',
    faq: [
      ['¿Qué incluye el plan Gratis?','Acceso completo al planificador de 7 días, lista de compras automática, 175 recetas en 14 idiomas y 1 PDF por día.'],
      ['¿Qué agrega Premium?','Un PDF con tu plan completo de 7 días, menú semanal con presupuesto, asistente de recetas IA y coach de nutrición IA — todo ilimitado.'],
      ['¿Cómo funciona la facturación?','€3/mes, facturado a través de Stripe. Puedes cancelar en cualquier momento desde el portal de clientes.'],
      ['¿Cómo activo tras el pago?','Vuelve a la página principal e introduce tu email en la sección "¿Ya suscrito?". Tu estado premium se verificará al instante.'],
      ['¿Está disponible en mi idioma?','Sí — en 14 idiomas: español, inglés, rumano, francés, alemán, portugués, ruso, árabe, chino, japonés, hindi, turco, italiano y coreano.']
    ]
  },
  fr: {
    metaTitle: 'Tarifs – Gratuit vs Premium | Meal-Planner.ro',
    metaDesc:  'Comparez les offres Gratuit et Premium. PDFs illimités, assistant recettes IA, menu budgétaire — seulement €3/mois.',
    title:     'Tarifs simples et transparents',
    subtitle:  'Commencez gratuitement. Passez à Premium quand vous en avez besoin.',
    freeName:  'Gratuit',
    premName:  '⭐ Premium',
    price:     '€3/mois',
    popular:   'LE PLUS POPULAIRE',
    cta:       'Obtenir Premium →',
    backLabel: '← Retour au Planificateur',
    alreadyLabel:    'Vous avez déjà un abonnement ?',
    alreadyActivate: 'Activer →',
    freeFeats: ['✅ Planificateur 7 jours','✅ Liste de courses automatique','✅ 175 recettes de 70+ pays','✅ 14 langues','✅ 1 PDF complet/jour','✗ PDF complet 7 jours','✗ Menu hebdomadaire budgétaire','✗ Assistant recettes IA','✗ Coach nutrition IA'],
    premFeats: ['✅ Tout ce qui est dans Gratuit, plus :','✅ PDF complet 7 jours','✅ Menu hebdomadaire budgétaire','✅ Assistant recettes IA (chat)','✅ Coach nutrition IA','✅ Accès illimité, à tout moment','✅ Annulez quand vous voulez'],
    faqTitle:  'Questions fréquentes',
    faq: [
      ["Qu'inclut le plan Gratuit ?","Accès complet au planificateur 7 jours, liste de courses automatique, 175 recettes en 14 langues et 1 PDF par jour."],
      ['Que ajoute Premium ?',"Un PDF avec votre plan complet de 7 jours, un menu budgétaire, l'assistant recettes IA et le coach nutrition IA — tout illimité."],
      ['Comment fonctionne la facturation ?','€3/mois, facturé via Stripe. Vous pouvez annuler à tout moment depuis le portail client.'],
      ['Comment activer après le paiement ?','Retournez sur la page principale et entrez votre email dans la section "Déjà abonné ?". Votre statut premium sera vérifié instantanément.'],
      ['Est-il disponible dans ma langue ?','Oui — en 14 langues : français, anglais, roumain, espagnol, allemand, portugais, russe, arabe, chinois, japonais, hindi, turc, italien et coréen.']
    ]
  },
  de: {
    metaTitle: 'Preise – Kostenlos vs Premium | Meal-Planner.ro',
    metaDesc:  'Kostenlose und Premium-Pläne vergleichen. Unbegrenzte PDFs, KI-Rezept-Assistent, Wochenbudget-Menü — nur €3/Monat.',
    title:     'Einfache, transparente Preise',
    subtitle:  'Kostenlos starten. Upgraden wenn Sie mehr brauchen.',
    freeName:  'Kostenlos',
    premName:  '⭐ Premium',
    price:     '€3/Monat',
    popular:   'AM BELIEBTESTEN',
    cta:       'Premium holen →',
    backLabel: '← Zurück zum Planer',
    alreadyLabel:    'Haben Sie bereits ein Abonnement?',
    alreadyActivate: 'Aktivieren →',
    freeFeats: ['✅ 7-Tage-Mahlzeitenplaner','✅ Automatische Einkaufsliste','✅ 175 Rezepte aus 70+ Ländern','✅ 14 Sprachen','✅ 1 vollständiges PDF/Tag','✗ Vollständiges 7-Tage-PDF','✗ Wöchentliches Budget-Menü','✗ KI-Rezept-Assistent','✗ KI-Ernährungscoach'],
    premFeats: ['✅ Alles aus Kostenlos, plus:','✅ Vollständiges 7-Tage-PDF','✅ Wöchentliches Budget-Menü','✅ KI-Rezept-Assistent (Chat)','✅ KI-Ernährungscoach','✅ Unbegrenzter Zugang, jederzeit','✅ Jederzeit kündbar — keine Bindung'],
    faqTitle:  'Häufige Fragen',
    faq: [
      ['Was beinhaltet der kostenlose Plan?','Vollzugriff auf den 7-Tage-Planer, automatische Einkaufsliste, 175 Rezepte in 14 Sprachen und 1 PDF pro Tag.'],
      ['Was bietet Premium zusätzlich?','Ein vollständiges 7-Tage-PDF, ein Wochenbudget-Menü, den KI-Rezept-Assistenten und den KI-Ernährungscoach — alles unbegrenzt.'],
      ['Wie funktioniert die Abrechnung?','€3/Monat, abgerechnet über Stripe. Sie können jederzeit über das Kundenportal kündigen.'],
      ['Wie aktiviere ich nach der Zahlung?','Kehren Sie zur Startseite zurück und geben Sie Ihre E-Mail in den Bereich "Bereits abonniert?" ein. Ihr Premium-Status wird sofort überprüft.'],
      ['Ist es in meiner Sprache verfügbar?','Ja — in 14 Sprachen: Deutsch, Englisch, Rumänisch, Spanisch, Französisch, Portugiesisch, Russisch, Arabisch, Chinesisch, Japanisch, Hindi, Türkisch, Italienisch und Koreanisch.']
    ]
  },
  pt: {
    metaTitle: 'Preços – Gratuito vs Premium | Meal-Planner.ro',
    metaDesc:  'Compare os planos Gratuito e Premium. PDFs ilimitados, assistente de receitas IA, menu com orçamento — apenas €3/mês.',
    title:     'Preços simples e transparentes',
    subtitle:  'Comece gratuitamente. Faça upgrade quando precisar de mais.',
    freeName:  'Gratuito',
    premName:  '⭐ Premium',
    price:     '€3/mês',
    popular:   'MAIS POPULAR',
    cta:       'Obter Premium →',
    backLabel: '← Voltar ao Planejador',
    alreadyLabel:    'Já tem uma assinatura?',
    alreadyActivate: 'Ativar →',
    freeFeats: ['✅ Planejador de 7 dias','✅ Lista de compras automática','✅ 175 receitas de 70+ países','✅ 14 idiomas','✅ 1 PDF completo/dia','✗ PDF completo de 7 dias','✗ Menu semanal com orçamento','✗ Assistente de receitas IA','✗ Coach de nutrição IA'],
    premFeats: ['✅ Tudo no Gratuito, mais:','✅ PDF completo de 7 dias','✅ Menu semanal com orçamento','✅ Assistente de receitas IA (chat)','✅ Coach de nutrição IA','✅ Acesso ilimitado, a qualquer momento','✅ Cancele quando quiser'],
    faqTitle:  'Perguntas frequentes',
    faq: [
      ['O que inclui o plano Gratuito?','Acesso completo ao planejador de 7 dias, lista de compras automática, 175 receitas em 14 idiomas e 1 PDF por dia.'],
      ['O que o Premium adiciona?','Um PDF com o seu plano completo de 7 dias, menu semanal com orçamento, assistente de receitas IA e coach de nutrição IA — tudo ilimitado.'],
      ['Como funciona a cobrança?','€3/mês, cobrado via Stripe. Você pode cancelar a qualquer momento pelo portal do cliente.'],
      ['Como ativo após o pagamento?','Volte à página principal e insira seu email na seção "Já assinante?". Seu status premium será verificado instantaneamente.'],
      ['Está disponível no meu idioma?','Sim — em 14 idiomas: português, inglês, romeno, espanhol, francês, alemão, russo, árabe, chinês, japonês, hindi, turco, italiano e coreano.']
    ]
  },
  ru: {
    metaTitle: 'Цены – Бесплатно vs Премиум | Meal-Planner.ro',
    metaDesc:  'Сравните бесплатный и премиум-планы. Неограниченные PDF, ИИ-помощник по рецептам, недельное меню — всего €3/мес.',
    title:     'Простые и честные цены',
    subtitle:  'Начните бесплатно. Переходите на Premium, когда нужно больше.',
    freeName:  'Бесплатно',
    premName:  '⭐ Премиум',
    price:     '€3/мес',
    popular:   'САМЫЙ ПОПУЛЯРНЫЙ',
    cta:       'Получить Premium →',
    backLabel: '← Вернуться к планировщику',
    alreadyLabel:    'Уже есть подписка?',
    alreadyActivate: 'Активировать →',
    freeFeats: ['✅ Планировщик на 7 дней','✅ Автоматический список покупок','✅ 175 рецептов из 70+ стран','✅ 14 языков','✅ 1 полный PDF/день','✗ Полный PDF на 7 дней','✗ Недельное бюджетное меню','✗ ИИ-помощник по рецептам','✗ ИИ-тренер по питанию'],
    premFeats: ['✅ Всё из Бесплатного, плюс:','✅ Полный PDF на 7 дней','✅ Недельное бюджетное меню','✅ ИИ-помощник по рецептам (чат)','✅ ИИ-тренер по питанию','✅ Неограниченный доступ в любое время','✅ Отмена в любой момент'],
    faqTitle:  'Часто задаваемые вопросы',
    faq: [
      ['Что включает бесплатный план?','Полный доступ к 7-дневному планировщику, автоматический список покупок, 175 рецептов на 14 языках и 1 PDF в день.'],
      ['Что добавляет Premium?','PDF со всем 7-дневным планом, недельное бюджетное меню, ИИ-помощник по рецептам и ИИ-тренер по питанию — всё без ограничений.'],
      ['Как работает оплата?','€3/мес, оплата через Stripe. Вы можете отменить в любое время в личном кабинете.'],
      ['Как активировать после оплаты?','Вернитесь на главную страницу и введите email в разделе "Уже подписчик?". Ваш премиум-статус будет проверен мгновенно.'],
      ['Доступен ли он на моём языке?','Да — на 14 языках: русский, английский, румынский, испанский, французский, португальский, немецкий, арабский, китайский, японский, хинди, турецкий, итальянский и корейский.']
    ]
  },
  ar: {
    metaTitle: 'الأسعار – مجاني مقابل بريميوم | Meal-Planner.ro',
    metaDesc:  'قارن بين الخطة المجانية وبريميوم. PDFs غير محدودة، مساعد وصفات بالذكاء الاصطناعي، قائمة طعام أسبوعية — فقط €3/شهر.',
    title:     'أسعار بسيطة وشفافة',
    subtitle:  'ابدأ مجاناً. قم بالترقية عندما تحتاج المزيد.',
    freeName:  'مجاني',
    premName:  '⭐ بريميوم',
    price:     '€3/شهر',
    popular:   'الأكثر شعبية',
    cta:       'احصل على بريميوم ←',
    backLabel: 'العودة إلى المخطط ←',
    alreadyLabel:    'لديك اشتراك بالفعل؟',
    alreadyActivate: 'تفعيل ←',
    freeFeats: ['✅ مخطط وجبات لمدة 7 أيام','✅ قائمة تسوق تلقائية','✅ 175 وصفة من 70+ دولة','✅ 14 لغة','✅ ملف PDF واحد كامل/يوم','✗ ملف PDF كامل لمدة 7 أيام','✗ قائمة طعام أسبوعية بالميزانية','✗ مساعد وصفات بالذكاء الاصطناعي','✗ مدرب تغذية بالذكاء الاصطناعي'],
    premFeats: ['✅ كل ما في المجاني، بالإضافة إلى:','✅ ملف PDF كامل لمدة 7 أيام','✅ قائمة طعام أسبوعية بالميزانية','✅ مساعد وصفات بالذكاء الاصطناعي (دردشة)','✅ مدرب تغذية بالذكاء الاصطناعي','✅ وصول غير محدود في أي وقت','✅ إلغاء في أي وقت'],
    faqTitle:  'الأسئلة الشائعة',
    faq: [
      ['ماذا يتضمن الخطة المجانية؟','وصول كامل إلى مخطط 7 أيام، قائمة تسوق تلقائية، 175 وصفة بـ14 لغة وملف PDF واحد يومياً.'],
      ['ماذا يضيف بريميوم؟','ملف PDF بخطتك الكاملة لـ7 أيام، قائمة طعام أسبوعية بالميزانية، مساعد الوصفات ومدرب التغذية — كل ذلك بلا حدود.'],
      ['كيف يعمل الفوترة؟','€3/شهر، مدفوع عبر Stripe. يمكنك الإلغاء في أي وقت من بوابة العملاء.'],
      ['كيف أُفعّل بعد الدفع؟','ارجع إلى الصفحة الرئيسية وأدخل بريدك الإلكتروني في قسم "مشترك بالفعل؟". سيتم التحقق من حالتك الممتازة فوراً.'],
      ['هل هو متاح بلغتي؟','نعم — بـ14 لغة: العربية، الإنجليزية، الرومانية، الإسبانية، الفرنسية، البرتغالية، الروسية، الصينية، اليابانية، الهندية، التركية، الإيطالية والكورية.']
    ]
  },
  zh: {
    metaTitle: '定价 – 免费版 vs 高级版 | Meal-Planner.ro',
    metaDesc:  '比较免费版和高级版。无限PDF下载、AI食谱助手、每周预算菜单 — 仅需€3/月。',
    title:     '简单透明的定价',
    subtitle:  '免费开始，需要更多时升级。',
    freeName:  '免费版',
    premName:  '⭐ 高级版',
    price:     '€3/月',
    popular:   '最受欢迎',
    cta:       '获取高级版 →',
    backLabel: '← 返回饮食计划器',
    alreadyLabel:    '已有订阅？',
    alreadyActivate: '激活 →',
    freeFeats: ['✅ 7天饮食计划器','✅ 自动购物清单','✅ 175道来自70+国家的食谱','✅ 14种语言','✅ 每天1个完整PDF','✗ 完整7天PDF下载','✗ 每周预算菜单','✗ AI食谱助手','✗ AI营养教练'],
    premFeats: ['✅ 免费版所有功能，另加：','✅ 完整7天PDF下载','✅ 每周预算菜单','✅ AI食谱助手（聊天）','✅ AI营养教练','✅ 随时无限访问','✅ 随时取消，无承诺'],
    faqTitle:  '常见问题',
    faq: [
      ['免费版包含什么？','完整访问7天计划器、自动购物清单、14种语言的175道食谱以及每天1个PDF下载。'],
      ['高级版增加了什么？','包含您完整7天计划的PDF、每周预算菜单、AI食谱聊天助手和AI营养教练 — 全部无限次使用。'],
      ['如何计费？','每月€3，通过Stripe付款。您可以随时通过客户门户取消。'],
      ['付款后如何激活？','返回主页，在"已订阅？"部分输入您的电子邮件。您的高级状态将立即得到验证。'],
      ['支持我的语言吗？','是的 — 支持14种语言：中文、英语、罗马尼亚语、西班牙语、法语、葡萄牙语、俄语、阿拉伯语、日语、印地语、土耳其语、意大利语和韩语。']
    ]
  },
  ja: {
    metaTitle: '料金プラン – 無料 vs プレミアム | Meal-Planner.ro',
    metaDesc:  '無料プランとプレミアムプランを比較。無制限PDF、AIレシピアシスタント、週次予算メニュー — わずか€3/月。',
    title:     'シンプルで明確な料金',
    subtitle:  '無料で始めて、必要なときにアップグレード。',
    freeName:  '無料',
    premName:  '⭐ プレミアム',
    price:     '€3/月',
    popular:   '最も人気',
    cta:       'プレミアムを取得 →',
    backLabel: '← ミールプランナーに戻る',
    alreadyLabel:    'すでにサブスクリプションをお持ちですか？',
    alreadyActivate: '有効化 →',
    freeFeats: ['✅ 7日間ミールプランナー','✅ 自動買い物リスト','✅ 70カ国以上の175レシピ','✅ 14言語','✅ 1日1つの完全PDF','✗ 7日間完全PDFダウンロード','✗ 週次予算メニュー','✗ AIレシピアシスタント','✗ AI栄養コーチ'],
    premFeats: ['✅ 無料版のすべて、さらに：','✅ 7日間完全PDFダウンロード','✅ 週次予算メニュー','✅ AIレシピアシスタント（チャット）','✅ AI栄養コーチ','✅ いつでも無制限アクセス','✅ いつでもキャンセル可能'],
    faqTitle:  'よくある質問',
    faq: [
      ['無料プランには何が含まれますか？','7日間プランナー、自動買い物リスト、14言語の175レシピ、1日1つのPDFダウンロードへの完全アクセス。'],
      ['プレミアムは何を追加しますか？','7日間完全PDF、週次予算メニュー、AIレシピチャットアシスタント、AI栄養コーチ — すべて無制限。'],
      ['請求はどのように機能しますか？','月額€3、Stripe経由で請求。カスタマーポータルからいつでもキャンセルできます。'],
      ['支払い後のアクティベート方法は？','ホームページに戻り、「すでに登録済みですか？」セクションにメールアドレスを入力してください。プレミアムステータスが即時確認されます。'],
      ['自分の言語で利用できますか？','はい — 14言語対応：日本語、英語、ルーマニア語、スペイン語、フランス語、ドイツ語、ポルトガル語、ロシア語、アラビア語、中国語、ヒンディー語、トルコ語、イタリア語、韓国語。']
    ]
  },
  hi: {
    metaTitle: 'मूल्य निर्धारण – निःशुल्क बनाम प्रीमियम | Meal-Planner.ro',
    metaDesc:  'निःशुल्क और प्रीमियम योजनाओं की तुलना करें। असीमित PDF, AI रेसिपी सहायक, साप्ताहिक बजट मेनू — केवल €3/माह।',
    title:     'सरल और पारदर्शी मूल्य',
    subtitle:  'निःशुल्क शुरू करें। जब आपको अधिक की आवश्यकता हो तो अपग्रेड करें।',
    freeName:  'निःशुल्क',
    premName:  '⭐ प्रीमियम',
    price:     '€3/माह',
    popular:   'सबसे लोकप्रिय',
    cta:       'प्रीमियम पाएं →',
    backLabel: '← मील प्लानर पर वापस',
    alreadyLabel:    'पहले से सदस्यता है?',
    alreadyActivate: 'सक्रिय करें →',
    freeFeats: ['✅ 7-दिन का मील प्लानर','✅ स्वचालित खरीदारी सूची','✅ 70+ देशों से 175 रेसिपी','✅ 14 भाषाएं','✅ 1 पूर्ण PDF/दिन','✗ 7-दिन का पूर्ण PDF डाउनलोड','✗ साप्ताहिक बजट मेनू','✗ AI रेसिपी सहायक','✗ AI पोषण कोच'],
    premFeats: ['✅ निःशुल्क में सब कुछ, साथ ही:','✅ 7-दिन का पूर्ण PDF डाउनलोड','✅ साप्ताहिक बजट मेनू','✅ AI रेसिपी सहायक (चैट)','✅ AI पोषण कोच','✅ कभी भी असीमित पहुंच','✅ कभी भी रद्द करें'],
    faqTitle:  'अक्सर पूछे जाने वाले प्रश्न',
    faq: [
      ['निःशुल्क योजना में क्या शामिल है?','7-दिन के प्लानर, स्वचालित खरीदारी सूची, 14 भाषाओं में 175 रेसिपी और प्रतिदिन 1 PDF डाउनलोड तक पूर्ण पहुंच।'],
      ['प्रीमियम क्या जोड़ता है?','आपके 7-दिन के पूर्ण प्लान के साथ PDF, साप्ताहिक बजट मेनू, AI रेसिपी चैट सहायक और AI पोषण कोच — सभी असीमित।'],
      ['बिलिंग कैसे काम करती है?','€3/माह, Stripe के माध्यम से बिल किया जाता है। आप ग्राहक पोर्टल से कभी भी रद्द कर सकते हैं।'],
      ['भुगतान के बाद सक्रिय कैसे करें?','होमपेज पर वापस जाएं और "पहले से सदस्यता है?" अनुभाग में अपना ईमेल दर्ज करें। आपकी प्रीमियम स्थिति तुरंत सत्यापित हो जाएगी।'],
      ['क्या यह मेरी भाषा में उपलब्ध है?','हां — 14 भाषाओं में: हिंदी, अंग्रेजी, रोमानियाई, स्पेनिश, फ्रेंच, जर्मन, पुर्तगाली, रूसी, अरबी, चीनी, जापानी, तुर्की, इतालवी और कोरियाई।']
    ]
  },
  tr: {
    metaTitle: 'Fiyatlar – Ücretsiz vs Premium | Meal-Planner.ro',
    metaDesc:  'Ücretsiz ve Premium planları karşılaştırın. Sınırsız PDF, AI tarif asistanı, haftalık bütçe menüsü — sadece €3/ay.',
    title:     'Basit ve şeffaf fiyatlar',
    subtitle:  'Ücretsiz başlayın. Daha fazlasına ihtiyaç duyduğunuzda yükseltin.',
    freeName:  'Ücretsiz',
    premName:  '⭐ Premium',
    price:     '€3/ay',
    popular:   'EN POPÜLER',
    cta:       'Premium Edinin →',
    backLabel: '← Yemek Planlayıcıya Dön',
    alreadyLabel:    'Zaten aboneliğiniz var mı?',
    alreadyActivate: 'Etkinleştir →',
    freeFeats: ['✅ 7 günlük yemek planlayıcı','✅ Otomatik alışveriş listesi','✅ 70+ ülkeden 175 tarif','✅ 14 dil','✅ Günde 1 tam PDF','✗ 7 günlük tam PDF indirme','✗ Haftalık bütçe menüsü','✗ AI tarif asistanı','✗ AI beslenme koçu'],
    premFeats: ['✅ Ücretsiz\'deki her şey, artı:','✅ 7 günlük tam PDF indirme','✅ Haftalık bütçe menüsü','✅ AI tarif asistanı (sohbet)','✅ AI beslenme koçu','✅ İstediğiniz zaman sınırsız erişim','✅ İstediğiniz zaman iptal edin'],
    faqTitle:  'Sıkça sorulan sorular',
    faq: [
      ['Ücretsiz plan neleri içerir?','7 günlük planlayıcı, otomatik alışveriş listesi, 14 dilde 175 tarif ve günde 1 PDF indirmeye tam erişim.'],
      ['Premium ne ekler?','7 günlük tam planınızı içeren PDF, haftalık bütçe menüsü, AI tarif sohbet asistanı ve AI beslenme koçu — hepsi sınırsız.'],
      ['Faturalandırma nasıl çalışır?','Ayda €3, Stripe üzerinden faturalandırılır. Müşteri portalından istediğiniz zaman iptal edebilirsiniz.'],
      ['Ödemeden sonra nasıl etkinleştiririm?','Ana sayfaya dönün ve "Zaten abone misiniz?" bölümüne e-postanızı girin. Premium durumunuz anında doğrulanacak.'],
      ['Dilimde mevcut mu?','Evet — 14 dilde: Türkçe, İngilizce, Romence, İspanyolca, Fransızca, Almanca, Portekizce, Rusça, Arapça, Çince, Japonca, Hintçe, İtalyanca ve Korece.']
    ]
  },
  it: {
    metaTitle: 'Prezzi – Gratuito vs Premium | Meal-Planner.ro',
    metaDesc:  'Confronta i piani Gratuito e Premium. PDF illimitati, assistente ricette IA, menu settimanale con budget — solo €3/mese.',
    title:     'Prezzi semplici e trasparenti',
    subtitle:  'Inizia gratis. Passa a Premium quando ne hai bisogno.',
    freeName:  'Gratuito',
    premName:  '⭐ Premium',
    price:     '€3/mese',
    popular:   'PIÙ POPOLARE',
    cta:       'Ottieni Premium →',
    backLabel: '← Torna al Pianificatore',
    alreadyLabel:    'Hai già un abbonamento?',
    alreadyActivate: 'Attiva →',
    freeFeats: ['✅ Pianificatore 7 giorni','✅ Lista della spesa automatica','✅ 175 ricette da 70+ paesi','✅ 14 lingue','✅ 1 PDF completo/giorno','✗ PDF completo 7 giorni','✗ Menu settimanale con budget','✗ Assistente ricette IA','✗ Coach nutrizione IA'],
    premFeats: ['✅ Tutto nel Gratuito, più:','✅ PDF completo 7 giorni','✅ Menu settimanale con budget','✅ Assistente ricette IA (chat)','✅ Coach nutrizione IA','✅ Accesso illimitato, in qualsiasi momento','✅ Disdici quando vuoi'],
    faqTitle:  'Domande frequenti',
    faq: [
      ['Cosa include il piano Gratuito?','Accesso completo al pianificatore di 7 giorni, lista della spesa automatica, 175 ricette in 14 lingue e 1 PDF al giorno.'],
      ['Cosa aggiunge Premium?','Un PDF con il tuo piano completo di 7 giorni, menu settimanale con budget, assistente ricette IA e coach nutrizione IA — tutto illimitato.'],
      ['Come funziona la fatturazione?','€3/mese, fatturato tramite Stripe. Puoi annullare in qualsiasi momento dal portale clienti.'],
      ['Come attivo dopo il pagamento?','Torna alla homepage e inserisci la tua email nella sezione "Già abbonato?". Il tuo stato premium verrà verificato istantaneamente.'],
      ['È disponibile nella mia lingua?','Sì — in 14 lingue: italiano, inglese, rumeno, spagnolo, francese, tedesco, portoghese, russo, arabo, cinese, giapponese, hindi, turco e coreano.']
    ]
  },
  ko: {
    metaTitle: '요금제 – 무료 vs 프리미엄 | Meal-Planner.ro',
    metaDesc:  '무료 및 프리미엄 플랜을 비교하세요. 무제한 PDF, AI 레시피 도우미, 주간 예산 메뉴 — 월 €3만으로.',
    title:     '간단하고 투명한 요금제',
    subtitle:  '무료로 시작하고, 더 필요할 때 업그레이드하세요.',
    freeName:  '무료',
    premName:  '⭐ 프리미엄',
    price:     '€3/월',
    popular:   '가장 인기 있는',
    cta:       '프리미엄 구독 →',
    backLabel: '← 식단 플래너로 돌아가기',
    alreadyLabel:    '이미 구독 중이신가요?',
    alreadyActivate: '활성화 →',
    freeFeats: ['✅ 7일 식단 플래너','✅ 자동 쇼핑 목록','✅ 70개국 이상 175가지 레시피','✅ 14개 언어','✅ 하루 1개 전체 PDF','✗ 7일 전체 PDF 다운로드','✗ 주간 예산 메뉴','✗ AI 레시피 도우미','✗ AI 영양 코치'],
    premFeats: ['✅ 무료의 모든 것, 추가로:','✅ 7일 전체 PDF 다운로드','✅ 주간 예산 메뉴','✅ AI 레시피 도우미 (채팅)','✅ AI 영양 코치','✅ 언제든지 무제한 액세스','✅ 언제든지 취소 가능'],
    faqTitle:  '자주 묻는 질문',
    faq: [
      ['무료 플랜에는 무엇이 포함되나요?','7일 플래너, 자동 쇼핑 목록, 14개 언어로 된 175가지 레시피, 하루 1개 PDF 다운로드에 대한 전체 액세스.'],
      ['프리미엄은 무엇을 추가하나요?','7일 전체 플랜이 담긴 PDF, 주간 예산 메뉴, AI 레시피 채팅 도우미, AI 영양 코치 — 모두 무제한.'],
      ['청구는 어떻게 되나요?','월 €3, Stripe를 통해 청구됩니다. 고객 포털에서 언제든지 취소할 수 있습니다.'],
      ['결제 후 어떻게 활성화하나요?','홈페이지로 돌아가서 "이미 구독 중이신가요?" 섹션에 이메일을 입력하세요. 프리미엄 상태가 즉시 확인됩니다.'],
      ['제 언어로 이용 가능한가요?','네 — 14개 언어: 한국어, 영어, 루마니아어, 스페인어, 프랑스어, 독일어, 포르투갈어, 러시아어, 아랍어, 중국어, 일본어, 힌디어, 터키어, 이탈리아어.']
    ]
  }
};

// Language display names for the pricing page language switcher
const PRICING_LANG_NAMES = {
  ro:'Română', en:'English', es:'Español', fr:'Français', de:'Deutsch',
  pt:'Português', ru:'Русский', ar:'العربية', zh:'中文', ja:'日本語',
  hi:'हिन्दी', tr:'Türkçe', it:'Italiano', ko:'한국어'
};

// Pricing-specific nav: extends makeNav with ⭐ Premium active link + language switcher
function makePricingNav(lc_code) {
  const lc = LANG_CONFIGS[lc_code];
  const pricingHref = `/${lc_code}/${PRICING_SLUGS[lc_code]}/`;
  const options = Object.entries(PRICING_SLUGS)
    .map(([code, sl]) =>
      `<option value="/${code}/${sl}/"${code === lc_code ? ' selected' : ''}>${PRICING_LANG_NAMES[code]}</option>`
    ).join('');
  return `<header class="app-header no-print" role="banner">
  <nav class="app-nav" aria-label="Main navigation">
    <a class="nav-brand" href="/" aria-label="Meal-Planner.ro – home">
      <span class="nav-icon" aria-hidden="true">🥗</span>
      <span class="nav-title">Meal-Planner<span class="nav-tld">.ro</span></span>
    </a>
    <div class="nav-links">
      <a href="${lc.dir}/" class="nav-link">${lc.sectionLabel}</a>
      <a href="${RECIPES_NAV[lc_code].href}" class="nav-link">${RECIPES_NAV[lc_code].label}</a>
      <a href="${pricingHref}" class="nav-link nav-link--active" aria-current="page">⭐ Premium</a>
    </div>
    <div class="nav-lang">
      <label class="visually-hidden" for="pricing-lang-${lc_code}">Select language</label>
      <select id="pricing-lang-${lc_code}" class="lang-select" aria-label="Select language" onchange="location.href=this.value">
        ${options}
      </select>
    </div>
  </nav>
</header>`;
}

// Build hreflang block for all pricing pages
const PRICING_HREFLANGS = Object.entries(PRICING_SLUGS)
  .map(([lc, sl]) => `  <link rel="alternate" hreflang="${lc}" href="https://meal-planner.ro/${lc}/${sl}/" />`)
  .join('\n');
const PRICING_HREFLANGS_FULL = `  <link rel="alternate" hreflang="x-default" href="https://meal-planner.ro/pricing/" />\n${PRICING_HREFLANGS}`;

function pricingPage(lc_code) {
  const lc  = LANG_CONFIGS[lc_code];
  const cp  = PRICING_COPY[lc_code];
  const sl  = PRICING_SLUGS[lc_code];
  const dir_attr = lc.dir_attr || 'ltr';
  const canonical = `https://meal-planner.ro/${lc_code}/${sl}/`;

  const freeRows  = cp.freeFeats.map(f => `            <li class="${f.startsWith('✗') ? 'feat-no' : ''}">${f}</li>`).join('\n');
  const premRows  = cp.premFeats.map(f => `            <li>${f}</li>`).join('\n');
  const faqRows   = cp.faq.map(([q, a]) => `        <div class="faq-item">
          <dt>${q}</dt>
          <dd>${a}</dd>
        </div>`).join('\n');

  return `<!DOCTYPE html>
<html lang="${lc_code}" dir="${dir_attr}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${cp.metaTitle}</title>
  <meta name="description" content="${cp.metaDesc}" />
  <link rel="canonical" href="${canonical}" />
${PRICING_HREFLANGS_FULL}

  <!-- OG -->
  <meta property="og:type"        content="website" />
  <meta property="og:title"       content="${cp.metaTitle}" />
  <meta property="og:description" content="${cp.metaDesc}" />
  <meta property="og:url"         content="${canonical}" />
  <meta property="og:image"       content="https://meal-planner.ro/images/cover2.jpg" />

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml"  href="/images/favicon.svg">
  <link rel="icon" type="image/x-icon"  href="/images/favicon.ico">
  <link rel="apple-touch-icon"          href="/images/apple-touch-icon.png">
  <link rel="manifest"                  href="/images/site.webmanifest">

  <!-- Preconnect -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>

  <!-- Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

  <!-- Bootstrap + Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet" />

  <!-- App styles -->
  <link rel="stylesheet" href="/css/style.min.css">

  <!-- JSON-LD: Product with pricing offers -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Meal-Planner.ro Premium",
    "description": "${cp.metaDesc.replace(/"/g, '\\"')}",
    "url": "${canonical}",
    "image": "https://meal-planner.ro/images/cover2.jpg",
    "brand": { "@type": "Brand", "name": "Meal-Planner.ro" },
    "offers": [
      {
        "@type": "Offer",
        "name": "${cp.freeName}",
        "price": "0",
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "${cp.premName}",
        "price": "3",
        "priceCurrency": "EUR",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "3",
          "priceCurrency": "EUR",
          "unitCode": "MON"
        },
        "availability": "https://schema.org/InStock"
      }
    ]
  }
  </script>

  <style>
    .pricing-page-hero { text-align: center; padding: 56px 20px 32px; }
    .pricing-page-hero h1 { font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 800; margin-bottom: 12px; color: var(--text-primary, #1a1a2e); }
    .pricing-page-hero p { font-size: 1.1rem; color: var(--text-secondary, #555); max-width: 480px; margin: 0 auto 8px; }
    .pricing-page-wrap { max-width: 860px; margin: 0 auto; padding: 0 16px 64px; }
    .pricing-faq { margin-top: 48px; padding-top: 32px; border-top: 1px solid #eee; }
    .pricing-faq h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 20px; text-align: center; }
    .faq-item { margin-bottom: 20px; }
    .faq-item dt { font-weight: 600; margin-bottom: 4px; }
    .faq-item dd { margin: 0; color: #555; font-size: 0.95rem; }
    .pricing-back { text-align: center; margin-top: 36px; font-size: 0.9rem; color: #888; }
    .pricing-back a { color: var(--accent, #4e8a5e); }
    .nav-link--active { font-weight: 700; color: var(--accent, #4e8a5e) !important; }
    .access-mini { background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px 24px; margin-top: 32px; text-align: center; }
    .access-mini p { margin-bottom: 12px; color: #555; font-size: 0.95rem; }
    .access-mini-form { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
    .access-mini-form input { padding: 8px 14px; border: 1px solid #ccc; border-radius: 8px; font-size: 0.95rem; min-width: 220px; }
  </style>
</head>

<body>

  ${makePricingNav(lc_code)}

  <!-- HERO -->
  <div class="pricing-page-hero">
    <h1>${cp.title}</h1>
    <p>${cp.subtitle}</p>
  </div>

  <!-- PRICING CARDS -->
  <div class="pricing-page-wrap">
    <div class="pricing-inner">
      <div class="pricing-cards-row">

        <!-- FREE -->
        <div class="pricing-card pricing-card--free">
          <div class="pcard-name">${cp.freeName}</div>
          <div class="pcard-price-block">
            <span class="pcard-price">0</span>
            <span class="pcard-sub">/${cp.price.split('/')[1]}</span>
          </div>
          <ul class="pcard-features">
${freeRows}
          </ul>
        </div>

        <!-- PREMIUM -->
        <div class="pricing-card pricing-card--premium">
          <div class="pcard-popular">${cp.popular}</div>
          <div class="pcard-name">${cp.premName}</div>
          <div class="pcard-price-block">
            <span class="pcard-price">${cp.price}</span>
          </div>
          <ul class="pcard-features">
${premRows}
          </ul>
          <button class="btn btn-upgrade pcard-cta" id="pay-btn" type="button">${cp.cta}</button>
          <p class="pcard-already">
            <a href="/#access-card">${cp.alreadyLabel}</a>
          </p>
        </div>

      </div>
    </div>

    <!-- Already subscribed mini-form -->
    <div class="access-mini">
      <p><i class="bi bi-gem"></i> <strong>${cp.alreadyLabel}</strong></p>
      <div class="access-mini-form">
        <input type="email" id="emailInput" placeholder="your@email.com" autocomplete="email" aria-label="Email" />
        <a href="/#access-card" class="btn btn-verify">${cp.alreadyActivate}</a>
      </div>
    </div>

    <!-- FAQ -->
    <div class="pricing-faq">
      <h2>${cp.faqTitle}</h2>
      <dl>
${faqRows}
      </dl>
    </div>

    <div class="pricing-back">
      <a href="${appHref(lc)}">${cp.backLabel}</a>
    </div>

  </div>

  ${makeFooter(lc)}

  <script src="/js/checkout.min.js" defer></script>
</body>
</html>`;
}

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
    "publisher":{"@type":"Organization","name":"Meal-Planner.ro","url":"https://meal-planner.ro"}
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
  ro: { dir:'/ro/retete',    indexTitle:'Rețete din Toată Lumea | Meal-Planner.ro',
        indexH1:'Rețete din <span class="accent">Toată Lumea</span>',
        indexDesc: n=>`${n} rețete cu ingrediente și mod de preparare.`,
        breadHome:'Acasă', breadLabel:'Rețete',
        ingredientsH:'🛒 Ingrediente', howToH:'👨‍🍳 Mod de preparare',
        addBtn: n=>`Adaugă în planul meu`, relatedH: o=>`Alte rețete din ${esc(o)}`,
        seoP: n=>`Adaugă <strong>${esc(n)}</strong> în planul tău săptămânal cu <a href="/ro/">Meal-Planner.ro</a>.`,
        pageTitle: n=>`Rețetă ${esc(n)} – Ingrediente și Mod de Preparare | Meal-Planner.ro`,
        pageDesc: (n,o)=>`Rețeta de ${n}: ingrediente, mod de preparare pas cu pas. Adaugă în planificator gratuit.`,
        heroDesc: o=>`Rețetă din <strong>${esc(o)}</strong>. Ingrediente proaspete, preparare simplă.`,
        appDir:'/ro', lc: null },
  en: { dir:'/en/recipes',   indexTitle:`Recipes from Around the World | Meal-Planner.ro`,
        indexH1:'Recipes from <span class="accent">Around the World</span>',
        indexDesc: n=>`${n} recipes with ingredients and instructions.`,
        breadHome:'Home', breadLabel:'Recipes',
        ingredientsH:'🛒 Ingredients', howToH:'👨‍🍳 How to make it',
        addBtn: n=>`Add to my meal plan`, relatedH: o=>`More recipes from ${esc(o)}`,
        seoP: n=>`Add <strong>${esc(n)}</strong> to your weekly plan with the <a href="/en/">free Meal-Planner.ro app</a>.`,
        pageTitle: n=>`${esc(n)} Recipe – Ingredients & How to Make | Meal-Planner.ro`,
        pageDesc: (n,o)=>`${n} recipe: ingredients, step-by-step instructions. Add to your free meal planner.`,
        heroDesc: o=>`Traditional recipe from <strong>${esc(o)}</strong>.`,
        appDir:'/en', lc: null },
  es: { dir:'/es/recetas',   indexTitle:`Recetas del Mundo | Meal-Planner.ro`,
        indexH1:'Recetas del <span class="accent">Mundo</span>',
        indexDesc: n=>`${n} recetas con ingredientes e instrucciones.`,
        breadHome:'Inicio', breadLabel:'Recetas',
        ingredientsH:'🛒 Ingredientes', howToH:'👨‍🍳 Cómo prepararlo',
        addBtn: n=>`Añadir a mi plan`, relatedH: o=>`Más recetas de ${esc(o)}`,
        seoP: n=>`Añade <strong>${esc(n)}</strong> a tu plan semanal con <a href="/es/">Meal-Planner.ro</a>.`,
        pageTitle: n=>`Receta de ${esc(n)} – Ingredientes y Preparación | Meal-Planner.ro`,
        pageDesc: (n,o)=>`Receta de ${n} de ${o}: ingredientes e instrucciones paso a paso.`,
        heroDesc: o=>`Receta tradicional de <strong>${esc(o)}</strong>.`,
        appDir:'', lc: null },
  fr: { dir:'/fr/recettes',  indexTitle:`Recettes du Monde | Meal-Planner.ro`,
        indexH1:'Recettes du <span class="accent">Monde</span>',
        indexDesc: n=>`${n} recettes avec ingrédients et instructions.`,
        breadHome:'Accueil', breadLabel:'Recettes',
        ingredientsH:'🛒 Ingrédients', howToH:'👨‍🍳 Comment préparer',
        addBtn: n=>`Ajouter à mon plan`, relatedH: o=>`Plus de recettes de ${esc(o)}`,
        seoP: n=>`Ajoutez <strong>${esc(n)}</strong> à votre plan hebdomadaire avec <a href="/fr/">Meal-Planner.ro</a>.`,
        pageTitle: n=>`Recette ${esc(n)} – Ingrédients et Préparation | Meal-Planner.ro`,
        pageDesc: (n,o)=>`Recette de ${n} de ${o}: ingrédients et instructions étape par étape.`,
        heroDesc: o=>`Recette traditionnelle de <strong>${esc(o)}</strong>.`,
        appDir:'', lc: null },
  de: { dir:'/de/rezepte',   indexTitle:`Rezepte aus aller Welt | Meal-Planner.ro`,
        indexH1:'Rezepte aus <span class="accent">aller Welt</span>',
        indexDesc: n=>`${n} Rezepte mit Zutaten und Anleitung.`,
        breadHome:'Startseite', breadLabel:'Rezepte',
        ingredientsH:'🛒 Zutaten', howToH:'👨‍🍳 Zubereitung',
        addBtn: n=>`Zu meinem Plan hinzufügen`, relatedH: o=>`Weitere Rezepte aus ${esc(o)}`,
        seoP: n=>`Füge <strong>${esc(n)}</strong> zu deinem Wochenplan mit <a href="/de/">Meal-Planner.ro</a> hinzu.`,
        pageTitle: n=>`${esc(n)} Rezept – Zutaten & Zubereitung | Meal-Planner.ro`,
        pageDesc: (n,o)=>`${n} Rezept aus ${o}: Zutaten und Schritt-für-Schritt-Anleitung.`,
        heroDesc: o=>`Traditionelles Rezept aus <strong>${esc(o)}</strong>.`,
        appDir:'', lc: null },
  pt: { dir:'/pt/receitas',  indexTitle:`Receitas do Mundo | Meal-Planner.ro`,
        indexH1:'Receitas do <span class="accent">Mundo</span>',
        indexDesc: n=>`${n} receitas com ingredientes e instruções.`,
        breadHome:'Início', breadLabel:'Receitas',
        ingredientsH:'🛒 Ingredientes', howToH:'👨‍🍳 Como preparar',
        addBtn: n=>`Adicionar ao meu plano`, relatedH: o=>`Mais receitas de ${esc(o)}`,
        seoP: n=>`Adicione <strong>${esc(n)}</strong> ao seu plano semanal com <a href="/pt/">Meal-Planner.ro</a>.`,
        pageTitle: n=>`Receita de ${esc(n)} – Ingredientes e Preparo | Meal-Planner.ro`,
        pageDesc: (n,o)=>`Receita de ${n} de ${o}: ingredientes e instruções passo a passo.`,
        heroDesc: o=>`Receita tradicional de <strong>${esc(o)}</strong>.`,
        appDir:'', lc: null },
  ru: { dir:'/ru/retsepty',  indexTitle:`Рецепты со всего мира | Meal-Planner.ro`,
        indexH1:'Рецепты со <span class="accent">всего мира</span>',
        indexDesc: n=>`${n} рецептов с ингредиентами и инструкциями.`,
        breadHome:'Главная', breadLabel:'Рецепты',
        ingredientsH:'🛒 Ингредиенты', howToH:'👨‍🍳 Как приготовить',
        addBtn: n=>`Добавить в мой план`, relatedH: o=>`Ещё рецепты из ${esc(o)}`,
        seoP: n=>`Добавьте <strong>${esc(n)}</strong> в свой план на неделю с <a href="/ru/">Meal-Planner.ro</a>.`,
        pageTitle: n=>`Рецепт ${esc(n)} – Ингредиенты и приготовление | Meal-Planner.ro`,
        pageDesc: (n,o)=>`Рецепт ${n} из ${o}: ингредиенты и пошаговые инструкции.`,
        heroDesc: o=>`Традиционный рецепт из <strong>${esc(o)}</strong>.`,
        appDir:'', lc: null },
  ar: { dir:'/ar/wasafat',   indexTitle:`وصفات من حول العالم | Meal-Planner.ro`,
        indexH1:'وصفات من <span class="accent">حول العالم</span>',
        indexDesc: n=>`${n} وصفة مع المكونات والتعليمات.`,
        breadHome:'الرئيسية', breadLabel:'وصفات',
        ingredientsH:'🛒 المكونات', howToH:'👨‍🍳 طريقة التحضير',
        addBtn: n=>`أضف إلى خطتي`, relatedH: o=>`المزيد من وصفات ${esc(o)}`,
        seoP: n=>`أضف <strong>${esc(n)}</strong> إلى خطتك الأسبوعية مع <a href="/ar/">Meal-Planner.ro</a>.`,
        pageTitle: n=>`وصفة ${esc(n)} – المكونات وطريقة التحضير | Meal-Planner.ro`,
        pageDesc: (n,o)=>`وصفة ${n} من ${o}: مكونات وتعليمات خطوة بخطوة.`,
        heroDesc: o=>`وصفة تقليدية من <strong>${esc(o)}</strong>.`,
        appDir:'', dir_attr:'rtl', lc: null },
  zh: { dir:'/zh/shipu',     indexTitle:`世界各地食谱 | Meal-Planner.ro`,
        indexH1:'<span class="accent">世界各地</span>食谱',
        indexDesc: n=>`${n}个食谱，含食材和制作方法。`,
        breadHome:'首页', breadLabel:'食谱',
        ingredientsH:'🛒 食材', howToH:'👨‍🍳 做法',
        addBtn: n=>`加入我的计划`, relatedH: o=>`更多来自${esc(o)}的食谱`,
        seoP: n=>`将<strong>${esc(n)}</strong>添加到您的每周计划 <a href="/zh/">Meal-Planner.ro</a>。`,
        pageTitle: n=>`${esc(n)}食谱 – 食材和做法 | Meal-Planner.ro`,
        pageDesc: (n,o)=>`${n}食谱来自${o}：食材和步骤说明。`,
        heroDesc: o=>`来自<strong>${esc(o)}</strong>的传统食谱。`,
        appDir:'', lc: null },
  ja: { dir:'/ja/reshipi',   indexTitle:`世界の料理レシピ | Meal-Planner.ro`,
        indexH1:'<span class="accent">世界の</span>料理レシピ',
        indexDesc: n=>`${n}のレシピ、材料と作り方付き。`,
        breadHome:'ホーム', breadLabel:'レシピ',
        ingredientsH:'🛒 材料', howToH:'👨‍🍳 作り方',
        addBtn: n=>`プランに追加`, relatedH: o=>`${esc(o)}のその他のレシピ`,
        seoP: n=>`<strong>${esc(n)}</strong>を<a href="/ja/">Meal-Planner.ro</a>の週間プランに追加しましょう。`,
        pageTitle: n=>`${esc(n)}のレシピ – 材料と作り方 | Meal-Planner.ro`,
        pageDesc: (n,o)=>`${o}の${n}レシピ：材料とステップごとの作り方。`,
        heroDesc: o=>`<strong>${esc(o)}</strong>の伝統的なレシピ。`,
        appDir:'', lc: null },
  hi: { dir:'/hi/recipes',   indexTitle:`दुनिया भर की रेसिपी | Meal-Planner.ro`,
        indexH1:'<span class="accent">दुनिया भर</span> की रेसिपी',
        indexDesc: n=>`${n} रेसिपी सामग्री और निर्देशों के साथ।`,
        breadHome:'होम', breadLabel:'रेसिपी',
        ingredientsH:'🛒 सामग्री', howToH:'👨‍🍳 बनाने का तरीका',
        addBtn: n=>`मेरी योजना में जोड़ें`, relatedH: o=>`${esc(o)} की और रेसिपी`,
        seoP: n=>`<strong>${esc(n)}</strong> को <a href="/hi/">Meal-Planner.ro</a> के साथ अपनी साप्ताहिक योजना में जोड़ें।`,
        pageTitle: n=>`${esc(n)} रेसिपी – सामग्री और बनाने का तरीका | Meal-Planner.ro`,
        pageDesc: (n,o)=>`${o} से ${n} रेसिपी: सामग्री और चरण-दर-चरण निर्देश।`,
        heroDesc: o=>`<strong>${esc(o)}</strong> की पारंपरिक रेसिपी।`,
        appDir:'', lc: null },
  tr: { dir:'/tr/tarifler',  indexTitle:`Dünyadan Tarifler | Meal-Planner.ro`,
        indexH1:'<span class="accent">Dünyadan</span> Tarifler',
        indexDesc: n=>`${n} tarif, malzemeler ve talimatlarla.`,
        breadHome:'Ana Sayfa', breadLabel:'Tarifler',
        ingredientsH:'🛒 Malzemeler', howToH:'👨‍🍳 Nasıl yapılır',
        addBtn: n=>`Planıma ekle`, relatedH: o=>`${esc(o)} tarihinden daha fazla tarif`,
        seoP: n=>`<strong>${esc(n)}</strong>'ı <a href="/tr/">Meal-Planner.ro</a> ile haftalık planınıza ekleyin.`,
        pageTitle: n=>`${esc(n)} Tarifi – Malzemeler ve Yapılışı | Meal-Planner.ro`,
        pageDesc: (n,o)=>`${o}'dan ${n} tarifi: malzemeler ve adım adım talimatlar.`,
        heroDesc: o=>`<strong>${esc(o)}</strong>'dan geleneksel tarif.`,
        appDir:'', lc: null },
  it: { dir:'/it/ricette',   indexTitle:`Ricette dal Mondo | Meal-Planner.ro`,
        indexH1:'Ricette dal <span class="accent">Mondo</span>',
        indexDesc: n=>`${n} ricette con ingredienti e istruzioni.`,
        breadHome:'Home', breadLabel:'Ricette',
        ingredientsH:'🛒 Ingredienti', howToH:'👨‍🍳 Come preparare',
        addBtn: n=>`Aggiungi al mio piano`, relatedH: o=>`Altre ricette da ${esc(o)}`,
        seoP: n=>`Aggiungi <strong>${esc(n)}</strong> al tuo piano settimanale con <a href="/it/">Meal-Planner.ro</a>.`,
        pageTitle: n=>`Ricetta ${esc(n)} – Ingredienti e Preparazione | Meal-Planner.ro`,
        pageDesc: (n,o)=>`Ricetta di ${n} da ${o}: ingredienti e istruzioni passo dopo passo.`,
        heroDesc: o=>`Ricetta tradizionale da <strong>${esc(o)}</strong>.`,
        appDir:'', lc: null },
  ko: { dir:'/ko/recipes',   indexTitle:`세계 요리 레시피 | Meal-Planner.ro`,
        indexH1:'<span class="accent">세계</span> 요리 레시피',
        indexDesc: n=>`재료와 만드는 법이 있는 ${n}가지 레시피.`,
        breadHome:'홈', breadLabel:'레시피',
        ingredientsH:'🛒 재료', howToH:'👨‍🍳 만드는 법',
        addBtn: n=>`내 플랜에 추가`, relatedH: o=>`${esc(o)}의 더 많은 레시피`,
        seoP: n=>`<strong>${esc(n)}</strong>을(를) <a href="/ko/">Meal-Planner.ro</a>의 주간 플랜에 추가하세요.`,
        pageTitle: n=>`${esc(n)} 레시피 – 재료 및 만드는 법 | Meal-Planner.ro`,
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
   RECIPE UI STRINGS — premium redesign labels for all 14 languages
   ════════════════════════════════════════════════════════════════ */
const RECIPE_UI = {
  ro:{ totalTime:'Timp total', activeTime:'Timp activ', servings:'Porții', difficulty:'Dificultate', cost:'Cost',
    diffLevels:['Ușoară','Medie','Dificilă'], pdfBtn:'Previzualizare PDF', pdfTitle:'Salvare PDF: Share (⬆) → Print → Salvează ca PDF (iPhone/iPad)',
    nutritionH:'Informații nutriționale', nutritionPer:'per porție (~400 ml)',
    cal:'Calorii', prot:'Proteine', carb:'Carbohidrați', fat:'Grăsimi', fib:'Fibre',
    pairingsH:'Se potrivește perfect cu',
    seeAll:'Vezi toate rețetele →',
    ctaTitle:'Planifică-ți mesele pentru întreaga săptămână',
    ctaDesc:'Generează un plan personalizat cu rețete variate și listă automată de cumpărături.',
    ctaBtn:'Generează planul meu acum →', addShopping:'Adaugă la lista de cumpărături',
    servingsLabel:n=>`${n} porții`,
    feat:[
      {icon:'❤️',t:'Bogat în proteine',d:'Sățios și nutritiv'},
      {icon:'🐟',t:'Bogat în omega-3',d:'Ușor și sănătos'},
      {icon:'🌿',t:'Bogat în vitamine',d:'Proaspăt și sănătos'},
      {icon:'⭐',t:'Rețetă tradițională',d:'Gust autentic'},
      {icon:'❄️',t:'Se poate congela',d:'Ideală pentru meal prep'},
      {icon:'⚡',t:'Rapid de preparat',d:'Gata în sub 30 minute'},
      {icon:'☕',t:'Perfect pentru iarnă',d:'Reconfortant și cald'},
      {icon:'👨‍👩‍👧‍👦',t:'Ideal pentru familie',d:'Toți vor adora'},
    ],
    pairs:{
      meat:[{e:'🍷',n:'Vin roșu'},{e:'🥗',n:'Salată verde'},{e:'🍞',n:'Pâine de casă'},{e:'🥔',n:'Cartofi noi'}],
      fish:[{e:'🍋',n:'Lămâie'},{e:'🍷',n:'Vin alb'},{e:'🍚',n:'Orez fiert'},{e:'🌿',n:'Ierburi proaspete'}],
      soup:[{e:'🍞',n:'Pâine rustică'},{e:'🧄',n:'Usturoi proaspăt'},{e:'🌶️',n:'Ardei iute'},{e:'🧅',n:'Ceapă roșie'}],
      pasta:[{e:'🧀',n:'Parmezan'},{e:'🍷',n:'Vin alb'},{e:'🥗',n:'Salată'},{e:'🍞',n:'Pâine ciabatta'}],
      veg:[{e:'🫙',n:'Smântână'},{e:'🍞',n:'Pâine'},{e:'🧄',n:'Usturoi'},{e:'🥗',n:'Salată'}],
      def:[{e:'🥗',n:'Salată proaspătă'},{e:'🍷',n:'Vin'},{e:'🍞',n:'Pâine'},{e:'🌿',n:'Ierburi aromatice'}],
      korean:[{e:'🥬',n:'Kimchi'},{e:'🥣',n:'Supă doenjang'},{e:'🥢',n:'Banchan'},{e:'🍵',n:'Ceai de orz'}],
      japanese:[{e:'🍵',n:'Ceai verde'},{e:'🥢',n:'Supă miso'},{e:'🥒',n:'Murături tsukemono'},{e:'🍶',n:'Sake sau bere japoneză'}],
    }
  },
  en:{ totalTime:'Total time', activeTime:'Active time', servings:'Servings', difficulty:'Difficulty', cost:'Cost',
    diffLevels:['Easy','Medium','Hard'], pdfBtn:'Export PDF', pdfTitle:'Save as PDF: Share (⬆) → Print → Save as PDF (iPhone/iPad)',
    nutritionH:'Nutritional info', nutritionPer:'per serving (~400 ml)',
    cal:'Calories', prot:'Protein', carb:'Carbs', fat:'Fat', fib:'Fiber',
    pairingsH:'Pairs perfectly with',
    seeAll:'See all recipes →',
    ctaTitle:'Plan your meals for the entire week',
    ctaDesc:'Generate a personalized plan with varied recipes and automatic shopping list.',
    ctaBtn:'Generate my plan now →', addShopping:'Add to shopping list',
    servingsLabel:n=>`${n} servings`,
    feat:[
      {icon:'❤️',t:'Rich in protein',d:'Filling and nutritious'},
      {icon:'🐟',t:'Rich in omega-3',d:'Light and healthy'},
      {icon:'🌿',t:'Rich in vitamins',d:'Fresh and healthy'},
      {icon:'⭐',t:'Traditional recipe',d:'Authentic taste'},
      {icon:'❄️',t:'Can be frozen',d:'Great for meal prep'},
      {icon:'⚡',t:'Quick to prepare',d:'Ready in under 30 min'},
      {icon:'☕',t:'Perfect for winter',d:'Comforting and warm'},
      {icon:'👨‍👩‍👧‍👦',t:'Great for family',d:'Everyone will love it'},
    ],
    pairs:{
      meat:[{e:'🍷',n:'Red wine'},{e:'🥗',n:'Green salad'},{e:'🍞',n:'Fresh bread'},{e:'🥔',n:'Roasted potatoes'}],
      fish:[{e:'🍋',n:'Lemon'},{e:'🍷',n:'White wine'},{e:'🍚',n:'Steamed rice'},{e:'🌿',n:'Fresh herbs'}],
      soup:[{e:'🍞',n:'Rustic bread'},{e:'🧄',n:'Fresh garlic'},{e:'🌶️',n:'Chili peppers'},{e:'🧅',n:'Red onion'}],
      pasta:[{e:'🧀',n:'Parmesan'},{e:'🍷',n:'White wine'},{e:'🥗',n:'Arugula salad'},{e:'🍞',n:'Ciabatta'}],
      veg:[{e:'🫙',n:'Yogurt'},{e:'🍞',n:'Bread'},{e:'🧄',n:'Garlic'},{e:'🥗',n:'Salad'}],
      def:[{e:'🥗',n:'Fresh salad'},{e:'🍷',n:'Wine'},{e:'🍞',n:'Bread'},{e:'🌿',n:'Fresh herbs'}],
      korean:[{e:'🥬',n:'Kimchi'},{e:'🥣',n:'Doenjang jjigae'},{e:'🥢',n:'Banchan sides'},{e:'🍵',n:'Barley tea'}],
      japanese:[{e:'🍵',n:'Green tea'},{e:'🥢',n:'Miso soup'},{e:'🥒',n:'Pickled vegetables (tsukemono)'},{e:'🍶',n:'Sake or Japanese beer'}],
    }
  },
  es:{ totalTime:'Tiempo total', activeTime:'Tiempo activo', servings:'Raciones', difficulty:'Dificultad', cost:'Coste',
    diffLevels:['Fácil','Media','Difícil'], pdfBtn:'Exportar PDF', pdfTitle:'Guardar PDF: Compartir (⬆) → Imprimir → Guardar como PDF (iPhone/iPad)',
    nutritionH:'Información nutricional', nutritionPer:'por ración (~400 ml)',
    cal:'Calorías', prot:'Proteínas', carb:'Carbohidratos', fat:'Grasas', fib:'Fibra',
    pairingsH:'Combina perfectamente con',
    seeAll:'Ver todas las recetas →',
    ctaTitle:'Planifica tus comidas para toda la semana',
    ctaDesc:'Genera un plan personalizado con recetas variadas y lista de compras automática.',
    ctaBtn:'Generar mi plan ahora →', addShopping:'Añadir a la lista de compras',
    servingsLabel:n=>`${n} raciones`,
    feat:[
      {icon:'❤️',t:'Rico en proteínas',d:'Saciante y nutritivo'},
      {icon:'🐟',t:'Rico en omega-3',d:'Ligero y saludable'},
      {icon:'🌿',t:'Rico en vitaminas',d:'Fresco y saludable'},
      {icon:'⭐',t:'Receta tradicional',d:'Sabor auténtico'},
      {icon:'❄️',t:'Se puede congelar',d:'Ideal para meal prep'},
      {icon:'⚡',t:'Rápido de preparar',d:'Listo en menos de 30 min'},
      {icon:'☕',t:'Perfecto para el invierno',d:'Reconfortante y cálido'},
      {icon:'👨‍👩‍👧‍👦',t:'Ideal para la familia',d:'A todos les encantará'},
    ],
    pairs:{
      meat:[{e:'🍷',n:'Vino tinto'},{e:'🥗',n:'Ensalada verde'},{e:'🍞',n:'Pan fresco'},{e:'🥔',n:'Patatas asadas'}],
      fish:[{e:'🍋',n:'Limón'},{e:'🍷',n:'Vino blanco'},{e:'🍚',n:'Arroz al vapor'},{e:'🌿',n:'Hierbas frescas'}],
      soup:[{e:'🍞',n:'Pan rústico'},{e:'🧄',n:'Ajo fresco'},{e:'🌶️',n:'Chile'},{e:'🧅',n:'Cebolla roja'}],
      pasta:[{e:'🧀',n:'Parmesano'},{e:'🍷',n:'Vino blanco'},{e:'🥗',n:'Ensalada'},{e:'🍞',n:'Ciabatta'}],
      veg:[{e:'🫙',n:'Yogur'},{e:'🍞',n:'Pan'},{e:'🧄',n:'Ajo'},{e:'🥗',n:'Ensalada'}],
      def:[{e:'🥗',n:'Ensalada fresca'},{e:'🍷',n:'Vino'},{e:'🍞',n:'Pan'},{e:'🌿',n:'Hierbas'}],
      korean:[{e:'🥬',n:'Kimchi'},{e:'🥣',n:'Sopa doenjang'},{e:'🥢',n:'Banchan'},{e:'🍵',n:'Té de cebada'}],
      japanese:[{e:'🍵',n:'Té verde'},{e:'🥢',n:'Sopa miso'},{e:'🥒',n:'Verduras encurtidas (tsukemono)'},{e:'🍶',n:'Sake o cerveza japonesa'}],
    }
  },
  fr:{ totalTime:'Temps total', activeTime:'Temps actif', servings:'Portions', difficulty:'Difficulté', cost:'Coût',
    diffLevels:['Facile','Moyen','Difficile'], pdfBtn:'Exporter PDF', pdfTitle:'Enregistrer PDF : Partager (⬆) → Imprimer → Enregistrer en PDF (iPhone/iPad)',
    nutritionH:'Informations nutritionnelles', nutritionPer:'par portion (~400 ml)',
    cal:'Calories', prot:'Protéines', carb:'Glucides', fat:'Lipides', fib:'Fibres',
    pairingsH:'S\'accompagne parfaitement avec',
    seeAll:'Voir toutes les recettes →',
    ctaTitle:'Planifiez vos repas pour toute la semaine',
    ctaDesc:'Générez un plan personnalisé avec des recettes variées et une liste de courses automatique.',
    ctaBtn:'Générer mon plan maintenant →', addShopping:'Ajouter à la liste de courses',
    servingsLabel:n=>`${n} portions`,
    feat:[
      {icon:'❤️',t:'Riche en protéines',d:'Rassasiant et nutritif'},
      {icon:'🐟',t:'Riche en oméga-3',d:'Léger et sain'},
      {icon:'🌿',t:'Riche en vitamines',d:'Frais et sain'},
      {icon:'⭐',t:'Recette traditionnelle',d:'Goût authentique'},
      {icon:'❄️',t:'Se congèle bien',d:'Idéal pour le meal prep'},
      {icon:'⚡',t:'Rapide à préparer',d:'Prêt en moins de 30 min'},
      {icon:'☕',t:'Parfait pour l\'hiver',d:'Réconfortant et chaud'},
      {icon:'👨‍👩‍👧‍👦',t:'Idéal en famille',d:'Tout le monde adorera'},
    ],
    pairs:{
      meat:[{e:'🍷',n:'Vin rouge'},{e:'🥗',n:'Salade verte'},{e:'🍞',n:'Pain frais'},{e:'🥔',n:'Pommes de terre'}],
      fish:[{e:'🍋',n:'Citron'},{e:'🍷',n:'Vin blanc'},{e:'🍚',n:'Riz vapeur'},{e:'🌿',n:'Herbes fraîches'}],
      soup:[{e:'🍞',n:'Pain rustique'},{e:'🧄',n:'Ail frais'},{e:'🌶️',n:'Piment'},{e:'🧅',n:'Oignon rouge'}],
      pasta:[{e:'🧀',n:'Parmesan'},{e:'🍷',n:'Vin blanc'},{e:'🥗',n:'Salade'},{e:'🍞',n:'Ciabatta'}],
      veg:[{e:'🫙',n:'Yaourt'},{e:'🍞',n:'Pain'},{e:'🧄',n:'Ail'},{e:'🥗',n:'Salade'}],
      def:[{e:'🥗',n:'Salade fraîche'},{e:'🍷',n:'Vin'},{e:'🍞',n:'Pain'},{e:'🌿',n:'Herbes'}],
      korean:[{e:'🥬',n:'Kimchi'},{e:'🥣',n:'Soupe doenjang'},{e:'🥢',n:'Banchan'},{e:'🍵',n:'Thé d\'orge'}],
      japanese:[{e:'🍵',n:'Thé vert'},{e:'🥢',n:'Soupe miso'},{e:'🥒',n:'Légumes marinés (tsukemono)'},{e:'🍶',n:'Saké ou bière japonaise'}],
    }
  },
  de:{ totalTime:'Gesamtzeit', activeTime:'Aktive Zeit', servings:'Portionen', difficulty:'Schwierigkeit', cost:'Kosten',
    diffLevels:['Einfach','Mittel','Schwer'], pdfBtn:'PDF exportieren', pdfTitle:'Als PDF: Teilen (⬆) → Drucken → Als PDF sichern (iPhone/iPad)',
    nutritionH:'Nährwertangaben', nutritionPer:'pro Portion (~400 ml)',
    cal:'Kalorien', prot:'Protein', carb:'Kohlenhydrate', fat:'Fett', fib:'Ballaststoffe',
    pairingsH:'Passt perfekt zu',
    seeAll:'Alle Rezepte ansehen →',
    ctaTitle:'Plane deine Mahlzeiten für die ganze Woche',
    ctaDesc:'Erstelle einen persönlichen Plan mit abwechslungsreichen Rezepten und automatischer Einkaufsliste.',
    ctaBtn:'Meinen Plan jetzt erstellen →', addShopping:'Zur Einkaufsliste hinzufügen',
    servingsLabel:n=>`${n} Portionen`,
    feat:[
      {icon:'❤️',t:'Proteinreich',d:'Sättigend und nahrhaft'},
      {icon:'🐟',t:'Reich an Omega-3',d:'Leicht und gesund'},
      {icon:'🌿',t:'Vitaminreich',d:'Frisch und gesund'},
      {icon:'⭐',t:'Traditionelles Rezept',d:'Authentischer Geschmack'},
      {icon:'❄️',t:'Einfrierbar',d:'Ideal für Meal Prep'},
      {icon:'⚡',t:'Schnell zubereitet',d:'In unter 30 Min. fertig'},
      {icon:'☕',t:'Perfekt für den Winter',d:'Wärmend und wohltuend'},
      {icon:'👨‍👩‍👧‍👦',t:'Ideal für die Familie',d:'Alle werden es lieben'},
    ],
    pairs:{
      meat:[{e:'🍷',n:'Rotwein'},{e:'🥗',n:'Grüner Salat'},{e:'🍞',n:'Frisches Brot'},{e:'🥔',n:'Bratkartoffeln'}],
      fish:[{e:'🍋',n:'Zitrone'},{e:'🍷',n:'Weißwein'},{e:'🍚',n:'Gedämpfter Reis'},{e:'🌿',n:'Frische Kräuter'}],
      soup:[{e:'🍞',n:'Rustikales Brot'},{e:'🧄',n:'Frischer Knoblauch'},{e:'🌶️',n:'Chili'},{e:'🧅',n:'Rote Zwiebel'}],
      pasta:[{e:'🧀',n:'Parmesan'},{e:'🍷',n:'Weißwein'},{e:'🥗',n:'Salat'},{e:'🍞',n:'Ciabatta'}],
      veg:[{e:'🫙',n:'Joghurt'},{e:'🍞',n:'Brot'},{e:'🧄',n:'Knoblauch'},{e:'🥗',n:'Salat'}],
      def:[{e:'🥗',n:'Frischer Salat'},{e:'🍷',n:'Wein'},{e:'🍞',n:'Brot'},{e:'🌿',n:'Kräuter'}],
      korean:[{e:'🥬',n:'Kimchi'},{e:'🥣',n:'Doenjang-Suppe'},{e:'🥢',n:'Banchan'},{e:'🍵',n:'Gerstentee'}],
      japanese:[{e:'🍵',n:'Grüner Tee'},{e:'🥢',n:'Miso-Suppe'},{e:'🥒',n:'Eingelegtes Gemüse (Tsukemono)'},{e:'🍶',n:'Sake oder japanisches Bier'}],
    }
  },
  pt:{ totalTime:'Tempo total', activeTime:'Tempo ativo', servings:'Porções', difficulty:'Dificuldade', cost:'Custo',
    diffLevels:['Fácil','Média','Difícil'], pdfBtn:'Exportar PDF', pdfTitle:'Salvar PDF: Compartilhar (⬆) → Imprimir → Salvar como PDF (iPhone/iPad)',
    nutritionH:'Informação nutricional', nutritionPer:'por porção (~400 ml)',
    cal:'Calorias', prot:'Proteínas', carb:'Carboidratos', fat:'Gorduras', fib:'Fibras',
    pairingsH:'Combina perfeitamente com',
    seeAll:'Ver todas as receitas →',
    ctaTitle:'Planeje suas refeições para a semana toda',
    ctaDesc:'Gere um plano personalizado com receitas variadas e lista de compras automática.',
    ctaBtn:'Gerar meu plano agora →', addShopping:'Adicionar à lista de compras',
    servingsLabel:n=>`${n} porções`,
    feat:[
      {icon:'❤️',t:'Rico em proteínas',d:'Saciante e nutritivo'},
      {icon:'🐟',t:'Rico em ômega-3',d:'Leve e saudável'},
      {icon:'🌿',t:'Rico em vitaminas',d:'Fresco e saudável'},
      {icon:'⭐',t:'Receita tradicional',d:'Sabor autêntico'},
      {icon:'❄️',t:'Pode ser congelado',d:'Ideal para meal prep'},
      {icon:'⚡',t:'Rápido de preparar',d:'Pronto em menos de 30 min'},
      {icon:'☕',t:'Perfeito para o inverno',d:'Reconfortante e quentinho'},
      {icon:'👨‍👩‍👧‍👦',t:'Ideal para a família',d:'Todos vão adorar'},
    ],
    pairs:{
      meat:[{e:'🍷',n:'Vinho tinto'},{e:'🥗',n:'Salada verde'},{e:'🍞',n:'Pão fresco'},{e:'🥔',n:'Batatas assadas'}],
      fish:[{e:'🍋',n:'Limão'},{e:'🍷',n:'Vinho branco'},{e:'🍚',n:'Arroz no vapor'},{e:'🌿',n:'Ervas frescas'}],
      soup:[{e:'🍞',n:'Pão rústico'},{e:'🧄',n:'Alho fresco'},{e:'🌶️',n:'Pimenta'},{e:'🧅',n:'Cebola roxa'}],
      pasta:[{e:'🧀',n:'Parmesão'},{e:'🍷',n:'Vinho branco'},{e:'🥗',n:'Salada'},{e:'🍞',n:'Ciabatta'}],
      veg:[{e:'🫙',n:'Iogurte'},{e:'🍞',n:'Pão'},{e:'🧄',n:'Alho'},{e:'🥗',n:'Salada'}],
      def:[{e:'🥗',n:'Salada fresca'},{e:'🍷',n:'Vinho'},{e:'🍞',n:'Pão'},{e:'🌿',n:'Ervas'}],
      korean:[{e:'🥬',n:'Kimchi'},{e:'🥣',n:'Sopa doenjang'},{e:'🥢',n:'Banchan'},{e:'🍵',n:'Chá de cevada'}],
      japanese:[{e:'🍵',n:'Chá verde'},{e:'🥢',n:'Sopa miso'},{e:'🥒',n:'Legumes em conserva (tsukemono)'},{e:'🍶',n:'Saquê ou cerveja japonesa'}],
    }
  },
  ru:{ totalTime:'Общее время', activeTime:'Активное время', servings:'Порции', difficulty:'Сложность', cost:'Стоимость',
    diffLevels:['Лёгкий','Средний','Сложный'], pdfBtn:'Экспорт PDF', pdfTitle:'Сохранить PDF: Поделиться (⬆) → Печать → Сохранить как PDF (iPhone/iPad)',
    nutritionH:'Пищевая ценность', nutritionPer:'на порцию (~400 мл)',
    cal:'Калории', prot:'Белки', carb:'Углеводы', fat:'Жиры', fib:'Клетчатка',
    pairingsH:'Прекрасно сочетается с',
    seeAll:'Все рецепты →',
    ctaTitle:'Планируйте питание на всю неделю',
    ctaDesc:'Создайте персональный план с разнообразными рецептами и автоматическим списком покупок.',
    ctaBtn:'Создать мой план →', addShopping:'Добавить в список покупок',
    servingsLabel:n=>`${n} порции`,
    feat:[
      {icon:'❤️',t:'Богато белком',d:'Сытно и питательно'},
      {icon:'🐟',t:'Богато омега-3',d:'Лёгкое и полезное'},
      {icon:'🌿',t:'Богато витаминами',d:'Свежее и полезное'},
      {icon:'⭐',t:'Традиционный рецепт',d:'Аутентичный вкус'},
      {icon:'❄️',t:'Можно заморозить',d:'Идеально для meal prep'},
      {icon:'⚡',t:'Быстро готовится',d:'Готово менее чем за 30 мин'},
      {icon:'☕',t:'Идеально зимой',d:'Согревающее и уютное'},
      {icon:'👨‍👩‍👧‍👦',t:'Для всей семьи',d:'Понравится каждому'},
    ],
    pairs:{
      meat:[{e:'🍷',n:'Красное вино'},{e:'🥗',n:'Зелёный салат'},{e:'🍞',n:'Свежий хлеб'},{e:'🥔',n:'Жареный картофель'}],
      fish:[{e:'🍋',n:'Лимон'},{e:'🍷',n:'Белое вино'},{e:'🍚',n:'Варёный рис'},{e:'🌿',n:'Свежие травы'}],
      soup:[{e:'🍞',n:'Деревенский хлеб'},{e:'🧄',n:'Свежий чеснок'},{e:'🌶️',n:'Перец чили'},{e:'🧅',n:'Красный лук'}],
      pasta:[{e:'🧀',n:'Пармезан'},{e:'🍷',n:'Белое вино'},{e:'🥗',n:'Салат'},{e:'🍞',n:'Чиабатта'}],
      veg:[{e:'🫙',n:'Сметана'},{e:'🍞',n:'Хлеб'},{e:'🧄',n:'Чеснок'},{e:'🥗',n:'Салат'}],
      def:[{e:'🥗',n:'Свежий салат'},{e:'🍷',n:'Вино'},{e:'🍞',n:'Хлеб'},{e:'🌿',n:'Зелень'}],
      korean:[{e:'🥬',n:'Кимчи'},{e:'🥣',n:'Суп денджан'},{e:'🥢',n:'Панчан'},{e:'🍵',n:'Ячменный чай'}],
      japanese:[{e:'🍵',n:'Зелёный чай'},{e:'🥢',n:'Суп мисо'},{e:'🥒',n:'Маринованные овощи (цукэмоно)'},{e:'🍶',n:'Сакэ или японское пиво'}],
    }
  },
  ar:{ totalTime:'الوقت الكلي', activeTime:'الوقت الفعلي', servings:'الحصص', difficulty:'الصعوبة', cost:'التكلفة',
    diffLevels:['سهل','متوسط','صعب'], pdfBtn:'تصدير PDF', pdfTitle:'حفظ PDF: مشاركة (⬆) ← طباعة ← حفظ كـ PDF (iPhone/iPad)',
    nutritionH:'المعلومات الغذائية', nutritionPer:'لكل حصة (~400 مل)',
    cal:'السعرات', prot:'البروتين', carb:'الكربوهيدرات', fat:'الدهون', fib:'الألياف',
    pairingsH:'يتناسب مع',
    seeAll:'عرض كل الوصفات →',
    ctaTitle:'خطط لوجباتك لكامل الأسبوع',
    ctaDesc:'أنشئ خطة مخصصة مع وصفات متنوعة وقائمة تسوق تلقائية.',
    ctaBtn:'أنشئ خطتي الآن →', addShopping:'أضف إلى قائمة التسوق',
    servingsLabel:n=>`${n} حصص`,
    feat:[
      {icon:'❤️',t:'غني بالبروتين',d:'مشبع ومغذٍ'},
      {icon:'🐟',t:'غني بأوميغا-3',d:'خفيف وصحي'},
      {icon:'🌿',t:'غني بالفيتامينات',d:'طازج وصحي'},
      {icon:'⭐',t:'وصفة تقليدية',d:'طعم أصيل'},
      {icon:'❄️',t:'يمكن تجميده',d:'مثالي للتحضير المسبق'},
      {icon:'⚡',t:'سريع التحضير',d:'جاهز في أقل من 30 دقيقة'},
      {icon:'☕',t:'مثالي للشتاء',d:'دافئ ومريح'},
      {icon:'👨‍👩‍👧‍👦',t:'مثالي للعائلة',d:'سيحبه الجميع'},
    ],
    pairs:{
      meat:[{e:'🍷',n:'نبيذ أحمر'},{e:'🥗',n:'سلطة خضراء'},{e:'🍞',n:'خبز طازج'},{e:'🥔',n:'بطاطس مشوية'}],
      fish:[{e:'🍋',n:'ليمون'},{e:'🍷',n:'نبيذ أبيض'},{e:'🍚',n:'أرز مطهو'},{e:'🌿',n:'أعشاب طازجة'}],
      soup:[{e:'🍞',n:'خبز ريفي'},{e:'🧄',n:'ثوم طازج'},{e:'🌶️',n:'فلفل حار'},{e:'🧅',n:'بصل أحمر'}],
      pasta:[{e:'🧀',n:'بارميزان'},{e:'🍷',n:'نبيذ أبيض'},{e:'🥗',n:'سلطة'},{e:'🍞',n:'خبز'}],
      veg:[{e:'🫙',n:'زبادي'},{e:'🍞',n:'خبز'},{e:'🧄',n:'ثوم'},{e:'🥗',n:'سلطة'}],
      def:[{e:'🥗',n:'سلطة طازجة'},{e:'🍷',n:'نبيذ'},{e:'🍞',n:'خبز'},{e:'🌿',n:'أعشاب'}],
      korean:[{e:'🥬',n:'كيمتشي'},{e:'🥣',n:'حساء دوينجانغ'},{e:'🥢',n:'بانتشان'},{e:'🍵',n:'شاي الشعير'}],
      japanese:[{e:'🍵',n:'شاي أخضر'},{e:'🥢',n:'حساء ميسو'},{e:'🥒',n:'خضار مخللة (تسوكيمونو)'},{e:'🍶',n:'ساكي أو بيرة يابانية'}],
    }
  },
  zh:{ totalTime:'总时间', activeTime:'操作时间', servings:'份数', difficulty:'难度', cost:'费用',
    diffLevels:['简单','中等','困难'], pdfBtn:'导出PDF', pdfTitle:'保存PDF：共享(⬆) → 打印 → 存储为PDF (iPhone/iPad)',
    nutritionH:'营养信息', nutritionPer:'每份 (~400 ml)',
    cal:'卡路里', prot:'蛋白质', carb:'碳水化合物', fat:'脂肪', fib:'膳食纤维',
    pairingsH:'完美搭配',
    seeAll:'查看全部食谱 →',
    ctaTitle:'为整周规划您的餐食',
    ctaDesc:'生成包含多种食谱和自动购物清单的个性化计划。',
    ctaBtn:'立即生成我的计划 →', addShopping:'添加到购物清单',
    servingsLabel:n=>`${n}份`,
    feat:[
      {icon:'❤️',t:'富含蛋白质',d:'饱腹又营养'},
      {icon:'🐟',t:'富含omega-3',d:'清淡健康'},
      {icon:'🌿',t:'富含维生素',d:'新鲜健康'},
      {icon:'⭐',t:'传统食谱',d:'正宗口味'},
      {icon:'❄️',t:'可冷冻保存',d:'非常适合备餐'},
      {icon:'⚡',t:'快速制作',d:'30分钟内完成'},
      {icon:'☕',t:'冬季佳品',d:'暖心又舒适'},
      {icon:'👨‍👩‍👧‍👦',t:'家庭首选',d:'全家都会喜欢'},
    ],
    pairs:{
      meat:[{e:'🍷',n:'红酒'},{e:'🥗',n:'绿色沙拉'},{e:'🍞',n:'新鲜面包'},{e:'🥔',n:'烤土豆'}],
      fish:[{e:'🍋',n:'柠檬'},{e:'🍷',n:'白葡萄酒'},{e:'🍚',n:'蒸米饭'},{e:'🌿',n:'新鲜香草'}],
      soup:[{e:'🍞',n:'乡村面包'},{e:'🧄',n:'新鲜大蒜'},{e:'🌶️',n:'辣椒'},{e:'🧅',n:'红洋葱'}],
      pasta:[{e:'🧀',n:'帕玛森芝士'},{e:'🍷',n:'白葡萄酒'},{e:'🥗',n:'沙拉'},{e:'🍞',n:'拖鞋面包'}],
      veg:[{e:'🫙',n:'酸奶'},{e:'🍞',n:'面包'},{e:'🧄',n:'大蒜'},{e:'🥗',n:'沙拉'}],
      def:[{e:'🥗',n:'新鲜沙拉'},{e:'🍷',n:'葡萄酒'},{e:'🍞',n:'面包'},{e:'🌿',n:'香草'}],
      korean:[{e:'🥬',n:'泡菜'},{e:'🥣',n:'大酱汤'},{e:'🥢',n:'小菜'},{e:'🍵',n:'大麦茶'}],
      japanese:[{e:'🍵',n:'绿茶'},{e:'🥢',n:'味噌汤'},{e:'🥒',n:'腌菜（漬物）'},{e:'🍶',n:'清酒或日本啤酒'}],
    }
  },
  ja:{ totalTime:'合計時間', activeTime:'調理時間', servings:'人数', difficulty:'難易度', cost:'費用',
    diffLevels:['簡単','普通','難しい'], pdfBtn:'PDFエクスポート', pdfTitle:'PDFで保存：共有(⬆) → プリント → PDFを保存 (iPhone/iPad)',
    nutritionH:'栄養情報', nutritionPer:'1人前あたり (~400 ml)',
    cal:'カロリー', prot:'タンパク質', carb:'炭水化物', fat:'脂質', fib:'食物繊維',
    pairingsH:'と相性抜群',
    seeAll:'全レシピを見る →',
    ctaTitle:'1週間の食事を計画しましょう',
    ctaDesc:'様々なレシピと自動買い物リスト付きのパーソナライズされたプランを作成します。',
    ctaBtn:'プランを今すぐ作成 →', addShopping:'買い物リストに追加',
    servingsLabel:n=>`${n}人前`,
    feat:[
      {icon:'❤️',t:'タンパク質豊富',d:'満腹感と栄養満点'},
      {icon:'🐟',t:'オメガ3豊富',d:'軽くてヘルシー'},
      {icon:'🌿',t:'ビタミン豊富',d:'新鮮でヘルシー'},
      {icon:'⭐',t:'伝統的なレシピ',d:'本格的な味'},
      {icon:'❄️',t:'冷凍保存可',d:'ミールプレップに最適'},
      {icon:'⚡',t:'素早く調理',d:'30分以内に完成'},
      {icon:'☕',t:'冬に最適',d:'心も体も温まる'},
      {icon:'👨‍👩‍👧‍👦',t:'家族向き',d:'みんなが喜ぶ'},
    ],
    pairs:{
      meat:[{e:'🍷',n:'赤ワイン'},{e:'🥗',n:'グリーンサラダ'},{e:'🍞',n:'パン'},{e:'🥔',n:'ローストポテト'}],
      fish:[{e:'🍋',n:'レモン'},{e:'🍷',n:'白ワイン'},{e:'🍚',n:'蒸しご飯'},{e:'🌿',n:'フレッシュハーブ'}],
      soup:[{e:'🍞',n:'田舎パン'},{e:'🧄',n:'新鮮ニンニク'},{e:'🌶️',n:'唐辛子'},{e:'🧅',n:'赤玉ねぎ'}],
      pasta:[{e:'🧀',n:'パルメザン'},{e:'🍷',n:'白ワイン'},{e:'🥗',n:'サラダ'},{e:'🍞',n:'チャバタ'}],
      veg:[{e:'🫙',n:'ヨーグルト'},{e:'🍞',n:'パン'},{e:'🧄',n:'ニンニク'},{e:'🥗',n:'サラダ'}],
      def:[{e:'🥗',n:'フレッシュサラダ'},{e:'🍷',n:'ワイン'},{e:'🍞',n:'パン'},{e:'🌿',n:'ハーブ'}],
      korean:[{e:'🥬',n:'キムチ'},{e:'🥣',n:'テンジャンチゲ'},{e:'🥢',n:'バンチャン'},{e:'🍵',n:'麦茶'}],
      japanese:[{e:'🍵',n:'緑茶'},{e:'🥢',n:'味噌汁'},{e:'🥒',n:'漬物'},{e:'🍶',n:'日本酒またはビール'}],
    }
  },
  hi:{ totalTime:'कुल समय', activeTime:'सक्रिय समय', servings:'सर्विंग्स', difficulty:'कठिनाई', cost:'लागत',
    diffLevels:['आसान','मध्यम','कठिन'], pdfBtn:'PDF एक्सपोर्ट', pdfTitle:'PDF सेव: Share (⬆) → Print → Save as PDF (iPhone/iPad)',
    nutritionH:'पोषण संबंधी जानकारी', nutritionPer:'प्रति सर्विंग (~400 ml)',
    cal:'कैलोरी', prot:'प्रोटीन', carb:'कार्बोहाइड्रेट', fat:'वसा', fib:'फाइबर',
    pairingsH:'के साथ बेहतरीन लगता है',
    seeAll:'सभी रेसिपी देखें →',
    ctaTitle:'पूरे सप्ताह के लिए अपने भोजन की योजना बनाएं',
    ctaDesc:'विविध व्यंजनों और स्वचालित खरीदारी सूची के साथ एक व्यक्तिगत योजना बनाएं।',
    ctaBtn:'अभी मेरी योजना बनाएं →', addShopping:'खरीदारी सूची में जोड़ें',
    servingsLabel:n=>`${n} सर्विंग्स`,
    feat:[
      {icon:'❤️',t:'प्रोटीन से भरपूर',d:'भरपेट और पौष्टिक'},
      {icon:'🐟',t:'ओमेगा-3 से भरपूर',d:'हल्का और स्वस्थ'},
      {icon:'🌿',t:'विटामिन से भरपूर',d:'ताजा और स्वस्थ'},
      {icon:'⭐',t:'पारंपरिक रेसिपी',d:'असली स्वाद'},
      {icon:'❄️',t:'फ्रीज किया जा सकता है',d:'मील प्रेप के लिए बढ़िया'},
      {icon:'⚡',t:'जल्दी तैयार होता है',d:'30 मिनट में तैयार'},
      {icon:'☕',t:'सर्दियों के लिए परफेक्ट',d:'आरामदायक और गर्म'},
      {icon:'👨‍👩‍👧‍👦',t:'परिवार के लिए आदर्श',d:'सभी को पसंद आएगा'},
    ],
    pairs:{
      meat:[{e:'🍷',n:'रेड वाइन'},{e:'🥗',n:'हरा सलाद'},{e:'🍞',n:'ताजी ब्रेड'},{e:'🥔',n:'भुने आलू'}],
      fish:[{e:'🍋',n:'नींबू'},{e:'🍷',n:'व्हाइट वाइन'},{e:'🍚',n:'उबला चावल'},{e:'🌿',n:'ताजी जड़ी-बूटियां'}],
      soup:[{e:'🍞',n:'देहाती ब्रेड'},{e:'🧄',n:'ताजा लहसुन'},{e:'🌶️',n:'मिर्च'},{e:'🧅',n:'लाल प्याज'}],
      pasta:[{e:'🧀',n:'परमेसन'},{e:'🍷',n:'व्हाइट वाइन'},{e:'🥗',n:'सलाद'},{e:'🍞',n:'ब्रेड'}],
      veg:[{e:'🫙',n:'दही'},{e:'🍞',n:'रोटी'},{e:'🧄',n:'लहसुन'},{e:'🥗',n:'सलाद'}],
      def:[{e:'🥗',n:'ताजा सलाद'},{e:'🍷',n:'वाइन'},{e:'🍞',n:'ब्रेड'},{e:'🌿',n:'जड़ी-बूटियां'}],
      korean:[{e:'🥬',n:'किमची'},{e:'🥣',n:'दोएंजांग जिगे'},{e:'🥢',n:'बैनचान'},{e:'🍵',n:'जौ की चाय'}],
      japanese:[{e:'🍵',n:'हरी चाय'},{e:'🥢',n:'मिसो सूप'},{e:'🥒',n:'अचार सब्जियां (त्सुकेमोनो)'},{e:'🍶',n:'साके या जापानी बियर'}],
    }
  },
  tr:{ totalTime:'Toplam süre', activeTime:'Aktif süre', servings:'Porsiyon', difficulty:'Zorluk', cost:'Maliyet',
    diffLevels:['Kolay','Orta','Zor'], pdfBtn:'PDF Dışa Aktar', pdfTitle:'PDF kaydet: Paylaş (⬆) → Yazdır → PDF Olarak Kaydet (iPhone/iPad)',
    nutritionH:'Besin değerleri', nutritionPer:'porsiyon başına (~400 ml)',
    cal:'Kalori', prot:'Protein', carb:'Karbonhidrat', fat:'Yağ', fib:'Lif',
    pairingsH:'Mükemmel uyum sağlar',
    seeAll:'Tüm tarifleri gör →',
    ctaTitle:'Tüm hafta için öğünlerinizi planlayın',
    ctaDesc:'Çeşitli tarifler ve otomatik alışveriş listesiyle kişiselleştirilmiş bir plan oluşturun.',
    ctaBtn:'Planımı şimdi oluştur →', addShopping:'Alışveriş listesine ekle',
    servingsLabel:n=>`${n} porsiyon`,
    feat:[
      {icon:'❤️',t:'Protein bakımından zengin',d:'Doyurucu ve besleyici'},
      {icon:'🐟',t:'Omega-3 bakımından zengin',d:'Hafif ve sağlıklı'},
      {icon:'🌿',t:'Vitamin bakımından zengin',d:'Taze ve sağlıklı'},
      {icon:'⭐',t:'Geleneksel tarif',d:'Özgün lezzet'},
      {icon:'❄️',t:'Dondurulabilir',d:'Meal prep için ideal'},
      {icon:'⚡',t:'Hızlı hazırlık',d:'30 dakikada hazır'},
      {icon:'☕',t:'Kış için mükemmel',d:'Sıcak ve rahatlatıcı'},
      {icon:'👨‍👩‍👧‍👦',t:'Aile için ideal',d:'Herkes sevecek'},
    ],
    pairs:{
      meat:[{e:'🍷',n:'Kırmızı şarap'},{e:'🥗',n:'Yeşil salata'},{e:'🍞',n:'Taze ekmek'},{e:'🥔',n:'Fırın patates'}],
      fish:[{e:'🍋',n:'Limon'},{e:'🍷',n:'Beyaz şarap'},{e:'🍚',n:'Buharda pilav'},{e:'🌿',n:'Taze otlar'}],
      soup:[{e:'🍞',n:'Köy ekmeği'},{e:'🧄',n:'Taze sarımsak'},{e:'🌶️',n:'Biber'},{e:'🧅',n:'Kırmızı soğan'}],
      pasta:[{e:'🧀',n:'Parmesan'},{e:'🍷',n:'Beyaz şarap'},{e:'🥗',n:'Salata'},{e:'🍞',n:'Ciabatta'}],
      veg:[{e:'🫙',n:'Yoğurt'},{e:'🍞',n:'Ekmek'},{e:'🧄',n:'Sarımsak'},{e:'🥗',n:'Salata'}],
      def:[{e:'🥗',n:'Taze salata'},{e:'🍷',n:'Şarap'},{e:'🍞',n:'Ekmek'},{e:'🌿',n:'Otlar'}],
      korean:[{e:'🥬',n:'Kimchi'},{e:'🥣',n:'Doenjang çorbası'},{e:'🥢',n:'Banchan'},{e:'🍵',n:'Arpa çayı'}],
      japanese:[{e:'🍵',n:'Yeşil çay'},{e:'🥢',n:'Miso çorbası'},{e:'🥒',n:'Turşu sebzeler (tsukemono)'},{e:'🍶',n:'Sake veya Japon birası'}],
    }
  },
  it:{ totalTime:'Tempo totale', activeTime:'Tempo attivo', servings:'Porzioni', difficulty:'Difficoltà', cost:'Costo',
    diffLevels:['Facile','Media','Difficile'], pdfBtn:'Esporta PDF', pdfTitle:'Salva PDF: Condividi (⬆) → Stampa → Salva come PDF (iPhone/iPad)',
    nutritionH:'Informazioni nutrizionali', nutritionPer:'per porzione (~400 ml)',
    cal:'Calorie', prot:'Proteine', carb:'Carboidrati', fat:'Grassi', fib:'Fibre',
    pairingsH:'Si abbina perfettamente con',
    seeAll:'Vedi tutte le ricette →',
    ctaTitle:'Pianifica i tuoi pasti per tutta la settimana',
    ctaDesc:'Genera un piano personalizzato con ricette variate e lista della spesa automatica.',
    ctaBtn:'Genera il mio piano ora →', addShopping:'Aggiungi alla lista della spesa',
    servingsLabel:n=>`${n} porzioni`,
    feat:[
      {icon:'❤️',t:'Ricco di proteine',d:'Saziante e nutriente'},
      {icon:'🐟',t:'Ricco di omega-3',d:'Leggero e salutare'},
      {icon:'🌿',t:'Ricco di vitamine',d:'Fresco e salutare'},
      {icon:'⭐',t:'Ricetta tradizionale',d:'Sapore autentico'},
      {icon:'❄️',t:'Si può congelare',d:'Ideale per il meal prep'},
      {icon:'⚡',t:'Veloce da preparare',d:'Pronto in meno di 30 min'},
      {icon:'☕',t:'Perfetto per l\'inverno',d:'Confortante e caldo'},
      {icon:'👨‍👩‍👧‍👦',t:'Ideale per la famiglia',d:'Piacerà a tutti'},
    ],
    pairs:{
      meat:[{e:'🍷',n:'Vino rosso'},{e:'🥗',n:'Insalata verde'},{e:'🍞',n:'Pane fresco'},{e:'🥔',n:'Patate al forno'}],
      fish:[{e:'🍋',n:'Limone'},{e:'🍷',n:'Vino bianco'},{e:'🍚',n:'Riso al vapore'},{e:'🌿',n:'Erbe fresche'}],
      soup:[{e:'🍞',n:'Pane rustico'},{e:'🧄',n:'Aglio fresco'},{e:'🌶️',n:'Peperoncino'},{e:'🧅',n:'Cipolla rossa'}],
      pasta:[{e:'🧀',n:'Parmigiano'},{e:'🍷',n:'Vino bianco'},{e:'🥗',n:'Insalata'},{e:'🍞',n:'Ciabatta'}],
      veg:[{e:'🫙',n:'Yogurt'},{e:'🍞',n:'Pane'},{e:'🧄',n:'Aglio'},{e:'🥗',n:'Insalata'}],
      def:[{e:'🥗',n:'Insalata fresca'},{e:'🍷',n:'Vino'},{e:'🍞',n:'Pane'},{e:'🌿',n:'Erbe'}],
      korean:[{e:'🥬',n:'Kimchi'},{e:'🥣',n:'Zuppa doenjang'},{e:'🥢',n:'Banchan'},{e:'🍵',n:'Tè d\'orzo'}],
      japanese:[{e:'🍵',n:'Tè verde'},{e:'🥢',n:'Zuppa miso'},{e:'🥒',n:'Verdure in salamoia (tsukemono)'},{e:'🍶',n:'Sake o birra giapponese'}],
    }
  },
  ko:{ totalTime:'총 시간', activeTime:'조리 시간', servings:'인분', difficulty:'난이도', cost:'비용',
    diffLevels:['쉬움','보통','어려움'], pdfBtn:'PDF 내보내기', pdfTitle:'PDF 저장: 공유(⬆) → 프린트 → PDF로 저장 (iPhone/iPad)',
    nutritionH:'영양 정보', nutritionPer:'1인분 기준 (~400 ml)',
    cal:'칼로리', prot:'단백질', carb:'탄수화물', fat:'지방', fib:'식이섬유',
    pairingsH:'함께 먹으면 좋아요',
    seeAll:'모든 레시피 보기 →',
    ctaTitle:'일주일 식단을 계획해 보세요',
    ctaDesc:'다양한 레시피와 자동 쇼핑 목록이 포함된 맞춤형 플랜을 만드세요.',
    ctaBtn:'지금 내 플랜 만들기 →', addShopping:'쇼핑 목록에 추가',
    servingsLabel:n=>`${n}인분`,
    feat:[
      {icon:'❤️',t:'단백질이 풍부해요',d:'든든하고 영양가 높아요'},
      {icon:'🐟',t:'오메가-3이 풍부해요',d:'가볍고 건강해요'},
      {icon:'🌿',t:'비타민이 풍부해요',d:'신선하고 건강해요'},
      {icon:'⭐',t:'전통 레시피',d:'정통의 맛'},
      {icon:'❄️',t:'냉동 보관 가능',d:'밀프렙에 좋아요'},
      {icon:'⚡',t:'빠르게 조리해요',d:'30분 이내 완성'},
      {icon:'☕',t:'겨울에 딱이에요',d:'따뜻하고 편안한'},
      {icon:'👨‍👩‍👧‍👦',t:'온 가족이 좋아해요',d:'모두가 즐길 수 있어요'},
    ],
    pairs:{
      meat:[{e:'🍷',n:'레드 와인'},{e:'🥗',n:'그린 샐러드'},{e:'🍞',n:'신선한 빵'},{e:'🥔',n:'구운 감자'}],
      fish:[{e:'🍋',n:'레몬'},{e:'🍷',n:'화이트 와인'},{e:'🍚',n:'찐 밥'},{e:'🌿',n:'신선한 허브'}],
      soup:[{e:'🍞',n:'시골 빵'},{e:'🧄',n:'신선한 마늘'},{e:'🌶️',n:'고추'},{e:'🧅',n:'적양파'}],
      pasta:[{e:'🧀',n:'파르메산'},{e:'🍷',n:'화이트 와인'},{e:'🥗',n:'샐러드'},{e:'🍞',n:'치아바타'}],
      veg:[{e:'🫙',n:'요거트'},{e:'🍞',n:'빵'},{e:'🧄',n:'마늘'},{e:'🥗',n:'샐러드'}],
      def:[{e:'🥗',n:'신선한 샐러드'},{e:'🍷',n:'와인'},{e:'🍞',n:'빵'},{e:'🌿',n:'허브'}],
      korean:[{e:'🥬',n:'김치'},{e:'🥣',n:'된장찌개'},{e:'🥢',n:'반찬'},{e:'🍵',n:'보리차'}],
      japanese:[{e:'🍵',n:'녹차'},{e:'🥢',n:'미소국'},{e:'🥒',n:'쓰케모노 (일본 절임)'},{e:'🍶',n:'사케 또는 일본 맥주'}],
    }
  },
};

/* ── Recipe steps & tips UI strings (all 14 languages) ── */
const RECIPE_STEPS_UI = {
  ro:{ prep:'Pregătește toate ingredientele: curăță, spală și taie tot conform rețetei.',
       serve:'Servește preparatul cald, decorat cu verdeață proaspătă sau ingredientele preferate.',
       tipLabel:'Sfat',
       tips:{ soup:'Nu lăsa supa să fiarbă intens după adăugarea smântânii sau ouălor pentru a preveni tăierea.',
              meat:'Lasă carnea să se odihnească 5 minute după gătire înainte de a o tăia sau servi.',
              fish:'Peștele este gata când carnea devine opacă și se desprinde ușor de os cu furculița.',
              pasta:'Adaugă câteva linguri din apa în care a fiert pasta în sos pentru o textură mai cremoasă.',
              dessert:'Lasă desertul să se răcească complet înainte de servire pentru textură și gust optime.',
              def:'Gustă preparatul înainte de servire și ajustează condimentele și sarea după gust.' }},
  en:{ prep:'Prepare all ingredients: wash, peel and cut everything as needed for the recipe.',
       serve:'Serve warm, garnished with fresh herbs or your favourite toppings.',
       tipLabel:'Tip',
       tips:{ soup:'Avoid vigorous boiling after adding cream or eggs to prevent curdling.',
              meat:'Let the meat rest for 5 minutes after cooking before slicing or serving.',
              fish:'Fish is ready when the flesh turns opaque and flakes easily with a fork.',
              pasta:'Add a splash of pasta cooking water to the sauce for a creamier texture.',
              dessert:'Let the dessert cool completely before serving for the best texture and flavour.',
              def:'Taste before serving and adjust seasoning and salt to your liking.' }},
  es:{ prep:'Prepara todos los ingredientes: lava, pela y corta todo según sea necesario.',
       serve:'Sirve caliente, adornado con hierbas frescas o tus guarniciones favoritas.',
       tipLabel:'Consejo',
       tips:{ soup:'Evita hervir vigorosamente tras añadir la nata o los huevos para evitar que se corte.',
              meat:'Deja reposar la carne 5 minutos tras cocinarla antes de cortarla o servirla.',
              fish:'El pescado está listo cuando la carne se vuelve opaca y se desmenuza fácilmente.',
              pasta:'Añade un poco del agua de cocción de la pasta a la salsa para una textura más cremosa.',
              dessert:'Deja enfriar completamente el postre antes de servir para la mejor textura.',
              def:'Prueba antes de servir y ajusta la sal y los condimentos a tu gusto.' }},
  fr:{ prep:'Prépare tous les ingrédients : lave, épluche et coupe tout selon les besoins.',
       serve:'Servir chaud, garni d\'herbes fraîches ou de tes garnitures préférées.',
       tipLabel:'Astuce',
       tips:{ soup:'Évite de faire bouillir vigoureusement après avoir ajouté la crème ou les œufs.',
              meat:'Laisse reposer la viande 5 minutes après cuisson avant de la couper ou servir.',
              fish:'Le poisson est cuit quand la chair devient opaque et se détache facilement à la fourchette.',
              pasta:'Ajoute un peu d\'eau de cuisson des pâtes dans la sauce pour une texture plus crémeuse.',
              dessert:'Laisse le dessert refroidir complètement avant de servir pour la meilleure texture.',
              def:'Goûte avant de servir et ajuste le sel et les épices selon ton goût.' }},
  de:{ prep:'Bereite alle Zutaten vor: waschen, schälen und nach Bedarf schneiden.',
       serve:'Warm servieren, garniert mit frischen Kräutern oder Lieblingstoppings.',
       tipLabel:'Tipp',
       tips:{ soup:'Nicht mehr stark kochen lassen, nachdem Sahne oder Eier hinzugefügt wurden.',
              meat:'Das Fleisch nach dem Garen 5 Minuten ruhen lassen, bevor es geschnitten wird.',
              fish:'Der Fisch ist fertig, wenn das Fleisch undurchsichtig wird und leicht von der Gabel fällt.',
              pasta:'Etwas Nudelkochwasser in die Soße geben, für eine cremigere Konsistenz.',
              dessert:'Das Dessert vollständig abkühlen lassen, bevor es serviert wird.',
              def:'Vor dem Servieren abschmecken und Salz und Gewürze nach Geschmack anpassen.' }},
  pt:{ prep:'Prepare todos os ingredientes: lave, descasque e corte conforme necessário.',
       serve:'Sirva quente, decorado com ervas frescas ou as suas coberturas favoritas.',
       tipLabel:'Dica',
       tips:{ soup:'Evite fervura intensa após adicionar creme ou ovos para evitar talhar.',
              meat:'Deixe a carne descansar 5 minutos após cozinhar antes de fatiar ou servir.',
              fish:'O peixe está pronto quando a carne fica opaca e se desfaz facilmente com um garfo.',
              pasta:'Adicione um pouco da água do cozimento da massa ao molho para uma textura mais cremosa.',
              dessert:'Deixe a sobremesa esfriar completamente antes de servir para a melhor textura.',
              def:'Prove antes de servir e ajuste o sal e os temperos a gosto.' }},
  ru:{ prep:'Подготовьте все ингредиенты: помойте, очистите и нарежьте по необходимости.',
       serve:'Подавайте тёплым, украсив свежей зеленью или любимыми добавками.',
       tipLabel:'Совет',
       tips:{ soup:'Не допускайте сильного кипения после добавления сливок или яиц, чтобы не свернулись.',
              meat:'Дайте мясу отдохнуть 5 минут после приготовления, прежде чем нарезать.',
              fish:'Рыба готова, когда мякоть становится непрозрачной и легко отходит от кости.',
              pasta:'Добавьте немного воды от варки пасты в соус для более кремовой текстуры.',
              dessert:'Дайте десерту полностью остыть перед подачей для лучшей текстуры.',
              def:'Попробуйте перед подачей и отрегулируйте соль и специи по вкусу.' }},
  ar:{ prep:'حضري جميع المكونات: اغسلي وقشري وقطعي كل شيء حسب الحاجة.',
       serve:'قدمي ساخناً مزيناً بالأعشاب الطازجة أو الإضافات المفضلة لديك.',
       tipLabel:'نصيحة',
       tips:{ soup:'تجنبي الغليان الشديد بعد إضافة القشدة أو البيض لمنع التقطع.',
              meat:'اتركي اللحم يرتاح 5 دقائق بعد الطهي قبل التقطيع أو التقديم.',
              fish:'السمك جاهز عندما يصبح اللحم معتماً وينفصل بسهولة بالشوكة.',
              pasta:'أضيفي القليل من ماء طهي المعكرونة إلى الصلصة للحصول على قوام أكثر كرمية.',
              dessert:'اتركي الحلوى تبرد تماماً قبل التقديم للحصول على أفضل قوام.',
              def:'تذوقي قبل التقديم واضبطي الملح والبهارات حسب الذوق.' }},
  zh:{ prep:'准备所有食材：根据需要清洗、去皮和切割。',
       serve:'趁热上桌，用新鲜香草或您最喜欢的配料装饰。',
       tipLabel:'小贴士',
       tips:{ soup:'加入奶油或鸡蛋后避免大火沸腾，以防凝固。',
              meat:'烹饪后让肉休息5分钟再切片或上桌。',
              fish:'鱼肉变不透明且用叉子易于剥落时即熟透。',
              pasta:'在酱汁中加入少量煮面水，口感更顺滑。',
              dessert:'上桌前让甜点完全冷却，以获得最佳口感。',
              def:'上桌前尝味，根据喜好调整盐和调料。' }},
  ja:{ prep:'全ての食材を準備する：必要に応じて洗い、皮をむき、切る。',
       serve:'新鮮なハーブやお好みのトッピングで飾り、温かいうちに盛り付ける。',
       tipLabel:'ポイント',
       tips:{ soup:'クリームや卵を加えた後は強火で煮立てないよう注意。',
              meat:'調理後、切る前に5分休ませると肉汁が保たれる。',
              fish:'魚は身が白くなり、フォークで簡単にほぐれたら完成。',
              pasta:'ゆで汁を少量ソースに加えるとよりクリーミーな仕上がりに。',
              dessert:'デザートは完全に冷めてから提供するのがベスト。',
              def:'提供前に味見して、塩と調味料を好みに合わせて調整する。' }},
  hi:{ prep:'सभी सामग्री तैयार करें: आवश्यकतानुसार धोएं, छीलें और काटें।',
       serve:'ताजे जड़ी-बूटियों या अपनी पसंदीदा टॉपिंग से सजाकर गरम परोसें।',
       tipLabel:'टिप',
       tips:{ soup:'क्रीम या अंडे डालने के बाद तेज उबाल से बचें।',
              meat:'परोसने से पहले पकी हुई मांस को 5 मिनट आराम दें।',
              fish:'मछली तब तैयार होती है जब मांस अपारदर्शी हो जाए और आसानी से अलग हो जाए।',
              pasta:'सॉस में पास्ता का थोड़ा पानी मिलाएं, क्रीमी टेक्सचर के लिए।',
              dessert:'सर्वोत्तम बनावट के लिए मिठाई को परोसने से पहले पूरी तरह ठंडा होने दें।',
              def:'परोसने से पहले चखें और नमक व मसाले स्वाद के अनुसार समायोजित करें।' }},
  tr:{ prep:'Tüm malzemeleri hazırlayın: gerektiğince yıkayın, soyun ve doğrayın.',
       serve:'Taze otlar veya favori malzemelerinizle süsleyerek sıcak servis yapın.',
       tipLabel:'İpucu',
       tips:{ soup:'Krema veya yumurta ekledikten sonra güçlü kaynamaktan kaçının.',
              meat:'Pişirdikten sonra kesmeden önce eti 5 dakika dinlendirin.',
              fish:'Balık, eti opaklaşıp çatalla kolayca ayrıldığında hazırdır.',
              pasta:'Daha kremamsı bir kıvam için makarna suyundan biraz sosa ekleyin.',
              dessert:'En iyi doku için tatlıyı servis etmeden önce tamamen soğumaya bırakın.',
              def:'Servis etmeden önce tadın, tuz ve baharatları damağınıza göre ayarlayın.' }},
  it:{ prep:'Prepara tutti gli ingredienti: lava, sbuccia e taglia tutto come necessario.',
       serve:'Servire caldo, guarnito con erbe fresche o i tuoi condimenti preferiti.',
       tipLabel:'Consiglio',
       tips:{ soup:'Evita di far bollire vigorosamente dopo aver aggiunto panna o uova.',
              meat:'Lascia riposare la carne 5 minuti dopo la cottura prima di tagliarla o servirla.',
              fish:'Il pesce è pronto quando la carne diventa opaca e si sfalda facilmente con la forchetta.',
              pasta:'Aggiungi un po\' dell\'acqua di cottura della pasta al sugo per una consistenza più cremosa.',
              dessert:'Lascia raffreddare completamente il dessert prima di servirlo per la migliore consistenza.',
              def:'Assaggia prima di servire e regola sale e spezie secondo il tuo gusto.' }},
  ko:{ prep:'모든 재료를 준비합니다: 레시피에 따라 씻고, 껍질을 벗기고 자릅니다.',
       serve:'신선한 허브나 좋아하는 토핑으로 장식하여 따뜻하게 제공합니다.',
       tipLabel:'팁',
       tips:{ soup:'크림이나 달걀을 넣은 후 강하게 끓이면 응고될 수 있으니 주의하세요.',
              meat:'고기를 썰거나 서빙하기 전에 5분 정도 휴지시켜 육즙을 보존하세요.',
              fish:'생선은 살이 불투명해지고 포크로 쉽게 분리될 때 완성됩니다.',
              pasta:'소스에 파스타 삶은 물을 조금 넣으면 더 크리미한 질감이 됩니다.',
              dessert:'최상의 식감을 위해 디저트는 완전히 식힌 후 제공하세요.',
              def:'제공하기 전에 맛을 보고 소금과 양념을 취향에 맞게 조절하세요.' }},
};

/* ── Recipe metadata helpers ── */
function recipeMetadata(ingr, steps, cat, code, overrides) {
  const ui = RECIPE_UI[code] || RECIPE_UI.en;
  const sc = steps.length;
  const ic = ingr.length;
  const activeMins = Math.min(Math.max(sc * 9 + 8, 15), 85);
  const roundTo5 = m => Math.round(m / 5) * 5;
  const totalMins = roundTo5(activeMins + (activeMins > 40 ? 30 : 20));
  const activeMinsR = roundTo5(activeMins);
  const fmt = m => m >= 60 ? `${Math.floor(m/60)}h${m%60>0?' '+(m%60)+'m':''}` : `${m}m`;
  const servings = (overrides && overrides.servings) ? overrides.servings : (ic < 5 ? 2 : ic < 9 ? 4 : 6);
  const diffIdx = sc <= 3 ? 0 : sc <= 5 ? 1 : 2;
  const ingrStr = ingr.join(' ').toLowerCase();
  const expensive = /beef|veal|lamb|salmon|shrimp|lobster|crab|truffle|saffron|chocolate|vițel|miel|somon|creveți|caracatiță/.test(ingrStr);
  return {
    totalTime: fmt(totalMins),
    activeTime: fmt(activeMinsR),
    servings,
    difficulty: ui.diffLevels[diffIdx],
    cost: expensive ? '$$' : '$',
  };
}

function isSoup(cat, n, ingr) {
  return /soup|supă|ciorbă|borș|soupe|suppe|sopa|zuppa|çorba/i.test(cat)
    || /ciorbă|borș|borscht|ramen|pho|solyanka|okroshka|harira|minestrone|bisque|gazpacho|laksa|tom\s*yum|tom\s*kha/i.test(n||'')
    || /\bbulion\b|\bstock\b|\bbroth\b|\bbouillon\b/i.test(ingr.join(' '));
}

function recipeFeatureCards(ingr, steps, cat, code, n) {
  const ui = RECIPE_UI[code] || RECIPE_UI.en;
  const ingrStr = ingr.join(' ').toLowerCase();
  const hasMeat = /beef|chicken|pork|lamb|turkey|duck|veal|tuna|carne|pui|porc|vită|miel|vițel|ton/.test(ingrStr);
  const hasFish = /salmon|trout|cod|shrimp|seafood|fish|anchov|pește|somon|păstrăv|creveți|caracatiță/.test(ingrStr);
  const soupRecipe = isSoup(cat, n, ingr);
  const isFreezer = soupRecipe || steps.length > 5;
  const cards = [
    hasFish ? ui.feat[1] : hasMeat ? ui.feat[0] : ui.feat[2],
    soupRecipe ? ui.feat[6] : ui.feat[7],
    ui.feat[3],
    isFreezer ? ui.feat[4] : ui.feat[5],
  ];
  return cards.map(f=>`<div class="recipe-feature-card"><span class="recipe-feature-icon">${f.icon}</span><div><p class="recipe-feature-title">${f.t}</p><p class="recipe-feature-desc">${f.d}</p></div></div>`).join('');
}

function recipeNutrition(ingr, cat) {
  const ingrStr = ingr.join(' ').toLowerCase();
  const catStr = (cat||'').toLowerCase();
  const hasMeat = /beef|chicken|pork|lamb|duck|turkey|veal|carne|pui|porc|vită|miel/.test(ingrStr);
  const hasFish = /salmon|trout|cod|tuna|fish|pește|somon|ton|păstrăv/.test(ingrStr);
  const isSoup = /soup|supă|ciorbă|borș|soupe|suppe|sopa|zuppa/.test(catStr);
  const isDesert = /dessert|desert|dolce|postre|tatlı|десерт/.test(catStr);
  const hasDairy = /cream|cheese|milk|smântână|brânză|lapte|parmezan|fromage|käse/.test(ingrStr);
  const hasGrain = /pasta|spaghetti|noodle|rice|orez|quinoa|orzo|couscous/.test(ingrStr);
  let cal=350, prot=18, carb=28, fat=12, fib=4;
  if (isSoup) { cal=185; prot=10; carb=16; fat=7; fib=3; }
  else if (isDesert) { cal=375; prot=5; carb=52; fat=14; fib=2; }
  else if (hasMeat) { cal=420; prot=32; carb=18; fat=20; fib=3; }
  else if (hasFish) { cal=285; prot=28; carb=12; fat=11; fib=2; }
  if (hasDairy) cal += 55;
  if (hasGrain) { carb += 18; cal += 75; }
  return { cal, prot, carb, fat, fib };
}

function recipePairings(ingr, cat, code, n, overrides) {
  const ui = RECIPE_UI[code] || RECIPE_UI.en;
  const p = ui.pairs;
  if (overrides && overrides.pairingsType && p[overrides.pairingsType]) {
    return p[overrides.pairingsType].map(x=>`<div class="pairing-chip">${x.e} ${esc(x.n)}</div>`).join('');
  }
  const ingrStr = ingr.join(' ').toLowerCase();
  const hasMeat = /beef|chicken|pork|lamb|turkey|duck|carne|pui|porc|vită|miel/.test(ingrStr);
  const hasFish = /salmon|trout|cod|tuna|shrimp|pește|somon|ton|păstrăv|creveți/.test(ingrStr);
  const hasPasta = /pasta|spaghetti|noodle|linguine|tagliatelle/.test(ingrStr);
  const isVeg = !hasMeat && !hasFish;
  const chosen = isSoup(cat,n,ingr) ? p.soup : hasFish ? p.fish : hasMeat ? p.meat : hasPasta ? p.pasta : isVeg ? p.veg : p.def;
  return chosen.map(x=>`<div class="pairing-chip">${x.e} ${esc(x.n)}</div>`).join('');
}

function padSteps(steps, code) {
  if (steps.length >= 4) return steps;
  const ui = RECIPE_STEPS_UI[code] || RECIPE_STEPS_UI.en;
  const result = [...steps];
  if (result.length < 4) result.unshift(ui.prep);
  if (result.length < 4) result.push(ui.serve);
  while (result.length < 4) result.push(ui.serve);
  return result;
}

function recipeTip(ingr, cat, code, n, overrides) {
  const ui = RECIPE_STEPS_UI[code] || RECIPE_STEPS_UI.en;
  const t = ui.tips;
  if (overrides && overrides.tipType && t[overrides.tipType]) return t[overrides.tipType];
  const ingrStr = ingr.join(' ').toLowerCase();
  const catStr  = (cat || '').toLowerCase();
  const hasFish   = /salmon|trout|cod|tuna|fish|pește|somon|ton|păstrăv|creveți|shrimp/.test(ingrStr);
  const hasMeat   = /beef|chicken|pork|lamb|turkey|duck|carne|pui|porc|vită|miel/.test(ingrStr);
  const hasPasta  = /pasta|spaghetti|noodle|linguine|tagliatelle|tăiței/.test(ingrStr);
  const isDesert  = /dessert|desert|dolce|postre|tatlı|десерт/i.test(catStr);
  if (isSoup(cat, n, ingr)) return t.soup;
  if (hasFish)  return t.fish;
  if (hasMeat)  return t.meat;
  if (hasPasta) return t.pasta;
  if (isDesert) return t.dessert;
  return t.def;
}

function recipeCardEmoji(cat) {
  const c = (cat||'').toLowerCase();
  if (/soup|supă|ciorbă|borș/.test(c)) return '🍲';
  if (/dessert|desert|dolce/.test(c)) return '🍰';
  if (/salad|salată/.test(c)) return '🥗';
  if (/breakfast|mic dejun/.test(c)) return '🍳';
  return '🍽️';
}

/* ════════════════════════════════════════════════════════════════
   GENERIC recipe page + index — works for ALL 14 languages
   ════════════════════════════════════════════════════════════════ */
function recipePage(recipe, rl) {
  const lc   = rl.lc;
  const code = lc.code;
  const ui   = RECIPE_UI[code] || RECIPE_UI.en;
  const n    = recipe.name?.[code]    || recipe.name?.en    || recipe.name?.ro    || '';
  const o    = recipe.origin?.[code]  || recipe.origin?.en  || recipe.origin?.ro  || '';
  const ingr = recipe.ingredients?.[code] || recipe.ingredients?.en || recipe.ingredients?.ro || [];
  const how  = recipe.howIsMade?.[code]   || recipe.howIsMade?.en   || recipe.howIsMade?.ro   || '';
  const cat  = recipe.category?.[code]    || recipe.category?.en    || recipe.category?.ro    || '';
  const originTxt = recipe.originText?.[code] || recipe.originText?.en || recipe.originText?.ro || rl.heroDesc(o);
  const rawSteps = how.split(/\.\s+/).filter(s => s.trim().length > 2);
  const steps = padSteps(rawSteps, code);
  const enName = recipe.name?.en || recipe.name?.ro || '';
  const rslug  = slug(enName);
  const pageUrl = `https://meal-planner.ro${rl.dir}/${rslug}/`;
  // Use recipe-specific image if it exists in public/images/, otherwise fall back to cover2.jpg
  const recipeImgFile = path.join(PUBLIC, 'images', `${rslug}.jpg`);
  const recipeImgUrl  = fs.existsSync(recipeImgFile)
    ? `https://meal-planner.ro/images/${rslug}.jpg`
    : 'https://meal-planner.ro/images/cover2.jpg';
  const appUrl  = rl.appDir ? `${rl.appDir}/` : '/';
  const overrides = { servings: recipe.servings, tipType: recipe.tipType, pairingsType: recipe.pairingsType };
  const meta    = recipeMetadata(ingr, steps, cat, code, overrides);
  const nutri   = recipeNutrition(ingr, cat);
  const emoji   = recipeCardEmoji(cat);
  const stepsUi = RECIPE_STEPS_UI[code] || RECIPE_STEPS_UI.en;
  const tip     = recipeTip(ingr, cat, code, n, overrides);
  const isSoupRecipe = /soup|supă|ciorbă|borș|soupe|suppe|sopa|zuppa|çorba/i.test(cat)
    || /ciorbă|borș|borscht|ramen|pho|solyanka|okroshka|harira|minestrone|bisque|potage|gazpacho|laksa|tom\s*yum|tom\s*kha/i.test(n)
    || /\bbulion\b|\bstock\b|\bbroth\b|\bbouillon\b/i.test(ingr.join(' '));
  const nutritionPer = isSoupRecipe ? ui.nutritionPer.replace(/~?\d+\s*g/i,'~350 ml') : ui.nutritionPer.replace(/~?\d+\s*ml/i,'~350 g');

  const jsonLd = JSON.stringify({
    "@context":"https://schema.org","@type":"Recipe","name":n,
    "image":[recipeImgUrl],
    "description":rl.pageDesc(n,o),
    "recipeIngredient":ingr,
    "recipeInstructions":steps.map(s=>({ "@type":"HowToStep","text":s })),
    "recipeCategory":cat,
    "prepTime":`PT${meta.activeTime}`,
    "totalTime":`PT${meta.totalTime}`,
    "recipeYield":`${meta.servings}`,
    "nutrition":{"@type":"NutritionInformation","calories":`${nutri.cal} kcal`},
    "author":{"@type":"Organization","name":"Meal-Planner.ro"},
    "url":pageUrl
  });

  // Related recipes — same origin, different name, up to 5
  const related = recipes
    .filter(r => (r.origin?.[code]||r.origin?.en) === o && (r.name?.[code]||r.name?.en) !== n)
    .slice(0,5)
    .map(r => {
      const rn = r.name?.[code] || r.name?.en || r.name?.ro || '';
      const rs = slug(r.name?.en || r.name?.ro || rn);
      const ri = r.ingredients?.[code] || r.ingredients?.en || [];
      const rh = r.howIsMade?.[code] || r.howIsMade?.en || '';
      const rst = rh.split(/\.\s+/).filter(s=>s.trim().length>2);
      const rcat = r.category?.[code] || r.category?.en || '';
      const rm = recipeMetadata(ri, rst, rcat, code);
      const re = recipeCardEmoji(rcat);
      return `<a href="${rl.dir}/${rs}/" class="recipe-card-item">
  <div class="recipe-card-img" data-card-recipe="${rs}">${re}</div>
  <div class="recipe-card-body">
    <p class="recipe-card-name">${esc(rn)}</p>
    <span class="recipe-card-meta">${rm.totalTime} · ${rm.difficulty}</span>
  </div>
</a>`;
    }).join('');

  const dir_attr = rl.dir_attr || 'ltr';
  return `${HEAD(rl.pageTitle(n), rl.pageDesc(n,o), `${rl.dir}/${rslug}/`, code, dir_attr)}
<script type="application/ld+json">${jsonLd}</script>
${makeNav(lc)}
<main class="content-main recipe-main">
<div class="recipe-page-wrap">

  <nav class="recipe-breadcrumb" aria-label="breadcrumb">
    <a href="/">${rl.breadHome}</a> › <a href="${rl.dir}/">${rl.breadLabel}</a> › <span>${esc(n)}</span>
  </nav>

  <!-- Hero -->
  <div class="recipe-hero-grid">
    <div class="recipe-hero-img-col">
      <div class="recipe-photo-container" data-recipe="${rslug}" id="recipe-photo-main">${emoji}</div>
    </div>
    <div class="recipe-hero-info-col">
      <div class="recipe-badge">⭐ ${esc(cat)} · ${esc(o)}</div>
      <h1>${esc(n)}</h1>
      <p class="recipe-tagline">${esc(originTxt)}</p>
      <div class="recipe-meta-row">
        <div class="recipe-meta-item"><i class="bi bi-clock"></i><span class="recipe-meta-label">${ui.totalTime}</span><span class="recipe-meta-value">${meta.totalTime}</span></div>
        <div class="recipe-meta-item"><i class="bi bi-fire"></i><span class="recipe-meta-label">${ui.activeTime}</span><span class="recipe-meta-value">${meta.activeTime}</span></div>
        <div class="recipe-meta-item"><i class="bi bi-people-fill"></i><span class="recipe-meta-label">${ui.servings}</span><span class="recipe-meta-value">${meta.servings}</span></div>
        <div class="recipe-meta-item"><i class="bi bi-pencil-fill"></i><span class="recipe-meta-label">${ui.difficulty}</span><span class="recipe-meta-value">${meta.difficulty}</span></div>
        <div class="recipe-meta-item"><i class="bi bi-currency-dollar"></i><span class="recipe-meta-label">${ui.cost}</span><span class="recipe-meta-value">${meta.cost}</span></div>
      </div>
      <div class="recipe-cta-row">
        <a href="${appUrl}?meal=${encodeURIComponent(n)}" class="btn-recipe-primary"><i class="bi bi-plus-circle-fill"></i> ${rl.addBtn(n)}</a>
        <button class="btn-recipe-outline btn-print-pdf" onclick="window.print()" title="${ui.pdfTitle}"><i class="bi bi-printer"></i> ${ui.pdfBtn}</button>
      </div>
    </div>
  </div>

  <!-- Feature Cards -->
  <div class="recipe-features-row">${recipeFeatureCards(ingr, steps, cat, code, n)}</div>

  <!-- 3-column content -->
  <div class="recipe-content-grid">
    <div class="recipe-ingredients-col">
      <h2>${rl.ingredientsH.replace(/^[🛒\s]+/,'')} <span class="servings-badge">${ui.servingsLabel(meta.servings)}</span></h2>
      <ul class="recipe-ingr-list-new">
        ${ingr.map(i=>`<li><span class="recipe-ingr-dot"></span>${esc(capFirst(i))}</li>`).join('\n        ')}
      </ul>
      <button class="btn-add-shopping"><i class="bi bi-cart-plus"></i> ${ui.addShopping}</button>
    </div>
    <div class="recipe-steps-col">
      <h2>${rl.howToH.replace(/^[👨‍🍳\s]+/,'')}</h2>
      <ol class="recipe-steps-new">
        ${steps.map((s,i)=>`<li><span class="step-num">${i+1}</span><span>${esc(s)}.</span></li>`).join('\n        ')}
      </ol>
      ${tip ? `<div class="recipe-tip-box"><span class="tip-icon">💡</span><div><strong>${stepsUi.tipLabel}:</strong> ${esc(tip)}</div></div>` : ''}
    </div>
    <div class="recipe-nutrition-col">
      <h2>${ui.nutritionH}</h2>
      <p class="nutrition-per">${nutritionPer}</p>
      <div class="nutrition-list">
        <div class="nutrition-row">${ui.cal} <span>${nutri.cal} kcal</span></div>
        <div class="nutrition-row">${ui.prot} <span>${nutri.prot} g</span></div>
        <div class="nutrition-row">${ui.carb} <span>${nutri.carb} g</span></div>
        <div class="nutrition-row">${ui.fat} <span>${nutri.fat} g</span></div>
        <div class="nutrition-row">${ui.fib} <span>${nutri.fib} g</span></div>
      </div>
      <p class="recipe-pairings-h">${ui.pairingsH}</p>
      <div class="pairings-grid">${recipePairings(ingr, cat, code, n, overrides)}</div>
    </div>
  </div>

  <!-- Related recipes -->
  ${related ? `<div class="recipe-related-section">
    <div class="recipe-related-header">
      <h2>${rl.relatedH(o)}</h2>
      <a href="${rl.dir}/">${ui.seeAll}</a>
    </div>
    <div class="recipe-cards-scroll">${related}</div>
  </div>` : ''}

  <!-- CTA Banner -->
  <div class="recipe-cta-banner">
    <span class="cta-banner-icon">🥗</span>
    <div class="cta-banner-text">
      <h3>${ui.ctaTitle}</h3>
      <p>${ui.ctaDesc}</p>
    </div>
    <a href="${appUrl}" class="btn-cta-banner">${ui.ctaBtn}</a>
  </div>

</div>
</main>${makeFooter(lc)}<script src="/js/content.js" defer></script></body></html>`;
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

// Pricing pages — one per language
for (const [lc_code] of Object.entries(LANG_CONFIGS)) {
  const sl = PRICING_SLUGS[lc_code];
  write(path.join(PUBLIC, lc_code, sl, 'index.html'), pricingPage(lc_code));
  count++;
}
console.log(`✅ 14 pricing pages generated → /{lang}/{slug}/`);

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

// Pricing pages — /pricing/ (English default) + 14 localised
sitemapUrls.push('https://meal-planner.ro/pricing/');
for (const [lc_code, sl] of Object.entries(PRICING_SLUGS)) {
  sitemapUrls.push(`https://meal-planner.ro/${lc_code}/${sl}/`);
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
