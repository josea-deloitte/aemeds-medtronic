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
    if (eyebrow) {
      eyebrow.classList.add('hero-video-eyebrow');
      // Prepend the source's decorative "healthcare" mark (heart-in-hand) so the
      // eyebrow reads as an icon + label, matching medtronic.com. Decorative only.
      const icon = document.createElement('span');
      icon.className = 'hero-video-eyebrow-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 33" fill="none"><path d="M29.637 5.118C29.344 2.198 26.948 0 24.06 0c-1.767 0-3.422.852-4.482 2.276C18.518.843 16.863 0 15.096 0c-2.888 0-5.275 2.198-5.577 5.118a5.7 5.7 0 0 0-.026.582c0 .252.026.53.078.851l.006.061c.345 1.894 1.672 4.188 3.956 6.83l.302.347c2.577 2.92 5.292 5.144 5.318 5.161l.284.226.138.061.035.026.388-.313s2.75-2.242 5.318-5.161l.078-.087c.077-.087.155-.174.224-.26 2.284-2.642 3.612-4.936 3.957-6.84l.005-.061c.06-.322.086-.6.086-.852 0-.191-.009-.39-.026-.582m-1.224.608c-.009.947-.397 2.085-1.155 3.389l-.052.086c-.56.947-1.328 2.007-2.284 3.128l-.121.148c-.069.078-.138.156-.207.243l-.155.182c-1.991 2.242-4.103 4.092-4.861 4.727-.759-.635-2.87-2.485-4.862-4.727l-.164-.182c-.069-.078-.138-.156-.198-.234l-.121-.148c-.957-1.13-1.724-2.181-2.284-3.128l-.052-.07c-.759-1.303-1.147-2.45-1.155-3.397v-.035c0-2.45 1.957-4.44 4.353-4.44 1.44 0 2.792.747 3.603 2.007l.051.078.828 1.512.827-1.512.052-.078c.81-1.26 2.163-2.007 3.603-2.007 2.396 0 4.353 1.99 4.353 4.44v.07z" fill="#170f5f"/></svg>';
      eyebrow.prepend(icon);
    }
    const cta = textCol.querySelector('a');
    if (cta) cta.classList.add('hero-video-cta');

    inner.replaceWith(textCol);
    contentCell.append(mediaCol);
  }
}
