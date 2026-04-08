export type SessionType =
  | 'haut_a'
  | 'bas'
  | 'haut_b'
  | 'epaules'
  | 'haut_d'
  | 'natation'
  | 'run'
  | 'repos';

export type DayOfWeek = 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'samedi' | 'dimanche';

export interface DailyEntry {
  id: string; // date ISO: "2026-04-04"
  weight: number | null;
  protein_meals: [boolean, boolean, boolean, boolean];
  session_done: boolean;
  session_type: SessionType | null;
  sleep_hours: number | null;
  energy: number | null; // 1-5
  waist_cm: number | null;
  notes: string | null;
  session_duration_min: number | null;
  water_glasses: number; // 0-5, each = 500ml
  // Cardio stats (run / natation)
  cardio_type: 'run' | 'natation' | null;
  cardio_distance_m: number | null; // meters
  cardio_duration_min: number | null;
  cardio_avg_hr: number | null; // average heart rate
}

export interface Exercise {
  name: string;
  reps: string; // "4-6", "12-15", "60 s", "40 m"
}

export interface Superset {
  id: string; // "ss1", "ss2", etc.
  label: string; // "Pilier", "Volume", "Prehab", etc.
  exercise_a: Exercise;
  exercise_b: Exercise | null;
  sets: number;
  rest_seconds: number; // 180 | 120 | 90 | 60
}

export interface SessionConfig {
  day: DayOfWeek;
  session_type: SessionType;
  title: string;
  supersets: Superset[];
}

export interface WeeklySummary {
  week_start: string;
  avg_weight: number | null;
  weight_trend: 'up' | 'down' | 'stable';
  sessions_completed: number;
  sessions_target: number;
  protein_adherence: number; // jours a 4/4 / 7
  avg_sleep: number | null;
  avg_energy: number | null;
  diagnosis: 'recomp_ok' | 'stagnation' | 'force_loss' | 'unwanted_gain';
}

export type DayType = 'training' | 'double' | 'run' | 'rest';

export interface DayNutrition {
  day_type: DayType;
  label: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  tips: string[];
}

// Session runner state
export interface SessionRunnerState {
  currentSupersetIndex: number;
  currentExercise: 'a' | 'b';
  currentSet: number;
  isResting: boolean;
  restTimeRemaining: number;
  isComplete: boolean;
  startedAt: number;
}

// V4 — Charge tracking
export interface SetLog {
  id: string; // date + session_type + superset_id + exercise + set number
  date: string; // ISO date
  session_type: SessionType;
  superset_id: string;
  exercise: 'a' | 'b';
  exercise_name: string;
  set_number: number;
  weight_kg: number | null;
  reps_done: number | null;
}

export interface ExerciseHistory {
  exercise_name: string;
  last_date: string;
  last_weight: number | null;
  last_reps: number | null;
  best_weight: number | null;
}

// V6 — Custom program import
export interface ProgramUpdate {
  version: string; // e.g. "2026-04-06"
  source: string; // "claude-adjustment"
  notes: string;
  sessions: SessionConfig[];
}

// V5 — Sync
export interface SyncPayload {
  entries: Record<string, DailyEntry>;
  setLogs: Record<string, SetLog>;
  customProgram: ProgramUpdate | null;
  lastSync: string; // ISO timestamp
}
