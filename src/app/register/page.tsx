'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Brain, 
  Flame, 
  Zap, 
  Moon, 
  Droplets, 
  Activity, 
  Clock, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Utensils, 
  Search, 
  X, 
  LogIn, 
  Plus,
  Check
} from 'lucide-react';
import { synthesizeProgram } from '@/lib/programSynthesizer';
import { SEARCHABLE_INGREDIENTS, filterIngredients } from '@/lib/ingredientsDatabase';

export default function RegisterPage() {
  const router = useRouter();
  
  // Auth Mode Tab: 'REGISTER' or 'LOGIN'
  const [authMode, setAuthMode] = useState<'REGISTER' | 'LOGIN'>('REGISTER');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState<string | null>(null);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Form State - Numbers stored as strings for seamless mobile & PC editing
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    heightCm: '',
    currentWeight: '',
    targetWeight: '',
    trainingDaysPerWeek: 4,
    preferredTrainingHour: '18:00',
    emailNotificationsEnabled: true,
    bodyCompositionScale: 3,
    primaryGoalScale: 3,
    activityLevelScale: 3,
    experienceScale: 3,
    stressScale: 3,
    sleepScale: 3,
    dietDisciplineScale: 3,
    priorityMuscleGroups: ['BALANCED'] as string[],
    avoidedMuscleAreas: [] as string[],
    foodPreferences: 'BALANCED',
    avoidedIngredients: [] as string[],
    mealsPerDay: 3,
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

  // 6 Physiological & Lifestyle Questions (Clean UI without rank badges)
  const questions: {
    key: keyof typeof formData;
    title: string;
    description: string;
    icon: any;
    options: { score: number; label: string; desc: string }[];
  }[] = [
    {
      key: 'primaryGoalScale',
      title: 'Каква е вашата основна фитнес цел?',
      description: 'Това ще определи калорийния баланс, макросите и обема на сериите.',
      icon: Flame,
      options: [
        { score: 1, label: 'Агресивно изчистване на мазнини', desc: 'Калориен дефицит с висок протеин за защита на мускула' },
        { score: 2, label: 'Умерено отслабване и тонус', desc: 'Балансирано сваляне на килограми без излишен глад' },
        { score: 3, label: 'Чиста телесна рекомпозиция', desc: 'Едновременно изгаряне на мазнини и изграждане на мускул' },
        { score: 4, label: 'Чисто качване на мускулна маса (Lean Bulk)', desc: 'Лек калориен излишък с акцент върху чиста маса' },
        { score: 5, label: 'Максимална хипертрофия & Мускулен обем', desc: 'Солиден излишък и висок тренировъчен обем' },
        { score: 6, label: 'Чиста сила и експлозивна мощ', desc: 'Тежки базови движения в нисък диапазон на повторения' },
      ],
    },
    {
      key: 'activityLevelScale',
      title: 'Какво е вашето ежедневно ниво на физическа активност?',
      description: 'Движение извън залата (работа, крачки, ежедневие).',
      icon: Activity,
      options: [
        { score: 1, label: 'Заседнал начин на живот', desc: 'Работа на бюро, под 4,000 крачки на ден' },
        { score: 2, label: 'Лека активност', desc: 'Офис работа, но кратки разходки (4,000 - 7,000 крачки)' },
        { score: 3, label: 'Умерена активност', desc: 'Редовно движение, 7,000 - 10,000 крачки дневно' },
        { score: 4, label: 'Активен динамичен режим', desc: 'Подвижна професия, 10,000 - 14,000 крачки дневно' },
        { score: 5, label: 'Много висока активност', desc: 'Тежък физически труд или интензивни допълнителни спортове' },
        { score: 6, label: 'Елитно натоварване / Професионален атлет', desc: 'Двуразови тренировки или екстремен физически разход' },
      ],
    },
    {
      key: 'experienceScale',
      title: 'Какъв е вашият предишен тренировъчен опит с тежести?',
      description: 'Помага за правилен подбор на RPE интензивност и упражнения.',
      icon: Zap,
      options: [
        { score: 1, label: 'Пълен начинаещ', desc: 'Никога не съм влизал във фитнес зала или започвам отново от нулата' },
        { score: 2, label: 'Начинаещ с базов опит', desc: 'Тренирал съм 1-6 месеца, уча се на правилна техника' },
        { score: 3, label: 'Средно напреднал', desc: '1-2 години редовни тренировки с познаване на базовите движения' },
        { score: 4, label: 'Солидно напреднал', desc: '3-5 години постоянен стаж и добро владеене на мускулния контрол' },
        { score: 5, label: 'Опитен атлет', desc: 'Над 5 години последователни структурирани тренировки' },
        { score: 6, label: 'Майстор / Състезател', desc: 'Дългогодишен елитен стаж, тренировки до абсолютен отказ' },
      ],
    },
    {
      key: 'stressScale',
      title: 'Какво е нивото на стрес в ежедневието ви?',
      description: 'Хроничният стрес влияе директно върху възстановяването и кортизола.',
      icon: Brain,
      options: [
        { score: 1, label: 'Минимален стрес', desc: 'Спокоен и подреден ритъм на живот' },
        { score: 2, label: 'Нисък стрес', desc: 'Редки моменти на напрежение' },
        { score: 3, label: 'Умерен стрес', desc: 'Нормално напрежение от работа и ангажименти' },
        { score: 4, label: 'Повишен стрес', desc: 'Динамични работни срокове и чести притеснения' },
        { score: 5, label: 'Висок постоянен стрес', desc: 'Хронично напрежение и умора' },
        { score: 6, label: 'Екстремен стрес & Прегаряне (Burnout)', desc: 'Постоянен психически натиск и изтощение' },
      ],
    },
    {
      key: 'sleepScale',
      title: 'Колко качествен и продължителен е сънят ви?',
      description: 'Основният двигател на мускулния растеж и анаболните хормони.',
      icon: Moon,
      options: [
        { score: 1, label: 'Критично нарушен сън', desc: 'Под 5 часа на нощ, чести събуждания и безсъние' },
        { score: 2, label: 'Недостатъчен сън', desc: '5-6 часа сън, събуждане с чувство за умора' },
        { score: 3, label: 'Среден сън', desc: '6-7 часа с умерено възстановяване' },
        { score: 4, label: 'Добър пълноценен сън', desc: '7-8 часа качествен сън всяка нощ' },
        { score: 5, label: 'Отличен дълбок сън', desc: '8-9 часа дълбок непрекъснат сън' },
        { score: 6, label: 'Оптимален възстановителен сън', desc: 'Над 8.5 часа с пълен контрол на циркадния ритъм' },
      ],
    },
    {
      key: 'dietDisciplineScale',
      title: 'Как оценявате хранителната си дисциплина?',
      description: 'Помага за адаптиране на гъвкавостта на хранителния план.',
      icon: Droplets,
      options: [
        { score: 1, label: 'Хаотично хранене', desc: 'Често пропускам хранения или се храня на крак с бърза храна' },
        { score: 2, label: 'Базова дисциплина', desc: 'Старая се да ям качествена храна, но често се изкушавам' },
        { score: 3, label: 'Умерено постоянство', desc: 'Храня се здравословно в 70-80% от времето' },
        { score: 4, label: 'Висока хранителна култура', desc: 'Следя порциите си и рядко излизам от добрия режим' },
        { score: 5, label: 'Стриктен контрол на макронутриенти', desc: 'Редовно претеглям порциите си и знам какво ям' },
        { score: 6, label: 'Безупречна атлетична прецизност', desc: '100% стриктност към храната без компромиси' },
      ],
    },
  ];

  // Dietary Preferences Options
  const dietStyles = [
    {
      id: 'BALANCED',
      title: 'Балансиран фитнес план',
      desc: 'Оптимално съотношение на протеини, полезни мазнини и сложни въглехидрати.',
    },
    {
      id: 'HIGH_PROTEIN_LOW_CARB',
      title: 'Висок протеин & Ниски въглехидрати (Low-Carb)',
      desc: 'Фокус върху чисти меса, риба, яйца, млечни и зеленчуци за бързо изчистване.',
    },
    {
      id: 'MEDITERRANEAN',
      title: 'Средиземноморски стил',
      desc: 'Богат на зехтин, риба, морски дарове, зеленчуци и пълнозърнести храни.',
    },
    {
      id: 'BODYBUILDING_PREP',
      title: 'Класически Бодибилдинг план',
      desc: 'Прецизни чисти източници: пилешко, ориз, овес, яйчни белтъци, телешко и броколи.',
    },
    {
      id: 'PESCATARIAN',
      title: 'Пескетариански режим',
      desc: 'Без месо от птици/животни; включва риба, морски дарове, млечни продукти и яйца.',
    },
    {
      id: 'VEGETARIAN',
      title: 'Вегетариански план',
      desc: 'Растителна основа плюс яйца, сирене, кашкавал, извара и протеин.',
    },
  ];

  const [ingredientSearch, setIngredientSearch] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginStatus(null);
    try {
      const res = await fetch('/api/user');
      const data = await res.json();
      if (data && !data.error) {
        setLoginStatus('Успешен вход! Пренасочване към портала...');
        setTimeout(() => {
          router.push('/');
        }, 800);
      } else {
        setLoginStatus('Грешка при вход. Моля проверете вашите данни.');
      }
    } catch (err) {
      setLoginStatus('Мрежова грешка при свързване със сървъра.');
    } finally {
      setLoading(false);
    }
  };

  // Finalize Registration & Instantly synthesize and enter dashboard
  const handleFinalizeAndEnterDashboard = async () => {
    setLoading(true);
    setLoadingMessage('AI синтезира вашата персонализирана програма...');
    
    try {
      // 1. Synthesize Program
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

      setLoadingMessage('Запазване на профила и генериране на тренировъчни шаблони...');

      // 2. Save User to Database
      await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name ? formData.name.trim().split(' ')[0] : 'Атлет',
          email: formData.email,
          gender: formData.gender,
          age: parseInt(String(formData.age)) || 25,
          heightCm: parseFloat(String(formData.heightCm)) || 175,
          currentWeight: parseFloat(String(formData.currentWeight)) || 80.0,
          targetWeight: parseFloat(String(formData.targetWeight)) || 75.0,
          trainingDaysPerWeek: formData.trainingDaysPerWeek,
          preferredTrainingHour: formData.preferredTrainingHour,
          emailNotificationsEnabled: formData.emailNotificationsEnabled,
          dailyCaloriesTarget: result.dailyCaloriesTarget,
          proteinTarget: result.proteinTarget,
          carbsTarget: result.carbsTarget,
          fatsTarget: result.fatsTarget,
          waterTargetMl: result.waterTargetMl,
          priorityMuscleGroups: formData.priorityMuscleGroups,
          avoidedMuscleAreas: formData.avoidedMuscleAreas,
          foodPreferences: formData.foodPreferences,
          avoidedIngredients: formData.avoidedIngredients,
          mealsPerDay: formData.mealsPerDay,
          mealTiming: formData.mealTiming,
          snackingHabits: formData.snackingHabits,
          mealPlanData: result.sevenDayMealPlan,
        }),
      });

      // 3. Clear existing templates and seed the newly synthesized templates
      try {
        await fetch('/api/templates', { method: 'DELETE' });
        for (const tmpl of result.templates) {
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
      } catch (tmplErr) {
        console.warn('Templates seeding warning:', tmplErr);
      }

      setLoadingMessage('Готово! Пренасочване към главното табло...');
      
      // 4. Directly redirect to dashboard
      window.location.href = '/';
    } catch (err) {
      console.error('Registration failed:', err);
      // Fallback redirect even on network quirk
      window.location.href = '/';
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
            Нова регистрация и AI анализ
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
              <Sparkles className="w-6 h-6" />
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
                  placeholder="ivan@domain.bg"
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
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Влизане...' : 'Влез в Профила'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        /* REGISTRATION FLOW (3 Steps) */
        <div className="space-y-6">
          {/* Progress Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Стъпка {step} от 3</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {step === 1 && 'Базови данни и профил'}
              {step === 2 && 'Физиологичен въпросник и мускулен фокус'}
              {step === 3 && 'Хранителни предпочитания и активация'}
            </h1>
            <p className="text-xs sm:text-sm text-text-muted max-w-xl mx-auto">
              {step === 1 && 'Въведете вашите основни данни за контакт и тренировъчен профил.'}
              {step === 2 && 'Отговорете на въпросите и изберете мускулни групи за персонализиране на тренировките.'}
              {step === 3 && 'Изберете стил на хранене, изключете нежелани храни и настройте напомнянията си.'}
            </p>

            {/* Stepper Dots (3 Steps) */}
            <div className="flex items-center justify-center gap-2 pt-4">
              {[1, 2, 3].map((s) => (
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

          {/* Loading Overlay */}
          {loading && (
            <div className="p-8 rounded-3xl bg-surface-1 border border-blue-500/40 text-center space-y-4 shadow-2xl animate-pulse">
              <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm font-bold text-white">{loadingMessage || 'Обработка...'}</p>
            </div>
          )}

          {/* STEP 1: Basic Bio */}
          {!loading && step === 1 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-surface-1 border border-border space-y-6 shadow-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Вашето първо име *</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="напр. Калоян"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value.trim().split(' ')[0] })}
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
                      placeholder="ivan@domain.bg"
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
          {!loading && step === 2 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-surface-1 border border-border space-y-8 shadow-xl">
              {/* TOP PRIORITY: Height, Current Weight, Target Weight */}
              <div className="p-5 rounded-2xl bg-surface-2/70 border border-blue-500/30 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Физически параметри и цели за тегло
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
                  const currentVal = (formData as any)[q.key];

                  return (
                    <div key={q.key} className="space-y-3 pb-6 border-b border-border/60">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Icon className="w-4 h-4 text-blue-400" />
                          <span>{q.title}</span>
                        </h4>
                      </div>
                      <p className="text-xs text-text-muted">{q.description}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                        {q.options.map((opt) => {
                          const isSelected = currentVal === opt.score;
                          return (
                            <button
                              key={opt.score}
                              type="button"
                              onClick={() => setFormData({ ...formData, [q.key]: opt.score })}
                              className={`p-3.5 rounded-2xl border text-left transition-all ${
                                isSelected
                                  ? 'bg-blue-600/20 border-blue-500 shadow-md ring-1 ring-blue-500'
                                  : 'bg-surface-2 hover:bg-surface-3 border-border/80 text-text-muted hover:text-white'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-neutral-200'}`}>
                                  {opt.label}
                                </span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                              </div>
                              <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed">
                                {opt.desc}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Training Days Per Week */}
              <div className="p-5 rounded-2xl bg-surface-2/60 border border-border space-y-3">
                <label className="block text-xs font-bold text-white">
                  Колко дни в седмицата искате да тренирате?
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setFormData({ ...formData, trainingDaysPerWeek: d })}
                      className={`py-3 rounded-xl font-mono text-xs sm:text-sm font-bold transition-all ${
                        formData.trainingDaysPerWeek === d
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-surface-3 text-text-muted hover:text-white border border-border'
                      }`}
                    >
                      {d} {d === 1 ? 'ден' : 'дни'}
                    </button>
                  ))}
                </div>
              </div>

              {/* SPECIFIC PRIORITY MUSCLES (MULTI-SELECT) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Приоритетни мускулни групи (Фокус)</span>
                  </h4>
                  <span className="text-[11px] text-blue-400 font-semibold">
                    * Можете да изберете повече от една
                  </span>
                </div>
                <p className="text-xs text-text-muted">
                  AI ще добави целеви обем, специализирани упражнения и по-висока честота за тези мускули.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                  {priorityMuscleOptions.map((opt) => {
                    const isSelected = formData.priorityMuscleGroups.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => togglePriorityMuscle(opt.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm ring-1 ring-amber-500/50'
                            : 'bg-surface-2 hover:bg-surface-3 border-border text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold truncate">{opt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                        </div>
                        <p className="text-[10px] text-text-muted truncate mt-0.5">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SPECIFIC AVOIDED MUSCLES / INJURY LIMITATIONS (MULTI-SELECT) */}
              <div className="space-y-3 pt-4 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <X className="w-4 h-4 text-red-400" />
                    <span>Ограничения и зони за щадене (Контузии)</span>
                  </h4>
                  <span className="text-[11px] text-red-400 font-semibold">
                    * Можете да изберете повече от една
                  </span>
                </div>
                <p className="text-xs text-text-muted">
                  AI ще изключи компрометиращи упражнения и ще подбере щадящи ставите алтернативи.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                  {avoidedMuscleOptions.map((opt) => {
                    const isSelected =
                      opt.id === 'NONE'
                        ? formData.avoidedMuscleAreas.length === 0
                        : formData.avoidedMuscleAreas.includes(opt.id);

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleAvoidedMuscle(opt.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? opt.id === 'NONE'
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                              : 'bg-red-500/20 border-red-500 text-red-300 font-bold ring-1 ring-red-500/50'
                            : 'bg-surface-2 hover:bg-surface-3 border-border text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold truncate">{opt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                        </div>
                        <p className="text-[10px] text-text-muted truncate mt-0.5">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-border/60">
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
                  <span>Продължи към Хранене & Настройки</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Dietary Preferences, Avoided Ingredients & Activation */}
          {!loading && step === 3 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-surface-1 border border-border space-y-8 shadow-xl">
              {/* Dietary Style */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-emerald-400" />
                  <span>Предпочитан Хранителен Стил</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {dietStyles.map((style) => {
                    const isSelected = formData.foodPreferences === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, foodPreferences: style.id })}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md ring-1 ring-emerald-500'
                            : 'bg-surface-2 hover:bg-surface-3 border-border text-text-muted hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs font-bold ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                            {style.title}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <p className="text-[11px] text-text-muted leading-relaxed">
                          {style.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Avoided Ingredients with Separate Yogurt & Fresh Milk */}
              <div className="space-y-4 pt-4 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <X className="w-4 h-4 text-red-400" />
                    <span>Храни и Съставки, които НЕ желаете да присъстват</span>
                  </h3>
                  {formData.avoidedIngredients.length > 0 && (
                    <span className="text-xs text-red-400 font-mono font-bold">
                      {formData.avoidedIngredients.length} изключени
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted">
                  Кликнете върху съставка или я потърсете, за да бъде напълно премахната от вашия 7-дневен хранителен план.
                </p>

                {/* Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Търси храна (напр. свинско, кисело мляко, прясно мляко, глутен, яйца...)"
                    value={ingredientSearch}
                    onChange={(e) => setIngredientSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-2 border border-border text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Ingredient Chips Grid */}
                <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1">
                  {filteredSearchIngredients.map((ing) => {
                    const isAvoided = formData.avoidedIngredients.includes(ing.id);
                    return (
                      <button
                        key={ing.id}
                        type="button"
                        onClick={() => toggleAvoidedIngredient(ing.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all border ${
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

              {/* Notification & Schedule Setup */}
              <div className="p-5 rounded-2xl bg-surface-2/70 border border-blue-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span>Имейл известяване "Време е за тренировка днес"</span>
                    </div>
                    <p className="text-[11px] text-text-muted">
                      Системата ще изпраща мотивиращ имейл точно в този час в дните за тренировка.
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
                  <div className="pt-2 border-t border-border/40 max-w-xs">
                    <label className="block text-[11px] font-semibold text-text-muted mb-1">
                      Приблизителен час на тренировката:
                    </label>
                    <input
                      type="time"
                      value={formData.preferredTrainingHour}
                      onChange={(e) => setFormData({ ...formData, preferredTrainingHour: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-surface-3 border border-border text-white text-xs font-mono font-bold"
                    />
                  </div>
                )}
              </div>

              {/* Navigation & Submit directly into Dashboard */}
              <div className="flex items-center justify-between pt-4 border-t border-border/60">
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
                  disabled={loading}
                  onClick={handleFinalizeAndEnterDashboard}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:opacity-90 text-white font-bold text-xs sm:text-sm transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Генерирай Програма & Влез в Таблото</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
