/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-careers (base: hero).
 * Source: https://www.medtronic.com/en-us/index.html (.wrapper-careers-section .careers-section)
 * Text cluster over a background photo:
 *   Row 2 (background image): the careers background photo.
 *   Row 3 (content): eyebrow + H2 + paragraph + primary CTA ("Join the team") + 2 secondary
 *     links ("Explore our Careers site", "Join our Talent Network").
 * The job tiles (.careers-jobs) are a separate cards-tile block.
 */
export default function parse(element, { document }) {
  const section = element.querySelector('.careers-section') || element;

  // Background photo (prefer the labeled .careers-image; fall back to first non-data img).
  const bgImage = section.querySelector('img.careers-image, img:not([src^="data:"])');

  const content = section.querySelector('.careers-content') || section;
  const eyebrow = content.querySelector('.eyebrow, [class*="eyebrow"]');
  const heading = content.querySelector('h1, h2, h3, .careers-title, [class*="title"]');
  const description = content.querySelector('.careers-description, p, [class*="description"]');

  // Primary CTA: the first arrowed link directly under .careers-content (not inside .careers-links).
  const primaryCta = content.querySelector(':scope > .cta a.link--arrowed, :scope > .cta a[href]');
  // Secondary links live in .careers-links.
  const secondaryLinks = Array.from(content.querySelectorAll('.careers-links .cta a.link--arrowed, .careers-links .cta a[href]'));

  const contentCell = [];
  if (eyebrow) {
    const p = document.createElement('p');
    p.textContent = eyebrow.textContent.trim();
    contentCell.push(p);
  }
  if (heading) {
    if (/^H[1-6]$/.test(heading.tagName)) {
      contentCell.push(heading);
    } else {
      const h = document.createElement('h2');
      h.textContent = heading.textContent.trim();
      contentCell.push(h);
    }
  }
  if (description) {
    const p = document.createElement('p');
    p.textContent = description.textContent.trim();
    contentCell.push(p);
  }
  const pushLink = (a, fallbackText) => {
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href) return;
    const link = document.createElement('a');
    link.setAttribute('href', href);
    if (a.getAttribute('target')) link.setAttribute('target', a.getAttribute('target'));
    link.textContent = (a.textContent || '').trim() || fallbackText;
    contentCell.push(link);
  };
  pushLink(primaryCta, 'Join the team');
  secondaryLinks.forEach((a) => pushLink(a, 'Learn more'));

  if (contentCell.length === 0 && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (bgImage) cells.push([bgImage]);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-careers', cells });
  element.replaceWith(block);
}
