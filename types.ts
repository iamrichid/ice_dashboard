
export enum IncidentPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum IncidentStatus {
  ACTIVE = 'Active',
  RESOLVED = 'Resolved',
  PENDING = 'Pending', // Deprecated in favor of DISPATCHED? Or keep for initial acknowledgement?
  DISPATCHED = 'Dispatched',
  CANCELLED = 'Cancelled'
}

export enum UnitStatus {
  AVAILABLE = 'Available',
  EN_ROUTE = 'En Route',
  ON_SCENE = 'On Scene',
  BUSY = 'Busy',
  OFF_DUTY = 'Off Duty'
}

export type ViewType = 'dashboard' | 'history' | 'fleet' | 'settings';

export interface UserSettings {
  displayName: string;
  operatorId: string;
  email: string;
  realTimeFeed: boolean;
  audioAlerts: boolean;
  darkModeEngine: boolean;
  aiDispatch: boolean;
  photoUrl: string;
  company?: string;
  countryId?: string;
}

export interface Incident {
  id: string;
  title: string;
  type: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  location: string;
  sector: string;
  timeAgo: string;
  date?: string;
  icon: string;
  subject: Subject;
  companyId?: string;
  assignedUnitId?: string;
}

export interface Subject {
  name: string;
  age: number;
  gender: string;
  conditions: string[];
  phone: string;
  bloodType: string;
  emergencyContact: string;
  languages: string[];
  photo: string;
}

export interface LogMessage {
  id: string;
  timestamp: string;
  sender: 'System' | 'Operator' | 'User' | 'AI';
  content: string;
  isItalic?: boolean;
}

export interface Unit {
  id: string;
  type: 'Police' | 'EMS' | 'Fire';
  status: UnitStatus;
  location: string;
  personnel: string[];
  assignedIncidentId?: string;
  lastUpdated: string;
  companyId?: string;
}
