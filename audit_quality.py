"""
Phase 14-19 Quality Audit Script
Audits all 175 recipes for:
- Ingredient quality (Phase 14)
- Method/step quality (Phase 15)
- Static data patterns (Phase 16)
- Completeness (Phase 17)
- Tier classification (Phase 18)
"""
import re
from collections import defaultdict, Counter

with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    raw = f.read()

recipe_starts = [m.start() for m in re.finditer(r'\n  \{\n    id:', raw)]

def get_block(i):
    end = recipe_starts[i+1] if i+1 < len(recipe_starts) else len(raw)
    return raw[recipe_starts[i]:end]

def get_id(block):
    m = re.search(r'\bid:\s*(\d+)', block); return int(m.group(1)) if m else 0

def get_name(block):
    m = re.search(r'name:\s*\{[^}]*?en:\s*[\'"]([^\'"]+)[\'"]', block, re.DOTALL)
    if m: return m.group(1)
    m = re.search(r"name:\s*'([^']+)'", block)
    return m.group(1) if m else '?'

def get_ingr(block, locale='en'):
    # Try locale, fall back to ro
    for lc in [locale, 'ro']:
        m = re.search(rf"ingredients:\s*\{{.*?{lc}:\s*\[([^\]]+)\]", block, re.DOTALL)
        if m:
            items = re.findall(r'"([^"]+)"', m.group(1))
            if items: return items
    return []

def get_how(block, locale='en'):
    for lc in [locale, 'ro']:
        m = re.search(rf'howIsMade:\s*\{{.*?{lc}:\s*"((?:[^"\\]|\\.)*)"', block, re.DOTALL)
        if m: return m.group(1).replace('\\n', '\n').replace('\\"', '"')
    return ''

def get_originText(block, locale='en'):
    for lc in [locale, 'ro']:
        m = re.search(rf'originText:\s*\{{.*?{lc}:\s*"((?:[^"\\]|\\.)*)"', block, re.DOTALL)
        if m: return m.group(1).replace('\\n', '\n')
    return ''

def get_nutrition(block):
    m = re.search(r'nutrition:\s*\{([^}]+)\}', block)
    if not m: return {}
    return {k: int(v) for k, v in re.findall(r'(\w+):\s*(\d+)', m.group(1))}

def get_slug(block):
    m = re.search(r'slug:\s*[\'"]([^\'"]+)[\'"]', block); return m.group(1) if m else ''

def get_tiptype(block):
    m = re.search(r"tipType:\s*'([^']+)'", block); return m.group(1) if m else ''

def get_pairingstype(block):
    m = re.search(r"pairingsType:\s*'([^']+)'", block); return m.group(1) if m else ''

# ── Build recipe list ──────────────────────────────────────────────────────────
recipes = []
for i in range(len(recipe_starts)):
    block = get_block(i)
    r = {
        'id': get_id(block),
        'name': get_name(block),
        'slug': get_slug(block),
        'ingr_en': get_ingr(block, 'en'),
        'ingr_ro': get_ingr(block, 'ro'),
        'how_en': get_how(block, 'en'),
        'how_ro': get_how(block, 'ro'),
        'origin_en': get_originText(block, 'en'),
        'nutrition': get_nutrition(block),
        'tipType': get_tiptype(block),
        'pairingsType': get_pairingstype(block),
        'has_featureCards': 'featureCards:' in block,
        'has_timeMins': 'timeMins:' in block,
        'has_custom_pairings': "'pairings'" in block and "e:" in block,
        'block': block,
    }
    recipes.append(r)

print(f"Loaded {len(recipes)} recipes\n")

# ══════════════════════════════════════════════════════════════════════════════
# PHASE 14 — INGREDIENT NORMALIZATION AUDIT
# ══════════════════════════════════════════════════════════════════════════════
print("=" * 70)
print("PHASE 14 — INGREDIENT QUALITY AUDIT")
print("=" * 70)

# Patterns that indicate vague/missing info
VAGUE_PATTERNS = [
    (r'^\s*(?:salt|pepper|oil|onion|garlic|herbs?|spices?|condiments?|water|flour|sugar|butter|egg|eggs)\s*$', 'bare_noun'),
    (r'^\s*(?:ceapă|usturoi|ulei|sare|piper|ierburi|condimente|apă|făină|zahăr|ouă?|unt)\s*$', 'bare_noun_ro'),
    (r'^[A-ZĂÂÎȘȚ][a-zăâîșț]+$', 'single_capitalized_word'),
    (r'^to taste$', 'to_taste'),
    (r'^(?:some|a few|handful|some|enough)\b', 'vague_quantity'),
]
NO_QUANTITY_PATTERN = re.compile(r'^\d|^[¼½¾⅓⅔⅛]|\d+\s*g|\d+\s*ml|\d+\s*kg|\d+\s*l\b|\d+\s*tsp|\d+\s*tbsp|\d+\s*cup|\d+\s*oz|\d+\s*lb|\d+\s*slice|\d+\s*pc|\d+\s*piece|\d+\s*clove|\d+\s*sprig|\d+\s*stalk|\d+\s*head|\d+\s*can|\d+\s*bunch|\d+\s*sheet|\d+\s*packet|\d+\s*pinch|\d+\s*drop|\d+\s*portion|\d+\s*rasher|\d+\s*fillet|salt|pepper|oil|water|fresh|to taste|for serv|for the|q\.s\.', re.I)

ingr_issues = []
ingr_stats = {'total_ingr': 0, 'no_quantity': 0, 'vague': 0, 'good': 0}

for r in recipes:
    ingr = r['ingr_en'] or r['ingr_ro']
    recipe_issues = []
    for item in ingr:
        ingr_stats['total_ingr'] += 1
        item_stripped = item.strip()

        # Check for quantity
        has_quantity = bool(NO_QUANTITY_PATTERN.match(item_stripped))

        # Check vagueness
        is_vague = False
        for pat, label in VAGUE_PATTERNS:
            if re.match(pat, item_stripped, re.I):
                is_vague = True
                break

        if is_vague:
            recipe_issues.append(('VAGUE', item_stripped))
            ingr_stats['vague'] += 1
        elif not has_quantity:
            recipe_issues.append(('NO_QTY', item_stripped))
            ingr_stats['no_quantity'] += 1
        else:
            ingr_stats['good'] += 1

    if recipe_issues:
        ingr_issues.append((r['id'], r['name'], recipe_issues, len(ingr)))

# Sort by number of issues
ingr_issues.sort(key=lambda x: len(x[2]), reverse=True)

print(f"\nIngredient stats: total={ingr_stats['total_ingr']}, good={ingr_stats['good']}, no_qty={ingr_stats['no_quantity']}, vague={ingr_stats['vague']}")
print(f"Recipes with ingredient issues: {len(ingr_issues)}")
print("\n[SEVERITY: HIGH] Recipes with 3+ ingredient issues:")
for rid, name, issues, total in ingr_issues:
    if len(issues) >= 3:
        print(f"\n  ID {rid:3d} {name}")
        for typ, item in issues[:5]:
            print(f"    [{typ}] {item[:70]}")

print("\n[SEVERITY: MEDIUM] Recipes with 1-2 ingredient issues:")
med_ingr = [(rid, name, issues) for rid, name, issues, _ in ingr_issues if 1 <= len(issues) <= 2]
for rid, name, issues in med_ingr[:30]:
    print(f"  ID {rid:3d} {name}: {issues[0][1][:60]}")

# ══════════════════════════════════════════════════════════════════════════════
# PHASE 15 — METHOD/STEP QUALITY AUDIT
# ══════════════════════════════════════════════════════════════════════════════
print("\n" + "=" * 70)
print("PHASE 15 — METHOD/STEP QUALITY AUDIT")
print("=" * 70)

TEMPLATE_PHRASES = [
    r'pregătește toate ingredientele',
    r'prepare all ingredients',
    r'wash.*peel.*cut everything',
    r'servește preparatul cald.*ingredientele preferate',
    r'serve warm.*garnished with fresh herbs.*favourite toppings',
    r'ingredientele preferate',
    r'favourite toppings',
    r'gătești mai ușor',
    r'following the recipe',
]
THIN_HOW = 300  # chars — suspiciously short

method_issues = []
for r in recipes:
    how = r['how_en'] or r['how_ro']
    issues = []

    if not how:
        issues.append('MISSING_METHOD')
    elif len(how) < THIN_HOW:
        issues.append(f'THIN_METHOD({len(how)}chars)')

    how_lower = how.lower()
    for pat in TEMPLATE_PHRASES:
        if re.search(pat, how_lower):
            issues.append(f'TEMPLATE_PHRASE: {pat[:40]}')

    # Check for duplicate sentences
    sentences = [s.strip() for s in re.split(r'[.!?]\s+', how) if len(s.strip()) > 20]
    seen = set()
    for s in sentences:
        key = ' '.join(s.lower().split()[:6])
        if key in seen:
            issues.append(f'DUPLICATE_SENTENCE: {s[:50]}')
        seen.add(key)

    if issues:
        method_issues.append((r['id'], r['name'], issues, len(how)))

method_issues.sort(key=lambda x: len(x[2]), reverse=True)

print(f"\nRecipes with method issues: {len(method_issues)}")
print("\n[SEVERITY: CRITICAL] Missing or template methods:")
for rid, name, issues, chars in method_issues:
    if any('MISSING' in i or 'TEMPLATE' in i or 'THIN' in i for i in issues):
        print(f"  ID {rid:3d} {name[:40]:40s} | {' | '.join(issues[:3])}")

# ══════════════════════════════════════════════════════════════════════════════
# PHASE 16 — STATIC DATA PATTERNS
# ══════════════════════════════════════════════════════════════════════════════
print("\n" + "=" * 70)
print("PHASE 16 — STATIC DATA AUDIT (Nutrition, Pairings, Badges)")
print("=" * 70)

# --- Nutrition analysis ---
COMMON_NUTRITION_FINGERPRINTS = Counter()
nutrition_patterns = defaultdict(list)
for r in recipes:
    n = r['nutrition']
    if n:
        # Check for suspiciously round numbers
        vals = list(n.values())
        round_count = sum(1 for v in vals if v % 50 == 0 or v % 25 == 0)
        sig = f"cal={n.get('cal',0)},prot={n.get('prot',0)},carb={n.get('carb',0)}"
        COMMON_NUTRITION_FINGERPRINTS[sig] += 1
        nutrition_patterns[sig].append((r['id'], r['name']))

print("\n[Nutrition] Duplicate nutrition fingerprints (identical values):")
dup_count = 0
for sig, count in COMMON_NUTRITION_FINGERPRINTS.most_common(20):
    if count > 1:
        dup_count += count
        recs = nutrition_patterns[sig]
        print(f"  [{count}x] {sig}")
        for rid, name in recs[:4]:
            print(f"        ID {rid:3d} {name}")

# Round number check
print("\n[Nutrition] Recipes with suspiciously round calorie values:")
round_cals = [(r['id'], r['name'], r['nutrition'].get('cal', 0))
              for r in recipes if r['nutrition'].get('cal', 0) % 50 == 0 and r['nutrition'].get('cal', 0) > 0]
for rid, name, cal in sorted(round_cals, key=lambda x: x[2])[:20]:
    print(f"  ID {rid:3d} {name[:40]:40s} cal={cal}")
print(f"  ... {len(round_cals)} recipes with round-50 calories")

# --- Pairings analysis ---
print("\n[Pairings] pairingsType distribution:")
pt_counter = Counter(r['pairingsType'] for r in recipes)
for pt, count in pt_counter.most_common():
    print(f"  {pt:12s} → {count:3d} recipes")

# --- TipType distribution ---
print("\n[tipType] distribution:")
tt_counter = Counter(r['tipType'] for r in recipes)
for tt, count in tt_counter.most_common():
    print(f"  {tt:12s} → {count:3d} recipes")

# ══════════════════════════════════════════════════════════════════════════════
# PHASE 17 — COMPLETENESS FLAGS
# ══════════════════════════════════════════════════════════════════════════════
print("\n" + "=" * 70)
print("PHASE 17 — RECIPE COMPLETENESS FLAGS")
print("=" * 70)

completeness_flags = []
for r in recipes:
    flags = []
    ingr = r['ingr_en'] or r['ingr_ro']
    how = r['how_en'] or r['how_ro']

    # Ingredient count
    if len(ingr) < 4:
        flags.append(f'FEW_INGR({len(ingr)})')

    # Method length
    if how and len(how) < 300:
        flags.append(f'THIN_METHOD')
    elif not how:
        flags.append('NO_METHOD')

    # Missing english content
    if not r['ingr_en'] and r['ingr_ro']:
        flags.append('EN_INGR_MISSING')
    if not r['how_en'] and r['how_ro']:
        flags.append('EN_METHOD_MISSING')
    if not r['origin_en']:
        flags.append('EN_ORIGIN_MISSING')

    # Nutrition missing
    if not r['nutrition']:
        flags.append('NO_NUTRITION')

    # No custom feature cards (uses generic auto-detection)
    if not r['has_featureCards']:
        flags.append('GENERIC_BADGES')

    if flags:
        completeness_flags.append((r['id'], r['name'], flags))

completeness_flags.sort(key=lambda x: len(x[2]), reverse=True)

print(f"\nRecipes with completeness issues: {len(completeness_flags)}")
print("\nTop 30 most incomplete recipes:")
for rid, name, flags in completeness_flags[:30]:
    print(f"  ID {rid:3d} {name[:35]:35s} | {' | '.join(flags)}")

print("\nFlag summary:")
flag_counter = Counter()
for _, _, flags in completeness_flags:
    for f in flags:
        key = re.sub(r'\(\d+\)', '', f)
        flag_counter[key] += 1
for flag, count in flag_counter.most_common():
    print(f"  {flag:25s} → {count:3d} recipes")

# ══════════════════════════════════════════════════════════════════════════════
# PHASE 18 — QUALITY TIER CLASSIFICATION
# ══════════════════════════════════════════════════════════════════════════════
print("\n" + "=" * 70)
print("PHASE 18 — QUALITY TIER CLASSIFICATION")
print("=" * 70)
print("Tier A = Premium editorial quality")
print("Tier B = Usable, needs refinement")
print("Tier C = Template/generated quality")

tiers = {'A': [], 'B': [], 'C': []}

for r in recipes:
    ingr = r['ingr_en'] or r['ingr_ro']
    how = r['how_en'] or r['how_ro']
    origin = r['origin_en']

    score = 0

    # Positive signals → higher score
    if r['has_featureCards']:          score += 3  # custom editorial badges
    if len(how) >= 800:                score += 3  # rich method text
    elif len(how) >= 500:              score += 2
    elif len(how) >= 300:              score += 1
    if len(ingr) >= 6:                 score += 2
    elif len(ingr) >= 4:              score += 1
    if r['ingr_en']:                   score += 1  # has EN ingredients
    if r['how_en']:                    score += 1  # has EN method
    if r['has_timeMins']:              score += 1  # accurate timing
    if len(origin) >= 300:             score += 2  # rich origin text

    # Check for ingredient quality (EN)
    ingr_with_qty = sum(1 for i in ingr if NO_QUANTITY_PATTERN.match(i.strip()))
    if ingr and ingr_with_qty / len(ingr) >= 0.8:
        score += 2
    elif ingr and ingr_with_qty / len(ingr) >= 0.5:
        score += 1

    # Negative signals
    how_lower = how.lower()
    for pat in TEMPLATE_PHRASES:
        if re.search(pat, how_lower):
            score -= 3
            break
    if not r['ingr_en']:               score -= 2
    if not r['how_en']:                score -= 2
    if len(how) < 200:                 score -= 2
    if len(ingr) < 3:                  score -= 2

    # Classify
    if score >= 10:
        tier = 'A'
    elif score >= 5:
        tier = 'B'
    else:
        tier = 'C'

    tiers[tier].append((r['id'], r['name'], score))

for tier in ['A', 'B', 'C']:
    items = sorted(tiers[tier], key=lambda x: x[2], reverse=True)
    print(f"\nTier {tier} ({len(items)} recipes):")
    for rid, name, score in items[:20 if tier != 'A' else 50]:
        print(f"  ID {rid:3d} {name[:45]:45s} score={score}")
    if len(items) > 20 and tier != 'A':
        print(f"  ... and {len(items)-20} more")

print(f"\nSUMMARY: Tier A={len(tiers['A'])}, Tier B={len(tiers['B'])}, Tier C={len(tiers['C'])}")

# ══════════════════════════════════════════════════════════════════════════════
# PHASE 19 — UI TRUST ISSUES
# ══════════════════════════════════════════════════════════════════════════════
print("\n" + "=" * 70)
print("PHASE 19 — UI TRUST AUDIT")
print("=" * 70)

# 1. Repeated originText opening patterns
print("\n[19a] OriginText: First-sentence opening pattern repetition")
openings = Counter()
opening_examples = defaultdict(list)
for r in recipes:
    text = r['origin_en'].strip()
    if text:
        first_sent = re.split(r'(?<=[.!?])\s+', text)[0][:80]
        # Normalize to skeleton
        norm = re.sub(r'\b[A-ZĂÂÎȘȚ][a-zăâîșț\-]+\b', 'DISH', first_sent, count=1)
        norm = re.sub(r'\d+', 'N', norm)
        skeleton = ' '.join(norm.lower().split()[:6])
        openings[skeleton] += 1
        opening_examples[skeleton].append((r['id'], r['name']))

print("  Top repeated skeletons:")
for skel, count in openings.most_common(10):
    print(f"    [{count}x] {skel}")

# 2. howIsMade patterns
print("\n[19b] HowIsMade: repeated opening phrases")
how_openings = Counter()
how_open_ex = defaultdict(list)
for r in recipes:
    how = (r['how_en'] or r['how_ro']).strip()
    if how:
        first_30 = how[:30].lower()
        how_openings[first_30] += 1
        how_open_ex[first_30].append((r['id'], r['name']))

print("  Repeated howIsMade openings (3+ recipes):")
for phrase, count in how_openings.most_common(15):
    if count >= 3:
        recs = how_open_ex[phrase]
        print(f"    [{count}x] '{phrase.strip()}'")
        for rid, name in recs[:3]:
            print(f"          ID {rid:3d} {name}")

# 3. Method length distribution
print("\n[19c] HowIsMade length distribution:")
lengths = [(r['id'], r['name'], len(r['how_en'] or r['how_ro'])) for r in recipes]
ranges = [(0, 100, 'EMPTY/TINY'), (100, 300, 'THIN'), (300, 600, 'MINIMAL'), (600, 900, 'OK'), (900, 9999, 'RICH')]
for lo, hi, label in ranges:
    bucket = [(rid, name) for rid, name, l in lengths if lo <= l < hi]
    print(f"  {label:10s} ({lo}-{hi}ch): {len(bucket)} recipes")

print("\n[19d] Recipes with THIN howIsMade (<300 chars):")
thin = [(rid, name, l) for rid, name, l in lengths if 0 < l < 300]
for rid, name, l in sorted(thin, key=lambda x: x[2]):
    print(f"  ID {rid:3d} {name[:40]:40s} {l}ch")

# 4. Ingredient count distribution
print("\n[19e] Ingredient count distribution:")
ic_dist = Counter(len(r['ingr_en'] or r['ingr_ro']) for r in recipes)
for count in sorted(ic_dist.keys()):
    print(f"  {count:2d} ingredients: {ic_dist[count]:3d} recipes {'⚠️' if count < 4 else ''}")

print("\n" + "=" * 70)
print("AUDIT COMPLETE")
print("=" * 70)
