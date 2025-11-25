import useSWR from "swr";
import type { QuoteTicker } from "@/lib/binance";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error(`Request failed with ${res.status}`);
    }
    return res.json();
  });

type Result = Record<string, QuoteTicker>;

export function useWatchlistQuotes(symbols: string[]) {
  return useSWR<Result>(
    symbols.length ? ["watchlist", symbols.join(",")] : null,
    async () => {
      const entries = await Promise.all(
        symbols.map(async (symbol) => {
          const data = await fetcher(`/api/ticker?symbol=${symbol}`);
          return [symbol, data.ticker as QuoteTicker] as const;
        }),
      );
      return Object.fromEntries(entries);
    },
    {
      refreshInterval: 15000,
      revalidateOnFocus: false,
    },
  );
}
