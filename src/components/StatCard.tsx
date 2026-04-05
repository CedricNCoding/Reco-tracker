'use client';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  color?: 'green' | 'amber' | 'red' | 'default';
  progress?: number; // 0-1
}

const colorMap = {
  green: 'text-accent-green',
  amber: 'text-accent-amber',
  red: 'text-accent-red',
  default: 'text-text-primary',
};

const barColorMap = {
  green: 'bg-accent-green',
  amber: 'bg-accent-amber',
  red: 'bg-accent-red',
  default: 'bg-text-secondary',
};

export default function StatCard({ label, value, sub, color = 'default', progress }: StatCardProps) {
  return (
    <div className="bg-bg-card rounded-2xl p-4">
      <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className={`text-2xl font-bold ${colorMap[color]}`}>{value}</p>
      {sub && <p className="text-xs text-text-secondary mt-0.5">{sub}</p>}
      {progress !== undefined && (
        <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColorMap[color]}`}
            style={{ width: `${Math.min(100, Math.round(progress * 100))}%` }}
          />
        </div>
      )}
    </div>
  );
}
