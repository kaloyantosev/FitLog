export type Role = 'CLIENT' | 'COACH';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  age?: number;
  gender?: string;
  currentWeight: number;
  targetWeight: number;
  heightCm: number;
  trainingDaysPerWeek?: number;
  preferredTrainingHour?: string;
  emailNotificationsEnabled?: boolean;
  foodPreferences?: string;
  avoidedIngredients?: string;
  mealsPerDay?: number;
  mealTiming?: string;
  snackingHabits?: string;
  mealPlanData?: string | any;
  experienceScale?: number;
  primaryGoalScale?: number;
  activityLevelScale?: number;
  bodyCompositionScale?: number;
  dailyCaloriesTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
  waterTargetMl: number;
}

export interface MealIngredient {
  name: string;
  nameBg?: string;
  amountGrams: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  category?: string; // 'PRODUCE' | 'MEAT_FISH' | 'DAIRY_EGGS' | 'GRAINS_PANTRY' | 'FATS_NUTS'
}

export interface MealOption {
  id: string;
  name: string;
  nameBg?: string;
  description: string;
  photoUrl: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  prepTimeMinutes: number;
  recipeNotes?: string;
  ingredients: MealIngredient[];
}

export interface MealSlot {
  slotId: string;
  slotName: string; // "Breakfast", "Lunch", "Mid-day Fuel", "Dinner"
  slotNameBg?: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  recommendedMeal: MealOption;
  alternative1: MealOption;
  alternative2: MealOption;
}

export interface DayMealPlan {
  dayIndex: number; // 0 = Monday, 6 = Sunday
  dayName: string;
  dayNameBg: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  mealSlots: MealSlot[];
}

export interface SevenDayMealPlan {
  planTitle: string;
  dietStyle: string;
  dailyCaloriesTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
  days: DayMealPlan[];
}

export interface WeeklyGroceryItem {
  name: string;
  nameBg: string;
  totalGrams: number;
  category: string;
  unit: string;
}

export interface WeeklyGroceryCategory {
  categoryKey: string;
  title: string;
  titleBg: string;
  icon: string;
  items: WeeklyGroceryItem[];
}

export interface ExerciseItem {
  id: string;
  name: string;
  nameBg?: string;
  category: 'CHEST' | 'BACK' | 'LEGS' | 'SHOULDERS' | 'ARMS' | 'CORE' | 'CARDIO';
  equipment: 'BARBELL' | 'DUMBBELL' | 'CABLE' | 'MACHINE' | 'BODYWEIGHT';
  instructions?: string | null;
  instructionsBg?: string | null;
  videoUrl?: string | null;
}

export interface TemplateExerciseItem {
  id?: string;
  exerciseId: string;
  order: number;
  targetSets: number;
  repRange: string;
  targetRpe?: number | null;
  restSeconds: number;
  startingWeightKg?: number | null;
  notes?: string | null;
  exercise?: ExerciseItem;
}

export interface WorkoutTemplate {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  isDefault?: boolean;
  estimatedDurationMinutes?: number;
  exercises: TemplateExerciseItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LoggedSetData {
  id?: string;
  exerciseId: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  rpe?: number | null;
  isCompleted: boolean;
  exercise?: ExerciseItem;
}

export interface WorkoutLogData {
  id?: string;
  userId: string;
  templateId?: string | null;
  title: string;
  startedAt: string;
  completedAt?: string | null;
  durationMinutes?: number;
  totalVolumeKg?: number;
  notes?: string | null;
  loggedSets: LoggedSetData[];
  template?: WorkoutTemplate | null;
}

export interface NutritionEntry {
  id?: string;
  userId: string;
  date: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACKS';
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  createdAt?: string;
}

export interface CheckinEntry {
  id?: string;
  userId: string;
  date: string;
  weightKg: number;
  chestCm?: number | null;
  waistCm?: number | null;
  hipsCm?: number | null;
  armsCm?: number | null;
  thighsCm?: number | null;
  bodyFatPct?: number | null;
  energyRating?: number | null;
  stressRating?: number | null;
  sleepRating?: number | null;
  hungerRating?: number | null;
  digestionRating?: number | null;
  aiFeedback?: string | null;
  notes?: string | null;
  createdAt?: string;
}

