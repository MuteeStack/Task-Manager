import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyD-63cCbWGde6pG3Y9WOpLaV7WlriBFMkU",
  authDomain: "task-manager-b32ac.firebaseapp.com",
  databaseURL: "https://task-manager-b32ac-default-rtdb.firebaseio.com",
  projectId: "task-manager-b32ac",
  storageBucket: "task-manager-b32ac.firebasestorage.app",
  messagingSenderId: "45224753095",
  appId: "1:45224753095:web:a81342387d1f5d35a24be2",
  measurementId: "G-8YQ2LSNXS1"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

// Use emulators in development (uncomment if needed)
// if (import.meta.env.DEV) {
//   connectAuthEmulator(auth, 'http://localhost:9099');
//   connectDatabaseEmulator(db, 'localhost', 9000);
// }
