import { useEffect, useMemo, useRef, useState } from 'react';
import * as L from 'leaflet';
import { toast } from 'sonner@2.0.3';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';
import NavbarLoggedOut from '../components/navigation/NavbarLoggedOut';
import ModalLogin from '../components/modals/ModalLogin';
import ModalRegistrationEntry from '../components/modals/ModalRegistrationEntry';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';

type Port = {
  id: string;
  name: string;
  lat?: number;
  lon?: number;
};

type ContainerLine = {
  id: string;
  type: '20std' | '40std' | '40hc';
  qty: number;
};

const LOGISTICS_API_BASE = import.meta.env.VITE_LOGISTICS_API_BASE || '';
const PORTS_ENDPOINT = LOGISTICS_API_BASE ? `${LOGISTICS_API_BASE}/ports` : '';
const QUOTE_ENDPOINT = LOGISTICS_API_BASE ? `${LOGISTICS_API_BASE}/quote` : '';
const PORTS_PAGE_SIZE = 50;

const CONTAINER_TYPES = [
  { id: '20std', label: "20' Standard" },
  { id: '40std', label: "40' Standard" },
  { id: '40hc', label: "40' High Cube" }
] as const;

const CURRENCIES = ['USD', 'EUR', 'TND'];

export default function ContainerShippingCostsPage() {
  const { user, profile, signOut } = useAuth();
  const { t } = useI18n();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState<Port[]>([]);
  const [toSuggestions, setToSuggestions] = useState<Port[]>([]);
  const [fromLoading, setFromLoading] = useState(false);
  const [toLoading, setToLoading] = useState(false);
  const [fromHasMore, setFromHasMore] = useState(true);
  const [toHasMore, setToHasMore] = useState(true);
  const [fromOffset, setFromOffset] = useState(0);
  const [toOffset, setToOffset] = useState(0);
  const [fromPort, setFromPort] = useState<Port | null>(null);
  const [toPort, setToPort] = useState<Port | null>(null);
  const [fromCoords, setFromCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [toCoords, setToCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [activePin, setActivePin] = useState<'from' | 'to'>('from');
  const [containers, setContainers] = useState<ContainerLine[]>([
    { id: 'line-1', type: '20std', qty: 1 }
  ]);
  const [currency, setCurrency] = useState('USD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteResult, setQuoteResult] = useState<any | null>(null);

  const canSubmit = useMemo(() => {
    return (fromQuery.trim() || fromPort) && (toQuery.trim() || toPort) && containers.length > 0;
  }, [fromQuery, fromPort, toQuery, toPort, containers]);

  const fromFetchIdRef = useRef(0);
  const toFetchIdRef = useRef(0);

  const fetchPorts = async (
    query: string,
    setter: (ports: Port[]) => void,
    allowEmpty = false,
    field: 'from' | 'to' = 'from',
    offset = 0,
    append = false
  ) => {
    if (!PORTS_ENDPOINT || (!query.trim() && !allowEmpty)) {
      setter([]);
      return;
    }
    const fetchId = field === 'from' ? ++fromFetchIdRef.current : ++toFetchIdRef.current;
    if (field === 'from') {
      setFromLoading(true);
    } else {
      setToLoading(true);
    }
    try {
      const params = new URLSearchParams({
        limit: String(PORTS_PAGE_SIZE),
        offset: String(offset)
      });
      if (query.trim()) params.set('q', query.trim());
      const url = `${PORTS_ENDPOINT}?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok || data?.ok === false) throw new Error(data?.error || t('logisticsTools.errors.portsFailed'));
      const latest = field === 'from' ? fetchId === fromFetchIdRef.current : fetchId === toFetchIdRef.current;
      if (latest) {
        const next = data?.data || [];
        setter(prev => (append ? [...prev, ...next] : next));
        const hasMore = Boolean(data?.meta?.hasMore);
        if (field === 'from') {
          setFromHasMore(hasMore);
          setFromOffset(offset + next.length);
        } else {
          setToHasMore(hasMore);
          setToOffset(offset + next.length);
        }
      }
    } catch (error: any) {
      toast.error(error.message || t('logisticsTools.errors.portsFailed'));
      const latest = field === 'from' ? fetchId === fromFetchIdRef.current : fetchId === toFetchIdRef.current;
      if (latest) {
        setter([]);
      }
    } finally {
      const latest = field === 'from' ? fetchId === fromFetchIdRef.current : fetchId === toFetchIdRef.current;
      if (latest) {
        if (field === 'from') {
          setFromLoading(false);
        } else {
          setToLoading(false);
        }
      }
    }
  };

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setFromOffset(0);
      setFromHasMore(true);
      fetchPorts(fromQuery, setFromSuggestions, false, 'from', 0, false);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [fromQuery]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setToOffset(0);
      setToHasMore(true);
      fetchPorts(toQuery, setToSuggestions, false, 'to', 0, false);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [toQuery]);

  useEffect(() => {
    if (!quoteResult?.route) return;
    if (!fromCoords && quoteResult.route.from?.lat && quoteResult.route.from?.lon) {
      setFromCoords({ lat: Number(quoteResult.route.from.lat), lon: Number(quoteResult.route.from.lon) });
    }
    if (!toCoords && quoteResult.route.to?.lat && quoteResult.route.to?.lon) {
      setToCoords({ lat: Number(quoteResult.route.to.lat), lon: Number(quoteResult.route.to.lon) });
    }
    if (!fromQuery.trim() && quoteResult.from) {
      setFromQuery(String(quoteResult.from));
    }
    if (!toQuery.trim() && quoteResult.to) {
      setToQuery(String(quoteResult.to));
    }
  }, [quoteResult, fromCoords, toCoords, fromQuery, toQuery]);

  const applyPort = (port: Port, target: 'from' | 'to') => {
    if (target === 'from') {
      setFromPort(port);
      setFromQuery(port.name);
      setFromSuggestions([]);
      if (port.lat != null && port.lon != null) {
        setFromCoords({ lat: Number(port.lat), lon: Number(port.lon) });
      }
    } else {
      setToPort(port);
      setToQuery(port.name);
      setToSuggestions([]);
      if (port.lat != null && port.lon != null) {
        setToCoords({ lat: Number(port.lat), lon: Number(port.lon) });
      }
    }
  };

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const fromMarkerRef = useRef<L.CircleMarker | null>(null);
  const toMarkerRef = useRef<L.CircleMarker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const activePinRef = useRef(activePin);

  useEffect(() => {
    activePinRef.current = activePin;
  }, [activePin]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([20, 0], 2);

    const worldBounds = L.latLngBounds(
      [-85, -180],
      [85, 180]
    );
    map.setMaxBounds(worldBounds);
    map.on('drag', () => {
      map.panInsideBounds(worldBounds, { animate: false });
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 7,
      minZoom: 2
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    map.on('click', (evt: L.LeafletMouseEvent) => {
      const { lat, lng } = evt.latlng;
      if (activePinRef.current === 'from') {
        setFromCoords({ lat, lon: lng });
        if (!fromQuery.trim()) setFromQuery('Custom origin');
      } else {
        setToCoords({ lat, lon: lng });
        if (!toQuery.trim()) setToQuery('Custom destination');
      }
    });

    mapInstanceRef.current = map;
    if (mapRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserverRef.current = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserverRef.current.observe(mapRef.current);
    }
    window.setTimeout(() => map.invalidateSize(), 0);

    return () => {
      if (resizeObserverRef.current && mapRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (fromCoords) {
      if (!fromMarkerRef.current) {
        fromMarkerRef.current = L.circleMarker([fromCoords.lat, fromCoords.lon], {
          radius: 7,
          color: '#0B2641',
          weight: 3,
          fillColor: '#60A5FA',
          fillOpacity: 1
        }).addTo(map);
        fromMarkerRef.current.bindTooltip(fromQuery || t('logisticsTools.container.originPort'), { permanent: false });
      } else {
        fromMarkerRef.current.setLatLng([fromCoords.lat, fromCoords.lon]);
        fromMarkerRef.current.setTooltipContent(fromQuery || t('logisticsTools.container.originPort'));
      }
    } else if (fromMarkerRef.current) {
      fromMarkerRef.current.remove();
      fromMarkerRef.current = null;
    }
  }, [fromCoords, fromQuery, t]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (toCoords) {
      if (!toMarkerRef.current) {
        toMarkerRef.current = L.circleMarker([toCoords.lat, toCoords.lon], {
          radius: 7,
          color: '#0B2641',
          weight: 3,
          fillColor: '#F59E0B',
          fillOpacity: 1
        }).addTo(map);
        toMarkerRef.current.bindTooltip(toQuery || t('logisticsTools.container.destinationPort'), { permanent: false });
      } else {
        toMarkerRef.current.setLatLng([toCoords.lat, toCoords.lon]);
        toMarkerRef.current.setTooltipContent(toQuery || t('logisticsTools.container.destinationPort'));
      }
    } else if (toMarkerRef.current) {
      toMarkerRef.current.remove();
      toMarkerRef.current = null;
    }
  }, [toCoords, toQuery, t]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (fromCoords && toCoords) {
      const points: [number, number][] = [
        [fromCoords.lat, fromCoords.lon],
        [toCoords.lat, toCoords.lon]
      ];
      if (!routeLineRef.current) {
        routeLineRef.current = L.polyline(points, {
          color: '#2DD4BF',
          weight: 3,
          opacity: 0.7,
          dashArray: '6, 6'
        }).addTo(map);
      } else {
        routeLineRef.current.setLatLngs(points);
      }
    } else if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }
  }, [fromCoords, toCoords]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (fromCoords && toCoords) {
      const bounds = L.latLngBounds(
        [fromCoords.lat, fromCoords.lon],
        [toCoords.lat, toCoords.lon]
      );
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 5 });
      return;
    }
    if (fromCoords) {
      map.setView([fromCoords.lat, fromCoords.lon], 4);
    } else if (toCoords) {
      map.setView([toCoords.lat, toCoords.lon], 4);
    }
  }, [fromCoords, toCoords]);

  const handleAddContainer = () => {
    setContainers((prev) => [
      ...prev,
      { id: `line-${prev.length + 1}`, type: '20std', qty: 1 }
    ]);
  };

  const handleUpdateContainer = (id: string, updates: Partial<ContainerLine>) => {
    setContainers((prev) => prev.map((line) => {
      if (line.id !== id) return line;
      const next = { ...line, ...updates };
      const qty = Number(next.qty);
      next.qty = Number.isFinite(qty) && qty > 0 ? qty : 1;
      return next;
    }));
  };

  const handleRemoveContainer = (id: string) => {
    setContainers((prev) => prev.filter((line) => line.id !== id));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (!QUOTE_ENDPOINT) {
      toast.error(t('logisticsTools.errors.apiNotConfigured'));
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        from: fromPort?.id || fromQuery,
        to: toPort?.id || toQuery,
        fromLat: fromCoords?.lat,
        fromLon: fromCoords?.lon,
        toLat: toCoords?.lat,
        toLon: toCoords?.lon,
        currency,
        containers: containers.map((line) => ({ type: line.type, qty: line.qty }))
      };
      const res = await fetch(QUOTE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || t('logisticsTools.errors.quoteFailed'));
      }
      setQuoteResult(data?.data || data);
    } catch (error: any) {
      toast.error(error.message || t('logisticsTools.errors.quoteFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  // Auth Handlers
  const handleGoogleSignup = async () => setShowRegistrationModal(false);
  const handleEmailSignup = async () => setShowRegistrationModal(false);
  const handleLoginSuccess = () => setShowLoginModal(false);
  const handleGoogleLogin = async () => setShowLoginModal(false);
  
  const handleSwitchToSignup = () => {
    setShowLoginModal(false);
    setShowRegistrationModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegistrationModal(false);
    setShowLoginModal(true);
  };

  return (
    <>
      {user ? (
        <NavbarLoggedIn 
          userName={profile?.full_name || user.user_metadata?.full_name || t('nav.placeholders.userName')}
          userEmail={user.email}
          hasUnreadNotifications={true}
          onLogout={handleLogout}
        />
      ) : (
        <NavbarLoggedOut 
          onSignUpClick={() => setShowRegistrationModal(true)}
          onLoginClick={() => setShowLoginModal(true)}
        />
      )}

      <div style={{ backgroundColor: '#0B2641', minHeight: '100vh', paddingTop: '72px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 80px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
              {t('logisticsTools.titles.container')}
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '14px' }}>
              {t('logisticsTools.subtitles.container')}
            </p>
          </div>

          <div className="container-calc__layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '24px'
              }}
            >
              <div className="container-calc__fields" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>{t('logisticsTools.container.originPort')}</label>
                  <input
                    value={fromQuery}
                    onChange={(event) => {
                      setFromQuery(event.target.value);
                      setFromPort(null);
                      setFromCoords(null);
                    }}
                    onFocus={() => fetchPorts('', setFromSuggestions, true, 'from', 0, false)}
                    placeholder={t('logisticsTools.container.originPort')}
                    style={{
                      width: '100%',
                      marginTop: '6px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.15)',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: '#FFFFFF',
                      fontSize: '13px'
                    }}
                  />
                  {fromSuggestions.length > 0 && (
                    <div
                      className="container-calc__suggestions"
                      onScroll={(event) => {
                        const target = event.currentTarget;
                        const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 24;
                        if (nearBottom && fromHasMore && !fromLoading) {
                          fetchPorts(fromQuery, setFromSuggestions, true, 'from', fromOffset, true);
                        }
                      }}
                    >
                      {fromSuggestions.map((port) => (
                        <button
                          key={port.id}
                          onClick={() => applyPort(port, 'from')}
                          className="container-calc__suggestion"
                        >
                          {port.name}
                        </button>
                      ))}
                      {fromLoading && (
                        <div className="container-calc__suggestion container-calc__suggestion--loading">
                          {t('logisticsTools.container.loadingMore')}
                        </div>
                      )}
                    </div>
                  )}
                  {!fromLoading && fromQuery.trim() && fromSuggestions.length === 0 && (
                    <div className="container-calc__suggestions container-calc__suggestions--empty">
                      {t('logisticsTools.container.noResults')}
                    </div>
                  )}
                  {fromLoading && (
                    <div className="container-calc__suggestions container-calc__suggestions--empty">
                      {t('logisticsTools.container.searching')}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>{t('logisticsTools.container.destinationPort')}</label>
                  <input
                    value={toQuery}
                    onChange={(event) => {
                      setToQuery(event.target.value);
                      setToPort(null);
                      setToCoords(null);
                    }}
                    onFocus={() => fetchPorts('', setToSuggestions, true, 'to', 0, false)}
                    placeholder={t('logisticsTools.container.destinationPort')}
                    style={{
                      width: '100%',
                      marginTop: '6px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.15)',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: '#FFFFFF',
                      fontSize: '13px'
                    }}
                  />
                  {toSuggestions.length > 0 && (
                    <div
                      className="container-calc__suggestions"
                      onScroll={(event) => {
                        const target = event.currentTarget;
                        const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 24;
                        if (nearBottom && toHasMore && !toLoading) {
                          fetchPorts(toQuery, setToSuggestions, true, 'to', toOffset, true);
                        }
                      }}
                    >
                      {toSuggestions.map((port) => (
                        <button
                          key={port.id}
                          onClick={() => applyPort(port, 'to')}
                          className="container-calc__suggestion"
                        >
                          {port.name}
                        </button>
                      ))}
                      {toLoading && (
                        <div className="container-calc__suggestion container-calc__suggestion--loading">
                          {t('logisticsTools.container.loadingMore')}
                        </div>
                      )}
                    </div>
                  )}
                  {!toLoading && toQuery.trim() && toSuggestions.length === 0 && (
                    <div className="container-calc__suggestions container-calc__suggestions--empty">
                      {t('logisticsTools.container.noResults')}
                    </div>
                  )}
                  {toLoading && (
                    <div className="container-calc__suggestions container-calc__suggestions--empty">
                      {t('logisticsTools.container.searching')}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>{t('logisticsTools.container.currency')}</label>
                  <select
                    value={currency}
                    onChange={(event) => setCurrency(event.target.value)}
                    style={{
                      width: '100%',
                      marginTop: '6px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.15)',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: '#FFFFFF',
                      fontSize: '13px'
                    }}
                  >
                    {CURRENCIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <div style={{ color: '#FFFFFF', fontWeight: 600, marginBottom: '10px' }}>{t('logisticsTools.container.containers')}</div>
                <div className="container-calc__containers" style={{ display: 'grid', gap: '12px' }}>
                  {containers.map((line) => (
                    <div
                      key={line.id}
                      className="container-calc__container-row"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 100px 40px',
                        gap: '10px',
                        alignItems: 'center'
                      }}
                    >
                      <select
                        value={line.type}
                        onChange={(event) =>
                          handleUpdateContainer(line.id, { type: event.target.value as ContainerLine['type'] })
                        }
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.15)',
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          color: '#FFFFFF',
                          fontSize: '12px'
                        }}
                      >
                        {CONTAINER_TYPES.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={line.qty}
                        onChange={(event) => handleUpdateContainer(line.id, { qty: Number(event.target.value) })}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.15)',
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          color: '#FFFFFF',
                          fontSize: '12px'
                        }}
                      />
                      <button
                        onClick={() => handleRemoveContainer(line.id)}
                        style={{
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#94A3B8',
                          borderRadius: '8px',
                          height: '32px'
                        }}
                        disabled={containers.length === 1}
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleAddContainer}
                  style={{
                    marginTop: '10px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backgroundColor: 'transparent',
                    color: '#94A3B8',
                    fontSize: '12px'
                  }}
                >
                  {t('logisticsTools.container.addContainer')}
                </button>
              </div>

              <button
                disabled={!canSubmit || isSubmitting}
                onClick={handleSubmit}
                style={{
                  marginTop: '20px',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: canSubmit ? '#0684F5' : 'rgba(255,255,255,0.1)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  width: '100%'
                }}
              >
                {isSubmitting ? t('logisticsTools.container.submitting') : t('logisticsTools.container.submit')}
              </button>
            </div>

            <div className="container-calc__right" style={{ display: 'grid', gap: '24px' }}>
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '18px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <button
                    onClick={() => setActivePin('from')}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      backgroundColor: activePin === 'from' ? 'rgba(6,132,245,0.2)' : 'transparent',
                      color: activePin === 'from' ? '#FFFFFF' : '#94A3B8',
                      fontSize: '12px'
                    }}
                  >
                    {t('logisticsTools.container.setOrigin')}
                  </button>
                  <button
                    onClick={() => setActivePin('to')}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      backgroundColor: activePin === 'to' ? 'rgba(6,132,245,0.2)' : 'transparent',
                      color: activePin === 'to' ? '#FFFFFF' : '#94A3B8',
                      fontSize: '12px'
                    }}
                  >
                    {t('logisticsTools.container.setDestination')}
                  </button>
                  <span style={{ color: '#64748B', fontSize: '12px' }}>
                    {t('logisticsTools.container.mapHint')}
                  </span>
                </div>
                <div className="container-calc__map" ref={mapRef} />
                <div className="container-calc__coords">
                  <div>
                    {t('logisticsTools.container.coordsOrigin')}: {fromCoords ? `${fromCoords.lat.toFixed(2)}, ${fromCoords.lon.toFixed(2)}` : t('logisticsTools.common.notSet')}
                  </div>
                  <div>
                    {t('logisticsTools.container.coordsDestination')}: {toCoords ? `${toCoords.lat.toFixed(2)}, ${toCoords.lon.toFixed(2)}` : t('logisticsTools.common.notSet')}
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '18px'
                }}
              >
                <h3 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
                  {t('logisticsTools.container.quoteTitle')}
                </h3>
                {quoteResult ? (
                  <div style={{ color: '#E2E8F0', fontSize: '14px', lineHeight: 1.6 }}>
                    <div>{t('logisticsTools.container.originPort')}: {quoteResult.from || fromQuery}</div>
                    <div>{t('logisticsTools.container.destinationPort')}: {quoteResult.to || toQuery}</div>
                    <div>{t('logisticsTools.container.distance')}: {quoteResult.distance ?? t('logisticsTools.common.notSet')} nm</div>
                    <div>{t('logisticsTools.container.transit')}: {quoteResult.transitDays ?? t('logisticsTools.common.notSet')} days</div>
                    <div style={{ marginTop: '10px', fontWeight: 600 }}>
                      {t('logisticsTools.container.total')}: {quoteResult.total ?? t('logisticsTools.common.notSet')} {quoteResult.currency || currency}
                    </div>
                    {quoteResult.surcharges && (
                      <div style={{ marginTop: '10px', fontSize: '12px', color: '#94A3B8' }}>
                        {t('logisticsTools.container.surcharges')}: bunker {quoteResult.surcharges.bunker ?? 0} / security {quoteResult.surcharges.security ?? 0} /
                        terminal {quoteResult.surcharges.terminal ?? 0}
                      </div>
                    )}
                    {quoteResult.referenceId && (
                      <div style={{ marginTop: '10px', fontSize: '12px', color: '#64748B' }}>
                        {t('logisticsTools.common.reference')}: {quoteResult.referenceId}
                      </div>
                    )}
                    {Array.isArray(quoteResult.lines) && quoteResult.lines.length > 0 && (
                      <div style={{ marginTop: '12px', fontSize: '12px', color: '#CBD5F5' }}>
                        {quoteResult.lines.slice(0, 4).map((line: any, idx: number) => (
                          <div key={`${line.container}-${idx}`}>
                            {line.container}: {line.lineTotal} {quoteResult.currency || currency}
                          </div>
                        ))}
                        {quoteResult.lines.length > 4 && (
                          <div style={{ color: '#94A3B8' }}>+{quoteResult.lines.length - 4} more lines</div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ color: '#94A3B8', fontSize: '13px' }}>
                    {t('logisticsTools.container.quotePlaceholder')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .container-calc__suggestions {
          margin-top: 6px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          background: #0B2641;
          max-height: 240px;
          overflow-y: auto;
        }
        .container-calc__suggestion {
          width: 100%;
          text-align: left;
          padding: 8px 10px;
          color: #E2E8F0;
          font-size: 12px;
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .container-calc__suggestion:hover {
          background: rgba(6,132,245,0.12);
        }
        .container-calc__suggestion--loading {
          cursor: default;
          color: #94A3B8;
        }
        .container-calc__suggestions--empty {
          padding: 10px;
          color: #94A3B8;
          font-size: 12px;
        }
        .container-calc__map {
          width: 100%;
          height: 240px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
          cursor: crosshair;
        }
        .container-calc__coords {
          margin-top: 10px;
          color: #94A3B8;
          font-size: 12px;
          display: grid;
          gap: 4px;
        }
        @media (max-width: 900px) {
          .container-calc__layout {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 600px) {
          .container-calc__container-row {
            grid-template-columns: 1fr;
          }
          .container-calc__map {
            height: 200px;
          }
          .container-calc__right {
            gap: 16px;
          }
        }
      `}</style>

      {/* Auth Modals */}
      <ModalRegistrationEntry
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onGoogleSignup={handleGoogleSignup}
        onEmailSignup={handleEmailSignup}
        onLoginClick={handleSwitchToLogin}
      />

      <ModalLogin
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onGoogleLogin={handleGoogleLogin}
        onLoginSuccess={handleLoginSuccess}
        onSignUpClick={handleSwitchToSignup}
      />
    </>
  );
}
