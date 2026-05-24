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
  "arroz chaufa": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Arroz_Chaufa_%28266361654%29.jpg/330px-Arroz_Chaufa_%28266361654%29.jpg",
  "bacalhau à brás": "https://img.spoonacular.com/recipes/633251-312x231.jpg",
  "baklava": "https://img.spoonacular.com/recipes/631783-312x231.jpg",
  "bandeja paisa": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Bandeja_paisa%2C_plato_de_mi_tierra.jpg/330px-Bandeja_paisa%2C_plato_de_mi_tierra.jpg",
  "banh mi": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/B%C3%A1nh_m%C3%AC_th%E1%BB%8Bt_n%C6%B0%E1%BB%9Bng.jpg/330px-B%C3%A1nh_m%C3%AC_th%E1%BB%8Bt_n%C6%B0%E1%BB%9Bng.jpg",
  "banh xeo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Banh_Xeo_with_fish_sauce.jpg/330px-Banh_Xeo_with_fish_sauce.jpg",
  "beans with sausages": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Feijoada_%C3%A0_transmontada.jpg/330px-Feijoada_%C3%A0_transmontada.jpg",
  "bibimbap": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Dolsot-bibimbap.jpg/330px-Dolsot-bibimbap.jpg",
  "biryani": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/%22Hyderabadi_Dum_Biryani%22.jpg/330px-%22Hyderabadi_Dum_Biryani%22.jpg",
  "bobotie": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Bobotie%2C_South_African_traditional_dish.jpg/330px-Bobotie%2C_South_African_traditional_dish.jpg",
  "boeuf bourguignon": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Beef_bourguignon_NYT.jpg/330px-Beef_bourguignon_NYT.jpg",
  "borscht": "https://img.spoonacular.com/recipes/664396-312x231.jpg",
  "brik": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Brikdish.jpg/330px-Brikdish.jpg",
  "bún bò huế": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/B%C3%BAn_b%C3%B2_Hu%E1%BA%BF_%28Vietnamese_soup%29.jpg/330px-B%C3%BAn_b%C3%B2_Hu%E1%BA%BF_%28Vietnamese_soup%29.jpg",
  "buuz": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Buuz.jpg/330px-Buuz.jpg",
  "cachupa": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Cachupa_2.jpg/330px-Cachupa_2.jpg",
  "cassoulet": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Bowl_of_cassoulet.JPG/330px-Bowl_of_cassoulet.JPG",
  "causa limeña": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Causa_Rellena.jpg/330px-Causa_Rellena.jpg",
  "cepelinai": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Cepelinai_2%2C_Vilnius%2C_Lithuania_-_Diliff.jpg/330px-Cepelinai_2%2C_Vilnius%2C_Lithuania_-_Diliff.jpg",
  "cevapi": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Closeup_grilled_Serbian_sausages_%2849152335937%29.jpg/330px-Closeup_grilled_Serbian_sausages_%2849152335937%29.jpg",
  "ceviche": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Cebiche_de_corvina.JPG/330px-Cebiche_de_corvina.JPG",
  "chakchouka": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Shakshuka_by_Calliopejen1.jpg/330px-Shakshuka_by_Calliopejen1.jpg",
  "chakhchoukha": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Algerian_Chakhchoukha.jpg/330px-Algerian_Chakhchoukha.jpg",
  "chakhokhbili": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/%D0%A7%D0%B0%D1%85%D0%BE%D1%85%D0%B1%D0%B8%D0%BB%D0%B8.JPG/330px-%D0%A7%D0%B0%D1%85%D0%BE%D1%85%D0%B1%D0%B8%D0%BB%D0%B8.JPG",
  "cheeseburger": "https://img.spoonacular.com/recipes/635350-312x231.jpg",
  "chicken curry": "https://img.spoonacular.com/recipes/637391-312x231.jpg",
  "chicken fricassée": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/18-10-20_MG_4656.jpg/330px-18-10-20_MG_4656.jpg",
  "chicken kiev": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Chicken_Kiev_-_Ukrainian_East_Village_restaurant_%282%29.jpg/330px-Chicken_Kiev_-_Ukrainian_East_Village_restaurant_%282%29.jpg",
  "chicken paprikash": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Chicken_Paprikash_%28Csirke_Paprik%C3%A1s%29.jpg/330px-Chicken_Paprikash_%28Csirke_Paprik%C3%A1s%29.jpg",
  "chiles en nogada": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Chile_en_nogada24.jpg/330px-Chile_en_nogada24.jpg",
  "chili con carne": "https://img.spoonacular.com/recipes/1697611-312x231.jpg",
  "chili crab": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Chilli_crab-02.jpg/330px-Chilli_crab-02.jpg",
  "cinnamon bun": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Cinnamon_roll_in_Stockholm.jpg/330px-Cinnamon_roll_in_Stockholm.jpg",
  "clam chowder": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Quail_07_bg_041506.jpg/330px-Quail_07_bg_041506.jpg",
  "coconut rice": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Nasi_Liwet_Solo.jpg/330px-Nasi_Liwet_Solo.jpg",
  "cullen skink": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Cullen_Skink.JPG/330px-Cullen_Skink.JPG",
  "currywurst": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/20220430_currywurst.jpg/330px-20220430_currywurst.jpg",
  // "dhal": removed — was raw lentils on a board, not cooked dal. See docs/ai/RECIPE_IMAGES_MISSING.md.
  "doro wat": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Ethiopian_wat.jpg/330px-Ethiopian_wat.jpg",
  "egusi soup": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/EGUSI.JPG/330px-EGUSI.JPG",
  "empanadas": "https://img.spoonacular.com/recipes/653362-312x231.jpg",
  "encebollado": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Semifinal_del_Campeonato_del_Encebollado_en_Esmeraldas_2015_%2818062294436%29.jpg/960px-Semifinal_del_Campeonato_del_Encebollado_en_Esmeraldas_2015_%2818062294436%29.jpg",
  "fårikål": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/F%C3%A5r_i_k%C3%A5l.jpg/330px-F%C3%A5r_i_k%C3%A5l.jpg",
  "fasolada": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Fasolada.JPG/330px-Fasolada.JPG",
  "fatteh": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/%D9%81%D8%AA%D9%91%D8%A9_%D8%A8%D8%A7%D9%84%D8%B4%D8%A7%D9%85.jpg/330px-%D9%81%D8%AA%D9%91%D8%A9_%D8%A8%D8%A7%D9%84%D8%B4%D8%A7%D9%85.jpg",
  "feijoada": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Feijoada_%C3%A0_transmontada.jpg/330px-Feijoada_%C3%A0_transmontada.jpg",
  "fesenjan": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Khoresht-e_fesenjan.jpg/330px-Khoresht-e_fesenjan.jpg",
  "fish and chips": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Fish_and_chips_blackpool.jpg/330px-Fish_and_chips_blackpool.jpg",
  "fondue": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Fondue_dish.jpg/330px-Fondue_dish.jpg",
  "francesinha": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Francesinha_Sandwich_%28cropped%29.jpg/330px-Francesinha_Sandwich_%28cropped%29.jpg",
  "french onion soup": "https://img.spoonacular.com/recipes/643362-312x231.jpg",
  "fufu": "https://upload.wikimedia.org/wikipedia/commons/1/1f/Wrapped_fufu.jpg",
  "ful medames": "https://upload.wikimedia.org/wikipedia/commons/b/bf/Ful_medames_%28arabic_meal%29.jpg",
  "gado-gado": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Gado_gado_jakarta.jpg/330px-Gado_gado_jakarta.jpg",
  "gazpacho": "https://img.spoonacular.com/recipes/662542-312x231.jpg",
  "ghormeh sabzi": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Ghormeh_Sabzi.JPG/330px-Ghormeh_Sabzi.JPG",
  "goulash": "https://img.spoonacular.com/recipes/644476-312x231.jpg",
  "gravlax": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Laxr%C3%A4tter.jpg/330px-Laxr%C3%A4tter.jpg",
  "guacamole": "https://img.spoonacular.com/recipes/715543-312x231.jpg",
  "harira": "https://upload.wikimedia.org/wikipedia/commons/c/ce/Harira.png",
  "hummus": "https://img.spoonacular.com/recipes/716195-312x231.jpg",
  "japanese curry rice": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Beef_curry_rice_003.jpg/330px-Beef_curry_rice_003.jpg",
  "jerk chicken": "https://img.spoonacular.com/recipes/637102-312x231.jpg",
  "jollof rice": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Jollof_Rice_with_Stew.jpg/330px-Jollof_Rice_with_Stew.jpg",
  "kare-kare": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Mac_MG_5939.jpg/330px-Mac_MG_5939.jpg",
  "karelian pie": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Karjalanpiirakka-20060227.jpg/330px-Karjalanpiirakka-20060227.jpg",
  "khachapuri": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/%D0%92%D0%BA%D1%83%D1%81%D0%BD%D1%8B%D0%B9_%D0%B7%D0%B0%D0%B2%D1%82%D1%80%D0%B0%D0%BA_%D0%9A%D1%85%D0%B0%D1%87%D0%B0%D0%BF%D1%83%D1%80%D0%B8.jpg/330px-%D0%92%D0%BA%D1%83%D1%81%D0%BD%D1%8B%D0%B9_%D0%B7%D0%B0%D0%B2%D1%82%D1%80%D0%B0%D0%BA_%D0%9A%D1%85%D0%B0%D1%87%D0%B0%D0%BF%D1%83%D1%80%D0%B8.jpg",
  "khinkali": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Khinkali%2C_Restaurant_Aragvi.jpg/330px-Khinkali%2C_Restaurant_Aragvi.jpg",
  "khorovats": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Barbecue_Armenian.jpg/330px-Barbecue_Armenian.jpg",
  "kibbeh": "https://img.spoonacular.com/recipes/649403-312x231.jpg",
  "kimbap": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Gimbap_%28pixabay%29.jpg/330px-Gimbap_%28pixabay%29.jpg",
  "kimchi": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Various_kimchi.jpg/330px-Various_kimchi.jpg",
  "koshari": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Egyptian_food_Koshary.jpg/330px-Egyptian_food_Koshary.jpg",
  "kottu": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Chicken_Kottu.jpg/330px-Chicken_Kottu.jpg",
  "kung pao chicken": "https://img.spoonacular.com/recipes/649129-312x231.jpg",
  "laksa": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Nyonya_Laksa.jpg/330px-Nyonya_Laksa.jpg",
  "lamb tagine": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Tajine-marocain-un-plat-varie-et-sain_%28cropped%29.jpg/330px-Tajine-marocain-un-plat-varie-et-sain_%28cropped%29.jpg",
  "lángos": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Langos_Eger_Hungary.jpg/330px-Langos_Eger_Hungary.jpg",
  "lentil soup": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/EgFoodLentilSoup.jpg/330px-EgFoodLentilSoup.jpg",
  "lobio": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Lobio_with_summer_savory_and_ajika.jpg/960px-Lobio_with_summer_savory_and_ajika.jpg",
  "lomo saltado": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Lomo_Saltado_-_Lima%2C_Peru_Miraflores_%28Tiendecita_Blanca%29.jpg/330px-Lomo_Saltado_-_Lima%2C_Peru_Miraflores_%28Tiendecita_Blanca%29.jpg",
  "machboos": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Machboos_%28cropped%29.JPG/330px-Machboos_%28cropped%29.JPG",
  "manti": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Kayseride_bir_restoranda_Kayseri_mant%C4%B1.jpg/330px-Kayseride_bir_restoranda_Kayseri_mant%C4%B1.jpg",
  "mapo tofu": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Chen_Mapo_Tofu.jpg/330px-Chen_Mapo_Tofu.jpg",
  "masgouf": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Masgouf.jpg/330px-Masgouf.jpg",
  "meat pie": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/MeatPie.JPG/330px-MeatPie.JPG",
  "menemen": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/My_breakfast_menemen.jpg/330px-My_breakfast_menemen.jpg",
  "milanesa": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Milanesa_con_fritas.png/330px-Milanesa_con_fritas.png",
  "miso ramen": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Dosanko_Akaneri.jpg/330px-Dosanko_Akaneri.jpg",
  "moambe chicken": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Poulet_%C3%A0_la_moambe.JPG/330px-Poulet_%C3%A0_la_moambe.JPG",
  "momo": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Momo_nepal.jpg/960px-Momo_nepal.jpg",
  "moqueca": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Moqueca.jpg/330px-Moqueca.jpg",
  "moules-frites": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Moules-frites_at_Chez_Leon_in_Brussels.jpg/330px-Moules-frites_at_Chez_Leon_in_Brussels.jpg",
  "moussaka": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/MussakasMeMelitsanesKePatates01.JPG/330px-MussakasMeMelitsanesKePatates01.JPG",
  "naengmyeon": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Naengmyeon_%28cold_noodles%29.jpg/330px-Naengmyeon_%28cold_noodles%29.jpg",
  "nasi goreng": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Nasi_Goreng_Kampung_%2811967588375%29.jpg/330px-Nasi_Goreng_Kampung_%2811967588375%29.jpg",
  "nasi lemak": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Nasi_Lemak_dengan_Chili_Nasi_Lemak_dan_Sotong_Nasi_Lemak.jpg/330px-Nasi_Lemak_dengan_Chili_Nasi_Lemak_dan_Sotong_Nasi_Lemak.jpg",
  "nihari": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Nalli_Nihari_India.jpg/330px-Nalli_Nihari_India.jpg",
  "okonomiyaki": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Okonomiyaki_001.jpg/330px-Okonomiyaki_001.jpg",
  "okroshka": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/%D0%93%D0%BE%D1%82%D0%BE%D0%B2%D0%B0%D1%8F_%D0%BE%D0%BA%D1%80%D0%BE%D1%88%D0%BA%D0%B0.jpg/330px-%D0%93%D0%BE%D1%82%D0%BE%D0%B2%D0%B0%D1%8F_%D0%BE%D0%BA%D1%80%D0%BE%D1%88%D0%BA%D0%B0.jpg",
  "pad thai": "https://img.spoonacular.com/recipes/663113-312x231.jpg",
  "paella": "https://img.spoonacular.com/recipes/652134-312x231.jpg",
  "pancakes": "https://img.spoonacular.com/recipes/661886-312x231.jpg",
  "pasta alla norma": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Pasta_alla_Norma_-_Wiki_Loves_Sicilia.jpg/330px-Pasta_alla_Norma_-_Wiki_Loves_Sicilia.jpg",
  "pasta e fagioli": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Pasta_e_fagioli_cannellini.jpg/330px-Pasta_e_fagioli_cannellini.jpg",
  "pastel de choclo": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Pastel_de_choclo.jpg/330px-Pastel_de_choclo.jpg",
  "pasticada": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Sinjski_aramba%C5%A1i_-_priprema_-_kulturna_ba%C5%A1tina_%C5%A1ibensko-kninske_%C5%BEupanije.jpg/330px-Sinjski_aramba%C5%A1i_-_priprema_-_kulturna_ba%C5%A1tina_%C5%A1ibensko-kninske_%C5%BEupanije.jpg",
  "pav bhaji": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Bambayya_Pav_bhaji.jpg/330px-Bambayya_Pav_bhaji.jpg",
  "pavlova": "https://img.spoonacular.com/recipes/655031-312x231.jpg",
  "pepian": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Cocinando_El_Pepian.jpg/330px-Cocinando_El_Pepian.jpg",
  "pho": "https://img.spoonacular.com/recipes/1096250-312x231.jpg",
  "picadillo": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Picadillo_and_rice.jpg/330px-Picadillo_and_rice.jpg",
  "pierogi": "https://img.spoonacular.com/recipes/656049-312x231.jpg",
  "pljeskavica": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Pleskavitsa.JPG/330px-Pleskavitsa.JPG",
  "plov": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Afghan_Palo.jpg/330px-Afghan_Palo.jpg",
  "poffertjes": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Poffertjes-Melkhuis_%28cropped%29.jpg/330px-Poffertjes-Melkhuis_%28cropped%29.jpg",
  "pork schnitzel": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Breitenlesau_Krug_Br%C3%A4u_Schnitzel.jpg/330px-Breitenlesau_Krug_Br%C3%A4u_Schnitzel.jpg",
  "potica": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/MintpoticabySara.jpg/330px-MintpoticabySara.jpg",
  // "poutine": removed — was a generic Wikimedia conference photo. See docs/ai/RECIPE_IMAGES_MISSING.md.
  "pozole": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Green_pozole%2C_dressed_%2829161841908%29.jpg/330px-Green_pozole%2C_dressed_%2829161841908%29.jpg",
  "pupusa": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Pupusas_El_Salvador_Centro_America.JPG/330px-Pupusas_El_Salvador_Centro_America.JPG",
  "quiche lorraine": "https://img.spoonacular.com/recipes/639590-312x231.jpg",
  "ramen": "https://img.spoonacular.com/recipes/1697543-312x231.jpg",
  "ratatouille": "https://img.spoonacular.com/recipes/633754-312x231.jpg",
  "rajma": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Rajma_Masala_%2832081557778%29.jpg/330px-Rajma_Masala_%2832081557778%29.jpg",
  "rendang": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Rendang_daging_sapi_asli_Padang.JPG/330px-Rendang_daging_sapi_asli_Padang.JPG",
  "risotto": "https://img.spoonacular.com/recipes/659109-312x231.jpg",
  "ropa vieja": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Cubanfood.jpg/330px-Cubanfood.jpg",
  "rösti": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Roesti.jpg/330px-Roesti.jpg",
  "sabich": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Sabich1.png/330px-Sabich1.png",
  "salmon soup": "https://img.spoonacular.com/recipes/659056-312x231.jpg",
  "satay": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Sate_Udang.JPG/330px-Sate_Udang.JPG",
  "schnitzel": "https://img.spoonacular.com/recipes/656819-312x231.jpg",
  "shakshuka": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Shakshuka_by_Calliopejen1.jpg/330px-Shakshuka_by_Calliopejen1.jpg",
  "sheftalia": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Typical_Greek_Cypriot_plate%2C_sheftalia_%28sausages%29.jpg/330px-Typical_Greek_Cypriot_plate%2C_sheftalia_%28sausages%29.jpg",
  "shepherd's pie": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Homerton_College_-_Shepherd%27s_pie_%2812%29.jpg/330px-Homerton_College_-_Shepherd%27s_pie_%2812%29.jpg",
  "shoyu ramen": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Gyoza_no_Ousho_20191210_125203.jpg/330px-Gyoza_no_Ousho_20191210_125203.jpg",
  "shrimp ceviche": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Cebiche_de_corvina.JPG/330px-Cebiche_de_corvina.JPG",
  "smørrebrød": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Ida_Davidsen_udsnit_af_smørrebrød.jpg/330px-Ida_Davidsen_udsnit_af_smørrebrød.jpg",
  "solyanka": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Soljanka_food_05.jpg/330px-Soljanka_food_05.jpg",
  "souvlaki": "https://img.spoonacular.com/recipes/651076-312x231.jpg",
  "spaghetti carbonara": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Espaguetis_carbonara.jpg/330px-Espaguetis_carbonara.jpg",
  "spanakopita": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Spanakopita.jpg/330px-Spanakopita.jpg",
  "stamppot": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Boerenkool_stamppot.jpg/330px-Boerenkool_stamppot.jpg",
  "stoofvlees": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Jielbeaumadier_carbonade_flamande_2_2012.jpg/330px-Jielbeaumadier_carbonade_flamande_2_2012.jpg",
  "sushi": "https://img.spoonacular.com/recipes/648506-312x231.jpg",
  "svíčková": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Sv%C3%AD%C4%8Dkov%C3%A1.jpg/330px-Sv%C3%AD%C4%8Dkov%C3%A1.jpg",
  "swedish meatballs": "https://img.spoonacular.com/recipes/648565-312x231.jpg",
  "sweet and sour chicken": "https://img.spoonacular.com/recipes/662422-312x231.jpg",
  "tabbouleh": "https://img.spoonacular.com/recipes/642121-312x231.jpg",
  "tacos": "https://img.spoonacular.com/recipes/645711-312x231.jpg",
  "tagine": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Tajine-marocain-un-plat-varie-et-sain_%28cropped%29.jpg/330px-Tajine-marocain-un-plat-varie-et-sain_%28cropped%29.jpg",
  "tamale": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tamale_Oaxaque%C3%B1o.jpg/330px-Tamale_Oaxaque%C3%B1o.jpg",
  "tlayudas": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Tlayuda12-05oaxaca013x.jpg/330px-Tlayuda12-05oaxaca013x.jpg",
  "tom kha gai": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Flickr_preppybyday_4714085019--Tom_Kha_Kai.jpg/330px-Flickr_preppybyday_4714085019--Tom_Kha_Kai.jpg",
  "tom yum": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Tom_yam_kung_maenam.jpg/330px-Tom_yam_kung_maenam.jpg",
  "tonkotsu ramen": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Tonkotsu_ramen.JPG/330px-Tonkotsu_ramen.JPG",
  "tripe soup": "https://img.spoonacular.com/recipes/654283-312x231.jpg",
  "tteokbokki": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Tteokbokki.JPG/330px-Tteokbokki.JPG",
  "tzatziki": "https://img.spoonacular.com/recipes/645646-312x231.jpg",
  "verivorst": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Boudin3.jpg/330px-Boudin3.jpg",
};

  function injectImage(url, container) {
    if (!url || !container) return;
    // Never overwrite an SSR-rendered img. The server-side resolver
    // (resolveRecipeImage in scripts/generate-content.mjs) is the source of
    // truth — it already considered local public/images/<slug>.{webp,jpg}
    // overrides + recipe-images.js mappings. Wiping the SSR <img> here
    // erases hand-curated local images (e.g. miso-ramen.jpg), and risks
    // re-introducing previously blacklisted URLs that this file still ships.
    if (container.querySelector('img')) return;
    const img = document.createElement('img');
    img.src = url; img.alt = recipeName; img.loading = 'lazy'; img.decoding = 'async';
    // Don't wipe innerHTML up front — the SSR usually put an emoji (🍽️) as
    // a placeholder, and we want to keep showing it if this fetch 404s.
    // Image is position:absolute via .recipe-photo-container img, so it
    // overlays the emoji on success. On error we just remove the img and
    // the emoji is visible again.
    img.onerror = () => img.remove();
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

// ── iOS/iPadOS PDF helper ─────────────────────────────────────────
(function () {
  'use strict';

  // Detect iOS / iPadOS (iPadOS 13+ reports as MacIntel with touch)
  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (!isIOS) return;

  // Per-language helper text (keyed by <html lang="…">)
  const HELP = {
    'en': 'On iPhone/iPad: tap <strong>Share ⬆</strong> → <strong>Print</strong> → <strong>Save as PDF</strong>',
    'ro': 'Pe iPhone/iPad: apasă <strong>Share ⬆</strong> → <strong>Print</strong> → <strong>Salvează ca PDF</strong>',
    'es': 'En iPhone/iPad: toca <strong>Compartir ⬆</strong> → <strong>Imprimir</strong> → <strong>Guardar como PDF</strong>',
    'fr': 'Sur iPhone/iPad : appuyez sur <strong>Partager ⬆</strong> → <strong>Imprimer</strong> → <strong>Enregistrer en PDF</strong>',
    'de': 'Auf iPhone/iPad: <strong>Teilen ⬆</strong> antippen → <strong>Drucken</strong> → <strong>Als PDF sichern</strong>',
    'pt': 'No iPhone/iPad: toque em <strong>Compartilhar ⬆</strong> → <strong>Imprimir</strong> → <strong>Salvar como PDF</strong>',
    'ru': 'На iPhone/iPad: нажмите <strong>Поделиться ⬆</strong> → <strong>Печать</strong> → <strong>Сохранить как PDF</strong>',
    'ar': 'على iPhone/iPad: اضغط <strong>مشاركة ⬆</strong> ← <strong>طباعة</strong> ← <strong>حفظ كـ PDF</strong>',
    'zh': '在iPhone/iPad上：点击<strong>共享 ⬆</strong> → <strong>打印</strong> → <strong>存储为PDF</strong>',
    'ja': 'iPhone/iPadで：<strong>共有 ⬆</strong> をタップ → <strong>プリント</strong> → <strong>PDFを保存</strong>',
    'ko': 'iPhone/iPad에서: <strong>공유 ⬆</strong> 탭 → <strong>프린트</strong> → <strong>PDF로 저장</strong>',
    'hi': 'iPhone/iPad पर: <strong>Share ⬆</strong> दबाएं → <strong>Print</strong> → <strong>Save as PDF</strong>',
    'tr': 'iPhone/iPad\'de: <strong>Paylaş ⬆</strong> → <strong>Yazdır</strong> → <strong>PDF Olarak Kaydet</strong>',
    'it': 'Su iPhone/iPad: tocca <strong>Condividi ⬆</strong> → <strong>Stampa</strong> → <strong>Salva come PDF</strong>',
  };

  const lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
  const msg  = HELP[lang] || HELP['en'];

  function injectHelper() {
    const btn = document.querySelector('.btn-print-pdf');
    if (!btn || btn.parentNode.querySelector('.pdf-ios-hint')) return;
    const hint = document.createElement('p');
    hint.className = 'pdf-ios-hint';
    hint.innerHTML = msg;
    btn.parentNode.insertBefore(hint, btn.nextSibling);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectHelper);
  } else {
    injectHelper();
  }
})();

// ── Mobile recipe navigator: scroll restoration on "back to recipes" ─
// Two cooperating pieces:
//   A) On any list page (recipe index / cuisine pages) that contains
//      .recipe-card-item links, save scrollY + pathname into
//      sessionStorage when the user taps a recipe card.
//   B) On a recipe page, when the user taps the sticky-nav back button
//      ([data-rmn-back]) we set a one-shot flag. On the next load of
//      the same list page, we restore the saved scrollY.
//
// Same-origin sessionStorage survives across these navigations. No
// dependency on framework / router. Quiet on errors (private mode).
(function () {
  'use strict';
  const SCROLL_KEY = 'mp-list-scroll';
  const HREF_KEY   = 'mp-list-href';
  const FLAG_KEY   = 'mp-restore-scroll';

  function safe(fn) { try { fn(); } catch (_) {} }

  const onRecipePage = !!document.querySelector('.recipe-page-wrap');

  if (!onRecipePage) {
    // (A) list page — save state when ANY link to a recipe page is tapped.
    // Use a delegated listener so we catch every recipe link regardless of
    // the surrounding markup (recipe-index uses <ul class="recipe-origin-list">,
    // cuisine pages may use .recipe-card-item, plan pages link via the
    // weekly menu table, etc.). Match the per-locale recipe URL segment.
    const RECIPE_PATH = /\/(?:recipes|retete|recetas|recettes|rezepte|receitas|retsepty|wasafat|shipu|reshipi|tarifler|ricette|weekly-plan)\/[^\/]+\/?$/;
    document.addEventListener('click', (e) => {
      // Only main-button left-clicks; let modifiers (cmd-click etc.) through.
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      let href; try { href = new URL(a.href, window.location.href); } catch (_) { return; }
      if (href.origin !== window.location.origin) return;
      if (!RECIPE_PATH.test(href.pathname)) return;
      safe(() => {
        sessionStorage.setItem(SCROLL_KEY, String(window.scrollY || 0));
        sessionStorage.setItem(HREF_KEY,   window.location.pathname);
      });
    }, true);
    // Restore on return — only if the flag was set by the recipe page.
    safe(() => {
      if (sessionStorage.getItem(FLAG_KEY) !== '1') return;
      if (sessionStorage.getItem(HREF_KEY) !== window.location.pathname) return;
      const y = parseInt(sessionStorage.getItem(SCROLL_KEY) || '0', 10);
      if (y > 0) {
        // Use rAF to ensure layout is settled before scrolling.
        requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, y)));
      }
      sessionStorage.removeItem(FLAG_KEY);
    });
    return;
  }

  // (B) recipe page — set the restore flag when the user taps "back".
  const backBtn = document.querySelector('[data-rmn-back]');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      safe(() => sessionStorage.setItem(FLAG_KEY, '1'));
    });
  }
})();

// (Phase K — swipe gestures intentionally NOT implemented. Spec says
// "if risky, skip swipe entirely — visible back control is higher
// priority." Edge-swipe detection conflicts with Safari's native
// back-gesture on iOS and never feels reliable; the floating pill
// covers the use case without the risk.)

