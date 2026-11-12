import Link from 'next/link';
import { Check, RefreshCw, ShieldCheck } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

/**
 * Under the buy buttons: the trust row and the return policy, open by default because
 * most shoppers don't know the policy exists (spec #190). The period and the lenses it
 * covers are `returnPolicy.terms` — one string, so every surface states the same policy.
 */
export function ProductReassurance({
  dict, detailsHref, howToHref,
}: {
  dict: Pick<Dictionary, 'returnPolicy'> & { trust: Dictionary['pdp']['trust'] };
  detailsHref: string;
  howToHref: string;
}) {
  const p = dict.returnPolicy;
  const trust = [
    { Icon: ShieldCheck, title: dict.trust.authentic, body: dict.trust.license },
    { Icon: RefreshCw, title: dict.trust.refund, body: p.terms },
  ];

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {trust.map(({ Icon, title, body }) => (
          <li key={title} className="flex items-start gap-2.5">
            <Icon className="mt-0.5 size-5 shrink-0 text-primary md:size-6" aria-hidden />
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-muted-foreground">{body}</p>
            </div>
          </li>
        ))}
      </ul>

      <Accordion defaultValue={['policy']} className="rounded-xl border px-4 md:px-5">
        <AccordionItem value="policy">
          <AccordionTrigger className="items-center gap-2 py-3.5 text-sm font-semibold hover:no-underline md:py-4 md:text-base">
            <RefreshCw className="size-4.5 shrink-0 md:size-5" aria-hidden />
            <span className="flex-1">{p.title}</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <ul className="flex flex-col gap-2">
              {[p.terms, p.refund, p.swap].map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              <Link href={detailsHref}>{p.details}</Link>
              <Link href={howToHref}>{p.howTo}</Link>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
