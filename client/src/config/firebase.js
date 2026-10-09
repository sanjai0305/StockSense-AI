import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC-Qf9zy_L9p_GQFNvBvYgEQLybk0W_LPs",
  authDomain: "webdev-8d332.firebaseapp.com",
  projectId: "webdev-8d332",
  storageBucket: "webdev-8d332.firebasestorage.app",
  messagingSenderId: "264729603291",
  appId: "1:264729603291:web:97bece78fc475723adf0fe",
  measurementId: "G-8TK74BJXVR"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
