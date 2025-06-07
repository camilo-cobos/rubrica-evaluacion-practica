// panel-estudiante.js
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

import {
  db,
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc
} from "./firebase-setup.js";

const auth = getAuth();
const bienvenida = document.getElementById("bienvenida");
const rubricasContainer = document.getElementById("rubricasContainer");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const uid = user.uid;
  const userDoc = await getDoc(doc(db, "usuarios", uid));

  if (!userDoc.exists()) {
    bienvenida.textContent = "No se encontró la información del usuario.";
    return;
  }

  const datosUsuario = userDoc.data();
  const grupo = datosUsuario.grupo;
  bienvenida.textContent = `Bienvenido/a ${datosUsuario.email} - Grupo ${grupo}`;

  // Cargar rúbricas del grupo
  try {
    const planeacionesRef = collection(db, "rubricas", grupo, "planeaciones");
    const q = query(planeacionesRef, orderBy("timestamp", "desc"));
    const snap = await getDocs(q);

    if (snap.empty) {
      rubricasContainer.innerHTML = "<p>No hay rúbricas calificadas aún.</p>";
      return;
    }

    const rubricasHTML = snap.docs.map((docSnap, index) => {
      const datos = docSnap.data();
      return `
        <div class="card">
          <h3>📝 Planeación ${index + 1}</h3>
          <p><strong>📅 Fecha:</strong> ${new Date(datos.fechaEvaluacion).toLocaleDateString("es-ES")}</p>
          <table>
            <thead>
              <tr>
                <th>Criterio</th>
                <th>Puntos</th>
                <th>Nivel</th>
                <th>Descripción</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              ${datos.criterios.map(c => `
                <tr>
                  <td>${c.nombre}</td>
                  <td>${c.puntos}</td>
                  <td>${c.nivel}</td>
                  <td>${c.descripcion || '-'}</td>
                  <td>${c.observaciones || '-'}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <p><strong>Puntuación total:</strong> ${datos.puntuacionTotal.toFixed(1)} / 100</p>
          <p><strong>Resultado:</strong> ${datos.concepto}</p>
        </div>
      `;
    }).join("<hr style='margin:40px 0;'>");

    rubricasContainer.innerHTML = rubricasHTML;
  } catch (error) {
    console.error("Error al cargar rúbricas:", error);
    rubricasContainer.innerHTML = "<p>Error al cargar las rúbricas.</p>";
  }
});

// Cerrar sesión
document.getElementById("cerrarSesion").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
});
