// Admin auth guard: restrição por lista de emails em config/admins { emails: [] }
document.addEventListener('DOMContentLoaded', () => {
  auth.onAuthStateChanged(async (user) => {
    if (!user) return;
    try {
      const doc = await firestore.collection('config').doc('admins').get();
      if (!doc.exists) return; // sem restrição
      const list = Array.isArray((doc.data()||{}).emails) ? doc.data().emails : [];
      if (!list.includes(user.email)) {
        alert('Seu usuário não tem permissão de acesso ao painel.');
        await auth.signOut();
      }
    } catch (e) {
      console.warn('Falha ao validar admins:', e);
    }
  });
});

