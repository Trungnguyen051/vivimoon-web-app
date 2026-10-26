"use client"

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"

import { cn } from "@/lib/utils/cn"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: SeparatorPrimitive.Props & { decorative?: boolean }) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      // Base UI always exposes the separator to assistive tech; Radix took a
      // `decorative` prop and defaulted to hiding it. Keeping the prop and its
      // default keeps every existing separator as silent as it is today, and
      // still lets a caller ask for a semantic one. Clearing `aria-orientation`
      // alongside the role matches what Radix emitted exactly.
      {...(decorative
        ? { role: "none" as const, "aria-orientation": undefined }
        : {})}
      className={cn(
        "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
