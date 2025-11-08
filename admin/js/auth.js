/*
 * Arquivo: auth.js
 * Descrição: Lida com a autenticação (login, logout, verificação de estado)
 * no painel de admin (admin.html).
 * Depende de: assets/js/firebase-init.js (para a variável 'auth')
 */

document.addEventListener("DOMContentLoaded", () => {

    // Seleção dos Elementos do DOM
    const loginSection = document.getElementById("login-section");
    const adminPanel = document.getElementById("admin-panel");
    
    const loginForm = document.getElementById("login-form");
    const loginEmail = document.getElementById("login-email");
    const loginPassword = document.getElementById("login-password");
    const loginError = document.getElementById("login-error");
    
    const logoutButton = document.getElementById("logout-button");
    const userEmailDisplay = document.getElementById("user-email");

    // ===============================================
    // 1. OUVINTE PRINCIPAL DE AUTENTICAÇÃO
    // ===============================================
    
    // Esta função é o "coração" da autenticação.
    // O Firebase a executa automaticamente quando a página carrega
    // e sempre que o estado de login/logout muda.
    auth.onAuthStateChanged(user => {
        if (user) {
            // --- USUÁRIO ESTÁ LOGADO ---
            
            // 1. Mostra o painel de admin
            loginSection.style.display = "none";
            // Usamos 'flex' para o admin-panel, conforme o admin.css
            adminPanel.style.display = "flex"; 
            
            // 2. Exibe o email do usuário no topo
            userEmailDisplay.textContent = user.email;

            // 3. Limpa qualquer erro de login antigo
            loginError.textContent = "";

        } else {
            // --- USUÁRIO ESTÁ DESLOGADO ---
            
            // 1. Mostra a tela de login
            loginSection.style.display = "flex";
            adminPanel.style.display = "none";
            
            // 2. Limpa o email do usuário
            userEmailDisplay.textContent = "";
        }
    });

    // ===============================================
    // 2. FUNCIONALIDADE DE LOGIN
    // ===============================================
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Impede que o formulário recarregue a página
        
        const email = loginEmail.value;
        const password = loginPassword.value;
        
        // Limpa erros antigos
        loginError.textContent = "";

        // Tenta fazer login usando o Firebase Auth
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Sucesso!
                // Não precisamos fazer nada aqui, pois o
                // 'onAuthStateChanged' (acima) será acionado
                // automaticamente e cuidará de mostrar o painel.
                console.log("Login bem-sucedido:", userCredential.user.email);
            })
            .catch((error) => {
                // Falha no login
                console.error("Erro no login:", error.code, error.message);
                
                // Exibe uma mensagem de erro amigável
                if (error.code === 'auth/user-not-found' || 
                    error.code === 'auth/wrong-password' || 
                    error.code === 'auth/invalid-credential') {
                        
                    loginError.textContent = "Email ou senha inválidos.";
                } else {
                    loginError.textContent = "Ocorreu um erro. Tente novamente.";
                }
            });
    });

    // ===============================================
    // 3. FUNCIONALIDADE DE LOGOUT
    // ===============================================
    logoutButton.addEventListener("click", () => {
        auth.signOut()
            .then(() => {
                // Sucesso no logout!
                // O 'onAuthStateChanged' (acima) será acionado
                // e cuidará de mostrar a tela de login.
                console.log("Logout bem-sucedido.");
            })
            .catch((error) => {
                console.error("Erro ao fazer logout:", error);
                alert("Ocorreu um erro ao tentar sair.");
            });
    });

});