
import { useState } from 'react';
import { Heart, Route, Clock, CheckCircle, X } from 'lucide-react';
import { SessionType } from '@/lib/types';

interface CardioLogFormProps {
  sessionType: 'run' | 'natation';
  distance: number | null;
  duration: number | null;
  avgHr: number | null;
  onSave: (distance: number | null, duration: number | null, avgHr: number | null) => void;
  onCancel: () => void;
}

const PRESETS: Record<string, { distance: number; label: string }> = {
  run: { distance: 5000, label: '5 km' },
  natation: { distance: 1000, label: '1 km' },
};

const HR_PRESETS = [120, 130, 140, 150, 160, 170];

export default function CardioLogForm({ sessionType, distance, duration, avgHr, onSave, onCancel }: CardioLogFormProps) {
  const preset = PRESETS[sessionType];
  const [dist, setDist] = useState<number | null>(distance ?? preset.distance);
  const [dur, setDur] = useState<number | null>(duration);
  const [hr, setHr] = useState<number | null>(avgHr);

  const isRun = sessionType === 'run';
  const title = isRun ? 'Run' : 'Natation';
  const emoji = isRun ? '🏃' : '🏊';

  return (
    <div className="fixed inset-0 z-50 bg-bg-primary flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button type="button" onClick={onCancel}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform">
          <X size={20} />
        </button>
        <p className="text-lg font-bold">{emoji} {title}</p>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-4 py-4">
        {/* Distance */}
        <div className="bg-bg-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Route size={16} className="text-accent-green" />
            <span className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Distance</span>
          </div>
          <div className="flex gap-2 mb-2">
            {(isRun ? [3000, 5000, 7000, 10000] : [500, 1000, 1500, 2000]).map((d) => (
              <button key={d} type="button" onClick={() => setDist(d)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                  dist === d ? 'bg-accent-green/20 text-accent-green ring-2 ring-accent-green/50' : 'bg-white/10 text-text-primary'
                }`}>
                {d >= 1000 ? `${d / 1000} km` : `${d} m`}
              </button>
            ))}
          </div>
          <input type="number" inputMode="numeric" value={dist ?? ''} placeholder="Distance en metres"
            onChange={(e) => setDist(e.target.value === '' ? null : parseInt(e.target.value))}
            className="w-full text-center text-xl font-bold bg-white/5 rounded-xl py-3 outline-none focus:ring-2 focus:ring-accent-green/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <p className="text-[10px] text-text-secondary text-center mt-1">
            {dist ? (dist >= 1000 ? `${(dist / 1000).toFixed(1)} km` : `${dist} m`) : ''}
          </p>
        </div>

        {/* Duration */}
        <div className="bg-bg-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-accent-amber" />
            <span className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Duree (min)</span>
          </div>
          <div className="flex gap-2 mb-2">
            {(isRun ? [20, 25, 30, 35, 40] : [20, 25, 30, 35, 40]).map((d) => (
              <button key={d} type="button" onClick={() => setDur(d)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                  dur === d ? 'bg-accent-amber/20 text-accent-amber ring-2 ring-accent-amber/50' : 'bg-white/10 text-text-primary'
                }`}>
                {d}'
              </button>
            ))}
          </div>
          <input type="number" inputMode="numeric" value={dur ?? ''} placeholder="Duree en minutes"
            onChange={(e) => setDur(e.target.value === '' ? null : parseInt(e.target.value))}
            className="w-full text-center text-xl font-bold bg-white/5 rounded-xl py-3 outline-none focus:ring-2 focus:ring-accent-amber/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>

        {/* Heart rate */}
        <div className="bg-bg-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Heart size={16} className="text-accent-red" />
            <span className="text-sm font-semibold text-text-secondary uppercase tracking-wide">FC moyenne (bpm)</span>
          </div>
          <div className="flex gap-1.5 mb-2 flex-wrap">
            {HR_PRESETS.map((h) => (
              <button key={h} type="button" onClick={() => setHr(h)}
                className={`px-3 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                  hr === h ? 'bg-accent-red/20 text-accent-red ring-2 ring-accent-red/50' : 'bg-white/10 text-text-primary'
                }`}>
                {h}
              </button>
            ))}
          </div>
          <input type="number" inputMode="numeric" value={hr ?? ''} placeholder="Optionnel"
            onChange={(e) => setHr(e.target.value === '' ? null : parseInt(e.target.value))}
            className="w-full text-center text-xl font-bold bg-white/5 rounded-xl py-3 outline-none focus:ring-2 focus:ring-accent-red/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
      </div>

      {/* Save */}
      <div className="px-4 pb-8 pt-4">
        <button type="button" onClick={() => onSave(dist, dur, hr)}
          className="w-full flex items-center justify-center gap-2 py-5 rounded-2xl bg-accent-green text-bg-primary font-bold text-xl active:scale-95 transition-transform">
          <CheckCircle size={24} />
          Enregistrer
        </button>
      </div>
    </div>
  );
}
