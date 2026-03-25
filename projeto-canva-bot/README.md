# Projeto Canva Bot (MVP)

MVP para gerar automaticamente estrutura de vídeo curto (roteiro + payload de preenchimento para Canva).

## Objetivo
Criar um comando único para iniciar vídeos:

```bash
npm run criar -- "Tema do vídeo"
```

Isso gera em `output/...`:
- `roteiro.md`
- `canva-fill.json`
- `README.txt`

## Instalação
```bash
cd projeto-canva-bot
npm install
```

## Uso
```bash
npm run criar -- "Fila dupla: pode ou não pode?"
```

## Automação Canva (fase 2 - preenchimento)
Com template pronto no Canva (recomendado com placeholders `{{CENA_1}}`, `{{CENA_2}}`...), rode:

```bash
npm run canva:auto -- "output/PASTA_DO_VIDEO/canva-fill.json" "URL_DO_DESIGN_CANVA"
```

O bot abre o Canva, tenta localizar cada placeholder e substituir pelos textos do payload.

## Próxima etapa (fase 3)
1. Automatizar exportação (MP4)
2. Salvar arquivo final em `output/...`
3. Opcional: publicar em plataformas

## Observação
A automação do Canva depende de sessão logada e pode exigir ajuste fino quando o layout mudar.
