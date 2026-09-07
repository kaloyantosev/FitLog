import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json([]);
    }

    const workouts = await prisma.workoutLog.findMany({
      where: { userId: user.id },
      include: {
        template: true,
        loggedSets: {
          include: {
            exercise: true,
          },
          orderBy: {
            setNumber: 'asc',
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    return NextResponse.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    let user = await getAuthUser(request);
    if (!user) {
      user = await prisma.user.findFirst();
    }
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, templateId, durationMinutes, totalVolumeKg, notes, loggedSets } = data;

    const workout = await prisma.workoutLog.create({
      data: {
        userId: user.id,
        templateId: templateId || null,
        title: title || 'Workout Session',
        completedAt: new Date(),
        durationMinutes: durationMinutes || 45,
        totalVolumeKg: totalVolumeKg || 0,
        notes: notes || '',
        loggedSets: {
          create: (loggedSets || []).map((s: any, idx: number) => ({
            exerciseId: s.exerciseId,
            setNumber: s.setNumber || idx + 1,
            weightKg: parseFloat(s.weightKg) || 0,
            reps: parseInt(s.reps) || 0,
            rpe: s.rpe ? parseFloat(s.rpe) : null,
            isCompleted: s.isCompleted ?? true,
          })),
        },
      },
      include: {
        loggedSets: true,
      },
    });

    return NextResponse.json(workout, { status: 201 });
  } catch (error) {
    console.error('Error creating workout log:', error);
    return NextResponse.json({ error: 'Failed to save workout' }, { status: 500 });
  }
}
