// Módulo de Autenticação e Papéis
// - Login/logout
// - Observador de auth
// - Resolução de papel (role) do usuário

import { auth, db } from './firebase.js';
import { getUserRole as getRoleFromCollection, Roles } from '../utils/roles.js';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

// Faz login com email/senha
export async function login(email, password) {
  // Comentário: usa o provedor de email/senha do Firebase
  return signInWithEmailAndPassword(auth, email, password);
}

// Faz logout do usuário atual
export async function logout() {
  return signOut(auth);
}

// Observa mudanças de autenticação
export function onUserChanged(callback) {
  // Comentário: callback é chamado com (user, role)
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(null, null);
      return;
    }
    const role = await resolveUserRole(user);
    callback(user, role);
  });
}

// Resolve o papel do usuário
export async function resolveUserRole(user) {
  // 1) Coleção oficial de papéis: roles/{uid}
  const fromRoles = await getRoleFromCollection(user);
  if (fromRoles) return fromRoles;

  // 2) Fallbacks (compatibilidade): users/{uid}.role e config/admins.emails
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data() || {};
      const legacy = String(data.role || '').toLowerCase();
      if (legacy === 'admin') return Roles.Admin;
      if (legacy === 'editor') return Roles.Editor;
      if (legacy === 'viewer') return Roles.Viewer;
    }
  } catch (_) {}
  try {
    const cfgDoc = await getDoc(doc(db, 'config', 'admins'));
    if (cfgDoc.exists()) {
      const emails = Array.isArray((cfgDoc.data() || {}).emails) ? cfgDoc.data().emails : [];
      if (emails.includes(user.email)) return Roles.Admin;
    }
  } catch (_) {}
  // 3) Padrão
  return Roles.Viewer;
}

// Exige que o usuário tenha um papel permitido
export function hasRole(role, allowed) {
  // Comentário: allowed é array de papéis aceitos
  return Array.isArray(allowed) ? allowed.includes(role) : role === allowed;
}
