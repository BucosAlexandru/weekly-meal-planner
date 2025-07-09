// js/app.js
document.addEventListener('DOMContentLoaded', () => {
  // ─── 0) Ascunde butonul de PDF la încărcare ───
  const generateBtn = document.getElementById('generate-btn');
  if (generateBtn) {
    generateBtn.style.display = 'none';
  }

  // ─── 1) Reset după Stripe Checkout success ───
  const params = new URLSearchParams(window.location.search);
  if (params.get('success') === 'true') {
    // resetează contorul de PDF-uri
    localStorage.setItem('pdfCount', '0');
    // mesaj de confirmare
    const status = document.getElementById('payment-status');
    if (status) {
      status.innerHTML = '✅ Plata a fost realizată cu succes! Poți genera PDF nelimitat acum.';
    }
    // afișează butonul de PDF
    if (generateBtn) {
      generateBtn.style.display = 'inline-block';
    }
    // curăță flag-ul din URL
    window.history.replaceState({}, '', window.location.pathname);
  }

  // ─── 2) i18n dictionary ───
  const i18n = {
    ro: {
      weekdays:   ['Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă','Duminică'],
      title:      "Planificator Mese Săptămânal",
      header:     "Planificator Mese & Lista de Cumpărături",
      "col.day":  "Ziua",
      "col.lunch":"Prânz (ingrediente)",
      "col.dinner":"Cină (ingrediente)",
      shoppingList:"Lista de cumpărături",
      "btn.generate":"Generează PDF",
      "btn.pay":  "Pay & Download",
      processing: "Se procesează plata...",
      maxed:      "Ai atins limita maximă de PDF-uri gratuite.<br>Plătește pentru a debloca descărcarea nelimitată!",
      placeholderL:"ex: cartofi, ceapă",
      placeholderD:"ex: pui, orez"
    },
    en: {
      weekdays:   ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
      title:      "Weekly Meal Planner",
      header:     "Weekly Meal Planner & Shopping List",
      "col.day":  "Day",
      "col.lunch":"Lunch (ingredients)",
      "col.dinner":"Dinner (ingredients)",
      shoppingList:"Shopping List",
      "btn.generate":"Generate PDF",
      "btn.pay":  "Pay & Download",
      processing: "Processing payment...",
      maxed:      "You have reached the maximum number of free PDFs.<br>Pay to unlock unlimited downloads!",
      placeholderL:"e.g. potatoes, onion",
      placeholderD:"e.g. chicken, rice"
    },
      es: {
        weekdays:   ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'],
        title:      "Planificador Semanal de Comidas",
        header:     "Planificador de Comidas y Lista de Compras",
        "col.day":  "Día",
        "col.lunch":"Almuerzo (ingredientes)",
        "col.dinner":"Cena (ingredientes)",
        shoppingList:"Lista de Compras",
        "btn.generate":"Generar PDF",
        "btn.pay":  "Pagar y Descargar",
        placeholderL:"ej: papas, cebolla",
        placeholderD:"ej: pollo, arroz"
      },
      fr: {
        weekdays:   ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'],
        title:      "Planificateur de Repas Hebdomadaire",
        header:     "Planificateur de Repas & Liste de Courses",
        "col.day":  "Jour",
        "col.lunch":"Déjeuner (ingrédients)",
        "col.dinner":"Dîner (ingrédients)",
        shoppingList:"Liste de Courses",
        "btn.generate":"Générer PDF",
        "btn.pay":  "Payer & Télécharger",
        placeholderL:"ex : pommes de terre, oignon",
        placeholderD:"ex : poulet, riz"
      },
      ru: {
        weekdays:   ['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'],
        title:      "Еженедельный планировщик питания",
        header:     "Планировщик питания & Список покупок",
        "col.day":  "День",
        "col.lunch":"Обед (ингредиенты)",
        "col.dinner":"Ужин (ингредиенты)",
        shoppingList:"Список покупок",
        "btn.generate":"Создать PDF",
        "btn.pay":  "Оплатить & Скачать",
        placeholderL:"напр.: картофель, лук",
        placeholderD:"напр.: курица, рис"
      },
      zh: {
        weekdays:   ['星期一','星期二','星期三','星期四','星期五','星期六','星期日'],
        title:      "每周用餐计划器",
        header:     "用餐计划器 & 购物清单",
        "col.day":  "日期",
        "col.lunch":"午餐（食材）",
        "col.dinner":"晚餐（食材）",
        shoppingList:"购物清单",
        "btn.generate":"生成 PDF",
        "btn.pay":  "支付并下载",
        placeholderL:"例如：土豆，洋葱",
        placeholderD:"例如：鸡肉，米饭"
      },
      ja: {
        weekdays:   ['月曜日','火曜日','水曜日','木曜日','金曜日','土曜日','日曜日'],
        title:      "週間ミールプランナー",
        header:     "ミールプランナー＆買い物リスト",
        "col.day":  "日付",
        "col.lunch":"昼食（材料）",
        "col.dinner":"夕食（材料）",
        shoppingList:"買い物リスト",
        "btn.generate":"PDFを作成",
        "btn.pay":  "支払ってダウンロード",
        placeholderL:"例：ジャガイモ、玉ねぎ",
        placeholderD:"例：鶏肉、ご飯"
      },
      pt: {
        weekdays:   ['Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado','Domingo'],
        title:      "Planejador Semanal de Refeições",
        header:     "Planejador de Refeições & Lista de Compras",
        "col.day":  "Dia",
        "col.lunch":"Almoço (ingredientes)",
        "col.dinner":"Jantar (ingredientes)",
        shoppingList:"Lista de Compras",
        "btn.generate":"Gerar PDF",
        "btn.pay":  "Pagar & Baixar",
        placeholderL:"ex: batata, cebola",
        placeholderD:"ex: frango, arroz"
      },
      de: {
        weekdays:   ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'],
        title:      "Wöchentlicher Essensplaner",
        header:     "Essensplaner & Einkaufsliste",
        "col.day":  "Tag",
        "col.lunch":"Mittagessen (Zutaten)",
        "col.dinner":"Abendessen (Zutaten)",
        shoppingList:"Einkaufsliste",
        "btn.generate":"PDF erstellen",
        "btn.pay":  "Bezahlen & Herunterladen",
        placeholderL:"z.B.: Kartoffeln, Zwiebeln",
        placeholderD:"z.B.: Hähnchen, Reis"
      },
      ar: {
        weekdays:   ['الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت','الأحد'],
        title:      "مخطط وجبات أسبوعي",
        header:     "مخطط الوجبات وقائمة التسوق",
        "col.day":  "اليوم",
        "col.lunch":"الغداء (المكونات)",
        "col.dinner":"العشاء (المكونات)",
        shoppingList:"قائمة التسوق",
        "btn.generate":"إنشاء PDF",
        "btn.pay":  "ادفع وحمّل",
        placeholderL:"مثال: بطاطس، بصل",
        placeholderD:"مثال: دجاج، أرز"
      },
      hi: {
        weekdays:   ['सोमवार','मंगलवार','बुधवार','गुरुवार','शुक्रवार','शनिवार','रविवार'],
        title:      "साप्ताहिक भोजन योजना",
        header:     "भोजन योजनाकार और खरीदारी सूची",
        "col.day":  "दिन",
        "col.lunch":"दोपहर का भोजन (सामग्री)",
        "col.dinner":"रात का खाना (सामग्री)",
        shoppingList:"खरीदारी की सूची",
        "btn.generate":"PDF बनाएँ",
        "btn.pay":  "भुगतान और डाउनलोड",
        placeholderL:"उदा: आलू, प्याज",
        placeholderD:"उदा: चिकन, चावल"
      }
  };

  // ─── 3) Populate language switcher ───
  const langNames = {
    ro: "Română", en: "English", es: "Español", fr: "Français",
    ru: "Русский", zh: "中文", ja: "日本語", pt: "Português",
    de: "Deutsch", ar: "العربية", hi: "हिन्दी"
  };
  const langSwitcher = document.getElementById('lang-switcher');
  Object.keys(i18n).forEach(code => {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = langNames[code];
    langSwitcher.append(opt);
  });

  // ─── 4) Initialize language ───
  let lang = navigator.language.slice(0,2);
  if (!i18n[lang]) lang = 'ro';

  // ─── 5) Render table ───
  function renderTable() {
    const tbody = document.getElementById('plan-table');
    tbody.innerHTML = '';
    i18n[lang].weekdays.forEach((day, idx) => {
      tbody.insertAdjacentHTML('beforeend', `
        <tr class="planner-row">
          <td><strong>${day}</strong></td>
          <td><input id="d${idx+1}l" class="form-control"
                     placeholder="${i18n[lang].placeholderL}"></td>
          <td><input id="d${idx+1}c" class="form-control"
                     placeholder="${i18n[lang].placeholderD}"></td>
        </tr>
      `);
    });
  }

  // ─── 6) Apply translations ───
  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.innerHTML = i18n[lang][key] || el.innerHTML;
    });
    document.title = i18n[lang].title;
    renderTable();
  }
  langSwitcher.value = lang;
  applyTranslations();
  langSwitcher.addEventListener('change', e => {
    lang = e.target.value;
    applyTranslations();
    updateButtonState();
  });

  // ─── 7) Meal collection & shopping list ───
  function collectMeals() {
    return i18n[lang].weekdays.map((_, i) => ({
      day:    document.querySelector(`#plan-table tr:nth-child(${i+1}) td strong`).textContent,
      lunch:  document.getElementById(`d${i+1}l`).value.trim(),
      dinner: document.getElementById(`d${i+1}c`).value.trim()
    }));
  }
  function renderShoppingList(meals) {
    const ul = document.getElementById('shopping-list');
    ul.innerHTML = '';
    meals.forEach(m => {
      if (m.lunch || m.dinner) {
        ul.insertAdjacentHTML('beforeend', `<li class="list-group-item"><strong>${m.day}</strong></li>`);
        if (m.lunch)  ul.insertAdjacentHTML('beforeend',
          `<li class="list-group-item ps-4">${i18n[lang]["col.lunch"]}: ${m.lunch}</li>`);
        if (m.dinner) ul.insertAdjacentHTML('beforeend',
          `<li class="list-group-item ps-4">${i18n[lang]["col.dinner"]}: ${m.dinner}</li>`);
      }
    });
  }

  // ─── 8) PDF & Stripe Buy Button logic ───
  let pdfCount = +localStorage.getItem('pdfCount') || 0;
  const buyBtn   = document.getElementById('stripe-buy-btn');
  const statusEl = document.getElementById('payment-status');

  function updateButtonState() {
    if (pdfCount < 3) {
      generateBtn.style.display = 'inline-block';
      buyBtn.style.display      = 'none';
      statusEl.innerHTML        = '';
    } else {
      generateBtn.style.display = 'none';
      buyBtn.style.display      = 'inline-block';
      statusEl.innerHTML        = i18n[lang].maxed;
    }
  }
  updateButtonState();

  generateBtn.addEventListener('click', () => {
    const meals = collectMeals();
    renderShoppingList(meals);

    const clone = document.getElementById('pdf-content').cloneNode(true);
    clone.querySelectorAll('input').forEach(inp => {
      const span = document.createElement('span');
      span.className   = 'pdf-span';
      span.textContent = inp.value;
      inp.replaceWith(span);
    });
    clone.querySelectorAll('stripe-buy-button,#generate-btn,#payment-status')
         .forEach(el => el.remove());

    html2pdf().set({
      margin:   [10,10,10,10],
      filename: 'meal-planner.pdf',
      jsPDF:    { unit:'mm', format:'a4' }
    }).from(clone).save();

    pdfCount++;
    localStorage.setItem('pdfCount', pdfCount);
    updateButtonState();
  });
});
