const API_BASE = 'http://localhost:3131/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: { ...getHeaders(), ...(options.headers || {}) },
  });
  let data;
  try {
    data = await res.json();
  } catch (_) {
    data = { error: 'Non-JSON response' };
  }
  if (res.status === 401 || res.status === 403) {
    // Token missing/invalid/expired -> bounce to /login (but only for 401; 403 may be permission)
    if (res.status === 401 && url !== '/auth/login') {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (_) {}
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// Multipart upload for files
async function upload(url, formData) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  let data;
  try { data = await res.json(); } catch (_) { data = { error: 'Non-JSON response' }; }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// Auth
export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const getMe = () => request('/auth/me');

// Generic CRUD factory
function crud(path) {
  return {
    list: () => request(`/${path}`),
    get: (id) => request(`/${path}/${id}`),
    create: (data) => request(`/${path}`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/${path}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => request(`/${path}/${id}`, { method: 'DELETE' }),
  };
}

// Original 8
export const sitesApi = crud('sites');
export const workersApi = crud('workers');
export const equipmentApi = crud('equipment');
export const incidentsApi = crud('incidents');
export const inspectionsApi = crud('inspections');
export const permitsApi = crud('permits');
export const trainingsApi = crud('trainings');
export const hazardsApi = crud('hazards');

// 10 new
export const jhaApi = crud('jha');
export const nearMissesApi = crud('near_misses');
export const safetyMeetingsApi = crud('safety_meetings');
export const ppeInventoryApi = crud('ppe_inventory');
export const contractorsApi = crud('contractors');
export const subcontractorsApi = crud('subcontractors');
export const drugTestsApi = crud('drug_tests');
export const dotRecordsApi = crud('dot_records');
export const claimsApi = crud('claims');
export const vendorsApi = crud('vendors');
export const scaffoldTagComplianceApi = crud('scaffold-tag-compliance');

// AI - existing
export const aiPredictHazards = (site) =>
  request('/ai/predict-hazards', { method: 'POST', body: JSON.stringify({ site }) });
export const aiGenerateToolboxTalk = (topic) =>
  request('/ai/generate-toolbox-talk', { method: 'POST', body: JSON.stringify({ topic }) });
export const aiSynthesizeInspection = (site) =>
  request('/ai/synthesize-inspection', { method: 'POST', body: JSON.stringify({ site }) });
export const aiAnalyzeIncident = (incident) =>
  request('/ai/analyze-incident', { method: 'POST', body: JSON.stringify({ incident }) });
export const aiVerifyPermit = (permit_details) =>
  request('/ai/verify-permit', { method: 'POST', body: JSON.stringify({ permit_details }) });
export const aiRecommendTraining = (worker_role) =>
  request('/ai/recommend-training', { method: 'POST', body: JSON.stringify({ worker_role }) });

// AI - 10 new
export const aiPpeDetector = (payload) =>
  request('/ai/ppe-detector', { method: 'POST', body: JSON.stringify(payload) });
export const aiFatiguePredictor = (payload) =>
  request('/ai/fatigue-predictor', { method: 'POST', body: JSON.stringify(payload) });
export const aiWeatherStopWork = (payload) =>
  request('/ai/weather-stop-work', { method: 'POST', body: JSON.stringify(payload) });
export const aiJhaGenerator = (payload) =>
  request('/ai/jha-generator', { method: 'POST', body: JSON.stringify(payload) });
export const aiNearMissCluster = (payload) =>
  request('/ai/near-miss-cluster', { method: 'POST', body: JSON.stringify(payload || {}) });
export const aiContractorScore = (contractor) =>
  request('/ai/contractor-score', { method: 'POST', body: JSON.stringify({ contractor }) });
export const aiClaimFraud = (claim) =>
  request('/ai/claim-fraud', { method: 'POST', body: JSON.stringify({ claim }) });
export const aiTrainingGap = (worker) =>
  request('/ai/training-gap', { method: 'POST', body: JSON.stringify({ worker }) });
export const aiLiftPlan = (payload) =>
  request('/ai/lift-plan', { method: 'POST', body: JSON.stringify(payload) });
export const aiScaffoldInspector = (scaffold) =>
  request('/ai/scaffold-inspector', { method: 'POST', body: JSON.stringify({ scaffold }) });

// AI history (per-feature)
export const aiHistory = (feature, limit = 50) => {
  const qs = new URLSearchParams({ ...(feature ? { feature } : {}), limit }).toString();
  return request(`/ai/history?${qs}`);
};

// AI sample-fill scenarios (per-feature)
export const aiSamples = (feature) => {
  const qs = new URLSearchParams({ feature }).toString();
  return request(`/ai/samples?${qs}`);
};

// Notifications
export const notificationsList = (limit = 50) => request(`/notifications?limit=${limit}`);
export const notificationsUnreadCount = () => request('/notifications/unread-count');
export const notificationsMarkRead = (id) => request(`/notifications/${id}/read`, { method: 'POST' });
export const notificationsMarkAllRead = () => request('/notifications/mark-all-read', { method: 'POST' });

// Attachments
export const attachmentsList = (entity_type, entity_id) => {
  const qs = new URLSearchParams({ entity_type, entity_id }).toString();
  return request(`/attachments?${qs}`);
};
export const attachmentUpload = (entity_type, entity_id, file) => {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('entity_type', entity_type);
  fd.append('entity_id', entity_id);
  return upload('/attachments', fd);
};
export const attachmentDelete = (id) => request(`/attachments/${id}`, { method: 'DELETE' });

// Webhooks
export const webhooksApi = crud('webhooks');
export const webhookLogs = (id) => request(`/webhooks/${id}/logs`);
export const webhookLogsAll = () => request('/webhooks/logs/all');

// Bulk import
export const bulkImport = (entity, file) => {
  const fd = new FormData();
  fd.append('file', file);
  return upload(`/bulk-import/${entity}`, fd);
};

// ===== Apply pass 7: backlog =====

// 5 new AI endpoints
export const aiRcaAnalyzer = (incident) =>
  request('/ai/rca-analyzer', { method: 'POST', body: JSON.stringify({ incident }) });
export const aiNearMissSimilarity = (payload) =>
  request('/ai/near-miss-similarity', { method: 'POST', body: JSON.stringify(payload || {}) });
export const aiOshaNarrative = (incident) =>
  request('/ai/osha-narrative', { method: 'POST', body: JSON.stringify({ incident }) });
export const aiHazardImageClassifier = (payload) =>
  request('/ai/hazard-image-classifier', { method: 'POST', body: JSON.stringify(payload) });
export const aiLeadingIndicatorPredictor = (payload) =>
  request('/ai/leading-indicator-predictor', { method: 'POST', body: JSON.stringify(payload) });

// OSHA 300 / 300A reports
export const osha300 = (year, site, format = 'json') => {
  const qs = new URLSearchParams({ year, ...(site ? { site } : {}), format }).toString();
  return request(`/osha-reports/300?${qs}`);
};
export const osha300A = (year, site, format = 'json') => {
  const qs = new URLSearchParams({ year, ...(site ? { site } : {}), format }).toString();
  return request(`/osha-reports/300A?${qs}`);
};
// Direct CSV download URL (helper for <a download> links)
export const oshaReportCsvUrl = (which, year, site) => {
  const qs = new URLSearchParams({ year, ...(site ? { site } : {}), format: 'csv' }).toString();
  return `http://localhost:3131/api/osha-reports/${which}?${qs}`;
};

// Certifications CRUD + expiry
export const certificationsApi = crud('certifications');
export const certificationsExpiring = (days = 60) =>
  request(`/certifications/expiring?days=${days}`);

// Subcontractor onboarding
export const subcontractorOnboardingApi = crud('subcontractor-onboarding');
export const subcontractorOnboardingStages = () =>
  request('/subcontractor-onboarding/stages');
export const subcontractorOnboardingAdvance = (id) =>
  request(`/subcontractor-onboarding/${id}/advance`, { method: 'POST' });

// Lone-worker
export const loneWorkerApi = crud('lone-worker');
export const loneWorkerOverdue = () => request('/lone-worker/overdue');
export const loneWorkerAck = (id) => request(`/lone-worker/${id}/ack`, { method: 'POST' });

// Wearables + drones (stub status endpoints)
export const wearablesStatus = () => request('/wearables/status');
export const dronesStatus = () => request('/drones/status');
