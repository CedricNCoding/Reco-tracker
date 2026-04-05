'use client';

import { useState, useEffect } from 'react';
import { Settings, RefreshCw, CheckCircle, AlertTriangle, Trash2, Database, Download, Upload, Moon, Palette } from 'lucide-react';
import ProgramImport from '@/components/ProgramImport';
import { syncToServer, pullFromServer, getLastSyncStatus, getLocalCustomProgram } from '@/lib/sync';
import { ProgramUpdate } from '@/lib/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { exportEntriesToCsv, exportSetLogsToCsv, downloadCsv } from '@/lib/csvExport';
import { getAllEntries } from '@/lib/storage';
import { getAllSetLogs } from '@/lib/setLogStorage';
import { parseWeightCsv, importWeightData, parseExerciseCsv, importExerciseData } from '@/lib/bulkImport';

export default function SettingsPage() {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [syncStatus, setSyncStatus] = useState<ReturnType<typeof getLastSyncStatus>>(null);
  const [customProgram, setCustomProgram] = useState<ProgramUpdate | null>(null);
  const [amoled, setAmoled] = useState(false);
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState<string | null>(null);
  const [importType, setImportType] = useState<'weight' | 'exercise'>('weight');

  useEffect(() => {
    setSyncStatus(getLastSyncStatus());
    setCustomProgram(getLocalCustomProgram());
    setAmoled(localStorage.getItem('recomp-amoled') === 'true');
  }, []);

  function toggleAmoled() {
    const next = !amoled;
    setAmoled(next);
    localStorage.setItem('recomp-amoled', String(next));
    document.documentElement.style.setProperty('--bg-primary', next ? '#000000' : '#0F1117');
    document.body.style.background = next ? '#000000' : '#0F1117';
  }

  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);
    const result = await syncToServer();
    setSyncing(false);
    setSyncResult({ ok: result.success, msg: result.success ? `Sync OK — ${result.entriesCount} entrees` : `Erreur : ${result.error}` });
    setSyncStatus(getLastSyncStatus());
  }

  async function handlePull() {
    setSyncing(true);
    setSyncResult(null);
    const result = await pullFromServer();
    setSyncing(false);
    setSyncResult({ ok: result.success, msg: result.success ? `Pull OK — ${result.entriesCount} entrees` : `Erreur : ${result.error}` });
    setSyncStatus(getLastSyncStatus());
  }

  function handleExportEntries() {
    const entries = Object.values(getAllEntries()).sort((a, b) => a.id.localeCompare(b.id));
    const csv = exportEntriesToCsv(entries);
    downloadCsv(csv, `recomp-entries-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  }

  function handleExportSetLogs() {
    const logs = Object.values(getAllSetLogs()).sort((a, b) => a.date.localeCompare(b.date) || a.set_number - b.set_number);
    const csv = exportSetLogsToCsv(logs);
    downloadCsv(csv, `recomp-charges-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  }

  function handleBulkImport() {
    setImportResult(null);
    if (importType === 'weight') {
      const data = parseWeightCsv(importText);
      if (data.length === 0) { setImportResult('Aucune donnee valide trouvee. Format : date,poids (une ligne par jour)'); return; }
      const count = importWeightData(data);
      setImportResult(`${count} entrees de poids importees sur ${data.length} lignes.`);
    } else {
      const logs = parseExerciseCsv(importText);
      if (logs.length === 0) { setImportResult('Aucune donnee valide. Format : date,exercice,charge,reps[,set]'); return; }
      const count = importExerciseData(logs);
      setImportResult(`${count} logs de charges importes.`);
    }
    setImportText('');
  }

  function handleResetProgram() {
    if (confirm('Remettre le programme par defaut ?')) {
      localStorage.removeItem('recomp-tracker-custom-program');
      setCustomProgram(null);
      syncToServer();
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-3">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <Settings size={22} className="text-accent-green" />
        Reglages
      </h1>

      {/* AMOLED toggle */}
      <div className="bg-bg-card rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette size={16} className="text-accent-green" />
            <div>
              <p className="text-sm font-semibold">Mode AMOLED</p>
              <p className="text-[10px] text-text-secondary">Fond pur noir pour economiser la batterie</p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleAmoled}
            className={`w-14 h-8 rounded-full flex items-center transition-colors ${
              amoled ? 'bg-accent-green justify-end' : 'bg-white/10 justify-start'
            }`}
          >
            <div className={`w-7 h-7 rounded-full mx-0.5 ${amoled ? 'bg-white' : 'bg-white/20'}`} />
          </button>
        </div>
      </div>

      {/* Sync section */}
      <div className="bg-bg-card rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-accent-green" />
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Synchronisation</h3>
        </div>
        {syncStatus && (
          <p className="text-xs text-text-secondary">
            Dernier sync : {syncStatus.lastSync ? format(new Date(syncStatus.lastSync), 'dd/MM HH:mm', { locale: fr }) : 'jamais'} — {syncStatus.status === 'ok' ? '✅' : '⚠️'}
          </p>
        )}
        <div className="flex gap-2">
          <button type="button" onClick={handleSync} disabled={syncing}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-green text-bg-primary font-bold text-sm active:scale-95 transition-transform disabled:opacity-50">
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} /> Push
          </button>
          <button type="button" onClick={handlePull} disabled={syncing}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 text-text-primary font-bold text-sm active:scale-95 transition-transform disabled:opacity-50">
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} /> Pull
          </button>
        </div>
        {syncResult && (
          <div className={`flex items-center gap-2 text-xs ${syncResult.ok ? 'text-accent-green' : 'text-accent-red'}`}>
            {syncResult.ok ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
            <span>{syncResult.msg}</span>
          </div>
        )}
      </div>

      {/* CSV Export */}
      <div className="bg-bg-card rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Download size={16} className="text-accent-green" />
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Export CSV</h3>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={handleExportEntries}
            className="flex-1 py-3 rounded-xl bg-white/10 text-text-primary font-bold text-xs active:scale-95 transition-transform">
            Check-ins
          </button>
          <button type="button" onClick={handleExportSetLogs}
            className="flex-1 py-3 rounded-xl bg-white/10 text-text-primary font-bold text-xs active:scale-95 transition-transform">
            Charges
          </button>
        </div>
      </div>

      {/* Bulk Import */}
      <div className="bg-bg-card rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Upload size={16} className="text-accent-amber" />
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Import donnees</h3>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setImportType('weight')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${importType === 'weight' ? 'bg-accent-green/20 text-accent-green' : 'bg-white/5 text-text-secondary'}`}>
            Poids
          </button>
          <button type="button" onClick={() => setImportType('exercise')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${importType === 'exercise' ? 'bg-accent-green/20 text-accent-green' : 'bg-white/5 text-text-secondary'}`}>
            Charges
          </button>
        </div>
        <p className="text-[10px] text-text-secondary">
          {importType === 'weight'
            ? 'Format : date,poids — ex: 2026-04-01,82.5 (ou DD/MM/YYYY)'
            : 'Format : date,exercice,charge,reps[,set] — ex: 2026-04-01,Developpe couche barre,75,6,1'}
        </p>
        <textarea
          value={importText}
          onChange={(e) => { setImportText(e.target.value); setImportResult(null); }}
          placeholder="Colle tes donnees ici..."
          rows={4}
          className="w-full bg-white/5 rounded-xl py-3 px-4 text-xs font-mono outline-none focus:ring-2 focus:ring-accent-green/50 resize-none"
        />
        <button type="button" onClick={handleBulkImport} disabled={!importText.trim()}
          className={`w-full py-3 rounded-xl font-bold text-sm active:scale-95 transition-all ${importText.trim() ? 'bg-accent-amber text-bg-primary' : 'bg-white/10 text-text-secondary'}`}>
          Importer
        </button>
        {importResult && <p className="text-xs text-accent-green">{importResult}</p>}
      </div>

      {/* Custom program */}
      {customProgram && (
        <div className="bg-bg-card rounded-2xl p-4 space-y-2">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Programme actif</h3>
          <div className="text-xs text-text-secondary space-y-1">
            <p>Version : <span className="text-text-primary font-medium">{customProgram.version}</span></p>
            <p>Source : <span className="text-text-primary font-medium">{customProgram.source}</span></p>
            {customProgram.notes && <p>Notes : {customProgram.notes}</p>}
            <p>{customProgram.sessions.length} seances</p>
          </div>
          <button type="button" onClick={handleResetProgram} className="flex items-center gap-2 text-xs text-accent-red mt-2">
            <Trash2 size={12} /> Remettre le programme par defaut
          </button>
        </div>
      )}

      {/* Program import */}
      <ProgramImport />
    </div>
  );
}
