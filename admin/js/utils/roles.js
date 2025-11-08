// Utilidades de Papéis (Roles) do Admin
// - Consulta papel do usuário na coleção Firestore `roles/{uid}`
// - Define mapa de permissões por papel

import { db } from '../modules/firebase.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

export const Roles = Object.freeze({
  Owner: 'Owner',
  Admin: 'Admin',
  Editor: 'Editor',
  Viewer: 'Viewer',
});

export const Permissions = Object.freeze({
  CATALOG_EDIT: 'catalog.edit',
  CATALOG_DELETE: 'catalog.delete',
  BANNERS_EDIT: 'banners.edit',
  ROLES_MANAGE: 'roles.manage',
  ROLES_MANAGE_OWNER: 'roles.manageOwner',
});

// Tabela de permissões por papel
const ROLE_PERMISSIONS = {
  [Roles.Owner]: new Set([
    Permissions.CATALOG_EDIT,
    Permissions.CATALOG_DELETE,
    Permissions.BANNERS_EDIT,
    Permissions.ROLES_MANAGE,
    Permissions.ROLES_MANAGE_OWNER,
  ]),
  [Roles.Admin]: new Set([
    Permissions.CATALOG_EDIT,
    Permissions.CATALOG_DELETE,
    Permissions.BANNERS_EDIT,
    Permissions.ROLES_MANAGE,
    // sem ROLES_MANAGE_OWNER
  ]),
  [Roles.Editor]: new Set([
    Permissions.CATALOG_EDIT,
    Permissions.BANNERS_EDIT,
  ]),
  [Roles.Viewer]: new Set([]),
};

// Obtém papel do usuário a partir de `roles/{uid}`
export async function getUserRole(user) {
  try {
    const snap = await getDoc(doc(db, 'roles', user.uid));
    if (snap.exists()) {
      const r = (snap.data() || {}).role;
      if ([Roles.Owner, Roles.Admin, Roles.Editor, Roles.Viewer].includes(r)) return r;
    }
  } catch (_) {}
  // Padrão: Viewer
  return Roles.Viewer;
}

// Verifica se um papel possui determinada permissão
export function roleAllows(role, permission) {
  const perms = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[Roles.Viewer];
  return perms.has(permission);
}

// Utilitário simples para checar se role está em um conjunto permitido
export function roleIn(role, allowed) {
  return Array.isArray(allowed) ? allowed.includes(role) : role === allowed;
}

