/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-promo (base: cards).
 * Source: https://www.medtronic.com/en-us/index.html (.our-impact-card / .hero-main-content .migration:nth-of-type(2))
 * A single promo card: optional image + eyebrow + title + optional description + CTA.
 * Cards convention: image (cell 1) + text content (cell 2). When the source card has no
 * inline image (background set via CSS), the card is emitted as a single text cell.
 */
export default function parse(element, { document }) {
  const card = element.querySelector('.our-impact-card') || element;

  const image = card.querySelector('img:not([src^="data:"])');
  const eyebrow = card.querySelector('.eyebrow, [class*="eyebrow"]');
  const headingEl = card.querySelector('h1, h2, h3, .headline, [class*="headline"], [class*="title"]');
  const description = card.querySelector('.copy, p, [class*="copy"], [class*="description"]');
  const cta = card.querySelector('.cta a, a.link--arrowed, a.cta');

  const textCell = [];
  if (eyebrow) {
    const p = document.createElement('p');
    p.textContent = eyebrow.textContent.trim();
    textCell.push(p);
  }
  if (headingEl) {
    // Preserve real headings; promote div-based headline to <h3>.
    if (/^H[1-6]$/.test(headingEl.tagName)) {
      textCell.push(headingEl);
    } else {
      const h = document.createElement('h3');
      h.textContent = headingEl.textContent.trim();
      textCell.push(h);
    }
  }
  if (description && description !== headingEl) {
    const p = document.createElement('p');
    p.textContent = description.textContent.trim();
    textCell.push(p);
  }
  if (cta) {
    const link = document.createElement('a');
    link.setAttribute('href', cta.getAttribute('href'));
    if (cta.getAttribute('target')) link.setAttribute('target', cta.getAttribute('target'));
    link.textContent = (cta.textContent || '').trim() || 'Learn more';
    textCell.push(link);
  }

  if (textCell.length === 0 && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  // Single card row. Include image cell only when an inline image exists.
  if (image) cells.push([image, textCell]);
  else cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo', cells });
  element.replaceWith(block);
}
