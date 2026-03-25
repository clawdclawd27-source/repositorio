import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let running = false;
let lastLog = 'Sistema pronto.';
const queue = [];
const history = [];

function addHistory(item) {
  history.unshift({ id: Date.now() + Math.random(), at: new Date().toISOString(), ...item });
  if (history.length > 50) history.pop();
}

function runNodeScript(args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', args, { cwd: path.resolve(__dirname, '..') });
    let logs = '';

    child.stdout.on('data', (d) => {
      logs += d.toString();
    });
    child.stderr.on('data', (d) => {
      logs += d.toString();
    });

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
    addHistory({ type: job.type, status: 'ok', input: job.input, log: out.slice(0, 1200) });
  } catch (err) {
    lastLog = err.message;
    addHistory({ type: job.type, status: 'erro', input: job.input, log: err.message.slice(0, 1200) });
  } finally {
    running = false;
    setTimeout(processNext, 50);
  }
}

app.get('/api/status', (_req, res) => {
  res.json({ running, queued: queue.length, lastLog, history });
});

app.post('/api/create', (req, res) => {
  const tema = String(req.body?.tema || '').trim();
  if (!tema) return res.status(400).json({ message: 'Tema é obrigatório.' });

  queue.push({
    type: 'create',
    input: { tema },
    args: ['src/index.mjs', tema],
  });
  processNext();
  return res.json({ ok: true, queued: queue.length, message: 'Job de criação enfileirado.' });
});

app.post('/api/canva-auto', (req, res) => {
  const payload = String(req.body?.payload || '').trim();
  const designUrl = String(req.body?.designUrl || '').trim();
  if (!payload || !designUrl) {
    return res.status(400).json({ message: 'payload e designUrl são obrigatórios.' });
  }

  queue.push({
    type: 'canva-auto',
    input: { payload, designUrl },
    args: ['src/canva-auto.mjs', payload, designUrl],
  });
  processNext();
  return res.json({ ok: true, queued: queue.length, message: 'Job de automação enfileirado.' });
});

app.post('/api/export', (req, res) => {
  const outputName = String(req.body?.outputName || '').trim() || `video-${Date.now()}.mp4`;
  addHistory({
    type: 'export',
    status: 'pendente-manual',
    input: { outputName },
    log: 'Exportação automática ainda em fase beta. Use Canva: Compartilhar > Baixar > MP4. Nome sugerido: ' + outputName,
  });
  return res.json({
    ok: true,
    message: 'Exportação registrada no histórico. Próxima fase: exportação 100% automática no Canva.',
  });
});

const port = process.env.PORT || 4177;
app.listen(port, () => {
  console.log(`Canva Bot Studio Web em http://localhost:${port}`);
});
