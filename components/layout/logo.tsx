import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

/**
 * The wordmark, on whatever surface asks for it. Callers name the surface they sit
 * on, never a file: the asset cannot be recoloured — each SVG wraps a base64 raster
 * rather than paths, so `currentColor` has nothing to act on — and which file answers
 * which surface is this component's business, not the footer's (#74, #76).
 *
 * `dark` is the surface, not the theme. Nothing in the app applies the `.dark` class;
 * the footer and the announcement bar are dark bands inside the light theme. The
 * `dark:invert` below is the separate, unrelated case of a real dark theme arriving
 * later, and it is deliberately not what makes the footer work.
 *
 * `next/image` applies `unoptimized` on its own for a `.svg` source, so neither
 * variant reopens ADR-0014 or needs `dangerouslyAllowSVG`.
 */
export function Logo({
  className,
  priority,
  surface = 'light',
}: {
  className?: string;
  priority?: boolean;
  surface?: 'light' | 'dark';
}) {
  const onDark = surface === 'dark';

  return (
    <Image
      src={onDark ? '/Logo-white.svg' : '/Logo-black.svg'}
      alt="Vivimoon"
      // Each export is its own crop: 155x48 for the black, 157x56 for the white.
      width={onDark ? 157 : 155}
      height={onDark ? 56 : 48}
      priority={priority}
      className={cn('w-auto object-contain', !onDark && 'dark:invert', className)}
    />
  );
}
