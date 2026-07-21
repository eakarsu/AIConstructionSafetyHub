ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(80);
ALTER TABLE users ALTER COLUMN tenant_id SET DEFAULT 'default';
UPDATE users SET tenant_id='default' WHERE tenant_id IS NULL;
ALTER TABLE users ALTER COLUMN tenant_id SET NOT NULL;

CREATE TABLE IF NOT EXISTS governed_safety_hazards (
  id BIGSERIAL PRIMARY KEY, tenant_id VARCHAR(80) NOT NULL, site_key VARCHAR(80) NOT NULL,
  source_record_id VARCHAR(160) NOT NULL, source_sha256 CHAR(64) NOT NULL, device_id VARCHAR(120) NOT NULL,
  rule_set_version VARCHAR(80) NOT NULL, hazard_code VARCHAR(80) NOT NULL, description TEXT NOT NULL,
  worker_pseudonym VARCHAR(120), locale VARCHAR(20) NOT NULL, likelihood SMALLINT NOT NULL CHECK (likelihood BETWEEN 1 AND 5),
  consequence SMALLINT NOT NULL CHECK (consequence BETWEEN 1 AND 5), risk_score SMALLINT NOT NULL CHECK (risk_score BETWEEN 1 AND 25),
  risk_band VARCHAR(20) NOT NULL CHECK (risk_band IN ('low','medium','high','critical')),
  captured_at TIMESTAMPTZ NOT NULL, received_at TIMESTAMPTZ NOT NULL, latitude NUMERIC(9,6), longitude NUMERIC(9,6),
  accuracy_m NUMERIC(10,2), degraded_mode BOOLEAN NOT NULL DEFAULT FALSE, degraded_reason TEXT,
  status VARCHAR(24) NOT NULL DEFAULT 'open' CHECK (status IN ('open','control_pending','closure_pending','closed')),
  reported_by INTEGER NOT NULL REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, source_record_id)
);
CREATE TABLE IF NOT EXISTS safety_corrective_actions (
  id BIGSERIAL PRIMARY KEY, tenant_id VARCHAR(80) NOT NULL, hazard_id BIGINT NOT NULL REFERENCES governed_safety_hazards(id),
  description TEXT NOT NULL, owner_pseudonym VARCHAR(120) NOT NULL, due_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open','completed')),
  completion_evidence_sha256 CHAR(64), completion_note TEXT, created_by INTEGER NOT NULL REFERENCES users(id),
  completed_by INTEGER REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), completed_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS safety_closure_reviews (
  id BIGSERIAL PRIMARY KEY, tenant_id VARCHAR(80) NOT NULL, hazard_id BIGINT NOT NULL REFERENCES governed_safety_hazards(id),
  decision VARCHAR(20) NOT NULL CHECK (decision IN ('verified','rejected')), rationale TEXT NOT NULL,
  reviewer_user_id INTEGER NOT NULL REFERENCES users(id), reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS safety_events (
  id BIGSERIAL PRIMARY KEY, tenant_id VARCHAR(80) NOT NULL, hazard_id BIGINT NOT NULL REFERENCES governed_safety_hazards(id),
  event_type VARCHAR(80) NOT NULL, actor_user_id INTEGER NOT NULL REFERENCES users(id), payload JSONB NOT NULL,
  previous_hash CHAR(64), event_hash CHAR(64) NOT NULL UNIQUE, occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_safety_hazards_tenant_status ON governed_safety_hazards(tenant_id, status, id);
CREATE INDEX IF NOT EXISTS idx_safety_events_tenant_hazard ON safety_events(tenant_id, hazard_id, id);
CREATE OR REPLACE FUNCTION prevent_safety_event_mutation() RETURNS trigger AS $$
BEGIN RAISE EXCEPTION 'safety_events is append-only'; END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS safety_events_immutable ON safety_events;
CREATE TRIGGER safety_events_immutable BEFORE UPDATE OR DELETE ON safety_events
FOR EACH ROW EXECUTE FUNCTION prevent_safety_event_mutation();
