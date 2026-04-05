'use client';

interface WeightInputProps {
  value: number | null;
  onChange: (v: number | null) => void;
}

export default function WeightInput({ value, onChange }: WeightInputProps) {
  return (
    <div className="bg-bg-card rounded-2xl p-4">
      <label className="text-sm font-semibold text-text-secondary uppercase tracking-wide block mb-2">
        Poids (kg)
      </label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.round(((value ?? 83) - 0.1) * 10) / 10)}
          className="w-12 h-12 rounded-xl bg-white/10 text-xl font-bold active:scale-90 transition-transform"
        >
          −
        </button>
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          value={value ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === '' ? null : parseFloat(v));
          }}
          placeholder="82.4"
          className="flex-1 text-center text-3xl font-bold bg-white/5 rounded-xl py-3 outline-none focus:ring-2 focus:ring-accent-green/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => onChange(Math.round(((value ?? 83) + 0.1) * 10) / 10)}
          className="w-12 h-12 rounded-xl bg-white/10 text-xl font-bold active:scale-90 transition-transform"
        >
          +
        </button>
      </div>
    </div>
  );
}
