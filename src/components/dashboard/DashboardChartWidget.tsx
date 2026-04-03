import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { MoreVertical, BarChart3 } from 'lucide-react';

interface DashboardChartWidgetProps {
  title: string;
  subtitle?: string;
  type: 'area' | 'bar' | 'pie';
  data: any[];
  dataKey: string;
  nameKey?: string; // For Pie charts
  color?: string;
  height?: number;
  className?: string;
}

const COLORS = ['#0684F5', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

export default function DashboardChartWidget({
  title,
  subtitle,
  type,
  data,
  dataKey,
  nameKey = 'name',
  color = '#0684F5',
  height = 250,
  className = ''
}: DashboardChartWidgetProps) {
  return (
    <div
      className={`rounded-xl p-6 flex flex-col ${className}`}
      style={{
        backgroundColor: '#0D3052',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
            {title}
          </h3>
          {subtitle && (
            <p style={{ fontSize: '14px', color: '#94A3B8' }}>
              {subtitle}
            </p>
          )}
        </div>
        <button className="text-slate-400 hover:text-white transition-colors" aria-label="Chart options">
          <MoreVertical size={18} />
        </button>
      </div>

      <div style={{ height: height, width: '100%' }}>
        {data.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 gap-2 border-2 border-dashed border-white/5 rounded-lg">
            <BarChart3 size={32} className="opacity-50" />
            <span className="text-sm">No data available yet</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey={nameKey} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 12 }} 
                dy={10}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0B2641', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#FFFFFF' }}
                labelStyle={{ color: '#94A3B8', marginBottom: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                fillOpacity={1} 
                fill={`url(#gradient-${title})`} 
                strokeWidth={2}
              />
            </AreaChart>
          ) : type === 'pie' ? (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey={dataKey}
                nameKey={nameKey}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.2)" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0B2641', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#FFFFFF' }}
              />
            </PieChart>
          ) : (
            <BarChart data={data} barSize={32}>
              <XAxis 
                dataKey={nameKey} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 12 }} 
                dy={10}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: '#0B2641', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#FFFFFF' }}
              />
              <Bar 
                dataKey={dataKey} 
                fill={color} 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          )}
        </ResponsiveContainer>
        )}
      </div>
      
      {/* Legend for Pie Charts */}
      {type === 'pie' && (
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {data.slice(0, 4).map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }} 
              />
              <span className="text-xs text-slate-400">
                {entry[nameKey]} ({entry[dataKey]})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
