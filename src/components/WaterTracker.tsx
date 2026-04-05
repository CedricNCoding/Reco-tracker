'use client';

import { Droplets } from 'lucide-react';

interface WaterTrackerProps {
  value: number; // 0-6
  onChange: (v: number) => void;
}

const GLASSES = [1, 2, 3, 4, 5, 6];

export default function WaterTracker({ value, onChange }: WaterTrackerProps) {
  const liters = (value * 0.5).toFixed(1);

  return (
    <div className="bg-bg-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Droplets size={16} className="text-blue-400" />
          <span className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Eau
          </span>
        </div>
        <span className={`text-sm font-bold ${value >= 5 ? 'text-accent-green' : value >= 3 ? 'text-blue-400' : 'text-text-secondary'}`}>
          {liters} L
        </span>
      </div>
      <div className="flex gap-2">
        {GLASSES.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => onChange(value === g ? g - 1 : g)}
            className={`flex-1 py-2.5 rounded-xl text-center transition-all active:scale-95 ${
              g <= value
                ? 'bg-blue-400/20 text-blue-400'
                : 'bg-white/5 text-text-secondary'
            }`}
          >
            <Droplets size={16} className="mx-auto" strokeWidth={g <= value ? 2.5 : 1.5} />
            <span className="text-[10px] block mt-0.5">{g * 500 >= 1000 ? `${(g * 0.5).toFixed(1)}L` : `${g * 500}ml`}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
