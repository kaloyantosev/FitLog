import { NextResponse } from 'next/server';
import { searchFoods, BULGARIAN_AND_GLOBAL_FOODS } from '@/lib/foodDatabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const results = searchFoods(query);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching food database:', error);
    return NextResponse.json({ error: 'Failed to search foods' }, { status: 500 });
  }
}
