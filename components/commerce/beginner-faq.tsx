import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

/** "Trả lời nhanh cho người mới" — entries already resolved to one locale. The first starts open, as drawn. */
export function BeginnerFaq({
  title, entries, guideLabel, guideHref,
}: {
  title: string; entries: { question: string; answer: string }[]; guideLabel: string; guideHref: string;
}) {
  return (
    <section className="flex flex-col gap-3 md:gap-6">
      <h2 className="text-xl font-semibold tracking-tight md:text-4xl">{title}</h2>
      <Accordion defaultValue={['0']} className="border-t">
        {entries.map((e, i) => (
          <AccordionItem key={e.question} value={String(i)} className="border-b">
            <AccordionTrigger className="py-4 text-sm font-medium md:py-5 md:text-base">{e.question}</AccordionTrigger>
            <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground md:pb-5 md:text-base">
              {e.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <Link href={guideHref} className="inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline md:text-base">
        <BookOpen className="size-4.5 md:size-5" aria-hidden />
        {guideLabel}
      </Link>
    </section>
  );
}
