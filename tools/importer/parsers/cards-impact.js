/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-impact (base: cards).
 * Source: https://www.medtronic.com/en-us/index.html (#Our-Impact .wrapper-parent .parent)
 * Three animated-icon stat tiles (animated icon image + big number + label), taken from the
 * .div2/.div3/.div4 tiles in the Our Impact grid, plus a trailing "Impact Report FY25" PDF link.
 * Cards convention: image (cell 1) + text content (cell 2) per card.
 *
 * NOTE: The original page-templates.json selector (.training-icon-wrapper) pointed at the
 * academy icon, which does not match the intended cards-impact content. Selector corrected to
 * the Our Impact .parent grid so the animated stat tiles + PDF link are captured.
 */
export default function parse(element, { document }) {
  const parent = element.querySelector('.parent') || element;
  // The animated stat tiles are the direct-child divs that contain an .animation-icon.
  const tiles = Array.from(parent.querySelectorAll(':scope > div'))
    .filter((d) => d.querySelector(':scope > .animation-icon, .animation-icon')
      && (d.querySelector('.large-copy') || d.querySelector('[class*="large-copy"]')));

  const cells = [];

  tiles.forEach((tile) => {
    const icon = tile.querySelector('.animation-icon img, img');
    const number = tile.querySelector('.large-copy, [class*="large-copy"]');
    const label = tile.querySelector('.subtext, [class*="subtext"]');

    const textCell = [];
    if (number) {
      const h = document.createElement('h2');
      // Preserve inner markup like the trailing "%" span as text.
      h.textContent = number.textContent.replace(/\s+/g, ' ').trim();
      textCell.push(h);
    }
    if (label) {
      const p = document.createElement('p');
      p.textContent = label.textContent.trim();
      textCell.push(p);
    }

    if (icon) cells.push([icon, textCell]);
    else if (textCell.length) cells.push([textCell]);
  });

  // Trailing "Impact Report FY25" PDF link as its own card.
  const pdfLink = parent.querySelector('.bottom-right-link-div4, a[href$=".pdf"], a[href*="impact-report"]');
  if (pdfLink) {
    const link = document.createElement('a');
    link.setAttribute('href', pdfLink.getAttribute('href'));
    if (pdfLink.getAttribute('target')) link.setAttribute('target', pdfLink.getAttribute('target'));
    link.textContent = (pdfLink.textContent || '').trim() || 'Impact Report FY25';
    cells.push([[link]]);
  }

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-impact', cells });
  element.replaceWith(block);
}
