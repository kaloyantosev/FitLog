import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const template = await prisma.workoutTemplate.findUnique({
      where: { id: params.id },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { title, description, category, exercises } = data;

    // Delete existing template exercises and recreate
    await prisma.templateExercise.deleteMany({
      where: { templateId: params.id },
    });

    const updated = await prisma.workoutTemplate.update({
      where: { id: params.id },
      data: {
        title,
        description,
        category,
        exercises: {
          create: (exercises || []).map((ex: any, idx: number) => ({
            exerciseId: ex.exerciseId,
            order: idx + 1,
            targetSets: parseInt(ex.targetSets) || 3,
            repRange: ex.repRange || '8-12',
            targetRpe: ex.targetRpe ? parseFloat(ex.targetRpe) : 8.0,
            restSeconds: parseInt(ex.restSeconds) || 90,
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

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.workoutTemplate.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
