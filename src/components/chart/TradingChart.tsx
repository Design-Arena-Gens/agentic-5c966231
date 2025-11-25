"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import type { Chart, KLineData } from "klinecharts";
import { dispose, init } from "klinecharts";
import type { PaneConfig } from "@/store/chartStore";
import { useChartStore } from "@/store/chartStore";
import type { Candle, ChartStyle } from "@/types/chart";

interface TradingChartProps {
  pane: PaneConfig;
  isActive: boolean;
}

interface CandleResponse {
  candles: Candle[];
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error(`Request failed with ${res.status}`);
    }
    return res.json();
  });

function formatCandles(data?: Candle[]): KLineData[] {
  if (!data) return [];
  return data
    .slice()
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((item) => ({
      timestamp: item.timestamp,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
    }));
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
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(500);
  const { drawingTool, setDrawingTool, setActivePane } = useChartStore(
    (state) => ({
      drawingTool: state.drawingTool,
      setDrawingTool: state.setDrawingTool,
      setActivePane: state.setActivePane,
    }),
  );

  const { data, isLoading } = useSWR<CandleResponse>(
    `/api/klines?symbol=${pane.symbol}&interval=${pane.interval}&limit=${limit}`,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: false,
      onError(err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      },
    },
  );

  useEffect(() => {
    setLimit(500);
  }, [pane.symbol, pane.interval]);

  useEffect(() => {
    if (data) {
      setError(null);
    }
  }, [data]);

  const candles = useMemo(
    () => formatCandles(data?.candles),
    [data?.candles],
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

    applyChartStyle(chart, pane.chartStyle);

    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    resizeObserver.observe(containerRef.current!);

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
    if (!chart || candles.length === 0) return;
    chart.applyNewData(candles);
    chart.scrollToRealTime();
  }, [candles]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !drawingTool) return;
    if (drawingTool === "clear") {
      chart.removeOverlay();
      setDrawingTool(null);
      return;
    }
    const overlayId = chart.createOverlay(drawingTool);
    if (overlayId) {
      setDrawingTool(null);
    }
  }, [drawingTool, setDrawingTool]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const handleVisibleRangeChange = () => {
      const range = chart.getVisibleRange();
      if (range.from <= 5) {
        setLimit((prev) => Math.min(prev + 200, 1500));
      }
    };

    chart.subscribeAction("onVisibleRangeChange", handleVisibleRangeChange);
    return () => {
      chart.unsubscribeAction("onVisibleRangeChange", handleVisibleRangeChange);
    };
  }, [pane.interval, pane.symbol]);

  return (
    <div
      ref={containerRef}
      className={`relative flex h-full min-h-[360px] flex-1 rounded-md bg-slate-950/40 ${
        isActive ? "ring-1 ring-sky-500/70" : "ring-0"
      }`}
      onClick={() => setActivePane(pane.id)}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 text-xs text-slate-400">
          Loading market data…
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 text-xs text-rose-400">
          {error}
        </div>
      )}
    </div>
  );
}
