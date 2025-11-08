// Configurações Gerais – Admin (ES Modules)
// CRUD de doc único em `settings/general`

import { auth, db } from './modules/firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { getUserRole } from './utils/roles.js';

// Se a view não existir nesta página, aborta silenciosamente
const settingsRoot = document.getElementById('settings-view');
if (!settingsRoot) {
  // Nada a fazer nesta página
}

if (settingsRoot) {
import { logAudit } from './audit.js';

const docRef = doc(db, 'settings', 'general');

// Campos
const el = (id) => document.getElementById(id);
const sTitle = el('s-title');
const sDesc = el('s-description');
const sInsta = el('s-instagram');
const sFace = el('s-facebook');
const sYT = el('s-youtube');
const sTT = el('s-tiktok');
const sEmail = el('s-email');
const sPhone = el('s-phone');
const sAddress = el('s-address');
const sWhats = el('s-whatsapp');
const cPrimary = el('c-primary');
const cSecondary = el('c-secondary');
const cDark = el('c-dark');
const cLight = el('c-light');

const btnSave = el('btn-save');
const btnReset = el('btn-reset');
const feedback = el('settings-feedback');

function hex(v, fallback) {
  const s = String(v||'').trim();
  return /^#?[0-9a-fA-F]{6}$/.test(s) ? (s.startsWith('#')?s:'#'+s) : fallback;
}

async function loadSettings() {
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const d = snap.data()||{};
      sTitle.value = d.title || '';
      sDesc.value = d.description || '';
      sInsta.value = (d.social&&d.social.instagram)||'';
      sFace.value = (d.social&&d.social.facebook)||'';
      sYT.value = (d.social&&d.social.youtube)||'';
      sTT.value = (d.social&&d.social.tiktok)||'';
      sEmail.value = (d.contacts&&d.contacts.email)||'';
      sPhone.value = (d.contacts&&d.contacts.phone)||'';
      sAddress.value = (d.contacts&&d.contacts.address)||'';
      sWhats.value = (d.contacts&&d.contacts.whatsapp)||'';
      cPrimary.value = hex(d.brand?.primary, cPrimary.value);
      cSecondary.value = hex(d.brand?.secondary, cSecondary.value);
      cDark.value = hex(d.brand?.dark, cDark.value);
      cLight.value = hex(d.brand?.light, cLight.value);
    }
    feedback.textContent = '';
  } catch (_) {
    feedback.style.color = 'red';
    feedback.textContent = 'Falha ao carregar configurações.';
  }
}

async function saveSettings() {
  const payload = {
    title: sTitle.value.trim(),
    description: sDesc.value.trim(),
    social: {
      instagram: sInsta.value.trim() || null,
      facebook: sFace.value.trim() || null,
      youtube: sYT.value.trim() || null,
      tiktok: sTT.value.trim() || null,
    },
    contacts: {
      email: sEmail.value.trim() || null,
      phone: sPhone.value.trim() || null,
      address: sAddress.value.trim() || null,
      whatsapp: sWhats.value.trim() || null,
    },
    brand: {
      primary: hex(cPrimary.value, '#0D1B2A'),
      secondary: hex(cSecondary.value, '#FF6F00'),
      dark: hex(cDark.value, '#0D1B2A'),
      light: hex(cLight.value, '#F4F4F4'),
    },
    updatedAt: new Date().toISOString(),
  };
  await setDoc(docRef, payload, { merge: true });
  feedback.style.color = 'green';
  feedback.textContent = 'Configurações salvas!';
  try { await logAudit({ action: 'settings.save', target: 'settings/general' }); } catch(e) {}
}

// Eventos
btnReset?.addEventListener('click', () => loadSettings());
document.getElementById('settings-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  saveSettings();
});

// Init com guard de papel
onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  const role = await getUserRole(user);
  const canEdit = ['Owner','Admin','Editor'].includes(role);
  // Bloqueia inputs se viewer
  if (!canEdit) {
    document.querySelectorAll('#settings-form input, #settings-form textarea, #settings-form select, #settings-form button')
      .forEach(el => { if (el.id !== 'btn-reset') el.disabled = true; });
  }
  await loadSettings();
});

}
