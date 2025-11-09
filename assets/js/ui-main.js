// Transição suave entre páginas (fade)
import { registerSW } from 'virtual:pwa-register';

document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('a[href]');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || link.target === '_blank') return;
      const isExternal = /^https?:\/\//i.test(href) && !href.includes(location.host);
      const isSpecial = href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:');
      if (isExternal || isSpecial) return;
      e.preventDefault();
      document.body.classList.add('fade-out');
      setTimeout(() => { window.location.href = href; }, 400);
    });
  });
});

// --- Registro do Service Worker (PWA via Vite)
try {
  const updateSW = registerSW({
    onNeedRefresh() {
      if (confirm('Uma nova versão do site está disponível. Recarregar agora?')) {
        updateSW(true);
      }
    },
    onOfflineReady() {
      console.log('Avelloz Motos está disponível offline.');
    }
  });
} catch (_) {}
