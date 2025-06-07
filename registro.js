import {
  getAuth,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

import {
  db,
  doc,
  setDoc
} from "./firebase-setup.js";

// Inicializa Firebase Auth
const auth = getAuth();

// Manejador del formulario
document.getElementById("registroForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const grupo = document.getElementById("grupo").value;
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const mensajeDiv = document.getElementById("mensaje");

  // Validaciones básicas
  if (!grupo || !email || !password) {
    mostrarMensaje("Por favor completa todos los campos.", "error");
    return;
  }

  try {
    // Crea el usuario en Firebase Auth
    const credencial = await createUserWithEmailAndPassword(auth, email, password);

    // Guarda la información adicional en Firestore
    await setDoc(doc(db, "usuarios", credencial.user.uid), {
      email,
      grupo
    });

    mostrarMensaje("✅ Registro exitoso. Ahora puedes iniciar sesión.", "success");

    // Redirigir después de unos segundos
    setTimeout(() => {
      window.location.href = "index.html";
    }, 2500);

  } catch (error) {
    console.error("Error de registro:", error);
    let mensajeError = "Error al registrar. Intenta nuevamente.";
    if (error.code === "auth/email-already-in-use") {
      mensajeError = "El correo ya está registrado.";
    } else if (error.code === "auth/weak-password") {
      mensajeError = "La contraseña debe tener al menos 6 caracteres.";
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
