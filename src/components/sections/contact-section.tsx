import { ContactLinks } from "./contact-links";
import { Section } from "@/components/ui/section";
import { AVAILABILITY } from "@/content/site";

/**
 * Availability statement and contact channels on the home resume.
 * The profile page uses `ProfileConnectSection`, which adds the sketchbook.
 */
export function ContactSection() {
  return (
    <Section id="contact" title="Contact">
      <div className="max-w-2xl">
        <p className="leading-relaxed text-muted-foreground">
          {AVAILABILITY.statement}
        </p>
        <ContactLinks />
      </div>
    </Section>
  );
}
