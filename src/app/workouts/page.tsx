'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Dumbbell, 
  Play, 
  Plus, 
  Trash2, 
  Check, 
  Clock, 
  Timer, 
  ChevronRight, 
  X, 
  Save, 
  CheckCircle,
  Flame,
  Award,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Video,
  Lock,
  Calendar,
  Activity,
  History,
  ShieldCheck,
  Pause
} from 'lucide-react';
import { WorkoutTemplate, ExerciseItem, WorkoutLogData, UserProfile } from '@/types';
import ExerciseVideoModal from '@/components/ExerciseVideoModal';
import WeeklyWorkoutCalendar from '@/components/WeeklyWorkoutCalendar';
import { calculateStartingWeight, calculateWorkoutDuration } from '@/lib/programSynthesizer';
import { getWarmupForWorkoutCategory, WarmupExercise } from '@/lib/warmupDatabase';

function WorkoutsContent() {
  const searchParams = useSearchParams();
  const activeParam = searchParams.get('active');

  const [user, setUser] = useState<UserProfile | null>(null);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLogData[]>([]);
  const [userTrainingDays, setUserTrainingDays] = useState<number>(4);
  const [loading, setLoading] = useState(true);
  const [selectedExerciseForVideo, setSelectedExerciseForVideo] = useState<any | null>(null);
  const [showWarmupSection, setShowWarmupSection] = useState(true);

  // Live Workout Session State
  const [activeSession, setActiveSession] = useState<{
    templateId?: string;
    title: string;
    category: string;
    startTime: Date;
    estimatedDurationMinutes?: number;
    warmupExercises: WarmupExercise[];
    exercises: {
      exerciseId: string;
      exerciseName: string;
      category: string;
      targetSets: number;
      repRange: string;
      targetRpe?: number;
      restSeconds: number;
      sets: {
        setNumber: number;
        weightKg: number;
        reps: number;
        targetReps: string;
        rpe: number;
        isCompleted: boolean;
      }[];
    }[];
  } | null>(null);

  // Single Rest Timer State (Located strictly next to finish workout)
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number | null>(null);
  const [initialRestDuration, setInitialRestDuration] = useState<number>(90);
  const [timerActive, setTimerActive] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Workout Completed Summary Modal
  const [completedSummary, setCompletedSummary] = useState<{
    title: string;
    durationMinutes: number;
    totalVolumeKg: number;
    totalSets: number;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tmplRes, exRes, userRes, workRes] = await Promise.all([
        fetch('/api/templates').then((r) => r.json()),
        fetch('/api/exercises').then((r) => r.json()),
        fetch('/api/user').then((r) => r.json()),
        fetch('/api/workouts').then((r) => r.json()),
      ]);

      if (Array.isArray(tmplRes)) setTemplates(tmplRes);
      if (Array.isArray(exRes)) setExercises(exRes);
      if (Array.isArray(workRes)) setWorkoutHistory(workRes);
      if (userRes && !userRes.error) {
        setUser(userRes);
        setUserTrainingDays(userRes.trainingDaysPerWeek || 4);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const startRestTimer = (seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setInitialRestDuration(seconds);
    setRestSecondsRemaining(seconds);
    setTimerActive(true);

    timerRef.current = setInterval(() => {
      setRestSecondsRemaining((prev) => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimerActive(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerActive(false);
  };

  const resumeTimer = () => {
    if (restSecondsRemaining === null || restSecondsRemaining <= 0) {
      startRestTimer(initialRestDuration || 90);
      return;
    }
    setTimerActive(true);
    timerRef.current = setInterval(() => {
      setRestSecondsRemaining((prev) => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimerActive(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetRestTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRestSecondsRemaining(null);
    setTimerActive(false);
  };

  const startWorkoutFromTemplate = (template: WorkoutTemplate) => {
    const sessionExercises = (template.exercises || []).map((te) => {
      const exObj = exercises.find((e) => e.id === te.exerciseId);
      const exName = exObj?.nameBg || exObj?.name || te.exerciseId;
      const numSets = te.targetSets || 3;
      const parsedTargetReps = parseInt(te.repRange?.split('-')[0]) || 10;
      
      const defaultWeight = te.startingWeightKg || calculateStartingWeight(
        te.exerciseId,
        (user?.gender as 'MALE' | 'FEMALE' | 'OTHER') || 'MALE',
        user?.currentWeight || 80,
        user?.experienceScale || 3
      );

      const sets = Array.from({ length: numSets }).map((_, i) => ({
        setNumber: i + 1,
        weightKg: defaultWeight,
        reps: parsedTargetReps,
        targetReps: te.repRange || '8-10',
        rpe: te.targetRpe || 8,
        isCompleted: false,
      }));

      return {
        exerciseId: te.exerciseId,
        exerciseName: exName,
        category: exObj?.category || 'COMPOUND',
        targetSets: te.targetSets,
        repRange: te.repRange,
        targetRpe: te.targetRpe || 8,
        restSeconds: te.restSeconds || 90,
        sets,
      };
    });

    const estDuration = template.estimatedDurationMinutes || calculateWorkoutDuration(template.exercises || []);
    const warmupExercises = getWarmupForWorkoutCategory(template.category);

    setActiveSession({
      templateId: template.id,
      title: template.title,
      category: template.category,
      startTime: new Date(),
      estimatedDurationMinutes: estDuration,
      warmupExercises,
      exercises: sessionExercises,
    });
  };

  const addExerciseToActiveSession = (exerciseId: string) => {
    if (!activeSession) return;
    const exObj = exercises.find((e) => e.id === exerciseId);
    if (!exObj) return;

    const defaultWeight = calculateStartingWeight(
      exerciseId,
      (user?.gender as 'MALE' | 'FEMALE' | 'OTHER') || 'MALE',
      user?.currentWeight || 80,
      user?.experienceScale || 3
    );

    const newEx = {
      exerciseId: exObj.id,
      exerciseName: exObj.nameBg || exObj.name,
      category: exObj.category,
      targetSets: 3,
      repRange: '8-12',
      targetRpe: 8,
      restSeconds: 90,
      sets: [
        { setNumber: 1, weightKg: defaultWeight, reps: 10, targetReps: '8-12', rpe: 8, isCompleted: false },
        { setNumber: 2, weightKg: defaultWeight, reps: 10, targetReps: '8-12', rpe: 8, isCompleted: false },
        { setNumber: 3, weightKg: defaultWeight, reps: 10, targetReps: '8-12', rpe: 8, isCompleted: false },
      ],
    };

    setActiveSession({
      ...activeSession,
      exercises: [...activeSession.exercises, newEx],
    });
  };

  const addSetToExercise = (exIdx: number) => {
    if (!activeSession) return;
    const currentSets = activeSession.exercises[exIdx].sets;
    const lastSet = currentSets[currentSets.length - 1];
    const newSet = {
      setNumber: currentSets.length + 1,
      weightKg: lastSet ? lastSet.weightKg : 20,
      reps: lastSet ? lastSet.reps : 10,
      targetReps: lastSet ? lastSet.targetReps : '8-10',
      rpe: 8,
      isCompleted: false,
    };

    const nextExercises = [...activeSession.exercises];
    nextExercises[exIdx].sets.push(newSet);
    setActiveSession({ ...activeSession, exercises: nextExercises });
  };

  const updateSet = (
    exIdx: number,
    setIdx: number,
    field: 'weightKg' | 'isCompleted',
    val: any
  ) => {
    if (!activeSession) return;
    const nextExercises = [...activeSession.exercises];
    const targetSet = nextExercises[exIdx].sets[setIdx];
    (targetSet as any)[field] = val;

    // Trigger single rest timer automatically on set completion
    if (field === 'isCompleted' && val === true) {
      const restSec = activeSession.exercises[exIdx].restSeconds || 90;
      startRestTimer(restSec);
    }

    setActiveSession({ ...activeSession, exercises: nextExercises });
  };

  const finishWorkout = async () => {
    if (!activeSession) return;
    const endTime = new Date();
    const durationMinutes = Math.max(1, Math.round((endTime.getTime() - activeSession.startTime.getTime()) / 60000));

    let totalVolumeKg = 0;
    let totalSets = 0;

    const loggedExercises = activeSession.exercises.map((ex, orderIdx) => {
      const completedSets = ex.sets.filter((s) => s.isCompleted);
      totalSets += completedSets.length;
      completedSets.forEach((s) => {
        totalVolumeKg += (s.weightKg || 0) * (s.reps || 0);
      });

      return {
        exerciseId: ex.exerciseId,
        orderIndex: orderIdx,
        sets: ex.sets.map((s) => ({
          setNumber: s.setNumber,
          weightKg: s.weightKg,
          reps: s.reps,
          rpe: s.rpe,
          isCompleted: s.isCompleted,
        })),
      };
    });

    try {
      await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: activeSession.templateId,
          title: activeSession.title,
          startedAt: activeSession.startTime.toISOString(),
          completedAt: endTime.toISOString(),
          durationMinutes,
          totalVolumeKg,
          notes: '',
          exercises: loggedExercises,
        }),
      });

      setCompletedSummary({
        title: activeSession.title,
        durationMinutes,
        totalVolumeKg,
        totalSets,
      });

      setActiveSession(null);
      if (timerRef.current) clearInterval(timerRef.current);
      setRestSecondsRemaining(null);
      fetchData();
    } catch (err) {
      console.error('Failed to log workout session:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          <span className="text-text-muted text-sm font-medium">Зареждане на тренировъчната програма...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* If an active session is in progress, display the live logger */}
      {activeSession ? (
        <div className="space-y-6">
          {/* Active Workout Top Banner */}
          <div className="p-6 rounded-3xl bg-surface-1 border border-blue-500/30 glow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">
                  Активна Тренировка в Реално Време
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {activeSession.title}
              </h1>
              <p className="text-xs text-text-muted mt-1 flex items-center gap-2">
                <span>Стартирана в {activeSession.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span>•</span>
                <span className="text-orange-400 font-mono">Прогнозна продължителност: ~{activeSession.estimatedDurationMinutes || 50} мин</span>
              </p>
            </div>

            {/* Top Right: Single Rest Timer Button & Finish Button */}
            <div className="flex items-center flex-wrap gap-3">
              {/* THE ONLY REST TIMER BUTTON */}
              <div className="relative">
                <button
                  onClick={() => {
                    if (restSecondsRemaining === null) {
                      startRestTimer(90);
                    } else {
                      setIsTimerOpen(!isTimerOpen);
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all border shadow-sm active:scale-95 ${
                    timerActive
                      ? 'bg-blue-500 text-black border-blue-400 shadow-blue-500/20 shadow-md animate-pulse'
                      : restSecondsRemaining !== null
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-surface-2 hover:bg-surface-3 text-white border-border'
                  }`}
                >
                  <Timer className="w-4 h-4" />
                  <span>
                    {restSecondsRemaining !== null
                      ? `Таймер за почивка: ${restSecondsRemaining}s`
                      : 'Таймер за почивка (90s)'}
                  </span>
                </button>

                {/* Dropdown controls for Rest Timer */}
                {restSecondsRemaining !== null && (
                  <div className="flex items-center gap-1.5 mt-2 bg-surface-2 p-1.5 rounded-xl border border-border">
                    {timerActive ? (
                      <button
                        onClick={pauseTimer}
                        className="px-2 py-1 bg-surface-3 hover:bg-white/10 rounded-lg text-[10px] text-amber-300 flex items-center gap-1"
                        title="Пауза"
                      >
                        <Pause className="w-3 h-3" />
                        Пауза
                      </button>
                    ) : (
                      <button
                        onClick={resumeTimer}
                        className="px-2 py-1 bg-blue-500 text-black rounded-lg text-[10px] font-bold flex items-center gap-1"
                        title="Продължи"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        Старт
                      </button>
                    )}

                    <button
                      onClick={() => startRestTimer((restSecondsRemaining || 0) + 30)}
                      className="px-2 py-1 bg-surface-3 hover:bg-white/10 rounded-lg text-[10px] text-white"
                    >
                      +30с
                    </button>

                    <button
                      onClick={() => startRestTimer(60)}
                      className="px-2 py-1 bg-surface-3 hover:bg-white/10 rounded-lg text-[10px] text-neutral-300"
                    >
                      60с
                    </button>

                    <button
                      onClick={() => startRestTimer(120)}
                      className="px-2 py-1 bg-surface-3 hover:bg-white/10 rounded-lg text-[10px] text-neutral-300"
                    >
                      120с
                    </button>

                    <button
                      onClick={resetRestTimer}
                      className="px-2 py-1 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg text-[10px] flex items-center gap-1 font-semibold"
                      title="Рестартирай таймера"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Рестарт
                    </button>
                  </div>
                )}
              </div>

              {/* Finish Workout Button */}
              <button
                onClick={finishWorkout}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Завърши Тренировката
              </button>

              <button
                onClick={() => {
                  if (confirm('Сигурни ли сте, че искате да прекратите активната тренировка без запис?')) setActiveSession(null);
                }}
                className="p-2.5 rounded-xl bg-surface-2 hover:bg-red-500/20 text-text-muted hover:text-red-400 border border-border transition-all"
                title="Откажи тренировка"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* DYNAMIC WARM-UP & MOBILITY PROTOCOL (WITH VIDEOS) */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-surface-1 to-surface-1 border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Загряващ Протокол & Мобилност Преди Тренировка (5-8 мин)
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      Задължителна фаза
                    </span>
                  </h3>
                  <p className="text-[11px] text-text-muted">
                    Подгответе ставите, ротаторния маншон и нервната система преди работните серии.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowWarmupSection(!showWarmupSection)}
                className="text-xs font-semibold text-amber-400 hover:underline"
              >
                {showWarmupSection ? 'Скрий загрявката' : 'Покажи упражненията'}
              </button>
            </div>

            {showWarmupSection && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                {activeSession.warmupExercises.map((wu) => (
                  <div
                    key={wu.id}
                    className="p-3 rounded-2xl bg-surface-2/80 border border-border/70 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-amber-400">
                          {wu.durationOrRepsBg}
                        </span>
                        <span className="text-[10px] font-mono text-text-muted">Мобилност</span>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1 line-clamp-1">{wu.nameBg}</h4>
                      <p className="text-[11px] text-text-muted mt-0.5 line-clamp-2">{wu.instructionsBg}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedExerciseForVideo({
                        id: wu.id,
                        name: wu.name,
                        nameBg: wu.nameBg,
                        category: 'WARMUP' as any,
                        equipment: 'BODYWEIGHT',
                        videoUrl: wu.videoUrl,
                        targetMuscles: wu.targetAreaBg,
                        executionInstructions: wu.instructionsBg,
                      })}
                      className="w-full mt-2 py-1.5 rounded-xl bg-surface-3 hover:bg-white/10 text-xs text-amber-300 font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Гледай видео насока
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Exercise Sets Tracker List (Locked Reps, Editable Weight, No Per-Row Timer Button) */}
          <div className="space-y-4">
            {activeSession.exercises.map((ex, exIdx) => (
              <div key={ex.exerciseId + exIdx} className="p-5 rounded-3xl bg-surface-1 border border-border space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-surface-3 flex items-center justify-center text-xs font-bold text-white font-mono">
                      {exIdx + 1}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white">{ex.exerciseName}</h3>
                      <div className="text-xs text-text-muted font-mono flex items-center gap-2 mt-0.5">
                        <span>Цел: {ex.targetSets} серии × {ex.repRange} повторения</span>
                        <span>•</span>
                        <span className="text-blue-400">Почивка: {ex.restSeconds} сек</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const exObj = exercises.find((e) => e.id === ex.exerciseId);
                      if (exObj) setSelectedExerciseForVideo(exObj);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 text-xs text-blue-400 border border-border transition-all self-start sm:self-auto"
                    title="Гледай видео демонстрация от Muscle & Strength"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Видео демонстрация
                  </button>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-text-muted uppercase tracking-wider px-2 font-mono">
                  <div className="col-span-2">Серия</div>
                  <div className="col-span-4">Тежест (кг) - Променяема</div>
                  <div className="col-span-3 text-center">Повторения (Заключени)</div>
                  <div className="col-span-3 text-center">Готово</div>
                </div>

                {/* Sets rows */}
                <div className="space-y-2">
                  {ex.sets.map((s, sIdx) => (
                    <div
                      key={sIdx}
                      className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border transition-all ${
                        s.isCompleted
                          ? 'bg-emerald-500/5 border-emerald-500/20'
                          : 'bg-surface-2 border-border/80'
                      }`}
                    >
                      <div className="col-span-2 font-mono text-xs font-semibold text-text-secondary pl-2">
                        #{s.setNumber}
                      </div>

                      {/* Weight (Editable, pre-calculated from questionnaire) */}
                      <div className="col-span-4">
                        <input
                          type="number"
                          step="0.5"
                          placeholder="0"
                          value={s.weightKg || ''}
                          onChange={(e) => updateSet(exIdx, sIdx, 'weightKg', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 rounded-lg bg-surface-3 border border-border text-sm font-mono text-white text-center font-bold focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Reps (Locked / Read-Only as requested by user) */}
                      <div className="col-span-3 flex items-center justify-center">
                        <div className="w-full px-3 py-1.5 rounded-lg bg-surface-3/60 border border-border/50 text-sm font-mono text-neutral-300 text-center flex items-center justify-center gap-1 select-none">
                          <Lock className="w-3 h-3 text-text-muted" />
                          <span>{s.targetReps || s.reps}</span>
                        </div>
                      </div>

                      <div className="col-span-3 flex justify-center">
                        <button
                          type="button"
                          onClick={() => updateSet(exIdx, sIdx, 'isCompleted', !s.isCompleted)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                            s.isCompleted
                              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                              : 'bg-surface-3 text-text-muted hover:text-white border border-border'
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-start">
                  <button
                    onClick={() => addSetToExercise(exIdx)}
                    className="text-xs font-semibold text-text-secondary hover:text-white flex items-center gap-1 py-1.5 px-3 rounded-xl bg-surface-2 border border-border transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Добави допълнителна серия
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Additional Exercise to Session */}
          <div className="p-5 rounded-3xl bg-surface-1 border border-border space-y-3">
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Добави допълнително упражнение към текущата сесия
            </h4>
            <div className="flex flex-wrap gap-2">
              {exercises.slice(0, 8).map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => addExerciseToActiveSession(ex.id)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-text-secondary hover:text-white flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {ex.nameBg || ex.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Normal Template Browser & Completed History */
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-2 border border-border text-text-secondary uppercase tracking-wider">
                  Индивидуална Тренировъчна Програма
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Тренировъчен План</h1>
              <p className="text-sm text-text-muted mt-1">
                Вашият активен тренировъчен график. Кликнете на съответния тренировъчен ден за старт.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/register"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                Създай различна цел (Нов план)
              </Link>
            </div>
          </div>

          {/* 7-Day Interactive Weekly Workout Calendar */}
          <WeeklyWorkoutCalendar
            trainingDaysPerWeek={userTrainingDays}
            templates={templates}
            onStartSession={startWorkoutFromTemplate}
            onOpenVideoModal={(ex) => setSelectedExerciseForVideo(ex)}
            onUpdateTrainingDays={(days) => setUserTrainingDays(days)}
          />

          {/* COMPLETED WORKOUTS HISTORY (Replaced Exercise DB) */}
          <div className="p-6 rounded-3xl bg-surface-1 border border-border space-y-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    История на Завършените Тренировки
                    <span className="text-xs font-mono text-text-muted">({workoutHistory.length} сесии)</span>
                  </h3>
                  <p className="text-xs text-text-muted">
                    Подробен лог на вашите завършени тренировки, вдигнат тонаж и време.
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono text-emerald-400 font-semibold">
                Общ вдигнат обем: {workoutHistory.reduce((acc, w) => acc + (w.totalVolumeKg || 0), 0).toLocaleString()} кг
              </span>
            </div>

            {workoutHistory.length === 0 ? (
              <div className="py-10 text-center text-xs text-text-muted">
                Все още нямате завършени тренировки. Изберете тренировъчен ден от календара по-горе и натиснете &quot;Започни&quot;!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workoutHistory.map((log) => {
                  const dateStr = new Date(log.startedAt).toLocaleDateString('bg-BG', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  });

                  return (
                    <div
                      key={log.id}
                      className="p-4 rounded-2xl bg-surface-2/60 border border-border/70 space-y-3 hover:border-border transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-border/40">
                          <span className="text-xs font-bold text-white truncate">{log.title}</span>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10">
                            {dateStr}
                          </span>
                        </div>

                        {(() => {
                          const sets = log.loggedSets || [];
                          const exerciseMap: Record<string, number> = {};
                          sets.forEach((s) => {
                            const name = s.exercise?.nameBg || s.exercise?.name || 'Упражнение';
                            exerciseMap[name] = (exerciseMap[name] || 0) + 1;
                          });
                          const exerciseNames = Object.keys(exerciseMap);

                          return (
                            <>
                              <div className="grid grid-cols-3 gap-2 py-2 font-mono text-center text-xs">
                                <div className="p-2 rounded-xl bg-surface-3">
                                  <span className="text-[9px] text-text-muted block uppercase">Време</span>
                                  <span className="font-bold text-white">{log.durationMinutes || 45} мин</span>
                                </div>
                                <div className="p-2 rounded-xl bg-surface-3">
                                  <span className="text-[9px] text-text-muted block uppercase">Тонаж</span>
                                  <span className="font-bold text-orange-400">{log.totalVolumeKg?.toLocaleString()} кг</span>
                                </div>
                                <div className="p-2 rounded-xl bg-surface-3">
                                  <span className="text-[9px] text-text-muted block uppercase">Упражнения</span>
                                  <span className="font-bold text-blue-400">{exerciseNames.length}</span>
                                </div>
                              </div>

                              {exerciseNames.length > 0 && (
                                <div className="space-y-1 pt-1">
                                  <span className="text-[10px] uppercase font-mono text-text-muted font-bold block">
                                    Изпълнени движения:
                                  </span>
                                  <div className="text-[11px] text-neutral-300 space-y-0.5">
                                    {exerciseNames.map((name, idx) => (
                                      <div key={idx} className="truncate">
                                        • {name} ({exerciseMap[name]} серии)
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Demonstration Modal */}
      <ExerciseVideoModal
        exercise={selectedExerciseForVideo}
        isOpen={!!selectedExerciseForVideo}
        onClose={() => setSelectedExerciseForVideo(null)}
      />

      {/* Workout Completed Summary Modal */}
      {completedSummary && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-surface-1 border border-border rounded-3xl p-6 shadow-2xl space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white">Тренировката е Завършена!</h3>
              <p className="text-xs text-text-muted">
                Отлична работа! Вашите данни за натоварването и обема са записани успешно в профила.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-surface-2 border border-border font-mono text-xs">
              <div>
                <span className="text-text-muted block text-[10px] uppercase">Време</span>
                <span className="text-base font-bold text-white">{completedSummary.durationMinutes} мин</span>
              </div>
              <div>
                <span className="text-text-muted block text-[10px] uppercase">Общ Тонаж</span>
                <span className="text-base font-bold text-emerald-400">
                  {completedSummary.totalVolumeKg.toLocaleString()} кг
                </span>
              </div>
              <div>
                <span className="text-text-muted block text-[10px] uppercase">Серии</span>
                <span className="text-base font-bold text-blue-400">{completedSummary.totalSets}</span>
              </div>
            </div>

            <button
              onClick={() => setCompletedSummary(null)}
              className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all shadow-md"
            >
              Към Таблото
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkoutsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-text-muted">Зареждане на тренировки...</div>}>
      <WorkoutsContent />
    </Suspense>
  );
}
