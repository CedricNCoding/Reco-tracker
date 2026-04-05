
import { useMemo } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DailyEntry } from '@/lib/types';
import { getAllSetLogs } from '@/lib/setLogStorage';

interface SleepPerfChartProps {
  entries: DailyEntry[];
}

interface DataPoint {
  sleep: number;
  maxWeight: number;
  date: string;
}

const PILLAR_NAMES = [
  'Developpe couche barre',
  'Tractions pronation (lestees)',
  'Developpe militaire halteres assis',
  'Hack squat ou presse',
  'Developpe incline machine/halteres',
];

export default function SleepPerfChart({ entries }: SleepPerfChartProps) {
  const data = useMemo(() => {
    const logs = getAllSetLogs();
    const pillarLogs = Object.values(logs).filter(
      (l) => PILLAR_NAMES.includes(l.exercise_name) && l.weight_kg !== null
    );

    // Group pillar max weight by date
    const maxByDate: Record<string, number> = {};
    for (const log of pillarLogs) {
      if (!maxByDate[log.date] || log.weight_kg! > maxByDate[log.date]) {
        maxByDate[log.date] = log.weight_kg!;
      }
    }

    // Match with sleep from previous night
    const points: DataPoint[] = [];
    for (const entry of entries) {
      if (entry.sleep_hours !== null && maxByDate[entry.id]) {
        points.push({
          sleep: entry.sleep_hours,
          maxWeight: maxByDate[entry.id],
          date: entry.id,
        });
      }
    }

    return points;
  }, [entries]);

  if (data.length < 3) return null;

  return (
    <div className="bg-bg-card rounded-2xl p-4">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-1">
        Sommeil vs Performance (piliers)
      </h3>
      <p className="text-[10px] text-text-secondary mb-3">
        Chaque point = nuit de sommeil + charge max pilier du jour
      </p>
      <div className="h-44 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="sleep" name="Sommeil" unit="h"
              tick={{ fill: '#94A3B8', fontSize: 10 }}
              tickLine={false} axisLine={false}
              domain={['dataMin - 0.5', 'dataMax + 0.5']}
            />
            <YAxis
              dataKey="maxWeight" name="Charge" unit="kg"
              tick={{ fill: '#94A3B8', fontSize: 10 }}
              tickLine={false} axisLine={false} width={35}
            />
            <Tooltip
              contentStyle={{ background: '#1A1D27', border: 'none', borderRadius: 12, fontSize: 12, color: '#F1F5F9' }}
              formatter={(value, name) => [
                name === 'Sommeil' ? `${value}h` : `${value} kg`,
                name,
              ]}
            />
            <Scatter data={data} fill="#4ADE80" fillOpacity={0.7} r={5} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
