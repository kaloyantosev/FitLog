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
  const [initialRestDuration, setInitialRestDuration] = useState<number>(120);
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
      startRestTimer(initialRestDuration || 120);
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
        restSeconds: te.restSeconds || 120,
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
      const restSec = activeSession.exercises[exIdx].restSeconds || 120;
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
        totalVolumeKg += (parseFloat(String(s.weightKg)) || 0) * (s.reps || 0);
      });

      return {
        exerciseId: ex.exerciseId,
        orderIndex: orderIdx,
        sets: ex.sets.map((s) => ({
          setNumber: s.setNumber,
          weightKg: parseFloat(String(s.weightKg)) || 0,
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

            {/* Top Right: Finish Button */}
            <div className="flex items-center flex-wrap gap-3">
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
                    Загрявка и мобилност преди тренировка (5-8 мин)
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
                      Гледай видео урок
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
                    {/* Equipment / Attachment thumbnail photo & Full Equipment Badge */}
                    {(() => {
                      const exObj = exercises.find((e) => e.id === ex.exerciseId);
                      const exerciseAttachmentMap: Record<string, { url: string; label: string; desc: string }> = {
                        'ex-1': { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=160&auto=format&fit=crop&q=80', label: 'Прав олимпийски лост', desc: 'Лост за права лежанка' },
                        'ex-2': { url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=160&auto=format&fit=crop&q=80', label: 'Чифт дъмбели', desc: 'Дъмбели за полулег' },
                        'ex-3': { url: 'https://images.unsplash.com/photo-1591311630200-ffa9120a540f?w=160&auto=format&fit=crop&q=80', label: 'D-ръкохватки за скрипец', desc: 'Единични ръкохватки за скрипец' },
                        'ex-4': { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=160&auto=format&fit=crop&q=80', label: 'Прав олимпийски лост', desc: 'Лост на клек рак' },
                        'ex-5': { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=160&auto=format&fit=crop&q=80', label: 'Прав олимпийски лост', desc: 'Лост за румънска тяга (RDL)' },
                        'ex-6': { url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=160&auto=format&fit=crop&q=80', label: 'Чифт дъмбели', desc: 'Дъмбели за български клек' },
                        'ex-7': { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=160&auto=format&fit=crop&q=80', label: 'Калф машина', desc: 'Машина за прасци' },
                        'ex-8': { url: 'https://images.unsplash.com/photo-1591311630200-ffa9120a540f?w=160&auto=format&fit=crop&q=80', label: 'Широк лост за скрипец', desc: 'Лост за горен скрипец' },
                        'ex-9': { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=160&auto=format&fit=crop&q=80', label: 'Т-щанга с опора', desc: 'Т-щанга машина с гръдна опора' },
                        'ex-10': { url: 'https://images.unsplash.com/photo-1591311630200-ffa9120a540f?w=160&auto=format&fit=crop&q=80', label: 'V-ръкохватка за гребане', desc: 'Триъгълна V-ръкохватка' },
                        'ex-11': { url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=160&auto=format&fit=crop&q=80', label: 'Чифт дъмбели', desc: 'Дъмбели за странично рамо' },
                        'ex-12': { url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=160&auto=format&fit=crop&q=80', label: 'Чифт дъмбели', desc: 'Дъмбели за раменна преса' },
                        'ex-13': { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=160&auto=format&fit=crop&q=80', label: 'Въже за скрипец', desc: 'Двойно въже за фейспул' },
                        'ex-14': { url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=160&auto=format&fit=crop&q=80', label: 'Чифт дъмбели', desc: 'Дъмбели за бицепс от полулег' },
                        'ex-15': { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=160&auto=format&fit=crop&q=80', label: 'Въже за скрипец', desc: 'Въже за трицепс разгъване' },
                        'ex-16': { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=160&auto=format&fit=crop&q=80', label: 'Въже за скрипец', desc: 'Въже за трицепс над глава' },
                        'ex-17': { url: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=160&auto=format&fit=crop&q=80', label: 'Лост за набирания', desc: 'Лост за повдигане на крака' },
                      };

                      const fallbackEquip: Record<string, { url: string; label: string; desc: string }> = {
                        BARBELL: { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=160&auto=format&fit=crop&q=80', label: 'Прав лост', desc: 'Олимпийски лост' },
                        DUMBBELL: { url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=160&auto=format&fit=crop&q=80', label: 'Дъмбели', desc: 'Чифт дъмбели' },
                        CABLE: { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=160&auto=format&fit=crop&q=80', label: 'Въже / Ръкохватка', desc: 'Приставка за скрипец' },
                        MACHINE: { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=160&auto=format&fit=crop&q=80', label: 'Фитнес машина', desc: 'Машина с опора' },
                        BODYWEIGHT: { url: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=160&auto=format&fit=crop&q=80', label: 'Лост за вис', desc: 'Лост или постелка' },
                      };

                      const equip = exObj?.equipment || 'BARBELL';
                      const item = exerciseAttachmentMap[ex.exerciseId] || fallbackEquip[equip] || fallbackEquip.BARBELL;

                      return (
                        <>
                          <div className="relative shrink-0 group/equip" title={`${item.label} (${item.desc})`}>
                            <img
                              src={item.url}
                              alt={item.label}
                              className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover border border-blue-500/30 shadow-md ring-1 ring-white/10 group-hover/equip:ring-blue-500/60 transition-all"
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="w-5 h-5 rounded-md bg-surface-3 flex items-center justify-center text-[10px] font-bold text-text-muted font-mono shrink-0">
                                {exIdx + 1}
                              </span>
                              <h3 className="text-base font-bold text-white">{ex.exerciseName}</h3>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-[11px] font-bold text-blue-300">
                                <Dumbbell className="w-3 h-3 text-blue-400 shrink-0" />
                                <span>{item.label}</span>
                              </span>
                            </div>
                            <div className="text-xs text-text-muted font-mono flex items-center gap-2 mt-1">
                              <span>Цел: {ex.targetSets} серии × {ex.repRange} повт.</span>
                              <span>•</span>
                              <span className="text-blue-400 font-semibold">Почивка: {ex.restSeconds} сек</span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const exObj = exercises.find((e) => e.id === ex.exerciseId);
                      if (exObj) setSelectedExerciseForVideo(exObj);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 text-xs text-blue-400 border border-border transition-all self-start sm:self-auto"
                    title="Гледай видео демонстрация за техника"
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
                          type="text"
                          inputMode="decimal"
                          placeholder="0"
                          value={s.weightKg ?? ''}
                          onChange={(e) => updateSet(exIdx, sIdx, 'weightKg', e.target.value)}
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


          {/* Floating Circular Rest Timer */}
          {restSecondsRemaining !== null && (
            <div className="fixed bottom-24 md:bottom-8 right-4 z-50 flex flex-col items-center gap-2">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle
                    cx="48" cy="48" r="42"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="8"
                  />
                  <circle
                    cx="48" cy="48" r="42"
                    fill="none"
                    stroke={restSecondsRemaining > 60 ? '#3b82f6' : restSecondsRemaining > 30 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - restSecondsRemaining / initialRestDuration)}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-xl font-black font-mono ${
                    restSecondsRemaining > 60 ? 'text-blue-300' : restSecondsRemaining > 30 ? 'text-amber-300' : 'text-red-400'
                  }`}>{restSecondsRemaining}</span>
                  <span className="text-[9px] text-text-muted font-mono uppercase tracking-wider">сек</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-text-muted font-semibold">Почивка</span>
                <button
                  onClick={resetRestTimer}
                  className="w-5 h-5 rounded-full bg-surface-2 hover:bg-red-500/20 text-text-muted hover:text-red-400 flex items-center justify-center transition-all"
                  title="Затвори таймера"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
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
