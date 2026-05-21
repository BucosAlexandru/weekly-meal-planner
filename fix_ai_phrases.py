with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ID 2 Ciorba de burta — remove "beloved" and "traditional dish"
content = content.replace(
    'en: "Ciorbă de burtă is one of Romania\'s most beloved traditional dishes, rooted in the kitchens of Muntenia and Oltenia.',
    'en: "Ciorbă de burtă is a defining fixture of Romanian Sunday tables, rooted in the kitchens of Muntenia and Oltenia.'
)

# ID 52 Stamppot — remove "comfort food"
content = content.replace(
    'en: "Stamppot — mashed pot, literally — is the defining comfort food of Dutch winter cooking.',
    'en: "Stamppot — mashed pot, literally — is the defining dish of Dutch winter cooking.'
)

# ID 77 Ghormeh Sabzi — remove "beloved"
content = content.replace(
    'en: "Ghormeh sabzi is one of the oldest and most beloved Persian stews,',
    'en: "Ghormeh sabzi is one of the oldest and most enduring Persian stews,'
)

# ID 117 Svickova — remove "beloved"
content = content.replace(
    'en: "Svíčková — braised beef sirloin in cream sauce — is the Czech Republic\'s most beloved Sunday dish and a centrepiece of Czech culinary identity.',
    'en: "Svíčková — braised beef sirloin in cream sauce — is the Czech Republic\'s defining Sunday dish and a centrepiece of Czech culinary identity.'
)

# ID 124 Milanesa Argentina — remove "beloved"
content = content.replace(
    'en: "In sandwich form — tucked into a bread roll with lettuce and tomato — it is one of Argentina\'s most beloved street foods.',
    'en: "In sandwich form — tucked into a bread roll with lettuce and tomato — it is one of Argentina\'s most popular street foods.'
)

# ID 164 Lomo Saltado — no "comfort food" found — check ID
# Actually from grep: ID 124 = Milanesa, check grep output again
# ID 52 = Stamppot, ID 164 = Kottu Roti "beloved"
content = content.replace(
    'en: "Kottu roti is Sri Lanka\'s most beloved street food',
    'en: "Kottu roti is Sri Lanka\'s most recognisable street food'
)

# ID 168 Shepherd's Pie — remove "comfort food" (twice)
content = content.replace(
    "en: \"Shepherd's Pie is a traditional British winter dish — a layer of minced lamb with carrots, peas, and onion, topped with a golden mashed potato crust baked until crisp. Its name reflects its origin: it was the economical food of shepherds, made from leftover lamb after Sunday's roast.\\n\\nIn British tradition, the terminology matters: made with lamb it is shepherd's pie, made with beef it is cottage pie. Both are classic British comfort food, found on pub menus and in home kitchens across the United Kingdom, especially in autumn and winter.\"",
    "en: \"Shepherd's Pie is a British winter dish — a layer of minced lamb with carrots, peas, and onion, topped with a golden mashed potato crust baked until crisp. Its name reflects its origin: it was the economical food of shepherds, made from leftover lamb after Sunday's roast.\\n\\nIn British tradition, the terminology matters: made with lamb it is shepherd's pie, made with beef it is cottage pie. Both are fixtures of pub menus and home kitchens across the United Kingdom, especially in autumn and winter.\""
)

# ID 176 Pav Bhaji — remove "beloved" and "flavorful"
content = content.replace(
    'en: "Pav bhaji is the emblematic street food of Mumbai — a thick, spiced mash of butter-cooked vegetables (potatoes, cauliflower, peas, bell pepper) served with soft butter-toasted buns (pav). The bhaji is cooked on a large flat griddle in full view, crushed and mixed in front of customers with generous butter and pav bhaji masala.\\n\\nPav bhaji emerged in the 1850s in Mumbai\'s textile markets as fast food for mill workers, combining leftover vegetables into one flavorful and filling dish. Today it is one of India\'s most beloved street foods, from Chowpatty Beach to every city corner."',
    'en: "Pav bhaji is the emblematic street food of Mumbai — a thick, spiced mash of butter-cooked vegetables (potatoes, cauliflower, peas, bell pepper) served with soft butter-toasted buns (pav). The bhaji is cooked on a large flat griddle in full view, crushed and mixed in front of customers with generous butter and pav bhaji masala.\\n\\nPav bhaji emerged in the 1850s in Mumbai\'s textile markets as fast food for mill workers, combining leftover vegetables into one hearty and filling dish. Today it is one of India\'s most recognisable street foods, from Chowpatty Beach to every city corner."'
)

# ID 164 Langos — remove "ultimate comfort food"
content = content.replace(
    'Hungarians consider it the ultimate comfort food."',
    'Hungarians consider it the quintessential end-of-market reward."'
)

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("AI phrase fixes done")
