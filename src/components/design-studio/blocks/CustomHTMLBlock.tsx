import React, { useEffect, useRef } from 'react';
import { Settings, Trash2 } from 'lucide-react';

interface CustomHTMLBlockProps {
  settings?: {
    html?: string;
    css?: string;
  };
  onEdit?: () => void;
  isLocked?: boolean;
}

export default function CustomHTMLBlock({ settings, onEdit, isLocked }: CustomHTMLBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const defaultHtml = '<div style="padding: 40px; text-align: center; background: #f8fafc; border: 2px dashed #cbd5e1; borderRadius: 12px;"><h2 style="color: #1e293b; marginBottom: 12px;">Custom HTML Block</h2><p style="color: #64748b;">Click "Edit" to add your own HTML and CSS.</p></div>';

  useEffect(() => {
    if (containerRef.current && settings?.css) {
      // Create a style element for the custom CSS
      const styleId = `custom-style-${Math.random().toString(36).substr(2, 9)}`;
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = settings.css;
      document.head.appendChild(styleEl);

      return () => {
        const el = document.getElementById(styleId);
        if (el) el.remove();
      };
    }
  }, [settings?.css]);

  return (
    <div className="group relative w-full overflow-hidden">
      {!isLocked && (
        <div 
          className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="p-2 bg-white rounded-lg shadow-lg text-gray-600 hover:text-blue-600 transition-colors"
            title="Edit HTML/CSS"
          >
            <Settings size={20} />
          </button>
        </div>
      )}

      <div 
        ref={containerRef}
        className="custom-html-content"
        dangerouslySetInnerHTML={{ __html: settings?.html || defaultHtml }}
      />
    </div>
  );
}
