import { generateSevenDayMealPlan } from './mealPlanGenerator';
import { SevenDayMealPlan } from '@/types';

export interface QuestionnaireInput {
  name: string;
  email: string;
  password?: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  heightCm: number;
  currentWeight: number;
  targetWeight: number;
  trainingDaysPerWeek: number; // 1 to 5
  bodyCompositionScale: number; // 1-6
  primaryGoalScale: number;     // 1-6
  activityLevelScale: number;   // 1-6
  experienceScale: number;      // 1-6
  stressScale: number;          // 1-6
  sleepScale: number;           // 1-6
  dietDisciplineScale: number;  // 1-6
  priorityMuscleGroup?: string; // 'BALANCED', 'CHEST', 'BACK', 'SHOULDERS', 'ARMS', 'LEGS', 'CORE'
  avoidedMuscleArea?: string;   // 'NONE', 'HEAVY_SQUATS', 'HEAVY_DEADLIFTS', 'DIRECT_SHOULDERS', 'DIRECT_ARMS'
  foodPreferences?: string;     // 'BALANCED', 'MEDITERRANEAN', 'HIGH_PROTEIN_LOW_CARB', 'PESCATARIAN', 'VEGETARIAN', 'BODYBUILDING_PREP'
  avoidedIngredients?: string[]; // IDs like 'pork', 'peanuts', etc.
  mealsPerDay?: number;         // 2 to 6
  mealTiming?: string;
  snackingHabits?: string;
}

export interface GeneratedProgramResult {
  dailyCaloriesTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
  waterTargetMl: number;
  aiSynthesisSummary: string;
  recommendedSplitName: string;
  sevenDayMealPlan: SevenDayMealPlan;
  templates: {
    title: string;
    description: string;
    category: string;
    estimatedDurationMinutes: number;
    exercises: {
      exerciseId: string;
      targetSets: number;
      repRange: string;
      targetRpe: number;
      restSeconds: number;
      notes: string;
      startingWeightKg: number;
    }[];
  }[];
}

/**
 * Calculates a personalized starting working weight (kg) based on bodyweight, gender, and experience scale (1-6)
 */
export function calculateStartingWeight(
  exerciseId: string,
  gender: 'MALE' | 'FEMALE' | 'OTHER',
  currentWeight: number,
  experienceScale: number
): number {
  const isFemale = gender === 'FEMALE';
  const expRatio = Math.max(1, Math.min(6, experienceScale)) / 6;

  let baseWeight = 20;

  switch (exerciseId) {
    case 'ex-1': // Barbell Bench Press
      baseWeight = isFemale
        ? 15 + currentWeight * 0.3 * expRatio
        : 35 + currentWeight * 0.65 * expRatio;
      break;
    case 'ex-2': // Incline Dumbbell Press
      baseWeight = isFemale
        ? 4 + currentWeight * 0.12 * expRatio
        : 10 + currentWeight * 0.22 * expRatio;
      break;
    case 'ex-3': // Cable Flyes
      baseWeight = isFemale
        ? 5 + currentWeight * 0.1 * expRatio
        : 10 + currentWeight * 0.2 * expRatio;
      break;
    case 'ex-4': // Barbell Back Squat
      baseWeight = isFemale
        ? 20 + currentWeight * 0.45 * expRatio
        : 40 + currentWeight * 0.85 * expRatio;
      break;
    case 'ex-5': // Romanian Deadlift (RDL)
      baseWeight = isFemale
        ? 20 + currentWeight * 0.4 * expRatio
        : 40 + currentWeight * 0.75 * expRatio;
      break;
    case 'ex-6': // Bulgarian Split Squat
      baseWeight = isFemale
        ? 4 + currentWeight * 0.1 * expRatio
        : 8 + currentWeight * 0.2 * expRatio;
      break;
    case 'ex-7': // Standing Calf Raise
      baseWeight = isFemale
        ? 25 + currentWeight * 0.35 * expRatio
        : 45 + currentWeight * 0.6 * expRatio;
      break;
    case 'ex-8': // Lat Pulldown
      baseWeight = isFemale
        ? 20 + currentWeight * 0.35 * expRatio
        : 40 + currentWeight * 0.55 * expRatio;
      break;
    case 'ex-9': // Chest-Supported T-Bar Row
      baseWeight = isFemale
        ? 10 + currentWeight * 0.25 * expRatio
        : 25 + currentWeight * 0.5 * expRatio;
      break;
    case 'ex-10': // Seated Cable Row
      baseWeight = isFemale
        ? 20 + currentWeight * 0.3 * expRatio
        : 35 + currentWeight * 0.5 * expRatio;
      break;
    case 'ex-11': // Dumbbell Lateral Raise
      baseWeight = isFemale
        ? 2 + currentWeight * 0.05 * expRatio
        : 5 + currentWeight * 0.12 * expRatio;
      break;
    case 'ex-12': // Seated Dumbbell Shoulder Press
      baseWeight = isFemale
        ? 4 + currentWeight * 0.1 * expRatio
        : 12 + currentWeight * 0.22 * expRatio;
      break;
    case 'ex-13': // Face Pulls
      baseWeight = isFemale
        ? 10 + currentWeight * 0.15 * expRatio
        : 17.5 + currentWeight * 0.25 * expRatio;
      break;
    case 'ex-14': // Incline Dumbbell Bicep Curl
      baseWeight = isFemale
        ? 3 + currentWeight * 0.08 * expRatio
        : 8 + currentWeight * 0.15 * expRatio;
      break;
    case 'ex-15': // Triceps Rope Pushdown
      baseWeight = isFemale
        ? 10 + currentWeight * 0.18 * expRatio
        : 20 + currentWeight * 0.35 * expRatio;
      break;
    case 'ex-16': // Overhead Tricep Extension
      baseWeight = isFemale
        ? 6 + currentWeight * 0.12 * expRatio
        : 14 + currentWeight * 0.25 * expRatio;
      break;
    case 'ex-17': // Hanging Leg Raise
      return 0;
    default:
      baseWeight = 20;
  }

  const rounded = Math.round(baseWeight / 2.5) * 2.5;
  return Math.max(2.5, rounded);
}

/**
 * Calculates estimated duration in minutes for a given workout
 */
export function calculateWorkoutDuration(exercises: { targetSets: number; restSeconds: number }[]): number {
  if (!exercises || exercises.length === 0) return 45;
  const totalSeconds = exercises.reduce((acc, ex) => {
    return acc + ex.targetSets * (40 + ex.restSeconds);
  }, 360);
  return Math.max(35, Math.round(totalSeconds / 60));
}

export function synthesizeProgram(input: QuestionnaireInput): GeneratedProgramResult {
  const {
    age,
    gender,
    heightCm,
    currentWeight,
    targetWeight,
    trainingDaysPerWeek,
    primaryGoalScale,
    activityLevelScale,
    experienceScale,
    priorityMuscleGroup = 'BALANCED',
    avoidedMuscleArea = 'NONE',
  } = input;

  // 1. Calculate BMR (Mifflin-St Jeor)
  let bmr = 10 * currentWeight + 6.25 * heightCm - 5 * age;
  bmr += gender === 'MALE' ? 5 : -161;

  // 2. Activity Multiplier
  const activityMultipliers = [1.2, 1.28, 1.37, 1.48, 1.6, 1.75];
  const mult = activityMultipliers[Math.min(5, Math.max(0, activityLevelScale - 1))];
  const tdee = bmr * mult;

  // 3. Goal Calorie Offset
  const goalOffsets = [-600, -400, 0, +250, +450, +300];
  const offset = goalOffsets[Math.min(5, Math.max(0, primaryGoalScale - 1))];
  const dailyCaloriesTarget = Math.max(1400, Math.round(tdee + offset));

  // 4. Macro Calculation
  const proteinPerKg = primaryGoalScale <= 2 ? 2.3 : 2.0;
  const proteinTarget = Math.round(currentWeight * proteinPerKg);
  const fatsTarget = Math.round((dailyCaloriesTarget * 0.25) / 9);
  const remainingCals = dailyCaloriesTarget - (proteinTarget * 4 + fatsTarget * 9);
  const carbsTarget = Math.max(50, Math.round(remainingCals / 4));
  const waterTargetMl = Math.round(currentWeight * 42);

  // 5. Build Training Templates based on Days Available (1-5)
  const days = Math.min(5, Math.max(1, trainingDaysPerWeek));
  let recommendedSplitName = '';
  const rawTemplates: {
    title: string;
    description: string;
    category: string;
    exercises: {
      exerciseId: string;
      targetSets: number;
      repRange: string;
      targetRpe: number;
      restSeconds: number;
      notes: string;
    }[];
  }[] = [];

  const expRepRange = experienceScale <= 2 ? '10-12' : experienceScale <= 4 ? '8-10' : '6-8';
  const expSets = experienceScale <= 2 ? 3 : 4;
  const expRpe = experienceScale <= 2 ? 7.5 : 8.5;

  // Adapt exercises if user avoids certain movements
  const squatSubstitute = avoidedMuscleArea === 'HEAVY_SQUATS' ? 'ex-6' : 'ex-4';
  const deadliftSubstitute = avoidedMuscleArea === 'HEAVY_DEADLIFTS' ? 'ex-6' : 'ex-5';

  if (days === 1) {
    recommendedSplitName = 'Цяло тяло – Високоефективен протокол (1 ден)';
    rawTemplates.push({
      title: 'Цялостно базово натоварване (Full Body)',
      description: 'Максимално мускулно задействане, обхващащо всички основни кинетични вериги в една интензивна сесия.',
      category: 'FULL_BODY',
      exercises: [
        { exerciseId: squatSubstitute, targetSets: expSets, repRange: expRepRange, targetRpe: expRpe, restSeconds: 150, notes: 'Основно многоставно движение за квадрицепси и седалище.' },
        { exerciseId: 'ex-1', targetSets: expSets, repRange: expRepRange, targetRpe: expRpe, restSeconds: 120, notes: 'Хоризонтално избутване за гръдна мускулатура.' },
        { exerciseId: 'ex-8', targetSets: expSets, repRange: '8-12', targetRpe: 8.0, restSeconds: 90, notes: 'Вертикално дърпане за ширина на гърба.' },
        { exerciseId: deadliftSubstitute, targetSets: 3, repRange: '8-10', targetRpe: 8.0, restSeconds: 120, notes: 'Хинг движение за задна част на бедрата.' },
        { exerciseId: 'ex-11', targetSets: 3, repRange: '12-15', targetRpe: 9.0, restSeconds: 60, notes: 'Странично рамо за визуален V-профил.' },
        { exerciseId: 'ex-15', targetSets: 3, repRange: '10-12', targetRpe: 8.5, restSeconds: 60, notes: 'Изолиращо разгъване на трицепс на горен скрипец.' },
      ],
    });
  } else if (days === 2) {
    recommendedSplitName = 'Горна / Долна част с прогресивно претоварване (2 дни)';
    rawTemplates.push(
      {
        title: 'Горна част А – Хоризонтално и Вертикално бутане/дърпане',
        description: 'Цялостно развитие на торса: гърди, гръб, рамена и ръце.',
        category: 'UPPER',
        exercises: [
          { exerciseId: 'ex-1', targetSets: expSets, repRange: expRepRange, targetRpe: expRpe, restSeconds: 120, notes: 'Базово избутване от лег с лост.' },
          { exerciseId: 'ex-8', targetSets: expSets, repRange: '8-10', targetRpe: 8.5, restSeconds: 90, notes: 'Придърпване на горен скрипец за ширина.' },
          { exerciseId: 'ex-2', targetSets: 3, repRange: '8-12', targetRpe: 8.0, restSeconds: 90, notes: 'Полулег с дъмбели за горна част на гърдите.' },
          { exerciseId: 'ex-9', targetSets: 3, repRange: '8-10', targetRpe: 8.5, restSeconds: 90, notes: 'Т-образно гребане за плътност на гърба.' },
          { exerciseId: 'ex-11', targetSets: 3, repRange: '12-15', targetRpe: 9.0, restSeconds: 60, notes: 'Разтваряне на дъмбели встрани.' },
          { exerciseId: 'ex-14', targetSets: 3, repRange: '10-12', targetRpe: 8.5, restSeconds: 60, notes: 'Сгъване за бицепс от полулег с дъмбели.' },
        ],
      },
      {
        title: 'Долна част А – Клек и Задна кинетична верига',
        description: 'Фокус върху квадрицепси, задно бедро и коремна стабилност.',
        category: 'LOWER',
        exercises: [
          { exerciseId: squatSubstitute, targetSets: expSets, repRange: expRepRange, targetRpe: expRpe, restSeconds: 150, notes: 'Клек с лост на гръб с пълен контрол.' },
          { exerciseId: deadliftSubstitute, targetSets: expSets, repRange: '8-10', targetRpe: 8.0, restSeconds: 120, notes: 'Румънска тяга за задно бедро и глутеус.' },
          { exerciseId: 'ex-6', targetSets: 3, repRange: '10-12', targetRpe: 8.5, restSeconds: 90, notes: 'Български клек с дъмбели за унилатерален баланс.' },
          { exerciseId: 'ex-7', targetSets: 4, repRange: '12-15', targetRpe: 9.0, restSeconds: 60, notes: 'Повдигане на пръсти за прасци на машина.' },
          { exerciseId: 'ex-17', targetSets: 3, repRange: '12-15', targetRpe: 8.5, restSeconds: 60, notes: 'Повдигане на крака от вис за долна част на корема.' },
        ],
      }
    );
  } else if (days === 3) {
    recommendedSplitName = 'Бутане / Дърпане / Крака (Push / Pull / Legs - 3 дни)';
    rawTemplates.push(
      {
        title: 'Ден 1: Бутане (Гърди, Рамене, Трицепс)',
        description: 'Пълно натоварване на предната бутаща кинетична верига.',
        category: 'PUSH',
        exercises: [
          { exerciseId: 'ex-1', targetSets: expSets, repRange: expRepRange, targetRpe: expRpe, restSeconds: 120, notes: 'Избутване от лег с лост.' },
          { exerciseId: 'ex-2', targetSets: 3, repRange: '8-10', targetRpe: 8.0, restSeconds: 90, notes: 'Полулег с дъмбели за клавикуларна глава.' },
          { exerciseId: 'ex-12', targetSets: 3, repRange: '10-12', targetRpe: 8.0, restSeconds: 90, notes: 'Раменни преси с дъмбели от сед.' },
          { exerciseId: 'ex-11', targetSets: 4, repRange: '12-15', targetRpe: 9.0, restSeconds: 60, notes: 'Разтваряне на дъмбели встрани за странично рамо.' },
          { exerciseId: 'ex-15', targetSets: 3, repRange: '10-12', targetRpe: 8.5, restSeconds: 60, notes: 'Разгъване на трицепс на скрипец с въже.' },
          { exerciseId: 'ex-16', targetSets: 3, repRange: '12-15', targetRpe: 9.0, restSeconds: 60, notes: 'Френско разгъване зад глава с дъмбел.' },
        ],
      },
      {
        title: 'Ден 2: Дърпане (Ширина на гърба, Трапец и Бицепс)',
        description: 'Вертикални и хоризонтални ъгли на дърпане с директен фокус върху бицепс.',
        category: 'PULL',
        exercises: [
          { exerciseId: 'ex-8', targetSets: expSets, repRange: '8-10', targetRpe: 8.5, restSeconds: 90, notes: 'Придърпване на горен скрипец широк хват.' },
          { exerciseId: 'ex-9', targetSets: 3, repRange: '8-10', targetRpe: 8.0, restSeconds: 90, notes: 'Т-образно гребане за плътност на гърба.' },
          { exerciseId: 'ex-10', targetSets: 3, repRange: '10-12', targetRpe: 8.0, restSeconds: 75, notes: 'Придърпване на долен скрипец към корема.' },
          { exerciseId: 'ex-13', targetSets: 3, repRange: '15-20', targetRpe: 8.5, restSeconds: 60, notes: 'Фейс-пулс с въже за задно рамо и ротатори.' },
          { exerciseId: 'ex-14', targetSets: 4, repRange: '10-12', targetRpe: 9.0, restSeconds: 60, notes: 'Сгъване за бицепс от полулег с дъмбели.' },
        ],
      },
      {
        title: 'Ден 3: Крака (Квадрицепси, Задно бедро, Прасци)',
        description: 'Тежки клекове, бедрено разгъване и изолация за прасци.',
        category: 'LEGS',
        exercises: [
          { exerciseId: squatSubstitute, targetSets: expSets, repRange: expRepRange, targetRpe: expRpe, restSeconds: 150, notes: 'Клек с лост на гръб с контролирано темпо.' },
          { exerciseId: deadliftSubstitute, targetSets: 4, repRange: '8-10', targetRpe: 8.0, restSeconds: 120, notes: 'Румънска тяга за задна част на бедрата.' },
          { exerciseId: 'ex-6', targetSets: 3, repRange: '10-12', targetRpe: 8.5, restSeconds: 90, notes: 'Български клек с дъмбели.' },
          { exerciseId: 'ex-7', targetSets: 4, repRange: '12-15', targetRpe: 9.0, restSeconds: 60, notes: 'Повдигане на пръсти на калф машина.' },
          { exerciseId: 'ex-17', targetSets: 3, repRange: '12-15', targetRpe: 8.0, restSeconds: 60, notes: 'Повдигане на крака от вис на лост.' },
        ],
      }
    );
  } else if (days === 4) {
    recommendedSplitName = 'Горна / Долна / Горна / Долна част – Периодизиран сплит (4 дни)';
    rawTemplates.push(
      {
        title: 'Горна част А (Сила и Хоризонтално натоварване)',
        description: 'Тежки многоставни избутвания и гребания с прогресивно претоварване.',
        category: 'UPPER',
        exercises: [
          { exerciseId: 'ex-1', targetSets: 4, repRange: '6-8', targetRpe: 8.5, restSeconds: 120, notes: 'Избутване от лег с прав лост.' },
          { exerciseId: 'ex-9', targetSets: 4, repRange: '6-8', targetRpe: 8.5, restSeconds: 120, notes: 'Тежко Т-образно гребане с опора за гърди.' },
          { exerciseId: 'ex-12', targetSets: 3, repRange: '8-10', targetRpe: 8.0, restSeconds: 90, notes: 'Раменни преси с дъмбели от седеж.' },
          { exerciseId: 'ex-11', targetSets: 4, repRange: '12-15', targetRpe: 9.0, restSeconds: 60, notes: 'Разтваряне за странично рамо с дъмбели.' },
          { exerciseId: 'ex-15', targetSets: 3, repRange: '10-12', targetRpe: 8.5, restSeconds: 60, notes: 'Трицепс на горен скрипец с въже.' },
        ],
      },
      {
        title: 'Долна част А (Квадрицепси и Прасци)',
        description: 'Тежък клек с лост, съчетан с унилатерален обем за крака.',
        category: 'LOWER',
        exercises: [
          { exerciseId: squatSubstitute, targetSets: 4, repRange: '6-8', targetRpe: 8.5, restSeconds: 150, notes: 'Клек с лост на гръб.' },
          { exerciseId: 'ex-6', targetSets: 3, repRange: '8-10', targetRpe: 8.0, restSeconds: 90, notes: 'Български клек с дъмбели.' },
          { exerciseId: deadliftSubstitute, targetSets: 3, repRange: '10-12', targetRpe: 8.0, restSeconds: 90, notes: 'Румънска тяга за задно бедро.' },
          { exerciseId: 'ex-7', targetSets: 4, repRange: '12-15', targetRpe: 9.0, restSeconds: 60, notes: 'Повдигане за прасци прав.' },
        ],
      },
      {
        title: 'Горна част Б (Хипертрофия и Полулег)',
        description: 'Акцент върху горна част на гърдите и вертикална ширина на гърба.',
        category: 'UPPER',
        exercises: [
          { exerciseId: 'ex-2', targetSets: 4, repRange: '8-10', targetRpe: 8.0, restSeconds: 90, notes: 'Полулег с дъмбели за горни гърди.' },
          { exerciseId: 'ex-8', targetSets: 4, repRange: '8-10', targetRpe: 8.5, restSeconds: 90, notes: 'Придърпване на горен скрипец.' },
          { exerciseId: 'ex-3', targetSets: 3, repRange: '12-15', targetRpe: 8.5, restSeconds: 60, notes: 'Флайс на кросоувър за гърди.' },
          { exerciseId: 'ex-13', targetSets: 3, repRange: '15-20', targetRpe: 9.0, restSeconds: 60, notes: 'Фейс-пулс за задно рамо.' },
          { exerciseId: 'ex-14', targetSets: 4, repRange: '10-12', targetRpe: 9.0, restSeconds: 60, notes: 'Сгъване за бицепс от полулег с дъмбели.' },
        ],
      },
      {
        title: 'Долна част Б (Задно бедро и Задна верига)',
        description: 'Тежка румънска тяга, темпо клекове и дълбока коремна мускулатура.',
        category: 'LOWER',
        exercises: [
          { exerciseId: deadliftSubstitute, targetSets: 4, repRange: '8-10', targetRpe: 8.5, restSeconds: 120, notes: 'Тежка румънска тяга с лост.' },
          { exerciseId: squatSubstitute, targetSets: 3, repRange: '10-12', targetRpe: 8.0, restSeconds: 120, notes: 'Клек с лост с акцент върху пауза долу.' },
          { exerciseId: 'ex-7', targetSets: 4, repRange: '12-15', targetRpe: 9.0, restSeconds: 60, notes: 'Повдигане на пръсти за прасци.' },
          { exerciseId: 'ex-17', targetSets: 3, repRange: '12-15', targetRpe: 8.5, restSeconds: 60, notes: 'Повдигане на крака от вис на лост.' },
        ],
      }
    );
  } else {
    recommendedSplitName = 'Push / Pull / Legs / Upper / Lower – Елитен сплит (5 дни)';
    rawTemplates.push(
      {
        title: 'Ден 1: Бутане (Гърди и Трицепс акцент)',
        description: 'Високо механично напрежение за гърди и предно рамо.',
        category: 'PUSH',
        exercises: [
          { exerciseId: 'ex-1', targetSets: 4, repRange: '6-8', targetRpe: 8.5, restSeconds: 120, notes: 'Избутване от лег с лост.' },
          { exerciseId: 'ex-2', targetSets: 3, repRange: '8-10', targetRpe: 8.0, restSeconds: 90, notes: 'Полулег с дъмбели за горни гърди.' },
          { exerciseId: 'ex-11', targetSets: 4, repRange: '12-15', targetRpe: 9.0, restSeconds: 60, notes: 'Разтваряне за странично рамо с дъмбели.' },
          { exerciseId: 'ex-15', targetSets: 3, repRange: '10-12', targetRpe: 8.5, restSeconds: 60, notes: 'Разгъване за трицепс на скрипец.' },
          { exerciseId: 'ex-16', targetSets: 3, repRange: '12-15', targetRpe: 9.0, restSeconds: 60, notes: 'Френско разгъване зад глава.' },
        ],
      },
      {
        title: 'Ден 2: Дърпане (Ширина на гърба и Бицепс)',
        description: 'V-образен гръб с изолиран обем за ръце.',
        category: 'PULL',
        exercises: [
          { exerciseId: 'ex-8', targetSets: 4, repRange: '8-10', targetRpe: 8.5, restSeconds: 90, notes: 'Придърпване на горен скрипец широк хват.' },
          { exerciseId: 'ex-9', targetSets: 3, repRange: '8-10', targetRpe: 8.0, restSeconds: 90, notes: 'Т-образно гребане.' },
          { exerciseId: 'ex-10', targetSets: 3, repRange: '10-12', targetRpe: 8.0, restSeconds: 75, notes: 'Придърпване на долен скрипец.' },
          { exerciseId: 'ex-13', targetSets: 3, repRange: '15-20', targetRpe: 8.5, restSeconds: 60, notes: 'Фейс-пулс с въже.' },
          { exerciseId: 'ex-14', targetSets: 4, repRange: '10-12', targetRpe: 9.0, restSeconds: 60, notes: 'Сгъване за бицепс от полулег с дъмбели.' },
        ],
      },
      {
        title: 'Ден 3: Крака (Квадрицепси и Прасци)',
        description: 'Колянна флексия и едностранна мускулна стабилност.',
        category: 'LEGS',
        exercises: [
          { exerciseId: squatSubstitute, targetSets: 4, repRange: '6-8', targetRpe: 8.5, restSeconds: 150, notes: 'Клек с лост на гръб.' },
          { exerciseId: 'ex-6', targetSets: 3, repRange: '10-12', targetRpe: 8.5, restSeconds: 90, notes: 'Български клек с дъмбели.' },
          { exerciseId: deadliftSubstitute, targetSets: 3, repRange: '10-12', targetRpe: 8.0, restSeconds: 90, notes: 'Румънска тяга за задно бедро.' },
          { exerciseId: 'ex-7', targetSets: 4, repRange: '12-15', targetRpe: 9.0, restSeconds: 60, notes: 'Повдигане на пръсти за прасци.' },
        ],
      },
      {
        title: 'Ден 4: Горна част (Рамене и Ръце приоритет)',
        description: 'Кръгли рамене, горна част на гърдите и бицепс/трицепс супер-серии.',
        category: 'UPPER',
        exercises: [
          { exerciseId: 'ex-12', targetSets: 4, repRange: '8-10', targetRpe: 8.5, restSeconds: 90, notes: 'Раменни преси с дъмбели от седеж.' },
          { exerciseId: 'ex-2', targetSets: 3, repRange: '10-12', targetRpe: 8.0, restSeconds: 90, notes: 'Полулег с дъмбели.' },
          { exerciseId: 'ex-8', targetSets: 3, repRange: '10-12', targetRpe: 8.0, restSeconds: 75, notes: 'Придърпване на скрипец.' },
          { exerciseId: 'ex-11', targetSets: 4, repRange: '12-15', targetRpe: 9.0, restSeconds: 60, notes: 'Разтваряне за странично рамо.' },
          { exerciseId: 'ex-14', targetSets: 3, repRange: '10-12', targetRpe: 8.5, restSeconds: 60, notes: 'Сгъване с дъмбели за бицепс.' },
          { exerciseId: 'ex-15', targetSets: 3, repRange: '10-12', targetRpe: 8.5, restSeconds: 60, notes: 'Трицепс на скрипец.' },
        ],
      },
      {
        title: 'Ден 5: Долна част (Задна верига и Корем)',
        description: 'Мъртва тяга, задно бедро и стягане на коремната стена.',
        category: 'LOWER',
        exercises: [
          { exerciseId: deadliftSubstitute, targetSets: 4, repRange: '8-10', targetRpe: 8.5, restSeconds: 120, notes: 'Тежка румънска тяга с лост.' },
          { exerciseId: squatSubstitute, targetSets: 3, repRange: '8-10', targetRpe: 8.0, restSeconds: 120, notes: 'Клекове с лост с акцент темпо.' },
          { exerciseId: 'ex-7', targetSets: 4, repRange: '12-15', targetRpe: 9.0, restSeconds: 60, notes: 'Повдигане на пръсти за прасци.' },
          { exerciseId: 'ex-17', targetSets: 4, repRange: '12-15', targetRpe: 8.5, restSeconds: 60, notes: 'Повдигане на крака от вис на лост.' },
        ],
      }
    );
  }

  // Attach starting weights and estimated durations
  const templates = rawTemplates.map((tmpl) => {
    const exercisesWithWeights = tmpl.exercises.map((ex) => ({
      ...ex,
      startingWeightKg: calculateStartingWeight(ex.exerciseId, gender, currentWeight, experienceScale),
    }));
    const estimatedDurationMinutes = calculateWorkoutDuration(tmpl.exercises);

    return {
      title: tmpl.title,
      description: tmpl.description,
      category: tmpl.category,
      estimatedDurationMinutes,
      exercises: exercisesWithWeights,
    };
  });

  // 6. Synthesize 7-Day Meal Program
  const sevenDayMealPlan = generateSevenDayMealPlan({
    dailyCaloriesTarget,
    proteinTarget,
    carbsTarget,
    fatsTarget,
    foodPreferences: input.foodPreferences,
    avoidedIngredients: input.avoidedIngredients,
    mealsPerDay: input.mealsPerDay || 4,
    mealTiming: input.mealTiming,
    snackingHabits: input.snackingHabits,
  });

  // 7. Generate AI Synthesis Narrative in Bulgarian
  const goalNames = [
    'Агресивно изчистване на подкожни мазнини (Cut)',
    'Постепенно орелефяване със запазване на мускулната маса',
    'Телесна рекомпозиция (Изгаряне на мазнини + мускулен тонус)',
    'Чиста мускулна хипертрофия (Lean Bulk)',
    'Максимално покачване на мускулна маса (Mass Bulk)',
    'Максимална сила и силов трибой (Strength Peak)',
  ];
  const goalTitle = goalNames[Math.min(5, Math.max(0, primaryGoalScale - 1))];

  const priorityLabels: Record<string, string> = {
    BALANCED: 'Равномерно цялостно развитие',
    CHEST: 'Гърди & Предно рамо (Приоритетен обем)',
    BACK: 'Широк гръб & V-профил (Приоритетен обем)',
    SHOULDERS: 'Рамене – 3D Делтоиди (Приоритетен обем)',
    ARMS: 'Ръце – Бицепс и Трицепс (Приоритетен обем)',
    LEGS: 'Крака & Седалище / Глутеус (Приоритетен обем)',
    CORE: 'Коремна стена & Ядро (Приоритетен обем)',
  };

  const avoidedLabels: Record<string, string> = {
    NONE: 'Няма ограничения',
    HEAVY_SQUATS: 'Изключени тежки клекове с лост (заместени с щадящи унилатерални движения)',
    HEAVY_DEADLIFTS: 'Изключена тежка тяга (щадене на кръста и лумбалната зона)',
    DIRECT_SHOULDERS: 'Намален раменен натиск',
    DIRECT_ARMS: 'Ограничена директна изолация за ръце',
  };

  const aiSynthesisSummary = `🧠 **AI Анализ и Персонализиран План за ${input.name}**:
- **Физиологична цел**: ${goalTitle} (Текущо тегло: **${currentWeight} кг** ➔ Целево тегло: **${targetWeight} кг**).
- **Специализация на мускулни групи**: Приоритетна зона: **${priorityLabels[priorityMuscleGroup] || priorityMuscleGroup}**. Ограничения/Щадене: **${avoidedLabels[avoidedMuscleArea] || avoidedMuscleArea}**.
- **Метаболитен баланс**: Вашият прогнозен TDEE е **${Math.round(tdee)} ккал/ден**. Предписаният калориен прием е **${dailyCaloriesTarget} ккал/ден** с **${proteinTarget} г Протеин** за максимален мускулен протеинов синтез.
- **Хранителен протокол**: Изготвихме **7-дневен детайлен хранителен режим**, адаптиран към вашите предпочитания (${input.foodPreferences || 'Балансирани цели храни'}) и изключени съставки (${input.avoidedIngredients?.length ? input.avoidedIngredients.join(', ') : 'Няма'}).
- **Тренировъчна честота и обем**: Синтезирахме **${recommendedSplitName}** (${days} дни седмично). Към всяка сесия е добавен специализиран **загряващ протокол за мобилност с видеа**.
- **Начални работни тежести**: Автоматично изчислени спрямо вашия пол, лично тегло и стаж.`;

  return {
    dailyCaloriesTarget,
    proteinTarget,
    carbsTarget,
    fatsTarget,
    waterTargetMl,
    aiSynthesisSummary,
    recommendedSplitName,
    sevenDayMealPlan,
    templates,
  };
}
