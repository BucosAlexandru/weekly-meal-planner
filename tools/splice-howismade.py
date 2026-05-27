#!/usr/bin/env python3
"""Splice a new howIsMade block (14 langs) into public/js/recipes.js for a given recipe id.

Usage:
  echo '{"id": 194, "how": {"ro": "...", "en": "...", ...}}' | python3 tools/splice-howismade.py

Reads JSON from stdin. Validates: 14 lang keys, no curly quotes, no double-quote in values.
Writes recipes.js in place.
"""
import json, re, sys

LANGS = ['ro','en','es','fr','de','pt','ru','ar','zh','ja','tr','it','ko','hi']

def main():
    payload = json.load(sys.stdin)
    rid = payload['id']
    how = payload['how']
    assert set(how.keys()) == set(LANGS), f"missing langs: {set(LANGS) - set(how.keys())}"
    for lg, text in how.items():
        assert '‘' not in text and '’' not in text, f"curly quote in {lg}"

    path = 'public/js/recipes.js'
    s = open(path, encoding='utf-8').read()
    # Locate recipe by id
    m = re.search(rf'^\s*\{{\s*\n\s*id:\s*{rid},', s, re.M)
    if not m:
        sys.exit(f"recipe id={rid} not found")
    pos, depth, i = m.start(), 0, m.start()
    while i < len(s):
        if s[i] == '{': depth += 1
        elif s[i] == '}':
            depth -= 1
            if depth == 0:
                end = i + 1
                break
        i += 1
    chunk = s[pos:end]
    # Find howIsMade: { ... } inside chunk (preserve outer indent)
    hm = re.search(r'(howIsMade:\s*\{)([\s\S]*?)(\n\s{4}\})', chunk)
    if not hm:
        sys.exit("howIsMade block not found in recipe chunk")
    indent_inner = '      '  # match existing style (6 spaces)
    body_lines = []
    for lg in LANGS:
        # Escape: backslashes, double quotes, newlines
        t = how[lg].replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')
        body_lines.append(f'{indent_inner}{lg}: "{t}"')
    new_body = '\n' + ',\n'.join(body_lines) + '\n    '
    new_chunk = chunk[:hm.start(1)] + 'howIsMade: {' + new_body + '}' + chunk[hm.end(3):]
    new_s = s[:pos] + new_chunk + s[end:]
    open(path, 'w', encoding='utf-8').write(new_s)
    print(f"✓ id={rid} howIsMade updated (14 langs)")

if __name__ == '__main__':
    main()
