/*
 * SEO Dinâmico (site público)
 * Lê Firestore (settings/general) e atualiza: <title>, meta description,
 * og:title e og:description em tempo real (onSnapshot, compat API).
 * Depende de: assets/js/firebase-init.js (variável global 'firestore').
 */

(function () {
  if (typeof window === 'undefined') return;

  function ensureMeta(selector, attrs) {
    let el = document.head.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      Object.keys(attrs).forEach(k => el.setAttribute(k, attrs[k]));
      document.head.appendChild(el);
    }
    return el;
  }

  function updateSEO(title, description) {
    try {
      if (title) document.title = String(title);
      if (description) {
        let descEl = document.head.querySelector('meta[name="description"]');
        if (!descEl) descEl = ensureMeta('meta[name="description"]', { name: 'description' });
        descEl.setAttribute('content', String(description));
      }
      // Open Graph
      let ogTitle = document.head.querySelector('meta[property="og:title"]');
      if (!ogTitle) ogTitle = ensureMeta('meta[property="og:title"]', { property: 'og:title' });
      ogTitle.setAttribute('content', String(title || document.title || ''));

      let ogDesc = document.head.querySelector('meta[property="og:description"]');
      if (!ogDesc) ogDesc = ensureMeta('meta[property="og:description"]', { property: 'og:description' });
      ogDesc.setAttribute('content', String(description || ''));
    } catch (_) { /* noop */ }
  }

  function initSEO() {
    if (typeof firestore === 'undefined') return;
    try {
      const ref = firestore.collection('settings').doc('general');
      // Atualiza em tempo real
      ref.onSnapshot((doc) => {
        if (!doc || !doc.exists) return;
        const d = doc.data() || {};
        const title = d.title || document.title;
        const description = d.description || '';
        updateSEO(title, description);
      });
    } catch (_) { /* noop */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSEO);
  } else {
    initSEO();
  }
})();

