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

## Próxima etapa (automação completa)
1. Conectar bot ao navegador logado no Canva
2. Abrir template automaticamente
3. Preencher caixas de texto a partir de `canva-fill.json`
4. Exportar MP4 e salvar no diretório `output`

## Observação
A automação do Canva depende de sessão logada e pode exigir ajuste fino quando o layout mudar.
