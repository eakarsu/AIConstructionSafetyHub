import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home, Building2, HardHat, Wrench, AlertTriangle, ClipboardCheck,
  FileBadge, GraduationCap, ShieldAlert, Brain, FileText, Bot,
  CheckSquare, ListChecks, ClipboardList, AlertOctagon, Users, Package,
  Briefcase, UserCheck, FlaskConical, Truck, FileWarning, Building,
  ShieldCheck, Wind, Activity, Search, BarChart3, ArrowUpCircle, Layers,
  Bell, Paperclip, Webhook, Upload, Eye
} from 'lucide-react';

const ICON = { size: 16 };

const groups = [
  {
    label: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: <Home {...ICON} /> },
      { to: '/notifications', label: 'Notifications', icon: <Bell {...ICON} /> },
    ],
  },
  {
    label: 'Site Management',
    items: [
      { to: '/sites', label: 'Sites', icon: <Building2 {...ICON} /> },
      { to: '/workers', label: 'Workers', icon: <HardHat {...ICON} /> },
      { to: '/equipment', label: 'Equipment', icon: <Wrench {...ICON} /> },
      { to: '/ppe_inventory', label: 'PPE Inventory', icon: <Package {...ICON} /> },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { to: '/incidents', label: 'Incidents', icon: <AlertTriangle {...ICON} /> },
      { to: '/near_misses', label: 'Near Misses', icon: <AlertOctagon {...ICON} /> },
      { to: '/inspections', label: 'Inspections', icon: <ClipboardCheck {...ICON} /> },
      { to: '/permits', label: 'Permits', icon: <FileBadge {...ICON} /> },
      { to: '/trainings', label: 'Trainings', icon: <GraduationCap {...ICON} /> },
      { to: '/hazards', label: 'Hazards', icon: <ShieldAlert {...ICON} /> },
      { to: '/jha', label: 'JHA', icon: <ClipboardList {...ICON} /> },
      { to: '/safety_meetings', label: 'Safety Meetings', icon: <Users {...ICON} /> },
    ],
  },
  {
    label: 'People / Partners',
    items: [
      { to: '/contractors', label: 'Contractors', icon: <Briefcase {...ICON} /> },
      { to: '/subcontractors', label: 'Subcontractors', icon: <UserCheck {...ICON} /> },
      { to: '/vendors', label: 'Vendors', icon: <Building {...ICON} /> },
      { to: '/drug_tests', label: 'Drug Tests', icon: <FlaskConical {...ICON} /> },
      { to: '/dot_records', label: 'DOT Records', icon: <Truck {...ICON} /> },
      { to: '/claims', label: 'Claims', icon: <FileWarning {...ICON} /> },
    ],
  },
  {
    label: 'AI Safety Tools',
    items: [
      { to: '/ai/predict-hazards', label: 'Predict Hazards', icon: <Brain {...ICON} /> },
      { to: '/ai/toolbox-talk', label: 'Toolbox Talks', icon: <FileText {...ICON} /> },
      { to: '/ai/synthesize-inspection', label: 'Synthesize Inspection', icon: <ListChecks {...ICON} /> },
      { to: '/ai/analyze-incident', label: 'Analyze Incident', icon: <Bot {...ICON} /> },
      { to: '/ai/verify-permit', label: 'Verify Permit', icon: <CheckSquare {...ICON} /> },
      { to: '/ai/recommend-training', label: 'Recommend Training', icon: <GraduationCap {...ICON} /> },
      { to: '/ai/ppe-detector', label: 'PPE Detector', icon: <ShieldCheck {...ICON} /> },
      { to: '/ai/fatigue-predictor', label: 'Fatigue Predictor', icon: <Activity {...ICON} /> },
      { to: '/ai/weather-stop-work', label: 'Weather Stop-Work', icon: <Wind {...ICON} /> },
      { to: '/ai/jha-generator', label: 'JHA Generator', icon: <ClipboardList {...ICON} /> },
      { to: '/ai/near-miss-cluster', label: 'Near-Miss Cluster', icon: <BarChart3 {...ICON} /> },
      { to: '/ai/contractor-score', label: 'Contractor Score', icon: <Search {...ICON} /> },
      { to: '/ai/claim-fraud', label: 'Claim Fraud', icon: <FileWarning {...ICON} /> },
      { to: '/ai/training-gap', label: 'Training Gap', icon: <GraduationCap {...ICON} /> },
      { to: '/ai/lift-plan', label: 'Lift Plan', icon: <ArrowUpCircle {...ICON} /> },
      { to: '/ai/scaffold-inspector', label: 'Scaffold Inspector', icon: <Layers {...ICON} /> },
    ],
  },
  {
    label: 'Custom',
    items: [
      { to: '/custom-views', label: 'Safety Views', icon: <Eye {...ICON} /> },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/attachments', label: 'Attachments', icon: <Paperclip {...ICON} /> },
      { to: '/webhooks', label: 'Webhooks', icon: <Webhook {...ICON} /> },
      { to: '/bulk-import', label: 'Bulk CSV Import', icon: <Upload {...ICON} /> },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">CONSTRUCTION SAFETY HUB</div>
      {groups.map((g) => (
        <div key={g.label}>
          <div className="nav-group">{g.label}</div>
          {g.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      ))}
    </aside>
  );
}
