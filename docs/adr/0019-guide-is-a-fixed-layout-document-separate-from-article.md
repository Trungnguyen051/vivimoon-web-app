# A Guide is a fixed-layout document, and not an Article

**Status:** accepted — vocabulary settled during the Support-section grill; `CONTEXT.md` carries `Guide`, `Topic` and `FAQ Entry`. Not yet implemented.

The Support design (file `9bTKBHv3tf3aJy1EhnJc4i`, frame `164:487` "B4. Hướng dẫn đeo & tháo lens") draws a help document with a subtitled video, an opening note, five numbered steps each carrying its own illustration, a closing safety note, a row of suggested lenses and a rail of related reading. `Article` cannot hold that. Its body is `string[]` — plain paragraphs, deliberately, so that rendering needs no parser and a fixture cannot inject markup into the page.

Two ways out were available. Widening `Article` to carry structure would have spent that guarantee on the Kiến thức section too, which neither needs it nor asked for it. Instead `Guide` becomes its own term, with its own schema and its own `support` resource, and `Article` keeps the narrow shape that makes it safe. The two are separated by shape, never by subject: `ve-sinh-va-bao-quan-lens` is a published Article *and* one of the guide rail's three cards, so a Guide's related rail links to either kind — `{ kind: 'guide' | 'article', slug }` — rather than refusing to point at prose it did not author.

The second half of this decision is that a Guide's layout is **fixed**, not a discriminated union of section kinds assembled into an ordered array. A union is a document builder, and a document builder is worth having when there are documents to build; there is one guide shape here and no CMS to author against, so the union would be an extension point serving a single implementation. The schema names the parts instead — `video?`, an opening note, `steps[]`, a closing note, a Collection slug, `related[]` — and the page renders them in one order. If a second guide shape ever genuinely differs, widening a named-parts schema is a smaller change than unwinding a union nobody varied.

## Consequences

Help content now lives in two resources with overlapping subject matter, and the thing that tells you which one a piece of writing belongs in is its shape, not its topic. A future reader looking for "the lens care article" may find it in either place; the related rail is what keeps that from being a dead end for a reader, and `tests/nav-destinations.test.ts` — extended here to cover authored fixture links — is what keeps it from being a dead end in CI.

A Guide carries `updatedAt` as well as `publishedAt`, which `Article` does not. That asymmetry is intentional: a step-by-step instruction that is three years stale is a safety problem in a way that an opinion piece about lens colour is not, so a Guide states when it was last checked. Reading time is computed from the body rather than authored, so it cannot drift from the text it describes.
