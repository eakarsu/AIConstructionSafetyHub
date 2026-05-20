const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const ai = require('../services/ai');

async function logResult(feature, input, output) {
  try {
    await pool.query(
      'INSERT INTO ai_results (feature, input, output, model) VALUES ($1, $2, $3, $4)',
      [feature, input, output, process.env.OPENROUTER_MODEL || 'auto']
    );
  } catch (_) { /* table may not yet exist on cold start */ }
}

router.post('/predict-hazards', async (req, res) => {
  try {
    const site = req.body.site || req.body;
    const result = await ai.predictHazards(site);
    await logResult('predict-hazards', site, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/generate-toolbox-talk', async (req, res) => {
  try {
    const topic = req.body.topic || 'Fall Protection on Multi-Story Sites';
    const result = await ai.generateToolboxTalk(topic);
    await logResult('toolbox-talk', { topic }, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/synthesize-inspection', async (req, res) => {
  try {
    const site = req.body.site || req.body;
    const result = await ai.synthesizeInspection(site);
    await logResult('synthesize-inspection', site, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/analyze-incident', async (req, res) => {
  try {
    const incident = req.body.incident || req.body;
    const result = await ai.analyzeIncident(incident);
    await logResult('analyze-incident', incident, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/verify-permit', async (req, res) => {
  try {
    const permit = req.body.permit_details || req.body.permit || req.body;
    const result = await ai.verifyPermit(permit);
    await logResult('verify-permit', permit, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/recommend-training', async (req, res) => {
  try {
    const role = req.body.worker_role || req.body.role || 'General Laborer';
    const result = await ai.recommendTraining(role);
    await logResult('recommend-training', { role }, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/ppe-detector', async (req, res) => {
  try {
    const payload = req.body || {};
    const result = await ai.detectPpe(payload);
    await logResult('ppe-detector', payload, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/fatigue-predictor', async (req, res) => {
  try {
    const payload = req.body || {};
    const result = await ai.predictFatigue(payload);
    await logResult('fatigue-predictor', payload, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/weather-stop-work', async (req, res) => {
  try {
    const payload = req.body || {};
    const result = await ai.weatherStopWork(payload);
    await logResult('weather-stop-work', payload, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/jha-generator', async (req, res) => {
  try {
    const payload = req.body || {};
    const result = await ai.generateJha(payload);
    await logResult('jha-generator', payload, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/near-miss-cluster', async (req, res) => {
  try {
    // Pull recent near-misses if no payload provided
    let payload = req.body && Object.keys(req.body).length > 0 ? req.body : null;
    if (!payload) {
      const r = await pool.query('SELECT * FROM near_misses ORDER BY id DESC LIMIT 50');
      payload = { near_misses: r.rows };
    }
    const result = await ai.clusterNearMisses(payload);
    await logResult('near-miss-cluster', payload, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/contractor-score', async (req, res) => {
  try {
    const payload = req.body.contractor || req.body || {};
    const result = await ai.scoreContractor(payload);
    await logResult('contractor-score', payload, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/claim-fraud', async (req, res) => {
  try {
    const payload = req.body.claim || req.body || {};
    const result = await ai.claimFraudCheck(payload);
    await logResult('claim-fraud', payload, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/training-gap', async (req, res) => {
  try {
    const payload = req.body.worker || req.body || {};
    const result = await ai.trainingGap(payload);
    await logResult('training-gap', payload, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/lift-plan', async (req, res) => {
  try {
    const payload = req.body || {};
    const result = await ai.liftPlan(payload);
    await logResult('lift-plan', payload, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/scaffold-inspector', async (req, res) => {
  try {
    const payload = req.body.scaffold || req.body || {};
    const result = await ai.inspectScaffold(payload);
    await logResult('scaffold-inspector', payload, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Hardcoded sample scenarios per AI feature. 5 entries each, realistic OSHA-flavored.
const SAMPLES = {
  'predict-hazards': [
    {
      label: 'High-rise concrete pour',
      values: {
        name: 'Riverside Tower Phase II',
        project_type: 'High-rise Residential (32-story)',
        address: '4400 Riverside Blvd, Sacramento, CA',
        worker_count: 142,
        supervisor: 'James Conroy (OSHA 30, CHST)',
        notes: '18th-story slab pour in progress; Liebherr 550EC-B tower crane; concrete pump boom 56m; adjacent occupied units within fall-zone perimeter.',
      },
    },
    {
      label: 'Trenching & excavation',
      values: {
        name: 'East Campus Storm Drain',
        project_type: 'Underground Utilities / Trenching',
        address: '1200 University Way, Tempe, AZ',
        worker_count: 28,
        supervisor: 'Lourdes Vega (OSHA 30, Competent Person Excavation)',
        notes: 'Type C soil, 11 ft trench depth, hydraulic shoring, Caterpillar 320 excavator on the spoil-pile side; high water table; daily atmospheric checks.',
      },
    },
    {
      label: 'Electrical retrofit (energized)',
      values: {
        name: 'Mercy Hospital Wing C Retrofit',
        project_type: 'Commercial Electrical Retrofit',
        address: '88 Healthway Pkwy, Cleveland, OH',
        worker_count: 19,
        supervisor: 'Anthony DiMarco (Master Electrician, NFPA 70E)',
        notes: '480V switchgear changeout adjacent to live patient corridor; arc-flash boundary 42 in; LOTO procedure 4 sources; CAT-IV rated PPE required.',
      },
    },
    {
      label: 'Demolition (selective interior)',
      values: {
        name: 'Federal Courthouse Selective Demo',
        project_type: 'Selective Interior Demolition',
        address: '300 Liberty St, Boston, MA',
        worker_count: 22,
        supervisor: 'Liam Pratchett (OSHA 30, Asbestos Supervisor)',
        notes: 'Pre-1980 building; ACM survey complete; lead paint encapsulation underway; Brokk 160 demo robot on level 3; HEPA negative-air containment.',
      },
    },
    {
      label: 'Roofing replacement (steep slope)',
      values: {
        name: 'Saint Peters Cathedral Re-Roof',
        project_type: 'Steep-Slope Roof Replacement',
        address: '601 Elm Ave, St. Louis, MO',
        worker_count: 12,
        supervisor: 'Marcus Tate (OSHA 30, Competent Person Fall Protection)',
        notes: '9/12 pitch; 64 ft eave height; horizontal lifeline + SRLs; JLG 1850SJ boom-lift for staging; warm-roof tear-off, 88F forecast.',
      },
    },
  ],
  'toolbox-talk': [
    { label: 'Fall protection (Subpart M)', values: { topic: 'Fall Protection on Multi-Story Sites - 29 CFR 1926 Subpart M, anchor points, PFAS inspection, leading-edge work' } },
    { label: 'Trenching cave-in prevention', values: { topic: 'Trenching and Excavation Cave-In Prevention - 29 CFR 1926 Subpart P, soil classification, protective systems, daily competent-person inspection' } },
    { label: 'Heat illness prevention', values: { topic: 'Heat Illness Prevention - Cal/OSHA Title 8 Section 3395, hydration cadence, shade requirements, acclimatization for new hires during summer ramp-up' } },
    { label: 'Silica exposure (Table 1)', values: { topic: 'Respirable Crystalline Silica - 29 CFR 1926.1153 Table 1 controls for grinders, saws, jackhammers; engineering controls, respiratory protection, medical surveillance' } },
    { label: 'Struck-by incidents', values: { topic: 'Struck-By Incidents - tower crane lift zones, mobile equipment spotters, dropped-object prevention with Caterpillar 320 and JLG 1850SJ in active work areas' } },
  ],
  'synthesize-inspection': [
    {
      label: 'Weekly trenching walk',
      values: {
        name: 'East Campus Excavation',
        project_type: 'Excavation / Foundation',
        inspector: 'Kim Park (OSHA 30, CHST)',
        type: 'weekly',
        observed_conditions: 'Type C soil; trench 9 ft deep; hydraulic shoring in place; ladder access every 25 ft; spoil pile 2 ft+ from edge; one toolbox talk completed.',
      },
    },
    {
      label: 'Monthly tower crane',
      values: {
        name: 'Riverside Tower Phase II',
        project_type: 'High-rise Residential',
        inspector: 'David Okafor (NCCCO Crane Inspector)',
        type: 'monthly',
        observed_conditions: 'Liebherr 550EC-B; load chart posted; anti-two-block tested; wire rope visual OK; jib pins safetied; daily logs current; operator NCCCO certified.',
      },
    },
    {
      label: 'Regulatory (OSHA visit prep)',
      values: {
        name: 'Mercy Hospital Wing C',
        project_type: 'Commercial Electrical Retrofit',
        inspector: 'Anthony DiMarco (CSP)',
        type: 'regulatory',
        observed_conditions: 'LOTO documentation complete; arc-flash labels current; SDS binder up to date; OSHA 300A posted; emergency action plan walked through with crew.',
      },
    },
    {
      label: 'Pre-task lift inspection',
      values: {
        name: 'Tower 88 Curtain Wall',
        project_type: 'Glazing / Curtain Wall',
        inspector: 'Renee Halsey (NCCCO Rigger Level II)',
        type: 'pre-task',
        observed_conditions: '4200 lb panel lift planned at 110 ft radius; rigging tagged in date; wind 16 mph and steady; tag lines staged; pick zone barricaded.',
      },
    },
    {
      label: 'Focused PPE audit',
      values: {
        name: 'Greenway Solar Array',
        project_type: 'Utility-Scale Solar',
        inspector: 'Priya Nair (CHST)',
        type: 'focused',
        observed_conditions: 'PV install crew of 14; 12 of 14 in full PPE; 2 workers found with safety glasses on hard hat brim; arc-rated PPE present for DC combiner work.',
      },
    },
  ],
  'analyze-incident': [
    {
      label: 'Fall from leading edge',
      values: {
        site: 'Riverside Tower Phase II',
        type: 'fall',
        severity: 'high',
        injury_reported: 'true',
        occurred_at: '2026-04-12 09:42',
        description: 'Worker fell 8 ft from leading edge while setting rebar; PFAS lanyard found stowed in harness D-ring loop, not anchored. Hospitalized 24 hr observation.',
      },
    },
    {
      label: 'Struck-by tower crane load',
      values: {
        site: 'Tower 88 Curtain Wall',
        type: 'struck-by',
        severity: 'critical',
        injury_reported: 'true',
        occurred_at: '2026-03-28 14:10',
        description: 'Curtain-wall panel swung in 22 mph gust during landing at level 27; tag-line operator unable to control; panel struck scaffold crew. One fractured tibia.',
      },
    },
    {
      label: 'Arc-flash electrocution near-event',
      values: {
        site: 'Mercy Hospital Wing C',
        type: 'electrocution',
        severity: 'high',
        injury_reported: 'false',
        occurred_at: '2026-04-02 11:05',
        description: 'Electrician opened panel without re-verifying LOTO after lunch break; 480V bus was re-energized by other crew. No arc, no contact, but procedure failed.',
      },
    },
    {
      label: 'Trench caught-in',
      values: {
        site: 'East Campus Excavation',
        type: 'caught-in',
        severity: 'critical',
        injury_reported: 'true',
        occurred_at: '2026-04-21 08:55',
        description: 'Partial cave-in of 9 ft Type C trench; worker buried to mid-thigh while bedding pipe; shoring had been removed for pipe lay segment. Extricated in 14 min.',
      },
    },
    {
      label: 'Heat illness collapse',
      values: {
        site: 'Greenway Solar Array',
        type: 'other',
        severity: 'medium',
        injury_reported: 'true',
        occurred_at: '2026-04-30 13:20',
        description: 'PV installer collapsed during 96F heat index; no shade structure within 200 ft; water cooler last refilled 3 hr prior. Transported and rehydrated.',
      },
    },
  ],
  'verify-permit': [
    {
      label: 'Confined space (TBM cutterhead)',
      values: {
        type: 'confined-space',
        site: 'Downtown Tunnel Boring TBM-3',
        issued_to: 'Rafael Ortiz',
        valid_from: '2026-05-13',
        valid_to: '2026-05-14',
        scope_of_work: 'Inspect cutterhead bearings inside TBM shield during shutdown.',
        controls_in_place: 'Pre-entry atmospheric testing O2/LEL/CO/H2S; LOTO of cutterhead drive; ventilation 6 ACH; trained attendant; rescue team on standby.',
      },
    },
    {
      label: 'Hot work (welding in occupied bldg)',
      values: {
        type: 'hot-work',
        site: 'Mercy Hospital Wing C',
        issued_to: 'Carla Mendez',
        valid_from: '2026-05-13',
        valid_to: '2026-05-13',
        scope_of_work: 'MIG welding of structural steel support brackets in mechanical room above patient corridor.',
        controls_in_place: 'Fire watch 30 min post-work; ABC extinguisher on station; combustibles cleared 35 ft; fire blankets on penetrations; sprinkler heads protected.',
      },
    },
    {
      label: 'Excavation (>5 ft)',
      values: {
        type: 'excavation',
        site: 'East Campus Storm Drain',
        issued_to: 'Lourdes Vega',
        valid_from: '2026-05-13',
        valid_to: '2026-05-20',
        scope_of_work: 'Open 11 ft x 100 ft trench for 36 in storm drain installation.',
        controls_in_place: 'Hydraulic shoring; Caterpillar 320 excavator on opposite side from spoil; daily competent-person inspection; ladder access every 25 ft; locates verified.',
      },
    },
    {
      label: 'Electrical (energized work)',
      values: {
        type: 'electrical',
        site: 'Mercy Hospital Wing C',
        issued_to: 'Anthony DiMarco',
        valid_from: '2026-05-13',
        valid_to: '2026-05-13',
        scope_of_work: 'Voltage verification and temporary jumper install on 480V switchgear feeder, energized.',
        controls_in_place: 'NFPA 70E CAT-IV PPE; arc-flash boundary 42 in; second qualified person present; insulated tools rated 1000V; energized work permit reviewed by EE.',
      },
    },
    {
      label: 'Hot work (roof torch-down)',
      values: {
        type: 'hot-work',
        site: 'Saint Peters Cathedral Re-Roof',
        issued_to: 'Marcus Tate',
        valid_from: '2026-05-13',
        valid_to: '2026-05-13',
        scope_of_work: 'Torch-down membrane application on flat-roof transitions adjacent to steep-slope sections.',
        controls_in_place: 'Fire watch 2 hr post-work; two 20-lb ABC extinguishers on roof; thermal imaging sweep at end of shift; no work within 25 ft of skylight openings.',
      },
    },
  ],
  'recommend-training': [
    { label: 'Tower crane operator', values: { worker_role: 'Tower Crane Operator (Liebherr 550EC-B)' } },
    { label: 'Trench/excavation competent person', values: { worker_role: 'Trenching & Excavation Competent Person (29 CFR 1926 Subpart P)' } },
    { label: 'Steel erector / connector', values: { worker_role: 'Structural Steel Connector (29 CFR 1926 Subpart R)' } },
    { label: 'Electrical journeyman (NFPA 70E)', values: { worker_role: 'Electrical Journeyman performing energized work, NFPA 70E qualified' } },
    { label: 'PV / solar installer', values: { worker_role: 'Photovoltaic (PV) Installer, NABCEP certified, roof and DC combiner work' } },
  ],
  'ppe-detector': [
    {
      label: 'Tower crane operator on slab',
      values: {
        worker_id: 'W-1005',
        worker: 'David Olsen',
        site: 'Riverside Tower Phase II',
        task: 'Tower crane operator briefing in active slab pour zone',
        image_url: '',
        expected_ppe: 'hard hat, safety glasses, hi-vis Class 2, harness, gloves, steel-toe boots',
      },
    },
    {
      label: 'Welder hot work',
      values: {
        worker_id: 'W-2204',
        worker: 'Carla Mendez',
        site: 'Mercy Hospital Wing C',
        task: 'MIG welding structural brackets in mechanical room',
        image_url: '',
        expected_ppe: 'welding helmet (shade 11), FR jacket, FR gloves, leather apron, steel-toe boots, respirator P100',
      },
    },
    {
      label: 'Trench laborer with spoil pile',
      values: {
        worker_id: 'W-3310',
        worker: 'Lourdes Vega',
        site: 'East Campus Storm Drain',
        task: 'Pipe bedding in 11 ft Type C trench (hydraulic shored)',
        image_url: '',
        expected_ppe: 'hard hat, safety glasses, hi-vis Class 2, gloves, steel-toe boots, knee pads',
      },
    },
    {
      label: 'Electrician on 480V switchgear',
      values: {
        worker_id: 'W-4407',
        worker: 'Anthony DiMarco',
        site: 'Mercy Hospital Wing C',
        task: 'Energized 480V switchgear voltage verification',
        image_url: '',
        expected_ppe: 'arc-rated face shield CAT-IV, FR coverall 40 cal/cm2, voltage-rated gloves Class 0, hard hat, hearing protection',
      },
    },
    {
      label: 'Roofer steep slope',
      values: {
        worker_id: 'W-5512',
        worker: 'Marcus Tate',
        site: 'Saint Peters Cathedral Re-Roof',
        task: 'Steep-slope tear-off at 64 ft eave',
        image_url: '',
        expected_ppe: 'hard hat, safety glasses, hi-vis, full body harness with SRL anchored to lifeline, slip-resistant boots, gloves',
      },
    },
  ],
  'fatigue-predictor': [
    {
      label: 'Night-shift TBM operator',
      values: {
        worker: 'Rafael Ortiz',
        role: 'TBM Operator',
        recent_hours: '12, 12, 10, 12, 14, 12, 8',
        shift_pattern: 'Night shift, 5 consecutive',
        task_risk: 'high',
        notes: 'Heat 88F average; confined-space task tomorrow.',
      },
    },
    {
      label: 'Crane operator with overtime',
      values: {
        worker: 'David Olsen',
        role: 'Tower Crane Operator (Liebherr 550EC-B)',
        recent_hours: '10, 11, 12, 12, 10, 12, 11',
        shift_pattern: 'Day shift, 7-day streak',
        task_risk: 'critical',
        notes: '4200 lb curtain-wall pick planned tomorrow at 110 ft radius; forecast winds 18 mph.',
      },
    },
    {
      label: 'Trench laborer in heat',
      values: {
        worker: 'Lourdes Vega',
        role: 'Excavation Crew Lead',
        recent_hours: '10, 10, 10, 12, 10, 10, 10',
        shift_pattern: 'Day shift',
        task_risk: 'high',
        notes: 'Heat index forecast 96F; Type C soil; hand-grading inside trench.',
      },
    },
    {
      label: 'Electrician swing-shift',
      values: {
        worker: 'Anthony DiMarco',
        role: 'Electrical Journeyman (NFPA 70E)',
        recent_hours: '8, 10, 12, 8, 10, 10, 12',
        shift_pattern: 'Swing shift, rotating',
        task_risk: 'critical',
        notes: 'Energized 480V switchgear work in occupied hospital tomorrow; LOTO procedure 4 sources.',
      },
    },
    {
      label: 'Roofer back-to-back heat days',
      values: {
        worker: 'Marcus Tate',
        role: 'Roofing Foreman',
        recent_hours: '9, 9, 10, 10, 11, 10, 9',
        shift_pattern: 'Day shift',
        task_risk: 'medium',
        notes: 'Steep slope 9/12; 84-88F three days running; torch-down tomorrow.',
      },
    },
  ],
  'weather-stop-work': [
    {
      label: 'High winds + thunderstorms (curtain wall)',
      values: {
        site: 'Tower 88 Curtain Wall',
        active_operations: 'Glazing hoist 27F; boom-lift work; tower crane lifts.',
        wind_mph: 32,
        lightning_within_mi: 4,
        heat_index_f: 78,
        forecast: 'Thunderstorms by 14:00; sustained 28-35 mph SW winds; gusts to 45.',
      },
    },
    {
      label: 'Lightning within 6 mi (steel erection)',
      values: {
        site: 'Riverside Tower Phase II',
        active_operations: 'Steel erection at level 19; ironworker connectors at 200+ ft; tower crane hooks active.',
        wind_mph: 14,
        lightning_within_mi: 5,
        heat_index_f: 82,
        forecast: 'Convective cells forming; lightning detected at 6 mi closing; 60% probability of strikes by 15:00.',
      },
    },
    {
      label: 'Extreme heat (PV array)',
      values: {
        site: 'Greenway Solar Array',
        active_operations: 'PV panel install on south field; DC combiner wiring; cable trenching.',
        wind_mph: 6,
        lightning_within_mi: 25,
        heat_index_f: 108,
        forecast: 'Clear sky; ambient 102F; heat index peak 108F at 14:30; no rain expected.',
      },
    },
    {
      label: 'Heavy rain + cold (trenching)',
      values: {
        site: 'East Campus Storm Drain',
        active_operations: 'Trenching 11 ft Type C; hydraulic shoring set; pipe bedding crew in trench.',
        wind_mph: 12,
        lightning_within_mi: 30,
        heat_index_f: 42,
        forecast: '1.5 in rainfall by end of day; saturated soil; temp dropping to 38F overnight.',
      },
    },
    {
      label: 'Crane lift threshold (mobile crane)',
      values: {
        site: 'Harbor Pier 14 Reconstruction',
        active_operations: 'Mobile crane (Grove GMK5275) lifts of 28 ft precast pile caps; barge-mounted impact hammer.',
        wind_mph: 24,
        lightning_within_mi: 15,
        heat_index_f: 74,
        forecast: 'Sustained 20-25 mph onshore winds; gusts to 35; small craft advisory in effect.',
      },
    },
  ],
  'jha-generator': [
    {
      label: 'Pile driving from barge',
      values: {
        task: 'Pile driving from barge in 8 ft tidal water using Delmag D62-22 impact hammer',
        site: 'Harbor Pier 14 Reconstruction',
        crew_size: 6,
        duration_hours: 9,
        special_conditions: 'Tidal current 2 knots; vessel traffic nearby; impact hammer Delmag D62-22.',
      },
    },
    {
      label: 'Energized 480V switchgear work',
      values: {
        task: 'Voltage verification and temporary jumper installation on energized 480V switchgear feeder',
        site: 'Mercy Hospital Wing C',
        crew_size: 3,
        duration_hours: 4,
        special_conditions: 'NFPA 70E CAT-IV PPE required; arc-flash boundary 42 in; adjacent live patient corridor; LOTO on 4 sources.',
      },
    },
    {
      label: 'Tower crane curtain-wall lift',
      values: {
        task: 'Critical lift of 4200 lb glass curtain-wall panel to level 27 using Liebherr 550EC-B tower crane',
        site: 'Tower 88 Curtain Wall',
        crew_size: 5,
        duration_hours: 2,
        special_conditions: 'Awkward profile load; 110 ft working radius; tag-line crew x2; forecast winds 18 mph; pedestrian street below.',
      },
    },
    {
      label: 'Trench shoring & pipe lay',
      values: {
        task: 'Install hydraulic shoring and bed 36 in storm drain pipe in 11 ft Type C trench',
        site: 'East Campus Storm Drain',
        crew_size: 7,
        duration_hours: 10,
        special_conditions: 'Type C soil; high water table; Caterpillar 320 excavator on spoil side; underground utility locates within 18 in tolerance.',
      },
    },
    {
      label: 'Steep-slope torch-down roofing',
      values: {
        task: 'Torch-down membrane installation on flat-roof transitions adjacent to 9/12 steep-slope sections',
        site: 'Saint Peters Cathedral Re-Roof',
        crew_size: 4,
        duration_hours: 8,
        special_conditions: '64 ft eave height; horizontal lifeline + SRLs; JLG 1850SJ boom-lift for staging; skylights within work area; 88F forecast.',
      },
    },
  ],
  'near-miss-cluster': [
    { label: 'Last 30 days, all sites', values: { window_days: 30, context: 'Cluster recent near-misses across all active sites to surface leading indicators.' } },
    { label: 'Last 14 days, struck-by focus', values: { window_days: 14, context: 'Focus on struck-by and dropped-object near-misses near tower crane lift zones.' } },
    { label: 'Last 60 days, trenching/excavation', values: { window_days: 60, context: 'Trenching and excavation events at East Campus Storm Drain and similar Type C soil sites.' } },
    { label: 'Last 7 days, hot-work proximity', values: { window_days: 7, context: 'Hot-work near-miss proximity events; recent permit volume increase at Mercy Hospital Wing C.' } },
    { label: 'Quarterly heat-illness review', values: { window_days: 90, context: 'Quarterly heat-related near-misses across PV array and roofing crews; correlate with heat index data.' } },
  ],
  'contractor-score': [
    {
      label: 'Demolition specialist (mid-EMR)',
      values: {
        name: 'Liberty Demolition Services',
        license_no: 'MA-DM-1102',
        emr: '1.34',
        trir: '4.2',
        insurance_expiry: '2026-11-30',
        recent_incidents: 3,
        notes: 'Selective demolition only; one critical incident last year; OSHA 30 across foremen.',
      },
    },
    {
      label: 'Tower crane sub (strong record)',
      values: {
        name: 'Apex Crane & Rigging',
        license_no: 'NY-CR-4408',
        emr: '0.78',
        trir: '1.1',
        insurance_expiry: '2027-04-15',
        recent_incidents: 0,
        notes: 'NCCCO certified operators; 12-year clean record; primary on three high-rises in NYC.',
      },
    },
    {
      label: 'Electrical contractor (weak)',
      values: {
        name: 'Voltspark Electric LLC',
        license_no: 'OH-EL-2031',
        emr: '1.58',
        trir: '6.7',
        insurance_expiry: '2026-08-20',
        recent_incidents: 5,
        notes: 'Multiple energized-work incidents in last 18 mo; NFPA 70E training documentation incomplete.',
      },
    },
    {
      label: 'Roofing crew (steep slope)',
      values: {
        name: 'Apex Steep Slope Roofing',
        license_no: 'MO-RF-7712',
        emr: '0.95',
        trir: '2.8',
        insurance_expiry: '2026-12-31',
        recent_incidents: 1,
        notes: 'Specializes in cathedral and historic re-roof; one fall-from-eave 14 mo ago, corrective actions verified.',
      },
    },
    {
      label: 'Excavation subcontractor',
      values: {
        name: 'Cornerstone Excavation Co.',
        license_no: 'AZ-EX-3344',
        emr: '1.05',
        trir: '3.5',
        insurance_expiry: '2027-01-12',
        recent_incidents: 2,
        notes: 'Competent-Person Excavation across foremen; Caterpillar 320/330 fleet; two minor cave-ins, no injuries.',
      },
    },
  ],
  'claim-fraud': [
    {
      label: 'Late-reported back injury, no witness',
      values: {
        claim_id: 'CLM-16007',
        type: 'workers-comp',
        claimant: 'Lacey Brown - rigging strap failure alleged',
        amount_usd: 33500,
        description: 'Claimant alleges back injury during pile-driving rigging incident.',
        witnesses: 'None present',
        medical_provider: 'New provider, prior history with other claims',
        days_since_incident: 21,
      },
    },
    {
      label: 'Soft-tissue auto, low impact',
      values: {
        claim_id: 'CLM-16210',
        type: 'auto',
        claimant: 'Robert Hennessey - rear-ended at site entrance',
        amount_usd: 8800,
        description: 'Soft-tissue neck injury alleged; both vehicles below 5 mph; minimal property damage photos.',
        witnesses: 'Two co-claimant passengers only',
        medical_provider: 'Same chiropractor as 3 prior site claims',
        days_since_incident: 9,
      },
    },
    {
      label: 'GL trip-and-fall, high amount',
      values: {
        claim_id: 'CLM-16315',
        type: 'general-liability',
        claimant: 'Visitor trip-and-fall at site office trailer',
        amount_usd: 72000,
        description: 'Visitor alleges trip on temporary cable run causing knee injury requiring surgery.',
        witnesses: 'None on incident log; claimant says foreman saw it',
        medical_provider: 'Out-of-state orthopedic clinic',
        days_since_incident: 38,
      },
    },
    {
      label: 'WC cumulative trauma, prior history',
      values: {
        claim_id: 'CLM-16422',
        type: 'workers-comp',
        claimant: 'Worker alleging carpal tunnel from rebar tying',
        amount_usd: 18750,
        description: 'Cumulative trauma claim filed 3 days after layoff notice; no prior medical complaints in personnel file.',
        witnesses: 'N/A cumulative',
        medical_provider: 'Same provider as 2 other claims at company',
        days_since_incident: 0,
      },
    },
    {
      label: 'Clean WC, immediate report',
      values: {
        claim_id: 'CLM-16530',
        type: 'workers-comp',
        claimant: 'Diego Ramirez - hand laceration on rebar',
        amount_usd: 2400,
        description: 'Worker cut left palm on cut-rebar end; reported in 12 minutes; foreman witnessed and applied first aid.',
        witnesses: 'Foreman + 2 crew',
        medical_provider: 'Site occupational health partner',
        days_since_incident: 0,
      },
    },
  ],
  'training-gap': [
    {
      label: 'PV installer (NABCEP active)',
      values: {
        name: 'Priya Nair',
        role: 'PV Installer',
        site: 'Greenway Solar Array',
        certifications: 'OSHA 30, NABCEP PV Installation Professional, Fall Protection, NFPA 70E',
        cert_expiries: 'NFPA 70E 2026-08-10; First Aid expired 2026-03-01',
        planned_tasks: 'DC combiner wiring, arc-flash work, roof PV install',
      },
    },
    {
      label: 'Crane operator (NCCCO renewal due)',
      values: {
        name: 'David Olsen',
        role: 'Tower Crane Operator',
        site: 'Riverside Tower Phase II',
        certifications: 'OSHA 30, NCCCO Tower Crane Operator, Rigger Level II',
        cert_expiries: 'NCCCO Tower Crane 2026-07-30; Rigger Level II 2027-02-14',
        planned_tasks: 'Daily tower crane lifts, curtain-wall picks up to 4200 lb',
      },
    },
    {
      label: 'Excavation lead (gap on confined space)',
      values: {
        name: 'Lourdes Vega',
        role: 'Excavation Crew Lead',
        site: 'East Campus Storm Drain',
        certifications: 'OSHA 30, Competent Person Excavation, First Aid/CPR',
        cert_expiries: 'OSHA 30 2027-05-01; CPR 2026-09-12',
        planned_tasks: 'Trench shoring inspection, confined-space pipe vault entry, pipe bedding',
      },
    },
    {
      label: 'Electrician (NFPA 70E expired)',
      values: {
        name: 'Anthony DiMarco',
        role: 'Electrical Journeyman',
        site: 'Mercy Hospital Wing C',
        certifications: 'OSHA 30, Master Electrician, NFPA 70E (lapsed), Arc Flash Awareness',
        cert_expiries: 'NFPA 70E expired 2026-02-28; Master Electrician 2028-01-01',
        planned_tasks: 'Energized 480V switchgear work, LOTO supervision, arc-flash hazard analysis',
      },
    },
    {
      label: 'Roofing foreman (fall protection gap)',
      values: {
        name: 'Marcus Tate',
        role: 'Roofing Foreman',
        site: 'Saint Peters Cathedral Re-Roof',
        certifications: 'OSHA 30, Competent Person Fall Protection',
        cert_expiries: 'OSHA 30 2026-12-01; Competent Person Fall Protection 2026-06-15',
        planned_tasks: 'Steep-slope tear-off, horizontal lifeline anchor sign-off, JLG 1850SJ boom-lift supervision',
      },
    },
  ],
  'lift-plan': [
    {
      label: 'Curtain-wall panel (Liebherr 550EC-B)',
      values: {
        load_description: 'Curtain wall panel, 4 m x 3 m, awkward profile',
        load_weight_lbs: 4200,
        crane_model: 'Liebherr 550EC-B 20',
        crane_capacity_lbs: 44000,
        radius_ft: 110,
        site: 'Tower 88 Curtain Wall',
        wind_mph: 18,
      },
    },
    {
      label: 'Precast pile cap (Grove GMK5275)',
      values: {
        load_description: 'Precast concrete pile cap, 28 ft x 6 ft x 4 ft',
        load_weight_lbs: 48000,
        crane_model: 'Grove GMK5275',
        crane_capacity_lbs: 165000,
        radius_ft: 60,
        site: 'Harbor Pier 14 Reconstruction',
        wind_mph: 22,
      },
    },
    {
      label: 'HVAC chiller (Manitowoc 14000)',
      values: {
        load_description: 'Rooftop HVAC chiller, factory-assembled',
        load_weight_lbs: 22500,
        crane_model: 'Manitowoc 14000',
        crane_capacity_lbs: 230000,
        radius_ft: 90,
        site: 'Mercy Hospital Wing C',
        wind_mph: 10,
      },
    },
    {
      label: 'Steel girder (Liebherr LTM 1300)',
      values: {
        load_description: 'Structural steel girder, 60 ft span, W36x150',
        load_weight_lbs: 9000,
        crane_model: 'Liebherr LTM 1300-6.2',
        crane_capacity_lbs: 661000,
        radius_ft: 75,
        site: 'Riverside Tower Phase II',
        wind_mph: 14,
      },
    },
    {
      label: 'PV combiner skid (Grove RT9130E-2)',
      values: {
        load_description: 'PV DC combiner skid with conduit drops, palletized',
        load_weight_lbs: 6800,
        crane_model: 'Grove RT9130E-2',
        crane_capacity_lbs: 260000,
        radius_ft: 45,
        site: 'Greenway Solar Array',
        wind_mph: 12,
      },
    },
  ],
  'scaffold-inspector': [
    {
      label: 'Two-point suspended (high-rise)',
      values: {
        scaffold_id: 'SCAF-2201',
        site: 'Tower 88 Curtain Wall',
        type: 'suspended',
        height_ft: 280,
        platform_load_class: 'medium',
        condition_notes: 'Two-point suspended scaffold; one rope shows surface UV; outriggers tied off; daily inspection log up to date.',
      },
    },
    {
      label: 'Frame supported (hospital exterior)',
      values: {
        scaffold_id: 'SCAF-1108',
        site: 'Mercy Hospital Wing C',
        type: 'supported',
        height_ft: 42,
        platform_load_class: 'medium',
        condition_notes: 'Frame scaffold with mudsills on soft soil; cross-braces complete; guardrails installed; one base plate showing rust.',
      },
    },
    {
      label: 'JLG 1850SJ aerial lift',
      values: {
        scaffold_id: 'AERIAL-3315',
        site: 'Saint Peters Cathedral Re-Roof',
        type: 'aerial',
        height_ft: 185,
        platform_load_class: 'light',
        condition_notes: 'JLG 1850SJ boom-lift; pre-operation checklist signed; operator harnessed and lanyard anchored; outriggers extended.',
      },
    },
    {
      label: 'Mobile (rolling) scaffold',
      values: {
        scaffold_id: 'SCAF-4422',
        site: 'East Campus Excavation',
        type: 'mobile',
        height_ft: 20,
        platform_load_class: 'light',
        condition_notes: 'Rolling scaffold inside utility vault; casters locked; planking solid; access ladder integrated; height-to-base ratio under 3:1.',
      },
    },
    {
      label: 'Tube-and-coupler (industrial)',
      values: {
        scaffold_id: 'SCAF-5538',
        site: 'Harbor Pier 14 Reconstruction',
        type: 'tube-and-coupler',
        height_ft: 36,
        platform_load_class: 'heavy',
        condition_notes: 'Heavy-duty tube-and-coupler for pile-cap formwork; couplers torque-verified; toeboards installed; tidal exposure noted on uprights.',
      },
    },
  ],
};

// Alias map: the frontend AiPanel uses short feature keys (e.g. 'toolbox-talk'),
// but the POST verb is 'generate-toolbox-talk'. Map both to the same sample set.
const SAMPLE_ALIASES = {
  'generate-toolbox-talk': 'toolbox-talk',
};

// GET /api/ai/samples?feature=<verb> - returns 5 sample-fill scenarios for the requested feature.
router.get('/samples', (req, res) => {
  const raw = String(req.query.feature || '').trim();
  if (!raw) return res.status(400).json({ error: 'feature query param required' });
  const feature = SAMPLE_ALIASES[raw] || raw;
  const samples = SAMPLES[feature];
  if (!samples) return res.status(404).json({ error: `no samples for feature '${raw}'` });
  res.json({ samples });
});

// History (legacy path - all results)
router.get('/results', async (req, res) => {
  try {
    const limit = Math.min(200, parseInt(req.query.limit) || 50);
    const result = await pool.query(
      'SELECT id, feature, input, output, model, created_at FROM ai_results ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// History filtered by feature - GET /api/ai/history?feature=<name>
router.get('/history', async (req, res) => {
  try {
    const limit = Math.min(200, parseInt(req.query.limit) || 50);
    const feature = req.query.feature || null;
    let sql, params;
    if (feature) {
      sql = 'SELECT id, feature, input, output, model, created_at FROM ai_results WHERE feature = $1 ORDER BY created_at DESC LIMIT $2';
      params = [feature, limit];
    } else {
      sql = 'SELECT id, feature, input, output, model, created_at FROM ai_results ORDER BY created_at DESC LIMIT $1';
      params = [limit];
    }
    const result = await pool.query(sql, params);
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
