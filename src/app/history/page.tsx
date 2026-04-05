
import { useState, useEffect } from 'react';
import { History, TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { getAllExerciseSummaries, getExerciseProgression, ExerciseSummary, ExerciseProgressPoint } from '@/lib/exerciseStats';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};
const trendColors = {
  up: 'text-accent-green',
  down: 'text-accent-red',
  stable: 'text-text-secondary',
};

export default function HistoryPage() {
  const [summaries, setSummaries] = useState<ExerciseSummary[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [progression, setProgression] = useState<ExerciseProgressPoint[]>([]);

  useEffect(() => {
    setSummaries(getAllExerciseSummaries());
  }, []);

  useEffect(() => {
    if (selected) {
      setProgression(getExerciseProgression(selected));
    }
  }, [selected]);

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-3">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <History size={22} className="text-accent-green" />
        Historique charges
      </h1>

      {summaries.length === 0 ? (
        <div className="bg-bg-card rounded-2xl p-8 text-center">
          <p className="text-lg font-semibold mb-2">Pas encore de donnees</p>
          <p className="text-sm text-text-secondary">
            Commence a loguer tes charges pendant les seances ou via Quick Log.
          </p>
        </div>
      ) : (
        <>
          {/* Selected exercise chart */}
          {selected && progression.length > 1 && (
            <div className="bg-bg-card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold">{selected}</h3>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="text-xs text-text-secondary"
                >
                  Fermer
                </button>
              </div>
              <div className="h-44 -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progression} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#94A3B8', fontSize: 10 }}
                      tickFormatter={(v) => {
                        try { return format(parseISO(v), 'd/MM', { locale: fr }); } catch { return v; }
                      }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#94A3B8', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      width={35}
                      domain={['dataMin - 2', 'dataMax + 2']}
                    />
                    <Tooltip
                      contentStyle={{ background: '#1A1D27', border: 'none', borderRadius: 12, fontSize: 12, color: '#F1F5F9' }}
                      labelFormatter={(v) => {
                        try { return format(parseISO(String(v)), 'EEEE d MMM', { locale: fr }); } catch { return String(v); }
                      }}
                      formatter={(value, name) => [
                        name === 'maxWeight' ? `${value} kg` : `${value} reps`,
                        name === 'maxWeight' ? 'Charge max' : 'Reps moy.',
                      ]}
                    />
                    <Line type="monotone" dataKey="maxWeight" stroke="#4ADE80" strokeWidth={2.5} dot={{ r: 4, fill: '#4ADE80' }} />
                    <Line type="monotone" dataKey="avgReps" stroke="#FBBF24" strokeWidth={1.5} dot={{ r: 3, fill: '#FBBF24' }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 mt-2 justify-center text-[10px] text-text-secondary">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-green" /> Charge (kg)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-amber" /> Reps moy.</span>
              </div>
            </div>
          )}

          {/* Exercise list */}
          <div className="space-y-1.5">
            {summaries.map((s) => {
              const TrendIcon = trendIcons[s.trend];
              const isSelected = selected === s.name;
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => setSelected(isSelected ? null : s.name)}
                  className={`w-full flex items-center gap-3 bg-bg-card rounded-xl px-4 py-3 text-left transition-colors active:bg-white/10 ${
                    isSelected ? 'ring-1 ring-accent-green/40' : ''
                  }`}
                >
                  <TrendIcon size={16} className={trendColors[s.trend]} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.name}</p>
                    <p className="text-[10px] text-text-secondary">
                      {s.totalSessions} sessions · dernier : {s.lastDate}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">{s.lastWeight} kg</p>
                    {s.bestWeight > s.lastWeight && (
                      <p className="text-[10px] text-text-secondary">PR : {s.bestWeight} kg</p>
                    )}
                  </div>
                  <ChevronRight size={14} className="text-text-secondary shrink-0" />
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
