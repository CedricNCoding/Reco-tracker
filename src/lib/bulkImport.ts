
import { DailyEntry, SetLog, SessionType } from './types';
import { createEmptyEntry, saveEntry, getEntry } from './storage';
import { makeSetLogId, saveSetLog } from './setLogStorage';

// Parse CSV/TSV weight data: "date,weight" or "date\tweight"
export function parseWeightCsv(raw: string): { date: string; weight: number }[] {
  const lines = raw.trim().split('\n').filter((l) => l.trim());
  const results: { date: string; weight: number }[] = [];

  for (const line of lines) {
    const parts = line.split(/[,;\t]/).map((s) => s.trim().replace(/"/g, ''));
    if (parts.length < 2) continue;

    // Try to parse date
    let date = parts[0];
    // Handle DD/MM/YYYY
    const ddmm = date.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
    if (ddmm) {
      date = `${ddmm[3]}-${ddmm[2].padStart(2, '0')}-${ddmm[1].padStart(2, '0')}`;
    }
    // Validate ISO date
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;

    const weight = parseFloat(parts[1]);
    if (isNaN(weight) || weight < 30 || weight > 300) continue;

    results.push({ date, weight });
  }

  return results;
}

export function importWeightData(data: { date: string; weight: number }[]): number {
  let imported = 0;
  for (const { date, weight } of data) {
    const existing = getEntry(date);
    if (existing) {
      // Only update weight if not already set
      if (existing.weight === null) {
        existing.weight = weight;
        saveEntry(existing);
        imported++;
      }
    } else {
      const entry = createEmptyEntry(date);
      entry.weight = weight;
      saveEntry(entry);
      imported++;
    }
  }
  return imported;
}

// Parse Strong/Hevy CSV format: date, exercise, weight, reps, sets
export function parseExerciseCsv(raw: string): SetLog[] {
  const lines = raw.trim().split('\n').filter((l) => l.trim());
  if (lines.length < 2) return []; // need header + data

  const header = lines[0].toLowerCase();
  const hasHeader = header.includes('date') || header.includes('exercise');
  const dataLines = hasHeader ? lines.slice(1) : lines;
  const logs: SetLog[] = [];

  for (const line of dataLines) {
    const parts = line.split(/[,;\t]/).map((s) => s.trim().replace(/"/g, ''));
    if (parts.length < 4) continue;

    let date = parts[0];
    const ddmm = date.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
    if (ddmm) {
      date = `${ddmm[3]}-${ddmm[2].padStart(2, '0')}-${ddmm[1].padStart(2, '0')}`;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;

    const exerciseName = parts[1];
    const weight = parseFloat(parts[2]);
    const reps = parseInt(parts[3]);
    const setNum = parts[4] ? parseInt(parts[4]) : 1;

    if (!exerciseName || isNaN(weight)) continue;

    const log: SetLog = {
      id: `import_${date}_${exerciseName}_${setNum}`,
      date,
      session_type: 'haut_a' as SessionType, // default
      superset_id: 'import',
      exercise: 'a',
      exercise_name: exerciseName,
      set_number: isNaN(setNum) ? 1 : setNum,
      weight_kg: weight,
      reps_done: isNaN(reps) ? null : reps,
    };
    logs.push(log);
  }

  return logs;
}

export function importExerciseData(logs: SetLog[]): number {
  let imported = 0;
  for (const log of logs) {
    saveSetLog(log);
    imported++;
  }
  return imported;
}
