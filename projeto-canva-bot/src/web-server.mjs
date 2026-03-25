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
const historyDbPath = path.join(dataDir, 'history.json');
const usersDbPath = path.join(dataDir, 'users.json');

fs.mkdirSync(dataDir, { recursive: true });

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function loadProjects() {
  const parsed = readJson(projectsDbPath, []);
  return Array.isArray(parsed) ? parsed : [];
}

function saveProjects(list) {
  writeJson(projectsDbPath, list);
}

function loadHistory() {
  const parsed = readJson(historyDbPath, []);
  return Array.isArray(parsed) ? parsed : [];
}

function saveHistory(list) {
  writeJson(historyDbPath, list);
}

function loadUsers() {
  const parsed = readJson(usersDbPath, null);
  if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
    const seed = [{ id: randomUUID(), user: 'admin', pass: 'admin123', role: 'admin', createdAt: new Date().toISOString() }];
    writeJson(usersDbPath, seed);
    return seed;
  }
  return parsed;
}

function saveUsers(list) {
  writeJson(usersDbPath, list);
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let running = false;
let lastLog = 'Sistema pronto.';
const queue = [];
let history = loadHistory();
let projects = loadProjects();
let users = loadUsers();
const sessions = new Map(); // token -> {id,user,role}

function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '').trim();
  if (!token || !sessions.has(token)) return res.status(401).json({ message: 'Não autenticado.' });
  req.session = sessions.get(token);
  next();
}

function requireAdmin(req, res, next) {
  if (req.session?.role !== 'admin') return res.status(403).json({ message: 'Acesso restrito para admin.' });
  next();
}

function addHistory(item) {
  history.unshift({ id: randomUUID(), at: new Date().toISOString(), ...item });
  if (history.length > 300) history.pop();
  saveHistory(history);
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

function extractPayloadPathFromCreateLog(logText = '') {
  const m = logText.match(/🎬 Payload Canva:\s(.+)/);
  return m?.[1]?.trim() || null;
}

async function processNext() {
  if (running || queue.length === 0) return;
  const job = queue.shift();
  running = true;

  try {
    if (job.type === 'one-click') {
      const outCreate = await runNodeScript(['src/index.mjs', job.input.tema]);
      const payloadPath = extractPayloadPathFromCreateLog(outCreate);
      if (!payloadPath) throw new Error('Não foi possível identificar o canva-fill.json no log de criação.');

      const outCanva = await runNodeScript(['src/canva-auto.mjs', payloadPath, job.input.designUrl]);
      const exportMsg = `Exportação sugerida: ${job.input.outputName || `video-${Date.now()}.mp4`}`;
      const comboLog = `${outCreate}\n\n${outCanva}\n\n${exportMsg}`;

      lastLog = comboLog;
      addHistory({
        type: 'one-click',
        status: 'ok',
        projectId: job.projectId || null,
        by: job.by,
        input: job.input,
        log: comboLog.slice(0, 1200),
      });
      addHistory({
        type: 'export',
        status: 'pendente-manual',
        projectId: job.projectId || null,
        by: job.by,
        input: { outputName: job.input.outputName || `video-${Date.now()}.mp4` },
        log: 'Use Canva: Compartilhar > Baixar > MP4 para finalizar o vídeo.',
      });
    } else {
      const out = await runNodeScript(job.args);
      lastLog = out;
      addHistory({ type: job.type, status: 'ok', projectId: job.projectId || null, by: job.by, input: job.input, log: out.slice(0, 1200) });
    }
  } catch (err) {
    lastLog = err.message;
    addHistory({ type: job.type, status: 'erro', projectId: job.projectId || null, by: job.by, input: job.input, log: err.message.slice(0, 1200) });
  } finally {
    running = false;
    setTimeout(processNext, 50);
  }
}

app.post('/api/login', (req, res) => {
  const user = String(req.body?.user || '').trim();
  const pass = String(req.body?.pass || '').trim();
  const found = users.find((u) => u.user === user && u.pass === pass);
  if (!found) return res.status(401).json({ message: 'Usuário ou senha inválidos.' });

  const token = randomUUID();
  const session = { id: found.id, user: found.user, role: found.role };
  sessions.set(token, session);
  return res.json({ ok: true, token, session });
});

app.get('/api/me', auth, (req, res) => res.json({ ok: true, session: req.session }));

app.get('/api/users', auth, requireAdmin, (_req, res) => {
  res.json({ data: users.map(({ pass, ...u }) => u) });
});

app.post('/api/users', auth, requireAdmin, (req, res) => {
  const user = String(req.body?.user || '').trim();
  const pass = String(req.body?.pass || '').trim();
  const role = String(req.body?.role || 'editor').trim();
  if (!user || !pass) return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
  if (!['admin', 'editor'].includes(role)) return res.status(400).json({ message: 'Role inválido.' });
  if (users.some((u) => u.user === user)) return res.status(409).json({ message: 'Usuário já existe.' });

  const next = { id: randomUUID(), user, pass, role, createdAt: new Date().toISOString() };
  users.unshift(next);
  saveUsers(users);
  const { pass: _, ...safe } = next;
  res.status(201).json(safe);
});

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

  queue.push({ type: 'create', by: req.session.user, projectId, input: { tema }, args: ['src/index.mjs', tema] });
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
    by: req.session.user,
    projectId,
    input: { payload, designUrl },
    args: ['src/canva-auto.mjs', payload, designUrl],
  });
  processNext();
  return res.json({ ok: true, queued: queue.length, message: 'Job de automação enfileirado.' });
});

app.post('/api/one-click', auth, (req, res) => {
  const tema = String(req.body?.tema || '').trim();
  const designUrl = String(req.body?.designUrl || '').trim();
  const outputName = String(req.body?.outputName || '').trim();
  const projectId = String(req.body?.projectId || '').trim() || null;

  if (!tema || !designUrl) return res.status(400).json({ message: 'Tema e URL do Canva são obrigatórios.' });

  queue.push({
    type: 'one-click',
    by: req.session.user,
    projectId,
    input: { tema, designUrl, outputName },
  });
  processNext();
  return res.json({ ok: true, queued: queue.length, message: 'Fluxo 1-clique enfileirado.' });
});

app.post('/api/export', auth, (req, res) => {
  const outputName = String(req.body?.outputName || '').trim() || `video-${Date.now()}.mp4`;
  const projectId = String(req.body?.projectId || '').trim() || null;
  addHistory({
    type: 'export',
    by: req.session.user,
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
  console.log('Usuário padrão: admin / admin123');
});
