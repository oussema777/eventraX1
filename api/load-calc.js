const CONTAINERS = {
  '20std': { volume: 33.2, weight: 28000 },
  '40std': { volume: 67.7, weight: 26000 },
  '40hc': { volume: 76.4, weight: 26000 }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { containerType, unitLength, unitWidth, unitHeight, unitWeight, quantity, stackable } = req.body;

  const container = CONTAINERS[containerType] || CONTAINERS['20std'];
  
  // Calculate total volume in CBM (unit dims are in cm)
  const totalVolume = (unitLength * unitWidth * unitHeight * quantity) / 1000000;
  const totalWeight = unitWeight * quantity;

  const volUtilization = (totalVolume / container.volume) * 100;
  const weightUtilization = (totalWeight / container.weight) * 100;

  const utilization = Math.max(volUtilization, weightUtilization);

  let summary = `Your cargo occupies approx. ${totalVolume.toFixed(2)} CBM. `;
  if (utilization > 100) {
    summary += "Warning: Cargo exceeds container capacity.";
  } else if (utilization > 85) {
    summary += "Excellent utilization.";
  } else {
    summary += "Container has remaining space.";
  }

  return res.status(200).json({
    ok: true,
    data: {
      totalUnits: quantity,
      totalWeight: Math.round(totalWeight),
      totalVolume: totalVolume.toFixed(2),
      utilization: Math.round(utilization),
      summary
    }
  });
}
