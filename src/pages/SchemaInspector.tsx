import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function SchemaInspector() {
  useEffect(() => {
    const inspect = async () => {
      console.log('Inspecting event_attendees...');
      const { data, error } = await supabase.from('event_attendees').select('*').limit(1);
      if (error) console.error(error);
      else console.log('Keys:', Object.keys(data?.[0] || {}));
    };
    inspect();
  }, []);
  return <div>Check Console</div>;
}
