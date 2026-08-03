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
}
