export const CELEBRATION_DATA = {
  t2: {
    emoji: '🌿',
    title: 'Second Trimester!',
    message: "You've made it to week 13 — your little one is growing stronger and your body is doing something extraordinary.",
    tag: 'Your garden just entered a new season',
  },
  t3: {
    emoji: '🌸',
    title: 'Third Trimester!',
    message: "Week 27 — you're in the home stretch. Your baby is growing fast and getting ready to meet you.",
    tag: 'Almost time to meet your little bloom',
  },
  birth: {
    emoji: '🌸',
    title: 'Welcome, little one!',
    message: "Your baby has arrived. This is the moment your garden has been growing toward — cherish every breath of it.",
    tag: 'Your garden just bloomed',
  },
  'first-milestone': {
    emoji: '⭐',
    title: 'First Milestone!',
    message: "Every moment of growth deserves to be celebrated. You noticed, you recorded, you showed up.",
    tag: 'Your garden just bloomed',
  },
  day1000: {
    emoji: '✨',
    title: '1,000 Days!',
    message: "You have journeyed through 1,000 days together. From the very beginning, your love has been the foundation of everything.",
    tag: 'Your garden has fully bloomed',
  },
};

export default function MilestoneCelebration({ celebrationId, onDismiss }) {
  const data = CELEBRATION_DATA[celebrationId];
  if (!data) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm px-6"
      onClick={onDismiss}
    >
      <div
        className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-6xl mb-4">{data.emoji}</div>
        <h2
          className="text-2xl font-bold text-gray-800 mb-3"
          style={{ fontFamily: 'Lora, Georgia, serif' }}
        >
          {data.title}
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-5">{data.message}</p>
        <div className="bg-[#E1F5EE] rounded-full px-4 py-2 text-xs font-semibold text-[#0F6E56] mb-6 inline-block">
          {data.tag} {data.emoji}
        </div>
        <button
          onClick={onDismiss}
          className="w-full bg-[#1D9E75] text-white py-3.5 rounded-2xl font-semibold text-sm"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
