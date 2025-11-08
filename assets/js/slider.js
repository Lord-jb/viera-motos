/*
 * Arquivo: slider.js
 * Descrição: Script genérico para funcionalidade de
 * carrossel/slider (ex: galerias de imagens).
 * * NOTA: Este é um placeholder funcional. Para usá-lo,
 * você precisaria de uma estrutura HTML como:
 *
 * <div class="slider-container">
 * <div class="slider-wrapper">
 * <div class="slider-item">...</div>
 * <div class="slider-item">...</div>
 * </div>
 * <button class="slider-prev">Anterior</button>
 * <button class="slider-next">Próximo</button>
 * </div>
 */

document.addEventListener("DOMContentLoaded", function() {

    // Função genérica para inicializar um slider
    function initSlider(containerSelector) {
        const sliderContainer = document.querySelector(containerSelector);

        // Se o container do slider não existir nesta página,
        // encerra a função para evitar erros.
        if (!sliderContainer) {
            return;
        }

        // Seleciona os elementos do slider
        const sliderWrapper = sliderContainer.querySelector(".slider-wrapper");
        const sliderItems = sliderContainer.querySelectorAll(".slider-item");
        const prevButton = sliderContainer.querySelector(".slider-prev");
        const nextButton = sliderContainer.querySelector(".slider-next");

        // Verifica se os elementos essenciais existem
        if (!sliderWrapper || sliderItems.length === 0 || !prevButton || !nextButton) {
            console.warn(`Slider ${containerSelector} não foi inicializado (faltam elementos).`);
            return;
        }

        let currentIndex = 0;
        const totalItems = sliderItems.length;

        // Função para mostrar o slide correto
        function showSlide(index) {
            // Calcula o deslocamento
            // Assume que todos os 'slider-item' têm a mesma largura
            const offset = -index * 100; // Desloca 100% por item
            sliderWrapper.style.transform = `translateX(${offset}%)`;

            // Atualiza o estado dos botões
            prevButton.disabled = (index === 0);
            nextButton.disabled = (index === totalItems - 1);
        }

        // Event listener para o botão "Próximo"
        nextButton.addEventListener("click", function() {
            if (currentIndex < totalItems - 1) {
                currentIndex++;
                showSlide(currentIndex);
            }
        });

        // Event listener para o botão "Anterior"
        prevButton.addEventListener("click", function() {
            if (currentIndex > 0) {
                currentIndex--;
                showSlide(currentIndex);
            }
        });

        // Inicializa o slider na primeira posição
        showSlide(currentIndex);
    }

    /* * INICIALIZAÇÃO:
     * Você pode chamar a função para cada slider
     * que existir no seu site.
     * Ex: Se a galeria da página de modelo tiver a classe ".model-gallery-slider"
     */
     
    // initSlider(".model-gallery-slider");
    // initSlider(".home-banner-slider"); // (Exemplo, se o banner fosse um slider)

});