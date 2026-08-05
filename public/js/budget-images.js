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
};
export default budgetImages;
