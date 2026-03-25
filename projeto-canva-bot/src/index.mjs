import fs from 'node:fs';
import path from 'node:path';
import dayjs from 'dayjs';

const tema = process.argv.slice(2).join(' ').trim();
if (!tema) {
  console.log('Uso: npm run criar -- "Tema do short"');
  process.exit(1);
}

const slug = tema
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')
  .slice(0, 60);

const now = dayjs().format('YYYY-MM-DD_HH-mm-ss');
const outDir = path.resolve('output', `${now}_${slug}`);
fs.mkdirSync(outDir, { recursive: true });

const cenas = [
  { id: 1, texto: `⚠️ ${tema}` },
  { id: 2, texto: 'Muita gente erra essa parte sem perceber.' },
  { id: 3, texto: 'Regra prática: observe sinalização + segurança da via.' },
  { id: 4, texto: 'Se tiver risco de bloqueio, não faça.' },
  { id: 5, texto: 'Salva esse vídeo pra revisar depois ✅' }
];

const roteiro = `# Roteiro - ${tema}\n\n` +
  `Formato: Short vertical (9:16), 20-30s\n\n` +
  cenas.map((c) => `## Cena ${c.id}\n${c.texto}\n`).join('\n') +
  `\n## Legenda\n${tema} explicado em poucos segundos.\n\n` +
  `## Hashtags\n#curiosidades #transito #shorts #viral\n`;

const canvaPayload = {
  projectName: `Short - ${tema}`,
  format: '1080x1920',
  templateHint: 'Template short educativo',
  scenes: cenas,
  style: {
    font: 'Montserrat',
    accent: '#7C3AED',
    bg: '#0F172A'
  }
};

fs.writeFileSync(path.join(outDir, 'roteiro.md'), roteiro, 'utf-8');
fs.writeFileSync(path.join(outDir, 'canva-fill.json'), JSON.stringify(canvaPayload, null, 2), 'utf-8');

const readme = `Projeto criado com sucesso.\n\nTema: ${tema}\nPasta: ${outDir}\n\nArquivos:\n- roteiro.md\n- canva-fill.json\n\nPróximo passo:\n1. Abrir seu template no Canva\n2. Preencher os textos das cenas usando canva-fill.json\n3. Exportar MP4\n`;
fs.writeFileSync(path.join(outDir, 'README.txt'), readme, 'utf-8');

console.log('✅ Estrutura criada em:', outDir);
console.log('📄 Roteiro:', path.join(outDir, 'roteiro.md'));
console.log('🎬 Payload Canva:', path.join(outDir, 'canva-fill.json'));
console.log('\nComando pronto: npm run criar -- "Seu tema aqui"');
