/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroVideoParser from './parsers/hero-video.js';
import cardsPromoParser from './parsers/cards-promo.js';
import cardsRailParser from './parsers/cards-rail.js';
import columnsMediaParser from './parsers/columns-media.js';
import cardsStatParser from './parsers/cards-stat.js';
import heroFeatureParser from './parsers/hero-feature.js';
import heroImpactParser from './parsers/hero-impact.js';
import cardsImpactParser from './parsers/cards-impact.js';
import heroCareersParser from './parsers/hero-careers.js';
import cardsTileParser from './parsers/cards-tile.js';

// TRANSFORMER IMPORTS
import regroupTransformer from './transformers/medtronic-regroup.js';
import cleanupTransformer from './transformers/medtronic-cleanup.js';
import sectionsTransformer from './transformers/medtronic-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-video': heroVideoParser,
  'cards-promo': cardsPromoParser,
  'cards-rail': cardsRailParser,
  'columns-media': columnsMediaParser,
  'cards-stat': cardsStatParser,
  'hero-feature': heroFeatureParser,
  'hero-impact': heroImpactParser,
  'cards-impact': cardsImpactParser,
  'hero-careers': heroCareersParser,
  'cards-tile': cardsTileParser,
};

// PAGE TEMPLATE CONFIGURATION - embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Medtronic corporate homepage with video hero, secondary promo panel, story card rail, who-we-are + stats, featured story band, impact + animated stats, careers, and investors sections.',
  urls: ['https://www.medtronic.com/en-us/index.html'],
  blocks: [
    { name: 'hero-video', instances: ['#Header-video > section.hero-jon', '.hero-jon'] },
    { name: 'cards-promo', instances: ['.hero-main-content .migration:nth-of-type(2)', '#Our-Impact .access-card'] },
    { name: 'cards-rail', instances: ['#scroller', '.scroller'] },
    { name: 'columns-media', instances: ['.wrapper-who-we-are-section .who-we-are-section'] },
    { name: 'cards-stat', instances: ['.who-we-are-stats'] },
    { name: 'hero-feature', instances: ['.wrapper-cta-banner .cta-banner'] },
    { name: 'hero-impact', instances: ['#Our-Impact .our-impact-card'] },
    { name: 'cards-impact', instances: ['#Our-Impact .our-impact-stats'] },
    { name: 'hero-careers', instances: ['.wrapper-careers-section .careers-section'] },
    { name: 'cards-tile', instances: ['.careers-jobs', '.investors-icons'] },
  ],
  sections: [
    { id: 'header', name: 'Header', selector: 'div.com-header-container', style: null, blocks: ['header'], defaultContent: [] },
    { id: 'hero-primary', name: 'Primary video hero', selector: ['#Header-video > section.hero-jon', '.hero-jon'], style: null, blocks: ['hero-video'], defaultContent: [] },
    { id: 'hero-secondary', name: 'Spark scholarships promo', selector: '.hero-main-content .migration:nth-of-type(2)', style: null, blocks: ['cards-promo'], defaultContent: [] },
    { id: 'innovation-rail', name: 'Innovation in action', selector: '#News-Media', style: 'light', blocks: ['cards-rail'], defaultContent: ['#News-Media .eyebrow', '#News-Media h2.headline'] },
    { id: 'who-we-are', name: 'Where health meets high tech', selector: 'div.migration:nth-of-type(4)', style: 'dark', blocks: ['columns-media', 'cards-stat'], defaultContent: [] },
    { id: 'featured-story', name: 'Featured story band', selector: 'div.migration:nth-of-type(5)', style: 'dark', blocks: ['hero-feature'], defaultContent: [] },
    { id: 'our-impact', name: 'Our Impact', selector: '#Our-Impact', style: null, blocks: ['hero-impact', 'cards-impact', 'cards-promo'], defaultContent: [] },
    { id: 'careers', name: 'Careers that change lives', selector: 'div.migration:nth-of-type(7)', style: 'dark', blocks: ['hero-careers', 'cards-tile'], defaultContent: [] },
    { id: 'investors', name: 'Shareholders spotlight', selector: ['#container-360f186c87', 'div.container.responsivegrid:nth-of-type(3)'], style: 'light', blocks: ['cards-tile'], defaultContent: ['.investors-content .eyebrow', '.investors-content h2'] },
    { id: 'footer', name: 'Footer', selector: 'body > footer', style: 'dark', blocks: ['footer'], defaultContent: [] },
  ],
};

// TRANSFORMER REGISTRY
// regroup MUST run first (beforeTransform) to split composite containers into
// distinct sibling elements so block parsers do not collide on element.replaceWith.
// cleanup removes site chrome / third-party widgets. sections adds <hr> breaks +
// Section Metadata (afterTransform) when the template has 2+ sections.
const transformers = [
  regroupTransformer,
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook.
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        // De-duplicate: multiple selectors may resolve to the same element.
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    // 1. beforeTransform: regroup composite containers, then remove site chrome.
    executeTransformers('beforeTransform', main, payload);

    // 2. Discover blocks using the (now regrouped) DOM.
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block. Skip elements already replaced by an earlier parser.
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform: final cleanup + section breaks / Section Metadata.
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules.
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path.
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
