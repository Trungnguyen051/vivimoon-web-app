import type { ProductSpecs } from '@/lib/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';

export function SpecTable({ specs, dict }: { specs: ProductSpecs; dict: Dictionary }) {
  const rows: [string, string][] = [
    [dict.pdp.material, specs.material],
    [dict.pdp.waterContent, specs.waterContent],
    [dict.pdp.baseCurve, specs.baseCurve],
    [dict.pdp.diameter, specs.diameter],
    // Only colored lenses carry a graphic-zone diameter (ADR-0011).
    ...(specs.graphicDiameter ? [[dict.pdp.graphicDiameter, specs.graphicDiameter] as [string, string]] : []),
    [dict.pdp.origin, specs.origin],
  ];
  return (
    <dl className="flex flex-col">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-2 gap-3 border-b py-2.5 text-sm last:border-b-0 md:flex md:justify-between md:py-3">
          <dt className="text-muted-foreground">{k}</dt>
          <dd className="font-medium text-foreground md:text-right">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
