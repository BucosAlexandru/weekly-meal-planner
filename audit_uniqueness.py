#!/usr/bin/env python3
"""
Editorial uniqueness audit for originText (en locale).
Detects repetition and weak patterns across all recipes.
"""

import re
from collections import defaultdict, Counter

# ─── Load file ────────────────────────────────────────────────────────────────

with open('public/js/recipes.js', 'r', encoding='utf-8') as f:
    raw = f.read()

# ─── Split into recipe blocks ─────────────────────────────────────────────────

blocks = re.split(r'(?=\n  \{\s*\n\s*id:)', raw)


def get_id(block):
    m = re.search(r'id:\s*(\d+)', block)
    return int(m.group(1)) if m else 0


def get_name_en(block):
    pat = re.compile(r'name:\s*\{([^}]{0,2000}?)\}', re.DOTALL)
    m = pat.search(block)
    if not m:
        return ''
    inner = m.group(1)
    lm = re.search(r'\ben:\s*"((?:[^"\\]|\\.)*)"', inner)
    return lm.group(1) if lm else ''


def get_origintext_en(block):
    """Extract originText en value using the regex specified in the task."""
    pat = re.compile(r'originText:.*?en:\s*"((?:[^"\\]|\\.)*)"', re.DOTALL)
    m = pat.search(block)
    if not m:
        return ''
    raw_text = m.group(1)
    # Unescape JS escape sequences
    text = raw_text.replace('\\n', '\n').replace('\\"', '"').replace('\\\\', '\\')
    return text


# ─── Collect all en originTexts ───────────────────────────────────────────────

recipes = []  # list of (id, name, origintext_en)

for block in blocks:
    rid = get_id(block)
    if rid == 0:
        continue
    name = get_name_en(block)
    ot = get_origintext_en(block)
    if ot:
        recipes.append((rid, name, ot))

print(f"Loaded {len(recipes)} recipes with en originText\n")

# ─── Stop words ───────────────────────────────────────────────────────────────

STOP_WORDS = {
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'not',
    'this', 'that', 'these', 'those', 'it', 'its', 'their', 'they',
    'he', 'she', 'we', 'you', 'i', 'me', 'him', 'her', 'us', 'them',
    'what', 'which', 'who', 'whom', 'when', 'where', 'why', 'how',
    'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
    'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'out', 'off', 'over', 'under', 'then', 'once',
    'no', 'nor', 'so', 'yet', 'still', 'just', 'than', 'such',
    'also', 'well', 'up', 'about', 'while', 'if',
}


def tokenize(text):
    """Lowercase and split into word tokens, stripping punctuation."""
    text = text.lower()
    text = re.sub(r'[—–\-]', ' ', text)
    words = re.findall(r"[a-z']+", text)
    words = [w.strip("'") for w in words]
    words = [w for w in words if w]
    return words


def is_all_stop_words(gram_words):
    return all(w in STOP_WORDS for w in gram_words)


def has_enough_content(gram_words):
    """True if at least 2 words in the ngram are not stop words."""
    non_stop = sum(1 for w in gram_words if w not in STOP_WORDS)
    return non_stop >= 2


# ─── 1. Most repeated n-grams (3-6 word phrases) ─────────────────────────────

print("=" * 70)
print("1. MOST REPEATED N-GRAMS (3-6 words) — top 30 by recipe count")
print("=" * 70)

# ngram -> set of recipe ids that contain it
ngram_recipes = defaultdict(set)

for rid, name, ot in recipes:
    words = tokenize(ot)
    seen_ngrams = set()
    for n in range(3, 7):
        for i in range(len(words) - n + 1):
            gram = tuple(words[i:i + n])
            if not has_enough_content(gram):
                continue
            gram_str = ' '.join(gram)
            if gram_str not in seen_ngrams:
                ngram_recipes[gram_str].add(rid)
                seen_ngrams.add(gram_str)

# Filter to n-grams appearing in 3+ recipes and sort by count desc
ranked_ngrams = sorted(
    [(phrase, len(ids)) for phrase, ids in ngram_recipes.items() if len(ids) >= 3],
    key=lambda x: (-x[1], x[0])
)

for phrase, count in ranked_ngrams[:30]:
    print(f"  [{count:3d} recipes]  \"{phrase}\"")

print()

# ─── 2. Opening sentence patterns ────────────────────────────────────────────
# Extract first sentence of each en originText, then replace the recipe name
# with [DISH] to reveal structural skeleton patterns.

print("=" * 70)
print("2. OPENING SENTENCE PATTERNS — structural skeletons used by 3+ recipes")
print("=" * 70)


def get_first_sentence(text):
    """Return the first sentence of the text."""
    # Split on . followed by space+capital or end of string, or ! or ?
    m = re.search(r'\.(?=\s+[A-Z]|\s*$)', text)
    if m:
        return text[:m.start() + 1].strip()
    return text.strip()


def extract_opening_skeleton(first_sent, name):
    """
    Detect the grammatical skeleton of a recipe's opening sentence.
    Priority order ensures specific patterns win over broad ones.
    """
    sent = first_sent.strip()
    sent_lower = sent.lower()

    # Structural patterns to detect — listed most-specific first
    patterns = [
        # "[Dish] is one of the ..."
        (r'\bis\s+one\s+of\s+the\s+', '[DISH] is one of the [SUPERLATIVE]...'),
        # "[Dish] is the most ..."
        (r'\bis\s+the\s+most\s+', '[DISH] is the most [ADJ]...'),
        # "[Dish] is among the ..."
        (r'\bis\s+among\s+the\s+', '[DISH] is among the [SUPERLATIVE]...'),
        # "[Dish] has its roots in ..."
        (r'\bhas\s+its\s+roots\s+in\s+', '[DISH] has its roots in [PLACE]'),
        # "[Dish] traces its ... to / traces back to ..."
        (r'\btraces\s+(?:its\s+\w+\s+to|back\s+to|to)\b', '[DISH] traces [its X] to [PLACE/TIME]'),
        # "[Dish] originates from/in ..."
        (r'\boriginates?\s+from\b', '[DISH] originates from [PLACE]'),
        # "[Dish] comes from ..."
        (r'\bcomes\s+from\b', '[DISH] comes from [PLACE]'),
        # "[Dish] arrived in/from ..."
        (r'\barrived\s+(?:in|from)\b', '[DISH] arrived in [PLACE]'),
        # "[Dish] took shape in ..."
        (r'\btook\s+shape\s+in\b', '[DISH] took shape in [PLACE/TIME]'),
        # "[Dish] began/started ..."
        (r'\b(?:began|started)\s+as\b', '[DISH] began/started as [NOUN]'),
        # "[Dish] belongs to ..."
        (r'\bbelongs\s+to\b', '[DISH] belongs to [PLACE/TRADITION]'),
        # "[Dish] is [a/the/an] [adj] [noun] of [Place/Region]"
        (r'\bis\s+(?:a|the|an)\s+\w+\s+\w+\s+of\s+[A-Z]', '[DISH] is [DET] [ADJ] [NOUN] of [PLACE]'),
        # "[Dish] is [a/the/an] [word] [word] ..." — broad "[Dish] is [DET]..." catch
        (r'\bis\s+(?:a|an|the)\s+\w+', '[DISH] is [a/an/the] [NOUN/ADJ]...'),
        # "[Dish] is [word]..." — bare "is" with no article
        (r'\bis\s+\w+', '[DISH] is [NOUN/ADJ] (bare)'),
        # "[Dish] are [...]"
        (r'\bare\s+(?:a|an|the)\s+\w+', '[DISH] are [DET] [NOUN]...'),
        # "[Dish] are [word]..."
        (r'\bare\s+\w+', '[DISH] are [NOUN/ADJ]...'),
        # "[Dish] was [verb]ed ..."
        (r'\bwas\s+\w+', '[DISH] was [VERB-ed/ADJ]...'),
        # "[Dish] [verb]s [...]" — other verbs
        (r'\bhas\b', '[DISH] has [NOUN]...'),
        (r'\btakes\b', '[DISH] takes [NOUN] from [PLACE]'),
    ]

    for regex, label in patterns:
        if re.search(regex, sent_lower):
            return label

    # Fallback: first 5 normalised words
    words = tokenize(sent)
    return '[OTHER] ' + ' '.join(words[:5])


opening_skeleton_recipes = defaultdict(list)

for rid, name, ot in recipes:
    first_para = ot.split('\n\n')[0].strip()
    first_sent = get_first_sentence(first_para)
    skeleton = extract_opening_skeleton(first_sent, name)
    opening_skeleton_recipes[skeleton].append((rid, name, first_sent))

ranked_openings = sorted(
    [(skel, recs) for skel, recs in opening_skeleton_recipes.items() if len(recs) >= 3],
    key=lambda x: (-len(x[1]), x[0])
)

for skel, recs in ranked_openings:
    print(f"\n  [{len(recs):3d} recipes]  PATTERN: {skel}")
    for rid, rname, sent in recs:
        print(f"    ID {rid:3d}  {rname:<35}  \"{sent[:90]}\"")

if not ranked_openings:
    print("  (No pattern used by 3+ recipes)")

print()

# ─── 3. Second paragraph openings (first 8 words after \n\n) ─────────────────

print("=" * 70)
print("3. SECOND PARAGRAPH OPENINGS (first 8 words) — patterns used by 2+ recipes")
print("=" * 70)

p2_skeleton_recipes = defaultdict(list)


def p2_skeleton(text):
    """Structural skeleton of the second paragraph opening."""
    # Similar approach: detect key structures
    tl = text.lower()
    patterns_p2 = [
        (r'^the\s+broth\s+is\s+', 'The broth is [EVERYTHING/KEY]...'),
        (r'^the\s+dough\s+is\s+', 'The dough is [KEY]...'),
        (r'^the\s+sauce\s+is\s+', 'The sauce is [KEY]...'),
        (r'^the\s+batter\s+is\s+', 'The batter is [KEY]...'),
        (r'^the\s+filling\s+is\s+', 'The filling is [KEY]...'),
        (r'^the\s+base\s+is\s+', 'The base is [KEY]...'),
        (r'^the\s+key\s+(?:technique|ingredient|step|difference)\s+is\s+', 'The key [NOUN] is [...]'),
        (r'^the\s+technique\s+is\s+', 'The technique is [...]'),
        (r'^the\s+secret\s+is\s+', 'The secret is [...]'),
        (r'^the\s+difference\s+is\s+', 'The difference is [...]'),
        (r'^the\s+process\s+is\s+', 'The process is [...]'),
        (r'^the\s+most\s+important\s+', 'The most important [NOUN] is...'),
        (r'^the\s+\w+\s+is\s+what\s+', 'The [NOUN] is what [...]'),
        (r'^the\s+\w+\s+is\s+everything', 'The [NOUN] is everything'),
        (r'^the\s+\w+\s+is\s+', 'The [NOUN] is [KEY]...'),
        (r'^what\s+separates\s+', 'What separates [GREAT] from [ORDINARY]...'),
        (r'^what\s+makes\s+', 'What makes [DISH] [SPECIAL]...'),
        (r'^what\s+defines\s+', 'What defines [DISH]...'),
    ]
    for regex, label in patterns_p2:
        if re.search(regex, tl):
            return label
    # Fallback: first 6 words
    words = tokenize(text)
    return ' '.join(words[:6])


for rid, name, ot in recipes:
    parts = ot.split('\n\n')
    if len(parts) < 2:
        continue
    second_para = parts[1].strip()
    words = tokenize(second_para)
    # Use raw first 8 words as pattern key
    pattern = ' '.join(words[:8])
    p2_skeleton_recipes[pattern].append((rid, name, second_para[:120]))

ranked_p2 = sorted(
    [(pat, recs) for pat, recs in p2_skeleton_recipes.items() if len(recs) >= 2],
    key=lambda x: (-len(x[1]), x[0])
)

if ranked_p2:
    for pat, recs in ranked_p2:
        print(f"\n  [{len(recs):3d} recipes]  \"{pat}\"")
        for rid, rname, preview in recs:
            print(f"    ID {rid:3d}  {rname:<35}  \"{preview[:80]}\"")
else:
    print("\n  All second-paragraph openings are unique (no pattern repeated in 2+ recipes).")

print()

# ─── 4. Closing sentence patterns ────────────────────────────────────────────

print("=" * 70)
print("4. CLOSING SENTENCE PATTERNS — used by 2+ recipes")
print("=" * 70)


def get_last_sentence(text):
    """Return the last meaningful sentence of the text."""
    text = text.strip()
    # Split on sentence boundaries
    sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z—])', text)
    for sent in reversed(sentences):
        sent = sent.strip().rstrip('.!?')
        if len(sent.split()) >= 4:
            return sent
    return text[-200:].strip()


closing_skeleton_recipes = defaultdict(list)


def closing_skeleton(text):
    """Extract structural pattern from closing sentence."""
    tl = text.lower()
    patterns_close = [
        (r'\bit is one of the\b', '[...] it is one of the [SUPERLATIVE]...'),
        (r'\bit is the\b', '[...] it is the [ADJ/NOUN]...'),
        (r'\bit is a\b', '[...] it is a [NOUN]...'),
        (r'\bserved with\b', '[...] served with [ACCOMPANIMENT]...'),
        (r'\bserved (?:immediately|hot|warm|cold|at)\b', '[...] served [HOW]...'),
        (r'\bthe result is\b', '[...] the result is [ADJ]...'),
        (r'\bthat is the\b', '[...] that is the [NOUN]...'),
        (r'\ba squeeze of\b', '[...] a squeeze of [ACID] [completes]...'),
        (r'\bthe dish is\b', '[...] the dish is [ADJ/COMPLETE]...'),
        (r'\bis not optional\b', '[...] is not optional...'),
        (r'\bis not (?:a |just |simply )\b', '[...] is not [just/simply] [NOUN]...'),
        (r'\bmade a day ahead\b', '[...] made a day ahead...'),
        (r'\bthe only\b', '[...] the only [NOUN] that matters...'),
    ]
    for regex, label in patterns_close:
        if re.search(regex, tl):
            return label
    # Fallback: first 8 tokenized words
    words = tokenize(text)
    return ' '.join(words[:8])


for rid, name, ot in recipes:
    last_sent = get_last_sentence(ot)
    skeleton = closing_skeleton(last_sent)
    closing_skeleton_recipes[skeleton].append((rid, name, last_sent))

ranked_closing = sorted(
    [(skel, recs) for skel, recs in closing_skeleton_recipes.items() if len(recs) >= 2],
    key=lambda x: (-len(x[1]), x[0])
)

if ranked_closing:
    for skel, recs in ranked_closing:
        print(f"\n  [{len(recs):3d} recipes]  PATTERN: {skel}")
        for rid, rname, sent in recs:
            print(f"    ID {rid:3d}  {rname:<35}  \"{sent[:90]}\"")
else:
    print("\n  All closing sentences are unique (no pattern repeated in 2+ recipes).")

print()

# ─── 5. Weak adjective frequency ─────────────────────────────────────────────

print("=" * 70)
print("5. WEAK ADJECTIVE / CLICHE WORD FREQUENCY (across all en originTexts)")
print("=" * 70)

WEAK_WORDS = [
    'rich', 'hearty', 'fragrant', 'tender', 'silky', 'complex', 'bold',
    'vibrant', 'robust', 'staple', 'quintessential', 'iconic', 'renowned',
    'celebrated', 'satisfying', 'nourishing', 'wholesome', 'warming',
    'comforting', 'hallmark', 'cornerstone', 'pillar', 'essence', 'soul',
    'heart', 'embodiment', 'epitome', 'testament', 'pinnacle',
]

word_total = Counter()
word_recipe_count = Counter()

for rid, name, ot in recipes:
    text_lower = ot.lower()
    for w in WEAK_WORDS:
        count = len(re.findall(r'\b' + re.escape(w) + r'\b', text_lower))
        if count > 0:
            word_total[w] += count
            word_recipe_count[w] += 1

print(f"  {'Word':<20} {'Total':>6}  {'Recipes':>8}  {'% of all':>10}")
print(f"  {'-'*20}  {'-'*6}  {'-'*8}  {'-'*10}")
for w in sorted(WEAK_WORDS, key=lambda x: -word_total[x]):
    total = word_total[w]
    rcount = word_recipe_count[w]
    pct = 100.0 * rcount / len(recipes)
    bar = '█' * min(total, 40)
    print(f"  {w:<20}  {total:>6}  {rcount:>8}  {pct:>9.1f}%  {bar}")

print()

# ─── 6. Structural similarity — grammatical skeleton matching ─────────────────

print("=" * 70)
print("6. STRUCTURAL SIMILARITY — grammatical skeleton patterns in first sentence")
print("=" * 70)

skeleton_groups = defaultdict(list)

# Pattern A: "[Dish ...] is [a/the] [adjective(s)] [noun] of [Country/region]"
pat_A = re.compile(
    r'^[^.]{0,80}?\bис\b|'
    r'^([A-Z—][^.!?\n]{1,80}?)\s+is\s+(a|the)\s+([a-z]+(?:\s+[a-z]+){0,2})\s+([a-z]+)\s+of\s+([A-Z][^\s,]+)',
    re.MULTILINE
)
pat_A_clean = re.compile(
    r'\bis\s+(a|the)\s+([a-z]+(?:\s+[a-z]+){0,2})\s+([a-z]+)\s+of\s+([A-Z][^\s,.—]+)'
)

# Pattern B: "[Dish] is one of the / the most / among the ..."
pat_B = re.compile(r'\bis\s+(one of the|the most|among the)\s+', re.IGNORECASE)

# Pattern C: "[Dish] is [a/an/the] [word] [word]"
pat_C = re.compile(r'\bis\s+(a|an|the)\s+([a-z]+)\s+([a-z]+)', re.IGNORECASE)

# Pattern D: "[Dish] has its roots in ..."
pat_D = re.compile(r'\bhas its roots in\b', re.IGNORECASE)

# Pattern E: "[Dish] traces its [noun] to / traces back to ..."
pat_E = re.compile(r'\btraces\s+(?:its\s+\w+\s+)?(?:back\s+)?to\b', re.IGNORECASE)

# Pattern F: "[Dish] originates from/in ..."
pat_F = re.compile(r'\boriginates?\s+from\b', re.IGNORECASE)

# Pattern G: "[Dish] arrived in/from ..."
pat_G = re.compile(r'\barrived\s+(?:in|from)\b', re.IGNORECASE)

# Pattern H: "[Dish] is [a/the] [signature/national/defining/emblematic/quintessential]..."
pat_H = re.compile(
    r'\bis\s+(?:a|the)\s+(signature|national|defining|emblematic|quintessential|essential|iconic|'
    r'classic|staple|traditional|most celebrated|most recognized|most recognisable|most iconic|'
    r'soul|cornerstone|hallmark)\b',
    re.IGNORECASE
)

for rid, name, ot in recipes:
    first_para = ot.split('\n\n')[0].strip()
    # Get first sentence only
    first_sent_m = re.search(r'^[^.!?]*[.!?]', first_para)
    first_sent = first_sent_m.group(0).strip() if first_sent_m else first_para[:200]

    # For skeleton matching, only examine the OPENING of the sentence (first ~20 words)
    # to avoid being fooled by subordinate clauses.  We strip em-dash parentheticals first.
    # Remove parenthetical inserts like "— word means simply ... —"
    stripped = re.sub(r'—[^—]{0,80}—', '', first_sent).strip()
    opening = ' '.join(stripped.split()[:20])
    opening_lower = opening.lower()

    if pat_B.search(opening_lower):
        m = pat_B.search(opening_lower)
        skel = f"[Dish] is {m.group(1)} ..."
        skeleton_groups[skel].append((rid, name, first_sent))
    elif pat_D.search(opening_lower):
        skeleton_groups['[Dish] has its roots in [Place]'].append((rid, name, first_sent))
    elif pat_E.search(opening_lower):
        skeleton_groups['[Dish] traces [its X] back to [Place/Time]'].append((rid, name, first_sent))
    elif pat_F.search(opening_lower):
        skeleton_groups['[Dish] originates from [Place]'].append((rid, name, first_sent))
    elif re.search(r'\bcomes\s+from\b', opening_lower):
        skeleton_groups['[Dish] comes from [Place]'].append((rid, name, first_sent))
    elif pat_G.search(opening_lower):
        skeleton_groups['[Dish] arrived in/from [Place]'].append((rid, name, first_sent))
    elif re.search(r'\btook\s+shape\s+in\b', opening_lower):
        skeleton_groups['[Dish] took shape in [Place/Time]'].append((rid, name, first_sent))
    elif re.search(r'\b(?:began|started)\s+as\b', opening_lower):
        skeleton_groups['[Dish] began/started as [Noun]'].append((rid, name, first_sent))
    elif pat_H.search(opening_lower):
        m = pat_H.search(opening_lower)
        skel = f"[Dish] is [a/the] {m.group(1).lower()} ..."
        skeleton_groups[skel].append((rid, name, first_sent))
    elif pat_A_clean.search(opening_lower):
        m = pat_A_clean.search(opening_lower)
        skel = f"[Dish] is {m.group(1)} [adj] [noun] of [Place]"
        skeleton_groups[skel].append((rid, name, first_sent))
    elif pat_C.search(opening_lower):
        m = pat_C.search(opening_lower)
        det = m.group(1).lower()
        w1 = m.group(2).lower()
        w2 = m.group(3).lower()
        skel = f"[Dish] is {det} {w1} {w2}..."
        skeleton_groups[skel].append((rid, name, first_sent))

# Show all skeletons used by 2+ recipes
ranked_skels = sorted(
    [(skel, recs) for skel, recs in skeleton_groups.items() if len(recs) >= 2],
    key=lambda x: (-len(x[1]), x[0])
)

for skel, recs in ranked_skels:
    print(f"\n  SKELETON [{len(recs)} recipes]:  {skel}")
    print(f"  {'─'*66}")
    for rid, rname, sent in recs:
        print(f"  ID {rid:3d}  {rname:<35}  \"{sent[:80]}\"")

print()

# ─── Summary ─────────────────────────────────────────────────────────────────

print("=" * 70)
print("SUMMARY")
print("=" * 70)
print(f"  Total recipes with en originText : {len(recipes)}")
print(f"  Distinct n-grams in 3+ recipes   : {len(ranked_ngrams)}")
print(f"  Opening skeleton groups (3+)     : {len(ranked_openings)}")
print(f"  P2 opening patterns (2+)         : {len(ranked_p2)}")
print(f"  Closing sentence patterns (2+)   : {len(ranked_closing)}")
print(f"  Structural skeleton groups (2+)  : {len(ranked_skels)}")
top_weak = [w for w in sorted(WEAK_WORDS, key=lambda x: -word_total[x]) if word_total[w] > 0]
print(f"  Top weak word: '{top_weak[0]}' ({word_total[top_weak[0]]} uses in "
      f"{word_recipe_count[top_weak[0]]} recipes)")
