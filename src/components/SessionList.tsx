
import { useState } from 'react';
import { Trash2, Dumbbell, HeartPulse, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { DailyEntry } from '@/lib/types';
import { saveEntry } from '@/lib/storage';
import { deleteSetLogsForDate } from '@/lib/setLogStorage';
import { SESSION_TYPE_LABELS } from '@/constants/program';
import { syncToServer } from '@/lib/sync';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SessionListProps {
  entries: DailyEntry[];
  onDelete: () => void;
}

interface SessionRow {
  entry: DailyEntry;
  kind: 'muscu' | 'cardio';
  label: string;
  icon: 'muscu' | 'cardio';
  duration: number | null;
}

function buildRows(entries: DailyEntry[]): SessionRow[] {
  const rows: SessionRow[] = [];
  for (const e of entries) {
    if (e.session_done && e.session_type && !['run', 'natation', 'repos'].includes(e.session_type)) {
      rows.push({
        entry: e,
        kind: 'muscu',
        label: SESSION_TYPE_LABELS[e.session_type] || e.session_type,
        icon: 'muscu',
        duration: e.session_duration_min,
      });
    }
    if (e.cardio_type || (e.session_done && (e.session_type === 'run' || e.session_type === 'natation'))) {
      const type = e.cardio_type || e.session_type;
      rows.push({
        entry: e,
        kind: 'cardio',
        label: type === 'natation' ? '🏊 Natation' : '🏃 Run',
        icon: 'cardio',
        duration: e.cardio_duration_min ?? (e.session_type === type ? e.session_duration_min : null),
      });
    }
  }
  return rows.sort((a, b) => b.entry.id.localeCompare(a.entry.id));
}

export default function SessionList({ entries, onDelete }: SessionListProps) {
  const [expanded, setExpanded] = useState(true);

  const rows = buildRows(entries);

  if (rows.length === 0) return null;

  function handleDelete(row: SessionRow) {
    const dateLabel = format(parseISO(row.entry.id), 'EEEE d MMMM', { locale: fr });
    if (!confirm(`Supprimer ${row.label} du ${dateLabel} ?`)) return;

    const updated = { ...row.entry };
    if (row.kind === 'muscu') {
      deleteSetLogsForDate(row.entry.id);
      updated.session_done = false;
      updated.session_type = null;
      updated.session_duration_min = null;
    } else {
      updated.cardio_type = null;
      updated.cardio_distance_m = null;
      updated.cardio_duration_min = null;
      updated.cardio_avg_hr = null;
      // If session_type was the cardio type, clear it too
      if (updated.session_type === 'run' || updated.session_type === 'natation') {
        updated.session_done = false;
        updated.session_type = null;
        updated.session_duration_min = null;
      }
    }
    saveEntry(updated);
    syncToServer().catch(() => {});
    onDelete();
  }

  return (
    <div className="bg-bg-card rounded-2xl p-4">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Dumbbell size={16} className="text-accent-green" />
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Seances ({rows.length})
          </h3>
        </div>
        {expanded ? <ChevronUp size={14} className="text-text-secondary" /> : <ChevronDown size={14} className="text-text-secondary" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-1.5">
          {rows.map((row) => {
            const dateLabel = format(parseISO(row.entry.id), 'EEE d MMM', { locale: fr });
            const Icon = row.icon === 'muscu' ? Dumbbell : HeartPulse;
            const iconColor = row.icon === 'muscu' ? 'text-accent-green' : 'text-accent-amber';

            return (
              <div
                key={`${row.entry.id}-${row.kind}`}
                className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5"
              >
                <Icon size={14} className={iconColor} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{row.label}</span>
                    {row.duration && (
                      <span className="flex items-center gap-1 text-[10px] text-text-secondary">
                        <Clock size={10} />
                        {row.duration} min
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-secondary capitalize">{dateLabel}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(row)}
                  className="w-8 h-8 rounded-lg bg-accent-red/10 flex items-center justify-center text-accent-red/50 active:text-accent-red active:scale-90 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
