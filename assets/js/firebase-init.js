// Firebase v9 modular para o site público
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js';
import { initializeAppCheck, ReCaptchaV3Provider } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app-check.js';

// Config do projeto (mesma usada no admin)
const firebaseConfig = {
  apiKey: "AIzaSyB0qGPExpAx8eL5xMvjZH0nYVRcggOZQiM",
  authDomain: "viera-motos-maraba.firebaseapp.com",
  projectId: "viera-motos-maraba",
  storageBucket: "viera-motos-maraba.appspot.com",
  messagingSenderId: "200823191001",
  appId: "1:200823191001:web:8412894db5792c0d9d15c8",
  measurementId: "G-7H105WHK1M"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

// App Check (reCAPTCHA v3)
try {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6Lf4PAcsAAAAANFK-86nYM6m_VU7CfR5KEhWwfQb'),
    isTokenAutoRefreshEnabled: true
  });
} catch (_) {}

console.log('Firebase (v9 modular) inicializado para o site público.');
