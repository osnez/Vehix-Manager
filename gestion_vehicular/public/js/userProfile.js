//Para la preview de la imagen

document.getElementById("file").onchange = (e) => {
  let reader = new FileReader();
  reader.readAsDataURL(e.target.files[0]);
  reader.onload = () => {
    let preview = document.getElementById("preview");
    preview.src = reader.result;
  };
};

// Función para abrir un modal
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = "block";
}

// Función para cerrar un modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = "none";
}

// Event listeners para abrir modales
document.getElementById("open-modal1").onclick = function () {
  openModal("modal1");
};

document.getElementById("open-modal2").onclick = function () {
  openModal("modal2");
};

document.getElementById("open-modal3").onclick = function () {
  openModal("modal3");
};

// Event listeners para cerrar modales
const closeButtons = document.getElementsByClassName("close");
for (let i = 0; i < closeButtons.length; i++) {
  closeButtons[i].onclick = function () {
    const modalId = this.getAttribute("data-modal");
    closeModal(modalId);
  };
}

// Cerrar el modal si el usuario hace clic fuera del contenido del modal
window.onclick = function (event) {
  if (event.target.classList.contains("modal")) {
    closeModal(event.target.id);
  }
};
