import { hasTransparency } from '../../utils/imageTransparency';
import { useLocalizedLabels } from '../../i18n/useLocalizedLabels';
import { useState } from 'react';
import { ArrowUpRight, Building2, Calendar, MessageCircle, Sparkles } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import './ParticipantCard.css';

// A label keeps its color when cards are filtered, sorted, or shown elsewhere.
function tagTone(label: string) {
  const normalized = label.trim().normalize('NFKC').toLocaleLowerCase('en');
  const hash = Array.from(normalized).reduce((value, char) => (value * 31 + char.codePointAt(0)!) >>> 0, 0);
  return ['mint', 'sky', 'lavender', 'amber', 'rose', 'teal'][hash % 6];
}

export default function ParticipantCard({ name, avatar, title, company, tags = [], score, reason, onView, onBook, onMessage, messagePending, bookLabel, className = '' }: {
  name: string; avatar?: string | null; title?: string | null; company?: string | null;
  tags?: string[]; score?: number; reason?: string; onView: () => void;
  onBook?: () => void; onMessage?: () => void; messagePending?: boolean; bookLabel?: string; className?: string;
}) {
  const { t } = useI18n();
  const { label: localizedLabel, matchReason } = useLocalizedLabels();
  const [failedAvatar, setFailedAvatar] = useState<string | null>(null);
  const [plainAvatar, setPlainAvatar] = useState<string | null>(null);
  const [transparentAvatar, setTransparentAvatar] = useState<string | null>(null);
  const visibleTags = [...new Set(tags.filter(tag => tag.trim()))].slice(0, 3);
  return <article className={`participant-card ${className}`}>
    <div className="participant-card__cover">
      <span className="participant-card__refraction" aria-hidden="true" />
      {score != null && <div className="participant-card__score networking-match-score" aria-label={t('networkingExperience.matchScore', { score })}>
        <Sparkles size={13} aria-hidden="true" /><strong>{score}%</strong><span>{t('networkingExperience.matchLabel')}</span>
      </div>}
      <button className="participant-card__profile" onClick={onView}>{t('eventImprovements.viewProfile')}<ArrowUpRight size={16} aria-hidden="true" /></button>
    </div>
    <div className="participant-card__top">
      <div className="participant-card__avatar" data-transparent={!!avatar && failedAvatar !== avatar && transparentAvatar === avatar} aria-hidden="true">
        {avatar && failedAvatar !== avatar ? <img key={`${avatar}:${plainAvatar === avatar}`} src={avatar} alt="" loading="lazy"
          crossOrigin={plainAvatar === avatar ? undefined : 'anonymous'}
          onLoad={e => setTransparentAvatar(hasTransparency(e.currentTarget) ? avatar : null)}
          onError={() => plainAvatar !== avatar ? setPlainAvatar(avatar) : setFailedAvatar(avatar)} />
          : name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase()}
      </div>
      <div className="participant-card__identity">
        <h3><button onClick={onView}>{name}</button></h3>
        {title && <p>{title}</p>}
      </div>
    </div>
    {(company || visibleTags.length > 0 || reason) && <div className="participant-card__details">
      {company && <div className="participant-card__company"><Building2 size={15} aria-hidden="true" /><span>{company}</span></div>}
      {visibleTags.length > 0 && <div className="participant-card__tags">{visibleTags.map(tag => <span key={tag} data-tone={tagTone(tag)}>{localizedLabel(tag)}</span>)}</div>}
      {reason && <div className="participant-card__reason"><span className="participant-card__reason-icon"><Sparkles size={17} aria-hidden="true" /></span><p>{matchReason(reason)}</p></div>}
    </div>}
    <div className="participant-card__footer">
      <div className="participant-card__actions">
        {onBook && <button className="participant-card__book" onClick={onBook}><Calendar size={17} /><span>{bookLabel || t('networking.people.requestMeeting')}</span><ArrowUpRight size={17} /></button>}
        {onMessage && <button className="participant-card__message" disabled={messagePending} onClick={onMessage} aria-label={t('eventImprovements.message')} title={t('eventImprovements.message')}><MessageCircle size={19} /></button>}
      </div>
    </div>
  </article>;
}
