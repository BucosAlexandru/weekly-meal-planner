document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generate-btn');
  const buyBtn      = document.getElementById('stripe-buy-btn');
  const statusEl    = document.getElementById('payment-status');

  // date & count pentru reset zilnic
  function getUsage() {
    const raw = localStorage.getItem('mealPlannerUsage');
    if (!raw) return { date: '', count: 0, paid: false };
    return JSON.parse(raw);
  }
  function saveUsage(u) {
    localStorage.setItem('mealPlannerUsage', JSON.stringify(u));
  }

  // reset dacă e nouă zi
  let usage = getUsage();
  const today = new Date().toISOString().slice(0,10);
  if (usage.date !== today) {
    usage = { date: today, count: 0, paid: usage.paid };
    saveUsage(usage);
  }

  // detectează redirect Stripe cu success=true
  const params = new URLSearchParams(window.location.search);
  if (params.get('success') === 'true') {
    usage.paid = true;
    saveUsage(usage);
    statusEl.innerHTML = '✅ Plata a fost realizată cu succes! Poți genera PDF nelimitat acum.';
    window.history.replaceState({}, '', window.location.origin + window.location.pathname);
  }

  // i18n dictionary (exemplu pentru RO/EN; extinde după nevoie)
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
      maxed:      "Ai atins limita de 3 PDF-uri gratuite pe zi.<br>Abonează-te pentru nelimitat!",
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
      maxed:      "You’ve reached 3 free PDFs today.<br>Subscribe for unlimited!",
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

  // populează selectorul de limbi
  const langSwitcher = document.getElementById('lang-switcher');
  Object.keys(i18n).forEach(code => {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = code.toUpperCase();
    langSwitcher.append(opt);
  });

  // inițializează limba
  let lang = navigator.language.slice(0,2);
  if (!i18n[lang]) lang = 'ro';
  langSwitcher.value = lang;

  function renderTable() {
    const tbody = document.getElementById('plan-table');
    tbody.innerHTML = '';
    i18n[lang].weekdays.forEach((day, i) => {
      tbody.insertAdjacentHTML('beforeend', `
        <tr class="planner-row">
          <td><strong>${day}</strong></td>
          <td><input id="d${i+1}l" class="form-control" placeholder="${i18n[lang].placeholderL}"></td>
          <td><input id="d${i+1}c" class="form-control" placeholder="${i18n[lang].placeholderD}"></td>
        </tr>
      `);
    });
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.innerHTML = i18n[lang][key] || el.innerHTML;
    });
    document.title = i18n[lang].title;
    renderTable();
  }
  applyTranslations();
  langSwitcher.addEventListener('change', () => {
    lang = langSwitcher.value;
    applyTranslations();
    updateButtons();
  });

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
        if (m.lunch)  ul.insertAdjacentHTML('beforeend', `<li class="list-group-item ps-4">${m.lunch}</li>`);
        if (m.dinner) ul.insertAdjacentHTML('beforeend', `<li class="list-group-item ps-4">${m.dinner}</li>`);
      }
    });
  }

  // updatează apariția butoanelor
  function updateButtons() {
    // dacă ai plătit: buton PDF mereu, fără subscribe
    if (usage.paid) {
      generateBtn.style.display = 'inline-block';
      buyBtn.style.display      = 'none';
      statusEl.innerHTML        = '';
      return;
    }
    // altfel: 3 gratuite/zi
    if (usage.count < 3) {
      generateBtn.style.display = 'inline-block';
      buyBtn.style.display      = 'none';
      statusEl.innerHTML        = '';
    } else {
      generateBtn.style.display = 'none';
      buyBtn.style.display      = 'inline-block';
      statusEl.innerHTML        = i18n[lang].maxed;
    }
  }
  updateButtons();

  // click Generează PDF
  generateBtn.addEventListener('click', () => {
    const meals = collectMeals();
    renderShoppingList(meals);

    // clonăm conținutul pentru html2pdf
    const clone = document.getElementById('pdf-content').cloneNode(true);
    clone.querySelectorAll('input').forEach(inp => {
      const span = document.createElement('span');
      span.className   = 'pdf-span';
      span.textContent = inp.value;
      inp.replaceWith(span);
    });
    clone.querySelectorAll('stripe-payment-link,#generate-btn,#payment-status')
         .forEach(el => el.remove());

    html2pdf().set({
      margin:   [10,10,10,10],
      filename: 'meal-planner.pdf',
      jsPDF:    { unit:'mm', format:'a4' }
    }).from(clone).save();

    // increment count dacă nu e deja plătit
    if (!usage.paid) {
      usage.count++;
      saveUsage(usage);
      updateButtons();
    }
  });
});
