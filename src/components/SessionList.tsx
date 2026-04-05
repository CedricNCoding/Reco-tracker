
import { useState } from 'react';
import { Trash2, Dumbbell, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { DailyEntry } from '@/lib/types';
import { saveEntry } from '@/lib/storage';
import { deleteSetLogsForDate, getSetLogsForSession } from '@/lib/setLogStorage';
import { SESSION_TYPE_LABELS } from '@/constants/program';
import { syncToServer } from '@/lib/sync';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SessionListProps {
  entries: DailyEntry[];
  onDelete: () => void;
}

export default function SessionList({ entries, onDelete }: SessionListProps) {
  const [expanded, setExpanded] = useState(true);

  const sessions = entries
    .filter((e) => e.session_done && e.session_type)
    .sort((a, b) => b.id.localeCompare(a.id));

  if (sessions.length === 0) return null;

  function handleDelete(entry: DailyEntry) {
    const dateLabel = format(parseISO(entry.id), 'EEEE d MMMM', { locale: fr });
    const typeLabel = entry.session_type ? SESSION_TYPE_LABELS[entry.session_type] : '';
    if (!confirm(`Supprimer la seance du ${dateLabel} (${typeLabel}) ?\n\nLes charges enregistrees seront aussi supprimees.\nLe reste du check-in (poids, proteines, sommeil...) est conserve.`)) return;

    deleteSetLogsForDate(entry.id);
    saveEntry({
      ...entry,
      session_done: false,
      session_type: null,
      session_duration_min: null,
    });
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
            Seances ({sessions.length})
          </h3>
        </div>
        {expanded ? <ChevronUp size={14} className="text-text-secondary" /> : <ChevronDown size={14} className="text-text-secondary" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-1.5">
          {sessions.map((entry) => {
            const typeLabel = entry.session_type ? SESSION_TYPE_LABELS[entry.session_type] : '?';
            const dateLabel = format(parseISO(entry.id), 'EEE d MMM', { locale: fr });

            return (
              <div
                key={entry.id}
                className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{typeLabel}</span>
                    {entry.session_duration_min && (
                      <span className="flex items-center gap-1 text-[10px] text-text-secondary">
                        <Clock size={10} />
                        {entry.session_duration_min} min
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-secondary capitalize">{dateLabel}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(entry)}
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
