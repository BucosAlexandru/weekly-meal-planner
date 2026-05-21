with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add hi to origin
content = content.replace(
    '      ko: "스리랑카"\n    },\n    name: {\n      ro: "Kottu"',
    '      ko: "스리랑카",\n      hi: "श्रीलंका"\n    },\n    name: {\n      ro: "Kottu"'
)

# Add hi to name
content = content.replace(
    '      ko: "코투"\n    },\n    category: {\n      ro: "Cină"\n    },\n    servings: 2',
    '      ko: "코투",\n      hi: "कोट्टू"\n    },\n    category: {\n      ro: "Cină"\n    },\n    servings: 2'
)

# Add hi to category — Kottu is Dinner; ja: 夕食; servings: 2
content = content.replace(
    '      ko: "저녁"\n    },\n    servings: 2,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["roti (lipie)"',
    '      ko: "저녁",\n      hi: "रात का खाना"\n    },\n    servings: 2,\n    tipType: \'meat\',\n    pairingsType: \'meat\',\n    ingredients: {\n      ro: ["roti (lipie)"'
)

# Add hi to ingredients
content = content.replace(
    '      ko: ["로티 빵", "달걀", "닭고기", "채소", "향신료", "양파", "카레 소스"]\n    },\n    howIsMade: {',
    '      ko: ["로티 빵", "달걀", "닭고기", "채소", "향신료", "양파", "카레 소스"],\n      hi: ["रोटी", "अंडे", "मुर्गी", "सब्ज़ियाँ", "मसाले", "प्याज़", "करी सॉस"]\n    },\n    howIsMade: {'
)

# Add hi to howIsMade
content = content.replace(
    '      ko: "파라타 또는 로티를 잘게 썰어 채소, 달걀과 함께 볶습니다. 고기 또는 생선을 넣고 향신료로 간을 맞춰 완성합니다."\n    },\n    originText: {\n      ro: "Kottu este',
    '      ko: "파라타 또는 로티를 잘게 썰어 채소, 달걀과 함께 볶습니다. 고기 또는 생선을 넣고 향신료로 간을 맞춰 완성합니다.",\n      hi: "पराठे या रोटी को टुकड़ों में काटें, सब्ज़ियों, अंडे और मांस या मछली के साथ तवे पर तलें, मसालों से सीज़न करें।"\n    },\n    originText: {\n      ro: "Kottu este'
)

# Replace originText
old_origin = '''    originText: {
      ro: "Kottu este o rețetă tradițională din Sri Lanka.",
      en: "Kottu is a traditional recipe from Sri Lanka.",
      es: "Kottu es una receta tradicional de Sri Lanka.",
      fr: "Kottu est une recette traditionnelle de Sri Lanka.",
      de: "Kottu ist ein traditionelles Rezept aus Sri Lanka.",
      pt: "Kottu é uma receita tradicional de Sri Lanka.",
      ru: "Котту — традиционный рецепт из Шри-Ланки.",
      ar: "كوتو هي وصفة تقليدية من سريلانكا.",
      zh: "斯里兰卡炒饼 是来自斯里兰卡的传统食谱。",
      ja: "コットゥ はスリランカの伝統的なレシピです。",
      tr: "Kottu Sri Lanka kökenli geleneksel bir tariftir.",
      it: "Kottu è una ricetta tradizionale di Sri Lanka.",
      ko: "코투는 스리랑카의 전통 요리입니다."
    }'''

new_origin = '''    originText: {
      ro: "Kottu roti este cel mai iubit street food al Sri Lankăi — un amestec de pâine roti tăiată mărunt, ouă, legume și carne de pui sau vită, prăjit pe o plită fierbinte. Sunetul metalic ritmic al cuțitelor de tocat care împart rotii în bucăți mici este banda sonoră a stradelor din Colombo și Jaffna: îl poți auzi cu zeci de metri înainte de a vedea standul.\\n\\nFelul a apărut în comunitatea tamiliană, probabil în Jaffna, ca modalitate de a reutiliza rotii rămasă. Sosul de curry este vărsat în timp ce amestecul sfârâie pe placă, dând fiecărui lot un gust ușor diferit. Servit cu o curry extra pe lateral, kottu este un festin după miezul nopții pentru nopțile târzii.",
      en: "Kottu roti is Sri Lanka's most beloved street food — a chopped mixture of roti bread, eggs, vegetables, and chicken or beef stir-fried on a hot griddle. The rhythmic metallic clang of the cleavers mincing the roti into small pieces is the soundtrack of Colombo and Jaffna streets: you hear it from dozens of metres before you see the stall.\\n\\nThe dish emerged in the Tamil community, likely in Jaffna, as a way to use leftover roti. Curry sauce is poured in as the mixture sizzles on the griddle, giving each batch a slightly different character. Served with an extra curry on the side, kottu is a fixture of late-night eating.",
      es: "El kottu roti es el street food más querido de Sri Lanka — una mezcla picada de pan roti, huevos, verduras y pollo o ternera salteada en una plancha caliente. El sonido metálico rítmico de los cuchillos troceando el roti es la banda sonora de las calles de Colombo y Jaffna: se escucha a decenas de metros antes de ver el puesto.\\n\\nEl plato surgió en la comunidad tamil, probablemente en Jaffna, como forma de aprovechar el roti sobrante. La salsa de curry se vierte mientras la mezcla chisporrotea en la plancha, dando a cada lote un carácter ligeramente diferente.",
      fr: "Le kottu roti est le street food le plus aimé du Sri Lanka — un mélange haché de pain roti, œufs, légumes et poulet ou bœuf sauté sur une plaque chaude. Le son métallique rythmique des coupereaux découpant le roti en petits morceaux est la bande-son des rues de Colombo et Jaffna : on l'entend à des dizaines de mètres avant de voir l'étal.\\n\\nLe plat est apparu dans la communauté tamoule, probablement à Jaffna, comme façon d'utiliser le roti de la veille. La sauce curry est versée pendant que le mélange grésille sur la plaque.",
      de: "Kottu Roti ist Sri Lankas beliebtestes Streetfood — eine gehackte Mischung aus Roti-Brot, Eiern, Gemüse und Hähnchen oder Rind, gebraten auf einer heißen Grillplatte. Das rhythmische metallische Klappern der Hacker, die Roti in kleine Stücke zerteilen, ist der Soundtrack der Straßen von Colombo und Jaffna: Man hört es Dutzende Meter, bevor man den Stand sieht.\\n\\nDas Gericht entstand in der tamilischen Gemeinschaft, wahrscheinlich in Jaffna, als Methode, übrig gebliebenes Roti zu verwenden. Currysauce wird dazugegossen, während die Mischung auf der Platte brutzelt.",
      pt: "O kottu roti é o street food mais amado do Sri Lanka — uma mistura picada de pão roti, ovos, legumes e frango ou boi salteados numa chapa quente. O som metálico rítmico dos fachos que picam o roti em pedaços pequenos é a banda sonora das ruas de Colombo e Jaffna: ouve-se a dezenas de metros antes de ver a barraca.\\n\\nO prato surgiu na comunidade tâmil, provavelmente em Jaffna, como forma de aproveitar o roti sobrado. O molho curry é vertido enquanto a mistura chispa na chapa.",
      ru: "Котту-роти — самая любимая уличная еда Шри-Ланки: рубленая смесь из лепёшки роти, яиц, овощей и курицы или говядины, обжаренная на горячей плите. Ритмичный металлический стук тесаков, рубящих роти на мелкие кусочки, — саундтрек улиц Коломбо и Джафны: его слышно за десятки метров до того, как увидишь лоток.\\n\\nБлюдо появилось в тамильской общине, предположительно в Джафне, как способ использовать остатки роти. Соус карри вливается, пока смесь шипит на плите.",
      ar: "كوتو روتي هو أشهر طعام الشارع في سريلانكا — خليط مفروم من خبز الروتي والبيض والخضار والدجاج أو اللحم البقري المقلي على صاج ساخن. القرع المعدني الإيقاعي لأدوات التقطيع التي تفرم الروتي إلى قطع صغيرة هو النغمة الصوتية لشوارع كولومبو وجافنا: تسمعه قبل أن ترى الكشك بعشرات الأمتار.\\n\\nظهر الطبق في المجتمع التاميلي، على الأرجح في جافنا، كطريقة لاستخدام الروتي المتبقي.",
      zh: "科图罗提是斯里兰卡最受欢迎的街头食品——将罗提饼切碎后与鸡蛋、蔬菜和鸡肉或牛肉在热铁板上翻炒。剁切罗提时刀具碰撞发出的节奏性金属声是科伦坡和贾夫纳街道的标志音：在看到摊位的几十米前就能听到。\\n\\n这道菜起源于泰米尔社区，可能在贾夫纳，最初是利用剩余罗提的方式。翻炒时倒入咖喱酱，使每份都带有独特风味。附上一份咖喱作为佐餐，科图是深夜宵夜的代名词。",
      ja: "コットゥ・ロティはスリランカ最愛のストリートフードです——ロティパンを刻み、卵、野菜、鶏肉や牛肉と一緒に熱い鉄板で炒めた料理。ロティを細かく刻む包丁の規則的な金属音は、コロンボやジャフナの通りの音風景。数十メートル手前から聞こえてきます。\\n\\nこの料理はタミル系コミュニティで生まれ、おそらくジャフナで余ったロティを使うために考案されました。カレーソースを加えながら鉄板で炒め、深夜の屋台料理の定番として親しまれています。",
      tr: "Kottu roti, Sri Lanka'nın en sevilen sokak yemeğidir — roti ekmeği, yumurta, sebzeler ve tavuk ya da sığır etinin kıyılarak sıcak bir tavada karıştırılmasıyla hazırlanır. Rotiyi küçük parçalara bölen zırhların ritmik metal sesi, Kolombo ve Jaffna sokaklarının müziğidir: tezgâhı görmeden onlarca metre önce duyarsınız.\\n\\nYemek, Tamil topluluğunda muhtemelen Jaffna'da, artık rotileri değerlendirmek amacıyla ortaya çıkmıştır. Karışım tavada cızırdadıkça içine köri sosu dökülerek her porsiyona kendine özgü bir karakter kazandırılır.",
      it: "Il kottu roti è lo street food più amato dello Sri Lanka — un mix tritato di pane roti, uova, verdure e pollo o manzo saltato su una piastra rovente. Il suono metallico ritmico dei coltelli che sminuzzano il roti in piccoli pezzi è la colonna sonora delle strade di Colombo e Jaffna: si sente a decine di metri prima di vedere il banco.\\n\\nIl piatto è nato nella comunità tamil, probabilmente a Jaffna, come modo di riutilizzare il roti avanzato. La salsa al curry viene versata mentre il composto sfrigola sulla piastra.",
      ko: "코투 로티는 스리랑카에서 가장 사랑받는 길거리 음식입니다. 로티 빵을 잘게 썰어 달걀, 채소, 닭고기 또는 소고기와 함께 뜨거운 철판에 볶아 만듭니다. 로티를 잘게 다지는 칼의 리드미컬한 금속 소리는 콜롬보와 자프나 거리의 배경음입니다. 가판대를 보기 수십 미터 전부터 들려옵니다.\\n\\n이 요리는 타밀 커뮤니티에서, 아마도 자프나에서 남은 로티를 활용하는 방법으로 생겨났습니다. 철판 위에서 지글거리는 동안 카레 소스를 부어 매번 독특한 맛을 냅니다.",
      hi: "कोट्टू रोटी श्रीलंका का सबसे प्रिय स्ट्रीट फूड है — रोटी की रोटी, अंडे, सब्ज़ियाँ और मुर्गी या गोमांस को गर्म तवे पर काटकर भूना जाता है। रोटी को छोटे टुकड़ों में काटते चाकू की लयबद्ध धातुई आवाज़ कोलंबो और जाफना की गलियों की पहचान है — स्टॉल देखने से दसियों मीटर पहले ही सुनाई देती है।\\n\\nयह व्यंजन तमिल समुदाय में, संभवतः जाफना में, बची हुई रोटी के उपयोग के रूप में उभरा। मिश्रण के तवे पर सीज़ते समय करी सॉस डाली जाती है। करी के साथ परोसा जाने वाला यह व्यंजन देर रात खाने का प्रतीक है।"
    }'''

content = content.replace(old_origin, new_origin)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("ID 124 done")
