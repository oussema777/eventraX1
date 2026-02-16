import { X, Upload, Download, FileText, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useState, useRef, ChangeEvent } from 'react';
import { useI18n } from '../../../i18n/I18nContext';
import { toast } from 'sonner';

interface ImportAttendeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (attendees: any[]) => Promise<void>;
}

export default function ImportAttendeesModal({ isOpen, onClose, onImport }: ImportAttendeesModalProps) {
  const { t } = useI18n();
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    processFile(file);
    e.target.value = '';
  };

  const processFile = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) throw new Error('File is empty');

        const lines = text.split(/\r?\n/).filter(line => line.trim());
        if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row');

        const parseCSVLine = (line: string) => {
          const result = [];
          let startValueIdx = 0;
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            if (line[i] === '"') inQuotes = !inQuotes;
            if (line[i] === ',' && !inQuotes) {
              result.push(line.substring(startValueIdx, i).trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
              startValueIdx = i + 1;
            }
          }
          result.push(line.substring(startValueIdx).trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
          return result;
        };

        const headerRow = parseCSVLine(lines[0]).map(h => h.toLowerCase());
        
        const mapColumn = (col: string) => {
          if (col.includes('name')) return 'name';
          if (col.includes('email') || col.includes('mail')) return 'email';
          if (col.includes('ticket') || col.includes('type')) return 'ticket_type';
          if (col.includes('status')) return 'status';
          if (col.includes('company') || col.includes('org')) return 'company';
          return col;
        };

        const headers = headerRow.map(mapColumn);
        const nameIdx = headers.indexOf('name');
        const emailIdx = headers.indexOf('email');

        if (nameIdx === -1 || emailIdx === -1) {
          throw new Error('CSV must contain "Full Name" and "Email Address" columns');
        }

        const data: any[] = [];
        for (let i = 1; i < lines.length; i++) {
          const row = parseCSVLine(lines[i]);
          if (row.length < 2) continue;

          const attendee: any = {
            name: row[nameIdx],
            email: row[emailIdx],
            status: 'approved',
            ticket_type: 'General Admission'
          };

          if (!attendee.name || !attendee.email) continue;

          const ticketIdx = headers.indexOf('ticket_type');
          if (ticketIdx > -1 && row[ticketIdx]) attendee.ticket_type = row[ticketIdx];

          const statusIdx = headers.indexOf('status');
          if (statusIdx > -1 && row[statusIdx]) attendee.status = row[statusIdx].toLowerCase();

          const companyIdx = headers.indexOf('company');
          if (companyIdx > -1 && row[companyIdx]) attendee.company = row[companyIdx];

          data.push(attendee);
        }

        if (data.length === 0) throw new Error('No valid attendees found in file');
        setParsedData(data);
        
      } catch (err: any) {
        setError(err.message || 'Failed to parse CSV file');
        toast.error('Parsing failed: ' + (err.message || 'Unknown error'));
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!parsedData) return;
    setIsProcessing(true);
    try {
      await onImport(parsedData);
      onClose();
    } catch (err) {
      setError('Failed to import attendees to database');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "Full Name,Email Address,Ticket Type,Company,Status\nJohn Doe,john@example.com,VIP,Acme Inc,approved\nJane Smith,jane@example.com,General Admission,StartUp Co,pending";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "attendee_import_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #E5E7EB',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', borderBottom: '1px solid #F3F4F6' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
              Import Attendees
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>
              Bulk upload your guest list via CSV file.
            </p>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              color: '#111827', 
              backgroundColor: '#F3F4F6',
              border: 'none', 
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer' 
            }}
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '28px', overflowY: 'auto' }}>
          
          {/* Section 1: Template */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
              Step 1: Preparation
            </h3>
            
            <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0684F5' }}>
                  <FileText size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>Download Template</p>
                  <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.5' }}>Use our standard format to ensure your data imports correctly.</p>
                </div>
              </div>
              <button 
                onClick={handleDownloadTemplate}
                style={{
                  marginTop: '16px',
                  width: '100%',
                  height: '40px',
                  backgroundColor: '#FFFFFF',
                  color: '#0684F5',
                  border: '1px solid #0684F5',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                <Download size={16} />
                Download CSV Template
              </button>
            </div>
          </div>

          {/* Section 2: Upload */}
          <div style={{ marginBottom: '8px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
              Step 2: Upload File
            </h3>

            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%',
                padding: '32px 20px',
                border: error ? '2px dashed #EF4444' : '2px dashed #E2E8F0',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: error ? '#FEF2F2' : (parsedData ? '#F0FDF4' : '#F9FAFB')
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              
              {isProcessing ? (
                <Loader2 size={32} className="animate-spin" style={{ color: '#0684F5' }} />
              ) : error ? (
                <AlertCircle size={32} style={{ color: '#EF4444' }} />
              ) : parsedData ? (
                <CheckCircle2 size={32} style={{ color: '#10B981' }} />
              ) : (
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(6, 132, 245, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Upload size={24} style={{ color: '#0684F5' }} />
                </div>
              )}

              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                  {fileName || 'Click to select CSV file'}
                </span>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>
                  {error ? error : (parsedData ? `${parsedData.length} attendees ready` : 'SVG, PNG, JPG or GIF (max. 5MB)')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 28px', borderTop: '1px solid #F3F4F6', backgroundColor: '#F9FAFB' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ 
              padding: '10px 20px', 
              borderRadius: '8px', 
              border: '2px solid #E5E7EB', 
              backgroundColor: '#FFFFFF', 
              color: '#374151', 
              fontSize: '14px', 
              fontWeight: 600, 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={isProcessing || !parsedData}
            style={{ 
              padding: '10px 24px', 
              borderRadius: '8px', 
              border: 'none', 
              backgroundColor: '#0684F5', 
              color: '#FFFFFF', 
              fontSize: '14px', 
              fontWeight: 700, 
              cursor: (!parsedData || isProcessing) ? 'not-allowed' : 'pointer', 
              opacity: (!parsedData || isProcessing) ? 0.6 : 1, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              boxShadow: '0 4px 6px -1px rgba(6, 132, 245, 0.2)'
            }}
          >
            {isProcessing && <Loader2 size={16} className="animate-spin" />}
            {isProcessing ? 'Importing...' : 'Import Attendees'}
          </button>
        </div>
      </div>
    </div>
  );
}
