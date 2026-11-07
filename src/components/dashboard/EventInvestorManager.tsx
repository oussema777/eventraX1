import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  investorCapabilities,
  investorFailure,
  investorRpc,
  type AssignmentInventory,
} from '../../lib/investorReview';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../contexts/AuthContext';
import { investorDirectoryCopy } from './investorDirectoryCopy';
import { investorReviewCopy } from '../networking/investorReviewCopy';
import '../networking/InvestorReview.css';

type Attendee = { id: string; name: string; email: string };
type Invitation = {
  id: string;
  email: string;
  status: string;
  expires_at: string;
};
export default function EventInvestorManager({
  eventId,
  attendees,
  mode = 'all',
  onSaved,
}: {
  eventId: string;
  attendees: Attendee[];
  mode?: 'all' | 'invite' | 'assign' | 'invitations';
  onSaved?: () => void;
}) {
  const { locale } = useI18n();
  const c = investorReviewCopy[locale] || investorReviewCopy.en;
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [email, setEmail] = useState('');
  const [days, setDays] = useState(7);
  const [link, setLink] = useState('');
  const [attendeeId, setAttendeeId] = useState('');
  const [inventory, setInventory] = useState<AssignmentInventory | null>(null);
  const [choice, setChoice] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    setPage(0);
    setSearch('');
    setAttendeeId('');
    setLink('');
    setEmail('');
    setInventory(null);
    setChoice('');
    setMessage('');
    setError('');
  }, [user?.id, eventId]);
  const capabilities = useQuery({
    queryKey: ['investor-capabilities', eventId, user?.id],
    enabled: !!user,
    queryFn: () => investorCapabilities(eventId),
    retry: false,
  });
  const permitted =
    !!capabilities.data?.enabled && capabilities.data.can_designate;
  const invitations = useQuery({
    queryKey: ['investor-invitations', eventId, user?.id, page],
    enabled: permitted && !!user,
    queryFn: async () => {
      const { data, error: failure } = await supabase
        .from('event_investor_invitations')
        .select('id,email,status,expires_at')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
        .range(page * 20, page * 20 + 19);
      if (failure) throw failure;
      return data as Invitation[];
    },
  });
  if (!permitted) return null;
  const act = async (work: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await work();
    } catch (failure) {
      setError(c[investorFailure(failure) as keyof typeof c]);
      if (investorFailure(failure) === 'changed') setInventory(null);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section
      className="investor-review"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      aria-label={c.title}
    >
      {mode === 'all' && (
        <>
          <h2>
            <ShieldCheck
              size={21}
              style={{ display: 'inline', marginInlineEnd: 8 }}
            />
            {c.title}
          </h2>
          <p>
            {c.badgeHint} {c.reviewOnly}
          </p>
        </>
      )}
      {error && (
        <p
          role="alert"
          className="investor-review__notice investor-review__error"
        >
          {error}
        </p>
      )}
      {message && <p role="status">{message}</p>}
      <div className="investor-review__grid">
        {(mode === 'all' || mode === 'invite') && (
          <form
            className="investor-review__card"
            onSubmit={(e) => {
              e.preventDefault();
              void act(async () => {
                const result = await investorRpc<{ token: string }>(
                  'issue_event_investor_invitation',
                  {
                    p_event: eventId,
                    p_email: email,
                    p_expires_at: new Date(
                      Date.now() + days * 86400000
                    ).toISOString(),
                  }
                );
                setLink(
                  `${window.location.origin}/investor-invitation#token=${result.token}`
                );
                await queryClient.invalidateQueries({
                  queryKey: ['investor-invitations', eventId],
                });
              });
            }}
          >
            <h3>{c.invite}</h3>
            <p>{c.inviteHint}</p>
            <label>
              {c.email}
              <input
                type="email"
                required
                maxLength={254}
                value={email}
                disabled={busy}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setLink('');
                }}
              />
            </label>
            <label>
              {c.days}
              <select
                value={days}
                disabled={busy}
                onChange={(e) => setDays(Number(e.target.value))}
              >
                {[1, 7, 14].map((n) => (
                  <option key={n} value={n}>
                    {new Intl.NumberFormat(locale, {
                      style: 'unit',
                      unit: 'day',
                      unitDisplay: 'long',
                    }).format(n)}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="investor-review__primary"
              disabled={busy}
              type="submit"
            >
              <LinkIcon size={16} />
              {busy ? c.working : c.create}
            </button>
            {link && (
              <div className="investor-review__actions">
                <input
                  aria-label={c.copy}
                  value={link}
                  readOnly
                  onFocus={(e) => e.target.select()}
                />
                <button
                  type="button"
                  onClick={() =>
                    void act(async () => {
                      await navigator.clipboard.writeText(link);
                      setMessage(c.copied);
                    })
                  }
                >
                  {c.copy}
                </button>
              </div>
            )}
          </form>
        )}
        {(mode === 'all' || mode === 'assign') && (
          <div className="investor-review__card">
            <h3>{c.manual}</h3>
            {mode === 'assign' && (
              <label>
                {investorDirectoryCopy[locale].search}
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
            )}
            <label>
              {c.attendee}
              <select
                value={attendeeId}
                disabled={busy}
                onChange={(e) => {
                  setAttendeeId(e.target.value);
                  setInventory(null);
                  setChoice('');
                }}
              >
                <option value="">{c.selectPrompt}</option>
                {attendees
                  .filter(
                    (a) =>
                      a.id === attendeeId ||
                      `${a.name} ${a.email}`
                        .toLocaleLowerCase(locale)
                        .includes(search.trim().toLocaleLowerCase(locale))
                  )
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name || a.email}
                    </option>
                  ))}
              </select>
            </label>
            {!inventory ? (
              <button
                disabled={!attendeeId || busy}
                onClick={() =>
                  void act(async () => {
                    setInventory(
                      await investorRpc('preview_event_investor_assignment', {
                        p_event: eventId,
                        p_attendee: attendeeId,
                      })
                    );
                  })
                }
              >
                {c.inspect}
              </button>
            ) : (
              <>
                <div className="investor-review__meta">
                  <span>
                    {c.existing}: {inventory.scheduled_pending}
                  </span>
                  <span>
                    {c.matches}: {inventory.unscheduled_matches}
                  </span>
                  <span>
                    {c.confirmed}: {inventory.confirmed}
                  </span>
                </div>
                <p>{inventory.active ? c.removeHint : c.existingHint}</p>
                {!inventory.active && inventory.scheduled_pending > 0 && (
                  <fieldset disabled={busy}>
                    <legend>{c.existing}</legend>
                    {['preserve', 'review'].map((value) => (
                      <label key={value}>
                        <input
                          type="radio"
                          name="investor-existing"
                          value={value}
                          checked={choice === value}
                          onChange={() => setChoice(value)}
                        />
                        {c[value as 'preserve' | 'review']}
                      </label>
                    ))}
                  </fieldset>
                )}
                <div className="investor-review__actions">
                  <button
                    className="investor-review__primary"
                    disabled={
                      busy ||
                      (!inventory.active &&
                        inventory.scheduled_pending > 0 &&
                        !choice)
                    }
                    onClick={() =>
                      void act(async () => {
                        await investorRpc('set_event_investor', {
                          p_event: eventId,
                          p_attendee: attendeeId,
                          p_active: !inventory.active,
                          p_existing: choice || 'preserve',
                          p_expected: inventory,
                        });
                        setInventory(null);
                        setChoice('');
                        setMessage(c.saved);
                        await invitations.refetch();
                        await queryClient.invalidateQueries({
                          queryKey: ['event-investors', eventId],
                        });
                        await queryClient.invalidateQueries({
                          queryKey: ['investor-directory', eventId],
                        });
                        onSaved?.();
                      })
                    }
                  >
                    {busy ? c.working : inventory.active ? c.remove : c.assign}
                  </button>
                  <button disabled={busy} onClick={() => setInventory(null)}>
                    {c.cancel}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {(mode === 'all' || mode === 'invitations') &&
        !!invitations.data?.length && (
          <div className="investor-review__list">
            <h3>{c.invitations}</h3>
            {invitations.data.map((i) => (
              <div className="investor-review__row" key={i.id}>
                <div>
                  <strong dir="ltr">{i.email}</strong>
                  <p>
                    {i.status === 'accepted'
                      ? c.acceptedState
                      : i.status === 'revoked'
                        ? c.revoked
                        : Date.parse(i.expires_at) <= Date.now()
                          ? c.expired
                          : c.pending}
                  </p>
                </div>
                {i.status === 'pending' && (
                  <button
                    disabled={busy}
                    onClick={() =>
                      void act(async () => {
                        await investorRpc('revoke_event_investor_invitation', {
                          p_invitation: i.id,
                        });
                        setLink('');
                        await invitations.refetch();
                      })
                    }
                  >
                    {c.revoke}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      {(mode === 'all' || mode === 'invitations') &&
        (page > 0 || invitations.data?.length === 20) && (
          <nav className="investor-review__actions">
            <button
              disabled={!page || busy}
              onClick={() => setPage((p) => p - 1)}
            >
              {c.previous}
            </button>
            <span>{page + 1}</span>
            <button
              disabled={invitations.data?.length !== 20 || busy}
              onClick={() => setPage((p) => p + 1)}
            >
              {c.next}
            </button>
          </nav>
        )}
      {invitations.isError && (
        <p role="alert">
          {c.failed}
          <button onClick={() => void invitations.refetch()}>{c.retry}</button>
        </p>
      )}
    </section>
  );
}
