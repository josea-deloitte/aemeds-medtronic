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

  // The hero this tile row belongs to = the nearest hero-careers/hero-investors
  // block in a PRECEDING wrapper. Walking back from this block's own wrapper (not
  // just "any hero in the section") means careers tiles attach to the careers hero
  // and investor tiles to the investors hero even when both sections were merged
  // into one — each tile row is authored right after its own hero.
  const wrapper = block.closest('.cards-tile-wrapper') || block;
  let hero = null;
  for (let sib = wrapper.previousElementSibling; sib && !hero; sib = sib.previousElementSibling) {
    hero = sib.querySelector(':scope > .hero-investors, :scope > .hero-careers')
      || (sib.matches('.hero-investors, .hero-careers') ? sib : null);
  }
  // Fallback: any not-yet-claimed hero in the same section.
  if (!hero) {
    const section = block.closest('.section');
    hero = section && [...section.querySelectorAll('.hero-careers, .hero-investors')]
      .find((h) => !h.querySelector('.cards-tile-tiles'));
  }

  if (onePerCard && hero && !hero.querySelector('.cards-tile-tiles')) {
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
