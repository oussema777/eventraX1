import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nProvider, useI18n } from '../../src/i18n/I18nContext';
import ParticipantCard from '../../src/components/networking/ParticipantCard';
import '../../src/index.css';
import '../../src/components/networking/EventNetworkingPeople.css';

const people = [
  { name: 'Amira Mansour', title: 'Founder & CEO', company: 'Solar Works', tags: ['Energy', 'Investment', 'Technology'] },
  { name: 'Youssef Ben Ali', title: 'Director of International Partnerships', company: 'Atlas Ventures & Investment Group', tags: ['Finance', 'Investment'] },
  { name: 'Leila Trabelsi', title: 'Product Designer', company: 'Studio North', tags: ['Technology'] },
  { name: 'Nour Ben Youssef', title: 'Regional Director of Business Development & Strategic Partnerships', company: 'Mediterranean Innovation and Sustainable Investment Network', tags: ['Renewable Energy', 'Sustainable Development', 'International Trade'], score: 92, reason: 'Shared interests in Energy, Investment' },
  { name: 'Sami', tags: [], score: 85 },
  { name: 'ريم بن صالح', title: 'مديرة الشراكات وتطوير الأعمال', company: 'مجموعة آفاق للاستثمار والتنمية', tags: ['Technology', 'Investment'], score: 88, reason: 'Shared interests in Technology' },
];
function Review() {
  const { locale, setLocale } = useI18n();
  const [action, setAction] = useState('');
  return <main style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 20px', color: '#e0e9f3' }} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
    <header style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 24 }}><h1>Participant card review</h1><select aria-label="Language" style={{ color: '#15334d' }} value={locale} onChange={e => setLocale(e.target.value as any)}><option value="en">English</option><option value="fr">Français</option><option value="ar">العربية</option></select></header>
    <div className="networking-people-grid">{people.map(person => <ParticipantCard key={person.name} {...person} onView={() => setAction(`Profile: ${person.name}`)} onBook={() => setAction(`Meeting: ${person.name}`)} />)}</div>
    <p role="status" style={{ marginTop: 20 }}>{action}</p>
  </main>;
}
document.body.style.background = '#0b2641';
createRoot(document.getElementById('root')!).render(<I18nProvider><Review /></I18nProvider>);
