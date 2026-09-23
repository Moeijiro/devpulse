import { PulseShell } from "@/components/pulse-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <PulseShell>{children}</PulseShell>;
}
