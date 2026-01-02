const express = require("express");
const router = express.Router();

// Variables para el uso de los metodos de los controladores
const authController = require("../controllers/authController");
const assignamentsController = require("../controllers/assignamentsController");
const usersController = require("../controllers/usersController");
const itemsController = require("../controllers/itemsController");
const maintenanceController = require("../controllers/maintenanceController");
const ownersController = require("../controllers/ownersController");
const fixesController = require("../controllers/fixesController");
const infractionController = require("../controllers/infractionController");
const accidentsController = require("../controllers/accidentsController");
const documentsController = require("../controllers/documentsController");
const assuranceController = require('../controllers/assuranceController')

// Verifica si el usuario esta autenticado para hacer uso de las rutas
// y verifica los permisos para acceder
router.use(authController.isAuthenticated);
router.use(authController.authorizeRoles("ADMINISTRADOR"));

// #region =======/ VISTAS PRINCIPALES \============

router.get("/", async (req, res) => {
  try {
    const items = await itemsController.getAllItems();

    res.render("admin views/mainPage", { items });
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    res.status(500).send("Error al obtener los datos");
  }
});

router.post("/busqueda", itemsController.searchItem);

router.get("/inspeccion/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user;
    const item = await itemsController.getItemById(id);

    res.render("admin views/inspection", {
      user,
      vehicle: item.vehicle,
      detail: item.detail,
      id,
    });
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    res.status(500).send("Error al obtener los datos");
  }
});

router.get("/detalle/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const item = await itemsController.getItemById(id);
    const assign = await assignamentsController.showUserAssignedById(id);

    res.render("admin views/itemDetail", {
      vehicle: item.vehicle,
      detail: item.detail,
      assign,
    });
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    res.status(500).send("Error al obtener los datos");
  }
});

router.get("/asignaciones", assignamentsController.showAssignaments);

router.get("/asignaciones-vehiculo/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const history = await assignamentsController.showHistory(id);

    res.render("admin views/historial", { history, id });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener el historial");
  }
});

router.get("/registrar-usuario", (req, res) => {
  res.render("admin views/users/userRegistration");
});

// #endregion

// #region ======/ VISTAS MANTENIMIENTO \=========
router.get("/mantenimiento/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const maintenances = await maintenanceController.getAllMaintenance(id);

    res.render("admin views/maintenance/viewAll", { maintenances, id });
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    res.status(500).send("Error al obtener los datos");
  }
});

router.get("/registrar-mantenimiento/:id", async (req, res) => {
  try {
    const id = req.params.id;

    res.render("admin views/maintenance/maintenanceRegistration", { id });
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    res.status(500).send("Error al obtener los datos");
  }
});
// #endregion

// #region ======/ VISTAS ACCIDENTES \=========

router.get("/accidentes/:id", async (req, res) => {
  const id = req.params.id;

  const accidents = await accidentsController.showAccidents(id);

  res.render("admin views/accidents/viewAll", { accidents, id });
});

router.get("/registrar-accidente/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const assignDetail = await infractionController.showAssignInfo(id);

    // res.send(assignDetail);
    res.render("admin views/accidents/accidentRegistration", {
      id,
      assignDetail,
    });
  } catch (error) {
    res.status(500).send("ERROR AL OBTENER LOS DETALLES DE ASIGNACION");
  }
});

// #endregion

// #region ======/ VISTAS INFRACCIONES \=========

router.get("/infracciones/:id", async (req, res) => {
  const id = req.params.id;

  const infractions = await infractionController.showInfractions(id);
  res.render("admin views/infractions/viewAll", { infractions, id });
});

router.get("/registrar-infraccion/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const assignDetail = await infractionController.showAssignInfo(id);

    // res.send(assignDetail);
    res.render("admin views/infractions/infractionRegistration", {
      id,
      assignDetail,
    });
  } catch (error) {
    res.status(500).send("ERROR AL OBTENER LOS DETALLES DE ASIGNACION");
  }
});

// #endregion

// #region ======/ VISTAS REPARACIONES \=========

router.get("/reparacion/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const fixes = await fixesController.getAllFixes(id);

    // res.send(fixes);
    res.render("admin views/fixes/viewAll", { id, fixes });
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    res.status(500).send("Error al obtener los datos");
  }
});

router.get("/registrar-reparacion/:id", (req, res) => {
  try {
    const id = req.params.id;

    res.render("admin views/fixes/fixRegistration", { id });
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    res.status(500).send("Error al obtener los datos");
  }
});

// #endregion

// #region ======/ VISTAS PROPIETARIOS \=========

router.get("/propietarios", async (req, res) => {
  try {
    const owners = await ownersController.getAllOwners();

    res.render("admin views/owners/ownerList", { owners });
  } catch (error) {}
});

router.get("/registrar-propietario", (req, res) => {
  res.render("admin views/owners/ownerRegistration");
});

router.get("/actualizar-propietario/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const item = await ownersController.getOwnerById(id);

    res.render("admin views/owners/updateOwner", { item });
  } catch (error) {}
});

// #endregion

// #region ========/ VISTAS VEHICULOS \===========
router.get("/registrar-vehiculo", async (req, res) => {
  try {
    const propertaries = await ownersController.getAllOwners();

    res.render("admin views/vehicles/vehicleRegistration", { propertaries });
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    res.status(500).send("Error al obtener los datos");
  }
});

router.get("/actualizar-vehiculo/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user;
    const propertaries = await ownersController.getAllOwners();
    const item = await itemsController.getItemById(id);

    res.render("admin views/vehicles/updateVehicle", {
      propertaries,
      vehicle: item.vehicle,
      user,
    });
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    res.status(500).send("Error al obtener los datos");
  }
});

// #endregion

// #region ======/ VISTAS DOCUMENTOS \=========

router.get("/documentos/:id", documentsController.showAllDocs);

// #endregion

// #region ======/ VISTAS SEGUROS \=========

router.get("/seguro/:id", assuranceController.showAllDocs);

// #endregion

//RUTAS PARA METODOS DE CONTROL

// Accidente
router.post("/registrarAccidente", accidentsController.registerAccident);

// Infraccion
router.post("/registrarInfraccion", infractionController.registerInfraction);

// Mantenimiento
router.post("/registrarMantenimiento", maintenanceController.register);

// Reparacion
router.post("/registrarReparacion", fixesController.register);

// #region Propietario
router.post(
  "/registrarPropietario",
  ownersController.upload.single("image"),
  ownersController.register
);

router.post("/actualizarInfoPropietario", ownersController.updateInformation);

router.post(
  "/actualizarFotoPropietario/:id",
  ownersController.upload.single("image"),
  ownersController.updateImage
);

router.get("/eliminarPropietario/:id", ownersController.delete);

// #endregion

// Usuario
router.post(
  "/registrarUsuario",
  usersController.upload.single("image"),
  usersController.register
);

// #region Vehiculo
router.post(
  "/registrarVehiculo",
  itemsController.upload.single("image"),
  itemsController.register
);

router.post("/actualizarInfoVehiculo", itemsController.updateInfo);

router.post(
  "/actualizarFotoVehiculo/:id",
  itemsController.upload.single("image"),
  itemsController.updateImage
);

router.get("/eliminarVehiculo/:id", itemsController.delete);

// #endregion

//Asignaciones de vehiculos a usuarios

router.post("/asignarVehiculo", assignamentsController.assign);
router.post("/liberarVehiculo", assignamentsController.release);

// Auditoria
router.post("/auditar/:id", itemsController.audit);

//Documentos
router.post(
  "/:id/subirDoc",
  documentsController.upload.single("file"),
  (req, res) => {
    res.redirect(`/admin/documentos/${req.params.id}`);
  }
);
router.delete("/:vehicleId/delete/:filename", documentsController.delete);

//Seguros
router.post(
  "/:id/subirSeguro",
  assuranceController.upload.single("file"),
  (req, res) => {
    res.redirect(`/admin/seguro/${req.params.id}`);
  }
);
router.delete("/:vehicleId/deleteSeg/:filename", assuranceController.delete);


module.exports = router;
