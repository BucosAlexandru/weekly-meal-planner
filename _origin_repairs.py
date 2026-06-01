"""Combined originText repairs for ids 194-213 (Greek+Italian = 194-203, Indian+Thai = 204-213)."""
import importlib.util, os
HERE = os.path.dirname(__file__)

def _load(name):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, f'_{name}.py'))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m

_a = _load('origin_repairs_a')
_b = _load('origin_repairs_b')

REPAIRS = {**_a.REPAIRS, **_b.REPAIRS}
assert len(REPAIRS) == 20, f"expected 20, got {len(REPAIRS)}"
assert set(REPAIRS.keys()) == set(range(194, 214)), "ids should be 194-213"
