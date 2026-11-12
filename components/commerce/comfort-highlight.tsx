import Link from 'next/link';
import { Clock, Droplet, Eye } from 'lucide-react';
import type { Product } from '@/lib/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/** "Độ thoải mái khi đeo" — hidden for a lens with no comfort data. */
export function ComfortHighlight({
  comfort, waterContent, whyHref, dict,
}: {
  comfort: Product['comfort']; waterContent: string; whyHref: string; dict: Dictionary['pdp']['comfort'];
}) {
  if (!comfort) return null;
  const stats = [
    { Icon: Droplet, label: dict.waterContent, value: waterContent },
    { Icon: Clock, label: dict.wearHours, value: dict.wearHoursValue.replace('{n}', String(comfort.wearHours)) },
    { Icon: Eye, label: dict.sensitiveEyes, value: comfort.sensitiveEyes ? dict.suitable : dict.notSuitable },
  ];

  return (
    <section className="flex flex-col gap-4 rounded-xl bg-muted/60 p-4 md:p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold md:text-base">{dict.title}</h2>
        <Link href={whyHref} className="text-xs underline underline-offset-4 hover:text-primary md:text-sm">{dict.why}</Link>
      </div>
      <dl className="grid grid-cols-3 gap-2 md:gap-4">
        {stats.map(({ Icon, label, value }) => (
          <div key={label} className="flex min-w-0 flex-col gap-2 rounded-lg bg-background p-2.5 md:flex-row md:items-center md:gap-2.5 md:bg-transparent md:p-0">
            <span className="hidden size-9 shrink-0 items-center justify-center rounded-full bg-background md:flex">
              <Icon className="size-4.5" aria-hidden />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <dt className="text-[11px] text-muted-foreground md:text-xs">{label}</dt>
              <dd className="text-sm font-semibold md:text-base">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
