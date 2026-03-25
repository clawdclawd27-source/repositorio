import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const rootDir = path.resolve('.');
const themesPath = path.join(rootDir, 'data', 'themes-transito.json');
const statePath = path.join(rootDir, 'data', 'autopilot-state.json');
const reportPath = path.join(rootDir, 'output', 'autopilot-history.log');

const canvaTemplateUrl =
  process.env.CANVA_TEMPLATE_URL ||
  'https://www.canva.com/design/DAHEytnpdg0/IceBAAIpf94pDtkKLF8wnA/edit';

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return fallback;
  }
}

function runNode(args, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', args, {
      cwd: rootDir,
      env: { ...process.env, ...env },
    });

    let logs = '';
    child.stdout.on('data', (d) => (logs += d.toString()));
    child.stderr.on('data', (d) => (logs += d.toString()));

    child.on('close', (code) => {
      if (code === 0) resolve(logs);
      else reject(new Error(logs || `Falha ao executar ${args.join(' ')}`));
    });
  });
}

function chooseTheme(themes, lastTheme) {
  if (!themes.length) throw new Error('Lista de temas vazia.');
  const pool = themes.filter((t) => t !== lastTheme);
  const source = pool.length ? pool : themes;
  const idx = Math.floor(Math.random() * source.length);
  return source[idx];
}

function extractPayloadPath(log) {
  const m = log.match(/🎬 Payload Canva:\s(.+)/);
  return m?.[1]?.trim() || null;
}

async function main() {
  const themes = readJson(themesPath, []);
  const state = readJson(statePath, { lastTheme: null });

  const theme = chooseTheme(themes, state.lastTheme);
  const createLog = await runNode(['src/index.mjs', theme], { MAX_SECONDS: '11' });

  const payloadPath = extractPayloadPath(createLog);
  if (!payloadPath) throw new Error('Não achei caminho do canva-fill.json após criação.');

  const canvaLog = await runNode(['src/canva-auto.mjs', payloadPath, canvaTemplateUrl], {
    CANVA_HEADLESS: 'true',
  });

  fs.writeFileSync(statePath, JSON.stringify({ lastTheme: theme, updatedAt: new Date().toISOString() }, null, 2), 'utf-8');

  fs.mkdirSync(path.join(rootDir, 'output'), { recursive: true });
  const report = [
    `\n[${new Date().toISOString()}] AUTOPILOT OK`,
    `Tema: ${theme}`,
    `Template: ${canvaTemplateUrl}`,
    '--- CREATE LOG ---',
    createLog.trim(),
    '--- CANVA LOG ---',
    canvaLog.trim(),
    '-------------------',
  ].join('\n');
  fs.appendFileSync(reportPath, report + '\n', 'utf-8');

  console.log('✅ Autopilot executado com sucesso.');
  console.log('Tema:', theme);
  console.log('Relatório:', reportPath);
}

main().catch((err) => {
  const msg = `\n[${new Date().toISOString()}] AUTOPILOT ERROR\n${err.message}\n`;
  fs.mkdirSync(path.join(rootDir, 'output'), { recursive: true });
  fs.appendFileSync(reportPath, msg, 'utf-8');
  console.error('❌', err.message);
  process.exit(1);
});
