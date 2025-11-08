/*
 * Leads util: expõe window.addLead para enviar leads ao Firestore
 * Campos: name, phone, email, model, message, timestamp
 * Depende de: assets/js/firebase-init.js (variável global 'firestore')
 */

(function(){
  if (typeof window === 'undefined') return;

  function getServerTimestamp() {
    try {
      return (firebase && firebase.firestore && firebase.firestore.FieldValue && firebase.firestore.FieldValue.serverTimestamp)
        ? firebase.firestore.FieldValue.serverTimestamp()
        : null;
    } catch (_) { return null; }
  }

  // Compatível com navegadores sem suporte a async/await
  window.addLead = function addLead(data) {
    if (typeof firestore === 'undefined') return Promise.reject(new Error('Firestore indisponível'));
    var d = data || {};
    var payload = {
      name: d.name || '',
      phone: d.phone || '',
      email: d.email || '',
      model: d.model || d.modelId || null,
      message: d.message || d.notes || null,
      createdAt: getServerTimestamp(),
      userAgent: (typeof navigator !== 'undefined' ? navigator.userAgent : null)
    };
    try {
      return firestore.collection('testRides').add(payload);
    } catch (e) {
      return Promise.reject(e);
    }
  };
})();
