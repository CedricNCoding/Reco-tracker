
import { useState, useEffect } from 'react';
import { Flame, Calendar, Dumbbell } from 'lucide-react';
import { calculateCheckinStreak, calculateSessionWeekStreak } from '@/lib/streaks';

export default function StreakBanner() {
  const [checkinStreak, setCheckinStreak] = useState(0);
  const [weekStreak, setWeekStreak] = useState(0);

  useEffect(() => {
    setCheckinStreak(calculateCheckinStreak());
    setWeekStreak(calculateSessionWeekStreak());
  }, []);

  if (checkinStreak === 0 && weekStreak === 0) return null;

  return (
    <div className="flex gap-2">
      {checkinStreak > 0 && (
        <div className="flex-1 bg-bg-card rounded-2xl px-3 py-2.5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent-amber/15 flex items-center justify-center">
            <Flame size={16} className="text-accent-amber" />
          </div>
          <div>
            <p className="text-lg font-bold leading-none">{checkinStreak}</p>
            <p className="text-[10px] text-text-secondary">jours de suite</p>
          </div>
        </div>
      )}
      {weekStreak > 0 && (
        <div className="flex-1 bg-bg-card rounded-2xl px-3 py-2.5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent-green/15 flex items-center justify-center">
            <Dumbbell size={16} className="text-accent-green" />
          </div>
          <div>
            <p className="text-lg font-bold leading-none">{weekStreak}</p>
            <p className="text-[10px] text-text-secondary">sem. completes</p>
          </div>
        </div>
      )}
    </div>
  );
}
