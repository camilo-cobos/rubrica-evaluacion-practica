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
  query,
  updateDoc,
  arrayUnion
} from "./firebase-setup.js";

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

  await cargarRubricas(grupo);
});

async function cargarRubricas(grupo) {
  try {
    const planeacionesRef = collection(db, "rubricas", grupo, "planeaciones");
    const protocolosRef = collection(db, "rubricas", grupo, "protocolos");

    const [planeacionesSnap, protocolosSnap] = await Promise.all([
      getDocs(query(planeacionesRef, orderBy("timestamp", "desc"))),
      getDocs(query(protocolosRef, orderBy("timestamp", "desc")))
    ]);

    const planeaciones = planeacionesSnap.docs.map((doc) => doc.data());
    const protocolos = protocolosSnap.docs.map((doc) => doc.data());

    const selects = `
      <h2>📑 Planeaciones Calificadas</h2>
      <select onchange="mostrarSeleccionado(this, 'planeacion')">
        <option value="">-- Selecciona una planeación --</option>
        ${planeaciones.map((p, i) => `<option value="planeacion-${i}">Planeación ${i + 1} (${new Date(p.fechaEvaluacion).toLocaleDateString('es-ES')})</option>`).join("")}
      </select>

      <h2 style="margin-top:40px;">📄 Protocolos Calificados</h2>
      <select onchange="mostrarSeleccionado(this, 'protocolo')">
        <option value="">-- Selecciona un protocolo --</option>
        ${protocolos.map((p, i) => `<option value="protocolo-${i}">Protocolo ${i + 1} (${new Date(p.fechaEvaluacion).toLocaleDateString('es-ES')})</option>`).join("")}
      </select>
    `;

    const planeacionesHTML = planeaciones.map((datos, index) => renderRubrica(datos, grupo, index, "planeacion")).join("");
    const protocolosHTML = protocolos.map((datos, index) => renderRubrica(datos, grupo, index, "protocolo")).join("");

    rubricasContainer.innerHTML = selects + planeacionesHTML + protocolosHTML;
  } catch (error) {
    console.error("Error al cargar rúbricas:", error);
    rubricasContainer.innerHTML = "<p>Error al cargar las rúbricas.</p>";
  }
}

function renderRubrica(datos, grupo, index, tipo) {
  const comentarios = datos.comentarios || [];
  const comentariosHTML = comentarios.map(c => `
    <div class="comentario">
      <strong>${c.autor}:</strong> ${c.mensaje}
    </div>
  `).join("");

  const rubricaId = `${tipo}-${index}`;

  return `
    <div class="card rubrica-card" id="${rubricaId}" style="display:none; width: 100%;">
      <h3>${tipo === 'planeacion' ? '📝 Planeación' : '📄 Protocolo'} ${index + 1}</h3>
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

      ${tipo === 'planeacion' ? `
      <div class="comentarios-container">
        <h4>💬 Comentarios</h4>
        ${comentariosHTML || "<p>No hay comentarios aún.</p>"}
        <textarea placeholder="Escribe tu comentario aquí..." id="comentario-${index}" rows="2" style="width:100%; margin-top:10px;"></textarea>
        <button onclick="guardarComentario('${grupo}', ${index})" style="margin-top:10px;">Enviar comentario</button>
      </div>` : ''}
    </div>
  `;
}

window.mostrarSeleccionado = function(select, tipo) {
  const all = document.querySelectorAll(`.rubrica-card[id^='${tipo}']`);
  all.forEach(div => div.style.display = "none");

  const selectedId = select.value;
  if (selectedId) {
    document.getElementById(selectedId).style.display = "block";
  }
};

window.guardarComentario = async function(grupo, index) {
  const comentarioInput = document.getElementById(`comentario-${index}`);
  const mensaje = comentarioInput.value.trim();
  if (!mensaje) return alert("El comentario no puede estar vacío.");

  try {
    const ref = collection(db, "rubricas", grupo, "planeaciones");
    const q = query(ref, orderBy("timestamp", "desc"));
    const snap = await getDocs(q);
    const docs = snap.docs;

    if (docs[index]) {
      const docRef = doc(db, "rubricas", grupo, "planeaciones", docs[index].id);
      await updateDoc(docRef, {
        comentarios: arrayUnion({ autor: "Estudiante", mensaje })
      });
      alert("Comentario enviado con éxito.");
      comentarioInput.value = "";
    } else {
      alert("No se encontró la planeación.");
    }
  } catch (error) {
    console.error("Error al guardar el comentario:", error);
    alert("Error al guardar el comentario.");
  }
};

document.getElementById("cerrarSesion").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
});


