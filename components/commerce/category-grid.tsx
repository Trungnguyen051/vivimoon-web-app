import Link from 'next/link';
import Image from 'next/image';

export function CategoryGrid({ items }: { items: { label: string; href: string; image: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {items.map((it) => (
        <Link key={it.href} href={it.href} className="group flex flex-col items-center gap-2">
          <div className="relative aspect-square w-full overflow-hidden rounded-full bg-muted">
            <Image src={it.image} alt={it.label} fill className="object-cover" sizes="120px" />
          </div>
          <span className="text-sm font-medium">{it.label}</span>
        </Link>
      ))}
    </div>
  );
}
