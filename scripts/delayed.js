import loadSearch from './search.js';

/**
 * Delayed-phase functionality — loaded after the page is fully interactive so it
 * never impacts LCP. Wires up third-party integrations:
 *   - OneTrust cookie-consent CMP (drives the consent gate in consent-check.js)
 *   - Coveo Atomic site search (lazy-loaded on first search:open)
 */

// OneTrust CMP domain script. Replace the data-domain-script id with the site's real one.
const ONETRUST_SRC = 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js';
const ONETRUST_DOMAIN_ID = ''; // TODO: set OneTrust data-domain-script id

/**
 * Loads the OneTrust consent SDK. When the user updates their preferences,
 * OneTrust calls window.OptanonWrapper — we bridge that to the site's
 * consent flow via a `consent.update` event that consent-check.js listens for.
 */
function loadOneTrust() {
  if (!ONETRUST_DOMAIN_ID) return; // not configured yet — consent-check.js default applies

  window.OptanonWrapper = function optanonWrapper() {
    const groups = (window.OnetrustActiveGroups || '');
    // C0002 = performance/analytics, C0004 = targeting. Treat either as consent granted.
    const consented = /C0002|C0004/.test(groups);
    window.dispatchEvent(new CustomEvent('consent.update', { detail: { consented } }));
  };

  const script = document.createElement('script');
  script.src = ONETRUST_SRC;
  script.type = 'text/javascript';
  script.charset = 'UTF-8';
  script.setAttribute('data-domain-script', ONETRUST_DOMAIN_ID);
  document.head.append(script);
}

loadOneTrust();
loadSearch();
