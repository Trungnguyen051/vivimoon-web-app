'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/ui/accordion';

/** One answer, already resolved to the reader's locale by the page. */
export type FaqAnswer = {
  slug: string;
  question: string;
  paragraphs: string[];
  links: { href: string; label: string }[];
};

/**
 * One answer open at a time, which is the design's own note on this section. The
 * alternative — every row expandable at once — turns a page of 26 questions into a
 * wall of prose the reader has to scroll past to reach the next question.
 *
 * `hiddenUntilFound` keeps the closed panels mounted and marked `hidden="until-found"`
 * rather than unmounted. On a page whose entire purpose is to answer questions, a
 * collapsed answer that is absent from the HTML is an answer a search engine never
 * indexes and the reader's own Ctrl+F never finds; this way the browser expands the
 * matching row for them.
 *
 * `#faq-<slug>` opens that one answer, which is how the hub's "Xem chi tiết" lands a
 * reader on the question they clicked rather than on a page of collapsed rows to find
 * it again in. A fragment never reaches the server, so this is read after mount — and
 * read rather than trusted, since it arrives from the URL bar: a fragment naming no
 * entry opens nothing instead of emptying the accordion's state.
 *
 * `hashchange` as well as mount, because a second card on the same page is a same-page
 * navigation the browser answers without remounting anything.
 *
 * It keys on the slugs rather than on `entries`. The page builds that prop with an
 * inline `.map`, so its identity is new on every render — depending on it meant a
 * `router.refresh()` snapped the reader back to the fragment's row and discarded the
 * answer they had opened by hand. The slug string only changes when the list genuinely
 * does, which is the one time re-reading the fragment is right.
 */
export function FaqAccordion({ entries, linksLabel }: { entries: FaqAnswer[]; linksLabel: string }) {
  const [open, setOpen] = useState<string[]>([]);
  const slugKey = entries.map((entry) => entry.slug).join('|');

  useEffect(() => {
    const slugs = new Set(slugKey.split('|'));
    const openFromHash = () => {
      const slug = window.location.hash.replace(/^#faq-/, '');
      // Read rather than trusted: it arrives from the URL bar, and a fragment naming no
      // entry opens nothing instead of emptying the accordion's state.
      if (slug && slugs.has(slug)) setOpen([slug]);
    };

    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, [slugKey]);

  return (
    <Accordion
      value={open}
      onValueChange={(value) => setOpen(value as string[])}
      multiple={false}
      hiddenUntilFound
      className="border-t"
    >
      {entries.map((entry) => (
        <AccordionItem key={entry.slug} value={entry.slug} id={`faq-${entry.slug}`} className="border-b">
          <AccordionTrigger className="py-5 text-base font-medium">
            {entry.question}
          </AccordionTrigger>
          <AccordionContent className="pb-5">
            {entry.paragraphs.map((paragraph, i) => (
              <p key={i} className="text-muted-foreground">{paragraph}</p>
            ))}
            {/* Links sit beside the prose rather than inside it, so an answer still
                needs no parser and every href stays checkable (ADR-0019). */}
            {entry.links.length > 0 ? (
              <ul aria-label={linksLabel} className="mt-4 flex flex-col gap-1">
                {entry.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
