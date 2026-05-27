#!/usr/bin/env python3
"""Read howIsMade in all 14 languages for a given recipe id."""
import re, sys, json
LANGS = ['ro','en','es','fr','de','pt','ru','ar','zh','ja','tr','it','ko','hi']

rid = int(sys.argv[1])
s = open('public/js/recipes.js', encoding='utf-8').read()
m = re.search(rf'^\s*\{{\s*\n\s*id:\s*{rid},', s, re.M)
pos = m.start(); depth=0; i=pos
while i < len(s):
    if s[i]=='{': depth+=1
    elif s[i]=='}':
        depth-=1
        if depth==0: end=i+1; break
    i+=1
chunk = s[pos:end]

fm = re.search(r'howIsMade:\s*\{', chunk)
p = fm.end()-1; depth=0; i=p
while i < len(chunk):
    if chunk[i]=='{': depth+=1
    elif chunk[i]=='}':
        depth-=1
        if depth==0: e=i+1; break
    i+=1
body = chunk[p:e]

SPLIT = re.compile(r'(?:\.\s+|[。！？]\s*)')
out = {}
for lc in LANGS:
    em = re.search(rf'\b{lc}:\s*"((?:[^"\\]|\\.)*)"', body)
    if em:
        txt = em.group(1).replace('\\n','\n').replace('\\"','"').replace("\\'","'")
        steps = [x.strip() for x in SPLIT.split(txt) if x.strip() and len(x.strip()) > 2]
        out[lc] = {'count': len(steps), 'text': txt}

print(f"=== howIsMade for id={rid} ===\n")
for lc in LANGS:
    d = out.get(lc, {'count': 0, 'text': '(missing)'})
    print(f"--- {lc} ({d['count']} pași) ---")
    print(d['text'])
    print()
