/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-video (base: hero).
 * Source: https://www.medtronic.com/en-us/index.html (section.hero-jon)
 * Structure (Hero, 1 column, 3 rows):
 *   Row 1: block name
 *   Row 2: background media — the looping background <video> (autoplay/muted/loop, poster preserved)
 *   Row 3: content — eyebrow, heading, subheading, CTA, foreground media image
 */
export default function parse(element, { document }) {
  // --- Background video (preserve as a link whose TEXT is the mp4 URL, the EDS video
  //     convention). An empty <a href="x.mp4"></a> is stripped by EDS/DA rendering, so the
  //     URL must be visible link text; blocks/hero-video decorates it into a real <video>. ---
  const srcVideo = element.querySelector('video.hero-jon__bg, video');
  let videoLink = null;
  let posterSrc = null;
  if (srcVideo) {
    posterSrc = srcVideo.getAttribute('poster');
    const mp4 = Array.from(srcVideo.querySelectorAll('source'))
      .map((s) => s.getAttribute('src'))
      .find((s) => s && s.trim());
    if (mp4) {
      videoLink = document.createElement('a');
      videoLink.setAttribute('href', mp4);
      videoLink.textContent = mp4;
    }
  }

  // --- Content ---
  const card = element.querySelector('.hero-jon__card, .hero-jon__text') || element;
  const eyebrowText = card.querySelector('.eyebrow-content, .eyebrow');
  const heading = card.querySelector('h1, h2, h3, [class*="title"]');
  const subheading = card.querySelector('p');
  const cta = card.querySelector('a.cta, a.link--arrowed, a[href]');
  // Foreground media image (not the background video).
  const mediaImg = element.querySelector('figure.hero-jon__media img, .hero-jon__media img');

  const cells = [];

  // Row 2: background media (video link + optional poster image).
  if (videoLink) {
    const mediaCell = [videoLink];
    if (posterSrc) {
      const posterImg = document.createElement('img');
      posterImg.setAttribute('src', posterSrc);
      posterImg.setAttribute('alt', '');
      mediaCell.push(posterImg);
    }
    cells.push([mediaCell]);
  }

  // Row 3: content cell.
  const contentCell = [];
  if (eyebrowText) {
    const eyebrow = document.createElement('p');
    eyebrow.textContent = eyebrowText.textContent.trim();
    contentCell.push(eyebrow);
  }
  if (heading) contentCell.push(heading);
  if (subheading) contentCell.push(subheading);
  if (mediaImg) contentCell.push(mediaImg);
  if (cta) {
    // Normalize CTA to plain linked text (drop decorative arrow icon inside).
    const link = document.createElement('a');
    link.setAttribute('href', cta.getAttribute('href'));
    if (cta.getAttribute('target')) link.setAttribute('target', cta.getAttribute('target'));
    link.textContent = (cta.textContent || '').trim() || 'See how';
    contentCell.push(link);
  }
  cells.push([contentCell]);

  if (!heading && !subheading && !bgVideo) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-video', cells });
  element.replaceWith(block);
}
