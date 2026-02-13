# Clínica Backend (NestJS + Prisma)

API inicial para sistema de gestão da clínica de estética.

## Módulos implementados
- Auth (register/login com JWT)
- Users (service)
- Clients (CRUD básico)
- Referrals (cadastro + atualização de status)
- Audit Logs (histórico global)

## Requisitos
- Node 20+
- PostgreSQL

## Setup
```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```

API base: `http://localhost:3000/api`

## Endpoints principais
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/clients`
- `POST /api/clients`
- `PATCH /api/clients/:id`
- `GET /api/referrals`
- `POST /api/referrals`
- `PATCH /api/referrals/:id/status`
- `GET /api/audit-logs`

## Observações
- RBAC por perfil (ADMIN, OWNER, CLIENT)
- Auditoria automática nas ações de clientes/indicações
- Próximo passo: agenda, serviços, financeiro e permissões granulares por módulo para OWNER
