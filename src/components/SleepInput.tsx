'use client';

import { Moon } from 'lucide-react';

interface SleepInputProps {
  value: number | null;
  onChange: (v: number | null) => void;
}

const PRESETS = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

export default function SleepInput({ value, onChange }: SleepInputProps) {
  return (
    <div className="bg-bg-card rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Moon size={16} className="text-accent-amber" />
        <span className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
          Sommeil
        </span>
        {value !== null && (
          <span className={`ml-auto text-sm font-bold ${value >= 7.5 ? 'text-accent-green' : value >= 6.5 ? 'text-accent-amber' : 'text-accent-red'}`}>
            {value}h
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => onChange(value === h ? null : h)}
            className={`py-2 px-3 rounded-xl text-sm font-medium transition-all active:scale-95 ${
              value === h
                ? 'bg-accent-green/20 text-accent-green ring-2 ring-accent-green/50'
                : 'bg-white/5 text-text-secondary'
            }`}
          >
            {h}h
          </button>
        ))}
      </div>
    </div>
  );
}
