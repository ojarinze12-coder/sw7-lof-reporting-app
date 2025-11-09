
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const REPORT_FIELDS: (keyof import('./types').ReportMetric)[] = [
  'membership', 'attendance', 'firstTimers', 'salvations', 
  'holyGhostBaptism', 'membershipDecision', 'offering'
];

export const FIELD_LABELS: Record<keyof import('./types').ReportMetric, string> = {
  membership: 'Membership',
  attendance: 'Attendance',
  firstTimers: 'First Timers',
  salvations: 'Salvations',
  holyGhostBaptism: 'Holy Ghost Baptism',
  membershipDecision: 'Membership Decision',
  offering: 'Offering (₦)'
};