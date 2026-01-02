document.addEventListener("DOMContentLoaded", function () {
  // Modal
  var modal = document.getElementById("uploadModal");
  var openModalBtn = document.querySelector('[data-toggle="modal"]');
  var closeModalBtn = document.querySelector(".close");


  if (openModalBtn) {
    openModalBtn.addEventListener("click", function () {
      modal.style.display = "block";
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", function () {
      modal.style.display = "none";
    });
  }

  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
});

function openFile(filename, vehicleId) {
  // const fileUr = `uploads/docs/${vehicleId}/${filename}`;
  const fileUrl = `/uploads/docs/${vehicleId}/${encodeURIComponent(filename)}`;
  window.open(fileUrl, '_blank');
}

function deleteFile(filename, vehicleId) {

  fetch("/admin/"+ vehicleId +"/delete/" + filename, { method: "DELETE" }).then(
    (response) => {
      if (response.ok) {
        location.reload();
      } else {
        alert("Error al eliminar el archivo.");
      }
    }
  );
}

document.getElementById('uploadForm').addEventListener('submit', function(event) {
  const fileInput = document.getElementById('file');
  const file = fileInput.files[0];
  const errorMessage = document.getElementById('error-message');

  // Verificar tipo de archivo
  if (file && file.type !== 'application/pdf') {
      errorMessage.textContent = 'Solo se permiten archivos PDF.';
      event.preventDefault();
      return;
  }

  // Verificar tamaño del archivo (10 MB = 10 * 1024 * 1024 bytes)
  if (file && file.size > 10 * 1024 * 1024) {
      errorMessage.textContent = 'El archivo debe ser menor de 10 MB.';
      event.preventDefault();
      return;
  }

  errorMessage.textContent = ''; // Limpiar mensaje de error
});