import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateCoachAiFeedback } from '@/lib/aiCoach';

export async function GET() {
  try {
    const checkins = await prisma.checkin.findMany({
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(checkins);
  } catch (error) {
    console.error('Error fetching checkins:', error);
    return NextResponse.json({ error: 'Failed to fetch checkins' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: 'demo-client-1',
          name: 'Alex Mitovski',
          email: 'alex@mitovski.co',
        },
      });
    }

    const {
      date,
      weightKg,
      chestCm,
      waistCm,
      hipsCm,
      armsCm,
      thighsCm,
      bodyFatPct,
      energyRating,
      stressRating,
      sleepRating,
      hungerRating,
      digestionRating,
      trainingDifficultyRating,
      notes,
    } = data;

    const parsedWeight = parseFloat(weightKg);
    const parsedWaist = waistCm ? parseFloat(waistCm) : null;
    const parsedDifficulty = parseInt(trainingDifficultyRating) || 3;

    // Fetch previous checkin for delta calculations
    const prevCheckin = await prisma.checkin.findFirst({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
    });

    // Fetch recent workouts in the past 7 days
    const recentWorkouts = await prisma.workoutLog.findMany({
      where: { userId: user.id },
      take: 7,
      orderBy: { startedAt: 'desc' },
    });

    const recentWorkoutsCount = recentWorkouts.length;
    const recentVolumeKg = recentWorkouts.reduce((acc, w) => acc + (w.totalVolumeKg || 0), 0);

    // Fetch recent nutrition logs
    const recentNutrition = await prisma.nutritionLog.findMany({
      where: { userId: user.id },
      take: 14,
    });

    const avgDailyCalories = recentNutrition.length > 0
      ? Math.round(recentNutrition.reduce((acc, n) => acc + n.calories, 0) / Math.max(1, recentNutrition.length / 3))
      : 0;
    const avgDailyProtein = recentNutrition.length > 0
      ? Math.round(recentNutrition.reduce((acc, n) => acc + n.protein, 0) / Math.max(1, recentNutrition.length / 3))
      : 0;

    // If workouts were rated easy or too easy (scale 1 or 2), automatically bump template weights by +2.5kg to +5kg
    if (parsedDifficulty <= 2) {
      try {
        const userTemplates = await prisma.workoutTemplate.findMany({
          where: { userId: user.id },
          include: { exercises: true },
        });

        for (const tmpl of userTemplates) {
          for (const ex of tmpl.exercises) {
            const currentWt = ex.startingWeightKg || 20;
            // Compound knee/back/chest get +2.5 to +5kg
            const increment = ['ex-1', 'ex-4', 'ex-5'].includes(ex.exerciseId) ? 5.0 : 2.5;
            await prisma.templateExercise.update({
              where: { id: ex.id },
              data: { startingWeightKg: currentWt + increment },
            });
          }
        }
      } catch (err) {
        console.error('Failed to auto-increment template weights:', err);
      }
    }

    // Generate Intelligent Coach AI Feedback with athlete's exact data
    const aiFeedbackText = await generateCoachAiFeedback({
      currentWeight: parsedWeight,
      prevWeight: prevCheckin ? prevCheckin.weightKg : null,
      targetWeight: user.targetWeight || 75.0,
      waistCm: parsedWaist,
      prevWaistCm: prevCheckin ? prevCheckin.waistCm : null,
      chestCm: chestCm ? parseFloat(chestCm) : null,
      armsCm: armsCm ? parseFloat(armsCm) : null,
      thighsCm: thighsCm ? parseFloat(thighsCm) : null,
      bodyFatPct: bodyFatPct ? parseFloat(bodyFatPct) : null,
      energyRating: parseInt(energyRating) || 4,
      stressRating: parseInt(stressRating) || 2,
      sleepRating: parseInt(sleepRating) || 4,
      hungerRating: parseInt(hungerRating) || 3,
      digestionRating: parseInt(digestionRating) || 4,
      trainingDifficultyRating: parsedDifficulty,
      notes: notes || '',
      recentWorkoutsCount,
      recentVolumeKg,
      avgDailyCalories,
      targetCalories: user.dailyCaloriesTarget || 2400,
      avgDailyProtein,
      targetProtein: user.proteinTarget || 180,
    });

    const checkin = await prisma.checkin.create({
      data: {
        userId: user.id,
        date: date || new Date().toISOString().split('T')[0],
        weightKg: parsedWeight,
        chestCm: chestCm ? parseFloat(chestCm) : null,
        waistCm: parsedWaist,
        hipsCm: hipsCm ? parseFloat(hipsCm) : null,
        armsCm: armsCm ? parseFloat(armsCm) : null,
        thighsCm: thighsCm ? parseFloat(thighsCm) : null,
        bodyFatPct: bodyFatPct ? parseFloat(bodyFatPct) : null,
        energyRating: parseInt(energyRating) || 4,
        stressRating: parseInt(stressRating) || 2,
        sleepRating: parseInt(sleepRating) || 4,
        hungerRating: parseInt(hungerRating) || 3,
        digestionRating: parseInt(digestionRating) || 4,
        aiFeedback: aiFeedbackText,
        notes: notes || '',
      },
    });

    // Update user's current weight
    if (parsedWeight) {
      await prisma.user.update({
        where: { id: user.id },
        data: { currentWeight: parsedWeight },
      });
    }

    return NextResponse.json(checkin, { status: 201 });
  } catch (error) {
    console.error('Error creating checkin:', error);
    return NextResponse.json({ error: 'Failed to create checkin' }, { status: 500 });
  }
}
