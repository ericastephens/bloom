import { useState } from "react";
import { saveProfile, setOnboarded, saveNutritionProfile, saveQuestionnaireResponses } from "../lib/profile";
import { getEstimatedDueDate } from "../lib/gestationalAge";
import QuestionnaireEngine from "../components/QuestionnaireEngine";

const DAMBO_QUESTIONS = [
  { id: 'q1',  text: 'I have been feeling worried or anxious.' },
  { id: 'q2',  text: 'I have been feeling sad or down.' },
  { id: 'q3',  text: 'I have had difficulty sleeping because of worrying thoughts.' },
  { id: 'q4',  text: 'I have felt overwhelmed by my pregnancy or upcoming birth.' },
  { id: 'q5',  text: 'I have had little interest or pleasure in things I usually enjoy.' },
  { id: 'q6',  text: 'I have felt irritable or easily frustrated.' },
  { id: 'q7',  text: 'I have been concerned about the health of my baby.' },
  { id: 'q8',  text: 'I have felt unsupported by those around me.' },
  { id: 'q9',  text: 'I have had intrusive or scary thoughts.' },
  { id: 'q10', text: 'I have felt hopeless about the future.' },
  { id: 'q11', text: 'I have been avoiding things that remind me of difficult experiences.' },
];

const SCALE_LABELS = ['Not at all', 'A little', 'Quite a bit', 'Very much'];

const DAMBO_SCORING = (answers) =>
  Object.values(answers).reduce((sum, v) => sum + (Number(v) || 0), 0);

const DAMBO_RESULT = (score) => {
  if (score >= 16) {
    return "Some of your responses suggest you might benefit from extra support. Consider sharing these feelings with your care team or a trusted person. If you're ever in crisis, you can reach the 988 Lifeline — call or text 988, available 24/7.";
  }
  if (score >= 11) {
    return "Some of your responses suggest you might benefit from extra support. Consider sharing these feelings with your care team or a trusted person.";
  }
  return null;
};

const DISCLAIMER = "These questions help us personalize your Bloom experience and are not a medical diagnosis. Your responses are private and support your care planning.";

const TOTAL_STEPS = 5;

function ProgressBar({ step }) {
  const pct = ((step - 1) / (TOTAL_STEPS - 1)) * 100;
  return (
    <div className="px-4 pt-4 pb-3">
      <div className="flex justify-between text-[10px] text-gray-400 mb-1.5">
        <span>Step {step} of {TOTAL_STEPS}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#1D9E75] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Chip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        selected
          ? 'bg-[#7F77DD] text-white border-[#7F77DD]'
          : 'bg-white border-gray-200 text-gray-600 hover:border-[#7F77DD]'
      }`}
    >
      {label}
    </button>
  );
}

function Field({ label, children, optional }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {label} {optional && <span className="font-normal normal-case text-gray-400">(optional)</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7F77DD] bg-white";
const selectCls = inputCls;

export default function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(1);

  // Mother profile
  const [motherName, setMotherName]     = useState('');
  const [age, setAge]                   = useState('');
  const [raceEthnicity, setRaceEthnicity] = useState('');
  const [culturalBackground, setCulturalBackground] = useState('');
  const [preferredLanguage, setPreferredLanguage]   = useState('English');
  const [previousPregnancies, setPreviousPregnancies] = useState('');
  const [preExistingConditions, setPreExistingConditions] = useState([]);
  const [dietaryPattern, setDietaryPattern] = useState([]);

  // Baby profile
  const [babyName, setBabyName]                   = useState('');
  const [confirmedPregnancyDate, setConfirmedPregnancyDate] = useState('');
  const [dueDate, setDueDate]                     = useState('');

  // Questionnaire
  const [damboAnswers, setDamboAnswers] = useState(null);
  const [damboScore, setDamboScore]     = useState(null);

  // Nutrition
  const [mealsPerDay, setMealsPerDay]         = useState('');
  const [fruitsVeggies, setFruitsVeggies]     = useState('');
  const [prenatalVitamin, setPrenatalVitamin] = useState('');
  const [waterIntake, setWaterIntake]         = useState('');
  const [nausea, setNausea]                   = useState('');
  const [proteinSources, setProteinSources]   = useState([]);
  const [calciumFoods, setCalciumFoods]       = useState([]);
  const [foodAccess, setFoodAccess]           = useState('');
  const [culturalFoods, setCulturalFoods]     = useState('');
  const [healingFoods, setHealingFoods]       = useState('');

  const toggleMulti = (list, setList, value) => {
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  };

  const handleComplete = () => {
    const calculatedDue = getEstimatedDueDate(confirmedPregnancyDate, dueDate);

    const profile = {
      motherName,
      age: age ? Number(age) : null,
      raceEthnicity,
      culturalBackground,
      preferredLanguage,
      previousPregnancies,
      preExistingConditions,
      dietaryPattern,
      babyName,
      confirmedPregnancyDate,
      dueDate: dueDate || (calculatedDue ? calculatedDue.toISOString().split('T')[0] : null),
      damboScore,
      onboardedAt: new Date().toISOString(),
    };

    const nutrition = {
      mealsPerDay,
      fruitsVeggiesFrequency: fruitsVeggies,
      prenatalVitamin,
      waterIntake,
      nausea,
      proteinSources,
      calciumFoods,
      foodAccessConcerns: foodAccess,
      culturalFoods,
      healingFoods,
    };

    const questionnaire = {
      responses: damboAnswers,
      score: damboScore,
      completedAt: new Date().toISOString(),
    };

    saveProfile(profile);
    saveNutritionProfile(nutrition);
    saveQuestionnaireResponses(questionnaire);
    setOnboarded();
    onComplete();
  };

  return (
    <div className="min-h-dvh bg-[#F8F9FA] flex flex-col">
      {step > 1 && <ProgressBar step={step} />}

      <div className="flex-1 overflow-y-auto px-4 pb-8">

        {/* Step 1 — Welcome */}
        {step === 1 && (
          <div className="flex flex-col items-center justify-center min-h-[80dvh] text-center gap-6 px-2">
            <div className="text-6xl">🌱</div>
            <div>
              <h1
                className="text-4xl font-bold text-[#0F6E56] mb-3"
                style={{ fontFamily: 'Lora, Georgia, serif' }}
              >
                Welcome to Bloom
              </h1>
              <p className="text-gray-500 text-base leading-relaxed">
                Before we plant your garden, let's get to know you.
              </p>
            </div>
            <button
              onClick={() => setStep(2)}
              className="bg-[#1D9E75] text-white px-10 py-4 rounded-2xl font-semibold text-base w-full max-w-xs"
            >
              Get started
            </button>
          </div>
        )}

        {/* Step 2 — Mother Profile */}
        {step === 2 && (
          <div className="pt-2 flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Lora, Georgia, serif' }}>
                Your profile
              </h2>
              <p className="text-xs text-gray-400 mt-1">Tell us about yourself.</p>
            </div>

            <Field label="Your name">
              <input
                name="motherName"
                className={inputCls}
                value={motherName}
                onChange={e => setMotherName(e.target.value)}
                placeholder="Maya"
              />
            </Field>

            <Field label="Age" optional>
              <input
                name="age"
                type="number"
                className={inputCls}
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="28"
                min="14"
                max="60"
              />
            </Field>

            <Field label="Race / ethnicity">
              <select name="raceEthnicity" className={selectCls} value={raceEthnicity} onChange={e => setRaceEthnicity(e.target.value)}>
                <option value="">Select…</option>
                {['Black or African American','Hispanic or Latina','Asian','White','Native American or Alaska Native','Native Hawaiian or Pacific Islander','Multiracial','Prefer not to say','Other'].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </Field>

            <Field label="Country or cultural background" optional>
              <input
                name="culturalBackground"
                className={inputCls}
                value={culturalBackground}
                onChange={e => setCulturalBackground(e.target.value)}
                placeholder="e.g. Nigerian, Haitian, Mexican…"
              />
            </Field>

            <Field label="Preferred language">
              <select name="preferredLanguage" className={selectCls} value={preferredLanguage} onChange={e => setPreferredLanguage(e.target.value)}>
                {['English','Spanish','French','Haitian Creole','Swahili','Other'].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </Field>

            <Field label="Previous pregnancies">
              <select name="previousPregnancies" className={selectCls} value={previousPregnancies} onChange={e => setPreviousPregnancies(e.target.value)}>
                <option value="">Select…</option>
                {['First pregnancy','1 previous','2 previous','3 or more'].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </Field>

            <Field label="Pre-existing conditions">
              <div className="flex flex-wrap gap-2">
                {['None','Diabetes','Hypertension','Thyroid condition','Mental health condition','Other'].map(v => (
                  <Chip key={v} label={v} selected={preExistingConditions.includes(v)}
                    onClick={() => toggleMulti(preExistingConditions, setPreExistingConditions, v)} />
                ))}
              </div>
            </Field>

            <Field label="Dietary pattern">
              <div className="flex flex-wrap gap-2">
                {['No restrictions','Vegetarian','Vegan','Halal','Kosher','Gluten-free','Lactose-free','Other'].map(v => (
                  <Chip key={v} label={v} selected={dietaryPattern.includes(v)}
                    onClick={() => toggleMulti(dietaryPattern, setDietaryPattern, v)} />
                ))}
              </div>
            </Field>

            <button
              onClick={() => setStep(3)}
              disabled={!motherName.trim()}
              className="w-full bg-[#1D9E75] text-white py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-40 mt-2"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 3 — Baby Profile */}
        {step === 3 && (
          <div className="pt-2 flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Lora, Georgia, serif' }}>
                Your baby
              </h2>
              <p className="text-xs text-gray-400 mt-1">We'll use this to calculate your journey.</p>
            </div>

            <Field label="Baby's name" optional>
              <input
                name="babyName"
                className={inputCls}
                value={babyName}
                onChange={e => setBabyName(e.target.value)}
                placeholder="If you know it yet — or leave blank"
              />
            </Field>

            <Field label="Date of confirmed pregnancy">
              <input
                name="confirmedPregnancyDate"
                type="date"
                className={inputCls}
                value={confirmedPregnancyDate}
                onChange={e => setConfirmedPregnancyDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-gray-400">We'll calculate your gestational age from this date.</p>
            </Field>

            <Field label="Due date" optional>
              <input
                name="dueDate"
                type="date"
                className={inputCls}
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
              <p className="text-xs text-gray-400">
                {confirmedPregnancyDate && !dueDate
                  ? `Estimated due date: ${getEstimatedDueDate(confirmedPregnancyDate, null)?.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
                  : "If you don't have one yet, we'll estimate based on your pregnancy date."}
              </p>
            </Field>

            <div className="flex gap-2 mt-2">
              <button onClick={() => setStep(2)}
                className="flex-1 border border-gray-200 text-gray-600 py-3.5 rounded-2xl font-semibold text-sm">
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!confirmedPregnancyDate}
                className="flex-[2] bg-[#1D9E75] text-white py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — DAMBO Q11 */}
        {step === 4 && (
          <div className="pt-2 flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Lora, Georgia, serif' }}>
                How are you feeling?
              </h2>
              <p className="text-xs text-gray-400 mt-1">A short wellness check-in.</p>
            </div>

            <QuestionnaireEngine
              questions={DAMBO_QUESTIONS}
              scaleLabels={SCALE_LABELS}
              scoringFn={DAMBO_SCORING}
              getResultMessage={DAMBO_RESULT}
              disclaimer={DISCLAIMER}
              storageKey="bloom_questionnaire"
              onComplete={(answers, score) => {
                setDamboAnswers(answers);
                setDamboScore(score);
                setStep(5);
              }}
            />

            <button onClick={() => setStep(3)} className="text-xs text-gray-400 text-center">
              ← Back
            </button>
          </div>
        )}

        {/* Step 5 — Nutrition */}
        {step === 5 && (
          <div className="pt-2 flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Lora, Georgia, serif' }}>
                Nutrition profile
              </h2>
              <p className="text-xs text-[#0F6E56] bg-[#E1F5EE] rounded-xl px-3 py-2 mt-1 font-medium">
                Culturally Sensitive Nutrition Profile — not a diagnostic tool
              </p>
              <p className="text-xs text-gray-400 mt-2">All questions are optional. Answer only what feels comfortable.</p>
            </div>

            <Field label="Meals per day" optional>
              <div className="flex flex-wrap gap-2">
                {['1','2','3','4+','Varies'].map(v => (
                  <Chip key={v} label={v} selected={mealsPerDay === v} onClick={() => setMealsPerDay(v)} />
                ))}
              </div>
            </Field>

            <Field label="Fruits or vegetables" optional>
              <div className="flex flex-wrap gap-2">
                {['Rarely','A few times a week','Daily','Multiple times a day'].map(v => (
                  <Chip key={v} label={v} selected={fruitsVeggies === v} onClick={() => setFruitsVeggies(v)} />
                ))}
              </div>
            </Field>

            <Field label="Prenatal vitamin" optional>
              <div className="flex flex-wrap gap-2">
                {['Yes daily','Sometimes','Not yet','No'].map(v => (
                  <Chip key={v} label={v} selected={prenatalVitamin === v} onClick={() => setPrenatalVitamin(v)} />
                ))}
              </div>
            </Field>

            <Field label="Water per day" optional>
              <div className="flex flex-wrap gap-2">
                {['Less than 4 cups','4–6 cups','6–8 cups','More than 8 cups'].map(v => (
                  <Chip key={v} label={v} selected={waterIntake === v} onClick={() => setWaterIntake(v)} />
                ))}
              </div>
            </Field>

            <Field label="Nausea or food aversions" optional>
              <div className="flex flex-wrap gap-2">
                {['Not at all','Occasionally','Often','Severely'].map(v => (
                  <Chip key={v} label={v} selected={nausea === v} onClick={() => setNausea(v)} />
                ))}
              </div>
            </Field>

            <Field label="Main protein sources" optional>
              <div className="flex flex-wrap gap-2">
                {['Chicken','Fish','Beef','Beans and lentils','Eggs','Tofu','Nuts and seeds','Other'].map(v => (
                  <Chip key={v} label={v} selected={proteinSources.includes(v)}
                    onClick={() => toggleMulti(proteinSources, setProteinSources, v)} />
                ))}
              </div>
            </Field>

            <Field label="Calcium-rich foods" optional>
              <div className="flex flex-wrap gap-2">
                {['Dairy milk','Yogurt','Cheese','Plant-based milk','Leafy greens','Other','None'].map(v => (
                  <Chip key={v} label={v} selected={calciumFoods.includes(v)}
                    onClick={() => toggleMulti(calciumFoods, setCalciumFoods, v)} />
                ))}
              </div>
            </Field>

            <Field label="Food access or affordability" optional>
              <div className="flex flex-wrap gap-2">
                {['Yes','Sometimes','No'].map(v => (
                  <Chip key={v} label={v} selected={foodAccess === v} onClick={() => setFoodAccess(v)} />
                ))}
              </div>
              <p className="text-xs text-gray-400">Do you have concerns about food access or affordability?</p>
            </Field>

            <Field label="Foods from your cultural background" optional>
              <textarea
                name="culturalFoods"
                className={`${inputCls} resize-none`}
                rows={3}
                value={culturalFoods}
                onChange={e => setCulturalFoods(e.target.value)}
                placeholder="e.g. jollof rice, dal, tortillas, grits, congee…"
              />
            </Field>

            <Field label="Healing or traditional foods you rely on" optional>
              <textarea
                name="healingFoods"
                className={`${inputCls} resize-none`}
                rows={3}
                value={healingFoods}
                onChange={e => setHealingFoods(e.target.value)}
                placeholder="e.g. moringa tea, ginger water, bone broth…"
              />
            </Field>

            <div className="flex gap-2 mt-2">
              <button onClick={() => setStep(4)}
                className="flex-1 border border-gray-200 text-gray-600 py-3.5 rounded-2xl font-semibold text-sm">
                Back
              </button>
              <button
                onClick={handleComplete}
                className="flex-[2] bg-[#1D9E75] text-white py-3.5 rounded-2xl font-semibold text-sm"
              >
                Plant my garden 🌱
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
