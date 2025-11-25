"use client";

import { useMemo, useState } from "react";
import { Search, TrendingDown, TrendingUp } from "lucide-react";
import { useChartStore } from "@/store/chartStore";
import { useWatchlistQuotes } from "@/hooks/useWatchlistQuotes";

const MINUS_SIGN = "\u2212";

export function Sidebar() {
  const [query, setQuery] = useState("");
  const { watchlist, setSymbolForActivePane, panes, activePaneId } =
    useChartStore((state) => ({
      watchlist: state.watchlist,
      setSymbolForActivePane: state.setSymbolForActivePane,
      panes: state.panes,
      activePaneId: state.activePaneId,
    }));

  const activeSymbol =
    panes.find((pane) => pane.id === activePaneId)?.symbol ?? "BTCUSDT";

  const symbols = useMemo(
    () =>
      watchlist.filter((item) => {
        if (!query) return true;
        const normalized = query.trim().toLowerCase();
        return (
          item.symbol.toLowerCase().includes(normalized) ||
          item.label.toLowerCase().includes(normalized)
        );
      }),
    [query, watchlist],
  );

  const { data: quotes } = useWatchlistQuotes(symbols.map((item) => item.symbol));

  return (
    <aside className="flex w-80 flex-shrink-0 flex-col border-r border-slate-800 bg-slate-950/70 backdrop-blur">
      <div className="border-b border-slate-800 px-4 py-3">
        <h1 className="text-lg font-semibold tracking-tight text-slate-100">
          AtlasView Terminal
        </h1>
        <p className="text-sm text-slate-400">Multi-asset charting workspace</p>
      </div>
      <div className="px-4 py-3">
        <div className="flex items-center rounded-md border border-slate-700 bg-slate-900 px-3 py-2 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500">
          <Search className="mr-2 h-4 w-4 text-slate-500" />
          <input
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            placeholder="Search symbols"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {symbols.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-slate-500">
            No symbols match <span className="text-slate-300">"{query}"</span>
          </div>
        ) : (
          <ul className="space-y-1 px-2 pb-4">
            {symbols.map((item) => {
              const quote = quotes?.[item.symbol];
              const isActive = item.symbol === activeSymbol;
              const change = quote?.priceChangePercent ?? 0;
              const changeFormatted = `${change >= 0 ? "+" : MINUS_SIGN}${Math.abs(change).toFixed(2)}%`;

              return (
                <li key={item.symbol}>
                  <button
                    type="button"
                    onClick={() => setSymbolForActivePane(item.symbol)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${
                      isActive
                        ? "bg-slate-800/80 text-sky-300"
                        : "text-slate-200 hover:bg-slate-800/40"
                    }`}
                  >
                    <div>
                      <div className="font-medium">{item.symbol}</div>
                      <div className="text-xs text-slate-400">
                        {item.exchange}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-300">
                        {quote ? Number(quote.lastPrice).toFixed(2) : "--"}
                      </div>
                      <div
                        className={`flex items-center justify-end text-xs ${
                          change >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {change >= 0 ? (
                          <TrendingUp className="mr-1 h-3 w-3" />
                        ) : (
                          <TrendingDown className="mr-1 h-3 w-3" />
                        )}
                        {quote ? changeFormatted : "--"}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
