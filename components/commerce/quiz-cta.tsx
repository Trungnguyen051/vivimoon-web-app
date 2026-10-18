import { PillLink } from '@/components/ui/pill-link';

/** One question the Quiz previews on the homepage — presentational, so its options are text, not controls. */
export type QuizStep = { id: string; prompt: string; options: string[] };

/**
 * Homepage teaser for the lens-matching Quiz (ADR concept, app/[locale]/quiz) — not a second quiz implementation.
 * The step cards preview the Quiz's shape, not its question set, and the copy claims no question count: the
 * design promised three, the Quiz asks six and shares none of the previewed questions (#35), and its content is
 * provisional, so any number here would drift. `quiz-cta.test.tsx` holds that line for both locales.
 */
export function QuizCta({
  eyebrow, title, subtitle, socialProof, ctaLabel, href, steps,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  socialProof: string;
  ctaLabel: string;
  href: string;
  steps: QuizStep[];
}) {
  return (
    <section className="space-y-10 rounded-2xl bg-[#1a1a1a] p-8 md:p-16">
      <div className="space-y-5">
        <p className="text-sm font-medium tracking-[0.2em] text-[#d0c1a4]">{eyebrow}</p>
        <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h2>
        <p className="max-w-md text-white/60">{subtitle}</p>
        <PillLink href={href} variant="light">{ctaLabel}</PillLink>
        <p className="text-sm text-white/50">{socialProof}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step, i) => (
          <div key={step.id} className="space-y-4 rounded bg-white p-6 shadow-xl">
            <p className="text-3xl font-semibold text-[#d0c1a4]">{String(i + 1).padStart(2, '0')}</p>
            <p className="text-foreground">{step.prompt}</p>
            <div className="space-y-2">
              {step.options.map((option, optionIndex) => (
                <div key={`${step.id}-${optionIndex}`} className="rounded border px-3 py-2.5 text-sm">{option}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
