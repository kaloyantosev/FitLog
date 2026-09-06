'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Play, 
  Sparkles, 
  Moon, 
  Flame, 
  Dumbbell, 
  CheckCircle2, 
  Video, 
  ChevronRight,
  Activity,
  Layers,
  Clock,
  Timer
} from 'lucide-react';
import { WorkoutTemplate, ExerciseItem } from '@/types';

interface WeeklyWorkoutCalendarProps {
  trainingDaysPerWeek?: number;
  templates: WorkoutTemplate[];
  onStartSession: (template: WorkoutTemplate) => void;
  onOpenVideoModal?: (exercise: ExerciseItem) => void;
  onUpdateTrainingDays?: (days: number) => void;
}

export default function WeeklyWorkoutCalendar({
  trainingDaysPerWeek = 4,
  templates = [],
  onStartSession,
  onOpenVideoModal,
  onUpdateTrainingDays,
}: WeeklyWorkoutCalendarProps) {
  const [activeDays, setActiveDays] = useState<number>(trainingDaysPerWeek || 4);

  // Current day of the week (0 = Monday, 1 = Tuesday, ..., 6 = Sunday)
  const now = new Date();
  const currentDayIndex = (now.getDay() + 6) % 7;

  // Calculate dates of the current week (Monday to Sunday)
  const getWeekDates = () => {
    const monday = new Date(now);
    monday.setDate(now.getDate() - currentDayIndex);
    
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        dateNum: d.getDate(),
        monthName: d.toLocaleDateString('bg-BG', { month: 'short' }),
        dayNameBg: ['Понеделник', 'Вторник', 'Сряда', 'Четвъртък', 'Петък', 'Събота', 'Неделя'][i],
        shortDayBg: ['ПОН', 'ВТО', 'СРЯ', 'ЧЕТ', 'ПЕТ', 'СЪБ', 'НЕД'][i],
        isToday: i === currentDayIndex,
        dayIdx: i,
      };
    });
  };

  const weekDates = getWeekDates();

  // Determine which days of week are training days based on activeDays (1-5)
  // Mapping: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
  const getDaySchedule = (dayIdx: number) => {
    let isTraining = false;
    let templateIdx = 0;

    switch (activeDays) {
      case 1:
        if (dayIdx === 0) { isTraining = true; templateIdx = 0; }
        break;
      case 2:
        if (dayIdx === 0) { isTraining = true; templateIdx = 0; }
        if (dayIdx === 2) { isTraining = true; templateIdx = 1; }
        break;
      case 3:
        if (dayIdx === 0) { isTraining = true; templateIdx = 0; }
        if (dayIdx === 2) { isTraining = true; templateIdx = 1; }
        if (dayIdx === 4) { isTraining = true; templateIdx = 2; }
        break;
      case 4:
        if (dayIdx === 0) { isTraining = true; templateIdx = 0; }
        if (dayIdx === 1) { isTraining = true; templateIdx = 1; }
        if (dayIdx === 3) { isTraining = true; templateIdx = 2; }
        if (dayIdx === 4) { isTraining = true; templateIdx = 3; }
        break;
      case 5:
        if (dayIdx === 0) { isTraining = true; templateIdx = 0; }
        if (dayIdx === 1) { isTraining = true; templateIdx = 1; }
        if (dayIdx === 2) { isTraining = true; templateIdx = 2; }
        if (dayIdx === 4) { isTraining = true; templateIdx = 3; }
        if (dayIdx === 5) { isTraining = true; templateIdx = 4; }
        break;
      default:
        if (dayIdx === 0 || dayIdx === 1 || dayIdx === 3 || dayIdx === 4) {
          isTraining = true;
          templateIdx = Math.min(templates.length - 1, dayIdx === 0 ? 0 : dayIdx === 1 ? 1 : dayIdx === 3 ? 2 : 3);
        }
    }

    const assignedTemplate = isTraining && templates.length > 0
      ? templates[templateIdx % templates.length]
      : null;

    return {
      isTraining,
      template: assignedTemplate,
    };
  };

  const handleDayCountChange = (days: number) => {
    setActiveDays(days);
    if (onUpdateTrainingDays) {
      onUpdateTrainingDays(days);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Frequency Controller */}
      <div className="flex flex-col gap-2 p-5 rounded-3xl bg-surface-1 border border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 uppercase tracking-wider">
              7-дневен Тренировъчен Календар
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            График на тренировките за седмицата
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Дните са разпределени автоматично спрямо вашия тренировъчен план.
          </p>
        </div>
      </div>


      {/* 7-Days Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDates.map((d) => {
          const { isTraining, template } = getDaySchedule(d.dayIdx);
          const durationMins = template?.estimatedDurationMinutes || (template?.exercises ? Math.max(40, template.exercises.length * 10) : 50);

          return (
            <div
              key={d.dayIdx}
              className={`flex flex-col justify-between rounded-3xl p-4 border transition-all duration-300 relative overflow-hidden group ${
                d.isToday
                  ? 'bg-gradient-to-b from-blue-950/40 via-surface-1 to-surface-1 border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/40'
                  : isTraining
                  ? 'bg-surface-1 border-border/80 hover:border-border hover:shadow-md'
                  : 'bg-surface-1/40 border-border/30 opacity-70 hover:opacity-100'
              }`}
            >
              {/* Top Row: Day Name & Date */}
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted font-semibold">
                      {d.shortDayBg}
                    </span>
                    <span className="text-sm font-bold text-white leading-tight">
                      {d.dateNum} {d.monthName}
                    </span>
                  </div>

                  {d.isToday && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500 text-black text-[10px] font-black uppercase tracking-wider animate-pulse shadow-sm">
                      Днес
                    </span>
                  )}
                </div>

                {/* Training / Rest Status */}
                {isTraining && template ? (
                  <div className="space-y-2 mt-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                        {template.category}
                      </span>
                      <span className="text-[10px] font-mono text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3 text-orange-400" />
                        ~{durationMins} мин
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2">
                      {template.title}
                    </h4>

                    <p className="text-[11px] text-text-muted line-clamp-2 font-light">
                      {template.exercises?.length || 0} упражнения с видео насоки и точни почивки.
                    </p>
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400/80">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-neutral-300 block">Почивен ден</span>
                      <span className="text-[10px] text-text-muted">Възстановяване и сън</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Action */}
              {isTraining && template && (
                <div className="pt-3 mt-3 border-t border-border/30">
                  <button
                    onClick={() => onStartSession(template)}
                    className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 ${
                      d.isToday
                        ? 'bg-blue-500 hover:bg-blue-400 text-black shadow-blue-500/20 shadow-md'
                        : 'bg-white hover:bg-neutral-200 text-black'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{d.isToday ? 'Стартирай днес' : 'Започни'}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
