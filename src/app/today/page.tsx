
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Save, CheckCircle, Play } from 'lucide-react';
import DailyPlan from '@/components/DailyPlan';
import WaterTracker from '@/components/WaterTracker';
import WeightInput from '@/components/WeightInput';
import ProteinTracker from '@/components/ProteinTracker';
import SessionPicker from '@/components/SessionPicker';
import SleepInput from '@/components/SleepInput';
import EnergySlider from '@/components/EnergySlider';
import SessionRunner from '@/components/SessionRunner';
import CardioLogForm from '@/components/CardioLogForm';
import NotificationBanner from '@/components/NotificationBanner';
import StreakBanner from '@/components/StreakBanner';
import DeloadAlert from '@/components/DeloadAlert';
import { getTodaySchedule, getTodaySession, getSessionByType } from '@/constants/program';
import { getEntry, saveEntry, createEmptyEntry, getTodayId } from '@/lib/storage';
import { syncToServer } from '@/lib/sync';
import { loadPersistedSession, clearPersistedSession } from '@/lib/sessionPersist';
import { DailyEntry, SessionType, SessionConfig } from '@/lib/types';

export default function TodayPage() {
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [showSession, setShowSession] = useState(false);
  const [saved, setSaved] = useState(false);
  const [waistOpen, setWaistOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<SessionConfig | null>(null);
  const [hasPaused, setHasPaused] = useState(false);
  const [showCardio, setShowCardio] = useState(false);
  const [cardioType, setCardioType] = useState<'run' | 'natation'>('run');

  const todayId = getTodayId();
  const schedule = getTodaySchedule();

  // Init: check for persisted session first, then fall back to today's schedule
  useEffect(() => {
    const persisted = loadPersistedSession();
    if (persisted) {
      // Restore the exact session that was in progress
      const restoredSession = getSessionByType(persisted.sessionType);
      if (restoredSession) {
        setActiveSession(restoredSession);
        setHasPaused(true);
        return;
      }
    }
    // No persisted session — use today's default
    setActiveSession(getTodaySession());
  }, []);

  useEffect(() => {
    const existing = getEntry(todayId);
    setEntry(existing ?? createEmptyEntry(todayId));
  }, [todayId]);

  const update = useCallback((patch: Partial<DailyEntry>) => {
    setEntry((prev) => (prev ? { ...prev, ...patch } : prev));
    setSaved(false);
  }, []);

  function handleSave() {
    if (!entry) return;
    saveEntry(entry);
    setSaved(true);
    syncToServer().catch(() => {});
    setTimeout(() => setSaved(false), 2000);
  }

  function handleSessionComplete(durationMin: number) {
    if (!entry) return;
    const sessionType = activeSession?.session_type ?? (schedule.session_type as SessionType);
    const updated = { ...entry, session_done: true, session_type: sessionType, session_duration_min: durationMin };
    setEntry(updated);
    saveEntry(updated);
    syncToServer().catch(() => {});
    setShowSession(false);
    setHasPaused(false);
  }

  function handleSessionExit() {
    setShowSession(false);
    // Session state stays persisted — show resume banner
    const persisted = loadPersistedSession();
    setHasPaused(!!persisted);
  }

  function handleAbandonSession() {
    clearPersistedSession();
    setHasPaused(false);
  }

  function handleChangeSession(session: SessionConfig) {
    setActiveSession(session);
  }

  function handleCardioSave(distance: number | null, duration: number | null, avgHr: number | null) {
    if (!entry) return;
    const updated = {
      ...entry,
      session_done: true,
      session_type: cardioType as SessionType,
      session_duration_min: duration,
      cardio_distance_m: distance,
      cardio_duration_min: duration,
      cardio_avg_hr: avgHr,
    };
    setEntry(updated);
    saveEntry(updated);
    syncToServer().catch(() => {});
    setShowCardio(false);
  }

  const isCardioDay = schedule.session_type === 'run' || schedule.session_type === 'natation';
  const isMercredi = schedule.day === 'mercredi'; // muscu + natation

  function handleStartSession() {
    // Starting fresh — clear any old persisted state
    if (!hasPaused) {
      clearPersistedSession();
    }
    setShowSession(true);
  }

  function handleResumeSession() {
    setShowSession(true);
  }

  if (!entry) return null;

  if (showSession && activeSession) {
    return (
      <SessionRunner
        session={activeSession}
        onComplete={handleSessionComplete}
        onExit={handleSessionExit}
      />
    );
  }

  if (showCardio) {
    return (
      <CardioLogForm
        sessionType={cardioType}
        distance={entry.cardio_distance_m}
        duration={entry.cardio_duration_min}
        avgHr={entry.cardio_avg_hr}
        onSave={handleCardioSave}
        onCancel={() => setShowCardio(false)}
      />
    );
  }

  const dateLabel = format(new Date(), "EEEE d MMMM", { locale: fr });

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold capitalize">{dateLabel}</h1>
          <p className="text-xs text-text-secondary">Check-in quotidien</p>
        </div>
      </div>

      {/* Resume session banner */}
      {hasPaused && activeSession && (
        <div className="bg-accent-green/15 rounded-2xl p-4 flex items-center gap-3">
          <Play size={20} className="text-accent-green shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-accent-green">Seance en pause</p>
            <p className="text-xs text-text-secondary">{activeSession.title}</p>
          </div>
          <button
            type="button"
            onClick={handleResumeSession}
            className="px-4 py-2 rounded-xl bg-accent-green text-bg-primary font-bold text-xs active:scale-95 transition-transform"
          >
            Reprendre
          </button>
          <button
            type="button"
            onClick={handleAbandonSession}
            className="text-xs text-text-secondary underline"
          >
            Stop
          </button>
        </div>
      )}

      {/* Streaks */}
      <StreakBanner />

      {/* Deload alert */}
      <DeloadAlert />

      {/* Notifications */}
      <NotificationBanner />

      {/* Plan du jour */}
      <DailyPlan
        onStartSession={handleStartSession}
        onStartCardio={() => {
          setCardioType(schedule.session_type === 'natation' ? 'natation' : 'run');
          setShowCardio(true);
        }}
        activeSession={activeSession}
        onChangeSession={handleChangeSession}
        isCardioDay={isCardioDay}
      />

      {/* Cardio quick-add — always available */}
      {!isCardioDay && (
        <div className="flex gap-2">
          <button type="button"
            onClick={() => { setCardioType('run'); setShowCardio(true); }}
            className="flex-1 flex items-center justify-center gap-2 bg-bg-card text-text-secondary font-semibold py-2.5 px-3 rounded-2xl text-sm active:scale-95 transition-transform">
            🏃 Run
          </button>
          <button type="button"
            onClick={() => { setCardioType('natation'); setShowCardio(true); }}
            className="flex-1 flex items-center justify-center gap-2 bg-bg-card text-text-secondary font-semibold py-2.5 px-3 rounded-2xl text-sm active:scale-95 transition-transform">
            🏊 Natation
          </button>
        </div>
      )}

      {/* Check-in form */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide px-1">
          Check-in
        </h2>

        <WeightInput value={entry.weight} onChange={(v) => update({ weight: v })} />

        <ProteinTracker value={entry.protein_meals} onChange={(v) => update({ protein_meals: v })} />

        <SessionPicker
          done={entry.session_done}
          type={entry.session_type}
          suggestedType={(activeSession?.session_type ?? schedule.session_type) as SessionType}
          onToggleDone={() =>
            update({
              session_done: !entry.session_done,
              session_type: !entry.session_done ? (activeSession?.session_type ?? schedule.session_type) as SessionType : null,
            })
          }
          onChangeType={(t) => update({ session_type: t })}
        />

        <WaterTracker value={entry.water_glasses} onChange={(v) => update({ water_glasses: v })} />

        <SleepInput value={entry.sleep_hours} onChange={(v) => update({ sleep_hours: v })} />

        <EnergySlider value={entry.energy} onChange={(v) => update({ energy: v })} />

        {/* Waist */}
        <div className="bg-bg-card rounded-2xl p-4">
          <button type="button" onClick={() => setWaistOpen(!waistOpen)}
            className="w-full flex items-center justify-between text-sm font-semibold text-text-secondary uppercase tracking-wide">
            <span>Tour de taille (optionnel)</span>
            <span className="text-xs">{waistOpen ? '▼' : '▶'}</span>
          </button>
          {waistOpen && (
            <div className="mt-3">
              <input type="number" inputMode="decimal" step="0.5"
                value={entry.waist_cm ?? ''}
                onChange={(e) => update({ waist_cm: e.target.value === '' ? null : parseFloat(e.target.value) })}
                placeholder="Ex: 85.5 cm"
                className="w-full text-center text-xl font-bold bg-white/5 rounded-xl py-3 outline-none focus:ring-2 focus:ring-accent-green/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-bg-card rounded-2xl p-4">
          <label className="text-sm font-semibold text-text-secondary uppercase tracking-wide block mb-2">
            Notes (optionnel)
          </label>
          <textarea value={entry.notes ?? ''} onChange={(e) => update({ notes: e.target.value || null })}
            placeholder="Sensations, douleurs, ajustements..." rows={2}
            className="w-full bg-white/5 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-accent-green/50 resize-none"
          />
        </div>

        {/* Save */}
        <button type="button" onClick={handleSave}
          className={`w-full flex items-center justify-center gap-2 font-bold py-4 px-4 rounded-2xl text-lg transition-all active:scale-95 ${
            saved ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-green text-bg-primary'
          }`}>
          {saved ? <><CheckCircle size={22} /> Enregistre !</> : <><Save size={22} /> Enregistrer</>}
        </button>

      </div>
    </div>
  );
}
