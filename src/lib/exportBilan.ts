import { DailyEntry, WeeklySummary, DayOfWeek } from './types';
import { WEEK_SCHEDULE, SESSION_TYPE_LABELS } from '@/constants/program';
import { format, parseISO, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  calculateAvgWeight,
  calculateAvgSleep,
  calculateAvgEnergy,
  calculateProteinAdherence,
} from './calculations';

const DIAGNOSIS_LABELS: Record<WeeklySummary['diagnosis'], string> = {
  recomp_ok: '✅ Recomp en cours',
  stagnation: '⚠️ Stagnation',
  force_loss: '🚨 Perte de force',
  unwanted_gain: '��� Prise non voulue',
};

const DIAGNOSIS_DETAILS: Record<WeeklySummary['diagnosis'], string> = {
  recomp_ok: 'Poids stable ou en legere baisse, force maintenue — continuer ainsi.',
  stagnation: 'Rien ne bouge depuis plusieurs semaines — envisager un tracking calories plus precis.',
  force_loss: 'Poids baisse trop vite, risque de perte musculaire — augmenter legerement les calories.',
  unwanted_gain: 'Poids en hausse non souhaitee — verifier les calories et reduire legerement.',
};

export interface BilanData {
  weekStart: Date;
  weekEnd: Date;
  entries: DailyEntry[];
  prevEntries: DailyEntry[];
  summary: WeeklySummary;
}

export function getDayEntryForWeek(entries: DailyEntry[], dayOfWeek: DayOfWeek, weekStart: Date): DailyEntry | null {
  const dayIndex: Record<DayOfWeek, number> = {
    lundi: 0, mardi: 1, mercredi: 2, jeudi: 3, vendredi: 4, samedi: 5, dimanche: 6,
  };
  const targetDate = format(addDays(weekStart, dayIndex[dayOfWeek]), 'yyyy-MM-dd');
  return entries.find((e) => e.id === targetDate) || null;
}

export function generateBilanMarkdown(data: BilanData): string {
  const { weekStart, weekEnd, entries, prevEntries, summary } = data;

  const startStr = format(weekStart, 'd MMMM', { locale: fr });
  const endStr = format(weekEnd, 'd MMMM yyyy', { locale: fr });

  const weights = entries.filter((e) => e.weight !== null).map((e) => e.weight!);
  const minWeight = weights.length > 0 ? Math.min(...weights) : null;
  const maxWeight = weights.length > 0 ? Math.max(...weights) : null;
  const prevAvgWeight = calculateAvgWeight(prevEntries);

  const trendSymbol = summary.weight_trend === 'up' ? '↗' : summary.weight_trend === 'down' ? '↘' : '→';

  // Session detail per day
  const sessionDetails = WEEK_SCHEDULE.map((day) => {
    const entry = getDayEntryForWeek(entries, day.day, weekStart);
    const done = entry?.session_done;
    const label = day.session_type === 'repos'
      ? 'Repos'
      : entry?.session_type
        ? SESSION_TYPE_LABELS[entry.session_type]
        : day.label.split('—')[0].trim();
    const symbol = day.session_type === 'repos' ? '💤' : done ? '✅' : '❌';
    const dayLabel = day.day.charAt(0).toUpperCase() + day.day.slice(1, 3);
    return `${dayLabel} [${label} ${symbol}]`;
  }).join(' ');

  // Natation & run
  const merEntry = getDayEntryForWeek(entries, 'mercredi', weekStart);
  const dimEntry = getDayEntryForWeek(entries, 'dimanche', weekStart);
  const natation = merEntry?.session_done && merEntry?.session_type === 'haut_b' ? '✅' : '❌';
  const run = dimEntry?.session_done && dimEntry?.session_type === 'run' ? '✅' : '❌';

  // Protein sub-days
  const proteinSubDays = entries
    .filter((e) => e.protein_meals.filter(Boolean).length < 4 && e.protein_meals.some(Boolean))
    .map((e) => {
      const count = e.protein_meals.filter(Boolean).length;
      const dayName = format(parseISO(e.id), 'EEEE', { locale: fr });
      return `${dayName} (${count}/4)`;
    });

  // Sleep worst night
  const sleepEntries = entries.filter((e) => e.sleep_hours !== null);
  const worstSleep = sleepEntries.length > 0
    ? sleepEntries.reduce((worst, e) => (e.sleep_hours! < worst.sleep_hours! ? e : worst))
    : null;

  // Waist
  const waistEntries = entries.filter((e) => e.waist_cm !== null);
  const lastWaist = waistEntries.length > 0 ? waistEntries[waistEntries.length - 1] : null;
  const prevWaistEntries = prevEntries.filter((e) => e.waist_cm !== null);
  const prevWaist = prevWaistEntries.length > 0 ? prevWaistEntries[prevWaistEntries.length - 1] : null;

  // Notes
  const allNotes = entries
    .filter((e) => e.notes)
    .map((e) => `- ${format(parseISO(e.id), 'EEEE', { locale: fr })} : ${e.notes}`)
    .join('\n');

  const muscu = entries.filter((e) =>
    e.session_done && e.session_type && !['natation', 'run', 'repos'].includes(e.session_type)
  ).length;

  return `## Bilan Semaine du ${startStr} au ${endStr}

### Poids
- Poids moyen : ${summary.avg_weight !== null ? `${summary.avg_weight} kg` : 'N/A'} (semaine precedente : ${prevAvgWeight !== null ? `${prevAvgWeight} kg` : 'N/A'})
- Tendance : ${trendSymbol}
- Min/Max de la semaine : ${minWeight !== null ? `${minWeight}` : 'N/A'} / ${maxWeight !== null ? `${maxWeight}` : 'N/A'}

### Seances
- Realisees : ${muscu}/5 muscu | Natation : ${natation} | Run : ${run}
- Detail : ${sessionDetails}
${entries.filter((e) => e.session_duration_min).map((e) => `- ${format(parseISO(e.id), 'EEEE', { locale: fr })} : ${e.session_duration_min} min`).join('\n')}

### Nutrition
- Proteines 4/4 : ${summary.protein_adherence} jours sur 7
${proteinSubDays.length > 0 ? `- Jours sous-objectif : ${proteinSubDays.join(', ')}` : '- Tous les jours a 4/4 ✅'}

### Recuperation
- Sommeil moyen : ${summary.avg_sleep !== null ? `${summary.avg_sleep} h` : 'N/A'}
- Energie moyenne : ${summary.avg_energy !== null ? `${summary.avg_energy}/5` : 'N/A'}
${worstSleep ? `- Pire nuit : ${format(parseISO(worstSleep.id), 'EEEE', { locale: fr })} (${worstSleep.sleep_hours} h)` : ''}

### Tour de taille
${lastWaist ? `- Derniere mesure : ${lastWaist.waist_cm} cm (${lastWaist.id})` : '- Aucune mesure cette semaine'}
${prevWaist ? `- Precedente : ${prevWaist.waist_cm} cm (${prevWaist.id})` : ''}

### Diagnostic auto
- ${DIAGNOSIS_LABELS[summary.diagnosis]}
- Detail : ${DIAGNOSIS_DETAILS[summary.diagnosis]}

### Questions / ressentis
${allNotes || '- Aucune note cette semaine'}
`;
}
