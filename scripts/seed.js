const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing exercises and workout templates...');
  await prisma.loggedSet.deleteMany();
  await prisma.workoutLog.deleteMany();
  await prisma.templateExercise.deleteMany();
  await prisma.workoutTemplate.deleteMany();
  await prisma.exercise.deleteMany();

  console.log('Seeding exercise database with Bulgarian descriptions and verified video guides...');
  const exercisesData = [
    {
      id: 'ex-1',
      name: 'Избутване на щанга от хоризонтален лег (Лежанка)',
      category: 'CHEST',
      equipment: 'BARBELL',
      instructions: 'Приберете лопатките, спуснете до долната част на гърдите и избутайте с опора в краката.',
      videoUrl: 'https://www.youtube.com/embed/gRVjAtPip0Y',
      setupInstructions: 'Легнете на права лежанка с очи точно под лоста. Приберете лопатките плътно назад и надолу в пейката. Стъпете здраво с ходилата на пода.',
      executionInstructions: 'Откачете лоста със стабилни китки. Спуснете под контрол до леко докосване на долната част на гърдите. Избутайте лоста нагоре по лека парабола над раменете.',
      targetMuscles: 'Гръдни мускули (голям гръден мускул), Предно рамо, Трицепс',
      commonMistakes: 'Отскачане на лоста от гърдите, отваряне на лактите под 90 градуса, отлепяне на седалището от лежанката.',
    },
    {
      id: 'ex-2',
      name: 'Полулег с дъмбели (30° наклон)',
      category: 'CHEST',
      equipment: 'DUMBBELL',
      instructions: 'Фокус върху горната ключична част на гърдите, 2 секунди спускане под 45 градуса ъгъл на лактите.',
      videoUrl: 'https://www.youtube.com/embed/8iPEnn-ltC8',
      setupInstructions: 'Настройте пейката на около 30 градуса наклон. Вдигнете дъмбелите на нивото на раменете с прибрани лопатки и отворени гърди.',
      executionInstructions: 'Избутайте дъмбелите нагоре и леко навътре над горната част на гърдите без да се удрят един в друг. Спускайте плавно за дълбоко разтягане.',
      targetMuscles: 'Горна част на гърдите (ключична част), Предно рамо, Трицепс',
      commonMistakes: 'Твърде голям наклон на пейката (натоварва предното рамо вместо гърдите), прекомерно разтваряне на лактите.',
    },
    {
      id: 'ex-3',
      name: 'Кросоувър на долен скрипец за горни гърди',
      category: 'CHEST',
      equipment: 'CABLE',
      instructions: 'Съберете ръцете нагоре и навътре с 1 секунда задържане в пикова контракция.',
      videoUrl: 'https://www.youtube.com/embed/M1N804yWA-8',
      setupInstructions: 'Поставете скрипците в най-ниска позиция с единични ръкохватки. Застанете в стабилна разкрачна стойка с лек наклон напред.',
      executionInstructions: 'С леко сгънати лакти издърпайте ръкохватките нагоре и навътре по дъга до нивото на гърдите. Задръжте пиковата контракция за 1 секунда.',
      targetMuscles: 'Горна и вътрешна част на гръдните мускули',
      commonMistakes: 'Сгъване на движението в преса, използване на залюляване на тялото за вдигане на тежестта.',
    },
    {
      id: 'ex-4',
      name: 'Клек с щанга зад врат',
      category: 'LEGS',
      equipment: 'BARBELL',
      instructions: 'Стегнете коремната стена с коремно дишане, клекнете до паралел и избутайте с колене леко навън.',
      videoUrl: 'https://www.youtube.com/embed/bEv6CCg2BC8',
      setupInstructions: 'Поставете лоста стабилно върху горната част на трапеца или задните рамене. Стегнете хвата, направете 2-3 крачки назад с крака на ширината на раменете.',
      executionInstructions: 'Поемете дълбоко въздух в корема и стегнете торса. Сгънете едновременно таза и коленете. Спуснете под контрол до паралел или малко под него. Избутайте през средата на ходилото.',
      targetMuscles: 'Квадрицепси (четириглав бедрен мускул), Седалищни мускули, Аддуктори',
      commonMistakes: 'Събиране на коленете навътре при изправяне, отлепяне на петите от пода, прекомерно извиване на кръста.',
    },
    {
      id: 'ex-5',
      name: 'Румънска тяга с щанга (RDL)',
      category: 'LEGS',
      equipment: 'BARBELL',
      instructions: 'Движение от таза назад, неутрален прав гръб, силно разтягане на задните бедра.',
      videoUrl: 'https://www.youtube.com/embed/jEy_czb3RKA',
      setupInstructions: 'Хванете щангата на ширината на раменете с надхват. Застанете прави с леко отключени колене и стегнат горен гръб.',
      executionInstructions: 'Избутайте таза назад все едно докосвате стена зад вас. Плъзгайте лоста плътно по бедрата до под коленете, запазвайки гърба прав. Стегнете седалището за изправяне.',
      targetMuscles: 'Задно бедро (двуглав бедрен мускул), Седалищни мускули, Еректори (кръст)',
      commonMistakes: 'Клякане вместо движение от таза, прегърбване на кръста, отдалечаване на лоста от краката.',
    },
    {
      id: 'ex-6',
      name: 'Български клек с дъмбели',
      category: 'LEGS',
      equipment: 'DUMBBELL',
      instructions: 'Предният крак е плътно на пода, задното коляно слиза право надолу за максимално разтягане.',
      videoUrl: 'https://www.youtube.com/embed/2C-uNgKwPLE',
      setupInstructions: 'Застанете на около половин метър пред пейка. Поставете горната част на задния крак върху пейката. Дръжте дъмбелите стабилно отстрани.',
      executionInstructions: 'Спуснете тялото надолу чрез сгъване на предното коляно до паралел на предното бедро с пода. Избутайте мощно през петата на предния крак.',
      targetMuscles: 'Квадрицепси, Седалищни мускули, Задно бедро',
      commonMistakes: 'Твърде къса крачка с отлепяне на предната пета, прекомерен наклон назад.',
    },
    {
      id: 'ex-7',
      name: 'Повдигане на пръсти за прасци на машина',
      category: 'LEGS',
      equipment: 'MACHINE',
      instructions: 'Пълно разтягане в долна точка, 2 секунди задържане в горна крайна позиция.',
      videoUrl: 'https://www.youtube.com/embed/gwLzBJYoWlI',
      setupInstructions: 'Поставете възглавничките на стъпалата на ръба на платформата с пети свободни надолу. Подложките лежат стабилно на раменете.',
      executionInstructions: 'Спуснете петите бавно надолу за дълбоко разтягане на прасеца. Задръжте 1 секунда, след което мощно се повдигнете на пръсти и стегнете в пика.',
      targetMuscles: 'Прасци (гастрокнемиус и солеус)',
      commonMistakes: 'Подскачане без контролирано разтягане и без задържане в горна точка.',
    },
    {
      id: 'ex-8',
      name: 'Придърпване на горен скрипец (Неутрален хват)',
      category: 'BACK',
      equipment: 'CABLE',
      instructions: 'Спуснете раменете първо, придърпайте лактите надолу към таза и стегнете перките.',
      videoUrl: 'https://www.youtube.com/embed/CAwf7n6Luuc',
      setupInstructions: 'Настройте опората за бедрата да притиска плътно краката. Хванете ръкохватката с неутрален или леко широк хват.',
      executionInstructions: 'Приберете лопатките надолу и придърпайте лоста към горната част на гърдите, водейки с лактите надолу и назад. Контролирайте връщането нагоре.',
      targetMuscles: 'Широк гръбен мускул (перки), Голям объл мускул, Бицепс',
      commonMistakes: 'Прекомерно люлеене назад, дърпане изцяло с бицепсите вместо с гърба.',
    },
    {
      id: 'ex-9',
      name: 'Т-щанга с опора на гърдите на машина',
      category: 'BACK',
      equipment: 'MACHINE',
      instructions: 'Стегнете ромбоидите и средата на гърба в пикова контракция без движение в кръста.',
      videoUrl: 'https://www.youtube.com/embed/bFoyFQaEWWs',
      setupInstructions: 'Регулирайте опората така че горната част на гърдите да лежи плътно на възглавницата. Хванете ръкохватките стабилно.',
      executionInstructions: 'Приберете лопатките и придърпайте ръкохватките към долната част на ребрата. Задръжте пиковата контракция в гърба за 1 секунда и спуснете плавно.',
      targetMuscles: 'Ромбоидни мускули, Средна и долна част на трапеца, Широк гръбен мускул, Задно рамо',
      commonMistakes: 'Отлепяне на гърдите от опората и използване на инерция.',
    },
    {
      id: 'ex-10',
      name: 'Придърпване на долен скрипец (Гребане)',
      category: 'BACK',
      equipment: 'CABLE',
      instructions: 'Дръжте торса изправен, придърпайте V-ръкохватката към долната част на корема.',
      videoUrl: 'https://www.youtube.com/embed/GhPpnX6b1M8',
      setupInstructions: 'Седнете с крака на опорите, леко сгънати колене. Хванете триъгълната ръкохватка с изпънати ръце и прав гръб.',
      executionInstructions: 'Придърпайте ръкохватката към пъпа, държейки лактите близо до тялото и гърдите изправени. Бавно върнете напред с пълно разтягане на гърба.',
      targetMuscles: 'Широк гръбен мускул, Ромбоиди, Трапец, Бицепс',
      commonMistakes: 'Залюляване на тялото напред-назад, извиване на кръста при дърпане.',
    },
    {
      id: 'ex-11',
      name: 'Разтваряне на дъмбели встрани за средно рамо',
      category: 'SHOULDERS',
      equipment: 'DUMBBELL',
      instructions: 'Лек наклон напред, водете с лактите в скапуларната равнина за перфектна изолация.',
      videoUrl: 'https://www.youtube.com/embed/3VcKaXpzqRo',
      setupInstructions: 'Дръжте дъмбелите отстрани на бедрата с леко наклонен напред торс (10-15 градуса) и леко свити лакти.',
      executionInstructions: 'Повдигнете дъмбелите встрани до нивото на раменете, водейки с лактите. Спуснете контролирано за 2 секунди.',
      targetMuscles: 'Средно рамо (странична част на делтата)',
      commonMistakes: 'Люлеене с таза, вдигане на раменете към ушите с трапеца.',
    },
    {
      id: 'ex-12',
      name: 'Раменни преси с дъмбели от сед',
      category: 'SHOULDERS',
      equipment: 'DUMBBELL',
      instructions: 'Избутвайте дъмбелите нагоре над главата без да се удрят, контролирано спускане до ушите.',
      videoUrl: 'https://www.youtube.com/embed/qEwKCR5JCog',
      setupInstructions: 'Настройте пейката на 80-85 градуса наклон. Качете дъмбелите на раменете с длани сочещи напред.',
      executionInstructions: 'Избутайте тежестите право нагоре над главата до почти изпънати ръце. Спуснете бавно до нивото на ушите.',
      targetMuscles: 'Предно рамо, Средно рамо, Трицепс, Горен трапец',
      commonMistakes: 'Прекомерно извиване на кръста от пейката, пълно заключване и удряне на дъмбелите.',
    },
    {
      id: 'ex-13',
      name: 'Фейспул на скрипец с въже за задно рамо',
      category: 'SHOULDERS',
      equipment: 'CABLE',
      instructions: 'Дърпайте въжето към нивото на очите с външна ротация на раменете за здрава стойка.',
      videoUrl: 'https://www.youtube.com/embed/rep-qVOkqgk',
      setupInstructions: 'Поставете скрипеца на нивото на очите с въже. Хванете краищата с палци сочещи назад.',
      executionInstructions: 'Придърпайте въжето към носа/очите, като едновременно разтваряте ръцете навън с външна ротация. Стегнете задното рамо.',
      targetMuscles: 'Задно рамо, Ротаторен маншон, Ромбоиди',
      commonMistakes: 'Дърпане надолу към гърдите, отпускане на лактите надолу.',
    },
    {
      id: 'ex-14',
      name: 'Сгъване за бицепс с дъмбели от полулег',
      category: 'ARMS',
      equipment: 'DUMBBELL',
      instructions: 'Пълна супинация и максимално разтягане на дългата глава на бицепса в долна точка.',
      videoUrl: 'https://www.youtube.com/embed/soxrZlIl35U',
      setupInstructions: 'Седнете на наклонена пейка на 45-60 градуса с отпуснати надолу ръце и дъмбели в ръце.',
      executionInstructions: 'Сгънете дъмбелите нагоре като завъртате китките с длани към тавана (супинация). Спускайте бавно за 2-3 секунди.',
      targetMuscles: 'Бицепс (дълга и къса глава), Брахиалис',
      commonMistakes: 'Движение на лактите напред за включване на предното рамо.',
    },
    {
      id: 'ex-15',
      name: 'Трицепсово разгъване на горен скрипец с въже',
      category: 'ARMS',
      equipment: 'CABLE',
      instructions: 'Дръжте лактите неподвижни до ребрата, разтворете въжето в долната крайна точка.',
      videoUrl: 'https://www.youtube.com/embed/vB5OHsJ3EME',
      setupInstructions: 'Закрепете въже към горен скрипец. Застанете с лек наклон напред и лакти плътно до тялото.',
      executionInstructions: 'Разгънете ръцете надолу и разтворете двата края на въжето в крайната точка. Върнете бавно до 90 градуса в лактите.',
      targetMuscles: 'Трицепс (странична и медиална глава)',
      commonMistakes: 'Люлеене на лактите напред-назад, натискане с тежестта на цялото тяло.',
    },
    {
      id: 'ex-16',
      name: 'Разгъване за трицепс над глава на скрипец с въже',
      category: 'ARMS',
      equipment: 'CABLE',
      instructions: 'Максимално разтягане на дългата глава на трицепса зад главата при фиксирани лакти.',
      videoUrl: 'https://www.youtube.com/embed/0zCkuAyfKpU',
      setupInstructions: 'Закрепете въже на среден или горен скрипец. Застанете с гръб към машината в стабилен разкрач.',
      executionInstructions: 'Разгънете ръцете напред и нагоре над главата до пълна контракция на трицепса. Сгънете контролирано зад главата за дълбоко разтягане.',
      targetMuscles: 'Трицепс (дълга глава)',
      commonMistakes: 'Отпускане на лактите надолу към ребрата по време на движението.',
    },
    {
      id: 'ex-17',
      name: 'Повдигане на крака от вис на лост (Коремни преси)',
      category: 'CORE',
      equipment: 'BODYWEIGHT',
      instructions: 'Завъртете таза нагоре за активно включване на долната коремна стена, без залюляване.',
      videoUrl: 'https://www.youtube.com/embed/X-ACS9vpRyU',
      setupInstructions: 'Хванете се на лост за набирания с надхват, с активно стегнати рамене.',
      executionInstructions: 'Повдигнете коленете или изпънатите крака нагоре към гърдите чрез завъртане на таза. Спуснете плавно без никакво залюляване.',
      targetMuscles: 'Прав коремен мускул (долна част на пресата), Коси коремни мускули',
      commonMistakes: 'Използване на инерция и залюляване на краката като махало.',
    },
  ];

  for (const ex of exercisesData) {
    await prisma.exercise.create({ data: ex });
  }

  console.log('Seeding workout templates in Bulgarian...');
  await prisma.workoutTemplate.create({
    data: {
      id: 'tmpl-push-a',
      title: 'Бутащи А (Гърди, Рамене, Трицепс)',
      description: 'Интензивна тренировка за гърди, рамене и трицепс с прогресивно натоварване.',
      category: 'PUSH',
      isDefault: true,
      exercises: {
        create: [
          { exerciseId: 'ex-1', order: 1, targetSets: 4, repRange: '6-8', targetRpe: 8.5, restSeconds: 120, notes: 'Загрейте добре. Работни серии с висока интензивност.' },
          { exerciseId: 'ex-2', order: 2, targetSets: 3, repRange: '8-10', targetRpe: 8.0, restSeconds: 90, notes: 'Контролирано спускане за 2 секунди.' },
          { exerciseId: 'ex-12', order: 3, targetSets: 3, repRange: '8-10', targetRpe: 8.0, restSeconds: 90, notes: 'Фокус върху предно и средно рамо.' },
          { exerciseId: 'ex-11', order: 4, targetSets: 4, repRange: '12-15', targetRpe: 9.0, restSeconds: 60, notes: 'Кратки почивки и стриктна форма.' },
          { exerciseId: 'ex-3', order: 5, targetSets: 3, repRange: '10-12', targetRpe: 8.5, restSeconds: 60, notes: 'Пиково задържане за 1 секунда.' },
          { exerciseId: 'ex-15', order: 6, targetSets: 3, repRange: '12-15', targetRpe: 9.0, restSeconds: 60, notes: 'Дълбоко разгъване на трицепса.' },
        ],
      },
    },
  });

  await prisma.workoutTemplate.create({
    data: {
      id: 'tmpl-pull-a',
      title: 'Дърпащи А (Гръб, Задно рамо, Бицепс)',
      description: 'Тренировка за ширина и плътност на гърба с изолация за бицепс.',
      category: 'PULL',
      isDefault: true,
      exercises: {
        create: [
          { exerciseId: 'ex-8', order: 1, targetSets: 4, repRange: '8-10', targetRpe: 8.5, restSeconds: 120, notes: 'Водете с лактите надолу и назад.' },
          { exerciseId: 'ex-9', order: 2, targetSets: 3, repRange: '8-10', targetRpe: 8.5, restSeconds: 90, notes: 'Опора на гърдите за строга изолация.' },
          { exerciseId: 'ex-10', order: 3, targetSets: 3, repRange: '10-12', targetRpe: 8.0, restSeconds: 90, notes: 'Пълно разтягане на перките напред.' },
          { exerciseId: 'ex-13', order: 4, targetSets: 4, repRange: '12-15', targetRpe: 8.5, restSeconds: 60, notes: 'Външна ротация за здрави рамене.' },
          { exerciseId: 'ex-14', order: 5, targetSets: 3, repRange: '10-12', targetRpe: 8.5, restSeconds: 60, notes: 'Пълна супинация на китката.' },
        ],
      },
    },
  });

  await prisma.workoutTemplate.create({
    data: {
      id: 'tmpl-legs-a',
      title: 'Крака А (Квадрицепси, Задно бедро, Прасци)',
      description: 'Комплексна тренировка за долна част на тялото и коремна преса.',
      category: 'LEGS',
      isDefault: true,
      exercises: {
        create: [
          { exerciseId: 'ex-4', order: 1, targetSets: 4, repRange: '6-8', targetRpe: 8.5, restSeconds: 120, notes: 'Дълбок клек до паралел със стабилен корем.' },
          { exerciseId: 'ex-5', order: 2, targetSets: 3, repRange: '8-10', targetRpe: 8.0, restSeconds: 90, notes: 'Силно разтягане на задните бедра.' },
          { exerciseId: 'ex-6', order: 3, targetSets: 3, repRange: '10-12', targetRpe: 8.5, restSeconds: 90, notes: 'Пълен обем на движение за всяко бедро.' },
          { exerciseId: 'ex-7', order: 4, targetSets: 4, repRange: '12-15', targetRpe: 9.0, restSeconds: 60, notes: 'Задържане в пика 1-2 секунди.' },
          { exerciseId: 'ex-17', order: 5, targetSets: 3, repRange: '12-15', targetRpe: 8.5, restSeconds: 60, notes: 'Контролирано повдигане без люлеене.' },
        ],
      },
    },
  });

  console.log('Database seeded successfully with 17 exercises and 3 workout templates!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
