
import { useState, useEffect, useMemo } from 'react';
import { Dumbbell, RotateCcw, TrendingUp, ChevronDown } from 'lucide-react';
import { getRecentWeightsForExercise } from '@/lib/setLogStorage';

interface WeightRepsInputProps {
  exerciseName: string;
  targetReps: string; // e.g. "4-6", "12-15", "20", "60 s"
  lastWeight: number | null;
  lastReps: number | null;
  onConfirm: (weight: number | null, reps: number | null) => void;
}

/** Extract the low end of a rep range: "4-6" → 4, "12-15" → 12, "20" → 20, "60 s" → null */
function parseMinReps(target: string): number | null {
  const match = target.match(/^(\d+)/);
  if (!match) return null;
  // Ignore time-based targets like "60 s", "40 m"
  if (/\d+\s*(s|sec|min|m)\b/i.test(target)) return null;
  return parseInt(match[1], 10);
}

export default function WeightRepsInput({ exerciseName, targetReps, lastWeight, lastReps, onConfirm }: WeightRepsInputProps) {
  const defaultReps = parseMinReps(targetReps);
  const [weight, setWeight] = useState<number | null>(lastWeight);
  const [reps, setReps] = useState<number | null>(defaultReps);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    setWeight(lastWeight);
    setReps(defaultReps);
    setShowPicker(false);
  }, [exerciseName, lastWeight, defaultReps]);

  const suggestions = useMemo(() => {
    const recentWeights = getRecentWeightsForExercise(exerciseName);
    const items = new Set<number>();

    if (lastWeight !== null) {
      items.add(lastWeight - 5);
      items.add(lastWeight - 2.5);
      items.add(lastWeight);
      items.add(lastWeight + 1.25);
      items.add(lastWeight + 2.5);
      items.add(lastWeight + 5);
    }

    for (const w of recentWeights) {
      items.add(w);
    }

    return Array.from(items)
      .filter((w) => w > 0)
      .sort((a, b) => a - b);
  }, [exerciseName, lastWeight]);

  const hasHistory = lastWeight !== null;

  function handleTapRep() {
    setReps((prev) => (prev ?? 0) + 1);
  }

  return (
    <div className="bg-bg-card rounded-2xl p-4 space-y-4">
      {/* Previous reference */}
      {hasHistory && (
        <div className="flex items-center justify-center gap-2 text-xs text-text-secondary">
          <RotateCcw size={12} />
          <span>
            Precedent : <span className="text-text-primary font-semibold">{lastWeight} kg</span>
            {lastReps !== null && <> × {lastReps} reps</>}
          </span>
          <TrendingUp size={12} className="text-accent-green" />
          <span className="text-accent-green font-semibold">→ {lastWeight + 2.5} kg ?</span>
        </div>
      )}

      {!hasHistory && (
        <div className="text-center text-xs text-text-secondary">
          Premiere fois — choisis ta charge de travail
        </div>
      )}

      {/* Weight selector */}
      <div>
        <p className="text-[10px] text-text-secondary uppercase tracking-wide text-center mb-2">Charge (kg)</p>

        {hasHistory && (
          <div className="flex gap-1.5 mb-2 justify-center flex-wrap">
            {[lastWeight - 2.5, lastWeight, lastWeight + 2.5].filter((w) => w > 0).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => { setWeight(w); setShowPicker(false); }}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                  weight === w
                    ? 'bg-accent-green/20 text-accent-green ring-2 ring-accent-green/50'
                    : 'bg-white/10 text-text-primary'
                } ${w === lastWeight + 2.5 ? 'ring-1 ring-accent-green/30' : ''}`}
              >
                {w} kg
                {w === lastWeight && <span className="text-[9px] block text-text-secondary font-normal">idem</span>}
                {w === lastWeight + 2.5 && <span className="text-[9px] block text-accent-green font-normal">progres</span>}
                {w === lastWeight - 2.5 && <span className="text-[9px] block text-text-secondary font-normal">−2.5</span>}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="w-full flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 active:bg-white/10 transition-colors"
        >
          <span className="text-2xl font-bold">{weight !== null ? `${weight} kg` : '— kg'}</span>
          <ChevronDown size={18} className={`text-text-secondary transition-transform ${showPicker ? 'rotate-180' : ''}`} />
        </button>

        {showPicker && (
          <div className="mt-1.5 bg-white/5 rounded-xl max-h-48 overflow-y-auto hide-scrollbar">
            {suggestions.length > 0 ? (
              suggestions.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => { setWeight(w); setShowPicker(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    weight === w
                      ? 'bg-accent-green/20 text-accent-green font-bold'
                      : 'text-text-primary hover:bg-white/5'
                  }`}
                >
                  <span className="font-semibold">{w} kg</span>
                  {w === lastWeight && <span className="ml-2 text-[10px] text-text-secondary">(dernier)</span>}
                  {lastWeight !== null && w === lastWeight + 2.5 && <span className="ml-2 text-[10px] text-accent-green">(+2.5 progres)</span>}
                </button>
              ))
            ) : (
              [10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => { setWeight(w); setShowPicker(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    weight === w ? 'bg-accent-green/20 text-accent-green font-bold' : 'text-text-primary hover:bg-white/5'
                  }`}
                >
                  {w} kg
                </button>
              ))
            )}
            <div className="px-4 py-2.5 border-t border-white/5">
              <input
                type="number"
                inputMode="decimal"
                step="0.5"
                value={weight ?? ''}
                onChange={(e) => setWeight(e.target.value === '' ? null : parseFloat(e.target.value))}
                placeholder="Autre charge..."
                className="w-full bg-transparent text-sm outline-none text-text-primary placeholder:text-text-secondary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Reps counter */}
      <div>
        <p className="text-[10px] text-text-secondary uppercase tracking-wide text-center mb-2">
          Reps realisees <span className="text-text-secondary/50">(cible : {targetReps})</span>
        </p>
        <div className="flex items-center justify-center gap-3">
          <button type="button" onClick={() => setReps((prev) => Math.max(0, (prev ?? 0) - 1))}
            className="w-10 h-10 rounded-xl bg-white/10 text-lg font-bold active:scale-90 transition-transform">−</button>
          <button type="button" onClick={handleTapRep}
            className="w-20 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl font-bold active:scale-95 transition-transform ring-1 ring-white/10">
            {reps ?? '—'}
          </button>
          <button type="button" onClick={() => setReps((prev) => (prev ?? 0) + 1)}
            className="w-10 h-10 rounded-xl bg-white/10 text-lg font-bold active:scale-90 transition-transform">+</button>
        </div>
        <p className="text-[10px] text-text-secondary text-center mt-1">Tape le chiffre pour compter</p>
      </div>

      {/* Confirm */}
      <button type="button" onClick={() => onConfirm(weight, reps)}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-accent-green text-bg-primary font-bold text-lg active:scale-95 transition-transform">
        <Dumbbell size={20} />
        Serie terminee
      </button>
    </div>
  );
}
