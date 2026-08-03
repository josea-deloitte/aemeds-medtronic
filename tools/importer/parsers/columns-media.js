/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-media (base: columns).
 * Source: https://www.medtronic.com/en-us/index.html (.wrapper-who-we-are-section .who-we-are-section)
 * Two-column layout:
 *   Left column: eyebrow + H2 headline + paragraph copy + CTA link.
 *   Right column: background <video> (preserved as a real autoplay/muted/loop video,
 *     with the animated GIF used as the poster). Do NOT drop the video or replace with image.
 * The stats info-bar and "Key Facts" link on the right belong to cards-stat, not this block.
 */
export default function parse(element, { document }) {
  const section = element.querySelector('.who-we-are-section') || element;
  const left = section.querySelector('.left-content') || section;
  const right = section.querySelector('.right-content');

  // --- Left column content ---
  const eyebrow = left.querySelector('.eyebrow, [class*="eyebrow"]');
  const heading = left.querySelector('h1, h2, h3, .headline, [class*="headline"]');
  const copy = left.querySelector('.copy, p, [class*="copy"]');
  const cta = left.querySelector('.cta a, a.link--arrowed');

  const leftCell = [];
  if (eyebrow) {
    const p = document.createElement('p');
    p.textContent = eyebrow.textContent.trim();
    leftCell.push(p);
  }
  if (heading) {
    if (/^H[1-6]$/.test(heading.tagName)) {
      leftCell.push(heading);
    } else {
      const h = document.createElement('h2');
      h.textContent = heading.textContent.trim();
      leftCell.push(h);
    }
  }
  if (copy) {
    const p = document.createElement('p');
    p.textContent = copy.textContent.trim();
    leftCell.push(p);
  }
  if (cta) {
    const link = document.createElement('a');
    link.setAttribute('href', cta.getAttribute('href'));
    if (cta.getAttribute('target')) link.setAttribute('target', cta.getAttribute('target'));
    link.textContent = (cta.textContent || '').trim() || 'Learn more';
    leftCell.push(link);
  }

  // --- Right column: background video (preserve sources + poster) ---
  const rightCell = [];
  const srcVideo = right ? right.querySelector('video') : null;
  const posterImg = right ? right.querySelector('img.background-image-middle, img') : null;
  if (srcVideo) {
    const video = document.createElement('video');
    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    // Use the animated GIF fallback as the poster if present.
    if (posterImg && posterImg.getAttribute('src')) {
      video.setAttribute('poster', posterImg.getAttribute('src'));
    }
    Array.from(srcVideo.querySelectorAll('source'))
      .map((s) => s.getAttribute('src'))
      .filter((s) => s && s.trim())
      .forEach((src) => {
        const source = document.createElement('source');
        source.setAttribute('src', src);
        if (/\.mp4($|\?)/i.test(src)) source.setAttribute('type', 'video/mp4');
        video.appendChild(source);
      });
    if (video.querySelector('source')) rightCell.push(video);
  }
  // Fallback: if no video, use the media image so the column is never empty.
  if (rightCell.length === 0 && posterImg) rightCell.push(posterImg);

  if (leftCell.length === 0 && rightCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[leftCell, rightCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells });
  element.replaceWith(block);
}
