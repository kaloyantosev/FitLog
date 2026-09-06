import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: 'demo-client-1',
          name: 'Калоян Тосев',
          email: 'kaloyan.tosev@gmail.com',
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
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    let user = await prisma.user.findFirst();
    
    if (!user) {
      const newUser = await prisma.user.create({
        data: {
          name: data.name || 'Атлет',
          email: data.email || 'athlete@fitlog.bg',
          password: data.password || 'password123',
          role: data.role || 'CLIENT',
          age: data.age !== undefined ? parseInt(data.age) : 25,
          gender: data.gender || 'MALE',
          heightCm: data.heightCm !== undefined ? parseFloat(data.heightCm) : 180.0,
          currentWeight: data.currentWeight !== undefined ? parseFloat(data.currentWeight) : 80.0,
          targetWeight: data.targetWeight !== undefined ? parseFloat(data.targetWeight) : 75.0,
          trainingDaysPerWeek: data.trainingDaysPerWeek !== undefined ? parseInt(data.trainingDaysPerWeek) : 4,
          preferredTrainingHour: data.preferredTrainingHour || '18:00',
          emailNotificationsEnabled: data.emailNotificationsEnabled !== undefined ? Boolean(data.emailNotificationsEnabled) : true,
          foodPreferences: data.foodPreferences || 'BALANCED',
          avoidedIngredients: data.avoidedIngredients !== undefined ? (typeof data.avoidedIngredients === 'string' ? data.avoidedIngredients : JSON.stringify(data.avoidedIngredients)) : '[]',
          mealsPerDay: data.mealsPerDay !== undefined ? parseInt(data.mealsPerDay) : 4,
          mealTiming: data.mealTiming || 'STANDARD',
          snackingHabits: data.snackingHabits || 'AFTERNOON_FUEL',
          mealPlanData: data.mealPlanData !== undefined ? (typeof data.mealPlanData === 'string' ? data.mealPlanData : JSON.stringify(data.mealPlanData)) : null,
          dailyCaloriesTarget: data.dailyCaloriesTarget !== undefined ? parseInt(data.dailyCaloriesTarget) : 2400,
          proteinTarget: data.proteinTarget !== undefined ? parseInt(data.proteinTarget) : 180,
          carbsTarget: data.carbsTarget !== undefined ? parseInt(data.carbsTarget) : 240,
          fatsTarget: data.fatsTarget !== undefined ? parseInt(data.fatsTarget) : 65,
          waterTargetMl: data.waterTargetMl !== undefined ? parseInt(data.waterTargetMl) : 3500,
        },
      });
      return NextResponse.json(newUser);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name ?? user.name,
        email: data.email ?? user.email,
        password: data.password ?? user.password,
        role: data.role ?? user.role,
        age: data.age !== undefined ? parseInt(data.age) : user.age,
        gender: data.gender ?? user.gender,
        heightCm: data.heightCm !== undefined ? parseFloat(data.heightCm) : user.heightCm,
        trainingDaysPerWeek: data.trainingDaysPerWeek !== undefined ? parseInt(data.trainingDaysPerWeek) : user.trainingDaysPerWeek,
        preferredTrainingHour: data.preferredTrainingHour !== undefined ? data.preferredTrainingHour : (user as any).preferredTrainingHour,
        emailNotificationsEnabled: data.emailNotificationsEnabled !== undefined ? Boolean(data.emailNotificationsEnabled) : (user as any).emailNotificationsEnabled,
        foodPreferences: data.foodPreferences !== undefined ? data.foodPreferences : (user as any).foodPreferences,
        avoidedIngredients: data.avoidedIngredients !== undefined ? (typeof data.avoidedIngredients === 'string' ? data.avoidedIngredients : JSON.stringify(data.avoidedIngredients)) : (user as any).avoidedIngredients,
        mealsPerDay: data.mealsPerDay !== undefined ? parseInt(data.mealsPerDay) : (user as any).mealsPerDay,
        mealTiming: data.mealTiming !== undefined ? data.mealTiming : (user as any).mealTiming,
        snackingHabits: data.snackingHabits !== undefined ? data.snackingHabits : (user as any).snackingHabits,
        mealPlanData: data.mealPlanData !== undefined ? (typeof data.mealPlanData === 'string' ? data.mealPlanData : JSON.stringify(data.mealPlanData)) : (user as any).mealPlanData,
        currentWeight: data.currentWeight !== undefined ? parseFloat(data.currentWeight) : user.currentWeight,
        targetWeight: data.targetWeight !== undefined ? parseFloat(data.targetWeight) : user.targetWeight,
        dailyCaloriesTarget: data.dailyCaloriesTarget !== undefined ? parseInt(data.dailyCaloriesTarget) : user.dailyCaloriesTarget,
        proteinTarget: data.proteinTarget !== undefined ? parseInt(data.proteinTarget) : user.proteinTarget,
        carbsTarget: data.carbsTarget !== undefined ? parseInt(data.carbsTarget) : user.carbsTarget,
        fatsTarget: data.fatsTarget !== undefined ? parseInt(data.fatsTarget) : user.fatsTarget,
        waterTargetMl: data.waterTargetMl !== undefined ? parseInt(data.waterTargetMl) : user.waterTargetMl,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating/creating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return PUT(request);
}
