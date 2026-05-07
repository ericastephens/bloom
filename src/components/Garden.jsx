import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState, useAppDispatch } from "../hooks/useAppState";
import { getProfile, getCelebrationsShown, markCelebrationShown } from "../lib/profile";
import { getDayOf1000, getGestationalWeeks, getStageLabel as getGestationalStageLabel } from "../lib/gestationalAge";
import ReminderBanner from "./ReminderBanner";
import MilestoneCelebration from "./MilestoneCelebration";

// ── Continuous growth factors (0.0 → 4.0) ────────────────────────────────────
// Baby grows the entire journey — conception through toddlerhood
const babyGrowth = (day) => {
  const t = Math.min(day / 999, 1);
  return 4 * Math.pow(t, 0.72);
};

// Mama grows slowly through pregnancy, then faster after birth
const mamaGrowth = (day) => {
  if (day <= 270) return (day / 270) * 1.15;
  return 1.15 + ((day - 270) / 729) * 2.85;
};

// ── Stage / trimester info ────────────────────────────────────────────────────
const STAGE_STYLE = (day) => {
  if (day < 90)  return { bg: "#EFF8FF", text: "#1D6FA4", border: "#BFE0FB", label: "1st Trimester", emoji: "🌱", start: 0,   end: 90  };
  if (day < 180) return { bg: "#F3EEFF", text: "#5B21B6", border: "#DDD6FE", label: "2nd Trimester", emoji: "✨", start: 90,  end: 180 };
  if (day < 270) return { bg: "#EEEDFE", text: "#4338CA", border: "#C5C2F5", label: "3rd Trimester", emoji: "🌙", start: 180, end: 270 };
  if (day < 365) return { bg: "#E1F5EE", text: "#0F6E56", border: "#A7DFC9", label: "Newborn",       emoji: "💜", start: 270, end: 365 };
  if (day < 540) return { bg: "#DCFCE7", text: "#166534", border: "#86EFAC", label: "Infant",        emoji: "🌿", start: 365, end: 540 };
  if (day < 730) return { bg: "#FEF9C3", text: "#854D0E", border: "#FDE68A", label: "Baby",          emoji: "🌟", start: 540, end: 730 };
  return            { bg: "#FFF7ED", text: "#9A3412", border: "#FDBA74", label: "Toddler",        emoji: "🦋", start: 730, end: 999 };
};

const getTimeGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const getTodayMoment = (day, babyName) => {
  if (day < 30)  return "The first weeks are quietly miraculous — all that growing, before a single scan. You're already doing it.";
  if (day < 90)  return `Your baby's heart has started beating. The first trimester asks everything of you, and you're showing up.`;
  if (day < 180) return `Your baby can hear your voice now. Keep talking, reading, singing — they already know it's you.`;
  if (day < 270) return `${babyName} is getting into position. You've carried this whole journey. Almost time.`;
  if (day < 365) return `Your body just did something extraordinary. You're healing and raising a human — both things are real, both are beautiful.`;
  if (day < 450) return `First smiles, first sounds — you're watching ${babyName} wake up to the world, one tiny discovery at a time.`;
  if (day < 600) return `${babyName} is curious about everything. You're doing so much better than you think.`;
  if (day < 730) return `Every day ${babyName} surprises you with something new. You made this possible.`;
  return `The toddler years are loud and magical. Look how far you and ${babyName} have come together.`;
};

const getStatusLine = (day, babyName) => {
  if (day < 270) {
    const week = Math.floor(day / 7);
    const daysLeft = 270 - day;
    return { main: `Week ${week} of pregnancy`, sub: `${daysLeft} days until you meet ${babyName}` };
  }
  const daysOld = day - 270;
  const weeks = Math.floor(daysOld / 7);
  const months = Math.floor(daysOld / 30.5);
  if (months < 2) return { main: `${babyName} is ${weeks} week${weeks !== 1 ? "s" : ""} old`, sub: "You're both growing every day" };
  if (months < 24) return { main: `${babyName} is ${months} months old`, sub: "You're both growing every day" };
  return { main: `${babyName} is 2 years old 🎉`, sub: "What a journey you've been on" };
};

// ── Scene constants ───────────────────────────────────────────────────────────
const GRASS = Array.from({ length: 32 }, (_, i) => ({
  x: i * 11.5 + 4, h: 6 + ((i * 7 + 3) % 9), dark: i % 4 === 0,
}));
const SOIL_PEBBLES = [
  {x:30,y:238},{x:70,y:248},{x:120,y:235},{x:160,y:245},{x:200,y:237},
  {x:240,y:250},{x:285,y:240},{x:330,y:246},{x:50,y:255},{x:185,y:258},{x:310,y:253},
];
const WILDFLOWERS = [
  {x:35,y:188,color:"#F472B6"},{x:130,y:186,color:"#FCD34D"},
  {x:210,y:188,color:"#F472B6"},{x:310,y:186,color:"#FB923C"},{x:175,y:189,color:"#A78BFA"},
];

// ── Plant components ──────────────────────────────────────────────────────────
function Flower({ cx, cy, color, size }) {
  return (
    <g>
      {[0,60,120,180,240,300].map((a) => {
        const r = (a * Math.PI) / 180;
        const px = cx + Math.cos(r) * size * 0.65;
        const py = cy + Math.sin(r) * size * 0.65;
        return <ellipse key={a} cx={px} cy={py} rx={size*0.5} ry={size*0.27}
          fill={color} opacity={0.92} transform={`rotate(${a}, ${px}, ${py})`}/>;
      })}
      <circle cx={cx} cy={cy} r={size * 0.3} fill="#FCD34D"/>
    </g>
  );
}

function Wildflower({ x, y, color }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y+8} stroke="#4CAF50" strokeWidth={1}/>
      {[0,72,144,216,288].map((a)=>{
        const r=(a*Math.PI)/180;
        return <circle key={a} cx={x+Math.cos(r)*4} cy={y+Math.sin(r)*4} r={2.5} fill={color} opacity={0.85}/>;
      })}
      <circle cx={x} cy={y} r={1.8} fill="#FCD34D"/>
    </g>
  );
}

// Continuous growth plant — growth is a float 0.0→4.0
function GardenPlant({ x, growth, color }) {
  const ground = 210;
  const sh = (growth / 4) * 148;
  const topY = ground - sh;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // Each leaf layer fades in smoothly at different growth thresholds
  const g1 = clamp((growth - 0.7) / 0.5, 0, 1);
  const g2 = clamp((growth - 1.4) / 0.5, 0, 1);
  const g3 = clamp((growth - 2.1) / 0.5, 0, 1);
  const g4 = clamp((growth - 2.9) / 0.5, 0, 1);
  const gf = clamp((growth - 3.5) / 0.4, 0, 1);

  return (
    <g>
      {/* Soil mound */}
      <ellipse cx={x} cy={ground+4} rx={10} ry={5} fill="#92713A" opacity={0.4}/>

      {/* Tiny sprout before stem emerges */}
      {growth < 0.5 && (
        <ellipse cx={x} cy={ground+1} rx={3.5*Math.min(1, growth*4)} ry={4*Math.min(1, growth*4)}
          fill={color} opacity={Math.min(0.7, growth*2.5)}/>
      )}

      {/* Stem — grows continuously */}
      {sh > 4 && (
        <path d={`M ${x} ${ground} Q ${x-6} ${ground-sh*0.38} ${x} ${topY}`}
          stroke={color} strokeWidth={Math.min(4, 2.5 + growth * 0.4)} fill="none" strokeLinecap="round"
          opacity={Math.min(1, (sh - 4) / 15)}/>
      )}

      {/* Layer 1 leaves */}
      {g1 > 0 && <>
        <ellipse cx={x-11} cy={topY+14} rx={5*g1} ry={10*g1} fill={color} opacity={0.88*g1}
          transform={`rotate(-42, ${x-11}, ${topY+14})`}/>
        <ellipse cx={x+11} cy={topY+14} rx={5*g1} ry={10*g1} fill={color} opacity={0.88*g1}
          transform={`rotate(42, ${x+11}, ${topY+14})`}/>
      </>}

      {/* Layer 2 leaves */}
      {g2 > 0 && <>
        <ellipse cx={x-17} cy={topY+sh*0.48} rx={6*g2} ry={13*g2} fill={color} opacity={0.88*g2}
          transform={`rotate(-48, ${x-17}, ${topY+sh*0.48})`}/>
        <ellipse cx={x+17} cy={topY+sh*0.48} rx={6*g2} ry={13*g2} fill={color} opacity={0.88*g2}
          transform={`rotate(48, ${x+17}, ${topY+sh*0.48})`}/>
      </>}

      {/* Layer 3 leaves + bud */}
      {g3 > 0 && <>
        <ellipse cx={x-19} cy={topY+sh*0.67} rx={7*g3} ry={14*g3} fill={color} opacity={0.88*g3}
          transform={`rotate(-44, ${x-19}, ${topY+sh*0.67})`}/>
        <ellipse cx={x+19} cy={topY+sh*0.67} rx={7*g3} ry={14*g3} fill={color} opacity={0.88*g3}
          transform={`rotate(44, ${x+19}, ${topY+sh*0.67})`}/>
        <ellipse cx={x} cy={topY+3} rx={5*g3} ry={9*g3} fill={color} opacity={0.9*g3}/>
      </>}

      {/* Layer 4 leaves */}
      {g4 > 0 && <>
        <ellipse cx={x-17} cy={topY+sh*0.83} rx={6*g4} ry={12*g4} fill={color} opacity={0.88*g4}
          transform={`rotate(-38, ${x-17}, ${topY+sh*0.83})`}/>
        <ellipse cx={x+17} cy={topY+sh*0.83} rx={6*g4} ry={12*g4} fill={color} opacity={0.88*g4}
          transform={`rotate(38, ${x+17}, ${topY+sh*0.83})`}/>
      </>}

      {/* Flower — blooms at the end */}
      {gf > 0 && (
        <g opacity={gf}>
          <Flower cx={x} cy={topY} color={color} size={20*gf}/>
          <Flower cx={x-28*gf} cy={topY+sh*0.28} color={color} size={10*gf}/>
          <Flower cx={x+26*gf} cy={topY+sh*0.48} color={color} size={8*gf}/>
        </g>
      )}
    </g>
  );
}

const MARKERS = [
  {day:0,   label:"Conception"},
  {day:270, label:"Birth"},
  {day:540, label:"6 mo"},
  {day:730, label:"Toddler"},
  {day:999, label:"2 yrs"},
];

const QUICK_LINKS = [
  {label:"Nutrition",  emoji:"🥗", path:"/nutrition",  color:"baby"},
  {label:"Mama",       emoji:"💜", path:"/mama",       color:"mama"},
  {label:"Growth",     emoji:"📈", path:"/growth",     color:"baby"},
  {label:"Milestones", emoji:"⭐", path:"/milestones", color:"mama"},
];

function checkPendingCelebration(profile, day) {
  const shown = getCelebrationsShown();
  const weeks = getGestationalWeeks(profile.confirmedPregnancyDate);
  if (weeks !== null) {
    if (weeks >= 13 && !shown.includes('t2')) return 't2';
    if (weeks >= 27 && !shown.includes('t3')) return 't3';
  }
  if (day >= 270 && !shown.includes('birth')) return 'birth';
  if (day >= 999 && !shown.includes('day1000')) return 'day1000';
  return null;
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function Garden() {
  const { currentDay, baby, mama, floraUnread } = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [toast, setToast] = useState("");

  const profile = useMemo(() => getProfile(), []);
  const displayDay = useMemo(
    () => profile.confirmedPregnancyDate
      ? (getDayOf1000(profile.confirmedPregnancyDate) ?? currentDay)
      : currentDay,
    [profile, currentDay],
  );
  const gestationalLabel = useMemo(
    () => getGestationalStageLabel(profile.confirmedPregnancyDate, profile.birthDate),
    [profile],
  );
  const motherName = profile.motherName || mama.name || "Mama";
  const babyName   = profile.babyName   || baby.name;
  const [pendingCelebration, setPendingCelebration] = useState(() =>
    checkPendingCelebration(profile, displayDay)
  );

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const mGrowth   = mamaGrowth(currentDay);
  const bGrowth   = babyGrowth(currentDay);
  const vineColor = mGrowth >= 1.15 && bGrowth >= 1.15 ? "#1D9E75" : "#CBD5E1";
  const mamaAY    = 210 - (mGrowth / 4) * 148 * 0.45;
  const babyAY    = 210 - (bGrowth / 4) * 148 * 0.45;

  const stageStyle   = STAGE_STYLE(currentDay);
  const stagePct     = Math.round(((currentDay - stageStyle.start) / (stageStyle.end - stageStyle.start)) * 100);
  const daysLeftStage = stageStyle.end - currentDay;

  const todayMood    = mama.moodLog.find((l) => l.day === currentDay);
  const lastSleep    = mama.sleepLog.at(-1);
  const todayNutr    = mama.nutritionLog.find((l) => l.day === currentDay);
  const ironPct      = todayNutr ? Math.round((todayNutr.iron / 27) * 100) : null;
  const milestonePct = baby.milestones.length;

  const moment    = getTodayMoment(currentDay, babyName);
  const status    = getStatusLine(currentDay, babyName);
  const timeGreet = getTimeGreeting();

  const initials = motherName
    .split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="px-4 pt-4 pb-2">

      {pendingCelebration && (
        <MilestoneCelebration
          celebrationId={pendingCelebration}
          onDismiss={() => {
            markCelebrationShown(pendingCelebration);
            setPendingCelebration(null);
          }}
        />
      )}

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#7F77DD] to-[#534AB7] flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-white text-sm font-bold">{initials}</span>
          </div>
          <div>
            <p className="text-xs text-gray-400 leading-none">{timeGreet}</p>
            <h1 className="text-xl font-bold text-gray-800 leading-tight" style={{ fontFamily: 'Lora, Georgia, serif' }}>{motherName}'s Garden</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {floraUnread && (
            <div className="w-2.5 h-2.5 bg-red-400 rounded-full animate-pulse"/>
          )}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-semibold"
            style={{background: stageStyle.bg, color: stageStyle.text, borderColor: stageStyle.border}}>
            {stageStyle.emoji} {gestationalLabel || stageStyle.label}
          </div>
        </div>
      </div>

      {/* ── Status ── */}
      <div className="mb-3">
        <p className="text-sm font-semibold text-gray-700">{status.main}</p>
        <p className="text-xs text-gray-400 mt-0.5">{status.sub}</p>
      </div>

      {/* ── Today's moment card ── */}
      <div className="rounded-2xl p-4 mb-3 border" style={{background: stageStyle.bg, borderColor: stageStyle.border}}>
        <p className="text-sm leading-relaxed" style={{color: stageStyle.text}}>
          {stageStyle.emoji} {moment}
        </p>
      </div>

      {/* ── Day slider + trimester progress ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 pt-3 pb-3 mb-3">
        {/* Stage progress */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold" style={{color: stageStyle.text}}>{stageStyle.label}</span>
          <span className="text-[10px] text-gray-400">
            {daysLeftStage > 0 ? `${daysLeftStage} days left` : "Complete!"}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-100 mb-3 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-200"
            style={{width: `${Math.min(stagePct, 100)}%`, background: stageStyle.text}}/>
        </div>

        {/* Main slider */}
        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
          <span>Day 0</span>
          <span className="font-bold text-[#1D9E75]">Day {currentDay}</span>
          <span>Day 999</span>
        </div>
        <input
          type="range" min="0" max="999" value={currentDay}
          onChange={(e) => dispatch({type:"SET_DAY", day:+e.target.value})}
          className="w-full accent-[#1D9E75] mb-1.5"
        />

        {/* Stage markers */}
        <div className="flex justify-between px-0.5">
          {MARKERS.map(({day, label}) => (
            <button key={day} onClick={() => dispatch({type:"SET_DAY", day})}
              className={`text-[9px] leading-tight transition-colors text-center font-medium ${
                Math.abs(currentDay - day) < 40
                  ? "text-[#1D9E75]"
                  : "text-gray-300 hover:text-gray-400"
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Garden scene ── */}
      <div className="rounded-2xl overflow-hidden shadow-md mb-1 border border-gray-100" style={{height:248}}>
        <svg width="100%" height="248" viewBox="0 0 360 248" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#7EC8E3"/>
              <stop offset="60%"  stopColor="#C8E9F5"/>
              <stop offset="100%" stopColor="#D9F2E0"/>
            </linearGradient>
            <linearGradient id="g-soil" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#8B6F3A"/>
              <stop offset="100%" stopColor="#5C4220"/>
            </linearGradient>
            <radialGradient id="g-sun" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#FDE68A" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#FDE68A" stopOpacity="0"/>
            </radialGradient>
          </defs>

          <rect width="360" height="248" fill="url(#g-sky)"/>

          {/* Sun */}
          <circle cx="318" cy="36" r="34" fill="url(#g-sun)"/>
          <circle cx="318" cy="36" r="20" fill="#FBBF24"/>
          {Array.from({length:8},(_,i)=>{
            const a=(i/8)*360, r=(a*Math.PI)/180;
            return <line key={i}
              x1={318+Math.cos(r)*25} y1={36+Math.sin(r)*25}
              x2={318+Math.cos(r)*37} y2={36+Math.sin(r)*37}
              stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>;
          })}

          {/* Clouds */}
          <g opacity="0.85">
            <ellipse cx="60"  cy="44" rx="22" ry="13" fill="white"/>
            <ellipse cx="78"  cy="44" rx="20" ry="12" fill="white"/>
            <ellipse cx="69"  cy="35" rx="15" ry="11" fill="white"/>
            <ellipse cx="46"  cy="47" rx="13" ry="10" fill="white"/>
          </g>
          <g opacity="0.7">
            <ellipse cx="196" cy="28" rx="16" ry="9"  fill="white"/>
            <ellipse cx="210" cy="28" rx="14" ry="8"  fill="white"/>
            <ellipse cx="202" cy="21" rx="11" ry="8"  fill="white"/>
          </g>

          {/* Ground */}
          <rect x="0" y="180" width="360" height="68" fill="url(#g-soil)"/>
          <path d="M 0 183 Q 18 173 36 183 Q 54 173 72 183 Q 90 175 108 183 Q 126 173 144 183 Q 162 175 180 183 Q 198 173 216 183 Q 234 175 252 183 Q 270 173 288 183 Q 306 175 324 183 Q 342 173 360 183 L 360 180 L 0 180 Z"
            fill="#4CAF50"/>
          {GRASS.map(({x,h,dark},i)=>(
            <path key={i} d={`M ${x} 183 Q ${x-2} ${183-h*0.55} ${x+2.5} ${183-h}`}
              stroke={dark?"#388E3C":"#52B85A"} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          ))}
          {WILDFLOWERS.map((f,i)=>(
            <Wildflower key={i} x={f.x} y={f.y} color={f.color}/>
          ))}
          {SOIL_PEBBLES.map((p,i)=>(
            <ellipse key={i} cx={p.x} cy={p.y} rx={3} ry={2} fill="#7A5C2E" opacity={0.3}/>
          ))}

          {/* Connecting vine */}
          {(mGrowth > 0.3 || bGrowth > 0.3) && (
            <path d={`M 90 ${mamaAY-20} Q 180 ${Math.min(mamaAY,babyAY)-45} 270 ${babyAY-20}`}
              stroke={vineColor} strokeWidth="1.8" fill="none" strokeDasharray="7 4" opacity={0.7}/>
          )}

          {/* Mama plant (purple) — slow → accelerates after birth */}
          <GardenPlant x={90}  growth={mGrowth} color="#7F77DD"/>
          {/* Baby plant (green) — grows every single day */}
          <GardenPlant x={270} growth={bGrowth} color="#1D9E75"/>
        </svg>
      </div>

      {/* ── Plant name labels (outside SVG so never clipped) ── */}
      <div className="flex justify-between px-4 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#7F77DD]"/>
          <span className="text-xs font-semibold text-[#534AB7]" style={{ fontFamily: 'Lora, Georgia, serif' }}>{motherName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-[#0F6E56]" style={{ fontFamily: 'Lora, Georgia, serif' }}>{babyName || "Your baby 🌱"}</span>
          <div className="w-2 h-2 rounded-full bg-[#1D9E75]"/>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="flex gap-2 mb-3">
        {[
          {
            label: "Mood",
            value: todayMood ? ["😔","😟","😐","🙂","😊"][todayMood.score-1] : "—",
            sub: todayMood ? ["Struggling","Low","Okay","Good","Great"][todayMood.score-1] : "log today",
            color: todayMood ? "#1D9E75" : "#9CA3AF",
          },
          {
            label: "Sleep",
            value: lastSleep ? `${lastSleep.hours}h` : "—",
            sub: lastSleep ? (lastSleep.hours >= 7 ? "rested" : lastSleep.hours >= 5 ? "getting there" : "hang in there") : "log today",
            color: lastSleep ? (lastSleep.hours >= 7 ? "#1D9E75" : lastSleep.hours >= 5 ? "#F59E0B" : "#EF4444") : "#9CA3AF",
          },
          {
            label: "Iron",
            value: ironPct != null ? `${ironPct}%` : "—",
            sub: ironPct != null ? (ironPct >= 80 ? "on track" : "needs boost") : "log today",
            color: ironPct != null ? (ironPct >= 80 ? "#1D9E75" : "#F59E0B") : "#9CA3AF",
          },
        ].map(({label, value, sub, color}) => (
          <div key={label} className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
            <div className="text-xl font-bold leading-none" style={{color}}>{value}</div>
            <div className="text-[10px] text-gray-500 mt-1 font-semibold">{label}</div>
            <div className="text-[9px] text-gray-300 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      <ReminderBanner />

      {/* ── Quick nav ── */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {QUICK_LINKS.map(({label,emoji,path,color}) => (
          <button key={label} onClick={() => navigate(path)}
            className={`rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-95 ${
              color==="baby"
                ? "bg-[#E1F5EE] text-[#0F6E56] hover:bg-[#C6EDD9]"
                : "bg-[#EEEDFE] text-[#534AB7] hover:bg-[#DCD9FC]"
            }`}>
            <span>{emoji}</span>{label}
          </button>
        ))}
      </div>

      {/* ── Flora nudge ── */}
      {floraUnread && (
        <button onClick={() => { dispatch({type:"MARK_FLORA_READ"}); navigate("/flora"); }}
          className="w-full bg-gradient-to-r from-[#534AB7] to-[#7F77DD] text-white rounded-xl p-3.5 text-left mb-3 active:scale-95 transition-all shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xl">🌿</span>
            <div>
              <div className="text-sm font-semibold">Flora has something for you</div>
              <div className="text-purple-200 text-xs mt-0.5">Tap to open your garden chat</div>
            </div>
          </div>
        </button>
      )}

      {/* ── Milestones ribbon ── */}
      {milestonePct > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-4 py-3 mb-3 flex items-center gap-3">
          <span className="text-xl">⭐</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-700 truncate">{babyName || "Your baby"} has hit {milestonePct} milestone{milestonePct !== 1 ? "s" : ""}</p>
            <p className="text-[10px] text-gray-400">Keep tracking the journey</p>
          </div>
          <button onClick={() => navigate("/milestones")} className="text-xs text-[#1D9E75] font-semibold flex-shrink-0">
            View →
          </button>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800/90 text-white text-sm px-5 py-2.5 rounded-full z-50 pointer-events-none shadow-lg">
          {toast}
        </div>
      )}

      <button onClick={() => { dispatch({type:"LOAD_DEMO"}); showToast("Demo loaded ✓"); }}
        className="fixed bottom-[88px] right-4 bg-gray-100 border border-gray-200 text-gray-500 text-xs px-3 py-1.5 rounded-full z-30 shadow-sm">
        Demo
      </button>
    </div>
  );
}
