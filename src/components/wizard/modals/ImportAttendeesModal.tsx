import { X, Upload, Download, CheckCircle, FileText, AlertCircle } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    processFile(file);
    
    // Reset input to allow re-selection of the same file if needed
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

        const headerRow = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        
        // Column Mapping (Relaxed Strictness)
        const mapColumn = (col: string) => {
          if (col.includes('name') && !col.includes('user')) return 'name';
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
          throw new Error('CSV must contain "Name" and "Email" columns');
        }

        const data: any[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map(cell => cell.trim().replace(/^"|"$/g, '')); // Simple split, not full CSV parser
          if (row.length < headers.length) continue; // Skip malformed rows

          const attendee: any = {
            name: row[nameIdx],
            email: row[emailIdx],
            status: 'approved', // Default
            ticket_type: 'General Admission' // Default
          };

          // Optional fields
          const ticketIdx = headers.indexOf('ticket_type');
          if (ticketIdx > -1 && row[ticketIdx]) attendee.ticket_type = row[ticketIdx];

          const statusIdx = headers.indexOf('status');
          if (statusIdx > -1 && row[statusIdx]) attendee.status = row[statusIdx].toLowerCase();

          const companyIdx = headers.indexOf('company');
          if (companyIdx > -1 && row[companyIdx]) attendee.company = row[companyIdx];

          data.push(attendee);
        }

        if (data.length === 0) throw new Error('No valid attendees found in file');

        await onImport(data);
        onClose();
        
      } catch (err: any) {
        console.error('Import Parsing Error:', err);
        setError(err.message || 'Failed to parse CSV file');
        toast.error('Import failed: ' + (err.message || 'Unknown error'));
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setError('Failed to read file');
      setIsProcessing(false);
    };

    reader.readAsText(file);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(11, 38, 65, 0.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        style={{ 
          backgroundColor: '#FFFFFF',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              Import Attendees
            </h2>
            <p className="text-sm text-slate-500">
              Upload a CSV file to bulk add attendees.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">          
          {/* Upload Box */}
          <div 
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${error ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".csv" 
              onChange={handleFileChange}
            />
            
            {isProcessing ? (
              <div className="flex flex-col items-center animate-pulse">
                <Upload size={40} className="text-blue-500 mb-4" />
                <p className="text-slate-900 font-medium">Processing file...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center">
                <AlertCircle size={40} className="text-red-500 mb-4" />
                <p className="text-red-700 font-medium mb-1">Import Failed</p>
                <p className="text-sm text-red-500">{error}</p>
                <button className="mt-4 text-sm text-red-700 underline">Try Again</button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 text-blue-500">
                  <Upload size={32} />
                </div>
                <p className="text-slate-900 font-medium mb-1">
                  Click to upload CSV
                </p>
                <p className="text-sm text-slate-500 max-w-xs">
                  Supported format: .csv
                </p>
              </div>
            )}
          </div>

          {/* Template Download */}
          <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-between border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded border border-slate-200 text-green-600">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">CSV Template</p>
                <p className="text-xs text-slate-500">Use this format to avoid errors</p>
              </div>
            </div>
            <button 
              onClick={handleDownloadTemplate}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-blue-50 transition-colors"
            >
              <Download size={14} />
              Download
            </button>
          </div>

          {/* Format Rules */}
          <div className="text-xs text-slate-500 space-y-2 pl-1">
            <p className="font-medium text-slate-700 uppercase tracking-wide">Required Columns:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Name</strong> (or Full Name)</li>
              <li><strong>Email</strong> (or Email Address)</li>
            </ul>
            <p className="font-medium text-slate-700 uppercase tracking-wide mt-3">Optional Columns:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Ticket Type</strong> (Default: General Admission)</li>
              <li><strong>Status</strong> (Default: Approved)</li>
              <li><strong>Company</strong></li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
