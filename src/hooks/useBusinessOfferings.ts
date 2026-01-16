import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';

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

export function useBusinessOfferings(businessId: string | null) {
  const [offerings, setOfferings] = useState<BusinessOffering[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [useLocalOnly, setUseLocalOnly] = useState(false);
  const storageKey = `eventra_business_offerings_${businessId || 'local'}`;

  const fetchOfferings = async () => {
    if (!businessId) return;
    try {
      setIsLoading(true);
      if (useLocalOnly) {
        const raw = window.localStorage.getItem(storageKey);
        setOfferings(raw ? JSON.parse(raw) : []);
        return;
      }
      const { data, error } = await supabase
        .from('business_offerings')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST205') {
          setUseLocalOnly(true);
          const raw = window.localStorage.getItem(storageKey);
          setOfferings(raw ? JSON.parse(raw) : []);
          return;
        }
        throw error;
      }
      setOfferings(data || []);
      window.localStorage.setItem(storageKey, JSON.stringify(data || []));
    } catch (error: any) {
      console.error('Error fetching offerings:', error);
    } finally {
      setIsLoading(false);
    }
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
        setOfferings(prev => {
          const next = [localItem, ...prev];
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
      setOfferings(prev => [data, ...prev]);
      toast.success('Offering added');
      return data;
    } catch (error: any) {
      console.error('Error adding offering:', error);
      toast.error(error.message);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteOffering = async (id: string) => {
    try {
      if (useLocalOnly) {
        setOfferings(prev => {
          const next = prev.filter(o => o.id !== id);
          window.localStorage.setItem(storageKey, JSON.stringify(next));
          return next;
        });
        toast.success('Offering removed');
        return;
      }
      const { error } = await supabase.from('business_offerings').delete().eq('id', id);
      if (error) throw error;
      setOfferings(prev => prev.filter(o => o.id !== id));
      toast.success('Offering removed');
    } catch (error: any) {
      toast.error('Failed to delete offering');
    }
  };

  return {
    offerings,
    setOfferings, // Allow manual update if needed
    isLoading,
    isSaving,
    fetchOfferings,
    addOffering,
    deleteOffering
  };
}
