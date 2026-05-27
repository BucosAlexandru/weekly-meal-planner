#!/usr/bin/env python3
"""Rewrite recipe 213 (Mango Sticky Rice):
- Compact howIsMade to 5 compound steps in all 14 languages (Tempura model)
- Add 4 recipe-specific featureCards in all 14 languages
- Preserve all other fields (id, servings, tipType, pairingsType, nutrition,
  origin, name, category, ingredients)
"""
import re, sys

LANGS = ['ro','en','es','fr','de','pt','ru','ar','zh','ja','tr','it','ko','hi']

HOWISMADE = {
'en': "Drain the soaked rice; line a steamer basket with cheesecloth or banana leaf, tip in the rice and steam covered over a moderate boil for 20–25 minutes, lifting the cloth halfway to flip the mound so it cooks evenly — done when the grains are translucent, glossy and chewy-tender all the way through. While the rice steams, warm 300 ml of the coconut milk in a small saucepan with the palm sugar, salt and pandan leaf, stirring just enough to dissolve the sugar without bringing it to a boil; reserve the remaining 100 ml for the salty topping. When the rice comes hot off the steamer, tip it into a wide bowl, fold through two-thirds of the warm sweet coconut milk with a spatula until each grain glistens, then cover and rest 15–20 minutes so the rice drinks the milk and swells to a soft pearl-pudding consistency. For the salty topping, simmer the remaining 100 ml coconut milk with a generous pinch of salt and the teaspoon of rice flour for 2 minutes, just until it thickens lightly. Mound the warm coconut rice on a plate with the mango slices alongside, drizzle the salty coconut cream across the top, scatter toasted sesame seeds or split mung beans, and eat with a spoon, a little rice and a little mango in every bite — warm coconut-sweet against cool fruit-sharp is the dish itself.",

'ro': "Scurge orezul înmuiat; căptușește un coș de aburi cu tifon sau frunză de banan, varsă orezul și aburește-l acoperit la fierbere moderată 20–25 de minute, ridicând pânza la jumătatea timpului ca să întorci muntele de orez să se gătească uniform — gata când boabele sunt translucide, lucioase și moi-elastice pe toată întinderea. Cât aburește orezul, încălzește 300 ml din laptele de cocos într-o crăticioară mică împreună cu zahărul de palmier, sarea și frunza de pandan, amestecând doar cât să dizolvi zahărul fără să-l fierbi; rezervă cei 100 ml rămași pentru topping-ul sărat. Când orezul iese fierbinte din aburitoare, mută-l într-un bol larg, învârte cu o spatulă două treimi din laptele cald și dulce până când fiecare bob este lucios, apoi acoperă și lasă-l să stea 15–20 de minute ca să soarbă laptele și să se umfle la consistența unei budinci moi de perle. Pentru topping-ul sărat, fierbe cei 100 ml rămași de lapte de cocos cu un praf generos de sare și lingurița de făină de orez 2 minute, doar până se îngroașă ușor. Pune orezul cald de cocos pe o farfurie sub formă de movilă, alături feliile de mango, picură smântâna sărată de cocos peste, presară semințe de susan prăjite sau mazăre mungo decojită, și mănâncă-l cu lingura, puțin orez și puțin mango la fiecare gură — cocosul cald-dulce contra fructului rece-tăios este preparatul însuși.",

'es': "Escurre el arroz remojado; forra una cesta vaporera con muselina o una hoja de banano, vuelca el arroz dentro y cuece tapado a hervor moderado durante 20–25 minutos, levantando el paño a mitad de cocción para voltear el montón y que se cocine de forma uniforme — listo cuando los granos están translúcidos, brillantes y de masticado tierno hasta el centro. Mientras el arroz se cuece, calienta 300 ml de la leche de coco en un cazo con el azúcar de palma, la sal y la hoja de pandan, removiendo apenas para disolver el azúcar sin que llegue a hervir; reserva los 100 ml restantes para el topping salado. Cuando el arroz salga caliente del vapor, pásalo a un bol amplio, envuelve con espátula dos tercios de la leche tibia y dulce hasta que cada grano brille, luego tapa y deja reposar 15–20 minutos para que el arroz se beba la leche y se hinche hasta consistencia de pudin de perlas. Para el topping salado, calienta los 100 ml restantes con una pizca generosa de sal y la cucharadita de harina de arroz durante 2 minutos, justo hasta que espese ligeramente. Monta el arroz tibio en plato con las rodajas de mango al lado, riega la crema salada por encima, esparce semillas de sésamo tostadas o judías mung partidas, y cómelo con cuchara, un poco de arroz y un poco de mango en cada bocado — el coco cálido y dulce contra la fruta fresca y filo es el plato mismo.",

'fr': "Égouttez le riz trempé ; tapissez un panier vapeur d'une mousseline ou d'une feuille de bananier, versez-y le riz et faites cuire à couvert au-dessus d'une eau bouillante modérée pendant 20 à 25 minutes, en soulevant le linge à mi-cuisson pour retourner le monticule afin qu'il cuise uniformément — prêt quand les grains sont translucides, brillants et fondants jusqu'au cœur. Pendant que le riz cuit, faites tiédir 300 ml du lait de coco dans une petite casserole avec le sucre de palme, le sel et la feuille de pandan, en remuant juste assez pour dissoudre le sucre sans le faire bouillir ; réservez les 100 ml restants pour la garniture salée. Quand le riz sort chaud du cuit-vapeur, versez-le dans un grand saladier, enrobez à la spatule les deux tiers du lait sucré tiède jusqu'à ce que chaque grain brille, puis couvrez et laissez reposer 15 à 20 minutes pour que le riz boive le lait et gonfle jusqu'à la texture d'un pudding aux perles. Pour la garniture salée, faites frémir les 100 ml restants avec une bonne pincée de sel et la cuillère à café de farine de riz pendant 2 minutes, juste jusqu'à ce qu'il épaississe légèrement. Déposez le riz chaud en monticule sur une assiette avec les tranches de mangue à côté, nappez la crème de coco salée par-dessus, parsemez de graines de sésame torréfiées ou de haricots mungo décortiqués, et mangez à la cuillère, un peu de riz et un peu de mangue à chaque bouchée — le contraste du coco chaud-sucré et du fruit frais-tranchant, c'est le plat lui-même.",

'de': "Den eingeweichten Reis abgießen; einen Dämpfkorb mit Mulltuch oder Bananenblatt auslegen, den Reis hineingeben und über mäßig kochendem Wasser zugedeckt 20–25 Minuten dämpfen, dabei nach der Hälfte der Zeit das Tuch anheben und den Reishaufen wenden, damit er gleichmäßig gart — fertig, wenn die Körner durchscheinend, glänzend und durchgehend zart-bissfest sind. Während der Reis dämpft, erwärmen Sie 300 ml der Kokosmilch in einem kleinen Topf mit Palmzucker, Salz und Pandanblatt und rühren Sie gerade so viel um, dass sich der Zucker auflöst, ohne dass die Milch kocht; die restlichen 100 ml für die salzige Sauce zurückbehalten. Wenn der Reis heiß aus dem Dämpfer kommt, in eine breite Schüssel umfüllen und zwei Drittel der warmen süßen Kokosmilch mit einem Teigschaber unterheben, bis jedes Korn glänzt, dann abdecken und 15–20 Minuten ruhen lassen, damit der Reis die Milch aufsaugt und auf die Konsistenz eines weichen Perlenpuddings anschwillt. Für die salzige Sauce die restlichen 100 ml Kokosmilch mit einer großzügigen Prise Salz und dem Teelöffel Reismehl 2 Minuten köcheln, gerade bis sie leicht andickt. Den warmen Kokosreis als Hügel auf einen Teller setzen, die Mangoscheiben daneben anrichten, die salzige Kokoscreme darüber träufeln, mit gerösteten Sesamsamen oder geschälten Mungobohnen bestreuen und mit dem Löffel essen, in jedem Bissen ein wenig Reis und ein wenig Mango — der Kontrast aus warm-süßer Kokosmilch und kühl-scharfer Frucht ist das eigentliche Gericht.",

'pt': "Escorra o arroz demolhado; forre um cesto a vapor com gaze ou folha de bananeira, deite o arroz lá dentro e coza tapado sobre uma fervura moderada durante 20–25 minutos, levantando o pano a meio da cozedura para virar o monte para cozer uniformemente — pronto quando os grãos estão translúcidos, brilhantes e tenros até ao centro. Enquanto o arroz coze, aqueça 300 ml do leite de coco numa caçarola pequena com o açúcar de palma, o sal e a folha de pandan, mexendo apenas o suficiente para dissolver o açúcar sem deixar ferver; reserve os 100 ml restantes para a cobertura salgada. Quando o arroz sair quente do vaporizador, transfira-o para uma taça larga, envolva à espátula dois terços do leite morno e doce até cada grão estar brilhante, depois tape e deixe descansar 15–20 minutos para o arroz beber o leite e inchar até à consistência de um pudim macio de pérolas. Para a cobertura salgada, deixe ferver os 100 ml restantes com uma boa pitada de sal e a colher de chá de farinha de arroz durante 2 minutos, apenas até engrossar ligeiramente. Disponha o arroz morno em monte num prato com as fatias de manga ao lado, regue por cima as natas salgadas de coco, polvilhe com sementes de sésamo tostadas ou feijão mungo descascado, e coma à colher, um pouco de arroz e um pouco de manga em cada garfada — o contraste entre o coco quente-doce e a fruta fresca-afiada é o próprio prato.",

'ru': "Слейте воду с замоченного риса; выстелите пароварку марлей или банановым листом, всыпьте рис и варите под крышкой над умеренно кипящей водой 20–25 минут, на середине времени поднимая ткань, чтобы перевернуть рисовую гору и она пропарилась равномерно — готово, когда зёрна полупрозрачные, блестящие и упруго-нежные насквозь. Пока рис варится, нагрейте 300 мл кокосового молока в небольшой кастрюле с пальмовым сахаром, солью и листом пандана, помешивая ровно столько, чтобы растворить сахар и не довести до кипения; оставшиеся 100 мл оставьте для солёной заливки. Когда рис будет горячим из пароварки, переложите его в широкую миску, лопаткой вмешайте две трети тёплого сладкого кокосового молока, пока каждое зёрнышко не заблестит, затем накройте и оставьте на 15–20 минут, чтобы рис впитал молоко и набух до консистенции мягкого жемчужного пудинга. Для солёной заливки потомите оставшиеся 100 мл кокосового молока с щедрой щепоткой соли и чайной ложкой рисовой муки 2 минуты, пока заливка слегка не загустеет. Выложите тёплый кокосовый рис горкой на тарелку с ломтиками манго рядом, полейте сверху солёным кокосовым кремом, посыпьте жареным кунжутом или лущёным машем и ешьте ложкой, по немного риса и манго в каждый кусок — контраст тёплой кокосовой сладости и прохладного резкого фрукта и есть это блюдо.",

'ar': "صفّ الأرز المنقوع؛ غطّ سلة البخار بشاش أو ورق موز، اسكب الأرز فيها واتركها مغطاة فوق ماء يغلي معتدل لمدة 20–25 دقيقة، رافعاً القماش في منتصف الوقت لتقلب كومة الأرز كي تنضج بانتظام — جاهز حين تصبح الحبوب شفافة، لامعة، ومطّاطية-طرية حتى المنتصف. أثناء طهي الأرز، سخّن 300 مل من حليب جوز الهند في قدر صغير مع سكر النخيل والملح وورقة الباندان، حرّك بما يكفي فقط لإذابة السكر دون أن يغلي؛ احتفظ بالـ 100 مل المتبقية للصلصة المالحة. حين يخرج الأرز ساخناً من المُبخّر، انقله إلى وعاء واسع، قلّب ثلثَي حليب جوز الهند الحلو الدافئ بملعقة حتى يلمع كل حبة، ثم غطّه واتركه يرتاح 15–20 دقيقة كي يشرب الأرز الحليب وينتفخ إلى قوام بودنغ لؤلؤي ناعم. للصلصة المالحة، اطهُ الـ 100 مل المتبقية من حليب جوز الهند مع رشّة سخية من الملح وملعقة صغيرة من دقيق الأرز لدقيقتين، فقط حتى تثخن قليلاً. اكوِم الأرز الدافئ على طبق مع شرائح المانجو إلى جانبه، اسكب الكريمة المالحة فوقه، انثر بذور السمسم المحمّصة أو فاصولياء المونغ المقشّرة، وكل بالملعقة، قليلاً من الأرز وقليلاً من المانجو في كل قضمة — التباين بين دفء وحلاوة جوز الهند وحدّة وبرودة الفاكهة هو الطبق نفسه.",

'zh': "把泡好的糯米沥干。在蒸笼里铺一层纱布或香蕉叶，倒入糯米，盖好在中等火候的水蒸气上蒸 20–25 分钟，蒸到一半时掀起纱布把整堆米翻过来让它均匀受热——米粒呈半透明、有光泽、从外到内都软而有嚼劲时即成。蒸米的同时，把 300 毫升椰奶、棕榈糖、盐和打结的斑斓叶放入小锅加热，只需搅到糖化即可，不要烧开；剩下的 100 毫升留作咸味顶料。米蒸好后趁热倒入宽口碗中，把三分之二的温热甜椰奶用刮刀轻轻拌入，直到每粒发亮，盖好静置 15–20 分钟，让米把椰奶喝进去，膨胀至柔软的珍珠布丁般质感。咸味顶料：把剩下的 100 毫升椰奶、慷慨一撮盐和 1 茶匙米粉小火煮 2 分钟，刚刚开始变稠即可。把热腾腾的椰香糯米堆在盘子上，旁边摆放芒果片，淋上咸椰浆，再撒一把烤香的白芝麻或去壳绿豆，用勺子吃，每一口都带一点糯米和一点芒果——热的椰香甜与凉的果酸利之间那种对照，本身就是这道菜。",

'ja': "浸したもち米の水を切る。蒸し器のかごにさらしかバナナの葉を敷き、もち米を入れて、しっかり蒸気が立った状態で蓋をして 20〜25 分蒸す——蒸し時間の半ばに布を持ち上げて米の山をひっくり返し均一に火を通す；米粒が半透明で艶があり、芯までもちっと柔らかくなったら完成。米を蒸している間に、ココナッツミルク 300 ml を小鍋に入れ、パームシュガー、塩、結んだパンダンリーフを加え、砂糖が溶ける程度に混ぜる——沸騰させない；残りの 100 ml は塩気の仕上げ用にとっておく。蒸しあがった熱々のもち米を広めの器に移し、温かい甘いココナッツミルクの 3 分の 2 をヘラで折りたたむように混ぜてすべての粒が艶を帯びるまで仕上げ、蓋をして 15〜20 分置く——米がミルクを飲み、柔らかなパールプディングのような食感まで膨らむ。塩気の仕上げソースには、残りの 100 ml のココナッツミルクを塩ひとつまみたっぷりと小さじ 1 の米粉と一緒に 2 分煮る、ちょうど少しとろみがつくまで。温かいココナッツライスを皿に山型に盛り、横にマンゴーのスライスを並べ、塩気のあるココナッツクリームを上から回しかけ、ローストしたごまや剥いた緑豆を散らし、スプーンでひと口ごとに少しのご飯と少しのマンゴーを一緒に食べる——温かいココナッツの甘さと冷たい果実の鋭さの対比、それこそが料理本体だ。",

'tr': "Islatılmış pirincin suyunu süz; buhar sepetini tülbentle veya muz yaprağıyla kapla, pirinci içine dök ve kaynayan suyun üzerinde kapağı kapalı olarak 20–25 dakika buğula, sürenin ortasında bezi kaldırıp pirinç tepesini ters çevirip eşit pişmesini sağla — taneler şeffaf, parlak ve içine kadar yumuşak-çıtır olduğunda hazır. Pirinç pişerken küçük bir tencerede 300 ml hindistan cevizi sütünü palmiye şekeri, tuz ve düğümlü pandan yaprağıyla ısıt, şeker eriyene kadar — kaynamadan — karıştır; kalan 100 ml'yi tuzlu üst sos için sakla. Pirinç buharlıdan çıkar çıkmaz geniş bir kâseye al, ılık tatlı hindistan cevizi sütünün üçte ikisini spatulayla katlayarak her tane parlayana kadar karıştır, sonra üstünü ört ve 15–20 dakika dinlendir — pirinç sütü içer ve yumuşak inci pudingi kıvamına kadar şişer. Tuzlu üst sos için kalan 100 ml hindistan cevizi sütünü cömert bir tutam tuz ve 1 çay kaşığı pirinç unu ile 2 dakika kaynat, sadece hafifçe koyulaşacak kadar. Ilık hindistan cevizi pirincini bir tabağa tepe gibi koy, yanına mango dilimlerini diz, üstüne tuzlu hindistan cevizi kremasını gezdir, kavrulmuş susam ya da kabuğu soyulmuş mung fasulyesi serp, kaşıkla — her lokmada biraz pirinç ve biraz mango — ye, ılık-tatlı hindistan cevizi ile serin-keskin meyvenin arasındaki karşıtlık, yemeğin ta kendisidir.",

'it': "Scolate il riso ammollato; foderate un cestello di una vaporiera con mussola o foglia di banano, versate il riso e cuocete coperto sopra un'ebollizione moderata per 20–25 minuti, sollevando il telo a metà cottura per girare il cumulo di riso in modo che cuocia in modo uniforme — pronto quando i chicchi sono traslucidi, lucidi e morbidi-elastici fino al centro. Mentre il riso cuoce, scaldate 300 ml del latte di cocco in un pentolino con lo zucchero di palma, il sale e la foglia di pandano annodata, mescolando il giusto per sciogliere lo zucchero senza farlo bollire; tenete da parte i 100 ml restanti per la copertura salata. Quando il riso esce caldo dalla vaporiera, trasferitelo in una ciotola larga, incorporate con una spatola due terzi del latte di cocco dolce e tiepido fino a rendere ogni chicco lucido, poi coprite e lasciate riposare 15–20 minuti perché il riso beva il latte e si gonfi fino a una consistenza di morbido budino di perle. Per la copertura salata, fate sobbollire i 100 ml restanti di latte di cocco con una presa generosa di sale e il cucchiaino di farina di riso per 2 minuti, giusto fino a quando non si addensa leggermente. Disponete il riso caldo a monticello su un piatto con le fette di mango accanto, versate sopra la crema di cocco salata, spolverate con semi di sesamo tostati o fagioli mungo decorticati, e mangiate con il cucchiaio, un po' di riso e un po' di mango in ogni boccone — il contrasto tra il cocco caldo-dolce e la frutta fresca-tagliente è il piatto stesso.",

'ko': "불린 찹쌀의 물기를 빼고, 찜기 바구니에 소창이나 바나나 잎을 깔고 찹쌀을 부어 중간 강도로 끓는 물 위에서 뚜껑을 덮고 20–25분간 찐다 — 중간쯤에 천을 들어 올려 쌀 더미를 뒤집어 고르게 익게 한다; 알알이 반투명하고 윤기 있게 빛나며 속까지 쫄깃-부드러우면 완성. 찹쌀이 쪄지는 동안, 작은 냄비에 코코넛 밀크 300 ml, 팜 슈가, 소금, 매듭지은 판단 잎을 넣어 데우되, 끓이지 말고 설탕이 녹을 정도까지만 저어준다; 남은 100 ml는 짭짤한 토핑용으로 따로 둔다. 찹쌀이 찜기에서 뜨거울 때 넓은 볼로 옮기고, 따뜻한 단 코코넛 밀크의 3분의 2를 주걱으로 접듯이 섞어 모든 알갱이가 윤기 나게 한 뒤, 덮어 15–20분 동안 두어 찹쌀이 밀크를 들이마시고 부드러운 진주 푸딩 같은 식감까지 부풀어 오르게 한다. 짭짤한 토핑은 남은 100 ml 코코넛 밀크에 소금 한 꼬집을 넉넉히, 그리고 쌀가루 1작은술을 함께 넣고 2분간, 살짝 농도가 잡힐 정도로만 졸인다. 따뜻한 코코넛 찹밥을 접시에 봉긋이 올리고 옆에 망고 슬라이스를 가지런히 놓고, 위에 짭짤한 코코넛 크림을 둘러주고, 구운 참깨나 깐 녹두를 흩뿌려, 숟가락으로 — 한 입마다 찹밥 조금과 망고 조금을 함께 — 먹는다; 따뜻한 코코넛의 단맛과 차가운 과일의 날카로움, 그 대비가 이 요리 자체다.",

'hi': "भिगोए हुए चावल छानें। एक स्टीमर की टोकरी में मसलिन कपड़ा या केले का पत्ता बिछाएँ, चावल उसमें डालें, और मध्यम उबाल पर ढक कर 20–25 मिनट तक भाप दें, आधे समय पर कपड़ा उठा कर चावल के ढेर को पलट दें ताकि एकसमान पके — दाने जब पारदर्शी, चमकदार और भीतर तक चबाने-योग्य नर्म हों, तब तैयार। जब चावल भाप में हो, एक छोटे पैन में 300 मिली नारियल का दूध, ताड़ की चीनी, नमक और गाँठ बँधे पंडान पत्ते को गरम करें, बस इतना चलाएँ कि चीनी घुल जाए — उबलने न दें; बचे हुए 100 मिली को नमकीन टॉपिंग के लिए अलग रखें। जब चावल भाप से निकले-निकले गरम हो, उसे एक चौड़े बाउल में पलटें, स्पैटुला से दो-तिहाई गरम मीठा नारियल दूध मिलाएँ कि हर दाना चमकदार हो जाए, फिर ढक कर 15–20 मिनट छोड़ दें ताकि चावल दूध को पी ले और नर्म पर्ल पुडिंग जैसी बनावट तक फूल जाए। नमकीन टॉपिंग के लिए, बचे 100 मिली नारियल दूध को एक भरी चुटकी नमक और 1 छोटा चम्मच चावल के आटे के साथ 2 मिनट तक, बस हल्का गाढ़ा होने तक उबालें। गरम नारियल वाले चावल को प्लेट पर ढेर बना कर रखें, बग़ल में आम के टुकड़े सजाएँ, ऊपर से नमकीन नारियल क्रीम डालें, भुने तिल या छिली मूँग दाल छिड़कें, और चम्मच से — हर निवाले में थोड़ा चावल और थोड़ा आम — खाएँ; गरम नारियल की मिठास और ठंडे फल की धार के बीच का यह कंट्रास्ट ही यह व्यंजन है।",
}

FEATURE_CARDS = {
'en': '[{icon:"🍚", t:"Thai sticky rice", d:"Glutinous variety that holds its shape after steaming"}, {icon:"🥭", t:"Nam Dok Mai mango", d:"Ripe yellow Thai variety — the traditional pairing"}, {icon:"🥥", t:"Two-thirds, one-third", d:"Sweet coconut on the rice; salty topping over the top"}, {icon:"⏱️", t:"15-minute rest", d:"The key step — rice drinks the milk into pearl pudding"}]',
'ro': '[{icon:"🍚", t:"Orez glutinos thailandez", d:"Soiul lipicios care își păstrează forma după aburire"}, {icon:"🥭", t:"Mango Nam Dok Mai", d:"Soi thailandez galben copt — perechea tradițională"}, {icon:"🥥", t:"Două treimi, o treime", d:"Cocos dulce în orez; topping sărat peste"}, {icon:"⏱️", t:"15 minute de odihnit", d:"Pasul cheie — orezul soarbe laptele în budincă de perle"}]',
'es': '[{icon:"🍚", t:"Arroz glutinoso tailandés", d:"Variedad pegajosa que mantiene su forma al vapor"}, {icon:"🥭", t:"Mango Nam Dok Mai", d:"Variedad tailandesa amarilla madura — pareja tradicional"}, {icon:"🥥", t:"Dos tercios, un tercio", d:"Coco dulce en el arroz; topping salado por encima"}, {icon:"⏱️", t:"15 minutos de reposo", d:"Paso clave — el arroz bebe la leche en pudin de perlas"}]',
'fr': '[{icon:"🍚", t:"Riz gluant thaï", d:"Variété qui garde sa forme à la vapeur"}, {icon:"🥭", t:"Mangue Nam Dok Mai", d:"Variété thaï jaune mûre — accord traditionnel"}, {icon:"🥥", t:"Deux tiers, un tiers", d:"Coco sucré dans le riz ; garniture salée au-dessus"}, {icon:"⏱️", t:"15 minutes de repos", d:"Étape clé — le riz boit le lait en pudding de perles"}]',
'de': '[{icon:"🍚", t:"Thai-Klebreis", d:"Glutinose Sorte, behält ihre Form beim Dämpfen"}, {icon:"🥭", t:"Nam-Dok-Mai-Mango", d:"Reife gelbe Thai-Sorte — die traditionelle Kombination"}, {icon:"🥥", t:"Zwei Drittel, ein Drittel", d:"Süßes Kokos in den Reis; salzige Sauce darüber"}, {icon:"⏱️", t:"15 Minuten Ruhe", d:"Schlüsselschritt — Reis trinkt Milch zu Perlenpudding"}]',
'pt': '[{icon:"🍚", t:"Arroz glutinoso tailandês", d:"Variedade pegajosa que mantém a forma a vapor"}, {icon:"🥭", t:"Manga Nam Dok Mai", d:"Variedade tailandesa amarela madura — par tradicional"}, {icon:"🥥", t:"Dois terços, um terço", d:"Coco doce no arroz; cobertura salgada por cima"}, {icon:"⏱️", t:"15 minutos de descanso", d:"Passo-chave — arroz bebe o leite num pudim de pérolas"}]',
'ru': '[{icon:"🍚", t:"Тайский клейкий рис", d:"Сорт, сохраняющий форму после приготовления на пару"}, {icon:"🥭", t:"Манго Нам Док Май", d:"Спелый жёлтый тайский сорт — традиционная пара"}, {icon:"🥥", t:"Две трети, одна треть", d:"Сладкий кокос в рис; солёная заливка сверху"}, {icon:"⏱️", t:"15 минут отдыха", d:"Ключевой шаг — рис впитывает молоко до пудинга"}]',
'ar': '[{icon:"🍚", t:"الأرز الدبق التايلاندي", d:"صنف يحافظ على شكله بعد التبخير"}, {icon:"🥭", t:"مانجو نام دوك ماي", d:"صنف تايلاندي أصفر ناضج — التزاوج التقليدي"}, {icon:"🥥", t:"الثلثان والثلث", d:"جوز هند حلو في الأرز؛ صلصة مالحة فوقه"}, {icon:"⏱️", t:"15 دقيقة راحة", d:"الخطوة الأساسية — الأرز يشرب الحليب إلى بودنغ لؤلؤي"}]',
'zh': '[{icon:"🍚", t:"泰国糯米", d:"蒸后仍保持饱满形状的糯性品种"}, {icon:"🥭", t:"南独麦芒果", d:"成熟的黄色泰国品种 — 传统搭配"}, {icon:"🥥", t:"三分之二与三分之一", d:"甜椰奶拌入米；咸椰浆淋顶"}, {icon:"⏱️", t:"静置 15 分钟", d:"关键一步 — 米把椰奶喝进去成珍珠布丁"}]',
'ja': '[{icon:"🍚", t:"タイのもち米", d:"蒸しても形を保つ粘りある品種"}, {icon:"🥭", t:"ナムドクマイマンゴー", d:"完熟の黄色いタイ品種 — 伝統の組み合わせ"}, {icon:"🥥", t:"3 分の 2 と 3 分の 1", d:"甘いココナッツは米に、塩のソースは上に"}, {icon:"⏱️", t:"15 分の蒸らし", d:"要の工程 — 米がミルクを吸い、パールプディングに"}]',
'tr': '[{icon:"🍚", t:"Tay yapışkan pirinci", d:"Buharda şeklini koruyan glutinöz çeşit"}, {icon:"🥭", t:"Nam Dok Mai mangosu", d:"Olgun sarı Tay çeşidi — geleneksel eşleşme"}, {icon:"🥥", t:"İki üçte iki, bir üçte bir", d:"Tatlı hindistan cevizi pirince; tuzlu sos üste"}, {icon:"⏱️", t:"15 dakika dinlenme", d:"Kritik adım — pirinç sütü içip inci pudingine döner"}]',
'it': '[{icon:"🍚", t:"Riso glutinoso thai", d:"Varietà che mantiene la forma dopo la cottura a vapore"}, {icon:"🥭", t:"Mango Nam Dok Mai", d:"Varietà thai gialla matura — l\'accoppiamento tradizionale"}, {icon:"🥥", t:"Due terzi, un terzo", d:"Cocco dolce nel riso; copertura salata sopra"}, {icon:"⏱️", t:"15 minuti di riposo", d:"Passaggio chiave — il riso beve il latte in budino di perle"}]',
'ko': '[{icon:"🍚", t:"태국 찹쌀", d:"쪄도 모양을 유지하는 찰진 품종"}, {icon:"🥭", t:"남독마이 망고", d:"잘 익은 노란 태국 품종 — 전통 조합"}, {icon:"🥥", t:"3분의 2와 3분의 1", d:"단 코코넛은 밥에, 짠 토핑은 위에"}, {icon:"⏱️", t:"15분 휴지", d:"핵심 단계 — 쌀이 밀크를 마셔 진주 푸딩으로"}]',
'hi': '[{icon:"🍚", t:"थाई चिपचिपा चावल", d:"भाप के बाद भी आकार बनाए रखने वाली ग्लूटिनस किस्म"}, {icon:"🥭", t:"नाम डोक माई आम", d:"पका हुआ पीला थाई किस्म — पारंपरिक जोड़ी"}, {icon:"🥥", t:"दो-तिहाई, एक-तिहाई", d:"मीठा नारियल चावल में; नमकीन टॉपिंग ऊपर"}, {icon:"⏱️", t:"15 मिनट विश्राम", d:"मुख्य चरण — चावल दूध पीकर पर्ल पुडिंग बनता है"}]',
}

# Read recipes.js
src = open('public/js/recipes.js', encoding='utf-8').read()

# Find recipe 213 boundaries
m = re.search(r'^\s*\{\s*\n\s*id:\s*213,', src, re.M)
rec_start = m.start()
depth = 0; i = rec_start
while i < len(src):
    if src[i] == '{': depth += 1
    elif src[i] == '}':
        depth -= 1
        if depth == 0: rec_end = i + 1; break
    i += 1
recipe_block = src[rec_start:rec_end]

# Find howIsMade block inside recipe 213
hm_match = re.search(r'(\s*)howIsMade:\s*\{', recipe_block)
hm_indent_match = re.match(r'(\s*)', hm_match.group(0))
hm_start = hm_match.start()
hm_inner_start = hm_match.end() - 1  # position of `{`
depth = 0; i = hm_inner_start
while i < len(recipe_block):
    if recipe_block[i] == '{': depth += 1
    elif recipe_block[i] == '}':
        depth -= 1
        if depth == 0: hm_inner_end = i + 1; break
    i += 1
# Find what follows (comma, closing brace, etc.)
after_hm = recipe_block[hm_inner_end:]
# Check if there's a comma immediately after
trailing_comma_match = re.match(r'(\s*,)?(\s*)', after_hm)
trailing = trailing_comma_match.group(0) if trailing_comma_match else ''

# Determine indent for keys
indent_inner = '      '  # standard 6-space indent for nested keys

# Build new howIsMade block
def js_str(s):
    # JS double-quoted string: escape backslashes and double quotes
    return '"' + s.replace('\\', '\\\\').replace('"', '\\"') + '"'

how_lines = ['howIsMade: {']
for lc in LANGS:
    how_lines.append(f'      {lc}: {js_str(HOWISMADE[lc])},')
how_lines.append('    }')
new_howismade = '\n'.join(how_lines)

# Build featureCards block
fc_lines = ['featureCards: {']
for lc in LANGS:
    fc_lines.append(f'      {lc}: {FEATURE_CARDS[lc]},')
fc_lines.append('    }')
new_featurecards = '\n'.join(fc_lines)

# Compose new recipe block: replace howIsMade + insert featureCards after it
# Get text before howIsMade in recipe_block
before_hm = recipe_block[:hm_start].rstrip()
# Build new tail: howIsMade,\n    featureCards\n  }  (closing of recipe)
new_recipe_block = (
    before_hm + '\n    ' + new_howismade + ',\n    ' + new_featurecards + '\n  }'
)

# Replace in source
new_src = src[:rec_start] + new_recipe_block + src[rec_end:]

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(new_src)

print(f"Recipe 213 rewritten:")
print(f"  Old block: {rec_end - rec_start} chars")
print(f"  New block: {len(new_recipe_block)} chars")
print(f"  howIsMade: 5 steps × {len(LANGS)} langs")
print(f"  featureCards: 4 cards × {len(LANGS)} langs (added)")
