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

### Admin/Owner
- `GET /api/clients`
- `POST /api/clients`
- `PATCH /api/clients/:id`
- `GET /api/services`
- `POST /api/services`
- `PATCH /api/services/:id`
- `GET /api/appointments`
- `POST /api/appointments`
- `PATCH /api/appointments/:id/status`
- `GET /api/referrals`
- `POST /api/referrals`
- `PATCH /api/referrals/:id/status`
- `GET /api/audit-logs`

### Admin
- `GET /api/permissions`
- `POST /api/permissions` (configuração granular do OWNER por módulo)

### Cliente (portal)
- `GET /api/portal/me`
- `GET /api/portal/appointments`
- `GET /api/portal/referrals`

## Observações
- RBAC por perfil (ADMIN, OWNER, CLIENT)
- Permissão granular por módulo/ação para OWNER via `role_permissions`
- Auditoria automática nas ações principais
