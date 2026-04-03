import type { LucideIcon } from 'lucide-react';

export type TabMode = 'exhibitors' | 'sponsors' | 'inquiries';
export type ManagementMode = 'manual' | 'self-fill';
export type ViewMode = 'cards' | 'list' | 'booth-map';
export type ProfileStatus = 'complete' | 'incomplete' | 'pending';
export type SponsorTier = 'platinum' | 'gold' | 'silver' | 'bronze';

export interface SponsorshipInquiry {
  id: string;
  fullName: string;
  companyName: string;
  email: string;
  message: string;
  packageId: string;
  status: 'new' | 'contacted' | 'closed';
  createdAt: string;
}

export interface Exhibitor {
  id: string;
  companyName: string;
  logo: string;
  website: string;
  description: string;
  category: string;
  tags: string[];
  createdAt?: string | null;
  booth?: {
    number: string;
    hall: string;
    location: string;
  };
  contact: {
    name: string;
    role: string;
    email: string;
    phone: string;
  };
  profileStatus: ProfileStatus;
  completionPercentage: number;
}

export interface Sponsor {
  id: string;
  companyName: string;
  logo: string;
  website: string;
  description: string;
  category: string;
  tier: SponsorTier;
  benefits: string[];
  createdAt?: string | null;
  contact: {
    name: string;
    role: string;
    email: string;
    phone: string;
  };
  profileStatus: ProfileStatus;
  completionPercentage: number;
  // Allow dynamic properties from data mapping
  [key: string]: any;
}

export interface StatCard {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bg: string;
}
