
export enum UserRole {
  ChapterPresident = 'Chapter President',
  FieldRepresentative = 'Field Representative',
  NationalDirector = 'National Director',
  DistrictCoordinator = 'District Coordinator',
  DistrictAdmin = 'District Admin',
  Admin = 'Admin'
}

export enum EventType {
  Outreach = 'Outreach',
  Meeting = 'Meeting',
  Training = 'Training',
  SpecialProgram = 'Special Program',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  username: string;
  password?: string; // Password is now part of the user model
  email?: string;
  phone?: string;
  // Each user is linked to a specific organizational unit ID
  unitId: string; // e.g., Chapter ID for CP, Area ID for FR, Zone ID for ND, District ID for DC/DistrictAdmin
}

export interface Chapter {
  id: string;
  name: string;
  areaId: string;
}

export interface Area {
  id: string;
  name: string;
  zoneId: string;
}

export interface Zone {
  id: string;
  name: string;
  districtId: string;
}

export interface District {
  id: string;
  name: string;
}

export interface ReportMetric {
  membership: number;
  attendance: number;
  firstTimers: number;
  salvations: number;
  holyGhostBaptism: number;
  membershipDecision: number;
  offering: number;
}

export interface ChapterReport extends ReportMetric {
  id: string;
  chapterId: string; // Changed from chapterName to chapterId
  chapterName: string; // Keep for convenience
  month: number; // 1-12
  year: number;
}

export interface EventReport extends ReportMetric {
  id: string;
  reportingOfficerId: string; // Changed from reportingOfficer
  officerRole: UserRole;
  eventName: string;
  eventDate: string;
  eventType: EventType;
}

export interface AggregatedData extends ReportMetric {
  name: string;
  reports: (ChapterReport | EventReport)[];
  children?: AggregatedData[];
  events?: EventReport[];
}