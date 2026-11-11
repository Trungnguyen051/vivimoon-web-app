import Link from 'next/link';
import Image from 'next/image';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

/**
 * The article at the top of the Knowledge index, at full width (#129).
 *
 * It is the first of whatever the current query returns — not an editorial flag and not
 * a field on an Article. Narrowing the index changes which article leads it, which is
 * the point: the band can never show something the filter excluded. The eyebrow is
 * named for that position rather than called "featured", because nothing about the
 * selection is a judgement anyone made.
 */
export function LeadArticle({
  eyebrow, title, excerpt, image, href, dateline, theme, ctaLabel,
}: {
  eyebrow: string;
  title: string;
  excerpt: string;
  image: string;
  href: string;
  dateline: string;
  theme: string;
  ctaLabel: string;
}) {
  return (
    <section className="grid gap-6 md:grid-cols-2 md:items-center">
      {/* The image carries no label of its own, and the title and the call to action
          beside it already lead here. Named, it would be a third link to the same place
          in a screen reader's link list; unnamed and focusable, it is an unnamed link —
          so it is neither. The other image links in this repo put their label inside the
          anchor, which is what makes their empty `alt` correct. */}
      <Link
        href={href}
        aria-hidden="true"
        tabIndex={-1}
        className="group relative block aspect-[16/10] overflow-hidden rounded-xl"
      >
        <Image
          src={image}
          alt=""
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          // Full width on a phone, half the container from the medium breakpoint up.
          sizes="(max-width:768px) 100vw, 50vw"
        />
      </Link>

      <div className="flex flex-col items-start gap-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{eyebrow}</p>
        <p className="text-sm text-muted-foreground">{theme}</p>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          <Link href={href} className="hover:underline">{title}</Link>
        </h2>
        <p className="text-muted-foreground">{excerpt}</p>
        <p className="text-sm text-muted-foreground">{dateline}</p>
        {/* Size comes from the variant rather than a spelled-out height, so this and
            every other large call to action stay one decision. */}
        <Link href={href} className={cn(buttonVariants({ size: 'xl' }))}>{ctaLabel}</Link>
      </div>
    </section>
  );
}
