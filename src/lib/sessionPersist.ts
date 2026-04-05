
import { SetLog, SessionType } from './types';
import { getTodayId } from './storage';

const SESSION_STATE_KEY = 'recomp-active-session';

export interface RunnerState {
  supersetIdx: number;
  exercise: 'a' | 'b';
  set: number;
  resting: boolean;
  restStartedAt: number | null; // timestamp when rest began
  restDuration: number | null;  // total rest duration in seconds
  complete: boolean;
  warmingUp: boolean;
}

export interface PersistedSession {
  sessionType: SessionType;
  startedAt: number;
  state: RunnerState;
  setLogs: SetLog[];
}

export function loadPersistedSession(): PersistedSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STATE_KEY);
    if (!raw) return null;
    const data: PersistedSession = JSON.parse(raw);
    const today = getTodayId();
    const startedDate = new Date(data.startedAt).toISOString().slice(0, 10);
    if (startedDate === today && !data.state.complete) {
      return data;
    }
    localStorage.removeItem(SESSION_STATE_KEY);
  } catch {
    localStorage.removeItem(SESSION_STATE_KEY);
  }
  return null;
}

export function persistSession(data: PersistedSession): void {
  localStorage.setItem(SESSION_STATE_KEY, JSON.stringify(data));
}

export function clearPersistedSession(): void {
  localStorage.removeItem(SESSION_STATE_KEY);
}

/**
 * Calculate remaining rest seconds from persisted state.
 * Returns 0 if rest is already over, or the remaining seconds.
 */
export function getRemainingRest(state: RunnerState): number {
  if (!state.resting || !state.restStartedAt || !state.restDuration) return 0;
  const elapsed = Math.floor((Date.now() - state.restStartedAt) / 1000);
  return Math.max(0, state.restDuration - elapsed);
}
