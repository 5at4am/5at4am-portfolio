import { ContactLinks } from "./contact-links";
import { Section } from "@/components/ui/section";
import { AVAILABILITY } from "@/content/site";

/**
 * Availability statement and contact channels on the home resume.
 * The profile page uses `ProfileConnectSection`, which adds the sketchbook.
 *
 * The list here is the whole of it. The draggable ball that opens these same
 * three channels used to sit in this section; it is now a fixed overlay owned
 * by the page (`ContactBall`), which floats above the whole document and can
 * be dragged anywhere on screen. Keeping a copy of the links in the section
 * it no longer lives in would have been the point of the section — a plain
 * list that reads top to bottom, works without a pointer, and never hides
 * anything behind a gesture. Everything the ball does, this does faster.
 */
export function ContactSection() {
  return (
    <Section id="contact" title="Contact">
      <div className="max-w-2xl">
        <p className="leading-relaxed text-muted-foreground">
          {AVAILABILITY.statement}
        </p>
        <ContactLinks showIcons />
      </div>
    </Section>
  );
}