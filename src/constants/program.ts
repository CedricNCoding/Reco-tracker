import { SessionConfig, SessionType, DayOfWeek } from '@/lib/types';

export const WEEK_SCHEDULE: { day: DayOfWeek; session_type: SessionType; label: string; time: string }[] = [
  { day: 'lundi', session_type: 'haut_a', label: 'Haut A — Pecs + Triceps + Biceps', time: '6h-7h30' },
  { day: 'mardi', session_type: 'bas', label: 'Bas — Squat + Ischios', time: '6h-7h30' },
  { day: 'mercredi', session_type: 'haut_b', label: 'Haut B — Dos + Biceps + Brasse 1km (soir)', time: '6h-7h30 + soir' },
  { day: 'jeudi', session_type: 'epaules', label: 'Haut C — Epaules + OHP', time: '6h-7h30' },
  { day: 'vendredi', session_type: 'haut_d', label: 'Haut D — Pecs variante + Dos + Bras', time: '6h-7h30' },
  { day: 'samedi', session_type: 'repos', label: 'Repos', time: '—' },
  { day: 'dimanche', session_type: 'run', label: 'Run 5 km', time: 'Matin' },
];

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  haut_a: 'Haut A',
  bas: 'Bas',
  haut_b: 'Haut B',
  epaules: 'Epaules',
  haut_d: 'Haut D',
  natation: 'Natation',
  run: 'Run 5km',
  repos: 'Repos',
};

export const SESSIONS: SessionConfig[] = [
  // ===== LUNDI — Haut A (Pecs + Triceps + Biceps) =====
  {
    day: 'lundi',
    session_type: 'haut_a',
    title: 'Haut A — Pecs + Triceps + Biceps',
    supersets: [
      {
        id: 'ss1',
        label: 'Pilier',
        exercise_a: { name: 'Developpe couche barre', reps: '4-6' },
        exercise_b: { name: 'Pompes lestees', reps: '12-15' },
        sets: 4,
        rest_seconds: 180,
      },
      {
        id: 'ss2',
        label: 'Volume',
        exercise_a: { name: 'Developpe incline halteres', reps: '8-12' },
        exercise_b: { name: 'Ecarte poulie (bas → haut)', reps: '15-20' },
        sets: 3,
        rest_seconds: 120,
      },
      {
        id: 'ss3',
        label: 'Volume',
        exercise_a: { name: 'Dips (machine ou lest leger)', reps: '8-12' },
        exercise_b: null,
        sets: 3,
        rest_seconds: 120,
      },
      {
        id: 'ss4',
        label: 'Accessoire',
        exercise_a: { name: 'Triceps poulie barre', reps: '12-15' },
        exercise_b: { name: 'Extension overhead corde', reps: '12-15' },
        sets: 3,
        rest_seconds: 90,
      },
      {
        id: 'ss5',
        label: 'Biceps',
        exercise_a: { name: 'Curl incline', reps: '12-15' },
        exercise_b: { name: 'Curl marteau corde', reps: '15-20' },
        sets: 3,
        rest_seconds: 90,
      },
      {
        id: 'ss6',
        label: 'Tronc',
        exercise_a: { name: 'Crunch machine', reps: '8-12' },
        exercise_b: { name: 'Releves de jambes', reps: '12-15' },
        sets: 3,
        rest_seconds: 90,
      },
      {
        id: 'ss7',
        label: 'Prehab',
        exercise_a: { name: 'Face pull', reps: '15-20' },
        exercise_b: { name: 'Rotations externes', reps: '15-20' },
        sets: 2,
        rest_seconds: 60,
      },
    ],
  },

  // ===== MARDI — Bas (Squat + Ischios) =====
  {
    day: 'mardi',
    session_type: 'bas',
    title: 'Bas — Squat + Ischios',
    supersets: [
      {
        id: 'ss1',
        label: 'Pilier',
        exercise_a: { name: 'Hack squat ou presse', reps: '8-10' },
        exercise_b: { name: 'Leg curl assis/allonge', reps: '12-15' },
        sets: 4,
        rest_seconds: 180,
      },
      {
        id: 'ss2',
        label: 'Volume',
        exercise_a: { name: 'Romanian deadlift', reps: '8-10' },
        exercise_b: { name: 'Abduction hanche machine', reps: '15-20' },
        sets: 3,
        rest_seconds: 120,
      },
      {
        id: 'ss3',
        label: 'Volume',
        exercise_a: { name: 'Bulgarian split squat', reps: '10-12' },
        exercise_b: { name: 'Leg extension', reps: '12-15' },
        sets: 2,
        rest_seconds: 120,
      },
      {
        id: 'ss4',
        label: 'Volume',
        exercise_a: { name: 'Hip thrust machine/barre', reps: '10-12' },
        exercise_b: { name: 'Back extension (glute focus)', reps: '15' },
        sets: 3,
        rest_seconds: 120,
      },
      {
        id: 'ss5',
        label: 'Pump',
        exercise_a: { name: 'Leg curl leger', reps: '20' },
        exercise_b: { name: 'Leg extension leger', reps: '20' },
        sets: 2,
        rest_seconds: 90,
      },
      {
        id: 'ss6',
        label: 'Tronc',
        exercise_a: { name: 'Rollout poulie haute', reps: '12' },
        exercise_b: { name: 'Gainage lateral', reps: '40 s' },
        sets: 3,
        rest_seconds: 90,
      },
      {
        id: 'ss7',
        label: 'Option',
        exercise_a: { name: 'Farmer carry', reps: '40 m' },
        exercise_b: { name: 'Mobilite hanches/chevilles', reps: '3 min' },
        sets: 2,
        rest_seconds: 90,
      },
    ],
  },

  // ===== MERCREDI — Haut B (Dos + Biceps) =====
  {
    day: 'mercredi',
    session_type: 'haut_b',
    title: 'Haut B — Dos + Biceps',
    supersets: [
      {
        id: 'ss1',
        label: 'Pilier',
        exercise_a: { name: 'Tractions pronation (lestees)', reps: '6-8' },
        exercise_b: { name: 'Row poulie/machine', reps: '8-10' },
        sets: 4,
        rest_seconds: 180,
      },
      {
        id: 'ss2',
        label: 'Volume',
        exercise_a: { name: 'Tirage vertical neutre/serre', reps: '10-12' },
        exercise_b: { name: 'Row poitrine-support', reps: '10-12' },
        sets: 3,
        rest_seconds: 120,
      },
      {
        id: 'ss3',
        label: 'Accessoire',
        exercise_a: { name: 'Pull-over cable', reps: '15-20' },
        exercise_b: { name: 'Row unilateral haltere/poulie', reps: '12-15' },
        sets: 3,
        rest_seconds: 90,
      },
      {
        id: 'ss4',
        label: 'Accessoire',
        exercise_a: { name: 'Row haut (rear delt row)', reps: '12-15' },
        exercise_b: { name: 'Shrug halteres/machine', reps: '12-15' },
        sets: 3,
        rest_seconds: 90,
      },
      {
        id: 'ss5',
        label: 'Biceps',
        exercise_a: { name: 'Curl barre EZ', reps: '10-12' },
        exercise_b: { name: 'Curl incline', reps: '12-15' },
        sets: 3,
        rest_seconds: 90,
      },
      {
        id: 'ss6',
        label: 'Finisher',
        exercise_a: { name: 'Curl pupitre', reps: '15-20' },
        exercise_b: null,
        sets: 2,
        rest_seconds: 60,
      },
      {
        id: 'ss7',
        label: 'Posture',
        exercise_a: { name: 'Farmer carry leger', reps: '40 m' },
        exercise_b: { name: 'Wall slides', reps: '15' },
        sets: 2,
        rest_seconds: 60,
      },
    ],
  },

  // ===== JEUDI — Haut C (Epaules + OHP) =====
  {
    day: 'jeudi',
    session_type: 'epaules',
    title: 'Haut C — Epaules : OHP + lateral/arriere + posture',
    supersets: [
      {
        id: 'ss1',
        label: 'Pilier',
        exercise_a: { name: 'Developpe militaire halteres assis', reps: '8-10' },
        exercise_b: { name: 'Elevations laterales strict', reps: '15-20' },
        sets: 4,
        rest_seconds: 180,
      },
      {
        id: 'ss2',
        label: 'Volume',
        exercise_a: { name: 'Elevations laterales poulie (unilateral)', reps: '15-20' },
        exercise_b: { name: 'Reverse pec deck / oiseau', reps: '15-20' },
        sets: 3,
        rest_seconds: 90,
      },
      {
        id: 'ss3',
        label: 'Volume',
        exercise_a: { name: 'Y-raise incline', reps: '15-20' },
        exercise_b: { name: 'Face pull', reps: '15-20' },
        sets: 3,
        rest_seconds: 90,
      },
      {
        id: 'ss4',
        label: 'Accessoire',
        exercise_a: { name: 'Elevations laterales lean-away', reps: '15-20' },
        exercise_b: { name: 'Rotations externes cable', reps: '15-20' },
        sets: 2,
        rest_seconds: 90,
      },
      {
        id: 'ss5',
        label: 'Tronc',
        exercise_a: { name: 'Pallof press', reps: '12-15' },
        exercise_b: { name: 'Planche', reps: '60 s' },
        sets: 3,
        rest_seconds: 90,
      },
      {
        id: 'ss6',
        label: 'Prehab',
        exercise_a: { name: 'Dead bug', reps: '12' },
        exercise_b: { name: 'Side plank', reps: '40 s' },
        sets: 2,
        rest_seconds: 60,
      },
    ],
  },

  // ===== VENDREDI — Haut D (Pecs variante + Dos rattrapage + Bras) =====
  {
    day: 'vendredi',
    session_type: 'haut_d',
    title: 'Haut D — Pecs variante + Dos rattrapage + Bras',
    supersets: [
      {
        id: 'ss1',
        label: 'Pilier',
        exercise_a: { name: 'Developpe incline machine/halteres', reps: '8-10' },
        exercise_b: { name: 'Developpe couche halteres neutre', reps: '10-12' },
        sets: 4,
        rest_seconds: 180,
      },
      {
        id: 'ss2',
        label: 'Volume',
        exercise_a: { name: 'Developpe convergent machine', reps: '10-12' },
        exercise_b: { name: 'Ecarte poulie', reps: '15-20' },
        sets: 3,
        rest_seconds: 120,
      },
      {
        id: 'ss3',
        label: 'Dos',
        exercise_a: { name: 'Tirage vertical prise large', reps: '10-12' },
        exercise_b: { name: 'Row machine (chest-supported)', reps: '10-12' },
        sets: 3,
        rest_seconds: 120,
      },
      {
        id: 'ss4',
        label: 'Biceps',
        exercise_a: { name: 'Curl marteau', reps: '10-12' },
        exercise_b: { name: 'Curl pupitre leger', reps: '15-20' },
        sets: 3,
        rest_seconds: 90,
      },
      {
        id: 'ss5',
        label: 'Triceps',
        exercise_a: { name: 'Triceps corde', reps: '15-20' },
        exercise_b: { name: 'Triceps unilateral poulie', reps: '12-15' },
        sets: 2,
        rest_seconds: 90,
      },
      {
        id: 'ss6',
        label: 'Tronc',
        exercise_a: { name: 'Releves de jambes', reps: '15' },
        exercise_b: { name: 'Planche lestee', reps: '60 s' },
        sets: 3,
        rest_seconds: 90,
      },
      {
        id: 'ss7',
        label: 'Prehab',
        exercise_a: { name: 'Face pull', reps: '20-25' },
        exercise_b: { name: 'Rotations externes cable', reps: '15-20' },
        sets: 2,
        rest_seconds: 60,
      },
    ],
  },
];

// Custom program support — loads from localStorage if available
function getActiveSessions(): SessionConfig[] {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('recomp-tracker-custom-program');
    if (raw) {
      try {
        const custom = JSON.parse(raw);
        if (custom?.sessions?.length > 0) return custom.sessions;
      } catch { /* fallback to default */ }
    }
  }
  return SESSIONS;
}

// Helper: get today's session config
export function getTodaySession(): SessionConfig | null {
  const days: DayOfWeek[] = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const today = days[new Date().getDay()];
  const sessions = getActiveSessions();
  return sessions.find((s) => s.day === today) || null;
}

// Helper: get today's schedule entry
export function getTodaySchedule() {
  const days: DayOfWeek[] = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const today = days[new Date().getDay()];
  return WEEK_SCHEDULE.find((s) => s.day === today) || WEEK_SCHEDULE[5]; // fallback repos
}

// Helper: get session config by type
export function getSessionByType(type: SessionType): SessionConfig | null {
  const sessions = getActiveSessions();
  return sessions.find((s) => s.session_type === type) || null;
}
