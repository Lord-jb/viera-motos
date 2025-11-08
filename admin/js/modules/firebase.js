// Módulo Firebase (v9 modular)
// - Inicializa App, Auth, Firestore e Storage
// - Expõe instâncias para os demais módulos do admin

// Importes do SDK modular via CDN (mantemos versão alinhada ao projeto)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js';

// Configuração do Firebase (igual ao site público)
// Comentário: manter uma única fonte de verdade. Aqui replicamos para isolar o admin.
export const firebaseConfig = {
  apiKey: "AIzaSyB0qGPExpAx8eL5xMvjZH0nYVRcggOZQiM",
  authDomain: "viera-motos-maraba.firebaseapp.com",
  projectId: "viera-motos-maraba",
  storageBucket: "viera-motos-maraba.appspot.com",
  messagingSenderId: "200823191001",
  appId: "1:200823191001:web:8412894db5792c0d9d15c8",
  measurementId: "G-7H105WHK1M"
};

// Inicialização única do app
const app = initializeApp(firebaseConfig);

// Instâncias globais do admin
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default { app, auth, db, storage };

