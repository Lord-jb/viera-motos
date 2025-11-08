// Firebase (v9 modular) — bindings locais e reexports
// Garante que app/auth/db existam no ES Module scope.

import { app, auth, db } from '../../../src/config/firebaseConfig.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js';

export const storage = getStorage(app);
export { app, auth, db };
export default { app, auth, db, storage };

