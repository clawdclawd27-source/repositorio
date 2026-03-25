import fs from 'node:fs';
import path from 'node:path';
import dayjs from 'dayjs';

const tema = process.argv.slice(2).join(' ').trim();
if (!tema) {
  console.log('Uso: npm run criar -- "Tema do short"');
  process.exit(1);
}

const maxSeconds = Number(process.env.MAX_SECONDS || 11);

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
  { id: 1, duracao: 2, texto: `⚠️ ${tema}` },
  { id: 2, duracao: 3, texto: 'Isso acontece no dia a dia e pode virar acidente.' },
  { id: 3, duracao: 3, texto: 'Regra rápida: priorize segurança, sinalização e respeito.' },
  { id: 4, duracao: 3, texto: 'Dirija com consciência. Salva esse vídeo ✅' }
];

const total = cenas.reduce((acc, c) => acc + c.duracao, 0);

const roteiro = `# Roteiro - ${tema}\n\n` +
  `Formato: Short vertical (9:16), até ${maxSeconds}s\n` +
  `Duração planejada: ${total}s\n\n` +
  cenas.map((c) => `## Cena ${c.id} (${c.duracao}s)\n${c.texto}\n`).join('\n') +
  `\n## Narração (voz feminina IA)\n` +
  `Tom: direto, claro, ritmo rápido.\n` +
  `Locução: use uma voz feminina pt-BR no gerador de voz do Canva.\n\n` +
  `## Mídia mágica (sugestões por cena)\n` +
  `1) trânsito urbano, close no problema\n2) situação de risco realista\n3) demonstração da conduta correta\n4) fechamento educativo com CTA\n\n` +
  `## Legenda\n${tema} em ${total}s: objetivo e direto.\n\n` +
  `## Hashtags\n#transito #educacaonotransito #curiosidades #shorts\n`;

const canvaPayload = {
  projectName: `Short - ${tema}`,
  format: '1080x1920',
  maxSeconds,
  totalSeconds: total,
  templateHint: 'Template short educativo de trânsito',
  scenes: cenas,
  voice: {
    provider: 'canva-ai-voice',
    language: 'pt-BR',
    gender: 'female',
    style: 'dinamica'
  },
  magicMediaPrompts: cenas.map((c) => ({
    sceneId: c.id,
    prompt: `Vídeo vertical 9:16 de trânsito sobre: ${c.texto}. Estilo realista, iluminação natural.`
  })),
  style: {
    font: 'Montserrat',
    accent: '#7C3AED',
    bg: '#0F172A'
  }
};

fs.writeFileSync(path.join(outDir, 'roteiro.md'), roteiro, 'utf-8');
fs.writeFileSync(path.join(outDir, 'canva-fill.json'), JSON.stringify(canvaPayload, null, 2), 'utf-8');

const readme = `Projeto criado com sucesso.\n\nTema: ${tema}\nPasta: ${outDir}\nDuração alvo: ${total}s\n\nArquivos:\n- roteiro.md\n- canva-fill.json\n\nPróximo passo:\n1. Abrir template no Canva\n2. Aplicar textos/cenas\n3. Usar voz feminina IA\n4. Usar Mídia Mágica para cenas\n5. Exportar MP4\n`;
fs.writeFileSync(path.join(outDir, 'README.txt'), readme, 'utf-8');

console.log('✅ Estrutura criada em:', outDir);
console.log('📄 Roteiro:', path.join(outDir, 'roteiro.md'));
console.log('🎬 Payload Canva:', path.join(outDir, 'canva-fill.json'));
console.log(`⏱️ Duração planejada: ${total}s`);
console.log('\nComando pronto: npm run criar -- "Seu tema aqui"');
