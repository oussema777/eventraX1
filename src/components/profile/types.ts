export type ProfileOption = {
  value: string;
  label: string;
  helper?: string;
  checked?: boolean;
};

export type ProfileTab = 'basic' | 'professional' | 'b2b' | 'preferences';

export interface EducationDraft {
  id: string;
  degree: string;
  institution: string;
  years: string;
}

export interface ProfileStats {
  eventsAttended: number;
  b2bMeetings: number;
  connections: number;
  profileViews: number;
}

export interface ProfileCompletionStats {
  percent: number;
  hasLinkedIn: boolean;
  linkedInTarget: number;
}

export const buildFallbackAvatar = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0684F5&color=fff&size=256`;

export const getDefaultOptionValue = (options: ProfileOption[]) =>
  options.find((option) => option.checked)?.value ?? options[0]?.value ?? '';
