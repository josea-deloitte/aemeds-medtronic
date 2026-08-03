/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-impact (base: hero).
 * Source: https://www.medtronic.com/en-us/index.html (#Our-Impact .wrapper-parent .parent)
 * Gradient intro: eyebrow + headline + paragraph + CTA. Extracts only the intro promo card
 * (.our-impact-card) at the top of the .parent grid; the animated stat tiles (div2/div3/div4)
 * and the access-card belong to other blocks (cards-impact / cards-promo).
 * Hero convention: 1 column; no background image; all content in the final cell.
 */
export default function parse(element, { document }) {
  const parent = element.querySelector('.parent') || element;
  const card = parent.querySelector(':scope > .our-impact-card, .our-impact-card') || parent;

  const eyebrow = card.querySelector('.eyebrow, [class*="eyebrow"]');
  const headingEl = card.querySelector('h1, h2, h3, .headline, [class*="headline"]');
  const description = card.querySelector('.copy, [class*="copy"], p');
  const cta = card.querySelector('.cta a, a.link--arrowed');

  const contentCell = [];
  if (eyebrow) {
    const p = document.createElement('p');
    p.textContent = eyebrow.textContent.trim();
    contentCell.push(p);
  }
  if (headingEl) {
    if (/^H[1-6]$/.test(headingEl.tagName)) {
      contentCell.push(headingEl);
    } else {
      const h = document.createElement('h2');
      h.textContent = headingEl.textContent.trim();
      contentCell.push(h);
    }
  }
  if (description && description !== headingEl) {
    const p = document.createElement('p');
    p.textContent = description.textContent.trim();
    contentCell.push(p);
  }
  if (cta) {
    const link = document.createElement('a');
    link.setAttribute('href', cta.getAttribute('href'));
    if (cta.getAttribute('target')) link.setAttribute('target', cta.getAttribute('target'));
    link.textContent = (cta.textContent || '').trim() || 'Learn more';
    contentCell.push(link);
  }

  if (contentCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[contentCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-impact', cells });
  element.replaceWith(block);
}
