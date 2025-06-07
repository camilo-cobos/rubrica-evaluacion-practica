// login.js
import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

import {
  db,
  doc,
  getDoc
} from "./firebase-setup.js";

const auth = getAuth();

// Evento del formulario de inicio de sesión
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const mensajeDiv = document.getElementById("mensaje");

  if (!email || !password) {
    mostrarMensaje("Por favor completa todos los campos.", "error");
    return;
  }

  try {
    // Inicia sesión con Firebase Auth
    const credencial = await signInWithEmailAndPassword(auth, email, password);
    const uid = credencial.user.uid;

    // Consulta el grupo del usuario desde Firestore
    const docRef = doc(db, "usuarios", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const datos = docSnap.data();
      const grupo = datos.grupo;

      // Redirige a la página de visualización de rúbricas (index.html antiguo)
      window.location.href = `index.html?grupo=${grupo}&uid=${uid}`;
    } else {
      mostrarMensaje("Usuario no registrado correctamente en la base de datos.", "error");
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    let mensaje = "Error al iniciar sesión. Verifica tu correo y contraseña.";
    if (error.code === "auth/user-not-found") {
      mensaje = "Usuario no encontrado.";
    } else if (error.code === "auth/wrong-password") {
      mensaje = "Contraseña incorrecta.";
    }
    mostrarMensaje(`❌ ${mensaje}`, "error");
  }
});

function mostrarMensaje(texto, tipo) {
  const div = document.getElementById("mensaje");
  div.textContent = texto;
  div.className = `message ${tipo}`;
  setTimeout(() => {
    div.textContent = "";
    div.className = "message";
  }, 3500);
}
