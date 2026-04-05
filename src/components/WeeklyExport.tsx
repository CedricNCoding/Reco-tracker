
import { useState } from 'react';
import { Copy, Share2, CheckCircle } from 'lucide-react';

interface WeeklyExportProps {
  markdown: string;
}

export default function WeeklyExport({ markdown }: WeeklyExportProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = markdown;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bilan hebdomadaire Recomp',
          text: markdown,
        });
      } catch {
        // User cancelled or error — silent
      }
    } else {
      handleCopy();
    }
  }

  return (
    <div className="space-y-3">
      {/* Preview */}
      <div className="bg-bg-card rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
          Export markdown
        </h3>
        <pre className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto hide-scrollbar font-mono bg-white/5 rounded-xl p-3">
          {markdown}
        </pre>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all active:scale-95 ${
            copied
              ? 'bg-accent-green/20 text-accent-green'
              : 'bg-accent-green text-bg-primary'
          }`}
        >
          {copied ? (
            <>
              <CheckCircle size={20} />
              Copie !
            </>
          ) : (
            <>
              <Copy size={20} />
              Copier le bilan
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="py-4 px-5 rounded-2xl bg-white/10 text-text-primary font-bold text-base active:scale-95 transition-transform"
        >
          <Share2 size={20} />
        </button>
      </div>
    </div>
  );
}
