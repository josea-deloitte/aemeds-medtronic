# Authoring Guide (da.live)

This guide is for content editors authoring the Medtronic site in **da.live**. It covers the blocks reworked to match the original medtronic.com design: the global **header/navigation**, the **Cards Rail** ("Innovation in action" story rail), and the **Cards Promo** featured card (white banner / navy Our-Impact card).

---

## 1. Header / Navigation

### Design note

The header uses a **white background with dark text and logo**, matching the original AEM site. It sits in the normal page flow, above the hero section, with a subtle bottom shadow. The Medtronic logo is currently displayed using a CSS colour-inversion fallback (white SVG → black). To restore the correct brand blue logo, upload the **dark-variant Medtronic SVG** into the `/nav` fragment and remove the CSS `filter` override (see the comment in `blocks/header/header.css`).

### Where it lives

Unlike most blocks, the header is **not** authored on every page. It is a shared fragment: one document, referenced automatically by every page's `<header>`.

- Fragment path: **`/nav`** (or **`/fragments/nav`**, depending on your site's path config)
- Open it directly in da.live from the site's content tree.
- A page only needs a different header if its `nav` page metadata points to a different fragment path — leave this alone unless you are intentionally building an alternate header for a sub-site.

### What's in the `/nav` document

The document has **three sections**, separated by a horizontal rule (`---`). **Do not merge or reorder these** — the header code reads them by position:

| # | Section | Contains |
|---|---|---|
| 1 | **Brand** | A single image linked to the homepage. This is the Medtronic logo. Use the dark-variant SVG for the white header. |
| 2 | **Primary navigation** | A bulleted list. Each top-level bullet is a nav item. A nested bulleted list under any bullet becomes its submenu. Nesting can go as deep as needed — the AEM mega-menu goes 3 levels (e.g. Healthcare Professionals → Products → Access & Instruments) and the block supports that depth and beyond. |
| 3 | **Tools** | A bulleted list of audience options (*Healthcare professionals / Patients / Career seekers* — becomes the "Search within" dropdown), a link (*Education and training*), and a paragraph holding the search icon. |

### How to edit it

- **Change the logo:** replace the image in section 1. Keep it linked to `/en-us` (or the relevant locale homepage). Use the dark/blue Medtronic logo, not the white version.
- **Add/remove/rename a top-level nav item:** edit the bullet list in section 2. Text becomes the label; the link on that text becomes the destination.
- **Add a submenu:** under any bullet, indent a nested bulleted list (Tab in da.live's list editor). Each nested bullet becomes a submenu link — and can itself have a further-nested list for a third level.
  - On **mobile**, tapping a top-level item with a submenu slides in that submenu full-screen; an "‹ Overview" back row is added automatically — you don't need to author it.
  - On **desktop**, each submenu opens as a flyout column; deeper levels cascade to the right.
  - A bullet's own link is only used as its destination in content elsewhere — once a bullet has a nested list, tapping/clicking the item always opens the submenu rather than navigating.
- **Change the audience options:** edit the first list in section 3.
- **Change the "Education and training" link:** edit the link text/URL directly in section 3.
- **Do not delete the search icon paragraph** in section 3 — removing it hides the search box.

### Testing your change

Preview the fragment and check the site: `https://main--aemeds-medtronic--<org>.aem.page/en-us/` — the header updates on every page instantly (no separate publish step needed for preview; publish `/nav` when ready for production).

---

## 2. Cards Rail block

### What it's for

A horizontally scrolling rail of story/news cards — image, category eyebrow, linked title. Use it for "latest stories"-style content (like "Innovation in action" on the homepage). It is **not** meant for cards with body copy and an explicit CTA button — use the standard **Cards** block for that.

### Section structure

The heading ("Innovation in action") and eyebrow label ("THE LATEST") are authored **in the same section as the Cards Rail block**, as default content placed immediately above it:

```
[Section start — with "light" style applied via Section Metadata]

THE LATEST          ← plain paragraph (becomes styled eyebrow automatically)
## Innovation in action   ← heading

[Cards Rail block table]

[Section end]
```

> **Eyebrow styling is automatic:** any plain `<p>` placed directly before an `<h1>`, `<h2>`, or `<h3>` in a section's default content is automatically styled as an uppercase, letter-spaced section label (the "THE LATEST" / "OUR IMPACT" style). No special markup is needed — just type the label as a plain paragraph.

### Inserting the block

1. In da.live, add the eyebrow paragraph and heading (as above) to the section first.
2. Place your cursor after the heading.
3. Open **Insert → Block** and choose **Cards Rail** from the block library. This inserts an empty table.
4. The table's first row must read exactly **`Cards Rail`** — this is the block's identifier. Do not rename it or add a variant suffix unless a new variant has been implemented.

### Filling in a card

Each row of the table is one card, with **two columns**:

| Column 1 (image) | Column 2 (content) |
|---|---|
| The card image | The category eyebrow (plain uppercase text, e.g. `OUR IMPACT`) on its own line, then the card title as a **heading** with the title text **linked** to the destination article/page |

- **The whole card is clickable** — the link lives on the heading text and the block wraps the entire card in it. Don't add a separate "Learn more" button; it will be ignored.
- **External destinations** (full `https://` URL): the card automatically opens in a new tab.
- Add one row per card. Five to eight cards is the sweet spot for a scroll rail.
- **Images:** upload the actual asset in da.live — hotlinked medtronic.com URLs are only acceptable in local drafts.

### Applying a "light" section style

The homepage rail sits inside a section styled `light` (pale background band). To apply it:

1. Click into the section containing the rail.
2. Insert a **Section Metadata** block at the end of that section.
3. Set the key `style` to `light`.

### Applying a block variant

If a design variant is introduced (e.g. `compact`), add the variant name in parentheses in the block's header row: `Cards Rail (compact)`. This adds a `compact` CSS class alongside `cards-rail`. No variant exists yet — check with engineering first.

### Testing your change

Preview the page and scroll-check on both mobile and desktop widths. The card width is fixed at 304 px with no gap between cards, matching the AEM original.

---

## 3. Cards Promo block

### What it's for

A single promotional card pairing **one image** with a text block (category eyebrow, headline, optional copy, and a "Learn more" link). Use it for a featured call-out — a community story, an award announcement, or a report highlight.

It renders in **one of two layouts, chosen automatically from where you place it** — you do **not** type a variant name:

| Layout | When it applies | Looks like |
|---|---|---|
| **Banner** (white, horizontal) | The block is in its **own section** (not combined with the Our Impact cards) | A wide white card, image on the left (~40%), text on the right, soft drop shadow, capped at 1087px. Used for the homepage "Communities / Spark scholarships" banner. |
| **Navy card** (dark, vertical) | The block sits in the **Our Impact composite section** (the same section as the gradient *Our Impact* intro and the stat cards) | A tall dark-navy card, image on top, white text, spanning the right column of the Our Impact grid. Used for "Unlocking the future of health". |

> You don't choose the layout with a variant suffix. The block detects the Our Impact grid by the presence of the gradient intro (`hero-impact`) block in the same section; anywhere else it renders as the white banner. To force one explicitly, ask engineering — the detection can be replaced with a named variant if needed.

### Inserting the block

1. Place your cursor where the card should go (for the banner, this is its own section; for the navy card, inside the Our Impact section alongside the intro and stats).
2. Open **Insert → Block** and choose **Cards Promo**. The header row must read exactly **`Cards Promo`**.

### Filling it in

The block is a **single card = one table row with two columns**:

| Column 1 (image) | Column 2 (content) |
|---|---|
| The card image (upload the real asset in da.live) | The category **eyebrow** as a plain paragraph on the first line (e.g. `COMMUNITIES` or `impact report`), then the **headline** as a heading, then optional **body copy** paragraph(s), then a **"Learn more" link** on its own line |

- **First paragraph = eyebrow.** The block styles the first plain paragraph as the uppercase, letter-spaced label automatically. Put nothing else on that line.
- **Headline:** author as a heading (`h2`/`h3`). It carries the title.
- **Copy is optional** — the banner usage omits it; the navy card includes a sentence.
- **CTA:** a single link (e.g. "Learn more"). The blue circled-arrow icon is added automatically — don't paste an SVG or add a button.
- **External links** (`https://…`) open in a new tab automatically.

### Notes

- **Banner** hides its image on small phones and drops the shadow, so the text stays readable — this is automatic.
- The **navy card** is positioned by the Our Impact section grid; you don't set its height or column — just author the content and it fills the right column.
- Don't add more than one row — Cards Promo is a single card. For multiple side-by-side cards use **Cards** or **Cards Tile**.

### Testing your change

Preview and check both widths: `https://main--aemeds-medtronic--<org>.aem.page/en-us/`. The banner should be horizontal on tablet/desktop and stacked (image hidden) on phones; the navy card should sit in the right column of the Our Impact block.

---

## Quick reference

| Task | Where |
|---|---|
| Change logo, nav links, dropdowns, search/audience options | `/nav` fragment document |
| Add a "latest stories" scroll rail | Insert **Cards Rail** block (2-column table: image, category+linked heading), preceded by eyebrow `<p>` + heading |
| Add a featured promo (white banner or navy Our-Impact card) | Insert **Cards Promo** block (1 row, 2 cols: image, eyebrow+heading+copy+link); layout is chosen by section context |
| Style a section light/dark | Insert **Section Metadata** block at the end of the section, key `style` |
| Apply an eyebrow label | Type a plain `<p>` directly above the section heading — styled automatically |
| Preview | `https://main--aemeds-medtronic--<org>.aem.page/...` |
