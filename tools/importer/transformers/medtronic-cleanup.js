/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Medtronic site-wide cleanup.
 *
 * Removes non-authorable site chrome, third-party widgets, and off-screen
 * experience-fragment panels so the import contains only page-level
 * authorable content.
 *
 * 🚨 IMPORTANT: This transformer must NEVER remove <video> or <source>
 * elements. Two background videos are authorable content and are preserved
 * as real <video> tags (hero-jon__bg + who-we-are section video).
 *
 * All selectors below were verified against migration-work/cleaned.html.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // --- Third-party / overlay widgets that could interfere with parsing ---
    WebImporter.DOMUtils.remove(element, [
      // OneTrust cookie consent SDK. Found: <div id="onetrust-consent-sdk">
      // (contains onetrust-banner-sdk, onetrust-pc-sdk, ot-text-resize iframe).
      '#onetrust-consent-sdk',
      // Coveo Atomic global search widget in the header.
      // Found: <atomic-search-interface id="globalSearch" class="... mdt-coveo-atomic ...">
      'atomic-search-interface',
      '.mdt-coveo-atomic',
      // Floating share/print toolbar. Found: <div class="share aem-GridColumn ...">
      // (scoped to the exact leading class token so .share-icon / .share-btn
      // buttons that live inside real content are NOT matched).
      'div.share.aem-GridColumn',
      // "Warn on leave" widget. Found: <div class="warn-on-leave aem-GridColumn ...">
      'div.warn-on-leave',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // --- Non-authorable global chrome ---
    WebImporter.DOMUtils.remove(element, [
      // Global header / navigation.
      // Found: <div class="container responsivegrid com-header-container ...">
      'div.com-header-container',
      // Global footer. Found: <footer> at body level.
      'footer',
      // Off-screen megamenu / experience-fragment panels (contact-us modal,
      // megamenu drawers, etc.). Found: 39x <div class="xfpage page basicpage">.
      'div.xfpage.page.basicpage',
    ]);

    // --- Leftover non-authorable elements ---
    // Found: single <iframe class="ot-text-resize"> (OneTrust). Note: the
    // parent #onetrust-consent-sdk is already removed in beforeTransform;
    // this is a defensive catch for any stray iframe. No <video>/<source>
    // are iframes, so they are unaffected.
    WebImporter.DOMUtils.remove(element, [
      'iframe',
    ]);

    // --- Stray placeholder anchors ---
    // The source emits a leftover <a href="">contactUs</a> widget outside the
    // investors container. Remove anchors with an empty/hash href (and their
    // wrapping <p> if it becomes empty). Never touches mp4 video links.
    element.querySelectorAll('a').forEach((a) => {
      const href = (a.getAttribute('href') || '').trim();
      if (href === '' || href === '#') {
        const p = a.closest('p');
        a.remove();
        if (p && !p.textContent.trim() && !p.querySelector('img, a, picture')) p.remove();
      }
    });
  }
}
