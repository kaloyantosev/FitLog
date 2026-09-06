export interface IngredientItem {
  id: string;
  name: string;
  nameBg: string;
  category: 'MEAT_POULTRY' | 'FISH_SEAFOOD' | 'DAIRY_EGGS' | 'VEGETABLES' | 'GRAINS_GLUTEN' | 'NUTS_FATS_SEEDS' | 'OTHER';
}

export const SEARCHABLE_INGREDIENTS: IngredientItem[] = [
  // --- MEATS & POULTRY ---
  { id: 'pork', name: 'Pork (Свинско месо)', nameBg: 'Свинско месо', category: 'MEAT_POULTRY' },
  { id: 'beef', name: 'Beef / Steak (Телешко / Говеждо)', nameBg: 'Телешко месо', category: 'MEAT_POULTRY' },
  { id: 'chicken', name: 'Chicken Breast / Meat (Пилешко)', nameBg: 'Пилешко месо', category: 'MEAT_POULTRY' },
  { id: 'turkey', name: 'Turkey Fillet (Пуешко месо)', nameBg: 'Пуешко месо', category: 'MEAT_POULTRY' },
  { id: 'lamb', name: 'Lamb (Агнешко месо)', nameBg: 'Агнешко месо', category: 'MEAT_POULTRY' },
  { id: 'duck', name: 'Duck (Патешко)', nameBg: 'Патешко месо', category: 'MEAT_POULTRY' },
  { id: 'organ_meats', name: 'Liver & Organ Meats (Дроб / Карантия)', nameBg: 'Черен дроб и субпродукти', category: 'MEAT_POULTRY' },
  { id: 'bacon_cured', name: 'Bacon / Lukanka / Salami (Бекон / Луканка)', nameBg: 'Бекон / Колбаси', category: 'MEAT_POULTRY' },

  // --- FISH & SEAFOOD ---
  { id: 'salmon', name: 'Salmon (Сьомга)', nameBg: 'Сьомга', category: 'FISH_SEAFOOD' },
  { id: 'tuna', name: 'Tuna (Риба тон)', nameBg: 'Риба тон', category: 'FISH_SEAFOOD' },
  { id: 'trout', name: 'Trout / White Fish (Пъстърва / Бяла риба)', nameBg: 'Пъстърва / Бяла риба', category: 'FISH_SEAFOOD' },
  { id: 'mackerel', name: 'Mackerel (Скумрия)', nameBg: 'Скумрия', category: 'FISH_SEAFOOD' },
  { id: 'shrimp', name: 'Shrimp / Prawns (Скариди)', nameBg: 'Скариди', category: 'FISH_SEAFOOD' },
  { id: 'mussels', name: 'Mussels (Миди)', nameBg: 'Миди', category: 'FISH_SEAFOOD' },
  { id: 'squid_octopus', name: 'Calamari / Octopus (Калмари / Октопод)', nameBg: 'Калмари / Октопод', category: 'FISH_SEAFOOD' },

  // --- DAIRY & EGGS ---
  { id: 'cow_sirene', name: 'Cow Sirene (Краве сирене)', nameBg: 'Краве сирене', category: 'DAIRY_EGGS' },
  { id: 'sheep_sirene', name: 'Sheep / Goat Cheese (Овче / Козе сирене)', nameBg: 'Овче / Козе сирене', category: 'DAIRY_EGGS' },
  { id: 'kashkaval', name: 'Kashkaval / Yellow Cheese (Кашкавал)', nameBg: 'Кашкавал', category: 'DAIRY_EGGS' },
  { id: 'yogurt_bulgarian', name: 'Bulgarian Yogurt (Кисело мляко)', nameBg: 'Кисело мляко', category: 'DAIRY_EGGS' },
  { id: 'fresh_milk', name: 'Fresh Milk / Cow Milk (Прясно мляко)', nameBg: 'Прясно мляко', category: 'DAIRY_EGGS' },
  { id: 'cottage_izkvara', name: 'Izkvara / Cottage Cheese (Извара)', nameBg: 'Извара', category: 'DAIRY_EGGS' },
  { id: 'skyr', name: 'Skyr (Скир)', nameBg: 'Скир', category: 'DAIRY_EGGS' },
  { id: 'whole_eggs', name: 'Whole Eggs (Цели яйца / Жълтъци)', nameBg: 'Цели яйца', category: 'DAIRY_EGGS' },
  { id: 'egg_whites', name: 'Egg Whites (Яйчен белтък)', nameBg: 'Яйчен белтък', category: 'DAIRY_EGGS' },
  { id: 'whey_protein', name: 'Whey Protein Powder (Суроватъчен протеин)', nameBg: 'Суроватъчен протеин', category: 'DAIRY_EGGS' },

  // --- VEGETABLES & LEGUMES ---
  { id: 'broccoli', name: 'Broccoli (Броколи)', nameBg: 'Броколи', category: 'VEGETABLES' },
  { id: 'spinach', name: 'Spinach / Greens (Спанак / Зеленолистни)', nameBg: 'Спанак', category: 'VEGETABLES' },
  { id: 'tomatoes', name: 'Tomatoes (Домати)', nameBg: 'Домати', category: 'VEGETABLES' },
  { id: 'cucumbers', name: 'Cucumbers (Краставици)', nameBg: 'Краставици', category: 'VEGETABLES' },
  { id: 'peppers', name: 'Bell Peppers (Чушки / Пипер)', nameBg: 'Чушки', category: 'VEGETABLES' },
  { id: 'onions', name: 'Onions (Лук)', nameBg: 'Лук', category: 'VEGETABLES' },
  { id: 'garlic', name: 'Garlic (Чесън)', nameBg: 'Чесън', category: 'VEGETABLES' },
  { id: 'mushrooms', name: 'Mushrooms (Гъби)', nameBg: 'Гъби', category: 'VEGETABLES' },
  { id: 'eggplant', name: 'Eggplant (Патладжан)', nameBg: 'Патладжан', category: 'VEGETABLES' },
  { id: 'zucchini', name: 'Zucchini / Courgette (Тиквички)', nameBg: 'Тиквички', category: 'VEGETABLES' },
  { id: 'asparagus', name: 'Asparagus (Аспержи)', nameBg: 'Аспержи', category: 'VEGETABLES' },
  { id: 'cabbage', name: 'Cabbage (Зеле)', nameBg: 'Зеле', category: 'VEGETABLES' },
  { id: 'cauliflower', name: 'Cauliflower (Карфиол)', nameBg: 'Карфиол', category: 'VEGETABLES' },
  { id: 'beans_lentils', name: 'Beans & Lentils (Боб и Леща)', nameBg: 'Боб и Леща', category: 'VEGETABLES' },
  { id: 'corn', name: 'Sweet Corn (Царевица)', nameBg: 'Царевица', category: 'VEGETABLES' },

  // --- GRAINS, CARBS & GLUTEN ---
  { id: 'white_rice', name: 'White Rice / Jasmine (Бял ориз)', nameBg: 'Бял ориз', category: 'GRAINS_GLUTEN' },
  { id: 'brown_rice', name: 'Brown / Wild Rice (Кафяв ориз)', nameBg: 'Кафяв ориз', category: 'GRAINS_GLUTEN' },
  { id: 'oats', name: 'Oats / Oatmeal (Овесени ядки)', nameBg: 'Овесени ядки', category: 'GRAINS_GLUTEN' },
  { id: 'potatoes', name: 'White Potatoes (Картофи)', nameBg: 'Картофи', category: 'GRAINS_GLUTEN' },
  { id: 'sweet_potatoes', name: 'Sweet Potatoes (Сладки картофи / Батат)', nameBg: 'Сладки картофи', category: 'GRAINS_GLUTEN' },
  { id: 'wholewheat_bread', name: 'Wholewheat Bread (Пълнозърнест хляб / Вита)', nameBg: 'Пълнозърнест хляб', category: 'GRAINS_GLUTEN' },
  { id: 'pasta_gluten', name: 'Pasta & Gluten (Паста / Макарони / Глутен)', nameBg: 'Паста и тестени изделия', category: 'GRAINS_GLUTEN' },
  { id: 'quinoa', name: 'Quinoa / Buckwheat (Киноа / Елда)', nameBg: 'Киноа / Елда', category: 'GRAINS_GLUTEN' },
  { id: 'rice_cakes', name: 'Rice Cakes (Оризовки)', nameBg: 'Оризовки', category: 'GRAINS_GLUTEN' },

  // --- NUTS, SEEDS & HEALTHY FATS ---
  { id: 'peanuts', name: 'Peanuts & Peanut Butter (Фъстъци / Фъстъчено масло)', nameBg: 'Фъстъци и фъстъчено масло', category: 'NUTS_FATS_SEEDS' },
  { id: 'almonds', name: 'Almonds (Бадеми)', nameBg: 'Бадеми', category: 'NUTS_FATS_SEEDS' },
  { id: 'walnuts', name: 'Walnuts (Орехи)', nameBg: 'Орехи', category: 'NUTS_FATS_SEEDS' },
  { id: 'cashews', name: 'Cashews (Кашу)', nameBg: 'Кашу', category: 'NUTS_FATS_SEEDS' },
  { id: 'avocado', name: 'Avocado (Авокадо)', nameBg: 'Авокадо', category: 'NUTS_FATS_SEEDS' },
  { id: 'olive_oil', name: 'Olive Oil (Зехтин)', nameBg: 'Зехтин', category: 'NUTS_FATS_SEEDS' },
  { id: 'chia_flax', name: 'Chia Seeds & Flaxseeds (Чиа / Ленено семе)', nameBg: 'Чиа и Ленено семе', category: 'NUTS_FATS_SEEDS' },

  // --- FRUITS ---
  { id: 'bananas', name: 'Bananas (Банани)', nameBg: 'Банани', category: 'OTHER' },
  { id: 'apples', name: 'Apples (Ябълки)', nameBg: 'Ябълки', category: 'OTHER' },
  { id: 'berries', name: 'Berries / Blueberries (Боровинки / Горски плодове)', nameBg: 'Боровинки и горски плодове', category: 'OTHER' },
  { id: 'citrus', name: 'Citrus / Oranges (Портокали / Грейпфрут)', nameBg: 'Цитруси', category: 'OTHER' },
];

export function filterIngredients(query: string): IngredientItem[] {
  if (!query || !query.trim()) return SEARCHABLE_INGREDIENTS;
  const q = query.toLowerCase().trim();
  return SEARCHABLE_INGREDIENTS.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.nameBg.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
  );
}
