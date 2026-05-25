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
 *   - en + ro + es + fr + de + it + pt: full editorial rewrite for all 44
 *     hub-eligible cuisines (pt uses Brazilian Portuguese to match the
 *     existing CUISINE_HUB_LANG.pt register)
 *   - other 7 locales: fall back to the locale's templated intro in
 *     CUISINE_HUB_LANG.intro(o, n) — still localized, but generic
 *
 * Keyed by origin.en (locale-stable, matches the URL slug source).
 */

export const CUISINE_INTRO = {
  // ── Mediterranean
  'Italy': {
    en: "Italy's table is built on regional restraint — Pecorino-laced carbonara from Rome, slow risotto from the north, eggplant pasta alla Norma from Sicily. Olive oil binds the country together; pasta keeps each region distinct.",
    ro: "Bucătăria italiană se ține pe disciplină regională — carbonara romană cu Pecorino, risotto-ul nordic încet, pasta alla Norma siciliană cu vinete. Uleiul de măsline ține țara la un loc, pastele păstrează fiecare regiune separată.",
    es: "La cocina italiana se construye sobre la disciplina regional — carbonara romana con Pecorino, risotto del norte hecho a fuego lento, pasta alla Norma siciliana con berenjena. El aceite de oliva une el país; la pasta mantiene cada región aparte.",
    fr: "La cuisine italienne se construit sur la discipline régionale — carbonara romaine au Pecorino, risotto du nord travaillé lentement, pasta alla Norma sicilienne aux aubergines. L'huile d'olive tient le pays ensemble ; les pâtes gardent chaque région distincte.",
    de: "Die italienische Küche lebt von regionaler Disziplin — römische Carbonara mit Pecorino, langsam gerührter Risotto aus dem Norden, sizilianische Pasta alla Norma mit Aubergine. Olivenöl hält das Land zusammen, Pasta hält jede Region für sich.",
    it: "L'Italia mangia per disciplina regionale — carbonara romana al Pecorino, risotto del nord lavorato lentamente, pasta alla Norma siciliana con le melanzane. L'olio d'oliva tiene il paese insieme; la pasta lascia distinta ogni regione.",
    pt: "A cozinha italiana se ergue sobre a disciplina regional — carbonara romana com Pecorino, risoto do norte trabalhado em fogo brando, pasta alla Norma siciliana com berinjela. O azeite costura o país; a massa mantém cada região à parte.",
  },
  'Greece': {
    en: "Greek cooking smells like oregano, olive oil and lemon zest — moussaka layered in baking trays, souvlaki turning over coals, spinach folded into thin phyllo. A coastal table, generous and unhurried.",
    ro: "Bucătăria grecească miroase a oregano, ulei de măsline și coajă de lămâie — moussaka în straturi, souvlaki rotit pe jar, spanac împăturit în foi subțiri de plăcintă. O masă mediteraneană, generoasă, fără grabă.",
    es: "La cocina griega huele a orégano, aceite de oliva y ralladura de limón — moussaka montada en bandeja, souvlaki girando sobre las brasas, espinacas envueltas en finas láminas de masa filo. Mesa mediterránea, generosa y sin prisa.",
    fr: "La cuisine grecque sent l'origan, l'huile d'olive et le zeste de citron — moussaka en couches dans le plat, souvlaki tournant sur la braise, épinards roulés dans de fines feuilles de phyllo. Table méditerranéenne, généreuse, sans hâte.",
    de: "Die griechische Küche riecht nach Oregano, Olivenöl und Zitronenschale — Moussaka in der Auflaufform geschichtet, Souvlaki über glühenden Kohlen, Spinat in dünnem Filoteig gerollt. Ein Küstentisch, großzügig, ohne Eile.",
    it: "La cucina greca profuma di origano, olio d'oliva e scorza di limone — moussaka a strati in teglia, souvlaki che gira sulla brace, spinaci avvolti in sottili sfoglie di phyllo. Una tavola mediterranea, generosa e senza fretta.",
    pt: "A cozinha grega cheira a orégano, azeite e raspa de limão — moussaka em camadas na assadeira, souvlaki girando sobre as brasas, espinafre enrolado em folhas finas de phyllo. Mesa litorânea, generosa e sem pressa.",
  },
  'Spain': {
    en: "Spain cooks between Andalusian sun and Valencian rice fields — chilled gazpacho when the heat won't quit, saffron-stained paella on a wide steel pan. Olive oil is the constant; the rest is fierce regional pride.",
    ro: "Spania gătește între soarele Andaluziei și orezăriile Valenciei — gazpacho rece când căldura nu cedează, paella cu șofran pe tigaie lată. Uleiul de măsline e singurul element comun; restul e mândrie regională.",
    es: "España cocina entre el sol andaluz y los arrozales valencianos — gazpacho frío cuando el calor no afloja, paella teñida de azafrán sobre la paellera ancha. El aceite de oliva es la constante; lo demás es orgullo regional sin tregua.",
    fr: "L'Espagne cuisine entre le soleil andalou et les rizières valenciennes — gazpacho glacé quand la chaleur ne lâche pas, paella safranée sur une large poêle d'acier. L'huile d'olive est la constante ; le reste, fierté régionale farouche.",
    de: "Spanien kocht zwischen andalusischer Sonne und valencianischen Reisfeldern — eisgekühltes Gazpacho, wenn die Hitze nicht nachlässt, safrangetränkte Paella in der breiten Stahlpfanne. Olivenöl bleibt die Konstante; alles andere ist regionaler Stolz.",
    it: "La Spagna cucina tra sole andaluso e risaie valenciane — gazpacho ghiacciato quando il caldo non molla, paella tinta di zafferano sulla padella d'acciaio larga. L'olio d'oliva resta la costante; il resto è orgoglio regionale feroce.",
    pt: "A Espanha cozinha entre o sol andaluz e os arrozais valencianos — gaspacho gelado quando o calor não cede, paella tingida de açafrão na frigideira larga. O azeite é a constante; o resto é orgulho regional bravo.",
  },
  'France': {
    en: "France runs on slow technique — butter, wine, patience. Whether it's a Provençal ratatouille or a Burgundy braise, the recipes carry their region in their bones and trust the cook to take their time.",
    ro: "Bucătăria franceză merge pe tehnică lentă — unt, vin, răbdare. Fie că e o ratatouille provensală sau un bourguignon din Burgundia, fiecare rețetă își poartă regiunea în oase și are încredere în timpul bucătarului.",
    es: "Francia se mueve por técnica lenta — mantequilla, vino, paciencia. Sea una ratatouille provenzal o un estofado borgoñón, cada receta lleva su región en los huesos y confía en que el cocinero se tome su tiempo.",
    fr: "La cuisine française tient à la technique lente — beurre, vin, patience. Que ce soit une ratatouille provençale ou un bourguignon mijoté, chaque recette porte sa région dans les os et fait confiance au cuisinier pour prendre son temps.",
    de: "Die französische Küche lebt von langsamer Technik — Butter, Wein, Geduld. Ob provenzalische Ratatouille oder Burgunder Schmorbraten — jede Rezeptur trägt ihre Region in den Knochen und vertraut dem Koch die Zeit an.",
    it: "La cucina francese vive di tecnica lenta — burro, vino, pazienza. Che sia una ratatouille provenzale o un brasato di Borgogna, ogni ricetta porta la sua regione nelle ossa e si fida del cuoco per prendersi il suo tempo.",
    pt: "A cozinha francesa vive da técnica lenta — manteiga, vinho, paciência. Seja uma ratatouille provençal ou um brasado de Borgonha, cada receita carrega sua região nos ossos e confia no cozinheiro para levar o tempo necessário.",
  },
  'Portugal': {
    en: "Portuguese cooking is salt cod, olive oil and slow Atlantic afternoons — bacalhau cooked a hundred ways, beans simmered with chouriço. Quiet, rooted, generous with seafood and unhurried with stew.",
    ro: "Bucătăria portugheză e cod sărat, ulei de măsline și după-amieze atlantice — bacalhau gătit în o sută de feluri, fasole fiartă încet cu chouriço. Liniștită, înrădăcinată, generoasă cu fructe de mare.",
    es: "La cocina portuguesa es bacalao en sal, aceite de oliva y tardes atlánticas — bacalhau preparado de cien maneras, alubias guisadas a fuego lento con chouriço. Tranquila, arraigada, generosa con el marisco y sin prisa con el guiso.",
    fr: "La cuisine portugaise, c'est la morue salée, l'huile d'olive et les longs après-midis atlantiques — bacalhau cuisiné de cent façons, haricots mijotés au chouriço. Discrète, enracinée, généreuse en fruits de mer et sans hâte sur le ragoût.",
    de: "Die portugiesische Küche ist Salzkabeljau, Olivenöl und lange Atlantik-Nachmittage — Bacalhau auf hundert Arten zubereitet, Bohnen langsam mit Chouriço geschmort. Leise, verwurzelt, großzügig mit Meeresfrüchten und unerschütterlich beim Eintopf.",
    it: "La cucina portoghese è merluzzo salato, olio d'oliva e lunghi pomeriggi atlantici — bacalhau cucinato in cento modi, fagioli sobbolliti con chouriço. Discreta, radicata, generosa di pesce e senza fretta sul brasato.",
    pt: "A cozinha portuguesa é bacalhau em sal, azeite e longas tardes atlânticas — bacalhau preparado de cem maneiras, feijão cozido devagar com chouriço. Discreta, enraizada, generosa nos frutos do mar e sem pressa no ensopado.",
  },
  'Croatia': {
    en: "Croatian cooking wanders between coast and inland — grilled ćevapi with raw onion, pašticada braised for hours with prunes and Dalmatian red wine. Olive oil on the sea side, paprika and pork inland.",
    ro: "Bucătăria croată se mișcă între coastă și interior — ćevapi pe grătar cu ceapă crudă, pašticada gătită ore întregi cu prune și vin roșu dalmațian. Ulei de măsline lângă mare, boia și porc în continent.",
    es: "La cocina croata se mueve entre la costa y el interior — ćevapi a la parrilla con cebolla cruda, pašticada estofada durante horas con ciruelas pasas y tinto dálmata. Aceite de oliva junto al mar, pimentón y cerdo tierra adentro.",
    fr: "La cuisine croate hésite entre côte et arrière-pays — ćevapi grillés à l'oignon cru, pašticada braisée des heures avec pruneaux et rouge dalmate. Huile d'olive côté mer, paprika et porc à l'intérieur des terres.",
    de: "Die kroatische Küche bewegt sich zwischen Küste und Hinterland — gegrillte Ćevapi mit roher Zwiebel, Pašticada stundenlang mit Pflaumen und dalmatinischem Rotwein geschmort. Olivenöl am Meer, Paprika und Schwein im Landesinneren.",
    it: "La cucina croata oscilla tra costa ed entroterra — ćevapi alla griglia con cipolla cruda, pašticada brasata per ore con prugne e rosso dalmata. Olio d'oliva sul lato mare, paprika e maiale nell'entroterra.",
    pt: "A cozinha croata oscila entre o litoral e o interior — ćevapi na grelha com cebola crua, pašticada brasada por horas com ameixas secas e tinto dálmata. Azeite na beira-mar, páprica e porco no interior.",
  },

  // ── East Asian
  'Japan': {
    en: "Japan eats by precision and quiet contrast — broths simmered for hours, rice rinsed until clean, garnishes placed with intent. Ramen counters, sushi bars and home kitchens all share the same restraint.",
    ro: "Japonia gătește cu precizie și contrast tăcut — supe fierte ore întregi, orez clătit până la transparență, garnituri așezate cu intenție. Tarabele cu ramen, tejghelele de sushi și bucătăriile de acasă împart aceeași disciplină.",
    es: "Japón come con precisión y contraste callado — caldos a fuego lento durante horas, arroz lavado hasta quedar limpio, guarniciones colocadas con intención. Mostradores de ramen, barras de sushi y cocinas de casa comparten la misma contención.",
    fr: "Le Japon mange par précision et contraste discret — bouillons mijotés des heures, riz rincé jusqu'à transparence, garnitures posées avec intention. Comptoirs de ramen, bars à sushi et cuisines familiales partagent la même retenue.",
    de: "Japan kocht mit Präzision und stillem Kontrast — Brühen stundenlang geköchelt, Reis gewaschen bis er klar wird, Garnituren mit Absicht platziert. Ramen-Theken, Sushi-Bars und Hausküchen teilen dieselbe Zurückhaltung.",
    it: "Il Giappone mangia per precisione e contrasto silenzioso — brodi sobbolliti per ore, riso lavato fino a diventare trasparente, guarnizioni posate con intenzione. Banconi di ramen, bar di sushi e cucine di casa condividono la stessa misura.",
    pt: "O Japão come pela precisão e o contraste silencioso — caldos fervidos por horas, arroz lavado até ficar limpo, guarnições postas com intenção. Balcões de ramen, bares de sushi e cozinhas de casa partilham a mesma contenção.",
  },
  'China': {
    en: "Chinese cooking respects the wok and the clock — high heat for a fast stir-fry, slow simmer for a stew, oil bloomed with garlic and Sichuan pepper before anything else hits the pan.",
    ro: "Bucătăria chinezească respectă wok-ul și ceasul — foc mare pentru sotat rapid, fierbere înceată pentru tocănițe, ulei aromat cu usturoi și piper Sichuan înainte de orice altceva.",
    es: "La cocina china respeta el wok y el reloj — fuego vivo para un salteado rápido, cocción lenta para los guisos, aceite perfumado con ajo y pimienta de Sichuan antes de que nada más toque la sartén.",
    fr: "La cuisine chinoise respecte le wok et l'horloge — feu vif pour le sauté éclair, mijoté lent pour les ragoûts, huile parfumée à l'ail et au poivre du Sichuan avant tout le reste.",
    de: "Die chinesische Küche respektiert Wok und Uhr — hohe Hitze für das schnelle Pfannenrühren, langsames Köcheln für den Schmortopf, Öl mit Knoblauch und Sichuan-Pfeffer aromatisiert, bevor sonst irgendetwas in die Pfanne kommt.",
    it: "La cucina cinese rispetta il wok e l'orologio — fuoco vivo per la saltata veloce, fuoco basso per gli stufati, olio profumato con aglio e pepe del Sichuan prima di tutto il resto.",
    pt: "A cozinha chinesa respeita o wok e o relógio — fogo alto para o salteado rápido, fervura lenta para os ensopados, óleo perfumado com alho e pimenta de Sichuan antes de tudo o mais.",
  },
  'South Korea': {
    en: "Korean cooking turns fermentation into a national pantry — kimchi crocks, doenjang stews, gochujang glazes. Banchan plates surround every meal; rice and shared heat carry the conversation.",
    ro: "Bucătăria coreeană transformă fermentația într-o cămară națională — borcane de kimchi, tocănițe de doenjang, glazuri de gochujang. Farfuriile de banchan înconjoară fiecare masă; orezul și picantul împărtășit duc conversația.",
    es: "La cocina coreana convierte la fermentación en despensa nacional — vasijas de kimchi, guisos de doenjang, glaseados de gochujang. Los platillos de banchan rodean cada comida; el arroz y el picante compartido llevan la conversación.",
    fr: "La cuisine coréenne fait de la fermentation un garde-manger national — jarres de kimchi, ragoûts au doenjang, glaçages au gochujang. Les banchan entourent chaque repas ; le riz et le piquant partagé portent la conversation.",
    de: "Die koreanische Küche macht aus Fermentation eine nationale Vorratskammer — Kimchi-Töpfe, Doenjang-Eintöpfe, Gochujang-Glasuren. Banchan umrahmen jede Mahlzeit; Reis und geteilte Schärfe tragen das Gespräch.",
    it: "La cucina coreana fa della fermentazione una dispensa nazionale — vasi di kimchi, stufati di doenjang, glasse al gochujang. I banchan circondano ogni pasto; riso e piccante condiviso portano la conversazione.",
    pt: "A cozinha coreana transforma a fermentação em despensa nacional — potes de kimchi, ensopados de doenjang, glacês de gochujang. Os banchan rodeiam cada refeição; o arroz e o ardido compartilhado levam a conversa.",
  },

  // ── Southeast Asian
  'Vietnam': {
    en: "Vietnam balances four flavors at every table — bright herbs, salty fish sauce, fresh chili, a squeeze of lime. From phở broth at dawn to bánh mì at noon, the cooking stays light and immediate.",
    ro: "Vietnamul echilibrează patru gusturi la fiecare masă — ierburi proaspete, sos de pește sărat, ardei iute, o picătură de lime. De la zeama de phở dimineața la bánh mì la prânz, gătitul rămâne ușor și imediat.",
    es: "Vietnam equilibra cuatro sabores en cada mesa — hierbas frescas, salsa de pescado salada, chile recién picado, un toque de lima. Del caldo de phở al amanecer al bánh mì del mediodía, la cocina se mantiene ligera y directa.",
    fr: "Le Vietnam équilibre quatre saveurs à chaque table — herbes vives, nuoc-mâm salé, piment frais, une pression de citron vert. Du bouillon de phở à l'aube au bánh mì de midi, la cuisine reste légère et immédiate.",
    de: "Vietnam balanciert vier Geschmacksrichtungen an jedem Tisch — frische Kräuter, salzige Fischsoße, frischer Chili, ein Spritzer Limette. Von der Phở-Brühe am Morgen bis zum Bánh mì zur Mittagszeit bleibt das Kochen leicht und unmittelbar.",
    it: "Il Vietnam equilibra quattro sapori a ogni tavola — erbe vive, salsa di pesce salata, peperoncino fresco, una spremuta di lime. Dal brodo di phở all'alba al bánh mì a mezzogiorno, la cucina resta leggera e immediata.",
    pt: "O Vietnã equilibra quatro sabores em cada mesa — ervas vivas, molho de peixe salgado, pimenta fresca, um aperto de limão. Do caldo de phở ao amanhecer ao bánh mì ao meio-dia, a cozinha permanece leve e imediata.",
  },
  'Thailand': {
    en: "Thai cooking chases four flavors at once — hot, sour, sweet, salty. Pad thai negotiates them in a wok; tom yum sharpens them in clear broth; tom kha softens them with coconut milk.",
    ro: "Bucătăria thailandeză urmărește patru gusturi în același timp — iute, acru, dulce, sărat. Pad thai le împacă în wok; tom yum le ascute într-o supă limpede; tom kha le îmblânzește cu lapte de cocos.",
    es: "La cocina tailandesa persigue cuatro sabores a la vez — picante, ácido, dulce, salado. El pad thai los negocia en el wok; el tom yum los afila en caldo claro; el tom kha los suaviza con leche de coco.",
    fr: "La cuisine thaïe poursuit quatre saveurs en même temps — piquant, acide, sucré, salé. Le pad thaï les négocie au wok ; le tom yum les aiguise dans un bouillon clair ; le tom kha les adoucit au lait de coco.",
    de: "Die thailändische Küche jagt vier Geschmäcker auf einmal — scharf, sauer, süß, salzig. Pad Thai verhandelt sie im Wok; Tom Yum schärft sie in klarer Brühe; Tom Kha mildert sie mit Kokosmilch.",
    it: "La cucina thailandese insegue quattro sapori insieme — piccante, acido, dolce, salato. Il pad thai li negozia nel wok; il tom yum li affila in brodo limpido; il tom kha li addolcisce con il latte di cocco.",
    pt: "A cozinha tailandesa persegue quatro sabores ao mesmo tempo — picante, ácido, doce, salgado. O pad thai os negocia no wok; o tom yum os afia em caldo claro; o tom kha os suaviza com leite de coco.",
  },
  // REVIEW: "pasta de gambas" is peninsular Spanish; LATAM readers expect "camarones".
  // For a Romania-based site with mostly EU traffic, peninsular reads more natural.
  'Indonesia': {
    en: "Indonesia cooks in layers — coconut milk reducing for hours, sambal pounded fresh, palm sugar caramelizing in the wok. Rice is the steady center; chili, lemongrass and shrimp paste work around it.",
    ro: "Indonezia gătește în straturi — lapte de cocos redus ore întregi, sambal pisat la moment, zahăr de palmier caramelizat în wok. Orezul e centrul stabil; ardeiul, lemongrass-ul și pasta de creveți lucrează în jurul lui.",
    es: "Indonesia cocina por capas — leche de coco reduciéndose durante horas, sambal machacado al momento, azúcar de palma caramelizándose en el wok. El arroz es el centro firme; chile, citronela y pasta de gambas trabajan a su alrededor.",
    fr: "L'Indonésie cuisine par couches — lait de coco réduit des heures, sambal pilé à la minute, sucre de palme caramélisé au wok. Le riz tient le centre ; piment, citronnelle et pâte de crevettes travaillent autour.",
    de: "Indonesien kocht in Schichten — Kokosmilch stundenlang eingekocht, Sambal frisch gestampft, Palmzucker im Wok karamellisiert. Reis bildet die feste Mitte; Chili, Zitronengras und Garnelenpaste arbeiten drumherum.",
    it: "L'Indonesia cucina a strati — latte di cocco ridotto per ore, sambal pestato al momento, zucchero di palma caramellato nel wok. Il riso è il centro stabile; peperoncino, citronella e pasta di gamberi lavorano attorno.",
    pt: "A Indonésia cozinha em camadas — leite de coco reduzido por horas, sambal socado na hora, açúcar de palma caramelizado no wok. O arroz é o centro firme; pimenta, capim-limão e pasta de camarão trabalham em volta.",
  },
  'Philippines': {
    en: "Filipino cooking sits where sour meets savory — adobo simmered in vinegar and soy, kare-kare rich with peanut and oxtail. Bagoong on the side, rice always, leftovers always better the next day.",
    ro: "Bucătăria filipineză stă unde acru întâlnește savuros — adobo fiert în oțet și soia, kare-kare bogat cu arahide și coadă de bou. Bagoong alături, orez mereu, resturile sunt mereu mai bune a doua zi.",
    es: "La cocina filipina se asienta donde lo ácido se cruza con lo sabroso — adobo cocido en vinagre y soja, kare-kare denso de cacahuete y rabo de buey. Bagoong al lado, arroz siempre, las sobras siempre mejores al día siguiente.",
    fr: "La cuisine philippine vit là où l'acide rencontre le savoureux — adobo mijoté au vinaigre et au soja, kare-kare riche en cacahuète et queue de bœuf. Bagoong à côté, riz toujours, restes toujours meilleurs le lendemain.",
    de: "Die philippinische Küche siedelt dort, wo sauer auf herzhaft trifft — Adobo in Essig und Sojasoße geschmort, Kare-kare reichhaltig mit Erdnuss und Ochsenschwanz. Bagoong daneben, Reis immer, die Reste am nächsten Tag immer besser.",
    it: "La cucina filippina sta dove l'acido incontra il saporito — adobo sobbollito in aceto e soia, kare-kare ricco di arachide e coda di bue. Bagoong di fianco, riso sempre, gli avanzi sempre migliori il giorno dopo.",
    pt: "A cozinha filipina mora onde o ácido encontra o saboroso — adobo cozido em vinagre e shoyu, kare-kare denso de amendoim e rabada. Bagoong ao lado, arroz sempre, sobras sempre melhores no dia seguinte.",
  },
  'Malaysia': {
    en: "Malaysian cooking lives at the hawker stall — laksa rich with coconut and shrimp paste, nasi lemak crowned with crisp anchovies. Multiple cultures, one wok station, breakfast served hot at 7 a.m.",
    ro: "Bucătăria malaezienă trăiește la taraba de stradă — laksa cu lapte de cocos și pastă de creveți, nasi lemak încoronat cu anșoa crocant. Mai multe culturi, o singură stație de wok, micul dejun servit fierbinte la 7 dimineața.",
    es: "La cocina malaya vive en los puestos callejeros — laksa cremosa con coco y pasta de gambas, nasi lemak coronado con anchoas crujientes. Varias culturas, un solo wok, desayuno servido caliente a las siete de la mañana.",
    fr: "La cuisine malaisienne vit au stand de rue — laksa onctueux au coco et à la pâte de crevettes, nasi lemak couronné d'anchois croustillants. Plusieurs cultures, un seul wok, petit-déjeuner brûlant servi à sept heures.",
    de: "Die malaysische Küche lebt am Garküchenstand — cremiges Laksa mit Kokos und Garnelenpaste, Nasi Lemak gekrönt von knusprigen Anchovis. Mehrere Kulturen, ein Wok-Posten, Frühstück heiß serviert um sieben Uhr morgens.",
    it: "La cucina malese vive ai banchi di strada — laksa cremoso di cocco e pasta di gamberi, nasi lemak coronato di acciughe croccanti. Più culture, una sola postazione di wok, colazione servita fumante alle sette del mattino.",
    pt: "A cozinha malaia vive no balcão de rua — laksa cremoso de coco e pasta de camarão, nasi lemak coroado por anchovas crocantes. Várias culturas, uma só estação de wok, café da manhã servido quente às sete.",
  },
  'Cambodia': {
    en: "Cambodian cooking quietly balances sweet, salty, sour and herbaceous — fish amok steamed in banana leaf, fresh chili and lime alongside every plate. Lemongrass, palm sugar and prahok do the heavy lifting.",
    ro: "Bucătăria cambodgiană echilibrează discret dulce, sărat, acru și verde — pește amok aburit în frunză de banan, ardei proaspăt și lime lângă fiecare farfurie. Lemongrass, zahăr de palmier și prahok fac munca de bază.",
    es: "La cocina camboyana equilibra en voz baja lo dulce, lo salado, lo ácido y lo herbal — amok de pescado al vapor en hoja de plátano, chile fresco y lima junto a cada plato. Citronela, azúcar de palma y prahok hacen el trabajo de fondo.",
    fr: "La cuisine cambodgienne équilibre discrètement le sucré, le salé, l'acide et le végétal — amok de poisson vapeur en feuille de bananier, piment frais et citron vert à côté de chaque assiette. Citronnelle, sucre de palme et prahok font le gros du travail.",
    de: "Die kambodschanische Küche balanciert leise süß, salzig, sauer und kräuterig — Fisch-Amok im Bananenblatt gedämpft, frischer Chili und Limette neben jedem Teller. Zitronengras, Palmzucker und Prahok machen die eigentliche Arbeit.",
    it: "La cucina cambogiana equilibra in silenzio dolce, salato, acido e erbaceo — amok di pesce al vapore in foglia di banano, peperoncino fresco e lime accanto a ogni piatto. Citronella, zucchero di palma e prahok fanno il lavoro di fondo.",
    pt: "A cozinha cambojana equilibra em silêncio o doce, o salgado, o ácido e o herbáceo — amok de peixe no vapor em folha de bananeira, pimenta fresca e limão ao lado de cada prato. Capim-limão, açúcar de palma e prahok fazem o trabalho de base.",
  },

  // ── South Asian
  'India': {
    en: "India layers spice with intent — whole seeds bloomed in hot ghee, onions cooked until they melt, finishing aromatics dropped in at the very end. Curries, biryanis and street-food classics all follow the rhythm.",
    ro: "India așază condimentele cu intenție — semințe întregi înflorite în ghee fierbinte, ceapă gătită până se topește, arome finale aruncate chiar la sfârșit. Curry-uri, biryani și clasice de stradă urmează același ritm.",
    es: "India apila especias con intención — semillas enteras abiertas en ghee caliente, cebolla cocida hasta deshacerse, aromas finales añadidos justo al apagar el fuego. Curris, biryanis y clásicos de la calle siguen el mismo ritmo.",
    fr: "L'Inde superpose les épices avec intention — graines entières éclatant dans le ghee chaud, oignons cuits jusqu'à fondre, aromates finals jetés tout à la fin. Currys, biryanis et classiques de rue suivent le même rythme.",
    de: "Indien schichtet Gewürze mit Bedacht — ganze Samen springen in heißem Ghee auf, Zwiebeln werden gekocht bis sie zerfallen, finale Aromen erst ganz am Ende dazugegeben. Currys, Biryanis und Straßenklassiker folgen demselben Rhythmus.",
    it: "L'India dispone le spezie con intenzione — semi interi che sbocciano nel ghee caldo, cipolle cotte fino a sciogliersi, aromi finali aggiunti proprio all'ultimo. Curry, biryani e classici di strada seguono lo stesso ritmo.",
    pt: "A Índia dispõe especiarias com intenção — sementes inteiras estourando no ghee quente, cebolas cozidas até derreter, aromas finais jogados bem no fim. Curries, biryanis e clássicos de rua seguem o mesmo ritmo.",
  },
  'Pakistan': {
    en: "Pakistani cooking turns spice into long heat — biryani layered with marinated lamb, nihari simmered overnight until the meat surrenders. Bone marrow, naan straight off the tandoor, and bread keep the table close.",
    ro: "Bucătăria pakistaneză transformă condimentele în căldură lungă — biryani în straturi cu miel marinat, nihari fiert peste noapte până carnea cedează. Măduvă de os, naan direct din tandoor, pâinea ține masa aproape.",
    es: "La cocina pakistaní convierte la especia en calor largo — biryani en capas con cordero marinado, nihari cocido toda la noche hasta que la carne se rinde. Tuétano, naan recién salido del tandoor, y pan que mantiene la mesa unida.",
    fr: "La cuisine pakistanaise transforme l'épice en chaleur longue — biryani en couches d'agneau mariné, nihari mijoté toute la nuit jusqu'à ce que la viande cède. Moelle, naan sorti du tandoor, le pain garde la table proche.",
    de: "Die pakistanische Küche verwandelt Gewürze in lange Hitze — Biryani in Schichten aus mariniertem Lamm, Nihari über Nacht geköchelt, bis das Fleisch nachgibt. Knochenmark, Naan frisch aus dem Tandoor, Brot hält den Tisch zusammen.",
    it: "La cucina pakistana trasforma la spezia in calore lungo — biryani a strati di agnello marinato, nihari sobbollito tutta la notte finché la carne cede. Midollo, naan appena uscito dal tandoor, il pane tiene la tavola unita.",
    pt: "A cozinha paquistanesa transforma a especiaria em calor longo — biryani em camadas de cordeiro marinado, nihari fervido a noite toda até a carne se render. Tutano, naan recém-saído do tandoor, o pão mantém a mesa junta.",
  },

  // ── Middle Eastern
  'Iran': {
    en: "Persian kitchens layer flavor with patience — fesenjān thickened with walnut and pomegranate, ghormeh sabzi green with stewed herbs. Saffron, dried lime and rice tahdig finish the table.",
    ro: "Bucătăriile persane stratifică gustul cu răbdare — fesenjān îngroșat cu nucă și rodie, ghormeh sabzi verde de la ierburi gătite. Șofran, lime uscat și tahdig de orez închid masa.",
    es: "Las cocinas persas estratifican el sabor con paciencia — fesenjān espesado con nuez y granada, ghormeh sabzi verde de hierbas guisadas. Azafrán, lima seca y el tahdig de arroz cierran la mesa.",
    fr: "Les cuisines persanes posent la saveur avec patience — fesenjān épaissi à la noix et à la grenade, ghormeh sabzi vert des herbes longuement mijotées. Safran, citron séché et tahdig de riz ferment la table.",
    de: "Persische Küchen schichten Geschmack mit Geduld — Fesenjān mit Walnuss und Granatapfel angedickt, Ghormeh Sabzi grün von langsam geschmorten Kräutern. Safran, getrocknete Limette und Reis-Tahdig schließen den Tisch.",
    it: "Le cucine persiane stratificano il sapore con pazienza — fesenjān addensato con noce e melagrana, ghormeh sabzi verde di erbe lungamente stufate. Zafferano, lime essiccato e il tahdig di riso chiudono la tavola.",
    pt: "As cozinhas persas estratificam o sabor com paciência — fesenjān engrossado com noz e romã, ghormeh sabzi verde de ervas longamente refogadas. Açafrão, limão seco e o tahdig de arroz fecham a mesa.",
  },
  'Israel': {
    en: "Israeli cooking pulls from across the eastern Mediterranean — silky hummus, sabich pita stuffed with eggplant and egg, lemon and parsley constant. Casual abundance, sharp seasoning, breakfast that lasts all day.",
    ro: "Bucătăria israeliană împrumută din toată Mediterana de est — hummus mătăsos, sabich în pita cu vinete și ou, lămâie și pătrunjel mereu. Abundență relaxată, condimente ascuțite, mic dejun care durează toată ziua.",
    es: "La cocina israelí toma del Mediterráneo oriental en su conjunto — hummus sedoso, sabich en pita con berenjena y huevo, limón y perejil siempre presentes. Abundancia relajada, sazón afilada, un desayuno que dura todo el día.",
    fr: "La cuisine israélienne puise dans toute la Méditerranée orientale — houmous soyeux, pita sabich farcie d'aubergine et d'œuf, citron et persil partout. Abondance décontractée, assaisonnement franc, petit-déjeuner qui s'étire toute la journée.",
    de: "Die israelische Küche bedient sich quer durch das östliche Mittelmeer — seidiger Hummus, Sabich-Pita gefüllt mit Aubergine und Ei, Zitrone und Petersilie überall. Lässige Fülle, klare Würze, ein Frühstück, das sich über den ganzen Tag zieht.",
    it: "La cucina israeliana attinge a tutto il Mediterraneo orientale — hummus setoso, pita sabich farcita di melanzana e uovo, limone e prezzemolo sempre presenti. Abbondanza informale, condimento netto, una colazione che dura tutto il giorno.",
    pt: "A cozinha israelense puxa de todo o Mediterrâneo oriental — homus sedoso, sabich em pita recheada com berinjela e ovo, limão e salsinha sempre presentes. Abundância despretensiosa, tempero franco, café da manhã que dura o dia inteiro.",
  },
  'Syria': {
    en: "Syrian tables run on generosity — kibbeh shaped by hand, shakshuka eaten straight from the pan, fatteh built in layers of bread, yogurt and chickpeas. Pomegranate molasses and sumac keep the seasoning sharp.",
    ro: "Mesele siriene merg pe generozitate — kibbeh modelat cu mâna, shakshuka mâncat direct din tigaie, fatteh construit în straturi de pâine, iaurt și năut. Melasa de rodie și sumacul țin condimentarea ascuțită.",
    es: "Las mesas sirias funcionan con generosidad — kibbeh moldeado a mano, shakshuka comida directamente de la sartén, fatteh montado en capas de pan, yogur y garbanzos. Melaza de granada y zumaque mantienen el sazón afilado.",
    fr: "Les tables syriennes vivent de générosité — kibbeh modelé à la main, shakshuka mangée à même la poêle, fatteh monté en couches de pain, yaourt et pois chiches. Mélasse de grenade et sumac gardent l'assaisonnement vif.",
    de: "Syrische Tische leben von Großzügigkeit — Kibbeh von Hand geformt, Shakshuka direkt aus der Pfanne gegessen, Fatteh in Schichten aus Brot, Joghurt und Kichererbsen aufgebaut. Granatapfelsirup und Sumach halten die Würze scharf.",
    it: "Le tavole siriane vivono di generosità — kibbeh modellato a mano, shakshuka mangiata direttamente dalla padella, fatteh costruito a strati di pane, yogurt e ceci. Melassa di melagrana e sommacco tengono il condimento vivo.",
    pt: "As mesas sírias vivem de generosidade — kibe moldado à mão, shakshuka comida direto da frigideira, fatteh montado em camadas de pão, iogurte e grão-de-bico. Melaço de romã e sumagre mantêm o tempero vivo.",
  },
  'Turkey': {
    en: "Turkish cooking moves between meze, bread oven and copper pot — flaky baklava soaked in syrup, eggs scrambled into pepper-rich menemen. Strong tea is poured at every meal, often before the first plate arrives.",
    ro: "Bucătăria turcească se mișcă între meze, cuptor de pâine și oală de cupru — baklava fragedă în sirop, ouă bătute în menemen plin cu ardei. Ceaiul tare se toarnă la fiecare masă, deseori înainte de prima farfurie.",
    es: "La cocina turca se mueve entre meze, horno de pan y cazuela de cobre — baklava hojaldrada empapada en almíbar, huevos revueltos en menemen cargado de pimiento. El té fuerte se sirve en cada comida, a menudo antes de que llegue el primer plato.",
    fr: "La cuisine turque circule entre meze, four à pain et casserole de cuivre — baklava feuilletée trempée dans le sirop, œufs brouillés en menemen riche en poivron. Le thé fort se sert à chaque repas, souvent avant la première assiette.",
    de: "Die türkische Küche bewegt sich zwischen Meze, Brotofen und Kupferpfanne — blättriges Baklava in Sirup getränkt, Eier zu pfeffrigem Menemen verrührt. Starker Tee wird zu jeder Mahlzeit eingeschenkt, oft schon vor dem ersten Teller.",
    it: "La cucina turca si muove tra meze, forno del pane e pentola di rame — baklava sfogliato impregnato di sciroppo, uova strapazzate in menemen ricco di peperoncino. Il tè forte si versa a ogni pasto, spesso prima del primo piatto.",
    pt: "A cozinha turca se move entre meze, forno do pão e panela de cobre — baklava folhado encharcado em calda, ovos mexidos em menemen carregado de pimentão. O chá forte é servido em cada refeição, muitas vezes antes do primeiro prato.",
  },

  // ── North African
  'Morocco': {
    en: "Moroccan kitchens move slowly — clay tagines holding meat with preserved lemon, harira thickening with lentils and tomato, ras el hanout perfumed across every dish. Spice, fruit and time do the cooking together.",
    ro: "Bucătăriile marocane se mișcă încet — tagine din lut cu carne și lămâie murată, harira îngroșată cu linte și roșii, ras el hanout parfumat în fiecare fel. Condimentul, fructele și timpul gătesc împreună.",
    es: "Las cocinas marroquíes van despacio — tagines de barro con carne y limón en conserva, harira espesando con lentejas y tomate, ras el hanout perfumando cada plato. La especia, la fruta y el tiempo cocinan juntos.",
    fr: "Les cuisines marocaines avancent lentement — tajines en terre avec viande et citron confit, harira épaississant aux lentilles et tomates, ras el hanout parfumant chaque plat. L'épice, le fruit et le temps cuisinent ensemble.",
    de: "Marokkanische Küchen arbeiten langsam — Tonschüssel-Tajines mit Fleisch und Salzzitrone, Harira mit Linsen und Tomaten verdickt, Ras el Hanout parfümiert jedes Gericht. Gewürz, Frucht und Zeit kochen gemeinsam.",
    it: "Le cucine marocchine vanno piano — tajine di terracotta con carne e limone in salamoia, harira che si addensa con lenticchie e pomodoro, ras el hanout che profuma ogni piatto. La spezia, il frutto e il tempo cucinano insieme.",
    pt: "As cozinhas marroquinas andam devagar — tajines de barro com carne e limão em conserva, harira engrossando com lentilha e tomate, ras el hanout perfumando cada prato. Especiaria, fruta e tempo cozinham juntos.",
  },
  'Tunisia': {
    en: "Tunisian cooking warms with harissa — brik fried until the egg sets just right, chakchouka bubbling with tomato and pepper. Olive oil and chili are everywhere; the heat is direct and unapologetic.",
    ro: "Bucătăria tunisiană încălzește cu harissa — brik prăjit până oul prinde exact bine, chakchouka clocotind cu roșii și ardei. Uleiul de măsline și ardeiul iute sunt peste tot; căldura e directă, fără scuze.",
    es: "La cocina tunecina calienta con harissa — brik frito hasta que el huevo cuaja en su punto, chakchouka burbujeando con tomate y pimiento. Aceite de oliva y chile por todas partes; el picante es directo y sin disculpas.",
    fr: "La cuisine tunisienne chauffe à l'harissa — brik frit jusqu'à ce que l'œuf prenne juste, chakchouka bouillonnant aux tomates et poivrons. Huile d'olive et piment partout ; la chaleur est directe, sans excuse.",
    de: "Die tunesische Küche heizt mit Harissa — Brik frittiert, bis das Ei genau richtig steht, Chakchouka blubbernd mit Tomate und Paprika. Olivenöl und Chili überall; die Schärfe ist direkt, ohne Entschuldigung.",
    it: "La cucina tunisina scalda con harissa — brik fritto finché l'uovo prende il giusto, chakchouka che borbotta con pomodoro e peperone. Olio d'oliva e peperoncino ovunque; il piccante è diretto, senza scuse.",
    pt: "A cozinha tunisiana esquenta com harissa — brik frito até o ovo firmar no ponto certo, chakchouka borbulhando com tomate e pimentão. Azeite e pimenta por toda parte; o ardor é direto, sem desculpas.",
  },

  // ── Latin
  'Mexico': {
    en: "Mexico cooks loud and bright — chiles charred to a smoke, masa warmed on a comal, salsa pounded fresh in the molcajete. From street stands to home tables, the constant is heat balanced by lime and rendered fat.",
    ro: "Mexicul gătește tare și luminos — ardei arși până fac fum, masa încălzit pe comal, salsa pisat proaspăt în molcajete. De la tarabe la mesele de acasă, constanta e căldură echilibrată de lime și grăsime topită.",
    es: "México cocina alto y luminoso — chiles asados hasta humear, masa calentada en el comal, salsa machacada al momento en el molcajete. De los puestos de calle a la mesa de casa, la constante es el picante equilibrado por limón y grasa fundida.",
    fr: "Le Mexique cuisine fort et lumineux — chiles brûlés jusqu'à la fumée, masa chauffée sur le comal, salsa pilée frais au molcajete. Du stand de rue à la table familiale, la constante reste le piquant équilibré par le citron vert et le gras fondu.",
    de: "Mexiko kocht laut und hell — Chilis bis zum Rauch geröstet, Masa auf dem Comal erwärmt, Salsa frisch im Molcajete gestampft. Vom Straßenstand bis zum Küchentisch bleibt die Konstante Schärfe, ausgewogen durch Limette und ausgelassenes Fett.",
    it: "Il Messico cucina forte e luminoso — chili bruciati fino al fumo, masa scaldata sul comal, salsa pestata al momento nel molcajete. Dai banchi di strada alle tavole di casa, la costante è il piccante bilanciato da lime e grasso fuso.",
    pt: "O México cozinha alto e brilhante — pimentas tostadas até soltar fumaça, masa aquecida no comal, salsa socada na hora no molcajete. Das barracas de rua às mesas de casa, a constante é o picante equilibrado por limão e gordura derretida.",
  },
  'Peru': {
    en: "Peru cooks where ocean meets the Andes — lime-cured ceviche on the coast, potato-rich causa from highland kitchens, lomo saltado borrowing wok craft from Chinese arrivals. Bright acid, bold contrast, working altitude.",
    ro: "Peru gătește unde oceanul întâlnește Anzii — ceviche marinat în lime pe coastă, causa cu cartofi din bucătăriile de altitudine, lomo saltado împrumutând wok-ul de la chinezi. Aciditate luminoasă, contrast curajos.",
    es: "Perú cocina donde el océano se encuentra con los Andes — ceviche curado en limón en la costa, causa cargada de papa desde las cocinas serranas, lomo saltado tomando el wok prestado de los chinos. Acidez brillante, contraste valiente, altitud que trabaja.",
    fr: "Le Pérou cuisine là où l'océan rencontre les Andes — ceviche marqué au citron vert sur la côte, causa chargée de pomme de terre des cuisines d'altitude, lomo saltado empruntant le wok aux arrivants chinois. Acide vif, contraste franc, altitude qui travaille.",
    de: "Peru kocht dort, wo der Ozean auf die Anden trifft — limettengezogenes Ceviche an der Küste, kartoffelreiche Causa aus den Hochlandküchen, Lomo Saltado mit Wok-Technik der chinesischen Einwanderer. Helle Säure, mutiger Kontrast, arbeitende Höhe.",
    it: "Il Perù cucina dove l'oceano incontra le Ande — ceviche marcato al lime sulla costa, causa carica di patata dalle cucine d'altura, lomo saltado che prende il wok dagli arrivi cinesi. Acidità viva, contrasto deciso, altitudine che lavora.",
    pt: "O Peru cozinha onde o oceano encontra os Andes — ceviche curado no limão na costa, causa carregada de batata vinda das cozinhas serranas, lomo saltado tomando o wok emprestado dos chineses. Acidez brilhante, contraste forte, altitude que trabalha.",
  },
  'Argentina': {
    en: "Argentina cooks for the asado — open fire, beef, salt — but the kitchen runs on hand pies and milanesa pounded thin. Chimichurri sits on every table; the bread is there to mop the plate clean.",
    ro: "Argentina gătește pentru asado — foc deschis, vită, sare — dar bucătăria merge pe plăcinte și milanesa bătute subțire. Chimichurri stă pe fiecare masă; pâinea e acolo pentru a curăța farfuria.",
    es: "Argentina cocina para el asado — fuego abierto, carne, sal — pero la cocina de cada día gira en torno a empanadas y milanesas bien batidas. El chimichurri está en cada mesa; el pan está ahí para rebañar el plato.",
    fr: "L'Argentine cuisine pour l'asado — feu vif, bœuf, sel — mais le quotidien tourne autour des empanadas et de la milanesa battue fine. Le chimichurri est sur chaque table ; le pain est là pour saucer l'assiette.",
    de: "Argentinien kocht für den Asado — offenes Feuer, Rindfleisch, Salz — aber der Alltag dreht sich um Empanadas und dünn geklopfte Milanesa. Chimichurri steht auf jedem Tisch; das Brot wischt den Teller sauber.",
    it: "L'Argentina cucina per l'asado — fuoco vivo, manzo, sale — ma la cucina di tutti i giorni gira intorno alle empanadas e alle milanesa battute fini. Il chimichurri sta su ogni tavola; il pane c'è per pulire il piatto.",
    pt: "A Argentina cozinha para o asado — fogo aberto, carne, sal — mas a cozinha do dia a dia gira em torno de empanadas e milanesas bem batidas. O chimichurri está em toda mesa; o pão está ali para limpar o prato.",
  },
  'Brazil': {
    en: "Brazilian cooking ranges from beach to interior — slow feijoada with black beans and smoked pork, coconut-rich moqueca simmered in clay pots. Citrus, hot pepper and rice anchor every plate.",
    ro: "Bucătăria braziliană se întinde de la plajă la interior — feijoada lentă cu fasole neagră și porc afumat, moqueca cu lapte de cocos fiartă în oale de lut. Citrice, ardei iute și orez ancorează fiecare farfurie.",
    es: "La cocina brasileña va de la playa al interior — feijoada lenta con frijol negro y cerdo ahumado, moqueca cremosa de coco cocida en olla de barro. Cítrico, ají picante y arroz anclan cada plato.",
    fr: "La cuisine brésilienne va de la plage à l'intérieur — feijoada lente aux haricots noirs et porc fumé, moqueca au lait de coco mijotée en terrine. Agrumes, piment et riz ancrent chaque assiette.",
    de: "Die brasilianische Küche reicht vom Strand bis ins Landesinnere — langsame Feijoada mit schwarzen Bohnen und geräuchertem Schwein, kokosreiche Moqueca im Tontopf geschmort. Zitrusfrüchte, scharfer Pfeffer und Reis tragen jeden Teller.",
    it: "La cucina brasiliana va dalla spiaggia all'entroterra — feijoada lenta con fagioli neri e maiale affumicato, moqueca cremosa di cocco sobbollita in pentole di terracotta. Agrumi, peperoncino e riso ancorano ogni piatto.",
    pt: "A cozinha brasileira vai da praia ao interior — feijoada lenta com feijão preto e porco defumado, moqueca cremosa de coco fervida em panela de barro. Cítrico, pimenta e arroz ancoram cada prato.",
  },
  'Ecuador': {
    en: "Ecuadorian cooking is shaped by Pacific shore and Andean peaks — bright ceviches scattered with toasted corn, encebollado warm with tuna and yuca. Citrus, plantain and salt, the rhythm of altitude.",
    ro: "Bucătăria ecuadoriană e formată de coasta Pacificului și de Anzi — ceviche-uri luminoase presărate cu porumb prăjit, encebollado cald cu ton și yuca. Citrice, plantan și sare, ritmul altitudinii.",
    es: "La cocina ecuatoriana está marcada por la costa del Pacífico y las cumbres andinas — ceviches brillantes con maíz tostado por encima, encebollado caliente con atún y yuca. Cítrico, plátano y sal, el ritmo de la altura.",
    fr: "La cuisine équatorienne est façonnée par la côte Pacifique et les sommets andins — ceviches vifs parsemés de maïs grillé, encebollado chaud au thon et au manioc. Agrumes, plantain et sel, le rythme de l'altitude.",
    de: "Die ecuadorianische Küche wird von der Pazifikküste und den Andengipfeln geprägt — lebendige Ceviches mit geröstetem Mais bestreut, warmes Encebollado mit Thunfisch und Yuca. Zitrus, Kochbanane und Salz — der Rhythmus der Höhe.",
    it: "La cucina ecuadoriana è forgiata dalla costa pacifica e dalle cime andine — ceviche vivace cosparso di mais tostato, encebollado caldo con tonno e yuca. Agrumi, platano e sale, il ritmo dell'altitudine.",
    pt: "A cozinha equatoriana é moldada pela costa pacífica e pelos picos andinos — ceviches vivos polvilhados com milho tostado, encebollado quente com atum e aipim. Cítrico, banana-da-terra e sal, o ritmo da altitude.",
  },
  'Cuba': {
    en: "Cuban cooking moves slowly with garlic, citrus and oregano — ropa vieja shredded and simmered with peppers, picadillo loaded with olives and raisins. Sweet plantains finish the plate; rice keeps the peace.",
    ro: "Bucătăria cubaneză merge încet cu usturoi, citrice și oregano — ropa vieja destrămat și fiert cu ardei, picadillo plin de măsline și stafide. Banane dulci închid farfuria; orezul ține pacea.",
    es: "La cocina cubana avanza despacio con ajo, cítrico y orégano — ropa vieja desmenuzada y guisada con pimientos, picadillo cargado de aceitunas y pasas. El plátano maduro cierra el plato; el arroz mantiene la paz.",
    fr: "La cuisine cubaine avance doucement à l'ail, l'agrume et l'origan — ropa vieja effilochée mijotée aux poivrons, picadillo gorgé d'olives et de raisins secs. Le plantain doux ferme l'assiette ; le riz garde la paix.",
    de: "Die kubanische Küche bewegt sich langsam mit Knoblauch, Zitrusfrucht und Oregano — Ropa Vieja zerzupft und mit Paprika geschmort, Picadillo voller Oliven und Rosinen. Süße Kochbananen schließen den Teller; Reis hält den Frieden.",
    it: "La cucina cubana avanza lenta con aglio, agrume e origano — ropa vieja sfilacciata e cotta con peperoni, picadillo carico di olive e uvetta. I platani dolci chiudono il piatto; il riso tiene la pace.",
    pt: "A cozinha cubana avança devagar com alho, cítrico e orégano — ropa vieja desfiada e refogada com pimentões, picadillo carregado de azeitona e uva-passa. A banana-da-terra madura fecha o prato; o arroz mantém a paz.",
  },

  // ── Eastern European
  'Romania': {
    en: "Romanian cooking comes from cold winters and big tables — sarmale wrapped tight in cabbage leaves, ciorbă tangy with fermented bran. Plenty of dill, sour cream and slow oven hours spent waiting.",
    ro: "Bucătăria românească vine din ierni reci și mese mari — sarmale rulate strâns în foi de varză, ciorbă acrită cu borș. Mărar din belșug, smântână, ore lungi în cuptor și răbdare la masă.",
    es: "La cocina rumana viene de inviernos fríos y mesas grandes — sarmale apretados en hojas de col, ciorbă ácida por el salvado de borș fermentado. Mucho eneldo, nata agria y horas pacientes de horno lento.",
    fr: "La cuisine roumaine vient d'hivers longs et de grandes tablées — sarmale serrés dans les feuilles de chou, ciorbă acidulée au son fermenté. Beaucoup d'aneth, de crème fraîche et de longues heures de four lent.",
    de: "Die rumänische Küche kommt aus langen Wintern und großen Tafelrunden — Sarmale fest in Kohlblätter gerollt, Ciorbă mit fermentierter Kleie säuerlich gestimmt. Viel Dill, Sauerrahm und lange Ofenstunden voller Geduld.",
    it: "La cucina rumena viene da inverni lunghi e tavole grandi — sarmale stretti nelle foglie di cavolo, ciorbă acidulata dalla crusca fermentata. Tanto aneto, panna acida e lunghe ore d'attesa al forno lento.",
    pt: "A cozinha romena vem de invernos longos e mesas grandes — sarmale apertados em folhas de repolho, ciorbă acidulada pelo farelo fermentado. Muito endro, creme azedo e longas horas pacientes de forno baixo.",
  },
  'Hungary': {
    en: "Hungarian cooking centers on paprika — sweet, smoked, hot — bloomed in lard before anything else. Goulash runs deep and dark, paprikash mellows with sour cream, lángos comes crackling out of the fryer.",
    ro: "Bucătăria maghiară se învârte în jurul boielii — dulce, afumată, iute — înflorită în untură înainte de orice. Gulașul e adânc și închis, paprikash-ul se îmblânzește cu smântână, lángos-ul iese sfârâind din ulei.",
    es: "La cocina húngara gira alrededor del pimentón — dulce, ahumado, picante — abierto en manteca antes que nada más. El gulasch es profundo y oscuro, el paprikash se suaviza con nata agria, el lángos sale crujiente de la freidora.",
    fr: "La cuisine hongroise tourne autour du paprika — doux, fumé, fort — éclos dans le saindoux avant tout le reste. Le goulash plonge profond et sombre, le paprikash s'adoucit à la crème, le lángos sort grésillant de la friteuse.",
    de: "Die ungarische Küche dreht sich um Paprika — süß, geräuchert, scharf — in Schmalz aufgeblüht, bevor sonst etwas hineinkommt. Gulasch geht tief und dunkel, Paprikasch wird mit Sauerrahm milder, Lángos kommt knusprig aus der Friteuse.",
    it: "La cucina ungherese ruota attorno alla paprika — dolce, affumicata, piccante — fatta sbocciare nello strutto prima di tutto. Il goulash va profondo e scuro, il paprikash si addolcisce con la panna acida, il lángos esce sfrigolando dalla friggitrice.",
    pt: "A cozinha húngara gira em torno da páprica — doce, defumada, picante — aberta na banha antes de qualquer outra coisa. O goulash mergulha fundo e escuro, o paprikash se abranda com creme azedo, o lángos sai estalando da fritadeira.",
  },
  'Poland': {
    en: "Polish kitchens warm against winter — pierogi pinched by hand, mushroom soups deep with dill, sour rye soup at Easter. Comfort food that doesn't apologize for butter or for second helpings.",
    ro: "Bucătăriile poloneze se încălzesc împotriva iernii — pierogi modelați cu mâna, supe de ciuperci cu mărar, supă acră de secară la Paște. Mâncare consistentă care nu se scuză pentru unt sau pentru porția a doua.",
    es: "Las cocinas polacas se calientan contra el invierno — pierogi cerrados a mano, sopas de seta con mucho eneldo, sopa ácida de centeno en Pascua. Comida de consuelo que no pide perdón por la mantequilla ni por repetir plato.",
    fr: "Les cuisines polonaises se réchauffent contre l'hiver — pierogi pincés à la main, soupes de champignons rehaussées d'aneth, soupe aigre au seigle de Pâques. Cuisine de réconfort qui ne s'excuse ni du beurre ni des secondes.",
    de: "Polnische Küchen wärmen gegen den Winter — Pierogi mit der Hand zugekniffen, Pilzsuppen voller Dill, saure Roggensuppe zu Ostern. Komfortküche, die sich weder für die Butter noch für den Nachschlag entschuldigt.",
    it: "Le cucine polacche scaldano contro l'inverno — pierogi pizzicati a mano, zuppe di funghi profonde d'aneto, zuppa acida di segale a Pasqua. Cucina di conforto che non si scusa né per il burro né per le seconde porzioni.",
    pt: "As cozinhas polonesas se esquentam contra o inverno — pierogi pinçados à mão, sopas de cogumelo cheias de endro, sopa azeda de centeio na Páscoa. Comida de conforto que não se desculpa pela manteiga nem por repetir.",
  },
  'Russia': {
    en: "Russian cooking is winter cooking — borscht deep with beet and meat, kotlety pan-fried golden, solyanka rich with brine. Black bread, sour cream and dill quietly do most of the seasoning.",
    ro: "Bucătăria rusească e bucătărie de iarnă — borș adânc cu sfeclă și carne, kotlety prăjite auriu, solyanka bogat în saramură. Pâine neagră, smântână și mărar fac mare parte din asezonare.",
    es: "La cocina rusa es cocina de invierno — borsch profundo de remolacha y carne, kotlety dorados a la sartén, solyanka cargada de salmuera. Pan negro, nata agria y eneldo hacen, en silencio, casi todo el trabajo del sazón.",
    fr: "La cuisine russe est cuisine d'hiver — bortch profond à la betterave et à la viande, kotlety dorés à la poêle, solyanka chargée de saumure. Pain noir, smetana et aneth assument discrètement l'essentiel de l'assaisonnement.",
    de: "Die russische Küche ist Winterküche — Borschtsch tief mit Rote Bete und Fleisch, goldgebratene Kotlety, Soljanka kräftig von Salzgurken. Schwarzbrot, Schmand und Dill übernehmen leise den Großteil der Würze.",
    it: "La cucina russa è cucina d'inverno — borsch profondo di barbabietola e carne, kotlety dorate in padella, solyanka densa di salamoia. Pane nero, smetana e aneto fanno in silenzio gran parte del condimento.",
    pt: "A cozinha russa é cozinha de inverno — borsch profundo de beterraba e carne, kotlety dourados na frigideira, solyanka carregada de salmoura. Pão preto, smetana e endro fazem em silêncio a maior parte do tempero.",
  },
  'Georgia': {
    en: "Georgian cooking opens around the supra — long-table dinners with toasts, walnuts and pomegranate. Khachapuri straight from a clay oven, khinkali pinched into pleated dumplings, herbs everywhere on the plate.",
    ro: "Bucătăria georgiană se deschide în jurul mesei supra — cine lungi cu toasturi, nuci și rodie. Khachapuri direct din cuptor de lut, khinkali strânși în colțunași plisați, ierburi peste tot pe farfurie.",
    es: "La cocina georgiana se abre alrededor de la supra — cenas largas con brindis, nueces y granada. Khachapuri recién salido del horno de barro, khinkali doblados en empanadillas plisadas, hierbas por todo el plato.",
    fr: "La cuisine géorgienne s'ouvre autour de la supra — longs dîners de toasts, noix et grenade. Khatchapouri sorti du four de terre, khinkali pincés en raviolis plissés, herbes partout sur l'assiette.",
    de: "Die georgische Küche öffnet sich rund um die Supra — lange Tafelabende mit Trinksprüchen, Walnuss und Granatapfel. Chatschapuri frisch aus dem Lehmofen, Chinkali zu plissierten Teigtaschen geformt, Kräuter überall auf dem Teller.",
    it: "La cucina georgiana si apre intorno alla supra — cene lunghe con brindisi, noci e melagrana. Khachapuri appena uscito dal forno di terra, khinkali pizzicati in fagottini pieghettati, erbe ovunque sul piatto.",
    pt: "A cozinha georgiana se abre em torno da supra — jantares longos com brindes, nozes e romã. Khachapuri recém-saído do forno de barro, khinkali pinçados em trouxinhas pregueadas, ervas por todo o prato.",
  },

  // ── Nordic
  'Sweden': {
    en: "Sweden cooks for the long winter — salmon cured in dill, meatballs in cream gravy, cinnamon buns warmed with cardamom. Calm flavors, careful seasoning, fika treated as a daily ritual rather than a break.",
    ro: "Suedia gătește pentru iarna lungă — somon marinat cu mărar, chiftele în sos de smântână, chifle cu scorțișoară și cardamom. Arome calme, condimentare atentă, fika tratată ca un ritual zilnic, nu ca o pauză.",
    es: "Suecia cocina para el invierno largo — salmón curado con eneldo, albóndigas en salsa de nata, bollos de canela perfumados con cardamomo. Sabores calmados, sazón cuidadosa, el fika tratado como rito diario más que como pausa.",
    fr: "La Suède cuisine pour le long hiver — saumon mariné à l'aneth, boulettes en sauce crémeuse, brioches à la cannelle réchauffées à la cardamome. Saveurs calmes, assaisonnement précis, le fika traité comme rituel quotidien plutôt que pause.",
    de: "Schweden kocht für den langen Winter — mit Dill gebeizter Lachs, Köttbullar in Sahnesoße, Zimtschnecken mit Kardamom gewärmt. Ruhige Aromen, sorgfältige Würze, Fika als tägliches Ritual statt als Pause behandelt.",
    it: "La Svezia cucina per il lungo inverno — salmone marinato all'aneto, polpettine in sugo di panna, brioche alla cannella scaldate con cardamomo. Sapori calmi, condimento misurato, il fika trattato come rito quotidiano più che come pausa.",
    pt: "A Suécia cozinha para o longo inverno — salmão curado no endro, almôndegas em molho de creme, pãezinhos de canela aquecidos com cardamomo. Sabores calmos, tempero cuidadoso, o fika tratado como ritual diário em vez de pausa.",
  },
  'Finland': {
    en: "Finnish cooking draws flavor from cold landscape — rye-crust Karelian pies, dill-bright salmon soup, dense rye bread on every counter. Quiet meals, careful seasoning, deep respect for the lakes and forests.",
    ro: "Bucătăria finlandeză extrage gust din peisajul rece — plăcinte kareliane cu coajă de secară, supă de somon cu mărar, pâine densă de secară pe orice blat. Mese liniștite, condimentare atentă, respect adânc pentru lacuri și păduri.",
    es: "La cocina finlandesa saca sabor del paisaje frío — empanadillas carelias con corteza de centeno, sopa de salmón brillante de eneldo, pan denso de centeno en cada encimera. Comidas tranquilas, sazón cuidadosa, respeto hondo por lagos y bosques.",
    fr: "La cuisine finlandaise tire sa saveur du paysage froid — tartelettes caréliennes à la croûte de seigle, soupe de saumon vibrante d'aneth, pain de seigle dense sur chaque plan de travail. Repas calmes, assaisonnement précis, respect profond des lacs et des forêts.",
    de: "Die finnische Küche zieht Geschmack aus der kalten Landschaft — Karelische Piroggen mit Roggenkruste, Lachssuppe leuchtend von Dill, dichtes Roggenbrot auf jeder Arbeitsplatte. Stille Mahlzeiten, sorgfältige Würze, tiefer Respekt vor Seen und Wäldern.",
    it: "La cucina finlandese trae sapore dal paesaggio freddo — tortine careliane con crosta di segale, zuppa di salmone vivace d'aneto, pane di segale denso su ogni piano. Pasti silenziosi, condimento misurato, profondo rispetto per laghi e foreste.",
    pt: "A cozinha finlandesa tira sabor da paisagem fria — pequenas tortas carelianas com crosta de centeio, sopa de salmão vibrante de endro, pão denso de centeio em cada bancada. Refeições silenciosas, tempero cuidadoso, respeito fundo pelos lagos e florestas.",
  },

  // ── Sub-Saharan
  'Nigeria': {
    en: "Nigerian cooking is bold and communal — smoky jollof rice debated across the region, egusi soup thickened with melon seed and bitter greens. Palm oil, scotch bonnet, generous portions, no whispering.",
    ro: "Bucătăria nigeriană e curajoasă și comună — jollof rice afumat dezbătut în toată regiunea, supă de egusi îngroșată cu semințe de pepene și verdețuri amare. Ulei de palmier, ardei iute, porții generoase, fără șoaptă.",
    es: "La cocina nigeriana es atrevida y comunitaria — jollof rice ahumado discutido en toda la región, sopa de egusi espesada con semilla de melón y hojas amargas. Aceite de palma, chile scotch bonnet, raciones generosas, nada en voz baja.",
    fr: "La cuisine nigériane est audacieuse et communautaire — jollof rice fumé débattu d'une région à l'autre, soupe egusi épaissie aux graines de melon et aux verdures amères. Huile de palme, piment scotch bonnet, portions généreuses, rien à voix basse.",
    de: "Die nigerianische Küche ist mutig und gemeinschaftlich — rauchiger Jollof-Reis, von Region zu Region heftig diskutiert, Egusi-Suppe mit Melonenkernen und bitteren Blattgrün verdickt. Palmöl, Scotch Bonnet, großzügige Portionen, nichts wird geflüstert.",
    it: "La cucina nigeriana è audace e comunitaria — jollof rice affumicato discusso da una regione all'altra, zuppa di egusi addensata con semi di melone e verdure amare. Olio di palma, scotch bonnet, porzioni generose, niente a voce bassa.",
    pt: "A cozinha nigeriana é ousada e comunal — jollof rice defumado debatido de uma região para outra, sopa de egusi engrossada com semente de melão e folhas amargas. Óleo de dendê, scotch bonnet, porções generosas, nada em voz baixa.",
  },

  // ── Anglo
  'USA': {
    en: "American cooking is regional, not national — New England clam chowder, Caribbean-rooted jerk, the cheeseburger from anywhere with a flattop. The thread that runs through everything is comfort done seriously.",
    ro: "Bucătăria americană e regională, nu națională — supă de scoici din New England, jerk din Caraibe, cheeseburger-ul de oriunde există o plită. Firul comun e mâncare de confort luată în serios.",
    es: "La cocina estadounidense es regional, no nacional — clam chowder de Nueva Inglaterra, jerk de raíz caribeña, la cheeseburger de cualquier sitio con una plancha. El hilo que recorre todo es la comida de consuelo, tomada en serio.",
    fr: "La cuisine américaine est régionale, pas nationale — clam chowder de Nouvelle-Angleterre, jerk aux racines caribéennes, le cheeseburger né partout où il y a une plancha. Le fil commun : la cuisine de réconfort prise au sérieux.",
    de: "Die amerikanische Küche ist regional, nicht national — Clam Chowder aus Neuengland, karibisch verwurzeltes Jerk, der Cheeseburger von überall mit einer Plancha. Der durchgehende Faden: Komfortküche, ernsthaft gemacht.",
    it: "La cucina americana è regionale, non nazionale — clam chowder del New England, jerk di radice caraibica, il cheeseburger nato ovunque ci sia una piastra. Il filo comune: cucina di conforto presa sul serio.",
    pt: "A cozinha americana é regional, não nacional — clam chowder da Nova Inglaterra, jerk de raiz caribenha, o cheeseburger nascido em qualquer canto com uma chapa. O fio comum: comida de conforto levada a sério.",
  },
  // REVIEW: "pastel de carne" risks reading as dessert in some LATAM markets;
  // peninsular Spanish accepts it as the Aussie meat-pie analogue.
  // REVIEW (DE): "Fleisch-Pies" uses the English loanword as the most recognisable
  // German rendering for the specifically Australian meat pie (Pastete reads as pâté).
  // REVIEW (IT): "tortini di carne" is the closest natural rendering of the Aussie
  // meat pie — Italian has no clean equivalent dish category.
  // REVIEW (PT): "tortinhas de carne" — same issue; BR readers may parse it as small
  // savoury tarts rather than the chunky-fill Aussie meat pie.
  'Australia': {
    en: "Australian cooking borrows widely and barbecues constantly — peppery meat pies handed across counters, summer pavlova piled with passionfruit and cream. Coffee culture takes the rest seriously.",
    ro: "Bucătăria australiană împrumută peste tot și face grătar constant — plăcinte cu carne piperate, pavlova de vară cu fructul pasiunii și frișcă. Cultura cafelei tratează restul cu seriozitate.",
    es: "La cocina australiana toma prestado de todas partes y vive de la barbacoa — pasteles de carne bien especiados pasados por encima del mostrador, pavlova de verano coronada con fruta de la pasión y nata. La cultura del café se toma muy en serio.",
    fr: "La cuisine australienne emprunte large et fait barbecue en continu — tourtes à la viande poivrée passées par-dessus le comptoir, pavlova d'été couronnée de fruit de la passion et de crème. La culture café prend le reste très au sérieux.",
    de: "Die australische Küche borgt weit und grillt unentwegt — pfeffrige Fleisch-Pies über die Theke gereicht, sommerliche Pavlova mit Passionsfrucht und Sahne gekrönt. Die Kaffeekultur nimmt den Rest sehr ernst.",
    it: "La cucina australiana prende a prestito ovunque e griglia di continuo — tortini di carne pepati passati sopra al bancone, pavlova estiva incoronata di frutto della passione e panna. La cultura del caffè prende il resto molto sul serio.",
    pt: "A cozinha australiana toma emprestado de toda parte e faz churrasco sem parar — tortinhas de carne apimentadas passadas por cima do balcão, pavlova de verão coroada de maracujá e chantilly. A cultura do café leva o resto muito a sério.",
  },

  // ── Central European
  // REVIEW (FR): "cuisine de brasserie" plays on the brewery/restaurant double meaning
  // — works for the German beer-hall register but could be swapped for "cuisine d'auberge".
  'Germany': {
    en: "German cooking is hearty and direct — pork schnitzel pounded thin, currywurst sliced on a paper plate, mustard and bread always close. Beer-hall comfort food, regional pride, no fuss.",
    ro: "Bucătăria germană e consistentă și directă — schnitzel de porc bătut subțire, currywurst feliat pe farfurie de hârtie, muștar și pâine mereu aproape. Mâncare de cârciumă bavareză, mândrie regională, fără agitație.",
    es: "La cocina alemana es contundente y directa — schnitzel de cerdo bien batido, currywurst rebanada sobre plato de papel, mostaza y pan siempre cerca. Comida de cervecería, orgullo regional, sin alardes.",
    fr: "La cuisine allemande est consistante et directe — escalope de porc battue fine, currywurst tranchée sur assiette en carton, moutarde et pain toujours à portée. Cuisine de brasserie, fierté régionale, sans chichis.",
    de: "Die deutsche Küche ist herzhaft und direkt — Schweineschnitzel dünn geklopft, Currywurst auf dem Pappteller geschnitten, Senf und Brot immer in Reichweite. Wirtshausküche, regionaler Stolz, kein Aufhebens.",
    it: "La cucina tedesca è sostanziosa e diretta — cotoletta di maiale battuta fine, currywurst affettata su piatto di carta, senape e pane sempre a portata. Cucina da birreria, orgoglio regionale, senza fronzoli.",
    pt: "A cozinha alemã é farta e direta — bife à milanesa de porco batido fino, currywurst fatiada em prato de papelão, mostarda e pão sempre à mão. Comida de cervejaria, orgulho regional, sem afetação.",
  },
  'Switzerland': {
    en: "Swiss cooking turns dairy and potato into ritual — rösti crisped golden in a skillet, fondue bubbling at the center of the table. Mountain food, mountain restraint, a long spoon.",
    ro: "Bucătăria elvețiană transformă lactatele și cartofii în ritual — rösti crocant și auriu în tigaie, fondue clocotind în centrul mesei. Mâncare de munte, reținere de munte, o lingură lungă.",
    es: "La cocina suiza convierte el lácteo y la patata en rito — rösti dorado y crujiente en la sartén, fondue burbujeando en el centro de la mesa. Comida de montaña, mesura de montaña, una cuchara larga.",
    fr: "La cuisine suisse fait du laitier et de la pomme de terre un rituel — rösti doré croustillant à la poêle, fondue bouillonnant au centre de la table. Cuisine de montagne, retenue de montagne, une longue cuillère.",
    de: "Die Schweizer Küche macht aus Milchprodukten und Kartoffel ein Ritual — Rösti goldknusprig in der Pfanne, Fondue blubbernd in der Tischmitte. Bergküche, Bergzurückhaltung, ein langer Löffel.",
    it: "La cucina svizzera fa di latticini e patate un rito — rösti dorato croccante in padella, fondue che gorgoglia al centro della tavola. Cucina di montagna, misura di montagna, un cucchiaio lungo.",
    pt: "A cozinha suíça transforma laticínio e batata em ritual — rösti dourado e crocante na frigideira, fondue borbulhando no centro da mesa. Comida de montanha, comedimento de montanha, uma colher comprida.",
  },
  'Netherlands': {
    en: "Dutch cooking keeps it practical — mashed-vegetable stamppot, small puffy poffertjes dusted with sugar. Cabbage, sausage, hot mustard, gezellig company at a long pine table.",
    ro: "Bucătăria olandeză rămâne practică — stamppot cu legume pasate, poffertjes mici și pufoși cu zahăr pudră. Varză, cârnați, muștar iute, companie gezellig la o masă lungă de pin.",
    es: "La cocina holandesa se mantiene práctica — stamppot de verdura aplastada, pequeños poffertjes esponjosos espolvoreados con azúcar. Col, salchicha, mostaza fuerte, compañía gezellig en una mesa larga de pino.",
    fr: "La cuisine néerlandaise reste pratique — stamppot de légumes écrasés, petits poffertjes gonflés saupoudrés de sucre. Chou, saucisse, moutarde forte, compagnie gezellig autour d'une longue table en pin.",
    de: "Die niederländische Küche bleibt praktisch — Stamppot aus zerstampftem Gemüse, kleine fluffige Poffertjes mit Zucker bestäubt. Kohl, Wurst, scharfer Senf, gezellige Gesellschaft an einem langen Kieferntisch.",
    it: "La cucina olandese resta pratica — stamppot di verdure schiacciate, piccoli poffertjes gonfi spolverati di zucchero. Cavolo, salsiccia, senape forte, compagnia gezellig attorno a un lungo tavolo di pino.",
    pt: "A cozinha holandesa se mantém prática — stamppot de legumes amassados, pequenos poffertjes fofos polvilhados de açúcar. Repolho, linguiça, mostarda forte, companhia gezellig em uma longa mesa de pinho.",
  },
  'Belgium': {
    en: "Belgian cooking is beer and butter — slow stoofvlees stewed in dark ale, moules-frites steamed open at the table. Frites with mayo are not a debate here, and the chocolate counter is taken seriously.",
    ro: "Bucătăria belgiană e bere și unt — stoofvlees fiert încet în bere brună, moules-frites deschise la masă. Cartofii prăjiți cu maioneză nu se dezbat aici, iar ciocolata e luată în serios.",
    es: "La cocina belga es cerveza y mantequilla — stoofvlees guisado despacio en cerveza negra, moules-frites abiertos al vapor en la mesa. Las patatas con mayonesa no se discuten aquí, y el mostrador de chocolate se toma muy en serio.",
    fr: "La cuisine belge est bière et beurre — stoofvlees mijoté longuement dans la bière brune, moules-frites ouvertes à la vapeur à table. Les frites avec mayo ne se discutent pas ici, et le comptoir à chocolat est pris très au sérieux.",
    de: "Die belgische Küche ist Bier und Butter — Stoofvlees langsam in dunklem Ale geschmort, Moules-frites am Tisch dampfend aufgehen lassen. Pommes mit Mayo werden hier nicht debattiert, und die Schokoladentheke nimmt man sehr ernst.",
    it: "La cucina belga è birra e burro — stoofvlees stufato a lungo nella birra scura, moules-frites aperte al vapore in tavola. Le patatine con mayo non si discutono qui, e il bancone del cioccolato si prende sul serio.",
    pt: "A cozinha belga é cerveja e manteiga — stoofvlees cozido devagar em cerveja escura, moules-frites abertos no vapor à mesa. As batatas com maionese não se discutem aqui, e o balcão do chocolate se leva muito a sério.",
  },

  // ── Central Asian
  'Uzbekistan': {
    en: "Uzbek cooking centers on plov — lamb, rice and carrots simmered for hours in a kazan — and manti, hand-pinched dumplings filled with onion and lamb. Bread baked in clay tandyrs, tea poured constantly.",
    ro: "Bucătăria uzbecă se învârte în jurul plov-ului — miel, orez și morcovi fierți ore întregi în kazan — și a manti-ului, colțunași făcuți cu mâna umpluți cu ceapă și miel. Pâine coaptă în tandyr de lut, ceai turnat constant.",
    es: "La cocina uzbeka gira en torno al plov — cordero, arroz y zanahoria cocidos horas en el kazán — y al manti, empanadillas cerradas a mano rellenas de cebolla y cordero. Pan cocido en tandyr de barro, té que no para de servirse.",
    fr: "La cuisine ouzbèke tourne autour du plov — agneau, riz et carottes mijotés des heures dans le kazan — et du manti, raviolis pincés à la main farcis d'oignon et d'agneau. Pain cuit dans le tandyr de terre, thé servi sans répit.",
    de: "Die usbekische Küche dreht sich um Plov — Lamm, Reis und Karotten stundenlang im Kasan geschmort — und Manti, handgekniffene Teigtaschen mit Zwiebel und Lammfleisch gefüllt. Brot im Lehm-Tandyr gebacken, Tee unablässig nachgeschenkt.",
    it: "La cucina uzbeka gira attorno al plov — agnello, riso e carote sobbolliti per ore nel kazan — e ai manti, ravioli pizzicati a mano ripieni di cipolla e agnello. Pane cotto nel tandyr di terracotta, tè versato senza sosta.",
    pt: "A cozinha uzbeque gira em torno do plov — cordeiro, arroz e cenoura fervidos por horas no kazan — e do manti, pastéis pinçados à mão recheados de cebola e cordeiro. Pão assado no tandyr de barro, chá servido sem parar.",
  },
};
