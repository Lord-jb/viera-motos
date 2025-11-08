// Seed de dados demo (ES Modules)
// - Popula coleções com exemplos mínimos para apresentação

import { db } from './modules/firebase.js';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

export async function runSeed() {
  // 1) Banner/Alerta (config/offer)
  await setDoc(doc(db, 'config', 'offer'), {
    text: 'Semana do Cliente: bônus de até R$ 1.000',
    active: true,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  // 2) Catálogo (models)
  const models = [
    {
      id: 'az125-alfa',
      name: 'AZ125 ALFA',
      price: '10.990,00',
      tagline: 'Equilíbrio e economia para o dia a dia',
      colors: [
        { name: 'Azul', imageUrl: 'assets/images/placeholder-moto.svg', storagePath: null },
        { name: 'Preto', imageUrl: 'assets/images/placeholder-moto.svg', storagePath: null },
      ],
      specs: [
        { name: 'Motor', value: '125cc' },
        { name: 'Câmbio', value: '5 marchas' },
      ],
    },
    {
      id: 'az160-xtreme',
      name: 'AZ160 XTREME',
      price: '12.990,00',
      tagline: 'Aventura sem limites',
      colors: [
        { name: 'Laranja', imageUrl: 'assets/images/placeholder-moto.svg', storagePath: null },
        { name: 'Branco', imageUrl: 'assets/images/placeholder-moto.svg', storagePath: null },
      ],
      specs: [
        { name: 'Motor', value: '160cc' },
        { name: 'Partida', value: 'Elétrica' },
      ],
    },
  ];
  for (const m of models) {
    await setDoc(doc(db, 'models', m.id), {
      name: m.name,
      price: m.price,
      tagline: m.tagline,
      colors: m.colors,
      specs: m.specs,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }

  // 3) Leads de exemplo
  await addDoc(collection(db, 'testRides'), {
    name: 'Cliente Demo',
    email: 'cliente@demo.com',
    phone: '(11) 99999-0000',
    modelId: 'az160-xtreme',
    createdAt: serverTimestamp(),
    notes: 'Horário comercial',
  });
  await addDoc(collection(db, 'orderQueries'), {
    name: 'Joana Demo',
    email: 'joana@demo.com',
    phone: '(11) 98888-0000',
    message: 'Condição à vista?',
    createdAt: serverTimestamp(),
  });
}

