// Guard de Sessão (ES Modules)
// - Protege páginas do admin exigindo usuário autenticado
// - Se não autenticado, redireciona para login.html
// - Se autenticado, exibe email e ajusta menu por papel

import { auth } from '../../js/modules/firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { getUserRole, Roles } from '../utils/roles.js';

document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      if (!location.pathname.endsWith('/login.html')) window.location.replace('login.html');
      return;
    }
    const el = document.getElementById('user-email');
    if (el) el.textContent = user.email || '';

    const role = await getUserRole(user);
    window.__ROLE = role;

    const menu = document.getElementById('admin-sidebar-menu');
    if (menu) {
      const modelsLink = menu.querySelector('a[data-view="models"]');
      const alertLink = menu.querySelector('a[data-view="alert"]');
      const leadsLink = menu.querySelector('a[data-view="leads"]');
      const bannersLink = menu.querySelector('a[data-view="banners"]');
      const settingsLink = menu.querySelector('a[data-view="settings"]');
      const auditLink = menu.querySelector('a[data-view="audit"]');

      if (role === Roles.Viewer) {
        if (modelsLink) modelsLink.style.display = 'none';
        if (alertLink) alertLink.style.display = 'none';
        if (bannersLink) bannersLink.style.display = 'none';
        if (settingsLink) settingsLink.style.display = 'none';
        if (auditLink) auditLink.style.display = 'none';
        if (leadsLink) leadsLink.style.display = '';
      }
      if (role === Roles.Editor) {
        if (modelsLink) modelsLink.style.display = '';
        if (alertLink) alertLink.style.display = '';
        if (bannersLink) bannersLink.style.display = '';
        if (settingsLink) settingsLink.style.display = 'none';
        if (auditLink) auditLink.style.display = 'none';
        if (leadsLink) leadsLink.style.display = '';
      }
      if (role === Roles.Admin || role === Roles.Owner) {
        if (modelsLink) modelsLink.style.display = '';
        if (alertLink) alertLink.style.display = '';
        if (bannersLink) bannersLink.style.display = '';
        if (settingsLink) settingsLink.style.display = '';
        if (auditLink) auditLink.style.display = '';
        if (leadsLink) leadsLink.style.display = '';
      }
    }
  });
});
