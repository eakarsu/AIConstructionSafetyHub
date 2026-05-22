-- Apply pass 7: full backlog (certifications, subcontractor onboarding, lone-worker check-ins)
DROP TABLE IF EXISTS lone_worker_checkins CASCADE;
DROP TABLE IF EXISTS subcontractor_onboarding CASCADE;
DROP TABLE IF EXISTS certifications CASCADE;

CREATE TABLE certifications (
  id SERIAL PRIMARY KEY,
  cert_id VARCHAR(50) UNIQUE NOT NULL,
  worker VARCHAR(255),
  worker_role VARCHAR(255),
  cert_name VARCHAR(255),
  issuing_body VARCHAR(255),
  issued_on DATE,
  expires_on DATE,
  status VARCHAR(50) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_certs_expires ON certifications(expires_on);
CREATE INDEX IF NOT EXISTS idx_certs_worker ON certifications(worker);

CREATE TABLE subcontractor_onboarding (
  id SERIAL PRIMARY KEY,
  onboarding_id VARCHAR(50) UNIQUE NOT NULL,
  sub_name VARCHAR(255),
  scope VARCHAR(255),
  coi_received BOOLEAN DEFAULT false,
  coi_expiry DATE,
  prequal_score INTEGER DEFAULT 0,
  msa_signed BOOLEAN DEFAULT false,
  w9_received BOOLEAN DEFAULT false,
  safety_manual_received BOOLEAN DEFAULT false,
  stage VARCHAR(50) DEFAULT 'invited',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_onboarding_stage ON subcontractor_onboarding(stage);

CREATE TABLE lone_worker_checkins (
  id SERIAL PRIMARY KEY,
  checkin_id VARCHAR(50) UNIQUE NOT NULL,
  worker VARCHAR(255),
  site VARCHAR(255),
  lat NUMERIC(10,6),
  lng NUMERIC(10,6),
  status VARCHAR(50) DEFAULT 'ok',
  next_checkin_due TIMESTAMP,
  battery_pct INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lone_worker_status ON lone_worker_checkins(status);
CREATE INDEX IF NOT EXISTS idx_lone_worker_due ON lone_worker_checkins(next_checkin_due);
