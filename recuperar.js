// recuperar.js
import {
  auth,
  sendPasswordResetEmail
} from "./firebase-setup.js";

document.getElementById("recuperarForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const mensajeDiv = document.getElementById("mensaje");

  try {
    await sendPasswordResetEmail(auth, email);
    mostrarMensaje("✅ Se envió un enlace de recuperación a tu correo.", "success");
  } catch (error) {
    let mensaje = "No se pudo enviar el enlace.";
    if (error.code === "auth/user-not-found") mensaje = "Correo no registrado.";
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

