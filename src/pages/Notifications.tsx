import { Bell, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0B2641', paddingTop: '90px' }}>
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell size={22} style={{ color: '#94A3B8' }} />
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF' }}>
              Notifications
            </h1>
          </div>
          <button
            onClick={markAllAsRead}
            className="px-3 py-2 rounded-lg text-sm font-semibold"
            style={{
              backgroundColor: 'rgba(6, 132, 245, 0.15)',
              border: '1px solid rgba(6, 132, 245, 0.4)',
              color: '#0684F5'
            }}
          >
            Mark all as read ({unreadCount})
          </button>
        </div>

        <div
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {isLoading && (
            <div className="py-12 flex items-center justify-center">
              <Loader2 size={22} className="animate-spin" style={{ color: '#0684F5' }} />
            </div>
          )}

          {!isLoading && notifications.length === 0 && (
            <div className="py-12 text-center" style={{ color: '#94A3B8' }}>
              No notifications yet.
            </div>
          )}

          {!isLoading &&
            notifications.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  markAsRead(item.id);
                  if (item.action_url) {
                    navigate(item.action_url);
                  }
                }}
                className="w-full text-left px-5 py-4 transition-colors"
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  backgroundColor: item.read_at ? 'transparent' : 'rgba(6, 132, 245, 0.08)'
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: item.read_at ? '#94A3B8' : '#0684F5'
                    }}
                  >
                    {item.read_at ? <Check size={16} /> : <Bell size={16} />}
                  </div>
                  <div className="flex-1">
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '6px' }}>
                      {item.body}
                    </div>
                  </div>
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

