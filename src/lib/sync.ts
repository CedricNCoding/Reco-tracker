
import { SyncPayload, DailyEntry, SetLog, ProgramUpdate } from './types';

const SYNC_STATUS_KEY = 'recomp-tracker-sync-status';
const ENTRIES_KEY = 'recomp-tracker-entries';
const SETLOGS_KEY = 'recomp-tracker-setlogs';
const PROGRAM_KEY = 'recomp-tracker-custom-program';

function getLocalEntries(): Record<string, DailyEntry> {
  const raw = localStorage.getItem(ENTRIES_KEY);
  return raw ? JSON.parse(raw) : {};
}

function getLocalSetLogs(): Record<string, SetLog> {
  const raw = localStorage.getItem(SETLOGS_KEY);
  return raw ? JSON.parse(raw) : {};
}

function getLocalProgram(): ProgramUpdate | null {
  const raw = localStorage.getItem(PROGRAM_KEY);
  return raw ? JSON.parse(raw) : null;
}

function saveLocalEntries(entries: Record<string, DailyEntry>) {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

function saveLocalSetLogs(logs: Record<string, SetLog>) {
  localStorage.setItem(SETLOGS_KEY, JSON.stringify(logs));
}

export function saveLocalProgram(program: ProgramUpdate | null) {
  if (program) {
    localStorage.setItem(PROGRAM_KEY, JSON.stringify(program));
  } else {
    localStorage.removeItem(PROGRAM_KEY);
  }
}

export function getLocalCustomProgram(): ProgramUpdate | null {
  return getLocalProgram();
}

interface SyncResult {
  success: boolean;
  error?: string;
  entriesCount?: number;
}

export async function syncToServer(): Promise<SyncResult> {
  try {
    const payload: SyncPayload = {
      entries: getLocalEntries(),
      setLogs: getLocalSetLogs(),
      customProgram: getLocalProgram(),
      lastSync: new Date().toISOString(),
    };

    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Sync failed: ${res.status}`);

    const serverData: SyncPayload = await res.json();

    // Merge server data back (server is authoritative for merges)
    saveLocalEntries(serverData.entries);
    saveLocalSetLogs(serverData.setLogs);
    if (serverData.customProgram) {
      saveLocalProgram(serverData.customProgram);
    }

    localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify({
      lastSync: serverData.lastSync,
      status: 'ok',
    }));

    return {
      success: true,
      entriesCount: Object.keys(serverData.entries).length,
    };
  } catch (err) {
    localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify({
      lastSync: new Date().toISOString(),
      status: 'error',
      error: String(err),
    }));
    return { success: false, error: String(err) };
  }
}

export async function pullFromServer(): Promise<SyncResult> {
  try {
    const res = await fetch('/api/sync');
    if (!res.ok) throw new Error(`Pull failed: ${res.status}`);

    const serverData: SyncPayload = await res.json();

    // Merge: server entries override local for same keys
    const localEntries = getLocalEntries();
    const merged = { ...localEntries, ...serverData.entries };
    saveLocalEntries(merged);

    const localLogs = getLocalSetLogs();
    const mergedLogs = { ...localLogs, ...serverData.setLogs };
    saveLocalSetLogs(mergedLogs);

    if (serverData.customProgram) {
      saveLocalProgram(serverData.customProgram);
    }

    return {
      success: true,
      entriesCount: Object.keys(merged).length,
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export function getLastSyncStatus(): { lastSync: string; status: string; error?: string } | null {
  const raw = localStorage.getItem(SYNC_STATUS_KEY);
  return raw ? JSON.parse(raw) : null;
}

// Auto-sync: pull from server, merge with local, push back
export async function autoSync(): Promise<void> {
  try {
    // 1. Pull server data and merge into local
    const res = await fetch('/api/sync');
    if (!res.ok) return;
    const serverData: SyncPayload = await res.json();

    // Merge entries: keep most recent version per date (compare fields filled)
    const localEntries = getLocalEntries();
    const merged: Record<string, DailyEntry> = { ...localEntries };
    for (const [id, serverEntry] of Object.entries(serverData.entries)) {
      const local = merged[id];
      if (!local) {
        merged[id] = serverEntry;
      } else {
        // Keep whichever has more data
        const localFilled = countFilledFields(local);
        const serverFilled = countFilledFields(serverEntry);
        if (serverFilled > localFilled) {
          merged[id] = serverEntry;
        }
      }
    }
    saveLocalEntries(merged);

    // Merge set logs: server wins for same ID
    const localLogs = getLocalSetLogs();
    const mergedLogs = { ...localLogs, ...serverData.setLogs };
    saveLocalSetLogs(mergedLogs);

    // Program: server wins if exists
    if (serverData.customProgram) {
      saveLocalProgram(serverData.customProgram);
    }

    // 2. Push merged data back to server
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entries: merged,
        setLogs: mergedLogs,
        customProgram: getLocalProgram(),
        lastSync: new Date().toISOString(),
      }),
    });

    localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify({
      lastSync: new Date().toISOString(),
      status: 'ok',
    }));
  } catch {
    // Offline — silent fail, localStorage still works
  }
}

function countFilledFields(entry: DailyEntry): number {
  let count = 0;
  if (entry.weight !== null) count++;
  if (entry.protein_meals.some(Boolean)) count++;
  if (entry.session_done) count++;
  if (entry.sleep_hours !== null) count++;
  if (entry.energy !== null) count++;
  if (entry.waist_cm !== null) count++;
  if (entry.notes) count++;
  if (entry.water_glasses > 0) count++;
  if (entry.cardio_distance_m !== null) count++;
  return count;
}
