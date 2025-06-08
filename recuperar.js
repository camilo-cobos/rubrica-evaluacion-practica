import {
  getAuth,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

const auth = getAuth();

document.getElementById("recuperarForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const mensaje = document.getElementById("mensaje");

  try {
    await sendPasswordResetEmail(auth, email);
    mensaje.textContent = "✅ Revisa tu correo para restablecer tu contraseña.";
    mensaje.className = "message success";
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    let texto = "❌ Error al enviar correo.";
    if (error.code === "auth/user-not-found") {
      texto = "❌ Correo no registrado.";
    }
    mensaje.textContent = texto;
    mensaje.className = "message error";
  }

  setTimeout(() => mensaje.textContent = "", 5000);
});
