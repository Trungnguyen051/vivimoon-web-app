# `Expiry` is the shopper-facing name for how long a lens lasts; the catalog field stays `replacement`

**Status:** accepted — vocabulary settled during the facet-menu grill; `CONTEXT.md` carries `Expiry`. Not yet implemented.

One axis had accumulated five names: `replacement` (`Product.replacement`, `ReplacementSchedule`), `lifespan` (`ComparisonRow.lifespan`), "duration" (`DurationTile`, #83), `Thời gian dùng` (the shipped filter label) and `Hạn sử dụng` (the design). `Expiry` becomes the single shopper-facing term — menu, collection filter, Comparison Matrix, dictionary — and `ComparisonRow.lifespan` is renamed with it, since that shape is the app's own derived response and mirrors nothing external.

`Product.replacement` and the `?replacement=` query param are deliberately left alone. This frontend exists to mirror Vivimoon's real backend contract, so renaming a mocked field would make the mock stop mirroring the thing it was built to mirror; renaming the param would additionally break links the homepage duration tiles already emit and shoppers may have bookmarked. The split is the point — `replacement` is a wire name, `Expiry` is a shopper's word — and a future reader finding both should not try to reconcile them. If Vivimoon's real backend turns out to call this something else, the param gains an alias rather than the vocabulary changing again.

Also deliberate: the shopper-facing *values* follow the design's framing (`1 ngày`, `1 tháng`, `3 tháng`, `6 tháng`) rather than the shipped dictionary's cadence framing (`Hằng ngày`, `Hằng tháng`). An expiry is how long a lens lasts, not how often you replace it, and the two framings were visible to the same shopper in one session.
