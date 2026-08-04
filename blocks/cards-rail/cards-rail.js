import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * "Innovation in action" story rail.
 *
 * Mirrors the source markup (#scroller > .news-item): each card is a single
 * <a> wrapping the image and a content block (category + title), so the WHOLE
 * card is clickable. Rendered as a horizontally-scrolling <ul> of <li>.
 *
 * Also mirrors the source's interaction model (see its scroller5.js): the
 * rail can be click-and-dragged on desktop, snaps to the nearest card once
 * released, and slowly auto-advances until the visitor interacts with it.
 *
 * Unlike the source, the loop is seamless: the source duplicates its cards
 * once and then hard-resets scrollLeft to 0 when it runs out of room, which
 * is a visible jump-cut (just a rarer one, thanks to the duplicate set).
 * Here the authored cards are cloned once and, as soon as the rail scrolls
 * past the real set into the clones, it's silently rewound by exactly one
 * set-width — since the clone at that position is pixel-identical to the
 * original it replaces, the rewind is invisible and the rail can advance
 * forever in either direction without ever visibly cutting.
 *
 * Authored structure per card (two cells):
 *   cell 0: <picture> (image)
 *   cell 1: <p>CATEGORY</p> + <h3><a href>Title</a></h3>
 */

const DRAG_MULTIPLIER = 1.5; // matches the source's pointer-to-scroll ratio
const DRAG_THRESHOLD = 5; // px of pointer movement before a press counts as a drag
const AUTO_SCROLL_STEP = 1; // px per tick
const AUTO_SCROLL_INTERVAL = 40; // ms

/**
 * Distance from one card's start to the next (width + gap), used both to
 * work out which card to snap to and how wide one full set of cards is.
 * @param {Element} scroller the scrolling <ul>
 */
function getCardStep(scroller) {
  const [first, second] = scroller.children;
  if (!first) return 0;
  if (!second) return first.getBoundingClientRect().width;
  return second.getBoundingClientRect().left - first.getBoundingClientRect().left;
}

/**
 * Clones the authored cards once and appends the clones, so the rail has a
 * seamless run of lookalike content to scroll into. Clones are hidden from
 * assistive tech and keyboard tab order — they're a visual loop illusion,
 * not distinct content.
 * @param {Element} scroller the scrolling <ul>
 * @returns {number} the pixel width of one full (authored) set of cards
 */
function duplicateForLoop(scroller) {
  const cards = [...scroller.children];
  const setWidth = cards.length * getCardStep(scroller);
  cards.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('a').forEach((a) => { a.tabIndex = -1; });
    scroller.append(clone);
  });
  return setWidth;
}

/**
 * Keeps the rail inside one set-width of scroll position by silently
 * rewinding it a full set-width as soon as it scrolls into the cloned set —
 * imperceptible, since the clones are pixel-identical to the originals they
 * stand in for. Runs on every scroll, regardless of what caused it (drag,
 * auto-advance, wheel, touch), so the rail loops forever either direction.
 * @param {Element} scroller the scrolling <ul>
 * @param {number} setWidth the pixel width of one full set of cards
 */
function enableSeamlessLoop(scroller, setWidth) {
  if (!setWidth) return;
  scroller.addEventListener('scroll', () => {
    if (scroller.scrollLeft >= setWidth) {
      scroller.scrollLeft -= setWidth;
    } else if (scroller.scrollLeft < 0) {
      scroller.scrollLeft += setWidth;
    }
  });
}

function snapToNearestCard(scroller) {
  const step = getCardStep(scroller);
  if (!step) return;
  // Wrap the target into the authored (non-cloned) half, so the smooth-scroll
  // animation never lands exactly on the loop boundary the seamless-loop
  // rewind (above) also watches for.
  const originalCount = scroller.children.length / 2;
  const index = Math.round(scroller.scrollLeft / step) % originalCount;
  scroller.scrollTo({ left: index * step, behavior: 'smooth' });
}

/**
 * Click-and-drag scrolling for mouse users (browsers don't offer this
 * natively the way they do for touch). Dragging pans the rail at
 * DRAG_MULTIPLIER times the pointer's travel; releasing snaps to the nearest
 * card. A drag also suppresses the click that follows it, so a card's link
 * doesn't fire when the visitor was just panning the rail.
 *
 * Tracks the pointer's position incrementally (rather than against a single
 * start position) so it composes cleanly with the seamless-loop rewind,
 * which can adjust scrollLeft out from under a drag mid-gesture.
 * @param {Element} scroller the scrolling <ul>
 */
function enableDragToScroll(scroller) {
  let dragging = false;
  let dragged = false;
  let lastX = 0;

  scroller.addEventListener('mousedown', (e) => {
    dragging = true;
    dragged = false;
    lastX = e.pageX;
    scroller.classList.add('is-dragging');
    e.preventDefault(); // avoid selecting card text while dragging
  });

  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const delta = e.pageX - lastX;
    if (Math.abs(delta) > DRAG_THRESHOLD) dragged = true;
    scroller.scrollLeft -= delta * DRAG_MULTIPLIER;
    lastX = e.pageX;
  });

  window.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    scroller.classList.remove('is-dragging');
    snapToNearestCard(scroller);
  });

  // A card's link shouldn't navigate if the visitor just dragged past it.
  scroller.addEventListener('click', (e) => {
    if (dragged) {
      e.preventDefault();
      dragged = false;
    }
  });

  // Touch scrolling is native; just snap once the visitor lifts their finger.
  scroller.addEventListener('touchend', () => snapToNearestCard(scroller));
}

/**
 * Slowly, continuously drifts the rail so later cards come into view,
 * pausing while the visitor hovers, focuses, touches, or drags it. Skipped
 * entirely when the visitor prefers reduced motion (WCAG 2.2.2). Advances
 * forever without an end check — the seamless-loop rewind keeps the
 * underlying scrollLeft small, so there's never a boundary to reach.
 * @param {Element} scroller the scrolling <ul>
 */
function enableAutoScroll(scroller) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let intervalId = null;
  const start = () => {
    if (intervalId) return;
    intervalId = setInterval(() => {
      scroller.scrollLeft += AUTO_SCROLL_STEP;
    }, AUTO_SCROLL_INTERVAL);
  };
  const stop = () => {
    clearInterval(intervalId);
    intervalId = null;
  };

  ['mouseenter', 'mousedown', 'touchstart'].forEach((type) => scroller.addEventListener(type, stop));
  ['mouseleave', 'mouseup', 'touchend'].forEach((type) => scroller.addEventListener(type, start));
  // Keyboard users tabbing through cards pause it; only resume once focus
  // leaves the rail entirely (not when it moves from one card to the next).
  scroller.addEventListener('focusin', stop);
  scroller.addEventListener('focusout', (e) => {
    if (!scroller.contains(e.relatedTarget)) start();
  });

  start();
}

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

  const setWidth = duplicateForLoop(ul);
  enableSeamlessLoop(ul, setWidth);
  enableDragToScroll(ul);
  enableAutoScroll(ul);

  block.replaceChildren(ul);
}
