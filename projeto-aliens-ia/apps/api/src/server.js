import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const csvPath = path.resolve(__dirname, '../../../data/processed/videos.csv');

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQ = !inQ;
      }
    } else if (ch === ',' && !inQ) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function loadVideos() {
  if (!fs.existsSync(csvPath)) return [];
  const raw = fs.readFileSync(csvPath, 'utf-8').split(/\r?\n/).filter(Boolean);
  if (raw.length === 0) return [];
  const header = parseCsvLine(raw[0]);
  return raw.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    const item = {};
    header.forEach((h, i) => { item[h] = cols[i] ?? ''; });
    return {
      id: item.id || randomUUID(),
      slug: item.slug || '',
      titulo: item.titulo || '',
      descricao: item.descricao || '',
      tags: (item.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
      status: 'NOVO',
      prioridade: 'M',
      horaPublicacao: '',
    };
  });
}

let pautas = loadVideos();

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/api/pautas', (_req, res) => {
  res.json(pautas);
});

app.patch('/api/pautas/:id', (req, res) => {
  const idx = pautas.findIndex((p) => String(p.id) === String(req.params.id));
  if (idx < 0) return res.status(404).json({ message: 'Pauta não encontrada' });
  pautas[idx] = { ...pautas[idx], ...req.body };
  res.json(pautas[idx]);
});

app.post('/api/pautas', (req, res) => {
  const next = {
    id: randomUUID(),
    slug: req.body.slug || '',
    titulo: req.body.titulo || '',
    descricao: req.body.descricao || '',
    tags: Array.isArray(req.body.tags) ? req.body.tags : [],
    status: req.body.status || 'NOVO',
    prioridade: req.body.prioridade || 'M',
    horaPublicacao: req.body.horaPublicacao || '',
  };
  pautas.unshift(next);
  res.status(201).json(next);
});

const port = process.env.PORT || 4010;
app.listen(port, () => {
  console.log(`Aliens IA API on :${port}`);
});
