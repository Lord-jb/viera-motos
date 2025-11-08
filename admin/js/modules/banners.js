// Gerenciador de Banner/Alerta (config/offer)
// - CRUD simples: texto + ativo
// - Usa classes existentes, injeta um pequeno formulário

import { db } from './firebase.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

export function mountBannersFeature(role) {
  const container = document.getElementById('alert-view');
  if (!container) return;

  // Render do formulário
  container.insertAdjacentHTML('beforeend', `
    <!-- Formulário de Alerta/Oferta -->
    <div class="content-card" id="offer-manager">
      <h3>Alerta da Home</h3>
      <form id="offer-form">
        <div class="form-group">
          <label for="offer-text">Mensagem</label>
          <input type="text" id="offer-text" placeholder="Ex.: Semana do Cliente: bônus R$ 1.000" />
        </div>
        <div class="form-group checkbox-group">
          <input type="checkbox" id="offer-active" />
          <label for="offer-active">Ativo</label>
        </div>
        <button class="btn-submit" type="submit">Salvar</button>
        <p id="offer-feedback" class="error-message" style="display:none"></p>
      </form>
    </div>
  `);

  const form = container.querySelector('#offer-form');
  const msg = container.querySelector('#offer-text');
  const active = container.querySelector('#offer-active');
  const feedback = container.querySelector('#offer-feedback');

  // Bloqueio de UI conforme papel (somente Owner/Admin/Editor podem editar)
  const canEdit = ['Owner','Admin','Editor'].includes(role);
  if (!canEdit) {
    [msg, active].forEach(el => el && (el.disabled = true));
    if (form) {
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.title = 'Permissão insuficiente para editar';
      }
    }
  }

  // Carrega valor inicial
  getDoc(doc(db, 'config', 'offer')).then((snap) => {
    if (snap.exists()) {
      const d = snap.data() || {};
      msg.value = d.text || '';
      active.checked = !!d.active;
    }
  }).catch(() => {});

  // Salva
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!canEdit) return;
    feedback.style.display = 'none';
    try {
      await setDoc(doc(db, 'config', 'offer'), {
        text: msg.value.trim(),
        active: active.checked,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      feedback.textContent = 'Salvo!';
      feedback.style.color = 'green';
      feedback.style.display = 'block';
    } catch (err) {
      feedback.textContent = 'Falha ao salvar.';
      feedback.style.color = 'red';
      feedback.style.display = 'block';
    }
  });
}
