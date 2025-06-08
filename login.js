import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

const auth = getAuth();

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const mensaje = document.getElementById("mensaje");

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "panel-estudiante.html";
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    let texto = "❌ Error al iniciar sesión.";
    if (error.code === "auth/user-not-found") {
      texto = "❌ Usuario no registrado.";
    } else if (error.code === "auth/wrong-password") {
      texto = "❌ Contraseña incorrecta.";
    }
    mensaje.textContent = texto;
    mensaje.className = "message error";
    setTimeout(() => mensaje.textContent = "", 3500);
  }
});
