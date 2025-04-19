const grupos = [
  ["Grupo1", "Paula y Julieth"],
  ["Grupo2", "Estefania y Thalia"],
  ["Grupo3", "María José y Santiago"],
  ["Grupo4", "Jhon Jairo y William"],
  ["Grupo5", "Jeidy y Stip"],
  ["Grupo6", "Daniel y Nataly"],
  ["Grupo7", "Laura y Iris"],
  ["Grupo8", "Ana y Andrés"],
  ["Grupo9", "Carlos"],
  ["Grupo10", "Nicole y Jean Paul"]
];

const CRITERIOS = [
  { nombre: "Objetivos", puntos: 15 },
  { nombre: "Justificación", puntos: 10 },
  { nombre: "Marco teórico", puntos: 15 },
  { nombre: "Descripción y recursos", puntos: 20 },
  { nombre: "Funciones semióticas", puntos: 10 },
  { nombre: "Metodología (Resolución de Problemas)", puntos: 15 },
  { nombre: "Evaluación de la clase", puntos: 15 }
];

const NIVELES = ["Excelente", "Satisfactorio", "Insuficiente"];
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

document.addEventListener("DOMContentLoaded", () => {
  grupos.forEach(([grupo, integrantes], idx) => {
    const tabBtn = document.createElement("button");
    tabBtn.innerText = grupo.replace("Grupo", "Grupo ");
    tabBtn.className = "tab-btn";
    tabBtn.onclick = () => cargarRubrica(grupo, integrantes);
    document.getElementById("tabs").appendChild(tabBtn);

    if (idx === 0) {
      cargarRubrica(grupo, integrantes);
    }
  });
});

function cargarRubrica(grupo, integrantes) {
  const datosGuardados = localStorage.getItem(`rubrica-${grupo}`);
  const datos = datosGuardados ? JSON.parse(datosGuardados) : {
    criterios: CRITERIOS.map(c => ({
      ...c,
      nivel: "",
      descripcion: "",
      observaciones: ""
    })),
    puntuacionTotal: 0,
    concepto: "",
    fechaEvaluacion: new Date().toISOString()
  };

  const html = `
    <div class="edicion-rubrica">
      <h3>${grupo.replace("Grupo", "Grupo ")} - ${integrantes}</h3>
      
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
          ${datos.criterios.map((criterio, i) => `
            <tr>
              <td>${criterio.nombre}</td>
              <td>${criterio.puntos}</td>
              <td>
                <select id="${grupo}-nivel-${i}" onchange="actualizarDescripcion('${grupo}', ${i})">
                  <option value="">Seleccionar</option>
                  ${NIVELES.map(n => `
                    <option value="${n}" ${criterio.nivel === n ? 'selected' : ''}>${n}</option>
                  `).join('')}
                </select>
              </td>
              <td id="${grupo}-desc-${i}">${criterio.descripcion}</td>
              <td>
                <textarea id="${grupo}-obs-${i}">${criterio.observaciones || ''}</textarea>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="resultado-final">
        <p><strong>Puntuación total:</strong> ${datos.puntuacionTotal.toFixed(1)} / 100</p>
        <p><strong>Resultado:</strong> ${datos.concepto}</p>
      </div>
      
      <button class="guardar-btn" onclick="guardarRubrica('${grupo}')">
        💾 Guardar Rúbrica
      </button>
    </div>
  `;

  document.getElementById("contenedor").innerHTML = html;
}

function actualizarDescripcion(grupo, index) {
  const select = document.getElementById(`${grupo}-nivel-${index}`);
  const nivel = select.value;
  const criterio = CRITERIOS[index].nombre;
  
  if (nivel && DESCRIPCIONES[criterio] && DESCRIPCIONES[criterio][nivel]) {
    document.getElementById(`${grupo}-desc-${index}`).textContent = DESCRIPCIONES[criterio][nivel];
  }
}

// Reemplaza la función guardarRubrica completa por esta versión corregida:
function guardarRubrica(grupo) {
  const datos = {
    criterios: [],
    puntuacionTotal: 0,
    concepto: "",
    fechaEvaluacion: new Date().toISOString()
  };
  
  let total = 0;
  const ponderaciones = { 
  "Excelente": 1,    // Cambiado de 0.9 a 1
  "Satisfactorio": 0.7, 
  "Insuficiente": 0.4 
};

  // Calcular puntuación para cada criterio
  CRITERIOS.forEach((criterio, i) => {
    const select = document.getElementById(`${grupo}-nivel-${i}`);
    const nivel = select ? select.value : "";
    const observaciones = document.getElementById(`${grupo}-obs-${i}`).value;
    const descripcion = DESCRIPCIONES[criterio.nombre]?.[nivel] || "";

    // Guardar datos del criterio
    datos.criterios.push({
      nombre: criterio.nombre,
      puntos: criterio.puntos,
      nivel: nivel,
      descripcion: descripcion,
      observaciones: observaciones
    });

    // Calcular aporte al total
    if (nivel && ponderaciones[nivel]) {
      total += ponderaciones[nivel] * criterio.puntos;
    }
  });

  // Asignar resultados finales
  datos.puntuacionTotal = total;
  datos.concepto = total < 60 ? "❌ No Aprobado" : 
                   total < 80 ? "⚠️ Aprobado con Recomendaciones" : 
                   "✅ Aprobado";

  // Guardar en localStorage
  localStorage.setItem(`rubrica-${grupo}`, JSON.stringify(datos));

  // Actualizar la visualización inmediatamente
  const integrantes = grupos.find(g => g[0] === grupo)[1];
  cargarRubrica(grupo, integrantes);

  // Mostrar notificación de éxito
  const notification = document.createElement('div');
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = '#27ae60';
  notification.style.color = 'white';
  notification.style.padding = '15px';
  notification.style.borderRadius = '5px';
  notification.style.zIndex = '1000';
  notification.textContent = `✅ Rúbrica guardada para ${grupo}`;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}
