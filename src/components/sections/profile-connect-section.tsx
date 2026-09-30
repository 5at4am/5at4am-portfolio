import { ConnectSketchbook } from "@/components/sketchbook/connect-sketchbook";
import { ContactLinks } from "./contact-links";
import { Section } from "@/components/ui/section";
import { AVAILABILITY } from "@/content/site";

/**
 * Contact section for the profile page: availability statement, icon-led
 * contact list, and the interactive paper sketchbook.
 *
 * The sketchbook is a vendored ThreeUI component by Meng To, credited inline
 * because the illustrations are his work rather than the site owner's.
 */
export function ProfileConnectSection() {
  return (
    <Section id="connect" title="Connect me" variant="terminal">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-14">
        <div>
          <p className="leading-relaxed text-muted-foreground">
            {AVAILABILITY.statementWithChannel}
          </p>
          <ContactLinks showIcons />
        </div>

        <div>
          <ConnectSketchbook />
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            The paper sketchbook above is an MIT licensed{" "}
            <a
              href="https://threeui.com/css/sketchbook"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground focus-visible:text-foreground"
            >
              ThreeUI Community
            </a>{" "}
            component by Meng To, shown as a draggable paper study. Its plates are
            his Singapore illustrations, not my work.
          </p>
        </div>
      </div>
    </Section>
  );
}
