const FRONTEND_URL = 'https://jolly-bar-a403.clawdclawd27.workers.dev/';
const API_BASE = 'https://repositorio-production-6555.up.railway.app/api';
const HEALTH_URL = 'https://repositorio-production-6555.up.railway.app/health';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function requestJson(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch {}
  return { res, text, data };
}

async function main() {
  console.log('🔎 Validando frontend...');
  const frontend = await fetch(FRONTEND_URL);
  const html = await frontend.text();
  assert(frontend.ok, `Frontend fora do ar: ${frontend.status}`);
  assert(html.includes('Aliens IA - Painel'), 'Frontend sem título esperado');

  console.log('🔎 Validando healthcheck da API...');
  const health = await requestJson(HEALTH_URL);
  assert(health.res.ok, `Healthcheck falhou: ${health.res.status}`);
  assert(health.data?.ok === true, 'Healthcheck não retornou {ok:true}');

  const stamp = Date.now();
  const payload = {
    titulo: `Smoke ${stamp}`,
    descricao: 'Teste automatizado produção',
    tags: ['smoke', 'auto'],
    status: 'NOVO',
    prioridade: 'M'
  };

  console.log('🔎 Testando CRUD da API...');
  const created = await requestJson(`${API_BASE}/pautas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  assert(created.res.status === 201, `POST /pautas falhou: ${created.res.status}`);
  const id = created.data?.id;
  assert(id, 'POST /pautas não retornou id');

  const listed = await requestJson(`${API_BASE}/pautas?page=1&limit=50`);
  assert(listed.res.ok, `GET /pautas falhou: ${listed.res.status}`);
  assert(Array.isArray(listed.data?.data), 'GET /pautas sem lista válida');
  assert(listed.data.data.some((p) => p.id === id), 'Item criado não encontrado na listagem');

  const patched = await requestJson(`${API_BASE}/pautas/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titulo: `Smoke OK ${stamp}`, status: 'PRONTO' })
  });
  assert(patched.res.ok, `PATCH /pautas/:id falhou: ${patched.res.status}`);
  assert(patched.data?.titulo?.includes('Smoke OK'), 'PATCH não refletiu no título');

  const deleted = await fetch(`${API_BASE}/pautas/${id}`, { method: 'DELETE' });
  assert(deleted.status === 204, `DELETE /pautas/:id falhou: ${deleted.status}`);

  console.log('✅ Smoke test de produção concluído com sucesso.');
}

main().catch((err) => {
  console.error('❌ Smoke test falhou:', err.message);
  process.exit(1);
});
