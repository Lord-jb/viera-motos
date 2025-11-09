// Leads util (v9 modular): expõe window.addLead
import { db } from './firebase-init.js';
import { addDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

(function(){
  if (typeof window === 'undefined') return;
  window.addLead = function addLead(data) {
    const d = data || {};
    const payload = {
      name: d.name || '',
      phone: d.phone || '',
      email: d.email || '',
      model: d.model || d.modelId || null,
      message: d.message || d.notes || null,
      createdAt: serverTimestamp(),
      userAgent: (typeof navigator !== 'undefined' ? navigator.userAgent : null)
    };
    return addDoc(collection(db, 'testRides'), payload);
  };
})();
