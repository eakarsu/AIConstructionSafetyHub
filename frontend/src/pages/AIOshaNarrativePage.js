import React from 'react';
import AiPanel from '../components/AiPanel';
import { aiOshaNarrative } from '../services/api';

export default function AIOshaNarrativePage() {
  return (
    <AiPanel
      feature="osha-narrative"
      title="AI: OSHA 301 / 300 Narrative Drafter"
      subtitle="Generate OSHA 301 narrative and a 300-log entry from raw incident fields."
      fields={[
        { key: 'employee_name', label: 'Employee Name' },
        { key: 'job_title', label: 'Job Title' },
        { key: 'date_of_event', label: 'Date of Event' },
        { key: 'site', label: 'Site' },
        { key: 'establishment_name', label: 'Establishment Name' },
        { key: 'where_event_occurred', label: 'Where Event Occurred' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'days_away_from_work', label: 'Days Away From Work', type: 'number' },
      ]}
      initial={{
        employee_name: 'Diego Ramirez',
        job_title: 'Scaffold Erector',
        date_of_event: '2026-03-28',
        site: 'Tower 88 Curtain Wall',
        establishment_name: 'Skyline Builders LLC',
        where_event_occurred: 'Level 27 scaffold platform',
        description: 'Curtain-wall panel swung in gust during landing; panel struck scaffold crew; one fractured tibia, hospitalized.',
        days_away_from_work: 14,
      }}
      onRun={(form) => aiOshaNarrative(form)}
    />
  );
}
