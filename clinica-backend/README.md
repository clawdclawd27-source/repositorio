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
npm run prisma:seed
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
- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `GET /api/birthdays?month=2`
- `GET /api/finance/entries`
- `POST /api/finance/entries`
- `PATCH /api/finance/entries/:id`
- `GET /api/finance/summary`
- `GET /api/inventory/items`
- `POST /api/inventory/items`
- `PATCH /api/inventory/items/:id`
- `GET /api/inventory/movements`
- `POST /api/inventory/movements`
- `GET /api/inventory/low-stock`
- `POST /api/notifications/test-whatsapp`
- `POST /api/notifications/run-appointments`
- `POST /api/notifications/run-birthdays`
- `GET /api/notifications/logs`
- `GET /api/settings/notifications`
- `PUT /api/settings/notifications`
- `GET /api/reports/financial?from=2026-02-01&to=2026-02-28`
- `GET /api/reports/appointments?from=2026-02-01&to=2026-02-28`
- `GET /api/reports/referrals?from=2026-02-01&to=2026-02-28`
- `GET /api/reports/inventory`
- `GET /api/audit-logs`

### Admin
- `GET /api/permissions`
- `POST /api/permissions` (configuração granular do OWNER por módulo)
- `POST /api/permissions/reset-defaults` (restaura padrão)
- `GET /api/permissions/default-json` (preset JSON para import/config)
- `POST /api/permissions/import-json` (aplica permissões em lote)

### Cliente (portal)
- `GET /api/portal/me`
- `GET /api/portal/appointments`
- `GET /api/portal/referrals`

## Observações
- RBAC por perfil (ADMIN, OWNER, CLIENT)
- Permissão granular por módulo/ação para OWNER via `role_permissions`
- Auditoria automática nas ações principais
