/*
 * Arquivo: firebase-init.js
 * Descrição: Inicializa a conexão com o Firebase
 * usando as chaves de API do projeto.
 * * USA A SINTAXE DE COMPATIBILIDADE (v8) para 
 * funcionar com as tags <script> no admin.html.
 */

// 1. A sua configuração de chaves (exatamente como você forneceu)
const firebaseConfig = {
    apiKey: "AIzaSyB0qGPExpAx8eL5xMvjZH0nYVRcggOZQiM",
    authDomain: "viera-motos-maraba.firebaseapp.com",
    projectId: "viera-motos-maraba",
    storageBucket: "viera-motos-maraba.appspot.com",
    messagingSenderId: "200823191001",
    appId: "1:200823191001:web:8412894db5792c0d9d15c8",
    measurementId: "G-7H105WHK1M"
};

// 2. Inicializa o Firebase
// O objeto 'firebase' é fornecido pelos scripts
// <script src="..."> que importamos no admin.html.
firebase.initializeApp(firebaseConfig);

// 3. Cria referências fáceis de usar para os serviços
// Nossos próximos scripts (auth.js, admin-panel.js)
// usarão essas variáveis.
const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();

console.log("Firebase (Compat) Inicializado com Sucesso.");

// Firestore: ativa persistência offline para cache local
if (firestore && firestore.enablePersistence) {
  firestore.enablePersistence({ synchronizeTabs: true }).catch((err) => {
    console.warn('Persistência offline indisponível:', err && err.code ? err.code : err);
  });
}
