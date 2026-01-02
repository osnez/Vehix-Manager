const nivel = document.getElementById("nivel");
const svgObject = document.getElementById("svgObject");


svgObject.addEventListener("load", function () {
  const svgDoc = svgObject.contentDocument;
  const indicador = svgDoc.getElementById("indicador");
  const lineas = [
    svgDoc.getElementById("linea1"),
    svgDoc.getElementById("linea2"),
    svgDoc.getElementById("linea3"),
    svgDoc.getElementById("linea4"),
    svgDoc.getElementById("linea5"),
    svgDoc.getElementById("linea6"),
    svgDoc.getElementById("linea7"),
    svgDoc.getElementById("linea8"),
    svgDoc.getElementById("linea9"),
    svgDoc.getElementById("linea10"),
    svgDoc.getElementById("linea11"),
  ];

  // Añadir la clase de animación a las líneas
  lineas.forEach((linea) => linea.classList.add("linea-nivel"));
  function actualizarNivel() {
    const porcentaje = nivel.value;
    const totalNiveles = 10;
    const nivelActual = Math.floor(porcentaje / (100 / totalNiveles));
    const translateY = (totalNiveles - nivelActual - 1) * (568 / totalNiveles);

    // Mover el indicador con animación
    indicador.setAttribute("transform", `translate(0, ${translateY})`);

    // Colorear la línea correspondiente y resetear las demás con animación
    lineas.forEach((linea, index) => {
      let color;
      if (index <= nivelActual) {
        if (nivelActual >= totalNiveles - 1) {
          color = "green"; // Lleno o casi lleno
        } else if (nivelActual >= totalNiveles * 0.65) {
          color = "lightgreen"; // Tres cuartos lleno
        } else if (nivelActual >= totalNiveles * 0.5) {
          color = "yellow"; // A la mitad
        } else if (nivelActual >= totalNiveles * 0.25) {
          color = "orange"; // Medio vacío
        } else {
          color = "red"; // Vacío o casi vacío
        }
      } else {
        color = "black"; // Reseteado
      }
      linea.setAttribute("fill", color);
    });
  }

  nivel.addEventListener("input", actualizarNivel);

  // Inicializar el nivel
  actualizarNivel();
});

document.addEventListener("DOMContentLoaded", function () {
  // Función para actualizar el estilo del clip-path para una imagen específica
  function updateTireColor(inputId, imageId) {
    var value = document.getElementById(inputId).value;
    var percentage = 100 - value;
    document.getElementById(
      imageId
    ).style.clipPath = `inset(${percentage}% 0 0 0)`;
  }

  // Crear un objeto que mapea los IDs de los inputs a los IDs de las imágenes
  var mappings = [
    { inputId: "tireStatus1", imageId: "tire-color1" },
    { inputId: "tireStatus2", imageId: "tire-color2" },
    { inputId: "tireStatus3", imageId: "tire-color3" },
    { inputId: "tireStatus4", imageId: "tire-color4" },
  ];

  // Añadir event listeners y actualizar el estilo al cargar la página
  mappings.forEach(function (mapping) {
    var inputElement = document.getElementById(mapping.inputId);
    inputElement.addEventListener("input", function () {
      updateTireColor(mapping.inputId, mapping.imageId);
    });

    // Llamar a la función para actualizar el estilo cuando se cargue la página
    updateTireColor(mapping.inputId, mapping.imageId);
  });
});
