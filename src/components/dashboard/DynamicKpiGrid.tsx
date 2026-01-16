import { 
  Users, 
  DollarSign, 
  Ticket, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Handshake, 
  Link, 
  Award,
  Mic,
  PieChart,
  Target
} from 'lucide-react';
import { useEventStats } from '../../hooks/useEventStats';
import { useI18n } from '../../i18n/I18nContext';

interface DynamicKpiGridProps {
  eventId?: string;
}

export default function DynamicKpiGrid({ eventId }: DynamicKpiGridProps) {
  const { baseStats, typeStats, audienceInsights, eventType, isLoading } = useEventStats(eventId);
  const { t } = useI18n();

  if (isLoading) {
    return <div className="animate-pulse h-32 bg-white/5 rounded-xl"></div>;
  }

  const fmtMoney = (v: number) => {
    return `${baseStats.currency} ${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const capacityPct = baseStats.ticketsTotal > 0 
    ? Math.round((baseStats.ticketsSold / baseStats.ticketsTotal) * 100) 
    : 0;

  // 1. Core KPIs (Always visible)
  const coreMetrics = [
    {
      label: t('manageEvent.overview.metrics.registrations.label'),
      value: baseStats.registrations.toLocaleString(),
      change: baseStats.registrations > 0 ? t('manageEvent.overview.metrics.registrations.active') : t('manageEvent.overview.metrics.registrations.none'),
      trend: baseStats.registrations > 0 ? 'up' : 'neutral',
      icon: Users,
      color: '#0684F5'
    },
    {
      label: t('manageEvent.overview.metrics.revenue.label'),
      value: fmtMoney(baseStats.revenue),
      change: baseStats.revenue > 0 ? t('manageEvent.overview.metrics.revenue.fromSales') : t('manageEvent.overview.metrics.revenue.none'),
      trend: baseStats.revenue > 0 ? 'up' : 'neutral',
      icon: DollarSign,
      color: '#10B981'
    },
    {
      label: t('manageEvent.overview.metrics.ticketsSold.label'),
      value: baseStats.ticketsTotal > 0 ? `${baseStats.ticketsSold} / ${baseStats.ticketsTotal}` : `${baseStats.ticketsSold}`,
      change: baseStats.ticketsTotal > 0 ? `${capacityPct}% Capacity` : 'No Limit',
      trend: 'neutral',
      icon: Ticket,
      color: '#F59E0B'
    }
  ];

  // 2. Dynamic KPIs based on Type
  const dynamicMetrics: any[] = [];

  if (eventType === 'summit' || eventType === 'conference') {
    dynamicMetrics.push({
      label: 'Speakers',
      value: baseStats.speakers,
      change: 'Confirmed',
      trend: 'neutral',
      icon: Mic,
      color: '#8B5CF6'
    });
    dynamicMetrics.push({
      label: 'Sponsors',
      value: typeStats.sponsorsCount || 0,
      change: 'Active',
      trend: 'neutral',
      icon: Award,
      color: '#EC4899'
    });
  } else if (eventType === 'networking') {
    dynamicMetrics.push({
      label: 'Meetings',
      value: typeStats.meetingsScheduled || 0,
      change: 'Scheduled',
      trend: 'up',
      icon: Handshake,
      color: '#8B5CF6'
    });
    dynamicMetrics.push({
      label: 'Connections',
      value: typeStats.connectionsMade || 0,
      change: 'New',
      trend: 'up',
      icon: Link,
      color: '#EC4899'
    });
  } else {
    // Generic fallback or extra core metric
    dynamicMetrics.push({
      label: t('manageEvent.overview.metrics.avgPrice.label'),
      value: fmtMoney(baseStats.avgPrice),
      change: 'Avg Ticket Price',
      trend: 'neutral',
      icon: TrendingUp,
      color: '#8B5CF6'
    });
  }

  const displayMetrics = [...coreMetrics, ...dynamicMetrics].slice(0, 4);

  return (
    <div className="space-y-6 mb-8">
      {/* KPI Grid */}
      <div className="grid grid-cols-4 gap-6">
        {displayMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className="rounded-xl p-6"
              style={{
                backgroundColor: '#0D3052',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${metric.color}25` }}
                >
                  <Icon size={24} style={{ color: metric.color }} />
                </div>
                {metric.trend !== 'neutral' && (
                  <span
                    className="flex items-center gap-1 px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: metric.trend === 'up' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: metric.trend === 'up' ? '#10B981' : '#EF4444',
                      fontSize: '12px',
                      fontWeight: 600
                    }}
                  >
                    {metric.trend === 'up' ? (
                      <ArrowUpRight size={12} />
                    ) : (
                      <ArrowDownRight size={12} />
                    )}
                    {metric.change}
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
                {metric.value}
              </h3>
              <p style={{ fontSize: '14px', color: '#94A3B8' }}>
                {metric.label}
              </p>
              {metric.trend === 'neutral' && (
                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                  {metric.change}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Smart Audience Insights Row */}
      <div 
          className="rounded-xl p-6"
          style={{
            backgroundColor: '#0D3052',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'linear-gradient(135deg, rgba(13, 48, 82, 1) 0%, rgba(13, 48, 82, 0.8) 100%)'
          }}
      >
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target size={20} className="text-[#0684F5]" />
              <h3 className="text-lg font-bold text-white">
                Audience Insights
                {audienceInsights.length > 0 && <span className="ml-2 text-sm font-normal text-gray-400">Top {audienceInsights[0].label}</span>}
              </h3>
            </div>
            <span className="text-xs px-2 py-1 rounded bg-white/10 text-gray-400 uppercase tracking-wider">
              Type: {eventType}
            </span>
        </div>
        
        {audienceInsights.length > 0 ? (
          <div className="grid grid-cols-3 gap-6">
            {audienceInsights.map((item, idx) => (
                <div key={idx} className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-[#0684F5] bg-[#0684F5]/10">
                        {item.value}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-white">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-[#0684F5]/20">
                    <div style={{ width: `${item.percentage}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#0684F5]"></div>
                  </div>
                  <p className="text-xs text-gray-400">{item.count} attendees</p>
                </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-white/10 rounded-lg">
            <p className="text-gray-400 text-sm">
              Waiting for attendee data to generate insights...
            </p>
            <p className="text-xs text-gray-600 mt-1">
              (This section will auto-analyze Job Titles or Industries once registrations arrive)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
