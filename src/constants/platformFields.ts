// src/constants/platformFields.ts

export const PLATFORM_INTERESTS = [
  'AI/ML',
  'FinTech',
  'CleanTech',
  'AgriTech',
  'HealthTech',
  'EdTech',
  'E-commerce',
  'SaaS',
  'IoT',
  'Blockchain',
  'Cybersecurity',
  'Marketing',
  'Investment',
  'Export',
  'Partnership',
  'Sustainability',
  'Digital Transformation',
  'Supply Chain',
  'Human Resources',
  'Legal/Compliance',
] as const;

export const PLATFORM_SECTORS = [
  'Technology',
  'Finance & Banking',
  'Healthcare',
  'Agriculture',
  'Education',
  'Energy & Utilities',
  'Manufacturing',
  'Retail & Commerce',
  'Tourism & Hospitality',
  'Creative Industries',
  'Logistics & Transport',
  'Real Estate',
  'Telecommunications',
  'Food & Beverage',
  'Mining & Resources',
  'Government & Public Sector',
  'Non-Profit & NGO',
] as const;

export type PlatformInterest = typeof PLATFORM_INTERESTS[number];
export type PlatformSector = typeof PLATFORM_SECTORS[number];
