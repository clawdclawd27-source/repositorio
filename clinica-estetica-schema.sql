-- Sistema de Gestão para Clínica de Estética
-- Modelagem inicial (PostgreSQL)
-- Autor: Jonas

-- Extensões úteis
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- para gen_random_uuid()

-- =========================
-- ENUMS
-- =========================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'OWNER', 'CLIENT');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
    CREATE TYPE appointment_status AS ENUM ('SCHEDULED', 'CONFIRMED', 'CANCELLED', 'DONE', 'NO_SHOW');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'referral_status') THEN
    CREATE TYPE referral_status AS ENUM ('NEW', 'CONTACTED', 'CONVERTED', 'LOST');
  END IF;
END $$;

-- =========================
-- TABELAS DE ACESSO
-- =========================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) UNIQUE,
  phone VARCHAR(30),
  password_hash TEXT NOT NULL,
  role user_role NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Permissões futuras por módulo/ação (principalmente para OWNER)
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL,
  module_key VARCHAR(80) NOT NULL,
  can_view BOOLEAN NOT NULL DEFAULT FALSE,
  can_create BOOLEAN NOT NULL DEFAULT FALSE,
  can_edit BOOLEAN NOT NULL DEFAULT FALSE,
  can_delete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(role, module_key)
);

-- =========================
-- CLIENTES
-- =========================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(160) NOT NULL,
  cpf VARCHAR(14),
  birth_date DATE,
  email VARCHAR(180),
  phone VARCHAR(30),
  emergency_contact VARCHAR(160),
  allergies TEXT,
  contraindications TEXT,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(full_name);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);

-- =========================
-- SERVIÇOS / PROCEDIMENTOS
-- =========================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(140) NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  base_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================
-- AGENDA
-- =========================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id),
  service_id UUID NOT NULL REFERENCES services(id),
  professional_id UUID REFERENCES users(id),
  starts_at TIMESTAMP NOT NULL,
  ends_at TIMESTAMP NOT NULL,
  status appointment_status NOT NULL DEFAULT 'SCHEDULED',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_starts_at ON appointments(starts_at);

-- =========================
-- INDICAÇÕES (CLIENTE -> INDICADO)
-- =========================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_client_id UUID NOT NULL REFERENCES clients(id), -- quem indicou
  referred_name VARCHAR(160) NOT NULL,                    -- pessoa indicada
  referred_phone VARCHAR(30),
  referred_email VARCHAR(180),
  status referral_status NOT NULL DEFAULT 'NEW',
  converted_client_id UUID REFERENCES clients(id),         -- se virou cliente
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_client_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- =========================
-- HISTÓRICO / AUDITORIA GLOBAL
-- =========================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id),
  actor_role user_role,
  action VARCHAR(80) NOT NULL,          -- ex: CREATE_CLIENT, UPDATE_APPOINTMENT
  entity_type VARCHAR(80) NOT NULL,     -- ex: CLIENT, APPOINTMENT, REFERRAL
  entity_id UUID,
  source_platform VARCHAR(20) NOT NULL, -- WEB, ANDROID, IOS, API
  details JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- =========================
-- SESSÃO DO CLIENTE (portal/app)
-- =========================
CREATE TABLE IF NOT EXISTS client_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL UNIQUE REFERENCES clients(id),
  email VARCHAR(180) UNIQUE,
  phone VARCHAR(30) UNIQUE,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================
-- TRIGGERS DE updated_at
-- =========================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated_at') THEN
    CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_clients_updated_at') THEN
    CREATE TRIGGER trg_clients_updated_at BEFORE UPDATE ON clients
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_services_updated_at') THEN
    CREATE TRIGGER trg_services_updated_at BEFORE UPDATE ON services
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_appointments_updated_at') THEN
    CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON appointments
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_referrals_updated_at') THEN
    CREATE TRIGGER trg_referrals_updated_at BEFORE UPDATE ON referrals
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_client_access_updated_at') THEN
    CREATE TRIGGER trg_client_access_updated_at BEFORE UPDATE ON client_access
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

-- =========================
-- DADOS INICIAIS DE PERMISSÃO
-- =========================
-- ADMIN com tudo (exemplo de módulos)
INSERT INTO role_permissions (role, module_key, can_view, can_create, can_edit, can_delete)
VALUES
('ADMIN','dashboard',true,true,true,true),
('ADMIN','clients',true,true,true,true),
('ADMIN','appointments',true,true,true,true),
('ADMIN','services',true,true,true,true),
('ADMIN','referrals',true,true,true,true),
('ADMIN','audit_logs',true,true,true,true)
ON CONFLICT (role, module_key) DO NOTHING;

-- OWNER inicialmente com view em tudo e sem delete (você ajusta depois)
INSERT INTO role_permissions (role, module_key, can_view, can_create, can_edit, can_delete)
VALUES
('OWNER','dashboard',true,false,false,false),
('OWNER','clients',true,true,true,false),
('OWNER','appointments',true,true,true,false),
('OWNER','services',true,true,true,false),
('OWNER','referrals',true,true,true,false),
('OWNER','audit_logs',true,false,false,false)
ON CONFLICT (role, module_key) DO NOTHING;
