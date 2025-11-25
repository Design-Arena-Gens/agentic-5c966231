import { NextResponse } from "next/server";
import { fetchCandles } from "@/lib/binance";
import type { Interval } from "@/types/chart";

const allowedIntervals: Interval[] = [
  "1m",
  "3m",
  "5m",
  "15m",
  "30m",
  "1h",
  "2h",
  "4h",
  "6h",
  "12h",
  "1d",
  "1w",
  "1M",
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const symbol = url.searchParams.get("symbol")?.toUpperCase() ?? "BTCUSDT";
  const interval = (url.searchParams.get("interval") ?? "1h") as Interval;
  const limit = Number(url.searchParams.get("limit") ?? "500");

  if (!allowedIntervals.includes(interval)) {
    return NextResponse.json(
      { error: "Unsupported interval" },
      { status: 400 },
    );
  }

  try {
    const candles = await fetchCandles(symbol, interval, limit);
    return NextResponse.json({ candles });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
