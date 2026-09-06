'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Dumbbell, 
  Flame, 
  LineChart, 
  ArrowUpRight, 
  CheckCircle2, 
  Play, 
  Plus, 
  Target, 
  Calendar, 
  TrendingDown, 
  Zap,
  Clock,
  Sparkles
} from 'lucide-react';
import { UserProfile, WorkoutTemplate, NutritionEntry, WorkoutLogData } from '@/types';
import WeeklyWorkoutCalendar from '@/components/WeeklyWorkoutCalendar';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [nutritionLogs, setNutritionLogs] = useState<NutritionEntry[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutLogData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [userRes, tmplRes, nutrRes, workRes] = await Promise.all([
          fetch('/api/user').then((r) => r.json()),
          fetch('/api/templates').then((r) => r.json()),
          fetch('/api/nutrition').then((r) => r.json()),
          fetch('/api/workouts').then((r) => r.json()),
        ]);

        if (userRes && !userRes.error) {
          setUser(userRes);
        } else {
          // No user in DB yet — redirect to registration
          router.replace('/register');
          return;
        }
        if (Array.isArray(tmplRes)) setTemplates(tmplRes);
        if (Array.isArray(nutrRes)) setNutritionLogs(nutrRes);
        if (Array.isArray(workRes)) setRecentWorkouts(workRes.slice(0, 3));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        router.replace('/register');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute nutrition totals
  const totalCalories = nutritionLogs.reduce((acc, item) => acc + (item.calories || 0), 0);
  const totalProtein = nutritionLogs.reduce((acc, item) => acc + (item.protein || 0), 0);
  const totalCarbs = nutritionLogs.reduce((acc, item) => acc + (item.carbs || 0), 0);
  const totalFats = nutritionLogs.reduce((acc, item) => acc + (item.fats || 0), 0);

  const calTarget = user?.dailyCaloriesTarget || 2500;
  const calPercent = Math.min(100, Math.round((totalCalories / calTarget) * 100));

  const proTarget = user?.proteinTarget || 180;
  const proPercent = Math.min(100, Math.round((totalProtein / proTarget) * 100));

  const carbsTarget = user?.carbsTarget || 250;
  const carbsPercent = Math.min(100, Math.round((totalCarbs / carbsTarget) * 100));

  const fatsTarget = user?.fatsTarget || 65;
  const fatsPercent = Math.min(100, Math.round((totalFats / fatsTarget) * 100));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          <span className="text-text-muted text-sm font-medium tracking-wide">Зареждане на портала...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-2 border border-border text-text-secondary uppercase tracking-wider">
              Ежедневен Протокол
            </span>
            <span className="text-xs text-text-muted flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5" />
              {new Date().toLocaleDateString('bg-BG', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Добре дошли отново, {user?.name || 'Атлет'}
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Вашата програма е активна. Следете калорийния баланс и стартирайте днешната сесия.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/register"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            Създай различна цел
          </Link>
          <Link
            href="/workouts"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all shadow-md active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Стартирай Тренировка
          </Link>
        </div>
      </div>

      {/* 7-Day Interactive Workout Calendar */}
      <WeeklyWorkoutCalendar
        trainingDaysPerWeek={user?.trainingDaysPerWeek || 4}
        templates={templates}
        onStartSession={(template) => {
          router.push(`/workouts?active=${template.id}`);
        }}
      />

      {/* Quick Status Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calories Card */}
        <div className="p-6 rounded-3xl bg-surface-1 border border-border flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Дневен Калориен Прием</span>
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-mono text-white">{totalCalories}</span>
              <span className="text-sm text-text-muted font-mono">/ {calTarget} ккал</span>
            </div>
            <div className="w-full bg-surface-3 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-500"
                style={{ width: `${calPercent}%` }}
              />
            </div>
          </div>
          <Link
            href="/nutrition"
            className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1"
          >
            Към дневника за хранене <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Protein Card */}
        <div className="p-6 rounded-3xl bg-surface-1 border border-border flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Протеин за деня</span>
            <Zap className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-mono text-white">{totalProtein}</span>
              <span className="text-sm text-text-muted font-mono">/ {proTarget} г</span>
            </div>
            <div className="w-full bg-surface-3 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${proPercent}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-text-muted font-mono">
            {proPercent}% от дневната цел за мускулен растеж
          </span>
        </div>

        {/* Weight & Progress Card */}
        <div className="p-6 rounded-3xl bg-surface-1 border border-border flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Текущо Тегло & Цел</span>
            <Target className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-mono text-white">{user?.currentWeight || 80.0}</span>
              <span className="text-sm text-text-muted font-mono">кг (Цел: {user?.targetWeight || 75.0} кг)</span>
            </div>
            <div className="text-xs text-text-muted mt-2">
              Честота на тренировките: <strong className="text-white">{user?.trainingDaysPerWeek || 4} дни / седмица</strong>
            </div>
          </div>
          <Link
            href="/progress"
            className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
          >
            Попълни Седмичен Чек-ин <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      {recentWorkouts.length > 0 && (
        <div className="p-6 rounded-3xl bg-surface-1 border border-border space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            Последно завършени тренировки
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentWorkouts.map((w) => (
              <div key={w.id} className="p-4 rounded-2xl bg-surface-2 border border-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">{w.title}</span>
                  <span className="text-[10px] font-mono text-emerald-400">✓ Завършена</span>
                </div>
                <div className="text-[11px] font-mono text-text-muted">
                  {w.durationMinutes} мин • {w.totalVolumeKg?.toLocaleString()} кг вдигнат товар
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
