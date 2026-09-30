import { ConnectThreeDPaper } from "@/components/three-d-paper/connect-three-d-paper";

/**
 * Full-section interactive 3D paper showcase. Three portrait documents side by
 * side on the near-black void they render against: the portfolio certificate,
 * the Estrel capstone, and the Wiiz capstone award.
 */
export function CredentialsSection() {
  return (
    <section className="border-t border-border bg-[#08080a]">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-3">
        <ConnectThreeDPaper variant="original" className="aspect-[4/5] w-full" />
        <ConnectThreeDPaper variant="estrel" className="aspect-[4/5] w-full" />
        <ConnectThreeDPaper variant="wiiz" className="aspect-[4/5] w-full" />
      </div>
    </section>
  );
}