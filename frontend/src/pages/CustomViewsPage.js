import React from 'react';
import IncidentHeatmap from '../components/IncidentHeatmap';
import SafetyScoreTrend from '../components/SafetyScoreTrend';
import IncidentInvestigationPDF from '../components/IncidentInvestigationPDF';
import SafetyRulesEditor from '../components/SafetyRulesEditor';

export default function CustomViewsPage() {
  return (
    <div className="page" data-testid="custom-views-page">
      <div className="page-header">
        <h2 style={{ margin: 0 }}>Safety Views</h2>
        <div className="muted" style={{ fontSize: 12 }}>
          Custom views: incident heatmap, safety score trend, investigation report, and safety-rules / permit editor.
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginTop: 12 }}>
        <IncidentHeatmap />
        <SafetyScoreTrend />
        <IncidentInvestigationPDF />
        <SafetyRulesEditor />
      </div>
    </div>
  );
}
