import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LogOut, Network } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import UserB2BCenter from '../components/networking/UserB2BCenter';

/**
 * Event-scoped guest networking surface.
 *
 * Event registrants who opt into B2B get a hidden per-event "guest" identity.
 * This page exposes ONLY that single event's networking (matches, connections,
 * meetings, 1:1 messages) by composing <UserB2BCenter eventId guest />, with no
 * global app chrome and no links to the rest of Eventra. Other participants'
 * email/phone are never displayed (enforced inside UserB2BCenter).
 *
 * NOTE: route wiring is intentionally NOT done here — that is a separate task.
 */
export default function EventGuestNetworkingPage() {
  const { eventId } = useParams();
  const { signOut } = useAuth();
  const { t } = useI18n();
  const [eventName, setEventName] = useState('');

  useEffect(() => {
    let active = true;
    if (!eventId) return;
    (async () => {
      // Header only — fetch the event display name by id (name column only).
      const { data } = await supabase
        .from('events')
        .select('name')
        .eq('id', eventId)
        .single();
      if (active && data?.name) setEventName(data.name);
    })();
    return () => {
      active = false;
    };
  }, [eventId]);

  return (
    <div style={{ backgroundColor: '#0B2641', minHeight: '100vh' }}>
      {/* Minimal guest header: event name + sign out. No dashboard / profile /
          other-event links, no global navbar. */}
      <header
        className="flex items-center justify-between"
        style={{
          height: '64px',
          padding: '0 24px',
          backgroundColor: '#0D243B',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}
      >
        <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
          <div
            className="flex items-center justify-center rounded-lg flex-shrink-0"
            style={{
              width: '36px',
              height: '36px',
              backgroundColor: 'rgba(6, 132, 245, 0.2)'
            }}
          >
            <Network size={18} style={{ color: '#0684F5' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: '12px',
                color: '#94A3B8',
                lineHeight: 1.2,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              {t('networking.title', { defaultValue: 'Networking' })}
            </p>
            <h1
              className="truncate"
              style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', lineHeight: 1.3 }}
            >
              {eventName || t('networking.defaults.event', { defaultValue: 'Event' })}
            </h1>
          </div>
        </div>

        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 rounded-lg transition-colors flex-shrink-0"
          style={{
            padding: '8px 14px',
            backgroundColor: 'transparent',
            color: '#94A3B8',
            fontSize: '14px',
            fontWeight: 500,
            border: '1px solid rgba(255,255,255,0.2)',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#94A3B8';
          }}
        >
          <LogOut size={16} />
          <span>{t('common.signOut', { defaultValue: 'Sign out' })}</span>
        </button>
      </header>

      {/* Single-event scoped networking surface. */}
      <UserB2BCenter eventId={eventId} guest />
    </div>
  );
}
