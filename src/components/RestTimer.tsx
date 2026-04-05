'use client';

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

  // Beep at specific thresholds
  useEffect(() => {
    if (remaining === 10 && !beeped.current.has(10)) {
      beeped.current.add(10);
      beepWarning();
    }
    if (remaining === 3 && !beeped.current.has(3)) {
      beeped.current.add(3);
      beepCountdown();
    }
    if (remaining === 2 && !beeped.current.has(2)) {
      beeped.current.add(2);
      beepCountdown();
    }
    if (remaining === 1 && !beeped.current.has(1)) {
      beeped.current.add(1);
      beepCountdown();
    }
    if (remaining === 0) {
      handleComplete();
    }
  }, [remaining, handleComplete]);

  function addTime() {
    setRemaining((prev) => prev + 30);
    setTotalDuration((prev) => prev + 30);
  }

  const pct = Math.max(0, Math.min(1, remaining / totalDuration));
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  let color = 'text-accent-green';
  let strokeColor = '#4ADE80';
  if (pct < 0.1) {
    color = 'text-accent-red';
    strokeColor = '#F87171';
  } else if (pct < 0.5) {
    color = 'text-accent-amber';
    strokeColor = '#FBBF24';
  }

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - pct);

  return (
    <div className="fixed inset-0 z-50 bg-bg-primary flex flex-col items-center justify-center px-6">
      <p className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-8">
        {label} — Repos
      </p>

      <div className="relative w-72 h-72 mb-8">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 280 280">
          <circle cx="140" cy="140" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle
            cx="140" cy="140" r={radius} fill="none"
            stroke={strokeColor} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-7xl font-bold tabular-nums ${color}`}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="flex gap-4 w-full max-w-xs">
        <button type="button" onClick={addTime}
          className="flex-1 py-4 rounded-2xl bg-white/10 text-text-primary font-bold text-lg active:scale-95 transition-transform">
          +30s
        </button>
        <button type="button" onClick={onSkip}
          className="flex-1 py-4 rounded-2xl bg-accent-red/20 text-accent-red font-bold text-lg active:scale-95 transition-transform">
          Skip
        </button>
      </div>
    </div>
  );
}
