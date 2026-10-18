import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PillLink } from '@/components/ui/pill-link';

type ColorItem = { label: string; count: string; swatch: string; href: string };
type DurationItem = { number: string; unit: string; count: string; href: string };

export function ShopByFilter({
  title, seeMoreHref, seeMoreLabel, colorLabel, colorItems, durationLabel, durationItems,
}: {
  title: string;
  seeMoreHref: string;
  seeMoreLabel: string;
  colorLabel: string;
  colorItems: ColorItem[];
  durationLabel: string;
  durationItems: DurationItem[];
}) {
  return (
    <section className="space-y-10 rounded-2xl bg-[#e8ddc8] p-8 md:p-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-3xl font-semibold tracking-tight text-[#0a0a0a] md:text-4xl">{title}</h2>
        <PillLink href={seeMoreHref}>{seeMoreLabel}</PillLink>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-medium text-[#0a0a0a]">{colorLabel}</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {colorItems.map((it) => (
            <Link
              key={it.label}
              href={it.href}
              className="group flex flex-col gap-3 rounded bg-white p-5 shadow-[0_4px_20px_0_rgba(0,0,0,0.08)] transition-transform hover:-translate-y-0.5"
            >
              <span
                className="size-10 rounded-full border border-black/10"
                style={{ backgroundColor: it.swatch }}
                aria-hidden
              />
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-xl font-medium text-foreground">{it.label}</p>
                  <p className="text-sm text-muted-foreground">{it.count}</p>
                </div>
                <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-medium text-[#0a0a0a]">{durationLabel}</h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {durationItems.map((it) => (
            <Link
              key={it.unit + it.number}
              href={it.href}
              className="group flex items-start gap-3 rounded bg-white p-5 transition-transform hover:-translate-y-0.5"
            >
              <span className="text-4xl font-semibold text-[#1a1a1a]">{it.number}</span>
              <div className="flex-1 space-y-2">
                <p className="text-xl font-medium text-foreground">{it.unit}</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">{it.count}</p>
                  <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
