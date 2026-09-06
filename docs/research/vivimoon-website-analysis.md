# Vivimoon.vn — Live Site Data-Model Audit

**Purpose:** Reference analysis of the real vivimoon.vn storefront, captured to reconcile our mock product schema/data against what Vivimoon's actual site sells and how it's structured. Captured via Firecrawl (site map + targeted page scrapes) on 2026-09-06.

**Scope note:** This document catalogs *what the real site has*, objectively. Decisions made as a result of this audit live in `CONTEXT.md` and `docs/adr/0010-*`/`0011-*`, not here.

---

## 1. Site structure

- Sitemap mapping returned 369 URLs. Product detail pages follow the pattern `{slug}-p{id}.html`; category pages `{slug}-pc{id}.html`; blog/editorial content `{slug}-n{id}.html`.
- Top-level catalog nav: **KÍNH ÁP TRÒNG** (contact lenses) and **PHỤ KIỆN LENS** (lens accessories).
- Contact-lens subcategories cross two axes: product line (**Lens khóa ẩm** / moisture-lock, i.e. cosmetic-color; **Lens cho mắt thở** / breathable, i.e. clear-corrective) × duration tier (1 ngày / 1 tháng / 3 tháng / 6 tháng). Not every combination exists as a live subcategory.
- The main **KÍNH ÁP TRÒNG** category page (56 products across 3 pages) further breaks down into three sub-types: **Kính áp tròng trong suốt** (clear), **Kính áp tròng có màu** (colored), **Kính áp tròng vân nhũ** (glitter/shimmer-textured colored) — this is the real 3-way split, not the 4-way clear/colored/toric/multifocal one our schema had.
- Accessory subcategories: **Phụ kiện nước ngâm nhỏ mắt** (solution/eye-drop accessories) and **Phụ kiện vệ sinh và khay đựng** (cleaning devices & lens cases).
- No toric or multifocal product or category exists anywhere in the 369 mapped URLs. The only related hit was a single blog article title mentioning "loạn thị" (astigmatism), which 404s as of this audit.

## 2. Product detail page — data fields observed

Sampled: one cosmetic/colored lens (Jupiter Gray), one 1-day clear lens (Vivimedi Oxy Plus), one 3-month clear lens (Vivimedi Oxy 3 Months).

| Vietnamese label | Meaning | Sample values |
|---|---|---|
| Nguyên liệu | Material | `"100% Silicone Hydrogel"`, `"PC+Silicone Hydrogel+HEMA"` |
| Xuất xứ | Country of origin (not a manufacturer name) | `"Hàn Quốc"` (sometimes suffixed `"- chuẩn ISO 13485"`) |
| Thành phần nước | Water content | `40%`, `45%`, `50%` |
| Đường kính / DIA | Total lens diameter | `14.2mm` |
| Đường kính phun màu / G.DIA / "Độ giãn tròng" | Graphic (colored-zone) diameter — distinct from DIA, `"không giãn"` (n/a) for clear lenses | `13.3mm` on the one colored lens sampled |
| Bán kính cong | Base curve | `8.6mm`, `8.7mm` |
| Hạn sử dụng | Wear duration from opening | `"1 ngày (dùng 1 lần)"`, `"3 tháng kể từ ngày mở vỉ"`, `"6 tháng kể từ ngày mở vỉ"` |
| Thuộc dòng | Product line | `"Lens khoá ẩm"`, `"Lens cho mắt thở"` |
| Độ cận | Diopter/power range, with separate Mắt trái (left eye) / Mắt phải (right eye) pickers | `0.00 – 8.00` |

No UV-protection spec appears on any sampled PDP. Price is a single value per product/color (e.g. `429,000 VNĐ`), with a plain quantity stepper — no per-pack-size pricing tier. Product titles append an internal line code (e.g. `"Jupiter Gray - 6 months - LKA"`, `"...-LCMT"`).

## 3. Open question — not acted on

The real site sells accessories (contact-lens solution, cleaning devices) from **third-party brands** — Eyelab, Prenz, ZMedi were all spotted in the crawl — alongside Vivimoon's own single-brand lens line. Our catalog has no accessories domain at all today, so `Product.brandId`/`brandName` (which implies a multi-brand catalog) is currently exercised only by the single `"vivimoon"` value in every fixture. Whether an accessories catalog is ever in scope is undetermined — flagged here for whoever picks it up next, not something this audit resolved.
