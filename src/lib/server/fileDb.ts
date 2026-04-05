import fs from 'fs';
import path from 'path';
import { DailyEntry, SetLog, ProgramUpdate } from '../types';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson<T>(filename: string, fallback: T): T {
  ensureDir();
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) return fallback;
  const raw = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(raw) as T;
}

function writeJson<T>(filename: string, data: T): void {
  ensureDir();
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

// Entries
export function getAllEntries(): Record<string, DailyEntry> {
  return readJson('entries.json', {});
}

export function saveAllEntries(entries: Record<string, DailyEntry>): void {
  writeJson('entries.json', entries);
}

export function upsertEntry(entry: DailyEntry): void {
  const entries = getAllEntries();
  entries[entry.id] = entry;
  saveAllEntries(entries);
}

export function upsertEntries(newEntries: Record<string, DailyEntry>): void {
  const entries = getAllEntries();
  for (const [id, entry] of Object.entries(newEntries)) {
    entries[id] = entry;
  }
  saveAllEntries(entries);
}

// Set Logs
export function getAllSetLogs(): Record<string, SetLog> {
  return readJson('setlogs.json', {});
}

export function saveAllSetLogs(logs: Record<string, SetLog>): void {
  writeJson('setlogs.json', logs);
}

export function upsertSetLogs(newLogs: Record<string, SetLog>): void {
  const logs = getAllSetLogs();
  for (const [id, log] of Object.entries(newLogs)) {
    logs[id] = log;
  }
  saveAllSetLogs(logs);
}

// Custom Program
export function getCustomProgram(): ProgramUpdate | null {
  return readJson<ProgramUpdate | null>('program.json', null);
}

export function saveCustomProgram(program: ProgramUpdate): void {
  writeJson('program.json', program);
}

// Full sync
export function getLastSyncTimestamp(): string {
  return readJson<{ lastSync: string }>('sync-meta.json', { lastSync: '' }).lastSync;
}

export function setLastSyncTimestamp(ts: string): void {
  writeJson('sync-meta.json', { lastSync: ts });
}
