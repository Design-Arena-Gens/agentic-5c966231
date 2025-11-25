"use client";

import useSWR from "swr";
import {
  AreaChart,
  BarChart3,
  CandlestickChart,
  LayoutDashboard,
  LayoutList,
  LayoutPanelLeft,
  LineChart,
  RefreshCw,
} from "lucide-react";
import { intervals } from "@/constants/symbols";
import { useChartStore } from "@/store/chartStore";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error(`Request failed with ${res.status}`);
    }
    return res.json();
  });

const chartTypeButtons = [
  {
    id: "candlestick",
    label: "Candle",
    icon: CandlestickChart,
  },
  {
    id: "ohlc",
    label: "OHLC",
    icon: BarChart3,
  },
  {
    id: "line",
    label: "Line",
    icon: LineChart,
  },
  {
    id: "area",
    label: "Area",
    icon: AreaChart,
  },
] as const;

const layoutButtons = [
  { id: 1, label: "Single", icon: LayoutPanelLeft },
  { id: 2, label: "Split", icon: LayoutList },
  { id: 4, label: "Grid", icon: LayoutDashboard },
] as const;

export function TopToolbar() {
  const {
    panes,
    activePaneId,
    setIntervalForActivePane,
    updatePane,
    layout,
    setLayout,
  } = useChartStore((state) => ({
    panes: state.panes,
    activePaneId: state.activePaneId,
    setIntervalForActivePane: state.setIntervalForActivePane,
    updatePane: state.updatePane,
    layout: state.layout,
    setLayout: state.setLayout,
  }));

  const activePane = panes.find((pane) => pane.id === activePaneId);

  const { data, isValidating, mutate } = useSWR(
    activePane ? `/api/ticker?symbol=${activePane.symbol}` : null,
    fetcher,
    {
      refreshInterval: 10000,
    },
  );

  const lastPrice = data?.ticker?.lastPrice ?? 0;
  const changePercent = data?.ticker?.priceChangePercent ?? 0;

  return (
    <header className="flex flex-col border-b border-slate-800 bg-slate-950/80 px-4 py-2 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              {activePane?.symbol ?? "BTCUSDT"}
            </div>
            <div className="text-xs text-slate-500">
              Binance · Crypto · {activePane?.interval.toUpperCase() ?? "1H"}
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <div className="text-2xl font-semibold text-slate-100">
              {lastPrice ? Number(lastPrice).toFixed(2) : "--"}
            </div>
            <div
              className={`text-sm ${
                changePercent >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {changePercent >= 0 ? "+" : ""}
              {changePercent.toFixed(2)}%
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => mutate()}
          className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-600 hover:text-slate-100"
        >
          <RefreshCw
            className={`h-4 w-4 ${isValidating ? "animate-spin text-sky-400" : ""}`}
          />
          Refresh
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1">
          {intervals.map(({ label, value }) => {
            const isActive = activePane?.interval === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setIntervalForActivePane(value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? "bg-sky-600 text-white"
                    : "text-slate-300 hover:bg-slate-800/60"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          {chartTypeButtons.map(({ id, label, icon: Icon }) => {
            const isActive = activePane?.chartStyle === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() =>
                  activePane && updatePane(activePane.id, { chartStyle: id })
                }
                className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs transition ${
                  isActive
                    ? "border-sky-500/70 bg-sky-600/20 text-sky-300"
                    : "border-slate-700 text-slate-300 hover:border-slate-600 hover:text-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          {layoutButtons.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setLayout(id)}
              className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs transition ${
                layout === id
                  ? "border-sky-500/70 bg-sky-600/20 text-sky-300"
                  : "border-slate-700 text-slate-300 hover:border-slate-600 hover:text-slate-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
