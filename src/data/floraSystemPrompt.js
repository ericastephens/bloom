import { getProfile, getNutritionProfile } from '../lib/profile';
import { getGestationalWeeks, getTrimester } from '../lib/gestationalAge';

export const FLORA_BASE_PROMPT = `You are Flora, the AI garden advisor inside Bloom — a maternal and infant health companion for the first 1,000 days.

CULTURAL NUTRITION GUIDELINES:
- When suggesting foods, always consider the mother's cultural background and self-reported food traditions from her nutrition profile
- Never stereotype — always frame cultural food suggestions as optional and additive, not prescriptive
- Use language like: "Did you know that [food] — common in many [cultural] kitchens — is rich in [nutrient]?"
- Always explain WHY a food is useful (iron, folate, calcium, vitamin D, omega-3, protein, vitamin C)
- If the mother mentioned cultural foods in onboarding, reference those foods specifically

SPECIFIC CULTURAL FOOD KNOWLEDGE:
Black American Southern: Collard greens (folate, calcium, vitamin K), black-eyed peas (folate, iron, protein), sweet potato (vitamin A, B6, fiber), okra (folate, vitamin C), cornbread with iron-enriched meal
West African: Egusi seeds (iron, zinc, magnesium), moringa leaves (calcium, iron, vitamin A), ogbono (omega-3), plantain (B6, potassium), akara/black-eyed pea fritters (protein, folate)
Caribbean: Callaloo (iron, folate, calcium), dasheen/taro (complex carbs, potassium), ackee (protein, healthy fats), sorrel/hibiscus (vitamin C)
South Asian: Lentil dal (folate — 90% DV per cup, iron, protein), fenugreek seeds (iron, traditionally supports lactation), turmeric milk (anti-inflammatory), paneer (calcium, protein)
Latin American: Black beans (folate, iron, protein, fiber), nopales/cactus (calcium, fiber, vitamin C), chayote (folate, vitamin C), masa/corn products (calcium if lime-treated)
East African: Mchicha/amaranth greens (iron, calcium, folate), ugali with beans (complex carbs + protein), tilapia (protein, omega-3)
East Asian: Congee with ginger (gentle on nausea), tofu (calcium, protein, iron), edamame (folate, protein, iron), seaweed (iodine — important in pregnancy)
Southeast Asian: Moringa (iron, calcium, vitamin A — used traditionally postpartum), jackfruit (protein, potassium), tempeh (protein, calcium, iron)

PREGNANCY STAGE GUIDANCE:
- T1 (weeks 1–12): Focus on folate, B12, managing nausea. Gentle foods. Folate critical for neural tube.
- T2 (weeks 13–26): Iron, calcium, omega-3. Baby growing fast. Appetite usually returns.
- T3 (weeks 27–40): Iron, calcium, vitamin D, protein. Preparing for birth. Avoid excessive caffeine.
- Postpartum/newborn (0–6 mo): Iron recovery for mama, omega-3 for breast milk quality, hydration.
- Infant 6–12 mo: First foods. Iron-rich purées. Diverse tastes.
- Toddler 1–2 yr: Calcium, vitamin D, zinc, omega-3 for brain development.

SAFETY:
- Always use: monitor at home / call your provider / go to the ER now (never diagnose)
- Never use the word "diagnosis"
- If mood responses suggest concern, gently say: "Consider sharing these feelings with your care team"
- Reference 988 Lifeline if mood seems crisis-level

TONE: Warm, non-judgmental, culturally affirming. Flora speaks like a trusted friend who happens to know a lot about maternal nutrition — not a clinical checklist.`;

export const buildFloraContextAddition = () => {
  const profile = getProfile();
  const nutritionProfile = getNutritionProfile();
  const weeks = getGestationalWeeks(profile.confirmedPregnancyDate);
  const trimester = weeks !== null ? getTrimester(weeks) : null;

  return `
CURRENT USER CONTEXT:
- Mother's name: ${profile.motherName || 'not set'}
- Cultural background: ${profile.culturalBackground || profile.raceEthnicity || 'not set'}
- Dietary pattern: ${Array.isArray(profile.dietaryPattern) ? profile.dietaryPattern.join(', ') : 'not set'}
- Foods from her culture: ${nutritionProfile.culturalFoods || 'not mentioned'}
- Healing/traditional foods: ${nutritionProfile.healingFoods || 'not mentioned'}
- Nausea level: ${nutritionProfile.nausea || 'not reported'}
- Prenatal vitamin: ${nutritionProfile.prenatalVitamin || 'not reported'}
- Protein sources: ${Array.isArray(nutritionProfile.proteinSources) ? nutritionProfile.proteinSources.join(', ') : 'not set'}
- Gestational week: ${weeks !== null ? `Week ${weeks} (${trimester})` : 'not set'}`;
};

export const CULTURAL_NUTRITION_TIPS = [
  {
    id: 'collard-greens',
    food: 'Collard greens',
    culture: ['Black American Southern', 'African American'],
    nutrients: ['folate', 'calcium', 'vitamin K', 'iron'],
    trimesterRelevance: ['T1', 'T2', 'T3'],
    tip: 'Did you know? Collard greens — a staple in many Southern kitchens — provide 27% of your daily folate and 26% of your calcium in just one cooked cup. Folate is especially important in the first trimester for your baby\'s neural development.',
  },
  {
    id: 'black-eyed-peas',
    food: 'Black-eyed peas',
    culture: ['Black American Southern', 'West African'],
    nutrients: ['folate', 'iron', 'protein', 'potassium'],
    trimesterRelevance: ['T1', 'T2', 'T3', 'postpartum'],
    tip: 'Black-eyed peas are one of nature\'s richest sources of folate — a key nutrient for preventing neural tube defects. They\'re also high in protein and iron, which supports your blood volume as it increases during pregnancy.',
  },
  {
    id: 'egusi',
    food: 'Egusi seeds',
    culture: ['West African', 'Nigerian'],
    nutrients: ['iron', 'zinc', 'magnesium', 'protein'],
    trimesterRelevance: ['T2', 'T3'],
    tip: 'Egusi seeds — used widely in West African cooking — are rich in iron, zinc, and magnesium. Iron supports the extra blood your body produces during pregnancy. Pair with vitamin C-rich foods to maximize absorption.',
  },
  {
    id: 'lentil-dal',
    food: 'Lentil dal',
    culture: ['South Asian', 'Indian', 'Bangladeshi', 'Pakistani'],
    nutrients: ['folate', 'iron', 'protein', 'fiber'],
    trimesterRelevance: ['T1', 'T2', 'T3', 'postpartum'],
    tip: 'One cup of cooked lentils provides about 90% of your daily folate requirement. Lentil dal, eaten across South Asian traditions, is one of the most folate-dense foods available — and gentle on a pregnant stomach.',
  },
  {
    id: 'callaloo',
    food: 'Callaloo',
    culture: ['Caribbean', 'Trinidadian', 'Jamaican'],
    nutrients: ['iron', 'folate', 'calcium', 'vitamin C'],
    trimesterRelevance: ['T2', 'T3', 'postpartum'],
    tip: 'Callaloo — a leafy green beloved across Caribbean cooking — is packed with iron, folate, and calcium. It\'s also a great source of vitamin C, which helps your body absorb iron more efficiently.',
  },
  {
    id: 'mchicha',
    food: 'Mchicha (amaranth greens)',
    culture: ['East African', 'Tanzanian', 'Kenyan'],
    nutrients: ['iron', 'calcium', 'folate', 'vitamin A'],
    trimesterRelevance: ['T1', 'T2', 'T3'],
    tip: 'Mchicha, a leafy green staple in East African cooking, is one of the most nutrient-dense vegetables available — rich in iron, calcium, and folate. Cooking it with a squeeze of lemon juice supports iron absorption.',
  },
  {
    id: 'sweet-potato',
    food: 'Sweet potato',
    culture: ['Black American Southern', 'West African', 'Caribbean', 'Latin American'],
    nutrients: ['vitamin A', 'vitamin B6', 'fiber', 'potassium'],
    trimesterRelevance: ['T1', 'T2', 'T3'],
    tip: 'Sweet potatoes provide beta-carotene — a precursor to vitamin A — which supports your baby\'s eye, skin, and organ development. They\'re naturally sweet, easy to digest, and often soothing when nausea is present.',
  },
  {
    id: 'moringa',
    food: 'Moringa leaves',
    culture: ['West African', 'South Asian', 'Southeast Asian', 'Caribbean'],
    nutrients: ['calcium', 'iron', 'vitamin A', 'protein'],
    trimesterRelevance: ['T2', 'T3', 'postpartum'],
    tip: 'Moringa leaves contain more calcium per gram than milk and are rich in iron and vitamin A. Used traditionally across West Africa, South Asia, and the Caribbean to support maternal strength during and after pregnancy.',
  },
  {
    id: 'edamame',
    food: 'Edamame',
    culture: ['East Asian', 'Japanese', 'Chinese', 'Korean'],
    nutrients: ['folate', 'protein', 'iron', 'omega-3'],
    trimesterRelevance: ['T1', 'T2', 'T3'],
    tip: 'Edamame — young soybeans — are a complete plant protein with significant folate and iron content. They\'re a satisfying snack and easy to add to many meals.',
  },
  {
    id: 'black-beans',
    food: 'Black beans',
    culture: ['Latin American', 'Mexican', 'Cuban', 'Brazilian'],
    nutrients: ['folate', 'iron', 'protein', 'fiber'],
    trimesterRelevance: ['T1', 'T2', 'T3', 'postpartum'],
    tip: 'Black beans provide 64% of your daily folate in one cup, along with iron and plant protein. A staple across Latin American cuisines, they pair well with rice for a complete amino acid profile.',
  },
];
