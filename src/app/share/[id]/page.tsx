'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ClipboardList, Copy, CheckCircle } from 'lucide-react';

export default function SharedBilanPage() {
  const params = useParams();
  const id = params.id as string;
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/share?id=${encodeURIComponent(id)}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => setMarkdown(data.markdown))
      .catch(() => setError(true));
  }, [id]);

  async function handleCopy() {
    if (!markdown) return;
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-12 text-center">
        <p className="text-lg font-bold">Bilan introuvable</p>
        <p className="text-sm text-text-secondary mt-2">Ce lien est invalide ou a expire.</p>
      </div>
    );
  }

  if (!markdown) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-12 text-center">
        <p className="text-text-secondary">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-3">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <ClipboardList size={22} className="text-accent-green" />
        Bilan partage
      </h1>

      <pre className="bg-bg-card rounded-2xl p-4 text-xs text-text-secondary whitespace-pre-wrap leading-relaxed font-mono max-h-[70vh] overflow-y-auto hide-scrollbar">
        {markdown}
      </pre>

      <button
        type="button"
        onClick={handleCopy}
        className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all active:scale-95 ${
          copied ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-green text-bg-primary'
        }`}
      >
        {copied ? <><CheckCircle size={20} /> Copie !</> : <><Copy size={20} /> Copier le bilan</>}
      </button>
    </div>
  );
}
