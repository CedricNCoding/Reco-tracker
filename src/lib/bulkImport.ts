
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

// Parse exercise CSV — supports two formats:
// Legacy 4-5 cols: date,exercise,weight,reps[,set]
// Extended 8 cols: date,session_type,superset_id,exercise_ab,exercise_name,weight,reps,set_number
export function parseExerciseCsv(raw: string): SetLog[] {
  const lines = raw.trim().split('\n').filter((l) => l.trim());
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase();
  const hasHeader = header.includes('date') || header.includes('exercise');
  const dataLines = hasHeader ? lines.slice(1) : lines;
  const logs: SetLog[] = [];

  for (const line of dataLines) {
    const parts = line.split(/[,;\t]/).map((s) => s.trim().replace(/"/g, ''));

    // Detect format by column count
    if (parts.length >= 8) {
      // Extended format: date,session_type,superset_id,exercise_ab,exercise_name,weight,reps,set_number
      let date = parts[0];
      const ddmm = date.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
      if (ddmm) date = `${ddmm[3]}-${ddmm[2].padStart(2, '0')}-${ddmm[1].padStart(2, '0')}`;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;

      const sessionType = parts[1] as SessionType;
      const supersetId = parts[2];
      const exerciseAb = parts[3] as 'a' | 'b';
      const exerciseName = parts[4];
      const weight = parts[5] === '' || parts[5] === 'PDC' ? null : parseFloat(parts[5]);
      const reps = parseInt(parts[6]);
      const setNum = parseInt(parts[7]) || 1;

      if (!exerciseName) continue;

      const id = makeSetLogId(date, sessionType, supersetId, exerciseAb, setNum);
      logs.push({
        id,
        date,
        session_type: sessionType,
        superset_id: supersetId,
        exercise: exerciseAb,
        exercise_name: exerciseName,
        set_number: setNum,
        weight_kg: weight !== null && !isNaN(weight) ? weight : null,
        reps_done: isNaN(reps) ? null : reps,
      });
    } else if (parts.length >= 4) {
      // Legacy format: date,exercise,weight,reps[,set]
      let date = parts[0];
      const ddmm = date.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
      if (ddmm) date = `${ddmm[3]}-${ddmm[2].padStart(2, '0')}-${ddmm[1].padStart(2, '0')}`;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;

      const exerciseName = parts[1];
      const weight = parseFloat(parts[2]);
      const reps = parseInt(parts[3]);
      const setNum = parts[4] ? parseInt(parts[4]) : 1;

      if (!exerciseName || isNaN(weight)) continue;

      logs.push({
        id: `import_${date}_${exerciseName}_${setNum}`,
        date,
        session_type: 'haut_a' as SessionType,
        superset_id: 'import',
        exercise: 'a',
        exercise_name: exerciseName,
        set_number: isNaN(setNum) ? 1 : setNum,
        weight_kg: weight,
        reps_done: isNaN(reps) ? null : reps,
      });
    }
  }

  return logs;
}

export function importExerciseData(logs: SetLog[]): number {
  let imported = 0;

  // Group logs by date to also update DailyEntries
  const byDate = new Map<string, SetLog[]>();
  for (const log of logs) {
    saveSetLog(log);
    imported++;
    if (!byDate.has(log.date)) byDate.set(log.date, []);
    byDate.get(log.date)!.push(log);
  }

  // Mark each date's DailyEntry as session_done with the correct session_type
  for (const [date, dateLogs] of byDate) {
    const existing = getEntry(date);
    const entry = existing ?? createEmptyEntry(date);
    // Use the first log's session_type (all logs for a date should share the same type)
    const sessionType = dateLogs[0].session_type;
    const isMuscu = !['run', 'natation', 'repos'].includes(sessionType);

    if (isMuscu) {
      // If entry had cardio as session_type, move it to cardio_type and set muscu
      if (entry.session_done && entry.session_type && ['run', 'natation'].includes(entry.session_type)) {
        entry.cardio_type = entry.session_type as 'run' | 'natation';
      }
      entry.session_done = true;
      entry.session_type = sessionType;
    }
    saveEntry(entry);
  }

  return imported;
}
