"""Add timeMins overrides to recipes with long passive cooking times.

The recipe page auto-calculates time from step count (capped ~1h30m).
These recipes need explicit overrides so the page shows accurate timing.

timeMins.total = total recipe time including passive (marinating, simmering, curing)
timeMins.active = hands-on active cooking time
"""

# (lineno, current tipType value, total_mins, active_mins)
FIXES = [
    # ID 21 already done — timeMins inserted at line 5200
    (6716,  'meat', 720,  75),   # ID 28  Ramen (overnight broth)
    (8427,  'meat', 300,  60),   # ID 46  Ghormeh Sabzi (5h simmer)
    (9506,  'meat', 195,  45),   # ID 57  Fårikål (3h simmer)
    (9704,  'meat', 1620, 90),   # ID 59  Dalmatinska Pasticada (24h marinade+3h braise)
    (10514, 'meat', 285,  60),   # ID 67  Banh Mi (4h pickle+assemble)
    (11534, 'meat', 330,  60),   # ID 78  Rendang (5h30m simmer)
    (11636, 'fish', 4380, 45),   # ID 79  Gravlax (72h cure)
    (12296, 'def',  600,  60),   # ID 85  Naengmyeon (overnight broth)
    (12500, 'meat', 195,  75),   # ID 87  Bún bò Huế (3h broth)
    (21517, 'meat', 780,  120),  # ID181 Tonkotsu Ramen (13h broth)
    (21588, 'meat', 360,  90),   # ID182 Shoyu Ramen (6h broth)
]

with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

inserted = 0
# Process bottom-to-top so insertions don't shift subsequent line numbers
for lineno, tiptype_val, total, active in reversed(FIXES):
    idx = lineno - 1
    expected = f"    tipType: '{tiptype_val}',"
    actual = lines[idx].rstrip()
    if actual != expected:
        print(f"ERROR line {lineno}: expected {expected!r}, got {actual!r}")
        continue
    timemins_line = f"    timeMins: {{ total: {total}, active: {active} }},\n"
    # Insert timeMins line after tipType line
    lines.insert(idx + 1, timemins_line)
    print(f"Line {lineno}: inserted timeMins after tipType (total={total}, active={active})")
    inserted += 1

with open('public/js/recipes.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print(f"\nDone: {inserted}/{len(FIXES)} timeMins fields inserted.")
