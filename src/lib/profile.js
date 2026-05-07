const KEYS = {
  PROFILE: 'bloom_profile',
  ONBOARDED: 'bloom_onboarded',
  NUTRITION: 'bloom_nutrition_profile',
  QUESTIONNAIRE: 'bloom_questionnaire_responses',
  CELEBRATIONS: 'bloom_celebrations_shown',
};

const safeGet = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
};

export const getProfile = () => safeGet(KEYS.PROFILE, {});
export const saveProfile = (profile) => localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));

export const isOnboarded = () => !!localStorage.getItem(KEYS.ONBOARDED);
export const setOnboarded = () => localStorage.setItem(KEYS.ONBOARDED, 'true');
export const resetOnboarding = () => {
  localStorage.removeItem(KEYS.ONBOARDED);
  localStorage.removeItem(KEYS.PROFILE);
  localStorage.removeItem(KEYS.NUTRITION);
  localStorage.removeItem(KEYS.QUESTIONNAIRE);
  localStorage.removeItem(KEYS.CELEBRATIONS);
};

export const getNutritionProfile = () => safeGet(KEYS.NUTRITION, {});
export const saveNutritionProfile = (nutrition) => localStorage.setItem(KEYS.NUTRITION, JSON.stringify(nutrition));

export const getQuestionnaireResponses = () => safeGet(KEYS.QUESTIONNAIRE, {});
export const saveQuestionnaireResponses = (responses) => localStorage.setItem(KEYS.QUESTIONNAIRE, JSON.stringify(responses));

export const getCelebrationsShown = () => safeGet(KEYS.CELEBRATIONS, []);
export const markCelebrationShown = (id) => {
  const shown = getCelebrationsShown();
  if (!shown.includes(id)) {
    localStorage.setItem(KEYS.CELEBRATIONS, JSON.stringify([...shown, id]));
  }
};
