import Link from 'next/link';
import Image from 'next/image';
import { PillLink } from '@/components/ui/pill-link';
import { cn } from '@/lib/utils/cn';

/**
 * An article as a card: already resolved to one locale by the page that renders it.
 *
 * `eyebrow` and `dateline` are optional because two surfaces render this and only one
 * of them asks for the full card. The Knowledge index states a Reading Theme and a
 * dateline of author · reading time · date (#129); the homepage's Kiến thức row shows
 * neither, and adding them there would be a design change nobody asked for. Optional
 * beats a second card component that drifts from this one.
 */
export type ArticleCard = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  href: string;
  eyebrow?: string;
  dateline?: string;
};

/** The Kiến thức section, and the index the section's CTA opens — the header is what differs. */
export function ArticleCards({
  articles, title, viewAllHref, viewAllLabel, bordered = false,
}: {
  articles: ArticleCard[];
  title?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  /** The index draws its cards bordered; the homepage row does not. */
  bordered?: boolean;
}) {
  return (
    <section className="space-y-10">
      {title ? (
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
          {viewAllHref && viewAllLabel ? <PillLink href={viewAllHref}>{viewAllLabel}</PillLink> : null}
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={article.href}
            className={cn(
              'group flex flex-col gap-4',
              bordered && 'rounded-xl border p-4 transition-colors hover:bg-muted/40',
            )}
          >
            <span className="relative block aspect-[16/10] overflow-hidden rounded">
              <Image
                src={article.image}
                alt=""
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                sizes="(max-width:640px) 100vw, 33vw"
              />
            </span>
            {article.eyebrow ? (
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {article.eyebrow}
              </p>
            ) : null}
            <p className="text-lg font-medium leading-snug tracking-tight">{article.title}</p>
            <p className="line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>
            {article.dateline ? <p className="text-sm text-muted-foreground">{article.dateline}</p> : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
