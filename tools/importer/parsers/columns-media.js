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

  // --- Right column: background video preserved as a link whose TEXT is the mp4 URL
  //     (EDS video convention; an empty <a href="x.mp4"></a> is stripped on render).
  //     blocks/columns-media decorates it into a real <video>; the GIF is the poster. ---
  const rightCell = [];
  const srcVideo = right ? right.querySelector('video') : null;
  const posterImg = right ? right.querySelector('img.background-image-middle, img') : null;
  if (srcVideo) {
    const mp4 = Array.from(srcVideo.querySelectorAll('source'))
      .map((s) => s.getAttribute('src'))
      .find((s) => s && s.trim());
    if (mp4) {
      const videoLink = document.createElement('a');
      videoLink.setAttribute('href', mp4);
      videoLink.textContent = mp4;
      rightCell.push(videoLink);
      // Skip an animated-GIF poster: they are frequently >20MB (DA content-bus
      // rejects images over 20MB) and the mp4 plays over the poster anyway.
      const posterSrc = posterImg && posterImg.getAttribute('src');
      if (posterSrc && !/\.gif($|\?)/i.test(posterSrc)) rightCell.push(posterImg);
    }
  }
  // Fallback: if no video, use the media image so the column is never empty
  // (still skip oversized animated GIFs).
  if (rightCell.length === 0 && posterImg) {
    const posterSrc = posterImg.getAttribute('src') || '';
    if (!/\.gif($|\?)/i.test(posterSrc)) rightCell.push(posterImg);
  }

  if (leftCell.length === 0 && rightCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[leftCell, rightCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells });
  element.replaceWith(block);
}
