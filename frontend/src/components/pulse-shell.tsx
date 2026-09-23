"use client";

import { LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/brand";
import { AppShell, ShellAccount, type NavItem } from "@/components/kit/shell";

const NAV: NavItem[] = [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }];

export function PulseShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell brand={<Logo />} items={NAV}
      footer={<ShellAccount name="Public data only" detail="api.github.com" note="Reads public GitHub data, cached for 15 minutes to stay inside the rate limit." />}>
      {children}
    </AppShell>
  );
}
