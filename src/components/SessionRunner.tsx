
import { useState, useRef, useCallback, useEffect } from 'react';
import { SessionConfig, SetLog } from '@/lib/types';
import { getTodayId } from '@/lib/storage';
import { saveSetLogs, getLastWeightForExercise, makeSetLogId } from '@/lib/setLogStorage';
import { requestWakeLock, releaseWakeLock } from '@/lib/wakeLock';
import {
  RunnerState,
  loadPersistedSession,
  persistSession,
  clearPersistedSession,
  getRemainingRest,
} from '@/lib/sessionPersist';
import ExerciseCard from './ExerciseCard';
import RestTimer from './RestTimer';
import WeightRepsInput from './WeightRepsInput';
import WarmUpSets from './WarmUpSets';
import { X, Trophy, SkipForward, ChevronLeft, CornerDownLeft } from 'lucide-react';

interface SessionRunnerProps {
  session: SessionConfig;
  onComplete: (durationMin: number) => void;
  onExit: () => void;
}

function makeInitialState(session: SessionConfig): RunnerState {
  const firstSS = session.supersets[0];
  const isPillar = firstSS?.label?.toLowerCase().includes('pilier');
  return {
    supersetIdx: 0,
    exercise: 'a',
    set: 1,
    resting: false,
    restStartedAt: null,
    restDuration: null,
    complete: false,
    warmingUp: isPillar,
  };
}

export default function SessionRunner({ session, onComplete, onExit }: SessionRunnerProps) {
  const [initialized, setInitialized] = useState(false);
  const [state, setState] = useState<RunnerState>(makeInitialState(session));
  const [restoredRestRemaining, setRestoredRestRemaining] = useState<number | null>(null);
  // When editing a past set, stores the position to return to after confirmation
  const [editingFrom, setEditingFrom] = useState<RunnerState | null>(null);
  const startedAtRef = useRef<number>(Date.now());
  const setLogsRef = useRef<SetLog[]>([]);

  const superset = session.supersets[state.supersetIdx];
  const currentExercise = state.exercise === 'a' ? superset?.exercise_a : superset?.exercise_b;
  const todayId = getTodayId();
  const lastPerf = currentExercise ? getLastWeightForExercise(currentExercise.name) : null;

  // Find existing log for current position (for editing)
  const existingLog = superset ? setLogsRef.current.find(
    (log) => log.superset_id === superset.id && log.exercise === state.exercise && log.set_number === state.set
  ) : undefined;

  // Restore persisted session on mount
  useEffect(() => {
    const persisted = loadPersistedSession();
    if (persisted && persisted.sessionType === session.session_type) {
      startedAtRef.current = persisted.startedAt;
      setLogsRef.current = persisted.setLogs;

      // Handle rest timer restoration
      if (persisted.state.resting) {
        const remaining = getRemainingRest(persisted.state);
        if (remaining > 0) {
          // Rest still ongoing — restore with correct remaining time
          setRestoredRestRemaining(remaining);
          setState(persisted.state);
        } else {
          // Rest already ended while away — advance to next exercise
          setState({
            ...persisted.state,
            resting: false,
            restStartedAt: null,
            restDuration: null,
            exercise: 'a',
            set: persisted.state.set + 1,
          });
        }
      } else {
        setState(persisted.state);
      }
    }
    setInitialized(true);
  }, [session.session_type]);

  // Wake lock
  useEffect(() => {
    requestWakeLock();
    return () => { releaseWakeLock(); };
  }, []);

  // Persist on every state change (after init)
  useEffect(() => {
    if (!initialized) return;
    persistSession({
      sessionType: session.session_type,
      startedAt: startedAtRef.current,
      state,
      setLogs: setLogsRef.current,
    });
  }, [state, session.session_type, initialized]);

  // Clear restored rest remaining after first render of RestTimer
  useEffect(() => {
    if (restoredRestRemaining !== null && !state.resting) {
      setRestoredRestRemaining(null);
    }
  }, [state.resting, restoredRestRemaining]);

  const handleSetDone = useCallback((weight: number | null, reps: number | null) => {
    if (superset && currentExercise) {
      const logId = makeSetLogId(todayId, session.session_type, superset.id, state.exercise, state.set);
      const log: SetLog = {
        id: logId,
        date: todayId,
        session_type: session.session_type,
        superset_id: superset.id,
        exercise: state.exercise,
        exercise_name: currentExercise.name,
        set_number: state.set,
        weight_kg: weight,
        reps_done: reps,
      };
      // Update existing log or append new one
      const existingIdx = setLogsRef.current.findIndex((l) => l.id === logId);
      if (existingIdx >= 0) {
        const updated = [...setLogsRef.current];
        updated[existingIdx] = log;
        setLogsRef.current = updated;
      } else {
        setLogsRef.current = [...setLogsRef.current, log];
      }
    }

    // If editing a past set, return to where we were
    if (editingFrom) {
      setState(editingFrom);
      setEditingFrom(null);
      return;
    }

    const ss = superset;
    const hasB = ss.exercise_b !== null;

    if (state.exercise === 'a' && hasB) {
      setState((s) => ({ ...s, exercise: 'b' }));
      return;
    }

    if (state.set < ss.sets) {
      setState((s) => ({
        ...s,
        resting: true,
        restStartedAt: Date.now(),
        restDuration: ss.rest_seconds,
      }));
      return;
    }

    moveToNextSuperset();
  }, [superset, currentExercise, state, todayId, session.session_type, editingFrom]);

  function handleRestComplete() {
    setRestoredRestRemaining(null);
    setState((s) => ({
      ...s,
      resting: false,
      restStartedAt: null,
      restDuration: null,
      exercise: 'a',
      set: s.set + 1,
    }));
  }

  function moveToNextSuperset() {
    const nextIdx = state.supersetIdx + 1;
    if (nextIdx >= session.supersets.length) {
      setState((s) => ({ ...s, complete: true }));
      return;
    }
    const nextSS = session.supersets[nextIdx];
    const isPillar = nextSS?.label?.toLowerCase().includes('pilier');
    setState({
      supersetIdx: nextIdx,
      exercise: 'a',
      set: 1,
      resting: false,
      restStartedAt: null,
      restDuration: null,
      complete: false,
      warmingUp: isPillar,
    });
  }

  function handleSkipSuperset() {
    moveToNextSuperset();
  }

  function getPreviousPosition(): RunnerState | null {
    const ss = session.supersets[state.supersetIdx];
    const hasB = ss?.exercise_b !== null;

    // Currently on exercise B → go back to A (same set)
    if (state.exercise === 'b') {
      return { ...state, exercise: 'a', resting: false, restStartedAt: null, restDuration: null };
    }

    // Exercise A, set > 1 → go to last exercise of previous set
    if (state.set > 1) {
      return {
        ...state,
        exercise: hasB ? 'b' : 'a',
        set: state.set - 1,
        resting: false,
        restStartedAt: null,
        restDuration: null,
      };
    }

    // Set 1, exercise A → go to last set of previous superset
    if (state.supersetIdx > 0) {
      const prevIdx = state.supersetIdx - 1;
      const prevSS = session.supersets[prevIdx];
      const prevHasB = prevSS.exercise_b !== null;
      return {
        supersetIdx: prevIdx,
        exercise: prevHasB ? 'b' : 'a',
        set: prevSS.sets,
        resting: false,
        restStartedAt: null,
        restDuration: null,
        complete: false,
        warmingUp: false,
      };
    }

    return null;
  }

  function handleGoBack() {
    // Save the current position to return to (only on first back press)
    if (!editingFrom) {
      setEditingFrom({ ...state });
    }

    const prev = getPreviousPosition();
    if (prev) {
      setState(prev);
    }
  }

  function handleCancelEdit() {
    if (editingFrom) {
      setState(editingFrom);
      setEditingFrom(null);
    }
  }

  function handleFinish() {
    saveSetLogs(setLogsRef.current);
    clearPersistedSession();
    releaseWakeLock();
    const elapsed = Math.round((Date.now() - startedAtRef.current) / 60000);
    onComplete(elapsed);
  }

  function handleExit() {
    releaseWakeLock();
    onExit();
  }

  if (!initialized) return null;

  // Complete screen
  if (state.complete) {
    const elapsed = Math.round((Date.now() - startedAtRef.current) / 60000);
    const totalSets = setLogsRef.current.length;
    const setsWithWeight = setLogsRef.current.filter((l) => l.weight_kg !== null).length;

    return (
      <div className="fixed inset-0 z-50 bg-bg-primary flex flex-col items-center justify-center px-6 text-center">
        <Trophy size={64} className="text-accent-green mb-4" />
        <h1 className="text-3xl font-bold mb-2">Seance terminee !</h1>
        <p className="text-text-secondary mb-1">{session.title}</p>
        <p className="text-text-secondary mb-2">
          {session.supersets.length} supersets en {elapsed} min
        </p>
        {totalSets > 0 && (
          <p className="text-xs text-text-secondary mb-8">
            {totalSets} series {setsWithWeight > 0 ? `(${setsWithWeight} avec charge)` : ''}
          </p>
        )}
        <button type="button" onClick={handleFinish}
          className="w-full max-w-xs py-4 rounded-2xl bg-accent-green text-bg-primary font-bold text-lg active:scale-95 transition-transform">
          Terminer et enregistrer
        </button>
      </div>
    );
  }

  // Rest screen — use restored remaining time if available
  if (state.resting) {
    const duration = restoredRestRemaining ?? superset.rest_seconds;
    return (
      <div className="relative">
        <RestTimer
          duration={duration}
          onComplete={handleRestComplete}
          onSkip={handleRestComplete}
          label={`${superset.id.toUpperCase()} — ${superset.label}`}
        />
        {setLogsRef.current.length > 0 && (
          <button type="button" onClick={handleGoBack}
            className="fixed top-4 left-4 z-[60] w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform"
            title="Corriger une serie">
            <ChevronLeft size={18} />
          </button>
        )}
      </div>
    );
  }

  // Warm-up screen
  if (state.warmingUp && superset) {
    const pillarExercise = superset.exercise_a;
    const prevWeight = getLastWeightForExercise(pillarExercise.name);
    return (
      <div className="fixed inset-0 z-50 bg-bg-primary flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <button type="button" onClick={handleExit}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <X size={20} />
          </button>
          <p className="text-xs text-text-secondary font-medium">{session.title}</p>
          <div className="w-10" />
        </div>
        <div className="flex-1 flex flex-col justify-center px-4">
          <WarmUpSets
            exerciseName={pillarExercise.name}
            workingWeight={prevWeight?.weight ?? null}
            onDone={() => setState((s) => ({ ...s, warmingUp: false }))}
          />
        </div>
        <div className="px-4 pb-8">
          <button type="button" onClick={() => setState((s) => ({ ...s, warmingUp: false }))}
            className="w-full text-center text-xs text-text-secondary py-2">
            Passer l'echauffement
          </button>
        </div>
      </div>
    );
  }

  // Exercise screen
  const totalSupersets = session.supersets.length;
  const progressPct = ((state.supersetIdx) / totalSupersets) * 100;
  const canGoBack = state.supersetIdx > 0 || state.set > 1 || state.exercise === 'b';
  const isEditing = editingFrom !== null;

  // When editing, pre-fill with logged values; otherwise use history
  const prefillWeight = existingLog?.weight_kg ?? lastPerf?.weight ?? null;
  const prefillReps = existingLog?.reps_done ?? lastPerf?.reps ?? null;

  return (
    <div className="fixed inset-0 z-50 bg-bg-primary flex flex-col">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleExit}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <X size={20} />
          </button>
          {canGoBack && (
            <button type="button" onClick={handleGoBack}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform"
              title="Serie precedente">
              <ChevronLeft size={18} />
            </button>
          )}
        </div>
        <p className="text-xs text-text-secondary font-medium">{session.title}</p>
        {isEditing ? (
          <button type="button" onClick={handleCancelEdit}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform"
            title="Revenir a la position courante">
            <CornerDownLeft size={18} />
          </button>
        ) : (
          <button type="button" onClick={handleSkipSuperset}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform"
            title="Passer ce superset">
            <SkipForward size={18} />
          </button>
        )}
      </div>

      {isEditing && (
        <div className="mx-4 mb-1 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
          <p className="text-xs text-amber-400 font-medium">Correction — confirme pour revenir</p>
        </div>
      )}

      <div className="px-4 mb-2">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-accent-green rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }} />
        </div>
        <p className="text-[10px] text-text-secondary mt-1 text-center">
          Superset {state.supersetIdx + 1}/{totalSupersets}
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center px-4 space-y-3 overflow-y-auto">
        <ExerciseCard superset={superset} currentExercise={state.exercise} currentSet={state.set} />
        <WeightRepsInput
          key={`${superset.id}-${state.exercise}-${state.set}`}
          exerciseName={currentExercise?.name ?? ''}
          targetReps={currentExercise?.reps ?? ''}
          lastWeight={prefillWeight}
          lastReps={prefillReps}
          onConfirm={handleSetDone}
        />
      </div>

      <div className="h-6" />
    </div>
  );
}
