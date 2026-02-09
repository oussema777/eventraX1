require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow frontend to call this
app.use(express.json());

// SMTP Configuration
const smtpPort = parseInt(process.env.SMTP_PORT || '587');
const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: smtpPort,
  secure: process.env.SMTP_SECURE === 'true' || smtpPort === 465, // Auto-secure for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, 
  },
  tls: {
    rejectUnauthorized: false // Helps with self-signed certificates common on some hosts
  }
};

// Check if credentials are provided
const isMockMode = !process.env.SMTP_USER || !process.env.SMTP_PASS;

let transporter;

if (isMockMode) {
  console.log('\n⚠️  MISSING SMTP CREDENTIALS IN .env');
  console.log('🔄 Server starting in MOCK MODE. Emails will be logged to console but NOT sent.\n');
} else {
  transporter = nodemailer.createTransport(smtpConfig);
  // Verify connection
  transporter.verify(function (error, success) {
    if (error) {
      console.log('⚠️ SMTP Connection Error:', error);
    } else {
      console.log('✅ SMTP Server is ready to take our messages');
    }
  });
}

// Email Endpoint
app.post('/api/send-email', async (req, res) => {
  const { to, subject, html } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    if (isMockMode) {
      // MOCK MODE: Log email to console
      console.log('---------------------------------------------------');
      console.log(`📧 [MOCK EMAIL] To: ${to}`);
      console.log(`📝 Subject: ${subject}`);
      console.log('---------------------------------------------------');
      return res.status(200).json({ success: true, messageId: 'mock-id-' + Date.now() });
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Eventra" <no-reply@eventra.com>',
      to,
      subject,
      html,
    });

    console.log('Message sent: %s', info.messageId);
    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});


// Freight Export Endpoint
app.post('/api/freight-export', (req, res) => {
  const { origin, destination, weight, volume, mode, incoterm, cargoType, packagesCount, readyDate, cargoValue, notes } = req.body;

  // Basic validation
  if (!origin || !destination || !weight || !volume) {
    return res.status(400).json({ ok: false, error: 'Origin, Destination, Weight, and Volume are required.' });
  }

  // --- Distance Calculation (More Realistic) ---
  let distance = 0;
  const originLower = origin.toLowerCase();
  const destinationLower = destination.toLowerCase();

  // Expanded lookup table for major routes (approximate distances in km)
  const distances = {
    'tunis-marseille': 800,
    'tunis-paris': 1500,
    'london-new york': 5500,
    'shanghai-los angeles': 10500,
    'sydney-tokyo': 7800,
    'dubai-london': 5400,
    'frankfurt-shanghai': 8200,
    'singapore-rotterdam': 11000,
  };

  const routeKey1 = `${originLower}-${destinationLower}`;
  const routeKey2 = `${destinationLower}-${originLower}`; // Check reverse route as well

  if (distances[routeKey1]) {
    distance = distances[routeKey1];
  } else if (distances[routeKey2]) {
    distance = distances[routeKey2];
  } else {
    // Fallback: simple heuristic based on string length difference, very rough
    const avgCityLength = (origin.length + destination.length) / 2;
    distance = Math.floor(avgCityLength * 100 + Math.random() * 2000) + 500;
  }
  
  // Ensure distance is at least 100km
  distance = Math.max(100, distance);

  // --- Chargeable Weight Calculation ---
  let chargeableWeight = weight;
  const volumeWeightAirFactor = 167; // kg per CBM for air freight (approx. 1:6000 density)
  const volumeWeightSeaRoadFactor = 333; // kg per CBM for sea/road freight (approx. 1:3000 density for some LCL)

  if (mode === 'Air') {
    chargeableWeight = Math.max(weight, volume * volumeWeightAirFactor);
  } else if (mode === 'Sea' || mode === 'Road') {
    chargeableWeight = Math.max(weight, volume * volumeWeightSeaRoadFactor);
  }

  // --- Cost Calculation (More Realistic) ---
  let cost = 0;
  let currency = 'USD'; // Default currency

  // Base rates per chargeable weight (USD per kg)
  let ratePerKg = 0;
  if (mode === 'Air') {
    ratePerKg = 5; // Air cargo is generally most expensive
  } else if (mode === 'Sea') {
    ratePerKg = 0.5; // Sea freight is typically cheaper
  } else if (mode === 'Road') {
    ratePerKg = 1.5; // Road freight is in between
  }

  cost = chargeableWeight * ratePerKg;

  // Add a distance-based component
  if (mode === 'Air') {
    cost += distance * 0.15; // Higher per-km cost for air
  } else if (mode === 'Sea') {
    cost += distance * 0.02; // Lower per-km cost for sea
  } else if (mode === 'Road') {
    cost += distance * 0.05; // Medium per-km cost for road
  }

  // Surcharges based on cargo type
  if (cargoType === 'Hazardous') {
    cost += 1500; // Significant surcharge
  } else if (cargoType === 'Perishable') {
    cost += 1000;
  } else if (cargoType === 'Oversized') {
    cost += 750;
  }

  // Incoterm impact (simplified - could be more complex with actual responsibilities)
  if (incoterm === 'EXW') {
    cost += 300; // Extra local pickup/handling
  } else if (incoterm === 'DDP') {
    cost += (cargoValue || 0) * 0.1 + 500; // Add percentage of cargo value for duties/taxes + handling
  }

  // Add a small base fee
  cost += 100;

  const summary = `API estimate from ${origin} to ${destination} via ${mode}. Charged on ${chargeableWeight.toFixed(2)} kg.`;

  res.status(200).json({
    ok: true,
    data: {
      origin,
      destination,
      mode,
      cost: parseFloat(cost.toFixed(2)),
      currency,
      distance: Math.floor(distance),
      summary,
    },
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Custom Email Backend running on http://localhost:${PORT}`);
});
