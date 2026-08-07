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

  block.replaceChildren(ul);

  // ------------------------------------------------------------------------
  // "Tiles-over-hero" pattern (careers job tiles / investor icon tiles):
  // small icon+label tiles authored in their own section that the source
  // overlays on the bottom-right of a full-bleed hero. When this block shares
  // a section with a hero-careers or hero-investors block, render it as
  // translucent blue tiles and relocate it onto that hero as an overlay.
  // Detected from structure/context — no hardcoded labels.
  // ------------------------------------------------------------------------
  const cards = [...ul.children];
  const onePerCard = cards.length >= 2 && cards.every((li) => li.querySelectorAll('a[href]').length === 1);

  const section = block.closest('.section');
  // The hero this tile row belongs to — strictly its OWN section, so the careers
  // tiles and investor tiles each land on their respective hero (never the wrong one).
  const hero = section && section.querySelector('.hero-careers, .hero-investors');

  if (onePerCard && hero && !hero.querySelector('.cards-tile-tiles')) {
    const wrapper = block.closest('.cards-tile-wrapper') || block;
    block.classList.add('cards-tile-tiles', 'cards-tile-tiles-overlay');
    hero.classList.add('has-tiles-overlay');
    hero.append(block);
    // Remove the now-empty wrapper/section left behind so no blank band remains.
    if (wrapper !== block && !wrapper.children.length) {
      const emptySection = wrapper.closest('.section');
      wrapper.remove();
      if (emptySection && !emptySection.querySelector('.block')) emptySection.remove();
    }
  } else if (onePerCard) {
    // No hero to overlay (e.g. standalone tile row) — still render as blue tiles.
    block.classList.add('cards-tile-tiles');
  }
}
