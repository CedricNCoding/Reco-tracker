'use client';

import { DailyEntry, SetLog } from './types';

export function exportEntriesToCsv(entries: DailyEntry[]): string {
  const headers = [
    'date', 'weight_kg', 'protein_petit_dej', 'protein_dejeuner', 'protein_collation', 'protein_diner',
    'session_done', 'session_type', 'sleep_hours', 'energy', 'waist_cm', 'water_glasses',
    'session_duration_min', 'notes',
  ];

  const rows = entries.map((e) => [
    e.id,
    e.weight ?? '',
    e.protein_meals[0] ? 1 : 0,
    e.protein_meals[1] ? 1 : 0,
    e.protein_meals[2] ? 1 : 0,
    e.protein_meals[3] ? 1 : 0,
    e.session_done ? 1 : 0,
    e.session_type ?? '',
    e.sleep_hours ?? '',
    e.energy ?? '',
    e.waist_cm ?? '',
    e.water_glasses ?? 0,
    e.session_duration_min ?? '',
    (e.notes ?? '').replace(/"/g, '""'),
  ]);

  return [
    headers.join(','),
    ...rows.map((r) => r.map((v) => typeof v === 'string' && v.includes(',') ? `"${v}"` : v).join(',')),
  ].join('\n');
}

export function exportSetLogsToCsv(logs: SetLog[]): string {
  const headers = ['date', 'session_type', 'superset_id', 'exercise', 'exercise_name', 'set_number', 'weight_kg', 'reps_done'];

  const rows = logs.map((l) => [
    l.date, l.session_type, l.superset_id, l.exercise,
    l.exercise_name.replace(/"/g, '""'),
    l.set_number, l.weight_kg ?? '', l.reps_done ?? '',
  ]);

  return [
    headers.join(','),
    ...rows.map((r) => r.map((v) => typeof v === 'string' && v.includes(',') ? `"${v}"` : v).join(',')),
  ].join('\n');
}

export function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
