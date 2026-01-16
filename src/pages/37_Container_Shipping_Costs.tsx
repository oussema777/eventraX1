import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { toast } from 'sonner@2.0.3';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';

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

const CONTAINER_TYPES = [
  { id: '20std', label: "20' Standard" },
  { id: '40std', label: "40' Standard" },
  { id: '40hc', label: "40' High Cube" }
] as const;

const CURRENCIES = ['USD', 'EUR', 'TND'];

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 500;

const toSvgX = (lon: number) => ((lon + 180) / 360) * MAP_WIDTH;
const toSvgY = (lat: number) => ((90 - lat) / 180) * MAP_HEIGHT;

export default function ContainerShippingCostsPage() {
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState<Port[]>([]);
  const [toSuggestions, setToSuggestions] = useState<Port[]>([]);
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

  const fetchPorts = async (query: string, setter: (ports: Port[]) => void) => {
    if (!PORTS_ENDPOINT || !query.trim()) {
      setter([]);
      return;
    }
    try {
      const res = await fetch(`${PORTS_ENDPOINT}?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok || data?.ok === false) throw new Error(data?.error || 'Failed to load ports');
      setter(data?.data || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load ports');
      setter([]);
    }
  };

  useEffect(() => {
    const handle = window.setTimeout(() => {
      fetchPorts(fromQuery, setFromSuggestions);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [fromQuery]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      fetchPorts(toQuery, setToSuggestions);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [toQuery]);

  const applyPort = (port: Port, target: 'from' | 'to') => {
    if (target === 'from') {
      setFromPort(port);
      setFromQuery(port.name);
      if (port.lat != null && port.lon != null) {
        setFromCoords({ lat: Number(port.lat), lon: Number(port.lon) });
      }
    } else {
      setToPort(port);
      setToQuery(port.name);
      if (port.lat != null && port.lon != null) {
        setToCoords({ lat: Number(port.lat), lon: Number(port.lon) });
      }
    }
  };

  const handleMapClick = (event: MouseEvent<HTMLDivElement>) => {
    const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const lon = (x / rect.width) * 360 - 180;
    const lat = 90 - (y / rect.height) * 180;
    if (activePin === 'from') {
      setFromCoords({ lat, lon });
      if (!fromQuery.trim()) setFromQuery('Custom origin');
    } else {
      setToCoords({ lat, lon });
      if (!toQuery.trim()) setToQuery('Custom destination');
    }
  };

  const handleAddContainer = () => {
    setContainers((prev) => [
      ...prev,
      { id: `line-${prev.length + 1}`, type: '20std', qty: 1 }
    ]);
  };

  const handleUpdateContainer = (id: string, updates: Partial<ContainerLine>) => {
    setContainers((prev) => prev.map((line) => (line.id === id ? { ...line, ...updates } : line)));
  };

  const handleRemoveContainer = (id: string) => {
    setContainers((prev) => prev.filter((line) => line.id !== id));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (!QUOTE_ENDPOINT) {
      toast.error('Logistics API is not configured.');
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
        throw new Error(data?.error || 'Failed to calculate quote');
      }
      setQuoteResult(data?.data || data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to calculate quote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fromMarker = fromCoords ? { x: toSvgX(fromCoords.lon), y: toSvgY(fromCoords.lat) } : null;
  const toMarker = toCoords ? { x: toSvgX(toCoords.lon), y: toSvgY(toCoords.lat) } : null;

  return (
    <>
      <NavbarLoggedIn />
      <div style={{ backgroundColor: '#0B2641', minHeight: '100vh', paddingTop: '72px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 80px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
              Container Shipping Cost Calculator
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '14px' }}>
              Select ports and containers to estimate shipping costs.
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
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Origin Port</label>
                  <input
                    value={fromQuery}
                    onChange={(event) => {
                      setFromQuery(event.target.value);
                      setFromPort(null);
                    }}
                    placeholder="Search port or city"
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
                    <div className="container-calc__suggestions">
                      {fromSuggestions.slice(0, 6).map((port) => (
                        <button
                          key={port.id}
                          onClick={() => applyPort(port, 'from')}
                          className="container-calc__suggestion"
                        >
                          {port.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Destination Port</label>
                  <input
                    value={toQuery}
                    onChange={(event) => {
                      setToQuery(event.target.value);
                      setToPort(null);
                    }}
                    placeholder="Search port or city"
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
                    <div className="container-calc__suggestions">
                      {toSuggestions.slice(0, 6).map((port) => (
                        <button
                          key={port.id}
                          onClick={() => applyPort(port, 'to')}
                          className="container-calc__suggestion"
                        >
                          {port.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94A3B8' }}>Currency</label>
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
                <div style={{ color: '#FFFFFF', fontWeight: 600, marginBottom: '10px' }}>Containers</div>
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
                  Add Container
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
                {isSubmitting ? 'Calculating...' : 'Calculate Shipping Cost'}
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
                    Set Origin
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
                    Set Destination
                  </button>
                  <span style={{ color: '#64748B', fontSize: '12px' }}>
                    Click on the map to place a pin
                  </span>
                </div>
                <div className="container-calc__map" onClick={handleMapClick}>
                  <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} preserveAspectRatio="xMidYMid meet">
                    <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="#0F2F4D" />
                    {[...Array(6)].map((_, idx) => (
                      <line
                        key={`h-${idx}`}
                        x1="0"
                        x2={MAP_WIDTH}
                        y1={(MAP_HEIGHT / 6) * idx}
                        y2={(MAP_HEIGHT / 6) * idx}
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="1"
                      />
                    ))}
                    {[...Array(9)].map((_, idx) => (
                      <line
                        key={`v-${idx}`}
                        y1="0"
                        y2={MAP_HEIGHT}
                        x1={(MAP_WIDTH / 9) * idx}
                        x2={(MAP_WIDTH / 9) * idx}
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="1"
                      />
                    ))}
                    <path
                      d="M80,130 L220,90 L330,140 L300,210 L160,240 L90,190 Z"
                      fill="rgba(255,255,255,0.1)"
                    />
                    <path
                      d="M320,120 L520,110 L600,180 L540,260 L360,230 Z"
                      fill="rgba(255,255,255,0.1)"
                    />
                    <path
                      d="M580,120 L900,140 L940,230 L720,280 L620,210 Z"
                      fill="rgba(255,255,255,0.1)"
                    />
                    <path
                      d="M650,300 L820,320 L860,400 L700,420 L620,360 Z"
                      fill="rgba(255,255,255,0.1)"
                    />
                    {fromMarker && (
                      <circle cx={fromMarker.x} cy={fromMarker.y} r="8" fill="#60A5FA" stroke="#0B2641" strokeWidth="3" />
                    )}
                    {toMarker && (
                      <circle cx={toMarker.x} cy={toMarker.y} r="8" fill="#F59E0B" stroke="#0B2641" strokeWidth="3" />
                    )}
                    {fromMarker && toMarker && (
                      <line
                        x1={fromMarker.x}
                        y1={fromMarker.y}
                        x2={toMarker.x}
                        y2={toMarker.y}
                        stroke="rgba(6,132,245,0.6)"
                        strokeWidth="2"
                        strokeDasharray="6 6"
                      />
                    )}
                  </svg>
                </div>
                <div className="container-calc__coords">
                  <div>Origin: {fromCoords ? `${fromCoords.lat.toFixed(2)}, ${fromCoords.lon.toFixed(2)}` : 'Not set'}</div>
                  <div>Destination: {toCoords ? `${toCoords.lat.toFixed(2)}, ${toCoords.lon.toFixed(2)}` : 'Not set'}</div>
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
                  Quote Summary
                </h3>
                {quoteResult ? (
                  <div style={{ color: '#E2E8F0', fontSize: '14px', lineHeight: 1.6 }}>
                    <div>From: {quoteResult.from || fromQuery}</div>
                    <div>To: {quoteResult.to || toQuery}</div>
                    <div>Distance: {quoteResult.distance ?? '—'} nm</div>
                    <div>Transit: {quoteResult.transitDays ?? '—'} days</div>
                    <div style={{ marginTop: '10px', fontWeight: 600 }}>
                      Total: {quoteResult.total ?? '—'} {quoteResult.currency || currency}
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#94A3B8', fontSize: '13px' }}>
                    Calculate to see pricing details.
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
          max-height: 180px;
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
        .container-calc__map {
          width: 100%;
          height: 240px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
          cursor: crosshair;
        }
        .container-calc__map svg {
          width: 100%;
          height: 100%;
          display: block;
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
    </>
  );
}
