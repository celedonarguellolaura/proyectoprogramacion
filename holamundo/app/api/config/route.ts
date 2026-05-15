import { NextResponse } from 'next/server';
import { readAppConfig } from '@/lib/dataService';

export async function GET() {
  try {
    const data = readAppConfig();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error leyendo config.json';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
