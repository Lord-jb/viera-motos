// Firebase Config (ES Modules)
// - Inicializa App, Auth e Firestore
// - Exports: app, auth, db
// Observação: substitua os placeholders pelas chaves reais antes do deploy.

// SDK modular do Firebase (v9)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

// Exemplo de configuração (substitua pelas chaves reais)
/*
export const firebaseConfig = {
  apiKey: 'SUA_API_KEY',
  authDomain: 'SEU_PROJETO.firebaseapp.com',
  projectId: 'SEU_PROJECT_ID',
  storageBucket: 'SEU_PROJETO.appspot.com',
  messagingSenderId: 'SEU_SENDER_ID',
  appId: 'SEU_APP_ID',
  // measurementId: 'G-XXXXXXXXXX' // opcional
};
*/

// Placeholder temporário para desenvolvimento (trocar pelas chaves reais)
const firebaseConfig = {
  apiKey: 'REPLACE_ME',
  authDomain: 'REPLACE_ME',
  projectId: 'REPLACE_ME'
};

// Inicialização do App Firebase
const app = initializeApp(firebaseConfig);

// Instâncias de Auth e Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Exports principais do módulo
export { app, auth, db };

