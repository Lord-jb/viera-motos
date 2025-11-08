/*
 * Arquivo: modelo-dynamic.js
 * (Versão corrigida, sem vídeo, com galeria de fotos)
 * LOCALIZAÇÃO: /assets/js/
 */

document.addEventListener("DOMContentLoaded", () => {
    window.__escape = (s) => String(s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    
    // 1. OBTER O ID DO MODELO DA URL
    const params = new URLSearchParams(window.location.search);
    const modelId = params.get("id"); // Ex: 'az160-xtreme'
    const mainPageContainer = document.querySelector("main.model-page");

    if (!modelId) {
        displayError(mainPageContainer, "Nenhum modelo selecionado.");
        return;
    }

    // 2. BUSCAR DADOS DO MODELO NO FIRESTORE
    const modelRef = firestore.collection("models").doc(modelId);

    modelRef.get()
        .then(doc => {
            if (doc.exists) {
                const model = doc.data();
                populatePage(model, modelId); // 3. POPULAR A PÁGINA
                activateColorSelector(); // 4. ATIVAR SELETOR DE COR
            } else {
                displayError(mainPageContainer, "Modelo não encontrado.");
            }
        })
        .catch(error => {
            console.error("Erro ao buscar modelo:", error);
            displayError(mainPageContainer, "Erro ao carregar os dados. Tente novamente.");
        });
});

/**
 * Exibe uma mensagem de erro centralizada na página.
 */
function displayError(container, message) {
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 10rem 2rem; color: var(--color-primary-dark);">
                <h1>Oops!</h1>
                <p style="font-size: 2rem;">${message}</p>
                <a href="index.html" class="btn btn-primary" style="margin-top: 2rem;">Voltar à Home</a>
            </div>
        `;
    }
}

/**
 * Injeta os dados do modelo no HTML da página.
 */
function populatePage(model, modelId) {
    document.title = `${model.name} - Viera Moto Center Marabá`;

    // Hero
    document.getElementById("model-hero-image").innerHTML = generateColorImages(model.colors);
    document.getElementById("model-hero-info-tag").textContent = model.tagline || 'Avelloz 2025';
    document.getElementById("model-hero-info-title").textContent = model.name;
    document.getElementById("model-hero-info-price").innerHTML = `A partir de <span>R$ ${__escape(model.price || '...')}</span>`;
    document.getElementById("model-color-swatches").innerHTML = generateColorSwatches(model.colors);

    // Specs
    document.getElementById("specs-summary-grid").innerHTML = generateSpecsSummary(model.specs);
    document.getElementById("specs-detailed-table-body").innerHTML = generateSpecsDetails(model.specs);

    // Galeria (sem vídeo)
    document.getElementById("gallery-grid-dynamic").innerHTML = generateGalleryImages(model.colors);

    // Atualiza CTA para Test-Ride com pré-seleção do modelo
    const btn = document.getElementById('btn-test-ride');
    if (btn) {
        btn.href = `test-drive.html?model=${encodeURIComponent(modelId)}`;
        btn.textContent = 'Agendar Test-Ride';
    }
}

// ===============================================
// FUNÇÕES DE GERAÇÃO DE HTML
// ===============================================

function generateColorImages(colors) {
    if (!colors || colors.length === 0) return '<img src="assets/images/placeholder-moto.svg" alt="Imagem indisponível" class="model-image active" loading="lazy" decoding="async">';
    
    return colors.map((color, index) => `
        <img 
            src="${color.imageUrl}" 
            alt="${__escape(color.name)}" 
            class="model-image ${index === 0 ? 'active' : ''}" loading="lazy" decoding="async"
            data-image="${color.name.toLowerCase().replace(/\s+/g, '_')}">
    `).join('');
}

function generateColorSwatches(colors) {
    if (!colors || colors.length === 0) return '<p>Cor única</p>';
    
    const colorMap = { 'azul': '#0D1B2A', 'laranja': '#FF6F00', 'preto': '#222', 'branco': '#FFF', 'vermelho': '#C00' };

    return colors.map((color, index) => {
        const colorKey = color.name.toLowerCase();
        const backgroundColor = colorMap[colorKey] || colorKey;
        
        return `
        <div 
            class="color-swatch ${index === 0 ? 'active' : ''}" 
            data-color="${colorKey.replace(/\s+/g, '_')}" 
            aria-label="Cor ${color.name}"
            style="background-color: ${backgroundColor}; ${colorKey === 'branco' ? 'border: 1px solid #ccc;' : ''}">
        </div>
    `}).join('');
}

function generateSpecsSummary(specs) {
    if (!specs || specs.length === 0) return '';
    return specs.slice(0, 4).map(spec => `
        <div class="spec-item">
            <img src="assets/images/icons/icon-engine.svg" alt="Ícone">
            <h4>${__escape(spec.value)}</h4>
            <p>${__escape(spec.name)}</p>
        </div>
    `).join('');
}

function generateSpecsDetails(specs) {
    if (!specs || specs.length === 0) return '<tr><td colspan="2">Ficha técnica indisponível.</td></tr>';
    
    let html = '<tr><th colspan="2">Especificações</th></tr>';
    html += specs.map(spec => `
        <tr>
            <td>${__escape(spec.name)}</td>
            <td>${__escape(spec.value)}</td>
        </tr>
    `).join('');
    return html;
}

// Galeria de imagens (em vez do vídeo)
function generateGalleryImages(colors) {
    if (!colors || colors.length === 0) return '<p>Nenhuma imagem na galeria.</p>';
    return colors.map(color => `
        <div class="gallery-item">
            <img src="${color.imageUrl}" alt="Galeria ${__escape(color.name)}" loading="lazy" decoding="async">
        </div>
    `).join('');
}

// LÓGICA DE INTERAÇÃO (Seletor de Cores)
function activateColorSelector() {
    const colorSelector = document.querySelector(".model-color-selector");
    const imageContainer = document.querySelector(".model-hero-image");
    if (!colorSelector || !imageContainer) return;
    
    const swatches = colorSelector.querySelectorAll(".color-swatch");
    const images = imageContainer.querySelectorAll(".model-image");
    if (swatches.length === 0 || images.length === 0) return;

    swatches.forEach(swatch => {
        swatch.addEventListener("click", function() {
            const selectedColor = this.dataset.color;
            swatches.forEach(s => s.classList.remove("active"));
            this.classList.add("active");
            images.forEach(img => {
                img.classList.remove("active");
                if (img.dataset.image === selectedColor) {
                    img.classList.add("active");
                }
            });
        });
    });
}
