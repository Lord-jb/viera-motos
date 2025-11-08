/*
 * Admin enhancements: edição de modelos com preservação de imagens,
 * compressão WebP e preenchimento do formulário ao clicar em Editar.
 * Não altera layout visual.
 */

document.addEventListener('DOMContentLoaded', () => {
  const modelsListContainer = document.getElementById('current-models-list');
  const modelForm = document.getElementById('model-form');
  const colorInputsContainer = document.getElementById('color-manager-inputs');
  const specInputsContainer = document.getElementById('specs-manager-inputs');
  const modelId = document.getElementById('model-id');
  const modelName = document.getElementById('model-name');
  const modelPrice = document.getElementById('model-price');
  const modelTagline = document.getElementById('model-tagline');
  const modelVideo = document.getElementById('model-video');

  if (!modelsListContainer || !modelForm) return;

  let currentEditingModel = null;
  let currentEditingId = null;

  // Sugere ID automaticamente a partir do Nome
  const slugify = (s) => String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
  const sanitize = (s) => String(s || '').replace(/[<>]/g, '');
  if (modelName && modelId) {
    modelName.addEventListener('input', () => {
      if (!modelId.value || modelId.dataset.autofilled === 'true') {
        modelId.value = slugify(modelName.value);
        modelId.dataset.autofilled = 'true';
      }
    });
  }

  

  async function compressImageToWebP(file, { maxWidth = 1600, quality = 0.8 } = {}) {
    const img = new Image();
    const dataUrl = await new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = dataUrl; });
    const scale = Math.min(1, maxWidth / img.width);
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
    return blob || file;
  }

  async function uploadFile(file, path, contentType) {
    const storageRef = storage.ref(path);
    const uploadTask = storageRef.put(file, contentType ? { contentType } : undefined);
    const snapshot = await uploadTask;
    return snapshot.ref.getDownloadURL();
  }

  async function populateForEdit(id) {
    const doc = await firestore.collection('models').doc(id).get();
    if (!doc.exists) { alert('Modelo não encontrado.'); return; }
    currentEditingId = id;
    currentEditingModel = doc.data();
    modelId.value = id;
    modelName.value = currentEditingModel.name || '';
    modelPrice.value = currentEditingModel.price || '';
    modelTagline.value = currentEditingModel.tagline || '';

    colorInputsContainer.innerHTML = '';
    (currentEditingModel.colors || []).forEach(c => {
      const div = document.createElement('div');
      div.className = 'dynamic-input-group';
      div.innerHTML = `
        <input type="text" placeholder="Nome da Cor (ex: Azul)" class="color-name" value="${(c.name||'').replace(/"/g,'&quot;')}">
        <input type="file" class="color-image" accept="image/*">
        <input type="hidden" class="color-existing-url" value="${(c.imageUrl||'').replace(/"/g,'&quot;')}">
        <input type="hidden" class="color-existing-path" value="${(c.storagePath||'').replace(/"/g,'&quot;')}">
        <button type="button" class="btn-remove">&times;</button>`;
      div.querySelector('.btn-remove').addEventListener('click', () => div.remove());
      colorInputsContainer.appendChild(div);
    });

    specInputsContainer.innerHTML = '';
    (currentEditingModel.specs || []).forEach(s => {
      const div = document.createElement('div');
      div.className = 'dynamic-input-group';
      div.innerHTML = `
        <input type="text" placeholder="Nome (ex: Motor)" class="spec-name" value="${(s.name||'').replace(/"/g,'&quot;')}">
        <input type="text" placeholder="Valor (ex: 160cc)" class="spec-value" value="${(s.value||'').replace(/"/g,'&quot;')}">
        <button type="button" class="btn-remove">&times;</button>`;
      div.querySelector('.btn-remove').addEventListener('click', () => div.remove());
      specInputsContainer.appendChild(div);
    });

    // Guardar vídeo atual (hidden inputs)
    let vUrl = document.getElementById('video-existing-url');
    let vPath = document.getElementById('video-existing-path');
    if (!vUrl) { vUrl = document.createElement('input'); vUrl.type = 'hidden'; vUrl.id = 'video-existing-url'; modelForm.appendChild(vUrl); }
    if (!vPath) { vPath = document.createElement('input'); vPath.type = 'hidden'; vPath.id = 'video-existing-path'; modelForm.appendChild(vPath); }
    vUrl.value = currentEditingModel.videoUrl || '';
    vPath.value = currentEditingModel.videoStoragePath || '';

    modelVideo.value = '';
    alert('Formulário preenchido para edição. Faça as alterações e clique em Salvar.');
  }

  // Intercepta clique em Editar, evitando alerta do script original
  modelsListContainer.addEventListener('click', (e) => {
    const t = e.target;
    if (t && t.classList.contains('btn-edit')) {
      e.preventDefault();
      e.stopImmediatePropagation();
      const id = t.dataset.id;
      populateForEdit(id).catch(console.error);
    }
  }, true);

  // Submissão própria (para preservar imagens e usar WebP)
  modelForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    const submitButton = modelForm.querySelector("button[type='submit']");
    submitButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Salvando... Aguarde...';

    try {
      const id = slugify(modelId.value);
      if (!id) { alert('ID é obrigatório'); return; }

      const MAX_IMG_MB = 4;
      const colorData = [];
      const uploadPromises = [];
      const colorGroups = colorInputsContainer.querySelectorAll('.dynamic-input-group');
      for (const group of colorGroups) {
        const colorName = sanitize(group.querySelector('.color-name').value);
        if (!colorName) continue;
        const fileInput = group.querySelector('.color-image');
        const existingUrl = group.querySelector('.color-existing-url')?.value || '';
        const existingPath = group.querySelector('.color-existing-path')?.value || '';
        if (fileInput.files && fileInput.files[0]) {
          const f = fileInput.files[0];
          if (f.size > MAX_IMG_MB * 1024 * 1024) { alert(`A imagem da cor "${colorName}" excede ${MAX_IMG_MB}MB.`); continue; }
          const webp = await compressImageToWebP(f);
          const path = `models/${id}/color_${slugify(colorName)}.webp`;
          uploadPromises.push(
            uploadFile(webp, path, 'image/webp').then(url => {
              colorData.push({ name: colorName, imageUrl: url, storagePath: path });
            })
          );
        } else if (existingUrl) {
          colorData.push({ name: colorName, imageUrl: existingUrl, storagePath: existingPath || null });
        }
      }

      // Vídeo
      const videoFile = modelVideo.files[0];
      let videoUrl = document.getElementById('video-existing-url')?.value || null;
      let videoStoragePath = document.getElementById('video-existing-path')?.value || null;
      if (videoFile) {
        const videoPath = `models/${id}/video_principal.${videoFile.name.split('.').pop()}`;
        await uploadFile(videoFile, videoPath, videoFile.type || undefined).then(url => {
          videoUrl = url; videoStoragePath = videoPath;
        });
      }

      await Promise.all(uploadPromises);

      // Specs
      const specsData = [];
      specInputsContainer.querySelectorAll('.dynamic-input-group').forEach(group => {
        const n = sanitize(group.querySelector('.spec-name').value);
        const v = sanitize(group.querySelector('.spec-value').value);
        if (n && v) specsData.push({ name: n, value: v });
      });

      const priceStr = modelPrice.value;
      const priceNumber = (() => { const cleaned = String(priceStr||'').replace(/\./g,'').replace(',', '.'); const n = parseFloat(cleaned); return isNaN(n)? null : Math.round(n*100)/100; })();
      const modelData = {
        name: sanitize(modelName.value),
        price: priceStr,
        priceNumber,
        tagline: sanitize(modelTagline.value),
        colors: colorData,
        specs: specsData,
        videoUrl,
        videoStoragePath,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      // Detecta cores removidas
      const removedPaths = [];
      if (currentEditingModel && Array.isArray(currentEditingModel.colors)) {
        const before = (currentEditingModel.colors || []).map(c => c.storagePath).filter(Boolean);
        const after = (colorData || []).map(c => c.storagePath).filter(Boolean);
        before.forEach(p => { if (!after.includes(p)) removedPaths.push(p); });
      }

      await firestore.collection('models').doc(id).set(modelData, { merge: true });

      for (const p of removedPaths) { try { await storage.ref(p).delete(); } catch (err) { console.warn('Falha ao excluir', p, err);} }
      alert(`Modelo ${id} salvo com sucesso!`);
      modelForm.reset();
      colorInputsContainer.innerHTML = '';
      specInputsContainer.innerHTML = '';
      currentEditingId = null; currentEditingModel = null;

    } catch (err) {
      console.error(err);
      alert('Falha ao salvar o modelo: ' + (err && err.message ? err.message : err));
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  }, true);

  // Pré-visualização básica de imagens
  colorInputsContainer.addEventListener('change', (e) => {
    const input = e.target;
    if (!(input && input.classList && input.classList.contains('color-image'))) return;
    const group = input.closest('.dynamic-input-group');
    if (!group) return;
    const file = input.files && input.files[0];
    if (!file) return;
    let img = group.querySelector('img.color-preview');
    if (!img) { img = document.createElement('img'); img.className='color-preview'; img.style.height='44px'; img.style.marginLeft='6px'; img.style.borderRadius='4px'; group.appendChild(img); }
    const reader = new FileReader(); reader.onload = () => { img.src = reader.result; }; reader.readAsDataURL(file);
  });
});
