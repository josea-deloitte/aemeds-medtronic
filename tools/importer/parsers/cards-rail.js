/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-rail (base: cards).
 * Source: https://www.medtronic.com/en-us/index.html (#scroller / .scroller)
 * "Innovation in action" story rail. The DOM duplicates the 6 unique cards ~2x for an
 * infinite-scroll loop effect — we de-duplicate by href and author only the unique cards.
 * Each card (2-column cards row): image (cell 1) + text content (cell 2):
 *   category eyebrow + linked H3 title. The whole card is a link that opens a new window.
 */
export default function parse(element, { document }) {
  const scroller = element.matches('.scroller, #scroller') ? element : element.querySelector('.scroller, #scroller');
  const root = scroller || element;
  const items = Array.from(root.querySelectorAll(':scope > .news-item, .news-item'));

  const cells = [];
  const seen = new Set();

  items.forEach((item) => {
    const anchor = item.querySelector('a[href]');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href) return;
    // De-duplicate the looping copies. Loop copies may differ only by query string
    // (e.g. ?cid=...), so normalize to origin+pathname before comparing.
    let dedupeKey = href;
    try {
      const u = new URL(href, 'https://www.medtronic.com');
      dedupeKey = u.origin + u.pathname;
    } catch (e) { /* keep raw href as key */ }
    if (seen.has(dedupeKey)) return;
    seen.add(dedupeKey);

    const img = item.querySelector('img');
    const category = item.querySelector('.category, [class*="category"]');
    const title = item.querySelector('.news-title, h1, h2, h3, h4, [class*="title"]');

    const textCell = [];
    if (category) {
      const p = document.createElement('p');
      p.textContent = category.textContent.trim();
      textCell.push(p);
    }
    // Whole card is a link opening a new window: wrap the H3 title text in a linked heading.
    const titleText = title ? title.textContent.trim() : (anchor.textContent || '').trim();
    const link = document.createElement('a');
    link.setAttribute('href', href);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.textContent = titleText;
    const heading = document.createElement('h3');
    heading.appendChild(link);
    textCell.push(heading);

    if (img) cells.push([img, textCell]);
    else cells.push([textCell]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-rail', cells });
  element.replaceWith(block);
}
