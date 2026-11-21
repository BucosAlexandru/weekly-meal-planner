/**
 * recipe-labels.js — tag labels + "ready in X" formatter, all 14 app languages.
 *
 * Split out of recipes-meta.js so the browser planner (app.js) can import the
 * labels WITHOUT evaluating recipes-meta.js, which statically imports the full
 * recipes.js corpus (~33 MB) to auto-fill defaults. recipes-meta.js re-exports
 * both names, so Node scripts importing them from there keep working unchanged.
 */

// ─── Tag label translations (all 14 languages) ───────────────────────────────
export const TAG_LABELS = {
  quick:        { ro:'Rapid',          en:'Quick',          es:'Rápido',           fr:'Rapide',         de:'Schnell',        pt:'Rápido',           ru:'Быстро',      ar:'سريع',          zh:'快手菜',   ja:'時短',           tr:'Hızlı',       it:'Veloce',          ko:'빠른',   hi:'जल्दी'  },
  budget:       { ro:'Buget',          en:'Budget',         es:'Económico',        fr:'Économique',     de:'Günstig',        pt:'Econômico',        ru:'Бюджет',      ar:'اقتصادي',       zh:'省钱',    ja:'節約',           tr:'Ekonomik',    it:'Economico',       ko:'절약',   hi:'सस्ता'  },
  vegetarian:   { ro:'Vegetarian',     en:'Vegetarian',     es:'Vegetariano',      fr:'Végétarien',     de:'Vegetarisch',    pt:'Vegetariano',      ru:'Вегетарианск',ar:'نباتي',         zh:'素食',    ja:'ベジタリアン',   tr:'Vejetaryen',  it:'Vegetariano',     ko:'채식',   hi:'शाकाहारी'},
  vegan:        { ro:'Vegan',          en:'Vegan',          es:'Vegano',           fr:'Végétalien',     de:'Vegan',          pt:'Vegano',           ru:'Веган',       ar:'نباتي صارم',    zh:'纯素',    ja:'ヴィーガン',     tr:'Vegan',       it:'Vegano',          ko:'완전채식',hi:'शुद्ध शाकाहारी'},
  'high-protein':{ ro:'Proteic',       en:'High Protein',   es:'Alto en proteína', fr:'Riche en prot.', de:'Proteinreich',   pt:'Rico em proteína', ru:'Белковый',    ar:'غني بالبروتين', zh:'高蛋白',  ja:'高タンパク',     tr:'Yüksek protein',it:'Proteico',       ko:'고단백',  hi:'उच्च प्रोटीन'},
  family:       { ro:'Familie',        en:'Family',         es:'Familiar',         fr:'Familial',       de:'Familie',        pt:'Família',          ru:'Семейный',    ar:'عائلي',         zh:'家庭',    ja:'ファミリー',     tr:'Aile',        it:'Famiglia',        ko:'가족',   hi:'परिवार' },
  healthy:      { ro:'Sănătos',        en:'Healthy',        es:'Saludable',        fr:'Sain',           de:'Gesund',         pt:'Saudável',         ru:'Здоровый',    ar:'صحي',           zh:'健康',    ja:'ヘルシー',       tr:'Sağlıklı',    it:'Salutare',        ko:'건강',   hi:'स्वस्थ' },
  spicy:        { ro:'Picant',         en:'Spicy',          es:'Picante',          fr:'Épicé',          de:'Scharf',         pt:'Picante',          ru:'Острый',      ar:'حار',           zh:'辛辣',    ja:'スパイシー',     tr:'Acılı',       it:'Piccante',        ko:'매운',   hi:'मसालेदार'},
  'one-pot':    { ro:'O singură oală', en:'One-Pot',        es:'Un solo recipiente',fr:'Un seul plat',  de:'Ein Topf',       pt:'Um único panela',  ru:'Одна кастрюля',ar:'وعاء واحد',    zh:'一锅出',  ja:'ワンポット',     tr:'Tek tencere', it:'Tegame unico',    ko:'원팟',   hi:'एक बर्तन'},
};

// ─── "Ready in X minutes" in every language ─────────────────────────────────
// Smart time formatter used by READY_IN below. Converts raw minutes into
// a human-readable string per locale:
//   45        → "45 min"
//   60        → "1h"
//   90        → "1h 30m"
//   240       → "4h"
//   720       → "12h"
//   1620      → "27h"      (e.g. Pasticada with marinade — was "1620 min")
//   1440+ × n → "N zile"   (e.g. Gravlax 4320 min → "3 zile" instead of "4320 min")
function fmtTime(n, units) {
  if (n < 60) return `${n}${units.minShort}`;
  if (n % 1440 === 0 && n >= 1440) return `${n / 1440}${units.daySpace}`;
  const h = Math.floor(n / 60);
  const m = n % 60;
  if (m === 0) return `${h}${units.hourShort}`;
  return `${h}${units.hourShort} ${m}${units.minShortNoSpace}`;
}

export const READY_IN = {
  ro: n => `Gata în ${fmtTime(n, { hourShort:'h', minShort:' min', minShortNoSpace:'min', daySpace:' zile' })}`,
  en: n => `Ready in ${fmtTime(n, { hourShort:'h', minShort:' min', minShortNoSpace:'min', daySpace:n>=2880?' days':' day' })}`,
  es: n => `Listo en ${fmtTime(n, { hourShort:' h', minShort:' min', minShortNoSpace:'min', daySpace:n>=2880?' días':' día' })}`,
  fr: n => `Prêt en ${fmtTime(n, { hourShort:' h', minShort:' min', minShortNoSpace:'min', daySpace:n>=2880?' jours':' jour' })}`,
  de: n => `Fertig in ${fmtTime(n, { hourShort:' Std.', minShort:' Min.', minShortNoSpace:'Min.', daySpace:n>=2880?' Tagen':' Tag' })}`,
  pt: n => `Pronto em ${fmtTime(n, { hourShort:' h', minShort:' min', minShortNoSpace:'min', daySpace:n>=2880?' dias':' dia' })}`,
  ru: n => `Готово за ${fmtTime(n, { hourShort:' ч', minShort:' мин', minShortNoSpace:'мин', daySpace:n>=2880?' дн.':' день' })}`,
  ar: n => `جاهز في ${fmtTime(n, { hourShort:' ساعة', minShort:' دقيقة', minShortNoSpace:'دقيقة', daySpace:' أيام' })}`,
  zh: n => `${fmtTime(n, { hourShort:'小时', minShort:'分钟', minShortNoSpace:'分', daySpace:'天' })}即可完成`,
  ja: n => `${fmtTime(n, { hourShort:'時間', minShort:'分', minShortNoSpace:'分', daySpace:'日' })}で完成`,
  tr: n => `${fmtTime(n, { hourShort:' saat', minShort:' dakika', minShortNoSpace:'dakika', daySpace:' gün' })} hazır`,
  it: n => `Pronto in ${fmtTime(n, { hourShort:' h', minShort:' min', minShortNoSpace:'min', daySpace:n>=2880?' giorni':' giorno' })}`,
  ko: n => `${fmtTime(n, { hourShort:'시간', minShort:'분', minShortNoSpace:'분', daySpace:'일' })}이면 완성`,
  hi: n => `${fmtTime(n, { hourShort:' घंटे', minShort:' मिनट', minShortNoSpace:'मि', daySpace:' दिन' })} में तैयार`,
};
