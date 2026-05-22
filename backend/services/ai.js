const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../.env' });

// Resolve OpenRouter credentials.
// Order:
//   1) process.env (project .env)
//   2) fallback to /Users/erolakarsu/projects/beauty-wellness-ai/.env
function loadOpenRouterCreds() {
  let key = process.env.OPENROUTER_API_KEY;
  let model = process.env.OPENROUTER_MODEL;
  if (!key || !model) {
    try {
      const fallback = '/Users/erolakarsu/projects/beauty-wellness-ai/.env';
      if (fs.existsSync(fallback)) {
        const text = fs.readFileSync(fallback, 'utf8');
        for (const line of text.split('\n')) {
          const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"\n]+?)"?\s*$/);
          if (!m) continue;
          if (m[1] === 'OPENROUTER_API_KEY' && !key) key = m[2];
          if (m[1] === 'OPENROUTER_MODEL' && !model) model = m[2];
        }
      }
    } catch (_) { /* ignore */ }
  }
  return { key, model: model || 'anthropic/claude-haiku-4.5' };
}

const SYSTEM_PROMPT =
  'You are an expert OSHA-certified construction safety consultant. ' +
  'You analyze hazards, incidents, permits, training needs, and inspection ' +
  'findings for active construction sites. Provide data-driven, regulation-aware, ' +
  'actionable safety guidance. Cite OSHA standards (29 CFR 1926) where relevant.';

function callOpenRouter(systemPrompt, userPrompt) {
  return new Promise((resolve, reject) => {
    const { key, model } = loadOpenRouterCreds();
    if (!key) {
      return resolve({ error: 'OPENROUTER_API_KEY not configured', summary: 'AI features unavailable: no API key.' });
    }
    const payload = JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 1800,
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': 'http://localhost:3010',
        'X-Title': 'AI Construction Safety Hub',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(body);
        } catch (_) {
          return resolve({ error: 'AI response parsing failed', raw: body });
        }
        if (parsed.error) {
          return resolve({ error: parsed.error.message || 'OpenRouter error' });
        }
        const content = parsed.choices?.[0]?.message?.content || 'No response';
        resolve(content);
      });
    });

    req.on('error', (e) => resolve({ error: e.message }));
    req.write(payload);
    req.end();
  });
}

function safeJsonParse(response, fallback) {
  if (response && typeof response === 'object' && response.error) {
    return { ...fallback, error: response.error, raw: response.raw };
  }
  if (response === null || response === undefined) return { ...fallback, summary: '' };
  if (typeof response === 'object') return response;
  const text = String(response).trim();
  try { return JSON.parse(text); } catch (_) {}
  try {
    const start = text.indexOf('{');
    if (start !== -1) {
      let depth = 0, inStr = false, esc = false;
      for (let i = start; i < text.length; i++) {
        const ch = text[i];
        if (esc) { esc = false; continue; }
        if (ch === '\\') { esc = true; continue; }
        if (ch === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (ch === '{') depth++;
        else if (ch === '}') {
          depth--;
          if (depth === 0) return JSON.parse(text.slice(start, i + 1));
        }
      }
    }
  } catch (_) {}
  try {
    const m = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (m && m[1]) return JSON.parse(m[1].trim());
  } catch (_) {}
  return { ...fallback, summary: text };
}

// 1) Predict hazards for a site
async function predictHazards(site) {
  const sys = `${SYSTEM_PROMPT}
Return JSON:
{
  "site": string,
  "predicted_hazards": [
    { "hazard": string, "category": "fall"|"struck-by"|"electrocution"|"caught-in"|"chemical"|"heat"|"other",
      "probability": number,
      "osha_standard": string,
      "recommended_controls": [string],
      "severity_if_realized": "low"|"medium"|"high"|"critical" }
  ],
  "top_priority": string,
  "summary": string
}`;
  const user = `Predict likely hazards for this construction site:\n${JSON.stringify(site, null, 2)}`;
  const r = await callOpenRouter(sys, user);
  return safeJsonParse(r, { predicted_hazards: [], summary: typeof r === 'string' ? r : '' });
}

// 2) Toolbox talk generator
async function generateToolboxTalk(topic) {
  const sys = `${SYSTEM_PROMPT}
Return JSON:
{
  "title": string,
  "duration_minutes": number,
  "objectives": [string],
  "introduction": string,
  "key_points": [{ "point": string, "talking_script": string, "osha_reference": string }],
  "hazards_covered": [string],
  "demonstrations": [string],
  "discussion_questions": [string],
  "action_items": [string],
  "closing": string,
  "summary": string
}`;
  const user = `Generate a complete toolbox talk script for the topic: "${topic}". Audience: working construction crew (mixed experience). Length: 10-15 minutes.`;
  const r = await callOpenRouter(sys, user);
  return safeJsonParse(r, { title: topic, summary: typeof r === 'string' ? r : '' });
}

// 3) Synthesize inspection report
async function synthesizeInspection(site) {
  const sys = `${SYSTEM_PROMPT}
Return JSON:
{
  "site": string,
  "inspector_notes": string,
  "scope": [string],
  "findings": [{ "area": string, "observation": string, "severity": "low"|"medium"|"high"|"critical", "osha_standard": string, "evidence": string }],
  "compliance_score": number,
  "passed": boolean,
  "recommendations": [{ "action": string, "owner": string, "deadline_days": number, "priority": "immediate"|"high"|"medium"|"low" }],
  "follow_up_inspection_days": number,
  "summary": string
}`;
  const user = `Synthesize a full safety inspection report for this site:\n${JSON.stringify(site, null, 2)}`;
  const r = await callOpenRouter(sys, user);
  return safeJsonParse(r, { findings: [], recommendations: [], summary: typeof r === 'string' ? r : '' });
}

// 4) Analyze incident
async function analyzeIncident(incident) {
  const sys = `${SYSTEM_PROMPT}
Return JSON:
{
  "incident": string,
  "root_cause_analysis": { "immediate_cause": string, "underlying_causes": [string], "systemic_factors": [string], "five_whys": [string] },
  "osha_citation_risks": [{ "standard": string, "description": string, "likelihood": "low"|"medium"|"high", "estimated_penalty_usd_range": string }],
  "contributing_factors": [string],
  "remediation_plan": [{ "action": string, "type": "engineering"|"administrative"|"ppe"|"training", "owner": string, "deadline_days": number }],
  "preventive_measures": [string],
  "regulatory_reporting_required": boolean,
  "summary": string
}`;
  const user = `Analyze this construction incident:\n${JSON.stringify(incident, null, 2)}`;
  const r = await callOpenRouter(sys, user);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : '' });
}

// 5) Verify permit
async function verifyPermit(permitDetails) {
  const sys = `${SYSTEM_PROMPT}
Return JSON:
{
  "permit_type": string,
  "compliance_status": "compliant"|"non-compliant"|"needs-attention",
  "osha_checks": [{ "requirement": string, "standard": string, "status": "met"|"missing"|"unclear", "notes": string }],
  "missing_documentation": [string],
  "required_ppe": [string],
  "required_training": [string],
  "atmospheric_testing_required": boolean,
  "isolation_lockout_required": boolean,
  "rescue_plan_required": boolean,
  "recommendations": [string],
  "issue_decision": "approve"|"approve-with-conditions"|"deny",
  "summary": string
}`;
  const user = `Verify this construction permit against OSHA standards:\n${JSON.stringify(permitDetails, null, 2)}`;
  const r = await callOpenRouter(sys, user);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : '' });
}

// 6) Recommend training
async function recommendTraining(workerRole) {
  const sys = `${SYSTEM_PROMPT}
Return JSON:
{
  "worker_role": string,
  "required_training": [{ "course": string, "osha_standard": string, "frequency": string, "duration_hours": number, "certification_body": string }],
  "recommended_training": [{ "course": string, "rationale": string, "duration_hours": number }],
  "competency_assessments": [string],
  "ppe_familiarization": [string],
  "training_plan_30_60_90": { "thirty_days": [string], "sixty_days": [string], "ninety_days": [string] },
  "total_required_hours": number,
  "summary": string
}`;
  const user = `Build a training plan for the following construction worker role: "${workerRole}". Include OSHA-required courses (OSHA 10, OSHA 30, NCCCO where relevant) and role-specific safety training.`;
  const r = await callOpenRouter(sys, user);
  return safeJsonParse(r, { worker_role: workerRole, summary: typeof r === 'string' ? r : '' });
}

// 7) PPE detector
async function detectPpe(payload) {
  const sys = `${SYSTEM_PROMPT}
Return JSON:
{
  "worker": string,
  "ppe_compliant": boolean,
  "compliance_score": number,
  "detected_items": [{ "item": string, "present": boolean, "confidence": number }],
  "missing_items": [string],
  "violations": [{ "item": string, "osha_standard": string, "severity": "low"|"medium"|"high"|"critical", "corrective_action": string }],
  "image_quality": "good"|"fair"|"poor",
  "summary": string
}`;
  const user = `Analyze PPE compliance for this construction worker (vision-style assessment):\n${JSON.stringify(payload, null, 2)}`;
  const r = await callOpenRouter(sys, user);
  return safeJsonParse(r, { ppe_compliant: false, missing_items: [], summary: typeof r === 'string' ? r : '' });
}

// 8) Fatigue predictor
async function predictFatigue(payload) {
  const sys = `${SYSTEM_PROMPT}
Return JSON:
{
  "worker": string,
  "fatigue_score": number,
  "risk_level": "low"|"moderate"|"high"|"critical",
  "contributing_factors": [string],
  "consecutive_hours": number,
  "weekly_hours": number,
  "recommendation": string,
  "recommended_break_minutes": number,
  "should_remove_from_high_risk_tasks": boolean,
  "summary": string
}`;
  const user = `Predict fatigue for this worker based on recent hours and roles:\n${JSON.stringify(payload, null, 2)}`;
  const r = await callOpenRouter(sys, user);
  return safeJsonParse(r, { fatigue_score: 0, recommendation: '', summary: typeof r === 'string' ? r : '' });
}

// 9) Weather stop-work
async function weatherStopWork(payload) {
  const sys = `${SYSTEM_PROMPT}
Return JSON:
{
  "site": string,
  "stop_work_recommended": boolean,
  "stop_work_categories": [string],
  "reason": string,
  "specific_triggers": [{ "trigger": string, "threshold": string, "actual": string }],
  "affected_operations": [string],
  "alternative_tasks": [string],
  "reassessment_in_hours": number,
  "osha_references": [string],
  "summary": string
}`;
  const user = `Evaluate stop-work decision for this site based on weather forecast:\n${JSON.stringify(payload, null, 2)}`;
  const r = await callOpenRouter(sys, user);
  return safeJsonParse(r, { stop_work_recommended: false, reason: '', summary: typeof r === 'string' ? r : '' });
}

// 10) JHA generator
async function generateJha(payload) {
  const sys = `${SYSTEM_PROMPT}
Return JSON:
{
  "task": string,
  "site": string,
  "job_steps": [{ "step": string, "hazards": [string], "controls": [string], "ppe_required": [string], "osha_references": [string] }],
  "competent_person_required": boolean,
  "required_permits": [string],
  "required_training": [string],
  "emergency_procedures": [string],
  "sign_off_required_by": [string],
  "summary": string
}`;
  const user = `Generate a complete Job Hazard Analysis (JHA) for this task:\n${JSON.stringify(payload, null, 2)}`;
  const r = await callOpenRouter(sys, user);
  return safeJsonParse(r, { job_steps: [], summary: typeof r === 'string' ? r : '' });
}

// 11) Near-miss cluster
async function clusterNearMisses(payload) {
  const sys = `${SYSTEM_PROMPT}
Return JSON:
{
  "total_analyzed": number,
  "clusters": [{ "cluster_name": string, "common_thread": string, "near_miss_count": number, "sites": [string], "categories": [string], "leading_indicator_score": number }],
  "leading_indicators": [{ "indicator": string, "trend": "rising"|"flat"|"declining", "incident_prediction_30d": string }],
  "systemic_recommendations": [string],
  "priority_sites": [string],
  "summary": string
}`;
  const user = `Cluster these near-misses and extract leading indicators:\n${JSON.stringify(payload, null, 2)}`;
  const r = await callOpenRouter(sys, user);
  return safeJsonParse(r, { clusters: [], summary: typeof r === 'string' ? r : '' });
}

// 12) Contractor score
async function scoreContractor(payload) {
  const sys = `${SYSTEM_PROMPT}
Return JSON:
{
  "contractor": string,
  "overall_score": number,
  "grade": "A"|"B"|"C"|"D"|"F",
  "factor_scores": [{ "factor": string, "score": number, "weight": number, "rationale": string }],
  "risk_flags": [string],
  "trms_emr": string,
  "recommendation": "approve"|"probation"|"reject",
  "improvement_areas": [string],
  "summary": string
}`;
  const user = `Score this contractor across safety factors (EMR, TRIR, incidents, insurance, training):\n${JSON.stringify(payload, null, 2)}`;
  const r = await callOpenRouter(sys, user);
  return safeJsonParse(r, { overall_score: 0, summary: typeof r === 'string' ? r : '' });
}

// 13) Claim fraud
async function claimFraudCheck(payload) {
  const sys = `${SYSTEM_PROMPT}
Return JSON:
{
  "claim_id": string,
  "fraud_likelihood": number,
  "risk_level": "low"|"medium"|"high"|"critical",
  "indicators": [{ "indicator": string, "weight": number, "evidence": string }],
  "red_flags": [string],
  "recommended_actions": [string],
  "investigation_priority": "low"|"medium"|"high"|"urgent",
  "siu_referral_recommended": boolean,
  "summary": string
}`;
  const user = `Assess fraud likelihood for this insurance claim:\n${JSON.stringify(payload, null, 2)}`;
  const r = await callOpenRouter(sys, user);
  return safeJsonParse(r, { fraud_likelihood: 0, indicators: [], summary: typeof r === 'string' ? r : '' });
}

// 14) Training gap
async function trainingGap(payload) {
  const sys = `${SYSTEM_PROMPT}
Return JSON:
{
  "worker": string,
  "role": string,
  "compliance_pct": number,
  "training_gaps": [{ "course": string, "required_by": string, "osha_standard": string, "severity": "low"|"medium"|"high"|"critical", "deadline_days": number }],
  "expired_certifications": [string],
  "expiring_soon": [{ "cert": string, "expires_in_days": number }],
  "blocks_task_assignment_to": [string],
  "remediation_plan": [string],
  "summary": string
}`;
  const user = `Identify training gaps vs role requirements for this worker:\n${JSON.stringify(payload, null, 2)}`;
  const r = await callOpenRouter(sys, user);
  return safeJsonParse(r, { training_gaps: [], summary: typeof r === 'string' ? r : '' });
}

// 15) Lift plan
async function liftPlan(payload) {
  const sys = `${SYSTEM_PROMPT}
Return JSON:
{
  "lift_summary": string,
  "load": { "description": string, "weight_lbs": number, "cog_offset_inches": number },
  "crane": { "model": string, "configuration": string, "rated_capacity_pct_used": number },
  "rigging_recommendations": [{ "item": string, "spec": string, "wll_lbs": number, "qty": number }],
  "rigging_angle_deg": number,
  "exclusion_zone_radius_ft": number,
  "ground_conditions_required": string,
  "wind_speed_limit_mph": number,
  "critical_lift": boolean,
  "engineer_signoff_required": boolean,
  "pre_lift_checklist": [string],
  "osha_references": [string],
  "summary": string
}`;
  const user = `Generate a lift plan and rigging recommendations for:\n${JSON.stringify(payload, null, 2)}`;
  const r = await callOpenRouter(sys, user);
  return safeJsonParse(r, { rigging_recommendations: [], summary: typeof r === 'string' ? r : '' });
}

// 16) Scaffold inspector
async function inspectScaffold(payload) {
  const sys = `${SYSTEM_PROMPT}
Return JSON:
{
  "scaffold": string,
  "type": string,
  "risk_score": number,
  "risk_level": "low"|"medium"|"high"|"critical",
  "passed": boolean,
  "checklist": [{ "item": string, "compliant": boolean, "osha_standard": string, "note": string }],
  "critical_defects": [string],
  "tag_color": "green"|"yellow"|"red",
  "competent_person_required": boolean,
  "max_load_lbs": number,
  "recommendations": [string],
  "summary": string
}`;
  const user = `Inspect this scaffold and produce a checklist + risk score:\n${JSON.stringify(payload, null, 2)}`;
  const r = await callOpenRouter(sys, user);
  return safeJsonParse(r, { checklist: [], summary: typeof r === 'string' ? r : '' });
}

// ===== Apply pass 7: 5 new AI helpers =====

// 17) RCA analyzer (5-Whys / fishbone)
async function rcaAnalyzer(payload) {
  const sys = `${SYSTEM_PROMPT}
Return JSON:
{
  "incident": string,
  "five_whys": [{ "why": string, "answer": string }],
  "fishbone": {
    "people": [string],
    "process": [string],
    "equipment": [string],
    "materials": [string],
    "environment": [string],
    "management": [string]
  },
  "primary_root_cause": string,
  "contributing_root_causes": [string],
  "corrective_actions": [{ "action": string, "type": "engineering"|"administrative"|"ppe"|"training", "owner": string, "deadline_days": number }],
  "verification_plan": [string],
  "osha_references": [string],
  "summary": string
}`;
  const user = `Perform a 5-Whys + fishbone root-cause analysis for this incident:\n${JSON.stringify(payload, null, 2)}`;
  const r = await callOpenRouter(sys, user);
  return safeJsonParse(r, { five_whys: [], summary: typeof r === 'string' ? r : '' });
}

// 18) Near-miss similarity matcher
async function nearMissSimilarity(payload) {
  const sys = `${SYSTEM_PROMPT}
Return JSON:
{
  "query_summary": string,
  "matches": [{
    "near_miss_id": string,
    "site": string,
    "similarity_score": number,
    "shared_factors": [string],
    "differences": [string],
    "lessons_carried_forward": [string]
  }],
  "common_pattern": string,
  "recommended_controls": [string],
  "summary": string
}`;
  const user = `Find similar past near-misses for the query event and rank by similarity:\n${JSON.stringify(payload, null, 2)}`;
  const r = await callOpenRouter(sys, user);
  return safeJsonParse(r, { matches: [], summary: typeof r === 'string' ? r : '' });
}

// 19) OSHA narrative drafter (301/300)
async function oshaNarrative(payload) {
  const sys = `${SYSTEM_PROMPT}
Return JSON:
{
  "case_no": string,
  "osha_301_narrative": string,
  "osha_300_log_entry": {
    "case_no": string,
    "employee_name": string,
    "job_title": string,
    "date_of_event": string,
    "establishment_name": string,
    "where_event_occurred": string,
    "description_of_injury": string,
    "classification": "death"|"days_away"|"job_transfer"|"other_recordable"|"not_recordable",
    "days_away_from_work": number,
    "days_on_job_transfer": number
  },
  "recordable": boolean,
  "reportable_to_osha": boolean,
  "reporting_deadline_hours": number,
  "summary": string
}`;
  const user = `Draft OSHA 301 narrative and 300 log entry from this raw incident:\n${JSON.stringify(payload, null, 2)}`;
  const r = await callOpenRouter(sys, user);
  return safeJsonParse(r, { osha_301_narrative: '', summary: typeof r === 'string' ? r : '' });
}

// 20) Hazard image classifier (general site photo)
async function hazardImageClassifier(payload) {
  const sys = `${SYSTEM_PROMPT}
Return JSON:
{
  "site": string,
  "detected_hazards": [{
    "hazard": string,
    "category": "fall"|"struck-by"|"electrocution"|"caught-in"|"housekeeping"|"exposed-rebar"|"fall-edge"|"chemical"|"other",
    "confidence": number,
    "location_in_image": string,
    "osha_standard": string,
    "severity": "low"|"medium"|"high"|"critical",
    "recommended_control": string
  }],
  "housekeeping_score": number,
  "image_quality": "good"|"fair"|"poor",
  "immediate_actions": [string],
  "summary": string
}`;
  const user = `Classify general construction site hazards from this site photo (vision-style):\n${JSON.stringify(payload, null, 2)}`;
  const r = await callOpenRouter(sys, user);
  return safeJsonParse(r, { detected_hazards: [], summary: typeof r === 'string' ? r : '' });
}

// 21) Leading-indicator predictor
async function leadingIndicatorPredictor(payload) {
  const sys = `${SYSTEM_PROMPT}
Return JSON:
{
  "site": string,
  "window_days": number,
  "injury_risk_30d": number,
  "risk_level": "low"|"moderate"|"high"|"critical",
  "leading_indicators": [{
    "indicator": string,
    "current_value": string,
    "trend": "rising"|"flat"|"declining",
    "weight": number,
    "evidence": string
  }],
  "forecast_summary": string,
  "recommended_actions": [{ "action": string, "owner": string, "deadline_days": number, "priority": "immediate"|"high"|"medium"|"low" }],
  "confidence": number,
  "summary": string
}`;
  const user = `Forecast 30-day injury risk from these leading indicators (audits, near-miss rate, training completion, etc.):\n${JSON.stringify(payload, null, 2)}`;
  const r = await callOpenRouter(sys, user);
  return safeJsonParse(r, { leading_indicators: [], summary: typeof r === 'string' ? r : '' });
}

module.exports = {
  callOpenRouter,
  safeJsonParse,
  predictHazards,
  generateToolboxTalk,
  synthesizeInspection,
  analyzeIncident,
  verifyPermit,
  recommendTraining,
  detectPpe,
  predictFatigue,
  weatherStopWork,
  generateJha,
  clusterNearMisses,
  scoreContractor,
  claimFraudCheck,
  trainingGap,
  liftPlan,
  inspectScaffold,
  rcaAnalyzer,
  nearMissSimilarity,
  oshaNarrative,
  hazardImageClassifier,
  leadingIndicatorPredictor,
};
