'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Flame, 
  Plus, 
  Trash2, 
  Droplets,
  Droplet, 
  Settings2, 
  Utensils, 
  Check, 
  X, 
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Scan,
  Camera,
  Search,
  ShoppingBag,
  Eye,
  CheckSquare,
  Square,
  Copy,
  ChefHat,
  RotateCcw,
  CheckCircle2,
  PackageCheck
} from 'lucide-react';
import { 
  NutritionEntry, 
  UserProfile, 
  SevenDayMealPlan, 
  DayMealPlan, 
  MealSlot, 
  MealOption, 
  WeeklyGroceryCategory, 
  WeeklyGroceryItem 
} from '@/types';
import BarcodeScannerModal from '@/components/BarcodeScannerModal';
import FoodPhotoScannerModal from '@/components/FoodPhotoScannerModal';
import MealIngredientsModal from '@/components/MealIngredientsModal';
import { searchFoods, FoodDatabaseItem, BULGARIAN_AND_GLOBAL_FOODS } from '@/lib/foodDatabase';
import { 
  generateSevenDayMealPlan, 
  generateWeeklyGroceryList, 
  generateDetailedMealOptionsBreakdown, 
  MealSlotOptionsSummary 
} from '@/lib/mealPlanGenerator';

export default function NutritionPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [logs, setLogs] = useState<NutritionEntry[]>([]);
  const [waterMl, setWaterMl] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Load water for selected date from localStorage (defaults to 0 for new registration / new days)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`fitlog_water_${selectedDate}`);
      setWaterMl(saved !== null ? parseInt(saved, 10) || 0 : 0);
    }
  }, [selectedDate]);

  const changeWater = (delta: number | 'RESET') => {
    setWaterMl((prev) => {
      const next = delta === 'RESET' ? 0 : Math.max(0, prev + delta);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`fitlog_water_${selectedDate}`, String(next));
      }
      return next;
    });
  };

  // 7-Day Meal Plan State
  const [mealPlan, setMealPlan] = useState<SevenDayMealPlan | null>(null);
  const [activePlanDayIndex, setActivePlanDayIndex] = useState<number>(0); // 0 = Monday, ..., 6 = Sunday
  const [selectedSlotOptions, setSelectedSlotOptions] = useState<Record<string, number>>({});
  const [selectedMealForModal, setSelectedMealForModal] = useState<MealOption | null>(null);
  const [groceryCheckedItems, setGroceryCheckedItems] = useState<Record<string, boolean>>({});
  const [selectedGroceryMealIds, setSelectedGroceryMealIds] = useState<Record<string, boolean>>({});
  const [copiedGroceryList, setCopiedGroceryList] = useState(false);
  const [mealLogNotification, setMealLogNotification] = useState<string | null>(null);
  
  // Track logged status for slots to show green "✓ Вписано" and disable
  const [loggedSlots, setLoggedSlots] = useState<Record<string, boolean>>({});
  const [loggedWholeDay, setLoggedWholeDay] = useState<Record<number, boolean>>({});

  // Grocery View Mode: 'BULK_SUMMARY' or 'RECIPE_OPTIONS'
  const [groceryViewMode, setGroceryViewMode] = useState<'BULK_SUMMARY' | 'RECIPE_OPTIONS'>('BULK_SUMMARY');

  // Food Database Live Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodDatabaseItem[]>(BULGARIAN_AND_GLOBAL_FOODS.slice(0, 8));
  const [selectedDbItem, setSelectedDbItem] = useState<FoodDatabaseItem | null>(null);
  const [portionGrams, setPortionGrams] = useState<string>('100');
  const [activeAddTab, setActiveAddTab] = useState<'SEARCH' | 'CUSTOM'>('SEARCH');

  // Barcode & Photo Scanner Modal state
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Add Food Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACKS'>('BREAKFAST');
  const [foodForm, setFoodForm] = useState({
    foodName: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
  });

  // Edit Targets Modal state
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [targetsForm, setTargetsForm] = useState({
    dailyCaloriesTarget: '2500',
    proteinTarget: '185',
    carbsTarget: '260',
    fatsTarget: '65',
    waterTargetMl: '3500',
  });

  useEffect(() => {
    // Determine active day index from selected date
    const d = new Date(selectedDate);
    const jsDay = d.getDay(); // 0 = Sun, 1 = Mon ...
    const planDay = jsDay === 0 ? 6 : jsDay - 1;
    setActivePlanDayIndex(planDay);

    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      const [userRes, nutrRes] = await Promise.all([
        fetch('/api/user').then((r) => r.json()),
        fetch(`/api/nutrition?date=${selectedDate}`).then((r) => r.json()),
      ]);

      if (userRes && !userRes.error) {
        setUser(userRes);
        setTargetsForm({
          dailyCaloriesTarget: String(userRes.dailyCaloriesTarget || 2500),
          proteinTarget: String(userRes.proteinTarget || 185),
          carbsTarget: String(userRes.carbsTarget || 260),
          fatsTarget: String(userRes.fatsTarget || 65),
          waterTargetMl: String(userRes.waterTargetMl || 3500),
        });

        // Parse or synthesize 7-day meal plan
        let plan: SevenDayMealPlan | null = null;
        if (userRes.mealPlanData) {
          try {
            plan = typeof userRes.mealPlanData === 'string' ? JSON.parse(userRes.mealPlanData) : userRes.mealPlanData;
          } catch (e) {
            console.error('Failed to parse user mealPlanData', e);
          }
        }

        if (!plan) {
          plan = generateSevenDayMealPlan({
            dailyCaloriesTarget: userRes.dailyCaloriesTarget || 2500,
            proteinTarget: userRes.proteinTarget || 185,
            carbsTarget: userRes.carbsTarget || 260,
            fatsTarget: userRes.fatsTarget || 65,
            foodPreferences: userRes.foodPreferences || 'BALANCED',
            avoidedIngredients: userRes.avoidedIngredients || [],
            mealsPerDay: userRes.mealsPerDay || 4,
            mealTiming: userRes.mealTiming,
            snackingHabits: userRes.snackingHabits,
          });
        }

        setMealPlan(plan);
      }

      if (Array.isArray(nutrRes)) {
        setLogs(nutrRes);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodForm.foodName.trim()) return;

    try {
      await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          mealType: selectedMealType,
          foodName: foodForm.foodName,
          calories: parseInt(foodForm.calories) || 0,
          protein: parseFloat(foodForm.protein) || 0,
          carbs: parseFloat(foodForm.carbs) || 0,
          fats: parseFloat(foodForm.fats) || 0,
        }),
      });

      setFoodForm({ foodName: '', calories: '', protein: '', carbs: '', fats: '' });
      setIsAddModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFood = async (id: string) => {
    try {
      await fetch(`/api/nutrition/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleScannedProductAdded = async (product: {
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }) => {
    try {
      await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          mealType: selectedMealType,
          ...product,
        }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveTargets = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dailyCaloriesTarget: parseInt(targetsForm.dailyCaloriesTarget) || 2500,
          proteinTarget: parseInt(targetsForm.proteinTarget) || 185,
          carbsTarget: parseInt(targetsForm.carbsTarget) || 260,
          fatsTarget: parseInt(targetsForm.fatsTarget) || 65,
          waterTargetMl: parseInt(targetsForm.waterTargetMl) || 3500,
        }),
      });
      const updated = await res.json();
      if (updated && !updated.error) {
        setUser(updated);
        setIsTargetModalOpen(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchFoodsChange = (q: string) => {
    setSearchQuery(q);
    const results = searchFoods(q);
    setSearchResults(results.slice(0, 10));
  };

  const handleAddDbFood = async (item: FoodDatabaseItem, grams: number, mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACKS') => {
    const factor = grams / 100;
    const calories = Math.round(item.caloriesPer100g * factor);
    const protein = parseFloat((item.proteinPer100g * factor).toFixed(1));
    const carbs = parseFloat((item.carbsPer100g * factor).toFixed(1));
    const fats = parseFloat((item.fatsPer100g * factor).toFixed(1));

    try {
      await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          mealType,
          foodName: `${item.nameBg || item.name} (${grams}г)`,
          calories,
          protein,
          carbs,
          fats,
        }),
      });

      setSelectedDbItem(null);
      setIsAddModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const groceryCategories = useMemo(() => {
    if (!mealPlan) return [];
    return generateWeeklyGroceryList(mealPlan);
  }, [mealPlan]);

  const detailedMealOptions = useMemo(() => {
    if (!mealPlan) return [];
    return generateDetailedMealOptionsBreakdown(mealPlan);
  }, [mealPlan]);

  // Start with clean grocery selection (empty) as requested
  const toggleGroceryMeal = (mealId: string) => {
    setSelectedGroceryMealIds((prev) => ({
      ...prev,
      [mealId]: !prev[mealId],
    }));
  };

  const selectAllGroceryMeals = () => {
    const next: Record<string, boolean> = {};
    detailedMealOptions.forEach((cat) => {
      cat.meals.forEach((m) => {
        next[m.id] = true;
      });
    });
    setSelectedGroceryMealIds(next);
  };

  const deselectAllGroceryMeals = () => {
    setSelectedGroceryMealIds({});
  };

  // Consolidated Ingredients calculation for selected meals
  const consolidatedSelectedIngredients = useMemo(() => {
    const map: Record<string, { name: string; nameBg: string; totalGrams: number; unit: string; category: string }> = {};
    let selectedMealsCount = 0;

    detailedMealOptions.forEach((cat) => {
      cat.meals.forEach((m) => {
        if (selectedGroceryMealIds[m.id]) {
          selectedMealsCount++;
          (m.ingredients || []).forEach((ing) => {
            const key = (ing.nameBg || ing.name).toLowerCase().trim();
            if (!map[key]) {
              map[key] = {
                name: ing.name,
                nameBg: ing.nameBg || ing.name,
                totalGrams: ing.amountGrams,
                unit: ing.unit || 'г',
                category: ing.category || 'GRAINS_PANTRY',
              };
            } else {
              map[key].totalGrams += ing.amountGrams;
            }
          });
        }
      });
    });

    const categoryTitles: Record<string, { title: string; icon: string }> = {
      MEAT_FISH: { title: 'Месо, риба и птици', icon: '🥩' },
      DAIRY_EGGS: { title: 'Млечни продукти и яйца', icon: '🧀' },
      GRAINS_PANTRY: { title: 'Зърнени, овес и варива', icon: '🌾' },
      PRODUCE: { title: 'Зеленчуци и плодове', icon: '🥦' },
      FATS_NUTS: { title: 'Ядки и здравословни мазнини', icon: '🥑' },
    };

    const grouped: Record<string, { title: string; icon: string; items: { name: string; nameBg: string; totalGrams: number; unit: string; category: string }[] }> = {};
    Object.values(map).forEach((ing) => {
      const catKey = ing.category || 'GRAINS_PANTRY';
      if (!grouped[catKey]) {
        grouped[catKey] = {
          title: categoryTitles[catKey]?.title || 'Други продукти',
          icon: categoryTitles[catKey]?.icon || '🛒',
          items: [],
        };
      }
      grouped[catKey].items.push(ing);
    });

    let totalWeightGrams = 0;
    Object.values(map).forEach((i) => {
      totalWeightGrams += i.totalGrams;
    });

    return {
      grouped,
      totalWeightGrams,
      totalWeightKg: (totalWeightGrams / 1000).toFixed(2),
      totalUniqueItems: Object.keys(map).length,
      selectedMealsCount,
    };
  }, [detailedMealOptions, selectedGroceryMealIds]);

  const toggleGroceryItem = (key: string) => {
    setGroceryCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Compute bulk summary statistics (total kg of selected items)
  const bulkSelectedStats = useMemo(() => {
    let totalGrams = 0;
    let selectedCount = 0;
    let totalItems = 0;

    groceryCategories.forEach((cat) => {
      cat.items.forEach((it) => {
        totalItems++;
        const itemKey = `${cat.categoryKey}-${it.name}`;
        if (groceryCheckedItems[itemKey]) {
          totalGrams += it.totalGrams;
          selectedCount++;
        }
      });
    });

    return {
      totalGrams,
      totalKg: (totalGrams / 1000).toFixed(2),
      selectedCount,
      totalItems,
    };
  }, [groceryCategories, groceryCheckedItems]);

  const selectAllGroceryItems = () => {
    const next: Record<string, boolean> = {};
    groceryCategories.forEach((cat) => {
      cat.items.forEach((it) => {
        next[`${cat.categoryKey}-${it.name}`] = true;
      });
    });
    setGroceryCheckedItems(next);
  };

  const deselectAllGroceryItems = () => {
    setGroceryCheckedItems({});
  };

  const copyGroceryListText = () => {
    let text = `🛒 FITLOG – СПИСЪК ЗА ПАЗАРУВАНЕ ЗА ИЗБРАНИТЕ ЯСТИЯ (${consolidatedSelectedIngredients.selectedMealsCount} избрани рецепти)\n\n`;
    
    Object.entries(consolidatedSelectedIngredients.grouped).forEach(([catKey, group]) => {
      if (group.items.length === 0) return;
      text += `--- ${group.icon} ${group.title} ---\n`;
      group.items.forEach((it) => {
        text += `• ${it.nameBg || it.name}: ${it.totalGrams >= 1000 ? `${(it.totalGrams / 1000).toFixed(2)} кг` : `${it.totalGrams} ${it.unit || 'г'}`}\n`;
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedGroceryList(true);
    setTimeout(() => setCopiedGroceryList(false), 2500);
  };

  const handleLogMealOption = async (option: MealOption, slotKey: string, slotNameBg: string) => {
    if (loggedSlots[slotKey]) return;

    let mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACKS' = 'SNACKS';
    const lower = slotNameBg.toLowerCase();
    if (lower.includes('закуска') || lower.includes('breakfast')) mealType = 'BREAKFAST';
    else if (lower.includes('обяд') || lower.includes('lunch')) mealType = 'LUNCH';
    else if (lower.includes('вечеря') || lower.includes('dinner')) mealType = 'DINNER';

    try {
      await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          mealType,
          foodName: option.nameBg || option.name,
          calories: option.calories,
          protein: option.protein,
          carbs: option.carbs,
          fats: option.fats,
        }),
      });

      setLoggedSlots((prev) => ({ ...prev, [slotKey]: true }));
      setMealLogNotification(`Успешно записахте "${option.nameBg || option.name}" (${option.calories} ккал) в дневника!`);
      setTimeout(() => setMealLogNotification(null), 3000);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogAllDayMeals = async (dayPlan: DayMealPlan, dayIdx: number) => {
    if (loggedWholeDay[dayIdx]) return;

    try {
      for (const slot of dayPlan.mealSlots) {
        const selectedOptIdx = selectedSlotOptions[slot.slotId] || 0;
        const option = selectedOptIdx === 0 ? slot.recommendedMeal : selectedOptIdx === 1 ? slot.alternative1 : slot.alternative2;
        let mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACKS' = 'SNACKS';
        const lower = (slot.slotNameBg || slot.slotName).toLowerCase();
        if (lower.includes('закуска')) mealType = 'BREAKFAST';
        else if (lower.includes('обяд')) mealType = 'LUNCH';
        else if (lower.includes('вечеря')) mealType = 'DINNER';

        await fetch('/api/nutrition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: selectedDate,
            mealType,
            foodName: option.nameBg || option.name,
            calories: option.calories,
            protein: option.protein,
            carbs: option.carbs,
            fats: option.fats,
          }),
        });

        const slotKey = `${dayIdx}-${slot.slotId}`;
        setLoggedSlots((prev) => ({ ...prev, [slotKey]: true }));
      }

      setLoggedWholeDay((prev) => ({ ...prev, [dayIdx]: true }));
      setMealLogNotification(`Всички ${dayPlan.mealSlots.length} хранения за ${dayPlan.dayNameBg || dayPlan.dayName} са записани в дневника!`);
      setTimeout(() => setMealLogNotification(null), 3500);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Totals calculation
  const totalCal = logs.reduce((acc, i) => acc + i.calories, 0);
  const totalP = logs.reduce((acc, i) => acc + i.protein, 0);
  const totalC = logs.reduce((acc, i) => acc + i.carbs, 0);
  const totalF = logs.reduce((acc, i) => acc + i.fats, 0);

  const calTarget = user?.dailyCaloriesTarget || 2500;
  const pTarget = user?.proteinTarget || 185;
  const cTarget = user?.carbsTarget || 260;
  const fTarget = user?.fatsTarget || 65;
  const wTarget = user?.waterTargetMl || 3500;

  const mealTypesConfig: { type: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACKS'; label: string; icon: string }[] = [
    { type: 'BREAKFAST', label: 'Закуска', icon: '🍳' },
    { type: 'LUNCH', label: 'Обяд', icon: '🥩' },
    { type: 'DINNER', label: 'Вечеря', icon: '🥗' },
    { type: 'SNACKS', label: 'Междинни хранения', icon: '🥑' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          <span className="text-text-muted text-sm font-medium">Зареждане на хранителния режим...</span>
        </div>
      </div>
    );
  }

  const activeDayPlan = mealPlan?.days?.[activePlanDayIndex];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Date Controller */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-2 border border-border text-text-secondary uppercase tracking-wider">
              Хранене и калориен баланс
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Хранене и Макронутриенти</h1>
          <p className="text-sm text-text-muted mt-1">
            Следете ежедневния си калориен баланс, макронутриенти и вода с мигновен скенер за баркод и AI снимка.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* AI Photo Recognition Button */}
          <button
            onClick={() => {
              setSelectedMealType('LUNCH');
              setIsPhotoModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold text-xs transition-all active:scale-95 shadow-sm"
          >
            <Camera className="w-4 h-4" />
            AI Снимка на храна
          </button>

          {/* Quick Scan Barcode Button */}
          <button
            onClick={() => {
              setSelectedMealType('SNACKS');
              setIsBarcodeModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all shadow-md active:scale-95"
          >
            <Scan className="w-4 h-4" />
            Скенер за Баркод
          </button>

          {/* Date Selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-1 border border-border">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm text-white font-mono focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {mealLogNotification && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between animate-fadeIn text-emerald-300 text-xs font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{mealLogNotification}</span>
          </div>
          <button onClick={() => setMealLogNotification(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Macro Summary Dashboard (Calories, Protein, Carbs, Fats, Water) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Calories Card */}
        <div className="p-4 rounded-2xl bg-surface-1 border border-border relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-text-muted mb-2 font-medium">
              <span className="flex items-center gap-1.5 text-white">
                <Flame className="w-4 h-4 text-orange-400" />
                Калории
              </span>
              <span className="font-mono text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20">Цел: {calTarget} ккал</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-white">{totalCal}</span>
              <span className="text-[11px] text-text-muted font-mono">
                ({Math.max(0, calTarget - totalCal)} оставащи)
              </span>
            </div>
          </div>
          <div className="w-full bg-surface-3 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${totalCal > calTarget ? 'bg-red-500' : 'bg-orange-500'}`}
              style={{ width: `${Math.min(100, (totalCal / calTarget) * 100)}%` }}
            />
          </div>
        </div>

        {/* Protein Card */}
        <div className="p-4 rounded-2xl bg-surface-1 border border-border relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-text-muted mb-2 font-medium">
              <span className="text-blue-400 font-semibold">Протеин</span>
              <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">Цел: {pTarget}г</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-white">{totalP.toFixed(1)}</span>
              <span className="text-[11px] text-text-muted font-mono">г ({Math.round((totalP / pTarget) * 100)}%)</span>
            </div>
          </div>
          <div className="w-full bg-surface-3 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(100, (totalP / pTarget) * 100)}%` }}
            />
          </div>
        </div>

        {/* Carbs Card */}
        <div className="p-4 rounded-2xl bg-surface-1 border border-border relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-text-muted mb-2 font-medium">
              <span className="text-amber-400 font-semibold">Въглехидрати</span>
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">Цел: {cTarget}г</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-white">{totalC.toFixed(1)}</span>
              <span className="text-[11px] text-text-muted font-mono">г ({Math.round((totalC / cTarget) * 100)}%)</span>
            </div>
          </div>
          <div className="w-full bg-surface-3 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-500"
              style={{ width: `${Math.min(100, (totalC / cTarget) * 100)}%` }}
            />
          </div>
        </div>

        {/* Fats Card */}
        <div className="p-4 rounded-2xl bg-surface-1 border border-border relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-text-muted mb-2 font-medium">
              <span className="text-emerald-400 font-semibold">Мазнини</span>
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">Цел: {fTarget}г</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-white">{totalF.toFixed(1)}</span>
              <span className="text-[11px] text-text-muted font-mono">г ({Math.round((totalF / fTarget) * 100)}%)</span>
            </div>
          </div>
          <div className="w-full bg-surface-3 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, (totalF / fTarget) * 100)}%` }}
            />
          </div>
        </div>

        {/* Daily Hydration / Water Card */}
        <div className="p-4 rounded-2xl bg-surface-1 border border-blue-500/30 relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between text-xs text-text-muted mb-2 font-medium">
              <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-cyan-400" />
                Прием на вода
              </span>
              <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">Цел: {wTarget} мл</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-cyan-300">{waterMl}</span>
              <span className="text-[11px] text-text-muted font-mono">мл ({Math.round((waterMl / wTarget) * 100)}%)</span>
            </div>
          </div>
          <div className="w-full bg-surface-3 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all duration-500"
              style={{ width: `${Math.min(100, (waterMl / wTarget) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Daily Hydration Quick Control Panel (Positioned right below top macros) */}
      <div className="p-3.5 rounded-2xl bg-surface-1 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Droplets className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Дневен прием на вода:</span>
              <span className="text-xs font-mono font-bold text-cyan-300">{waterMl} / {wTarget} мл</span>
              <span className="text-[10px] font-mono text-text-muted font-semibold">({Math.round((waterMl / wTarget) * 100)}%)</span>
            </div>
            <p className="text-[11px] text-text-muted">
              Добавете изпита вода за поддържане на метаболизма и клетъчната хидратация.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-1.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => changeWater(250)}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-200 text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
          >
            +250 мл (Чаша)
          </button>
          <button
            type="button"
            onClick={() => changeWater(500)}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-200 text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
          >
            +500 мл (Бутилка)
          </button>
          <button
            type="button"
            onClick={() => changeWater(1000)}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-200 text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
          >
            +1000 мл (1 Л)
          </button>
          {waterMl > 0 && (
            <button
              type="button"
              onClick={() => changeWater(-250)}
              className="px-2.5 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 text-text-muted hover:text-white text-xs font-mono transition-all"
              title="Намали с 250 мл"
            >
              -250
            </button>
          )}
          {waterMl > 0 && (
            <button
              type="button"
              onClick={() => changeWater('RESET')}
              className="p-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 text-text-muted hover:text-red-400 transition-all"
              title="Ресет на водата (0 мл)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 7-Day Interactive Meal Calendar */}
      {mealPlan && activeDayPlan && (
        <div className="p-6 rounded-3xl bg-surface-1 border border-border/80 space-y-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Персонализиран 7-дневен Хранителен План
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-white/10 text-neutral-300">
                    {user?.foodPreferences || 'Балансирано хранене'}
                  </span>
                </h2>
                <p className="text-xs text-text-muted">
                  План за следващите 7 дни, започвайки от днес. Всяко хранене включва готови алтернативи.
                </p>
              </div>
            </div>
          </div>

          {/* 7-Day Selector Bar */}
          <div className="grid grid-cols-7 gap-2 border-y border-border/50 py-3">
            {mealPlan.days.map((d, dIdx) => {
              const isActive = dIdx === activePlanDayIndex;
              const targetDate = new Date();
              targetDate.setDate(targetDate.getDate() + dIdx);
              const shortDays = ['НЕД', 'ПОН', 'ВТО', 'СРЯ', 'ЧЕТ', 'ПЕТ', 'СЪБ'];
              const dayName = shortDays[targetDate.getDay()];
              const isToday = dIdx === 0;

              return (
                <button
                  key={d.dayIndex}
                  onClick={() => {
                    setActivePlanDayIndex(dIdx);
                    const year = targetDate.getFullYear();
                    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
                    const day = String(targetDate.getDate()).padStart(2, '0');
                    setSelectedDate(`${year}-${month}-${day}`);
                  }}
                  className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all relative ${
                    isActive
                      ? 'bg-white text-black font-bold shadow-lg scale-105 ring-2 ring-blue-500/50'
                      : 'bg-surface-2 hover:bg-surface-3 text-text-muted hover:text-white border border-border/40'
                  }`}
                >
                  {isToday && (
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500 text-black leading-none mb-0.5 shadow-sm">
                      Днес
                    </span>
                  )}
                  <span className="text-[10px] uppercase font-mono tracking-wider">
                    {isToday ? 'ДНЕС' : `${dayName} ${targetDate.getDate()}`}
                  </span>
                  <span className="text-xs font-semibold">{d.totalCalories} ккал</span>
                </button>
              );
            })}
          </div>

          {/* Active Day Meal Slots */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeDayPlan.mealSlots.map((slot) => {
              const selectedOptIdx = selectedSlotOptions[slot.slotId] || 0;
              const options = [slot.recommendedMeal, slot.alternative1, slot.alternative2].filter(Boolean) as MealOption[];
              const currentMeal = options[selectedOptIdx] || slot.recommendedMeal;
              const slotUniqueKey = `${activePlanDayIndex}-${slot.slotId}`;
              const isSlotLogged = loggedSlots[slotUniqueKey];

              return (
                <div
                  key={slot.slotId}
                  className="p-4 rounded-2xl bg-surface-2/60 border border-border/80 flex flex-col justify-between gap-3 relative group hover:border-border transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-border/40 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{slot.slotNameBg || slot.slotName}</span>
                        <span className="text-[10px] text-text-muted font-mono">({slot.targetCalories} ккал цел)</span>
                      </div>

                      {/* Alternatives Tab Pills */}
                      <div className="flex items-center gap-1 bg-surface-3 p-0.5 rounded-lg border border-border/50">
                        {options.map((_, optIdx) => (
                          <button
                            key={optIdx}
                            onClick={() => setSelectedSlotOptions((prev) => ({ ...prev, [slot.slotId]: optIdx }))}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                              selectedOptIdx === optIdx
                                ? 'bg-white text-black shadow-sm'
                                : 'text-text-muted hover:text-white'
                            }`}
                          >
                            {optIdx === 0 ? 'Основно' : `Алт ${optIdx}`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Meal Photo & Title */}
                    <div className="flex items-center gap-3">
                      <img
                        src={currentMeal.photoUrl}
                        alt={currentMeal.nameBg || currentMeal.name}
                        className="w-16 h-16 rounded-xl object-cover border border-border shadow-sm flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate leading-tight">
                          {currentMeal.nameBg || currentMeal.name}
                        </h4>
                        <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">
                          {currentMeal.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono">
                          <span className="font-bold text-orange-400">{currentMeal.calories} ккал</span>
                          <span className="text-text-muted">•</span>
                          <span className="text-blue-400">P: {currentMeal.protein}г</span>
                          <span className="text-text-muted">•</span>
                          <span className="text-amber-400">C: {currentMeal.carbs}г</span>
                          <span className="text-text-muted">•</span>
                          <span className="text-emerald-400">F: {currentMeal.fats}г</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions: View Ingredients & Log */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/30">
                    <button
                      onClick={() => setSelectedMealForModal(currentMeal)}
                      className="flex items-center gap-1 text-[11px] font-medium text-text-muted hover:text-white transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      <span>Виж съставки ({currentMeal.ingredients?.length || 0})</span>
                    </button>

                    <button
                      onClick={() => handleLogMealOption(currentMeal, slotUniqueKey, slot.slotNameBg || slot.slotName)}
                      disabled={isSlotLogged}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isSlotLogged
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-not-allowed'
                          : 'bg-white hover:bg-neutral-200 text-black shadow-sm active:scale-95'
                      }`}
                    >
                      {isSlotLogged ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>✓ Вписано</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Запиши в дневника</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Daily Food Log Table */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Utensils className="w-5 h-5 text-orange-400" />
            Записани хранения за деня
          </h2>
          <button
            onClick={() => {
              setSelectedMealType('BREAKFAST');
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Добави храна ръчно
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mealTypesConfig.map(({ type, label, icon }) => {
            const mealLogs = logs.filter((l) => l.mealType === type);
            const mealCals = mealLogs.reduce((acc, i) => acc + i.calories, 0);
            const mealP = mealLogs.reduce((acc, i) => acc + i.protein, 0);
            const mealC = mealLogs.reduce((acc, i) => acc + i.carbs, 0);
            const mealF = mealLogs.reduce((acc, i) => acc + i.fats, 0);

            return (
              <div key={type} className="p-5 rounded-2xl bg-surface-1 border border-border space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <span className="font-bold text-sm text-white">{label}</span>
                    <span className="text-xs font-mono text-text-muted">({mealCals} ккал)</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMealType(type);
                      setIsAddModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 text-text-muted hover:text-white transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {mealLogs.length === 0 ? (
                  <div className="py-6 text-center text-xs text-text-muted">
                    Няма записана храна за {label.toLowerCase()}.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {mealLogs.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-surface-2/60 hover:bg-surface-2 border border-border/40 text-xs transition-all group"
                      >
                        <div>
                          <h4 className="font-semibold text-white">{item.foodName}</h4>
                          <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted mt-0.5">
                            <span className="text-orange-400 font-bold">{item.calories} ккал</span>
                            <span>•</span>
                            <span>P: {item.protein}г</span>
                            <span>•</span>
                            <span>C: {item.carbs}г</span>
                            <span>•</span>
                            <span>F: {item.fats}г</span>
                          </div>
                        </div>

                        <button
                          onClick={() => item.id && handleDeleteFood(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    <div className="pt-2 border-t border-border/30 flex items-center justify-between text-[11px] font-mono text-text-muted font-semibold">
                      <span>Общо:</span>
                      <span>P: {mealP.toFixed(1)}г | C: {mealC.toFixed(1)}г | F: {mealF.toFixed(1)}г</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      
      {/* EXPANDED WEEKLY GROCERY SHOPPING LIST */}
      {mealPlan && (
        <div className="p-6 rounded-3xl bg-surface-1 border border-border space-y-6 shadow-lg">
          
          {/* Header & Global Multi-Select Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Седмичен списък за пазаруване
                  <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {consolidatedSelectedIngredients.selectedMealsCount} избрани ястия ({consolidatedSelectedIngredients.totalUniqueItems} вида продукт)
                  </span>
                </h2>
                <p className="text-xs text-text-muted">
                  Маркирайте с тикче ястията, които ще приготвяте. Системата автоматично сумира всички необходими съставки и грамажи.
                </p>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <button
                type="button"
                onClick={deselectAllGroceryMeals}
                className="px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 text-text-muted hover:text-white text-xs border border-border font-semibold transition-all active:scale-95"
              >
                ✕ Изчисти избора
              </button>

              {/* Copy List Button */}
              <button
                type="button"
                onClick={copyGroceryListText}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                {copiedGroceryList ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    <span className="text-emerald-700">Копирано!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-black" />
                    <span>Копирай избраните</span>
                  </>
                )}
              </button>
            </div>
          </div>

                    {/* Сумарен списък на необходимите продукти с точни грамажи за избраните ястия */}
          {consolidatedSelectedIngredients.selectedMealsCount > 0 ? (
            <div className="p-5 rounded-2xl bg-surface-2/80 border border-emerald-500/40 space-y-3.5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Сумарно необходими продукти за избраните ястия:
                </h3>
                <span className="text-xs font-mono text-emerald-300 font-semibold">
                  {consolidatedSelectedIngredients.totalUniqueItems} вида продукт
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {Object.values(consolidatedSelectedIngredients.grouped).flatMap((g) => g.items).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-surface-3/70 border border-border/60 text-xs"
                  >
                    <span className="font-semibold text-white truncate pr-2">{item.nameBg || item.name}</span>
                    <span className="font-mono font-bold text-emerald-400 shrink-0">
                      {item.totalGrams >= 1000
                        ? `${(item.totalGrams / 1000).toFixed(2)} кг`
                        : `${item.totalGrams} ${item.unit || 'г'}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-surface-2/40 border border-border/40 text-center text-xs text-text-muted">
              Маркирайте ястия с тикче отдолу, за да видите тук обобщените продукти и грамажи за пазаруване.
            </div>
          )}

          {/* ALL WEEKLY MEALS WITH DIRECT RECIPE & INGREDIENT CHECKLIST */}
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>📋</span>
                <span>Всички ястия от седмицата с 3-те възможни опции</span>
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Поставете или премахнете тикчето до името на ястието, за да го включите в общия списък за пазаруване.
              </p>
            </div>

            <div className="space-y-6">
              {detailedMealOptions.map((catSummary) => (
                <div key={catSummary.categoryKey} className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <span className="text-xl">{catSummary.icon}</span>
                    <h4 className="text-sm font-bold text-white">{catSummary.categoryTitleBg}</h4>
                    <span className="text-xs text-text-muted font-mono">({catSummary.meals.length} налични рецепти)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {catSummary.meals.map((meal) => (
                      <div
                        key={meal.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                          selectedGroceryMealIds[meal.id]
                            ? 'bg-surface-2/80 border-emerald-500/40 shadow-sm'
                            : 'bg-surface-2/30 border-border/40 opacity-60'
                        }`}
                      >
                        <div>
                          {/* Header with Meal Checkbox and Name */}
                          <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/40">
                            <label
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleGroceryMeal(meal.id);
                              }}
                              className="flex items-center gap-2.5 cursor-pointer select-none group flex-1 min-w-0"
                            >
                              <div
                                className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                                  selectedGroceryMealIds[meal.id]
                                    ? 'bg-emerald-500 text-black shadow-sm shadow-emerald-500/30'
                                    : 'bg-surface-3 border border-border group-hover:border-text-muted text-transparent'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                              <span
                                className={`text-sm font-bold leading-snug transition-colors ${
                                  selectedGroceryMealIds[meal.id] ? 'text-white' : 'text-text-muted'
                                }`}
                              >
                                {meal.nameBg || meal.name}
                              </span>
                            </label>

                            {meal.photoUrl && (
                              <img
                                src={meal.photoUrl}
                                alt={meal.nameBg || meal.name}
                                className="w-12 h-12 rounded-xl object-cover border border-border/60 shrink-0 shadow-sm"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            )}
                          </div>

                          {/* Nutrition badges */}
                          <div className="flex items-center gap-1.5 flex-wrap my-2.5 text-[11px] font-mono">
                            <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 font-bold border border-orange-500/20">
                              {meal.calories} ккал
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-surface-3 text-text-muted">P: {meal.protein}г</span>
                            <span className="px-1.5 py-0.5 rounded bg-surface-3 text-text-muted">C: {meal.carbs}г</span>
                            <span className="px-1.5 py-0.5 rounded bg-surface-3 text-text-muted">F: {meal.fats}г</span>
                          </div>

                          {/* Ingredients checklist */}
                          <div className="space-y-1.5 pt-1">
                            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                              Съставки:
                            </p>
                            <div className="space-y-1">
                              {(meal.ingredients || []).map((ing, ingIdx) => {
                                const itemKey = `${meal.id}-${ing.name}-${ingIdx}`;
                                const isChecked = !!groceryCheckedItems[itemKey];

                                return (
                                  <div
                                    key={ingIdx}
                                    onClick={() => toggleGroceryItem(itemKey)}
                                    className={`flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                                      isChecked
                                        ? 'bg-emerald-500/10 text-emerald-300'
                                        : 'bg-surface-3/50 hover:bg-surface-3 text-neutral-300'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      {isChecked ? (
                                        <CheckSquare className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                      ) : (
                                        <Square className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                                      )}
                                      <span className={`font-medium truncate ${isChecked ? 'line-through opacity-70 text-text-muted' : ''}`}>
                                        {ing.nameBg || ing.name}
                                      </span>
                                    </div>
                                    <span className="font-mono text-[10px] font-bold text-text-muted shrink-0 ml-2">
                                      {ing.amountGrams} {ing.unit || 'г'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        onProductFound={handleScannedProductAdded}
        mealType={selectedMealType}
      />

      {/* Food Photo AI Scanner Modal */}
      <FoodPhotoScannerModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onMealRecognized={handleScannedProductAdded}
        mealType={selectedMealType}
      />

      {/* Meal Ingredients Modal */}
      <MealIngredientsModal
        meal={selectedMealForModal}
        isOpen={!!selectedMealForModal}
        onClose={() => setSelectedMealForModal(null)}
      />

      {/* Add Custom/Database Food Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-surface-1 border border-border rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Utensils className="w-5 h-5 text-orange-400" />
                Добави храна ({mealTypesConfig.find((m) => m.type === selectedMealType)?.label})
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-text-muted hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Selector */}
            <div className="flex bg-surface-2 p-1 rounded-xl border border-border">
              <button
                onClick={() => setActiveAddTab('SEARCH')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeAddTab === 'SEARCH' ? 'bg-white text-black shadow-sm' : 'text-text-muted hover:text-white'
                }`}
              >
                Търси в Българска База Данни
              </button>
              <button
                onClick={() => setActiveAddTab('CUSTOM')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeAddTab === 'CUSTOM' ? 'bg-white text-black shadow-sm' : 'text-text-muted hover:text-white'
                }`}
              >
                Ръчно въвеждане
              </button>
            </div>

            {activeAddTab === 'SEARCH' ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Търси пилешко, скир, ориз, сирене, овес..."
                    value={searchQuery}
                    onChange={(e) => handleSearchFoodsChange(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-2 border border-border text-white text-xs placeholder:text-text-muted focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedDbItem(item)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        selectedDbItem?.id === item.id
                          ? 'bg-blue-500/20 border-blue-500/50 text-white'
                          : 'bg-surface-2/60 hover:bg-surface-2 border-border/40 text-neutral-300'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-white">{item.nameBg || item.name}</div>
                        <div className="text-[10px] text-text-muted">
                          {item.popularBgBrand ? `${item.popularBgBrand} • ` : ''}100г = {item.caloriesPer100g} ккал (P: {item.proteinPer100g}г | C: {item.carbsPer100g}г | F: {item.fatsPer100g}г)
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-blue-400 font-bold">Избери</span>
                    </div>
                  ))}
                </div>

                {selectedDbItem && (
                  <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{selectedDbItem.nameBg || selectedDbItem.name}</span>
                      <div className="flex items-center gap-2">
                        <label className="text-text-muted text-[11px]">Грамаж:</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={portionGrams}
                          onChange={(e) => setPortionGrams(e.target.value)}
                          className="w-16 px-2 py-1 bg-surface-1 border border-border rounded-lg text-white font-mono text-xs text-center"
                        />
                        <span className="text-xs text-text-muted">г</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-blue-300">
                      <span>Кал: {Math.round(selectedDbItem.caloriesPer100g * ((parseFloat(portionGrams) || 0) / 100))} ккал</span>
                      <span>P: {(selectedDbItem.proteinPer100g * ((parseFloat(portionGrams) || 0) / 100)).toFixed(1)}г</span>
                      <span>C: {(selectedDbItem.carbsPer100g * ((parseFloat(portionGrams) || 0) / 100)).toFixed(1)}г</span>
                      <span>F: {(selectedDbItem.fatsPer100g * ((parseFloat(portionGrams) || 0) / 100)).toFixed(1)}г</span>
                    </div>

                    <button
                      onClick={() => handleAddDbFood(selectedDbItem, parseFloat(portionGrams) || 100, selectedMealType)}
                      className="w-full py-2 bg-blue-500 text-black font-bold text-xs rounded-xl hover:bg-blue-400 transition-all shadow-md"
                    >
                      Добави в дневника
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleAddFood} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Име на храната</label>
                  <input
                    type="text"
                    required
                    placeholder="напр. Пилешко филе на грил"
                    value={foodForm.foodName}
                    onChange={(e) => setFoodForm({ ...foodForm, foodName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-2 border border-border text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">Калории (ккал)</label>
                    <input
                      type="number"
                      required
                      placeholder="350"
                      value={foodForm.calories}
                      onChange={(e) => setFoodForm({ ...foodForm, calories: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">Протеин (г)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="30"
                      value={foodForm.protein}
                      onChange={(e) => setFoodForm({ ...foodForm, protein: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">Въглехидрати (г)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="40"
                      value={foodForm.carbs}
                      onChange={(e) => setFoodForm({ ...foodForm, carbs: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">Мазнини (г)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="10"
                      value={foodForm.fats}
                      onChange={(e) => setFoodForm({ ...foodForm, fats: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-surface-2 text-xs font-semibold text-text-muted hover:text-white"
                  >
                    Отказ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-200"
                  >
                    Запиши
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Targets Modal */}
      {isTargetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-surface-1 border border-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-white">Редактирай Дневни Цели</h3>
              <button onClick={() => setIsTargetModalOpen(false)} className="text-text-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTargets} className="space-y-3 text-xs">
              <div>
                <label className="block text-text-muted mb-1 font-medium">Калории (ккал)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={targetsForm.dailyCaloriesTarget}
                  onChange={(e) => setTargetsForm({ ...targetsForm, dailyCaloriesTarget: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-white font-mono"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-text-muted mb-1 font-medium">Протеин (г)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={targetsForm.proteinTarget}
                    onChange={(e) => setTargetsForm({ ...targetsForm, proteinTarget: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-text-muted mb-1 font-medium">Въгл. (г)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={targetsForm.carbsTarget}
                    onChange={(e) => setTargetsForm({ ...targetsForm, carbsTarget: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-text-muted mb-1 font-medium">Мазнини (г)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={targetsForm.fatsTarget}
                    onChange={(e) => setTargetsForm({ ...targetsForm, fatsTarget: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-white font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-text-muted mb-1 font-medium">Вода (мл)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={targetsForm.waterTargetMl}
                  onChange={(e) => setTargetsForm({ ...targetsForm, waterTargetMl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-white font-mono"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsTargetModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-surface-2 text-text-muted font-semibold"
                >
                  Отказ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-white text-black font-bold"
                >
                  Запази
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
