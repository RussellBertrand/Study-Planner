import { GAMIFICATION_DATA } from '../data/courses';

const GAMIFICATION_EVENT = 'study_planner_gamification_updated';

export function getGamificationKey(userId) {
  return `study_planner_gamification_${userId || 'guest'}`;
}

export function getGamificationState(userId) {
  const key = getGamificationKey(userId);
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}

  // Initial State cloned from default data
  const initial = {
    xpCurrent: GAMIFICATION_DATA.xpCurrent,
    xpTarget: GAMIFICATION_DATA.xpTarget,
    streakDays: GAMIFICATION_DATA.streakDays,
    weekDays: GAMIFICATION_DATA.weekDays,
    level: GAMIFICATION_DATA.level,
    activeQuests: GAMIFICATION_DATA.activeQuests,
    badges: GAMIFICATION_DATA.badges,
    leaderboard: GAMIFICATION_DATA.leaderboard,
  };
  saveGamificationState(userId, initial);
  return initial;
}

export function saveGamificationState(userId, state) {
  const key = getGamificationKey(userId);
  try {
    localStorage.setItem(key, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(GAMIFICATION_EVENT, { detail: { userId, state } }));
  } catch (e) {}
}

export function awardXP(userId, amount, reason) {
  if (!amount || amount <= 0) return null;
  const current = getGamificationState(userId);

  const newXP = current.xpCurrent + amount;
  let newLevel = current.level;

  if (newXP >= 1500) {
    newLevel = 'Tingkat 6: Pakar Mandiri';
  } else if (newXP >= 1000) {
    newLevel = 'Tingkat 5: Spesialis Madya';
  } else if (newXP >= 750) {
    newLevel = 'Tingkat 4: Pembelajar Berkelanjutan';
  } else if (newXP >= 500) {
    newLevel = 'Tingkat 3: Mahasiswa Berdedikasi';
  } else if (newXP >= 250) {
    newLevel = 'Tingkat 2: Penjelajah Topik';
  }

  // Check if badges unlock
  const updatedBadges = current.badges.map((b) => {
    if (b.id === 'b4' && newXP >= 1000) {
      return { ...b, unlocked: true };
    }
    return b;
  });

  const updatedState = {
    ...current,
    xpCurrent: newXP,
    level: newLevel,
    badges: updatedBadges,
  };

  saveGamificationState(userId, updatedState);
  return { amount, reason, newXP, newLevel };
}

export function subscribeToGamification(callback) {
  const handler = (e) => {
    if (callback) callback(e.detail);
  };
  window.addEventListener(GAMIFICATION_EVENT, handler);
  return () => window.removeEventListener(GAMIFICATION_EVENT, handler);
}

