'use client';
import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * Copies `value` and says so: the icon turns to a tick and a polite live region
 * announces `copiedLabel` for screen readers (spec #190, shared by QR and success).
 */
export function CopyButton({
  value, label, copiedLabel, className,
}: { value: string; label: string; copiedLabel: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Clipboard refused (insecure context or denied): the value stays on screen to copy by hand.
    }
  };

  const Icon = copied ? Check : Copy;
  return (
    <>
      <button
        type="button" onClick={copy} aria-label={label}
        className={cn('inline-flex size-6 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none', className)}
      >
        <Icon aria-hidden className="size-4" strokeWidth={1.5} />
      </button>
      <span role="status" className="sr-only">{copied ? copiedLabel : ''}</span>
    </>
  );
}
