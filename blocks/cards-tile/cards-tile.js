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
  const externalHost = hosts.size === 1 && ![...hosts][0].includes(window.location.hostname);
  const isJobs = onePerCard && externalHost;
  if (isJobs) block.classList.add('cards-tile-jobs');

  block.replaceChildren(ul);

  // Overlay the job tiles onto the bottom-right of a preceding careers hero, as
  // on the source. The tiles are authored in their own section; if a hero-careers
  // block exists earlier on the page, relocate them into it as an overlay. Done
  // after decoration so the DOM is final; falls back to in-flow if no hero.
  if (isJobs) {
    const hero = document.querySelector('.hero-careers');
    if (hero && !hero.querySelector('.cards-tile-jobs')) {
      const wrapper = block.closest('.cards-tile-wrapper') || block;
      hero.classList.add('has-jobs-overlay');
      block.classList.add('cards-tile-jobs-overlay');
      hero.append(block);
      // Remove the now-empty wrapper/section left behind so no blank band remains.
      if (wrapper !== block && !wrapper.children.length) {
        const section = wrapper.closest('.section');
        wrapper.remove();
        if (section && !section.querySelector('.block')) section.remove();
      }
    }
  }
}
