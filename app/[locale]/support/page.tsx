import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CreditCard, Eye, Glasses, RotateCcw, Truck, UserRound,
  MessageCircle, Phone, Mail, MessagesSquare, type LucideIcon,
} from 'lucide-react';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary, type Dictionary } from '@/lib/i18n/dictionaries';
import { support } from '@/lib/api/resources/support';
import { topicSchema, type Topic } from '@/lib/api/schemas/support';
import { CONTACT_CHANNELS } from '@/lib/support/contact-channels';
import { TrackingRequestForm } from '@/components/commerce/tracking-request-form';
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/ui/accordion';
import { SearchForm } from '@/components/commerce/search-form';
import { PageContainer } from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

/**
 * The Support hub's answer surface (#121). A shopper landing on Hỗ trợ is asked one
 * question and given two ways to answer it: a box to type into, and the five things a
 * first-time wearer actually worries about.
 *
 * Everything here is a link or a GET form. The box and the chips set `?q=` on the FAQ
 * page, which already knows how to search (#120), so this page needs no client state at
 * all — and works with JavaScript disabled for the same reason the FAQ page does.
 */
/**
 * One icon per Topic, keyed on the enum rather than listed in parallel: a seventh Topic
 * stops compiling here instead of rendering a tile with a hole in it.
 */
const TOPIC_ICONS: Record<Topic, LucideIcon> = {
  'nguoi-moi-deo-lens': Eye,
  'chon-lens-va-do-can': Glasses,
  'don-hang-va-thanh-toan': CreditCard,
  'giao-hang': Truck,
  'doi-tra-va-bao-hanh': RotateCcw,
  'tai-khoan-va-uu-dai': UserRound,
};

const CHANNEL_ICONS = {
  hotline: Phone, email: Mail, messenger: MessageCircle, zalo: MessagesSquare,
} as const;

/**
 * Derived from the dictionary, not listed beside it — the same reason `TOPIC_ICONS` is
 * keyed on the enum. A fifth policy added to both locales would otherwise type-check,
 * pass every test, and render nowhere.
 */
type PolicyId = keyof Dictionary['support']['service']['policies'];

export default async function SupportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);
  const hub = dict.support.hub;
  const service = dict.support.service;

  const featured = await support.listFeaturedFaqEntries();
  const faqHref = `/${locale}/support/faq`;

  /* The card opens that one answer, rather than dropping the reader on a page of
     collapsed rows to find it in again. The Topic rides along so the sidebar agrees
     with what is showing, and the fragment is what the accordion opens on. */
  const detailHref = (topic: string, slug: string) => `${faqHref}?category=${topic}#faq-${slug}`;

  return (
    <PageContainer>
      {/* 40px gutters, per ADR-0015 — the design draws 80px. */}
      <div className="flex flex-col gap-12 py-12">
        <section className="flex flex-col items-center gap-6 text-center">
          <h1 className="font-heading max-w-3xl text-3xl md:text-4xl">{hub.heroTitle}</h1>
          <p className="max-w-2xl text-muted-foreground">{hub.heroSubtitle}</p>

          <SearchForm
            action={faqHref}
            label={hub.searchLabel}
            placeholder={hub.searchPlaceholder}
            size="lg"
            className="w-full max-w-xl"
          />

          {/* Links, not buttons: each carries its own query and needs nothing to run. */}
          <nav aria-label={hub.commonSearches} className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">{hub.commonSearches}</span>
            {hub.chips.map((chip) => (
              <Link
                key={chip}
                href={`${faqHref}?q=${encodeURIComponent(chip)}`}
                className="rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-colors hover:bg-muted"
              >
                {chip}
              </Link>
            ))}
          </nav>
        </section>

        {/* Omitted whole rather than left as a heading over an empty row — the same
            call the FAQ page makes, and the same reason: an empty band under a title
            reads as something that failed to load. The fixtures fill it today; the
            resource is written toward a CMS that may not. */}
        {featured.length > 0 ? (
        <section className="flex flex-col gap-8">
          <h2 className="font-heading text-2xl md:text-3xl">{hub.featuredTitle}</h2>

          {/* One-up on phones, two-up on tablets; the design's five-across only fits
              from the large breakpoint. */}
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {featured.map((entry) => (
              <li key={entry.slug} className="flex h-full flex-col gap-3 rounded-xl border p-5">
                <h3 className="text-base font-medium leading-snug">{entry.question[locale]}</h3>
                {/* Authored, never truncated: a sentence cut mid-word on the first
                    screen of the help section reads as a bug rather than a summary. */}
                <p className="flex-1 text-sm text-muted-foreground">{entry.shortAnswer[locale]}</p>
                <Link
                  href={detailHref(entry.topic, entry.slug)}
                  className="text-sm underline underline-offset-4"
                >
                  {hub.seeDetail}
                </Link>
              </li>
            ))}
          </ul>

        </section>
        ) : null}

        {/* Outside the band: the way into every answer must survive an empty row. */}
        <div className="flex justify-center">
          <Link href={faqHref} className={cn(buttonVariants({ variant: 'outline', size: 'xl' }))}>
            {hub.seeAllFaq}
          </Link>
        </div>

        {/* Six tiles, not the design's four. Those four were drawn against a four-item
            taxonomy the spec rejects; against six Topics, four tiles leaves two with no
            way in from this page at all. */}
        <section className="flex flex-col gap-8">
          <h2 className="font-heading text-2xl md:text-3xl">{service.topicsTitle}</h2>
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {topicSchema.options.map((topic) => {
              const Icon = TOPIC_ICONS[topic];
              return (
                <li key={topic}>
                  <Link
                    href={`${faqHref}?category=${topic}`}
                    className="flex h-full items-center gap-3 rounded-xl border p-5 transition-colors hover:bg-muted"
                  >
                    <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="text-sm font-medium">{dict.support.topics[topic]}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Stacked on a phone, side by side from the large breakpoint. */}
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="flex flex-col gap-6">
            <h2 className="font-heading text-2xl md:text-3xl">{service.policiesTitle}</h2>
            {/* Expands in place rather than linking away, which is what keeps a set of
                policy-page routes from having to be invented here. The design's `›`
                becomes the accordion primitive's own chevron.

                `hiddenUntilFound` for the same reason the FAQ accordion uses it: a
                collapsed policy that is absent from the HTML is one no crawler indexes
                and the reader's own Ctrl+F never finds. "Is shipping free over
                300.000₫" is exactly the question someone searches this page for. */}
            <Accordion hiddenUntilFound className="border-t">
              {(Object.keys(service.policies) as PolicyId[]).map((policy) => (
                <AccordionItem key={policy} value={policy} className="border-b">
                  <AccordionTrigger className="py-4 text-base font-medium">
                    {service.policies[policy].title}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <p className="text-muted-foreground">{service.policies[policy].body}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <section className="flex flex-col gap-6">
            <h2 className="font-heading text-2xl md:text-3xl">{service.trackingTitle}</h2>
            {/* The real form, not a teaser. A shopper looking for help with a delivery
                should not have to know that Tra cứu đơn hàng is a different nav item. */}
            <div className="rounded-xl border p-6">
              <TrackingRequestForm dict={dict.tracking} />
            </div>
          </section>
        </div>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-2xl md:text-3xl">{service.contactTitle}</h2>
            <p className="text-muted-foreground">{service.contactSubtitle}</p>
          </div>
          {/* Values from `contact-channels.ts`, which the footer also reads — the two
              surfaces can no longer answer "what is the hotline" differently. */}
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {CONTACT_CHANNELS.map((channel) => {
              const Icon = CHANNEL_ICONS[channel.id];
              return (
                <li key={channel.id}>
                  <a
                    href={channel.href}
                    className="flex h-full flex-col gap-2 rounded-xl border p-5 transition-colors hover:bg-muted"
                  >
                    <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
                    <span className="text-sm font-medium">{service.channels[channel.id]}</span>
                    <span className="text-sm text-muted-foreground">{channel.value}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </PageContainer>
  );
}
