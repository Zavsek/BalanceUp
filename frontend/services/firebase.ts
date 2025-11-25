import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {

  apiKey: "AIzaSyABlyPWAytMlo6Ad7ybvWNZ6xtBVrC2WHQ",
  authDomain: "balanceup-85fcc.firebaseapp.com",
  projectId: "balanceup-85fcc",
  storageBucket: "balanceup-85fcc.firebasestorage.app",
  messagingSenderId: "273147254316",
  appId: "1:273147254316:web:87e7a15a1b9b7825fb2389",
  measurementId: "G-4M6K86HKQE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;
