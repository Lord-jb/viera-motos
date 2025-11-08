// Catálogo – CRUD completo (ES Modules) com Firestore
// Requisitos: múltiplas imagens (URLs), paginação, busca, filtros, onSnapshot
// Reflitam no site público: grava na coleção 'models' com campos compatíveis (name, price, colors)

import { auth, db } from './modules/firebase.js';
import {
  collection, doc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter, startAt, endAt,
  onSnapshot, getDocs, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { getUserRole } from './utils/roles.js';

const PAGE_SIZE = 10;

// Utils
const toNumber = (s) => {
  const n = parseFloat(String(s||'').replace(/\./g,'').replace(',', '.'));
  return isNaN(n) ? null : n;
};
const normalizeSlug = (s) => String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'');

let role = 'Viewer';
let currentId = null; // doc id (slug) em edição
let currentUnsub = null;
let currentPage = 1;
let cursorStack = []; // stack de páginas: cada item guarda o último doc
let currentQuery = null;

// DOM
const nameEl = document.getElementById('c-name');
const slugEl = document.getElementById('c-slug');
const priceEl = document.getElementById('c-price');
const statusEl = document.getElementById('c-status');
const feedbackEl = document.getElementById('c-feedback');
const imagesContainer = document.getElementById('c-images-container');
const addImageBtn = document.getElementById('btn-add-image');

const qTextEl = document.getElementById('q');
const qStatusEl = document.getElementById('q-status');
const qApplyBtn = document.getElementById('q-apply');
const listEl = document.getElementById('catalog-list');
const pagePrevBtn = document.getElementById('page-prev');
const pageNextBtn = document.getElementById('page-next');
const pageInfoEl = document.getElementById('page-info');

const saveBtn = document.getElementById('btn-save');
const newBtn = document.getElementById('btn-new');
const deleteBtn = document.getElementById('btn-delete');
const formEl = document.getElementById('catalog-form');

function setFormEnabled(enabled) {
  [nameEl, slugEl, priceEl, statusEl, saveBtn, addImageBtn].forEach(el => { if (el) el.disabled = !enabled; });
  imagesContainer.querySelectorAll('input,button').forEach(el => el.disabled = !enabled);
  if (!enabled) deleteBtn.disabled = true;
}

function clearForm() {
  currentId = null;
  nameEl.value = '';
  slugEl.value = '';
  priceEl.value = '';
  statusEl.value = 'active';
  imagesContainer.innerHTML = '';
  feedbackEl.textContent = '';
}

function addImageInput(url='') {
  const row = document.createElement('div');
  row.className = 'dynamic-input-group';
  row.innerHTML = `
    <input type="url" class="img-url" placeholder="https://..." value="${url.replace(/"/g,'&quot;')}">
    <button type="button" class="btn-remove" title="Remover">&times;</button>`;
  row.querySelector('.btn-remove').addEventListener('click', () => row.remove());
  imagesContainer.appendChild(row);
}

// List rendering
function renderList(docs) {
  if (!docs || docs.length === 0) {
    listEl.innerHTML = '<p>Nenhum modelo encontrado.</p>';
    return;
  }
  listEl.innerHTML = docs.map(d => {
    const m = d.data() || {};
    const img = (Array.isArray(m.images) && m.images[0]) || (Array.isArray(m.colors) && m.colors[0]?.imageUrl) || 'assets/images/placeholder-moto.svg';
    return `
      <div class="model-list-item">
        <div style="display:flex;gap:1rem;align-items:center;">
          <img src="${img}" alt="${(m.name||d.id).replace(/"/g,'&quot;')}" style="width:64px;height:64px;object-fit:contain;background:#000;border-radius:4px;">
          <div>
            <div style="font-weight:700;">${(m.name||d.id)}</div>
            <div style="font-size:1.2rem;color:#666;">${d.id} • ${m.status||'-'} • R$ ${(m.price||'-')}</div>
          </div>
        </div>
        <div>
          ${(['Owner','Admin','Editor'].includes(role)) ? `<button class="btn-secondary btn-edit" data-id="${d.id}">Editar</button>` : ''}
          ${(['Owner','Admin'].includes(role)) ? `<button class="btn-secondary btn-delete" data-id="${d.id}">Excluir</button>` : ''}
        </div>
      </div>`;
  }).join('');

  // Wire actions
  listEl.querySelectorAll('.btn-edit').forEach(b => b.addEventListener('click', () => loadForEdit(b.dataset.id)));
  listEl.querySelectorAll('.btn-delete').forEach(b => b.addEventListener('click', () => doDelete(b.dataset.id)));
}

// Query builder with search/status/pagination
function buildQuery({ search, status, cursor } = {}) {
  const col = collection(db, 'models');
  const constraints = [];
  // Status
  if (status) constraints.push(where('status','==', status));
  if (search && search.trim()) {
    const s = search.trim();
    // Prefix search por 'name'
    constraints.push(orderBy('name'));
    constraints.push(startAt(s));
    constraints.push(endAt(s + '\uf8ff'));
  } else {
    constraints.push(orderBy('updatedAt','desc'));
  }
  constraints.push(limit(PAGE_SIZE));
  if (cursor) constraints.push(startAfter(cursor));
  return query(col, ...constraints);
}

async function attachSnapshot(pageDir) {
  // Calcula cursor
  const search = qTextEl.value || '';
  const status = qStatusEl.value || '';

  let cursor = null;
  if (pageDir === 'next' && cursorStack.length > 0) {
    cursor = cursorStack[cursorStack.length - 1];
  } else if (pageDir === 'prev') {
    // volta uma página
    if (cursorStack.length >= 2) {
      cursorStack.pop();
      cursor = cursorStack[cursorStack.length - 1];
    } else {
      // início
      cursorStack = [];
      currentPage = 1;
      cursor = null;
    }
  }

  const q = buildQuery({ search, status, cursor });
  if (currentUnsub) currentUnsub();
  currentQuery = q;
  currentUnsub = onSnapshot(q, (snap) => {
    const docs = snap.docs;
    renderList(docs);
    // Atualiza cursor para NEXT
    if (docs.length > 0) {
      const last = docs[docs.length - 1];
      if (pageDir !== 'prev') cursorStack[cursorStack.length - 1] = last; // atualiza topo
    }
    // Info de página
    pageInfoEl.textContent = `Página ${currentPage}`;
    pagePrevBtn.disabled = currentPage === 1;
    pageNextBtn.disabled = docs.length < PAGE_SIZE;
  });
}

// Load for edit
async function loadForEdit(id) {
  const col = collection(db, 'models');
  const docs = await getDocs(query(col, where('__name__','==', id)));
  if (docs.empty) return;
  const d = docs.docs[0];
  const m = d.data() || {};
  currentId = d.id;
  nameEl.value = m.name || '';
  slugEl.value = d.id;
  priceEl.value = m.price || '';
  statusEl.value = m.status || 'active';
  imagesContainer.innerHTML = '';
  const images = Array.isArray(m.images) ? m.images : (Array.isArray(m.colors) ? m.colors.map(c => c.imageUrl) : []);
  if (images.length === 0) addImageInput('');
  images.forEach(u => addImageInput(u));
  feedbackEl.textContent = '';
  deleteBtn.disabled = !(['Owner','Admin'].includes(role));
}

async function doDelete(id) {
  if (!(['Owner','Admin'].includes(role))) return;
  if (!confirm('Excluir este modelo?')) return;
  await deleteDoc(doc(db, 'models', id));
  if (currentId === id) clearForm();
}

function collectImages() {
  const arr = [];
  imagesContainer.querySelectorAll('.img-url').forEach(input => {
    const v = input.value.trim(); if (v) arr.push(v);
  });
  return arr;
}

async function saveModel() {
  const canEdit = ['Owner','Admin','Editor'].includes(role);
  if (!canEdit) return;
  const name = nameEl.value.trim();
  const slug = normalizeSlug(slugEl.value.trim());
  if (!name || !slug) { feedbackEl.textContent = 'Nome e slug são obrigatórios.'; return; }
  const price = priceEl.value.trim();
  const priceNumber = toNumber(price);
  const status = statusEl.value || 'active';
  const images = collectImages();
  const colors = images.map((u, i) => ({ name: `Imagem ${i+1}`, imageUrl: u }));
  const payload = {
    name,
    price,
    priceNumber: priceNumber ?? null,
    status,
    images,
    colors, // compat com site público
    updatedAt: serverTimestamp(),
  };
  const isNew = !currentId;
  await setDoc(doc(db, 'models', slug), payload, { merge: true });
  if (!isNew && currentId && currentId !== slug) {
    // Renomeio: remove doc antigo
    await deleteDoc(doc(db, 'models', currentId));
  }
  currentId = slug;
  feedbackEl.style.color = 'green';
  feedbackEl.textContent = 'Salvo com sucesso!';
}

// Wire UI
addImageBtn?.addEventListener('click', () => addImageInput(''));
newBtn?.addEventListener('click', () => clearForm());
deleteBtn?.addEventListener('click', () => { if (currentId) doDelete(currentId); });
formEl?.addEventListener('submit', (e) => { e.preventDefault(); saveModel(); });

// Filtros e paginação
qApplyBtn?.addEventListener('click', () => { cursorStack = []; currentPage = 1; attachSnapshot(); });
pageNextBtn?.addEventListener('click', () => { currentPage += 1; attachSnapshot('next'); });
pagePrevBtn?.addEventListener('click', () => { if (currentPage>1) currentPage -= 1; attachSnapshot('prev'); });

// Auto-sugestão de slug a partir do nome
nameEl?.addEventListener('input', () => { if (!slugEl.value) slugEl.value = normalizeSlug(nameEl.value); });

// Init ao logar
onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  role = await getUserRole(user);
  // habilita/disable conforme papel
  const canEdit = ['Owner','Admin','Editor'].includes(role);
  setFormEnabled(canEdit);
  // Primeira assinatura
  cursorStack = [];
  currentPage = 1;
  attachSnapshot();
});

