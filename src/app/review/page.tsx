'use client';

import { useState, useEffect, useMemo } from 'react';
import { ClipboardList, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Minus, Link2 } from 'lucide-react';
import { format, startOfWeek, addDays, subWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';
import WeeklyExport from '@/components/WeeklyExport';
import StatCard from '@/components/StatCard';
import { getWeekEntries } from '@/lib/storage';
import { generateWeeklySummary } from '@/lib/calculations';
import { generateBilanMarkdown, BilanData } from '@/lib/exportBilan';
import { WEEK_SCHEDULE, SESSION_TYPE_LABELS } from '@/constants/program';
import { getDayEntryForWeek } from '@/lib/exportBilan';
import { DailyEntry, WeeklySummary } from '@/lib/types';

const DIAGNOSIS_CONFIG: Record<WeeklySummary['diagnosis'], { icon: typeof CheckCircle2; label: string; color: string; bg: string }> = {
  recomp_ok: { icon: CheckCircle2, label: 'Recomp en cours', color: 'text-accent-green', bg: 'bg-accent-green/15' },
  stagnation: { icon: AlertTriangle, label: 'Stagnation', color: 'text-accent-amber', bg: 'bg-accent-amber/15' },
  force_loss: { icon: TrendingDown, label: 'Perte de force', color: 'text-accent-red', bg: 'bg-accent-red/15' },
  unwanted_gain: { icon: TrendingUp, label: 'Prise non voulue', color: 'text-accent-red', bg: 'bg-accent-red/15' },
};

export default function ReviewPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [prevEntries, setPrevEntries] = useState<DailyEntry[]>([]);

  // Monday-based week start
  const weekStart = useMemo(() => {
    const now = new Date();
    const monday = startOfWeek(now, { weekStartsOn: 1 });
    return subWeeks(monday, -weekOffset);
  }, [weekOffset]);

  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);
  const prevWeekStart = useMemo(() => subWeeks(weekStart, 1), [weekStart]);
  const week4AgoStart = useMemo(() => subWeeks(weekStart, 4), [weekStart]);

  const [entries4ago, setEntries4ago] = useState<DailyEntry[]>([]);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    setEntries(getWeekEntries(weekStart));
    setPrevEntries(getWeekEntries(prevWeekStart));
    setEntries4ago(getWeekEntries(week4AgoStart));
    setShareUrl(null);
  }, [weekStart, prevWeekStart, week4AgoStart]);

  const summary = useMemo(
    () => generateWeeklySummary(entries, prevEntries, format(weekStart, 'yyyy-MM-dd')),
    [entries, prevEntries, weekStart]
  );

  const summary4ago = useMemo(
    () => {
      if (entries4ago.length === 0) return null;
      const prev4 = getWeekEntries(subWeeks(week4AgoStart, 1));
      return generateWeeklySummary(entries4ago, prev4, format(week4AgoStart, 'yyyy-MM-dd'));
    },
    [entries4ago, week4AgoStart]
  );

  const bilanData: BilanData = { weekStart, weekEnd, entries, prevEntries, summary };
  const markdown = useMemo(() => generateBilanMarkdown(bilanData), [bilanData]);

  const hasData = entries.some((e) => e.weight !== null || e.session_done || e.protein_meals.some(Boolean));

  async function handleShare() {
    setSharing(true);
    const weekNum = format(weekStart, "'W'ww", { locale: fr });
    const year = format(weekStart, 'yyyy');
    const id = `bilan-${year}-${weekNum}`;
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, markdown }),
      });
      const data = await res.json();
      setShareUrl(`${window.location.origin}${data.url}`);
    } catch { /* silent */ }
    setSharing(false);
  }

  const diag = DIAGNOSIS_CONFIG[summary.diagnosis];
  const DiagIcon = diag.icon;

  const trendIcon = summary.weight_trend === 'up' ? '↗' : summary.weight_trend === 'down' ? '↘' : '→';

  const weekLabel = `${format(weekStart, 'd MMM', { locale: fr })} — ${format(weekEnd, 'd MMM', { locale: fr })}`;
  const isCurrentWeek = weekOffset === 0;

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <ClipboardList size={22} className="text-accent-green" />
          Bilan
        </h1>
      </div>

      {/* Week navigator */}
      <div className="flex items-center justify-between bg-bg-card rounded-2xl px-4 py-3">
        <button
          type="button"
          onClick={() => setWeekOffset((o) => o - 1)}
          className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center active:scale-90 transition-transform"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <p className="text-sm font-bold">{weekLabel}</p>
          <p className="text-[10px] text-text-secondary">{isCurrentWeek ? 'Semaine en cours' : ''}</p>
        </div>
        <button
          type="button"
          onClick={() => setWeekOffset((o) => Math.min(0, o + 1))}
          disabled={isCurrentWeek}
          className={`w-10 h-10 rounded-xl flex items-center justify-center active:scale-90 transition-transform ${
            isCurrentWeek ? 'bg-white/5 text-text-secondary/30' : 'bg-white/10'
          }`}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {!hasData ? (
        <div className="bg-bg-card rounded-2xl p-8 text-center">
          <p className="text-lg font-semibold mb-2">Pas de donnees</p>
          <p className="text-sm text-text-secondary">
            Aucun check-in pour cette semaine.
          </p>
        </div>
      ) : (
        <>
          {/* Diagnosis banner */}
          <div className={`${diag.bg} rounded-2xl p-4 flex items-center gap-3`}>
            <DiagIcon size={28} className={diag.color} />
            <div>
              <p className={`font-bold ${diag.color}`}>{diag.label}</p>
              <p className="text-xs text-text-secondary mt-0.5">
                Poids {trendIcon} | Seances {summary.sessions_completed}/{summary.sessions_target}
              </p>
            </div>
          </div>

          {/* Weight summary */}
          <div className="bg-bg-card rounded-2xl p-4">
            <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide mb-2">Poids</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {summary.avg_weight !== null ? `${summary.avg_weight} kg` : '—'}
              </span>
              <span className="text-sm text-text-secondary">moy.</span>
              <span className="text-lg">{trendIcon}</span>
            </div>
            {entries.filter((e) => e.weight !== null).length > 0 && (
              <p className="text-xs text-text-secondary mt-1">
                Min {Math.min(...entries.filter((e) => e.weight !== null).map((e) => e.weight!))} / Max{' '}
                {Math.max(...entries.filter((e) => e.weight !== null).map((e) => e.weight!))} kg
              </p>
            )}
          </div>

          {/* Session detail */}
          <div className="bg-bg-card rounded-2xl p-4">
            <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide mb-3">
              Seances — {summary.sessions_completed}/{summary.sessions_target} muscu
            </p>
            <div className="space-y-1.5">
              {WEEK_SCHEDULE.map((day) => {
                const entry = getDayEntryForWeek(entries, day.day, weekStart);
                const done = entry?.session_done;
                const isRest = day.session_type === 'repos';
                const typeLabel = entry?.session_type ? SESSION_TYPE_LABELS[entry.session_type] : day.label.split('—')[0].trim();
                const duration = entry?.session_duration_min;

                return (
                  <div
                    key={day.day}
                    className={`flex items-center justify-between py-2 px-3 rounded-xl ${
                      done ? 'bg-accent-green/10' : isRest ? 'bg-white/3' : 'bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{done ? '✅' : isRest ? '💤' : '❌'}</span>
                      <span className="text-xs font-medium capitalize">{day.day}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-secondary">{isRest ? 'Repos' : typeLabel}</span>
                      {duration && <span className="text-[10px] text-text-secondary/60">{duration} min</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Proteines 4/4"
              value={`${summary.protein_adherence}/7`}
              color={summary.protein_adherence >= 5 ? 'green' : summary.protein_adherence >= 3 ? 'amber' : 'red'}
              progress={summary.protein_adherence / 7}
            />
            <StatCard
              label="Sommeil moy."
              value={summary.avg_sleep !== null ? `${summary.avg_sleep}h` : '—'}
              color={summary.avg_sleep !== null ? (summary.avg_sleep >= 7.5 ? 'green' : summary.avg_sleep >= 6.5 ? 'amber' : 'red') : 'default'}
              sub={(() => {
                const worst = entries
                  .filter((e) => e.sleep_hours !== null)
                  .reduce<DailyEntry | null>((w, e) => (!w || e.sleep_hours! < w.sleep_hours! ? e : w), null);
                return worst ? `Pire : ${format(new Date(worst.id + 'T00:00:00'), 'EEE', { locale: fr })} (${worst.sleep_hours}h)` : undefined;
              })()}
            />
            <StatCard
              label="Energie moy."
              value={summary.avg_energy !== null ? `${summary.avg_energy}/5` : '—'}
              color={summary.avg_energy !== null ? (summary.avg_energy >= 4 ? 'green' : summary.avg_energy >= 3 ? 'amber' : 'red') : 'default'}
            />
            {entries.some((e) => e.waist_cm !== null) && (
              <StatCard
                label="Tour de taille"
                value={`${entries.filter((e) => e.waist_cm !== null).pop()?.waist_cm} cm`}
                color="default"
              />
            )}
          </div>

          {/* Notes */}
          {entries.some((e) => e.notes) && (
            <div className="bg-bg-card rounded-2xl p-4">
              <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide mb-2">
                Notes de la semaine
              </p>
              <div className="space-y-1.5">
                {entries.filter((e) => e.notes).map((e) => (
                  <div key={e.id} className="text-xs text-text-secondary">
                    <span className="font-medium text-text-primary capitalize">
                      {format(new Date(e.id + 'T00:00:00'), 'EEEE', { locale: fr })}
                    </span>
                    {' : '}{e.notes}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* N vs N-4 comparison */}
          {summary4ago && summary4ago.avg_weight !== null && summary.avg_weight !== null && (
            <div className="bg-bg-card rounded-2xl p-4">
              <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide mb-2">
                Comparaison — il y a 4 semaines
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-text-secondary">Poids moy. N-4</p>
                  <p className="text-base font-bold">{summary4ago.avg_weight} kg</p>
                </div>
                <div>
                  <p className="text-text-secondary">Poids moy. actuel</p>
                  <p className="text-base font-bold">{summary.avg_weight} kg</p>
                </div>
                <div>
                  <p className="text-text-secondary">Variation</p>
                  <p className={`text-base font-bold ${
                    summary.avg_weight - summary4ago.avg_weight < -0.3 ? 'text-accent-green' :
                    summary.avg_weight - summary4ago.avg_weight > 0.3 ? 'text-accent-red' : 'text-text-primary'
                  }`}>
                    {summary.avg_weight - summary4ago.avg_weight > 0 ? '+' : ''}
                    {(summary.avg_weight - summary4ago.avg_weight).toFixed(1)} kg
                  </p>
                </div>
                <div>
                  <p className="text-text-secondary">Seances N-4</p>
                  <p className="text-base font-bold">{summary4ago.sessions_completed}/{summary4ago.sessions_target}</p>
                </div>
              </div>
            </div>
          )}

          {/* Export */}
          <WeeklyExport markdown={markdown} />

          {/* Share link */}
          <div className="bg-bg-card rounded-2xl p-4">
            <button
              type="button"
              onClick={handleShare}
              disabled={sharing}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 text-text-primary font-bold text-sm active:scale-95 transition-transform disabled:opacity-50"
            >
              <Link2 size={16} />
              {sharing ? 'Generation...' : 'Generer un lien de partage'}
            </button>
            {shareUrl && (
              <div className="mt-2 text-center">
                <p className="text-xs text-text-secondary">Lien copie-le et envoie-le :</p>
                <p className="text-xs text-accent-green font-mono mt-1 break-all">{shareUrl}</p>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(shareUrl)}
                  className="mt-2 text-xs text-accent-green underline"
                >
                  Copier le lien
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
