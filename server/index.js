import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const DIST_DIR = path.join(__dirname, '..', 'dist');
const PORT = parseInt(process.env.PORT || '3000', 10);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readJson(filename, fallback) {
  ensureDir(DATA_DIR);
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) return fallback;
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

function writeJson(filename, data) {
  ensureDir(DATA_DIR);
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf-8');
}

const app = new Hono();
app.use('/api/*', cors());

// === API: Sync ===
app.get('/api/sync', (c) => {
  return c.json({
    entries: readJson('entries.json', {}),
    setLogs: readJson('setlogs.json', {}),
    customProgram: readJson('program.json', null),
    lastSync: new Date().toISOString(),
  });
});

app.post('/api/sync', async (c) => {
  const body = await c.req.json();
  if (body.entries && Object.keys(body.entries).length > 0) {
    const existing = readJson('entries.json', {});
    writeJson('entries.json', { ...existing, ...body.entries });
  }
  if (body.setLogs && Object.keys(body.setLogs).length > 0) {
    const existing = readJson('setlogs.json', {});
    writeJson('setlogs.json', { ...existing, ...body.setLogs });
  }
  if (body.customProgram) {
    writeJson('program.json', body.customProgram);
  }
  return c.json({
    entries: readJson('entries.json', {}),
    setLogs: readJson('setlogs.json', {}),
    customProgram: readJson('program.json', null),
    lastSync: new Date().toISOString(),
  });
});

// === API: Programs ===
app.get('/api/programs', (c) => c.json({ program: readJson('program.json', null) }));
app.post('/api/programs', async (c) => {
  writeJson('program.json', await c.req.json());
  return c.json({ ok: true });
});

// === API: Share ===
app.post('/api/share', async (c) => {
  const { id, markdown } = await c.req.json();
  if (!id || !markdown) return c.json({ error: 'Missing id or markdown' }, 400);
  ensureDir(path.join(DATA_DIR, 'shares'));
  fs.writeFileSync(path.join(DATA_DIR, 'shares', `${id}.md`), markdown, 'utf-8');
  return c.json({ ok: true, url: `/share/${id}` });
});

app.get('/api/share', (c) => {
  const id = c.req.query('id');
  if (!id) return c.json({ error: 'Missing id' }, 400);
  const filepath = path.join(DATA_DIR, 'shares', `${id}.md`);
  if (!fs.existsSync(filepath)) return c.json({ error: 'Not found' }, 404);
  return c.json({ id, markdown: fs.readFileSync(filepath, 'utf-8') });
});

// === Static files (Vite build output) ===
app.use('/*', serveStatic({ root: './dist' }));

// SPA fallback — serve index.html for all non-API, non-static routes
app.get('*', (c) => {
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    return c.html(fs.readFileSync(indexPath, 'utf-8'));
  }
  return c.text('Not found', 404);
});

console.log(`Recomp Tracker running on http://localhost:${PORT}`);
serve({ fetch: app.fetch, port: PORT });
