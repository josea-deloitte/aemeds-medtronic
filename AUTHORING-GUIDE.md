# Authoring Guide — Header & Cards Rail (da.live)

This guide is for content editors authoring the Medtronic site in **da.live**. It covers the two blocks that were reworked to match the original medtronic.com design: the global **header/navigation** and the **Cards Rail** ("Innovation in action" style story rail).

---

## 1. Header / Navigation

### Where it lives

Unlike most blocks, the header is **not** authored on every page. It is a shared fragment: one document, referenced automatically by every page's `<header>`.

- Fragment path: **`/nav`**
- Open it directly in da.live from the site's content tree (or navigate to `https://da.live/edit#/<org>/<site>/nav`).
- A page only needs a different header if it points its `nav` page metadata at a different fragment path — leave this alone unless you're intentionally building an alternate header for a sub-site.

### What's in the `/nav` document

The document has three sections, separated by a horizontal rule (`---`). **Do not merge or reorder these** — the header code reads them by position:

| # | Section | Contains |
|---|---|---|
| 1 | **Brand** | A single image, linked to the homepage. This is the Medtronic logo. |
| 2 | **Primary navigation** | A bulleted list. Each top-level bullet is a nav item; if a bullet has a *nested* bulleted list under it, it becomes a dropdown on desktop. |
| 3 | **Tools** | A bulleted list of audience options (*Healthcare professionals / Patients / Career seekers* — becomes the "Search within" dropdown), plus a link (*Education and training*) and a paragraph holding the search icon. |

### How to edit it

- **Change the logo:** replace the image in section 1. Keep it linked to `/en-us` (or the relevant locale homepage).
- **Add/remove/rename a top-level nav item:** edit the bullet list in section 2. Text becomes the label, the link on that text becomes the destination.
- **Add a dropdown:** under a top-level bullet, indent a nested bulleted list (Tab in da.live's list editor). Each nested bullet becomes a dropdown link.
- **Change the audience options:** edit the first list in section 3.
- **Change the "Education and training" link:** edit the link text/URL directly — the link label and href both come from that line.
- **Do not delete the search icon paragraph** in section 3 — removing it will hide the search box entirely.

### Testing your change

Preview the fragment and the site: `https://main--aemeds-medtronic--<org>.aem.page/en-us/` — the header updates on every page instantly since it's a shared fragment (no publish step needed for preview; publish `/nav` when ready for production).

---

## 2. Cards Rail block

### What it's for

A horizontally scrolling rail of story/news cards — image, category eyebrow, linked title. Use it for "latest stories"-style content (like "Innovation in action" on the homepage). It is **not** meant for cards with body copy and an explicit CTA button — use the standard **Cards** block for that instead.

### Inserting the block

1. In da.live, place your cursor where the rail should go (typically right after a heading like "Innovation in action").
2. Open the **Insert → Block** menu and choose **Cards Rail** from the block library. This inserts an empty table.
3. The table's header row (first row) must read exactly **`Cards Rail`** — this is what tells the page to use this block. Don't rename it or add a variant suffix unless a new variant is introduced (see below).

### Filling in a card

Each row of the table is one card, with **two columns**:

| Column 1 (image) | Column 2 (content) |
|---|---|
| The card's image | The category eyebrow (plain text, e.g. `OUR IMPACT`) on its own line, then the card title as a **heading** with the title text **linked** to the destination article/page |

- **The whole card is clickable** — the link lives on the heading text, and the block wraps the entire card in that link. Don't add a separate "Learn more" link/button inside a row; it will be ignored and could confuse the click target.
- **External destinations** (a full `https://` URL, e.g. a story hosted outside medtronic.com): the card automatically opens in a new tab — no extra step needed.
- Add one row per card; there's no fixed minimum/maximum, but 5–8 cards is the sweet spot for a scroll rail (too few won't scroll, too many gets tedious to browse).
- Images: upload the actual full-size image asset in da.live — don't leave a hotlinked medtronic.com URL in production content, that's only acceptable in local drafts/test content.

### Applying a "light"/"dark" section style

The homepage example wraps the rail in a section styled `light`. To do this:

1. Click into the section containing the rail.
2. Insert a **Section Metadata** block (from the same Insert → Block menu) at the end of that section.
3. Set the key `style` to `light` (or `dark`, if a dark variant is needed and supported by the section styles).

This is a general EDS convention — it applies to any section, not just Cards Rail — but it's what produces the pale background band behind the "Innovation in action" rail on the homepage.

### Applying a block variant

If a design variant of Cards Rail is introduced later (e.g. a "compact" version), authors apply it the same way as any EDS block variant: add the variant name in parentheses in the block's header row, e.g. `Cards Rail (compact)`. This adds a `compact` CSS class alongside `cards-rail` on the block, without changing the row/column structure above. No variant exists yet for this block — check with engineering before inventing a new one, since the CSS has to be added to support it.

### Testing your change

Preview the page and scroll-check on both mobile and desktop widths — the rail's card width and gap change slightly at the 900px breakpoint.

---

## Quick reference

| Task | Where |
|---|---|
| Change logo, nav links, dropdowns, search/audience options | `/nav` fragment document |
| Add a "latest stories" style rail | Insert **Cards Rail** block, 2-column table (image, category+linked heading) |
| Style a section light/dark | Insert **Section Metadata** block at the end of the section, key `style` |
| Preview | `https://main--aemeds-medtronic--<org>.aem.page/...` |
