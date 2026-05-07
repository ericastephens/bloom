import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./hooks/useAppState";
import { isOnboarded } from "./lib/profile";
import BottomNav from "./components/BottomNav";
import Garden from "./components/Garden";
import FloraAdvisor from "./components/FloraAdvisor";
import NutritionTracker from "./components/NutritionTracker";
import GrowthCurve from "./components/GrowthCurve";
import MamaHealth from "./components/MamaHealth";
import Milestones from "./components/Milestones";
import VitaminGuide from "./components/VitaminGuide";
import OnboardingScreen from "./screens/OnboardingScreen";

function AppContent() {
  return (
    <>
      <div className="pb-20">
        <Routes>
          <Route path="/"           element={<Garden />}          />
          <Route path="/flora"      element={<FloraAdvisor />}    />
          <Route path="/nutrition"  element={<NutritionTracker />}/>
          <Route path="/growth"     element={<GrowthCurve />}     />
          <Route path="/mama"       element={<MamaHealth />}      />
          <Route path="/milestones" element={<Milestones />}      />
          <Route path="/vitamins"   element={<VitaminGuide />}    />
          <Route path="/vitamins/:tab" element={<VitaminGuide />} />
        </Routes>
      </div>
      <BottomNav />
    </>
  );
}

export default function App() {
  const [onboarded, setOnboarded] = useState(() => isOnboarded());

  return (
    <AppProvider>
      <BrowserRouter>
        {!onboarded ? (
          <OnboardingScreen onComplete={() => setOnboarded(true)} />
        ) : (
          <AppContent />
        )}
      </BrowserRouter>
    </AppProvider>
  );
}
