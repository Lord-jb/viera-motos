// App do Painel Admin (ES Modules)
// - Bootstrap de autenticação, papéis e features
// - Conecta views existentes sem alterar layout

import { auth } from './modules/firebase.js';
import { login, logout, onUserChanged, hasRole } from './modules/auth.js';
import { initViewRouter } from './modules/router.js';
import { mountBannersFeature } from './modules/banners.js';
import { mountLeadsFeature } from './modules/leads.js';
import { mountCatalogFeature } from './modules/catalog.js';
import { mountBannersCollection } from './modules/banners-collection.js';
import { mountSettingsGeneral } from './modules/settings-general.js';
import { mountAuditLogs } from './modules/audit-logs.js';

// DOM pronto
document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('login-section');
  const adminPanel = document.getElementById('admin-panel');
  const emailEl = document.getElementById('user-email');
  const form = document.getElementById('login-form');
  const feedback = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-button');

  // Submissão do login
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      feedback.textContent = '';
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      try {
        await login(email, password);
      } catch (err) {
        feedback.textContent = 'Email ou senha inválidos.';
      }
    });
  }

  // Logout
  if (logoutBtn) logoutBtn.addEventListener('click', async (e) => { e.preventDefault(); await logout(); });

  // Observa usuário e monta features por papel
  const router = initViewRouter();
  onUserChanged((user, role) => {
    if (!user) {
      // Tela de login
      if (emailEl) emailEl.textContent = '';
      if (adminPanel) adminPanel.style.display = 'none';
      if (loginSection) loginSection.style.display = 'flex';
      return;
    }

    // Mostra painel
    if (emailEl) emailEl.textContent = user.email || '';
    if (loginSection) loginSection.style.display = 'none';
    if (adminPanel) adminPanel.style.display = 'flex';

    // Monta features conforme papel
    const r = String(role || '').toLowerCase();
    const isEditorOrAbove = ['editor','admin','owner'].includes(r);
    const isViewer = r === 'viewer';
    if (isEditorOrAbove) {
      mountCatalogFeature(role);
      mountBannersFeature(role); // alert/offer
      mountBannersCollection();  // banners (coleção)
      mountSettingsGeneral();
      mountAuditLogs();
    }
    // Leads sempre disponível
    mountLeadsFeature();

    // View padrão
    if (router) {
      if (isEditorOrAbove) router.showView('models');
      else router.showView('leads');
    }
  });
});
