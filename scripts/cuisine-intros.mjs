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
 *   - en + ro + es: full editorial rewrite for all 44 hub-eligible cuisines
 *   - other 11 locales: fall back to the locale's templated intro in
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
  },
  'Greece': {
    en: "Greek cooking smells like oregano, olive oil and lemon zest — moussaka layered in baking trays, souvlaki turning over coals, spinach folded into thin phyllo. A coastal table, generous and unhurried.",
    ro: "Bucătăria grecească miroase a oregano, ulei de măsline și coajă de lămâie — moussaka în straturi, souvlaki rotit pe jar, spanac împăturit în foi subțiri de plăcintă. O masă mediteraneană, generoasă, fără grabă.",
    es: "La cocina griega huele a orégano, aceite de oliva y ralladura de limón — moussaka montada en bandeja, souvlaki girando sobre las brasas, espinacas envueltas en finas láminas de masa filo. Mesa mediterránea, generosa y sin prisa.",
  },
  'Spain': {
    en: "Spain cooks between Andalusian sun and Valencian rice fields — chilled gazpacho when the heat won't quit, saffron-stained paella on a wide steel pan. Olive oil is the constant; the rest is fierce regional pride.",
    ro: "Spania gătește între soarele Andaluziei și orezăriile Valenciei — gazpacho rece când căldura nu cedează, paella cu șofran pe tigaie lată. Uleiul de măsline e singurul element comun; restul e mândrie regională.",
    es: "España cocina entre el sol andaluz y los arrozales valencianos — gazpacho frío cuando el calor no afloja, paella teñida de azafrán sobre la paellera ancha. El aceite de oliva es la constante; lo demás es orgullo regional sin tregua.",
  },
  'France': {
    en: "France runs on slow technique — butter, wine, patience. Whether it's a Provençal ratatouille or a Burgundy braise, the recipes carry their region in their bones and trust the cook to take their time.",
    ro: "Bucătăria franceză merge pe tehnică lentă — unt, vin, răbdare. Fie că e o ratatouille provensală sau un bourguignon din Burgundia, fiecare rețetă își poartă regiunea în oase și are încredere în timpul bucătarului.",
    es: "Francia se mueve por técnica lenta — mantequilla, vino, paciencia. Sea una ratatouille provenzal o un estofado borgoñón, cada receta lleva su región en los huesos y confía en que el cocinero se tome su tiempo.",
  },
  'Portugal': {
    en: "Portuguese cooking is salt cod, olive oil and slow Atlantic afternoons — bacalhau cooked a hundred ways, beans simmered with chouriço. Quiet, rooted, generous with seafood and unhurried with stew.",
    ro: "Bucătăria portugheză e cod sărat, ulei de măsline și după-amieze atlantice — bacalhau gătit în o sută de feluri, fasole fiartă încet cu chouriço. Liniștită, înrădăcinată, generoasă cu fructe de mare.",
    es: "La cocina portuguesa es bacalao en sal, aceite de oliva y tardes atlánticas — bacalhau preparado de cien maneras, alubias guisadas a fuego lento con chouriço. Tranquila, arraigada, generosa con el marisco y sin prisa con el guiso.",
  },
  'Croatia': {
    en: "Croatian cooking wanders between coast and inland — grilled ćevapi with raw onion, pašticada braised for hours with prunes and Dalmatian red wine. Olive oil on the sea side, paprika and pork inland.",
    ro: "Bucătăria croată se mișcă între coastă și interior — ćevapi pe grătar cu ceapă crudă, pašticada gătită ore întregi cu prune și vin roșu dalmațian. Ulei de măsline lângă mare, boia și porc în continent.",
    es: "La cocina croata se mueve entre la costa y el interior — ćevapi a la parrilla con cebolla cruda, pašticada estofada durante horas con ciruelas pasas y tinto dálmata. Aceite de oliva junto al mar, pimentón y cerdo tierra adentro.",
  },

  // ── East Asian
  'Japan': {
    en: "Japan eats by precision and quiet contrast — broths simmered for hours, rice rinsed until clean, garnishes placed with intent. Ramen counters, sushi bars and home kitchens all share the same restraint.",
    ro: "Japonia gătește cu precizie și contrast tăcut — supe fierte ore întregi, orez clătit până la transparență, garnituri așezate cu intenție. Tarabele cu ramen, tejghelele de sushi și bucătăriile de acasă împart aceeași disciplină.",
    es: "Japón come con precisión y contraste callado — caldos a fuego lento durante horas, arroz lavado hasta quedar limpio, guarniciones colocadas con intención. Mostradores de ramen, barras de sushi y cocinas de casa comparten la misma contención.",
  },
  'China': {
    en: "Chinese cooking respects the wok and the clock — high heat for a fast stir-fry, slow simmer for a stew, oil bloomed with garlic and Sichuan pepper before anything else hits the pan.",
    ro: "Bucătăria chinezească respectă wok-ul și ceasul — foc mare pentru sotat rapid, fierbere înceată pentru tocănițe, ulei aromat cu usturoi și piper Sichuan înainte de orice altceva.",
    es: "La cocina china respeta el wok y el reloj — fuego vivo para un salteado rápido, cocción lenta para los guisos, aceite perfumado con ajo y pimienta de Sichuan antes de que nada más toque la sartén.",
  },
  'South Korea': {
    en: "Korean cooking turns fermentation into a national pantry — kimchi crocks, doenjang stews, gochujang glazes. Banchan plates surround every meal; rice and shared heat carry the conversation.",
    ro: "Bucătăria coreeană transformă fermentația într-o cămară națională — borcane de kimchi, tocănițe de doenjang, glazuri de gochujang. Farfuriile de banchan înconjoară fiecare masă; orezul și picantul împărtășit duc conversația.",
    es: "La cocina coreana convierte la fermentación en despensa nacional — vasijas de kimchi, guisos de doenjang, glaseados de gochujang. Los platillos de banchan rodean cada comida; el arroz y el picante compartido llevan la conversación.",
  },

  // ── Southeast Asian
  'Vietnam': {
    en: "Vietnam balances four flavors at every table — bright herbs, salty fish sauce, fresh chili, a squeeze of lime. From phở broth at dawn to bánh mì at noon, the cooking stays light and immediate.",
    ro: "Vietnamul echilibrează patru gusturi la fiecare masă — ierburi proaspete, sos de pește sărat, ardei iute, o picătură de lime. De la zeama de phở dimineața la bánh mì la prânz, gătitul rămâne ușor și imediat.",
    es: "Vietnam equilibra cuatro sabores en cada mesa — hierbas frescas, salsa de pescado salada, chile recién picado, un toque de lima. Del caldo de phở al amanecer al bánh mì del mediodía, la cocina se mantiene ligera y directa.",
  },
  'Thailand': {
    en: "Thai cooking chases four flavors at once — hot, sour, sweet, salty. Pad thai negotiates them in a wok; tom yum sharpens them in clear broth; tom kha softens them with coconut milk.",
    ro: "Bucătăria thailandeză urmărește patru gusturi în același timp — iute, acru, dulce, sărat. Pad thai le împacă în wok; tom yum le ascute într-o supă limpede; tom kha le îmblânzește cu lapte de cocos.",
    es: "La cocina tailandesa persigue cuatro sabores a la vez — picante, ácido, dulce, salado. El pad thai los negocia en el wok; el tom yum los afila en caldo claro; el tom kha los suaviza con leche de coco.",
  },
  // REVIEW: "pasta de gambas" is peninsular Spanish; LATAM readers expect "camarones".
  // For a Romania-based site with mostly EU traffic, peninsular reads more natural.
  'Indonesia': {
    en: "Indonesia cooks in layers — coconut milk reducing for hours, sambal pounded fresh, palm sugar caramelizing in the wok. Rice is the steady center; chili, lemongrass and shrimp paste work around it.",
    ro: "Indonezia gătește în straturi — lapte de cocos redus ore întregi, sambal pisat la moment, zahăr de palmier caramelizat în wok. Orezul e centrul stabil; ardeiul, lemongrass-ul și pasta de creveți lucrează în jurul lui.",
    es: "Indonesia cocina por capas — leche de coco reduciéndose durante horas, sambal machacado al momento, azúcar de palma caramelizándose en el wok. El arroz es el centro firme; chile, citronela y pasta de gambas trabajan a su alrededor.",
  },
  'Philippines': {
    en: "Filipino cooking sits where sour meets savory — adobo simmered in vinegar and soy, kare-kare rich with peanut and oxtail. Bagoong on the side, rice always, leftovers always better the next day.",
    ro: "Bucătăria filipineză stă unde acru întâlnește savuros — adobo fiert în oțet și soia, kare-kare bogat cu arahide și coadă de bou. Bagoong alături, orez mereu, resturile sunt mereu mai bune a doua zi.",
    es: "La cocina filipina se asienta donde lo ácido se cruza con lo sabroso — adobo cocido en vinagre y soja, kare-kare denso de cacahuete y rabo de buey. Bagoong al lado, arroz siempre, las sobras siempre mejores al día siguiente.",
  },
  'Malaysia': {
    en: "Malaysian cooking lives at the hawker stall — laksa rich with coconut and shrimp paste, nasi lemak crowned with crisp anchovies. Multiple cultures, one wok station, breakfast served hot at 7 a.m.",
    ro: "Bucătăria malaezienă trăiește la taraba de stradă — laksa cu lapte de cocos și pastă de creveți, nasi lemak încoronat cu anșoa crocant. Mai multe culturi, o singură stație de wok, micul dejun servit fierbinte la 7 dimineața.",
    es: "La cocina malaya vive en los puestos callejeros — laksa cremosa con coco y pasta de gambas, nasi lemak coronado con anchoas crujientes. Varias culturas, un solo wok, desayuno servido caliente a las siete de la mañana.",
  },
  'Cambodia': {
    en: "Cambodian cooking quietly balances sweet, salty, sour and herbaceous — fish amok steamed in banana leaf, fresh chili and lime alongside every plate. Lemongrass, palm sugar and prahok do the heavy lifting.",
    ro: "Bucătăria cambodgiană echilibrează discret dulce, sărat, acru și verde — pește amok aburit în frunză de banan, ardei proaspăt și lime lângă fiecare farfurie. Lemongrass, zahăr de palmier și prahok fac munca de bază.",
    es: "La cocina camboyana equilibra en voz baja lo dulce, lo salado, lo ácido y lo herbal — amok de pescado al vapor en hoja de plátano, chile fresco y lima junto a cada plato. Citronela, azúcar de palma y prahok hacen el trabajo de fondo.",
  },

  // ── South Asian
  'India': {
    en: "India layers spice with intent — whole seeds bloomed in hot ghee, onions cooked until they melt, finishing aromatics dropped in at the very end. Curries, biryanis and street-food classics all follow the rhythm.",
    ro: "India așază condimentele cu intenție — semințe întregi înflorite în ghee fierbinte, ceapă gătită până se topește, arome finale aruncate chiar la sfârșit. Curry-uri, biryani și clasice de stradă urmează același ritm.",
    es: "India apila especias con intención — semillas enteras abiertas en ghee caliente, cebolla cocida hasta deshacerse, aromas finales añadidos justo al apagar el fuego. Curris, biryanis y clásicos de la calle siguen el mismo ritmo.",
  },
  'Pakistan': {
    en: "Pakistani cooking turns spice into long heat — biryani layered with marinated lamb, nihari simmered overnight until the meat surrenders. Bone marrow, naan straight off the tandoor, and bread keep the table close.",
    ro: "Bucătăria pakistaneză transformă condimentele în căldură lungă — biryani în straturi cu miel marinat, nihari fiert peste noapte până carnea cedează. Măduvă de os, naan direct din tandoor, pâinea ține masa aproape.",
    es: "La cocina pakistaní convierte la especia en calor largo — biryani en capas con cordero marinado, nihari cocido toda la noche hasta que la carne se rinde. Tuétano, naan recién salido del tandoor, y pan que mantiene la mesa unida.",
  },

  // ── Middle Eastern
  'Iran': {
    en: "Persian kitchens layer flavor with patience — fesenjān thickened with walnut and pomegranate, ghormeh sabzi green with stewed herbs. Saffron, dried lime and rice tahdig finish the table.",
    ro: "Bucătăriile persane stratifică gustul cu răbdare — fesenjān îngroșat cu nucă și rodie, ghormeh sabzi verde de la ierburi gătite. Șofran, lime uscat și tahdig de orez închid masa.",
    es: "Las cocinas persas estratifican el sabor con paciencia — fesenjān espesado con nuez y granada, ghormeh sabzi verde de hierbas guisadas. Azafrán, lima seca y el tahdig de arroz cierran la mesa.",
  },
  'Israel': {
    en: "Israeli cooking pulls from across the eastern Mediterranean — silky hummus, sabich pita stuffed with eggplant and egg, lemon and parsley constant. Casual abundance, sharp seasoning, breakfast that lasts all day.",
    ro: "Bucătăria israeliană împrumută din toată Mediterana de est — hummus mătăsos, sabich în pita cu vinete și ou, lămâie și pătrunjel mereu. Abundență relaxată, condimente ascuțite, mic dejun care durează toată ziua.",
    es: "La cocina israelí toma del Mediterráneo oriental en su conjunto — hummus sedoso, sabich en pita con berenjena y huevo, limón y perejil siempre presentes. Abundancia relajada, sazón afilada, un desayuno que dura todo el día.",
  },
  'Syria': {
    en: "Syrian tables run on generosity — kibbeh shaped by hand, shakshuka eaten straight from the pan, fatteh built in layers of bread, yogurt and chickpeas. Pomegranate molasses and sumac keep the seasoning sharp.",
    ro: "Mesele siriene merg pe generozitate — kibbeh modelat cu mâna, shakshuka mâncat direct din tigaie, fatteh construit în straturi de pâine, iaurt și năut. Melasa de rodie și sumacul țin condimentarea ascuțită.",
    es: "Las mesas sirias funcionan con generosidad — kibbeh moldeado a mano, shakshuka comida directamente de la sartén, fatteh montado en capas de pan, yogur y garbanzos. Melaza de granada y zumaque mantienen el sazón afilado.",
  },
  'Turkey': {
    en: "Turkish cooking moves between meze, bread oven and copper pot — flaky baklava soaked in syrup, eggs scrambled into pepper-rich menemen. Strong tea is poured at every meal, often before the first plate arrives.",
    ro: "Bucătăria turcească se mișcă între meze, cuptor de pâine și oală de cupru — baklava fragedă în sirop, ouă bătute în menemen plin cu ardei. Ceaiul tare se toarnă la fiecare masă, deseori înainte de prima farfurie.",
    es: "La cocina turca se mueve entre meze, horno de pan y cazuela de cobre — baklava hojaldrada empapada en almíbar, huevos revueltos en menemen cargado de pimiento. El té fuerte se sirve en cada comida, a menudo antes de que llegue el primer plato.",
  },

  // ── North African
  'Morocco': {
    en: "Moroccan kitchens move slowly — clay tagines holding meat with preserved lemon, harira thickening with lentils and tomato, ras el hanout perfumed across every dish. Spice, fruit and time do the cooking together.",
    ro: "Bucătăriile marocane se mișcă încet — tagine din lut cu carne și lămâie murată, harira îngroșată cu linte și roșii, ras el hanout parfumat în fiecare fel. Condimentul, fructele și timpul gătesc împreună.",
    es: "Las cocinas marroquíes van despacio — tagines de barro con carne y limón en conserva, harira espesando con lentejas y tomate, ras el hanout perfumando cada plato. La especia, la fruta y el tiempo cocinan juntos.",
  },
  'Tunisia': {
    en: "Tunisian cooking warms with harissa — brik fried until the egg sets just right, chakchouka bubbling with tomato and pepper. Olive oil and chili are everywhere; the heat is direct and unapologetic.",
    ro: "Bucătăria tunisiană încălzește cu harissa — brik prăjit până oul prinde exact bine, chakchouka clocotind cu roșii și ardei. Uleiul de măsline și ardeiul iute sunt peste tot; căldura e directă, fără scuze.",
    es: "La cocina tunecina calienta con harissa — brik frito hasta que el huevo cuaja en su punto, chakchouka burbujeando con tomate y pimiento. Aceite de oliva y chile por todas partes; el picante es directo y sin disculpas.",
  },

  // ── Latin
  'Mexico': {
    en: "Mexico cooks loud and bright — chiles charred to a smoke, masa warmed on a comal, salsa pounded fresh in the molcajete. From street stands to home tables, the constant is heat balanced by lime and rendered fat.",
    ro: "Mexicul gătește tare și luminos — ardei arși până fac fum, masa încălzit pe comal, salsa pisat proaspăt în molcajete. De la tarabe la mesele de acasă, constanta e căldură echilibrată de lime și grăsime topită.",
    es: "México cocina alto y luminoso — chiles asados hasta humear, masa calentada en el comal, salsa machacada al momento en el molcajete. De los puestos de calle a la mesa de casa, la constante es el picante equilibrado por limón y grasa fundida.",
  },
  'Peru': {
    en: "Peru cooks where ocean meets the Andes — lime-cured ceviche on the coast, potato-rich causa from highland kitchens, lomo saltado borrowing wok craft from Chinese arrivals. Bright acid, bold contrast, working altitude.",
    ro: "Peru gătește unde oceanul întâlnește Anzii — ceviche marinat în lime pe coastă, causa cu cartofi din bucătăriile de altitudine, lomo saltado împrumutând wok-ul de la chinezi. Aciditate luminoasă, contrast curajos.",
    es: "Perú cocina donde el océano se encuentra con los Andes — ceviche curado en limón en la costa, causa cargada de papa desde las cocinas serranas, lomo saltado tomando el wok prestado de los chinos. Acidez brillante, contraste valiente, altitud que trabaja.",
  },
  'Argentina': {
    en: "Argentina cooks for the asado — open fire, beef, salt — but the kitchen runs on hand pies and milanesa pounded thin. Chimichurri sits on every table; the bread is there to mop the plate clean.",
    ro: "Argentina gătește pentru asado — foc deschis, vită, sare — dar bucătăria merge pe plăcinte și milanesa bătute subțire. Chimichurri stă pe fiecare masă; pâinea e acolo pentru a curăța farfuria.",
    es: "Argentina cocina para el asado — fuego abierto, carne, sal — pero la cocina de cada día gira en torno a empanadas y milanesas bien batidas. El chimichurri está en cada mesa; el pan está ahí para rebañar el plato.",
  },
  'Brazil': {
    en: "Brazilian cooking ranges from beach to interior — slow feijoada with black beans and smoked pork, coconut-rich moqueca simmered in clay pots. Citrus, hot pepper and rice anchor every plate.",
    ro: "Bucătăria braziliană se întinde de la plajă la interior — feijoada lentă cu fasole neagră și porc afumat, moqueca cu lapte de cocos fiartă în oale de lut. Citrice, ardei iute și orez ancorează fiecare farfurie.",
    es: "La cocina brasileña va de la playa al interior — feijoada lenta con frijol negro y cerdo ahumado, moqueca cremosa de coco cocida en olla de barro. Cítrico, ají picante y arroz anclan cada plato.",
  },
  'Ecuador': {
    en: "Ecuadorian cooking is shaped by Pacific shore and Andean peaks — bright ceviches scattered with toasted corn, encebollado warm with tuna and yuca. Citrus, plantain and salt, the rhythm of altitude.",
    ro: "Bucătăria ecuadoriană e formată de coasta Pacificului și de Anzi — ceviche-uri luminoase presărate cu porumb prăjit, encebollado cald cu ton și yuca. Citrice, plantan și sare, ritmul altitudinii.",
    es: "La cocina ecuatoriana está marcada por la costa del Pacífico y las cumbres andinas — ceviches brillantes con maíz tostado por encima, encebollado caliente con atún y yuca. Cítrico, plátano y sal, el ritmo de la altura.",
  },
  'Cuba': {
    en: "Cuban cooking moves slowly with garlic, citrus and oregano — ropa vieja shredded and simmered with peppers, picadillo loaded with olives and raisins. Sweet plantains finish the plate; rice keeps the peace.",
    ro: "Bucătăria cubaneză merge încet cu usturoi, citrice și oregano — ropa vieja destrămat și fiert cu ardei, picadillo plin de măsline și stafide. Banane dulci închid farfuria; orezul ține pacea.",
    es: "La cocina cubana avanza despacio con ajo, cítrico y orégano — ropa vieja desmenuzada y guisada con pimientos, picadillo cargado de aceitunas y pasas. El plátano maduro cierra el plato; el arroz mantiene la paz.",
  },

  // ── Eastern European
  'Romania': {
    en: "Romanian cooking comes from cold winters and big tables — sarmale wrapped tight in cabbage leaves, ciorbă tangy with fermented bran. Plenty of dill, sour cream and slow oven hours spent waiting.",
    ro: "Bucătăria românească vine din ierni reci și mese mari — sarmale rulate strâns în foi de varză, ciorbă acrită cu borș. Mărar din belșug, smântână, ore lungi în cuptor și răbdare la masă.",
    es: "La cocina rumana viene de inviernos fríos y mesas grandes — sarmale apretados en hojas de col, ciorbă ácida por el salvado de borș fermentado. Mucho eneldo, nata agria y horas pacientes de horno lento.",
  },
  'Hungary': {
    en: "Hungarian cooking centers on paprika — sweet, smoked, hot — bloomed in lard before anything else. Goulash runs deep and dark, paprikash mellows with sour cream, lángos comes crackling out of the fryer.",
    ro: "Bucătăria maghiară se învârte în jurul boielii — dulce, afumată, iute — înflorită în untură înainte de orice. Gulașul e adânc și închis, paprikash-ul se îmblânzește cu smântână, lángos-ul iese sfârâind din ulei.",
    es: "La cocina húngara gira alrededor del pimentón — dulce, ahumado, picante — abierto en manteca antes que nada más. El gulasch es profundo y oscuro, el paprikash se suaviza con nata agria, el lángos sale crujiente de la freidora.",
  },
  'Poland': {
    en: "Polish kitchens warm against winter — pierogi pinched by hand, mushroom soups deep with dill, sour rye soup at Easter. Comfort food that doesn't apologize for butter or for second helpings.",
    ro: "Bucătăriile poloneze se încălzesc împotriva iernii — pierogi modelați cu mâna, supe de ciuperci cu mărar, supă acră de secară la Paște. Mâncare consistentă care nu se scuză pentru unt sau pentru porția a doua.",
    es: "Las cocinas polacas se calientan contra el invierno — pierogi cerrados a mano, sopas de seta con mucho eneldo, sopa ácida de centeno en Pascua. Comida de consuelo que no pide perdón por la mantequilla ni por repetir plato.",
  },
  'Russia': {
    en: "Russian cooking is winter cooking — borscht deep with beet and meat, kotlety pan-fried golden, solyanka rich with brine. Black bread, sour cream and dill quietly do most of the seasoning.",
    ro: "Bucătăria rusească e bucătărie de iarnă — borș adânc cu sfeclă și carne, kotlety prăjite auriu, solyanka bogat în saramură. Pâine neagră, smântână și mărar fac mare parte din asezonare.",
    es: "La cocina rusa es cocina de invierno — borsch profundo de remolacha y carne, kotlety dorados a la sartén, solyanka cargada de salmuera. Pan negro, nata agria y eneldo hacen, en silencio, casi todo el trabajo del sazón.",
  },
  'Georgia': {
    en: "Georgian cooking opens around the supra — long-table dinners with toasts, walnuts and pomegranate. Khachapuri straight from a clay oven, khinkali pinched into pleated dumplings, herbs everywhere on the plate.",
    ro: "Bucătăria georgiană se deschide în jurul mesei supra — cine lungi cu toasturi, nuci și rodie. Khachapuri direct din cuptor de lut, khinkali strânși în colțunași plisați, ierburi peste tot pe farfurie.",
    es: "La cocina georgiana se abre alrededor de la supra — cenas largas con brindis, nueces y granada. Khachapuri recién salido del horno de barro, khinkali doblados en empanadillas plisadas, hierbas por todo el plato.",
  },

  // ── Nordic
  'Sweden': {
    en: "Sweden cooks for the long winter — salmon cured in dill, meatballs in cream gravy, cinnamon buns warmed with cardamom. Calm flavors, careful seasoning, fika treated as a daily ritual rather than a break.",
    ro: "Suedia gătește pentru iarna lungă — somon marinat cu mărar, chiftele în sos de smântână, chifle cu scorțișoară și cardamom. Arome calme, condimentare atentă, fika tratată ca un ritual zilnic, nu ca o pauză.",
    es: "Suecia cocina para el invierno largo — salmón curado con eneldo, albóndigas en salsa de nata, bollos de canela perfumados con cardamomo. Sabores calmados, sazón cuidadosa, el fika tratado como rito diario más que como pausa.",
  },
  'Finland': {
    en: "Finnish cooking draws flavor from cold landscape — rye-crust Karelian pies, dill-bright salmon soup, dense rye bread on every counter. Quiet meals, careful seasoning, deep respect for the lakes and forests.",
    ro: "Bucătăria finlandeză extrage gust din peisajul rece — plăcinte kareliane cu coajă de secară, supă de somon cu mărar, pâine densă de secară pe orice blat. Mese liniștite, condimentare atentă, respect adânc pentru lacuri și păduri.",
    es: "La cocina finlandesa saca sabor del paisaje frío — empanadillas carelias con corteza de centeno, sopa de salmón brillante de eneldo, pan denso de centeno en cada encimera. Comidas tranquilas, sazón cuidadosa, respeto hondo por lagos y bosques.",
  },

  // ── Sub-Saharan
  'Nigeria': {
    en: "Nigerian cooking is bold and communal — smoky jollof rice debated across the region, egusi soup thickened with melon seed and bitter greens. Palm oil, scotch bonnet, generous portions, no whispering.",
    ro: "Bucătăria nigeriană e curajoasă și comună — jollof rice afumat dezbătut în toată regiunea, supă de egusi îngroșată cu semințe de pepene și verdețuri amare. Ulei de palmier, ardei iute, porții generoase, fără șoaptă.",
    es: "La cocina nigeriana es atrevida y comunitaria — jollof rice ahumado discutido en toda la región, sopa de egusi espesada con semilla de melón y hojas amargas. Aceite de palma, chile scotch bonnet, raciones generosas, nada en voz baja.",
  },

  // ── Anglo
  'USA': {
    en: "American cooking is regional, not national — New England clam chowder, Caribbean-rooted jerk, the cheeseburger from anywhere with a flattop. The thread that runs through everything is comfort done seriously.",
    ro: "Bucătăria americană e regională, nu națională — supă de scoici din New England, jerk din Caraibe, cheeseburger-ul de oriunde există o plită. Firul comun e mâncare de confort luată în serios.",
    es: "La cocina estadounidense es regional, no nacional — clam chowder de Nueva Inglaterra, jerk de raíz caribeña, la cheeseburger de cualquier sitio con una plancha. El hilo que recorre todo es la comida de consuelo, tomada en serio.",
  },
  // REVIEW: "pastel de carne" risks reading as dessert in some LATAM markets;
  // peninsular Spanish accepts it as the Aussie meat-pie analogue.
  'Australia': {
    en: "Australian cooking borrows widely and barbecues constantly — peppery meat pies handed across counters, summer pavlova piled with passionfruit and cream. Coffee culture takes the rest seriously.",
    ro: "Bucătăria australiană împrumută peste tot și face grătar constant — plăcinte cu carne piperate, pavlova de vară cu fructul pasiunii și frișcă. Cultura cafelei tratează restul cu seriozitate.",
    es: "La cocina australiana toma prestado de todas partes y vive de la barbacoa — pasteles de carne bien especiados pasados por encima del mostrador, pavlova de verano coronada con fruta de la pasión y nata. La cultura del café se toma muy en serio.",
  },

  // ── Central European
  'Germany': {
    en: "German cooking is hearty and direct — pork schnitzel pounded thin, currywurst sliced on a paper plate, mustard and bread always close. Beer-hall comfort food, regional pride, no fuss.",
    ro: "Bucătăria germană e consistentă și directă — schnitzel de porc bătut subțire, currywurst feliat pe farfurie de hârtie, muștar și pâine mereu aproape. Mâncare de cârciumă bavareză, mândrie regională, fără agitație.",
    es: "La cocina alemana es contundente y directa — schnitzel de cerdo bien batido, currywurst rebanada sobre plato de papel, mostaza y pan siempre cerca. Comida de cervecería, orgullo regional, sin alardes.",
  },
  'Switzerland': {
    en: "Swiss cooking turns dairy and potato into ritual — rösti crisped golden in a skillet, fondue bubbling at the center of the table. Mountain food, mountain restraint, a long spoon.",
    ro: "Bucătăria elvețiană transformă lactatele și cartofii în ritual — rösti crocant și auriu în tigaie, fondue clocotind în centrul mesei. Mâncare de munte, reținere de munte, o lingură lungă.",
    es: "La cocina suiza convierte el lácteo y la patata en rito — rösti dorado y crujiente en la sartén, fondue burbujeando en el centro de la mesa. Comida de montaña, mesura de montaña, una cuchara larga.",
  },
  'Netherlands': {
    en: "Dutch cooking keeps it practical — mashed-vegetable stamppot, small puffy poffertjes dusted with sugar. Cabbage, sausage, hot mustard, gezellig company at a long pine table.",
    ro: "Bucătăria olandeză rămâne practică — stamppot cu legume pasate, poffertjes mici și pufoși cu zahăr pudră. Varză, cârnați, muștar iute, companie gezellig la o masă lungă de pin.",
    es: "La cocina holandesa se mantiene práctica — stamppot de verdura aplastada, pequeños poffertjes esponjosos espolvoreados con azúcar. Col, salchicha, mostaza fuerte, compañía gezellig en una mesa larga de pino.",
  },
  'Belgium': {
    en: "Belgian cooking is beer and butter — slow stoofvlees stewed in dark ale, moules-frites steamed open at the table. Frites with mayo are not a debate here, and the chocolate counter is taken seriously.",
    ro: "Bucătăria belgiană e bere și unt — stoofvlees fiert încet în bere brună, moules-frites deschise la masă. Cartofii prăjiți cu maioneză nu se dezbat aici, iar ciocolata e luată în serios.",
    es: "La cocina belga es cerveza y mantequilla — stoofvlees guisado despacio en cerveza negra, moules-frites abiertos al vapor en la mesa. Las patatas con mayonesa no se discuten aquí, y el mostrador de chocolate se toma muy en serio.",
  },

  // ── Central Asian
  'Uzbekistan': {
    en: "Uzbek cooking centers on plov — lamb, rice and carrots simmered for hours in a kazan — and manti, hand-pinched dumplings filled with onion and lamb. Bread baked in clay tandyrs, tea poured constantly.",
    ro: "Bucătăria uzbecă se învârte în jurul plov-ului — miel, orez și morcovi fierți ore întregi în kazan — și a manti-ului, colțunași făcuți cu mâna umpluți cu ceapă și miel. Pâine coaptă în tandyr de lut, ceai turnat constant.",
    es: "La cocina uzbeka gira en torno al plov — cordero, arroz y zanahoria cocidos horas en el kazán — y al manti, empanadillas cerradas a mano rellenas de cebolla y cordero. Pan cocido en tandyr de barro, té que no para de servirse.",
  },
};
