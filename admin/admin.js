// Admin unificado – um único entrypoint para o painel
// Mantém login + guarda + montagem de todas as views no admin.html

import { auth } from './js/modules/firebase.js';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { getUserRole, Roles } from './js/utils/roles.js';
import { initViewRouter } from './js/modules/router.js';
import { mountCatalogFeature } from './js/modules/catalog.js';
import { mountLeadsFeature } from './js/modules/leads.js';
import { mountBannersFeature } from './js/modules/banners.js'; // alerta/offer
import { mountBannersCollection } from './js/modules/banners-collection.js';
import { mountSettingsGeneral } from './js/modules/settings-general.js';
import { mountAuditLogs } from './js/modules/audit-logs.js';

function show(el, display = 'block') { if (el) el.style.display = display; }
function hide(el) { if (el) el.style.display = 'none'; }

document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('login-section');
  const adminPanel = document.getElementById('admin-panel');
  const emailEl = document.getElementById('user-email');
  const form = document.getElementById('login-form');
  const feedback = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-button');

  // Login
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      feedback.textContent = '';
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err) {
        const code = err && err.code ? String(err.code) : 'auth/error';
        feedback.textContent = 'Falha ao entrar: ' + code;
      }
    });
  }

  // Logout
  if (logoutBtn) logoutBtn.addEventListener('click', async (e) => { e.preventDefault(); try { await signOut(auth); } catch(_){} });

  // Guarda + montagem
  const router = initViewRouter();
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      hide(adminPanel); show(loginSection, 'flex');
      if (emailEl) emailEl.textContent = '';
      return;
    }

    // Autenticado
    hide(loginSection); show(adminPanel, 'flex');
    if (emailEl) emailEl.textContent = user.email || '';

    const role = await getUserRole(user); window.__ROLE = role;
    const r = String(role||'').toLowerCase();
    const isEditorOrAbove = ['editor','admin','owner'].includes(r);

    // Visibilidade do menu
    const menu = document.getElementById('admin-sidebar-menu');
    if (menu) {
      const showLink = (sel, ok) => { const a = menu.querySelector(sel); if (a) a.style.display = ok ? '' : 'none'; };
      showLink('a[data-view="models"]', isEditorOrAbove);
      showLink('a[data-view="alert"]', isEditorOrAbove);
      showLink('a[data-view="banners"]', isEditorOrAbove);
      showLink('a[data-view="settings"]', r==='owner'||r==='admin');
      showLink('a[data-view="audit"]', r==='owner'||r==='admin');
      showLink('a[data-view="leads"]', true); // sempre disponível
    }

    // Montagem das features (checam presença da view antes de agir)
    if (isEditorOrAbove) {
      mountCatalogFeature(role);
      mountBannersFeature(role);      // config/offer
      mountBannersCollection();        // coleção banners
      mountSettingsGeneral();
      mountAuditLogs();
    }
    mountLeadsFeature();

    // View padrão: Modelos para Editor+/Owner, Leads para Viewer
    if (router) {
      if (isEditorOrAbove) router.showView('models'); else router.showView('leads');
    }
  });
});

