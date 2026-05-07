import { createContext, useContext, useReducer } from "react";

const initialState = {
  currentDay: 1,
  baby: {
    name: "Amara",
    birthDay: 270,
    weightLog: [],
    heightLog: [],
    headLog: [],
    feedLog: [],
    milestones: [],
  },
  mama: {
    name: "",
    weeksPregnant: 0,
    heightCm: null,
    weightKg: null,
    moodLog: [],
    bpLog: [],
    sleepLog: [],
    nutritionLog: [],
    symptoms: [],
    lochiaLog: [],
    epdsResults: [],
  },
  floraMessages: [],
  floraUnread: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_DAY":
      return { ...state, currentDay: Math.max(0, Math.min(999, action.day)) };

    case "ADVANCE_DAY":
      return { ...state, currentDay: Math.min(999, state.currentDay + (action.amount || 1)) };

    case "SET_MAMA_PROFILE":
      return {
        ...state,
        mama: {
          ...state.mama,
          name: action.name ?? state.mama.name,
          weeksPregnant: action.weeksPregnant ?? state.mama.weeksPregnant,
          heightCm: action.heightCm ?? state.mama.heightCm,
          weightKg: action.weightKg ?? state.mama.weightKg,
        },
      };

    case "LOG_MOOD":
      return {
        ...state,
        mama: {
          ...state.mama,
          moodLog: [
            ...state.mama.moodLog.filter((l) => l.day !== state.currentDay),
            { day: state.currentDay, score: action.score },
          ],
        },
      };

    case "LOG_BP":
      return {
        ...state,
        mama: {
          ...state.mama,
          bpLog: [
            ...state.mama.bpLog,
            { day: state.currentDay, systolic: action.systolic, diastolic: action.diastolic, timestamp: new Date().toISOString() },
          ],
        },
      };

    case "LOG_SLEEP":
      return {
        ...state,
        mama: {
          ...state.mama,
          sleepLog: [
            ...state.mama.sleepLog.filter((l) => l.day !== state.currentDay),
            { day: state.currentDay, hours: action.hours },
          ],
        },
      };

    case "LOG_NUTRITION": {
      const filtered = state.mama.nutritionLog.filter((l) => l.day !== state.currentDay);
      const existing = state.mama.nutritionLog.find((l) => l.day === state.currentDay) || {};
      const merged = {
        iron: 0, folate: 0, calcium: 0, vitaminD: 0, omega3: 0, calories: 0,
        ...existing,
      };
      return {
        ...state,
        mama: {
          ...state.mama,
          nutritionLog: [...filtered, {
            day: state.currentDay,
            iron:     merged.iron     + (action.iron     || 0),
            folate:   merged.folate   + (action.folate   || 0),
            calcium:  merged.calcium  + (action.calcium  || 0),
            vitaminD: merged.vitaminD + (action.vitaminD || 0),
            omega3:   merged.omega3   + (action.omega3   || 0),
            calories: merged.calories + (action.calories || 0),
          }],
        },
      };
    }

    case "LOG_FEED":
      return {
        ...state,
        baby: {
          ...state.baby,
          feedLog: [...state.baby.feedLog, { timestamp: new Date().toISOString(), type: action.feedType }],
        },
      };

    case "LOG_WEIGHT":
      return {
        ...state,
        baby: {
          ...state.baby,
          weightLog: [...state.baby.weightLog.filter((w) => w.week !== action.week), { week: action.week, value: action.value }],
        },
      };

    case "LOG_HEIGHT":
      return {
        ...state,
        baby: {
          ...state.baby,
          heightLog: [...state.baby.heightLog.filter((w) => w.week !== action.week), { week: action.week, value: action.value }],
        },
      };

    case "LOG_HEAD":
      return {
        ...state,
        baby: {
          ...state.baby,
          headLog: [...state.baby.headLog.filter((w) => w.week !== action.week), { week: action.week, value: action.value }],
        },
      };

    case "LOG_SYMPTOM":
      return {
        ...state,
        mama: {
          ...state.mama,
          symptoms: [
            ...state.mama.symptoms.filter((s) => !(s.day === state.currentDay && s.type === action.symptom)),
            { day: state.currentDay, type: action.symptom, severity: action.severity || 1 },
          ],
        },
      };

    case "LOG_LOCHIA":
      return {
        ...state,
        mama: {
          ...state.mama,
          lochiaLog: [
            ...state.mama.lochiaLog.filter((l) => l.day !== state.currentDay),
            { day: state.currentDay, color: action.color, amount: action.amount },
          ],
        },
      };

    case "SAVE_EPDS":
      return {
        ...state,
        mama: {
          ...state.mama,
          epdsResults: [...state.mama.epdsResults, { date: new Date().toISOString(), score: action.score }],
        },
      };

    case "COMPLETE_MILESTONE":
      if (state.baby.milestones.includes(action.id)) return state;
      return { ...state, baby: { ...state.baby, milestones: [...state.baby.milestones, action.id] } };

    case "ADD_FLORA_MESSAGE":
      return {
        ...state,
        floraMessages: [...state.floraMessages, action.message],
        floraUnread: action.unread !== false,
      };

    case "MARK_FLORA_READ":
      return { ...state, floraUnread: false };

    case "LOAD_DEMO":
      return {
        ...state,
        currentDay: 640,
        baby: {
          name: "Amara",
          birthDay: 270,
          weightLog: [
            { week: 4,  value: 4.1 }, { week: 8,  value: 5.0 },
            { week: 12, value: 5.8 }, { week: 16, value: 6.4 },
            { week: 26, value: 7.9 }, { week: 39, value: 9.2 },
          ],
          heightLog: [
            { week: 4,  value: 53.5 }, { week: 12, value: 60.2 },
            { week: 26, value: 67.8 }, { week: 39, value: 73.4 },
          ],
          headLog: [{ week: 12, value: 40.0 }, { week: 26, value: 43.2 }],
          milestones: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          feedLog: [
            { timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), type: "Solid" },
            { timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), type: "Breast" },
          ],
        },
        mama: {
          name: "Maya",
          weeksPregnant: 0,
          heightCm: 165,
          weightKg: 68,
          moodLog: [
            { day: 637, score: 3 }, { day: 638, score: 3 },
            { day: 639, score: 4 }, { day: 640, score: 4 },
          ],
          bpLog: [
            { day: 638, systolic: 118, diastolic: 76, timestamp: new Date(Date.now() - 172800000).toISOString() },
            { day: 639, systolic: 120, diastolic: 78, timestamp: new Date(Date.now() - 86400000).toISOString() },
            { day: 640, systolic: 116, diastolic: 74, timestamp: new Date().toISOString() },
          ],
          sleepLog: [
            { day: 636, hours: 6.5 }, { day: 637, hours: 5.5 },
            { day: 638, hours: 6.0 }, { day: 639, hours: 6.5 },
            { day: 640, hours: 7.0 },
          ],
          nutritionLog: [
            { day: 640, iron: 14, folate: 340, calcium: 600, vitaminD: 200, omega3: 80, calories: 1950 },
          ],
          symptoms: [],
          lochiaLog: [],
          epdsResults: [{ date: new Date(Date.now() - 30 * 86400000).toISOString(), score: 6 }],
        },
        floraMessages: [
          { id: 1, role: "flora", text: "Good morning, Maya! Amara is around 13 months old and your garden is looking beautiful 🌿. How are you both doing today?", timestamp: new Date(Date.now() - 7200000).toISOString() },
          { id: 2, role: "user",  text: "She just started walking! I'm exhausted but so happy.", timestamp: new Date(Date.now() - 5400000).toISOString() },
          { id: 3, role: "flora", text: "Walking at 13 months — right on track! The exhaustion is real. Your sleep logs look better this week (6–7h), which is great to see. I noticed your iron from yesterday's log was a bit low — around 14mg vs your 18mg target. Try adding some lentils or a handful of almonds today. Your mood has been tracking higher too — a good sign. 💜 How's Amara eating?", timestamp: new Date(Date.now() - 5390000).toISOString() },
        ],
        floraUnread: true,
      };

    case "RESET_APP":
      return initialState;

    default:
      return state;
  }
}

const AppStateContext    = createContext(null);
const AppDispatchContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

export const useAppState    = () => useContext(AppStateContext);
export const useAppDispatch = () => useContext(AppDispatchContext);

export const STAGE_LABEL = (day) =>
  day < 90  ? "Pregnancy · T1" :
  day < 180 ? "Pregnancy · T2" :
  day < 270 ? "Pregnancy · T3" :
  day < 365 ? "Newborn"        :
  day < 540 ? "Infant"         :
  day < 730 ? "Baby"           : "Toddler";

export const mamaStageFor  = (day)           => Math.min(4, Math.floor(day / 200));
export const babyStageFor  = (day, birthDay) => {
  if (day < birthDay) return 0;
  return Math.min(4, Math.floor((day - birthDay) / Math.max(1, (999 - birthDay) / 4)));
};
