import { SevenDayMealPlan, DayMealPlan, MealSlot, MealOption, MealIngredient, WeeklyGroceryCategory, WeeklyGroceryItem } from '@/types';

export interface MealPlanInput {
  dailyCaloriesTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
  foodPreferences?: string; // 'BALANCED', 'MEDITERRANEAN', 'HIGH_PROTEIN_LOW_CARB', 'PESCATARIAN', 'VEGETARIAN', 'BODYBUILDING_PREP'
  avoidedIngredients?: string[]; // IDs like 'pork', 'peanuts', 'lactose', etc.
  mealsPerDay?: number; // 2 to 6
  mealTiming?: string;
  snackingHabits?: string;
}

export interface MealRecipeMaster {
  id: string;
  name: string;
  nameBg: string;
  category: 'BREAKFAST' | 'MAIN' | 'SNACK';
  dietTags: string[]; // 'BALANCED', 'MEDITERRANEAN', 'HIGH_PROTEIN_LOW_CARB', 'PESCATARIAN', 'VEGETARIAN', 'BODYBUILDING_PREP'
  containsIngredients: string[]; // List of ingredient IDs (e.g., 'chicken', 'pork', 'salmon', 'peanuts', 'cow_sirene')
  photoUrl: string;
  description: string;
  prepTimeMinutes: number;
  baseCalories: number;
  baseProtein: number;
  baseCarbs: number;
  baseFats: number;
  ingredients: MealIngredient[];
}

export const MASTER_RECIPES: MealRecipeMaster[] = [
  // --- BREAKFASTS ---
  {
    id: 'brk-bulgarian-oats-skyr',
    name: 'Anabolic Bulgarian Oats with Skyr & Berries',
    nameBg: 'Овесена каша със Скир, горски боровинки и мед',
    category: 'BREAKFAST',
    dietTags: ['BALANCED', 'MEDITERRANEAN', 'BODYBUILDING_PREP', 'VEGETARIAN'],
    containsIngredients: ['oats', 'skyr', 'berries', 'chia_flax'],
    photoUrl: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&auto=format&fit=crop&q=80',
    description: 'Slow-release complex carbs with ultra-high pure protein from authentic strained Skyr.',
    prepTimeMinutes: 5,
    baseCalories: 510,
    baseProtein: 38,
    baseCarbs: 65,
    baseFats: 9,
    ingredients: [
      { name: 'Fine Rolled Oats', nameBg: 'Овесени ядки фини', amountGrams: 80, unit: 'g', calories: 300, protein: 11, carbs: 50, fats: 5, category: 'GRAINS_PANTRY' },
      { name: 'Olympus Skyr Natural 0%', nameBg: 'Олимпус Скир 0%', amountGrams: 200, unit: 'g', calories: 120, protein: 22, carbs: 8, fats: 0.4, category: 'DAIRY_EGGS' },
      { name: 'Wild Blueberries / Berries', nameBg: 'Горски боровинки', amountGrams: 80, unit: 'g', calories: 45, protein: 0.5, carbs: 11, fats: 0.2, category: 'PRODUCE' },
      { name: 'Chia Seeds / Honey', nameBg: 'Чиа семена', amountGrams: 10, unit: 'g', calories: 45, protein: 1.5, carbs: 4, fats: 3, category: 'FATS_NUTS' },
    ],
  },
  {
    id: 'brk-eggs-sirene-avocado-toast',
    name: 'Scrambled Eggs with Bulgarian Sirene & Avocado Toast',
    nameBg: 'Бъркани яйца с краве сирене, авокадо и хляб Вита',
    category: 'BREAKFAST',
    dietTags: ['BALANCED', 'MEDITERRANEAN', 'HIGH_PROTEIN_LOW_CARB', 'VEGETARIAN'],
    containsIngredients: ['whole_eggs', 'egg_whites', 'cow_sirene', 'wholewheat_bread', 'avocado', 'olive_oil'],
    photoUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
    description: 'Golden fluffy scrambled farm eggs with crumbled authentic sirene on toasted whole grain.',
    prepTimeMinutes: 10,
    baseCalories: 540,
    baseProtein: 36,
    baseCarbs: 35,
    baseFats: 27,
    ingredients: [
      { name: 'Whole Eggs (L)', nameBg: 'Яйца цели', amountGrams: 120, unit: 'g (2 бр)', calories: 180, protein: 15, carbs: 1, fats: 13, category: 'DAIRY_EGGS' },
      { name: 'Liquid Egg Whites', nameBg: 'Яйчен белтък', amountGrams: 100, unit: 'g', calories: 52, protein: 11, carbs: 0.7, fats: 0.2, category: 'DAIRY_EGGS' },
      { name: 'Bulgarian Cow Sirene', nameBg: 'Краве сирене', amountGrams: 40, unit: 'g', calories: 116, protein: 6.8, carbs: 0.6, fats: 9.6, category: 'DAIRY_EGGS' },
      { name: 'Vita 100% Wholewheat Bread', nameBg: 'Хляб Вита 100%', amountGrams: 70, unit: 'g (2 филии)', calories: 147, protein: 7.3, carbs: 26.6, fats: 1.2, category: 'GRAINS_PANTRY' },
      { name: 'Fresh Avocado', nameBg: 'Авокадо', amountGrams: 40, unit: 'g', calories: 64, protein: 0.8, carbs: 3.4, fats: 6.0, category: 'FATS_NUTS' },
    ],
  },
  {
    id: 'brk-protein-pancakes-banana',
    name: 'Whey Protein Banana Oat Pancakes',
    nameBg: 'Протеинови палачинки с банан, яйца и овес',
    category: 'BREAKFAST',
    dietTags: ['BALANCED', 'BODYBUILDING_PREP', 'VEGETARIAN'],
    containsIngredients: ['oats', 'whey_protein', 'whole_eggs', 'bananas'],
    photoUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&auto=format&fit=crop&q=80',
    description: 'Fluffy nutrient-dense anabolic pancakes topped with fresh sliced banana and cinnamon.',
    prepTimeMinutes: 12,
    baseCalories: 530,
    baseProtein: 42,
    baseCarbs: 62,
    baseFats: 11,
    ingredients: [
      { name: 'Oat Flour / Oats', nameBg: 'Овесено брашно', amountGrams: 70, unit: 'g', calories: 262, protein: 9.5, carbs: 43.4, fats: 4.9, category: 'GRAINS_PANTRY' },
      { name: 'Whey Isolate Vanilla', nameBg: 'Суроватъчен протеин ванилия', amountGrams: 30, unit: 'g (1 scoop)', calories: 114, protein: 25, carbs: 1, fats: 1, category: 'GRAINS_PANTRY' },
      { name: 'Whole Egg + Whites', nameBg: 'Яйце + белтък', amountGrams: 100, unit: 'g', calories: 95, protein: 11, carbs: 0.8, fats: 5, category: 'DAIRY_EGGS' },
      { name: 'Fresh Banana', nameBg: 'Банан', amountGrams: 80, unit: 'g', calories: 71, protein: 0.9, carbs: 18.4, fats: 0.2, category: 'PRODUCE' },
    ],
  },
  {
    id: 'brk-bulgarian-banitsa-fit',
    name: 'High-Protein Fitness Banitsa with Curd & Eggs',
    nameBg: 'Фитнес баница с нискомаслена извара, сирене и яйца',
    category: 'BREAKFAST',
    dietTags: ['BALANCED', 'MEDITERRANEAN', 'VEGETARIAN'],
    containsIngredients: ['cottage_izkvara', 'cow_sirene', 'whole_eggs', 'pasta_gluten'],
    photoUrl: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&auto=format&fit=crop&q=80',
    description: 'Traditional Bulgarian pastry remodeled with 35g of bioavailable protein and reduced fat.',
    prepTimeMinutes: 15,
    baseCalories: 480,
    baseProtein: 37,
    baseCarbs: 42,
    baseFats: 17,
    ingredients: [
      { name: 'Phyllo Pastry Sheets (Filo)', nameBg: 'Кори за баница пълнозърнести', amountGrams: 60, unit: 'g', calories: 170, protein: 5, carbs: 34, fats: 1, category: 'GRAINS_PANTRY' },
      { name: 'Low-fat Izkvara / Cottage', nameBg: 'Извара нискомаслена', amountGrams: 150, unit: 'g', calories: 128, protein: 24.8, carbs: 3.8, fats: 1.5, category: 'DAIRY_EGGS' },
      { name: 'Bulgarian Cow Sirene', nameBg: 'Краве сирене', amountGrams: 30, unit: 'g', calories: 87, protein: 5.1, carbs: 0.5, fats: 7.2, category: 'DAIRY_EGGS' },
      { name: 'Whole Eggs', nameBg: 'Яйца цели', amountGrams: 60, unit: 'g (1 бр)', calories: 93, protein: 7.8, carbs: 0.6, fats: 6.6, category: 'DAIRY_EGGS' },
    ],
  },

  // --- MAIN MEALS (LUNCH & DINNER) ---
  {
    id: 'main-chicken-rice-broccoli',
    name: 'Grilled Herb Chicken Breast with Jasmine Rice & Steamed Broccoli',
    nameBg: 'Пилешко филе на скара с ориз Басмати и задушени броколи',
    category: 'MAIN',
    dietTags: ['BALANCED', 'BODYBUILDING_PREP', 'HIGH_PROTEIN_LOW_CARB'],
    containsIngredients: ['chicken', 'white_rice', 'broccoli', 'olive_oil'],
    photoUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&auto=format&fit=crop&q=80',
    description: 'The golden bodybuilding standard: tender seasoned chicken breast with fluffy Jasmine rice and micronutrient-rich broccoli.',
    prepTimeMinutes: 20,
    baseCalories: 620,
    baseProtein: 52,
    baseCarbs: 65,
    baseFats: 14,
    ingredients: [
      { name: 'Chicken Breast Fillet', nameBg: 'Пилешко филе гърди', amountGrams: 220, unit: 'g', calories: 264, protein: 51.7, carbs: 0, fats: 4.4, category: 'MEAT_FISH' },
      { name: 'White Jasmine Rice (Cooked)', nameBg: 'Ориз Басмати сварен', amountGrams: 220, unit: 'g', calories: 286, protein: 5.9, carbs: 62.7, fats: 0.6, category: 'GRAINS_PANTRY' },
      { name: 'Steamed Fresh Broccoli', nameBg: 'Пресни броколи на пара', amountGrams: 150, unit: 'g', calories: 51, protein: 4.2, carbs: 10.0, fats: 0.6, category: 'PRODUCE' },
      { name: 'Extra Virgin Olive Oil', nameBg: 'Зехтин Екстра Върджин', amountGrams: 8, unit: 'g (1 ч.л.)', calories: 70, protein: 0, carbs: 0, fats: 8, category: 'FATS_NUTS' },
    ],
  },
  {
    id: 'main-salmon-sweet-potatoes-asparagus',
    name: 'Crispy Atlantic Salmon Fillet with Baked Sweet Potato & Asparagus',
    nameBg: 'Печена сьомга филе със сладки картофи и хрупкави аспержи',
    category: 'MAIN',
    dietTags: ['BALANCED', 'MEDITERRANEAN', 'PESCATARIAN', 'HIGH_PROTEIN_LOW_CARB'],
    containsIngredients: ['salmon', 'sweet_potatoes', 'asparagus', 'olive_oil'],
    photoUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&auto=format&fit=crop&q=80',
    description: 'Rich in Omega-3 fatty acids and slow-digesting complex carbs for muscle glycogen recovery.',
    prepTimeMinutes: 22,
    baseCalories: 640,
    baseProtein: 44,
    baseCarbs: 48,
    baseFats: 26,
    ingredients: [
      { name: 'Atlantic Salmon Fillet', nameBg: 'Сьомга филе', amountGrams: 190, unit: 'g', calories: 395, protein: 41.8, carbs: 0, fats: 24.7, category: 'MEAT_FISH' },
      { name: 'Baked Sweet Potato (Batat)', nameBg: 'Сладки картофи печени', amountGrams: 220, unit: 'g', calories: 198, protein: 4.4, carbs: 46.2, fats: 0.3, category: 'GRAINS_PANTRY' },
      { name: 'Grilled Fresh Asparagus', nameBg: 'Аспержи на грил', amountGrams: 120, unit: 'g', calories: 24, protein: 2.6, carbs: 4.6, fats: 0.2, category: 'PRODUCE' },
      { name: 'Lemon Juice & Herbs', nameBg: 'Лимонов сок и подправки', amountGrams: 15, unit: 'g', calories: 8, protein: 0.1, carbs: 1.5, fats: 0.0, category: 'PRODUCE' },
    ],
  },
  {
    id: 'main-beef-steak-potatoes-shopska',
    name: 'Lean Beef Tenderloin Steak with Roasted Rosemary Potatoes & Shopska Salad',
    nameBg: 'Телешко бонфиле с печени картофи с розмарин и малка Шопска салата',
    category: 'MAIN',
    dietTags: ['BALANCED', 'MEDITERRANEAN', 'HIGH_PROTEIN_LOW_CARB'],
    containsIngredients: ['beef', 'potatoes', 'tomatoes', 'cucumbers', 'peppers', 'cow_sirene', 'olive_oil'],
    photoUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    description: 'Iron-dense lean beef tenderloin paired with crispy roasted potatoes and crisp Bulgarian salad.',
    prepTimeMinutes: 25,
    baseCalories: 660,
    baseProtein: 54,
    baseCarbs: 52,
    baseFats: 22,
    ingredients: [
      { name: 'Lean Beef Tenderloin', nameBg: 'Телешко бонфиле', amountGrams: 200, unit: 'g', calories: 290, protein: 48, carbs: 0, fats: 11, category: 'MEAT_FISH' },
      { name: 'Roasted Red Potatoes', nameBg: 'Печени картофи с билки', amountGrams: 240, unit: 'g', calories: 208, protein: 4.8, carbs: 48, fats: 0.2, category: 'GRAINS_PANTRY' },
      { name: 'Fresh Tomatoes & Cucumbers', nameBg: 'Домати и краставици', amountGrams: 150, unit: 'g', calories: 30, protein: 1.2, carbs: 6.0, fats: 0.3, category: 'PRODUCE' },
      { name: 'Bulgarian Cow Sirene', nameBg: 'Краве сирене настъргано', amountGrams: 30, unit: 'g', calories: 87, protein: 5.1, carbs: 0.5, fats: 7.2, category: 'DAIRY_EGGS' },
      { name: 'Olive Oil Drizzle', nameBg: 'Зехтин', amountGrams: 5, unit: 'g', calories: 44, protein: 0, carbs: 0, fats: 5, category: 'FATS_NUTS' },
    ],
  },
  {
    id: 'main-bulgarian-kyufteta-skara-rice',
    name: 'Grilled Bulgarian Lean Beef/Pork Meatballs with Brown Rice & Lyutenitsa',
    nameBg: 'Домашни кюфтета на скара с кафяв ориз и домашна лютеница',
    category: 'MAIN',
    dietTags: ['BALANCED', 'MEDITERRANEAN'],
    containsIngredients: ['pork', 'beef', 'brown_rice', 'onions', 'peppers'],
    photoUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&auto=format&fit=crop&q=80',
    description: 'Traditional charcoal-grilled Bulgarian spiced minced meat patties with nutty brown rice and authentic Deroni lyutenitsa.',
    prepTimeMinutes: 20,
    baseCalories: 650,
    baseProtein: 48,
    baseCarbs: 58,
    baseFats: 22,
    ingredients: [
      { name: 'Lean Minced Meat Patties (2 pcs)', nameBg: 'Кюфтета от чисто месо (2 бр)', amountGrams: 180, unit: 'g', calories: 360, protein: 38, carbs: 4, fats: 20, category: 'MEAT_FISH' },
      { name: 'Brown Rice (Cooked)', nameBg: 'Кафяв ориз сварен', amountGrams: 180, unit: 'g', calories: 200, protein: 4.6, carbs: 42, fats: 1.5, category: 'GRAINS_PANTRY' },
      { name: 'Bulgarian Lyutenitsa', nameBg: 'Лютеница Дерони/Първомай', amountGrams: 50, unit: 'g (2 с.л.)', calories: 68, protein: 1.1, carbs: 8.0, fats: 3.5, category: 'PRODUCE' },
      { name: 'Shredded Cabbage Salad', nameBg: 'Зелева салата с моркови', amountGrams: 100, unit: 'g', calories: 32, protein: 1.3, carbs: 6.0, fats: 0.2, category: 'PRODUCE' },
    ],
  },
  {
    id: 'main-mountain-trout-potatoes',
    name: 'Bulgarian Mountain Trout on Grill with Boiled Garlic Potatoes & Dill',
    nameBg: 'Родопска пъстърва на скара с пресни варени картофи и копър',
    category: 'MAIN',
    dietTags: ['BALANCED', 'MEDITERRANEAN', 'PESCATARIAN'],
    containsIngredients: ['trout', 'potatoes', 'garlic', 'olive_oil'],
    photoUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80',
    description: 'Fresh Balkan mountain trout grilled with sea salt, lemon, fresh dill and steamed golden potatoes.',
    prepTimeMinutes: 20,
    baseCalories: 580,
    baseProtein: 48,
    baseCarbs: 46,
    baseFats: 18,
    ingredients: [
      { name: 'Mountain Trout Whole/Fillet', nameBg: 'Пъстърва на скара', amountGrams: 240, unit: 'g', calories: 336, protein: 50.4, carbs: 0, fats: 14.4, category: 'MEAT_FISH' },
      { name: 'Boiled Baby Potatoes', nameBg: 'Варени картофи с копър', amountGrams: 220, unit: 'g', calories: 191, protein: 4.4, carbs: 44, fats: 0.2, category: 'GRAINS_PANTRY' },
      { name: 'Fresh Garlic & Dill Dressing', nameBg: 'Чеснова заливка с копър и зехтин', amountGrams: 10, unit: 'g', calories: 55, protein: 0.2, carbs: 1.2, fats: 5.5, category: 'FATS_NUTS' },
    ],
  },
  {
    id: 'main-turkey-quinoa-roasted-veggies',
    name: 'Roast Turkey Breast with Fluffy Quinoa & Mediterranean Grilled Vegetables',
    nameBg: 'Пуешко филе на тиган с киноа и гриловани тиквички и чушки',
    category: 'MAIN',
    dietTags: ['BALANCED', 'BODYBUILDING_PREP', 'MEDITERRANEAN'],
    containsIngredients: ['turkey', 'quinoa', 'zucchini', 'peppers', 'mushrooms', 'olive_oil'],
    photoUrl: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&auto=format&fit=crop&q=80',
    description: 'Ultra-lean turkey breast loaded with high quality protein and gluten-free complete quinoa grains.',
    prepTimeMinutes: 20,
    baseCalories: 590,
    baseProtein: 52,
    baseCarbs: 55,
    baseFats: 14,
    ingredients: [
      { name: 'Lean Turkey Breast Fillet', nameBg: 'Пуешко филе', amountGrams: 210, unit: 'g', calories: 252, protein: 50.4, carbs: 0, fats: 3.5, category: 'MEAT_FISH' },
      { name: 'Cooked Organic Quinoa', nameBg: 'Киноа сварена', amountGrams: 200, unit: 'g', calories: 240, protein: 8.8, carbs: 42.6, fats: 3.8, category: 'GRAINS_PANTRY' },
      { name: 'Grilled Zucchini & Bell Peppers', nameBg: 'Гриловани тиквички и червени чушки', amountGrams: 150, unit: 'g', calories: 45, protein: 2.2, carbs: 9.0, fats: 0.4, category: 'PRODUCE' },
      { name: 'Cold-Pressed Olive Oil', nameBg: 'Зехтин', amountGrams: 6, unit: 'g', calories: 53, protein: 0, carbs: 0, fats: 6, category: 'FATS_NUTS' },
    ],
  },
  {
    id: 'main-pork-tenderloin-sweet-potatoes',
    name: 'Pan-Seared Pork Tenderloin Medallions with Sweet Potato Mash & Green Beans',
    nameBg: 'Свинско контрафиле на медальони с пюре от сладък картоф и зелен фасул',
    category: 'MAIN',
    dietTags: ['BALANCED', 'MEDITERRANEAN', 'HIGH_PROTEIN_LOW_CARB'],
    containsIngredients: ['pork', 'sweet_potatoes', 'beans_lentils', 'olive_oil'],
    photoUrl: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800&auto=format&fit=crop&q=80',
    description: 'Lean tender pork medallions seared in rosemary and garlic, served with velvety sweet potato mash.',
    prepTimeMinutes: 20,
    baseCalories: 610,
    baseProtein: 48,
    baseCarbs: 50,
    baseFats: 18,
    ingredients: [
      { name: 'Lean Pork Tenderloin (Kontrafile)', nameBg: 'Свинско контрафиле', amountGrams: 200, unit: 'g', calories: 280, protein: 46, carbs: 0, fats: 10, category: 'MEAT_FISH' },
      { name: 'Mashed Sweet Potatoes', nameBg: 'Пюре от сладък картоф', amountGrams: 220, unit: 'g', calories: 200, protein: 4, carbs: 46, fats: 0.3, category: 'GRAINS_PANTRY' },
      { name: 'Steamed Green Beans / Haricots', nameBg: 'Задушен зелен фасул', amountGrams: 120, unit: 'g', calories: 40, protein: 2.2, carbs: 8.4, fats: 0.2, category: 'PRODUCE' },
      { name: 'Olive Oil & Herbs', nameBg: 'Зехтин и билки', amountGrams: 10, unit: 'g', calories: 88, protein: 0, carbs: 0, fats: 10, category: 'FATS_NUTS' },
    ],
  },
  {
    id: 'main-monastery-bean-stew-file-elena',
    name: 'Bulgarian Monastery Bean Stew with Sliced File Elena & Whole Grain Bread',
    nameBg: 'Боб по манастирски с тънко нарязано Филе Елена и хляб Вита',
    category: 'MAIN',
    dietTags: ['BALANCED', 'MEDITERRANEAN'],
    containsIngredients: ['beans_lentils', 'bacon_cured', 'wholewheat_bread', 'onions', 'peppers'],
    photoUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=80',
    description: 'Hearty traditional Bulgarian slow-cooked white beans infused with spearmint, paired with lean cured File Elena.',
    prepTimeMinutes: 15,
    baseCalories: 580,
    baseProtein: 46,
    baseCarbs: 64,
    baseFats: 12,
    ingredients: [
      { name: 'Traditional Bean Soup / Stew', nameBg: 'Боб чорба по манастирски', amountGrams: 350, unit: 'ml', calories: 262, protein: 16.8, carbs: 43.7, fats: 4.2, category: 'PRODUCE' },
      { name: 'Bulgarian File Elena Slices', nameBg: 'Филе Елена', amountGrams: 60, unit: 'g', calories: 129, protein: 20.4, carbs: 0.6, fats: 4.8, category: 'MEAT_FISH' },
      { name: 'Vita Wholewheat Bread', nameBg: 'Хляб Вита 100%', amountGrams: 70, unit: 'g (2 филии)', calories: 147, protein: 7.3, carbs: 26.6, fats: 1.2, category: 'GRAINS_PANTRY' },
      { name: 'Fresh Parsley & Spearmint', nameBg: 'Джоджен и магданоз', amountGrams: 10, unit: 'g', calories: 4, protein: 0.3, carbs: 0.8, fats: 0.1, category: 'PRODUCE' },
    ],
  },
  {
    id: 'main-vegetarian-lentil-halloumi-bowl',
    name: 'Bulgarian Lentil Bowl with Grilled Kashkaval/Sirene & Roast Veggies',
    nameBg: 'Топла леща с грилован кашкавал/сирене, печени чушки и домати',
    category: 'MAIN',
    dietTags: ['BALANCED', 'VEGETARIAN', 'MEDITERRANEAN'],
    containsIngredients: ['beans_lentils', 'kashkaval', 'cow_sirene', 'peppers', 'tomatoes', 'garlic'],
    photoUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    description: 'Plant-protein powerhouse of tender Bulgarian brown lentils crowned with pan-seared cheese.',
    prepTimeMinutes: 18,
    baseCalories: 600,
    baseProtein: 42,
    baseCarbs: 58,
    baseFats: 20,
    ingredients: [
      { name: 'Cooked Bulgarian Lentils', nameBg: 'Леща чорба гъста', amountGrams: 300, unit: 'g', calories: 250, protein: 18, carbs: 40, fats: 3, category: 'PRODUCE' },
      { name: 'Bulgarian Kashkaval / Sirene (Grilled)', nameBg: 'Кашкавал / Сирене на плоча', amountGrams: 70, unit: 'g', calories: 238, protein: 17.5, carbs: 1.4, fats: 18.2, category: 'DAIRY_EGGS' },
      { name: 'Roasted Red Peppers (Pecheni Chushki)', nameBg: 'Печени белени чушки', amountGrams: 100, unit: 'g', calories: 35, protein: 1.5, carbs: 7.0, fats: 0.3, category: 'PRODUCE' },
      { name: 'Izkvara High-Protein Dollop', nameBg: 'Извара', amountGrams: 60, unit: 'g', calories: 51, protein: 10, carbs: 1.5, fats: 0.6, category: 'DAIRY_EGGS' },
    ],
  },
  {
    id: 'main-tuna-pasta-salad',
    name: 'Wholewheat Pasta Tuna Salad with Greek Yogurt Dressing',
    nameBg: 'Пълнозърнеста паста с риба тон, царевица и дресинг от кисело мляко',
    category: 'MAIN',
    dietTags: ['BALANCED', 'MEDITERRANEAN', 'PESCATARIAN'],
    containsIngredients: ['tuna', 'pasta_gluten', 'corn', 'yogurt_lactose', 'cucumbers'],
    photoUrl: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=800&auto=format&fit=crop&q=80',
    description: 'Chilled al-dente whole grain fusilli with solid light tuna, sweet corn and high-protein strained yogurt herb dressing.',
    prepTimeMinutes: 12,
    baseCalories: 610,
    baseProtein: 48,
    baseCarbs: 68,
    baseFats: 11,
    ingredients: [
      { name: 'Canned Tuna in Brine (Drained)', nameBg: 'Риба тон в собствен сос', amountGrams: 160, unit: 'g (1 консерва)', calories: 176, protein: 40.8, carbs: 0, fats: 1.3, category: 'MEAT_FISH' },
      { name: 'Wholewheat Pasta (Cooked)', nameBg: 'Пълнозърнеста паста сварена', amountGrams: 200, unit: 'g', calories: 248, protein: 10.6, carbs: 50.0, fats: 1.6, category: 'GRAINS_PANTRY' },
      { name: 'Bulgarian Yogurt 2% / Skyr Dressing', nameBg: 'Дресинг с кисело мляко 2%', amountGrams: 100, unit: 'g', calories: 55, protein: 4.5, carbs: 5.0, fats: 2.0, category: 'DAIRY_EGGS' },
      { name: 'Sweet Corn & Diced Cucumbers', nameBg: 'Царевица и пресни краставици', amountGrams: 80, unit: 'g', calories: 60, protein: 1.8, carbs: 13.0, fats: 0.5, category: 'PRODUCE' },
    ],
  },

  // --- SNACKS & PRE/POST WORKOUT FUEL ---
  {
    id: 'snk-skyr-almonds-honey',
    name: 'Olympus Skyr with Crunchy Almonds & Drizzle of Honey',
    nameBg: 'Олимпус Скир със сурови бадеми и мед',
    category: 'SNACK',
    dietTags: ['BALANCED', 'MEDITERRANEAN', 'HIGH_PROTEIN_LOW_CARB', 'VEGETARIAN'],
    containsIngredients: ['skyr', 'almonds'],
    photoUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&auto=format&fit=crop&q=80',
    description: 'Pure thick probiotic protein loaded with healthy monosaturated fats and minerals.',
    prepTimeMinutes: 3,
    baseCalories: 280,
    baseProtein: 24,
    baseCarbs: 18,
    baseFats: 11,
    ingredients: [
      { name: 'Olympus Skyr 0%', nameBg: 'Олимпус Скир', amountGrams: 180, unit: 'g', calories: 108, protein: 19.8, carbs: 7.2, fats: 0.4, category: 'DAIRY_EGGS' },
      { name: 'Raw Almonds', nameBg: 'Сурови бадеми', amountGrams: 20, unit: 'g', calories: 116, protein: 4.2, carbs: 4.0, fats: 10.0, category: 'FATS_NUTS' },
      { name: 'Pure Honey', nameBg: 'Пчелен мед', amountGrams: 15, unit: 'g (1 ч.л.)', calories: 45, protein: 0.1, carbs: 12.0, fats: 0.0, category: 'GRAINS_PANTRY' },
    ],
  },
  {
    id: 'snk-rice-cakes-peanut-butter-banana',
    name: 'Crispy Rice Cakes with Pure Peanut Butter & Banana Slices',
    nameBg: 'Оризовки с 100% фъстъчено масло и резени банан',
    category: 'SNACK',
    dietTags: ['BALANCED', 'BODYBUILDING_PREP', 'VEGETARIAN'],
    containsIngredients: ['rice_cakes', 'peanuts', 'bananas'],
    photoUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=800&auto=format&fit=crop&q=80',
    description: 'The ultimate pre-workout fuel for explosive muscle energy and steady blood sugar.',
    prepTimeMinutes: 3,
    baseCalories: 290,
    baseProtein: 10,
    baseCarbs: 38,
    baseFats: 12,
    ingredients: [
      { name: 'Brown Rice Cakes', nameBg: 'Кафяви оризовки', amountGrams: 30, unit: 'g (3 бр)', calories: 110, protein: 2.5, carbs: 24, fats: 0.8, category: 'GRAINS_PANTRY' },
      { name: '100% Pure Peanut Butter', nameBg: 'Фъстъчено масло натурално', amountGrams: 20, unit: 'g (1 с.л.)', calories: 118, protein: 5.2, carbs: 3.2, fats: 9.8, category: 'FATS_NUTS' },
      { name: 'Fresh Banana Slices', nameBg: 'Банан', amountGrams: 60, unit: 'g', calories: 53, protein: 0.7, carbs: 13.8, fats: 0.2, category: 'PRODUCE' },
    ],
  },
  {
    id: 'snk-fitspo-whey-shake',
    name: 'Whey Protein Isolate Shake with an Apple',
    nameBg: 'Суроватъчен протеинов шейк и свежа хрупкава ябълка',
    category: 'SNACK',
    dietTags: ['BALANCED', 'BODYBUILDING_PREP', 'HIGH_PROTEIN_LOW_CARB', 'VEGETARIAN'],
    containsIngredients: ['whey_protein', 'apples'],
    photoUrl: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=800&auto=format&fit=crop&q=80',
    description: 'Rapidly absorbing ultra-pure whey protein isolate paired with crisp Bulgarian apple.',
    prepTimeMinutes: 2,
    baseCalories: 230,
    baseProtein: 27,
    baseCarbs: 24,
    baseFats: 2,
    ingredients: [
      { name: '100% Whey Protein Isolate', nameBg: 'Суроватъчен протеин изолат', amountGrams: 30, unit: 'g (1 scoop)', calories: 114, protein: 25, carbs: 1, fats: 1, category: 'GRAINS_PANTRY' },
      { name: 'Fresh Crisp Apple', nameBg: 'Ябълка', amountGrams: 150, unit: 'g', calories: 78, protein: 0.5, carbs: 21, fats: 0.3, category: 'PRODUCE' },
      { name: 'Cold Filtered Water', nameBg: 'Филтрирана вода', amountGrams: 300, unit: 'ml', calories: 0, protein: 0, carbs: 0, fats: 0, category: 'PRODUCE' },
    ],
  },
  {
    id: 'snk-izkvara-bulgarian-honey-walnuts',
    name: 'Bulgarian Izkvara Sweet Whip with Walnuts & Cinnamon',
    nameBg: 'Крем от българска извара с орехи, канела и пчелен мед',
    category: 'SNACK',
    dietTags: ['BALANCED', 'MEDITERRANEAN', 'HIGH_PROTEIN_LOW_CARB', 'VEGETARIAN'],
    containsIngredients: ['cottage_izkvara', 'walnuts'],
    photoUrl: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800&auto=format&fit=crop&q=80',
    description: 'Slow-digesting micellar casein source ideal for sustained muscle recovery and satiety.',
    prepTimeMinutes: 4,
    baseCalories: 260,
    baseProtein: 26,
    baseCarbs: 16,
    baseFats: 10,
    ingredients: [
      { name: 'Low-Fat Bulgarian Izkvara', nameBg: 'Извара нискомаслена', amountGrams: 150, unit: 'g', calories: 128, protein: 24.8, carbs: 3.8, fats: 1.5, category: 'DAIRY_EGGS' },
      { name: 'Crushed Balkan Walnuts', nameBg: 'Български орехи', amountGrams: 15, unit: 'g', calories: 98, protein: 2.3, carbs: 2.1, fats: 9.8, category: 'FATS_NUTS' },
      { name: 'Honey & Cinnamon', nameBg: 'Мед и канела', amountGrams: 10, unit: 'g', calories: 30, protein: 0.1, carbs: 8.0, fats: 0.0, category: 'GRAINS_PANTRY' },
    ],
  },
];

/**
 * Filter recipe pool based on user avoidance and diet tags
 */
function getEligibleRecipes(category: 'BREAKFAST' | 'MAIN' | 'SNACK', avoided: string[], dietPreference: string) {
  return MASTER_RECIPES.filter((r) => {
    if (r.category !== category) return false;
    
    // Check if recipe contains any avoided ingredient
    if (avoided && avoided.length > 0) {
      const hasAvoided = r.containsIngredients.some((ing) => avoided.includes(ing));
      if (hasAvoided) return false;
    }

    // If vegetarian / pescatarian, check diet tags
    if (dietPreference === 'VEGETARIAN' && !r.dietTags.includes('VEGETARIAN')) return false;
    if (dietPreference === 'PESCATARIAN' && !r.dietTags.includes('PESCATARIAN') && !r.dietTags.includes('VEGETARIAN')) return false;

    return true;
  });
}

/**
 * Scale a recipe's macros and ingredients by a scaling multiplier
 */
function scaleRecipe(recipe: MealRecipeMaster, factor: number): MealOption {
  const f = Math.max(0.6, Math.min(2.0, factor));
  return {
    id: `${recipe.id}-${Math.round(f * 100)}`,
    name: recipe.name,
    nameBg: recipe.nameBg,
    description: recipe.description,
    photoUrl: recipe.photoUrl,
    prepTimeMinutes: recipe.prepTimeMinutes,
    calories: Math.round(recipe.baseCalories * f),
    protein: parseFloat((recipe.baseProtein * f).toFixed(1)),
    carbs: parseFloat((recipe.baseCarbs * f).toFixed(1)),
    fats: parseFloat((recipe.baseFats * f).toFixed(1)),
    ingredients: recipe.ingredients.map((ing) => ({
      ...ing,
      amountGrams: Math.round(ing.amountGrams * f),
      calories: Math.round(ing.calories * f),
      protein: parseFloat((ing.protein * f).toFixed(1)),
      carbs: parseFloat((ing.carbs * f).toFixed(1)),
      fats: parseFloat((ing.fats * f).toFixed(1)),
    })),
  };
}

/**
 * Synthesizes a comprehensive 7-day personalized meal program
 */
export function generateSevenDayMealPlan(input: MealPlanInput): SevenDayMealPlan {
  const {
    dailyCaloriesTarget,
    proteinTarget,
    carbsTarget,
    fatsTarget,
    foodPreferences = 'BALANCED',
    avoidedIngredients = [],
    mealsPerDay = 4,
  } = input;

  const daysOfWeek = [
    { name: 'Monday', nameBg: 'Понеделник' },
    { name: 'Tuesday', nameBg: 'Вторник' },
    { name: 'Wednesday', nameBg: 'Сряда' },
    { name: 'Thursday', nameBg: 'Четвъртък' },
    { name: 'Friday', nameBg: 'Петък' },
    { name: 'Saturday', nameBg: 'Събота' },
    { name: 'Sunday', nameBg: 'Неделя' },
  ];

  let eligibleBreakfasts = getEligibleRecipes('BREAKFAST', avoidedIngredients, foodPreferences);
  if (eligibleBreakfasts.length === 0) eligibleBreakfasts = MASTER_RECIPES.filter((r) => r.category === 'BREAKFAST');

  let eligibleMains = getEligibleRecipes('MAIN', avoidedIngredients, foodPreferences);
  if (eligibleMains.length === 0) eligibleMains = MASTER_RECIPES.filter((r) => r.category === 'MAIN');

  let eligibleSnacks = getEligibleRecipes('SNACK', avoidedIngredients, foodPreferences);
  if (eligibleSnacks.length === 0) eligibleSnacks = MASTER_RECIPES.filter((r) => r.category === 'SNACK');

  // Determine Meal Slots configuration based on mealsPerDay
  // 3 meals: Breakfast (28%), Lunch (38%), Dinner (34%)
  // 4 meals: Breakfast (25%), Lunch (33%), Fuel Snack (15%), Dinner (27%)
  // 5 meals: Breakfast (22%), Mid-Snack (13%), Lunch (30%), Afternoon Fuel (13%), Dinner (22%)
  const slotConfigs = [
    { name: 'Breakfast', nameBg: 'Закуска', pct: 0.25, category: 'BREAKFAST' as const },
    { name: 'Lunch', nameBg: 'Обяд', pct: 0.35, category: 'MAIN' as const },
    { name: 'Afternoon Fuel', nameBg: 'Следобедна закуска', pct: 0.15, category: 'SNACK' as const },
    { name: 'Dinner', nameBg: 'Вечеря', pct: 0.25, category: 'MAIN' as const },
  ];

  if (mealsPerDay === 3) {
    slotConfigs.splice(2, 1);
    slotConfigs[0].pct = 0.28;
    slotConfigs[1].pct = 0.38;
    slotConfigs[2].pct = 0.34;
  } else if (mealsPerDay === 5) {
    slotConfigs.splice(1, 0, { name: 'Mid-Morning Snack', nameBg: 'Втора закуска', pct: 0.12, category: 'SNACK' as const });
    slotConfigs[0].pct = 0.22;
    slotConfigs[2].pct = 0.30;
    slotConfigs[3].pct = 0.14;
    slotConfigs[4].pct = 0.22;
  }

  const days: DayMealPlan[] = daysOfWeek.map((day, dayIndex) => {
    let dayCalories = 0;
    let dayProtein = 0;
    let dayCarbs = 0;
    let dayFats = 0;

    const mealSlots: MealSlot[] = slotConfigs.map((slot, sIdx) => {
      const targetSlotCals = Math.round(dailyCaloriesTarget * slot.pct);
      const targetSlotP = Math.round(proteinTarget * slot.pct);
      const targetSlotC = Math.round(carbsTarget * slot.pct);
      const targetSlotF = Math.round(fatsTarget * slot.pct);

      const pool = slot.category === 'BREAKFAST' ? eligibleBreakfasts : slot.category === 'MAIN' ? eligibleMains : eligibleSnacks;
      
      // Cycle through recipes for variety across the 7 days
      const primaryIndex = (dayIndex + sIdx) % pool.length;
      const alt1Index = (primaryIndex + 1) % pool.length;
      const alt2Index = (primaryIndex + 2) % pool.length;

      const primaryBase = pool[primaryIndex] || pool[0];
      const alt1Base = pool[alt1Index] || pool[0];
      const alt2Base = pool[alt2Index] || pool[0];

      const scalePrimary = targetSlotCals / primaryBase.baseCalories;
      const scaleAlt1 = targetSlotCals / alt1Base.baseCalories;
      const scaleAlt2 = targetSlotCals / alt2Base.baseCalories;

      const recommendedMeal = scaleRecipe(primaryBase, scalePrimary);
      const alternative1 = scaleRecipe(alt1Base, scaleAlt1);
      const alternative2 = scaleRecipe(alt2Base, scaleAlt2);

      dayCalories += recommendedMeal.calories;
      dayProtein += recommendedMeal.protein;
      dayCarbs += recommendedMeal.carbs;
      dayFats += recommendedMeal.fats;

      return {
        slotId: `day-${dayIndex}-slot-${sIdx}`,
        slotName: slot.name,
        slotNameBg: slot.nameBg,
        targetCalories: targetSlotCals,
        targetProtein: targetSlotP,
        targetCarbs: targetSlotC,
        targetFats: targetSlotF,
        recommendedMeal,
        alternative1,
        alternative2,
      };
    });

    return {
      dayIndex,
      dayName: day.name,
      dayNameBg: day.nameBg,
      totalCalories: dayCalories,
      totalProtein: parseFloat(dayProtein.toFixed(1)),
      totalCarbs: parseFloat(dayCarbs.toFixed(1)),
      totalFats: parseFloat(dayFats.toFixed(1)),
      mealSlots,
    };
  });

  return {
    planTitle: `Personalized 7-Day High-Performance Protocol (${dailyCaloriesTarget} kcal)`,
    dietStyle: foodPreferences,
    dailyCaloriesTarget,
    proteinTarget,
    carbsTarget,
    fatsTarget,
    days,
  };
}

/**
 * Aggregates all ingredients across the 7-day plan into categorized weekly grocery items
 */
export function generateWeeklyGroceryList(plan: SevenDayMealPlan): WeeklyGroceryCategory[] {
  if (!plan || !plan.days) return [];

  // Map to hold aggregated quantities by item name
  const itemMap: Record<string, { name: string; nameBg: string; totalGrams: number; category: string; unit: string }> = {};

  plan.days.forEach((day) => {
    day.mealSlots.forEach((slot) => {
      // Aggregate recommended meal ingredients
      const meal = slot.recommendedMeal;
      if (meal && meal.ingredients) {
        meal.ingredients.forEach((ing) => {
          const key = (ing.nameBg || ing.name).toLowerCase().trim();
          if (!itemMap[key]) {
            itemMap[key] = {
              name: ing.name,
              nameBg: ing.nameBg || ing.name,
              totalGrams: 0,
              category: ing.category || 'GRAINS_PANTRY',
              unit: ing.unit || 'g',
            };
          }
          itemMap[key].totalGrams += ing.amountGrams;
        });
      }
    });
  });

  const categoriesDef: { key: string; title: string; titleBg: string; icon: string }[] = [
    { key: 'MEAT_POULTRY', title: 'Meat & Poultry', titleBg: 'Месо и Птици', icon: '🥩' },
    { key: 'SEAFOOD', title: 'Fish & Seafood', titleBg: 'Риба и Морски дарове', icon: '🐟' },
    { key: 'DAIRY_EGGS', title: 'Dairy & Farm Eggs', titleBg: 'Млечни продукти и Яйца', icon: '🧀' },
    { key: 'PRODUCE', title: 'Fresh Produce & Vegetables', titleBg: 'Пресни зеленчуци и плодове', icon: '🥦' },
    { key: 'GRAINS_PANTRY', title: 'Grains, Oats & Carbs', titleBg: 'Зърнени, Овес и Паста', icon: '🍚' },
    { key: 'FATS_NUTS', title: 'Healthy Fats, Nuts & Oils', titleBg: 'Ядки, Зехтин и Полезни мазнини', icon: '🥑' },
    { key: 'OTHER', title: 'Pantry & Spices', titleBg: 'Подправки и Други', icon: '🧂' },
  ];

  const result: WeeklyGroceryCategory[] = [];

  categoriesDef.forEach((cat) => {
    const matchedItems: WeeklyGroceryItem[] = [];
    Object.values(itemMap).forEach((item) => {
      if (item.category === cat.key || (cat.key === 'MEAT_POULTRY' && item.category === 'MEAT_FISH')) {
        matchedItems.push({
          name: item.name,
          nameBg: item.nameBg,
          totalGrams: Math.round(item.totalGrams),
          category: cat.key,
          unit: 'g',
        });
      }
    });

    if (matchedItems.length > 0) {
      result.push({
        categoryKey: cat.key,
        title: cat.title,
        titleBg: cat.titleBg,
        icon: cat.icon,
        items: matchedItems.sort((a, b) => b.totalGrams - a.totalGrams),
      });
    }
  });

  return result;
}

export interface MealSlotOptionsSummary {
  categoryKey: string;
  categoryTitleBg: string;
  icon: string;
  meals: MealOption[];
}

/**
 * Extracts unique recipe options for each meal category (Breakfast, Lunch, Dinner, Snack)
 * with their ingredients and macros for detailed recipe browsing
 */
export function generateDetailedMealOptionsBreakdown(plan: SevenDayMealPlan): MealSlotOptionsSummary[] {
  if (!plan || !plan.days) return [];

  const breakfasts: Map<string, MealOption> = new Map();
  const lunches: Map<string, MealOption> = new Map();
  const dinners: Map<string, MealOption> = new Map();
  const snacks: Map<string, MealOption> = new Map();

  plan.days.forEach((day) => {
    day.mealSlots.forEach((slot) => {
      const slotName = slot.slotName.toLowerCase();
      let targetMap = lunches;
      if (slotName.includes('breakfast') || slotName.includes('закуска')) {
        targetMap = breakfasts;
      } else if (slotName.includes('lunch') || slotName.includes('обяд')) {
        targetMap = lunches;
      } else if (slotName.includes('dinner') || slotName.includes('вечеря')) {
        targetMap = dinners;
      } else {
        targetMap = snacks;
      }

      if (slot.recommendedMeal && !targetMap.has(slot.recommendedMeal.id)) {
        targetMap.set(slot.recommendedMeal.id, slot.recommendedMeal);
      }
      if (slot.alternative1 && !targetMap.has(slot.alternative1.id)) {
        targetMap.set(slot.alternative1.id, slot.alternative1);
      }
      if (slot.alternative2 && !targetMap.has(slot.alternative2.id)) {
        targetMap.set(slot.alternative2.id, slot.alternative2);
      }
    });
  });

  return [
    {
      categoryKey: 'BREAKFAST',
      categoryTitleBg: 'Закуска (Всички Опции & Рецепти)',
      icon: '🍳',
      meals: Array.from(breakfasts.values()),
    },
    {
      categoryKey: 'LUNCH',
      categoryTitleBg: 'Обяд (Всички Опции & Рецепти)',
      icon: '🥩',
      meals: Array.from(lunches.values()),
    },
    {
      categoryKey: 'DINNER',
      categoryTitleBg: 'Вечеря (Всички Опции & Рецепти)',
      icon: '🥗',
      meals: Array.from(dinners.values()),
    },
    {
      categoryKey: 'SNACK',
      categoryTitleBg: 'Междинни хранения & Десерти',
      icon: '🥑',
      meals: Array.from(snacks.values()),
    },
  ].filter((c) => c.meals.length > 0);
}

