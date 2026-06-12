"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import { AppQueryProvider } from "@/providers/query-provider";
import { PlayerProvider } from "@/providers/player-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppQueryProvider>
        <PlayerProvider>
          {children}
          <Toaster richColors position="top-center" />
        </PlayerProvider>
      </AppQueryProvider>
    </ThemeProvider>
  );
}
