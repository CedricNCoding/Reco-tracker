'use client';

import { PROTEIN_MEALS } from '@/constants/nutrition';
import { Check } from 'lucide-react';

interface ProteinTrackerProps {
  value: [boolean, boolean, boolean, boolean];
  onChange: (v: [boolean, boolean, boolean, boolean]) => void;
}

export default function ProteinTracker({ value, onChange }: ProteinTrackerProps) {
  const count = value.filter(Boolean).length;
  const total = count * 40;

  function toggle(index: number) {
    const next = [...value] as [boolean, boolean, boolean, boolean];
    next[index] = !next[index];
    onChange(next);
  }

  return (
    <div className="bg-bg-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
          Proteines
        </span>
        <span className={`text-sm font-bold ${count === 4 ? 'text-accent-green' : 'text-text-secondary'}`}>
          ~{total} g ({count}/4)
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {PROTEIN_MEALS.map((meal, i) => (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all active:scale-95 ${
              value[i]
                ? 'bg-accent-green/20 ring-2 ring-accent-green/50'
                : 'bg-white/5'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                value[i] ? 'bg-accent-green text-bg-primary' : 'bg-white/10 text-text-secondary'
              }`}
            >
              {value[i] && <Check size={18} strokeWidth={3} />}
            </div>
            <span className="text-[11px] font-medium text-text-secondary">{meal.label}</span>
            <span className="text-[10px] text-text-secondary/60">{meal.target}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
