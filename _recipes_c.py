"""Recipes 224-229 — loader combining _recipes_c1 (Tagine, Ramen, Vietnamese Spring Rolls) and _recipes_c2 (Grilled Sea Bream, Sea Bass Provençal, Roast Chicken Diavola)."""
import importlib.util, os
HERE = os.path.dirname(__file__)

def _load(name):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, f'_{name}.py'))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m

_c1 = _load('recipes_c1')
_c2 = _load('recipes_c2')

RECIPES = _c1.RECIPES + _c2.RECIPES
assert len(RECIPES) == 6, f"expected 6, got {len(RECIPES)}"
