import { db } from './firebase-init.js';
import { collection, getDocs, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

/*
 * Test-Drive: popula o select com modelos e envia solicitação para Firestore
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('test-ride-form');
  const selectModel = document.getElementById('tr-model');
  const feedback = document.getElementById('tr-feedback');

  // Pré-seleciona modelo via querystring ?model=...
  const params = new URLSearchParams(location.search);
  const preModel = params.get('model');

  // Carrega modelos
  getDocs(collection(db, 'models'))
    .then(snap => {
      const items = [];
      snap.forEach(doc => items.push({ id: doc.id, ...(doc.data()||{}) }));
      items.sort((a,b) => String(a.name||'').localeCompare(String(b.name||'')));
      items.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.name || m.id;
        selectModel.appendChild(opt);
      });
      if (preModel) {
        selectModel.value = preModel;
      }
    })
    .catch(err => {
      console.error('Erro ao carregar modelos:', err);
    });

  // Carrega contato do admin para simulação de mensagem
  let adminContact = { whatsapp: null, email: null };
  firestore.collection('config').doc('contact').get().then(doc => {
    if (doc.exists) {
      const d = doc.data()||{};
      adminContact.whatsapp = d.whatsapp || null; // formato: 55DDDNÚMERO só dígitos
      adminContact.email = d.email || null;
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    feedback.textContent = '';

    const data = {
      name: document.getElementById('tr-name').value.trim(),
      email: document.getElementById('tr-email').value.trim(),
      phone: document.getElementById('tr-phone').value.trim(),
      modelId: selectModel.value,
      date: document.getElementById('tr-date').value || null,
      time: document.getElementById('tr-time').value || null,
      notes: document.getElementById('tr-notes').value.trim() || null,
      createdAt: serverTimestamp(),
      userAgent: navigator.userAgent
    };

    if (!data.modelId) {
      feedback.textContent = 'Selecione um modelo.';
      feedback.style.color = 'var(--color-primary-orange)';
      return;
    }

    try {
      let ref;
      if (typeof window.addLead === 'function') {
        ref = await window.addLead({
          name: data.name,
          phone: data.phone,
          email: data.email,
          model: data.modelId,
          message: data.notes,
        });
      } else {
        ref = await addDoc(collection(db, 'testRides'), data);
      }
      feedback.textContent = 'Solicitação enviada com sucesso! Entraremos em contato.';
      feedback.style.color = 'green';
      form.reset();
      if (preModel) selectModel.value = preModel;

      // Simulação: oferece envio por WhatsApp/e-mail e download JSON
      const summary = `Novo Test-Ride\nNome: ${data.name}\nEmail: ${data.email}\nTelefone: ${data.phone}\nModelo: ${data.modelId}\nData/Hora: ${data.date||'-'} ${data.time||''}`;
      const actions = document.createElement('div');
      actions.style.marginTop = '1rem';
      const btns = [];
      if (adminContact.whatsapp) {
        const url = `https://wa.me/${encodeURIComponent(adminContact.whatsapp)}?text=${encodeURIComponent(summary)}`;
        btns.push(`<a class="btn btn-secondary" href="${url}" target="_blank" rel="noopener">Avisar no WhatsApp</a>`);
      }
      if (adminContact.email) {
        const url = `mailto:${encodeURIComponent(adminContact.email)}?subject=${encodeURIComponent('Novo Test-Ride')}&body=${encodeURIComponent(summary)}`;
        btns.push(`<a class="btn btn-primary-outline" href="${url}">Avisar por Email</a>`);
      }
      // JSON
      const blob = new Blob([JSON.stringify({ id: ref.id, ...data }, null, 2)], { type: 'application/json' });
      const dlUrl = URL.createObjectURL(blob);
      btns.push(`<a class="btn btn-secondary" href="${dlUrl}" download="test-ride-${Date.now()}.json">Baixar JSON</a>`);
      actions.innerHTML = btns.join(' ');
      feedback.after(actions);
    } catch (err) {
      console.error('Erro ao enviar solicitação:', err);
      feedback.textContent = 'Não foi possível enviar agora. Tente novamente.';
      feedback.style.color = 'red';
    }
  });
});

