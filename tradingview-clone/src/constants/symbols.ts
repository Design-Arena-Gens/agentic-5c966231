export interface SymbolDescriptor {
  symbol: string;
  label: string;
  exchange: string;
  sector?: string;
  currency?: string;
}

export const defaultSymbols: SymbolDescriptor[] = [
  { symbol: "BTCUSDT", label: "Bitcoin / USDT", exchange: "Binance", currency: "USD" },
  { symbol: "ETHUSDT", label: "Ethereum / USDT", exchange: "Binance", currency: "USD" },
  { symbol: "BNBUSDT", label: "Binance Coin / USDT", exchange: "Binance", currency: "USD" },
  { symbol: "SOLUSDT", label: "Solana / USDT", exchange: "Binance", currency: "USD" },
  { symbol: "XRPUSDT", label: "XRP / USDT", exchange: "Binance", currency: "USD" },
  { symbol: "DOGEUSDT", label: "Dogecoin / USDT", exchange: "Binance", currency: "USD" },
  { symbol: "ADAUSDT", label: "Cardano / USDT", exchange: "Binance", currency: "USD" },
  { symbol: "MATICUSDT", label: "Polygon / USDT", exchange: "Binance", currency: "USD" },
  { symbol: "DOTUSDT", label: "Polkadot / USDT", exchange: "Binance", currency: "USD" },
  { symbol: "LTCUSDT", label: "Litecoin / USDT", exchange: "Binance", currency: "USD" },
];

import type { Interval } from "@/types/chart";

export const intervals: { label: string; value: Interval }[] = [
  { label: "1m", value: "1m" },
  { label: "3m", value: "3m" },
  { label: "5m", value: "5m" },
  { label: "15m", value: "15m" },
  { label: "30m", value: "30m" },
  { label: "1h", value: "1h" },
  { label: "2h", value: "2h" },
  { label: "4h", value: "4h" },
  { label: "1D", value: "1d" },
  { label: "1W", value: "1w" },
  { label: "1M", value: "1M" },
];
