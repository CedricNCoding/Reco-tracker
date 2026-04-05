import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const SHARES_DIR = path.join(DATA_DIR, 'shares');

function ensureDir() {
  if (!fs.existsSync(SHARES_DIR)) fs.mkdirSync(SHARES_DIR, { recursive: true });
}

// POST — save a shared bilan
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { id, markdown } = body;

  if (!id || !markdown) {
    return NextResponse.json({ error: 'Missing id or markdown' }, { status: 400 });
  }

  ensureDir();
  const filepath = path.join(SHARES_DIR, `${id}.md`);
  fs.writeFileSync(filepath, markdown, 'utf-8');

  return NextResponse.json({ ok: true, url: `/share/${id}` });
}

// GET — read a shared bilan
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  ensureDir();
  const filepath = path.join(SHARES_DIR, `${id}.md`);
  if (!fs.existsSync(filepath)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const markdown = fs.readFileSync(filepath, 'utf-8');
  return NextResponse.json({ id, markdown });
}
