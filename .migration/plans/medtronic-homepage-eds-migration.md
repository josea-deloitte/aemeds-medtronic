# Medtronic Homepage — EDS Migration Analysis & Plan

**Source:** `https://www.medtronic.com/en-us/index.html` — *"Health tech for the digital age | Medtronic"*
**Target:** AEM Edge Delivery Services (Document/DA authoring, following aem-boilerplate conventions)

---

## 1. Page Structure (top → bottom, as rendered)

The page decomposes into **9 distinct regions**: header, 2 hero sub-panels, 5 main content sections, an investor section, and the footer. Two `<video>` elements and no true JS carousel were detected (the repeated "Innovation" cards indicate a **scrolling card rail**, not a slick/swiper carousel).

### A. Header / Global Navigation
- **Hamburger "Menu" button** (drawer-style nav — full nav tree is behind the toggle, not inline).
- **Medtronic logo** (icon-font/SVG) linking to home.
- **Audience selector** `<select>`: *Search within → Healthcare professionals / Patients / Career seekers*.
- **Search box** (Coveo Atomic search — `combobox` + "Search Medtronic" submit button, lazy-injected).
- **Utility link:** "Education and training" → medtronicacademy.com (external, new window).
- Skip links: "Skip to navigation", "Skip to main content".

### B. Hero — Primary Feature Panel
- Eyebrow with icon: **"HEALTHCARE TECHNOLOGY"**
- H2: **"Revolutionizing AFib treatment"**
- CTA link: **"See how"** (→ pulsed-field-ablation page, new window, external-link icon)
- Background/foreground **video** + `figure` image ("Man and Woman Walking with Pulsed Field Ablation Devices").

### C. Hero — Secondary Promo Panel
- Collage image ("portrait images of young people")
- Eyebrow: **"COMMUNITIES"**
- H3: *"First 100 Medtronic Spark scholarships awarded…"*
- CTA: **"Learn more"** (→ medtronicspark.com)

### D. "Innovation in action" — Story Card Rail
- Eyebrow **"THE LATEST"** + H2 **"Innovation in action"**.
- **6 unique story cards** (rendered ~12× → duplicated set = horizontal scroll/loop rail). Each card = image + category eyebrow (OUR IMPACT / HEALTHCARE TECHNOLOGY / PLANET / PELVIC HEALTH / OVERACTIVE BLADDER / CARDIAC CARE) + H3 title, whole card linked (new window).

### E. "Where health meets high tech" — Who We Are + Stats
- Left: eyebrow **"Who We Are"**, H2, paragraph, "Learn more" CTA.
- Right: **video** + **3 stat tiles** (170+ active clinical trials · 79M+ patients served · $2.7B R&D) + "Key Facts: FY25 data" link.

### F. Feature Story Band ("1960s blueprint")
- Eyebrow **"HEALTHCARE TECHNOLOGY"**, title, description, "Find out" CTA. Single wide featured-story tile.

### G. "Our Impact" — Impact + Animated Stat Icons
- Intro block: eyebrow **"Our Impact"**, headline, paragraph, "Learn more".
- **3 animated-icon stat tiles** ($64M L&D · 2.5M+ patients screened · 60% GHG reduction + "Impact Report FY25" PDF link).
- Nested impact-report promo card (image + eyebrow + title + description + "Learn more").

### H. "Careers that change lives"
- Left: eyebrow **"Careers"**, H2, paragraph, primary CTA "Join the team" + 2 secondary links (Explore Careers site, Join Talent Network).
- Right: **3 job-category tiles** (Sales / Engineering / IT jobs — image + label, each linked to Workday).

### I. "Shareholders spotlight" — Investors
- Left: eyebrow **"Investors"**, H2, paragraph, "Learn more" + 2 report links (quarterly earnings PDF, quarterly results).
- Right: **3 icon link tiles** (Stock info / Company highlights / Upcoming events).

### J. Share/Print Toolbar
- Floating action list: Share, Print, Mail, Copy Link, Facebook, LinkedIn, Close.

### K. Footer
- **3 link lists** (row 1): Careers · Contact & Support | Order Products · Diabetes Supplies · Product Manuals | Product Security · Prop 65 · DMCA.
- Brand block: logo + tagline **"Engineering the extraordinary"**.
- **Social icons:** Facebook, YouTube, LinkedIn.
- **Legal list:** Your Privacy Choices · Privacy Notice · Terms of Use · Accessibility Statement.
- Address block: *710 Medtronic Parkway, Minneapolis, MN 55432-5604 USA* + doc ID + **©2026 Medtronic**.
- Plus a **OneTrust cookie consent** dialog overlay (third-party, not migrated as content).

---

## 2. Component / Block Mapping (source → proposed EDS blocks)

| # | Source region | Proposed EDS block/approach | Variant notes |
|---|---|---|---|
| A | Header nav + audience select + search | `header` (nav fragment) + custom search/audience integration | Drawer nav; Coveo search is 3rd-party — stub or re-integrate |
| B | Primary hero (video) | `hero` (variant: `hero-video`) | Eyebrow + video/image + CTA |
| C | Secondary promo panel | `cards` (single) or `promo` variant | Image + eyebrow + title + CTA |
| D | Innovation story rail | `cards` (variant: `cards-carousel` / horizontal scroll) | 6 cards, category eyebrow, linked card |
| E | Who We Are + stats | `columns` + `stats`/`counter` block | Video + 3 stat tiles |
| F | Featured story band | `feature`/`hero` (compact variant) | Eyebrow + title + desc + CTA |
| G | Our Impact + animated stats | `columns` + `stats` (animated-icon variant) + nested `cards` | Icon stat tiles + promo card |
| H | Careers | `columns` + `cards` (3 job tiles) | CTA cluster + linked image tiles |
| I | Shareholders spotlight | `columns` + `cards` (icon-link variant) | Report links + 3 icon tiles |
| J | Share toolbar | Ignore (utility widget, not authored content) | Not migrated |
| K | Footer | `footer` (nav fragment) | Link lists + social + legal + address |

**New block variants likely required:** `hero-video`, `cards-carousel` (scroll rail), `stats` (numeric + animated-icon), icon-link `cards`. Existing boilerplate `columns`, `cards`, `hero`, `header`, `footer` cover the rest.

---

## 3. Key Considerations & Risks

- **Video assets:** 2 `<video>` elements (hero + Who-We-Are). Need source URLs and poster images; decide autoplay/muted/loop and lazy-loading for LCP.
- **Duplicated cards:** the Innovation rail duplicates its 6 cards for looping — author **6 unique cards only**; looping is a block-JS behavior.
- **External links:** most CTAs open new windows to external domains (medtronicspark.com, Workday, investorrelations, news.medtronic.com). Preserve `target`/rel and the external-link icon convention.
- **Third-party widgets:** Coveo search, OneTrust consent, Adobe Launch/Target, Medallia — **not content**; exclude from import, re-integrate via `head.html`/`delayed.js` if in scope.
- **Icon fonts:** logo & social icons use an icon font/SVG sprite — map to `/icons/*.svg`.
- **Stats/counters:** animated count-up on scroll — block JS behavior.
- **Accessibility:** heading order (multiple H2s, 13 H3s), skip links, alt text — preserve during migration.
- **Header/footer** are best migrated as **nav fragments** via the dedicated navigation/footer orchestrators (they require screenshots + hover mapping).

---

## 4. Suggested Prompts (copy-paste ready)

**Scrape & analyze**
> "Scrape and analyze `https://www.medtronic.com/en-us/index.html` — download images, extract metadata, produce cleaned HTML and a page-structure analysis identifying sections and content sequences."

**Section decomposition / block selection**
> "For the Medtronic homepage, identify section boundaries and, per section, decide default content vs blocks. Map the hero, the 'Innovation in action' story rail, the stats bands, careers, and investors sections to EDS blocks and propose any new block variants."

**Hero (video) block**
> "Create a `hero` block variant that supports a background/foreground video with poster image, an eyebrow with icon, an H2, and a single external CTA with a new-window icon — matching the Medtronic AFib hero."

**Card rail block**
> "Build a `cards` variant that renders a horizontally scrollable rail of story cards (image + category eyebrow + linked H3), from 6 authored cards, with looping and keyboard-accessible scroll controls — matching the 'Innovation in action' section."

**Stats block**
> "Create a `stats` block with two variants: plain numeric tiles (e.g. '79M+ Patients served') and animated count-up icon tiles that trigger on scroll into view."

**Navigation & footer**
> "Migrate the Medtronic header (drawer nav + audience selector + search) as a nav fragment using the navigation orchestrator." / "Migrate the Medtronic footer (3 link lists, social icons, legal links, address, tagline) as a footer fragment."

**Design match**
> "Extract the Medtronic design tokens (colors, typography, spacing) and apply them, then visually critique each migrated block against the original and fix mismatches."

---

## 5. Recommended Migration Workflow (step order)

Header, footer, and the video/animation-heavy blocks are the highest-effort items; simple `columns`/`cards` sections are quick wins to sequence first once infrastructure exists.

---

## Checklist

- [ ] **(Optional) Enable helper plugins** — offer to enable `excat-commerce` (n/a here), `project-management`, and `excat-figma` if a Figma source exists; confirm with user before writing `.agents/settings.json`
- [ ] **Confirm scope** with the user (see open questions below) — pages in scope, video handling, search/consent re-integration
- [ ] **Site analysis** — run site-analysis to create the page-template skeleton for the homepage template
- [ ] **Scrape the homepage** — download images/videos, extract metadata, produce cleaned HTML
- [ ] **Page analysis** — identify sections, content sequences, and authoring decisions; produce analysis artifacts
- [ ] **Block inventory** — survey existing boilerplate blocks + Block Collection for reuse
- [ ] **Block mapping** — record DOM selectors per section in `page-templates.json`
- [ ] **Design extraction** — pull design tokens (colors, type, spacing) into global styles
- [ ] **Build/extend blocks:**
  - [ ] `hero` (video variant)
  - [ ] `cards` — story rail (scroll/loop) variant
  - [ ] `cards` — icon-link & job-tile variants
  - [ ] `stats` — numeric + animated-icon variants
  - [ ] `columns` layouts for Who-We-Are, Impact, Careers, Investors
- [ ] **Header migration** — drawer nav + audience selector + search, as nav fragment
- [ ] **Footer migration** — link lists, social, legal, address, tagline
- [ ] **Import infrastructure** — generate block parsers + page transformers
- [ ] **Generate import HTML** and run the bundled import script to create content
- [ ] **Preview & verify** rendering against the original (structure, links, alt text, heading order)
- [ ] **Visual critique** — compare each block/section to the source and fix mismatches
- [ ] **Accessibility & performance** — check heading hierarchy, alt text, lazy-load video, target PSI 100
- [ ] **Lint** (`npm run lint`) and fix issues
- [ ] **Push to feature branch, open PR** with a feature-preview link to the migrated homepage

---

> **Note:** This is a planning artifact — executing the migration (scraping, writing blocks, running the import script) requires **Execute mode**.

**Open questions I'd want answered before executing** (I can gather these via a quick question set when you're ready): (1) Is this a single-page migration or the start of a full-site migration? (2) Should the hero/section **videos** be migrated as-is, or replaced with images/posters? (3) Should third-party **search (Coveo)** and **cookie consent (OneTrust)** be re-integrated, or left out of scope?
