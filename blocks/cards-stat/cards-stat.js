import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-stat-card-image';
      else div.className = 'cards-stat-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);

  // A trailing card that is just a link (no stat heading) is the "Key Facts"
  // footnote link rather than a stat — pull it out so it can sit below-right of
  // the media instead of being a stat tile.
  const cards = [...ul.children];
  const last = cards[cards.length - 1];
  let footLink = null;
  if (last && !last.querySelector('h1,h2,h3,h4,h5,h6') && last.querySelector('a[href]')) {
    footLink = last.querySelector('a[href]');
    last.remove();
  }

  // Info-bar overlay: when this stats block accompanies a columns-media block
  // with media (the "who we are" pattern), overlay the stats on the media's
  // bottom-right as a translucent bar, matching the source. Detected from the
  // sibling block — no page-specific hooks.
  const section = block.closest('.section');
  const mediaCol = section && section.querySelector('.columns-media .columns-media-img-col');
  if (mediaCol) {
    // Capture the original wrapper BEFORE moving the block, so we can clean it up.
    const wrapper = block.closest('.cards-stat-wrapper');
    block.classList.add('cards-stat-infobar');
    mediaCol.classList.add('has-stats-overlay');
    mediaCol.append(block);
    if (footLink) {
      footLink.classList.add('cards-stat-footlink');
      mediaCol.append(footLink);
    }
    // Remove the now-empty original wrapper so no blank band remains.
    if (wrapper && wrapper !== block && !wrapper.children.length) wrapper.remove();
  } else if (footLink) {
    // No media to overlay — keep the link in-flow at the end of the block.
    footLink.classList.add('cards-stat-footlink');
    block.append(footLink);
  }
}
