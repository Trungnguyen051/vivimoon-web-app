import { PillLink } from '@/components/ui/pill-link';

/** Homepage teaser for the lens-matching Quiz (ADR concept, app/[locale]/quiz) — not a second quiz implementation. */
export function QuizCta({
  title, subtitle, stepLabel, optionA, optionB, ctaLabel, href,
}: {
  title: string;
  subtitle: string;
  stepLabel: string;
  optionA: string;
  optionB: string;
  ctaLabel: string;
  href: string;
}) {
  return (
    <section className="grid items-center gap-10 rounded-2xl bg-[#1a1a1a] p-8 md:grid-cols-2 md:p-16">
      <div className="space-y-5">
        <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h2>
        <p className="max-w-sm text-white/60">{subtitle}</p>
        <PillLink href={href} variant="light">{ctaLabel}</PillLink>
      </div>
      <div className="relative mx-auto hidden h-56 w-full max-w-sm sm:block">
        <div className="absolute inset-x-6 top-4 h-full rotate-6 rounded bg-white/10" aria-hidden />
        <div className="absolute inset-x-3 top-2 h-full rotate-3 rounded bg-white/20" aria-hidden />
        <div className="relative space-y-4 rounded bg-white p-6 shadow-xl">
          <p className="text-3xl font-semibold text-[#d0c1a4]">01</p>
          <p className="text-foreground">{stepLabel}</p>
          <div className="space-y-2">
            <div className="rounded border px-3 py-2.5 text-sm">{optionA}</div>
            <div className="rounded border px-3 py-2.5 text-sm">{optionB}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
