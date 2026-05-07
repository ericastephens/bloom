import { useMemo } from "react";
import { getProfile } from '../lib/profile';

const REMINDERS = [
  { emoji: '💧', text: 'Have you had 6–8 cups of water today?' },
  { emoji: '💊', text: 'Remember your prenatal vitamin today.' },
  { emoji: '🥗', text: 'Log a meal today — your garden needs watering.' },
  { emoji: '💬', text: 'How are you feeling? Check in with Flora.' },
  null, // placeholder — Friday message uses baby name
  { emoji: '🌿', text: 'Rest is medicine. How did you sleep?' },
  { emoji: '✨', text: "You're doing beautifully. Check your milestones." },
];

export default function ReminderBanner() {
  const profile = useMemo(() => getProfile(), []);
  const babyName = profile.babyName || 'Your baby';
  const dayOfWeek = new Date().getDay();

  const reminders = [...REMINDERS];
  reminders[4] = {
    emoji: '📏',
    text: `${babyName}'s growth is on track — check the Growth tab.`,
  };

  const reminder = reminders[dayOfWeek];
  if (!reminder) return null;

  return (
    <div className="bg-[#F0FBF6] border border-[#C6EDD9] rounded-xl px-4 py-3 mb-3 flex items-start gap-3">
      <span className="text-lg leading-none mt-0.5">{reminder.emoji}</span>
      <p className="text-xs text-[#0F6E56] leading-relaxed flex-1">{reminder.text}</p>
    </div>
  );
}
