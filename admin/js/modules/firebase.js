// Reexporta o app/auth/db do firebaseConfig central (mesma base do projeto)
export { app, auth, db } from '../../../src/config/firebaseConfig.js';
// Storage opcional: se precisar usar, importe diretamente do SDK e crie a partir do app.
// Mantemos export default compatível
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js';
import { app as _app } from '../../../src/config/firebaseConfig.js';
export const storage = getStorage(_app);
export default { app: _app, auth, db, storage };
