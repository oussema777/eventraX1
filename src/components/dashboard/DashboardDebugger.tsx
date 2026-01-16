import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Bug, X } from 'lucide-react';

export default function DashboardDebugger({ eventId }: { eventId?: string }) {
  const [debugData, setDebugData] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    async function inspectEvent() {
      // Select * to see ALL columns
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();
      
      if (data) {
        setDebugData({
          id: data.id,
          name: data.name,
          event_type: data.event_type,
          event_format: data.event_format,
          // List top 5 keys to verify schema structure
          available_columns: Object.keys(data).slice(0, 10).join(', ') + '...',
          raw_status: data.status
        });
      } else {
        setDebugData({ error: error?.message || 'No data found' });
      }
    }
    inspectEvent();
  }, [eventId]);

  if (!isVisible || !debugData) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-2xl bg-black/90 border border-red-500/50 text-xs font-mono text-green-400 w-96">
      <div className="flex items-center justify-between mb-2 border-b border-red-500/30 pb-2">
        <div className="flex items-center gap-2">
          <Bug size={14} className="text-red-500" />
          <span className="font-bold text-white">Event Data Inspector</span>
        </div>
        <button onClick={() => setIsVisible(false)} className="text-gray-500 hover:text-white">
          <X size={14} />
        </button>
      </div>
      <div className="space-y-2">
        <div>
          <span className="text-gray-500">event_type:</span>{' '}
          <span className="text-yellow-300">"{debugData.event_type || 'NULL'}"</span>
        </div>
        <div>
          <span className="text-gray-500">event_format:</span>{' '}
          <span className="text-yellow-300">"{debugData.event_format || 'NULL'}"</span>
        </div>
        <div>
          <span className="text-gray-500">Status:</span>{' '}
          <span className="text-blue-300">{debugData.raw_status}</span>
        </div>
        <div className="pt-2 border-t border-gray-800">
           <p className="text-gray-500 mb-1">Raw Columns Detected:</p>
           <p className="text-gray-400 break-words leading-tight">{debugData.available_columns}</p>
        </div>
      </div>
    </div>
  );
}
