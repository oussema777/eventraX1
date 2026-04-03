import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  isDefault: boolean;
  isActive: boolean;
  assignmentCriteria: string;
  assignmentValue?: string;
}

export interface AttendeeSettings {
  allowSelfCheckin: boolean;
  allowProfileEditing: boolean;
  sessionRegistration: boolean;
  b2bAccess: boolean;
  downloadAccess: boolean;
  publicDirectory: boolean;
  automatedEmails: boolean;
  smsNotifications: boolean;
  inAppNotifications: boolean;
  gdprCompliance: boolean;
  dataExportAccess: boolean;
  profileEditPerms: {
    contact: boolean;
    dietary: boolean;
    requirements: boolean;
    company: boolean;
  };
  emailTriggers: {
    registration: boolean;
    reminder: boolean;
    checkin: boolean;
    postEvent: boolean;
  };
  inAppTypes: {
    sessionStart: boolean;
    scheduleChanges: boolean;
    b2bReminders: boolean;
    networking: boolean;
  };
  additionalData: {
    companyName: boolean;
    jobTitle: boolean;
    industry: boolean;
    companySize: boolean;
    businessGoals: boolean;
    linkedin: boolean;
  };
  gdprSettings: {
    consent: boolean;
    deletion: boolean;
    privacy: boolean;
  };
}

const DEFAULT_SETTINGS: AttendeeSettings = {
  allowSelfCheckin: false,
  allowProfileEditing: true,
  sessionRegistration: false,
  b2bAccess: true,
  downloadAccess: true,
  publicDirectory: false,
  automatedEmails: true,
  smsNotifications: false,
  inAppNotifications: true,
  gdprCompliance: false,
  dataExportAccess: true,
  profileEditPerms: {
    contact: true,
    dietary: true,
    requirements: true,
    company: false
  },
  emailTriggers: {
    registration: true,
    reminder: true,
    checkin: true,
    postEvent: false
  },
  inAppTypes: {
    sessionStart: true,
    scheduleChanges: true,
    b2bReminders: true,
    networking: false
  },
  additionalData: {
    companyName: true,
    jobTitle: true,
    industry: true,
    companySize: true,
    businessGoals: true,
    linkedin: true
  },
  gdprSettings: {
    consent: true,
    deletion: true,
    privacy: true
  }
};

function mapCategory(cat: any): Category {
  return {
    id: cat.id,
    name: cat.name,
    description: cat.description || '',
    color: cat.color,
    icon: cat.icon || 'Users',
    isDefault: cat.is_default || false,
    isActive: cat.is_active !== false,
    assignmentCriteria: cat.assignment_criteria || 'manual',
    assignmentValue: cat.assignment_value
  };
}

const CATEGORIES_COLUMNS = 'id, name, description, color, icon, is_default, is_active, assignment_criteria, assignment_value';

async function fetchCategories(eventId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('event_attendee_categories')
    .select(CATEGORIES_COLUMNS)
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });

  if (error) {
    if (error.code === 'PGRST204' || error.code === '42P01') return [];
    throw error;
  }
  return (data || []).map(mapCategory);
}

async function fetchSettings(eventId: string): Promise<AttendeeSettings> {
  const { data, error } = await supabase
    .from('events')
    .select('attendee_settings')
    .eq('id', eventId)
    .maybeSingle();

  if (error) return DEFAULT_SETTINGS;
  if (data?.attendee_settings) {
    return { ...DEFAULT_SETTINGS, ...data.attendee_settings };
  }
  return DEFAULT_SETTINGS;
}

export function useAttendees(propsEventId?: string) {
  const { eventId: paramEventId } = useParams();
  const eventId = propsEventId || paramEventId;
  const queryClient = useQueryClient();
  const categoriesKey = ['attendee-categories', eventId];
  const settingsKey = ['attendee-settings', eventId];

  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: categoriesKey,
    queryFn: () => fetchCategories(eventId!),
    enabled: !!eventId,
  });

  const { data: settings = DEFAULT_SETTINGS, isLoading: settingsLoading } = useQuery({
    queryKey: settingsKey,
    queryFn: () => fetchSettings(eventId!),
    enabled: !!eventId,
  });

  const isLoading = catLoading || settingsLoading;

  const createCategory = async (category: Omit<Category, 'id'>) => {
    if (!eventId) return;
    try {
      const payload = {
        event_id: eventId,
        name: category.name,
        description: category.description,
        color: category.color,
        icon: category.icon,
        is_default: category.isDefault,
        is_active: category.isActive,
        assignment_criteria: category.assignmentCriteria,
        assignment_value: category.assignmentValue
      };

      const { data, error } = await supabase
        .from('event_attendee_categories')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: categoriesKey });
      queryClient.invalidateQueries({ queryKey: ['event-stats', eventId] });
      return data ? mapCategory(data) : undefined;
    } catch (err) {
      console.error('Error creating category:', err);
      throw err;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.color !== undefined) payload.color = updates.color;
      if (updates.icon !== undefined) payload.icon = updates.icon;
      if (updates.isDefault !== undefined) payload.is_default = updates.isDefault;
      if (updates.isActive !== undefined) payload.is_active = updates.isActive;
      if (updates.assignmentCriteria !== undefined) payload.assignment_criteria = updates.assignmentCriteria;
      if (updates.assignmentValue !== undefined) payload.assignment_value = updates.assignmentValue;

      const { error } = await supabase
        .from('event_attendee_categories')
        .update(payload)
        .eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: categoriesKey });
      queryClient.invalidateQueries({ queryKey: ['event-stats', eventId] });
    } catch (err) {
      console.error('Error updating category:', err);
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('event_attendee_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: categoriesKey });
      queryClient.invalidateQueries({ queryKey: ['event-stats', eventId] });
    } catch (err) {
      console.error('Error deleting category:', err);
      throw err;
    }
  };

  const updateSettings = async (newSettings: Partial<AttendeeSettings>) => {
    if (!eventId) return;
    const mergedSettings = { ...settings, ...newSettings };
    // Optimistic update
    queryClient.setQueryData(settingsKey, mergedSettings);

    try {
      const { error } = await supabase
        .from('events')
        .update({ attendee_settings: mergedSettings })
        .eq('id', eventId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating settings:', err);
      toast.error('Failed to save settings');
      // Revert on error
      queryClient.setQueryData(settingsKey, settings);
    }
  };

  return {
    categories,
    settings,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    updateSettings
  };
}
