/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-feature (base: hero).
 * Source: https://www.medtronic.com/en-us/index.html (.wrapper-cta-banner .cta-banner)
 * Featured story band: eyebrow + title + description + CTA. No background image.
 * Hero convention: 1 column. Row 2 (background image) omitted; Row 3 holds all content.
 */
export default function parse(element, { document }) {
  const banner = element.querySelector('.cta-banner, .banner-container') || element;

  const eyebrow = banner.querySelector('.eyebrow, [class*="eyebrow"]');
  const headingEl = banner.querySelector('h1, h2, h3, .headline, [class*="headline"]');
  const description = banner.querySelector('.copy, [class*="copy"], p');
  const cta = banner.querySelector('.cta a, a.link--arrowed');

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
    link.textContent = (cta.textContent || '').trim() || 'Find out';
    contentCell.push(link);
  }

  if (contentCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[contentCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-feature', cells });
  element.replaceWith(block);
}
