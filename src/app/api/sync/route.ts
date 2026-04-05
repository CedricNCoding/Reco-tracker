import { NextRequest, NextResponse } from 'next/server';
import {
  getAllEntries,
  upsertEntries,
  getAllSetLogs,
  upsertSetLogs,
  getCustomProgram,
  saveCustomProgram,
  setLastSyncTimestamp,
} from '@/lib/server/fileDb';
import { SyncPayload } from '@/lib/types';

// GET — fetch all server data
export async function GET() {
  const entries = getAllEntries();
  const setLogs = getAllSetLogs();
  const customProgram = getCustomProgram();
  const now = new Date().toISOString();

  const payload: SyncPayload = {
    entries,
    setLogs,
    customProgram,
    lastSync: now,
  };

  return NextResponse.json(payload);
}

// POST — push client data to server (merge)
export async function POST(request: NextRequest) {
  const body: SyncPayload = await request.json();

  if (body.entries && Object.keys(body.entries).length > 0) {
    upsertEntries(body.entries);
  }
  if (body.setLogs && Object.keys(body.setLogs).length > 0) {
    upsertSetLogs(body.setLogs);
  }
  if (body.customProgram) {
    saveCustomProgram(body.customProgram);
  }

  const now = new Date().toISOString();
  setLastSyncTimestamp(now);

  // Return merged server state
  const entries = getAllEntries();
  const setLogs = getAllSetLogs();
  const customProgram = getCustomProgram();

  const payload: SyncPayload = {
    entries,
    setLogs,
    customProgram,
    lastSync: now,
  };

  return NextResponse.json(payload);
}
