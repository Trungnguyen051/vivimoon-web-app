import Link from 'next/link';
import Image from 'next/image';

/** A look as a card: already resolved to one locale by the page that renders it. */
export type MakeupLookCard = { id: string; title: string; image: string; lensName: string; href: string };

/**
 * Lenses on a face (#131). A shopper judging a colour gets to judge it the way they will
 * actually wear it, rather than on a product shot against white — so each card opens the
 * lens worn in the look.
 *
 * Portrait, and still portrait on a phone: the crop is the content here, and a band that
 * reflows into letterboxes defeats what it is for. One column at 390px, four across from
 * the large breakpoint up.
 *
 * No play control. The concept is a short clip and no footage exists, so these are
 * stills — a control that plays nothing misrepresents the content more than a still
 * does. No view-all either: this band is the complete set, and a control promising more
 * would have to invent somewhere to send a shopper.
 */
export function MakeupLooks({ title, looks }: { title: string; looks: MakeupLookCard[] }) {
  return (
    <section className="flex flex-col gap-10">
      <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {looks.map((look) => (
          <Link key={look.id} href={look.href} className="group flex flex-col gap-4">
            <span className="relative block aspect-[3/4] overflow-hidden rounded-xl">
              <Image
                src={look.image}
                alt=""
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
              />
            </span>
            <p className="text-base font-medium leading-snug tracking-tight">{look.title}</p>
            {/* The caption is the point of the band: the look names the lens it wears. */}
            <p className="text-sm text-muted-foreground">{look.lensName}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
