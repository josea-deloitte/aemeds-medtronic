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

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;

  const sections = payload
    && payload.template
    && Array.isArray(payload.template.sections)
    ? payload.template.sections
    : [];
  if (sections.length < 2) return;

  const doc = element.ownerDocument || document;

  // At afterTransform time each parsed block is a <table> whose first cell holds
  // the computed block name (e.g. "hero-video" → "Hero Video"), NOT a
  // <div class="hero-video"> (that class only appears in the final rendered
  // output). So we anchor on the block TABLES, matched by header text, and
  // insert <hr>/Section-Metadata as their siblings.
  const computeName = (str) => str
    .replace(/-/g, ' ')
    .replace(/\s(.)/g, (s) => s.toUpperCase())
    .replace(/^(.)/g, (s) => s.toUpperCase());

  const tables = [...element.querySelectorAll('table')];
  const headerOf = (t) => {
    const cell = t.querySelector('tr > td, tr > th');
    return cell ? (cell.textContent || '').trim().toLowerCase() : '';
  };
  // Only the block tables we know about (ignore any nested/data tables).
  const knownNames = new Set(['hero-video', 'cards-promo', 'cards-rail', 'columns-media',
    'cards-stat', 'hero-feature', 'hero-impact', 'cards-impact', 'hero-careers', 'cards-tile']
    .map((n) => computeName(n).toLowerCase()));
  const blockTables = tables
    .filter((t) => knownNames.has(headerOf(t)))
    .map((t) => ({ el: t, name: headerOf(t) }));

  // Resolve each section's anchor (its first content block) with a FORWARD-ONLY
  // cursor, so blocks that appear in two sections (cards-promo, cards-tile) are
  // consumed once each, in document order.
  const resolved = [];
  let cursor = 0;
  for (let i = 0; i < sections.length; i += 1) {
    const section = sections[i];
    const blockNames = Array.isArray(section.blocks) ? section.blocks : [];
    const contentBlocks = blockNames.filter((b) => b !== 'header' && b !== 'footer');
    if (contentBlocks.length === 0) continue;
    const firstName = computeName(contentBlocks[0]).toLowerCase();
    let anchorIdx = -1;
    for (let j = cursor; j < blockTables.length; j += 1) {
      if (blockTables[j].name === firstName) { anchorIdx = j; break; }
    }
    if (anchorIdx === -1) continue;
    cursor = anchorIdx + 1;
    resolved.push({ style: section.style, anchorIdx });
  }

  // Insert <hr>/Section-Metadata as SIBLINGS of the block tables (all block
  // tables share one wrapper, so sibling insertion preserves document order and
  // survives the markdown round-trip). EDS builds a new section at each <hr>.
  // Apply in reverse so insertions don't disturb earlier anchors.
  for (let i = resolved.length - 1; i >= 0; i -= 1) {
    const { style, anchorIdx } = resolved[i];
    const anchor = blockTables[anchorIdx].el;
    // Section Metadata (styled sections): after this section's LAST block table
    // (the one just before the next section's anchor), else the last block.
    if (style) {
      const metadataBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style },
      });
      const next = resolved[i + 1];
      const lastIdx = next ? next.anchorIdx - 1 : blockTables.length - 1;
      const lastEl = lastIdx >= 0 ? blockTables[lastIdx].el : anchor;
      lastEl.after(metadataBlock);
    }
    // Section break before every section except the first.
    if (i > 0) {
      anchor.before(doc.createElement('hr'));
    }
  }
}
