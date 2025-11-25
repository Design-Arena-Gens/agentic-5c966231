"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  Chart,
  DataLoadType,
  DataLoaderGetBarsParams,
  KLineData,
  Period,
} from "klinecharts";
import { dispose, init } from "klinecharts";
import type { PaneConfig } from "@/store/chartStore";
import { useChartStore } from "@/store/chartStore";
import type { ChartStyle, Interval } from "@/types/chart";

interface TradingChartProps {
  pane: PaneConfig;
  isActive: boolean;
}

function intervalToPeriod(interval: Interval): Period {
  const unit = interval.slice(-1);
  const value = Number(interval.slice(0, -1)) || 1;

  switch (unit) {
    case "m":
      return { type: "minute", span: value };
    case "h":
      return { type: "hour", span: value };
    case "d":
      return { type: "day", span: value };
    case "w":
      return { type: "week", span: value };
    case "M":
    default:
      return { type: "month", span: value };
  }
}

async function requestCandles(
  symbol: string,
  interval: Interval,
  limit: number,
  params: { endTime?: number; startTime?: number } = {},
): Promise<KLineData[]> {
  const search = new URLSearchParams({
    symbol,
    interval,
    limit: String(limit),
  });

  if (params.endTime) {
    search.set("endTime", String(params.endTime));
  }
  if (params.startTime) {
    search.set("startTime", String(params.startTime));
  }

  const response = await fetch(`/api/klines?${search.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to load candles (${response.statusText})`);
  }

  const payload = (await response.json()) as {
    candles: {
      timestamp: number;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }[];
  };

  return (payload.candles ?? [])
    .map((item) => ({
      timestamp: item.timestamp,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

function applyChartStyle(chart: Chart, style: ChartStyle) {
  switch (style) {
    case "candlestick":
      chart.setStyles({
        candle: {
          type: "candle_solid",
          bar: {
            upColor: "#22c55e",
            upBorderColor: "#22c55e",
            upWickColor: "#22c55e",
            downColor: "#ef4444",
            downBorderColor: "#ef4444",
            downWickColor: "#ef4444",
            noChangeColor: "#94a3b8",
            noChangeBorderColor: "#94a3b8",
            noChangeWickColor: "#94a3b8",
            compareRule: "previous_close",
          },
        },
      });
      break;
    case "ohlc":
      chart.setStyles({
        candle: {
          type: "ohlc",
          bar: {
            upColor: "#22c55e",
            upBorderColor: "#22c55e",
            upWickColor: "#22c55e",
            downColor: "#ef4444",
            downBorderColor: "#ef4444",
            downWickColor: "#ef4444",
            noChangeColor: "#94a3b8",
            noChangeBorderColor: "#94a3b8",
            noChangeWickColor: "#94a3b8",
            compareRule: "previous_close",
          },
        },
      });
      break;
    case "line":
      chart.setStyles({
        candle: {
          type: "area",
          area: {
            lineColor: "#38bdf8",
            lineSize: 2,
            backgroundColor: "rgba(56, 189, 248, 0.08)",
            smooth: true,
          },
        },
      });
      break;
    case "area":
    default:
      chart.setStyles({
        candle: {
          type: "area",
          area: {
            lineColor: "#10b981",
            lineSize: 2,
            backgroundColor: "rgba(16, 185, 129, 0.12)",
            smooth: true,
          },
        },
      });
      break;
  }
}

export function TradingChart({ pane, isActive }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<Chart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { drawingTool, setDrawingTool, setActivePane } = useChartStore(
    (state) => ({
      drawingTool: state.drawingTool,
      setDrawingTool: state.setDrawingTool,
      setActivePane: state.setActivePane,
    }),
  );

  const loadCandles = useCallback(
    async (type: DataLoadType, timestamp: number | null) => {
      const limit =
        type === "init" ? 600 : type === "update" ? 2 : Math.min(320, 600);
      const endTime =
        type === "backward" && timestamp != null ? timestamp - 1 : undefined;
      const startTime =
        type === "forward" && timestamp != null ? timestamp + 1 : undefined;

      const candles = await requestCandles(pane.symbol, pane.interval, limit, {
        endTime,
        startTime,
      });

      if (type === "update") {
        const last = candles.at(-1);
        return last ? [last] : [];
      }

      return candles;
    },
    [pane.interval, pane.symbol],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = init(containerRef.current, {
      styles: {
        grid: {
          horizontal: {
            show: true,
            style: "dashed",
            color: "rgba(148, 163, 184, 0.12)",
            dashedValue: [4, 4],
          },
          vertical: {
            show: true,
            style: "dashed",
            color: "rgba(148, 163, 184, 0.12)",
            dashedValue: [4, 4],
          },
        },
        crosshair: {
          horizontal: {
            line: { color: "rgba(148, 163, 184, 0.4)", dashedValue: [4, 4] },
            text: {
              color: "#e2e8f0",
              backgroundColor: "rgba(15, 23, 42, 0.85)",
            },
          },
          vertical: {
            line: { color: "rgba(148, 163, 184, 0.4)", dashedValue: [4, 4] },
            text: {
              color: "#e2e8f0",
              backgroundColor: "rgba(15, 23, 42, 0.85)",
            },
          },
        },
        xAxis: {
          axisLine: { color: "rgba(148, 163, 184, 0.18)" },
          tickLine: { color: "rgba(148, 163, 184, 0.18)" },
          tickText: { color: "#94a3b8" },
        },
        yAxis: {
          axisLine: { color: "rgba(148, 163, 184, 0.18)" },
          tickLine: { color: "rgba(148, 163, 184, 0.18)" },
          tickText: { color: "#94a3b8" },
        },
        overlay: {
          line: { color: "#38bdf8" },
          rect: { color: "rgba(56, 189, 248, 0.12)" },
          polygon: {
            color: "rgba(56, 189, 248, 0.12)",
            borderColor: "#38bdf8",
          },
        },
      },
    });

    if (!chart) return;
    chartRef.current = chart;
    chart.setZoomEnabled(true);
    chart.createIndicator("VOL", false, { id: "vol-pane", height: 80 });
    chart.createIndicator("MA", true, { id: "candle_pane" });
    chart.createIndicator("EMA", true, { id: "candle_pane" });

    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      dispose(chart);
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    applyChartStyle(chart, pane.chartStyle);
  }, [pane.chartStyle]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    let mounted = true;

    const loader = async ({
      type,
      timestamp,
      callback,
    }: DataLoaderGetBarsParams) => {
      try {
        if (type === "init" && mounted) {
          setLoading(true);
        }
        const candles = await loadCandles(type, timestamp);
        if (!mounted) {
          return;
        }
        const fetchLimit =
          type === "init" ? 600 : type === "update" ? 2 : Math.min(320, 600);
        const more =
          type === "backward"
            ? { backward: candles.length >= fetchLimit }
            : candles.length >= fetchLimit;
        callback(candles, more);
        if (type === "init") {
          chart.scrollToRealTime();
          setLoading(false);
        }
        setError(null);
      } catch (err) {
        if (!mounted) {
          return;
        }
        setError(err instanceof Error ? err.message : "Unable to load data");
        setLoading(false);
        callback([], false);
      }
    };

    chart.resetData();
    chart.setSymbol({
      ticker: pane.symbol,
      pricePrecision: 2,
      volumePrecision: 2,
    });
    chart.setPeriod(intervalToPeriod(pane.interval));
    chart.setDataLoader({
      getBars: async (params) => {
        await loader(params);
      },
    });

    return () => {
      mounted = false;
    };
  }, [loadCandles, pane.interval, pane.symbol]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !drawingTool) return;
    if (drawingTool === "clear") {
      const overlays = chart.getOverlays();
      overlays.forEach((overlay) => {
        chart.removeOverlay({ id: overlay.id });
      });
      setDrawingTool(null);
      return;
    }
    const overlayId = chart.createOverlay(drawingTool);
    if (overlayId) {
      setDrawingTool(null);
    }
  }, [drawingTool, setDrawingTool]);

  return (
    <div
      ref={containerRef}
      className={`relative flex h-full min-h-[360px] flex-1 rounded-md bg-slate-950/40 ${
        isActive ? "ring-1 ring-sky-500/70" : "ring-0"
      }`}
      onClick={() => setActivePane(pane.id)}
    >
      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 text-xs">
        <span className="rounded bg-slate-900/80 px-2 py-1 font-semibold text-slate-100 shadow">
          {pane.symbol}
        </span>
        <span className="rounded bg-slate-900/60 px-2 py-1 text-slate-400 shadow">
          {pane.interval.toUpperCase()} · {pane.chartStyle.toUpperCase()}
        </span>
      </div>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 text-xs text-slate-400">
          Loading market data…
        </div>
      )}
      {error && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 text-xs text-rose-400">
          {error}
        </div>
      )}
    </div>
  );
}
