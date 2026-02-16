function getDistance(lat1, lon1, lat2, lon2) {
  const R = 3440.065; // Nautical miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const RATES = {
  '20std': 1200,
  '40std': 2200,
  '40hc': 2500
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { fromLat, fromLon, toLat, toLon, containers, currency } = req.body;

  if (fromLat == null || fromLon == null || toLat == null || toLon == null) {
    return res.status(400).json({ ok: false, error: 'Coordinates missing' });
  }

  const distance = getDistance(fromLat, fromLon, toLat, toLon);
  const transitDays = Math.ceil(distance / (15 * 24)); // Roughly 15 knots speed

  let totalUSD = 0;
  containers.forEach(c => {
    const rate = RATES[c.type] || 2000;
    totalUSD += rate * c.qty;
  });

  // Base multiplier for distance (simplified)
  const distanceSurcharge = distance * 0.5;
  totalUSD += distanceSurcharge;

  let finalTotal = totalUSD;
  if (currency === 'TND') finalTotal *= 3.1;
  if (currency === 'EUR') finalTotal *= 0.92;

  return res.status(200).json({
    ok: true,
    data: {
      distance: Math.round(distance),
      transitDays: transitDays + 2, // Plus loading/unloading
      total: Math.round(finalTotal),
      currency: currency || 'USD'
    }
  });
}
