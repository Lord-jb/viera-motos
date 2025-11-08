/*
 * Leads Inbox: Tabs e carregamento de dados (testRides e orderQueries)
 * Depende de: assets/js/firebase-init.js (variáveis globais: auth, firestore)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof auth === 'undefined' || typeof firestore === 'undefined') return;

  auth.onAuthStateChanged((user) => {
    if (user) initLeads();
  });

  function initLeads() {
    const leadsView = document.getElementById('leads-view');
    if (!leadsView) return;

    // 1) Função de Abas (Tabs)
    window.openTab = function openTab(evt, tabName) {
      // Oculta todo o conteúdo das abas
      const tabcontent = document.getElementsByClassName('tab-content');
      for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
      }

      // Remove a classe "active" de todos os links das abas
      const tablinks = document.getElementsByClassName('tab-link');
      for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '');
      }

      // Mostra a aba clicada e adiciona a classe "active"
      const active = document.getElementById(tabName);
      if (active) active.style.display = 'block';
      if (evt && evt.currentTarget) evt.currentTarget.className += ' active';

      // CHAMA A FUNÇÃO DE CARREGAR DADOS QUANDO A ABA É CLICADA
      if (tabName === 'test-rides') {
        loadTestRides();
      } else if (tabName === 'order-queries') {
        loadOrderQueries();
      }
    };

    // 2) Funções de Carregar Leads do Firebase
    window.loadTestRides = async function loadTestRides() {
      try {
        const tbody = document.getElementById('test-rides-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        // Compat API: usa .get() (equivalente ao getDocs)
        const snap = await firestore.collection('testRides').orderBy('createdAt', 'desc').get();
        snap.forEach((doc) => {
          const d = doc.data() || {};
          const tr = document.createElement('tr');
          const name = d.name || '-';
          const phone = d.phone || '-';
          const email = d.email || '-';
          const model = d.model || d.modelId || '-';
          const date = d.date || (d.createdAt && typeof d.createdAt.toDate === 'function' ? d.createdAt.toDate().toLocaleString('pt-BR') : '-');
          tr.innerHTML = `<td>${escapeHtml(name)}</td><td>${escapeHtml(phone)}</td><td>${escapeHtml(email)}</td><td>${escapeHtml(model)}</td><td>${escapeHtml(date)}</td>`;
          tbody.appendChild(tr);
        });
      } catch (err) {
        console.error('Erro ao carregar testRides:', err);
      }
    };

    window.loadOrderQueries = async function loadOrderQueries() {
      try {
        const tbody = document.getElementById('order-queries-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        const snap = await firestore.collection('orderQueries').orderBy('createdAt', 'desc').get();
        snap.forEach((doc) => {
          const d = doc.data() || {};
          const tr = document.createElement('tr');
          const name = d.name || '-';
          const phone = d.phone || '-';
          const email = d.email || '-';
          const message = d.message || d.notes || '-';
          tr.innerHTML = `<td>${escapeHtml(name)}</td><td>${escapeHtml(phone)}</td><td>${escapeHtml(email)}</td><td>${escapeHtml(message)}</td>`;
          tbody.appendChild(tr);
        });
      } catch (err) {
        console.error('Erro ao carregar orderQueries:', err);
      }
    };

    // Utilitário simples de escape
    function escapeHtml(s) {
      return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    }

    // 3) Navegação de views: quando clicar em data-view="leads"
    const sidebar = document.getElementById('admin-sidebar-menu');
    if (sidebar) {
      sidebar.addEventListener('click', (e) => {
        const link = e.target.closest('a[data-view]');
        if (!link) return;
        const view = link.getAttribute('data-view');
        if (view === 'leads') {
          e.preventDefault();
          const views = document.querySelectorAll('.view');
          views.forEach(v => v.style.display = 'none');
          leadsView.style.display = 'grid';
          // Carrega a primeira aba automaticamente
          loadTestRides();
          // Marca a aba inicial como ativa
          const tablinks = document.getElementsByClassName('tab-link');
          for (let i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(' active', '');
          }
          const firstTab = document.querySelector('.tab-link');
          if (firstTab) firstTab.classList.add('active');
          const firstContent = document.getElementById('test-rides');
          if (firstContent) firstContent.style.display = 'block';
        }
      });
    }
  }
});

