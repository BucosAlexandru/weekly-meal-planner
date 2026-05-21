with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ── ID 160 – Japanese Curry Rice (Japan) ──────────────────────────────────────
content = content.replace(
    '      ko: "일본"\n    },\n    name: {\n      ro: "Curry japonez"',
    '      ko: "일본",\n      hi: "जापान"\n    },\n    name: {\n      ro: "Curry japonez"'
)
content = content.replace(
    '      ko: "일본 카레라이스"\n    },\n    category: {',
    '      ko: "일본 카레라이스",\n      hi: "जापानी करी चावल"\n    },\n    category: {'
)
content = content.replace(
    '      ko: "저녁"\n    },\n    servings: 4,\n    tipType: \'def\',\n    pairingsType: \'japanese\'',
    '      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    servings: 4,\n    tipType: \'def\',\n    pairingsType: \'japanese\''
)
content = content.replace(
    '      ko: ["단립 백미 2컵 (건조)", "뼈 없는 닭 다리살 400g (또는 소 어깨살), 3cm 큐브로 썬 것", "큰 양파 2개, 중간 크기로 다진 것", "중간 크기 감자 2개, 3cm 큐브", "중간 크기 당근 2개, 1.5cm 두께 슬라이스", "식용유 1큰술", "물 800ml", "일본 카레 루 블록 1팩 (예: S&B 골든 카레 중간 매운맛, 약 100g)", "우스터 소스 1작은술", "케첩 1작은술 (선택, 깊은 맛을 위해)", "소금·후추 취향껏"]\n    },\n    howIsMade: {',
    '      ko: ["단립 백미 2컵 (건조)", "뼈 없는 닭 다리살 400g (또는 소 어깨살), 3cm 큐브로 썬 것", "큰 양파 2개, 중간 크기로 다진 것", "중간 크기 감자 2개, 3cm 큐브", "중간 크기 당근 2개, 1.5cm 두께 슬라이스", "식용유 1큰술", "물 800ml", "일본 카레 루 블록 1팩 (예: S&B 골든 카레 중간 매운맛, 약 100g)", "우스터 소스 1작은술", "케첩 1작은술 (선택, 깊은 맛을 위해)", "소금·후추 취향껏"],\n      hi: ["छोटे दाने के चावल 2 कप (कच्चे)", "हड्डी रहित चिकन थाई 400ग्रा (या बीफ), 3 सेमी टुकड़े", "बड़े प्याज़ 2, मध्यम कटे", "मध्यम आलू 2, 3 सेमी टुकड़े", "मध्यम गाजर 2, 1.5 सेमी स्लाइस", "वनस्पति तेल 1 बड़ा चम्मच", "पानी 800 मिली", "जापानी करी रूक्स ब्लॉक 1 पैक (जैसे S&B गोल्डन करी)", "वॉर्सेस्टरशायर सॉस 1 छोटा चम्मच", "केचप 1 छोटा चम्मच (वैकल्पिक)", "नमक और काली मिर्च स्वादानुसार"]\n    },\n    howIsMade: {'
)
content = content.replace(
    '      ko: "쌀을 2½컵 물에 넣고 끓으면 뚜껑을 닫아 가장 약한 불로 13분 익힌 뒤, 불 끄고 10분 뜸들입니다. 큰 냄비에 기름을 두르고 중불로 달굽니다. 양파를 넣고 자주 저으며 15–20분간 황금빛이 될 때까지 볶습니다 — 이 단계는 반드시 해야 합니다; 캐러멜라이즈된 양파가 카레 맛의 뼈대입니다. 닭고기를 넣고 소금·후추로 간해 모든 면이 갈색이 되도록 3–4분 굽습니다. 당근과 감자를 넣고 1분 볶습니다. 물 800ml를 붓고 끓인 뒤, 뚜껑 없이 약불로 15분간 감자가 거의 익을 때까지 끓입니다. 불을 끕니다. 카레 루를 작게 부숴 넣고 완전히 녹을 때까지 젓습니다 — 불에서 떨어져 녹여야 뭉침을 방지합니다. 다시 약불로 10분간 자주 저으며 소스가 걸쭉하고 윤기 있게 될 때까지 끓입니다. 우스터 소스와 케첩을 넣고 간을 맞춥니다. 뜨거운 밥 위에 담아냅니다."\n    },\n    originText: {\n      ro: "Curry japonez este',
    '      ko: "쌀을 2½컵 물에 넣고 끓으면 뚜껑을 닫아 가장 약한 불로 13분 익힌 뒤, 불 끄고 10분 뜸들입니다. 큰 냄비에 기름을 두르고 중불로 달굽니다. 양파를 넣고 자주 저으며 15–20분간 황금빛이 될 때까지 볶습니다 — 이 단계는 반드시 해야 합니다; 캐러멜라이즈된 양파가 카레 맛의 뼈대입니다. 닭고기를 넣고 소금·후추로 간해 모든 면이 갈색이 되도록 3–4분 굽습니다. 당근과 감자를 넣고 1분 볶습니다. 물 800ml를 붓고 끓인 뒤, 뚜껑 없이 약불로 15분간 감자가 거의 익을 때까지 끓입니다. 불을 끕니다. 카레 루를 작게 부숴 넣고 완전히 녹을 때까지 젓습니다 — 불에서 떨어져 녹여야 뭉침을 방지합니다. 다시 약불로 10분간 자주 저으며 소스가 걸쭉하고 윤기 있게 될 때까지 끓입니다. 우스터 소스와 케첩을 넣고 간을 맞춥니다. 뜨거운 밥 위에 담아냅니다.",\n      hi: "चावल 2½ कप पानी में पकाएं। बड़े बर्तन में तेल गर्म करें, प्याज़ 15–20 मिनट भूनें। चिकन डालें, ब्राउन करें। गाजर और आलू डालें। 800ml पानी डालें, 15 मिनट उबालें। आँच से हटाएं, करी रूक्स घोलें। धीमी आँच पर 10 मिनट गाढ़ा होने तक पकाएं। गर्म चावल पर परोसें।"\n    },\n    originText: {\n      ro: "Curry japonez este'
)
old_160 = '''    originText: {
      ro: "Curry japonez este o rețetă tradițională din Japonia.",
      en: "Japanese Curry Rice is a traditional recipe from Japan.",
      es: "Curry japonés es una receta tradicional de Japón.",
      fr: "Curry japonais est une recette traditionnelle du Japon.",
      de: "Japanisches Curry ist ein traditionelles Rezept aus Japan.",
      pt: "Caril japonês é uma receita tradicional do Japão.",
      ru: "Японское карри — традиционный рецепт из Японии.",
      ar: "كاري ياباني هي وصفة تقليدية من اليابان.",
      zh: "日式咖喱饭 是来自日本的传统食谱。",
      ja: "カレーライス は日本の伝統的なレシピです。",
      tr: "Japon körili pilavı Japonya kökenli geleneksel bir tariftir.",
      it: "Il curry giapponese con riso è una ricetta tradizionale del Giappone.",
      ko: "일본 카레라이스는 일본의 전통 요리입니다."
    }'''
new_160 = '''    originText: {
      ro: "Curry-ul japonez (kare raisu) a ajuns în Japonia în era Meiji prin intermediul marinarilor britanici și al rețetelor coloniale indo-britanice. Adaptat imediat gustului japonez, a câștigat o textură mai densă, un gust mai dulce și mai puțin picant. Blocurile de roux ambalate (lansate în anii '60) au democratizat prepararea: oricine le poate face acasă în 40 de minute.\\n\\nCarry japonez este azi unul dintre cele mai consumate feluri de mâncare din Japonia — studii arată că japonezii îl mănâncă de 70-80 ori pe an. Se servește cu katsu (șnițel), orez, murături de ridiche (fukujinzuke). Fiecare familie are preferința pentru o marcă de roux.",
      en: "Japanese curry (kare raisu) arrived in Japan during the Meiji era through British sailors and Indo-British colonial recipes. Quickly adapted to Japanese taste, it became denser, sweeter, and less spicy. Pre-packaged roux blocks (introduced in the 1960s) democratized preparation: anyone can make it at home in 40 minutes.\\n\\nJapanese curry is today one of the most consumed dishes in Japan — surveys show Japanese eat it 70-80 times a year. Served with katsu (breaded cutlet), rice, pickled radish (fukujinzuke). Each family has a preferred roux brand.",
      es: "El curry japonés (kare raisu) llegó a Japón durante la era Meiji a través de marineros británicos y recetas coloniales indo-británicas. Rápidamente adaptado al gusto japonés, se volvió más espeso, dulce y menos picante. Los bloques de roux envasados (lanzados en los años 60) democratizaron su preparación: cualquiera puede hacerlo en casa en 40 minutos.\\n\\nEl curry japonés es hoy uno de los platos más consumidos en Japón. Se sirve con katsu (filete empanado), arroz y rábano encurtido.",
      fr: "Le curry japonais (kare raisu) est arrivé au Japon à l'ère Meiji par l'intermédiaire de marins britanniques et de recettes coloniales indo-britanniques. Rapidement adapté au goût japonais, il est devenu plus épais, plus doux et moins piquant. Les blocs de roux en sachets (commercialisés dans les années 1960) ont démocratisé sa préparation.\\n\\nLe curry japonais est aujourd'hui l'un des plats les plus consommés au Japon. Il se sert avec du katsu, du riz et des radis marinés.",
      de: "Japanisches Curry (Kare Raisu) kam in der Meiji-Ära durch britische Seeleute und indisch-britische Kolonialrezepte nach Japan. Schnell dem japanischen Geschmack angepasst, wurde es dichter, süßer und weniger scharf. Vorgefertigte Roux-Blöcke (eingeführt in den 1960ern) demokratisierten die Zubereitung.\\n\\nJapanisches Curry ist heute eines der am meisten gegessenen Gerichte Japans. Es wird mit Katsu, Reis und eingelegtem Rettich serviert.",
      pt: "O caril japonês (kare raisu) chegou ao Japão durante a era Meiji através de marinheiros britânicos e receitas coloniais indo-britânicas. Rapidamente adaptado ao gosto japonês, tornou-se mais espesso, mais doce e menos picante. Blocos de roux embalados (lançados nos anos 60) democratizaram a preparação.\\n\\nO caril japonês é hoje um dos pratos mais consumidos no Japão. Serve-se com katsu, arroz e rabanetes em conserva.",
      ru: "Японское карри (карэ райсу) попало в Японию в эпоху Мэйдзи через британских моряков и индийско-британские колониальные рецепты. Быстро адаптированное к японскому вкусу, оно стало гуще, слаще и менее острым. Готовые блоки ру (появившиеся в 1960-х) демократизировали приготовление.\\n\\nЯпонское карри — одно из наиболее потребляемых блюд в Японии: по опросам, японцы едят его 70–80 раз в год. Подаётся с катсу, рисом и маринованной редькой.",
      ar: "وصل الكاري الياباني (كاري رايسو) إلى اليابان في عصر ميجي عبر البحارة البريطانيين والوصفات الاستعمارية الهندية البريطانية. تكيّف سريعاً مع الذوق الياباني ليصبح أكثف وأحلى وأقل حدة. أتاحت مكعبات الروكس المعبأة (أُطلقت في الستينيات) تحضيره لأي شخص في المنزل خلال 40 دقيقة.\\n\\nالكاري الياباني اليوم من أكثر الأطباق استهلاكاً في اليابان. يُقدَّم مع الكاتسو والأرز والفجل المخلل.",
      zh: "日式咖喱（咖喱饭）在明治时代通过英国水兵和英属印度殖民地食谱传入日本。迅速适应日本口味，变得更浓稠、更甜、辣度更低。袋装咖喱块（1960年代推出）使家庭制作普及化：任何人都能在40分钟内做好。\\n\\n日式咖喱饭如今是日本最受欢迎的食物之一——调查显示日本人每年吃70-80次。搭配炸猪排、米饭和腌萝卜（福神渍）食用。",
      ja: "カレーライスは明治時代にイギリスの水兵や英領インドの料理を通じて日本に伝わりました。すぐに日本人の好みに合わせて改良され、より濃厚で甘く、辛みが抑えられました。1960年代に発売されたルウブロックにより、家庭での調理が40分で誰でもできるようになりました。\\n\\nカレーライスは今や日本で最も多く食べられる料理のひとつで、調査によると日本人は年に70〜80回食べるとされています。カツ、ご飯、福神漬けと一緒に提供されます。",
      tr: "Japon köri (kare raisu), Meiji döneminde İngiliz denizcileri ve Hint-İngiliz sömürge tarifleri aracılığıyla Japonya'ya ulaştı. Hızla Japon damak zevkine uyarlanarak daha yoğun, tatlı ve az acı hale geldi. 1960'larda piyasaya çıkan hazır roux blokları evde pişirmeyi demokratikleştirdi.\\n\\nJapon körisi bugün Japonya'nın en çok tüketilen yemeklerinden biridir. Katsu, pirinç ve turşu ile servis edilir.",
      it: "Il curry giapponese (kare raisu) arrivò in Giappone durante l'era Meiji attraverso marinai britannici e ricette coloniali indo-britanniche. Rapidamente adattato al gusto giapponese, divenne più denso, più dolce e meno piccante. I blocchi di roux confezionati (commercializzati negli anni '60) democratizzarono la preparazione.\\n\\nIl curry giapponese è oggi uno dei piatti più consumati in Giappone. Si serve con katsu, riso e ravanelli in conserva.",
      ko: "일본 카레라이스(카레 라이스)는 메이지 시대에 영국 선원과 영국령 인도의 식민지 요리를 통해 일본에 전래되었습니다. 일본인의 입맛에 맞게 빠르게 변형되어 더 걸쭉하고 달콤하며 덜 맵게 되었습니다. 1960년대에 등장한 루 블록은 누구나 40분 만에 집에서 만들 수 있게 했습니다.\\n\\n카레라이스는 오늘날 일본에서 가장 많이 먹는 음식 중 하나로, 조사에 따르면 일본인은 연간 70-80번 먹습니다. 돈카츠, 밥, 절인 무(후쿠진즈케)와 함께 제공됩니다.",
      hi: "जापानी करी (करे रायसु) मेइजी युग में ब्रिटिश नाविकों और भारत-ब्रिटिश औपनिवेशिक व्यंजनों के माध्यम से जापान पहुँची। जल्दी ही जापानी स्वाद के अनुसार अनुकूलित होकर यह अधिक गाढ़ी, मीठी और कम तीखी बन गई। 1960 के दशक में आए पैक्ड रूक्स ब्लॉक ने इसे घर पर बनाना आसान कर दिया।\\n\\nजापानी करी आज जापान में सबसे अधिक खाए जाने वाले व्यंजनों में से एक है — सर्वेक्षण बताते हैं कि जापानी इसे साल में 70-80 बार खाते हैं। कात्सु, चावल और अचारी मूली (फुकुजिनज़ुके) के साथ परोसी जाती है।"
    }'''
content = content.replace(old_160, new_160)

# ── ID 161 – Fasolada (Greece) ────────────────────────────────────────────────
content = content.replace(
    '      ko: "그리스"\n    },\n    name: {\n      ro: "Fasolada"',
    '      ko: "그리스",\n      hi: "यूनान"\n    },\n    name: {\n      ro: "Fasolada"'
)
content = content.replace(
    '      ko: "파솔라다"\n    },\n    category: {',
    '      ko: "파솔라다",\n      hi: "फासोलाडा"\n    },\n    category: {'
)
content = content.replace(
    '      ko: "점심"\n    },\n    ingredients: {\n      ro: ["fasole albă"',
    '      ko: "점심",\n      hi: "दोपहर का खाना"\n    },\n    ingredients: {\n      ro: ["fasole albă"'
)
content = content.replace(
    '      ko: ["흰 콩", "당근", "셀러리", "양파", "토마토", "올리브오일", "소금", "후추"]\n    },\n    howIsMade: {',
    '      ko: ["흰 콩", "당근", "셀러리", "양파", "토마토", "올리브오일", "소금", "후추"],\n      hi: ["सफेद बीन्स", "गाजर", "अजवाइन", "प्याज़", "टमाटर", "जैतून का तेल", "नमक", "काली मिर्च"]\n    },\n    howIsMade: {'
)
content = content.replace(
    '      ko: "콩을 삶고 채소를 넣어 모두 부드러워질 때까지 익힙니다. 올리브 오일로 간을 맞추고 따뜻하게 냅니다."\n    },\n    originText: {\n      ro: "Fasolada este',
    '      ko: "콩을 삶고 채소를 넣어 모두 부드러워질 때까지 익힙니다. 올리브 오일로 간을 맞추고 따뜻하게 냅니다.",\n      hi: "बीन्स उबालें, कटी सब्जियाँ डालें और नरम होने तक पकाएं। जैतून के तेल से सीज़न करें और गर्म परोसें।"\n    },\n    originText: {\n      ro: "Fasolada este'
)
old_161 = '''    originText: {
      ro: "Fasolada este o rețetă tradițională din Grecia.",
      en: "Fasolada is a traditional recipe from Greece.",
      es: "Fasolada es una receta tradicional de Grecia.",
      fr: "Fasolada est une recette traditionnelle de Grèce.",
      de: "Fasolada ist ein traditionelles Rezept aus Griechenland.",
      pt: "Fasolada é uma receita tradicional da Grécia.",
      ru: "Фасолада — традиционный рецепт из Греции.",
      ar: "فاسولادا هي وصفة تقليدية من اليونان.",
      zh: "希腊炖豆汤 是来自希腊的传统食谱。",
      ja: "ファソラーダ はギリシャの伝統的なレシピです。",
      tr: "Fasolada Yunanistan kökenli geleneksel bir tariftir.",
      it: "Fasolada è una ricetta tradizionale della Grecia.",
      ko: "파솔라다는 그리스의 전통 요리입니다."
    }'''
new_161 = '''    originText: {
      ro: "Fasolada este supa națională a Greciei — o ciorbă simplă și hrănitoare de fasole albă cu morcovi, țelină, ceapă, roșii și ulei de măsline generos, care defineşte bucătăria mediteraneană frugală. Este mâncarea de post a Greciei ortodoxe — servită în Postul Mare și în perioadele de abstinenţă, dar consumată cu plăcere şi în restul anului.\\n\\nFasolada nu are niciun secret culinar: fasolea bine gătită şi uleiul de măsline de calitate sunt tot ce contează. Grecii o mănâncă cu pâine ţărănească şi măsline. Se spune că a hrănit Grecia în timpuri grele și este văzută ca mâncarea identitară națională — un simbol al simplităţii şi sănătăţii.",
      en: "Fasolada is Greece's national soup — a simple, nourishing white bean soup with carrots, celery, onion, tomatoes, and generous olive oil, defining frugal Mediterranean cooking. It is Greece's Orthodox fasting food — served during Lent and abstinence periods, but eaten with pleasure throughout the year.\\n\\nFasolada holds no culinary secrets: well-cooked beans and quality olive oil are all that matter. Greeks eat it with country bread and olives. It is said to have fed Greece through hard times and is seen as the national identity food — a symbol of simplicity and health.",
      es: "La fasolada es la sopa nacional de Grecia — una sencilla y nutritiva sopa de alubias blancas con zanahoria, apio, cebolla, tomates y generoso aceite de oliva, que define la cocina mediterránea frugal. Es la comida de ayuno de la Grecia ortodoxa, servida durante la Cuaresma.\\n\\nLa fasolada no tiene secretos culinarios: alubias bien cocidas y aceite de oliva de calidad son todo lo que importa. Los griegos la comen con pan rústico y aceitunas. Se dice que ha alimentado a Grecia en tiempos difíciles.",
      fr: "La fasolada est la soupe nationale de la Grèce — une soupe simple et nourrissante de haricots blancs avec carottes, céleri, oignon, tomates et huile d'olive généreuse. C'est la nourriture du jeûne orthodoxe grec, servie pendant le Carême.\\n\\nLa fasolada n'a pas de secrets culinaires : haricots bien cuits et huile d'olive de qualité suffisent. Les Grecs la mangent avec du pain campagnard et des olives.",
      de: "Fasolada ist Griechenlands Nationalsuppe — eine einfache, nahrhafte weiße Bohnensuppe mit Karotten, Sellerie, Zwiebeln, Tomaten und reichlich Olivenöl. Es ist Griechenlands orthodoxes Fastengericht, serviert in der Fastenzeit.\\n\\nFasolada hat keine Kochgeheimnisse: gut gekochte Bohnen und Qualitätsolivenöl sind alles, worauf es ankommt. Griechen essen sie mit Landbrot und Oliven.",
      pt: "A fasolada é a sopa nacional da Grécia — uma sopa simples e nutritiva de feijão branco com cenouras, aipo, cebola, tomates e generoso azeite. É a comida de jejum da Grécia ortodoxa, servida durante a Quaresma.\\n\\nA fasolada não tem segredos culinários: feijão bem cozido e azeite de qualidade são tudo o que importa. Os gregos comem-na com pão rústico e azeitonas.",
      ru: "Фасолада — национальный суп Греции: простой, сытный суп из белой фасоли с морковью, сельдереем, луком, томатами и щедрым оливковым маслом. Это постная еда православной Греции, которую подают в Великий пост, но с удовольствием едят круглый год.\\n\\nФасолада не имеет кулинарных секретов: хорошо сваренная фасоль и качественное оливковое масло — вот и всё. Греки едят её с деревенским хлебом и оливками.",
      ar: "الفاسولادا هي الشوربة الوطنية لليونان — حساء بسيط مغذٍ من الفاصوليا البيضاء مع الجزر والكرفس والبصل والطماطم وزيت الزيتون السخي. هي طعام الصيام الأرثوذكسي اليوناني، تُقدَّم في الصوم الكبير.\\n\\nللفاسولادا لا أسرار طهوية: الفاصوليا المطبوخة جيداً وزيت الزيتون الجيد هما كل ما يهم. يأكلها اليونانيون مع الخبز الريفي والزيتون.",
      zh: "法索拉达是希腊的国汤——用白豆、胡萝卜、芹菜、洋葱、番茄和大量橄榄油煮成的简单营养汤，代表着地中海的朴素饮食文化。这是希腊东正教的斋戒食物，在大斋期供应，但全年都受欢迎。\\n\\n法索拉达没有什么烹饪秘诀：煮好的豆子和优质橄榄油就是一切。希腊人配乡村面包和橄榄食用。",
      ja: "ファソラーダはギリシャの国民的スープです——白いんげん豆、にんじん、セロリ、玉ねぎ、トマト、たっぷりのオリーブオイルで作るシンプルで栄養豊富なスープで、地中海の質素な料理を体現しています。ギリシャ正教の断食食として大斎期に提供されますが、一年中喜んで食べられます。\\n\\nファソラーダに調理上の秘訣はありません：よく煮た豆と良質なオリーブオイルがすべてです。ギリシャ人は田舎パンとオリーブと一緒に食べます。",
      tr: "Fasolada, Yunanistan'ın ulusal çorbasıdır — havuç, kereviz, soğan, domates ve bol zeytinyağıyla yapılan sade, besleyici beyaz fasulye çorbası; Akdeniz mutfağının kanaatkarlığını temsil eder. Büyük Oruç'ta servis edilen Yunan Ortodoks oruç yemeğidir.\\n\\nFasolada'nın mutfak sırrı yoktur: iyi pişmiş fasulye ve kaliteli zeytinyağı yeterlidir. Yunanlılar onu köy ekmeği ve zeytinle yer.",
      it: "La fasolada è la zuppa nazionale della Grecia — una minestra semplice e nutriente di fagioli bianchi con carote, sedano, cipolla, pomodori e olio d'oliva abbondante. È il cibo del digiuno ortodosso greco, servita durante la Quaresima.\\n\\nLa fasolada non ha segreti culinari: fagioli ben cotti e olio d'oliva di qualità sono tutto ciò che conta. I greci la mangiano con pane di campagna e olive.",
      ko: "파솔라다는 그리스의 국민 수프입니다. 흰 콩, 당근, 셀러리, 양파, 토마토, 그리고 올리브 오일을 듬뿍 넣어 만드는 소박하고 영양 많은 수프로, 지중해 검소한 요리를 대표합니다. 그리스 정교회의 금식 음식으로 사순절에 제공되지만 일 년 내내 즐겨 먹습니다.\\n\\n파솔라다에는 특별한 요리 비결이 없습니다. 잘 삶은 콩과 질 좋은 올리브 오일이 전부입니다. 그리스인들은 시골 빵과 올리브와 함께 먹습니다.",
      hi: "फासोलाडा यूनान का राष्ट्रीय सूप है — सफेद बीन्स, गाजर, अजवाइन, प्याज़, टमाटर और उदार जैतून के तेल से बना एक सरल, पोषक सूप जो भूमध्यसागरीय सादे खाने को परिभाषित करता है। यह ग्रीक ऑर्थोडॉक्स का व्रत भोजन है — महा उपवास में परोसा जाता है, लेकिन साल भर खुशी से खाया जाता है।\\n\\nफासोलाडा में कोई रहस्य नहीं: अच्छी तरह पकी बीन्स और गुणवत्तापूर्ण जैतून का तेल ही सब कुछ है। यूनानी इसे देहाती रोटी और जैतून के साथ खाते हैं।"
    }'''
content = content.replace(old_161, new_161)

# ── ID 162 – Tlayudas (Mexico) ────────────────────────────────────────────────
content = content.replace(
    '      ko: "멕시코"\n    },\n    name: {\n      ro: "Tlayudas"',
    '      ko: "멕시코",\n      hi: "मेक्सिको"\n    },\n    name: {\n      ro: "Tlayudas"'
)
content = content.replace(
    '      ko: "틀라유다스"\n    },\n    category: {',
    '      ko: "틀라유다스",\n      hi: "त्लायुदास"\n    },\n    category: {'
)
content = content.replace(
    '      ko: "저녁"\n    },\n    ingredients: {\n      ro: ["tortilla mare"',
    '      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    ingredients: {\n      ro: ["tortilla mare"'
)
content = content.replace(
    '      ko: ["큰 토르티야", "볶은 콩", "와하카 치즈", "고기 (보통 소고기, 닭고기, 또는 초리소)", "상추", "아보카도", "토마토", "양파", "살사"]\n    },\n    howIsMade: {',
    '      ko: ["큰 토르티야", "볶은 콩", "와하카 치즈", "고기 (보통 소고기, 닭고기, 또는 초리소)", "상추", "아보카도", "토마토", "양파", "살사"],\n      hi: ["बड़ा टॉर्टिला", "रिफ्राइड बीन्स", "ओआहाका चीज़", "मांस (आमतौर पर बीफ, चिकन, या चोरिज़ो)", "सलाद पत्ता", "एवोकाडो", "टमाटर", "प्याज़", "साल्सा"]\n    },\n    howIsMade: {'
)
content = content.replace(
    '      ko: "토르티야에 콩을 펴 바르고 고기, 치즈, 채소를 올려 바삭해질 때까지 굽습니다."\n    },\n    originText: {\n      ro: "Tlayudas este',
    '      ko: "토르티야에 콩을 펴 바르고 고기, 치즈, 채소를 올려 바삭해질 때까지 굽습니다.",\n      hi: "टॉर्टिला पर बीन्स फैलाएं, मांस, चीज़ और सब्जियाँ डालें। कुरकुरा होने तक बेक करें।"\n    },\n    originText: {\n      ro: "Tlayudas este'
)
old_162 = '''    originText: {
      ro: "Tlayudas este o rețetă tradițională din Mexic.",
      en: "Tlayudas is a traditional recipe from Mexico.",
      es: "Tlayudas es una receta tradicional de México.",
      fr: "Tlayudas est une recette traditionnelle du Mexique.",
      de: "Tlayudas ist ein traditionelles Rezept aus Mexiko.",
      pt: "Tlayudas é uma receita tradicional do México.",
      ru: "Тлайудас — традиционный рецепт из Мексики.",
      ar: "تلايوداس هي وصفة تقليدية من المكسيك.",
      zh: "墨西哥大玉米饼 是来自墨西哥的传统食谱。",
      ja: "トラユーダス はメキシコの伝統的なレシピです。",
      tr: "Tlayudas Meksika kökenli geleneksel bir tariftir.",
      it: "Tlayudas è una ricetta tradizionale del Messico.",
      ko: "틀라유다스는 멕시코의 전통 요리입니다."
    }'''
new_162 = '''    originText: {
      ro: "Tlayudas sunt pizza Oaxaca-ei — o tortilla mare (30 cm) din porumb, semiuscată și crocantă, unsă cu frijoles negros (fasole neagră prăjită), acoperită cu brânză Oaxaca rasă, carne (tasajo — vită uscată, chorizo sau carne de porc) și garnituri proaspete. Oaxaca este statul din sudul Mexicului cu cea mai bogată tradiție culinară indigenă.\\n\\nTlayuda se coace direct pe jăratic sau pe o plancha (tablă), iar brânza se topește acoperind carnea. Se mănâncă pliată sau desfăcută, cu mâna. Textura este distinctă: baza crocantă și unsuroasă contrastează cu garniturile proaspete. La Oaxaca, tlayudas se vând toată noaptea pe piețele de stradă, unde aburul lor parfumează aerul nopții.",
      en: "Tlayudas are Oaxaca's pizza — a large (30 cm) semi-dried, crunchy corn tortilla smeared with frijoles negros (refried black beans), covered with shredded Oaxaca cheese, meat (tasajo — dried beef, chorizo, or pork), and fresh toppings. Oaxaca is the southern Mexican state with the richest indigenous culinary tradition.\\n\\nThe tlayuda is baked directly on embers or a plancha (iron plate), and the cheese melts over the meat. It is eaten folded or open, by hand. The texture is distinctive: the crispy, fatty base contrasts with fresh toppings. In Oaxaca, tlayudas are sold all night at street markets, their steam perfuming the night air.",
      es: "Las tlayudas son la pizza de Oaxaca — una tortilla grande (30 cm) semiseca y crujiente de maíz untada con frijoles negros refritos, cubierta con queso Oaxaca rallado, carne (tasajo — res seca, chorizo o cerdo) y guarniciones frescas. Oaxaca es el estado del sur de México con la más rica tradición culinaria indígena.\\n\\nLa tlayuda se asa directamente sobre brasas o plancha. Se come doblada o abierta, con la mano. En Oaxaca se venden toda la noche en los mercados callejeros.",
      fr: "Les tlayudas sont la pizza d'Oaxaca — une grande tortilla (30 cm) semi-sèche et croustillante de maïs enduite de frijoles negros (haricots noirs frits), couverte de fromage Oaxaca râpé, de viande (tasajo — bœuf séché, chorizo ou porc) et de garnitures fraîches. Oaxaca est l'état du sud du Mexique avec la tradition culinaire indigène la plus riche.\\n\\nLa tlayuda cuit directement sur la braise ou une plancha. On la mange pliée ou ouverte, à la main.",
      de: "Tlayudas sind Oaxacas Pizza — eine große (30 cm), halb getrocknete, knusprige Maistortilla bestrichen mit Frijoles Negros (gebratene schwarze Bohnen), belegt mit geriebenem Oaxaca-Käse, Fleisch (Tasajo — getrocknetes Rindfleisch, Chorizo oder Schwein) und frischen Toppings. Oaxaca ist der südmexikanische Bundesstaat mit der reichsten indigenen Kochtradition.\\n\\nDie Tlayuda wird direkt auf Glut oder einer Plancha gebacken und mit der Hand gefaltet oder offen gegessen.",
      pt: "Tlayudas são a pizza de Oaxaca — uma grande tortilha (30 cm) semisseca e crocante de milho untada com frijoles negros (feijão preto refrito), coberta com queijo Oaxaca ralado, carne (tasajo — carne de vaca seca, chorizo ou porco) e coberturas frescas. Oaxaca é o estado do sul do México com a mais rica tradição culinária indígena.\\n\\nA tlayuda é assada diretamente em brasas ou numa plancha. Come-se dobrada ou aberta, com a mão.",
      ru: "Тлайудас — это пицца Оахаки: большая (30 см), полусухая, хрустящая кукурузная тортилья, смазанная жареной чёрной фасолью (фрихолес негрос), покрытая тёртым сыром Оахака, мясом (тасахо — вяленая говядина, чоризо или свинина) и свежими добавками. Оахака — южный мексиканский штат с богатейшей коренной кулинарной традицией.\\n\\nТлайуду запекают прямо на углях или на планче. Едят сложенной или развёрнутой, руками.",
      ar: "التلايوداس هي بيتزا أواهاكا — تورتيلا كبيرة (30 سم) نصف جافة ومقرمشة من الذرة، مدهونة بالفريجوليس نيغروس (الفول الأسود المقلي)، ومغطاة بجبن أواهاكا المبشور واللحم (تاساخو — لحم بقري مجفف أو تشوريزو أو لحم خنزير) وإضافات طازجة. أواهاكا هي الولاية الجنوبية في المكسيك ذات أغنى تقليد طهوي أصلي.\\n\\nتُشوى التلايودا مباشرة على الجمر أو البلانتشا. تُؤكل مطوية أو مفتوحة باليد.",
      zh: "特拉尤达斯是瓦哈卡的披萨——一张大（30厘米）半干酥脆的玉米饼，涂上炒黑豆（弗里霍莱斯内格罗斯），铺上刨碎的瓦哈卡奶酪、肉类（塔萨霍——风干牛肉、辣香肠或猪肉）和新鲜配料。瓦哈卡是墨西哥南部原住民烹饪传统最丰富的州。\\n\\n特拉尤达斯直接在炭火或铁板上烤制。对折或展开用手拿着吃。",
      ja: "トラユーダスはオアハカのピザです——大きな（30cm）半乾燥でカリカリのトウモロコシのトルティーヤにフリホーレス・ネグロス（炒めた黒いんげん豆）を塗り、オアハカチーズの細切り、肉（タサホ——干し牛肉、チョリソ、または豚肉）と新鮮なトッピングを乗せます。オアハカは最も豊かな先住民の料理伝統を持つメキシコ南部の州です。\\n\\nトラユーダは直接炭またはプランチャ（鉄板）で焼き、手で折って食べるか開いたまま食べます。",
      tr: "Tlayudas, Oaxaca'nın pizzasıdır — büyük (30 cm) yarı kurumuş, çıtır bir mısır tortillası frijoles negros (kızartılmış siyah fasulye) ile sürülür, rendelenmiş Oaxaca peyniri, et (tasajo — kurutulmuş sığır eti, chorizo veya domuz eti) ve taze malzemelerle kaplanır. Oaxaca, en zengin yerli mutfak geleneğine sahip güney Meksika eyaletidir.\\n\\nTlayuda doğrudan közler veya planca üzerinde pişirilir. Katlanmış veya açık, elle yenir.",
      it: "Le tlayudas sono la pizza di Oaxaca — una grande tortilla (30 cm) semi-secca e croccante di mais spalmata con frijoles negros (fagioli neri rifritti), coperta con formaggio Oaxaca grattugiato, carne (tasajo — carne bovina essiccata, chorizo o maiale) e guarnizioni fresche. Oaxaca è lo stato del Messico meridionale con la tradizione culinaria indigena più ricca.\\n\\nLa tlayuda cuoce direttamente sulla brace o su una plancha. Si mangia piegata o aperta, con le mani.",
      ko: "틀라유다스는 오아하카의 피자입니다. 크고(30cm) 반건조된 바삭한 옥수수 토르티야에 프리홀레스 네그로스(볶은 검은 콩)를 바르고 오아하카 치즈를 얹어 고기(타사호—말린 소고기, 초리소, 돼지고기)와 신선한 토핑을 올립니다. 오아하카는 멕시코 남부에서 토착 요리 전통이 가장 풍부한 주입니다.\\n\\n틀라유다는 직접 숯불이나 플란차에서 구워집니다. 접거나 펼쳐서 손으로 먹습니다.",
      hi: "त्लायुदास ओआहाका का पिज़्ज़ा है — एक बड़ा (30 सेमी) अर्ध-सूखा, कुरकुरा मकई का टॉर्टिला जिस पर फ्रिहोलेस नेग्रोस (पकाई काली फलियाँ) लगाई जाती हैं, ऊपर कसा ओआहाका चीज़, मांस (तासाहो—सूखा बीफ, चोरिज़ो या पोर्क) और ताज़े टॉपिंग डाले जाते हैं। ओआहाका मेक्सिको का दक्षिणी राज्य है जिसमें सबसे समृद्ध स्वदेशी पाक परंपरा है।\\n\\nत्लायुदा सीधे अंगारों या लोहे की प्लेट पर सेकी जाती है। मुड़ी या खुली, हाथ से खाई जाती है।"
    }'''
content = content.replace(old_162, new_162)

# ── ID 163 – Bandeja Paisa (Colombia) ─────────────────────────────────────────
content = content.replace(
    '      ko: "콜롬비아"\n    },\n    name: {\n      ro: "Bandeja Paisa"',
    '      ko: "콜롬비아",\n      hi: "कोलम्बिया"\n    },\n    name: {\n      ro: "Bandeja Paisa"'
)
content = content.replace(
    '      ko: "반데하 파이사"\n    },\n    category: {',
    '      ko: "반데하 파이사",\n      hi: "बान्देहा पायसा"\n    },\n    category: {'
)
content = content.replace(
    '      ko: "점심"\n    },\n    ingredients: {\n      ro: ["orez", "fasole", "carne de vită"',
    '      ko: "점심",\n      hi: "दोपहर का खाना"\n    },\n    ingredients: {\n      ro: ["orez", "fasole", "carne de vită"'
)
content = content.replace(
    '      ko: ["쌀", "콩", "소고기", "계란", "플랜틴", "아보카도", "돼지고기", "초리소", "아레파"]\n    },\n    howIsMade: {',
    '      ko: ["쌀", "콩", "소고기", "계란", "플랜틴", "아보카도", "돼지고기", "초리소", "아레파"],\n      hi: ["चावल", "फलियाँ", "बीफ", "अंडा", "कच्चा केला", "एवोकाडो", "पोर्क", "चोरिज़ो", "अरेपा"]\n    },\n    howIsMade: {'
)
content = content.replace(
    '      ko: "고기, 콩, 쌀을 각각 따로 익힙니다. 튀긴 플랜틴, 계란, 아보카도, 초리소, 아레파와 함께 큰 접시에 담아냅니다."\n    },\n    originText: {\n      ro: "Bandeja Paisa este',
    '      ko: "고기, 콩, 쌀을 각각 따로 익힙니다. 튀긴 플랜틴, 계란, 아보카도, 초리소, 아레파와 함께 큰 접시에 담아냅니다.",\n      hi: "मांस, फलियाँ और चावल अलग-अलग पकाएं। तले कच्चे केले, अंडे, एवोकाडो, चोरिज़ो और अरेपा के साथ एक बड़ी प्लेट में परोसें।"\n    },\n    originText: {\n      ro: "Bandeja Paisa este'
)
old_163 = '''    originText: {
      ro: "Bandeja Paisa este o rețetă tradițională din Columbia.",
      en: "Bandeja Paisa is a traditional recipe from Colombia.",
      es: "Bandeja Paisa es una receta tradicional de Colombia.",
      fr: "Bandeja Paisa est une recette traditionnelle de Colombie.",
      de: "Bandeja Paisa ist ein traditionelles Rezept aus Kolumbien.",
      pt: "Bandeja Paisa é uma receita tradicional da Colômbia.",
      ru: "Бандеха пайса — традиционный рецепт из Колумбии.",
      ar: "بانديخا بايسا هي وصفة تقليدية من كولومبيا.",
      zh: "哥伦比亚拼盘饭 是来自哥伦比亚的传统食谱。",
      ja: "バンデハ・パイサ はコロンビアの伝統的なレシピです。",
      tr: "Bandeja Paisa Kolombiya kökenli geleneksel bir tariftir.",
      it: "Bandeja Paisa è una ricetta tradizionale della Colombia.",
      ko: "반데하 파이사는 콜롬비아의 전통 요리입니다."
    }'''
new_163 = '''    originText: {
      ro: "Bandeja paisa este farfuria națională a Columbiei și cel mai copios fel de mâncare din America Latină — un platou uriaș cu 9-11 componente: frijoles (fasole roșie), orez alb, carne molida (carne tocată), chicharrón (coajă de porc prăjită), chorizo, morcilla (cârnat de sânge), ou ochi, arepa (tortilla de porumb), banană plantain prăjită, avocado și pâine. Totul se servește pe o singură farfurie.\\n\\nProvine din regiunea Antioquia (munții Anzilor), unde muncitorii de la ferme aveau nevoie de energie pentru o zi întreagă de efort fizic. Restaurantele din Medellín au popularizat-o ca simbol culinar al identității antiochene. Astăzi, bandeja paisa este servită ca o provocare: cine termină tot primește o banană extra.",
      en: "Bandeja paisa is Colombia's national dish and Latin America's most generous plate — a massive platter with 9-11 components: frijoles (red beans), white rice, carne molida (ground beef), chicharrón (fried pork rind), chorizo, morcilla (blood sausage), fried egg, arepa (corn tortilla), fried plantain, avocado, and bread. Everything is served on one single plate.\\n\\nIt originates from the Antioquia region (Andes mountains), where farm workers needed energy for a full day of physical labor. Restaurants in Medellín popularized it as a culinary symbol of Antiochean identity. Today, bandeja paisa is served as a challenge: whoever finishes it all gets a bonus banana.",
      es: "La bandeja paisa es el plato nacional de Colombia y el más generoso de América Latina — una enorme fuente con 9-11 componentes: frijoles, arroz blanco, carne molida, chicharrón, chorizo, morcilla, huevo frito, arepa, plátano maduro frito, aguacate y pan. Todo se sirve en un solo plato.\\n\\nProviene de la región de Antioquia (Andes), donde los trabajadores del campo necesitaban energía para todo el día. Los restaurantes de Medellín la popularizaron como símbolo de la identidad antioqueña.",
      fr: "La bandeja paisa est le plat national de la Colombie et le plus généreux d'Amérique latine — un plateau massif de 9-11 composants : frijoles (haricots rouges), riz blanc, carne molida (viande hachée), chicharrón (couenne de porc frite), chorizo, morcilla (boudin noir), œuf sur le plat, arepa, banane plantain frite, avocat et pain. Tout sur une seule assiette.\\n\\nOriginaire de la région d'Antioquia (Andes), où les travailleurs agricoles avaient besoin d'énergie pour toute une journée de travail.",
      de: "Bandeja Paisa ist Kolumbiens Nationalgericht und der großzügigste Teller Lateinamerikas — eine riesige Platte mit 9-11 Komponenten: Frijoles (rote Bohnen), weißer Reis, Carne Molida (Hackfleisch), Chicharrón (Schweinshaut), Chorizo, Morcilla (Blutwurst), Spiegelei, Arepa, gebratene Kochbanane, Avocado und Brot. Alles auf einem einzigen Teller.\\n\\nEs stammt aus der Antioquia-Region (Anden), wo Landarbeiter Energie für einen ganzen Arbeitstag brauchten.",
      pt: "Bandeja paisa é o prato nacional da Colômbia e o mais generoso da América Latina — uma travessa enorme com 9-11 componentes: frijoles (feijão vermelho), arroz branco, carne moída, chicharrón (torresmo), chorizo, morcilla (morcela), ovo frito, arepa, banana-da-terra frita, abacate e pão. Tudo numa única travessa.\\n\\nOrigina-se da região de Antioquia (Andes), onde os trabalhadores rurais precisavam de energia para um dia inteiro de trabalho físico.",
      ru: "Бандеха пайса — национальное блюдо Колумбии и самое щедрое блюдо Латинской Америки: огромная тарелка из 9-11 компонентов: фрихолес (красная фасоль), белый рис, карне молида (фарш), чичаррон (жареная свиная корка), чоризо, морсилья (кровяная колбаса), яичница, арепа, жареный плантан, авокадо и хлеб. Всё — на одной тарелке.\\n\\nРодина блюда — регион Антьокия (Анды), где фермерским рабочим нужна была энергия на целый день физического труда.",
      ar: "بانديخا بايسا هو الطبق الوطني لكولومبيا والأكثر سخاءً في أمريكا اللاتينية — طبق ضخم بـ9-11 مكوناً: فريخوليس (فاصوليا حمراء) وأرز أبيض ولحم مفروم وشيتشارون (جلد خنزير مقلي) وتشوريزو ومورسيلا (نقانق دم) وبيضة مقلية وأريبا وموز بلانتاين مقلي وأفوكادو وخبز. كل شيء في طبق واحد.\\n\\nيأتي من منطقة أنتيوكيا (جبال الأنديز)، حيث احتاج عمال المزارع إلى طاقة ليوم عمل بدني كامل.",
      zh: "班德哈帕伊萨是哥伦比亚的国家菜肴，也是拉丁美洲最丰盛的一盘菜——一个巨大的拼盘，包含9-11种食材：弗里霍莱斯（红豆）、白米饭、碎牛肉、猪皮酥（奇查龙）、辣香肠、血肠、煎蛋、阿雷帕玉米饼、炸大蕉、牛油果和面包。所有食材一盘盛出。\\n\\n它起源于安第斯山区的安蒂奥基亚地区，那里的农场工人需要充足的能量支撑一整天的体力劳动。",
      ja: "バンデハ・パイサはコロンビアの国民食であり、ラテンアメリカで最も豪快な一皿です——フリホーレス（赤いんげん豆）、白ご飯、カルネ・モリダ（挽き肉）、チチャロン（揚げた豚の皮）、チョリソ、モルシーラ（ブラッドソーセージ）、目玉焼き、アレパ、揚げたプランテン、アボカド、パンの9-11種類が一枚の皿に盛られます。\\n\\nアンデス山脈のアンティオキア地方が起源で、農場労働者が一日中の肉体労働に必要なエネルギーを得るために食べていました。",
      tr: "Bandeja paisa, Kolombiya'nın ulusal yemeği ve Latin Amerika'nın en cömert tabağıdır — frijoles (kırmızı fasulye), beyaz pirinç, kıyma, chicharrón (kızarmış domuz derisi), chorizo, morcilla (kan sosisi), sahanda yumurta, arepa, kızarmış muz, avokado ve ekmekten oluşan 9-11 bileşenli dev bir tabak. Her şey tek tabakta servis edilir.\\n\\nAndes dağlarındaki Antioquia bölgesinden gelir; burada çiftlik işçilerinin tam bir fiziksel iş günü için enerjiye ihtiyacı vardı.",
      it: "La bandeja paisa è il piatto nazionale della Colombia e il più generoso dell'America Latina — un enorme vassoio con 9-11 componenti: frijoles (fagioli rossi), riso bianco, carne molida (carne macinata), chicharrón (cotenna di maiale fritta), chorizo, morcilla (sanguinaccio), uovo fritto, arepa, platano fritto, avocado e pane. Tutto su un solo piatto.\\n\\nProviene dalla regione di Antioquia (Ande), dove i lavoratori agricoli avevano bisogno di energia per una giornata intera di lavoro fisico.",
      ko: "반데하 파이사는 콜롬비아의 국민 요리이자 라틴아메리카에서 가장 푸짐한 한 접시입니다. 프리홀레스(붉은 콩), 흰 쌀밥, 다진 소고기, 치차론(바삭한 돼지껍질), 초리소, 모르시야(선지 소시지), 달걀 프라이, 아레파, 튀긴 플랜틴, 아보카도, 빵의 9-11가지 요소가 하나의 접시에 담겨 나옵니다.\\n\\n안데스 산맥의 안티오키아 지역에서 유래했으며, 하루 종일 육체 노동을 해야 하는 농장 일꾼들에게 충분한 에너지를 공급하기 위해 만들어졌습니다.",
      hi: "बान्देहा पायसा कोलम्बिया का राष्ट्रीय व्यंजन है और लैटिन अमेरिका की सबसे उदार थाली — एक विशाल प्लेट जिसमें 9-11 घटक होते हैं: फ्रिहोलेस (लाल बीन्स), सफेद चावल, कार्ने मोलिदा (कीमा), चिचारोन (तली पोर्क रिंड), चोरिज़ो, मोर्सिल्ला (ब्लड सॉसेज), तला अंडा, अरेपा, तला कच्चा केला, एवोकाडो और रोटी। सब एक ही थाली में।\\n\\nयह एंडीज़ पर्वत के एंटियोकिया क्षेत्र से आता है जहाँ खेत मज़दूरों को पूरे दिन के शारीरिक श्रम के लिए ऊर्जा चाहिए थी।"
    }'''
content = content.replace(old_163, new_163)

# ── ID 164 – Lángos (Hungary) ─────────────────────────────────────────────────
content = content.replace(
    '      ko: "헝가리"\n    },\n    name: {\n      ro: "Lángos"',
    '      ko: "헝가리",\n      hi: "हंगरी"\n    },\n    name: {\n      ro: "Lángos"'
)
content = content.replace(
    '      ko: "랑고시"\n    },\n    category: {',
    '      ko: "랑고시",\n      hi: "लांगोश"\n    },\n    category: {'
)
content = content.replace(
    '      ko: "간식"\n    },\n    ingredients: {\n      ro: ["făină", "drojdie"',
    '      ko: "간식",\n      hi: "नाश्ता"\n    },\n    ingredients: {\n      ro: ["făină", "drojdie"'
)
content = content.replace(
    '      ko: ["밀가루", "이스트", "물", "소금", "기름", "새콤한 크림", "치즈", "마늘"]\n    },\n    howIsMade: {',
    '      ko: ["밀가루", "이스트", "물", "소금", "기름", "새콤한 크림", "치즈", "마늘"],\n      hi: ["आटा", "खमीर", "पानी", "नमक", "तेल", "खट्टी क्रीम", "चीज़", "लहसुन"]\n    },\n    howIsMade: {'
)
content = content.replace(
    '      ko: "발효 반죽을 준비하고 펴서 뜨거운 기름에 폭신하고 노릇해질 때까지 튀깁니다. 사워크림과 치즈를 곁들여 냅니다."\n    },\n    originText: {\n      ro: "Lángos este',
    '      ko: "발효 반죽을 준비하고 펴서 뜨거운 기름에 폭신하고 노릇해질 때까지 튀깁니다. 사워크림과 치즈를 곁들여 냅니다.",\n      hi: "खमीरदार आटा तैयार करें, बेलें और गर्म तेल में फूला और सुनहरा होने तक तलें। खट्टी क्रीम और चीज़ के साथ परोसें।"\n    },\n    originText: {\n      ro: "Lángos este'
)
old_164 = '''    originText: {
      ro: "Lángos este o rețetă tradițională din Ungaria.",
      en: "Lángos is a traditional recipe from Hungary.",
      es: "Lángos es una receta tradicional de Hungría.",
      fr: "Lángos est une recette traditionnelle de Hongrie.",
      de: "Lángos ist ein traditionelles Rezept aus Ungarn.",
      pt: "Lángos é uma receita tradicional da Hungria.",
      ru: "Лангош — традиционный рецепт из Венгрии.",
      ar: "لانغوش هي وصفة تقليدية من المجر.",
      zh: "匈牙利油饼 是来自匈牙利的传统食谱。",
      ja: "ラーンゴシュ はハンガリーの伝統的なレシピです。",
      tr: "Lángos Macaristan kökenli geleneksel bir tariftir.",
      it: "Lángos è una ricetta tradizionale dell'Ungheria.",
      ko: "랑고시는 헝가리의 전통 요리입니다."
    }'''
new_164 = '''    originText: {
      ro: "Lángos este snack-ul stradal național al Ungariei — o pâine prăjită dospită în ulei, pufoasă și aurie, unsă cu smântână și presărată cu brânză rasa. Cuvântul vine din maghiară de la láng (flacără), referindu-se la tradiția de a coace aluatul rămas lângă focul de pâine. Azi se prăjește în ulei adânc.\\n\\nLángos se vinde la toate piețele, lacurile balneare și festivalurile ungare. Variantele includ usturoi frecat, bacon, cârnați sau chiar Nutella. La Balaton — lacul de vacanță al Ungariei — lángos este mâncarea de plajă prin excelență, mirosul de ulei încins amestecându-se cu adierea de apă. Ungurii o consideră comfort food prin excelență.",
      en: "Lángos is Hungary's national street snack — a deep-fried leavened flatbread, puffy and golden, smeared with sour cream and sprinkled with shredded cheese. The word comes from Magyar láng (flame), referring to the tradition of baking leftover dough near the bread oven fire. Today it is deep-fried in oil.\\n\\nLángos is sold at all markets, thermal lakes, and Hungarian festivals. Variants include rubbed garlic, bacon, sausage, or even Nutella. At Balaton — Hungary's holiday lake — lángos is the quintessential beach food, the smell of hot oil mixing with the breeze off the water. Hungarians consider it the ultimate comfort food.",
      es: "El lángos es el snack callejero nacional de Hungría — un pan plano frito en abundante aceite, esponjoso y dorado, untado con crema agria y espolvoreado con queso rallado. La palabra viene del húngaro láng (llama), en referencia a la tradición de hornear la masa sobrante junto al fuego del horno de pan. Hoy se fríe en aceite profundo.\\n\\nEl lángos se vende en todos los mercados, balnearios y festivales húngaros. Las variantes incluyen ajo frotado, bacon, embutidos o incluso Nutella.",
      fr: "Le lángos est le snack de rue national de Hongrie — un pain plat levé frit dans l'huile, moelleux et doré, enduit de crème aigre et parsemé de fromage râpé. Le mot vient du hongrois láng (flamme), en référence à la tradition de cuire la pâte restante près du feu du four à pain. Aujourd'hui il est frit dans l'huile.\\n\\nLe lángos se vend dans tous les marchés, lacs thermaux et festivals hongrois. Les variantes incluent l'ail frotté, le bacon, les saucisses ou même la Nutella.",
      de: "Lángos ist Ungarns nationaler Straßensnack — ein frittiertes Hefefladenbrot, fluffig und goldgelb, mit Sauerrahm bestrichen und geriebenem Käse bestreut. Das Wort kommt vom ungarischen láng (Flamme) und bezieht sich auf die Tradition, übrigen Teig am Brotofenfeuer zu backen. Heute wird er in heißem Öl frittiert.\\n\\nLángos wird auf allen Märkten, Thermalseen und Festivals in Ungarn verkauft. Varianten sind Knoblauch, Speck, Würstchen oder sogar Nutella.",
      pt: "O lángos é o snack de rua nacional da Hungria — um pão plano fermentado frito, fofo e dourado, coberto com creme azedo e queijo ralado. A palavra vem do húngaro láng (chama), referindo-se à tradição de assar a massa restante perto do forno de pão. Hoje é frito em óleo.\\n\\nO lángos é vendido em todos os mercados, termas e festivais húngaros. As variantes incluem alho esfregado, bacon, enchidos ou até Nutella.",
      ru: "Лангош — национальный уличный снэк Венгрии: дрожжевая лепёшка во фритюре, пышная и золотистая, смазанная сметаной и посыпанная тёртым сыром. Слово происходит от венгерского láng (пламя): раньше остатки теста выпекали у огня хлебной печи. Сегодня жарят в кипящем масле.\\n\\nЛангош продают на всех рынках, термальных озёрах и фестивалях Венгрии. Варианты: натёртый чеснок, бекон, колбаски или даже Нутелла. На Балатоне — озере-курорте Венгрии — лангош является главной пляжной едой.",
      ar: "اللانغوش هو الوجبة الخفيفة الشارعية الوطنية للمجر — خبز مسطح مخمر مقلي في الزيت، إسفنجي وذهبي، مدهون بالقشدة الحامضة ومرشوش بالجبن المبشور. تأتي الكلمة من المجرية láng (لهب)، في إشارة إلى تقليد خبز العجين الفائض قرب نار الفرن. اليوم يُقلى في الزيت العميق.\\n\\nيُباع اللانغوش في جميع الأسواق والبحيرات الحرارية والمهرجانات المجرية. المتغيرات تشمل الثوم والبيكون والنقانق أو حتى النوتيلا.",
      zh: "朗戈什是匈牙利的国家街头小吃——一种深炸的发酵薄饼，蓬松金黄，涂上酸奶油，撒上碎奶酪。这个词来自匈牙利语láng（火焰），指的是在面包炉火旁烘烤剩余面团的传统。如今在热油中油炸。\\n\\n朗戈什在所有市场、温泉湖和匈牙利节日上出售。变体包括蒜泥、培根、香肠甚至榛子巧克力酱。在巴拉顿湖，朗戈什是典型的海滩食物。",
      ja: "ラーンゴシュはハンガリーの国民的なストリートフードです——発酵した生地を深揚げにした、ふっくらと黄金色の薄焼きパンにサワークリームを塗り、すりおろしチーズをかけたものです。この言葉はハンガリー語のláng（炎）に由来し、パン窯の火のそばで余った生地を焼く伝統を指します。今日では油で揚げます。\\n\\nラーンゴシュはすべての市場、温泉湖、ハンガリーのフェスティバルで売られます。バリエーションにはすりおろしニンニク、ベーコン、ソーセージ、さらにはヌテラも含まれます。",
      tr: "Lángos, Macaristan'ın ulusal sokak atıştırmalığıdır — derin yağda kızartılmış, kabarık ve altın rengi mayalı bir yassı ekmek, ekşi krema ile sürülür ve rendelenmiş peynir serpilir. Kelime, Macarca láng (alev) kelimesinden gelir; ekmek fırınının ateşi yanında kalan hamurun pişirilmesi geleneğine atıfta bulunur. Bugün yağda kızartılır.\\n\\nLángos tüm pazarlarda, ıslak alanlarda ve Macar festivallerinde satılır. Çeşitleri sarımsak, pastırma, sosis veya hatta Nutella içerir.",
      it: "Il lángos è lo snack di strada nazionale dell'Ungheria — un pane piatto lievitato fritto in abbondante olio, morbido e dorato, spalmato di panna acida e cosparso di formaggio grattugiato. La parola viene dall'ungherese láng (fiamma), in riferimento alla tradizione di cuocere la pasta avanzata vicino al fuoco del forno del pane. Oggi viene fritto nell'olio.\\n\\nIl lángos si vende in tutti i mercati, nei laghi termali e nei festival ungheresi. Le varianti includono aglio strofinato, pancetta, salsicce o persino Nutella.",
      ko: "랑고시는 헝가리의 국민 길거리 간식입니다. 발효된 반죽을 깊은 기름에 튀겨 폭신하고 황금빛으로 만든 뒤 사워크림을 바르고 갈은 치즈를 얹습니다. 이 단어는 헝가리어 láng(불꽃)에서 유래하며, 빵 가마의 불 근처에서 남은 반죽을 굽던 전통을 가리킵니다. 오늘날에는 식용유에 튀깁니다.\\n\\n모든 시장, 온천 호수, 헝가리 축제에서 판매됩니다. 마늘 문지르기, 베이컨, 소시지, 심지어 누텔라를 올린 변형도 있습니다. 발라톤 호수에서 랑고시는 대표적인 해변 음식입니다.",
      hi: "लांगोश हंगरी का राष्ट्रीय स्ट्रीट स्नैक है — एक गहरे तेल में तली खमीरदार चपटी रोटी, फूली और सुनहरी, खट्टी क्रीम से पोती और कसे चीज़ से सजी। यह शब्द हंगेरियन láng (लौ) से आता है, जो रोटी की भट्टी की आग के पास बचे आटे को पकाने की परंपरा को संदर्भित करता है। आज इसे गहरे तेल में तला जाता है।\\n\\nलांगोश सभी बाज़ारों, थर्मल झीलों और हंगेरियन उत्सवों में बेचा जाता है। विविधताओं में रगड़ा हुआ लहसुन, बेकन, सॉसेज या यहाँ तक कि नुटेला शामिल हैं। बालाटन झील पर लांगोश समुद्र तट का प्रमुख भोजन है।"
    }'''
content = content.replace(old_164, new_164)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("IDs 160-164 done")
