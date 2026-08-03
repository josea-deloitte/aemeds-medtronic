/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-tile (base: cards).
 * Source: https://www.medtronic.com/en-us/index.html (.careers-jobs and .investors-icons)
 * Job / icon-link tiles: each tile is an external link with an image/icon + a label.
 * Handles both the careers job tiles (img + label text inside the anchor) and the
 * investors icon-link tiles (icon span + title attribute label).
 * Cards convention: image (cell 1) + text content (cell 2) per tile.
 */
export default function parse(element, { document }) {
  const container = element;
  // Direct anchor tiles (careers job tiles use anchors as direct children; investors icons
  // wrap an anchor per .*-icon-wrapper). Collect every anchor with an href.
  const anchors = Array.from(container.querySelectorAll('a[href]'))
    // Skip anchors that merely wrap other collected anchors (none here) — keep leaf links.
    .filter((a) => !a.querySelector('a'));

  const cells = [];

  anchors.forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) return;

    const img = a.querySelector('img');
    // Label: explicit text, else title attribute, else aria-label.
    let labelText = (a.textContent || '').trim();
    if (!labelText) labelText = (a.getAttribute('title') || a.getAttribute('aria-label') || '').trim();

    // Linked label text.
    const link = document.createElement('a');
    link.setAttribute('href', href);
    if (a.getAttribute('target')) link.setAttribute('target', a.getAttribute('target'));
    else link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.textContent = labelText || href;

    const textCell = [link];

    if (img) {
      cells.push([img, textCell]);
    } else {
      // Icon-only tiles (e.g. investors icon spans with CSS-backed icons): no <img>,
      // emit single text cell so the tile/link is preserved.
      cells.push([textCell]);
    }
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-tile', cells });
  element.replaceWith(block);
}
