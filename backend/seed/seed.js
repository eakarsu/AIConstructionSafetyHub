const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../../.env' });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'construction_safety_hub',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const SITES = [
  ['SITE-001', 'Riverside Tower Phase II', '4400 Riverside Blvd, Sacramento, CA', 'High-rise Residential', 'active', 'James Conroy', 142],
  ['SITE-002', 'I-90 Bridge Deck Replacement', 'MP 312 I-90 EB, Cleveland, OH', 'Infrastructure - Bridge', 'active', 'Maria Delgado', 67],
  ['SITE-003', 'Northgate Hospital Wing', '1100 Northgate Way, Seattle, WA', 'Healthcare', 'active', 'Devon Brooks', 198],
  ['SITE-004', 'Logistics Hub 7', '900 Industrial Pkwy, Memphis, TN', 'Industrial / Warehouse', 'active', 'Aisha Robinson', 84],
  ['SITE-005', 'Sunset Plaza Mixed-Use', '2200 Sunset Blvd, Los Angeles, CA', 'Mixed-use', 'paused', 'Tom Whitford', 31],
  ['SITE-006', 'Pine Ridge Wind Farm Substation', 'Pine Ridge Rd, Casper, WY', 'Energy - Electrical', 'active', 'Heather Liang', 22],
  ['SITE-007', 'Downtown Tunnel Boring TBM-3', 'Sec 4, Downtown Loop, Atlanta, GA', 'Infrastructure - Tunneling', 'active', 'Rafael Ortiz', 56],
  ['SITE-008', 'East Campus Excavation', 'University Dr, Madison, WI', 'Excavation / Foundation', 'active', 'Kim Park', 38],
  ['SITE-009', 'Riverwalk Pedestrian Bridge', 'Riverwalk Mile 3, Pittsburgh, PA', 'Steel Erection', 'active', 'Jose Ramirez', 19],
  ['SITE-010', 'Harbor Pier 14 Reconstruction', 'Pier 14, Oakland, CA', 'Marine Construction', 'active', 'Lacey Brown', 44],
  ['SITE-011', 'Tower 88 Curtain Wall', '88 Bayfront Ave, San Francisco, CA', 'High-rise Commercial', 'active', 'Brandon Hsu', 73],
  ['SITE-012', 'County Roof Replacement', '50 Civic Center, Phoenix, AZ', 'Roofing', 'active', 'Whitney Adams', 12],
  ['SITE-013', 'Refinery Turnaround Unit 22', '1 Refinery Rd, Baytown, TX', 'Industrial - Petrochemical', 'active', 'Marcus Whitlock', 215],
  ['SITE-014', 'Old Mill Demolition', '700 Mill St, Lowell, MA', 'Demolition', 'closed', 'Erin Sullivan', 0],
  ['SITE-015', 'Greenway Solar Array', 'Sunrise Hwy, Albuquerque, NM', 'Renewable Energy', 'active', 'Priya Nair', 47],
];

const WORKERS = [
  ['W-1001', 'James Conroy', 'Site Supervisor', 'OSHA 30, CHST, First Aid/CPR', 'Riverside Tower Phase II', 'active', '2019-03-15'],
  ['W-1002', 'Maria Delgado', 'Bridge Foreman', 'OSHA 30, NCCCO Mobile Crane, ATSSA Flagger', 'I-90 Bridge Deck Replacement', 'active', '2017-08-22'],
  ['W-1003', 'Tyrone Jackson', 'Ironworker Journeyman', 'OSHA 10, AWS Certified Welder, Fall Protection', 'Tower 88 Curtain Wall', 'active', '2020-01-09'],
  ['W-1004', 'Sofia Reyes', 'Electrician (Master)', 'OSHA 30, NFPA 70E, Confined Space Entry', 'Pine Ridge Wind Farm Substation', 'active', '2015-11-30'],
  ['W-1005', 'David Olsen', 'Crane Operator', 'NCCCO Tower Crane TLL/STC, OSHA 30, Rigging Level II', 'Riverside Tower Phase II', 'active', '2013-06-04'],
  ['W-1006', 'Aisha Robinson', 'Safety Manager', 'OSHA 500, CSP, CHST, EM 385-1-1', 'Logistics Hub 7', 'active', '2018-04-17'],
  ['W-1007', 'Brandon Hsu', 'Glazier', 'OSHA 30, Suspended Scaffold Competent Person', 'Tower 88 Curtain Wall', 'active', '2021-02-11'],
  ['W-1008', 'Whitney Adams', 'Roofing Foreman', 'OSHA 30, Fall Protection Competent Person, Heat Illness', 'County Roof Replacement', 'active', '2016-09-25'],
  ['W-1009', 'Rafael Ortiz', 'TBM Operator', 'OSHA 30, MSHA Part 48, Confined Space Rescue', 'Downtown Tunnel Boring TBM-3', 'active', '2014-12-01'],
  ['W-1010', 'Kim Park', 'Excavation Competent Person', 'OSHA 30, Trench/Excavation CP, Soils Classification', 'East Campus Excavation', 'active', '2019-07-18'],
  ['W-1011', 'Jose Ramirez', 'Welder (Structural)', 'OSHA 30, AWS D1.1, Hot Work Permit Issuer', 'Riverwalk Pedestrian Bridge', 'on_leave', '2018-10-12'],
  ['W-1012', 'Lacey Brown', 'Pile Driver Operator', 'OSHA 30, NCCCO Pile Driver, Marine Construction', 'Harbor Pier 14 Reconstruction', 'active', '2017-05-29'],
  ['W-1013', 'Marcus Whitlock', 'Pipefitter', 'OSHA 30, TWIC, H2S Awareness, Confined Space', 'Refinery Turnaround Unit 22', 'active', '2012-08-08'],
  ['W-1014', 'Priya Nair', 'PV Installer', 'OSHA 30, NABCEP PV, Fall Protection, Arc Flash NFPA 70E', 'Greenway Solar Array', 'active', '2020-04-06'],
  ['W-1015', 'Erin Sullivan', 'Demolition Foreman', 'OSHA 30, Asbestos Supervisor, Lead RRP, Silica CP', 'Old Mill Demolition', 'inactive', '2010-02-14'],
];

const EQUIPMENT = [
  ['EQ-2001', 'Excavator', 'Caterpillar', 'CAT320-7H89212', 'East Campus Excavation', 'operational', '2026-04-22'],
  ['EQ-2002', 'Tower Crane', 'Liebherr', '550EC-B 20-7301', 'Riverside Tower Phase II', 'operational', '2026-05-02'],
  ['EQ-2003', 'Articulating Boom Lift', 'JLG', '1850SJ-A18230', 'Tower 88 Curtain Wall', 'operational', '2026-05-09'],
  ['EQ-2004', 'Telehandler', 'Genie', 'GTH-1056-G56221', 'Logistics Hub 7', 'maintenance', '2026-03-14'],
  ['EQ-2005', 'Skid Steer Loader', 'Bobcat', 'S770-T0119', 'Old Mill Demolition', 'decommissioned', '2025-11-30'],
  ['EQ-2006', 'Hydraulic Crawler Crane', 'Manitowoc', 'MLC300-30077', 'Harbor Pier 14 Reconstruction', 'operational', '2026-04-30'],
  ['EQ-2007', 'Pile Driver Hammer', 'Delmag', 'D62-22-PH1101', 'Harbor Pier 14 Reconstruction', 'operational', '2026-04-15'],
  ['EQ-2008', 'Aerial Scissor Lift', 'Skyjack', 'SJIII-4632-441', 'Northgate Hospital Wing', 'operational', '2026-05-11'],
  ['EQ-2009', 'Concrete Pump Truck', 'Putzmeister', 'BSF38-16H-P892', 'Riverside Tower Phase II', 'operational', '2026-05-01'],
  ['EQ-2010', 'TBM (Tunnel Boring)', 'Herrenknecht', 'EPB-S1080-AT3', 'Downtown Tunnel Boring TBM-3', 'operational', '2026-04-28'],
  ['EQ-2011', 'Backhoe Loader', 'John Deere', '410L-JD41001', 'I-90 Bridge Deck Replacement', 'operational', '2026-05-05'],
  ['EQ-2012', 'Diesel Generator 250kW', 'Caterpillar', 'XQ250-CAT-7702', 'Pine Ridge Wind Farm Substation', 'maintenance', '2026-03-22'],
  ['EQ-2013', 'Welding Machine', 'Lincoln Electric', 'PIPELINER-200D-LE3', 'Refinery Turnaround Unit 22', 'operational', '2026-04-19'],
  ['EQ-2014', 'Forklift (Rough Terrain)', 'CAT', 'TL642D-CAT9911', 'Logistics Hub 7', 'operational', '2026-04-26'],
  ['EQ-2015', 'Vacuum Excavator', 'Vactor', 'HXX-V8-VT2241', 'East Campus Excavation', 'operational', '2026-05-08'],
];

const INCIDENTS = [
  ['INC-3001', 'Riverside Tower Phase II', 'fall', 'high', true, '2026-04-12 09:42:00', 'investigating', 'Worker fell 8 ft from leading edge; harness was unanchored.'],
  ['INC-3002', 'I-90 Bridge Deck Replacement', 'struck-by', 'medium', true, '2026-04-18 14:10:00', 'closed', 'Worker struck by swinging rebar bundle during crane lift.'],
  ['INC-3003', 'Pine Ridge Wind Farm Substation', 'electrocution', 'critical', true, '2026-02-09 11:05:00', 'closed', 'Apprentice contacted energized 480V conductor during panel work; LOTO not verified.'],
  ['INC-3004', 'East Campus Excavation', 'caught-in', 'critical', false, '2026-05-01 07:30:00', 'investigating', 'Near-miss trench wall sloughing; competent person evacuated crew in time.'],
  ['INC-3005', 'Tower 88 Curtain Wall', 'fall', 'medium', false, '2026-04-25 10:15:00', 'open', 'Tool dropped from boom lift, no PFAS lanyard.'],
  ['INC-3006', 'Refinery Turnaround Unit 22', 'other', 'high', true, '2026-03-30 22:11:00', 'closed', 'H2S exposure during turnaround; gas monitor alarm acknowledged late.'],
  ['INC-3007', 'County Roof Replacement', 'fall', 'medium', false, '2026-05-09 13:00:00', 'open', 'Worker leaned against parapet without anchorage; coached on the spot.'],
  ['INC-3008', 'Downtown Tunnel Boring TBM-3', 'caught-in', 'high', true, '2026-01-22 18:40:00', 'closed', 'Hand pinched between segment erector and ring; one fractured finger.'],
  ['INC-3009', 'Harbor Pier 14 Reconstruction', 'struck-by', 'high', false, '2026-04-04 15:20:00', 'closed', 'Falling load - rigging strap failed inspection criteria.'],
  ['INC-3010', 'Riverside Tower Phase II', 'other', 'low', false, '2026-05-10 12:45:00', 'open', 'Heat stress symptoms reported by 2 workers; rotated to shade and hydrated.'],
  ['INC-3011', 'Logistics Hub 7', 'struck-by', 'medium', true, '2026-03-17 08:55:00', 'closed', 'Forklift backed into pedestrian worker - no spotter, blocked sightline.'],
  ['INC-3012', 'Greenway Solar Array', 'electrocution', 'medium', false, '2026-04-29 16:00:00', 'open', 'DC arc flash near combiner box, FR clothing prevented injury.'],
  ['INC-3013', 'Northgate Hospital Wing', 'other', 'low', false, '2026-05-04 11:30:00', 'closed', 'Silica dust exposure exceeded action level on wet-cut saw.'],
  ['INC-3014', 'Sunset Plaza Mixed-Use', 'fall', 'critical', true, '2026-02-14 09:20:00', 'closed', 'Worker fell 14 ft through unguarded floor opening; project paused.'],
  ['INC-3015', 'Old Mill Demolition', 'caught-in', 'high', true, '2025-12-08 14:00:00', 'closed', 'Crushed by partial floor collapse during selective demo.'],
];

const INSPECTIONS = [
  ['INS-4001', 'Riverside Tower Phase II', 'James Conroy', 'weekly', 92, true, '2026-05-12 08:00:00', 'PFAS compliance strong; one missing toeboard on 14F.'],
  ['INS-4002', 'I-90 Bridge Deck Replacement', 'Maria Delgado', 'weekly', 88, true, '2026-05-13 07:30:00', 'TTC zone good; replace 2 worn rigging slings.'],
  ['INS-4003', 'Northgate Hospital Wing', 'Aisha Robinson', 'monthly', 95, true, '2026-05-01 09:00:00', 'Excellent housekeeping; silica controls verified.'],
  ['INS-4004', 'Logistics Hub 7', 'Aisha Robinson', 'monthly', 78, false, '2026-04-30 10:00:00', 'Forklift pedestrian segregation failing; corrective plan due.'],
  ['INS-4005', 'Pine Ridge Wind Farm Substation', 'OSHA CSHO', 'regulatory', 81, true, '2026-03-05 09:30:00', 'LOTO program needs additional verification step.'],
  ['INS-4006', 'Tower 88 Curtain Wall', 'Brandon Hsu', 'weekly', 90, true, '2026-05-09 07:45:00', 'Boom lift inspections current; reinforce tool tethering.'],
  ['INS-4007', 'East Campus Excavation', 'Kim Park', 'weekly', 85, true, '2026-05-11 06:30:00', 'Type C soil sloped at 1.5:1; protective system OK.'],
  ['INS-4008', 'Harbor Pier 14 Reconstruction', 'Lacey Brown', 'monthly', 87, true, '2026-04-28 08:00:00', 'PFD usage 100%; review man-overboard drill cadence.'],
  ['INS-4009', 'Refinery Turnaround Unit 22', 'Marcus Whitlock', 'monthly', 91, true, '2026-04-26 19:00:00', 'Hot work permits well-managed; gas testing logs complete.'],
  ['INS-4010', 'Downtown Tunnel Boring TBM-3', 'Rafael Ortiz', 'weekly', 84, true, '2026-05-08 22:00:00', 'Ventilation OK; refresher needed on emergency egress.'],
  ['INS-4011', 'Riverwalk Pedestrian Bridge', 'Jose Ramirez', 'weekly', 89, true, '2026-05-07 07:00:00', 'Welding screens and fire watch documented.'],
  ['INS-4012', 'County Roof Replacement', 'Whitney Adams', 'weekly', 76, false, '2026-05-10 06:30:00', 'Warning line system encroached; correct before next lift.'],
  ['INS-4013', 'Greenway Solar Array', 'Priya Nair', 'monthly', 93, true, '2026-04-30 09:00:00', 'Arc flash boundaries posted, DC isolation procedure followed.'],
  ['INS-4014', 'Sunset Plaza Mixed-Use', 'OSHA CSHO', 'regulatory', 68, false, '2026-02-20 10:30:00', 'Multiple fall-protection program gaps; stop-work issued.'],
  ['INS-4015', 'Old Mill Demolition', 'Erin Sullivan', 'monthly', 72, false, '2025-12-15 11:00:00', 'Asbestos abatement plan deficient; remediated then closed.'],
];

const PERMITS = [
  ['PRM-5001', 'Refinery Turnaround Unit 22', 'hot-work', 'Jose Ramirez', '2026-05-10', '2026-05-17', 'active'],
  ['PRM-5002', 'East Campus Excavation', 'excavation', 'Kim Park', '2026-05-01', '2026-06-30', 'active'],
  ['PRM-5003', 'Pine Ridge Wind Farm Substation', 'electrical', 'Sofia Reyes', '2026-05-12', '2026-05-19', 'active'],
  ['PRM-5004', 'Downtown Tunnel Boring TBM-3', 'confined-space', 'Rafael Ortiz', '2026-05-13', '2026-05-14', 'active'],
  ['PRM-5005', 'Riverside Tower Phase II', 'hot-work', 'Tyrone Jackson', '2026-05-08', '2026-05-15', 'expired'],
  ['PRM-5006', 'Logistics Hub 7', 'electrical', 'Sofia Reyes', '2026-04-22', '2026-04-29', 'closed'],
  ['PRM-5007', 'Harbor Pier 14 Reconstruction', 'confined-space', 'Lacey Brown', '2026-05-14', '2026-05-15', 'pending'],
  ['PRM-5008', 'Northgate Hospital Wing', 'hot-work', 'Devon Brooks', '2026-05-11', '2026-05-18', 'active'],
  ['PRM-5009', 'County Roof Replacement', 'hot-work', 'Whitney Adams', '2026-05-09', '2026-05-12', 'closed'],
  ['PRM-5010', 'Tower 88 Curtain Wall', 'electrical', 'Sofia Reyes', '2026-05-06', '2026-05-13', 'active'],
  ['PRM-5011', 'Greenway Solar Array', 'electrical', 'Priya Nair', '2026-05-05', '2026-05-15', 'active'],
  ['PRM-5012', 'East Campus Excavation', 'confined-space', 'Kim Park', '2026-05-14', '2026-05-15', 'active'],
  ['PRM-5013', 'Riverwalk Pedestrian Bridge', 'hot-work', 'Jose Ramirez', '2026-05-13', '2026-05-20', 'active'],
  ['PRM-5014', 'Refinery Turnaround Unit 22', 'confined-space', 'Marcus Whitlock', '2026-05-12', '2026-05-13', 'closed'],
  ['PRM-5015', 'Sunset Plaza Mixed-Use', 'excavation', 'Tom Whitford', '2026-02-05', '2026-02-25', 'expired'],
];

const TRAININGS = [
  ['TRN-6001', 'OSHA 30 Construction', 'OTI Authorized Trainer - C. Patel', '2026-05-20 08:00:00', 18, true, 0],
  ['TRN-6002', 'Fall Protection Competent Person', 'M. Delgado', '2026-05-22 07:00:00', 12, true, 0],
  ['TRN-6003', 'NCCCO Mobile Crane Recertification', 'NCCCO Practical - D. Olsen', '2026-06-02 06:30:00', 6, true, 0],
  ['TRN-6004', 'Confined Space Entry & Rescue', 'R. Ortiz', '2026-05-25 09:00:00', 14, true, 0],
  ['TRN-6005', 'NFPA 70E Arc Flash', 'S. Reyes', '2026-05-27 08:30:00', 9, true, 0],
  ['TRN-6006', 'Trench Safety Competent Person', 'K. Park', '2026-06-04 07:30:00', 11, true, 0],
  ['TRN-6007', 'Toolbox Talk: Heat Illness Prevention', 'Site Supervisor', '2026-05-19 06:30:00', 142, false, 95],
  ['TRN-6008', 'Silica Dust Awareness (29 CFR 1926.1153)', 'A. Robinson', '2026-05-26 08:00:00', 28, true, 0],
  ['TRN-6009', 'Hot Work Permit Issuer', 'J. Ramirez', '2026-05-29 07:00:00', 8, true, 0],
  ['TRN-6010', 'Forklift Operator (Powered Industrial Trucks)', 'Logistics Trainer', '2026-06-09 09:00:00', 16, true, 0],
  ['TRN-6011', 'Toolbox Talk: Struck-By Hazards', 'Foreman of the Day', '2026-05-18 06:45:00', 67, false, 88],
  ['TRN-6012', 'First Aid / CPR / AED', 'Red Cross Instructor', '2026-06-11 08:00:00', 22, true, 0],
  ['TRN-6013', 'Asbestos Awareness (2-hour)', 'E. Sullivan', '2026-05-30 13:00:00', 14, true, 0],
  ['TRN-6014', 'Suspended Scaffold Competent Person', 'B. Hsu', '2026-06-05 07:00:00', 9, true, 0],
  ['TRN-6015', 'Toolbox Talk: Lockout/Tagout Fundamentals', 'S. Reyes', '2026-05-21 07:00:00', 33, false, 91],
];

const HAZARDS = [
  ['HZ-7001', 'Riverside Tower Phase II', 'Unprotected leading edge on 14F slab pour zone', 'critical', 'Install perimeter cable system; require 100% tie-off above 6 ft.', 'James Conroy', 'open'],
  ['HZ-7002', 'East Campus Excavation', 'Type C soil with adjacent vibration source (compactor)', 'high', 'Slope at 1.5:1 or install trench shield; relocate compactor 20 ft min.', 'Kim Park', 'mitigated'],
  ['HZ-7003', 'Pine Ridge Wind Farm Substation', 'Energized 480V panel with degraded LOTO tags', 'critical', 'Replace LOTO program; mandatory zero-energy verification step.', 'Sofia Reyes', 'mitigated'],
  ['HZ-7004', 'Tower 88 Curtain Wall', 'Glazing units staged near boom lift travel path', 'medium', 'Establish exclusion zone; use spotter during lift movement.', 'Brandon Hsu', 'open'],
  ['HZ-7005', 'Refinery Turnaround Unit 22', 'H2S monitor calibration overdue on 2 units', 'high', 'Bump-test and calibrate; remove uncalibrated units from service.', 'Marcus Whitlock', 'closed'],
  ['HZ-7006', 'County Roof Replacement', 'Skylights without protective covers', 'critical', 'Install OSHA-compliant skylight screens or guardrails before resuming work.', 'Whitney Adams', 'open'],
  ['HZ-7007', 'Logistics Hub 7', 'Forklift pedestrian crossing has blind corner', 'high', 'Install convex mirror, audible warning, dedicated walk lane.', 'Aisha Robinson', 'mitigated'],
  ['HZ-7008', 'Downtown Tunnel Boring TBM-3', 'Ventilation flow reduced 22% from baseline', 'medium', 'Inspect duct, replace fan filter, re-survey within 24h.', 'Rafael Ortiz', 'open'],
  ['HZ-7009', 'Harbor Pier 14 Reconstruction', 'Rigging slings stored in UV exposure for >90 days', 'medium', 'Remove from service, requalify per ASME B30.9.', 'Lacey Brown', 'closed'],
  ['HZ-7010', 'Northgate Hospital Wing', 'Wet-cut silica saw water flow inconsistent', 'medium', 'Service saw, validate Table 1 compliance, retrain operator.', 'Devon Brooks', 'mitigated'],
  ['HZ-7011', 'I-90 Bridge Deck Replacement', 'TTC sign placement obscured at night curve', 'high', 'Add Type B warning lights and reposition per MUTCD Part 6.', 'Maria Delgado', 'open'],
  ['HZ-7012', 'Greenway Solar Array', 'DC combiner boxes lack arc-flash labels', 'medium', 'Apply NFPA 70E labels; verify boundary calculations.', 'Priya Nair', 'mitigated'],
  ['HZ-7013', 'Riverwalk Pedestrian Bridge', 'Hot work near uncovered floor drains (flammable vapor risk)', 'high', 'Cover drains, gas-test before hot work, post fire watch.', 'Jose Ramirez', 'open'],
  ['HZ-7014', 'Sunset Plaza Mixed-Use', 'Floor opening unguarded near elevator core', 'critical', 'Install standard guardrails and toeboards; cover labeled "HOLE".', 'Tom Whitford', 'closed'],
  ['HZ-7015', 'Old Mill Demolition', 'Asbestos-containing material disturbed without containment', 'critical', 'Stop work, set negative pressure enclosure, licensed abatement.', 'Erin Sullivan', 'closed'],
];

// ============ NEW ENTITY SEED DATA ============

const JHA = [
  ['JHA-8001', 'Riverside Tower Phase II', 'Slab edge formwork removal at 14F', 'Fall from height; struck-by formwork; pinch points', 'Tie-off 100%; spotter; warning line system; lift gear inspection', 'James Conroy', '2026-05-14 07:00:00', true],
  ['JHA-8002', 'Pine Ridge Wind Farm Substation', '480V panel termination', 'Arc flash; electric shock; LOTO failure', 'NFPA 70E PPE Cat 2; verify zero energy; second-person verification', 'Sofia Reyes', '2026-05-13 06:30:00', true],
  ['JHA-8003', 'Downtown Tunnel Boring TBM-3', 'TBM cutterhead inspection', 'Confined space; rotating equipment; air quality', 'Confined-space permit; LOTO; continuous gas monitor; rescue plan', 'Rafael Ortiz', '2026-05-12 22:00:00', true],
  ['JHA-8004', 'East Campus Excavation', 'Trench shield installation 12 ft', 'Cave-in; struck-by; access/egress', 'Type C soils 1.5:1 slope; trench box certified; ladder every 25 ft', 'Kim Park', '2026-05-14 06:00:00', true],
  ['JHA-8005', 'Refinery Turnaround Unit 22', 'Hot work on Unit 22 reactor flange', 'Fire; H2S release; burns', 'Hot work permit; gas test; fire watch; nomex; H2S monitor', 'Marcus Whitlock', '2026-05-13 14:00:00', true],
  ['JHA-8006', 'Tower 88 Curtain Wall', 'Glazing unit hoist 27F', 'Falling glass; suspended load; wind', 'Exclusion zone; wind <25 mph; vacuum lifter inspection; tag lines', 'Brandon Hsu', '2026-05-12 09:00:00', false],
  ['JHA-8007', 'Harbor Pier 14 Reconstruction', 'Pile driving from barge', 'Drowning; struck-by hammer; eye injury', 'PFD 100%; lifeline; rescue boat; impact eyewear', 'Lacey Brown', '2026-05-11 07:30:00', true],
  ['JHA-8008', 'County Roof Replacement', 'Tear-off bituminous roof', 'Fall; heat illness; respiratory', 'PFAS warning line; hydration cycle; N95 respirator', 'Whitney Adams', '2026-05-14 05:30:00', true],
  ['JHA-8009', 'Northgate Hospital Wing', 'Silica wet-cut saw operation', 'Silica dust; cut/lacerations; noise', 'Table 1 wet method; double hearing pro; cut-resistant gloves', 'Devon Brooks', '2026-05-13 08:00:00', true],
  ['JHA-8010', 'Greenway Solar Array', 'DC combiner box wiring', 'Arc flash DC; fall on PV array; burns', 'DC isolation; insulated gloves; harness; arc-rated FR', 'Priya Nair', '2026-05-12 07:00:00', false],
  ['JHA-8011', 'I-90 Bridge Deck Replacement', 'Rebar bundle placement via crane', 'Struck-by; pinch; suspended load', 'NCCCO operator; tag lines; 2-block test; clear comms', 'Maria Delgado', '2026-05-11 07:00:00', true],
  ['JHA-8012', 'Logistics Hub 7', 'Forklift load handling pedestrian zone', 'Struck-by; tip-over; pinch', 'Spotter; segregated lanes; horn; load chart compliance', 'Aisha Robinson', '2026-05-13 06:00:00', true],
];

const NEAR_MISSES = [
  ['NM-9001', 'Riverside Tower Phase II', 'Loose tool dropped from 12F, missed worker below by 6 ft', 'critical', 'James Conroy', '2026-05-10 11:30:00', 'Tool tethering enforced; exclusion zone audited.'],
  ['NM-9002', 'I-90 Bridge Deck Replacement', 'Worker walked into TTC zone behind reversing truck (no backup alarm)', 'high', 'Maria Delgado', '2026-05-09 09:00:00', 'Backup alarm replaced; spotter mandatory for all reversing.'],
  ['NM-9003', 'East Campus Excavation', 'Trench wall slough adjacent to active dig - workers cleared in time', 'critical', 'Kim Park', '2026-05-01 07:45:00', 'Trench box deployed; competent person daily soil reclass.'],
  ['NM-9004', 'Pine Ridge Wind Farm Substation', 'LOTO tag missing on panel during apprentice inspection', 'critical', 'Sofia Reyes', '2026-04-28 14:15:00', 'LOTO retraining; double-verification step added.'],
  ['NM-9005', 'Refinery Turnaround Unit 22', 'H2S monitor alarm at 12 ppm, evac initiated, no exposure', 'high', 'Marcus Whitlock', '2026-04-22 19:30:00', 'Bump tests now twice daily; ventilation reviewed.'],
  ['NM-9006', 'Harbor Pier 14 Reconstruction', 'Worker without PFD on pier edge for 3 minutes - corrected by foreman', 'medium', 'Lacey Brown', '2026-05-04 13:00:00', 'PFD audit; daily pre-shift check.'],
  ['NM-9007', 'Tower 88 Curtain Wall', 'Glazing unit swung into safety cone area when wind gust hit', 'medium', 'Brandon Hsu', '2026-04-30 10:30:00', 'Wind threshold dropped to 20 mph; tag-line discipline.'],
  ['NM-9008', 'County Roof Replacement', 'Worker leaned over parapet to recover tool without tie-off', 'high', 'Whitney Adams', '2026-05-08 13:45:00', 'Coached; tool tether retrofit; warning line repositioned.'],
  ['NM-9009', 'Downtown Tunnel Boring TBM-3', 'Ventilation fan failed for 7 minutes, CO2 within limits', 'medium', 'Rafael Ortiz', '2026-05-05 23:00:00', 'Redundant fan installed; alarm threshold lowered.'],
  ['NM-9010', 'Greenway Solar Array', 'Arc near combiner during commissioning, FR clothing prevented injury', 'high', 'Priya Nair', '2026-04-28 11:00:00', 'DC isolation procedure revised; PPE upgraded to Cat 2.'],
  ['NM-9011', 'Northgate Hospital Wing', 'Silica saw dry-cut briefly during water failure', 'medium', 'Devon Brooks', '2026-05-04 09:30:00', 'Saw serviced; pre-task water test added.'],
  ['NM-9012', 'Logistics Hub 7', 'Forklift nearly struck pedestrian at blind corner', 'high', 'Aisha Robinson', '2026-05-06 14:30:00', 'Mirror installed; horn-and-stop policy.'],
];

const SAFETY_MEETINGS = [
  ['SM-10001', 'Riverside Tower Phase II', 'Fall Protection Refresher', 'James Conroy; D. Olsen; T. Jackson; 138 crew', 30, '2026-05-19 06:30:00', true],
  ['SM-10002', 'I-90 Bridge Deck Replacement', 'TTC Zone Setup & Flagger Comms', 'Maria Delgado; 64 crew', 25, '2026-05-18 06:30:00', true],
  ['SM-10003', 'Refinery Turnaround Unit 22', 'H2S Awareness & Gas Monitor Bump Tests', 'Marcus Whitlock; 210 crew', 35, '2026-05-21 18:00:00', false],
  ['SM-10004', 'Pine Ridge Wind Farm Substation', 'LOTO Verification Procedure Update', 'Sofia Reyes; 22 crew', 20, '2026-05-22 07:00:00', false],
  ['SM-10005', 'East Campus Excavation', 'Trench Cave-in Indicators', 'Kim Park; 36 crew', 25, '2026-05-19 06:00:00', true],
  ['SM-10006', 'Tower 88 Curtain Wall', 'Wind Operations Limits & Curtain Wall Hoist', 'Brandon Hsu; 70 crew', 30, '2026-05-20 06:45:00', true],
  ['SM-10007', 'County Roof Replacement', 'Heat Illness Prevention', 'Whitney Adams; 12 crew', 15, '2026-05-18 05:30:00', true],
  ['SM-10008', 'Downtown Tunnel Boring TBM-3', 'Emergency Egress Drill', 'Rafael Ortiz; 54 crew', 45, '2026-05-23 22:00:00', false],
  ['SM-10009', 'Greenway Solar Array', 'Arc Flash NFPA 70E Refresher', 'Priya Nair; 47 crew', 30, '2026-05-22 07:30:00', false],
  ['SM-10010', 'Harbor Pier 14 Reconstruction', 'Man-Overboard Drill', 'Lacey Brown; 42 crew', 40, '2026-05-25 08:00:00', false],
  ['SM-10011', 'Logistics Hub 7', 'Forklift Pedestrian Safety', 'Aisha Robinson; 82 crew', 20, '2026-05-18 06:00:00', true],
  ['SM-10012', 'Northgate Hospital Wing', 'Silica Table 1 Methods', 'Devon Brooks; 195 crew', 25, '2026-05-19 07:00:00', true],
];

const PPE_INVENTORY = [
  ['PPE-11001', 'Riverside Tower Phase II', 'Hard Hat - Type II', 'HH-T2-WHT', 220, 100, '2026-05-10', 'in-stock'],
  ['PPE-11002', 'Riverside Tower Phase II', 'Fall Arrest Harness', 'FAH-FB-XL', 28, 50, '2026-05-10', 'reorder'],
  ['PPE-11003', 'I-90 Bridge Deck Replacement', 'High-Vis Class 3 Vest', 'HV-C3-XL', 95, 60, '2026-05-09', 'in-stock'],
  ['PPE-11004', 'Pine Ridge Wind Farm Substation', 'Arc Flash Suit PPE Cat 2', 'AFS-C2-MD', 14, 8, '2026-05-08', 'in-stock'],
  ['PPE-11005', 'East Campus Excavation', 'Cut-Resistant Gloves A4', 'CRG-A4-LG', 180, 80, '2026-05-11', 'in-stock'],
  ['PPE-11006', 'Refinery Turnaround Unit 22', 'H2S Personal Monitor', 'H2S-PM-V1', 9, 20, '2026-05-12', 'reorder'],
  ['PPE-11007', 'Tower 88 Curtain Wall', 'Boom Lift Harness Lanyard', 'BLH-LY-2T', 38, 25, '2026-05-09', 'in-stock'],
  ['PPE-11008', 'County Roof Replacement', 'Cooling Vest / Bandana', 'CV-XL', 22, 12, '2026-05-10', 'in-stock'],
  ['PPE-11009', 'Downtown Tunnel Boring TBM-3', 'Self-Contained Self-Rescuer', 'SCSR-30M', 60, 60, '2026-05-08', 'audit'],
  ['PPE-11010', 'Greenway Solar Array', 'Insulated Class 0 Gloves', 'IG-C0-MD', 36, 24, '2026-05-09', 'in-stock'],
  ['PPE-11011', 'Harbor Pier 14 Reconstruction', 'PFD - Type V Work Vest', 'PFD-V-XL', 52, 40, '2026-05-10', 'in-stock'],
  ['PPE-11012', 'Northgate Hospital Wing', 'N95 Respirator (Silica)', 'N95-S-LG', 480, 300, '2026-05-11', 'in-stock'],
  ['PPE-11013', 'Logistics Hub 7', 'Steel-Toe Boots EH', 'STB-EH-10', 64, 30, '2026-05-09', 'in-stock'],
  ['PPE-11014', 'Riverside Tower Phase II', 'Safety Glasses Z87+', 'SG-Z87-CL', 320, 120, '2026-05-10', 'in-stock'],
];

const CONTRACTORS = [
  ['C-12001', 'Apex Steel Erectors LLC', 'CA-885421', '2026-09-30', 92, 'approved'],
  ['C-12002', 'BlueLine Electrical Inc', 'WA-EL-77002', '2026-11-15', 88, 'approved'],
  ['C-12003', 'Coastal Marine Builders', 'CA-MB-22001', '2026-08-12', 81, 'approved'],
  ['C-12004', 'Deep Earth Excavation Co', 'WI-EX-1140', '2026-12-22', 76, 'probation'],
  ['C-12005', 'Evergreen Mechanical Services', 'OR-ME-5550', '2027-01-10', 94, 'approved'],
  ['C-12006', 'Forge Welding & Fabrication', 'TX-WL-3308', '2026-07-04', 70, 'probation'],
  ['C-12007', 'Granite Roofing Pros', 'AZ-RF-9081', '2026-06-30', 58, 'blocked'],
  ['C-12008', 'Horizon Glass & Glazing', 'CA-GL-4421', '2026-10-22', 90, 'approved'],
  ['C-12009', 'Ironclad Crane Services', 'NV-CR-1903', '2027-02-15', 95, 'approved'],
  ['C-12010', 'Jet Stream HVAC', 'TX-HV-7822', '2026-09-11', 84, 'approved'],
  ['C-12011', 'Keystone Concrete Group', 'PA-CC-2204', '2026-12-01', 87, 'approved'],
  ['C-12012', 'Liberty Demolition Services', 'MA-DM-1102', '2026-11-30', 65, 'probation'],
];

const SUBCONTRACTORS = [
  ['SC-13001', 'Apex Steel Erectors LLC', 'BoltMaster Connectors', 'High-strength bolting', 'CA-SB-66001', 'approved'],
  ['SC-13002', 'BlueLine Electrical Inc', 'WireWorks Helpers', 'Cable pulling and tray installation', 'WA-EL-77150', 'approved'],
  ['SC-13003', 'Evergreen Mechanical Services', 'PipeRight Insulation', 'Industrial pipe insulation', 'OR-IN-5551', 'approved'],
  ['SC-13004', 'Apex Steel Erectors LLC', 'Skyline Detailers', 'Steel detailing & shop drawings', 'CA-SD-66102', 'approved'],
  ['SC-13005', 'Coastal Marine Builders', 'Tidewater Diving Inc', 'Commercial diving inspections', 'CA-DV-22050', 'probation'],
  ['SC-13006', 'Deep Earth Excavation Co', 'GroundLine Surveyors', 'Site survey and layout', 'WI-SV-1141', 'approved'],
  ['SC-13007', 'Forge Welding & Fabrication', 'X-Ray NDT Services', 'Weld inspection radiography', 'TX-NDT-3309', 'approved'],
  ['SC-13008', 'Granite Roofing Pros', 'TarTrak Logistics', 'Bituminous material handling', 'AZ-LG-9082', 'blocked'],
  ['SC-13009', 'Horizon Glass & Glazing', 'CleanView Window Wash', 'Pre-handover glazing clean', 'CA-CW-4422', 'approved'],
  ['SC-13010', 'Ironclad Crane Services', 'Rigger Pros LLC', 'Specialty rigging crew', 'NV-RG-1904', 'approved'],
  ['SC-13011', 'Keystone Concrete Group', 'PolyPump Concrete', 'Concrete pumping services', 'PA-CP-2205', 'approved'],
  ['SC-13012', 'Liberty Demolition Services', 'AbateRight Asbestos', 'Asbestos abatement', 'MA-AB-1103', 'probation'],
];

const DRUG_TESTS = [
  ['DT-14001', 'James Conroy', 'random', 'negative', '2026-05-01 09:00:00'],
  ['DT-14002', 'Maria Delgado', 'pre-employment', 'negative', '2017-08-20 10:00:00'],
  ['DT-14003', 'Tyrone Jackson', 'incident', 'negative', '2026-04-13 11:00:00'],
  ['DT-14004', 'Sofia Reyes', 'random', 'negative', '2026-04-29 08:00:00'],
  ['DT-14005', 'David Olsen', 'random', 'negative', '2026-05-05 07:30:00'],
  ['DT-14006', 'Aisha Robinson', 'pre-employment', 'negative', '2018-04-12 10:00:00'],
  ['DT-14007', 'Brandon Hsu', 'random', 'negative', '2026-04-22 09:00:00'],
  ['DT-14008', 'Whitney Adams', 'incident', 'negative', '2026-05-10 14:00:00'],
  ['DT-14009', 'Rafael Ortiz', 'random', 'inconclusive', '2026-05-02 22:00:00'],
  ['DT-14010', 'Kim Park', 'pre-employment', 'negative', '2019-07-15 10:00:00'],
  ['DT-14011', 'Jose Ramirez', 'incident', 'positive', '2026-04-04 16:00:00'],
  ['DT-14012', 'Lacey Brown', 'random', 'negative', '2026-04-29 07:00:00'],
  ['DT-14013', 'Marcus Whitlock', 'pre-employment', 'negative', '2012-08-05 10:00:00'],
  ['DT-14014', 'Priya Nair', 'random', 'negative', '2026-05-08 09:00:00'],
];

const DOT_RECORDS = [
  ['DOT-15001', 'James Conroy', 'A', '2026-09-12', '2026-05-12 18:00:00', 0],
  ['DOT-15002', 'Maria Delgado', 'A', '2026-07-30', '2026-05-13 17:00:00', 1],
  ['DOT-15003', 'David Olsen', 'B', '2027-01-15', '2026-05-12 16:00:00', 0],
  ['DOT-15004', 'Jose Ramirez', 'A', '2026-08-18', '2026-05-11 17:30:00', 2],
  ['DOT-15005', 'Lacey Brown', 'A', '2026-12-04', '2026-05-13 14:00:00', 0],
  ['DOT-15006', 'Marcus Whitlock', 'B', '2026-11-22', '2026-05-12 22:00:00', 1],
  ['DOT-15007', 'Tyrone Jackson', 'A', '2027-02-09', '2026-05-13 17:00:00', 0],
  ['DOT-15008', 'Aisha Robinson', 'B', '2026-10-19', '2026-05-12 16:30:00', 0],
  ['DOT-15009', 'Whitney Adams', 'B', '2026-06-30', '2026-05-13 11:00:00', 0],
  ['DOT-15010', 'Kim Park', 'B', '2027-03-25', '2026-05-13 06:00:00', 0],
  ['DOT-15011', 'Sofia Reyes', 'B', '2026-09-08', '2026-05-12 18:00:00', 0],
  ['DOT-15012', 'Brandon Hsu', 'B', '2027-04-12', '2026-05-13 16:00:00', 1],
];

const CLAIMS = [
  ['CLM-16001', 'workers-comp', 'Tyrone Jackson', 'open', '2026-04-13 09:00:00', 12500.00],
  ['CLM-16002', 'workers-comp', 'Maria Delgado crew (struck-by)', 'in-review', '2026-04-19 10:00:00', 28400.00],
  ['CLM-16003', 'workers-comp', 'Sofia Reyes apprentice (electrocution)', 'closed', '2026-02-10 08:00:00', 142000.00],
  ['CLM-16004', 'general-liability', 'Adjacent property HVAC damage', 'in-review', '2026-04-22 14:00:00', 18700.00],
  ['CLM-16005', 'auto', 'Logistics Hub 7 forklift collision', 'closed', '2026-03-18 12:00:00', 6200.00],
  ['CLM-16006', 'workers-comp', 'Marcus Whitlock H2S exposure', 'closed', '2026-03-31 07:00:00', 9800.00],
  ['CLM-16007', 'workers-comp', 'Lacey Brown rigging strap failure', 'in-review', '2026-04-05 15:00:00', 33500.00],
  ['CLM-16008', 'general-liability', 'Pedestrian dust exposure complaint', 'open', '2026-05-02 11:00:00', 4200.00],
  ['CLM-16009', 'workers-comp', 'Rafael Ortiz finger fracture', 'closed', '2026-01-23 18:30:00', 21600.00],
  ['CLM-16010', 'auto', 'Concrete truck rear-end I-90 work zone', 'open', '2026-04-15 13:00:00', 47200.00],
  ['CLM-16011', 'workers-comp', 'Sunset Plaza fall (severe)', 'closed', '2026-02-15 08:30:00', 224000.00],
  ['CLM-16012', 'general-liability', 'Tower 88 crane swing path complaint', 'in-review', '2026-04-30 16:00:00', 8800.00],
];

const VENDORS = [
  ['V-17001', 'Skyline PPE Supply', 'PPE', true, '2026-12-31', 'approved'],
  ['V-17002', 'OmegaCrane Rentals', 'Equipment Rental', true, '2027-02-15', 'approved'],
  ['V-17003', 'CleanAir Systems Co', 'Ventilation Equipment', true, '2026-09-30', 'approved'],
  ['V-17004', 'GeoTech Survey Inc', 'Survey Services', true, '2026-11-12', 'approved'],
  ['V-17005', 'RapidWaste Disposal', 'Waste Management', false, '2026-08-30', 'under_review'],
  ['V-17006', 'SafetyFirst Training Inc', 'Training Provider', true, '2027-01-09', 'approved'],
  ['V-17007', 'Apex Drug Testing Lab', 'Drug Testing', true, '2026-10-15', 'approved'],
  ['V-17008', 'BlueLine Insurance Brokers', 'Insurance Broker', true, '2027-03-22', 'approved'],
  ['V-17009', 'OldWay Tools Inc', 'Tool Supply', false, '2025-12-30', 'blocked'],
  ['V-17010', 'EcoLab Industrial Cleanup', 'Spill Response', true, '2026-09-19', 'approved'],
  ['V-17011', 'PrimeStaff Temp Labor', 'Staffing', true, '2026-11-04', 'approved'],
  ['V-17012', 'FuelPro On-site Delivery', 'Fuel Services', true, '2026-12-22', 'approved'],
];

const WEBHOOKS = [
  ['Slack Safety Channel', 'https://example.com/webhooks/slack-safety', 'incident.upserted,near_miss.upserted', 'wh_secret_demo_123', true],
  ['EHS Cloud Sync', 'https://example.com/webhooks/ehs-sync', '*', 'wh_secret_ehs_456', true],
];

const NOTIFICATIONS = [
  [null, 'incident.upserted', 'High-severity incident INC-3001', 'Worker fell 8 ft from leading edge; investigation underway.', 'high', '/api/incidents'],
  [null, 'near_miss.upserted', 'Critical near-miss NM-9001', 'Tool dropped from 12F; missed worker by 6 ft.', 'critical', '/api/near_misses'],
  [null, 'hazard.upserted', 'Critical hazard HZ-7006', 'Skylights without protective covers.', 'critical', '/api/hazards'],
  [null, 'claim.upserted', 'New claim CLM-16001 opened', 'Workers-comp claim filed - 12500 USD.', 'medium', '/api/claims'],
];

async function insertUsers(client) {
  const rows = [
    ['safety@construction.io', 'Safety Manager', bcrypt.hashSync('osha123', 10), 'safety_officer'],
    ['admin@construction.io', 'Site Admin', bcrypt.hashSync('admin123', 10), 'admin'],
    ['worker@construction.io', 'Crew Worker', bcrypt.hashSync('worker123', 10), 'worker'],
  ];
  for (const r of rows) {
    await client.query(
      `INSERT INTO users (email, name, password_hash, role) VALUES ($1,$2,$3,$4)
       ON CONFLICT (email) DO NOTHING`,
      r
    );
  }
}

async function insert(client, table, columns, rows) {
  const placeholders = (n) => '(' + columns.map((_, i) => `$${n * columns.length + i + 1}`).join(',') + ')';
  const values = [];
  const tuples = [];
  rows.forEach((r, idx) => {
    tuples.push(placeholders(idx));
    columns.forEach((_, ci) => values.push(r[ci]));
  });
  const sql = `INSERT INTO ${table} (${columns.join(',')}) VALUES ${tuples.join(',')}`;
  await client.query(sql, values);
}

async function seed() {
  const client = await pool.connect();
  try {
    const schemaPath = path.join(__dirname, '..', 'migrations', '001_schema.sql');
    const extPath = path.join(__dirname, '..', 'migrations', '002_extended.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const extSql = fs.readFileSync(extPath, 'utf8');
    await client.query(schemaSql);
    await client.query(extSql);

    await insert(client, 'sites',
      ['site_id','name','address','project_type','status','supervisor','worker_count'], SITES);
    await insert(client, 'workers',
      ['worker_id','name','role','certifications','site','status','hire_date'], WORKERS);
    await insert(client, 'equipment',
      ['equipment_id','type','manufacturer','serial','site','status','last_inspected'], EQUIPMENT);
    await insert(client, 'incidents',
      ['incident_id','site','type','severity','injury_reported','occurred_at','status','description'], INCIDENTS);
    await insert(client, 'inspections',
      ['inspection_id','site','inspector','type','score','passed','performed_at','notes'], INSPECTIONS);
    await insert(client, 'permits',
      ['permit_id','site','type','issued_to','valid_from','valid_to','status'], PERMITS);
    await insert(client, 'trainings',
      ['training_id','course','instructor','scheduled_for','attendee_count','mandatory','completion_rate'], TRAININGS);
    await insert(client, 'hazards',
      ['hazard_id','site','description','severity','control_measure','reported_by','status'], HAZARDS);

    // New entities
    await insert(client, 'jha',
      ['jha_id','site','task','hazards','controls','performed_by','performed_at','signed_off'], JHA);
    await insert(client, 'near_misses',
      ['near_miss_id','site','description','severity_if_realized','reported_by','reported_at','action_taken'], NEAR_MISSES);
    await insert(client, 'safety_meetings',
      ['meeting_id','site','topic','attendees','duration_min','scheduled_for','completed'], SAFETY_MEETINGS);
    await insert(client, 'ppe_inventory',
      ['item_id','site','ppe_type','sku','qty','threshold_min','last_audit','status'], PPE_INVENTORY);
    await insert(client, 'contractors',
      ['contractor_id','name','license_no','insurance_expiry','safety_score','status'], CONTRACTORS);
    await insert(client, 'subcontractors',
      ['sub_id','parent_contractor','name','scope','license_no','status'], SUBCONTRACTORS);
    await insert(client, 'drug_tests',
      ['test_id','worker','type','result','tested_at'], DRUG_TESTS);
    await insert(client, 'dot_records',
      ['record_id','driver','cdl_class','medical_expires','last_hours_log','violations_count'], DOT_RECORDS);
    await insert(client, 'claims',
      ['claim_id','type','claimant','status','opened_at','amount_usd'], CLAIMS);
    await insert(client, 'vendors',
      ['vendor_id','name','category','w9_on_file','insurance_expiry','status'], VENDORS);

    // Users (RBAC)
    await insertUsers(client);

    // Webhooks + Notifications
    await insert(client, 'webhooks', ['name','url','events','secret','active'], WEBHOOKS);
    await insert(client, 'notifications', ['user_id','type','title','body','severity','link'], NOTIFICATIONS);

    console.log('[seed] Construction Safety Hub database seeded successfully');
    console.log(`  sites: ${SITES.length}  workers: ${WORKERS.length}  equipment: ${EQUIPMENT.length}`);
    console.log(`  incidents: ${INCIDENTS.length}  inspections: ${INSPECTIONS.length}  permits: ${PERMITS.length}`);
    console.log(`  trainings: ${TRAININGS.length}  hazards: ${HAZARDS.length}`);
    console.log(`  jha: ${JHA.length}  near_misses: ${NEAR_MISSES.length}  safety_meetings: ${SAFETY_MEETINGS.length}`);
    console.log(`  ppe_inventory: ${PPE_INVENTORY.length}  contractors: ${CONTRACTORS.length}  subcontractors: ${SUBCONTRACTORS.length}`);
    console.log(`  drug_tests: ${DRUG_TESTS.length}  dot_records: ${DOT_RECORDS.length}  claims: ${CLAIMS.length}  vendors: ${VENDORS.length}`);
    console.log(`  webhooks: ${WEBHOOKS.length}  notifications: ${NOTIFICATIONS.length}  users: 3`);
  } catch (err) {
    console.error('[seed] Failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
