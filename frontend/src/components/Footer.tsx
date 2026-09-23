import Link from "next/link";
import { Activity } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950 py-10 mt-20 text-xs text-zinc-500">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" />
          <span>DevPulse — Factual GitHub Developer & Repository Telemetry.</span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/Moeijiro/devpulse"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition"
          >
            GitHub Repository
          </a>
          <span>MIT License © 2026</span>
        </div>
      </div>
    </footer>
  );
}
