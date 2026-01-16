import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { Identifier, XYCoord } from 'dnd-core';
import { GripVertical, Crown, Edit2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface DraggableContentBlockProps {
  id: string;
  index: number;
  icon: LucideIcon;
  label: string;
  description: string;
  isPro: boolean;
  isEnabled: boolean;
  hasPro: boolean;
  onToggle: (id: string, isPro: boolean) => void;
  onEdit?: (id: string) => void;
  moveBlock: (dragIndex: number, hoverIndex: number) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

export default function DraggableContentBlock({
  id,
  index,
  icon: Icon,
  label,
  description,
  isPro,
  isEnabled,
  hasPro,
  onToggle,
  onEdit,
  moveBlock
}: DraggableContentBlockProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: 'content-block',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveBlock(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'content-block',
    item: () => {
      return { id, index };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;
  
  // Combine drag and drop refs
  drag(drop(ref));

  // Only show edit button for certain blocks
  const showEditButton = 
    isEnabled && 
    (!isPro || hasPro) && 
    (id === 'hero' || id === 'hero-video' || id.startsWith('text-block-') || id === 'speakers' || id === 'schedule');

  return (
    <div
      ref={preview}
      data-handler-id={handlerId}
      className="flex items-center gap-3 p-3 rounded-lg border transition-all"
      style={{
        borderColor: isEnabled ? 'rgba(6, 132, 245, 0.3)' : 'rgba(255, 255, 255, 0.2)',
        backgroundColor: isEnabled ? 'rgba(6, 132, 245, 0.05)' : 'rgba(255, 255, 255, 0.05)',
        opacity: isEnabled ? opacity : 0.6 * opacity,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      {/* Drag Handle */}
      <div
        ref={ref}
        style={{
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <GripVertical 
          size={18} 
          style={{ 
            color: isEnabled ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.3)'
          }} 
        />
      </div>

      {/* Block Icon */}
      <Icon size={18} style={{ color: isEnabled ? 'var(--primary)' : 'rgba(255, 255, 255, 0.7)' }} />
      
      {/* Block Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span 
            className="text-sm"
            style={{ fontWeight: 600, color: isEnabled ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)' }}
          >
            {label}
          </span>
          {isPro && (
            <span 
              className="px-1.5 py-0.5 rounded text-xs flex items-center gap-1"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                color: 'white',
                fontWeight: 700
              }}
            >
              <Crown size={10} />
              PRO
            </span>
          )}
        </div>
        <span 
          className="text-xs"
          style={{ color: 'rgba(255, 255, 255, 0.6)' }}
        >
          {description}
        </span>
      </div>
      
      {/* Toggle Switch */}
      <button
        onClick={() => onToggle(id, isPro)}
        className="relative w-11 h-6 rounded-full transition-colors"
        style={{ 
          backgroundColor: isEnabled ? 'var(--primary)' : 'rgba(255, 255, 255, 0.2)'
        }}
      >
        <div
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform"
          style={{
            left: isEnabled ? 'calc(100% - 22px)' : '2px'
          }}
        />
      </button>
      
      {/* Edit Button */}
      {showEditButton && onEdit && (
        <button
          onClick={() => onEdit(id)}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-white/10"
        >
          <Edit2 size={16} style={{ color: 'var(--primary)' }} />
        </button>
      )}
    </div>
  );
}
