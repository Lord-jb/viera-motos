/*
 * Arquivo: main.js
 * Descrição: Script principal para interações globais.
 * - Controla o efeito 'scrolled' do menu.
 */

// Adiciona um listener que espera o DOM estar
// completamente carregado antes de executar o script.
document.addEventListener("DOMContentLoaded", function() {

    // Seleciona o cabeçalho principal
    const mainHeader = document.getElementById("main-header");

    // Função para lidar com o efeito de scroll
    function handleScroll() {
        // Verifica se a rolagem vertical é maior que 50 pixels
        if (window.scrollY > 50) {
            // Adiciona a classe 'scrolled' se não a tiver
            if (!mainHeader.classList.contains("scrolled")) {
                mainHeader.classList.add("scrolled");
            }
        } else {
            // Remove a classe 'scrolled' se a tiver
            if (mainHeader.classList.contains("scrolled")) {
                mainHeader.classList.remove("scrolled");
            }
        }
    }

    // Adiciona o listener de scroll à janela
    window.addEventListener("scroll", handleScroll);

    // (Opcional) Executa a função uma vez no carregamento,
    // caso a página carregue no meio (ex: após um refresh)
    handleScroll();

});