const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const usersController = require("../controllers/usersController");

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/error", (req, res) => {
  res.render("error");
});

router.get(
  "/mi-perfil",
  authController.isAuthenticated,
  usersController.getUserProfile
);

// RUTAS DE METODOS DE CONTROL

// Manejo de login y logout
router.post("/login", authController.login);
router.get("/logout", authController.logout);

// Actualizar informacion de perfil
router.post("/actualizarInfo", usersController.updateInformation);

router.post("/actualizarContrasena", usersController.updatePassword);

router.post(
  "/actualizarFoto",
  usersController.upload.single("image"),
  usersController.updateImage
);

module.exports = router;
