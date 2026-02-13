# Telegram Conversas

Esta pasta foi preparada para centralizar seu histórico de conversas.

## Estrutura

- `raw/sessoes-openclaw` → atalho (symlink) para as transcrições reais do OpenClaw:
  - `/home/vboxuser/.openclaw/agents/main/sessions`
- `resumos/ultimo-resumo.md` → resumo periódico com decisões, tarefas e contexto útil.

## Observações

- As transcrições aparecem automaticamente conforme você conversa (web/telegram/outros canais).
- Conversas do Telegram surgem quando houver mensagens no bot já pareado.
- Foi criado um cron de resumo a cada 6 horas para manter memória útil sem você repetir contexto.
