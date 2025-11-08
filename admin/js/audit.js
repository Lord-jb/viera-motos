// Auditoria – registra ações e exibe logs (ES Modules)
// Registro: { user: {uid,email}, action, target, date }

import { auth, db } from './modules/firebase.js';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

// Registra uma ação de auditoria
export async function logAudit({ action, target }) {
  try {
    const u = auth.currentUser;
    const entry = {
      user: u ? { uid: u.uid, email: u.email || null } : null,
      action: String(action || '').slice(0, 128),
      target: typeof target === 'string' ? target.slice(0, 256) : JSON.stringify(target || {}),
      date: serverTimestamp(),
    };
    await addDoc(collection(db, 'audit'), entry);
  } catch (_) {
    // auditoria não deve quebrar a ação principal
  }
}

// Monta a página de auditoria, se os elementos existirem
function mountAuditTable() {
  const tbody = document.getElementById('audit-tbody');
  const countEl = document.getElementById('audit-count');
  if (!tbody) return;

  const q = query(collection(db, 'audit'), orderBy('date', 'desc'));
  onSnapshot(q, (snap) => {
    const rows = [];
    let total = 0;
    snap.forEach((doc) => {
      total += 1;
      const a = doc.data() || {};
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

// Auto-init na página de auditoria
document.addEventListener('DOMContentLoaded', () => {
  mountAuditTable();
});

