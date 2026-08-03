/**
 * Lazily-loaded site search integration (Coveo Atomic).
 *
 * The header renders a lightweight search trigger button (see blocks/header/header.js)
 * and dispatches a `search:open` event on click. This module listens for that event
 * and, on first use, loads the Coveo Atomic web components and initialises the search
 * interface — so the heavy third-party bundle never affects initial page load / LCP.
 *
 * Configure with the site's real Coveo values before go-live.
 */
const COVEO = {
  atomicScript: 'https://static.cloud.coveo.com/atomic/v3/atomic.esm.js',
  organizationId: '', // TODO: set Medtronic Coveo organization id
  accessToken: '', // TODO: set search-only access token
};

let loaded = false;
let panel;

function buildPanel() {
  panel = document.createElement('div');
  panel.className = 'site-search-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <div class="site-search-inner">
      <atomic-search-interface>
        <atomic-search-box placeholder="Search Medtronic"></atomic-search-box>
        <atomic-result-list></atomic-result-list>
      </atomic-search-interface>
      <button type="button" class="site-search-close" aria-label="Close search">×</button>
    </div>`;
  document.body.append(panel);
  panel.querySelector('.site-search-close').addEventListener('click', () => {
    panel.hidden = true;
    document.body.classList.remove('search-open');
  });
}

async function initCoveo() {
  if (loaded) return;
  loaded = true;
  buildPanel();

  // Load the Atomic web components bundle.
  const script = document.createElement('script');
  script.type = 'module';
  script.src = COVEO.atomicScript;
  document.head.append(script);

  // Initialise once the custom element is defined.
  if (window.customElements) {
    await window.customElements.whenDefined('atomic-search-interface').catch(() => {});
    const searchInterface = panel.querySelector('atomic-search-interface');
    const configured = COVEO.organizationId && COVEO.accessToken;
    if (searchInterface && searchInterface.initialize && configured) {
      try {
        await searchInterface.initialize({
          organizationId: COVEO.organizationId,
          accessToken: COVEO.accessToken,
        });
        searchInterface.executeFirstSearch();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Coveo search failed to initialise:', e);
      }
    }
  }
}

export default function loadSearch() {
  window.addEventListener('search:open', async () => {
    await initCoveo();
    if (panel) {
      panel.hidden = false;
      const box = panel.querySelector('atomic-search-box');
      if (box && box.focus) box.focus();
    }
  });
}
