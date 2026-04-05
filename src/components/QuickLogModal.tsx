
import { useState, useEffect } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';
import { Superset, SetLog } from '@/lib/types';
import { getLastWeightForExercise, makeSetLogId, saveSetLog } from '@/lib/setLogStorage';
import { getTodayId } from '@/lib/storage';
import { SessionType } from '@/lib/types';

interface QuickLogModalProps {
  superset: Superset;
  sessionType: SessionType;
  onClose: () => void;
}

interface QuickEntry {
  exercise: 'a' | 'b';
  name: string;
  reps: string;
  weight: number | null;
  repsDone: number | null;
  lastWeight: number | null;
  lastReps: number | null;
}

export default function QuickLogModal({ superset, sessionType, onClose }: QuickLogModalProps) {
  const [entries, setEntries] = useState<QuickEntry[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const items: QuickEntry[] = [];
    const lastA = getLastWeightForExercise(superset.exercise_a.name);
    items.push({
      exercise: 'a',
      name: superset.exercise_a.name,
      reps: superset.exercise_a.reps,
      weight: lastA?.weight ?? null,
      repsDone: null,
      lastWeight: lastA?.weight ?? null,
      lastReps: lastA?.reps ?? null,
    });
    if (superset.exercise_b) {
      const lastB = getLastWeightForExercise(superset.exercise_b.name);
      items.push({
        exercise: 'b',
        name: superset.exercise_b.name,
        reps: superset.exercise_b.reps,
        weight: lastB?.weight ?? null,
        repsDone: null,
        lastWeight: lastB?.weight ?? null,
        lastReps: lastB?.reps ?? null,
      });
    }
    setEntries(items);
  }, [superset]);

  function updateEntry(idx: number, patch: Partial<QuickEntry>) {
    setEntries((prev) => prev.map((e, i) => i === idx ? { ...e, ...patch } : e));
  }

  function handleSave() {
    const todayId = getTodayId();
    for (const entry of entries) {
      if (entry.weight === null && entry.repsDone === null) continue;
      // Save one log per set (quick log = set 1 representative)
      for (let set = 1; set <= superset.sets; set++) {
        const log: SetLog = {
          id: makeSetLogId(todayId, sessionType, superset.id, entry.exercise, set),
          date: todayId,
          session_type: sessionType,
          superset_id: superset.id,
          exercise: entry.exercise,
          exercise_name: entry.name,
          set_number: set,
          weight_kg: entry.weight,
          reps_done: entry.repsDone,
        };
        saveSetLog(log);
      }
    }
    setSaved(true);
    setTimeout(onClose, 800);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-bg-card rounded-t-3xl p-5 pb-8 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-accent-green font-bold uppercase">
              {superset.id.toUpperCase()} — {superset.label}
            </p>
            <p className="text-sm text-text-secondary">{superset.sets} series · {superset.rest_seconds}s repos</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        {/* Entries */}
        {entries.map((entry, idx) => (
          <div key={idx} className="space-y-2">
            <p className="text-sm font-bold">{entry.name}</p>
            <p className="text-xs text-text-secondary">Cible : {entry.reps} reps</p>

            {entry.lastWeight !== null && (
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <RotateCcw size={10} />
                <span>Precedent : {entry.lastWeight} kg {entry.lastReps ? `× ${entry.lastReps}` : ''}</span>
              </div>
            )}

            <div className="flex gap-3">
              {/* Weight */}
              <div className="flex-1">
                <p className="text-[10px] text-text-secondary uppercase mb-1">Charge (kg)</p>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => updateEntry(idx, { weight: Math.max(0, (entry.weight ?? 0) - 2.5) })}
                    className="w-9 h-9 rounded-lg bg-white/10 text-xs font-bold active:scale-90 transition-transform">−</button>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={entry.weight ?? ''}
                    onChange={(e) => updateEntry(idx, { weight: e.target.value === '' ? null : parseFloat(e.target.value) })}
                    className="flex-1 text-center text-lg font-bold bg-white/5 rounded-lg py-2 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    placeholder="—"
                  />
                  <button type="button" onClick={() => updateEntry(idx, { weight: (entry.weight ?? 0) + 2.5 })}
                    className="w-9 h-9 rounded-lg bg-white/10 text-xs font-bold active:scale-90 transition-transform">+</button>
                </div>
              </div>

              {/* Reps */}
              <div className="w-24">
                <p className="text-[10px] text-text-secondary uppercase mb-1">Reps</p>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => updateEntry(idx, { repsDone: Math.max(0, (entry.repsDone ?? 0) - 1) })}
                    className="w-8 h-9 rounded-lg bg-white/10 text-xs font-bold active:scale-90 transition-transform">−</button>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={entry.repsDone ?? ''}
                    onChange={(e) => updateEntry(idx, { repsDone: e.target.value === '' ? null : parseInt(e.target.value) })}
                    className="w-10 text-center text-lg font-bold bg-white/5 rounded-lg py-2 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    placeholder="—"
                  />
                  <button type="button" onClick={() => updateEntry(idx, { repsDone: (entry.repsDone ?? 0) + 1 })}
                    className="w-8 h-9 rounded-lg bg-white/10 text-xs font-bold active:scale-90 transition-transform">+</button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all active:scale-95 ${
            saved ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-green text-bg-primary'
          }`}
        >
          <Save size={18} />
          {saved ? 'Enregistre !' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
