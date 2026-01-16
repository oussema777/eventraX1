import { useAuth } from '../contexts/AuthContext';

export type PlanTier = 'free' | 'pro';

export function usePlan() {
  const { profile } = useAuth();
  const isPro = Boolean(profile?.has_pro);
  const isFree = !isPro;
  const plan: PlanTier = isPro ? 'pro' : 'free';

  return { plan, isPro, isFree };
}
