"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon, type IconName } from "./icons";

type NavigationItem = {
  href: string;
  label: string;
  icon: IconName;
};

type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

const navigationGroups: NavigationGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/today", label: "Today", icon: "today" },
      { href: "/trends", label: "Trends", icon: "trends" },
      { href: "/sleep", label: "Sleep", icon: "sleep" },
      { href: "/heart", label: "Heart", icon: "heart" },
      { href: "/activity", label: "Activity", icon: "activity" },
      { href: "/wellbeing", label: "Wellbeing", icon: "heart" },
      { href: "/coach", label: "Coach", icon: "coach" },
    ],
  },
  {
    label: "Explore",
    items: [
      { href: "/ask", label: "Ask my data", icon: "ask" },
      { href: "/experiments", label: "Experiments", icon: "target" },
      { href: "/reports", label: "Reports", icon: "evidence" },
    ],
  },
  {
    label: "Data",
    items: [
      { href: "/data-sources", label: "Data sources", icon: "shield" },
      { href: "/imports", label: "Imports", icon: "activity" },
      {
        href: "/settings/ingestion",
        label: "iPhone ingestion",
        icon: "settings",
      },
    ],
  },
  {
    label: "Settings & help",
    items: [
      { href: "/settings", label: "Settings", icon: "settings" },
      { href: "/settings/ai", label: "AI controls", icon: "shield" },
      { href: "/privacy", label: "Privacy", icon: "shield" },
      { href: "/methodology", label: "Methodology", icon: "evidence" },
      { href: "/data-dictionary", label: "Data dictionary", icon: "ask" },
      { href: "/onboarding", label: "Welcome", icon: "today" },
    ],
  },
];

const mobileNavigation: NavigationItem[] = [
  { href: "/today", label: "Today", icon: "today" },
  { href: "/trends", label: "Trends", icon: "trends" },
  { href: "/coach", label: "Coach", icon: "coach" },
  { href: "/ask", label: "Ask", icon: "ask" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

export function AppShell({
  children,
  privateMode = false,
}: Readonly<{ children: React.ReactNode; privateMode?: boolean }>) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  useEffect(() => {
    if (!mobileNavigationOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavigationOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileNavigationOpen]);

  return (
    <div
      className={sidebarCollapsed ? "app-shell sidebar-collapsed" : "app-shell"}
    >
      <aside className="sidebar" aria-label="Primary">
        <div className="sidebar-heading">
          <Link
            className="brand"
            href="/today"
            aria-label="Rohith Health Coach home"
          >
            <span className="brand-mark" aria-hidden="true">
              <span />
            </span>
            <span className="brand-label">
              Rohith
              <br />
              Health Coach
            </span>
          </Link>
          <button
            className="sidebar-toggle"
            type="button"
            aria-controls="desktop-navigation"
            aria-expanded={!sidebarCollapsed}
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
          >
            <span aria-hidden="true">{sidebarCollapsed ? "›" : "‹"}</span>
          </button>
        </div>
        <div className="desktop-nav-scroll">
          <NavigationGroups
            id="desktop-navigation"
            idPrefix="desktop"
            pathname={pathname}
          />
        </div>
        <SidebarFooter privateMode={privateMode} />
      </aside>

      <header className="mobile-header">
        <Link className="mobile-brand" href="/today">
          Rohith Health Coach
        </Link>
        <button
          className="icon-button"
          type="button"
          aria-label="Open all navigation"
          aria-controls="mobile-navigation"
          aria-expanded={mobileNavigationOpen}
          onClick={() => setMobileNavigationOpen(true)}
        >
          <Icon name="menu" width="26" />
        </button>
      </header>

      {mobileNavigationOpen ? (
        <div className="mobile-navigation-layer">
          <button
            className="mobile-navigation-backdrop"
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileNavigationOpen(false)}
          />
          <aside
            id="mobile-navigation"
            className="mobile-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-navigation-title"
          >
            <div className="mobile-navigation-heading">
              <h2 id="mobile-navigation-title">All features</h2>
              <button
                className="mobile-navigation-close"
                type="button"
                aria-label="Close navigation"
                autoFocus
                onClick={() => setMobileNavigationOpen(false)}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="mobile-navigation-scroll">
              <NavigationGroups
                idPrefix="mobile"
                pathname={pathname}
                onNavigate={() => setMobileNavigationOpen(false)}
              />
            </div>
            <SidebarFooter privateMode={privateMode} mobile />
          </aside>
        </div>
      ) : null}

      <main id="main-content" className="main-content">
        {children}
      </main>
      <nav className="mobile-nav" aria-label="Primary mobile navigation">
        {mobileNavigation.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            active={
              item.href === "/settings"
                ? pathname.startsWith("/settings")
                : pathname === item.href
            }
          />
        ))}
      </nav>
    </div>
  );
}

function NavigationGroups({
  id,
  idPrefix,
  pathname,
  onNavigate,
}: Readonly<{
  id?: string;
  idPrefix: string;
  pathname: string;
  onNavigate?: () => void;
}>) {
  return (
    <nav id={id} className="desktop-nav" aria-label="All features">
      {navigationGroups.map((group) => {
        const headingId = `${idPrefix}-${group.label
          .toLowerCase()
          .replaceAll(/[^a-z]+/g, "-")}-navigation`;
        return (
          <section
            className="navigation-group"
            aria-labelledby={headingId}
            key={group.label}
          >
            <h2 id={headingId} className="navigation-group-title">
              {group.label}
            </h2>
            <div className="navigation-group-links">
              {group.items.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  active={pathname === item.href}
                  {...(onNavigate ? { onNavigate } : {})}
                />
              ))}
            </div>
          </section>
        );
      })}
    </nav>
  );
}

function SidebarFooter({
  privateMode,
  mobile = false,
}: Readonly<{ privateMode: boolean; mobile?: boolean }>) {
  return (
    <div className={mobile ? "sidebar-footer mobile" : "sidebar-footer"}>
      <div className="sidebar-privacy">
        <Icon name="shield" width="25" />
        <span>
          No health data
          <br />
          sent to AI
        </span>
      </div>
      <Link
        className="privacy-link"
        href="/privacy"
        aria-label="Privacy details"
      >
        <Icon name="shield" width="18" />
        <span>
          Privacy details <span aria-hidden="true">↗</span>
        </span>
      </Link>
      {privateMode ? (
        <form
          className="sign-out-form"
          action="/auth/sign-out"
          method="post"
          onSubmit={() =>
            navigator.serviceWorker?.controller?.postMessage(
              "CLEAR_PRIVATE_CACHE",
            )
          }
        >
          <button type="submit" aria-label="Sign out">
            <span className="sign-out-symbol" aria-hidden="true">
              ↪
            </span>
            <span className="sign-out-label">Sign out</span>
          </button>
        </form>
      ) : null}
    </div>
  );
}

function NavItem({
  item,
  active,
  onNavigate,
}: Readonly<{
  item: NavigationItem;
  active: boolean;
  onNavigate?: () => void;
}>) {
  return (
    <Link
      href={item.href}
      className={active ? "nav-item active" : "nav-item"}
      aria-current={active ? "page" : undefined}
      aria-label={item.label}
      title={item.label}
      {...(onNavigate ? { onClick: onNavigate } : {})}
    >
      <Icon name={item.icon} width="22" />
      <span>{item.label}</span>
    </Link>
  );
}
