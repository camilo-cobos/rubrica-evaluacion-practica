// script.js actualizado con login por correo para estudiantes y contraseña fija para profesores

import {
  db,
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  arrayUnion
} from "./firebase-setup.js";

import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

const auth = getAuth();

// Acceso al formulario de login
const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
      showMessage('Por favor completa todos los campos', 'error');
      return;
    }

    try {
      const credencial = await signInWithEmailAndPassword(auth, email, password);
      window.location.href = 'panel-estudiante.html';
    } catch (error) {
      console.error("Error de login:", error);
      let mensaje = "❌ Error al iniciar sesión.";
      if (error.code === "auth/user-not-found") mensaje = "❌ Usuario no encontrado.";
      else if (error.code === "auth/wrong-password") mensaje = "❌ Contraseña incorrecta.";
      else if (error.code === "auth/invalid-email") mensaje = "❌ Correo inválido.";
      showMessage(mensaje, 'error');
    }
  });
}

function showMessage(text, type) {
  const messageDiv = document.getElementById('message');
  if (!messageDiv) return;
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  setTimeout(() => {
    messageDiv.textContent = '';
    messageDiv.className = 'message';
  }, 3000);
}

// Acceso para profesores con contraseña fija
window.mostrarLoginProfesor = function () {
  document.getElementById("loginProfesor").style.display = "block";
};

window.verificarAccesoProfesor = function () {
  const CONTRASEÑA_PROFESOR = "Av@nZ4nD0H@C&1!a3lFuTuR0";
  const inputPassword = document.getElementById("profesorPassword").value;
  const mensaje = document.getElementById("mensajeProfesor");

  if (inputPassword === CONTRASEÑA_PROFESOR) {
    window.location.href = "profesor/index.html";
  } else {
    mensaje.textContent = "Contraseña incorrecta. Intente nuevamente.";
    setTimeout(() => mensaje.textContent = "", 3000);
  }
};






