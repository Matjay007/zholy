"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

/* ─── DS tokens ─── */
const C = {
  pageBg:     "#F7F8FA",
  sideBg:     "#FFFFFF",
  sideBorder: "#E4E7EC",
  divider:    "#F2F4F7",
  text1:      "#101828",
  text2:      "#344054",
  text3:      "#667085",
  text4:      "#98A2B3",
  accent:     "#4CE9E9",
  accentDark: "#0E7490",
  accentBg:   "rgba(76,233,233,0.08)",
  btnBg:      "#101828",
  btnText:    "#FFFFFF",
  badge:      "#F2F4F7",
};

/* ─── Nav items ─── */
const NAV = [
  { label: "Overview",       href: "/app",              icon: "grid" },
  { label: "Agents",         href: "/app/agents",        icon: "bot" },
  { label: "Conversations",  href: "/app/conversations", icon: "message" },
  { label: "Leads",          href: "/app/leads",         icon: "users" },
  { label: "Analytics",      href: "/app/analytics",     icon: "bar" },
  { label: "Knowledge",      href: "/app/knowledge",     icon: "book" },
  { label: "Billing",        href: "/app/billing",       icon: "credit" },
  { label: "Settings",       href: "/app/settings",      icon: "gear" },
];

/* ─── Icons ─── */
function Icon({ name, size = 16, color = C.text3 }: { name: string; size?: number; color?: string }) {
  const s = { width: size, height: size, display: "block" } as React.CSSProperties;
  const paths: Record<string, React.ReactNode> = {
    grid:    <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    bot:     <><rect x="2" y="7" width="20" height="14" rx="3"/><path d="M12 7V3"/><circle cx="8" cy="14" r="1.5"/><circle cx="16" cy="14" r="1.5"/><path d="M9 18h6"/></>,
    message: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
    users:   <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    bar:     <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    book:    <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>,
    credit:  <><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></>,
    gear:    <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    plus:    <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    logout:  <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  };
  return (
    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

/* ─── Logo ─── */
function Logo() {
  return (
    <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
      <path d="M20 8 Q8 8 8 20 L8 28 Q8 40 20 40" stroke={C.text1} strokeWidth="2.4" fill="none" strokeLinecap="round"/>
      <path d="M28 8 Q40 8 40 20 L40 28 Q40 40 28 40" stroke={C.text1} strokeWidth="2.4" fill="none" strokeLinecap="round"/>
      <rect x="13" y="20" width="2.8" height="8"  rx="1.4" fill={C.accent}/>
      <rect x="18" y="17" width="2.8" height="14" rx="1.4" fill={C.accent}/>
      <rect x="23" y="14" width="2.8" height="20" rx="1.4" fill={C.accent}/>
      <rect x="28" y="17" width="2.8" height="14" rx="1.4" fill={C.accent}/>
      <rect x="33" y="20" width="2.8" height="8"  rx="1.4" fill={C.accent}/>
    </svg>
  );
}

interface Props {
  tenantId: string;
  plan: string;
  planMinutes: number;
  minutesUsed: number;
  email: string;
  name: string;
}

export default function SidebarClient({ plan, planMinutes, minutesUsed, email, name }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/app") return pathname === "/app";
    return pathname.startsWith(href);
  };

  const pct = Math.min(100, Math.round((minutesUsed / planMinutes) * 100));
  const initials = (name || email || "?").charAt(0).toUpperCase();

  return (
    <aside
      style={{
        position: "fixed", left: 0, top: 0, width: 240, height: "100vh",
        display: "flex", flexDirection: "column", zIndex: 40,
        background: C.sideBg, borderRight: `1px solid ${C.sideBorder}`,
        fontFamily: "var(--sans)",
      }}
    >
      {/* Brand */}
      <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${C.divider}` }}>
        <Link href="/app" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Logo />
          <span style={{ fontSize: 15, fontWeight: 600, color: C.text1, letterSpacing: "-0.02em" }}>zholy</span>
        </Link>
      </div>

      {/* New Agent */}
      <div style={{ padding: "14px 16px 10px" }}>
        <Link
          href="/app/agents/new"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            width: "100%", padding: "8px 0", borderRadius: 10,
            background: C.btnBg, color: C.btnText,
            fontSize: 13, fontWeight: 500, textDecoration: "none",
            transition: "opacity 120ms",
          }}
        >
          <Icon name="plus" size={14} color="#FFF" />
          New Agent
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "4px 10px", overflowY: "auto" }}>
        {NAV.map(({ label, href, icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", borderRadius: 8, marginBottom: 2,
                background: active ? C.accentBg : "transparent",
                color: active ? C.accentDark : C.text3,
                fontSize: 13.5, fontWeight: active ? 500 : 400,
                textDecoration: "none",
                transition: "background 100ms, color 100ms",
              }}
            >
              <Icon name={icon} size={16} color={active ? C.accentDark : C.text3} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Usage */}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.divider}` }}>
        <div style={{ background: C.pageBg, borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: plan === "free" ? "#D97706" : C.accentDark, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {plan}
            </span>
            <span style={{ fontSize: 11, color: C.text4, fontVariantNumeric: "tabular-nums" }}>
              {minutesUsed} / {planMinutes} min
            </span>
          </div>
          <div style={{ height: 4, background: C.sideBorder, borderRadius: 99 }}>
            <div style={{
              width: `${pct}%`, height: "100%", borderRadius: 99,
              background: pct > 85 ? "#EF4444" : pct > 60 ? "#F59E0B" : C.accent,
              transition: "width 400ms ease",
            }} />
          </div>
        </div>

        {/* User */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
            background: C.accentBg, border: `1px solid ${C.sideBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 600, color: C.accentDark,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: C.text1, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {name || email.split("@")[0]}
            </p>
            <p style={{ fontSize: 11, color: C.text4, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {email}
            </p>
          </div>
          <button
            onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/signin") } })}
            title="Sign out"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", color: C.text4 }}
          >
            <Icon name="logout" size={15} color={C.text4} />
          </button>
        </div>
      </div>
    </aside>
  );
}
