# Projeto Aliens IA (base replicada)

Base montada a partir dos arquivos enviados:
- `data/raw/Eli_Rigobeli_IA___Historias_Aliens.json` (workflow n8n exportado)
- `data/raw/Publicações.xlsx` (planejamento de conteúdos)

## Estrutura
- `apps/api` API Express (CRUD + filtros + analytics)
- `apps/web` painel React/Vite
- `data/raw/` arquivos originais
- `data/processed/videos.csv` conteúdos extraídos da planilha (aba `videos`)
- `data/processed/pautas.json` base persistida da API
- `scripts/extract_xlsx_videos.py` extrator da planilha para CSV
- `docs/` espaço para definição do produto e automações

## Rodar local

### API
```bash
cd apps/api
npm ci
npm run dev
```
API em `http://localhost:4010`

### WEB
```bash
cd apps/web
npm ci
npm run dev
```
Painel em `http://localhost:5179`

## Endpoints principais
- `GET /health`
- `GET /api/pautas?q=&status=&prioridade=&page=&limit=`
- `GET /api/pautas/analytics?q=&status=&prioridade=`
- `POST /api/pautas`
- `PATCH /api/pautas/:id`
- `DELETE /api/pautas/:id`
- `POST /api/pautas/import-csv` com body `{ "mode": "merge" | "replace" }`

## Deploy (preparado)

### Backend (Railway)
- Arquivo pronto: `apps/api/railway.json`
- Start command: `npm start`
- Healthcheck: `/health`
- Variável recomendada: `PORT` (Railway já injeta automaticamente)

### Frontend (Cloudflare Pages)
- Arquivo pronto: `apps/web/wrangler.toml`
- Build command: `npm ci && npm run build`
- Output dir: `dist`
- Framework preset: Vite

## Próximos passos sugeridos
1. Adicionar autenticação no painel.
2. Adicionar histórico/auditoria de alterações por pauta.
3. Integrar com n8n para publicar automaticamente conforme status/hora.
