
import { Thermometer, ChevronRight } from 'lucide-react';

interface WarmUpSetsProps {
  exerciseName: string;
  workingWeight: number | null;
  onDone: () => void;
}

export default function WarmUpSets({ exerciseName, workingWeight, onDone }: WarmUpSetsProps) {
  const sets = workingWeight && workingWeight > 20
    ? [
        { label: 'Barre vide', weight: 20, reps: '10-12' },
        { label: '~50%', weight: Math.round(workingWeight * 0.5 / 2.5) * 2.5, reps: '6-8' },
        { label: '~75%', weight: Math.round(workingWeight * 0.75 / 2.5) * 2.5, reps: '3-4' },
      ]
    : [
        { label: 'Leger', weight: null, reps: '10-12' },
        { label: 'Moyen', weight: null, reps: '6-8' },
      ];

  return (
    <div className="bg-bg-card rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Thermometer size={16} className="text-accent-amber" />
        <h3 className="text-sm font-semibold text-accent-amber">
          Echauffement — {exerciseName}
        </h3>
      </div>
      <p className="text-xs text-text-secondary mb-3">
        Series de montee progressives avant le pilier.
        {workingWeight && ` Charge de travail : ${workingWeight} kg`}
      </p>
      <div className="space-y-1.5 mb-4">
        {sets.map((set, i) => (
          <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-accent-amber/20 text-accent-amber text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <span className="text-sm font-medium">{set.label}</span>
            </div>
            <div className="text-right">
              {set.weight !== null && <span className="text-sm font-bold">{set.weight} kg</span>}
              <span className="text-xs text-text-secondary ml-2">{set.reps} reps</span>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onDone}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-amber/20 text-accent-amber font-bold text-sm active:scale-95 transition-transform"
      >
        Echauffement fait
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
