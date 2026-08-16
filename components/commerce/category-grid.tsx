import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

export function CategoryGrid({ items }: { items: { label: string; href: string; image: string }[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((it) => (
        <Link
          key={it.href}
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
  );
}
