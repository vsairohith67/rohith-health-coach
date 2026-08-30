"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./icons";

const desktopNavigation: Array<{
  href: string;
  label: string;
  icon: IconName;
}> = [
  { href: "/today", label: "Today", icon: "today" },
  { href: "/trends", label: "Trends", icon: "trends" },
  { href: "/sleep", label: "Sleep", icon: "sleep" },
  { href: "/heart", label: "Heart", icon: "heart" },
  { href: "/activity", label: "Activity", icon: "activity" },
  { href: "/coach", label: "Coach", icon: "coach" },
  { href: "/ask", label: "Ask my data", icon: "ask" },
];
const mobileNavigation: Array<{ href: string; label: string; icon: IconName }> =
  [
    desktopNavigation[0]!,
    desktopNavigation[1]!,
    desktopNavigation[5]!,
    desktopNavigation[6]!,
    { href: "/settings", label: "Settings", icon: "settings" },
  ];

export function AppShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary">
        <Link
          className="brand"
          href="/today"
          aria-label="Rohith Health Coach home"
        >
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span>
            Rohith
            <br />
            Health Coach
          </span>
        </Link>
        <nav className="desktop-nav">
          {desktopNavigation.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              active={pathname === item.href}
            />
          ))}
        </nav>
        <div className="sidebar-privacy">
          <Icon name="shield" width="25" />
          <span>
            No health data
            <br />
            sent to AI
          </span>
        </div>
        <Link className="privacy-link" href="/privacy">
          Privacy details <span aria-hidden="true">↗</span>
        </Link>
      </aside>
      <header className="mobile-header">
        <Link className="mobile-brand" href="/today">
          Rohith Health Coach
        </Link>
        <Link
          className="icon-button"
          href="/settings"
          aria-label="Open settings"
        >
          <Icon name="menu" width="26" />
        </Link>
      </header>
      <main id="main-content" className="main-content">
        {children}
      </main>
      <nav className="mobile-nav" aria-label="Primary mobile navigation">
        {mobileNavigation.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            active={pathname === item.href}
          />
        ))}
      </nav>
    </div>
  );
}

function NavItem({
  item,
  active,
}: Readonly<{
  item: { href: string; label: string; icon: IconName };
  active: boolean;
}>) {
  return (
    <Link
      href={item.href}
      className={active ? "nav-item active" : "nav-item"}
      aria-current={active ? "page" : undefined}
    >
      <Icon name={item.icon} width="22" />
      <span>{item.label}</span>
    </Link>
  );
}
