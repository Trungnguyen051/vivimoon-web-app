import { Badge } from '@/components/ui/badge';
import type { Review } from '@/lib/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';

export function ReviewSourceBadge({
  source, sourceUrl, dict,
}: {
  source: Review['source'];
  sourceUrl?: string;
  dict: Dictionary;
}) {
  const label = dict.pdp.reviewSource[source];

  if (!sourceUrl) {
    return <Badge variant="outline">{label}</Badge>;
  }

  return (
    <Badge variant="outline" asChild>
      <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    </Badge>
  );
}
