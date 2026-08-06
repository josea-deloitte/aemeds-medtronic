import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-promo-card-image';
      else div.className = 'cards-promo-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);

  // Two layouts share this block. Inside the composite "Our Impact" grid the
  // promo is a vertical navy card spanning the column; standalone it is a
  // horizontal white banner (image beside text). Distinguish by context: the
  // Our-Impact grid section also hosts a hero-impact block.
  const section = block.closest('.section');
  const inImpactGrid = section && section.querySelector('.hero-impact');
  block.classList.add(inImpactGrid ? 'cards-promo-navy' : 'cards-promo-banner');
}
