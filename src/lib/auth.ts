import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const AUTH_COOKIE_NAME = 'fitlog_user_id';

export async function getAuthUser(request?: Request) {
  try {
    let userId: string | undefined;

    try {
      const cookieStore = cookies();
      userId = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    } catch {}

    if (!userId && request) {
      const cookieHeader = request.headers.get('cookie') || '';
      const match = cookieHeader.match(new RegExp('(?:^|; )' + AUTH_COOKIE_NAME + '=([^;]*)'));
      if (match) {
        userId = decodeURIComponent(match[1]);
      }

      if (!userId) {
        userId = request.headers.get('x-user-id') || undefined;
      }

      if (!userId) {
        const url = new URL(request.url);
        const emailParam = url.searchParams.get('email') || request.headers.get('x-user-email');
        if (emailParam) {
          const userByEmail = await prisma.user.findUnique({
            where: { email: emailParam.trim().toLowerCase() },
          });
          if (userByEmail) return userByEmail;
        }
      }
    }

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (user) return user;
    }

    return null;
  } catch (error) {
    console.error('getAuthUser error:', error);
    return null;
  }
}

export function setAuthCookie(response: NextResponse, userId: string) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: userId,
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    httpOnly: false,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    path: '/',
    maxAge: 0,
  });
}
