with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add hi to origin
content = content.replace(
    '      ko: "라트비아"\n    },\n    name: {\n      ro: "Piragi"',
    '      ko: "라트비아",\n      hi: "लातविया"\n    },\n    name: {\n      ro: "Piragi"'
)

# Add hi to name
content = content.replace(
    '      ko: "피라기"\n    },\n    category: {\n      ro: "Gustare"',
    '      ko: "피라기",\n      hi: "पिरागी"\n    },\n    category: {\n      ro: "Gustare"'
)

# Add hi to category — Piragi is Snack
content = content.replace(
    '      ko: "간식"\n    },\n    servings: 8',
    '      ko: "간식",\n      hi: "नाश्ता"\n    },\n    servings: 8'
)

# Add hi to ingredients
content = content.replace(
    '      ko: ["반죽", "베이컨", "양파", "달걀", "우유", "소금", "후추"]\n    },\n    howIsMade: {',
    '      ko: ["반죽", "베이컨", "양파", "달걀", "우유", "소금", "후추"],\n      hi: ["आटा", "बेकन", "प्याज़", "अंडे", "दूध", "नमक", "काली मिर्च"]\n    },\n    howIsMade: {'
)

# Add hi to howIsMade
content = content.replace(
    '      ko: "발효된 반죽에 햄이나 베이컨을 채워 말아서 노릇하게 구울 때까지 오븐에서 굽습니다."\n    },\n    originText: {\n      ro: "Piragi este',
    '      ko: "발효된 반죽에 햄이나 베이컨을 채워 말아서 노릇하게 구울 때까지 오븐에서 굽습니다.",\n      hi: "खमीरी आटे में हैम या बेकन भरें, रोल करें और सुनहरा होने तक ओवन में बेक करें।"\n    },\n    originText: {\n      ro: "Piragi este'
)

# Replace originText
old_origin = '''    originText: {
      ro: "Piragi este o rețetă tradițională din Letonia.",
      en: "Piragi is a traditional recipe from Latvia.",
      es: "Piragi es una receta tradicional de Letonia.",
      fr: "Piragi est une recette traditionnelle de Lettonie.",
      de: "Piragi ist ein traditionelles Rezept aus Lettland.",
      pt: "Piragi é uma receita tradicional da Letônia.",
      ru: "Пираги — традиционный рецепт из Латвии.",
      ar: "بيراجي هي وصفة تقليدية من لاتفيا.",
      zh: "拉脱维亚肉馅面包 是来自拉脱维亚的传统食谱。",
      ja: "ピラギ はラトビアの伝統的なレシピです。",
      tr: "Piragi Letonya kökenli geleneksel bir tariftir.",
      it: "Piragi è una ricetta tradizionale della Lettonia.",
      ko: "피라기는 라트비아의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Piraagi sunt chifle mici în formă de semilună, umplute cu bacon afumat și ceapă tocată, coapte pe aluatul dospit până devin aurii. Sunt nelipsite la celebrările letone, mai ales de Jāņi — festivalul de vară al solstițiului — când se pregătesc cu zecile și se împart generos. Originile lor se află în tradiția medievală baltică a plăcintelor mici umplute cu carne.\\n\\nUmplutura se face cu bacon afumat (mai degrabă decât șuncă obișnuită) tăiat mărunt cu ceapă crudă; un bun amestec are un raport gras-slab echilibrat. Piraagii se servesc calzi, adesea cu bere sau un pahar de buttermilk. Mirosul lor care se coace anunță orice adunare de familie letonă.",
      en: "Piragi are small crescent-shaped buns filled with smoked bacon and finely chopped onion, baked in leavened dough until golden. They are indispensable at Latvian celebrations, especially Jāņi — the midsummer solstice festival — when they are made by the dozen and shared generously. Their roots lie in the Baltic medieval tradition of small filled pastries.\\n\\nThe filling is made with smoked bacon — rather than plain ham — diced fine with raw onion; a good mixture has a balanced fat-to-lean ratio. Piragi are served warm, often alongside beer or a glass of buttermilk. The smell of them baking announces every Latvian family gathering.",
      es: "Los piragi son pequeños bollos en forma de media luna rellenos de bacon ahumado y cebolla finamente picada, horneados en masa fermentada hasta dorar. Son imprescindibles en las celebraciones letonas, especialmente en Jāņi — el festival del solsticio de verano — cuando se preparan por docenas y se comparten generosamente. Sus raíces están en la tradición medieval báltica de las empanadillas rellenas.\\n\\nEl relleno se hace con bacon ahumado — en lugar de jamón — cortado fino con cebolla cruda. Se sirven calientes, a menudo con cerveza o suero de leche.",
      fr: "Les piragi sont de petits petits pains en forme de croissant fourrés de bacon fumé et d'oignon finement haché, cuits dans une pâte levée jusqu'à dorure. Ils sont indispensables lors des célébrations lettones, notamment à Jāņi — le festival du solstice d'été — où on en prépare des dizaines et on les partage généreusement. Leurs racines remontent à la tradition médiévale baltique des petits chaussons fourrés.\\n\\nLa garniture est faite de bacon fumé — plutôt que de jambon ordinaire — finement découpé avec de l'oignon cru. Les piragi se servent chauds, souvent avec de la bière ou un verre de babeurre.",
      de: "Piragi sind kleine halbmondförmige Brötchen, gefüllt mit geräuchertem Speck und fein gehackter Zwiebel, im Hefeteig goldbraun gebacken. Sie sind bei lettischen Feiern unverzichtbar, besonders bei Jāņi — dem Mittsommersonnwendfest — wenn sie dutzendweise gebacken und großzügig geteilt werden. Ihre Wurzeln liegen in der baltischen mittelalterlichen Tradition kleiner gefüllter Teigtaschen.\\n\\nDie Füllung wird aus geräuchertem Speck — statt normalem Schinken — fein gewürfelt mit roher Zwiebel hergestellt. Piragi werden warm serviert, oft mit Bier oder einem Glas Buttermilch.",
      pt: "Os piragi são pequenos pães em forma de crescente recheados com bacon defumado e cebola finamente picada, assados em massa fermentada até dourarem. São indispensáveis nas celebrações letãs, especialmente na Jāņi — o festival do solstício de verão — quando são preparados às dúzias e partilhados generosamente. Suas raízes estão na tradição medieval báltica das empadas recheadas.\\n\\nO recheio é feito com bacon defumado — em vez de presunto simples — picado fininho com cebola crua. Os piragi são servidos quentes, frequentemente com cerveja ou um copo de leitelho.",
      ru: "Пираги — маленькие рогалики в форме полумесяца с начинкой из копчёного бекона и мелко нарезанного лука, запечённые в дрожжевом тесте до золотистого цвета. Они незаменимы на латышских праздниках, особенно на Янов день — праздник летнего солнцестояния, — когда их пекут десятками и щедро угощают. Их корни — в балтийской средневековой традиции маленьких пирожков с начинкой.\\n\\nНачинку делают из копчёного бекона — не простой ветчины — мелко нарезанного с сырым луком. Пираги подают тёплыми, нередко с пивом или стаканом пахты.",
      ar: "البيراجي لفائف صغيرة بشكل الهلال محشوة بالبيكون المدخن والبصل المفروم ناعماً، مخبوزة في عجينة مخمّرة حتى تحمر. لا غنى عنها في احتفالات لاتفيا، ولا سيما في يانّي — مهرجان الانقلاب الصيفي — حيث تُعدّ بالعشرات وتُوزّع بسخاء. جذورها في التقليد البلطيقي الوسيط للفطائر الصغيرة المحشوة.\\n\\nتُحضَّر الحشوة بالبيكون المدخن — لا الجمبون العادي — مقطعاً ناعماً مع البصل الخام. تُقدَّم البيراجي ساخنة، غالباً مع البيرة أو اللبن.",
      zh: "皮拉基是拉脱维亚的小型月牙形面包，馅料为烟熏培根和细切洋葱，用发酵面团包裹后烤至金黄。这道点心在拉脱维亚庆典中不可或缺，尤其是仲夏至日节Jāņi——届时人们会烤出几十个，慷慨地与亲友分享。其根源可追溯至波罗的海中世纪的小型馅饼传统。\\n\\n馅料用烟熏培根（而非普通火腿）切丁后与生洋葱混合，肥瘦比例均衡为佳。皮拉基趁热享用，常配啤酒或一杯白脱牛奶。",
      ja: "ピラギはラトビアの小さな三日月形のパンで、燻製ベーコンと細かく刻んだ玉ねぎを発酵生地に包んで黄金色になるまで焼きます。ラトビアの祝事、特に夏至祭ヤーニ（Jāņi）には欠かせない存在で、何十個も作って惜しみなく分け合います。バルト中世の小さな肉まんの伝統に由来しています。\\n\\n具はスモークベーコン——普通のハムでなく——を生玉ねぎと細かく刻んで作り、脂身と赤身のバランスが大切です。温かいうちにビールやバターミルクと一緒に楽しみます。",
      tr: "Piragi, tütsülenmiş pastırma ve ince doğranmış soğanla doldurulmuş, mayalı hamurda altın rengi alana kadar pişirilmiş küçük hilal biçimli çöreklerdir. Letonya kutlamalarında, özellikle yaz gündönümü festivali Jāņi'de vazgeçilmezdirler; onlarcası pişirilip cömertçe paylaşılır. Kökleri, Baltık Orta Çağ geleneğindeki küçük dolgulu börek anlayışına dayanır.\\n\\nİç harç, düz jambondan değil, çiğ soğanla ince ince doğranmış tütsülenmiş pastırmadan yapılır; iyi bir karışımda yağlı-yağsız oranı dengelidir. Piragi sıcak servis edilir, genellikle bira veya bir bardak ayranla birlikte.",
      it: "I piragi sono piccoli panini a forma di mezzaluna ripieni di pancetta affumicata e cipolla tritata finemente, cotti in una pasta lievitata fino a doratura. Sono indispensabili alle celebrazioni lettoni, specialmente a Jāņi — il festival del solstizio d'estate — quando vengono preparati a decine e condivisi generosamente. Le loro radici affondano nella tradizione medievale baltica dei piccoli pasticcini ripieni.\\n\\nIl ripieno è fatto con pancetta affumicata — non prosciutto comune — tagliata finemente con cipolla cruda. I piragi si servono caldi, spesso con birra o un bicchiere di latticello.",
      ko: "피라기는 훈제 베이컨과 잘게 다진 양파를 채운 작은 초승달 모양의 빵으로, 발효 반죽으로 만들어 황금색이 될 때까지 굽습니다. 라트비아 축제, 특히 하지 축제 야니(Jāņi)에는 반드시 등장하며, 수십 개를 만들어 넉넉히 나눕니다. 그 뿌리는 발트해 중세의 소형 속 채운 과자 전통에 있습니다.\\n\\n속재료는 일반 햄이 아닌 훈제 베이컨을 생양파와 곱게 다져 만들며, 지방과 살코기의 균형이 중요합니다. 피라기는 따뜻하게 내며, 보통 맥주나 버터밀크와 함께 즐깁니다.",
      hi: "पिरागी छोटे अर्धचंद्राकार बन हैं जो स्मोक्ड बेकन और बारीक कटे प्याज़ से भरे होते हैं, खमीरी आटे में बनाकर सुनहरे होने तक बेक किए जाते हैं। ये लातवियाई उत्सवों में अपरिहार्य हैं, विशेषकर जानी — मिडसमर सोलस्टिस त्योहार — जब दर्जनों बनाकर उदारता से साझा किए जाते हैं। इनकी जड़ें बाल्टिक मध्यकालीन परंपरा में हैं।\\n\\nभराई सामान्य हैम के बजाय स्मोक्ड बेकन — कच्चे प्याज़ के साथ बारीक काटकर बनाई जाती है; अच्छे मिश्रण में चर्बी और मांस का संतुलन होता है। पिरागी गर्म परोसे जाते हैं, अक्सर बीयर या एक गिलास छाछ के साथ।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 125 done")
