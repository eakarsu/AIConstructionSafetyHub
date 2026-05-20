import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import NotificationBell from './components/NotificationBell';

// Original 8 CRUD
import Dashboard from './pages/Dashboard';
import SitesPage from './pages/SitesPage';
import WorkersPage from './pages/WorkersPage';
import EquipmentPage from './pages/EquipmentPage';
import IncidentsPage from './pages/IncidentsPage';
import InspectionsPage from './pages/InspectionsPage';
import PermitsPage from './pages/PermitsPage';
import TrainingsPage from './pages/TrainingsPage';
import HazardsPage from './pages/HazardsPage';

// 10 new CRUD
import JHAPage from './pages/JHAPage';
import NearMissesPage from './pages/NearMissesPage';
import SafetyMeetingsPage from './pages/SafetyMeetingsPage';
import PPEInventoryPage from './pages/PPEInventoryPage';
import ContractorsPage from './pages/ContractorsPage';
import SubcontractorsPage from './pages/SubcontractorsPage';
import DrugTestsPage from './pages/DrugTestsPage';
import DOTRecordsPage from './pages/DOTRecordsPage';
import ClaimsPage from './pages/ClaimsPage';
import VendorsPage from './pages/VendorsPage';

// 6 existing AI
import AIPredictHazardsPage from './pages/AIPredictHazardsPage';
import AIToolboxTalkPage from './pages/AIToolboxTalkPage';
import AISynthesizeInspectionPage from './pages/AISynthesizeInspectionPage';
import AIAnalyzeIncidentPage from './pages/AIAnalyzeIncidentPage';
import AIVerifyPermitPage from './pages/AIVerifyPermitPage';
import AIRecommendTrainingPage from './pages/AIRecommendTrainingPage';

// 10 new AI
import AIPpeDetectorPage from './pages/AIPpeDetectorPage';
import AIFatiguePredictorPage from './pages/AIFatiguePredictorPage';
import AIWeatherStopWorkPage from './pages/AIWeatherStopWorkPage';
import AIJhaGeneratorPage from './pages/AIJhaGeneratorPage';
import AINearMissClusterPage from './pages/AINearMissClusterPage';
import AIContractorScorePage from './pages/AIContractorScorePage';
import AIClaimFraudPage from './pages/AIClaimFraudPage';
import AITrainingGapPage from './pages/AITrainingGapPage';
import AILiftPlanPage from './pages/AILiftPlanPage';
import AIScaffoldInspectorPage from './pages/AIScaffoldInspectorPage';

// Cross-cutting
import NotificationsPage from './pages/NotificationsPage';
import AttachmentsPage from './pages/AttachmentsPage';
import WebhooksPage from './pages/WebhooksPage';
import BulkImportPage from './pages/BulkImportPage';

import LoginPage from './pages/LoginPage';
import CustomViewsPage from './pages/CustomViewsPage';
import { LogOut, Menu } from 'lucide-react';
import './App.css';

function Shell({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  return (
    <div className={'app' + (sidebarOpen ? ' sidebar-open' : '')}>
      <Sidebar />
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <main className="main">
        <div className="topbar">
          <button className="btn secondary small icon-only mobile-only" onClick={() => setSidebarOpen((v) => !v)} aria-label="Toggle menu">
            <Menu size={14} />
          </button>
          <div className="topbar-spacer" />
          <NotificationBell />
          <span className="muted" style={{ fontSize: 12 }}>{user?.email} <span style={{ color: '#f59e0b' }}>({user?.role})</span></span>
          <button className="btn secondary small" onClick={onLogout}>
            <LogOut size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Logout
          </button>
        </div>
        <Routes>
          <Route path="/" element={<Dashboard />} />

          {/* Original 8 CRUD */}
          <Route path="/sites" element={<SitesPage />} />
          <Route path="/workers" element={<WorkersPage />} />
          <Route path="/equipment" element={<EquipmentPage />} />
          <Route path="/incidents" element={<IncidentsPage />} />
          <Route path="/inspections" element={<InspectionsPage />} />
          <Route path="/permits" element={<PermitsPage />} />
          <Route path="/trainings" element={<TrainingsPage />} />
          <Route path="/hazards" element={<HazardsPage />} />

          {/* 10 new CRUD */}
          <Route path="/jha" element={<JHAPage />} />
          <Route path="/near_misses" element={<NearMissesPage />} />
          <Route path="/safety_meetings" element={<SafetyMeetingsPage />} />
          <Route path="/ppe_inventory" element={<PPEInventoryPage />} />
          <Route path="/contractors" element={<ContractorsPage />} />
          <Route path="/subcontractors" element={<SubcontractorsPage />} />
          <Route path="/drug_tests" element={<DrugTestsPage />} />
          <Route path="/dot_records" element={<DOTRecordsPage />} />
          <Route path="/claims" element={<ClaimsPage />} />
          <Route path="/vendors" element={<VendorsPage />} />

          {/* 6 existing AI */}
          <Route path="/ai/predict-hazards" element={<AIPredictHazardsPage />} />
          <Route path="/ai/toolbox-talk" element={<AIToolboxTalkPage />} />
          <Route path="/ai/synthesize-inspection" element={<AISynthesizeInspectionPage />} />
          <Route path="/ai/analyze-incident" element={<AIAnalyzeIncidentPage />} />
          <Route path="/ai/verify-permit" element={<AIVerifyPermitPage />} />
          <Route path="/ai/recommend-training" element={<AIRecommendTrainingPage />} />

          {/* 10 new AI */}
          <Route path="/ai/ppe-detector" element={<AIPpeDetectorPage />} />
          <Route path="/ai/fatigue-predictor" element={<AIFatiguePredictorPage />} />
          <Route path="/ai/weather-stop-work" element={<AIWeatherStopWorkPage />} />
          <Route path="/ai/jha-generator" element={<AIJhaGeneratorPage />} />
          <Route path="/ai/near-miss-cluster" element={<AINearMissClusterPage />} />
          <Route path="/ai/contractor-score" element={<AIContractorScorePage />} />
          <Route path="/ai/claim-fraud" element={<AIClaimFraudPage />} />
          <Route path="/ai/training-gap" element={<AITrainingGapPage />} />
          <Route path="/ai/lift-plan" element={<AILiftPlanPage />} />
          <Route path="/ai/scaffold-inspector" element={<AIScaffoldInspectorPage />} />

          {/* Custom Views */}
          <Route path="/custom-views" element={<CustomViewsPage />} />

          {/* Cross-cutting */}
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/attachments" element={<AttachmentsPage />} />
          <Route path="/webhooks" element={<WebhooksPage />} />
          <Route path="/bulk-import" element={<BulkImportPage />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

function LoginRoute({ onLogin }) {
  const nav = useNavigate();
  return <LoginPage onLogin={(u, t) => { onLogin(u, t); nav('/', { replace: true }); }} />;
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch (_) { return null; }
  });

  const handleLogin = (u, t) => {
    setUser(u);
    setToken(t);
    try {
      localStorage.setItem('token', t);
      localStorage.setItem('user', JSON.stringify(u));
    } catch (_) {}
  };
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (_) {}
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={token ? <Navigate to="/" replace /> : <LoginRoute onLogin={handleLogin} />}
        />
        <Route
          path="/*"
          element={token ? <Shell user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}
