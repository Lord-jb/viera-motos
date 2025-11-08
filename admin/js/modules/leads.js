// Inbox de Leads
// - Tabs: test-rides e order-queries
// - Carregamento via Firestore

import { db } from './firebase.js';
import { collection, getDocs, orderBy, query } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function mountLeadsFeature() {
  const view = document.getElementById('leads-view');
  if (!view) return;

  // Liga abas
  const buttons = view.querySelectorAll('.tab-link');
  buttons.forEach(btn => {
    btn.addEventListener('click', (evt) => {
      const tabName = btn.dataset.tab;
      openTab(evt, tabName);
    });
  });

  // Funções globais simples para reuso
  window.openTab = function openTab(evt, tabName) {
    const tabcontent = view.getElementsByClassName('tab-content');
    for (let i = 0; i < tabcontent.length; i++) tabcontent[i].style.display = 'none';
    const tablinks = view.getElementsByClassName('tab-link');
    for (let i = 0; i < tablinks.length; i++) tablinks[i].classList.remove('active');
    const active = document.getElementById(tabName);
    if (active) active.style.display = 'block';
    if (evt && evt.currentTarget) evt.currentTarget.classList.add('active');

    if (tabName === 'test-rides') loadTestRides();
    else if (tabName === 'order-queries') loadOrderQueries();
  }

  async function loadTestRides() {
    try {
      const tbody = document.getElementById('test-rides-tbody');
      if (!tbody) return;
      tbody.innerHTML = '';
      const snap = await getDocs(query(collection(db, 'testRides'), orderBy('createdAt', 'desc')));
      snap.forEach((docSnap) => {
        const d = docSnap.data() || {};
        const tr = document.createElement('tr');
        const date = d.date || (d.createdAt && d.createdAt.toDate ? d.createdAt.toDate().toLocaleString('pt-BR') : '-');
        tr.innerHTML = `<td>${escapeHtml(d.name||'-')}</td><td>${escapeHtml(d.phone||'-')}</td><td>${escapeHtml(d.email||'-')}</td><td>${escapeHtml(d.model||d.modelId||'-')}</td><td>${escapeHtml(date)}</td>`;
        tbody.appendChild(tr);
      });
    } catch (err) { /* noop */ }
  }

  async function loadOrderQueries() {
    try {
      const tbody = document.getElementById('order-queries-tbody');
      if (!tbody) return;
      tbody.innerHTML = '';
      const snap = await getDocs(query(collection(db, 'orderQueries'), orderBy('createdAt', 'desc')));
      snap.forEach((docSnap) => {
        const d = docSnap.data() || {};
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${escapeHtml(d.name||'-')}</td><td>${escapeHtml(d.phone||'-')}</td><td>${escapeHtml(d.email||'-')}</td><td>${escapeHtml(d.message||d.notes||'-')}</td>`;
        tbody.appendChild(tr);
      });
    } catch (err) { /* noop */ }
  }

  // Inicializa com a primeira aba
  const first = view.querySelector('.tab-link');
  if (first) {
    first.classList.add('active');
    const firstContent = document.getElementById(first.dataset.tab);
    if (firstContent) firstContent.style.display = 'block';
  }
  // Carrega test-rides por padrão
  try { loadTestRides().catch(() => {}); } catch (_) {}
}


