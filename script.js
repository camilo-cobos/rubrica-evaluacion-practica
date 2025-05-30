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

const CONTRASEÑAS = {
  "Grupo1": ["20231245017", "20231245010"],
  "Grupo2": ["20231245022", "20231245013"],
  "Grupo3": ["20231245042", "20231245023"],
  "Grupo4": ["20231245031", "20231245032"],
  "Grupo5": ["20231245054", "2023124502"],
  "Grupo6": ["20231245008", "20231245012"],
  "Grupo7": ["20231245046", "20231245030"],
  "Grupo8": ["20231245024", "20211245023"],
  "Grupo9": ["9914506"],
  "Grupo10": ["20222245040", "20222245010"]
};

document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const grupo = document.getElementById('grupo').value;
  const password = document.getElementById('password').value;

  if (!grupo || !password) {
    showMessage('Por favor completa todos los campos', 'error');
    return;
  }

  if (!CONTRASEÑAS[grupo].includes(password)) {
    showMessage('Contraseña incorrecta para este grupo', 'error');
    return;
  }

  try {
    const planeacionesRef = collection(db, "rubricas", grupo, "planeaciones");
    const qPlaneaciones = query(planeacionesRef, orderBy("timestamp", "desc"));
    const snapPlaneaciones = await getDocs(qPlaneaciones);

    const planeaciones = [];
    snapPlaneaciones.forEach(doc => planeaciones.push({ id: doc.id, ...doc.data() }));

    const protocolosRef = collection(db, "rubricas", grupo, "protocolos");
    const qProtocolos = query(protocolosRef, orderBy("timestamp", "desc"));
    const snapProtocolos = await getDocs(qProtocolos);

    const protocolos = [];
    snapProtocolos.forEach(doc => protocolos.push({ id: doc.id, ...doc.data() }));

    mostrarHistorial(grupo, planeaciones, protocolos);
  } catch (error) {
    console.error("Error al consultar las rúbricas:", error);
    showMessage("Error al obtener las rúbricas", "error");
  }
});

function showMessage(text, type) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  setTimeout(() => {
    messageDiv.textContent = '';
    messageDiv.className = 'message';
  }, 3000);
}

function mostrarHistorial(grupo, planeaciones, protocolos) {
  const integrantes = {
    "Grupo1": "Paula y Julieth",
    "Grupo2": "Estefania y Thalia",
    "Grupo3": "María José y Santiago",
    "Grupo4": "Jhon Jairo y William",
    "Grupo5": "Jeidy y Stip",
    "Grupo6": "Daniel y Nataly",
    "Grupo7": "Laura y Iris",
    "Grupo8": "Ana y Andrés",
    "Grupo9": "Carlos",
    "Grupo10": "Nicole y Jean Paul"
  };

  document.getElementById("contenido").innerHTML = `
    <div class="rubrica-historial">
      <h1>Historial de Rúbricas - ${grupo}</h1>
      
      <h2>📑 Planeaciones Calificadas</h2>
      <select onchange="mostrarSeleccionado(this, 'planeacion')">
        <option value="">-- Selecciona una planeación --</option>
        ${planeaciones.map((p, i) => `<option value="planeacion-${i}">Planeación ${i + 1} (${new Date(p.fechaEvaluacion).toLocaleDateString('es-ES')})</option>`).join("")}
      </select>
      ${planeaciones.map((datos, index) => renderRubrica(grupo, integrantes[grupo], datos, index, 'planeacion')).join('')}

      <h2 style="margin-top:40px;">📄 Protocolos Calificados</h2>
      <select onchange="mostrarSeleccionado(this, 'protocolo')">
        <option value="">-- Selecciona un protocolo --</option>
        ${protocolos.map((p, i) => `<option value="protocolo-${i}">Protocolo ${i + 1} (${new Date(p.fechaEvaluacion).toLocaleDateString('es-ES')})</option>`).join("")}
      </select>
      ${protocolos.map((datos, index) => renderRubrica(grupo, integrantes[grupo], datos, index, 'protocolo')).join('')}

      <button onclick="window.location.href='index.html'" style="margin-top: 30px;">
        Volver al inicio
      </button>
    </div>
  `;
}

function renderRubrica(grupo, integrantes, datos, index, tipo) {
  const comentarios = datos.comentarios || [];
  const comentariosHTML = comentarios.map(c => `
    <div class="comentario">
      <strong>${c.autor}:</strong> ${c.mensaje}
    </div>
  `).join("");

  const rubricaId = `${tipo}-${index}`;

  return `
    <div class="card rubrica-card" id="${rubricaId}" style="display:none;">
      <h2 class="rubrica-title">${tipo === 'planeacion' ? 'Planeación' : 'Protocolo'} ${index + 1}</h2>
      <div class="rubrica-info">
        <p><strong>Grupo:</strong> ${grupo}</p>
        <p><strong>Integrantes:</strong> ${integrantes}</p>
        <p><strong>🗓️ Fecha de evaluación:</strong> ${new Date(datos.fechaEvaluacion).toLocaleDateString('es-ES')}</p>
      </div>
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
          ${datos.criterios.map(criterio => `
            <tr>
              <td>${criterio.nombre}</td>
              <td>${criterio.puntos}</td>
              <td class="${criterio.nivel.toLowerCase()}">${criterio.nivel}</td>
              <td>${criterio.descripcion || '-'}</td>
              <td>${criterio.observaciones || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="resultado-final">
        <p><strong>Puntuación total:</strong> ${datos.puntuacionTotal.toFixed(1)} / 100</p>
        <p><strong>Resultado:</strong> ${datos.concepto}</p>
      </div>
      <div style="margin-top:15px;">
        <button onclick="descargarPDF('${rubricaId}')" class="pdf-button">
          📄 Descargar PDF
        </button>
      </div>
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

window.descargarPDF = function(idElemento) {
  const element = document.getElementById(idElemento);
  const clone = element.cloneNode(true);
  clone.style.width = "1000px";
  clone.style.padding = "20px";
  clone.style.backgroundColor = "#fff";
  clone.style.position = "absolute";
  clone.style.left = "-9999px";
  document.body.appendChild(clone);

  const opt = {
    margin:       0.3,
    filename:     `${idElemento}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };

  html2pdf().set(opt).from(clone).save().then(() => {
    document.body.removeChild(clone);
  });
};

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





