import { db, collection, getDocs, query, orderBy } from "./firebase-setup.js";

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

  const rubricasHTML = planeaciones.map((datos, index) => `
    <div class="rubrica-container">
      <h2 class="rubrica-title">Planeación ${index + 1}</h2>
      <div class="rubrica-info">
        <p><strong>Grupo:</strong> ${grupo}</p>
        <p><strong>Integrantes:</strong> ${integrantes[grupo]}</p>
        <p><strong>Fecha de evaluación:</strong> ${new Date(datos.fechaEvaluacion).toLocaleDateString('es-ES')}</p>
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
              <td>${criterio.descripcion}</td>
              <td>${criterio.observaciones || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="resultado-final">
        <p><strong>Puntuación total:</strong> ${datos.puntuacionTotal.toFixed(1)} / 100</p>
        <p><strong>Resultado:</strong> ${datos.concepto}</p>
      </div>
    </div>
  `).join('<hr style="margin:40px 0;">');

  document.body.innerHTML = `
    <div class="rubrica-historial">
      <h1>Historial de Rúbricas - ${grupo}</h1>
      ${rubricasHTML}
      <button onclick="window.location.href='index.html'" style="margin-top: 30px;">
        Volver al inicio
      </button>
    </div>
  `;
}

// Acceso profesor
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

