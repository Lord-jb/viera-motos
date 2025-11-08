// Auditoria – módulo montável no admin.html
// Lê coleção audit e renderiza tabela

import { db } from './firebase.js';
import { collection, onSnapshot, orderBy, query } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

export function mountAuditLogs() {
  const root = document.getElementById('audit-view');
  if (!root) return;
  const tbody = document.getElementById('audit-tbody');
  const countEl = document.getElementById('audit-count');
  if (!tbody) return;

  const q = query(collection(db, 'audit'), orderBy('date','desc'));
  onSnapshot(q, (snap) => {
    let total = 0;
    const rows = [];
    snap.forEach(doc => {
      total += 1;
      const a = doc.data()||{};
      const user = a.user && (a.user.email || a.user.uid) ? (a.user.email || a.user.uid) : '-';
      const action = a.action || '-';
      const target = a.target || '-';
      const date = a.date && typeof a.date.toDate === 'function' ? a.date.toDate().toLocaleString('pt-BR') : '-';
      rows.push(`<tr><td>${date}</td><td>${user}</td><td>${action}</td><td>${target}</td></tr>`);
    });
    tbody.innerHTML = rows.join('');
    if (countEl) countEl.textContent = String(total);
  });
}

