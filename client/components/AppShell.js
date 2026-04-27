"use client";

import Link from "next/link";
import { Building2, Heart, LayoutDashboard, LogOut, Ticket, UserRound } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export function AppShell({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="shell">
      <header className="topbar">
        <Link href="/" className="brand">
          <span className="brand-mark"><Building2 size={19} /></span>
          Rental Move
        </Link>
        <nav className="nav">
          <Link href="/">Listings</Link>
          {user?.role === "tenant" && <Link href="/dashboard"><LayoutDashboard size={16} /> Dashboard</Link>}
          {user?.role === "tenant" && <Link href="/compare"><Heart size={16} /> Compare</Link>}
          {user?.role === "tenant" && <Link href="/tickets"><Ticket size={16} /> Tickets</Link>}
          {user?.role === "admin" && <Link href="/admin"><LayoutDashboard size={16} /> Admin</Link>}
          {user ? (
            <button onClick={logout} type="button"><LogOut size={16} /> Logout</button>
          ) : (
            <Link href="/login"><UserRound size={16} /> Login</Link>
          )}
        </nav>
      </header>
      {children}
    </div>
  );
}
