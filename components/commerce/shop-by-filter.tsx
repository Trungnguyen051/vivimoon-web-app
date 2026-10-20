import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { PillLink } from '@/components/ui/pill-link';
import { cn } from '@/lib/utils/cn';

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
  // Two-up leaves an odd last tile beside empty space; it spans instead.
  const oddCount = colorFamilies.length % 2 === 1;

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

      {/* The design has no sub-headings here: the swatches and the photos say which axis each row is.

          Five across at lg, as drawn. Below that there is no frame to follow, so:
          three at md (5 → 3+2, nothing stranded) and two on phones, where an odd
          count would strand the last tile beside a gap — hence `oddCount`, which
          lets it take the whole row instead. A scroller would hide options a
          shopper is trying to compare, and a single stack would push the duration
          row below five full-height cards (#82). */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {colorFamilies.map((family, i) => (
          <Link
            key={family.id}
            href={family.href}
            className={cn(
              'group flex flex-col gap-6 border border-[#ddd] bg-white p-[21px] shadow-[0_0_4px_0_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-0.5',
              oddCount && i === colorFamilies.length - 1 && 'col-span-2 md:col-span-1',
            )}
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
              {/* 20px only clears `Màu sắc nổi bật` once a tile is ~259px wide, which is
                    1280 up; at the 5-up lg tile of 176px it wraps and makes the row
                    uneven, so the step waits for xl. Measured, not guessed (#82). */}
                <span className="text-base font-medium text-[#0a0a0a] xl:text-xl">{family.label}</span>
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
