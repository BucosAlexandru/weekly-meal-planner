#!/usr/bin/env python3
import re, sys
s = open('public/js/recipes.js', encoding='utf-8').read()
for rid in [160, 180, 30, 55, 96, 161]:
    m = re.search(rf'^\s*\{{\s*\n\s*id:\s*{rid},', s, re.M)
    pos = m.start(); depth = 0; i = pos
    while i < len(s):
        if s[i] == '{': depth += 1
        elif s[i] == '}':
            depth -= 1
            if depth == 0:
                end = i + 1
                break
        i += 1
    chunk = s[pos:end]
    nm = re.search(r'name:\s*\{[\s\S]*?en:\s*"([^"]*)"', chunk)
    name = nm.group(1) if nm else '?'
    print(f"\n========== id={rid}  {name}  ==========")
    ot = re.search(r'originText:\s*\{', chunk)
    if not ot:
        print("  NO originText")
        continue
    posb = ot.end() - 1; depth = 0; i = posb
    while i < len(chunk):
        if chunk[i] == '{': depth += 1
        elif chunk[i] == '}':
            depth -= 1
            if depth == 0:
                e = i + 1
                break
        i += 1
    body = chunk[posb:e]
    for lc in ['en', 'ro']:
        em = re.search(rf'\b{lc}:\s*"((?:[^"\\]|\\.)*)"', body)
        if em:
            txt = em.group(1).replace('\\n', '\n').replace('\\"', '"')
            print(f"  --- originText.{lc} ({len(txt)} chars) ---")
            print(f"  {txt[:500]}")
        else:
            print(f"  --- originText.{lc}: not found ---")
