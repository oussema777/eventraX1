import React, { useEffect, useRef, useMemo } from 'react';
import { Settings, Trash2 } from 'lucide-react';
import DOMPurify from 'dompurify';
import { sanitizeCSS } from '../../../utils/security';

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
  const containerId = useMemo(() => `custom-html-${crypto.randomUUID?.() || Math.random().toString(36).substr(2, 12)}`, []);
  const defaultHtml = '<div style="padding: 40px; text-align: center; background: #f8fafc; border: 2px dashed #cbd5e1; borderRadius: 12px;"><h2 style="color: #1e293b; marginBottom: 12px;">Custom HTML Block</h2><p style="color: #64748b;">Click "Edit" to add your own HTML and CSS.</p></div>';

  const sanitizedHtml = useMemo(() => {
    const raw = settings?.html || defaultHtml;
    return DOMPurify.sanitize(raw, {
      ADD_ATTR: ['target', 'rel'],
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel', 'width', 'height', 'style'],
    });
  }, [settings?.html]);

  useEffect(() => {
    if (containerRef.current && settings?.css) {
      const safeCSS = sanitizeCSS(settings.css);
      // Scope all CSS selectors to this container
      const scopedCSS = safeCSS.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, (match, selector, suffix) => {
        const trimmed = selector.trim();
        if (!trimmed || trimmed.startsWith('@') || trimmed.startsWith('from') || trimmed.startsWith('to') || /^\d+%$/.test(trimmed)) {
          return match;
        }
        return `#${containerId} ${trimmed}${suffix}`;
      });
      const styleEl = document.createElement('style');
      styleEl.id = containerId;
      styleEl.textContent = scopedCSS;
      document.head.appendChild(styleEl);

      return () => {
        const el = document.getElementById(containerId);
        if (el) el.remove();
      };
    }
  }, [settings?.css, containerId]);

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
        id={containerId}
        ref={containerRef}
        className="custom-html-content"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </div>
  );
}
