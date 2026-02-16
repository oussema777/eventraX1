
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';

  export default defineConfig({
    plugins: [react()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        'vaul@1.1.2': 'vaul',
        'sonner@2.0.3': 'sonner',
        'recharts@2.15.2': 'recharts',
        'react-resizable-panels@2.1.7': 'react-resizable-panels',
        'react-hook-form@7.55.0': 'react-hook-form',
        'react-day-picker@8.10.1': 'react-day-picker',
        'next-themes@0.4.6': 'next-themes',
        'lucide-react@0.487.0': 'lucide-react',
        'input-otp@1.4.2': 'input-otp',
        'figma:asset/94f73fab6da4553dd701cee9de841d39c5760ca0.png': path.resolve(__dirname, './src/assets/94f73fab6da4553dd701cee9de841d39c5760ca0.png'),
        'embla-carousel-react@8.6.0': 'embla-carousel-react',
        'cmdk@1.1.1': 'cmdk',
        'class-variance-authority@0.7.1': 'class-variance-authority',
        '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
        '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group@1.1.2': '@radix-ui/react-toggle-group',
        '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
        '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
        '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
        '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
        '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
        '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
        '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
        '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
        '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
        '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
        '@radix-ui/react-navigation-menu@1.2.5': '@radix-ui/react-navigation-menu',
        '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
        '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
        '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
        '@radix-ui/react-dropdown-menu@2.1.6': '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
        '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
        '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
        '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
        '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
        '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
        '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
        '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        // You can add your port 5000 proxy here if needed for email
        // '/api/send-email': 'http://localhost:5000'
      },
      // Mock API for development
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/api/ports')) {
            const url = new URL(req.url, 'http://localhost');
            const q = url.searchParams.get('q')?.toLowerCase() || '';
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
            const filtered = PORTS.filter(p => p.name.toLowerCase().includes(q));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, data: filtered }));
            return;
          }

          if (req.url === '/api/quote' || req.url?.startsWith('/api/quote')) {
            if (req.method !== 'POST') { next(); return; }
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const { fromLat, fromLon, toLat, toLon, containers, currency } = JSON.parse(body);
                const getDistance = (lat1, lon1, lat2, lon2) => {
                  const R = 3440.065;
                  const dLat = (lat2 - lat1) * Math.PI / 180;
                  const dLon = (lon2 - lon1) * Math.PI / 180;
                  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
                  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                };
                const dist = getDistance(fromLat, fromLon, toLat, toLon);
                const RATES = { '20std': 1200, '40std': 2200, '40hc': 2500 };
                let totalUSD = containers.reduce((acc, c) => acc + (RATES[c.type] || 2000) * c.qty, 0);
                totalUSD += dist * 0.5;
                let final = totalUSD;
                if (currency === 'TND') final *= 3.1;
                if (currency === 'EUR') final *= 0.92;
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: true, data: { distance: Math.round(dist), transitDays: Math.ceil(dist/(15*24)) + 2, total: Math.round(final), currency } }));
              } catch (e) {
                res.statusCode = 400;
                res.end(JSON.stringify({ ok: false, error: 'Invalid JSON' }));
              }
            });
            return;
          }

          if (req.url === '/api/freight-export' || req.url?.startsWith('/api/freight-export')) {
            if (req.method !== 'POST') { next(); return; }
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const { mode, weight, volume, cargoType, incoterm } = JSON.parse(body);
                let rate = mode === 'Air' ? 2.5 : mode === 'Sea' ? 150 : 0.8;
                let cost = (mode === 'Sea' ? volume : weight) * rate;
                if (cargoType === 'Hazardous') cost *= 1.5;
                if (incoterm === 'DDP') cost += 500;
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: true, data: { summary: `Estimated ${mode} freight for ${weight}kg / ${volume}CBM.`, cost: Math.round(cost), currency: 'USD' } }));
              } catch (e) {
                res.statusCode = 400;
                res.end(JSON.stringify({ ok: false, error: 'Invalid JSON' }));
              }
            });
            return;
          }

          if (req.url === '/api/load-calc' || req.url?.startsWith('/api/load-calc')) {
            if (req.method !== 'POST') { next(); return; }
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const { containerType, unitLength, unitWidth, unitHeight, unitWeight, quantity } = JSON.parse(body);
                const CONTAINERS = { '20std': { vol: 33.2, w: 28000 }, '40std': { vol: 67.7, w: 26000 }, '40hc': { vol: 76.4, w: 26000 } };
                const c = CONTAINERS[containerType] || CONTAINERS['20std'];
                const tv = (unitLength * unitWidth * unitHeight * quantity) / 1000000;
                const tw = unitWeight * quantity;
                const util = Math.round(Math.max((tv/c.vol)*100, (tw/c.w)*100));
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: true, data: { totalUnits: quantity, totalWeight: Math.round(tw), totalVolume: tv.toFixed(2), utilization: util, summary: util > 100 ? "Warning: Over capacity" : "Ready for shipment" } }));
              } catch (e) {
                res.statusCode = 400;
                res.end(JSON.stringify({ ok: false, error: 'Invalid JSON' }));
              }
            });
            return;
          }
          next();
        });
      }
    },
  });