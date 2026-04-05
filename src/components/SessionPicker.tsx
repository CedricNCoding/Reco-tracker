'use client';

import { SessionType } from '@/lib/types';
import { SESSION_TYPE_LABELS } from '@/constants/program';
import { Check, X } from 'lucide-react';

interface SessionPickerProps {
  done: boolean;
  type: SessionType | null;
  suggestedType: SessionType | null;
  onToggleDone: () => void;
  onChangeType: (t: SessionType) => void;
}

const SESSION_TYPES: SessionType[] = ['haut_a', 'bas', 'haut_b', 'epaules', 'haut_d', 'natation', 'run', 'repos'];

export default function SessionPicker({ done, type, suggestedType, onToggleDone, onChangeType }: SessionPickerProps) {
  return (
    <div className="bg-bg-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
          Seance realisee
        </span>
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
        <div className="flex flex-wrap gap-2">
          {SESSION_TYPES.map((st) => (
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
  );
}
