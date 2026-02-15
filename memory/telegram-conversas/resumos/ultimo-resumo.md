# Resumo diário — conversas Telegram

Data/hora da coleta: 2026-02-15 12:00 (America/Sao_Paulo)
Sessão analisada: `agent:main:main` (origem Telegram `telegram:8004185123`)

## Principais decisões
- Foi confirmado que o endpoint correto para teste de WhatsApp no backend é `POST /api/notifications/test-whatsapp`.
- O erro 500 foi diagnosticado: causa raiz é ausência de variáveis no ambiente (`WHATSAPP_TOKEN` e `WHATSAPP_PHONE_NUMBER_ID`).
- Direção definida: primeiro ajustar variáveis no Railway e, em paralelo, avançar na Meta para gerar token permanente + obter Phone Number ID.

## Tarefas abertas
- No Railway (serviço backend), configurar/validar:
  - `WHATSAPP_TOKEN`
  - `WHATSAPP_PHONE_NUMBER_ID`
  - `WHATSAPP_API_VERSION` (`v22.0`, recomendado)
- Fazer redeploy do backend após salvar variáveis.
- Na Meta, concluir geração do token permanente (System User token com permissões de WhatsApp) e copiar o Phone Number ID.
- Reexecutar teste de notificação e validar envio nos logs (`/api/notifications/logs`).

## Preferências do usuário observadas
- Prefere execução guiada “mão na massa” em painéis externos (Meta/Railway), com o agente navegando quando possível.
- Mantém comunicação objetiva e de baixa fricção (confirmações curtas como “Pronto” e continuidade imediata).
- Valoriza diagnóstico técnico com causa raiz explícita e próximos passos diretos para destravar rápido.