// Logout do Admin (ES Modules)
// - Conecta em um elemento #logout-button, se existir
// - Faz signOut e redireciona para login

import { auth } from '../../js/modules/firebase.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';

export async function doLogout() {
  try {
    await signOut(auth);
  } finally {
    window.location.replace('login.html');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('logout-button');
  if (btn) btn.addEventListener('click', (e) => { e.preventDefault(); doLogout(); });
});

