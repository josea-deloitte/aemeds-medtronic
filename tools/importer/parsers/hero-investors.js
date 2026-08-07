/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-investors (base: hero).
 * Source: https://www.medtronic.com/en-us/index.html (.wrapper-investors-section .investors-section)
 *
 * Produces the standard Hero table (1 column, 3 rows):
 *   Row 1: block name ("hero-investors").
 *   Row 2: Background Image — the investors swirl background (from an <img> in the
 *          section, or the wrapper's CSS background-image).
 *   Row 3: Title + Subheading + Call(s)-to-Action —
 *          eyebrow ("Investors"), H2 ("Shareholders spotlight"), the description
 *          paragraph, the primary CTA ("Learn more") and the two secondary links
 *          ("Read the latest quarterly earnings", "See our quarterly results").
 * The investor icon tiles (.investors-icons) are a separate cards-tile block.
 */
export default function parse(element, { document }) {
  const section = element.querySelector('.investors-section') || element;

  // Row 2 — background image: prefer an explicit <img>, else the CSS background-image.
  let bgImage = section.querySelector('img:not([src^="data:"])');
  if (!bgImage) {
    const wrapper = element.closest('.wrapper-investors-section') || element;
    const bg = (typeof window !== 'undefined' && window.getComputedStyle)
      ? window.getComputedStyle(wrapper).backgroundImage
      : (wrapper.style && wrapper.style.backgroundImage) || '';
    const match = bg && bg.match(/url\(["']?(.*?)["']?\)/);
    if (match && match[1]) {
      bgImage = document.createElement('img');
      bgImage.setAttribute('src', match[1]);
      bgImage.setAttribute('alt', '');
    }
  }

  // Row 3 — content.
  const content = section.querySelector('.investors-content') || section;
  const eyebrow = content.querySelector('.eyebrow, [class*="eyebrow"]');
  const heading = content.querySelector('h1, h2, h3, .investors-title, [class*="title"]');
  const description = content.querySelector('.investors-description, p, [class*="description"]');

  // Primary CTA: the first arrowed link directly under .investors-content (not in .investors-links).
  const primaryCta = content.querySelector(':scope > .cta a.link--arrowed, :scope > a.link--arrowed, :scope > .cta a[href]');
  // Secondary links live in .investors-links.
  const secondaryLinks = Array.from(content.querySelectorAll('.investors-links .cta a.link--arrowed, .investors-links .cta a[href]'));

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
    link.textContent = (a.textContent || '').trim().replace(/\s+/g, ' ') || fallbackText;
    contentCell.push(link);
  };
  pushLink(primaryCta, 'Learn more');
  secondaryLinks.forEach((a) => pushLink(a, 'Learn more'));

  if (contentCell.length === 0 && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Hero table: row 2 = [background image], row 3 = [content]. (Row 1 = name.)
  const cells = [];
  if (bgImage) cells.push([bgImage]);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-investors', cells });
  element.replaceWith(block);
}
