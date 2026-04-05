'use client';

import { useState } from 'react';
import { Upload, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { ProgramUpdate, SessionConfig, Superset } from '@/lib/types';
import { saveLocalProgram } from '@/lib/sync';
import { syncToServer } from '@/lib/sync';

const EXAMPLE_FORMAT = `{
  "version": "2026-04-06",
  "source": "claude-adjustment",
  "notes": "Ajustement semaine 2 : +2.5 kg DC, repos allonge sur piliers",
  "sessions": [
    {
      "day": "lundi",
      "session_type": "haut_a",
      "title": "Haut A — Pecs + Triceps + Biceps",
      "supersets": [
        {
          "id": "ss1",
          "label": "Pilier",
          "exercise_a": { "name": "Developpe couche barre", "reps": "4-6" },
          "exercise_b": { "name": "Pompes lestees", "reps": "12-15" },
          "sets": 4,
          "rest_seconds": 180
        }
      ]
    }
  ]
}`;

export default function ProgramImport() {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [showFormat, setShowFormat] = useState(false);

  function validate(data: unknown): data is ProgramUpdate {
    if (!data || typeof data !== 'object') return false;
    const d = data as Record<string, unknown>;
    if (!d.version || !d.sessions || !Array.isArray(d.sessions)) return false;
    for (const session of d.sessions as SessionConfig[]) {
      if (!session.day || !session.session_type || !session.title || !Array.isArray(session.supersets)) return false;
      for (const ss of session.supersets) {
        if (!ss.id || !ss.exercise_a || typeof ss.sets !== 'number' || typeof ss.rest_seconds !== 'number') return false;
      }
    }
    return true;
  }

  async function handleImport() {
    setStatus('idle');
    setErrorMsg('');

    let parsed: unknown;
    try {
      // Try to extract JSON from Claude's response (might be in a code block)
      let jsonStr = input.trim();
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }
      parsed = JSON.parse(jsonStr);
    } catch {
      setStatus('error');
      setErrorMsg('JSON invalide. Verifie le format (voir l\'exemple ci-dessous).');
      return;
    }

    if (!validate(parsed)) {
      setStatus('error');
      setErrorMsg('Format incorrect. Il manque des champs obligatoires (version, sessions, supersets...).');
      return;
    }

    // Ensure source is set
    const program: ProgramUpdate = {
      ...parsed,
      source: parsed.source || 'claude-adjustment',
    };

    // Save locally
    saveLocalProgram(program);

    // Sync to server
    await syncToServer();

    setStatus('success');
    setInput('');
  }

  return (
    <div className="space-y-3">
      <div className="bg-bg-card rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-2">
          Importer un programme
        </h3>
        <p className="text-xs text-text-secondary mb-3">
          Colle ici le JSON que Claude t'a genere apres analyse de ton bilan du dimanche.
        </p>

        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); setStatus('idle'); }}
          placeholder='Colle le JSON ici... (ou le bloc ```json...``` de Claude)'
          rows={8}
          className="w-full bg-white/5 rounded-xl py-3 px-4 text-xs font-mono outline-none focus:ring-2 focus:ring-accent-green/50 resize-none"
        />

        {status === 'error' && (
          <div className="flex items-start gap-2 mt-2 text-accent-red text-xs">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {status === 'success' && (
          <div className="flex items-center gap-2 mt-2 text-accent-green text-xs">
            <CheckCircle size={14} />
            <span>Programme importe et synchronise !</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleImport}
          disabled={!input.trim()}
          className={`w-full mt-3 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all active:scale-95 ${
            input.trim()
              ? 'bg-accent-green text-bg-primary'
              : 'bg-white/10 text-text-secondary'
          }`}
        >
          <Upload size={18} />
          Importer le programme
        </button>
      </div>

      {/* Format help */}
      <div className="bg-bg-card rounded-2xl p-4">
        <button
          type="button"
          onClick={() => setShowFormat(!showFormat)}
          className="w-full flex items-center gap-2 text-sm font-semibold text-text-secondary"
        >
          <Info size={14} />
          <span>Format JSON attendu</span>
          <span className="ml-auto text-xs">{showFormat ? '▼' : '▶'}</span>
        </button>
        {showFormat && (
          <pre className="mt-3 text-[10px] text-text-secondary whitespace-pre-wrap font-mono bg-white/5 rounded-xl p-3 max-h-64 overflow-y-auto hide-scrollbar">
            {EXAMPLE_FORMAT}
          </pre>
        )}
      </div>

      {/* Workflow */}
      <div className="bg-bg-card rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
          Comment ca marche
        </h3>
        <div className="space-y-2 text-xs text-text-secondary">
          <div className="flex gap-2">
            <span className="text-accent-green font-bold">1.</span>
            <span>Dimanche soir, va dans <strong className="text-text-primary">Bilan</strong> et copie le bilan</span>
          </div>
          <div className="flex gap-2">
            <span className="text-accent-green font-bold">2.</span>
            <span>Colle-le dans une conversation Claude avec le prompt :</span>
          </div>
          <div className="bg-white/5 rounded-lg p-2 text-[11px] font-mono ml-5">
            Voici mon bilan de la semaine. Analyse-le et propose un programme ajuste au format JSON compatible avec mon app Recomp Tracker. Garde la structure : sessions[] avec day, session_type, title, supersets[] avec id, label, exercise_a, exercise_b, sets, rest_seconds.
          </div>
          <div className="flex gap-2">
            <span className="text-accent-green font-bold">3.</span>
            <span>Claude te renvoie un JSON ajuste</span>
          </div>
          <div className="flex gap-2">
            <span className="text-accent-green font-bold">4.</span>
            <span>Colle-le ici et clique <strong className="text-text-primary">Importer</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
