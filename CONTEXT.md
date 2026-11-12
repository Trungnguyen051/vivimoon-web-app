# Vivimoon

A contact-lens and eyewear e-commerce storefront for the Vietnamese market, built as a frontend against a mocked API that mirrors Vivimoon's real backend contract.

## Language

**Voucher**:
A discount currently valid for an account to apply at checkout. Every logged-in member sees the same currently-valid list, filtered by status and expiry — not a personally issued or claimed subset.
_Avoid_: Coupon, promo code, claimed voucher

**Favorites**:
A shopper's saved list of Product references. A favorite whose Product has since left the catalog is silently omitted from the list rather than shown as unavailable.
_Avoid_: Wishlist, saved items

**Address**:
A shopper's saved Vietnamese shipping address (province/district/ward). Exactly one saved Address is the account's default; deleting the default automatically promotes the next most-recently-added remaining Address, so an account with saved Addresses is never left without one.
_Avoid_: Shipping address, delivery address (same concept — Address)

**Rx**:
A shopper's per-eye contact-lens prescription, captured at add-to-cart as line metadata rather than a purchasable product variant. `sph` is always present; `cyl`/`axis` apply only to toric lenses (deferred past M2 — no selector collects them yet, see ADR-0004) and `add` (banded low/mid/high, not a numeric power) only to multifocal lenses. Rx is fully decoupled from the product taxonomy (ADR-0010): the Rx rules branch on their own `rxLensTypeSchema`, and every call site passes the fixed `RX_LENS_TYPE`, so no Product can reach the toric/multifocal branches until a real line for them exists.
_Avoid_: Prescription, power

**Default Rx**:
A per-eye `sph` saved on the account itself — collected once by the welcome step after an account is created and editable from Account info. It is a shopper's standing answer, not an Rx: it never travels with a Cart Line on its own, and an Rx is still captured at add-to-cart. Myopia only, in 0.25 steps; no `cyl`/`axis`/`add`.
_Avoid_: Eye power, độ cận (in code), saved prescription

**Product Line**:
Vivimoon's own lens technology/marketing category for a Product — trong suốt (clear), có màu (colored), or vân nhũ (glitter-textured colored) — matching the real storefront's own 3-way split. The `productLine` field, which replaced the old `type` field (`clear/colored/toric/multifocal`). Orthogonal to Rx: a Product Line never implies anything about prescription complexity (ADR-0010).
_Avoid_: Lens type, category

**Cart Line**:
A single entry in the cart, identified by its variant plus its Rx — not by variant alone. The same lens variant at two different prescriptions is two distinct Cart Lines, each surviving a reload separately.
_Avoid_: Line item, SKU line

**Buy Now**:
A PDP action that takes the shopper's current Rx selection straight to checkout as a single-line cart, leaving their existing Cart untouched.

**Loyalty**:
A per-account points balance and history, credited per placed order. Earn and burn rules are provisional pending Vivimoon's real program design.
_Avoid_: Rewards, points program

**Comparison Tray**:
The persistent, always-visible strip that accumulates a shopper's product selections (up to 4) for comparison as they browse across pages. Distinct from the Comparison Matrix — the tray is the accumulator; the matrix is the side-by-side view it opens.
_Avoid_: Compare list (ambiguous with the matrix)

**Comparison Matrix**:
The side-by-side comparison view (color, diameter, eye-enlargement band, expiry, price) for up to 4 products, opened from the Comparison Tray.
_Avoid_: Compare page (it's a modal, not a route)

**Eye Enlargement**:
A banded visual-effect rating (natural / subtle / noticeable / dramatic) derived from a lens's graphic diameter — the colored/graphic-zone diameter, distinct from its total diameter — shown only as a Comparison Matrix column — never a stored product attribute (see ADR-0011).
_Avoid_: Enlargement factor, magnification

**Lens Viewer**:
The tabbed product-gallery view showing a product across contexts (eye / face / with makeup / without makeup / by natural eye color). Falls back to the standard product gallery for any product lacking gallery entries.
_Avoid_: Gallery alone (ambiguous with the standard gallery it falls back to), Multi-Context Viewer (same concept — Lens Viewer is the shorter canonical form used in §10 of the client-scope spec)

**Quiz**:
The step-by-step questionnaire that scores a shopper's tag-weighted answers into product recommendations. Content (6 questions, tag weights) is provisional pending Vivimoon's real question set.
_Avoid_: Lens-Matching Quiz (same concept — Quiz is the canonical short form)

**Trust Badge**:
One of the four promises the homepage states beneath VIVIMOON TV — authenticity, free consultation, 30-day returns, express delivery. A Trust Badge is a claim Vivimoon stands behind rather than a feature of the storefront, so its wording comes from Vivimoon and the evidence for it is theirs; the same is true of the regulatory line in the announcement bar.
_Avoid_: USP strip, trust signals, guarantees

**Article**:
One editorial piece behind the homepage's Kiến thức section, with a title, excerpt and body in every supported locale. Unlike UI copy, an Article's translations live with the content in the fixtures rather than in the dictionary — an article is authored as a whole in each language, and a dictionary key per paragraph would not scale. Its body is plain paragraphs, not markup, so rendering needs no parser. Articles reference no Product, which is why `editorial` is its own resource key rather than part of `discovery`.
_Avoid_: Post, blog entry, news item

**Reading Theme**:
The subject an Article is grouped under — người mới đeo lens, độ êm & thoải mái, lens tự nhiên, makeup look, lens theo dịp, chăm sóc lens. Every Article carries exactly one. It both files the Knowledge index (the chip row, each card's eyebrow, the breadcrumb on an article) and chooses which Collection of lenses the article merchandises beside its body (ADR-0018). "Tất cả" is the absence of a Reading Theme filter rather than a member of the set.

Distinct from a Topic by what it files, not by who sees it: a Reading Theme groups Articles, a Topic groups FAQ Entries and Guides. Both are shopper-visible and both name themselves on screen, which is exactly why one word could not serve both. Not every Reading Theme has lenses behind it — chăm sóc lens is about solution, cases and hygiene, which Vivimoon does not sell — so one may legitimately lead nowhere in the catalog (ADR-0018).

On screen it is **chủ đề đọc** in Vietnamese and **subject** in English, against a Topic's **chủ đề** and **topic**. Saying so here because the rename alone did not settle it: the code split cleanly and the copy did not, and every Vietnamese surface called both taxonomies `chủ đề` until #151. `tests/reading-theme-vocabulary.test.ts` holds both words now.
_Avoid_: Topic (that is the help taxonomy, and the collision is the reason this was renamed), category, tag; in Vietnamese, a bare `chủ đề` — that is a Topic

**Lead Article**:
The Article given the large treatment at the top of the Knowledge index. It is the newest Article matching whatever Reading Theme or search is currently applied — not an editorial selection, and not a field on an Article. Narrowing the index therefore changes which Article leads it, which is why it is named for its position rather than called "featured": nothing about it reflects a judgement anyone made.
_Avoid_: Featured article, hero article, nổi bật (implies an editorial choice that does not exist)

**Reading Time**:
How long an Article takes to read, counted from its body at the point of display and never stored — the same discipline as Eye Enlargement (ADR-0005). It is computed per locale, so the same Article reads slightly longer in Vietnamese, which writes syllables as separate words.
_Avoid_: Read length, duration

**Makeup Look**:
One finished makeup look shown on camera, captioned with the lens worn in it. Makeup Looks sit on the Knowledge index because a shopper judging a lens is judging it on a face, not on a product shot. Distinct from VIVIMOON TV: a Makeup Look leads with the look and mentions the lens, where VIVIMOON TV leads with the product.

The concept is a short portrait video, but no footage exists yet, so a Makeup Look is currently represented by a still poster frame that opens the lens it wears. It carries no play affordance while that is true: a control that plays nothing misrepresents the content more than a still does.
_Avoid_: Look video, tutorial, VIVIMOON TV (a different band — see below)

**VIVIMOON TV**:
The homepage's video strip, where each card merchandises one Product — its title is the product's name and its tags are the product's attributes. Distinct from a Makeup Look, which is organised around the look rather than around the thing being sold. The homepage's other "Makeup look" row is a third thing again: still images that open filtered collections, a browsing entry point rather than video.
_Avoid_: Video carousel, product videos (ambiguous with Makeup Look)

**Color Family**:
A named group of catalog colors used as a merchandising entry point — Nâu, Đen, Xám, and Màu sắc nổi bật ("standout colors", which gathers every vivid color rather than naming one). A Color Family is a browsing concept only: it has no field on a Product or Variant, which each still carry one `color`. Its tile shows up to three swatches and links into the colored-lens collection filtered to that family's colors. The swatches illustrate the family rather than define it: the `colors` are the filter, and while the catalog is provisional the swatches may name shades Vivimoon intends to carry but does not yet stock.
_Avoid_: Color group, swatch group, palette

**Không màu**:
The fifth entry in the Color Family row, and deliberately not a Color Family: it selects the trong suốt Product Line by the _absence_ of color rather than by a set of colors, so it has no swatches and opens the clear lenses rather than a filtered colored-lens collection. It shares the row because a shopper choosing how their eyes should look is equally choosing not to change them.
_Avoid_: Clear family, colorless family (it is a Product Line, not a Color Family)

**Lens Facet**:
One axis the Sản Phẩm menu offers for browsing the catalog — Màu sắc, Đường kính (DIA), Hạn sử dụng, or Chất liệu. A Lens Facet names the values beneath it and is itself a way in rather than a selection: opening one narrows nothing until a shopper picks a value under it.
_Avoid_: Filter group, menu section, category, attribute

**Expiry**:
How long a lens lasts before it is replaced — 1 ngày, 1 tháng, 3 tháng, 6 tháng. Expiry is the shopper-facing name for this axis wherever it appears: the Sản Phẩm menu, the collection filter, and the Comparison Matrix. The catalog field behind it stays `replacement`, which frames the same axis as a replacement cadence because that is what Vivimoon's backend contract calls it (ADR-0017).
_Avoid_: Lifespan, Duration, Replacement schedule, Wear duration (one concept — Expiry is the canonical shopper-facing term; `replacement` is the wire name only)

**Topic**:
One of the six subjects help content is filed under — Người mới đeo lens, Chọn lens & độ cận, Đơn hàng & thanh toán, Giao hàng, Đổi trả & bảo hành, Tài khoản & ưu đãi. Every FAQ Entry and every Guide carries exactly one. There is one Topic list, not a separate set for the support hub and the FAQ page: the hub shows all six as tiles and the FAQ sidebar lists the same six beneath "Tất cả", so no Topic is reachable from one screen and invisible on the other. The design drew four hub tiles against an earlier four-item list; six is deliberate.
_Avoid_: Category, help category, support section (one concept — Topic is canonical; `category` survives only as the FAQ page's query param); `chủ đề đọc` — that is a Reading Theme

**FAQ Entry**:
One question Vivimoon answers, filed under a Topic, with a short answer and a full answer in every supported locale. The short answer is authored rather than truncated from the full one — it is the line that appears on a hub card, where a cut-off sentence would read as a bug. A full answer may carry links to Guides, Articles or elsewhere in the storefront; those links are a field beside the prose rather than markup inside it, so an answer still needs no parser. A handful are marked featured, which is what the hub's "Người mới hay hỏi" row shows.
_Avoid_: FAQ (ambiguous with the page that lists them), Question, Help item

**Guide**:
One step-by-step help document — an optional video, an opening note, numbered steps each with its own illustration, a closing safety note, a Collection of suggested lenses, and a rail of related reading. A Guide is distinguished from an Article by its shape, never by its subject: both may cover lens care, and a Guide's related rail links freely to either. Its layout is fixed rather than assembled from arbitrary sections (ADR-0019), and it carries both a published and an updated date, where an Article carries only the former.
_Avoid_: Tutorial, how-to, help article, instructional article
