#!/usr/bin/env python3
"""Print howIsMade.en + ingredients.en for a list of recipe ids."""
import re, sys

s = open('public/js/recipes.js', encoding='utf-8').read()
for rid in [207, 206, 205, 204, 202, 201, 200, 199, 198]:
    m = re.search(rf'^\s*\{{\s*\n\s*id:\s*{rid},', s, re.M)
    pos = m.start(); depth=0; i=pos
    while i < len(s):
        if s[i]=='{': depth+=1
        elif s[i]=='}':
            depth-=1
            if depth==0: end=i+1; break
        i+=1
    chunk = s[pos:end]
    nm = re.search(r'name:\s*\{[\s\S]*?en:\s*"([^"]*)"', chunk)
    name = nm.group(1) if nm else '?'

    him = re.search(r'howIsMade:\s*\{', chunk)
    pos2 = him.end()-1; depth=0; i=pos2
    while i < len(chunk):
        if chunk[i]=='{': depth+=1
        elif chunk[i]=='}':
            depth-=1
            if depth==0: e=i+1; break
        i+=1
    body = chunk[pos2:e]
    em = re.search(r'\ben:\s*"((?:[^"\\]|\\.)*)"', body)
    how = em.group(1).replace('\\n','\n').replace('\\"','"') if em else ''

    print(f"\n{'='*78}")
    print(f"id={rid}  {name}")
    print('='*78)
    print(how)
