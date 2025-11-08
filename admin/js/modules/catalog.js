// Gerenciamento de Catálogo (models)
// - CRUD de modelos: id, name, price, tagline
// - Cores (nome + imagem) e Especificações (name/value)
// - Upload de imagens no Storage

import { db, storage } from './firebase.js';
import {
  collection, doc, getDocs, getDoc, setDoc, updateDoc, addDoc, deleteDoc, orderBy, query
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js';

// Utilidades simples
const slugify = (s) => String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$|_/g,'');
const escapeAttr = (s) => String(s||'').replace(/"/g,'&quot;');

export function mountCatalogFeature(role) {
  const container = document.getElementById('models-view');
  if (!container) return;

  // Render UI (mantendo estilos existentes)
  container.insertAdjacentHTML('beforeend', `
    <div class="admin-content">
      <!-- Formulário (esquerda) -->
      <div class="content-card" id="model-manager">
        <h3>Cadastro de Modelo</h3>
        <form id="model-form">
          <div class="form-group"><label for="model-id">ID</label><input id="model-id" placeholder="ex.: az160-xtreme" required /></div>
          <div class="form-group"><label for="model-name">Nome</label><input id="model-name" placeholder="ex.: AZ160 XTREME" required /></div>
          <div class="form-group"><label for="model-price">Preço (ex.: 12.990,00)</label><input id="model-price" /></div>
          <div class="form-group"><label for="model-tagline">Tagline</label><input id="model-tagline" placeholder="ex.: Aventura sem limites" /></div>
          <hr>
          <h4>Cores</h4>
          <div id="color-manager-inputs"></div>
          <button type="button" class="btn-secondary" id="add-color-button">Adicionar Cor</button>
          <hr>
          <h4>Especificações</h4>
          <div id="specs-manager-inputs"></div>
          <button type="button" class="btn-secondary" id="add-spec-button">Adicionar Especificação</button>
          <hr>
          <button type="submit" class="btn-submit">Salvar Modelo</button>
          <p id="model-feedback" class="error-message" style="display:none"></p>
        </form>
      </div>
      <!-- Lista (direita) -->
      <div class="content-card" id="model-list">
        <h3>Modelos Cadastrados</h3>
        <div id="current-models-list"></div>
      </div>
    </div>
  `);

  const form = container.querySelector('#model-form');
  const modelId = container.querySelector('#model-id');
  const modelName = container.querySelector('#model-name');
  const modelPrice = container.querySelector('#model-price');
  const modelTagline = container.querySelector('#model-tagline');
  const colorInputs = container.querySelector('#color-manager-inputs');
  const specInputs = container.querySelector('#specs-manager-inputs');
  const feedback = container.querySelector('#model-feedback');
  const list = container.querySelector('#current-models-list');

  // Sugere id baseado no nome
  modelName.addEventListener('input', () => {
    if (!modelId.value) modelId.value = slugify(modelName.value);
  });

  // Adição dinâmica de Cor
  container.querySelector('#add-color-button').addEventListener('click', () => {
    const div = document.createElement('div');
    div.className = 'dynamic-input-group';
    div.innerHTML = `
      <input type="text" class="color-name" placeholder="Nome da Cor (ex.: Azul)">
      <input type="file" class="color-image" accept="image/*">
      <button type="button" class="btn-remove" title="Remover">&times;</button>
    `;
    div.querySelector('.btn-remove').addEventListener('click', () => div.remove());
    colorInputs.appendChild(div);
  });

  // Adição dinâmica de Spec
  container.querySelector('#add-spec-button').addEventListener('click', () => {
    const div = document.createElement('div');
    div.className = 'dynamic-input-group';
    div.innerHTML = `
      <input type="text" class="spec-name" placeholder="Nome (ex.: Motor)">
      <input type="text" class="spec-value" placeholder="Valor (ex.: 160cc)">
      <button type="button" class="btn-remove" title="Remover">&times;</button>
    `;
    div.querySelector('.btn-remove').addEventListener('click', () => div.remove());
    specInputs.appendChild(div);
  });

  // Carregar lista de modelos
  async function refreshList() {
    list.innerHTML = '<p>Carregando...</p>';
    const snap = await getDocs(query(collection(db, 'models'), orderBy('name'))).catch(() => null);
    if (!snap || snap.empty) { list.innerHTML = '<p>Nenhum modelo cadastrado.</p>'; return; }
    const items = [];
    snap.forEach(d => items.push({ id: d.id, ...(d.data()||{}) }));
    const canEdit = ['Owner','Admin','Editor'].includes(role);
    const canDelete = ['Owner','Admin'].includes(role);
    list.innerHTML = items.map(m => `
      <div class="model-list-item">
        <span>${escapeAttr(m.name || m.id)}</span>
        <div>
          ${canEdit ? `<button class="btn-edit" data-id="${escapeAttr(m.id)}">Editar</button>` : ''}
          ${canDelete ? `<button class="btn-delete" data-id="${escapeAttr(m.id)}">Excluir</button>` : ''}
        </div>
      </div>
    `).join('');

    // Ações
    if (canEdit) list.querySelectorAll('.btn-edit').forEach(btn => btn.addEventListener('click', () => loadForEdit(btn.dataset.id)));
    if (canDelete) list.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', () => removeModel(btn.dataset.id)));
  }

  // Carrega dados para edição
  async function loadForEdit(id) {
    const d = await getDoc(doc(db, 'models', id));
    if (!d.exists()) return;
    const m = d.data() || {};
    modelId.value = id;
    modelName.value = m.name || '';
    modelPrice.value = m.price || '';
    modelTagline.value = m.tagline || '';
    colorInputs.innerHTML = '';
    (m.colors || []).forEach(c => {
      const div = document.createElement('div');
      div.className = 'dynamic-input-group';
      div.innerHTML = `
        <input type="text" class="color-name" value="${escapeAttr(c.name||'')}">
        <input type="file" class="color-image" accept="image/*">
        <input type="hidden" class="color-existing-url" value="${escapeAttr(c.imageUrl||'')}">
        <input type="hidden" class="color-existing-path" value="${escapeAttr(c.storagePath||'')}">
        <button type="button" class="btn-remove">&times;</button>
      `;
      div.querySelector('.btn-remove').addEventListener('click', () => div.remove());
      colorInputs.appendChild(div);
    });
    specInputs.innerHTML = '';
    (m.specs || []).forEach(s => {
      const div = document.createElement('div');
      div.className = 'dynamic-input-group';
      div.innerHTML = `
        <input type="text" class="spec-name" value="${escapeAttr(s.name||'')}">
        <input type="text" class="spec-value" value="${escapeAttr(s.value||'')}">
        <button type="button" class="btn-remove">&times;</button>
      `;
      div.querySelector('.btn-remove').addEventListener('click', () => div.remove());
      specInputs.appendChild(div);
    });
  }

  // Remove modelo (admin)
  async function removeModel(id) {
    if (!confirm('Deseja realmente excluir este modelo?')) return;
    await deleteDoc(doc(db, 'models', id)).catch(() => {});
    await refreshList();
  }

  // Salva
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    feedback.style.display = 'none';
    const canEdit = ['Owner','Admin','Editor'].includes(role);
    if (!canEdit) return;
    try {
      const id = modelId.value.trim();
      if (!id) throw new Error('ID obrigatório');
      const payload = {
        name: modelName.value.trim(),
        price: modelPrice.value.trim(),
        tagline: modelTagline.value.trim(),
        updatedAt: new Date().toISOString()
      };

      // Coleta specs
      const specs = [];
      specInputs.querySelectorAll('.dynamic-input-group').forEach(g => {
        const name = g.querySelector('.spec-name')?.value?.trim();
        const value = g.querySelector('.spec-value')?.value?.trim();
        if (name && value) specs.push({ name, value });
      });
      if (specs.length) payload.specs = specs;

      // Coleta cores + upload
      const colors = [];
      for (const g of Array.from(colorInputs.querySelectorAll('.dynamic-input-group'))) {
        const name = g.querySelector('.color-name')?.value?.trim();
        const file = g.querySelector('.color-image')?.files?.[0] || null;
        const existingUrl = g.querySelector('.color-existing-url')?.value || null;
        const existingPath = g.querySelector('.color-existing-path')?.value || null;
        if (!name) continue;
        let imageUrl = existingUrl;
        let storagePath = existingPath;
        if (file) {
          storagePath = `models/${id}/${slugify(name)}-${Date.now()}-${file.name}`;
          const storageRef = ref(storage, storagePath);
          await uploadBytes(storageRef, file);
          imageUrl = await getDownloadURL(storageRef);
        }
        colors.push({ name, imageUrl, storagePath });
      }
      if (colors.length) payload.colors = colors;

      await setDoc(doc(db, 'models', id), payload, { merge: true });
      feedback.textContent = 'Modelo salvo!';
      feedback.style.color = 'green';
      feedback.style.display = 'block';
      await refreshList();
    } catch (err) {
      feedback.textContent = 'Erro ao salvar modelo.';
      feedback.style.color = 'red';
      feedback.style.display = 'block';
    }
  });

  // Primeira carga
  refreshList();
}
