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
    <table className="w-full text-sm">
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k} className="border-b">
            <th scope="row" className="py-2 text-left font-medium text-muted-foreground">{k}</th>
            <td className="py-2 text-right">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
