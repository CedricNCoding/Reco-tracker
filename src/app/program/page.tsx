
import { useState, useEffect } from 'react';
import { Dumbbell, Plus, Trash2, ChevronDown, ChevronUp, GripVertical, Save, RotateCcw, Copy } from 'lucide-react';
import { SessionConfig, Superset, Exercise, SessionType, DayOfWeek, ProgramUpdate } from '@/lib/types';
import { SESSIONS, SESSION_TYPE_LABELS } from '@/constants/program';
import { saveLocalProgram, getLocalCustomProgram, syncToServer } from '@/lib/sync';
import { format } from 'date-fns';

const ALL_SESSION_TYPES: SessionType[] = ['haut_a', 'bas', 'haut_b', 'epaules', 'haut_d'];
const ALL_DAYS: DayOfWeek[] = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const REST_OPTIONS = [60, 90, 120, 150, 180];

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function makeEmptyExercise(): Exercise {
  return { name: '', reps: '12' };
}

function makeEmptySuperset(index: number): Superset {
  return {
    id: `ss${index}`,
    label: 'Volume',
    exercise_a: makeEmptyExercise(),
    exercise_b: null,
    sets: 3,
    rest_seconds: 90,
  };
}

function makeEmptySession(): SessionConfig {
  // Find an unused session type
  return {
    day: 'lundi',
    session_type: 'haut_a',
    title: 'Nouvelle seance',
    supersets: [makeEmptySuperset(1)],
  };
}

export default function ProgramEditorPage() {
  const [sessions, setSessions] = useState<SessionConfig[]>([]);
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const [expandedSuperset, setExpandedSuperset] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const custom = getLocalCustomProgram();
    if (custom?.sessions?.length) {
      setSessions(deepClone(custom.sessions));
    } else {
      setSessions(deepClone(SESSIONS));
    }
  }, []);

  function updateSession(idx: number, update: Partial<SessionConfig>) {
    setSessions((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...update };
      return next;
    });
    setHasChanges(true);
    setSaved(false);
  }

  function updateSuperset(sessionIdx: number, ssIdx: number, update: Partial<Superset>) {
    setSessions((prev) => {
      const next = deepClone(prev);
      next[sessionIdx].supersets[ssIdx] = { ...next[sessionIdx].supersets[ssIdx], ...update };
      return next;
    });
    setHasChanges(true);
    setSaved(false);
  }

  function addSuperset(sessionIdx: number) {
    setSessions((prev) => {
      const next = deepClone(prev);
      const newIdx = next[sessionIdx].supersets.length + 1;
      next[sessionIdx].supersets.push(makeEmptySuperset(newIdx));
      return next;
    });
    setHasChanges(true);
    setSaved(false);
  }

  function removeSuperset(sessionIdx: number, ssIdx: number) {
    setSessions((prev) => {
      const next = deepClone(prev);
      next[sessionIdx].supersets.splice(ssIdx, 1);
      // Re-index superset IDs
      next[sessionIdx].supersets.forEach((ss, i) => { ss.id = `ss${i + 1}`; });
      return next;
    });
    setHasChanges(true);
    setSaved(false);
  }

  function moveSuperset(sessionIdx: number, ssIdx: number, direction: -1 | 1) {
    const targetIdx = ssIdx + direction;
    setSessions((prev) => {
      const next = deepClone(prev);
      const supersets = next[sessionIdx].supersets;
      if (targetIdx < 0 || targetIdx >= supersets.length) return prev;
      [supersets[ssIdx], supersets[targetIdx]] = [supersets[targetIdx], supersets[ssIdx]];
      supersets.forEach((ss, i) => { ss.id = `ss${i + 1}`; });
      return next;
    });
    setHasChanges(true);
    setSaved(false);
  }

  function addSession() {
    setSessions((prev) => [...prev, makeEmptySession()]);
    setExpandedSession(sessions.length);
    setHasChanges(true);
    setSaved(false);
  }

  function duplicateSession(idx: number) {
    setSessions((prev) => {
      const copy = deepClone(prev[idx]);
      copy.title = copy.title + ' (copie)';
      return [...prev, copy];
    });
    setExpandedSession(sessions.length);
    setHasChanges(true);
    setSaved(false);
  }

  function removeSession(idx: number) {
    if (!confirm('Supprimer cette seance ?')) return;
    setSessions((prev) => prev.filter((_, i) => i !== idx));
    setExpandedSession(null);
    setHasChanges(true);
    setSaved(false);
  }

  function handleSave() {
    const program: ProgramUpdate = {
      version: format(new Date(), 'yyyy-MM-dd'),
      source: 'editeur-app',
      notes: 'Modifie depuis l\'editeur de programme',
      sessions,
    };
    saveLocalProgram(program);
    syncToServer();
    setHasChanges(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    if (!confirm('Remettre le programme par defaut ? Les modifications seront perdues.')) return;
    setSessions(deepClone(SESSIONS));
    saveLocalProgram(null);
    syncToServer();
    setHasChanges(false);
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-24 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Dumbbell size={22} className="text-accent-green" />
          Programme
        </h1>
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleReset}
            className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center active:scale-90 transition-transform"
            title="Remettre par defaut">
            <RotateCcw size={16} className="text-text-secondary" />
          </button>
          <button type="button" onClick={handleSave} disabled={!hasChanges}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm active:scale-95 transition-all ${
              hasChanges
                ? 'bg-accent-green text-bg-primary'
                : saved
                  ? 'bg-accent-green/20 text-accent-green'
                  : 'bg-white/5 text-text-secondary'
            }`}>
            <Save size={14} />
            {saved ? 'Sauve !' : 'Sauver'}
          </button>
        </div>
      </div>

      {/* Sessions list */}
      {sessions.map((session, sIdx) => (
        <div key={`${session.session_type}-${sIdx}`} className="bg-bg-card rounded-2xl overflow-hidden">
          {/* Session header */}
          <button
            type="button"
            onClick={() => setExpandedSession(expandedSession === sIdx ? null : sIdx)}
            className="w-full flex items-center justify-between px-4 py-3.5 active:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-lg bg-accent-green/15 flex items-center justify-center text-xs font-bold text-accent-green">
                {sIdx + 1}
              </div>
              <div>
                <p className="text-sm font-bold">{session.title}</p>
                <p className="text-[10px] text-text-secondary">
                  {session.supersets.length} supersets — {session.day}
                </p>
              </div>
            </div>
            {expandedSession === sIdx ? <ChevronUp size={18} className="text-text-secondary" /> : <ChevronDown size={18} className="text-text-secondary" />}
          </button>

          {/* Session detail */}
          {expandedSession === sIdx && (
            <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
              {/* Session meta */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-text-secondary uppercase tracking-wide">Titre</label>
                  <input
                    type="text"
                    value={session.title}
                    onChange={(e) => updateSession(sIdx, { title: e.target.value })}
                    className="w-full mt-1 bg-white/5 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-accent-green/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-text-secondary uppercase tracking-wide">Jour</label>
                  <select
                    value={session.day}
                    onChange={(e) => updateSession(sIdx, { day: e.target.value as DayOfWeek })}
                    className="w-full mt-1 bg-white/5 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-accent-green/50 appearance-none"
                  >
                    {ALL_DAYS.map((d) => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-text-secondary uppercase tracking-wide">Type</label>
                  <select
                    value={session.session_type}
                    onChange={(e) => updateSession(sIdx, { session_type: e.target.value as SessionType })}
                    className="w-full mt-1 bg-white/5 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-accent-green/50 appearance-none"
                  >
                    {ALL_SESSION_TYPES.map((t) => <option key={t} value={t}>{SESSION_TYPE_LABELS[t]}</option>)}
                  </select>
                </div>
              </div>

              {/* Supersets */}
              {session.supersets.map((ss, ssIdx) => {
                const ssKey = `${sIdx}-${ssIdx}`;
                const isExpanded = expandedSuperset === ssKey;

                return (
                  <div key={ss.id} className={`rounded-xl border transition-colors ${isExpanded ? 'border-accent-green/30 bg-white/[0.02]' : 'border-white/5 bg-white/[0.02]'}`}>
                    {/* Superset header */}
                    <button
                      type="button"
                      onClick={() => setExpandedSuperset(isExpanded ? null : ssKey)}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical size={14} className="text-text-secondary/40" />
                        <span className="text-[10px] text-text-secondary font-bold uppercase">{ss.id}</span>
                        <span className="text-xs font-medium">{ss.label}</span>
                        <span className="text-[10px] text-text-secondary">
                          — {ss.exercise_a.name || '?'}{ss.exercise_b ? ` + ${ss.exercise_b.name || '?'}` : ''}
                        </span>
                      </div>
                      <span className="text-[10px] text-text-secondary">{ss.sets}×{ss.rest_seconds}s</span>
                    </button>

                    {/* Superset detail */}
                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-2.5 border-t border-white/5 pt-2.5">
                        {/* Label + sets + rest */}
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-text-secondary uppercase">Label</label>
                            <input
                              type="text"
                              value={ss.label}
                              onChange={(e) => updateSuperset(sIdx, ssIdx, { label: e.target.value })}
                              className="w-full mt-0.5 bg-white/5 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-accent-green/50"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-text-secondary uppercase">Series</label>
                            <input
                              type="number"
                              inputMode="numeric"
                              min={1}
                              max={10}
                              value={ss.sets}
                              onChange={(e) => updateSuperset(sIdx, ssIdx, { sets: parseInt(e.target.value) || 1 })}
                              className="w-full mt-0.5 bg-white/5 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-accent-green/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-text-secondary uppercase">Repos</label>
                            <select
                              value={ss.rest_seconds}
                              onChange={(e) => updateSuperset(sIdx, ssIdx, { rest_seconds: parseInt(e.target.value) })}
                              className="w-full mt-0.5 bg-white/5 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-accent-green/50 appearance-none"
                            >
                              {REST_OPTIONS.map((r) => <option key={r} value={r}>{r}s</option>)}
                            </select>
                          </div>
                        </div>

                        {/* Exercise A */}
                        <div>
                          <label className="text-[10px] text-text-secondary uppercase">Exercice A</label>
                          <div className="flex gap-2 mt-0.5">
                            <input
                              type="text"
                              value={ss.exercise_a.name}
                              onChange={(e) => updateSuperset(sIdx, ssIdx, { exercise_a: { ...ss.exercise_a, name: e.target.value } })}
                              placeholder="Nom de l'exercice"
                              className="flex-1 bg-white/5 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-accent-green/50"
                            />
                            <input
                              type="text"
                              value={ss.exercise_a.reps}
                              onChange={(e) => updateSuperset(sIdx, ssIdx, { exercise_a: { ...ss.exercise_a, reps: e.target.value } })}
                              placeholder="Reps"
                              className="w-16 bg-white/5 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-accent-green/50 text-center"
                            />
                          </div>
                        </div>

                        {/* Exercise B */}
                        <div>
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] text-text-secondary uppercase">Exercice B</label>
                            {ss.exercise_b ? (
                              <button type="button" onClick={() => updateSuperset(sIdx, ssIdx, { exercise_b: null })}
                                className="text-[10px] text-accent-red">
                                Retirer B
                              </button>
                            ) : (
                              <button type="button" onClick={() => updateSuperset(sIdx, ssIdx, { exercise_b: makeEmptyExercise() })}
                                className="text-[10px] text-accent-green">
                                + Ajouter B
                              </button>
                            )}
                          </div>
                          {ss.exercise_b && (
                            <div className="flex gap-2 mt-0.5">
                              <input
                                type="text"
                                value={ss.exercise_b.name}
                                onChange={(e) => updateSuperset(sIdx, ssIdx, { exercise_b: { ...ss.exercise_b!, name: e.target.value } })}
                                placeholder="Nom de l'exercice"
                                className="flex-1 bg-white/5 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-accent-green/50"
                              />
                              <input
                                type="text"
                                value={ss.exercise_b.reps}
                                onChange={(e) => updateSuperset(sIdx, ssIdx, { exercise_b: { ...ss.exercise_b!, reps: e.target.value } })}
                                placeholder="Reps"
                                className="w-16 bg-white/5 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-accent-green/50 text-center"
                              />
                            </div>
                          )}
                        </div>

                        {/* Superset actions */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex gap-1">
                            <button type="button" onClick={() => moveSuperset(sIdx, ssIdx, -1)} disabled={ssIdx === 0}
                              className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-text-secondary disabled:opacity-20 active:scale-90 transition-transform">
                              <ChevronUp size={14} />
                            </button>
                            <button type="button" onClick={() => moveSuperset(sIdx, ssIdx, 1)} disabled={ssIdx === session.supersets.length - 1}
                              className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-text-secondary disabled:opacity-20 active:scale-90 transition-transform">
                              <ChevronDown size={14} />
                            </button>
                          </div>
                          <button type="button" onClick={() => removeSuperset(sIdx, ssIdx)}
                            className="flex items-center gap-1 text-[10px] text-accent-red active:scale-95 transition-transform">
                            <Trash2 size={12} /> Supprimer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add superset */}
              <button type="button" onClick={() => addSuperset(sIdx)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-white/10 text-xs text-text-secondary active:bg-white/5 transition-colors">
                <Plus size={14} /> Ajouter un superset
              </button>

              {/* Session actions */}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => duplicateSession(sIdx)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 text-xs text-text-secondary active:scale-95 transition-transform">
                  <Copy size={12} /> Dupliquer
                </button>
                <button type="button" onClick={() => removeSession(sIdx)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-accent-red/10 text-xs text-accent-red active:scale-95 transition-transform">
                  <Trash2 size={12} /> Supprimer
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add session */}
      <button type="button" onClick={addSession}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-dashed border-white/10 text-sm text-text-secondary font-medium active:bg-white/5 transition-colors">
        <Plus size={18} /> Nouvelle seance
      </button>
    </div>
  );
}
