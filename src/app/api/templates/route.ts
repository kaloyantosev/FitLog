import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    const whereClause = user
      ? { OR: [{ userId: user.id }, { isDefault: true }, { userId: null }] }
      : { OR: [{ isDefault: true }, { userId: null }] };

    const templates = await prisma.workoutTemplate.findMany({
      where: whereClause,
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
    const user = await getAuthUser(request);
    const data = await request.json();
    const { title, description, category, exercises, estimatedDurationMinutes } = data;

    const template = await prisma.workoutTemplate.create({
      data: {
        userId: user ? user.id : undefined,
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

export async function DELETE(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Не сте автентикиран' }, { status: 401 });
    }

    const userTemplates = await prisma.workoutTemplate.findMany({
      where: { userId: user.id },
      select: { id: true },
    });
    const ids = userTemplates.map(t => t.id);
    if (ids.length > 0) {
      await prisma.templateExercise.deleteMany({
        where: { templateId: { in: ids } },
      });
      await prisma.workoutTemplate.deleteMany({
        where: { id: { in: ids } },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting templates:', error);
    return NextResponse.json({ error: 'Failed to delete templates' }, { status: 500 });
  }
}
