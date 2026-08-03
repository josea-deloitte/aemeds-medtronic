/**
 * Shared helper: convert an EDS video carrier link into a real autoplay/muted/loop
 * background <video> element.
 *
 * Authors reference a video by linking to its .mp4 URL, so the visible link text is
 * the .mp4 URL. NOTE: EDS/DA sanitises the anchor's `href` (".mp4" becomes "-mp4"),
 * so we must read the real URL from the link TEXT, not the href. A poster image (a
 * sibling <picture>/<img>) is used as the video poster for a meaningful first frame.
 *
 * @param {Element} scope Element to search within (a block or a column cell)
 * @returns {HTMLVideoElement|null} the created video, or null if no mp4 link found
 */
export default function decorateVideo(scope) {
  // Find the carrier anchor: either its href or its text points at an .mp4.
  const anchor = [...scope.querySelectorAll('a')].find((a) => {
    const href = a.getAttribute('href') || '';
    const text = (a.textContent || '').trim();
    return /\.mp4(\?|$)/i.test(href) || /\.mp4(\?|$)/i.test(text);
  });
  if (!anchor) return null;

  // Prefer the text URL (real .mp4); fall back to href if it still has .mp4.
  const text = (anchor.textContent || '').trim();
  const href = anchor.getAttribute('href') || '';
  const src = /\.mp4(\?|$)/i.test(text) ? text : href;
  if (!/^https?:\/\//i.test(src)) return null;

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

  // Replace the carrier anchor's wrapper (usually a <p>) with the video, and
  // drop a leftover poster <picture> in the same cell.
  const cell = anchor.closest('div') || anchor.parentElement;
  const wrapper = anchor.closest('p') || anchor;
  wrapper.replaceWith(video);
  if (cell) {
    const strayPicture = cell.querySelector('picture');
    if (strayPicture && !video.contains(strayPicture)) {
      const pWrap = strayPicture.closest('p') || strayPicture;
      pWrap.remove();
    }
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
