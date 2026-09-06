import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendCrmEmail, PUSHY_WORKOUT_HEADLINES, CHECKIN_REMINDER_HEADLINES } from '@/lib/crmMailer';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const user = await prisma.user.findFirst();

    if (!user) {
      return NextResponse.json({ error: 'Няма намерен потребителски профил' }, { status: 404 });
    }

    const isForce = Boolean(body.force);
    const notificationType = body.type || 'WORKOUT_REMINDER'; // 'WORKOUT_REMINDER' | 'CHECKIN_REMINDER' | 'TEST'

    if (!isForce && user.emailNotificationsEnabled === false) {
      return NextResponse.json({
        skipped: true,
        reason: 'Имейл известията са изключени в настройките.',
      });
    }

    // Check training day logic if workout reminder
    if (notificationType === 'WORKOUT_REMINDER' && !isForce) {
      const now = new Date();
      const currentDayIdx = (now.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
      const trainingDays = user.trainingDaysPerWeek || 4;

      const scheduledDaysMap: Record<number, number[]> = {
        1: [0],
        2: [0, 2],
        3: [0, 2, 4],
        4: [0, 1, 3, 4],
        5: [0, 1, 2, 4, 5],
      };

      const activeDays = scheduledDaysMap[trainingDays] || [0, 1, 3, 4];
      const isTrainingDayToday = activeDays.includes(currentDayIdx);

      if (!isTrainingDayToday) {
        return NextResponse.json({
          skipped: true,
          reason: 'Днес е почивен ден (REST). Не се изисква напомняне за тренировка.',
          isRestDay: true,
        });
      }
    }

    // Pick headline
    let headline = '';
    let subject = '';

    if (notificationType === 'CHECKIN_REMINDER') {
      headline = CHECKIN_REMINDER_HEADLINES[Math.floor(Math.random() * CHECKIN_REMINDER_HEADLINES.length)];
      subject = '📋 Напомняне: Време е за твоя седмичен отчет в FitLog Personal Coach';
    } else if (notificationType === 'TEST') {
      headline = '⚡ Тестово мотивационно известие: Системата работи безупречно!';
      subject = '⚡ Тест на имейл известията • FitLog Personal Coach';
    } else {
      headline = PUSHY_WORKOUT_HEADLINES[Math.floor(Math.random() * PUSHY_WORKOUT_HEADLINES.length)];
      subject = headline; // Pushy headline directly as subject
    }

    // Dispatch via CRM Mailer
    const crmResult = await sendCrmEmail(
      {
        to: user.email,
        subject,
        headline,
        type: notificationType,
        athleteName: user.name || 'Athlete',
        scheduledTime: user.preferredTrainingHour || '18:00',
      },
      {
        provider: body.provider || 'BREVO',
        apiKey: body.apiKey,
        senderEmail: body.senderEmail,
      }
    );

    return NextResponse.json({
      success: crmResult.success,
      message: crmResult.message,
      headline,
      sentTo: user.email,
      sentAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error dispatching notification:', error);
    return NextResponse.json({ error: 'Грешка при изпращане на известието' }, { status: 500 });
  }
}

export async function GET() {
  const user = await prisma.user.findFirst();
  return NextResponse.json({
    emailNotificationsEnabled: user?.emailNotificationsEnabled ?? true,
    preferredTrainingHour: user?.preferredTrainingHour ?? '18:00',
    recipientEmail: user?.email ?? 'athlete@personalcoach.local',
  });
}
