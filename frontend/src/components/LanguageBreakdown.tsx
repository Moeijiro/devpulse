"use client";

import { LanguageStat } from "@/lib/api";

interface LanguageBreakdownProps {
  languages: LanguageStat[];
}

export default function LanguageBreakdown({ languages }: LanguageBreakdownProps) {
  if (!languages || languages.length === 0) {
    return (
      <div className="text-xs text-zinc-500 font-mono py-4 text-center">
        No language telemetry detected.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Multi-Bar */}
      <div className="h-3 w-full rounded-full overflow-hidden flex bg-zinc-900 border border-zinc-800">
        {languages.map((l) => (
          <div
            key={l.language}
            style={{ width: `${l.percentage}%`, backgroundColor: l.color }}
            className="h-full transition-all hover:opacity-90"
            title={`${l.language}: ${l.percentage}% (${l.repo_count} repos)`}
          />
        ))}
      </div>

      {/* Legend / Badges */}
      <div className="flex flex-wrap gap-3">
        {languages.map((l) => (
          <div key={l.language} className="flex items-center gap-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: l.color }}
            />
            <span className="font-medium text-zinc-200">{l.language}</span>
            <span className="text-zinc-500 font-mono text-[11px]">{l.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
