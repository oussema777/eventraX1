import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { sanitizeError } from '../utils/errorHandler';
import { useI18n } from '../i18n/I18nContext';

export interface BusinessOffering {
  id: string;
  business_id: string;
  type: 'product' | 'service';
  name: string;
  description?: string;
  price?: number | null;
  currency?: string;
  quantity_total?: number | null;
  is_unlimited?: boolean;
  tags?: string[];
  images?: string[];
}

const OFFERINGS_COLUMNS = 'id, business_id, type, name, description, price, currency, quantity_total, is_unlimited, tags, images, created_at';

async function fetchOfferingsData(businessId: string): Promise<BusinessOffering[]> {
  const { data, error } = await supabase
    .from('business_offerings')
    .select(OFFERINGS_COLUMNS)
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  window.sessionStorage.setItem(`eventra_business_offerings_${businessId}`, JSON.stringify(data || []));
  return data || [];
}

export function useBusinessOfferings(businessId: string | null) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const queryKey = ['business-offerings', businessId];
  const [isSaving, setIsSaving] = useState(false);

  const { data: offerings = [], isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await fetchOfferingsData(businessId!);
      return result;
    },
    enabled: !!businessId,
    retry: 1,
  });

  const setOfferings = (updater: BusinessOffering[] | ((prev: BusinessOffering[]) => BusinessOffering[])) => {
    queryClient.setQueryData(queryKey, (old: BusinessOffering[] | undefined) => {
      if (typeof updater === 'function') return updater(old || []);
      return updater;
    });
  };

  const addOffering = async (offering: Omit<BusinessOffering, 'id' | 'business_id'>) => {
    if (!businessId) return null;
    setIsSaving(true);
    try {
      const payload = {
        ...offering,
        business_id: businessId
      };

      const { data, error } = await supabase
        .from('business_offerings')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey });
      toast.success(t('productsManagement.toasts.offeringSaved'));
      return data;
    } catch (error: any) {
      console.error('Error adding offering:', error);
      toast.error(sanitizeError(error, t('businessFlows.saveFailed')));
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteOffering = async (id: string) => {
    try {
      const { error } = await supabase.from('business_offerings').delete().eq('id', id);
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey });
      toast.success(t('productsManagement.toasts.offeringRemoved'));
    } catch (error: any) {
      toast.error(t('businessFlows.deleteFailed'));
    }
  };

  const updateOffering = async (id: string, updates: Partial<BusinessOffering>) => {
    if (!businessId || isSaving) return null;
    setIsSaving(true);
    try {
      const { data, error } = await supabase.from('business_offerings').update(updates)
        .eq('id', id).eq('business_id', businessId).select().single();
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey });
      toast.success(t('productsManagement.toasts.offeringSaved'));
      return data;
    } catch (error) {
      toast.error(sanitizeError(error, t('businessFlows.saveFailed')));
      return null;
    } finally { setIsSaving(false); }
  };

  return {
    offerings,
    error,
    setOfferings,
    isLoading,
    isSaving,
    fetchOfferings: refetch,
    addOffering,
    updateOffering,
    deleteOffering
  };
}
