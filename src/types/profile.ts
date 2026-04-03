export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: string | null;
  plan: string | null;
  language: string | null;
  job_title: string | null;
  company: string | null;
  location: string | null;
  bio: string | null;
  phone: string | null;
  website: string | null;
  linkedin_url: string | null;
  professional_data: Record<string, unknown> | null;
  b2b_profile: Record<string, unknown> | null;
  industry: string | null;
  interests: string[] | null;
  created_at: string;
  updated_at: string;
}
