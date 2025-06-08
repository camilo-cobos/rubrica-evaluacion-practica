// login.js
import {
  auth,
  signInWithEmailAndPassword
} from "./firebase-setup.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const mensajeDiv = document.getElementById("mensaje");

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "panel-estudiante.html";
  } catch (error) {
    let mensaje = "Error al iniciar sesión.";
    if (error.code === "auth/user-not-found") mensaje = "Usuario no encontrado.";
    else if (error.code === "auth/wrong-password") mensaje = "Contraseña incorrecta.";
    else if (error.code === "auth/invalid-email") mensaje = "Correo no válido.";
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

