with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# === ID 180: Okonomiyaki (Japan) ===

# origin hi — multi-line block, unique anchor via name "Okonomiyaki"
content = content.replace(
    '      ko: "일본"\n    },\n    name: {\n      ro: "Okonomiyaki"',
    '      ko: "일본",\n      hi: "जापान"\n    },\n    name: {\n      ro: "Okonomiyaki"'
)

# name hi
content = content.replace(
    '      ko: "오코노미야키"\n    },\n    category: {',
    '      ko: "오코노미야키",\n      hi: "ओकोनोमियाकी"\n    },\n    category: {'
)

# category already has hi: "रात का खाना" ✓

# ingredients hi — append after ko array
content = content.replace(
    '      ko: ["박력분 200g", "차가운 다시 육수 240ml (또는 물 + 다시 가루 1작은술)", "큰 달걀 2개", "양배추 400g, 가늘게 채 썬 것", "돼지 삼겹살 200g, 얇게 썬 것 (5cm 크기로 자른 것)", "튀김가루 찌꺼기(텐카스) 2큰술 (선택)", "베이킹파우더 ½작은술", "큐피 마요네즈 4큰술", "오코노미야키 소스(오타후쿠) 4큰술", "우스터 소스 1작은술", "가쓰오부시(건조 참치포) 담아낼 때 올릴 분량", "아오노리(파래가루) 담아낼 때 올릴 분량"]',
    '      ko: ["박력분 200g", "차가운 다시 육수 240ml (또는 물 + 다시 가루 1작은술)", "큰 달걀 2개", "양배추 400g, 가늘게 채 썬 것", "돼지 삼겹살 200g, 얇게 썬 것 (5cm 크기로 자른 것)", "튀김가루 찌꺼기(텐카스) 2큰술 (선택)", "베이킹파우더 ½작은술", "큐피 마요네즈 4큰술", "오코노미야키 소스(오타후쿠) 4큰술", "우스터 소스 1작은술", "가쓰오부시(건조 참치포) 담아낼 때 올릴 분량", "아오노리(파래가루) 담아낼 때 올릴 분량"],\n      hi: ["200 ग्राम मैदा (या केक आटा)", "240 मिली ठंडा दाशी स्टॉक (या पानी + 1 छोटी चम्मच दाशी पाउडर)", "2 बड़े अंडे", "400 ग्राम पत्तागोभी, बारीक कटी हुई", "200 ग्राम पतली कटी सूअर की पेट की परत (बुता बारा), 5 सेमी टुकड़ों में", "2 बड़े चम्मच तेंकासु (टेम्पुरा के टुकड़े, वैकल्पिक)", "½ छोटी चम्मच बेकिंग पाउडर", "4 बड़े चम्मच जापानी मेयोनीज़ (क्यूपी)", "4 बड़े चम्मच ओकोनोमियाकी सॉस (ओटाफुकु)", "1 छोटी चम्मच वॉर्सेस्टरशायर सॉस", "काट्सुओबुशी परोसने के लिए", "आओनोरी पाउडर परोसने के लिए"]'
)

# howIsMade hi — append after ko entry
content = content.replace(
    '      ko: "큰 볼에 박력분, 베이킹파우더, 달걀, 차가운 다시 육수를 넣고 과도하게 섞지 않게 대충 섞습니다. 채 썬 양배추와 텐카스를 주걱으로 부드럽게 접어 넣습니다 — 반죽이 두껍고 양배추가 많아야 합니다. 코팅 팬을 중불로 달구고 얇게 기름을 바릅니다. 반죽을 넣어 약 2cm 두께의 둥근 모양으로 폅니다. 삼겹살 슬라이스를 전체 위에 고르게 덮습니다. 중약불로 5–6분 굽고, 가장자리가 굳고 바닥이 황금색이 되면 두 개의 뒤집개로 조심스럽게 뒤집어 살짝 눌러줍니다. 5–6분 더 구워 고기가 바삭하면 완성입니다. 오코노미야키 소스를 고기 면에 바르고, 큐피 마요네즈를 지그재그로 짜고, 가쓰오부시와 아오노리를 뿌립니다. 즉시 냅니다."',
    '      ko: "큰 볼에 박력분, 베이킹파우더, 달걀, 차가운 다시 육수를 넣고 과도하게 섞지 않게 대충 섞습니다. 채 썬 양배추와 텐카스를 주걱으로 부드럽게 접어 넣습니다 — 반죽이 두껍고 양배추가 많아야 합니다. 코팅 팬을 중불로 달구고 얇게 기름을 바릅니다. 반죽을 넣어 약 2cm 두께의 둥근 모양으로 폅니다. 삼겹살 슬라이스를 전체 위에 고르게 덮습니다. 중약불로 5–6분 굽고, 가장자리가 굳고 바닥이 황금색이 되면 두 개의 뒤집개로 조심스럽게 뒤집어 살짝 눌러줍니다. 5–6분 더 구워 고기가 바삭하면 완성입니다. 오코노미야키 소스를 고기 면에 바르고, 큐피 마요네즈를 지그재그로 짜고, 가쓰오부시와 아오노리를 뿌립니다. 즉시 냅니다.",\n      hi: "एक बड़े कटोरे में मैदा, बेकिंग पाउडर, अंडे और ठंडा दाशी स्टॉक मिलाएं — ज़्यादा न फेंटें। कटी पत्तागोभी और तेंकासु को स्पेटुला से धीरे से मिलाएं; बैटर गाढ़ा होना चाहिए। नॉन-स्टिक पैन मध्यम आंच पर गर्म करें, थोड़ा तेल लगाएं। बैटर डालें और 2 सेमी मोटी गोल आकार बनाएं। सूअर की पेट की परत के टुकड़े पूरी सतह पर रखें। मध्यम-धीमी आंच पर 5–6 मिनट पकाएं जब तक किनारे सख्त न हों और नीचे सुनहरा न हो। दो स्पेटुला से सावधानी से पलटें, हल्का दबाएं; 5–6 मिनट और पकाएं जब तक मांस कुरकुरा न हो। मांस वाली तरफ ओकोनोमियाकी सॉस लगाएं, क्यूपी मेयोनीज़ जिग-ज़ैग में डालें, काट्सुओबुशी और आओनोरी छिड़कें।"'
)

# originText full replacement
old_180 = '''    originText: {
      ro: "Okonomiyaki este o rețetă tradițională din Japonia.",
      en: "Okonomiyaki is a traditional recipe from Japan.",
      es: "Okonomiyaki es una receta tradicional de Japón.",
      fr: "Okonomiyaki est une recette traditionnelle du Japon.",
      de: "Okonomiyaki ist ein traditionelles Rezept aus Japan.",
      pt: "Okonomiyaki é uma receita tradicional do Japão.",
      ru: "Окономияки — традиционный рецепт из Японии.",
      ar: "أوكونومياكي هي وصفة تقليدية من اليابان.",
      zh: "御好烧 是来自日本的传统食谱。",
      ja: "お好み焼き は日本の伝統的なレシピです。",
      tr: "Okonomiyaki, Japonya kökenli geleneksel bir tariftir.",
      it: "Okonomiyaki è una ricetta tradizionale del Giappone.",
      ko: "오코노미야키는 일본의 전통 요리입니다."
    }'''

new_180 = '''    originText: {
      ro: "Okonomiyaki înseamnă literal gătește ce-ți place — o instrucțiune, nu un simplu titlu. Versiunea din Osaka amestecă varză rasă grosier într-un aluat de făină, dashi rece și ou, gătit în tigaie de fontă până ce marginile se caramelizează iar centrul rămâne cremos. Feliuțele de burtă de porc se pun deasupra înainte de răsturnare, dorind direct pe fierul fierbinte.\\n\\nVarianta din Hiroshima dispune aceleași componente în straturi separate — mai întâi aluatul, apoi legumele, pe urmă tăițeii — iar locuitorii orașului susțin cu tărie că cele două preparate nu au nimic în comun. Ambele împart ritualul final: sos okonomiyaki pensulat, Kewpie tras în zigzag, katsuobushi presărat să danseze în căldura reziduală.",
      en: "Okonomiyaki means cook what you like — an instruction, not a name. The Osaka version packs grated cabbage into a thick batter of flour, cold dashi and egg, then cooks it in a cast-iron pan until the edges caramelize and the centre stays custardy. Pork belly goes on top before the flip, rendering directly against the hot iron.\\n\\nHiroshima's interpretation layers the same components separately — batter first, vegetables next, then noodles — and the city's residents insist it is a different dish entirely. Both versions share the finishing ritual: okonomiyaki sauce brushed on, Kewpie piped in zigzags, katsuobushi scattered to wave in the residual heat.",
      es: "Okonomiyaki significa cocina lo que te gusta — una instrucción, no un nombre. La versión de Osaka mezcla col rallada en una masa espesa de harina, dashi frío y huevo, y la cocina en sartén de hierro fundido hasta que los bordes se caramelizan y el centro queda cremoso. La panceta va encima antes de voltear, dorándose directamente contra el hierro caliente.\\n\\nLa interpretación de Hiroshima dispone los mismos componentes en capas separadas — primero la masa, luego las verduras, después los fideos — y los habitantes de la ciudad insisten en que son platos completamente distintos. Ambas versiones comparten el ritual final: salsa pincelada, Kewpie en zigzag, katsuobushi esparcido para ondear con el calor residual.",
      fr: "Okonomiyaki signifie cuisinez ce que vous aimez — une instruction, pas un nom. La version d'Osaka incorpore du chou râpé dans une pâte épaisse de farine, de dashi froid et d'oeufs, cuite dans une poêle en fonte jusqu'à ce que les bords caramélisent et que le centre reste fondant. La poitrine de porc va sur le dessus avant de retourner, fondant directement contre le fer chaud.\\n\\nL'interprétation d'Hiroshima superpose les mêmes composants en couches séparées — d'abord la pâte, ensuite les légumes, puis les nouilles — et les habitants de la ville insistent sur le fait que ce sont deux plats entièrement différents. Les deux versions partagent le rituel final: sauce badigeonnée, Kewpie en zigzag, katsuobushi pour onduler dans la chaleur résiduelle.",
      de: "Okonomiyaki bedeutet koche, was du magst — eine Anweisung, kein Name. Die Osaka-Version mischt grob geriebenen Kohl in einen dicken Teig aus Mehl, kaltem Dashi und Ei, der dann in einer gusseisernen Pfanne gebraten wird, bis die Ränder karamellisieren und die Mitte cremig bleibt. Schweinebauch kommt vor dem Wenden obendrauf, um direkt gegen das heiße Eisen zu schmelzen.\\n\\nHiroshimas Interpretation schichtet die gleichen Komponenten separat — zuerst den Teig, dann das Gemüse, dann die Nudeln — und die Einwohner der Stadt beharren darauf, dass es zwei völlig verschiedene Gerichte sind. Beide Versionen teilen das Ritual: Soße aufpinseln, Kewpie im Zickzack auftragen, Katsuobushi verstreuen, um in der Resthitze zu tanzen.",
      pt: "Okonomiyaki significa cozinhe o que você gosta — uma instrução, não um nome. A versão de Osaka incorpora repolho ralado a uma massa espessa de farinha, dashi frio e ovo, cozida numa frigideira de ferro fundido até as bordas caramelizarem e o centro ficar cremoso. A barriga de porco vai por cima antes de virar, derretendo diretamente contra o ferro quente.\\n\\nA interpretação de Hiroshima empilha os mesmos componentes em camadas separadas — primeiro a massa, depois os legumes, depois o macarrão — e os habitantes da cidade insistem que são dois pratos completamente distintos. Ambas partilham o ritual final: molho pincelado, Kewpie em zigzag, katsuobushi espalhado para ondear no calor residual.",
      ru: "Окономияки дословно означает готовь что хочешь — это инструкция, а не просто название. В версии Осаки крупно натёртая капуста смешивается в густое тесто из муки, холодного даси и яйца, затем обжаривается на чугунной сковороде до карамелизации краёв и кремовой серединки. Свиная грудинка укладывается сверху до переворачивания и жарится прямо на раскалённом металле.\\n\\nВ интерпретации Хиросимы те же компоненты выкладываются слоями по отдельности — сначала тесто, потом овощи, потом лапша — и жители города настаивают, что это совершенно разные блюда. Обе версии объединяет финальный ритуал: смазать соусом, нанести Kewpie зигзагом, посыпать кацуобуси.",
      ar: "أوكونومياكي تعني اطبخ ما تحب — إنها تعليمة لا مجرد اسم. نسخة أوساكا تضم الملفوف المبشور في عجينة كثيفة من الدقيق والداشي البارد والبيض، تُطهى في مقلاة من الحديد الزهر حتى تتكرمل الحواف ويبقى المركز كريمياً. تُوضع شرائح بطن الخنزير فوق العجينة قبل القلب لتذوب مباشرة على الحديد الساخن.\\n\\nتفسير هيروشيما يرتب نفس المكونات في طبقات منفصلة — العجينة أولاً ثم الخضروات ثم الشعرية — ويصر سكان المدينة على أنهما طبقان مختلفان تماماً. تشترك النسختان في الطقس الختامي: دهن الصوص، رسم الكيوبي بشكل متعرج، ورش الكاتسوبوشي ليرقص في الحرارة المتبقية.",
      zh: "御好烧字面意思是按你喜欢的方式来烧——这是一道指令，不只是个名字。大阪版本将粗刨卷心菜拌入厚厚的面粉、冷鲣鱼高汤和鸡蛋糊，在铸铁锅中煎至边缘焦糖化而中心保持嫩滑。五花肉片铺在面糊上方，翻面前直接贴着热铁慢慢渗出油脂。\\n\\n广岛的做法将相同的食材分层叠放——先是面糊，再是蔬菜，然后是面条——当地人会坚持认为两者根本是两道完全不同的菜。两种版本共享同一套收尾仪式：刷上御好烧酱，挤丘比蛋黄酱画之字纹，撒上柴鱼花让它在余热中飘舞。",
      ja: "お好み焼きとは好きなものを焼くという意味——料理名ではなく、指示そのものだ。大阪スタイルはざく切りキャベツを薄力粉・冷たいだし汁・卵の厚めの生地に混ぜ込み、鋳鉄のフライパンで焼くと縁がカリッとして中はふんわり仕上がる。豚バラはひっくり返す前に上に乗せ、熱いフライパン面に直接触れながら脂が落ちていく。\\n\\n広島スタイルは同じ材料を別々に重ねていく——まず生地、次に野菜、それから麺。広島市民はこの二つがまったく別の料理だと口をそろえて主張する。どちらも仕上げの儀式は共通だ：お好みソースをはけで塗り、キューピーをジグザクに絞り、かつお節を余熱でゆらめかせる。",
      tr: "Okonomiyaki tam anlamıyla sevdiğini pişir demektir — bu bir ad değil, bir talimattır. Osaka versiyonu iri rendelenmiş lahanayı un, soğuk dashi ve yumurtadan yapılan kalın bir hamura katarak döküm tavada kenarlar karamelize olana ve ortası kremsi kalana kadar pişirir. Domuz göbeği dilimleri çevirmeden önce üste yerleştirilir ve sıcak demir yüzeyine doğrudan temas ederek erir.\\n\\nHiroshima yorumu aynı bileşenleri ayrı katmanlar halinde düzenler — önce hamur, sonra sebzeler, ardından erişte — ve şehir sakinleri bunların tamamen farklı iki yemek olduğunu ısrarla savunur. Her iki versiyon da aynı bitirme ritüelini paylaşır: sos fırçalanır, Kewpie zikzak çizilir, katsuobushi artı ısıda dalgalanması için serpilir.",
      it: "Okonomiyaki significa letteralmente cucina ciò che ti piace — un'istruzione, non un nome. La versione di Osaka incorpora cavolo grossolanamente grattugiato in un impasto denso di farina, dashi freddo e uova, cotto in una padella di ghisa finché i bordi si caramellano e il centro resta cremoso. La pancetta va sopra prima di girare, fondendo direttamente a contatto con il ferro caldo.\\n\\nL'interpretazione di Hiroshima dispone gli stessi componenti a strati separati — prima la pastella, poi le verdure, poi i noodle — e gli abitanti della città insisteranno che si tratta di due piatti completamente diversi. Entrambe le versioni condividono il rituale finale: salsa spennellata, Kewpie a zigzag, katsuobushi sparso per ondeggiare nel calore residuo.",
      ko: "오코노미야키는 좋아하는 것을 구워라라는 뜻입니다 — 이름이 아니라 지시문입니다. 오사카 스타일은 굵게 채 썬 양배추를 밀가루, 차가운 다시, 달걀로 만든 두꺼운 반죽에 넣고 무쇠 팬에서 가장자리가 캐러멜화되고 가운데가 촉촉하게 익을 때까지 굽습니다. 삼겹살은 뒤집기 전에 위에 올려 뜨거운 팬 면에 직접 닿으며 지방이 배어나옵니다.\\n\\n히로시마 스타일은 같은 재료를 별도의 층으로 쌓아 올립니다 — 먼저 반죽, 그다음 채소, 마지막으로 면 — 이 도시 사람들은 두 음식이 완전히 다른 요리라고 주장합니다. 두 버전 모두 마무리 의식을 공유합니다: 소스를 바르고, 큐피를 지그재그로 짜고, 가쓰오부시를 뿌려 남은 열기에 일렁이게 합니다.",
      hi: "ओकोनोमियाकी का अर्थ है जो पसंद हो वह पकाओ — यह एक निर्देश है, नाम नहीं। ओसाका शैली में कद्दूकस की हुई पत्तागोभी को आटे, ठंडे दाशी और अंडे के गाढ़े बैटर में मिलाया जाता है, फिर कास्ट-आयरन पैन में तब तक पकाया जाता है जब तक किनारे कारमेल न हो जाएं और बीच का हिस्सा मलाईदार रहे। सूअर की पेट की परत पलटने से पहले ऊपर रखी जाती है, सीधे गर्म लोहे पर पिघलती है।\\n\\nहिरोशिमा की व्याख्या उन्हीं सामग्रियों को अलग-अलग परतों में लगाती है — पहले बैटर, फिर सब्जियां, फिर नूडल्स — और शहर के निवासी जोर देकर कहते हैं कि ये दो बिल्कुल अलग व्यंजन हैं। दोनों संस्करण एक ही समापन अनुष्ठान साझा करते हैं: सॉस लगाएं, क्यूपी जिग-ज़ैग में डालें, काट्सुओबुशी छिड़कें।"
    }'''

content = content.replace(old_180, new_180)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 180 done")
