"use client";

import { useSyncExternalStore } from "react";

/** Never fires: this store is read once, not subscribed to. */
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * `false` on the server and during the hydration render, `true` as soon as the
 * client has taken over.
 *
 * The active theme is only knowable in the browser — `next-themes` reads it
 * back out of `localStorage` after mount — so anything that renders
 * theme-dependent markup needs this to hold a stable first paint and then
 * correct itself.
 *
 * `useSyncExternalStore` with a `getServerSnapshot` does that in one re-render
 * straight after hydration, where the usual `useState` + `useEffect` flag costs
 * an extra commit and trips `react-hooks/set-state-in-effect`.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
