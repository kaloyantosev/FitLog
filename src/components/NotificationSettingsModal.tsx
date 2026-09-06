'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  Mail, 
  Clock, 
  Check, 
  X, 
  Flame, 
  Send, 
  AlertCircle,
  Sparkles,
  Shield,
  Calendar
} from 'lucide-react';
import { UserProfile } from '@/types';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUserUpdated: (user: UserProfile) => void;
}

export default function NotificationSettingsModal({
  isOpen,
  onClose,
  user,
  onUserUpdated,
}: NotificationSettingsModalProps) {
  const [enabled, setEnabled] = useState<boolean>(user?.emailNotificationsEnabled ?? true);
  const [trainingHour, setTrainingHour] = useState<string>(user?.preferredTrainingHour || '18:00');
  const [checkinDay, setCheckinDay] = useState<string>('SUNDAY');
  const [checkinHour, setCheckinHour] = useState<string>('09:00');
  const [crmApiKey, setCrmApiKey] = useState<string>('');

  const [saving, setSaving] = useState(false);
  const [testingWorkout, setTestingWorkout] = useState(false);
  const [testingCheckin, setTestingCheckin] = useState(false);
  const [lastDispatched, setLastDispatched] = useState<{ subject: string; time: string; type: string } | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailNotificationsEnabled: enabled,
          preferredTrainingHour: trainingHour,
        }),
      });
      const updated = await res.json();
      if (updated && !updated.error) {
        onUserUpdated(updated);
        setStatusMsg('Настройките за известяване са запазени успешно!');
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (e) {
      console.error(e);
      setStatusMsg('Възникна грешка при запис на настройките.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestNotification = async (type: 'WORKOUT_REMINDER' | 'CHECKIN_REMINDER') => {
    if (type === 'WORKOUT_REMINDER') setTestingWorkout(true);
    else setTestingCheckin(true);

    setStatusMsg(null);
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true, type }),
      });
      const data = await res.json();
      if (data.success && data.notification) {
        setLastDispatched({
          subject: data.notification.subject,
          time: new Date().toLocaleTimeString(),
          type: type === 'WORKOUT_REMINDER' ? 'Тренировка' : 'Седмичен Чек-ин',
        });
        setStatusMsg(`Успешно изпратено мотивиращо заглавие към ${user?.email || 'вашия имейл'}!`);
      } else if (data.skipped) {
        setStatusMsg(data.reason || 'Известието е пропуснато.');
      }
    } catch (e) {
      console.error(e);
      setStatusMsg('Грешка при тестване на известието.');
    } finally {
      setTestingWorkout(false);
      setTestingCheckin(false);
    }
  };

  const hourOptions = [
    { value: '05:00', label: '05:00 (Ранна утринна тренировка)' },
    { value: '06:00', label: '06:00 (Преди работа / на гладно)' },
    { value: '07:00', label: '07:00 (Сутрешен старт)' },
    { value: '08:00', label: '08:00 (Сутрешен тонус)' },
    { value: '12:00', label: '12:00 (Обедна пауза)' },
    { value: '14:00', label: '14:00 (Следобеден фокус)' },
    { value: '16:00', label: '16:00 (Ранен следобед)' },
    { value: '17:00', label: '17:00 (След работа)' },
    { value: '18:00', label: '18:00 (Вечерен пиков час - Препоръчан)' },
    { value: '19:00', label: '19:00 (Вечерна сесия)' },
    { value: '20:00', label: '20:00 (Късна вечер)' },
    { value: '21:00', label: '21:00 (Нощна сесия)' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-surface-1 border border-border rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Настройки за Имейл Известяване & CRM</h3>
              <p className="text-xs text-text-muted">FitLog Personal Coach CRM за мотивиращи напомняния</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-text-muted hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMsg && (
          <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-300 text-xs font-medium animate-fadeIn">
            {statusMsg}
          </div>
        )}

        {/* Section 1: Workout Reminders */}
        <div className="p-4 rounded-2xl bg-surface-2/60 border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Напомняне за тренировка</span>
              </div>
              <p className="text-[11px] text-text-muted">
                Изпраща кратък имейл само с мотивиращо заглавие в дните за тренировка.
              </p>
            </div>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-5 h-5 accent-blue-500 cursor-pointer"
            />
          </div>

          {enabled && (
            <div className="pt-2 space-y-3 border-t border-border/40">
              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-1">
                  Приблизителен час на тренировката:
                </label>
                <select
                  value={trainingHour}
                  onChange={(e) => setTrainingHour(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-3 border border-border text-white text-xs font-mono"
                >
                  {hourOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between text-[11px] text-text-muted pt-1">
                <span>Имейл получател: <strong className="text-white font-mono">{user?.email || 'демо@coach.bg'}</strong></span>
                <button
                  type="button"
                  onClick={() => handleSendTestNotification('WORKOUT_REMINDER')}
                  disabled={testingWorkout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 text-xs font-semibold transition-colors"
                >
                  <Send className="w-3 h-3" />
                  <span>{testingWorkout ? 'Изпращане...' : 'Тествай имейл сега'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Weekly Check-in Reminders */}
        <div className="p-4 rounded-2xl bg-surface-2/60 border border-border space-y-4">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>Напомняне за Седмичен Чек-ин</span>
            </div>
            <p className="text-[11px] text-text-muted">
              Известява ви в определения ден и час да премерите мерките и кантара за AI анализ.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40">
            <div>
              <label className="block text-[11px] font-semibold text-text-muted mb-1">Ден от седмицата:</label>
              <select
                value={checkinDay}
                onChange={(e) => setCheckinDay(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-3 border border-border text-white text-xs"
              >
                <option value="SUNDAY">Неделя (Препоръчано)</option>
                <option value="MONDAY">Понеделник сутрин</option>
                <option value="SATURDAY">Събота сутрин</option>
                <option value="FRIDAY">Петък</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-muted mb-1">Час на напомняне:</label>
              <select
                value={checkinHour}
                onChange={(e) => setCheckinHour(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-3 border border-border text-white text-xs font-mono"
              >
                <option value="08:00">08:00 сутрин</option>
                <option value="09:00">09:00 сутрин</option>
                <option value="18:00">18:00 вечер</option>
                <option value="20:00">20:00 вечер</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => handleSendTestNotification('CHECKIN_REMINDER')}
              disabled={testingCheckin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 text-xs font-semibold transition-colors"
            >
              <Send className="w-3 h-3" />
              <span>{testingCheckin ? 'Изпращане...' : 'Тествай Чек-ин имейл'}</span>
            </button>
          </div>
        </div>

        {/* Section 3: Free CRM Provider Integration */}
        <div className="p-4 rounded-2xl bg-surface-2/40 border border-border/70 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-300">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Безплатна CRM Интеграция (Brevo / Resend / SMTP)</span>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Системата разполага с вграден безплатен CRM mailer с 300 безплатни имейла на ден през Brevo API или директен SMTP. Можете да добавите персонализиран API ключ или да използвате автоматичния режим.
          </p>
          <input
            type="password"
            placeholder="Въведете Brevo / Resend API ключ (Опционално)"
            value={crmApiKey}
            onChange={(e) => setCrmApiKey(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-surface-3 border border-border text-white text-xs font-mono placeholder:text-text-muted"
          />
        </div>

        {/* Last Dispatched Preview */}
        {lastDispatched && (
          <div className="p-3.5 rounded-xl bg-surface-2 border border-border text-xs space-y-1">
            <span className="text-text-muted block text-[10px] uppercase font-mono">
              Последно изпратено заглавие ({lastDispatched.time} • {lastDispatched.type}):
            </span>
            <div className="font-bold text-white bg-surface-3 p-2.5 rounded-lg border border-border/50">
              &quot;{lastDispatched.subject}&quot;
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-border/60">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-surface-2 text-xs font-semibold text-text-muted hover:text-white"
          >
            Затвори
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-200 shadow-md active:scale-95"
          >
            {saving ? 'Записване...' : 'Запази Настройките'}
          </button>
        </div>
      </div>
    </div>
  );
}
