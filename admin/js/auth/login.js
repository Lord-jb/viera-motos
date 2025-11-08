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
      window.location.replace('admin.html');
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
      // Mostra código/mensagem para diagnóstico rápido
      const code = (err && err.code) ? String(err.code) : 'auth/error';
      console.error('Login error:', code, err && err.message);
      if (code === 'auth/unauthorized-domain') {
        errorEl.textContent = 'Domínio não autorizado no Firebase Auth (Authorized domains).';
      } else if (code === 'auth/operation-not-allowed') {
        errorEl.textContent = 'Provedor Email/Senha não habilitado nas configurações de Auth.';
      } else if (code === 'auth/invalid-api-key') {
        errorEl.textContent = 'API Key inválida. Verifique a configuração do Firebase no admin.';
      } else if (code === 'auth/network-request-failed') {
        errorEl.textContent = 'Falha de rede. Verifique sua conexão ou regras de CORS.';
      } else {
        errorEl.textContent = 'Falha ao entrar: ' + code;
      }
    }
  });
});
