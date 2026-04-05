import { NextRequest, NextResponse } from 'next/server';
import { getCustomProgram, saveCustomProgram } from '@/lib/server/fileDb';

export async function GET() {
  const program = getCustomProgram();
  return NextResponse.json({ program });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  saveCustomProgram(body);
  return NextResponse.json({ ok: true });
}
