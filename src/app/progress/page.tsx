'use client';

import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  TrendingDown, 
  Plus, 
  CheckCircle2, 
  Calendar, 
  Sparkles, 
  Target, 
  X, 
  ChevronRight,
  Activity,
  Ruler,
  Brain,
  Zap,
  Moon,
  Flame,
  Droplets,
  Award,
  Bot,
  Dumbbell
} from 'lucide-react';
import { CheckinEntry, UserProfile } from '@/types';

export default function ProgressPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [checkins, setCheckins] = useState<CheckinEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [checkinForm, setCheckinForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weightKg: '',
    chestCm: '',
    waistCm: '',
    hipsCm: '',
    armsCm: '',
    thighsCm: '',
    bodyFatPct: '',
    energyRating: 4,
    stressRating: 2,
    sleepRating: 4,
    hungerRating: 3,
    digestionRating: 4,
    trainingDifficultyRating: 3,
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, checkRes] = await Promise.all([
        fetch('/api/user').then((r) => r.json()),
        fetch('/api/checkins').then((r) => r.json()),
      ]);

      if (userRes && !userRes.error) {
        setUser(userRes);
        setCheckinForm((prev) => ({ ...prev, weightKg: userRes.currentWeight?.toString() || '79.0' }));
      }

      if (Array.isArray(checkRes)) {
        setCheckins(checkRes);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkinForm.weightKg) return;

    try {
      await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkinForm),
      });

      setIsCheckinModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // SVG Chart Computations
  const sortedCheckins = [...checkins].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const weights = sortedCheckins.map((c) => c.weightKg);
  const minWeight = weights.length > 0 ? Math.floor(Math.min(...weights) - 1) : 70;
  const maxWeight = weights.length > 0 ? Math.ceil(Math.max(...weights) + 1) : 85;

  const chartWidth = 700;
  const chartHeight = 220;
  const padding = 35;

  const getX = (index: number) => {
    if (sortedCheckins.length <= 1) return chartWidth / 2;
    return padding + (index / (sortedCheckins.length - 1)) * (chartWidth - padding * 2);
  };

  const getY = (w: number) => {
    const range = maxWeight - minWeight || 1;
    return chartHeight - padding - ((w - minWeight) / range) * (chartHeight - padding * 2);
  };

  const pointsString = sortedCheckins
    .map((c, i) => `${getX(i)},${getY(c.weightKg)}`)
    .join(' ');

  const currentWeight = user?.currentWeight || (checkins.length > 0 ? checkins[checkins.length - 1].weightKg : 80.0);
  const targetWeight = user?.targetWeight || 75.0;
  const startWeight = checkins.length > 0 ? checkins[0].weightKg : currentWeight;
  const totalLost = (startWeight - currentWeight).toFixed(1);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          <span className="text-text-muted text-sm font-medium">Зареждане на прогреса...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-2 border border-border text-text-secondary uppercase tracking-wider">
              Биометричен анализ и AI чек-ин
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Прогрес и Седмични Отчети</h1>
          <p className="text-sm text-text-muted mt-1">
            Проследявайте промяната в теглото, мерките и биофийдбека с персонализиран AI треньорски фийдбек.
          </p>
        </div>

        <button
          onClick={() => setIsCheckinModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs sm:text-sm hover:bg-neutral-200 transition-all shadow-md active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Попълни Седмичен Чек-ин
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-surface-1 border border-border space-y-2">
          <span className="text-xs font-medium text-text-muted">Текущо Тегло</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">{currentWeight}</span>
            <span className="text-xs text-text-muted font-mono">кг</span>
          </div>
          <div className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>{parseFloat(totalLost) >= 0 ? `-${totalLost} кг общо` : `+${Math.abs(parseFloat(totalLost))} кг общо`}</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-surface-1 border border-border space-y-2">
          <span className="text-xs font-medium text-text-muted">Целево Тегло</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-blue-400">{targetWeight}</span>
            <span className="text-xs text-text-muted font-mono">кг</span>
          </div>
          <div className="text-xs text-text-muted font-mono">
            Остават: <strong className="text-white">{Math.abs(currentWeight - targetWeight).toFixed(1)} кг</strong>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-surface-1 border border-border space-y-2">
          <span className="text-xs font-medium text-text-muted">Общо Седмични Отчети</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">{checkins.length}</span>
            <span className="text-xs text-text-muted">подадени</span>
          </div>
          <div className="text-xs text-text-muted">
            Последен: {checkins.length > 0 ? checkins[checkins.length - 1].date : 'Няма'}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-surface-1 border border-border space-y-2">
          <span className="text-xs font-medium text-text-muted">AI Треньорски Статус</span>
          <div className="flex items-center gap-2 pt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-sm font-bold text-emerald-400">Активно Оптимизиране</span>
          </div>
          <div className="text-xs text-text-muted">
            Автоматично адаптиране на работните тежести
          </div>
        </div>
      </div>

      {/* Interactive Weight Chart */}
      <div className="p-6 rounded-3xl bg-surface-1 border border-border space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Траектория на Теглото (кг)</h3>
          </div>
          <span className="text-xs font-mono text-text-muted">Цел: {targetWeight} кг</span>
        </div>

        {checkins.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-muted">
            Няма въведени данни за графиката. Попълнете първия си седмичен отчет.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-56">
              {/* Target weight dotted line */}
              <line
                x1={padding}
                y1={getY(targetWeight)}
                x2={chartWidth - padding}
                y2={getY(targetWeight)}
                stroke="#3b82f6"
                strokeDasharray="4 4"
                strokeWidth="1.5"
                opacity="0.4"
              />
              <text
                x={chartWidth - padding}
                y={getY(targetWeight) - 6}
                fill="#60a5fa"
                fontSize="10"
                textAnchor="end"
                fontFamily="monospace"
              >
                Цел: {targetWeight} кг
              </text>

              {/* Trajectory Polyline */}
              {sortedCheckins.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={pointsString}
                />
              )}

              {/* Data circles */}
              {sortedCheckins.map((c, i) => {
                const cx = getX(i);
                const cy = getY(c.weightKg);
                return (
                  <g key={c.id || i} className="group">
                    <circle cx={cx} cy={cy} r="5" fill="#ffffff" stroke="#000000" strokeWidth="2" />
                    <text
                      x={cx}
                      y={cy - 12}
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {c.weightKg} кг
                    </text>
                    <text
                      x={cx}
                      y={chartHeight - 8}
                      fill="#888888"
                      fontSize="9"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {c.date.slice(5)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>

      {/* Check-ins Timeline with AI Feedback */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-400" />
          История на отчетите и AI треньорски анализи
        </h2>

        {checkins.length === 0 ? (
          <div className="p-8 rounded-3xl bg-surface-1 border border-border text-center text-text-muted text-xs">
            Все още нямате попълнени чек-ини. Натиснете бутона &quot;Попълни Седмичен Чек-ин&quot; в горния десен ъгъл.
          </div>
        ) : (
          <div className="space-y-4">
            {[...checkins].reverse().map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-surface-1 border border-border/80 space-y-4 hover:border-border transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs font-mono">
                      {item.weightKg} кг
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Седмичен Чек-ин: {item.date}</h4>
                      <span className="text-[11px] text-text-muted">
                        Талия: {item.waistCm ? `${item.waistCm} см` : 'Н/А'} • Гърди: {item.chestCm ? `${item.chestCm} см` : 'Н/А'}
                      </span>
                    </div>
                  </div>

                  {/* Biofeedback mini pills */}
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-surface-2 text-text-muted">
                      Енергия: <strong className="text-white">{item.energyRating}/5</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-surface-2 text-text-muted">
                      Сън: <strong className="text-white">{item.sleepRating}/5</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-surface-2 text-text-muted">
                      Стрес: <strong className="text-white">{item.stressRating}/5</strong>
                    </span>
                  </div>
                </div>

                {/* AI Feedback Banner */}
                {item.aiFeedback && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/30 via-surface-2 to-surface-2 border border-blue-500/30 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                      <Sparkles className="w-4 h-4" />
                      <span>AI Персонален Треньор – Анализ & Насоки</span>
                    </div>
                    <div className="text-xs text-neutral-200 leading-relaxed whitespace-pre-line font-normal">
                      {item.aiFeedback?.replace(/\*+/g, '')}
                    </div>
                  </div>
                )}

                {item.notes && (
                  <div className="text-xs text-text-muted italic border-l-2 border-border pl-3">
                    &quot;{item.notes}&quot;
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Check-in Modal */}
      {isCheckinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-surface-1 border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-400" />
                  Седмичен чек-ин и биометричен отчет
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Въведете вашите мерки и скали за възстановяване. AI треньорът ще генерира детайлен анализ и ще коригира тежестите при необходимост.
                </p>
              </div>
              <button onClick={() => setIsCheckinModalOpen(false)} className="text-text-muted hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCheckin} className="space-y-6">
              {/* Core Weight & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Дата на отчета</label>
                  <input
                    type="date"
                    required
                    value={checkinForm.date}
                    onChange={(e) => setCheckinForm({ ...checkinForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Текущо тегло сутрин (кг) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="79.5"
                    value={checkinForm.weightKg}
                    onChange={(e) => setCheckinForm({ ...checkinForm, weightKg: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-white text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Body Measurements */}
              <div className="p-4 rounded-2xl bg-surface-2/60 border border-border space-y-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-blue-400" />
                  Телесни Мерки (см) – Опционални
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-text-muted mb-1">Талия (см)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="84"
                      value={checkinForm.waistCm}
                      onChange={(e) => setCheckinForm({ ...checkinForm, waistCm: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-surface-3 border border-border text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-text-muted mb-1">Гръдна обиколка</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="104"
                      value={checkinForm.chestCm}
                      onChange={(e) => setCheckinForm({ ...checkinForm, chestCm: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-surface-3 border border-border text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-text-muted mb-1">Ръка (см)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="38"
                      value={checkinForm.armsCm}
                      onChange={(e) => setCheckinForm({ ...checkinForm, armsCm: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-surface-3 border border-border text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-text-muted mb-1">Бедро (см)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="58"
                      value={checkinForm.thighsCm}
                      onChange={(e) => setCheckinForm({ ...checkinForm, thighsCm: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-surface-3 border border-border text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* NEW: 1-5 Training Difficulty Scale with dynamic weight progression */}
              <div className="p-4 rounded-2xl bg-surface-2/60 border border-blue-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Dumbbell className="w-4 h-4 text-blue-400" />
                    Как усетихте трудността на тренировките през седмицата? (Скала 1-5)
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-400">{checkinForm.trainingDifficultyRating}/5</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {[
                    { val: 1, label: '1. Прекалено лесно', desc: 'Изобщо не се изпотих (+тежест)' },
                    { val: 2, label: '2. Леко', desc: 'Има голям запас (+тежест)' },
                    { val: 3, label: '3. Балансирано', desc: 'Перфектна работна зона' },
                    { val: 4, label: '4. Тежко', desc: 'Висока интензивност' },
                    { val: 5, label: '5. Прекалено тежко', desc: 'Близо до отказ и умора' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setCheckinForm({ ...checkinForm, trainingDifficultyRating: opt.val })}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        checkinForm.trainingDifficultyRating === opt.val
                          ? 'bg-blue-500 text-black border-blue-400 font-bold shadow-md'
                          : 'bg-surface-3/60 hover:bg-surface-3 border-border text-neutral-300'
                      }`}
                    >
                      <span className="text-xs font-bold">{opt.label}</span>
                      <span className={`text-[10px] mt-1 line-clamp-2 ${checkinForm.trainingDifficultyRating === opt.val ? 'text-neutral-900' : 'text-text-muted'}`}>
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Biofeedback 1-5 Scales */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Биофийдбек и Възстановяване (Скала 1-5)
                </span>

                {/* Energy */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Ниво на Енергия през деня
                    </span>
                    <span className="font-mono font-bold text-white">{checkinForm.energyRating} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={checkinForm.energyRating}
                    onChange={(e) => setCheckinForm({ ...checkinForm, energyRating: parseInt(e.target.value) })}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-text-muted font-mono">
                    <span>1 (Пълно изтощение)</span>
                    <span>3 (Нормално)</span>
                    <span>5 (Максимална сила)</span>
                  </div>
                </div>

                {/* Stress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      Ниво на стрес и напрежение
                    </span>
                    <span className="font-mono font-bold text-white">{checkinForm.stressRating} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={checkinForm.stressRating}
                    onChange={(e) => setCheckinForm({ ...checkinForm, stressRating: parseInt(e.target.value) })}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-text-muted font-mono">
                    <span>1 (Пълен покой)</span>
                    <span>3 (Умерено)</span>
                    <span>5 (Критичен стрес)</span>
                  </div>
                </div>

                {/* Sleep */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted flex items-center gap-1">
                      <Moon className="w-3.5 h-3.5 text-purple-400" />
                      Качество на съня и възстановяване
                    </span>
                    <span className="font-mono font-bold text-white">{checkinForm.sleepRating} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={checkinForm.sleepRating}
                    onChange={(e) => setCheckinForm({ ...checkinForm, sleepRating: parseInt(e.target.value) })}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-text-muted font-mono">
                    <span>1 (Безсъние / накъсан)</span>
                    <span>3 (Добър)</span>
                    <span>5 (Дълбок 8+ часа)</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">
                  Лични бележки за треньора / Как се чувствате?
                </label>
                <textarea
                  rows={3}
                  placeholder="напр. Чувствам се зареден, тренировките бяха лесни за изпълнение..."
                  value={checkinForm.notes}
                  onChange={(e) => setCheckinForm({ ...checkinForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-white text-xs focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCheckinModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-surface-2 hover:bg-surface-3 text-xs font-semibold text-text-muted hover:text-white transition-all"
                >
                  Отказ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-all shadow-md active:scale-95"
                >
                  Изпрати Чек-ин за AI Анализ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
