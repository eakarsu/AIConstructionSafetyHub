import React from 'react';
import AiPanel from '../components/AiPanel';
import { aiWeatherStopWork } from '../services/api';

export default function AIWeatherStopWorkPage() {
  return (
    <AiPanel
      feature="weather-stop-work"
      title="AI: Weather Stop-Work"
      subtitle="OSHA-aligned stop-work recommendation based on a forecast."
      fields={[
        { key: 'site', label: 'Site' },
        { key: 'active_operations', label: 'Active Operations', type: 'textarea' },
        { key: 'wind_mph', label: 'Forecast Wind (mph)', type: 'number' },
        { key: 'lightning_within_mi', label: 'Lightning Distance (mi)', type: 'number' },
        { key: 'heat_index_f', label: 'Heat Index (F)', type: 'number' },
        { key: 'forecast', label: 'Forecast Summary', type: 'textarea' },
      ]}
      initial={{
        site: 'Tower 88 Curtain Wall',
        active_operations: 'Glazing hoist 27F; boom-lift work; tower crane lifts.',
        wind_mph: 32,
        lightning_within_mi: 4,
        heat_index_f: 78,
        forecast: 'Thunderstorms by 14:00; sustained 28-35 mph SW winds; gusts to 45.',
      }}
      onRun={(form) => aiWeatherStopWork(form)}
    />
  );
}
