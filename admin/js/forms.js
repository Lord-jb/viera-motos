// Leads (Test-Drive) – Admin
// - Lista em tempo real a coleção 'testRides'
// - Exporta CSV

import { auth, db } from './modules/firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { collection, onSnapshot, orderBy, query } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { getUserRole } from './utils/roles.js';

const tbody = document.getElementById('leads-tbody');
const countEl = document.getElementById('leads-count');
const btnExport = document.getElementById('btn-export');
const exportFeedback = document.getElementById('export-feedback');

let currentData = [];

function escapeCsv(s) {
  const str = String(s ?? '');
  if (/[",\n]/.test(str)) return '"' + str.replace(/"/g, '""') + '"';
  return str;
}

function toDateStr(v) {
  try {
    if (v && typeof v.toDate === 'function') return v.toDate().toLocaleString('pt-BR');
  } catch (_) {}
  return '-';
}

function renderRows(items) {
  tbody.innerHTML = items.map(d => {
    const name = d.name || '-';
    const phone = d.phone || '-';
    const email = d.email || '-';
    const model = d.model || d.modelId || '-';
    const msg = d.message || d.notes || '';
    const date = d.createdAt || d.date || null;
    const dateStr = date ? toDateStr(date) : '-';
    return `<tr><td>${name}</td><td>${phone}</td><td>${email}</td><td>${model}</td><td>${msg}</td><td>${dateStr}</td></tr>`;
  }).join('');
  countEl.textContent = String(items.length);
}

function exportCsv() {
  if (!currentData.length) {
    exportFeedback.style.color = 'red';
    exportFeedback.textContent = 'Nada para exportar.';
    return;
  }
  const header = ['Nome','Telefone','Email','Modelo','Mensagem','Data'];
  const lines = [header.join(',')];
  currentData.forEach(d => {
    const row = [d.name||'', d.phone||'', d.email||'', (d.model||d.modelId||''), (d.message||d.notes||''), toDateStr(d.createdAt||d.date||null)];
    lines.push(row.map(escapeCsv).join(','));
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  exportFeedback.style.color = 'green';
  exportFeedback.textContent = 'CSV gerado.';
}

btnExport?.addEventListener('click', exportCsv);

onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  // Apenas Viewer: permite ver e exportar; demais também
  const q = query(collection(db, 'testRides'), orderBy('createdAt','desc'));
  onSnapshot(q, (snap) => {
    const items = [];
    snap.forEach(doc => items.push(doc.data() || {}));
    currentData = items;
    renderRows(items);
  });
});

