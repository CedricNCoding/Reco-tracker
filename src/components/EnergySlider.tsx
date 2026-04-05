
import { Zap } from 'lucide-react';

interface EnergySliderProps {
  value: number | null;
  onChange: (v: number | null) => void;
}

const LEVELS = [
  { n: 1, emoji: '😴', label: 'Epuise' },
  { n: 2, emoji: '😐', label: 'Fatigue' },
  { n: 3, emoji: '🙂', label: 'Normal' },
  { n: 4, emoji: '💪', label: 'Bien' },
  { n: 5, emoji: '🔥', label: 'Top' },
];

export default function EnergySlider({ value, onChange }: EnergySliderProps) {
  return (
    <div className="bg-bg-card rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap size={16} className="text-accent-amber" />
        <span className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
          Energie / Humeur
        </span>
      </div>
      <div className="flex gap-2">
        {LEVELS.map((level) => (
          <button
            key={level.n}
            type="button"
            onClick={() => onChange(value === level.n ? null : level.n)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all active:scale-95 ${
              value === level.n
                ? 'bg-accent-green/20 ring-2 ring-accent-green/50'
                : 'bg-white/5'
            }`}
          >
            <span className="text-xl">{level.emoji}</span>
            <span className="text-[10px] font-medium text-text-secondary">{level.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
