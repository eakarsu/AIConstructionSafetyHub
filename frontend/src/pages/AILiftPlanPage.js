import React from 'react';
import AiPanel from '../components/AiPanel';
import { aiLiftPlan } from '../services/api';

export default function AILiftPlanPage() {
  return (
    <AiPanel
      feature="lift-plan"
      title="AI: Lift Plan & Rigging"
      subtitle="Generate a lift plan with rigging recommendations and safety checks."
      fields={[
        { key: 'load_description', label: 'Load Description' },
        { key: 'load_weight_lbs', label: 'Load Weight (lbs)', type: 'number' },
        { key: 'crane_model', label: 'Crane Model' },
        { key: 'crane_capacity_lbs', label: 'Crane Capacity (lbs)', type: 'number' },
        { key: 'radius_ft', label: 'Working Radius (ft)', type: 'number' },
        { key: 'site', label: 'Site' },
        { key: 'wind_mph', label: 'Forecast Wind (mph)', type: 'number' },
      ]}
      initial={{
        load_description: 'Curtain wall panel, 4 m x 3 m, awkward profile',
        load_weight_lbs: 4200,
        crane_model: 'Liebherr 550EC-B 20',
        crane_capacity_lbs: 44000,
        radius_ft: 110,
        site: 'Tower 88 Curtain Wall',
        wind_mph: 18,
      }}
      onRun={(form) => aiLiftPlan(form)}
    />
  );
}
