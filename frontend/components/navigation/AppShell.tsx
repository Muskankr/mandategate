"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function AppShell({
  children,
  title,
  subtitle,
  action,
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sidebar navigation */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main app body */}
      <div className="lg:pl-64 flex flex-col flex-1 transition-all duration-300">
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {(title || action) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-card-border/60">
              <div>
                {title && (
                  <h1 className="text-2xl font-bold tracking-tight text-white">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
              {action && <div className="flex items-center gap-2">{action}</div>}
            </div>
          )}

          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
}

