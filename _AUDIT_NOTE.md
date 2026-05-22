# Audit Note — AIConstructionSafetyHub

Audit-only pass. Standard portfolio stack (Express + Postgres backend, React frontend, `services/ai.js` OpenRouter wrapper, JWT auth, CRUD via `services/crud.js`).

Domain: construction safety — incident reporting, near-miss analysis, PPE compliance, OSHA recordkeeping, toolbox talks, hazard ID.

## Inventory

### Backend
- 24 route modules under `backend/routes/`.
- 23 CRUD entities mounted in `server.js` (sites, workers, equipment, incidents, inspections, permits, trainings, hazards, jha, near_misses, safety_meetings, ppe_inventory, contractors, subcontractors, drug_tests, dot_records, claims, vendors, attachments, webhooks, notifications, bulk_import, custom-views).
- 16 AI POST endpoints in `routes/ai.js`: `predict-hazards`, `generate-toolbox-talk`, `synthesize-inspection`, `analyze-incident`, `verify-permit`, `recommend-training`, `ppe-detector`, `fatigue-predictor`, `weather-stop-work`, `jha-generator`, `near-miss-cluster`, `contractor-score`, `claim-fraud`, `training-gap`, `lift-plan`, `scaffold-inspector` (plus `/samples`, `/results`, `/history`).
- Side-effects middleware fires notifications + webhooks on incidents/near_misses/hazards/claims writes.

### Frontend
- 16 AI pages (1:1 with AI endpoints) + 23 CRUD pages + Dashboard, Login, Notifications, Webhooks, BulkImport, CustomViews, Timeline, Codex feature pages.
- Components: AiPanel, AIResultDisplay, CrudTable, IncidentHeatmap, IncidentInvestigationPDF, NotificationBell, SafetyRulesEditor, SafetyScoreTrend, Sidebar.

## Gap Analysis

### Missing AI Counterparts
- **Incident root-cause analyzer** — `analyze-incident` exists but covers analysis broadly; dedicated 5-Whys / fishbone RCA endpoint absent.
- **Near-miss similarity matcher** — `near-miss-cluster` clusters but no pairwise similarity / "find similar past near-miss" retrieval endpoint.
- **OSHA narrative drafter** — no endpoint generating OSHA 301 / 300 narrative from raw incident fields.
- **Hazard image classifier** — `ppe-detector` covers PPE; no general hazard/site-photo classifier (exposed rebar, fall edges, housekeeping).
- **Toolbox-talk generator** — `generate-toolbox-talk` covered.
- **Leading-indicator predictor** — no endpoint forecasting injury risk from leading indicators (audits, near-miss rate, training completion).

### Missing Non-AI Features
- **Incident CRUD** — covered (`/api/incidents`).
- **OSHA 300 / 300A reports** — no report generator endpoint; raw incidents table only.
- **Crew certifications** — partial via `trainings`; no expiry-tracking / certification ledger endpoint.
- **Subcontractor onboarding** — `subcontractors` CRUD exists but no onboarding-workflow endpoints (insurance COI upload, prequal scoring lifecycle).

### Custom Feature Suggestions
- **Wearable integration** — no ingestion endpoint for smart-helmet / harness / heart-rate / GPS telemetry.
- **Drone safety walkthrough** — no endpoint for drone-photo batch ingest + AI walkthrough scoring.
- **Lone-worker monitor** — no check-in / dead-man-switch / geofence endpoint.

## Categorization

| Category | Items |
|---|---|
| MECHANICAL (template endpoint, no creds) | RCA analyzer, near-miss similarity matcher, OSHA narrative drafter, hazard image classifier, leading-indicator predictor, OSHA 300/300A report generator, certification expiry endpoint, subcontractor onboarding workflow, lone-worker check-in endpoint |
| NEEDS-CREDS | Wearable telemetry ingestion (vendor SDKs — Spot-r, Triax, Guardhat), drone platform integration (DJI/Skydio APIs) |
| NEEDS-PRODUCT-DECISION | OSHA recordable classification rules engine, lone-worker escalation policy, drone walkthrough scoring rubric |

## Implemented (this round)

None — audit-only.

## Status

Audit-only. No code changes. 16 AI endpoints + 23 CRUD entities present; 6 AI gaps, 3 non-AI gaps, 3 custom-feature gaps catalogued above.

## Apply pass 7 (full backlog implementation)

Implemented all MECHANICAL items and converted NEEDS-PRODUCT-DECISION OSHA 300 / 300A
into JSON + CSV export endpoints. NEEDS-CREDS items (wearables, drones) shipped as
503 stubs with `/status` introspection endpoints.

### New AI endpoints (5) — `backend/routes/ai.js` + `backend/services/ai.js`
- `POST /api/ai/rca-analyzer` — 5-Whys + fishbone RCA
- `POST /api/ai/near-miss-similarity` — pairwise similarity ranking against corpus (auto-pulls 50 recent near-misses if empty body)
- `POST /api/ai/osha-narrative` — OSHA 301 narrative + 300-log entry drafter from raw incident fields
- `POST /api/ai/hazard-image-classifier` — general site-photo hazard classifier (rebar, fall-edges, housekeeping)
- `POST /api/ai/leading-indicator-predictor` — 30-day injury risk forecast from leading indicators

5 hardcoded sample scenarios per endpoint added to `SAMPLES` map (frontend `aiSamples` populates AiPanel chips).

### New report endpoints (NEEDS-PRODUCT-DECISION → JSON/CSV)
- `GET /api/osha-reports/300?year=&site=&format=json|csv` — recordable injury log; classifies recordability from `incidents.severity` + `injury_reported`
- `GET /api/osha-reports/300A?year=&site=&format=json|csv` — annual summary, computes TRIR / DART per 100 workers from `sites.worker_count` × 2000 hr

### New CRUD + workflow endpoints
- `/api/certifications` — full CRUD; `GET /expiring?days=<n>` window query (default 60)
- `/api/subcontractor-onboarding` — full CRUD; `GET /stages`; `POST /:id/advance` (linear stage machine: invited → prequal_in_progress → docs_pending → coi_review → approved | rejected)
- `/api/lone-worker` — full CRUD on `lone_worker_checkins`; `GET /overdue`; `POST /:id/ack`

### NEEDS-CREDS stubs (503)
- `/api/wearables/{telemetry,devices/:id/register,devices}` → 503 with vendor list (Spot-r / Triax / Guardhat). `GET /status` returns config introspection.
- `/api/drones/{walkthrough,photos/ingest,missions}` → 503 with platform list (DJI / Skydio). `GET /status` returns config introspection.

### Migration
`backend/migrations/003_pass7.sql` — 3 new tables:
- `certifications` (worker, cert_name, issuing_body, issued_on, expires_on, status; idx on expires_on, worker)
- `subcontractor_onboarding` (sub_name, scope, coi_received, coi_expiry, prequal_score, msa_signed, w9_received, safety_manual_received, stage; idx on stage)
- `lone_worker_checkins` (worker, site, lat, lng, status, next_checkin_due, battery_pct; idx on status, next_checkin_due)

### Frontend
- `frontend/src/services/api.js` — 5 new AI helpers, `osha300`, `osha300A`, `oshaReportCsvUrl`, `certificationsApi`+`certificationsExpiring`, `subcontractorOnboardingApi`+`Stages`/`Advance`, `loneWorkerApi`+`Overdue`/`Ack`, `wearablesStatus`, `dronesStatus`.
- New pages: `AIRcaAnalyzerPage`, `AINearMissSimilarityPage`, `AIOshaNarrativePage`, `AIHazardImageClassifierPage`, `AILeadingIndicatorPredictorPage`, `OshaReportsPage`, `CertificationsPage` (with expiry-watch card), `SubcontractorOnboardingPage` (with advance-stage card), `LoneWorkerPage` (with overdue-checkins card + ack), `WearablesPage`, `DronesPage`.
- `App.js` routes appended; `Sidebar.js` extended (added 5 AI Safety Tools links + new "Reports & Workflows" group + new "Integrations" group).

### Wiring
- All new routers mounted in `backend/server.js` BEFORE the `/api` 404 fallback handler.
- Write-protected routers (`certifications`, `subcontractor-onboarding`, `lone-worker`) gated by `requireWritePermission`; reports + stubs are read-accessible to any authenticated role.
- No new npm dependencies. No breaking changes to existing routes, schemas, or contracts.

### Syntax verification
`node --check` passed on: `server.js`, `routes/ai.js`, `services/ai.js`, `routes/osha_reports.js`, `routes/certifications.js`, `routes/subcontractor_onboarding.js`, `routes/lone_worker.js`, `routes/wearables.js`, `routes/drones.js`. All frontend JSX parsed clean via `@babel/parser`.

### Skips
- Wearable telemetry ingestion + drone walkthrough scoring (NEEDS-CREDS) — 503 stubs only. Real ingestion requires vendor SDK keys (SPOTR_API_KEY / TRIAX_API_KEY / GUARDHAT_API_KEY / DJI_API_KEY / SKYDIO_API_KEY) and a product decision on the drone walkthrough scoring rubric.
- OSHA recordable classification rules engine — implemented as a simple inline `classifyRecordable()` heuristic in `routes/osha_reports.js`; promoting it to a configurable rules engine is deferred (NEEDS-PRODUCT-DECISION on rule precedence).
- Lone-worker escalation policy — endpoint exposes overdue + ack flow; auto-escalation (SMS / supervisor paging) is left to the existing webhooks + notifications side-effects pipeline.

### Status
Implemented. 21 AI endpoints (was 16), 23 CRUD entities + 3 new (certifications, subcontractor_onboarding, lone_worker_checkins), OSHA 300/300A JSON+CSV reports, 2 NEEDS-CREDS integrations as 503 stubs with `/status` introspection. All new routes mounted before 404 handler; no new deps; no breaking changes; `node --check` clean.
