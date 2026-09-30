"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>;

/**
 * Single source of truth for the colour scheme.
 *
 * Wraps `next-themes`, which writes the `dark` class onto `<html>` — the
 * selector `@custom-variant dark (&:is(.dark *))` in `globals.css` keys off —
 * and persists the choice in `localStorage` under `theme`.
 *
 * `attribute="class"` is required: the project themes through a class, not a
 * `data-` attribute. `defaultTheme="system"` means a first visit follows the OS
 * and keeps following it until the reader picks a theme explicitly.
 *
 * `next-themes` injects a blocking script ahead of first paint, so the correct
 * palette is on screen before anything renders. That is why the `<html>` element
 * carries `suppressHydrationWarning` — the class it adds is not in the SSR
 * markup.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
