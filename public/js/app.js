document.addEventListener('DOMContentLoaded', () => {
  // 1. Elemente de bază
  const generateBtn = document.getElementById('generate-btn');
  const buyBtn = document.getElementById('pay-btn');
  const statusEl = document.getElementById('payment-status');
  const langSwitcher = document.getElementById('lang-switcher');

  // 2. Reset la succes Stripe (nelimitat după plată)
  const params = new URLSearchParams(window.location.search);
  if (params.get('success') === 'true') {
    localStorage.setItem('pdfCount', '0');
    localStorage.setItem('pdfFirst', Date.now());
    if (statusEl)
      statusEl.innerHTML = '✅ Plata a fost realizată cu succes! Poți genera PDF nelimitat acum.';
    if (generateBtn) generateBtn.style.display = 'inline-block';
    window.history.replaceState({}, '', window.location.pathname);
  }

  // 3. Dicționar i18n (limbile)
 const i18n = {
  ro: {
    weekdays: ['Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă','Duminică'],
    title: "Planificator Mese Săptămânal",
    header: "Planificator Mese & Lista de Cumpărături",
    "col.day": "Ziua",
    "col.lunch": "Prânz (ingrediente)",
    "col.dinner": "Cină (ingrediente)",
    shoppingList: "Lista de cumpărături",
    "btn.generate": "Generează PDF",
    "btn.pay": "Plătește & Descarcă",
    maxed: "Ai atins limita maximă de PDF-uri gratuite.<br>Plătește pentru a debloca descărcarea nelimitată!",
    placeholderL: "ex: cartofi, ceapă",
    placeholderD: "ex: pui, orez",
    "banner.unlock": "Ai plătit deja? Deblochează descărcări nelimitate PDF",
    "input.email": "Introdu emailul de plată",
    "btn.verify": "Verifică Email",
    "btn.download": "Descarcă PDF",
    "access.granted": "✅ Ai acces! Poți descărca PDF-ul nelimitat:"
  },
  en: {
    weekdays: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    title: "Weekly Meal Planner",
    header: "Weekly Meal Planner & Shopping List",
    "col.day": "Day",
    "col.lunch": "Lunch (ingredients)",
    "col.dinner": "Dinner (ingredients)",
    shoppingList: "Shopping List",
    "btn.generate": "Generate PDF",
    "btn.pay": "Pay & Download",
    maxed: "You have reached the maximum number of free PDFs.<br>Pay to unlock unlimited downloads!",
    placeholderL: "e.g. potatoes, onion",
    placeholderD: "e.g. chicken, rice",
    "banner.unlock": "Already paid? Unlock unlimited PDF downloads",
    "input.email": "Enter your payment email",
    "btn.verify": "Verify Email",
    "btn.download": "Download PDF",
    "access.granted": "✅ Access granted! You can download unlimited PDFs:"
  },
  es: {
    weekdays: ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'],
    title: "Planificador Semanal de Comidas",
    header: "Planificador de Comidas y Lista de Compras",
    "col.day": "Día",
    "col.lunch": "Almuerzo (ingredientes)",
    "col.dinner": "Cena (ingredientes)",
    shoppingList: "Lista de Compras",
    "btn.generate": "Generar PDF",
    "btn.pay": "Pagar y Descargar",
    maxed: "¡Has alcanzado el máximo de PDFs gratuitos!<br>¡Paga para descargas ilimitadas!",
    placeholderL: "ej: papas, cebolla",
    placeholderD: "ej: pollo, arroz",
    "banner.unlock": "¿Ya pagaste? ¡Desbloquea descargas ilimitadas de PDF!",
    "input.email": "Ingresa tu email de pago",
    "btn.verify": "Verificar Email",
    "btn.download": "Descargar PDF",
    "access.granted": "✅ ¡Acceso concedido! Puedes descargar PDFs ilimitados:"
  },
  fr: {
    weekdays: ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'],
    title: "Planificateur de Repas Hebdomadaire",
    header: "Planificateur de Repas & Liste de Courses",
    "col.day": "Jour",
    "col.lunch": "Déjeuner (ingrédients)",
    "col.dinner": "Dîner (ingrédients)",
    shoppingList: "Liste de Courses",
    "btn.generate": "Générer PDF",
    "btn.pay": "Payer & Télécharger",
    maxed: "Vous avez atteint la limite de PDFs gratuits.<br>Payer pour débloquer les téléchargements illimités !",
    placeholderL: "ex : pommes de terre, oignon",
    placeholderD: "ex : poulet, riz",
    "banner.unlock": "Déjà payé ? Débloquez les téléchargements PDF illimités",
    "input.email": "Entrez votre email de paiement",
    "btn.verify": "Vérifier l'email",
    "btn.download": "Télécharger le PDF",
    "access.granted": "✅ Accès accordé ! Vous pouvez télécharger des PDF illimités :"
  },
  ru: {
    weekdays: ['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'],
    title: "Еженедельный планировщик питания",
    header: "Планировщик питания & Список покупок",
    "col.day": "День",
    "col.lunch": "Обед (ингредиенты)",
    "col.dinner": "Ужин (ингредиенты)",
    shoppingList: "Список покупок",
    "btn.generate": "Создать PDF",
    "btn.pay": "Оплатить & Скачать",
    maxed: "Достигнут лимит бесплатных PDF.<br>Оплатите, чтобы разблокировать неограниченные загрузки!",
    placeholderL: "напр.: картофель, лук",
    placeholderD: "напр.: курица, рис",
    "banner.unlock": "Уже оплатили? Откройте неограниченные загрузки PDF",
    "input.email": "Введите ваш платежный email",
    "btn.verify": "Проверить Email",
    "btn.download": "Скачать PDF",
    "access.granted": "✅ Доступ предоставлен! Вы можете скачивать неограниченно PDF:"
  },
  zh: {
    weekdays: ['星期一','星期二','星期三','星期四','星期五','星期六','星期日'],
    title: "每周用餐计划器",
    header: "用餐计划器 & 购物清单",
    "col.day": "日期",
    "col.lunch": "午餐（食材）",
    "col.dinner": "晚餐（食材）",
    shoppingList: "购物清单",
    "btn.generate": "生成 PDF",
    "btn.pay": "支付并下载",
    maxed: "已达到免费PDF上限。<br>付费可无限下载！",
    placeholderL: "例如：土豆，洋葱",
    placeholderD: "例如：鸡肉，米饭",
    "banner.unlock": "已经付款？解锁无限PDF下载",
    "input.email": "请输入您的付款邮箱",
    "btn.verify": "验证邮箱",
    "btn.download": "下载 PDF",
    "access.granted": "✅ 已授权！你可以无限下载PDF："
  },
  ja: {
    weekdays: ['月曜日','火曜日','水曜日','木曜日','金曜日','土曜日','日曜日'],
    title: "週間ミールプランナー",
    header: "ミールプランナー＆買い物リスト",
    "col.day": "日付",
    "col.lunch": "昼食（材料）",
    "col.dinner": "夕食（材料）",
    shoppingList: "買い物リスト",
    "btn.generate": "PDFを作成",
    "btn.pay": "支払ってダウンロード",
    maxed: "無料PDFの上限に達しました。<br>無制限ダウンロードは有料！",
    placeholderL: "例：ジャガイモ、玉ねぎ",
    placeholderD: "例：鶏肉、ご飯",
    "banner.unlock": "すでに支払いましたか？無制限PDFダウンロードを解除",
    "input.email": "支払いメールを入力してください",
    "btn.verify": "メールを確認する",
    "btn.download": "PDFをダウンロード",
    "access.granted": "✅ アクセス許可！無制限にPDFをダウンロードできます："
  },
  pt: {
    weekdays: ['Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado','Domingo'],
    title: "Planejador Semanal de Refeições",
    header: "Planejador de Refeições & Lista de Compras",
    "col.day": "Dia",
    "col.lunch": "Almoço (ingredientes)",
    "col.dinner": "Jantar (ingredientes)",
    shoppingList: "Lista de Compras",
    "btn.generate": "Gerar PDF",
    "btn.pay": "Pagar & Baixar",
    maxed: "Você atingiu o limite de PDFs gratuitos.<br>Pague para desbloquear downloads ilimitados!",
    placeholderL: "ex: batata, cebola",
    placeholderD: "ex: frango, arroz",
    "banner.unlock": "Já pagou? Desbloqueie downloads ilimitados de PDF",
    "input.email": "Digite seu e-mail de pagamento",
    "btn.verify": "Verificar Email",
    "btn.download": "Baixar PDF",
    "access.granted": "✅ Acesso concedido! Você pode baixar PDFs ilimitados:"
  },
  de: {
    weekdays: ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'],
    title: "Wöchentlicher Essensplaner",
    header: "Essensplaner & Einkaufsliste",
    "col.day": "Tag",
    "col.lunch": "Mittagessen (Zutaten)",
    "col.dinner": "Abendessen (Zutaten)",
    shoppingList: "Einkaufsliste",
    "btn.generate": "PDF erstellen",
    "btn.pay": "Bezahlen & Herunterladen",
    maxed: "Du hast das Limit kostenloser PDFs erreicht.<br>Zahle für unbegrenzte Downloads!",
    placeholderL: "z.B.: Kartoffeln, Zwiebeln",
    placeholderD: "z.B.: Hähnchen, Reis",
    "banner.unlock": "Schon bezahlt? Entsperre unbegrenzte PDF-Downloads",
    "input.email": "Geben Sie Ihre Zahlungs-E-Mail ein",
    "btn.verify": "E-Mail überprüfen",
    "btn.download": "PDF herunterladen",
    "access.granted": "✅ Zugang gewährt! Sie können unbegrenzt PDFs herunterladen:"
  },
  ar: {
    weekdays: ['الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت','الأحد'],
    title: "مخطط وجبات أسبوعي",
    header: "مخطط الوجبات وقائمة التسوق",
    "col.day": "اليوم",
    "col.lunch": "الغداء (المكونات)",
    "col.dinner": "العشاء (المكونات)",
    shoppingList: "قائمة التسوق",
    "btn.generate": "إنشاء PDF",
    "btn.pay": "ادفع وحمّل",
    maxed: "لقد وصلت إلى الحد الأقصى من ملفات PDF المجانية.<br>ادفع لتحميل غير محدود!",
    placeholderL: "مثال: بطاطس، بصل",
    placeholderD: "مثال: دجاج، أرز",
    "banner.unlock": "هل دفعت بالفعل؟ افتح تنزيلات PDF غير المحدودة",
    "input.email": "أدخل بريدك الإلكتروني للدفع",
    "btn.verify": "تحقق من البريد الإلكتروني",
    "btn.download": "تحميل PDF",
    "access.granted": "✅ لديك حق الوصول! يمكنك تحميل PDF بلا حدود:"
  },
  hi: {
    weekdays: ['सोमवार','मंगलवार','बुधवार','गुरुवार','शुक्रवार','शनिवार','रविवार'],
    title: "साप्ताहिक भोजन योजना",
    header: "भोजन योजनाकार और खरीदारी सूची",
    "col.day": "दिन",
    "col.lunch": "दोपहर का भोजन (सामग्री)",
    "col.dinner": "रात का खाना (सामग्री)",
    shoppingList: "खरीदारी की सूची",
    "btn.generate": "PDF बनाएँ",
    "btn.pay": "भुगतान और डाउनलोड",
    maxed: "आपने मुफ्त PDF की अधिकतम सीमा तक पहुँच गए हैं।<br>अनलिमिटेड डाउनलोड के लिए भुगतान करें!",
    placeholderL: "उदा: आलू, प्याज",
    placeholderD: "उदा: चिकन, चावल",
    "banner.unlock": "क्या आपने भुगतान कर दिया है? असीमित PDF डाउनलोड अनलॉक करें",
    "input.email": "अपना भुगतान ईमेल दर्ज करें",
    "btn.verify": "ईमेल सत्यापित करें",
    "btn.download": "PDF डाउनलोड करें",
    "access.granted": "✅ पहुँच प्राप्त! आप अनलिमिटेड PDF डाउनलोड कर सकते हैं:"
  }
};

  // 4. Mesaj impact pentru PDF (personalizabil pe limbă)
  const pdfMessages = {
    ro: "Ai grijă de sănătatea ta și a familiei tale! Alege cumpătat, gătește cu drag și bucură-te de fiecare masă!",
    en: "Take care of your health and your family! Cook with love and enjoy every meal!",
    es: "¡Cuida tu salud y la de tu familia! ¡Cocina con amor y disfruta cada comida!",
    fr: "Prenez soin de votre santé et de votre famille ! Cuisinez avec amour et profitez de chaque repas !",
    ru: "Берегите здоровье своё и своей семьи! Готовьте с любовью и наслаждайтесь каждым приёмом пищи!",
    zh: "关爱自己和家人的健康！用心烹饪，享受每一餐！",
    ja: "あなたと家族の健康を大切に！愛情を込めて料理し、毎日の食事を楽しんでください！",
    pt: "Cuide da sua saúde e da sua família! Cozinhe com amor e aproveite cada refeição!",
    de: "Achte auf deine Gesundheit und die deiner Familie! Koche mit Liebe und genieße jede Mahlzeit!",
    ar: "اعتنِ بصحتك وصحة عائلتك! اطبخ بحب واستمتع بكل وجبة!",
    hi: "अपनी और अपने परिवार की सेहत का ख्याल रखें! प्यार से पकाएं और हर भोजन का आनंद लें!"
  };

  // 5. Populează selectul de limbă
  const langNames = {
    ro: "Română", en: "English", es: "Español", fr: "Français",
    ru: "Русский", zh: "中文", ja: "日本語", pt: "Português",
    de: "Deutsch", ar: "العربية", hi: "हिन्दी"
  };
  const seoParagraphs = {
  ro: `
    <p>
      <strong>Aplică organizarea meselor zilnice cu planificatorul nostru săptămânal!</strong> Planifică meniul fiecărei zile, adaugă rețete și ingrediente, iar la final obții automat lista de cumpărături pentru întreaga săptămână, gata de tipărit sau salvat PDF.
    </p>
    <p>
      Instrumentul online este ideal pentru familii ocupate, persoane care țin dietă, sau oricine dorește să economisească timp și să reducă risipa alimentară. Gătești mai eficient, faci cumpărături mai rapid și controlezi mai ușor bugetul casei.
    </p>
    <p>
      Folosește plannerul gratuit, în limba română – nu necesită cont, fără reclame, direct din browser!
    </p>
  `,
  ar: `
    <p>
      <strong>مخطط وجبات أسبوعي عبر الإنترنت</strong> – أنشئ خطة وجباتك للأسبوع بالكامل، ووفر الوقت والمال، واستمتع بوجبات صحية مع عائلتك. تطبيقنا المجاني يتيح لك تسجيل وجباتك اليومية، وإنشاء قائمة تسوق تلقائياً، وتحميل كل ذلك بصيغة PDF.
    </p>
    <p>
      سواء كنت ترغب في تنظيم وجبات الأطفال، أو اتباع نظام غذائي متوازن، أو فقط ترغب في إدارة ميزانيتك بشكل أفضل، هذا المخطط يساعدك على الالتزام بالخطة وتجنب هدر الطعام. كل شيء سريع وسهل الاستخدام عبر الإنترنت، ويمكنك استخدام التطبيق بأي لغة تريدها!
    </p>
    <p>
      جرب مخطط الوجبات الأسبوعي المجاني – بسيط، مفيد، ولا حاجة لحساب!
    </p>
  `,
  de: `
    <p>
      <strong>Wöchentlicher Essensplaner online</strong> – Erstelle deinen Menüplan für die ganze Woche, spare Zeit und Geld und genieße gesunde Mahlzeiten mit der Familie. Unsere kostenlose App hilft dir dabei, deine täglichen Gerichte festzuhalten, automatisch eine Einkaufsliste zu generieren und alles als PDF herunterzuladen.
    </p>
    <p>
      Egal ob du die Mahlzeiten für Kinder organisieren möchtest, einer ausgewogenen Ernährung folgen willst oder einfach effizienter mit deinem Budget umgehen möchtest – dieser Planer hilft dir, am Plan zu bleiben und Lebensmittelverschwendung zu vermeiden. Alles ist schnell, online und du kannst die App in jeder gewünschten Sprache nutzen!
    </p>
    <p>
      Probiere den kostenlosen wöchentlichen Essensplaner aus – einfach, praktisch und ohne Anmeldung!
    </p>
  `,
  en: `
    <p>
      <strong>Weekly Meal Planner Online</strong> – Plan your entire week's menu, save time and money, and enjoy healthy meals with your family. Our free app lets you organize daily recipes, automatically generate a shopping list, and download everything as a PDF.
    </p>
    <p>
      Whether you want to meal prep for your kids, follow a balanced diet, or just be more efficient with your budget, this planner helps you stay organized and avoid food waste. Fast, online, and available in any language you choose!
    </p>
    <p>
      Try our free weekly meal planner – simple, useful, and no registration needed!
    </p>
  `,
  es: `
    <p>
      <strong>Planificador semanal de comidas online</strong> – Organiza el menú de toda la semana, ahorra tiempo y dinero, y disfruta de comidas saludables en familia. Nuestra aplicación gratuita te permite anotar lo que cocinas cada día, generar automáticamente la lista de la compra y descargar todo en PDF.
    </p>
    <p>
      Ya sea que quieras planificar comidas para los niños, seguir una dieta equilibrada o simplemente gestionar mejor tu presupuesto, este planificador te ayuda a cumplir tu plan y evitar el desperdicio de alimentos. ¡Todo es rápido, online y puedes usar la app en cualquier idioma que desees!
    </p>
    <p>
      ¡Prueba el planificador semanal de comidas gratis – sencillo, útil y sin registro!
    </p>
  `,
  fr: `
    <p>
      <strong>Planificateur de repas hebdomadaire en ligne</strong> – Créez votre menu pour toute la semaine, gagnez du temps et de l’argent, et profitez de repas sains en famille. Notre application gratuite vous permet de noter vos plats chaque jour, de générer automatiquement la liste de courses et de tout télécharger au format PDF.
    </p>
    <p>
      Que vous souhaitiez organiser les repas pour les enfants, suivre un régime équilibré ou simplement gérer votre budget plus efficacement, ce planificateur vous aide à respecter votre planning et à éviter le gaspillage alimentaire. Tout est rapide, en ligne, et vous pouvez utiliser l’application dans la langue de votre choix !
    </p>
    <p>
      Essayez le planificateur de repas hebdomadaire gratuit – simple, utile et sans inscription !
    </p>
  `,
  hi: `
    <p>
      <strong>साप्ताहिक भोजन योजना ऑनलाइन</strong> – पूरे सप्ताह का मेनू बनाएं, समय और पैसे बचाएं और परिवार के साथ सेहतमंद भोजन का आनंद लें। हमारी फ्री ऐप से आप रोज़ाना का भोजन प्लान कर सकते हैं, शॉपिंग लिस्ट अपने आप बना सकते हैं और सब कुछ PDF में डाउनलोड कर सकते हैं।
    </p>
    <p>
      चाहे आप बच्चों के लिए भोजन प्लान करना चाहते हों, संतुलित डाइट फॉलो करना चाहते हों या बजट को बेहतर बनाना चाहते हों – यह प्लानर आपको संगठित रहने और भोजन की बर्बादी रोकने में मदद करेगा। सब कुछ तेज़, ऑनलाइन और किसी भी भाषा में उपलब्ध!
    </p>
    <p>
      मुफ्त साप्ताहिक भोजन योजना आज़माएँ – आसान, उपयोगी और बिना रजिस्ट्रेशन!
    </p>
  `,
  ja: `
    <p>
      <strong>週間ミールプランナー（オンライン）</strong> – 1週間分のメニューを計画し、時間とお金を節約しながら家族で健康的な食事を楽しみましょう。無料アプリで毎日の料理を記録し、自動的に買い物リストを作成して、すべてをPDFでダウンロードできます。
    </p>
    <p>
      子どものための食事管理、バランスの良い食事、または予算管理をしたい方にも、このプランナーがあれば計画的に進められ、食品ロスも防げます。高速・オンラインで、好きな言語で使えます！
    </p>
    <p>
      無料の週間ミールプランナーをぜひお試しください – シンプルで便利、登録不要です！
    </p>
  `,
  pt: `
    <p>
      <strong>Planejador semanal de refeições online</strong> – Monte o cardápio da semana inteira, economize tempo e dinheiro, e aproveite refeições saudáveis com a família. Nosso aplicativo gratuito permite anotar o que você vai cozinhar, gerar a lista de compras automaticamente e baixar tudo em PDF.
    </p>
    <p>
      Seja para organizar as refeições das crianças, seguir uma dieta equilibrada ou controlar melhor o orçamento, este planejador ajuda você a seguir o plano e evitar desperdício de alimentos. Tudo é rápido, online e disponível em qualquer idioma!
    </p>
    <p>
      Experimente o planejador semanal de refeições grátis – simples, útil e sem cadastro!
    </p>
  `,
  ru: `
    <p>
      <strong>Еженедельный планировщик питания онлайн</strong> – Составляйте меню на всю неделю, экономьте время и деньги, наслаждайтесь полезными семейными обедами и ужинами. Наше бесплатное приложение позволит вам записывать блюда на каждый день, автоматически создавать список покупок и скачивать всё в PDF.
    </p>
    <p>
      Хотите планировать питание для детей, придерживаться сбалансированной диеты или просто эффективно расходовать бюджет – этот планировщик поможет вам следовать плану и избежать пищевых отходов. Всё быстро, онлайн, и вы можете выбрать любой язык!
    </p>
    <p>
      Попробуйте бесплатный еженедельный планировщик питания – просто, удобно и без регистрации!
    </p>
  `,
  zh: `
    <p>
      <strong>每周膳食计划在线工具</strong> – 制定一整周的菜单，节省时间和金钱，与家人一起享受健康美味的餐食。我们的免费应用让你记录每天的食谱，自动生成购物清单，并支持一键下载PDF。
    </p>
    <p>
      无论是为孩子安排饮食、坚持均衡营养，还是提升家庭预算效率，这款计划工具都能帮你更好地坚持计划，减少食物浪费。一切都很快捷、在线，并可支持多种语言！
    </p>
    <p>
      立即体验免费的每周膳食计划工具 – 简单、实用、无需注册！
    </p>
  `
};
  Object.keys(i18n).forEach(code => {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = langNames[code];
    langSwitcher.append(opt);
  });

  // 6. Limba implicită (păstrează și la refresh)
  let lang = localStorage.getItem('lastLang') || navigator.language.slice(0,2);
  if (!i18n[lang]) lang = 'ro';
  langSwitcher.value = lang;

  langSwitcher.addEventListener('change', function() {
  lang = langSwitcher.value;
  localStorage.setItem('lastLang', lang);
  applyTranslations();
  updateButtonState();
});

  // 7. Tabelul planner și traduceri
  function renderTable() {
    const tbody = document.getElementById('plan-table');
    tbody.innerHTML = '';
    i18n[lang].weekdays.forEach((day, idx) => {
      tbody.insertAdjacentHTML('beforeend', `
        <tr class="planner-row">
          <td><strong>${day}</strong></td>
          <td><input id="d${idx+1}l" class="form-control" placeholder="${i18n[lang].placeholderL}"></td>
          <td><input id="d${idx+1}c" class="form-control" placeholder="${i18n[lang].placeholderD}"></td>
        </tr>
      `);
    });
  }

 function applyTranslations() {
  // 1. Texte cu data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[lang][key]) el.innerHTML = i18n[lang][key];
  });

  // 2. Placeholder pentru inputuri cu data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (i18n[lang][key]) el.placeholder = i18n[lang][key];
  });

  // 3. Buton „Descarcă PDF” după plată (dinamic)
  const paidBtn = document.getElementById('paid-generate-pdf');
  if (paidBtn) paidBtn.innerHTML = i18n[lang]["btn.download"] || "Descarcă PDF";

  // 4. Titlul paginii
  document.title = i18n[lang].title;

  // 5. Tabelul planner
  renderTable();

  // 6. Butoane generate & pay
  if (generateBtn)
    generateBtn.innerHTML = '<i class="bi bi-file-earmark-pdf-fill"></i> ' + i18n[lang]["btn.generate"];
  if (buyBtn)
    buyBtn.innerHTML = '<i class="bi bi-cart-check-fill"></i> ' + i18n[lang]["btn.pay"];

  // 7. Paragraful SEO (acesta e nou!)
  const seoContainer = document.getElementById('seo-paragraph');
  if (seoContainer && seoParagraphs[lang]) {
    seoContainer.innerHTML = seoParagraphs[lang];
  }
}

  

  // 8. Limita PDF-urilor la 3 / 24h
  let pdfCount = +localStorage.getItem('pdfCount') || 0;
  let pdfFirst = +localStorage.getItem('pdfFirst') || 0;

  function resetPdfQuotaIfNeeded() {
    const now = Date.now();
    if (!pdfFirst || (now - pdfFirst > 86400000)) {
      pdfCount = 0;
      pdfFirst = now;
      localStorage.setItem('pdfCount', pdfCount);
      localStorage.setItem('pdfFirst', pdfFirst);
    }
  }
  resetPdfQuotaIfNeeded();

  // 9. State butoane
  function updateButtonState() {
    resetPdfQuotaIfNeeded();
    if (!generateBtn || !buyBtn || !statusEl) return;
    if (pdfCount < 3) {
      generateBtn.style.display = 'inline-block';
      buyBtn.style.display = 'none';
      statusEl.innerHTML = '';
    } else {
      generateBtn.style.display = 'none';
      buyBtn.style.display = 'inline-block';
      statusEl.innerHTML = i18n[lang].maxed;
    }
  }
  updateButtonState();

  // 10. Colectează mese + shopping list
  function collectMeals() {
    return i18n[lang].weekdays.map((_, i) => ({
      day: document.querySelector(`#plan-table tr:nth-child(${i+1}) td strong`).textContent,
      lunch: document.getElementById(`d${i+1}l`).value.trim(),
      dinner: document.getElementById(`d${i+1}c`).value.trim()
    }));
  }
  function renderShoppingList(meals) {
    const ul = document.getElementById('shopping-list');
    ul.innerHTML = '';
    meals.forEach(m => {
      if (m.lunch || m.dinner) {
        ul.insertAdjacentHTML('beforeend', `<li class="list-group-item"><strong>${m.day}</strong></li>`);
        if (m.lunch)
          ul.insertAdjacentHTML('beforeend',
            `<li class="list-group-item ps-4">${i18n[lang]["col.lunch"]}: ${m.lunch}</li>`
          );
        if (m.dinner)
          ul.insertAdjacentHTML('beforeend',
            `<li class="list-group-item ps-4">${i18n[lang]["col.dinner"]}: ${m.dinner}</li>`
          );
      }
    });
  }

  // 11. Generare PDF doar cu mesaj impact și listă cumpărături
  function generatePDFimpact() {
    const meals = collectMeals();

    // Construiește HTML-ul listei pentru PDF (fără Bootstrap)
    let shoppingHTML = `<ul style="list-style-type:disc; text-align:left; margin:auto; max-width:360px;">`;
    meals.forEach(m => {
      if (m.lunch || m.dinner) {
        shoppingHTML += `<li><strong>${m.day}</strong>`;
        let details = [];
        if (m.lunch) details.push(i18n[lang]["col.lunch"] + ': ' + m.lunch);
        if (m.dinner) details.push(i18n[lang]["col.dinner"] + ': ' + m.dinner);
        shoppingHTML += (details.length ? "<ul>" + details.map(d=>`<li>${d}</li>`).join('') + "</ul>" : "");
        shoppingHTML += "</li>";
      }
    });
    shoppingHTML += "</ul>";

    // Setează mesaj și listă în zona dedicată PDF
    document.getElementById('pdf-impact-message').innerHTML = pdfMessages[lang] || pdfMessages['ro'];
    document.getElementById('pdf-list').innerHTML = `<h3 style="margin-bottom:15px;">${i18n[lang].shoppingList}</h3>${shoppingHTML}`;

    // Ascunde tot conținutul vizibil
    Array.from(document.body.children).forEach(node => node.style.display = 'none');
    // Arată doar zona pentru PDF
    document.getElementById('pdf-impact-area').style.display = '';

    html2pdf().set({
      margin: 0.5,
      filename: 'lista-cumparaturi.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    })
    .from(document.getElementById('pdf-impact-area'))
    .save()
    .then(() => {
      // Revino la afișarea normală
      Array.from(document.body.children).forEach(node => node.style.display = '');
      document.getElementById('pdf-impact-area').style.display = 'none';
    })
    .catch(() => {
      Array.from(document.body.children).forEach(node => node.style.display = '');
      document.getElementById('pdf-impact-area').style.display = 'none';
      alert('Eroare la generarea PDF-ului!');
    });
  }

  // 12. Buton verde „Generate PDF”
  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      resetPdfQuotaIfNeeded();
      if (pdfCount >= 3) {
        updateButtonState();
        return;
      }
      generatePDFimpact();
      pdfCount++;
      if (pdfCount === 1) pdfFirst = Date.now();
      localStorage.setItem('pdfCount', pdfCount);
      localStorage.setItem('pdfFirst', pdfFirst);
      updateButtonState();
    });
  }

  // 13. Atașează pentru butonul albastru „Descarcă PDF” (dinamic)
  const resultDiv = document.getElementById('result');
  if (resultDiv) {
    const observer = new MutationObserver(() => {
      const paidBtn = document.getElementById('paid-generate-pdf');
      if (paidBtn && !paidBtn.dataset.attached) {
        paidBtn.onclick = generatePDFimpact;
        paidBtn.dataset.attached = "1";
      }
    });
    observer.observe(resultDiv, { childList: true, subtree: true });
  }
  applyTranslations();
});


