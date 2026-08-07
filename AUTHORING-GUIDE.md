# Authoring Guide (da.live)

This guide is for content editors authoring the Medtronic site in **da.live**. It covers the blocks reworked to match the original medtronic.com design: the global **header/navigation**, the **Cards Rail** ("Innovation in action" story rail), the **Cards Promo** featured card (white banner / navy Our-Impact card), the **Hero Video** top-of-page hero, the **Hero Feature** featured-story CTA band, and the **Hero Investors** "Shareholders spotlight" banner.

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

## 4. Hero Video block

### What it's for

The top-of-page hero: a **full-bleed looping background video** with a light "card" floating over it. The card has an icon + category eyebrow, a large headline, a short paragraph, a foreground cutout image, and a "See how" link. Used for the homepage "Revolutionizing AFib treatment" hero.

### Inserting the block

1. Place your cursor at the very top of the page (the hero is normally the first section).
2. Open **Insert → Block** and choose **Hero Video**. The header row must read exactly **`Hero Video`**.

### Filling it in

The block is a **2-row table** (each row is one cell of content):

| Row | Cell contents |
|---|---|
| **Row 1 — background video** | A single link whose **text is the full `https://…​.mp4` URL** of the background video. (In da.live, paste the .mp4 URL as both the link text and target; the block reads the URL from the link text because the platform rewrites `.mp4` in the href.) Optionally add a poster image below the link — it shows as the first frame. |
| **Row 2 — card content** | In order: the **category eyebrow** as a plain paragraph (e.g. `HEALTHCARE TECHNOLOGY`), the **headline** as a heading (`h2`), a short **paragraph** of copy, the **foreground image** (a cutout PNG on its own line), and the **"See how" link** on its own line. |

- **The eyebrow icon is added automatically** — you only type the label text. (It's the Medtronic "healthcare" heart-in-hand mark; it's decorative.)
- **First paragraph = eyebrow**, styled uppercase navy with a hairline underline automatically.
- **Foreground image:** upload the cutout asset in da.live. It sits on the right of the card on desktop and moves above the text on mobile.
- **CTA:** a single link ("See how"). The blue circled-arrow icon is added automatically — don't paste an SVG.
- **External links** (`https://…`) open in a new tab automatically.

### Notes / behavior

- The video **autoplays muted and loops** (required for background video) and is lazily started when in view for performance.
- If the video link is missing or invalid, the block still renders the card over the brand-blue gradient background (a safe fallback).
- On mobile the card stacks (image above text) and the headline scales down.
- Keep the copy short (one or two sentences) — the card is a hero, not an article.

### Testing your change

Preview and check both widths: `https://main--aemeds-medtronic--<org>.aem.page/en-us/`. Confirm the video plays behind the card on desktop and the layout stacks cleanly on mobile.

---

## 5. Hero Feature block (featured-story CTA band)

### What it's for

A wide, dark full-width **CTA band** promoting a single featured story: a category eyebrow and headline on the left, a short description, and a "Find out" link on the right. Used for the homepage "How a 1960s blueprint became tomorrow's health tech" band between the Who We Are and Our Impact sections.

### Inserting the block

1. Place your cursor where the band should go (its own section).
2. Open **Insert → Block** and choose **Hero Feature**. The header row must read exactly **`Hero Feature`**.
3. Apply the **`dark`** section style (see below) so the band gets its dark background.

### Filling it in

The block is a **single cell** containing, in order:

| Order | Content |
|---|---|
| 1 | **Eyebrow** — a plain paragraph (e.g. `HEALTHCARE TECHNOLOGY`). Renders as a white label on a blue highlight with a hairline underline. |
| 2 | **Headline** — a heading (`h2`) with the story title. |
| 3 | **Description** — a plain paragraph, one sentence. |
| 4 | **CTA link** — a single link (e.g. "Find out") on its own line. |

- **First paragraph = eyebrow** (styled automatically — don't add the blue background yourself).
- The layout is automatic: eyebrow + headline + copy sit on the **left**, the CTA is pinned to the **right** and vertically centered on desktop; everything stacks on mobile.
- **CTA:** the blue circled-arrow icon is added automatically — just author the link text and URL.
- **External links** (`https://…`) open in a new tab automatically.

### Applying the dark section style

The band needs the dark background:

1. Click into the section containing the block.
2. Insert a **Section Metadata** block at the end of the section.
3. Set key `style` to `dark`.

### Testing your change

Preview and check both widths: `https://main--aemeds-medtronic--<org>.aem.page/en-us/`. The band should be a single dark row (text left, "Find out" right) on desktop and stacked on mobile.

---

## 6. Hero Investors block (Shareholders spotlight)

### What it's for

The light "Shareholders spotlight" banner: a category eyebrow and navy headline on the left over a subtle swirl background, a short description and a blue "Learn more" CTA, two secondary links in the top-right, and the investor **icon tiles** (Stock info / Company highlights / Upcoming events) overlaid on the bottom-right. It is the **light-theme twin of Hero Careers** — same structure and authoring, different palette (chosen automatically by the block, no variant to type).

### Inserting the block

1. Place your cursor where the banner should go (its own section).
2. Open **Insert → Block** and choose **Hero Investors**. The header row must read exactly **`Hero Investors`**.
3. The banner needs the background swirl and the icon tiles — see below.

### Filling it in

Hero Investors is the standard **Hero** table (1 column, 3 rows):

| Row | Cell contents |
|---|---|
| **Row 2 — background image** | The swirl/particle background image. |
| **Row 3 — content** | The **eyebrow** as a plain paragraph (`Investors`), the **headline** as a heading (`Shareholders spotlight`), a short **description** paragraph, the **primary CTA** link ("Learn more") on its own line, then the **secondary links** ("Read the latest quarterly earnings", "See our quarterly results"), each on its own line. |

Then, **immediately after the Hero Investors block in the same section**, add a **Cards Tile** block with the three icon tiles (Stock info / Company highlights / Upcoming events — icon image + label link per row). The site automatically:

- Styles those tiles as translucent **blue tiles** with white icons.
- **Overlays them onto the bottom-right** of the Hero Investors banner on desktop (they fall back to a normal row on mobile).

### Notes / behavior

- **First paragraph = eyebrow** (styled automatically). The first link after the copy is the **primary CTA**; the rest become the **top-right secondary links** — same rule as Hero Careers.
- The blue circled-arrow icon on every link is added automatically — don't paste SVGs.
- Palette is automatic: light background, navy `#170F5F` headline, blue `#1010EB` links. (Hero Careers is the dark-photo version; use that for careers-style banners.)
- **External links** (`https://…`) open in a new tab automatically.

### Testing your change

Preview and check both widths: `https://main--aemeds-medtronic--<org>.aem.page/en-us/`. On desktop the icon tiles should sit over the banner's bottom-right; on mobile everything stacks.

---

## Quick reference

| Task | Where |
|---|---|
| Change logo, nav links, dropdowns, search/audience options | `/nav` fragment document |
| Add a top-of-page video hero | Insert **Hero Video** block (row 1: `.mp4` URL link; row 2: eyebrow + heading + copy + cutout image + link) |
| Add a dark featured-story CTA band | Insert **Hero Feature** block (eyebrow + heading + copy + link), apply `dark` section style |
| Add the light "Shareholders spotlight" banner | Insert **Hero Investors** block (bg image + eyebrow/heading/copy/primary link/secondary links), then a **Cards Tile** block (icon tiles) in the same section |
| Add a "latest stories" scroll rail | Insert **Cards Rail** block (2-column table: image, category+linked heading), preceded by eyebrow `<p>` + heading |
| Add a featured promo (white banner or navy Our-Impact card) | Insert **Cards Promo** block (1 row, 2 cols: image, eyebrow+heading+copy+link); layout is chosen by section context |
| Style a section light/dark | Insert **Section Metadata** block at the end of the section, key `style` |
| Apply an eyebrow label | Type a plain `<p>` directly above the section heading — styled automatically |
| Preview | `https://main--aemeds-medtronic--<org>.aem.page/...` |
