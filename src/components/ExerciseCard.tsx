
import { Superset } from '@/lib/types';
import { EXERCISE_TIPS } from '@/constants/coachTips';
import { Info, Shield, TrendingUp } from 'lucide-react';

interface ExerciseCardProps {
  superset: Superset;
  currentExercise: 'a' | 'b';
  currentSet: number;
}

const tipIcons = {
  progression: TrendingUp,
  technique: Info,
  safety: Shield,
};

const tipColors = {
  progression: 'text-accent-green bg-accent-green/10',
  technique: 'text-accent-amber bg-accent-amber/10',
  safety: 'text-accent-red bg-accent-red/10',
};

export default function ExerciseCard({ superset, currentExercise, currentSet }: ExerciseCardProps) {
  const exercise = currentExercise === 'a' ? superset.exercise_a : superset.exercise_b;
  if (!exercise) return null;

  const tips = EXERCISE_TIPS[exercise.name] || [];
  // Show only 1 tip at a time, rotate by set number
  const activeTip = tips.length > 0 ? tips[(currentSet - 1) % tips.length] : null;

  return (
    <div className="bg-bg-card rounded-2xl p-5 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-accent-green bg-accent-green/15 px-2.5 py-1 rounded-full">
          {superset.id.toUpperCase()} — {superset.label}
        </span>
        <span className="text-xs font-bold text-text-secondary bg-white/10 px-2.5 py-1 rounded-full">
          Ex {currentExercise.toUpperCase()}
        </span>
      </div>

      <h2 className="text-2xl font-bold mt-3 mb-1">{exercise.name}</h2>
      <p className="text-lg text-accent-amber font-semibold mb-3">{exercise.reps} reps</p>

      <div className="flex items-center justify-center gap-3 text-sm text-text-secondary mb-3">
        <span>Serie {currentSet}/{superset.sets}</span>
        <span className="w-1 h-1 rounded-full bg-text-secondary" />
        <span>Repos : {superset.rest_seconds}s</span>
      </div>

      {/* Coach tip */}
      {activeTip && (
        <div className={`flex items-start gap-2 text-xs text-left px-3 py-2.5 rounded-xl ${tipColors[activeTip.type]}`}>
          {(() => {
            const Icon = tipIcons[activeTip.type];
            return <Icon size={14} className="shrink-0 mt-0.5" />;
          })()}
          <span>{activeTip.text}</span>
        </div>
      )}
    </div>
  );
}
