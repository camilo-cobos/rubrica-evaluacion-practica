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

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const mensajeDiv = document.getElementById("mensaje");

  if (!email || !password) {
    mostrarMensaje("Por favor ingresa tu correo y contraseña.", "error");
    return;
  }

  try {
    const credencial = await signInWithEmailAndPassword(auth, email, password);
    const uid = credencial.user.uid;

    // Obtener grupo del usuario desde Firestore
    const userDoc = await getDoc(doc(db, "usuarios", uid));

    if (!userDoc.exists()) {
      mostrarMensaje("Usuario registrado pero sin grupo asignado.", "error");
      return;
    }

    const datos = userDoc.data();
    const grupo = datos.grupo;

    // Guardar en localStorage (opcional para usar después)
    localStorage.setItem("grupo", grupo);
    localStorage.setItem("email", email);

    mostrarMensaje("✅ Acceso exitoso. Redirigiendo...", "success");

    // Redirigir al panel de rúbricas después de 2 segundos
    setTimeout(() => {
      window.location.href = "panel-estudiante.html";
    }, 2000);

  } catch (error) {
    console.error("Error de inicio de sesión:", error);
    let mensajeError = "Error al iniciar sesión. Verifica los datos.";
    if (error.code === "auth/user-not-found") {
      mensajeError = "Correo no registrado.";
    } else if (error.code === "auth/wrong-password") {
      mensajeError = "Contraseña incorrecta.";
    } else if (error.code === "auth/invalid-email") {
      mensajeError = "Correo inválido.";
    }
    mostrarMensaje(`❌ ${mensajeError}`, "error");
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
