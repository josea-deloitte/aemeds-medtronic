/* eslint-disable */
/* global WebImporter */
/**
 * Regroup transformer (beforeTransform) for the Medtronic homepage.
 *
 * Several visual sections pack multiple authored blocks into ONE DOM container.
 * Because every block parser replaces the element it is given (element.replaceWith),
 * two blocks that resolve to the same (or an ancestor) element would collide: the
 * first parser detaches the shared container and the second is skipped by the import
 * script's "already replaced" guard, silently losing content.
 *
 * This transformer runs BEFORE block discovery and physically splits those shared
 * containers into distinct sibling sub-containers, one per block, preserving DOM order.
 * After it runs, each block instance selector resolves to its own dedicated element.
 *
 *   who-we-are : .who-we-are-section keeps the columns (text + video) for columns-media;
 *                the stats info-bar + key-facts link are moved into a new sibling
 *                .who-we-are-stats for cards-stat.
 *   our-impact : inside .parent, the animated stat tiles (.div2/.div3/.div4) + the
 *                Impact-Report link are wrapped in a new .our-impact-stats for cards-impact.
 *                .our-impact-card (hero-impact) and .access-card (cards-promo) stay put.
 *   careers    : .careers-jobs is lifted out of .careers-section to be its own sibling
 *                so hero-careers (which replaces .careers-section) no longer eats it.
 *   investors  : .investors-icons is lifted out of .investors-section to be its own
 *                sibling so hero-investors (which replaces .investors-section) no
 *                longer eats it (mirrors the careers rule).
 */
export default function transform(hookName, element, payload) {
  if (hookName !== 'beforeTransform') return;
  const doc = (payload && payload.document) || element.ownerDocument;
  if (!doc) return;

  // --- who-we-are: extract stats info-bar into its own sibling ---
  const whoWeAre = element.querySelector('.who-we-are-section');
  if (whoWeAre && !element.querySelector('.who-we-are-stats')) {
    const infoBar = whoWeAre.querySelector('.info-bar');
    const keyFacts = whoWeAre.querySelector('.bottom-right-link');
    if (infoBar) {
      const stats = doc.createElement('div');
      stats.className = 'who-we-are-stats';
      stats.appendChild(infoBar);
      if (keyFacts) stats.appendChild(keyFacts);
      whoWeAre.after(stats);
    }
  }

  // --- our-impact: wrap the animated stat tiles + report link into .our-impact-stats ---
  const parent = element.querySelector('#Our-Impact .parent') || element.querySelector('.wrapper-parent .parent');
  if (parent && !parent.querySelector('.our-impact-stats')) {
    const tiles = Array.from(parent.children).filter(
      (c) => c.querySelector && c.querySelector('.animation-icon'),
    );
    const reportLink = parent.querySelector(':scope > .bottom-right-link-div4, :scope > a[href*="impact-report"], :scope > a[href$=".pdf"]');
    if (tiles.length) {
      const stats = doc.createElement('div');
      stats.className = 'our-impact-stats';
      // Insert the new wrapper where the first tile currently sits (preserves order).
      tiles[0].before(stats);
      tiles.forEach((t) => stats.appendChild(t));
      if (reportLink) stats.appendChild(reportLink);
    }
  }

  // --- careers: lift .careers-jobs out of .careers-section to be a sibling ---
  const careers = element.querySelector('.careers-section');
  if (careers) {
    const jobs = careers.querySelector('.careers-jobs');
    if (jobs) careers.after(jobs);
  }

  // --- investors: lift .investors-icons out of .investors-section to be a sibling ---
  const investors = element.querySelector('.investors-section');
  if (investors) {
    const icons = investors.querySelector('.investors-icons');
    if (icons) investors.after(icons);
  }
}
