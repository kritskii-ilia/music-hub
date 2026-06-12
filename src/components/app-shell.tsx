"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { FolderPlus, HelpCircle, House, Library, Music2 } from "lucide-react";

import { useTelegram } from "@/hooks/use-telegram";
import { cn } from "@/lib/utils";
import { AuthBootstrap } from "@/components/auth-bootstrap";
import { PlayerBar } from "@/components/player-bar";

const navItems = [
  { href: "/", label: "Home", icon: House },
  { href: "/music", label: "My Music", icon: Music2 },
  { href: "/playlists", label: "Playlists", icon: Library },
  { href: "/import", label: "Import", icon: FolderPlus },
  { href: "/settings", label: "Help", icon: HelpCircle },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { themeParams, viewportStableHeight, colorScheme, isTelegram } = useTelegram();

  useEffect(() => {
    const root = document.documentElement;

    if (themeParams.bg_color) {
      root.style.setProperty("--app-bg", themeParams.bg_color);
    }
    if (themeParams.text_color) {
      root.style.setProperty("--app-fg", themeParams.text_color);
    }
    if (themeParams.button_color) {
      root.style.setProperty("--tg-button-color", themeParams.button_color);
    }
    if (themeParams.button_text_color) {
      root.style.setProperty("--tg-button-text-color", themeParams.button_text_color);
    }
    if (viewportStableHeight) {
      root.style.setProperty("--tg-stable-height", `${viewportStableHeight}px`);
    }
    if (isTelegram) {
      root.classList.toggle("dark", colorScheme === "dark");
    }
  }, [colorScheme, isTelegram, themeParams, viewportStableHeight]);

  return (
    <div
      className="mx-auto flex min-h-screen max-w-md flex-col bg-[var(--app-bg)] text-[var(--app-fg)]"
      style={{
        minHeight: "var(--tg-stable-height, 100vh)",
      }}
    >
      <main className="flex-1 px-4 pb-36 pt-4">
        <AuthBootstrap />
        {children}
      </main>
      <PlayerBar />
      <nav className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-md -translate-x-1/2 border-t border-white/10 bg-black/80 px-2 py-2 backdrop-blur">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium",
                active ? "bg-white text-black" : "text-white/70",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
