import { useRef, useEffect, useCallback } from 'react';
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const ALLOWED_TAGS = ['b', 'strong', 'i', 'em', 'u', 'ul', 'ol', 'li', 'br', 'p', 'div'];

function stripToAllowedHTML(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  function clean(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const children = Array.from(el.childNodes).map(clean).join('');
    if (ALLOWED_TAGS.includes(tag)) return `<${tag}>${children}</${tag}>`;
    return children;
  }
  return Array.from(doc.body.childNodes).map(clean).join('');
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Sync external value changes (e.g. initial load)
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const execCmd = useCallback((command: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    handleInput();
  }, [handleInput]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    if (html) {
      const cleaned = stripToAllowedHTML(html);
      document.execCommand('insertHTML', false, cleaned);
    } else {
      document.execCommand('insertText', false, text);
    }
    handleInput();
  }, [handleInput]);

  const toolbarBtnStyle: React.CSSProperties = {
    background: 'none',
    border: '1px solid #E5E7EB',
    borderRadius: '6px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#374151',
    padding: 0,
    transition: 'all 0.15s',
  };

  const buttons = [
    { cmd: 'bold', icon: <Bold size={15} strokeWidth={2.5} />, title: 'Bold' },
    { cmd: 'italic', icon: <Italic size={15} strokeWidth={2.5} />, title: 'Italic' },
    { cmd: 'underline', icon: <Underline size={15} strokeWidth={2.5} />, title: 'Underline' },
    { cmd: 'insertUnorderedList', icon: <List size={15} strokeWidth={2.5} />, title: 'Bullet List' },
    { cmd: 'insertOrderedList', icon: <ListOrdered size={15} strokeWidth={2.5} />, title: 'Numbered List' },
  ];

  const isEmpty = !value || value === '<br>' || value === '<div><br></div>';

  return (
    <div style={{ border: '2px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden', transition: 'border-color 0.2s' }}
      onFocus={(e) => {
        const container = e.currentTarget;
        container.style.borderColor = '#0684F5';
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          e.currentTarget.style.borderColor = '#E5E7EB';
        }
      }}
    >
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '8px 12px',
        borderBottom: '1px solid #E5E7EB',
        backgroundColor: '#F9FAFB',
      }}>
        {buttons.map((btn) => (
          <button
            key={btn.cmd}
            type="button"
            title={btn.title}
            style={toolbarBtnStyle}
            onMouseDown={(e) => {
              e.preventDefault(); // prevent focus loss
              execCmd(btn.cmd);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E5E7EB';
              e.currentTarget.style.color = '#0684F5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#374151';
            }}
          >
            {btn.icon}
          </button>
        ))}
      </div>

      {/* Editor area */}
      <div style={{ position: 'relative' }}>
        {isEmpty && placeholder && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '16px',
            color: '#4B5563',
            fontSize: '15px',
            pointerEvents: 'none',
            userSelect: 'none',
          }}>
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onPaste={handlePaste}
          style={{
            minHeight: '140px',
            padding: '12px 16px',
            fontSize: '15px',
            color: '#111827',
            fontWeight: 500,
            lineHeight: 1.5,
            outline: 'none',
            overflowY: 'auto',
            maxHeight: '300px',
          }}
        />
      </div>
    </div>
  );
}
