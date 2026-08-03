import decorateVideo from './video-util.js';

export default function decorate(block) {
  // Convert the mp4 carrier anchor in the first cell into a background <video>.
  const mediaCell = block.querySelector(':scope > div:first-child');
  if (mediaCell) {
    const video = decorateVideo(mediaCell);
    if (video) {
      mediaCell.classList.add('hero-video-bg');
      block.classList.add('has-video');
    }
  }

  if (!block.querySelector(':scope > div:first-child picture')
    && !block.querySelector('video')) {
    block.classList.add('no-image');
  }
}
