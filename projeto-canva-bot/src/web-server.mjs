import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'data');
const projectsDbPath = path.join(dataDir, 'projects.json');

fs.mkdirSync(dataDir, { recursive: true });

function loadProjects() {
  if (!fs.existsSync(projectsDbPath)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(projectsDbPath, 'utf-8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveProjects(list) {
  fs.writeFileSync(projectsDbPath, JSON.stringify(list, null, 2), 'utf-8');
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let running = false;
let lastLog = 'Sistema pronto.';
const queue = [];
const history = [];
let projects = loadProjects();

const AUTH_USER = process.env.CANVA_BOT_USER || 'admin';
const AUTH_PASS = process.env.CANVA_BOT_PASS || 'admin123';
const sessions = new Set();

function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '').trim();
  if (!token || !sessions.has(token)) return res.status(401).json({ message: 'Não autenticado.' });
  next();
}

function addHistory(item) {
  history.unshift({ id: randomUUID(), at: new Date().toISOString(), ...item });
  if (history.length > 120) history.pop();
}

function runNodeScript(args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', args, { cwd: rootDir });
    let logs = '';

    child.stdout.on('data', (d) => { logs += d.toString(); });
    child.stderr.on('data', (d) => { logs += d.toString(); });

    child.on('close', (code) => {
      if (code === 0) resolve(logs || 'OK');
      else reject(new Error(logs || `Falha no script (${code})`));
    });
  });
}

async function processNext() {
  if (running || queue.length === 0) return;
  const job = queue.shift();
  running = true;

  try {
    const out = await runNodeScript(job.args);
    lastLog = out;
    addHistory({ type: job.type, status: 'ok', projectId: job.projectId || null, input: job.input, log: out.slice(0, 1200) });
  } catch (err) {
    lastLog = err.message;
    addHistory({ type: job.type, status: 'erro', projectId: job.projectId || null, input: job.input, log: err.message.slice(0, 1200) });
  } finally {
    running = false;
    setTimeout(processNext, 50);
  }
}

app.post('/api/login', (req, res) => {
  const user = String(req.body?.user || '').trim();
  const pass = String(req.body?.pass || '').trim();
  if (user !== AUTH_USER || pass !== AUTH_PASS) return res.status(401).json({ message: 'Usuário ou senha inválidos.' });

  const token = randomUUID();
  sessions.add(token);
  return res.json({ ok: true, token, user });
});

app.get('/api/me', auth, (_req, res) => res.json({ ok: true }));

app.get('/api/status', auth, (_req, res) => {
  const projectCount = projects.length;
  const jobsDone = history.filter((h) => h.status === 'ok').length;
  const jobsFailed = history.filter((h) => h.status === 'erro').length;

  res.json({
    running,
    queued: queue.length,
    lastLog,
    history,
    kpis: { projectCount, jobsDone, jobsFailed },
  });
});

app.get('/api/projects', auth, (_req, res) => {
  res.json({ data: projects });
});

app.post('/api/projects', auth, (req, res) => {
  const name = String(req.body?.name || '').trim();
  const client = String(req.body?.client || '').trim();
  if (!name) return res.status(400).json({ message: 'Nome do projeto é obrigatório.' });

  const project = {
    id: randomUUID(),
    name,
    client,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  projects.unshift(project);
  saveProjects(projects);
  res.status(201).json(project);
});

app.post('/api/create', auth, (req, res) => {
  const tema = String(req.body?.tema || '').trim();
  const projectId = String(req.body?.projectId || '').trim() || null;
  if (!tema) return res.status(400).json({ message: 'Tema é obrigatório.' });

  queue.push({ type: 'create', projectId, input: { tema }, args: ['src/index.mjs', tema] });
  processNext();
  return res.json({ ok: true, queued: queue.length, message: 'Job de criação enfileirado.' });
});

app.post('/api/canva-auto', auth, (req, res) => {
  const payload = String(req.body?.payload || '').trim();
  const designUrl = String(req.body?.designUrl || '').trim();
  const projectId = String(req.body?.projectId || '').trim() || null;
  if (!payload || !designUrl) return res.status(400).json({ message: 'payload e designUrl são obrigatórios.' });

  queue.push({
    type: 'canva-auto',
    projectId,
    input: { payload, designUrl },
    args: ['src/canva-auto.mjs', payload, designUrl],
  });
  processNext();
  return res.json({ ok: true, queued: queue.length, message: 'Job de automação enfileirado.' });
});

app.post('/api/export', auth, (req, res) => {
  const outputName = String(req.body?.outputName || '').trim() || `video-${Date.now()}.mp4`;
  const projectId = String(req.body?.projectId || '').trim() || null;
  addHistory({
    type: 'export',
    projectId,
    status: 'pendente-manual',
    input: { outputName },
    log: 'Exportação automática ainda em fase beta. Use Canva: Compartilhar > Baixar > MP4. Nome sugerido: ' + outputName,
  });
  return res.json({ ok: true, message: 'Exportação registrada no histórico.' });
});

const port = process.env.PORT || 4177;
app.listen(port, () => {
  console.log(`Canva Bot Studio Web em http://localhost:${port}`);
  console.log(`Login padrão: ${AUTH_USER} / ${AUTH_PASS}`);
});
