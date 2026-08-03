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
  sections.querySelectorAll(':scope > li').forEach((section) => {
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
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
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
  }

  utility.append(hamburger, brand, navTools);
  nav.append(utility);

  // --- Row 2: primary navigation (semantic <ul>) ----------------------------
  const navList = sourceSections[1] && sourceSections[1].querySelector('ul');
  let navSections = null;
  if (navList) {
    navList.classList.add('nav-sections');
    navList.querySelectorAll(':scope > li').forEach((li) => {
      if (li.querySelector('ul')) li.classList.add('nav-drop');
      li.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = li.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navList);
          li.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
    nav.append(navList);
    navSections = navList;
  }

  // Build the search box from the tools content (audience select + input + submit).
  decorateSearch(navTools);

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
