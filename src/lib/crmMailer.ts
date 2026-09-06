export interface EmailPayload {
  to: string;
  subject: string;
  headline: string;
  type: 'WORKOUT_REMINDER' | 'CHECKIN_REMINDER' | 'TEST';
  athleteName?: string;
  scheduledTime?: string;
}

export interface CrmConfig {
  provider: 'BREVO' | 'RESEND' | 'SMTP_SIMULATION';
  apiKey?: string;
  senderEmail?: string;
  senderName?: string;
}

/**
 * Hardcore motivational pushy headlines for training reminders (Bulgarian)
 */
export const PUSHY_WORKOUT_HEADLINES = [
  'Време е за зала. Остави оправданията вкъщи.',
  'Желязото те чака. Дисциплината изгражда шампиони.',
  'Тренировка днес = Резултати утре. Ставай и отивай!',
  'Болката от тренировка е нищо в сравнение със съжалението. Нападай!',
  'Не мисли, просто отиди и вдигай. Твоето бъдещо тяло те чака.',
  'Без извинения днес. Тренировката е твоят дълг към целта.',
  'Най-трудната част е да прекрачиш прага на залата. Направи го сега!',
];

/**
 * Weekly check-in reminder headlines (Bulgarian)
 */
export const CHECKIN_REMINDER_HEADLINES = [
  'Време е за седмичния ти отчет. Измери прогреса си!',
  'Седмичен анализ: AI треньорът очаква твоите мерки и фийдбек.',
  'Не пропускай седмичния отчет. Всяка промяна има значение за плана ти.',
];

import nodemailer from 'nodemailer';

/**
 * Sends email via Brevo SMTP Relay (smtp-relay.brevo.com:587)
 */
async function sendViaBrevoSmtp(payload: EmailPayload, smtpKey: string, senderEmail: string, senderName: string) {
  const user = process.env.BREVO_SMTP_USER || senderEmail || 'kaloyan.tosev@gmail.com';
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // TLS
    auth: {
      user: user,
      pass: smtpKey,
    },
  });

  const info = await transporter.sendMail({
    from: `"${senderName || 'FitLog Personal Coach'}" <${senderEmail || user}>`,
    to: payload.to,
    subject: payload.subject,
    html: generateEmailHtml(payload),
  });

  return info;
}

/**
 * Sends email via Brevo HTTP API (Sendinblue free tier - 300 emails/day)
 */
async function sendViaBrevo(payload: EmailPayload, apiKey: string, senderEmail: string, senderName: string) {
  // If key starts with xsmtpsib, try SMTP first
  if (apiKey.startsWith('xsmtpsib-')) {
    try {
      return await sendViaBrevoSmtp(payload, apiKey, senderEmail, senderName);
    } catch (smtpErr) {
      console.warn('Brevo SMTP relay attempt error, trying HTTP API:', smtpErr);
    }
  }

  const url = 'https://api.brevo.com/v3/smtp/email';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: senderName || 'FitLog Personal Coach', email: senderEmail || 'kaloyan.tosev@gmail.com' },
      to: [{ email: payload.to, name: payload.athleteName || 'Athlete' }],
      subject: payload.subject,
      htmlContent: generateEmailHtml(payload),
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    // If HTTP API fails and wasn't attempted with SMTP yet, attempt SMTP
    if (!apiKey.startsWith('xsmtpsib-')) {
      try {
        return await sendViaBrevoSmtp(payload, apiKey, senderEmail, senderName);
      } catch (smtpErr) {
        throw new Error(`Brevo Error: HTTP (${response.status}: ${err}) & SMTP failed`);
      }
    }
    throw new Error(`Brevo API Error (${response.status}): ${err}`);
  }
  return await response.json();
}

/**
 * Sends email via Resend (Free tier - 100 emails/day)
 */
async function sendViaResend(payload: EmailPayload, apiKey: string, senderEmail: string, senderName: string) {
  const url = 'https://api.resend.com/emails';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${senderName || 'FitLog Personal Coach'} <${senderEmail || 'onboarding@resend.dev'}>`,
      to: [payload.to],
      subject: payload.subject,
      html: generateEmailHtml(payload),
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Resend API Error (${response.status}): ${err}`);
  }
  return await response.json();
}

/**
 * Generates dark luxury HTML email template
 */
function generateEmailHtml(payload: EmailPayload): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0c10; color: #ffffff; margin: 0; padding: 20px; }
        .card { max-width: 520px; margin: 0 auto; background-color: #12141c; border: 1px solid #232738; border-radius: 16px; padding: 32px; text-align: center; }
        .logo { font-size: 13px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #3b82f6; margin-bottom: 24px; font-family: monospace; }
        .headline { font-size: 22px; font-weight: 800; color: #ffffff; line-height: 1.3; margin: 0 0 16px 0; }
        .sub { font-size: 14px; color: #94a3b8; line-height: 1.5; margin-bottom: 28px; }
        .btn { display: inline-block; background-color: #ffffff; color: #000000; font-weight: 700; font-size: 13px; text-decoration: none; padding: 12px 28px; border-radius: 10px; }
        .footer { margin-top: 32px; font-size: 11px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">⚡ FITLOG PERSONAL COACH</div>
        <h1 class="headline">${payload.headline}</h1>
        <p class="sub">
          ${payload.type === 'WORKOUT_REMINDER' 
            ? 'Твоята тренировка е насрочена за днес. Отвори FitLog за упражненията, сериите и видео демонстрациите.' 
            : payload.type === 'CHECKIN_REMINDER'
            ? 'Твоят FitLog AI треньор очаква седмичния ти отчет, за да оптимизира хранителния и тренировъчния ти план.'
            : 'Това е тестово известие от твоята система FitLog Personal Coach.'}
        </p>
        <a href="http://localhost:3000" class="btn">Отвори FitLog</a>
        <div class="footer">
          FitLog Personal Coach • Автоматично мотивационно напомняне
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Unified dispatch function
 */
export async function sendCrmEmail(payload: EmailPayload, config?: CrmConfig): Promise<{ success: boolean; message: string; data?: any }> {
  const provider = config?.provider || (process.env.BREVO_API_KEY ? 'BREVO' : process.env.RESEND_API_KEY ? 'RESEND' : 'SMTP_SIMULATION');
  const apiKey = config?.apiKey || (provider === 'BREVO' ? process.env.BREVO_API_KEY : process.env.RESEND_API_KEY);
  const senderEmail = config?.senderEmail || process.env.SENDER_EMAIL || 'coach@personalcoach.bg';
  const senderName = config?.senderName || 'FitLog Personal Coach';

  if (provider === 'BREVO' && apiKey) {
    try {
      const data = await sendViaBrevo(payload, apiKey, senderEmail, senderName);
      return { success: true, message: 'Имейлът беше успешно изпратен чрез Brevo CRM!', data };
    } catch (err: any) {
      console.error('Brevo send error:', err);
      return { success: false, message: err.message };
    }
  }

  if (provider === 'RESEND' && apiKey) {
    try {
      const data = await sendViaResend(payload, apiKey, senderEmail, senderName);
      return { success: true, message: 'Имейлът беше успешно изпратен чрез Resend CRM!', data };
    } catch (err: any) {
      console.error('Resend send error:', err);
      return { success: false, message: err.message };
    }
  }

  // Fallback Simulation / Local Logging
  console.log(`[CRM EMAIL SIMULATION] To: ${payload.to} | Subject: ${payload.subject} | Headline: ${payload.headline}`);
  return {
    success: true,
    message: `Симулирано изпращане към ${payload.to}. За реално изпращане въведете безплатен Brevo или Resend API ключ в настройките.`,
  };
}
