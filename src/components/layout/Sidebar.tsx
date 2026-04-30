"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const NAV = [
  { group: "Overview", items: [{ href: "/dashboard", label: "Dashboard", icon: "⬛" }] },
  {
    group: "Properties",
    items: [
      { href: "/projects", label: "Projects", icon: "🏗️" },
      { href: "/plots", label: "Plots / Flats", icon: "🗺️" },
      { href: "/land-records", label: "Land Records", icon: "📜" },
    ],
  },
  {
    group: "Sales",
    items: [
      { href: "/customers", label: "Customers", icon: "👥" },
      { href: "/leads", label: "Leads", icon: "🎯" },
      { href: "/bookings", label: "Bookings", icon: "📋" },
      { href: "/installments", label: "Installments", icon: "📅" },
      { href: "/visits", label: "Project Visits", icon: "🚗" },
    ],
  },
  {
    group: "Finance",
    items: [
      { href: "/receipts", label: "Money Receipts", icon: "🧾" },
      { href: "/vouchers", label: "Vouchers", icon: "📄" },
      { href: "/accounts", label: "Account Heads", icon: "📊" },
      { href: "/loans", label: "Loans", icon: "💳" },
    ],
  },
  {
    group: "Marketing",
    items: [
      { href: "/officers", label: "Officers", icon: "👔" },
      { href: "/commission", label: "Commission", icon: "💰" },
      { href: "/wallet", label: "Wallet", icon: "👛" },
      { href: "/requests", label: "Requests", icon: "📩" },
      { href: "/offers", label: "Offers", icon: "🎁" },
    ],
  },
  {
    group: "Investment",
    items: [
      { href: "/investors", label: "Investors", icon: "📈" },
      { href: "/investments", label: "Investments", icon: "💼" },
      { href: "/dividends", label: "Dividends", icon: "💵" },
    ],
  },
  {
    group: "HR",
    items: [
      { href: "/employees", label: "Employees", icon: "🧑‍💼" },
      { href: "/attendance", label: "Attendance", icon: "📌" },
      { href: "/payroll", label: "Payroll", icon: "💸" },
    ],
  },
  {
    group: "System",
    items: [
      { href: "/sms", label: "SMS Logs", icon: "📱" },
      { href: "/documents", label: "Documents", icon: "🗂️" },
      { href: "/assets", label: "Assets", icon: "🔑" },
      { href: "/logs", label: "System Logs", icon: "📝" },
    ],
  },
];

export default function Sidebar() {
  const path = usePathname();
  const { user, logout } = useAuth(); // ✅ FIXED

  return (
    <aside
      style={{
        width: "var(--sidebar-w)",
        minHeight: "100vh",
        background: "#0c1929",
        color: "white",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        overflowY: "auto",
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ fontSize: "18px", fontWeight: 700 }}>
          RE<span style={{ color: "#38bdf8" }}>ERP</span>
        </div>
        <div style={{ fontSize: "11px", color: "#94a3b8" }}>
          Real Estate Management
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px" }}>
        {NAV.map((group) => (
          <div key={group.group}>
            <div
              style={{
                fontSize: "10px",
                color: "#475569",
                padding: "10px 10px 4px",
              }}
            >
              {group.group}
            </div>

            {group.items.map((item) => {
              const active = path.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    gap: "8px",
                    padding: "7px 10px",
                    borderRadius: "7px",
                    color: active ? "#38bdf8" : "#cbd5e1",
                    background: active ? "rgba(56,189,248,.1)" : "transparent",
                    textDecoration: "none",
                  }}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(255,255,255,.08)",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: "13px", fontWeight: 600 }}>
            {user?.full_name || "Admin"}
          </div>
          <div style={{ fontSize: "11px", color: "#94a3b8" }}>
            {user?.role}
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            background: "rgba(239,68,68,.15)",
            color: "#fca5a5",
            border: "none",
            padding: "5px 10px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}