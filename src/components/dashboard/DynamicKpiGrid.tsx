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
  Target,
  Calendar
} from 'lucide-react';
import { 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as ReTooltip 
} from 'recharts';
import { useEventStats } from '../../hooks/useEventStats';
import { useI18n } from '../../i18n/I18nContext';

interface DynamicKpiGridProps {
  eventId?: string;
}

const COLORS = ['#0684F5', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

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
      label: 'Exhibitors',
      value: baseStats.exhibitors.toLocaleString(),
      change: baseStats.exhibitors > 0 ? 'Active Partners' : 'No Exhibitors',
      trend: baseStats.exhibitors > 0 ? 'up' : 'neutral',
      icon: Handshake,
      color: '#10B981'
    },
    {
      label: 'B2B Meetings',
      value: (typeStats.meetingsScheduled || 0).toLocaleString(),
      change: 'Confirmed',
      trend: 'neutral',
      icon: Link,
      color: '#F59E0B'
    }
  ];

  // 2. Dynamic KPIs based on Type
  const dynamicMetrics: any[] = [];
  const normalizedType = (eventType || 'generic').toLowerCase();

  // 2a. Priority: Top Audience Insight (from Registration Data)
  if (audienceInsights.length > 0) {
    const topInsight = audienceInsights[0];
    dynamicMetrics.push({
      label: `Top ${topInsight.label}`,
      value: topInsight.value,
      change: `${topInsight.percentage}% of Attendees`,
      trend: 'neutral',
      icon: PieChart,
      color: '#F59E0B'
    });
  }

  if (['summit', 'conference'].includes(normalizedType)) {
    dynamicMetrics.push({
      label: 'Speakers',
      value: baseStats.speakers,
      change: 'Confirmed',
      trend: 'neutral',
      icon: Mic,
      color: '#8B5CF6'
    });
    dynamicMetrics.push({
      label: 'Sessions',
      value: baseStats.sessions,
      change: 'Programmed',
      trend: 'neutral',
      icon: Calendar, // Need to import Calendar or use similar
      color: '#0684F5'
    });
    dynamicMetrics.push({
      label: 'Sponsors',
      value: typeStats.sponsorsCount || 0,
      change: 'Active',
      trend: 'neutral',
      icon: Award,
      color: '#EC4899'
    });
  } else if (['training', 'workshop', 'masterclass', 'bootcamp'].includes(normalizedType)) {
    dynamicMetrics.push({
      label: 'Certificates',
      value: typeStats.certificatesIssued || 0,
      change: 'Issued',
      trend: 'up',
      icon: Award,
      color: '#10B981'
    });
    dynamicMetrics.push({
      label: 'Curriculum',
      value: `${baseStats.sessions} Modules`,
      change: 'Active',
      trend: 'neutral',
      icon: Target,
      color: '#8B5CF6'
    });
    dynamicMetrics.push({
      label: 'Avg Score',
      value: `${typeStats.avgQuizScore || 0}%`,
      change: 'Quiz Results',
      trend: 'neutral',
      icon: Target,
      color: '#F59E0B'
    });
  } else if (normalizedType === 'networking') {
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

  const displayMetrics = [...coreMetrics, ...dynamicMetrics].slice(0, 6);

  return (
    <div className="space-y-6 mb-8">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
          className="rounded-xl p-6 relative overflow-hidden"
          style={{
            backgroundColor: '#0D3052',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'linear-gradient(135deg, rgba(13, 48, 82, 1) 0%, rgba(13, 48, 82, 0.95) 100%)'
          }}
      >
        <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#0684F5]/20">
                <Target size={20} className="text-[#0684F5]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">
                  Audience Intelligence
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  Analysis based on {audienceInsights.length > 0 ? audienceInsights[0].label : 'registration data'}
                </p>
              </div>
            </div>
            {audienceInsights.length > 0 && (
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#0684F5]/10 text-[#0684F5] border border-[#0684F5]/20 uppercase tracking-wide">
                Active
              </span>
            )}
        </div>
        
        {audienceInsights.length > 0 ? (
          <div className="relative z-10">
             {/* 1. Human-Readable Narrative */}
             <div className="mb-8 p-5 rounded-xl bg-gradient-to-r from-white/10 to-transparent border border-white/10 backdrop-blur-sm">
                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-[#F59E0B]/20 rounded-lg text-[#F59E0B] mt-0.5">
                    <Target size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">Strategic Insight</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {audienceInsights[0].percentage > 50 
                        ? <><strong>Dominant Segment Detected:</strong> The majority of your audience ({audienceInsights[0].percentage}%) are <strong>{audienceInsights[0].value}s</strong>. Consider tailoring your keynote to address their specific challenges.</>
                        : audienceInsights[0].percentage > 25
                          ? <><strong>Key Segment Identified:</strong> A significant portion ({audienceInsights[0].percentage}%) identifies as <strong>{audienceInsights[0].value}</strong>. Make sure your program includes relevant content for this group.</>
                          : <><strong>Diverse Audience:</strong> Your attendees come from varied backgrounds, with <strong>{audienceInsights[0].value}</strong> being the largest single group ({audienceInsights[0].percentage}%).</>
                      }
                    </p>
                  </div>
                </div>
             </div>

             {/* 2. Visual Breakdown & Chart */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Chart Column */}
                <div className="relative h-[220px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={audienceInsights.slice(0, 5)}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="count"
                        nameKey="value"
                        stroke="none"
                      >
                        {audienceInsights.slice(0, 5).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ReTooltip 
                        contentStyle={{ 
                          backgroundColor: '#0F172A', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#fff',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
                        }}
                        itemStyle={{ color: '#E2E8F0' }}
                        cursor={false}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                  
                  {/* Center Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-white">{baseStats.registrations}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Attendees</span>
                  </div>
                </div>

                {/* Legend / List Column */}
                <div className="space-y-4 pr-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 pl-1">Top Segments</h4>
                  <div className="space-y-3">
                    {audienceInsights.slice(0, 4).map((item, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-default"
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" 
                              style={{ backgroundColor: COLORS[idx % COLORS.length] }} 
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-white truncate max-w-[120px] sm:max-w-[160px]" title={item.value}>
                                {item.value}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {item.count} attendee{item.count !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-bold text-white">
                              {item.percentage}%
                            </span>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
             </div>
          </div>
        ) : (
          <div className="text-center py-8 px-4 rounded-lg border border-dashed border-white/10 bg-white/5">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
              <PieChart size={20} className="text-gray-500" />
            </div>
            <h4 className="text-white font-medium mb-1">Awaiting Data</h4>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">
              Once attendees start registering, we'll automatically analyze their Job Titles, Industries, or Locations to give you actionable insights here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
