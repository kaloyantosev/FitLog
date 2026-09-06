import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const exercises = await prisma.exercise.findMany({
      where: category && category !== 'ALL' ? { category } : undefined,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const exercise = await prisma.exercise.create({
      data: {
        name: data.name,
        category: data.category || 'CHEST',
        equipment: data.equipment || 'BARBELL',
        instructions: data.instructions || '',
      },
    });
    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error('Error creating exercise:', error);
    return NextResponse.json({ error: 'Failed to create exercise' }, { status: 500 });
  }
}
