"""Data file for add_recipes.py — recipes 216-229 + originText repairs + Hindi patches."""
import importlib.util, os
HERE = os.path.dirname(__file__)

def _load(name):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, f'_{name}.py'))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m

_a = _load('recipes_a')
_b = _load('recipes_b')
_c = _load('recipes_c')
_repairs = _load('origin_repairs')

MORE_RECIPES = _a.RECIPES + _b.RECIPES + _c.RECIPES
ORIGIN_TEXT_REPAIRS = _repairs.REPAIRS

HINDI_PATCHES = {
    1: "स्पैगेटी कार्बोनारा रोम का क्लासिक पास्ता है — गुआंचाले की कुरकुरी चर्बी, पेकोरीनो रोमानो और कच्चे अंडे की जर्दी एक मखमली चटनी बनाते हैं, बिना क्रीम के।",
    2: "सिओर्बा दे बूर्ता रोमानिया की एक प्रिय खट्टी सूप है — गोमांस के पेट से बनी, लहसुन, खट्टी क्रीम और सिरके के साथ, जो सर्दियों की रातों को गर्म करती है।",
    14: "बोर्श्ट पूर्वी यूरोप का चुकंदर सूप है — गहरा लाल, खटास और मिठास का संतुलन, और एक चम्मच खट्टी क्रीम के साथ जो स्लाव गर्व का प्रतीक है।",
    22: "पैएया वालेंसिया के चावल के खेतों से जन्मा — केसर, समुद्री भोजन, चिकन और सेम एक चौड़े पैन में पकते हैं, और सबसे प्रिय हिस्सा 'सोकाराट' है — तले हुए चावल की कुरकुरी निचली परत।",
    23: "बिबिम्बाप का अर्थ है 'मिश्रित चावल' — चावल का एक गर्म कटोरा, सावधानी से व्यवस्थित सब्ज़ियाँ, मांस, अंडा और गोचुजांग, और इसे खाने से पहले अच्छी तरह मिलाया जाता है।",
}
