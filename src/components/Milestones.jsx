import { useState } from "react";
import { CheckCircle, AlertCircle, Circle } from "lucide-react";
import { useAppState, useAppDispatch } from "../hooks/useAppState";
import { milestones } from "../data/milestoneData";
import { getCelebrationsShown, markCelebrationShown } from "../lib/profile";
import MilestoneCelebration from "./MilestoneCelebration";

const CATEGORIES = ["All", "Motor", "Social", "Language", "Vision"];

export default function Milestones() {
  const { baby, currentDay } = useAppState();
  const dispatch = useAppDispatch();
  const [activeCategory, setActiveCategory] = useState("All");

  const [pendingCelebration, setPendingCelebration] = useState(null);

  const babyWeek = Math.max(0, Math.floor((currentDay - baby.birthDay) / 7));

  const handleComplete = (milestoneId) => {
    const isFirst = baby.milestones.length === 0;
    dispatch({ type: "COMPLETE_MILESTONE", id: milestoneId });
    if (isFirst && !getCelebrationsShown().includes('first-milestone')) {
      setPendingCelebration('first-milestone');
    }
  };

  const filtered = milestones.filter(
    (m) => activeCategory === "All" || m.category.toLowerCase() === activeCategory.toLowerCase()
  );

  const completed = baby.milestones.length;
  const pct = Math.round((completed / milestones.length) * 100);

  return (
    <div className="p-5">
      {pendingCelebration && (
        <MilestoneCelebration
          celebrationId={pendingCelebration}
          onDismiss={() => {
            markCelebrationShown(pendingCelebration);
            setPendingCelebration(null);
          }}
        />
      )}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Milestones</h2>

      {/* Progress */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">{completed} of {milestones.length} reached</span>
          <span className="text-[#1D9E75] font-semibold">{pct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#1D9E75] rounded-full transition-all duration-500"
            style={{width:`${pct}%`}}/>
        </div>
        <p className="text-xs text-gray-400 mt-2">{baby.name} · Week {babyWeek} of life</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{scrollbarWidth:"none"}}>
        {CATEGORIES.map((cat)=>(
          <button key={cat} onClick={()=>setActiveCategory(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeCategory===cat?"bg-[#1D9E75] text-white":"bg-gray-100 text-gray-600"
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Milestone cards */}
      <div className="space-y-3">
        {filtered.map((milestone)=>{
          const isDone    = baby.milestones.includes(milestone.id);
          const isOverdue = !isDone && babyWeek > milestone.targetWeek + 4;
          return (
            <div key={milestone.id}
              className={`bg-white rounded-2xl border p-4 flex items-center gap-3 transition-all ${
                isDone?"opacity-55 border-gray-100":isOverdue?"border-amber-300 bg-amber-50":"border-gray-100 shadow-sm"
              }`}>
              <div className="flex-shrink-0">
                {isDone
                  ? <CheckCircle size={22} className="text-[#1D9E75]"/>
                  : isOverdue
                  ? <AlertCircle size={22} className="text-amber-500"/>
                  : <Circle size={22} className="text-gray-300"/>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800">{milestone.name}</div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-gray-400">Week {milestone.targetWeek}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">{milestone.category}</span>
                  {isOverdue && <span className="text-xs text-amber-600 font-medium">⚑ Flora flagged</span>}
                </div>
              </div>
              {!isDone && (
                <button onClick={() => handleComplete(milestone.id)}
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-xl border font-medium transition-colors ${
                    isOverdue
                      ? "border-amber-400 text-amber-700 hover:bg-amber-100"
                      : "border-[#1D9E75] text-[#1D9E75] hover:bg-[#E1F5EE]"
                  }`}>
                  Done
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
