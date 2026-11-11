import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/ui/Toast";
import { DemoBanner } from "@/ui/DemoBanner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MandateGate — AI Agent Spending Control & PayPal Gateway",
  description:
    "Deterministic spending-control and trusted PayPal payment gateway for autonomous shopping agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="bg-background text-foreground min-h-screen font-sans selection:bg-violet-600/30 selection:text-violet-200">
        <ToastProvider>
          <DemoBanner />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

