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
    const q = query(planeacionesRef, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      showMessage("Aún no hay rúbricas disponibles para este grupo", "error");
      return;
    }

    const planeaciones = [];
    snapshot.forEach(doc => planeaciones.push(doc.data()));
    mostrarHistorial(grupo, planeaciones);
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

function mostrarHistorial(grupo, planeaciones) {
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

  const rubricasHTML = planeaciones.map((datos, index) => {
  const comentarios = datos.comentarios || [];

  const comentariosHTML = comentarios.map(c => `
    <div class="comentario">
      <strong>${c.autor}:</strong> ${c.mensaje}
    </div>
  `).join("");

  return `
    <div class="card rubrica-card" id="rubrica-${grupo}-${index}">
      <h2 class="rubrica-title">Planeación ${index + 1}</h2>
      <div class="rubrica-info">
        <p><strong>Grupo:</strong> ${grupo}</p>
        <p><strong>Integrantes:</strong> ${integrantes[grupo]}</p>
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
        <button onclick="descargarPDF('rubrica-${grupo}-${index}')" class="pdf-button">
          📄 Descargar PDF
        </button>
      </div>

      <div class="comentarios-container">
        <h4>💬 Comentarios</h4>
        ${comentariosHTML || "<p>No hay comentarios aún.</p>"}
        <textarea placeholder="Escribe tu comentario aquí..." id="comentario-${index}" rows="2" style="width:100%; margin-top:10px;"></textarea>
        <button onclick="guardarComentario('${grupo}', ${index})" style="margin-top:10px;">Enviar comentario</button>
      </div>
    </div>
  `;
}).join('');


  document.getElementById("contenido").innerHTML = `
    <div class="rubrica-historial">
      <h1>Historial de Rúbricas - ${grupo}</h1>
      ${rubricasHTML}
      <h2 style="margin-top:40px;">📄 Protocolos Calificados</h2>
      <div id="protocolosContainer"><p>Cargando protocolos...</p></div>
      <button onclick="window.location.href='index.html'" style="margin-top: 30px;">
        Volver al inicio
      </button>
    </div>
  `;

  // Cargar protocolos al final
  cargarProtocolos(grupo);
}


// calificar protocolos

async function cargarProtocolos(grupo) {
  const container = document.getElementById("protocolosContainer");

  try {
    const protocolosRef = collection(db, "rubricas", grupo, "protocolos");
    const q = query(protocolosRef, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      container.innerHTML = "<p>No hay protocolos calificados aún.</p>";
      return;
    }

    const protocolosHTML = snapshot.docs.map((doc, index) => {
      const datos = doc.data();
      return `
        <div class="card">
          <h3>📄 Protocolo ${index + 1}</h3>
          <p><strong>🗓️ Fecha de evaluación:</strong> ${new Date(datos.fechaEvaluacion).toLocaleDateString('es-ES')}</p>
          <table>
            <thead>
              <tr>
                <th>Criterio</th>
                <th>Puntos</th>
                <th>Nivel</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              ${datos.criterios.map(c => `
                <tr>
                  <td>${c.nombre}</td>
                  <td>${c.puntos}</td>
                  <td>${c.nivel}</td>
                  <td>${c.observaciones || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="resultado-final">
            <p><strong>Puntuación total:</strong> ${datos.puntuacionTotal.toFixed(1)} / 100</p>
            <p><strong>Resultado:</strong> ${datos.concepto}</p>
          </div>
        </div>
      `;
    }).join("<hr style='margin:40px 0;'>");

    container.innerHTML = protocolosHTML;
  } catch (error) {
    console.error("Error al cargar protocolos:", error);
    container.innerHTML = "<p>Error al cargar protocolos.</p>";
  }
}


window.guardarComentario = async function(grupo, index) {
  const comentarioInput = document.getElementById(`comentario-${index}`);
  const mensaje = comentarioInput.value.trim();
  if (!mensaje) return alert("El comentario no puede estar vacío.");

  try {
    const planeacionesRef = collection(db, "rubricas", grupo, "planeaciones");
    const q = query(planeacionesRef, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    const documentos = snapshot.docs;

    if (documentos[index]) {
      const docRef = doc(db, "rubricas", grupo, "planeaciones", documentos[index].id);
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


// Acceso para profesores
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

window.descargarPDF = function(idElemento) {
  const element = document.getElementById(idElemento);
  const opt = {
    margin:       0.3,
    filename:     `${idElemento}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };
  html2pdf().set(opt).from(element).save();
};

