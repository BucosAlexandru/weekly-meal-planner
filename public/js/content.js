/* content.js – Recipe food photos. Static map (no API calls at runtime).
   Images sourced from Spoonacular and Wikipedia Commons.
*/
(function () {
  'use strict';

  const h1 = document.querySelector('h1');
  if (!h1) return;
  const recipeName = h1.textContent.trim();
  if (!recipeName) return;

  // ── Static image map (pre-fetched at build time) ──────────────
  const IMG = {
  "adobo": "https://img.spoonacular.com/recipes/638741-312x231.jpg",
  "amok": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Fish_Amok_with_Rice.jpg/960px-Fish_Amok_with_Rice.jpg",
  "arepa": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Arepitas_Food_Macro.jpg/330px-Arepitas_Food_Macro.jpg",
  "arroz chaufa": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Arroz_Chaufa_%28266361654%29.jpg/500px-Arroz_Chaufa_%28266361654%29.jpg",
  "bacalhau à brás": "https://img.spoonacular.com/recipes/633251-312x231.jpg",
  "baklava": "https://img.spoonacular.com/recipes/631783-312x231.jpg",
  "bandeja paisa": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Bandeja_paisa%2C_plato_de_mi_tierra.jpg/500px-Bandeja_paisa%2C_plato_de_mi_tierra.jpg",
  "banh mi": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/B%C3%A1nh_m%C3%AC_th%E1%BB%8Bt_n%C6%B0%E1%BB%9Bng.jpg/500px-B%C3%A1nh_m%C3%AC_th%E1%BB%8Bt_n%C6%B0%E1%BB%9Bng.jpg",
  "banh xeo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Banh_Xeo_with_fish_sauce.jpg/500px-Banh_Xeo_with_fish_sauce.jpg",
  "beans with sausages": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Feijoada_%C3%A0_transmontada.jpg/330px-Feijoada_%C3%A0_transmontada.jpg",
  "bibimbap": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Dolsot-bibimbap.jpg/330px-Dolsot-bibimbap.jpg",
  "biryani": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/%22Hyderabadi_Dum_Biryani%22.jpg/330px-%22Hyderabadi_Dum_Biryani%22.jpg",
  "bobotie": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Bobotie%2C_South_African_traditional_dish.jpg/500px-Bobotie%2C_South_African_traditional_dish.jpg",
  "boeuf bourguignon": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Beef_bourguignon_NYT.jpg/500px-Beef_bourguignon_NYT.jpg",
  "borscht": "https://img.spoonacular.com/recipes/664396-312x231.jpg",
  "brik": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Brikdish.jpg/500px-Brikdish.jpg",
  "bún bò huế": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/B%C3%BAn_b%C3%B2_Hu%E1%BA%BF_%28Vietnamese_soup%29.jpg/500px-B%C3%BAn_b%C3%B2_Hu%E1%BA%BF_%28Vietnamese_soup%29.jpg",
  "buuz": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Buuz.jpg/500px-Buuz.jpg",
  "cachupa": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Cachupa_2.jpg/500px-Cachupa_2.jpg",
  "cassoulet": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Bowl_of_cassoulet.JPG/500px-Bowl_of_cassoulet.JPG",
  "causa limeña": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Causa_Rellena.jpg/500px-Causa_Rellena.jpg",
  "cepelinai": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Cepelinai_2%2C_Vilnius%2C_Lithuania_-_Diliff.jpg/500px-Cepelinai_2%2C_Vilnius%2C_Lithuania_-_Diliff.jpg",
  "cevapi": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Closeup_grilled_Serbian_sausages_%2849152335937%29.jpg/500px-Closeup_grilled_Serbian_sausages_%2849152335937%29.jpg",
  "ceviche": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Cebiche_de_corvina.JPG/330px-Cebiche_de_corvina.JPG",
  "chakchouka": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Shakshuka_by_Calliopejen1.jpg/330px-Shakshuka_by_Calliopejen1.jpg",
  "chakhchoukha": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Algerian_Chakhchoukha.jpg/330px-Algerian_Chakhchoukha.jpg",
  "chakhokhbili": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/%D0%A7%D0%B0%D1%85%D0%BE%D1%85%D0%B1%D0%B8%D0%BB%D0%B8.JPG/330px-%D0%A7%D0%B0%D1%85%D0%BE%D1%85%D0%B1%D0%B8%D0%BB%D0%B8.JPG",
  "cheeseburger": "https://img.spoonacular.com/recipes/635350-312x231.jpg",
  "chicken curry": "https://img.spoonacular.com/recipes/637391-312x231.jpg",
  "chicken fricassée": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/18-10-20_MG_4656.jpg/330px-18-10-20_MG_4656.jpg",
  "chicken kiev": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Chicken_Kiev_-_Ukrainian_East_Village_restaurant_%282%29.jpg/500px-Chicken_Kiev_-_Ukrainian_East_Village_restaurant_%282%29.jpg",
  "chicken paprikash": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Chicken_Paprikash_%28Csirke_Paprik%C3%A1s%29.jpg/500px-Chicken_Paprikash_%28Csirke_Paprik%C3%A1s%29.jpg",
  "chiles en nogada": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Chile_en_nogada24.jpg/330px-Chile_en_nogada24.jpg",
  "chili con carne": "https://img.spoonacular.com/recipes/1697611-312x231.jpg",
  "chili crab": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Chilli_crab-02.jpg/330px-Chilli_crab-02.jpg",
  "cinnamon bun": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Cinnamon_roll_in_Stockholm.jpg/330px-Cinnamon_roll_in_Stockholm.jpg",
  "clam chowder": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Quail_07_bg_041506.jpg/500px-Quail_07_bg_041506.jpg",
  "coconut rice": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Nasi_Liwet_Solo.jpg/330px-Nasi_Liwet_Solo.jpg",
  "cullen skink": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Cullen_Skink.JPG/500px-Cullen_Skink.JPG",
  "currywurst": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/20220430_currywurst.jpg/500px-20220430_currywurst.jpg",
  "dhal": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/3_types_of_lentil.png/330px-3_types_of_lentil.png",
  "doro wat": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Ethiopian_wat.jpg/500px-Ethiopian_wat.jpg",
  "egusi soup": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/EGUSI.JPG/500px-EGUSI.JPG",
  "empanadas": "https://img.spoonacular.com/recipes/653362-312x231.jpg",
  "encebollado": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Semifinal_del_Campeonato_del_Encebollado_en_Esmeraldas_2015_%2818062294436%29.jpg/960px-Semifinal_del_Campeonato_del_Encebollado_en_Esmeraldas_2015_%2818062294436%29.jpg",
  "fårikål": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/F%C3%A5r_i_k%C3%A5l.jpg/500px-F%C3%A5r_i_k%C3%A5l.jpg",
  "fasolada": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Fasolada.JPG/500px-Fasolada.JPG",
  "fatteh": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/%D9%81%D8%AA%D9%91%D8%A9_%D8%A8%D8%A7%D9%84%D8%B4%D8%A7%D9%85.jpg/500px-%D9%81%D8%AA%D9%91%D8%A9_%D8%A8%D8%A7%D9%84%D8%B4%D8%A7%D9%85.jpg",
  "feijoada": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Feijoada_%C3%A0_transmontada.jpg/330px-Feijoada_%C3%A0_transmontada.jpg",
  "fesenjan": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Khoresht-e_fesenjan.jpg/500px-Khoresht-e_fesenjan.jpg",
  "fish and chips": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Fish_and_chips_blackpool.jpg/330px-Fish_and_chips_blackpool.jpg",
  "fondue": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Fondue_dish.jpg/330px-Fondue_dish.jpg",
  "francesinha": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Francesinha_Sandwich_%28cropped%29.jpg/500px-Francesinha_Sandwich_%28cropped%29.jpg",
  "french onion soup": "https://img.spoonacular.com/recipes/643362-312x231.jpg",
  "fufu": "https://upload.wikimedia.org/wikipedia/commons/1/1f/Wrapped_fufu.jpg",
  "ful medames": "https://upload.wikimedia.org/wikipedia/commons/b/bf/Ful_medames_%28arabic_meal%29.jpg",
  "gado-gado": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Gado_gado_jakarta.jpg/500px-Gado_gado_jakarta.jpg",
  "gazpacho": "https://img.spoonacular.com/recipes/662542-312x231.jpg",
  "ghormeh sabzi": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Ghormeh_Sabzi.JPG/330px-Ghormeh_Sabzi.JPG",
  "goulash": "https://img.spoonacular.com/recipes/644476-312x231.jpg",
  "gravlax": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Laxr%C3%A4tter.jpg/500px-Laxr%C3%A4tter.jpg",
  "guacamole": "https://img.spoonacular.com/recipes/715543-312x231.jpg",
  "harira": "https://upload.wikimedia.org/wikipedia/commons/c/ce/Harira.png",
  "hummus": "https://img.spoonacular.com/recipes/716195-312x231.jpg",
  "japanese curry rice": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Beef_curry_rice_003.jpg/500px-Beef_curry_rice_003.jpg",
  "jerk chicken": "https://img.spoonacular.com/recipes/637102-312x231.jpg",
  "jollof rice": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Jollof_Rice_with_Stew.jpg/500px-Jollof_Rice_with_Stew.jpg",
  "kare-kare": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Mac_MG_5939.jpg/500px-Mac_MG_5939.jpg",
  "karelian pie": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Karjalanpiirakka-20060227.jpg/330px-Karjalanpiirakka-20060227.jpg",
  "khachapuri": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/%D0%92%D0%BA%D1%83%D1%81%D0%BD%D1%8B%D0%B9_%D0%B7%D0%B0%D0%B2%D1%82%D1%80%D0%B0%D0%BA_%D0%9A%D1%85%D0%B0%D1%87%D0%B0%D0%BF%D1%83%D1%80%D0%B8.jpg/500px-%D0%92%D0%BA%D1%83%D1%81%D0%BD%D1%8B%D0%B9_%D0%B7%D0%B0%D0%B2%D1%82%D1%80%D0%B0%D0%BA_%D0%9A%D1%85%D0%B0%D1%87%D0%B0%D0%BF%D1%83%D1%80%D0%B8.jpg",
  "khinkali": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Khinkali%2C_Restaurant_Aragvi.jpg/500px-Khinkali%2C_Restaurant_Aragvi.jpg",
  "khorovats": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Barbecue_Armenian.jpg/500px-Barbecue_Armenian.jpg",
  "kibbeh": "https://img.spoonacular.com/recipes/649403-312x231.jpg",
  "kimbap": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Gimbap_%28pixabay%29.jpg/500px-Gimbap_%28pixabay%29.jpg",
  "kimchi": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Various_kimchi.jpg/330px-Various_kimchi.jpg",
  "koshari": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Egyptian_food_Koshary.jpg/330px-Egyptian_food_Koshary.jpg",
  "kottu": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Chicken_Kottu.jpg/500px-Chicken_Kottu.jpg",
  "kung pao chicken": "https://img.spoonacular.com/recipes/649129-312x231.jpg",
  "laksa": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Nyonya_Laksa.jpg/500px-Nyonya_Laksa.jpg",
  "lamb tagine": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Tajine-marocain-un-plat-varie-et-sain_%28cropped%29.jpg/330px-Tajine-marocain-un-plat-varie-et-sain_%28cropped%29.jpg",
  "lángos": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Langos_Eger_Hungary.jpg/500px-Langos_Eger_Hungary.jpg",
  "lentil soup": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/EgFoodLentilSoup.jpg/500px-EgFoodLentilSoup.jpg",
  "lobio": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Lobio_with_summer_savory_and_ajika.jpg/960px-Lobio_with_summer_savory_and_ajika.jpg",
  "lomo saltado": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Lomo_Saltado_-_Lima%2C_Peru_Miraflores_%28Tiendecita_Blanca%29.jpg/330px-Lomo_Saltado_-_Lima%2C_Peru_Miraflores_%28Tiendecita_Blanca%29.jpg",
  "machboos": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Machboos_%28cropped%29.JPG/500px-Machboos_%28cropped%29.JPG",
  "manti": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Kayseride_bir_restoranda_Kayseri_mant%C4%B1.jpg/500px-Kayseride_bir_restoranda_Kayseri_mant%C4%B1.jpg",
  "mapo tofu": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Chen_Mapo_Tofu.jpg/330px-Chen_Mapo_Tofu.jpg",
  "masgouf": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Masgouf.jpg/330px-Masgouf.jpg",
  "meat pie": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/MeatPie.JPG/500px-MeatPie.JPG",
  "menemen": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/My_breakfast_menemen.jpg/500px-My_breakfast_menemen.jpg",
  "milanesa": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Milanesa_con_fritas.png/330px-Milanesa_con_fritas.png",
  "miso ramen": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Dosanko_Akaneri.jpg/500px-Dosanko_Akaneri.jpg",
  "moambe chicken": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Poulet_%C3%A0_la_moambe.JPG/500px-Poulet_%C3%A0_la_moambe.JPG",
  "momo": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Momo_nepal.jpg/960px-Momo_nepal.jpg",
  "moqueca": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Moqueca.jpg/500px-Moqueca.jpg",
  "moules-frites": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Moules-frites_at_Chez_Leon_in_Brussels.jpg/500px-Moules-frites_at_Chez_Leon_in_Brussels.jpg",
  "moussaka": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/MussakasMeMelitsanesKePatates01.JPG/330px-MussakasMeMelitsanesKePatates01.JPG",
  "naengmyeon": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Naengmyeon_%28cold_noodles%29.jpg/500px-Naengmyeon_%28cold_noodles%29.jpg",
  "nasi goreng": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Nasi_Goreng_Kampung_%2811967588375%29.jpg/330px-Nasi_Goreng_Kampung_%2811967588375%29.jpg",
  "nasi lemak": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Nasi_Lemak_dengan_Chili_Nasi_Lemak_dan_Sotong_Nasi_Lemak.jpg/500px-Nasi_Lemak_dengan_Chili_Nasi_Lemak_dan_Sotong_Nasi_Lemak.jpg",
  "nihari": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Nalli_Nihari_India.jpg/500px-Nalli_Nihari_India.jpg",
  "okonomiyaki": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Okonomiyaki_001.jpg/330px-Okonomiyaki_001.jpg",
  "okroshka": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/%D0%93%D0%BE%D1%82%D0%BE%D0%B2%D0%B0%D1%8F_%D0%BE%D0%BA%D1%80%D0%BE%D1%88%D0%BA%D0%B0.jpg/500px-%D0%93%D0%BE%D1%82%D0%BE%D0%B2%D0%B0%D1%8F_%D0%BE%D0%BA%D1%80%D0%BE%D1%88%D0%BA%D0%B0.jpg",
  "pad thai": "https://img.spoonacular.com/recipes/663113-312x231.jpg",
  "paella": "https://img.spoonacular.com/recipes/652134-312x231.jpg",
  "pancakes": "https://img.spoonacular.com/recipes/661886-312x231.jpg",
  "pasta alla norma": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Pasta_alla_Norma_-_Wiki_Loves_Sicilia.jpg/500px-Pasta_alla_Norma_-_Wiki_Loves_Sicilia.jpg",
  "pasta e fagioli": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Pasta_e_fagioli_cannellini.jpg/500px-Pasta_e_fagioli_cannellini.jpg",
  "pastel de choclo": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Pastel_de_choclo.jpg/500px-Pastel_de_choclo.jpg",
  "pasticada": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Sinjski_aramba%C5%A1i_-_priprema_-_kulturna_ba%C5%A1tina_%C5%A1ibensko-kninske_%C5%BEupanije.jpg/500px-Sinjski_aramba%C5%A1i_-_priprema_-_kulturna_ba%C5%A1tina_%C5%A1ibensko-kninske_%C5%BEupanije.jpg",
  "pav bhaji": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Bambayya_Pav_bhaji.jpg/500px-Bambayya_Pav_bhaji.jpg",
  "pavlova": "https://img.spoonacular.com/recipes/655031-312x231.jpg",
  "pepian": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Cocinando_El_Pepian.jpg/500px-Cocinando_El_Pepian.jpg",
  "pho": "https://img.spoonacular.com/recipes/1096250-312x231.jpg",
  "picadillo": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Picadillo_and_rice.jpg/500px-Picadillo_and_rice.jpg",
  "pierogi": "https://img.spoonacular.com/recipes/656049-312x231.jpg",
  "pljeskavica": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Pleskavitsa.JPG/500px-Pleskavitsa.JPG",
  "plov": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Afghan_Palo.jpg/500px-Afghan_Palo.jpg",
  "poffertjes": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Poffertjes-Melkhuis_%28cropped%29.jpg/500px-Poffertjes-Melkhuis_%28cropped%29.jpg",
  "pork schnitzel": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Breitenlesau_Krug_Br%C3%A4u_Schnitzel.jpg/500px-Breitenlesau_Krug_Br%C3%A4u_Schnitzel.jpg",
  "potica": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/MintpoticabySara.jpg/500px-MintpoticabySara.jpg",
  "poutine": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Food_at_WIkimanian_2017_02.jpg/330px-Food_at_WIkimanian_2017_02.jpg",
  "pozole": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Green_pozole%2C_dressed_%2829161841908%29.jpg/500px-Green_pozole%2C_dressed_%2829161841908%29.jpg",
  "pupusa": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Pupusas_El_Salvador_Centro_America.JPG/500px-Pupusas_El_Salvador_Centro_America.JPG",
  "quiche lorraine": "https://img.spoonacular.com/recipes/639590-312x231.jpg",
  "ramen": "https://img.spoonacular.com/recipes/1697543-312x231.jpg",
  "ratatouille": "https://img.spoonacular.com/recipes/633754-312x231.jpg",
  "rajma": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Rajma_Masala_%2832081557778%29.jpg/500px-Rajma_Masala_%2832081557778%29.jpg",
  "rendang": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Rendang_daging_sapi_asli_Padang.JPG/500px-Rendang_daging_sapi_asli_Padang.JPG",
  "risotto": "https://img.spoonacular.com/recipes/659109-312x231.jpg",
  "ropa vieja": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Cubanfood.jpg/500px-Cubanfood.jpg",
  "rösti": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Roesti.jpg/500px-Roesti.jpg",
  "sabich": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Sabich1.png/500px-Sabich1.png",
  "salmon soup": "https://img.spoonacular.com/recipes/659056-312x231.jpg",
  "satay": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Sate_Udang.JPG/500px-Sate_Udang.JPG",
  "schnitzel": "https://img.spoonacular.com/recipes/656819-312x231.jpg",
  "shakshuka": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Shakshuka_by_Calliopejen1.jpg/330px-Shakshuka_by_Calliopejen1.jpg",
  "sheftalia": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Typical_Greek_Cypriot_plate%2C_sheftalia_%28sausages%29.jpg/500px-Typical_Greek_Cypriot_plate%2C_sheftalia_%28sausages%29.jpg",
  "shepherd's pie": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Homerton_College_-_Shepherd%27s_pie_%2812%29.jpg/500px-Homerton_College_-_Shepherd%27s_pie_%2812%29.jpg",
  "shoyu ramen": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Gyoza_no_Ousho_20191210_125203.jpg/500px-Gyoza_no_Ousho_20191210_125203.jpg",
  "shrimp ceviche": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Cebiche_de_corvina.JPG/330px-Cebiche_de_corvina.JPG",
  "smørrebrød": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Ida_Davidsen_udsnit_af_smørrebrød.jpg/500px-Ida_Davidsen_udsnit_af_smørrebrød.jpg",
  "solyanka": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Soljanka_food_05.jpg/330px-Soljanka_food_05.jpg",
  "souvlaki": "https://img.spoonacular.com/recipes/651076-312x231.jpg",
  "spaghetti carbonara": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Espaguetis_carbonara.jpg/330px-Espaguetis_carbonara.jpg",
  "spanakopita": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Spanakopita.jpg/330px-Spanakopita.jpg",
  "stamppot": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Boerenkool_stamppot.jpg/500px-Boerenkool_stamppot.jpg",
  "stoofvlees": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Jielbeaumadier_carbonade_flamande_2_2012.jpg/500px-Jielbeaumadier_carbonade_flamande_2_2012.jpg",
  "sushi": "https://img.spoonacular.com/recipes/648506-312x231.jpg",
  "svíčková": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Sv%C3%AD%C4%8Dkov%C3%A1.jpg/500px-Sv%C3%AD%C4%8Dkov%C3%A1.jpg",
  "swedish meatballs": "https://img.spoonacular.com/recipes/648565-312x231.jpg",
  "sweet and sour chicken": "https://img.spoonacular.com/recipes/662422-312x231.jpg",
  "tabbouleh": "https://img.spoonacular.com/recipes/642121-312x231.jpg",
  "tacos": "https://img.spoonacular.com/recipes/645711-312x231.jpg",
  "tagine": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Tajine-marocain-un-plat-varie-et-sain_%28cropped%29.jpg/330px-Tajine-marocain-un-plat-varie-et-sain_%28cropped%29.jpg",
  "tamale": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tamale_Oaxaque%C3%B1o.jpg/330px-Tamale_Oaxaque%C3%B1o.jpg",
  "tlayudas": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Tlayuda12-05oaxaca013x.jpg/500px-Tlayuda12-05oaxaca013x.jpg",
  "tom kha gai": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Flickr_preppybyday_4714085019--Tom_Kha_Kai.jpg/500px-Flickr_preppybyday_4714085019--Tom_Kha_Kai.jpg",
  "tom yum": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Tom_yam_kung_maenam.jpg/330px-Tom_yam_kung_maenam.jpg",
  "tonkotsu ramen": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Tonkotsu_ramen.JPG/500px-Tonkotsu_ramen.JPG",
  "tripe soup": "https://img.spoonacular.com/recipes/654283-312x231.jpg",
  "tteokbokki": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Tteokbokki.JPG/330px-Tteokbokki.JPG",
  "tzatziki": "https://img.spoonacular.com/recipes/645646-312x231.jpg",
  "verivorst": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Boudin3.jpg/330px-Boudin3.jpg",
};

  function injectImage(url, container) {
    if (!url || !container) return;
    const img = document.createElement('img');
    img.src = url; img.alt = recipeName; img.loading = 'lazy'; img.decoding = 'async';
    img.onerror = () => img.remove();
    container.innerHTML = '';
    container.appendChild(img);
  }

  function injectCardImage(url, container) {
    if (!url || !container || container.querySelector('img')) return;
    const img = document.createElement('img');
    img.src = url; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
    img.onerror = () => img.remove();
    container.appendChild(img);
  }

  // ── New premium layout: inject into recipe-photo-container ──────
  const photoMain = document.getElementById('recipe-photo-main');
  if (photoMain) {
    const recipeSlug = photoMain.getAttribute('data-recipe') || '';
    // Try exact match by slug (replace hyphens with spaces)
    const slugAsName = recipeSlug.replace(/-/g, ' ');
    const urlBySlug = IMG[slugAsName] || IMG[recipeName.toLowerCase()];
    if (urlBySlug) injectImage(urlBySlug, photoMain);

    // Inject images in related recipe cards
    document.querySelectorAll('.recipe-card-img[data-card-recipe]').forEach(card => {
      const cs = card.getAttribute('data-card-recipe').replace(/-/g, ' ');
      const cu = IMG[cs];
      if (cu) injectCardImage(cu, card);
    });
    return; // new layout handled
  }

  // ── Legacy layout fallback (old recipe pages if any remain) ──────
  const heroInner = document.querySelector('.content-hero-inner');
  if (!heroInner) return;
  function injectLegacy(url) {
    if (!url || document.querySelector('.recipe-hero-photo')) return;
    const fig = document.createElement('figure');
    fig.className = 'recipe-hero-photo';
    const img = document.createElement('img');
    img.src = url; img.alt = recipeName; img.loading = 'lazy'; img.decoding = 'async';
    img.onerror = () => fig.remove();
    fig.appendChild(img);
    const cta = heroInner.querySelector('.btn');
    cta ? heroInner.insertBefore(fig, cta) : heroInner.appendChild(fig);
  }
  const url = IMG[recipeName.toLowerCase()];
  if (url) { injectLegacy(url); }
})();
