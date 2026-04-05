'use client';

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
import { X, Trophy, SkipForward } from 'lucide-react';

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
  const startedAtRef = useRef<number>(Date.now());
  const setLogsRef = useRef<SetLog[]>([]);

  const superset = session.supersets[state.supersetIdx];
  const currentExercise = state.exercise === 'a' ? superset?.exercise_a : superset?.exercise_b;
  const todayId = getTodayId();
  const lastPerf = currentExercise ? getLastWeightForExercise(currentExercise.name) : null;

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
      const log: SetLog = {
        id: makeSetLogId(todayId, session.session_type, superset.id, state.exercise, state.set),
        date: todayId,
        session_type: session.session_type,
        superset_id: superset.id,
        exercise: state.exercise,
        exercise_name: currentExercise.name,
        set_number: state.set,
        weight_kg: weight,
        reps_done: reps,
      };
      setLogsRef.current = [...setLogsRef.current, log];
    }

    const ss = superset;
    const hasB = ss.exercise_b !== null;

    if (state.exercise === 'a' && hasB) {
      setState((s) => ({ ...s, exercise: 'b' }));
      return;
    }

    if (state.set < ss.sets) {
      // Start rest — record when it began
      setState((s) => ({
        ...s,
        resting: true,
        restStartedAt: Date.now(),
        restDuration: ss.rest_seconds,
      }));
      return;
    }

    moveToNextSuperset();
  }, [superset, currentExercise, state, todayId, session.session_type]);

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
      <RestTimer
        duration={duration}
        onComplete={handleRestComplete}
        onSkip={handleRestComplete}
        label={`${superset.id.toUpperCase()} — ${superset.label}`}
      />
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

  return (
    <div className="fixed inset-0 z-50 bg-bg-primary flex flex-col">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button type="button" onClick={handleExit}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform">
          <X size={20} />
        </button>
        <p className="text-xs text-text-secondary font-medium">{session.title}</p>
        <button type="button" onClick={handleSkipSuperset}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform"
          title="Passer ce superset">
          <SkipForward size={18} />
        </button>
      </div>

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
          exerciseName={currentExercise?.name ?? ''}
          targetReps={currentExercise?.reps ?? ''}
          lastWeight={lastPerf?.weight ?? null}
          lastReps={lastPerf?.reps ?? null}
          onConfirm={handleSetDone}
        />
      </div>

      <div className="h-6" />
    </div>
  );
}
