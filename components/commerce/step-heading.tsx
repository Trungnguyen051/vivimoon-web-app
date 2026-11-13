/** A checkout block's numbered heading, "① Thông tin nhận hàng" (Figma 58:50). The number is decoration. */
export function StepHeading({ id, step, children }: { id?: string; step?: number; children: React.ReactNode }) {
  return (
    <h2 id={id} className="flex items-center gap-3 font-heading text-2xl md:text-[1.75rem]">
      {step ? (
        <span aria-hidden className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground font-sans text-sm font-semibold text-background">
          {step}
        </span>
      ) : null}
      {children}
    </h2>
  );
}
