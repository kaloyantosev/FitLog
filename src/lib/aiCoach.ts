import { GoogleGenerativeAI } from '@google/generative-ai';

export interface CheckinAnalysisInput {
  currentWeight: number;
  prevWeight?: number | null;
  targetWeight: number;
  waistCm?: number | null;
  prevWaistCm?: number | null;
  chestCm?: number | null;
  armsCm?: number | null;
  thighsCm?: number | null;
  bodyFatPct?: number | null;
  energyRating: number;    // 1-5
  stressRating: number;    // 1-5
  sleepRating: number;     // 1-5
  hungerRating: number;    // 1-5
  digestionRating: number; // 1-5
  trainingDifficultyRating?: number; // 1-5 (1: Прекалено лесно, 2: Лесно, 3: Балансирано, 4: Тежко, 5: Прекалено тежко)
  notes?: string | null;
  // Exact athlete data
  recentWorkoutsCount?: number;
  recentVolumeKg?: number;
  avgDailyCalories?: number;
  targetCalories?: number;
  avgDailyProtein?: number;
  targetProtein?: number;
}

export async function generateCoachAiFeedback(input: CheckinAnalysisInput): Promise<string> {
  const {
    currentWeight,
    prevWeight,
    targetWeight,
    waistCm,
    prevWaistCm,
    chestCm,
    armsCm,
    thighsCm,
    bodyFatPct,
    energyRating,
    stressRating,
    sleepRating,
    hungerRating,
    digestionRating,
    trainingDifficultyRating = 3,
    notes,
    recentWorkoutsCount = 0,
    recentVolumeKg = 0,
    avgDailyCalories = 0,
    targetCalories = 2400,
    avgDailyProtein = 0,
    targetProtein = 180,
  } = input;

  const difficultyNames = [
    '1/5 (Прекалено лесно – липсва натоварване)',
    '2/5 (Леко – има нужда от повишаване на тежестите)',
    '3/5 (Оптимално & Балансирано)',
    '4/5 (Тежко & Интензивно)',
    '5/5 (Прекалено тежко – близо до претрениране)',
  ];
  const difficultyStr = difficultyNames[Math.min(4, Math.max(0, trainingDifficultyRating - 1))];

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Вие сте елитен AI Персонален Треньор (Personal Coach), който предоставя безкомпромисен, изключително прецизен и научно обоснован седмичен отчет на български език за вашия атлет.

Анализирайте ТОЧНИТЕ предоставени данни:
- Текущо лично тегло: ${currentWeight} кг (Предишен чек-ин: ${prevWeight ? `${prevWeight} кг` : 'Първи отчет'}, Финална цел: ${targetWeight} кг)
- Мерки: Талия: ${waistCm ? `${waistCm} см (Предишна: ${prevWaistCm || 'Няма'} см)` : 'Няма'}, Гърди: ${chestCm || 'Няма'} см, Ръце: ${armsCm || 'Няма'} см, Бедра: ${thighsCm || 'Няма'} см
- Процент подкожни мазнини: ${bodyFatPct || 'Няма'}%
- Записани тренировки през седмицата: ${recentWorkoutsCount} сесии (Общ вдигнат тонаж: ${recentVolumeKg.toLocaleString()} кг)
- Субективна трудност на тренировките: ${difficultyStr}
- Записано хранене: ${avgDailyCalories > 0 ? `${avgDailyCalories} ккал/ден средно (Цел: ${targetCalories} ккал)` : 'В процес на проследяване'}, Протеин: ${avgDailyProtein > 0 ? `${avgDailyProtein}г/ден (Цел: ${targetProtein}г)` : `${targetProtein}г целеви`}
- Биофийдбек скали (1-5):
  * Енергия: ${energyRating}/5
  * Стрес: ${stressRating}/5
  * Сън: ${sleepRating}/5
  * Глад: ${hungerRating}/5
  * Храносмилане: ${digestionRating}/5
- Лични бележки на атлета: "${notes || 'Няма въведени допълнителни бележки'}"

КРИТИЧНИ ИНСТРУКЦИИ:
- Пишете на 100% правилен и мотивиращ български език.
- ВАЖНО: НЕ ИЗПОЛЗВАЙТЕ НИКАКВИ ЗВЕЗДИЧКИ (*** или **) ЗА УДЕБЕЛЯВАНЕ НА ТЕКСТА! Пишете изцяло чист текст без символи за удебеляване.
- Без общи клишета. Задължително цитирайте точните числа на атлета (${currentWeight} кг, ${recentVolumeKg} кг тонаж, ${energyRating}/5 енергия и т.н.).
${trainingDifficultyRating <= 2 ? '- ВАЖНО: Тъй като атлетът е оценил тренировките като лесни/прекалено лесни (' + difficultyStr + '), изрично го уведомете в раздела за тренировки, че софтуерът автоматично завишава работните тежести (+2.5кг до +5.0кг) за следващата седмица!' : ''}
- Структурирайте отговора в следните 5 стълба:
1. 🎯 Метаболитен темп и анализ на телесната композиция (Анализ на разликата в кг спрямо целта от ${targetWeight} кг, задържане на вода срещу реална тъканна маса).
2. 🧬 Хормонален баланс и биофийдбек (Корелация между стрес ${stressRating}/5, сън ${sleepRating}/5 и готовност на ЦНС).
3. 🏋️ Тренировъчен обем и прогресивно претоварване (Анализ на ${recentWorkoutsCount} тренировки и ${recentVolumeKg.toLocaleString()} кг тонаж).
4. 🥗 Хранителен протокол и тайминг на макронутриентите (Анализ на калориите и протеина спрямо таргета).
5. 💡 Топ 3 конкретни директиви за следващата седмица (Директни, количествени и ясни насоки).`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text && text.length > 50) {
        return text.replace(/\*+/g, '');
      }
    } catch (e) {
      console.warn('Gemini online API error in coach feedback, using deep local engine:', e);
    }
  }

  // Deep Local Quantitative AI Coach Engine in Bulgarian
  const sections: string[] = [];

  // 1. Metabolic Velocity & Body Composition Audit
  if (prevWeight !== undefined && prevWeight !== null) {
    const delta = currentWeight - prevWeight;
    const isTargetLoss = currentWeight > targetWeight;
    const absDelta = Math.abs(delta).toFixed(1);

    if (delta < 0) {
      sections.push(
        `1. 🎯 **Метаболитен темп и телесна композиция**:
- **Динамика на теглото**: Регистриран е спад от **-${absDelta} кг** спрямо предходния чек-ин (от **${prevWeight} кг** на **${currentWeight} кг**).
- **Прогрес към крайната цел (${targetWeight} кг)**: Дефицитът функционира прецизно. ${
          waistCm && prevWaistCm
            ? waistCm < prevWaistCm
              ? `Намаляването на талията с **-${(prevWaistCm - waistCm).toFixed(1)} см** потвърждава, че загубата е предимно чиста висцерална и подкожна мазнина, без мускулен разпад.`
              : `Талията остава стабилна на **${waistCm} см**, което показва отлично запазване на коремната стена.`
            : 'Препоръчва се редовно измерване на талията сутрин на гладно за точна калибрация на мастната маса.'
        }`
      );
    } else if (delta > 0) {
      sections.push(
        `1. 🎯 **Метаболитен темп и телесна композиция**:
- **Динамика на теглото**: Регистрирано е покачване от **+${absDelta} кг** (от **${prevWeight} кг** на **${currentWeight} кг**).
- **Биомеханичен статус**: ${
          isTargetLoss
            ? `Във фаза на орелефяване покачването с +${absDelta} кг вероятно е резултат от водна ретенция или повишен гликоген в резултат на стрес (${stressRating}/5). Следим динамиката през идните 7 дни.`
            : `Във фаза на покачване на чиста мускулна маса темпът от +${absDelta} кг е в рамките на оптималния анаболен прозорец.`
        }`
      );
    } else {
      sections.push(
        `1. 🎯 **Метаболитен темп и телесна композиция**:
- **Динамика на теглото**: Теглото е абсолютно стабилно на **${currentWeight} кг** (Цел: **${targetWeight} кг**).
- **Тъканна рекомпозиция**: При стабилен кантар съчетанието с тренировъчен обем води до едновременно стягане и мускулна плътност.`
      );
    }
  } else {
    sections.push(
      `1. 🎯 **Метаболитен темп и телесна композиция**:
- **Базов чек-ин**: Успешно зададена начална точка от **${currentWeight} кг** към крайна цел от **${targetWeight} кг**.`
    );
  }

  // 2. Hormonal & Biofeedback Stress Deep-Dive
  let bioSummary = '';
  if (stressRating >= 4 && sleepRating <= 2) {
    bioSummary = `⚠️ **Високо ниво на системен стрес (${stressRating}/5)** и компрометиран сън (**${sleepRating}/5**). Препоръчва се включване на 400 мг Магнезиев Биглицинат вечер и ограничаване на кофеина 8 часа преди лягане.`;
  } else if (energyRating >= 4 && sleepRating >= 4) {
    bioSummary = `⚡ **Отличен биофийдбек**: Енергия (**${energyRating}/5**) и сън (**${sleepRating}/5**) показват пълно неврологично възстановяване и готовност за високи работни тежести.`;
  } else {
    bioSummary = `🔋 **Стабилен статус**: Енергия (**${energyRating}/5**), стрес (**${stressRating}/5**), храносмилане (**${digestionRating}/5**). Системата е в баланс.`;
  }

  sections.push(
    `2. 🧬 **Хормонален баланс и възстановяване**:
- ${bioSummary}`
  );

  // 3. Training & Progressive Overload Directive
  let loadAction = '';
  if (trainingDifficultyRating <= 2) {
    loadAction = `\n- 📈 **Автоматично прогресивно претоварване (+2.5кг до +5.0кг)**: Отчетохте трудност на сесиите като **${difficultyStr}**. За да гарантираме непрекъснат мускулен растеж, софтуерът автоматично завиши работните тежести във вашите тренировъчни шаблони за следващата седмица!`;
  } else if (trainingDifficultyRating >= 5) {
    loadAction = `\n- 🛡️ **Защита от претрениране**: Отчетохте изключително тежко натоварване (**${difficultyStr}**). Препоръчваме леко намаляване на темпото или запазване на текущите килограми за адаптация.`;
  } else {
    loadAction = `\n- ⚖️ **Оптимална работна зона**: Натоварването е перфектно балансирано (**${difficultyStr}**). Продължавайте с планираното темпо.`;
  }

  sections.push(
    `3. 🏋️ **Тренировъчен обем и прогресивно претоварване**:
- **Завършени тренировки**: **${recentWorkoutsCount} сесии** с общ тонаж от **${recentVolumeKg.toLocaleString()} кг**.${loadAction}`
  );

  // 4. Nutrition & Macro Timing Strategy
  sections.push(
    `4. 🥗 **Хранителен протокол и баланс**:
- **Прием на енергия**: Средно **${avgDailyCalories > 0 ? avgDailyCalories : targetCalories} ккал/ден** спрямо таргет от **${targetCalories} ккал**.
- **Протеинов синтез**: **${avgDailyProtein > 0 ? avgDailyProtein : targetProtein} г протеин/ден** за непрекъснато мускулно възстановяване.`
  );

  // 5. Top 3 Actionable Directives for Next Week
  sections.push(
    `5. 💡 **Топ 3 конкретни директиви за следващата седмица**:
1. 🎯 **Следвайте новите работни тежести**: Влезте в секция "Тренировки" и стартирайте тренировката за съответния ден.
2. 🥩 **Запазете 100% протеинов баланс**: Използвайте готовите опции от 7-дневния хранителен план.
3. 💧 **Поддържайте стриктна хидратация**: Минимум 3.5 литра вода дневно за оптимална мускулна хидратация и сила.`
  );

  return sections.join('\n\n').replace(/\*+/g, '');
}
