/**
 * hero-feature — a wide dark featured-story CTA band replicating
 * medtronic.com's "wrapper-cta-banner": an eyebrow + headline + copy on the
 * left and a blue arrowed CTA pinned to the right. The whole band is one story
 * link. Content structure: eyebrow <p>, <h2>, copy <p>, CTA <p><a>.
 * @param {Element} block
 */
export default function decorate(block) {
  if (!block.querySelector(':scope > div:first-child picture')) {
    block.classList.add('no-image');
  }

  const inner = block.querySelector(':scope > div > div') || block.querySelector(':scope > div');
  if (!inner) return;

  // Eyebrow: first paragraph with no link.
  const firstP = inner.querySelector(':scope > p');
  if (firstP && !firstP.querySelector('a')) firstP.classList.add('hero-feature-eyebrow');

  // CTA: the paragraph whose only content is a single link.
  const ctaP = [...inner.querySelectorAll(':scope > p')].find((p) => {
    const a = p.querySelector(':scope > a');
    return a && p.textContent.trim() === a.textContent.trim();
  });

  // Group the text (eyebrow, headline, copy) so the CTA can sit to its right.
  const textCol = document.createElement('div');
  textCol.className = 'hero-feature-text';
  [...inner.children].forEach((node) => {
    if (node !== ctaP) textCol.append(node);
  });
  inner.prepend(textCol);

  if (ctaP) {
    ctaP.classList.add('hero-feature-cta');
    inner.append(ctaP);
  }
  inner.classList.add('hero-feature-row');
}
