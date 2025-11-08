/*
 * Arquivo: menu.js
 * Descrição: Script para controlar a 
 * funcionalidade do menu hambúrguer mobile.
 */

document.addEventListener("DOMContentLoaded", function() {

    // Seleciona os elementos do DOM
    const hamburgerButton = document.getElementById("hamburger-menu");
    const mainNav = document.getElementById("main-nav");
    const body = document.body;

    // Verifica se os elementos existem na página
    if (hamburgerButton && mainNav) {
        
        // Adiciona o ouvinte de clique ao botão hambúrguer
        hamburgerButton.addEventListener("click", function() {
            
            // 1. Alterna a classe 'open' no botão (para animação X)
            hamburgerButton.classList.toggle("open");
            
            // 2. Alterna a classe 'mobile-open' no menu (para exibir/esconder)
            mainNav.classList.toggle("mobile-open");

            // 3. (Bônus de UX) Trava o scroll do body quando o menu está aberto
            // para evitar que o usuário role a página por baixo do menu.
            if (mainNav.classList.contains("mobile-open")) {
                body.style.overflow = "hidden";
            } else {
                body.style.overflow = "auto";
            }
        });
    }

    // (Opcional) Fechar o menu ao clicar em um link
    // Isso é útil para SPAs, mas em navegação tradicional pode não ser necessário.
    // Para este projeto, manteremos o comportamento padrão (clicar no link navega).

});