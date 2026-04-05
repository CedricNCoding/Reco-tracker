import { DailyEntry, WeeklySummary } from './types';

export function calculateAvgWeight(entries: DailyEntry[]): number | null {
  const weights = entries.filter((e) => e.weight !== null).map((e) => e.weight!);
  if (weights.length === 0) return null;
  return Math.round((weights.reduce((a, b) => a + b, 0) / weights.length) * 10) / 10;
}

export function calculateWeightTrend(
  currentAvg: number | null,
  previousAvg: number | null
): 'up' | 'down' | 'stable' {
  if (currentAvg === null || previousAvg === null) return 'stable';
  const diff = currentAvg - previousAvg;
  if (diff > 0.3) return 'up';
  if (diff < -0.3) return 'down';
  return 'stable';
}

export function calculateProteinAdherence(entries: DailyEntry[]): number {
  return entries.filter((e) => e.protein_meals.every((m) => m)).length;
}

export function calculateSessionsCompleted(entries: DailyEntry[]): number {
  return entries.filter((e) => e.session_done).length;
}

export function calculateAvgSleep(entries: DailyEntry[]): number | null {
  const sleeps = entries.filter((e) => e.sleep_hours !== null).map((e) => e.sleep_hours!);
  if (sleeps.length === 0) return null;
  return Math.round((sleeps.reduce((a, b) => a + b, 0) / sleeps.length) * 10) / 10;
}

export function calculateAvgEnergy(entries: DailyEntry[]): number | null {
  const energies = entries.filter((e) => e.energy !== null).map((e) => e.energy!);
  if (energies.length === 0) return null;
  return Math.round((energies.reduce((a, b) => a + b, 0) / energies.length) * 10) / 10;
}

export function calculateDiagnosis(
  weightTrend: 'up' | 'down' | 'stable',
  sessionsCompleted: number,
  sessionsTarget: number
): WeeklySummary['diagnosis'] {
  const adherence = sessionsCompleted / sessionsTarget;

  if (weightTrend === 'stable' && adherence >= 0.8) return 'recomp_ok';
  if (weightTrend === 'down' && adherence < 0.8) return 'force_loss';
  if (weightTrend === 'up' && adherence >= 0.6) return 'unwanted_gain';
  if (weightTrend === 'stable' && adherence < 0.6) return 'stagnation';

  // Default cases
  if (weightTrend === 'down') return 'recomp_ok'; // slight loss is ok
  if (weightTrend === 'up') return 'unwanted_gain';
  return 'stagnation';
}

export function calculateMovingAverage(entries: DailyEntry[], window: number = 7): { date: string; weight: number | null; avg: number | null }[] {
  return entries.map((entry, i) => {
    const slice = entries.slice(Math.max(0, i - window + 1), i + 1);
    const weights = slice.filter((e) => e.weight !== null).map((e) => e.weight!);
    return {
      date: entry.id,
      weight: entry.weight,
      avg: weights.length >= 2 ? Math.round((weights.reduce((a, b) => a + b, 0) / weights.length) * 10) / 10 : null,
    };
  });
}

export function calculateWeeklySessionAdherence(entries: DailyEntry[]): { done: number; target: number } {
  const done = entries.filter((e) => e.session_done && e.session_type !== 'repos').length;
  return { done, target: 5 };
}

export function generateWeeklySummary(
  weekEntries: DailyEntry[],
  previousWeekEntries: DailyEntry[],
  weekStart: string
): WeeklySummary {
  const avgWeight = calculateAvgWeight(weekEntries);
  const prevAvgWeight = calculateAvgWeight(previousWeekEntries);
  const weightTrend = calculateWeightTrend(avgWeight, prevAvgWeight);
  const sessionsCompleted = calculateSessionsCompleted(weekEntries);
  const sessionsTarget = 5;

  return {
    week_start: weekStart,
    avg_weight: avgWeight,
    weight_trend: weightTrend,
    sessions_completed: sessionsCompleted,
    sessions_target: sessionsTarget,
    protein_adherence: calculateProteinAdherence(weekEntries),
    avg_sleep: calculateAvgSleep(weekEntries),
    avg_energy: calculateAvgEnergy(weekEntries),
    diagnosis: calculateDiagnosis(weightTrend, sessionsCompleted, sessionsTarget),
  };
}
