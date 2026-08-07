/**
 * hero-investors — full-bleed banner replicating medtronic.com's
 * ".wrapper-investors-section" ("Shareholders spotlight"): a left content column
 * (eyebrow, headline, paragraph, primary CTA) over a light swirl background, with
 * the remaining links grouped as secondary links in the top-right. The investor
 * icon tiles (.investors-icons) are a separate cards-tile block, overlaid onto
 * this hero's bottom-right by cards-tile.js.
 *
 * Structurally identical to hero-careers; the palette differs (light background,
 * navy headline, blue links) and is handled entirely in CSS.
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const imageRow = rows[0];
  const contentRow = rows[1];

  if (!block.querySelector(':scope > div:first-child picture')) {
    block.classList.add('no-image');
  }
  if (imageRow) imageRow.classList.add('hero-investors-bg');

  if (!contentRow) return;
  const content = contentRow.querySelector(':scope > div') || contentRow;
  content.classList.add('hero-investors-content');

  // Eyebrow: the first paragraph with no link (e.g. "Investors").
  const firstP = content.querySelector(':scope > p');
  if (firstP && !firstP.querySelector('a')) firstP.classList.add('hero-investors-eyebrow');

  // Link paragraphs (a paragraph whose only content is a single link).
  const linkParas = [...content.querySelectorAll(':scope > p')].filter((p) => {
    const a = p.querySelector(':scope > a');
    return a && p.textContent.trim() === a.textContent.trim();
  });

  // First link is the primary CTA; the rest become secondary links (top-right).
  const [primary, ...secondary] = linkParas;
  if (primary) primary.classList.add('hero-investors-cta');
  if (secondary.length) {
    const group = document.createElement('div');
    group.className = 'hero-investors-links';
    secondary.forEach((p) => group.append(p));
    content.append(group);
  }
}
