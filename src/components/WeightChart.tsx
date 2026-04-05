'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { DailyEntry } from '@/lib/types';
import { calculateMovingAverage } from '@/lib/calculations';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WeightChartProps {
  entries: DailyEntry[];
}

export default function WeightChart({ entries }: WeightChartProps) {
  const data = calculateMovingAverage(entries, 7);

  if (data.every((d) => d.weight === null)) {
    return (
      <div className="bg-bg-card rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
          Courbe de poids
        </h3>
        <div className="h-48 flex items-center justify-center text-text-secondary text-sm">
          Pas encore de donnees de poids
        </div>
      </div>
    );
  }

  const weights = data.filter((d) => d.weight !== null).map((d) => d.weight!);
  const minW = Math.floor(Math.min(...weights) - 0.5);
  const maxW = Math.ceil(Math.max(...weights) + 0.5);

  return (
    <div className="bg-bg-card rounded-2xl p-4">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
        Courbe de poids (30j)
      </h3>
      <div className="h-52 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <XAxis
              dataKey="date"
              tick={{ fill: '#94A3B8', fontSize: 10 }}
              tickFormatter={(v: string) => {
                try { return format(parseISO(v), 'd MMM', { locale: fr }); } catch { return v; }
              }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis
              domain={[minW, maxW]}
              tick={{ fill: '#94A3B8', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={35}
              tickFormatter={(v: number) => `${v}`}
            />
            <Tooltip
              contentStyle={{ background: '#1A1D27', border: 'none', borderRadius: 12, fontSize: 12, color: '#F1F5F9' }}
              labelFormatter={(v) => {
                try { return format(parseISO(String(v)), 'EEEE d MMM', { locale: fr }); } catch { return String(v); }
              }}
              formatter={(value, name) => [
                `${value} kg`,
                name === 'avg' ? 'Moy. 7j' : 'Poids',
              ]}
            />
            {/* Raw weight — light dots */}
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#4ADE80"
              strokeWidth={0}
              dot={{ r: 3, fill: '#4ADE80', opacity: 0.4 }}
              activeDot={{ r: 5, fill: '#4ADE80' }}
              connectNulls
            />
            {/* Moving average — solid line */}
            <Line
              type="monotone"
              dataKey="avg"
              stroke="#4ADE80"
              strokeWidth={2.5}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
