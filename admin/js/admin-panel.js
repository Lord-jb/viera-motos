/*
 * Arquivo: admin-panel.js
 * Descrição: Lida com toda a lógica de gerenciamento
 * de conteúdo (CRUD - Create, Read, Update, Delete)
 * para ofertas e modelos, usando Firestore e Storage.
 * Depende de: assets/js/firebase-init.js (para 'auth', 'firestore', 'storage')
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // ===============================================
    // VERIFICADOR DE AUTENTICAÇÃO
    // ===============================================
    
    // Só executa o script do painel se o usuário estiver logado.
    auth.onAuthStateChanged(user => {
        if (user) {
            // Usuário está logado, inicializa o painel
            console.log("Admin logado, inicializando painel...");
            initializeAppPanel();
        } else {
            // Usuário não está logado, não faz nada
            console.log("Admin não logado.");
        }
    });

    // ===============================================
    // FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO DO PAINEL
    // ===============================================
    function initializeAppPanel() {
        
        // --- Seletores de Gerenciamento de Ofertas ---
        const offerForm = document.getElementById("offer-form");
        const offerText = document.getElementById("offer-text");
        const offerActive = document.getElementById("offer-active");

        // --- Seletores de Gerenciamento de Modelos ---
        const modelForm = document.getElementById("model-form");
        const modelId = document.getElementById("model-id");
        const modelName = document.getElementById("model-name");
        const modelPrice = document.getElementById("model-price");
        const modelTagline = document.getElementById("model-tagline");
        const modelVideo = document.getElementById("model-video");
        const addColorButton = document.getElementById("add-color-button");
        const colorInputsContainer = document.getElementById("color-manager-inputs");
        const addSpecButton = document.getElementById("add-spec-button");
        const specInputsContainer = document.getElementById("specs-manager-inputs");
        
        // --- Seletores de Lista de Modelos ---
        const modelsListContainer = document.getElementById("current-models-list");
        
        // Referência do Firestore
        const modelsCollection = firestore.collection("models");
        const configCollection = firestore.collection("config");

        // ===============================================
        // 1. GERENCIAMENTO DE OFERTAS (Formulário Simples)
        // ===============================================
        
        // Salvar Oferta
        offerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const text = offerText.value;
            const active = offerActive.checked;

            configCollection.doc("offer").set({
                text: text,
                active: active
            })
            .then(() => alert("Alerta de oferta salvo com sucesso!"))
            .catch(err => alert("Erro ao salvar alerta: " + err.message));
        });

        // Carregar Oferta (ao iniciar)
        configCollection.doc("offer").get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                offerText.value = data.text || "";
                offerActive.checked = data.active;
            }
        });

        // ===============================================
        // 2. ADIÇÃO DINÂMICA DE INPUTS (Cor / Spec)
        // ===============================================
        
        // Adicionar Campo de COR
        addColorButton.addEventListener("click", () => {
            const colorId = new Date().getTime(); // ID único para o input
            const div = document.createElement("div");
            div.className = "dynamic-input-group";
            div.innerHTML = `
                <input type="text" placeholder="Nome da Cor (ex: Azul)" class="color-name">
                <input type="file" class="color-image" accept="image/png, image/jpeg">
                <button type="button" class="btn-remove">&times;</button>
            `;
            // Adiciona funcionalidade ao botão de remover
            div.querySelector(".btn-remove").addEventListener("click", () => div.remove());
            colorInputsContainer.appendChild(div);
        });

        // Adicionar Campo de SPEC (Ficha Técnica)
        addSpecButton.addEventListener("click", () => {
            const div = document.createElement("div");
            div.className = "dynamic-input-group";
            div.innerHTML = `
                <input type="text" placeholder="Nome (ex: Motor)" class="spec-name">
                <input type="text" placeholder="Valor (ex: 160cc)" class="spec-value">
                <button type="button" class="btn-remove">&times;</button>
            `;
            // Adiciona funcionalidade ao botão de remover
            div.querySelector(".btn-remove").addEventListener("click", () => div.remove());
            specInputsContainer.appendChild(div);
        });


        // ===============================================
        // 3. FUNÇÃO DE UPLOAD (Helper)
        // ===============================================
        
        /**
         * Faz upload de um arquivo para o Firebase Storage.
         * @param {File} file - O arquivo a ser enviado.
         * @param {string} path - O caminho no Storage (ex: 'models/az160/video.mp4')
         * @returns {Promise<string>} - A URL de download do arquivo.
         */
        async function uploadFile(file, path) {
            if (!file) return null; // Retorna nulo se nenhum arquivo foi selecionado

            const storageRef = storage.ref(path);
            const uploadTask = storageRef.put(file);

            // Aguarda o upload ser concluído
            const snapshot = await uploadTask;
            // Retorna a URL de download
            return snapshot.ref.getDownloadURL();
        }

        // ===============================================
        // 4. SALVAR MODELO (Formulário Principal)
        // ===============================================
        modelForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const submitButton = modelForm.querySelector("button[type='submit']");
            submitButton.disabled = true;
            submitButton.textContent = "Salvando... Aguarde...";

            try {
                const id = modelId.value;
                if (!id) {
                    alert("O ID Único é obrigatório!");
                    return;
                }

                // --- 1. Upload de Mídia (Cores e Vídeo) ---
                const uploadPromises = [];
                const colorData = [];
                
                // Processa Cores
                const colorGroups = colorInputsContainer.querySelectorAll(".dynamic-input-group");
                for (const group of colorGroups) {
                    const colorName = group.querySelector(".color-name").value;
                    const fileInput = group.querySelector(".color-image");
                    
                    if (colorName && fileInput.files[0]) {
                        const file = fileInput.files[0];
                        const path = `models/${id}/color_${colorName.replace(/\s+/g, '_')}.${file.name.split('.').pop()}`;
                        
                        // Adiciona a promessa de upload ao array
                        uploadPromises.push(
                            uploadFile(file, path).then(url => {
                                // Salva os dados da cor com a URL
                                colorData.push({ name: colorName, imageUrl: url });
                            })
                        );
                    }
                }

                // Processa Vídeo Principal
                const videoFile = modelVideo.files[0];
                let videoUrl = null;
                if (videoFile) {
                    const videoPath = `models/${id}/video_principal.${videoFile.name.split('.').pop()}`;
                    // Adiciona a promessa de upload do vídeo
                    const videoUploadPromise = uploadFile(videoFile, videoPath).then(url => {
                        videoUrl = url;
                    });
                    uploadPromises.push(videoUploadPromise);
                }

                // Aguarda TODOS os uploads terminarem em paralelo
                await Promise.all(uploadPromises);
                console.log("Uploads concluídos.");

                // --- 2. Coleta de Ficha Técnica ---
                const specsData = [];
                const specGroups = specInputsContainer.querySelectorAll(".dynamic-input-group");
                specGroups.forEach(group => {
                    const specName = group.querySelector(".spec-name").value;
                    const specValue = group.querySelector(".spec-value").value;
                    if (specName && specValue) {
                        specsData.push({ name: specName, value: specValue });
                    }
                });

                // --- 3. Monta o Objeto Final para o Firestore ---
                const priceStr = modelPrice.value;
                const modelData = {
                    name: modelName.value,
                    price: priceStr,
                    priceNumber: (function(p){ const cleaned = String(p||'').replace(/\./g,'').replace(',', '.'); const n = parseFloat(cleaned); return isNaN(n)? null : Math.round(n*100)/100; })(priceStr),
                    tagline: modelTagline.value,
                    colors: colorData, // Array de objetos {name, imageUrl}
                    specs: specsData,   // Array de objetos {name, value}
                    videoUrl: videoUrl,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                // --- 4. Salva no Firestore ---
                // Usamos .set() com o ID do formulário
                await modelsCollection.doc(id).set(modelData, { merge: true }); // 'merge: true' atualiza sem sobrescrever tudo
                
                alert(`Modelo ${id} salvo com sucesso!`);
                modelForm.reset(); // Limpa o formulário
                colorInputsContainer.innerHTML = ""; // Limpa cores
                specInputsContainer.innerHTML = ""; // Limpa specs

            } catch (error) {
                console.error("Erro ao salvar modelo:", error);
                alert("Falha ao salvar o modelo: " + error.message);
            } finally {
                // Reativa o botão
                submitButton.disabled = false;
                submitButton.textContent = "Salvar Modelo Completo";
            }
        });

        // ===============================================
        // 5. CARREGAR E EXIBIR MODELOS EXISTENTES
        // ===============================================
        
        // 'onSnapshot' ouve em tempo real
        modelsCollection.orderBy("updatedAt", "desc").onSnapshot(snapshot => {
            modelsListContainer.innerHTML = ""; // Limpa a lista
            
            if (snapshot.empty) {
                modelsListContainer.innerHTML = "<p>Nenhum modelo cadastrado.</p>";
                return;
            }

            snapshot.forEach(doc => {
                const model = doc.data();
                const div = document.createElement("div");
                div.className = "model-list-item";
                div.innerHTML = `
                    <span>
                        <strong>${doc.id}</strong> (${model.name})
                    </span>
                    <div>
                        <button class="btn-edit" data-id="${doc.id}">Editar</button>
                        <button class="btn-delete" data-id="${doc.id}">Excluir</button>
                    </div>
                `;
                modelsListContainer.appendChild(div);
            });

        }, error => {
            console.error("Erro ao carregar lista de modelos: ", error);
        });

        // ===============================================
        // 6. DELEGAR EVENTOS (Editar / Excluir)
        // ===============================================
        modelsListContainer.addEventListener("click", (e) => {
            const target = e.target;
            const id = target.dataset.id;
            
            if (!id) return; // Sai se clicou fora de um botão

            // --- Ação de Excluir ---
            if (target.classList.contains("btn-delete")) {
                if (confirm(`Tem certeza que deseja excluir o modelo ${id}?
Esta ação não pode ser desfeita e NÃO exclui os arquivos do Storage.`)) {
                    
                    modelsCollection.doc(id).delete()
                        .then(() => alert("Modelo excluído com sucesso."))
                        .catch(err => alert("Erro ao excluir: " + err.message));
                }
            }

            // --- Ação de Editar ---
            if (target.classList.contains("btn-edit")) {
                alert(`Função "Editar" não implementada.
Para editar:
1. Digite o ID "${id}" no formulário ao lado.
2. Preencha os campos com os NOVOS dados.
3. Envie o formulário.
(O sistema usará 'merge' para atualizar o modelo existente.)`);
                
                // TODO (Implementação V2):
                // 1. Chamar modelsCollection.doc(id).get()
                // 2. Popular o formulário principal (modelForm) com os dados
                // 3. Popular dinamicamente os campos de cores e specs
            }
        });
    }
});
