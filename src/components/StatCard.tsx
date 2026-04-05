
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
    <div className="card-premium p-4">
      <p className="text-[10px] font-medium text-text-secondary uppercase tracking-widest mb-1.5">
        {label}
      </p>
      <p className={`text-2xl font-display font-semibold ${colorMap[color]}`}>{value}</p>
      {sub && <p className="text-[11px] text-text-secondary mt-1">{sub}</p>}
      {progress !== undefined && (
        <div className="mt-2.5 h-1 bg-white/[0.04] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${barColorMap[color]}`}
            style={{ width: `${Math.min(100, Math.round(progress * 100))}%` }}
          />
        </div>
      )}
    </div>
  );
}
