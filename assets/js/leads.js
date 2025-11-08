/*
 * Leads util: expõe window.addLead para enviar leads ao Firestore
 * Campos: name, phone, email, model, message, timestamp
 * Depende de: assets/js/firebase-init.js (variável global 'firestore')
 */

(function(){
  if (typeof window === 'undefined') return;
  window.addLead = async function addLead(data) {
    if (typeof firestore === 'undefined') throw new Error('Firestore indisponível');
    const payload = {
      name: data.name || '',
      phone: data.phone || '',
      email: data.email || '',
      model: data.model || data.modelId || null,
      message: data.message || data.notes || null,
      createdAt: (firebase && firebase.firestore && firebase.firestore.FieldValue && firebase.firestore.FieldValue.serverTimestamp) ? firebase.firestore.FieldValue.serverTimestamp() : null,
      userAgent: (typeof navigator !== 'undefined' ? navigator.userAgent : null),
    };
    // Armazena em testRides para manter compatibilidade com o admin atual
    return firestore.collection('testRides').add(payload);
  };
})();

