export type ViewMode = 'grid' | 'list';
export type ActiveTab = 'all-speakers' | 'by-session';
export type FilterType = 'all' | 'keynote' | 'panel' | 'workshop' | 'confirmed' | 'pending';
export type SpeakerType = 'keynote' | 'panel' | 'workshop' | 'regular';
export type SpeakerStatus = 'confirmed' | 'pending' | 'declined';
export type MaterialStatus = 'submitted' | 'pending' | 'overdue';

export interface Speaker {
  id: string;
  name: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  photo: string;
  type: SpeakerType;
  status: SpeakerStatus;
  bio: string;
  expertise: string[];
  sessions: {
    id: string;
    name: string;
    date: string;
    time: string;
    role: string;
  }[];
  materials: {
    submitted: boolean;
    status: MaterialStatus;
    deadline?: string;
    size?: string;
    type?: string;
    fileUrl?: string;
  };
  rating: number;
  expectedAttendance: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  isNew?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SessionSummary {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  type: string;
  duration: string;
  expected: string;
  speakers: Speaker[];
  speakerIds: string[];
  attendees?: number;
  capacity?: number;
}

export const formatDateLabel = (iso?: string | null) => {
  if (!iso) return 'TBD';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'TBD';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatTimeLabel = (iso?: string | null) => {
  if (!iso) return 'TBD';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'TBD';
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

export const formatDurationLabel = (start?: string | null, end?: string | null) => {
  if (!start || !end) return 'TBD';
  const a = new Date(start);
  const b = new Date(end);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 'TBD';
  const minutes = Math.max(0, Math.round((b.getTime() - a.getTime()) / 60000));
  if (!minutes) return 'TBD';
  if (minutes < 60) return `${minutes} minutes`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins ? `${hrs}h ${mins}m` : `${hrs} hours`;
};

export const formatRelativeTime = (iso?: string | null) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diff = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const escapeCsv = (value: string) => {
  if (value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  if (value.includes(',') || value.includes('\n')) {
    return `"${value}"`;
  }
  return value;
};
