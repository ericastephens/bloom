const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_WEEK = 7 * MS_PER_DAY;

export const getGestationalWeeks = (confirmedPregnancyDate) => {
  if (!confirmedPregnancyDate) return null;
  const diff = Date.now() - new Date(confirmedPregnancyDate).getTime();
  return Math.max(0, Math.floor(diff / MS_PER_WEEK));
};

export const getTrimester = (weeks) => {
  if (weeks <= 12) return 'T1';
  if (weeks <= 26) return 'T2';
  return 'T3';
};

export const getEstimatedDueDate = (confirmedPregnancyDate, explicitDueDate) => {
  if (explicitDueDate) return new Date(explicitDueDate);
  if (!confirmedPregnancyDate) return null;
  return new Date(new Date(confirmedPregnancyDate).getTime() + 280 * MS_PER_DAY);
};

export const getDayOf1000 = (confirmedPregnancyDate) => {
  if (!confirmedPregnancyDate) return null;
  const diff = Date.now() - new Date(confirmedPregnancyDate).getTime();
  return Math.max(0, Math.min(999, Math.floor(diff / MS_PER_DAY)));
};

const TRIMESTER_NAMES = {
  T1: 'First Trimester',
  T2: 'Second Trimester',
  T3: 'Third Trimester',
};

export const getStageLabel = (confirmedPregnancyDate, birthDate) => {
  if (!confirmedPregnancyDate) return null;
  const now = Date.now();

  if (birthDate) {
    const birthMs = new Date(birthDate).getTime();
    if (now >= birthMs) {
      const diffDays = Math.floor((now - birthMs) / MS_PER_DAY);
      const months = Math.floor(diffDays / 30.44);
      if (months < 1) return `${diffDays} days old`;
      if (months === 1) return '1 month old';
      if (months < 24) return `${months} months old`;
      return `${Math.floor(months / 12)} years old`;
    }
  }

  const weeks = getGestationalWeeks(confirmedPregnancyDate);
  if (weeks === null) return null;
  const trimester = getTrimester(weeks);
  return `Week ${weeks} · ${TRIMESTER_NAMES[trimester]}`;
};
