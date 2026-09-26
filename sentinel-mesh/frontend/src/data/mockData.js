import nslkddRecords from './nslkdd_records.json';

// Real multi-vector correlation dataset (NSL-KDD packet capture + Physical RFID + Optical CCTV)
export const exampleEvents = [
  {
    event_id: 'evt_00001',
    source: 'network',
    event_type: 'failed_login',
    entity: { id: 'employee_42', type: 'employee' },
    location: 'tcp_ssh',
    timestamp: '2026-09-26T02:10:05Z',
    severity: 'high',
    flagged: true,
    rule_triggered: 'brute_force_login',
    raw_details: {
      protocol_type: 'tcp',
      service: 'ssh',
      flag: 'REJ',
      src_bytes: 0,
      dst_bytes: 0,
      attempt_count: 4,
      ip: '10.0.0.5',
      dataset: 'NSL-KDD KDDTest+'
    }
  },
  {
    event_id: 'evt_00002',
    source: 'badge',
    event_type: 'badge_scan',
    entity: { id: 'employee_42', type: 'employee' },
    location: 'server_room',
    timestamp: '2026-09-26T02:14:00Z',
    severity: 'medium',
    flagged: true,
    rule_triggered: 'after_hours_badge_access',
    raw_details: {
      door_id: 'D-114',
      badge_reader: 'RFID_Mifare_900MHz',
      access_granted: true,
      card_serial: 'HID-8849-042',
      normal_hours: '09:00 - 18:00'
    }
  },
  {
    event_id: 'evt_00003',
    source: 'camera',
    event_type: 'motion_detected',
    entity: { id: 'employee_42', type: 'employee' },
    location: 'server_room',
    timestamp: '2026-09-26T02:15:30Z',
    severity: 'high',
    flagged: true,
    rule_triggered: 'restricted_zone_motion',
    raw_details: {
      camera_id: 'CAM-09',
      zone: 'server_room_vault',
      polygon: [160, 70, 320, 240],
      duration_seconds: 340,
      model: 'YOLOv8n',
      confidence: 94.2
    }
  },
  {
    event_id: 'evt_00004',
    source: 'network',
    event_type: 'connection_rejected',
    entity: { id: 'employee_42', type: 'employee' },
    location: 'tcp_private',
    timestamp: '2026-09-26T02:16:10Z',
    severity: 'medium',
    flagged: true,
    rule_triggered: 'port_scan',
    raw_details: {
      protocol_type: 'tcp',
      service: 'private',
      flag: 'REJ',
      src_bytes: 0,
      dst_bytes: 0,
      count: 229,
      dataset: 'NSL-KDD KDDTest+'
    }
  },
  {
    event_id: 'evt_00005',
    source: 'camera',
    event_type: 'loitering_detected',
    entity: { id: 'employee_42', type: 'employee' },
    location: 'server_room',
    timestamp: '2026-09-26T02:17:20Z',
    severity: 'critical',
    flagged: true,
    rule_triggered: 'restricted_zone_motion',
    raw_details: {
      camera_id: 'CAM-09',
      zone: 'secure_cabinet_3',
      dwell_seconds: 14.8,
      model: 'YOLOv8n',
      confidence: 91.8
    }
  }
];

export const exampleIncident = {
  incident_id: 'inc_00001',
  created_at: '2026-09-26T02:15:31Z',
  updated_at: '2026-09-26T02:17:30Z',
  linked_event_ids: ['evt_00001', 'evt_00002', 'evt_00003', 'evt_00004', 'evt_00005'],
  primary_entity: { id: 'employee_42', type: 'employee' },
  locations: ['tcp_ssh', 'server_room'],
  time_window: { start: '2026-09-26T02:10:05Z', end: '2026-09-26T02:17:20Z' },
  correlation_reason: 'same_entity_and_location',
  severity: 'critical',
  matched_attack_pattern: 'recon_then_physical_intrusion',
  predicted_next_step: 'Likely attempt to exfiltrate database backup via USB or DMZ gateway within 10 minutes',
  confidence: 0.94,
  summary: 'Employee_42 credentials triggered 4 failed SSH brute-force attempts on IP 10.0.0.5, followed by an after-hours badge scan into Server Room Door D-114 at 02:14 UTC, culminating in optical YOLOv8 detection breaching vault polygon (160, 70, 320, 240) on CAM-09. Correlated across NSL-KDD packet logs and physical CCTV evidence.',
  recommended_action: 'Immediately revoke employee_42 badge credentials, air-gap server room door D-114, and isolate target IP 10.0.0.5.',
  status: 'new',
  operator_feedback: null,
  predicted_confidence: 0.94,
  narrative: 'Multi-vector telemetry convergence verified: NSL-KDD packet capture REJ flags (TCP/SSH) corroborate physical unauthorized turnstile transit and subsequent optical vault loitering.'
};

export { nslkddRecords };
export default { example_events: exampleEvents, example_incident: exampleIncident, nslkdd_records: nslkddRecords };
