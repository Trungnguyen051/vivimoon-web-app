# Next's image optimizer is on, and `sizes` is required on every fill image

**Status:** accepted — implemented in #44: `images.unoptimized` is removed, the one fill image missing `sizes` has it, and `tests/image-pipeline.test.ts` holds both.

`next.config.ts` set `images: { unoptimized: true }`, which turns off resizing and modern formats entirely: every `<img>` shipped a raw `src` with no `srcset`, so a phone downloaded the same asset a 4K desktop did. It arrived in the homepage scaffolding commit (`2bee1f5`), whose message says it was "for baseline image loading" — getting placeholders to render, not a deployment constraint. Nothing here needs it: there is no static export, and the app deploys to Vercel, which runs the optimizer.

The second cost was quieter. Several components already set `sizes`, and the prop does nothing while optimization is off, so code review kept flagging missing `sizes` as a defect that no change could actually fix.

Measured against the fixtures at a phone width (640px), the heaviest homepage assets drop 97–98% and arrive as WebP: `moment-wedding.png` 1470KB → 50KB, `makeup-natural.png` 1253KB → 28KB.

We considered leaving it off and deleting the inert `sizes` props instead, which is the honest alternative if the flag were deliberate. Rejected: nothing about this deployment requires it, and it leaves every device on the full-size asset.

A fill image without `sizes` defeats this quietly — Next falls back to `100vw` and picks the largest candidate, which is close to shipping the unoptimized file again. So `sizes` is not optional on a fill image here, and a test asserts it rather than leaving it to review.

**Prerequisite for upstream:** while `unoptimized` was set, any absolute image URL rendered. With the optimizer on, a host must be listed in `images.remotePatterns` or `next/image` throws rather than degrading. Every image field is an unconstrained string (`catalog.ts`, `editorial.ts`), so the first resource that goes upstream and returns CDN URLs needs that host added at the same time. No host is configured here because no upstream exists yet — every resource's `upstream.ts` still throws — and guessing one would be configuration for a value nobody has.

**Consequence to watch:** Vercel bills image transformations. The source PNGs are uncompressed screenshots (7.6MB across `public/images`), which the optimizer now re-encodes on demand. Compressing the sources would cut transform work and repo weight; it is not done here because delivery is already solved and the placeholder art is expected to be replaced.
