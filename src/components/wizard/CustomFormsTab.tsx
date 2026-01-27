import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner@2.0.3';
import { usePlan } from '../../hooks/usePlan';
import { useI18n } from '../../i18n/I18nContext';
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
  Pencil,
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
import FieldPropertiesPanel from './FieldPropertiesPanel';
import { countries } from '../../data/countries';

const toFlagEmoji = (code: string) => {
  return code
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
};

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
  dbId?: string;
  formKey?: string;
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
  isSystem?: boolean;
  isEditable?: boolean;
  fieldValue?: string; // For simple values
  phoneCountryCode?: string;
  phoneNumber?: string;
  isDropdownOpen?: boolean;
}

interface DbEventFormRow {
  id: string;
  event_id: string;
  form_key: string | null;
  title: string;
  description: string | null;
  form_type: string | null;
  status: string | null;
  is_default: boolean | null;
  is_template: boolean | null;
  is_free: boolean | null;
  is_pro: boolean | null;
  schema: any;
  created_at?: string;
  updated_at?: string;
}

const buildFieldSummary = (fields: CustomField[], fallbackLabel: string) => {
  const mapIcon = (t: CustomField['type']) => {
    if (t === 'email') return Mail;
    if (t === 'phone') return Phone;
    if (t === 'country') return MapPin;
    if (t === 'date') return Calendar;
    if (t === 'file') return Upload;
    if (t === 'number') return Hash;
    if (t === 'textarea') return AlignLeft;
    if (t === 'dropdown') return ChevronDown;
    if (t === 'checkbox' || t === 'multichoice') return CheckSquare;
    if (t === 'radio') return Circle;
    if (t === 'address') return Building;
    if (t === 'url') return Globe;
    return Type;
  };

  return (fields || []).slice(0, 5).map((f) => ({
    name: f.label || fallbackLabel,
    icon: mapIcon(f.type)
  }));
};

const iconForFormType = (formType: string) => {
  const t = (formType || '').toLowerCase();
  if (t.includes('registration')) return ClipboardList;
  if (t.includes('survey')) return Star;
  if (t.includes('assessment')) return GraduationCap;
  if (t.includes('feedback')) return MessageSquare;
  if (t.includes('submission')) return Upload;
  if (t.includes('application')) return Hand;
  if (t.includes('data')) return FileText;
  return ClipboardList;
};

const colorForFormType = (formType: string) => {
  const t = (formType || '').toLowerCase();
  if (t.includes('registration')) return '#10B981';
  if (t.includes('survey')) return '#0684F5';
  if (t.includes('assessment')) return '#8B5CF6';
  if (t.includes('feedback')) return '#F59E0B';
  if (t.includes('submission')) return '#EF4444';
  if (t.includes('application')) return '#EC4899';
  if (t.includes('data')) return '#06B6D4';
  return '#10B981';
};

const rowToCard = (row: DbEventFormRow, fallbackLabel: string): FormCard => {
  const fields = (row?.schema?.fields || []) as CustomField[];
  const type = (row.form_type || 'custom') as FormCard['type'];
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    type,
    status: (row.status as any) || 'draft',
    totalFields: fields?.length || 0,
    defaultFields: buildFieldSummary(fields, fallbackLabel),
    isDefault: !!row.is_default,
    isTemplate: !!row.is_template,
    isFree: row.is_free !== false,
    isPro: !!row.is_pro,
    icon: iconForFormType(type),
    iconColor: colorForFormType(type),
    dbId: row.id,
    formKey: row.form_key || undefined
  };
};

interface CustomFormsTabProps {
  eventId: string;
}

export default function CustomFormsTab({ eventId }: CustomFormsTabProps) {
  const navigate = useNavigate();
  const { t, tList } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [selectedForm, setSelectedForm] = useState<FormCard | null>(null);
  const [newFormName, setNewFormName] = useState('');
  const [newFormType, setNewFormType] = useState('survey');
  const [newFormDescription, setNewFormDescription] = useState('');

  // Form Builder States

  const [formFields, setFormFields] = useState<CustomField[]>([]);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [draggedField, setDraggedField] = useState<string | null>(null);
  const [showProTip, setShowProTip] = useState(true);

  const [formsLoading, setFormsLoading] = useState(false);
  const [formsRows, setFormsRows] = useState<DbEventFormRow[]>([]);
  const [currentFormRow, setCurrentFormRow] = useState<DbEventFormRow | null>(null);
  const [savingForm, setSavingForm] = useState(false);

  const [builderTitle, setBuilderTitle] = useState('');
  const [builderDescription, setBuilderDescription] = useState('');
  const [builderType, setBuilderType] = useState<FormCard['type']>('custom');
  const [builderStatus, setBuilderStatus] = useState<'active' | 'draft' | 'locked'>('draft');

  const lastFetchRef = useRef<string>('');

  useEffect(() => {
    if (!eventId) return;
    fetchForms();
  }, [eventId]);

  const fetchForms = async () => {
    if (!eventId) return;
    const key = `${eventId}`;
    if (lastFetchRef.current === key && formsRows?.length) return;
    lastFetchRef.current = key;
    try {
      setFormsLoading(true);
      const { data, error } = await supabase
        .from('event_forms')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setFormsRows((data as any) || []);
    } catch (e: any) {
      console.error('Error fetching forms:', e);
    } finally {
      setFormsLoading(false);
    }
  };

  const formsByKey = useMemo(() => {
    const map = new Map<string, DbEventFormRow>();
    for (const r of formsRows) {
      const k = (r as any)?.form_key;
      if (k) map.set(String(k), r as any);
    }
    return map;
  }, [formsRows]);

  const ensureFormRow = async (card: FormCard) => {
    if (!eventId) return null;
    if (card.dbId) {
      const row = formsRows.find((r) => r.id === card.dbId) || null;
      return row;
    }
    const k = card.formKey ? String(card.formKey) : null;
    if (k && formsByKey.has(k)) return formsByKey.get(k) || null;

    // Default fields for registration
    let initialFields: CustomField[] = [];
    if (k === 'default_registration') {
      initialFields = [
        {
          id: 'default-name',
          type: 'text',
          label: t('wizard.step3.customForms.defaults.registration.fields.fullName') || 'Full Name',
          required: true,
          isPro: false,
          isSystem: true
        },
        {
          id: 'default-email',
          type: 'email',
          label: t('wizard.step3.customForms.defaults.registration.fields.email') || 'Email Address',
          required: true,
          isPro: false,
          isSystem: true
        }
      ];
    }

    const payload: any = {
      event_id: eventId,
      form_key: k,
      title: card.title,
      description: card.description || '',
      form_type: card.type || 'custom',
      status: card.status || 'draft',
      is_default: !!card.isDefault,
      is_template: !!card.isTemplate,
      is_free: card.isFree !== false,
      is_pro: !!card.isPro,
      schema: { fields: initialFields }
    };

    try {
      const { data, error } = await supabase
        .from('event_forms')
        .insert([payload])
        .select('*')
        .single();

      if (error) throw error;
      const row = data as any as DbEventFormRow;
      setFormsRows((prev) => [row, ...prev.filter((x) => x.id !== row.id)]);
      return row;
    } catch (e: any) {
      console.error('Error creating form row:', e);
      toast.error(t('wizard.step3.customForms.toasts.createFailed'));
      return null;
    }
  };

  const openBuilderForForm = async (card: FormCard) => {
    const row = await ensureFormRow(card);
    const r = row || null;
    setCurrentFormRow(r);
    const fields = (r?.schema?.fields || []) as CustomField[];
    setFormFields(Array.isArray(fields) ? fields : []);
    setSelectedForm({ ...card, dbId: r?.id || card.dbId, formKey: r?.form_key || card.formKey });
    setBuilderTitle(r?.title || card.title || '');
    setBuilderDescription((r?.description ?? card.description) || '');
    setBuilderType(((r?.form_type as any) || card.type || 'custom') as any);
    setBuilderStatus(((r?.status as any) || card.status || 'draft') as any);
    setShowFieldEditor(false);
    setEditingField(null);
    setIsEditorOpen(false);
    setShowFormBuilder(true);
  };

  const saveCurrentForm = async (opts?: { silent?: boolean }) => {
    if (!eventId) return;
    if (!currentFormRow?.id) {
      toast.error(t('wizard.step3.customForms.toasts.formNotReady'));
      return;
    }
    try {
      setSavingForm(true);
      const payload: any = {
        title: builderTitle || t('wizard.step3.customForms.builder.untitled'),
        description: builderDescription || '',
        form_type: builderType || 'custom',
        status: builderStatus || 'draft',
        schema: { fields: formFields || [] }
      };

      const { data, error } = await supabase
        .from('event_forms')
        .update(payload)
        .eq('id', currentFormRow.id)
        .select('id');
      if (error) throw error;
      if (!data || (Array.isArray(data) && data.length === 0)) throw new Error('No rows updated');

      setFormsRows((prev) =>
        prev.map((r) =>
          r.id === currentFormRow.id
            ? ({ ...(r as any), ...(payload as any) } as any)
            : r
        )
      );

      if (!opts?.silent) toast.success(t('wizard.step3.customForms.toasts.saved'));
    } catch (e: any) {
      console.error('Error saving form:', e);
      if (!opts?.silent) toast.error(t('wizard.step3.customForms.toasts.saveFailed'));
    } finally {
      setSavingForm(false);
    }
  };

  const handleDeleteForm = async (form: FormCard) => {
    if (form.formKey === 'default_registration' || form.isDefault) {
      toast.error(t('wizard.step3.customForms.toasts.cannotDeleteRegistration'));
      return;
    }

    if (!window.confirm(t('wizard.step3.customForms.confirmDelete'))) return;

    try {
      const { error } = await supabase
        .from('event_forms')
        .delete()
        .eq('id', form.dbId || form.id);

      if (error) throw error;

      setFormsRows((prev) => prev.filter((r) => r.id !== (form.dbId || form.id)));
      toast.success(t('wizard.step3.customForms.toasts.deleted'));
    } catch (e: any) {
      console.error('Error deleting form:', e);
      toast.error(t('wizard.step3.customForms.toasts.deleteFailed'));
    }
  };

  const autosaveTimer = useRef<any>(null);

  useEffect(() => {
    if (!showFormBuilder) return;
    if (!currentFormRow?.id) return;

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      saveCurrentForm({ silent: true });
    }, 600);

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [showFormBuilder, currentFormRow?.id, builderTitle, builderDescription, builderType, formFields]);

  const closeBuilder = async () => {
    try {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      await saveCurrentForm({ silent: true });
    } catch (e) {
    }
    setShowFieldEditor(false);
    setEditingField(null);
    setIsEditorOpen(false);
    setDraggedField(null);
    setShowFormBuilder(false);
    setSelectedForm(null);
    setCurrentFormRow(null);
  };

  const { isPro: hasPro } = usePlan();
  const fieldFallbackLabel = t('wizard.step3.customForms.fieldFallback');

  const fieldTypeLabels = useMemo(
    () => ({
      text: t('wizard.step3.customForms.builder.fieldLabels.shortText'),
      textarea: t('wizard.step3.customForms.builder.fieldLabels.longText'),
      dropdown: t('wizard.step3.customForms.builder.fieldLabels.dropdown'),
      checkbox: t('wizard.step3.customForms.builder.fieldLabels.checkboxes'),
      radio: t('wizard.step3.customForms.builder.fieldLabels.multipleChoice'),
      date: t('wizard.step3.customForms.builder.fieldLabels.date'),
      file: t('wizard.step3.customForms.builder.fieldLabels.fileUpload'),
      number: t('wizard.step3.customForms.builder.fieldLabels.number'),
      multichoice: t('wizard.step3.customForms.builder.fieldLabels.multipleChoice'),
      country: t('wizard.step3.customForms.builder.fieldLabels.country'),
      email: t('wizard.step3.customForms.builder.fieldLabels.email'),
      phone: t('wizard.step3.customForms.builder.fieldLabels.phone'),
      url: t('wizard.step3.customForms.builder.fieldLabels.websiteUrl'),
      address: t('wizard.step3.customForms.builder.fieldLabels.address')
    }),
    [t]
  );

  const fieldTypes = [
    // FREE
    { id: 'text', icon: Type, label: t('wizard.step3.customForms.fieldTypes.text.label'), desc: t('wizard.step3.customForms.fieldTypes.text.desc'), isPro: false },
    { id: 'textarea', icon: AlignLeft, label: t('wizard.step3.customForms.fieldTypes.textarea.label'), desc: t('wizard.step3.customForms.fieldTypes.textarea.desc'), isPro: false },
    { id: 'dropdown', icon: ChevronDown, label: t('wizard.step3.customForms.fieldTypes.dropdown.label'), desc: t('wizard.step3.customForms.fieldTypes.dropdown.desc'), isPro: false },
    { id: 'checkbox', icon: CheckSquare, label: t('wizard.step3.customForms.fieldTypes.checkbox.label'), desc: t('wizard.step3.customForms.fieldTypes.checkbox.desc'), isPro: false },
    { id: 'radio', icon: Circle, label: t('wizard.step3.customForms.fieldTypes.radio.label'), desc: t('wizard.step3.customForms.fieldTypes.radio.desc'), isPro: false },
    // PRO
    { id: 'date', icon: Calendar, label: t('wizard.step3.customForms.fieldTypes.date.label'), desc: t('wizard.step3.customForms.fieldTypes.date.desc'), isPro: true },
    { id: 'file', icon: Upload, label: t('wizard.step3.customForms.fieldTypes.file.label'), desc: t('wizard.step3.customForms.fieldTypes.file.desc'), isPro: true },
    { id: 'number', icon: Hash, label: t('wizard.step3.customForms.fieldTypes.number.label'), desc: t('wizard.step3.customForms.fieldTypes.number.desc'), isPro: true },
    { id: 'multichoice', icon: CheckSquare, label: t('wizard.step3.customForms.fieldTypes.multichoice.label'), desc: t('wizard.step3.customForms.fieldTypes.multichoice.desc'), isPro: true },
    { id: 'country', icon: Globe, label: t('wizard.step3.customForms.fieldTypes.country.label'), desc: t('wizard.step3.customForms.fieldTypes.country.desc'), isPro: true }
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
        ? [
            t('wizard.step3.customForms.fieldOptions.option1'),
            t('wizard.step3.customForms.fieldOptions.option2'),
            t('wizard.step3.customForms.fieldOptions.option3')
          ]
        : undefined,
      isPro: fieldType.isPro
    };

    setFormFields([...formFields, newField]);
  };

  const handleEditField = (field: CustomField) => {
    setEditingField(field);
    setIsEditorOpen(true);
  };

  const handleSaveField = (updatedField: CustomField) => {
    setFormFields(prev => prev.map(f => (f.id === updatedField.id ? updatedField : f)));
    setEditingField(updatedField);
  };

  const handleDeleteField = (fieldId: string) => {
    setFormFields(prev => prev.filter(f => f.id !== fieldId));
  };

  const handleDragStart = (fieldId: string) => {
    setDraggedField(fieldId);
  };

  const handleDragOver = (e: React.DragEvent, targetFieldId: string) => {
    e.preventDefault();
    if (!draggedField || draggedField === targetFieldId) return;

    const draggedIndex = formFields.findIndex(f => f.id === draggedField);
    const targetIndex = formFields.findIndex(f => f.id === targetFieldId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newFields = [...formFields];
    const [removed] = newFields.splice(draggedIndex, 1);
    newFields.splice(targetIndex, 0, removed);

    setFormFields(newFields);
  };

  const handleDragEnd = () => {
    setDraggedField(null);
  };

  // Default Forms
  const defaultForms: FormCard[] = [
    {
      id: 'default-1',
      formKey: 'default_registration',
      title: t('wizard.step3.customForms.defaults.registration.title'),
      description: t('wizard.step3.customForms.defaults.registration.description'),
      type: 'registration',
      status: 'active',
      isDefault: true,
      isFree: true,
      isPro: false,
      fields: [
        { name: t('wizard.step3.customForms.defaults.registration.fields.email'), icon: Mail },
        { name: t('wizard.step3.customForms.defaults.registration.fields.fullName'), icon: User },
        { name: t('wizard.step3.customForms.defaults.registration.fields.phone'), icon: Phone },
        { name: t('wizard.step3.customForms.defaults.registration.fields.company'), icon: Building },
        { name: t('wizard.step3.customForms.defaults.registration.fields.jobTitle'), icon: Briefcase }
      ],
      totalFields: 8,
      lastEdited: t('wizard.step3.customForms.defaults.registration.lastEdited'),
      infoNote: t('wizard.step3.customForms.defaults.registration.info'),
      icon: ClipboardList,
      iconColor: '#0684F5'
    }
  ];

  // Custom Forms (Mock data removed)
  const customForms: FormCard[] = [];

  const defaultCards = useMemo(() => {
    const out: FormCard[] = [];
    for (const c of defaultForms) {
      const k = c.formKey ? String(c.formKey) : '';
      const row = k ? formsByKey.get(k) : null;
      if (row) {
        const merged = rowToCard(row, fieldFallbackLabel);
        out.push({
          ...c,
          ...merged,
          icon: c.icon,
          iconColor: c.iconColor,
          formKey: c.formKey,
          dbId: merged.dbId
        });
      } else out.push(c);
    }
    for (const r of formsRows) {
      if (r.is_default) {
        const k = (r as any).form_key;
        if (k && defaultForms.some((d) => d.formKey === k)) continue;
        out.push(rowToCard(r as any, fieldFallbackLabel));
      }
    }
    return out;
  }, [formsRows, formsByKey]);

  const customCards = useMemo(() => {
    const out: FormCard[] = [];
    for (const r of formsRows) {
      const k = (r as any).form_key;
      if (k && defaultForms.some((d) => d.formKey === k)) continue;
      if (r.is_default) continue;
      out.push(rowToCard(r as any, fieldFallbackLabel));
    }
    return out;
  }, [formsRows, formsByKey]);

  const templates: any[] = [];

    const handleOpenFormBuilder = async (form?: FormCard) => {
    if (!form) return;
    await openBuilderForForm(form);
  };


    const handleCreateBlankForm = async () => {
    if (!newFormName.trim()) return;
    const payload: any = {
      event_id: eventId,
      form_key: null,
      title: newFormName.trim(),
      description: newFormDescription || '',
      form_type: newFormType || 'custom',
      status: 'draft',
      is_default: false,
      is_template: false,
      is_free: true,
      is_pro: false,
      schema: { fields: [] }
    };

    try {
      const { data, error } = await supabase
        .from('event_forms')
        .insert([payload])
        .select('*')
        .single();

      if (error) throw error;

      const row = data as any as DbEventFormRow;
      setFormsRows((prev) => [row, ...prev]);
      setShowTemplatesModal(false);
      setNewFormName('');
      setNewFormDescription('');
      setNewFormType('survey');

      await openBuilderForForm(rowToCard(row, fieldFallbackLabel));
    } catch (e: any) {
      console.error('Error creating blank form:', e);
      toast.error('Failed to create form');
    }
  };


    const handleUseTemplate = async (template: any) => {
    if (!template.isFree && !hasPro) {
      setShowUpgradeModal(true);
      return;
    }

    const payload: any = {
      event_id: eventId,
      form_key: null,
      title: template.name,
      description: template.description || '',
      form_type: template.type || 'custom',
      status: 'draft',
      is_default: false,
      is_template: true,
      is_free: !!template.isFree,
      is_pro: !template.isFree,
      schema: { fields: [] }
    };

    try {
      const { data, error } = await supabase
        .from('event_forms')
        .insert([payload])
        .select('*')
        .single();

      if (error) throw error;

      const row = data as any as DbEventFormRow;
      setFormsRows((prev) => [row, ...prev]);
      setShowTemplatesModal(false);

      await openBuilderForForm(rowToCard(row, fieldFallbackLabel));
    } catch (e: any) {
      console.error('Error creating template form:', e);
      toast.error('Failed to create form');
    }
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
              {t('wizard.step3.customForms.actions.upgradeToPro')}
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
                    {t('wizard.step3.customForms.badges.default')}
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
                    {t('wizard.step3.customForms.badges.template')}
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
                    {t('wizard.step3.customForms.badges.free')}
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
                    {t('wizard.step3.customForms.badges.pro')}
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
                {form.status === 'active'
                  ? t('wizard.step3.customForms.status.active')
                  : t('wizard.step3.customForms.status.draft')}
              </span>
            )}
            {!(form.formKey === 'default_registration' || form.isDefault) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteForm(form);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-red-400 hover:bg-red-500/10"
                title={t('wizard.step3.customForms.actions.deleteForm')}
              >
                <Trash2 size={16} />
              </button>
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
            {t('wizard.step3.customForms.formTypeLabel', {
              type: t(`wizard.step3.customForms.formTypes.${form.type}`)
            })}
          </span>
        </div>

        {/* Fields Preview */}
        <div
          className="p-4 rounded-lg mb-4"
          style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
        >
          <p className="text-xs mb-2" style={{ color: '#94A3B8', fontWeight: 500 }}>
            {t('wizard.step3.customForms.formFieldsLabel')}
          </p>
          <div className="flex flex-wrap gap-2">
            {form.fields?.slice(0, 5).map((field, index) => {
              const FieldIcon = field.icon;
              return (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                  style={{ backgroundColor: previewDevice === 'desktop' ? 'rgba(255,255,255,0.1)' : 'transparent', color: previewDevice === 'desktop' ? '#FFFFFF' : '#94A3B8' }}
                      onClick={() => setPreviewDevice('desktop')}
                >
                  <FieldIcon size={12} style={{ color: '#94A3B8' }} />
                  {field.name}
                </span>
              );
            })}
            {form.totalFields > form.fields?.length && (
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#94A3B8' }}
              >
                {t('wizard.step3.customForms.moreFields', { count: form.totalFields - form.fields?.length })}
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
                {t('wizard.step3.customForms.lastEdited', { date: form.lastEdited })}
              </div>
            )}
            {form.created && !form.lastEdited && (
              <div className="flex items-center gap-1.5">
                <Calendar size={12} />
                {t('wizard.step3.customForms.created', { date: form.created })}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <User size={12} />
              {t('wizard.step3.customForms.fieldsCount', { count: form.totalFields })}
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
              {t('wizard.step3.customForms.actions.editForm')}
            </button>
          )}
        </div>
      </div>
    );
  };

  if (showFormBuilder) {
    return (
      <div className="form-builder-container" style={{ backgroundColor: '#0B2641', minHeight: '100%', paddingBottom: '40px' }}>
        <style>{`
          @media (max-width: 1024px) {
            .form-builder-container { padding-bottom: 40px !important; }
            .builder-header { flex-direction: column !important; gap: 16px !important; padding: 16px !important; }
            .builder-header-left { flex-direction: column !important; align-items: flex-start !important; width: 100% !important; gap: 12px !important; }
            .builder-header-divider { display: none !important; }
            .builder-header-title { width: 100% !important; }
            .builder-header-actions { width: 100% !important; justify-content: space-between !important; }
            
            .builder-layout { flex-direction: column !important; padding: 0 16px !important; }
            .builder-sidebar { width: 100% !important; margin-bottom: 24px !important; }
            .builder-sidebar-inner { position: static !important; }
            .builder-preview { width: 100% !important; padding: 0 !important; }
            .preview-card { padding: 16px !important; }
            .preview-header { flex-direction: column !important; gap: 12px !important; align-items: flex-start !important; }
            .preview-device-toggles { align-self: flex-end !important; }
          }
          @media (max-width: 500px) {
            .form-builder-container { padding-bottom: 20px !important; }
            .builder-layout-container { padding: 0 8px !important; }
            .preview-card { padding: 12px !important; }
          }
        `}</style>
        {/* Top Navigation Bar */}
        <div
          className="builder-header flex items-center justify-between px-10 py-4 mb-6"
          style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div className="builder-header-left flex items-center gap-4">
            <button
              onClick={closeBuilder}
              className="flex items-center gap-2 px-4 h-10 rounded-lg transition-colors"
              style={{ color: '#0684F5', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <ArrowLeft size={18} />
              <span className="text-sm" style={{ fontWeight: 600 }}>
                {t('wizard.step3.customForms.builder.backToForms')}
              </span>
            </button>
            <div className="builder-header-divider" style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <div className="builder-header-title flex items-center gap-3">
              <input
                type="text"
                value={builderTitle || selectedForm?.title || ''}
                      onChange={(e) => setBuilderTitle(e.target.value)}
                className="text-lg outline-none border-b-2 border-transparent hover:border-blue-200 focus:border-blue-400 transition-colors w-full"
                style={{ fontWeight: 600, color: '#FFFFFF', padding: '4px 8px', backgroundColor: 'transparent' }}
              />
              <span
                className="px-2.5 py-1 rounded-full text-xs whitespace-nowrap"
                style={{
                  backgroundColor: selectedForm ? `${getTypeColor(selectedForm.type)}15` : '#EFF6FF',
                  color: selectedForm ? getTypeColor(selectedForm.type) : '#0684F5',
                  fontWeight: 500
                }}
              >
                {t(`wizard.step3.customForms.formTypes.${selectedForm?.type || builderType || 'survey'}`)}
              </span>
            </div>
          </div>
          <div className="builder-header-actions flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm" style={{ color: '#94A3B8', fontWeight: 500 }}>
                {selectedForm?.status === 'active'
                  ? t('wizard.step3.customForms.status.active')
                  : t('wizard.step3.customForms.status.draft')}
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
              {t('wizard.step3.customForms.builder.previewButton')}
            </button>
            <button
              onClick={saveCurrentForm}
              className="h-10 px-4 rounded-lg flex items-center gap-2 transition-all hover:scale-105"
              style={{
                backgroundColor: '#0684F5',
                color: '#FFFFFF',
                fontWeight: 600
              }}
            >
              <Check size={16} />
              {t('wizard.step3.customForms.builder.saveButton')}
            </button>
          </div>
        </div>

        {/* Form Builder Split View */}
        <div className="max-w-[1400px] mx-auto px-10 builder-layout-container">
          <div className="builder-layout flex gap-6">
            {/* Left Panel - Field Library or Properties Panel */}
            <div className="builder-sidebar w-80 flex-shrink-0">
              <div className="builder-sidebar-inner rounded-xl p-6 sticky top-6" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', height: 'calc(100vh - 140px)', overflowY: 'auto' }}>
                {showFieldEditor && editingField ? (
                  <FieldPropertiesPanel
                    field={editingField}
                    onSave={handleSaveField}
                    onDelete={() => {
                      if (editingField) handleDeleteField(editingField.id);
                      setShowFieldEditor(false);
                      setEditingField(null);
                    }}
                    onClose={() => {
                      setShowFieldEditor(false);
                      setEditingField(null);
                    }}
                  />
                ) : (
                  <>
                    <h3 className="text-lg mb-4" style={{ fontWeight: 600, color: '#FFFFFF' }}>
                      {t('wizard.step3.customForms.builder.fieldLibrary.title')}
                    </h3>
                    <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>
                      {t('wizard.step3.customForms.builder.fieldLibrary.subtitle')}
                    </p>

                    {/* Field Categories */}
                    <div className="space-y-6">
                      {/* Common Fields */}
                      <div>
                        <h4 className="text-xs mb-3" style={{ fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Common Fields
                        </h4>
                        <div className="space-y-2">
                          {[
                            { icon: Phone, label: 'Phone Number', type: 'phone', isEditable: false, isSystem: false },
                            { icon: MapPin, label: 'Country', type: 'country', isEditable: false, isSystem: false },
                            { icon: Calendar, label: 'Date of Birth', type: 'date', isEditable: false },
                            { icon: Users, label: 'Gender', type: 'dropdown', options: ['Male', 'Female'], isEditable: false },
                            { icon: Hash, label: 'Age', type: 'number', isEditable: false }
                          ].map((field, idx) => {
                            const FieldIcon = field.icon;
                            return (
                              <div
                                key={idx}
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('fieldType', field.type);
                                  e.dataTransfer.setData('fieldLabel', field.label);
                                  if (field.options) {
                                      e.dataTransfer.setData('fieldOptions', JSON.stringify(field.options));
                                  }
                                  e.dataTransfer.setData('isSystem', field.isSystem ? 'true' : 'false');
                                  e.dataTransfer.setData('isEditable', field.isEditable ? 'true' : 'false');
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

                      {/* Basic Fields */}
                      <div>
                        <h4 className="text-xs mb-3" style={{ fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {t('wizard.step3.customForms.builder.categories.basic')}
                        </h4>
                        <div className="space-y-2">
                          {[
                            { icon: Type, label: t('wizard.step3.customForms.builder.fieldLabels.shortText'), type: 'text' },
                            { icon: AlignLeft, label: t('wizard.step3.customForms.builder.fieldLabels.longText'), type: 'textarea' },
                            { icon: Mail, label: t('wizard.step3.customForms.builder.fieldLabels.email'), type: 'email' },
                            { icon: Phone, label: t('wizard.step3.customForms.builder.fieldLabels.phone'), type: 'phone' },
                            { icon: Hash, label: t('wizard.step3.customForms.builder.fieldLabels.number'), type: 'number' },
                            { icon: Calendar, label: t('wizard.step3.customForms.builder.fieldLabels.date'), type: 'date' }
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
                          {t('wizard.step3.customForms.builder.categories.choice')}
                        </h4>
                        <div className="space-y-2">
                          {[
                            { icon: ChevronDown, label: t('wizard.step3.customForms.builder.fieldLabels.dropdown'), type: 'dropdown' },
                            { icon: Circle, label: t('wizard.step3.customForms.builder.fieldLabels.multipleChoice'), type: 'radio' },
                            { icon: CheckSquare, label: t('wizard.step3.customForms.builder.fieldLabels.checkboxes'), type: 'checkbox' }
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
                          {t('wizard.step3.customForms.builder.categories.advanced')}
                        </h4>
                        <div className="space-y-2">
                          {[
                            { icon: Upload, label: t('wizard.step3.customForms.builder.fieldLabels.fileUpload'), type: 'file' },
                            { icon: Globe, label: t('wizard.step3.customForms.builder.fieldLabels.websiteUrl'), type: 'url' },
                            { icon: MapPin, label: t('wizard.step3.customForms.builder.fieldLabels.address'), type: 'address' }
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
                                    {t('wizard.step3.customForms.badges.pro')}
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
                          {t('wizard.step3.customForms.builder.quickTips.title')}
                        </h4>
                      </div>
                      <ul className="text-xs space-y-1.5" style={{ color: '#94A3B8' }}>
                        <li>{t('wizard.step3.customForms.builder.quickTips.items.drag')}</li>
                        <li>{t('wizard.step3.customForms.builder.quickTips.items.edit')}</li>
                        <li>{t('wizard.step3.customForms.builder.quickTips.items.reorder')}</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Panel - Form Preview */}
            <div className="builder-preview flex-1">
              <div className="preview-card rounded-xl p-8" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {/* Preview Header */}
                <div className="preview-header flex items-center justify-between mb-8 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <div>
                    <h3 className="text-xl mb-1" style={{ fontWeight: 600, color: '#FFFFFF' }}>
                      {t('wizard.step3.customForms.builder.preview.title')}
                    </h3>
                    <p className="text-sm" style={{ color: '#94A3B8' }}>
                      {t('wizard.step3.customForms.builder.preview.subtitle')}
                    </p>
                  </div>
                  <div className="preview-device-toggles flex items-center gap-2">
                    <button
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                      style={{ backgroundColor: previewDevice === 'desktop' ? 'rgba(255,255,255,0.1)' : 'transparent', color: previewDevice === 'desktop' ? '#FFFFFF' : '#94A3B8' }}
                      onClick={() => setPreviewDevice('desktop')}
                      title={t('wizard.step3.customForms.builder.preview.device.desktop')}
                    >
                      <Monitor size={18} />
                    </button>
                    <button
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                      style={{ backgroundColor: previewDevice === 'tablet' ? 'rgba(255,255,255,0.1)' : 'transparent', color: previewDevice === 'tablet' ? '#FFFFFF' : '#94A3B8' }}
                      onClick={() => setPreviewDevice('tablet')}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      title={t('wizard.step3.customForms.builder.preview.device.tablet')}
                    >
                      <Tablet size={18} />
                    </button>
                    <button
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                      style={{ backgroundColor: previewDevice === 'mobile' ? 'rgba(255,255,255,0.1)' : 'transparent', color: previewDevice === 'mobile' ? '#FFFFFF' : '#94A3B8' }}
                      onClick={() => setPreviewDevice('mobile')}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      title={t('wizard.step3.customForms.builder.preview.device.mobile')}
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
                    const fieldLabel = e.dataTransfer.getData('fieldLabel');
                    const fieldOptionsStr = e.dataTransfer.getData('fieldOptions');
                    const isSystemStr = e.dataTransfer.getData('isSystem');
                    const isEditableStr = e.dataTransfer.getData('isEditable');
                    let fieldOptions = undefined;
                    if (fieldOptionsStr) {
                        fieldOptions = JSON.parse(fieldOptionsStr);
                    }

                    if (fieldType) {
                      // Determine if field is PRO
                      const isPROField = ['file', 'url', 'address'].includes(fieldType);
                      
                      // Add field to form
                      const newField: CustomField = {
                        id: Date.now().toString(),
                        type: fieldType as any,
                        label: fieldLabel || t('wizard.step3.customForms.builder.newFieldLabel', {
                          type: fieldTypeLabels[fieldType as CustomField['type']] || fieldType
                        }),
                        required: false,
                        placeholder: '',
                        isPro: isPROField,
                        options: fieldOptions && fieldOptions.length > 0 ? fieldOptions : (
                                   fieldType === 'dropdown' || fieldType === 'radio' || fieldType === 'checkbox'
                                     ? [
                                         t('wizard.step3.customForms.fieldOptions.option1'),
                                         t('wizard.step3.customForms.fieldOptions.option2'),
                                         t('wizard.step3.customForms.fieldOptions.option3')
                                       ]
                                     : undefined
                                 ),
                        isSystem: isSystemStr === 'true',
                        isEditable: isEditableStr === 'false' ? false : true,
                        fieldValue: '',
                        phoneCountryCode: fieldType === 'phone' ? 'US' : undefined,
                        phoneNumber: fieldType === 'phone' ? '' : undefined,
                        isDropdownOpen: false
                      };
                      setFormFields([...formFields, newField]);
                    }
                  }}
                  className="min-h-[500px]"
                  style={{ maxWidth: previewDevice === 'desktop' ? '100%' : previewDevice === 'tablet' ? '740px' : '420px', margin: '0 auto' }}
                >
                  {/* Form Title & Description */}
                  {(selectedForm?.title || newFormName) && (
                    <div className="mb-8 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <h3 className="text-2xl mb-2" style={{ fontWeight: 600, color: '#FFFFFF' }}>
                        {builderTitle || selectedForm?.title || newFormName || t('wizard.step3.customForms.builder.untitled')}
                      </h3>
                      {(selectedForm?.description || newFormDescription) && (
                        <p className="text-base" style={{ color: '#94A3B8' }}>
                          {builderDescription || selectedForm?.description || newFormDescription}
                        </p>
                      )}
                    </div>
                  )}

                  {formFields?.length === 0 ? (
                    // Empty State
                    <div className="flex flex-col items-center justify-center py-20">
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                        style={{ backgroundColor: 'rgba(6,132,245,0.1)' }}
                      >
                        <ClipboardList size={40} style={{ color: '#0684F5' }} />
                      </div>
                      <h4 className="text-lg mb-2" style={{ fontWeight: 600, color: '#FFFFFF' }}>
                        {t('wizard.step3.customForms.builder.dropZone.emptyTitle')}
                      </h4>
                      <p className="text-sm text-center max-w-md" style={{ color: '#94A3B8' }}>
                        {t('wizard.step3.customForms.builder.dropZone.emptySubtitle')}
                      </p>
                      <div className="mt-6 p-4 rounded-lg" style={{ border: '2px dashed rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                        <p className="text-xs" style={{ color: '#94A3B8' }}>
                          {t('wizard.step3.customForms.builder.dropZone.label')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Form Fields
                    <div className="space-y-6">
                      {/* Helpful Tip Banner */}
                      {formFields?.length > 0 && formFields?.length <= 2 && (
                        <div 
                          className="flex items-start gap-3 p-4 rounded-lg mb-4"
                          style={{ backgroundColor: 'rgba(6,132,245,0.1)', border: '1px solid rgba(6,132,245,0.3)' }}
                        >
                          <Info size={20} style={{ color: '#0684F5', flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <p className="text-sm" style={{ color: '#FFFFFF', fontWeight: 500 }}>
                              {t('wizard.step3.customForms.builder.tips.editField')}
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
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 transition-opacity">
                            {!field.isSystem && field.isEditable !== false && ( // Updated condition for Edit button
                              <button
                                onClick={() => {
                                  setEditingField(field);
                                  setShowFieldEditor(true);
                                }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                                style={{ backgroundColor: 'rgba(6,132,245,0.1)', color: '#0684F5' }}
                                title={t('wizard.step3.customForms.builder.fieldActions.editProperties')}
                              >
                                <Edit2 size={16} />
                              </button>
                            )}
                            {!field.isSystem && ( // Delete button remains the same condition
                              <button
                                onClick={() => {
                                  handleDeleteField(field.id);
                                }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                                style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#EF4444' }}
                                title={t('wizard.step3.customForms.builder.fieldActions.deleteField')}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                            {field.isSystem && ( // Lock icon remains the same condition
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: 'rgba(255,255,255,0.05)', cursor: 'not-allowed' }}
                                title={t('wizard.step3.customForms.builder.fieldActions.systemLocked')}
                              >
                                <Lock size={16} style={{ color: '#94A3B8' }} />
                              </div>
                            )}
                            <div // Drag handle remains the same
                              className="cursor-move w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                              title={t('wizard.step3.customForms.builder.fieldActions.dragToReorder')}
                            >
                              <GripVertical size={16} style={{ color: '#94A3B8' }} />
                            </div>
                          </div>

                          {/* Field Label */}
                          <div className="flex items-center gap-2 text-sm mb-2">
                            <label className="flex items-center gap-2 flex-1" style={{ fontWeight: 500, color: '#FFFFFF' }}>
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
                                {t('wizard.step3.customForms.badges.pro')}
                                </span>
                              )}
                              {field.isSystem && (
                                <span
                                  className="px-2 py-0.5 rounded text-xs flex items-center gap-1"
                                  style={{
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    color: '#94A3B8',
                                    fontWeight: 600
                                  }}
                                >
                                  <Lock size={10} />
                                  Default
                                </span>
                              )}
                            </label>
                            {!field.isSystem && ( // Removed the hover-triggered edit button
                                // <button
                                //   onClick={() => {
                                //     setEditingField(field);
                                //     setShowFieldEditor(true);
                                //   }}
                                //   className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded flex items-center justify-center hover:bg-blue-500/10"
                                //   title={t('wizard.step3.customForms.builder.fieldActions.editSettings')}
                                //   style={{ color: '#0684F5' }}
                                // >
                                //   <Pencil size={16} />
                                // </button>
                                null // Explicitly render null to remove the button
                            )}
                          </div>
                          
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
                              placeholder={field.placeholder || t('wizard.step3.customForms.builder.placeholders.text')}
                              disabled
                              className="w-full h-11 px-4 rounded-lg border"
                              style={{ borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: '#94A3B8' }}
                            />
                          )}

                          {field.type === 'textarea' && (
                            <textarea
                              placeholder={field.placeholder || t('wizard.step3.customForms.builder.placeholders.textarea')}
                              disabled
                              rows={4}
                              className="w-full p-4 rounded-lg border resize-none"
                              style={{ borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: '#94A3B8' }}
                            />
                          )}

                          {field.type === 'email' && (
                            <input
                              type="email"
                              placeholder={field.placeholder || t('wizard.step3.customForms.builder.placeholders.email')}
                              disabled
                              className="w-full h-11 px-4 rounded-lg border"
                              style={{ borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: '#94A3B8' }}
                            />
                          )}

                          {field.type === 'phone' && (
                            <div className="flex gap-2">
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setFormFields(prev => prev.map(f => f.id === field.id ? { ...f, isDropdownOpen: !f.isDropdownOpen } : f))}
                                  className="flex items-center justify-between transition-all"
                                  style={{
                                    width: '90px',
                                    height: '48px',
                                    padding: '12px',
                                    fontSize: '16px',
                                    color: '#111827',
                                    backgroundColor: '#FFFFFF',
                                    border: '1.5px solid #D1D5DB',
                                    borderRadius: '8px',
                                    outline: 'none'
                                  }}
                                >
                                  <span style={{ fontSize: '20px' }}>{toFlagEmoji(field.phoneCountryCode || 'US')}</span>
                                  <ChevronDown size={16} style={{ color: '#6B7280' }} />
                                </button>
                                {field.isDropdownOpen && (
                                  <div
                                    className="absolute top-full left-0 mt-1 w-64 rounded-lg shadow-lg z-10"
                                    style={{
                                      backgroundColor: '#FFFFFF',
                                      border: '1px solid #E5E7EB',
                                      maxHeight: '240px',
                                      overflowY: 'auto'
                                    }}
                                  >
                                    {countries.map((country) => (
                                      <button
                                        key={country.code}
                                        type="button"
                                        onClick={() => {
                                          setFormFields(prev => prev.map(f => f.id === field.id ? { ...f, phoneCountryCode: country.code, isDropdownOpen: false } : f));
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
                                      >
                                        <span style={{ fontSize: '20px' }}>{toFlagEmoji(country.code)}</span>
                                        <span style={{ fontSize: '14px', color: '#374151', flex: 1 }}>{country.name}</span>
                                        <span style={{ fontSize: '14px', color: '#6B7280' }}>{country.phoneCode}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <input
                                type="tel"
                                placeholder={field.placeholder || t('wizard.step3.customForms.builder.placeholders.phone')}
                                value={field.phoneNumber}
                                onChange={(e) => {
                                  const sanitized = e.target.value.replace(/[^0-9\s]/g, '');
                                  setFormFields(prev => prev.map(f => f.id === field.id ? { ...f, phoneNumber: sanitized } : f));
                                }}
                                className="flex-1 transition-all"
                                style={{
                                  height: '48px',
                                  padding: '12px 16px',
                                  fontSize: '16px',
                                  color: '#111827',
                                  backgroundColor: '#FFFFFF',
                                  border: `1.5px solid #D1D5DB`,
                                  borderRadius: '8px',
                                  outline: 'none'
                                }}
                              />
                            </div>
                          )}

                          {field.type === 'number' && (
                            <input
                              type="number"
                              placeholder={field.placeholder || t('wizard.step3.customForms.builder.placeholders.number')}
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

                          {field.type === 'country' && (
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => {
                                  setFormFields(prev => prev.map(f => f.id === field.id ? { ...f, isDropdownOpen: !f.isDropdownOpen } : f));
                                }}
                                className="w-full flex items-center justify-between transition-all"
                                style={{
                                  height: '48px',
                                  padding: '12px 16px',
                                  fontSize: '16px',
                                  color: field.value ? '#111827' : '#9CA3AF',
                                  backgroundColor: '#FFFFFF',
                                  border: '1.5px solid #D1D5DB',
                                  borderRadius: '8px',
                                  outline: 'none',
                                  textAlign: 'left'
                                }}
                              >
                                {field.value ? (
                                  <span className="flex items-center gap-2">
                                    <span style={{ fontSize: '20px' }}>
                                      {toFlagEmoji(field.value)}
                                    </span>
                                    {countries.find(c => c.code === field.value)?.name}
                                  </span>
                                ) : (
                                  t('profileSetup.placeholders.country')
                                )}
                                <ChevronDown size={20} style={{ color: '#6B7280' }} />
                              </button>

                              {/* Dropdown Menu */}
                              {field.isDropdownOpen && (
                                <div
                                  className="absolute top-full left-0 mt-1 w-full rounded-lg shadow-lg z-10"
                                  style={{
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #E5E7EB',
                                    maxHeight: '240px',
                                    overflowY: 'auto'
                                  }}
                                >
                                  {countries.map((country) => (
                                    <button
                                      key={country.code}
                                      type="button"
                                      onClick={() => {
                                        setFormFields(prev => prev.map(f => f.id === field.id ? { ...f, value: country.code, isDropdownOpen: false } : f));
                                      }}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
                                      style={{
                                        border: 'none',
                                        backgroundColor: field.value === country.code ? '#F3F4F6' : 'transparent',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                      }}
                                    >
                                      <span style={{ fontSize: '20px' }}>{toFlagEmoji(country.code)}</span>
                                      <span style={{ fontSize: '14px', color: '#374151' }}>{country.name}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {field.type === 'dropdown' && (
                            <select
                              disabled
                              className="w-full h-11 px-4 rounded-lg border"
                              style={{ borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: '#94A3B8' }}
                            >
                              <option>{t('wizard.step3.customForms.builder.placeholders.dropdown')}</option>
                              {field.options?.map((opt, i) => (
                                <option key={i}>{opt}</option>
                              ))}
                            </select>
                          )}

                          {field.type === 'radio' && (
                            <div className="space-y-3 pt-2">
                              {(field.options && field.options.length ? field.options : [
                                t('wizard.step3.customForms.fieldOptions.option1'),
                                t('wizard.step3.customForms.fieldOptions.option2'),
                                t('wizard.step3.customForms.fieldOptions.option3')
                              ]).map((opt, idx) => (
                                <label key={idx} className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-white/5 cursor-default">
                                  <div className="relative flex items-center justify-center w-5 h-5 rounded-full border-2 border-blue-500/50 bg-white/5">
                                    {idx === 0 && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                                  </div>
                                  <span className="text-sm font-medium text-slate-300">
                                    {opt}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}

                          {(field.type === 'checkbox' || field.type === 'multichoice') && (
                            <div className="space-y-3 pt-2">
                              {(field.options && field.options.length ? field.options : [
                                t('wizard.step3.customForms.fieldOptions.option1'),
                                t('wizard.step3.customForms.fieldOptions.option2'),
                                t('wizard.step3.customForms.fieldOptions.option3')
                              ]).map((opt, idx) => (
                                <label key={idx} className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-white/5 cursor-default">
                                  <div className="relative flex items-center justify-center w-5 h-5 rounded border-2 border-blue-500/50 bg-white/5">
                                    {idx === 0 && <Check size={14} className="text-blue-500" />}
                                  </div>
                                  <span className="text-sm font-medium text-slate-300">
                                    {opt}
                                  </span>
                                </label>
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
                                {t('wizard.step3.customForms.builder.placeholders.fileUpload')}
                              </p>
                            </div>
                          )}

                          {field.type === 'url' && (
                            <input
                              type="url"
                              placeholder={field.placeholder || t('wizard.step3.customForms.builder.placeholders.url')}
                              disabled
                              className="w-full h-11 px-4 rounded-lg border"
                              style={{ borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: '#94A3B8' }}
                            />
                          )}

                          {field.type === 'address' && (
                            <div className="space-y-3">
                              <input
                                type="text"
                                placeholder={t('wizard.step3.customForms.builder.placeholders.addressStreet')}
                                disabled
                                className="w-full h-11 px-4 rounded-lg border"
                                style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#9CA3AF' }}
                              />
                              <div className="grid grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  placeholder={t('wizard.step3.customForms.builder.placeholders.addressCity')}
                                  disabled
                                  className="h-11 px-4 rounded-lg border"
                                  style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#9CA3AF' }}
                                />
                                <input
                                  type="text"
                                  placeholder={t('wizard.step3.customForms.builder.placeholders.addressState')}
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
                          {t('wizard.step3.customForms.builder.dropZone.addMore')}
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
    <div className="forms-dashboard-container" style={{ backgroundColor: '#0B2641', paddingBottom: '80px', minHeight: 'calc(100vh - 300px)' }}>
      <style>{`
        @media (max-width: 1024px) {
          .forms-dashboard-container { padding: 16px !important; }
          .dashboard-header { flex-direction: column !important; gap: 16px !important; align-items: flex-start !important; }
          .dashboard-header-button { width: 100% !important; justify-content: center !important; }
          .search-bar-container { justify-content: flex-start !important; width: 100% !important; }
          .search-input-wrapper { width: 100% !important; }
          .search-input { width: 100% !important; }
        }
      `}</style>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px' }} className="dashboard-content">
        {/* Page Header */}
        <div className="dashboard-header flex items-start justify-between mb-8">
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
              {t('wizard.step3.customForms.header.title')}
            </h2>
            <p className="text-base" style={{ color: '#94A3B8' }}>
              {t('wizard.step3.customForms.header.subtitle')}
            </p>
          </div>
          <button
            onClick={() => setShowTemplatesModal(true)}
            className="dashboard-header-button h-11 px-6 rounded-lg flex items-center gap-2 transition-all hover:scale-105"
            style={{
              backgroundColor: '#0684F5',
              color: '#FFFFFF',
              fontWeight: 600
            }}
          >
            <Plus size={20} />
            {t('wizard.step3.customForms.header.createButton')}
          </button>
        </div>

        {/* Filter & Search Bar */}
        {/* Search Bar - Simplified */}
        <div className="search-bar-container flex items-center justify-end mb-8">
          <div className="search-input-wrapper relative">
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
              placeholder={t('wizard.step3.customForms.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input h-11 pl-11 pr-4 rounded-lg border outline-none transition-colors focus:border-blue-400"
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
              {t('wizard.step3.customForms.sections.defaultTitle')}
            </p>
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              {t('wizard.step3.customForms.sections.defaultSubtitle')}
            </p>
          </div>
          <div className="space-y-8">
            {defaultCards.map((form) => (
              <FormCardComponent key={form.id} form={form} />
            ))}
          </div>
        </div>

        {/* Custom Forms Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <p className="text-xs" style={{ color: '#94A3B8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('wizard.step3.customForms.sections.customTitle')}
              </p>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#94A3B8',
                  fontWeight: 500
                }}
              >
                {t('wizard.step3.customForms.sections.customCount', { count: customForms?.length || 0 })}
              </span>
            </div>
            {customForms?.length > 6 && (
              <button className="text-xs transition-colors hover:underline" style={{ color: '#0684F5', fontWeight: 500 }}>
                {t('wizard.step3.customForms.sections.viewAll')}
              </button>
            )}
          </div>
          <div className="space-y-8">
            {customCards.map((form) => (
              <FormCardComponent key={form.id} form={form} />
            ))}
          </div>
        </div>

        {/* Empty State (shown when no custom forms) */}
        {customForms?.length === 0 && (
          <div
            className="rounded-xl p-16 text-center"
            style={{
              border: '2px dashed rgba(255,255,255,0.2)',
              backgroundColor: 'rgba(255,255,255,0.03)'
            }}
          >
            <FileText size={80} style={{ color: '#94A3B8', margin: '0 auto 20px' }} />
            <h3 className="text-2xl mb-3" style={{ fontWeight: 600, color: '#FFFFFF' }}>
              {t('wizard.step3.customForms.emptyState.title')}
            </h3>
            <p className="text-base mb-6" style={{ color: '#94A3B8', maxWidth: '400px', margin: '0 auto 24px' }}>
              {t('wizard.step3.customForms.emptyState.subtitle')}
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
              {t('wizard.step3.customForms.emptyState.cta')}
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
                    {t('wizard.step3.customForms.templatesModal.title')}
                  </h2>
                  <p className="text-base" style={{ color: '#94A3B8' }}>
                    {t('wizard.step3.customForms.templatesModal.subtitle')}
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
                      {t('wizard.step3.customForms.templatesModal.buildTitle')}
                    </h3>
                    <p className="text-sm" style={{ color: '#94A3B8' }}>
                      {t('wizard.step3.customForms.templatesModal.buildSubtitle')}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#FFFFFF' }}>
                      {t('wizard.step3.customForms.templatesModal.formNameLabel')}
                    </label>
                    <input
                      type="text"
                      value={newFormName}
                      onChange={(e) => setNewFormName(e.target.value)}
                      placeholder={t('wizard.step3.customForms.templatesModal.formNamePlaceholder')}
                      className="w-full h-12 px-4 rounded-lg border outline-none transition-colors focus:border-blue-400"
                      style={{
                        borderColor: 'rgba(255,255,255,0.2)',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: '#FFFFFF'
                      }}
                    />
                    <div className="flex justify-end mt-1">
                      <span className="text-xs" style={{ color: '#94A3B8' }}>
                        {newFormName?.length}/100
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#FFFFFF' }}>
                      {t('wizard.step3.customForms.templatesModal.formTypeLabel')}
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
                      <option value="survey">{t('wizard.step3.customForms.formTypes.survey')}</option>
                      <option value="feedback">{t('wizard.step3.customForms.formTypes.feedback')}</option>
                      <option value="assessment">{t('wizard.step3.customForms.formTypes.assessment')}</option>
                      <option value="data-collection">{t('wizard.step3.customForms.formTypes.data-collection')}</option>
                      <option value="application">{t('wizard.step3.customForms.formTypes.application')}</option>
                      <option value="submission">{t('wizard.step3.customForms.formTypes.submission')}</option>
                      <option value="custom">{t('wizard.step3.customForms.formTypes.custom')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-2" style={{ fontWeight: 500, color: '#FFFFFF' }}>
                      {t('wizard.step3.customForms.templatesModal.descriptionLabel')}
                    </label>
                    <textarea
                      value={newFormDescription}
                      onChange={(e) => setNewFormDescription(e.target.value)}
                      placeholder={t('wizard.step3.customForms.templatesModal.descriptionPlaceholder')}
                      className="w-full h-20 p-4 rounded-lg border outline-none resize-none transition-colors focus:border-blue-400"
                      style={{
                        borderColor: 'rgba(255,255,255,0.2)',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: '#FFFFFF'
                      }}
                    />
                    <div className="flex justify-end mt-1">
                      <span className="text-xs" style={{ color: '#94A3B8' }}>
                        {newFormDescription?.length}/200
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
                    {t('wizard.step3.customForms.templatesModal.createBlank')}
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>

              {/* Templates */}
              <div>
                <h3 className="text-lg mb-5" style={{ fontWeight: 600, color: '#FFFFFF' }}>
                  {t('wizard.step3.customForms.templatesModal.orChooseTemplate')}
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
                              {t('wizard.step3.customForms.actions.upgradeToPro')}
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
                            {t('wizard.step3.customForms.templatesModal.templateFieldsCount', { count: template.fieldsCount })}
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
                          {template.isFree ? t('wizard.step3.customForms.badges.free') : t('wizard.step3.customForms.badges.pro')}
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
                          {t('wizard.step3.customForms.templatesModal.useTemplate')}
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
                {t('wizard.step3.customForms.templatesModal.cancel')}
              </button>
            </div>
          </div>
        </div>
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
              {t('wizard.step3.customForms.upgradeModal.title')}
            </h2>
            <p className="text-base mb-6" style={{ color: '#6B7280' }}>
              {t('wizard.step3.customForms.upgradeModal.subtitle')}
            </p>
            <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '24px 0' }} />
            <div className="space-y-3 mb-8 text-left">
              {tList('wizard.step3.customForms.upgradeModal.features', []).map((feature, index) => (
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
              {t('wizard.step3.customForms.upgradeModal.cta')}
            </button>
            <button
              className="text-sm transition-colors hover:underline mb-2"
              style={{ color: '#0684F5', fontWeight: 500 }}
              onClick={() => {
                setShowUpgradeModal(false);
                navigate('/pricing');
              }}
            >
              {t('wizard.step3.customForms.upgradeModal.viewAll')}
            </button>
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="w-full h-10 rounded-lg text-sm transition-colors hover:bg-gray-100"
              style={{ color: '#6B7280', fontWeight: 600 }}
            >
              {t('wizard.step3.customForms.upgradeModal.maybeLater')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const AlertTriangle = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
