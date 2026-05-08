import { NextResponse } from 'next/server';
import { readHomeData } from '@/lib/dataService';

export async function GET() {
  try {
    const data = readHomeData();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error leyendo home.json';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
