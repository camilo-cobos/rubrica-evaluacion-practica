// registro.js
import {
  auth,
  db,
  createUserWithEmailAndPassword,
  setDoc,
  doc
} from "./firebase-setup.js";

document.getElementById("registroForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const grupo = document.getElementById("grupo").value;
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const mensajeDiv = document.getElementById("mensaje");

  if (!grupo || !email || !password) {
    mostrarMensaje("Por favor completa todos los campos.", "error");
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "usuarios", cred.user.uid), {
      email,
      grupo
    });

    mostrarMensaje("✅ Registro exitoso. Ya puedes iniciar sesión.", "success");
    setTimeout(() => window.location.href = "login.html", 2500);
  } catch (error) {
    let mensaje = "Error al registrar. Intenta nuevamente.";
    if (error.code === "auth/email-already-in-use") mensaje = "Este correo ya está registrado.";
    else if (error.code === "auth/invalid-email") mensaje = "Correo no válido.";
    else if (error.code === "auth/weak-password") mensaje = "La contraseña debe tener al menos 6 caracteres.";

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
