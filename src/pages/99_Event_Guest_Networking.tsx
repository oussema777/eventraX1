import { useEffect, useState } from 'react';
import { LogOut, Network } from 'lucide-react';
import { useEventRouteParams } from '../components/navigation/EventPublicRoute';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import UserB2BCenter from '../components/networking/UserB2BCenter';
import UserB2BCenterPage from './22_User_B2B_Center';

export default function EventGuestNetworkingPage() {
  const { eventId } = useEventRouteParams();
  const { signOut, accountType } = useAuth();
  const { t } = useI18n();
  const [eventName, setEventName] = useState('');
  const isMember = accountType !== 'event_guest';
  useEffect(() => {
    if (isMember || !eventId) return;
    let active = true;
    void supabase.from('events').select('name').eq('id', eventId).single()
      .then(({ data }) => { if (active) setEventName(data?.name || ''); });
    return () => { active = false; };
  }, [eventId, isMember]);
  if (isMember) return <UserB2BCenterPage initialEventId={eventId} />;
  return <div style={{ backgroundColor: '#0B2641', minHeight: '100vh' }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '16px 24px', borderBottom: '1px solid #ffffff20', color: '#fff' }}>
      <div className="flex items-center gap-3"><Network size={22} /><span>{eventName || t('networking.title')}</span></div>
      <button onClick={() => signOut()} className="flex items-center gap-2 text-slate-300"><LogOut size={16} />{t('common.signOut', { defaultValue: 'Sign out' })}</button>
    </header>
    <UserB2BCenter eventId={eventId} guest />
  </div>;
}
