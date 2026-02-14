# RUNBOOK - Clínica App (estável)

## Subir backend (estável)
```bash
cd clinica-backend
npm run start:stable
```

## Subir frontend (estável)
```bash
cd clinica-web
npm run start:stable
```

## URLs
- Frontend: `http://10.0.2.15:5173`
- Backend API: `http://10.0.2.15:3000/api`

## Seeds úteis
```bash
cd clinica-backend
npm run prisma:seed:demo
npm run prisma:seed:inventory
```

## Observação
Para evitar quedas de sessão durante desenvolvimento, priorizar `start:stable` (build + execução) ao invés de `dev` contínuo quando estiver em validação com a usuária.
