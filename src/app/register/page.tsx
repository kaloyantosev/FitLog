'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Dumbbell, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Brain, 
  Flame, 
  Zap, 
  Moon, 
  Droplets, 
  Target, 
  Activity, 
  Play, 
  Award,
  Video,
  UserCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Lock,
  Mail,
  User as UserIcon,
  Utensils,
  Search,
  X,
  Apple,
  Eye,
  Layers,
  ShieldCheck,
  LogIn,
  Plus
} from 'lucide-react';
import { synthesizeProgram, GeneratedProgramResult } from '@/lib/programSynthesizer';
import ExerciseVideoModal from '@/components/ExerciseVideoModal';
import MealIngredientsModal from '@/components/MealIngredientsModal';
import { SEARCHABLE_INGREDIENTS, filterIngredients } from '@/lib/ingredientsDatabase';
import { MealOption } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  
  // Auth Mode Tab: 'REGISTER' or 'LOGIN'
  const [authMode, setAuthMode] = useState<'REGISTER' | 'LOGIN'>('REGISTER');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState<string | null>(null);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);

  // Form State - Numbers stored as strings for seamless mobile backspace & editing
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '26',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    heightCm: '180',
    currentWeight: '80.0',
    targetWeight: '75.0',
    trainingDaysPerWeek: 4, // 1 to 5
    preferredTrainingHour: '18:00',
    emailNotificationsEnabled: true,
    bodyCompositionScale: 4, // 1 to 6
    primaryGoalScale: 3,     // 1 to 6
    activityLevelScale: 3,   // 1 to 6
    experienceScale: 3,      // 1 to 6
    stressScale: 3,          // 1 to 6
    sleepScale: 4,           // 1 to 6
    dietDisciplineScale: 4,  // 1 to 6
    priorityMuscleGroups: ['BALANCED'] as string[],
    avoidedMuscleAreas: [] as string[],
    foodPreferences: 'BALANCED',
    avoidedIngredients: [] as string[],
    mealsPerDay: 4,
    mealTiming: '08:00 - 20:00 (Стандартен интервал)',
    snackingHabits: 'Леки плодове, скир или сурови ядки следобед',
  });

  // Specific Muscle Groups Definitions
  const priorityMuscleOptions = [
    { id: 'BALANCED', label: 'Балансирано цяло тяло', desc: 'Равномерен обем за всички мускулни групи' },
    { id: 'CHEST_UPPER', label: 'Горна част на гърдите', desc: 'Горна преса и наклонени ъгли' },
    { id: 'CHEST_MID_LOWER', label: 'Средна & Долна част на гърдите', desc: 'Равен лег и кофички' },
    { id: 'BACK_LATS', label: 'Ширина на гърба (Латс)', desc: 'Вертикални скрипци и набирания' },
    { id: 'BACK_THICKNESS', label: 'Плътност на гърба & Трапец', desc: 'Тежко гребане и ромбоиди' },
    { id: 'BACK_LOWER', label: 'Долен гръб & Кръст', desc: 'Еректори и лумбална стабилност' },
    { id: 'SHOULDERS_SIDE', label: 'Странично рамо (3D Ширина)', desc: 'Странични разтваряния с дъмбели' },
    { id: 'SHOULDERS_FRONT', label: 'Предно рамо', desc: 'Преси над глава' },
    { id: 'SHOULDERS_REAR', label: 'Задно рамо & Ротатори', desc: 'Фейс-пулс и флайс' },
    { id: 'ARMS_BICEPS', label: 'Бицепси', desc: 'Сгъвания с лост и дъмбели' },
    { id: 'ARMS_TRICEPS', label: 'Трицепси', desc: 'Скрипци, разгъвания и кофички' },
    { id: 'ARMS_FOREARMS', label: 'Предмишници & Захват', desc: 'Сила на хвата' },
    { id: 'LEGS_QUADS', label: 'Квадрицепси (Предно бедро)', desc: 'Клекове, лег преса, екстензии' },
    { id: 'LEGS_HAMSTRINGS', label: 'Задно бедро', desc: 'Румънска тяга и сгъвания' },
    { id: 'LEGS_GLUTES', label: 'Глутеус / Седалище', desc: 'Хип тръст и напади' },
    { id: 'LEGS_CALVES', label: 'Прасци', desc: 'Повдигане на пръсти' },
    { id: 'CORE_ABS', label: 'Коремна преса & Ядро', desc: 'Повдигане на крака и стягане на ядрото' },
  ];

  const avoidedMuscleOptions = [
    { id: 'NONE', label: 'Няма ограничения (Искам да тренирам всичко)', desc: 'Пълен спектър от упражнения' },
    { id: 'LOWER_BACK', label: 'Кръст / Лумбален отдел', desc: 'Избягвай тежка мъртва тяга и навеждания с тежест' },
    { id: 'KNEES', label: 'Коленни стави', desc: 'Избягвай дълбоки тежки клекове с лост' },
    { id: 'SHOULDERS', label: 'Раменни стави', desc: 'Избягвай тежки вертикални преси над глава' },
    { id: 'ELBOWS_WRISTS', label: 'Лакти & Китки', desc: 'Избягвай прекомерни френски разгъвания' },
    { id: 'DIRECT_CHEST', label: 'Гърди', desc: 'Ограничи тежки бутащи упражнения' },
    { id: 'DIRECT_LEGS', label: 'Крака', desc: 'Без тежки натоварвания за долната част' },
    { id: 'DIRECT_ARMS', label: 'Ръце', desc: 'Без директна изолация за бицепс/трицепс' },
  ];

  const togglePriorityMuscle = (id: string) => {
    setFormData((prev) => {
      if (id === 'BALANCED') {
        return { ...prev, priorityMuscleGroups: ['BALANCED'] };
      }
      let updated = prev.priorityMuscleGroups.filter((m) => m !== 'BALANCED');
      if (updated.includes(id)) {
        updated = updated.filter((m) => m !== id);
      } else {
        updated = [...updated, id];
      }
      if (updated.length === 0) {
        updated = ['BALANCED'];
      }
      return { ...prev, priorityMuscleGroups: updated };
    });
  };

  const toggleAvoidedMuscle = (id: string) => {
    setFormData((prev) => {
      if (id === 'NONE') {
        return { ...prev, avoidedMuscleAreas: [] };
      }
      let updated = [...prev.avoidedMuscleAreas];
      if (updated.includes(id)) {
        updated = updated.filter((m) => m !== id);
      } else {
        updated = [...updated, id];
      }
      return { ...prev, avoidedMuscleAreas: updated };
    });
  };

  // Ingredient search query
  const [ingredientSearch, setIngredientSearch] = useState('');

  // Step 4 Blueprint Tabs
  const [activeBlueprintTab, setActiveBlueprintTab] = useState<'WORKOUT' | 'MEALS'>('MEALS');
  const [selectedMealDayIndex, setSelectedMealDayIndex] = useState(0); // 0 = Monday
  const [selectedSlotOptionIndex, setSelectedSlotOptionIndex] = useState<Record<string, number>>({});

  // Generated Plan Result
  const [generatedResult, setGeneratedResult] = useState<GeneratedProgramResult | null>(null);
  const [selectedExerciseForVideo, setSelectedExerciseForVideo] = useState<any | null>(null);
  const [selectedMealForModal, setSelectedMealForModal] = useState<MealOption | null>(null);

  // Questionnaire Definitions in 100% Bulgarian (Clean without ugly /6 badges)
  const questions = [
    {
      key: 'primaryGoalScale' as const,
      title: 'Какво искате да постигнете? (Основна физиологична цел)',
      icon: Target,
      options: [
        { val: 1, label: 'Агресивно изчистване на мазнини', desc: 'Бързо топене на подкожни мазнини с висок калориен дефицит.' },
        { val: 2, label: 'Плавно и устойчиво орелефяване', desc: 'Постоянно, постепенно топене на мазнини със запазване на мускулна маса.' },
        { val: 3, label: 'Телесна рекомпозиция', desc: 'Едновременно изгаряне на мазнини и изграждане на стегнат мускулен тонус.' },
        { val: 4, label: 'Чиста мускулна маса (Lean Bulk)', desc: 'Покачване на плътни мускули с минимално задържане на мазнини.' },
        { val: 5, label: 'Максимална мускулна маса (Mass Bulk)', desc: 'Ускорено покачване на общо тегло и масивен мускулен обем.' },
        { val: 6, label: 'Максимална сила и силов трибой', desc: 'Фокус върху максимален 1RM вдигнат товар и нервно-мускулна сила.' },
      ],
    },
    {
      key: 'bodyCompositionScale' as const,
      title: 'Как изглеждате в момента? (Телесна композиция)',
      icon: Activity,
      options: [
        { val: 1, label: 'Много висок % мазнини (>30% мъже / >38% жени)', desc: 'Значително натрупване на мастна тъкан около талията и бедрата.' },
        { val: 2, label: 'Умерено завишен % мазнини (22-29% / 30-37%)', desc: 'Мека физика без видима мускулна сепарация.' },
        { val: 3, label: '"Skinny-Fat" (Слабо телосложение с мазнини)', desc: 'Тънки крайници със задържане на мазнини около корема.' },
        { val: 4, label: 'Средно атлетично (15-20% / 23-28%)', desc: 'Добра мускулна основа с лек покривен слой мазнини.' },
        { val: 5, label: 'Атлетично и орелефено (11-14% / 18-22%)', desc: 'Видими коремни плочки и ясни мускулни очертания.' },
        { val: 6, label: 'Екстремно изчистено (<10% / <16%)', desc: 'Състезателна форма, дълбоки мускулни деления и венозност.' },
      ],
    },
    {
      key: 'activityLevelScale' as const,
      title: 'Какъв е вашият начин на живот? (Ежедневна активност извън залата)',
      icon: Flame,
      options: [
        { val: 1, label: 'Заседнал начин на живот', desc: 'Работа на бюро по цял ден, под 4,000 крачки дневно.' },
        { val: 2, label: 'Ниска активност', desc: 'Основно седяща работа с леки разходки (4,000 - 7,000 крачки).' },
        { val: 3, label: 'Умерена активност', desc: 'Динамично ежедневие, раздвижване (7,000 - 10,000 крачки).' },
        { val: 4, label: 'Висока активност', desc: 'Работа на крак или физическо натоварване (10,000 - 14,000 крачки).' },
        { val: 5, label: 'Много висока активност', desc: 'Тежък физически труд или продължително ходене (15,000+ крачки).' },
        { val: 6, label: 'Елитен атлет', desc: 'Многократни двуразови тренировки и екстремен енергоразход.' },
      ],
    },
    {
      key: 'experienceScale' as const,
      title: 'Тренировъчен опит с тежести и фитнес',
      icon: Dumbbell,
      options: [
        { val: 1, label: 'Пълен начинаещ (0 - 3 месеца)', desc: 'Нулев опит с базови щанги и дъмбели, нужда от основни насоки.' },
        { val: 2, label: 'Начинаещ с базов опит (3 - 12 месеца)', desc: 'Познаване на основните упражнения, но непостоянна техника.' },
        { val: 3, label: 'Средно напреднал (1 - 3 години)', desc: 'Редовни последователни тренировки и добра кинетична форма.' },
        { val: 4, label: 'Напреднал (3 - 5 години)', desc: 'Развита мускулна координация и познаване на RPE зоните.' },
        { val: 5, label: 'Опитен ветеран (5 - 8 години)', desc: 'Дълбоко разбиране на периодизацията и интензитета.' },
        { val: 6, label: 'Елитен бодибилдър / Силов атлет (8+ години)', desc: 'Максимална нервно-мускулна ефективност и фокус.' },
      ],
    },
    {
      key: 'stressScale' as const,
      title: 'Ниво на ежедневен стрес и ментално напрежение',
      icon: Zap,
      options: [
        { val: 1, label: 'Пълен покой и хармония', desc: 'Спокоен начин на живот без психо-емоционално напрежение.' },
        { val: 2, label: 'Нисък контролиран стрес', desc: 'Рядко възникващи напрегнати ситуации.' },
        { val: 3, label: 'Умерен балансиран стрес', desc: 'Обичаен работен ритъм с нормално възстановяване.' },
        { val: 4, label: 'Повишен стрес', desc: 'Често напрежение в работата или личния живот.' },
        { val: 5, label: 'Висок системен стрес', desc: 'Хронично напрежение, влияещо на възстановяването.' },
        { val: 6, label: 'Екстремен стрес (Бърнаут)', desc: 'Претоварване на нервната система и високи нива на кортизол.' },
      ],
    },
    {
      key: 'sleepScale' as const,
      title: 'Качество и продължителност на съня',
      icon: Moon,
      options: [
        { val: 1, label: 'Критично лош сън (< 5 часа)', desc: 'Често безсъние, трудно заспиване и постоянна умора.' },
        { val: 2, label: 'Накъсан сън (5 - 6 часа)', desc: 'Многократни събуждания през нощта и сънливост.' },
        { val: 3, label: 'Средно качество (6 - 7 часа)', desc: 'Приемлива продължителност с лека умора сутрин.' },
        { val: 4, label: 'Добър възстановителен сън (7 - 8 часа)', desc: 'Дълбок непрекъснат сън и висока кондиция.' },
        { val: 5, label: 'Отличен сън (8 - 9 часа)', desc: 'Пълно мускулно и неврологично презареждане.' },
        { val: 6, label: 'Перфектна хигиена на съня (9+ часа)', desc: 'Дълбоки REM фази, събуждане без будилник.' },
      ],
    },
    {
      key: 'dietDisciplineScale' as const,
      title: 'Дисциплина и постоянство в храненето',
      icon: Droplets,
      options: [
        { val: 1, label: 'Хаотично хранене', desc: 'Липса на режим, честа консумация на джънк фууд.' },
        { val: 2, label: 'Опити за режим с чести залитания', desc: 'Хранене по план през деня и чийтвания вечер.' },
        { val: 3, label: 'Умерена дисциплина (~70% постоянство)', desc: 'Балансирано хранене през делничните дни.' },
        { val: 4, label: 'Стриктна рутина (~85% постоянство)', desc: 'Претегляне на храната и проследяване на макроси.' },
        { val: 5, label: 'Висока дисциплина (~95% постоянство)', desc: 'Стриктно приготвяне на кутии с храна.' },
        { val: 6, label: '100% професионална точност', desc: 'Грам за грам прецизност без никакви отклонения.' },
      ],
    },
  ];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginStatus('Успешно влизане! Пренасочване към таблото...');
    setTimeout(() => {
      router.push('/');
    }, 800);
  };

  const handleSynthesizeAndAdvance = () => {
    setLoading(true);
    try {
      const result = synthesizeProgram({
        name: formData.name || 'Атлет',
        email: formData.email,
        password: formData.password,
        age: parseInt(String(formData.age)) || 25,
        gender: formData.gender,
        heightCm: parseFloat(String(formData.heightCm)) || 175,
        currentWeight: parseFloat(String(formData.currentWeight)) || 80.0,
        targetWeight: parseFloat(String(formData.targetWeight)) || 75.0,
        trainingDaysPerWeek: formData.trainingDaysPerWeek,
        bodyCompositionScale: formData.bodyCompositionScale,
        primaryGoalScale: formData.primaryGoalScale,
        activityLevelScale: formData.activityLevelScale,
        experienceScale: formData.experienceScale,
        stressScale: formData.stressScale,
        sleepScale: formData.sleepScale,
        dietDisciplineScale: formData.dietDisciplineScale,
        priorityMuscleGroups: formData.priorityMuscleGroups,
        avoidedMuscleAreas: formData.avoidedMuscleAreas,
        foodPreferences: formData.foodPreferences,
        avoidedIngredients: formData.avoidedIngredients,
        mealsPerDay: formData.mealsPerDay,
        mealTiming: formData.mealTiming,
        snackingHabits: formData.snackingHabits,
      });

      setGeneratedResult(result);
      setStep(4);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeRegistration = async () => {
    setLoading(true);
    try {
      if (!generatedResult) return;

      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          gender: formData.gender,
          age: parseInt(String(formData.age)) || 25,
          heightCm: parseFloat(String(formData.heightCm)) || 175,
          currentWeight: parseFloat(String(formData.currentWeight)) || 80.0,
          targetWeight: parseFloat(String(formData.targetWeight)) || 75.0,
          trainingDaysPerWeek: formData.trainingDaysPerWeek,
          preferredTrainingHour: formData.preferredTrainingHour,
          emailNotificationsEnabled: formData.emailNotificationsEnabled,
          dailyCaloriesTarget: generatedResult.dailyCaloriesTarget,
          proteinTarget: generatedResult.proteinTarget,
          carbsTarget: generatedResult.carbsTarget,
          fatsTarget: generatedResult.fatsTarget,
          waterTargetMl: generatedResult.waterTargetMl,
          priorityMuscleGroups: formData.priorityMuscleGroups,
          avoidedMuscleAreas: formData.avoidedMuscleAreas,
          foodPreferences: formData.foodPreferences,
          avoidedIngredients: formData.avoidedIngredients,
          mealsPerDay: formData.mealsPerDay,
          mealTiming: formData.mealTiming,
          snackingHabits: formData.snackingHabits,
          mealPlanData: generatedResult.sevenDayMealPlan,
        }),
      });

      // Clear existing templates and seed the newly synthesized templates
      await fetch('/api/templates/reset', { method: 'POST' });

      for (const tmpl of generatedResult.templates) {
        await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: tmpl.title,
            description: tmpl.description,
            category: tmpl.category,
            estimatedDurationMinutes: tmpl.estimatedDurationMinutes,
            exercises: tmpl.exercises,
          }),
        });
      }

      router.push('/');
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvoidedIngredient = (id: string) => {
    setFormData((prev) => {
      const exists = prev.avoidedIngredients.includes(id);
      return {
        ...prev,
        avoidedIngredients: exists
          ? prev.avoidedIngredients.filter((i) => i !== id)
          : [...prev.avoidedIngredients, id],
      };
    });
  };

  const filteredSearchIngredients = filterIngredients(ingredientSearch);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fadeIn space-y-8">
      {/* Top Auth Mode Switcher */}
      <div className="flex items-center justify-center">
        <div className="flex bg-surface-2 p-1.5 rounded-2xl border border-border shadow-lg">
          <button
            onClick={() => setAuthMode('REGISTER')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              authMode === 'REGISTER'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-text-muted hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Нова Регистрация & AI Анализ
          </button>
          <button
            onClick={() => setAuthMode('LOGIN')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              authMode === 'LOGIN'
                ? 'bg-white text-black shadow-md'
                : 'text-text-muted hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Вход в Профила
          </button>
        </div>
      </div>

      {/* LOGIN VIEW */}
      {authMode === 'LOGIN' ? (
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-surface-1 border border-border space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
              <UserCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Вход за Атлети</h2>
            <p className="text-xs text-text-muted">
              Въведете вашите данни за достъп до тренировъчната и хранителната програма.
            </p>
          </div>

          {loginStatus && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs text-center font-medium">
              {loginStatus}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Имейл адрес</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="alex@domain.bg"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-2 border border-border text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Парола</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-2 border border-border text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs sm:text-sm hover:bg-neutral-200 transition-all shadow-md active:scale-95"
            >
              Влез в Профила
            </button>
          </form>
        </div>
      ) : (
        /* REGISTER & QUESTIONNAIRE VIEW */
        <div className="space-y-8">
          {/* Header Progress Stepper */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider">
              <Brain className="w-3.5 h-3.5" />
              AI Изграждане на Персонален План
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {step === 1 && '1. Базов Профил за Вход'}
              {step === 2 && '2. Детайлен Въпросник за Физика и Начин на Живот'}
              {step === 3 && '3. Хранителни Предпочитания & Изключени Съставки'}
              {step === 4 && '4. Синтезиран Тренировъчен & Хранителен Протокол'}
            </h1>
            <p className="text-xs sm:text-sm text-text-muted max-w-xl mx-auto">
              {step === 1 && 'Въведете основните си данни за създаване на профил в системата.'}
              {step === 2 && 'Оценете вашите цели, начин на живот и изберете мускулните групи с приоритет.'}
              {step === 3 && 'Изберете стил на хранене и маркирайте съставки, които желаете да изключите.'}
              {step === 4 && 'Прегледайте синтезирания 7-дневен хранителен план, тренировъчните шаблони и настройте напомнянията си.'}
            </p>

            {/* Stepper Dots */}
            <div className="flex items-center justify-center gap-2 pt-4">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all ${
                    step === s
                      ? 'w-10 bg-blue-500'
                      : step > s
                      ? 'w-4 bg-emerald-500'
                      : 'w-4 bg-surface-3'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* STEP 1: Basic Bio */}
          {step === 1 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-surface-1 border border-border space-y-6 shadow-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Вашето Име *</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="Алекс Митовски"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-2 border border-border text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Имейл адрес *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="alex@domain.bg"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-2 border border-border text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Възраст (години)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="26"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Пол</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-white text-xs"
                  >
                    <option value="MALE">Мъж</option>
                    <option value="FEMALE">Жена</option>
                    <option value="OTHER">Друг</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Парола за вход</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold text-xs sm:text-sm hover:bg-neutral-200 transition-all shadow-md active:scale-95"
                >
                  <span>Продължи към Въпросника</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Questionnaire & Detailed Physiology */}
          {step === 2 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-surface-1 border border-border space-y-8 shadow-xl">
              {/* TOP PRIORITY: Height, Current Weight, Target Weight */}
              <div className="p-5 rounded-2xl bg-surface-2/70 border border-blue-500/30 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Физически Параметри & Теглови Цели
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1">Ръст (см) *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder="180"
                      value={formData.heightCm}
                      onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-3 border border-border text-white text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1">Текущо Тегло (кг) *</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      required
                      placeholder="82.0"
                      value={formData.currentWeight}
                      onChange={(e) => setFormData({ ...formData, currentWeight: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-3 border border-border text-white text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1">Целево Тегло (кг) *</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      required
                      placeholder="75.0"
                      value={formData.targetWeight}
                      onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-3 border border-border text-white text-xs font-mono font-bold text-blue-400"
                    />
                  </div>
                </div>
              </div>

              {/* Clean Questionnaire Questions without /6 badges */}
              <div className="space-y-6">
                {questions.map((q) => {
                  const Icon = q.icon;
                  const currentVal = formData[q.key];

                  return (
                    <div key={q.key} className="space-y-3 pb-6 border-b border-border/60">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Icon className="w-4 h-4 text-blue-400" />
                          {q.title}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {q.options.map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setFormData({ ...formData, [q.key]: opt.val })}
                            className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                              currentVal === opt.val
                                ? 'bg-blue-600 text-white border-blue-400 shadow-md scale-[1.01]'
                                : 'bg-surface-2/70 hover:bg-surface-2 border-border/70 text-neutral-300'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold text-xs">
                              <span>{opt.label}</span>
                              {currentVal === opt.val && <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />}
                            </div>
                            <p className={`text-[11px] mt-1 line-clamp-2 ${currentVal === opt.val ? 'text-blue-100' : 'text-text-muted'}`}>
                              {opt.desc}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Priority Muscle Groups (Specific Multi-Select) */}
              <div className="p-5 sm:p-6 rounded-3xl bg-surface-2/80 border border-blue-500/30 space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      Мускулни групи, на които искате да наблегнете с приоритет
                    </h4>
                    <span className="text-xs font-mono font-bold text-blue-400">
                      {formData.priorityMuscleGroups.includes('BALANCED')
                        ? 'Балансирано'
                        : `${formData.priorityMuscleGroups.length} избрани`}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    Можете да изберете <strong>повече от една мускулна група</strong> или да оставите „Балансирано цяло тяло“.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {priorityMuscleOptions.map((mg) => {
                    const isSelected = formData.priorityMuscleGroups.includes(mg.id);

                    return (
                      <button
                        key={mg.id}
                        type="button"
                        onClick={() => togglePriorityMuscle(mg.id)}
                        className={`p-3 rounded-2xl border text-left flex items-start justify-between transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold shadow-md border-blue-400 scale-[1.01]'
                            : 'bg-surface-3 hover:bg-surface-3/80 text-neutral-300 border-border'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <span className="text-xs font-bold block">{mg.label}</span>
                          <span className={`text-[10px] mt-0.5 line-clamp-1 block ${isSelected ? 'text-blue-100' : 'text-text-muted'}`}>
                            {mg.desc}
                          </span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? 'bg-white text-blue-600' : 'border border-border bg-surface-2 text-transparent'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Avoided Area / Injury limitation (Specific Multi-Select) */}
              <div className="p-5 sm:p-6 rounded-3xl bg-surface-2/80 border border-red-500/30 space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-red-400" />
                      Зони или упражнения, които НЕ желаете да тренирате (напр. контузия)
                    </h4>
                    <span className="text-xs font-mono font-bold text-red-400">
                      {formData.avoidedMuscleAreas.length === 0
                        ? 'Няма ограничения'
                        : `${formData.avoidedMuscleAreas.length} зони`}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    Можете да посочите <strong>повече от една зона</strong> или да оставите празно, ако нямате ограничения.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {avoidedMuscleOptions.map((av) => {
                    const isSelected = av.id === 'NONE' 
                      ? formData.avoidedMuscleAreas.length === 0 
                      : formData.avoidedMuscleAreas.includes(av.id);

                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => toggleAvoidedMuscle(av.id)}
                        className={`p-3 rounded-2xl border text-left flex items-start justify-between transition-all ${
                          isSelected
                            ? 'bg-red-500/20 text-red-200 border-red-500 shadow-md font-bold'
                            : 'bg-surface-3 hover:bg-surface-3/80 text-neutral-300 border-border'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <span className="text-xs font-bold block">{av.label}</span>
                          <span className="text-[10px] text-text-muted mt-0.5 line-clamp-1 block">
                            {av.desc}
                          </span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? 'bg-red-500 text-white' : 'border border-border bg-surface-2 text-transparent'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Training Days per Week */}
              <div className="p-5 rounded-2xl bg-surface-2 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    Колко дни в седмицата можете да тренирате?
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400">{formData.trainingDaysPerWeek} дни в седмицата</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setFormData({ ...formData, trainingDaysPerWeek: d })}
                      className={`py-3 rounded-xl border text-center font-bold text-xs transition-all ${
                        formData.trainingDaysPerWeek === d
                          ? 'bg-amber-500 text-black border-amber-400 shadow-md scale-105'
                          : 'bg-surface-3 hover:bg-surface-3/80 border-border text-text-muted hover:text-white'
                      }`}
                    >
                      {d} {d === 1 ? 'ден' : 'дни'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 text-xs font-semibold text-text-muted hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Назад
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold text-xs sm:text-sm hover:bg-neutral-200 transition-all shadow-md active:scale-95"
                >
                  <span>Към Хранителните Предпочитания</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Food Preferences & Avoided Ingredients Search */}
          {step === 3 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-surface-1 border border-border space-y-6 shadow-xl">
              {/* Diet Style */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-orange-400" />
                  Предпочитан Стил на Хранене
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'BALANCED', label: 'Балансирано хранене', desc: 'Разнообразни чисти източници на протеин, сложни въглехидрати и полезни мазнини.' },
                    { id: 'MEDITERRANEAN', label: 'Средиземноморска диета', desc: 'Зехтин, риба, свежи салати, авокадо и семена.' },
                    { id: 'HIGH_PROTEIN_LOW_CARB', label: 'Висок Протеин / Нисък Карб', desc: 'Оптимално за бързо изчистване и висока ситост.' },
                    { id: 'PESCATARIAN', label: 'Пескетарианство', desc: 'Риба, морски дарове, яйца, млечни и растителни храни.' },
                    { id: 'VEGETARIAN', label: 'Вегетарианство', desc: 'Млечни продукти, скир, яйца, варива, ядки и овес.' },
                    { id: 'BODYBUILDING_PREP', label: 'Бодибилдинг Класика', desc: 'Стриктен пилешко-оризов режим с овесени ядки и яйчен белтък.' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, foodPreferences: style.id })}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        formData.foodPreferences === style.id
                          ? 'bg-orange-500/20 border-orange-500 text-white font-semibold'
                          : 'bg-surface-2 hover:bg-surface-3 border-border text-neutral-300'
                      }`}
                    >
                      <span className="text-xs font-bold">{style.label}</span>
                      <p className="text-[11px] text-text-muted mt-1">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search & Avoid Ingredients */}
              <div className="space-y-4 pt-4 border-t border-border/60">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Apple className="w-4 h-4 text-emerald-400" />
                    Изключване на нежелани храни / алергени
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Потърсете и маркирайте храни, меса, зеленчуци или подправки, които искате да избегнете в менюто си.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Търси пилешко, свинско, фъстъци, лактоза, броколи..."
                    value={ingredientSearch}
                    onChange={(e) => setIngredientSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-2 border border-border text-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-text-muted"
                  />
                </div>

                {/* Avoided Pills Selected */}
                {formData.avoidedIngredients.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-red-500/10 border border-red-500/20">
                    <span className="text-[11px] font-bold text-red-400 self-center">Изключени:</span>
                    {formData.avoidedIngredients.map((ingId) => {
                      const ingObj = SEARCHABLE_INGREDIENTS.find((i) => i.id === ingId);
                      return (
                        <button
                          key={ingId}
                          type="button"
                          onClick={() => toggleAvoidedIngredient(ingId)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 text-xs font-medium hover:bg-red-500/30 transition-colors"
                        >
                          <span>{ingObj?.nameBg || ingId}</span>
                          <X className="w-3 h-3" />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Filtered Search Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                  {filteredSearchIngredients.map((ing) => {
                    const isAvoided = formData.avoidedIngredients.includes(ing.id);
                    return (
                      <button
                        key={ing.id}
                        type="button"
                        onClick={() => toggleAvoidedIngredient(ing.id)}
                        className={`p-2.5 rounded-xl text-left border text-xs flex items-center justify-between transition-all ${
                          isAvoided
                            ? 'bg-red-500/20 border-red-500 text-red-300 font-bold'
                            : 'bg-surface-2 hover:bg-surface-3 border-border text-neutral-300'
                        }`}
                      >
                        <span className="truncate">{ing.nameBg || ing.name}</span>
                        {isAvoided ? <X className="w-3.5 h-3.5 text-red-400" /> : <Plus className="w-3.5 h-3.5 text-text-muted" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Meals per day & Snacking */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/60">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Брой хранения на ден</label>
                  <select
                    value={formData.mealsPerDay}
                    onChange={(e) => setFormData({ ...formData, mealsPerDay: parseInt(e.target.value) || 4 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-white text-xs"
                  >
                    <option value={3}>3 Основни хранения (Закуска, Обяд, Вечеря)</option>
                    <option value={4}>4 Хранения (3 Основни + 1 Междинно)</option>
                    <option value={5}>5 Хранения (3 Основни + 2 Междинни)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Навици за междинни закуски</label>
                  <input
                    type="text"
                    value={formData.snackingHabits}
                    onChange={(e) => setFormData({ ...formData, snackingHabits: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 text-xs font-semibold text-text-muted hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Назад
                </button>
                <button
                  type="button"
                  onClick={handleSynthesizeAndAdvance}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Синтезирай Програма с AI</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Finalize Program */}
          {step === 4 && generatedResult && (
            <div className="space-y-6">
              {/* AI Synthesis Summary Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-950/40 via-surface-1 to-surface-1 border border-blue-500/40 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-400">
                  <Brain className="w-5 h-5" />
                  <span>AI Анализ & Персонализирана Стратегия</span>
                </div>
                <div className="text-xs text-neutral-200 leading-relaxed whitespace-pre-line">
                  {generatedResult.aiSynthesisSummary}
                </div>

                {/* Target Macros Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/40">
                  <div className="p-3 rounded-xl bg-surface-2 text-center font-mono">
                    <span className="text-[10px] text-text-muted uppercase block">Калории</span>
                    <span className="text-lg font-bold text-orange-400">{generatedResult.dailyCaloriesTarget} ккал</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-2 text-center font-mono">
                    <span className="text-[10px] text-text-muted uppercase block">Протеин</span>
                    <span className="text-lg font-bold text-blue-400">{generatedResult.proteinTarget} г</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-2 text-center font-mono">
                    <span className="text-[10px] text-text-muted uppercase block">Въглехидрати</span>
                    <span className="text-lg font-bold text-amber-400">{generatedResult.carbsTarget} г</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-2 text-center font-mono">
                    <span className="text-[10px] text-text-muted uppercase block">Мазнини</span>
                    <span className="text-lg font-bold text-emerald-400">{generatedResult.fatsTarget} г</span>
                  </div>
                </div>
              </div>

              {/* View Selector (Workouts / 7-Day Meals) */}
              <div className="flex bg-surface-2 p-1 rounded-2xl border border-border">
                <button
                  onClick={() => setActiveBlueprintTab('MEALS')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeBlueprintTab === 'MEALS' ? 'bg-white text-black shadow-md' : 'text-text-muted hover:text-white'
                  }`}
                >
                  7-дневен Хранителен План (с алтернативи)
                </button>
                <button
                  onClick={() => setActiveBlueprintTab('WORKOUT')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeBlueprintTab === 'WORKOUT' ? 'bg-white text-black shadow-md' : 'text-text-muted hover:text-white'
                  }`}
                >
                  Тренировъчни Шаблони ({generatedResult.templates.length} Дни)
                </button>
              </div>

              {/* TAB 1: 7-DAY MEAL PLAN */}
              {activeBlueprintTab === 'MEALS' && (
                <div className="p-6 rounded-3xl bg-surface-1 border border-border space-y-5">
                  <div className="grid grid-cols-7 gap-1.5 border-b border-border/50 pb-3">
                    {generatedResult.sevenDayMealPlan.days.map((d, dIdx) => (
                      <button
                        key={d.dayIndex}
                        onClick={() => setSelectedMealDayIndex(dIdx)}
                        className={`p-2 rounded-xl flex flex-col items-center justify-center text-xs transition-all ${
                          selectedMealDayIndex === dIdx
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-surface-2 text-text-muted hover:text-white'
                        }`}
                      >
                        <span className="text-[10px] font-mono uppercase">{['Пон', 'Вто', 'Сря', 'Чет', 'Пет', 'Съб', 'Нед'][dIdx]}</span>
                        <span className="text-[11px]">{d.totalCalories}</span>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generatedResult.sevenDayMealPlan.days[selectedMealDayIndex].mealSlots.map((slot) => {
                      const selectedOptIdx = selectedSlotOptionIndex[slot.slotId] || 0;
                      const options = [slot.recommendedMeal, slot.alternative1, slot.alternative2].filter(Boolean) as MealOption[];
                      const currentMeal = options[selectedOptIdx] || slot.recommendedMeal;

                      return (
                        <div key={slot.slotId} className="p-4 rounded-2xl bg-surface-2 border border-border space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{slot.slotNameBg || slot.slotName}</span>
                            <div className="flex gap-1 bg-surface-3 p-0.5 rounded-lg">
                              {options.map((_, optIdx) => (
                                <button
                                  key={optIdx}
                                  onClick={() => setSelectedSlotOptionIndex((prev) => ({ ...prev, [slot.slotId]: optIdx }))}
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    selectedOptIdx === optIdx ? 'bg-white text-black' : 'text-text-muted'
                                  }`}
                                >
                                  {optIdx === 0 ? 'Основно' : `Алт ${optIdx}`}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <img
                              src={currentMeal.photoUrl}
                              alt={currentMeal.nameBg || currentMeal.name}
                              className="w-14 h-14 rounded-xl object-cover border border-border flex-shrink-0"
                            />
                            <div>
                              <h4 className="text-xs font-bold text-white line-clamp-1">{currentMeal.nameBg || currentMeal.name}</h4>
                              <p className="text-[11px] font-mono text-orange-400 mt-0.5">
                                {currentMeal.calories} ккал • P: {currentMeal.protein}г | C: {currentMeal.carbs}г | F: {currentMeal.fats}г
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedMealForModal(currentMeal)}
                            className="w-full py-1.5 rounded-xl bg-surface-3 text-[11px] font-medium text-white flex items-center justify-center gap-1 hover:bg-white/10"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                            <span>Виж точните съставки ({currentMeal.ingredients?.length || 0})</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: WORKOUT TEMPLATES */}
              {activeBlueprintTab === 'WORKOUT' && (
                <div className="space-y-4">
                  {generatedResult.templates.map((tmpl, tIdx) => (
                    <div key={tIdx} className="p-6 rounded-3xl bg-surface-1 border border-border space-y-3">
                      <div className="flex items-center justify-between border-b border-border/40 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                            {tmpl.category}
                          </span>
                          <span className="text-xs font-bold text-white">{tmpl.title}</span>
                        </div>
                        <span className="text-xs font-mono text-text-muted">
                          ~{tmpl.estimatedDurationMinutes} мин времетраене
                        </span>
                      </div>

                      <p className="text-xs text-text-muted">{tmpl.description}</p>

                      <div className="space-y-2 pt-2">
                        {tmpl.exercises.map((ex, eIdx) => (
                          <div key={eIdx} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-2 text-xs">
                            <span className="font-semibold text-white">{ex.exerciseId}</span>
                            <span className="font-mono text-text-muted">
                              {ex.targetSets} серии × {ex.repRange} повт. | Стартово: <strong className="text-blue-400">{ex.startingWeightKg} кг</strong>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Notification & Schedule Setup */}
              <div className="p-6 rounded-3xl bg-surface-1 border border-blue-500/30 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span>Имейл известяване "Време е за тренировка днес"</span>
                    </div>
                    <p className="text-xs text-text-muted">
                      Системата ще изпраща мотивиращ имейл точно в този час само в дните за тренировка!
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.emailNotificationsEnabled}
                    onChange={(e) => setFormData({ ...formData, emailNotificationsEnabled: e.target.checked })}
                    className="w-5 h-5 accent-blue-500 cursor-pointer"
                  />
                </div>

                {formData.emailNotificationsEnabled && (
                  <div className="pt-3 border-t border-border/40 max-w-xs">
                    <label className="block text-[11px] font-semibold text-text-muted mb-1.5">
                      Приблизителен час на тренировката:
                    </label>
                    <input
                      type="time"
                      value={formData.preferredTrainingHour}
                      onChange={(e) => setFormData({ ...formData, preferredTrainingHour: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-surface-2 border border-border text-white text-xs font-mono font-bold"
                    />
                  </div>
                )}
              </div>

              {/* Final Confirm Button */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 text-xs font-semibold text-text-muted hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Назад
                </button>
                <button
                  type="button"
                  onClick={handleFinalizeRegistration}
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                >
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  <span>Потвърди и Активирай Програмата</span>
                </button>
              </div>
            </div>
          )}

          {/* Exercise Video Guide Modal */}
          <ExerciseVideoModal
            exercise={selectedExerciseForVideo}
            isOpen={!!selectedExerciseForVideo}
            onClose={() => setSelectedExerciseForVideo(null)}
          />

          {/* Meal Ingredients Modal */}
          <MealIngredientsModal
            meal={selectedMealForModal}
            isOpen={!!selectedMealForModal}
            onClose={() => setSelectedMealForModal(null)}
          />
        </div>
      )}
    </div>
  );
}
