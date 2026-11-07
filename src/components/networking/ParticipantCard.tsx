import ParticipantBusinessIdentity from './ParticipantBusinessIdentity';
import type { ParticipantBusiness } from '../../hooks/useParticipantBusinesses';
import './ParticipantIdentity.css';
import { hasTransparency } from '../../utils/imageTransparency';
import { useLocalizedLabels } from '../../i18n/useLocalizedLabels';
import { useState } from 'react';
import { ArrowUpRight, Building2, Calendar, MessageCircle, Sparkles, Landmark } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import './ParticipantCard.css';
import { investorReviewCopy } from './investorReviewCopy';
import './InvestorReview.css';

// A label keeps its color when cards are filtered, sorted, or shown elsewhere.
function tagTone(label: string) {
  const normalized = label.trim().normalize('NFKC').toLocaleLowerCase('en');
  const hash = Array.from(normalized).reduce((value, char) => (value * 31 + char.codePointAt(0)!) >>> 0, 0);
  return ['mint', 'sky', 'lavender', 'amber', 'rose', 'teal'][hash % 6];
}

export default function ParticipantCard({ name, avatar, title, company, tags = [], score, reason, onView, onBook, onMessage, messagePending, bookLabel, className = '', investor = false, businesses = [] }: {
  name: string; avatar?: string | null; title?: string | null; company?: string | null;
  tags?: string[]; score?: number; reason?: string; onView: () => void;
  onBook?: () => void; onMessage?: () => void; messagePending?: boolean; bookLabel?: string; className?: string;
  investor?: boolean; businesses?: ParticipantBusiness[];
}) {
  const { t, locale } = useI18n();
  const { label: localizedLabel, matchReason } = useLocalizedLabels();
  const [failedAvatar, setFailedAvatar] = useState<string | null>(null);
  const [plainAvatar, setPlainAvatar] = useState<string | null>(null);
  const [transparentAvatar, setTransparentAvatar] = useState<string | null>(null);
  const visibleTags = [...new Set(tags.filter(tag => tag.trim()))].slice(0, 3);
  const showCompany = company && !businesses.some(b => b.company_name.trim().toLocaleLowerCase() === company.trim().toLocaleLowerCase());
  return <article className={`participant-card ${className}`} data-identity={investor ? 'investor' : businesses.length ? 'business' : 'attendee'}>
    <div className="participant-card__cover">
      <span className="participant-card__refraction" aria-hidden="true" />
      {investor && <span className="participant-card__investor-signature">{investorReviewCopy[locale].investor}</span>}
      {score != null && <div className="participant-card__match">
        {reason ? <details className="participant-card__match-details"><summary className="participant-card__score networking-match-score" aria-label={t('networkingExperience.matchScore', { score })}>
          <Sparkles size={13} aria-hidden="true"/><strong>{score}%</strong><span>{t('networkingExperience.matchLabel')}</span>
        </summary><p className="participant-card__match-explanation">{matchReason(reason)}</p></details> : <div className="participant-card__score networking-match-score" aria-label={t('networkingExperience.matchScore', { score })}><Sparkles size={13} aria-hidden="true"/><strong>{score}%</strong><span>{t('networkingExperience.matchLabel')}</span></div>}
      </div>}
      <button className="participant-card__profile" onClick={onView}>{t('eventImprovements.viewProfile')}<ArrowUpRight size={16} aria-hidden="true" /></button>
    </div>
    <div className="participant-card__top">
      <div className="participant-card__portrait"><div className="participant-card__avatar" data-transparent={!!avatar && failedAvatar !== avatar && transparentAvatar === avatar} aria-hidden="true">
        {avatar && failedAvatar !== avatar ? <img key={`${avatar}:${plainAvatar === avatar}`} src={avatar} alt="" loading="lazy"
          crossOrigin={plainAvatar === avatar ? undefined : 'anonymous'}
          onLoad={e => setTransparentAvatar(hasTransparency(e.currentTarget) ? avatar : null)}
          onError={() => plainAvatar !== avatar ? setPlainAvatar(avatar) : setFailedAvatar(avatar)} />
          : name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase()}
      </div>{(investor || businesses.length > 0) && <span className="participant-card__identity-seal" aria-hidden="true">{investor ? <Landmark size={13}/> : <Building2 size={13}/>}</span>}</div>
      <div className="participant-card__identity">
        <h3><button onClick={onView}>{name}</button></h3>
        {title && <p>{title}</p>}
      </div>
    </div>
    <div className="participant-card__affiliation">{businesses.length ? <ParticipantBusinessIdentity businesses={businesses}/> : showCompany ? <div className="participant-card__company"><Building2 size={15} aria-hidden="true"/><span title={company || undefined}>{company}</span></div> : null}</div>
    <div className="participant-card__details">
      {visibleTags.length > 0 && <div className="participant-card__tags">{visibleTags.map(tag => <span key={tag} data-tone={tagTone(tag)}>{localizedLabel(tag)}</span>)}</div>}
    </div>
    <div className="participant-card__footer">
      <div className="participant-card__actions">
        {onBook && <button className="participant-card__book" onClick={onBook}><Calendar size={17} /><span>{bookLabel || t('networking.people.requestMeeting')}</span><ArrowUpRight size={17} /></button>}
        {onMessage && <button className="participant-card__message" disabled={messagePending} onClick={onMessage} aria-label={t('eventImprovements.message')} title={t('eventImprovements.message')}><MessageCircle size={19} /></button>}
      </div>
    </div>
  </article>;
}
