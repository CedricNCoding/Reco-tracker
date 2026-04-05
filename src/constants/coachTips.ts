import { SessionType } from '@/lib/types';

// ===== Tips par séance (affichés dans DailyPlan) =====
export interface SessionTip {
  icon: string;
  text: string;
  type: 'info' | 'warning' | 'technique';
}

export const SESSION_TIPS: Partial<Record<SessionType, SessionTip[]>> = {
  haut_a: [
    { icon: '🔥', text: 'Pre-activation pecs : 2 series legeres d\'ecartes poulie (12-15 reps, loin de l\'echec) avant le DC.', type: 'technique' },
    { icon: '⏸️', text: 'DC : pause 1-2s barre sur la poitrine (sans rebond) — force les pecs a initier le mouvement.', type: 'technique' },
    { icon: '🕐', text: 'Tempo 3-0-1-0 sur les isolations bras (curls, extensions) — maximise le temps sous tension.', type: 'technique' },
  ],
  bas: [
    { icon: '📈', text: 'Pousse la progression sur le hack squat et le RDL — ce sont tes piliers jambes.', type: 'info' },
    { icon: '🦵', text: 'Mobilite hanches/chevilles en fin de seance — non optionnel a 43 ans.', type: 'info' },
  ],
  haut_b: [
    { icon: '⚠️', text: 'Journee la plus exigeante : muscu + brasse le soir. Ne pas sous-manger !', type: 'warning' },
    { icon: '🍌', text: 'Snack proteine + glucides entre muscu et piscine (banane + shaker whey).', type: 'warning' },
    { icon: '😴', text: 'Vise 7h30+ de sommeil cette nuit — nuit de recuperation cle.', type: 'warning' },
    { icon: '🕐', text: 'Tempo 3-0-1-0 sur les isolations biceps — maximise le stimulus en deficit.', type: 'technique' },
    { icon: '💪', text: 'Avant-bras : wrist curls (2x20) ou farmer carry lourd (30-40 m) en fin de seance.', type: 'technique' },
  ],
  epaules: [
    { icon: '🆕', text: 'OHP : commence leger (12-14 kg) pour ancrer le pattern moteur. Progression : bas de fourchette → haut → +1 kg.', type: 'technique' },
    { icon: '💤', text: 'Seance volontairement plus legere — permet la recuperation apres le mercredi.', type: 'info' },
  ],
  haut_d: [
    { icon: '🔄', text: 'Seance hybride pecs/dos — SS3 = dos (tirage + row) pour la 2e frequence dos/semaine.', type: 'info' },
    { icon: '🕐', text: 'Tempo 3-0-1-0 sur les isolations bras (curls, triceps corde).', type: 'technique' },
  ],
  run: [
    { icon: '🍌', text: 'Petit-dej leger 30-45 min avant (banane + cafe). Petit-dej complet apres dans l\'heure.', type: 'info' },
    { icon: '💧', text: '0.3-0.5L d\'eau avant de partir. Hydrate-toi bien apres.', type: 'info' },
  ],
  natation: [
    { icon: '🍌', text: 'Snack 60-90 min avant : banane + shaker whey, ou pain complet + jambon + fruit.', type: 'info' },
    { icon: '🍽️', text: 'Apres la piscine : dine normalement, focus proteines.', type: 'info' },
  ],
};

// ===== Tips par exercice (affichés dans ExerciseCard pendant le SessionRunner) =====
export interface ExerciseTip {
  text: string;
  type: 'progression' | 'technique' | 'safety';
}

export const EXERCISE_TIPS: Record<string, ExerciseTip[]> = {
  'Developpe couche barre': [
    { text: 'Progression : quand tu fais 4x6 → augmente de 2.5 kg. Si tu cales a 4 reps sur la derniere serie, c\'est normal.', type: 'progression' },
    { text: 'Pause 1-2s barre sur la poitrine, pas de rebond. Ca force les pecs a initier.', type: 'technique' },
    { text: 'Series de montee : barre vide → 50% → 75% avant la charge de travail.', type: 'safety' },
  ],
  'Tractions pronation (lestees)': [
    { text: 'Commence au poids de corps si 8 reps ne passent pas propres. Des que 4x8 passe → +2.5 kg (ceinture lestee).', type: 'progression' },
    { text: 'Tirage complet : descends bras tendus, remonte menton au-dessus de la barre.', type: 'technique' },
  ],
  'Developpe militaire halteres assis': [
    { text: 'Commence leger (12-14 kg) pour ancrer le pattern. Progression : bas de fourchette → haut → +1 kg par haltere.', type: 'progression' },
    { text: 'Coudes a 45° (pas a 90°) pour proteger les epaules.', type: 'safety' },
  ],
  'Hack squat ou presse': [
    { text: 'Pilier jambes : pousse la progression en force. Amplitude complete a chaque rep.', type: 'progression' },
    { text: 'Series de montee : charge legere → 50% → 75% avant la charge de travail.', type: 'safety' },
  ],
  'Romanian deadlift': [
    { text: 'Pousse la progression en force sur le RDL — pilier ischios.', type: 'progression' },
    { text: 'Garde le dos plat, ne descends pas plus bas que mi-tibia. Sens l\'etirement dans les ischios.', type: 'technique' },
  ],
  'Developpe incline machine/halteres': [
    { text: 'Pilier pecs vendredi : vise la progression reguliere. Amplitude complete.', type: 'progression' },
    { text: 'Series de montee : charge legere → 50% → 75%.', type: 'safety' },
  ],
  'Face pull': [
    { text: 'Prehab NON NEGOCIABLE — protege la coiffe des rotateurs, surtout avec du pressing lourd.', type: 'safety' },
    { text: 'Tire vers le visage, coudes hauts, squeeze les omoplates.', type: 'technique' },
  ],
  'Rotations externes': [
    { text: 'Prehab NON NEGOCIABLE — coiffe des rotateurs vulnerable apres 40 ans.', type: 'safety' },
    { text: 'Leger et controle. Coude colle au corps, rotation lente.', type: 'technique' },
  ],
};

// ===== Tips généraux 40+ (affichés dans la page Aujourd'hui) =====
export const GENERAL_TIPS = [
  'Echauffement 5-10 min minimum (rameur, velo, ou series progressives). Ne jamais attaquer les piliers a froid.',
  'Series de montee avant chaque pilier : barre vide → 50% → 75% de la charge de travail.',
  'Prehab (face pulls + rotations externes) non negociable — coiffe des rotateurs vulnerable apres 40 ans.',
  'Sommeil : vise 7h30-8h. Coucher 21h30-22h max. C\'est le levier #1 de la recomposition.',
  'Tendons : si gene articulaire (coude, epaule, genou), reduis la charge immediatement. Ne pousse pas a travers.',
  'Deload toutes les 4-5 semaines : -1 serie (sauf piliers), -10-15% charge piliers, 1 semaine.',
];

// ===== Suppléments (affichés dans la page nutrition/settings) =====
export const SUPPLEMENTS = [
  { name: 'Collagene hydrolyse', dose: '10-15 g/jour + vitamine C', timing: '30-60 min avant la seance', why: 'Sante tendineuse et articulaire (40+)' },
  { name: 'Vitamine D', dose: '2000-4000 UI/jour', timing: 'Avec un repas', why: 'Souvent en carence, impact recuperation et humeur' },
  { name: 'Omega-3', dose: '2-3 g/jour', timing: 'Avec un repas', why: 'Anti-inflammatoire, protege les articulations' },
  { name: 'Creatine monohydrate', dose: '3-5 g/jour', timing: 'Tous les jours', why: 'Force + masse musculaire, benefice amplifie apres 40 ans' },
  { name: 'Magnesium bisglycinate', dose: '200-400 mg', timing: 'Le soir', why: 'Ameliore sommeil et recuperation musculaire' },
];
