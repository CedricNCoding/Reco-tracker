
import { useState, useEffect, useRef, useCallback } from 'react';
import { beepWarning, beepComplete, beepCountdown } from '@/lib/beep';

interface RestTimerProps {
  duration: number;
  onComplete: () => void;
  onSkip: () => void;
  label: string;
}

export default function RestTimer({ duration, onComplete, onSkip, label }: RestTimerProps) {
  const [remaining, setRemaining] = useState(duration);
  const [totalDuration, setTotalDuration] = useState(duration);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);
  const beeped = useRef<Set<number>>(new Set());

  const handleComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);
    beepComplete();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    completedRef.current = false;
    beeped.current = new Set();
    setRemaining(duration);
    setTotalDuration(duration);

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [duration]);

  useEffect(() => {
    if (remaining === 10 && !beeped.current.has(10)) { beeped.current.add(10); beepWarning(); }
    if (remaining === 3 && !beeped.current.has(3)) { beeped.current.add(3); beepCountdown(); }
    if (remaining === 2 && !beeped.current.has(2)) { beeped.current.add(2); beepCountdown(); }
    if (remaining === 1 && !beeped.current.has(1)) { beeped.current.add(1); beepCountdown(); }
    if (remaining === 0) handleComplete();
  }, [remaining, handleComplete]);

  function addTime() {
    setRemaining((prev) => prev + 30);
    setTotalDuration((prev) => prev + 30);
  }

  const pct = Math.max(0, Math.min(1, remaining / totalDuration));
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  // Premium color transitions
  let strokeColor = '#D4A574'; // bronze
  let glowColor = 'rgba(212, 165, 116, 0.15)';
  if (pct < 0.1) {
    strokeColor = '#C45C5C';
    glowColor = 'rgba(196, 92, 92, 0.2)';
  } else if (pct < 0.5) {
    strokeColor = '#C9956B';
    glowColor = 'rgba(201, 149, 107, 0.15)';
  }

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - pct);

  return (
    <div className="fixed inset-0 z-50 bg-bg-primary flex flex-col items-center justify-center px-6">
      {/* Label */}
      <p className="text-sm font-medium text-text-secondary tracking-widest uppercase mb-10">
        {label}
      </p>

      {/* Circular timer */}
      <div className="relative w-72 h-72 mb-10">
        {/* Outer glow */}
        <div
          className="absolute inset-0 rounded-full transition-all duration-1000"
          style={{ boxShadow: `0 0 60px 10px ${glowColor}` }}
        />
        <svg className="w-full h-full -rotate-90" viewBox="0 0 280 280">
          {/* Background ring */}
          <circle cx="140" cy="140" r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
          {/* Progress ring */}
          <circle
            cx="140" cy="140" r={radius} fill="none"
            stroke={strokeColor} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
          {/* Inner subtle ring */}
          <circle cx="140" cy="140" r={radius - 12} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-7xl font-light tabular-nums tracking-tight transition-colors duration-500"
            style={{ color: strokeColor }}
          >
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
          <span className="text-xs text-text-secondary mt-2 tracking-wider uppercase">repos</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 w-full max-w-xs">
        <button type="button" onClick={addTime}
          className="flex-1 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-text-primary font-medium text-lg press-scale transition-colors hover:bg-white/[0.06]">
          +30s
        </button>
        <button type="button" onClick={onSkip}
          className="flex-1 py-4 rounded-2xl bg-accent-red/10 border border-accent-red/10 text-accent-red font-medium text-lg press-scale transition-colors hover:bg-accent-red/15">
          Skip
        </button>
      </div>
    </div>
  );
}
