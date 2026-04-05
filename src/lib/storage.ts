
import { DailyEntry } from './types';
import { format } from 'date-fns';

const STORAGE_KEY = 'recomp-tracker-entries';

function getEntries(): Record<string, DailyEntry> {
  if (typeof window === 'undefined') return {};
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveEntries(entries: Record<string, DailyEntry>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getTodayId(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getEntry(dateId: string): DailyEntry | null {
  const entries = getEntries();
  return entries[dateId] || null;
}

export function deleteEntry(dateId: string): void {
  const entries = getEntries();
  delete entries[dateId];
  saveEntries(entries);
}

export function saveEntry(entry: DailyEntry): void {
  const entries = getEntries();
  entries[entry.id] = entry;
  saveEntries(entries);
}

export function getEntriesForRange(startDate: Date, endDate: Date): DailyEntry[] {
  const entries = getEntries();
  const result: DailyEntry[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    const id = format(current, 'yyyy-MM-dd');
    if (entries[id]) result.push(entries[id]);
    current.setDate(current.getDate() + 1);
  }
  return result;
}

export function getLast7DaysEntries(): DailyEntry[] {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 6);
  return getEntriesForRange(start, end);
}

export function getLast30DaysEntries(): DailyEntry[] {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 29);
  return getEntriesForRange(start, end);
}

export function getAllEntries(): DailyEntry[] {
  const entries = getEntries();
  return Object.values(entries).sort((a, b) => a.id.localeCompare(b.id));
}

export function getAllEntriesRaw(): Record<string, DailyEntry> {
  return getEntries();
}

export function getWeekEntries(weekStartDate: Date): DailyEntry[] {
  const end = new Date(weekStartDate);
  end.setDate(end.getDate() + 6);
  return getEntriesForRange(weekStartDate, end);
}

export function createEmptyEntry(dateId: string): DailyEntry {
  return {
    id: dateId,
    weight: null,
    protein_meals: [false, false, false, false],
    session_done: false,
    session_type: null,
    sleep_hours: null,
    energy: null,
    waist_cm: null,
    notes: null,
    session_duration_min: null,
    water_glasses: 0,
    cardio_distance_m: null,
    cardio_duration_min: null,
    cardio_avg_hr: null,
  };
}
