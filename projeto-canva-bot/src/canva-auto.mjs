import fs from 'node:fs';
import path from 'node:path';

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('Playwright não instalado. Rode: npm install');
  process.exit(1);
}

const payloadPath = process.argv[2];
const designUrl = process.argv[3];

if (!payloadPath || !designUrl) {
  console.log('Uso: npm run canva:auto -- "output/.../canva-fill.json" "URL_DO_DESIGN_CANVA"');
  process.exit(1);
}

const absPayload = path.resolve(payloadPath);
if (!fs.existsSync(absPayload)) {
  console.error('Arquivo não encontrado:', absPayload);
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(absPayload, 'utf-8'));
const scenes = Array.isArray(payload.scenes) ? payload.scenes : [];

if (!scenes.length) {
  console.error('Payload sem cenas.');
  process.exit(1);
}

const headless = String(process.env.CANVA_HEADLESS || 'true') === 'true';
const browser = await chromium.launch({ headless, slowMo: headless ? 0 : 120 });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

console.log('🌐 Abrindo Canva...');
await page.goto(designUrl, { waitUntil: 'domcontentloaded' });

if (!headless) {
  console.log('🔐 Se necessário, faça login no Canva na janela aberta.');
  await page.waitForTimeout(8000);
} else {
  console.log('ℹ️ Modo headless ativo. Tentando seguir automaticamente.');
  await page.waitForTimeout(2500);
}

for (const scene of scenes) {
  const token = `{{CENA_${scene.id}}}`;
  const texto = String(scene.texto || '').trim();
  if (!texto) continue;

  console.log(`✏️ Preenchendo ${token}...`);

  let replaced = false;

  // Tentativa 1: localizar placeholder exato na tela
  const placeholder = page.getByText(token, { exact: true }).first();
  if (await placeholder.isVisible().catch(() => false)) {
    await placeholder.click({ clickCount: 2 });
    await page.keyboard.press('Control+A');
    await page.keyboard.type(texto, { delay: 10 });
    replaced = true;
  }

  // Tentativa 2: fallback em textbox ativa
  if (!replaced) {
    const tb = page.locator('textarea, [contenteditable="true"]').first();
    if (await tb.isVisible().catch(() => false)) {
      await tb.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.type(texto, { delay: 10 });
      replaced = true;
    }
  }

  if (!replaced) {
    console.warn(`⚠️ Não consegui preencher ${token} automaticamente.`);
  }

  await page.waitForTimeout(600);
}

console.log('✅ Cenas processadas.');
console.log('👉 Próximo passo na mesma janela: Compartilhar > Baixar > MP4.');
console.log('ℹ️ Posso automatizar exportação na próxima fase.');

await page.waitForTimeout(5000);
await context.close();
await browser.close();
