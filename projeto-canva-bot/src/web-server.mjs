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

app.get('/api/status', (_req, res) => {
  res.json({ running, lastLog });
});

app.post('/api/create', async (req, res) => {
  const tema = String(req.body?.tema || '').trim();
  if (!tema) return res.status(400).json({ message: 'Tema é obrigatório.' });
  if (running) return res.status(409).json({ message: 'Já existe um processo em execução.' });

  running = true;
  try {
    const out = await runNodeScript(['src/index.mjs', tema]);
    lastLog = out;
    return res.json({ ok: true, log: out });
  } catch (err) {
    lastLog = err.message;
    return res.status(500).json({ ok: false, message: err.message });
  } finally {
    running = false;
  }
});

app.post('/api/canva-auto', async (req, res) => {
  const payload = String(req.body?.payload || '').trim();
  const designUrl = String(req.body?.designUrl || '').trim();
  if (!payload || !designUrl) {
    return res.status(400).json({ message: 'payload e designUrl são obrigatórios.' });
  }
  if (running) return res.status(409).json({ message: 'Já existe um processo em execução.' });

  running = true;
  try {
    const out = await runNodeScript(['src/canva-auto.mjs', payload, designUrl]);
    lastLog = out;
    return res.json({ ok: true, log: out });
  } catch (err) {
    lastLog = err.message;
    return res.status(500).json({ ok: false, message: err.message });
  } finally {
    running = false;
  }
});

const port = process.env.PORT || 4177;
app.listen(port, () => {
  console.log(`Canva Bot Studio Web em http://localhost:${port}`);
});
