import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * "Innovation in action" story rail.
 *
 * Mirrors the source markup (#scroller > .news-item): each card is a single
 * <a> wrapping the image and a content block (category + title), so the WHOLE
 * card is clickable. Rendered as a horizontally-scrolling <ul> of <li>.
 *
 * Authored structure per card (two cells):
 *   cell 0: <picture> (image)
 *   cell 1: <p>CATEGORY</p> + <h3><a href>Title</a></h3>
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const picture = row.querySelector('picture');
    const category = row.querySelector('p');
    const titleEl = row.querySelector('h3');
    const titleLink = row.querySelector('h3 a, a');
    const href = titleLink ? titleLink.getAttribute('href') : null;

    const li = document.createElement('li');
    li.className = 'cards-rail-card';

    // Whole card is one link (matches source .news-item > a).
    const link = document.createElement('a');
    link.className = 'cards-rail-card-link';
    if (href) link.href = href;
    // External story links open in a new tab.
    if (href && /^https?:\/\//i.test(href)) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }

    // Image.
    if (picture) {
      const imageWrap = document.createElement('div');
      imageWrap.className = 'cards-rail-card-image';
      imageWrap.append(picture);
      link.append(imageWrap);
    }

    // Content (category + title text).
    const body = document.createElement('div');
    body.className = 'cards-rail-card-body';
    if (category) {
      const cat = document.createElement('p');
      cat.className = 'cards-rail-card-category';
      cat.textContent = category.textContent.trim();
      body.append(cat);
    }
    if (titleEl) {
      const title = document.createElement('h3');
      title.className = 'cards-rail-card-title';
      // Plain title text; the whole card is the link.
      title.textContent = (titleLink || titleEl).textContent.trim();
      body.append(title);
    }
    link.append(body);

    li.append(link);
    ul.append(li);
  });

  // Optimize images (portrait crop, ~4:5).
  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  block.replaceChildren(ul);
}
