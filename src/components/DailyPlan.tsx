
import { useState } from 'react';
import { getTodaySchedule } from '@/constants/program';
import { getTodayNutrition } from '@/constants/nutrition';
import { WEEK_SCHEDULE, SESSIONS, SESSION_TYPE_LABELS } from '@/constants/program';
import { Dumbbell, Droplets, Flame, ChevronRight, ChevronDown, ChevronUp, Pencil, Repeat } from 'lucide-react';
import QuickLogModal from './QuickLogModal';
import { Superset, SessionType, SessionConfig } from '@/lib/types';

interface DailyPlanProps {
  onStartSession: () => void;
  onStartCardio: () => void;
  activeSession: SessionConfig | null;
  onChangeSession: (session: SessionConfig) => void;
  isCardioDay: boolean;
}

const MUSCU_TYPES: SessionType[] = ['haut_a', 'bas', 'haut_b', 'epaules', 'haut_d'];

export default function DailyPlan({ onStartSession, onStartCardio, activeSession, onChangeSession, isCardioDay }: DailyPlanProps) {
  const schedule = getTodaySchedule();
  const nutrition = getTodayNutrition();
  const [showExercises, setShowExercises] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [quickLogSS, setQuickLogSS] = useState<Superset | null>(null);

  const hasMuscu = !!activeSession;
  const isSuggested = activeSession?.session_type === schedule.session_type;

  return (
    <div className="space-y-3">
      {/* Session card */}
      <div className="bg-bg-card rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Dumbbell size={18} className="text-accent-green" />
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
              Seance du jour
            </h3>
          </div>
          <span className="text-xs text-text-secondary">{schedule.time}</span>
        </div>

        {/* Active session title + swap button */}
        <div className="flex items-center gap-2 mb-3">
          <p className="text-lg font-bold flex-1">
            {activeSession ? activeSession.title : schedule.label}
          </p>
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="shrink-0 flex items-center gap-1 text-xs text-text-secondary bg-white/10 rounded-lg px-2.5 py-1.5 active:bg-white/15 transition-colors"
          >
            <Repeat size={12} />
            Changer
          </button>
        </div>

        {/* Not-suggested banner */}
        {hasMuscu && !isSuggested && (
          <div className="flex items-center gap-2 text-xs text-accent-amber bg-accent-amber/10 rounded-lg px-3 py-2 mb-3">
            <Repeat size={12} />
            <span>
              Seance modifiee — planning : {SESSION_TYPE_LABELS[schedule.session_type as SessionType] || schedule.label}
            </span>
          </div>
        )}

        {/* Session picker */}
        {showPicker && (
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {MUSCU_TYPES.map((type) => {
              const session = SESSIONS.find((s) => s.session_type === type);
              if (!session) return null;
              const isActive = activeSession?.session_type === type;
              const isSugg = type === schedule.session_type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    onChangeSession(session);
                    setShowPicker(false);
                    setShowExercises(false);
                  }}
                  className={`relative text-left px-3 py-2.5 rounded-xl text-xs transition-all active:scale-95 ${
                    isActive
                      ? 'bg-accent-green/20 ring-2 ring-accent-green/50 text-accent-green'
                      : 'bg-white/5 text-text-secondary hover:bg-white/10'
                  }`}
                >
                  <p className="font-bold text-sm">{SESSION_TYPE_LABELS[type]}</p>
                  <p className="text-[10px] mt-0.5 truncate">{session.title.split('—')[1]?.trim() || session.title}</p>
                  {isSugg && (
                    <span className="absolute top-1.5 right-2 text-[9px] text-accent-amber font-bold">planifie</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Exercise list (collapsible) */}
        {hasMuscu && activeSession && (
          <>
            <button
              type="button"
              onClick={() => setShowExercises(!showExercises)}
              className="w-full flex items-center justify-between text-xs text-text-secondary mb-2 py-1"
            >
              <span>{activeSession.supersets.length} supersets — {showExercises ? 'masquer' : 'voir les exercices'}</span>
              {showExercises ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showExercises && (
              <div className="space-y-1.5 mb-3">
                {activeSession.supersets.map((ss) => (
                  <button
                    key={ss.id}
                    type="button"
                    onClick={() => setQuickLogSS(ss)}
                    className="w-full flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2.5 text-left active:bg-white/10 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-accent-green uppercase">{ss.id}</span>
                        <span className="text-[10px] text-text-secondary">{ss.label}</span>
                        <span className="text-[10px] text-text-secondary">· {ss.sets}×</span>
                      </div>
                      <p className="text-xs font-medium truncate">{ss.exercise_a.name} ({ss.exercise_a.reps})</p>
                      {ss.exercise_b && (
                        <p className="text-xs text-text-secondary truncate">{ss.exercise_b.name} ({ss.exercise_b.reps})</p>
                      )}
                    </div>
                    <Pencil size={12} className="text-text-secondary shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {hasMuscu && (
          <button
            onClick={onStartSession}
            className="w-full flex items-center justify-center gap-2 bg-accent-green text-bg-primary font-bold py-3 px-4 rounded-xl text-base active:scale-95 transition-transform"
          >
            <Dumbbell size={20} />
            Lancer la seance
            <ChevronRight size={18} />
          </button>
        )}

        {!hasMuscu && (
          <div className="space-y-3">
            <p className="text-lg font-bold text-center">{schedule.label}</p>
            {isCardioDay && (
              <button
                onClick={onStartCardio}
                className="w-full flex items-center justify-center gap-2 bg-accent-green text-bg-primary font-bold py-3 px-4 rounded-xl text-base active:scale-95 transition-transform"
              >
                {schedule.session_type === 'run' ? '🏃' : '🏊'}
                Enregistrer la seance
                <ChevronRight size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowPicker(!showPicker)}
              className="w-full text-xs text-accent-green underline text-center"
            >
              Faire une seance muscu quand meme ?
            </button>
          </div>
        )}
      </div>

      {/* Nutrition card */}
      <div className="bg-bg-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Flame size={18} className="text-accent-amber" />
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Nutrition — {nutrition.label}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <MacroBox label="Calories" value={nutrition.calories} />
          <MacroBox label="Proteines" value={nutrition.protein} />
          <MacroBox label="Glucides" value={nutrition.carbs} />
          <MacroBox label="Lipides" value={nutrition.fat} />
        </div>

        {nutrition.tips.length > 0 && (
          <div className="space-y-1">
            {nutrition.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                <Droplets size={12} className="mt-0.5 shrink-0 text-accent-green" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Week overview */}
      <div className="bg-bg-card rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
          Semaine
        </h3>
        <div className="flex gap-1.5">
          {WEEK_SCHEDULE.map((day) => {
            const isToday = day.day === schedule.day;
            const isRest = day.session_type === 'repos';
            return (
              <div
                key={day.day}
                className={`flex-1 text-center py-2 rounded-lg text-xs font-medium ${
                  isToday
                    ? 'bg-accent-green/20 text-accent-green ring-1 ring-accent-green/40'
                    : isRest
                    ? 'bg-white/5 text-text-secondary'
                    : 'bg-white/5 text-text-primary'
                }`}
              >
                <div className="text-[10px] uppercase">{day.day.slice(0, 3)}</div>
                <div className="mt-0.5 truncate px-0.5">{isRest ? '—' : day.session_type === 'run' ? 'Run' : day.label.split('—')[0].trim().split(' ').pop()}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Log Modal */}
      {quickLogSS && activeSession && (
        <QuickLogModal
          superset={quickLogSS}
          sessionType={activeSession.session_type}
          onClose={() => setQuickLogSS(null)}
        />
      )}
    </div>
  );
}

function MacroBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 rounded-lg px-3 py-2">
      <div className="text-[10px] text-text-secondary uppercase">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
