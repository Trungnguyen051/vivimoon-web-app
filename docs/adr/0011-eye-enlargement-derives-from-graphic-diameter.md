# Eye enlargement band will derive from `graphicDiameter`, not `diameter`

**Status:** proposed — tracked for implementation in #26 (M6.3). As of this writing, `productSpecsSchema` has no `graphicDiameter` field and `eyeEnlargementBand()` still derives its band from `diameter`.

ADR-0005 made `eyeEnlargementBand()` a pure function of a product's `diameter`, on the assumption that total lens diameter was the only enlargement-relevant measurement we had. A live-site audit found the real site publishes a second, distinct measurement — G.DIA, the colored/graphic-zone diameter — which is what actually drives the visual enlargement effect (e.g. one sampled product: 14.2mm total diameter but 13.3mm graphic diameter). `productSpecsSchema` will gain a `graphicDiameter` field and `eyeEnlargementBand()` will derive from it instead. ADR-0005's actual principle — the band is computed at the point of use and never stored — is unchanged; only the input field it's computed from is being corrected.
