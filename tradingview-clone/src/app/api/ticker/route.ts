import { NextResponse } from "next/server";
import { fetchTicker } from "@/lib/binance";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const symbol = url.searchParams.get("symbol")?.toUpperCase() ?? "BTCUSDT";

  try {
    const ticker = await fetchTicker(symbol);
    return NextResponse.json({ ticker });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
