with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# === ID 182: Shoyu Ramen (Japan) — hi fields + originText ===

# origin hi — inline block, unique anchor via name "Ramen Shoyu"
content = content.replace(
    'tr: "Japonya", it: "Giappone", ko: "일본"\n    },\n    name: {\n      ro: "Ramen Shoyu"',
    'tr: "Japonya", it: "Giappone", ko: "일본",\n      hi: "जापान"\n    },\n    name: {\n      ro: "Ramen Shoyu"'
)

# name hi
content = content.replace(
    '      ko: "쇼유 라멘"\n    },\n    category: {',
    '      ko: "쇼유 라멘",\n      hi: "शोयू रामेन"\n    },\n    category: {'
)

# category hi — anchor: ko "점심" + ingredients ro starting with "1,5 L supă de oase de pui"
content = content.replace(
    '      ko: "점심"\n    },\n    ingredients: {\n      ro: ["1,5 L supă de oase de pui"',
    '      ko: "점심",\n      hi: "दोपहर का खाना"\n    },\n    ingredients: {\n      ro: ["1,5 L supă de oase de pui"'
)

# ingredients hi — append after ko array (unique: "닭 뼈 육수 1.5L")
content = content.replace(
    '      ko: ["닭 뼈 육수 1.5L", "간장 2큰술", "미린 1큰술", "사케 1큰술", "삼겹살 400g, 말아서 실로 묶기", "달걀 4개 (대란)", "생 라멘 면 300g", "죽순(멘마) 100g, 씻어서 준비", "노리(김) 4장", "파 3대, 얇게 썰기", "나루토마키 어묵 4조각", "참기름 1작은술"]',
    '      ko: ["닭 뼈 육수 1.5L", "간장 2큰술", "미린 1큰술", "사케 1큰술", "삼겹살 400g, 말아서 실로 묶기", "달걀 4개 (대란)", "생 라멘 면 300g", "죽순(멘마) 100g, 씻어서 준비", "노리(김) 4장", "파 3대, 얇게 썰기", "나루토마키 어묵 4조각", "참기름 1작은술"],\n      hi: ["1.5 लीटर चिकन हड्डी का स्टॉक", "2 बड़े चम्मच सोया सॉस", "1 बड़ा चम्मच मिरिन", "1 बड़ा चम्मच सेक", "400 ग्राम सूअर की पेट की परत, रोल करके रसोई की डोरी से बंधी", "4 बड़े अंडे", "300 ग्राम ताज़ा रामेन नूडल्स", "100 ग्राम बांस की कोंपलें (मेन्मा), धोई हुई", "4 नोरी की पत्तियां", "3 हरे प्याज़, बारीक कटे", "4 नारूटोमाकी मछली केक की स्लाइस", "1 छोटी चम्मच तिल का तेल"]'
)

# howIsMade hi — append after ko entry (unique long ko text)
content = content.replace(
    '      ko: "닭 뼈 육수를 생강 한 조각(5cm), 마늘 3쪽, 파 2대와 함께 3–4시간 끓인 후 체에 거릅니다. 간장, 미린, 사케를 작은 냄비에 넣어 5분 끓여 알코올을 날립니다——이것이 쇼유 타레입니다. 삼겹살을 단단히 말아 실로 묶고, 전면을 센 불에 구워 색을 냅니다. 간장 3큰술, 미린 2큰술, 사케 1큰술, 물 100ml를 넣고 약불에서 1.5시간 조립니다. 15분 휴지 후 1cm 두께로 썹니다. 달걀을 정확히 6분 30초 삶아 찬물에 식힌 뒤 껍데기를 벗기고 남은 차슈 조림 국물에 최소 4시간 재워 둡니다. 면을 봉투 지시대로 삶아 물기를 뺍니다. 뜨거운 국물을 그릇에 담고(그릇당 타레 2큰술), 면을 올린 뒤 차슈, 반숙란, 죽순, 노리, 파, 나루토마키를 올리고 참기름을 살짝 뿌립니다."',
    '      ko: "닭 뼈 육수를 생강 한 조각(5cm), 마늘 3쪽, 파 2대와 함께 3–4시간 끓인 후 체에 거릅니다. 간장, 미린, 사케를 작은 냄비에 넣어 5분 끓여 알코올을 날립니다——이것이 쇼유 타레입니다. 삼겹살을 단단히 말아 실로 묶고, 전면을 센 불에 구워 색을 냅니다. 간장 3큰술, 미린 2큰술, 사케 1큰술, 물 100ml를 넣고 약불에서 1.5시간 조립니다. 15분 휴지 후 1cm 두께로 썹니다. 달걀을 정확히 6분 30초 삶아 찬물에 식힌 뒤 껍데기를 벗기고 남은 차슈 조림 국물에 최소 4시간 재워 둡니다. 면을 봉투 지시대로 삶아 물기를 뺍니다. 뜨거운 국물을 그릇에 담고(그릇당 타레 2큰술), 면을 올린 뒤 차슈, 반숙란, 죽순, 노리, 파, 나루토마키를 올리고 참기름을 살짝 뿌립니다.",\n      hi: "चिकन हड्डी के स्टॉक को 5 सेमी अदरक, 3 लहसुन की कलियां और 2 हरे प्याज़ के साथ 3–4 घंटे उबालें, छानें। सोया सॉस, मिरिन और सेक को एक छोटे बर्तन में मिलाएं, 5 मिनट उबालें ताकि अल्कोहल उड़ जाए — यह शोयू तारे है। सूअर की पेट की परत को कसकर रोल करें, डोरी से बांधें, सूखे पैन में सभी तरफ से भूनें, फिर 3 बड़े चम्मच सोया, 2 मिरिन, 1 सेक और 100 मिली पानी में धीमी आंच पर 1.5 घंटे पकाएं; 15 मिनट आराम दें, 1 सेमी मोटी स्लाइस काटें। अंडों को ठीक 6.5 मिनट उबालें, ठंडे पानी में ठंडा करें, छीलें और चाशू के बचे शोरबे में कम से कम 4 घंटे भिगोएं। नूडल्स पकाएं, छानें। हर कटोरे में शोयू तारे 2 बड़े चम्मच डालें, गर्म शोरबा डालें, फिर चाशू, आधा अंडा, बांस की कोंपलें, नोरी, हरा प्याज़, नारूटोमाकी लगाएं और तिल का तेल छिड़कें।"'
)

# originText full replacement
old_182 = '''    originText: {
      ro: "Ramen Shoyu este o rețetă tradițională din Japonia.",
      en: "Shoyu Ramen is a traditional recipe from Japan.",
      es: "Ramen Shoyu es una receta tradicional de Japón.",
      fr: "Ramen Shoyu est une recette traditionnelle du Japon.",
      de: "Shoyu Ramen ist ein traditionelles Rezept aus Japan.",
      pt: "Ramen Shoyu é uma receita tradicional do Japão.",
      ru: "Сёю Рамен — традиционный рецепт из Японии.",
      ar: "رامن شويو وصفة تقليدية من اليابان.",
      zh: "酱油拉面是来自日本的传统食谱。",
      ja: "醤油ラーメンは日本の伝統的なレシピです。",
      tr: "Shoyu Ramen, Japonya kökenli geleneksel bir tariftir.",
      it: "Ramen Shoyu è una ricetta tradizionale del Giappone.",
      ko: "쇼유 라멘은 일본의 전통 요리입니다."
    }'''

new_182 = '''    originText: {
      ro: "Ramen shoyu este stilul Tokyoului și cel mai vechi dintre familiile principale de ramen — bolul care a stabilit tiparul când primele standuri cu tăiței chinezești s-au deschis în capitală la începutul secolului XX. Bulionul este chihlimbar limpede: un fond de pui sau dashi asezonat cu un tare pe bază de sos de soia, destul de ușor pentru ca fiecare ingredient să-și arate profilul.\\n\\nNarutomaki — prăjitura din pește cu spirală — este atât garnitură cât și marcă temporală, neschimbată față de primele standuri din Shinjuku. Tăițeii ondulați aduc supă în fiecare buclă. Câteva picături de ulei de susan se adaugă în ultimul moment, nu în fierbere; ele rămân la suprafață ca un strat aromatic, nu dispar în fond.",
      en: "Shoyu ramen is Tokyo's style and the oldest of the major ramen families — the bowl that set the template when Chinese noodle stalls opened in the capital in the early twentieth century. The broth is clear amber: chicken or dashi stock seasoned with a blended soy tare, light enough to let individual ingredients register on the palate.\\n\\nNarutomaki — the spiral fish cake — is both garnish and timestamp, unchanged since the first Shinjuku stalls. The curly noodles carry broth into every fold. A drizzle of sesame oil goes in at the final moment, not simmered into the pot; it sits on the surface as a scent layer rather than disappearing into the stock.",
      es: "El ramen shoyu es el estilo de Tokio y el más antiguo de las grandes familias del ramen — el bol que fijó el molde cuando los puestos de fideos chinos abrieron en la capital a principios del siglo XX. El caldo es ámbar claro: fondo de pollo o dashi sazonado con un tare de soja mezclado, suficientemente ligero para que cada ingrediente se perciba en el paladar.\\n\\nEl narutomaki — el pastel de pescado en espiral — es tanto guarnición como marca temporal, sin cambios desde los primeros puestos de Shinjuku. Los fideos rizados llevan caldo a cada curva. El aceite de sésamo se añade al último instante, no durante la cocción; reposa en la superficie como una capa de aroma.",
      fr: "Le ramen shoyu est le style de Tokyo et le plus ancien des grandes familles de ramen — le bol qui a établi le modèle lorsque les stands de nouilles chinoises ont ouvert dans la capitale au début du XXe siècle. Le bouillon est ambré et limpide: fond de poulet ou de dashi assaisonné d'un tare à la sauce soja, assez léger pour que chaque ingrédient se distingue au palais.\\n\\nLe narutomaki — le gâteau de poisson en spirale — est à la fois garniture et repère temporel, inchangé depuis les premiers stands de Shinjuku. Les nouilles frisées portent le bouillon dans chaque boucle. Quelques gouttes d'huile de sésame sont ajoutées à la dernière seconde, pas dans la cuisson; elles restent en surface comme une couche de parfum.",
      de: "Shoyu Ramen ist Tokios Stil und die älteste der großen Ramen-Familien — die Schüssel, die die Vorlage setzte, als chinesische Nudelstände zu Beginn des zwanzigsten Jahrhunderts in der Hauptstadt öffneten. Die Brühe ist klares Bernstein: Hühner- oder Dashi-Fond gewürzt mit einem gemischten Sojasoße-Tare, leicht genug, damit jeder Zutat am Gaumen zur Geltung kommt.\\n\\nNarutomaki — der Spiralen-Fischkuchen — ist sowohl Garnitur als auch Zeitmarke, unverändert seit den ersten Ständen in Shinjuku. Die lockigen Nudeln tragen Brühe in jede Locke. Sesamöl kommt im allerletzten Moment dazu, nicht ins Kochen; es sitzt an der Oberfläche als Duftschicht und verschwindet nicht im Fond.",
      pt: "O ramen shoyu é o estilo de Tóquio e o mais antigo das grandes famílias de ramen — a tigela que estabeleceu o padrão quando as bancas de macarrão chinesas abriram na capital no início do século XX. O caldo é âmbar claro: fundo de frango ou dashi temperado com um tare à base de soja, leve o suficiente para que cada ingrediente se registre no paladar.\\n\\nO narutomaki — o bolo de peixe em espiral — é ao mesmo tempo guarnição e marca temporal, inalterado desde as primeiras bancas de Shinjuku. Os noodles encaracolados carregam o caldo em cada curva. O óleo de gergelim é adicionado no último instante, não durante o cozimento; fica na superfície como uma camada aromática.",
      ru: "Сёю рамен — стиль Токио и старейший из главных семейств рамена — та самая миска, которая задала стандарт, когда в начале двадцатого века в столице открылись китайские лапшичные лавки. Бульон прозрачный янтарный: куриный или даси-фонд, приправленный смешанным соевым тарэ, достаточно лёгкий, чтобы каждый ингредиент ощущался отдельно.\\n\\nНарутомаки — рыбный кекс со спиралью — одновременно гарнир и временна́я метка, неизменный со времён первых прилавков Синдзюку. Вьющаяся лапша несёт бульон в каждый изгиб. Кунжутное масло добавляется в самый последний момент, а не в процессе варки; оно остаётся на поверхности в виде ароматного слоя.",
      ar: "رامن الشويو هو أسلوب طوكيو وأقدم عائلات الرامن الكبرى — الوعاء الذي وضع النموذج عندما فتحت أكشاك النودلز الصينية في العاصمة مطلع القرن العشرين. المرق كهرماني صافٍ: مرق دجاج أو داشي متبّل بتاري الصويا، خفيف بما يكفي ليُبرز كل مكوّن على الحنك.\\n\\nالناروتوماكي — كعكة السمك اللولبية — زينة وعلامة زمنية في آنٍ واحد، لم تتغير منذ أول أكشاك شينجوكو. النودلز المجعّدة تحمل المرق في كل ثنية. يُضاف زيت السمسم في اللحظة الأخيرة لا في أثناء الطهي؛ يجلس على السطح كطبقة عطر لا يذوب في المرق.",
      zh: "酱油拉面是东京的风格，也是主要拉面流派中历史最悠久的——二十世纪初中国面食摊在东京开张时，它奠定了这道料理的基本格局。汤底是清澈的琥珀色：以酱油底汤调味的鸡骨或鲣鱼高汤，足够清淡，让每种食材都能在口腔中留下各自的印记。\\n\\n鸣门卷——螺旋纹鱼糕——既是配料又是历史坐标，自新宿最早的面摊起从未改变过。波浪形面条将汤汁带入每一个弯折。芝麻油在最后一刻加入，不是熬进锅里的；它停留在汤面上，形成一层香气，而不是消融进高汤中。",
      ja: "醤油ラーメンは東京のスタイルであり、ラーメンの主要な流派の中で最も古い——二十世紀初頭に中国式麺スタンドが首都に登場したとき、このスタイルがひとつの原型を作った。スープは澄んだ琥珀色。鶏がらやだしをベースに合わせ醤油ダレで味付けし、素材それぞれが舌に届くほど軽やかに仕上げる。\\n\\nなると——渦巻き模様の蒲鉾——は新宿最初の屋台から変わらぬ飾りであり時代の証人でもある。ちぢれ麺はすべての折り目にスープを含む。ごま油は煮込まずに最後の一瞬に垂らす。スープに溶け込まず、表面に香りの膜として浮かぶのが正解だ。",
      tr: "Shoyu ramen, Tokyo'nun tarzı ve başlıca ramen ailelerinin en eskisidir — yirminci yüzyılın başında başkentte Çin erişte tezgahları açıldığında şablonu belirleyen kastir. Çorba berrak kehribar renktedir: tavuk veya dashi suyu, karışık bir soya tare'si ile tatlandırılmış, her malzemenin damakta ayrı ayrı hissedilmesine yetecek kadar hafif.\\n\\nNarutomaki — spiral balık pastası — hem garnitür hem de zaman damgasıdır; Shinjuku'nun ilk tezgahlarından bu yana değişmemiştir. Kıvırcık erişte her kıvrımında et suyu taşır. Susam yağı en son anda eklenir, pişme sürecinde değil; yüzeyde koku katmanı olarak durur, içine karışmaz.",
      it: "Il ramen shoyu è lo stile di Tokyo e il più antico delle grandi famiglie di ramen — la ciotola che ha stabilito il modello quando le bancarelle di noodle cinesi aprirono nella capitale all'inizio del Novecento. Il brodo è ambra limpida: fondo di pollo o dashi condito con un tare di soia miscelato, abbastanza leggero da far emergere ogni ingrediente al palato.\\n\\nIl narutomaki — il dolce di pesce a spirale — è sia guarnizione che riferimento temporale, invariato dai primi banconi di Shinjuku. I noodle ricci portano brodo in ogni curva. L'olio di sesamo viene aggiunto nell'ultimo istante, non durante la cottura; rimane in superficie come strato di profumo anziché dissolversi nel brodo.",
      ko: "쇼유 라멘은 도쿄 스타일이자 주요 라멘 가족 중 가장 오래된 것입니다 — 20세기 초 수도에 중국 면 가게가 문을 열었을 때 틀을 세운 그릇입니다. 육수는 맑은 호박색으로, 닭뼈 또는 다시 육수에 혼합 쇼유 타레로 간을 맞춘 것으로, 각 재료가 입맛에 각각 느껴질 만큼 가볍습니다.\\n\\n나루토마키 — 소용돌이 무늬 어묵 — 는 신주쿠 첫 번째 가게에서부터 변하지 않은 가니시이자 시간의 흔적입니다. 곱슬 면은 모든 굴곡에 국물을 담습니다. 참기름은 끓이는 것이 아니라 마지막 순간에 넣습니다; 국물에 녹아들지 않고 향 층으로 표면에 머뭅니다.",
      hi: "शोयू रामेन टोक्यो की शैली है और प्रमुख रामेन परिवारों में सबसे पुरानी है — वह कटोरा जिसने बीसवीं सदी की शुरुआत में राजधानी में चीनी नूडल स्टॉल खुलने पर एक खाका तैयार किया। शोरबा साफ़ एम्बर रंग का है: चिकन या दाशी स्टॉक में सोया तारे मिलाकर बनाया, इतना हल्का कि हर सामग्री तालु पर अपनी छाप छोड़े।\\n\\nनारूटोमाकी — सर्पिल मछली केक — शिंजुकु के पहले स्टॉल से अपरिवर्तित, गार्निश और समय-चिह्न दोनों है। घुंघराले नूडल्स हर मोड़ में शोरबा लेकर चलते हैं। तिल का तेल आखिरी पल में डाला जाता है, पकाने के दौरान नहीं; यह सतह पर एक सुगंध की परत के रूप में रहता है।"
    }'''

content = content.replace(old_182, new_182)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 182 done")
