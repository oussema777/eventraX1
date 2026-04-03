import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';
import { sanitizeError } from '../utils/errorHandler';

export interface BusinessOffering {
  id: string;
  business_id: string;
  type: 'product' | 'service';
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  quantity_total?: number | null;
  is_unlimited?: boolean;
  tags?: string[];
  images?: string[];
}

const OFFERINGS_COLUMNS = 'id, business_id, type, name, description, price, currency, quantity_total, is_unlimited, tags, images, created_at';

async function fetchOfferingsData(businessId: string): Promise<{ offerings: BusinessOffering[]; localOnly: boolean }> {
  const { data, error } = await supabase
    .from('business_offerings')
    .select(OFFERINGS_COLUMNS)
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) {
    if (error.code === 'PGRST205') {
      const raw = window.localStorage.getItem(`eventra_business_offerings_${businessId}`);
      return { offerings: raw ? JSON.parse(raw) : [], localOnly: true };
    }
    throw error;
  }

  window.sessionStorage.setItem(`eventra_business_offerings_${businessId}`, JSON.stringify(data || []));
  return { offerings: data || [], localOnly: false };
}

export function useBusinessOfferings(businessId: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ['business-offerings', businessId];
  const [isSaving, setIsSaving] = useState(false);
  const [useLocalOnly, setUseLocalOnly] = useState(false);
  const storageKey = `eventra_business_offerings_${businessId || 'local'}`;

  const { data: offerings = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await fetchOfferingsData(businessId!);
      if (result.localOnly) setUseLocalOnly(true);
      return result.offerings;
    },
    enabled: !!businessId,
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

      if (useLocalOnly) {
        const localItem: BusinessOffering = {
          id: `local-offering-${Date.now()}`,
          business_id: businessId,
          ...offering
        };
        queryClient.setQueryData(queryKey, (old: BusinessOffering[] | undefined) => {
          const next = [localItem, ...(old || [])];
          window.localStorage.setItem(storageKey, JSON.stringify(next));
          return next;
        });
        toast.success('Offering added');
        return localItem;
      }

      const { data, error } = await supabase
        .from('business_offerings')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey });
      toast.success('Offering added');
      return data;
    } catch (error: any) {
      console.error('Error adding offering:', error);
      toast.error(sanitizeError(error, 'Failed to save offering'));
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteOffering = async (id: string) => {
    try {
      if (useLocalOnly) {
        queryClient.setQueryData(queryKey, (old: BusinessOffering[] | undefined) => {
          const next = (old || []).filter(o => o.id !== id);
          window.localStorage.setItem(storageKey, JSON.stringify(next));
          return next;
        });
        toast.success('Offering removed');
        return;
      }
      const { error } = await supabase.from('business_offerings').delete().eq('id', id);
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey });
      toast.success('Offering removed');
    } catch (error: any) {
      toast.error('Failed to delete offering');
    }
  };

  return {
    offerings,
    setOfferings,
    isLoading,
    isSaving,
    fetchOfferings: () => queryClient.invalidateQueries({ queryKey }),
    addOffering,
    deleteOffering
  };
}
