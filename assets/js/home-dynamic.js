// Home dinâmica com Firebase v9 modular
import { db } from './firebase-init.js';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', async () => {
  const escapeHTML = (s) => String(s||'').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  const modelsGrid = document.querySelector('.models-grid');
  if (!modelsGrid) return;

  // Banners ativos
  async function renderBanners() {
    try {
      let container = document.getElementById('home-banners');
      let inner;
      if (!container) {
        const hero = document.querySelector('.hero-section');
        const section = document.createElement('section');
        section.id = 'home-banners';
        section.className = 'models-showcase';
        section.innerHTML = '<div class="container"><div class="banners-grid" id="home-banners-inner"></div></div>';
        if (hero && hero.parentNode) hero.parentNode.insertBefore(section, hero.nextSibling);
        inner = section.querySelector('#home-banners-inner');
      } else {
        inner = container.querySelector('#home-banners-inner') || container;
      }
      const snap = await getDocs(query(collection(db, 'banners'), orderBy('order')));
      const items = [];
      snap.forEach(d => { const b = d.data()||{}; if (b.published) items.push({ id:d.id, ...b }); });
      if (!items.length) return;
      inner.innerHTML = items.map(b => `
        <div class="home-banner-item" style="display:flex;gap:1.5rem;align-items:center;margin:1rem 0;">
          <img src="${b.imageUrl || 'assets/images/placeholder-moto.svg'}" alt="${escapeHTML(b.title || 'Banner')}" style="width:100%;max-width:640px;height:auto;object-fit:cover;border-radius:6px;background:#000;">
          <div>
            <h3 style="color:#fff;">${escapeHTML(b.title || '')}</h3>
            ${b.ctaText && b.ctaUrl ? `<a class="btn btn-primary" href="${b.ctaUrl}" target="_blank" rel="noopener">${escapeHTML(b.ctaText)}</a>` : ''}
          </div>
        </div>`).join('');
    } catch (_) {}
  }

  await renderBanners();

  // Oferta (alert bar)
  try {
    const offerRef = doc(db, 'config', 'offer');
    const snap = await getDoc(offerRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.active && data.text) {
        const offerElement = document.createElement('div');
        offerElement.className = 'offer-alert-bar';
        offerElement.innerHTML = `<p>${data.text}</p>`;
        document.body.prepend(offerElement);
      }
    }
  } catch (_) {}

  // Modelos
  try {
    const snapshot = await getDocs(collection(db, 'models'));
    modelsGrid.innerHTML = '';
    if (snapshot.empty) {
      modelsGrid.innerHTML = "<p style='color: white; text-align: center;'>Nenhum modelo cadastrado no momento.</p>";
      return;
    }
    const items = [];
    snapshot.forEach(docSnap => { items.push({ id: docSnap.id, model: (docSnap.data()||{}) }); });
    const parsePrice = (m) => {
      if (typeof m.priceNumber === 'number') return m.priceNumber;
      if (typeof m.price === 'string') {
        const n = parseFloat(m.price.replace(/\./g,'').replace(',', '.'));
        return isNaN(n) ? Number.POSITIVE_INFINITY : n;
      }
      return Number.POSITIVE_INFINITY;
    };
    items.sort((a,b) => parsePrice(a.model) - parsePrice(b.model));
    items.forEach(({ id: modelId, model }) => {
      const imageUrl = (model.colors && model.colors.length > 0) ? model.colors[0].imageUrl : 'assets/images/placeholder-moto.svg';
      const el = document.createElement('div');
      el.className = 'model-card';
      if (modelId === 'az125-alfa') el.classList.add('featured');
      el.innerHTML = `
        <div class="model-card-image"><img src="${imageUrl}" alt="${escapeHTML(model.name)}" loading="lazy" decoding="async"></div>
        <div class="model-card-content">
          <h3 class="model-card-title">${escapeHTML(model.name)}</h3>
          <p class="model-card-description">${escapeHTML(model.tagline || '')}</p>
          <a href="modelo.html?id=${encodeURIComponent(modelId)}" class="btn btn-outline-light">Ver Detalhes</a>
        </div>`;
      modelsGrid.appendChild(el);
    });
  } catch (error) {
    console.error('Erro ao buscar modelos para a home:', error);
    modelsGrid.innerHTML = "<p style='color: red; text-align: center;'>Erro ao carregar modelos.</p>";
  }
});

