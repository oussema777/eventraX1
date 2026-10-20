import { Outlet, Link, useParams } from 'react-router-dom';
import { useEventAccess } from '../../hooks/useEventAccess';
import { canManageDetails } from '../../lib/eventAccess';
import { eventTeamCopy } from '../dashboard/eventTeamCopy';
import { useI18n } from '../../i18n/I18nContext';
import '../dashboard/EventTeam.css';

export default function EventEditorRoute() {
  const { eventId } = useParams();
  const { locale } = useI18n();
  const copy = eventTeamCopy[locale] || eventTeamCopy.en;
  const access = useEventAccess(eventId);
  if (!eventId || eventId === 'new') return <Outlet />;
  if (access.loading) return <div className="event-team-invitation"><p role="status">{copy.loading}</p></div>;
  if (!canManageDetails(access.role)) return <div className="event-team-invitation"><div className="event-team">
    <h1>{access.error ? copy.loadFailed : copy.denied}</h1><p>{copy.deniedHint}</p><Link to="/dashboard">{copy.dashboard}</Link>
  </div></div>;
  return <Outlet />;
}
