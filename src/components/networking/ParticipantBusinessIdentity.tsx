import { useState } from 'react';
import { ArrowUpRight, Building2 } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import type { ParticipantBusiness } from '../../hooks/useParticipantBusinesses';
import './ParticipantIdentity.css';

const copy={en:{business:'Business profile',more:'Other businesses'},fr:{business:'Profil entreprise',more:'Autres entreprises'},ar:{business:'ملف الشركة',more:'شركات أخرى'}};

function BusinessLink({business}:{business:ParticipantBusiness}) {
  const {locale}=useI18n();const c=copy[locale];const [failed,setFailed]=useState<string|null>(null);
  return <a className="participant-business" href={`/business/${business.id}`} aria-label={`${c.business}: ${business.company_name}`}>
    <span className="participant-business__logo" aria-hidden="true">{business.logo_url&&failed!==business.logo_url?<img src={business.logo_url} alt="" loading="lazy" onError={()=>setFailed(business.logo_url)}/>:<Building2 size={20}/>}</span>
    <span className="participant-business__text"><small>{c.business}</small><strong title={business.company_name}>{business.company_name}</strong></span><ArrowUpRight size={16} aria-hidden="true"/>
  </a>;
}

export default function ParticipantBusinessIdentity({businesses}:{businesses:ParticipantBusiness[]}) {
  const {locale}=useI18n();if(!businesses.length)return null;
  return <div className="participant-businesses"><BusinessLink business={businesses[0]}/>{businesses.length>1&&<details className="participant-businesses__more"><summary aria-label={copy[locale].more} title={copy[locale].more}>+{businesses.length-1}</summary><div>{businesses.slice(1).map(b=><BusinessLink key={b.id} business={b}/>)}</div></details>}</div>;
}
