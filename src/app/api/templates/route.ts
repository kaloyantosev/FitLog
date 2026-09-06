import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const templates = await prisma.workoutTemplate.findMany({
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { title, description, category, exercises, estimatedDurationMinutes } = data;

    const template = await prisma.workoutTemplate.create({
      data: {
        title,
        description,
        category: category || 'FULL_BODY',
        isDefault: false,
        estimatedDurationMinutes: parseInt(estimatedDurationMinutes) || 50,
        exercises: {
          create: (exercises || []).map((ex: any, idx: number) => ({
            exerciseId: ex.exerciseId,
            order: idx + 1,
            targetSets: parseInt(ex.targetSets) || 3,
            repRange: ex.repRange || '8-12',
            targetRpe: ex.targetRpe ? parseFloat(ex.targetRpe) : 8.0,
            restSeconds: parseInt(ex.restSeconds) || 90,
            startingWeightKg: ex.startingWeightKg ? parseFloat(ex.startingWeightKg) : 0,
            notes: ex.notes || '',
          })),
        },
      },
      include: {
        exercises: {
          include: { exercise: true },
        },
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
