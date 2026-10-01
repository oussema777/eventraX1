import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { eventPublicPath, isEventSlug, suggestEventSlug } from '../../utils/eventLinks';
import type { EventDraft } from '../../hooks/useEventWizard';

interface Props {
  draft: EventDraft;
  onSave: (updates: Partial<EventDraft>) => Promise<EventDraft | null>;
}

export default function EventUrlSettings({ draft, onSave }: Props) {
  const [slug, setSlug] = useState(draft.seo_slug || '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => { setSlug(draft.seo_slug || ''); }, [draft.seo_slug]);
  const candidate = slug.trim().toLowerCase();
  const valid = !candidate || isEventSlug(candidate);
  const changed = candidate !== (draft.seo_slug || '');

  const save = async () => {
    if (!draft.id || !valid || busy) return;
    setBusy(true);
    setMessage('');
    try {
      if (candidate) {
        const { data, error } = await supabase.rpc('event_slug_available', {
          candidate, current_event_id: draft.id,
        });
        if (error) throw error;
        if (data !== true) {
          setMessage('That link is already reserved. Choose another name.');
          return;
        }
      }
      const saved = await onSave({ seo_slug: candidate || null });
      setMessage(saved ? 'Event link saved. Your previous links still work.' : 'The link could not be saved. Please try again or choose another name.');
    } catch {
      setMessage('We couldn’t check this link. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return <div className="space-y-3">
    <label htmlFor="event-url-slug" className="block text-sm font-medium text-[#6B7280]">Branded event link</label>
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-[#6B7280]">{window.location.origin}/event/</span>
      <input id="event-url-slug" value={slug} maxLength={80} disabled={busy}
        onChange={e => { setSlug(e.target.value); setMessage(''); }}
        placeholder="your-event-name" aria-describedby="event-url-help"
        className="flex-1 min-w-0 h-11 px-4 rounded-lg border text-[#0B2641]" />
      <button type="button" disabled={busy || !draft.name}
        onClick={() => { setSlug(suggestEventSlug(draft.name)); setMessage(''); }}
        className="px-3 h-11 rounded-lg border text-[#0B2641]">Use event name</button>
      <button type="button" disabled={busy || !draft.id || !valid || !changed} onClick={save}
        className="px-4 h-11 rounded-lg bg-[#0684F5] text-white disabled:opacity-50">
        {busy ? 'Saving…' : 'Save link'}
      </button>
    </div>
    <p id="event-url-help" className="text-sm text-[#6B7280]">
      Use 3–80 lowercase letters, numbers and hyphens. Leave blank to share the ID link.
      Existing links keep working, including after you change this name. No need to republish.
    </p>
    {!valid && <p role="alert" className="text-sm text-red-600">Enter a name with 3–80 letters or numbers, separated by single hyphens.</p>}
    {message && <p role="status" className="text-sm text-[#0B2641]">{message}</p>}
    {draft.id && <div className="text-sm text-[#6B7280] break-all">
      Saved link: <a className="text-[#0684F5] underline" href={eventPublicPath({ ...draft, id: draft.id })} target="_blank" rel="noreferrer">
        {window.location.origin}{eventPublicPath({ ...draft, id: draft.id })}
      </a>
      <p>ID link: {window.location.origin}/event/{draft.id}/landing</p>
    </div>}
  </div>;
}
