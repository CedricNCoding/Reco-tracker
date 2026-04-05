'use client';

import { SetLog } from './types';
import { getAllSetLogs } from './setLogStorage';

export interface ExerciseProgressPoint {
  date: string;
  maxWeight: number;
  avgReps: number | null;
}

export interface ExerciseSummary {
  name: string;
  totalSessions: number;
  lastDate: string;
  lastWeight: number;
  bestWeight: number;
  trend: 'up' | 'down' | 'stable';
}

export function getUniqueExercises(): string[] {
  const logs = getAllSetLogs();
  const names = new Set<string>();
  for (const log of Object.values(logs)) {
    if (log.weight_kg !== null) names.add(log.exercise_name);
  }
  return Array.from(names).sort();
}

export function getExerciseProgression(exerciseName: string): ExerciseProgressPoint[] {
  const logs = getAllSetLogs();
  const matching = Object.values(logs)
    .filter((l) => l.exercise_name === exerciseName && l.weight_kg !== null);

  // Group by date
  const byDate: Record<string, SetLog[]> = {};
  for (const log of matching) {
    if (!byDate[log.date]) byDate[log.date] = [];
    byDate[log.date].push(log);
  }

  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, logs]) => {
      const weights = logs.map((l) => l.weight_kg!);
      const reps = logs.filter((l) => l.reps_done !== null).map((l) => l.reps_done!);
      return {
        date,
        maxWeight: Math.max(...weights),
        avgReps: reps.length > 0 ? Math.round((reps.reduce((a, b) => a + b, 0) / reps.length) * 10) / 10 : null,
      };
    });
}

export function getAllExerciseSummaries(): ExerciseSummary[] {
  const names = getUniqueExercises();
  return names.map((name) => {
    const progression = getExerciseProgression(name);
    if (progression.length === 0) return null;

    const last = progression[progression.length - 1];
    const best = Math.max(...progression.map((p) => p.maxWeight));

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (progression.length >= 2) {
      const prev = progression[progression.length - 2];
      if (last.maxWeight > prev.maxWeight) trend = 'up';
      else if (last.maxWeight < prev.maxWeight) trend = 'down';
    }

    return {
      name,
      totalSessions: progression.length,
      lastDate: last.date,
      lastWeight: last.maxWeight,
      bestWeight: best,
      trend,
    };
  }).filter(Boolean) as ExerciseSummary[];
}

// Detect pillar regressions for deload
export function getPillarRegressions(): { exercise: string; dates: string[]; weights: number[] }[] {
  const pillars = [
    'Developpe couche barre',
    'Tractions pronation (lestees)',
    'Developpe militaire halteres assis',
    'Hack squat ou presse',
    'Developpe incline machine/halteres',
  ];

  const regressions: { exercise: string; dates: string[]; weights: number[] }[] = [];

  for (const name of pillars) {
    const prog = getExerciseProgression(name);
    if (prog.length < 3) continue;

    const last3 = prog.slice(-3);
    // Check if last 2 sessions are both lower than the one before
    if (last3[2].maxWeight < last3[1].maxWeight && last3[1].maxWeight < last3[0].maxWeight) {
      regressions.push({
        exercise: name,
        dates: last3.map((p) => p.date),
        weights: last3.map((p) => p.maxWeight),
      });
    } else if (last3[2].maxWeight < last3[0].maxWeight && last3[1].maxWeight < last3[0].maxWeight) {
      regressions.push({
        exercise: name,
        dates: last3.map((p) => p.date),
        weights: last3.map((p) => p.maxWeight),
      });
    }
  }

  return regressions;
}
