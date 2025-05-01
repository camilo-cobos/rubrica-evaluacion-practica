import {
  db,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  query
} from "../firebase-setup.js";

// ---------------------------
// Criterios de Planeaciones
// ---------------------------
const CRITERIOS_PLANEACION = [
  { nombre: "Objetivos", puntos: 15 },
  { nombre: "Justificación", puntos: 10 },
  { nombre: "Marco teórico", puntos: 15 },
  { nombre: "Descripción y recursos", puntos: 20 },
  { nombre: "Funciones semióticas", puntos: 10 },
  { nombre: "Metodología (Resolución de Problemas)", puntos: 15 },
  { nombre: "Evaluación de la clase", puntos: 15 }
];

// ---------------------------
// Criterios de Protocolos
// ---------------------------
const CRITERIOS_PROTOCOLO = [
  { nombre: "Redacción y Formato", niveles: {
      "Sobresaliente": { puntos: 25, descripcion: "Redacción impecable, formato coherente con normas." },
      "Notable": { puntos: 22, descripcion: "Buena redacción y formato adecuado." },
      "Aprobado": { puntos: 18, descripcion: "Algunos errores de redacción o formato." },
      "Insuficiente": { puntos: 12, descripcion: "Redacción confusa y formato inadecuado." }
    }
  },
  { nombre: "Análisis de la Actividad", niveles: {
      "Sobresaliente": { puntos: 25, descripcion: "Análisis profundo, relaciona teoría y resultados." },
      "Notable": { puntos: 22, descripcion: "Buen análisis, aunque puede profundizar más." },
      "Aprobado": { puntos: 18, descripcion: "Análisis superficial o incompleto." },
      "Insuficiente": { puntos: 12, descripcion: "No hay análisis claro ni relación con resultados." }
    }
  },
  { nombre: "Análisis Funciones Semióticas", niveles: {
      "Sobresaliente": { puntos: 25, descripcion: "Uso claro y coherente de funciones semióticas." },
      "Notable": { puntos: 22, descripcion: "Buen uso de funciones, con algunas imprecisiones." },
      "Aprobado": { puntos: 18, descripcion: "Reconoce funciones, pero sin claridad." },
      "Insuficiente": { puntos: 12, descripcion: "No se evidencia uso ni análisis semiótico." }
    }
  },
  { nombre: "Evaluación", niveles: {
      "Sobresaliente": { puntos: 25, descripcion: "Evalúa críticamente la clase y propone mejoras." },
      "Notable": { puntos: 22, descripcion: "Evalúa con claridad, pero sin proyección." },
      "Aprobado": { puntos: 18, descripcion: "Menciona aspectos evaluativos sin análisis." },
      "Insuficiente": { puntos: 12, descripcion: "No hay evaluación ni reflexión." }
    }
  }
];

// ---------------------------
// Mostrar formularios
// ---------------------------
window.mostrarFormularioPlaneacion = function () {
  document.getElementById("formulario").innerHTML = generarFormularioPlaneacion();
};

window.mostrarFormularioProtocolo = function () {
  document.getElementById("formulario").innerHTML = generarFormularioProtocolo();
};

// ---------------------------
// Formulario de Planeaciones
// ---------------------------
function generarFormularioPlaneacion(criteriosGuardados = null) {
  const criteriosFinales = criteriosGuardados || CRITERIOS_PLANEACION.map(c => ({
    ...c,
    nivel: "",
    observaciones: ""
  }));

  const criteriosHTML = criteriosFinales.map((criterio, i) => `
    <fieldset>
      <legend><strong>${criterio.nombre}</strong></legend>
      <div class="form-group">
        <label>Nivel:</label>
        <select id="nivel-${i}" required data-puntos="${criterio.puntos}" class="nivel-select">
          <option value="">-- Selecciona --</option>
          <option value="Excelente" ${criterio.nivel === "Excelente" ? "selected" : ""}>Excelente</option>
          <option value="Satisfactorio" ${criterio.nivel === "Satisfactorio" ? "selected" : ""}>Satisfactorio</option>
          <option value="Insuficiente" ${criterio.nivel === "Insuficiente" ? "selected" : ""}>Insuficiente</option>
        </select>
      </div>
      <div class="form-group">
        <label>Observaciones personales:</label>
        <input type="text" id="observaciones-${i}" value="${criterio.observaciones || ""}" />
      </div>
    </fieldset>
  `).join("");

  return `
    <form id="formularioRubrica" data-tipo="planeaciones" data-total="${criteriosFinales.length}">
      ${criteriosHTML}
      <div class="form-group">
        <label for="fechaEvaluacion">Fecha de evaluación:</label>
        <input type="date" id="fechaEvaluacion" required />
      </div>
      <div class="form-group">
        <label for="puntuacionTotal">Puntuación total:</label>
        <input type="number" id="puntuacionTotal" readonly />
      </div>
      <div class="form-group">
        <label for="concepto">Resultado:</label>
        <input type="text" id="concepto" readonly />
      </div>
      <button type="submit">Guardar Rúbrica</button>
    </form>
  `;
}

// ---------------------------
// Formulario de Protocolos
// ---------------------------
function generarFormularioProtocolo() {
  const criteriosHTML = CRITERIOS_PROTOCOLO.map((criterio, i) => `
    <fieldset>
      <legend><strong>${criterio.nombre}</strong></legend>
      <div class="form-group">
        <label>Nivel:</label>
        <select id="nivel-${i}" required data-index="${i}" class="nivel-protocolo" data-nombre="${criterio.nombre}">
          <option value="">-- Selecciona --</option>
          <option value="Sobresaliente">Sobresaliente</option>
          <option value="Notable">Notable</option>
          <option value="Aprobado">Aprobado</option>
          <option value="Insuficiente">Insuficiente</option>
        </select>
      </div>
      <div class="form-group">
        <label>Descripción:</label>
        <input type="text" id="descripcion-${i}" readonly />
      </div>
      <div class="form-group">
        <label>Observaciones personales:</label>
        <input type="text" id="observaciones-${i}" />
      </div>
    </fieldset>
  `).join("");

  return `
    <form id="formularioRubrica" data-tipo="protocolos" data-total="${CRITERIOS_PROTOCOLO.length}">
      ${criteriosHTML}
      <div class="form-group">
        <label for="fechaEvaluacion">Fecha de evaluación:</label>
        <input type="date" id="fechaEvaluacion" required />
      </div>
      <div class="form-group">
        <label for="puntuacionTotal">Puntuación total:</label>
        <input type="number" id="puntuacionTotal" readonly />
      </div>
      <div class="form-group">
        <label for="concepto">Resultado:</label>
        <input type="text" id="concepto" readonly />
      </div>
      <button type="submit">Guardar Rúbrica</button>
    </form>
  `;
}

// ---------------------------
// Lógica de guardado
// ---------------------------
let idRúbricaAEditar = null;

async function guardarRubricaPlaneacion(grupo, datos) {
  if (idRúbricaAEditar) {
    const ref = doc(db, "rubricas", grupo, "planeaciones", idRúbricaAEditar);
    await updateDoc(ref, datos);
    alert("✅ Rúbrica editada correctamente.");
    idRúbricaAEditar = null;
  } else {
    const ref = collection(db, "rubricas", grupo, "planeaciones");
    await addDoc(ref, datos);
    alert("✅ Nueva rúbrica guardada.");
  }
  document.getElementById("formulario").innerHTML = "";
}

// ---------------------------
// Envío del formulario
// ---------------------------
document.addEventListener("submit", async function (e) {
  if (!e.target.matches("#formularioRubrica")) return;
  e.preventDefault();

  const grupo = document.getElementById("grupo").value;
  const fecha = document.getElementById("fechaEvaluacion").value;
  const tipo = e.target.dataset.tipo;
  const total = parseInt(e.target.dataset.total);

  let totalPuntos = 0;
  const criteriosEvaluados = [];

  for (let i = 0; i < total; i++) {
    const nivel = document.getElementById(`nivel-${i}`).value;
    const observaciones = document.getElementById(`observaciones-${i}`)?.value || "";
    let puntos = 0;

    if (tipo === "planeaciones") {
      const max = parseFloat(document.getElementById(`nivel-${i}`).dataset.puntos);
      puntos = nivel === "Excelente" ? max : nivel === "Satisfactorio" ? max * 0.7 : max * 0.4;
    } else {
      const nombre = CRITERIOS_PROTOCOLO[i].nombre;
      puntos = CRITERIOS_PROTOCOLO[i].niveles[nivel]?.puntos || 0;
    }

    totalPuntos += puntos;
    criteriosEvaluados.push({ nombre: tipo === "protocolos" ? CRITERIOS_PROTOCOLO[i].nombre : CRITERIOS_PLANEACION[i].nombre, nivel, puntos, observaciones });
  }

  const puntuacionTotal = +totalPuntos.toFixed(1);
  let concepto = "❌ No Aprobado";
  if (puntuacionTotal >= 90) concepto = "✅ Sobresaliente";
  else if (puntuacionTotal >= 75) concepto = "✅ Notable";
  else if (puntuacionTotal >= 60) concepto = "⚠️ Aprobado con Recomendaciones";

  const datos = {
    grupo,
    fechaEvaluacion: fecha,
    puntuacionTotal,
    concepto,
    criterios: criteriosEvaluados,
    timestamp: serverTimestamp()
  };

  await guardarRubricaPlaneacion(grupo, datos);
});

// ---------------------------
// Funciones de edición
// ---------------------------
function mostrarSelectorEdicion() {
  document.getElementById("editarPlaneacion").style.display = "block";
  document.getElementById("formulario").innerHTML = "";
}

function cargarRubricasParaEditar() {
  const grupo = document.getElementById("grupoEditar").value;
  if (!grupo) return alert("Selecciona un grupo.");

  const ref = collection(db, "rubricas", grupo, "planeaciones");
  getDocs(query(ref)).then(snap => {
    const lista = document.getElementById("listaRubricas");
    lista.innerHTML = "<h4>Planeaciones encontradas:</h4>";

    if (snap.empty) {
      lista.innerHTML += "<p>No hay planeaciones para este grupo.</p>";
      return;
    }

    snap.forEach(docSnap => {
      const datos = docSnap.data();
      const fecha = new Date(datos.fechaEvaluacion).toLocaleDateString("es-ES");
      const div = document.createElement("div");
      div.innerHTML = `
        <p style="margin-bottom:10px;">
          📅 <strong>${fecha}</strong> — 
          <button onclick="editarRubrica('${grupo}', '${docSnap.id}')">✏️ Editar</button>
        </p>
      `;
      lista.appendChild(div);
    });
  });
}

function editarRubrica(grupo, rubricaId) {
  const ref = doc(db, "rubricas", grupo, "planeaciones", rubricaId);
  getDoc(ref).then(docSnap => {
    if (!docSnap.exists()) return alert("No se encontró la rúbrica.");

    const datos = docSnap.data();
    idRúbricaAEditar = rubricaId;
    document.getElementById("grupo").value = grupo;
    document.getElementById("editarPlaneacion").style.display = "none";
    document.getElementById("formulario").innerHTML = generarFormularioPlaneacion(datos.criterios);
    document.getElementById("fechaEvaluacion").value = datos.fechaEvaluacion.split("T")[0];
  });
}


// ---------------------------
// Registrar funciones globales
// ---------------------------
window.mostrarFormularioPlaneacion = mostrarFormularioPlaneacion;
window.mostrarFormularioProtocolo = mostrarFormularioProtocolo;
window.mostrarSelectorEdicion = mostrarSelectorEdicion;
window.cargarRubricasParaEditar = cargarRubricasParaEditar;
window.editarRubrica = editarRubrica;

document.addEventListener("change", function (e) {
  if (!e.target.classList.contains("nivel-select")) return;

  const selects = document.querySelectorAll(".nivel-select");
  let total = 0;

  selects.forEach((select, i) => {
    const max = parseFloat(select.dataset.puntos);
    const nivel = select.value;
    const puntos = nivel === "Excelente" ? max :
                   nivel === "Satisfactorio" ? max * 0.7 :
                   nivel === "Insuficiente" ? max * 0.4 : 0;
    total += puntos;
  });

  const totalRedondeado = +total.toFixed(1);
  document.getElementById("puntuacionTotal").value = totalRedondeado;

  let concepto = "❌ No Aprobado";
  if (totalRedondeado >= 90) concepto = "✅ Sobresaliente";
  else if (totalRedondeado >= 75) concepto = "✅ Notable";
  else if (totalRedondeado >= 60) concepto = "⚠️ Aprobado con Recomendaciones";

  document.getElementById("concepto").value = concepto;
});
