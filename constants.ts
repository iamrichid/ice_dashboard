
import { Incident, IncidentPriority, IncidentStatus, Unit, UnitStatus } from './types';

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: '4092',
    title: 'Signal #4092',
    type: 'Medical Emergency',
    priority: IncidentPriority.HIGH,
    status: IncidentStatus.ACTIVE,
    location: '142 West St, Apartment 4B',
    sector: 'Downtown Sector',
    timeAgo: '2 mins ago',
    icon: 'medical_services',
    subject: {
      name: 'John Doe',
      age: 45,
      gender: 'Male',
      conditions: ['Diabetic', 'Hypertension'],
      phone: '+1 (555) 012-3456',
      bloodType: 'O+',
      emergencyContact: 'Jane Doe (Wife)',
      languages: ['English', 'Spanish'],
      photo: 'https://picsum.photos/seed/john/200/200'
    }
  },
  {
    id: '4091',
    title: 'Signal #4091',
    type: 'Fire Alarm',
    priority: IncidentPriority.MEDIUM,
    status: IncidentStatus.ACTIVE,
    location: '88 Industrial Way',
    sector: 'Industrial Zone',
    timeAgo: '5 mins ago',
    icon: 'local_fire_department',
    subject: {
      name: 'Sarah Connor',
      age: 32,
      gender: 'Female',
      conditions: ['None'],
      phone: '+1 (555) 987-6543',
      bloodType: 'A-',
      emergencyContact: 'Kyle Reese',
      languages: ['English'],
      photo: 'https://picsum.photos/seed/sarah/200/200'
    }
  }
];

export const MOCK_HISTORY: Incident[] = [
  {
    id: '4088',
    title: 'Signal #4088',
    type: 'Assault',
    priority: IncidentPriority.CRITICAL,
    status: IncidentStatus.RESOLVED,
    location: 'Metro Station Entrance',
    sector: 'South Side',
    timeAgo: '2h ago',
    date: '2025-05-14',
    icon: 'gavel',
    subject: {
      name: 'Unknown',
      age: 0,
      gender: 'N/A',
      conditions: [],
      phone: 'N/A',
      bloodType: 'N/A',
      emergencyContact: 'N/A',
      languages: [],
      photo: 'https://picsum.photos/seed/as/200/200'
    }
  },
  {
    id: '4087',
    title: 'Signal #4087',
    type: 'Traffic Violation',
    priority: IncidentPriority.LOW,
    status: IncidentStatus.RESOLVED,
    location: '5th Ave & Broadway',
    sector: 'Times Square',
    timeAgo: '4h ago',
    date: '2025-05-14',
    icon: 'traffic',
    subject: {
      name: 'Michael Scott',
      age: 42,
      gender: 'Male',
      conditions: [],
      phone: '+1 555-SCRANTON',
      bloodType: 'O-',
      emergencyContact: 'Dwight Schrute',
      languages: ['English'],
      photo: 'https://picsum.photos/seed/michael/200/200'
    }
  },
  {
    id: '4086',
    title: 'Signal #4086',
    type: 'Burglary',
    priority: IncidentPriority.MEDIUM,
    status: IncidentStatus.CANCELLED,
    location: '99 Tech Plaza',
    sector: 'North Hub',
    timeAgo: '1d ago',
    date: '2025-05-13',
    icon: 'home_repair_service',
    subject: {
      name: 'Alice Wonder',
      age: 28,
      gender: 'Female',
      conditions: [],
      phone: '+1 555-123-000',
      bloodType: 'B-',
      emergencyContact: 'Hatter',
      languages: ['English'],
      photo: 'https://picsum.photos/seed/alice/200/200'
    }
  },
  {
    id: '4085',
    title: 'Signal #4085',
    type: 'Heart Attack',
    priority: IncidentPriority.CRITICAL,
    status: IncidentStatus.RESOLVED,
    location: 'Central Park South',
    sector: 'Uptown',
    timeAgo: '2d ago',
    date: '2025-05-12',
    icon: 'emergency',
    subject: {
      name: 'Tony Stark',
      age: 48,
      gender: 'Male',
      conditions: ['Heart Implant'],
      phone: 'Jarvis',
      bloodType: 'A+',
      emergencyContact: 'Pepper Potts',
      languages: ['English'],
      photo: 'https://picsum.photos/seed/tony/200/200'
    }
  }
];

export const MOCK_FLEET: Unit[] = [
  {
    id: 'Patrol 22',
    type: 'Police',
    status: UnitStatus.AVAILABLE,
    location: '5th & Main',
    personnel: ['Off. Miller', 'Off. Baker'],
    lastUpdated: '1 min ago'
  },
  {
    id: 'Unit 412',
    type: 'EMS',
    status: UnitStatus.EN_ROUTE,
    location: 'West 12th St',
    personnel: ['Para. Chen', 'Para. Smith'],
    assignedIncidentId: '4092',
    lastUpdated: 'Just now'
  },
  {
    id: 'Engine 4',
    type: 'Fire',
    status: UnitStatus.AVAILABLE,
    location: 'Station 4',
    personnel: ['Capt. Rogers', 'Lt. Wilson', 'Firef. Barnes'],
    lastUpdated: '5 mins ago'
  },
  {
    id: 'Patrol 8',
    type: 'Police',
    status: UnitStatus.BUSY,
    location: 'Precinct 1',
    personnel: ['Off. Davis'],
    lastUpdated: '12 mins ago'
  },
  {
    id: 'Unit 9',
    type: 'EMS',
    status: UnitStatus.ON_SCENE,
    location: 'Broadway Mall',
    personnel: ['Para. Gomez', 'Para. Lee'],
    assignedIncidentId: '4085',
    lastUpdated: '2 mins ago'
  },
  {
    id: 'Ladder 12',
    type: 'Fire',
    status: UnitStatus.OFF_DUTY,
    location: 'Maintenance Yard',
    personnel: [],
    lastUpdated: '1h ago'
  }
];
