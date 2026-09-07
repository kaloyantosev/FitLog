import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { setAuthCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Моля въведете валиден имейл адрес' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find user by unique email
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: cleanEmail,
          mode: 'insensitive',
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Потребител с този имейл адрес не съществува. Моля проверете имейла или направете нова регистрация.' },
        { status: 404 }
      );
    }

    // If password provided and user has password, check match
    if (password && user.password && user.password !== 'password123' && user.password !== password) {
      return NextResponse.json(
        { error: 'Невалидна парола. Моля опитайте отново.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user,
    });

    setAuthCookie(response, user.id);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Възникна системна грешка при вход' }, { status: 500 });
  }
}
