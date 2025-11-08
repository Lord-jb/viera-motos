// Login do Admin (ES Modules)
// - Autentica com Firebase Auth (email/senha)
// - Redireciona para dashboard ao logar
// - Se já estiver logado, redireciona automaticamente

import { auth } from '../../js/modules/firebase.js';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const emailEl = document.getElementById('login-email');
  const passEl = document.getElementById('login-password');
  const errorEl = document.getElementById('login-error');

  // Se estiver logado, vai direto para o dashboard
  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.replace('dashboard.html');
    }
  });

  // Submissão do formulário de login
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    try {
      const email = emailEl.value.trim();
      const password = passEl.value;
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged cuidará do redirecionamento
    } catch (err) {
      // Mensagem amigável
      errorEl.textContent = 'Email ou senha inválidos.';
    }
  });
});

