// Dashboard Admin (ES Modules)
// - Exibe métricas (contagem de docs)
// - Mostra nome e papel do usuário
// - Integra com seed (runSeed)

import { auth, db } from './modules/firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { doc, getDoc, collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { getUserRole } from './utils/roles.js';
import { runSeed } from './seed.js';

async function countCollection(colName) {
  try {
    const snap = await getDocs(collection(db, colName));
    return snap.size;
  } catch (_) {
    return 0;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const userNameEl = document.getElementById('dash-user-name');
  const userRoleEl = document.getElementById('dash-user-role');
  const bannersEl = document.getElementById('metric-banners');
  const modelsEl = document.getElementById('metric-models');
  const leadsEl = document.getElementById('metric-leads');
  const usersEl = document.getElementById('metric-users');
  const btnSeed = document.getElementById('btn-seed');
  const seedFeedback = document.getElementById('seed-feedback');

  onAuthStateChanged(auth, async (user) => {
    if (!user) return; // guard.js fará redirect

    // Nome e papel
    const role = await getUserRole(user);
    if (userNameEl) userNameEl.textContent = user.displayName || (user.email || '-');
    if (userRoleEl) userRoleEl.textContent = role;

    // Métricas
    try {
      // Banners/Alertas: doc config/offer
      let bannersCount = 0;
      try { const offer = await getDoc(doc(db, 'config', 'offer')); bannersCount = offer.exists() ? 1 : 0; } catch (_) {}
      const modelsCount = await countCollection('models');
      const trCount = await countCollection('testRides');
      const oqCount = await countCollection('orderQueries');
      const leadsCount = trCount + oqCount;
      const usersCount = await countCollection('roles');

      if (bannersEl) bannersEl.textContent = String(bannersCount);
      if (modelsEl) modelsEl.textContent = String(modelsCount);
      if (leadsEl) leadsEl.textContent = String(leadsCount);
      if (usersEl) usersEl.textContent = String(usersCount);
    } catch (_) { /* noop */ }

    // Seed (apenas Owner/Admin)
    const canSeed = ['Owner','Admin'].includes(role);
    if (!canSeed && btnSeed) {
      btnSeed.disabled = true;
      btnSeed.title = 'Apenas Owner/Admin';
    }
    btnSeed?.addEventListener('click', async () => {
      seedFeedback.textContent = '';
      if (!canSeed) return;
      try {
        await runSeed();
        seedFeedback.style.color = 'green';
        seedFeedback.textContent = 'Dados demo gerados com sucesso!';
      } catch (e) {
        seedFeedback.style.color = 'red';
        seedFeedback.textContent = 'Falha ao gerar dados demo.';
      }
    });
  });
});

