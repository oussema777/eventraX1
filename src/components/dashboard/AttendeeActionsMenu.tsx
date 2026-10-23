import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check, MoreVertical, QrCode, Trash } from 'lucide-react';
import type { CSSProperties } from 'react';

const itemStyle: CSSProperties = {
  padding: '12px 16px', fontSize: '13px', fontWeight: 600,
  display: 'flex', alignItems: 'center', gap: '10px',
  color: '#0F172A', cursor: 'pointer', outline: 'none',
};

export default function AttendeeActionsMenu({ name, checkedIn, onCheckIn, onDelete, approved, onToggleApproval }: {
  name: string;
  checkedIn: boolean;
  onCheckIn: () => void;
  onDelete: () => void;
  approved?: boolean;
  onToggleApproval?: () => void;
}) {
  return <DropdownMenu.Root modal={false}>
    <DropdownMenu.Trigger asChild>
      <button type="button" aria-label={`Actions for ${name || 'attendee'}`}
        onClick={event => event.stopPropagation()}
        style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <MoreVertical size={16} />
      </button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
      <DropdownMenu.Content align="end" sideOffset={6} collisionPadding={8}
        onClick={event => event.stopPropagation()}
        style={{ width: '192px', maxHeight: 'var(--radix-dropdown-menu-content-available-height)', overflowY: 'auto', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.3)', zIndex: 100 }}>
        {onToggleApproval && <DropdownMenu.Item onSelect={onToggleApproval} style={itemStyle}
          onFocus={event => { event.currentTarget.style.backgroundColor = '#F0FDF4'; }}
          onBlur={event => { event.currentTarget.style.backgroundColor = 'transparent'; }}>
          <Check size={16} style={{ color: '#10B981' }} /> {approved ? 'Set Pending' : 'Approve'}
        </DropdownMenu.Item>}
        <DropdownMenu.Item onSelect={onCheckIn} style={itemStyle}
          onFocus={event => { event.currentTarget.style.backgroundColor = '#F0FDF4'; }}
          onBlur={event => { event.currentTarget.style.backgroundColor = 'transparent'; }}>
          <QrCode size={16} style={{ color: '#10B981' }} />
          {checkedIn ? 'Cancel Check-in' : 'Manual Check-in'}
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={onDelete} style={{ ...itemStyle, borderTop: '1px solid #F1F5F9' }}
          onFocus={event => { event.currentTarget.style.backgroundColor = '#FEF2F2'; }}
          onBlur={event => { event.currentTarget.style.backgroundColor = 'transparent'; }}>
          <Trash size={16} style={{ color: '#EF4444' }} /> Delete Attendee
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>;
}
