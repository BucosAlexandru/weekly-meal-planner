#!/usr/bin/env python3
"""Print ingredients (en) and originText (en) for given recipe ids."""
import re

s = open('public/js/recipes.js', encoding='utf-8').read()
for rid in [30, 55, 96, 161, 160, 180]:
    m = re.search(rf'^\s*\{{\s*\n\s*id:\s*{rid},', s, re.M)
    pos = m.start(); depth = 0; i = pos
    while i < len(s):
        if s[i] == '{': depth += 1
        elif s[i] == '}':
            depth -= 1
            if depth == 0: end = i+1; break
        i += 1
    chunk = s[pos:end]
    nm = re.search(r'name:\s*\{[\s\S]*?en:\s*"([^"]*)"', chunk)
    print(f"\n========== id={rid}  {nm.group(1)} ==========")

    # ingredients EN
    ing = re.search(r'ingredients:\s*\{', chunk)
    if ing:
        posb = ing.end()-1; depth = 0; i = posb
        while i < len(chunk):
            if chunk[i] == '{': depth += 1
            elif chunk[i] == '}':
                depth -= 1
                if depth == 0: e = i+1; break
            i += 1
        body = chunk[posb:e]
        em = re.search(r'\ben:\s*\[([\s\S]*?)\]', body)
        if em:
            arr = em.group(1)
            items = re.findall(r'"((?:[^"\\]|\\.)*)"', arr)
            print(f"--- ingredients.en ---")
            for it in items:
                print(f"  • {it}")

    # originText EN
    ot = re.search(r'originText:\s*\{', chunk)
    if ot:
        posb = ot.end()-1; depth = 0; i = posb
        while i < len(chunk):
            if chunk[i] == '{': depth += 1
            elif chunk[i] == '}':
                depth -= 1
                if depth == 0: e = i+1; break
            i += 1
        body = chunk[posb:e]
        em = re.search(r'\ben:\s*"((?:[^"\\]|\\.)*)"', body)
        if em:
            txt = em.group(1).replace('\\n', '\n').replace('\\"', '"')
            print(f"--- originText.en ({len(txt)} chars) ---")
            print(txt)
