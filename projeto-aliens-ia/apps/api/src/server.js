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
const dbPath = path.resolve(__dirname, '../../../data/processed/pautas.json');

const STATUS_OPT = ['NOVO', 'EM_ROTEIRO', 'PRONTO', 'PUBLICADO'];
const PRIORITY_OPT = ['A', 'M', 'B'];

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

function normalizePauta(item = {}) {
  return {
    id: item.id || randomUUID(),
    slug: String(item.slug || '').trim(),
    titulo: String(item.titulo || '').trim(),
    descricao: String(item.descricao || '').trim(),
    tags: Array.isArray(item.tags)
      ? item.tags.map((t) => String(t).trim()).filter(Boolean)
      : String(item.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
    status: STATUS_OPT.includes(item.status) ? item.status : 'NOVO',
    prioridade: PRIORITY_OPT.includes(item.prioridade) ? item.prioridade : 'M',
    horaPublicacao: String(item.horaPublicacao || ''),
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function ensureDbDir() {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

function savePautas(list) {
  ensureDbDir();
  fs.writeFileSync(dbPath, JSON.stringify(list, null, 2), 'utf-8');
}

function loadFromCsv() {
  if (!fs.existsSync(csvPath)) return [];
  const raw = fs.readFileSync(csvPath, 'utf-8').split(/\r?\n/).filter(Boolean);
  if (raw.length === 0) return [];
  const header = parseCsvLine(raw[0]);

  return raw.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    const row = {};
    header.forEach((h, i) => {
      row[h] = cols[i] ?? '';
    });

    return normalizePauta({
      id: row.id,
      slug: row.slug,
      titulo: row.titulo,
      descricao: row.descricao,
      tags: row.tags,
      status: row.status,
      prioridade: row.prioridade,
      horaPublicacao: row.horaPublicacao,
    });
  });
}

function loadPautas() {
  if (fs.existsSync(dbPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      if (Array.isArray(parsed)) return parsed.map((item) => normalizePauta(item));
    } catch {
      // fallback below
    }
  }

  const seeded = loadFromCsv();
  savePautas(seeded);
  return seeded;
}

let pautas = loadPautas();

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/api/pautas', (req, res) => {
  const q = String(req.query.q || '').toLowerCase().trim();
  const status = String(req.query.status || '').trim();
  const prioridade = String(req.query.prioridade || '').trim();

  const filtered = pautas.filter((p) => {
    const byQ = !q || `${p.titulo} ${p.descricao} ${p.tags.join(' ')}`.toLowerCase().includes(q);
    const byStatus = !status || p.status === status;
    const byPrioridade = !prioridade || p.prioridade === prioridade;
    return byQ && byStatus && byPrioridade;
  });

  res.json(filtered);
});

app.post('/api/pautas/import-csv', (req, res) => {
  const mode = req.body?.mode === 'replace' ? 'replace' : 'merge';
  const imported = loadFromCsv();

  if (mode === 'replace') {
    pautas = imported;
  } else {
    const existingBySlug = new Map(pautas.map((p) => [p.slug, p]));
    for (const item of imported) {
      if (item.slug && existingBySlug.has(item.slug)) continue;
      pautas.unshift(item);
    }
  }

  savePautas(pautas);
  res.json({ ok: true, mode, total: pautas.length });
});

app.patch('/api/pautas/:id', (req, res) => {
  const idx = pautas.findIndex((p) => String(p.id) === String(req.params.id));
  if (idx < 0) return res.status(404).json({ message: 'Pauta não encontrada' });

  pautas[idx] = normalizePauta({ ...pautas[idx], ...req.body, id: pautas[idx].id, createdAt: pautas[idx].createdAt });
  savePautas(pautas);
  res.json(pautas[idx]);
});

app.post('/api/pautas', (req, res) => {
  const next = normalizePauta(req.body);
  pautas.unshift(next);
  savePautas(pautas);
  res.status(201).json(next);
});

const port = process.env.PORT || 4010;
app.listen(port, () => {
  console.log(`Aliens IA API on :${port}`);
});
