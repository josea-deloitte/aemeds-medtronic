/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Medtronic section breaks + Section Metadata.
 *
 * Reads the section list from the page template (payload.template.sections)
 * and, for each section:
 *   - inserts an <hr> section break before the section (except the first),
 *   - appends a "Section Metadata" block carrying the section's style
 *     (e.g. "dark" / "light") when a style is defined.
 *
 * Runs in afterTransform ONLY. Block parsers run between the hooks and need
 * the original DOM intact; inserting section breaks in beforeTransform would
 * disrupt block matching.
 *
 * Section selectors come from the page template, which was resolved against
 * the live page during analysis. Selectors may be a string or an array of
 * fallback strings — each is tried in order until one resolves.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

/**
 * Resolve the first element matching a section's selector.
 * Accepts a string or an array of fallback selector strings.
 */
function resolveSectionElement(root, selector) {
  const candidates = Array.isArray(selector) ? selector : [selector];
  for (let i = 0; i < candidates.length; i += 1) {
    const sel = candidates[i];
    if (typeof sel === 'string' && sel.trim()) {
      let el = null;
      try {
        el = root.querySelector(sel);
      } catch (e) {
        el = null;
      }
      if (el) return el;
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;

  const sections = payload
    && payload.template
    && Array.isArray(payload.template.sections)
    ? payload.template.sections
    : [];
  if (sections.length < 2) return;

  const doc = element.ownerDocument || document;

  // Process sections in reverse so DOM insertions don't shift the positions
  // of sections we have yet to process.
  for (let i = sections.length - 1; i >= 0; i -= 1) {
    const section = sections[i];
    const sectionEl = resolveSectionElement(element, section.selector);
    if (!sectionEl) {
      // Selector did not resolve on this page; skip gracefully.
      continue;
    }

    // Section Metadata block for styled sections, placed at the end of the
    // section's content (immediately after the section element).
    if (section.style) {
      const metadataBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      sectionEl.after(metadataBlock);
    }

    // Section break before every section except the first, and only when
    // there is content before it in the document.
    if (i > 0 && sectionEl.previousElementSibling) {
      const hr = doc.createElement('hr');
      sectionEl.before(hr);
    }
  }
}
