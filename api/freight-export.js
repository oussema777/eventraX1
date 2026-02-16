export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { mode, weight, volume, cargoType, incoterm } = req.body;

  let baseRate = 0;
  if (mode === 'Air') baseRate = 2.5; // per kg
  if (mode === 'Sea') baseRate = 150; // per cbm
  if (mode === 'Road') baseRate = 0.8; // per kg

  let cost = 0;
  if (mode === 'Air' || mode === 'Road') {
    cost = weight * baseRate;
  } else {
    cost = volume * baseRate;
  }

  // Type multiplier
  if (cargoType === 'Hazardous') cost *= 1.5;
  if (cargoType === 'Perishable') cost *= 1.3;

  // Simplified incoterm impact
  if (incoterm === 'DDP') cost += 500;
  if (incoterm === 'DAP') cost += 300;

  return res.status(200).json({
    ok: true,
    data: {
      summary: `Estimated ${mode} freight for ${weight}kg / ${volume}CBM (${cargoType}).`,
      cost: Math.round(cost),
      currency: 'USD'
    }
  });
}
