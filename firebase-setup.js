// firebase-setup.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDqbbvsipR4zxsk4VPq3k_VbePqpsjD9Hc",
  authDomain: "rubrica-evaluacion.firebaseapp.com",
  projectId: "rubrica-evaluacion",
  storageBucket: "rubrica-evaluacion.firebasestorage.app",
  messagingSenderId: "78519129707",
  appId: "1:78519129707:web:c25124bcbc6e85b6cbc32e"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Exportar todo lo necesario
export {
  // Firestore
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,

  // Authentication
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut
};


