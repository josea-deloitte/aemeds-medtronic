/**
 * Shared helper: convert an <a href="*.mp4"> carrier anchor (the EDS document-authoring
 * pattern for videos) into a real autoplay/muted/loop background <video> element.
 *
 * Authors reference a video by linking to its .mp4 URL. A poster image (if present as a
 * sibling <picture>/<img> in the same cell) is used as the video poster so there is a
 * meaningful LCP frame before the video is ready.
 *
 * @param {Element} scope Element to search within (a block or a column cell)
 * @returns {HTMLVideoElement|null} the created video, or null if no mp4 anchor found
 */
export default function decorateVideo(scope) {
  const anchor = scope.querySelector('a[href*=".mp4"]');
  if (!anchor) return null;

  const src = anchor.getAttribute('href');
  const video = document.createElement('video');
  video.setAttribute('autoplay', '');
  video.muted = true;
  video.setAttribute('muted', '');
  video.setAttribute('loop', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('preload', 'none');

  // Use a sibling poster image if available (kept out of the video for LCP).
  const posterImg = scope.querySelector('img');
  if (posterImg && posterImg.getAttribute('src')) {
    video.setAttribute('poster', posterImg.getAttribute('src'));
  }

  const source = document.createElement('source');
  source.setAttribute('src', src);
  source.setAttribute('type', 'video/mp4');
  video.appendChild(source);

  // Replace the carrier anchor (and drop the now-redundant poster picture) with the video.
  const cell = anchor.closest('div') || anchor.parentElement;
  anchor.replaceWith(video);
  // Remove a leftover poster <picture> if it lived in a separate wrapper in the same cell.
  if (cell) {
    const strayPicture = cell.querySelector('picture');
    if (strayPicture && !video.contains(strayPicture)) strayPicture.remove();
  }

  // Lazily start playback once in view to avoid autoplay cost before LCP.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
          io.unobserve(video);
        }
      });
    });
    io.observe(video);
  } else {
    video.play().catch(() => {});
  }

  return video;
}
