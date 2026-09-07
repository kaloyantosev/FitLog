'use client';

import React from 'react';
import { X, Play, ShieldAlert, CheckCircle2, Dumbbell, ExternalLink, Sparkles } from 'lucide-react';
import { ExerciseItem } from '@/types';

interface ExerciseWithDetails extends ExerciseItem {
  videoUrl?: string | null;
  setupInstructions?: string | null;
  executionInstructions?: string | null;
  targetMuscles?: string | null;
  commonMistakes?: string | null;
}

interface ExerciseVideoModalProps {
  exercise: ExerciseWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExerciseVideoModal({ exercise, isOpen, onClose }: ExerciseVideoModalProps) {
  if (!isOpen || !exercise) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-2xl bg-surface-1 border border-border rounded-3xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/60 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-surface-2 border border-border text-text-secondary uppercase font-mono">
                {exercise.category}
              </span>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase font-mono">
                {exercise.equipment}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {exercise.nameBg || exercise.name}
            </h2>
            {exercise.targetMuscles && (
              <p className="text-xs text-text-muted mt-0.5">
                Основна мускулна група: <strong className="text-text-secondary">{exercise.targetMuscles}</strong>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-surface-2 text-text-muted hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative w-full aspect-video rounded-2xl bg-black border border-border overflow-hidden shadow-lg">
          {exercise.videoUrl ? (
            <iframe
              src={exercise.videoUrl}
              title={exercise.nameBg || exercise.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-surface-2">
              <Dumbbell className="w-12 h-12 text-text-muted mb-2 animate-pulse" />
              <span className="text-sm font-semibold text-white">Видео демонстрация за правилна техника</span>
              <span className="text-xs text-text-muted mt-1">HD видео за изпълнение: {exercise.nameBg || exercise.name}</span>
            </div>
          )}
        </div>

        {/* Form Instructions & Breakdown */}
        <div className="space-y-3 text-xs">
          {/* Setup */}
          {exercise.setupInstructions && (
            <div className="p-3.5 rounded-2xl bg-surface-2/70 border border-border/80 space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                1. Начална позиция и стойка
              </div>
              <p className="text-text-secondary leading-relaxed pl-5">
                {exercise.setupInstructions}
              </p>
            </div>
          )}

          {/* Execution */}
          {exercise.executionInstructions && (
            <div className="p-3.5 rounded-2xl bg-surface-2/70 border border-border/80 space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                2. Техника на изпълнение и темпо
              </div>
              <p className="text-text-secondary leading-relaxed pl-5">
                {exercise.executionInstructions}
              </p>
            </div>
          )}

          {/* Common Mistakes */}
          {exercise.commonMistakes && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-1">
              <div className="font-semibold text-red-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                Често допускани грешки, които да избягвате
              </div>
              <p className="text-red-200/80 leading-relaxed pl-5">
                {exercise.commonMistakes}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-border/60">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 shadow-md transition-all active:scale-95"
          >
            Затвори ръководството
          </button>
        </div>

      </div>
    </div>
  );
}
