with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ID 154 - Egusi soup (Nigeria) - no hi fields yet
# Note: servings/tipType/pairingsType come before origin in this entry

content = content.replace(
    '      ko: "나이지리아"\n    },\n    name: {\n      ro: "Egusi soup"',
    '      ko: "나이지리아",\n      hi: "नाइजीरिया"\n    },\n    name: {\n      ro: "Egusi soup"'
)

content = content.replace(
    '      ko: "에구시 수프"\n    },\n    category: {\n      ro: "Cină",\n      en: "Dinner",\n      es: "Cena",\n      fr: "Dîner",\n      de: "Abendessen",\n      pt: "Jantar",\n      ru: "Ужин",\n      ar: "عشاء",\n      zh: "晚餐",\n      ja: "ディナー",\n      tr: "Akşam yemeği",\n      it: "Cena",\n      ko: "저녁"\n    },\n    ingredients: {',
    '      ko: "에구시 수프",\n      hi: "एगुसी सूप"\n    },\n    category: {\n      ro: "Cină",\n      en: "Dinner",\n      es: "Cena",\n      fr: "Dîner",\n      de: "Abendessen",\n      pt: "Jantar",\n      ru: "Ужин",\n      ar: "عشاء",\n      zh: "晚餐",\n      ja: "ディナー",\n      tr: "Akşam yemeği",\n      it: "Cena",\n      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    ingredients: {'
)

content = content.replace(
    '      ko: ["에구시 씨앗 (멜론 씨앗)", "고기 (소고기 또는 닭고기)", "시금치 또는 호박 잎", "야자 기름", "양파", "고추", "토마토", "소금", "향신료"]\n    },\n    howIsMade: {',
    '      ko: ["에구시 씨앗 (멜론 씨앗)", "고기 (소고기 또는 닭고기)", "시금치 또는 호박 잎", "야자 기름", "양파", "고추", "토마토", "소금", "향신료"],\n      hi: ["एगुसी बीज (खरबूज़े के बीज)", "मांस (बीफ या चिकन)", "पालक या कद्दू के पत्ते", "ताड़ का तेल", "प्याज़", "हरी मिर्च", "टमाटर", "नमक", "मसाले"]\n    },\n    howIsMade: {'
)

content = content.replace(
    '      ko: "에구시 씨앗을 갈아 기름에 볶고, 삶은 고기와 채소를 넣어 걸쭉해질 때까지 끓입니다."\n    },\n    originText: {\n      ro: "Egusi soup este',
    '      ko: "에구시 씨앗을 갈아 기름에 볶고, 삶은 고기와 채소를 넣어 걸쭉해질 때까지 끓입니다.",\n      hi: "एगुसी बीज पीसकर तेल में भूनें, उबला मांस और सब्जियाँ डालें, गाढ़ा होने तक उबालें।"\n    },\n    originText: {\n      ro: "Egusi soup este'
)

old_origin = '''    originText: {
      ro: "Egusi soup este o rețetă tradițională din Nigeria.",
      en: "Egusi soup is a traditional recipe from Nigeria.",
      es: "Sopa de egusi es una receta tradicional de Nigeria.",
      fr: "Soupe d'egusi est une recette traditionnelle de Nigéria.",
      de: "Egusi-Suppe ist ein traditionelles Rezept aus Nigeria.",
      pt: "Sopa de egusi é uma receita tradicional da Nigéria.",
      ru: "Суп эгуси — традиционный рецепт из Нигерии.",
      ar: "حساء إيجوسي هي وصفة تقليدية من نيجيريا.",
      zh: "埃古西汤 是来自尼日利亚的传统食谱。",
      ja: "エグシスープ はナイジェリアの伝統的なレシピです。",
      tr: "Egusi Çorbası Nijerya kökenli geleneksel bir tariftir.",
      it: "Zuppa di egusi è una ricetta tradizionale della Nigeria.",
      ko: "에구시 수프는 나이지리아의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Supa de egusi este mâncarea de suflet a Nigeriei — un sos gros preparat din semințe de dovleac-egusi (rudă cu pepenele amar) prăjite și măcinate, fierte în ulei de palmier roșu cu carne (vită, capră sau pui), frunze de pumpkin sau spanac și ardei iute. Semințele de egusi formează o textură unică: granuloasă la exterior, cremoasă la interior.\\n\\nSupa de egusi nu se mănâncă singură — este întotdeauna însoțită de fufu, eba (gari gelificat) sau orez. Este mâncarea de sărbătoare în sudul Nigeriei, prezentă la nunți, înmormântări și ceremonii. Fiecare regiune are varianta proprie, cu sau fără pește afumat, cu diferite combinații de verdeață.",
      en: "Egusi soup is Nigeria's soul food — a thick sauce made from toasted and ground egusi seeds (a relative of bitter melon), cooked in red palm oil with meat (beef, goat, or chicken), pumpkin leaves or spinach, and chili pepper. The egusi seeds form a unique texture: granular on the outside, creamy on the inside.\\n\\nEgusi soup is never eaten alone — it always accompanies fufu, eba (solidified garri), or rice. It is celebratory food in southern Nigeria, present at weddings, funerals, and ceremonies. Each region has its own variant, with or without smoked fish, with different greens combinations.",
      es: "La sopa de egusi es el comfort food de Nigeria — una salsa espesa hecha de semillas de egusi tostadas y molidas (pariente del melón amargo), cocidas en aceite de palma rojo con carne (res, cabra o pollo), hojas de calabaza o espinaca y chile. Las semillas de egusi forman una textura única: granular por fuera, cremosa por dentro.\\n\\nLa sopa de egusi nunca se come sola — siempre acompaña al fufu, eba (garri solidificado) o arroz. Es comida celebratoria en el sur de Nigeria, presente en bodas, funerales y ceremonias.",
      fr: "La soupe d'egusi est le comfort food du Nigeria — une sauce épaisse à base de graines d'egusi grillées et moulues (un parent du melon amer), cuites dans de l'huile de palme rouge avec de la viande (bœuf, chèvre ou poulet), des feuilles de courge ou des épinards et du piment. Les graines d'egusi créent une texture unique: granuleuse à l'extérieur, crémeuse à l'intérieur.\\n\\nLa soupe d'egusi ne se mange jamais seule — elle accompagne toujours le fufu, l'eba (garri solidifié) ou le riz. C'est un plat de fête dans le sud du Nigeria.",
      de: "Egusi-Suppe ist Nigerias Soulfood — eine dicke Sauce aus gerösteten und gemahlenen Egusi-Samen (ein Verwandter der Bittermelone), in rotem Palmöl mit Fleisch (Rind, Ziege oder Huhn), Kürbisblättern oder Spinat und Chili gegart. Die Egusi-Samen bilden eine einzigartige Textur: körnig außen, cremig innen.\\n\\nEgusi-Suppe wird nie allein gegessen — sie begleitet immer Fufu, Eba (fester Garri) oder Reis. Es ist Feiertagsessen im Süden Nigerias, bei Hochzeiten, Beerdigungen und Zeremonien.",
      pt: "A sopa de egusi é o comfort food da Nigéria — um molho espesso feito de sementes de egusi torradas e moídas (parente do melão amargo), cozidas em óleo de palma vermelho com carne (vaca, cabra ou frango), folhas de abóbora ou espinafre e pimenta. As sementes de egusi formam uma textura única: granular por fora, cremosa por dentro.\\n\\nA sopa de egusi nunca se come sozinha — sempre acompanha fufu, eba (garri solidificado) ou arroz. É comida de celebração no sul da Nigéria.",
      ru: "Суп эгуси — нигерийская еда для души: густой соус из поджаренных и молотых семян эгуси (родственника горького огурца), приготовленных в красном пальмовом масле с мясом (говядиной, козлятиной или курицей), листьями тыквы или шпинатом и чили. Семена эгуси создают уникальную текстуру: зернистую снаружи, кремовую внутри.\\n\\nСуп эгуси никогда не едят отдельно — он всегда сопровождает фуфу, эбу (загустевший гари) или рис. Это праздничная еда на юге Нигерии, неотъемлемая часть свадеб, похорон и церемоний.",
      ar: "حساء الإيجوسي هو طعام الروح في نيجيريا — صوص كثيف مصنوع من بذور الإيجوسي المحمصة والمطحونة (قريبة من القرع المر)، تُطهى في زيت النخيل الأحمر مع اللحم (بقر أو ماعز أو دجاج) وأوراق اليقطين أو السبانخ والفلفل الحار. تشكل بذور الإيجوسي ملمساً فريداً: حبيبي من الخارج وكريمي من الداخل.\\n\\nلا يُؤكل حساء الإيجوسي وحده أبداً — يرافق دائماً الفوفو أو الإيبا أو الأرز. إنه طعام احتفالي في جنوب نيجيريا.",
      zh: "埃古西汤是尼日利亚的灵魂食物——将埃古西种子（苦瓜的亲戚）烤熟磨碎，在红棕榈油中与肉类（牛肉、山羊肉或鸡肉）、南瓜叶或菠菜、辣椒一起烹饪成浓厚酱料。埃古西种子形成独特质感：外部颗粒感，内部奶油状。\\n\\n埃古西汤从不单独食用——总是搭配富富、艾芭（凝固的加里）或米饭。它是尼日利亚南部的节庆食物，出现在婚礼、葬礼和仪式上。",
      ja: "エグシスープはナイジェリアのソウルフードです——トースとして挽いたエグシの種（にがうりの仲間）を赤いパーム油で肉（牛肉、山羊肉、鶏肉）、カボチャの葉またはほうれん草、唐辛子と一緒に調理した濃厚なソースです。エグシの種は独特の食感を作り出します：外側は粒状、内側はクリーミー。\\n\\nエグシスープは単独で食べません——フフ、エバ（固まったガリ）、または米と一緒に提供されます。南ナイジェリアのお祝い料理で、結婚式、葬儀、儀式に登場します。",
      tr: "Egusi çorbası, Nijerya'nın ruh yemeğidir — kavrulmuş ve öğütülmüş egusi tohumlarından (acı kavunun bir akrabası) yapılmış yoğun bir sos, kırmızı palmiye yağında et (dana eti, keçi veya tavuk), kabak yaprakları veya ıspanak ve acı biberle pişirilir. Egusi tohumları benzersiz bir doku oluşturur: dışarıdan taneli, içeriden kremsi.\\n\\nEgusi çorbası asla tek başına yenmez — her zaman fufu, eba (katılaşmış garri) veya pirinçle birlikte servis edilir. Güney Nijerya'da düğün, cenaze ve törenlerde hazır bulunan kutlama yemeğidir.",
      it: "La zuppa di egusi è il comfort food della Nigeria — una salsa densa a base di semi di egusi tostati e macinati (parente del melone amaro), cotti nell'olio di palma rosso con carne (manzo, capra o pollo), foglie di zucca o spinaci e peperoncino. I semi di egusi creano una texture unica: granulosa fuori, cremosa dentro.\\n\\nLa zuppa di egusi non si mangia mai da sola — accompagna sempre fufu, eba (garri solidificato) o riso. È cibo da festa nel sud della Nigeria.",
      ko: "에구시 수프는 나이지리아의 소울푸드입니다. 볶아서 간 에구시 씨앗(쓴 멜론의 친척)을 붉은 팜유에 고기(소고기, 염소고기, 닭고기), 호박 잎이나 시금치, 고추와 함께 끓여 만든 진한 소스입니다. 에구시 씨앗은 독특한 질감을 만들어냅니다: 겉은 알갱이가 있고 안은 크림 같습니다.\\n\\n에구시 수프는 절대 혼자 먹지 않습니다. 항상 푸푸, 에바(굳힌 가리), 또는 밥과 함께 제공됩니다. 나이지리아 남부의 축제 음식으로 결혼식, 장례식, 의식에 빠지지 않습니다.",
      hi: "एगुसी सूप नाइजीरिया का सोल फूड है — भुने और पिसे एगुसी बीज (करेले के रिश्तेदार) से बना गाढ़ा सॉस, जिसे लाल ताड़ के तेल में मांस (बीफ, बकरी या चिकन), कद्दू के पत्तों या पालक और हरी मिर्च के साथ पकाया जाता है। एगुसी बीज एक अनोखी बनावट बनाते हैं: बाहर से दानेदार, अंदर से मलाईदार।\\n\\nएगुसी सूप कभी अकेला नहीं खाया जाता — यह हमेशा फुफु, एबा (जमी गारी) या चावल के साथ परोसा जाता है। दक्षिणी नाइजीरिया में यह उत्सव का भोजन है, शादियों, अंतिम संस्कारों और समारोहों में उपस्थित।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 154 done")
