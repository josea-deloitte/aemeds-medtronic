/**
 * hero-careers — full-bleed photo banner replicating medtronic.com id="Careers":
 * a left content column (eyebrow, headline, paragraph, primary CTA) over a dark
 * photo, with the remaining links grouped as secondary links in the top-right.
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const imageRow = rows[0];
  const contentRow = rows[1];

  if (!block.querySelector(':scope > div:first-child picture')) {
    block.classList.add('no-image');
  }
  if (imageRow) imageRow.classList.add('hero-careers-bg');

  if (!contentRow) return;
  const content = contentRow.querySelector(':scope > div') || contentRow;
  content.classList.add('hero-careers-content');

  // Eyebrow: the first paragraph with no link (e.g. "Careers").
  const firstP = content.querySelector(':scope > p');
  if (firstP && !firstP.querySelector('a')) firstP.classList.add('hero-careers-eyebrow');

  // Link paragraphs (a paragraph whose only content is a single link).
  const linkParas = [...content.querySelectorAll(':scope > p')].filter((p) => {
    const a = p.querySelector(':scope > a');
    return a && p.textContent.trim() === a.textContent.trim();
  });

  // First link is the primary CTA; the rest become secondary links (top-right).
  const [primary, ...secondary] = linkParas;
  if (primary) primary.classList.add('hero-careers-cta');
  if (secondary.length) {
    const group = document.createElement('div');
    group.className = 'hero-careers-links';
    secondary.forEach((p) => group.append(p));
    content.append(group);
  }
}
