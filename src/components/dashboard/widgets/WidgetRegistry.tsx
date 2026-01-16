import { 
  Users, 
  Mic, 
  Award, 
  Handshake, 
  Link, 
  TrendingUp,
  LucideIcon
} from 'lucide-react';

export type WidgetType = 
  | 'speakers_confirmed'
  | 'sponsors_active'
  | 'meetings_scheduled'
  | 'connections_made'
  | 'avg_ticket_price'
  | 'abstracts_received'
  | 'certificates_issued';

export interface KPIWidgetConfig {
  id: WidgetType;
  labelKey: string; // Translation key
  icon: LucideIcon;
  color: string;
  dataKey: string; // Path to data in the stats object
}

// Configuration Map
export const WIDGET_REGISTRY: Record<string, KPIWidgetConfig[]> = {
  // Summit / Conference
  summit: [
    { id: 'speakers_confirmed', labelKey: 'manageEvent.kpi.speakers', icon: Mic, color: '#8B5CF6', dataKey: 'baseStats.speakers' },
    { id: 'sponsors_active', labelKey: 'manageEvent.kpi.sponsors', icon: Award, color: '#EC4899', dataKey: 'typeStats.sponsorsCount' }
  ],
  conference: [
    { id: 'speakers_confirmed', labelKey: 'manageEvent.kpi.speakers', icon: Mic, color: '#8B5CF6', dataKey: 'baseStats.speakers' },
    { id: 'sponsors_active', labelKey: 'manageEvent.kpi.sponsors', icon: Award, color: '#EC4899', dataKey: 'typeStats.sponsorsCount' }
  ],
  
  // Networking
  networking: [
    { id: 'meetings_scheduled', labelKey: 'manageEvent.kpi.meetings', icon: Handshake, color: '#8B5CF6', dataKey: 'typeStats.meetingsScheduled' },
    { id: 'connections_made', labelKey: 'manageEvent.kpi.connections', icon: Link, color: '#EC4899', dataKey: 'typeStats.connectionsMade' }
  ],

  // Default Fallback
  generic: [
    { id: 'avg_ticket_price', labelKey: 'manageEvent.kpi.avgPrice', icon: TrendingUp, color: '#8B5CF6', dataKey: 'baseStats.avgPrice' }
  ]
};

export function getWidgetsForType(type: string): KPIWidgetConfig[] {
  const normalizedType = type?.toLowerCase().trim();
  return WIDGET_REGISTRY[normalizedType] || WIDGET_REGISTRY['generic'];
}
