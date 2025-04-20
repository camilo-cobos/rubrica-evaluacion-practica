import { db, doc, setDoc } from "../firebase-setup.js";

const CRITERIOS = [
  { nombre: "Objetivos", puntos: 15 },
  { nombre: "Justificación", puntos: 10 },
  { nombre: "Marco teórico", puntos: 15 },
  { nombre: "Descripción y recursos", puntos: 20 },
  { nombre: "Funciones semióticas", puntos: 10 },
  { nombre: "Metodología (Resolución de Problemas)", puntos: 15 },
  { nombre: "Evaluación de la clase", puntos: 15 }
];

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

// Construcción dinámica del formulario
const contenedor = document.getElementById("criterios-container");

CRITERIOS.forEach((criterio, i) => {
  contenedor.innerHTML += `
    <fieldset style="margin-bottom:20px;">
      <legend><strong>${criterio.nombre}</strong></legend>
      <div class="form-group">
        <label>Nivel:</label>
        <select id="nivel-${i}" required data-index="${i}" data-nombre="${criterio.nombre}" class="nivel-select">
          <option value="">-- Selecciona --</option>
          <option value="Excelente">Excelente</option>
          <option value="Satisfactorio">Satisfactorio</option>
          <option value="Insuficiente">Insuficiente</option>
        </select>
      </div>
      <div class="form-group">
        <label>Descripción:</label>
        <input type="text" id="descripcion-${i}" required />
      </div>
      <div class="form-group">
        <label>Observaciones (opcional):</label>
        <input type="text" id="observaciones-${i}" />
      </div>
    </fieldset>
  `;
});

// Escuchar cambios en cada combo de nivel
document.querySelectorAll('.nivel-select').forEach(select => {
  select.addEventListener('change', (e) => {
    const nivel = e.target.value;
    const i = e.target.dataset.index;
    const nombre = e.target.dataset.nombre;

    const descripcionInput = document.getElementById(`descripcion-${i}`);
    if (DESCRIPCIONES[nombre] && DESCRIPCIONES[nombre][nivel]) {
      descripcionInput.value = DESCRIPCIONES[nombre][nivel];
    } else {
      descripcionInput.value = "";
    }
  });
});

document.getElementById("formularioRubrica").addEventListener("submit", async (e) => {
  e.preventDefault();

  const grupo = document.getElementById("grupo").value;
  const fecha = document.getElementById("fechaEvaluacion").value;

  let puntuacionTotal = 0;
  const criterios = CRITERIOS.map((crit, i) => {
    const nivel = document.getElementById(`nivel-${i}`).value;
    const descripcion = document.getElementById(`descripcion-${i}`).value;
    const observaciones = document.getElementById(`observaciones-${i}`).value || "";

    let factor = 0;
    if (nivel === "Excelente") factor = 1;
    else if (nivel === "Satisfactorio") factor = 0.7;
    else if (nivel === "Insuficiente") factor = 0.4;

    const puntos = +(crit.puntos * factor).toFixed(1);
    puntuacionTotal += puntos;

    return {
      nombre: crit.nombre,
      puntos,
      nivel,
      descripcion,
      observaciones
    };
  });

  puntuacionTotal = +puntuacionTotal.toFixed(1);

  let concepto = "Insuficiente";
  if (puntuacionTotal >= 90) concepto = "Sobresaliente";
  else if (puntuacionTotal >= 75) concepto = "Bueno";
  else if (puntuacionTotal >= 60) concepto = "Satisfactorio";

  const datos = {
    fechaEvaluacion: fecha,
    puntuacionTotal,
    concepto,
    criterios
  };

  try {
    await setDoc(doc(db, "rubricas", grupo), datos);
    mostrarMensaje("Rúbrica guardada exitosamente", "success");
  } catch (error) {
    console.error("Error al guardar la rúbrica:", error);
    mostrarMensaje("Error al guardar la rúbrica", "error");
  }
});

function mostrarMensaje(texto, tipo) {
  const mensaje = document.getElementById("mensaje");
  mensaje.textContent = texto;
  mensaje.className = `message ${tipo}`;
  setTimeout(() => {
    mensaje.textContent = "";
    mensaje.className = "message";
  }, 3000);
}
