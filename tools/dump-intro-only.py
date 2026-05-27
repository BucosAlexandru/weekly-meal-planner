#!/usr/bin/env python3
"""Enumerate all INTRO_ONLY recipes (have originText but lack recipesMeta.desc)
and dump originText.en for each, plus origin + name."""
import re, json

# Parse recipes.js — gather all recipes' id, name.en, origin.en, originText.en
rec = open('public/js/recipes.js', encoding='utf-8').read()
recipes = {}
for m in re.finditer(r'^\s*\{\s*\n\s*id:\s*(\d+),', rec, re.M):
    rid = int(m.group(1))
    pos = m.start(); depth=0; i=pos
    while i < len(rec):
        if rec[i]=='{': depth+=1
        elif rec[i]=='}':
            depth-=1
            if depth==0: end=i+1; break
        i+=1
    chunk = rec[pos:end]
    nm = re.search(r'name:\s*\{[\s\S]*?en:\s*"([^"]*)"', chunk)
    om = re.search(r'origin:\s*\{[\s\S]*?en:\s*"([^"]*)"', chunk)
    name = nm.group(1) if nm else '?'
    origin = om.group(1) if om else '?'
    # originText.en
    ot_match = re.search(r'originText:\s*\{', chunk)
    ot_en = ''
    if ot_match:
        posb = ot_match.end()-1; depth=0; i=posb
        while i < len(chunk):
            if chunk[i]=='{': depth+=1
            elif chunk[i]=='}':
                depth-=1
                if depth==0: e=i+1; break
            i+=1
        body = chunk[posb:e]
        em = re.search(r'\ben:\s*"((?:[^"\\]|\\.)*)"', body)
        if em:
            ot_en = em.group(1).replace('\\n','\n').replace('\\"','"')
    recipes[rid] = {'name': name, 'origin': origin, 'originText_en': ot_en, 'has_origintext': bool(ot_en)}

# Parse recipes-meta.js — find ids with desc: d(...)
meta = open('public/js/recipes-meta.js', encoding='utf-8').read()
m = re.search(r'export const recipesMeta\s*=\s*\{', meta)
start = m.end()-1; depth=0; i=start
while i < len(meta):
    if meta[i]=='{': depth+=1
    elif meta[i]=='}':
        depth-=1
        if depth==0: end=i+1; break
    i+=1
body = meta[start+1:end-1]
ids_with_meta_desc = set()
for m in re.finditer(r'(\d+)\s*:\s*\{', body):
    rid = int(m.group(1))
    pos = m.end()-1; depth=0; i=pos
    while i < len(body):
        if body[i]=='{': depth+=1
        elif body[i]=='}':
            depth-=1
            if depth==0: e=i+1; break
        i+=1
    entry = body[pos:e]
    if re.search(r'\bdesc\s*:\s*d\s*\(', entry):
        ids_with_meta_desc.add(rid)

# Build INTRO_ONLY list, ordered by origin then id
intro_only = []
neither = []
for rid, r in recipes.items():
    if r['has_origintext'] and rid not in ids_with_meta_desc:
        intro_only.append(rid)
    elif not r['has_origintext'] and rid not in ids_with_meta_desc:
        neither.append(rid)

intro_only.sort(key=lambda i: (recipes[i]['origin'], i))

print(f"INTRO_ONLY count: {len(intro_only)}")
print(f"NEITHER count: {len(neither)}")
print()
# Dump JSON for downstream processing
out = []
for rid in intro_only:
    r = recipes[rid]
    # First two sentences of originText.en (rough split)
    ot = r['originText_en'].strip()
    # Use up to first 280 chars or 2 sentences
    parts = re.split(r'(?<=[.!?])\s+', ot)
    first_two = ' '.join(parts[:2])[:400]
    out.append({'id': rid, 'name': r['name'], 'origin': r['origin'],
                'first_sentences': first_two})

with open('tools/intro_only_dump.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)
print(f"Dumped {len(out)} INTRO_ONLY records to tools/intro_only_dump.json")
if neither:
    print(f"\nHARD STOP: recipes truly lacking BOTH originText and meta.desc:")
    for rid in neither:
        print(f"  id={rid}  {recipes[rid]['name']}  ({recipes[rid]['origin']})")
