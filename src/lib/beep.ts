'use client';

const AudioCtx = typeof window !== 'undefined' ? (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext) : null;

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (!AudioCtx) return null;
  if (!ctx || ctx.state === 'closed') {
    ctx = new AudioCtx();
  }
  return ctx;
}

export function playBeep(frequency: number = 880, durationMs: number = 150, volume: number = 0.3) {
  const audioCtx = getCtx();
  if (!audioCtx) return;

  // Resume if suspended (autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';
  gainNode.gain.value = volume;

  // Fade out to avoid click
  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durationMs / 1000);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + durationMs / 1000);
}

// Short beep for countdown warnings
export function beepWarning() {
  playBeep(660, 100, 0.2);
}

// Double beep for timer complete
export function beepComplete() {
  playBeep(880, 200, 0.4);
  setTimeout(() => playBeep(1100, 300, 0.4), 250);
}

// Triple short beep for 3s countdown
export function beepCountdown() {
  playBeep(550, 80, 0.15);
}
