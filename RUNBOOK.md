# RUNBOOK - Clínica App (estável)

## Comando único (recomendado)
```bash
cd /home/vboxuser/.openclaw/workspace
./scripts/clinic-stable.sh start
```

## Quando houver alteração de código
```bash
cd /home/vboxuser/.openclaw/workspace
./scripts/clinic-stable.sh rebuild
```

## Status e parada
```bash
./scripts/clinic-stable.sh status
./scripts/clinic-stable.sh stop
```

## URLs
- Frontend: `http://10.0.2.15:5173`
- Backend API: `http://10.0.2.15:3000/api`

## Recuperação rápida (quedas 137/SIGKILL)
1. Executar: `./scripts/clinic-stable.sh start`
2. Confirmar portas 5173/3000 no retorno do script.
3. Fazer `Ctrl + F5` no navegador.
4. Repetir o teste na tela de Notificações.

## Seeds úteis
```bash
cd clinica-backend
npm run prisma:seed:demo
npm run prisma:seed:inventory
```

## Observação
No ambiente atual, priorizar `serve:stable` em execução contínua e usar `rebuild` só quando houver mudança de código. Isso reduz risco de queda durante uso com a usuária.
