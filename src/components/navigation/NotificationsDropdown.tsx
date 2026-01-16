import { Bell, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { NotificationItem } from '../../lib/notifications';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export default function NotificationsDropdown({
  isOpen,
  onClose,
  notifications,
  isLoading,
  onMarkAsRead,
  onMarkAllRead
}: NotificationsDropdownProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const visible = notifications.slice(0, 4);

  return (
    <div
      className="absolute right-0 mt-2 rounded-lg overflow-hidden"
      style={{
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-medium)',
        minWidth: '320px',
        zIndex: 1000
      }}
    >
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <Bell size={16} style={{ color: 'var(--muted-foreground)' }} />
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>
            Notifications
          </span>
        </div>
        <button
          onClick={onMarkAllRead}
          style={{
            background: 'none',
            border: 'none',
            color: '#0684F5',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Mark all
        </button>
      </div>

      <div>
        {isLoading && (
          <div className="px-4 py-6 flex items-center justify-center">
            <Loader2 size={18} className="animate-spin" style={{ color: '#0684F5' }} />
          </div>
        )}

        {!isLoading && visible.length === 0 && (
          <div className="px-4 py-6 text-center" style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>
            No notifications yet.
          </div>
        )}

        {!isLoading &&
          visible.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onMarkAsRead(item.id);
                if (item.action_url) {
                  navigate(item.action_url);
                }
                onClose();
              }}
              className="w-full text-left px-4 py-3 transition-colors"
              style={{
                backgroundColor: item.read_at ? 'transparent' : 'rgba(6, 132, 245, 0.08)',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              <div className="flex items-start gap-2">
                {!item.read_at && <span style={{ color: '#0684F5', marginTop: '4px' }}>•</span>}
                <div className="flex-1">
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '4px' }}>
                    {item.body}
                  </div>
                </div>
              </div>
            </button>
          ))}
      </div>

      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <button
          onClick={() => {
            navigate('/notifications');
            onClose();
          }}
          className="text-sm font-semibold"
          style={{ color: '#0684F5', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          See more
        </button>
        <button
          onClick={onClose}
          className="text-xs"
          style={{ color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
