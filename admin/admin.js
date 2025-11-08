// Admin unificado â€“ um Ãºnico entrypoint para o painel
// MantÃ©m login + guarda + montagem de todas as views no admin.html

import { auth, db } from './js/modules/firebase.js';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, setPersistence, browserLocalPersistence } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { collection, getDocs, addDoc, setDoc, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
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
  const loginSection = document.getElementById('login-screen');
  const adminPanel = document.getElementById('admin-panel');
  const emailEl = document.getElementById('user-email');
  const form = document.getElementById('login-form');
  const feedback = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-button');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebarBackdrop = document.getElementById('sidebar-backdrop');
  const themeToggle = document.getElementById('theme-toggle');

  // Tema: aplica preferência salva
  try {
    const savedTheme = localStorage.getItem('admin-theme');
    if (savedTheme === 'dark') document.body.classList.add('theme-dark');
  } catch (_) {}

  // Logout
  
  // Login
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      feedback.textContent = '';
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      try {
        // Garante persistência local da sessão
        try { await setPersistence(auth, browserLocalPersistence); } catch(_){}
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err) {
        const code = err && err.code ? String(err.code) : 'auth/error';
        const map = {
          'auth/invalid-email': 'Email inválido.',
          'auth/missing-password': 'Informe a senha.',
          'auth/wrong-password': 'Senha incorreta.',
          'auth/user-not-found': 'Usuário não encontrado.',
          'auth/invalid-credential': 'Credenciais inválidas.',
          'auth/operation-not-allowed': 'Login por email/senha não habilitado no Firebase.',
          'auth/unauthorized-domain': 'Domínio não autorizado no Firebase Auth.',
          'auth/network-request-failed': 'Falha de rede. Verifique sua conexão.'
        };
        feedback.textContent = map[code] || ('Falha ao entrar: ' + code);
      }
    });
  }

  // Logout
  if (logoutBtn) logoutBtn.addEventListener('click', async (e) => { e.preventDefault(); try { await signOut(auth); } catch(_){} });

  // Toggle sidebar (mobile)
  if (sidebarToggle) sidebarToggle.addEventListener('click', () => {
    document.body.classList.toggle('sidebar-open');
  });
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', () => {
    document.body.classList.remove('sidebar-open');
  });

  // Toggle tema (claro/escuro)
  if (themeToggle) themeToggle.addEventListener('click', () => {
    const dark = document.body.classList.toggle('theme-dark');
    try { localStorage.setItem('admin-theme', dark ? 'dark' : 'light'); } catch(_) {}
  });

  // Guarda + montagem
  const router = initViewRouter();
  // Navegação: aceita data-view e data-section (fallback legado)
  if (menu && router) {
    menu.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      const dv = link.getAttribute('data-view');
      const ds = link.getAttribute('data-section');
      if (!dv && !ds) return;
      e.preventDefault();
      let view = dv || ds || '';
      if (view === 'modelos') view = 'models'; // normaliza PT->EN
      if (typeof router.showView === 'function') router.showView(view);
    });
  }

  // Dashboard: cria view se não existir e carrega métricas
  function ensureDashboardView() {
    if (document.getElementById('dashboard-view')) return;
    const content = document.getElementById('content-area');
    if (!content) return;
    const div = document.createElement('div');
    div.className = 'view';
    div.id = 'dashboard-view';
    div.style.display = 'none';
    div.innerHTML = `
      <h2>Dashboard</h2>
      <div class=\"admin-content\">
        <div class=\"content-card\">
          <h3>Métricas</h3>
          <div class=\"metrics-grid\" style=\"display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;\">
            <div class=\"metric-card\" style=\"background:#fff;border:1px solid var(--color-border);border-radius:8px;padding:16px;\">
              <div class=\"metric-label\" style=\"opacity:.7;font-size:12px;\">Banners</div>
              <div class=\"metric-value\" id=\"metric-banners\" style=\"font-size:28px;font-weight:700;\">-</div>
            </div>
            <div class=\"metric-card\" style=\"background:#fff;border:1px solid var(--color-border);border-radius:8px;padding:16px;\">
              <div class=\"metric-label\" style=\"opacity:.7;font-size:12px;\">Modelos</div>
              <div class=\"metric-value\" id=\"metric-models\" style=\"font-size:28px;font-weight:700;\">-</div>
            </div>
            <div class=\"metric-card\" style=\"background:#fff;border:1px solid var(--color-border);border-radius:8px;padding:16px;\">
              <div class=\"metric-label\" style=\"opacity:.7;font-size:12px;\">Test-Rides</div>
              <div class=\"metric-value\" id=\"metric-testRides\" style=\"font-size:28px;font-weight:700;\">-</div>
            </div>
            <div class=\"metric-card\" style=\"background:#fff;border:1px solid var(--color-border);border-radius:8px;padding:16px;\">
              <div class=\"metric-label\" style=\"opacity:.7;font-size:12px;\">Consultas</div>
              <div class=\"metric-value\" id=\"metric-orderQueries\" style=\"font-size:28px;font-weight:700;\">-</div>
            </div>
          </div>
        </div>
      </div>`;
    const firstView = document.querySelector('.view');
    if (firstView && firstView.parentNode) firstView.parentNode.insertBefore(div, firstView);
    else content.appendChild(div);
  }

  async function mountDashboard() {
    try {
      const collections = ['banners','models','testRides','orderQueries'];
      const results = await Promise.all(collections.map(async (name) => {
        try {
          const snap = await getDocs(collection(db, name));
          return [name, snap.size];
        } catch (_) { return [name, 0]; }
      }));
      const map = Object.fromEntries(results);
      const set = (id, val) => { const el = document.getElementById(`metric-${id}`); if (el) el.textContent = String(val); };
      set('banners', map['banners'] ?? '-');
      set('models', map['models'] ?? '-');
      set('testRides', map['testRides'] ?? '-');
      set('orderQueries', map['orderQueries'] ?? '-');
    } catch (_) { /* noop */ }
  }
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
      // Suporte extra para data-section (fallback) e dashboard
      const sv = (v, ok) => { showLink(`a[data-view="${v}"]`, ok); showLink(`a[data-section="${v}"]`, ok); };
      sv('models', isEditorOrAbove);
      sv('banners', isEditorOrAbove);
      sv('settings', r==='owner'||r==='admin');
      sv('audit', r==='owner'||r==='admin');
      sv('leads', true);
      sv('dashboard', true);
      showLink('a[data-view="models"]', isEditorOrAbove);
      showLink('a[data-view="alert"]', isEditorOrAbove);
      showLink('a[data-view="banners"]', isEditorOrAbove);
      showLink('a[data-view="settings"]', r==='owner'||r==='admin');
      showLink('a[data-view="audit"]', r==='owner'||r==='admin');
      showLink('a[data-view="leads"]', true); // sempre disponÃ­vel
    }

    // Montagem das features (checam presenÃ§a da view antes de agir)
    if (isEditorOrAbove) {
      mountCatalogFeature(role);
      mountBannersFeature(role);      // config/offer
      mountBannersCollection();        // coleÃ§Ã£o banners
      mountSettingsGeneral();
      mountAuditLogs();
    }
    mountLeadsFeature();

    // View padrÃ£o: Modelos para Editor+/Owner, Leads para Viewer
    if (router) {
      if (isEditorOrAbove) router.showView('models'); else router.showView('leads');
    }
    // Força dashboard como primeira seção visível
    ensureDashboardView();
    try { await mountDashboard(); } catch(_){}
    if (router && document.getElementById('dashboard-view')) router.showView('dashboard');
  });

  // Centralização de Firestore
  async function getCollectionData(collectionName) {
    const snap = await getDocs(collection(db, collectionName));
    return snap.docs.map(d => ({ id: d.id, ...(d.data() || {}) }));
  }
  async function addDocument(collectionName, data) {
    const ref = await addDoc(collection(db, collectionName), data);
    return ref.id;
  }
  async function updateDocument(collectionName, id, data) {
    await setDoc(doc(db, collectionName, id), data, { merge: true });
    return true;
  }
  async function deleteDocument(collectionName, id) {
    await deleteDoc(doc(db, collectionName, id));
    return true;
  }

  // Expor helpers globais para os módulos
  window.FS = { getCollectionData, addDocument, updateDocument, deleteDocument };
});



