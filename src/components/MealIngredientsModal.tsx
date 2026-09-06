'use client';

import React from 'react';
import { X, Clock, Flame, Utensils, Check, Sparkles } from 'lucide-react';
import { MealOption } from '@/types';

interface MealIngredientsModalProps {
  meal: MealOption | null;
  isOpen: boolean;
  onClose: () => void;
  onLogMeal?: (meal: MealOption) => void;
}

export default function MealIngredientsModal({
  meal,
  isOpen,
  onClose,
  onLogMeal,
}: MealIngredientsModalProps) {
  if (!isOpen || !meal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-2xl bg-surface-1 border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header with Photo Banner */}
        <div className="relative h-48 sm:h-56 w-full bg-surface-2 overflow-hidden flex-shrink-0">
          <img
            src={meal.photoUrl}
            alt={meal.nameBg || meal.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-1 via-surface-1/40 to-black/50" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/80 text-white backdrop-blur-sm">
                Одобрена хранителна рецепта
              </span>
              <span className="text-[10px] font-mono text-white/90 flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
                <Clock className="w-3 h-3 text-emerald-400" />
                ~{meal.prepTimeMinutes} мин приготвяне
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              {meal.nameBg || meal.name}
            </h2>
            {meal.name && (
              <p className="text-xs text-text-secondary font-medium">
                {meal.name}
              </p>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Macro Pills Header */}
          <div className="grid grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-surface-2 border border-border font-mono text-center">
            <div>
              <div className="text-[10px] text-orange-400 uppercase font-semibold">Калории</div>
              <div className="text-base sm:text-lg font-bold text-white mt-0.5">{meal.calories} ккал</div>
            </div>
            <div>
              <div className="text-[10px] text-blue-400 uppercase font-semibold">Протеин</div>
              <div className="text-base sm:text-lg font-bold text-white mt-0.5">{meal.protein} г</div>
            </div>
            <div>
              <div className="text-[10px] text-amber-400 uppercase font-semibold">Въглехидрати</div>
              <div className="text-base sm:text-lg font-bold text-white mt-0.5">{meal.carbs} г</div>
            </div>
            <div>
              <div className="text-[10px] text-emerald-400 uppercase font-semibold">Мазнини</div>
              <div className="text-base sm:text-lg font-bold text-white mt-0.5">{meal.fats} г</div>
            </div>
          </div>

          {/* Description */}
          {meal.description && (
            <p className="text-xs text-text-secondary leading-relaxed italic bg-surface-2/60 p-3 rounded-2xl border border-border/60">
              &quot;{meal.description}&quot;
            </p>
          )}

          {/* Ingredients Breakdown Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-emerald-400" />
                Точни съставки & грамажи на рецептата
              </h3>
              <span className="text-[11px] font-mono text-text-muted">
                {meal.ingredients?.length || 0} съставки
              </span>
            </div>

            <div className="rounded-2xl border border-border overflow-hidden">
              <div className="grid grid-cols-12 gap-2 bg-surface-2 p-2.5 text-[10px] font-mono uppercase text-text-muted font-bold tracking-wider">
                <div className="col-span-5">Съставка</div>
                <div className="col-span-3 text-center">Грамаж</div>
                <div className="col-span-2 text-center">Енергия</div>
                <div className="col-span-2 text-right">P / C / F</div>
              </div>

              <div className="divide-y divide-border/60 bg-surface-1 text-xs">
                {meal.ingredients?.map((ing, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-surface-2/40 transition-colors">
                    <div className="col-span-5 font-medium text-white">
                      {ing.nameBg || ing.name}
                    </div>
                    <div className="col-span-3 text-center font-mono text-neutral-300">
                      {ing.amountGrams} г
                    </div>
                    <div className="col-span-2 text-center font-mono text-orange-400 font-bold">
                      {ing.calories} ккал
                    </div>
                    <div className="col-span-2 text-right font-mono text-[11px] text-text-muted">
                      {ing.protein} / {ing.carbs} / {ing.fats}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-2 border-t border-border flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-3 text-text-muted hover:text-white text-xs font-semibold"
          >
            Затвори
          </button>

          {onLogMeal && (
            <button
              onClick={() => {
                onLogMeal(meal);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all shadow-md active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Запиши в дневника</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
