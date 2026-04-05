
import { useState, useEffect } from 'react';
import { TrendingUp, Dumbbell, Moon, Zap, Ruler, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import WeightChart from '@/components/WeightChart';
import SleepPerfChart from '@/components/SleepPerfChart';
import StatCard from '@/components/StatCard';
import SessionList from '@/components/SessionList';
import { getLast7DaysEntries, getLast30DaysEntries } from '@/lib/storage';
import {
  calculateAvgWeight,
  calculateProteinAdherence,
  calculateWeeklySessionAdherence,
  calculateAvgSleep,
  calculateAvgEnergy,
} from '@/lib/calculations';
import { DailyEntry } from '@/lib/types';

export default function ProgressPage() {
  const [entries7, setEntries7] = useState<DailyEntry[]>([]);
  const [entries30, setEntries30] = useState<DailyEntry[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setEntries7(getLast7DaysEntries());
    setEntries30(getLast30DaysEntries());
  }, [reloadKey]);

  const avgWeight7 = calculateAvgWeight(entries7);
  const proteinAdherence7 = calculateProteinAdherence(entries7);
  const proteinAdherence30 = calculateProteinAdherence(entries30);
  const sessions = calculateWeeklySessionAdherence(entries7);
  const avgSleep = calculateAvgSleep(entries7);
  const avgEnergy = calculateAvgEnergy(entries7);

  // Waist: find last two entries with waist_cm
  const waistEntries = entries30.filter((e) => e.waist_cm !== null).slice(-2);
  const lastWaist = waistEntries.length > 0 ? waistEntries[waistEntries.length - 1] : null;
  const prevWaist = waistEntries.length > 1 ? waistEntries[0] : null;

  function sleepColor(): 'green' | 'amber' | 'red' {
    if (!avgSleep) return 'amber';
    if (avgSleep >= 7.5) return 'green';
    if (avgSleep >= 6.5) return 'amber';
    return 'red';
  }

  function energyColor(): 'green' | 'amber' | 'red' {
    if (!avgEnergy) return 'amber';
    if (avgEnergy >= 4) return 'green';
    if (avgEnergy >= 3) return 'amber';
    return 'red';
  }

  function sessionColor(): 'green' | 'amber' | 'red' {
    const pct = sessions.done / sessions.target;
    if (pct >= 0.8) return 'green';
    if (pct >= 0.6) return 'amber';
    return 'red';
  }

  const daysWithData7 = entries7.filter((e) => e.weight !== null || e.session_done || e.protein_meals.some(Boolean)).length;

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp size={22} className="text-accent-green" />
          Progression
        </h1>
        <Link
          to="/history"
          className="flex items-center gap-1.5 text-xs text-text-secondary bg-white/5 rounded-xl px-3 py-2 active:bg-white/10 transition-colors"
        >
          <History size={14} />
          Charges
        </Link>
      </div>

      {/* Session list with delete — always visible */}
      <SessionList entries={entries30} onDelete={() => setReloadKey((k) => k + 1)} />

      {daysWithData7 === 0 ? (
        <div className="bg-bg-card rounded-2xl p-8 text-center">
          <p className="text-lg font-semibold mb-2">Pas encore de donnees</p>
          <p className="text-sm text-text-secondary">
            Remplis ton check-in quotidien et reviens ici pour voir ta progression.
          </p>
        </div>
      ) : (
        <>
          {/* Weight chart */}
          <WeightChart entries={entries30} />

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Proteines 4/4"
              value={`${proteinAdherence7}/7j`}
              sub={entries30.length > 7 ? `${proteinAdherence30}/${entries30.length}j (30j)` : undefined}
              color={proteinAdherence7 >= 5 ? 'green' : proteinAdherence7 >= 3 ? 'amber' : 'red'}
              progress={proteinAdherence7 / 7}
            />
            <StatCard
              label="Seances"
              value={`${sessions.done}/${sessions.target}`}
              sub="cette semaine"
              color={sessionColor()}
              progress={sessions.done / sessions.target}
            />
            <StatCard
              label="Sommeil moy."
              value={avgSleep !== null ? `${avgSleep}h` : '—'}
              sub="7 derniers jours"
              color={sleepColor()}
              progress={avgSleep ? avgSleep / 9 : 0}
            />
            <StatCard
              label="Energie moy."
              value={avgEnergy !== null ? `${avgEnergy}/5` : '—'}
              sub="7 derniers jours"
              color={energyColor()}
              progress={avgEnergy ? avgEnergy / 5 : 0}
            />
          </div>

          {/* Waist */}
          {lastWaist && (
            <div className="bg-bg-card rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Ruler size={16} className="text-accent-amber" />
                <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">
                  Tour de taille
                </p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{lastWaist.waist_cm} cm</span>
                <span className="text-xs text-text-secondary">le {lastWaist.id}</span>
              </div>
              {prevWaist && (
                <p className="text-xs text-text-secondary mt-1">
                  Precedent : {prevWaist.waist_cm} cm ({prevWaist.id})
                  {' '}
                  <span className={
                    lastWaist.waist_cm! < prevWaist.waist_cm! ? 'text-accent-green' :
                    lastWaist.waist_cm! > prevWaist.waist_cm! ? 'text-accent-red' : 'text-text-secondary'
                  }>
                    ({lastWaist.waist_cm! < prevWaist.waist_cm! ? '↘' : lastWaist.waist_cm! > prevWaist.waist_cm! ? '↗' : '→'}
                    {' '}{Math.abs(Math.round((lastWaist.waist_cm! - prevWaist.waist_cm!) * 10) / 10)} cm)
                  </span>
                </p>
              )}
            </div>
          )}

          {/* Sleep vs Performance */}
          <SleepPerfChart entries={entries30} />

          {/* Weight summary */}
          {avgWeight7 !== null && (
            <div className="bg-bg-card rounded-2xl p-4">
              <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide mb-1">
                Poids moyen 7j
              </p>
              <span className="text-2xl font-bold">{avgWeight7} kg</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
