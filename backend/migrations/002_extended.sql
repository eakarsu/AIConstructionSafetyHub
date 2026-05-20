-- Extended schema for AI Construction Safety Hub
DROP TABLE IF EXISTS webhook_logs CASCADE;
DROP TABLE IF EXISTS webhooks CASCADE;
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS claims CASCADE;
DROP TABLE IF EXISTS dot_records CASCADE;
DROP TABLE IF EXISTS drug_tests CASCADE;
DROP TABLE IF EXISTS subcontractors CASCADE;
DROP TABLE IF EXISTS contractors CASCADE;
DROP TABLE IF EXISTS ppe_inventory CASCADE;
DROP TABLE IF EXISTS safety_meetings CASCADE;
DROP TABLE IF EXISTS near_misses CASCADE;
DROP TABLE IF EXISTS jha CASCADE;

-- 10 new domain entities
CREATE TABLE jha (
  id SERIAL PRIMARY KEY,
  jha_id VARCHAR(50) UNIQUE NOT NULL,
  site VARCHAR(255),
  task VARCHAR(255),
  hazards TEXT,
  controls TEXT,
  performed_by VARCHAR(255),
  performed_at TIMESTAMP,
  signed_off BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE near_misses (
  id SERIAL PRIMARY KEY,
  near_miss_id VARCHAR(50) UNIQUE NOT NULL,
  site VARCHAR(255),
  description TEXT,
  severity_if_realized VARCHAR(50),
  reported_by VARCHAR(255),
  reported_at TIMESTAMP,
  action_taken TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE safety_meetings (
  id SERIAL PRIMARY KEY,
  meeting_id VARCHAR(50) UNIQUE NOT NULL,
  site VARCHAR(255),
  topic VARCHAR(255),
  attendees TEXT,
  duration_min INTEGER,
  scheduled_for TIMESTAMP,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ppe_inventory (
  id SERIAL PRIMARY KEY,
  item_id VARCHAR(50) UNIQUE NOT NULL,
  site VARCHAR(255),
  ppe_type VARCHAR(100),
  sku VARCHAR(100),
  qty INTEGER DEFAULT 0,
  threshold_min INTEGER DEFAULT 0,
  last_audit DATE,
  status VARCHAR(50) DEFAULT 'in-stock',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE contractors (
  id SERIAL PRIMARY KEY,
  contractor_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255),
  license_no VARCHAR(100),
  insurance_expiry DATE,
  safety_score INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'approved',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE subcontractors (
  id SERIAL PRIMARY KEY,
  sub_id VARCHAR(50) UNIQUE NOT NULL,
  parent_contractor VARCHAR(255),
  name VARCHAR(255),
  scope VARCHAR(255),
  license_no VARCHAR(100),
  status VARCHAR(50) DEFAULT 'approved',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE drug_tests (
  id SERIAL PRIMARY KEY,
  test_id VARCHAR(50) UNIQUE NOT NULL,
  worker VARCHAR(255),
  type VARCHAR(50),
  result VARCHAR(50),
  tested_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE dot_records (
  id SERIAL PRIMARY KEY,
  record_id VARCHAR(50) UNIQUE NOT NULL,
  driver VARCHAR(255),
  cdl_class VARCHAR(10),
  medical_expires DATE,
  last_hours_log TIMESTAMP,
  violations_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE claims (
  id SERIAL PRIMARY KEY,
  claim_id VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(50),
  claimant VARCHAR(255),
  status VARCHAR(50) DEFAULT 'open',
  opened_at TIMESTAMP,
  amount_usd NUMERIC(12,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vendors (
  id SERIAL PRIMARY KEY,
  vendor_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255),
  category VARCHAR(100),
  w9_on_file BOOLEAN DEFAULT false,
  insurance_expiry DATE,
  status VARCHAR(50) DEFAULT 'approved',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cross-cutting: RBAC users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'worker',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cross-cutting: Notifications
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  type VARCHAR(50),
  title VARCHAR(255),
  body TEXT,
  severity VARCHAR(50),
  read BOOLEAN DEFAULT false,
  link VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- Cross-cutting: Attachments
CREATE TABLE attachments (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  mime_type VARCHAR(100),
  size_bytes INTEGER,
  uploaded_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_attachments_entity ON attachments(entity_type, entity_id);

-- Cross-cutting: Webhooks
CREATE TABLE webhooks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  url TEXT NOT NULL,
  events TEXT,
  secret VARCHAR(255),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE webhook_logs (
  id SERIAL PRIMARY KEY,
  webhook_id INTEGER,
  event VARCHAR(100),
  payload JSONB,
  response_status INTEGER,
  response_body TEXT,
  signature VARCHAR(255),
  delivered BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook ON webhook_logs(webhook_id);
