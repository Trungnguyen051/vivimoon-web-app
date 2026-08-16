'use client';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      <div className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
        {images.map((src, i) => (
          <button key={src} aria-label={`${alt} ${i + 1}`} aria-current={active === i} onClick={() => setActive(i)} className={cn('relative size-16 shrink-0 overflow-hidden rounded-lg border transition-shadow', active === i && 'ring-2 ring-primary ring-offset-2 ring-offset-background')}>
            <Image src={src} alt={`${alt} ${i + 1}`} fill className="object-cover" sizes="64px" />
          </button>
        ))}
      </div>
      <div className="relative aspect-square w-full flex-1 overflow-hidden rounded-lg bg-muted">
        {images[active] ? <Image src={images[active]} alt={alt} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" priority /> : null}
      </div>
    </div>
  );
}
