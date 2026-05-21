#!/usr/bin/env python3
"""
Global recipe quality audit script.
Parses public/js/recipes.js and reports quality issues.
"""

import re
import sys

with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    raw = f.read()

# ─── Extract recipe blocks ───────────────────────────────────────────────────

recipe_blocks = re.split(r'\n  \{\n', raw)
# Each block is roughly one recipe; extract id for labeling
def get_id(block):
    m = re.search(r'id:\s*(\d+)', block)
    return int(m.group(1)) if m else 0

def get_field_values(block, field):
    """Return list of all string values for a given field key (en locale preferred)."""
    # Try to find en: "..." inside field block
    pat = re.compile(rf'{field}:\s*\{{([^}}]{{0,8000}}?)\}}', re.DOTALL)
    m = pat.search(block)
    if not m:
        return []
    inner = m.group(1)
    # Extract all locale string values
    vals = re.findall(r'"([^"\\]|\\.)*"', inner)
    return [v.strip('"') for v in vals]

def get_locale_value(block, field, locale='en'):
    """Return the string value for a specific locale inside a field."""
    pat = re.compile(rf'{field}:\s*\{{([^}}]{{0,8000}}?)\}}', re.DOTALL)
    m = pat.search(block)
    if not m:
        return ''
    inner = m.group(1)
    loc_pat = re.compile(rf'\b{locale}:\s*"((?:[^"\\]|\\.)*)"')
    lm = loc_pat.search(inner)
    return lm.group(1) if lm else ''

def get_ingredients_list(block, locale='en'):
    """Return list of ingredient strings for a given locale."""
    pat = re.compile(r'ingredients:\s*\{([^}]{0,20000}?)\}', re.DOTALL)
    m = pat.search(block)
    if not m:
        return []
    inner = m.group(1)
    loc_pat = re.compile(rf'\b{locale}:\s*\[([^\]]*)\]', re.DOTALL)
    lm = loc_pat.search(inner)
    if not lm:
        return []
    arr = lm.group(1)
    items = re.findall(r'"((?:[^"\\]|\\.)*)"', arr)
    return items

def get_howismade(block, locale='en'):
    """Return howIsMade text for a given locale."""
    pat = re.compile(r'howIsMade:\s*\{([^}]{0,30000}?)\}', re.DOTALL)
    m = pat.search(block)
    if not m:
        return ''
    inner = m.group(1)
    loc_pat = re.compile(rf'\b{locale}:\s*"((?:[^"\\]|\\.)*)"')
    lm = loc_pat.search(inner)
    return lm.group(1) if lm else ''

def get_origintext(block, locale='en'):
    pat = re.compile(r'originText:\s*\{([^}]{0,10000}?)\}', re.DOTALL)
    m = pat.search(block)
    if not m:
        return ''
    inner = m.group(1)
    loc_pat = re.compile(rf'\b{locale}:\s*"((?:[^"\\]|\\.)*)"')
    lm = loc_pat.search(inner)
    return lm.group(1) if lm else ''

# ─── A. Generic AI phrases ────────────────────────────────────────────────────

AI_PHRASES = [
    'traditional dish',
    'bursting with flavor',
    'bursting with flavour',
    'beloved',
    'comfort food',
    'the secret is',
    'perfect for',
    'rich and flavorful',
    'rich and flavourful',
    'traditional recipe',   # in originText (stub marker)
]

# ─── B. Generic cooking step phrases ─────────────────────────────────────────

GENERIC_STEPS = [
    'prepare ingredients',
    'serve warm',
    'serve immediately',
    'add preferred toppings',
    'cook according to package',
    'cook according to packet',
    'garnish as desired',
    'adjust seasoning',
    'season to taste and serve',
]

# ─── C. Ingredient quantity check ────────────────────────────────────────────

QUANTITY_PATTERNS = [
    r'\d+',          # any digit
    r'\bto taste\b', # explicit qualifier
    r'\boptional\b',
    r'\bfor serving\b',
    r'\bfor garnish\b',
    r'\bto serve\b',
    r'\bpinch\b',
    r'\bhandful\b',
    r'\bdrizzle\b',
]
HAS_QUANTITY = re.compile('|'.join(QUANTITY_PATTERNS), re.IGNORECASE)

UNIT_WORDS = [
    'g', 'kg', 'ml', 'l', 'liter', 'litre', 'tbsp', 'tsp', 'cup', 'oz', 'lb',
    'piece', 'slice', 'sheet', 'clove', 'bunch', 'stalk', 'sprig',
    'can', 'tin', 'packet', 'handful', 'pinch', 'drizzle', 'drop',
    'head', 'bulb', 'strip', 'rasher', 'fillet', 'portion',
]
HAS_UNIT = re.compile(r'\b(' + '|'.join(UNIT_WORDS) + r')\b', re.IGNORECASE)

# ─── D. Stub originText detection ────────────────────────────────────────────

STUB_MARKERS = [
    'este o rețetă tradițională din',
    'is a traditional recipe from',
    'es una receta tradicional de',
    'est une recette traditionnelle',
    'ist ein traditionelles Rezept',
]

# ─── Main audit ──────────────────────────────────────────────────────────────

issues = []
stub_ids = []

blocks = re.split(r'(?=\n  \{\s*\n\s*id:)', raw)

for block in blocks:
    rid = get_id(block)
    if rid == 0:
        continue

    label = f"ID {rid}"

    # A. AI phrases in originText (en)
    ot = get_origintext(block, 'en')
    how = get_howismade(block, 'en')

    for phrase in AI_PHRASES:
        if phrase.lower() in ot.lower():
            issues.append(f"{label} [originText/en] AI phrase: '{phrase}'")
        if phrase.lower() in how.lower():
            issues.append(f"{label} [howIsMade/en] AI phrase: '{phrase}'")

    # B. Generic steps in howIsMade (en)
    for phrase in GENERIC_STEPS:
        if phrase.lower() in how.lower():
            issues.append(f"{label} [howIsMade/en] generic step: '{phrase}'")

    # C. Ingredients without quantity/unit (en)
    ingredients = get_ingredients_list(block, 'en')
    for ing in ingredients:
        ing_clean = ing.replace('\\n', ' ').strip()
        if not HAS_QUANTITY.search(ing_clean):
            issues.append(f"{label} [ingredients/en] no quantity: '{ing_clean[:60]}'")
        elif not HAS_UNIT.search(ing_clean):
            issues.append(f"{label} [ingredients/en] no unit: '{ing_clean[:60]}'")

    # D. Stub originText
    for marker in STUB_MARKERS:
        if marker in ot:
            stub_ids.append(rid)
            issues.append(f"{label} [originText] STUB detected")
            break

    # E. Duplicate/near-duplicate serving lines in howIsMade
    sentences = re.split(r'[.!]', how)
    seen_serves = 0
    for s in sentences:
        if re.search(r'\bserve\b', s, re.IGNORECASE):
            seen_serves += 1
    if seen_serves >= 3:
        issues.append(f"{label} [howIsMade/en] {seen_serves} serving references (possible duplication)")

    # F. Missing hi locale in originText
    ot_hi = get_origintext(block, 'hi')
    if not ot_hi:
        issues.append(f"{label} [originText] missing hi locale")

    # F2. Missing hi in ingredients
    ing_hi = get_ingredients_list(block, 'hi')
    if not ing_hi:
        issues.append(f"{label} [ingredients] missing hi locale")

# ─── Summary ─────────────────────────────────────────────────────────────────

print(f"\n{'='*60}")
print(f"RECIPE AUDIT REPORT — {len(issues)} issues found")
print(f"{'='*60}\n")

if stub_ids:
    print(f"STUB originText IDs: {sorted(set(stub_ids))}\n")

# Group by ID
by_id = {}
for issue in issues:
    m = re.match(r'ID (\d+)', issue)
    if m:
        rid = int(m.group(1))
        by_id.setdefault(rid, []).append(issue)

for rid in sorted(by_id):
    print(f"--- ID {rid} ---")
    for iss in by_id[rid]:
        print(f"  {iss}")
    print()

print(f"Total issues: {len(issues)}")
print(f"Affected recipes: {len(by_id)}")
