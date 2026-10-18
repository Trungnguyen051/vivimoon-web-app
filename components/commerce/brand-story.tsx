import Image from 'next/image';
import { PillLink } from '@/components/ui/pill-link';

/** A supporting photo: `id` is its identity, since the creative repeats while the real photography is pending (#30). */
export type BrandStoryImage = { id: string; src: string };

/**
 * The homepage brand-story band. Its CTA opens the About page, which carries the
 * same copy from `dict.brandStory` — the two must not drift apart.
 */
export function BrandStory({
  headingLine1, headingLine2, body, ctaLabel, href, images,
}: {
  headingLine1: string;
  headingLine2: string;
  body: string;
  ctaLabel: string;
  href: string;
  images: BrandStoryImage[];
}) {
  return (
    <section className="space-y-10">
      <div className="max-w-2xl space-y-5">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          <span className="block">{headingLine1}</span>
          <span className="block">{headingLine2}</span>
        </h2>
        <p className="text-muted-foreground">{body}</p>
        <PillLink href={href}>{ctaLabel}</PillLink>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {images.map((image) => (
          /* Atmosphere, not information: the story beside them says it all, so invented
             descriptions would only add noise for screen readers. Decorative by design. */
          <div key={image.id} className="relative aspect-[4/3] overflow-hidden rounded">
            <Image src={image.src} alt="" fill className="object-cover" sizes="(max-width:640px) 100vw, 33vw" />
          </div>
        ))}
      </div>
    </section>
  );
}
