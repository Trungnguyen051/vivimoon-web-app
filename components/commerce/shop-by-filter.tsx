import Link from 'next/link';
import Image from 'next/image';
import { PillLink } from '@/components/ui/pill-link';

/** A Color Family entry point: its swatches, its placeholder count, and the filtered collection it opens. */
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
    <section className="space-y-10 rounded-2xl bg-[#e8ddc8] p-8 md:p-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-3xl font-semibold tracking-tight text-[#0a0a0a] md:text-4xl">{title}</h2>
        <PillLink href={seeMoreHref}>{seeMoreLabel}</PillLink>
      </div>

      {/* The design has no sub-headings here: the swatches and the photos say which axis each row is. */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {colorFamilies.map((family) => (
          <Link
            key={family.id}
            href={family.href}
            className="group flex flex-col gap-3 rounded bg-white p-5 shadow-[0_4px_20px_0_rgba(0,0,0,0.08)] transition-transform hover:-translate-y-0.5"
          >
            <span className="flex -space-x-2">
              {family.swatches.map((swatch, i) => (
                <span
                  key={`${family.id}-${i}`}
                  className="size-10 rounded-full border-2 border-white ring-1 ring-black/10"
                  style={{ backgroundColor: swatch }}
                  aria-hidden
                />
              ))}
            </span>
            <div className="flex items-end justify-between gap-2">
              <span className="font-medium text-[#0a0a0a]">{family.label}</span>
              <span className="text-xs text-[#0a0a0a]/60">{family.count}</span>
            </div>
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
