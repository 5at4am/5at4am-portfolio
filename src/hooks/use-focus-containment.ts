"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Keeps Tab and Shift+Tab inside `ref` while `active`, and hands focus back
 * where it came from when `active` goes false.
 *
 * Two jobs, and the second is the one that is easy to miss. A panel that
 * captures focus but never gives it back strands the user: Escape closes the
 * menu, focus falls to `<body>`, and the next Tab starts again from the top of
 * the document, so reaching the nav by keyboard means tabbing the whole page
 * again on every visit. Returning focus to the trigger is what makes the
 * control feel like a control.
 *
 * The tabbable set is read fresh on every Tab rather than cached, because the
 * panel's contents change size as it animates and links navigate away from it.
 * A cached list would trap focus on a node that is no longer there.
 *
 * `onEscape` is handled by the caller's own hook — this one owns Tab and focus
 * only, so the two concerns stay separable.
 */
export function useFocusContainment(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  returnFocusTo?: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!active) return;
    const root = ref.current;
    /* Nothing to contain, or the trigger is already unmounting. Bail rather
       than trapping focus against a node that is not there. */
    if (!root) return;

    /* Where focus goes back to when the panel closes.
     *
     * The trigger is passed in rather than read from `document.activeElement`,
     * because a tap does not reliably focus the button that was tapped: on
     * touch browsers, and under emulated touch, `activeElement` is still
     * `<body>` when the panel opens. Capturing it then remembered `<body>`, and
     * the restore was a no-op that left focus stranded on the document.
     *
     * The fallback is for callers with no trigger to offer. */
    const restoreTo =
      returnFocusTo?.current ?? (document.activeElement as HTMLElement | null);

    const tabbables = (): HTMLElement[] =>
      [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) =>
          /* offsetParent is null for `display: none` subtrees. A collapsed
             disclosure is still in the DOM and still matches the selector, so
             without this Tab walks into links nobody can see. */
          el.offsetParent !== null && !el.hasAttribute("disabled"),
      );

    /* Open with focus on the first real control, so the keyboard user is
       already inside the thing they just opened instead of having to Tab in
       from the toggle. rAF, because the panel animates in from opacity 0 and
       is not focusable-hittable until it has been laid out. */
    const raf = requestAnimationFrame(() => {
      const first = tabbables()[0];
      (first ?? root).focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = tabbables();
      /* An empty panel cannot wrap meaningfully; let the browser do whatever
         it would do rather than stealing the key. */
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement as HTMLElement | null;

      /* Only intervene at the two ends. In the middle, Tab is the browser's
         job and reordering it here would fight native focus order. */
      if (event.shiftKey && (current === first || !root.contains(current))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (current === last || !root.contains(current))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown);
      /* Hand focus back to the trigger. Unconditionally, while still connected.

         Focus cannot have legitimately moved elsewhere in the meantime — the
         body is scroll-locked and Tab is contained, so the only places it can
         be are inside this panel or on the document. Leaving it on `<body>` is
         the one outcome worth avoiding: the next Tab restarts from the top of
         the page, so reaching the nav by keyboard costs a full page of tabbing
         every time.

         It also covers the close-by-link case. Tapping "About" unmounts the
         panel out from under the focused link, and returning to the toggle
         leaves the keyboard somewhere predictable rather than nowhere. */
      if (restoreTo?.isConnected) restoreTo.focus();
    };
  }, [ref, active, returnFocusTo]);
}
