import type { ProductSpecs } from '@/lib/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';

export function SpecTable({ specs, dict }: { specs: ProductSpecs; dict: Dictionary }) {
  const rows: [string, string][] = [
    [dict.pdp.material, specs.material],
    [dict.pdp.waterContent, specs.waterContent],
    [dict.pdp.baseCurve, specs.baseCurve],
    [dict.pdp.diameter, specs.diameter],
    [dict.pdp.uvProtection, specs.uvProtection ? '✓' : '—'],
    [dict.pdp.manufacturer, specs.manufacturer],
  ];
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-3">
      {rows.map(([k, v]) => (
        <div key={k} className="flex flex-col gap-1.5 bg-background p-5">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{k}</dt>
          <dd className="text-sm font-medium text-foreground">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
