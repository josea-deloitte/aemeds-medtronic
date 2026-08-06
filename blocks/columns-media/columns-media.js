import decorateVideo from '../hero-video/video-util.js';

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-media-${cols.length}-cols`);

  // setup image / video columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      // Convert an mp4 carrier anchor into a background <video> in this column.
      const video = decorateVideo(col);
      if (video) {
        col.classList.add('columns-media-img-col', 'columns-media-video-col');
        return;
      }
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-media-img-col');
        }
      }
    });
  });

  // Tag the text column (the one without media) so it can overlap the media on
  // desktop, and mark its eyebrow (first paragraph with no link) + CTA.
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      if (col.classList.contains('columns-media-img-col')) return;
      col.classList.add('columns-media-text-col');
      const firstP = col.querySelector(':scope > p');
      if (firstP && !firstP.querySelector('a')) firstP.classList.add('columns-media-eyebrow');
      const ctaP = [...col.querySelectorAll(':scope > p')].find((p) => {
        const a = p.querySelector(':scope > a');
        return a && p.textContent.trim() === a.textContent.trim();
      });
      if (ctaP) ctaP.classList.add('columns-media-cta');
    });
  });
}
