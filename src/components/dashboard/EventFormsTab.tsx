import { useState, useEffect } from 'react';
import { 
  FileText, 
  ExternalLink, 
  Copy, 
  Eye, 
  Download, 
  Search, 
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../i18n/I18nContext';

interface EventForm {
  id: string;
  title: string;
  description: string;
  form_type: string;
  is_active: boolean;
  created_at: string;
  schema: any;
}

interface FormSubmission {
  id: string;
  created_at: string;
  attendee_id?: string;
  attendee_name?: string;
  attendee_email?: string;
  data: Record<string, any>;
}

export default function EventFormsTab({ eventId }: { eventId: string }) {
  const { t } = useI18n();
  const [forms, setForms] = useState<EventForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<EventForm | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');

  useEffect(() => {
    fetchForms();
  }, [eventId]);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('event_forms')
        .select('*')
        .eq('event_id', eventId)
        .in('status', ['active', 'draft'])
        .neq('form_type', 'registration') // Exclude main registration if desired, or keep it
        .order('created_at', { ascending: false });

      if (error) throw error;
      setForms(data || []);
    } catch (error) {
      console.error('Error loading forms:', error);
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (formId: string) => {
    try {
      setLoadingSubmissions(true);
      // Join with attendees to get names
      const { data, error } = await supabase
        .from('event_form_submissions')
        .select(`
          id,
          created_at,
          data,
          attendee_id,
          event_attendees (
            name,
            email
          )
        `)
        .eq('form_id', formId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map((row: any) => ({
        id: row.id,
        created_at: row.created_at,
        attendee_id: row.attendee_id,
        attendee_name: row.event_attendees?.name || 'Anonymous',
        attendee_email: row.event_attendees?.email || '',
        data: row.data || {}
      }));

      setSubmissions(formatted);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleViewSubmissions = (form: EventForm) => {
    setSelectedForm(form);
    setViewMode('details');
    fetchSubmissions(form.id);
  };

  const handleCopyLink = (formId: string) => {
    const link = `${window.location.origin}/forms/${formId}`;
    navigator.clipboard.writeText(link);
    toast.success('Form link copied to clipboard');
  };

  const handleExportCSV = () => {
    if (!selectedForm || submissions.length === 0) return;

    // Get all unique keys from data
    const keys = Array.from(new Set(submissions.flatMap(s => Object.keys(s.data))));
    const headers = ['Submitted At', 'Attendee Name', 'Attendee Email', ...keys];
    
    const csvContent = [
      headers.join(','),
      ...submissions.map(s => {
        const row = [
          new Date(s.created_at).toLocaleString(),
          `"${s.attendee_name || ''}"`, 
          `"${s.attendee_email || ''}"`, 
          ...keys.map(k => `"${(s.data[k] || '').toString().replace(/"/g, '""')}"`)
        ];
        return row.join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedForm.title.replace(/\s+/g, '_')}_submissions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (viewMode === 'details' && selectedForm) {
    return (
      <div className="p-8 bg-[#0B2641] min-h-screen">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setViewMode('list')}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-white">{selectedForm.title}</h2>
              <p className="text-gray-400">Viewing {submissions.length} submissions</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-[#0684F5] text-white rounded-lg hover:bg-[#0570D6] transition-colors font-medium"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0D3052] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-white/5 text-xs uppercase font-medium text-white">
                <tr>
                  <th className="px-6 py-4">Submitted At</th>
                  <th className="px-6 py-4">Attendee</th>
                  {/* Dynamic Headers based on schema if available, else generic */}
                  {selectedForm.schema?.fields?.map((f: any) => (
                    <th key={f.id} className="px-6 py-4">{f.label}</th>
                  )) || <th className="px-6 py-4">Data</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                      No submissions yet.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(sub.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{sub.attendee_name}</div>
                        <div className="text-xs">{sub.attendee_email}</div>
                      </td>
                      {selectedForm.schema?.fields?.map((f: any) => (
                        <td key={f.id} className="px-6 py-4 max-w-xs truncate" title={sub.data[f.label]?.toString()}>
                          {sub.data[f.label] || sub.data[f.id] || '-'}
                        </td>
                      )) || (
                        <td className="px-6 py-4">
                          <pre className="text-xs">{JSON.stringify(sub.data, null, 2)}</pre>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#0B2641] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Form Management</h1>
        <p className="text-gray-400">View and manage submissions for your event forms.</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0D3052] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-white/5 text-xs uppercase font-medium text-white">
              <tr>
                <th className="px-6 py-4">Form Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {forms.map((form) => (
                <tr key={form.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="text-white font-medium text-base">{form.title}</div>
                    <div className="text-xs text-gray-500">{form.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20 capitalize">
                      {form.form_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(form.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopyLink(form.id)}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        title="Copy Public Link"
                      >
                        <Copy size={18} />
                      </button>
                      <button
                        onClick={() => handleViewSubmissions(form)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0684F5] text-white rounded-lg hover:bg-[#0570D6] transition-colors text-xs font-bold"
                      >
                        <Eye size={16} />
                        View Submissions
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {forms.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <FileText size={48} className="mx-auto mb-4 opacity-20" />
                    No custom forms found for this event.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}