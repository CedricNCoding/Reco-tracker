import { DayNutrition, DayOfWeek, DayType } from '@/lib/types';

export const DEFAULT_MACROS = {
  calories: '2 200-2 350 kcal',
  protein: '160-170 g',
  fat: '65-75 g',
  carbs: '200-230 g',
};

export const DAY_NUTRITION: Record<DayType, DayNutrition> = {
  training: {
    day_type: 'training',
    label: 'Jour muscu',
    calories: '~2 300 kcal',
    protein: '160-170 g',
    carbs: '220-250 g',
    fat: '65-75 g',
    tips: [
      'Glucides concentres autour de la seance (dej + collation post)',
      'Petit-dej proteine dans les 60-90 min apres la seance',
      '3L d\'eau minimum',
    ],
  },
  double: {
    day_type: 'double',
    label: 'Mercredi — Muscu + Brasse',
    calories: '~2 400-2 500 kcal',
    protein: '160-170 g',
    carbs: '250-280 g',
    fat: '65-75 g',
    tips: [
      'Journee la plus exigeante — ne pas sous-manger',
      'Snack proteine + glucides entre muscu et piscine',
      'Banane + shaker whey 60-90 min avant la brasse',
      'Viser 7h30+ de sommeil la nuit suivante',
      '3-3.5L d\'eau',
    ],
  },
  run: {
    day_type: 'run',
    label: 'Dimanche — Run 5 km',
    calories: '~2 200 kcal',
    protein: '160-170 g',
    carbs: '200-220 g',
    fat: '65-75 g',
    tips: [
      'Petit-dej leger 30-45 min avant le run (banane + cafe)',
      'Petit-dej complet apres le run dans l\'heure',
      'Pas besoin de surcompenser (~300 kcal brulees)',
      '0.3-0.5L d\'eau avant de partir',
    ],
  },
  rest: {
    day_type: 'rest',
    label: 'Samedi — Repos',
    calories: '~2 100 kcal',
    protein: '160-170 g',
    carbs: '180-200 g',
    fat: '65-75 g',
    tips: [
      'Reduire legerement les glucides',
      'Remplacer par plus de legumes',
      'Proteines et lipides identiques',
      '2.5L d\'eau minimum',
    ],
  },
};

// Map day of week to nutrition type
export const DAY_TO_NUTRITION_TYPE: Record<DayOfWeek, DayType> = {
  lundi: 'training',
  mardi: 'training',
  mercredi: 'double',
  jeudi: 'training',
  vendredi: 'training',
  samedi: 'rest',
  dimanche: 'run',
};

export const PROTEIN_MEALS = [
  { label: 'Petit-dej', target: '~40 g' },
  { label: 'Dejeuner', target: '~40 g' },
  { label: 'Collation', target: '~40 g' },
  { label: 'Diner', target: '~40 g' },
];

// Helper: get today's nutrition
export function getTodayNutrition(): DayNutrition {
  const days: DayOfWeek[] = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const today = days[new Date().getDay()];
  const dayType = DAY_TO_NUTRITION_TYPE[today];
  return DAY_NUTRITION[dayType];
}
