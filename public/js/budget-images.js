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
};
export default budgetImages;
