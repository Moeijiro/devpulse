"use client";

import { useEffect, useState } from "react";
import { Gauge } from "lucide-react";
import { api, RateLimitStatus } from "@/lib/api";

export default function RateLimitBadge() {
  const [rateLimit, setRateLimit] = useState<RateLimitStatus | null>(null);

  useEffect(() => {
    api.getRateLimit().then(setRateLimit).catch(() => {});
  }, []);

  if (!rateLimit) return null;

  const isLow = rateLimit.remaining < 10;

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
      isLow 
        ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
        : "bg-zinc-900 border-zinc-800 text-zinc-400"
    }`}>
      <Gauge className="w-3 h-3 text-zinc-500" />
      <span>GitHub API: <strong className={isLow ? "text-amber-400" : "text-zinc-200"}>{rateLimit.remaining}</strong>/{rateLimit.limit}</span>
    </div>
  );
}
