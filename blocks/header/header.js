import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element (ul.nav-sections)
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-drop').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('button.nav-hamburger');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * Builds the synthetic "back" row shown at the top of a drilled-into mobile
 * submenu (mirrors the source's generic "Overview" back control). Collapsing
 * also resets any deeper level left open beneath it, so re-entering starts fresh.
 * @param {Element} li the nav-drop <li> this back control collapses
 */
function buildNavBack(li) {
  const back = document.createElement('li');
  back.className = 'nav-back';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'nav-back-button';
  button.innerHTML = '<span class="nav-back-icon"></span>Overview';
  button.addEventListener('click', () => {
    li.setAttribute('aria-expanded', 'false');
    li.querySelectorAll('.nav-drop').forEach((drop) => drop.setAttribute('aria-expanded', 'false'));
  });
  back.append(button);
  return back;
}

/**
 * Recursively decorates a nav <ul> at any depth: marks each <li> that has a
 * nested <ul> as a "nav-drop" (toggleable), and prepends a synthetic "Overview"
 * back row to its child list. On mobile the block's CSS shows one level at a
 * time (a drill-down); on desktop each level cascades as a flyout column to
 * the right of its parent. Supports the source's 3-level depth (and beyond).
 * @param {Element} ul the <ul> to decorate
 */
function decorateNavGroup(ul) {
  [...ul.children].forEach((li) => {
    const childUl = li.querySelector(':scope > ul');
    if (!childUl) return;
    li.classList.add('nav-drop');
    li.setAttribute('aria-expanded', 'false');
    childUl.prepend(buildNavBack(li));

    const trigger = li.querySelector(':scope > a');
    if (trigger) {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const expanded = li.getAttribute('aria-expanded') === 'true';
        [...ul.children].forEach((sibling) => {
          if (sibling !== li && sibling.classList.contains('nav-drop')) {
            sibling.setAttribute('aria-expanded', 'false');
          }
        });
        li.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      });
    }

    decorateNavGroup(childUl);
  });
}

/**
 * Builds the audience/region selector from the first <ul> in the tools section.
 * The list items (Healthcare professionals / Patients / Career seekers) come from
 * the nav fragment; the control shell is built here.
 * @param {Element} navTools the tools section element
 */
function buildAudienceSelect(navTools) {
  const list = navTools.querySelector('ul');
  const options = list ? [...list.querySelectorAll('li')].map((li) => li.textContent.trim()) : [];
  const select = document.createElement('select');
  select.className = 'nav-audience';
  select.setAttribute('aria-label', 'Search within');
  const placeholder = document.createElement('option');
  placeholder.textContent = 'Search within';
  placeholder.value = '';
  select.append(placeholder);
  options.forEach((opt) => {
    const option = document.createElement('option');
    option.textContent = opt;
    option.value = opt.toLowerCase().replace(/\s+/g, '-');
    select.append(option);
  });
  if (list) list.remove();
  return select;
}

/**
 * Builds the header search box matching the source: an "audience" select, a
 * text input, and a submit button, grouped as one rounded control. Submitting
 * (or focusing) lazily loads the real Coveo search via the 'search:open' event
 * that delayed.js listens for.
 * @param {Element} navTools the tools section element
 */
function decorateSearch(navTools) {
  const searchIcon = navTools.querySelector('.icon-search');
  const placeholderHost = searchIcon ? (searchIcon.closest('p') || searchIcon) : null;

  const form = document.createElement('form');
  form.className = 'nav-search';
  form.setAttribute('role', 'search');
  form.append(buildAudienceSelect(navTools));

  const input = document.createElement('input');
  input.type = 'search';
  input.className = 'nav-search-input';
  input.setAttribute('aria-label', 'Search Medtronic');
  input.placeholder = 'Search Medtronic';
  form.append(input);

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'nav-search-submit';
  submit.setAttribute('aria-label', 'Search Medtronic');
  submit.innerHTML = '<span class="nav-search-icon"></span>';
  form.append(submit);

  const openSearch = () => {
    window.dispatchEvent(new CustomEvent('search:open', { detail: { query: input.value } }));
    document.body.classList.add('search-open');
  };
  form.addEventListener('submit', (e) => { e.preventDefault(); openSearch(); });
  input.addEventListener('focus', () => window.dispatchEvent(new CustomEvent('search:prefetch')), { once: true });

  if (placeholderHost) placeholderHost.replaceWith(form);
  else navTools.append(form);
}

/**
 * Builds the region/language selector: a trigger button showing the current
 * region and a dropdown panel listing every country link. Content comes from
 * the nav fragment (a ":location: <current region>" paragraph followed by a
 * <ul> of country <a>s); this only builds the interactive shell.
 * @param {Element} navTools the tools section element
 */
function decorateRegion(navTools) {
  // The region label paragraph carries the location icon + current region text.
  const labelP = [...navTools.querySelectorAll(':scope > p')]
    .find((p) => p.querySelector('.icon-location'));
  const list = navTools.querySelector('ul');
  if (!labelP || !list) return;

  const current = labelP.textContent.trim();

  const region = document.createElement('div');
  region.className = 'nav-region';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'nav-region-trigger';
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-haspopup', 'true');
  trigger.innerHTML = '<span class="icon icon-location"></span>';
  const label = document.createElement('span');
  label.className = 'nav-region-label';
  label.textContent = current;
  trigger.append(label);

  const panel = document.createElement('div');
  panel.className = 'nav-region-panel';
  panel.hidden = true;
  list.classList.add('nav-region-list');
  // Mark the current region for highlighting.
  list.querySelectorAll('a').forEach((a) => {
    if (a.textContent.trim() === current.replace(/^\s*/, '')) a.setAttribute('aria-current', 'true');
  });
  panel.append(list);

  trigger.addEventListener('click', () => {
    const open = trigger.getAttribute('aria-expanded') === 'true';
    trigger.setAttribute('aria-expanded', open ? 'false' : 'true');
    panel.hidden = open;
  });
  // Close on outside click / escape.
  document.addEventListener('click', (e) => {
    if (!region.contains(e.target) && trigger.getAttribute('aria-expanded') === 'true') {
      trigger.setAttribute('aria-expanded', 'false');
      panel.hidden = true;
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && trigger.getAttribute('aria-expanded') === 'true') {
      trigger.setAttribute('aria-expanded', 'false');
      panel.hidden = true;
      trigger.focus();
    }
  });

  region.append(trigger, panel);
  labelP.replaceWith(region);
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 *
 * Produces a flat, semantic two-row structure that mirrors the original AEM
 * header (utility row: menu + logo + search + tools; primary-nav row) without
 * any of the source's aem-GridColumn / cmp-* wrapper divs:
 *
 *   <nav id="nav" aria-label="Main navigation">
 *     <div class="nav-utility">
 *       <button class="nav-hamburger">…</button>
 *       <a class="nav-brand" href="/en-us/index"><img …></a>
 *       <form class="nav-search" role="search">…</form>
 *       <div class="nav-tools">…</div>
 *     </div>
 *     <ul class="nav-sections">…</ul>
 *   </nav>
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/fragments/nav';
  const fragment = await loadFragment(navPath);

  // The fragment yields three source blocks: [0] brand, [1] primary nav, [2] tools.
  const sourceSections = [...fragment.children];
  block.textContent = '';

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');

  // --- Row 1: utility bar ---------------------------------------------------
  const utility = document.createElement('div');
  utility.className = 'nav-utility';

  // Hamburger drawer toggle (semantic <button>, no wrapper div).
  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-controls', 'nav');
  hamburger.setAttribute('aria-label', 'Open navigation');
  hamburger.innerHTML = '<span class="nav-hamburger-icon"></span>';

  // Brand: unwrap the fragment's logo link into a single <a class="nav-brand">.
  const brand = document.createElement('a');
  brand.className = 'nav-brand';
  const brandSource = sourceSections[0] && sourceSections[0].querySelector('a');
  if (brandSource) {
    brand.href = brandSource.getAttribute('href') || '/en-us/index';
    brand.setAttribute('aria-label', 'Medtronic');
    while (brandSource.firstChild) brand.append(brandSource.firstChild);
  }

  // Tools (search + education link + region) come from source section [2].
  const navTools = document.createElement('div');
  navTools.className = 'nav-tools';
  const toolsSource = sourceSections[2];
  if (toolsSource) {
    while (toolsSource.firstElementChild) navTools.append(toolsSource.firstElementChild);
    // EDS auto-wraps default content in .default-content-wrapper — flatten it
    // so nav-tools' direct children are the actual content elements.
    const dcw = navTools.querySelector('.default-content-wrapper');
    if (dcw) {
      while (dcw.firstChild) navTools.insertBefore(dcw.firstChild, dcw);
      dcw.remove();
    }
  }

  utility.append(hamburger, brand, navTools);
  nav.append(utility);

  // --- Row 2: primary navigation (semantic <ul>) ----------------------------
  const navList = sourceSections[1] && sourceSections[1].querySelector('ul');
  let navSections = null;
  if (navList) {
    navList.classList.add('nav-sections');
    decorateNavGroup(navList);
    nav.append(navList);
    navSections = navList;
  }

  // Build the search box (consumes the audience <ul>), then the region selector
  // (uses the remaining country <ul>). Order matters: search must run first.
  decorateSearch(navTools);
  decorateRegion(navTools);

  // Wire the hamburger and initial expanded state.
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.setAttribute('aria-expanded', 'false');
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
