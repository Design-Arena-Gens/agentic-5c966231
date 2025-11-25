## AtlasView – Advanced Trading Terminal

AtlasView is a TradingView-inspired analytics workspace built with Next.js, React, Tailwind CSS, and the KLineCharts engine. It delivers multi-asset charting, drawing overlays, multi-layout dashboards, and real-time Binance market data – ready to ship to Vercel.

### Features

- **Advanced charting**: candlestick, OHLC, line, and area rendering with moving averages & volume panes.
- **Drawing toolkit**: trend lines, rays, Fibonacci tools, channels, annotations, and more via the KLineCharts overlay system.
- **Multi-layout workspace**: instantly switch between single, split, and quad chart grids.
- **Global watchlist**: curated crypto symbols with live price & change updates.
- **Responsive dark UI**: keyboard-friendly, glassmorphism-inspired interface optimized for trading desks.

### Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000 to explore the terminal.

### Deployment

The app is optimized for Vercel. Run:

```bash
npm run build
npm start
```

Or deploy directly with:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-5c966231
```

### Environment

No secrets are required. All market data is proxied through Next.js API routes hitting public Binance endpoints.
