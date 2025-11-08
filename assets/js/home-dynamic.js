/*
 * Arquivo: home-dynamic.js
 * Descrição: Busca os dados dos modelos no Firestore
 * e popula a página inicial (index.html).
 * Depende de: assets/js/firebase-init.js (para 'firestore')
 */

document.addEventListener("DOMContentLoaded", () => {
    const escapeHTML = (s) => String(s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    
    // 1. Seleciona o container onde os cards das motos entrarão
    const modelsGrid = document.querySelector(".models-grid");
    
    // 2. Seleciona o container do alerta/oferta (não obrigatório)
    const offerContainer = document.getElementById("offer-alert-container");

    // Verifica se os elementos existem na página
    if (!modelsGrid) {
        console.error("Elemento '.models-grid' não encontrado no index.html.");
        return;
    }

    // 3. Referência à coleção de 'models' no Firestore
    const modelsCollection = firestore.collection("models");
    
    // 4. Referência à configuração de 'offer'
    const offerDoc = firestore.collection("config").doc("offer");

    // ===============================================
    // CARREGAR ALERTA DE OFERTA
    // ===============================================
    offerDoc.get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            if (data.active && data.text) {
                const offerElement = document.createElement("div");
                offerElement.className = "offer-alert-bar";
                offerElement.innerHTML = `<p>${data.text}</p>`;
                // Adiciona o elemento no topo da página
                document.body.prepend(offerElement);
            }
        }
    });

    // ===============================================
    // CARREGAR VITRINE DE MODELOS
    // ===============================================
    // cache local de modelos (10min)
    const cacheKey = 'modelsCacheV1';
    const ttl = 10 * 60 * 1000;
    try {
        const raw = localStorage.getItem(cacheKey);
        if (raw) {
            const c = JSON.parse(raw);
            if (Date.now() - c.ts < ttl && Array.isArray(c.items)) {
                // tentativa de render a partir do cache
                c.items.forEach(({id: modelId, model}) => {
                    const imageUrl = (model.colors && model.colors.length > 0) 
                                     ? model.colors[0].imageUrl 
                                     : "assets/images/placeholder-moto.svg";
                    const modelCard = document.createElement("div");
                    modelCard.className = "model-card";
                    if (modelId === 'az125-alfa') modelCard.classList.add("featured");
                    modelCard.innerHTML = `
                        <div class=\"model-card-image\">\n                            <img src=\"${imageUrl}\" alt=\"${escapeHTML(model.name)}\" loading=\"lazy\" decoding=\"async\">\n                        </div>\n                        <div class=\"model-card-content\">\n                            <h3 class=\"model-card-title\">${escapeHTML(model.name)}</h3>\n                            <p class=\"model-card-description\">${escapeHTML(model.tagline || '')}</p>\n                            <a href=\"modelo.html?id=${encodeURIComponent(modelId)}\" class=\"btn btn-outline-light\">Ver Detalhes</a>\n                        </div>`;
                    modelsGrid.appendChild(modelCard);
                });
            }
        }
    } catch(e) { /* ignore */ }
    modelsCollection.get()
        .then(snapshot => {
            // Limpa qualquer conteúdo estático
            modelsGrid.innerHTML = ""; 

            if (snapshot.empty) {
                modelsGrid.innerHTML = "<p style='color: white; text-align: center;'>Nenhum modelo cadastrado no momento.</p>";
                return;
            }

            const items = [];
            snapshot.forEach(doc => {
                const model = doc.data();
                items.push({ id: doc.id, model });
            });

            const parsePrice = (m) => {
                if (typeof m.priceNumber === 'number') return m.priceNumber;
                if (typeof m.price === 'string') {
                    const n = parseFloat(m.price.replace(/\./g,'').replace(',', '.'));
                    return isNaN(n) ? Number.POSITIVE_INFINITY : n;
                }
                return Number.POSITIVE_INFINITY;
            };

            items.sort((a,b) => parsePrice(a.model) - parsePrice(b.model));
            try { localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), items })); } catch(e) {}
            // renderização unificada
            items.forEach(({id: modelId, model}) => {
                const imageUrl = (model.colors && model.colors.length > 0) 
                                 ? model.colors[0].imageUrl 
                                 : "assets/images/placeholder-moto.svg";
                const modelCard = document.createElement("div");
                modelCard.className = "model-card";
                if (modelId === 'az125-alfa') modelCard.classList.add("featured");
                modelCard.innerHTML = `
                    <div class=\"model-card-image\">\n                        <img src=\"${imageUrl}\" alt=\"${escapeHTML(model.name)}\" loading=\"lazy\" decoding=\"async\">\n                    </div>\n                    <div class=\"model-card-content\">\n                        <h3 class=\"model-card-title\">${escapeHTML(model.name)}</h3>\n                        <p class=\"model-card-description\">${escapeHTML(model.tagline || '')}</p>\n                        <a href=\"modelo.html?id=${encodeURIComponent(modelId)}\" class=\"btn btn-outline-light\">Ver Detalhes</a>\n                    </div>`;
                modelsGrid.appendChild(modelCard);
            });

        })
        .catch(error => {
            console.error("Erro ao buscar modelos para a home:", error);
            modelsGrid.innerHTML = "<p style='color: red; text-align: center;'>Erro ao carregar modelos.</p>";
        });
});
