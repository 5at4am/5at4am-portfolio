import { cn } from "@/lib/utils";

export type BulletListProps = {
  items: readonly string[];
  className?: string;
};

/**
 * Square-bulleted list of accomplishment statements. The bullet is a
 * decorative `span`, so each item is announced as a plain list item rather
 * than with a stray "black square" character.
 */
export function BulletList({ items, className }: BulletListProps) {
  return (
    <ul className={cn("mt-4 space-y-2", className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-3 leading-relaxed text-muted-foreground">
          <span aria-hidden="true" className="mt-2.5 size-1 shrink-0 bg-border" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
