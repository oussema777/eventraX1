import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import { supabase } from '../../lib/supabase';
import { investorCapabilities, investorRpc } from '../../lib/investorReview';
import { investorReviewCopy } from '../networking/investorReviewCopy';
import { investorPermissionsCopy } from './investorPermissionsCopy';
import '../networking/InvestorReview.css';

export default function EventReviewSettings({ eventId }: { eventId: string }) {
  const { user } = useAuth();
  const { locale } = useI18n();
  const c = investorReviewCopy[locale];
  const copy = investorPermissionsCopy[locale];
  const cache = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [review, setReview] = useState(false);
  const [designate, setDesignate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => {
    setSelected([]);
    setReview(false);
    setDesignate(false);
    setError('');
    setMessage('');
    setSearch('');
  }, [eventId, user?.id]);
  const capabilities = useQuery({
    queryKey: ['investor-capabilities', eventId, user?.id],
    enabled: !!user,
    queryFn: () => investorCapabilities(eventId),
  });
  const enabled =
    !!capabilities.data?.released && capabilities.data.can_configure;
  const team = useQuery({
    queryKey: ['review-team-settings', eventId, user?.id],
    enabled,
    queryFn: async () => {
      const [members, permissions, event] = await Promise.all([
        supabase
          .from('event_team_members')
          .select('user_id,role')
          .eq('event_id', eventId)
          .eq('status', 'active'),
        supabase
          .from('event_review_permissions')
          .select('user_id,can_review,can_designate')
          .eq('event_id', eventId),
        supabase
          .from('events')
          .select('owner_id,organizer_id')
          .eq('id', eventId)
          .single(),
      ]);
      if (members.error || permissions.error || event.error)
        throw members.error || permissions.error || event.error;
      const owner = event.data.owner_id || event.data.organizer_id;
      const staff = new Set(
        [
          user!.id,
          owner,
          ...(members.data || [])
            .filter((m) => ['administrator', 'coordinator'].includes(m.role))
            .map((m) => m.user_id),
        ].filter(Boolean)
      );
      const ids = [
        ...new Set([
          ...staff,
          ...(permissions.data || []).map((p) => p.user_id),
        ]),
      ];
      const { data: profiles, error: failure } = await supabase
        .from('profiles')
        .select('id,full_name,role')
        .in('id', ids);
      if (failure) throw failure;
      return {
        profiles: (profiles || []).map((p) => ({
          ...p,
          eligible: staff.has(p.id) || p.role === 'admin',
        })),
        permissions: permissions.data || [],
      };
    },
  });
  if (!enabled) return null;
  const refresh = async () => {
    await Promise.all([
      cache.invalidateQueries({ queryKey: ['investor-capabilities', eventId] }),
      cache.invalidateQueries({ queryKey: ['review-team-settings', eventId] }),
    ]);
  };
  const save = (id: string, canDesignate: boolean, canReview: boolean) =>
    investorRpc('set_event_review_permissions', {
      p_event: eventId,
      p_user: id,
      p_designate: canDesignate,
      p_review: canReview,
    });
  const act = async (work: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await work();
      setMessage(copy.saved);
    } catch {
      setError(c.failed);
    } finally {
      await refresh();
      setBusy(false);
    }
  };
  const grant = async () => {
    if (busy || !selected.length || (!review && !designate)) return;
    setBusy(true);
    setError('');
    setMessage('');
    const failed: string[] = [];
    // Keep other rights when adding permissions; each RPC rechecks authorization.
    for (const id of selected) {
      try {
        const { data: current, error: failure } = await supabase
          .from('event_review_permissions')
          .select('can_review,can_designate')
          .eq('event_id', eventId)
          .eq('user_id', id)
          .maybeSingle();
        if (failure) throw failure;
        await save(
          id,
          designate || !!current?.can_designate,
          review || !!current?.can_review
        );
      } catch {
        failed.push(id);
      }
    }
    setSelected(failed);
    if (failed.length) setError(copy.partial);
    else {
      setMessage(copy.saved);
      setReview(false);
      setDesignate(false);
    }
    await refresh();
    setBusy(false);
  };
  const eligible =
    team.data?.profiles.filter(
      (p) =>
        p.eligible &&
        (p.full_name || p.id)
          .toLocaleLowerCase(locale)
          .includes(search.toLocaleLowerCase(locale))
    ) || [];
  const assigned =
    team.data?.permissions.filter((p) => p.can_review || p.can_designate) || [];
  return (
    <section
      className="investor-review investor-review--settings"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      aria-label={c.permissions}
    >
      <h2>{c.permissions}</h2>
      <p>
        {c.settingsHint} {c.selfReview}
      </p>
      {error && (
        <p
          role="alert"
          className="investor-review__notice investor-review__error"
        >
          {error}
        </p>
      )}
      {message && <p role="status">{message}</p>}
      <button
        disabled={busy}
        onClick={() =>
          void act(() =>
            investorRpc('configure_event_review_policy', {
              p_event: eventId,
              p_enabled: !capabilities.data?.enabled,
            })
          )
        }
      >
        {capabilities.data?.enabled ? c.disableReview : c.enableReview}
      </button>
      {team.isLoading ? (
        <p role="status">{c.loading}</p>
      ) : team.isError ? (
        <p role="alert">
          {c.failed}
          <button onClick={() => void team.refetch()}>{c.retry}</button>
        </p>
      ) : (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void grant();
            }}
          >
            <h3>{copy.add}</h3>
            <p>{copy.hint}</p>
            <label>
              {copy.search}
              <input
                type="search"
                value={search}
                disabled={busy}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <fieldset
              className="investor-review__member-picker"
              disabled={busy}
            >
              <legend>
                {copy.members} - {selected.length} {copy.selected}
              </legend>
              {eligible.map((p) => (
                <label key={p.id}>
                  <input
                    type="checkbox"
                    checked={selected.includes(p.id)}
                    onChange={(e) =>
                      setSelected((ids) =>
                        e.target.checked
                          ? [...ids, p.id]
                          : ids.filter((id) => id !== p.id)
                      )
                    }
                  />
                  {p.full_name || p.id}
                </label>
              ))}
              {!eligible.length && <p>{copy.noMatches}</p>}
            </fieldset>
            <div className="investor-review__permission-options">
              <label>
                <input
                  type="checkbox"
                  checked={designate}
                  disabled={busy || !selected.length}
                  onChange={(e) => setDesignate(e.target.checked)}
                />
                {c.canDesignate}
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={review}
                  disabled={busy || !selected.length}
                  onChange={(e) => setReview(e.target.checked)}
                />
                {c.canReview}
              </label>
            </div>
            <button
              className="investor-review__primary"
              disabled={busy || !selected.length || (!review && !designate)}
              type="submit"
            >
              {busy ? c.working : c.savePermissions}
            </button>
          </form>
          <div className="investor-review__access-list">
            <h3>
              {copy.access} ({assigned.length})
            </h3>
            <p>{copy.editHint}</p>
            {!assigned.length ? (
              <p>{copy.empty}</p>
            ) : (
              assigned.map((permission) => {
                const profile = team.data?.profiles.find(
                  (p) => p.id === permission.user_id
                );
                const name = profile?.full_name || permission.user_id;
                return (
                  <article
                    className="investor-review__access-person"
                    key={permission.user_id}
                    aria-label={name}
                  >
                    <div>
                      <strong>{name}</strong>
                      {!profile?.eligible && <p>{copy.inactive}</p>}
                    </div>
                    <div className="investor-review__permission-options">
                      <label>
                        <input
                          type="checkbox"
                          checked={permission.can_designate}
                          disabled={busy || !profile?.eligible}
                          onChange={(e) =>
                            void act(() =>
                              save(
                                permission.user_id,
                                e.target.checked,
                                permission.can_review
                              )
                            )
                          }
                        />
                        {c.canDesignate}
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={permission.can_review}
                          disabled={busy || !profile?.eligible}
                          onChange={(e) =>
                            void act(() =>
                              save(
                                permission.user_id,
                                permission.can_designate,
                                e.target.checked
                              )
                            )
                          }
                        />
                        {c.canReview}
                      </label>
                    </div>
                    <button
                      disabled={busy}
                      onClick={() =>
                        void act(() => save(permission.user_id, false, false))
                      }
                    >
                      {copy.remove}
                    </button>
                  </article>
                );
              })
            )}
          </div>
        </>
      )}
    </section>
  );
}
