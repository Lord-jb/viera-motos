// Firebase Config (ES Modules)
// - Inicializa App, Auth e Firestore
// - Exports: app, auth, db
// Substitui placeholders por chaves reais (usando as do compat em assets/js/firebase-init.js)

// SDK modular do Firebase (v9)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { initializeAppCheck, ReCaptchaV3Provider } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app-check.js';

// Configuração do projeto (v9 modular)
export const firebaseConfig = {
  apiKey: "AIzaSyB0qGPExpAx8eL5xMvjZH0nYVRcggOZQiM",
  authDomain: "viera-motos-maraba.firebaseapp.com",
  projectId: "viera-motos-maraba",
  storageBucket: "viera-motos-maraba.appspot.com",
  messagingSenderId: "200823191001",
  appId: "1:200823191001:web:8412894db5792c0d9d15c8",
  measurementId: "G-7H105WHK1M"
};

// Inicialização do App Firebase
const app = initializeApp(firebaseConfig);

// Instâncias de Auth e Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Exports principais do módulo
export { app, auth, db };

// App Check (reCAPTCHA v3)
try {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6Lf4PAcsAAAAANFK-86nYM6m_VU7CfR5KEhWwfQb'),
    isTokenAutoRefreshEnabled: true
  });
} catch (_) {}
