import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  MoreVertical,
  ClipboardList,
  Star,
  GraduationCap,
  MessageSquare,
  Upload,
  Utensils,
  Hand,
  FileText,
  Mail,
  User,
  Phone,
  Building,
  Briefcase,
  Calendar,
  CheckCircle,
  MapPin,
  Users,
  Target,
  TrendingUp,
  Award,
  Lock,
  ArrowRight,
  X,
  UserPlus,
  LogOut,
  Edit2,
  Eye,
  Check,
  ArrowLeft,
  Info,
  Presentation,
  Type,
  AlignLeft,
  ChevronDown,
  CheckSquare,
  Circle,
  Hash,
  Globe,
  GripVertical,
  Trash2,
  Monitor,
  Tablet,
  Smartphone,
  Lightbulb,
  Crown
} from 'lucide-react';
import FieldEditorModal from './modals/FieldEditorModal';
import { usePlan } from '../../hooks/usePlan';

interface FormCard {
  id: string;
  title: string;
  description: string;
  type: 'registration' | 'survey' | 'assessment' | 'feedback' | 'data-collection' | 'application' | 'submission' | 'custom';
  status: 'active' | 'draft' | 'locked';
  isDefault?: boolean;
  isFree: boolean;
  isPro: boolean;
  isTemplate?: boolean;
  fields: Array<{ name: string; icon: any }>;
  totalFields: number;
  lastEdited?: string;
  created?: string;
  infoNote?: string;
  icon: any;
  iconColor: string;
}

interface CustomField {
  id: string;
  type: 'text' | 'textarea' | 'dropdown' | 'checkbox' | 'radio' | 'date' | 'file' | 'number' | 'multichoice' | 'country' | 'email' | 'phone' | 'url' | 'address';
  label: string;
  placeholder?: string;
  helpText?: string;
  description?: string;
  required: boolean;
  options?: string[];
  isPro: boolean;
}

export default function CustomFormsTab() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [selectedForm, setSelectedForm] = useState<FormCard | null>(null);
  const [newFormName, setNewFormName] = useState('');
  const [newFormType, setNewFormType] = useState('survey');
  const [newFormDescription, setNewFormDescription] = useState('');

  // Form Builder States
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [formFields, setFormFields] = useState<CustomField[]>([]);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [draggedField, setDraggedField] = useState<string | null>(null);
  const [showProTip, setShowProTip] = useState(true);

  const { isPro: hasPro } = usePlan();

  const fieldTypes = [
    // FREE
    { id: 'text', icon: Type, label: 'Single Line Text', desc: 'Short text input', isPro: false },
    { id: 'textarea', icon: AlignLeft, label: 'Multi-line Text', desc: 'Long text/paragraph input', isPro: false },
    { id: 'dropdown', icon: ChevronDown, label: 'Dropdown Select', desc: 'Single choice from list', isPro: false },
    { id: 'checkbox', icon: CheckSquare, label: 'Checkbox', desc: 'Yes/no or agree to terms', isPro: false },
    { id: 'radio', icon: Circle, label: 'Radio Buttons', desc: 'Single choice from options', isPro: false },
    // PRO
    { id: 'date', icon: Calendar, label: 'Date Picker', desc: 'Select date from calendar', isPro: true },
    { id: 'file', icon: Upload, label: 'File Upload', desc: 'Let attendees upload documents', isPro: true },
    { id: 'number', icon: Hash, label: 'Number Input', desc: 'Numeric values only', isPro: true },
    { id: 'multichoice', icon: CheckSquare, label: 'Multiple Choice', desc: 'Select multiple options', isPro: true },
    { id: 'country', icon: Globe, label: 'Country Selector', desc: 'Searchable country dropdown', isPro: true }
  ];

  const handleAddField = (typeId: string) => {
    const fieldType = fieldTypes.find(f => f.id === typeId);
    if (!fieldType) return;

    if (fieldType.isPro && !hasPro) {
      setShowUpgradeModal(true);
      return;
    }

    const newField: CustomField = {
      id: Date.now().toString(),
      type: typeId as any,
      label: fieldType.label,
      placeholder: '',
      helpText: '',
      required: false,
      options: (typeId === 'dropdown' || typeId === 'radio' || typeId === 'multichoice') 
        ? ['Option 1', 'Option 2', 'Option 3'] 
        : undefined,
      isPro: fieldType.isPro
    };

    setCustomFields([...customFields, newField]);
  };

  const handleEditField = (field: CustomField) => {
    setEditingField(field);
    setIsEditorOpen(true);
  };

  const handleSaveField = (updatedField: CustomField) => {
    setCustomFields(customFields.map(f => f.id === updatedField.id ? updatedField : f));
    setIsEditorOpen(false);
  };

  const handleDeleteField = (fieldId: string) => {
    setCustomFields(customFields.filter(f => f.id !== fieldId));
  };

  const handleDragStart = (fieldId: string) => {
    setDraggedField(fieldId);
  };

  const handleDragOver = (e: React.DragEvent, targetFieldId: string) => {
    e.preventDefault();
    if (!draggedField || draggedField === targetFieldId) return;

    const draggedIndex = customFields.findIndex(f => f.id === draggedField);
    const targetIndex = customFields.findIndex(f => f.id === targetFieldId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newFields = [...customFields];
    const [removed] = newFields.splice(draggedIndex, 1);
    newFields.splice(targetIndex, 0, removed);

    setCustomFields(newFields);
  };

  const handleDragEnd = () => {
    setDraggedField(null);
  };

  // Default Forms
  const defaultForms: FormCard[] = [
    {
      id: 'default-1',
      title: 'Registration Form',
      description: 'Collect essential attendee information during event registration',
      type: 'registration',
      status: 'active',
      isDefault: true,
      isFree: true,
      isPro: false,
      fields: [
        { name: 'Email', icon: Mail },
        { name: 'Full Name', icon: User },
        { name: 'Phone Number', icon: Phone },
        { name: 'Company', icon: Building },
        { name: 'Job Title', icon: Briefcase }
      ],
      totalFields: 8,
      lastEdited: '2 hours ago',
      infoNote: 'This form is automatically shown during ticket registration',
      icon: ClipboardList,
      iconColor: '#0684F5'
    },
    {
      id: 'default-2',
      title: 'Satisfaction Survey',
      description: 'Gather feedback on attendee experience and event satisfaction',
      type: 'survey',
      status: 'draft',
      isTemplate: true,
      isFree: true,
      isPro: false,
      fields: [
        { name: 'Overall Rating', icon: Star },
        { name: 'Session Quality', icon: CheckCircle },
        { name: 'Venue Rating', icon: MapPin },
        { name: 'Food & Beverages', icon: Utensils },
        { name: 'Networking Opportunities', icon: Users }
      ],
      totalFields: 12,
      infoNote: 'Recommended: Send 2-4 hours after event ends',
      icon: Star,
      iconColor: '#F59E0B'
    },
    {
      id: 'default-3',
      title: 'Pre & Post Assessment',
      description: 'Measure knowledge and learning outcomes before and after your event',
      type: 'assessment',
      status: hasPro ? 'draft' : 'locked',
      isTemplate: true,
      isFree: false,
      isPro: true,
      fields: [
        { name: 'Pre-Event Knowledge Check', icon: ClipboardList },
        { name: 'Skill Level Self-Assessment', icon: TrendingUp },
        { name: 'Learning Objectives', icon: Target },
        { name: 'Post-Event Quiz', icon: CheckCircle },
        { name: 'Skill Improvement Rating', icon: Award }
      ],
      totalFields: 11,
      icon: GraduationCap,
      iconColor: '#8B5CF6'
    }
  ];

  // Custom Forms
  const customForms: FormCard[] = [
    {
      id: 'custom-1',
      title: 'Speaker Feedback',
      description: 'Collect attendee feedback on individual speakers and sessions',
      type: 'feedback',
      status: 'active',
      isFree: true,
      isPro: false,
      fields: [
        { name: 'Speaker Name', icon: User },
        { name: 'Session Title', icon: Calendar },
        { name: 'Content Quality Rating', icon: Star },
        { name: 'Presentation Skills', icon: Star },
        { name: 'Comments', icon: MessageSquare }
      ],
      totalFields: 7,
      created: 'Dec 5, 2024',
      infoNote: 'Linked to Sessions tab - shown after each session',
      icon: MessageSquare,
      iconColor: '#14B8A6'
    },
    {
      id: 'custom-2',
      title: 'Workshop Materials Submission',
      description: 'Allow workshop presenters to submit slides and materials',
      type: 'submission',
      status: 'active',
      isFree: true,
      isPro: false,
      fields: [
        { name: 'Workshop Title', icon: Presentation },
        { name: 'Presenter Name', icon: User },
        { name: 'Presentation Slides', icon: Upload },
        { name: 'Supporting Documents', icon: FileText }
      ],
      totalFields: 5,
      created: 'Nov 28, 2024',
      infoNote: 'File upload fields require Pro subscription',
      icon: Upload,
      iconColor: '#3B82F6'
    },
    {
      id: 'custom-3',
      title: 'Dietary Preferences',
      description: 'Collect dietary requirements and allergies for event catering',
      type: 'data-collection',
      status: 'draft',
      isFree: true,
      isPro: false,
      fields: [
        { name: 'Dietary Type', icon: Utensils },
        { name: 'Allergies', icon: AlertTriangle },
        { name: 'Special Requests', icon: MessageSquare },
        { name: 'Meal Preference', icon: CheckCircle }
      ],
      totalFields: 4,
      created: 'Dec 8, 2024',
      infoNote: 'Not yet published - save and activate to use',
      icon: Utensils,
      iconColor: '#10B981'
    },
    {
      id: 'custom-4',
      title: 'Volunteer Application',
      description: 'Accept applications from attendees interested in volunteering',
      type: 'application',
      status: 'active',
      isFree: true,
      isPro: false,
      fields: [
        { name: 'Full Name', icon: User },
        { name: 'Email & Phone', icon: Mail },
        { name: 'Availability', icon: Calendar },
        { name: 'Skills & Experience', icon: Award },
        { name: 'Role Preferences', icon: CheckCircle }
      ],
      totalFields: 8,
      created: 'Nov 20, 2024',
      icon: Hand,
      iconColor: '#EC4899'
    }
  ];

  const templates = [
    {
      id: 'template-1',
      title: 'Satisfaction Survey',
      description: 'Post-event feedback and satisfaction ratings',
      icon: Star,
      iconColor: '#F59E0B',
      fieldsCount: 7,
      tags: ['Rating', 'Multiple choice', 'Text'],
      isFree: true
    },
    {
      id: 'template-2',
      title: 'Speaker Feedback',
      description: 'Collect ratings and comments on speakers and sessions',
      icon: MessageSquare,
      iconColor: '#14B8A6',
      fieldsCount: 6,
      tags: ['Rating', 'Text area', 'Dropdown'],
      isFree: true
    },
    {
      id: 'template-3',
      title: 'Dietary Preferences',
      description: 'Gather food restrictions and meal preferences',
      icon: Utensils,
      iconColor: '#10B981',
      fieldsCount: 5,
      tags: ['Dropdown', 'Checkboxes', 'Text'],
      isFree: true
    },
    {
      id: 'template-4',
      title: 'Pre/Post Assessment',
      description: 'Measure learning outcomes before and after event',
      icon: GraduationCap,
      iconColor: '#8B5CF6',
      fieldsCount: 10,
      tags: ['Quiz', 'Rating', 'Multiple choice'],
      isFree: false
    },
    {
      id: 'template-5',
      title: 'Networking Matcher',
      description: 'Match attendees based on interests and goals',
      icon: Users,
      iconColor: '#EC4899',
      fieldsCount: 9,
      tags: ['Multi-select', 'Tags', 'Text'],
      isFree: false
    },
    {
      id: 'template-6',
      title: 'Abstract/Proposal Submission',
      description: 'Collect session proposals with file uploads',
      icon: FileText,
      iconColor: '#3B82F6',
      fieldsCount: 12,
      tags: ['File upload', 'Text area', 'Dropdown'],
      isFree: false
    },
    {
      id: 'template-7',
      title: 'Exit Survey',
      description: 'Quick feedback as attendees leave the event',
      icon: LogOut,
      iconColor: '#F59E0B',
      fieldsCount: 4,
      tags: ['Rating', 'Yes/No', 'Text'],
      isFree: true
    },
    {
      id: 'template-8',
      title: 'Extended Registration',
      description: 'Additional questions beyond default registration',
      icon: UserPlus,
      iconColor: '#0684F5',
      fieldsCount: 8,
      tags: ['Text', 'Dropdown', 'Checkbox'],
      isFree: true
    },
    {
      id: 'template-9',
      title: 'Sponsor Lead Capture',
      description: 'Help sponsors collect qualified leads at booths',
      icon: Briefcase,
      iconColor: '#F59E0B',
      fieldsCount: 6,
      tags: ['Contact info', 'Rating', 'Notes'],
      isFree: false
    }
  ];

  const handleOpenFormBuilder = (form?: FormCard) => {
    setSelectedForm(form || null);
    setShowFormBuilder(true);
  };

  const handleCreateBlankForm = () => {
    if (newFormName.trim()) {
      // In real implementation, this would create a new form
      setShowTemplatesModal(false);
      setShowFormBuilder(true);
    }
  };

  const handleUseTemplate = (template: any) => {
    if (!template.isFree && !hasPro) {
      setShowUpgradeModal(true);
      return;
    }
    setShowTemplatesModal(false);
    setShowFormBuilder(true);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'registration': '#0684F5',
      'survey': '#F59E0B',
      'assessment': '#8B5CF6',
      'feedback': '#14B8A6',
      'data-collection': '#10B981',
      'application': '#EC4899',
      'submission': '#3B82F6'
    };
    return colors[type] || '#6B7280';
  };

  const FormCardComponent = ({ form }: { form: FormCard }) => {
    const IconComponent = form.icon;
    const isPROLocked = form.isPro && !hasPro && form.status === 'locked';

    return (
      <div
        onClick={() => !isPROLocked && handleOpenFormBuilder(form)}
        className="relative rounded-xl transition-all hover:shadow-lg cursor-pointer"
        style={{
          padding: '28px',
          backgroundColor: 'rgba(255,255,255,0.05)',
          border: form.isDefault ? '2px solid #0684F5' : '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          opacity: isPROLocked ? 0.7 : 1
        }}
      >
        {/* PRO Lock Overlay */}
        {isPROLocked && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-xl z-10"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
            onClick={(e) => {
              e.stopPropagation();
              setShowUpgradeModal(true);
            }}
          >
            <Lock size={56} style={{ color: '#F59E0B', marginBottom: '16px' }} />
            <button
              className="h-11 px-6 rounded-lg flex items-center gap-2 transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#FFFFFF',
                fontWeight: 600
              }}
            >
              <Lock size={16} />
              Upgrade to Pro
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${form.iconColor}15` }}
            >
              <IconComponent size={20} style={{ color: form.iconColor }} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl mb-2" style={{ fontWeight: 600, color: '#FFFFFF' }}>
                {form.title}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {form.isDefault && (
                  <span
                    className="px-2 py-1 rounded text-xs"
                    style={{
                      backgroundColor: '#0684F5',
                      color: '#FFFFFF',
                      fontWeight: 700
                    }}
                  >
                    DEFAULT
                  </span>
                )}
                {form.isTemplate && !form.isDefault && (
                  <span
                    className="px-2 py-1 rounded text-xs"
                    style={{
                      backgroundColor: '#6B7280',
                      color: '#FFFFFF',
                      fontWeight: 700
                    }}
                  >
                    TEMPLATE
                  </span>
                )}
                {form.isFree && (
                  <span
                    className="px-2 py-1 rounded text-xs"
                    style={{
                      backgroundColor: '#10B981',
                      color: '#FFFFFF',
                      fontWeight: 700
                    }}
                  >
                    FREE
                  </span>
                )}
                {form.isPro && (
                  <span
                    className="px-2 py-1 rounded text-xs flex items-center gap-1"
                    style={{
                      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                      color: '#FFFFFF',
                      fontWeight: 700
                    }}
                  >
                    <Lock size={10} />
                    PRO
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {form.status !== 'locked' && (
              <span
                className="px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5"
                style={{
                  backgroundColor: form.status === 'active' ? '#D1FAE5' : '#F3F4F6',
                  color: form.status === 'active' ? '#059669' : '#6B7280',
                  fontWeight: 500
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: form.status === 'active' ? '#10B981' : '#9CA3AF'
                  }}
                />
                {form.status === 'active' ? 'Active' : 'Draft'}
              </span>
            )}
            <button
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <MoreVertical size={16} style={{ color: '#94A3B8' }} />
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm mb-3" style={{ color: '#94A3B8', lineHeight: 1.5 }}>
          {form.description}
        </p>

        {/* Form Type Chip */}
        <div className="mb-4">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs"
            style={{
              backgroundColor: `${getTypeColor(form.type)}15`,
              color: getTypeColor(form.type),
              fontWeight: 500
            }}
          >
            {form.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Form
          </span>
        </div>

        {/* Fields Preview */}
        <div
          className="p-4 rounded-lg mb-4"
          style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
        >
          <p className="text-xs mb-2" style={{ color: '#94A3B8', fontWeight: 500 }}>
            Form Fields:
          </p>
          <div className="flex flex-wrap gap-2">
            {form.fields.slice(0, 5).map((field, index) => {
              const FieldIcon = field.icon;
              return (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }}
                >
                  <FieldIcon size={12} style={{ color: '#94A3B8' }} />
                  {field.name}
                </span>
              );
            })}
            {form.totalFields > form.fields.length && (
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#94A3B8' }}
              >
                + {form.totalFields - form.fields.length} more
              </span>
            )}
          </div>
        </div>

        {/* Info Note */}
        {form.infoNote && (
          <div
            className="flex items-start gap-2 p-3 rounded-lg mb-4"
            style={{
              backgroundColor: `${getTypeColor(form.type)}10`,
              borderLeft: `4px solid ${getTypeColor(form.type)}`
            }}
          >
            <Info size={14} style={{ color: getTypeColor(form.type), marginTop: '2px', flexShrink: 0 }} />
            <p className="text-xs" style={{ color: '#FFFFFF' }}>
              {form.infoNote}
            </p>
          </div>
        )}

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="flex items-center gap-4 text-xs" style={{ color: '#94A3B8' }}>
            {form.lastEdited && (
              <div className="flex items-center gap-1.5">
                <Calendar size={12} />
                Last edited: {form.lastEdited}
              </div>
            )}
            {form.created && !form.lastEdited && (
              <div className="flex items-center gap-1.5">
                <Calendar size={12} />
                Created: {form.created}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <User size={12} />
              {form.totalFields} fields
            </div>
          </div>
          {!isPROLocked && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenFormBuilder(form);
              }}
              className="h-10 px-4 rounded-lg flex items-center gap-2 transition-all hover:scale-105"
              style={{
                backgroundColor: form.status === 'active' ? '#0684F5' : 'transparent',
                color: form.status === 'active' ? '#FFFFFF' : '#0684F5',
                border: form.status === 'active' ? 'none' : '1px solid #0684F5',
                fontWeight: 600
              }}
            >
              <Edit2 size={14} />
              Edit Form
            </button>
          )}
        </div>
      </div>
    );
  };

  if (showFormBuilder) {
    return (
      <div style={{ backgroundColor: '#0B2641', minHeight: '100vh', paddingBottom: '80px' }}>
        {/* Top Navigation Bar */}
        <div
          className="flex items-center justify-between px-10 py-4 mb-6"
          style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFormBuilder(false)}
              className="flex items-center gap-2 px-4 h-10 rounded-lg transition-colors"
              style={{ color: '#0684F5', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <ArrowLeft size={18} />
              <span className="text-sm" style={{ fontWeight: 600 }}>Back to Forms</span>
            </button>
            <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <div className="flex items-center gap-3">
              <input
                type="text"
                defaultValue={selectedForm?.title || 'New Form'}
                className="text-lg outline-none border-b-2 border-transparent hover:border-blue-200 focus:border-blue-400 transition-colors"
                style={{ fontWeight: 600, color: '#FFFFFF', padding: '4px 8px', backgroundColor: 'transparent' }}
              />
              <span
                className="px-2.5 py-1 rounded-full text-xs"
                style={{
                  backgroundColor: selectedForm ? `${getTypeColor(selectedForm.type)}15` : '#EFF6FF',
                  color: selectedForm ? getTypeColor(selectedForm.type) : '#0684F5',
                  fontWeight: 500
                }}
              >
                {selectedForm?.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Survey'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm" style={{ color: '#94A3B8', fontWeight: 500 }}>
                {selectedForm?.status === 'active' ? 'Active' : 'Draft'}
              </span>
              <button
                className="relative w-11 h-6 rounded-full transition-colors"
                style={{
                  backgroundColor: selectedForm?.status === 'active' ? '#0684F5' : '#E5E7EB'
                }}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                  style={{
                    left: selectedForm?.status === 'active' ? 'calc(100% - 22px)' : '2px'
                  }}
                />
              </button>
            </label>
            <button
              className="h-10 px-4 rounded-lg flex items-center gap-2 transition-colors"
              style={{ color: '#94A3B8', fontWeight: 600, backgroundColor: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Eye size={16} />
              Preview
            </button>
            <button
              className="h-10 px-4 rounded-lg flex items-center gap-2 transition-all hover:scale-105"
              style={{
                backgroundColor: '#0684F5',
                color: '#FFFFFF',
                fontWeight: 600
              }}
            >
              <Check size={16} />
              Save
            </button>
          </div>
        </div>

        {/* Form Builder Split View */}
        <div className="max-w-[1400px] mx-auto px-10">
          <div className="flex gap-6" style={{ minHeight: 'calc(100vh - 300px)' }}>
            {/* Left Panel - Field Library */}
            <div className="w-80 flex-shrink-0">
              <div className="rounded-xl p-6 sticky top-6" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 className="text-lg mb-4" style={{ fontWeight: 600, color: '#FFFFFF' }}>
                  Field Library
                </h3>
                <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>
                  Drag fields to add them to your form
                </p>

                {/* Field Categories */}
                <div className="space-y-6">
                  {/* Basic Fields */}
                  <div>
                    <h4 className="text-xs mb-3" style={{ fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Basic Fields
                    </h4>
                    <div className="space-y-2">
                      {[
                        { icon: Type, label: 'Short Text', type: 'text' },
                        { icon: AlignLeft, label: 'Long Text', type: 'textarea' },
                        { icon: Mail, label: 'Email', type: 'email' },
                        { icon: Phone, label: 'Phone', type: 'phone' },
                        { icon: Hash, label: 'Number', type: 'number' },
                        { icon: Calendar, label: 'Date', type: 'date' }
                      ].map((field, idx) => {
                        const FieldIcon = field.icon;
                        return (
                          <div
                            key={idx}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('fieldType', field.type);
                              e.dataTransfer.effectAllowed = 'copy';
                            }}
                            className="flex items-center gap-3 p-3 rounded-lg border cursor-move transition-all hover:border-blue-400"
                            style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(6,132,245,0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                          >
                            <GripVertical size={16} style={{ color: '#9CA3AF' }} />
                            <FieldIcon size={18} style={{ color: '#0684F5' }} />
                            <span className="text-sm" style={{ fontWeight: 500, color: '#FFFFFF' }}>
                              {field.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Choice Fields */}
                  <div>
                    <h4 className="text-xs mb-3" style={{ fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Choice Fields
                    </h4>
                    <div className="space-y-2">
                      {[
                        { icon: ChevronDown, label: 'Dropdown', type: 'dropdown' },
                        { icon: Circle, label: 'Multiple Choice', type: 'radio' },
                        { icon: CheckSquare, label: 'Checkboxes', type: 'checkbox' }
                      ].map((field, idx) => {
                        const FieldIcon = field.icon;
                        return (
                          <div
                            key={idx}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('fieldType', field.type);
                              e.dataTransfer.effectAllowed = 'copy';
                            }}
                            className="flex items-center gap-3 p-3 rounded-lg border cursor-move transition-all hover:border-blue-400"
                            style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(6,132,245,0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                          >
                            <GripVertical size={16} style={{ color: '#9CA3AF' }} />
                            <FieldIcon size={18} style={{ color: '#0684F5' }} />
                            <span className="text-sm" style={{ fontWeight: 500, color: '#FFFFFF' }}>
                              {field.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Advanced Fields */}
                  <div>
                    <h4 className="text-xs mb-3" style={{ fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Advanced
                    </h4>
                    <div className="space-y-2">
                      {[
                        { icon: Upload, label: 'File Upload', type: 'file' },
                        { icon: Globe, label: 'Website URL', type: 'url' },
                        { icon: MapPin, label: 'Address', type: 'address' }
                      ].map((field, idx) => {
                        const FieldIcon = field.icon;
                        const isPROLocked = !hasPro;
                        return (
                          <div
                            key={idx}
                            draggable={!isPROLocked}
                            onDragStart={(e) => {
                              if (!isPROLocked) {
                                e.dataTransfer.setData('fieldType', field.type);
                                e.dataTransfer.effectAllowed = 'copy';
                              }
                            }}
                            onClick={() => {
                              if (isPROLocked) {
                                setShowUpgradeModal(true);
                              }
                            }}
                            className="relative flex items-center gap-3 p-3 rounded-lg border transition-all"
                            style={{ 
                              borderColor: 'rgba(255,255,255,0.1)',
                              backgroundColor: 'rgba(255,255,255,0.03)',
                              cursor: isPROLocked ? 'pointer' : 'move',
                              opacity: isPROLocked ? 0.6 : 1
                            }}
                          >
                            <GripVertical size={16} style={{ color: '#9CA3AF' }} />
                            <FieldIcon size={18} style={{ color: '#0684F5' }} />
                            <div className="flex-1 flex items-center justify-between">
                              <span className="text-sm" style={{ fontWeight: 500, color: '#FFFFFF' }}>
                                {field.label}
                              </span>
                              <span
                                className="px-2 py-0.5 rounded text-xs ml-2"
                                style={{
                                  backgroundColor: '#FEF3C7',
                                  color: '#F59E0B',
                                  fontWeight: 700
                                }}
                              >
                                PRO
                              </span>
                            </div>
                            {isPROLocked && (
                              <Lock size={14} style={{ color: '#F59E0B' }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(6,132,245,0.1)' }}>
                  <div className="flex gap-2 mb-2">
                    <Lightbulb size={18} style={{ color: '#0684F5' }} />
                    <h4 className="text-sm" style={{ fontWeight: 600, color: '#FFFFFF' }}>
                      Quick Tips
                    </h4>
                  </div>
                  <ul className="text-xs space-y-1.5" style={{ color: '#94A3B8' }}>
                    <li>• Drag fields to the preview</li>
                    <li>• Click to edit field settings</li>
                    <li>• Reorder by dragging</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Panel - Form Preview */}
            <div className="flex-1">
              <div className="rounded-xl p-8" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {/* Preview Header */}
                <div className="flex items-center justify-between mb-8 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <div>
                    <h3 className="text-xl mb-1" style={{ fontWeight: 600, color: '#FFFFFF' }}>
                      Form Preview
                    </h3>
                    <p className="text-sm" style={{ color: '#94A3B8' }}>
                      This is how your form will appear to respondents
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                      style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }}
                      title="Desktop view"
                    >
                      <Monitor size={18} />
                    </button>
                    <button
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                      style={{ backgroundColor: 'transparent', color: '#94A3B8' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      title="Tablet view"
                    >
                      <Tablet size={18} />
                    </button>
                    <button
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                      style={{ backgroundColor: 'transparent', color: '#94A3B8' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      title="Mobile view"
                    >
                      <Smartphone size={18} />
                    </button>
                  </div>
                </div>

                {/* Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fieldType = e.dataTransfer.getData('fieldType');
                    if (fieldType) {
                      // Determine if field is PRO
                      const isPROField = ['file', 'url', 'address'].includes(fieldType);
                      
                      // Add field to form
                      const newField: CustomField = {
                        id: Date.now().toString(),
                        type: fieldType as any,
                        label: `New ${fieldType} field`,
                        required: false,
                        placeholder: '',
                        isPro: isPROField,
                        options: fieldType === 'dropdown' || fieldType === 'radio' || fieldType === 'checkbox' 
                          ? ['Option 1', 'Option 2', 'Option 3'] 
                          : undefined
                      };
                      setFormFields([...formFields, newField]);
                    }
                  }}
                  className="min-h-[500px]"
                >
                  {/* Form Title & Description */}
                  {(selectedForm?.title || newFormName) && (
                    <div className="mb-8 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <h3 className="text-2xl mb-2" style={{ fontWeight: 600, color: '#FFFFFF' }}>
                        {selectedForm?.title || newFormName || 'Untitled Form'}
                      </h3>
                      {(selectedForm?.description || newFormDescription) && (
                        <p className="text-base" style={{ color: '#94A3B8' }}>
                          {selectedForm?.description || newFormDescription}
                        </p>
                      )}
                    </div>
                  )}

                  {formFields.length === 0 ? (
                    // Empty State
                    <div className="flex flex-col items-center justify-center py-20">
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                        style={{ backgroundColor: 'rgba(6,132,245,0.1)' }}
                      >
                        <ClipboardList size={40} style={{ color: '#0684F5' }} />
                      </div>
                      <h4 className="text-lg mb-2" style={{ fontWeight: 600, color: '#FFFFFF' }}>
                        Start Building Your Form
                      </h4>
                      <p className="text-sm text-center max-w-md" style={{ color: '#94A3B8' }}>
                        Drag fields from the left panel and drop them here to start building your form
                      </p>
                      <div className="mt-6 p-4 rounded-lg" style={{ border: '2px dashed rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                        <p className="text-xs" style={{ color: '#94A3B8' }}>
                          Drop zone - Drag fields here
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Form Fields
                    <div className="space-y-6">
                      {/* Helpful Tip Banner */}
                      {formFields.length > 0 && formFields.length <= 2 && (
                        <div 
                          className="flex items-start gap-3 p-4 rounded-lg mb-4"
                          style={{ backgroundColor: 'rgba(6,132,245,0.1)', border: '1px solid rgba(6,132,245,0.3)' }}
                        >
                          <Info size={20} style={{ color: '#0684F5', flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <p className="text-sm" style={{ color: '#FFFFFF', fontWeight: 500 }}>
                              Hover over any field and click the <Edit2 size={14} style={{ display: 'inline', color: '#0684F5', verticalAlign: 'middle' }} /> edit icon to customize labels, add help text, and configure options
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {formFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="group relative p-5 rounded-lg border transition-all hover:border-blue-400 hover:shadow-sm"
                          style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' }}
                        >
                          {/* Field Controls */}
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingField(field);
                                setShowFieldEditor(true);
                              }}
                              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                              style={{ backgroundColor: 'rgba(6,132,245,0.1)', color: '#0684F5' }}
                              title="Edit field properties"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setFormFields(formFields.filter(f => f.id !== field.id));
                              }}
                              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                              style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#EF4444' }}
                              title="Delete field"
                            >
                              <Trash2 size={18} />
                            </button>
                            <div className="cursor-move w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} title="Drag to reorder">
                              <GripVertical size={18} style={{ color: '#94A3B8' }} />
                            </div>
                          </div>

                          {/* Field Label */}
                          <label className="flex items-center gap-2 text-sm mb-2" style={{ fontWeight: 500, color: '#FFFFFF' }}>
                            <span>
                              {field.label}
                              {field.required && <span style={{ color: '#EF4444' }}> *</span>}
                            </span>
                            {field.isPro && (
                              <span
                                className="px-2 py-0.5 rounded text-xs"
                                style={{
                                  backgroundColor: '#FEF3C7',
                                  color: '#F59E0B',
                                  fontWeight: 700
                                }}
                              >
                                PRO
                              </span>
                            )}
                          </label>
                          
                          {/* Help Text */}
                          {field.helpText && (
                            <p className="text-xs mb-3" style={{ color: '#94A3B8' }}>
                              {field.helpText}
                            </p>
                          )}

                          {/* Field Input (varies by type) */}
                          {field.type === 'text' && (
                            <input
                              type="text"
                              placeholder={field.placeholder || 'Enter text...'}
                              disabled
                              className="w-full h-11 px-4 rounded-lg border"
                              style={{ borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: '#94A3B8' }}
                            />
                          )}

                          {field.type === 'textarea' && (
                            <textarea
                              placeholder={field.placeholder || 'Enter your response...'}
                              disabled
                              rows={4}
                              className="w-full p-4 rounded-lg border resize-none"
                              style={{ borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: '#94A3B8' }}
                            />
                          )}

                          {field.type === 'email' && (
                            <input
                              type="email"
                              placeholder={field.placeholder || 'email@example.com'}
                              disabled
                              className="w-full h-11 px-4 rounded-lg border"
                              style={{ borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: '#94A3B8' }}
                            />
                          )}

                          {field.type === 'phone' && (
                            <input
                              type="tel"
                              placeholder={field.placeholder || '(555) 123-4567'}
                              disabled
                              className="w-full h-11 px-4 rounded-lg border"
                              style={{ borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: '#94A3B8' }}
                            />
                          )}

                          {field.type === 'number' && (
                            <input
                              type="number"
                              placeholder={field.placeholder || '0'}
                              disabled
                              className="w-full h-11 px-4 rounded-lg border"
                              style={{ borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: '#94A3B8' }}
                            />
                          )}

                          {field.type === 'date' && (
                            <input
                              type="date"
                              disabled
                              className="w-full h-11 px-4 rounded-lg border"
                              style={{ borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: '#94A3B8' }}
                            />
                          )}

                          {field.type === 'dropdown' && (
                            <select
                              disabled
                              className="w-full h-11 px-4 rounded-lg border"
                              style={{ borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: '#94A3B8' }}
                            >
                              <option>Select an option...</option>
                              {field.options?.map((opt, i) => (
                                <option key={i}>{opt}</option>
                              ))}
                            </select>
                          )}

                          {field.type === 'radio' && (
                            <div className="space-y-2">
                              {field.options?.map((opt, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <input type="radio" disabled className="w-4 h-4" style={{ accentColor: '#0684F5' }} />
                                  <span className="text-sm" style={{ color: '#FFFFFF' }}>{opt}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {field.type === 'checkbox' && (
                            <div className="space-y-2">
                              {field.options?.map((opt, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <input type="checkbox" disabled className="w-4 h-4" style={{ accentColor: '#0684F5' }} />
                                  <span className="text-sm" style={{ color: '#FFFFFF' }}>{opt}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {field.type === 'file' && (
                            <div
                              className="border-2 border-dashed rounded-lg p-6 text-center"
                              style={{ borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.03)' }}
                            >
                              <Upload size={32} style={{ color: '#94A3B8', margin: '0 auto 8px' }} />
                              <p className="text-sm" style={{ color: '#94A3B8' }}>
                                Click to upload or drag and drop
                              </p>
                            </div>
                          )}

                          {field.type === 'url' && (
                            <input
                              type="url"
                              placeholder={field.placeholder || 'https://example.com'}
                              disabled
                              className="w-full h-11 px-4 rounded-lg border"
                              style={{ borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: '#94A3B8' }}
                            />
                          )}

                          {field.type === 'address' && (
                            <div className="space-y-3">
                              <input
                                type="text"
                                placeholder="Street Address"
                                disabled
                                className="w-full h-11 px-4 rounded-lg border"
                                style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#9CA3AF' }}
                              />
                              <div className="grid grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  placeholder="City"
                                  disabled
                                  className="h-11 px-4 rounded-lg border"
                                  style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#9CA3AF' }}
                                />
                                <input
                                  type="text"
                                  placeholder="State/Province"
                                  disabled
                                  className="h-11 px-4 rounded-lg border"
                                  style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#9CA3AF' }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Field Description */}
                          {field.description && (
                            <p className="text-xs mt-2" style={{ color: '#94A3B8' }}>
                              {field.description}
                            </p>
                          )}
                        </div>
                      ))}

                      {/* Add More Hint */}
                      <div
                        className="p-4 rounded-lg border-2 border-dashed text-center"
                        style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                      >
                        <p className="text-sm" style={{ color: '#94A3B8' }}>
                          Drag more fields here to continue building
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0B2641', paddingBottom: '80px', minHeight: 'calc(100vh - 300px)' }}>
      <div className="max-w-[1200px] mx-auto px-10 py-10">
        {/* Page Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-3xl mb-2" style={{ fontWeight: 600, color: '#FFFFFF' }}>
              Event Forms
            </h2>
            <p className="text-base" style={{ color: '#94A3B8' }}>
              Create and manage forms for your event
            </p>
          </div>
          <button
            onClick={() => setShowTemplatesModal(true)}
            className="h-11 px-6 rounded-lg flex items-center gap-2 transition-all hover:scale-105"
            style={{
              backgroundColor: '#0684F5',
              color: '#FFFFFF',
              fontWeight: 600
            }}
          >
            <Plus size={20} />
            Create Custom Form
          </button>
        </div>

        {/* Filter & Search Bar */}
        {/* Search Bar - Simplified */}
        <div className="flex items-center justify-end mb-8">
          <div className="relative">
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF'
              }}
            />
            <input
              type="text"
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 pl-11 pr-4 rounded-lg border outline-none transition-colors focus:border-blue-400"
              style={{
                width: '320px',
                borderColor: 'rgba(255,255,255,0.2)',
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: '#FFFFFF'
              }}
            />
          </div>
        </div>

        {/* Default Forms Section */}
        <div className="mb-12">
          <div className="mb-4">
            <p className="text-xs mb-1" style={{ color: '#94A3B8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              DEFAULT FORMS
            </p>
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              Pre-configured forms ready to customize
            </p>
          </div>
          <div className="space-y-5">
            {defaultForms.map((form) => (
              <FormCardComponent key={form.id} form={form} />
            ))}
          </div>
        </div>

        {/* Custom Forms Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <p className="text-xs" style={{ color: '#94A3B8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                CUSTOM FORMS
              </p>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#94A3B8',
                  fontWeight: 500
                }}
              >
                {customForms.length} custom forms
              </span>
            </div>
            {customForms.length > 6 && (
              <button className="text-xs transition-colors hover:underline" style={{ color: '#0684F5', fontWeight: 500 }}>
                View All
              </button>
            )}
          </div>
          <div className="space-y-5">
            {customForms.map((form) => (
              <FormCardComponent key={form.id} form={form} />
            ))}
          </div>
        </div>

        {/* Empty State (shown when no custom forms) */}
        {customForms.length === 0 && (
          <div
            className="rounded-xl p-16 text-center"
            style={{
              border: '2px dashed rgba(255,255,255,0.2)',
              backgroundColor: 'rgba(255,255,255,0.03)'
            }}
          >
            <FileText size={80} style={{ color: '#94A3B8', margin: '0 auto 20px' }} />
            <h3 className="text-2xl mb-3" style={{ fontWeight: 600, color: '#FFFFFF' }}>
              No Custom Forms Yet
            </h3>
            <p className="text-base mb-6" style={{ color: '#94A3B8', maxWidth: '400px', margin: '0 auto 24px' }}>
              Create custom forms for surveys, feedback, applications, and more
            </p>
            <button
              onClick={() => setShowTemplatesModal(true)}
              className="h-12 px-6 rounded-lg flex items-center gap-2 transition-all hover:scale-105 mx-auto"
              style={{
                backgroundColor: '#0684F5',
                color: '#FFFFFF',
                fontWeight: 600
              }}
            >
              <Plus size={20} />
              Create Custom Form
            </button>
          </div>
        )}
      </div>

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(11, 38, 65, 0.95)' }}
          onClick={() => setShowTemplatesModal(false)}
        >
          <div
            className="rounded-xl overflow-hidden"
            style={{
              width: '900px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#0B2641',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-8 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl mb-2" style={{ fontWeight: 600, color: '#FFFFFF' }}>
                    Create New Form
                  </h2>
                  <p className="text-base" style={{ color: '#94A3B8' }}>
                    Start from a template or build from scratch
                  </p>
                </div>
                <button
                  onClick={() => setShowTemplatesModal(false)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                  style={{ color: '#94A3B8', backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8">
              {/* Build Custom Form */}
              <div
                className="p-6 rounded-xl mb-8"
                style={{ backgroundColor: 'rgba(6,132,245,0.1)', border: '1px solid rgba(6,132,245,0.2)' }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <Plus size={32} style={{ color: '#0684F5' }} />
                  <div>
                    <h3 className="text-lg mb-1" style={{ fontWeight: 600, color: '#FFFFFF' }}>
                      Build Custom Form
                    </h3>
                    <p className="text-sm" style={{ color: '#94A3B8' }}>
                      Start with a blank canvas and add your own fields
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#FFFFFF' }}>
                      Form Name
                    </label>
                    <input
                      type="text"
                      value={newFormName}
                      onChange={(e) => setNewFormName(e.target.value)}
                      placeholder="e.g., Networking Preferences, Abstract Submission, Exit Survey..."
                      className="w-full h-12 px-4 rounded-lg border outline-none transition-colors focus:border-blue-400"
                      style={{
                        borderColor: 'rgba(255,255,255,0.2)',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: '#FFFFFF'
                      }}
                    />
                    <div className="flex justify-end mt-1">
                      <span className="text-xs" style={{ color: '#94A3B8' }}>
                        {newFormName.length}/100
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#FFFFFF' }}>
                      Form Type
                    </label>
                    <select
                      value={newFormType}
                      onChange={(e) => setNewFormType(e.target.value)}
                      className="w-full h-12 px-4 rounded-lg border outline-none cursor-pointer"
                      style={{
                        borderColor: 'rgba(255,255,255,0.2)',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: '#FFFFFF'
                      }}
                    >
                      <option value="survey">Survey</option>
                      <option value="feedback">Feedback</option>
                      <option value="assessment">Assessment</option>
                      <option value="data-collection">Data Collection</option>
                      <option value="application">Application</option>
                      <option value="submission">Submission</option>
                      <option value="custom">Other (Custom)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#FFFFFF' }}>
                      Description (Optional)
                    </label>
                    <textarea
                      value={newFormDescription}
                      onChange={(e) => setNewFormDescription(e.target.value)}
                      placeholder="Brief description of what this form is for..."
                      className="w-full h-20 p-4 rounded-lg border outline-none resize-none transition-colors focus:border-blue-400"
                      style={{
                        borderColor: 'rgba(255,255,255,0.2)',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: '#FFFFFF'
                      }}
                    />
                    <div className="flex justify-end mt-1">
                      <span className="text-xs" style={{ color: '#94A3B8' }}>
                        {newFormDescription.length}/200
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCreateBlankForm}
                    className="w-full h-12 rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
                    style={{
                      backgroundColor: '#0684F5',
                      color: '#FFFFFF',
                      fontWeight: 600
                    }}
                  >
                    Create Blank Form
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>

              {/* Templates */}
              <div>
                <h3 className="text-lg mb-5" style={{ fontWeight: 600, color: '#FFFFFF' }}>
                  Or Choose a Template
                </h3>
                <div className="grid grid-cols-3 gap-5">
                  {templates.map((template) => {
                    const TemplateIcon = template.icon;
                    const isPROLocked = !template.isFree && !hasPro;

                    return (
                      <div
                        key={template.id}
                        onClick={() => !isPROLocked && handleUseTemplate(template)}
                        className="relative rounded-xl p-6 transition-all hover:shadow-lg cursor-pointer"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          opacity: isPROLocked ? 0.7 : 1
                        }}
                      >
                        {isPROLocked && (
                          <div
                            className="absolute inset-0 flex flex-col items-center justify-center rounded-xl z-10"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowUpgradeModal(true);
                            }}
                          >
                            <Lock size={40} style={{ color: '#F59E0B', marginBottom: '12px' }} />
                            <button
                              className="h-9 px-4 rounded-lg text-xs flex items-center gap-1.5"
                              style={{
                                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                                color: '#FFFFFF',
                                fontWeight: 600
                              }}
                            >
                              <Lock size={12} />
                              Upgrade to Pro
                            </button>
                          </div>
                        )}

                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                          style={{ backgroundColor: `${template.iconColor}15` }}
                        >
                          <TemplateIcon size={24} style={{ color: template.iconColor }} />
                        </div>
                        <h4 className="text-base mb-2" style={{ fontWeight: 600, color: '#FFFFFF' }}>
                          {template.title}
                        </h4>
                        <p className="text-sm mb-4" style={{ color: '#94A3B8', lineHeight: 1.5, minHeight: '42px' }}>
                          {template.description}
                        </p>
                        <div className="mb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                          <p className="text-xs mb-2" style={{ color: '#94A3B8', fontWeight: 500 }}>
                            {template.fieldsCount} pre-built fields
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {template.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 rounded text-xs"
                                style={{
                                  backgroundColor: 'rgba(255,255,255,0.1)',
                                  color: '#94A3B8'
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span
                          className="inline-block px-2 py-1 rounded text-xs mb-4"
                          style={{
                            backgroundColor: template.isFree ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                            color: template.isFree ? '#10B981' : '#F59E0B',
                            fontWeight: 700
                          }}
                        >
                          {template.isFree ? 'FREE' : 'PRO'}
                        </span>
                        <button
                          className="w-full h-10 rounded-lg text-sm transition-colors"
                          style={{
                            border: '1px solid #0684F5',
                            color: '#0684F5',
                            fontWeight: 600,
                            backgroundColor: 'transparent'
                          }}
                        >
                          Use Template
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6" style={{ borderTop: '1px solid #E5E7EB' }}>
              <button
                onClick={() => setShowTemplatesModal(false)}
                className="h-11 px-6 rounded-lg transition-colors hover:bg-gray-100"
                style={{ color: '#6B7280', fontWeight: 600 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Field Editor Modal */}
      {showFieldEditor && editingField && (
        <FieldEditorModal
          isOpen={showFieldEditor}
          onClose={() => {
            setShowFieldEditor(false);
            setEditingField(null);
          }}
          onSave={(updatedField) => {
            setFormFields(formFields.map(f => 
              f.id === updatedField.id ? updatedField : f
            ));
          }}
          onDelete={() => {
            setFormFields(formFields.filter(f => f.id !== editingField.id));
            setShowFieldEditor(false);
            setEditingField(null);
          }}
          field={editingField}
        />
      )}

      {/* PRO Upgrade Modal */}
      {showUpgradeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(11, 38, 65, 0.75)' }}
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            className="bg-white rounded-xl p-8 text-center"
            style={{ width: '600px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-18 h-18 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: '#FEF3C7' }}
            >
              <Lock size={72} style={{ color: '#F59E0B' }} />
            </div>
            <h2 className="text-3xl mb-3" style={{ fontWeight: 600, color: '#0B2641' }}>
              Upgrade to Pro
            </h2>
            <p className="text-base mb-6" style={{ color: '#6B7280' }}>
              Unlock advanced form features and templates
            </p>
            <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '24px 0' }} />
            <div className="space-y-3 mb-8 text-left">
              {[
                'Pre/Post Assessment templates',
                'File upload fields',
                'Advanced field types (signature, matrix, ranking)',
                'Networking matcher',
                'Lead capture forms',
                'Unlimited custom forms',
                'Priority support'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle size={20} style={{ color: '#10B981', flexShrink: 0 }} />
                  <span className="text-base" style={{ color: '#0B2641' }}>{feature}</span>
                </div>
              ))}
            </div>
            <button
              className="w-full h-13 rounded-lg text-base mb-3 transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#FFFFFF',
                fontWeight: 600,
                padding: '16px'
              }}
              onClick={() => {
                setShowUpgradeModal(false);
                navigate('/pricing');
              }}
            >
              Upgrade to Pro - $49/month
            </button>
            <button
              className="text-sm transition-colors hover:underline mb-2"
              style={{ color: '#0684F5', fontWeight: 500 }}
              onClick={() => {
                setShowUpgradeModal(false);
                navigate('/pricing');
              }}
            >
              View all Pro features
            </button>
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="w-full h-10 rounded-lg text-sm transition-colors hover:bg-gray-100"
              style={{ color: '#6B7280', fontWeight: 600 }}
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const AlertTriangle = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
