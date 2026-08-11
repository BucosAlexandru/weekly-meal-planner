/* Budget recipe images — Wikimedia Commons (freely licensed, hotlink-friendly).
   Keyed by budget recipe id; consulted by resolveRecipeImage() in
   generate-content.mjs after the local /images/<slug> lookup and the numeric
   recipeImages map. Keep in sync with the dishes in recipes-budget.js. */
export const budgetImages = {
  budget_001: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Ciorba_de_fasole_boabe.png/500px-Ciorba_de_fasole_boabe.png',                        // Ciorbă de fasole albă
  budget_002: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Iahnie_cartofi_ca_garnitur%C4%83.png/500px-Iahnie_cartofi_ca_garnitur%C4%83.png',    // Tocăniță de cartofi (potatoes in tomato sauce)
  budget_003: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Baked_beans_in_tomato_sauce.jpg/500px-Baked_beans_in_tomato_sauce.jpg',              // Iahnie de fasole (meatless beans in sauce)
  budget_004: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Salat%C4%83_de_vinete.jpg/500px-Salat%C4%83_de_vinete.jpg',                          // Salată de vinete
  budget_005: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/T%C3%BCrl%C3%BC_in_a_g%C3%BCve%C3%A7.jpg/500px-T%C3%BCrl%C3%BC_in_a_g%C3%BCve%C3%A7.jpg',   // Ghiveci de legume (türlü — mixed vegetable stew in a pot)
  budget_006: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Fasole_batuta.png/500px-Fasole_batuta.png',                                          // Fasole bătută (bean paste topped with fried onions)
  budget_007: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/MamaligaBranza.JPG/500px-MamaligaBranza.JPG',                                        // Mămăligă cu brânză și smântână
  budget_008: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Stuffed_paprikas_%28Hercegovacke_Punjene_paprike%29.JPG/500px-Stuffed_paprikas_%28Hercegovacke_Punjene_paprike%29.JPG', // Ardei umpluți (stuffed peppers in tomato sauce)
  budget_009: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Zacusc%C4%83.jpg/500px-Zacusc%C4%83.jpg',                                            // Zacuscă (roasted vegetable spread on bread)
  budget_010: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Postna_sarma_%28vegetarian_sarma%2C_Cuisine_of_Serbia%29.jpg/500px-Postna_sarma_%28vegetarian_sarma%2C_Cuisine_of_Serbia%29.jpg', // Sarmale de post (vegan cabbage rolls)
  budget_011: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Catalan_lentil_soup.JPG/500px-Catalan_lentil_soup.JPG',                                // Mâncare de linte (chunky lentil stew)
  budget_012: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Vegetable_Pilaf.jpg/500px-Vegetable_Pilaf.jpg',                                       // Pilaf de legume (vegetable rice pilaf)
  budget_013: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Zelje_z_paradajzom.jpg/500px-Zelje_z_paradajzom.jpg',                                // Varză călită (cabbage braised in tomato)
  budget_014: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Turkish_egg_dish_Menemen.jpg/500px-Turkish_egg_dish_Menemen.jpg',                     // Menemen (eggs cooked in tomato & pepper)
  budget_015: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Baked_noodles_with_cottage_cheese_DSC04375.JPG/500px-Baked_noodles_with_cottage_cheese_DSC04375.JPG', // Macaroane cu brânză (pasta with white cheese)
  budget_016: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Vegetable_soup_and_bread_at_the_office.jpg/500px-Vegetable_soup_and_bread_at_the_office.jpg', // Supă-cremă de legume (vegetable soup)
  budget_017: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Sauteed_Garlic_Green_Beans_1_2017-02-22.jpg/500px-Sauteed_Garlic_Green_Beans_1_2017-02-22.jpg', // Păstăi cu usturoi (garlic green beans)
  budget_018: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Roasted_Potato_Wedges_with_Shallots_and_Rosemary_%285706897999%29.jpg/500px-Roasted_Potato_Wedges_with_Shallots_and_Rosemary_%285706897999%29.jpg', // Cartofi la cuptor cu rozmarin (roasted potatoes)
  budget_019: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Perkedel_kentang.JPG/500px-Perkedel_kentang.JPG', // Chiftele de cartofi (potato patties)
  budget_020: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Rice_pudding_bowl.jpg/500px-Rice_pudding_bowl.jpg', // Orez cu lapte (rice pudding)
  budget_021: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Carrot_and_Peas_Bhaji.jpg/500px-Carrot_and_Peas_Bhaji.jpg', // Mâncare de mazăre (green peas & carrot in tomato sauce)
  budget_022: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Sauteed_spinach_and_tomatoes_%2841368303650%29.jpg/500px-Sauteed_spinach_and_tomatoes_%2841368303650%29.jpg', // Mâncare de spanac cu usturoi (sautéed spinach)
  budget_023: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Smoked_and_sauteed_squash_and_zucchini_with_tomatoes.jpg/500px-Smoked_and_sauteed_squash_and_zucchini_with_tomatoes.jpg', // Dovlecei cu usturoi și mărar (sautéed zucchini with tomato)
  budget_024: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/%D0%8C%D0%BE%D1%84%D1%82%D0%B8%D1%9A%D0%B0_%D1%81%D0%BE_%D0%BF%D0%B5%D1%87%D1%83%D1%80%D0%BA%D0%B8%2C%D0%BA%D1%80%D0%BE%D0%BC%D0%B8%D0%B4_%D0%B8_%D0%BF%D1%80%D0%B6%D0%B5%D0%BD%D0%B8_%D0%BA%D0%BE%D0%BC%D0%BF%D0%B8%D1%80%D0%B8.jpg/500px-%D0%8C%D0%BE%D1%84%D1%82%D0%B8%D1%9A%D0%B0_%D1%81%D0%BE_%D0%BF%D0%B5%D1%87%D1%83%D1%80%D0%BA%D0%B8%2C%D0%BA%D1%80%D0%BE%D0%BC%D0%B8%D0%B4_%D0%B8_%D0%BF%D1%80%D0%B6%D0%B5%D0%BD%D0%B8_%D0%BA%D0%BE%D0%BC%D0%BF%D0%B8%D1%80%D0%B8.jpg', // Chiftele de ciuperci (fried patties with mushrooms)
  budget_025: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Cooked_oatmeal_in_bowl_3.jpg/500px-Cooked_oatmeal_in_bowl_3.jpg', // Terci de ovăz (oat porridge)
};
export default budgetImages;
