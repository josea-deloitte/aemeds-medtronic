import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-tile-card-image';
      else div.className = 'cards-tile-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  // "Jobs" variant (e.g. the careers job tiles): every card is a single link and
  // they all resolve to the same single external host (a jobs/apply destination).
  // These render as translucent blue tiles rather than bordered white cards.
  // Detected from content — no hardcoded labels — so the sibling Investor tiles
  // (which mix the current host with an external one) keep the default styling.
  const cards = [...ul.children];
  const onePerCard = cards.length >= 2 && cards.every((li) => li.querySelectorAll('a[href]').length === 1);
  const hosts = new Set(ul.querySelectorAll(':scope > li a[href]').length
    ? [...ul.querySelectorAll(':scope > li a[href]')].map((a) => {
      try { return new URL(a.href, window.location.href).host; } catch { return ''; }
    }) : []);
  if (onePerCard && hosts.size === 1 && ![...hosts][0].includes(window.location.hostname)) {
    block.classList.add('cards-tile-jobs');
  }

  block.replaceChildren(ul);
}
