
import { SessionType } from '@/lib/types';
import { SESSION_TYPE_LABELS } from '@/constants/program';
import { Check, X, Dumbbell, HeartPulse } from 'lucide-react';

interface SessionPickerProps {
  done: boolean;
  type: SessionType | null;
  cardioType: 'run' | 'natation' | null;
  suggestedType: SessionType | null;
  onToggleDone: () => void;
  onChangeType: (t: SessionType) => void;
  onToggleCardio: (t: 'run' | 'natation') => void;
}

const MUSCU_TYPES: SessionType[] = ['haut_a', 'bas', 'haut_b', 'epaules', 'haut_d'];
const CARDIO_TYPES: ('run' | 'natation')[] = ['natation', 'run'];

export default function SessionPicker({
  done, type, cardioType, suggestedType,
  onToggleDone, onChangeType, onToggleCardio,
}: SessionPickerProps) {
  const hasMuscu = done && type && MUSCU_TYPES.includes(type);
  const hasCardio = cardioType !== null;
  const hasAnything = done || hasCardio;

  return (
    <div className="bg-bg-card rounded-2xl p-4 space-y-3">
      {/* Muscu section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Dumbbell size={14} className="text-accent-green" />
            <span className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
              Musculation
            </span>
          </div>
          <button
            type="button"
            onClick={onToggleDone}
            className={`w-14 h-8 rounded-full flex items-center transition-colors ${
              done ? 'bg-accent-green justify-end' : 'bg-white/10 justify-start'
            }`}
          >
            <div className={`w-7 h-7 rounded-full mx-0.5 flex items-center justify-center transition-colors ${
              done ? 'bg-white' : 'bg-white/20'
            }`}>
              {done ? <Check size={14} className="text-accent-green" /> : <X size={14} className="text-text-secondary" />}
            </div>
          </button>
        </div>
        {done && (
          <div className="flex flex-wrap gap-1.5">
            {MUSCU_TYPES.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onChangeType(st)}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition-all active:scale-95 ${
                  type === st
                    ? 'bg-accent-green/20 text-accent-green ring-2 ring-accent-green/50'
                    : st === suggestedType
                    ? 'bg-white/10 text-text-primary ring-1 ring-white/20'
                    : 'bg-white/5 text-text-secondary'
                }`}
              >
                {SESSION_TYPE_LABELS[st]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cardio section */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <HeartPulse size={14} className="text-accent-amber" />
          <span className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Cardio
          </span>
        </div>
        <div className="flex gap-1.5">
          {CARDIO_TYPES.map((ct) => (
            <button
              key={ct}
              type="button"
              onClick={() => onToggleCardio(ct)}
              className={`py-2 px-3 rounded-xl text-xs font-medium transition-all active:scale-95 ${
                cardioType === ct
                  ? 'bg-accent-amber/20 text-accent-amber ring-2 ring-accent-amber/50'
                  : 'bg-white/5 text-text-secondary'
              }`}
            >
              {ct === 'natation' ? '🏊 Natation' : '🏃 Run'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
