
import { SetLog, ExerciseHistory, SessionType } from './types';

const STORAGE_KEY = 'recomp-tracker-setlogs';

function getLogs(): Record<string, SetLog> {
  if (typeof window === 'undefined') return {};
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveLogs(logs: Record<string, SetLog>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export function makeSetLogId(
  date: string,
  sessionType: SessionType,
  supersetId: string,
  exercise: 'a' | 'b',
  setNumber: number
): string {
  return `${date}_${sessionType}_${supersetId}_${exercise}_${setNumber}`;
}

export function saveSetLog(log: SetLog): void {
  const logs = getLogs();
  logs[log.id] = log;
  saveLogs(logs);
}

export function saveSetLogs(newLogs: SetLog[]): void {
  const logs = getLogs();
  for (const log of newLogs) {
    logs[log.id] = log;
  }
  saveLogs(logs);
}

export function deleteSetLogsForDate(date: string): void {
  const logs = getLogs();
  const filtered: Record<string, SetLog> = {};
  for (const [id, log] of Object.entries(logs)) {
    if (log.date !== date) filtered[id] = log;
  }
  saveLogs(filtered);
}

export function getSetLogsForSession(date: string, sessionType: SessionType): SetLog[] {
  const logs = getLogs();
  return Object.values(logs).filter((l) => l.date === date && l.session_type === sessionType);
}

export function getExerciseHistory(exerciseName: string): ExerciseHistory | null {
  const logs = getLogs();
  const matching = Object.values(logs)
    .filter((l) => l.exercise_name === exerciseName && l.weight_kg !== null)
    .sort((a, b) => b.date.localeCompare(a.date) || b.set_number - a.set_number);

  if (matching.length === 0) return null;

  const last = matching[0];
  const bestWeight = Math.max(...matching.map((l) => l.weight_kg!));

  return {
    exercise_name: exerciseName,
    last_date: last.date,
    last_weight: last.weight_kg,
    last_reps: last.reps_done,
    best_weight: bestWeight,
  };
}

export function getLastWeightForExercise(exerciseName: string): { weight: number; reps: number | null } | null {
  const logs = getLogs();
  const matching = Object.values(logs)
    .filter((l) => l.exercise_name === exerciseName && l.weight_kg !== null)
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return a.set_number - b.set_number; // first set of latest session
    });

  if (matching.length === 0) return null;
  return { weight: matching[0].weight_kg!, reps: matching[0].reps_done };
}

export function getAllSetLogs(): Record<string, SetLog> {
  return getLogs();
}

export function getSetLogsForDateRange(startDate: string, endDate: string): SetLog[] {
  const logs = getLogs();
  return Object.values(logs).filter((l) => l.date >= startDate && l.date <= endDate);
}

// Returns recent weights used for this exercise, sorted descending by date, unique values
export function getRecentWeightsForExercise(exerciseName: string): number[] {
  const logs = getLogs();
  const matching = Object.values(logs)
    .filter((l) => l.exercise_name === exerciseName && l.weight_kg !== null)
    .sort((a, b) => b.date.localeCompare(a.date));

  const seen = new Set<number>();
  const weights: number[] = [];
  for (const log of matching) {
    if (!seen.has(log.weight_kg!)) {
      seen.add(log.weight_kg!);
      weights.push(log.weight_kg!);
    }
    if (weights.length >= 10) break;
  }
  return weights;
}
