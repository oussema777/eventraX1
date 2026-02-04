import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Loader2, AlertCircle, TrendingUp, Users, PieChart as PieIcon, List } from 'lucide-react';

interface KpiField {
  id: string;
  label: string;
  type: string;
  options?: string[];
}

interface SmartKpiGridProps {
  eventId: string;
}

const COLORS = ['#0684F5', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

export default function SmartKpiGrid({ eventId }: SmartKpiGridProps) {
  const [loading, setLoading] = useState(true);
  const [kpiFields, setKpiFields] = useState<KpiField[]>([]);
  const [dataMap, setDataMap] = useState<Record<string, any[]>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;
    fetchSmartKpis();
  }, [eventId]);

  const fetchSmartKpis = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Find forms with KPI fields
      const { data: forms, error: formsError } = await supabase
        .from('event_forms')
        .select('id, schema')
        .eq('event_id', eventId)
        .eq('status', 'active');

      if (formsError) throw formsError;

      const fields: KpiField[] = [];
      const formIds: string[] = [];

      forms?.forEach(form => {
        if (form.schema?.fields) {
          const kpis = form.schema.fields.filter((f: any) => f.is_kpi);
          if (kpis.length > 0) {
            formIds.push(form.id);
            fields.push(...kpis);
          }
        }
      });

      setKpiFields(fields);

      if (fields.length === 0) {
        setLoading(false);
        return;
      }

      // 2. Fetch submissions for these forms
      const { data: submissions, error: subError } = await supabase
        .from('event_form_submissions')
        .select('data')
        .in('form_id', formIds);

      if (subError) throw subError;

      // 3. Aggregate Data
      const aggregations: Record<string, any[]> = {};

      fields.forEach(field => {
        const counts: Record<string, number> = {};
        
        submissions?.forEach(sub => {
          const value = sub.data[field.id] || sub.data[field.label]; // Try ID then Label
          
          if (Array.isArray(value)) {
            // Multi-select
            value.forEach(v => {
              const key = String(v).trim();
              if (key) counts[key] = (counts[key] || 0) + 1;
            });
          } else if (value) {
            // Single value
            const key = String(value).trim();
            counts[key] = (counts[key] || 0) + 1;
          }
        });

        // Convert to array for charts
        aggregations[field.id] = Object.entries(counts)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 8); // Top 8 only
      });

      setDataMap(aggregations);

    } catch (err: any) {
      console.error('Error fetching Smart KPIs:', err);
      setError('Failed to load Smart KPIs.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-[#0B2641]/50 rounded-xl border border-white/10">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
        <AlertCircle size={20} />
        {error}
      </div>
    );
  }

  if (kpiFields.length === 0) {
    return (
      <div className="p-8 bg-[#0B2641]/50 rounded-xl border border-white/10 text-center">
        <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="text-blue-400" size={24} />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Smart KPIs Defined</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Mark fields as "Smart KPIs" in your registration forms to see real-time attendee insights here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="text-blue-500" />
            Smart Audience Insights
          </h2>
          <p className="text-gray-400 mt-1">Real-time breakdown of attendee demographics and preferences.</p>
        </div>
        <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-medium">
          {kpiFields.length} Active KPIs
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {kpiFields.map((field) => {
          const data = dataMap[field.id] || [];
          const total = data.reduce((sum, item) => sum + item.value, 0);

          return (
            <div key={field.id} className="bg-[#0D3052] border border-white/10 rounded-xl p-6 flex flex-col h-[340px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-white truncate pr-4" title={field.label}>
                  {field.label}
                </h3>
                {field.type === 'text' ? (
                  <List className="text-gray-500" size={18} />
                ) : (
                  <PieIcon className="text-gray-500" size={18} />
                )}
              </div>

              <div className="flex-1 w-full min-h-0">
                {data.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <Users size={32} className="mb-2 opacity-20" />
                    <span className="text-sm">No data collected yet</span>
                  </div>
                ) : field.type === 'text' ? (
                  // List View for Text Fields
                  <div className="h-full overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    {data.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm group">
                        <span className="text-gray-300 truncate max-w-[70%] group-hover:text-white transition-colors">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500/50 rounded-full" 
                              style={{ width: `${(item.value / data[0].value) * 100}%` }}
                            />
                          </div>
                          <span className="text-gray-400 font-mono text-xs w-6 text-right">{item.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : field.type === 'multiselect' || field.type === 'checkbox' ? (
                   // Bar Chart for Multi-select
                   <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={data} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={80} 
                        tick={{ fill: '#94A3B8', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1E3A5F', borderColor: '#ffffff20', color: '#fff' }}
                        cursor={{ fill: '#ffffff05' }}
                      />
                      <Bar dataKey="value" fill="#0684F5" radius={[0, 4, 4, 0]} barSize={20}>
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  // Pie Chart for Single Select
                  <div className="h-full flex items-center justify-center relative">
                     <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1E3A5F', borderColor: '#ffffff20', color: '#fff', borderRadius: '8px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Legend Overlay */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                      <span className="text-2xl font-bold text-white block">{total}</span>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400">Total</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Footer / Legend for Pie */}
              {field.type !== 'text' && field.type !== 'multiselect' && data.length > 0 && (
                 <div className="mt-4 flex flex-wrap gap-2 justify-center">
                   {data.slice(0, 4).map((item, idx) => (
                     <div key={idx} className="flex items-center gap-1.5">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                       <span className="text-xs text-gray-400 truncate max-w-[80px]">{item.name}</span>
                     </div>
                   ))}
                 </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
