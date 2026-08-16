'use client';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-2">
        {images.map((src, i) => (
          <button key={src} onClick={() => setActive(i)} className={cn('relative h-16 w-16 overflow-hidden rounded border', active === i && 'ring-2 ring-primary')}>
            <Image src={src} alt={`${alt} ${i + 1}`} fill className="object-cover" sizes="64px" />
          </button>
        ))}
      </div>
      <div className="relative aspect-square flex-1 overflow-hidden rounded-lg bg-muted">
        {images[active] ? <Image src={images[active]} alt={alt} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" priority /> : null}
      </div>
    </div>
  );
}
