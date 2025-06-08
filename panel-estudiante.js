// panel-estudiante.js
import {
  auth,
  onAuthStateChanged,
  signOut,
  db,
  doc,
  getDoc,
  collection,
  getDocs,
  orderBy,
  query
} from "./firebase-setup.js";

const bienvenida = document.getElementById("bienvenida");
const rubricasContainer = document.getElementById("rubricasContainer");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const uid = user.uid;
  const userRef = doc(db, "usuarios", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    bienvenida.textContent = "No se encontró tu grupo asignado.";
    return;
  }

  const { grupo, email } = userSnap.data();
  bienvenida.textContent = `Bienvenido/a ${email} - Grupo ${grupo}`;

  try {
    const rubricasRef = collection(db, "rubricas", grupo, "planeaciones");
    const q = query(rubricasRef, orderBy("timestamp", "desc"));
    const snap = await getDocs(q);

    if (snap.empty) {
      rubricasContainer.innerHTML = "<p>No hay rúbricas aún.</p>";
      return;
    }

    const html = snap.docs.map((docSnap, i) => {
      const datos = docSnap.data();
      return `
        <div class="card">
          <h3>📝 Planeación ${i + 1}</h3>
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
                  <td>${c.descripcion || "-"}</td>
                  <td>${c.observaciones || "-"}</td>
                </tr>`).join("")}
            </tbody>
          </table>
          <p><strong>Puntuación total:</strong> ${datos.puntuacionTotal.toFixed(1)} / 100</p>
          <p><strong>Resultado:</strong> ${datos.concepto}</p>
        </div>
      `;
    }).join("<hr style='margin:30px 0;'>");

    rubricasContainer.innerHTML = html;
  } catch (error) {
    console.error("Error al cargar rúbricas:", error);
    rubricasContainer.innerHTML = "<p>Error al cargar las rúbricas.</p>";
  }
});

document.getElementById("cerrarSesion").addEventListener("click", () => {
  signOut(auth).then(() => window.location.href = "index.html");
});

