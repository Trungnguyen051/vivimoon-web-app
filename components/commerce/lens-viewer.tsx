'use client';
import { useState } from 'react';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { LensGallery } from '@/lib/api/schemas/catalog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ProductGallery } from './product-gallery';
import { cn } from '@/lib/utils/cn';

const CONTEXT_KEYS = ['eye', 'face', 'withMakeup', 'withoutMakeup'] as const;

/**
 * Takes the already-fetched `gallery` as a prop — no fetching inside it, per
 * the standing constraint that `components/` never fetches. The PDP decides
 * whether to render this or the plain `ProductGallery` (see product page).
 *
 * Each tab reuses `ProductGallery`'s thumbnail-strip-plus-active-image
 * layout for the images within that context, rather than a second
 * image-browsing interaction. `byEyeColor` is keyed by an arbitrary,
 * un-translated string (the model's natural eye color in the demo photo,
 * e.g. "brown") since the mock data owns that vocabulary, not the dictionary.
 */
export function LensViewer({
  gallery, alt, dict,
}: {
  gallery: LensGallery; alt: string; dict: Dictionary['viewer'];
}) {
  const eyeColors = Object.keys(gallery.contexts.byEyeColor);
  const [activeEyeColor, setActiveEyeColor] = useState(eyeColors[0]);

  return (
    <Tabs defaultValue="eye">
      <TabsList>
        {CONTEXT_KEYS.map((key) => (
          <TabsTrigger key={key} value={key} disabled={gallery.contexts[key].length === 0}>
            {dict[key]}
          </TabsTrigger>
        ))}
        <TabsTrigger value="byEyeColor" disabled={eyeColors.length === 0}>
          {dict.byEyeColor}
        </TabsTrigger>
      </TabsList>

      {CONTEXT_KEYS.map((key) => (
        <TabsContent key={key} value={key}>
          <ProductGallery images={gallery.contexts[key]} alt={alt} />
        </TabsContent>
      ))}

      <TabsContent value="byEyeColor">
        {eyeColors.length > 0 && activeEyeColor ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {eyeColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-pressed={activeEyeColor === color}
                  onClick={() => setActiveEyeColor(color)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-sm capitalize transition-colors',
                    activeEyeColor === color
                      ? 'border-primary text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  {color}
                </button>
              ))}
            </div>
            <ProductGallery key={activeEyeColor} images={gallery.contexts.byEyeColor[activeEyeColor]} alt={alt} />
          </div>
        ) : null}
      </TabsContent>
    </Tabs>
  );
}
