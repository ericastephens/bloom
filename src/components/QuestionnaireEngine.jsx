import { useState, useEffect } from "react";

export default function QuestionnaireEngine({
  questions,
  scaleLabels,
  scoringFn,
  onComplete,
  storageKey,
  disclaimer,
  getResultMessage,
}) {
  const [answers, setAnswers] = useState(() => {
    if (!storageKey) return {};
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey + '_progress') || '{}');
      return saved.answers || {};
    } catch { return {}; }
  });
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (!storageKey) return 0;
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey + '_progress') || '{}');
      return saved.currentIndex || 0;
    } catch { return 0; }
  });
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(null);

  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey + '_progress', JSON.stringify({ answers, currentIndex }));
  }, [answers, currentIndex, storageKey]);

  const current = questions[currentIndex];
  const progress = (currentIndex / questions.length) * 100;

  const selectAnswer = (value) => {
    const updated = { ...answers, [current.id]: value };
    setAnswers(updated);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const finalScore = scoringFn ? scoringFn(updated) : null;
      setScore(finalScore);
      if (storageKey) localStorage.removeItem(storageKey + '_progress');
      if (getResultMessage && getResultMessage(finalScore)) {
        setShowResult(true);
      } else {
        onComplete(updated, finalScore);
      }
    }
  };

  const goBack = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  if (showResult) {
    const msg = getResultMessage(score);
    return (
      <div className="flex flex-col gap-6">
        {disclaimer && (
          <p className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3 leading-relaxed">{disclaimer}</p>
        )}
        <div className="bg-[#EEEDFE] rounded-2xl p-5 text-center">
          <div className="text-3xl mb-3">💜</div>
          <p className="text-sm text-[#534AB7] leading-relaxed">{msg}</p>
        </div>
        <button
          onClick={() => onComplete(answers, score)}
          className="w-full bg-[#1D9E75] text-white py-3.5 rounded-2xl font-semibold text-sm"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {disclaimer && (
        <p className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3 leading-relaxed">{disclaimer}</p>
      )}

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#7F77DD] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-medium text-gray-800 leading-relaxed">{current.text}</p>
      </div>

      {/* Scale */}
      <div className="flex flex-col gap-2">
        {scaleLabels.map((label, i) => (
          <button
            key={i}
            onClick={() => selectAnswer(i)}
            className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
              answers[current.id] === i
                ? 'bg-[#7F77DD] text-white border-[#7F77DD]'
                : 'bg-white border-gray-200 text-gray-700 hover:border-[#7F77DD] hover:bg-[#EEEDFE]'
            }`}
          >
            <span className="text-gray-400 mr-2 font-normal">{i}</span> {label}
          </button>
        ))}
      </div>

      {/* Back */}
      {currentIndex > 0 && (
        <button onClick={goBack} className="text-xs text-gray-400 text-center mt-1">
          ← Back
        </button>
      )}
    </div>
  );
}
