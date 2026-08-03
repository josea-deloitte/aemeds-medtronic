import decorateVideo from './video-util.js';

/**
 * Hero with a full-bleed background video and a white "card" floating over it.
 * Content structure from the parser:
 *   cell 1 (media): mp4 carrier link + poster image
 *   cell 2 (content): eyebrow, H2, paragraph, foreground image, CTA link
 * Rendered result mirrors the source: video background, white card with a text
 * column on the left and the foreground image on the right.
 */
export default function decorate(block) {
  const cells = [...block.children];
  const mediaCell = cells[0];
  const contentCell = cells[1];

  // 1. Background video from the media cell.
  if (mediaCell) {
    const video = decorateVideo(mediaCell);
    if (video) {
      mediaCell.classList.add('hero-video-bg');
      block.classList.add('has-video');
    } else {
      mediaCell.remove();
    }
  }

  // 2. Build the floating card from the content cell.
  if (contentCell) {
    contentCell.classList.add('hero-video-card');

    // Split content into a text column and a media (foreground image) column.
    const inner = contentCell.querySelector(':scope > div') || contentCell;
    const foregroundPic = inner.querySelector('picture');
    const textCol = document.createElement('div');
    textCol.className = 'hero-video-text';
    const mediaCol = document.createElement('div');
    mediaCol.className = 'hero-video-media';

    [...inner.children].forEach((node) => {
      // A paragraph that only wraps the foreground picture goes to the media column.
      if (foregroundPic && node.contains(foregroundPic)) {
        mediaCol.append(foregroundPic);
      } else {
        textCol.append(node);
      }
    });

    // Style the eyebrow (first paragraph) and CTA.
    const eyebrow = textCol.querySelector('p');
    if (eyebrow) eyebrow.classList.add('hero-video-eyebrow');
    const cta = textCol.querySelector('a');
    if (cta) cta.classList.add('hero-video-cta');

    inner.replaceWith(textCol);
    contentCell.append(mediaCol);
  }
}
