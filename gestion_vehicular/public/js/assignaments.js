document.addEventListener("DOMContentLoaded", () => {
  const users = document.querySelectorAll(".usuario");
  const vehicles = document.querySelectorAll(".vehiculo");
  const assignmentArea = document.querySelector(".asignaciones-list");
  const userPreview = document.getElementById("user-preview");
  const vehiclePreview = document.getElementById("vehicle-preview");
  const previewArea = document.querySelector(".preview-area");

  let draggedUser = null;
  let draggedVehicle = null;

  users.forEach((user) => {
    user.addEventListener("dragstart", () => {
      draggedUser = user;
      user.classList.add("dragging");
      userPreview.innerHTML = `<img src="${
        user.querySelector("img").src
      }" alt="${user.querySelector("p").textContent}">
                                   <p>${
                                     user.querySelector("p").textContent
                                   }</p>`;
      previewArea.classList.add("show");
    });

    user.addEventListener("dragend", () => {
      draggedUser.classList.remove("dragging");
    });
  });

  vehicles.forEach((vehicle) => {
    vehicle.addEventListener("dragstart", () => {
      draggedVehicle = vehicle;
      vehicle.classList.add("dragging");
      vehiclePreview.innerHTML = `<img src="${
        vehicle.querySelector("img").src
      }" alt="${vehicle.querySelector("p").textContent}">
                                      <p>${
                                        vehicle.querySelector("p").textContent
                                      }</p>`;
      previewArea.classList.add("show");
    });

    vehicle.addEventListener("dragend", () => {
      draggedVehicle.classList.remove("dragging");
    });
  });

  assignmentArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    assignmentArea.classList.add("over");
  });

  assignmentArea.addEventListener("dragleave", () => {
    assignmentArea.classList.remove("over");
  });

  assignmentArea.addEventListener("drop", () => {
    if (draggedUser && draggedVehicle) {
      const userId = draggedUser.getAttribute("data-id");
      const vehicleId = draggedVehicle.getAttribute("data-id");

      fetch("/admin/asignarVehiculo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, eco_number: vehicleId }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Remover los elementos arrastrados de la lista
            draggedUser.remove();
            draggedVehicle.remove();

            // Mantener la vista previa en el área de asignación
            assignmentArea.classList.remove("over");
          }
        });
      Swal.fire(
        "Asignado",
        "El vehículo ha sido asignado al usuario.",
        "success"
      ).then(() => {
        window.location.reload();
      });
    }
  });

  // Liberar
  document.querySelectorAll(".liberar-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const idUsuario = e.target.getAttribute("data-idUsuario");

      Swal.fire({
        title: "Confirmar Liberacion",
        text: "¿Estás seguro de que deseas liberar este vehículo?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, liberar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          fetch("/admin/liberarVehiculo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: idUsuario }),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                Swal.fire("Liberado", "Liberacion correcta", "success").then(
                  () => {
                    window.location.reload();
                  }
                );
              }
            });
        }
        window.location.reload();
      });
    });
  });
});
