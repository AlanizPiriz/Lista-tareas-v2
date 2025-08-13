// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAduw3rNK7888j3YJ6h1JhG8HRxq2cubwo",
  authDomain: "tareas-celemyr.firebaseapp.com",
  projectId: "tareas-celemyr",
  storageBucket: "tareas-celemyr.firebasestorage.app",
  messagingSenderId: "665957687992",
  appId: "1:665957687992:web:685172daa7d1eeba4a4a4d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messaging = getMessaging(app);

export { db, messaging, getToken, onMessage };
