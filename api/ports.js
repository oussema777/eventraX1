const PORTS = [
  { id: 'tn-tun', name: 'Tunis, Tunisia', lat: 36.8, lon: 10.18 },
  { id: 'tn-rad', name: 'Rades, Tunisia', lat: 36.76, lon: 10.28 },
  { id: 'fr-mar', name: 'Marseille, France', lat: 43.29, lon: 5.37 },
  { id: 'fr-leh', name: 'Le Havre, France', lat: 49.49, lon: 0.1 },
  { id: 'it-gen', name: 'Genoa, Italy', lat: 44.41, lon: 8.93 },
  { id: 'es-bar', name: 'Barcelona, Spain', lat: 41.38, lon: 2.17 },
  { id: 'dz-alg', name: 'Algiers, Algeria', lat: 36.75, lon: 3.05 },
  { id: 'ma-cas', name: 'Casablanca, Morocco', lat: 33.57, lon: -7.58 },
  { id: 'eg-ale', name: 'Alexandria, Egypt', lat: 31.2, lon: 29.91 },
  { id: 'ae-jeb', name: 'Jebel Ali, UAE', lat: 25.01, lon: 55.06 },
  { id: 'sa-jed', name: 'Jeddah, Saudi Arabia', lat: 21.48, lon: 39.19 },
  { id: 'tr-ist', name: 'Istanbul, Turkey', lat: 41.01, lon: 28.97 },
  { id: 'gr-pir', name: 'Piraeus, Greece', lat: 37.94, lon: 23.64 },
  { id: 'es-val', name: 'Valencia, Spain', lat: 39.46, lon: -0.37 },
  { id: 'mt-mar', name: 'Marsaxlokk, Malta', lat: 35.84, lon: 14.54 }
];

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { q } = req.query;
  const query = q?.toLowerCase() || '';

  const filtered = PORTS.filter(p => 
    p.name.toLowerCase().includes(query)
  );

  return res.status(200).json({ ok: true, data: filtered });
}
