// Phase 2A — Canonical cuisine taxonomy (MAIN recipes).
//
// Pure leaf module. No imports from generate-content.mjs, no side effects.
//
// Design (per Phase 1 audit): `origin.en` is the de-facto cuisine field today
// (89 distinct values, all 14 locales complete) but it is a free-text display
// string — spelling drift would silently break joins. We freeze a canonical,
// language-independent `cuisineId` (snake_case) and a stable
// origin.en -> cuisineId map for ALL 89 current origins, so the whole main
// catalog validates even though Phase 2 only curates 20 pilot recipes.
//
// Cuisine DISPLAY LABELS are intentionally NOT stored here: `origin{14}`
// already carries a localized name on every recipe, so the build derives the
// per-locale cuisine label from the recipes themselves (no duplicated data).
// Non-country buckets ('international', 'mediterranean') are kept verbatim —
// they are real origin values in recipes.js.

// Frozen mapping for every origin.en present in public/js/recipes.js today.
// Generated mechanically (lowercase, non-alphanumeric -> "_") then frozen so a
// future rename of origin.en cannot change an existing cuisineId by accident.
export const ORIGIN_TO_CUISINE = Object.freeze({
  'Algeria': 'algeria',
  'Argentina': 'argentina',
  'Armenia': 'armenia',
  'Australia': 'australia',
  'Belgium': 'belgium',
  'Bosnia and Herzegovina': 'bosnia_and_herzegovina',
  'Brazil': 'brazil',
  'Cambodia': 'cambodia',
  'Canada': 'canada',
  'Cape Verde': 'cape_verde',
  'Chile': 'chile',
  'China': 'china',
  'Colombia': 'colombia',
  'Croatia': 'croatia',
  'Cuba': 'cuba',
  'Cyprus': 'cyprus',
  'Czech Republic': 'czech_republic',
  'Denmark': 'denmark',
  'Dominican Republic': 'dominican_republic',
  'Ecuador': 'ecuador',
  'Egypt': 'egypt',
  'El Salvador': 'el_salvador',
  'Estonia': 'estonia',
  'Ethiopia': 'ethiopia',
  'Finland': 'finland',
  'France': 'france',
  'Georgia': 'georgia',
  'Germany': 'germany',
  'Ghana': 'ghana',
  'Greece': 'greece',
  'Guatemala': 'guatemala',
  'Hungary': 'hungary',
  'India': 'india',
  'Indonesia': 'indonesia',
  'International': 'international',
  'Iran': 'iran',
  'Iraq': 'iraq',
  'Israel': 'israel',
  'Italy': 'italy',
  'Jamaica': 'jamaica',
  'Japan': 'japan',
  'Kuwait': 'kuwait',
  'Kyrgyzstan': 'kyrgyzstan',
  'Latvia': 'latvia',
  'Lebanon': 'lebanon',
  'Lithuania': 'lithuania',
  'Malaysia': 'malaysia',
  'Mediterranean': 'mediterranean',
  'Mexico': 'mexico',
  'Moldova': 'moldova',
  'Mongolia': 'mongolia',
  'Morocco': 'morocco',
  'Nepal': 'nepal',
  'Netherlands': 'netherlands',
  'New Zealand': 'new_zealand',
  'Nigeria': 'nigeria',
  'North Korea': 'north_korea',
  'Norway': 'norway',
  'Pakistan': 'pakistan',
  'Peru': 'peru',
  'Philippines': 'philippines',
  'Poland': 'poland',
  'Portugal': 'portugal',
  'Republic of the Congo': 'republic_of_the_congo',
  'Romania': 'romania',
  'Russia': 'russia',
  'Samoa': 'samoa',
  'Scotland': 'scotland',
  'Serbia': 'serbia',
  'Singapore': 'singapore',
  'Slovenia': 'slovenia',
  'South Africa': 'south_africa',
  'South Korea': 'south_korea',
  'Spain': 'spain',
  'Sri Lanka': 'sri_lanka',
  'Sudan': 'sudan',
  'Sweden': 'sweden',
  'Switzerland': 'switzerland',
  'Syria': 'syria',
  'Thailand': 'thailand',
  'Tunisia': 'tunisia',
  'Turkey': 'turkey',
  'Turkmenistan': 'turkmenistan',
  'USA': 'usa',
  'Ukraine': 'ukraine',
  'United Kingdom': 'united_kingdom',
  'Uzbekistan': 'uzbekistan',
  'Venezuela': 'venezuela',
  'Vietnam': 'vietnam',
});

// Closed canonical cuisine registry, derived from the frozen map above.
// This is the authority the validator checks pilot.cuisineId against.
export const CUISINE_IDS = Object.freeze(new Set(Object.values(ORIGIN_TO_CUISINE)));

// Resolve a recipe's origin.en to its canonical cuisineId, or null if unknown
// (an origin.en not yet in the frozen map — the validator flags this).
export function cuisineIdForOrigin(originEn) {
  if (typeof originEn !== 'string') return null;
  return ORIGIN_TO_CUISINE[originEn.trim()] || null;
}
