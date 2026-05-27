#!/usr/bin/env python3
"""For each INTRO_ONLY recipe id, compute the time/costRon/tags that the
fillDefaults IIFE in public/js/recipes-meta.js would assign. Outputs
JSON keyed by id."""
import json

QUICK_IDS = {4,7,8,13,15,19,24,25,30,41,44,58,62,65,66,84,89,98,101,103,107,109,114,120,124,130,132,146,155,158,169,170,173,174,176}
BUDGET_IDS = {12,14,15,24,25,30,33,39,40,44,52,58,70,76,95,97,120,121,122,123,128,130,132,133,147,161,164,165,170,173,179}
VEG_IDS = {4,10,12,13,14,15,24,25,30,33,35,38,39,40,42,44,58,63,66,70,76,83,89,92,93,95,96,97,102,120,121,122,123,127,128,130,131,132,147,153,159,161,164,170,179}
SPICY_IDS = {9,16,19,36,49,50,67,69,75,78,86,87,99,102,110,112,165,166,169,179}

def compute(rid):
    isVeg = rid in VEG_IDS
    isQuick = rid in QUICK_IDS
    isBudget = rid in BUDGET_IDS
    isSpicy = rid in SPICY_IDS
    tags = []
    if isQuick: tags.append('quick')
    if isBudget: tags.append('budget')
    if isVeg: tags.append('vegetarian')
    else: tags.append('high-protein')
    if isSpicy: tags.append('spicy')
    if not isQuick: tags.append('family')
    time = 20 if isQuick else (30 if isBudget else 45)
    costRon = 14 if isBudget else (18 if isVeg else 26)
    return {'time': time, 'costRon': costRon, 'tags': tags}

dump = json.load(open('tools/intro_only_dump.json'))
out = {r['id']: compute(r['id']) for r in dump}
with open('tools/intro_only_defaults.json', 'w') as f:
    json.dump(out, f, indent=2, sort_keys=True)
print(f"Computed defaults for {len(out)} ids")
