import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { PillLink } from '@/components/ui/pill-link';

/** A browsing entry point: its swatches, the count of what it opens, and where it goes. */
type ColorFamilyTile = { id: string; label: string; count: string; swatches: string[]; href: string };
type DurationTile = { id: string; label: string; image: string; href: string };

export function ShopByFilter({
  title, seeMoreHref, seeMoreLabel, colorFamilies, durations,
}: {
  title: string;
  seeMoreHref: string;
  seeMoreLabel: string;
  colorFamilies: ColorFamilyTile[];
  durations: DurationTile[];
}) {
  return (
    /* No panel: the design seats these tiles on the page and lets each one's own
       border do the separating, so a tinted wrapper would be a second container
       competing with them (#81). The homepage's band alternation still reads —
       this band sits plain between two tinted ones. */
    <section className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
        <PillLink href={seeMoreHref}>{seeMoreLabel}</PillLink>
      </div>

      {/* The design has no sub-headings here: the swatches and the photos say which axis each row is. */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {colorFamilies.map((family) => (
          <Link
            key={family.id}
            href={family.href}
            className="group flex flex-col gap-6 border border-[#ddd] bg-white p-[21px] shadow-[0_0_4px_0_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-0.5"
          >
            {/* Spaced, not stacked: overlapping chips read as one object, where the
                design's spacing reads as "these are the colours you can have". */}
            <span className="flex gap-2">
              {family.swatches.map((swatch, i) => (
                <span
                  key={`${family.id}-${i}`}
                  className="size-7 rounded-full ring-1 ring-black/10"
                  style={{ backgroundColor: swatch }}
                  aria-hidden
                />
              ))}
            </span>
            <span className="flex flex-col gap-4">
              <span className="text-xl font-medium text-[#0a0a0a]">{family.label}</span>
              <span className="flex items-center justify-between gap-2">
                <span className="text-base text-[#6b6b6b]">{family.count}</span>
                {/* With the heavy shadow gone, this is the only thing marking the
                    tile as somewhere to go rather than a summary card. */}
                <ArrowRight
                  aria-hidden
                  className="size-6 shrink-0 text-[#0a0a0a] transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </span>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {durations.map((duration) => (
          <Link
            key={duration.id}
            href={duration.href}
            className="group overflow-hidden rounded bg-white shadow-[0_4px_20px_0_rgba(0,0,0,0.08)] transition-transform hover:-translate-y-0.5"
          >
            <span className="relative block aspect-[16/9] overflow-hidden">
              <Image src={duration.image} alt="" fill className="object-cover" sizes="(max-width:640px) 100vw, 33vw" />
            </span>
            <span className="block p-5 font-medium text-[#0a0a0a]">{duration.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
