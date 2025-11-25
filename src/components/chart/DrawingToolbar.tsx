"use client";

import {
  Brush,
  Eraser,
  Minus,
  PencilRuler,
  Ruler,
  Slash,
  Square,
  TrendingUp,
} from "lucide-react";
import { useChartStore } from "@/store/chartStore";

const drawingTools = [
  { id: "straightLine", label: "Trend Line", icon: TrendingUp },
  { id: "rayLine", label: "Ray", icon: Slash },
  { id: "segment", label: "Segment", icon: Minus },
  { id: "horizontalStraightLine", label: "Horizontal", icon: Ruler },
  { id: "verticalStraightLine", label: "Vertical", icon: PencilRuler },
  { id: "parallelStraightLine", label: "Parallel", icon: PencilRuler },
  { id: "priceLine", label: "Price Line", icon: Minus },
  { id: "priceChannelLine", label: "Channel", icon: Square },
  { id: "fibonacciLine", label: "Fibonacci", icon: PencilRuler },
  { id: "brush", label: "Brush", icon: Brush },
];

export function DrawingToolbar() {
  const { drawingTool, setDrawingTool } = useChartStore((state) => ({
    drawingTool: state.drawingTool,
    setDrawingTool: state.setDrawingTool,
  }));

  return (
    <nav className="flex w-14 flex-shrink-0 flex-col items-center gap-2 border-r border-slate-800 bg-slate-950/60 px-2 py-4">
      {drawingTools.map((tool) => {
        const Icon = tool.icon;
        const isActive = drawingTool === tool.id;
        return (
          <button
            key={tool.id}
            type="button"
            onClick={() =>
              setDrawingTool(isActive ? null : (tool.id as string))
            }
            className={`flex h-12 w-12 items-center justify-center rounded-md border transition ${
              isActive
                ? "border-sky-500/80 bg-sky-600/20 text-sky-300"
                : "border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200"
            }`}
            title={tool.label}
          >
            <Icon className="h-5 w-5" />
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => setDrawingTool("clear")}
        className="mt-3 flex h-12 w-12 items-center justify-center rounded-md border border-slate-800 text-slate-400 transition hover:border-rose-500 hover:text-rose-400"
        title="Clear drawings"
      >
        <Eraser className="h-5 w-5" />
      </button>
    </nav>
  );
}
