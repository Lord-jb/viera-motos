// Banners – CRUD (ES Modules) em Firestore
// Campos: title, imageUrl, ctaText, ctaUrl, order, published
// Atualização em tempo real e preview de imagem

import { auth, db } from './modules/firebase.js';
import {
  collection, doc, setDoc, updateDoc, deleteDoc,
  query, orderBy, onSnapshot, getDoc, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { getUserRole } from './utils/roles.js';
import { logAudit } from './audit.js';

let role = 'Viewer';
let currentId = null; // doc id em edição
let unsub = null;

// DOM
const titleEl = document.getElementById('b-title');
const imageEl = document.getElementById('b-image');
const ctaTextEl = document.getElementById('b-cta-text');
const ctaUrlEl = document.getElementById('b-cta-url');
const orderEl = document.getElementById('b-order');
const publishedEl = document.getElementById('b-published');
const previewEl = document.getElementById('b-preview');
const feedbackEl = document.getElementById('b-feedback');

const saveBtn = document.getElementById('btn-save');
const newBtn = document.getElementById('btn-new');
const deleteBtn = document.getElementById('btn-delete');
const listEl = document.getElementById('banners-list');
const formEl = document.getElementById('banner-form');

function clearForm() {
  currentId = null;
  titleEl.value = '';
  imageEl.value = '';
  ctaTextEl.value = '';
  ctaUrlEl.value = '';
  orderEl.value = '0';
  publishedEl.value = 'true';
  previewEl.src = '';
  previewEl.style.display = 'none';
  feedbackEl.textContent = '';
}

function setFormEnabled(enabled) {
  [titleEl, imageEl, ctaTextEl, ctaUrlEl, orderEl, publishedEl, saveBtn].forEach(el => el && (el.disabled = !enabled));
  if (!enabled) deleteBtn.disabled = true;
}

function slugify(s) {
  return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'');
}

function renderList(docs) {
  if (!docs || docs.length === 0) {
    listEl.innerHTML = '<p>Nenhum banner cadastrado.</p>';
    return;
  }
  listEl.innerHTML = docs.map(d => {
    const b = d.data() || {};
    return `
      <div class="model-list-item">
        <div style="display:flex;gap:1rem;align-items:center;">
          <img src="${b.imageUrl||'assets/images/placeholder-moto.svg'}" alt="${(b.title||d.id).replace(/"/g,'&quot;')}" style="width:96px;height:54px;object-fit:cover;border-radius:4px;background:#000;">
          <div>
            <div style="font-weight:700;">${b.title||d.id}</div>
            <div style="font-size:1.2rem;color:#666;">ordem ${b.order??0} • ${b.published? 'publicado':'rascunho'}</div>
          </div>
        </div>
        <div>
          ${(['Owner','Admin','Editor'].includes(role)) ? `<button class="btn-secondary btn-edit" data-id="${d.id}">Editar</button>` : ''}
          ${(['Owner','Admin'].includes(role)) ? `<button class="btn-secondary btn-delete" data-id="${d.id}">Excluir</button>` : ''}
        </div>
      </div>`;
  }).join('');
  listEl.querySelectorAll('.btn-edit').forEach(b => b.addEventListener('click', () => loadForEdit(b.dataset.id)));
  listEl.querySelectorAll('.btn-delete').forEach(b => b.addEventListener('click', () => doDelete(b.dataset.id)));
}

async function loadForEdit(id) {
  const snap = await getDoc(doc(db, 'banners', id));
  if (!snap.exists()) return;
  const b = snap.data() || {};
  currentId = id;
  titleEl.value = b.title || '';
  imageEl.value = b.imageUrl || '';
  ctaTextEl.value = b.ctaText || '';
  ctaUrlEl.value = b.ctaUrl || '';
  orderEl.value = String(b.order ?? 0);
  publishedEl.value = String(!!b.published);
  if (b.imageUrl) { previewEl.src = b.imageUrl; previewEl.style.display = 'block'; }
  deleteBtn.disabled = !(['Owner','Admin'].includes(role));
}

async function saveBanner() {
  const canEdit = ['Owner','Admin','Editor'].includes(role);
  if (!canEdit) return;
  const title = titleEl.value.trim();
  if (!title) { feedbackEl.textContent = 'Título é obrigatório.'; return; }
  const id = currentId || slugify(title);
  const payload = {
    title,
    imageUrl: imageEl.value.trim() || null,
    ctaText: ctaTextEl.value.trim() || null,
    ctaUrl: ctaUrlEl.value.trim() || null,
    order: Number(orderEl.value||0),
    published: publishedEl.value === 'true',
    updatedAt: serverTimestamp(),
  };
  await setDoc(doc(db, 'banners', id), payload, { merge: true });
  logAudit({ action: 'banner.save', target: id });
  currentId = id;
  feedbackEl.style.color = 'green';
  feedbackEl.textContent = 'Salvo com sucesso!';
}

async function doDelete(id) {
  if (!(['Owner','Admin'].includes(role))) return;
  if (!confirm('Excluir este banner?')) return;
  await deleteDoc(doc(db, 'banners', id));
  logAudit({ action: 'banner.delete', target: id });
  if (currentId === id) clearForm();
}

// Preview de imagem
imageEl?.addEventListener('input', () => {
  const url = imageEl.value.trim();
  if (url) { previewEl.src = url; previewEl.style.display = 'block'; }
  else { previewEl.src = ''; previewEl.style.display = 'none'; }
});

// Ações
newBtn?.addEventListener('click', () => clearForm());
deleteBtn?.addEventListener('click', () => { if (currentId) doDelete(currentId); });
formEl?.addEventListener('submit', (e) => { e.preventDefault(); saveBanner(); });

// Init
onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  role = await getUserRole(user);
  setFormEnabled(['Owner','Admin','Editor'].includes(role));
  if (unsub) unsub();
  unsub = onSnapshot(query(collection(db, 'banners'), orderBy('order'), orderBy('updatedAt', 'desc')), (snap) => {
    renderList(snap.docs);
  });
});
