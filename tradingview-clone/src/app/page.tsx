'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import { TopToolbar } from "@/components/layout/TopToolbar";
import { DrawingToolbar } from "@/components/chart/DrawingToolbar";
import { TradingChart } from "@/components/chart/TradingChart";
import { useChartStore } from "@/store/chartStore";

const layoutClasses: Record<number, string> = {
  1: "grid-cols-1 grid-rows-1",
  2: "grid-cols-2 grid-rows-1",
  4: "grid-cols-2 grid-rows-2",
};

export default function Home() {
  const { panes, layout, activePaneId } = useChartStore((state) => ({
    panes: state.panes,
    layout: state.layout,
    activePaneId: state.activePaneId,
  }));

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopToolbar />
        <div className="flex flex-1 overflow-hidden">
          <DrawingToolbar />
          <main
            className={`grid flex-1 gap-3 overflow-y-auto bg-slate-950/40 p-3 ${layoutClasses[layout]}`}
          >
            {panes.map((pane) => (
              <TradingChart
                key={`${pane.id}-${pane.symbol}-${pane.interval}`}
                pane={pane}
                isActive={pane.id === activePaneId}
              />
            ))}
          </main>
        </div>
      </div>
    </div>
  );
}
