"""Fix wrong tipType values across recipes.

Changes:
  ID 4  Gazpacho         soup    → def  (cold soup, no cream)
  ID 5  Sushi            fish    → def  (not about cooking fish flesh)
  ID 16 Pad Thai         fish    → def  (stir-fried noodles, not fish-cooking)
  ID 18 Feijoada         soup    → meat (pork/bean stew, no cream)
  ID 21 Pho              soup    → meat (beef broth, no cream)
  ID 28 Ramen (generic)  soup    → meat (pork/chicken broth, no cream)
  ID 36 Chili con carne  soup    → meat (meat stew, no cream)
  ID 69 Laksa            soup    → def  (coconut milk, not cream)
  ID 87 Bún bò Huế       soup    → meat (beef noodle soup, no cream)
  ID 95 Lentil Soup      soup    → def  (veg soup, no cream)
  ID112 Tom Yum          soup    → def  (shrimp/herb broth, no cream)
  ID149 Pozole           soup    → meat (pork soup, no cream)
  ID151 Okroshka         soup    → def  (cold kvass/kefir soup)
  ID154 Egusi soup       soup    → def  (palm oil Nigerian soup)
  ID161 Fasolada         soup    → def  (bean soup, no cream)
  ID171 Solyanka         soup    → meat (Russian meat soup, no cream)
  ID174 Tom Kha Gai      soup    → meat (chicken coconut soup)
  ID181 Tonkotsu Ramen   japanese→ meat (pork-based)
  ID182 Shoyu Ramen      japanese→ meat (chicken/soy broth)
  ID183 Miso Ramen       japanese→ def  (miso/tofu, taste-adjust tip)
"""

fixes = {
    840:  "    tipType: 'def',\n",   # ID 4  Gazpacho
    1110: "    tipType: 'def',\n",   # ID 5  Sushi
    3794: "    tipType: 'def',\n",   # ID 16 Pad Thai
    4339: "    tipType: 'meat',\n",  # ID 18 Feijoada
    5199: "    tipType: 'meat',\n",  # ID 21 Pho
    6715: "    tipType: 'meat',\n",  # ID 28 Ramen
    7429: "    tipType: 'meat',\n",  # ID 36 Chili
    10717:"    tipType: 'def',\n",   # ID 69 Laksa
    12499:"    tipType: 'meat',\n",  # ID 87 Bún bò Huế
    13315:"    tipType: 'def',\n",   # ID 95 Lentil Soup
    14844:"    tipType: 'def',\n",   # ID112 Tom Yum
    18303:"    tipType: 'meat',\n",  # ID149 Pozole
    18507:"    tipType: 'def',\n",   # ID151 Okroshka
    18764:"    tipType: 'def',\n",   # ID154 Egusi
    19478:"    tipType: 'def',\n",   # ID161 Fasolada
    20498:"    tipType: 'meat',\n",  # ID171 Solyanka
    20804:"    tipType: 'meat',\n",  # ID174 Tom Kha Gai
    21516:"    tipType: 'meat',\n",  # ID181 Tonkotsu Ramen
    21587:"    tipType: 'meat',\n",  # ID182 Shoyu Ramen
    21658:"    tipType: 'def',\n",   # ID183 Miso Ramen
}

with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

changed = 0
for lineno, new_line in fixes.items():
    idx = lineno - 1  # 0-indexed
    old = lines[idx]
    if "tipType:" not in old:
        print(f"ERROR line {lineno}: expected tipType, got: {old.rstrip()}")
        continue
    lines[idx] = new_line
    print(f"Line {lineno}: {old.rstrip()} → {new_line.rstrip()}")
    changed += 1

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print(f"\nDone: {changed}/{len(fixes)} tipType fields updated.")
