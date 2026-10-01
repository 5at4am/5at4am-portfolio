"use client";

import { useEffect, useState } from "react";

/**
 * The footer's clock: the visitor's local time once hydrated, a stable
 * placeholder before that.
 *
 * Two decisions worth stating.
 *
 * **The placeholder is a dash, not a guessed time.** Rendering the server's
 * idea of the time and correcting it on the client is a hydration mismatch on
 * every visit from a different timezone. A dash is honest about not knowing
 * yet and produces byte-identical markup on both sides, so there is nothing to
 * warn about. The swap happens in an effect, after adoption.
 *
 * **It ticks every 30 seconds, not every second.** Nobody reads a footer
 * clock to the second, and the footer is the widest link surface on the page —
 * a per-second re-render of it is a per-second re-render of all of it, for a
 * number that changes once a minute. `HH:MM` is shown without seconds, so a
 * minute is exactly the granularity being displayed.
 */
export function ClientClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const read = () =>
      setTime(
        new Intl.DateTimeFormat(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date()),
      );

    read();
    /* Re-align to the next minute boundary before ticking, so the display
       does not sit up to 30s stale right after mount and then jump. */
    let interval = 0;
    const first = window.setTimeout(() => {
      read();
      interval = window.setInterval(read, 60000);
    }, 60000 - (Date.now() % 60000) + 50);

    return () => {
      window.clearTimeout(first);
      if (interval) window.clearInterval(interval);
    };
  }, []);

  return (
    /* `suppressHydrationWarning` is belt-and-braces: the server renders the
       dash and so does the first client render, so this should never fire. It
       is here because a timezone-sensitive string is exactly the kind of value
       that drifts out of sync the first time someone edits the placeholder. */
    <span suppressHydrationWarning>
      {time ? `${time} your time` : "— your time"}
    </span>
  );
}