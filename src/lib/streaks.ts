'use client';

import { format, subDays } from 'date-fns';
import { getEntry } from './storage';

export interface StreakData {
  checkinStreak: number; // consecutive days with a check-in
  sessionStreak: number; // consecutive planned weeks without missed session
  currentWeekSessions: number;
}

export function calculateCheckinStreak(): number {
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const date = subDays(today, i);
    const id = format(date, 'yyyy-MM-dd');
    const entry = getEntry(id);

    // Consider a check-in done if any meaningful data is filled
    const hasCi = entry && (
      entry.weight !== null ||
      entry.session_done ||
      entry.protein_meals.some(Boolean) ||
      entry.sleep_hours !== null
    );

    if (hasCi) {
      streak++;
    } else if (i === 0) {
      // Today not filled yet — that's ok, don't break
      continue;
    } else {
      break;
    }
  }

  return streak;
}

export function calculateSessionWeekStreak(): number {
  // Count consecutive weeks (Mon-Sun) with 5+ sessions
  let streak = 0;
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  // Start from last completed week
  for (let w = 1; w < 52; w++) {
    const weekStart = subDays(today, mondayOffset + w * 7);
    let sessions = 0;

    for (let d = 0; d < 7; d++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + d);
      const id = format(date, 'yyyy-MM-dd');
      const entry = getEntry(id);
      if (entry?.session_done) sessions++;
    }

    if (sessions >= 5) {
      streak++;
    } else if (sessions > 0) {
      // Partial week — break
      break;
    } else {
      break;
    }
  }

  return streak;
}
