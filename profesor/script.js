import {
  db,
  collection,
  addDoc,
  serverTimestamp
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
// Descripciones automáticas para Planeaciones
// ---------------------------
const DESCRIPCIONES = {
  "Objetivos": {
    "Excelente": "Claros, medibles y alineados con resolución de problemas.",
    "Satisfactorio": "Parcialmente coherentes pero sin claridad.",
    "Insuficiente": "No hay correspondencia con el contenido, son vagos o irrelevantes."
  },
  "Justificación": {
    "Excelente": "Fundamenta con claridad la importancia y el contexto escolar.",
    "Satisfactorio": "Argumenta sin profundidad o sin contexto.",
    "Insuficiente": "No argumenta la pertinencia ni el propósito de la clase."
  },
  "Marco teórico": {
    "Excelente": "Referentes relevantes, organizados y bien citados.",
    "Satisfactorio": "Incluye referentes pero poco argumentados.",
    "Insuficiente": "Sin referentes teóricos o desorganizados."
  },
  "Descripción y recursos": {
    "Excelente": "Detalle claro de actividad y recursos pertinentes.",
    "Satisfactorio": "General pero poco clara.",
    "Insuficiente": "Descripción incompleta, sin justificar recursos."
  },
  "Funciones semióticas": {
    "Excelente": "Integración adecuada de funciones semióticas.",
    "Satisfactorio": "Descripción parcial o sin conexión.",
    "Insuficiente": "No identifica funciones semióticas."
  },
  "Metodología (Resolución de Problemas)": {
    "Excelente": "Metodología clara con resolución de problemas.",
    "Satisfactorio": "Secuencia poco clara o incompleta.",
    "Insuficiente": "Sin metodología o incoherente."
  },
  "Evaluación de la clase": {
    "Excelente": "Criterios claros y coherentes con los objetivos.",
    "Satisfactorio": "Criterios poco específicos.",
    "Insuficiente": "Sin criterios claros ni niveles definidos."
  }
};

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
  const contenedor = document.getElementById("formulario");
  contenedor.innerHTML = generarFormularioPlaneacion();
};

window.mostrarFormularioProtocolo = function () {
  const contenedor = document.getElementById("formulario");
  contenedor.innerHTML = generarFormularioProtocolo();
};

// ---------------------------
// Formularios dinámicos
// ---------------------------
function generarFormularioPlaneacion() {
  const criteriosHTML = CRITERIOS_PLANEACION.map((criterio, i) => `
    <fieldset>
      <legend><strong>${criterio.nombre}</strong></legend>
      <div class="form-group">
        <label>Nivel:</label>
        <select id="nivel-${i}" required data-puntos="${criterio.puntos}" class="nivel-select" data-nombre="${criterio.nombre}">
          <option value="">-- Selecciona --</option>
          <option value="Excelente">Excelente</option>
          <option value="Satisfactorio">Satisfactorio</option>
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

  return generarFormularioBase(criteriosHTML, "planeaciones", CRITERIOS_PLANEACION.length);
}

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

  return generarFormularioBase(criteriosHTML, "protocolos", CRITERIOS_PROTOCOLO.length);
}

function generarFormularioBase(contenido, tipo, totalCriterios) {
  return `
    <form id="formularioRubrica" data-tipo="${tipo}" data-total="${totalCriterios}">
      ${contenido}
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
// Cálculo automático
// ---------------------------
document.addEventListener("change", function (e) {
  const form = document.getElementById("formularioRubrica");
  if (!form) return;

  const tipo = form.dataset.tipo;
  const total = parseInt(form.dataset.total);
  let totalPuntos = 0;

  for (let i = 0; i < total; i++) {
    const nivelSelect = document.getElementById(`nivel-${i}`);
    if (!nivelSelect) continue;

    const nivel = nivelSelect.value;
    const nombre = nivelSelect.dataset.nombre;
    let puntos = 0;

    if (tipo === "planeaciones") {
      const max = parseFloat(nivelSelect.dataset.puntos);
      puntos = nivel === "Excelente" ? max : nivel === "Satisfactorio" ? max * 0.7 : max * 0.4;
      const descripcion = DESCRIPCIONES[nombre]?.[nivel] || "";
      const descripcionInput = document.getElementById(`descripcion-${i}`);
      if (descripcionInput) descripcionInput.value = descripcion;
    } else if (tipo === "protocolos") {
      const criterio = CRITERIOS_PROTOCOLO.find(c => c.nombre === nombre);
      puntos = criterio?.niveles[nivel]?.puntos || 0;
      const descripcion = criterio?.niveles[nivel]?.descripcion || "";
      const descripcionInput = document.getElementById(`descripcion-${i}`);
      if (descripcionInput) descripcionInput.value = descripcion;
    }

    totalPuntos += puntos;
  }

  const totalRedondeado = +totalPuntos.toFixed(1);
  document.getElementById("puntuacionTotal").value = totalRedondeado;

  let concepto = "❌ No Aprobado";
  if (tipo === "planeaciones") {
    if (totalRedondeado >= 80) concepto = "✅ Aprobado";
    else if (totalRedondeado >= 60) concepto = "⚠️ Aprobado con Recomendaciones";
  } else if (tipo === "protocolos") {
    if (totalRedondeado >= 90) concepto = "✅ Sobresaliente";
    else if (totalRedondeado >= 75) concepto = "✅ Notable";
    else if (totalRedondeado >= 60) concepto = "⚠️ Aprobado con Recomendaciones";
  }

  document.getElementById("concepto").value = concepto;
});

// ---------------------------
// Guardar formulario
// ---------------------------
document.addEventListener("submit", async function (e) {
  if (!e.target.matches("#formularioRubrica")) return;
  e.preventDefault();

  const grupo = document.getElementById("grupo").value;
  const fecha = document.getElementById("fechaEvaluacion").value;
  const tipo = e.target.dataset.tipo;
  const total = parseInt(e.target.dataset.total);

  if (!grupo || !fecha) {
    alert("Selecciona grupo y fecha.");
    return;
  }

  let totalPuntos = 0;
  const criteriosEvaluados = [];

  for (let i = 0; i < total; i++) {
    const nivel = document.getElementById(`nivel-${i}`).value;
    const observaciones = document.getElementById(`observaciones-${i}`).value;
    const descripcion = document.getElementById(`descripcion-${i}`)?.value || "";
    let puntos = 0;

    if (tipo === "planeaciones") {
      const max = parseFloat(document.getElementById(`nivel-${i}`).dataset.puntos);
      puntos = nivel === "Excelente" ? max : nivel === "Satisfactorio" ? max * 0.7 : max * 0.4;
    } else {
      const nombre = CRITERIOS_PROTOCOLO[i].nombre;
      puntos = CRITERIOS_PROTOCOLO[i].niveles[nivel]?.puntos || 0;
    }

    totalPuntos += puntos;
    criteriosEvaluados.push({
      nombre: tipo === "protocolos" ? CRITERIOS_PROTOCOLO[i].nombre : CRITERIOS_PLANEACION[i].nombre,
      nivel,
      puntos,
      descripcion,
      observaciones
    });
  }

  const puntuacionTotal = +totalPuntos.toFixed(1);
  let concepto = "❌ No Aprobado";
  if (tipo === "planeaciones") {
    if (puntuacionTotal >= 80) concepto = "✅ Aprobado";
    else if (puntuacionTotal >= 60) concepto = "⚠️ Aprobado con Recomendaciones";
  } else {
    if (puntuacionTotal >= 90) concepto = "✅ Sobresaliente";
    else if (puntuacionTotal >= 75) concepto = "✅ Notable";
    else if (puntuacionTotal >= 60) concepto = "⚠️ Aprobado con Recomendaciones";
  }

  const datos = {
    grupo,
    fechaEvaluacion: fecha,
    puntuacionTotal,
    concepto,
    criterios: criteriosEvaluados,
    timestamp: serverTimestamp()
  };

  try {
  await addDoc(collection(db, "rubricas", grupo, tipo), {
    grupo,
    fechaEvaluacion: fecha,
    puntuacionTotal,
    concepto,
    criterios: criteriosEvaluados,
    timestamp: serverTimestamp()
  });
  mostrarMensaje("✅ Rúbrica guardada correctamente", "success");
} catch (error) {
  console.error("🔥 Error al guardar la rúbrica:", error.code, error.message);
  mostrarMensaje("❌ Error al guardar la rúbrica", "error");
};

// ---------------------------
// Mostrar mensaje
// ---------------------------
function mostrarMensaje(texto, tipo) {
  const div = document.getElementById("mensaje");
  div.textContent = texto;
  div.className = `message ${tipo}`;
  setTimeout(() => {
    div.textContent = "";
    div.className = "message";
  }, 3000);
}
