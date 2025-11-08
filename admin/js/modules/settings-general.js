// Configurações Gerais – módulo montável no admin.html
// - Usa Firebase v9 modular
// - Lê/grava em settings/general

import { db } from './firebase.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { auth } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { getUserRole, Roles } from '../utils/roles.js';

export function mountSettingsGeneral() {
  const root = document.getElementById('settings-view');
  if (!root) return;

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

  const ref = doc(db, 'settings', 'general');

  function hex(v, fallback) {
    const s = String(v||'').trim();
    return /^#?[0-9a-fA-F]{6}$/.test(s) ? (s.startsWith('#')?s:'#'+s) : fallback;
  }

  async function load() {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const d = snap.data() || {};
      sTitle.value = d.title || '';
      sDesc.value = d.description || '';
      sInsta.value = d.social?.instagram || '';
      sFace.value = d.social?.facebook || '';
      sYT.value = d.social?.youtube || '';
      sTT.value = d.social?.tiktok || '';
      sEmail.value = d.contacts?.email || '';
      sPhone.value = d.contacts?.phone || '';
      sAddress.value = d.contacts?.address || '';
      sWhats.value = d.contacts?.whatsapp || '';
      cPrimary.value = hex(d.brand?.primary, cPrimary.value);
      cSecondary.value = hex(d.brand?.secondary, cSecondary.value);
      cDark.value = hex(d.brand?.dark, cDark.value);
      cLight.value = hex(d.brand?.light, cLight.value);
    }
    feedback.textContent = '';
  }

  async function save() {
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
    await setDoc(ref, payload, { merge: true });
    feedback.style.color = 'green';
    feedback.textContent = 'Configurações salvas!';
  }

  btnReset?.addEventListener('click', () => { load(); });
  document.getElementById('settings-form')?.addEventListener('submit', (e) => { e.preventDefault(); save(); });

  onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    const role = await getUserRole(user);
    const canEdit = (role === Roles.Owner || role === Roles.Admin || role === Roles.Editor);
    if (!canEdit) {
      root.querySelectorAll('input, textarea, select, button').forEach(el => { if (el.id !== 'btn-reset') el.disabled = true; });
    }
    load();
  });
}

