import { cn } from "@/lib/utils";

export type TagListProps = {
  items: readonly string[];
  /**
   * Accessible name for the list, e.g. `"CoalSutra stack"`. Announced by
   * screen readers so a bare run of tags is not read without context.
   */
  label: string;
  /** `onDark` restyles the chips for a dark-glass surface. */
  tone?: "default" | "onDark";
  className?: string;
};

/**
 * Monospace chip list used for tech stacks and skill groups.
 */
export function TagList({ items, label, tone = "default", className }: TagListProps) {
  return (
    <ul aria-label={label} className={cn("mt-4 flex flex-wrap gap-2", className)}>
      {items.map((item) => (
        <li
          key={item}
          className={cn(
            "rounded-sm border px-2 py-1 font-mono text-xs",
            tone === "onDark"
              ? "border-white/10 bg-white/5 text-zinc-100/90"
              : "border-border text-muted-foreground"
          )}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
