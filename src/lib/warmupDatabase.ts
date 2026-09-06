export interface WarmupExercise {
  id: string;
  name: string;
  nameBg: string;
  targetAreaBg: string;
  durationOrRepsBg: string;
  instructionsBg: string;
  videoUrl: string;
}

export const WARMUP_EXERCISES_DATABASE: WarmupExercise[] = [
  {
    id: 'wu-1',
    name: "World's Greatest Stretch (Dynamic Hips & Thoracic)",
    nameBg: 'Динамичен стреч за мобилност на таз и гръбнак (World\'s Greatest Stretch)',
    targetAreaBg: 'Тазобедрени стави, торакален гръбнак, сгъвачи на бедрото',
    durationOrRepsBg: '5-6 повторения на страна',
    instructionsBg: 'Заемете позиция за дълбок напад. Поставете лакътя от вътрешната страна на предното стъпало, след което разтворете гръдния кош и протегнете ръката нагоре към тавана.',
    videoUrl: 'https://www.youtube.com/embed/PmsO0yNqWc4',
  },
  {
    id: 'wu-2',
    name: 'Band Pull-Aparts & Shoulder Dislocates',
    nameBg: 'Разтваряне с ластик & Ротации за раменен пояс',
    targetAreaBg: 'Ротаторен маншон, задно рамо, ромбоиди',
    durationOrRepsBg: '15-20 контролирани повторения',
    instructionsBg: 'Хванете ластика на ширината на раменете с прави ръце. Издърпайте го към гърдите, като събирате лопатките плътно една към друга. Задръжте за 1 секунда.',
    videoUrl: 'https://www.youtube.com/embed/pciT1z488lE',
  },
  {
    id: 'wu-3',
    name: 'Thoracic Cat-Cow & Thread the Needle',
    nameBg: 'Котешки гръб & Торакална мобилизация',
    targetAreaBg: 'Гръден кош, средна и горна част на гърба',
    durationOrRepsBg: '10 плавни вдишвания и издишвания',
    instructionsBg: 'На четири крака редувайте извиване на гърба нагоре (издишване) с плавно отпускане надолу и повдигане на погледа (вдишване) за декомпресия на гръбнака.',
    videoUrl: 'https://www.youtube.com/embed/w_bvd_d2pZ8',
  },
  {
    id: 'wu-4',
    name: 'Bodyweight Squats with Ankle Mobility Pause',
    nameBg: 'Клекове със собствено тегло и пауза в долна точка',
    targetAreaBg: 'Квадрицепси, глезени, тазово дъно',
    durationOrRepsBg: '10-12 повторения с 2 сек пауза долу',
    instructionsBg: 'Клекнете бавно с отворени колена навън. В най-ниската точка задръжте за 2 секунди, натискайки леко коленете с лакти за максимална мобилност на таза и глезените.',
    videoUrl: 'https://www.youtube.com/embed/aclHkVaku9U',
  },
  {
    id: 'wu-5',
    name: 'Glute Bridges with Isometric Hold',
    nameBg: 'Глутеус мост с изометрично стягане',
    targetAreaBg: 'Седалищни мускули (Gluteus Maximus), задно бедро',
    durationOrRepsBg: '12 повторения с 2 сек контракция',
    instructionsBg: 'Легнете по гръб със свити колена и стъпала на пода. Повдигнете таза нагоре чрез стягане на седалището, без да извивате излишно кръста.',
    videoUrl: 'https://www.youtube.com/embed/OUgsJ8-Vigk',
  },
  {
    id: 'wu-6',
    name: 'Scapular Wall Slides & Push-ups',
    nameBg: 'Скапуларни плъзгания по стена за лопатки',
    targetAreaBg: 'Serratus anterior, долна част на трапец, лопатки',
    durationOrRepsBg: '12-15 повторения',
    instructionsBg: 'Опрете гърба, лактите и китките плътно до стената. Плъзгайте ръцете плавно нагоре и надолу, поддържайки постоянен контакт със стената.',
    videoUrl: 'https://www.youtube.com/embed/p1u42N4f96c',
  },
];

export function getWarmupForWorkoutCategory(category: string): WarmupExercise[] {
  const cat = (category || '').toUpperCase();
  if (cat.includes('PUSH') || cat.includes('UPPER') || cat.includes('БУТАНЕ') || cat.includes('ГОРНА')) {
    return [WARMUP_EXERCISES_DATABASE[1], WARMUP_EXERCISES_DATABASE[2], WARMUP_EXERCISES_DATABASE[5], WARMUP_EXERCISES_DATABASE[0]];
  }
  if (cat.includes('PULL') || cat.includes('ДЪРПАНЕ')) {
    return [WARMUP_EXERCISES_DATABASE[1], WARMUP_EXERCISES_DATABASE[2], WARMUP_EXERCISES_DATABASE[0], WARMUP_EXERCISES_DATABASE[5]];
  }
  if (cat.includes('LEGS') || cat.includes('LOWER') || cat.includes('КРАКА') || cat.includes('ДОЛНА')) {
    return [WARMUP_EXERCISES_DATABASE[0], WARMUP_EXERCISES_DATABASE[3], WARMUP_EXERCISES_DATABASE[4]];
  }
  // Full Body default
  return [WARMUP_EXERCISES_DATABASE[0], WARMUP_EXERCISES_DATABASE[1], WARMUP_EXERCISES_DATABASE[3], WARMUP_EXERCISES_DATABASE[4]];
}
