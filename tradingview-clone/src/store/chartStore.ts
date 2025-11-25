import { create } from "zustand";
import type { ChartStyle, Interval } from "@/types/chart";
import { defaultSymbols } from "@/constants/symbols";

export interface PaneConfig {
  id: string;
  symbol: string;
  interval: Interval;
  chartStyle: ChartStyle;
}

export type LayoutPreset = 1 | 2 | 4;

interface ChartState {
  panes: PaneConfig[];
  activePaneId: string;
  layout: LayoutPreset;
  drawingTool: string | null;
  watchlist: typeof defaultSymbols;
  setActivePane: (id: string) => void;
  updatePane: (id: string, patch: Partial<Omit<PaneConfig, "id">>) => void;
  setLayout: (layout: LayoutPreset) => void;
  setDrawingTool: (tool: string | null) => void;
  setSymbolForActivePane: (symbol: string) => void;
  setIntervalForActivePane: (interval: Interval) => void;
  cycleChartStyle: () => void;
}

const chartStyles: ChartStyle[] = ["candlestick", "ohlc", "line", "area"];

const defaultPane: PaneConfig = {
  id: "pane-0",
  symbol: "BTCUSDT",
  interval: "1h",
  chartStyle: "candlestick",
};

export const useChartStore = create<ChartState>((set, get) => ({
  panes: [defaultPane],
  activePaneId: defaultPane.id,
  layout: 1,
  drawingTool: null,
  watchlist: defaultSymbols,
  setActivePane: (id) => set({ activePaneId: id }),
  updatePane: (id, patch) =>
    set((state) => ({
      panes: state.panes.map((pane) =>
        pane.id === id ? { ...pane, ...patch } : pane,
      ),
    })),
  setLayout: (layout) =>
    set((state) => {
      if (layout === state.layout) {
        return state;
      }
      const current = state.panes;
      if (layout === 1) {
        return { layout, panes: [current[0] ?? defaultPane] };
      }
      if (layout === 2) {
        const next = current.length >= 2 ? current.slice(0, 2) : [...current];
        while (next.length < 2) {
          next.push({
            id: `pane-${next.length}`,
            symbol: state.activePaneId
              ? state.panes.find((p) => p.id === state.activePaneId)?.symbol ??
                defaultPane.symbol
              : defaultPane.symbol,
            interval: "1h",
            chartStyle: "candlestick",
          });
        }
        return { layout, panes: next };
      }
      const filled = [...current];
      while (filled.length < 4) {
        filled.push({
          id: `pane-${filled.length}`,
          symbol: filled[0]?.symbol ?? defaultPane.symbol,
          interval: filled[0]?.interval ?? "1h",
          chartStyle: filled[0]?.chartStyle ?? "candlestick",
        });
      }
      return { layout, panes: filled.slice(0, 4) };
    }),
  setDrawingTool: (tool) => set({ drawingTool: tool }),
  setSymbolForActivePane: (symbol) => {
    const { activePaneId } = get();
    if (!activePaneId) return;
    get().updatePane(activePaneId, { symbol });
  },
  setIntervalForActivePane: (interval) => {
    const { activePaneId } = get();
    if (!activePaneId) return;
    get().updatePane(activePaneId, { interval });
  },
  cycleChartStyle: () => {
    const { activePaneId, panes } = get();
    const activePane = panes.find((pane) => pane.id === activePaneId);
    if (!activePane) return;
    const currentIdx = chartStyles.indexOf(activePane.chartStyle);
    const nextStyle = chartStyles[(currentIdx + 1) % chartStyles.length];
    get().updatePane(activePaneId, { chartStyle: nextStyle });
  },
}));
