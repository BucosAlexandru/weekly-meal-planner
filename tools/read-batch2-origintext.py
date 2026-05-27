#!/usr/bin/env python3
"""Print name + originText.en for a list of recipe ids."""
import re

IDS = [31, 140, 143, 178,        # France
       36, 94, 111, 149, 162,    # Mexico
       23, 66, 102, 156]          # South Korea

s = open('public/js/recipes.js', encoding='utf-8').read()
for rid in IDS:
    m = re.search(rf'^\s*\{{\s*\n\s*id:\s*{rid},', s, re.M)
    if not m:
        print(f"\n========== id={rid} : NOT FOUND ==========")
        continue
    pos = m.start(); depth = 0; i = pos
    while i < len(s):
        if s[i] == '{': depth += 1
        elif s[i] == '}':
            depth -= 1
            if depth == 0: end = i + 1; break
        i += 1
    chunk = s[pos:end]
    nm = re.search(r'name:\s*\{[\s\S]*?en:\s*"([^"]*)"', chunk)
    name = nm.group(1) if nm else '?'
    om = re.search(r'origin:\s*\{[\s\S]*?en:\s*"([^"]*)"', chunk)
    origin = om.group(1) if om else '?'
    print(f"\n========== id={rid}  {name}  ({origin}) ==========")
    ot = re.search(r'originText:\s*\{', chunk)
    if not ot:
        print("  NO originText field")
        continue
    posb = ot.end() - 1; depth = 0; i = posb
    while i < len(chunk):
        if chunk[i] == '{': depth += 1
        elif chunk[i] == '}':
            depth -= 1
            if depth == 0: e = i + 1; break
        i += 1
    body = chunk[posb:e]
    em = re.search(r'\ben:\s*"((?:[^"\\]|\\.)*)"', body)
    if em:
        txt = em.group(1).replace('\\n', '\n').replace('\\"', '"')
        print(f"--- originText.en ({len(txt)} chars) ---")
        print(txt)
    else:
        print("  originText.en missing")
