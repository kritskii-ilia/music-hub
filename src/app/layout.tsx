import type { Metadata } from "next";
import Script from "next/script";

import "@/app/globals.css";

import { AppShell } from "@/components/app-shell";
import { AppProviders } from "@/providers/app-providers";

export const metadata: Metadata = {
  title: "MyMusic",
  description: "Telegram Mini App personal music library MVP",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script src="https://telegram.org/js/telegram-web-app.js?61" strategy="beforeInteractive" />
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
