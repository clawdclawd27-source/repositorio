# Projeto Aliens IA (base replicada)

Base montada a partir dos arquivos enviados:
- `data/raw/Eli_Rigobeli_IA___Historias_Aliens.json` (workflow n8n exportado)
- `data/raw/Publicações.xlsx` (planejamento de conteúdos)

## Estrutura
- `data/raw/` arquivos originais
- `data/processed/videos.csv` conteúdos extraídos da planilha (aba `videos`)
- `scripts/extract_xlsx_videos.py` extrator da planilha para CSV
- `docs/` espaço para definição do produto e automações

## Próximos passos sugeridos
1. Definir escopo do novo produto (ex.: gerador de roteiros, publicador, painel editorial).
2. Reaproveitar nós do workflow n8n para pipeline de produção.
3. Criar backend para CRUD de pautas e status.
4. Criar frontend para calendário/editor e fila de publicação.
