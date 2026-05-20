import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, HardHat, Wrench, AlertTriangle, ClipboardCheck,
  FileBadge, GraduationCap, ShieldAlert, Brain, FileText, Bot,
  CheckSquare, ListChecks, ClipboardList, AlertOctagon, Users, Package,
  Briefcase, UserCheck, FlaskConical, Truck, FileWarning, Building,
  ShieldCheck, Activity, Wind, BarChart3, Search, ArrowUpCircle, Layers,
  Bell, Paperclip, Webhook, Upload
} from 'lucide-react';

const sections = [
  {
    title: 'Site Management',
    cards: [
      { to: '/sites', title: 'Sites', desc: 'Active construction sites and supervisors.', icon: <Building2 size={18} /> },
      { to: '/workers', title: 'Workers', desc: 'Roster, certifications, OSHA compliance.', icon: <HardHat size={18} /> },
      { to: '/equipment', title: 'Equipment', desc: 'Heavy equipment registry and inspections.', icon: <Wrench size={18} /> },
      { to: '/ppe_inventory', title: 'PPE Inventory', desc: 'Stock thresholds and audit log.', icon: <Package size={18} /> },
    ],
  },
  {
    title: 'Compliance',
    cards: [
      { to: '/incidents', title: 'Incidents', desc: 'Log and investigate site incidents.', icon: <AlertTriangle size={18} /> },
      { to: '/near_misses', title: 'Near Misses', desc: 'Track near-miss events and actions.', icon: <AlertOctagon size={18} /> },
      { to: '/inspections', title: 'Inspections', desc: 'Weekly, monthly, regulatory inspections.', icon: <ClipboardCheck size={18} /> },
      { to: '/permits', title: 'Permits', desc: 'Hot-work, confined-space, excavation, electrical.', icon: <FileBadge size={18} /> },
      { to: '/trainings', title: 'Trainings', desc: 'Schedule and track training.', icon: <GraduationCap size={18} /> },
      { to: '/hazards', title: 'Hazards', desc: 'Active hazards with control measures.', icon: <ShieldAlert size={18} /> },
      { to: '/jha', title: 'JHA', desc: 'Pre-task job hazard analyses.', icon: <ClipboardList size={18} /> },
      { to: '/safety_meetings', title: 'Safety Meetings', desc: 'Toolbox talks and crew meetings.', icon: <Users size={18} /> },
    ],
  },
  {
    title: 'People / Partners',
    cards: [
      { to: '/contractors', title: 'Contractors', desc: 'Approved contractor roster.', icon: <Briefcase size={18} /> },
      { to: '/subcontractors', title: 'Subcontractors', desc: 'Tier 2 trades by parent contractor.', icon: <UserCheck size={18} /> },
      { to: '/vendors', title: 'Vendors', desc: 'Vendors with W9 and insurance status.', icon: <Building size={18} /> },
      { to: '/drug_tests', title: 'Drug Tests', desc: 'Random, incident, pre-employment testing.', icon: <FlaskConical size={18} /> },
      { to: '/dot_records', title: 'DOT Records', desc: 'CDL, medical card, HOS, violations.', icon: <Truck size={18} /> },
      { to: '/claims', title: 'Claims', desc: 'Workers-comp, GL, auto claims.', icon: <FileWarning size={18} /> },
    ],
  },
  {
    title: 'AI Safety Tools',
    cards: [
      { to: '/ai/predict-hazards', title: 'Predict Hazards', desc: 'Forecast likely site hazards + controls.', icon: <Brain size={18} /> },
      { to: '/ai/toolbox-talk', title: 'Toolbox Talk', desc: 'Generate a complete script.', icon: <FileText size={18} /> },
      { to: '/ai/synthesize-inspection', title: 'Synthesize Inspection', desc: 'Draft a full inspection report.', icon: <ListChecks size={18} /> },
      { to: '/ai/analyze-incident', title: 'Analyze Incident', desc: 'Root cause + OSHA citation risk + plan.', icon: <Bot size={18} /> },
      { to: '/ai/verify-permit', title: 'Verify Permit', desc: 'OSHA-compliance check on permit.', icon: <CheckSquare size={18} /> },
      { to: '/ai/recommend-training', title: 'Recommend Training', desc: 'Role-based training plan.', icon: <GraduationCap size={18} /> },
      { to: '/ai/ppe-detector', title: 'PPE Detector', desc: 'PPE compliance and missing items.', icon: <ShieldCheck size={18} /> },
      { to: '/ai/fatigue-predictor', title: 'Fatigue Predictor', desc: 'Score worker fatigue from hours.', icon: <Activity size={18} /> },
      { to: '/ai/weather-stop-work', title: 'Weather Stop-Work', desc: 'Forecast-driven stop-work calls.', icon: <Wind size={18} /> },
      { to: '/ai/jha-generator', title: 'JHA Generator', desc: 'Draft a Job Hazard Analysis.', icon: <ClipboardList size={18} /> },
      { to: '/ai/near-miss-cluster', title: 'Near-Miss Cluster', desc: 'Leading indicator analysis.', icon: <BarChart3 size={18} /> },
      { to: '/ai/contractor-score', title: 'Contractor Score', desc: 'Multi-factor safety score.', icon: <Search size={18} /> },
      { to: '/ai/claim-fraud', title: 'Claim Fraud', desc: 'Fraud likelihood + indicators.', icon: <FileWarning size={18} /> },
      { to: '/ai/training-gap', title: 'Training Gap', desc: 'Gaps vs role requirements.', icon: <GraduationCap size={18} /> },
      { to: '/ai/lift-plan', title: 'Lift Plan', desc: 'Crane lift plan + rigging.', icon: <ArrowUpCircle size={18} /> },
      { to: '/ai/scaffold-inspector', title: 'Scaffold Inspector', desc: 'Checklist + risk score.', icon: <Layers size={18} /> },
    ],
  },
  {
    title: 'System',
    cards: [
      { to: '/notifications', title: 'Notifications', desc: 'High-signal events and alerts.', icon: <Bell size={18} /> },
      { to: '/attachments', title: 'Attachments', desc: 'Photo/document uploads.', icon: <Paperclip size={18} /> },
      { to: '/webhooks', title: 'Webhooks', desc: 'HMAC-signed event delivery.', icon: <Webhook size={18} /> },
      { to: '/bulk-import', title: 'Bulk CSV Import', desc: 'Workers / contractors / permits.', icon: <Upload size={18} /> },
    ],
  },
];

export default function Dashboard() {
  const nav = useNavigate();
  const total = sections.reduce((s, x) => s + x.cards.length, 0);
  return (
    <div>
      <div className="page-title">
        <div>
          <h1>Construction Safety Hub</h1>
          <p>OSHA-compliant site management - 18 CRUD + 16 AI + 5 cross-cutting ({total} cards).</p>
        </div>
      </div>
      {sections.map((s) => (
        <div key={s.title} style={{ marginBottom: 24 }}>
          <div className="section-title">{s.title}</div>
          <div className="grid cols-4">
            {s.cards.map((c) => (
              <div key={c.to} className="dashboard-card" onClick={() => nav(c.to)}>
                <div className="icon">{c.icon}</div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
