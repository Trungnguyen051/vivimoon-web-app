import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { PillLink } from '@/components/ui/pill-link';

const COLUMN_CLASSES = { 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' } as const;

export function CategoryGrid({
  items, title, subtitle, seeMoreHref, seeMoreLabel, columns = 3,
}: {
  items: { label: string; href: string; image: string }[];
  title?: string;
  subtitle?: string;
  seeMoreHref?: string;
  seeMoreLabel?: string;
  columns?: 3 | 4;
}) {
  return (
    <div className="space-y-10">
      {title ? (
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
          <div className="flex flex-col items-start gap-4 sm:items-end">
            {subtitle ? <p className="max-w-xs text-muted-foreground sm:text-right">{subtitle}</p> : null}
            {seeMoreHref && seeMoreLabel ? <PillLink href={seeMoreHref}>{seeMoreLabel}</PillLink> : null}
          </div>
        </div>
      ) : null}
      <div className={cn('grid grid-cols-1 gap-4', COLUMN_CLASSES[columns])}>
        {items.map((it) => (
          <Link
            key={it.image}
            href={it.href}
            className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted"
          >
            <Image
              src={it.image}
              alt={it.label}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(max-width:640px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-5">
              <span className="text-lg font-medium tracking-tight text-white">{it.label}</span>
              <span className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors group-hover:bg-white group-hover:text-black">
                <ArrowUpRight className="size-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
