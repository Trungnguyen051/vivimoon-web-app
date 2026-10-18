import { ShieldCheck, Headset, RotateCcw, Zap } from 'lucide-react';

/**
 * The glyph per badge is code, not copy, so it lives here keyed by id — adding a
 * badge without choosing its glyph is a type error rather than a blank square.
 */
const GLYPHS = { authentic: ShieldCheck, consult: Headset, returns: RotateCcw, express: Zap } as const;

export type TrustBadge = { id: keyof typeof GLYPHS; title: string; body: string };

/**
 * The four promises the design puts where the return-policy promo band used to be.
 * The bodies are placeholders until Vivimoon supplies the real copy (#53); they read as
 * obviously unfinished rather than passing as final copy.
 */
export function TrustBadges({ badges }: { badges: TrustBadge[] }) {
  return (
    <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {badges.map((badge) => {
        const Glyph = GLYPHS[badge.id];
        return (
          <div key={badge.id} className="space-y-3">
            <Glyph className="size-7 text-[#8a5a33]" aria-hidden />
            <p className="font-medium">{badge.title}</p>
            <p className="text-sm text-muted-foreground">{badge.body}</p>
          </div>
        );
      })}
    </section>
  );
}
