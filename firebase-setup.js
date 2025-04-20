// firebase-setup.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDqbbvsipR4zxsk4VPq3k_VbePqpsjD9Hc",
  authDomain: "rubrica-evaluacion.firebaseapp.com",
  projectId: "rubrica-evaluacion",
  storageBucket: "rubrica-evaluacion.firebasestorage.app",
  messagingSenderId: "78519129707",
  appId: "1:78519129707:web:c25124bcbc6e85b6cbc32e"
};

// Inicializa Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Exporta la base de datos
export { db, doc, getDoc, setDoc };
