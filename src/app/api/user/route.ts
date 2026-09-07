import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, setAuthCookie } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      // Check if DB is completely empty
      const count = await prisma.user.count();
      if (count === 0) {
        return NextResponse.json({ error: 'No user found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Unauthorized', unauthenticated: true }, { status: 401 });
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
    const cleanEmail = data.email ? String(data.email).trim().toLowerCase() : null;

    let targetUser = null;

    // 1. Look up by email if provided
    if (cleanEmail) {
      targetUser = await prisma.user.findFirst({
        where: {
          email: {
            equals: cleanEmail,
            mode: 'insensitive',
          },
        },
      });
    }

    // 2. Otherwise look up authenticated user
    if (!targetUser) {
      targetUser = await getAuthUser(request);
    }

    // 3. If no user found, CREATE a brand new user
    if (!targetUser) {
      const newUser = await prisma.user.create({
        data: {
          name: data.name || 'Атлет',
          email: cleanEmail || 'athlete@fitlog.bg',
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

      const res = NextResponse.json(newUser);
      setAuthCookie(res, newUser.id);
      return res;
    }

    // 4. Update the matched user
    const updated = await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        name: data.name ?? targetUser.name,
        email: cleanEmail ?? targetUser.email,
        password: data.password ?? targetUser.password,
        role: data.role ?? targetUser.role,
        age: data.age !== undefined ? parseInt(data.age) : targetUser.age,
        gender: data.gender ?? targetUser.gender,
        heightCm: data.heightCm !== undefined ? parseFloat(data.heightCm) : targetUser.heightCm,
        trainingDaysPerWeek: data.trainingDaysPerWeek !== undefined ? parseInt(data.trainingDaysPerWeek) : targetUser.trainingDaysPerWeek,
        preferredTrainingHour: data.preferredTrainingHour !== undefined ? data.preferredTrainingHour : (targetUser as any).preferredTrainingHour,
        emailNotificationsEnabled: data.emailNotificationsEnabled !== undefined ? Boolean(data.emailNotificationsEnabled) : (targetUser as any).emailNotificationsEnabled,
        foodPreferences: data.foodPreferences !== undefined ? data.foodPreferences : (targetUser as any).foodPreferences,
        avoidedIngredients: data.avoidedIngredients !== undefined ? (typeof data.avoidedIngredients === 'string' ? data.avoidedIngredients : JSON.stringify(data.avoidedIngredients)) : (targetUser as any).avoidedIngredients,
        mealsPerDay: data.mealsPerDay !== undefined ? parseInt(data.mealsPerDay) : (targetUser as any).mealsPerDay,
        mealTiming: data.mealTiming !== undefined ? data.mealTiming : (targetUser as any).mealTiming,
        snackingHabits: data.snackingHabits !== undefined ? data.snackingHabits : (targetUser as any).snackingHabits,
        mealPlanData: data.mealPlanData !== undefined ? (typeof data.mealPlanData === 'string' ? data.mealPlanData : JSON.stringify(data.mealPlanData)) : (targetUser as any).mealPlanData,
        currentWeight: data.currentWeight !== undefined ? parseFloat(data.currentWeight) : targetUser.currentWeight,
        targetWeight: data.targetWeight !== undefined ? parseFloat(data.targetWeight) : targetUser.targetWeight,
        dailyCaloriesTarget: data.dailyCaloriesTarget !== undefined ? parseInt(data.dailyCaloriesTarget) : targetUser.dailyCaloriesTarget,
        proteinTarget: data.proteinTarget !== undefined ? parseInt(data.proteinTarget) : targetUser.proteinTarget,
        carbsTarget: data.carbsTarget !== undefined ? parseInt(data.carbsTarget) : targetUser.carbsTarget,
        fatsTarget: data.fatsTarget !== undefined ? parseInt(data.fatsTarget) : targetUser.fatsTarget,
        waterTargetMl: data.waterTargetMl !== undefined ? parseInt(data.waterTargetMl) : targetUser.waterTargetMl,
      },
    });

    const res = NextResponse.json(updated);
    setAuthCookie(res, updated.id);
    return res;
  } catch (error) {
    console.error('Error updating/creating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return PUT(request);
}
