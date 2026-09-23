"use client";

import { ActivityDay } from "@/lib/api";

interface ActivityChartProps {
  data: ActivityDay[];
  daysWindow: number;
}

export default function ActivityChart({ data, daysWindow }: ActivityChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-xs text-zinc-500 font-mono">
        No activity events recorded in this window.
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 5);

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-1 sm:gap-1.5 h-36 pt-4 px-2 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
        {data.map((d, i) => {
          const heightPct = Math.min(100, Math.max(8, (d.count / maxCount) * 100));
          return (
            <div
              key={d.date}
              className="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                <div className="bg-zinc-900 border border-zinc-700 text-white text-[10px] py-1 px-2 rounded shadow-xl whitespace-nowrap font-mono">
                  <p className="font-bold text-blue-400">{d.count} event{d.count !== 1 ? "s" : ""}</p>
                  <p className="text-zinc-400">{d.date}</p>
                  {d.events.length > 0 && (
                    <p className="text-zinc-500 italic max-w-[160px] truncate">{d.events[0]}</p>
                  )}
                </div>
              </div>

              {/* Bar */}
              <div
                style={{ height: `${heightPct}%` }}
                className={`w-full rounded-t transition-all ${
                  d.count > 0
                    ? "bg-blue-500 hover:bg-blue-400 group-hover:glow-blue"
                    : "bg-zinc-800/60 hover:bg-zinc-700"
                }`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[11px] text-zinc-500 font-mono px-2">
        <span>{data[0]?.date}</span>
        <span>Past {daysWindow} Days</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}
