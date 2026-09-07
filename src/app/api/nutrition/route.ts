import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const logs = await prisma.nutritionLog.findMany({
      where: { date },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching nutrition logs:', error);
    return NextResponse.json({ error: 'Failed to fetch nutrition logs' }, { status: 500 });
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
          name: 'Атлет',
          email: 'athlete@fitlog.bg',
        },
      });
    }

    const { date, mealType, foodName, calories, protein, carbs, fats } = data;

    const log = await prisma.nutritionLog.create({
      data: {
        userId: user.id,
        date: date || new Date().toISOString().split('T')[0],
        mealType: mealType || 'SNACKS',
        foodName,
        calories: parseInt(calories) || 0,
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fats: parseFloat(fats) || 0,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('Error creating nutrition log:', error);
    return NextResponse.json({ error: 'Failed to create nutrition log' }, { status: 500 });
  }
}
