import { useState, useRef } from "react";
import { Camera, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";
import { useAppState, useAppDispatch } from "../hooks/useAppState";
import { CULTURAL_FOODS, NUTRIENT_META, DAILY_TARGETS_PREGNANCY, DAILY_TARGETS_POSTPARTUM } from "../data/nutritionData";
import { useNavigate } from "react-router-dom";

// Per-nutrient food tips and shop recommendations
const NUTRIENT_TIPS = {
  iron:     { tip: "Try lentils, spinach, black beans, or dark leafy greens — add a squeeze of lemon to boost absorption.", foods: ["Lentil soup", "Spinach salad", "Blackeyed peas"], shop: true },
  folate:   { tip: "Add dark leafy greens, beans, or fortified cereals. Methylfolate supplements absorb better.", foods: ["Callaloo", "Black beans", "Chana masala"], shop: true },
  calcium:  { tip: "Dairy, collard greens, sardines, and fortified plant milks are your best friends here.", foods: ["Sardines", "Collard greens", "Saag paneer"], shop: false },
  vitaminD: { tip: "Sunlight helps, but fatty fish and D3 supplements are the most reliable sources.", foods: ["Catfish", "Sardines", "Mackerel"], shop: true },
  omega3:   { tip: "Fatty fish 2–3x a week is ideal. Algae-based omega-3 is a great plant-based option.", foods: ["Ceviche", "Ackee & saltfish", "Sardines"], shop: true },
  calories: { tip: "You need extra fuel right now. Don't skip meals — your body is doing extraordinary work.", foods: [], shop: false },
};

const FEED_TYPES = ["Breast", "Formula", "Solid"];

function IntakeBar({ label, unit, value, target, pct, nutrientKey }) {
  const navigate = useNavigate();
  const c  = pct >= 80 ? "#1D9E75" : pct >= 50 ? "#F59E0B" : "#EF4444";
  const bg = pct >= 80 ? "#E1F5EE" : pct >= 50 ? "#FEF9C3" : "#FEF2F2";
  const hint = NUTRIENT_TIPS[nutrientKey];

  return (
    <div className="py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{color: c}}>
            {Math.round(value)}<span className="text-gray-400 font-normal">/{target} {unit}</span>
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{background: bg, color: c}}>
            {Math.round(pct)}%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div className="h-full rounded-full transition-all duration-500"
          style={{width: `${Math.min(pct, 100)}%`, background: c}}/>
      </div>

      {/* Tip — always visible when under 80% */}
      {pct < 80 ? (
        <div className="space-y-1.5">
          <p className="text-[10px] text-gray-500 leading-relaxed">{hint.tip}</p>
          {hint.foods.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {hint.foods.map((f) => (
                <span key={f} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{f}</span>
              ))}
            </div>
          )}
          {hint.shop && (
            <button onClick={() => navigate(`/vitamins/${nutrientKey}`)}
              className="flex items-center gap-1 text-[10px] text-[#534AB7] font-semibold">
              <ShoppingBag size={10}/> See supplement options →
            </button>
          )}
        </div>
      ) : (
        <p className="text-[10px] text-[#1D9E75] font-medium">You're on track! Keep it up 🌿</p>
      )}
    </div>
  );
}

export default function NutritionTracker() {
  const { mama, baby, currentDay } = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const fileRef  = useRef(null);

  const [showFoodModal, setShowFoodModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState("West African");
  const [showChart, setShowChart]           = useState(false);
  const [photoResult, setPhotoResult]       = useState(null);
  const [photoLoading, setPhotoLoading]     = useState(false);

  const isPostBirth = currentDay >= baby.birthDay;
  const targets     = isPostBirth ? DAILY_TARGETS_POSTPARTUM : DAILY_TARGETS_PREGNANCY;
  const todayLog    = mama.nutritionLog.find((l) => l.day === currentDay) || {};

  const nutrients = NUTRIENT_META.map((n) => {
    const value = todayLog[n.key] || 0;
    const target = targets[n.key];
    return { ...n, value, target, pct: target ? (value / target) * 100 : 0 };
  });

  const lowCount    = nutrients.filter((n) => n.pct < 50 && n.key !== "calories").length;
  const overallPct  = Math.round(
    nutrients.filter((n) => n.key !== "calories")
      .reduce((s, n) => s + Math.min(n.pct, 100), 0) / 5
  );

  const addFood = (food) => {
    dispatch({ type: "LOG_NUTRITION", iron: food.iron, folate: food.folate,
      calcium: food.calcium, vitaminD: food.vitaminD, omega3: food.omega3, calories: food.calories });
  };

  const addPhotoFood = () => {
    if (!photoResult) return;
    dispatch({ type: "LOG_NUTRITION", ...photoResult });
    setPhotoResult(null);
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoading(true);
    setPhotoResult(null);
    try {
      const base64 = await new Promise((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result.split(",")[1]);
        reader.readAsDataURL(file);
      });
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const key = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!key) throw new Error("no key");
      const client = new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true });
      const resp = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 300,
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: file.type, data: base64 } },
          { type: "text", text: `Identify the food and estimate nutrition for one serving. Return ONLY valid JSON: {"name":"Food Name","serving":"1 cup","iron":3,"folate":40,"calcium":80,"vitaminD":0,"omega3":0,"calories":220}` },
        ]}],
      });
      const json = JSON.parse(resp.content[0].text.match(/\{[\s\S]*\}/)[0]);
      setPhotoResult(json);
    } catch {
      setShowFoodModal(true);
    } finally {
      setPhotoLoading(false);
      e.target.value = "";
    }
  };

  const todayFeeds = baby.feedLog.filter((f) => {
    const d = new Date(f.timestamp);
    return d.toDateString() === new Date().toDateString();
  });
  const lastFeed = baby.feedLog.at(-1);

  return (
    <div className="p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Nutrition</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {isPostBirth ? "Postpartum targets" : "Pregnancy targets"} · Day {currentDay}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={() => fileRef.current?.click()} disabled={photoLoading}
            className="flex items-center gap-1.5 bg-[#E1F5EE] text-[#0F6E56] text-xs px-3 py-1.5 rounded-xl font-medium">
            <Camera size={13}/> {photoLoading ? "Scanning…" : "Photo"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment"
            className="hidden" onChange={handlePhoto}/>
        </div>
      </div>

      {/* Overall score card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Today's nutrition score</span>
          <span className={`text-lg font-bold ${overallPct >= 80 ? "text-[#1D9E75]" : overallPct >= 50 ? "text-amber-500" : "text-red-400"}`}>
            {overallPct}%
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${overallPct}%`,
              background: overallPct >= 80 ? "#1D9E75" : overallPct >= 50 ? "#F59E0B" : "#EF4444",
            }}/>
        </div>
        <p className="text-[10px] text-gray-400 mt-2">
          {overallPct >= 80
            ? "Excellent! Your body and baby are getting what they need. 🌱"
            : lowCount > 0
            ? `${lowCount} nutrient${lowCount > 1 ? "s" : ""} need a boost — see tips below.`
            : "Tap any bar to see what foods can help."}
        </p>
      </div>

      {/* Photo result card */}
      {photoResult && (
        <div className="bg-[#E1F5EE] border border-[#A7DFC9] rounded-2xl p-4 mb-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="font-semibold text-gray-800 text-sm">{photoResult.name}</div>
              <div className="text-xs text-gray-500">{photoResult.serving}</div>
            </div>
            <button onClick={() => setPhotoResult(null)} className="text-gray-400 text-lg leading-none">✕</button>
          </div>
          <div className="flex gap-3 text-xs text-gray-600 mb-3 flex-wrap">
            <span>🩸 {photoResult.iron}mg iron</span>
            <span>🌿 {photoResult.folate}mcg folate</span>
            <span>🦴 {photoResult.calcium}mg calcium</span>
            <span>⚡ {photoResult.calories} cal</span>
          </div>
          <button onClick={addPhotoFood}
            className="w-full bg-[#1D9E75] text-white py-2 rounded-xl text-sm font-medium">
            Add to today's log
          </button>
        </div>
      )}

      {/* Nutrient intake bars */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 pt-2 pb-1 mb-4">
        {nutrients.map((n) => (
          <IntakeBar key={n.key} {...n} nutrientKey={n.key}/>
        ))}
      </div>

      {/* Add food button */}
      <button onClick={() => setShowFoodModal(true)}
        className="w-full bg-[#1D9E75] text-white py-3 rounded-xl font-medium text-sm mb-4">
        + Add food from cultural library
      </button>

      {/* Weekly calories toggle */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4">
        <button onClick={() => setShowChart(!showChart)}
          className="w-full flex items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold text-gray-700">Weekly calorie history</span>
          {showChart ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
        </button>
        {showChart && (
          <div className="px-4 pb-4 space-y-2">
            {Array.from({ length: 7 }, (_, i) => {
              const day  = currentDay - 6 + i;
              const log  = mama.nutritionLog.find((l) => l.day === day);
              const cal  = log?.calories || 0;
              const pct  = Math.min((cal / targets.calories) * 100, 100);
              return (
                <div key={day} className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-400 w-8 flex-shrink-0">D{day}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#1D9E75]" style={{width: `${pct}%`}}/>
                  </div>
                  <span className="text-[10px] text-gray-500 w-12 text-right">{cal ? `${cal} cal` : "—"}</span>
                </div>
              );
            })}
            <p className="text-[10px] text-gray-400 pt-1">Target: {targets.calories} cal/day</p>
          </div>
        )}
      </div>

      {/* Baby feeding (postpartum) */}
      {isPostBirth && (() => {
        const breastFeeds = todayFeeds.filter(f => f.type === "Breast");
        const hasNutrition = (todayLog.calories || 0) > 0;

        // Approximate nutrients baby receives per breastfeed (~150mL)
        // Key ones that vary meaningfully with mama's diet: omega-3, folate, vitamin D
        const perFeed = { omega3: 18, folate: 7, calcium: 48, vitaminD: 1.5, iron: 0.05 };
        const feedBoost = breastFeeds.length;
        const babyNutrients = [
          { label: "Omega-3", val: Math.round(feedBoost * perFeed.omega3 * (1 + Math.min((todayLog.omega3 || 0) / 300, 1))), unit: "mg", benefit: "brain dev", good: feedBoost >= 1 && (todayLog.omega3 || 0) >= 100 },
          { label: "Folate",  val: Math.round(feedBoost * perFeed.folate  * (1 + Math.min((todayLog.folate  || 0) / 500, 0.5))), unit: "mcg", benefit: "cell growth", good: feedBoost >= 1 && (todayLog.folate  || 0) >= 200 },
          { label: "Calcium", val: Math.round(feedBoost * perFeed.calcium),  unit: "mg", benefit: "bone strength", good: feedBoost >= 1 },
          { label: "Iron",    val: parseFloat((feedBoost * perFeed.iron).toFixed(2)), unit: "mg", benefit: "highly bioavailable", good: feedBoost >= 2 },
          { label: "Vit D",   val: Math.round(feedBoost * perFeed.vitaminD), unit: "IU", benefit: "supplement baby separately", good: false },
        ];

        return (
          <div className="mb-4 space-y-3">
            {/* Log feed */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-700 text-sm">{baby.name}'s feeds today</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {todayFeeds.length} logged
                    {lastFeed ? ` · Last: ${lastFeed.type} · ${new Date(lastFeed.timestamp).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}` : ""}
                  </p>
                </div>
                <div className="text-2xl">{todayFeeds.length >= 6 ? "🌟" : todayFeeds.length >= 3 ? "🌿" : "🌱"}</div>
              </div>
              <div className="flex gap-2">
                {FEED_TYPES.map((t) => (
                  <button key={t} onClick={() => dispatch({type:"LOG_FEED",feedType:t})}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[#E1F5EE] text-[#0F6E56] hover:bg-[#C6EDD9] transition-colors active:scale-95">
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Baby's nutrient share — shows when breast feeds logged */}
            {breastFeeds.length > 0 && (
              <div className="bg-gradient-to-br from-[#E1F5EE] to-[#EFF8FF] border border-[#A7DFC9] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🍼</span>
                  <div>
                    <p className="text-xs font-semibold text-[#0F6E56]">
                      What {baby.name} got from {breastFeeds.length} breast feed{breastFeeds.length !== 1 ? "s" : ""} today
                    </p>
                    <p className="text-[10px] text-[#1D9E75] mt-0.5">Your diet directly shapes your milk 💚</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {babyNutrients.map(({ label, val, unit, benefit, good }) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-[10px] text-[#0F6E56] font-semibold w-14 flex-shrink-0">{label}</span>
                      <div className="flex-1">
                        <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: good ? "75%" : "30%",
                              background: good ? "#1D9E75" : label === "Vit D" ? "#F59E0B" : "#93C5FD",
                            }}/>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-[#0F6E56] w-14 text-right flex-shrink-0">
                        ~{val} {unit}
                      </span>
                      <span className="text-[9px] text-[#1D9E75] hidden sm:block flex-shrink-0">{benefit}</span>
                    </div>
                  ))}
                </div>
                {!hasNutrition && (
                  <p className="text-[10px] text-[#1D9E75] mt-3 italic">Log your food above to see how your diet boosts these numbers ↑</p>
                )}
                <p className="text-[9px] text-[#1D9E75]/70 mt-2">Estimates based on avg. breastmilk composition · Vitamin D: always supplement baby (400 IU/day)</p>
              </div>
            )}
          </div>
        );
      })()}

      {/* Food modal */}
      {showFoodModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col" onClick={() => setShowFoodModal(false)}>
          <div className="mt-auto bg-white rounded-t-2xl w-full max-w-[430px] mx-auto max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <div>
                <h3 className="font-semibold text-gray-800">Cultural Foods Library</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Tap any food to log it · nutrition added instantly</p>
              </div>
              <button onClick={() => setShowFoodModal(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <div className="flex gap-2 px-4 pb-2 overflow-x-auto" style={{scrollbarWidth:"none"}}>
              {Object.keys(CULTURAL_FOODS).map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    activeCategory === cat ? "bg-[#1D9E75] text-white" : "bg-gray-100 text-gray-600"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="overflow-y-auto px-4 pb-5 flex-1">
              <div className="grid grid-cols-2 gap-2 pt-1">
                {CULTURAL_FOODS[activeCategory].map((food) => (
                  <button key={food.name} onClick={() => { addFood(food); setShowFoodModal(false); }}
                    className="bg-gray-50 border border-gray-100 rounded-2xl p-3 text-left hover:border-[#1D9E75] transition-colors active:scale-95">
                    <div className="text-2xl mb-1">{food.emoji}</div>
                    <div className="text-xs font-semibold text-gray-800 leading-tight mb-1">{food.name}</div>
                    <div className="text-[10px] text-gray-400 mb-1">{food.serving}</div>
                    <div className="flex flex-wrap gap-1 text-[9px]">
                      {food.iron > 2 && <span className="bg-red-50 text-red-500 px-1 rounded">🩸{food.iron}mg</span>}
                      {food.folate > 60 && <span className="bg-green-50 text-green-600 px-1 rounded">🌿{food.folate}mcg</span>}
                      {food.calcium > 100 && <span className="bg-blue-50 text-blue-500 px-1 rounded">🦴{food.calcium}mg</span>}
                      <span className="bg-gray-100 text-gray-500 px-1 rounded">{food.calories}cal</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
