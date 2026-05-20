-- Construction Safety Hub schema
DROP TABLE IF EXISTS hazards CASCADE;
DROP TABLE IF EXISTS trainings CASCADE;
DROP TABLE IF EXISTS permits CASCADE;
DROP TABLE IF EXISTS inspections CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS workers CASCADE;
DROP TABLE IF EXISTS sites CASCADE;
DROP TABLE IF EXISTS ai_results CASCADE;

CREATE TABLE sites (
  id SERIAL PRIMARY KEY,
  site_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  project_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  supervisor VARCHAR(255),
  worker_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workers (
  id SERIAL PRIMARY KEY,
  worker_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  certifications TEXT,
  site VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  hire_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE equipment (
  id SERIAL PRIMARY KEY,
  equipment_id VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(100),
  manufacturer VARCHAR(100),
  serial VARCHAR(100),
  site VARCHAR(255),
  status VARCHAR(50) DEFAULT 'operational',
  last_inspected DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE incidents (
  id SERIAL PRIMARY KEY,
  incident_id VARCHAR(50) UNIQUE NOT NULL,
  site VARCHAR(255),
  type VARCHAR(50),
  severity VARCHAR(50),
  injury_reported BOOLEAN DEFAULT false,
  occurred_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'open',
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE inspections (
  id SERIAL PRIMARY KEY,
  inspection_id VARCHAR(50) UNIQUE NOT NULL,
  site VARCHAR(255),
  inspector VARCHAR(255),
  type VARCHAR(50),
  score INTEGER,
  passed BOOLEAN DEFAULT true,
  performed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE permits (
  id SERIAL PRIMARY KEY,
  permit_id VARCHAR(50) UNIQUE NOT NULL,
  site VARCHAR(255),
  type VARCHAR(50),
  issued_to VARCHAR(255),
  valid_from DATE,
  valid_to DATE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trainings (
  id SERIAL PRIMARY KEY,
  training_id VARCHAR(50) UNIQUE NOT NULL,
  course VARCHAR(255),
  instructor VARCHAR(255),
  scheduled_for TIMESTAMP,
  attendee_count INTEGER DEFAULT 0,
  mandatory BOOLEAN DEFAULT false,
  completion_rate INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE hazards (
  id SERIAL PRIMARY KEY,
  hazard_id VARCHAR(50) UNIQUE NOT NULL,
  site VARCHAR(255),
  description TEXT,
  severity VARCHAR(50),
  control_measure TEXT,
  reported_by VARCHAR(255),
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ai_results (
  id SERIAL PRIMARY KEY,
  feature VARCHAR(100) NOT NULL,
  input JSONB,
  output JSONB,
  model VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_results_feature ON ai_results(feature);
CREATE INDEX IF NOT EXISTS idx_ai_results_created ON ai_results(created_at DESC);
