import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Eye,
  Landmark,
  Link2,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  UserPlus,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import {
  investorCapabilities,
  investorFailure,
  investorRpc,
} from '../../lib/investorReview';
import { networkingTimeZone } from '../../utils/networkingSchedule';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../ui/dialog';
import EventInvestorManager from './EventInvestorManager';
import EventReviewSettings from './EventReviewSettings';
import InvestorReviewRequests from '../networking/InvestorReviewRequests';
import { investorReviewCopy } from '../networking/investorReviewCopy';
import { investorDirectoryCopy } from './investorDirectoryCopy';
import './EventInvestors.css';

type Attendee = {
  id: string;
  profile_id: string | null;
  name: string;
  email: string;
  company: string;
  status: string;
};
type Designation = { attendee_id: string; source: string; assigned_at: string };
type Invitation = {
  id: string;
  email: string;
  status: string;
  expires_at: string;
};
type Meeting = {
  id: string;
  attendee_a_id: string;
  attendee_b_id: string;
  start_at: string | null;
  end_at: string | null;
  status: string;
  location: string;
};
type View = 'directory' | 'invitations' | 'requests' | 'settings';

// Explicit ranges avoid silently truncating larger event directories at the API row limit.
async function allRows<T>(
  fetchPage: (
    start: number,
    end: number
  ) => PromiseLike<{ data: T[] | null; error: unknown }>
) {
  const rows: T[] = [];
  for (let start = 0; ; start += 500) {
    const { data, error } = await fetchPage(start, start + 499);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < 500) return rows;
  }
}

export default function EventInvestorsTab({ eventId }: { eventId: string }) {
  const { user } = useAuth();
  // Remount transient panels and secrets when identity or event changes.
  return <InvestorWorkspace key={`${eventId}:${user?.id}`} eventId={eventId} />;
}

function InvestorWorkspace({ eventId }: { eventId: string }) {
  const { user } = useAuth();
  const { locale } = useI18n();
  const c = investorDirectoryCopy[locale];
  const legacy = investorReviewCopy[locale];
  const cache = useQueryClient();
  const [params, setParams] = useSearchParams();
  const requestedView = params.get('investorView');
  const view: View = [
    'directory',
    'invitations',
    'requests',
    'settings',
  ].includes(requestedView || '')
    ? (requestedView as View)
    : 'directory';
  const setView = (next: View) =>
    setParams(
      (previous) => {
        const updated = new URLSearchParams(previous);
        updated.set('investorView', next);
        return updated;
      },
      { replace: true }
    );
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [invitePage, setInvitePage] = useState(0);
  const [add, setAdd] = useState<'choose' | 'invite' | 'assign' | null>(null);
  const [selected, setSelected] = useState<{
    id: string;
    view: 'profile' | 'meetings';
  } | null>(null);
  const [confirm, setConfirm] = useState<{
    kind: 'remove' | 'revoke';
    id: string;
    name: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const caps = useQuery({
    queryKey: ['investor-capabilities', eventId, user?.id],
    enabled: !!user,
    queryFn: () => investorCapabilities(eventId),
    retry: false,
  });
  const canManage = !!caps.data?.enabled && caps.data.can_designate;
  const canInviteRead =
    !!caps.data && (caps.data.can_configure || caps.data.can_designate);
  const directory = useQuery({
    queryKey: ['investor-directory', eventId, user?.id],
    enabled: !!user && !!caps.data?.released,
    queryFn: async () => {
      const [attendees, designations] = await Promise.all([
        allRows<Attendee>((a, b) =>
          supabase
            .from('event_attendees')
            .select('id,profile_id,name,email,company,status')
            .eq('event_id', eventId)
            .order('id')
            .range(a, b)
        ),
        allRows<Designation>((a, b) =>
          supabase
            .from('event_investor_designations')
            .select('attendee_id,source,assigned_at')
            .eq('event_id', eventId)
            .eq('active', true)
            .order('attendee_id')
            .range(a, b)
        ),
      ]);
      const byId = new Map(attendees.map((a) => [a.id, a]));
      const investors = designations.flatMap((d) => {
        const a = byId.get(d.attendee_id);
        return a ? [{ ...a, ...d }] : [];
      });
      return {
        attendees,
        investors: investors.sort((a, b) =>
          (a.name || a.email).localeCompare(b.name || b.email, locale)
        ),
      };
    },
  });
  const invitations = useQuery({
    queryKey: ['investor-invitations', eventId, user?.id, 'directory'],
    enabled: !!user && canInviteRead && !!caps.data?.released,
    queryFn: () =>
      allRows<Invitation>((a, b) =>
        supabase
          .from('event_investor_invitations')
          .select('id,email,status,expires_at')
          .eq('event_id', eventId)
          .order('created_at', { ascending: false })
          .order('id')
          .range(a, b)
      ),
  });
  const meetings = useQuery({
    queryKey: ['investor-directory-meetings', eventId, user?.id],
    enabled: !!user && !!caps.data?.released,
    queryFn: async () => {
      const [items, event, venue] = await Promise.all([
        allRows<Meeting>((a, b) =>
          supabase
            .from('event_b2b_meetings')
            .select(
              'id,attendee_a_id,attendee_b_id,start_at,end_at,status,location'
            )
            .eq('event_id', eventId)
            .not('start_at', 'is', null)
            .order('start_at')
            .order('id')
            .range(a, b)
        ),
        supabase.from('events').select('timezone').eq('id', eventId).single(),
        supabase
          .from('event_b2b_settings')
          .select('venue_config')
          .eq('event_id', eventId)
          .maybeSingle(),
      ]);
      if (event.error || venue.error) throw event.error || venue.error;
      return {
        items,
        zone: networkingTimeZone(
          eventId,
          venue.data?.venue_config,
          event.data?.timezone
        ),
      };
    },
  });
  useEffect(() => {
    setPage(0);
  }, [search]);
  const refresh = async () => {
    await Promise.all([
      cache.invalidateQueries({ queryKey: ['investor-directory', eventId] }),
      cache.invalidateQueries({ queryKey: ['investor-invitations', eventId] }),
      cache.invalidateQueries({
        queryKey: ['investor-directory-meetings', eventId],
      }),
      cache.invalidateQueries({ queryKey: ['event-investors', eventId] }),
      cache.invalidateQueries({ queryKey: ['investor-capabilities', eventId] }),
    ]);
  };
  const investors = directory.data?.investors || [];
  const filtered = investors.filter((a) =>
    `${a.name} ${a.email} ${a.company}`
      .toLocaleLowerCase(locale)
      .includes(search.trim().toLocaleLowerCase(locale))
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 15));
  const currentPage = Math.min(page, pages - 1);
  const invitePages = Math.max(
    1,
    Math.ceil((invitations.data?.length || 0) / 15)
  );
  const currentInvitePage = Math.min(invitePage, invitePages - 1);
  const investor = selected
    ? investors.find((a) => a.id === selected.id)
    : undefined;
  const personMeetings = (id: string) =>
    meetings.data?.items.filter(
      (m) => m.attendee_a_id === id || m.attendee_b_id === id
    ) || [];
  const meetingLabel = (status: string) =>
    ({
      confirmed: c.confirmed,
      cancelled: c.cancelled,
      completed: c.completed,
      pending: c.meetingPending,
    })[status] || status;
  const inviteStatus = (i: Invitation) =>
    i.status === 'pending' && Date.parse(i.expires_at) <= Date.now()
      ? 'expired'
      : i.status;
  const inviteLabel = (status: string) =>
    ({
      accepted: c.accepted,
      revoked: c.revoked,
      expired: c.expired,
      pending: c.pending,
    })[status] || status;
  const date = (value: string, time = false) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      ...(time
        ? {
            timeStyle: 'short' as const,
            timeZone: meetings.data?.zone || 'UTC',
          }
        : {}),
    }).format(new Date(value));
  const pending =
    invitations.data?.filter((i) => inviteStatus(i) === 'pending').length || 0;
  const ids = new Set(investors.map((a) => a.id));
  const scheduled =
    meetings.data?.items.filter(
      (m) =>
        ['pending', 'confirmed'].includes(m.status) &&
        (ids.has(m.attendee_a_id) || ids.has(m.attendee_b_id))
    ).length || 0;
  const empty = (title: string, hint?: string) => (
    <div className="investors-empty">
      <Landmark size={30} />
      <h3>{title}</h3>
      {hint && <p>{hint}</p>}
    </div>
  );
  const failure = (retry: () => void) => (
    <div className="investors-feedback" role="alert">
      {c.failed}
      <button onClick={retry}>{c.retry}</button>
    </div>
  );
  const pager = (index: number, total: number, change: (n: number) => void) =>
    total > 1 && (
      <nav
        className="investors-pagination"
        aria-label={view === 'invitations' ? c.invitations : c.directory}
      >
        <span>
          {c.page} {index + 1} {c.of} {total}
        </span>
        <button disabled={!index} onClick={() => change(index - 1)}>
          {c.previous}
        </button>
        <button disabled={index + 1 >= total} onClick={() => change(index + 1)}>
          {c.next}
        </button>
      </nav>
    );
  const runConfirmed = async () => {
    if (!confirm || busy || !canManage) return;
    setBusy(true);
    setError('');
    try {
      if (confirm.kind === 'remove')
        await investorRpc('set_event_investor', {
          p_event: eventId,
          p_attendee: confirm.id,
          p_active: false,
        });
      else
        await investorRpc('revoke_event_investor_invitation', {
          p_invitation: confirm.id,
        });
      setNotice(confirm.kind === 'remove' ? c.saved : c.revoked);
      setConfirm(null);
      setSelected(null);
      await refresh();
    } catch (e) {
      setError(legacy[investorFailure(e) as keyof typeof legacy]);
    } finally {
      setBusy(false);
    }
  };
  if (caps.isLoading)
    return (
      <div className="investors-workspace" role="status">
        {c.loading}
      </div>
    );
  if (caps.isError)
    return (
      <div className="investors-workspace">
        {failure(() => void caps.refetch())}
      </div>
    );
  if (!caps.data?.released)
    return (
      <div className="investors-workspace">{empty(c.title, c.unavailable)}</div>
    );

  return (
    <section
      className="investors-workspace"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <header className="investors-heading">
        <div>
          <span className="investors-eyebrow">
            <Landmark size={15} />
            {c.title}
          </span>
          <h1>{c.title}</h1>
          <p>{c.subtitle}</p>
        </div>
        <div className="investors-actions">
          <button
            aria-label={c.refresh}
            disabled={directory.isFetching || invitations.isFetching}
            onClick={() => void refresh()}
          >
            <RefreshCw size={17} />
          </button>
          {canManage && (
            <button
              className="investors-primary"
              onClick={() => setAdd('choose')}
            >
              <Plus size={18} />
              {c.add}
            </button>
          )}
        </div>
      </header>
      <div className="investors-metrics">
        <div>
          <strong>{directory.isError ? '—' : investors.length}</strong>
          <span>{c.active}</span>
        </div>
        {canInviteRead && (
          <div>
            <strong>{invitations.isError ? '—' : pending}</strong>
            <span>{c.awaiting}</span>
          </div>
        )}
        <div>
          <strong>{meetings.isError ? '—' : scheduled}</strong>
          <span>{c.scheduled}</span>
        </div>
      </div>
      <nav className="investors-tabs" aria-label={c.title}>
        {(['directory', 'invitations', 'requests', 'settings'] as View[])
          .filter((v) => v !== 'invitations' || canInviteRead)
          .map((v) => (
            <button
              key={v}
              aria-current={view === v ? 'page' : undefined}
              onClick={() => {
                setView(v);
                setNotice('');
              }}
            >
              {c[v]}
              {v === 'directory' && <span>{investors.length}</span>}
              {v === 'invitations' && pending > 0 && <span>{pending}</span>}
            </button>
          ))}
      </nav>
      {notice && (
        <p className="investors-feedback" role="status">
          {notice}
        </p>
      )}
      {!caps.data.enabled && view !== 'settings' && (
        <div className="investors-setup">
          <Settings2 size={22} />
          <div>
            <h2>{c.disabled}</h2>
            <p>{c.disabledHint}</p>
          </div>
          {caps.data.can_configure && (
            <button onClick={() => setView('settings')}>
              {c.openSettings}
            </button>
          )}
        </div>
      )}
      {view === 'directory' && (
        <div className="investors-panel">
          <div className="investors-toolbar">
            <h2>{c.directory}</h2>
            <label className="investors-search">
              <Search size={17} />
              <input
                aria-label={c.search}
                placeholder={c.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>
          {directory.isLoading ? (
            <p className="investors-padding" role="status">
              {c.loading}
            </p>
          ) : directory.isError ? (
            failure(() => void directory.refetch())
          ) : !investors.length ? (
            <>
              {empty(c.empty, c.emptyHint)}
              {canManage && (
                <div className="investors-empty-action">
                  <button
                    className="investors-primary"
                    onClick={() => setAdd('choose')}
                  >
                    <Plus size={17} />
                    {c.add}
                  </button>
                </div>
              )}
            </>
          ) : !filtered.length ? (
            <>
              {empty(c.noResults)}
              <div className="investors-empty-action">
                <button onClick={() => setSearch('')}>{c.clear}</button>
              </div>
            </>
          ) : (
            <div className="investors-table-scroll">
              <table className="investors-directory-table">
                <thead>
                  <tr>
                    <th>{c.investor}</th>
                    <th>{c.company}</th>
                    <th>{c.source}</th>
                    <th>{c.meetings}</th>
                    <th>{c.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered
                    .slice(currentPage * 15, currentPage * 15 + 15)
                    .map((a) => (
                      <tr key={a.id}>
                        <td>
                          <div className="investors-person">
                            <span
                              className="investors-avatar"
                              aria-hidden="true"
                            >
                              {(a.name || a.email || '?')
                                .slice(0, 1)
                                .toUpperCase()}
                            </span>
                            <div>
                              <button
                                className="investors-name"
                                onClick={() =>
                                  setSelected({ id: a.id, view: 'profile' })
                                }
                              >
                                {a.name || a.email}
                              </button>
                              <small dir="ltr">{a.email}</small>
                            </div>
                          </div>
                        </td>
                        <td data-label={c.company}>{a.company || '—'}</td>
                        <td data-label={c.source}>
                          <span className="investors-tag">
                            {a.source === 'manual' ? c.manual : c.invitation}
                          </span>
                        </td>
                        <td data-label={c.meetings}>
                          {meetings.isError
                            ? '—'
                            : personMeetings(a.id).filter((m) =>
                                ['confirmed', 'pending'].includes(m.status)
                              ).length}
                        </td>
                        <td>
                          <div className="investors-row-actions">
                            <button
                              aria-label={`${c.view}: ${a.name || a.email}`}
                              onClick={() =>
                                setSelected({ id: a.id, view: 'profile' })
                              }
                            >
                              <Eye size={15} />
                              {c.view}
                            </button>
                            <button
                              aria-label={`${c.viewMeetings}: ${a.name || a.email}`}
                              onClick={() =>
                                setSelected({ id: a.id, view: 'meetings' })
                              }
                            >
                              <CalendarDays size={15} />
                              {c.meetings}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
          {pager(currentPage, pages, setPage)}
        </div>
      )}
      {view === 'invitations' && canInviteRead && (
        <div className="investors-panel">
          <div className="investors-toolbar">
            <div>
              <h2>{c.invitations}</h2>
              <p>{c.pendingHint}</p>
            </div>
            {canManage && (
              <button onClick={() => setAdd('invite')}>
                <Link2 size={16} />
                {c.invite}
              </button>
            )}
          </div>
          {invitations.isLoading ? (
            <p role="status" className="investors-padding">
              {legacy.loading}
            </p>
          ) : invitations.isError ? (
            failure(() => void invitations.refetch())
          ) : !invitations.data?.length ? (
            empty(c.noInvites, c.noInvitesHint)
          ) : (
            <div className="investors-table-scroll">
              <table className="investors-invitation-table">
                <thead>
                  <tr>
                    <th>{c.email}</th>
                    <th>{c.status}</th>
                    <th>{c.expires}</th>
                    <th>{c.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.data
                    .slice(currentInvitePage * 15, currentInvitePage * 15 + 15)
                    .map((i) => (
                      <tr key={i.id}>
                        <td dir="ltr">{i.email}</td>
                        <td>
                          <span
                            className={`investors-tag investors-tag--${inviteStatus(i)}`}
                          >
                            {inviteLabel(inviteStatus(i))}
                          </span>
                        </td>
                        <td data-label={c.expires}>{date(i.expires_at)}</td>
                        <td>
                          {i.status === 'pending' && canManage ? (
                            <button
                              onClick={() => {
                                setError('');
                                setConfirm({
                                  kind: 'revoke',
                                  id: i.id,
                                  name: i.email,
                                });
                              }}
                            >
                              {c.revoke}
                            </button>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
          {pager(currentInvitePage, invitePages, setInvitePage)}
        </div>
      )}
      {view === 'requests' &&
        (caps.data.can_review && caps.data.enabled ? (
          <InvestorReviewRequests eventId={eventId} reviewer />
        ) : (
          empty(c.noReviewer, c.noPermission)
        ))}
      {view === 'settings' &&
        (caps.data.can_configure ? (
          <EventReviewSettings eventId={eventId} />
        ) : (
          empty(c.settings, c.noConfigure)
        ))}
      <Dialog
        open={!!add && canManage}
        onOpenChange={(open) => {
          if (!open) setAdd(null);
        }}
      >
        <DialogContent
          className="investors-dialog"
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
        >
          <DialogTitle>
            {add === 'invite'
              ? c.invite
              : add === 'assign'
                ? c.existing
                : c.add}
          </DialogTitle>
          <DialogDescription>{c.addHint}</DialogDescription>
          {add === 'choose' ? (
            <div className="investors-choices">
              <button onClick={() => setAdd('invite')}>
                <Link2 size={24} />
                <strong>{c.invite}</strong>
                <span>{c.inviteHint}</span>
                <ArrowUpRight size={18} />
              </button>
              <button onClick={() => setAdd('assign')}>
                <UserPlus size={24} />
                <strong>{c.existing}</strong>
                <span>{c.existingHint}</span>
                <ArrowUpRight size={18} />
              </button>
            </div>
          ) : (
            <>
              <button
                className="investors-back"
                onClick={() => setAdd('choose')}
              >
                <ArrowLeft size={16} />
                {c.back}
              </button>
              {add && (
                <EventInvestorManager
                  key={add}
                  eventId={eventId}
                  attendees={(directory.data?.attendees || []).filter(
                    (a) =>
                      a.profile_id &&
                      ['registered', 'approved'].includes(a.status) &&
                      !ids.has(a.id)
                  )}
                  mode={add}
                  onSaved={() => {
                    setAdd(null);
                    void refresh();
                  }}
                />
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!investor}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent
          className="investors-dialog investors-dialog--detail"
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
        >
          <DialogTitle>{investor?.name || investor?.email}</DialogTitle>
          <DialogDescription>
            {investor?.company || c.details}
          </DialogDescription>
          {investor && (
            <>
              <nav className="investors-tabs" aria-label={c.details}>
                {(['profile', 'meetings'] as const).map((v) => (
                  <button
                    key={v}
                    aria-current={selected?.view === v ? 'page' : undefined}
                    onClick={() => setSelected({ id: investor.id, view: v })}
                  >
                    {c[v]}
                  </button>
                ))}
              </nav>
              {selected?.view === 'profile' ? (
                <>
                  <dl className="investors-facts">
                    <div>
                      <dt>{c.email}</dt>
                      <dd dir="ltr">{investor.email || '—'}</dd>
                    </div>
                    <div>
                      <dt>{c.company}</dt>
                      <dd>{investor.company || '—'}</dd>
                    </div>
                    <div>
                      <dt>{c.source}</dt>
                      <dd>
                        {investor.source === 'manual' ? c.manual : c.invitation}{' '}
                        · {date(investor.assigned_at)}
                      </dd>
                    </div>
                  </dl>
                  <div className="investors-actions">
                    {investor.profile_id ? (
                      <Link
                        className="investors-button"
                        to={`/event/${eventId}/profile/${investor.profile_id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {c.openProfile}
                        <ArrowUpRight size={16} />
                      </Link>
                    ) : (
                      <p>{c.unlinked}</p>
                    )}
                    <button
                      onClick={() =>
                        setSelected({ id: investor.id, view: 'meetings' })
                      }
                    >
                      <CalendarDays size={16} />
                      {c.viewMeetings}
                    </button>
                  </div>
                  {canManage && (
                    <div className="investors-danger-zone">
                      <button
                        onClick={() => {
                          setError('');
                          setConfirm({
                            kind: 'remove',
                            id: investor.id,
                            name: investor.name || investor.email,
                          });
                        }}
                      >
                        {c.remove}
                      </button>
                    </div>
                  )}
                </>
              ) : meetings.isLoading ? (
                <p role="status">{legacy.loading}</p>
              ) : meetings.isError ? (
                failure(() => void meetings.refetch())
              ) : !personMeetings(investor.id).length ? (
                empty(c.noMeetings, c.noMeetingsHint)
              ) : (
                <>
                  <p className="investors-timezone">{meetings.data?.zone}</p>
                  <div className="investors-meeting-list">
                    {personMeetings(investor.id).map((m) => {
                      const other = directory.data?.attendees.find(
                        (a) =>
                          a.id ===
                          (m.attendee_a_id === investor.id
                            ? m.attendee_b_id
                            : m.attendee_a_id)
                      );
                      return (
                        <article key={m.id}>
                          <div>
                            <strong>
                              {other?.name || other?.email || c.unlinked}
                            </strong>
                            <span
                              className={`investors-tag investors-tag--${m.status}`}
                            >
                              {meetingLabel(m.status)}
                            </span>
                          </div>
                          <time dateTime={m.start_at!}>
                            {date(m.start_at!, true)}
                          </time>
                          {m.location && <p>{m.location}</p>}
                        </article>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!confirm}
        onOpenChange={(open) => {
          if (!open && !busy) setConfirm(null);
        }}
      >
        <DialogContent
          className="investors-dialog"
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
          onEscapeKeyDown={(e) => {
            if (busy) e.preventDefault();
          }}
          onPointerDownOutside={(e) => {
            if (busy) e.preventDefault();
          }}
        >
          <DialogTitle>
            {confirm?.kind === 'remove' ? c.remove : c.revoke}
          </DialogTitle>
          <DialogDescription>
            {confirm?.kind === 'remove' ? c.removeHint : c.revokeHint}
          </DialogDescription>
          <strong>{confirm?.name}</strong>
          {error && (
            <p role="alert" className="investors-feedback">
              {error}
            </p>
          )}
          <div className="investors-actions">
            <button disabled={busy} onClick={() => setConfirm(null)}>
              {c.cancel}
            </button>
            <button
              disabled={busy || !canManage}
              className="investors-destructive"
              onClick={() => void runConfirmed()}
            >
              {busy
                ? legacy.working
                : confirm?.kind === 'remove'
                  ? c.confirmRemove
                  : c.revoke}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
