const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  await prisma.loggedSet.deleteMany();
  await prisma.workoutLog.deleteMany();
  await prisma.templateExercise.deleteMany();
  await prisma.workoutTemplate.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.nutritionLog.deleteMany();
  await prisma.checkin.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding demo user...');
  const user = await prisma.user.create({
    data: {
      id: 'demo-client-1',
      name: 'Alex Mitovski',
      email: 'alex@mitovski.co',
      role: 'CLIENT',
      currentWeight: 79.2,
      targetWeight: 76.0,
      heightCm: 182,
      dailyCaloriesTarget: 2500,
      proteinTarget: 185,
      carbsTarget: 260,
      fatsTarget: 65,
      waterTargetMl: 3500,
    },
  });

  console.log('Seeding exercise database with Muscle & Strength video guides...');
  const exercisesData = [
    {
      id: 'ex-1',
      name: 'Barbell Flat Bench Press',
      category: 'CHEST',
      equipment: 'BARBELL',
      instructions: 'Retract scapulae, touch lower sternum, press with moderate arch and drive through legs.',
      videoUrl: 'https://www.youtube.com/embed/gRVjAtPip0Y',
      setupInstructions: 'Lie on the flat bench with eyes directly under the bar. Retract and depress shoulder blades firmly into the bench. Plant your feet firmly on the floor.',
      executionInstructions: 'Unrack bar with locked wrists. Lower the barbell under control until it lightly touches your lower sternum/nipple line. Drive the bar upward in a slight diagonal arc over your shoulders.',
      targetMuscles: 'Pectoralis Major (Sternal Head), Anterior Deltoid, Triceps Brachii',
      commonMistakes: 'Bouncing the bar off the ribcage, flaring elbows out at 90 degrees, lifting hips off the bench.',
    },
    {
      id: 'ex-2',
      name: 'Incline Dumbbell Press (30°)',
      category: 'CHEST',
      equipment: 'DUMBBELL',
      instructions: 'Target upper clavicular head, 2-sec eccentric with elbow angle at 45 degrees.',
      videoUrl: 'https://www.youtube.com/embed/8iPEnn-ltC8',
      setupInstructions: 'Set bench to a 30-degree incline. Kick dumbbells up to shoulder level, keep chest proud and shoulder blades pinched back.',
      executionInstructions: 'Press dumbbells up and slightly inward over your upper chest without clanking them together. Lower slowly until you feel a deep stretch in the upper pectorals.',
      targetMuscles: 'Pectoralis Major (Clavicular Head), Anterior Deltoid, Triceps',
      commonMistakes: 'Setting bench incline too steep (causes front delt takeover), excessive elbow flare.',
    },
    {
      id: 'ex-3',
      name: 'Low-to-High Cable Fly',
      category: 'CHEST',
      equipment: 'CABLE',
      instructions: 'Squeeze upper inner chest at top contraction with 1-second isometric hold.',
      videoUrl: 'https://www.youtube.com/embed/M1N804yWA-8',
      setupInstructions: 'Set cable pulleys to the lowest position with D-handles. Stand in a staggered stance in the center with a slight forward lean.',
      executionInstructions: 'With a slight bend in elbows, scoop handles upward and inward in an arc until hands meet at chest/eye level. Squeeze upper chest for 1 second.',
      targetMuscles: 'Upper Pectorals, Sternal Head',
      commonMistakes: 'Bending elbows into a press, using body swing/momentum to raise handles.',
    },
    {
      id: 'ex-4',
      name: 'Barbell Back Squat',
      category: 'LEGS',
      equipment: 'BARBELL',
      instructions: 'Brace core with 360-degree intra-abdominal pressure, descend to parallel, drive knees out.',
      videoUrl: 'https://www.youtube.com/embed/bEv6CCg2BC8',
      setupInstructions: 'Position bar across mid-traps (high-bar) or rear delts (low-bar). Grip the bar tightly, unrack, and take 2-3 clean steps back. Feet shoulder-width apart, toes turned slightly out.',
      executionInstructions: 'Take a deep belly breath and brace. Hinge at hips and bend knees simultaneously. Descend under control until hip crease is parallel to or below top of knees. Drive through mid-foot to stand up.',
      targetMuscles: 'Quadriceps (Rectus Femoris, Vastus Lateralis/Medialis), Gluteus Maximus, Adductors',
      commonMistakes: 'Knees caving inward (valgus collapse), heels lifting off the floor, rounding lower back (butt wink).',
    },
    {
      id: 'ex-5',
      name: 'Romanian Deadlift (RDL)',
      category: 'LEGS',
      equipment: 'BARBELL',
      instructions: 'Hinge at hips, maintain neutral spine, push glutes back to stretch hamstrings.',
      videoUrl: 'https://www.youtube.com/embed/jEy_czb3RKA',
      setupInstructions: 'Hold barbell with an overhand shoulder-width grip. Stand tall with soft knees, lats engaged, and chest upright.',
      executionInstructions: 'Push hips backward as if touching a wall behind you. Slide the bar down your thighs to mid-shin level while keeping back completely flat. Squeeze glutes to return to standing.',
      targetMuscles: 'Hamstrings (Biceps Femoris, Semitendinosus), Gluteus Maximus, Erector Spinae',
      commonMistakes: 'Squatting down instead of hip-hinging, rounding the thoracic/lumbar spine, letting the bar drift away from legs.',
    },
    {
      id: 'ex-6',
      name: 'Bulgarian Split Squat',
      category: 'LEGS',
      equipment: 'DUMBBELL',
      instructions: 'Front foot flat, drop rear knee straight down, focus on glute & quad stretch.',
      videoUrl: 'https://www.youtube.com/embed/2C-uNgKwPLE',
      setupInstructions: 'Stand 2 feet in front of a flat bench. Place top of one foot onto the bench behind you. Hold dumbbells at sides.',
      executionInstructions: 'Lower your body by bending front knee until front thigh is parallel to ground. Drive up through front heel to return to top.',
      targetMuscles: 'Quadriceps, Gluteus Medius/Maximus, Hamstrings',
      commonMistakes: 'Taking too short of a stance causing front heel to elevate, leaning back excessively.',
    },
    {
      id: 'ex-7',
      name: 'Standing Calf Raise',
      category: 'LEGS',
      equipment: 'MACHINE',
      instructions: 'Deep stretch at bottom, 2-sec pause at top full plantarflexion.',
      videoUrl: 'https://www.youtube.com/embed/gwLzBJYoWlI',
      setupInstructions: 'Place balls of feet on platform with heels hanging off. Shoulder pads resting securely.',
      executionInstructions: 'Lower heels down into a full calf stretch. Pause 1 second, then explosively drive up onto toes. Squeeze calves at peak.',
      targetMuscles: 'Gastrocnemius, Soleus',
      commonMistakes: 'Bouncing up and down without achieving full stretch or contraction.',
    },
    {
      id: 'ex-8',
      name: 'Lat Pulldown (Neutral Grip)',
      category: 'BACK',
      equipment: 'CABLE',
      instructions: 'Depress shoulders first, pull elbows down toward hips, squeeze lats.',
      videoUrl: 'https://www.youtube.com/embed/CAwf7n6Luuc',
      setupInstructions: 'Adjust thigh pad so legs are snug. Grip attachment with palms facing each other or overhand grip.',
      executionInstructions: 'Depress scapulae and pull bar down to upper chest level by driving elbows down and back. Control the return to full overhead stretch.',
      targetMuscles: 'Latissimus Dorsi, Teres Major, Biceps Brachii',
      commonMistakes: 'Leaning back excessively into a row, pulling with arms instead of engaging lats.',
    },
    {
      id: 'ex-9',
      name: 'Chest Supported T-Bar Row',
      category: 'BACK',
      equipment: 'MACHINE',
      instructions: 'Squeeze mid-back and rhomboids at peak contraction without lower back sway.',
      videoUrl: 'https://www.youtube.com/embed/7pquL0f4Jp8',
      setupInstructions: 'Adjust pad so upper chest rests against support. Grip neutral or pronated handles.',
      executionInstructions: 'Retract shoulder blades and pull handles toward ribs. Squeeze upper back and hold peak squeeze for 1 second.',
      targetMuscles: 'Rhomboids, Middle & Lower Trapezius, Latissimus Dorsi, Posterior Deltoid',
      commonMistakes: 'Lifting chest off the pad to cheat with momentum.',
    },
    {
      id: 'ex-10',
      name: 'Seated Cable Row',
      category: 'BACK',
      equipment: 'CABLE',
      instructions: 'Keep torso upright, pull handle to lower abdomen, stretch lats on return.',
      videoUrl: 'https://www.youtube.com/embed/7pquL0f4Jp8',
      setupInstructions: 'Sit with feet braced on footrests, knees slightly bent. Grasp V-bar handle with arms extended.',
      executionInstructions: 'Pull handle into lower abdomen while keeping back straight and chest proud. Slowly return to start letting lats stretch.',
      targetMuscles: 'Lats, Rhomboids, Trapezius, Biceps',
      commonMistakes: 'Swinging torso back and forth, rounding lower back.',
    },
    {
      id: 'ex-11',
      name: 'Dumbbell Lateral Raise',
      category: 'SHOULDERS',
      equipment: 'DUMBBELL',
      instructions: 'Slight forward lean, raise arms in scapular plane with pinky slightly elevated.',
      videoUrl: 'https://www.youtube.com/embed/3VcKaXpzqRo',
      setupInstructions: 'Hold dumbbells at sides with a slight forward torso hinge (10-15 degrees).',
      executionInstructions: 'Raise dumbbells outward to shoulder height leading with elbows. Lower under control over 2 seconds.',
      targetMuscles: 'Lateral Deltoid (Middle Head)',
      commonMistakes: 'Using hip swing to heave dumbbells, shrugging with upper traps.',
    },
    {
      id: 'ex-12',
      name: 'Seated Dumbbell Shoulder Press',
      category: 'SHOULDERS',
      equipment: 'DUMBBELL',
      instructions: 'Press dumbbells overhead without clanking, stop just short of lockout.',
      videoUrl: 'https://www.youtube.com/embed/qEwKCR5JCog',
      setupInstructions: 'Set bench to 80-85 degrees. Kick dumbbells up to shoulder height with palms forward.',
      executionInstructions: 'Press weights overhead until arms are nearly straight. Lower dumbbells slowly to ear level.',
      targetMuscles: 'Anterior Deltoid, Lateral Deltoid, Triceps, Upper Trapezius',
      commonMistakes: 'Arching lower back excessively off the bench, flaring elbows out perpendicular.',
    },
    {
      id: 'ex-13',
      name: 'Cable Rope Face Pull',
      category: 'SHOULDERS',
      equipment: 'CABLE',
      instructions: 'Pull towards eye level with external shoulder rotation for posture and rear delts.',
      videoUrl: 'https://www.youtube.com/embed/rep-qVOkqgk',
      setupInstructions: 'Set cable pulley at upper chest/face level with rope attachment. Grip rope with thumbs pointing back.',
      executionInstructions: 'Pull rope toward nose/eyes while flaring hands outward into external shoulder rotation. Squeeze rear delts.',
      targetMuscles: 'Posterior Deltoid, Infraspinatus, Teres Minor, Rhomboids',
      commonMistakes: 'Pulling downward to chest instead of eye level, dropping elbows.',
    },
    {
      id: 'ex-14',
      name: 'Incline Dumbbell Bicep Curl',
      category: 'ARMS',
      equipment: 'DUMBBELL',
      instructions: 'Full supination and deep stretch on biceps long head at bottom.',
      videoUrl: 'https://www.youtube.com/embed/soxrZlIl35U',
      setupInstructions: 'Sit back on a 45-60 degree incline bench with dumbbells hanging straight down.',
      executionInstructions: 'Curl dumbbells up while supinating wrists (palms facing ceiling). Lower under 2-3 second eccentric.',
      targetMuscles: 'Biceps Brachii (Long Head & Short Head), Brachialis',
      commonMistakes: 'Swinging elbows forward to engage front delts instead of isolating biceps.',
    },
    {
      id: 'ex-15',
      name: 'Tricep Rope Pushdown',
      category: 'ARMS',
      equipment: 'CABLE',
      instructions: 'Keep elbows pinned to ribs, flare rope outward at bottom lockout.',
      videoUrl: 'https://www.youtube.com/embed/vB5OHsJ3EME',
      setupInstructions: 'Attach rope to high pulley. Stand with slight forward lean, elbows at sides.',
      executionInstructions: 'Push rope down and spread ends apart at bottom contraction. Return to 90 degrees elbow bend.',
      targetMuscles: 'Triceps Brachii (Lateral & Medial Heads)',
      commonMistakes: 'Letting elbows flare forward and back, leaning body over the rope.',
    },
    {
      id: 'ex-16',
      name: 'Overhead Cable Tricep Extension',
      category: 'ARMS',
      equipment: 'CABLE',
      instructions: 'Maximize long-head tricep stretch behind head with elbows fixed.',
      videoUrl: 'https://www.youtube.com/embed/1u18yJQLZXE',
      setupInstructions: 'Attach rope to high or mid cable pulley. Face away from stack in a split stance.',
      executionInstructions: 'Extend arms forward and overhead until triceps fully contract. Bend elbows back into deep stretch.',
      targetMuscles: 'Triceps Brachii (Long Head)',
      commonMistakes: 'Dropping elbows down toward ribs during the movement.',
    },
    {
      id: 'ex-17',
      name: 'Hanging Leg Raise',
      category: 'CORE',
      equipment: 'BODYWEIGHT',
      instructions: 'Tilt pelvis up to engage lower rectus abdominis, avoid swinging.',
      videoUrl: 'https://www.youtube.com/embed/hdng3Nm1x_E',
      setupInstructions: 'Hang from pull-up bar with overhand grip and dead hang shoulder engagement.',
      executionInstructions: 'Raise knees/toes up toward chest by curling pelvis upward. Lower slowly with zero body swing.',
      targetMuscles: 'Rectus Abdominis, Iliopsoas, Obliques',
      commonMistakes: 'Using hip momentum and swinging legs like a pendulum.',
    },
  ];

  for (const ex of exercisesData) {
    await prisma.exercise.create({ data: ex });
  }

  console.log('Seeding workout templates...');
  const pushTemplate = await prisma.workoutTemplate.create({
    data: {
      id: 'tmpl-push-a',
      title: 'Push A - Hypertrophy & Chest Priority',
      description: 'High tension chest and triceps session with progressive overload.',
      category: 'PUSH',
      isDefault: true,
      exercises: {
        create: [
          { exerciseId: 'ex-1', order: 1, targetSets: 4, repRange: '6-8', targetRpe: 8.5, restSeconds: 120, notes: 'Warm up thoroughly. Top set at RPE 8.5.' },
          { exerciseId: 'ex-2', order: 2, targetSets: 3, repRange: '8-10', targetRpe: 8.0, restSeconds: 90, notes: 'Control the descent.' },
          { exerciseId: 'ex-12', order: 3, targetSets: 3, repRange: '10-12', targetRpe: 8.0, restSeconds: 90, notes: 'Focus on anterior deltoid drive.' },
          { exerciseId: 'ex-11', order: 4, targetSets: 4, repRange: '12-15', targetRpe: 9.0, restSeconds: 60, notes: 'Short rest intervals.' },
          { exerciseId: 'ex-15', order: 5, targetSets: 3, repRange: '10-12', targetRpe: 8.5, restSeconds: 60, notes: 'Superset with cable fly if desired.' },
          { exerciseId: 'ex-16', order: 6, targetSets: 3, repRange: '12-15', targetRpe: 9.0, restSeconds: 60, notes: 'Deep triceps stretch.' },
        ],
      },
    },
  });

  const pullTemplate = await prisma.workoutTemplate.create({
    data: {
      id: 'tmpl-pull-a',
      title: 'Pull A - Back Width & Bicep Peak',
      description: 'Lats, upper back density and dedicated bicep overload.',
      category: 'PULL',
      isDefault: true,
      exercises: {
        create: [
          { exerciseId: 'ex-8', order: 1, targetSets: 4, repRange: '8-10', targetRpe: 8.5, restSeconds: 90, notes: 'Pull with elbows, avoid using momentum.' },
          { exerciseId: 'ex-9', order: 2, targetSets: 3, repRange: '8-10', targetRpe: 8.0, restSeconds: 90, notes: 'Pause 1s at top contraction.' },
          { exerciseId: 'ex-10', order: 3, targetSets: 3, repRange: '10-12', targetRpe: 8.0, restSeconds: 75, notes: 'Full lat stretch forward.' },
          { exerciseId: 'ex-13', order: 4, targetSets: 3, repRange: '15-20', targetRpe: 8.5, restSeconds: 60, notes: 'Rear delt and rotator cuff focus.' },
          { exerciseId: 'ex-14', order: 5, targetSets: 4, repRange: '10-12', targetRpe: 9.0, restSeconds: 60, notes: 'Strict form, no swinging.' },
        ],
      },
    },
  });

  const legsTemplate = await prisma.workoutTemplate.create({
    data: {
      id: 'tmpl-legs-a',
      title: 'Legs A - Quad & Hamstring Builder',
      description: 'Heavy compound leg day emphasizing knee flexion and hip hinge patterns.',
      category: 'LEGS',
      isDefault: true,
      exercises: {
        create: [
          { exerciseId: 'ex-4', order: 1, targetSets: 4, repRange: '6-8', targetRpe: 8.5, restSeconds: 150, notes: 'Brace hard on unrack.' },
          { exerciseId: 'ex-5', order: 2, targetSets: 4, repRange: '8-10', targetRpe: 8.0, restSeconds: 120, notes: 'Feel the stretch in hamstrings.' },
          { exerciseId: 'ex-6', order: 3, targetSets: 3, repRange: '10-12', targetRpe: 8.5, restSeconds: 90, notes: '3 sets per leg.' },
          { exerciseId: 'ex-7', order: 4, targetSets: 4, repRange: '12-15', targetRpe: 9.0, restSeconds: 60, notes: 'Full range of motion.' },
          { exerciseId: 'ex-17', order: 5, targetSets: 3, repRange: '12-15', targetRpe: 8.0, restSeconds: 60, notes: 'Controlled slow tempo.' },
        ],
      },
    },
  });

  console.log('Seeding recent checkin and nutrition history...');
  const today = new Date().toISOString().split('T')[0];
  const dates = ['2026-08-10', '2026-08-17', '2026-08-24', '2026-08-31', '2026-09-06'];
  const weights = [81.5, 80.8, 80.2, 79.7, 79.2];

  for (let i = 0; i < dates.length; i++) {
    const aiFeedback = i === 0
      ? '🎯 **Initial Check-in Baseline**: Benchmark registered at 81.5 kg (Target: 75.0 kg). All future adjustments will compare directly to this baseline.'
      : `🎯 **Progression Rate**: Superb weekly trend. You dropped **${(weights[i-1] - weights[i]).toFixed(1)} kg** this week, which is in the sweet spot for pure adipose loss while preserving lean mass.\n\n📏 **Circumference**: Waist tightened by **0.8 cm**, confirming fat mobilization around the core regardless of scale noise.\n\n🧠 **Biofeedback & Recovery**: High energy (4/5) and low stress (2/5) indicate optimal hormonal and carbohydrate recovery.\n\n💡 **Coach Action Step**: Keep current daily nutrition targets locked in, hit your lifting progressive overload targets, and maintain daily step consistency.`;

    await prisma.checkin.create({
      data: {
        userId: user.id,
        date: dates[i],
        weightKg: weights[i],
        waistCm: 84 - (i * 0.8),
        chestCm: 106 + (i * 0.2),
        armsCm: 39 + (i * 0.1),
        thighsCm: 60 - (i * 0.2),
        bodyFatPct: 15.5 - (i * 0.4),
        energyRating: i === 2 ? 3 : 4,
        stressRating: i === 3 ? 3 : 2,
        sleepRating: 4,
        hungerRating: 3,
        digestionRating: 4,
        aiFeedback,
        notes: i === 4 ? 'Energy levels are high, strength maintained on pressing movements.' : 'Steady weekly progression.',
      },
    });
  }

  // Seed sample today meals
  await prisma.nutritionLog.createMany({
    data: [
      { userId: user.id, date: today, mealType: 'BREAKFAST', foodName: 'Oatmeal with Whey Protein & Blueberries', calories: 540, protein: 42, carbs: 68, fats: 10 },
      { userId: user.id, date: today, mealType: 'LUNCH', foodName: 'Grilled Chicken Breast, Basmati Rice & Broccoli', calories: 680, protein: 55, carbs: 80, fats: 14 },
      { userId: user.id, date: today, mealType: 'SNACKS', foodName: 'Greek Yogurt 0% with Almonds & Honey', calories: 310, protein: 26, carbs: 24, fats: 11 },
    ],
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
