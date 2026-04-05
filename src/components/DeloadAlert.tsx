
import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { getPillarRegressions } from '@/lib/exerciseStats';

export default function DeloadAlert() {
  const [regressions, setRegressions] = useState<{ exercise: string; weights: number[] }[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const r = getPillarRegressions();
    setRegressions(r);
    // Check if already dismissed this week
    const key = `deload-dismissed-${new Date().toISOString().slice(0, 10)}`;
    if (sessionStorage.getItem(key)) setDismissed(true);
  }, []);

  function handleDismiss() {
    const key = `deload-dismissed-${new Date().toISOString().slice(0, 10)}`;
    sessionStorage.setItem(key, '1');
    setDismissed(true);
  }

  if (regressions.length === 0 || dismissed) return null;

  return (
    <div className="bg-accent-red/15 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} className="text-accent-red shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-bold text-accent-red">Deload suggere</p>
          <p className="text-xs text-text-secondary mt-1">
            Regression detectee sur {regressions.length} pilier{regressions.length > 1 ? 's' : ''} :
          </p>
          <div className="mt-2 space-y-1">
            {regressions.map((r) => (
              <div key={r.exercise} className="text-xs text-text-secondary">
                <span className="font-medium text-text-primary">{r.exercise}</span>
                {' — '}
                {r.weights.map((w, i) => (
                  <span key={i}>
                    {i > 0 && ' → '}
                    <span className={i > 0 && w < r.weights[i - 1] ? 'text-accent-red' : ''}>{w} kg</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
          <p className="text-xs text-text-secondary mt-2">
            Recommandation : semaine legere (−1 serie partout sauf piliers, −10-15% charge piliers).
          </p>
        </div>
        <button type="button" onClick={handleDismiss} className="text-text-secondary">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
