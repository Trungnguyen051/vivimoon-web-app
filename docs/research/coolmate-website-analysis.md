# Coolmate.me — Feature & Structure Analysis

**Purpose:** Reference analysis of coolmate.me (Vietnamese fashion e-commerce brand), captured to inform the design of Vivimoon — a contact-lens e-commerce webapp taking visual/structural inspiration from Coolmate. Captured via live browser inspection (not raw HTML scraping) on 2026-08-16.

**Scope note:** This document catalogs *what Coolmate has*, objectively. It does not yet map features onto Vivimoon's contact-lens domain — that mapping happens in the design/brainstorming phase.

---

## 1. Global Site Chrome (present on every page)

### 1.1 Announcement bar
- Single-line dismissible-style bar above the header: promotional message (e.g. "MIỄN PHÍ VẬN CHUYỂN ĐƠN TỪ 200K" — free shipping over a threshold).

### 1.2 Utility topbar (above main header)
- **Left cluster:** brand/marketing links — "Về Coolmate" (About), "CXP by Coolmate" (custom print sub-brand), "Care & Share" (CSR initiative).
- **Right cluster:** "Coolclub" (loyalty program), "Cửa hàng" (store locator), "Blog", "CSKH" (customer service center), "Đăng nhập" (Login), and a **language/locale switcher** (combobox showing "VN" with flag icon).

### 1.3 Main header
- **Logo** (links home).
- **Primary navigation** (mega-menu triggers): `NEW`, `Nam` (Men), `Nữ` (Women), `THỂ THAO` (Sport), `PHỤ KIỆN` (Accessories), `SALE` (with a live "-50%" badge).
- **Search bar** — always-visible text input ("Tìm kiếm...", i.e. "Search...").
- **Account icon/button** — opens login/account flyout.
- **Inline signup incentive widget** next to account icon: "Đăng ký mới nhận ngay — 50.000 CoolCash" (register-now incentive showing loyalty currency reward), with a dismiss button.
- **Cart icon** — links to `/cart`, shows item count badge.

### 1.4 Mega-menu (per top-level nav item)
- Extremely deep, flyout-style mega menu rather than a simple dropdown. Each top-level item (Nam/Nữ/Thể Thao) expands into dozens of links organized by sub-category:
  - Cross-cutting entries: "Tất cả sản phẩm" (all products), "Sản phẩm mới" (new), "Bán chạy nhất" (bestsellers), "Cool Set" (outfit bundles).
  - Garment-type sub-nav: Áo (tops) broken into Polo, T-shirt, Tank top, Sport shirt, Long sleeve, Sweater, Jacket, Graphic tee, etc. Quần (bottoms) broken into Shorts, Joggers, Sport pants, Long pants, Jeans, Chinos, Swimwear, Underwear (further split into Brief, Trunk, Boxer Brief, Long Leg).
  - Activity-based sub-nav (under Sport): Badminton, Pickleball/Tennis, Running, Gym, Football, Outdoor, Yoga & Pilates.
  - Campaign/collection shortcuts embedded directly in the mega-menu: seasonal or licensed collections (Care & Share, "Áo ấm cho em" charity line, "Vụn Art" charity collab, Zodiac collection, ZeroMark™ anti-stain tech line, Sale -50%/-30% by gender).
  - Utility links embedded at the bottom of the mega-menu: Store locator, Coolclub, Customer Service, About, Careers, Login, Blog, plus gender-specific size guides and a "Community Threads" (UGC/community) link.
- **Design implication:** navigation is category-driven and very deep (~180+ distinct links across the mega-menu), reflecting a large SKU catalog. A lens store would need a *much* shallower nav (product count and axes of variation — power, base curve, wear duration — are fundamentally different from apparel size/color).

### 1.5 Footer
- **Contact block:** Hotline (two phone numbers, `tel:` links), Email (`mailto:` link).
- **Feedback CTA:** "Coolmate lắng nghe bạn!" heading + external form link ("Đóng góp ý kiến" / Give feedback).
- **Social icons:** Facebook, Zalo, TikTok, Instagram, YouTube.
- **Footer link columns**, each with a heading:
  1. **CoolClub** — Account, Register, Benefits & Perks.
  2. **Documents/Careers** — Careers page, Trademark registration link.
  3. **Chính sách (Policies)** — In-store return policy, 60-day online return policy, Promotions policy, Privacy policy, Shipping policy, Pricing policy, Payment & refund policy, Complaints handling, Restricted conditions.
  4. **Coolmate.me** — Website changelog, Cookie management (opens cookie preference control).
  5. **Chăm sóc khách hàng (Customer care)** — "100% satisfaction experience" page, FAQs.
  6. **Khám phá (Explore)** — Community Threads, Men's size guide, Women's size guide, Blog.
  7. **Về Coolmate (About)** — Code of conduct, "Coolmate 101" (brand primer/landing page), Service excellence, Brand story, Factory/manufacturing transparency page, Care & Share, ESG/Sustainability, "Vision 2030".
- **Address block:** multiple physical locations listed explicitly (retail store, Hanoi office, Hanoi operations center, HCMC office/operations center, R&D center) — signals a real, large operation (trust signal).
- **Legal/registration footer:** company legal name, business registration number and issuing authority, plus a row of **certification badges** (trust-mark registry, DMCA protection, ISO certification, Vietnamese High-Quality Goods "HVNCLC" certification) — all linking out to verification pages.

### 1.6 Cookie consent
- Persistent bottom banner ("Coolmate quan tâm đến quyền riêng tư của bạn") with a link to the cookie policy and two actions: "Tùy chỉnh" (Customize) and "Chấp nhận tất cả" (Accept all). Reappears via the "Quản lý Cookie" footer link.

---

## 2. Homepage

1. **Hero banner carousel** — 7 full-width promotional slides, each a clickable image linking to a collection or hero product (Back-to-school, a 5-pack underwear promo, a "ZeroMark" stain-tech collection, a CSR "Care & Share" campaign, "Wave Motion" collection, Anti-UV collection, a licensed Spider-Man collab). Manual prev/next controls.
2. **Secondary promo tiles** — a row of smaller clickable image tiles beneath the hero (sub-collections/lookbook shots), acting as a lightweight visual "shop by story" section.
3. **Gender filter toggle** — a segmented control ("Nam" / "Nữ") that re-filters the categories-and-products shown below it *in place*, without navigation.
4. **Category quick-grid** — 6 large icon/photo tiles for top garment types (Polo, T-shirt, Shorts, Shirt, Pants, Underwear), each linking straight to a filtered collection.
5. **Two large gender promo banners** — "ĐỒ NAM" / "ĐỒ NỮ" full-bleed image banners with a heading, short copy, and "MUA NGAY" (Shop Now) CTA button.
6. **Themed collection + product-carousel sections** (repeated pattern, several per homepage) — each section has a collection banner image + heading + CTA, followed by a horizontally-scrollable product carousel with prev/next arrows and a "Xem thêm" (See more) link to the full collection. Observed sections: Pickleball, Men's underwear, Running apparel.
7. **Care & Share CTA banner** — standalone image banner promoting the CSR program, placed near the bottom of the homepage.
8. **SEO H1** — a visually-hidden-style `<h1>` with the full brand tagline, present for SEO even though the visual hero doesn't show it as text.

### 2.1 Product card (recurring component, used everywhere: homepage carousels, PDP recommendations, collection grids)
- Two-image hover-swap (primary photo + secondary/alternate angle shown on hover).
- Optional badge overlay: "Bán chạy" (Bestseller), "new".
- **Inline color-swatch selector** directly on the card — clicking a swatch swaps the card's image/link to that color variant *without* leaving the grid.
- Product name (links to PDP).
- Price block: single price, or (if discounted) sale price + strikethrough original price + a "-N%" badge.
- A hidden/screen-reader-only full sentence describing the product+price for accessibility.
- Occasionally a processing-time note ("Thời gian xử lý đơn hàng từ 2-3 ngày") for made-to-order/limited items.

---

## 3. Product Detail Page (PDP)

1. **Breadcrumb navigation** (Home / Gender / Garment type / Sub-type).
2. **Image gallery** — vertical thumbnail rail (observed up to 8–9 images) + large main image; thumbnails are also direct links to full-size images (useful for zoom/lightbox).
3. **Title (H1) + Share button.**
4. **Price block** — sale price shown prominently; "Freeship" tag; a **CoolCash cashback estimate** ("Được hoàn lên đến 28.000 CoolCash") shown as an expandable disclosure.
5. **Color selector** — swatches; each color is a *separate URL* (`?color=slug`) rather than a client-only state swap, which is good for deep-linking/SEO per variant.
6. **Size selector** — button row (XS–XL) + a "Hướng dẫn chọn size" (size guide) link that opens a modal/guide.
7. **Quantity stepper** + **Add to cart** button.
8. **Trust/service bullet list** directly under the CTA: easy returns via phone number only (no need for receipt), 60-day return window (unused, tags attached), hotline with support hours, and home pick-up refund processed in 2–3 business days.
9. **Anchor link to full description** ("Mô tả sản phẩm") jumping down the page.
10. **"Gợi ý xem thêm" (You might also like)** — a small immediate cross-sell carousel right in the buy-box area.
11. **Structured spec list** below the fold: fiber/technology bullets (e.g. moisture-wicking, quick-dry, stretch), a "support level" scale (light/medium/high), then a definition list of Technology name, SKU/product code, Material composition (%), Fit/style (incl. model's height/weight/measurements and the size they're wearing — a sizing-reference pattern), Suitable-for (use case), Feature summary, Care instructions, and a "Made in Vietnam" mark.
12. **Feature-highlight sub-gallery** — repeated image+heading+short-copy blocks calling out specific design details (e.g. neckline design, fit, fabric tech) — essentially a mini visual spec sheet.
13. **Long-form SEO/content section** — multiple `<h2>` blocks of marketing copy with **inline contextual links** to related collections, blog posts, and glossary-style explainer posts (e.g. linking the word "Polyester" to a blog post explaining the fabric). This is a heavy internal-linking SEO pattern.
14. **"Shop the look" strip** — "Mua sắm theo phong cách" with several "Mua ngay" quick-shop entries (outfit-level upsell).
15. **"Sản phẩm cùng công nghệ" (Products with the same technology)** — carousel cross-sell grouped by shared fabric technology rather than category.
16. **Fabric-technology explainer section** — a horizontal set of cards, one per proprietary fabric tech (e.g. CoolSoft, CoolDry, CoolRib, CoolFlex), each with composition %, "best for," and "how it feels," linking to a filtered collection by fabric type. This is effectively a **cross-product technology taxonomy**, separate from garment-type taxonomy.
17. **"Gợi ý sản phẩm" (Suggested products)** — another broader recommendation carousel.
18. **Reviews section:**
    - Rating-distribution filter checkboxes (5★–1★).
    - "Reviews are only from verified purchasers" trust note.
    - Response/photo filters ("Đã phản hồi" = has store response, "Có hình ảnh" = has photos).
    - **Fit-feedback bars** — three-way histogram (Chật/Tight, Đúng kích thước/True-to-size, Rộng/Loose) as percentage bars — an apparel-specific sizing-confidence signal.
    - Sort dropdown, pagination.
19. **"Sản phẩm bạn đã xem" (Recently viewed products)** section — empty-state message when there's no history, implying it's backed by local/session tracking.
20. **CoolClub loyalty widget** near the page bottom — shows live member count ("565.093 thành viên"), a benefits list (referral cashback %, general cashback %, birthday gifts), and a **live/recent activity feed** of other members earning cashback (social proof pattern, similar to "X people just bought this").

---

## 4. Cart Page
- Dedicated `/cart` route.
- Empty-state observed (no items) — full structure of a populated cart wasn't captured in this pass, but the route, header/cart icon badge wiring, and page shell are confirmed.

---

## 5. Cross-cutting / Program-level Features

- **CoolClub loyalty program** — sitewide store-credit currency ("CoolCash"): earned via purchases (cashback %), referrals (10% cashback to referrer), and signup bonus (50,000 CoolCash for registering); redeemable in-store; has its own landing page (`/coolclub`) and account section (`/account/info`); reinforced via a persistent header widget, PDP widget, and footer links.
- **Community Threads** — a dedicated UGC/community content hub (`/community-threads`), separate from the blog.
- **Blog** — content-marketing hub (`/blog`) heavily interlinked from PDPs (fabric glossary posts, styling guides, sizing guides).
- **Store locator** (`/stores`) — physical retail presence.
- **Size guides** — separate dedicated pages per gender (`/huong-dan-chon-size-do-nam`, `/huong-dan-chon-size-do-nu`), also surfaced as a modal/link directly on the PDP.
- **CXP by Coolmate** — a custom-print sub-brand/service, linked from the topbar.
- **Care & Share** — CSR program with its own collection page, plus sub-initiatives (winter-clothing-for-children drive, "Vụn Art" scrap-fabric charity collab).
- **Sustainability/ESG page** and a **"Vision 2030"** brand-mission page — long-term brand trust content.
- **Factory transparency page** — "how our products are made," reinforcing the "Made in Vietnam" quality claim seen on every PDP.
- **Licensed/seasonal collabs** — e.g. Spider-Man collection, World Cup national-team jersey line, zodiac-sign collection — used as limited-time hero content.
- **Fabric-technology brand system** — proprietary named technologies (CoolDry, CoolSoft, CoolRib, CoolFlex, Ex-Dry, ZeroMark) act as a second, cross-cutting taxonomy independent of garment type, each with its own filterable collection.
- **Multi-language/locale switcher** in the topbar (VN shown; structure suggests EN or other locales are supported).
- **Legal/trust signaling** — business registration number, multiple third-party certification badges (trust registry, DMCA, ISO, Vietnamese High-Quality Goods), and multiple listed physical addresses, all in the footer.

---

## 6. Technical/Architectural Observations (inferred from live rendering)

- Client-rendered SPA-style app (React-like) — a plain HTML fetch of the homepage returned only a shell; full header/nav/footer only appear after JS execution, confirmed via headless-browser snapshot rather than static fetch.
- Product variants (color) are modeled as **distinct URLs with a query parameter** (`?color=slug`) rather than pure client-side state — good for SEO/deep-linking, worth carrying over.
- Heavy use of **accessible screen-reader-only text** on interactive elements (e.g. full sentence price descriptions on product cards, descriptive `aria-label`-style link/button names) — indicates real accessibility investment, not just visual polish.
- `sitemap.xml` was not reachable at the standard path during this analysis (404), so full URL/route enumeration relied on in-app navigation rather than the sitemap.

---

## 7. Summary Feature Checklist

- [x] Announcement/promo bar
- [x] Utility topbar (brand links, store locator, blog, CSKH, login, locale switch)
- [x] Mega-menu navigation (deep, multi-column, per top-level category)
- [x] Persistent search bar
- [x] Account flyout
- [x] Cart icon w/ badge
- [x] In-header signup incentive widget
- [x] Cookie consent banner w/ preference center
- [x] Hero banner carousel
- [x] Secondary promo tiles
- [x] Gender/segment filter toggle on homepage
- [x] Category quick-grid
- [x] Large gender/segment promo banners
- [x] Themed collection sections with product carousels
- [x] Product card w/ hover image swap, inline color swatches, badges, price/discount display
- [x] Breadcrumbs on PDP
- [x] Image gallery w/ thumbnail rail
- [x] Color variants as distinct URLs
- [x] Size selector + size-guide modal
- [x] Quantity stepper + add-to-cart
- [x] Cashback/loyalty-currency estimate on PDP
- [x] Trust/service bullet list on PDP (returns, support hours, refund process)
- [x] Structured product spec list (material, fit, tech, care, origin)
- [x] Feature-highlight visual sub-gallery
- [x] Long-form SEO content w/ internal linking
- [x] "Shop the look" outfit upsell
- [x] Cross-sell carousels (same technology, related, suggested)
- [x] Cross-cutting technology/material taxonomy w/ its own filterable collections
- [x] Reviews w/ rating filter, photo/response filter, fit-feedback histogram, sort, pagination
- [x] Recently-viewed products section
- [x] Loyalty program widget w/ live social-proof activity feed
- [x] Cart page
- [x] Loyalty/membership program (CoolClub + CoolCash currency, referral rewards)
- [x] Community/UGC hub
- [x] Blog/content marketing hub
- [x] Store locator
- [x] Gender-specific size guides
- [x] Sub-brand/custom service (CXP)
- [x] CSR program page(s)
- [x] Sustainability/ESG + long-term brand-vision page
- [x] Factory/manufacturing transparency page
- [x] Licensed/seasonal collaboration collections
- [x] Multi-language/locale switcher
- [x] Legal/registration footer + third-party certification badges
- [x] Multiple listed physical business addresses (trust signal)
