import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/fragments/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // EDS wraps a section's default content in a ".default-content-wrapper", which
  // nests the real <p>/<ul> one level deeper and breaks the block's grid/flex
  // layouts. Flatten every wrapper so each group's content are direct children.
  footer.querySelectorAll('.default-content-wrapper').forEach((dcw) => {
    while (dcw.firstChild) dcw.parentNode.insertBefore(dcw.firstChild, dcw);
    dcw.remove();
  });

  const groups = [...footer.children];

  // After flattening, group content are direct children of the group div.
  const contentRoot = (group) => group;

  // Group 1: primary link columns (three <ul>s)
  const [linksGroup, brandGroup, legalGroup] = groups;
  if (linksGroup) {
    linksGroup.classList.add('footer-links');
    [...linksGroup.querySelectorAll('ul')].forEach((ul) => ul.classList.add('footer-link-column'));
  }

  // Group 2: brand + social + legal-links band
  if (brandGroup) {
    brandGroup.classList.add('footer-brand');
    const brandRoot = contentRoot(brandGroup);
    const paras = [...brandRoot.querySelectorAll(':scope > p')];
    // first paragraph holds the logo image, second the tagline
    if (paras[0] && paras[0].querySelector('img')) paras[0].classList.add('footer-logo');
    if (paras[1]) paras[1].classList.add('footer-tagline');
    const uls = [...brandRoot.querySelectorAll(':scope > ul')];
    if (uls[0]) {
      uls[0].classList.add('footer-social');
      // external social links open in a new tab
      uls[0].querySelectorAll('a').forEach((a) => {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
        const img = a.querySelector('img');
        if (img && !a.getAttribute('aria-label')) a.setAttribute('aria-label', img.getAttribute('alt') || '');
      });
    }
    if (uls[1]) uls[1].classList.add('footer-legal');
  }

  // Group 3: address / copyright band
  if (legalGroup) legalGroup.classList.add('footer-meta');

  // External (absolute, off-site) links in the link columns open in a new tab.
  footer.querySelectorAll('.footer-links a[href^="http"]').forEach((a) => {
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });

  block.append(footer);
}
