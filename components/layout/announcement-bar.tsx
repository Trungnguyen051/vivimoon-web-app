import { Fragment } from 'react';

/**
 * The design's bar carries three separate claims divided by `·`, so it takes
 * segments rather than one string: each claim stays its own translatable unit,
 * the separator stays presentation, and the line can wrap on narrow screens
 * instead of overflowing (#40).
 */
export function AnnouncementBar({ segments }: { segments: string[] }) {
  return (
    <div className="bg-foreground text-background">
      <p className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-2.5 text-center text-xs font-medium tracking-wide">
        {segments.map((segment, i) => (
          <Fragment key={i}>
            {i > 0 ? <span aria-hidden className="text-background/50">·</span> : null}
            <span>{segment}</span>
          </Fragment>
        ))}
      </p>
    </div>
  );
}
