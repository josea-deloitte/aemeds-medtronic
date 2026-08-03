/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-stat (base: cards).
 * Source: https://www.medtronic.com/en-us/index.html (.who-we-are-section)
 * Three numeric stat tiles from the .info-bar (big number + label), plus a trailing
 * "Key Facts" link. Cards convention here uses the single text-cell form (no images):
 * each stat is a card with a big-number heading + label; the Key Facts link is a final card.
 */
export default function parse(element, { document }) {
  const section = element.querySelector('.who-we-are-section') || element;
  const infoBar = section.querySelector('.info-bar') || section;
  const blocks = Array.from(infoBar.querySelectorAll('.info-block, [class*="info-block"]'));

  const cells = [];

  blocks.forEach((tile) => {
    const number = tile.querySelector('.large-copy, [class*="large-copy"]');
    const label = tile.querySelector('.subtext, [class*="subtext"]');
    const tileCell = [];
    if (number) {
      // Big number styled as a heading.
      const h = document.createElement('h2');
      h.textContent = number.textContent.trim();
      tileCell.push(h);
    }
    if (label) {
      const p = document.createElement('p');
      p.textContent = label.textContent.trim();
      tileCell.push(p);
    }
    if (tileCell.length) cells.push([tileCell]);
  });

  // Trailing "Key Facts" link as its own card.
  const keyFacts = section.querySelector('.bottom-right-link, a[href*="key-facts"]');
  if (keyFacts) {
    const link = document.createElement('a');
    link.setAttribute('href', keyFacts.getAttribute('href'));
    if (keyFacts.getAttribute('target')) link.setAttribute('target', keyFacts.getAttribute('target'));
    link.textContent = (keyFacts.textContent || '').trim() || 'Key Facts';
    cells.push([[link]]);
  }

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-stat', cells });
  element.replaceWith(block);
}
