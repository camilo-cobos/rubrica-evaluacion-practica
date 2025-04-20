import { db, doc, setDoc } from "../firebase-setup.js";

const criteriosPredefinidos = [
  "Claridad en la explicación",
  "Dominio del contenido",
  "Uso de recursos",
  "Participación de todos los integrantes",
  "Pertinencia del tema"
];

// Crea dinámicamente el formulario de criterios
const contenedor = document.getElementById("criterios-container");
criteriosPredefinidos.forEach((criterio, i) => {
  contenedor.innerHTML += `
    <fieldset style="margin-bottom:20px;">
      <legend><strong>${criterio}</strong></legend>
      <div class="form-group">
        <label>Puntos (0 - 25):</label>
        <input type="number" id="puntos-${i}" max="25" min="0" step="1" required />
      </div>
      <div class="form-group">
        <label>Nivel:</label>
        <select id="nivel-${i}" required>
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

document.getElementById("formularioRubrica").addEventListener("submit", async (e) => {
  e.preventDefault();

  const grupo = document.getElementById("grupo").value;
  const fecha = document.getElementById("fechaEvaluacion").value;
  const puntuacionTotal = parseFloat(document.getElementById("puntuacionTotal").value);
  const concepto = document.getElementById("concepto").value;

  const criterios = criteriosPredefinidos.map((nombre, i) => ({
    nombre,
    puntos: parseInt(document.getElementById(`puntos-${i}`).value),
    nivel: document.getElementById(`nivel-${i}`).value,
    descripcion: document.getElementById(`descripcion-${i}`).value,
    observaciones: document.getElementById(`observaciones-${i}`).value || ""
  }));

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
