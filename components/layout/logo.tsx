import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

/**
 * The wordmark, on whatever surface asks for it — the header and the footer size it
 * differently but neither should know which file to reach for.
 *
 * Only the black file is referenced. `public/Logo-white.svg` exists because the
 * design's footer is dark, but ours is not, and nothing in the app applies the
 * `.dark` class today — so wiring the white one in would ship an image that can
 * never paint. It waits for the footer the design actually draws (#74).
 *
 * `dark:invert` is what covers the gap meanwhile: the asset is black ink on a
 * transparent ground, so inverting it yields the white wordmark rather than a box.
 * That matters because the file is a base64 raster inside an `<svg>`, not paths —
 * there is nothing for `currentColor` to act on.
 *
 * `next/image` applies `unoptimized` on its own for a `.svg` source, so this bypasses
 * the optimizer without reopening ADR-0014 or needing `dangerouslyAllowSVG`.
 */
export function Logo({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/Logo-black.svg"
      alt="Vivimoon"
      width={155}
      height={48}
      priority={priority}
      className={cn('w-auto object-contain dark:invert', className)}
    />
  );
}
